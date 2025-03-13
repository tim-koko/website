---
title: "Baloise - Distributed Tracing Plattform PoC auf Basis von OpenTelemetry und Grafana Tempo"
description: ""
lead: ""
date: 2025-03-04T00:00:00+00:00
lastmod: 2025-03-04T00:00:00+00:00
draft: false
images: ["images/landing-pages/tk-giveaway-2024-1500x1000.png"]
Sitemap:
Priority: 0.3
client: "Baloise"
post_img: "images/landing-pages/tk-giveaway-2024-1500x1000.png"
img_border: false
lead: "Für die Baloise haben wir im Rahmen eines Proof of Concepts (PoC) eine innovative Tracing-Plattform auf Basis von OpenTelemetry und Grafana Tempo entwickelt. Ziel war es, eine Cloud-native Alternative zur bestehenden proprietären Lösung zu evaluieren."
techStack: "Red Hat OpenShift, OpenTelemetry, Grafana Tempo, Prometheus, Grafana, Thanos, ArgoCD, Helm"
link: ""

# don't publish the page
_build:
 list: never
 render: never
---


Für die Baloise haben wir im Rahmen eines Proof of Concepts (PoC) eine innovative Tracing-Plattform auf Basis von OpenTelemetry und Grafana Tempo entwickelt. Ziel war es, eine Cloud-native Alternative zur bestehenden proprietären Lösung zu evaluieren. Der PoC bestätigte erfolgreich, dass der Open-Source-Stack die hohen Anforderungen der Baloise erfüllt, eine nahtlose Integration in die bestehende Observability-Infrastruktur ermöglicht und die Grundlage für ein vereinfachtes Tracing-Onboarding der Entwicklungsteams schafft. Durch die Expertise von tim&koko konnte die Baloise wertvolle Erkenntnisse gewinnen und den Grundstein für eine moderne, skalierbare und kosteneffiziente Tracing-Strategie legen.

## Über die Kundin

Die Baloise Versicherung ist eine renommierte schweizerische Versicherungsgruppe mit einer langen Tradition und einem starken Fokus auf innovative Lösungen. Mit Hauptsitz in Basel bietet das Unternehmen ein breites Spektrum an Versicherungs- und Vorsorge Dienstleistungen sowohl für Privatkunden als auch für Unternehmen. Durch die Kombination von traditionellem Versicherungsgeschäft mit modernen digitalen Ansätzen setzt die Baloise Massstäbe in der Branche und geniesst das Vertrauen von Millionen von Kunden in der Schweiz und darüber hinaus.

## Herausforderung

Die Baloise nutzte bereits eine proprietäre Tracing-Lösung, sah sich aber mit folgenden Herausforderungen konfrontiert:

* **Hohe Lizenzkosten:** Die bestehende Lösung verursachte erhebliche Lizenzkosten.  
* **Geringe Akzeptanz:** Aufgrund mangelnder Integration und ihrer Komplexität wurde die vorhandene Plattform nicht umfassend genutzt.  
* **Isolierte Insellösung:** Die bestehende Lösung war kaum in die vorhandene Observability-Infrastruktur integriert.
* **Wunsch nach Self-Service:** Die Teams benötigten eine einfachere Möglichkeit, Tracing-Funktionalitäten im Self-Service zu nutzen.
* **Skalierbarkeit und Performance:** Hohe Anforderungen an Performance und Skalierbarkeit für zukünftigen, breiten Einsatz im gesamten Unternehmen.
* **Integration mit bestehendem Monitoring:** Bestehendes Metrics-basiertes Monitoring (Prometheus, Grafana, Thanos) sollte eng mit dem Tracing integriert werden.

## Lösungsansatz

In Kooperation mit tim&koko initiierte Baloise einen Proof of Concept (PoC) zur Entwicklung einer hochmodernen Tracing-Plattform. tim&koko unterstützte Baloise mit umfassendem Fachwissen im Bereich OpenTelemetry und Cloud-Native Tracing. Gemeinsam realisierten wir im PoC eine Cloud-Native Tracing-Plattform, die auch das Monitoring der Plattform selbst umfasst, wobei besonderer Wert auf Alerts, ServiceMonitors und Dashboards gelegt wurde.

