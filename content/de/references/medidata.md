---
title: "MediData – Aufbau Kafka Plattform"
slug: "medidata-aufbau-kafka-platform"
description: "Kafka-Plattform für MediData: Aufbau von Grund auf, integriert in die bestehende Microservice-Architektur auf OpenShift."
date: 2026-10-09T00:00:00+00:00
lastmod: 2026-10-09T00:00:00+00:00
draft: false
images: ["images/projects/tk-Ref-Centris-1200x630px-og.jpg"]
Sitemap:
  Priority: 0.3
client: "MediData AG"
post_img: "images/projects/tk-Ref-Centris-1500x1000px.jpg"
img_border: false
lead: "tim&koko unterstützte MediData beim Aufbau einer Kafka-Messaging-Plattform von Grund auf. Sie soll die bestehende Microservice-Architektur ergänzen und ActiveMQ sowie geteilte Datenbank-Views schrittweise ablösen."
techStack: "Red Hat OpenShift, Streams for Apache Kafka, Apicurio Registry"
copy: "Bild © MediData AG"
link: "https://www.medidata.ch"
---

# TODO Bildli, Statement, einheitlicher CTA

tim&koko unterstützte MediData beim Aufbau einer Kafka-Messaging-Plattform von Grund auf und bei ihrer Integration in
die bestehende Microservice-Architektur. Bisher tauschten die Services Daten über ActiveMQ oder gemeinsam genutzte
Views in einer Oracle-Datenbank aus. Kafka soll diese Kommunikationswege im Rahmen des langfristigen
Entkopplungsvorhabens schrittweise ablösen. Dabei galt es, die unterschiedlichen Verantwortlichkeiten der Teams,
mehrere OpenShift-Umgebungen und den Schutz personenbezogener Daten von Anfang an zu berücksichtigen.

## Über die MediData AG

Die 1994 gegründete MediData AG hat ihren Sitz in Root. Heute engagieren sich über 90 Mitarbeitende für die
Digitalisierung des Schweizer Gesundheitswesens. Ein zentrales Angebot dafür ist das 2018 lancierte MediData-Netz:
Als digitale Plattform ermöglicht es den administrativen Datenaustausch zwischen Leistungserbringern und Versicherern.
Laut MediData sind sämtliche Schweizer Versicherer daran angeschlossen.

Wie breit die Plattform genutzt wird, zeigen die aktuellen Zahlen: Rund 8'700 Ärzt:innen, 95 % der Spitäler, über
2'000 Heime und Spitex-Organisationen, 81 % der Labors sowie 98 % der Apotheken nutzen das Netz und die zugehörigen
Lösungen. Zusammen kommen sie auf über 22'000 Anschlüsse; pro Jahr wickelt MediData rund 117 Millionen
Transaktionen ab.

Hinter dieser Reichweite steht eine kontinuierliche Weiterentwicklung: 2013 erhielt MediData die ISO-27001-
Zertifizierung für Informationssicherheit, 2022 folgte der elektronische Versand von Rechnungen und Rechnungskopien
an Patient:innen. Da über die Plattform besonders schützenswerte Gesundheitsdaten verarbeitet werden, haben
Datenschutz und Informationssicherheit bei MediData einen hohen Stellenwert.

## Herausforderung

MediData wollte eine Kafka-Messaging-Plattform von Grund auf aufbauen und in die bestehende Microservice-Architektur integrieren. Bislang tauschten die Services Daten über ActiveMQ-Nachrichten oder geteilte Views in einer monolithischen Oracle-Datenbank aus. Im Rahmen eines langfristigen Entkopplungsvorhabens soll Kafka diese beiden Wege schrittweise
ablösen. Die wesentlichen Herausforderungen waren:

* **Integration in die bestehende Architektur:** Die neue Plattform musste sich in die vorhandenen Services und deren bisherige Kommunikationswege einfügen.
* **Schrittweise Entkopplung:** ActiveMQ und gemeinsam genutzte Datenbank-Views sollten mittelfristig durch Kafka-Messaging ersetzt werden, ohne den Produktivbetrieb zu stören.
* **Datenschutz und Berechtigungen:** Da einzelne Daten personenbezogen sind, musste das Need-to-know-Prinzip beim Zugriff auf Daten berücksichtigt werden.
* **Aufbau und Know-how:** Die Plattform entstand neu, während auf Kundenseite erst wenig Kafka-Erfahrung vorhanden war.

## Lösungsansatz

wahl von apache streams für kafka aufgrund von bestehendem RedHat OpenShift Ecosystem
aufbau mit gitops
vier Stages, zwei Cluster, dedizierte Nodes
Netzwerksegmentierung auf Cluster erwähnen?
berechtigungen via Kafkauser, präfixbasierte authz
self service devs: in git user & topics anlegen, mit Argo ausrollen lassen
apicurio registry installiert
später anbindung an oracle dbs
akhq & debezium
default strimzi dashboards / pod/svc monitors für monitoring

### mit Untertiteln

## Ergebnisse

* Die Plattform ist mitten im Aufbau. Die Entwickler führen damit aktuell erste Tests durch und wir kümmern uns um die Überführung in den produktiven Betrieb.
* Für den Aufbau setzten wir auf GitOps, was uns unter anderem einen Self-Service für die Entwickler ermöglicht und nahtlos in die restlichen Infrastruktur-Deployments integriert.
* Die Authentifizierung erfolgt mittels KafkaUser Objekten. Später werden wir diese Objekte mit Vault synchronisieren.
* AKHQ sowie ein angenehmer Zugriff für Entwickler stehen noch auf der Planung.
* Die Kafka-Cluster wurden mit Maintenance-Tooling und Monitoring ergänzt, was zukünftiges Troubleshooting vereinfacht.

## Kundenstatement

«Statement»

**Autor**, Rolle

## Fazit & Lessons Learned

Haben Sie ähnliche Herausforderungen oder möchten Sie mehr über Apache Kafka erfahren? Kontaktieren Sie uns für ein unverbindliches Gespräch:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">tim&koko kontaktieren</a>
