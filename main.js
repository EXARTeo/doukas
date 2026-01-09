const nav = document.getElementById("nav");

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ACTIVE LINK HIGHLIGHT */
const navLinks = Array.from(document.querySelectorAll(".nav__group a, #mobileNav a"))
  .filter(a => a.getAttribute("href")?.startsWith("#"));

const linkMap = new Map(navLinks.map(a => [a.getAttribute("href"), a]));

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = `#${entry.target.id}`;
    const link = linkMap.get(id);
    if (!link) return;

    if (entry.isIntersecting) {
      // Clear desktop active
      document.querySelectorAll(".nav__group a").forEach(a => a.classList.remove("is-active"));
      // Set active in desktop nav only (mobile is fine without underline)
      const desktop = document.querySelector(`.nav__group a[href=\"${id}\"]`);
      if (desktop) desktop.classList.add("is-active");
    }
  });
}, { threshold: 0.45 });

["apartments", "amenities", "location", "contact"].forEach(id => {
  const el = document.getElementById(id);
  if (el) activeObserver.observe(el);
});

/* MOBILE MENU */
const toggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileNav");

function closeMobile(){
  if (!toggle || !mobileMenu) return;
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "MENU";
  mobileMenu.hidden = true;
  document.body.style.overflow = "";
}

function openMobile(){
  if (!toggle || !mobileMenu) return;
  toggle.setAttribute("aria-expanded", "true");
  toggle.textContent = "CLOSE";
  mobileMenu.hidden = false;
  document.body.style.overflow = "hidden";
}

if (toggle && mobileMenu) {
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMobile() : openMobile();
  });

  mobileMenu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) return closeMobile();
    // Click on empty overlay closes
    if (e.target === mobileMenu) closeMobile();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && !mobileMenu.hidden) closeMobile();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMobile();
    closeLightbox();
  }
});

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
  // If mobile nav is open, keep body locked
  const navOpen = toggle && toggle.getAttribute("aria-expanded") === "true";
  document.body.style.overflow = navOpen ? "hidden" : "";
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
    const gallery = document.querySelector(`.gallery[data-gallery=\"${key}\"]`);
    if (gallery) gallery.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
