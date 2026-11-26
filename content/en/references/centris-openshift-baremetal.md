---
title: "Centris AG – OpenShift on Bare Metal"
slug: "centris-openshift-on-bare-metal"
description: "OpenShift on bare metal for Centris AG: a three-zone platform with OpenShift Virtualization, Hosted Control Planes & GitOps. Live in 5 months. Read the full story!"
date: 2026-11-16T00:00:00+00:00
lastmod: 2026-11-16T00:00:00+00:00
draft: false
images: ["images/landing-pages/tk-giveaway-2024-1500x1000.png"]
Sitemap:
  Priority: 0.3
client: "Centris AG"
post_img: "images/landing-pages/tk-giveaway-2024-1500x1000.png"
img_border: false
lead: "Together with Puzzle ITC and Centris AG, tim&koko built a new Red Hat OpenShift platform on bare metal. The platform spans three zones and uses OpenShift Virtualization and Hosted Control Planes to flexibly run several virtual workload clusters. After five months of build-out, it went into production in November 2026."
techStack: "Red Hat OpenShift, OpenShift Virtualization, Hosted Control Planes, GitOps, Argo CD, Helm, Kustomize, Prometheus, Grafana, GitLab"
copy: "Image © Centris AG"
link: "https://www.centrisag.ch"
---

Centris AG's existing OpenShift clusters ran on a VMware-based virtualization solution whose changed licensing was causing increasingly high costs. At the same time, performance-hungry applications needed an environment closer to the hardware. Together with Puzzle ITC and Centris AG, tim&koko designed the architecture of the new platform, built the bare metal clusters and the hosted clusters entirely via GitOps, and actively helped shape operations. The platform has been in production since November 2026, and the first workloads have already been migrated.

## About Centris AG

Centris AG is a leading IT service provider for Swiss health and accident insurers. The company was founded in 1947 and
now employs over 300 people. Currently, 23 health and accident insurers with around 8,000 claims handlers and a total
of approximately 4.3 million insured persons rely on Centris AG's industry solutions. With its comprehensive expertise in the
development, integration, and operation of highly available IT solutions, Centris AG provides its customers with targeted
support in their digital transformation.

The core requirements include stability, availability, and security of
business-critical applications — including the Swiss Health Platform (SHP). With this open and cloud-based platform,
Centris AG connects players in the Swiss healthcare system and actively supports the digital transformation of health and
accident insurers.

## Challenge

Centris AG faced the task of putting its OpenShift environment on a new, future-proof foundation. In doing so, three key challenges had to be overcome:

* **Licensing costs:** Centris AG's existing OpenShift clusters were based on VMware vSphere. The changed licensing models carried the risk of sharply rising costs.
* **Time pressure:** The new platform had to be built within a short time. Only a few months were available from installing the hardware to production, which is why architecture, installation, automation and operational processes largely had to be driven forward in parallel.
* **Performance:** A performance-hungry application was too slow for customers on the existing OpenShift environment. It had to be proven that OpenShift on new hardware – and therefore closer to the metal – delivers the required performance. Without this proof, the container modernization risked stalling.

## Solution Approach

In early 2026, tim&koko, together with Puzzle ITC and Centris AG, gathered the requirements for the new platform. In workshops, the team worked out the future architecture as well as concepts for deployment, monitoring, backup and disaster recovery.

### Architecture

The platform is based on an OpenShift bare metal cluster stretched across three zones:

* **3 control plane nodes** and **3 infra nodes**, one per zone
* **9 worker nodes**, three per zone
* **OpenShift Virtualization** and **Hosted Control Planes** to run smaller virtual clusters on the bare metal platform
* A similar cluster in the backup data center that takes over the workload in a disaster recovery scenario

The Hosted Control Planes approach brings several benefits:

* Several smaller virtual clusters can be run flexibly and with minimal overhead on the bare metal platform.
* Hardware resources are utilized much more efficiently.
* The hosted clusters are easier to manage: virtual nodes are more lightweight than bare metal nodes, can be restarted quickly and follow the "cattle, not pets" principle.

At the same time, the chosen approach brought new challenges that the team first had to master:

* The team is now responsible for the entire stack – from the bare metal servers and the network configuration up to the hypervisor.
* Managing everything consistently via GitOps requires a shift in mindset in day-to-day business.

### Build-out and GitOps

Once the new hardware had been installed, the installation of the bare metal clusters began. In parallel, the GitOps setup for the bare metal and the hosted clusters was created, and the central platform components were configured. The hosted clusters were then sized, designed and provisioned fully automated via GitOps.

For a project of this size, the timeline was tight and the team was small – and not everyone involved had extensive experience with OpenShift on bare metal yet. That's why we didn't just support in an advisory role, but rolled up our sleeves and took on tasks hands-on to get the platform ready on schedule.

### Migration, operations and knowledge transfer

Together with the development teams, we planned and kicked off the migration of workloads from the previous to the new platform. In parallel, key operational topics such as monitoring as well as backup, recovery and lifecycle processes were defined and rehearsed.

To enable the internal team to operate and further develop the platform independently, we taught them the new concepts hands-on as part of an [Argo CD training]({{< relref "/services/cloud-native-training.md" >}}).

## Results

* After five months of build-out, the production bare metal platform went live in November 2026 and was successfully handed over to operations.
* The first production workload has already been migrated; all workloads are scheduled to run on the new platform by the end of Q1 2027.
* The deployment of all platform components and hosted clusters is fully GitOps-based – traceable, with Git as the single source of truth.

## Client Testimonial

«Lorem Ipsum»

**TBD**, Role

## Conclusion & Lessons Learned

The move from VMware to OpenShift on bare metal impressively shows how much flexibility a platform with OpenShift Virtualization and Hosted Control Planes offers: it is consistently designed for automation and standardization. While Hosted Control Planes come with a certain inherent complexity, a clean GitOps setup makes it easy to understand and manage. One of the biggest challenges of the project was bringing the diverse requirements of all development teams together.

A key takeaway from the project: backup and restore scenarios must always be tested thoroughly. When testing the etcd restore on the engineering bare metal cluster, for example, it turned out that the process documented by the vendor had gaps: instead of the expected 40 minutes, the restore required several hours of debugging and fixing. Hands-on tests like these show how essential deep infrastructure know-how is. Thanks to this experience, we were able to close crucial gaps – and this knowledge is now flowing step by step into the Centris AG team.

For us, this project is particularly exciting because we are building a platform from scratch and can use modern technologies such as OpenShift Virtualization, Hosted Control Planes and GitOps on bare metal. Working directly within the Centris AG team keeps communication paths short – which is how we were able to reach the goals we had set together.

Do you face similar challenges or want to learn more about OpenShift on bare metal, OpenShift Virtualization or Hosted Control Planes? Get in touch with us for a no-obligation conversation:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">contact tim&koko</a>
