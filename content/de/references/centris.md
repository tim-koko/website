---
title: "Centris – Kafka Storage Migration"
description: ""
date: 2025-09-01T00:00:00+00:00
lastmod: 2025-09-01T00:00:00+00:00
draft: false
images: ["images/projects/tk-Ref-Centris-1200x630px-og.jpg"]
Sitemap:
Priority: 0.3
client: "Centris AG"
post_img: "images/projects/tk-Ref-Centris-1500x1000px.jpg"
img_border: false
lead: "Wir dürfen die Centris bereits seit längerem in den Bereichen Kafka Messaging und OpenShift Engineering unterstützen. Unter anderem auch bei der Storage-Migration ihrer auf Red Hat OpenShift Streams for Apache Kafka basierenden Cluster. Das Ziel war eine unterbruchsfreie Migration des Kafka-Storage von einem abzulösenden Storage-System auf eine neue Storage-Infrastruktur."
techStack: "Red Hat OpenShift, Streams for Apache Kafka, Kafka Cruise Control, Prometheus, Grafana"
copy: "Bild © Centris AG"
link: "https://www.centrisag.ch"
---


Durch den Wechsel des Storage-Systems mussten sämtliche Applikationen, die auf Red Hat OpenShift persistente Daten
ablegen, auf das neue Storage-System migriert werden. tim&koko hat die Storage-Migration der Kafka-Cluster geplant
und gemeinsam mit den Kafka-Administratoren der Centris erfolgreich umgesetzt. Das gewählte Vorgehen unterstützt den
regulären Cluster-Lifecycle und ermöglicht bereits Vorarbeiten für absehbare Migrationen wie die
Zookeeper-zu-KRaft-Migration. So konnten nicht nur die Hauptziele der Storage-Migration erreicht werden – zusätzlich
wurde ein nachhaltiger technologischer Mehrwert für die Centris geschaffen.

## Über die Centris AG

Die Centris AG ist eine führende IT-Dienstleisterin für Schweizer Kranken- und Unfallversicherer. Das Unternehmen
wurde 1947 gegründet und beschäftigt heute über 300 Mitarbeitende. Aktuell setzen 23 Kranken- und Unfallversicherer
mit rund 8000 Sachbearbeiterinnen und Sachbearbeiter sowie insgesamt etwa 4,3 Millionen Versicherten auf die
Branchenlösungen der Centris. Mit ihrer umfassenden Expertise in der Entwicklung, Integration und dem Betrieb
hochverfügbarer IT-Lösungen unterstützt die Centris ihre Kunden gezielt bei der digitalen Transformation.

Zu den Kernanforderungen gehören Stabilität, Verfügbarkeit und Sicherheit geschäftskritischer Anwendungen – darunter
die Swiss Health Platform (SHP). Mit dieser offenen und cloudbasierten Plattform vernetzt die Centris die Akteure im
Schweizer Gesundheitswesen und unterstützt den digitalen Wandel von Kranken- und Unfallversicherern aktiv voran.

## Herausforderung

Die Ausgangssituation war geprägt durch mehrere produktive Kafka-Cluster, deren zugrunde liegende Storage-Systeme
zeitnah das Ende des Supports erreichten. Die wesentlichen Herausforderungen waren:

* **Produktionsumgebung:** Die Migration muss unterbruchsfrei und ohne Risiko für laufende Anwendungen erfolgen.
* **Zeitdruck:** Aufgrund des auslaufenden Storage-Supports bestand eine enge Deadline.
* **Komplexität:** Diverse Vorarbeiten waren nötig, insbesondere im Bereich Cluster-Setup und Monitoring.
* **Monitoring:** Zur sicheren Steuerung und Überwachung der Migration musste ein Cluster-Monitoring auf Basis des Zookeeper-Management-Interfaces und Kafka-Metriken implementiert werden.

## Lösungsansatz

Beide Systeme - Apache Zookeeper und Apache Kafka - sind Cluster-Systeme mit Replikationsmechanismen. Daher wurde
die Storage-Migration auf Applikations- bzw. Cluster-Level durchgeführt und nicht auf Storage-Ebene.

