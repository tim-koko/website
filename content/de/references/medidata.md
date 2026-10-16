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
lead: "tim&koko unterstützt die MediData seit dem Frühling 2025 beim Aufbau einer Kafka-Messaging-Plattform von Grund auf. Sie soll die bestehende Microservice-Architektur ergänzen und ActiveMQ sowie geteilte Datenbank-Views schrittweise ablösen. Dabei ist es das Ziel, die unterschiedlichen Verantwortlichkeiten der Teams, mehrere OpenShift-Umgebungen und den Schutz personenbezogener Daten von Anfang an zu berücksichtigen."
techStack: "Red Hat OpenShift, Streams for Apache Kafka, Apicurio Registry"
copy: "Bild © MediData AG"
link: "https://www.medidata.ch"
---

# TODO Bildli, Statement, Fazit, einheitlicher CTA

Bei dem Projekt bringt tim&koko langjährige Erfahrung in den Bereichen Kafka, OpenShift Engineering, Betrieb, Security und Observability ein und unterstützt bei der Konzeption und Umsetzung der neuen Kafka-Plattform. Dabei wird eng mit dem Plattform-Team und den Entwicklern zusammengearbeitet, um eine auf sie zugeschnittene Lösung zu erarbeiten und das Wissen innerhalb der Firma zu verteilen.

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

MediData will eine Kafka-Messaging-Plattform von Grund auf aufbauen und in die bestehende Microservice-Architektur integrieren. Bislang tauschten die Services Daten über ActiveMQ-Nachrichten oder geteilte Views in einer monolithischen Oracle-Datenbank aus. Im Rahmen eines langfristigen Entkopplungsvorhabens soll Kafka diese beiden Wege schrittweise ablösen. Die wesentlichen Herausforderungen sind:

* **Integration in die bestehende Architektur:** Die neue Plattform muss sich in die vorhandenen Services und deren bisherigen Kommunikationswege einfügen sowie vollständig mit GitOps verwaltet werden.
* **Datenschutz und Berechtigungen:** Da einzelne Daten personenbezogen sind, muss das Need-to-know-Prinzip beim Zugriff auf Daten berücksichtigt werden.
* **Aufbau und Know-how:** Die Plattform entsteht neu, während auf Kundenseite zu Beginn erst wenig Kafka-Erfahrung vorhanden war.
* **von PoC zu Produktion:** Zu Beginn des Projekts musste entschieden werden, ob Kafka überhaupt geeignet ist. Der Proof of Concept muss so gebaut werden, damit er später leicht zu einer produktiven Instanz weiterentwickelt werden kann.

## Lösungsansatz

Als erster Schritt des Projekts sollte ein Proof of Concept gebaut werden, damit entschieden werden kann, ob Kafka die bisherigen Anforderungen abdeckt. Nach dieser Entscheidung begannen wir, den PoC Meilenstein für Meilenstein in eine produktionsreife Plattform weiterzuentwickeln. So hatten die MediData die Möglichkeit, schon zu Beginn erste Tests mit den Entwicklern auf der Plattform zu starten. Wir konnten das Feedback früh abholen und laufend einfliessend lassen.

Da die MediData bereits zwei OnPrem RedHat OpenShift Cluster betreibt, fiel die Wahl des Ökosystems auf RedHat Streams for Apache Kafka, das auf dem OpenSource Projekt Strimzi basiert. Verlangt waren zwei Kafka-Cluster, die jeweils zwei Stages abdecken und auf dedizierten Nodes der OpenShift Cluster laufen. Sämtliche Konfigurationen und Tools der Cluster werden bereits mit GitOps verwaltet, daher war dies für die Kafka Plattform eine Grundanforderung. Dies ermöglicht uns, den Entwicklern zum Erstellen von neuen Topics und Usern einen Self-Service via GitLab-Merge-Request im entsprechenden Repository anzubieten.

### Authentication und Authorization

Beim Thema Authentication haben wir uns gemeinsam mit dem Projektteam für eine servicebasierte Architektur entschieden. Jede Applikation erhält einen eigenen KafkaUser mit den minimal benötigten Berechtigungen. Die Authorization wird mit einem Namenskonzept basierend auf Präfixen bei Topicnamen umgesetzt. Vorerst binden wir keine externe IDP wie Keycloak an.

### Ergänzung des Ökosystems

Eine Kafka-Installation kommt selten allein. Zusätzlich dazu installierten wir bald die Apicurio Registry zur Verwaltung von Schemas. Die gratis zur Verfügung gestellten Pod- und ServiceMonitors und Grafana-Dashboards vom Strimzi importierten wir, damit Monitoring und Observability schon früh abgedeckt waren. Noch offen sind Tools für Benutzeroberflächen sowie für die Imports von Daten.

## Aktueller Stand & Ergebnisse

Die Plattform ist mitten im Aufbau. Die Entwickler führen damit aktuell erste Tests durch und wir kümmern uns darum, die Plattform so bald wie möglich reif für die Produktion zu machen.

* Für den Aufbau der Infrastruktur haben wir auf GitOps gesetzt, was uns unter anderem einen Self-Service für die Entwickler ermöglicht und sich nahtlos in die restlichen Infrastruktur-Deployments integriert.
* Die Authentifizierung erfolgt mittels KafkaUser Objekten. Später werden wir diese Objekte mit Vault synchronisieren. So wird das Need-to-know Prinzip von Anfang an umgesetzt und Vault behält die Hoheit über alle Credentials.
* AKHQ sowie ein angenehmer Zugriff der Entwickler zwecks Troubleshooting stehen noch auf der Planung.
* Mit Debezium sollen zukünftig die Daten der Oracle Datenbanken in die Kafka Topics eingespiesen werden.
* Die Kafka-Cluster wurden ganz am Anfang mit Maintenance-Tooling und Monitoring ergänzt, was zukünftiges Troubleshooting vereinfacht.
* Eine Schema-Registry von Apicurio zur Verwaltung von Schema-Versionen rundet das Ökosystem ab.

## Kundenstatement

«Statement»

**Autor**, Rolle

## Fazit & Lessons Learned

todo

Haben Sie ähnliche Herausforderungen oder möchten Sie mehr über Apache Kafka erfahren? Kontaktieren Sie uns für ein unverbindliches Gespräch:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">tim&koko kontaktieren</a>
