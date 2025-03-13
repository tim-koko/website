---
title: "Marktdaten Monitoring neu gedacht: Mit Prometheus zu mehr Betriebssicherheit und tieferen Kosten bei Schweizer Bank"
description: ""
lead: ""
date: 2025-03-04T00:00:00+00:00
lastmod: 2025-03-04T00:00:00+00:00
draft: false
images: ["images/projects/tk-Ref-Banking-1200x630px-og.png"]
Sitemap:
Priority: 0.3
client: "Schweizer Bank"
post_img: "images/projects/tk-Ref-Banking-1500x1000px.png"
img_border: false
lead: "Im Jahr 2024 implementierten wir für eine Schweizer Finanzkundin eine umfassende Monitoringlösung für die neue, zentrale Marktdatenplattform. Mit dem OpenShift Monitoring Stack und Prometheus schufen wir eine robuste Lösung zur einheitlichen Überwachung der über mehrere Cluster verteilten Plattform, die technische und fachliche Fehler erkennt und alarmiert sowie die Betriebssicherheit sicherstellt."
techStack: "Red Hat OpenShift, Prometheus, Grafana, Alertmanager, Helm, Argo CD"
link: ""
---


Im Jahr 2024 implementierten wir für eine Schweizer Finanzkundin eine umfassende Monitoringlösung für die neue, zentrale Marktdatenplattform. Mit dem OpenShift Monitoring Stack und Prometheus schufen wir eine robuste Lösung zur einheitlichen Überwachung der über mehrere Cluster verteilten Plattform, die technische und fachliche Fehler erkennt und alarmiert sowie die Betriebssicherheit sicherstellt.

## Über die Kundin

Anonyme Schweizer Kundin: Schweizer Bank

## Herausforderung

Die Kundin stand vor der anspruchsvollen Aufgabe, ein komplexes und verteiltes System zu überwachen. Die Marktdatenplattform setzte sich aus rund 30 Komponenten zusammen, darunter eine zentrale Komponente auf Basis des Solace Event Brokers und Drittanbietersoftware. Dies führte zu Verzögerungen bei der Fehlererkennung und potenziellen Datenverlusten.

* **Verteilte Architektur:** Die Marktdatenplattform war über mehrere Red Hat OpenShift Cluster und Netzwerkzonen verteilt.
* **Komplexität:** Rund 30 einzelne Komponenten, inklusive 3rd-Party-Software, bildeten das Gesamtsystem.
* **Fehlendes Monitoring:** Ein umfassendes, zentrales Monitoring System existierte nicht. Die Überwachung wurde primär dem Application Management zugeschrieben.

## Lösungsansatz

Um diesen Herausforderungen zu begegnen, setzten wir auf einen standardbasierten Ansatz, der sich nahtlos in die bestehende OpenShift-Umgebung der Kundin integriert: Da das auf Prometheus basierende Monitoring bereits auf der OpenShift-Plattform genutzt wurde, entstanden keine zusätzlichen Lizenzkosten und durch die offene Lösung erhielten wir die grösste Flexibilität.

* **OpenShift Monitoring Stack (Prometheus):** Aufbauend auf dem bereits in OpenShift integrierten Monitoring Stack mit Prometheus, Alertmanager und Grafana, wurde eine zentrale Monitoring-Lösung geschaffen.
* **Helm & ArgoCD:** Das Deployment aller Monitoring Komponenten erfolgte automatisiert und reproduzierbar via ArgoCD und Helm.
* **Kubernetes & Applikations Monitoring:  Neben generischen Kubernetes Regeln zur Überwachung der Infrastruktur (CPU, Memory, Pod Status etc.) wurden spezifische Service Monitors und Prometheus Rules für jede einzelne Komponente der Marktdatenplattform definiert.
* **Fachliches Monitoring:** Zusätzlich zum technischen Monitoring wurden auch fachliche Metriken in Prometheus integriert. Dies ermöglichte die Überwachung fachlicher Prozesse und die Alarmierung bei fachlichen Fehlern.
* **AlertmanagerConfig:** Eine komplexe Alertmanager Konfiguration wurde implementiert, um detaillierte Alarmierungsregeln und Mute-Intervalle für die Alarmierung abzubilden. Insgesamt wurden rund 30 Prometheus Rules definiert.

## Ergebnisse

Die implementierte Monitoringlösung führte zu messbaren Verbesserungen und qualitativen Vorteilen für die Kundin:

* **Erhöhte Betriebssicherheit:** Das umfassende Monitoring erwies sich als entscheidender Faktor für die erfolgreiche Einführung der Marktdatenplattform und gewährleistet deren Betriebssicherheit.
* **Standardisierung:** Durch die Nutzung des OpenShift Monitoring Stacks als Fundament ist die Lösung einfach erweiterbar und kann als Blueprint für zukünftige Monitoring-Anforderungen dienen.
* **Zentrale Monitoring Plattform:** Die Lösung ermöglicht eine globale Integration in die bestehende Monitoringplattform.
* **Monitoring des Gesamtsystems:** Mit der Monitoringplattform werden nun sämtliche technischen wie auch fachlichen Komponenten überwacht und monitored.
* **Kostensenkung:** Die Kosten für die Implementierung und den Betrieb der Monitoring-Lösung konnten erheblich gesenkt werden.

## Kundenstatement

Auch wenn wir kein formelles Zitat verwenden dürfen, brachte dieser [LinkedIn-Post](https://www.linkedin.com/posts/thomas-philipona-thun_intothecloud-prometheus-cloudnative-activity-7244310833726390273-pFjM) ihre Zufriedenheit humorvoll zum Ausdruck: «Du hast uns sprichwörtlich den A…. gerettet. Top Job!»

## Fazit & Lessons Learned

Das Projekt bestätigte, dass der OpenShift Monitoring Stack ein exzellentes Fundament für das Applikationsmonitoring darstellt.  Zentrale Erkenntnisse waren:

* **OpenShift Monitoring als Basis:** Der OpenShift Monitoring Stack bietet eine solide Grundlage für umfassendes Applikationsmonitoring in OpenShift Umgebungen.
* **Fachliches Know-how für fachliches Monitoring:** Die Integration fachlicher Metriken erfordert tiefgehendes Domänenwissen und enge Zusammenarbeit mit den Fachabteilungen.
* **Komplexität der AlertmanagerConfig:** Umfangreiche Alertmanager Konfigurationen können schnell unübersichtlich werden und erfordern Expertise in der Pflege und im Regelmanagement.
* **Alert Fatigue vermeiden:** Ein iterativer Ansatz bei der Alert-Konfiguration ist essenziell. Alerts müssen handlungsrelevant, intelligent und dringend sein, um zu vermeiden, dass sie ignoriert werden.
* **Prometheus Monitoring Stack überzeugt:** Der Prometheus Monitoring Stack hat sich als leistungsfähige und flexible Lösung bewährt.

Hast Du ähnliche Herausforderungen im Bereich Monitoring? Kontaktiere uns für ein unverbindliches Gespräch:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">tim&koko kontaktieren</a>
