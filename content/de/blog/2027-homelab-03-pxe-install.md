---
title: "Home Lab #3: Talos per PXE und der Stromtrenn-Test"
slug: "homelab-pxe-talos-install"
description: "Talos Linux per PXE auf Bare Metal installieren, ohne Monitor: Netzwerk-Boot debuggen mit tcpdump, Hardware-Check und warum der Stromtrenn-Test dazugehört."
date: 2027-02-16T00:00:00+00:00
lastmod: 2027-02-16T00:00:00+00:00
draft: false
images: ["images/blog/homelab/homelab-03-1200x630.jpg"]
img_border: false
Sitemap:
  Priority: 0.9

additionalblogposts: ['homelab-remote-management', 'homelab-hardware-bios']

categories: ["Technologie", "Kubernetes", "Talos"]
authors: ['thomas-philipona']
post_img: "images/blog/homelab/homelab-03-1500x1000.jpg"
lead: "Hardware vorbereitet, Remote-Management eingerichtet, jetzt kommt Talos auf die Nodes. Ohne Monitor, per Netzwerk-Boot. Unterwegs gab es eine leere Knopfzelle, eine Firmware, die nicht zuhören wollte, und fünf Nodes, die nicht alle gleichzeitig mitspielten."
---

Im [zweiten Teil]({{< relref "/blog/2027-homelab-02-remote-management.md" >}}) habe ich das Remote-Management eingerichtet: kein KVM, aber Ein- und Ausschalten, Reset und Boot-Optionen über das Netzwerk. Genau das reicht, um Talos zu installieren, ohne einen Monitor anzuschliessen. Bis der Cluster lief, gab es aber noch ein paar Überraschungen.

### Der Plan: Einmal per PXE, danach von der SSD

Intel Standard Manageability kann einen Node **einmalig per PXE starten**. In MeshCommander heisst das *Power Actions → Reset to PXE*. Der Ablauf sieht so aus:

1. Auf meinem Arbeits-PC läuft Sidero Booter. Er liefert alles, was ein Netzwerk-Boot braucht.
2. In MeshCommander löse ich pro Node „Reset to PXE“ aus.
3. Talos startet im RAM im Maintenance-Mode. Mit `talosctl apply-config` bekommt der Node seine Konfiguration und installiert sich auf die NVMe.
4. Beim nächsten Start bootet der Node von der SSD, weil sie in der Boot-Reihenfolge ohnehin vorne steht.

Die Boot-Reihenfolge muss ich so nie umstellen. Stünde PXE dauerhaft vorne, würde jeder Reboot zuerst auf das Netzwerk warten, und ein Node würde ins Netz booten, sobald irgendwo Booter läuft. Wichtig ist nur, dass PXE überhaupt in der Liste steht. Im Auslieferungszustand war das nicht der Fall:

{{< custom-image "../images/homelab/px-02-boot-order.jpg" "" "Lenovo BIOS, Primary Boot Sequence im Auslieferungszustand: Die SSD steht vorne, PXE IPv4 und IPv6 stehen unter Excluded from boot order" >}}

### Der Stromtrenn-Test: Ein Node vergisst seine Konfiguration

Bevor es an die Installation ging, hatte ich ein Sorgenkind: k8s-cp-03. Ab und zu antwortete das Remote-Management nicht mehr. Nach einer neuen Konfiguration ging es wieder, ein paar Tage später war es wieder weg. Im MEBx stand dann: Werkszustand, Passwort wieder `admin`.

Klarheit brachte ein gezielter Test: Node eine Minute vom Strom nehmen und wieder anschliessen.

* **Startet der Node von selbst?** Ja, „After Power Loss: Power On“ funktioniert.
* **Sind die BIOS-Einstellungen noch da?** Ja.
* **Ist die MEBx-Konfiguration noch da?** Nein. Das Remote-Management antwortet nicht mehr.

