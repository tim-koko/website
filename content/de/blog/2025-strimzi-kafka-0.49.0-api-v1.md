---
title: "Strimzi 0.49.0 führt die neue stabile v1-API-Version von Strimzi CRDs ein"
slug: "strimzi-kafka-0.49.0-api-v1"
description: ""
date: 2025-11-21T00:00:00+00:00
lastmod: 2025-11-21T00:00:00+00:00
draft: false
images: ["images/blog/kafka-strimzi-v1/tk-blogpost-strimzi-kafka-api-v1-share-image.jpg"]
Sitemap:
  Priority: 0.92

categories: ["Technologie", "Apache Kafka", "Messaging", "Strimzi"]
authors: ['christof-luethi']
additionalblogposts: [ 'kafka-zookeeper-kraft-migration', 'kafka-4']

post_img: "images/blog/kafka-strimzi-v1/tk-blogpost-strimzi-kafka-api-v1.jpg"
img_border: true
lead: "Nach mehr als acht Jahren Strimzi-Veröffentlichungen führt die neueste Version 0.49.0 des Strimzi Operator die API-Version v1 ein. Damit ist es nur noch eine Frage der Zeit, bis Strimzi 1.0.0 veröffentlicht wird."
---

Dieser Blogbeitrag ist eine technische Übersicht über die neuesten API-Änderungen von Strimzi 0.49.0, welche am 21. November 2025 veröffentlicht wurden. Die Veröffentlichung
der API-Version `v1` ist ein wichtiger Meilenstein für Administratoren, die Apache Kafka auf Kubernetes betreiben. Die neue API Version
optimiert die Ressourcendefinitionen, vereinheitlicht die Benennung der Komponenten und entfernt veraltete Properties, die sich über
mehrere Strimzi-Release-Zyklen angesammelt haben.

## Der Weg zu Strimzi 1.0.0

Die Versionierung der Strimzi-API verlief langsam, da die ersten Versionen experimentell waren. Das Projekt reifte aber schnell
als neue Funktionen, Bugfixes und Produktive Umgebungen und Nutzerfeedback hinzukamen. Als das Team die Version `1.0.0`
vorbereitete, führte der geplante wechsel von Apache Kafka von ZooKeeper zu KRaft zu tiefgreifenden architektonischen
Änderungen, die sich direkt auf das CRD-Design von Strimzi auswirkten. Um zu vermeiden, dass eine API festgelegt wird,
die bald wieder veraltet sein würde, verschob Strimzi die Version `1.0.0`, bis sich die Transition des Upstreams Apache Kafka
stabilisiert hatte. Die Migration zu KRaft dauerte jedoch viel länger als erwartet, wodurch sich der eigene stabile
Meilenstein von Strimzi um Jahre verzögerte. Das lange Warten bedeutete indes einfach, dass sich 38 Versionen vor
der nun anstehenden Version 1.0.0 ansammelten.

{{< svg "assets/images/blog/kafka-strimzi-v1/strimzi-kafka-api-v1.svg" >}}

## Einführung

Strimzi entwickelt sich weiter und richtet seine APIs auf langfristige Stabilität aus. Als Upstream für Streams for Apache Kafka
on OpenShift ist die Einführung einer stabilen `v1`-API durch Strimzi ein wichtiger Schritt für Unternehmen, die stabile
Konfigurationen und eine geringe Komplexität bei Upgrades wünschen.

