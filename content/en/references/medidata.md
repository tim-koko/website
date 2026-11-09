---
title: "MediData – Building a Kafka Platform"
slug: "medidata-building-kafka-platform"
description: "Kafka platform for MediData: built from scratch and integrated into the existing microservice architecture on Red Hat OpenShift."
date: 2026-11-06T00:00:00+00:00
lastmod: 2026-11-06T00:00:00+00:00
draft: false
images: ["images/projects/tk-Ref-MediData-1200x630px-og.png"]
Sitemap:
  Priority: 0.3
client: "MediData AG"
post_img: "images/projects/tk-Ref-MediData-1500x1000px.png"
img_border: false
lead: "Since spring 2026, tim&koko has been supporting MediData in building a Kafka messaging platform from scratch. The platform will complement the existing microservice architecture and gradually replace ActiveMQ and shared database views. The goal is to take the different responsibilities of the teams, multiple Red Hat OpenShift environments and the protection of personal data into account right from the start."
techStack: "Red Hat OpenShift, Red Hat Streams for Apache Kafka, Apicurio Registry"
copy: "Image © MediData AG"
link: "https://www.medidata.ch"
---

In this project, tim&koko contributes many years of experience in Kafka, OpenShift engineering, operations, security and observability, and supports the design and implementation of the new Kafka platform. We work closely with the platform team and the developers to build a solution tailored to their needs and to share knowledge within the company.

## About MediData AG

Founded in 1994, MediData AG is based in Root. Today, more than 90 employees are dedicated to the digitalisation of
the Swiss healthcare system. A key offering is the MediData network, launched in 2018: as a digital platform, it
enables the exchange of administrative data between healthcare providers and insurers. According to MediData, all
Swiss insurers are connected to it.

Current figures show how widely the platform is used: around 8,700 doctors, 95% of hospitals, more than 2,000 care
homes and home care (Spitex) organisations, 81% of laboratories and 98% of pharmacies use the network and its related
solutions. Together, they account for more than 22,000 connections, and MediData processes around 117 million
transactions per year.

This reach is backed by continuous development: in 2013, MediData received ISO 27001 certification for information
security and certification under the Swiss Ordinance on Data Protection Certification (VDSZ). In 2022, it added the
electronic delivery of invoices and invoice copies to patients. Since the platform processes particularly sensitive
health data, data protection and information security are a high priority at MediData.

## Challenge

MediData wants to build a Kafka messaging platform from scratch and integrate it into the existing microservice architecture. Until now, the services exchanged data via ActiveMQ messages or shared views in a monolithic Oracle database. As part of a long-term decoupling initiative, Kafka is to gradually replace both of these approaches. The main challenges are:

* **Integration into the existing architecture:** The new platform has to fit in with the existing services and their current communication paths, and be fully managed with GitOps.
* **Data protection and permissions:** Since some of the data is personal, the need-to-know principle has to be applied to data access.
* **Building the platform and the know-how:** The platform is being built from scratch, while the customer initially had little Kafka experience.
* **From PoC to production:** At the start of the project, it had to be decided whether Kafka was suitable at all. The proof of concept had to be built so that it could later easily be developed into a production instance.

## Solution Approach

The first step of the project was to build a proof of concept to decide whether Kafka meets the requirements. Once that decision was made, we started developing the PoC, milestone by milestone, into a production-ready platform. This allowed MediData to start initial tests on the platform with the developers early on. We were able to gather feedback early and incorporate it continuously.

Since MediData already operates two on-premises Red Hat OpenShift clusters, the choice of ecosystem fell on Red Hat Streams for Apache Kafka, which is based on the open source project Strimzi. Two Kafka clusters were required, each covering two stages and running on dedicated nodes of the Red Hat OpenShift clusters. All configurations and tools of the clusters are already managed with GitOps, so this was a basic requirement for the Kafka platform as well. This allows us to offer developers a self-service for creating new topics and users via GitLab merge requests in the corresponding repository.

### Authentication and Authorization

For authentication, we decided together with the project team on a service-based architecture in which each application is represented as a separate user. A naming concept based on prefixes for topics and consumers makes it possible to grant each application only the minimum permissions it needs and to implement the need-to-know principle.

### Extending the Kafka Ecosystem

A Kafka installation rarely comes alone. In addition to the Kafka platform, the Apicurio Registry was installed to manage schemas. The metrics of the entire Kafka platform and its ecosystem are collected in Prometheus via PodMonitors and ServiceMonitors and visualised in Grafana, using the Strimzi dashboards. This allowed us to build in observability from the very beginning.

## Current Status and Results

The platform is available to the development teams for initial tests and integrations. Their feedback is continuously incorporated into further development, while the platform is gradually being moved into production.

* We built the infrastructure using GitOps, which, among other things, enables self-service for developers and integrates seamlessly with the rest of the infrastructure deployments.
* Authentication is handled via KafkaUser objects. In a next phase, their credentials will be synchronised with Vault to allow central management. Authorization combined with a naming concept tailored to the company made it possible to apply the need-to-know principle consistently.
* The Kafka clusters were equipped with maintenance tooling and monitoring from the start to simplify future troubleshooting.
* The Apicurio Schema Registry allows developers to manage their schema versions centrally and to manage the compatibility of these schemas.
* AKHQ and user access for developers for troubleshooting purposes will be provided in the next phase.
* In the future, Debezium will be used to feed data from the Oracle databases into the Kafka topics.

## Client Statement

«The situation is excellent, we have exceeded the plan and our business side is already working on adoption.»

**Philipp Bartsch**, Platform Engineer / Product Owner

## Conclusion & Lessons Learned

Building the Kafka platform at MediData shows how a proof of concept can be developed step by step into the foundation of a production messaging infrastructure. Involving the development teams early makes it possible to validate requirements and priorities in practice and to feed their input directly into the implementation. At the same time, GitOps, a well-aligned permission concept and integrated monitoring lay the groundwork for future operations.

What matters is not only the technical implementation, but also the close collaboration with the platform team and the developers. Together, we build the know-how needed to operate and develop the platform in the long term. This lays the foundation for MediData to gradually replace existing communication paths and further decouple its microservices.

Do you face similar challenges or want to learn more about Apache Kafka, Red Hat Streams for Apache Kafka or Strimzi? Get in touch with us for a no-obligation conversation:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">contact tim&koko</a>
