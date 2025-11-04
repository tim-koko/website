---
title: "KubeVirt Journey - Potenzial und Einsatzgebiete von KubeVirt"
slug: "kubevirt-usecases"
description: ""
date: 2024-11-21T00:00:00+00:00
lastmod: 2024-11-21T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt/tk-blogpost-kubevirt_share-image.jpg"]
img_border: true
Sitemap:
  Priority: 0.9

additionalblogposts: [ 'kubevirt-introduction', 'kubevirt-training']

categories: ["Technologie", "KubeVirt", "Kubernetes"]
authors: ['christof-luethi']
post_img: "images/blog/kubevirt/tk-blogpost-kubevirt.jpg"
lead: "Der Einsatz von virtuellen Maschinen ist heutzutage nicht mehr wegzudenken. Neben dem Ersatz von bestehenden Virtualisierungslösungen bietet KubeVirt das Potenzial um Infrastrukturen und Workflows zu modernisieren."
---

Im zweiten Blogpost unserer KubeVirt-Serie (Teil 1: [KubeVirt Journey - Einführung in die Verwaltung von virtuellen Maschinen in Kubernetes]({{< ref "blog/2024-kubevirt-introduction" >}})) schauen wir uns die Einsatztgebiete von KubeVirt an. Die Technologie hat sich zum Ziel gesetzt, die Verwendung von virtuelle Maschinen
mit modernen Patterns neu zu definieren. Wir bei Tim&Koko sind überzeugt, dass der Cloud-Native-Ansatz von KubeVirt der
richtige Weg ist, um Infrastrukturen, Workloads und Workflows von traditionellen virtuellen Maschinen zu modernisieren.

Nun schauen wir uns das Potenzial von KubeVirt anhand einiger Einsatzgebiete etwas genauer an.

### Vereinheitlichung und Modernisierung der Infrastruktur

Oft werden technologisch komplett unterschiedliche Infrastrukturen für virtuelle Maschinen sowie Container-Workload
aufgebaut und betrieben.

{{< svg "assets/images/blog/kubevirt/infrastructure-convergence.svg" >}}
<br /><br />

Durch die Verwendung von Kubernetes als Grundlage für VM- und Container-Workload kann das Tooling rund um die Infrastruktur
vereinheitlicht werden. So können zum Beispiel Log-, Monitoring- und Storage-Systeme sowie Netzwerke zusammengeführt
werden. Der Betrieb der zwei Infrastruktur-Stacks und dessen Ökosysteme entfällt somit. Dies hat den Vorteil, dass sich
die Infrastruktur vereinfacht und durch die Konsolidierung können Betriebskosten eingespart werden. Gleichzeitig erhöhen
Container-Plattformen die Flexibilität und Portabilität der Workload und ermöglichen es somit, schneller auf Veränderungen
zu reagieren.

### Vereinheitlichung des Workflows

Nicht weniger zentral als die Vereinheitlichung von Infrastruktur und Hardware-Komponenten ist der Einfluss auf der
Workflow-Ebene. Bekannte Tools und Workflows aus der Container-Welt können identisch auf virtuelle Maschinen angewandt
werden. Das Definieren und Verwalten von virtuellen Maschinen ist deklarativ möglich und Infrastrukturen können so
komplett als YAML-Ressourcen beschrieben und versioniert werden.

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: fedora-vm
spec:
  running: true
  template:
    metadata:
      labels:
        kubevirt.io/domain: fedora-vm
    spec:
      domain:
        devices:
          disks:
            - name: fedora-disk
              disk:
                bus: virtio
          interfaces:
            - name: default
              masquerade: {}
        resources:
          requests:
            memory: 1Gi
      networks:
        - name: default
          pod: {}
      volumes:
        - name: fedora-disk
          containerDisk:
            image: quay.io/containerdisks/fedora:40
