---
title: "Kafka OAuth 2 Authorization with Strimzi and Keycloak"
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
lead: "With OAuth authentication in place, the next step is enforcing fine-grained access control. In this second part we configure the KeycloakAuthorizer on the Kafka broker and set up Keycloak's Authorization Services — scopes, resources, policies, and permissions — to achieve multi-tenant topic isolation."
---

In [Part 1 Authentication](https://tim-koko.ch/en/blog/strimzi-kafka-oauth-keycloak-authentication/) we configured a Strimzi-managed Kafka
cluster with OAuth 2 authentication using Keycloak, provisioned tenant clients (timkoko, acmecorp, umbrellacorp),
and verified that token-based authentication works. At this point any authenticated client can still access any topic.

This second part covers the authorization side: configuring the `KeycloakAuthorizer` on the Kafka broker and setting up
Keycloak's Authorization Services to enforce that each tenant can only access their own topics and consumer groups.

{{< svg "assets/images/blog/kafka-strimzi/strimzi-kafka-oauth2-keycloak-authz-services.svg" >}}

### Keycloak Authorization Concepts

The Keycloak Authorization Services provide four building blocks that work together:

- **Authorization Scopes:** Actions that are available on a resource. For Kafka these map to the Kafka operations:
  `Create`, `Write`, `Read`, `Delete`, `Describe`, `Alter`, `DescribeConfigs`, `AlterConfigs`, `ClusterAction`,
  `IdempotentWrite`.
- **Resources:** Define what we are protecting from unauthorized access. Each resource uses the pattern
  `RESOURCE_TYPE:NAME_PATTERN` (e.g., `Topic:timkoko-*`, `Group:acmecorp-*`). Prefix matching with `*` highly reduces
  the amount of resource definitions needed. Resources contain a list of authorization scopes defining which operations
  are possible.
- **Policies:** Define which groups of users we want to target with permissions. We use group-based policies, binding
  permissions to Keycloak groups like `timkoko-reader` or `acmecorp-writer`. Another common approach would be to use
  role-based policies, binding permissions to Keycloak roles like `reader` or `writer`.
- **Permissions:** Tie together specific resources, action scopes, and policies to define that _specific users U can
  perform certain actions A on resource R_.

The relationship flows as: **Clients** belong to **Groups** which are targeted by **Policies** which are tied to
**Permissions** granting **Scopes** on **Resources**.

### Kafka Security Model

The Kafka security model understands the following actions (scopes) on the different resource types:

{{< csvtable "responsive" ";" >}}
Resource Type;Available Scopes
Topic;Write, Read, Describe, Create, Delete, DescribeConfigs, AlterConfigs, IdempotentWrite
Group;Read, Describe, Delete
Cluster;Create, Describe, Alter, DescribeConfigs, AlterConfigs, IdempotentWrite, ClusterAction
TransactionalId;Describe, Write
DelegationToken;Describe
{{< /csvtable >}}

## Kafka Broker Authorization Configuration

The `KeycloakAuthorizer` delegates authorization decisions to Keycloak's Authorization Services. Add the following to
the Kafka resource:

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
      # Keycloak authorization properties
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
      # ... (as configured in Part 1)
```

### Key Authorization Properties

{{< csvtable "responsive" ";" >}}
Property;Value;Description
strimzi.authorization.delegate.to.kafka.acl;true;When the KeycloakAuthorizer denies a request, it delegates the decision to Kafka's built-in ACL system. This allows mixing OAuth users with TLS/ACL users on the same cluster.
strimzi.authorization.client.id;kafka-broker;The Keycloak client used by the broker for authorization lookups.
strimzi.authorization.token.endpoint.uri;-;The Keycloak token endpoint used to fetch authorization grants.
strimzi.authorization.grants.refresh.period.seconds;60;How often the broker refreshes the grants of active sessions.
strimzi.authorization.reuse.grants;true;Reuse cached grants for existing sessions instead of fetching new ones.
strimzi.authorization.grants.max.idle.time.seconds;300;Idle grants are evicted from cache after this time.
strimzi.authorization.enable.metrics;true;Enable metrics for monitoring authorization performance.
{{< /csvtable >}}

### SuperUsers

Superusers bypass all authorization checks and have full access to the cluster:

```yaml
authorization:
  type: custom
  authorizerClass: io.strimzi.kafka.oauth.server.authorizer.KeycloakAuthorizer
  superUsers:
    - CN=my-superuser              # mTLS based superuser
    - service-account-kafka-admin  # OAuth based superuser
    - service-account-kafka-broker # Broker service account
```

> It is recommended to have at least one superuser that does not depend on Keycloak (e.g., a TLS-authenticated user
> like `CN=my-superuser`). This ensures cluster access even when Keycloak is unavailable.

### ACL Delegation

The `KeycloakAuthorizer` supports delegating `DENIED` requests from the Keycloak authorization to the underlying
ACL system. This requires that ACLs have been defined, either using the `KafkaUser` CR from Strimzi or any other
method. This is only supported in KRaft mode and is a feature of the Keycloak authorizer, not from Kafka itself.

Example broker log showing ACL delegation:

```text
Authorization GRANTED by ACL - non-oauth user: User:CN=tk, operation: DESCRIBE, resource: TOPIC:timkoko-topic-demo-v0
```

### Logging Authorization

For debugging authorization issues, the broker's logging can be adjusted:

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

## Keycloak Authorization Setup

All Keycloak configuration is done via the Admin REST API. Ensure you have a valid admin token as described in Part 1.

> **Port-forwarding for local access:** If Keycloak is running inside the Kubernetes cluster, use port-forwarding to
> access the admin API from your local machine:
>
> ```shell
> kubectl port-forward -n keycloak svc/keycloak-service 8080:8080
> ```
>
> This makes Keycloak available at `http://localhost:8080`. All `curl` commands in this guide target this local
> address.

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

### Configure Authorization Services

Configure the broker client's authorization services with enforcing mode:

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

- **Policy Enforcement Mode `ENFORCING`:** Requests are denied by default even when there is no policy associated with
  a given resource.
- **Decision Strategy `AFFIRMATIVE`:** At least one permission must evaluate to a positive decision in order to grant
  access.

In practice this means: Keycloak strictly enforces authorization, access is denied by default unless a permission
explicitly grants it. If multiple policies apply, any one that allows access is enough to permit it.

It is also recommended to delete the `Default Resource` and `Default Policy` that Keycloak creates automatically when
Authorization Services are enabled:

```shell
# Delete Default Resource
RESOURCE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/resource" \
  | jq -r '.[] | select(.name=="Default Resource") | ._id')

curl -s -X DELETE \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/resource/${RESOURCE_ID}" \
  -H "Authorization: Bearer $TOKEN"

# Delete Default Policy
POLICY_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/policy" \
  | jq -r '.[] | select(.name=="Default Policy") | .id')

curl -s -X DELETE \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${BROKER_UUID}/authz/resource-server/policy/${POLICY_ID}" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Authorization Scopes

Create the Kafka operation scopes on the broker's authorization services. These scopes are derived from the
Kafka security model:

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

### Create Resources

Resources define what we are protecting. The general pattern is `RESOURCE_TYPE:NAME_PATTERN`. Using prefix matching
with `*` highly reduces the number of resources needed.

For each tenant we create a `Topic` and `Group` resource. The scopes defined on a resource specify which operations
are **possible** on this resource — they do not implicate that access is granted automatically.

```shell
for tenant in timkoko acmecorp umbrellacorp; do
  # Topic resource with topic scopes
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

  # Consumer group resource with group scopes
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

### Create Policies

Tying a permission to a Keycloak group is done with a policy of type `group`. The policies use `logic=POSITIVE`
(the resulting effect is taken as-is) and `decisionStrategy=UNANIMOUS` (all contained policies must evaluate to
permit). If any policy denies, access is denied.

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

### Create Permissions

The final piece ties everything together. Permissions bind a resource with defined scopes to a group policy. Depending
on the effective client, multiple permissions must be created.

{{< custom-image "../images/kafka-strimzi/strimzi-kafka-oauth-keycloak-authorization-permissions.png" "960" >}}

For each tenant we create three permissions:

1. **Read topics** — allows reading from `Topic:<tenant>-*` via the reader policy
2. **Consumer group** — allows using consumer groups `Group:<tenant>-*` via the reader policy
3. **Write topics** — allows writing to `Topic:<tenant>-*` via the writer policy

```shell
for tenant in timkoko acmecorp umbrellacorp; do
  # 1. Read permission on topics
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

  # 2. Consumer group permission
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

  # 3. Write permission on topics
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

This ensures that members of the reader group get read access to the consumer group and the topics. The writer group
allows access to write to the topics.

{{< custom-image "../images/kafka-strimzi/strimzi-kafka-oauth-keycloak-authorization-permission-details.png" "960" >}}

## Verify Authorization

With authentication and authorization fully configured, we can verify that multi-tenant isolation works correctly.

{{< svg "assets/images/blog/kafka-strimzi/strimzi-kafka-oauth2-keycloak-authz.svg" >}}

### Inspect an Authorization Token

Fetch an authorization token (UMA grant) and inspect the granted permissions:

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

The `authorization` section in the decoded token should contain the granted permissions:

```json
{
  "authorization": {
    "permissions": [
      {
        "rsname": "Topic:timkoko-*",
        "scopes": ["Read", "Describe", "Write"]
      },
      {
        "rsname": "Group:timkoko-*",
        "scopes": ["Read", "Describe"]
      }
    ]
  }
}
```

Notice that only `timkoko-*` resources are present — there is no access to `acmecorp-*` or `umbrellacorp-*` resources.

### Test Authorization from a Kafka CLI Pod

Inside the CLI Pod from the [Part 1 Authentication](https://tim-koko.ch/en/blog/strimzi-kafka-oauth-keycloak-authentication/), create the client configuration and test against the Kafka cluster:

```shell
# From inside a pod with Kafka CLI tools
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

**List topics** — should only show the tenant's own topic:

```shell
./bin/kafka-topics.sh --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 --command-config /tmp/client.properties --list
```

Expected output:

```text
timkoko-topic-demo-v0
```

**Produce to own topic** — should succeed:

```shell
echo "hello from timkoko" | ./bin/kafka-console-producer.sh \
  --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 \
  --producer.config /tmp/client.properties \
  --producer-property enable.idempotence=false \
  --topic timkoko-topic-demo-v0
```

**Consume from own topic** — should succeed:

```shell
./bin/kafka-console-consumer.sh \
  --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 \
  --consumer.config /tmp/client.properties \
  --topic timkoko-topic-demo-v0 \
  --group timkoko-consumer-group-1 \
  --from-beginning --max-messages 1
```

**Produce to another tenant's topic** — should be denied:

```shell
echo "hello" | ./bin/kafka-console-producer.sh  \
  --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 \
  --producer.config /tmp/client.properties \
  --producer-property enable.idempotence=false \
  --topic acmecorp-topic-demo-v0
```

Expected error:

```text
ERROR [Producer clientId=console-producer] Topic authorization failed for topics [acmecorp-topic-demo-v0]
org.apache.kafka.common.errors.TopicAuthorizationException: Not authorized to access topics: [acmecorp-topic-demo-v0]
```

**Consume from another tenant's topic** — should be denied as well:

```shell
./bin/kafka-console-consumer.sh \
  --bootstrap-server my-kafka-cluster-kafka-bootstrap:9094 \
  --consumer.config /tmp/client.properties \
  --topic umbrellacorp-topic-demo-v0 \
  --group timkoko-sneaky-group \
  --from-beginning --max-messages 1
```

## Summary

Combining Strimzi, Keycloak, and OAuth 2 provides a scalable, centralized approach to Kafka security:

1. **Strimzi Operator** manages the Kafka cluster and its listeners declaratively via Kubernetes CRDs.
2. **Keycloak** handles identity management, token issuance, and authorization policies centrally.
3. **OAuth 2 with OAUTHBEARER** replaces static credentials with short-lived, cryptographically signed JWTs.
4. **KeycloakAuthorizer** enforces fine-grained, resource-level permissions with delegation to Kafka ACLs for non-OAuth
   users.
5. **Multi-tenancy** is achieved through prefix-based resource patterns, group-based policies, and the `<tenant>-*`
   naming convention.

Onboarding new tenants requires only: creating a Keycloak client, adding it to the appropriate groups, creating the
authorization resources, policies, and permissions — without modifying the Kafka cluster configuration itself.

## Do you need help or guidance?

Do you need help setting up OAuth authorization for your Kafka cluster or do you have general questions about Apache
Kafka? Do not hesitate to contact us.
