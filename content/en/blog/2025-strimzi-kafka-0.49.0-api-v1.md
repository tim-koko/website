---
title: "Strimzi 0.49.0 introduces new stable v1 API version of Strimzi CRDs"
slug: "strimzi-kafka-0.49.0-api-v1"
description: ""
date: 2025-11-21T00:00:00+00:00
lastmod: 2025-11-21T00:00:00+00:00
draft: false
images: ["images/blog/kafka-strimzi-v1/tk-blogpost-strimzi-v1-share-image.jpg"]
Sitemap:
  Priority: 0.92

categories: ["Technology", "Apache Kafka", "Messaging", "Strimzi"]
authors: ['christof-luethi']
additionalblogposts: [ 'kafka-zookeeper-kraft-migration', 'kafka-4']

post_img: "images/blog/kafka-strimzi-v1/tk-blogpost-strimzi-v1.jpg"
img_border: true
lead: "After more than 8 years of Strimzi releases the newest release 0.49.0 of the Strimzi Operator introduces the v1 API version. It's just a matter of time when Strimzi 1.0.0 will be released."
---

This blogpost is a technical overview of the latest Strimzi 0.49.0 API changes which were released on 21 November 2025. The release
of the `v1` API version marks a significant milestone for operators managing Apache Kafka on Kubernetes. The new API
streamlines resource definitions, unifies naming across components, and removes deprecated fields accumulated over
several Strimzi release cycles.

## The History

Strimzi API versioning progressed slowly because the early releases were experimental, and the project matured rapidly
as new features, fixes, and production users arrived. When the team was preparing for a `1.0.0` release, Kafka's major
shift from ZooKeeper to KRaft introduced deep architectural changes that directly impacted the CRD design of Strimzi. To
avoid locking in an API that would soon become outdated, Strimzi postponed `1.0.0` until the upstream transition stabilized.
But the KRaft migration took far longer than anyone expected, delaying Strimzi's own stable milestone for years. The long
wait simply meant accumulating 38 pre-1.0 releases as Strimzi tracked ongoing transition of Apache Kafka.

{{< svg "assets/images/blog/kafka-strimzi-v1/strimzi-kafka-api-v1.svg" >}}

## Introduction

Strimzi continues to evolve and align its APIs toward long-term stability. As the upstream to Streams for Apache Kafka
on OpenShift, Strimzi adopting a stable `v1` API is an important step for enterprise users seeking predictable
configuration surfaces and reduced upgrade complexity.

With Strimzi 0.49.0, the previously used API groups, such as:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
```

will move to:

```yaml
apiVersion: kafka.strimzi.io/v1
```

This change affects all major CRDs of Strimzi. Most important are `Kafka`, `KafkaTopic`, `KafkaUser`, `KafkaConnect`, `KafkaMirrorMaker2` ... and others.

The new API version also removes deprecated fields, renames attributes for consistency, and introduces normalization
between components (e.g., listeners, logging, and storage definitions).

## Strimzi 0.49.0 and v1 API version

Strimzi `v1` is designed to remain backward-compatible for the foreseeable future. This ensures operational consistency
and avoids frequent changes to CRDs.

Support for older API versions like `v1beta2` is available until Strimzi 1.0.0 (0.52.0), which is expected in the first half of 2026.

With the 0.49.0 release, there is an _API Conversion Tool_, which helps to convert the resources to the new API.

### Upgrading Strimzi to 0.49.0

Before upgrading:

* Make sure you use at least Kubernetes 1.27
* Ensure your cluster is running in KRaft mode
* Make sure your `KafkaUser` resources do not use the old `operation` field in ACLs. If they do, migrate them to use the `operations` list instead.

While upgrading:

* Upgrade the Cluster Operator
* Make sure to upgrade the CRDs to the new version after upgrading the cluster operator. Especially if you use Helm, as Helm normally does not upgrade the CRDs.
* After upgrading to the 0.49.0 cluster operator and applying the new CRDs, make sure you migrate your custom resources to `v1` anytime before the removal of `v1beta2` in Strimzi `1.0.0`.

Please read the full [Upgrade Guide](https://strimzi.io/docs/operators/0.49.0/deploying.html#assembly-upgrade-str)

### Most relevant Changes in Strimzi 0.49.0 or v1 API

In `v1` fields deprecated across several Strimzi release cycles (some dating back to `v1beta1`) have now been removed. Configurations
relying on them must be updated before switching to the new API.

Besides deprecations,  the `v1` also includes changes. The most important ones are:

* Redesign of `KafkaConnect` and `KafkaMirrorMaker2` resources.
* Available authentication and authorization types have changed
  * Authentication `oauth` was removed. Strimzi OAuth libraries remain packed and can be used with type `custom`.
  * Authorization `keycloak` was removed. Strimzi OAuth libraries remain packed and can be used with type `custom`.
* In 0.49.0 Strimzi does not set affinity rules for rack awareness anymore.
  * Set your own affinity and topology spread constraint rules.
* Template section conflicts in `Kafka` and `KafkaNodePool` resources have changed (See [Strimzi Proposal #120](https://github.com/strimzi/proposals/blob/main/120-improve-template-behavior-in-Kafka-node-pools.md))
  * Templates are merged at the property level. The `KafkaNodePool` has precedence if the same property is defined twice.
* Kafka Connect build feature has changed to build custom Connect images (see [Strimzi Proposal #114](https://github.com/strimzi/proposals/blob/main/114-use-buildah-instead-of-kaniko.md))
  * Used Kaniko project has been deprecated
  * Buildah is the new replacement but is currently still disabled.
* Kafka Connect allows specifying version in `KafkaConnector`

For a full list of changes carefully read the [Release Notes](https://github.com/strimzi/strimzi-kafka-operator/releases/tag/0.49.0)

## API Conversion Toolkit

The Strimzi _API Conversion Toolkit_ is a command-line utility and is designed to:

* Converting existing custom resources to the `v1` schema before upgrading the CRDs
  * From YAML files (`convert-file`)
  * Directly in your Kubernetes cluster (`convert-resource`)
* Upgrading CRDs by replacing existing Strimzi CRDs with their `v1` equivalents (`crd-upgrade`)

Make sure you have a backup of your resources before starting the migration. For details about converting custom
resources to `v1` API see [Strimzi Documentation](https://strimzi.io/docs/operators/0.49.0/deploying#assembly-api-conversion-str).
More details about the usage of the conversion tool are available in the `README.md` within the API Conversion Tool.

## Summary

Strimzi 0.49.0 with the `v1` API introduces:

* Stable API surfaces and stricter validation
* Removal and cleanup of deprecated fields
* Harmonized configuration patterns across CRDs
* Support for KRaft-only Kafka clusters

The _API Conversion Toolkit_ simplifies the upgrade process, but engineers should still review and validate each CR manually.

Migrating to `v1` ensures long-term stability, reduces upgrade friction, and aligns your Kafka deployments with
enterprise-grade Kubernetes best practices.

## Do you need help or guidance?

Do you need help migrating your Kafka cluster from Apache ZooKeeper to KRaft or do you have general questions about Apache Kafka? Do not hesitate to contact us.
