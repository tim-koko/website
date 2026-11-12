---
title: "Home Lab #2: vPro, das keines ist"
slug: "homelab-remote-management"
description: "Remote-Management im Kubernetes Home Lab: Intel vPro, MEBx und MeshCommander, warum KVM fehlte und wie ein curl mehr klärte als drei KI-Antworten."
date: 2027-02-04T00:00:00+00:00
lastmod: 2027-02-04T00:00:00+00:00
draft: false
images: ["images/blog/homelab/homelab-02-1200x630.jpg"]
img_border: false
Sitemap:
  Priority: 0.9

additionalblogposts: ['homelab-hardware-bios', 'platform-engineering-with-ai']

categories: ["Technologie", "Kubernetes", "Talos"]
authors: ['thomas-philipona']
post_img: "images/blog/homelab/homelab-02-1500x1000.jpg"
lead: "Ein Hauptgrund für meine Mini-PCs war vPro: Fernzugriff auf den Bildschirm, nie wieder einen Monitor anschliessen. Die KI hat mir das mehrmals bestätigt. Ein einziger curl-Befehl hat dann gezeigt, dass es nicht stimmt."
---

Im [ersten Teil]({{< relref "/blog/2027-homelab-01-hardware.md" >}}) ging es um Hardware, BIOS und Netzwerk für meinen Kubernetes-Cluster aus fünf gebrauchten Lenovo M920x. Ein Versprechen hatte ich dort offen gelassen: „vPro mit KVM-over-IP, du brauchst nie wieder einen Monitor“. Genau darum geht es jetzt, und um die Frage, wem man bei Hardware-Fähigkeiten glauben sollte.

### Der Plan: Ein Cluster ohne Monitor

Fünf Nodes, und jedes Mal, wenn ich eine BIOS-Einstellung ändern will, einen Monitor und eine Tastatur umstecken? Das wollte ich vermeiden. Intel vPro bringt mit AMT ein Remote-Management mit, das unabhängig vom Betriebssystem läuft: Ein- und Ausschalten, Reset und im besten Fall KVM, also das Bild des Bildschirms samt Tastatur und Maus über das Netzwerk. So zumindest der Plan.

### MEBx einrichten, so einfach gehts

Konfiguriert wird das Remote-Management im MEBx-Menü, das man beim Booten mit `Ctrl+P` öffnet. Dort habe ich ein Passwort vergeben, DHCP eingeschaltet, „User Opt-In“ auf `None` gesetzt und „Activate Network Access“ bestätigt.

Danach war die Weboberfläche des Nodes unter `http://<node-ip>:16992` erreichbar. Als Nächstes wollte ich KVM ausprobieren.

### MeshCommander: Ein Tool aus einer anderen Zeit

Für KVM empfehlen die KI und viele Anleitungen MeshCommander. Die Webseite des Projekts gibt es allerdings nicht mehr, und der alte Installer lief ohnehin nur unter Windows. Zum Glück gibt es MeshCommander auch als npm-Paket. Es läuft unter Linux als lokaler Webserver, mit `npm ci && npm start` ist es gestartet. Die letzte Version ist von 2022, für mein Home Lab reicht das.

{{< custom-image "../images/homelab/rm-02-meshcommander-nodes.png" "" "MeshCommander mit den fünf Nodes des Clusters, drei Control Planes und zwei Worker" >}}

Die Verbindung zum Node klappte auf Anhieb. Nur der Tab „Remote Desktop“ fehlte. Unter „Active Features“ standen bloss „Serial-over-LAN“ und „IDE-Redirect“, ein Hinweis, den ich zu diesem Zeitpunkt noch nicht ernst genommen habe.

{{< custom-image "../images/homelab/rm-03-meshcommander-power.png" "" "MeshCommander mit verbundenem Node: Active Features nur Serial-over-LAN und IDE-Redirect, daneben das Menü Power Actions" >}}

### Die KI ist sich sicher, das Gerät nicht

Also habe ich die KI gefragt. Die Antwort kam schnell und klang überzeugend: Ich müsse im MEBx die „KVM Feature Selection“ aktivieren. Das Problem: Diesen Menüpunkt gibt es dort nicht. Davor hatte mir die KI schon mehrmals bestätigt, dass der i5-8500 vPro-fähig ist und ich damit volles KVM bekomme.

Die Lösung lieferte am Ende der Node selbst. Er verrät seine Firmware nämlich im HTTP-Header:

```bash
curl -sI http://<node-ip>:16992/logon.htm | grep -i server
Server: Intel(R) Standard Manageability 12.0.6.1120
```

**Intel Standard Manageability (ISM)**, nicht AMT. ISM ist die abgespeckte Variante und kann **kein KVM**. Ein- und Ausschalten, Reset und Boot-Optionen funktionieren, ein Fernbild gibt es nicht.

Das Ironische daran: Es stand die ganze Zeit auf dem Bildschirm. Das MEBx-Menü heisst „Intel(R) Standard Manageability Configuration“. Ich habe es nur nicht gelesen, weil ich „vPro = KVM“ erwartet habe.

{{< custom-image "../images/homelab/rm-01-mebx.jpg" "" "Das MEBx-Menü des Lenovo M920x mit dem Titel Intel(R) Standard Manageability Configuration" >}}

