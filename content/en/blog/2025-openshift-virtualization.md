---
title: "OpenShift Virtualization"
slug: "openshift-virtualization"
description: ""
date: 2025-01-09T00:00:00+00:00
lastmod: 2025-01-09T00:00:00+00:00
draft: false
images: ["images/blog/openshift-virtualization/tk-blogpost-ocp-virtualization-some.jpg"]
img_border: true
Sitemap:
  Priority: 0.9

additionalblogposts: [ 'kubevirt-introduction', 'kubevirt-usecases', 'kubevirt-training' ]

categories: ["Technology", "KubeVirt", "Kubernetes"]
authors: []
post_img: "images/blog/openshift-virtualization/tk-blogpost-ocp-virtualization.jpg"
lead: "Red Hat OpenShift Virtualization, as an extension of Red Hat OpenShift, offers a way to easily and efficiently integrate virtual machines into your existing OpenShift environment in a standardized way. It allows traditional virtualization solutions and the cloud native world to be merged into a reliable, consistent and standardized hybrid cloud application platform."
---

In the KubeVirt [KubeVirt Journey - Introduction to the Management of Virtual Machines on Kubernetes]({{< ref "blog/2024-kubevirt-introduction" >}}) series, we have already reported on the benefits, applications and concepts of KubeVirt. The project is being further developed and maintained as open source by the Cloud Native Computing Foundation (CNCF). Similar to OpenShift Pipelines or OpenShift GitOps, OpenShift Virtualization seamlessly integrates the upstream project KubeVirt into the OpenShift platform.

### Advantages of Red Hat OpenShift Virtualization

By implementing OpenShift Virtualization in your OpenShift cluster, you can benefit from the following advantages:

* **Assisted migration:** OpenShift Virtualization comes with an in-house [migrations toolkit](https://developers.redhat.com/products/mtv/overview) to easily migrate from other hypervisors.
* **Faster to production:** OpenShift Virtualization can support and simplify infrastructure provisioning through self-service portals and seamless integration with CI/CD pipelines. Developers: OpenShift Virtualization makes it easier for developers to create, test and integrate VMs into their systems.
* **Unified platform:** OpenShift Virtualization integrates VMs in the same way as containers, pipelines and serverless workloads. The integration into the OpenShift environment allows a simple and clear way to manage virtual machines in a standardized way.

<br/>

{{< custom-image "../images/openshift-virtualization/migration-ui.png" 1000 >}}

<br/><br/>

### Installation and features

OpenShift Virtualization is installed as an operator on the OpenShift platform. The operator can be installed and used via the OperatorHub. The installation activates additional CustomResourceDefinitions (CRDs) and features in the OpenShift cluster.
These features include:

* Creating and managing virtual machines
* Connection to VMs with UI or CLI tools
* Cloning and importing existing VMs
* Management of network interface controllers and storage on VMs
* Live migration of VMs via OpenShift nodes
* Migration Toolkit for Virtualization

### Want to learn more?

We are happy to answer any questions you may have. You can reach us best at [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch)&nbsp;or on [LinkedIn](https://www.linkedin.com/company/tim-koko).

We also offer you the following opportunities to learn more about KubeVirt or OpenShift Virtualization:

* [tim&koko labs](https://tim-koko.ch/en/labs/): Get to know the basics of OpenShift Virtualization in one afternoon and apply them directly in practical hands-on labs.
* [KubeVirt Basics Training](https://acend.ch/en/trainings/kubevirt/): Two-day varied training with presentations and hands-on labs.
* [OpenShift Virtualization Accelerator Package](https://tim-koko.ch/en/services/openshift-virtualization-accelerator/): We help you explore the possibilities of OpenShift Virtualization and find out how high the potential for a new or parallel strategy could be.
