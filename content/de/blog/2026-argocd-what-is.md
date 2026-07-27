---
title: "Was ist ArgoCD? Und warum es sich mit einem Thermostat vergleichen lässt"
slug: "argocd-what-is"
description: ""
date: 2026-07-13T00:00:00+00:00 # fix 2026-07-13T00:00:00+00:00
lastmod: 2026-07-13T00:00:00+00:00 # fix 2026-07-13T00:00:00+00:00
draft: false
#images: ["images/blog/argocd/argocd-what-is-1200x630.png"]
img_border: false
Sitemap:
  Priority: 0.9

additionalblogposts: [ 'kubernetes-hotel', 'kubevirt-whatis']

categories: ["Technologie", "Kubernetes", "ArgoCD"]
authors: ['miriam-streit']
#post_img: "images/blog/argocd/argocd-what-is-1500x1000.png"
lead: "Klassische CI/CD-Pipelines stossen bei Kubernetes schnell an ihre Grenzen: Es fehlt die Transparenz beim Deployment, und manuelle Eingriffe sind weiterhin möglich und sorgen für Abweichungen zwischen Git und Cluster. Wie lassen sich diese Probleme lösen?"
---

Argo CD löst das mit visuellem GitOps: Dieser Guide zeigt, wie Pull-Modell, automatische Selbstheilung und klare Observability Kubernetes-Deployments vereinfachen.

### Das Problem: Wie früher auf Kubernetes deployed wurde

Wer in den Anfangstagen von Kubernetes Deployments aufgesetzt hat, landete fast automatisch beim klassischen **Push-Modell**. Der Ablauf schien logisch: Ein Code-Commit löst eine CI-Pipeline in GitHub Actions, GitLab CI oder Jenkins aus. Die Pipeline baut das Container-Image, schiebt es in eine Registry und führt am Ende ein schlichtes `kubectl apply -f manifest.yaml` aus.

Was auf dem Papier funktioniert, erzeugt in der Praxis schnell vier zentrale Probleme:

- **Sicherheitsrisiko durch externe Zugangsdaten**: Damit eine externe CI-Pipeline Befehle im Cluster ausführen kann, braucht sie Administratorrechte. Das bedeutet, dass langlebige Kubeconfigs oder API-Tokens in Drittanbieter-Systemen hinterlegt werden müssen. Wird die CI-Pipeline kompromittiert, steht Angreifern das Tor zum gesamten Cluster offen.

- **Der schleichende Konfigurations-Drift**: Wenn es in der Produktion brennt, greifen Admins in der Hektik oft direkt zum Terminal und passen Ressourcen mit `kubectl edit` im Live-System an. Das löst das akute Problem, erzeugt aber Drift: Der Ist-Zustand im Cluster entspricht nicht mehr dem Soll-Zustand in Git. Beim nächsten Pipeline-Durchlauf werden die manuellen Hotfixes unbemerkt überschrieben - oder die Pipeline bricht ab.

- **Trügerische Erfolgsmeldungen**: Ein `kubectl apply` meldet der CI-Pipeline schon dann ein erfolgreiches „OK“, wenn das Manifest fehlerfrei an die Kubernetes-API übergeben wurde. Ob die neuen Pods danach wegen eines Tippfehlers in den Umgebungsvariablen in einen CrashLoopBackOff geraten, bekommt die Pipeline gar nicht mehr mit. Das CI-Dashboard zeigt ein grünes Häkchen, obwohl die Anwendung offline ist.

- **Keine Wiederherstellbarkeit ohne Pipeline**: Fällt ein Cluster komplett aus, reicht es nicht aus, einen neuen Kubernetes Cluster aufzusetzen. Man muss darauf hoffen, dass alle CI-Pipelines fehlerfrei durchlaufen, um den vorherigen Zustand wiederherzustellen - ein langwieriger und fehleranfälliger Prozess im Katastrophenfall.

{{< custom-image "../images/argocd/classic-pipeline-approach.png" >}}

### Die Lösung: Was ist Argo CD & GitOps?

