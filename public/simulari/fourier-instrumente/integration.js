(() => {
  const i18n = window.PraxisI18n;
  const setTitle = () => { document.title = i18n.tr("Analiza Fourier a instrumentelor · Praxis Fizică"); };
  const activate = (buttons, panels, index, focus = false) => {
    buttons.forEach((button, i) => {
      const selected = i === index;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) buttons[index].focus({ preventScroll: true });
    window.dispatchEvent(new Event("resize"));
  };

  function connect(buttons, panelFor) {
    const panels = buttons.map(panelFor);
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activate(buttons, panels, index));
      button.addEventListener("keydown", (event) => {
        const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -index, End: buttons.length - 1 - index }[event.key];
        if (delta === undefined) return;
        event.preventDefault();
        activate(buttons, panels, (index + delta + buttons.length) % buttons.length, true);
      });
    });
  }

  const sectionTabs = [...document.querySelectorAll("#praxis-original > main > .tabs [data-tab]")];
  if (sectionTabs.length) connect(sectionTabs, (button) => document.getElementById(`panel-${button.dataset.tab}`));

  const resultTabs = [...document.querySelectorAll(".result-tabs [role=tab]")];
  if (resultTabs.length) connect(resultTabs, (button) => document.getElementById(button.getAttribute("aria-controls")));

  const guideTabs = [...document.querySelectorAll(".guide-tabs [role=tab]")];
  if (guideTabs.length) connect(guideTabs, (button) => document.getElementById(button.getAttribute("aria-controls")));

  setTitle();
  window.addEventListener("praxis-language-change", setTitle);
})();
