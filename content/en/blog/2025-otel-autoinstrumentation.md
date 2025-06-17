---
title: "Deep Dive into Auto Instrumentation for Java with the OpenTelemetry Operator in Kubernetes"
slug: "otel-autoinstrumentation"
description: ""
date: 2025-04-23T00:00:00+00:00
lastmod: 2025-04-23T00:00:00+00:00
draft: false
images: ["images/blog/otel/tk-blogpost-otel-1200x630.png"]
Sitemap:
Priority: 0.92

categories: ["Technologie", "OpenTelemetry", "Kubernetes"]
authors: []

post_img: "images/blog/otel/tk-blogpost-otel-1500x1000.png"
img_border: true
lead: "As part of our ongoing series exploring the OpenTelemetry ecosystem in Kubernetes-native environments, today we’ll look under the hood at one of its most powerful features: **auto instrumentation for applications via the OpenTelemetry Operator**."
# don't publish the page
_build:
  list: never
  render: never
---

If you're already familiar with the OpenTelemetry Operator and what it brings to the table (if not, check out [our previous post on Operators and Custom Resources](http://tim-koko.ch/blog/operators-custom-resources/)), this post will focus specifically on **how Java auto instrumentation works**, and how it integrates seamlessly in a Kubernetes workflow.

### What Is Auto Instrumentation?

Auto instrumentation means you can capture telemetry (traces, metrics) from your application **without changing its code**. For Java, this is achieved by injecting the OpenTelemetry Java Agent at runtime, which hooks into the JVM and automatically instruments supported libraries and frameworks (like Spring, gRPC, JDBC, etc.).

### How the OpenTelemetry Operator Enables Auto Instrumentation

The OpenTelemetry Operator makes this process Kubernetes-native. It uses **Custom Resource Definitions (CRDs)** to manage instrumentation lifecycle and configuration. Specifically, the `Instrumentation` CRD is the key component here.

When you define an `Instrumentation` resource, the Operator ensures that:

* The correct OpenTelemetry language agent (in this case, the Java agent) is available.
* The agent is injected into your application pods automatically using a Kubernetes **mutating webhook**.
* Environment variables like `OTEL_EXPORTER_OTLP_ENDPOINT` are configured based on your telemetry backend or OpenTelemetry Collector.

### Example Setup: Auto Instrumenting a Java App

Let’s walk through a practical example.

#### 1. Prerequisites

We assume the following are already installed in your Kubernetes cluster:

* OpenTelemetry Operator
* OpenTelemetry Collector (can be a basic one with just OTLP + debug exporters)
* A Java application (Spring Boot, Quarkus, etc.)

#### 2. Define an Instrumentation Resource

Here’s a minimal `Instrumentation` resource for Java:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: java-instrumentation
  namespace: otel
spec:
  exporter:
    endpoint: http://otel-collector:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1.0"
  java:
    image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:latest
```

This tells the Operator:

* Use the specified OpenTelemetry Java agent image.
* Inject trace headers using W3C formats.
* Export telemetry to a Collector running at `otel-collector:4317`.
* Sample all traces (`1.0` means 100%).

#### 3. Deploy a Java Application

Here’s a sample Deployment for a basic Java app:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
  namespace: otel
  labels:
    app: demo-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demo-app
  template:
    metadata:
      labels:
        app: demo-app
      annotations:
        instrumentation.opentelemetry.io/inject-java: "true"
    spec:
      containers:
        - name: demo-app
          image: your-java-app:latest
          ports:
            - containerPort: 8080
```

The key part here is the annotation:

```yaml
instrumentation.opentelemetry.io/inject-java: "true"
```

The Operator’s mutating admission webhook detects this and automatically:

* Injects the OpenTelemetry Java agent container into your pod.
* Sets `JAVA_TOOL_OPTIONS` to point to the agent.
* Passes required environment variables to the main container.

### What's Happening Behind the Scenes?

When your pod is created, the Operator intercepts the creation request and modifies the pod spec:

* A shared volume is mounted with the OpenTelemetry agent JAR.
* Your container is patched with the `JAVA_TOOL_OPTIONS` env var to include something like:

```sh
-javaagent:/otel-auto-instrumentation/javaagent.jar
```

This approach avoids modifying your Docker image and works with virtually any JVM-based application.

### Verifying It Works

If you’ve configured the OpenTelemetry Collector with a debug exporter, you should see traces printed in the Collector logs.

You can also query the Collector metrics endpoint (`:8888/metrics`) or export to a backend like Jaeger or Tempo for visualization.

### Wrapping Up

Auto instrumentation with the OpenTelemetry Operator provides an elegant, Kubernetes-native way to collect traces from your Java applications without touching application code. It’s built on mature primitives like Mutating Webhooks and CRDs, making it cleanly integrable into GitOps and CI/CD pipelines.