Ob es an der CPU liegt oder an der ME-Firmware-Variante von Lenovo, habe ich nicht weiter untersucht. Für den Cluster ist es nicht tragisch: Talos hat ohnehin keine grafische Oberfläche, und für die Installation reichen die Power-Aktionen. Für BIOS-Änderungen brauche ich aber weiterhin einen Monitor, oder irgendwann ein günstiges IP-KVM wie NanoKVM oder JetKVM.

### Power-Steuerung direkt aus dem Terminal

Auch ohne Fernbild ist ISM nützlich. Ein- und Ausschalten und Reset laufen über WS-Management auf Port 16992, also über dieselbe Schnittstelle, die auch MeshCommander für seine „Power Actions“ nutzt. Statt mich jedes Mal durch eine Weboberfläche zu klicken, habe ich dafür ein kleines Bash-Skript geschrieben. Im Kern ist es ein `curl` mit Digest-Authentifizierung, der eine SOAP-Nachricht an `/wsman` schickt:

```bash
curl -s --digest -K <(printf 'user = "admin:%s"\n' "$AMT_PASSWORD") \
  -H 'Content-Type: application/soap+xml;charset=UTF-8' \
  --data-binary @request-power-state-change.xml \
  "http://<node-ip>:16992/wsman"
```

Die SOAP-Nachricht ruft `RequestPowerStateChange` auf, mit dem gewünschten Zustand: `2` für Einschalten, `8` für Ausschalten und `10` für Reset. Das Passwort geht über eine Pipe an `curl` und taucht so nicht in der Prozessliste auf.

Mit dem Skript drumherum sieht der Alltag so aus:

```bash
read -rsp "ISM-Passwort: " AMT_PASSWORD; export AMT_PASSWORD; echo
./amt-power.sh status all        # an/aus pro Node
./amt-power.sh on cp             # nur die Control Planes einschalten
./amt-power.sh reset <node-ip>   # einen Node neu starten
./amt-power.sh cluster-up        # Control Planes ein, auf Talos warten, Worker ein, warten bis alle Ready
```

`cluster-up` ist mein Lieblingsbefehl: Er startet zuerst die drei Control Planes, wartet, bis die Talos-API antwortet, schaltet dann die Worker ein und wartet, bis alle Nodes `Ready` sind. Ein Detail ist mir dabei wichtig: `off` ist ein hartes Ausschalten, wie Stecker ziehen. Zum Herunterfahren nehme ich deshalb immer `talosctl shutdown`.

```text
$ ./talos/amt-power.sh cluster-up
k8s-cp-01: ok
k8s-cp-02: ok
k8s-cp-03: ok
Waiting for Talos API on the control planes ... ok
k8s-worker-01: ok
k8s-worker-02: ok
Waiting for all nodes Ready ...... ok
```

Nach 1 Minute 40 Sekunden laufen alle fünf Nodes.

### ME-Firmware: Das BIOS-Update reicht nicht

Beim Auslesen der Header ist mir noch etwas aufgefallen: Die Firmware-Stände waren uneinheitlich. Ein Node meldete 12.0.35.1427, andere 12.0.6.1120. Dabei hatte ich doch alle BIOS-Updates gemacht?

Die ME-Firmware kommt nicht mit dem BIOS-Update, sondern ist bei Lenovo ein eigenes Paket: das „Corporate Intel Management Engine Firmware Update Tool for Intel CFL Platform“ (DS505029). Wichtig ist das Corporate-Paket, nicht das Consumer-Paket. Und das Update läuft **nur unter Windows**.

Ich war froh, dass das halb eingerichtete Windows vom Refurbisher noch drauf war: Windows starten, das Tool als Administrator ausführen, neu starten. Danach liefen alle fünf Nodes mit Version 12.0.90.2072.

{{< custom-image "../images/homelab/rm-04-ism-web.png" "" "Weboberfläche von Intel Standard Manageability mit Systemstatus und Firmware-Version 12.0.90 build 2072" >}}

Eine Überraschung gab es trotzdem: Nach dem Update auf dem ersten Node war die MEBx-Konfiguration weg, und ich musste alles neu einrichten. Ein ME-Update kann die Konfiguration zurücksetzen. Seither prüfe ich nach jedem Update kurz, ob das Remote-Management noch erreichbar ist.

### Fazit: Die KI für Ideen, das Gerät für Fakten

Die KI war bei der Kaufberatung und als Ideengeberin hilfreich. Bei konkreten Hardware-Fähigkeiten und Menüs lag sie daneben, und zwar mit grosser Überzeugung. Was ich daraus mitnehme:

* **Das Gerät fragen:** Ein `curl` auf den HTTP-Header hätte die KVM-Frage in einer Sekunde geklärt.
* **Den Bildschirm lesen:** Oft steht die Antwort schon da, wenn man nicht nur das sieht, was man erwartet.
* **Firmware ist mehr als BIOS:** Die ME-Firmware braucht ein eigenes Update, und das gibt es nur für Windows.
* **Nach Updates prüfen:** Ein Firmware-Update kann die Konfiguration zurücksetzen.

Im nächsten Teil geht es endlich an die Installation: Talos per PXE, ohne die Boot-Reihenfolge umzustellen, und ein Node, der nach jedem Stromunterbruch seine Konfiguration vergessen hat.

### Und wo lag die KI bei dir daneben?

Hat dir ein KI-Assistent auch schon etwas sehr überzeugend erklärt, das es so gar nicht gibt? Erzähl es mir beim nächsten Fyrabebier! Schreib uns an [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch), dann machen wir einen Termin ab.
