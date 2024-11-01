---
title: "Schütze Deine Software Supply Chain: Security vom Code zum Deployment"
slug: "supply-chain-security-01"
description: ""
date: 2024-09-29T14:00:00+00:00
lastmod: 2024-09-29T14:00:00+00:00
draft: false
images: ["images/blog/scs/supply-chain-security-blog-SOME.png"]
img_border: true
Sitemap:
Priority: 0.91
categories: ["Technologie", "Kubernetes", "Security"]
authors: ['raffael-hertle']
post_img: "images/blog/scs/supply-chain-security-blog.png"
lead: "Supply Chain Security ist eines der wichtigsten Themen im DevSecOps-Bereich und hat heute mehr Relevanz denn je! Angesichts zunehmender Cyberangriffe stehen unsere Kund:innen vor der Herausforderung, ihre Software Supply Chain sicher und vertrauenswürdig zu gestalten. In dieser neuen Blogserie möchten wir einen klaren Überblick präsentieren und praktische Unterstützung bieten für alle, die neu in diesem Thema sind oder ihre Kenntnisse vertiefen möchten."

---

Wir beginnen mit einer Einführung in das Gebiet und erläutern, warum Supply Chain Security für die Sicherheit und Integrität Ihrer Software-Deployments entscheidend ist. Im ersten Beitrag werden wir zudem eine praktische Demonstration zur Signatur und Verifizierung von Containern durchführen, um Ihnen konkrete Werkzeuge und Methoden an die Hand zu geben, mit denen du die Sicherheit verbessern kannst.

Wir sind der Meinung, dass diese Konzepte existenziell sind, um die Sicherheit unserer Kund:innen deutlich zu verbessern und ihnen zu helfen, sich besser gegen moderne Bedrohungen zu schützen.

### Supply Chain Security

