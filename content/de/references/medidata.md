---
title: "MediData – Aufbau Kafka Plattform"
slug: "medidata-aufbau-kafka-platform"
description: "Kafka-Plattform für MediData: Aufbau von Grund auf, integriert in die bestehende Microservice-Architektur auf Red Hat OpenShift."
date: 2026-10-09T00:00:00+00:00
lastmod: 2026-10-09T00:00:00+00:00
draft: false
images: ["images/landing-pages/tk-giveaway-2024-1500x1000.png"]
Sitemap:
  Priority: 0.3
client: "MediData AG"
post_img: "images/landing-pages/tk-giveaway-2024-1500x1000.png"
img_border: false
lead: "tim&koko unterstützt die MediData seit dem Frühling 2026 beim Aufbau einer Kafka-Messaging-Plattform von Grund auf. Sie soll die bestehende Microservice-Architektur ergänzen und ActiveMQ sowie geteilte Datenbank-Views schrittweise ablösen. Dabei ist es das Ziel, die unterschiedlichen Verantwortlichkeiten der Teams, mehrere Red Hat OpenShift-Umgebungen und den Schutz personenbezogener Daten von Anfang an zu berücksichtigen."
techStack: "Red Hat OpenShift, Red Hat Streams for Apache Kafka, Apicurio Registry"
copy: "Bild © MediData AG"
link: "https://www.medidata.ch"
---

Bei dem Projekt bringt tim&koko langjährige Erfahrung in den Bereichen Kafka, OpenShift Engineering, Betrieb, Security und Observability ein und unterstützt bei der Konzeption und Umsetzung der neuen Kafka-Plattform. Dabei wird eng mit dem Plattform-Team und den Entwickler:innen zusammengearbeitet, um eine auf sie zugeschnittene Lösung zu erarbeiten und das Wissen innerhalb der Firma zu verteilen.

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

Als erster Schritt des Projekts sollte ein Proof of Concept gebaut werden, damit entschieden werden kann, ob Kafka die bisherigen Anforderungen abdeckt. Nach dieser Entscheidung begannen wir, den PoC Meilenstein für Meilenstein in eine produktionsreife Plattform weiterzuentwickeln. So hatte die MediData die Möglichkeit, schon zu Beginn erste Tests mit den Entwickler:innen auf der Plattform zu starten. Wir konnten das Feedback früh abholen und laufend einfliessen lassen.

Da die MediData bereits zwei OnPrem Red Hat OpenShift Cluster betreibt, fiel die Wahl des Ökosystems auf Red Hat Streams for Apache Kafka, das auf dem OpenSource Projekt Strimzi basiert. Verlangt waren zwei Kafka-Cluster, die jeweils zwei Stages abdecken und auf dedizierten Nodes der Red Hat OpenShift Cluster laufen. Sämtliche Konfigurationen und Tools der Cluster werden bereits mit GitOps verwaltet, daher war dies für die Kafka Plattform eine Grundanforderung. Dies ermöglicht uns, den Entwickler:innen zum Erstellen von neuen Topics und Usern einen Self-Service via GitLab-Merge-Request im entsprechenden Repository anzubieten.

### Authentifizierung und Autorisierung

Beim Thema Authentifizierung haben wir uns gemeinsam mit dem Projektteam für eine servicebasierte Architektur entschieden, bei welcher jede Applikation als eigenständiger User abgebildet wird. Mittels Namenskonzept, basierend auf Präfixen für Topics und Konsumenten, erlaubt dies, nur die minimal benötigten Berechtigungen pro Applikation zu vergeben und das Need-to-know-Prinzip umzusetzen.

### Ergänzung des Kafka Ökosystems

Eine Kafka-Installation kommt selten allein. Zusätzlich zur aufgebauten Kafka-Plattform wurde die Apicurio Registry zur Verwaltung von Schemas installiert. Die Metriken der gesamten Kafka Plattform und ihres Ökosystems werden über PodMonitors und ServiceMonitors in Prometheus erfasst und in Grafana dargestellt, wofür wir die Dashboards von Strimzi verwendet haben. So konnte die Observability von Anfang an mit aufgebaut werden.

## Aktueller Stand & Ergebnisse

Die Plattform steht den Entwicklungsteams für erste Tests und Integrationen zur Verfügung. Deren Feedback fliesst laufend in die Weiterentwicklung ein, während die Plattform schrittweise in die Produktion überführt wird.

* Für den Aufbau der Infrastruktur haben wir auf GitOps gesetzt, was uns unter anderem einen Self-Service für die Entwickler:innen ermöglicht und sich nahtlos in die restlichen Infrastruktur-Deployments integriert.
* Die Authentifizierung erfolgt mittels KafkaUser-Objekten. In einer nächsten Phase werden deren Credentials mit Vault synchronisiert, um eine zentrale Verwaltung zu ermöglichen. Durch die Autorisierung und ein auf das Unternehmen abgestimmtes Namenskonzept konnte das Need-to-know-Prinzip durchgängig umgesetzt werden.
* Die Kafka-Cluster wurden bereits zu Beginn mit einem Maintenance-Tooling und Monitoring versehen, um zukünftiges Troubleshooting zu vereinfachen.
* Die Apicurio Schema-Registry erlaubt es den Entwickler:innen, ihre Schema-Versionen zentral zu verwalten und die Kompatibilität dieser Schemas zu managen.
* AKHQ sowie ein User-Zugriff der Entwickler:innen zwecks Troubleshooting werden in der nächsten Phase bereitgestellt.
* Mit Debezium sollen zukünftig die Daten der Oracle Datenbanken in die Kafka Topics eingespiesen werden.

## Kundenstatement

«Statement»

**Autor**, Rolle

## Fazit & Lessons Learned

Der Aufbau der Kafka-Plattform bei MediData zeigt, wie sich ein Proof of Concept schrittweise zur Grundlage einer produktiven Messaging-Infrastruktur weiterentwickeln lässt. Die frühe Einbindung der Entwicklungsteams ermöglicht es, Anforderungen und Priorisierungen praxisnah zu prüfen und Rückmeldungen direkt in die Umsetzung einfliessen zu lassen. Gleichzeitig werden mit GitOps, einem abgestimmten Berechtigungskonzept und integriertem Monitoring die Voraussetzungen für den späteren Betrieb geschaffen.

Entscheidend ist dabei nicht nur die technische Umsetzung, sondern auch die enge Zusammenarbeit mit dem Plattform-Team und den Entwickler:innen. So entsteht gemeinsam das Know-how, um die Plattform langfristig zu betreiben und weiterzuentwickeln. Damit legt MediData die Grundlage, bestehende Kommunikationswege schrittweise abzulösen und die Entkopplung ihrer Microservices voranzutreiben.

Haben Sie ähnliche Herausforderungen oder möchten Sie mehr über Apache Kafka, Red Hat Streams for Apache Kafka oder Strimzi erfahren? Kontaktieren Sie uns für ein unverbindliches Gespräch:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">tim&koko kontaktieren</a>
