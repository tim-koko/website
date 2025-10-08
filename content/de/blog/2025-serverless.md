---
title: "Level Up Your Serverless Game"
slug: "serverless"
description: ""
date: 2025-10-09T00:00:00+00:00
lastmod: 2025-10-09T00:00:00+00:00
draft: false
images: ["images/blog/otel/tk-blogpost-otel-1200x630.png"]
Sitemap:
Priority: 0.92

categories: ["Technologie", "Serverless", "Gastbeitrag"]
authors: [lena-fuhrimann]
additionalblogposts: []

post_img: "images/blog/otel/tk-blogpost-otel-1500x1000.png"
img_border: true
lead: "Is your serverless project running into unexpected snags? You’re not alone. From basic misconfigurations to frustrating deployment nightmares, we’ve seen the same pitfalls trap countless teams. This guide is your cheat sheet to avoiding those common mistakes and accelerating your journey to serverless mastery. Think of each level as a lesson learned—a mistake you don’t have to make. From basic misconfigurations to complex deployment nightmares, the patterns are frustratingly consistent. We’ve compiled this blog post to help you avoid these common pitfalls and accelerate your journey to serverless excellence. Think of each level as a lesson learned, a mistake you don’t have to make. To learn more about the details and apply the learnings yourself, follow our open source Serverless Workshop. This blog post as well as the workshop both use AWS Lambda but the learnings can be applied to any function as a service (FaaS) platform. Now, let’s dive in."
---

### Was ist der OpenTelemetry Collector?

Der OpenTelemetry Collector ist ein herstellerneutraler Dienst, der Telemetriedaten wie Logs, Metriken und Traces sammelt, verarbeitet und an verschiedene Zielsysteme exportieren kann. Er fungiert als Vermittler zwischen instrumentierten Applikationen und Observability-Backends wie Jaeger, Prometheus oder OpenSearch.

Durch den Einsatz eines Collectors müssen Applikationen ihre Daten nicht mehr direkt an ein Backend senden. Stattdessen erfolgt die Kommunikation zentral über den Collector, der die Daten optional transformieren, filtern oder an mehrere Empfänger gleichzeitig weiterleiten kann. Diese Entkopplung schafft Flexibilität und verbessert die Wartbarkeit der Observability-Infrastruktur.

### Deployment des Collectors in Kubernetes

Mit dem OpenTelemetry Operator gestaltet sich das Ausrollen eines Collectors unkompliziert. Über ein Kubernetes Custom Resource (CR) vom Typ `OpenTelemetryCollector` lässt sich die Konfiguration deklarativ verwalten.

#### Voraussetzungen

* Ein laufender Kubernetes-Cluster mit installiertem OpenTelemetry Operator.
* Zugriff via `kubectl`
* Installiertes `otel-cli`

#### Schritt 1: Eine einfache Collector-Konfiguration erstellen

Eine Datei mit dem Namen `otel-collector.yaml` erstellen:

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
      logging:
        verbosity: detailed
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [logging]
```

Diese Konfiguration bewirkt Folgendes:

* Empfang von Telemetriedaten via OTLP (HTTP und gRPC).

* Verarbeitung der Daten in Batches.

* Ausgabe der Traces im Log (nützlich für erste Tests und Debugging).

#### Schritt 2: Deployment der Collector-Ressource

Die Ressource mit folgendem Befehl anwenden:

```sh
kubectl apply -f otel-collector.yaml
```

Anschliessend prüfen, ob der Collector läuft:

```sh
kubectl get pods -n otel
```

#### Schritt 3: Testdaten an den Collector senden

Zum Testen eignet sich das Tool `otel-cli`, um manuell Traces zu senden:

```sh
otel-cli exec --endpoint http://otel-collector.otel.svc:4318/v1/traces --service my-test-app --name "test-span"
```

Die Ausgabe des Collectors lässt sich wie folgt einsehen:

```sh
kubectl logs deployment/otel-collector -n otel
```

### Fazit

Der OpenTelemetry Collector bietet in Kubernetes-Umgebungen eine robuste und flexible Möglichkeit, Telemetriedaten zentral zu sammeln und weiterzuleiten. In Kombination mit dem OpenTelemetry Operator wird der Betrieb deutlich vereinfacht. In weiteren Beiträgen folgt ein Blick auf erweiterte Konfigurationen und Integrationen mit konkreten Backends.

Happy tracing!
