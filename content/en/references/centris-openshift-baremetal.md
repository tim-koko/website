---
title: "Centris – OpenShift on Bare Metal"
slug: "centris-openshift-on-bare-metal"
description: "OpenShift on bare metal for Centris: a three-zone platform with OpenShift Virtualization, Hosted Control Planes & GitOps. Live in 5 months. Read the full story!"
date: 2026-11-16T00:00:00+00:00
lastmod: 2026-11-16T00:00:00+00:00
draft: false
images: ["images/landing-pages/tk-giveaway-2024-1500x1000.png"]
Sitemap:
  Priority: 0.3
client: "Centris AG"
post_img: "images/landing-pages/tk-giveaway-2024-1500x1000.png"
img_border: false
lead: "Together with Puzzle ITC and Centris, tim&koko built a new Red Hat OpenShift platform on bare metal. The platform spans three zones and uses OpenShift Virtualization and Hosted Control Planes to run several smaller clusters flexibly. After five months of build-out, it went into production in November 2026."
techStack: "Red Hat OpenShift, OpenShift Virtualization, Hosted Control Planes, Argo CD, Helm, Kustomize, Prometheus, Grafana, GitLab"
copy: "Image © Centris AG"
link: "https://www.centrisag.ch"
---

Centris' existing OpenShift clusters ran on a VMware-based virtualization solution whose licensing was causing
increasingly high costs. At the same time, performance-hungry applications needed an environment closer to the
hardware. Together with Puzzle ITC and Centris, tim&koko designed the architecture of the new platform, built the bare
metal clusters and the hosted clusters entirely via GitOps, and helped shape operations. The platform has been in
production since November 2026, and the first workloads have already been migrated.

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

The initial situation was characterized by two key challenges:

* **Licensing costs:** The existing OpenShift clusters ran on a VMware-based virtualization solution. The changed licensing situation carried the risk of sharply rising costs.
* **Performance:** A performance-hungry application was too slow for customers on the existing OpenShift environment. The question was whether OpenShift on new hardware, closer to the metal, would deliver the required performance. Without this foundation, the modernization towards containers risked stalling.

## Solution Approach

In early 2026, tim&koko, together with Puzzle ITC and Centris, gathered the requirements for the new platform. In
workshops, the team worked out the future architecture, concepts, naming and disaster recovery principles.

### Architecture

The platform is based on an OpenShift bare metal cluster stretched across three zones:

* **3 control plane nodes** and **3 infra nodes**, one per zone
* **9 worker nodes**, three per zone
* **OpenShift Virtualization** and **Hosted Control Planes** to run smaller virtual clusters on the bare metal platform
* A similar cluster in the backup data center that takes over the workload in a disaster recovery scenario

The Hosted Control Planes approach brings several benefits:

* Several smaller virtual clusters can be run flexibly and with minimal overhead on the bare metal platform.
* Hardware resources are utilized more efficiently.
* The hosted clusters are easier to manage: virtual nodes are more lightweight than bare metal nodes, restarts are fast, and the nodes are "cattle", not "pets".

On the other hand, the team first has to get familiar with new concepts. In addition, the virtualization layer adds a
minimal overhead and, initially, extra complexity.

### Build-out and GitOps

Once the new hardware had been installed, the installation of the bare metal clusters began. In parallel, the GitOps
setup for the bare metal and hosted clusters was built and the platform components were configured. The hosted
clusters were then sized, designed and provisioned based on the GitOps automation.

### Migration and operations

Together with the development teams, the migration of workloads from the old to the new platform was planned and
started. At the same time, operational topics such as monitoring, backup and recovery processes, and lifecycle
processes were set up and rehearsed.

## Results

* The production bare metal platform went live in November 2026 after five months of build-out and was handed over to operations.
* The first production workload has already been migrated. All workloads are scheduled to run on the new platform by Q1 2027.
* The deployment of the platform components and the hosted clusters is fully GitOps-based – traceable, with Git as the single source of truth.

## Client Testimonial

## Conclusion & Lessons Learned

* **Requirements:** Covering the requirements of all development teams was one of the biggest challenges of the project.
* **Always test backup and restore thoroughly:** When testing the etcd restore on the engineering bare metal cluster, it turned out that the process documented by the vendor had gaps. Instead of the expected 40 minutes, the restore took several hours of debugging and fixing.
* **Infrastructure know-how is essential:** This knowledge has to be built up within the team. Thanks to deep infrastructure know-how, many gaps could be closed.
* **Flexibility vs. complexity:** The platform is very flexible and designed for automation and standardization. This comes at the cost of the complexity of Hosted Control Planes, which becomes much easier to understand with a clean GitOps setup.

Do you face similar challenges or want to learn more about OpenShift on bare metal, OpenShift Virtualization or Hosted Control Planes? Get in touch with us for a no-obligation conversation:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">contact tim&koko</a>
