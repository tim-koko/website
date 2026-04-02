---
title: "Kafka OAuth 2 Authentifizierung mit Strimzi und Keycloak"
slug: "strimzi-kafka-oauth-keycloak-authentication"
description: ""
date: 2026-03-31T00:00:00+00:00
lastmod: 2026-03-31T00:00:00+00:00
draft: false
images: ["images/blog/kafka-strimzi-v1/tk-blogpost-strimzi-v1-share-image.jpg"]
Sitemap:
  Priority: 0.92

categories: ["Technology", "Apache Kafka", "Messaging", "Strimzi"]
authors: ['christof-luethi']
additionalblogposts: [ 'strimzi-kafka-0.49.0-api-v1', "kafka-4", 'kafka-zookeeper-kraft-migration' ]

post_img: "images/blog/kafka-strimzi-v1/tk-blogpost-strimzi-v1.jpg"
img_border: true
lead: "In Multi-Tenant Kafka-Umgebungen reichen statische Passwörter für die Verwaltung von Credentials und Identitäten nicht mehr aus. Dieser erste Teil unserer zweiteiligen Serie behandelt die Einrichtung von OAuth 2 Authentifizierung auf einem Strimzi-verwalteten Kafka-Cluster mit Keycloak - von der Broker-Listener-Konfiguration über die Provisionierung von Tenant-Clients bis zur Verifizierung der Token-basierten Authentifizierung."
---

In modernen Event-Driven Architekturen fungiert Apache Kafka oft als zentrales Nervensystem, das mehrere Teams,
Services und sogar Organisationen verbindet. Mit zunehmender Kafka-Nutzung wächst auch der Bedarf an einer robusten,
zentralisierten Lösung für Identity- und Access-Management.

Diese zweiteilige Serie zeigt die Konfiguration eines Strimzi-verwalteten Kafka-Clusters mit OAuth 2 Authentifizierung
und Keycloak-basierter Autorisierung - ein produktionsreifer Ansatz für Multi-Tenant Kafka-Security auf Kubernetes.

- **Teil 1 (dieser Beitrag):** OAuth Authentifizierung - Konfiguration des Brokers, Provisionierung von Keycloak-Clients und Verifizierung des Token-basierten Zugriffs.
- **Teil 2:** Keycloak Autorisierung - feingranulare, ressourcenbasierte Berechtigungen mittels Authorization Services.

### Warum OAuth mit Strimzi und Keycloak?

Traditionelle Kafka-Authentifizierungsmechanismen wie SASL/PLAIN oder SASL/SCRAM erfordern die direkte Verwaltung von
Credentials innerhalb des Kafka-Ökosystems. Bei wachsender Nutzung wird dies schnell unübersichtlich, insbesondere in
Multi-Tenant-Umgebungen. Die Kombination von Strimzi, Keycloak und OAuth 2 bietet mehrere Vorteile:

- **Zentralisiertes Identity-Management:** Keycloak bietet eine einzige Quelle der Wahrheit für alle Client-Identitäten,
  Secrets und Zugriffsrichtlinien. Durch die Integration mit LDAP oder Active Directory Federation lassen sich
  Organisationsstrukturen direkt auf Kafka-Zugriffskontrollen abbilden.
- **Tokenbasierte Sicherheit:** Kurzlebige JWT-Tokens ersetzen langlebige statische Credentials. Tokens werden lokal
  auf dem Broker mittels JWKS validiert, wodurch Anfragen pro Request an Keycloak entfallen und die Latenz tief bleibt.
- **Multi-Tenant-Isolation:** Präfix-basierte Ressourcenmuster (z.B. `Topic:timkoko-*`) in Kombination mit
  gruppenbasierten Richtlinien stellen sicher, dass Tenants nur auf ihre eigenen Daten zugreifen können.
- **Feingranulare Autorisierung:** Keycloak Authorization Services ermöglichen die Definition von Berechtigungen auf
  Ressourcen- und Scope-Ebene - so lässt sich genau steuern, welche Clients lesen, schreiben oder bestimmte Topics
  und Consumer Groups verwalten dürfen. Dies wird in Teil 2 behandelt.

