---
title: "Rethinking Market Data Monitoring: Enhanced Operational Security and Cost Reduction with Prometheus at a Swiss Bank"
description: ""
lead: ""
date: 2025-03-04T00:00:00+00:00
lastmod: 2025-03-04T00:00:00+00:00
draft: false
images: ["images/projects/tk-SOME-prometheus-marktdaten-monitoring-1200x630.png"]
Sitemap:
Priority: 0.3
client: "Swiss Bank"
post_img: "images/projects/tk-prometheus-marktdaten-monitoring-1500x1000.png"
img_border: true
excerpt: "In 2024, we implemented a comprehensive monitoring solution for a Swiss financial client to support their new central market data platform. Utilizing the OpenShift Monitoring Stack and Prometheus, we created a robust solution for unified monitoring across multiple clusters, detecting and alerting on technical and business errors while ensuring operational security."
techStack: "Red Hat OpenShift, Prometheus, Grafana, Alertmanager, Helm, Argo CD"
link: ""
---


In 2024, we implemented a comprehensive monitoring solution for a Swiss financial client to support their new central market data platform. Utilizing the OpenShift Monitoring Stack and Prometheus, we created a robust solution for unified monitoring across multiple clusters, detecting and alerting on technical and business errors while ensuring operational security.

## About the Client

Anonymous Swiss Client  
System-relevant Swiss Bank  

## Challenge

The client faced the complex challenge of monitoring a distributed and complex system. The market data platform consisted of approximately 30 components, including a central component based on the Solace Event Broker and third-party software. This led to delays in error detection and potential data loss.

* **Distributed Architecture:** The market data platform was spread across multiple Red Hat OpenShift clusters and network zones.
* **Complexity:** The overall system consisted of around 30 individual components, including third-party software.
* **Lack of Monitoring:** A comprehensive, centralized monitoring system did not exist. Monitoring was primarily assigned to application management.

## Solution Approach

To address these challenges, we adopted a standards-based approach that seamlessly integrated into the client’s existing OpenShift environment. Since Prometheus-based monitoring was already used on the OpenShift platform, no additional licensing costs were incurred, and the open solution provided maximum flexibility.

* **OpenShift Monitoring Stack (Prometheus):** Built on the OpenShift-integrated monitoring stack, which includes Prometheus, Alertmanager, and Grafana, we established a centralized monitoring solution.
* **Helm & ArgoCD:** The deployment of all monitoring components was automated and reproducible via ArgoCD and Helm.
* **Kubernetes & Application Monitoring:** In addition to generic Kubernetes rules for infrastructure monitoring (CPU, memory, pod status, etc.), specific service monitors and Prometheus rules were defined for each individual component of the market data platform.
* **Business Monitoring:** In addition to technical monitoring, business metrics were also integrated into Prometheus. This enabled the monitoring of business processes and alerts in case of business errors.
* **AlertmanagerConfig:** A complex Alertmanager configuration was implemented to define detailed alerting rules and mute intervals. A total of around 30 Prometheus rules were established.

## Results

The implemented monitoring solution led to measurable improvements and qualitative benefits for the client:

* **Increased Operational Security:** Comprehensive monitoring was a critical factor in the successful introduction of the market data platform and ensured its operational security.
* **Standardization:** By leveraging the OpenShift Monitoring Stack as the foundation, the solution is easily extendable and can serve as a blueprint for future monitoring requirements.
* **Central Monitoring Platform:** The solution enables global integration into the existing monitoring platform.
* **End-to-End System Monitoring:** The monitoring platform now oversees all technical and business components.
* **Cost Reduction:** The implementation and operational costs of the monitoring solution were significantly reduced.

## Client Statement

Although we are not allowed to use a formal quote, this [LinkedIn post](https://www.linkedin.com/posts/thomas-philipona-thun_intothecloud-prometheus-cloudnative-activity-7244310833726390273-pFjM) humorously expressed their satisfaction: «Du hast uns sprichwörtlich den A…. gerettet. Top Job!»

## Conclusion & Lessons Learned

This project confirmed that the OpenShift Monitoring Stack provides an excellent foundation for application monitoring. Key takeaways include:

* **OpenShift Monitoring as a Foundation:** The OpenShift Monitoring Stack offers a solid base for comprehensive application monitoring in OpenShift environments.
* **Domain Expertise for Business Monitoring:** Integrating business metrics requires deep domain knowledge and close collaboration with business departments.
* **Complexity of AlertmanagerConfig:** Extensive Alertmanager configurations can quickly become complex and require expertise in maintenance and rule management.
* **Avoiding Alert Fatigue:** An iterative approach to alert configuration is essential. Alerts must be actionable, intelligent, and urgent to avoid being ignored.
* **Prometheus Monitoring Stack Delivers:** The Prometheus Monitoring Stack has proven to be a powerful and flexible solution.

Do you face similar monitoring challenges? Contact us for a non-binding conversation:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">contact us</a>
