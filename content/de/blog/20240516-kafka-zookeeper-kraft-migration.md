---
title: "Migration von ZooKeeper basierten Kafka-Clustern zu KRaft"
slug: "kafka-zookeeper-kraft-migration"
description: ""
date: 2024-05-16T00:00:00+00:00
lastmod: 2024-05-16T00:00:00+00:00
draft: false
images: ["images/blog/kraft/tk-blogpost-01_kraft_share-image.jpg"]
Sitemap:
Priority: 0.3

categories: ["Technologie", "Apache Kafka", "Messaging"]
post_img: "images/blog/kraft/tk-blogpost-01_kraft.jpg"
img_border: true
lead: "Mit dem Release 3.6.2 ermöglicht Apache Kafka eine Migration von Apache ZooKeeper basierten Clustern zu KRaft. Der Ablösung von ZooKeeper steht nun nichts mehr im Wege. Was zu beachten ist, erfährst du hier."
resources:
  - src: 'test.csv'
    title: 'Test #:counter'
---

Apache Kafka ist eine weit verbreitete, robuste und verteilte Streaming- und Event-Plattform. Mit der Ablösung von
Apache Zookeeper als zentralen Koordinations-Dienst durch den KRaft Algorithmus erreicht Kafka einen Meilenstein,
dem in der Kafka-Community schon lange entgegengefiebert wurde. Nun ist es soweit.

### Traditionelle Architektur mit Apache ZooKeeper

Ein Kafka-Cluster besteht aus mehreren Brokern, von denen einer als Controller fungiert. Dieser übernimmt zentrale
Aufgaben wie zum Beispiel das Management von Leader-Partitionen und Replica-Partitionen. So ist es zum Beispiel
seine Aufgabe, bei einem Ausfall eines Brokers eine Replica-Partition auf einen anderen Broker als neue
Leader-Partition zu promoten. Welcher der Broker als Kafka-Controller operiert, wird mittels Koordinations-Dienst
Apache ZooKeeper ermittelt. Der Controller ist für die aktive Kommunikation mit dem ZooKeeper-Cluster zuständig
und speichert die Cluster-, Topic- und Partitions-Metadaten in ZooKeeper. Eine traditionelle Kafka-Architektur
sieht daher wie folgt aus:

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-zookeeper-architecture.svg" >}}

Diese Architektur ist seit den ersten Versionen von Kafka praktisch unverändert. Ende 2019 wurde mit der Annahme
des «Kafka Improvement Proposal» KIP-500 die Ablösung der Abhängigkeit zu ZooKeeper und dessen Ersatz mittels eines
Raft basierten Algorithmus bestummen. Dieser wird bei Kafka KRaft (Kafka + Raft) genannt.

### Kafka mit KRaft ohne ZooKeeper

Die Trennung von ZooKeeper bringt für Kafka unter anderem folgende Vorteile:

**Architektur:** ZooKeeper musste getrennt betrieben werden. Die Ablösung bringt eine Vereinheitlichung von
Security-Konzepten, Kommunikations-Protokollen, Konfigurations-Methoden, Monitoring-Ansätze, Failover-Szenarien.

**Skalierung:** ZooKeeper ist nicht für den Einsatz von grossen Datenmengen vorgesehen, was für Kafka eine ungefähre
Limite von 200’000 Partitionen pro Kafka-Cluster bedeutet. Mit KRaft entfallen diese Limitierungen weitestgehend.

**Performance:** In einem ZooKeeper basierten System werden die Metadaten in ZooKeeper gespeichert. Der aktive
Kafka-Controller führt eine Kopie dieser Metadaten. Fällt der Controller aus, wird mittels Leader-Election ein
neuer Controller bestimmt, welcher die Metadaten auf ZooKeeper replizieren muss. Je nach Grösse des Clusters
(z.B. Partitionen) dauert dieser Prozess mehrere Sekunden oder führt im Extremfall zum Timeout. Im KRaft-Modus
werden die Metadaten im Single-Partition-Topic `__cluster_metadata` gespeichert. Updates an Metadaten werden
eventbasiert an alle Broker verteilt. Die Metadaten können jederzeit mittels Event-Sourcing aus dem `__cluster_metadata`
Topic wiederhergestellt werden.

