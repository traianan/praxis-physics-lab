import { LabStepper } from "../LabStepper";
import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Play } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { NotationSystem, StringState, SynthesisMethod } from '../../types/guitar';
import { formatMidiLabel } from '../../utils/musicTheory';
import { FourierAnalyzerPanel } from '../FourierAnalyzerPanel';

type Module7SpectrumProps = {
  strings: StringState[];
  notation: NotationSystem;
};

export const Module7Spectrum: React.FC<Module7SpectrumProps> = ({ strings, notation }) => {
  const [sourceMode, setSourceMode] = useState<'synth' | 'mic'>('synth');
  const [synthMethod, setSynthMethod] = useState<SynthesisMethod>('karplus');
  const [selectedStringId, setSelectedStringId] = useState<number>(6);
  const [pickPosition, setPickPosition] = useState<number>(0.22);
  const [damping, setDamping] = useState<number>(0.996);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);

  const selectedString = strings.find((s) => s.id === selectedStringId) ?? strings[5];

  useEffect(() => {
    return () => {
      void audioEngine.stopMicrophone();
    };
  }, []);

  const toggleMicrophone = async () => {
    setMicError(null);
    if (micActive) {
      await audioEngine.stopMicrophone();
      setMicActive(false);
    } else {
      try {
        await audioEngine.startMicrophone();
        setMicActive(true);
      } catch {
        setMicError(
          'Accesul la microfon a fost refuzat sau indisponibil. Permite accesul în browser pentru analiza în timp real.'
        );
        setMicActive(false);
      }
    }
  };

  const triggerSynthNote = (freq = selectedString.openFrequency) => {
    audioEngine.playPluckedString(freq, {
      method: synthMethod,
      pickPosition,
      damping,
      duration: 3.0,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
      {/* Left Control Deck */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#13221d]">Modulul 7: Spectrul și timbrul</h2>
          <p className="text-xs text-[#53665f] mt-1">
            Analizează în timp real spectrul FFT, forma de undă și spectrograma derulantă pentru sinteză sau microfon.
          </p>
        </div>

        {/* Source switch */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Sursă semnal audio</label>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#edf3f0]">
            <button
              type="button"
              onClick={() => {
                setSourceMode('synth');
                if (micActive) void toggleMicrophone();
              }}
              className={`py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                sourceMode === 'synth' ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f]'
              }`}
            >
              Sinteză chitară
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('mic')}
              className={`py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                sourceMode === 'mic' ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f]'
              }`}
            >
              Microfon real
            </button>
          </div>
        </div>

        {sourceMode === 'synth' ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#13221d]">Metodă de sinteză</label>
              <div className="space-y-1">
                {(
                  [
                    { id: 'karplus', name: 'Karplus–Strong (coardă realistă)', desc: 'Impuls + linie întârziere + decaiere naturală' },
                    { id: 'harmonics', name: 'Oscilatoare armonice individuale', desc: 'Sumă de sinusuri cu decaiere diferențiată' },
                    { id: 'periodic', name: 'PeriodicWave (timbru constant)', desc: 'Un singur oscilator cu coeficienți Fourier' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSynthMethod(m.id)}
                    className={`w-full px-3 py-2 rounded-lg border text-left text-xs cursor-pointer ${
                      synthMethod === m.id
                        ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                        : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
                    }`}
                  >
                    <div className="font-semibold">{m.name}</div>
                    <div className={`text-[11px] ${synthMethod === m.id ? 'text-white/80' : 'text-[#53665f]'}`}>
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#13221d]">Coardă liberă de test</label>
              <div className="grid grid-cols-3 gap-1.5">
                {strings
                  .slice()
                  .reverse()
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStringId(s.id);
                        triggerSynthNote(s.openFrequency);
                      }}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-mono cursor-pointer ${
                        selectedStringId === s.id
                          ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                          : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
                      }`}
                    >
                      C{s.id} · {formatMidiLabel(s.openMidi, notation)}
                    </button>
                  ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#13221d]">Poziție ciupire (atac)</span>
                <span className="font-mono font-semibold text-[#b85d2b] tabular-nums">p = {pickPosition.toFixed(2)}</span>
              </div>
              <LabStepper
  min={0.06}
  max={0.48}
  step={0.01}
  value={pickPosition}
  label="Poziție de ciupire"
  onValueChange={(value) => setPickPosition(Number(value))}
/>
            </div>

            {synthMethod === 'karplus' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#13221d]">Factor decaiere (sustain)</span>
                  <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">{damping.toFixed(4)}</span>
                </div>
                <LabStepper
  min={0.985}
  max={0.9985}
  step={0.0005}
  value={damping}
  label="Factor de amortizare"
  onValueChange={(value) => setDamping(Number(value))}
/>
              </div>
            )}

            <button
              type="button"
              data-guitar-quick-action="spectrum"
              onClick={() => triggerSynthNote()}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Ciupește coarda ({formatMidiLabel(selectedString.openMidi, notation)})</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#53665f] leading-relaxed">
              Cântă la o chitară reală, fluieră sau fredonează o notă. Browserul dezactivează anularea ecoului și suprimarea zgomotului pentru a păstra fidelitatea timbrului.
            </p>
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                micActive
                  ? 'bg-[#b85d2b] hover:bg-[#9c4c20] text-white'
                  : 'bg-[#0d4a3e] hover:bg-[#09382f] text-white'
              }`}
            >
              {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{micActive ? 'Oprește microfonul' : 'Pornește microfonul (FFT live)'}</span>
            </button>
            {micError && (
              <div className="rounded-lg border border-[#b85d2b]/40 bg-[#fdf3ee] p-2.5 text-xs text-[#8a3e16]">
                {micError}
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] p-3.5 space-y-1">
          <div className="text-xs font-semibold text-[#0d4a3e]">Ce urmărești în spectrogramă</div>
          <ul className="text-xs text-[#53665f] space-y-1 list-disc list-inside">
            <li>Atacul inițial bogat în armonice înalte</li>
            <li>Stingerea rapidă a armonicelor înalte</li>
            <li>Persistența mai lungă a fundamentalei f₀</li>
          </ul>
        </div>
      </div>

      {/* Right Stage: All 3 synchronized visualizations */}
      <div>
        <FourierAnalyzerPanel
          notation={notation}
          expectedFundamental={sourceMode === 'synth' ? selectedString.openFrequency : null}
          title="Analizator Fourier complet (Spectru · Formă de undă · Spectrogramă)"
          subtitle={
            sourceMode === 'mic'
              ? micActive
                ? 'Microfon activ — captează semnal audio extern fără redare în difuzoare'
                : 'Apasă „Pornește microfonul” pentru a analiza un instrument real'
              : `Sinteză activă: ${synthMethod === 'karplus' ? 'Karplus–Strong' : synthMethod === 'harmonics' ? 'Oscilatoare individuale' : 'PeriodicWave'}`
          }
          defaultView="all"
        />
      </div>
    </div>
  );
};
