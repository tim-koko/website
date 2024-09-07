---
title: "Verwaltung virtueller Maschinen in Kubernetes mit KubeVirt"
slug: "kubevirt-introduction"
description: ""
date: 2024-09-07T00:00:00+00:00
lastmod: 2024-09-07T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt/tk-blogpost-06_kubevirt_share-image.jpg"]
Sitemap:
Priority: 0.9

categories: ["Technologie", "KubeVirt", "Kubernetes"]
post_img: "images/blog/kubevirt/tk-blogpost-06_kubevirt.jpg"
lead: "KubeVirt ist ein Projekt, welches die Verwendung von virtuellen Maschinen auf Container Plattformen wie Kubernetes möglich macht. "
---

### Was ist KubeVirt

KubeVirt ist eine Kubernetes-Erweiterung nach dem Operator Pattern. Es wurde im Jahre 2016 von Red Hat initiiert und
steht seit 2017 als Open-Source-Software frei zur Verfügung. Seit 2019 ist das Projekt Teil der Cloud Native Computing
Foundation (CNCF).

KubeVirt ermöglicht es, traditionelle VM-Workload auf derselben Infrastruktur zu betreiben wie Container-Workload.

### Unterschiede VMs und Container

Virtuelle Maschinen (VMs) und Container-Plattformen sind beides Technologien, die zur Isolation von Systemen oder
Anwendungen in einer IT-Infrastruktur eingesetzt werden.

{{< svg "assets/images/blog/kubevirt/vm-container-workload.svg" >}}

Sie unterscheiden sich aber in grundlegenden Punkten.

#### Virtuelle Maschinen

- Eine VM enthält ein komplettes Betriebssystem. Dieses wird oft als Guest OS bezeichnet. Weiter enthält eine VM alle benötigten Bibliotheken und Abhängigkeiten zum Betrieb einer Applikation.
- VMs benötigen zur Ausführung einen Hypervisor. Dieser ist für die Vermittlung und das Management der Hardware zuständig.
- Da jede VM ihr eigenes Betriebssystem hat, bieten VMs eine starke Isolation. Diese Isolation führt jedoch auch zu einem höheren Ressourcenverbrauch.
- Virtuelle Maschinen sind weniger portabel. Sie sind oft auf spezifische Hypervisors oder Infrastruktur angewiesen.

#### Container

- Container teilen das Host Betriebssystem (Kernel/Host OS) und benötigen kein eigenes Betriebssystem. Container enthalten so nur Bibliotheken und Abhängigkeiten zum Betrieb einer Applikation.
- Container sind leichtgewichtig und benötigen keinen Hypervisor
- Der Ressourcenverbrauch von Containern ist effizienter, da diese weniger isoliert sind und sich das Host Betriebssystem teilen. Sicherheitslücken im Kernel können alle Container auf einem Host betreffen.
- Container sind hochgradig portabel und können auf verschiedenen Plattformen betrieben werden. Die Voraussetzung ist jedoch eine vorhandene Container-Runtime.

### Wie funktioniert KubeVirt

KubeVirt erweitert Kubernetes mit zusätzlicher Funktionalität. Dazu werden neue Custom Resource Definitions (CRDs) zur
Verfügung gestellt, welche es erlauben, eine virtuelle Maschine deklarativ zu beschreiben.

KubeVirt setzt beim Betrieb von virtuellen Maschinen auf den bewährten Virtualisierungs-Layer KVM. Kernel-Based Virtual
Machines (KVM) ist eine Open-Source-Technologie, die sich im Linux-Kernel befindet. Dadurch kann Linux als vollständiges
Virtualisierungssystem verwendet werden. KVM wurde im Kernel 2.6.20 (2007) veröffentlicht und ist heutzutage die bewährte
Grundlage für viele Virtualisierungsplattformen. Virtualisierungen mit KVM verwenden oft weitere Technologien wie QEMU
und Libvirt, welche den Umgang mit virtuellen Maschinen vereinfachen.

{{< svg "assets/images/blog/kubevirt/kvm-vms.svg" >}}

KubeVirt macht sich den Fakt zu nutzen, dass virtuelle Maschinen mit KVM auf dem Host als reguläre Linux Prozesse
implementiert sind. Dadurch können diese mittels Linux Control Groups (cgroups) und Namespaces im Kernel analog zum
Container-Workload gekapselt und isoliert werden.

### KubeVirt Architektur

Neben neuen Kubernetes Custom Resource Definitions (CRDs) beinhaltet KubeVirt verschiedene Laufzeit-Komponenten.

{{< svg "assets/images/blog/kubevirt/kubevirt-architecture.svg" >}}

