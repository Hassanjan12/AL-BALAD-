(() => {
  const DEFAULT_LANG = "de";
  const STORAGE_KEY = "lang";

  // Static UI text. Keys match data-i18n / data-i18n-html / data-i18n-attr in index.html.
  const I18N = {
    de: {
      "brand.aria": "Grill Al Balad – Startseite",
      "brand.mark": "G",
      "lang.label": "Sprache",
      "nav.open": "Menü öffnen",
      "nav.close": "Menü schließen",
      "nav.menu": "Speisekarte",
      "nav.about": "Über uns",
      "nav.gallery": "Impressionen",
      "nav.visit": "Besuch",
      "nav.reserve": "Reservieren",
      "hero.eyebrow": "Holzkohlegrill • Arabische Küche",
      "hero.title": 'Feuer der Holzkohle<br><span class="accent">Geschmack der Heimat</span>',
      "hero.lead": "Lamm, Hähnchen und Kebab vom Holzkohlegrill, frisches Brot aus dem Tanoor-Ofen und arabische Vorspeisen. Herzlich willkommen!",
      "hero.cta": "Tisch reservieren",
      "hero.menu": "Zur Speisekarte",
      "hero.word": "Balad",
      "scroll": "Nach unten",
      "menu.eyebrow": "Aus unserer Küche",
      "menu.title": "Speisekarte",
      "menu.sub": "Preise in Euro (€). Eine Auswahl, die vollständige Karte gibt es im Restaurant.",
      "menu.tabsLabel": "Kategorien der Speisekarte",
      "menu.tab.mezze": "Vorspeisen",
      "menu.tab.grill": "Grill",
      "menu.tab.sandwiches": "Sandwiches",
      "menu.tab.sweets": "Desserts",
      "about.eyebrow": "Unsere Küche",
      "about.title": "Holzkohle, Brot und Gastfreundschaft",
      "about.p1": "Bei uns steht der Grill im Mittelpunkt. Lamm, Hähnchen und Gemüse garen über echter Holzkohle, und unser Brot kommt frisch aus dem Tanoor-Ofen.",
      "about.p2": "Wir laden alle ein, die arabische Küche lieben: ob zum ersten Mal oder seit Jahren. Setzen Sie sich zu uns, wir kümmern uns um den Rest.",
      "about.v1": "<strong>Holzkohlegrill</strong> für Fleisch und Gemüse",
      "about.v2": "<strong>Brot aus dem Tanoor-Ofen</strong>, hausgemacht",
      "about.v3": "<strong>Herzliche Gastfreundschaft</strong> vom ersten Moment an",
      "about.s1.num": "Holzkohle",
      "about.s1.label": "Grill über echter Glut",
      "about.s2.num": "Tanoor",
      "about.s2.label": "Brot frisch aus dem Ofen",
      "about.s3.num": "Draußen",
      "about.s3.label": "Sitzplätze an der Straße",
      "gallery.eyebrow": "Momente bei uns",
      "gallery.title": "Impressionen",
      "gallery.a": "Glut & Feuer",
      "gallery.b": "Gemütlich essen",
      "gallery.c": "Wand der Städte",
      "gallery.d": "Abendstimmung",
      "visit.eyebrow": "Besuchen Sie uns",
      "visit.title": "Besuch & Öffnungszeiten",
      "visit.hoursTitle": "Öffnungszeiten",
      "visit.hours1.days": "Montag – Sonntag",
      "visit.hours1.time": "[Zeiten eintragen]",
      "visit.contactTitle": "Kontakt",
      "visit.phone": "+49 [Telefonnummer]",
      "visit.addressLabel": "Adresse:",
      "visit.address": "[Adresse eintragen]",
      "visit.mapLabel": "Kartenplatzhalter",
      "visit.map": "[Google-Maps-Link hier einfügen]",
      "reserve.eyebrow": "Reservierung",
      "reserve.title": "Tisch reservieren",
      "reserve.sub": "Füllen Sie das Formular aus. Wir bestätigen Ihre Reservierung telefonisch.",
      "form.name": "Name",
      "form.phone": "Telefon",
      "form.date": "Datum",
      "form.time": "Uhrzeit",
      "form.guests": "Personen",
      "form.submit": "Reservierung bestätigen",
      "form.required": "Bitte füllen Sie alle Pflichtfelder aus.",
      "form.success": "Danke, {name}! Wir haben Ihre Anfrage erhalten und melden uns in Kürze.",
      "footer.tag": "Holzkohle, Gewürz & Heimat.",
      "footer.rights": "Alle Rechte vorbehalten.",
    },
    ar: {
      "brand.aria": "Grill Al Balad - الرئيسية",
      "brand.mark": "ب",
      "lang.label": "اللغة",
      "nav.open": "فتح القائمة",
      "nav.close": "إغلاق القائمة",
      "nav.menu": "المنيو",
      "nav.about": "قصتنا",
      "nav.gallery": "الأجواء",
      "nav.visit": "الموقع",
      "nav.reserve": "احجز طاولة",
      "hero.eyebrow": "مشاوي على الفحم الطبيعي • مطبخ عربي",
      "hero.title": 'نار الفحم<br><span class="accent">وطعم البلد</span>',
      "hero.lead": "مشاوي لحم وفراخ وكباب على الجمر، وخبز طازج من التنور، ومقبلات عربية. أهلاً فيك!",
      "hero.cta": "احجز طاولتك",
      "hero.menu": "شوف المنيو",
      "hero.word": "بلد",
      "scroll": "انزل لتحت",
      "menu.eyebrow": "من مطبخنا",
      "menu.title": "المنيو",
      "menu.sub": "الأسعار باليورو (€). قائمة مختارة، والمنيو الكامل متوفر في المحل.",
      "menu.tabsLabel": "أقسام المنيو",
      "menu.tab.mezze": "المقبلات",
      "menu.tab.grill": "المشاوي",
      "menu.tab.sandwiches": "الساندويشات",
      "menu.tab.sweets": "الحلويات",
      "about.eyebrow": "مطبخنا",
      "about.title": "فحم، خبز، وضيافة",
      "about.p1": "المشوي هو قلب المحل. اللحم والخضار بيتشووا على فحم طبيعي، والخبز طازج من التنور.",
      "about.p2": "بنرحب بكل واحد بيحب الأكل العربي، سواء أول مرة أو من سنين. اقعد معنا، واترك الباقي علينا.",
      "about.v1": "<strong>مشاوي على الفحم</strong> للحم والخضار",
      "about.v2": "<strong>خبز من التنور</strong>، مخبوز عندنا",
      "about.v3": "<strong>ضيافة دافئة</strong> من أول لقمة",
      "about.s1.num": "فحم",
      "about.s1.label": "شوي على جمر حقيقي",
      "about.s2.num": "تنور",
      "about.s2.label": "خبز طازج من الفرن",
      "about.s3.num": "برا",
      "about.s3.label": "كراسي على الرصيف",
      "gallery.eyebrow": "لحظات من عنّا",
      "gallery.title": "الأجواء",
      "gallery.a": "الفحم والنار",
      "gallery.b": "سفرة العيلة",
      "gallery.c": "جدار البلاد",
      "gallery.d": "ليلة السهرة",
      "visit.eyebrow": "زورونا",
      "visit.title": "الموقع والمواعيد",
      "visit.hoursTitle": "أوقات الدوام",
      "visit.hours1.days": "الاثنين – الأحد",
      "visit.hours1.time": "[أدخل الأوقات]",
      "visit.contactTitle": "تواصل معنا",
      "visit.phone": "+49 [رقم الهاتف]",
      "visit.addressLabel": "العنوان:",
      "visit.address": "[أدخل العنوان]",
      "visit.mapLabel": "مكان الخريطة",
      "visit.map": "[ضع رابط خريطة جوجل هنا]",
      "reserve.eyebrow": "احجز مكانك",
      "reserve.title": "احجز طاولتك",
      "reserve.sub": "عبّي البيانات وبنأكد الحجز عبر الهاتف.",
      "form.name": "الاسم",
      "form.phone": "رقم الهاتف",
      "form.date": "التاريخ",
      "form.time": "الوقت",
      "form.guests": "عدد الأشخاص",
      "form.submit": "تأكيد الحجز",
      "form.required": "الرجاء تعبئة الحقول المطلوبة",
      "form.success": "شكراً {name}! استلمنا طلب حجزك، وبنتواصل معك قريباً.",
      "footer.tag": "نار الفحم وطعم البلد.",
      "footer.rights": "جميع الحقوق محفوظة.",
    },
  };

  // Menu data. Names are shown in the active language; prices are in euros.
  const GROUPS = ["mezze", "grill", "sandwiches", "sweets"];

  const MENU = [
    { g: "mezze", de: "Hummus", ar: "حمص", p: "4,50", d: "" },
    { g: "mezze", de: "Mutabal", ar: "متبل باذنجان", p: "4,50", d: "Aubergine mit Sesampaste" },
    { g: "mezze", de: "Baba Ghanoush", ar: "بابا غنوج", p: "4,50", d: "Aubergine mit Granatapfel" },
    { g: "mezze", de: "Muhammara", ar: "محمرة", p: "3,50", d: "hausgemachte rote Soße" },
    { g: "mezze", de: "Weinblätter", ar: "ورق عنب", p: "7,00", d: "gefüllt mit Reis" },
    { g: "mezze", de: "Halloumi-Salat", ar: "سلطة حلومي", p: "8,00", d: "mit gebratener Aubergine" },
    { g: "mezze", de: "Taboulé", ar: "تبولة", p: "7,00", d: "" },
    { g: "mezze", de: "Fattoush", ar: "فتوش", p: "6,00", d: "" },
    { g: "mezze", de: "Börek mit Käse", ar: "سمبوسك جبنة", p: "6,00", d: "" },
    { g: "mezze", de: "Kibbe (1 Stück)", ar: "كبة مقلية", p: "2,50", d: "gefüllt mit Fleisch" },
    { g: "mezze", de: "Gegrillte Kibbe (1 Stück)", ar: "كبة مشوية", p: "3,50", d: "gefüllt mit Fleisch" },
    { g: "mezze", de: "Albalad-Salat", ar: "سلطة البلد", p: "8,00", d: "mit Hähnchen" },
    { g: "mezze", de: "Krautsalat", ar: "سلطة ملفوف", p: "4,50", d: "" },
    { g: "mezze", de: "Pommes", ar: "بطاطا مقلية", p: "4,50", d: "" },
    { g: "mezze", de: "Mix-Vorspeise", ar: "مازة مشكلة", p: "8,00", d: "Hummus, Mutabal und Baba Ghanoush" },

    { g: "grill", de: "Lammkebab", ar: "كباب غنم", p: "14,00", d: "" },
    { g: "grill", de: "Lamm Stücke", ar: "شقف غنم", p: "16,00", d: "" },
    { g: "grill", de: "Mix Grill", ar: "مشاوي مشكل", p: "16,50", d: "Hackfleisch und Lammkotelett" },
    { g: "grill", de: "Lammkotelett", ar: "ريش غنم", p: "18,00", d: "" },
    { g: "grill", de: "Lamm-Leber", ar: "كبدة غنم", p: "14,00", d: "" },
    { g: "grill", de: "Gegrillter Fisch", ar: "سمكة مشوية", p: "18,00", d: "" },
    { g: "grill", de: "Kufte-Spieß", ar: "كباب كفتة", p: "16,50", d: "" },
    { g: "grill", de: "Adana-Spieß", ar: "كباب أضنة", p: "16,50", d: "" },
    { g: "grill", de: "Auberginen-Kebab", ar: "كباب باذنجان", p: "16,50", d: "" },
    { g: "grill", de: "Shish Tawouk", ar: "شيش طاووق", p: "13,50", d: "" },
    { g: "grill", de: "Marina", ar: "مارينا", p: "13,50", d: "" },
    { g: "grill", de: "Halbes Hähnchen vom Grill", ar: "نص فروج مشوي", p: "10,50", d: "" },

    { g: "sandwiches", de: "Schawarma Chicken", ar: "شاورما دجاج", p: "4,50", d: "" },
    { g: "sandwiches", de: "Schawarma Dürüm", ar: "شاورما دورم", p: "6,50", d: "mit Hähnchenfleisch und gebratenem Gemüse" },
    { g: "sandwiches", de: "Gebratenes Gemüse", ar: "خضار مقلية", p: "6,50", d: "" },
    { g: "sandwiches", de: "Halloumi (vegetarisch)", ar: "حلومي", p: "6,50", d: "" },
    { g: "sandwiches", de: "Falafel", ar: "فلافل", p: "5,00", d: "" },
    { g: "sandwiches", de: "Hamburger", ar: "برغر", p: "6,00", d: "" },
    { g: "sandwiches", de: "Crispy Cheeseburger", ar: "برغر دجاج", p: "6,00", d: "" },
    { g: "sandwiches", de: "Cheeseburger", ar: "برغر جبنة", p: "6,50", d: "" },
    { g: "sandwiches", de: "Lammkebab", ar: "كباب غنم", p: "9,00", d: "Hackfleisch" },

    { g: "sweets", de: "Baklava", ar: "بقلاوة", p: "5,00", d: "4 Stück" },
    { g: "sweets", de: "Milchreis", ar: "مهلبية", p: "2,50", d: "hausgemacht" },
    { g: "sweets", de: "Katayef", ar: "قطايف", p: "1,50", d: "" },
  ];

  const nav = document.getElementById("nav");
  const navToggle = document.querySelector(".nav-toggle");
  const menuTabs = document.querySelector(".menu-tabs");
  const menuGrid = document.querySelector(".menu-grid");
  const form = document.getElementById("reserve-form");
  const msg = document.getElementById("form-msg");

  let lang = DEFAULT_LANG;
  let activeGroup = GROUPS[0];
  let navOpen = false;
  let formMsg = null; // { key, vars, error } so the message can be re-translated

  const t = (key, vars = {}) => {
    const table = I18N[lang] || I18N[DEFAULT_LANG];
    const text = table[key] ?? I18N[DEFAULT_LANG][key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
  };

  const setNav = (open) => {
    navOpen = open;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", t(open ? "nav.close" : "nav.open"));
  };

  const renderMenu = () => {
    menuTabs.innerHTML = "";
    GROUPS.forEach((group) => {
      const tab = document.createElement("button");
      const active = group === activeGroup;
      tab.type = "button";
      tab.className = "tab" + (active ? " is-active" : "");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(active));
      tab.textContent = t(`menu.tab.${group}`);
      tab.addEventListener("click", () => {
        activeGroup = group;
        renderMenu();
      });
      menuTabs.appendChild(tab);
    });

    menuGrid.innerHTML = "";
    MENU.filter((item) => item.g === activeGroup).forEach((item) => {
      const card = document.createElement("article");
      card.className = "dish";

      const head = document.createElement("div");
      head.className = "dish-head";

      const title = document.createElement("h3");
      title.textContent = lang === "ar" ? item.ar : item.de;

      const price = document.createElement("span");
      price.className = "price";
      price.textContent = `${item.p} €`;

      head.append(title, price);
      card.appendChild(head);

      if (item.d) {
        const desc = document.createElement("p");
        desc.textContent = item.d;
        card.appendChild(desc);
      }
      menuGrid.appendChild(card);
    });
  };

  const renderFormMsg = () => {
    if (!formMsg) {
      msg.textContent = "";
      return;
    }
    msg.textContent = t(formMsg.key, formMsg.vars);
    msg.classList.toggle("is-error", Boolean(formMsg.error));
  };

  const applyStaticText = () => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        el.setAttribute(attr.trim(), t(key.trim()));
      });
    });
  };

  const setLang = (next) => {
    lang = I18N[next] ? next : DEFAULT_LANG;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar"
      ? "Grill Al Balad | مشاوي على الفحم"
      : "Grill Al Balad | Holzkohlegrill & arabische Küche";

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    applyStaticText();
    setNav(navOpen);
    renderMenu();
    renderFormMsg();
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // Storage can be blocked (private mode); the page still works without it.
    }
  };

  const savedLang = (() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  })();

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  navToggle.addEventListener("click", () => setNav(!navOpen));
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setNav(false);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("input[required]").forEach((input) => {
      const ok = input.value.trim() !== "";
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok) valid = false;
    });

    if (!valid) {
      formMsg = { key: "form.required", error: true };
    } else {
      formMsg = { key: "form.success", vars: { name: form.name.value.trim() }, error: false };
      form.reset();
    }
    renderFormMsg();
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  setLang(savedLang && I18N[savedLang] ? savedLang : DEFAULT_LANG);
})();
