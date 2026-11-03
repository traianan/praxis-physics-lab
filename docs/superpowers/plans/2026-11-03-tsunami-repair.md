# Repararea standului tsunami

Scop: un experiment didactic coerent și verificabil, cu o singură scenă, comenzi accesibile și fizică independentă de FPS. Cerințele și autorizarea sunt cele deja formulate de utilizator; execuție directă.

Decizie: înlocuirea modelului de raze euristic, nu cosmetizarea lui. Un model liniar bidimensional de unde lungi pe grilă conservativă calculează nivelul apei și debitele. Batimetria este schematică și etichetată astfel. Sursele sunt deplasări inițiale ale suprafeței, nu conversii arbitrare Mw–amplitudine. Coastele reflectă; marginile oceanice au o zonă absorbantă. Fără predicții istorice, inundare sau estimări de pericol.

- [x] Teste numerice independente: viteza √gh în bazin uniform, repaus, conservarea volumului, stabilitate, coastă impermeabilă, linearitate, invarianta împărțirii timpului și surse valide.
- [x] Model separat în `public/shared/waves-tsunami-model.js`, fără DOM sau React.
- [x] Componentă React în `scripts/waves-tsunami-component.js`, injectată reversibil în importator; un singur Canvas vizibil, randat și în pauză, cu legendă, sursă și stații.
- [x] Activitate distinctă de teoria seismică. Comenzi pornire/pauză, resetare, sursă, amplitudine, accelerare temporală și sondă pe hartă; nicio comandă inactivă deghizată în slider.
- [x] RO/EN, tastatură, tactil, text mărit, pauză în fundal și la schimbarea activității, păstrarea stării la prezentare.
- [x] Teste integrare/import, audit geometric și funcțional în browser, export offline și build, suită completă.

Referințe: NOAA JetStream Tsunami Propagation; NOAA NCEI Tsunami Travel Time Maps. Ecuații: ∂η/∂t + div Q = 0, ∂Q/∂t = −gh grad η, fund fix, |η| ≪ h. Scopul didactic este propagarea undelor lungi; nu se simulează ruperea sau uscarea/inundarea celulelor.