Zuerst dachte ich, mit einer leeren CMOS-Batterie müssten auch die BIOS-Einstellungen verloren gehen. Bei einem UEFI-BIOS liegen sie aber im Flash und überleben einen Stromausfall auch ohne Batterie. An der Knopfzelle (CR2032) hängt die Uhr, und Intel-Plattformen können die ME-Konfiguration zurücksetzen, wenn die Uhr ihren Strom verliert. Das passte genau zum Bild: BIOS unverändert, MEBx im Werkszustand.

Also habe ich die CR2032 getauscht, MEBx neu eingerichtet und den Test wiederholt. Diesmal war das Remote-Management gut eine Minute nach dem Wiederanschliessen erreichbar, mit intakter Konfiguration. Die Geräte sind rund sieben Jahre alt, deshalb habe ich den Test bei allen anderen Nodes auch gemacht.

Ohne diesen Test wäre der Fehler erst beim ersten echten Stromausfall aufgefallen, und dann vielleicht auf allen Nodes gleichzeitig. Seither gehört der Stromtrenn-Test zur Abnahme jedes Nodes.

### PXE-Boot: Booter antwortet, die Firmware hört nicht zu

Dann der erste Versuch: Booter gestartet, bei k8s-cp-01 „Reset to PXE“ ausgelöst. Im Booter-Log stand brav `offering boot response`. Der Node startete trotzdem nach einer halben Minute wieder Windows.

Statt zu raten, habe ich mitgeschnitten:

```bash
sudo tcpdump -ni enp0s3 -e -vv 'port 67 or port 68 or port 4011'
```

Der Mitschnitt zeigte drei Dinge:

1. Der Node schickt ein DHCP-`Discover` mit `PXEClient:Arch:00007`, also UEFI x64.
2. Der Router **und** Booter antworten innerhalb von Millisekunden.
3. Der Node schickt nie ein `Request`. Er wiederholt sein `Discover` nach 4, 8 und 16 Sekunden und gibt dann auf.

Die Antworten kommen also an, aber die Firmware verwirft die von Booter. Mein erster Verdacht waren falsche Prüfsummen, weil `tcpdump` bei Booters Paketen `bad udp cksum` meldete. Die Prüfsummen-Berechnung in der VM abzuschalten, änderte aber nichts. Diese Meldung sieht man bei ausgehenden Paketen ohnehin oft, auch wenn alles in Ordnung ist.

