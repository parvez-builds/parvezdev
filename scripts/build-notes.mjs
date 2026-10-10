#!/usr/bin/env node
/* =============================================================================
   Generates notes/*.md from site/data/*.js — one source of truth, two formats.
   Run:  node scripts/build-notes.mjs
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "site", "data");
const OUT = path.join(ROOT, "notes");

const FILES = ["day1.js", "day2.js", "day3.js", "day4.js", "interview.js"];

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), ctx, { filename: f });
}

const DAYS = ["JAVA_DAY_1", "JAVA_DAY_2", "JAVA_DAY_3", "JAVA_DAY_4", "JAVA_BONUS"]
  .map((k) => ctx.window[k])
  .filter(Boolean);

/* --------------------------------------------------------------- helpers */
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();

function table(t) {
  const head = "| " + t.head.map(cell).join(" | ") + " |";
  const sep = "| " + t.head.map(() => "---").join(" | ") + " |";
  const rows = t.rows.map((r) => "| " + r.map(cell).join(" | ") + " |");
  return [head, sep, ...rows].join("\n");
}

function code(c) {
  const lang = c.lang || "java";
  let out = "";
  if (c.title) out += `**${c.title}**\n\n`;
  out += "```" + lang + "\n" + c.code + "\n```\n";
  if (c.output) out += "\n<details><summary>Output</summary>\n\n```text\n" + c.output + "\n```\n\n</details>\n";
  if (c.note) out += `\n> ${c.note}\n`;
  return out + "\n";
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function anchor(t) {
  return "#" + slug(t.title);
}

/* ------------------------------------------------------------ day files */
fs.mkdirSync(OUT, { recursive: true });
const generated = [];

for (const d of DAYS) {
  const isBonus = d.id === 5;
  const num = String(d.id).padStart(2, "0");
  const name = isBonus ? "05-rapid-fire-and-hr" : `${num}-${slug(d.title)}`;
  const L = [];

  L.push(`# ${isBonus ? "Rapid Fire" : "Day " + d.id}: ${d.title}`);
  L.push("");
  L.push(`*${d.subtitle}*`);
  L.push("");
  L.push(`> **Goal.** ${d.goal}`);
  L.push("");

  const totalMin = d.topics.reduce((n, t) => n + (t.minutes || 0), 0);
  const nCards = d.topics.reduce((n, t) => n + (t.flashcards || []).length, 0);
  const nQuiz = d.topics.reduce((n, t) => n + (t.quiz || []).length, 0);
  L.push(
    `**${d.topics.length} topics** · **${nCards} flashcards** · **${nQuiz} quiz questions** · **~${Math.round((totalMin / 60) * 10) / 10} hours** of study`
  );
  L.push("");

  if (d.dayPlan) {
    L.push("## Schedule");
    L.push("");
    d.dayPlan.forEach((p) => L.push(`- ${p}`));
    L.push("");
  }

  L.push("## Contents");
  L.push("");
  d.topics.forEach((t, i) => {
    L.push(`${i + 1}. [${t.title}](${anchor(t)}) <sub>${t.tag || ""} · ${t.minutes || "?"} min</sub>`);
  });
  L.push("");
  L.push("---");
  L.push("");

  for (const t of d.topics) {
    L.push(`## ${t.title}`);
    L.push("");
    L.push(`<sub>${t.tag || "Core"} · ${t.minutes || "?"} min</sub>`);
    L.push("");
    L.push(t.body);
    L.push("");

    if (t.bullets?.length) {
      L.push("### Key points");
      L.push("");
      t.bullets.forEach((b) => L.push(`- ${b}`));
      L.push("");
    }

    if (t.table) {
      L.push("### Reference");
      L.push("");
      L.push(table(t.table));
      L.push("");
    }

    if (t.code?.length) {
      L.push("### Code");
      L.push("");
      t.code.forEach((c) => L.push(code(c)));
    }

    if (t.pitch) {
      L.push("> **Say it like this in the interview.** " + t.pitch);
      L.push("");
    }

    if (t.flashcards?.length) {
      L.push("<details><summary><b>Flashcards (" + t.flashcards.length + ")</b> — click to reveal answers</summary>");
      L.push("");
      t.flashcards.forEach((c, i) => {
        L.push(`**Q${i + 1}.** ${c.q}`);
        L.push("");
        L.push(`<details><summary>Answer</summary>`);
        L.push("");
        L.push(c.a);
        L.push("");
        L.push("</details>");
        L.push("");
      });
      L.push("</details>");
      L.push("");
    }

    if (t.quiz?.length) {
      L.push("<details><summary><b>Quiz (" + t.quiz.length + ")</b> — click to reveal answers</summary>");
      L.push("");
      t.quiz.forEach((q, i) => {
        L.push(`**Q${i + 1}.** ${q.q}`);
        L.push("");
        if (q.code) L.push("```java\n" + q.code + "\n```\n");
        q.options.forEach((o, j) => {
          L.push(`- ${j === q.answer ? "**" : ""}${String.fromCharCode(65 + j)}. ${o}${j === q.answer ? "**  ✔" : ""}`);
        });
        L.push("");
        L.push(`<details><summary>Why</summary>`);
        L.push("");
        L.push(q.explain);
        L.push("");
        L.push("</details>");
        L.push("");
      });
      L.push("</details>");
      L.push("");
    }

    L.push("---");
    L.push("");
  }

  const file = path.join(OUT, name + ".md");
  fs.writeFileSync(file, L.join("\n"));
  generated.push({ file: name + ".md", day: d, topics: d.topics.length, cards: nCards, quiz: nQuiz });
  console.log("wrote", name + ".md", `(${d.topics.length} topics)`);
}

/* --------------------------------------------------------- cheat sheet */
{
  const L = [];
  L.push("# Cheat Sheet — last thing you read");
  L.push("");
  L.push("The one-page version of everything in this course. Read it the morning of the interview.");
  L.push("");
  L.push("## The 40-second answers");
  L.push("");
  const pitches = DAYS.flatMap((d) => d.topics).filter((t) => t.pitch);
  pitches.forEach((t) => {
    L.push(`**${t.title}** — ${t.pitch.replace(/^"|"$/g, "")}`);
    L.push("");
  });
  L.push("---");
  L.push("");
  L.push("## All flashcards");
  L.push("");
  DAYS.forEach((d) => {
    const dayLabel = d.id === 5 ? "Rapid Fire" : "Day " + d.id;
    L.push(`### ${dayLabel} — ${d.title}`);
    L.push("");
    d.topics.forEach((t) => {
      if (!t.flashcards?.length) return;
      L.push(`**${t.title}**`);
      L.push("");
      t.flashcards.forEach((c) => {
        L.push(`- **${c.q}** ${c.a}`);
      });
      L.push("");
    });
  });
  fs.writeFileSync(path.join(OUT, "06-cheatsheet.md"), L.join("\n"));
  console.log("wrote 06-cheatsheet.md");
}

/* -------------------------------------------------------- notes index */
{
  const L = [];
  L.push("# Notes");
  L.push("");
  L.push("Generated from `site/data/*.js` by `node scripts/build-notes.mjs` — the same source the");
  L.push("[interactive site](../site/) reads. Edit the data, re-run the script, both formats update.");
  L.push("");
  L.push("| # | File | Topics | Cards | Quiz |",
    "| --- | --- | --- | --- | --- |");
  generated.forEach((g, i) => {
    L.push(`| ${i + 1} | [${g.file}](./${g.file}) | ${g.topics} | ${g.cards} | ${g.quiz} |`);
  });
  L.push(`| — | [06-cheatsheet.md](./06-cheatsheet.md) | all | all | — |`);
  L.push("");
  L.push("**How to study these:** read a topic, close the file, and try to say the answer out loud.");
  L.push("Then open the Flashcards section and check yourself. Reading without retrieving is");
  L.push("the single biggest waste of your four days.");
  L.push("");
  fs.writeFileSync(path.join(OUT, "README.md"), L.join("\n"));
  console.log("wrote notes/README.md");
}

/* ------------------------------------------------------------- summary */
const allTopics = DAYS.flatMap((d) => d.topics);
const totals = {
  topics: allTopics.length,
  cards: allTopics.reduce((n, t) => n + (t.flashcards || []).length, 0),
  quiz: allTopics.reduce((n, t) => n + (t.quiz || []).length, 0),
  code: allTopics.reduce((n, t) => n + (t.code || []).length, 0),
  tables: allTopics.filter((t) => t.table).length
};
console.log("\nTotals:", JSON.stringify(totals));
fs.writeFileSync(
  path.join(OUT, ".totals.json"),
  JSON.stringify({ ...totals, generated: generated.map((g) => g.file) }, null, 2)
);
