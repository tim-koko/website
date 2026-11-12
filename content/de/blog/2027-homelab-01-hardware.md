---
title: "Home Lab #1: Fünf gebrauchte Mini-PCs, ein Kubernetes-Cluster"
slug: "homelab-hardware-bios"
description: "Kubernetes Home Lab mit Talos Linux auf fünf Lenovo-Mini-PCs: Hardware-Auswahl, BIOS-Update, BIOS-Einstellungen und Netzwerk, und was ich daraus gelernt habe."
date: 2027-01-19T00:00:00+00:00
lastmod: 2027-01-19T00:00:00+00:00
draft: false
images: ["images/blog/homelab/homelab-01-1200x630.jpg"]
img_border: false
Sitemap:
  Priority: 0.9

additionalblogposts: ['kubernetes-hotel', 'platform-engineering-with-ai']

categories: ["Technologie", "Kubernetes", "Talos"]
authors: ['thomas-philipona']
post_img: "images/blog/homelab/homelab-01-1500x1000.jpg"
lead: "In Kundenprojekten bringt OpenShift vieles schon mit. Für mein Home Lab wollte ich wissen, wie es ohne geht: fünf gebrauchte Mini-PCs, Talos Linux, kein Monitor. Im ersten Teil geht es um alles, was vor der Installation passiert."
---

Bei OpenShift, mit dem ich in Kundenprojekten oft unterwegs bin, ist vieles schon dabei: die Web-Console, Ingress, Zertifikate, Monitoring und Upgrades des ganzen Stacks, orchestriert von den Cluster Operators. Das ist bequem. Aber wie lösen eigentlich alle anderen diese Probleme? Genau das wollte ich herausfinden, und zwar mit echter Hardware auf meinem Tisch.

Der Plan: drei Control Planes und zwei Worker mit Talos Linux, aufgebaut aus gebrauchten Mini-PCs. Kein Enterprise-Setup, sondern eine Spielwiese, um Erfahrungen zu sammeln und kleine Applikationen zu deployen. Und wenn möglich ganz ohne Monitor und Tastatur.

### Warum ausgerechnet Talos?

RKE hatte ich bereits in einem früheren Lab im Einsatz, also durfte es diesmal etwas Neues sein. Talos stand schon länger auf meiner Liste. Dazu kommt: Ich wollte mich so wenig wie möglich mit dem Betriebssystem auf [Bare Metal]({{< relref "/blog/2026-kubernetes-hotel.md" >}}) herumschlagen. Talos ist ein minimales Linux, das nur für Kubernetes gebaut ist. Es gibt kein SSH und keine Shell, konfiguriert wird alles über eine API. Für Kubernetes auf Bare Metal ist es für mich im Moment der naheliegende Standard.

In dieser Serie nehme ich dich mit auf den Weg: was funktioniert hat, was schiefging und was ich daraus mitnehme. Im ersten Teil geht es um alles, was passiert, bevor überhaupt ein Betriebssystem installiert ist: Hardware, BIOS und Netzwerk.

### Die Hardware: Warum es fünf Lenovo M920x wurden

Zur Auswahl standen die üblichen Verdächtigen unter den 1-Liter-Mini-PCs: HP EliteDesk 800 Mini, Dell OptiPlex Micro und Lenovo ThinkCentre Tiny. Am besten gepasst haben mir die Lenovo-Geräte, also blieben drei Modelle im Rennen:

* **M720q:** B360-Chipsatz, kein Remote-Management. Damit war er schnell raus.
* **M920q:** Q370-Chipsatz, Remote-Management möglich, aber nur ein NVMe-Slot.
* **M920x:** wie der M920q, aber mit zwei M.2-NVMe-Slots, Platz für 65-Watt-CPUs und einem PCIe-Slot für spätere 2.5G- oder 10G-Netzwerkkarten.

Gekauft habe ich schliesslich fünf M920x Tiny auf refurbed.ch, alle mit derselben Ausstattung:

{{< csvtable "responsive" ";" >}}
Komponente;Ausstattung
CPU;Intel Core i5-8500 (6 Kerne, 65 W)
RAM;16 GB DDR4 SO-DIMM (1 Riegel)
Disk;512 GB NVMe
Netzwerk;1 GbE Intel I219-LM
{{< /csvtable >}}

Pro Gerät habe ich rund 400 CHF bezahlt. Dazu kam ein Switch, ein Ubiquiti Flex 2.5G PoE für rund 200 CHF. Für insgesamt etwa 2'200 CHF steht also ein Cluster mit fünf Nodes auf dem Tisch.

Rückblickend war das der beste Entscheid des ganzen Projekts: fünf identische Geräte. Gleiche Netzteile, gleiche Ersatzteile, gleiche BIOS-Menüs, gleiche Konfiguration. Was bei einem Node funktioniert, funktioniert auch bei den anderen vier.

