---
title: "Was ist Argo Events? Und warum es sich mit einem Bewegungsmelder vergleichen lässt"
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

categories: ["Technologie", "Kubernetes", "ArgoCD"]
authors: ['miriam-streit']
post_img: "images/blog/argocd/argocd-what-is-1500x1000.png"
lead: "Während Argo CD den Zustand verwaltet, fehlen auf Ereignisse aus der Aussenwelt oft saubere Standards: Eigene Receiver-Apps erzeugen Sicherheitsrisiken und Unübersichtlichkeit. Wie steuert man ereignisgesteuerte Aktionen genauso deklarativ wie den GitOps-Zustand?"
---

Mit Argo Events. Als logische Ergänzung zu Argo CD verwandelt das Tool den Cluster in eine ereignisgesteuerte Plattform – vollautomatisch, deklarativ und ohne Skript-Wildwuchs.

### Das Problem: Der „Glue Code“-Sumpf

Kubernetes eignet sich hervorragend zur Verwaltung von Containern. Doch sobald Anwendungen auf Ereignisse aus der Aussenwelt reagieren müssen, reichen Standard-Ressourcen schnell nicht mehr aus.

Typische Szenarien im Cloud-Native-Alltag:

* Eine neue Datei wird in einen S3-Bucket hochgeladen und muss verarbeitet werden.
* Ein Git-Event oder ein Webhook aus einem externen Tool trifft ein.
* Eine Nachricht landet in einem Kafka-Topic oder einem Message Broker.

Wie lösen viele Teams diese Anforderungen heute? Sie schreiben eigene kleine Flask- oder Python-Apps als Webhook-Receiver, setzen Polling-Container auf oder pflegen unzählige CronJobs. Dieser selbstgeschriebene „Glue Code“ muss gebaut, gesichert, skaliert und gewartet werden. Fällt der Entwickler aus, der das Skript geschrieben hat, wird die Fehlersuche im Krisenfall zum Geduldspiel. Es entsteht ein unübersichtlicher Skript-Wildwuchs im Cluster.

### Die Lösung: Was ist Argo Events?

