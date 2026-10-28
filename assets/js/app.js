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
    activeCat: categories[0],
    modal: null,
    lastFocus: null,
  };

  const t = (key, vars = {}) => {
    const value = i18n[state.lang][key] ?? i18n[DEFAULT_LANG][key] ?? key;
    return value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  };
  const has = (key) => key in i18n[state.lang];
  const text = (item) => item[state.lang] || item[DEFAULT_LANG];
  const qtyOf = (id) => state.cart[id] || 0;

  /* ---------------------------------------------------------------- i18n */

  const applyStatic = () => {
    const root = document.documentElement;
    root.lang = state.lang;
    root.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.title = t("meta.title");

    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
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
    renderSignature();
    renderMenu();
    renderCart();
    if (state.modal) renderModal();
  };

  /* ------------------------------------------------------------- markup */

  const tagsText = (item) => [item.spicy && t("menu.spicy"), item.veggie && t("menu.veggie")].filter(Boolean);

  const controlHtml = (item) => {
    const qty = qtyOf(item.id);
    if (!qty) {
      return `<button type="button" class="add" data-add="${item.id}" aria-label="${esc(t("menu.add"))}: ${esc(text(item).name)}">${icon("plus")}</button>`;
    }
    return `<div class="stepper">
      <button type="button" data-dec="${item.id}" aria-label="${esc(t("cart.decrease"))}">${icon("minus")}</button>
      <span>${qty}</span>
      <button type="button" data-inc="${item.id}" aria-label="${esc(t("cart.increase"))}">${icon("plus")}</button>
    </div>`;
  };

  /* ---------------------------------------------------------- signature */

  const renderSignature = () => {
    const host = $("[data-signature]");
    host.innerHTML = menu.filter((item) => item.signature).map((item) => {
      const { name, desc } = text(item);
      return `<article class="feature" data-reveal data-open-item="${item.id}" tabindex="0" role="button" aria-label="${esc(name)}">
        <div class="feature__img"><img src="assets/img/${item.img}.webp" alt="" loading="lazy"></div>
        <div class="feature__row">
          <h3>${esc(name)}</h3>
          <span class="price">${fmt(item.price)}</span>
        </div>
        <p>${esc(desc)}</p>
        <button type="button" class="btn btn--outline feature__add" data-add="${item.id}">${icon("plus")}<span>${esc(t("menu.addTo"))}</span></button>
      </article>`;
    }).join("");
    observeReveal(host);
  };

  /* --------------------------------------------------------------- menu */

  const matches = (item) => {
    if (!state.query) return true;
    const q = state.query.toLowerCase();
    return ["de", "ar"].some((lang) => `${item[lang].name} ${item[lang].desc}`.toLowerCase().includes(q));
  };

  const renderTabs = () => {
    $("[data-cats]").innerHTML = categories.map((cat) => {
      const count = menu.filter((item) => item.cat === cat && matches(item)).length;
      const active = cat === state.activeCat;
      return `<button type="button" class="tab${active ? " is-active" : ""}" data-cat="${cat}" role="tab" aria-selected="${active}"${count ? "" : " hidden"}>${esc(t(`menu.cat.${cat}`))}</button>`;
    }).join("");
  };

  const itemHtml = (item) => {
    const { name, desc } = text(item);
    const tags = tagsText(item).map((tag) => `<span>${esc(tag)}</span>`).join("");
    return `<article class="item" data-open-item="${item.id}" tabindex="0">
      <div class="item__main">
        <div class="item__head">
          <h4 class="item__name">${esc(name)}</h4>
          <span class="item__leader"></span>
          <span class="item__price price">${fmt(item.price)}</span>
        </div>
        ${desc ? `<p class="item__desc">${esc(desc)}</p>` : ""}
        ${tags ? `<p class="item__tags">${tags}</p>` : ""}
      </div>
      <div data-control="${item.id}">${controlHtml(item)}</div>
    </article>`;
  };

  const renderMenu = () => {
    renderTabs();
    let total = 0;
    $("[data-menu]").innerHTML = categories.map((cat) => {
      const items = menu.filter((item) => item.cat === cat && matches(item));
      total += items.length;
      if (!items.length) return "";
      const noteKey = `menu.note.${cat}`;
      const note = !state.query && has(noteKey) ? `<p class="menu-cat__note">${esc(t(noteKey))}</p>` : "";
      return `<section class="menu-cat" id="cat-${cat}" data-menu-cat="${cat}">
        <header class="menu-cat__head">
          <h3 class="menu-cat__title">${esc(t(`menu.cat.${cat}`))}</h3>
          <span class="menu-cat__count">${items.length}</span>
        </header>
        ${note}
        <div class="menu-grid">${items.map(itemHtml).join("")}</div>
      </section>`;
    }).join("");
    $("[data-menu-empty]").hidden = total > 0;
    observeCats();
  };

  const refreshItem = (id) => {
    $$(`[data-control="${id}"]`).forEach((el) => { el.innerHTML = controlHtml(byId[id]); });
  };

  let catObserver;
  const observeCats = () => {
    catObserver?.disconnect();
    catObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveCat(entry.target.dataset.menuCat); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$("[data-menu-cat]").forEach((el) => catObserver.observe(el));
  };

  const setActiveCat = (cat) => {
    if (state.activeCat === cat) return;
    state.activeCat = cat;
    $$(".tab").forEach((tab) => {
      const active = tab.dataset.cat === cat;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      if (active) {
        const bar = $("[data-cats]");
        bar.scrollTo({ left: tab.offsetLeft - (bar.clientWidth - tab.clientWidth) / 2, behavior: "smooth" });
      }
    });
  };

  /* --------------------------------------------------------------- cart */

  const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(state.cart).reduce((sum, [id, qty]) => sum + byId[id].price * qty, 0);
  const drawerOpen = () => $("[data-drawer]").classList.contains("is-open");

  const setQty = (id, qty) => {
    if (qty > 0) state.cart[id] = Math.min(qty, 99);
    else delete state.cart[id];
    storage.set(STORE_CART, JSON.stringify(state.cart));
    refreshItem(id);
    renderCart();
  };

  const addToCart = (id, amount = 1) => {
    setQty(id, qtyOf(id) + amount);
    showToast(t("toast.added", { name: text(byId[id]).name }));
    const btn = $(".cart-btn");
    btn.classList.remove("is-bump");
    void btn.offsetWidth;
    btn.classList.add("is-bump");
  };

  const renderCart = () => {
    const count = cartCount();
    $$("[data-cart-count]").forEach((el) => { el.textContent = count; });
    $(".cart-btn__count").hidden = count === 0;
    $$("[data-cart-total]").forEach((el) => { el.textContent = fmt(cartTotal()); });
    $("[data-cart-bar]").hidden = count === 0 || drawerOpen();
    document.body.classList.toggle("has-cart-bar", count > 0);

    $("[data-cart-empty]").hidden = count > 0;
    $("[data-cart-form]").hidden = count === 0;
    $("[data-cart-foot]").hidden = count === 0;

    $("[data-cart-items]").innerHTML = Object.entries(state.cart).map(([id, qty]) => {
      const item = byId[id];
      return `<li class="cart-item${item.img ? " cart-item--img" : ""}">
        ${item.img ? `<img class="cart-item__img" src="assets/img/${item.img}.webp" alt="">` : ""}
        <div>
          <p class="cart-item__name">${esc(text(item).name)}</p>
          <p class="cart-item__unit price">${fmt(item.price)}</p>
        </div>
        <div class="cart-item__side">
          <span class="cart-item__total price">${fmt(item.price * qty)}</span>
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

  const waBase = config.whatsapp ? `https://wa.me/${config.whatsapp}` : "https://wa.me/";

  const sendOrder = () => {
    if (!cartCount()) return;
    window.open(`${waBase}?text=${encodeURIComponent(buildMessage())}`, "_blank", "noopener");
  };

  /* ------------------------------------------------------------ overlays */

  const lock = () => {
    const open = drawerOpen() || state.modal || !$("#mobile-nav").hidden;
    document.body.classList.toggle("is-locked", Boolean(open));
    updateHeader();
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
    if (!drawerOpen()) return;
    const drawer = $("[data-drawer]");
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
    $("[data-modal]").classList.toggle("modal--noimg", !item.img);
    $("[data-modal-media]").innerHTML = item.img ? `<img src="assets/img/${item.img}.webp" alt="">` : "";
    $("[data-modal-cat]").textContent = t(`menu.cat.${item.cat}`);
    $("[data-modal-title]").textContent = name;
    $("[data-modal-desc]").textContent = desc;
    $("[data-modal-tags]").textContent = tagsText(item).join(" · ");
    const noteKey = `menu.note.${item.cat}`;
    $("[data-modal-note]").textContent = has(noteKey) ? t(noteKey) : "";
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
    const burger = $(".burger");
    $("#mobile-nav").hidden = !open;
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
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2000);
  };

  /* -------------------------------------------------------------- events */

  document.addEventListener("click", (e) => {
    const target = e.target;
    const add = target.closest("[data-add]");
    const inc = target.closest("[data-inc]");
    const dec = target.closest("[data-dec]");

    if (add) { addToCart(add.dataset.add); return; }
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
      const offset = $(".header").offsetHeight + $(".menu__bar").offsetHeight;
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
      else if (drawerOpen()) closeCart();
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

  // The header is transparent over the hero and turns solid once the page scrolls
  // or the mobile menu is open.
  const header = $(".header");
  function updateHeader() {
    header.classList.toggle("is-solid", window.scrollY > 10 || !$("#mobile-nav").hidden);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });

  const navLinks = $$(".nav a");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const href = `#${entry.target.id}`;
      navLinks.forEach((a) => {
        if (a.getAttribute("href") !== href) {
          if (entry.isIntersecting) a.classList.remove("is-active");
          return;
        }
        a.classList.toggle("is-active", entry.isIntersecting);
      });
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
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  function observeReveal(root = document) {
    $$("[data-reveal]:not(.is-visible)", root).forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------------- init */

  $$("[data-whatsapp-link]").forEach((a) => {
    a.href = waBase;
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-social]").forEach((a) => { a.href = config[a.dataset.social] || "#"; });
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  setLang(state.lang);
  observeReveal();
  updateHeader();
})();
