---
title: "Migrating ZooKeeper based Kafka-Clusters to KRaft"
slug: "kafka-zookeeper-kraft-migration"
description: ""
date: 2024-05-16T00:00:00+00:00
lastmod: 2025-04-10T00:00:00+00:00
draft: false
images: ["images/blog/kraft/tk-blogpost-01_kraft_share-image.jpg"]
img_border: true
Sitemap:
  Priority: 0.3

categories: ["Technology", "Apache Kafka", "Messaging", "Strimzi"]
authors: ['christof-luethi']
additionalblogposts: [ 'kafka-4', 'strimzi-kafka-0.49.0-api-v1']
post_img: "images/blog/kraft/tk-blogpost-01_kraft.jpg"
lead: "With the 3.6.2 release, Apache Kafka provides a production ready migration path from Apache ZooKeeper-based clusters to KRaft. What you need to know and what you should consider for the migration is summarized here."
---

Apache Kafka is a widely used, robust and distributed streaming and event platform. With the replacement of
Apache Zookeeper as the central coordination service by the KRaft algorithm, Kafka reaches a milestone
that the Kafka community has been eagerly awaiting a long time. Now the time has come.

### Traditional Architecture with Apache ZooKeeper

A Kafka cluster consists of several brokers, one of them acts as a controller. This controller takes on central
tasks such as the management of leader partitions and replica partitions. For example, if a broker fails, it's his task
to promote a replica partition of another broker as a new leader partition. Which of the brokers operates as a Kafka
controller is determined using the coordination service Apache ZooKeeper. The controller is responsible for active
communication with the ZooKeeper cluster as well as storing the cluster, topic and partition metadata in ZooKeeper.
A traditional Kafka architecture looks like this:

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-zookeeper-architecture.svg" >}}

This architecture remained almost unchanged since the first versions of Kafka. At the end of 2019, with the acceptance
of the "Kafka Improvement Proposal" KIP-500, the replacement of the dependency on ZooKeeper and its replacement by a
Raft-based algorithm was approved. At Kafka the algorithm is called KRaft (Kafka + Raft).

### Kafka with KRaft and without ZooKeeper

Getting rid of the ZooKeeper dependency has the following advantages for Kafka (among others):

**Architecture:** ZooKeeper had to be operated separately. The replacement brings a standardization of
security concepts, communication protocols, configuration methods, monitoring approaches and failover scenarios.

**Scaling:** ZooKeeper is not intended for use with a large dataset. This implies some limits for Kafka. As an example
there is an approximate limit of 200,000 partitions per Kafka cluster. With KRaft, these limitations are mostly eliminated.

**Performance:** In a ZooKeeper-based system, the metadata is stored in ZooKeeper. The active Kafka controller keeps a
copy of this metadata. If the controller fails, a new controller is elected which then needs to replicate the full
metadata set from ZooKeeper. Depending on the size of the cluster (e.g. partitions), this process takes several seconds
or in extreme cases can lead to a timeout. In KRaft mode the metadata is stored in the single-partition topic
`__cluster_metadata`. Metadata updates are distributed to all brokers on an event basis. The metadata can be restored
at any time using event sourcing from the `__cluster_metadata` topic.

In a KRaft-based cluster, there are two roles for a Kafka instance: «broker» and «controller». As a «broker» the Kafka
instance operates like a traditional Kafka broker. The role «controller» is intended for the KRaft instances managing
the cluster. With this role model, it is also possible to operate the instances in «combined» mode. In this case one
instance acts as a regular broker and as a controller simultaneously. However, this mode is not yet recommended for
productive environments.

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-kraft-roles.svg" >}}

#### KRaft Roadmap

Since more than a year and the introduction of Kafka 3.3, KRaft-based Kafka clusters have been ready for production.
The missing migration path from ZooKeeper to KRaft was added in the 3.6 release. ZooKeeper has already been officially
marked as deprecated and the first release of Kafka 4.0 was released in March 2025. It is
expected that critical bug fixes for ZooKeeper-based clusters will be delivered for another 12 months after the last
version with ZooKeeper support is released.

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-timeline.svg" >}}

### Migration

> _«KRaft has been supported in Confluent Cloud for over a year now […] We are about near 100% migration to KRaft»_
>
> -- <cite>Thomas Chase, Confluent Inc., Mai 2024</cite>

For the migration from ZooKeeper to KRaft must be made using a bridge release. These are releases that support ZooKeeper
and KRaft mode and also contain tooling for the migration. Since Kafka 4.0 will no longer support ZooKeeper and version
3.9 is the last Kafka 3 release, a migration must be made between versions 3.6.2 and 3.9.

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-releases.svg" >}}

