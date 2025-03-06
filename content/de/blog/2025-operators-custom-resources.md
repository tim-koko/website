---
title: "Kubernetes Operators und Custom Resources: Komplexität vereinfachen"
slug: "operators-custom-resources"
description: ""
date: 2025-03-02T00:00:00+00:00
lastmod: 2025-03-02T00:00:00+00:00
draft: false
images: ["images/blog/otel/tk-blogpost-otel-3000x2000.png"]
img_border: true
Sitemap:
Priority: 0.9

categories: ["Technologie", "OpenTelemetry", "Kubernetes"]
authors: ['raffael-hertle']
post_img: "images/blog/otel/tk-blogpost-otel-3000x2000.png"
lead: "Kubernetes ist ein leistungsstarkes System, aber komplexe Anwendungen erfordern oft mehr als nur die integrierten Ressourcen. Hier kommen Operators und Custom Resources ins Spiel. Sie ermöglichen eine native Verwaltung spezialisierter Software, indem sie die Kubernetes-API erweitern und Automatisierung auf ein neues Level heben. In diesem Beitrag schauen wir uns an, wie der OpenTelemetry Operator funktioniert, welche CustomResourceDefinitions (CRDs) er einführt und warum Operators ein essenzieller Bestandteil moderner Kubernetes-Umgebungen sind."
---

Kubernetes basiert auf einem leistungsstarken Automatisierungsmodell, dem **Controller-Pattern**, das sicherstellt, dass der tatsächliche Zustand des Clusters stets mit dem gewünschten Zustand übereinstimmt. Jede Ressource in Kubernetes—sei es ein **Deployment**, **Service** oder **ConfigMap**—wird kontinuierlich von einem **Controller** verwaltet. Diese Controller arbeiten in einem Loop und führen einen **Observe-, Compare- und Reconcileprozess** durch.

{{< svg "assets/images/blog/operator-custom-resources/operator-pattern.svg" >}}
<br>
<br>

Operators folgen demselben Prinzip, erweitern es jedoch über die integrierten Kubernetes-Objekte hinaus. Anstatt nur Pods oder ReplicaSets zu verwalten, definiert ein Operator **benutzerdefinierte Ressourcen** (Custom Resources) und verwendet einen Controller, um komplexe Anwendungen wie Datenbanken, Monitoring-Systeme oder Observability-Tools zu managen. Ein Operator übernimmt nicht nur die Bereitstellung einer Software, sondern verwaltet auch deren gesamten Lebenszyklus, einschliesslich Konfigurationsaktualisierungen, Skalierung und Versions-Upgrades.

## Warum sind Operators und Custom Resources essenziell?

Kubernetes ist von Grund auf erweiterbar. Während eingebaute Ressourcen wie Deployments, Services und ConfigMaps für Standard-Workloads ausreichen, benötigen viele Anwendungen eine fortschrittlichere Automatisierung—beispielsweise Observability-Tools, Datenbanken oder Service Meshs.

Um dies zu ermöglichen, führen Operators **Custom Resources** in Kubernetes ein. Bevor Kubernetes jedoch mit diesen Ressourcen arbeiten kann, muss der Operator eine **CustomResourceDefinition (CRD)** definieren. Eine **CRD** erweitert die Kubernetes-API, indem sie das Schema und Verhalten eines neuen Ressourcentyps festlegt. Sobald die CRD im Cluster installiert ist, können Benutzer Instanzen der benutzerdefinierten Ressource erstellen, und der Operator sorgt für deren korrekte Verwaltung.

### Wie funktioniert der OpenTelemetry Operator?

Der **OpenTelemetry Operator** führt mehrere **CustomResourceDefinitions (CRDs)** ein, die Kubernetes um neue Ressourcentypen für OpenTelemetry erweitern. Diese CRDs ermöglichen die native Verwaltung von OpenTelemetry-Komponenten innerhalb eines Clusters:

* **OpenTelemetryCollector (CRD)**: Definiert und verwaltet OpenTelemetry Collector-Instanzen, einschliesslich Pipelines für Tracing, Metriken und Logs.
* **Instrumentation (CRD)**: Aktiviert Auto-Instrumentierung für Anwendungen und injiziert OpenTelemetry-SDKs automatisch.

Diese **CustomResourceDefinitions (CRDs)** definieren die **Spezifikation und das Verhalten** der Ressourcen. Das bedeutet, dass Kubernetes genau versteht, wie OpenTelemetryCollector- oder Instrumentation-Ressourcen gespeichert, validiert und verwaltet werden sollen. Der OpenTelemetry Operator überwacht diese Custom Resources und stellt sicher, dass ihr gewünschter Zustand im Cluster umgesetzt wird.

