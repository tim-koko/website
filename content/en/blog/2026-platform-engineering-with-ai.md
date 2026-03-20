---
title: "AI in Platform Engineering Day-To-Day Work - A Field Report"
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

categories: ["Technology", "Artificial Intelligence"]
authors: ['miriam-streit']
post_img: "images/blog/ai-training/tk-blogpost-ai-training-1500x1000.png"
lead: "AI in my platform engineering day-to-day work hadn't really convinced me yet: hallucinations like non-existent configuration keys or invented features threw a wrench in my plans more than once. A one-day workshop changed my mind. Now I'll tell you what simple tricks you can use to upgrade your AI skills in your platform engineering daily life."
---

### My Frugal Setup and the Flops

I had never really taken the time to set up AI tools properly or to explore different models. That was also the problem: I didn't know how to use these tools successfully. In my favorite IDE, Visual Studio Code, I had activated the Copilot integration, for which I had a few credits thanks to my student GitHub Pro account. The models I used back then were mainly GPT-4, GPT-4o and GPT-4o-mini, which I never really warmed up to. The automatic suggestions in Visual Studio Code, however, I appreciated all the more — the AI often already knew what code I wanted to write before I did. For chat interfaces, I mainly used ChatGPT (free, of course) and Gemini Free. Why spend money if it doesn't really help me? Spoiler: I was wrong.

Not surprisingly, I was dissatisfied with my free setup. The pinnacle was the autocompletion in Visual Studio Code, which was great for a few lines but quickly produced spaghetti code for longer blocks. In my studies at the time, I had a few modules with simple web technologies that the models of the time were already well-trained on. So at least for my studies, I could do a bit of vibe-coding, but still had to clean up afterwards for good quality. For my bachelor's thesis, I used the programming language R. GPT-4o and I were both overwhelmed by it. And in niche areas like graph theory, all the models quickly hit their limits, whether discussing concepts in chat or writing actual code. At least I can now proudly say that I'd hardly used AI for my bachelor's thesis. Back then, just over a year ago, ChatGPT couldn't even help find sources and happily invented papers and authors.

In my daily work as a platform engineer, I couldn't apply much from the AI hype: automatic code suggestions rarely worked completely and required a lot of adjustment. This is because much of the context isn't present as code in the repository. Providing the AI with sufficient context was often more time-consuming than just doing it myself. When I wanted to be challenged on simple concepts or needed a little support, the model either hit its limits and started hallucinating features and configuration properties, or it laid the praise on so thick it was useless. This ended up being more trouble than it was worth for me. My appreciation for "Infrastructure as Code" grew immensely, though!

Even when it came to generating text, I had no luck. My poor prompting attempts always resulted in text that was far too long and not concise at all. I didn't want to keep fighting with the chatbot and feeding it as much prompt text as my originally desired text would have required.

Yes, you should stick with it because it's a rapidly growing field with constant progress. Since I saw neither benefit nor progress for myself, I disengaged anyway. The environmental impact for invented content or texts with many words and little substance felt too wasteful to me. My conclusion was: "This really only works well for software developers! The AI doesn't have enough context for interconnected systems."

### Level-Up: AI Workshop with Tobias Kluge

It was very frustrating to read LinkedIn posts of people who had built really cool things with AI, while I myself was struggling to get any value out of it. Fortunately, shortly after starting at tim&koko, I was able to attend the "[AI in Software Development](https://acend.ch/trainings/ai-dev/)" workshop by Tobias Kluge. Even as a former developer, I was able to take a lot of value from the workshop and have since successfully integrated it into my daily work. The session I attended covered the following topics:

- How does the Visual Studio Code integration (Copilot) work?
- How do the different Copilot modes Ask, Plan, and Agent work?
- What makes a good model? Which models are suitable for which tasks?
- How can you develop more efficiently than copying code from the chat window?
- What are the default security settings of the agent? What is it allowed to do, and what isn't? How can you protect yourself against errors?
- How can you optimally provide context?
- How do you optimize your code repository for an agent?
- How do you create skills for the agent?