{{< svg "assets/images/blog/strimzi-kafka/strimzi-kafka-oauth2-keycloak-authn.svg" >}}

### Keycloak-Konzepte im Überblick

Bevor wir in die Konfiguration einsteigen, hier ein kurzer Überblick über die relevanten Keycloak-Konzepte für die
Authentifizierung:

- **Realm:** Ein isolierter Namespace für die Verwaltung von Benutzern, Clients und Richtlinien. Wir erstellen einen
  dedizierten `kafka`-Realm, um die Kafka-bezogene Konfiguration von anderen Anwendungen auf derselben
  Keycloak-Instanz zu trennen.
- **Client (Service Account):** Repräsentiert eine Kafka-Anwendung. Jeder Tenant und der Broker selbst erhält einen
  eigenen Client mit `client_id` und `client_secret`, unter Verwendung des `client_credentials` Grant-Typs. Clients
  werden mit `serviceAccountsEnabled: true` konfiguriert, da keine interaktiven Benutzer-Logins involviert sind.
- **Audience Mapper:** Ein Protocol Mapper, der sicherstellt, dass der `aud`-Claim im JWT `kafka-broker` enthält.
  Damit können die Broker verifizieren, dass das Token für Kafka ausgestellt wurde und nicht für einen anderen Service.
- **Groups:** Organisieren Service Accounts in logische Einheiten. Jeder Tenant erhält eine übergeordnete Gruppe mit
  `reader`- und `writer`-Untergruppen. Diese werden in Teil 2 für die Autorisierung relevant.
- **Authorization Services:** Nur auf dem `kafka-broker`-Client aktiviert. Stellt Ressourcen, Scopes, Richtlinien und
  Berechtigungen bereit - wird in Teil 2 im Detail behandelt.

### Voraussetzungen

Dieser Guide setzt Folgendes voraus:

- Ein Kubernetes-Cluster mit installiertem Strimzi Operator (v0.49.0+)
- Ein Kafka-Cluster im KRaft-Modus verwaltet durch Strimzi (API-Version `kafka.strimzi.io/v1`)
- Eine Keycloak-Instanz, die innerhalb des Clusters läuft und erreichbar ist (z.B. `http://keycloak-service.keycloak.svc.cluster.local:8080`)
- Ein Keycloak-Realm namens `kafka` wurde bereits erstellt

### Benutzer

Die folgenden Benutzer werden in diesem Setup konfiguriert:

{{< csvtable "responsive" "," >}}
Benutzer,Kafka User,Passwort / Secret,Beschreibung
Kafka Broker,kafka-broker,kafka-broker-secret,Kafka Broker Client (Authorization Services)
Kafka Admin,kafka-admin,kafka-admin-secret,Kafka Admin (Superuser)
Organisation A,timkoko,timkoko-secret,Beispiel-Tenant A (timkoko)
Organisation B,acmecorp,acmecorp-secret,Beispiel-Tenant B (acme corp.)
Organisation C,umbrellacorp,umbrellacorp-secret,Beispiel-Tenant C (umbrella corp.)
{{< /csvtable >}}

### Topics

Die folgenden Topics werden zum Testen erstellt:

{{< csvtable "responsive" "," >}}
Topic,Tenant / Org,Beschreibung
timkoko-topic-demo-v0,timkoko,Topic zugänglich für timkoko-Benutzer
acmecorp-topic-demo-v0,acmecorp,Topic zugänglich für acmecorp-Benutzer
umbrellacorp-topic-demo-v0,umbrellacorp,Topic zugänglich für umbrellacorp-Benutzer
{{< /csvtable >}}

## Kafka-Cluster-Konfiguration

### Listener und Authentifizierung

Die Strimzi-Kafka-Ressource unterstützt mehrere Listener, die jeweils eine eigene Authentifizierungsmethode haben
können. Wir konfigurieren drei Listener: einen TLS-Listener ohne Client-Authentifizierung, einen Mutual-TLS-Listener
und einen OAuth-Listener.

{{< svg "assets/images/blog/strimzi-kafka/strimzi-kafka-oauth2-keycloak-listeners.svg" >}}

