---
title: "What is ArgoCD? And why it can be compared to a thermostat"
slug: "argocd-what-is"
description: ""
date: 2026-07-13T00:00:00+00:00 # fix 2026-07-13T00:00:00+00:00
lastmod: 2026-07-13T00:00:00+00:00 # fix 2026-07-13T00:00:00+00:00
draft: false
#images: ["images/blog/argocd/argocd-what-is-1200x630.png"]
img_border: false
Sitemap:
  Priority: 0.9

additionalblogposts: [ 'kubernetes-hotel', 'kubevirt-whatis']

categories: ["Technology", "Kubernetes", "ArgoCD"]
authors: ['miriam-streit']
#post_img: "images/blog/argocd/argocd-what-is-1500x1000.png"
lead: "Classic CI/CD pipelines quickly reach their limits with Kubernetes: deployment transparency is lacking, manual interventions remain possible and cause discrepancies between Git and the cluster. How can these problems be solved?"
---

Argo CD solves this with visual GitOps: this guide shows how the pull model, automatic self-healing, and clear observability simplify Kubernetes deployments.

### The Problem: How Kubernetes Deployments Were Done in the Past

Anyone setting up Kubernetes deployments in the early days almost automatically landed on the classic **push model**. The process seemed logical: a code commit triggers a CI pipeline in GitHub Actions, GitLab CI, or Jenkins. The pipeline builds the container image, pushes it to a registry, and at the end runs a simple `kubectl apply -f manifest.yaml`.

What works on paper quickly creates four central problems in practice:

- **Security risk through external credentials**: For an external CI pipeline to execute commands in the cluster, it needs administrator rights. This means long-lived kubeconfigs or API tokens must be stored in third-party systems. If the CI pipeline is compromised, attackers have an open door to the entire cluster.

- **Creeping configuration drift**: When production is on fire, admins often reach directly for the terminal and adjust resources with `kubectl edit` in the live system. This solves the immediate problem but creates drift: the actual state in the cluster no longer matches the desired state in Git. On the next pipeline run, the manual hotfixes are silently overwritten - or the pipeline breaks.

- **Deceptive success messages**: A `kubectl apply` reports a successful "OK" to the CI pipeline as soon as the manifest has been submitted to the Kubernetes API without errors. Whether the new pods then enter a CrashLoopBackOff due to a typo in the environment variables never reaches the pipeline. The CI dashboard shows a green checkmark while the application is offline.

- **No recoverability without the pipeline**: If a cluster goes completely down, setting up a new Kubernetes cluster is not enough. One has to hope that all CI pipelines complete without errors to restore the previous state - a lengthy and error-prone process in a disaster scenario.

{{< custom-image "../images/argocd/classic-pipeline-approach.png" >}}

### The Solution: What is Argo CD & GitOps?

The answer to the weaknesses of the classic push model is **GitOps**. The core principle is straightforward: a Git repository serves as the single source of truth for the entire desired state of the infrastructure and applications.

Instead of pushing changes into the cluster from the outside, **Argo CD** flips the script. As a declarative controller, Argo CD runs inside the Kubernetes cluster. The system operates on the **pull principle**:

1. Argo CD continuously monitors the Git repository.
2. It compares the desired state (_Target State_) defined there with the actual live state (_Live State_) in the cluster.
3. If Argo CD detects a discrepancy, it synchronises the resources automatically or on demand.

Argo CD can be thought of as a **thermostat** in a building: the target temperature is set (desired state in Git). If someone opens a window and it gets cold (the live state in the cluster drifts), the thermostat responds on its own and adjusts until the desired temperature is reached again.

{{< custom-image "../images/argocd/argocd-approach.png" >}}

### Core Architecture: How Argo CD Works

Understanding Argo CD does not require reading the entire source code. A look at the three main components running in the cluster is enough:

- **API Server**: The external interface. It provides the data for the web dashboard and CLI, manages user permissions, and accepts manual commands (such as manually triggering a synchronisation).

- **Repository Server**: The translator. This service maintains the connection to the configured Git or Helm repositories. It downloads the manifests and converts them into processable Kubernetes YAML - regardless of whether plain manifests, Helm Charts, or Kustomize are in use.

