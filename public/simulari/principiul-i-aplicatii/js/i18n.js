(function(global){var data=global.PraxisApplicationsLocales;var STR={ro:data.ro.strings,en:data.en.strings},STEPS={ro:data.ro.steps,en:data.en.steps};
  var I18N = {
    lang: 'ro',
    t: function (key) {
      var d = STR[this.lang] || STR.ro;
      return (d[key] !== undefined) ? d[key] : (STR.ro[key] !== undefined ? STR.ro[key] : key);
    },
    steps: function (id) { return (STEPS[this.lang] || STEPS.ro)[id] || []; },
    apply: function () {
      var self = this;
      document.documentElement.lang = this.lang;
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        el.innerHTML = self.t(el.getAttribute('data-i18n'));
      });
      document.querySelectorAll('[data-lang]').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-lang') === self.lang);
      });
      document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: this.lang } }));
    },
    set: function (lang) {
      if (!STR[lang]) return;
      this.lang = lang;
      try { localStorage.setItem('praxis-language', lang); } catch (e) { /* private mode */ }
      this.apply();
    },
    boot: function () {
      var saved = null;
      try { saved = localStorage.getItem('praxis-language'); } catch (e) { }
      if (saved && STR[saved]) this.lang = saved;
      this.apply();
    }
  };

  global.STR = STR;
  global.STEPS = STEPS;
  global.I18N = I18N;
})(window);
