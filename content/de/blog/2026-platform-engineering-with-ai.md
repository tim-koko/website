---
title: "KI im Plattform Engineering Alltag - ein Erfahrungsbericht"
slug: "platform-engineering-with-ai"
description: ""
date: 2026-05-07T00:00:00+00:00
lastmod: 2026-05-07T00:00:00+00:00
draft: false
images: ["images/blog/ai-training/tk-blogpost-ai-training-1200x630.png"]
img_border: true
Sitemap:
  Priority: 0.9

additionalblogposts: []

categories: ["Technologie", "Künstliche Intelligenz"]
authors: ['miriam-streit']
post_img: "images/blog/ai-training/tk-blogpost-ai-training-1500x1000.png"
lead: "KI im Platform Engineering Alltag hatte mich noch nicht wirklich überzeugt: Halluzinationen wie inexistente Config Keys oder erfundene Features machten mir mehr als einmal einen Strich durch die Rechnung. Ein eintägiger Workshop hat meine Meinung geändert. Nun erzähle ich dir, mit welchen einfachen Tricks auch du deine KI-Skills im Platform Engineering Alltag aufwerten kannst."
---

### Mein knausriges Setup und die Flops

Ich hatte mir nie wirklich Zeit genommen, mich mit einem ausführlichen Setup von KI-Tools oder verschiedenen Modellen auseinanderzusetzen. Darin lag auch das Problem: Ich wusste nicht, wie ich die Tools erfolgreich einsetzen kann. In meinem Lieblings-IDE Visual Studio Code hatte ich die Copilot Integration aktiv, bei welcher ich dank meinem Studenten-Github-Pro ein paar Credits hatte. Die Modelle, die ich damals im Einsatz hatte, waren vor allem GPT-4, GPT-4o und GPT-4o-mini, mit welchen ich nicht wirklich warm wurde. Die automatischen Vorschläge im Visual Studio Code schätzte ich dafür umso mehr - die KI wusste oft schon vor mir, was für Code ich schreiben möchte. Als Chatoberflächen hatte ich vor allem ChatGPT (natürlich free) und Gemini Free im Einsatz. Wieso auch Geld ausgeben, wenn es mir nichts wirklich nützt? Ich wurde eines besseren belehrt.

Nicht überraschend war ich mit meinem Gratis-Setup unzufrieden. Das höchste der Gefühle war die Autocompletion in Visual Studio Code, die für wenige Zeilen super war und bei längeren Blöcken schnell Spaghetti-Code produzierte. In meinem Studium hatte ich zu der Zeit ein paar Module mit einfachen Web-Technologien, auf welche die damaligen Modelle bereits gut trainiert waren. Also konnte ich zumindest fürs Studium ein bisschen vibe-coden, musste aber für eine gute Qualität hinterher immer noch aufräumen. Für meine Bachelorarbeit setzte ich auf die Programmiersprache R. GPT-4o und ich waren damit überfordert. Auch beim Nischengebiet der Graphentheorie stiessen alle Modelle meines damaligen Setups schnell an ihre Grenzen, ob nur konzeptuell im Chat oder beim Coden. Immerhin kann ich nun stolz sagen, dass ich für meine Bachelorarbeit kaum KI eingesetzt habe. Damals, also vor etwas mehr als einem Jahr, konnte ChatGPT noch nicht einmal bei der Quellensuche helfen und erfand fleissig Papers und Autoren.

In meinem Arbeitsalltag als Plattform Engineer konnte ich vom KI-Hype nicht viel anwenden: Automatische Code-Vorschläge funktionierten selten komplett und benötigten viel Anpassung. Dies kommt daher, dass viel vom Kontext gar nicht als Code im Repository vorliegt. Der KI genügend Kontext zu liefern, war oftmals zeitaufwändiger, als es einfach selber zu erledigen. Wenn man sich für simple Konzepte challengen lassen wollte oder ein wenig Unterstützung benötigte, stiess das Modell entweder an seine Grenzen und begann Funktionalitäten und Config-Properties zu halluzinieren, oder es lobte die Idee in den Himmel. Mir entstand so mehr Aufwand als Nutzen. Meine Wertschätzung für "Infrastructure as Code" wuchs aber ins Unermessliche!

Auch beim Generieren von Texten blieb ich erfolgslos. Meine kläglichen Prompting-Versuche resultierten stets in viel zu langem Text, der überhaupt nicht prägnant war. Ich wollte nicht mehr mit dem Chatbot kämpfen und ihm so viel Prompt-Text liefern, wie mein ursprünglich gewünschter Text benötigt hätte.

