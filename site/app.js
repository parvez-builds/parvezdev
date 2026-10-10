/* =============================================================================
   Java Interview Crash Course — app
   Vanilla JS, no build step. Open index.html and it works.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- data */
  var DAYS = [
    window.JAVA_DAY_1,
    window.JAVA_DAY_2,
    window.JAVA_DAY_3,
    window.JAVA_DAY_4,
    window.JAVA_BONUS
  ].filter(Boolean);

  var ALL_TOPICS = [];
  DAYS.forEach(function (d) {
    d.topics.forEach(function (t) { t.__day = d; ALL_TOPICS.push(t); });
  });

  var TOTAL_TOPICS = ALL_TOPICS.length;
  var TOTAL_CARDS = ALL_TOPICS.reduce(function (n, t) { return n + (t.flashcards || []).length; }, 0);
  var TOTAL_QUIZ = ALL_TOPICS.reduce(function (n, t) { return n + (t.quiz || []).length; }, 0);

  /* ------------------------------------------------------------- storage */
  var KEY = "javacram.v1";
  var store = { progress: {}, scores: {}, theme: null, last: null };
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) store = Object.assign(store, JSON.parse(raw));
  } catch (e) { /* private mode — run in memory */ }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }

  /* --------------------------------------------------------------- state */
  var state = {
    dayIdx: 0,
    topicId: null,
    mode: "learn",          // learn | cards | quiz | stats
    cardScope: "day",       // topic | day | all
    quizScope: "topic",     // topic | day | all
    cardIdx: 0,
    flipped: false,
    quiz: null
  };

  /* ------------------------------------------------------------ helpers */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* markdown-lite: **bold** and `code` */
  function md(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code class="inline">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  }

  /* -------------------------------------------------- syntax highlighter */
  var JAVA_KW = ("abstract assert boolean break byte case catch char class const continue default do double " +
    "else enum extends final finally float for goto if implements import instanceof int interface long native " +
    "new package private protected public record return sealed short static strictfp super switch synchronized " +
    "this throw throws transient try var void volatile while yield true false null").split(" ");
  var JAVA_TYPES = ("String Integer Long Double Float Boolean Character Byte Short Object List ArrayList LinkedList " +
    "Map HashMap LinkedHashMap TreeMap Set HashSet TreeSet LinkedHashSet Queue Deque Optional Stream " +
    "Collectors Comparator Iterable Iterator Exception RuntimeException Thread Runnable Callable Future " +
    "ExecutorService CompletableFuture StringBuilder StringBuffer BigDecimal LocalDate LocalDateTime").split(" ");
  var SQL_KW = ("select from where insert into values update set delete create table alter drop add primary key " +
    "foreign references join inner left right full outer on group by having order limit offset distinct as and or " +
    "not null is in exists between like case when then else end union all with over partition row_number rank " +
    "dense_rank lag lead index unique explain asc desc count sum avg min max coalesce").split(" ");
  var XML_KW = null;

  function setOf(arr) { var o = {}; arr.forEach(function (k) { o[k] = 1; }); return o; }
  var S_JAVA = setOf(JAVA_KW), S_TYPE = setOf(JAVA_TYPES), S_SQL = setOf(SQL_KW);

  var TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|--[^\n]*|"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|@[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*|\b\d+(?:\.\d+)?[fFdDlLxXA-Fa-f]*\b|[A-Za-z_$][\w$]*|[\s\S])/g;

  function classifyJava(tok) {
    if (/^(\/\/|\/\*)/.test(tok)) return "com";
    if (/^("""|"|')/.test(tok)) return "str";
    if (/^@/.test(tok)) return "ann";
    if (/^\d/.test(tok)) return "num";
    if (S_JAVA[tok]) return "key";
    if (S_TYPE[tok]) return "typ";
    if (/^[A-Z][A-Za-z0-9_$]*$/.test(tok)) return "typ";
    return null;
  }
  function classifySql(tok) {
    if (/^(--|\/\*)/.test(tok)) return "com";
    if (/^("""|"|')/.test(tok)) return "str";
    if (/^\d/.test(tok)) return "num";
    if (S_SQL[tok.toLowerCase()]) return "key";
    return null;
  }
  function classifyBash(tok) {
    if (/^#/.test(tok)) return "com";
    if (/^("|')/.test(tok)) return "str";
    if (/^\d/.test(tok)) return "num";
    return null;
  }
  function highlight(code, lang) {
    if (lang === "text" || lang === "txt") return esc(code);
    var cls = null;
    if (lang === "sql") cls = classifySql;
    else if (lang === "bash" || lang === "sh") cls = classifyBash;
    else if (lang === "yaml" || lang === "yml") cls = function (t) {
      if (/^#/.test(t)) return "com";
      if (/^("|')/.test(t)) return "str";
      if (/^\d/.test(t)) return "num";
      return null;
    };
    else if (lang === "xml") cls = function (t) {
      if (/^</.test(t)) return "tag";
      if (/^[A-Za-z-]+$/.test(t)) return "att";
      return null;
    };
    else cls = classifyJava;

    var out = "";
    var m;
    TOKEN_RE.lastIndex = 0;
    var last = 0;
    while ((m = TOKEN_RE.exec(code)) !== null) {
      var tok = m[0];
      if (m.index > last) out += esc(code.slice(last, m.index));
      var c = cls(tok);
      out += c ? '<span class="tk-' + c + '">' + esc(tok) + "</span>" : esc(tok);
      last = m.index + tok.length;
      if (tok.length === 0) TOKEN_RE.lastIndex++;
    }
    if (last < code.length) out += esc(code.slice(last));
    return out;
  }

  /* --------------------------------------------------------- day helpers */
  function dayOf(idx) { return DAYS[idx]; }
  function topicsOf(idx) { return DAYS[idx].topics; }

  function allFlashcards(scope, topic) {
    if (scope === "topic") return (topic && topic.flashcards) ? topic.flashcards.slice() : [];
    if (scope === "day") {
      var out = [];
      topicsOf(state.dayIdx).forEach(function (t) { (t.flashcards || []).forEach(function (c) { out.push(c); }); });
      return out;
    }
    var all = [];
    ALL_TOPICS.forEach(function (t) { (t.flashcards || []).forEach(function (c) { all.push(c); }); });
    return all;
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function allQuiz(scope, topic) {
    if (scope === "topic") return (topic && topic.quiz) ? topic.quiz.slice() : [];
    if (scope === "day") {
      var out = [];
      topicsOf(state.dayIdx).forEach(function (t) { (t.quiz || []).forEach(function (q) { out.push(q); }); });
      return out;
    }
    var all = [];
    ALL_TOPICS.forEach(function (t) { (t.quiz || []).forEach(function (q) { all.push(q); }); });
    return all;
  }

  function currentTopic() {
    var ts = topicsOf(state.dayIdx);
    for (var i = 0; i < ts.length; i++) if (ts[i].id === state.topicId) return ts[i];
    return ts[0] || null;
  }

  function dayProgress(idx) {
    var ts = topicsOf(idx);
    var done = ts.filter(function (t) { return !!store.progress[t.id]; }).length;
    return { done: done, total: ts.length, pct: ts.length ? Math.round(done / ts.length * 100) : 0 };
  }
  function overallProgress() {
    var done = ALL_TOPICS.filter(function (t) { return !!store.progress[t.id]; }).length;
    return { done: done, total: TOTAL_TOPICS, pct: Math.round(done / TOTAL_TOPICS * 100) };
  }

  /* ============================================================ RENDERING */

  function renderDayTabs() {
    var nav = $("#dayTabs");
    nav.innerHTML = DAYS.map(function (d, i) {
      var p = dayProgress(i);
      var label = d.id === 5 ? "Rapid Fire" : "Day " + d.id;
      var num = d.id === 5 ? "+" : d.id;
      return '<button class="day-tab' + (i === state.dayIdx ? " active" : "") + '" data-day="' + i + '">' +
        '<span class="dt-num">' + num + '</span>' + esc(label) +
        (p.pct ? '<span class="dt-pct">' + p.pct + "%</span>" : "") +
        "</button>";
    }).join("");
    $$(".day-tab", nav).forEach(function (b) {
      b.addEventListener("click", function () {
        state.dayIdx = +b.dataset.day;
        state.topicId = topicsOf(state.dayIdx)[0].id;
        state.cardIdx = 0; state.flipped = false; state.quiz = null;
        store.last = { day: state.dayIdx, topic: state.topicId };
        save();
        renderAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function renderModeSwitch() {
    var sw = $("#modeSwitch");
    $$("button", sw).forEach(function (b) {
      b.classList.toggle("active", b.dataset.mode === state.mode);
    });
  }

  function renderSidebar() {
    var list = $("#topicList");
    if (state.mode === "stats") {
      list.innerHTML = '<div class="side-note">Progress overview for all four days. Tick topics off as you finish them — your progress is saved in this browser.</div>';
      return;
    }
    var ts = topicsOf(state.dayIdx);
    var html = ts.map(function (t) {
      var done = !!store.progress[t.id];
      var nQ = (t.quiz || []).length, nC = (t.flashcards || []).length;
      return '<button class="topic-item' + (t.id === state.topicId ? " active" : "") + (done ? " done" : "") +
        '" data-topic="' + esc(t.id) + '">' +
        '<span class="ti-check">&#10003;</span>' +
        '<span class="ti-main"><span class="ti-title">' + esc(t.title) + "</span>" +
        '<span class="ti-meta">' + (t.minutes ? t.minutes + " min" : "") +
        (nC ? " &middot; " + nC + " cards" : "") + (nQ ? " &middot; " + nQ + " Q" : "") +
        "</span></span></button>";
    }).join("");
    html += '<div class="side-note">Click a topic to open it. Click the tick to mark it done.</div>';
    list.innerHTML = html;

    $$(".topic-item", list).forEach(function (b) {
      b.addEventListener("click", function (e) {
        var id = b.dataset.topic;
        if (e.target.classList.contains("ti-check")) {
          toggleDone(id);
          return;
        }
        state.topicId = id;
        state.cardIdx = 0; state.flipped = false; state.quiz = null;
        store.last = { day: state.dayIdx, topic: id };
        save();
        renderAll();
      });
    });
  }

  function toggleDone(id) {
    if (store.progress[id]) delete store.progress[id];
    else store.progress[id] = Date.now();
    save();
    renderAll();
  }

  /* ---- code block ---- */
  function codeBlock(c, i) {
    var out = "";
    if (c.output) {
      out = '<div class="code-out"><span class="lbl">Output</span>' + esc(c.output) + "</div>";
    }
    var note = c.note ? '<div class="code-note">' + md(c.note) + "</div>" : "";
    return '<div class="code-block" data-block="' + i + '">' +
      '<div class="code-head"><span>' + (c.title ? esc(c.title) : "") + "</span>" +
      '<span><span class="code-lang">' + esc(c.lang || "java") + '</span> <button class="copy-btn" data-copy="' + i + '">copy</button></span></div>' +
      "<pre><code>" + highlight(c.code, c.lang || "java") + "</code></pre>" +
      out + note + "</div>";
  }

  /* ---- learn view ---- */
  function renderLearn() {
    var t = currentTopic();
    if (!t) { $("#content").innerHTML = '<div class="card empty"><h2>Nothing here yet</h2></div>'; return; }
    var done = !!store.progress[t.id];
    var ts = topicsOf(state.dayIdx);
    var ti = ts.indexOf(t);

    var h = "";

    /* day hero on the first topic */
    if (ti === 0) {
      var d = dayOf(state.dayIdx);
      h += '<div class="card day-hero">' +
        "<h2>" + esc(d.title) + "</h2>" +
        '<p class="sub">' + esc(d.subtitle) + "</p>" +
        '<div class="goal"><b>Today\'s goal.</b> ' + md(d.goal) + "</div>" +
        (d.dayPlan ? '<h3 class="sec">Suggested schedule</h3><ul class="plan">' +
          d.dayPlan.map(function (p) { return "<li>" + md(p) + "</li>"; }).join("") + "</ul>" : "") +
        "</div>";
    }

    h += '<div class="card">';
    h += '<div class="topic-head"><div><h2>' + esc(t.title) + "</h2>" +
      '<p class="body">' + md(t.body) + "</p></div>" +
      (t.tag ? '<span class="tag ' + esc(t.tag) + '">' + esc(t.tag) + "</span>" : "") + "</div>";

    if (t.bullets && t.bullets.length) {
      h += '<h3 class="sec">Key points</h3><ul class="bullets">' +
        t.bullets.map(function (b) { return "<li>" + md(b) + "</li>"; }).join("") + "</ul>";
    }

    if (t.table) {
      h += '<h3 class="sec">Reference table</h3><table class="grid"><thead><tr>' +
        t.table.head.map(function (c) { return "<th>" + md(c) + "</th>"; }).join("") +
        "</tr></thead><tbody>" +
        t.table.rows.map(function (r) {
          return "<tr>" + r.map(function (c) { return "<td>" + md(c) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table>";
    }

    if (t.code && t.code.length) {
      h += '<h3 class="sec">Code</h3>' + t.code.map(codeBlock).join("");
    }

    if (t.pitch) {
      h += '<div class="pitch"><span class="pitch-lbl">Say it like this in the interview</span>' + md(t.pitch) + "</div>";
    }

    var nC = (t.flashcards || []).length, nQ = (t.quiz || []).length;
    h += '<div class="actions">';
    h += '<button class="btn ' + (done ? "done" : "primary") + '" data-act="toggleDone">' +
      (done ? "&#10003; Completed — click to undo" : "Mark as done") + "</button>";
    if (nC) h += '<button class="btn" data-act="cardsTopic">Flashcards (' + nC + ")</button>";
    if (nQ) h += '<button class="btn" data-act="quizTopic">Quiz (' + nQ + ")</button>";
    h += "</div>";
    h += "</div>";

    /* prev / next */
    h += '<div class="topic-nav">' +
      '<button class="nav-btn" data-nav="-1"' + (ti <= 0 ? " disabled" : "") + ">&larr; Previous</button>" +
      '<button class="nav-btn" data-nav="1"' + (ti >= ts.length - 1 ? " disabled" : "") + ">Next &rarr;</button>" +
      "</div>";

    $("#content").innerHTML = h;
  }

  /* ---- flashcards ---- */
  function renderCards() {
    var t = currentTopic();
    var key = state.cardScope + ":" + state.dayIdx + ":" + (t && t.id);
    if (!state.cardDeck || state.cardDeckKey !== key) {
      state.cardDeck = allFlashcards(state.cardScope, t);
      state.cardDeckKey = key;
    }
    var cards = state.cardDeck;
    if (!cards.length) {
      $("#content").innerHTML = '<div class="card empty"><h2>No flashcards here</h2>' +
        "<p>Try switching the scope to this day or to all days.</p></div>" + scopeSwitchHtml("cards");
      bindScope();
      return;
    }
    if (state.cardIdx >= cards.length) state.cardIdx = 0;
    var c = cards[state.cardIdx];
    var pct = Math.round((state.cardIdx + 1) / cards.length * 100);
    var scopeLabel = state.cardScope === "topic" ? esc(t.title) :
      state.cardScope === "day" ? "Day " + dayOf(state.dayIdx).id : "All days";

    var h = scopeSwitchHtml("cards");
    h += '<div class="card"><div class="fc-bar">' +
      '<div class="fc-meta"><span>' + scopeLabel + "</span><span>" +
      (state.cardIdx + 1) + " / " + cards.length + "</span></div>" +
      '<div class="fc-progress"><div style="width:' + pct + '%"></div></div></div>' +
      '<div class="fc-wrap"><div class="fc' + (state.flipped ? " flipped" : "") + '" id="fc">' +
      '<div class="fc-lbl">' + (state.flipped ? "Answer" : "Question") + "</div>" +
      '<div class="fc-text">' + md(state.flipped ? c.a : c.q) + "</div>" +
      '<div class="fc-hint">' + (state.flipped ? "click / Space to see the question" : "click or press Space to reveal") + "</div>" +
      "</div></div>" +
      '<div class="fc-controls">' +
      '<button class="btn" data-card="-1">&larr; Prev</button>' +
      '<button class="btn" data-card="flip">Flip</button>' +
      '<button class="btn" data-card="1">Next &rarr;</button>' +
      '<button class="btn ghost" data-card="shuffle">Shuffle</button>' +
      "</div></div>";

    $("#content").innerHTML = h;
    bindScope();
    var el = $("#fc");
    el.addEventListener("click", function () { flip(); });
    $$("[data-card]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var v = b.dataset.card;
        if (v === "flip") flip();
        else if (v === "shuffle") {
          state.cardDeck = shuffle(cards);
          state.cardIdx = 0; state.flipped = false;
          renderCards();
        }
        else { state.cardIdx = (state.cardIdx + (+v) + cards.length) % cards.length; state.flipped = false; renderCards(); }
      });
    });
  }

  function flip() { state.flipped = !state.flipped; renderCards(); }

  function scopeSwitchHtml(kind) {
    var cur = kind === "cards" ? state.cardScope : state.quizScope;
    var opts = [["topic", "This topic"], ["day", "This day"], ["all", "All days"]];
    return '<div class="card" style="padding:12px 16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<span style="font-size:12px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.7px;font-weight:800">Scope</span>' +
      opts.map(function (o) {
        return '<button class="btn' + (cur === o[0] ? " primary" : " ghost") + '" data-scope="' + kind + ":" + o[0] + '">' + o[1] + "</button>";
      }).join("") +
      (kind === "quiz" ? '<button class="btn" data-scope="quiz:mock" style="margin-left:auto">Mock exam (20 random)</button>' : "") +
      "</div>";
  }

  function bindScope() {
    $$("[data-scope]").forEach(function (b) {
      b.addEventListener("click", function () {
        var parts = b.dataset.scope.split(":");
        if (parts[0] === "cards") {
          state.cardScope = parts[1]; state.cardIdx = 0; state.flipped = false;
          state.cardDeck = null; state.cardDeckKey = null;
        } else {
          if (parts[1] === "mock") { startQuiz("all", true); return; }
          state.quizScope = parts[1]; startQuiz(parts[1], false); return;
        }
        renderCards();
      });
    });
  }

  /* ---- quiz ---- */
  function startQuiz(scope, isMock) {
    var t = currentTopic();
    var qs = allQuiz(scope, t);
    if (!qs.length) { state.quiz = null; renderQuiz(); return; }
    qs = shuffle(qs);
    if (isMock) qs = qs.slice(0, 20);
    state.quiz = { scope: scope, mock: !!isMock, qs: qs, i: 0, picked: [], correct: 0 };
    renderQuiz();
  }

  function renderQuiz() {
    var q = state.quiz;
    if (!q) {
      var t = currentTopic();
      var n = allQuiz(state.quizScope, t).length;
      $("#content").innerHTML = scopeSwitchHtml("quiz") +
        '<div class="card empty"><h2>No questions in this scope</h2><p>Pick a wider scope above.</p></div>';
      bindScope();
      return;
    }
    var h = scopeSwitchHtml("quiz");
    if (q.i >= q.qs.length) {
      var pct = Math.round(q.correct / q.qs.length * 100);
      var cls = pct >= 80 ? "good" : pct >= 55 ? "mid" : "bad";
      var msg = pct >= 80 ? "Sharp. Go teach someone else."
        : pct >= 55 ? "Getting there — re-read the ones you missed."
        : "Read the topic again, then re-run this.";
      h += '<div class="card results"><div class="big ' + cls + '">' + q.correct + " / " + q.qs.length + "</div>" +
        "<p>" + pct + "% &mdash; " + msg + "</p>" +
        '<div class="actions" style="justify-content:center;border:0">' +
        '<button class="btn primary" data-q="retry">Run again</button>' +
        '<button class="btn" data-q="review">Review answers</button>' +
        '<button class="btn ghost" data-q="exit">Back to topic</button>' +
        "</div>";
      if (q.review) {
        h += '<div style="text-align:left;margin-top:22px">' + q.qs.map(function (qq, i) {
          var got = q.picked[i];
          var ok = got === qq.answer;
          return '<div class="explain ' + (ok ? "good" : "bad") + '" style="margin-bottom:10px">' +
            "<b>Q" + (i + 1) + (ok ? " — correct" : " — you picked " + String.fromCharCode(65 + got)) + "</b>" +
            md(qq.q) + "<br><span style='color:var(--green)'><b>Answer:</b> " +
            esc(qq.options[qq.answer]) + "</span><br>" + md(qq.explain) + "</div>";
        }).join("") + "</div>";
      }
      h += "</div>";
      $("#content").innerHTML = h;
      bindScope(); bindQuizButtons();
      return;
    }

    var cur = q.qs[q.i];
    h += '<div class="card"><div class="quiz-bar">' +
      "<span>Question " + (q.i + 1) + " of " + q.qs.length + (q.mock ? " &middot; mock exam" : "") + "</span>" +
      '<span class="score-pill">' + q.correct + " correct</span></div>";
    h += '<div class="quiz-q">' + md(cur.q) + "</div>";
    if (cur.code) h += '<div class="quiz-code"><code>' + highlight(cur.code, "java") + "</code></div>";

    var answered = q.picked[q.i] !== undefined;
    h += cur.options.map(function (o, i) {
      var cls = "";
      if (answered) {
        if (i === cur.answer) cls = " correct";
        else if (i === q.picked[q.i]) cls = " wrong";
      }
      return '<button class="opt' + cls + '" data-opt="' + i + '"' + (answered ? " disabled" : "") + ">" +
        '<span class="k">' + String.fromCharCode(65 + i) + "</span><span>" + md(o) + "</span></button>";
    }).join("");

    if (answered) {
      var ok = q.picked[q.i] === cur.answer;
      h += '<div class="explain ' + (ok ? "good" : "bad") + '"><b>' +
        (ok ? "Correct" : "Not quite — the answer is " + String.fromCharCode(65 + cur.answer)) +
        "</b>" + md(cur.explain) + "</div>";
      h += '<div class="actions"><button class="btn primary" data-q="next">' +
        (q.i === q.qs.length - 1 ? "See results" : "Next question &rarr;") + "</button></div>";
    }
    h += "</div>";
    $("#content").innerHTML = h;
    bindScope(); bindQuizButtons();
  }

  function bindQuizButtons() {
    $$("[data-opt]").forEach(function (b) {
      b.addEventListener("click", function () {
        var q = state.quiz; if (!q) return;
        if (q.picked[q.i] !== undefined) return;
        var pick = +b.dataset.opt;
        q.picked[q.i] = pick;
        if (pick === q.qs[q.i].answer) q.correct++;
        saveScore(q.qs[q.i], pick === q.qs[q.i].answer);
        renderQuiz();
      });
    });
    $$("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.dataset.q, q = state.quiz;
        if (a === "next") { q.i++; renderQuiz(); }
        else if (a === "retry") { startQuiz(q.scope, q.mock); }
        else if (a === "review") { q.review = true; renderQuiz(); }
        else if (a === "exit") { state.quiz = null; state.mode = "learn"; renderAll(); }
      });
    });
  }

  function saveScore(qq, ok) {
    var key = "q_" + (qq.q || "").slice(0, 40);
    var s = store.scores[key] || { ok: 0, n: 0 };
    s.n++; if (ok) s.ok++;
    store.scores[key] = s;
    save();
  }

  /* ---- stats ---- */
  function renderStats() {
    var op = overallProgress();
    var cardsDone = 0, quizDone = 0;
    Object.keys(store.scores).forEach(function (k) { quizDone += store.scores[k].n; });
    var h = "";
    h += '<div class="card"><h2 style="margin-top:0">Your progress</h2>' +
      '<p class="body" style="color:var(--text-dim)">Saved in this browser. ' +
      "There are <b>" + TOTAL_TOPICS + "</b> topics, <b>" + TOTAL_CARDS + "</b> flashcards and <b>" +
      TOTAL_QUIZ + "</b> quiz questions in this course.</p>";
    h += '<div class="stat-grid">' +
      stat(op.pct + "%", "Topics complete") +
      stat(op.done + "/" + op.total, "Topics done") +
      stat(quizDone, "Questions answered") +
      stat(TOTAL_CARDS, "Flashcards") +
      "</div></div>";

    h += '<div class="card"><h3 class="sec" style="margin-top:0">By day</h3>';
    DAYS.forEach(function (d, i) {
      var p = dayProgress(i);
      h += '<div class="day-row"><div class="dr-head"><span><b>' +
        (d.id === 5 ? "Rapid Fire" : "Day " + d.id) + "</b> &mdash; " + esc(d.title) +
        '</span><span>' + p.done + "/" + p.total + " &middot; " + p.pct + "%</span></div>" +
        '<div class="bar"><div style="width:' + p.pct + '%"></div></div></div>';
    });
    h += '<div class="actions"><button class="btn ghost" data-act="reset">Reset all progress</button></div>';
    h += "</div>";

    h += '<div class="card"><h3 class="sec" style="margin-top:0">How to use these four days</h3>' +
      '<ul class="bullets">' +
      "<li><b>Run the quizzes before you read.</b> Wrong answers make the reading stick — testing yourself beats re-reading.</li>" +
      "<li><b>Say it out loud.</b> Every topic has a <i>Say it like this</i> box at the bottom. Reading it silently doesn't count.</li>" +
      "<li><b>Type the code.</b> Don't just read it. Your hands remember what your eyes skim past.</li>" +
      "<li><b>Days 1 and 2 are non-negotiable.</b> OOP, Collections and Exceptions are where fresher rounds are won.</li>" +
      "<li><b>Day 4 is your project round.</b> Practise the 45-second project pitch out loud, three times.</li>" +
      "</ul></div>";

    $("#content").innerHTML = h;
    $$("[data-act=reset]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (confirm("Reset all progress and scores?")) {
          store.progress = {}; store.scores = {}; save(); renderAll();
        }
      });
    });
  }

  function stat(n, l) {
    return '<div class="stat"><div class="n">' + esc(n) + '</div><div class="l">' + esc(l) + "</div></div>";
  }

  /* ------------------------------------------------------------- search */
  function buildIndex() {
    if (buildIndex.cache) return buildIndex.cache;
    buildIndex.cache = ALL_TOPICS.map(function (t) {
      return {
        t: t,
        day: t.__day,
        hay: (t.title + " " + t.body + " " + (t.bullets || []).join(" ") + " " +
              (t.code || []).map(function (c) { return c.title + " " + c.code; }).join(" ") + " " +
              (t.flashcards || []).map(function (c) { return c.q + " " + c.a; }).join(" ") + " " +
              (t.quiz || []).map(function (q) { return q.q + " " + q.options.join(" "); }).join(" ")
             ).toLowerCase()
      };
    });
    return buildIndex.cache;
  }

  function runSearch(term) {
    var box = $("#searchResults");
    term = term.trim().toLowerCase();
    if (term.length < 2) { box.hidden = true; return; }
    var hits = [];
    buildIndex().forEach(function (e) {
      var i = e.hay.indexOf(term);
      if (i >= 0) hits.push({ e: e, i: i });
    });
    hits = hits.slice(0, 14);
    if (!hits.length) {
      box.innerHTML = '<div class="sr-empty">No matches for &ldquo;' + esc(term) + "&rdquo;</div>";
      box.hidden = false;
      return;
    }
    box.innerHTML = hits.map(function (h) {
      var start = Math.max(0, h.i - 45);
      var snip = h.e.hay.slice(start, h.i + 90).replace(/\s+/g, " ");
      var pos = h.i - start;
      var html = esc(snip.slice(0, pos)) + "<b>" + esc(snip.slice(pos, pos + term.length)) + "</b>" + esc(snip.slice(pos + term.length));
      return '<div class="sr-item" data-goto="' + esc(h.e.t.id) + '" data-day="' + DAYS.indexOf(h.e.day) + '">' +
        '<div>' + esc(h.e.t.title) + "</div>" +
        '<div class="sr-meta">' + (h.e.day.id === 5 ? "Rapid Fire" : "Day " + h.e.day.id) + " &middot; " + esc(h.e.day.title) + "</div>" +
        '<div class="sr-meta">…' + html + "…</div></div>";
    }).join("");
    box.hidden = false;
    $$(".sr-item", box).forEach(function (it) {
      it.addEventListener("click", function () {
        state.dayIdx = +it.dataset.day;
        state.topicId = it.dataset.goto;
        state.mode = "learn";
        state.quiz = null; state.cardIdx = 0; state.flipped = false;
        box.hidden = true;
        $("#search").value = "";
        renderAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  /* --------------------------------------------------------------- boot */
  function renderAll() {
    renderDayTabs();
    renderModeSwitch();
    renderSidebar();
    if (state.mode === "learn") renderLearn();
    else if (state.mode === "cards") renderCards();
    else if (state.mode === "quiz") renderQuiz();
    else renderStats();

    var op = overallProgress();
    $("#overallPct").textContent = op.pct + "%";
    $("#overallBar").style.width = op.pct + "%";
    $("#footerStats").textContent = TOTAL_TOPICS + " topics · " + TOTAL_CARDS + " flashcards · " + TOTAL_QUIZ + " quiz questions";

    /* attach generic actions */
    $$("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.dataset.act, t = currentTopic();
        if (a === "toggleDone") toggleDone(t.id);
        else if (a === "cardsTopic") { state.cardScope = "topic"; state.mode = "cards"; state.cardIdx = 0; state.flipped = false; state.cardDeck = null; state.cardDeckKey = null; renderAll(); }
        else if (a === "quizTopic") { state.quizScope = "topic"; state.mode = "quiz"; startQuiz("topic", false); }
      });
    });
    $$("[data-nav]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ts = topicsOf(state.dayIdx);
        var i = ts.indexOf(currentTopic()) + (+b.dataset.nav);
        if (i < 0 || i >= ts.length) return;
        state.topicId = ts[i].id;
        store.last = { day: state.dayIdx, topic: state.topicId };
        save();
        renderAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    $$("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = currentTopic();
        var c = t.code[+b.dataset.copy];
        if (!c) return;
        var ta = document.createElement("textarea");
        ta.value = c.code; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); b.textContent = "copied"; } catch (e) { b.textContent = "failed"; }
        document.body.removeChild(ta);
        setTimeout(function () { b.textContent = "copy"; }, 1200);
      });
    });
  }

  /* mode switch */
  $$("#modeSwitch button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.mode = b.dataset.mode;
      if (state.mode === "quiz" && !state.quiz) startQuiz(state.quizScope, false);
      renderAll();
    });
  });

  /* search */
  $("#search").addEventListener("input", function (e) { runSearch(e.target.value); });
  $("#search").addEventListener("blur", function () {
    setTimeout(function () { $("#searchResults").hidden = true; }, 200);
  });
  $("#search").addEventListener("focus", function (e) { if (e.target.value) runSearch(e.target.value); });

  /* theme */
  function applyTheme(t) {
    if (t === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    store.theme = t; save();
  }
  $("#themeBtn").addEventListener("click", function () {
    applyTheme(store.theme === "light" ? "dark" : "light");
  });

  /* keyboard */
  document.addEventListener("keydown", function (e) {
    var inField = /input|textarea|select/i.test((e.target.tagName || ""));
    if (e.key === "/" && !inField) { e.preventDefault(); $("#search").focus(); return; }
    if (inField) return;

    if (state.mode === "cards") {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); stepCard(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stepCard(-1); }
      return;
    }
    if (state.mode === "quiz" && state.quiz) {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 6) {
        var btn = $('[data-opt="' + (n - 1) + '"]');
        if (btn && !btn.disabled) btn.click();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var nx = $('[data-q="next"]'); if (nx) nx.click();
      }
      return;
    }
    if (state.mode === "learn") {
      if (e.key === "ArrowRight") { var b1 = $('[data-nav="1"]'); if (b1 && !b1.disabled) b1.click(); }
      else if (e.key === "ArrowLeft") { var b2 = $('[data-nav="-1"]'); if (b2 && !b2.disabled) b2.click(); }
    }
  });

  function stepCard(d) {
    var cards = state.cardDeck || allFlashcards(state.cardScope, currentTopic());
    if (!cards.length) return;
    state.cardIdx = (state.cardIdx + d + cards.length) % cards.length;
    state.flipped = false;
    renderCards();
  }

  /* init */
  if (store.theme) applyTheme(store.theme);
  if (store.last && DAYS[store.last.day] && store.last.topic) {
    var ok = DAYS[store.last.day].topics.some(function (t) { return t.id === store.last.topic; });
    if (ok) { state.dayIdx = store.last.day; state.topicId = store.last.topic; }
  }
  if (!state.topicId) state.topicId = topicsOf(state.dayIdx)[0].id;

  renderAll();
})();
