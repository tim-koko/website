---
title: "Enhancing Supply Chain Security in Kubernetes with Cosign, Rekor and Fulcio"
slug: "supply-chain-security-01"
description: ""
date: 2024-09-01T00:00:00+00:00
lastmod: 2024-09-01T00:00:00+00:00
draft: false
images: []
Sitemap:
Priority: 0.91
categories: ["Technologie", "Kubernetes", "Container", "Security"]
post_img: "images/blog/TK_BlogPost_2-3_RZ.png"
lead: "Supply Chain Security more and more becomes the attention it deserves, let's have a short introduction about Cosign, Rekor and Fulcio."
---

### Härtung der Supply Chain Security auf Kubernetes mit Cosign, Rekor und Fulcio

Da Kubernetes weiterhin die Container-Orchestrierung dominiert, wird die Gewährleistung der Sicherheit der Software-Lieferkette immer wichtiger. Selbst erfahrene Kubernetes-Experten stehen vor der Herausforderung, ihre containerisierten Anwendungen von der Entwicklung bis zur Bereitstellung abzusichern. In diesem Blog erfahren Sie, wie Cosign, Sigstore und Fulcio die Sicherheit der Lieferkette in Ihrer Kubernetes-Umgebung erhöhen können.

#### Unsere Software Supply Chain

Die Software-Lieferkette umfasst alle Schritte, die an der Erstellung, Verteilung und Bereitstellung von Software beteiligt sind. Dazu gehören Sourcecode, Build-Prozesse, externe Dependencies und die Deployment-Pipeline. Die Gewährleistung der Security dieser “Supply Chain” ist von entscheidender Bedeutung, da eine Kompromittierung in jeder Phase weitreichende Folgen haben kann.

In einer modernen Cloud-Umgebung ist der kontinuierliche Build Prozess für das endgültige Produkt schwer zu überprüfen und komplex. Software wird von Drittanbietern geliefert oder wir integrieren eine Vielzahl von Abhängigkeiten in unsere eigenen Projekte. Jedes Stück Software wird von verschiedenen Entitäten geändert - von Entwicklern, Lieferanten oder unseren CI-Pipelines - in jedem Schritt unserer Lieferkette. Aus diesem Grund wird die Sicherheit der Lieferkette immer wichtiger!

##### Supply-chain Levels for Software Artifacts, oder SLSA ("salsa")

{{< svg "assets/images/blog/scs/supply-chain-threats.svg" >}}

“It’s a security framework, a checklist of standards and controls to prevent tampering, improve integrity, and secure packages and infrastructure. It’s how you get from "safe enough" to being as resilient as possible, at any link in the chain.” - slsa.dev

Das SLSA Framework bringt uns eine Sammlung von Massnahmen und Möglichkeiten unsere Supply Chain Security zu verbessern. Die Kriterien werden in unterschiedliche Sicherheitslevel von Level Null (L0) bis Level Drei (L3) aufgeteilt und fassen die benötigten Grade der Sicherung unserer Supply Chain zusammen. Es ist ein hervorragender Einstiegspunkt um sich eine Übersicht über die eigene Situation zu machen.

Natürlich geht ohne technische Hilfe garnichts, rein das Reden über Supply Chain Security wird uns nicht viel weiter bringen. Deswegen werfen wir einen kurzen Blick auf das Tooling, welches wir verwenden können um unsere Supply Chain zu sichern.

#### Sigstore und die zugehörigen Tools: Cosign, Rekor und Fulcio

Sigstore bietet eine Sammlung von Tools die helfen unsere Images zu signieren und somit die Supply Chain Security deutlich zu verbessern.

* **Cosign**:
   Cosign ist ein CLI Tool zum Signieren und Verifizieren von Container-Images. Es zielt darauf ab, Container-Images durch kryptografische Signaturen zu sichern und sicherzustellen.

* **Rekor**:
   Sigstore ist ein Projekt, das eine Reihe von Werkzeugen und Diensten zur Sicherung der Software-Lieferkette bereitstellt, indem es die Signierung und Überprüfung von Software-Artefakten ermöglicht. Es bietet Transparenz und Rückverfolgbarkeit und stellt sicher, dass alle Artefakte verifiziert werden können und vertrauenswürdig sind.

* **Fulcio**:
   Fulcio ist eine Komponente des Sigstore-Projekts, die als Zertifizierungsstelle (CA) fungiert. Sie stellt kurzlebige Zertifikate aus, die auf OpenID Connect (OIDC) Identitäts-Tokens basieren. Dadurch wird sichergestellt, dass Signaturen an eine Identität gebunden sind, was die Vertrauenswürdigkeit der signierten Artefakte erhöht.

#### Signieren von Docker images Supply Chain mit Cosign, Sigstore, and Fulcio

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

#### Integration mit Kubernetes

Sobald wir signierte Images in unserer Supply Chain haben, können wir die Supply Chain Security richtig in Fahrt bringen. Die Integration dieser Tools in Ihre Kubernetes-Umgebung gewährleistet eine durchgängige Sicherheit für deine Lieferkette:

* **Admission Controller / Policy Enforcement**:   Mit Admission Controllern wie Kyverno können wir sicherstellen, dass wir gewisse Richtlinien / Policies auf unseren Clustern durchsetzen. Die Überprüfung der Signaturen von Containern könnte eine mögliche Implementation sein, die unsere Supply Chain Security auf das nächste Level bringt!
* **Continuous Monitoring**: Neben dem Erzwingen von Policies können wir natürlich auch jederzeit unsere Image Repositories und Cluster nach unsignierten Images oder nach falsch signierten Images zu scannen und unser Monitoring und Alerting Tooling dazu instrumentieren uns dabei zu unterstützen!

#### Fazit

Supply Chain Angriffe sind heutzutage alltäglich geworden. Umso wichtiger ist es unsere Supply Chain auf einem sinnvollen Masse zu Instrumentieren, dass wir mit einem guten Gewissen unseren containerisierten Workload auf unserem Cluster zu deployen. Das SLSA-Framework bietet uns eine kurze und auf den Punkt gebrachte Zusammenfassung über mögliche Massnahmen und Kriterien der Evaluation für Software Supply Chains. Durch den Einsatz von Tools wie Cosign, Rekor, Fulcio können wir die Integrität, Transparenz und Vertrauenswüdigkeit von Container-Images und unseren Artefakten verbessern und garantieren. Die Integration dieser Tools in unsere CI/CD Pipelines und Kubernetes Cluster gewährleistet eine durchgängige Security unserer Software Supply Chain.
