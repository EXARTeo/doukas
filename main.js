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
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src){
  lightboxImg.src = src;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox(){
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  document.body.style.overflow = "";
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    // Close if you click outside the image
    if (e.target === lightbox) closeLightbox();
  });
}

/* Click thumbnails */
document.querySelectorAll(".gallery__item").forEach(btn => {
  btn.addEventListener("click", () => {
    const src = btn.getAttribute("data-src");
    if (src) openLightbox(src);
  });
});

/* "Φωτογραφίες" button scrolls to that gallery */
document.querySelectorAll(".js-open-gallery").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-gallery");
    const gallery = document.querySelector(`.gallery[data-gallery="${key}"]`);
    if (gallery) gallery.scrollIntoView({ behavior: "smooth", block: "center" });
  });
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
