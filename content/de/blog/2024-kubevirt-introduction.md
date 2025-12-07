---
title: "KubeVirt Journey - Einführung in die Verwaltung von virtuellen Maschinen in Kubernetes"
slug: "kubevirt-introduction"
description: "Einführung in KubeVirt: Betreibe VMs direkt auf Kubernetes. Lerne die Architektur & Konzepte kennen und verbinde klassische IT mit Cloud Native."
date: 2024-09-09T00:00:00+00:00
lastmod: 2024-09-09T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt/tk-blogpost-kubevirt_share-image.jpg"]
img_border: true
Sitemap:
  Priority: 0.9

additionalblogposts: [ 'kubevirt-training', 'kubevirt-usecases']

categories: ["Technologie", "KubeVirt", "Kubernetes"]
authors: ['christof-luethi']
post_img: "images/blog/kubevirt/tk-blogpost-kubevirt.jpg"
lead: "KubeVirt ist ein Projekt, welches die Verwendung von virtuellen Maschinen auf Container Plattformen wie Kubernetes möglich macht. "
---

### Was ist KubeVirt

KubeVirt ist eine Technologie die es ermöglicht, traditionelle VM-Workload auf derselben Infrastruktur zu betreiben wie
Container-Workload. Wir sind davon überzeugt, dass Container die traditionelle VM-Workload nicht gänzlich ersetzen
wird. Daher haben wir uns intensiv mit der Technologie auseinandergesetzt und untersucht, inwiefern dadurch
bestehende Virtualisierungslösungen ersetzt werden können. In der Blogpost-Reihe KubeVirt werden wir auf die
unterschiedlichsten Aspekte von KubeVirt eingehen.

KubeVirt ist eine Kubernetes-Erweiterung nach dem Operator Pattern. KubeVirt wurde im Jahre 2016 von Red Hat initiiert und
steht seit 2017 als Open-Source-Software frei zur Verfügung. Seit 2019 ist das Projekt Teil der Cloud Native Computing
Foundation (CNCF).

### Unterschiede virtuelle Maschinen und Container

Virtuelle Maschinen (VMs) und Container sind beides Technologien, die zur Isolation von Systemen oder
Anwendungen in einer IT-Infrastruktur eingesetzt werden. Sie unterscheiden sich aber in grundlegenden Aspekten.

{{< svg "assets/images/blog/kubevirt/vm-container-workload.svg" >}}

#### Virtuelle Maschinen

- Eine VM enthält ein komplettes Betriebssystem, welches oft als Guest OS bezeichnet wird. Weiter enthält eine VM alle benötigten Bibliotheken und Abhängigkeiten zum Betrieb einer Applikation.
- VMs benötigen zur Ausführung einen Hypervisor. Dieser ist für die Vermittlung und das Management der Hardware zuständig.
- Da jede VM ihr eigenes Betriebssystem hat, bieten VMs eine starke Isolation. Diese Isolation führt jedoch auch zu einem höheren Ressourcenverbrauch und längerer Startup-Zeit.
- Virtuelle Maschinen sind weniger portabel. Sie sind oft auf spezifische Hypervisors oder Infrastruktur angewiesen. Ein Wechsel der Infrastruktur oder der eingesetzten Virtualisierungslösung ist daher aufwändiger.

#### Container-Workload

- Container teilen das Host-Betriebssystem (Kernel) und benötigen daher kein eigenes Betriebssystem. Container enthalten so nur Bibliotheken und Abhängigkeiten, die zum Betrieb einer Applikation nötig sind.
- Container sind leichtgewichtig und benötigen keinen Hypervisor.
- Container sind weniger isoliert da sie sich das Host-Betriebssystem teilen. Sicherheitslücken im Kernel können daher alle Container auf einem Host betreffen. Da Container nicht ihr eigenes Betriebssystem starten, wird der Ressourcenverbrauch und die Startup-Zeit reduziert.
- Container sind hochgradig portabel und können auf verschiedenen Plattformen betrieben werden. Ist eine Container-Runtime vorhanden, kann die unterliegende Infrastruktur einfach ersetzt werden.

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

KubeVirt macht sich den Fakt zu nutzen, dass virtuelle Maschinen mit KVM auf dem Host als reguläre Linux-Prozesse
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

Das virt-api stellt ein RESTful-API für alle Belange rund um die Erstellung, Validierung und Verwaltung von virtuellen
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
Umfeld, welches mit denselben Tools und Workflows der Container-Welt verwaltet werden kann. Durch die Vereinheitlichung der
Betriebsinfrastruktur und die konsolidierung von Workflows hilft KubeVirt operative Kosten zu senken und die komplexität der
System- und Produktlandschaft zu reduzieren. Der freie Zugang zum Open-Source-Projekt und die grosse Community helfen, ein
Vendor-Lock-In zu umgehen. Wo dies benötigt wird, steht mit Red Hat OpenShift Virtualization dennoch eine Lösung und ein
starker Partner für Enterprise-Kunden zur Verfügung.

### Möchtest Du mehr erfahren?

Gerne stehen wir für Fragen zur Verfügung. Du erreichst uns am besten unter [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch)&nbsp;oder auf [LinkedIn](https://www.linkedin.com/company/tim-koko).

Weiter bieten wir dir die folgenden Möglichkeiten, dich vertieft mit dem Thema KubeVirt oder OpenShift Virtualization auseinander zu setzen:

- [tim&koko labs](https://tim-koko.ch/labs/): An einem Nachmittag die Grundlagen von KubeVirt kennenlernen und in praktischen hands-on labs direkt anwenden.
- [KubeVirt Basics Training](https://acend.ch/trainings/kubevirt/): Zweitägiges abwechslungsreiches Training mit Präsentationen und hands-on labs.
- [OpenShift Virtualization Accelerator Package](https://tim-koko.ch/services/openshift-virtualization-accelerator/): Wir helfen dir, die Möglichkeiten von OpenShift Virtualization zu erkunden und herauszufinden, wie hoch das Potenzial für eine neue oder parallele Strategie sein
  könnte.