* **OpenTelemetry und Grafana Tempo:** Aufbau einer Cloud-Native Tracing Plattform basierend auf offenen Standards.
* **Skalierbare Architektur:** Design einer skalierbaren Architektur, analog zum bestehenden Prometheus Monitoring Stack, um eine Team-spezifische Skalierung zu ermöglichen.
* **Workshops und Zielbild:** Gemeinsame Workshops zur Definition des Zielbilds und der konkreten PoC-Inhalte.
* **Best Practices Deployment:** Aufbau der OpenTelemetry Infrastruktur über mehrere OpenShift Cluster hinweg unter Berücksichtigung von Best Practices.
* **Individualisierbare Collector Pipelines:** Entwicklung flexibler Collector Pipelines zur Filterung, Anreicherung (globale Labels) und Weiterleitung von Traces an Grafana Tempo.
* **Grafana Tempo Evaluation:** Evaluierung von Grafana Tempo als performantes und integrierbares Tracing Backend.
* **Trace und Span Metrics:** Implementierung von Trace und Span Metriken zur erweiterten Analyse.
* **Instrumentierung und Autoinstrumentierung:** Evaluierung und Implementierung von Instrumentierungsstrategien für Applikationen (Auto- und manuelle Instrumentierung).
* **Lasttests und Validierung:** Durchführung von Lasttests zur Validierung der Performance und Skalierbarkeit des Konzepts.

## Ergebnisse

* **PoC Erfolg:** Der PoC demonstrierte erfolgreich, dass eine Tracing Plattform basierend auf OpenTelemetry und Grafana Tempo die hohen Anforderungen der Baloise erfüllt und eine attraktive Alternative zur proprietären Lösung darstellt.
* **Integrierte Observability:** Die Integration von Traces, Metrics und Logs in Grafana ermöglicht eine ganzheitliche Sicht und eliminiert den Medienbruch zu einer separaten Tracing Plattform.
* **Vertraute User Experience:** Die Nutzung von Grafana als zentrale UI sorgt für eine konsistente User Experience und nahtlose Integration in bestehende Prozesse und Infrastrukturen.
* **Volle Ownership:** Das Baloise Team übernahm erfolgreich die Ownership für die neue Plattform im Rahmen des PoCs.
* **Skalierbarkeit gewährleistet:** Die designte Architektur ermöglicht eine horizontale Skalierung der Tracing Plattform pro Team.
* **Offene Standards und Vendorunabhängigkeit:** Die Nutzung offener Standards (OpenTelemetry) reduziert Vendor Lock-in und ermöglicht flexible Deployments in verschiedenen Umgebungen (On-Premises, Public Cloud).

## Kundenstatement

“Ich möchte euch nochmals für die exzellente Unterstützung danken. Ich denke wir wären nicht so schnell so weit gekommen ohne euch, wenn überhaupt.”

Michael Mühlebach & Product Owner

## Fazit & Lessons Learned

Der PoC bestätigte eindrücklich das Potenzial von Cloud-Native Tracing Plattformen als Alternative zu klassischen, proprietären Lösungen. OpenTelemetry in Kombination mit Grafana Tempo erwies sich als ideale Lösung für die Anforderungen der Baloise. Besonders hervorzuheben ist die exzellente Zusammenarbeit mit dem Team, die massgeblich zum Erfolg des PoCs beigetragen hat.  Die gewonnenen Erkenntnisse und die im PoC aufgebaute Plattform bilden nun eine solide Grundlage für den Aufbau einer produktiven, unternehmensweiten Tracing Lösung bei der Baloise.

Haben Sie ähnliche Herausforderungen im Bereich Observability oder möchten Sie mehr über die Vorteile von Tracing erfahren? Kontaktiere uns für ein unverbindliches Gespräch:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">tim&koko kontaktieren</a>