Die Migration wurde in zwei Bereiche unterteilt: Storage-Migration für Zookeeper und für die Kafka-Broker. Grundlage
war ein Upgrade des Streams for Apache Kafka Operators auf Version 2.8, um die aktuellen Features nutzen zu können.
Aufgrund der zeitlichen Dringlichkeit wurde die Storage-Migration bewusst von der bevorstehenden
Zookeeper-zu-Kraft-Migration getrennt.

### Zookeeper Storage-Migration

Zunächst wurde sichergestellt, dass die Ausfallsicherheit durch ausreichende Redundanz der Zookeeper-Instanzen
gewährleistet ist. Im zugrunde liegenden Red Hat OpenShift Cluster wurde der Ziel-Storage als neue StorageClass
definiert und als Standard festgelegt. Dies ermöglicht die Nutzung des Zookeeper-internen
State-Synchronisationsprozess, mit dem eine Instanz ihren Zustand anhand der anderen Quorum-Teilnehmer
wiederherstellen kann. Die Migration erfolgte instanzenweise und wurde durch die Bordmittel von Streams for Apache
Kafka unterstützt. Die Neuerstellung der Zookeeper-Instanz inklusive des neuen PersistentVolume
wurde vom Operator übernommen. Nach erfolgreicher Synchronisation und Prüfung der Replikation wurde die nächste
Instanz migriert.

### Kafka Storage-Migration

Das KafkaNodePool-Feature erlaubt die Erstellung mehrerer Kafka-Broker-Pools mit unterschiedlichen
Infrastruktur-Charakteristiken. Das frühere StatefulSet hatte den Nachteil, dass alle Kafka-Broker identisch waren.
Dieser Umstand wurde genutzt, um neue Broker mit dem neuen Storage-System zu provisionieren. Zur Datenverschiebung auf
die neuen Broker wurde Kafka Cruise Control eingesetzt. Replika-Partitionen konnten so gezielt von alten Brokern
entfernt und neuen Brokern zugewiesen werden. Die Intra-Cluster-Replikation übernahm die automatische
Datenverschiebung. Schrittweise wurde der neue KafkaNodePool erweitert und der alte Pool stillgelegt.

## Ergebnisse

* Die Migration konnte vollständig, fehler- und unterbruchsfrei durchgeführt werden.
* Die Kafka-Cluster wurden erfolgreich auf die neue Operator-Version angehoben.
* Auch wenn die Storage-Migration nicht mit der bevorstehenden KRaft-Migration verbunden werden konnte, wurden vorbereitende Schritte bereits umgesetzt.
* Das Cruise-Control-Feature wurde eingerichtet und steht weiterhin zur Verfügung.
* Die Kafka-Cluster wurden mit Maintenance-Tooling und Monitoring ergänzt, was zukünftiges Troubleshooting vereinfacht.

## Kundenstatement

«Wir haben die Zusammenarbeit mit tim&koko durchwegs als sehr angenehm, effizient und zielorientiert empfunden.
Mit der gewählten Migrationsvariante konnte die Storage-Migration aller Kafka Cluster ohne Downtime und somit ohne
Service-Impact für unsere Kunden durchgeführt werden. Kompetenter Partner – gerne wieder.»

**Stefan Werder**, Product Owner Swiss Health Cloud Platform

## Fazit & Lessons Learned

Die Storage-Migration bei der Centris zeigt, dass selbst komplexe Infrastrukturänderungen in einer produktiven
Kafka-Umgebung ohne Unterbruch realisierbar sind – vorausgesetzt, es wird ein klar strukturierter und schrittweiser
Ansatz verfolgt.

Die eingesetzten Technologien und Tools – insbesondere Red Hat OpenShift Streams for Apache Kafka und Kafka Cruise
Control – haben sich als leistungsfähige Komponenten für den stabilen und skalierbaren Betrieb erwiesen. Das Projekt
unterstreicht die Innovationskraft und technische Kompetenz der Centris im Umgang mit modernen Cloud- und
Messaging-Technologien.

Haben Sie ähnliche Herausforderungen oder möchten Sie mehr über Apache Kafka erfahren? Kontaktiere uns für ein unverbindliches Gespräch:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">tim&koko kontaktieren</a>
