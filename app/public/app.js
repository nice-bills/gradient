const CODES = { "neural-nets": "GRD 101", llms: "GRD 201", agents: "GRD 240", inside: "GRD 350", frontier: "GRD 380" };
const TOPICS = { foundations: "Foundations", llms: "LLMs", agents: "Agents", applied: "Applied", rl: "RL", interpretability: "Interpretability", systems: "Systems", math: "Maths", research: "Research" };
const LEVELS = { beginner: "Beginner", intermediate: "Intermediate", research: "Research" };
const main = document.getElementById("main");
const hallEl = document.getElementById("hall");
let DATA = null;
let SRC = {};

const store = {
  get() { try { return JSON.parse(localStorage.getItem("gradient.done") || "{}"); } catch { return {}; } },
  toggle(key) { const d = store.get(); if (d[key]) delete d[key]; else d[key] = Date.now(); localStorage.setItem("gradient.done", JSON.stringify(d)); return !!d[key]; },
  has(key) { return !!store.get()[key]; },
};
const keyOf = (it) => (it.kind === "video" ? "yt:" + it.yt : "url:" + it.url);
const hrefOf = (it) => (it.kind === "video" ? `https://www.youtube.com/watch?v=${it.yt}` : it.url);
const thumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (d) => { if (!d) return ""; const x = new Date(d + "T00:00:00Z"); return x.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); };
const ago = (d) => { const days = Math.floor((Date.now() - new Date(d + "T00:00:00Z")) / 864e5); if (days <= 0) return "today"; if (days === 1) return "yesterday"; if (days < 30) return days + " days ago"; return fmtDate(d); };

function skeleton() {
  main.innerHTML = `<section class="wrap" aria-busy="true" aria-label="Loading">
    <div class="sk sk-title"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div>
    <div class="sk-grid">${"<div class='sk sk-card'></div>".repeat(4)}</div></section>`;
}

function itemRow(it, opts = {}) {
  const src = SRC[it.src];
  const by = it.by || (src && src.name) || "";
  const done = store.has(keyOf(it));
  const media = it.kind === "video"
    ? `<img class="thumb" src="${thumb(it.yt)}" alt="" loading="lazy" width="320" height="180">`
    : `<div class="thumb read-thumb" aria-hidden="true"><span>${esc((by || "R").slice(0, 1))}</span></div>`;
  return `<li class="row${done ? " is-done" : ""}" data-key="${esc(keyOf(it))}">
    ${opts.num != null ? `<span class="num" aria-hidden="true">${String(opts.num).padStart(2, "0")}</span>` : ""}
    <a class="row-media" href="${esc(hrefOf(it))}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${media}</a>
    <div class="row-body">
      <p class="row-meta"><span class="kind">${it.kind === "video" ? "Lecture" : "Reading"}</span>${esc(by)}${it.date ? ` <span class="dot">·</span> ${esc(ago(it.date))}` : ""}${src && src.tier ? ` <span class="tier tier-${src.tier}" title="Tier ${src.tier}">${src.tier}</span>` : ""}</p>
      <h3 class="row-title"><a href="${esc(hrefOf(it))}" target="_blank" rel="noopener">${esc(it.title)}</a></h3>
      ${it.note ? `<p class="row-note">${esc(it.note)}</p>` : ""}
    </div>
    <button class="mark" type="button" aria-pressed="${done}" aria-label="${done ? "Marked done" : "Mark as done"}: ${esc(it.title)}"><span class="mark-box" aria-hidden="true"></span><span class="mark-txt">${done ? "Done" : "Mark done"}</span></button>
  </li>`;
}

function bindMarks(root) {
  root.querySelectorAll(".mark").forEach((b) => b.addEventListener("click", () => {
    const li = b.closest(".row");
    const on = store.toggle(li.dataset.key);
    li.classList.toggle("is-done", on);
    b.setAttribute("aria-pressed", on);
    b.querySelector(".mark-txt").textContent = on ? "Done" : "Mark done";
    b.setAttribute("aria-label", (on ? "Marked done" : "Mark as done") + b.getAttribute("aria-label").replace(/^[^:]*/, ""));
    li.classList.remove("stamp"); void li.offsetWidth; if (on) li.classList.add("stamp");
    const c = b.closest("[data-course]"); if (c) updateProgress(c);
  }));
}
function progressOf(p) { const d = store.get(); return p.items.filter((it) => d[keyOf(it)]).length; }
function updateProgress(el) {
  const p = DATA.paths.find((x) => x.slug === el.dataset.course);
  const n = progressOf(p);
  el.querySelectorAll("[data-prog]").forEach((x) => (x.textContent = `${n} of ${p.items.length} done`));
  el.querySelectorAll("[data-bar]").forEach((x) => (x.style.transform = `scaleX(${n / p.items.length})`));
}