Ja, man sollte dranbleiben, weil es ein schnell wachsendes Gebiet ist und stets Fortschritte entstehen. Da ich für mich weder Nutzen noch Fortschritt sah, hängte ich trotzdem ab. Die Umweltbelastung für erfundene Inhalte oder Texte mit vielen Worten und wenig Inhalt war mir zu schade. Meine Schlussfolgerung war: "Das funktioniert nur für SW-Entwickler richtig gut! Die KI hat nicht genügend Kontext für zusammenhängende Systeme."

### Level-Up: KI-Workshop mit Tobias Kluge

Es war sehr frustrierend, auf LinkedIn Posts von Leuten zu lesen, die richtig coole Dinge mit KI gebaut hatten, während man selber Mühe hatte, den kleinsten Nutzen zu generieren. Zum Glück konnte ich kurz nach meinem Start bei tim&koko am Workshop "[AI in Software Development](https://acend.ch/trainings/ai-dev/)" von Tobias Kluge besuchen. Auch als Ex-Entwicklerin konnte ich vom Workshop viel Nutzen mitnehmen und seither erfolgreich in meinen Arbeitsalltag integrieren. Der Workshop enthielt bei dieser Durchführung folgende Themen:

- Wie funktioniert die Visual Studio Code Integration (Copilot)?
- Wie funktionieren die verschiedenen Copilot-Modi Ask, Plan und Agent?
- Was macht ein gutes Modell aus? Welche Modelle sind geeignet für welche Aufgaben?
- Wie kann man effizienter entwickeln, als Code aus dem Chat-Fenster zu kopieren?
- Was sind die Standard-Sicherheitseinstellungen des Agenten? Was darf er, was nicht? Wie kann man sich gegen Fehler schützen?
- Wie kann man den Kontext optimal mitgeben?
- Wie optimiert man sein Code-Repository für einen Agenten?
- Wie erstellt man Skills für den Agenten?

