---
title: "Quarkus Developer Experience"
slug: "quarkus-developer-experience"
description: ""
date: 2024-05-21T00:00:00+00:00
lastmod: 2024-05-21T00:00:00+00:00
draft: false
images: ["images/blog/quarkus/tk-blogpost-02_quarkus_share-image.jpg"]
img_border: true
Sitemap:
Priority: 0.3

categories: ["Technology", "Quarkus", "Developer", "Java"]
authors: ['raffael-hertle']
post_img: "images/blog/quarkus/tk-blogpost-02_quarkus.jpg"
lead: "With Quarkus the Java ecosystem becomes a big developer experience boost. Let's explore some features and dive into Quarkus!"
---

Quarkus is designed to provide an exceptional developer experience by offering a streamlined and efficient workflow.
Let's explore some key aspects of the developer experience in Quarkus:

### Fast Startup Times

Fast Startup Time: Quarkus is known for its incredibly fast startup time, enabling developers to have a productive
development experience. Quarkus achieves this by employing a compile-time bootstrapping process, which eliminates
unnecessary runtime overhead. As a result, developers can start and restart their applications in milliseconds,
significantly reducing the development cycle time.

Let’s start with a plain Quarkus project. To start you will have multiple possibilities to generate the boilerplate
code for the project: Maven, Quarkus CLI or using the Web UI (<https://code.quarkus.io/>).

To generate a empty Quarkus project with the Quarkus CLI, we use:

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
--> /home/rhertle/code/quarkus-blog/example
-----------
Navigate into this directory and get started: quarkus dev
```

This will generate the boilerplate Maven project with all the things needed to get up to speed!

In normal development cycles we can start our application with the Quarkus CLI

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

You can already see that there is some console output which hints at some additional features of this dev-mode! We will
focus on the dev-mode in just a bit.

Without further work we can already build and run the application. Of course we use a docker image as our default to
run the application and to show and experience the full potential of Quarkus we are going to build a native executable
and do not rely on the JVM. This is as easy as starting the bootstrap project, when the Quarkus CLI is used. Keep in
mind that this will just demonstrate the startup process in the cloud when running in production.

```bash
$ quarkus image build --clean --native
[...]
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] --> 86dada6ff299
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] STEP 7/7: CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] COMMIT rhertle/example:1.0.0-SNAPSHOT
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] --> 73d5afa48475
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] Successfully tagged localhost/rhertle/example:1.0.0-SNAPSHOT
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] 73d5afa4847564080a7bdae0d93246e64d80823a7c17d5c23840fca81cff7583
[INFO] [io.quarkus.container.image.docker.deployment.DockerProcessor] Built container image rhertle/example:1.0.0-SNAPSHOT (null)

[INFO] [io.quarkus.deployment.QuarkusAugmentor] Quarkus augmentation completed in 351699ms
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  05:54 min
[INFO] Finished at: 2023-05-30T14:19:15+02:00
[INFO] ------------------------------------------------------------------------
```

As you might have experienced, the full native build takes quite some time and eats resources. This is normal - the
build will be fully optimized to run as a single native binary and will generate lightspeed close startup times! To
test the startup times, we simply run the container with our preferred container runtime:

```bash
$ docker run rhertle/example:1.0.0-SNAPSHOT
Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg.
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
 -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