```

Einer der grössten Vorteile der deklarativen Beschreibung und der Versionierung ist die Reproduzierbarkeit von Umgebungen.
Änderungen können so konsistent und nachvollziehbar umgesetzt werden. Durch die Einbindung in automatisierte Prozesse
wie CI/CD-Pipelines können Änderungen automatisch getestet werden, was im Endeffekt die Verlässlichkeit bei der
Bereitstellung und Wartung von Systemen erhöht. Die Automatisierung kann ebenfalls dazu verwendet werden, um
betriebsinterne Prozesse, manuelle Schritte und Abhängigkeiten zu reduzieren, was zu einer schnelleren Bereitstellung
der Ressourcen führt.

### Application Migration

Werden Monolithen in VMs in Container-Architekturen überführt, ist während der Migration oft ein
Parallelbetrieb nötig. Durch den Betrieb des Monolithen als KubeVirt-VM kann bereits während der Transition eine
einheitliche Infrastruktur verwendet werden. Dies kann für eine kostengünstigere und ressourcenschonendere Umsetzung
der Migration sorgen.

{{< svg "assets/images/blog/kubevirt/application-migration.svg" >}}
<br /><br />

Ist eine Ablösung einer Applikation in einer VM aufgrund wirtschaftlicher oder technischer Aspekte nicht sinnvoll, kann
der Betrieb auf Container-Plattformen dafür sorgen, dass Applikationen besser und einfacher integriert werden können.

### Verwendung und direkter Zugriff auf dedizierte Hardware

Normaler Container-Workload ermöglicht es nicht, spezielle Hardware einzubinden. Virtuelle Maschinen haben diese
Fähigkeit. Mittels KubeVirt können virtuelle Maschinen ebenfalls direkten Zugriff auf Geräte des Host-Systems erlangen.
Beispiele sind hier direkte Netzwerkkarten oder die Verwendung von Grafikkarten in VMs. Nvidia ist ein grosser Treiber
des KubeVirt Projektes und verwendet KubeVirt für das Nvidia GeForce Now. Der Vorteil für Unternehmen liegt in einer
effizienteren und kostengünstigeren Ressourcennutzung und der erhöhten Flexibilität, da spezialisierte Geräte dynamisch
an die VMs zugewiesen werden können.

### Kubernetes-as-a-Service (KaaS)

Das Konzept Kubernetes auf Kubernetes bietet interessante Anwendungsfälle. Insbesondere in Szenarien, in denen
Multi-Tenancy und Isolation eine grosse Rolle spielen. So kann zum Beispiel ein Anbieter isolierte Kubernetes-Tenants
anbieten, welche auf virtuellen KubeVirt Maschinen auf Kubernetes basieren. Diese Kubernetes-Tenants können bei Bedarf
skaliert und durch weitere virtuelle Maschinen erweitert werden. Dadurch kann die Bereitstellung von Tenants schneller, zentral
und komplett automatisiert erfolgen. Durch die starke Isolation von VMs können geforderte Sicherheitsaspekte besser abgedeckt
werden.

### Kein Vendor-Lock-In

Das KubeVirt-Projekt is Open-Source und wird von mehreren grossen Firmen wie zum Beispiel Red Hat, Nvidia oder
Cloudflare konstant weiterentwickelt. Die KubeVirt-Community wächst derzeit rasant. Kommt der Einsatz von
Community-Supported Software nicht infrage, kann zum Beispiel Red Hat OpenShift Virtualization, welches auf KubeVirt
basiert, eingesetzt werden. Für OpenShift Virtualization ist wiederum kommerzieller Enterprise-Grade Support von Red Hat
vorhanden.

### Zusammenfassung

KubeVirt ist eine interessante Alternative zu den bestehenden Virtualisierungslösungen. Das Ziel von KubeVirt ist nicht
primär der eins zu eins Ersatz von bestehenden Virtualisierungslösungen. Das volle Potenzial entwickelt sich, wenn der
VM-Workload so definiert ist, dass er mit denselben Tools und Workflows der Container-Welt gemanagt werden kann. Dies
erlaubt es Unternehmen Infrastruktur zu vereinheitlichen sowie die Ressourcen effizienter zu nutzen und dadurch operative
Kosten zu sparen. Durch die Konsolidierung kann auch die Produktvielfalt reduziert werden. Einheitliches Tooling,
Automatisierung und Integration in CI/CD-Pipelines fördert die Developer Experience und sorgt dafür, dass Ressourcen
schneller zur Verfügung stehen.

## Möchtest Du mehr erfahren?

Gerne stehen wir für Fragen zur Verfügung. Du erreichst uns am besten unter [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch)&nbsp;oder auf [LinkedIn](https://www.linkedin.com/company/tim-koko).

Weiter bieten wir dir die folgenden Möglichkeiten, dich vertieft mit dem Thema KubeVirt oder OpenShift Virtualization auseinander zu setzen:

- [tim&koko labs](https://tim-koko.ch/labs/): An einem Nachmittag die Grundlagen von OpenShift Virtualization kennenlernen und in praktischen hands-on labs direkt anwenden.
- [KubeVirt Basics Training](https://acend.ch/trainings/kubevirt/): Zweitägiges abwechslungsreiches Training mit Präsentationen und hands-on labs.
- [OpenShift Virtualization Accelerator Package](https://tim-koko.ch/services/openshift-virtualization-accelerator/): Wir helfen dir, die Möglichkeiten von OpenShift Virtualization zu erkunden und herauszufinden, wie hoch das Potenzial für eine neue oder parallele Strategie sein
  könnte.
