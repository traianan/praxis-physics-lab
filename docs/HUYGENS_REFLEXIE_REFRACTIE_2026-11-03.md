# Reflexia și refracția prin construcția lui Huygens

În **Unde mecanice → Fenomene ondulatorii → Reflexie și refracție** există două activități noi: **Reflexia prin principiul lui Huygens** și **Refracția prin principiul lui Huygens**. Activitățile anterioare sunt păstrate; lista de activități este compactată într-un selector. Destinația internă a termenului „Difracție” a fost actualizată după inserarea activităților.

Fiecare construcție are patru etape: apropierea frontului incident, emiterea succesivă a undelor secundare, tangenta comună și propagarea noului front. Sunt disponibile pornire/pauză, resetare, alegerea etapei, deplasarea în timp și modificarea unghiului. La refracție se poate schimba raportul vitezelor. Demonstrația geometrică din manual este într-o secțiune pliabilă, cu fracții și indici structurali.

## Geometria

Modelul folosește două medii omogene și izotrope, separate de un plan. Lungimea A′B′ și viteza v₁ sunt normalizate la 1. Pentru unghiul de incidență i, intervalul dintre prima și ultima atingere este Δt = sin i. Un punct de pe suprafață cu abscisa x devine sursă la timpul x·sin i. Raza undei sale secundare este viteza din mediul studiat înmulțită cu timpul scurs de la activarea punctului.

La reflexie, viteza rămâne v₁ și r = i. La refracție, sin r = (v₂/v₁)·sin i. Modelul construiește punctele de tangență pe cercuri, apoi segmentul înfășurător, nu o linie aleasă aproximativ pentru desen. După atingerea lui B′, frontul se deplasează perpendicular pe el cu viteza corespunzătoare.

Sunt trasate câte două raze marginale pentru unda incidentă și pentru unda reflectată/refractată. Razele incidente urmăresc marginile fasciculului incident; partea frontului încă aflată în mediul 1 este tăiată de suprafața de separare. Razele emergente trec prin extremitățile frontului construit. În timpul formării, a doua pornește din intersecția curentă cu suprafața; la sfârșitul construcției, originile sunt A′ și B′. Toate razele sunt perpendiculare pe fronturile corespunzătoare.

Unghiurile disponibile sunt 15–60°, iar raportul v₂/v₁ este 0,5–1,1. Acest domeniu permite ambele sensuri de abatere față de normală fără reflexie totală; activitatea avansată existentă rămâne disponibilă pentru acel fenomen. Semicercurile sunt secțiuni ale fronturilor secundare semisferice.

## Randare și stare

SVG păstrează aceeași scară pe ambele axe. O singură bază de timp încetinită este folosită pentru cele două medii, independent de numărul cadrelor și de unghi. Ascunderea activității sau documentului oprește animația; schimbarea limbii și redimensionarea păstrează progresul. Modificarea parametrilor oprește redarea și păstrează etapa pentru comparație. Resetarea este explicită.

Pe desktop, schema, comenzile, explicația etapei și legea încap împreună la 1366×768 în RO și EN. Pe ecrane înguste diagrama permite deplasare orizontală locală, păstrând etichetele lizibile; la text 200% se acceptă derularea suplimentară. Pachetul offline include aceeași implementare.

## Verificare

- 352 de teste automate trecute, dintre care zece verifică noul model, componenta, formulele, traducerile, razele și ceasul.
- În Chrome: emitere cauzală, nouă surse la finalul construcției, opt puncte de tangență cu rază nenulă, două raze incidente și două emergente, perpendicularitate și delimitarea frontului.
- Pornire, pauză, reluare după final, resetare, oprire la ascundere și păstrarea progresului la RO/EN; refracție către normală și în sens opus.
- 14 configurații de afișare pentru cele două animații; parcurgerea tuturor celor 51 de stări de activitate ale laboratorului în RO/EN, la DPR 1 și 2.

Raportul este în `VERIFICARE_HUYGENS_2026-11-03.json`.

Referințe: imaginile trimise de utilizator (figurile 1.3.3.1 și 1.3.3.3 din manual) și [OpenStax, Huygens’s Principle](https://openstax.org/books/university-physics-volume-3/pages/1-6-huygenss-principle).
