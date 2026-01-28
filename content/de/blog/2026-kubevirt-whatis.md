---
title: "Was ist KubeVirt? Betreiben von virtuelle Maschinen auf Kubernetes wie Container"
slug: "kubevirt-whatis"
description: ""
date: 2026-01-26T00:00:00+00:00
lastmod: 2026-01-26T00:00:00+00:00
draft: false
images: ["images/blog/kubevirt/tk-blogpost-kubevirt_share-image.jpg"]
img_border: true
Sitemap:
Priority: 0.9

additionalblogposts: [ 'kubevirt-introduction', 'kubevirt-training', 'kubevirt-usecases']

categories: ["Technology", "KubeVirt", "Kubernetes"]
authors: ['christof-luethi']
post_img: "images/blog/kubevirt/tk-blogpost-kubevirt.jpg"
lead: "Das Ausführen von Containern auf Kubernetes ist heute der Standard – dennoch sind viele Organisationen weiterhin auf geschäftskritische Workloads angewiesen, die in virtuellen Maschinen laufen. Diese neu zu schreiben oder zu ersetzen, ist nicht immer realistisch. KubeVirt schliesst diese Lücke, indem es Kubernetes erweitert und ermöglicht, virtuelle Maschinen genauso wie Container zu betreiben und zu verwalten – mit denselben APIs, Tools und Automatisierungen, die bereits im Einsatz sind."
---

### Was ist KubeVirt

KubeVirt wurde 2016 von Red Hat initiiert und ist seit 2017 als Open-Source-Software verfügbar. Das Projekt ist Teil der Cloud Native Computing Foundation (CNCF) und erreichte im April 2022 den Incubating Status.

KubeVirt ist eine Kubernetes-Erweiterung, die auf dem Operator-Pattern basiert. Dadurch können virtuelle Maschinen (VMs) direkt neben Containern betrieben und verwaltet werden – mit denselben APIs, Tools und Workflows.

### Warum KubeVirt existiert

Kubernetes hat die Art und Weise revolutioniert, wie containerisierte Anwendungen bereitgestellt und verwaltet werden. Doch was ist mit Workloads, die weiterhin als virtuelle Maschinen laufen und sich nicht einfach containerisieren lassen? Diese neu zu schreiben oder zu überarbeiten ist oft komplex, teuer oder sogar beinahe unmöglich. Genau hier kommt KubeVirt ins Spiel.

KubeVirt ermöglicht es:

- Virtuelle Maschinen innerhalb von Kubernetes auszuführen – genau wie Pods.
- Dieselben Kubernetes-Tools zu verwenden – kubectl, Helm, ArgoCD usw.
- Dieselben Cloud-Native-Workflows zu nutzen – GitOps, Pipelines.
- Container und virtuelle Maschinen über eine einzige Control Plane zu verwalten.

Bei KubeVirt geht es nicht darum, virtuelle Maschinen zu ersetzen – sondern darum, die Art und Weise zu vereinheitlichen, wie sie erstellt und betrieben werden.

### Kernkonzepte

{{< csvtable "responsive" "," >}}
KubeVirt Ressource / Tool,Beschreibung,Kubernetes Analogie
VirtualMachine (VM),Definiert die Konfiguration und den Lebenszyklus einer virtuellen Maschine,Deployment
VirtualMachineInstance (VMI),Eine laufende Instanz einer virtuellen Maschine; wird erstellt, wenn eine VirtualMachine gestartet wird,Pod
VirtualMachineInstanceReplicaSet (VMIRS),Stellt eine gewünschte Anzahl von VM-Instanzen sicher (ähnlich wie beim Skalieren eines zustandslosen VM-Workloads),ReplicaSet
DataVolume (DV),Verwaltet Festplatten-Images – unterstützt durch den Containerized Data Importer (CDI),PersistentVolumeClaim
PersistentVolumeClaim (PVC),Fordert Speicherplatz für VM-Festplatten an (Block- oder File),PersistentVolumeClaim
VirtualMachineSnapshot,Erfasst den Zustand einer VM und ihrer Festplatten für Backup oder Wiederherstellung,VolumeSnapshot
virtctl CLI,Kommandozeilen-Tool zur Verwaltung von VMs,kubectl for VMs
KubeVirt Operator (CR),Verwaltet den Lebenszyklus der KubeVirt-Komponenten im Cluster,Operator
{{< /csvtable >}}

### Wie dies funktioniert

Unter der Haube:

- KubeVirt nutzt den Linux KVM Hypervisor (Kernel-Based Virtual Machines).
- KVM-virtuelle Maschinen sind normale Linux-Prozesse.
- KubeVirt/Kubernetes isoliert diese Prozesse mit Linux-Kernel-Funktionen wie Control Groups (cgroups) und Kernel Namespaces – genau wie bei jedem anderen containerisierten Prozess.
- Jeder KVM-Prozess läuft in einem Pod gekapselt. Kubernetes weiss nichts über VMs – es gibt nur Pods und Container.
- Der Kubernetes Scheduler entscheidet, auf welchem Node der VM-Pod ausgeführt wird.
- KubeVirt verwendet ein DaemonSet, um den VM-Pod vorzubereiten (Netzwerk, Geräte, …).
- VM-Pods führen Tools aus, um mit dem KVM-Hypervisor (QEMU, libvirt) zu kommunizieren und die virtuelle Maschine innerhalb des VM-Pods zu starten.
- Netzwerk und Speicher nutzen die gleichen CNI- und CSI-Plugins wie in Kubernetes.

