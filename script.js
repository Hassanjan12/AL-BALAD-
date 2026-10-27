(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");

  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  };

  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setNav(false);
  });

  // Menu tabs
  const tabs = document.querySelectorAll(".tab");
  const dishes = document.querySelectorAll(".dish");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const group = tab.dataset.tab;

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });

      dishes.forEach((dish) => {
        dish.hidden = dish.dataset.group !== group;
      });
    });
  });

  // Reservation form
  const form = document.getElementById("reserve-form");
  const msg = document.getElementById("form-msg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("input[required]").forEach((input) => {
      const ok = input.value.trim() !== "";
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok) valid = false;
    });

    if (!valid) {
      msg.textContent = "الرجاء تعبئة الحقول المطلوبة";
      msg.classList.add("is-error");
      return;
    }

    msg.classList.remove("is-error");
    const name = form.name.value.trim();
    msg.textContent = `شكراً ${name}! استلمنا طلب حجزك، وبنتواصل معك قريباً.`;
    form.reset();
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();
