# Huygens: propagare continuă și controlul intervalului Δt

27 octombrie 2026. Versiunea curentă înlocuiește construcția cu oprire după o generație; butonul «Frontul următor» a fost eliminat.

## Model fizic și animație

Fiecare etapă începe la un moment fixat t₀. Toate punctele reprezentative ale frontului portocaliu sunt activate simultan; centrele rămân fixe în această etapă. Secțiunile circulare albastre ale undelor elementare sferice au toate raza r = v·Δt. Frontul verde este tangenta comună x = x₀ + v·Δt (plan), respectiv înfășurătoarea exterioară R = R₀ + v·Δt (sferic). Punctele desenate reprezintă schematic continuumul de surse.

La sfârșitul fiecărei secunde de simulare, frontul verde devine automat noul front inițial. Poziția sa este continuă la această trecere: R₀ + v·1 = R₀_nou + v·0; analog pentru poziția frontului plan. Centrele noii generații sunt activate simultan la noul t₀. Trecerea păstrează și partea fracționară de timp a cadrului; nu oprește redarea.

Scara este fixă, inclusiv între generații: frontul sferic crește vizibil în loc să fie compensat prin zoom. Când următoarea etapă completă ar depăși zona desenului, începe o nouă reluare demonstrativă, indicată prin contorul «Ciclu demonstrativ». Această reluare grafică nu reprezintă o contracție fizică a undei. Unitățile și timpul sunt schematice. Viteza poate fi aleasă între 10 și 40 u/s; la schimbarea ei demonstrația revine la t₀ = 0 pentru coerența formulelor.

## Comenzi

Redarea pornește automat când se activează tipul de front; «Pauză»/«Pornește» controlează continuarea. Sliderul Δt are domeniul 0–1 s în etapa curentă, cu butoane − și + pentru pași de 0,01 s. Orice modificare manuală pune animația pe pauză și actualizează atât razele undelor elementare, cât și înfășurătoarea. La Δt = 1 s rămâne vizibil frontul final al etapei; reluarea redării face automat trecerea la etapa următoare. «Resetează» revine la momentul inițial, oprită, pentru explicații.

Controalele folosesc sliderele și butoanele tactile comune. Afișajul numeric și etichetele sunt disponibile în RO/EN, fără conexiune la internet.

## Verificare

Teste pe componenta distribuită: centre fixe în interiorul etapei, raze egale, tangență, avans continuu prin mai multe generații, scară fixă, reluarea ciclului, absența butonului eliminat, Δt la 0/1 și valori intermediare, pauză la modificare, resetare și rezultate egale la 30/60/120 Hz. Verificare Chromium: slider și ambele butoane ±, capetele domeniului, continuare, RO/EN și etichete de accesibilitate.

Sursele originale arhivate rămân intacte; corecția este aplicată prin adaptorul reversibil. Distribuțiile locală și offline sunt regenerate.

Validare finală: 59/59 teste trecute. Verificare offline prin file://, RO/EN și emulare touch 800×600 fără depășire orizontală; butoane Δt de 44×44 px.
