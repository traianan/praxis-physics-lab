/* ==========================================================================
   Exemple: instrumente, comparații, piese celebre, claviatură
   ========================================================================== */
(function () {
  'use strict';
  const App = window.App;
  const { $, $$, clamp, fmt, audio, colors } = App;

  const INSTRUMENT_LABELS = {
    piano: 'Pian', violin: 'Vioară', organ: 'Orgă', guitar: 'Chitară',
    clarinet: 'Clarinet', flute: 'Flaut', trumpet: 'Trompetă', bass: 'Contrabas'
  };

  /* ── Rețetele vizuale din carduri ────────────────────────────────────── */
  function renderRecipeBars() {
    $$('.recipe-bars[data-recipe]').forEach((box) => {
      const rec = audio.recipeFor(box.dataset.recipe);
      const max = Math.max.apply(null, rec) || 1;
      box.innerHTML = '';
      rec.slice(0, 8).forEach((a, i) => {
        const bar = document.createElement('i');
        bar.style.height = Math.max(4, Math.round((a / max) * 100)) + '%';
        bar.title = 'Armonica ' + (i + 1) + ': ' + Math.round((a / max) * 100) + '%';
        box.appendChild(bar);
      });
    });
  }

  /* ── Redare instrumente ──────────────────────────────────────────────── */
  function playInstrument(name, note) {
    const midi = App.noteToMidi(note || 'A4');
    const f = App.midiToFreq(midi);
    audio.playTone(f, null, { instrument: name, duration: 2.4, gain: 0.68 });
    App.ui.toast(INSTRUMENT_LABELS[name] + ' · ' + App.midiName(midi) + ' · ' + fmt(f, 1) + ' Hz.');
  }

  function initInstruments() {
    renderRecipeBars();
    $$('[data-play-instrument]').forEach((btn) => btn.addEventListener('click', () => {
      playInstrument(btn.dataset.playInstrument, btn.dataset.playNote);
    }));
    $$('[data-decompose]').forEach((btn) => btn.addEventListener('click', () => {
      App.fourier.setDecompSource(btn.dataset.decompose);
    }));
  }

  /* ── Comparație pian / vioară / orgă ─────────────────────────────────── */
  let compareTimers = [];
  function stopCompare() {
    compareTimers.forEach((t) => clearTimeout(t));
    compareTimers = [];
    audio.stopAll();
  }

  function compareTimbres() {
    stopCompare();
    const seq = [
      { inst: 'piano', label: 'Pian', delay: 0 },
      { inst: 'violin', label: 'Vioară', delay: 1550 },
      { inst: 'organ', label: 'Orgă', delay: 3100 }
    ];
    seq.forEach((item) => {
      compareTimers.push(setTimeout(() => {
        audio.playTone(440, null, { instrument: item.inst, duration: 1.4, gain: 0.66 });
        App.ui.toast(item.label + ' · aceeași notă La4, alt spectru.');
      }, item.delay));
    });
  }

  function initCompare() {
    const start = $('#compare-timbres');
    if (start) start.addEventListener('click', compareTimbres);
    const stop = $('#compare-stop');
    if (stop) stop.addEventListener('click', stopCompare);
  }

  /* ── Piese ───────────────────────────────────────────────────────────── */
  const PIECES = {
    'fur-elise': {
      title: 'Für Elise', composer: 'Ludwig van Beethoven', instrument: 'piano', bpm: 112,
      notes: [
        ['E5', .5], ['D#5', .5], ['E5', .5], ['D#5', .5], ['E5', .5], ['B4', .5], ['D5', .5], ['C5', .5], ['A4', 1.5],
        ['C4', .5], ['E4', .5], ['A4', .5], ['B4', 1.5],
        ['E4', .5], ['G#4', .5], ['B4', .5], ['C5', 1.5],
        ['E4', .5], ['E5', .5], ['D#5', .5], ['E5', .5], ['D#5', .5], ['E5', .5], ['B4', .5], ['D5', .5], ['C5', .5], ['A4', 1.5],
        ['C4', .5], ['E4', .5], ['A4', .5], ['B4', 1.5],
        ['E4', .5], ['C5', .5], ['B4', .5], ['A4', 2]
      ]
    },
    ode: {
      title: 'Oda bucuriei', composer: 'Ludwig van Beethoven', instrument: 'violin', bpm: 100,
      notes: [
        ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1],
        ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['E4', 1.5], ['D4', .5], ['D4', 2],
        ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1],
        ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['D4', 1.5], ['C4', .5], ['C4', 2]
      ]
    },
    minuet: {
      title: 'Menuet în Sol major', composer: 'Christian Petzold (atribuit cândva lui J. S. Bach)', instrument: 'organ', bpm: 116,
      notes: [
        ['D5', 1], ['G4', .5], ['A4', .5], ['B4', .5], ['C5', .5], ['D5', 1], ['G4', 1], ['G4', 1],
        ['E5', 1], ['C5', .5], ['D5', .5], ['E5', .5], ['F#5', .5], ['G5', 1], ['G4', 1], ['G4', 1],
        ['C5', 1], ['D5', .5], ['C5', .5], ['B4', .5], ['A4', .5], ['B4', 1], ['C5', .5], ['B4', .5], ['A4', .5], ['G4', .5], ['F#4', 1], ['G4', 2]
      ]
    },
    nachtmusik: {
      title: 'Eine kleine Nachtmusik', composer: 'Wolfgang Amadeus Mozart', instrument: 'violin', bpm: 120,
      notes: [
        ['G4', .5], ['D4', .5], ['G4', .5], ['D4', .5], ['G4', .5], ['D4', .5], ['G4', .5], ['B4', .5], ['D5', 1],
        ['G5', .5], ['D5', .5], ['G5', .5], ['D5', .5], ['G5', .5], ['D5', .5], ['G5', .5], ['B5', .5], ['D5', 1],
        ['C5', .5], ['A4', .5], ['C5', .5], ['A4', .5], ['C5', .5], ['A4', .5], ['C5', .5], ['E5', .5], ['A5', 1],
        ['D5', .5], ['B4', .5], ['D5', .5], ['B4', .5], ['D5', .5], ['B4', .5], ['D5', .5], ['G5', .5], ['B5', 1]
      ]
    }
  };

  let currentHandle = null;
  let progressRaf = 0;
  let currentPiece = null;

  function timeText(seconds) {
    const s = Math.max(0, Math.round(seconds));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function setPieceUI(id) {
    $$('[data-piece-card]').forEach((card) => card.classList.toggle('playing', card.dataset.pieceCard === id));
  }

  function resetPieceUI() {
    setPieceUI(null);
    const now = $('#piece-now');
    const sub = $('#piece-sub');
    const time = $('#piece-time');
    const prog = $('#piece-progress');
    const note = $('#piece-note-label');
    if (now) now.textContent = 'Alege o piesă';
    if (sub) sub.textContent = 'Apasă „Redă” pe unul dintre carduri.';
    if (time) time.textContent = '0:00';
    if (prog) prog.style.width = '0%';
    if (note) note.textContent = '—';
  }

  function stopPiece() {
    if (currentHandle) {
      try { currentHandle.stop(); } catch (e) { /* ignore */ }
      currentHandle = null;
    }
    currentPiece = null;
    cancelAnimationFrame(progressRaf);
    resetPieceUI();
  }

  function highlightKey(note, ms) {
    const key = $('#keyboard [data-note="' + note + '"]');
    if (!key) return;
    key.classList.add('active');
    setTimeout(() => key.classList.remove('active'), ms || 170);
  }

  function playPiece(id) {
    const piece = PIECES[id];
    if (!piece) return;
    stopPiece();
    currentPiece = id;
    setPieceUI(id);
    const now = $('#piece-now');
    const sub = $('#piece-sub');
    if (now) now.textContent = piece.title;
    if (sub) sub.textContent = piece.composer + ' · ' + INSTRUMENT_LABELS[piece.instrument] + ' · fragment didactic';
    const noteEl = $('#piece-note-label');

    const handle = audio.playSequence(piece.notes, piece.instrument, piece.bpm, {
      onNote(name) {
        if (currentHandle !== handle) return;
        const midi = App.noteToMidi(name);
        const f = App.midiToFreq(midi);
        if (noteEl) noteEl.textContent = App.midiName(midi) + ' · ' + fmt(f, 1) + ' Hz';
        highlightKey(name, 180);
      },
      onEnd() {
        if (currentHandle !== handle) return;
        currentHandle = null;
        setPieceUI(null);
        if (noteEl) noteEl.textContent = 'final';
        const prog = $('#piece-progress');
        if (prog) prog.style.width = '100%';
        const time = $('#piece-time');
        if (time) time.textContent = timeText(handle.total) + ' / ' + timeText(handle.total);
      }
    });
    if (!handle) { resetPieceUI(); return; }
    currentHandle = handle;

    cancelAnimationFrame(progressRaf);
    const total = handle.total;
    function tick() {
      if (currentHandle !== handle) return;
      const ctx = audio.ctx;
      const elapsed = ctx ? clamp(ctx.currentTime - handle.startedAt, 0, total) : 0;
      const prog = $('#piece-progress');
      const time = $('#piece-time');
      if (prog) prog.style.width = Math.min(100, (elapsed / total) * 100) + '%';
      if (time) time.textContent = timeText(elapsed) + ' / ' + timeText(total);
      if (elapsed < total + 0.15) progressRaf = requestAnimationFrame(tick);
    }
    tick();
    App.ui.toast(piece.title + ' · ' + INSTRUMENT_LABELS[piece.instrument] + '.');
  }

  function initPieces() {
    $$('[data-piece]').forEach((btn) => btn.addEventListener('click', () => playPiece(btn.dataset.piece)));
    const stop = $('#piece-stop');
    if (stop) stop.addEventListener('click', stopPiece);
    resetPieceUI();
  }

  /* ── Claviatură ──────────────────────────────────────────────────────── */
  const WHITE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'];
  const BLACK = [
    ['C#4', 0], ['D#4', 1], ['F#4', 3], ['G#4', 4], ['A#4', 5],
    ['C#5', 7], ['D#5', 8], ['F#5', 10], ['G#5', 11], ['A#5', 12]
  ];
  let keyboardBuilt = false;

  function playKeyboardNote(note) {
    const inst = $('#keyboard-instrument') ? $('#keyboard-instrument').value : 'piano';
    const midi = App.noteToMidi(note);
    const f = App.midiToFreq(midi);
    audio.playTone(f, null, { instrument: inst, duration: 1.3, gain: 0.62 });
    const label = $('#keyboard-note');
    if (label) label.textContent = App.midiName(midi) + ' · ' + fmt(f, 1) + ' Hz';
  }

  function initKeyboard() {
    const kb = $('#keyboard');
    if (!kb || keyboardBuilt) return;
    keyboardBuilt = true;
    kb.innerHTML = '';
    const whiteW = 100 / WHITE.length;
    WHITE.forEach((note, i) => {
      const key = document.createElement('button');
      key.type = 'button';
      key.className = 'key white';
      key.dataset.note = note;
      key.style.left = (i * whiteW) + '%';
      key.textContent = App.midiName(App.noteToMidi(note));
      key.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        key.classList.add('active');
        playKeyboardNote(note);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => {
        key.addEventListener(ev, () => key.classList.remove('active'));
      });
      kb.appendChild(key);
    });
    BLACK.forEach(([note, whiteIndex]) => {
      const key = document.createElement('button');
      key.type = 'button';
      key.className = 'key black';
      key.dataset.note = note;
      const width = whiteW * 0.62;
      key.style.width = width + '%';
      key.style.left = ((whiteIndex + 1) * whiteW - width / 2) + '%';
      key.setAttribute('aria-label', App.midiName(App.noteToMidi(note)));
      key.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        key.classList.add('active');
        playKeyboardNote(note);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => {
        key.addEventListener(ev, () => key.classList.remove('active'));
      });
      kb.appendChild(key);
    });
  }

  function init() {
    initInstruments();
    initCompare();
    initPieces();
    initKeyboard();
    App.spectrum.register($('#live-spectrum-examples'), $('#spectrum-empty-examples'));
  }

  App.examples = {
    init,
    playInstrument,
    playPiece,
    stopPiece
  };
})();
