---
title: "Centris – Kafka storage migration"
description: ""
date: 2025-09-01T00:00:00+00:00
lastmod: 2025-09-01T00:00:00+00:00
draft: false
images: ["images/projects/tk-Ref-Centris-1200x630px-og.jpg"]
Sitemap:
  Priority: 0.3
client: "Centris AG"
post_img: "images/projects/tk-Ref-Centris-1500x1000px.jpg"
img_border: false
lead: "We have been supporting Centris for some time now in the areas of Kafka Messaging and OpenShift Engineering. Among other things, we have also assisted with the storage migration of their clusters based on Red Hat OpenShift Streams for Apache Kafka. The goal was to migrate the Kafka storage from a storage system that was to be replaced to a new storage infrastructure without any interruptions."
techStack: "Red Hat OpenShift, Streams for Apache Kafka, Apache ZooKeeper, Kafka Cruise Control, Prometheus, Grafana"
copy: "Image © Centris AG"
link: "https://www.centrisag.ch"
---


Due to the change in storage system, all applications that store persistent data on Red Hat OpenShift had to be migrated
to the new storage system. tim&koko planned the storage migration of the Kafka clusters and successfully implemented it
together with the Kafka administrators of Centris. The chosen approach supports the regular cluster lifecycle and enables
preparatory work for foreseeable migrations such as the ZooKeeper to KRaft migration. This not only achieved the main
goals of the storage migration, but also created sustainable technological added value for Centris.

## About Centris AG

Centris AG is a leading IT service provider for Swiss health and accident insurers. The company was founded in 1947 and
now employs over 300 people. Currently, 23 health and accident insurers with around 8,000 claims handlers and a total
of approximately 4.3 million insured persons rely on industry solutions of Centris. With its comprehensive expertise in the
development, integration, and operation of highly available IT solutions, Centris provides its customers with targeted
support in their digital transformation. The core requirements include stability, availability, and security of
business-critical applications — including the Swiss Health Platform (SHP). With this open and cloud-based platform,
Centris connects players in the Swiss healthcare system and actively supports the digital transformation of health and
accident insurers.

## Challenge

The initial situation was characterized by several productive Kafka clusters whose underlying storage systems were
nearing the end of their support period. The main challenges were:

* **Production environment:** The migration had to be carried out without interruption and without risk to running applications.
* **Time pressure:** Due to expiring storage support, there was a tight deadline.
* **Complexity:** Various preparatory work was necessary, particularly in the area of cluster setup and monitoring.
* **Monitoring:** To ensure secure control and monitoring of the migration, cluster monitoring based on the ZooKeeper management interface and Kafka metrics had to be implemented.

## Solution Approach

Both systems—Apache ZooKeeper and Apache Kafka—are cluster systems with replication mechanisms. Therefore, storage
migration was performed at the application or cluster level rather than at the storage level.

The migration was divided into two areas: storage migration for ZooKeeper and for the Kafka brokers. The basis for
this was an upgrade of Streams for Apache Kafka Operators to version 2.8 in order to be able to use the latest features.
Due to time constraints, the storage migration was deliberately separated from the upcoming ZooKeeper to Kraft migration.

### ZooKeeper storage migration

First, it was ensured that reliability was guaranteed by sufficient redundancy of the ZooKeeper instances. In the
underlying Red Hat OpenShift cluster, the target storage was defined as a new StorageClass and set as the default. This
enables the use of ZooKeepers internal state synchronization process, which allows an instance to restore its state
based on the other quorum participants. The migration was performed instance by instance and was supported by the
on-board tools of Streams for Apache Kafka. The operator took care of recreating the ZooKeeper instance, including the
new PersistentVolume. After successful synchronization and replication verification, the next instance was migrated.

### Kafka storage migration

The KafkaNodePool feature allows the creation of multiple Kafka broker pools with different infrastructure
characteristics. The previous StatefulSet had the disadvantage that all Kafka brokers were identical. This circumstance
was used to provision new brokers with the new storage system. Kafka Cruise Control was used to move data to the new
brokers. Replica partitions could thus be specifically removed from old brokers and assigned to new brokers.
Intra-cluster replication took care of the automatic data transfer. The new KafkaNodePool was gradually expanded and
the old pool was decommissioned.

## Results

* The migration was completed without errors or interruptions.
* The Kafka clusters were successfully upgraded to the new operator version.
* Although the storage migration could not be combined with the upcoming KRaft migration, preparatory steps have already been implemented.
* The Cruise Control feature was set up and remains available.
* The Kafka clusters were supplemented with maintenance tooling and monitoring, which will simplify future troubleshooting.

## Client Testimonial

«We found working with tim&koko to be a thoroughly pleasant, efficient, and goal-oriented experience. With the migration
option we chose, the storage migration of all Kafka clusters could be carried out without downtime and thus without any
impact on service for our customers. A competent partner — we would gladly work with them again.»

**Stefan Werder**, Product Owner Swiss Health Cloud Platform

## Conclusion & Lessons Learned

The storage migration at Centris shows that even complex infrastructure changes can be implemented in a productive Kafka
environment without interruption — provided that a clearly structured and step-by-step approach is followed.

The technologies and tools used — in particular Red Hat OpenShift Streams for Apache Kafka and Kafka Cruise Control — have
proven to be powerful components for stable and scalable operation. The project underscores Centris' innovative strength
and technical expertise in dealing with modern cloud and messaging technologies.

Do you face similar challenges or want to learn more about Apache Kafka? Get in touch with us for a no-obligation conversation:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">contact tim&koko</a>
