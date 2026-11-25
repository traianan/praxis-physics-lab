import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, Play, RotateCcw } from 'lucide-react';
import { audioEngine, BODY_WOOD_PRESETS } from '../audio/AudioEngine';
import { BodyResonanceConfig, BodyWoodId } from '../types/guitar';

type BodyResonancePanelProps = {
  activeFrequency: number;
  onPlaySampleNote: () => void;
  onPlaySampleChord: () => void;
  onConfigChange?: (config: BodyResonanceConfig) => void;
};

const F_MIN = 50;
const F_MAX = 8000;
const DB_MIN = -10;
const DB_MAX = 10;

const LOG_TICKS = [60, 100, 200, 300, 500, 1000, 2000, 4000, 8000];
const DB_TICKS = [-8, -4, 0, 4, 8];

export const BodyResonancePanel: React.FC<BodyResonancePanelProps> = ({
  activeFrequency,
  onPlaySampleNote,
  onPlaySampleChord,
  onConfigChange,
}) => {
  const [config, setConfig] = useState<BodyResonanceConfig>(() => audioEngine.getBodyResonance());
  const [compareRefWood, setCompareRefWood] = useState<'none' | 'spruce' | 'cedar'>('cedar');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync every config change immediately to live Web Audio BiquadFilter chain
  useEffect(() => {
    audioEngine.setBodyResonance(config);
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  // Keep reference overlay smartly set to the opposite wood when switching between Spruce and Cedar
  const handleSelectWood = (woodId: Exclude<BodyWoodId, 'custom'>) => {
    const preset = BODY_WOOD_PRESETS[woodId].config;
    setConfig({
      ...preset,
      helmholtz: { ...preset.helmholtz },
      topPlate: { ...preset.topPlate },
      presence: { ...preset.presence },
      brilliance: { ...preset.brilliance },
    });
    if (woodId === 'spruce') setCompareRefWood('cedar');
    if (woodId === 'cedar') setCompareRefWood('spruce');
  };

  const updateBand = (
    band: 'helmholtz' | 'topPlate' | 'presence',
    field: 'frequency' | 'gain',
    value: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      woodId: 'custom',
      enabled: true,
      [band]: {
        ...prev[band],
        [field]: value,
      },
    }));
  };

  const updateBrilliance = (field: 'frequency' | 'gain', value: number) => {
    setConfig((prev) => ({
      ...prev,
      woodId: 'custom',
      enabled: true,
      brilliance: {
        ...prev.brilliance,
        [field]: value,
      },
    }));
  };

  const activeDescription = useMemo(() => {
    if (config.woodId === 'custom') {
      return 'Profil acustic personalizat: ajustează manual rezonanțele cutiei (A₀, T₁), prezența și amortizarea înaltelor.';
    }
    return BODY_WOOD_PRESETS[config.woodId].acousticCharacter;
  }, [config.woodId]);

  const activeTitle = useMemo(() => {
    if (config.woodId === 'custom') return 'Profil personalizat';
    return BODY_WOOD_PRESETS[config.woodId].name;
  }, [config.woodId]);

  // Draw exact EQ transfer curve on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || 720;
    const height = canvas.clientHeight || 220;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padLeft = 44;
    const padRight = 18;
    const padTop = 18;
    const padBottom = 28;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const freqToX = (f: number) => {
      const clamped = Math.max(F_MIN, Math.min(F_MAX, f));
      const norm = (Math.log10(clamped) - Math.log10(F_MIN)) / (Math.log10(F_MAX) - Math.log10(F_MIN));
      return padLeft + norm * plotW;
    };

    const dbToY = (db: number) => {
      const clamped = Math.max(DB_MIN, Math.min(DB_MAX, db));
      const norm = (clamped - DB_MIN) / (DB_MAX - DB_MIN);
      return padTop + (1 - norm) * plotH;
    };

    // Background
    ctx.fillStyle = '#fafcfa';
    ctx.fillRect(0, 0, width, height);

    // Plot area border
    ctx.strokeStyle = '#d8e2dc';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop, plotW, plotH);

    // Vertical log-frequency gridlines & labels
    ctx.font = '10px "Consolas", monospace';
    ctx.textAlign = 'center';
    LOG_TICKS.forEach((f) => {
      const x = freqToX(f);
      ctx.strokeStyle = f === 100 || f === 1000 ? '#d2ded7' : '#e6eee9';
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();

      ctx.fillStyle = '#53665f';
      const label = f >= 1000 ? `${f / 1000}k` : `${f}`;
      ctx.fillText(label, x, height - 10);
    });

    // Horizontal dB gridlines & labels
    ctx.textAlign = 'right';
    DB_TICKS.forEach((db) => {
      const y = dbToY(db);
      ctx.strokeStyle = db === 0 ? '#9ab1a7' : '#e6eee9';
      ctx.lineWidth = db === 0 ? 1.2 : 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      ctx.fillStyle = db === 0 ? '#13221d' : '#53665f';
      ctx.fillText(`${db > 0 ? '+' : ''}${db} dB`, padLeft - 6, y + 3);
    });

    // Sample frequencies along log scale
    const steps = 240;
    const freqs = new Float32Array(steps);
    const logMin = Math.log10(F_MIN);
    const logMax = Math.log10(F_MAX);
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      freqs[i] = Math.pow(10, logMin + t * (logMax - logMin));
    }

    // Active note fundamental marker (subtle dashed vertical indicator)
    if (activeFrequency >= F_MIN && activeFrequency <= F_MAX) {
      const fx = freqToX(activeFrequency);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#6c877c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx, padTop);
      ctx.lineTo(fx, padTop + plotH);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#53665f';
      ctx.font = '10px "Consolas", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`f₀ ${activeFrequency.toFixed(0)} Hz`, Math.min(fx + 4, padLeft + plotW - 65), padTop + 12);
    }

    // Comparison reference wood dashed curve (e.g. Spruce vs Cedar)
    if (compareRefWood !== 'none' && config.woodId !== compareRefWood) {
      const refCfg = BODY_WOOD_PRESETS[compareRefWood].config;
      const refDb = audioEngine.computeBodyFrequencyResponseDb(freqs, refCfg);
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#0d4a3e';
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      for (let i = 0; i < steps; i++) {
        const x = freqToX(freqs[i]);
        const y = dbToY(refDb[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Active frequency response curve + soft copper fill relative to 0 dB
    const activeDb = audioEngine.computeBodyFrequencyResponseDb(freqs, config);
    const yZero = dbToY(0);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(freqToX(freqs[0]), yZero);
    for (let i = 0; i < steps; i++) {
      ctx.lineTo(freqToX(freqs[i]), dbToY(activeDb[i]));
    }
    ctx.lineTo(freqToX(freqs[steps - 1]), yZero);
    ctx.closePath();
    ctx.fillStyle = 'rgba(184, 93, 43, 0.14)';
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = config.enabled && config.woodId !== 'bypass' ? '#b85d2b' : '#53665f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i < steps; i++) {
      const x = freqToX(freqs[i]);
      const y = dbToY(activeDb[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw band center markers when enabled
    if (config.enabled && config.woodId !== 'bypass') {
      const markers = [
        { label: 'A₀', f: config.helmholtz.frequency },
        { label: 'T₁', f: config.topPlate.frequency },
        { label: 'P', f: config.presence.frequency },
        { label: 'H', f: config.brilliance.frequency },
      ];
      markers.forEach((m) => {
        const fArr = new Float32Array([m.f]);
        const dbVal = audioEngine.computeBodyFrequencyResponseDb(fArr, config)[0];
        const mx = freqToX(m.f);
        const my = dbToY(dbVal);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#b85d2b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#13221d';
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        const labelY = my > padTop + 20 ? my - 8 : my + 15;
        ctx.fillText(m.label, mx, labelY);
      });
    }
  }, [config, compareRefWood, activeFrequency]);

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#13221d]">
              Simulare rezonanță corp chitară (EQ acustic lemn)
            </h3>
            <span className="rounded border border-[#c8dad1] bg-[#edf3f0] px-2 py-0.5 text-[11px] font-mono font-medium text-[#0d4a3e]">
              4-Band Biquad EQ
            </span>
          </div>
          <p className="text-xs text-[#53665f] mt-1">
            Compară profiluri EQ didactice inspirate de Molid, Cedru, Mahon și Arțar; frecvențele și câștigurile nu sunt măsurători ale unui lemn sau instrument anume. Filtrul modifică în timp real sunetul, osciloscopul, spectrul Fourier și înregistrarea .wav.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPlaySampleNote}
            className="px-3 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Audiază coardă</span>
          </button>
          <button
            type="button"
            onClick={onPlaySampleChord}
            className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-medium text-[#13221d] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AudioLines className="w-3.5 h-3.5 text-[#0d4a3e]" />
            <span>Audiază acord complet</span>
          </button>
        </div>
      </div>

      {/* Wood Preset Selector + Molid vs Cedru Quick Comparison */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
          {(['spruce', 'cedar', 'mahogany', 'maple', 'bypass'] as const).map((woodId) => (
            <button
              key={woodId}
              type="button"
              onClick={() => handleSelectWood(woodId)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                config.woodId === woodId
                  ? 'bg-[#0d4a3e] text-white'
                  : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              {BODY_WOOD_PRESETS[woodId].shortName}
            </button>
          ))}
          {config.woodId === 'custom' && (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#b85d2b] text-white">
              Personalizat
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#53665f]">Suprapune referință:</span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {(
              [
                { id: 'none', label: 'Fără' },
                { id: 'spruce', label: 'Molid' },
                { id: 'cedar', label: 'Cedru' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCompareRefWood(opt.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  compareRefWood === opt.id
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4-KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">PROFIL ACUSTIC</div>
          <div className="text-sm font-bold text-[#0d4a3e] mt-1 truncate">{activeTitle}</div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">REZONANȚĂ AER (A₀)</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {config.enabled && config.woodId !== 'bypass'
              ? `${config.helmholtz.frequency} Hz (${config.helmholtz.gain >= 0 ? '+' : ''}${config.helmholtz.gain.toFixed(1)} dB)`
              : '0.0 dB (Plat)'}
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">MOD PLACĂ (T₁)</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {config.enabled && config.woodId !== 'bypass'
              ? `${config.topPlate.frequency} Hz (${config.topPlate.gain >= 0 ? '+' : ''}${config.topPlate.gain.toFixed(1)} dB)`
              : '0.0 dB (Plat)'}
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">ÎNALTE & PROIECȚIE</div>
          <div className="text-base font-bold text-[#b85d2b] mt-0.5 font-mono tabular-nums">
            {config.enabled && config.woodId !== 'bypass'
              ? `${config.brilliance.gain >= 0 ? '+' : ''}${config.brilliance.gain.toFixed(1)} dB @ ${(config.brilliance.frequency / 1000).toFixed(1)}k`
              : '0.0 dB (Plat)'}
          </div>
        </div>
      </div>

      {/* Acoustic Character Note */}
      <div className="rounded-lg bg-[#fafcfa] border border-[#d8e2dc] px-3.5 py-2.5 text-xs text-[#53665f] leading-relaxed">
        <span className="font-semibold text-[#13221d]">Caracter acustic: </span>
        {activeDescription}
      </div>

      {/* Frequency Response Curve Canvas */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#53665f]">
          <span className="font-semibold text-[#13221d]">Curba de răspuns în frecvență (50 Hz – 8 kHz)</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-0.5 bg-[#b85d2b]" />
              Răspuns activ ({activeTitle})
            </span>
            {compareRefWood !== 'none' && config.woodId !== compareRefWood && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 border-t-2 border-dashed border-[#0d4a3e]" />
                Referință {BODY_WOOD_PRESETS[compareRefWood].shortName}
              </span>
            )}
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[210px] rounded-lg border border-[#d8e2dc]"
          aria-label="Grafic răspuns în frecvență al corpului de chitară"
        />
      </div>

      {/* Parametric 4-Band EQ Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Band 1: Helmholtz A0 */}
        <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">1. Rezonanță aer (A₀)</span>
            <span className="font-mono font-semibold text-[#b85d2b] tabular-nums">
              {config.helmholtz.gain >= 0 ? '+' : ''}
              {config.helmholtz.gain.toFixed(1)} dB
            </span>
          </div>
          <input
            type="range"
            min={-8}
            max={8}
            step={0.2}
            value={config.helmholtz.gain}
            onChange={(e) => updateBand('helmholtz', 'gain', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <div className="flex items-center justify-between text-[11px] text-[#53665f]">
            <span>Frecvență</span>
            <span className="font-mono tabular-nums">{config.helmholtz.frequency} Hz</span>
          </div>
          <input
            type="range"
            min={80}
            max={135}
            step={1}
            value={config.helmholtz.frequency}
            onChange={(e) => updateBand('helmholtz', 'frequency', Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        {/* Band 2: Top Plate T1 */}
        <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">2. Placă față (T₁)</span>
            <span className="font-mono font-semibold text-[#b85d2b] tabular-nums">
              {config.topPlate.gain >= 0 ? '+' : ''}
              {config.topPlate.gain.toFixed(1)} dB
            </span>
          </div>
          <input
            type="range"
            min={-8}
            max={8}
            step={0.2}
            value={config.topPlate.gain}
            onChange={(e) => updateBand('topPlate', 'gain', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <div className="flex items-center justify-between text-[11px] text-[#53665f]">
            <span>Frecvență</span>
            <span className="font-mono tabular-nums">{config.topPlate.frequency} Hz</span>
          </div>
          <input
            type="range"
            min={160}
            max={260}
            step={2}
            value={config.topPlate.frequency}
            onChange={(e) => updateBand('topPlate', 'frequency', Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        {/* Band 3: Upper-mid Presence */}
        <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">3. Prezență / Medii</span>
            <span className="font-mono font-semibold text-[#b85d2b] tabular-nums">
              {config.presence.gain >= 0 ? '+' : ''}
              {config.presence.gain.toFixed(1)} dB
            </span>
          </div>
          <input
            type="range"
            min={-8}
            max={8}
            step={0.2}
            value={config.presence.gain}
            onChange={(e) => updateBand('presence', 'gain', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <div className="flex items-center justify-between text-[11px] text-[#53665f]">
            <span>Frecvență</span>
            <span className="font-mono tabular-nums">{config.presence.frequency} Hz</span>
          </div>
          <input
            type="range"
            min={600}
            max={3000}
            step={50}
            value={config.presence.frequency}
            onChange={(e) => updateBand('presence', 'frequency', Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        {/* Band 4: High-shelf Treble */}
        <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">4. Înalte / Amortizare</span>
            <span className="font-mono font-semibold text-[#b85d2b] tabular-nums">
              {config.brilliance.gain >= 0 ? '+' : ''}
              {config.brilliance.gain.toFixed(1)} dB
            </span>
          </div>
          <input
            type="range"
            min={-8}
            max={8}
            step={0.2}
            value={config.brilliance.gain}
            onChange={(e) => updateBrilliance('gain', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <div className="flex items-center justify-between text-[11px] text-[#53665f]">
            <span>Prag raft</span>
            <span className="font-mono tabular-nums">{(config.brilliance.frequency / 1000).toFixed(1)} kHz</span>
          </div>
          <input
            type="range"
            min={2400}
            max={5600}
            step={100}
            value={config.brilliance.frequency}
            onChange={(e) => updateBrilliance('frequency', Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => handleSelectWood('spruce')}
          className="px-2.5 py-1 rounded-md border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-[11px] font-medium text-[#53665f] hover:text-[#13221d] flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Resetează la Molid Sitka</span>
        </button>
      </div>
    </div>
  );
};

