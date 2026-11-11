---
title: "Home Lab #2: vPro that isn't"
slug: "homelab-remote-management"
description: "Remote management in a Kubernetes home lab: Intel vPro, MEBx and MeshCommander, why KVM was missing and how one curl beat three AI answers."
date: 2027-02-04T00:00:00+00:00
lastmod: 2027-02-04T00:00:00+00:00
draft: false
images: ["images/blog/homelab/homelab-02-1200x630.jpg"]
img_border: false
Sitemap:
  Priority: 0.9

additionalblogposts: ['homelab-hardware-bios', 'platform-engineering-with-ai']

categories: ["Technology", "Kubernetes", "Talos"]
authors: ['thomas-philipona']
post_img: "images/blog/homelab/homelab-02-1500x1000.jpg"
lead: "One of the main reasons for my mini PCs was vPro: remote access to the screen, never plugging in a monitor again. The AI confirmed it several times. Then a single curl command showed that it wasn't true."
---

In [part one]({{< relref "/blog/2027-homelab-01-hardware.md" >}}), I covered hardware, BIOS and network for my Kubernetes cluster built from five used Lenovo M920x. I left one promise open there: "vPro with KVM over IP, you'll never need a monitor again". That's what this part is about, along with the question of whom to trust when it comes to hardware capabilities.

### The plan: a cluster without a monitor

Five nodes, and every time I want to change a BIOS setting, I move a monitor and keyboard around? I wanted to avoid that. With AMT, Intel vPro includes remote management that runs independently of the operating system: power on and off, reset and, at best, KVM, meaning the screen plus keyboard and mouse over the network. That was the plan, at least.

### Setting up MEBx, as simple as that

Remote management is configured in the MEBx menu, which you open with `Ctrl+P` while booting. There I set a password, enabled DHCP, set "User Opt-In" to `None` and confirmed "Activate Network Access".

After that, the node's web interface was reachable at `http://<node-ip>:16992`. Next, I wanted to try KVM.

### MeshCommander: a tool from another era

For KVM, the AI and many guides recommend MeshCommander. The project's website no longer exists, though, and the old installer only ran on Windows anyway. Luckily, MeshCommander is also available as an npm package. It runs on Linux as a local web server and starts with `npm ci && npm start`. The latest version is from 2022, which is good enough for my home lab.

{{< custom-image "../images/homelab/rm-02-meshcommander-nodes.png" "" "MeshCommander with the five nodes of the cluster, three control planes and two workers" >}}

Connecting to the node worked right away. Only the "Remote Desktop" tab was missing. Under "Active Features" it only listed "Serial-over-LAN" and "IDE-Redirect", a hint I didn't take seriously at the time.

{{< custom-image "../images/homelab/rm-03-meshcommander-power.png" "" "MeshCommander connected to a node: Active Features only Serial-over-LAN and IDE-Redirect, next to it the Power Actions menu" >}}

### The AI is sure, the device isn't

So I asked the AI. The answer came quickly and sounded convincing: I had to enable "KVM Feature Selection" in MEBx. The problem: that menu item doesn't exist there. Before that, the AI had already confirmed several times that the i5-8500 supports vPro and that I'd get full KVM.

In the end, the node itself provided the answer. It reveals its firmware in the HTTP header:

```bash
curl -sI http://<node-ip>:16992/logon.htm | grep -i server
Server: Intel(R) Standard Manageability 12.0.6.1120
```

**Intel Standard Manageability (ISM)**, not AMT. ISM is the stripped-down variant and has **no KVM**. Power on and off, reset and boot options work, but there's no remote screen.

The ironic part: it was on the screen the whole time. The MEBx menu is called "Intel(R) Standard Manageability Configuration". I just didn't read it, because I expected "vPro = KVM".

{{< custom-image "../images/homelab/rm-01-mebx.jpg" "" "The MEBx menu of the Lenovo M920x with the title Intel(R) Standard Manageability Configuration" >}}

