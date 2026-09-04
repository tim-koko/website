---
title: "Was ist ArgoCD? Und warum es sich mit einem Thermostat vergleichen lässt"
slug: "argocd-what-is"
description: ""
date: 2026-08-07T00:00:00+00:00
lastmod: 2026-08-07T00:00:00+00:00
draft: false
images: ["images/blog/argocd/argocd-what-is-1200x630.png"]
img_border: true
Sitemap:
  Priority: 0.9

additionalblogposts: [ 'kubernetes-hotel', 'kubevirt-whatis']

categories: ["Technologie", "Kubernetes", "ArgoCD"]
authors: ['miriam-streit']
post_img: "images/blog/argocd/argocd-what-is-1500x1000.png"
lead: "Klassische CI/CD-Pipelines stossen bei Kubernetes schnell an ihre Grenzen: Es fehlt die Transparenz beim Deployment, und manuelle Eingriffe sind weiterhin möglich und sorgen für Abweichungen zwischen Git und Cluster. Wie lassen sich diese Probleme lösen?"
---

# Argo Events: Schluss mit dem Skript-Chaos bei ereignisgesteuerten Kubernetes-Tasks

### Titel-Optionen
1. **Argo Events: Ereignisgesteuerte Automatisierung ohne Skript-Chaos**
2. **Wenn Kubernetes auf Reize reagiert: Eine Einführung in Argo Events**
3. **Argo CD steuert den Zustand, Argo Events die Aktion: GitOps trifft Event-Driven K8s**

### Lead-Texte
* **Lead 1 (Frage):** Eigene Webhook-Empfänger, gebastelte Python-Skripte und CronJobs: Wie löst man ereignisgesteuerte Tasks auf Kubernetes, ohne im Wartungschaos von benutzerdefiniertem Glue-Code zu versinken? *(190 Zeichen)*
* **Lead 2 (Antwort):** Mit Argo Events. Als logische Ergänzung zu Argo CD verwandelt das Tool deinen Cluster in eine ereignisgesteuerte Plattform – vollautomatisch, deklarativ und ohne Skript-Wildwuchs. *(185 Zeichen)*

---

## Das Problem: Der „Glue Code“-Sumpf

Kubernetes eignet sich hervorragend zur Verwaltung von Containern. Doch sobald Anwendungen auf Ereignisse aus der Aussenwelt reagieren müssen, stossen Standard-Ressourcen schnell an ihre Grenzen.

Typische Szenarien im Cloud-Native-Alltag:
* Eine neue Datei wird in einen S3-Bucket hochgeladen und muss verarbeitet werden.
* Ein Git-Event oder ein Webhook aus einem externen Tool trifft ein.
* Eine Nachricht landet in einem Kafka-Topic oder einem Message Broker.

Wie lösen viele Teams diese Anforderungen heute? Sie schreiben eigene kleine Flask- oder Python-Apps als Webhook-Receiver, setzen Polling-Container auf oder pflegen unzählige CronJobs. Dieser selbstgeschriebene „Glue Code“ muss gebaut, gesichert, skaliert und gewartet werden. Fällt der Entwickler aus, der das Skript geschrieben hat, wird die Fehlersuche im Krisenfall zum Geduldspiel. Es entsteht ein unübersichtlicher Skript-Wildwuchs im Cluster.

---

## Die Lösung: Was ist Argo Events?

Im ersten Teil unserer Serie haben wir gesehen, wie **Argo CD** den *gewünschten Zustand* (Desired State) deiner Infrastruktur kontinuierlich abgleicht. **Argo Events** ist der logische Partner für die andere Seite der Medaille: Es steuert die *Aktionen* (Events), die durch externe Reize ausgelöst werden.

Argo Events ist ein deklaratives, ereignisgesteuertes Automatisierungs-Framework für Kubernetes. Anstatt eigenen Code für den Empfang von Events zu schreiben, definiert man Event-Quellen und Reaktionen einfach als Kubernetes-Ressourcen (Custom Resources). 

Argo Events entkoppelt den Event-Erzeuger (z. B. einen GitHub-Webhook) strikt vom Event-Verarbeiter (z. B. einem Kubernetes-Job). Das Ergebnis: Keine einzige Zeile eigener Glue-Code mehr nötig.

---

## Die Architektur: Die 4 Bausteine von Argo Events

Die Funktionsweise von Argo Events basiert auf vier klaren Komponenten, die nahtlos ineinandergreifen:

* **1. EventBus:** Das Fundament und der Transportweg im Cluster. Er fungiert als internes Nachrichtennetzwerk (meist auf Basis von NATS JetStream), das Events sicher und hochverfügbar zwischen EventSources und Sensoren leitet.
* **2. EventSource:** Definiert, *woher* ein Ereignis kommt. Argo Events unterstützt über 20 Event-Quellen out-of-the-box – darunter Webhooks, S3/MinIO, Kafka, Pub/Sub, AWS SNS/SQS oder Cron-Timer.
* **3. Sensor:** Der Filter und Entscheider. Er hört auf den EventBus, prüft Bedingungen (z. B. *"Stimmt der Payload-Inhalt?"*) und entscheidet, ob eine Aktion ausgelöst wird.
* **4. Trigger:** Die eigentliche Aktion innerhalb des Sensors. Sobald der Sensor grünes Licht gibt, führt der Trigger das Resultat aus (z. B. Erzeugen eines K8s-Jobs oder Auslösen eines Argo CD Syncs).

