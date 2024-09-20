---
title: "DRAFT KubeVirt Journey - Anwendungsfälle von KubeVirt"
slug: "kubevirt-usecases"
description: ""
date: 2024-09-20T00:00:00+00:00
lastmod: 2024-09-20T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt/tk-blogpost-kubevirt_share-image.jpg"]
img_border: true
Sitemap:
Priority: 0.9

categories: ["Technologie", "KubeVirt", "Kubernetes"]
post_img: "images/blog/kubevirt/tk-blogpost-kubevirt.jpg"
lead: "Der Einsatz von virtuellen Maschinen ist heutzutage nicht mehr wegzudenken. Neben dem Ersatz von bestehenden Virtualisierungslösungen bietet KubeVirt auch weiteres Potential um Infrastrukturen zu vereinheitlichen oder Workflows zu modernisieren."
---


Folgend ein paar Beispiele für den Einsatz von KubeVirt.

### Vereinheitlichung der Infrastruktur

Oft werden technologisch komplett unterschiedliche Infrastrukturen für virtuelle Maschinen sowie Container-Workload
aufgebaut und betrieben. Durch die Verwendung von Kubernetes als Grundlage für VM- und Container-Workload kann das
Tooling wie zum Beispiel Log-Systeme, Überwachung und Alerting oder auch Storage Systeme und Netzwerke zusammengeführt
werden. Der Betrieb von zwei Infrastruktur-Stacks entfällt.

{{< svg "assets/images/blog/kubevirt/infrastructure-convergence.svg" >}}
<br /><br />

### Vereinheitlichung des Workflows

Nicht weniger zentral als die Vereinheitlichung von Infrastruktur und Hardware-Komponenten ist der Einfluss auf der
Workflow-Ebene. Bekannte Tools und Workflows aus der Container-Welt können identisch auf virtuelle Maschinen angewandt
werden. Das Verwalten von virtuellen Maschinen ist deklarativ möglich und Infrastrukturen können mit GitOps definiert
werden. Ebenfalls können durch bestehendes Tooling virtuelle Maschinen einfacher in Pipelines und Workflows eingebunden
werden.

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: fedora-nginx-vm
spec:
  running: true
  template:
    metadata:
      labels:
        kubevirt.io/domain: fedora-nginx-vm
    spec:
      domain:
        devices:
          disks:
            - name: fedora-disk
              disk:
                bus: virtio
            - name: cloudinitdisk
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
        - name: cloudinitdisk
          cloudInitNoCloud:
            userData: |
              #cloud-config
              packages:
                - nginx
              runcmd:
                - systemctl start nginx
```

### Application Migration

Werden Monolithen in Container-Architekturen überführt, ist während der Migration oft ein Parallelbetrieb nötig. Werden
virtuelle Maschinen auf Container-Plattformen überführt, kann während der Transition bereits ein einheitlicher Stack
verwendet werden. Eine Ablösung einer VM ist dabei gar nicht zwingend nötig. Mit dem einheitlichen Stack können
Applikationen bestehend aus VMs und Container besser und einfacher integriert werden.

{{< svg "assets/images/blog/kubevirt/application-migration.svg" >}}
<br /><br />

### Verwendung und direkter Zugriff auf dedizierte Hardware

Normaler Container-Workload ermöglicht es nicht, spezielle Hardware einzubinden. Virtuelle Maschinen haben diese
Fähigkeit. Mittels KubeVirt können virtuelle Maschinen ebenfalls direkten Zugriff auf Geräte des Host-Systems erlangen.
Beispiele sind hier direkte Netzwerkkarten oder die Verwendung von Grafikkarten in VMs. Nvidia ist ein grosser Treiber
des KubeVirt Projektes und verwendet KubeVirt für das Nvidia GeForce Now.

### Kubernetes-as-a-Service (KaaS)

Das Konzept Kubernetes auf Kubernetes bietet interessante Anwendungsfälle. Insbesondere in Szenarien, in denen
Multi-Tenancy und Isolation eine grosse Rolle spielen. So kann zum Beispiel ein Anbieter isolierte Kubernetes-Tenants
anbieten, welche auf virtuellen KubeVirt Maschinen auf Kubernetes basieren. Diese Kubernetes-Tenants können bei Bedarf
skaliert und durch weitere virtuelle Maschinen erweitert werden.

### Kein Vendor-Lock-In

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
