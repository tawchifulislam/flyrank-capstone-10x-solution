# My 10x Solution - Tawchiful Islam

Working name: TopicMap

## The problem

Someone who wants to start a programming language topic, such as JavaScript closures, Python decorators or SQL joins, does not know where to begin. They open many tabs, read scattered tutorials, and still do not know what to learn first, what to skip, and what comes next. Beginners lose the first hour just deciding on a path, and many give up before they start.

## Who has this problem

Complete beginners who are starting a new programming topic today, and self-taught learners who want a clear order of steps instead of random videos.

## The 10x claim

Finding a clear, beginner-safe learning path for one topic takes about 1 hour of searching today. With TopicMap it takes about 30 seconds: type the topic name, get a step-by-step breakdown map. The real before and after numbers will be measured and added later.

## What the user gets

A fixed-structure breakdown for any topic you type:

1. What you must know first
2. Core ideas in learning order, each with one line on why it matters
3. A first small practice project
4. Common beginner mistakes
5. Estimated time per step

## Concepts (5 from the program, 0 swaps)

| Concept | Where it lives in the solution |
| --- | --- |
| API endpoints | POST /breakdown takes a topic, GET /topics/:slug returns a saved map |
| LLM integration | One narrow job: turn a topic into a fixed JSON map, with schema validation, retries and a cost log |
| Database | Every generated map is saved and survives a restart |
| Caching | The same topic asked again is returned from the database with no new LLM call |
| Reporting (PDF) | Any map can be downloaded as a PDF roadmap |

## Core feature list (5 features max)

1. Submit a topic and receive a structured breakdown map
2. Validate the LLM output against a fixed schema
3. Save and reuse maps by topic
4. Cost and call log for every LLM request
5. Download a map as PDF

## Non-goal

No user accounts, no course or video content, no mobile app, and no fancy graph visuals. The map is a clean tree of text.

## Future ideas

Login with learning progress ticks, more output formats, a simple web page for the map.
