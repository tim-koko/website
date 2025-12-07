---
title: "Baloise – Distributed Tracing Platform PoC based on OpenTelemetry and Grafana Tempo"
description: ""
lead: "Cloud Native Tracing for Baloise: Successful PoC using OpenTelemetry & Grafana Tempo. A scalable alternative to proprietary tools. See the results!"
date: 2025-04-14T00:00:00+00:00
lastmod: 2025-04-14T00:00:00+00:00
draft: false
images: ["images/projects/tk-Ref-Baloise-OtelPoc-1200x630px-og.png"]
Sitemap:
  Priority: 0.3
client: "Baloise"
post_img: "images/projects/tk-Ref-Baloise-OtelPoc-1500x1000px.png"
img_border: false
techStack: "Red Hat OpenShift, OpenTelemetry, Grafana Tempo, Prometheus, Grafana, Thanos, ArgoCD, Helm"
copy: "Photo © Baloise, Ralph Dinkel"
link: "https://baloise.com"
---


The PoC successfully confirmed that the open-source stack meets Baloise’s high standards, enables seamless integration into the existing observability infrastructure, and lays the foundation for simplified tracing onboarding for development teams. Thanks to the expertise of tim&koko, Baloise was able to gain valuable insights and set the stage for a modern, scalable, and cost-efficient tracing strategy.

## About the Client

Baloise Insurance is a renowned Swiss insurance group with a long-standing tradition and a strong focus on innovative solutions. Headquartered in Basel, the company offers a wide range of insurance and pension services for both private individuals and businesses. By combining traditional insurance with modern digital approaches, Baloise sets new standards in the industry and enjoys the trust of millions of customers in Switzerland and beyond.

## Challenge

Baloise was already using a proprietary tracing solution but faced the following challenges:

* **High license costs:** The existing solution incurred significant licensing fees.  
* **Low adoption:** Due to poor integration and complexity, the platform was not widely used.  
* **Isolated solution:** The existing platform was barely integrated into the existing observability infrastructure.  
* **Desire for self-service:** Teams needed a simpler way to utilize tracing functionalities independently.  
* **Scalability and performance:** High demands for performance and scalability for future, widespread use across the company.  
* **Integration with existing monitoring:** The current metrics-based monitoring (Prometheus, Grafana, Thanos) should be tightly integrated with tracing.

## Solution Approach

In collaboration with tim&koko, Baloise initiated a Proof of Concept (PoC) to develop a state-of-the-art tracing platform. tim&koko supported Baloise with extensive expertise in OpenTelemetry and cloud-native tracing. Together, we implemented a cloud-native tracing platform in the PoC, which also included monitoring of the platform itself, with a particular focus on alerts, ServiceMonitors, and dashboards.

* **OpenTelemetry and Grafana Tempo:** Development of a cloud-native tracing platform based on open standards.  
* **Scalable architecture:** Design of a scalable architecture, similar to the existing Prometheus monitoring stack, to enable team-specific scaling.  
* **Workshops and vision alignment:** Joint workshops to define the target vision and specific PoC content.  
* **Best practices deployment:** Implementation of the OpenTelemetry infrastructure across multiple OpenShift clusters following best practices.  
* **Customizable collector pipelines:** Development of flexible collector pipelines for filtering, enrichment (global labels), and forwarding of traces to Grafana Tempo.  
* **Grafana Tempo evaluation:** Evaluation of Grafana Tempo as a performant and integratable tracing backend.  
* **Trace and span metrics:** Implementation of trace and span metrics for enhanced analysis.  
* **Instrumentation and auto-instrumentation:** Evaluation and implementation of instrumentation strategies for applications (automatic and manual).  
* **Load testing and validation:** Execution of load tests to validate the performance and scalability of the concept.

## Results

* **PoC success:** The PoC successfully demonstrated that a tracing platform based on OpenTelemetry and Grafana Tempo meets Baloise's high standards and presents an attractive alternative to the proprietary solution.  
* **Integrated observability:** Integration of traces, metrics, and logs in Grafana enables a holistic view and eliminates the gap caused by a separate tracing platform.  
* **Familiar user experience:** Leveraging Grafana as the central UI ensures a consistent user experience and seamless integration with existing processes and infrastructure.  
* **Full ownership:** The Baloise team successfully took ownership of the new platform as part of the PoC.  
* **Scalability ensured:** The designed architecture supports horizontal scaling of the tracing platform per team.  
* **Open standards and vendor independence:** Using open standards (OpenTelemetry) reduces vendor lock-in and enables flexible deployments across environments (on-premises, public cloud).

## Client Testimonial

“Once again, thank you for the excellent support. I don’t think we would have progressed this quickly without you—if at all.”

**Michael Mühlebach**, Product Owner IT-Services

## Conclusion & Lessons Learned

The PoC clearly demonstrated the potential of cloud-native tracing platforms as an alternative to traditional proprietary solutions. OpenTelemetry in combination with Grafana Tempo proved to be the ideal fit for Baloise’s needs. The outstanding collaboration with the team was a key factor in the PoC’s success. The insights gained and the platform built during the PoC now provide a solid foundation for establishing a productive, company-wide tracing solution at Baloise.

Do you face similar observability challenges or want to learn more about the benefits of tracing? Get in touch with us for a no-obligation conversation:

&nbsp;

<a class="btn btn-primary rounded-pill" href="mailto:hallo@tim-koko.ch">contact us</a>
