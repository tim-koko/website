---
title: "Kafka OAuth 2 Authentication with Strimzi and Keycloak - Part 1"
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
lead: "In multi-tenant Kafka environments, managing credentials and identities at scale requires more than static passwords. This first part of our two-part series covers setting up OAuth 2 authentication on a Strimzi-managed Kafka cluster using Keycloak - from broker listener configuration to provisioning tenant clients and verifying token-based authentication."
---

In modern event-driven architectures, Apache Kafka often serves as the central nervous system connecting multiple
teams, services, and even organizations. As Kafka adoption grows, so does the need for a robust, centralized identity
and access management solution.

This two-part series walks through configuring a Strimzi-managed Kafka cluster with OAuth 2 authentication and
Keycloak-based authorization - a production-grade approach to multi-tenant Kafka security on Kubernetes.

- **Part 1 (this post):** OAuth authentication - configuring the broker, provisioning Keycloak clients, and verifying token-based access.
- **Part 2:** Keycloak authorization - fine-grained, resource-level permissions using Authorization Services.

### Why OAuth with Strimzi and Keycloak?

Traditional Kafka authentication mechanisms like SASL/PLAIN or SASL/SCRAM require managing credentials directly within
the Kafka ecosystem. This becomes cumbersome at scale, especially in multi-tenant environments. Combining Strimzi,
Keycloak, and OAuth 2 offers several advantages:

- **Centralized identity management:** Keycloak provides a single source of truth for all client identities, secrets,
  and access policies. When integrated with LDAP or Active Directory federation, organizational structures map directly
  to Kafka access controls.
- **Token-based security:** Short-lived JWT tokens replace long-lived static credentials. Tokens are validated locally
  on the broker using JWKS, eliminating per-request calls to Keycloak and keeping latency low.
- **Multi-tenant isolation:** Prefix-based resource patterns (e.g., `Topic:timkoko-*`) combined with group-based
  policies ensure tenants can only access their own data.
- **Fine-grained authorization:** Keycloak Authorization Services allow defining permissions at the resource and scope
  level - controlling exactly which clients can read, write, or manage specific topics and consumer groups. This is
  covered in Part 2.

{{< svg "assets/images/blog/strimzi-kafka/strimzi-kafka-oauth2-keycloak-authn.svg" >}}

### Key Keycloak Concepts

Before we go into the configuration details, here is a brief overview of the Keycloak concepts relevant for authentication:

- **Realm:** An isolated namespace for managing users, clients, and policies. We create a dedicated `kafka` realm to
  keep Kafka-related configuration separate from other applications sharing the same Keycloak instance.
- **Client (Service Account):** Represents a Kafka application. Each tenant and the broker itself gets its own client
  with a `client_id` and `client_secret`, using the `client_credentials` grant type. Clients are configured with
  `serviceAccountsEnabled: true` as there are no interactive user logins involved.
- **Audience Mapper:** A protocol mapper ensuring the `aud` claim in the JWT includes `kafka-broker`, so brokers can
  verify the token was issued for Kafka and not for another service.
- **Groups:** Organize service accounts into logical units. Each tenant gets a parent group with `reader` and `writer`
  subgroups. These become relevant in Part 2 for authorization.
- **Authorization Services:** Enabled only on the `kafka-broker` client, providing resources, scopes, policies, and
  permissions - covered in detail in Part 2.

### Prerequisites

This guide assumes:

- A Kubernetes cluster with the Strimzi Operator (v0.49.0+) installed
- A Kafka cluster running in KRaft mode managed by Strimzi (API version `kafka.strimzi.io/v1`)
- A Keycloak instance running and accessible within the cluster (e.g., `http://keycloak-service.keycloak.svc.cluster.local:8080`)
- A Keycloak realm named `kafka` already created

### Users

The following users are configured in this setup:

{{< csvtable "responsive" "," >}}
User,Kafka User,Password / Secret,Description
Kafka Broker,kafka-broker,kafka-broker-secret,Kafka Broker Client (Authorization Services)
Kafka Admin,kafka-admin,kafka-admin-secret,Kafka Admin (superuser)
Organization A,timkoko,timkoko-secret,Sample Tenant A (timkoko)
Organization B,acmecorp,acmecorp-secret,Sample Tenant B (acme corp.)
Organization C,umbrellacorp,umbrellacorp-secret,Sample Tenant C (umbrella corp.)
{{< /csvtable >}}

### Topics