- **virt-controller**: Der virt-controller überwacht die erstellten und vorhandenen Virtual-Machine-Definitionen. Unter anderem sind dies die Custom Resources (CR) VirtualMachine und VirtualMachineInstance. Wir eine neue Definition einer virtuellen Maschine angelegt, erzeugt der virt-controller einen Pod für die Instanz und weis diese einem Node zu.
- **virt-api**: Stellt ein RESTful-API für alle Belangen rund um die Erstellung, Validierung und Verwaltung von virtuellen Maschinen zur Verfügung.
- **virt-handler**: Der virt-handler wird als DaemonSet auf jedem Kubernetes-Node ausgeführt. Er ist zuständig, um den Pod entsprechend der VM-Definition zu konfigurieren und den Zustand der VM gemäss Definition sicherzustellen. Wird eine Änderung erkannt, weist er den Container virt-handler an, die erforderlichen Aktionen auszuführen.
- **virt-launcher**: Container, welcher innerhalb des VM-Pods ausgeführt wird. Er ist zuständig, um die VM mit Hilfe einer lokalen Libvirtd-Instanz zu starten und zu überwachen.
- **libvirtd**: Stellt eine Low-Level-Virtualisierungsarchitektur und Schnittstelle zum Kernel zur Verfügung. Diese wird verwendet, um den Lifecycle des VM-Prozesses zu verwalten.

### Wofür kann KubeVirt verwendet werden?

Der Einsatz von virtuellen Maschinen ist heutzutage nicht mehr wegzudenken. KubeVirt kann für viele Anwendungsfälle
von virtuellen Maschinen eingesetzt werden.

Folgend ein paar Beispiele für den Einsatz von KubeVirt.

#### Vereinheitlichung der Infrastruktur

Oft werden technologisch komplett unterschiedliche Infrastrukturen für virtuelle Maschinen sowie Container-Workload
aufgebaut und betrieben. Durch die Verwendung von Kubernetes als Grundlage für VM- und Container-Workload kann das
Tooling wie zum Beispiel Log-Systeme, Überwachung und Alerting oder auch Storage Systeme und Netzwerke zusammengeführt
werden. Der Betrieb von zwei Infrastruktur-Stacks entfällt.

{{< svg "assets/images/blog/kubevirt/infrastructure-convergence.svg" >}}
<br /><br />

#### Vereinheitlichung des Workflows

Nicht weniger zentral als die Vereinheitlichung von Infrastruktur und Hardware-Komponenten ist der Einfluss auf der
Workflow-Ebene. Bekannte Tools und Workflows aus der Container-Welt können identisch auf virtuelle Maschinen angewandt
werden. Das Verwalten von virtuellen Maschinen ist deklarativ möglich und Infrastrukturen können mit GitOps definiert
werden. Ebenfalls können durch bestehendes Tooling virtuelle Maschinen einfacher in Pipelines und Workflows eingebunden
werden.

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachineInstance
metadata:
  name: demo
spec:
  domain:
    cpu:
      cores: 1
    devices:
      disk: fedora-cloud-40
```

#### Application Migration

Werden Monolithen in Container-Architekturen überführt, ist während der Migration oft ein Parallelbetrieb nötig. Werden
virtuelle Maschinen auf Container-Plattformen überführt, kann während der Transition bereits ein einheitlicher Stack
verwendet werden. Eine Ablösung einer VM ist dabei gar nicht zwingend nötig. Mit dem einheitlichen Stack können
Applikationen bestehend aus VMs und Container besser und einfacher integriert werden.

{{< svg "assets/images/blog/kubevirt/application-migration.svg" >}}
<br /><br />

#### Verwendung und direkter Zugriff auf dedizierte Hardware

Normaler Container-Workload ermöglicht es nicht, spezielle Hardware einzubinden. Virtuelle Maschinen haben diese
Fähigkeit. Mittels KubeVirt können virtuelle Maschinen ebenfalls direkten Zugriff auf Geräte des Host-Systems erlangen.
Beispiele sind hier direkte Netzwerkkarten oder die Verwendung von Grafikkarten in VMs. Nvidia ist ein grosser Treiber
des KubeVirt Projektes und verwendet KubeVirt für das Nvidia GeForce Now.

#### Kubernetes-as-a-Service (KaaS)

Das Konzept Kubernetes auf Kubernetes bietet interessante Anwendungsfälle. Insbesondere in Szenarien, in denen
Multi-Tenancy und Isolation eine grosse Rolle spielen. So kann zum Beispiel ein Anbieter isolierte Kubernetes-Tenants
anbieten, welche auf virtuellen KubeVirt Maschinen auf Kubernetes basieren. Diese Kubernetes-Tenants können bei Bedarf
skaliert und durch weitere virtuelle Maschinen erweitert werden.

#### Kein Vendor-Lock-In

Das KubeVirt-Projekt is Open-Source und wird von mehreren grossen Firmen wie zum Beispiel Red Hat, Nvidia oder
Cloudflare konstant weiterentwickelt. Die KubeVirt-Community wächst derzeit rasant. Kommt der Einsatz von
Community-Supported Software nicht infrage, kann zum Beispiel Red Hat OpenShift Virtualization welches auf KubeVirt
basiert eingesetzt werden. Für OpenShift Virtualization ist wiederum kommerziellen Enterprise-Grade Support von Red Hat
vorhanden.

### Zusammenfassung

KubeVirt ist eine interessante Alternative zu den bestehenden Virtualisierungslösungen. Dabei ist nicht primär der
eins-zu-eins Ersatz von Virtualisierungslösungen der Fokus, sondern auch die Transition des VM-Workloads in ein modernes
Umfeld, welches mit denselben Tools und Workflows der Container-Welt gemanagt werden kann. Der freie Zugang zum
Open-Source-Projekt und die grosse Community helfen ein Vendor-Lock-In zu umgehen.
