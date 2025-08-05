---
title: "Effiziente CI/CD-Pipelines mit GitLab: Produktivität und Sicherheit vereint"
slug: "cicd-devx"
description: ""
date: 2025-01-29T00:00:00+00:00
lastmod: 2025-01-29T00:00:00+00:00
draft: false
images: ["images/blog/cicd-devx/tk-blogpost-cicd-devx-3000x2000.png"]
img_border: true
Sitemap:
Priority: 0.91

categories: ["Technologie", "GitlabCI", "Kubernetes"]
authors: []
additionalblogposts: [ 'quarkus-developer-experience', 'supply-chain-security-01']
post_img: "images/blog/cicd-devx/tk-blogpost-cicd-devx-3000x2000.png"
lead: "GitLab wird in breiter Masse als beliebtes VCS Tool und Continuous Integration Tool verwendet. In diesem Beitrag möchten wir einen Erfahrungsbericht vorstellen, wie wir die Möglichkeiten der Plattform ausschöpfen, um die Developer Produktivität massgebend zu verbessern und zudem durch Automatisierung die Supply Chain Security zu erhöhen."
---


Automatisierte Code-Integration ist längst ein unverzichtbarer Bestandteil der modernen Cloud-Native Welt. Doch gerade in grossen Enterprise-Umgebungen stellt sich oft die Frage: Wie behält man den Überblick über Pipelines und Jobs, ohne dabei die Produktivität oder den Spass an der Entwicklung zu verlieren? Entwickler:innen wollen in einem initialen Setup ihren Stack für die Entwicklung einsatzbereit haben, ohne in einer ersten Phase die ganze CI/CD Landschaft aufzusetzen. Für unseren Kunden war das definierte Ziel klar: Änderungen sollen zeitnah integriert, für das Deployment bereitgestellt werden und automatisch ausgerollt werden. Durch Automatisierung wird direkt die Produktivität erhöht, bietet jedoch viel Angriffsfläche für Supply Chain Attacks. In einem früheren Blogpost haben wir die Grundlagen der Supply Chain Security, sowie Toolings und deren Wichtigkeit in modernen Umgebungen vorgestellt. Diese Grundlage haben wir weiterverwendet um unsere Supply Chain in GitLab Pipelines zu sichern.

In diesem Beitrag möchten wir unsere Erfahrungen teilen, die wir bei einem Kunden im Bankensektor gemacht haben. Das deklarierte Ziel war es eine DevSecOps Landschaft zu gestalten, die vollautomatisiert und ohne Securitybedenken auf alle Systeme mit Continuous Deployment ausrollen kann.

### DevSecOps als Motivation

Um DevSecOps zu leben und damit auch von allen Benefits von Microservicearchitekturen und agiler Entwicklungsmethode zu profitieren, muss Software zeitnah und regelmässig auf die Zielsysteme ausgerollt werden. Dies erfordert ein hohes Mass an Automatisierung und Standardisierung.
Entwickler:innen sollen sich auf ihre tägliche Tätigkeit fokussieren können und ihre Projekte mit wenig Zusatzaufwand in den CI/CD Prozess integrieren können.

### Standardisierung mit GitLab CI/CD Components

