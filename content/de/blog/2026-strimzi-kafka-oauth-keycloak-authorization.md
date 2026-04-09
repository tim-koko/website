---
title: "Kafka OAuth 2 Autorisierung mit Strimzi und Keycloak - Teil 2"
slug: "kafka-oauth-strimzi-keycloak-authorization"
description: ""
date: 2026-03-30T01:00:00+00:00
lastmod: 2026-03-30T01:00:00+00:00
draft: false
images: ["images/blog/kafka-strimzi-v1/tk-blogpost-strimzi-v1-share-image.jpg"]
img_border: true
Sitemap:
  Priority: 0.92

categories: ["Technology", "Apache Kafka", "Messaging", "Strimzi"]
authors: ['christof-luethi']
additionalblogposts: [ 'strimzi-kafka-oauth-keycloak-authentication', 'kafka-oauth-strimzi-keycloak-authentication', 'kafka-zookeeper-kraft-migration']

post_img: "images/blog/kafka-strimzi-v1/tk-blogpost-strimzi-v1.jpg"
lead: "Mit OAuth-Authentifizierung im Einsatz ist der nächste Schritt die Durchsetzung feingranularer Zugriffskontrollen. In diesem zweiten Teil konfigurieren wir den KeycloakAuthorizer auf dem Kafka-Broker und richten die Keycloak Authorization Services ein - Scopes, Ressourcen, Richtlinien und Berechtigungen - um Multi-Tenant Topic-Isolation zu erreichen."
---