I didn't dig into whether it's down to the CPU or Lenovo's ME firmware variant. For the cluster, it's not a big deal: Talos has no graphical interface anyway, and the power actions are enough for the installation. For BIOS changes, though, I still need a monitor, or at some point a cheap IP KVM like NanoKVM or JetKVM.

### Power control straight from the terminal

Even without a remote screen, ISM is useful. Power on, power off and reset run over WS-Management on port 16992, the same interface MeshCommander uses for its "Power Actions". Instead of clicking through a web interface every time, I wrote a small Bash script. At its core, it's a `curl` with digest authentication that sends a SOAP message to `/wsman`:

```bash
curl -s --digest -K <(printf 'user = "admin:%s"\n' "$AMT_PASSWORD") \
  -H 'Content-Type: application/soap+xml;charset=UTF-8' \
  --data-binary @request-power-state-change.xml \
  "http://<node-ip>:16992/wsman"
```

The SOAP message calls `RequestPowerStateChange` with the desired state: `2` to power on, `8` to power off and `10` to reset. The password is passed to `curl` through a pipe, so it doesn't show up in the process list.

With the script around it, day-to-day use looks like this:

```bash
read -rsp "ISM password: " AMT_PASSWORD; export AMT_PASSWORD; echo
./amt-power.sh status all        # on/off per node
./amt-power.sh on cp             # power on only the control planes
./amt-power.sh reset <node-ip>   # restart one node
./amt-power.sh cluster-up        # control planes on, wait for Talos, workers on, wait until all Ready
```

`cluster-up` is my favorite command: it first starts the three control planes, waits until the Talos API responds, then powers on the workers and waits until all nodes are `Ready`. One detail matters to me: `off` is a hard power-off, like pulling the plug. To shut down, I always use `talosctl shutdown`.

{{< custom-image "../images/homelab/rm-05-cluster-up.png" "" "Terminal running amt-power.sh cluster-up: control planes and workers are powered on, after 1 minute 55 seconds all nodes are Ready" >}}

### ME firmware: the BIOS update isn't enough

While reading the headers, I noticed something else: the firmware versions weren't consistent. One node reported 12.0.35.1427, others 12.0.6.1120. Hadn't I done all the BIOS updates?

The ME firmware doesn't come with the BIOS update. At Lenovo, it's a separate package: the "Corporate Intel Management Engine Firmware Update Tool for Intel CFL Platform" (DS505029). It has to be the corporate package, not the consumer package. And the update **only runs on Windows**.

I was glad the half-configured Windows from the refurbisher was still on the machines: start Windows, run the tool as administrator, reboot. After that, all five nodes ran version 12.0.90.2072.

{{< custom-image "../images/homelab/rm-04-ism-web.png" "" "Intel Standard Manageability web interface with system status and firmware version 12.0.90 build 2072" >}}

There was still one surprise: after the update on the first node, the MEBx configuration was gone and I had to set everything up again. An ME update can reset the configuration. Since then, I quickly check after every update whether remote management is still reachable.

### Conclusion: AI for ideas, the device for facts

The AI was helpful for buying advice and as a source of ideas. On concrete hardware capabilities and menus, though, it was wrong, and very convincingly so. What I take away:

* **Ask the device:** a `curl` on the HTTP header would have settled the KVM question in a second.
* **Read the screen:** often the answer is already there, if you look at more than what you expect.
* **Firmware is more than BIOS:** the ME firmware needs its own update, and it only exists for Windows.
* **Check after updates:** a firmware update can reset the configuration.

The next part finally gets to the installation: Talos via PXE without changing the boot order, and a node that forgot its configuration after every power outage.

### So, where has AI been wrong for you?

Has an AI assistant ever explained something very convincingly that doesn't exist at all? Tell me over the next after-work beer! Write to us at [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch) and we'll find a date.
