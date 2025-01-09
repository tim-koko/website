---
title: "KubeVirt Journey - Potential and use cases of KubeVirt"
slug: "kubevirt-usecases"
description: ""
date: 2024-11-21T00:00:00+00:00
lastmod: 2024-11-21T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt/tk-blogpost-kubevirt_share-image.jpg"]
img_border: true
Sitemap:
Priority: 0.9

additionalblogposts: [ 'kubevirt-introduction', 'kubevirt-training']

categories: ["Technology", "KubeVirt", "Kubernetes"]
authors: ['christof-luethi']
post_img: "images/blog/kubevirt/tk-blogpost-kubevirt.jpg"
lead: "The use of virtual machines has become indispensable these days. In addition to replacing existing virtualization solutions, KubeVirt offers the potential to modernize infrastructures and workflows."
---

In the second blog post of our KubeVirt series (Part 1: [KubeVirt Journey - Introduction to the Management of Virtual Machines on Kubernetes]({{< ref "blog/2024-kubevirt-introduction" >}})),
we take a look at the use cases of KubeVirt. The technology has set itself the goal of redefining the use of virtual
machines with modern patterns. We at Tim&Koko are convinced that KubeVirt's cloud-native approach is the right way to
modernize infrastructures, workloads and workflows of traditional virtual machines.

Let's take a closer look at the potential of KubeVirt by looking at a few use cases.

### Standardization and modernization of the infrastructure

Completely different technological infrastructures are often set up and operated for virtual machines and container workloads.

{{< svg "assets/images/blog/kubevirt/infrastructure-convergence.svg" >}}
<br /><br />

By using Kubernetes as the basis for VM and container workloads, the tooling around the infrastructure can be standardized.
For example, log, monitoring and storage systems as well as networks can be merged. This eliminates the need to operate
two infrastructure stacks and their ecosystems. This has the advantage that the infrastructure is simplified and
operating costs can be saved through consolidation. At the same time, container platforms increase the flexibility and
portability of the workload, making it possible to react more quickly to changes.

### Standardization of the workflow

Beside the standardization of infrastructure and hardware components KubeVirt also has potential of standardizing the
workflow level. Familiar tools and workflows from the container world can be applied identically to virtual machines.
Virtual machines can be defined and managed declarative and infrastructures can be completely described and versioned
as YAML resources.

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: fedora-vm
spec:
  running: true
  template:
    metadata:
      labels:
        kubevirt.io/domain: fedora-vm
    spec:
      domain:
        devices:
          disks:
            - name: fedora-disk
              disk:
                bus: virtio
          interfaces:
            - name: default
              masquerade: {}
        resources:
          requests:
            memory: 1Gi
      networks:
        - name: default
          pod: {}
      volumes:
        - name: fedora-disk
          containerDisk:
            image: quay.io/containerdisks/fedora:40
```

One of the biggest advantages of a declarative definition and versioning is the reproducibility of environments. Changes
can thus be implemented in a consistent and traceable way. By integrating into automated processes such as CI/CD pipelines,
changes can be tested automatically, which ultimately increases the reliability of system deployment and maintenance.
Automation can also be used to reduce internal processes, manual steps and dependencies, resulting in faster deployment
of resources.

### Application migration

Whenever monoliths in VMs are migrated to container architectures, parallel operation is often necessary during the
migration. By operating the monolith as a KubeVirt VM, a standardized infrastructure can already be used during the
transition. This can ensure a more cost-effective and resource-efficient implementation of the migration.

{{< svg "assets/images/blog/kubevirt/application-migration.svg" >}}
<br /><br />

If it does not make sense to replace an application in a VM due to economic or technical aspects, operation on container
platforms can provide a better and easier integration of that applications with other container workload.

### Use and direct access to dedicated hardware

Normal container workloads often do not allow access to special hardware. Virtual machines have this capability. Using
KubeVirt, virtual machines can also gain direct access to host system devices. For examples direct access to network cards
or the use of dedicated graphics cards in VMs. Nvidia is a major driver of the KubeVirt project and uses KubeVirt for its Nvidia
GeForce Now. The advantage for companies lies in the more efficient and cost-effective use of resources and the increased
flexibility, as specialized devices can be dynamically assigned to the VMs.

### Kubernetes-as-a-Service (KaaS)

The Kubernetes on Kubernetes concept offers interesting use cases. Especially in scenarios where multi-tenancy and
good isolation are required. For example, a provider can offer isolated Kubernetes tenants based on virtual KubeVirt
machines on Kubernetes. These Kubernetes tenants can be scaled as required and expanded with additional virtual machines.
This allows tenants to be provisioned in a fast, central and completely automatic way. The strong isolation of VMs ensures
that required security aspects can be fulfilled.

### No vendor lock-in

The KubeVirt project is open source and is constantly developed by several large companies such as Red Hat, Nvidia and
Cloudflare. The KubeVirt community is currently growing rapidly. If the use of community-supported software is not an
option, Red Hat OpenShift Virtualization, for example, which is based on KubeVirt, can be used. Red Hat offers commercial
enterprise-grade support for Red Hat OpenShift Virtualization.

### Summary

KubeVirt is an interesting alternative to existing virtualization solutions. The aim of KubeVirt is not primarily the
one-to-one replacement of existing virtualization solutions. The full potential develops when the VM workload is defined
in such a way that it can be managed with the same tools and workflows of the container world. This allows companies to
standardize infrastructure and use resources more efficiently, thereby saving operational costs. Consolidation can also
reduce product diversity. Standardized tooling, automation and integration in CI/CD pipelines enhance the developer
experience and ensure that resources are available more quickly.

### Want to learn more?

We are happy to answer any questions you may have. You can reach us best at [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch)&nbsp;or on [LinkedIn](https://www.linkedin.com/company/tim-koko). You can find the exact details of the training on [acend's website](https://acend.ch/trainings/kubevirt/).

We also offer you the following opportunities to learn more about KubeVirt or OpenShift Virtualization:

* [tim&koko labs](https://tim-koko.ch/en/labs/): Get to know the basics of OpenShift Virtualization in one afternoon and apply them directly in practical hands-on labs.
* [KubeVirt Basics Training](https://acend.ch/en/trainings/kubevirt/): Two-day varied training with presentations and hands-on labs.
* [OpenShift Virtualization Accelerator Package](https://tim-koko.ch/en/services/openshift-virtualization-accelerator/): We help you explore the possibilities of OpenShift Virtualization and find out how high the potential for a new or parallel strategy could be.
