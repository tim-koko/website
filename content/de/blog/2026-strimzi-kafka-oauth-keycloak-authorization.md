---
title: "Kafka OAuth 2 Authorization with Strimzi and Keycloak"
slug: "kafka-oauth-strimzi-keycloak-authorization"
description: ""
date: 2026-03-24T01:00:00+00:00
lastmod: 2026-03-24T01:00:00+00:00
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