### Ablauf der Architektur

```text
[ Externe Quelle ] --(1. Event)--> [ EventSource ]
                                        |
                            (2. Event publizieren)
                                        v
                                  [ EventBus ]
                                        |
                              (3. Event abhören)
                                        v
                                   [ Sensor ]
                            (Filtert & Prüft Logik)
                                        |
                             (4. Trigger ausführen)
                                        v
                           [ K8s Job / Argo CD Sync ]
```

---

## Ein einfaches Beispiel: Vom Webhook zum Kubernetes-Job

> **Voraussetzung:** Argo Events (inklusive der Argo Events CRDs und Controller) muss bereits in deinem Cluster installiert sein.

Das folgende Beispiel demonstriert alle **4 Bausteine** in der Praxis. Wir empfangen einen Webhook abgesichert per Token und starten automatisch einen Kubernetes-Job.

### 1. EventBus (Das Transportnetzwerk)
Zuerst definieren wir den EventBus im Namespace. Er stellt die NATS-Infrastruktur bereit, über die Events fliessen:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventBus
metadata:
  name: default
  namespace: argo-events
spec:
  nats:
    native:
      replicas: 3
```

### 2. EventSource (Webhook mit Secret-Validierung)
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
    beispiel-endpoint:
      port: "12000"
      endpoint: /payload
      method: POST
      # Sicherheits-Aspekt: Token-Validierung im Header
      authSecret:
        name: webhook-secret
        key: token
```

### 3. & 4. Sensor und Trigger (Filter & Ziel-Aktion)
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
      eventName: beispiel-endpoint
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

---

## Praxis-Einblick: Wo wir Skript-Chaos durch Argo Events ersetzen

In unseren Kundenprojekten setzen wir Argo Events ein, um unübersichtlichen Eigenbau-Code durch saubere Cloud-Native-Standards zu ersetzen:

* **Ereignisgesteuerte Datenverarbeitung:** Statt Dauer-Container laufen zu lassen, die minütlich Ordner abfragen, reagiert Argo Events direkt auf S3-File-Uploads und startet ressourcenschonend nur dann einen Verarbeitungs-Pod, wenn tatsächlich Daten vorliegen.
* **Sicherheit & Compliance out-of-the-box:** Enterprise-Kunden müssen Sicherheitsstandards einhalten. Argo Events deckt dies elegant ab:
  * *Authentifizierung:* HMAC-Signaturen (z. B. GitHub Webhook Secret Validation) oder Token-Checks werden direkt von der `EventSource` übernommen.
  * *Transport-Verschlüsselung:* Die Kommunikation über den `EventBus` lässt sich per TLS absichern.
  * *Feingranulares RBAC:* Über Kubernetes-Service-Accounts wird strikt begrenzt, welche Ressourcen ein `Sensor`-Trigger im Cluster überhaupt anlegen darf (Least-Privilege-Prinzip).
* **Event-Driven GitOps:** Benachrichtigungen von externen Systemen (wie Ticket-Systemen, Monitoring-Alerts oder Webhooks) können direkt genutzt werden, um über Argo CD gezielte Deployments oder Cluster-Synchronisationen auszulösen.
* **Kein Maintenance-Overhead für Webhook-Receiver:** Teams müssen keine eigenen Python- oder Go-Container mehr schreiben, testen, patchen oder in Container-Registries verwalten, nur um Nachrichten entgegenzunehmen.

---

## Fazit & Ausblick

Argo Events beendet die Ära der gebastelten Skripte und benutzerdefinierten Event-Empfänger. Zusammen mit Argo CD entsteht eine Architektur, die nicht nur ihren Zustand im Griff hat, sondern auch dynamisch, sicher und wartungsfrei auf Reize aus der Umwelt reagiert.

Das Beste daran: Ein Trigger in Argo Events ist keineswegs auf einfache Kubernetes-Jobs beschränkt. Wenn die Anforderungen an die Event-Verarbeitung komplexer werden – zum Beispiel wenn mehrstufige Daten-Pipelines, parallele Test-Abläufe oder komplexe DAGs (Directed Acyclic Graphs) benötigt werden – kommt der nächste grosse Baustein des Argo-Ökosystems ins Spiel.

*Im nächsten Teil unserer Blog-Serie widmen wir uns daher **Argo Workflows** – der mächtigen Workflow-Engine für Kubernetes.*

*Möchtet ihr Skript-Chaos in euren Clustern beseitigen oder euer Team fit für das gesamte Argo-Ökosystem machen? Sprecht unser Consulting-Team gerne für individuelle Workshops und Architektur-Beratung an.*