In [Teil 1 Authentifizierung](https://tim-koko.ch/blog/strimzi-kafka-oauth-keycloak-authentication/) haben wir einen Strimzi-verwalteten Kafka-Cluster
mit OAuth 2 Authentifizierung mittels Keycloak konfiguriert, Tenant-Clients (timkoko, acmecorp, umbrellacorp) provisioniert
und verifiziert, dass die Token-basierte Authentifizierung funktioniert. Zu diesem Zeitpunkt kann jeder authentifizierte
Client noch auf jedes Topic zugreifen.

Dieser zweite Teil behandelt die Autorisierungsseite: die Konfiguration des `KeycloakAuthorizer` auf dem Kafka-Broker und
die Einrichtung von Keycloaks Authorization Services, um sicherzustellen, dass jeder Tenant nur auf seine eigenen Topics
und Consumer Groups zugreifen kann.

{{< svg "assets/images/blog/kafka-strimzi/strimzi-kafka-oauth2-keycloak-authz-services.svg" >}}

### Keycloak-Autorisierungskonzepte

Die Keycloak Authorization Services stellen vier Bausteine bereit, die zusammenspielen:

- **Authorization Scopes:** Aktionen, die auf einer Ressource verfügbar sind. Für Kafka bilden diese die Kafka-Operationen
  ab: `Create`, `Write`, `Read`, `Delete`, `Describe`, `Alter`, `DescribeConfigs`, `AlterConfigs`, `ClusterAction`,
  `IdempotentWrite`.
- **Resources:** Definieren, was wir vor unbefugtem Zugriff schützen. Jede Ressource verwendet das Muster
  `RESOURCE_TYPE:NAME_PATTERN` (z.B. `Topic:timkoko-*`, `Group:acmecorp-*`). Präfix-Matching mit `*` reduziert die
  Anzahl benötigter Ressourcendefinitionen erheblich. Ressourcen enthalten eine Liste von Authorization Scopes, die
  definieren, welche Operationen möglich sind.
- **Policies:** Definieren, welche Benutzergruppen wir mit Berechtigungen ansprechen wollen. Wir verwenden
  gruppenbasierte Richtlinien, die Berechtigungen an Keycloak-Gruppen wie `timkoko-reader` oder `acmecorp-writer` binden.
  Ein weiteres gängiges Muster ist die Verwendung von rollenbasierten Richtlinien.
- **Permissions:** Verbinden spezifische Ressourcen, Aktions-Scopes und Richtlinien miteinander, um zu definieren, dass
  _bestimmte Benutzer U bestimmte Aktionen A auf Ressource R ausführen können_.

Der Zusammenhang fliesst wie folgt: **Clients** gehören zu **Groups**, die von **Policies** angesprochen werden, die an
**Permissions** gebunden sind, welche **Scopes** auf **Resources** gewähren.

### Kafka Security Model

Das Kafka Security Model kennt die folgenden Aktionen (Scopes) auf den verschiedenen Ressourcentypen:

{{< csvtable "responsive" ";" >}}
Ressourcentyp;Verfügbare Scopes
Topic;Write, Read, Describe, Create, Delete, DescribeConfigs, AlterConfigs, IdempotentWrite
Group;Read, Describe, Delete
Cluster;Create, Describe, Alter, DescribeConfigs, AlterConfigs, IdempotentWrite, ClusterAction
TransactionalId;Describe, Write
DelegationToken;Describe
{{< /csvtable >}}

## Kafka-Broker Autorisierungskonfiguration

Der `KeycloakAuthorizer` delegiert Autorisierungsentscheide an die Keycloak Authorization Services. Füge folgendes zur
Kafka-Ressource hinzu:

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
      # Keycloak-Autorisierungseigenschaften
      # Property Source: https://github.com/strimzi/strimzi-kafka-oauth/blob/main/oauth-keycloak-authorizer/src/main/java/io/strimzi/kafka/oauth/server/authorizer/KeycloakRBACAuthorizer.java
      strimzi.authorization.delegate.to.kafka.acl: "true"
      strimzi.authorization.client.id: kafka-broker
      strimzi.authorization.token.endpoint.uri: http://keycloak-service.keycloak.svc.cluster.local:8080/realms/kafka/protocol/openid-connect/token
      strimzi.authorization.grants.refresh.period.seconds: 60
      strimzi.authorization.grants.refresh.pool.size: 5
      strimzi.authorization.reuse.grants: true
      strimzi.authorization.grants.max.idle.time.seconds: 300
      strimzi.authorization.grants.gc.period.seconds: 300
      strimzi.authorization.http.retries: 2
      strimzi.authorization.connect.timeout.seconds: 10
      strimzi.authorization.read.timeout.seconds: 15
      strimzi.authorization.enable.metrics: true
    authorization:
      type: custom
      authorizerClass: io.strimzi.kafka.oauth.server.authorizer.KeycloakAuthorizer
      superUsers:
        - CN=my-superuser
        - service-account-kafka-admin
        - service-account-kafka-broker
    listeners:
      # ... (wie in Teil 1 konfiguriert)
```

### Wichtige Autorisierungseigenschaften

{{< csvtable "responsive" ";" >}}
Property;Wert;Beschreibung
strimzi.authorization.delegate.to.kafka.acl;true;Wenn der KeycloakAuthorizer eine Anfrage ablehnt, wird die Entscheidung an das integrierte Kafka-ACL-System delegiert. Dies ermöglicht die Koexistenz von OAuth-Benutzern mit TLS/ACL-Benutzern auf demselben Cluster.
strimzi.authorization.client.id;kafka-broker;Der Keycloak-Client, den der Broker für Autorisierungsabfragen verwendet.
strimzi.authorization.token.endpoint.uri;-;Der Keycloak-Token-Endpoint zum Abrufen von Authorization Grants.
strimzi.authorization.grants.refresh.period.seconds;60;Wie oft der Broker die Grants aktiver Sessions aktualisiert.
strimzi.authorization.reuse.grants;true;Zwischengespeicherte Grants für bestehende Sessions wiederverwenden, anstatt neue abzurufen.
strimzi.authorization.grants.max.idle.time.seconds;300;Inaktive Grants werden nach dieser Zeit aus dem Cache entfernt.
strimzi.authorization.enable.metrics;true;Metriken für das Monitoring der Autorisierungs-Performance aktivieren.
{{< /csvtable >}}

### SuperUsers

Superuser umgehen alle Autorisierungsprüfungen und haben vollen Zugriff auf den Cluster:

```yaml
authorization:
  type: custom
  authorizerClass: io.strimzi.kafka.oauth.server.authorizer.KeycloakAuthorizer
  superUsers:
    - CN=my-superuser              # mTLS-basierter Superuser
    - service-account-kafka-admin  # OAuth-basierter Superuser
    - service-account-kafka-broker # Broker Service Account
```

> Es wird empfohlen, mindestens einen Superuser zu haben, der nicht von Keycloak abhängig ist (z.B. einen
> TLS-authentifizierten Benutzer wie `CN=my-superuser`). Dies stellt den Cluster-Zugriff auch dann sicher, wenn
> Keycloak nicht verfügbar ist.

### ACL-Delegation

Der `KeycloakAuthorizer` unterstützt die Delegation von `DENIED`-Anfragen der Keycloak-Autorisierung an das
zugrundeliegende ACL-System. Dies setzt voraus, dass ACLs definiert wurden, entweder über die `KafkaUser` CR von
Strimzi oder eine andere Methode. Dies wird nur im KRaft-Modus unterstützt und ist ein Feature des Keycloak
Authorizers, nicht von Kafka selbst.

Beispiel eines Broker-Logs mit ACL-Delegation:

```text
Authorization GRANTED by ACL - non-oauth user: User:CN=tk, operation: DESCRIBE, resource: TOPIC:timkoko-topic-demo-v0
```

### Autorisierungs-Logging

Für das Debugging von Autorisierungsproblemen kann das Logging des Brokers angepasst werden:

```yaml
spec:
  kafka:
    logging:
      type: inline
      loggers:
        logger.authorizer.level: DEBUG
        logger.oauth.name: io.strimzi.kafka.oauth
        logger.oauth.level: DEBUG
```

## Keycloak-Autorisierung einrichten

Die gesamte Keycloak-Konfiguration erfolgt über die Admin REST API. Stelle sicher, dass du einen gültigen Admin-Token
hast, wie in Teil 1 beschrieben.

> **Port-Forwarding für lokalen Zugriff:** Falls Keycloak innerhalb des Kubernetes-Clusters läuft und von aussen nicht erreichbar ist, kann mittels Port-Forwarding
> auf die Admin-API von der lokalen Maschine zugegriffen werden:
>
> ```shell
> kubectl port-forward -n keycloak svc/keycloak-service 8080:8080
> ```
>
> Damit ist Keycloak unter `http://localhost:8080` erreichbar. Alle `curl`-Befehle in diesem Guide verwenden diese
> lokale Adresse.

```shell
KEYCLOAK_URL="http://localhost:8080"
REALM="kafka"

TOKEN=$(curl -s \
  -d "client_id=admin-cli" \
  -d "username=admin" \
  -d "password=keycloak" \
  -d "grant_type=password" \
  "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  | jq -r .access_token)

BROKER_UUID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
  | jq -r '.[] | select(.clientId=="kafka-broker") | .id')
```

### Authorization Services konfigurieren

Die Authorization Services des Broker-Clients mit Enforcing-Modus konfigurieren:

```shell
curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "allowRemoteResourceManagement": true,
    "policyEnforcementMode": "ENFORCING",
    "decisionStrategy": "AFFIRMATIVE"
  }'
```

- **Policy Enforcement Mode `ENFORCING`:** Anfragen werden standardmässig abgelehnt, auch wenn keine Policy mit einer
  bestimmten Ressource verknüpft ist.
- **Decision Strategy `AFFIRMATIVE`:** Mindestens eine Berechtigung muss positiv entscheiden, damit Zugriff gewährt
  wird.

In der Praxis bedeutet dies: Keycloak setzt die Autorisierung strikt durch, Zugriff wird standardmässig verweigert,
sofern nicht eine Berechtigung ihn explizit gewährt. Wenn mehrere Richtlinien gelten, reicht eine einzige, die Zugriff
erlaubt, aus.

Es wird zudem empfohlen, die `Default Resource` und `Default Policy` zu löschen, die Keycloak automatisch erstellt,
wenn Authorization Services aktiviert werden:

```shell
# Default Resource löschen
RESOURCE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/resource" \
  | jq -r '.[] | select(.name=="Default Resource") | ._id')

curl -s -X DELETE \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/resource/${RESOURCE_ID}" \
  -H "Authorization: Bearer $TOKEN"

# Default Policy löschen
POLICY_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/policy" \
  | jq -r '.[] | select(.name=="Default Policy") | .id')

curl -s -X DELETE \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/policy/${POLICY_ID}" \
  -H "Authorization: Bearer $TOKEN"
```

### Authorization Scopes erstellen

Die Kafka-Operations-Scopes auf den Authorization Services des Brokers erstellen. Diese Scopes leiten sich aus dem
Kafka Security Model ab:

```shell
for scope in Create Write Read Delete Describe Alter \
             DescribeConfigs AlterConfigs ClusterAction IdempotentWrite All; do
  curl -s -X POST \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/scope" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name":"'${scope}'","displayName":"'${scope}' kafka operation"}'
done
```

### Ressourcen erstellen

Ressourcen definieren, was wir schützen. Das allgemeine Muster ist `RESOURCE_TYPE:NAME_PATTERN`. Durch Präfix-Matching
mit `*` wird die Anzahl benötigter Ressourcen stark reduziert.

Für jeden Tenant erstellen wir eine `Topic`- und `Group`-Ressource. Die auf einer Ressource definierten Scopes geben
an, welche Operationen auf dieser Ressource **möglich** sind - sie bedeuten nicht, dass der Zugriff automatisch gewährt
wird.

```shell
for tenant in timkoko acmecorp umbrellacorp; do
  # Topic-Ressource mit Topic-Scopes
  curl -s -X POST \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/resource" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Topic:'${tenant}'-*",
      "displayName": "Topic:'${tenant}'-*",
      "uris": ["Topic:'${tenant}'-*"],
      "scopes": [
        {"name":"Write"},{"name":"Read"},{"name":"Describe"},{"name":"Create"},
        {"name":"Delete"},{"name":"DescribeConfigs"},{"name":"AlterConfigs"},
        {"name":"Alter"},{"name":"IdempotentWrite"}
      ],
      "ownerManagedAccess": false
    }'

  # Consumer-Group-Ressource mit Group-Scopes
  curl -s -X POST \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/resource" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Group:'${tenant}'-*",
      "displayName": "Group:'${tenant}'-*",
      "uris": ["Group:'${tenant}'-*"],
      "scopes": [{"name":"Read"},{"name":"Describe"},{"name":"Delete"}],
      "ownerManagedAccess": false
    }'
done
```

### Richtlinien erstellen

Die Verknüpfung einer Berechtigung mit einer Keycloak-Gruppe erfolgt über eine Policy vom Typ `group`. Die Richtlinien
verwenden `logic=POSITIVE` (das resultierende Ergebnis wird direkt übernommen) und `decisionStrategy=UNANIMOUS` (alle
enthaltenen Richtlinien müssen positiv entscheiden). Wenn eine Richtlinie ablehnt, wird der Zugriff verweigert.

```shell
for tenant in timkoko acmecorp umbrellacorp; do
  TENANT_UUID=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/groups?search=${tenant}" \
    | jq -r '.[0].id')

  for role in reader writer; do
    GROUP_UUID=$(curl -s -H "Authorization: Bearer $TOKEN" \
      "${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${TENANT_UUID}/children?search=${tenant}-${role}" \
      | jq -r '.[0].id')

    curl -s -X POST \
      "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/policy/group" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "name": "'${tenant}'-'${role}'-policy",
        "description": "Policy granting access to group '${tenant}'-'${role}'",
        "type": "group",
        "logic": "POSITIVE",
        "decisionStrategy": "UNANIMOUS",
        "groups": [
          {"id": "'${GROUP_UUID}'", "extendChildren": false}
        ]
      }'
  done
done
```

{{< custom-image "../images/kafka-strimzi/strimzi-kafka-oauth-keycloak-authorization-policies.png" "960" >}}

### Berechtigungen erstellen

Das letzte Puzzlestück verbindet alles miteinander. Berechtigungen verknüpfen eine Ressource mit definierten Scopes
und einer Gruppenrichtlinie. Je nach effektivem Client müssen mehrere Berechtigungen erstellt werden.

{{< custom-image "../images/kafka-strimzi/strimzi-kafka-oauth-keycloak-authorization-permissions.png" "960" >}}

Für jeden Tenant erstellen wir drei Berechtigungen:

1. **Topics lesen** - erlaubt das Lesen von `Topic:<tenant>-*` über die Reader-Richtlinie
2. **Consumer Group** - erlaubt die Verwendung von Consumer Groups `Group:<tenant>-*` über die Reader-Richtlinie
3. **Topics schreiben** - erlaubt das Schreiben auf `Topic:<tenant>-*` über die Writer-Richtlinie

```shell
for tenant in timkoko acmecorp umbrellacorp; do
  # 1. Leseberechtigung auf Topics
  curl -s -X POST \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/permission/scope" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "'${tenant}'-read-topics",
      "description": "Allow '${tenant}' to read from topics '${tenant}'-* with policy '${tenant}'-reader-policy",
      "resources": ["Topic:'${tenant}'-*"],
      "scopes": ["Read","Describe"],
      "policies": ["'${tenant}'-reader-policy"],
      "decisionStrategy": "AFFIRMATIVE"
    }'

  # 2. Consumer-Group-Berechtigung
  curl -s -X POST \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/permission/scope" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "'${tenant}'-consumer-group",
      "description": "Allow '${tenant}' to use consumer-group Group:'${tenant}'-* with policy '${tenant}'-reader-policy",
      "resources": ["Group:'${tenant}'-*"],
      "scopes": ["Read","Describe"],
      "policies": ["'${tenant}'-reader-policy"],
      "decisionStrategy": "AFFIRMATIVE"
    }'

  # 3. Schreibberechtigung auf Topics
  curl -s -X POST \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/permission/scope" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "'${tenant}'-write-topics",
      "description": "Allow '${tenant}' to write to topics '${tenant}'-* with policy '${tenant}'-writer-policy",
      "resources": ["Topic:'${tenant}'-*"],
      "scopes": ["Write","Describe"],
      "policies": ["'${tenant}'-writer-policy"],
      "decisionStrategy": "AFFIRMATIVE"
    }'
done
```

Dies stellt sicher, dass Mitglieder der Reader-Gruppe Lesezugriff auf die Consumer Group und die Topics erhalten.
Die Writer-Gruppe ermöglicht den Schreibzugriff auf die Topics.

{{< custom-image "../images/kafka-strimzi/strimzi-kafka-oauth-keycloak-authorization-permission-details.png" "960" >}}

## Autorisierung verifizieren

Mit vollständig konfigurierter Authentifizierung und Autorisierung können wir nun überprüfen, ob die Multi-Tenant-Isolation
korrekt funktioniert.

{{< svg "assets/images/blog/kafka-strimzi/strimzi-kafka-oauth2-keycloak-authz.svg" >}}

### Authorization Token untersuchen

Einen Authorization Token (UMA Grant) beziehen und die gewährten Berechtigungen untersuchen:

```shell
KEYCLOAK_URL="http://localhost:8080"
REALM="kafka"

AUTH_TOKEN=$(curl -s "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -d "client_id=timkoko" \
  -d "client_secret=timkoko-secret" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket" \
  -d "audience=kafka-broker" \
  | jq -r .access_token)

echo $AUTH_TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson'
```

Der `authorization`-Abschnitt im dekodierten Token sollte die gewährten Berechtigungen enthalten:

```json
{
  "authorization": {
    "permissions": [
      {
        "rsname": "Topic:timkoko-*",
        "scopes": ["Read", "Write", "Describe"]
      },
      {
        "rsname": "Group:timkoko-*",
        "scopes": ["Read", "Describe"]
      }
    ]
  }
}
```

Beachte, dass nur `timkoko-*`-Ressourcen vorhanden sind - es gibt keinen Zugriff auf `acmecorp-*`- oder
`umbrellacorp-*`-Ressourcen.

### Autorisierung von einem Kafka-CLI-Pod testen

Im CLI Pod aus dem [Teil 1 Authentifizierung](https://tim-koko.ch/de/blog/strimzi-kafka-oauth-keycloak-authentication/) erstellen wir die Client-Konfiguration um gegen den Kafka-Cluster zu testen:

```shell
# Innerhalb eines Pods mit Kafka-CLI-Tools
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
```

**Topics auflisten** - sollte nur das eigene Tenant-Topic anzeigen:

```shell
./bin/kafka-topics.sh --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 --command-config /tmp/client.properties --list
```

Erwartete Ausgabe:

```text
timkoko-topic-demo-v0
```

**In eigenes Topic produzieren** - sollte erfolgreich sein:

```shell
echo "hello from timkoko" | ./bin/kafka-console-producer.sh \
  --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 \
  --producer.config /tmp/client.properties \
  --producer-property enable.idempotence=false \
  --topic timkoko-topic-demo-v0
```

**Vom eigenen Topic konsumieren** - sollte erfolgreich sein:

```shell
./bin/kafka-console-consumer.sh \
  --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 \
  --consumer.config /tmp/client.properties \
  --topic timkoko-topic-demo-v0 \
  --group timkoko-consumer-group-1 \
  --from-beginning --max-messages 1
```

**In ein Topic eines anderen Tenants produzieren** - sollte verweigert werden:

```shell
echo "hello" | ./bin/kafka-console-producer.sh  \
  --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 \
  --producer.config /tmp/client.properties \
  --producer-property enable.idempotence=false \
  --topic acmecorp-topic-demo-v0
```

Erwarteter Fehler:

```text
ERROR [Producer clientId=console-producer] Topic authorization failed for topics [acmecorp-topic-demo-v0]
org.apache.kafka.common.errors.TopicAuthorizationException: Not authorized to access topics: [acmecorp-topic-demo-v0]
```

**Von einem Topic eines anderen Tenants konsumieren** - sollte verweigert werden:

```shell
./bin/kafka-console-consumer.sh \
  --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 \
  --consumer.config /tmp/client.properties \
  --topic umbrellacorp-topic-demo-v0 \
  --group timkoko-sneaky-group \
  --from-beginning --max-messages 1
```

## Zusammenfassung

Die Kombination von Strimzi, Keycloak und OAuth 2 bietet einen skalierbaren, zentralisierten Ansatz für Kafka-Security:

1. **Strimzi Operator** verwaltet den Kafka-Cluster und seine Listener deklarativ über Kubernetes CRDs.
2. **Keycloak** übernimmt das Identity-Management, die Token-Ausstellung und die Autorisierungsrichtlinien zentral.
3. **OAuth 2 mit OAUTHBEARER** ersetzt statische Credentials durch kurzlebige, kryptografisch signierte JWTs.
4. **KeycloakAuthorizer** setzt feingranulare, ressourcenbasierte Berechtigungen durch, mit Delegation an Kafka-ACLs
   für Nicht-OAuth-Benutzer.
5. **Multi-Tenancy** wird durch präfix-basierte Ressourcenmuster, gruppenbasierte Richtlinien und die `<tenant>-*`
   Namenskonvention erreicht.

Das Onboarding neuer Tenants erfordert lediglich: einen Keycloak-Client erstellen, ihn den entsprechenden Gruppen
zuweisen und die zugehörigen Autorisierungsressourcen, Richtlinien und Berechtigungen anlegen - ohne die
Kafka-Cluster-Konfiguration selbst zu ändern.

## Brauchst du Hilfe oder Beratung?

Brauchst du Hilfe bei der Einrichtung von OAuth-Autorisierung für deinen Kafka-Cluster oder hast du allgemeine
Fragen zu Apache Kafka? Zögere nicht, uns zu kontaktieren.
