---
title: "Quarkus Developer Experience"
slug: "quarkus-developer-experience"
description: "Java-Entwicklung mit Turbo: Quarkus bietet schnellen Startup, Live Coding & Dev Services. Erlebe echte Developer Joy für deine Microservices."
date: 2024-05-21T00:00:00+00:00
lastmod: 2025-08-05T00:00:00+00:00
draft: false
images: ["images/blog/quarkus/tk-blogpost-02_quarkus_share-image.jpg"]
img_border: true
Sitemap:
  Priority: 0.4

categories: ["Technologie", "Quarkus", "Developer", "Java"]
authors: []
additionalblogposts: [ 'cicd-devx', 'supply-chain-security-01']
post_img: "images/blog/quarkus/tk-blogpost-02_quarkus.jpg"
lead: "Mit Quarkus bekommt das Java Ökosystem einen immensen Developer Experience Boost! In diesem kurzen Beitrag tauchen wir in die Welt von Quarkus!"
---

Quarkus wurde entwickelt, um Entwickler:innen ein außergewöhnliches Erlebnis zu bieten, indem es einen rationalisierten und effizienten Arbeitsablauf bietet. Lassen Sie uns einige Schlüsselaspekte der Developer Experience in Quarkus untersuchen:

Um ein leeres Quarkus-Projekt mit dem Quarkus CLI zu erzeugen, verwenden wir:

### Schnelle Startzeiten

Quarkus ist bekannt für seine unglaublich schnelle Startzeit, die es Entwickler:innen ermöglicht, produktiv zu entwickeln. Quarkus erreicht dies durch den Einsatz eines Bootstrapping-Prozesses zur Kompilierzeit, der unnötigen Laufzeit-Overhead eliminiert. Dadurch können Entwickler:innen ihre Anwendungen innerhalb von Millisekunden starten und neu starten, was die Entwicklungszyklen erheblich verkürzt.