--\___\_\____/_/ |_/_/|_/_/|_|\____/___/
INFO  [io.quarkus] (main) example 1.0.0-SNAPSHOT native (powered by Quarkus 3.10.1) started in 0.016s. Listening on: http://0.0.0.0:8080
INFO  [io.quarkus] (main) Profile prod activated.
INFO  [io.quarkus] (main) Installed features: [cdi, rest, smallrye-context-propagation, vertx]
```

In the blink of an eye the application started and is ready to serve traffic - 16 ms to spin up an Java application
is one of the many powerful features of Quarkus!

### Developer Joy with Live Coding

Quarkus comes with a powerful feature called «Live Coding», which allows developers to see code changes instantly
without the need for a manual restart. This feature is especially handy when working on large applications or
complex business logic. Developers can focus on writing code, and Quarkus takes care of automatically applying
the changes, making the development process highly interactive and efficient.

In our day to day usage, Quarkus offers us a feature we lack: Live Reloads. What frontend developers have since
the frontend’s universe creation, we finally are gifted with something similar. Code changes in Quarkus are detected
and with the next API call the application will restart and reload. This allows us to do multiple interesting things,
live reloads is probably the most common:

Start your application in dev mode and test the preconfigured REST endpoint `/hello`.

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

In another terminal simply cURL the endpoint to verify the resource is served:

```bash
$ curl localhost:8080/hello
Hello from RESTEasy Reactive%
```

Let’s change the code of the default example resource to see if the changes are reloaded:

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

Repeat the API call from before and observe the terminal in which the Quarkus application is running currently.

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

The dev-mode has detected the changes upon your request and restarted the application!

When observing the console output, we can see that there is a feature to «resume testing» ([r]). This is another
feature the live reload from Quarkus will enrich your daily business with: Continuous
Testing (<https://quarkus.io/guides/continuous-testing>)! Whenever code changes in your application, tests which will
be impacted by the change will run completely autonomously, while you are working on the application.

Hit that «R» button in the terminal and observe the output:

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

We have altered the GreetingResource which does not return «Hello from RESTEasy Reactive» anymore and therefore will
fail. Simply update your test and adopt your assertion to the updated response! With the next save in your files,
the tests will automatically rerun and should pass this time!

```bash
INFO  [io.qua.test] (Test runner thread) All tests are now passing
```

### Developer-Centric Tooling

Quarkus provides a comprehensive set of tools and extensions that simplify various aspects of application development.
The Quarkus ecosystem includes extensions for popular frameworks and libraries, such as RESTEasy, Hibernate, Kafka,
and many more. These extensions offer ready-to-use features and integrations, allowing developers to be productive
and leverage the best practices without spending time on tedious configurations.

In reality Java and Java EE applications are not made to simply return «Hello, world» to the user. Most of the time
the Java based microservice architecture will consume and produce content to several other applications and backing
services. For example Apache Kafka has gained a lot of popularity and attention when it comes to integrating
microservices in event-driven systems. Quarkus has built with its extension based approach a solid base to integrate
dependencies to other systems.

With the Quarkus CLI we can explore the available extensions and filter them if we need. With the `-s` parameter we
can filter extensions for keywords. Feel free to browse the list according to your needs and interests.

```bash
$ quarkus extension -s kafka --installable
Listing extensions (default action, see --help).
Current Quarkus extensions installable:

