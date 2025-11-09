---
title: "F5-Integration mit OpenShift"
slug: "f5-integration-openshift"
description: "Wie die F5 Container Ingress Services für OpenShift genutzt werden können"
date: 2024-11-12T00:00:00+00:00
lastmod: 2024-11-12T00:00:00+00:00
draft: false
images: ["images/blog/openshift-f5/tk_blogpost-rh-openshift-f5-1200x630.jpg"]
Sitemap:
  Priority: 0.8

categories: ["Technology", "OpenShift", "Network", "F5"]
authors: []
img_border: true
post_img: "images/blog/openshift-f5/tk_blogpost-rh-openshift-f5-1500x1000.jpg"
lead: "The F5 CIS Operator is an interesting option for making applications automatically accessible via an enterprise load balancer. However, the integration may not work as might be expected at first glance."
---

Thanks to its API-first approach, practically everything can be automated on Kubernetes. However, when it comes to integrating a Kubernetes cluster into an existing IT landscape - especially on-premises - the same can rarely be said of the surrounding systems.\
Load balancers are a typical candidate for this. For a customer, we were able to automate their management on OpenShift using the F5 CIS Operator.

### Tunnels or routes

In addition to clarifying other basic [requirements](https://clouddocs.f5.com/containers/latest/userguide/cis-installation.html#prerequisites), the question of how the F5 instance should be connected to OpenShift pops up before installation. There are basically two options available:

* The F5 instance is integrated into the cluster using VXLAN tunnels. To do this, VXLAN tunnels must be created on the F5 instance and a host subnet on OpenShift.
* The CIS operator sends the F5 instance the necessary information for entering static routes. The load balancer thus knows under which node IP address a pod can be reached.

### ConfigMaps or CRDs

The F5 CIS Operator can be installed in such a way that it pays attention to Ingress or Route resources, or to ConfigMaps, or that it runs in CRD mode and only takes the corresponding CRDs into account. [A technical article by Michael O'Leary (F5)](https://community.f5.com/kb/technicalarticles/my-first-crd-deployment-with-cis/291159) provides a good summary of the advantages and disadvantages:

#### Ingress

* **Advantage:** Native resource kind
* **Limitation:** Hardly expandable
* **Summary:** Was the first possible configuration method, but CRDs are recommended

#### ConfigMap

* **Advantage:** Offers the most configuration options
* **Limitation:** The most complex method
* **Summary:** Only use if the desired configuration cannot be achieved with CRDs

#### CustomResourceDefinitions

* **Advantage:** Native Kubernetes resources
* **Limitation:** No major disadvantages but some minor requirements
* **Summary:** The first choice if possible

The choice should therefore be made in favor of CRDs whenever possible. The only disadvantage is that the CRDs are not installed and maintained by the operator on OpenShift as usual. When updating the Operator, you must therefore always ensure that the CRDs are also updated.

### TransportServer and VirtualServer

Two of the CRDs introduced by the F5 CIS Operator contain the [TransportServer](https://clouddocs.f5.com/containers/latest/userguide/crd/transportserver.html) and [VirtualServer](https://clouddocs.f5.com/containers/latest/userguide/crd/virtualserver.html) definitions. Both resource types are used to create a virtual server on the F5 instance. A VirtualServer is used for layer 7 loadbalancing, the TransportServer for layer 4.

### Integration

It was important that the integration with the load balancers doesn't have any impact on how users work with Ingress or Route resources on OpenShift. Everything should just work as usual, especially the automated management of certificates. For this reason, the standard setup was defined as follows:

* A TransportServer is created for each namespace - a namespace corresponds to an application and stage. Among other things, this defines the IP address under which the application will be accessible.
* An IngressController with namespace selector is also created for each namespace. The IngressController creates HAProxy pods as usual, as well as an associated service in the `openshift-ingress` namespace.
* The TransportServer is now attached to the IngressController by defining the Ingress service on the TransportServer as a backend pool.

Incoming requests therefore arrive at the desired application as follows:

```text
Client -> F5 load balancer -> HAProxy on OpenShift -> Application
```

Of course, the additional hop via the IngressController or HAProxy does not have to be implemented in every case. For applications that, for example, take on a gateway function themselves, it can make sense to send requests from the load balancer directly to the pods in order to simplify troubleshooting and also slightly increase performance.

## Do you need help or guidance?

Do you need help with the integration of F5 Load Balancers or do you have general questions about Kubernetes or OpenShift? Don't hesitate to contact us.
