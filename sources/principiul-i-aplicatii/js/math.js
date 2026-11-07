/* ==========================================================================
   math.js — randator minimal de formule (fără nicio bibliotecă externă)
   Suportă: \frac{}{}  \sqrt{}  ^{} _{}  \Delta \gamma \nu \cdot \ln \lg
            \Rightarrow \Leftrightarrow \Longleftrightarrow \equiv \approx
            \mathrm{} \text{} \quad \qquad \, \;  și litere/cifre.
   Ieșirea este HTML+CSS (clasele .fx, .frac, .sqr din styles.css).
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------------- symbol & command tables ---------------- */
  var GREEK = {
    Delta: 'Δ', delta: 'δ', gamma: 'γ', Gamma: 'Γ', theta: 'θ', lambda: 'λ',
    mu: 'μ', nu: 'ν', rho: 'ρ', pi: 'π', Pi: 'Π', sigma: 'σ', tau: 'τ',
    omega: 'ω', Omega: 'Ω', alpha: 'α', beta: 'β', epsilon: 'ε'
  };
  var OPS = {
    cdot: '·', times: '×', div: '÷', pm: '±', mp: '∓',
    equiv: '≡', approx: '≈', neq: '≠', leq: '≤', geq: '≥',
    Rightarrow: '⇒', Leftrightarrow: '⇔', Longleftrightarrow: '⟺',
    Rightarrow2: '⇒', to: '→', arrow: '→', propto: '∝', infty: '∞',
    sum: '∑', partial: '∂', nabla: '∇', ldots: '…', cdots: '⋯',
    int: '∫', iint: '∬', oint: '∮', prime: '′', square: '□'
  };
  var FUNCS = { ln: 'ln', lg: 'lg', log: 'log', exp: 'exp', sin: 'sin', cos: 'cos', tan: 'tan' };
  var SPACES = { ',': '0.17em', ';': '0.28em', ':': '0.33em', ' ': '0.25em', quad: '1em', qquad: '2em' };

  /* ------------------------------ tokenizer ------------------------------ */
  function tokenize(src) {
    var t = [], i = 0, n = src.length;
    while (i < n) {
      var c = src[i];
      if (c === '\\') {
        var j = i + 1, cmd = '';
        while (j < n && /[a-zA-Z]/.test(src[j])) { cmd += src[j]; j++; }
        if (cmd) { t.push({ k: 'cmd', v: cmd }); i = j; }
        else if (j < n) { t.push({ k: 'cmd', v: src[j] }); i = j + 1; }
        else { i = j; }
      } else if (/[a-zA-Z]/.test(c)) { t.push({ k: 'var', v: c }); i++; }
      else if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        var num = ''; while (i < n && /[0-9.]/.test(src[i])) { num += src[i]; i++; }
        t.push({ k: 'num', v: num });
      } else if (c === '{') { t.push({ k: 'o' }); i++; }
      else if (c === '}') { t.push({ k: 'c' }); i++; }
      else if (c === '^') { t.push({ k: 'sup' }); i++; }
      else if (c === '_') { t.push({ k: 'sub' }); i++; }
      else if (/\s/.test(c)) { i++; }
      else { t.push({ k: 'op', v: c }); i++; }
    }
    return t;
  }

  /* ------------------------------- parser -------------------------------- */
  function Parser(tokens) { this.t = tokens; this.i = 0; }
  Parser.prototype.peek = function () { return this.t[this.i]; };
  Parser.prototype.eat = function () { return this.t[this.i++]; };

  Parser.prototype.group = function () {
    var tk = this.peek();
    if (!tk) return '';
    if (tk.k === 'o') {
      this.eat();
      var html = '';
      while (this.i < this.t.length && this.peek().k !== 'c') html += this.node();
      if (this.peek() && this.peek().k === 'c') this.eat();
      return html;
    }
    // single-token group (e.g. x^2, V_i)
    return this.node();
  };

  Parser.prototype.atom = function () {
    var tk = this.eat();
    if (!tk) return '';
    switch (tk.k) {
      case 'var': return '<i class="mi">' + tk.v + '</i>';
      case 'num': return '<span class="mn">' + tk.v + '</span>';
      case 'op':
        if (tk.v === '(' || tk.v === ')' || tk.v === '[' || tk.v === ']')
          return '<span class="paren">' + tk.v + '</span>';
        if (tk.v === ',') return '<span class="mo">,</span>';
        return '<span class="mo">' + esc(tk.v) + '</span>';
      case 'o': {
        /* acolada a fost deja consumată de eat() de mai sus */
        var inner = '';
        while (this.i < this.t.length && this.peek().k !== 'c') inner += this.node();
        if (this.peek() && this.peek().k === 'c') this.eat();
        return '<span class="grp">' + inner + '</span>';
      }
      case 'cmd': return this.command(tk.v);
      default: return '';
    }
  };

  Parser.prototype.command = function (name) {
    if (name === 'frac' || name === 'tfrac' || name === 'dfrac') {
      var a = this.group(), b = this.group();
      return '<span class="frac"><span class="num">' + a + '</span><span class="den">' + b + '</span></span>';
    }
    if (name === 'sqrt') {
      return '<span class="sqr"><span class="rad">√</span><span class="body">' + this.group() + '</span></span>';
    }
    if (name === 'mathrm' || name === 'text' || name === 'mathbf' || name === 'operatorname') {
      var cls = name === 'mathbf' ? 'txt' : 'txt';
      return '<span class="' + cls + '">' + plain(this.group()) + '</span>';
    }
    if (SPACES[name] !== undefined) return '<span style="display:inline-block;width:' + SPACES[name] + '"></span>';
    if (name === 'left' || name === 'right') {
      var tk = this.peek();
      if (tk && tk.k === 'op') { this.eat(); return '<span class="paren">' + esc(tk.v) + '</span>'; }
      if (tk && tk.k === 'cmd' && tk.v === '.') { this.eat(); return ''; }
      return '';
    }
    if (GREEK[name]) return '<i class="mi">' + GREEK[name] + '</i>';
    if (FUNCS[name]) return '<span class="txt">' + FUNCS[name] + '</span>';
    if (OPS[name]) return '<span class="op">' + OPS[name] + '</span>';
    if (name === '.') return '';
    if (name === "'") return '<span class="mo">\u2032</span>';
    return '<span class="txt">' + esc(name) + '</span>';
  };

  Parser.prototype.node = function () {
    var html = this.atom();
    // scripts: x_i^2 or x^2_i
    while (this.peek() && (this.peek().k === 'sup' || this.peek().k === 'sub')) {
      var kind = this.eat().k;
      var body = this.group();
      html += kind === 'sup' ? '<sup>' + body + '</sup>' : '<sub>' + body + '</sub>';
    }
    return html;
  };

  Parser.prototype.run = function () {
    var out = '';
    while (this.i < this.t.length) {
      var tk = this.peek();
      if (tk.k === 'c') { this.eat(); continue; }
      out += this.node();
    }
    return out;
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* \mathrm{J/(mol\cdot K)} must keep operators readable, drop italics.
     Se lucrează doar pe HTML-ul generat intern — fără dependență de DOM. */
  function plain(html) {
    var txt = String(html)
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
    return esc(txt).replace(/·/g, '&nbsp;·&nbsp;');
  }

  /* ------------------------------- public -------------------------------- */
  function render(src) {
    if (!src) return '';
    try { return new Parser(tokenize(src)).run(); }
    catch (e) { return '<span class="txt">' + esc(src) + '</span>'; }
  }

  function typeset(root) {
    (root || document).querySelectorAll('[data-fx],[data-fx-inline]').forEach(function (el) {
      if (el.dataset.rendered === '1') return;
      var key = el.hasAttribute('data-fx') ? 'data-fx' : 'data-fx-inline';
      el.innerHTML = render(el.getAttribute(key));
      el.dataset.rendered = '1';
      if (key === 'data-fx-inline') el.className = (el.className + ' fx').trim();
    });
  }

  /* re-render a node after its data-fx changed */
  function refresh(el) {
    el.dataset.rendered = '0';
    var key = el.hasAttribute('data-fx') ? 'data-fx' : 'data-fx-inline';
    el.innerHTML = render(el.getAttribute(key));
    el.dataset.rendered = '1';
  }

  /* ------------------------------ helpers -------------------------------- */
  var Util = {
    /* zecimale cu virgulă, stil românesc; group = mii cu punct */
    num: function (x, dec) {
      if (!isFinite(x)) return '∞';
      dec = dec === undefined ? 2 : dec;
      var s = Math.abs(x).toFixed(dec);
      var parts = s.split('.');
      var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      var out = int + (parts[1] ? ',' + parts[1] : '');
      return (x < 0 ? '−' : '') + out;
    },
    /* notație științifică cu virgulă: 4·10⁻⁷ */
    sci: function (x, dec) {
      if (x === 0) return '0';
      dec = dec === undefined ? 2 : dec;
      var e = Math.floor(Math.log(Math.abs(x)) / Math.LN10);
      var m = x / Math.pow(10, e);
      var sup = String(e).replace(/-/g, '⁻').replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]; });
      return Util.num(m, dec) + '·10' + sup;
    },
    clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    /* umple track-ul sliderului (variabila CSS --fill) */
    paint: function (input) {
      var min = +input.min || 0, max = +input.max || 100;
      var pct = ((+input.value - min) / (max - min)) * 100;
      input.style.setProperty('--fill', pct.toFixed(1) + '%');
    }
  };

  global.MathJ = { render: render, typeset: typeset, refresh: refresh };
  global.Util = Util;
})(window);
