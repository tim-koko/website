---
title: "What is Argo Events? And why it can be compared to a motion detector"
slug: "argoevents-what-is"
description: ""
date: 2026-09-09T00:00:00+00:00
lastmod: 2026-09-09T00:00:00+00:00
draft: false
images: ["images/blog/argocd/argocd-what-is-1200x630.png"]
img_border: true
Sitemap:
  Priority: 0.9

additionalblogposts: [ 'kubevirt-whatis', 'argocd-what-is', 'kubernetes-hotel' ]

categories: ["Technology", "Kubernetes", "ArgoCD"]
authors: ['miriam-streit']
post_img: "images/blog/argocd/argocd-what-is-1500x1000.png"
lead: "While Argo CD manages state, clean standards are often lacking for events from the outside world: custom receiver apps create security risks and clutter. How can event-driven actions be managed just as declaratively as GitOps state?"
---

With Argo Events. As a logical addition to Argo CD, the tool transforms the cluster into an event-driven platform—fully automated, declarative, and without script sprawl.

### The Problem: The "Glue Code" Swamp

Kubernetes is excellent for managing containers. But as soon as applications need to react to events from the outside world, standard resources quickly fall short.

Typical scenarios in everyday cloud-native operations:

* A new file is uploaded to an S3 bucket and needs to be processed.
* A Git event or a webhook from an external tool arrives.
* A message lands in a Kafka topic or a message broker.

How do many teams solve these requirements today? They write their own small Flask or Python apps as webhook receivers, set up polling containers, or maintain countless CronJobs. This self-written "glue code" has to be built, secured, scaled, and maintained. If the developer who wrote the script leaves or is unavailable, troubleshooting in an emergency becomes a game of patience. An unmanageable script sprawl develops in the cluster.

### The Solution: What is Argo Events?

