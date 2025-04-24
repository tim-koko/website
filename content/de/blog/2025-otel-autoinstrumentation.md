---
title: "Auto-Instrumentierung von Java-Applikationen mit dem OpenTelemetry Operator in Kubernetes"
slug: "otel-autoinstrumentation"
description: ""
date: 2025-04-23T00:00:00+00:00
lastmod: 2025-04-23T00:00:00+00:00
draft: false
images: ["images/blog/otel/tk-blogpost-otel-3000x2000.png"]
Sitemap:
Priority: 0.92

categories: ["Technologie", "OpenTelemetry", "Kubernetes"]
authors: ['raffael-hertle']

post_img: "images/blog/otel/tk-blogpost-otel-3000x2000.png"
img_border: true
lead: "Im Rahmen der Blogserie rund um das OpenTelemetry-Ökosystem in Kubernetes-nativen Umgebungen wird in diesem Beitrag ein besonders hilfreiches Feature unter die Lupe genommen: die Auto-Instrumentierung von Java-Applikationen mittels des OpenTelemetry Operators."
# don't publish the page
_build:
 list: never
 render: never
---

Der Fokus liegt dabei auf der Funktionsweise der Java-Auto-Instrumentierung und ihrer nahtlosen Integration in Kubernetes-basierte Workflows.

### Was bedeutet Auto-Instrumentierung?

Auto-Instrumentierung ermöglicht das Sammeln von Telemetriedaten (Traces, Metriken), **ohne den Anwendungscode anpassen zu müssen**. Bei Java erfolgt dies durch das Einfügen des OpenTelemetry Java Agenten zur Laufzeit. Dieser greift auf die JVM zu und instrumentiert unterstützte Libraries und Frameworks automatisch (z.B. Spring, gRPC, JDBC etc.).

### Wie der OpenTelemetry Operator die Auto-Instrumentierung umsetzt

Der OpenTelemetry Operator bringt Auto-Instrumentierung auf eine Kubernetes-native Art in den Cluster. Mithilfe von **Custom Resource Definitions (CRDs)** wird die Konfiguration und Verwaltung der Instrumentierung abgebildet. Die zentrale Komponente ist dabei das `Instrumentation` Objekt.

Wird eine `Instrumentation` Ressource erstellt, übernimmt der Operator folgende Aufgaben:

* Die Bereitstellung des korrekten OpenTelemetry Language Agents (hier: Java Agent)
* Die automatische Injektion des Agents in Applikations-Pods via Kubernetes **Mutating Webhook**
* Die Konfiguration von Umgebungsvariablen wie `OTEL_EXPORTER_OTLP_ENDPOINT` entsprechend der Zielplattform (Collector oder Backend)

### Beispielkonfiguration: Auto-Instrumentierung einer Java-Applikation

Ein praxisorientierter Einstieg.

#### 1. Voraussetzungen

Im Cluster sollten bereits folgende Komponenten vorhanden sein:

* OpenTelemetry Operator
* OpenTelemetry Collector (mit OTLP + Debug Exporter)
* Eine Java-Applikation (z.B. Spring Boot oder Quarkus)

#### 2. Definition einer Instrumentation-Ressource

Beispiel für eine einfache `Instrumentation` Konfiguration:

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

Diese Konfiguration bewirkt:

* Verwendung des definierten OpenTelemetry Java Agent Images
* Einsatz des W3C Trace Context und Baggage zur Weitergabe von Trace-Informationen
* Export von Telemetriedaten zum Collector unter `otel-collector:4317`
* 100% Sampling aller Traces

#### 3. Deployment einer Java-Applikation

Beispiel für ein Deployment-Manifest einer Java-Applikation:

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

Wichtig ist hier die Annotation:

```sh
instrumentation.opentelemetry.io/inject-java: "true"
```

Der Operator erkennt diese Annotation und modifiziert den Pod automatisch:

* Injection des OpenTelemetry Java Agents
* Setzen der `JAVA_TOOL_OPTIONS` Variable zur Agent-Aktivierung
* Hinzufügen aller notwendigen Umgebungsvariablen

### Blick hinter die Kulissen

Beim Start eines Pods greift der Operator in die Erstellung ein und erweitert die Pod-Spezifikation wie folgt:

* Mounten eines Volumes mit dem Java Agent JAR
* Setzen von `JAVA_TOOL_OPTIONS` z.B. mit:

```sh
-javaagent:/otel-auto-instrumentation/javaagent.jar
```

Dieser Ansatz vermeidet Änderungen am Container-Image und ist mit praktisch jeder JVM-basierten Applikation kompatibel.

### Funktionsprüfung

Bei Nutzung eines Collectors mit Debug Exporter erscheinen gesammelte Traces direkt im Log.

Alternativ können Metriken über den Collector-Endpunkt (`:8888/metrics`) abgefragt oder an Visualisierungssysteme wie Jaeger, Tempo oder Honeycomb weitergeleitet werden.

### Fazit

Die Auto-Instrumentierung mit dem OpenTelemetry Operator bietet einen eleganten, Kubernetes-nativen Ansatz zur Erfassung von Traces in Java-Applikationen – ganz ohne Code-Anpassung. Basierend auf stabilen Kubernetes-Primitiven wie Mutating Webhooks und CRDs lässt sich diese Methode hervorragend in moderne CI/CD- und GitOps-Workflows integrieren.
