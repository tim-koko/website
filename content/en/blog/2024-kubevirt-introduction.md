---
title: "KubeVirt Journey - Introduction to the Management of Virtual Machines on Kubernetes"
slug: "kubevirt-introduction"
description: ""
date: 2024-09-09T00:00:00+00:00
lastmod: 2024-09-09T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt/tk-blogpost-kubevirt_share-image.jpg"]
img_border: true
Sitemap:
Priority: 0.9

additionalblogposts: [ 'kubevirt-training', 'kubevirt-usecases']

categories: ["Technology", "KubeVirt", "Kubernetes"]
authors: ['christof-luethi']
post_img: "images/blog/kubevirt/tk-blogpost-kubevirt.jpg"
lead: "KubeVirt is a project that allows running traditional VMs on container platforms such as Kubernetes."
---

### What is KubeVirt

KubeVirt is a technology that makes it possible to run traditional VM workloads on the same infrastructure as containerized
workloads. We are convinced that containers will not completely replace traditional VM workload. For this reason, we have
taken a closer look at the technology and examined the extent to which KubeVirt can replace existing virtualization solutions.
In the KubeVirt blog post series, we will investigate on the various aspects of the technology.

KubeVirt is a Kubernetes extension based on the operator pattern. It was initiated by Red Hat in 2016 and is available as
open-source software since 2017. Since 2019, the project is part of the Cloud Native Computing Foundation (CNCF).

### Differences between virtual machines and containers

Virtual machines (VMs) and containers are both technologies used to isolate systems or applications in an IT
infrastructure. However, they differ in fundamental aspects.

{{< svg "assets/images/blog/kubevirt/vm-container-workload.svg" >}}

#### Virtual Machines

- A VM contains a complete operating system often referred to as guest OS. Besides that, a VM also contains all the libraries and dependencies required to run an application.
- VMs require a hypervisor to run. A hypervisor enables the creation and management of virtual machines by allowing multiple operating systems to run concurrently on a single physical host.
- As each VM has its own operating system, VMs offer a high degree of isolation. However, this isolation also leads to higher resource consumption and reduces the startup time.
- Virtual machines are less portable. They often depend on specific hypervisors or infrastructure. Therefore, changing Infrastructure or the used virtualization solution can be complex and expensive.

#### Containers

- Containers share the host operating system (kernel) and do not require their own operating system. Therefore, they only contain libraries and dependencies for running the application.
- Containers are lightweight and do not require a hypervisor.
- Containers are less isolated and share the host operating system. Security vulnerabilities in the kernel can affect all containers on a host. As containers do not need to start their own operating system, they benefit from reduced resource consumption and startup time.
- Containers are highly portable and can be operated on different platforms. Whenever a container runtime is available, you may migrate and run your container without extra effort.

### How KubeVirt works

KubeVirt is a Kubernetes Operator that extends Kubernetes with additional functionality. It introduces new Custom Resource Definitions (CRDs) which allow the specification of a virtual machine as a Custom Resource (CR) in a declarative approach.

{{< svg "assets/images/blog/kubevirt/operator.svg" >}}
<br /><br />

KubeVirt relies on the KVM virtualization layer for running and managing virtual machines. Kernel-Based Virtual Machines (KVM)
is an open-source technology residing in the Linux kernel. This allows Linux to be used as a complete virtualization
system. KVM was released in kernel 2.6.20 (2007) and is now the battle-tested and trusted base layer for many
virtualization platforms. Virtualizations with KVM often use additional technologies such as QEMU and Libvirt, which
simplify the handling of virtual machines.

{{< svg "assets/images/blog/kubevirt/kvm-vms.svg" >}}

KubeVirt makes use of the fact that virtual machines with KVM are implemented as regular Linux processes. These processes
are encapsulated and isolated using Linux control groups (cgroups) and Namespaces in the Linux kernel in the same way as
they are used for container workloads.

### KubeVirt Architecture