> In Strimzi 0.52.0 werden die dedizierten Authentifizierungstypen `oauth` und `keycloak` entfernt. OAuth wird neu
> mittels `type: custom` mit SASL und den entsprechenden Callback-Handlern konfiguriert. Siehe den
> [Strimzi-Proposal](https://github.com/strimzi/proposals/blob/main/112-deprecate-and-remove-oauth-authentication-and-authorization.md)
> für Details.

Eine Cluster-Konfiguration mit mehreren Listenern und unterschiedlichen Authentifizierungsmethoden sieht wie folgt aus:

```yaml
apiVersion: kafka.strimzi.io/v1
kind: Kafka
metadata:
  name: my-kafka-cluster
spec:
  kafka:
    config:
      # Erforderlich für OAuth-Authentifizierung und Keycloak-Autorisierung
      principal.builder.class: io.strimzi.kafka.oauth.server.OAuthKafkaPrincipalBuilder
    listeners:
      - name: plain
        port: 9092
        tls: true
        type: internal
      - name: tls
        authentication:
          type: tls
        port: 9093
        tls: true
        type: internal
      - name: oauth
        port: 9094
        tls: true
        type: internal
        authentication:
          type: custom
          sasl: true
          listenerConfig:
            connections.max.reauth.ms: 3600000
            sasl.enabled.mechanisms: OAUTHBEARER
            principal.builder.class: io.strimzi.kafka.oauth.server.OAuthKafkaPrincipalBuilder
            oauthbearer.sasl.server.callback.handler.class: io.strimzi.kafka.oauth.server.JaasServerOauthValidatorCallbackHandler
            oauthbearer.sasl.jaas.config: |
              org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required \
                oauth.valid.issuer.uri="http://keycloak-service.keycloak.svc.cluster.local:8080/realms/kafka" \
                oauth.jwks.endpoint.uri="http://keycloak-service.keycloak.svc.cluster.local:8080/realms/kafka/protocol/openid-connect/certs" \
                oauth.client.id="kafka-broker" \
                oauth.client.secret="${secrets:my-namespace/broker-oauth-secret:secret}" \
                unsecuredLoginStringClaim_sub="unused" \
                oauth.username.claim="preferred_username" \
                oauth.check.issuer="true" \
                oauth.check.audience="true" \
                oauth.http.retries="2" \
                oauth.http.retry.pause.millis="300" \
                oauth.connect.timeout.seconds="10" \
                oauth.read.timeout.seconds="15" \
                oauth.jwks.refresh.seconds="300" \
                oauth.jwks.expiry.seconds="360" \
                oauth.enable.metrics="true" \
                oauth.jwks.min.refresh.pause.seconds="1";
    authorization:
      # Autorisierungskonfiguration wird in Teil 2 behandelt
      ...
```

Wichtige Konfigurationsentscheide:

**Schnelle lokale JWT-Validierung:** Der Broker validiert Tokens lokal mittels JWKS-Endpoint (`oauth.jwks.endpoint.uri`),
anstatt für jede Anfrage den Introspection-Endpoint von Keycloak aufzurufen. Dies verbessert die Performance und
reduziert Netzwerk-Aufrufe. Allerdings wird dabei auf kurzlebige Tokens gesetzt, und zurückgezogene Tokens werden nicht
erkannt - der Broker prüft nur, ob das Token vom Issuer signiert wurde, nicht ob es widerrufen wurde. Dies wird
teilweise durch kurzlebige Tokens (konfiguriert auf 600 Sekunden in Keycloak) abgemildert. Die sicherste Methode wäre
der `introspect`-Endpoint, der jedoch bei jeder Token-Validierung eine Verbindung zu Keycloak erfordert.

**Audience-Check:** `oauth.check.audience="true"` stellt sicher, dass der `aud`-Claim des Tokens `kafka-broker`
enthält. Damit wird verhindert, dass Tokens akzeptiert werden, die für andere Services ausgestellt wurden.

**Secret-Referenz:** Das Broker-Client-Secret wird als Kubernetes Secret gespeichert und über Strimzis
`KubernetesSecretConfigProvider`-Syntax referenziert: `${secrets:NAMESPACE/SECRET_NAME:KEY}`.

**Inter-Broker-Kommunikation:** Gemäss Strimzi wird für die Inter-Broker-Kommunikation am besten mTLS verwendet. Dies
ist die Standardkonfiguration und erfordert keine Änderung. Siehe die
[Strimzi-Dokumentation](https://github.com/strimzi/strimzi-kafka-oauth?tab=readme-ov-file#configuring-the-client-side-of-inter-broker-communication)
für Details.

### Broker OAuth Secret und RBAC

Der Broker benötigt Zugriff auf sein OAuth-Client-Secret, das als Kubernetes Secret gespeichert ist:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: broker-oauth-secret
type: Opaque
data:
  secret: a2Fma2EtYnJva2VyLXNlY3JldA==  # base64-kodiertes Client-Secret
```

Damit die Kafka-Pods dieses Secret lesen können, werden zusätzlich eine `Role` und ein `RoleBinding` benötigt. Stelle sicher, dass die Pods das Secret lesen dürfen.

### Tenant-Topics erstellen

Die Tenant-Topics werden mittels Strimzis `KafkaTopic` Custom Resource definiert. Jedes Topic folgt der
Namenskonvention `<tenant>-topic-demo-v0`:

```yaml
apiVersion: kafka.strimzi.io/v1
kind: KafkaTopic
metadata:
  name: timkoko-topic-demo-v0
  labels:
    strimzi.io/cluster: my-kafka-cluster
spec:
  partitions: 3
  replicas: 3
  config:
    min.insync.replicas: 2
    retention.ms: 3600000
---
apiVersion: kafka.strimzi.io/v1
kind: KafkaTopic
metadata:
  name: acmecorp-topic-demo-v0
  labels:
    strimzi.io/cluster: my-kafka-cluster
spec:
  partitions: 3
  replicas: 3
  config:
    min.insync.replicas: 2
    retention.ms: 3600000
---
apiVersion: kafka.strimzi.io/v1
kind: KafkaTopic
metadata:
  name: umbrellacorp-topic-demo-v0
  labels:
    strimzi.io/cluster: my-kafka-cluster
spec:
  partitions: 3
  replicas: 3
  config:
    min.insync.replicas: 2
    retention.ms: 3600000
```

Da die Autorisierungsressourcen Präfix-Matching verwenden (`Topic:timkoko-*`), wird jedes Topic, das mit dem
Tenant-Namen beginnt, automatisch von den entsprechenden Berechtigungen abgedeckt.

## Keycloak User-Setup

Die gesamte Keycloak-Konfiguration erfolgt im `kafka`-Realm über die Keycloak Admin REST API.

> **Port-Forwarding für lokalen Zugriff:** Falls Keycloak innerhalb des Kubernetes-Clusters läuft und von aussen nicht erreichbar ist, kann mittels Port-Forwarding
> auf die Admin-API von der lokalen Maschine zugegriffen werden:
>
> ```shell
> kubectl port-forward -n keycloak svc/keycloak-service 8080:8080
> ```
>
> Damit ist Keycloak unter `http://localhost:8080` erreichbar. Alle `curl`-Befehle in diesem Guide verwenden diese
> lokale Adresse. Passe die URL an, falls deine Keycloak-Instanz anders exponiert ist.

### Admin-Token beziehen

Alle API-Aufrufe benötigen einen Keycloak-Admin-Token:

```shell
KEYCLOAK_URL="http://localhost:8080"
REALM="kafka"

TOKEN=$(curl -s \
  -d "client_id=admin-cli" \
  -d "username=admin" \
  -d "password=blog-demo" \
  -d "grant_type=password" \
  "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  | jq -r .access_token)
```

### Broker-Client erstellen

Der `kafka-broker`-Client wird von den Kafka-Brokern verwendet. Er hat Authorization Services aktiviert (wird in
Teil 2 verwendet):

```shell
curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "kafka-broker",
    "name": "kafka-broker",
    "description": "technical client for kafka-broker",
    "protocol": "openid-connect",
    "publicClient": false,
    "bearerOnly": false,
    "directAccessGrantsEnabled": false,
    "serviceAccountsEnabled": true,
    "standardFlowEnabled": false,
    "authorizationServicesEnabled": true,
    "clientAuthenticatorType": "client-secret",
    "secret": "kafka-broker-secret",
    "attributes": {
      "access.token.lifespan": "600"
    },
    "defaultClientScopes": ["openid", "profile"],
    "optionalClientScopes": [],
    "protocolMappers": []
  }'
```

Die Einstellung `authorizationServicesEnabled: true` aktiviert die Keycloak Authorization Services auf diesem Client.
Dies ist eine Voraussetzung für das Autorisierungs-Setup in Teil 2.

### Tenant-Clients erstellen

Jeder Tenant erhält einen Service-Account-Client. Diese Clients haben keine Authorization Services aktiviert - es
sind reguläre OAuth-Clients, die sich mittels `client_credentials` authentifizieren:

```shell
for tenant in timkoko acmecorp umbrellacorp; do
  curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "'${tenant}'",
      "name": "'${tenant}'",
      "description": "technical client for '${tenant}'",
      "protocol": "openid-connect",
      "publicClient": false,
      "bearerOnly": false,
      "directAccessGrantsEnabled": false,
      "serviceAccountsEnabled": true,
      "standardFlowEnabled": false,
      "authorizationServicesEnabled": false,
      "clientAuthenticatorType": "client-secret",
      "secret": "'${tenant}'-secret",
      "attributes": {
        "access.token.lifespan": "600"
      },
      "defaultClientScopes": ["openid", "profile"],
      "optionalClientScopes": [],
      "protocolMappers": []
    }'
done
```

Ansicht der angelegten Clients:

{{< custom-image "../images/kafka-strimzi/strimzi-kafka-oauth-keycloak-clients.png" "960" >}}

### Audience Mapper hinzufügen

Jeder Client benötigt einen Audience Mapper, damit das ausgestellte JWT `aud: kafka-broker` enthält. Dies ist
erforderlich, weil der Broker mit `oauth.check.audience="true"` konfiguriert ist und prüft, ob das Token explizit
für Kafka ausgestellt wurde.

Um die Audience-Prüfung zu ermöglichen, fügen wir für jeden Client einen Audience Mapper hinzu. Dieser ergänzt das
Feld `aud: kafka-broker` im Token:

```shell
CLIENTS=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${KEYCLOAK_URL}/admin/realms/${REALM}/clients")

for client_id in kafka-broker timkoko acmecorp umbrellacorp; do
  CLIENT_UUID=$(echo ${CLIENTS} | jq -r ".[] | select(.clientId==\"${client_id}\") | .id")

  curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}/protocol-mappers/models" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "kafka-audience",
      "protocol": "openid-connect",
      "protocolMapper": "oidc-audience-mapper",
      "consentRequired": false,
      "config": {
        "included.client.audience": "kafka-broker",
        "id.token.claim": "true",
        "access.token.claim": "true"
      }
    }'
done
```

### Gruppen erstellen und Service Accounts zuweisen

Zur Demo erstellen wir für jeden Tenant eine übergeordnete Gruppe mit `reader`- und `writer`-Untergruppen. Der Service Account des
Tenants wird beiden Untergruppen zugewiesen. Separate Reader- und Writer-Gruppen ermöglichen es, bei Bedarf gezielt
nur Lesezugriff zu vergeben, beispielsweise für Debugging-Zwecke in einer Entwicklungsumgebung.

```shell
for tenant in timkoko acmecorp umbrellacorp; do
  # Übergeordnete Gruppe erstellen
  curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/groups" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"${tenant}\"}"

  PARENT_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/groups?search=${tenant}" \
    | jq -r '.[0].id')

  # Reader- und Writer-Untergruppen erstellen
  for subgroup in "${tenant}-reader" "${tenant}-writer"; do
    curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${PARENT_ID}/children" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"${subgroup}\"}"
  done

  # Service Account beiden Gruppen zuweisen
  CLIENT_UUID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
    | jq -r ".[] | select(.clientId==\"${tenant}\") | .id")

  SA_UUID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}/service-account-user" \
    | jq -r '.id')

  for subgroup in "${tenant}-reader" "${tenant}-writer"; do
    GROUP_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
      "${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${PARENT_ID}/children?search=${subgroup}" \
      | jq -r '.[0].id')

    curl -s -X PUT \
      -H "Authorization: Bearer ${TOKEN}" \
      "${KEYCLOAK_URL}/admin/realms/${REALM}/users/${SA_UUID}/groups/${GROUP_ID}"
  done
done
```

Die resultierende Gruppenstruktur sieht wie folgt aus:

- timkoko
  - timkoko-reader
  - timkoko-writer
- acmecorp
  - acmecorp-reader
  - acmecorp-writer
- umbrellacorp
  - umbrellacorp-reader
  - umbrellacorp-writer

{{< custom-image "../images/kafka-strimzi/strimzi-kafka-oauth-keycloak-groups.png" "960" >}}

## Authentifizierung verifizieren

Mit dem konfigurierten Broker und den Keycloak-Clients können wir nun prüfen, ob die OAuth-Authentifizierung
funktioniert, indem wir ein Token beziehen und untersuchen.

### Token beziehen und untersuchen

Ein `client_credentials`-Token für den `timkoko`-Client beziehen:

```shell
ACCESS_TOKEN=$(curl -s "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -d "client_id=timkoko" \
  -d "client_secret=timkoko-secret" \
  -d "grant_type=client_credentials" \
  | jq -r .access_token)

echo ${ACCESS_TOKEN}
```

Token-Payload dekodieren und untersuchen:

```shell
echo ${ACCESS_TOKEN} | jq -R 'split(".") | .[1] | @base64d | fromjson'
```

Das dekodierte Token sollte (unter anderem) folgende Felder enthalten:

```json
{
  "iss": "http://keycloak-service.keycloak.svc.cluster.local:8080/realms/kafka",
  "sub": "...",
  "aud": "kafka-broker",
  "typ": "Bearer",
  "preferred_username": "service-account-timkoko",
  "azp": "timkoko",
  "scope": "openid profile",
  "client_id": "timkoko",
  "iat": 1234567290,
  "exp": 1234567890
}
```

Folgendes sollte überprüft werden:

- `aud` enthält `kafka-broker` - der Audience Mapper funktioniert
- `preferred_username` ist gesetzt - der Broker verwendet dies als Kafka-Principal über `oauth.username.claim`
- `exp` liegt ungefähr 600 Sekunden in der Zukunft - die Token-Lebensdauer ist korrekt konfiguriert

### Authentifizierung von einem Kafka-CLI-Pod testen

Um die End-to-End-Authentifizierung gegen den Kafka-Cluster zu testen, verwenden wir einen CLI-Pod innerhalb des
Kubernetes-Clusters.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka-cli
  labels:
    app: kafka-cli
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kafka-cli
  template:
    metadata:
      labels:
        app: kafka-cli
    spec:
      containers:
        - name: kafka
          env:
          - name: KAFKA_OPTS
            value: -Dorg.apache.kafka.sasl.oauthbearer.allowed.urls=http://keycloak-service.keycloak.svc.cluster.local:8080/realms/kafka/protocol/openid-connect/token
          - name: TRUSTSTORE_PASSWORD
            valueFrom:
              secretKeyRef:
                key: ca.password
                name: my-kafka-cluster-cluster-ca-cert
          image: quay.io/strimzi/kafka:0.49.0-kafka-4.1.1
          command:
            - tail
            - -f
            - /dev/null
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          volumeMounts:
          - mountPath: /certs/truststore.p12
            name: cluster-cert
            subPath: ca.p12
      volumes:
      - name: cluster-cert
        secret:
          defaultMode: 420
          secretName: my-kafka-cluster-cluster-ca-cert
```

Das folgende Beispiel verwendet den Apache Kafka `OAuthBearerLoginCallbackHandler`:

```shell
# Innerhalb des CLI Pods mit Kafka-CLI-Tools und Zugriff auf das Cluster-CA-Zertifikat
cat > /tmp/client.properties <<EOF
bootstrap.servers=my-kafka-cluster-kafka-bootstrap:9094
security.protocol=SASL_SSL
sasl.mechanism=OAUTHBEARER
sasl.jaas.config=org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required;
sasl.login.callback.handler.class=org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginCallbackHandler
sasl.oauthbearer.client.credentials.client.id=timkoko
sasl.oauthbearer.client.credentials.client.secret=timkoko-secret
sasl.oauthbearer.token.endpoint.url=http://keycloak-service.keycloak.svc.cluster.local:8080/realms/kafka/protocol/openid-connect/token
ssl.truststore.type=PKCS12
ssl.truststore.location=/certs/truststore.p12
ssl.truststore.password=${TRUSTSTORE_PASSWORD}
EOF

# Topics auflisten - sollte erfolgreich authentifizieren
./bin/kafka-topics.sh --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 --command-config /tmp/client.properties --list
```

Bei erfolgreicher Authentifizierung verbindet sich der Befehl mit dem Broker und gibt die Liste der Topics zurück.
Falls das Token oder die Audience ungültig ist, wird eine `SaslAuthenticationException` angezeigt.

Alternativ mit dem Strimzi `JaasClientOauthLoginCallbackHandler`:

```shell
# Innerhalb des CLI Pods mit Kafka-CLI-Tools und Zugriff auf das Cluster-CA-Zertifikat
cat > /tmp/client-strimzi.properties <<EOF
bootstrap.servers=my-kafka-cluster-kafka-bootstrap:9094
security.protocol=SASL_SSL
sasl.mechanism=OAUTHBEARER
sasl.jaas.config=org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required \
  oauth.token.endpoint.uri="http://keycloak-service.keycloak.svc.cluster.local:8080/realms/kafka/protocol/openid-connect/token";
sasl.login.callback.handler.class=io.strimzi.kafka.oauth.client.JaasClientOauthLoginCallbackHandler
ssl.truststore.type=PKCS12
ssl.truststore.location=/certs/truststore.p12
ssl.truststore.password=${TRUSTSTORE_PASSWORD}
EOF

# Credentials über Umgebungsvariablen setzen
export OAUTH_CLIENT_ID=timkoko
export OAUTH_CLIENT_SECRET=timkoko-secret

# Topics auflisten - sollte erfolgreich authentifizieren
./bin/kafka-topics.sh --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 --command-config /tmp/client-strimzi.properties --list
```

> Der Strimzi `JaasClientOauthLoginCallbackHandler` bietet verbessertes Logging, Metriken, erweitertes Caching und
> Retries für die Token-Verarbeitung. Er ist in einem Kubernetes-Setup einfacher zu verwenden, da er die Konfiguration
> über Umgebungsvariablen unterstützt. Allerdings benötigt er die `strimzi-kafka-oauth-client`-Library, die
> möglicherweise nicht in allen Umgebungen verfügbar ist. Der Apache Kafka `OAuthBearerLoginCallbackHandler` ist seit
> Kafka 2.8 produktionsreif und in allen Kafka-Distributionen verfügbar.

## Wie weiter?

Zu diesem Zeitpunkt können sich alle Tenant-Clients mittels OAuth-Tokens von Keycloak gegen den Kafka-Cluster
authentifizieren. Allerdings sind noch keine Autorisierungsregeln vorhanden - jeder authentifizierte Client kann auf
jedes Topic zugreifen.

In **Teil 2** konfigurieren wir den `KeycloakAuthorizer` auf dem Kafka-Broker und richten die Keycloak Authorization
Services mit Scopes, Ressourcen, Richtlinien und Berechtigungen ein, um feingranulare, Multi-Tenant-Zugriffskontrollen
durchzusetzen.

## Brauchst du Hilfe oder Beratung?

Brauchst du Hilfe bei der Einrichtung von OAuth-Authentifizierung für deinen Kafka-Cluster oder hast du allgemeine
Fragen zu Apache Kafka? Zögere nicht, uns zu kontaktieren.
