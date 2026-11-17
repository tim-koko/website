---
title: "Home Lab #3: Talos via PXE and the pull-the-plug test"
slug: "homelab-pxe-talos-install"
description: "Installing Talos Linux on bare metal via PXE without a monitor: debugging network boot with tcpdump, a hardware check and why the pull-the-plug test belongs in."
date: 2027-02-16T00:00:00+00:00
lastmod: 2027-02-16T00:00:00+00:00
draft: false
images: ["images/blog/homelab/homelab-03-1200x630.jpg"]
img_border: false
Sitemap:
  Priority: 0.9

additionalblogposts: ['homelab-remote-management', 'homelab-hardware-bios']

categories: ["Technology", "Kubernetes", "Talos"]
authors: ['thomas-philipona']
post_img: "images/blog/homelab/homelab-03-1500x1000.jpg"
lead: "Hardware prepared, remote management set up, now Talos goes onto the nodes. No monitor, via network boot. Along the way: an empty coin cell, a firmware that wouldn't listen, and five nodes that didn't all play along at once."
---

In [part two]({{< relref "/blog/2027-homelab-02-remote-management.md" >}}), I set up remote management: no KVM, but power on and off, reset and boot options over the network. That's exactly enough to install Talos without plugging in a monitor. Before the cluster was running, though, there were a few surprises.

### The plan: PXE once, then boot from the SSD

Intel Standard Manageability can **boot a node via PXE once**. In MeshCommander, that's *Power Actions → Reset to PXE*. The process looks like this:

1. Sidero Booter runs on my workstation. It provides everything a network boot needs.
2. In MeshCommander, I trigger "Reset to PXE" for each node.
3. Talos starts in RAM in maintenance mode. With `talosctl apply-config`, the node gets its configuration and installs itself onto the NVMe.
4. On the next start, the node boots from the SSD, because it's first in the boot order anyway.

This way, I never have to change the boot order. If PXE were permanently first, every reboot would wait for the network first, and a node would boot from the network as soon as Booter was running anywhere. The only important thing is that PXE is in the list at all. As delivered, it wasn't:

{{< custom-image "../images/homelab/px-02-boot-order.jpg" "" "Lenovo BIOS, Primary Boot Sequence as delivered: the SSD is first, PXE IPv4 and IPv6 are listed under Excluded from boot order" >}}

### The pull-the-plug test: a node forgets its configuration

Before the installation, I had a problem child: k8s-cp-03. Every now and then, remote management stopped responding. After reconfiguring, it worked again, and a few days later it was gone again. MEBx then showed: factory settings, password back to `admin`.

A targeted test brought clarity: unplug the node for one minute and plug it back in.

* **Does the node start on its own?** Yes, "After Power Loss: Power On" works.
* **Are the BIOS settings still there?** Yes.
* **Is the MEBx configuration still there?** No. Remote management no longer responds.

At first, I thought an empty CMOS battery would also wipe the BIOS settings. With a UEFI BIOS, though, they're stored in flash and survive a power loss even without a battery. The coin cell (CR2032) powers the clock, and Intel platforms can reset the ME configuration when the clock loses power. That matched exactly: BIOS unchanged, MEBx back to factory settings.

So I replaced the CR2032, set up MEBx again and repeated the test. This time, remote management was reachable about a minute after plugging back in, with its configuration intact. The machines are about seven years old, so I ran the test on all the other nodes as well.

Without this test, the problem would only have shown up at the first real power outage, and maybe on all nodes at once. Since then, the pull-the-plug test is part of the acceptance check for every node.

### PXE boot: Booter answers, the firmware doesn't listen

Then the first attempt: started Booter, triggered "Reset to PXE" on k8s-cp-01. The Booter log dutifully showed `offering boot response`. Still, after half a minute the node started Windows again.

Instead of guessing, I captured the traffic:

```bash
sudo tcpdump -ni enp0s3 -e -vv 'port 67 or port 68 or port 4011'
```

The capture showed three things:

1. The node sends a DHCP `Discover` with `PXEClient:Arch:00007`, i.e. UEFI x64.
2. The router **and** Booter respond within milliseconds.
3. The node never sends a `Request`. It repeats its `Discover` after 4, 8 and 16 seconds and then gives up.

So the responses arrive, but the firmware discards the one from Booter. My first suspicion was wrong checksums, because `tcpdump` reported `bad udp cksum` for Booter's packets. Turning off checksum offloading in the VM didn't change anything, though. You often see this message for outgoing packets anyway, even when everything is fine.