### Beispiele für Custom Resources in Aktion

<br>

#### 1. Bereitstellen eines OpenTelemetry Collectors

Um einen OpenTelemetry Collector mit dem Operator zu deployen, kann eine **OpenTelemetryCollector**-Ressource erstellt werden:

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

Dies stellt sicher, dass:

* Ein OpenTelemetry Collector als **Kubernetes Deployment** bereitgestellt wird.
* Er Telemetriedaten über OTLP (OpenTelemetry Protocol) empfängt.
* Die Daten in Batches verarbeitet und an **Logging und ein OTLP-Endpoint (z. B. Grafana Tempo)** gesendet werden.

<br>

#### 2. Aktivieren der Auto-Instrumentierung

Anstatt Anwendungs-Code anzupassen, kann der OpenTelemetry Operator **Auto-Instrumentierung** für Workloads aktivieren. Dazu dient die **Instrumentation**-CRD, mit der Auto-Instrumentierung für Java-Anwendungen eingerichtet wird:

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

Das bedeutet:

* Java-Anwendungen im Cluster erhalten automatisch OpenTelemetry-Instrumentierung.
* Alle Traces werden ohne Code-Änderungen an den OpenTelemetry Collector exportiert.

<br>

#### 3. Auto-Instrumentierung für eine Anwendung aktivieren

Sobald die **Instrumentation**-CR definiert wurde, kann sie auf eine Deployment-Ressource angewendet werden, indem eine Annotation hinzugefügt wird:

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

Dadurch wird die OpenTelemetry-Instrumentierung **automatisch injiziert**, wenn die Anwendung startet.

### Warum ist das wichtig?

Ohne den OpenTelemetry Operator müsste die Observability manuell eingerichtet werden—einschliesslich der Konfiguration von Collectors, der Anpassung des Anwendungs-Codes für die Instrumentierung und der separaten Verwaltung von Deployments. Der Operator eliminiert diese Komplexität, indem er OpenTelemetry **nativ in Kubernetes integriert**.

## Versionsmanagement und CRD-Evolution

Ein grosser Vorteil von Operators ist, dass sie auch **Versions-Upgrades** von Anwendungen verwalten können. Da sich Observability-Tools weiterentwickeln, ändern sich oft auch die Konfigurationsformate. Ein gut designter Operator sorgt für reibungslose Übergänge zwischen Versionen, ohne dass bestehende Setups brechen.

Kubernetes **CustomResourceDefinitions (CRDs)** unterstützen Versionierung, um diesen Prozess zu erleichtern. Wenn sich das Schema einer CRD ändert (z. B. wenn OpenTelemetry ein neues Konfigurationsfeld einführt), müssen ältere Versionen weiterhin unterstützt werden. Hier kommen **Conversion Webhooks** ins Spiel.

### Wie funktionieren Conversion Webhooks?

Ein **Conversion Webhook** ermöglicht es Kubernetes, automatisch ältere Versionen einer Custom Resource in das aktuelle Format zu übersetzen. Wenn ein Benutzer eine ältere CR-Version verwendet, ruft Kubernetes den Webhook auf, der die Ressource in die neueste Version konvertiert.

Beispiel: Falls die `OpenTelemetryCollector`-CRD ursprünglich `spec.pipelines.traces.receivers` verwendet hat, aber später zu `spec.tracing.receivers` geändert wurde, sorgt ein Conversion Webhook dafür, dass beide Formate weiterhin funktionieren.

Dies ist entscheidend für Produktionsumgebungen, in denen bestehende Konfigurationen auch nach Updates weiterhin genutzt werden müssen.

## Fazit

Operators und CustomResourceDefinitions (CRDs) haben Kubernetes zu einer vollständigen Plattform für das **Application Management** gemacht. Der OpenTelemetry Operator zeigt eindrucksvoll, wie Operators **die Bereitstellung vereinfachen, Konfigurationen automatisieren und Versions-Upgrades ermöglichen**.

Durch die Definition von **CustomResourceDefinitions (CRDs)** erweitert der OpenTelemetry Operator Kubernetes um native Observability-Funktionalitäten. Diese CRDs ermöglichen eine deklarative Verwaltung von OpenTelemetry-Komponenten, die denselben Kontroll- und Reconciliation-Mechanismen folgen wie alle anderen Kubernetes-Ressourcen.

Wer OpenTelemetry in Kubernetes nutzt, profitiert mit dem OpenTelemetry Operator von besserer Automatisierung, sicheren Versions-Upgrades und einer nachhaltig wartbaren Observability-Architektur.
