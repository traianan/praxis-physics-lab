/* Tracked presentation and energy-balance adaptations for the original imported sources. */
const changes={
  "calorimetry": {
    "index.html": [
      [
        "      <div class=\"fig-h\"><b>Fig. 2 — 1 mol de gaz ideal monoatomic, încălzit și răcit</b><span>teorema transformărilor inverse</span></div>",
        "      <div class=\"fig-h\"><b>Fig. 2 — 1 mol de gaz ideal monoatomic, încălzit și răcit</b><span>teorema transformărilor inverse</span></div>\n      <p class=\"figure-math\" data-science-math=\"tex\" data-science-source=\"U=\\frac{3}{2}\\nu RT\">U = (3/2)·νRT</p>"
      ]
    ],
    "js/baza.js": [
      [
        "el._v=v;el.innerHTML=v}",
        "el._v=v;el.innerHTML=v;window.PraxisMath?.enhance(el)}"
      ]
    ],
    "js/figuri-1.js": [
      [
        "    txt(ctx,'U = (3/2)·νRT',X(Tmax)-4,Y(Cv*Tmax/1000)+16,{align:'right',font:SERIF(13),color:COL.b});\n",
        ""
      ],
      [
        "[Cv*S.p.dT*(done.h||ph!=='i'||done.c?1:0),'ΔU'",
        "[Cv*(T-S.p.Ti),'ΔU'"
      ]
    ]
  },
  "notions": {
    "index.html": [
      [
        "        <button class=\"btn sm\" data-mode=\"mix\">Amestec</button>\n      </div>",
        "        <button class=\"btn sm\" data-mode=\"mix\">Amestec</button>\n      </div>\n      <p class=\"figure-math\" data-in=\"mix\" data-science-math=\"tex\" data-science-source=\"\\mu=\\frac{N_1\\mu_1+N_2\\mu_2}{N_1+N_2}\">μ = (N₁μ₁ + N₂μ₂) / (N₁ + N₂)</p>\n      <p class=\"figure-math\" data-in=\"mix\" data-out=\"mixFormula\"></p>"
      ]
    ],
    "js/baza.js": [
      [
        "el._v=v;el.innerHTML=v}",
        "el._v=v;el.innerHTML=v;window.PraxisMath?.enhance(el)}"
      ]
    ],
    "js/figuri-1.js": [
      [
        "      const X0=b.x+b.w+30;txt(ctx,'μ = (N₁μ₁ + N₂μ₂) / (N₁ + N₂)',X0,b.y+20,{align:'left',font:big});\n      txt(ctx,`= (${N1}·28 + ${N2}·32) / ${N1+N2}`,X0,b.y+54,{align:'left',font:big,color:COL.muted});\n      txt(ctx,`= ${f(mu,2)} g/mol`,X0,b.y+88,{align:'left',font:'italic 600 22px \"Source Serif 4\", Georgia, serif',color:COL.a});\n",
        "      const X0=b.x+b.w+30;\n      const formula=S.outs.mixFormula,source=`\\\\mu=\\\\frac{${N1}\\\\cdot28+${N2}\\\\cdot32}{${N1+N2}}=${f(mu,2)}\\\\ \\\\mathrm{g/mol}`;\n      if(formula&&formula._source!==source){formula._source=source;if(window.PraxisMath)window.PraxisMath.set(formula,source,{syntax:'tex'});else formula.textContent=`μ = (${N1}·28 + ${N2}·32) / ${N1+N2} = ${f(mu,2)} g/mol`;}\n"
      ]
    ]
  }
};
export function thermoReadability(course,file,source){
 for(const [before,after] of changes[course]?.[file]||[]){if(!source.includes(before))throw new Error(`Thermodynamics readability anchor missing: ${course}/${file}`);source=source.replace(before,after);}
 return source;
}