Im [ersten Teil](https://tim-koko.ch/blog/argocd-what-is/) unserer Serie haben wir gesehen, wie **Argo CD** den *gewünschten Zustand* (Desired State) der Infrastruktur kontinuierlich abgleicht. **Argo Events** ist der logische Partner für die andere Seite der Medaille: Es steuert die *Aktionen* (Events), die durch externe Reize ausgelöst werden.

Man kann sich Argo Events wie einen **Smart-Home-Bewegungsmelder** vorstellen: Der Sensor an der Wand registriert eine Bewegung an der Tür (EventSource), schickt das Signal über das Hausnetzwerk (EventBus), prüft, ob es draussen bereits dunkel ist (Sensor), und schaltet genau dann das Licht ein (Trigger). Genauso reagiert Argo Events auf Reize aus der Aussenwelt – etwa ein File-Upload oder ein Webhook – und führt vollautomatisch die passende Aktion im Cluster aus.

Argo Events ist ein deklaratives, ereignisgesteuertes Automatisierungs-Framework für Kubernetes. Anstatt eigenen Code für den Empfang von Events zu schreiben, definiert man Event-Quellen und Reaktionen einfach als Kubernetes-Ressourcen (Custom Resources).

Es entkoppelt den Event-Erzeuger (z. B. einen GitHub-Webhook) strikt vom Event-Verarbeiter (z. B. einem Kubernetes-Job). Das Ergebnis: Keine einzige Zeile eigener Glue-Code mehr nötig.

### Die Architektur: Die 4 Bausteine von Argo Events

Die Funktionsweise von Argo Events basiert auf vier klaren Komponenten, die nahtlos ineinandergreifen:

* **1. EventBus:** Das Fundament und der Transportweg im Cluster. Er fungiert als internes Nachrichtennetzwerk (meist auf Basis von NATS JetStream), das Events sicher und hochverfügbar zwischen EventSources und Sensoren leitet.
* **2. EventSource:** Definiert, *woher* ein Ereignis kommt. Argo Events unterstützt über 20 Event-Quellen out-of-the-box – darunter Webhooks, MinIO, Kafka, GCP PubSub, AWS SQS/SNS, GitHub/GitLab, Calendar, Slack oder K8s Resources.
* **3. Sensor:** Der Filter und Entscheider. Er hört auf den EventBus, prüft Bedingungen (z. B. *"Stimmt der Payload-Inhalt?"*) und entscheidet, ob eine Aktion ausgelöst wird.
* **4. Trigger:** Die eigentliche Aktion innerhalb des Sensors. Sobald der Sensor grünes Licht gibt, führt der Trigger das Resultat aus (z. B. Erzeugen eines K8s-Jobs oder Auslösen eines Argo CD Syncs).

#### Ablauf der Architektur

{{< custom-image "../images/argocd/argo-events-architecture.png" >}}

Bildquelle: [https://argoproj.github.io/argo-events/concepts/architecture/](https://argoproj.github.io/argo-events/concepts/architecture/)

### Ein einfaches Beispiel: Vom Webhook zum Kubernetes-Job

> **Voraussetzung:** Argo Events (inklusive der Argo Events CRDs und Controller) muss bereits im Cluster installiert sein.

Das folgende Beispiel demonstriert alle **4 Bausteine** in der Praxis. Wir empfangen einen Webhook abgesichert per Token und starten automatisch einen Kubernetes-Job.

#### 1. EventBus (Das Transportnetzwerk)

Zuerst definieren wir den EventBus im Namespace. Er stellt die Jetstream-Infrastruktur bereit, über welche die Events fliessen:

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

#### 2. EventSource (Webhook mit Secret-Validierung)

Die `EventSource` öffnet einen Endpunkt. Aus Sicherheitsgründen prüfen wir eingehende Anfragen direkt gegen ein Kubernetes-Secret (Header-Token):

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
      # Sicherheits-Aspekt: Token-Validierung im Header
      authSecret:
        name: webhook-secret
        key: token
```

#### 3. & 4. Sensor und Trigger (Filter & Ziel-Aktion)

Der `Sensor` hört auf den `EventBus`, verbindet sich mit der `EventSource` und führt bei Erfolg den definierten `Trigger` aus:

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
    # Der Trigger ist die vierte Komponente
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
                        command: ["echo", "Webhook sicher verarbeitet!"]
                    restartPolicy: Never
```

**Der Ablauf auf einen Blick:**
Ein HTTP-POST trifft auf die **EventSource** (2) -> Das Secret wird validiert -> Das Event wird auf den **EventBus** (1) gelegt -> Der **Sensor** (3) liest das Event und prüft die Abhängigkeiten -> Der **Trigger** (4) startet den K8s-Job.

### Typische Anwendungsfälle: Wann lohnt sich der Einsatz von Argo Events?

In der modernen Cloud-Native-Entwicklung gibt es wiederkehrende Szenarien, in denen der Wechsel von benutzerdefiniertem Eigenbau-Code zu Argo Events unmittelbare Vorteile bringt:

* **Ereignisgesteuerte Datenverarbeitung:** Statt Dauer-Container laufen zu lassen, die minütlich Ordner oder Buckets abfragen, reagiert Argo Events direkt auf S3-File-Uploads. Verarbeitungs-Pods werden ressourcenschonend nur dann gestartet, wenn tatsächlich neue Daten vorliegen.
* **Event-Driven GitOps & Deployment-Trigger:** Benachrichtigungen von externen Systemen (wie Ticket-Systemen, Monitoring-Alerts oder Webhooks aus CI-Systemen) können genutzt werden, um über Argo CD gezielte Deployments oder Cluster-Synchronisationen auszulösen.
* **Webhooks ohne Maintenance-Overhead:** Teams sparen sich das Schreiben, Patchen und Verwalten eigener Python-, Go- oder Node-Container, die einzig als Empfänger für Webhooks dienen.
* **Sicherheits- & Compliance-Anforderungen:** Enterprise-Anforderungen an Authentifizierung und Autorisierung lassen sich deklarativ abdecken:
  * *Authentifizierung:* HMAC-Signaturen (z. B. GitHub Webhook Secret Validation) oder Token-Checks übernimmt direkt die `EventSource`.
  * *Transport-Verschlüsselung:* Die Kommunikation über den `EventBus` wird per TLS abgesichert.
  * *Feingranulares RBAC:* Über Kubernetes-Service-Accounts wird strikt begrenzt, welche Ressourcen ein `Sensor`-Trigger im Cluster überhaupt anlegen darf (Least-Privilege-Prinzip).

### Fazit & Ausblick

Argo Events beendet die Ära der gebastelten Skripte und benutzerdefinierten Event-Empfänger. Zusammen mit Argo CD entsteht eine Architektur, die nicht nur ihren Zustand im Griff hat, sondern auch dynamisch, sicher und wartungsfrei auf Reize aus der Umwelt reagiert.

Das Beste daran: Ein Trigger in Argo Events ist keineswegs auf einfache Kubernetes-Jobs beschränkt. Wenn die Anforderungen an die Event-Verarbeitung komplexer werden – zum Beispiel wenn mehrstufige Daten-Pipelines, parallele Test-Abläufe oder komplexe DAGs (Directed Acyclic Graphs) benötigt werden – kommt der nächste grosse Baustein des Argo-Ökosystems ins Spiel.

*Im nächsten Teil unserer Blog-Serie widmen wir uns daher **Argo Workflows** – der mächtigen Workflow-Engine für Kubernetes.*

*Ob strategische Architektur-Beratung oder tatkräftige Hands-on-Unterstützung direkt in eurem Cloud-Native-Projekt: Sprecht unser Team gerne an, um Skript-Chaos nachhaltig aus euren Clustern zu verbannen.*