Do you ask yourself these questions too? Tobias offers this training at [acend](https://acend.ch/) and soon at [Cloud Native Zurich](https://cloudnativezurich.ch/) as a full-day [workshop](https://cloudnativezurich.ch/workshop-incratec/)!

### More is More: My Revised Setup

I was very pleasantly surprised during the workshop to see how much better the current (and paid) models and integrations worked compared to what I had seen before. My setup remains simple, but now I can handle it much better and finally it brings me real advantages!

I now use the paid Copilot license. I haven't gotten around to trying Claude Code yet, but it's high on my list. But I've also learned that even the best model or tool is only as good as your ability to use it. Thanks to the training's focus on Copilot, I can now work through tasks using the different modes: For general questions and having ideas critically reviewed, I use Ask Mode. When I want to work out a detailed plan before files are touched, I use Plan Mode. For simple tasks or tasks I've specified very thoroughly, I go directly to Agent Mode with the default permissions set up. This means I occasionally have to approve access to documentation or files, but I prefer having full control. There are many different models in Copilot, but I've become very fond of Claude Sonnet 4.6 and rarely use another model. It works wonderfully for my daily work and that's what counts. The model is only half the story, though: if prompts aren't clear and context is missing, even the best model will hallucinate. Whenever I write a prompt, I ask myself whether I would be giving a junior engineer or a new employee enough information. If not, I need to supplement my prompt. This is also helpful for slowing myself down and asking what exactly I want to do. This way I often stumble upon flawed thinking before I waste hours on implementation.

The workshop was geared towards software development, but I can transfer most concepts to my platform engineering day-to-day work. Even my prompts for generating text with Gemini could be refined to get good results.

I could probably do much more with my setup. But I'm already satisfied because I'm only rarely frustrated and get real added value. MCPs and truly agentic engineering aren't going anywhere.

### A Serious Word

Using AI can be fun and bring real value, yet serious questions remain. The benefit alone does not justify the environmental impact that using AI brings with it. My rule of thumb: If it can be googled, I will google it! And in general: If AI can't do it better and faster than me, I'll do it myself. The decline of cognitive function also is no small matter. I try to let AI mainly do tasks that bore me because I've already done them 100 times and understand them perfectly. I could write Kubernetes manifests in my sleep and know them inside and out, so there's no longer any point in writing them myself. For new concepts, I try to understand them myself first before reaching for AI. And when the AI loses itself in a rabbit hole, I first make sure my own knowledge base is solid so I can support the AI in problem-solving. Muddling through until it works is rarely a good solution with or without AI — that was true back in the Stack Overflow days too! If I don't understand what the code does, I can neither verify the functionality, nor can I ensure that the code is clean and secure. In the end, my name is still on it, so I need to be able to stand behind the code. I've read enough horror stories about security problems caused by AI on LinkedIn.

Writing texts with AI is incredibly helpful because it saves a lot of time. At the same time, however, the ability to put your own experiences into words and turn them into an engaging piece diminishes. And a text with a personal voice comes across better than a hundred generated ones. Even if that doesn't stop anyone (myself included) from continuing to write LinkedIn posts with AI, you should still keep it in mind — if the ability to write is important to you.

### Conclusion

It's a trial-and-error process to find out what works well for your individual daily work and what doesn't. As with other technologies, you can't expect to master them perfectly after just one try. Practice matters a lot, not just for yourself, but also for the models and their integrations: These are developing very rapidly! If you don't keep trying things out, you won't notice everything that has improved.

Security concerns and environmental concerns remain, and probably will for quite some time. If you want to take one specific message from this blog post, let it be this: You still have to understand what the agent is doing, otherwise you can't verify it (and won't learn anything from it either)!

### How You Too Can Improve Your AI Skills in Your Engineering Daily Life

- Keep it simple: For beginners, 1-2 tools are enough. It's better to learn to master a few tools well than to use all of them only half-heartedly.
- Avoid hallucinations: I like to ask for a source for information that seems odd to me. That way I can verify it myself, or the model itself realizes it was wrong.
- Instructions for the junior: Prompts should be written so that they would give a new employee or junior engineer enough context too.
- Context is King: Without context, you get a generic answer that doesn't fit the individual case.
- Dedicated training: Sometimes it works better when you can learn from someone else. I can recommend the [training](https://acend.ch/trainings/ai-dev/) by Tobias Kluge!
