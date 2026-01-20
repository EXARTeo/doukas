// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* REVEAL ON SCROLL */
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* LIGHTBOX */

/* LIGHTBOX (prev/next + swipe + keyboard) */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

let lbSet = [];
let lbIndex = 0;

function renderLightbox(){
  const src = lbSet[lbIndex] || "";
  lightboxImg.src = src;

  const multi = lbSet.length > 1;
  if (lightboxPrev) lightboxPrev.style.display = multi ? "" : "none";
  if (lightboxNext) lightboxNext.style.display = multi ? "" : "none";
}

function openLightbox(src, set = [src], index = 0){
  lbSet = Array.isArray(set) && set.length ? set : [src];
  lbIndex = Number.isFinite(index) ? index : 0;

  renderLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox(){
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  lbSet = [];
  lbIndex = 0;
  document.body.style.overflow = "";
}

function stepLightbox(dir){
  if (lbSet.length <= 1) return;
  lbIndex = (lbIndex + dir + lbSet.length) % lbSet.length;
  renderLightbox();
}

function openLightboxFromEl(el){
  const src = el.getAttribute("data-src");
  if (!src) return;

  // Σετάρει “σετ” εικόνων από το κοντινότερο container (carousel ή gallery)
  const container = el.closest('[data-carousel], [data-gallery]') || document;
  const items = Array
    .from(container.querySelectorAll('[data-src]'))
    .filter(n => n.getAttribute("data-src"));

  const set = items.map(n => n.getAttribute("data-src"));
  const idx = Math.max(0, items.indexOf(el));

  openLightbox(src, set, idx);
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

if (lightboxPrev) lightboxPrev.addEventListener("click", () => stepLightbox(-1));
if (lightboxNext) lightboxNext.addEventListener("click", () => stepLightbox(1));

if (lightbox) {
  // Κλείσιμο αν πατήσεις έξω από την εικόνα
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Swipe (κινητό): αριστερά/δεξιά για prev/next
  let tStartX = 0, tStartY = 0;

  lightbox.addEventListener("touchstart", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.touches.length !== 1) return; // αφήνει pinch-zoom ή multi-touch
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (!tStartX && !tStartY) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - tStartX;
    const dy = t.clientY - tStartY;

    // μόνο “καθαρό” οριζόντιο swipe
    if (Math.abs(dx) > 45 && Math.abs(dy) < 35) {
      stepLightbox(dx < 0 ? 1 : -1);
    }
    tStartX = 0; tStartY = 0;
  }, { passive: true });
}

// Keyboard: Esc, ArrowLeft, ArrowRight
document.addEventListener("keydown", (e) => {
  if (!lightbox || !lightbox.classList.contains("is-open")) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") stepLightbox(-1);
  if (e.key === "ArrowRight") stepLightbox(1);
});

/* Triggers: thumbnails / carousel slides (οτιδήποτε έχει data-src) */
document.querySelectorAll('[data-src]').forEach(el => {
  el.addEventListener("click", () => openLightboxFromEl(el));
});



/* ACTIVE NAV LINK (adds/removes .is-active) */
(() => {
  const nav = document.getElementById("nav");
  if (!nav) return;

  // Πιάνουμε links από desktop nav + (αν υπάρχει) mobile nav
  const allLinks = [
    ...document.querySelectorAll('#nav a[href^="#"]'),
    ...document.querySelectorAll('#mobileNav a[href^="#"]'),
  ];

  // κρατάμε μόνο anchors τύπου #section
  const navLinks = allLinks.filter(a => {
    const h = a.getAttribute("href");
    return h && h.startsWith("#") && h.length > 1;
  });

  if (!navLinks.length) return;

  // Map: "#amenities" -> [<a>, <a>...] (desktop+mobile)
  const linkMap = new Map();
  for (const a of navLinks) {
    const href = a.getAttribute("href");
    if (!linkMap.has(href)) linkMap.set(href, []);
    linkMap.get(href).push(a);
  }

  // Targets που θα παρακολουθεί ο observer
  const hero = document.querySelector("section.hero"); // για #top (αν έχεις link #top)
  const targets = [];

  // Αν υπάρχει #top link, κάνε το hero "στόχο"
  if (hero && linkMap.has("#top")) targets.push({ el: hero, href: "#top" });

  // Για κάθε άλλο href βρες το αντίστοιχο section
  for (const href of linkMap.keys()) {
    if (href === "#top") continue;
    const el = document.querySelector(href);
    if (el) targets.push({ el, href });
  }

  let currentHref = null;

  const setActive = (href) => {
    if (!href || href === currentHref) return;
    currentHref = href;

    // καθάρισμα
    for (const arr of linkMap.values()) {
      arr.forEach(a => a.classList.remove("is-active"));
    }

    // ενεργοποίηση (desktop + mobile, αν υπάρχουν)
    const activeArr = linkMap.get(href);
    if (activeArr) activeArr.forEach(a => a.classList.add("is-active"));
  };

  // Άμεσο highlight όταν πατάς link
  navLinks.forEach(a => {
    a.addEventListener("click", () => setActive(a.getAttribute("href")));
  });

  let observer = null;

  const setupObserver = () => {
    const navH = nav.getBoundingClientRect().height || 0;

    if (observer) observer.disconnect();

    observer = new IntersectionObserver((entries) => {
      // Πάρε το πιο “κυρίαρχο” intersecting section
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible.length) return;

      const topEntry = visible[0];
      const match = targets.find(t => t.el === topEntry.target);
      if (match) setActive(match.href);
    }, {
      // ώστε να μην “μπερδεύεται” κάτω από sticky nav
      rootMargin: `-${Math.round(navH + 12)}px 0px -55% 0px`,
      threshold: [0.25, 0.45, 0.6],
    });

    targets.forEach(t => observer.observe(t.el));
  };

  setupObserver();

  // Αν αλλάξει ύψος nav σε resize (mobile), ξαναστήσε observer
  window.addEventListener("resize", setupObserver, { passive: true });

  // Αρχικό active (αν φορτώσει στη μέση)
  setTimeout(() => {
    const navH = nav.getBoundingClientRect().height || 0;
    const line = navH + 18;

    // βρες το τελευταίο section που έχει περάσει κάτω από το nav
    const passed = targets
      .map(t => ({ ...t, top: t.el.getBoundingClientRect().top }))
      .filter(x => x.top <= line)
      .sort((a, b) => b.top - a.top)[0];

    if (passed) setActive(passed.href);
    else if (linkMap.has("#top")) setActive("#top");
  }, 60);
})();
