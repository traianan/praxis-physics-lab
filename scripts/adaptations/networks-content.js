// Preserve all six source exercises while correcting inconsistent arithmetic and directions.
PROBLEMS[0].steps[0]=['Alegem sensurile din laborator: I₁ și I₂ coboară pe laturile exterioare, I₃ urcă de la A la B prin latura comună.','I₁ ↓ stânga; I₂ ↓ dreapta; I₃ ↑ prin R₃'];
PROBLEMS[0].steps[1][0]='Scriem prima lege a lui Kirchhoff pentru nodul A (n = 2 noduri → n − 1 = 1 ecuație independentă).';
PROBLEMS[1].stmt=PROBLEMS[1].stmt.replace('r₂ = 1 Ω','r₁ = r₂ = 1 Ω');
PROBLEMS[3].verify=()=>{const E=7.2,r=2,R=1/(1/10+1/5),I=E/(10+r),Ip=E/(R+r);return `I = ${fmt(I,3)} A; U = ${fmt(I*10,3)} V; U₁ = ${fmt(4-I*.5,3)} V; U₂ = ${fmt(3.2-I*1.5,3)} V; R₁ ∥ R₂: I = ${fmt(Ip,3)} A; I₁ = ${fmt(Ip*R/10,3)} A; I₂ = ${fmt(Ip*R/5,3)} A`;};
PROBLEMS[4].steps[0][0]='a) Aplicăm Kirchhoff: 2 noduri și 4 laturi (trei surse și consumatorul), deci 1 ecuație de nod și 3 ecuații de ochi independente.';
PROBLEMS[4].steps[4][1]='I′ = (E₁/r₁ + E₂/r₂) / (1 + R/r₁ + R/r₂) ≈ 49,057 mA';
PROBLEMS[4].steps[5][1]='U′ = I′R ≈ 0,981132 V; I₁ ≈ 9,434 mA; I₂ ≈ 39,623 mA; I₁ + I₂ ≈ 49,057 mA';
PROBLEMS[4].steps[7]=['Recalculăm cu cele două surse rămase: voltmetrul este în paralel cu R.','I_e ≈ 49,519 mA; U ≈ 0,980577 V; ΔU ≈ 0,555 mV'];
PROBLEMS[4].answer='a) I ≈ 54,9 mA; b) I′ ≈ 49,057 mA, I₁ ≈ 9,434 mA, I₂ ≈ 39,623 mA; c) U ≈ 0,980577 V';
PROBLEMS[4].verify=()=>{const R=20,RV=2000,g=1/2+1/3,j=1/2+1.1/3,U=j/(g+1/R),Uv=j/(g+1/R+1/RV);return `R ∥ R_V = ${fmt(1/(1/R+1/RV),4)} Ω; U′ = ${fmt(U,6)} V; U = ${fmt(Uv,6)} V; ΔU = ${fmt((U-Uv)*1000,3)} mV`;};