- **Application Controller**: The brain. This controller continuously checks the cluster state, compares it with the processed data from the repository server, and applies the necessary changes when discrepancies are found.

#### The Two Most Important Status Metrics

When viewing an application in Argo CD, the system evaluates its state according to two clear criteria:

- **Sync Status**: Does the cluster match the Git repository?
  - `Synced`: Cluster and Git are identical.
  - `OutOfSync`: There is a new commit in Git or something has been changed in the cluster.

- **Health Status**: Are the created resources actually functioning?
  - `Healthy`: Pods are running and ready.
  - `Progressing`: The deployment is still in progress (e.g. new pods are starting).
  - `Degraded`: A pod is crashing or a resource cannot be started.

### A Simple Example: The Application Resource

In Argo CD, every deployed application is itself a native Kubernetes object - a Custom Resource Definition (CRD) of type `Application`.

The following minimal example shows how little configuration is needed to fully manage an application via GitOps:

```YAML
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-example-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'https://github.com/my-project/app-manifests.git'
    targetRevision: HEAD
    path: k8s-manifests
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

#### The Key Fields Explained:

- `source`: Which Git repository, which branch (`targetRevision`), and which folder path (`path`) contain the Kubernetes manifests?

- `destination`: Which target cluster and which target namespace should be used?

- `syncPolicy`: This is where the magic happens. With `automated`, Argo CD synchronises changes in Git without manual intervention. `prune` deletes resources in the cluster when they are removed from Git. `selfHeal` ensures that manual changes in the cluster are immediately overwritten.

### Real-World Insights: Why We Use Argo CD in Every Consulting Project

In our client projects, Argo CD is not a "nice-to-have" but the standard building block for every platform. This comes down to tangible advantages in day-to-day project work:

- **No admin credentials in CI**: The CI system only builds container images and updates version tags in Git. Since Argo CD sits in the cluster and pulls changes, no cluster-wide admin tokens need to be stored in GitHub Actions, GitLab CI, or Jenkins.

- **Visual transparency for the entire team**: Kubernetes commands in the terminal are a barrier for many developers or QA teams. Argo CD's web UI displays the entire resource tree visually, including pod logs, status indicators, and previews of changes.

- **A central dashboard for multiple clusters**: Argo CD does not need to be installed in every cluster. A central management cluster can easily distribute deployments across dozens of remote clusters (dev, staging, prod).

- **Enterprise security with SSO & RBAC**: Through integrations with Okta, Azure AD, GitHub, or GitLab, precise control over who has access to what is possible. Junior developers can view logs on staging, while the sync button for production remains protected.

- **Built-in self-healing & disaster recovery**: If a service is accidentally deleted from the cluster, Argo CD restores it immediately. If an entire cluster goes down, setting up a new one and pointing Argo CD at the Git repository is enough - the environment is back exactly as before within minutes.

- **Automated database migrations with sync hooks**: Using `PreSync` hooks, Argo CD runs a database migration job before the actual code deployment. Only once this completes successfully are the new application pods started.

- **Scalability through ApplicationSets**: When one application grows to 50 microservices across 10 locations, 500 manifests do not need to be created manually. The `ApplicationSet` feature generates these objects dynamically based on templates.

- **Future-proof for progressive delivery**: Once teams require advanced deployment strategies such as canary or blue-green deployments, the sister project Argo Rollouts can be seamlessly integrated.

### Conclusion & Next Steps

Argo CD removes the historical complexity from Kubernetes deployments. It closes the security gaps of classic CI pipelines, prevents drift, and gives teams full control over their infrastructure.

_Adopting GitOps is technically straightforward - the challenge usually lies in the right repository structure, the permissions model, and the processes within the team. For support with conception, integration into existing systems, or training for development and platform teams, our consulting team is happy to help._

_Prefer learning Argo CD hands-on? Our one-day [Argo CD Workshop at Acend](https://acend.ch/trainings/argo-cd/) covers the fundamentals directly on a provided test cluster - from installation through Application resources to sync strategies and ApplicationSets._
