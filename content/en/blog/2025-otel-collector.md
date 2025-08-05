---
title: "Understanding OpenTelemetry Collectors in Kubernetes"
slug: "otel-collector"
description: ""
date: 2025-05-08T00:00:00+00:00
lastmod: 2025-05-08T00:00:00+00:00
draft: false
images: ["images/blog/otel/tk-blogpost-otel-1200x630.png"]
Sitemap:
Priority: 0.92

categories: ["Technologie", "OpenTelemetry", "Kubernetes"]
authors: []
additionalblogposts: [ 'opentelemetry-introduction', 'otel-autoinstrumentation']

post_img: "images/blog/otel/tk-blogpost-otel-1500x1000.png"
img_border: true
lead: "As part of our deep dive into OpenTelemetry, we now turn our attention to the OpenTelemetry Collector. The Collector is a crucial component in OpenTelemetry’s architecture, providing a centralized mechanism to receive, process, and export telemetry data. In a Kubernetes-native environment, the OpenTelemetry Operator simplifies the deployment and management of the Collector."
---

### What is the OpenTelemetry Collector?

The OpenTelemetry Collector is a vendor-agnostic service that helps collect, process, and export telemetry data (logs, metrics, and traces). It acts as a bridge between instrumented applications and observability backends like Jaeger, Prometheus, or OpenSearch.

With a Collector in place, applications don’t need to export telemetry data directly to a backend. Instead, they send data to the Collector, which can process, filter, and forward it to multiple destinations. This decoupling makes observability pipelines more flexible and manageable.

### Deploying the OpenTelemetry Collector in Kubernetes

Since we’re working with the OpenTelemetry Operator, deploying a Collector is straightforward using a Kubernetes `OpenTelemetryCollector` Custom Resource (CR).

#### Prerequisites

* A Kubernetes cluster with the OpenTelemetry Operator installed.
* `kubectl` installed.
* `otel-cli` installed.

#### Step 1: Define a Simple Collector Configuration

Create a file named `otel-collector.yaml`:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
  namespace: otel
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
      debug:
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
```

This configuration does the following:

* Receives telemetry data via OTLP over HTTP and gRPC.
* Batches the received telemetry data for efficiency.
* Logs traces as output (useful for debugging before forwarding data to a real backend).

#### Step 2: Apply the Collector Configuration

Deploy the Collector using:

```sh
kubectl apply -f otel-collector.yaml
```

Verify the deployment:

```sh
kubectl get pods -n otel
```

#### Step 3: Sending Test Data to the Collector

To test the setup, you can use `otel-cli` or `grpcurl` to send test traces to the Collector:

```sh
otel-cli exec --endpoint http://otel-collector.otel.svc:4318/v1/traces --service my-test-app --name "test-span"
```

You should see trace data logged in the Collector’s output:

```sh
kubectl logs deployment/otel-collector -n otel
```

### Conclusion

The OpenTelemetry Collector simplifies telemetry data collection and forwarding in Kubernetes-based platforms. By deploying a Collector with the OpenTelemetry Operator, you gain a scalable and centralized way to manage observability data. In upcoming posts, we’ll explore advanced configurations and integrations, such as forwarding telemetry data to backend storage solutions.

Happy tracing!