The migration takes place in several steps and depending on the progress of the migration also includes an option to
rollback the cluster to the ZooKeeper mode. Depending on the Kafka distribution or operator used, the migration steps
are partially automated.

At some time during the migration, the Kafka cluster is set to a dual-write mode. In this mode, the metadata from KRaft
is still stored in ZooKeeper. This enables a rollback to the initial state.

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-states.svg" >}}

Migration takes place in the following steps. The information on automation refers to the Strimzi operator.

{{< csvtable "responsive" "," >}}
Step,Mode,Description,Automated,Rollback
1,ZooKeeper,Initial state,No,-
2,ZooKeeper,KRaft instances are created and wait for the Kafka brokers to connect.,Yes,Yes
3,ZooKeeper,Kafka Broker connect to the KRaft instances. The migration of metadata from ZooKeeper to KRaft begins.,Yes,Yes
4,Dual-Write,Migration of the metadata is complete. The leader of the KRaft instances still writes all metadata changes to ZooKeeper. The Kafka brokers are disconnected from ZooKeeper. The dual-write state is reached. Beyond this step a rollback is not possible.,Yes,Yes
5,KRaft,The leader of the KRaft instances no longer writes the metadata to ZooKeeper. The connection to ZooKeeper is dropped.,No,No
6,KRaft,The ZooKeeper instances are shutdown,Yes,No
7,KRaft,The migration is complete and the final target state has been reached.,-,No
{{< /csvtable >}}

If the Strimzi/AMQ Streams operator is used, the automated steps are managed by the cluster operator. The triggering of
the migration, any rollback or the completion of the migration is controlled via the annotation `strimzi.io/kraft` on
the Kafka resource.

<br />

#### Limitations for KRaft based Clusters

Currently, there are some limitations for the migration to ZooKeeper. It must be checked in advance whether a migration
is affected by a limitation.

<br />
General

* The migration should be started with the latest Kafka versions, operators and configurations.
* Combined mode of KRaft is not yet recommended for productive clusters.
* There is no migration path from KRaft to ZooKeeper.
* During the migration, it is not possible to change the `metadata.version` or `inter.broker.protocol.version`. You may break your cluster doing so.
* At the moment, only 3 KRaft controllers are recommended for productive clusters. A higher number of controllers is explicitly not recommended.

<br />
The following features of ZooKeeper-based clusters, are not yet supported in KRaft mode. They will be ready for production in Kafka version 3.8.0.

* JBOD configuration (Just a Bunch of Disks) with multiple storage locations. Specification as JBOD with only one storage location is possible.
* Changes to the KRaft quorum (e.g. adding or removing KRaft instances).

<br />
The following applies specifically to Strimzi / AMQ Streams Operator-based deployments:

* To start the migration, at least Strimzi 0.40.0 with Kafka 3.7.0 must be used.
* The Kafka cluster must be configured with KafkaNodePools
* The bidirectional topic operator is not supported.

<br />

#### Preparation for a migration

The following should be considered before starting a migration:

* The cluster fulfills all requirements for migration (see Limitations)
* Even if the migration has no direct impact on newer Kafka clients, they should be checked whether they use old configurations requiring ZooKeeper. For example:
  * Burrow uses ZooKeeper directly
  * Earlier versions of Cruise Control also use ZooKeeper directly
* Ensure that sufficient resources are available for the migration.
  * During the migration both ZooKeeper and KRaft instances are active.
  * KRaft instances should be operated on similar hardware as ZooKeeper.
    * Confluent recommendations for productive ZooKeeper/KRaft instances: 4GB memory, 1GB JVM heap space, 64GB disk space.
* Prepare the monitoring for KRaft instances. KRaft controllers can be monitored the same way as Kafka brokers using JMX metrics.
* It is recommended to increase the following log levels during the migration:
  * `log4j.logger.org.apache.kafka.metadata.migration=TRACE`

<br />

It is also advisable to prepare the CLI tools. These are used for administrative and debugging purposes. In particular,
the new CLI tools that replace the ZooKeeper shell should be available:

**Metadata Quorum Tool:** `kafka-metadata-quorum` can be used to examine the status of the metadata partition.

**Kafka Log Tool:** `kafka-dump-log` can be used to read the log segments directly from the metadata directory.

**Metadata Shell:** `kafka-metadata-shell` provides an interactive shell to examine the cluster metadata (similar to ZooKeeper shell)

## Do you need help or guidance?

Do you need help migrating your Kafka cluster from Apache ZooKeeper to KRaft or do you have general questions about Apache Kafka? Do not hesitate to contact us.