Fangen wir mit einem einfachen Quarkus-Projekt an. Zu Beginn haben Sie mehrere Möglichkeiten, den Boilerplate-Code für das Projekt zu generieren: Maven, Quarkus CLI oder über die Web UI (https://code.quarkus.io/).

Um ein neues leeres Quarkus-Projekt mit der Quarkus CLI zu erzeugen, verwenden wir:

```bash
$ quarkus create app example
Looking for the newly published extensions in registry.quarkus.io
-----------

applying codestarts...
📚 java
🔨 maven
📦 quarkus
📝 config-properties
🔧 dockerfiles
🔧 maven-wrapper
🚀 rest-codestart

-----------
[SUCCESS] ✅  quarkus project has been successfully generated in:
--> /home/user/code/quarkus-blog/example
-----------
Navigate into this directory and get started: quarkus dev
```

Dies generiert das Boilerplate-Maven-Projekt mit allem, was wir brauchen, um mit der Entwicklung zu beginnen!

In normalen Entwicklungszyklen können wir unsere Anwendung mit dem Quarkus CLI starten:

```bash
$ quarkus dev
[...]
[INFO] Changes detected - recompiling the module! :dependency
[INFO] Compiling 2 source files with javac [debug release 21] to target/test-classes
Listening for transport dt_socket at address: 5005
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
 -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
--\___\_\____/_/ |_/_/|_/_/|_|\____/___/
INFO  [io.quarkus] (Quarkus Main Thread) example 1.0.0-SNAPSHOT on JVM (powered by Quarkus 3.10.1) started in 2.633s. Listening on: http://localhost:8080

INFO  [io.quarkus] (Quarkus Main Thread) Profile dev activated. Live Coding activated.
INFO  [io.quarkus] (Quarkus Main Thread) Installed features: [cdi, rest, smallrye-context-propagation, vertx]

--
Tests paused
Press [r] to resume testing, [o] Toggle test output, [:] for the terminal, [h] for more options>
```

Wir sehen direkt, dass unsere Applikation im Dev-Mode gestartet worden ist, den wir in kurzer Zeit noch genauer anschauen werden!

Ohne weitere Arbeit können wir die Applikation schon bauen und ausführen. Selbstverständlich verwenden wir als Basis ein Docker Image. Um das volle Potential von Quarkus zu nutzen, bauen wir ein natives Executable und brauchen keine JVM mehr im Hintergrund. Dies funktioniert ähnlich einfach wie das Bootstrappen des Projekts mit der Quarkus CLI.

```bash
$ quarkus image build --clean --native
[...]
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] --> 86dada6ff299
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] STEP 7/7: CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] COMMIT user/example:1.0.0-SNAPSHOT
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] --> 73d5afa48475
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] Successfully tagged localhost/user/example:1.0.0-SNAPSHOT
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] 73d5afa4847564080a7bdae0d93246e64d80823a7c17d5c23840fca81cff7583
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] Built container image user/example:1.0.0-SNAPSHOT (null)

[INFO] [io.quarkus.deployment.QuarkusAugmentor] Quarkus augmentation completed in 351699ms
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  05:54 min
[INFO] Finished at: 2023-05-30T14:19:15+02:00
[INFO] ------------------------------------------------------------------------
```

Wie man schon vermuten kann, dauert der native Build einiges länger und ist viel ressourcenintensiver - das ist normal. Die nativ kompilierte Applikation erreicht Lichtgeschwindigkeits-ähnliche Startup Zeiten! Um dies zu demonstrieren und selbst zu erleben, starten wir den Container selbst:

```bash
$ docker run user/example:1.0.0-SNAPSHOT
Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg.
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
 -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
--\___\_\____/_/ |_/_/|_/_/|_|\____/___/
INFO  [io.quarkus] (main) example 1.0.0-SNAPSHOT native (powered by Quarkus 3.10.1) started in 0.016s. Listening on: http://0.0.0.0:8080
INFO  [io.quarkus] (main) Profile prod activated.
INFO  [io.quarkus] (main) Installed features: [cdi, rest, smallrye-context-propagation, vertx]
```

Blitzschnell startet die Applikation und ist bereit, Traffic zu empfangen! Nur in 16 ms ist unsere kleine Demo-App bereit - und das noch mit Java! Schnelligkeit ist aber nur einer der vielen Vorteile von Quarkus!

### Developer Joy mit Live Coding

Quarkus kommt auch mit dem mächtigen Feature «Live Coding», das uns Entwickler:innen endlich erlaubt Code Changes, ohne manuelle Restarts zu sehen! Dieses Feature ist besonders hilfreich, wenn wir an grösseren Applikationen oder komplexeren Problemen arbeiten. Devs können sich auf ihr Kerngeschäft konzentrieren, das Coden, und Quarkus übernimmt Änderungen automatisch, was den Entwicklungsprozess höchstgradig effizient und interaktiv macht!

Das Live Reload Feature, welches Frontend Entwickler:innen schon seit der Entstehung des Universums haben, bringt einige Vorteile mit sich. Änderungen an APIs oder Businesscode sehen wir bei dem nächsten Aufruf direkt - jedoch lassen sich auch andere Quality of Life Features damit implementieren.

Wir starten unsere Applikation im Dev-Mode und testen den vordefinierten REST Endpunkt `/hello`:

```bash
$ quarkus dev
[...]
Listening for transport dt_socket at address: 5005
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
 -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
--\___\_\____/_/ |_/_/|_/_/|_|\____/___/
INFO  [io.quarkus] (Quarkus Main Thread) example 1.0.0-SNAPSHOT on JVM (powered by Quarkus 3.10.1) started in 2.633s. Listening on: http://localhost:8080

INFO  [io.quarkus] (Quarkus Main Thread) Profile dev activated. Live Coding activated.
INFO  [io.quarkus] (Quarkus Main Thread) Installed features: [cdi, rest, smallrye-context-propagation, vertx]

--
Tests paused
Press [r] to resume testing, [o] Toggle test output, [:] for the terminal, [h] for more options>
```

In einem anderen Terminal testen wir unseren Endpunkt mit cURL und können eine erste Reponse sehen:

```bash
$ curl localhost:8080/hello
Hello from RESTEasy Reactive%
```

Während die Applikation läuft verändern wir den Code, um den Live Reload direkt zu testen:

```java
// src/main/java/org/acme/GreetingResource.java
package org.acme;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/hello")
public class GreetingResource {

  @GET
  @Produces(MediaType.TEXT_PLAIN)
  public String hello() {
    return "Hello Quarkus";
  }
}
```

Wir wiederholen den API-Aufruf von zuvor und können direkt einige Sachen im Terminal der Applikation verfolgen.

```bash
INFO  [io.qua.dep.dev.RuntimeUpdatesProcessor] (vert.x-worker-thread-1) Restarting quarkus due to changes in GreetingResource.class.
INFO  [io.quarkus] (Quarkus Main Thread) example stopped in 0.007s
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
  -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
  --\___\_\____/_/ |_/_/|_/_/|_|\____/___/
INFO  [io.quarkus] (Quarkus Main Thread) example 1.0.0-SNAPSHOT on JVM (powered by Quarkus 3.10.1) started in 0.393s. Listening on: http://localhost:8080
INFO  [io.quarkus] (Quarkus Main Thread) Profile dev activated. Live Coding activated.
INFO  [io.quarkus] (Quarkus Main Thread) Installed features: [cdi, rest, smallrye-context-propagation, vertx]
INFO  [io.qua.dep.dev.RuntimeUpdatesProcessor] (vert.x-worker-thread-1) Live reload total time: 0.721s

--
Tests paused
Press [r] to resume testing, [o] Toggle test output, [:] for the terminal, [h] for more options>
```

Wie erwartet hat der Dev-Mode die Änderungen erkannt und beim nächsten Request unsere Applikation neu gestartet.

Des Weiteren sehen wir im Console Output einen Hinweis auf ein weiteres Feature  «resume testing» ([r]). Dies ist ein weiteres Feature, das durch den Live Reload erst möglich wird: Continuous Testing (<https://quarkus.io/guides/continuous-testing>)! Immer wenn sich Code in der Applikation ändert, werden die Tests ausgeführt, die durch die Änderungen beeinflusst werden - und dies alles während man an der laufenden Applikation entwickelt.

Um das Feature zu testen, können wir einfach in der laufenden Konsole die [r] Taste drücken:

```bash
ERROR [io.qua.test] (Test runner thread) ==================== TEST REPORT #1 ====================
ERROR [io.qua.test] (Test runner thread) Test GreetingResourceTest#testHelloEndpoint() failed
: java.lang.AssertionError: 1 expectation failed.
Response body doesn't match expectation.
Expected: is "Hello from RESTEasy Reactive"
  Actual: Hello Quarkus

    at io.restassured.internal.ValidatableResponseOptionsImpl.body(ValidatableResponseOptionsImpl.java:238)
    at org.acme.GreetingResourceTest.testHelloEndpoint(GreetingResourceTest.java:18)
```

Da wir die GreetingResource Klasse verändert haben, wird sie auch nicht mehr «Hello from RESTEasy Reactive» zurückgeben und somit wird auch der Test fehlschlagen. Wir können nun den Test mit der richtigen Response anpassen und Quarkus wird automatisch die Tests noch einmal ausführen - dieses Mal hoffentlich mit einem positiven Ergebnis!

```bash
INFO  [io.qua.test] (Test runner thread) All tests are now passing
```

### Developer-Centric Tooling

Quarkus kommt mit einem umfangreichen Set von Tools und Extensions, die viele mögliche Aspekte der Applikationsentwicklung vereinfachen. Das Ökosystem von Quarkus beinhaltet Extensions für eine Vielzahl beliebter Frameworks und Libraries wie RESTeasy, Hibernate, Kafka und viele mehr. Die Extensions kommen mit production-ready Features und Integrationsmöglichkeiten, die den Entwickler:innen möglichst viel unnötige Konfigurationszeit abnehmen.

In der Realität sind Java Applikationen nicht nur gemacht, um ein simples «Hello, world» dem User zurückzugeben. Die meisten Java-basierten Microservice-Architekturen konsumieren und produzieren von einer Vielzahl an Schnittstellen. Beispielsweise wurde in den letzten Jahren immer mehr Apache Kafka zum Dreh- und Angelpunkt, wenn es um die Integration von Microservices in eventbasierte Systeme geht. Quarkus hat auch hier natürlich mit dem Extension basierten Ansatz eine solide Lösung.

Mit der Quarkus CLI können wir auch einfach alle verfügbaren Extensions durchsuchen und filtern. Mit dem `-s` Parameter können wir nach Stichworten suchen:

```bash
$ quarkus extension -s kafka --installable
Listing extensions (default action, see --help).
Current Quarkus extensions installable:

✬ ArtifactId                                    Extension Name
✬ quarkus-smallrye-reactive-messaging-kafka     SmallRye Reactive Messaging - Kafka Connector
```

Im folgenden Abschnitt erstellen wir einen neuen Microservice, der Messages von einem Kafka Broker konsumiert und produziert. Dafür erstellen wir mit der Quarkus CLI eine neue Applikation und fügen die Extensions `quarkus-smallrye-reactive-messaging-kafka, quarkus-rest` hinzu.

```bash
quarkus create app kafka --extensions=quarkus-smallrye-reactive-messaging-kafka,quarkus-rest
```

Wenn wir unser Projekt betrachten, sehen wir dass die Quarkus schon einiges an Arbeit für uns übernommen hat. Wir haben selbstverständlich die korrekten Dependencies unserem `pom.xml`. Weiter haben wir schon Beispiel und vordefinierten Boilerplate Code, welches uns das Framework generiert. Die Quarkus Extensions sind nicht nur ein technologischer Wrapper um die Dependencies, sondern erlauben uns auch Codestarter für unsere Projekte zu definieren. Der Codestarter der Kafka Extension erzeugt uns auch schon eine Klasse, die uns die basischen Features aufzeigt:

```java
package org.acme;

import io.quarkus.runtime.StartupEvent;
import org.eclipse.microprofile.reactive.messaging.*;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import java.util.stream.Stream;

@ApplicationScoped
public class MyReactiveMessagingApplication {

    @Inject
    @Channel("words-out")
    Emitter<String> emitter;

    /**
     * Sends message to the "words-out" channel, can be used from a JAX-RS resource or any bean of your application.
     * Messages are sent to the broker.
     **/
    void onStart(@Observes StartupEvent ev) {
        Stream.of("Hello", "with", "SmallRye", "reactive", "message").forEach(string -> emitter.send(string));
    }

    /**
     * Consume the message from the "words-in" channel, uppercase it and send it to the uppercase channel.
     * Messages come from the broker.
     **/
    @Incoming("words-in")
    @Outgoing("uppercase")
    public Message<String> toUpperCase(Message<String> message) {
        return message.withPayload(message.getPayload().toUpperCase());
    }

    /**
     * Consume the uppercase channel (in-memory) and print the messages.
     **/
    @Incoming("uppercase")
    public void sink(String word) {
        System.out.println(">> " + word);
    }
}
```

Zusätzlich zu den Beispielsproduzenten und -konsumenten, kommt auch schon die Konfiguration mit für unseren Kafka Broker.

```properties
mp.messaging.incoming.words-in.topic=words
mp.messaging.outgoing.words-out.topic=words
mp.messaging.incoming.words-in.auto.offset.reset=earliest
```

Wir sehen, dass die Channels `word-in` und `word-out` bereits konfiguriert und mit den entsprechenden Topics verbunden sind. Alle Entwickler:innen, die sich schon einmal die Mühe gemacht haben, ihr Kafka-System lokal aufzusetzen, wissen, dass es ein mühsames Unterfangen werden kann. Nicht mit Quarkus - was wir in Kürze sehen werden.

Wir starten die neue Applikation im Dev-Mode und beobachten das Terminal:

```bash
$ quarkus dev
[...]
INFO  [io.qua.kaf.cli.dep.DevServicesKafkaProcessor] (build-3) Dev Services for Kafka started. Other Quarkus applications in dev mode will find the broker automatically. For Quarkus applications in production mode, you can connect to this by starting your application with -Dkafka.bootstrap.servers=OUTSIDE://localhost:42879
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
 -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
--\___\_\____/_/ |_/_/|_/_/|_|\____/___/
INFO  [io.sma.rea.mes.kafka] (Quarkus Main Thread) SRMSG18229: Configured topics for channel 'words-in': [words]

INFO  [io.sma.rea.mes.kafka] (Quarkus Main Thread) SRMSG18214: Key deserializer omitted, using String as default
INFO  [io.sma.rea.mes.kafka] (smallrye-kafka-producer-thread-0) SRMSG18258: Kafka producer kafka-producer-words-out, connected to Kafka brokers 'OUTSIDE://localhost:42879', is configured to write records to 'words'
INFO  [io.sma.rea.mes.kafka] (smallrye-kafka-consumer-thread-0) SRMSG18257: Kafka consumer kafka-consumer-words-in, connected to Kafka brokers 'OUTSIDE://localhost:42879', belongs to the 'kafka' consumer group and is configured to poll records from [words]
INFO  [io.quarkus] (Quarkus Main Thread) kafka 1.0.0-SNAPSHOT on JVM (powered by Quarkus 3.10.1) started in 4.645s. Listening on: http://localhost:8080
[...]
INFO  [io.sma.rea.mes.kafka] (vert.x-eventloop-thread-3) SRMSG18256: Initialize record store for topic-partition 'words-0' at position -1.
>> HELLO
>> WITH
>> SMALLRYE
>> REACTIVE
>> MESSAGE

--
```

Ohne weitere Konfiguration oder Mühe kommunizieren wir mit einer Kafka Instanz. Wir produzieren Messages in ein Topic names `words` und konsumieren die Messages wieder. Magie? Nicht wirklich. Im Hintergrund versteht Quarkus auf Grund der Kafka Dependency, dass ein Kafka Broker benötigt wird. Es wird automatisch ein Testcontainer gestartet, der uns eine Kafka-kompatible API im Hintergrund zur Verfügung stellt. Dadurch können wir Applikationen lokal entwickeln, ohne uns mit den Drittsystemen und mit unnötigen Konfigurationen beschäftigen zu müssen. Wenn mehrere Quarkus Applikationen gestartet werden, werden diese automatisch vom Framework erkannt und die Konnektivität wird im Hintergrund für uns hergestellt.

Ein weiteres Feature, welches unser Entwicklungs Erlebnis verbessert, ist das Dev UI. Wir können über das Terminal der Quarkus Applikation mit der [d] Taste automatisch auf das Dev UI <http://localhost:8080/q/dev-ui/> wechseln. Hier sehen wir die wichtigsten Informationen über unsere Applikation in einem kleinen One-Pager. Die meisten Extensions erlauben uns auch, mit ihnen im Dev-UI zu interagieren. Beispielsweise die Kafka Dependency bietet uns einige hilfreiche Features in einem kleinen UI (<http://localhost:8080/q/dev-v1/io.quarkus.quarkus-kafka-client/kafka-dev-ui>). Wir bekommen eine kurze Übersicht über die Topics und können rudimentäre Messages produzieren oder auch konsumieren.

### Vereinfachte Konfiguration

Quarkus verfolgt klar das Prinzip von «convention over configuration» um die Konfiguration Aufwände für Entwickler:innen zu minimieren. Mit jeder Extension kommen schon viele Standardkonfigurationen mit, was die Anzahl von Konfigurationen, die wirklich benötigt werden, drastisch verkleinert. Die zentrale Spezifikation der Konfiguration von Quarkus Projekten ist die MicroProfile Config Spezifikation (<https://microprofile.io/microprofile-config/>) welches durch SmallRye Config implementiert wird (<https://smallrye.io/smallrye-config/Main/>).

Könnt ihr euch noch an das 12-Faktor Application Manifesto erinnern (<https://12factor.net/>)? Applikations-Konfiguration sollte immer so minimal wie nur möglich sein. Die Applikation sollte lokal immer ohne weitere Konfiguration starten. Jegliche Konfigurationen, die das Verhalten und die Umgebung der Applikation definieren und steuern, sollten via Environment Variablen in das Deployment gegeben werden.

Das Framework erlaubt es uns, dieses Paradigma zu verfolgen und zu leben. Wie im Beispiel oben gesehen, erlaubt uns die Extension ohne Weiteres eine strikte Separierung von Konfiguration und Code. Unnötige Komplexität, wie Broker-Konfiguration oder Ähnliches, werden strikt weggelassen. In einer Produktionsumgebung würden weitere Konfigurationen, wie die Kafka-Broker `KAFKA_BOOTSTRAP_SERVERS=kafka:9092`, als Umgebungsvariable hinzugefügt.

Natürlich haben wir auch Tradeoffs, die wir beachten müssen: Einige Konfiugrations-Properties in Quarkus und den Extensions können nur zur Build-Time verändert werden. Durch die Natur Quarkus unterscheiden wir zwischen Build-Time und Laufzeit-Properties. Build Time Optionen können - wie der Name suggeriert - nicht verändert werden, nachdem die Applikation gebaut wurde. Die Laufzeit Properties sind die Einstellungsmöglichkeiten mit welcher die Applikation initialisiert werden.

Aufgrund der vollständigen Dokumentation von Quarkus, können wir jederzeit schnell überprüfen, welche Config Properties wann verfügbar sind. Die Dokumentationsseite mit allen Config Properties gibt eine gute Referenz für alle verfügbaren Konfigurationen (<https://quarkus.io/guides/all-config>). Built-Time Optionen sind mit einem kleinen Schlösschen markiert.

Wie in allen modernen Frameworks haben unterschiedliche Konfigurationsmöglichkeiten eine definierte Präzedenz. Da wir das 12-Factor Application Manifesto kennen, erwarten wir dieses Verhalten. Alle Konfigurationen, die die Applikation benötigt, um in einer Entwicklungsumgebung gestartet werden zu können, sollten im Projekt definiert werden. Alle anderen Konfigurationen für allfällige Deployment Umgebungen werden dann durch Umgebungsvariablen ergänzt.

### Abschluss

Durch Quarkus wird der Graben zwischen modernen Cloud Native Sprachen und Java geschlossen. Wir können mit den bereits altbekannten und fundierten Java Kenntnissen neue Applikationen und Microservices für Container Plattformen massgeschneidert erstellen. Die Quality of Life Features von Quarkus erlauben uns, sich auf das Wesentliche zu konzentrieren und effizient moderne Microservices zu entwickeln.
