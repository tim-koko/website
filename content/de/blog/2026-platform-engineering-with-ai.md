---
title: "From Zero to Hero: Wie ich mich doch noch mit Agentic Engineering anfreunden konnte - ein Erfahrungsbericht"
slug: "platform-engineering-with-ai"
description: ""
date: 2026-03-26T00:00:00+00:00
lastmod: 2026-03-26T00:00:00+00:00
draft: true
images: ["images/blog/TODO"]
img_border: true
Sitemap:
  Priority: 0.9

additionalblogposts: []

categories: ["Technologie", "Agentic Engineering"]
authors: ['miriam-streit']
post_img: "images/blog/TODO"
lead: "KI im Platform Engineering Alltag hatte mich noch nicht wirklich überzeugt: Halluzinationen wie inexistente Config Keys oder erfundene Features machten mir mehr als einmal einen Strich durch die Rechnung. Ein eintägiger Workshop hat meine Meinung geändert. Nun erzähle ich dir, mit welchen einfachen Tricks auch du deine KI-Skills im Platform Engineering Alltag aufwerten kannst."
---

# TODO: Bild, Titel, Untertitel, Lead Text, Kategorien, Slug?
### Mein bisheriges Setup
- VS Code mit Copilot Integration (free models)
- ChatGPT free / pro
- Gemini free
- Gizgnäpper

### meine Erfahrungen
- simple Coding Projekte: super Auto-Codevorschläge in VS-Code - hat geschrieben, bevor ich selber wusste, dass ich genau das schreiben will. Längere Blöcke von Code waren eher spaghetti
- Studium-Projekte: "Wie viel kann ich vibe coden, ohne dass die Qualität leidet?" -> nicht so viel. hat sich aber kontinuierlich verbessert
- Bachelor-Arbeit: KI kann nicht gut R, und ist bei fortgeschrittenen Graph-Theory Konzepten kein Hirsch. Musste alles von Hand machen :( Quellen finden konnte ChatGPT auch nicht.
- Arbeitsalltag als Plattform Engineer:
    - Auto-Codevorschläge funktionierten selten komplett und benötigten viel Anpassung, da nicht der komplette benötigte Kontext als Code im Repository vorlag
    - simple Konzepte konnte man mit dem Chatbot diskutieren, bei komplexeren Konzepten begann er zu halluzinieren
    - Konfigurations-Properties wurden erfunden
- schlussendlich benutzte ich kaum noch KI. Die Wasserverschwendung für erfundene Inhalte oder leere Textblöcke war mir zu schade.
-> meine Schlussfolgerung: "Das funktioniert nur für SW-Entwickler richtig gut! Die KI hat nicht genügend Kontext für zusammenhängende Systeme."

### Der Gamechanger: SWAI Workshop mit Tobias Kluge
- Wie funktioniert die VS-Code Integration (Copilot) (war vorher schon VS-Code Nutzer)
- Ask, Plan, Agent
- was macht ein gutes Modell aus? bezahlt vs. free
- Kein Copy-Paste mehr zwischen Chat und Code
- was darf der Agent by default, was nicht? Wie schütze ich mich gegen Fehler?
- Context is King! Wie gibt man den Context richtig mit.
- Wie optimiert man sein Code-Repository für einen Agenten

### mein revidiertes Setup
- Copilot + bezahlte Lizenz aktiv im Einsatz via Github
- konkrete Fragen / Aufgaben via Chat, im Agent oder Plan Modus bearbeitet
- besseres Modell
- Kontext besser eingegrenzt
- noch kein Fancy Zeug wie MCP (gibt es auch noch nicht so für meine Anwendungsfälle?)
- Zeitersparnis / Erfolg

### meine revidierten Erfahrungen
- erst seit zwei Wochen

### Fazit
- Es ist ein Herausfinden, was gut funktioniert und was nicht. Nicht beim ersten Flop frustriert aufgeben ;)
- immer wieder ausprobieren, ob es besser geht. Models und ihre Integrationen entwickeln sich schnell weiter.
- Security- und Umweltbedenken bleiben!
- man muss immer noch verstehen, was der Agent macht, sonst kann man es nicht verifizieren (und lernt auch nichts draus)


### Wie auch du deine KI-Skills im Engineering-Alltag verbessern kannst
- nimm am SWAI Training / TechLab / Workshop teil ;)



