---
title: "F5-Integration mit OpenShift"
slug: "f5-integration-openshift"
description: "Wie die F5 Container Ingress Services für OpenShift genutzt werden können"
date: 2024-10-31T00:00:00+00:00
lastmod: 2024-10-31T00:00:00+00:00
draft: false
images: []
Sitemap:
Priority: 0.8

categories: ["Technologie", "OpenShift", "Networking", "F5"]
#authors: ['benjamin-affolter']

post_img: "images/blog/FIXME/FIXME.png"
lead: "Der F5 CIS Operator ist eine interessante Option, um Applikationen automatisch über einen Enterprise Load Balancer erreichbar zu machen. Die Integration funktioniert aber unter Umständen nicht, wie das auf den ersten Blick erwartet werden könnte."
---

Dank dessen API-first Ansatz lässt sich praktisch alles auf Kubernetes automatisieren. Wenn es – insb. on-premises – darum geht, einen Kubernetes Cluster in eine bestehende IT-Landschaft zu integrieren, lässt sich dasselbe allerdings selten von den Umsystemen behaupten.\
Ein typischer Kandidat dafür sind die Load Balancer. Bei einer Kundin durften wir mithilfe des F5 CIS Operator deren Verwaltung auf OpenShift automatisieren. Das Bedürfnis für die automatisierte Verwaltung der Load Balancer war auch deshalb höher als üblich, weil eine klare Vorgabe war, dass jede auf OpenShift laufende Applikation über eine dedizierte IP-Adresse erreichbar sein muss.

### Tunnel oder Routen

Nebst der Abklärung weiterer, grundlegender [Voraussetzungen](https://clouddocs.f5.com/containers/latest/userguide/cis-installation.html#prerequisites) stellt sich für die Installation des F5 CIS Operator die Frage, wie die F5 Instanz an OpenShift angebunden werden soll. Dabei stehen grundsätzlich zwei Varianten zur Verfügung:

* Die F5 Instanz wird mittels VXLAN Tunnel in den Cluster eingebunden. Hierfür müssen VXLAN Tunnel auf der F5 Instanz und ein Host Subnet auf OpenShift erstellt werden.
* Der CIS Operator schickt der F5 Instanz die nötigen Informationen für das Eintragen von statischen Routen. Der Load Balancer weiss so, unter welcher Node IP-Adresse ein Pod erreichbar ist.

Die Wahl der Variante hängt u.a. davon ab, ob ausreichende Berechtigungen auf der F5 Instanz vorhanden sind, um die VXLAN Tunnel erstellen zu können, oder ob der für VXLAN Tunnel benötigte Port 4789 offen ist. Und nicht zuletzt natürlich auch, welche Variante als weniger komplex eingestuft wird.

### ConfigMaps oder CRDs

Der F5 CIS Operator kann so installiert werden, dass er auf Ingress bzw. Route Ressourcen achtet, oder auf ConfigMaps, oder aber dass er im CRD-Modus läuft und so nur die entsprechenden CRDs berücksichtigt. [Ein technischer Artikel von Michael O'Leary (F5)](https://community.f5.com/kb/technicalarticles/my-first-crd-deployment-with-cis/291159) zeigt die Vor- und Nachteile gut zusammengefasst auf:

|                     | **Ingress**                                                            | **ConfigMap**                                                                       | **CustomResourceDefinitions**                             |
|---------------------|------------------------------------------------------------------------|-------------------------------------------------------------------------------------|-----------------------------------------------------------|
| **Vorteile**        | Nativer Ressourcentyp                                                  | Bieten die meisten Konfigurationsmöglichkeiten                                      | Native Kubernetes Ressourcen                              |
| **Einschränkungen** | Kaum erweiterbar                                                       | Die komplexeste Methode                                                             | Keine groben Nachteile aber einige kleinere Anforderungen |
| **Fazit**           | War die erste mögliche Konfigurationsmethode, CRDs sind aber empfohlen | Nur verwenden wenn die gewünschte Konfiguration nicht mit CRDs erreicht werden kann | Die erste Wahl wenn möglich                               |

Die Wahl sollte also wenn immer möglich zugunsten der CRDs ausfallen. Einziger Nachteil: Die CRDs werden auf OpenShift nicht wie gewohnt durch den Operator installiert und gepflegt. Bei einem Operator-Update muss daher immer darauf geachtet werden, dass auch die CRDs aktualisiert werden.

### TransportServer und VirtualServer

Zwei der durch den F5 CIS Operator eingeführten CRDs beinhalten die [TransportServer-](https://clouddocs.f5.com/containers/latest/userguide/crd/transportserver.html) sowie [VirtualServer-Definitionen](https://clouddocs.f5.com/containers/latest/userguide/crd/virtualserver.html). Beide Ressourcentypen werden dazu verwendet, um auf der F5 Instanz einen Virtual Server zu erstellen. Ein VirtualServer kommt für ein Layer 7-Load Balancing zum Einsatz, der TransportServer für Layer 4.

### Integration

Damit User trotz der zusätzlichen Funktionalität und Möglichkeiten wie gewohnt mit Ingress oder Routes – und damit einhergehend der automatisierten Zertifikatsverwaltung – arbeiten können, war es wichtig, die Integration entsprechend zu gestalten. Aus diesem Grund wurde der Standard-Setup wie folgt definiert:

* Je Namespace – ein Namespace entspricht einer Applikation sowie Stage – wird ein TransportServer erstellt. Dieser definiert u.a. die IP-Adresse, unter der die Applikation erreichbar sein wird.
* Ebenfalls je Namespace wird zusätzlich ein IngressController mit Namespace Selector erstellt. Der IngressController erstellt wie gewohnt HAProxy Pods sowie einen zugehörigen Service im `openshift-ingress` Namespace.
* Der TransportServer wird nun mit dem IngressController zusammengehängt, indem der Ingress Service auf dem TransportServer als Backend Pool definiert wird.

Eingehende Requests kommen also wie folgt auf der gewünschten Applikation an:

```text
Client -> F5 Load Balancer -> HAProxy auf OpenShift -> Applikation
```

Natürlich muss der zusätzliche Hop über den IngressController bzw. HAProxy nicht in jedem Fall eingebaut werden. Für Applikationen, welche selbst bspw. eine Gateway-Funktion übernehmen, kann es durchaus Sinn machen, Requests vom Load Balancer direkt an die Pods zu schicken, um das Troubleshooting zu vereinfachen und u.U. auch die Performance leicht zu steigern.

### Dürfen wir dich begleiten?

Benötigst du Hilfe bei der Integration von F5 Load Balancers oder hast du allgemeine Fragen zu Kubernetes oder OpenShift? Zögere nicht und kontaktiere uns.
