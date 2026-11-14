// Preserve all six source exercises while correcting inconsistent arithmetic and directions.
PROBLEMS[0].steps[0]=['Alegem sensurile din laborator: I₁ și I₂ coboară pe laturile exterioare, I₃ urcă de la A la B prin latura comună.','I₁ ↓ stânga; I₂ ↓ dreapta; I₃ ↑ prin R₃'];
PROBLEMS[0].steps[1][0]='Scriem prima lege a lui Kirchhoff pentru nodul A (n = 2 noduri → n − 1 = 1 ecuație independentă).';
PROBLEMS[1].stmt=PROBLEMS[1].stmt.replace('r₂ = 1 Ω','r₁ = r₂ = 1 Ω');
PROBLEMS[3].verify=()=>{const E=7.2,r=2,R=1/(1/10+1/5),I=E/(10+r),Ip=E/(R+r);return `I = ${fmt(I,3)} A; U = ${fmt(I*10,3)} V; U₁ = ${fmt(4-I*.5,3)} V; U₂ = ${fmt(3.2-I*1.5,3)} V; R₁ ∥ R₂: I = ${fmt(Ip,3)} A; I₁ = ${fmt(-Ip*R/10,3)} A; I₂ = ${fmt(-Ip*R/5,3)} A`;};
PROBLEMS[4].steps[0][0]='a) Aplicăm Kirchhoff: 2 noduri și 4 laturi (trei surse și consumatorul), deci 1 ecuație de nod și 3 ecuații de ochi independente.';
PROBLEMS[4].steps[4][1]='I′ = −(E₁/r₁ + E₂/r₂) / (1 + R/r₁ + R/r₂) ≈ −49,057 mA';
PROBLEMS[4].steps[5][1]='U′ = −I′R ≈ 0,981132 V; I₁ ≈ 9,434 mA; I₂ ≈ 39,623 mA; I₁ + I₂ + I′ = 0 · 9,434 mA + 39,623 mA + (−49,057 mA) = 0 mA';
PROBLEMS[4].steps[7]=['Recalculăm cu cele două surse rămase: voltmetrul este în paralel cu R.','I_e ≈ 49,519 mA; U ≈ 0,980577 V; ΔU ≈ 0,555 mV'];
PROBLEMS[4].answer='a) I ≈ −54,9 mA; b) I′ ≈ −49,057 mA, I₁ ≈ 9,434 mA, I₂ ≈ 39,623 mA; c) U ≈ 0,980577 V';
PROBLEMS[4].verify=()=>{const R=20,RV=2000,g=1/2+1/3,j=1/2+1.1/3,U=j/(g+1/R),Uv=j/(g+1/R+1/RV);return `R ∥ R_V = ${fmt(1/(1/R+1/RV),4)} Ω; U′ = ${fmt(U,6)} V; U = ${fmt(Uv,6)} V; ΔU = ${fmt((U-Uv)*1000,3)} mV`;};

