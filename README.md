# parvezdev — Java Interview Crash Course

A 4-day Java + Full Stack revision course, built for one specific situation: **you learned Java, forgot most of it, and have an interview in four days.**

Two formats, one source of truth:

| | What it is | Where |
| --- | --- | --- |
| **Interactive site** | Day-by-day modules with flashcards, quizzes, progress tracking and search | [`site/`](./site) — open `index.html`, or run the server below |
| **Markdown notes** | The same content as readable `.md` files (great on your phone) | [`notes/`](./notes) |

**45 topics · 363 flashcards · 207 quiz questions · 164 code examples · 25 reference tables**

---

## Run the site

```bash
cd site && python3 -m http.server 8000
# then open http://localhost:8000
```

No build step, no npm install, no dependencies. `site/index.html` also works if you just double-click it.

Regenerate the notes after editing any content:

```bash
node scripts/build-notes.mjs
```

---

## The 4-day plan

| Day | Focus | Why this order |
| --- | --- | --- |
| **1** | Core Java — syntax, types, arrays, strings, I/O, stack/heap | Shake off the rust. Nothing later makes sense if `String` and pass-by-value are fuzzy. |
| **2** | OOP, Collections, Exceptions, Generics | The heaviest day, and where fresher rounds are actually won. |
| **3** | Streams, concurrency, JDBC, design patterns, modern Java 8–17 | Separates you from candidates who stopped at Java 7. |
| **4** | Spring Boot, JPA/Hibernate, REST, SQL, plus your project pitch | The full-stack round and the "tell me about your project" round. |
| **+** | Rapid Fire — output traps, HR questions, one-minute answers | Final 24 hours. |

Each day is ~4–7 hours of focused work. Every topic carries a time estimate so you can see where your hours are going.

---

## How to actually use this in 4 days

**Test yourself before you read.** Open a topic's quiz first. Getting a question wrong makes the explanation stick in a way that reading alone never does. This is the single highest-leverage thing on the list.

**Say it out loud.** Every topic ends with a box marked *"Say it like this in the interview"* — a scripted 2–3 sentence answer. Reading it silently is not studying. Stand up and say it.

**Type the code, don't skim it.** Your hands remember what your eyes slide past.

**Days 1 and 2 are non-negotiable.** If you run out of time, cut from Day 3's concurrency depth or Day 4's microservices section. Do not cut Collections, OOP or exceptions.

**Practise the project pitch out loud, three times.** For a fresher it's the highest-leverage question in the whole interview, and almost nobody rehearses it. There's a 45-second script in Day 4.

---

## What's covered

<details>
<summary><b>Day 1 — Core Java</b></summary>

JDK/JRE/JVM and bytecode · the `main` signature · primitives, wrappers, autoboxing · the Integer cache trap · type promotion and casting · operators and precedence · `switch` (classic, arrow, expression) · labelled break · arrays and `Arrays` utilities · **String immutability and the string pool** · StringBuilder vs StringBuffer · `==` vs `equals()` · Scanner vs BufferedReader · printf formatting · **stack vs heap and pass-by-value** · packages and access modifiers · `static` and initialisation order · varargs and enums
</details>

<details>
<summary><b>Day 2 — OOP, Collections, Exceptions, Generics</b></summary>

The four pillars with real examples · composition over inheritance · constructors, `this`/`super`, chaining · **overloading vs overriding** · covariant returns and access rules · abstract class vs interface · default/static/private interface methods · functional interfaces · `equals`/`hashCode` contract · shallow vs deep copy · exception hierarchy · checked vs unchecked · `finally` return gotchas · try-with-resources · exception chaining · **Collections hierarchy** · ArrayList vs LinkedList · HashSet/LinkedHashSet/TreeSet · **HashMap internals** (buckets, treeify, load factor) · ConcurrentHashMap · fail-fast vs fail-safe · Comparable vs Comparator · **generics, wildcards and PECS** · type erasure
</details>

<details>
<summary><b>Day 3 — Modern Java, Concurrency, JDBC, Patterns</b></summary>

Lambdas and method references · effectively final · **Streams API** (laziness, intermediate vs terminal, Collectors, groupingBy, parallel) · Optional · `java.time` · Java 9–17 (records, sealed classes, `var`, text blocks, pattern matching, switch expressions) · threads, lifecycle, `sleep` vs `wait` · **synchronized vs volatile** · deadlock and how to prevent it · wait/notify producer–consumer · ReentrantLock, atomics · **ExecutorService and thread pools** · CompletableFuture · concurrent collections, latches and barriers · NIO.2 file I/O · serialization · **JDBC** (PreparedStatement, SQL injection, transactions, pooling) · Singleton, Builder, Factory, Strategy, Template Method
</details>

<details>
<summary><b>Day 4 — Full Stack</b></summary>

IoC and DI · constructor injection · bean scopes and stereotypes · **Spring Boot auto-configuration** · starters · profiles · `@ConfigurationProperties` · the DispatcherServlet request pipeline · REST mapping annotations · **DTOs and why not to return entities** · validation · `@RestControllerAdvice` · status codes · JPA vs Hibernate vs Spring Data · entity relationships · lazy vs eager · **the N+1 problem** · `@Transactional` and dirty checking · `LazyInitializationException` · SQL joins, `WHERE` vs `HAVING`, indexes, window functions · Maven lifecycle and scopes · Spring Security and JWT · JUnit 5 and Mockito · microservices trade-offs · **the 45-second project pitch**
</details>

<details>
<summary><b>Rapid Fire — final 24 hours</b></summary>

Output-prediction traps (strings, numbers, OOP dispatch, initialisation order, `finally`) · 40 one-minute verbal answers · ten HR questions with model angles · STAR story templates · the last-24-hours schedule · a one-page cheat sheet
</details>

---

## Repository layout

```
site/
  index.html          the app shell
  styles.css          dark/light theme, responsive, print-friendly
  app.js              rendering, flashcards, quizzes, search, progress (localStorage)
  data/day1.js        ─┐
  data/day2.js         │ course content, plain JS objects
  data/day3.js         │ (the single source of truth)
  data/day4.js         │
  data/interview.js   ─┘
notes/                generated markdown — run scripts/build-notes.mjs
scripts/
  build-notes.mjs     turns site/data/*.js into notes/*.md
```

Progress (topics completed, quiz scores, theme, last position) is stored in your
browser's `localStorage` — nothing leaves your machine, and there's no backend.

---

## If you only have 6 hours

Read these and nothing else:

1. **Strings, Immutability & the String Pool** (Day 1)
2. **Stack, Heap & Pass-by-Value** (Day 1)
3. **Overloading vs Overriding** (Day 2)
4. **Object Methods & the equals/hashCode Contract** (Day 2)
5. **Exception Handling** (Day 2)
6. **Map & HashMap Internals** (Day 2)
7. **Streams API** (Day 3)
8. **Synchronization, volatile & Deadlock** (Day 3)
9. **JPA & Hibernate** (Day 4)
10. **Explaining Your Project** (Day 4)

Then run the Rapid Fire output traps until you stop missing them.
