const PRODUCTS_URL = new URL("../data/products.json", import.meta.url);

function toast(message) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("is-on"), 2800);
}

function mockAction(e) {
  const btn = e.target.closest("[data-mock]");
  if (!btn) return;
  e.preventDefault();
  const kind = btn.getAttribute("data-mock");
  const messages = {
    cart: "Mockup — carrinho desativado (sem checkout).",
    login: "Mockup — login desativado.",
    delivery: "Mockup — delivery sem funcionalidade.",
    favorito: "Mockup — favoritos desativados.",
    app: "Mockup — download do app desativado.",
    default: "Mockup estudantil — ação sem funcionalidade.",
  };
  toast(messages[kind] || messages.default);
}

function setupNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function setupHero() {
  const slides = [...document.querySelectorAll(".hero-slide")];
  const dotsWrap = document.querySelector(".hero-dots");
  if (!slides.length || !dotsWrap) return;
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Slide ${i + 1}`);
    if (i === 0) b.classList.add("is-active");
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
  });
  let idx = 0;
  function go(n) {
    idx = n;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }
  setInterval(() => go((idx + 1) % slides.length), 4500);
}

function foodHue(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function cardHTML(p, delay = 0) {
  const tag = p.tag ? `<span class="tag">${p.tag}</span>` : "";
  const hue = foodHue(p.name);
  return `
  <article class="card" data-cat="${p.cat}" style="animation-delay:${delay}ms">
    <div class="card-media">
      ${tag}
      <div class="food" style="filter:hue-rotate(${hue}deg)" aria-hidden="true"></div>
    </div>
    <div class="card-body">
      <h3>${p.name}</h3>
      <div class="price"><small>R$</small>${p.price}</div>
      <div class="card-actions">
        <button class="btn btn-outline" data-mock="favorito" type="button">♡</button>
        <button class="btn btn-red" data-mock="cart" type="button">Adicionar</button>
      </div>
    </div>
  </article>`;
}

async function loadProducts({ root, filter = "all", limit = null } = {}) {
  if (!root) return;
  const res = await fetch(PRODUCTS_URL);
  const products = await res.json();
  let list = filter === "all" ? products : products.filter((p) => p.cat === filter);
  if (limit) list = list.slice(0, limit);
  root.innerHTML = list.map((p, i) => cardHTML(p, i * 40)).join("");
}

function setupFilters(grid) {
  const chips = document.querySelectorAll(".chip[data-filter]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      loadProducts({ root: grid, filter: chip.dataset.filter });
    });
  });
}

document.addEventListener("click", mockAction);
document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupHero();
  const homeGrid = document.querySelector("#home-products");
  if (homeGrid) loadProducts({ root: homeGrid, limit: 8 });
  const menuGrid = document.querySelector("#menu-products");
  if (menuGrid) {
    loadProducts({ root: menuGrid });
    setupFilters(menuGrid);
  }
});