function viewHome() {
  const latest = DATA.items.filter((i) => SRC[i.src] && SRC[i.src].tier !== "B").slice(0, 6);
  main.innerHTML = `<section class="wrap hero">
    <p class="eyebrow">Autumn term, ${new Date().getFullYear()}</p>
    <h1>A free university for AI, <em>curated</em>.</h1>
    <p class="lede">Five courses in the right order, from your first neuron to the research frontier. Then a bulletin of new lectures from forty sources we would actually assign. Nothing else.</p>
    <div class="hero-actions"><a class="btn" href="#/course/neural-nets">Start GRD 101</a><button class="btn ghost" type="button" data-hall="neural-nets">Open the lecture hall</button></div>
  </section>
  <section class="wrap" aria-labelledby="cat-h">
    <div class="sec-head"><h2 id="cat-h">Course catalogue</h2><p>${DATA.paths.reduce((a, p) => a + p.items.length, 0)} assigned pieces, in order</p></div>
    <ol class="catalogue">${DATA.paths.map((p, i) => {
      const n = progressOf(p);
      return `<li class="course" data-course="${p.slug}" style="--i:${i}">
        <a class="course-link" href="#/course/${p.slug}">
          <span class="code">${CODES[p.slug]}</span>
          <span class="course-title">${esc(p.title)}</span>
          <span class="course-blurb">${esc(p.blurb)}</span>
          <span class="course-foot"><span class="lvl lvl-${p.level}">${LEVELS[p.level]}</span><span>${p.items.length} pieces</span><span data-prog>${n} of ${p.items.length} done</span></span>
          <span class="bar" aria-hidden="true"><span data-bar style="transform:scaleX(${n / p.items.length})"></span></span>
        </a></li>`;
    }).join("")}</ol>
  </section>
  <section class="wrap" aria-labelledby="new-h">
    <div class="sec-head"><h2 id="new-h">New on the bulletin</h2><a class="more" href="#/bulletin">Full bulletin</a></div>
    <ul class="rows">${latest.map((it) => itemRow(it)).join("")}</ul>
  </section>`;
  bindMarks(main);
  main.querySelectorAll("[data-hall]").forEach((b) => b.addEventListener("click", () => openHall({ course: b.dataset.hall })));
}

function viewCourse(slug) {
  const p = DATA.paths.find((x) => x.slug === slug);
  if (!p) return viewNotFound();
  const n = progressOf(p);
  main.innerHTML = `<section class="wrap course-page" data-course="${p.slug}">
    <a class="back" href="#/">Catalogue</a>
    <p class="eyebrow"><span class="code">${CODES[p.slug]}</span> ${LEVELS[p.level]}</p>
    <h1>${esc(p.title)}</h1>
    <p class="lede">${esc(p.blurb)}</p>
    <div class="course-tools">
      <button class="btn" type="button" data-hall-course>Play in the lecture hall</button>
      <span class="prog"><span data-prog>${n} of ${p.items.length} done</span><span class="bar" aria-hidden="true"><span data-bar style="transform:scaleX(${n / p.items.length})"></span></span></span>
    </div>
    <ol class="rows syllabus">${p.items.map((it, i) => itemRow(it, { num: i + 1 })).join("")}</ol>
  </section>`;
  bindMarks(main);
  main.querySelector("[data-hall-course]").addEventListener("click", () => openHall({ course: slug }));
}