In einem KRaft basierten Cluster gibt es für eine Kafka Instanz die zwei Rollen «broker» und «controller». Als «broker»
operiert die Kafka Instanz wie ein traditioneller Kafka-Broker. Die Rolle «controller» ist für die KRaft Instanzen
vorgesehen. Mit diesem Modell gibt es auch die Möglichkeit, die Instanzen im «combined» Mode zu betreiben. Dabei
nimmt eine Instanz gleichzeitig beide Aufgaben wahr. Dieser Modus ist jedoch für produktive Umgebungen noch nicht
empfohlen.

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-kraft-roles.svg" >}}

#### KRaft Roadmap

Seit mehr als einem Jahr und der Einführung von Kafka 3.3 sind KRaft basierte Kafka-Cluster produktionsreif. Der
zu Beginn fehlende Migrationspfad von ZooKeeper zu KRaft wurde mit der Version 3.6 nachgeliefert. ZooKeeper wurde
bereits offiziell als Deprecated markiert und der erste Release von Kafka 4.0 ohne ZooKeeper wird noch im Jahr 2024
erwartet. Es ist zu erwarten, dass nach der letzten Version mit ZooKeeper-Unterstützung noch während 12 Monaten
kritische Bugfixes für ZooKeeper basierte Cluster ausgeliefert werden.

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-timeline.svg" >}}

### Migration

> _«KRaft has been supported in Confluent Cloud for over a year now […] We are about near 100% migration to KRaft»_
>
> -- <cite>Thomas Chase, Confluent Inc., Mai 2024</cite>

Die Migration von ZooKeeper zu KRaft muss durch einen Bridge Release erfolgen. Dies sind Releases, die einerseits den
ZooKeeper und KRaft Modus unterstützen sowie Tooling für die Migration beinhalten. Da Kafka 4.0 ZooKeeper nicht mehr
unterstützt und 3.8 die letzten Features für Kafka 3 liefert, muss eine Migration also zwischen Version 3.6.2 und 3.8
erfolgen.

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-releases.svg" >}}

Eine Migration erfolgt in mehreren Schritten und beinhaltet ebenfalls die Möglichkeit, den Cluster abhängig vom
Fortschritt der Migration noch auf den ZooKeeper-Modus zurückzusetzen. Je nach eingesetzter Distribution oder
Operator sind die Schritte der Migration teilweise automatisiert.

Während der Migration wird der Kafka-Cluster in den Dual-Write Modus versetzt. In diesem werden die Metadaten von
KRaft Leader zusätzlich in ZooKeeper gespeichert. Dies ermöglicht ein Rollback zurück zum Ausgangszustand.

{{< svg "assets/images/blog/kraft/kafka-kraft-migration-states.svg" >}}

Eine Migration erfolgt in folgenden Schritten. Die Angabe zur Automatisierung bezieht sich auf den Strimzi Operator.

{{< csvtable "responsive" "," >}}
Schritt,Modus,Beschreibung,Automatisiert,Rollback
1,ZooKeeper,Ausgangszustand,Nein,-
2,ZooKeeper,KRaft Instanzen werden erstellt. Diese warten auf die Verbindung der Kafka-Broker.,Ja,Ja
3,ZooKeeper,Kafka Broker verbinden sich mit den KRaft Instanzen. Die Migration der Metadaten aus ZooKeeper zu KRaft beginnt.,Ja,Ja
4,Dual-Write,Migration der Metadaten ist abgeschlossen. Der Leader der KRaft Instanzen schreibt die Änderungen an den Metadaten parallel in ZooKeeper. Die Kafka-Broker haben ihre Verbindung mit ZooKeeper getrennt. Der Zustand Dual-Write ist erreicht. Es ist der letztmögliche Zeitpunkt für einen Rollback.,Ja,Ja
5,KRaft,Der Leader der KRaft Instanzen schreibt die Metadaten nicht weiter zu ZooKeeper. Die Verbindung zu ZooKeeper wird getrennt.,Nein,Nein
6,KRaft,Die ZooKeeper Instanzen werden ausgeschaltet,Ja,Nein
7,KRaft,Die Migration ist beendet und der Zielzustand ist erreicht.,-,Nein
{{< /csvtable >}}

Wird der Strimzi/AMQ Streams Operator verwendet, werden die automatisierten Schritte vom Cluster-Operator übernommen.
Das Auslösen der Migration, der allfällige Rollback und das Abschliessen der Migration wird über die Annotation
`strimzi.io/kraft` auf der Kafka-Ressource gesteuert.