The Booter project has an open [issue](https://github.com/siderolabs/booter/issues/10) with exactly this behavior on other UEFI hardware, so far without a solution. In the capture, I noticed that Booter's response doesn't contain a server ID (DHCP option 54). That's not proven to be the cause, though.

In the end, the fix was the classic: turn off Booter's DHCP proxy and replace it with **dnsmasq**. Booter still provides TFTP and HTTP. With that, it worked right away. This is what the network boot looks like now:

```text
1. MeshCommander → ISM: "Reset to PXE"
2. Firmware → broadcast: DHCP Discover with "PXEClient"
3. Router → IP address | dnsmasq → "snp.efi on the workstation"
4. Firmware → Booter (TFTP): snp.efi (iPXE with embedded script)
5. iPXE → router: own IP address
6. iPXE → Booter (HTTP): /ipxe/boot.ipxe
7. iPXE → Image Factory: Talos kernel and initramfs
8. Talos runs in RAM in maintenance mode
```

One irritation along the way: on the first TFTP attempt, the Booter log showed `User aborted the transfer`. That looks like an error, but it's normal. The UEFI firmware first only asks for the file size, aborts, and downloads the file properly shortly after.

### Look first, then install

Up to this point, nothing has been written to disk. Talos runs only in RAM, which makes it the perfect moment for a hardware check. In maintenance mode there are no certificates yet, so the commands run with `--insecure`:

```bash
talosctl version --insecure -n <node-ip>     # is Talos responding?
talosctl get disks --insecure -n <node-ip>   # install disk
talosctl get links --insecure -n <node-ip>   # network interfaces
```

I learned two things:

* **The disk:** As expected, it's called `nvme0n1`, but on one node it's a LITEON instead of a Samsung. So refurbished machines aren't quite as identical after all.
* **The interface:** It's called `eno1`, not `enp0s31f6` as I had assumed in my patches. With the wrong name, the control plane VIP and Cilium's LoadBalancer IPs wouldn't have worked.

Then I generated the configs, checked them with `talosctl validate --mode metal` and reviewed the most important fields by hand: install disk, hostname, VIP on `eno1`, no Flannel, no kube-proxy. The `secrets.yaml` goes straight into the password manager. Without it, you can neither manage nor extend the cluster later.

### Installation: better one at a time

I installed the first node on its own: "Reset to PXE", maintenance mode, `apply-config`. After a few minutes, it reported back with certificates as k8s-cp-01. That meant the whole process had been tested once on real hardware.

For the other four, I wanted to save time and triggered "Reset to PXE" on all of them in quick succession in MeshCommander. Only one node arrived in maintenance mode. According to the dnsmasq log, the other three never sent a PXE request and started Windows directly. Triggered one at a time, it then worked on all of them. Apparently the command didn't get through when switching quickly between nodes.

Then the bootstrap, once and only on the first control plane:

```bash
talosctl bootstrap -n <node-ip>
```

After just over a minute, etcd had three members, the VIP was on k8s-cp-01 and the Kubernetes API was responding. All five nodes registered, still `NotReady` because the CNI was missing. That's coming in the next part.

With `talosctl dashboard`, you can see at a glance how a node is doing. This is what k8s-cp-01 looks like today:

{{< custom-image "../images/homelab/px-03-talos-dashboard.png" "" "talosctl dashboard of k8s-cp-01: Stage Running, Ready True, kubelet, API server, controller manager and scheduler Healthy, below the last log lines up to machine is running and ready" >}}

### Conclusion: bare metal rewards preparation

In the end, the actual Talos installation took just a few minutes per node. The time went into preparation and troubleshooting. What I take away:

* **Test pulling the plug:** saving settings isn't enough. Power off, power back on, then check that everything is still there.
* **Capture instead of guessing:** a `tcpdump` showed within a minute where the network boot breaks off.
* **Ask the hardware first:** in maintenance mode, Talos shows disks and interfaces before anything is installed.
* **One at a time:** "all at once, quickly" isn't always faster.

In the next part, the cluster really comes to life: Cilium, Argo CD, the first GitOps steps, and a patch update that took down all gateways without a single alert.

### So, have you pulled the plug yet?

Do you test a power outage before a system goes live, or only when it happens? Tell me over the next after-work beer! Write to us at [hallo@tim-koko.ch](mailto:hallo@tim-koko.ch) and we'll find a date.