let filt = { kind: "all", level: "all", topic: "all", tier: "SA" };
function viewBulletin(q) {
  if (q.get("topic")) filt.topic = q.get("topic");
  const seg = (name, opts) => `<fieldset class="seg"><legend>${name}</legend>${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${filt[name] === v ? "checked" : ""}><span>${l}</span></label>`).join("")}</fieldset>`;
  main.innerHTML = `<section class="wrap">
    <p class="eyebrow">Updated ${esc(fmtDate(DATA.generated.slice(0, 10)))}</p>
    <h1>The bulletin</h1>
    <p class="lede">New lectures and readings from the faculty, newest first. Shorts and filler are left out.</p>
    <form class="filters" aria-label="Filter the bulletin">
      ${seg("kind", [["all", "All"], ["video", "Lectures"], ["read", "Readings"]])}
      ${seg("tier", [["SA", "Tier S and A"], ["S", "Tier S only"], ["SAB", "Everything"]])}
      <label class="sel"><span>Level</span><select name="level"><option value="all">Any level</option>${Object.entries(LEVELS).map(([v, l]) => `<option value="${v}" ${filt.level === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <label class="sel"><span>Topic</span><select name="topic"><option value="all">All topics</option>${Object.entries(TOPICS).map(([v, l]) => `<option value="${v}" ${filt.topic === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
    </form>
    <div class="list-tools"><p class="count" aria-live="polite"></p><button class="btn ghost small" type="button" data-hall-bulletin>Play these in the hall</button></div>
    <ul class="rows" data-list></ul>
    <button class="btn ghost more-btn" type="button" data-more hidden>Show 30 more</button>
  </section>`;
  const form = main.querySelector(".filters");
  let shown = 30;
  const apply = () => {
    const list = filtered();
    main.querySelector(".count").textContent = `${list.length} pieces`;
    main.querySelector("[data-list]").innerHTML = list.slice(0, shown).map((it) => itemRow(it)).join("") || `<li class="empty">Nothing matches. Loosen a filter.</li>`;
    main.querySelector("[data-more]").hidden = list.length <= shown;
    bindMarks(main.querySelector("[data-list]"));
  };
  form.addEventListener("change", (e) => { filt[e.target.name] = e.target.value; shown = 30; apply(); });
  main.querySelector("[data-more]").addEventListener("click", () => { shown += 30; apply(); });
  main.querySelector("[data-hall-bulletin]").addEventListener("click", () => openHall({ list: filtered().slice(0, 50), title: "Bulletin" }));
  apply();
}
function filtered() {
  return DATA.items.filter((it) => {
    const s = SRC[it.src]; if (!s) return false;
    if (filt.kind !== "all" && it.kind !== filt.kind) return false;
    if (!filt.tier.includes(s.tier)) return false;
    if (filt.level !== "all" && s.level !== filt.level) return false;
    if (filt.topic !== "all" && !s.topics.includes(filt.topic)) return false;
    return true;
  });
}

function viewFaculty() {
  const order = { S: 0, A: 1, B: 2 };
  const list = [...DATA.sources].sort((a, b) => order[a.tier] - order[b.tier] || a.name.localeCompare(b.name));
  main.innerHTML = `<section class="wrap">
    <h1>Faculty</h1>
    <p class="lede">${list.length} sources, each graded. S: assign without hesitation. A: strong and regular. B: good, narrower or noisier.</p>
    <ul class="faculty">${list.map((s) => `<li>
      <span class="tier tier-${s.tier}">${s.tier}</span>
      <div><h3><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></h3>
      <p>${esc(s.note)}</p>
      <p class="tags"><span>${s.kind === "video" ? "Lectures" : "Readings"}</span><span>${LEVELS[s.level]}</span>${s.topics.map((t) => `<a href="#/bulletin?topic=${t}">${TOPICS[t]}</a>`).join("")}</p></div>
    </li>`).join("")}</ul>
  </section>`;
}

function viewTranscript() {
  const d = store.get();
  const all = [...DATA.paths.flatMap((p) => p.items), ...DATA.items];
  const seen = new Set();
  const done = all.filter((it) => { const k = keyOf(it); if (!d[k] || seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => d[keyOf(b)] - d[keyOf(a)]);
  main.innerHTML = `<section class="wrap">
    <h1>Your transcript</h1>
    <p class="lede">${done.length ? `${done.length} pieces completed. Saved in this browser only.` : "Nothing marked done yet. Mark a lecture done and it lands here. It stays in this browser; nothing is sent anywhere."}</p>
    <ul class="grades">${DATA.paths.map((p) => { const n = progressOf(p); return `<li><span class="code">${CODES[p.slug]}</span><span>${esc(p.title)}</span><span class="grade">${n === p.items.length ? "Complete" : `${n} of ${p.items.length}`}</span></li>`; }).join("")}</ul>
    ${done.length ? `<ul class="rows">${done.map((it) => itemRow(it)).join("")}</ul>` : `<a class="btn" href="#/course/neural-nets">Start GRD 101</a>`}
  </section>`;
  bindMarks(main);
}

function viewAbout() {
  main.innerHTML = `<section class="wrap prose">
    <h1>About Gradient</h1>
    <p class="lede">TristanTube showed that a good list of channels beats an algorithm. Gradient goes one step further: it decides the order.</p>
    <h2>Selection rules</h2>
    <ul class="plain">
      <li>A source earns a place by teaching, not by reacting to news.</li>
      <li>Every source is graded S, A or B, and the bulletin shows S and A by default.</li>
      <li>Courses are sequences: each piece assumes the ones before it.</li>
      <li>Primary sources sit next to the explainers: the paper after the pictures.</li>
      <li>Shorts are dropped automatically.</li>
    </ul>
    <h2>How it updates</h2>
    <p>The bulletin is rebuilt from each source's public RSS feed. No accounts, no tracking. Progress is stored in your own browser.</p>
    <h2>Keyboard, in the lecture hall</h2>
    <p>N next, P previous, D mark done, Esc to leave.</p>
  </section>`;
}
function viewLegal(kind) {
  main.innerHTML = kind === "terms" ? `<section class="wrap prose"><h1>Terms</h1>
    <p>Gradient is a free index of links and embedded players. Videos and articles belong to their creators and are served by YouTube and the original sites under their own terms. Gradient is provided as is, with no warranty. Do not scrape it at a rate that harms the service.</p></section>`
    : `<section class="wrap prose"><h1>Privacy</h1>
    <p>Gradient has no accounts, no analytics and no cookies of its own. Your progress is kept in your browser's local storage and never leaves your device. Embedded videos load from youtube-nocookie.com, and fonts from Google Fonts; those services receive your IP address when they load.</p></section>`;
}
function viewNotFound() { main.innerHTML = `<section class="wrap"><h1>Not in the catalogue</h1><p class="lede">That page doesn't exist.</p><a class="btn" href="#/">Back to courses</a></section>`; }

// Lecture hall
let hall = null;
function openHall({ course, list, title }) {
  const p = course && DATA.paths.find((x) => x.slug === course);
  const items = p ? p.items : list;
  if (!items || !items.length) return;
  const d = store.get();
  let start = p ? Math.max(0, items.findIndex((it) => !d[keyOf(it)])) : 0;
  hall = { items, i: start, title: p ? `${CODES[p.slug]} ${p.title}` : title, back: document.activeElement };
  hallEl.hidden = false;
  document.body.classList.add("in-hall");
  renderHall();
  document.addEventListener("keydown", hallKeys);
}
function renderHall() {
  const it = hall.items[hall.i];
  const done = store.has(keyOf(it));
  hallEl.innerHTML = `<div class="hall-in" role="dialog" aria-modal="true" aria-label="Lecture hall">
    <div class="hall-top"><p class="hall-title">${esc(hall.title)}</p><p class="hall-pos">${hall.i + 1} / ${hall.items.length}</p><button class="hall-x" type="button" data-x>Leave hall</button></div>
    <div class="screen${it.kind === "read" ? " is-read" : ""}">${it.kind === "video"
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${it.yt}?autoplay=1&rel=0&modestbranding=1" title="${esc(it.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
      : `<div class="reading"><p class="kind">Reading</p><h2>${esc(it.title)}</h2><p>${esc(it.by || (SRC[it.src] && SRC[it.src].name) || "")}</p>${it.note ? `<p class="hall-note">${esc(it.note)}</p>` : ""}<a class="btn" href="${esc(it.url)}" target="_blank" rel="noopener">Open the reading</a></div>`}</div>
    <div class="hall-bottom">
      <div class="hall-now">${it.kind === "read" ? "" : `<p class="kind">${it.kind === "video" ? "Now showing" : "Reading"}</p><h2>${esc(it.title)}</h2>${it.note ? `<p class="hall-note">${esc(it.note)}</p>` : ""}`}</div>
      <div class="hall-ctl">
        <button type="button" class="btn ghost" data-p ${hall.i === 0 ? "disabled" : ""}>Previous</button>
        <button type="button" class="btn ghost" data-d aria-pressed="${done}">${done ? "Done" : "Mark done"}</button>
        <button type="button" class="btn" data-n ${hall.i === hall.items.length - 1 ? "disabled" : ""}>Next</button>
      </div>
    </div>
    <ol class="reel" aria-label="Up next">${hall.items.map((x, j) => `<li><button type="button" data-j="${j}" ${j === hall.i ? 'aria-current="true"' : ""} class="${store.has(keyOf(x)) ? "done" : ""}"><span>${String(j + 1).padStart(2, "0")}</span>${esc(x.title)}</button></li>`).join("")}</ol>
  </div>`;
  hallEl.querySelector("[data-x]").onclick = closeHall;
  hallEl.querySelector("[data-p]").onclick = () => step(-1);
  hallEl.querySelector("[data-n]").onclick = () => step(1);
  hallEl.querySelector("[data-d]").onclick = () => { store.toggle(keyOf(it)); renderHall(); };
  hallEl.querySelectorAll("[data-j]").forEach((b) => (b.onclick = () => { hall.i = +b.dataset.j; renderHall(); }));
  const cur = hallEl.querySelector('[aria-current="true"]'); if (cur) cur.scrollIntoView({ block: "nearest", inline: "center" });
  hallEl.querySelector("[data-x]").focus({ preventScroll: true });
}
function step(n) { const j = hall.i + n; if (j < 0 || j >= hall.items.length) return; hall.i = j; renderHall(); }
function hallKeys(e) {
  if (e.target.closest && e.target.closest("input,select,textarea")) return;
  if (e.key === "Escape") closeHall();
  else if (e.key === "n" || e.key === "N") step(1);
  else if (e.key === "p" || e.key === "P") step(-1);
  else if (e.key === "d" || e.key === "D") { store.toggle(keyOf(hall.items[hall.i])); renderHall(); }
}
function closeHall() {
  hallEl.hidden = true; hallEl.innerHTML = ""; document.body.classList.remove("in-hall");
  document.removeEventListener("keydown", hallKeys);
  const back = hall && hall.back; hall = null; route(); if (back && back.focus) back.focus();
}

function route() {
  const h = location.hash.slice(1) || "/";
  const [path, qs] = h.split("?");
  const q = new URLSearchParams(qs || "");
  const parts = path.split("/").filter(Boolean);
  document.querySelectorAll("[data-nav]").forEach((a) => a.removeAttribute("aria-current"));
  const nav = parts[0] === "course" || !parts[0] ? "courses" : parts[0];
  const cur = document.querySelector(`[data-nav="${nav}"]`); if (cur) cur.setAttribute("aria-current", "page");
  if (!parts[0]) viewHome();
  else if (parts[0] === "course") viewCourse(parts[1]);
  else if (parts[0] === "bulletin") viewBulletin(q);
  else if (parts[0] === "faculty") viewFaculty();
  else if (parts[0] === "transcript") viewTranscript();
  else if (parts[0] === "about") viewAbout();
  else if (parts[0] === "terms" || parts[0] === "privacy") viewLegal(parts[0]);
  else viewNotFound();
  if (q.get("hall") && DATA.paths.some((p) => p.slug === q.get("hall"))) openHall({ course: q.get("hall") });
}

skeleton();
fetch("data.json").then((r) => r.json()).then((d) => {
  DATA = d;
  SRC = Object.fromEntries(d.sources.map((s) => [s.id, s]));
  document.getElementById("gen").textContent = "Bulletin updated " + fmtDate(d.generated.slice(0, 10));
  route();
  window.addEventListener("hashchange", () => { if (hall) closeHall(); else { route(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); } });
}).catch(() => { main.innerHTML = `<section class="wrap"><h1>The catalogue didn't load</h1><p class="lede">Check your connection and reload the page.</p></section>`; });
