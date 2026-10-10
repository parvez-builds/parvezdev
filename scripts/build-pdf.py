#!/usr/bin/env python3
"""Renders the course to PDF using the same data the site and notes use.

    python3 scripts/build-pdf.py

Requires:  pip install markdown xhtml2pdf
Outputs:   pdf/*.pdf
"""
import html
import json
import os
import re
import subprocess
from pathlib import Path
import sys

from xhtml2pdf import pisa
from xhtml2pdf.config.resources import ResourceAccessPolicy, use_policy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT_DIR = os.path.join(ROOT, "scripts")
OUT_DIR = os.path.join(ROOT, "pdf")
FONT_DIR = "/usr/share/fonts/truetype/dejavu"

# ----------------------------------------------------------------- fonts
# xhtml2pdf keeps its OWN font registry (context.fontList); registering with
# reportlab's pdfmetrics alone is not enough — the family has to arrive via a
# CSS @font-face rule, otherwise it silently falls back to Helvetica (which
# has no glyphs for ->, the box-drawing characters or the em dash).
HAVE_DEJAVU = os.path.isdir(FONT_DIR)


def font_face_css():
    if not HAVE_DEJAVU:
        return "/* DejaVu not found; falling back to built-in fonts */"
    d = FONT_DIR
    return "\n".join([
        f'@font-face {{ font-family: dj; src: url("{d}/DejaVuSans.ttf"); }}',
        f'@font-face {{ font-family: dj; src: url("{d}/DejaVuSans-Bold.ttf"); '
        f"font-weight: bold; }}",
        f'@font-face {{ font-family: djmono; src: url("{d}/DejaVuSansMono.ttf"); }}',
        f'@font-face {{ font-family: djmono; '
        f'src: url("{d}/DejaVuSansMono-Bold.ttf"); font-weight: bold; }}',
    ])


BASE = "dj" if HAVE_DEJAVU else "Helvetica"
MONO = "djmono" if HAVE_DEJAVU else "Courier"