Im Booter-Projekt gibt es ein offenes [Issue](https://github.com/siderolabs/booter/issues/10) mit genau diesem Bild auf anderer UEFI-Hardware, bisher ohne Lösung. Im Mitschnitt fiel mir auf, dass Booters Antwort keine Server-ID enthält (DHCP-Option 54). Bewiesen ist das als Ursache allerdings nicht.

Die Lösung war am Ende der Klassiker: Den DHCP-Proxy von Booter abschalten und durch **dnsmasq** ersetzen. Booter liefert weiterhin TFTP und HTTP. Damit klappte es auf Anhieb. So sieht der Netzwerk-Boot jetzt aus:

```text
1. MeshCommander → ISM: "Reset to PXE"
2. Firmware → Broadcast: DHCP-Discover mit "PXEClient"
3. Router → IP-Adresse | dnsmasq → "snp.efi auf dem Arbeits-PC"
4. Firmware → Booter (TFTP): snp.efi (iPXE mit eingebautem Skript)
5. iPXE → Router: eigene IP-Adresse
6. iPXE → Booter (HTTP): /ipxe/boot.ipxe
7. iPXE → Image Factory: Talos-Kernel und Initramfs
8. Talos läuft im RAM im Maintenance-Mode
```

Eine Irritation unterwegs: Im Booter-Log stand beim ersten TFTP-Versuch `User aborted the transfer`. Das sieht nach einem Fehler aus, ist aber normal. Die UEFI-Firmware fragt zuerst nur die Dateigrösse ab, bricht ab und lädt die Datei kurz danach richtig.

### Erst schauen, dann installieren

Bis hierhin ist nichts auf die Disk geschrieben. Talos läuft nur im RAM, und das ist der perfekte Moment für einen Hardware-Check. Im Maintenance-Mode gibt es noch keine Zertifikate, deshalb laufen die Befehle mit `--insecure`:

```bash
talosctl version --insecure -n <node-ip>     # antwortet Talos?
talosctl get disks --insecure -n <node-ip>   # Install-Disk
talosctl get links --insecure -n <node-ip>   # Netzwerk-Interfaces
```

Zwei Dinge habe ich dabei gelernt:

* **Die Disk:** Sie heisst wie erwartet `nvme0n1`, ist aber bei einem Node eine LITEON statt einer Samsung. So identisch sind refurbished Geräte also doch nicht.
* **Das Interface:** Es heisst `eno1`, nicht `enp0s31f6`, wie ich in meinen Patches angenommen hatte. Mit dem falschen Namen hätten die Control-Plane-VIP und die LoadBalancer-IPs von Cilium nicht funktioniert.

Danach habe ich die Configs erzeugt, mit `talosctl validate --mode metal` geprüft und die wichtigsten Felder von Hand kontrolliert: Install-Disk, Hostname, VIP auf `eno1`, kein Flannel, kein kube-proxy. Die `secrets.yaml` gehört sofort in den Passwort-Manager. Ohne sie lässt sich der Cluster später weder verwalten noch erweitern.

### Installation: Lieber einer nach dem anderen

Den ersten Node habe ich allein installiert: „Reset to PXE“, Maintenance-Mode, `apply-config`. Nach wenigen Minuten meldete er sich mit Zertifikaten als k8s-cp-01. Damit war der ganze Ablauf einmal an echter Hardware geprüft.

Bei den übrigen vier wollte ich Zeit sparen und habe in MeshCommander kurz nacheinander bei allen „Reset to PXE“ ausgelöst. Nur ein Node kam im Maintenance-Mode an. Laut dnsmasq-Log hatten die anderen drei nie eine PXE-Anfrage gestellt, sondern direkt Windows gestartet. Einzeln nacheinander ausgelöst klappte es dann bei allen. Die Anweisung kam beim schnellen Wechseln zwischen den Nodes offenbar nicht an.

Dann der Bootstrap, einmal und nur auf dem ersten Control Plane:

```bash
talosctl bootstrap -n <node-ip>
```

Nach gut einer Minute hatte etcd drei Mitglieder, die VIP lag auf k8s-cp-01, und die Kubernetes-API antwortete. Alle fünf Nodes registrierten sich, noch als `NotReady`, weil das CNI fehlte. Das kommt im nächsten Teil.

Mit `talosctl dashboard` sieht man auf einen Blick, wie es einem Node geht. So sieht k8s-cp-01 heute aus:

{{< custom-image "../images/homelab/px-03-talos-dashboard.png" "" "talosctl dashboard von k8s-cp-01: Stage Running, Ready True, Kubelet, API-Server, Controller-Manager und Scheduler Healthy, darunter die letzten Logzeilen bis machine is running and ready" >}}

### Fazit: Bare Metal belohnt Vorbereitung

Die eigentliche Talos-Installation war am Schluss in wenigen Minuten pro Node erledigt. Die Zeit ging in die Vorbereitung und in die Fehlersuche. Was ich daraus mitnehme:

* **Stecker ziehen testen:** Einstellungen speichern reicht nicht. Strom weg, Strom wieder da, dann prüfen, ob alles noch da ist.
* **Mitschneiden statt raten:** Ein `tcpdump` hat in einer Minute gezeigt, an welcher Stelle der Netzwerk-Boot abbricht.
* **Erst die Hardware fragen:** Im Maintenance-Mode zeigt Talos Disks und Interfaces, bevor etwas installiert ist.
* **Einer nach dem anderen:** „Schnell alle auf einmal“ ist nicht immer schneller.

Im nächsten Teil wird der Cluster richtig lebendig: Cilium, Argo CD, die ersten GitOps-Schritte, und ein Patch-Update, das alle Gateways lahmgelegt hat, ohne dass ein Alarm kam.

### Und hast du den Stecker schon gezogen?

Testest du einen Stromausfall, bevor ein System live geht, oder erst, wenn er passiert? Erzähl es mir beim nächsten Fyrabebier! Schreib uns an [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch), dann machen wir einen Termin ab.
