---
title: "Centris AG – OpenShift auf Bare Metal"
slug: "centris-openshift-auf-bare-metal"
description: "OpenShift auf Bare Metal für Centris: Plattform über drei Zonen mit OpenShift Virtualization, Hosted Control Planes & GitOps. In 5 Monaten produktiv. Zum Projekt!"
date: 2026-11-16T00:00:00+00:00
lastmod: 2026-11-16T00:00:00+00:00
draft: false
images: ["images/landing-pages/tk-giveaway-2024-1500x1000.png"]
Sitemap:
  Priority: 0.3
client: "Centris AG"
post_img: "images/landing-pages/tk-giveaway-2024-1500x1000.png"
img_border: false
lead: "Gemeinsam mit Puzzle ITC und der Centris hat tim&koko eine neue Red Hat OpenShift Plattform auf Bare Metal aufgebaut. Die Plattform erstreckt sich über drei Zonen und betreibt mit OpenShift Virtualization und Hosted Control Planes flexibel mehrere virtuelle Workload Cluster. Nach fünf Monaten Aufbau ging sie im November 2026 produktiv in Betrieb."

techStack: "Red Hat OpenShift, OpenShift Virtualization, Hosted Control Planes, GitOps, Argo CD, Helm, Kustomize, Prometheus, Grafana, GitLab"
copy: "Bild © Centris AG"
link: "https://www.centrisag.ch"
---

Die bestehenden OpenShift-Cluster der Centris liefen auf einer VMware-basierten Virtualisierungslösung, deren
Lizenzierung zunehmend hohe Kosten verursachte. Gleichzeitig benötigten performancehungrige Applikationen eine
Umgebung näher an der Hardware. tim&koko hat gemeinsam mit Puzzle ITC und der Centris die Architektur der neuen
Plattform erarbeitet, die Bare Metal Cluster sowie die Hosted Cluster vollständig über GitOps aufgebaut und den
Betrieb mitgestaltet. Die Plattform ist seit November 2026 produktiv, die ersten Workloads sind bereits migriert.

## Über die Centris AG

Die Centris AG ist eine führende IT-Dienstleisterin für Schweizer Kranken- und Unfallversicherer. Das Unternehmen
wurde 1947 gegründet und beschäftigt heute über 300 Mitarbeitende. Aktuell setzen 23 Kranken- und Unfallversicherer
mit rund 8000 Sachbearbeiterinnen und Sachbearbeiter sowie insgesamt etwa 4,3 Millionen Versicherten auf die
Branchenlösungen der Centris. Mit ihrer umfassenden Expertise in der Entwicklung, Integration und dem Betrieb
hochverfügbarer IT-Lösungen unterstützt die Centris ihre Kunden gezielt bei der digitalen Transformation.

Zu den Kernanforderungen gehören Stabilität, Verfügbarkeit und Sicherheit geschäftskritischer Anwendungen – darunter
die Swiss Health Platform (SHP). Mit dieser offenen und cloudbasierten Plattform vernetzt die Centris die Akteure im
Schweizer Gesundheitswesen und treibt den digitalen Wandel von Kranken- und Unfallversicherern aktiv voran.

## Herausforderung

Die Ausgangslage war geprägt durch drei zentrale Herausforderungen:

* **Lizenzkosten:** Die bestehenden OpenShift-Cluster liefen auf einer VMware-basierten Virtualisierungslösung. Die veränderte Lizenzierungssituation brachte das Risiko stark steigender Kosten mit sich.
* **Zeitdruck:** Der Aufbau der neuen Plattform musste verhältnismässig schnell gehen. Vom Einbau der Hardware bis zum produktiven Betrieb standen nur wenige Monate zur Verfügung – Architektur, Installation, Automatisierung und Betriebsprozesse mussten deshalb weitgehend parallel vorangetrieben werden.
* **Performance:** Eine performancehungrige Applikation war auf der bisherigen OpenShift-Umgebung für die Kund:innen zu langsam. Es galt zu prüfen, ob OpenShift auf neuer Hardware und näher am Metal die nötige Leistung bringt. Ohne diese Grundlage drohte die Modernisierung in Richtung Container ins Stocken zu geraten.

## Lösungsansatz

Anfang 2026 hat tim&koko gemeinsam mit Puzzle ITC und der Centris die Anforderungen an die neue Plattform
aufgenommen. In Workshops wurden die zukünftige Architektur, die Deploymentkonzepte, Monitoring, Backup und die Prinzipien für
Disaster Recovery erarbeitet.

### Architektur

Die Plattform basiert auf einem OpenShift Bare Metal Cluster, der über drei Zonen gestretcht ist:

