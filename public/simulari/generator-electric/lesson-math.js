/** Explicit mathematical hosts keep prose, translation and notation separate. */
const tex=String.raw;
const theory={
 'θ = θ_0 + ωt':tex`\theta=\theta_0+\omega t`,
 'Φ = BA cos θ':tex`\Phi=BA\cos\theta`,
 'e = -d(NΦ)/dt = NBAω sin θ':tex`e=-\frac{\mathrm{d}(N\Phi)}{\mathrm{d}t}=NBA\omega\sin\theta`,
 'i = e/(R+r)':tex`i=\frac{e}{R+r}`,
 'u = Ri':tex`u=Ri`,
 'P_mec = ei = i^2 R + i^2 r':tex`P_{\mathrm{mec}}=ei=i^2R+i^2r`,
 'τ_em = -NBAi sin θ':tex`\tau_{\mathrm{em}}=-NBAi\sin\theta`,
 'E_max = NBA|ω|':tex`E_{\max}=NBA\lvert\omega\rvert`,
 'E_ef = E_max/√2':tex`E_{\mathrm{ef}}=\frac{E_{\max}}{\sqrt{2}}`,
 'f = |ω|/(2π)':tex`f=\frac{\lvert\omega\rvert}{2\pi}`
};
export const workedEquations=[
 [tex`\omega=2\pi f=10\pi\,\mathrm{rad\,s^{-1}}`,tex`\theta=\omega t=\frac{\pi}{2}`,tex`E_{\max}=NBA\lvert\omega\rvert=5\pi\,\mathrm{V}\approx15{,}708\,\mathrm{V}`,tex`i=\frac{e}{R+r}\approx0{,}714\,\mathrm{A}`,tex`u=Ri\approx14{,}280\,\mathrm{V}`],
 [tex`I_{\mathrm{ef}}=\frac{E_{\max}}{\sqrt{2}(R+r)}\approx0{,}504873\,\mathrm{A}`,tex`\overline{P}_{\mathrm{util}}=I_{\mathrm{ef}}^2R\approx5{,}097936\,\mathrm{W}`,tex`\overline{P}_{\mathrm{int}}=I_{\mathrm{ef}}^2r\approx0{,}509794\,\mathrm{W}`,tex`\overline{P}_{\mathrm{mec}}=\overline{P}_{\mathrm{util}}+\overline{P}_{\mathrm{int}}`,tex`\overline{P}_{\mathrm{mec}}\approx5{,}607730\,\mathrm{W}`,tex`T=\frac{1}{f}=0{,}2\,\mathrm{s}`,tex`W_{\mathrm{mec}}=\overline{P}_{\mathrm{mec}}T\approx1{,}121546\,\mathrm{J}`]
];
export function equationParts(source){const tokens=source.split(/(=|\\approx)/);if(tokens.length<3)return [source];const chunks=[tokens[0]+tokens[1]+tokens[2]];for(let j=3;j<tokens.length;j+=2)chunks.push(tokens[j]+tokens[j+1]);return chunks;}
export function prepareGeneratorMath(root){
 for(const host of root.querySelectorAll('.formula[data-science-source]')){const source=theory[host.dataset.scienceSource];if(source)window.PraxisMath.set(host,source,{syntax:'tex'});}
 const articles=[...root.querySelectorAll('#problems article')].slice(1);
 articles.forEach((article,index)=>{const old=article.querySelector('p:last-child'),grid=document.createElement('div');grid.className='generator-solution-grid';for(const source of workedEquations[index]){const equation=document.createElement('div');equation.className='formula';for(const part of equationParts(source)){const span=document.createElement('span');span.className='generator-solution-part';window.PraxisMath.set(span,part,{syntax:'tex'});equation.append(span);}grid.append(equation);}old.replaceWith(grid);});
}
export function renderGeneratorLiveFormula(host,state,p){
 if(!host.firstChild){const label=document.createElement('span');label.className='generator-live-label';host.append(label);for(let j=0;j<3;j++){const equation=document.createElement('span');equation.className='generator-live-equation';host.append(equation);}}
 host.firstChild.textContent=window.PraxisI18n.tr('Starea curentă')+':';
 const nf=new Intl.NumberFormat(window.PraxisI18n.locale,{maximumFractionDigits:3,useGrouping:false}),num=n=>nf.format(Math.abs(n)<1e-10?0:n).replace(',','{,}');
 const sources=[tex`e=${num(state.emf)}\,\mathrm{V}`,tex`u=${p.open?'e':'Ri'}=${num(state.voltage)}\,\mathrm{V}`,tex`i=${num(state.current)}\,\mathrm{A}`];
 [...host.children].slice(1).forEach((el,index)=>window.PraxisMath.set(el,sources[index],{syntax:'tex'}));
}