In the [first part](https://tim-koko.ch/en/blog/argocd-what-is/) of our series, we saw how **Argo CD** continuously reconciles the *desired state* of the infrastructure. **Argo Events** is the logical partner for the other side of the coin: it controls the *actions* (events) triggered by external stimuli.

You can think of Argo Events like a **smart home motion detector**: the sensor on the wall registers movement at the door (EventSource), sends the signal across the home network (EventBus), checks whether it's already dark outside (Sensor), and turns on the light if so (Trigger). In the exact same way, Argo Events reacts to stimuli from the outside world—such as a file upload or a webhook—and automatically executes the appropriate action in the cluster.

Argo Events is a declarative, event-driven automation framework for Kubernetes. Instead of writing custom code to receive events, event sources and reactions are defined simply as Kubernetes resources (Custom Resources).

It strictly decouples the event producer (e.g., a GitHub webhook) from the event processor (e.g., a Kubernetes Job). The result: not a single line of custom glue code needed.

### The Architecture: The 4 Building Blocks of Argo Events

The inner workings of Argo Events are based on four clear components that seamlessly mesh together:

* **1. EventBus:** The foundation and transport path in the cluster. It acts as an internal messaging network (usually based on NATS JetStream) that routes events securely and with high availability between EventSources and Sensors.
* **2. EventSource:** Defines *where* an event comes from. Argo Events supports over 20 event sources out of the box—including Webhooks, MinIO, Kafka, GCP PubSub, AWS SQS/SNS, GitHub/GitLab, Calendar, Slack, or K8s Resources.
* **3. Sensor:** The filter and decision-maker. It listens to the EventBus, evaluates conditions (e.g., *"Is the payload content correct?"*), and decides whether an action should be triggered.
* **4. Trigger:** The actual action inside the Sensor. As soon as the Sensor gives the green light, the Trigger executes the result (e.g., creating a K8s Job or triggering an Argo CD Sync).

#### Architecture Workflow

{{< custom-image "../images/argocd/argo-events-architecture.png" >}}

Image source: [https://argoproj.github.io/argo-events/concepts/architecture/](https://argoproj.github.io/argo-events/concepts/architecture/)

### A Simple Example: From Webhook to Kubernetes Job

> **Prerequisite:** Argo Events (including Argo Events CRDs and controllers) must already be installed in the cluster.

The following example demonstrates all **4 building blocks** in practice. We receive a webhook secured by a token and automatically start a Kubernetes Job.

#### 1. EventBus (The Transport Network)

First, we define the EventBus in the namespace. It provides the JetStream infrastructure through which events flow:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventBus
metadata:
  name: default
  namespace: argo-events
spec:
  jetstream:
    version: latest
```

#### 2. EventSource (Webhook with Secret Validation)

The `EventSource` opens an endpoint. For security reasons, we validate incoming requests directly against a Kubernetes Secret (header token):

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: webhook-eventsource
  namespace: argo-events
spec:
  eventBusName: default
  service:
    ports:
      - port: 12000
        targetPort: 12000
  webhook:
    example-endpoint:
      port: "12000"
      endpoint: /payload
      method: POST
      # Security aspect: Token validation in the header
      authSecret:
        name: webhook-secret
        key: token
```

#### 3. & 4. Sensor and Trigger (Filter & Target Action)

The `Sensor` listens to the `EventBus`, connects to the `EventSource`, and executes the defined `Trigger` upon success:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: webhook-sensor
  namespace: argo-events
spec:
  eventBusName: default
  dependencies:
    - name: webhook-dep
      eventSourceName: webhook-eventsource
      eventName: example-endpoint
  triggers:
    # The trigger is the fourth component
    - template:
        name: k8s-job-trigger
        k8s:
          operation: create
          source:
            resource:
              apiVersion: batch/v1
              kind: Job
              metadata:
                generateName: webhook-job-
              spec:
                template:
                  spec:
                    containers:
                      - name: process
                        image: alpine:latest
                        command: ["echo", "Webhook processed securely!"]
                    restartPolicy: Never
```

**The process at a glance:**
An HTTP POST hits the **EventSource** (2) -> The secret is validated -> The event is placed on the **EventBus** (1) -> The **Sensor** (3) reads the event and checks dependencies -> The **Trigger** (4) starts the K8s Job.

### Typical Use Cases: When is Argo Events Worth It?

In modern cloud-native development, there are recurring scenarios where switching from custom, self-built code to Argo Events yields immediate benefits:

* **Event-driven data processing:** Instead of running long-lived containers that poll folders or buckets every minute, Argo Events reacts directly to S3 file uploads. Processing pods are started in a resource-efficient manner only when new data is actually present.
* **Event-Driven GitOps & Deployment Triggers:** Notifications from external systems (such as ticketing systems, monitoring alerts, or webhooks from CI systems) can be used to trigger targeted deployments or cluster synchronizations via Argo CD.
* **Webhooks without maintenance overhead:** Teams save themselves the effort of writing, patching, and managing custom Python, Go, or Node containers whose sole purpose is to serve as webhook receivers.
* **Security & Compliance Requirements:** Enterprise requirements for authentication and authorization can be covered declaratively:
  * *Authentication:* HMAC signatures (e.g., GitHub Webhook Secret Validation) or token checks are handled directly by the `EventSource`.
  * *Transport Encryption:* Communication over the `EventBus` is secured via TLS.
  * *Fine-grained RBAC:* Using Kubernetes Service Accounts strictly limits which resources a `Sensor` Trigger is allowed to create in the cluster (Least Privilege Principle).

### Conclusion & Outlook

Argo Events ends the era of cobbled-together scripts and custom event receivers. Together with Argo CD, an architecture emerges that not only keeps its state under control, but also reacts dynamically, securely, and without maintenance overhead to stimuli from the environment.

The best part: a trigger in Argo Events is by no means limited to simple Kubernetes Jobs. When event processing requirements become more complex—for example, when multi-stage data pipelines, parallel test runs, or complex Directed Acyclic Graphs (DAGs) are needed—the next major building block of the Argo ecosystem comes into play.

*In the next part of our blog series, we will focus on **Argo Workflows**—the powerful workflow engine for Kubernetes.*

*Whether you need strategic architecture consulting or hands-on support directly in your cloud-native project: Feel free to reach out to our team to eliminate script clutter from your clusters for good.*
