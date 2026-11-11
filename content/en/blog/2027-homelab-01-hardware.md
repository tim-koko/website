---
title: "Home Lab #1: Five used mini PCs, one Kubernetes cluster"
slug: "homelab-hardware-bios"
description: "Kubernetes home lab with Talos Linux on five Lenovo mini PCs: choosing the hardware, BIOS update, BIOS settings and network, and what I learned from it."
date: 2027-01-19T00:00:00+00:00
lastmod: 2027-01-19T00:00:00+00:00
draft: false
images: ["images/blog/homelab/homelab-01-1200x630.jpg"]
img_border: false
Sitemap:
  Priority: 0.9

additionalblogposts: ['kubernetes-hotel', 'platform-engineering-with-ai']

categories: ["Technology", "Kubernetes", "Talos"]
authors: ['thomas-philipona']
post_img: "images/blog/homelab/homelab-01-1500x1000.jpg"
lead: "In client projects, OpenShift brings a lot out of the box. For my home lab, I wanted to find out what it's like without it: five used mini PCs, Talos Linux, no monitor. Part one covers everything that happens before the installation."
---

With OpenShift, which I work with a lot in client projects, much is already included: the web console, ingress, certificates, monitoring and upgrades of the whole stack, orchestrated by the Cluster Operators. That's convenient. But how does everyone else solve these problems? That's what I wanted to find out, with real hardware on my desk.

The plan: three control planes and two workers running Talos Linux, built from used mini PCs. Not an enterprise setup, but a playground to gain experience and deploy small applications. And, if possible, without a monitor and keyboard.

### Why Talos?

I had already used RKE in an earlier lab, so this time I wanted something new. Talos had been on my list for a while. On top of that, I wanted to spend as little time as possible dealing with the operating system on bare metal. Talos is a minimal Linux built only for Kubernetes. There's no SSH and no shell; everything is configured through an API. For Kubernetes on bare metal, it feels like the go-to choice right now.

In this series, I'll take you along: what worked, what went wrong and what I took away from it. Part one covers everything that happens before an operating system is even installed: hardware, BIOS and network.

### The hardware: why it ended up being five Lenovo M920x

The candidates were the usual suspects among 1-liter mini PCs: HP EliteDesk 800 Mini, Dell OptiPlex Micro and Lenovo ThinkCentre Tiny. The Lenovo machines fit best, so three models were left in the running:

* **M720q:** B360 chipset, no remote management. That ruled it out quickly.
* **M920q:** Q370 chipset, remote management possible, but only one NVMe slot.
* **M920x:** like the M920q, but with two M.2 NVMe slots, room for 65-watt CPUs and a PCIe slot for 2.5G or 10G network cards later on.

In the end, I bought five M920x Tiny from refurbed.ch, all with the same specs:

| Component | Specs |
| :--- | :--- |
| CPU | Intel Core i5-8500 (6 cores, 65 W) |
| RAM | 16 GB DDR4 SO-DIMM (1 module) |
| Disk | 512 GB NVMe |
| Network | 1 GbE Intel I219-LM |

I paid around CHF 400 per machine. On top of that came a switch, a Ubiquiti Flex 2.5G PoE, for around CHF 200. So for about CHF 2,200 in total, there's a five-node cluster on my desk.

Looking back, this was the best decision of the whole project: five identical machines. Same power supplies, same spare parts, same BIOS menus, same configuration. What works on one node works on the other four.

{{< slideshow >}}
{{< slider-img src="images/blog/homelab/hw-01-stack.jpg" caption="Five Lenovo ThinkCentre M920x Tiny, with the Ubiquiti switch on top." >}}
{{< slider-img src="images/blog/homelab/hw-02-open.jpg" caption="An M920x from the inside: a lot of hardware in one liter." >}}
{{< slider-img src="images/blog/homelab/hw-03-inside.jpg" caption="Under the cover: one RAM module, one free RAM slot and two M.2 slots, one of them still free." >}}
{{< /slideshow >}}

By the way, one of the main reasons for the M920x was the promise "vPro with KVM over IP, you'll never need a monitor again". Spoiler: I did need one. More on that in the next part.

### BIOS update: more than 30 releases behind

The machines still had a half-configured Windows 11 from the refurbisher. Luckily, you don't need it for the BIOS update: Lenovo offers a USB flash package. Copy the contents to a FAT32 stick, press `F12` while booting, start from the stick.

The installed version was M1UKT45A from July 2019; the current one is M1UKT79A from March 2026. That's more than 30 releases in between.

A tip up front: don't delete the old Windows too early. The update for the ME firmware, which handles remote management, is only available for Windows. I was glad it was still there. The full story follows in the next part.

### The most important BIOS settings

All five nodes use the same settings. These were the most important ones:

* **Virtualization and boot mode:** VT-x and VT-d on, CSM off, UEFI Only, Secure Boot off.
* **Power on after power loss** (*After Power Loss: Power On*): the nodes boot up again on their own after a power outage.
* **Power saving off** (*Enhanced Power Saving Mode: Disabled*): otherwise remote management also switches off while the machine is powered down.
* **PXE:** *PXE IPv4 Network Stack* on, IPv6 off.
* **Boot order:** the SSD stays at the top, PXE IPv4 comes after it. The only important thing is that PXE is in the list and not set to "Excluded" (enable it with `x`).

### The network: deliberately simple

For the network, I deliberately kept things simple: no separate VLAN, no separate router, everything runs on the normal home network. The router's DHCP range only covers the lower part of the subnet; the upper part belongs to the cluster. With example addresses, it looks like this:

* **Nodes:** fixed addresses via DHCP reservation (MAC pinning), for example `10.0.0.201` to `.203` for the control planes and `.211` to `.212` for the workers.
* **Control plane VIP:** `10.0.0.200`, managed by Talos and not configured in the router.
* **LoadBalancer pool for Cilium:** `10.0.0.220` to `.230`.

A nice detail: remote management shares the network card, MAC and IP address with the operating system. So a single reservation covers both.

For a lab, this setup is perfectly fine. In a production environment, I would of course separate the cluster from the rest of the network.

### Conclusion: the unspectacular decisions pay off

Talos isn't even installed yet, and I've already learned quite a bit:

* **Identical hardware is worth it:** one procedure, one checklist, repeated five times.
* **Firmware before the operating system:** while the old Windows is still on the machine, do all the updates that only run on Windows.
* **Trust the screen, not the AI:** write the guide based on the real menus.
* **Start simple:** no rack, no VLAN, 16 GB RAM. I can always upgrade later.

The next part is about remote management, and about why the AI promised me KVM over IP several times when my machines don't have it at all.

### So, what does your home lab look like?

Do you also have a cluster under your desk, in the basement or in a rack? What hardware does it run on, and what are you running on it? Tell us on [LinkedIn](https://www.linkedin.com/company/tim-koko) or write to us at [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch). We're curious!