{{< slideshow >}}
{{< slider-img src="images/blog/homelab/hw-01-stack.jpg" caption="Fünf Lenovo ThinkCentre M920x Tiny, obendrauf der Ubiquiti-Switch." >}}
{{< slider-img src="images/blog/homelab/hw-02-open.jpg" caption="Ein M920x von innen: viel Technik auf einem Liter." >}}
{{< slider-img src="images/blog/homelab/hw-03-inside.jpg" caption="Unter der Abdeckung: ein RAM-Riegel, ein freier RAM-Slot und zwei M.2-Slots, einer davon noch frei." >}}
{{< /slideshow >}}

Ein Hauptargument für den M920x war übrigens das Versprechen „vPro mit KVM-over-IP, du brauchst nie wieder einen Monitor“. Spoiler: Ich brauchte doch einen. Mehr dazu im nächsten Teil.

### BIOS-Update: Über 30 Releases im Rückstand

Auf den Geräten war noch ein halb eingerichtetes Windows 11 vom Refurbisher installiert. Fürs BIOS-Update braucht es das zum Glück nicht: Lenovo bietet ein USB-Flash-Paket an. Inhalt auf einen FAT32-Stick kopieren, beim Booten `F12` drücken, vom Stick starten.

Installiert war die Version M1UKT45A von Juli 2019, aktuell ist M1UKT79A von März 2026. Dazwischen liegen über 30 Releases.

Ein Tipp vorweg: Das alte Windows nicht zu früh löschen. Das Update der ME-Firmware, die für das Remote-Management zuständig ist, gibt es nämlich nur für Windows. Ich war froh, dass es noch drauf war. Die ganze Geschichte folgt im nächsten Teil.

### Die wichtigsten BIOS-Einstellungen

Auf allen fünf Nodes gelten dieselben Einstellungen. Diese hier waren besonders wichtig:

* **Virtualisierung und Boot-Modus:** VT-x und VT-d an, CSM aus, UEFI Only, Secure Boot aus.
* **Nach Stromausfall einschalten** (*After Power Loss: Power On*): Die Nodes fahren nach einem Stromausfall von selbst wieder hoch.
* **Energiesparmodus aus** (*Enhanced Power Saving Mode: Disabled*): Sonst schaltet sich im ausgeschalteten Zustand auch das Remote-Management ab.
* **PXE:** *PXE IPv4 Network Stack* an, IPv6 aus.
* **Boot-Reihenfolge:** Die SSD bleibt zuoberst, PXE IPv4 steht dahinter. Wichtig ist nur, dass PXE in der Liste steht und nicht auf „Excluded“ (aktivieren mit `x`).

### Das Netzwerk: Bewusst einfach

Beim Netzwerk habe ich es mir bewusst einfach gemacht: kein eigenes VLAN, kein eigener Router, alles läuft im normalen Heimnetz. Der DHCP-Bereich des Routers deckt nur den unteren Teil des Subnetzes ab, der obere Bereich gehört dem Cluster. Mit Beispieladressen sieht das so aus:

* **Nodes:** feste Adressen per DHCP-Reservierung (MAC-Pinning), zum Beispiel `10.0.0.201` bis `.203` für die Control Planes und `.211` bis `.212` für die Worker.
* **Control-Plane-VIP:** `10.0.0.200`, wird von Talos verwaltet und nicht im Router eingetragen.
* **LoadBalancer-Pool für Cilium:** `10.0.0.220` bis `.230`.

Ein nettes Detail: Das Remote-Management teilt sich Netzwerkkarte, MAC- und IP-Adresse mit dem Betriebssystem. Eine einzige Reservierung reicht also für beides.

Für ein Lab reicht dieses Setup völlig. In einer produktiven Umgebung würde ich den Cluster natürlich vom restlichen Netz trennen.

### Fazit: Die unspektakulären Entscheide zahlen sich aus

Talos ist noch nicht einmal installiert, und trotzdem habe ich schon einiges gelernt:

* **Identische Hardware lohnt sich:** Ein Ablauf, eine Checkliste, fünfmal wiederholen.
* **Firmware vor dem Betriebssystem:** Solange das alte Windows noch drauf ist, alle Updates machen, die nur unter Windows laufen.
* **Dem Bildschirm glauben, nicht der KI:** Die Anleitung nach den echten Menüs schreiben.
* **Einfach anfangen:** Kein Rack, kein VLAN, 16 GB RAM. Aufrüsten kann ich immer noch.

Im nächsten Teil geht es ums Remote-Management und um die Frage, warum mir die KI mehrmals KVM-over-IP versprochen hat, das es auf meinen Geräten gar nicht gibt.

### Und wie sieht dein Home Lab aus?

Steht bei dir auch ein Cluster unter dem Tisch, im Keller oder im Rack? Auf welcher Hardware läuft er, und was hast du darauf am Laufen? Erzähl es uns auf [LinkedIn](https://www.linkedin.com/company/tim-koko) oder schreib uns an [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch). Wir sind gespannt!
