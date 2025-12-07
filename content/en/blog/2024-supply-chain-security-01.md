---
title: "Protecting Your Software Supply Chain: Security from Source to Deployment"
slug: "supply-chain-security-01"
description: "Secure your software supply chain: From code to deployment. Learn about SLSA, Sigstore, and how to sign container images with Cosign."
date: 2024-09-29T14:00:00+00:00
lastmod: 2024-09-29T14:00:00+00:00
draft: false
images: ["images/blog/scs/supply-chain-security-blog-SOME.png"]
img_border: true
Sitemap:
  Priority: 0.91
categories: ["Technology", "Kubernetes", "Security"]
authors: []
additionalblogposts: [ 'quarkus-developer-experience', 'cicd-devx']
post_img: "images/blog/scs/supply-chain-security-blog.png"
lead: "Supply Chain Security is one of the most important topics in the DevSecOps environment and has today more relevance than ever. Due to the increasing amounts of attacks our customers face the challenge to keep their software supply chain secure. In this blog series we would like to give a comprehensive overview of the topic and give practical examples for everybody - beginner or veteran in the topic."

---

We start with a short introduction into the topic and explain why your supply chain security is crucial for the security and integrity of your software deployment. In this first post on the topic we will also demonstrate how to sign and verify containers, to give you tooling and methods to secure your own supply chain!

We think that these concepts are existential to guarantee security and integrity of software build and help customers to build resilience against modern threats.

### Supply Chain Security

As Kubernetes continues to dominate the container orchestration landscape, ensuring the security of the software supply chain becomes increasingly critical. Even seasoned Kubernetes practitioners must navigate the complexities of securing their containerized applications from development through deployment. The fact that supply chain attacks gain more momentum and impact can't be denied and is observed globally as seen in this [Statista report](https://www.statista.com/statistics/1268934/worldwide-open-source-supply-chain-attacks/).

### Understanding the Software Supply Chain

The software supply chain encompasses all the steps involved in the creation, distribution, and deployment of software. This includes source code, build processes, dependencies, and the delivery pipeline. Ensuring the security of this chain is crucial because any compromise at any stage can have far-reaching consequences.

The delivery process for the final deployable unit in a modern cloud environment has become more complex and hard to audit. Software comes in from third party suppliers, or we include a variety of dependencies in our own projects. Every piece of software is mutated or altered by multiple parties: by developers, vendors or our CI pipelines - in every step of our supply chain. That’s why supply chain security becomes more and more important!

#### Supply-chain Levels for Software Artifacts, or SLSA ("salsa")

{{< svg "assets/images/blog/scs/supply-chain-threats.svg" >}}

“It’s a security framework, a checklist of standards and controls to prevent tampering, improve integrity, and secure packages and infrastructure. It’s how you get from "safe enough" to being as resilient as possible, at any link in the chain.” - slsa.dev

The SLSA framework brings a set of comprehensive steps to apply supply chain security. It divides the security measurements into levels from zero (L0) to three (L3) and summarizes the required degree of hardening of your supply chain. It is worth taking a look and starting your own first review of your supply chain!

But without any technical help, simply talking about supply chain security won’t be enough. That’s why we take a look at the tooling you can use, to secure your system.

### Introducing Sigstore: Cosign, Rekor, and Fulcio

Sigstore provides a set of toolings to secure your supply chain. It consists of multiple tools that all provide different benefits to reach hardening in your supply chain.

1. **Cosign**:
   Cosign is a tool designed to sign and verify container image signatures. It aims to secure container images through cryptographic signatures.

2. **Rekor**:
   Rekor is a transparency log designed as a immutable merkle tree. The immutability of the transparency log itself guarantees that log entries are append only and in a valid state.

3. **Fulcio**:
   Fulcio is a component of the Sigstore project that acts as a certificate authority (CA). It issues short-lived certificates based on OpenID Connect (OIDC) identity tokens. This ensures that signatures are tied to an identity, enhancing the trustworthiness of the signed artifacts.

### Securing Docker images Supply Chain with Cosign, Sigstore, and Fulcio

Let’s imagine we wanted to publish our newly built image to a registry. We of course know all the security flaws with unsigned images, that’s why we would like to sign our image.

We first have to install the cosign binary. Head over to the release page  and download the latest release.

```sh
wget "https://github.com/sigstore/cosign/releases/download/v2.4.0/cosign-linux-amd64" 
sudo mv cosign-linux-amd64 /usr/local/bin/cosign 
sudo chmod +x /usr/local/bin/cosign
# Verify with `cosign version`
cosign version
```

When you are ready, simply create a container image (or pull whatever image you want and tag it).

Create a Dockerfile of your desires, we take a minimal example:

```Dockerfile

Dockerflie:
FROM alpine

CMD ["echo", "hello-world"]
```

We build the image, tag it with according to our docker-hub user and push it to dockerhub:

```sh
docker build -t g1raffi/my-image:latest .
docker push g1raffi/my-image:latest
```

To sign our image with the sigstore cosign tooling we can simply:

```sh
cosign sign g1raffi/my-image:latest
```

Follow the process along and choose the OIDC provider of your choice. At some point you will receive the confirmation message:

```sh
tlog entry created with index: 134308541
Pushing signature to: index.docker.io/g1raffi/my-image
```

This message confirms that a transparency log entry was created and the signature was pushed to the registry.
The signature of the image is as well stored in the docker registry provided alongside the image itself.

```sh
 cosign verify \
    --certificate-identity raffael@tim-koko.ch \
    --certificate-oidc-issuer https://accounts.google.com \
      g1raffi/my-image:latest

Verification for index.docker.io/g1raffi/my-image:latest --
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - Existence of the claims in the transparency log was verified offline
  - The code-signing certificate was verified using trusted certificate authority certificates
```

The output validates that the signatures and the existence of the transparency log entry was verified - neat!

### Integrating with Kubernetes

As soon as we are working with signed containers per default, we can implement more supply chain security measurements in our Kubernetes environments. Integrating the tooling into your Kubernetes clusters might be an important step towards a end-to-end secure supply chain:

* **Admission Controller / Policy Enforcement**:   With admission controllers, like Kyverno, can we enforce policies upon our clusters and control any admission of workload. Verifying signatures from containers entering our cluster can level our supply chain security up to the next level!
* **Continuous Monitoring**: Alongside enforcing policies, we can passively scan and monitor images in our repositories and registries. Instrumenting our monitoring and alerting tooling will help us finding sources of insecure images fast.

### Conclusion

Securing the software supply chain is a critical aspect of maintaining a robust and secure Kubernetes environment. The SLSA framework brings a short and spot-on summary about the supply chain security. By leveraging tools like Cosign, Sigstore, and Fulcio, you can enhance the integrity, transparency, and trustworthiness of your container images and artifacts. Integrating these tools into your CI/CD pipelines and Kubernetes clusters ensures that your software supply chain remains secure from source to deployment.

<br><hr><br>

Would you like to learn more about the different levels of the SLSA framework and hardened kuberentes native software supply chains? Can we help to get your supply chain security to the next level? Get in touch with us at any times via <a href="mailto:hallo@tim-koko.ch">hallo@tim-koko.ch</a> and we would be glad to get to know you!