<br />

#### Limitationen für KRaft basierte Cluster

Für die Migration zu ZooKeeper gibt es gewisse Limitationen. Es muss vorgängig geprüft werden, ob eine Migration von
einer Limitation betroffen ist.

<br />
Allgemein

* Die Migration sollte mit den neuesten Kafka-Versionen, Operatoren und Konfigurationen durchgeführt werden.
* Der Combined Mode von KRaft ist für produktive Cluster nicht empfohlen
* Nach der Migration ist der Wechsel zurück zu ZooKeeper nicht mehr möglich.
* Während der Migration ist es nicht möglich, die `metadata.version` resp. `inter.broker.protocol.version` während des Upgrades zu ändern. Wird dies gemacht, kann dies den Cluster zerstören.
* Im Moment werden für produktive Cluster nur 3 KRaft-Controller empfohlen. Eine höhere Anzahl wird explizit nicht empfohlen.

<br />
Folgende Features, welche in ZooKeeper basierten Clustern unterstützt werden, werden im KRaft-Modus zurzeit noch nicht unterstützt. Diese werden
in der Kafka Version 3.8.0 produktionsreif.

* JBOD-Konfiguration (Just a Bunch of Disks) mit mehreren Storage-Locations. Die Spezifikation als JBOD mit nur einer Storage-Location ist möglich.
* Änderungen am KRaft-Quorum (z.B. KRaft-Instanzen hinzufügen oder entfernen).

<br />
Spezifisch für Strimzi / AMQ-Streams Operator basierte Deployments gilt weiter:

* Um die Migration zu starten, muss mindestens Strimzi 0.40.0 oder neuer mit Kafka 3.7.0 verwendet werden.
* Der Kafka-Cluster muss mit KafkaNodePools konfiguriert sein
* Der Bidirectional Topic Operator wird nicht unterstützt.

<br />

#### Vorbereitung für eine Migration

Folgende Punkte sind zu beachten wenn eine Migration bevorsteht

* Der Cluster erfüllt alle Voraussetzungen für eine Migration (siehe Limitationen)
* Auch wenn die Migration keinen direkten Einfluss auf neuere Kafka-Clients hat, muss geprüft werden, ob eventuell noch alte Konfigurationen verwendet werden, die ZooKeeper voraussetzen. Als Beispiel:
  * Burrow verwendet ZooKeeper direkt
  * Frühere Versionen von Cruise Control verwenden ZooKeeper ebenfalls direkt
* Sicherstellen, dass genügend Ressourcen für die Migration zur Verfügung stehen.
  * Während der Migration sind ZooKeeper und KRaft Instanzen parallel aktiv.
  * KRaft Instanzen sollten auf ähnlicher Hardware wie ZooKeeper betrieben werden.
    * Empfehlungen von Confluent für produktive ZooKeeper-/KRaft Instanzen: 4GB Memory, 1GB JVM Heap-Space, 64GB Disk-Space.
* Das Monitoring vorbereiten für KRaft Instanzen. Diese können analog den Kafka-Brokern mittels JMX-Metriken überwacht werden.
* Für die Migration wird empfohlen folgende LogLevels zu erhöhen:
  * `log4j.logger.org.apache.kafka.metadata.migration=TRACE`

<br />

Weiter empfiehlt es sich, auch die CLI-Tools vorzubereiten. Diese werden bei Bedarf für administrative- und
debugging-Zwecke verwendet. Insbesondere sollten die neuen CLI-Tools, welche die ZooKeeper-Shell ablösen,
zur Verfügung stehen:

**Metadata Quorum Tool:** `kafka-metadata-quorum` kann verwendet werden um den Status der Metadaten Partition zu untersuchen.

**Kafka Log Tool:** `kafka-dump-log` kann verwendet werden, um die log Segmente direkt aus dem Metadaten-Verzeichnis zu lesen.

**Metadata Shell:** `kafka-metadata-shell` ermöglicht die interaktive Untersuchung der Cluster Metadaten (analog ZooKeeper-Shell)

## Dürfen wir dich begleiten?

Benötigst du Hilfe bei der Migration deines Kafka Clusters von Apache ZooKeeper zu KRaft oder hast du allgemeine Fragen zu Apache Kafka? Zögere nicht und kontaktieren uns.