GitLab führte in Version 17.0 das Konzept der CI/CD Components ein. Diese wiederverwendbaren Templates bieten eine Möglichkeit, Pipelineelemente als Template zur Verfügung zu stellen. Diese Komponenten definieren in einer leicht zu verstehenden Templatesprache CI/CD Komponenten, die über Variablen parametrisiert in Projekten verwendet werden können. CI/CD Components können aus dem zentralen Hub (https://gitlab.com/components) bezogen werden, oder in einer eigenen Komponente gepflegt werden. In unserem Fall wurden die Komponenten selbst entwickelt, um die Kontrolle und Variabilität für projektspezifische Anforderungen gerecht zu werden.
Grundsätzlich ist eine CI/CD Component ein GitLab Repository mit einem /templates Verzeichnis. In diesem Verzeichnis liegen die Templates für die Komponenten. Eine Komponente hat folgende Struktur:

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

Dieses Template kann über den include Block in einer Pipeline integriert und parametrisiert werden:

```yaml
# other-project/.gitlab-ci.yml
stages: [verify, release]

include:
  - component: $CI_SERVER_FQDN/compnent/test@main
    inputs:
      stage: verify
```

So können Pipeline Templates über zentrale Komponenten verwaltet und gepflegt werden. Dies erhöht die Wiederverwendbarkeit und die Wartbarkeit, verringert gleichzeitig den Aufwand für neue Projekte.

### Renovate

Grundsätzlich sollen Projekte ihre Dependencies up-to-date halten. Dies bringt einen enormen Aufwand mit sich, der den meisten Entwickler:innen selten Spass bereitet und reine Fleissarbeit ist. Ein idealer Fall für eine Automatisierungslösung! Hier verwenden wir eine zentrale Renovate CI/CD Component, die verwendet werden kann, um automatisch Pullrequests mit neuen Dependencies zu erhalten. Renovate mit einem Service Account bestückt, der in andere Projekte eingeladen werden kann, um diese mit Dependency Updates zu versehen. Durch eine Autodiscovery Funktion wird Renovate alle Projekte, auf die der Service Account Zugriff hat, Pull Requests mit neuen Dependencies verfassen.
Somit haben wir schon einen wichtigen Punkt für eine sichere Pipeline erledigt.

### Signieren von Images mit Cosign

Um sicherzustellen, dass nur Images publiziert und verwendet werden, die wir auch selber gebaut haben, benötigen wir Image Signaturen. Mit dem Cosign Image bekommen wir die benötigten Binaries, die wir benötigen um Signaturen von publizierten Images zu erstellen und in der Container Registry abzulegen.

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

Mit dieser CI/CD Component können gebaute Images durch cosign signiert werden. Nachdem unsere Dependencies mit Renovate mit Updates versehen werden und unsere Images durch cosign signiert werden, widmen wir uns noch dem Deployment mit ArgoCD.

### Deployments mit dynamischen Pipelines

Das Deployment mit ArgoCD kann je nach Anzahl Umgebungen und Clustern zu einer Herausforderung werden. Um die Herausforderung mit mehreren Umgebungen und eventuell auch anderen ArgoCD Instanzen zu meistern benötigen wir ein weiteres Konstrukt: Downstream Pipelines. GitLab erlaubt es uns in der Laufzeit einer Pipeline weitere Pipelines dynamisch mit generierten gitlab-ci.yml Manifesten zu triggern.
Das zentrale Problem ist, dass Teams ihre Applikationen auf unterschiedlichen Stages in jeweils unterschiedlichen Kubernetes Umgebungen sowie ArgoCD Instanzen deployen. Die Lösung besteht darin, dass wir diese Deploymentstages während der Laufzeit der Pipeline dynamisch erzeugen und eine Child-Pipeline mit einem generierten Manifest triggern.
Das Projekt mit den zu deployenden Umgebungen besitzt ein Config File environments.yml mit den verschiedenen Umgebung und deren Parametern definiert:

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

Zudem haben wir ein Boilerplate File für die Downstream Pipeline downstream-template.yml, welches wir in der Pipeline befüllen werden:

```yaml
# downstream-template.yml
STAGE:deploy:
  image: bash
  stage: argo
  script:
    - echo "Deploying argoAPP"

```

Einfachheitshalber haben wir noch das zu befüllende Pipelinefile rendered-downstream.yml vorbereitet und nur mit der initialen Stagedefinition im Repository eingecheckt:

```yaml
# rendered-downstream.yml
stages:
  - argo

```

Die effektiv laufende Pipeline erzeugt in einer ersten Stage das resultierende Pipelinefile und erzeugt ein Artefakt daraus. Dieses Artefakt wird direkt verwendet um die Childpipelines zu erzeugen und somit die einzelnen Umgebungen zu deployen.

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

Die resultierende Pipeline erzeugt nun mit dieser Konfiguration zwei Childpipelines, die jeweils verschiedene Umgebungen deployen können. Einfachheitshalber ist die Deploymentlogik weggelassen.

{{< custom-image "../images/cicd-devx/pipeline.png" >}}
<br>

Wie wir sehen, erzeugt der erste Pipeline Job `deploy:createDownstream` das Template in der Stage `template` und in der `deploy` Stage werden durch die zwei generierten Artefakte die Downstream Pipelines erzeugt. Somit können wir dynamisch aus einer Konfigurationsmatrix Umgebungen mit verschiedenen Parametern ausrollen. Falls ihr dieses Beispiel live sehen oder testen möchtet, ihr findet es hier auf [GitLab](https://gitlab.com/g1raffi/cicd-example).

### Fazit

Mit vielen kleinen Verbesserungen kann das Potenzial der CI/CD Umgebung maximiert werden! Durch den Einsatz von CI Components werden GitLab Pipelines besser wartbar und verwaltbar. Teams können durch einfache Templates ihre gewünschten Pipeline zusammenstellen und müssen keine Entwicklungsgeschwindigkeit einbüssen. Mit Hilfe der dynamischen Downstream Pipelines von GitLab konnten komplexere Continuous Deployment Prozesse mit ArgoCD in Pipelines integriert werden.

### Können wir auch dich unterstützen

Möchtest auch du deine CI/CD Landschaft auf das nächste Level bringen oder hast du Fragen zu den verwendeten Komponenten? Dann melde dich bei uns!