Die Antwort auf die Schwächen des klassischen Push-Modells ist **GitOps**. Das Kernprinzip ist denkbar einfach: Ein Git-Repository dient als die einzige verlässliche Wahrheitsquelle (_Single Source of Truth_) für den gesamten gewünschten Zustand der Infrastruktur und Anwendungen.

Anstatt Änderungen von aussen in den Cluster zu drücken, dreht **Argo CD** den Spiess um. Als deklarativer Controller läuft Argo CD innerhalb des Kubernetes-Clusters. Das System funktioniert nach dem **Pull-Prinzip**:

1. Argo CD überwacht kontinuierlich das Git-Repository.
2. Es vergleicht den dort definierten Soll-Zustand (_Target State_) mit dem tatsächlichen Ist-Zustand (_Live State_) im Cluster.
3. Stellt Argo CD eine Abweichung fest, synchronisiert es die Ressourcen automatisch oder auf Knopfdruck.

Man kann sich Argo CD wie einen **Thermostat** im Gebäude vorstellen: Die Zieltemperatur wird festgelegt (Soll-Zustand in Git). Wenn jemand ein Fenster öffnet und es kalt wird (Ist-Zustand im Cluster driftet ab), reagiert der Thermostat von selbst und regelt nach, bis die Wunschtemperatur wieder erreicht ist.

{{< custom-image "../images/argocd/argocd-approach.png" >}}

### Grundlegende Architektur: Wie Argo CD arbeitet

Um Argo CD zu verstehen, muss man nicht den gesamten Quellcode kennen. Es reicht ein Blick auf die drei Hauptkomponenten, die im Cluster laufen:

- **API Server**: Die Schnittstelle nach aussen. Er stellt die Daten für das Web-Dashboard und die CLI bereit, verwaltet Benutzerrechte und nimmt manuelle Befehle (wie ein manuelles Auslösen der Synchronisation) entgegen.

- **Repository Server**: Der Übersetzer. Dieser Dienst hält die Verbindung zu den konfigurierten Git- oder Helm-Repositories aufrecht. Er lädt die Manifeste herunter und wandelt sie in verarbeitbares Kubernetes-YAML um - egal ob reine Manifeste, Helm Charts oder Kustomize zum Einsatz kommen.

- **Application Controller**: Das Gehirn. Dieser Controller prüft dauerhaft den Cluster-Zustand, vergleicht ihn mit den aufbereiteten Daten des Repository Servers und führt bei Abweichungen die nötigen Änderungen durch.

#### Die zwei wichtigsten Status-Metriken

Beim Blick auf eine Anwendung in Argo CD bewertet das System den Zustand nach zwei klaren Kriterien:

- **Sync Status**: Entspricht der Cluster dem Git-Repository?
  - `Synced`: Cluster und Git sind identisch.
  - `OutOfSync`: Im Git liegt ein neuer Commit oder im Cluster wurde etwas verändert.

- **Health Status**: Funktionieren die erzeugten Ressourcen auch?
  - `Healthy`: Pods laufen und sind bereit.
  - `Progressing`: Das Deployment läuft noch (z. B. neue Pods starten gerade).
  - `Degraded`: Ein Pod crashed oder eine Ressource kann nicht gestartet werden.

### Ein einfaches Beispiel: Die Application-Ressource

In Argo CD ist jede bereitgestellte Anwendung selbst wieder ein natives Kubernetes-Objekt - eine sogenannte Custom Resource Definition (CRD) vom Typ `Application`.

Das folgende Minimalbeispiel zeigt, wie wenig Konfiguration nötig ist, um eine Anwendung vollständig via GitOps zu verwalten:

