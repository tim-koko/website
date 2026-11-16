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

Die bestehenden OpenShift-Cluster der Centris liefen auf einer VMware-basierten Virtualisierungslösung, deren veränderte Lizenzierung zunehmend hohe Kosten verursachte. Gleichzeitig benötigten performancehungrige Applikationen eine Umgebung näher an der Hardware. Gemeinsam mit Puzzle ITC und der Centris hat tim&koko die Architektur der neuen Plattform erarbeitet, die Bare Metal Cluster sowie die Hosted Cluster vollständig über GitOps aufgebaut und den Betrieb aktiv mitgestaltet. Seit November 2026 ist die Plattform produktiv, und die ersten Workloads sind bereits migriert.

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

Die Centris stand vor der Aufgabe, ihre OpenShift-Umgebung auf eine neue, zukunftsfähige Basis zu stellen. Dabei galt es, drei zentrale Herausforderungen zu meistern:

* **Lizenzkosten:** Die bestehenden OpenShift-Cluster liefen auf einer VMware-basierten Virtualisierungslösung. Die veränderten Lizenzmodelle bargen das Risiko stark steigender Kosten.
* **Zeitdruck:** Der Aufbau der neuen Plattform musste in kurzer Zeit gelingen. Vom Einbau der Hardware bis zum produktiven Betrieb standen nur wenige Monate zur Verfügung, weshalb Architektur, Installation, Automatisierung und Betriebsprozesse weitgehend parallel vorangetrieben werden mussten.
* **Performance:** Eine performancehungrige Applikation war auf der bisherigen OpenShift-Umgebung für die Kund:innen zu langsam. Es galt zu belegen, dass OpenShift auf neuer Hardware – und damit näher am Metal – die erforderliche Leistung liefert. Ohne diesen Nachweis drohte die Container-Modernisierung ins Stocken zu geraten.

## Lösungsansatz

Anfang 2026 hat tim&koko gemeinsam mit Puzzle ITC und der Centris die Anforderungen an die neue Plattform aufgenommen. In Workshops wurden die zukünftige Architektur sowie Konzepte für Deployment, Monitoring, Backup und Disaster Recovery erarbeitet.

### Architektur

Die Plattform basiert auf einem OpenShift Bare Metal Cluster, der über drei Zonen gestretcht ist:

* **3 Control Plane Nodes** und **3 Infra Nodes**, je einer pro Zone
* **9 Worker Nodes**, je drei pro Zone
* **OpenShift Virtualization** und **Hosted Control Planes**, um kleinere virtuelle Cluster auf der Bare Metal Plattform zu betreiben
* Ein ähnlicher Cluster im Ausweich-Rechenzentrum, der im Disaster-Recovery-Fall den Workload übernimmt

Der Ansatz mit Hosted Control Planes bringt mehrere Vorteile:

* Mehrere kleinere virtuelle Cluster lassen sich flexibel und mit minimalem Overhead auf der Bare Metal Plattform betreiben.
* Die Hardware-Ressourcen werden deutlich besser ausgelastet.
* Die Hosted Cluster sind einfacher zu managen: Virtuelle Nodes sind leichtgewichtiger als Bare Metal Nodes, lassen sich schnell neu starten und folgen dem «Cattle»- statt «Pets»-Prinzip.

Gleichzeitig brachte dieser Ansatz neue Konzepte mit sich, in die sich das Team erst einarbeiten musste – ebenso wie einen geringen Virtualisierungs-Overhead und anfangs zusätzliche Komplexität.

### Aufbau und GitOps

Nach dem Einbau der neuen Hardware startete die Installation der Bare Metal Cluster. Parallel dazu entstand das GitOps-Setup für die Bare Metal sowie die Hosted Cluster, und die zentralen Plattform-Komponenten wurden konfiguriert. Anschliessend wurden die Hosted Cluster dimensioniert, konzipiert und vollständig automatisiert über GitOps provisioniert.

Für ein Projekt dieser Grösse waren der Zeitrahmen eng und das Team klein – zudem brachten noch nicht alle Beteiligten umfassende Erfahrung mit OpenShift auf Bare Metal mit. Wir haben deshalb nicht nur beratend unterstützt, sondern hands-on mit angepackt und Aufgaben direkt selbst umgesetzt, damit die Plattform termingerecht bereitstand.

### Migration, Betrieb und Wissenstransfer

Gemeinsam mit den Entwicklungsteams haben wir die Migration der Workloads von der bisherigen auf die neue Plattform geplant und angestossen. Parallel dazu wurden zentrale Betriebsthemen wie Monitoring sowie Backup-, Recovery- und Lifecycle-Prozesse definiert und durchgespielt.

Damit das interne Team die Plattform selbstständig betreiben und weiterentwickeln kann, haben wir ihm die neuen Konzepte im Rahmen einer [Argo CD-Schulung]({{< relref "/services/cloud-native-training.md" >}}) hands-on vermittelt.

## Ergebnisse

* Nach fünf Monaten Aufbauzeit ging die produktive Bare Metal Plattform im November 2026 live und wurde erfolgreich in den Betrieb überführt.
* Der erste produktive Workload ist bereits migriert; bis Ende Q1 2027 sollen sämtliche Workloads auf der neuen Plattform laufen.
* Das Deployment aller Plattform-Komponenten und Hosted Cluster erfolgt vollständig über GitOps – nachvollziehbar und mit Git als Single Source of Truth.

## Kundenstatement

«Lorem Ipsum»

**TBD**, Role

## Fazit & Lessons Learned

Der Wechsel von VMware auf OpenShift Bare Metal zeigt eindrücklich, wie viel Flexibilität eine Plattform mit OpenShift Virtualization und Hosted Control Planes bietet: Sie ist konsequent auf Automatisierung und Standardisierung ausgelegt. Zwar bringen Hosted Control Planes eine gewisse Grundkomplexität mit sich, doch ein sauberes GitOps-Setup macht diese gut verständlich und beherrschbar. Eine der grössten Herausforderungen im Projekt bestand darin, die vielfältigen Anforderungen aller Entwicklungsteams unter einen Hut zu bringen.

Eine zentrale Erkenntnis aus dem Projekt: Backup- und Restore-Szenarien müssen immer sauber getestet werden. Beim Test des etcd-Restores auf dem Engineering Bare Metal Cluster zeigte sich beispielsweise, dass der vom Hersteller dokumentierte Prozess Lücken aufwies: Statt der erwarteten 40 Minuten erforderte der Restore mehrere Stunden Debugging und Fixing. Gerade solche Praxistests verdeutlichen, wie essenziell fundiertes Infrastruktur-Know-how ist. Dank dieser Erfahrung konnten wir entscheidende Lücken schliessen – und dieses Wissen fliesst nun Schritt für Schritt ins Team der Centris.

Für uns ist dieses Projekt besonders spannend, weil wir eine Plattform von Grund auf neu aufbauen und dabei moderne Technologien wie OpenShift Virtualization, Hosted Control Planes und GitOps auf Bare Metal einsetzen können. Durch unsere direkte Mitarbeit im Team der Centris bleiben die Wege kurz – so konnten wir die gesteckten Ziele gemeinsam erreichen.

Hast Du ähnliche Herausforderungen oder möchtest Du mehr über OpenShift auf Bare Metal, OpenShift Virtualization oder Hosted Control Planes erfahren? Kontaktiere uns für ein unverbindliches Gespräch:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">tim&koko kontaktieren</a>
