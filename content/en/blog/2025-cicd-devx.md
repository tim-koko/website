---
title: "Efficient CI/CD Pipelines with GitLab: Productivity and Security combined"
slug: "cicd-devx"
description: ""
date: 2025-01-29T00:00:00+00:00
lastmod: 2025-01-29T00:00:00+00:00
draft: false
images: ["images/blog/cicd-devx/tk-blogpost-cicd-devx-3000x2000.png"]
img_border: true
Sitemap:
Priority: 0.91
categories: ["Technology", "GitlabCI", "Kubernetes"]
authors: []
post_img: "images/blog/cicd-devx/tk-blogpost-cicd-devx-3000x2000.png"
lead: "GitLab is widely used as a popular VCS tool and continuous integration tool. In this post, we would like to present a field report on how we exploit the possibilities of the platform to significantly improve developer productivity and also increase supply chain security through automation."
---


Automated code integration has long been an indispensable part of the modern cloud-native world. But especially in large enterprise environments, the question often arises: How do you keep track of pipelines and jobs without losing productivity or the fun of development? Developers want to have their stack ready for development in an initial setup without setting up the entire CI/CD landscape in the first phase. For our customer, the defined goal was clear: changes should be integrated promptly, made ready for deployment, and rolled out automatically. Automation directly increases productivity, but offers a lot of room for supply chain attacks. In an earlier blog post, we introduced the basics of supply chain security, as well as toolings and their importance in modern environments. We used this foundation to secure our supply chain in GitLab Pipelines.

In this post, we would like to share our experiences that we had with a client in the banking sector. The declared goal was to design a DevSecOps landscape that can roll out fully automated and without security concerns to all systems with continuous deployment.

### DevSecOps as Motivation

To live DevSecOps and thus benefit from all the benefits of microservice architectures and agile development methods, software must be rolled out to the target systems promptly and regularly. This requires a high degree of automation and standardization.
Developers should be able to focus on their daily work and integrate their projects into the CI/CD process with little additional effort.

### Standardization with GitLab CI/CD Components