```YAML
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-example-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'https://github.com/my-project/app-manifests.git'
    targetRevision: HEAD
    path: k8s-manifests
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

#### Die wichtigsten Felder erklärt:

- `source`: Welches Git-Repository, welcher Branch (`targetRevision`) und welcher Ordnerpfad (`path`) enthalten die Kubernetes-Manifeste?

- `destination`: Welcher Ziel-Cluster und welcher Ziel-Namespace sollen beliefert werden?

- `syncPolicy`: Hier passiert die Magie. Mit `automated` synchronisiert Argo CD Änderungen in Git ohne manuellen Eingriff. `prune` löscht Ressourcen im Cluster, wenn sie aus Git entfernt wurden. `selfHeal` stellt sicher, dass manuelle Änderungen im Cluster sofort wieder überschrieben werden.

### Praxis-Einblick: Warum wir Argo CD in jedem Consulting-Projekt einsetzen

In unseren Kundenprojekten ist Argo CD kein "Nice-to-have", sondern der Standard-Baustein für jede Plattform. Das liegt an handfesten Vorteilen im Projektalltag:

- **Keine Admin-Zugangsdaten im CI**: Das CI-System baut nur noch Container-Images und aktualisiert Versions-Tags in Git. Da Argo CD im Cluster sitzt und sich die Änderungen zieht, müssen keine clusterweiten Admin-Tokens in GitHub Actions, GitLab CI oder Jenkins hinterlegt werden.

- **Visuelle Transparenz für das gesamte Team**: Kubernetes-Befehle im Terminal sind für viele Entwickler oder QA-Teams eine Hürde. Das Web-UI von Argo CD zeigt den gesamten Ressourcen-Baum visuell an, inklusive Pod-Logs, Statusanzeigen und Vorschauen von Änderungen.

- **Ein zentrales Dashboard für mehrere Cluster**: Argo CD muss nicht in jedem Cluster neu installiert werden. Ein zentraler Management-Cluster kann problemlos Deployments auf Dutzende entfernte Cluster (Dev, Staging, Prod) verteilen.

- **Enterprise-Sicherheit mit SSO & RBAC**: Über Anbindungen an Okta, Azure AD, GitHub oder GitLab lässt sich genau steuern, wer worauf Zugriff hat. Junior-Devs sehen Logs auf Staging, während der Sync-Button für die Produktion geschützt bleibt.

- **Integrierte Selbstheilung & Disaster Recovery**: Wird im Cluster aus Versehen ein Service gelöscht, stellt Argo CD ihn sofort wieder her. Fällt ein kompletter Cluster aus, reicht es, einen neuen aufzusetzen und Argo CD auf das Git-Repo zu zeigen - die Umgebung steht innerhalb von Minuten exakt wie zuvor.

- **Automatisierte Datenbank-Migrationen mit Sync Hooks**: Über sogenannte `PreSync`-Hooks führt Argo CD vor dem eigentlichen Code-Deployment einen Datenbank-Migrations-Job aus. Erst wenn dieser erfolgreich beendet ist, werden die neuen Anwendungs-Pods gestartet.

- **Skalierbarkeit durch ApplicationSets**: Wenn aus einer Anwendung 50 Microservices über 10 Standorte werden, erstellt man nicht 500 Manifeste manuell. Das `ApplicationSet`-Feature generiert diese Objekte dynamisch auf Basis von Vorlagen.

- **Zukunftssicher für Progressive Delivery**: Sobald Teams fortgeschrittene Deployment-Strategien wie Canary- oder Blue-Green-Deployments benötigen, lässt sich das Schwesterprojekt Argo Rollouts nahtlos integrieren.

### Fazit & nächste Schritte

Argo CD nimmt dem Thema Kubernetes-Deployment seine historische Komplexität. Es schliesst die Sicherheitslücken klassischer CI-Pipelines, verhindert Drift und gibt Teams die volle Kontrolle über ihre Infrastruktur zurück.

_Die Einführung von GitOps ist technisch schnell gemacht - die Herausforderung liegt meist in der passenden Repository-Struktur, dem Rechtemodell und den Prozessen im Team. Bei Bedarf an Unterstützung bei der Konzeption, der Integration in bestehende Systeme oder Schulungen für Entwickler- und Platform-Teams steht unser Consulting-Team gerne zur Verfügung._

_Wer Argo CD lieber hands-on erlernen möchte: In unserem eintägigen [Argo CD Workshop bei Acend](https://acend.ch/trainings/argo-cd/) werden die Grundlagen direkt an einem bereitgestellten Testcluster erarbeitet - von der Installation über Application-Ressourcen bis hin zu Sync-Strategien und ApplicationSets._