The following topics are created for testing:

{{< csvtable "responsive" "," >}}
Topic,Tenant / Org,Description
timkoko-topic-demo-v0,timkoko,Topic accessible by timkoko user
acmecorp-topic-demo-v0,acmecorp,Topic accessible by acmecorp user
umbrellacorp-topic-demo-v0,umbrellacorp,Topic accessible by umbrellacorp user
{{< /csvtable >}}

## Kafka Cluster Configuration

### Listener and Authentication

The Strimzi Kafka resource supports multiple listeners, each with its own authentication method. We configure three
listeners: a plain TLS listener, a mutual TLS listener, and an OAuth listener.

{{< svg "assets/images/blog/strimzi-kafka/strimzi-kafka-oauth2-keycloak-listeners.svg" >}}

> In Strimzi 0.52.0, the dedicated `oauth` and `keycloak` authentication types will be removed. OAuth is now
> configured using `type: custom` with SASL and the appropriate callback handlers. See the
> [Strimzi proposal](https://github.com/strimzi/proposals/blob/main/112-deprecate-and-remove-oauth-authentication-and-authorization.md)
> for details.

A cluster configuration with multiple listeners and different authentication methods looks like this:

```yaml
apiVersion: kafka.strimzi.io/v1
kind: Kafka
metadata:
  name: my-kafka-cluster
spec:
  kafka:
    config:
      # Required for OAuth authentication and Keycloak authorization
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
      # Authorization configuration is covered in Part 2
      ...
```

Key configuration choices:

**Fast local JWT validation:** The broker validates tokens locally using the JWKS endpoint (`oauth.jwks.endpoint.uri`)
instead of calling Keycloak's introspection endpoint for every request. This enhances performance and reduces network
calls. However, it relies on short-lived tokens and does not handle revoked tokens - the broker validates that the token
is signed by the issuer but does not check if it has been revoked. This is partially mitigated with short-lived tokens
(configured to 600 seconds in Keycloak). The most secure method would be the `introspect` endpoint but this
requires connecting to Keycloak for every token validation.

**Audience check:** `oauth.check.audience="true"` ensures the token's `aud` claim contains `kafka-broker`, preventing
tokens issued for other services from being accepted.

**Secret reference:** The broker client secret is stored as a Kubernetes Secret and referenced using Strimzis
`KubernetesSecretConfigProvider` syntax: `${secrets:NAMESPACE/SECRET_NAME:KEY}`.

**Inter-broker communication:** According to Strimzi it is best to use mTLS for inter-broker communication. This is
the default and does not require any change. See the
[Strimzi documentation](https://github.com/strimzi/strimzi-kafka-oauth?tab=readme-ov-file#configuring-the-client-side-of-inter-broker-communication)
for details.

### Broker OAuth Secret and RBAC

The broker needs access to its OAuth client secret stored as a Kubernetes Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: broker-oauth-secret
type: Opaque
data:
  secret: a2Fma2EtYnJva2VyLXNlY3JldA==  # base64 encoded client secret
```

For the Kafka pods to read this secret, an additional `Role` and `RoleBinding` is required. Make sure you allow the pods to read the secret.

### Create Tenant Topics

Define the tenant topics using Strimzis `KafkaTopic` custom resource. Each topic follows the naming convention
`<tenant>-topic-demo-v0`:

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

Because the authorization resources use prefix matching (`Topic:timkoko-*`), any topic starting with the tenant name
is automatically covered by the respective permissions.

## Keycloak User Setup

All Keycloak configuration is done in the `kafka` realm via the Keycloak Admin REST API.

> **Port-forwarding for local access:** If Keycloak is running inside the Kubernetes cluster and not accessible from outside, use port-forwarding to
> access the admin API from your local machine:
>
> ```shell
> kubectl port-forward -n keycloak svc/keycloak-service 8080:8080
> ```
>
> This makes Keycloak available at `http://localhost:8080`. All `curl` commands in this guide target this local
> address. Adjust the URL if your Keycloak instance is exposed differently.

### Obtain Admin Token

All API calls require a Keycloak admin token:

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

### Create the Broker Client

The `kafka-broker` client is used by the Kafka brokers. It has Authorization Services enabled (used in Part 2):

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

The `authorizationServicesEnabled: true` setting enables the Keycloak Authorization Services on this client. This is
a prerequisite for the authorization setup in Part 2.

### Create Tenant Clients

Each tenant gets a service account client. These clients do not have Authorization Services enabled - they are regular
OAuth clients that authenticate using `client_credentials`:

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

Final view of the clients:

{{< custom-image "../images/kafka-strimzi/strimzi-kafka-oauth-keycloak-clients.png" "960" >}}

### Add Audience Mapper

Every client needs an audience mapper so the issued JWT contains `aud: kafka-broker`. This is required because the
broker is configured with `oauth.check.audience="true"` and validates that the token was explicitly issued for Kafka.

To allow checking the audience, we add an audience mapper for each client. This adds the `aud: kafka-broker` field
to the token:

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

### Create Groups and Assign Service Accounts

For demonstration purpose, each tenant gets a parent group with `reader` and `writer` subgroups. The tenants service account is added to both
subgroups. Having distinct reader and writer groups allows giving specific read-access when needed, for example for
debugging purposes on a development stage.

```shell
for tenant in timkoko acmecorp umbrellacorp; do
  # Create parent group
  curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/groups" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"${tenant}\"}"

  PARENT_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/groups?search=${tenant}" \
    | jq -r '.[0].id')

  # Create reader and writer subgroups
  for subgroup in "${tenant}-reader" "${tenant}-writer"; do
    curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${PARENT_ID}/children" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"${subgroup}\"}"
  done

  # Add the service account to both groups
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

The resulting group structure looks like this:

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

## Verify Authentication

With the broker and Keycloak clients configured, we can verify that OAuth authentication works by obtaining a token
and inspecting it.

### Obtain and Inspect a Token

Fetch a `client_credentials` token for the `timkoko` client:

```shell
ACCESS_TOKEN=$(curl -s "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -d "client_id=timkoko" \
  -d "client_secret=timkoko-secret" \
  -d "grant_type=client_credentials" \
  | jq -r .access_token)

echo ${ACCESS_TOKEN}
```

Decode and inspect the token payload:

```shell
echo ${ACCESS_TOKEN} | jq -R 'split(".") | .[1] | @base64d | fromjson'
```

The decoded token should contain (among other fields):

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

Verify the following:

- `aud` contains `kafka-broker` - the audience mapper is working
- `preferred_username` is set - the broker uses this as the Kafka principal via `oauth.username.claim`
- `exp` is approximately 600 seconds in the future - the token lifespan is configured correctly

### Test Authentication from a Kafka CLI Pod

To test end-to-end authentication against the Kafka cluster, use a CLI pod running inside the Kubernetes cluster.

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

The following example uses the Apache Kafka `OAuthBearerLoginCallbackHandler`:

```shell
# From inside the CLI pod with Kafka CLI tools and access to the cluster CA certificate
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

# List topics - should authenticate successfully
./bin/kafka-topics.sh --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 --command-config /tmp/client.properties --list
```

If authentication is successful, the command connects to the broker and returns the list of topics. If the token or
audience is invalid, you will see an `SaslAuthenticationException`.

Alternatively, using the Strimzi `JaasClientOauthLoginCallbackHandler`:

```shell
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

# Set credentials via environment variables
export OAUTH_CLIENT_ID=timkoko
export OAUTH_CLIENT_SECRET=timkoko-secret

# List topics - should authenticate successfully
./bin/kafka-topics.sh --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 --command-config /tmp/client-strimzi.properties --list
```

> The Strimzi `JaasClientOauthLoginCallbackHandler` provides improved logging, metrics, enhanced caching and retries
> for token handling. It is easier to use in a Kubernetes setup as it supports configuration using environment
> variables. However, it requires the `strimzi-kafka-oauth-client` library which might not be available in all
> environments. The Apache Kafka `OAuthBearerLoginCallbackHandler` is production-ready since Kafka 2.8 and is
> available in all Kafka distributions.

## What's Next

At this point, all tenant clients can authenticate against the Kafka cluster using OAuth tokens issued by Keycloak.
However, there are no authorization rules in place yet - any authenticated client can access any topic.

In [Part 2](https://tim-koko.ch/blog/kafka-oauth-strimzi-keycloak-authorization/), we configure the `KeycloakAuthorizer` on the Kafka broker and set up Keycloak's Authorization Services
with scopes, resources, policies, and permissions to enforce fine-grained, multi-tenant access control.

## Do you need help or guidance?

Do you need help setting up OAuth authentication for your Kafka cluster or do you have general questions about Apache
Kafka? Do not hesitate to contact us.
