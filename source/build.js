// Builds Jollof Wahala.
//   node source/build.js
// Reads source/data/<category>.txt (+ .add.txt) lines of "ANSWER|clue", checks them, and writes:
//   source/game.html  - the page published as the Claude artifact
//   index.html        - the public GitHub Pages site (installable app, offline cache, update notice)
//   version.json      - bumped on every build so open apps know a new version is out
//   desktop/offline/index.html - copy bundled into the Windows app for first launch without internet
const fs = require("fs"), path = require("path");
const SRC = __dirname, ROOT = path.join(__dirname, "..");
const CATS = { all: "Everything", chop: "Chop", places: "Places", pidgin: "Pidgin & Slang", culture: "Culture & Owambe", proverbs: "Proverbs", music: "Music", musicians: "Musicians", actors: "Actors & Nollywood", football: "Football", footballers: "Footballers", history: "History & Heroes", books: "Books & Writers", languages: "Naija Languages", festivals: "Festivals & Traditions" };

// ---- puzzles
const rows = [], seen = new Map(), problems = [];
for (const cat of Object.keys(CATS).filter(c => c !== "all")) {
  for (const f of [cat + ".txt", cat + ".add.txt"]) {
    const p = path.join(SRC, "data", f);
    if (!fs.existsSync(p)) continue;
    fs.readFileSync(p, "utf8").split(/\r?\n/).filter(l => l.trim()).forEach(line => {
      const [a, q, extra] = line.split("|");
      const ans = (a || "").trim(), clue = (q || "").trim();
      if (extra !== undefined || !clue) problems.push("bad line: " + line);
      if (!/^[A-Z][A-Z' -]*[A-Z]$|^[A-Z]$/.test(ans) || /  /.test(ans)) problems.push("bad answer: " + ans);
      if (Math.max(...ans.split(" ").map(w => w.length)) > 14) problems.push("word too long: " + ans);
      if (seen.has(ans)) problems.push("duplicate: " + ans + " (" + seen.get(ans) + " / " + cat + ")");
      seen.set(ans, cat);
      rows.push([cat, ans, clue]);
    });
  }
}
if (problems.length) { console.log(problems.join("\n")); process.exit(1); }

let html = fs.readFileSync(path.join(SRC, "game.html"), "utf8");
html = html.replace(/const CATS = \{[^\n]*\};/, () => "const CATS = " + JSON.stringify(CATS) + ";");
html = html.replace(/const PUZZLES = \[[\s\S]*?\n\];/, () => "const PUZZLES = [\n" + rows.map(r => "  " + JSON.stringify(r)).join(",\n") + "\n];");
fs.writeFileSync(path.join(SRC, "game.html"), html);

// ---- public site
const version = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13);
const desc = "Guess Naija food, places, slang, music, Nollywood, football, history, books and more, letter by letter, before the jollof pot burns.";
const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${desc}">
<meta name="theme-color" content="#111733">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Jollof Wahala">
<meta property="og:title" content="Jollof Wahala">
<meta property="og:description" content="Guess the Naija word before the jollof pot burns.">
<meta property="og:image" content="icons/icon-512.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}</style>
`;
const updater = `<div class="update" id="update" role="status" hidden>
  <span>A new version of Jollof Wahala is ready.</span>
  <button type="button" id="updateBtn">Update now</button>
</div>
<style>
.update { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 30; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 12px; max-width: calc(100% - 32px); background: #f0e7d3; color: #1a1f3d; border-radius: 14px; padding: 10px 12px 10px 16px; box-shadow: 0 10px 30px rgba(0,0,0,.45); font: 600 .92rem "Bricolage Grotesque", system-ui, sans-serif; }
.update button { font: 400 1rem "Lilita One", Impact, sans-serif; background: #e4532b; color: #fff; border: none; border-radius: 9px; padding: 8px 14px; cursor: pointer; }
</style>
<script>
// Installable app + update notice: compares this page's version with version.json on the server
const APP_VERSION = "${version}";
(function () {
  if (!location.protocol.startsWith("http")) return;
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  const bar = document.getElementById("update");
  document.getElementById("updateBtn").addEventListener("click", () => location.reload());
  async function check() {
    try {
      const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
      if (r.ok && (await r.json()).version !== APP_VERSION) bar.hidden = false;
    } catch (e) {}
  }
  check();
  setInterval(check, 30 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
})();
</script>
`;
const end = html.indexOf("</style>\n") + 9;
const site = head + html.slice(0, end).replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n/, "") + "</head>\n<body>\n" + html.slice(end) + updater + "</body>\n</html>\n";
fs.writeFileSync(path.join(ROOT, "index.html"), site);
fs.writeFileSync(path.join(ROOT, "version.json"), JSON.stringify({ version }) + "\n");
fs.mkdirSync(path.join(ROOT, "desktop", "offline", "icons"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "desktop", "offline", "index.html"), site);
for (const f of ["favicon-32.png", "apple-touch-icon.png"]) fs.copyFileSync(path.join(ROOT, "icons", f), path.join(ROOT, "desktop", "offline", "icons", f));

const counts = {};
rows.forEach(r => counts[r[0]] = (counts[r[0]] || 0) + 1);
console.log("version", version, "| total", rows.length, JSON.stringify(counts));