Stellst du dir diese Fragen auch? Tobias bietet dieses Training bei [acend](https://acend.ch/) an und demnächst am [Cloud Native Zurich](https://cloudnativezurich.ch/) als ganztägigen [Workshop](https://cloudnativezurich.ch/workshop-incratec/)!

### Mehr ist mehr: mein revidiertes Setup

Ich war während des Workshops sehr positiv überrascht, wie viel besser die aktuellen (und bezahlten) Modelle und Integrationen funktionierten als das, was ich bisher gesehen hatte. Mein Setup bleibt nach wie vor simpel, aber nun kann ich viel besser damit umgehen und endlich bringt es mir Vorteile!

Neu nutze ich die bezahlte Copilot Lizenz. Claude Code zu testen, steht ebenfalls oben auf meiner To-Do-Liste. Ich habe aber auch gelernt, dass kein Modell und kein Tool besser sind, als man sie bedienen kann. Dank dem Fokus des Trainings auf Copilot kann ich nun gezielt Aufgaben mittels den verschiedenen Modi abarbeiten: Für generelle Fragen und um Ideen kritisch hinterfragen zu lassen, nutze ich den Ask Mode. Wenn ich einen ausführlichen Plan ausarbeiten will, bevor die Dateien angefasst werden, verwende ich den Plan Mode. Bei einfachen oder von mir sehr ausführlich spezifizierten Aufgaben nehme ich direkt den Agent-Mode mit den standardmässig eingerichteten Berechtigungen. So muss ich zwar zwischendurch Zugriffe auf Dokumentationen oder auf Dateien durchwinken, aber es ist mir lieber, die volle Kontrolle zu haben. Es gäbe zwar viele verschiedene Modelle bei Copilot, ich habe mich aber sehr mit Claude Sonnet 4.6 angefreundet und brauche selten ein anderes Modell. Für meine tägliche Arbeit funktioniert es wunderbar und das ist das, was zählt. Das Modell ist übrigens nur die halbe Miete: Wenn die Prompts nicht klar sind und der Kontext fehlt, halluziniert auch das beste Modell. Immer, wenn ich einen Prompt schreibe, überlege ich mir, ob ich einem Junior Engineer oder einem neuen Mitarbeiter damit auch genügend Information geben würde. Wenn nein, muss ich meinen Prompt ergänzen. Das ist ausserdem hilfreich, um mich selber zu bremsen und mich zu fragen, was ich eigentlich genau machen will. So stolpere ich oft schon über Denkfehler, bevor ich Stunden mit der Implementation verschwende.

Der Workshop war zwar auf die Softwareentwicklung ausgerichtet, aber ich kann für meinen Plattform Engineering Alltag die meisten Konzepte übertragen. Sogar meine Prompts, um mit Gemini Text zu generieren, konnte ich verfeinern, um gute Ergebnisse zu erhalten.

Wahrscheinlich könnte ich mit meinem Setup noch viel mehr machen. Soweit bin ich aber schon zufrieden, weil ich nur noch selten frustriert bin und einen echten Mehrwert erhalte. Die MCPs und truly agentic Engineering laufen mir nicht davon.

### Ein ernstes Wörtchen

Der Einsatz von KI kann Spass machen und richtigen Mehrwert bringen, trotzdem bleiben ernste Fragen offen. Nur der Nutzen rechtfertigt nicht die Umweltbelastung, die der Einsatz von KI mit sich bringt. Meine Faustregel: Wenn es sich googeln lässt, google ich es auch! Und allgemein: Wenn KI es nicht besser und schneller kann als ich, mache ich es selber. Auch der Zerfall der koginitiven Funktion ist nicht ohne. Ich versuche, die KI vor allem Aufgaben machen zu lassen, die mich langweilen, weil ich sie selber schon 100x gemacht habe und sie bereits genau verstehe. Kubernetes-Manifests könnte ich im Schlaf schreiben und kenne sie in- und auswendig, also bringt es mir nichts mehr, sie selber zu schreiben. Neue Konzepte versuche ich zuerst selber zu verstehen, bevor ich zur KI greife. Und wenn die KI sich selbst im Rabbit Hole verliert, stelle ich zuerst sicher, dass meine eigene Wissensbasis stabil ist, damit ich die KI bei der Problemlösung unterstützen kann. Murksen, bis es geht, ist mit oder ohne KI selten eine gute Lösung, das galt schon zu Stack-Overflow-Zeiten! Wenn ich nicht verstehe, was der Code macht, kann ich weder die Funktionalität verifizieren, noch kann ich sicherstellen, dass der Code sauber und sicher ist. Schlussendlich steht immer noch mein Name daneben, also muss ich für den Code geradestehen können. Horrorstories zu Sicherheitsproblemen durch KI habe ich auf LinkedIn zu Genüge gelesen.

Das Schreiben von Texten mit KI ist unglaublich hilfreich, weil es viel Zeit spart. Gleichzeitig schwindet aber die Fähigkeit, die eigenen Erfahrungen in Worte fassen und in einen attraktiven Text verwandeln zu können. Und ein Text mit einer persönlichen Stimme kommt nun einmal besser an als hundert generierte. Auch wenn das niemanden (mich eingeschlossen) davon abhält, die LinkedIn Posts weiterhin mit KI zu schreiben, sollte man es trotzdem im Hinterkopf behalten - wenn einem die Fähigkeit, zu schreiben, wichtig ist.

### Fazit

Es ist ein Trial-and-error-Prozess, was für den individuellen Arbeitsalltag gut funktioniert und was nicht. Wie bei anderen Technologien kann man nicht von sich selber erwarten, sie bereits nach einem Versuch perfekt zu beherrschen. Übung macht viel aus, nicht nur bei sich selber, sondern auch bei den Models und ihren Integrationen: Diese entwickeln sich sehr schnell weiter! Wenn man nicht immer wieder ausprobiert, merkt man nicht, was sich alles verbessert hat.

Sicherheitsbedenken und Umweltbedenken bleiben, und das wahrscheinlich noch eine lange Weile. Wenn man eine spezifische Aussage von diesem Blogpost mitnehmen möchte, soll es jene sein: Man muss immer noch verstehen, was der Agent macht, sonst kann man es nicht verifizieren (und lernt auch nichts daraus)!

### Wie auch du deine KI-Skills im Engineering-Alltag verbessern kannst

- Keep it simple: Für Anfänger reichen 1-2 Tools. Besser lernt man, einige Tools gut zu beherrschen, als alle nur halbpatzig.
- Halluzinationen vermeiden: Ich frage gerne nach einer Quelle zur Angabe, die mir komisch erscheint. Diese kann ich überprüfen, oder das Modell merkt von selber, dass es mich belogen hat.
- Aufträge für den Junior: Prompts sollen so geschrieben werden, das sie einem neuen Mitarbeiter oder einem Junior Engineer auch genügend Kontext geben würden.
- Context is King: Fehlt der Kontext, kommt eine generische Antwort, die nicht zum individuellen Fall passt.
- Dediziertes Training: Manchmal geht es besser, wenn man von jemand anderem lernen kann. Ich kann das [Training](https://acend.ch/trainings/ai-dev/) von Tobias Kluge empfehlen!