* **3 Control Plane Nodes** und **3 Infra Nodes**, je einer pro Zone
* **9 Worker Nodes**, je drei pro Zone
* **OpenShift Virtualization** und **Hosted Control Planes**, um kleinere virtuelle Cluster auf der Bare Metal Plattform zu betreiben
* Ein ähnlicher Cluster im Ausweich-Rechenzentrum, der im Disaster-Recovery-Fall den Workload übernimmt

Der Ansatz mit Hosted Control Planes bringt mehrere Vorteile:

* Mehrere kleinere virtuelle Cluster lassen sich flexibel und mit minimalem Overhead auf der Bare Metal Plattform betreiben.
* Die Hardware-Ressourcen werden besser ausgelastet.
* Die Hosted Cluster sind einfacher zu managen: Virtuelle Nodes sind leichtgewichtiger als Bare Metal Nodes, Restarts gehen schnell, und die Nodes sind «Cattle» statt «Pets».

Dem stehen neue Konzepte gegenüber, die sich das Team erst erarbeiten muss. Zudem bringt der Virtualisierungslayer
einen minimalen Overhead und zu Beginn zusätzliche Komplexität mit sich.

### Aufbau und GitOps

Nach dem Einbau der neuen Hardware startete die Installation der Bare Metal Cluster. Parallel dazu wurde das
GitOps-Setup für die Bare Metal und die Hosted Cluster aufgebaut und die Plattform-Komponenten konfiguriert.
Anschliessend wurden die Hosted Cluster dimensioniert, konzipiert und auf Basis der GitOps-Automatisierung
provisioniert.

Für ein Projekt dieser Grösse war der Zeitrahmen knapp und das Team klein – und nicht alle Beteiligten brachten
bereits viel Erfahrung mit OpenShift auf Bare Metal mit. Wir haben deshalb nicht nur beraten, sondern hands-on
mit angepackt und Aufgaben direkt selbst umgesetzt, damit die Plattform termingerecht bereitstand.

### Migration, Betrieb und Wissenstransfer

Gemeinsam mit den Entwicklungsteams wurde die Migration der Workloads von der alten auf die neue Plattform geplant und
gestartet. Gleichzeitig wurden Betriebsthemen wie Monitoring, Backup- und Recovery-Prozesse sowie Lifecycle-Prozesse
aufgesetzt und durchgespielt.

Damit das interne Team die Plattform selbstständig betreiben und weiterentwickeln kann, haben wir ihm die neuen
Konzepte im Rahmen einer Argo CD-Schulung hands-on vermittelt.

## Ergebnisse

* Die produktive Bare Metal Plattform ging im November 2026 nach fünf Monaten Aufbau live und wurde in den Betrieb überführt.
* Der erste produktive Workload ist bereits migriert. Bis Ende Q1 2027 soll sämtlicher Workload auf der neuen Plattform laufen.
* Das Deployment der Plattform-Komponenten und der Hosted Cluster erfolgt vollständig über GitOps – nachvollziehbar und mit Git als Single Source of Truth.

## Kundenstatement

«Lorem Ipsum»

**TBD**, Role

## Fazit & Lessons Learned

Der Wechsel von VMware auf OpenShift Bare Metal zeigt, wie viel Flexibilität eine Plattform mit OpenShift
Virtualization und Hosted Control Planes bietet. Sie ist konsequent auf Automatisierung und Standardisierung
ausgelegt. Dafür bringen die Hosted Control Planes zusätzliche Komplexität mit sich – ein sauberes GitOps-Setup macht
diese aber deutlich verständlicher und beherrschbarer. Eine der grössten Herausforderungen im Projekt war es, die
Anforderungen aller Entwicklungsteams unter einen Hut zu bringen.

Eine zentrale Erkenntnis: Backup und Restore müssen immer sauber getestet werden. Beim Test des etcd-Restores auf dem
Engineering Bare Metal Cluster zeigte sich, dass der vom Hersteller dokumentierte Prozess Lücken aufwies. Statt der
erwarteten 40 Minuten benötigte der Restore mehrere Stunden Debugging und Fixing. Gerade solche Situationen machen
deutlich, wie essenziell fundiertes Infrastruktur-Know-how ist. Dank dieser Erfahrung konnten viele Lücken geschlossen
werden – und das Wissen wandert nun Schritt für Schritt ins Team der Centris.

Für uns ist das Projekt besonders spannend, weil wir eine Plattform von Grund auf neu aufbauen und dabei moderne
Technologien wie OpenShift Virtualization, Hosted Control Planes und GitOps auf Bare Metal einsetzen können. Entsprechend
gross ist unsere Begeisterung. Da wir direkt im Team der Centris mitarbeiten, sind die Wege kurz und wir konnten die
gesteckten Ziele gemeinsam erreichen.

Hast Du ähnliche Herausforderungen oder möchtest Du mehr über OpenShift auf Bare Metal, OpenShift Virtualization oder Hosted Control Planes erfahren? Kontaktiere uns für ein unverbindliches Gespräch:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">tim&koko kontaktieren</a>