Da Kubernetes weiterhin die Container-Orchestrierung dominiert, wird die Gewährleistung der Sicherheit der Software-Lieferkette immer wichtiger. Selbst erfahrene Kubernetes-Experten stehen vor der Herausforderung, ihre containerisierten Anwendungen von der Entwicklung bis zur Bereitstellung abzusichern. Dass Supply Chain Attacken in letzter Zeit drastisch zugenommen haben, bestätigen auch die globalen Reports und Statistiken, z.B.: [Statista 2024](https://www.statista.com/statistics/1268934/worldwide-open-source-supply-chain-attacks/).

### Unsere Software Supply Chain

Die Software Supply Chain umfasst alle Schritte, die an der Erstellung, Verteilung und Bereitstellung von Software beteiligt sind. Dazu gehören Sourcecode, Build-Prozesse, externe Dependencies und die Deployment-Pipeline. Die Gewährleistung der Security dieser “Supply Chain” ist von entscheidender Bedeutung, da eine Kompromittierung in jeder Phase weitreichende Folgen haben kann.

In einer modernen Cloud-Umgebung ist der kontinuierliche Build Prozess für das endgültige Produkt schwer zu überprüfen und komplex. Software wird von Drittanbietern geliefert oder wir integrieren eine Vielzahl von Abhängigkeiten in unsere eigenen Projekte. Jedes Stück Software wird von verschiedenen Entitäten geändert - von Entwicklern, Lieferanten oder unseren CI-Pipelines - in jedem Schritt unserer Lieferkette. Aus diesem Grund wird die Sicherheit unserer gesamten Software Supply Chain immer wichtiger!

#### Supply-chain Levels for Software Artifacts, oder SLSA ("salsa")

{{< svg "assets/images/blog/scs/supply-chain-threats.svg" >}}

“It’s a security framework, a checklist of standards and controls to prevent tampering, improve integrity, and secure packages and infrastructure. It’s how you get from "safe enough" to being as resilient as possible, at any link in the chain.” - slsa.dev

Das SLSA Framework bringt uns eine Sammlung von Massnahmen und Möglichkeiten unsere Supply Chain Security zu verbessern. Die Kriterien werden in unterschiedliche Sicherheitslevel von Level Null (L0) bis Level Drei (L3) aufgeteilt und fassen die benötigten Grade der Sicherung unserer Supply Chain zusammen. Es ist ein hervorragender Einstiegspunkt um sich eine Übersicht über die eigene Situation zu machen.

Natürlich geht ohne technische Hilfe garnichts, rein das Reden über Supply Chain Security wird uns nicht viel weiter bringen. Deswegen werfen wir einen kurzen Blick auf das Tooling, welches wir verwenden können um unsere Supply Chain zu sichern.

### Sigstore und die zugehörigen Tools: Cosign, Rekor und Fulcio

Sigstore bietet eine Sammlung von Tools die helfen unsere Images zu signieren und somit die Supply Chain Security deutlich zu verbessern.

* **Cosign**:
   Cosign ist ein CLI Tool zum Signieren und Verifizieren von Container-Images. Es zielt darauf ab, Container-Images durch kryptografische Signaturen zu sichern und sicherzustellen.

* **Rekor**:
   Rekor ist ein Transparency Log, welches als immutable Merkle Baum aufgebaut ist. Durch die Natur des des Merkle Baums ist garantiert, dass Log Einträge nur angehängt werden und immer kryptographisch verifiziert werden können.

* **Fulcio**:
   Fulcio ist eine Komponente des Sigstore-Projekts, die als Zertifizierungsstelle (CA) fungiert. Sie stellt kurzlebige Zertifikate aus, die auf OpenID Connect (OIDC) Identitäts-Tokens basieren. Dadurch wird sichergestellt, dass Signaturen an eine Identität gebunden sind, was die Vertrauenswürdigkeit der signierten Artefakte erhöht.

### Signieren von Docker images Supply Chain mit Cosign, Sigstore, and Fulcio

Wir möchten unser neu gebautes Image auf einer öffentlichen Registry publizieren. Sicher kennen wir alle möglichen Sicherheitslücken die passieren können, wenn unverifizierte und unsignierte Software in unser Ökosystem gelangt. Deswegen möchten wir unser neu erstelltes Image auch signieren.

Um Images zu signieren, benötigen wir die cosign CLI. Auf der release page finden wir die neuesten Releases und können diese herunterladen.

```sh
wget "https://github.com/sigstore/cosign/releases/download/v2.4.0/cosign-linux-amd64" 
sudo mv cosign-linux-amd64 /usr/local/bin/cosign 
sudo chmod +x /usr/local/bin/cosign
# Verify with `cosign version`
cosign version
```

Zu Demozwecken erstellen wir einen Dummy Container, wir können natürlich jeden beliebigen Container verwenden.

```Dockerfile

Dockerflie:
FROM alpine

CMD ["echo", "hello-world"]
```

Wir bauen das Image, taggen es entsprechend und pushen es in die Registry

```sh
docker build -t g1raffi/my-image:latest .
docker push g1raffi/my-image:latest
```

Um unser neu erstelltes Image zu signieren können wir ganz einfach mit der Cosign CLI cosign sign aufrufen. In diesem Falle verwenden wir die Keyless Variante und lassen uns über Fulcio ein kurzlebiges Zertifikat durch einen gewählten Open-Id-Connect Provider erstellen.

```sh
cosign sign g1raffi/my-image:latest
```

Folge dem Prozess und wähle den OIDC Provider deiner Wahl. Zum Schluss wirst du folgende Bestätigungsnachricht bekommen:

```sh
tlog entry created with index: 134308541
Pushing signature to: index.docker.io/g1raffi/my-image
```

Die Benachrichtigung bestätigt uns zwei Sachen: Wir haben einen Eintrag in das Transparency Log geschrieben und unsere Signatur wurde in die Registry zum Image gepusht.
Um den Vorgang auf der konsumierenden Seite anzuschauen, können wir ganz einfach unser erstelltes Image verifizieren. Dazu verwenden wir ebenfalls das Cosing Binary mit dem Befehl cosign verify. Für die Verifikation von Keyless signierten Images, müssen wir noch den OIDC Issuer und die Identity mitgeben:

```sh
 cosign verify \
    --certificate-identity raffael@tim-koko.ch \
    --certificate-oidc-issuer https://accounts.google.com \
      g1raffi/my-image:latest

Verification for index.docker.io/g1raffi/my-image:latest --
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - Existence of the claims in the transparency log was verified offline
  - The code-signing certificate was verified using trusted certificate authority certificates
```

Durch den Output wird bestätigt, dass wir eine gültige Signatur verifiziert haben und alle Einträge korrekt sind - yey!

### Integration mit Kubernetes

Sobald wir signierte Images in unserer Supply Chain haben, können wir die Supply Chain Security richtig in Fahrt bringen. Die Integration dieser Tools in deine Kubernetes-Umgebung gewährleistet eine durchgängige Sicherheit für deine Lieferkette:

* **Admission Controller / Policy Enforcement**:   Mit Admission Controllern wie Kyverno können wir sicherstellen, dass wir gewisse Richtlinien / Policies auf unseren Clustern durchsetzen. Die Überprüfung der Signaturen von Containern könnte eine mögliche Implementation sein, die unsere Supply Chain Security auf das nächste Level bringt!
* **Continuous Monitoring**: Nebst dem Erzwingen von Policies können wir natürlich auch jederzeit unsere Image Repositories und Cluster nach unsignierten Images oder nach falsch signierten Images scannen und unser Monitoring und Alerting Tooling dazu instrumentieren uns dabei zu unterstützen!

### Fazit

Supply Chain Angriffe sind heutzutage alltäglich geworden. Umso wichtiger ist es unsere Supply Chain auf einem sinnvollen Masse zu instrumentieren, damit wir mit einem guten Gewissen unseren containerisierten Workload auf unseren Clustern deployen können. Das SLSA-Framework bietet uns eine kurze und auf den Punkt gebrachte Zusammenfassung über mögliche Massnahmen und Kriterien der Evaluation für Software Supply Chains. Durch den Einsatz von Tools wie Cosign, Rekor, Fulcio können wir die Integrität, Transparenz und Vertrauenswüdigkeit von Container-Images und unseren Artefakten verbessern und garantieren. Die Integration dieser Tools in unsere CI/CD Pipelines und Kubernetes Cluster gewährleistet eine durchgängige Security unserer Software Supply Chain.

<br><hr><br>

Möchtest du mehr erfahren über verschiedene Levels des SLSAs und gehärtete Kubernetes native Supply Chains, oder wenn auch wir dir helfen können deine Supply Chain Security ins nächste Level zu heben, melde dich jederzeit via <a href="mailto:hallo@tim-koko.ch">hallo@tim-koko.ch</a> und hoffentlich dürfen wir auch dich als Partner und/oder zufriedenen Kunden begrüssen!
