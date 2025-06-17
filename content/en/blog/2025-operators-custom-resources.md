---
title: "Kubernetes Operators and Custom Resources: Simplifying Complexity"
slug: "operators-custom-resources"
description: ""
date: 2025-03-11T00:00:00+00:00
lastmod: 2025-03-11T00:00:00+00:00
draft: false
images: ["images/blog/operator-custom-resources/tk-blogpost-operator-3000x2000.png"]
img_border: true
Sitemap:
Priority: 0.9

categories: ["Technologie", "OpenTelemetry", "Kubernetes"]
authors: []
post_img: "images/blog/operator-custom-resources/tk-blogpost-operator-3000x2000.png"
lead: "Kubernetes is a powerful system, but managing complex applications often requires more than just built-in resources. This is where Operators and Custom Resources come into play. They extend the Kubernetes API and bring automation to the next level, enabling native management of specialized software. In this post, we’ll explore how the OpenTelemetry Operator works, the CustomResourceDefinitions (CRDs) it introduces, and why Operators are an essential part of modern Kubernetes environments."
--- 

Kubernetes is built on a powerful automation model called the **Controller Pattern**, which ensures that the actual state of the cluster always matches the desired state. Every resource in Kubernetes—whether it's a **Deployment**, **Service**, or **ConfigMap**—is continuously managed by a **Controller**. These Controllers operate in a loop, constantly **observing**, **comparing**, and **reconciling** the cluster state.

{{< svg "assets/images/blog/operator-custom-resources/operator-pattern.svg" >}}
<br>
<br>

Operators follow this same principle but extend it beyond built-in Kubernetes objects. Instead of just managing Pods or ReplicaSets, an Operator defines **custom resources** and uses a Controller to manage complex applications like databases, monitoring systems, or observability tools. This means that an Operator doesn't just deploy software—it actively manages its lifecycle, handling tasks like configuration updates, scaling, and version upgrades, all while ensuring the system stays in the desired state.

## Why Are Operators and Custom Resources Essential?

Kubernetes was designed to be extensible. While built-in resources like Deployments, Services, and ConfigMaps handle standard workloads, many applications require more sophisticated automation—think of observability tools, databases, and service meshes. To enable this, Operators introduce Custom Resources (CR) by defining CustomResourceDefinitions (CRD) into Kubernetes. A CRD extends the Kubernetes API by specifying the schema and behavior of a new resource type. Once the CRD is installed in the cluster, users can create instances of the custom resource, and the Operator ensures they are managed correctly.

Take **OpenTelemetry**, for example. Instead of manually deploying and configuring collectors, exporters, and instrumentation, the **OpenTelemetry Operator** automates everything using Kubernetes-native **Custom Resources**.

### How the OpenTelemetry Operator Works

The **OpenTelemetry Operator** introduces these **Custom Resource Definitions (CRDs)** that simplify the deployment and management of observability components in Kubernetes:

* **OpenTelemetryCollector**: Defines and manages OpenTelemetry Collector instances, including pipelines for tracing, metrics, and logs.
* **Instrumentation**: Enables auto-instrumentation for applications, injecting OpenTelemetry SDKs automatically.

With these CRDs, users declare their observability setup in YAML manifests, and the OpenTelemetry Operator ensures that everything is deployed and configured correctly.

### Example Custom Resources in Action

<br>

#### 1. Deploying an OpenTelemetry Collector

To deploy an OpenTelemetry Collector using the Operator, you create an **OpenTelemetryCollector** custom resource:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
  namespace: observability
spec:
  mode: deployment
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
          http:
    processors:
      batch:
    exporters:
      logging:
      otlp:
        endpoint: "http://tempo:4317"
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [logging, otlp]
```

This ensures that:

* An OpenTelemetry Collector is deployed as a **Kubernetes Deployment**.
* It receives telemetry data over OTLP (OpenTelemetry Protocol).
* Data is processed in batches and exported to **both logging and an OTLP endpoint (like Grafana Tempo)**.

<br>

#### 2. Enabling Auto-Instrumentation

Instead of modifying application code, the OpenTelemetry Operator can **auto-instrument** workloads for observability. With an **Instrumentation** CRD, auto-instrumentation can be enabled for Java applications:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: java-instrumentation
  namespace: observability
spec:
  exporter:
    endpoint: "http://otel-collector:4317"
  propagators:
    - tracecontext
    - baggage
    - b3
```

This ensures that:

* Java applications in the cluster automatically receive OpenTelemetry instrumentation.
* All traces are exported to the OpenTelemetry Collector without modifying application code.

<br>

#### 3. Applying Auto-Instrumentation to a Deployment

Once the **Instrumentation** CR is in place, you can apply it to an application Deployment by adding an annotation:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-java-app
  namespace: observability
  annotations:
    instrumentation.opentelemetry.io/inject-java: "true"
spec:
  template:
    spec:
      containers:
        - name: app
          image: my-java-app:latest
```

Now, OpenTelemetry instrumentation is **injected automatically** when the application starts.

### Why This Matters

Without the OpenTelemetry Operator, setting up observability in Kubernetes would require manually configuring collectors, updating application code for instrumentation, and managing deployments separately. The Operator eliminates these complexities by making OpenTelemetry **Kubernetes-native**.

## Handling Versions and CRD Evolution

One of the key benefits of Operators is their ability to manage version upgrades. Observability tools evolve, and so do their configurations. A well-designed Operator ensures smooth transitions between versions, applying best practices while avoiding breaking changes.

Kubernetes **Custom Resource Definitions (CRDs)** support versioning to help with this. When a CRD evolves (for example, OpenTelemetry adds a new field for a configuration option), older versions of the CR still need to be supported. This is where **conversion webhooks** come into play.

### How Conversion Webhooks Work

A **conversion webhook** is a mechanism that allows Kubernetes to automatically translate older versions of a Custom Resource to the latest schema. When a user requests an older CR version, Kubernetes calls the webhook, which converts it to the latest format.

For example, if the `OpenTelemetryCollector` CRD initially used `spec.pipelines.traces.receivers` but later changed to `spec.tracing.receivers`, a conversion webhook would handle requests for both formats, ensuring compatibility across versions.

This is crucial for production environments where existing configurations should continue working even as the Operator evolves.

## Conclusion

Operators and Custom Resources have transformed Kubernetes into a full-fledged application management platform. The OpenTelemetry Operator is a great example of how Operators **simplify deployment, automate configuration, and enable seamless upgrades** for observability.

If you're running OpenTelemetry in Kubernetes, using the OpenTelemetry Operator ensures better automation, safe version upgrades, and a more maintainable observability stack.
