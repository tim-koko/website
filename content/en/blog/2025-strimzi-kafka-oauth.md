---
title: "Strimzi Kafka OAuth 2.0 Authentication and Authorization"
slug: "strimzi-kafka-oauth"
description: ""
date: 2025-04-15T00:00:00+00:00
lastmod: 2025-04-15T00:00:00+00:00
draft: false
images: ["images/blog/strimzi-kafka-oauth/tk-blogpost-strimzi-kafka-oauth-share-image.jpg"]
Sitemap:
  Priority: 0.92

categories: ["Technology", "Apache Kafka", "Messaging", "Strimzi", "OAuth2"]
authors: []
additionalblogposts: [ 'kafka-zookeeper-kraft-migration', "kafka-4" ]

post_img: "images/blog/strimzi-kafka-oauth/tk-blogpost-strimzi-kafka-oauth.jpg"
img_border: true
lead: "Deep dive into the configuration of OAuth2 Authentication and OAuth2 Authorization of Strimzi or Streams for Apache Kafka on OpenShift based Apache Kafka clusters using the KeycloakAuthorizer and Keycloak."
---

This blogpost describes how to secure an Apache Kafka cluster using OAuth2 for authentication and authorization.
We integrate Kafka with Keycloak, use Strimzi and rely on the KeycloakAuthorizer to implement fine-grained, group-based
access control. It does not cover the initial setup of the KRaft based Kafka cluster and Keycloak.

### Introduction

Strimzi supports various
