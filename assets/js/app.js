(() => {
  const { config, categories, menu, i18n } = window.AB;

  const DEFAULT_LANG = "de";
  const STORE_LANG = "ab.lang";
  const STORE_CART = "ab.cart";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const byId = Object.fromEntries(menu.map((item) => [item.id, item]));
  const money = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  const fmt = (cents) => money.format(cents / 100);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode */ } },
  };

  const state = {
    lang: i18n[storage.get(STORE_LANG)] ? storage.get(STORE_LANG) : DEFAULT_LANG,
    cart: (() => {
      try {
        const saved = JSON.parse(storage.get(STORE_CART) || "{}");
        return Object.fromEntries(Object.entries(saved).filter(([id, qty]) => byId[id] && qty > 0));
      } catch (e) {
        return {};
      }
    })(),
    query: "",
    activeCat: categories[0].id,
    modal: null,
    lastFocus: null,
  };

  const t = (key, vars = {}) => {
    const value = i18n[state.lang][key] ?? i18n[DEFAULT_LANG][key] ?? key;
    return typeof value === "string" ? value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "") : value;
  };
  const text = (item) => item[state.lang] || item[DEFAULT_LANG];
  const qtyOf = (id) => state.cart[id] || 0;

  /* ---------------------------------------------------------------- i18n */

  const applyStatic = () => {
    const root = document.documentElement;
    root.lang = state.lang;
    root.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.title = t("meta.title");

    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        el.setAttribute(attr, t(key));
      });
    });
    $$(".lang__btn").forEach((btn) => {
      const active = btn.dataset.lang === state.lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    $$("[data-address]").forEach((el) => { el.textContent = config.address[state.lang] || config.address.de; });
    $$("[data-phone]").forEach((el) => {
      el.textContent = config.phoneDisplay;
      if (config.phoneHref) el.href = `tel:${config.phoneHref}`;
    });
  };

  const setLang = (lang) => {
    state.lang = i18n[lang] ? lang : DEFAULT_LANG;
    storage.set(STORE_LANG, state.lang);
    applyStatic();
    renderMarquee();
    renderSignature();
    renderMenu();
    renderCart();
    if (state.modal) renderModal();
  };

  /* ------------------------------------------------------------- markup */

  // Dishes without a photo get a gold monogram of their first letter.
  const mediaHtml = (item) => item.img
    ? `<img src="assets/img/${item.img}.webp" alt="" loading="lazy">`
    : `<div class="dish__placeholder"><span>${esc(text(item).name.trim().charAt(0))}</span></div>`;

  const tagsHtml = (item) => [
    item.spicy ? `<span class="tag tag--spicy">${icon("chili")}${esc(t("menu.spicy"))}</span>` : "",
    item.veggie ? `<span class="tag tag--veggie">${icon("leaf")}${esc(t("menu.veggie"))}</span>` : "",
  ].join("");

  const controlHtml = (item) => {
    const qty = qtyOf(item.id);
    if (!qty) {
      return `<button type="button" class="dish__add" data-add="${item.id}">${icon("plus")}<span>${esc(t("menu.add"))}</span></button>`;
    }
    return `<div class="stepper">
      <button type="button" data-dec="${item.id}" aria-label="${esc(t("cart.decrease"))}">${icon("minus")}</button>
      <span>${qty}</span>
      <button type="button" data-inc="${item.id}" aria-label="${esc(t("cart.increase"))}">${icon("plus")}</button>
    </div>`;
  };

  /* ------------------------------------------------------------ marquee */

  const renderMarquee = () => {
    const words = t("marquee");
    const row = words.map((w) => `<span class="marquee__item">${esc(w)}${icon("sparkle")}</span>`).join("");
    $("[data-marquee]").innerHTML = row + row;
  };

  /* ---------------------------------------------------------- signature */

  const renderSignature = () => {
    const items = menu.filter((item) => item.signature);
    $("[data-signature]").innerHTML = items.map((item, i) => {
      const { name, desc } = text(item);
      return `<article class="sig-card" data-reveal data-open-item="${item.id}" tabindex="0" role="button" aria-label="${esc(name)}">
        <img src="assets/img/${item.img}.webp" alt="" loading="lazy">
        <span class="sig-card__index">0${i + 1}</span>
        <h3>${esc(name)}</h3>
        <p>${esc(desc)}</p>
        <div class="sig-card__foot">
          <span class="sig-card__price">${fmt(item.price)}</span>
          <button type="button" class="add-btn" data-add="${item.id}" aria-label="${esc(t("menu.addTo"))}: ${esc(name)}">${icon("plus")}</button>
        </div>
      </article>`;
    }).join("");
    observeReveal($("[data-signature]"));
  };

  /* --------------------------------------------------------------- menu */

  const matches = (item) => {
    if (!state.query) return true;
    const q = state.query.toLowerCase();
    return ["de", "ar"].some((lang) => `${item[lang].name} ${item[lang].desc}`.toLowerCase().includes(q));
  };

  const renderCats = () => {
    $("[data-cats]").innerHTML = categories.map((cat) => {
      const count = menu.filter((item) => item.cat === cat.id && matches(item)).length;
      const active = cat.id === state.activeCat;
      return `<button type="button" class="cat-pill${active ? " is-active" : ""}" data-cat="${cat.id}" role="tab" aria-selected="${active}"${count ? "" : " hidden"}>
        ${icon(cat.icon)}<span>${esc(t(`menu.cat.${cat.id}`))}</span><span class="cat-pill__count">${count}</span>
      </button>`;
    }).join("");
  };

  const dishHtml = (item) => {
    const { name, desc } = text(item);
    return `<article class="dish${qtyOf(item.id) ? " is-in-cart" : ""}" data-open-item="${item.id}" data-dish="${item.id}" tabindex="0">
      <div class="dish__media">${mediaHtml(item)}</div>
      <div class="dish__body">
        <div class="dish__top">
          <h4 class="dish__name">${esc(name)}</h4>
          <span class="dish__leader"></span>
          <span class="dish__price">${fmt(item.price)}</span>
        </div>
        <p class="dish__desc">${esc(desc)}</p>
        <div class="dish__foot">
          <div class="tags">${tagsHtml(item)}</div>
          <div data-control="${item.id}">${controlHtml(item)}</div>
        </div>
      </div>
    </article>`;
  };

  const renderMenu = () => {
    renderCats();
    let total = 0;
    const html = categories.map((cat) => {
      const items = menu.filter((item) => item.cat === cat.id && matches(item));
      total += items.length;
      if (!items.length) return "";
      const note = !state.query && t(`menu.note.${cat.id}`) !== `menu.note.${cat.id}`
        ? `<p class="menu-cat__note">${icon("sparkle")}<span>${esc(t(`menu.note.${cat.id}`))}</span></p>` : "";
      return `<section class="menu-cat" id="cat-${cat.id}" data-menu-cat="${cat.id}">
        <header class="menu-cat__head">
          <h3 class="menu-cat__title">${icon(cat.icon)}${esc(t(`menu.cat.${cat.id}`))}</h3>
          <span class="menu-cat__count">${items.length}</span>
        </header>
        ${note}
        <div class="menu-grid">${items.map(dishHtml).join("")}</div>
      </section>`;
    }).join("");
    $("[data-menu]").innerHTML = html;
    $("[data-menu-empty]").hidden = total > 0;
    observeCats();
  };

  const refreshItem = (id) => {
    const item = byId[id];
    $$(`[data-control="${id}"]`).forEach((el) => { el.innerHTML = controlHtml(item); });
    $$(`[data-dish="${id}"]`).forEach((el) => el.classList.toggle("is-in-cart", qtyOf(id) > 0));
  };

  // Highlight the category pill for the section in view.
  let catObserver;
  const observeCats = () => {
    catObserver?.disconnect();
    catObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setActiveCat(entry.target.dataset.menuCat);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("[data-menu-cat]").forEach((el) => catObserver.observe(el));
  };

  const setActiveCat = (id) => {
    if (state.activeCat === id) return;
    state.activeCat = id;
    $$(".cat-pill").forEach((pill) => {
      const active = pill.dataset.cat === id;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-selected", String(active));
      if (active) {
        const bar = $("[data-cats]");
        const left = pill.offsetLeft - (bar.clientWidth - pill.clientWidth) / 2;
        bar.scrollTo({ left, behavior: "smooth" });
      }
    });
  };

  /* --------------------------------------------------------------- cart */

  const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(state.cart).reduce((sum, [id, qty]) => sum + byId[id].price * qty, 0);

  const setQty = (id, qty) => {
    if (qty > 0) state.cart[id] = Math.min(qty, 99);
    else delete state.cart[id];
    storage.set(STORE_CART, JSON.stringify(state.cart));
    refreshItem(id);
    renderCart();
  };

  const addToCart = (id, amount = 1, source) => {
    setQty(id, qtyOf(id) + amount);
    showToast(t("toast.added", { name: text(byId[id]).name }));
    const btn = $(".cart-btn");
    btn.classList.remove("is-bump");
    void btn.offsetWidth;
    btn.classList.add("is-bump");
    if (source) {
      source.classList.remove("is-added");
      void source.offsetWidth;
      source.classList.add("is-added");
    }
  };

  const renderCart = () => {
    const count = cartCount();
    const total = fmt(cartTotal());
    const entries = Object.entries(state.cart);

    $$("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0 && el.classList.contains("cart-btn__count");
    });
    $$("[data-cart-total]").forEach((el) => { el.textContent = total; });
    $("[data-cart-bar]").hidden = count === 0 || $("[data-drawer]").classList.contains("is-open");
    document.body.classList.toggle("has-cart-bar", count > 0);

    $("[data-cart-empty]").hidden = count > 0;
    $("[data-cart-form]").hidden = count === 0;
    $("[data-cart-foot]").hidden = count === 0;

    $("[data-cart-items]").innerHTML = entries.map(([id, qty]) => {
      const item = byId[id];
      return `<li class="cart-item">
        <div class="cart-item__media">${mediaHtml(item)}</div>
        <div>
          <p class="cart-item__name">${esc(text(item).name)}</p>
          <p class="cart-item__unit">${fmt(item.price)}</p>
        </div>
        <div class="cart-item__side">
          <span class="cart-item__total">${fmt(item.price * qty)}</span>
          <div class="stepper">
            <button type="button" data-dec="${id}" aria-label="${esc(qty === 1 ? t("cart.remove") : t("cart.decrease"))}">${icon(qty === 1 ? "trash" : "minus")}</button>
            <span>${qty}</span>
            <button type="button" data-inc="${id}" aria-label="${esc(t("cart.increase"))}">${icon("plus")}</button>
          </div>
        </div>
      </li>`;
    }).join("");
  };

  const buildMessage = () => {
    const form = $("[data-cart-form]");
    const type = form.querySelector('input[name="type"]:checked').value;
    const name = form.querySelector('input[name="name"]').value.trim();
    const note = form.querySelector('textarea[name="note"]').value.trim();

    const lines = Object.entries(state.cart).map(([id, qty]) => {
      const item = byId[id];
      const label = state.lang === "de" ? item.de.name : `${text(item).name} (${item.de.name})`;
      return `${qty}× ${label} – ${fmt(item.price * qty)}`;
    });

    return [
      `*${t("wa.title")}*`,
      "",
      ...lines,
      "",
      `*${t("wa.total")}: ${fmt(cartTotal())}*`,
      `${t("wa.type")}: ${t(type === "pickup" ? "cart.pickup" : "cart.dinein")}`,
      name ? `${t("wa.name")}: ${name}` : null,
      note ? `${t("wa.note")}: ${note}` : null,
    ].filter((line) => line !== null).join("\n");
  };

  const waBase = () => (config.whatsapp ? `https://wa.me/${config.whatsapp}` : "https://wa.me/");

  const sendOrder = () => {
    if (!cartCount()) return;
    const url = `${waBase()}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener");
  };

  /* ------------------------------------------------------------ overlays */

  const lock = () => {
    const open = $("[data-drawer]").classList.contains("is-open") || state.modal || !$("#mobile-nav").hidden;
    document.body.classList.toggle("is-locked", Boolean(open));
  };

  const openCart = () => {
    state.lastFocus = document.activeElement;
    setMobileNav(false);
    const drawer = $("[data-drawer]");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    $("[data-overlay]").hidden = false;
    $("[data-cart-bar]").hidden = true;
    lock();
    setTimeout(() => $("[data-close-cart]", drawer).focus(), 50);
  };

  const closeCart = () => {
    const drawer = $("[data-drawer]");
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    $("[data-overlay]").hidden = true;
    renderCart();
    lock();
    state.lastFocus?.focus?.();
  };

  const renderModal = () => {
    const { item, qty } = state.modal;
    const { name, desc } = text(item);
    $("[data-modal-media]").innerHTML = mediaHtml(item);
    $("[data-modal-cat]").textContent = t(`menu.cat.${item.cat}`);
    $("[data-modal-title]").textContent = name;
    $("[data-modal-tags]").innerHTML = `<div class="tags">${tagsHtml(item)}</div>`;
    $("[data-modal-desc]").textContent = desc;
    const noteKey = `menu.note.${item.cat}`;
    $("[data-modal-note]").textContent = t(noteKey) === noteKey ? "" : t(noteKey);
    $("[data-modal-qty]").textContent = qty;
    $("[data-modal-price]").textContent = fmt(item.price * qty);
  };

  const openModal = (id) => {
    state.lastFocus = document.activeElement;
    state.modal = { item: byId[id], qty: 1 };
    renderModal();
    $("[data-modal]").hidden = false;
    lock();
    setTimeout(() => $(".modal__close").focus(), 50);
  };

  const closeModal = () => {
    if (!state.modal) return;
    state.modal = null;
    $("[data-modal]").hidden = true;
    lock();
    state.lastFocus?.focus?.();
  };

  const setMobileNav = (open) => {
    const nav = $("#mobile-nav");
    const burger = $(".burger");
    nav.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", t(open ? "nav.close" : "nav.open"));
    lock();
  };

  let toastTimer;
  const showToast = (msg) => {
    const toast = $("[data-toast]");
    $("[data-toast-text]").textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };

  /* -------------------------------------------------------------- events */

  document.addEventListener("click", (e) => {
    const target = e.target;
    const add = target.closest("[data-add]");
    const inc = target.closest("[data-inc]");
    const dec = target.closest("[data-dec]");

    if (add) { e.stopPropagation(); addToCart(add.dataset.add, 1, add); return; }
    if (inc) { setQty(inc.dataset.inc, qtyOf(inc.dataset.inc) + 1); return; }
    if (dec) { setQty(dec.dataset.dec, qtyOf(dec.dataset.dec) - 1); return; }

    const open = target.closest("[data-open-item]");
    if (open) { openModal(open.dataset.openItem); return; }

    if (target.closest("[data-open-cart]")) { openCart(); return; }
    if (target.closest("[data-close-cart]") || target.closest("[data-overlay]")) { closeCart(); return; }
    if (target.closest("[data-close-modal]")) { closeModal(); return; }

    const lang = target.closest("[data-lang]");
    if (lang) { setLang(lang.dataset.lang); return; }

    const cat = target.closest("[data-cat]");
    if (cat) {
      const section = $(`#cat-${cat.dataset.cat}`);
      const offset = $(".header").offsetHeight + $(".menu__bar").offsetHeight + 16;
      window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
      setActiveCat(cat.dataset.cat);
      return;
    }

    if (target.closest(".burger")) { setMobileNav($("#mobile-nav").hidden); return; }
    if (target.closest("#mobile-nav a[href^='#']")) setMobileNav(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (state.modal) closeModal();
      else if ($("[data-drawer]").classList.contains("is-open")) closeCart();
      else if (!$("#mobile-nav").hidden) setMobileNav(false);
    }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-open-item]")) {
      e.preventDefault();
      openModal(e.target.dataset.openItem);
    }
  });

  $("[data-modal-inc]").addEventListener("click", () => { state.modal.qty = Math.min(state.modal.qty + 1, 99); renderModal(); });
  $("[data-modal-dec]").addEventListener("click", () => { state.modal.qty = Math.max(state.modal.qty - 1, 1); renderModal(); });
  $("[data-modal-add]").addEventListener("click", () => {
    const { item, qty } = state.modal;
    closeModal();
    addToCart(item.id, qty);
  });

  $("[data-send-order]").addEventListener("click", sendOrder);

  $("[data-search]").addEventListener("input", (e) => {
    state.query = e.target.value.trim();
    renderMenu();
  });

  /* ------------------------------------------------------ scroll effects */

  const header = $(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$(".nav a");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const href = `#${entry.target.id}`;
      if (entry.isIntersecting) {
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === href));
      } else {
        navLinks.forEach((a) => { if (a.getAttribute("href") === href) a.classList.remove("is-active"); });
      }
    });
  }, { rootMargin: "-50% 0px -50% 0px" });
  ["menu", "about", "order", "gallery", "visit"].forEach((id) => sectionObserver.observe(document.getElementById(id)));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  function observeReveal(root = document) {
    $$("[data-reveal]:not(.is-visible)", root).forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------- embers */

  const startEmbers = () => {
    const canvas = $(".hero__embers");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, particles = [], running = true, frame;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = w < 720 ? 28 : 60;
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const spawn = (anywhere) => ({
      x: Math.random() * w * 0.9 + w * 0.1,
      y: anywhere ? Math.random() * h : h + 10,
      r: Math.random() * 1.8 + 0.5,
      vy: -(Math.random() * 0.7 + 0.25),
      vx: (Math.random() - 0.5) * 0.25,
      sway: Math.random() * Math.PI * 2,
      life: Math.random() * 0.6 + 0.4,
      hue: 22 + Math.random() * 18,
    });

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p, i) => {
        p.sway += 0.02;
        p.x += p.vx + Math.sin(p.sway) * 0.3;
        p.y += p.vy;
        const fade = Math.max(0, Math.min(1, p.y / h)) * p.life;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${0.9 * fade})`);
        g.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        if (p.y < -10) particles[i] = spawn(false);
      });
      frame = requestAnimationFrame(tick);
    };

    new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (running) tick();
    }).observe(canvas);

    window.addEventListener("resize", resize);
    resize();
  };

  /* ---------------------------------------------------------------- init */

  const waLink = config.whatsapp ? `https://wa.me/${config.whatsapp}` : "https://wa.me/";
  $$("[data-whatsapp-link]").forEach((a) => {
    a.href = waLink;
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-social]").forEach((a) => { a.href = config[a.dataset.social] || "#"; });
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  setLang(state.lang);
  observeReveal();
  startEmbers();
})();
