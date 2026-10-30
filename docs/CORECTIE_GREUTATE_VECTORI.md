# Corecție Calcul vectorial — greutatea pe planul înclinat

27 octombrie 2026. În figura 7, valorile numerice foloseau corect masa, dar săgețile foloseau lungimea constantă `g=2.9`. Desenul folosește acum `m·9,81` și o singură scară pentru G, Gₜ, Gₙ și N: 0,06 unități grafice/N.

Scena se încadrează pentru întregul interval 0,5–10 kg; scara nu se schimbă când este mișcat cursorul masei. Astfel, dublarea masei dublează lungimile săgeților. Încadrarea ține cont de dimensiunea canvasului și unghiul planului, inclusiv de reacțiunea normală când este activată.

Verificări:

- Test din codul efectiv al figurii: mase 0,5; 1; 2; 7,5; 10 kg, unghiuri 0°, 31°, 65°, canvasuri de 306 și 800 px lățime.
- Proporționalitate cu masa pentru toate cele patru forțe; Gₜ+Gₙ=G și N=|Gₙ|; rezultate numerice în newtoni și extremități în limitele desenului.
- Browser: la α=31°, m=2 kg: G=19,62 N, Gₜ=10,11 N, Gₙ=16,82 N; la m=4 kg: G=39,24 N, Gₜ=20,21 N, Gₙ=33,64 N. Desenul se actualizează imediat, fără erori în consolă.
- Patch reversibil în `scripts/vector-physics-patches.json`; importul păstrează sursa originală, iar testul SHA-256 detectează orice alte modificări neintenționate.
- Corecția este inclusă în arhiva autonomă Calcul vectorial și în biblioteca locală.