Mit Strimzi 0.49.0 werden die zuvor verwendeten API-Gruppen wie beispielsweise:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
```

in Folgendes umbenannt:

```yaml
apiVersion: kafka.strimzi.io/v1
```

Diese Änderung betrifft alle CRDs von Strimzi. Am wichtigsten sind `Kafka`, `KafkaTopic`, `KafkaUser`, `KafkaConnect`, `KafkaMirrorMaker2` ... und weitere.

Die neue API-Version entfernt auch veraltete Properties, benennt Attribute aus Gründen der Konsistenz um und führt eine Normalisierung
zwischen Komponenten ein (z. B. Listener, Logging oder Storage-Definitionen).

## Strimzi 0.49.0 und die API-Version v1

Strimzi `v1` ist so konzipiert, dass es auf absehbare Zeit abwärtskompatibel bleibt. Dies gewährleistet Betriebskonsistenz
und vermeidet häufige Änderungen an CRDs.

Die Unterstützung für ältere API-Versionen wie `v1beta2` ist bis Strimzi 1.0.0 (0.52.0) gewährleistet. Diese Version wird
in der ersten Hälfte des Jahres 2026 erscheinen.

Mit der Version 0.49.0 gibt es ein _API Conversion Tool_, das bei der Konvertierung der Ressourcen in die neue API-Version `v1` hilft.

### Strimzi 0.49.0 upgrade

Vor dem Upgrade:

* Stelle sicher, dass mindestens Kubernetes 1.27 verwendet wird.
* Stelle sicher, dass der Cluster im KRaft-Modus betrieben wird.
* Stelle sicher, dass die `KafkaUser`-Ressourcen nicht das alte `operation`-Feld in den ACLs verwenden. Ist dies der Fall its, müssten die Ressourcen migriert werden, damit sie stattdessen die `operations`-Liste verwenden.

Während des Upgrades:

* Aktualisieren des Cluster-Operators
* Stelle sicher, dass die CRDs nach der Aktualisierung des Cluster-Operators auf die neue Version aktualisiert werden. Dies gilt insbesondere, wenn Helm verwendet wird, da Helm die CRDs normalerweise nicht automatisch aktualisiert.
* Nach der Aktualisierung des Cluster-Operators und Aktualisierung der CRDs müssen die Custom-Resources von `v1beta2` auf `v1` migriert werden. Dies muss zwingend vor dem Release von Strimzi 1.0.0 (0.52.0) erfolgen.

Für das Upgrade is es unerlässlich die vollständige [Upgrade-Anleitung](https://strimzi.io/docs/operators/0.49.0/deploying.html#assembly-upgrade-str) zu lesen.

### Wichtigste Änderungen in Strimzi 0.49.0 oder der v1-API-Version

In `v1` werden nun Properties, die über mehrere Strimzi-Release-Zyklen hinweg veraltet waren (einige davon reichen bis `v1beta1`
zurück), entfernt. Konfigurationen, die auf diesen Properties basieren, müssen vor dem Wechsel zur neuen API aktualisiert werden.

Neben dem Entfernen der veralteten Properties enthält die neue Version von Strimzi noch weitere Änderungen. Die wichtigsten sind:

* Redesign der Ressourcen `KafkaConnect` und `KafkaMirrorMaker2`.
* Die verfügbaren Authentifizierungs- und Autorisierungstypen haben sich geändert, resp. müssen anders verwendet werden
  * Der Authentifizierung-Typ `oauth` wurde entfernt. Die Strimzi-OAuth-Bibliotheken bleiben aber weiterhin vorhanden und unterstützt. Sie können mit dem Typ `custom` weiterhin verwendet werden.
  * Der Authorisierungs-Typ `keycloak` wurde entfernt. Die Strimzi-OAuth-Bibliotheken bleiben aber weiterhin vorhanden und unterstützt. Sie können mit dem Typ `custom` weiterhin verwendet werden.
* Ab Strimzi 0.49.0 werden bei der Verwendung der Rack-Awareness standardmässig keine Affinity-Rules mehr definiert.
  * Die Affinity-Rules und die Topology-Spread-Constraints müssen selbst explizit definiert werden.
* Die Auflösung von Konflikten in Template-Sections in `Kafka` and `KafkaNodePool` wurden geändert (siehe [Strimzi Proposal #120](https://github.com/strimzi/proposals/blob/main/120-improve-template-behavior-in-Kafka-node-pools.md))
  * Templates werden neu auf Property-Ebene gemerged. Der `KafkaNodePool` hat dabei priorität, sofern ein Property doppelt definiert ist.
* Die Build-Funktionalität von Kafka Connect, um benutzerdefinierte Connect-Images zu erstellen, wurde geändert (siehe [Strimzi Proposal #114](https://github.com/strimzi/proposals/blob/main/114-use-buildah-instead-of-kaniko.md))
  * Das verwendete Kaniko-Projekt wird nicht mehr weiter entwicklet und wurde daher als veraltet markiert.
  * _Buildah_ wird der neue Ersatz von Kaniko sein. Im Moment ist _Buildah_ aber noch deaktiviert.
* Kafka Connect ermöglicht die Angabe der genauen Version in KafkaConnector.

Eine vollständige Liste der Änderungen ist in den [Release Notes](https://github.com/strimzi/strimzi-kafka-operator/releases/tag/0.49.0) zu finden.

## API Conversion Toolkit

Das Strimzi _API Conversion Toolkit_ ist ein Befehlszeilenprogramm und dient folgenden Zwecken:

* Konvertieren vorhandener benutzerdefinierter Ressourcen in das Schema `v1` vor dem Upgrade der CRDs
  * Anhand YAML-Dateien (`convert-file`)
  * Direkt im Kubernetes-Cluster (`convert-resource`)
* Aktualisierung bestehender Strimzi-CRDs durch ihre `v1`-Versionen (`crd-upgrade`)

Stelle sicher, dass vor Beginn der Migration eine Sicherungskopie der Ressourcen erstellt wird. Weitere Informationen
zur Konvertierung der Custom-Resources in die `v1`-API-Version ist in der [Strimzi-Dokumentation](https://strimzi.io/docs/operators/0.49.0/deploying#assembly-api-conversion-str) zu finden.
Weitere Details zur Verwendung des _API Conversion Toolkit_ ist in der Datei `README.md` des Tools zu finden.

## Zusammenfassung

Strimzi 0.49.0 mit der `v1`-API bietet folgende Neuerungen:

* Stabile APIs und strengere Validierung
* Entfernung und Bereinigung veralteter Properties
* Harmonisierte Konfigurationen für alle CRDs
* Unterstützung für reine KRaft-Kafka-Cluster

Das _API Conversion Toolkit_ vereinfacht den Upgrade-Prozess, dennoch sollten Administratoren jede CR manuell überprüfen und validieren.

Die Migration zu `v1` gewährleistet langfristige Stabilität, reduziert die Komplexität bei Upgrades und folgt den
Best Practices für Kubernetes.

## Dürfen wir dich begleiten?

Benötigst du Hilfe bei der Migration deines Kafka Clusters von Apache ZooKeeper zu KRaft oder hast du allgemeine Fragen zu Apache Kafka? Zögere nicht und kontaktieren uns.
