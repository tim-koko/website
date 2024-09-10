---
title: "KubeVirt Journey - Einführung in die Verwaltung von virtueller Maschinen in Kubernetes"
slug: "kubevirt-introduction"
description: ""
date: 2024-09-09T00:00:00+00:00
lastmod: 2024-09-09T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt/tk-blogpost-kubevirt_share-image.jpg"]
img_border: true
Sitemap:
Priority: 0.9

categories: ["Technologie", "KubeVirt", "Kubernetes"]
post_img: "images/blog/kubevirt/tk-blogpost-kubevirt.jpg"
lead: "KubeVirt ist ein Projekt, welches die Verwendung von virtuellen Maschinen auf Container Plattformen wie Kubernetes möglich macht. "
---

### Was ist KubeVirt

KubeVirt ist eine Kubernetes-Erweiterung nach dem Operator Pattern. KubeVirt wurde im Jahre 2016 von Red Hat initiiert und
steht seit 2017 als Open-Source-Software frei zur Verfügung. Seit 2019 ist das Projekt Teil der Cloud Native Computing
Foundation (CNCF).

KubeVirt ermöglicht es, traditionelle VM-Workload auf derselben Infrastruktur zu betreiben wie Container-Workload.

### Unterschiede virtuelle Maschinen und Container

Virtuelle Maschinen (VMs) und Container sind beides Technologien, die zur Isolation von Systemen oder
Anwendungen in einer IT-Infrastruktur eingesetzt werden. Sie unterscheiden sich aber in grundlegenden Aspekten.

{{< svg "assets/images/blog/kubevirt/vm-container-workload.svg" >}}

#### Virtuelle Maschinen

- Eine VM enthält ein komplettes Betriebssystem. Dieses wird oft als Guest OS bezeichnet. Weiter enthält eine VM alle benötigten Bibliotheken und Abhängigkeiten zum Betrieb einer Applikation.
- VMs benötigen zur Ausführung einen Hypervisor. Dieser ist für die Vermittlung und das Management der Hardware zuständig.
- Da jede VM ihr eigenes Betriebssystem hat, bieten VMs eine starke Isolation. Diese Isolation führt jedoch auch zu einem höheren Ressourcenverbrauch.
- Virtuelle Maschinen sind weniger portabel. Sie sind oft auf spezifische Hypervisors oder Infrastruktur angewiesen.

#### Container

- Container teilen das Host-Betriebssystem (Kernel) und benötigen daher kein eigenes Betriebssystem. Container enthalten so nur Bibliotheken und Abhängigkeiten die zum Betrieb einer Applikation nötig sind.
- Container sind leichtgewichtig und benötigen keinen Hypervisor.
- Der Ressourcenverbrauch von Containern ist effizienter, da diese weniger isoliert sind und sich das Host-Betriebssystem teilen. Sicherheitslücken im Kernel können aber alle Container auf einem Host betreffen.
- Container sind hochgradig portabel und können auf verschiedenen Plattformen betrieben werden. Die Voraussetzung ist jedoch eine vorhandene Container-Runtime.

### Wie funktioniert KubeVirt

KubeVirt ist ein Kubernetes Operator und erweitert Kubernetes mit zusätzlicher Funktionalität. Dazu werden neue Custom Resource Definitions (CRDs) zur
Verfügung gestellt, welche es erlauben, eine virtuelle Maschine als Custom Resources (CR) deklarativ zu beschreiben.

{{< svg "assets/images/blog/kubevirt/operator.svg" >}}
<br /><br />

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

#### virt-controller

Der virt-controller überwacht die erstellten und vorhandenen Virtual-Machine-Definitionen. Unter anderem sind dies die
Custom Resources (CR) VirtualMachine und VirtualMachineInstance. Wird eine neue Definition einer virtuellen Maschine
angelegt, erzeugt der virt-controller einen Pod für die Instanz und weist diese einem Node zu.

#### virt-api

Das virt-api stellt ein RESTful-API für alle Belangen rund um die Erstellung, Validierung und Verwaltung von virtuellen
Maschinen zur Verfügung.

#### virt-handler

Der virt-handler wird als DaemonSet auf jedem Kubernetes-Node ausgeführt. Er ist zuständig, um den Pod entsprechend der
VM-Definition zu konfigurieren und den Zustand der VM gemäss der Definition sicherzustellen. Wird eine Änderung erkannt,
weist er den Container virt-handler an, die erforderlichen Aktionen auszuführen.

#### virt-launcher

Der virt-launcher ist ein Container, welcher innerhalb des VM-Pods ausgeführt wird. Er ist zuständig, um die VM mithilfe einer lokalen Libvirtd-Instanz zu starten und zu überwachen.

#### libvirtd

Libvirt stellt eine Low-Level-Virtualisierungsarchitektur und Schnittstelle zum Kernel zur Verfügung. Diese wird verwendet, um den Lifecycle des VM-Prozesses zu verwalten.

### Wofür kann KubeVirt verwendet werden?

Der Einsatz von virtuellen Maschinen ist heutzutage nicht mehr wegzudenken. KubeVirt kann für viele Anwendungsfälle
von virtuellen Maschinen eingesetzt werden.

Folgend ein paar Beispiele für den Einsatz von KubeVirt, welche wir in einem weiteren Blogpost genauer erläutern.

- Vereinheitlichung der technischen Infrastruktur
- Vereinheitlichung des Workflows mit einheitlichen Pipelines und Tooling während der Entwicklung
- Parallelbetrieb von VM-Workload und Container-Workload für Legacy- oder während der Migration von Applikationen zu Containern
- Verwendung und direkter Zugriff von dedizierter Hardware wie zum Beispiel Grafikkarten oder Netzwerkinterfaces
- Kubernetes-as-a-Service (KaaS)
- Kein Vendor-Lock-In und keine Lizenzkosten

### Enterprise Solution: Red Hat OpenShift Virtualization

Das KubeVirt Projekt wurde von Red Hat initiiert und wird auch immer noch stark von Red Hat weiterentwickelt. Red Hat
bietet diese Technologie unter dem Namen Red Hat OpenShift Virtualization an und ist Teil des Produktes Red Hat OpenShift.
So kann abhängig vom Use Case einerseits die Community-Supported Variante KubeVirt oder das kommerzielle Produkt mit
Enterprise-Grade Support von Red Hat verwendet werden.

{{< custom-image "../images/redhat.png" "250" >}}
<br /><br />

### Zusammenfassung

KubeVirt ist eine interessante Alternative zu den bestehenden Virtualisierungslösungen. Dabei steht nicht nur primär der
eins zu eins Ersatz von Virtualisierungslösungen im Fokus, sondern auch die Transition von VM-Workload in ein modernes
Umfeld, welches mit denselben Tools und Workflows der Container-Welt verwaltet werden kann. Der freie Zugang zum
Open-Source-Projekt und die grosse Community helfen ein Vendor-Lock-In zu umgehen. Wo dies benötigt wird, steht mit
Red Hat OpenShift Virtualization dennoch eine Lösung und ein starker Partner für Enterprise-Kunden zur Verfügung.
