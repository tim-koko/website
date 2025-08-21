---
title: "Using Prometheus 3 OpenTelemetry Endpoint to Ingest OTLP Metrics in Kubernetes"
slug: "otel-prometheus-ingestion"
description: ""
date: 2025-08-13T00:00:00+00:00
lastmod: 2025-08-13T00:00:00+00:00
draft: false
images: ["images/blog/otel/tk-blogpost-otel-1200x630.png"]
Sitemap:
Priority: 0.92

categories: ["Technologie", "OpenTelemetry", "Kubernetes", "Prometheus"]
authors: []
additionalblogposts: [ 'opentelemetry-introduction', 'otel-collector', 'otel-autoinstrumentation']

post_img: "images/blog/otel/tk-blogpost-otel-1500x1000.png"
img_border: true
lead: "Prometheus 3 introduces native support for OpenTelemetry (OTLP) metrics ingestion, allowing seamless integration between Prometheus and the OpenTelemetry ecosystem."
---

This blog post demonstrates how to send OTLP metrics to Prometheus 3 in a Kubernetes platform with both the Prometheus and OpenTelemetry Operators already installed.

### Prerequisites

Ensure you have the following components installed in your Kubernetes cluster:

* **Prometheus 3** (with the OpenTelemetry ingestion endpoint enabled)
* **OpenTelemetry Operator** (for managing OpenTelemetry Collector instances)
* **A sample application** that generates OTLP metrics

### Deploying an OpenTelemetry Collector to Export Metrics

We'll configure an OpenTelemetry Collector to scrape application metrics and forward them to Prometheus 3.

#### OpenTelemetry Collector Configuration in CRD

Instead of using a ConfigMap, we embed the configuration directly in the OpenTelemetryCollector custom resource:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
  namespace: monitoring
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
      prometheusremotewrite:
        endpoint: "http://prometheus-operated.monitoring.svc.cluster.local:9090/api/v1/otlp"

    service:
      pipelines:
        metrics:
          receivers: [otlp]
          processors: [batch]
          exporters: [prometheusremotewrite]
```

#### Configuring Prometheus 3 to Accept OTLP Metrics via the Prometheus Operator

To enable the OTLP endpoint in Prometheus using the Prometheus Operator, modify the Prometheus custom resource:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: prometheus
  namespace: monitoring
spec:
  containers:
    - name: prometheus
      args:
        - "--web.enable-remote-write-receiver"
        - "--enable-feature=otlp-write-receiver"
  serviceMonitorSelector:
    matchLabels:
      team: frontend
  podMonitorSelector: {}
  resources:
    requests:
      memory: 400Mi
```

These flags enable the OTLP metrics endpoint at `/api/v1/otlp`.

#### Deploying a Sample Application with OTLP Metrics

We will deploy a simple sample application with OpenTelemetry instrumentation to send metrics to the OpenTelemetry Collector.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sample-app
  template:
    metadata:
      labels:
        app: sample-app
    spec:
      containers:
        - name: sample-app
          image: myorg/sample-app:latest
          ports:
            - containerPort: 8080
          env:
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: "http://otel-collector.monitoring.svc.cluster.local:4317"
```

#### Verifying Metrics in Prometheus

After deploying the sample application, verify that metrics are successfully flowing into Prometheus:

* Access the Prometheus UI:

```shell
kubectl port-forward svc/prometheus-operated 9090 -n monitoring
```

* Navigate to `http://localhost:9090` and use the Prometheus expression browser to check for incoming OTLP metrics.

### Conclusion

With Prometheus 3's OpenTelemetry endpoint, integrating OTLP metrics into a Kubernetes-based observability stack becomes much simpler. This setup allows teams to leverage OpenTelemetry's powerful telemetry collection capabilities while continuing to use Prometheus as a reliable backend for metrics storage and querying.
