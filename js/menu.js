/* =====================================================================
   DEDSEC // TOOLKIT  —  lógica del menú
   - i18n ES/EN con toggle (recuerda preferencia)
   - navegación teclado + mouse, panel, reloj, log, sonido
   - animaciones: lluvia matrix, glitch, escaneo, CRT
   El menú funciona aunque el JS falle (filas = enlaces).
   ===================================================================== */

const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- DICCIONARIO ---------- */
const T = {
  es: {
    sub:"Herramientas de respaldo y cifrado",
    status:"CONECTADO",
    teleTitle:"// ESTADO DEL SISTEMA",
    teleDb:"BASE DE DATOS", teleDbVal:"\u25cf CONECTADA",
    teleLast:"ÚLTIMO RESPALDO", teleRecords:"REGISTROS", teleStorage:"ALMACENAMIENTO",
    cmdOut:"nodo conectado · 3 herramientas disponibles",
    cmdHint: 'los viejos arcades nunca mueren · ↑↑↓↓…',
    logTitle:"// LOG DEL SISTEMA",
    nav:"NAVEGAR", open:"ABRIR", ready:"[LISTO]",
    boot0:"> DEDSEC TOOLKIT v1.0.0",
    boot1:"> estableciendo conexión segura...",
    boot2:"> verificando integridad... OK",
    boot3:"> enmascarando identidad... OK",
    boot4:"> acceso anónimo concedido",
    waiting:"> sistema en espera",
    mods:[
      { name:"ENCRIPTADOR DE CONTRASEÑAS", t:"Encriptador de Contraseñas",
        d:"Encripta y protege contraseñas con AES-256, con cifrado local y sin enviar datos a terceros.",
        tags:"AES-256 · i18n" },
      { name:"CREACIÓN DE REPORTES", t:"Creación de Reportes",
        d:"Genera reportes en formato Bitácora de Respaldo con fecha, responsable y detalle de la base respaldada.",
        tags:"Bitácora · PDF" },
      { name:"DOCUMENTACIÓN", t:"Documentación SIITESCI",
        d:"Índice de documentación técnica de los módulos del sistema SIITESCI.",
        tags:"Docs · HTML" }
    ],
    log:[
      "> 03:01:22 conectando a la base de datos...",
      "> 03:02:14 respaldando tablas .......... OK",
      "> 03:05:08 cifrando respaldo ........... OK",
      "> 03:07:32 respaldo completado [48,210 reg]",
      "> 03:07:33 integridad verificada",
      "> [!] entrada de diagnóstico oculta · secuencia clásica de 10 teclas"
    ]
  },
  en: {
    sub:"Backup & encryption tools",
    status:"CONNECTED",
    teleTitle:"// SYSTEM STATUS",
    teleDb:"DATABASE", teleDbVal:"\u25cf CONNECTED",
    teleLast:"LAST BACKUP", teleRecords:"RECORDS", teleStorage:"STORAGE",
    cmdOut:"node connected · 3 tools available",
    cmdHint: 'old arcades never die · ↑↑↓↓…',
    logTitle:"// SYSTEM LOG",
    nav:"NAVIGATE", open:"OPEN", ready:"[READY]",
    boot0:"> DEDSEC TOOLKIT v1.0.0",
    boot1:"> establishing secure connection...",
    boot2:"> verifying integrity... OK",
    boot3:"> masking identity... OK",
    boot4:"> anonymous access granted",
    waiting:"> system idle",
    mods:[
      { name:"PASSWORD ENCRYPTOR", t:"Password Encryptor",
        d:"Encrypts and protects passwords with AES-256, fully local, no data sent to third parties.",
        tags:"AES-256 · i18n" },
      { name:"REPORT BUILDER", t:"Report Builder",
        d:"Generates Backup Logbook reports with date, owner and details of the backed-up database.",
        tags:"Logbook · PDF" },
      { name:"DOCUMENTATION", t:"SIITESCI Documentation",
        d:"Technical documentation index for SIITESCI system modules.",
        tags:"Docs · HTML" }
    ],
    log:[
      "> 03:01:22 connecting to database...",
      "> 03:02:14 backing up tables .......... OK",
      "> 03:05:08 encrypting backup .......... OK",
      "> 03:07:32 backup completed [48,210 rec]",
      "> 03:07:33 integrity verified",
      "> [!] hidden diagnostic entry · classic 10-key sequence"
    ]
  }
};

