#!/usr/bin/env node
/* Prints the whole course as JSON on stdout — the bridge between the
   JS content source and the Python PDF builder.
   Run: node scripts/export-json.mjs > course.json            */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "site", "data");

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["day1.js", "day2.js", "day3.js", "day4.js", "interview.js"]) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), ctx, { filename: f });
}

const days = ["JAVA_DAY_1", "JAVA_DAY_2", "JAVA_DAY_3", "JAVA_DAY_4", "JAVA_BONUS"]
  .map((k) => ctx.window[k])
  .filter(Boolean)
  .map((d) => ({
    id: d.id,
    title: d.title,
    subtitle: d.subtitle,
    goal: d.goal,
    dayPlan: d.dayPlan || [],
    topics: d.topics.map((t) => ({
      id: t.id,
      title: t.title,
      minutes: t.minutes || 0,
      tag: t.tag || "",
      body: t.body || "",
      bullets: t.bullets || [],
      table: t.table || null,
      code: (t.code || []).map((c) => ({
        title: c.title || "",
        lang: c.lang || "java",
        code: c.code || "",
        output: c.output || null,
        note: c.note || null
      })),
      pitch: t.pitch || "",
      flashcards: (t.flashcards || []).map((c) => ({ q: c.q, a: c.a })),
      quiz: (t.quiz || []).map((q) => ({
        q: q.q,
        code: q.code || null,
        options: q.options || [],
        answer: q.answer,
        explain: q.explain || ""
      }))
    }))
  }));

process.stdout.write(JSON.stringify(days));