In addition to the new Kubernetes Custom Resource Definitions (CRDs), KubeVirt also includes various runtime components.

{{< svg "assets/images/blog/kubevirt/kubevirt-architecture.svg" >}}

#### virt-controller

The virt-controller monitors the created and existing virtual machine definitions. Beside others, these are the
Custom Resources (CR) VirtualMachine and VirtualMachineInstance. If a new definition of a virtual machine is created,
the virt-controller delegates the creation of a pod for the virtual machine instance and assigns it to a kubernetes node.

#### virt-api

The virt-api provides a RESTful API for requests relating to the creation, validation and management of virtual machines.

#### virt-handler

The virt-handler is executed as a DaemonSet on each Kubernetes node. It is responsible for configuring the pod according
to the VM definition and ensuring the state of the VM is according to the definition. If a change is detected, it instructs
the virt-handler container to perform the necessary actions required to reach the desired state.

#### virt-launcher

The virt-launcher is a container that is executed within the VM pod. It is responsible for starting and monitoring the VM using a local Libvirtd instance.

#### libvirtd

Libvirt provides a low-level virtualization architecture and interface to the kernel. This is used to manage the lifecycle of the VM process.

### What can KubeVirt be used for?

The use of virtual machines has become indispensable these days. KubeVirt can be used for many use cases requiring a
virtual machine.

Below are a few examples of use cases for KubeVirt. We will elaborate on them in more detail in another blog post.

- Convergence of the technical infrastructure
- Simplification and standardization of the workflow due to reusable pipelines and tooling during the development
- Running the VM workload side by side with Container workload while transitioning or migrating traditional applications to containers.
- Use and direct access to dedicated hardware such as graphics cards or network interfaces
- Kubernetes-as-a-Service (KaaS)
- No vendor lock-in and no license costs

### Enterprise Solution: Red Hat OpenShift Virtualization

The KubeVirt project was initiated by Red Hat and is still being strongly developed and pushed by Red Hat. Red Hat
offers this technology as Red Hat Openshift Virtualization which is part of the Red Hat OpenShift product. Depending on your need,
this offers you the possibility to use the community-supported version KubeVirt or the commercial product with
enterprise-grade support from Red Hat.

{{< custom-image "../images/redhat.png" "250" >}}
<br /><br />

### Summary

KubeVirt is an interesting alternative to existing virtualization solutions. The focus is not just on the one-to-one
replacement of existing virtualization solutions, but also on the transition of VM workload into a modern environment, which can
be managed with the same tools and workflows known from the container world. By standardizing the operating infrastructure
and the convergence of workflows and tooling, KubeVirt helps to lower operating costs and reduce the complexity of the
system and product landscape. Free access to the open-source project and the large and growing community helps
to avoid a vendor lock-in. Where it is needed, Red Hat and Red Hat OpenShift Virtualization can be chosen as a strong
partner for enterprise customers.

### Want to learn more?

We are happy to answer any questions you may have. You can reach us best at [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch)&nbsp;or on [LinkedIn](https://www.linkedin.com/company/tim-koko).

If you want to know even more, we will share our experiences with the community at the following meetup:

- 28.11.2024 - 16:00: [Cloud Native Switzerland Meetup](https://www.meetup.com/cloud-native-computing-switzerland/events/302784454) in Lucerne

We also offer you the following opportunities to learn more about KubeVirt or OpenShift Virtualization:

- [tim&koko labs](https://tim-koko.ch/en/labs/): Get to know the basics of KubeVirt in one afternoon and apply them directly in practical hands-on labs.
- [KubeVirt Basics Training](https://acend.ch/en/trainings/kubevirt/): Two-day varied training with presentations and hands-on labs.
- [OpenShift Virtualization Accelerator Package](https://tim-koko.ch/en/services/openshift-virtualization-accelerator/): We help you explore the possibilities of OpenShift Virtualization and find out how high the potential for a new or parallel strategy could be.
