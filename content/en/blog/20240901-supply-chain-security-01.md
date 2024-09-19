---
title: "Enhancing Supply Chain Security in Kubernetes with Cosign, Sigstore, and Fulcio"
slug: "supply-chain-security-01"
description: ""
date: 2024-09-01T00:00:00+00:00
lastmod: 2024-09-01T00:00:00+00:00
draft: true
images: []
Sitemap:
Priority: 0.5
categories: ["Technologie", "Kubernetes", "Container", "Security"]
post_img: "images/blog/TK_BlogPost_2-3_RZ.png"
lead: "Supply Chain Security more and more becomes the attention it deserves, let's have a short introduction about Cosign, Rekor and Fulcio."
---

### Enhancing Supply Chain Security in Kubernetes with Cosign, Sigstore, and Fulcio

As Kubernetes continues to dominate the container orchestration landscape, ensuring the security of the software supply chain becomes increasingly critical. Even seasoned Kubernetes practitioners must navigate the complexities of securing their containerized applications from development through deployment. In this blog, we delve into how Cosign, Sigstore, and Fulcio can fortify supply chain security in your Kubernetes environment.

#### Understanding the Software Supply Chain

The software supply chain encompasses all the steps involved in the creation, distribution, and deployment of software. This includes source code, build processes, dependencies, and the delivery pipeline. Ensuring the security of this chain is crucial because any compromise at any stage can have far-reaching consequences.

The delivery process for the final deployable unit in a modern cloud environment has become more complex and hard to audit. Software comes in from third party suppliers, or we include a variety of dependencies in our own projects. Every piece of software is mutated or altered by multiple parties: by developers, vendors or our CI pipelines - in every step of our supply chain. That’s why supply chain security becomes more and more important!

##### Supply-chain Levels for Software Artifacts, or SLSA ("salsa")

{{< svg "assets/images/blog/scs/supply-chain-threats.svg" >}}

“It’s a security framework, a checklist of standards and controls to prevent tampering, improve integrity, and secure packages and infrastructure. It’s how you get from "safe enough" to being as resilient as possible, at any link in the chain.” - slsa.dev

The SLSA framework brings a set of comprehensive steps to apply supply chain security. It divides the security measurements into levels from zero (L0) to three (L3) and summarizes the required degree of hardening of your supply chain. It is worth taking a look and starting your own first review of your supply chain!

But without any technical help, simply talking about supply chain security won’t be enough. That’s why we take a look at the tooling you can use, to secure your system.

#### Introducing Cosign, Sigstore, and Fulcio

1. **Cosign**:
   Cosign is a tool designed to sign, verify, and store container images. It aims to secure container images through cryptographic signatures, ensuring that only trusted images are deployed to your Kubernetes clusters.

2. **Sigstore**:
   Sigstore is a project that provides a suite of tools and services to secure the software supply chain by enabling the signing and verification of software artifacts. It offers transparency and traceability, ensuring that all artifacts can be verified and trusted.

3. **Fulcio**:
   Fulcio is a component of the Sigstore project that acts as a certificate authority (CA). It issues short-lived certificates based on OpenID Connect (OIDC) identity tokens. This ensures that signatures are tied to an identity, enhancing the trustworthiness of the signed artifacts.

#### Securing Kubernetes Supply Chain with Cosign, Sigstore, and Fulcio

1. **Signing Container Images with Cosign**:
   Cosign makes it easy to sign container images. By integrating it into your CI/CD pipeline, you can ensure that all images are signed before they are pushed to a container registry. Here's a simple example of how to sign an image:
   
   ```sh
   cosign sign -key cosign.key <image-name>
   ```

   This command attaches a signature to the specified container image, which can later be verified to ensure its integrity.

2. **Verifying Signatures with Cosign**:
   Verification is equally important to ensure that only trusted images are deployed. Cosign allows you to verify the signatures of container images before they are pulled into your Kubernetes clusters:
   
   ```sh
   cosign verify -key cosign.pub <image-name>
   ```

   This step checks the image against its signature to ensure it hasn't been tampered with.

3. **Using Sigstore for Transparency**:
   Sigstore provides a transparency log that records all signed artifacts. This log is publicly accessible, enabling anyone to audit and verify the integrity of the artifacts. Integrating Sigstore into your supply chain adds an additional layer of security by ensuring traceability and accountability.

4. **Issuing Certificates with Fulcio**:
   Fulcio issues certificates based on identities verified through OIDC. When a developer signs an artifact, Fulcio ties the signature to their identity, ensuring that the artifact can be traced back to its originator. This enhances trust and reduces the risk of unauthorized modifications.

   Here's how you can use Fulcio to sign an image:
   
   ```sh
   cosign sign --fulcio <image-name>
   ```

   This command leverages Fulcio to issue a certificate and sign the image, ensuring that the signature is tied to an authenticated identity.

#### Integrating with Kubernetes

Integrating these tools into your Kubernetes environment ensures end-to-end security for your supply chain:

1. **Admission Controllers**:
   Use Kubernetes admission controllers to enforce image verification policies. Ensure that only signed images are deployed to your clusters by setting up admission controllers that check the signatures before allowing the deployment.

2. **Policy Enforcement**:
   Implement policies using tools like Open Policy Agent (OPA) or Kyverno to enforce that only images signed by trusted sources are used within your clusters. This can help prevent the deployment of malicious or tampered images.

3. **Continuous Monitoring**:
   Continuously monitor your Kubernetes environment for any deviations from your security policies. Tools like Falco can help detect and alert on suspicious activities, ensuring real-time security for your supply chain.

#### Conclusion

Securing the software supply chain is a critical aspect of maintaining a robust and secure Kubernetes environment. The SLSA framework brings a short and spot-on summary about the supply chain security. By leveraging tools like Cosign, Sigstore, and Fulcio, you can enhance the integrity, transparency, and trustworthiness of your container images and artifacts. Integrating these tools into your CI/CD pipelines and Kubernetes clusters ensures that your software supply chain remains secure from source to deployment.