✬ ArtifactId                                    Extension Name
✬ quarkus-smallrye-reactive-messaging-kafka     SmallRye Reactive Messaging - Kafka Connector
```

In the following we are going to create a new microservice to produce and consume messages to and from a Kafka broker.
For this we simply create a new app and add the `quarkus-smallrye-reactive-messaging-kafka, quarkus-rest`
extensions to our application.

```bash
quarkus create app kafka --extensions=quarkus-smallrye-reactive-messaging-kafka,quarkus-rest
```

Take a look at the project - the CLI has done some work for you! Obviously it has added the correct dependency to
your `pom.xml`. But it also has created some basic examples and boilerplate code for your project. Quarkus extensions
are not just a technology specific wrapper for the dependency, but also allow you to inject codestarters into your
project. With the extension added, you will already have a class
`messaging/src/main/java/org/acme/MyReactiveMessagingApplication.java`:

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

In addition to the created example producer and consumers, the configuration to use a Kafka broker comes out of the box.

```properties
mp.messaging.incoming.words-in.topic=words
mp.messaging.outgoing.words-out.topic=words
mp.messaging.incoming.words-in.auto.offset.reset=earliest
```

As you can see the channels word-in and word-out are configured to listen and emit to a Kafka topic. Everybody who
has developed with Kafka before knows that creating a local Kafka setup is not that intuitive and requires some
additional services to run. Not with Quarkus - you will see what I mean in a few moments!

Start the application in dev-mode and observe.

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

Without any further configuration needed we somehow communicated with a Kafka instance. We produced messages in a topic
called `words` and consumed the messages again. Magic? Not really. What happened in the background, is that Quarkus
realized you had the dependency for reactive-messaging-kafka added to your project and started a testcontainer with a
Kafka-compatible API in the background for you. This way you can develop your applications locally, without the trouble
of managing any local or remote Kafka instances needed for development. When starting multiple Quarkus services with
the same dependencies added on your local machine, the testcontainers will automatically detect another running
instance and configure your local project accordingly. You can test that by simply creating another project with the
same dependencies.

Another feature enhancing the development experience is the dev UI. In your browser, head to
<http://localhost:8080/q/dev-ui/> or simply hit the «D» key in your running terminal in dev-mode. You can see the
configuration and state of your application in a small one-pager. A lot of extensions also enable you to interact
with the system or dev-services itself. For example in this case Kafka: Click on the Kafka Client link in your
dev-ui (<http://localhost:8080/q/dev-v1/io.quarkus.quarkus-kafka-client/kafka-dev-ui>). This will lead you to a small
overview of the kafka topics, its messages and a rudimentary client to produce messages.

### Simplified Configuration

Quarkus embraces the principle of «convention over configuration» to minimize the configuration burden for developers.
The framework provides sensible defaults and auto-configuration based on dependencies, reducing the need for explicit
configuration. Developers can focus on writing business logic rather than spending excessive time on configuration
files. The central configuration specification used in Quarkus is the MicroProfile Config
(<https://microprofile.io/microprofile-config/>) implemented by SmallRye config (<https://smallrye.io/smallrye-config/Main/>).

Do you remember the 12-factor application manifesto (<https://12factor.net/>)? Configuration of your
application should always be as minimal as possible. The application should always be able to run without further
configuration on your local machine. All configuration which will define the applications behavior and environment,
should be handled via environment variables in the deployment.

The framework itself enables you to follow this paradigm. As seen in the example above, the extensions also allow you
to separate config from code pretty strictly and strip unnecessary complexity off you. Did you see any Kafka specific
configuration in the example? When run in production, the application would for example be configured with the Kafka
brokers URLs in the `KAFKA_BOOTSTRAP_SERVERS=kafka:9092` environment property.

Of course there are some tradeoffs we have to be aware of: Some configuration properties in Quarkus and its extensions
can only be altered at build time. The nature of Quarkus distinguishes between build time options and runtime options.
Build time options - like the name suggests - can not be changed after the application has been built. The runtime
options can be altered before the application starts, these are the configurations the application initializes with.

Due to the completeness of the Quarkus documentation, we can quickly check which configuration properties are available
and when they are applied. The documentation page for all config properties is the complete reference to all possible
configurations available (<https://quarkus.io/guides/all-config>). When browsing the configuration possibilities, you can
see that build time options are marked with a small lock.

Configuration sources in Quarkus - as in most other frameworks - follow a certain precedence: Highest precedence have
system properties, second environment variables and last the properties files in the classpath. This is expected
behavior and follows the best practices specified in the 12 factor application manifesto. From a developers
perspective, the properties files should define the systems configuration for development. Deployments in cloud
environments should only update configuration via environment variables in the specific deployment.

### Summary

With Quarkus the Java ecosystem became a lot more cloud native. Already acquired skills from the Java world can still be used to produce high quality cloud-native software for Kubernetes and Container centered application systems. Especially the developer experience gains a massive boost with Quarkus and its features. Testcontainers and live-coding bring the fun back in developing Java applications.
