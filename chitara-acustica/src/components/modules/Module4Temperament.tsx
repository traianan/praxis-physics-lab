import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { MissionId } from '../../types/guitar';
import { centsDifference, JUST_INTONATION_RATIOS } from '../../utils/musicTheory';

type Module4TemperamentProps = {
  onCompleteMission?: (id: MissionId) => void;
};

export const Module4Temperament: React.FC<Module4TemperamentProps> = ({ onCompleteMission }) => {
  const [baseFreq, setBaseFreq] = useState<number>(440);
  const [selectedRatioId, setSelectedRatioId] = useState<string>('fifth');
  const [fineDetuneCents, setFineDetuneCents] = useState<number>(0);

  const rulerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const beatCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const ratioObj = JUST_INTONATION_RATIOS.find((r) => r.id === selectedRatioId) ?? JUST_INTONATION_RATIOS[1];
  const pureFreq = baseFreq * (ratioObj.num / ratioObj.den);
  const temperedFreq = baseFreq * Math.pow(2, (ratioObj.semitones + fineDetuneCents / 100) / 12);

  const pureCents = centsDifference(baseFreq, pureFreq);
  const temperedCents = centsDifference(baseFreq, temperedFreq);
  const diffCents = temperedCents - pureCents;
  const beatFreq = Math.abs(temperedFreq - pureFreq);

  const playPure = () => audioEngine.playDualTones(baseFreq, pureFreq, 2.2, 0.16);
  const playTempered = () => audioEngine.playDualTones(baseFreq, temperedFreq, 2.2, 0.16);
  const playBeatsComparison = () => {
    audioEngine.playDualTones(pureFreq, temperedFreq, 3.0, 0.2);
    if (selectedRatioId === 'fifth') {
      onCompleteMission?.('m6_pure_fifth');
    }
  };

  // Draw 1200-cent ruler comparing Pure Harmonics vs Equal Temperament
  useEffect(() => {
    const canvas = rulerCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(400, Math.floor(rect.width));
    const h = 158;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fcfdfc';
    ctx.fillRect(0, 0, w, h);

    const padL = 28;
    const padR = 28;
    const plotW = w - padL - padR;
    const cToX = (cents: number) => padL + (cents / 1200) * plotW;

    const rulerY = 82;
    ctx.strokeStyle = '#9bb0a7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, rulerY);
    ctx.lineTo(padL + plotW, rulerY);
    ctx.stroke();

    // Draw 12 tempered semitone ticks (0, 100, ..., 1200)
    for (let st = 0; st <= 12; st++) {
      const c = st * 100;
      const x = cToX(c);
      ctx.strokeStyle = st === ratioObj.semitones ? '#0d4a3e' : '#b7c7bf';
      ctx.lineWidth = st === ratioObj.semitones ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x, rulerY - 14);
      ctx.lineTo(x, rulerY + 14);
      ctx.stroke();

      ctx.fillStyle = st === ratioObj.semitones ? '#0d4a3e' : '#53665f';
      ctx.font = '500 10px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${c}`, x, rulerY + 30);
    }

    // Plot all pure natural intervals on top
    JUST_INTONATION_RATIOS.forEach((r) => {
      const c = 1200 * Math.log2(r.num / r.den);
      const x = cToX(c);
      const isActive = r.id === selectedRatioId;
      ctx.fillStyle = isActive ? '#b85d2b' : 'rgba(184, 93, 43, 0.45)';
      ctx.beginPath();
      ctx.arc(x, rulerY - 26, isActive ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (isActive) {
        ctx.strokeStyle = '#b85d2b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x, rulerY - 20);
        ctx.lineTo(x, rulerY);
        ctx.stroke();

        ctx.fillStyle = '#b85d2b';
        ctx.font = '600 11px "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${r.num}:${r.den} (${c.toFixed(1)})`, x, 24);
      }
    });

    ctx.fillStyle = '#53665f';
    ctx.font = '500 10.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Sus (cupru): armonice naturale pure · Jos (verde): semiton temperat egal (100 sutimi)', padL, h - 14);

    ctx.restore();
  }, [selectedRatioId, ratioObj.semitones]);

  // Draw acoustic beats interference waveform
  useEffect(() => {
    const canvas = beatCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(360, Math.floor(rect.width));
    const h = 150;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fcfdfc';
    ctx.fillRect(0, 0, w, h);

    const cy = h / 2;
    ctx.strokeStyle = '#dce6e1';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    // Window duration adapted so beats are clearly visible
    const windowSec = beatFreq > 0.2 ? Math.min(2.5, Math.max(0.25, 3 / beatFreq)) : 1.0;

    ctx.strokeStyle = '#b85d2b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const samples = 520;
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * windowSec;
      const val = 0.5 * (Math.sin(2 * Math.PI * pureFreq * t) + Math.sin(2 * Math.PI * temperedFreq * t));
      const x = (i / samples) * w;
      const y = cy - val * (h * 0.4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Envelope curve
    ctx.strokeStyle = '#0d4a3e';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * windowSec;
      const env = Math.abs(Math.cos(Math.PI * (temperedFreq - pureFreq) * t));
      const x = (i / samples) * w;
      const y = cy - env * (h * 0.4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#53665f';
    ctx.font = '500 10.5px "Consolas", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Fereastră afișată: ${windowSec.toFixed(2)} s · f_bătăi = ${beatFreq.toFixed(2)} Hz`, w - 12, 16);

    ctx.restore();
  }, [pureFreq, temperedFreq, beatFreq]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
      {/* Left Controls */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#13221d]">Modulul 4: Temperament și sutimi de semiton</h2>
          <p className="text-xs text-[#53665f] mt-1">
            Compară intervalele pure din seria armonică naturală cu sistemul modern al temperamentului egal (1200 sutimi de semiton / octavă).
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Notă de referință</label>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {[
              { label: 'A3 (220)', f: 220 },
              { label: 'C4 (262)', f: 261.63 },
              { label: 'A4 (440)', f: 440 },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setBaseFreq(item.f)}
                className={`py-1.5 rounded-md text-xs font-mono font-medium cursor-pointer ${
                  Math.abs(baseFreq - item.f) < 1 ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Interval de comparat</label>
          <div className="space-y-1.5">
            {JUST_INTONATION_RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRatioId(r.id);
                  setFineDetuneCents(0);
                }}
                className={`w-full px-3 py-2 rounded-lg border text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  selectedRatioId === r.id
                    ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                    : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
                }`}
              >
                <span className="font-medium">{r.name}</span>
                <span className={`font-mono ${selectedRatioId === r.id ? 'text-white/90' : 'text-[#53665f]'}`}>
                  {r.num}:{r.den}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">Deviație manuală (sutimi de semiton)</span>
            <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">
              {fineDetuneCents >= 0 ? '+' : ''}{fineDetuneCents} sutimi
            </span>
          </div>
          <input
            type="range"
            min={-40}
            max={40}
            step={1}
            value={fineDetuneCents}
            onChange={(e) => setFineDetuneCents(Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={playPure}
              className="py-2 px-3 rounded-lg border border-[#d8e2dc] bg-[#edf3f0] hover:bg-[#dce8e2] text-xs font-semibold text-[#13221d] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#b85d2b]" />
              <span>Interval Pur</span>
            </button>
            <button
              type="button"
              onClick={playTempered}
              className="py-2 px-3 rounded-lg border border-[#d8e2dc] bg-[#edf3f0] hover:bg-[#dce8e2] text-xs font-semibold text-[#13221d] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#0d4a3e]" />
              <span>Temperat</span>
            </button>
          </div>
          <button
            type="button"
            onClick={playBeatsComparison}
            className="w-full py-2.5 px-4 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Ascultă bătăile (Pur vs Temperat)</span>
          </button>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] p-3.5 space-y-1">
          <div className="text-xs font-semibold text-[#0d4a3e]">Formula sutimilor de semiton</div>
          <div className="font-mono text-sm font-semibold text-[#13221d]">s = 1200 · log₂(f₂ / f₁)</div>
          <p className="text-xs text-[#53665f]">1 semiton temperat = 100 sutimi de semiton · 1 octavă = 1200 sutimi de semiton.</p>
        </div>
      </div>

      {/* Right Stage */}
      <div className="space-y-5">
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">INTERVAL PUR ({ratioObj.num}:{ratioObj.den})</div>
              <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {pureFreq.toFixed(2)} Hz
                <span className="block text-[11px] font-normal text-[#53665f]">{pureCents.toFixed(2)} sutimi</span>
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">TEMPERAMENT EGAL</div>
              <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {temperedFreq.toFixed(2)} Hz
                <span className="block text-[11px] font-normal text-[#53665f]">{temperedCents.toFixed(2)} sutimi</span>
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">DIFERENȚĂ (SUTIMI DE SEMITON)</div>
              <div className="text-lg font-bold text-[#b85d2b] mt-0.5 font-mono tabular-nums">
                {diffCents >= 0 ? '+' : ''}{diffCents.toFixed(2)} sutimi
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">FRECVENȚĂ BĂTĂI |Δf|</div>
              <div className="text-lg font-bold text-[#0d4a3e] mt-0.5 font-mono tabular-nums">
                {beatFreq.toFixed(2)} Hz
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-[#13221d]">Rigla sutimilor de semiton (0 – 1200 într-o octavă)</h3>
            <div className="rounded-xl border border-[#d8e2dc] overflow-hidden">
              <canvas ref={rulerCanvasRef} className="w-full block" style={{ height: 158 }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#13221d]">Interferența și bătăile acustice</h3>
              <span className="text-xs text-[#53665f]">
                Când două sunete sunt foarte apropiate ca frecvență, amplitudinea oscilează cu frecvența |f₂ − f₁|.
              </span>
            </div>
            <div className="rounded-xl border border-[#d8e2dc] overflow-hidden">
              <canvas ref={beatCanvasRef} className="w-full block" style={{ height: 150 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