# ------------------------------------------------------------- markdown
def md(s):
    """Inline markdown: `code` and **bold**, HTML-escaped."""
    s = html.escape(str(s or ""), quote=False)
    s = re.sub(r"`([^`]+)`", r'<code>\1</code>', s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    return s


def wrap_code(text, width=94, indent="    "):
    """Soft-wrap long code lines so they never run off the page."""
    out = []
    for line in text.split("\n"):
        if len(line) <= width:
            out.append(line)
            continue
        # keep leading whitespace of the original line
        lead = line[:len(line) - len(line.lstrip())]
        cur, limit = lead, width
        for word in line.split():
            candidate = (cur + " " + word) if cur.strip() else (lead + word)
            if len(candidate) > limit:
                out.append(cur)
                cur = lead + indent + word
                limit = width + len(indent)
            else:
                cur = candidate
        out.append(cur)
    return "\n".join(out)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")


# ------------------------------------------------------------------ css
CSS = font_face_css() + f"""
@page {{
  size: A4 portrait;
  margin: 2.0cm 1.6cm 1.9cm 1.6cm;
  @frame footer {{
    -pdf-frame-content: footerContent;
    left: 1.6cm; right: 1.6cm; bottom: 0.7cm; height: 0.9cm;
  }}
}}
body {{ font-family: {BASE}; font-size: 9.5pt; line-height: 1.45; color: #1a1a1a; }}
#footerContent {{ font-family: {BASE}; font-size: 7.5pt; color: #777;
  border-top: 0.4pt solid #ccc; padding-top: 3pt; text-align: center; }}

h1 {{ font-size: 20pt; margin: 0 0 6pt 0; color: #111; }}
h2 {{ font-size: 15pt; margin: 0 0 4pt 0; color: #111;
      border-bottom: 1.2pt solid #d97706; padding-bottom: 3pt; }}
h3 {{ font-size: 11pt; margin: 12pt 0 4pt 0; color: #333; }}
h4 {{ font-size: 9.5pt; margin: 9pt 0 3pt 0; color: #444; }}
p  {{ margin: 0 0 6pt 0; }}
a  {{ color: #1d6fd8; text-decoration: none; }}
code {{ font-family: {MONO}; font-size: 8pt; background: #f0f2f5;
       padding: 0 1.5pt; border-radius: 2pt; }}
strong {{ font-weight: bold; }}
sub, .meta {{ font-size: 7.5pt; color: #777; }}

.cover {{ page-break-after: always; text-align: center; padding-top: 4cm; }}
.cover h1 {{ font-size: 30pt; margin-bottom: 4pt; color: #d97706; }}
.cover .sub {{ font-size: 13pt; color: #555; margin-bottom: 2.2cm; }}
.cover .stats {{ font-size: 10.5pt; color: #333; margin-bottom: 1.6cm; }}
.cover .box {{ text-align: left; border: 0.8pt solid #d97706; padding: 12pt 14pt;
  font-size: 9pt; }}

.day.nobreak {{ page-break-before: avoid; }}
.day {{ page-break-before: always; }}
.dayhead h2 {{ font-size: 19pt; }}
.goal {{ background: #fff7ed; border-left: 3pt solid #d97706; padding: 7pt 10pt;
         margin: 8pt 0 10pt 0; font-size: 9pt; }}
.plan {{ font-size: 8.5pt; color: #444; margin: 0 0 6pt 18pt; padding: 0; }}

.toc {{ font-size: 9pt; }}
.toc ol {{ margin: 3pt 0 10pt 16pt; padding: 0; }}
.toc li {{ margin: 1.5pt 0; }}

.topic {{ page-break-inside: avoid; margin-top: 14pt;
          border-top: 0.8pt solid #e2e2e2; padding-top: 8pt; }}
.topic-title {{ font-size: 12.5pt; font-weight: bold; color: #111; margin: 0 0 2pt 0; }}
.tag {{ font-size: 7pt; font-weight: bold; padding: 1pt 5pt; border-radius: 6pt;
        background: #f3f0ff; color: #6d28d9; }}
.tag.must {{ background: #fef3c7; color: #92400e; }}
.tag.trap {{ background: #fee2e2; color: #991b1b; }}
.tag.core {{ background: #dbeafe; color: #1e40af; }}
.tag.plan {{ background: #d1fae5; color: #065f46; }}

ul.bullets {{ margin: 4pt 0 6pt 14pt; padding: 0; }}
ul.bullets li {{ margin: 2.5pt 0; }}

table {{ width: 100%; border-collapse: collapse; font-size: 7.8pt;
        margin: 4pt 0 8pt 0; page-break-inside: avoid; }}
th {{ background: #f1f3f6; font-weight: bold; text-align: left;
     border: 0.4pt solid #c9cfd8; padding: 3.5pt 5pt; }}
td {{ border: 0.4pt solid #dde1e7; padding: 3.5pt 5pt; vertical-align: top; }}
td:first-child {{ font-weight: bold; }}

pre {{ font-family: {MONO}; font-size: 7.4pt; line-height: 1.35; background: #f6f8fa;
      border-left: 2.5pt solid #d97706; padding: 6pt 8pt; margin: 5pt 0 7pt 0;
      page-break-inside: avoid; white-space: pre; }}
.code-title {{ font-size: 8.5pt; font-weight: bold; color: #444; margin: 7pt 0 0 0; }}
.out {{ font-family: {MONO}; font-size: 7.6pt; color: #0f5132; background: #eef7f1;
       padding: 4pt 8pt; margin: 0 0 6pt 0; white-space: pre;
       page-break-inside: avoid; }}
.note {{ font-size: 8.4pt; background: #fffbeb; border-left: 2.5pt solid #f59e0b;
        padding: 5pt 8pt; margin: 0 0 7pt 0; }}

.pitch {{ background: #fff7ed; border: 0.6pt solid #fcd34d; padding: 7pt 10pt;
         margin: 8pt 0 8pt 0; font-size: 8.8pt; }}
.pitch .lbl {{ font-weight: bold; font-size: 7.5pt; color: #92400e;
              text-transform: uppercase; display: block; margin-bottom: 3pt; }}

.qa {{ margin: 3pt 0; font-size: 8.8pt; page-break-inside: avoid; }}
.qa b {{ color: #111; }}
.opt {{ font-size: 8.5pt; margin: 1pt 0 1pt 12pt; color: #333; }}
.opt.correct {{ color: #065f28; font-weight: bold; }}
.expl {{ font-size: 8.2pt; color: #444; background: #f4f6f8; padding: 4pt 8pt;
        margin: 3pt 0 8pt 8pt; }}
.answer {{ font-size: 8.5pt; color: #0b3d20; background: #eef7f1; padding: 3pt 8pt;
          margin: 2pt 0 7pt 8pt; }}
"""


# --------------------------------------------------------------- renders
def render_table(t):
    head = "".join(f"<th>{md(c)}</th>" for c in t["head"])
    rows = "".join(
        "<tr>" + "".join(f"<td>{md(c)}</td>" for c in row) + "</tr>" for row in t["rows"]
    )
    return f"<table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table>"


def render_code(c):
    out = []
    if c["title"]:
        out.append(f'<div class="code-title">{md(c["title"])}</div>')
    out.append(f"<pre>{html.escape(wrap_code(c['code']))}</pre>")
    if c["output"]:
        out.append(f'<div class="out"><b>Output:</b>\n{html.escape(c["output"])}</div>')
    if c["note"]:
        out.append(f'<div class="note">{md(c["note"])}</div>')
    return "".join(out)


TAGCLASS = {
    "Must-know": "must", "Trap": "trap", "Core": "core",
    "Edge": "core", "Plan": "plan", "Nice-to-have": "core",
}


def render_topic(t, number):
    p = []
    tag = t["tag"]
    cls = TAGCLASS.get(tag, "core")
    p.append(f'<div class="topic" id="{slug(t["title"])}">')
    p.append(f'<div class="topic-title">{number}. {md(t["title"])} '
             f'<span class="tag {cls}">{html.escape(tag)}</span> '
             f'<sub>{t["minutes"]} min</sub></div>')
    p.append(f"<p>{md(t['body'])}</p>")

    if t["bullets"]:
        p.append('<h4>Key points</h4><ul class="bullets">')
        p.extend(f"<li>{md(b)}</li>" for b in t["bullets"])
        p.append("</ul>")

    if t["table"]:
        p.append("<h4>Reference</h4>")
        p.append(render_table(t["table"]))

    if t["code"]:
        p.append("<h4>Code</h4>")
        p.extend(render_code(c) for c in t["code"])

    if t["pitch"]:
        p.append('<div class="pitch"><span class="lbl">Say it like this in the '
                 f'interview</span>{md(t["pitch"])}</div>')

    if t["flashcards"]:
        p.append("<h4>Flashcards</h4>")
        for c in t["flashcards"]:
            p.append(f'<div class="qa"><b>Q.</b> {md(c["q"])}<br/>'
                     f'<b>A.</b> {md(c["a"])}</div>')

    if t["quiz"]:
        p.append("<h4>Quiz</h4>")
        for i, q in enumerate(t["quiz"], 1):
            p.append(f'<div class="qa"><b>Q{i}.</b> {md(q["q"])}</div>')
            if q["code"]:
                p.append(f'<div class="out">{html.escape(q["code"])}</div>')
            for j, o in enumerate(q["options"]):
                mark = ' class="correct"' if j == q["answer"] else ""
                p.append(f'<div class="opt"{mark}>{"[x]" if j == q["answer"] else "[ ]"} '
                         f'{chr(65 + j)}. {md(o)}</div>')
            if q["explain"]:
                p.append(f'<div class="expl"><b>Why:</b> {md(q["explain"])}</div>')
    p.append("</div>")
    return "".join(p)


def render_day(d, with_break=True):
    p = []
    cls = "day" if with_break else "day nobreak"
    p.append(f'<div class="{cls}">')
    label = "Rapid Fire" if d["id"] == 5 else f'Day {d["id"]}'
    total_min = sum(t["minutes"] for t in d["topics"])
    n_cards = sum(len(t["flashcards"]) for t in d["topics"])
    n_quiz = sum(len(t["quiz"]) for t in d["topics"])
    p.append('<div class="dayhead">')
    p.append(f"<h2>{label}: {md(d['title'])}</h2>")
    p.append(f"<p><i>{md(d['subtitle'])}</i></p>")
    p.append(f"<p><sub>{len(d['topics'])} topics &middot; {n_cards} flashcards &middot; "
             f"{n_quiz} quiz questions &middot; ~{total_min / 60:.1f} hours</sub></p>")
    p.append("</div>")
    p.append(f'<div class="goal"><b>Goal.</b> {md(d["goal"])}</div>')
    if d["dayPlan"]:
        p.append("<h4>Schedule</h4><ul class='plan'>")
        p.extend(f"<li>{md(x)}</li>" for x in d["dayPlan"])
        p.append("</ul>")
    for i, t in enumerate(d["topics"], 1):
        p.append(render_topic(t, i))
    p.append("</div>")
    return "".join(p)


def render_cover(days, title="Java Interview Crash Course",
                 subtitle="Core Java &rarr; Full Stack in 4 days"):
    n_topics = sum(len(d["topics"]) for d in days)
    n_cards = sum(len(t["flashcards"]) for d in days for t in d["topics"])
    n_quiz = sum(len(t["quiz"]) for d in days for t in d["topics"])
    n_code = sum(len(t["code"]) for d in days for t in d["topics"])
    p = ['<div class="cover">']
    p.append(f"<h1>{html.escape(title)}</h1>")
    p.append(f'<div class="sub">{subtitle}</div>')
    p.append(f'<div class="stats"><b>{n_topics} topics</b> &middot; <b>{n_cards} '
             f"flashcards</b> &middot; <b>{n_quiz} quiz questions</b> &middot; "
             f"<b>{n_code} code examples</b></div>")
    p.append('<div class="box"><b>How to use this in 4 days</b><br/><br/>'
             "1. <b>Answer the quiz before you read.</b> Getting one wrong makes the "
             "answer stick; reading twice does not.<br/>"
             "2. <b>Say it out loud.</b> Every topic ends with a scripted interview "
             "answer in the orange box. Reading it silently is not studying.<br/>"
             "3. <b>Type the code.</b> Your hands remember what your eyes skim past.<br/>"
             "4. <b>Days 1 and 2 are non-negotiable.</b> OOP, Collections and "
             "exceptions are where fresher rounds are won.<br/>"
             "5. <b>Rehearse the project pitch out loud, three times.</b> It is the "
             "highest-leverage question in a fresher interview.</div>")
    p.append("</div>")
    return "".join(p)


def render_toc(days):
    p = ['<div class="toc"><h2>Contents</h2>']
    for d in days:
        label = "Rapid Fire" if d["id"] == 5 else f'Day {d["id"]}'
        p.append(f'<h3>{label} &mdash; {md(d["title"])}</h3><ol>')
        for t in d["topics"]:
            p.append(f'<li>{md(t["title"])} <sub>{t["tag"]} &middot; '
                     f'{t["minutes"]} min</sub></li>')
        p.append("</ol>")
    p.append("</div>")
    return "".join(p)


# ------------------------------------------------------------------ build
def build(name, body, dest):
    html_doc = (
        "<!DOCTYPE html><html><head><meta charset='utf-8'><style>"
        + CSS
        + "</style></head><body>"
        + body
        + '<div id="footerContent">Page <pdf:pagenumber/> of '
          "<pdf:pagecount/></div>"
        + "</body></html>"
    )
    os.makedirs(dest_dir := os.path.dirname(dest), exist_ok=True)

    # The document may read the project directory (relative assets) plus the
    # system font directory, and nothing else.
    policy = ResourceAccessPolicy(
        base_dir=Path(ROOT),
        extra_roots=(Path(FONT_DIR),) if HAVE_DEJAVU else (),
    )
    with open(dest, "wb") as fh:
        with use_policy(policy):
            result = pisa.CreatePDF(html_doc, dest=fh, encoding="utf-8")
    if result.err:
        print(f"  !! {name}: {result.err}", file=sys.stderr)
        return False
    size = os.path.getsize(dest) / 1024
    print(f"  {os.path.relpath(dest, ROOT)}  ({size:,.0f} KB)")
    return True


def main():
    print("Reading course data...")
    raw = subprocess.run(
        ["node", os.path.join(SCRIPT_DIR, "export-json.mjs")],
        capture_output=True, text=True, check=True, cwd=ROOT
    ).stdout
    days = json.loads(raw)
    print(f"  {len(days)} sections, {sum(len(d['topics']) for d in days)} topics\n")

    os.makedirs(OUT_DIR, exist_ok=True)
    print("Building PDFs:")

    # 1. Complete course
    body = render_cover(days) + render_toc(days) + "".join(
        render_day(d) for d in days
    )
    build("complete", body, os.path.join(OUT_DIR, "Java-Interview-Crash-Course.pdf"))

    # 2. Per-day
    for d in days:
        label = "rapid-fire" if d["id"] == 5 else f"day-{d['id']}"
        nice = re.sub(r"[^a-z0-9]+", "-", d["title"].lower()).strip("-")
        fn = f"{label}-{nice}.pdf"[:60]
        body = render_cover([d], d["title"], d["subtitle"]) + render_day(d, with_break=False)
        build(label, body, os.path.join(OUT_DIR, fn))

    # 3. Cheat sheet — every "say it like this" answer, nothing else
    p = ['<div class="cover"><h1>Cheat Sheet</h1>',
         '<div class="sub">Every interview answer on one pass. '
         'Read this the morning of.</div></div>']
    for d in days:
        label = "Rapid Fire" if d["id"] == 5 else f'Day {d["id"]}'
        p.append(f"<h2>{label} &mdash; {md(d['title'])}</h2>")
        for t in d["topics"]:
            if not t["pitch"]:
                continue
            p.append(f'<div class="qa"><b>{md(t["title"])}</b><br/>{md(t["pitch"])}</div>')
    build("cheatsheet", "".join(p), os.path.join(OUT_DIR, "cheat-sheet.pdf"))

    print("\nDone.")


if __name__ == "__main__":
    main()
