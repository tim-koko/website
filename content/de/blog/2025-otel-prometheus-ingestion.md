---
title: "Verwendung des OpenTelemetry-Endpunkts in Prometheus 3 zum Erfassen von OTLP-Metriken in Kubernetes"
slug: "otel-collector"
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
lead: "Prometheus 3 führt native Unterstützung für die Erfassung von OpenTelemetry (OTLP) Metriken ein und ermöglicht so eine nahtlose Integration zwischen Prometheus und dem OpenTelemetry-Ökosystem."
---

Dieser Blogbeitrag zeigt, wie OTLP-Metriken in einer Kubernetes-Umgebung, in der sowohl der Prometheus-Operator als auch der OpenTelemetry-Operator bereits installiert sind, an Prometheus 3 gesendet werden können.

### Voraussetzungen

Stellen Sie sicher, dass in Ihrem Kubernetes-Cluster die folgenden Komponenten installiert sind:

* Prometheus 3 (mit aktiviertem OpenTelemetry-Empfangs-Endpunkt)
* OpenTelemetry Operator (zur Verwaltung von OpenTelemetry-Collector-Instanzen)
* Eine Beispielanwendung, die OTLP-Metriken erzeugt

### Bereitstellen eines OpenTelemetry Collectors zum Exportieren von Metriken

Wir werden einen OpenTelemetry Collector so konfigurieren, dass er Anwendungsmetriken erfasst und an Prometheus 3 weiterleitet.

#### OpenTelemetry-Collector-Konfiguration in einer CRD

Anstatt eine ConfigMap zu verwenden, betten wir die Konfiguration direkt in die OpenTelemetryCollector-Custom Resource ein:

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

#### Konfiguration von Prometheus 3 zur Annahme von OTLP-Metriken über den Prometheus Operator

Um den OTLP-Endpunkt in Prometheus über den Prometheus Operator zu aktivieren, passen Sie die Prometheus-Custom Resource wie folgt an:

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

Diese Flags aktivieren den OTLP-Metrik-Endpunkt unter /api/v1/otlp.

#### Bereitstellen einer Beispielanwendung mit OTLP-Metriken

Wir werden eine einfache Beispielanwendung mit OpenTelemetry-Instrumentierung bereitstellen, die Metriken an den OpenTelemetry Collector sendet.

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

#### Überprüfung der Metriken in Prometheus

Nachdem die Beispielanwendung bereitgestellt wurde, überprüfen Sie, ob die Metriken erfolgreich in Prometheus einfliessen:

* Zugriff auf die Prometheus-Benutzeroberfläche:

```shell
kubectl port-forward svc/prometheus-operated 9090 -n monitoring
```

* Navigieren Sie zu http://localhost:9090 und verwenden Sie den Prometheus Expression-Browser, um die eingehenden OTLP-Metriken zu überprüfen.

### Fazit

Mit dem OpenTelemetry-Endpunkt von Prometheus 3 wird die Integration von OTLP-Metriken in einen Kubernetes-basierten Observability-Stack deutlich vereinfacht. Dieses Setup ermöglicht es Teams, die leistungsstarken Telemetrie-Erfassungsfunktionen von OpenTelemetry zu nutzen und gleichzeitig Prometheus als zuverlässigen Backend-Speicher für Metriken und Abfragen weiter einzusetzen.