GitLab introduced the concept of CI/CD Components in version 17.0. These reusable templates provide a way to make pipeline elements available as templates. These components define CI/CD components in an easy-to-understand template language, which can be used in projects via parameterized variables. CI/CD components can be obtained from the central hub (https://gitlab.com/components), or maintained in your own component. In our case, the components were developed by ourselves in order to do justice to the control and variability for project-specific requirements.
Basically, a CI/CD Component is a GitLab repository with a /templates directory. The templates for the components are located in this directory. A component has the following structure:

```yaml
# component/templates/test.yml
spec:
  inputs:
    stage:
      default: test
---
unit-test:
  stage: $[[ inputs.stage ]]
  script: echo unit tests

integration-test:
  stage: $[[ inputs.stage ]]
  script: echo integration tests
```

This template can be integrated and parameterized via the include block in a pipeline:

```yaml
# other-project/.gitlab-ci.yml
stages: [verify, release]

include:
  - component: $CI_SERVER_FQDN/compnent/test@main
    inputs:
      stage: verify
```

In this way, pipeline templates can be managed and maintained via central components. This increases reusability and maintainability while reducing the effort required for new projects.

### Renovate

Projects should keep their dependencies up-to-date. This involves an enormous amount of effort, which most developers rarely enjoy and is pure drudgery. An ideal case for an automation solution! Here we use a central Renovate CI/CD component that can be used to automatically receive pull requests with new dependencies. Renovate with a service account that can be invited to other projects to provide them with dependency updates. Through an autodiscovery function, Renovate will all projects to which the service account has access, write pull requests with new dependencies.
So we have already done an important point for a secure pipeline.

### Signing Images with Cosign

To ensure that only images that we have built ourselves are published and used, we need image signatures. With the Cosign image we get the binaries we need to create signatures of published images and store them in the container registry.

```yaml
# components/cosign/templates/cosign.yml
spec:
  inputs:
    image:
      description: "The image to be signed."
    registry-user:
      description: "The username to authenticate with the docker registry"
    registry-password:
      description: "The password to authenticate with the docker registry"
    needs:
      type: array
      default: ["image:build"]
      description: "The jobs that this job depends on"
    stage:
      default: image:sign
      description: "The stage in which the job will run"
---
cosign-sign:
  stage: $[[ inputs.stage ]]
  needs: $[[ inputs.needs ]]
  image: ghcr.io/sigstore/cosign/cosign
  script:
    - ./cosign sign
      --registry-username="$[[inputs.registry-user]]"
      --registry-password="$[[inputs.registry-password]]"
      --yes
      $[[ inputs.image ]]
```

With this CI/CD component, built images can be signed by cosign. After our dependencies are updated with Renovate and our images are signed by cosign, we also dedicate ourselves to the deployment with ArgoCD.

### Deployments with dynamic pipelines

Deployment with ArgoCD can be a challenge depending on the number of environments and clusters. To master the challenge with multiple environments and possibly also other ArgoCD instances, we need another construct: Downstream Pipelines. GitLab allows us to dynamically trigger additional pipelines with generated gitlab-ci.yml manifests at runtime of a pipeline.
The central problem is that teams deploy their applications on different stages in different Kubernetes environments and ArgoCD instances. The solution is that we dynamically create these deployment stages during the pipeline runtime and trigger a child pipeline with a generated manifest.
The project with the environments to be deployed has a config file environments.yml with the different environments and their parameters defined:

```yaml
# environments.yml
dev:
  stage: dev
  argoUrl: argo.local
  argoApp: demo-app-dev
  kubernetesUrl: kubernetes.local
  kubernetesToken: token
int:
  stage: int
  argoUrl: argo.local
  argoApp: demo-app-int
  kubernetesUrl: kubernetes.local
  kubernetesToken: token
```

In addition, we have a boilerplate file for the downstream pipeline downstream-template.yml, which we will fill in the pipeline:

```yaml
# downstream-template.yml
STAGE:deploy:
  image: bash
  stage: argo
  script:
    - echo "Deploying argoAPP"

```

For the sake of simplicity, we have also prepared the pipeline file to be filled rendered-downstream.yml and checked it into the repository with only the initial stage definition:

```yaml
# rendered-downstream.yml
stages:
  - argo

```

The effectively running pipeline first generates the resulting pipeline file in a first stage and creates an artifact from it. This artifact is used directly to create the child pipelines and thus deploy the individual environments.

```yaml
# .gitlab-ci.yml
stages:
  - template
  - deploy
    
deploy:createDownstream:
  stage: template
  image: 
    name: bash
  before_script:
    - apk add yq
  script:
    - echo "Reading environments"  
    - readarray envs < <(yq e -o=j -I=0 '.[]' environments.yml)
    - for env in "${envs[@]}"; do stage=$(echo "$env" | yq e '.stage' -); argoApp=$(echo "$env" | yq e '.argoApp' -); sed "s/STAGE/$stage/g; s/argoAPP/$argoApp/g" downstream-template.yml >> rendered-downstream.yml; done
  artifacts: 
    paths:
      - rendered-downstream.yml

deploy:triggerDownstream:
  stage: deploy
  trigger:
    include: 
      - artifact: rendered-downstream.yml
        job: deploy:createDownstream
    strategy: depend

```

The resulting pipeline now creates two child pipelines with this configuration, each of which can deploy different environments. For simplicity, the deployment logic is omitted.

{{< custom-image "../images/cicd-devx/pipeline.png" >}}
<br>

As we can see, the first pipeline job `deploy:createDownstream` creates the template in the `template` stage and in the `deploy` stage the downstream pipelines are created by the two generated artifacts. Thus, we can dynamically roll out environments with different parameters from a configuration matrix. If you would like to see or test this example live, you can find it here on [GitLab](https://gitlab.com/g1raffi/cicd-example).

### Conclusion

With many small improvements, the potential of the CI/CD environment can be maximized! The use of CI components makes GitLab pipelines easier to maintain and manage. Teams can put together their desired pipeline using simple templates and do not have to lose any development speed. With the help of GitLab's dynamic downstream pipelines, more complex continuous deployment processes with ArgoCD could be integrated into pipelines.

### Can we support you too

Would you also like to take your CI/CD landscape to the next level or do you have questions about the components used? Then contact us!
