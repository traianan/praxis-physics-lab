import React, { useEffect, useRef, useState } from 'react';
import { Circle, Download, Square, Trash2 } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';

type RecordedClip = {
  url: string;
  blob: Blob;
  samples: Float32Array;
  sampleRate: number;
  durationSec: number;
  filename: string;
};

export const WavRecorderPanel: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [includeMetronome, setIncludeMetronome] = useState<boolean>(false);
  const [liveDuration, setLiveDuration] = useState<number>(0);
  const [livePeak, setLivePeak] = useState<number>(0);
  const [clip, setClip] = useState<RecordedClip | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const meterHistoryRef = useRef<number[]>([]);
  const clipRef = useRef<RecordedClip | null>(null);

  useEffect(() => {
    clipRef.current = clip;
  }, [clip]);

  useEffect(() => {
    return () => {
      if (audioEngine.isRecording()) {
        audioEngine.stopRecording();
      }
      if (clipRef.current) {
        URL.revokeObjectURL(clipRef.current.url);
      }
    };
  }, []);

  const handleStart = () => {
    if (clip) {
      URL.revokeObjectURL(clip.url);
      setClip(null);
    }
    meterHistoryRef.current = [];
    setLiveDuration(0);
    setLivePeak(0);
    audioEngine.startRecording(includeMetronome);
    setIsRecording(true);
  };

  const handleStop = () => {
    const result = audioEngine.stopRecording();
    setIsRecording(false);
    if (!result || result.samples.length === 0) return;

    const url = URL.createObjectURL(result.blob);
    const stamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    setClip({
      url,
      blob: result.blob,
      samples: result.samples,
      sampleRate: result.sampleRate,
      durationSec: result.durationSec,
      filename: `chitara_virtuala_${stamp}.wav`,
    });
  };

  const handleClear = () => {
    if (clip) {
      URL.revokeObjectURL(clip.url);
      setClip(null);
    }
    meterHistoryRef.current = [];
    setLiveDuration(0);
    setLivePeak(0);
  };

  const handleDownloadWav = () => {
    if (!clip) return;
    const link = document.createElement('a');
    link.href = clip.url;
    link.download = clip.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Live meter & recorded waveform Canvas
  useEffect(() => {
    let rafId = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = 110;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);

          ctx.fillStyle = '#fcfdfc';
          ctx.fillRect(0, 0, w, h);

          const cy = h / 2;
          ctx.strokeStyle = '#dce6e1';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, cy);
          ctx.lineTo(w, cy);
          ctx.stroke();

          if (isRecording) {
            const info = audioEngine.getRecordingLiveInfo();
            setLiveDuration(info.durationSec);
            setLivePeak(info.peak);

            const history = meterHistoryRef.current;
            history.push(Math.min(1, info.peak * 1.6));
            if (history.length > Math.floor(w / 4)) {
              history.shift();
            }

            ctx.fillStyle = '#b85d2b';
            history.forEach((amp, idx) => {
              const barH = Math.max(2, amp * (h * 0.84));
              const x = w - (history.length - idx) * 4;
              ctx.fillRect(x, cy - barH / 2, 2.5, barH);
            });
          } else if (clip && clip.samples.length > 0) {
            const total = clip.samples.length;
            const step = Math.max(1, Math.floor(total / w));
            ctx.fillStyle = '#0d4a3e';
            for (let px = 0; px < w; px += 2) {
              const start = Math.floor((px / w) * total);
              const end = Math.min(total, start + step);
              let minV = 0;
              let maxV = 0;
              for (let j = start; j < end; j++) {
                const v = clip.samples[j];
                if (v < minV) minV = v;
                if (v > maxV) maxV = v;
              }
              const yTop = cy - maxV * (h * 0.44);
              const yBot = cy - minV * (h * 0.44);
              ctx.fillRect(px, yTop, 1.5, Math.max(1.5, yBot - yTop));
            }
          } else {
            ctx.fillStyle = '#6c7e77';
            ctx.font = '500 11px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              'Apasă „Începe înregistrarea”, ciupește corzile chitarei și salvează rezultatul în format .wav',
              w / 2,
              cy - 14
            );
          }

          ctx.strokeStyle = '#d8e2dc';
          ctx.lineWidth = 1;
          ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

          ctx.restore();
        }
      }

      if (isRecording) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [isRecording, clip]);

  const displayDuration = isRecording ? liveDuration : clip ? clip.durationSec : 0;
  const estSizeKb = clip
    ? (clip.blob.size / 1024).toFixed(1)
    : ((displayDuration * audioEngine.getSampleRate() * 2 + 44) / 1024).toFixed(1);

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#13221d]">Înregistrare audio și export .wav</h3>
          <p className="text-xs text-[#53665f] mt-0.5">
            Captează direct în browser sunetul generat de corzile chitarei și descarcă fișierul audio necomprimat (WAV 16-bit PCM).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 text-xs text-[#53665f] cursor-pointer select-none mr-1">
            <input
              type="checkbox"
              checked={includeMetronome}
              disabled={isRecording}
              onChange={(e) => setIncludeMetronome(e.target.checked)}
              className="accent-[#0d4a3e] w-3.5 h-3.5 rounded"
            />
            <span>Include metronomul</span>
          </label>

          {!isRecording ? (
            <button
              type="button"
              onClick={handleStart}
              className="px-3.5 py-1.5 rounded-lg bg-[#b85d2b] hover:bg-[#9c4c20] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Circle className="w-3 h-3 fill-current" />
              <span>Începe înregistrarea</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="px-3.5 py-1.5 rounded-lg bg-[#13221d] hover:bg-[#233a33] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Oprește ({liveDuration.toFixed(1)} s)</span>
            </button>
          )}

          {clip && !isRecording && (
            <>
              <button
                type="button"
                onClick={handleDownloadWav}
                className="px-3.5 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Salvează .wav</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                title="Șterge înregistrarea"
                className="p-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-[#53665f] hover:text-[#13221d] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4-KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">DURATĂ ÎNREGISTRARE</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {displayDuration.toFixed(2)} s
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">RATĂ EȘANTIONARE</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {clip ? clip.sampleRate : audioEngine.getSampleRate()} Hz
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">DIMENSIUNE WAV</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {estSizeKb} KB
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">STARE CAPTARE</div>
          <div className={`text-base font-bold mt-0.5 ${isRecording ? 'text-[#b85d2b]' : 'text-[#0d4a3e]'}`}>
            {isRecording
              ? `Înregistrează (${Math.round(livePeak * 100)}%)`
              : clip
              ? 'Pregătită de descărcare'
              : 'Inactiv'}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full rounded-lg block" style={{ height: 110 }} />

      {clip && !isRecording && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <audio controls src={clip.url} className="h-8 flex-1 min-w-[220px]" />
          <span className="text-xs font-mono text-[#53665f] truncate max-w-[260px]">{clip.filename}</span>
        </div>
      )}
    </div>
  );
};

