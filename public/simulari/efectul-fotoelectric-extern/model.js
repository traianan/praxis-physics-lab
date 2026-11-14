export const H=6.62607015e-34,E=1.602176634e-19,C=299792458,ME=9.1093837139e-31,HC=H*C/E*1e9;
export const defaults={wavelength:500,power:200,work:HC/600,voltage:2,efficiency:2};
export function photo(s){
 for(const k of Object.keys(defaults))if(!Number.isFinite(s[k]))throw new RangeError('Nonfinite parameter');
 if(s.wavelength<=0||s.work<=0||s.power<0||s.efficiency<0||s.efficiency>100)throw new RangeError('Invalid physical domain');
 const frequency=C/(s.wavelength*1e-9),photon=HC/s.wavelength,threshold=HC/s.work,excess=photon-s.work,allowed=excess>1e-12,kinetic=allowed?excess:0;
 const flux=s.power*1e-6/(photon*E),emitted=allowed?flux*s.efficiency/100:0,saturation=E*emitted*1e6,stop=allowed?kinetic:null;
 // Illustrative collection law, not a material-specific fit. Saturation at +2 V is a model choice.
 const t=allowed?Math.max(0,Math.min(1,(s.voltage+stop)/(2+stop))):0;
 const fraction=t*t*(3-2*t);
 return {...s,frequency,photon,threshold,thresholdFrequency:s.work*E/H,kinetic,allowed,flux,emitted,saturation,stop,current:saturation*fraction,fraction,speed:Math.sqrt(2*kinetic*E/ME)};
}
export function iv(s,count=181){return Array.from({length:count},(_,i)=>{const voltage=-9+14*i/(count-1);return [voltage,photo({...s,voltage}).current];});}
export function estimateH(a,b){const x=photo(a),y=photo(b);if(!x.allowed||!y.allowed||Math.abs(a.work-b.work)>1e-9||Math.abs(x.frequency-y.frequency)<1)throw new RangeError('Two distinct above-threshold frequencies for the same cathode required');const h=E*(y.stop-x.stop)/(y.frequency-x.frequency);return {h,workEV:(h*x.frequency/E)-x.stop};}
export function experimentSchema(z){const setting=z.object({wavelength:z.number().min(150).max(900),power:z.number().min(0).max(400),work:z.number().min(.5).max(5.5),voltage:z.number().min(-9).max(5),efficiency:z.number().min(0).max(100)}).strict();return z.object({version:z.literal(1),lesson:z.literal('efectul-fotoelectric-extern'),settings:setting,measurements:z.array(setting).max(12)}).strict();}
