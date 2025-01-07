---
title: "OpenShift Virtualization"
slug: "openshift-virtualization"
description: ""
date: 2025-01-10T00:00:00+00:00
lastmod: 2025-01-10T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt-training/kubevirt-training-some-1200x630.png"]
img_border: false
Sitemap:
Priority: 0.9


additionalblogposts: [ 'kubevirt-introduction', 'kubevirt-usecases', 'kubevirt-training' ]

categories: ["Technologie", "KubeVirt", "Kubernetes"]
authors: ['raffael-hertle']
post_img: "images/blog/kubevirt-training/kubevirt-training-blogpost-1500x1000.png"
lead: "Red Hat OpenShift Virtualization bietet als eine Erweiterung von Red Hat OpenShift eine Möglichkeit, virtuelle Maschinen einfach und effizient in ihr bestehendes Umfeld standardisiert zu integrieren. Es erlaubt, die traditionellen Virtualisierungslösungen und die Cloud Native Welt zu einer zuverlässigen, konsistenten und standardisierten Hybrid Cloud Anwendungsplattform zusammenzuführen."
---


In der KubeVirt-Serie haben wir schon über Vorteile, Anwendungen und die Konzepte von KubeVirt gesprochen. Das Projekt wird open-source von der Cloud Native Computing Foundation (CNCF) weiterentwickelt und unterhalten. Wer lieber Enterprise Support benötigt und sich in der OpenShift Konsole wohler fühlt, für den wird das downstream Projekt Red Hat OpenShift Virtualization vielversprechend sein.

### Vorteile von Red Hat OpenShift Virtualization

Durch die Implementation von OpenShift Virtualization in deinem OpenShift Cluster kannst du von den folgenden Vorteilen profitieren:

* Unterstützte Migration: OpenShift Virtualization kommt mit einem hauseigenen Migrations-Toolkit (https://access.redhat.com/products/migration-toolkits-virtualization), um einfach von anderen Hypervisoren zu migrieren.
* Schneller in Produktion: Durch OpenShift Virtualization kann die Bereitstellung der Infrastruktur durch Self Service Portale und die nahtlose Integration mit CI/CD-Pipelines unterstützt und vereinfacht werden. Entwickler:innen können durch OpenShift Virtualization einfacher VMs erstellen, testen und in ihre Systeme integrieren.
* Einheitliche Plattform: Durch OpenShift Virtualization werden VMs genau wie Container, Pipelines und Serverless Workload gleich integriert. Die Integration in die OpenShift Umgebung erlaubt eine einfache und übersichtliche Art virtuelle Maschinen standardisiert zu verwalten.

{{< custom-image "../images/openshift-virtualization/migration-ui.png" 500 >}}

<br/><br/>

#### Installation und Features

OpenShift Virtualization wird als Operator auf der OpenShift Plattform installiert. Durch den OperatorHub kann der Operator installiert und verwendet werden. Durch die Installation werden in dem OpenShift Cluster weitere CustomResourceDefinitions (CRDs) und Features freigeschaltet.
Zu diesen Features gehören:

* Erstellen und Verwalten von virtuellen Maschinen
* Verbindung zu VMs mit UI- oder CLI-Tools
* Klonen und Importieren von bereits vorhandenen VMs
* Verwaltung von Netzwerkschnittstellen-Controllern und Storage an VMs
* Live Migration der VMs über OpenShift Nodes
* Migrations Toolkit for Virtualization

### Möchtest Du mehr erfahren?

Gerne stehen wir für Fragen zur Verfügung. Du erreichst uns am besten unter [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch)&nbsp;oder auf [LinkedIn](https://www.linkedin.com/company/tim-koko).

Weiter bieten wir dir die folgenden Möglichkeiten, dich vertieft mit dem Thema KubeVirt oder OpenShift Virtualization auseinander zu setzen:

* [tim&koko labs](https://tim-koko.ch/labs/): An einem Nachmittag die Grundlagen von KubeVirt kennenlernen und in praktischen hands-on labs direkt anwenden.
* [KubeVirt Basics Training](https://acend.ch/trainings/kubevirt/): Zweitägiges abwechslungsreiches Training mit Präsentationen und hands-on labs.
* [OpenShift Virtualization Accelerator Package](https://tim-koko.ch/services/openshift-virtualization-accelerator/): Wir helfen dir, die Möglichkeiten von OpenShift Virtualization zu erkunden und herauszufinden, wie hoch das Potenzial für eine neue oder parallele Strategie sein
  könnte.