### Starte deine erste VM

Als Voraussetzung, um virtuelle Maschinen auf deinem Kubernetes-Cluster zu starten, muss der KubeVirt-Operator installiert und laufend sein. Den Operator kannst du installieren mit:

```shell
export V=$(curl -s https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
kubectl create -f "https://github.com/kubevirt/kubevirt/releases/download/${V}/kubevirt-operator.yaml"
kubectl create -f "https://github.com/kubevirt/kubevirt/releases/download/${V}/kubevirt-cr.yaml"
```

Um mit der virtuellen Maschine zu interagieren, kann das Tool `virtctl` verwendet werden. Du kannst `virtctl` von der [github releases](https://github.com/kubevirt/kubevirt/releases/) Seite herunterladen oder direkt in deiner Shell:

```shell
ARCH=$(uname -s | tr A-Z a-z)-$(uname -m | sed 's/x86_64/amd64/') || windows-amd64.exe
curl -L -o virtctl https://github.com/kubevirt/kubevirt/releases/download/${V}/virtctl-${V}-${ARCH}
chmod +x virtctl
```

Jetzt ist es an der Zeit, die erste VM zu starten. Erstelle eine Datei mit dem Namen `vm-cirros.yaml` und dem folgenden Inhalt:

```yaml
kind: VirtualMachine
metadata:
  name: vm-cirros
spec:
  runStrategy: Always
  template:
    metadata:
      labels:
        kubevirt.io/size: small
        kubevirt.io/domain: vm-cirros
    spec:
      domain:
        devices:
          disks:
            - name: containerdisk
              disk:
                bus: virtio
          interfaces:
            - name: default
              masquerade: {}
        resources:
          requests:
            memory: 64M
      networks:
        - name: default
          pod: {}
      volumes:
        - name: containerdisk
          containerDisk:
            image: quay.io/kubevirt/cirros-container-disk-demo
```

Verwende folgenden Befehl, um die neue VirtualMachine-Ressource in deinem Kubernetes-Cluster zu erstellen:

```shell
kubectl apply -f vm-cirros.yaml
```

Damit wird die virtuelle Maschinen-Ressource im Cluster erstellt. Da wir die `runStrategy` auf `Always` gesetzt haben, stellt KubeVirt sicher, dass die VM stets läuft. Es ist daher zu erwarten, dass der KubeVirt-Operator die Ressource automatisch übernimmt und eine laufende VM-Instanz erstellt. Ein Pod, der eine virtuelle Maschine kapselt, trägt immer den Namen `virt-launcher-<vm-name>-*`.

```shell
kubectl get pods
NAME                          READY   STATUS    RESTARTS   AGE
virt-launcher-vm-cirros-k9dlb   3/3     Running   0          10m
...
```

Du kannst den `virtctl`-Befehl verwenden, um den Zustand deiner VM zu verwalten (starten, stoppen, ...) sowie um auf die Konsole zuzugreifen oder per SSH bzw. VNC mit deiner VM zu verbinden:

```shell
virtctl console vm-cirros
login as 'cirros' user. default password: 'gocubsgo'. use 'sudo' for root.
cirros login:
```

Herzlichen Glückwunsch! Du hast erfolgreich deine erste virtuelle Maschine auf Kubernetes gestartet.

### Wann KubeVirt eingesetzt werden sollte

Use KubeVirt when you:

- **Haben Legacy- oder von Drittanbietern bereitgestellte Anwendungen, die nicht containerisiert werden können:** Führen Sie diese als VMs innerhalb Ihrer Kubernetes-Plattform aus, zusammen mit modernen containerisierten Diensten.
- **Bauen eine einheitliche Plattform für VMs und Container auf:** Eine Control Plane (Kubernetes) für Netzwerk, Speicher, Monitoring und Automatisierung.
- **Möchten schrittweise modernisieren:** Zuerst Workloads als VMs "lift-and-shift" migrieren, dann nach eigenem Tempo in Container refaktorieren.
- **Benötigen konsistente CI/CD- oder GitOps-Prozesse für alles:** VM-Definitionen in Git verwalten und mit ArgoCD deployen, genau wie Container.
- **Führen temporäre oder Test-VMs in Kubernetes-Clustern aus:** Ideal für Entwicklung, Integrationstests oder kurzlebige Sandbox-Umgebungen.
- und vieles mehr

### Warum KubeVirt wichtig ist

KubeVirt ist wichtig, weil es die Verwaltung von virtuellen Maschinen und Containern unter einer einzigen Kubernetes-Control-Plane vereinheitlicht. Dadurch können Teams in ihrem eigenen Tempo modernisieren – bestehende Anwendungen als VMs betreiben, während neue Services als Container entwickelt werden. Indem VMs als native Kubernetes-Ressourcen behandelt werden, ermöglicht KubeVirt konsistente Automatisierung, Observability und GitOps-Workflows über alle Workloads hinweg. Es macht parallele Infrastrukturen überflüssig, reduziert die operative Komplexität und schliesst die Lücke zwischen traditioneller Virtualisierung und Cloud-Native-Computing.