// All junction equations add signed currents.
PROBLEMS[0].steps[1][1] = "I₁ + I₂ + I₃ = 0";
PROBLEMS[0].steps[2][1] = "E₁ = I₁·R₁ − I₃·R₃ + I₁·r₁";
PROBLEMS[0].steps[3][1] = "E₂ = I₂·R₂ − I₃·R₃ + I₂·r₂";
PROBLEMS[0].steps[4][1] = "22 = 5·I₁ − 4·I₃ · 19 = 7·I₂ − 4·I₃";
PROBLEMS[0].steps[5][0] = "Înlocuim I₃ = −(I₁ + I₂) și rezolvăm sistemul.";
PROBLEMS[0].answer = "I₁ = 2 A, I₂ = 1 A, I₃ = −3 A";
PROBLEMS[1].steps[0][1] = "I₁ + I₂ + I₃ = 0 ⇒ I₃ = −(2 + I₂)";
PROBLEMS[1].steps[1][1] = "E₁ = −I₃·R₃ + I₁·R₁ + I₁·r₁ = −2I₃ + 10";
PROBLEMS[1].steps[2][1] = "E₂ = −I₃·R₃ + I₂·R₂ + I₂·r₂ = −2I₃ + 3I₂";
PROBLEMS[1].steps[3][0] = "Înlocuim I₃ = −(2 + I₂) în ecuația ochiului drept.";
PROBLEMS[1].steps[3][1] = "19 = 2(2 + I₂) + 3I₂ ⇒ I₂ = 3 A, I₃ = −5 A";
PROBLEMS[1].steps[4][1] = "E₁ = −2·(−5) + 10 = 20 V";
PROBLEMS[1].steps[5][1] = "a) V_A − V_B = −I₃R₃ = 10 V · b) E₂ − I₂(r₂+R₂) = 10 V · c) E₁ − I₁(R₁+r₁) = 10 V";
PROBLEMS[1].answer = "I₂ = 3 A, I₃ = −5 A, E₁ = 20 V, V_A − V_B = 10 V";
PROBLEMS[3].steps[4][0] = "d) La nodul de ramificare, I intră, iar I₁ și I₂ ies.";
PROBLEMS[3].steps[4][1] = "I + I₁ + I₂ = 0 · E₁ + E₂ = −I₁R₁ + I(r₁+r₂) · I₁R₁ = I₂R₂";
PROBLEMS[3].steps[5][0] = "Din I₂ = 2I₁ rezultă I = −3I₁.";
PROBLEMS[3].steps[5][1] = "7,2 = −16I₁ ⇒ I₁ = −0,45 A, I₂ = −0,90 A, I = 1,35 A";
PROBLEMS[3].answer = "a) U = 6 V · b) U₁ = 3,7 V, U₂ = 2,3 V · c) N = 3,75·10¹⁹ · d) I = 1,35 A, I₁ = −0,45 A, I₂ = −0,90 A";
PROBLEMS[4].steps[0][1] = "I₁ + I₂ + I₃ + I = 0 · E₁ − E₂ = I₁r₁ − I₂r₂ · E₂ − E₃ = I₂r₂ − I₃r₃ · E₃ = I₃r₃ − I·R";
PROBLEMS[4].steps[1][1] = "2I₁ − 3I₂ = −0,1 · 3I₂ − I₃ = −0,1 · I₃ − 20I = 1,2";
PROBLEMS[4].steps[2][0] = "Exprimăm I₃ = 1,2 + 20I și reducem sistemul.";
PROBLEMS[4].steps[2][1] = "I₂ = −21I − 1,2 − I₁";
PROBLEMS[4].steps[3][1] = "226I = −12,4 ⇒ I ≈ −54,9 mA";
PROBLEMS[4].steps[5][0] = "Curenții prin surse intră în nodul A, iar cel prin consumator iese.";
PROBLEMS[4].steps[7][1] = "I_e ≈ −49,519 mA · U = −I_e·R_e ≈ 0,980577 V · ΔU ≈ 0,555 mV";
PROBLEMS[5].steps[0][1] = "I + I_A + I_s = 0 · I = −n·I_A ⇒ I_s = (n − 1)·I_A";

PROBLEMS[0].steps.push(['Verificăm legea nodului A.', '2 A + 1 A + (−3 A) = 0 A']);
PROBLEMS[1].steps.push(['Verificăm legea nodului A.', '2 A + 3 A + (−5 A) = 0 A']);
PROBLEMS[0].verify = () => 'I₁ = 2 A · I₂ = 1 A · I₃ = −3 A → 2 A + 1 A + (−3 A) = 0 A ✓';
PROBLEMS[1].verify = () => '2 A + 3 A + (−5 A) = 0 A ✓ · E₁ = 20 V · E₂ = 19 V · V_A − V_B = 10 V';
PROBLEMS[5].steps[0][0] = "La nodul de ramificare, I intră, iar I_A și I_s ies.";