let lang = "es";
try{ const s = localStorage.getItem("dedsec_lang"); if (s === "en" || s === "es") lang = s; }catch(e){}

/* ---------- DOM ---------- */
const rows  = Array.prototype.slice.call(document.querySelectorAll(".row"));
const ptEl  = document.getElementById("ptitle");
const pdEl  = document.getElementById("pdesc");
const metaEl= document.getElementById("pmeta-tags");
let index = 0, muted = false, feedGen = 0;

/* ---------- audio ---------- */
let actx = null;
function beep(freq, dur){
  if (muted) return;
  try{
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "square"; o.frequency.value = freq; g.gain.value = 0.04;
    o.connect(g); g.connect(actx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  }catch(e){}
}
const blip = () => beep(420, 0.05);
const conf = () => beep(660, 0.12);

/* ---------- render selección + panel ---------- */
function render(){
  const m = T[lang].mods;
  rows.forEach((r,i) => {
    r.classList.toggle("active", i === index);
    if (!m[i]) return;                      // fila sin entrada en mods: no truena
    const nm = r.querySelector(".name"), v = r.querySelector(".value");
    if (nm) nm.textContent = m[i].name;
    if (v)  v.textContent  = T[lang].ready;
  });
  if (m[index]){
    ptEl.textContent = m[index].t;
    pdEl.textContent = m[index].d;
    if (metaEl) metaEl.textContent = m[index].tags;
  }
}

/* ---------- log (reinicia al cambiar idioma) ---------- */
const logEl = document.getElementById("log");
function startLog(){
  const gen = ++feedGen;
  const lines = T[lang].log.concat([T[lang].waiting]);
  logEl.innerHTML = "";
  let li = 0;
  (function feed(){
    if (gen !== feedGen) return;           // cancela si cambió el idioma
    if (li >= lines.length) return;
    const last = li === lines.length - 1;
    const div = document.createElement("div");
    if (last){
      const span = document.createElement("span");
      span.className = "cur";
      span.textContent = lines[li];
      div.appendChild(span);
    } else {
      div.textContent = lines[li];
    }
    logEl.appendChild(div);
    while (logEl.children.length > 6) logEl.removeChild(logEl.firstChild);
    li++;
    setTimeout(feed, 700);
  })();
}

/* ---------- aplicar idioma ---------- */
function setLang(l){
  lang = l;
  document.documentElement.lang = l;
  document.querySelectorAll("[data-k]").forEach(el => {
    const v = T[l][el.getAttribute("data-k")];
    if (v !== undefined) el.textContent = v;
  });
  const btn = document.getElementById("lang");
  if (btn) btn.textContent = l.toUpperCase();
  try{ localStorage.setItem("dedsec_lang", l); }catch(e){}
  render();
  startLog();
}

/* ---------- navegación ---------- */
rows.forEach((r,i) => {
  r.addEventListener("mouseenter", () => { index = i; render(); blip(); });
  r.addEventListener("click", conf);
});
document.addEventListener("keydown", e => {
  if (!bootDone){ skipBoot(); return; }
  switch (e.key){
    case "ArrowDown": case "ArrowRight": index = (index+1) % rows.length; render(); blip(); e.preventDefault(); break;
    case "ArrowUp":   case "ArrowLeft":  index = (index-1+rows.length) % rows.length; render(); blip(); e.preventDefault(); break;
    case "1": index = 0; render(); blip(); break;
    case "2": index = 1; render(); blip(); break;
    case "3": index = 2; render(); blip(); break;
    case "Enter": conf(); window.location = rows[index].getAttribute("href"); break;
  }
});

/* ---------- idioma (botón) ---------- */
const langBtn = document.getElementById("lang");
if (langBtn) langBtn.addEventListener("click", () => { conf(); setLang(lang === "es" ? "en" : "es"); });

/* ---------- mute ---------- */
const muteBtn = document.getElementById("mute");
function setMute(v){
  muted = v;
  muteBtn.textContent = muted ? "[\u266a OFF]" : "[\u266a ON]";
  try{ localStorage.setItem("dedsec_mute", muted ? "1":"0"); }catch(e){}
}
muteBtn.addEventListener("click", () => setMute(!muted));
try{ setMute(localStorage.getItem("dedsec_mute") === "1"); }catch(e){ setMute(false); }

/* ---------- reloj ---------- */
const clockEl = document.getElementById("clock");
function tick(){
  const d = new Date(), p = n => String(n).padStart(2,"0");
  clockEl.textContent = p(d.getHours())+":"+p(d.getMinutes())+":"+p(d.getSeconds());
}
setInterval(tick, 1000); tick();

/* ---------- glitch del título (aleatorio) ---------- */
const titleEl = document.querySelector(".heading");
if (titleEl && !reduceMotion){
  (function glitch(){
    titleEl.classList.add("flick");
    setTimeout(() => titleEl.classList.remove("flick"), 90 + Math.random()*110);
    setTimeout(glitch, 1500 + Math.random()*4200);
  })();
}

/* ---------- lluvia de código (matrix) ---------- */
const cvs = document.getElementById("rain");
if (cvs && cvs.getContext && !reduceMotion){
  const ctx = cvs.getContext("2d");
  const fs = 14, chars = "01ABCDEF<>/{}#$%&*+=アカサタナハマ".split("");
  let drops = [];
  function resize(){
    cvs.width = window.innerWidth; cvs.height = window.innerHeight;
    const cols = Math.floor(cvs.width / fs);
    drops = Array(cols).fill(1);
  }
  resize();
  window.addEventListener("resize", resize);
  setInterval(() => {
    ctx.fillStyle = "rgba(0,0,0,.09)"; ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.fillStyle = "#E5E5E5"; ctx.font = fs + "px monospace";
    for (let i = 0; i < drops.length; i++){
      const c = chars[Math.floor(Math.random()*chars.length)];
      ctx.fillText(c, i*fs, drops[i]*fs);
      if (drops[i]*fs > cvs.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }, 55);
}

/* ---------- intro: solo permite salto anticipado ---------- */
let bootDone = false;
const bootEl = document.getElementById("boot");
function skipBoot(){ if (bootDone) return; bootDone = true; bootEl.classList.add("skip"); conf(); }
if (bootEl){
  bootEl.addEventListener("click", skipBoot);
  setTimeout(() => { bootDone = true; }, 3200);
}

/* ---------- arranque ---------- */
setLang(lang);

/* ═══════════════════════════════════════════════════════════
   EASTER EGG — Código Konami (↑ ↑ ↓ ↓ ← → ← → B A)
   Muestra el mensaje arriba a la derecha y revela el botón secreto.
   ═══════════════════════════════════════════════════════════ */
(function () {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;

  document.addEventListener('keydown', function (e) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = (key === KONAMI[pos]) ? pos + 1 : (key === KONAMI[0] ? 1 : 0);

    // susurro: aparece cuando ya llevas 2+ teclas correctas (pero aún no terminas)
    if (pos >= 2 && pos < KONAMI.length) whisper(pos);

    if (pos === KONAMI.length) { pos = 0; konamiUnlock(); }
  });

  let wEl = null, wTimer = null;
  function whisper(n) {
    if (!wEl) {
      wEl = document.createElement('div');
      wEl.className = 'konami-whisper';
      document.body.appendChild(wEl);
    }
    // puntitos que se van llenando según las teclas acertadas
    wEl.textContent = '> secuencia detectada ' +
      '▰'.repeat(n) + '▱'.repeat(KONAMI.length - n);
    wEl.classList.add('show');
    clearTimeout(wTimer);
    wTimer = setTimeout(() => wEl && wEl.classList.remove('show'), 1200);
  }

  function konamiUnlock() {
    if (wEl) wEl.classList.remove('show');
    // ── mensaje arriba a la derecha ──
    const t = document.createElement('div');
    t.textContent = '☠ CÓDIGO KONAMI ACEPTADO // PROTOCOLO DESBLOQUEADO';
    t.style.cssText =
      'position:fixed;top:20px;right:20px;z-index:9999;' +
      'background:#0A0A0A;color:#fff;border:1px solid rgba(255,255,255,.4);' +
      "font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.05em;" +
      'padding:12px 16px;box-shadow:0 0 20px rgba(255,255,255,.15);' +
      'opacity:0;transition:opacity .25s;';
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);

    // ── revela el botón secreto con animación ──
    const btn = document.getElementById('secret-btn');
    if (btn && !btn.classList.contains('revealed')) {
      btn.classList.add('revealed');
      btn.querySelector('.value').textContent = '[OPEN]';
    }
  }
})();