# PEŁNA LISTA MEGA EVOLUTION FORM Z PokeAPI

## Podsumowanie
- **Twoja obecna lista**: 38 form
- **Formy dostępne w API**: 97 prawidłowych Mega form*
- **Brakujące formy**: 59

*Wyłączono: `meganium` i `yanmega` - to zwykłe Pokémony, a nie Mega formy

---

## Brakujące 59 Mega form (posortowane alfabetycznie)

1. venusaur-mega
2. charizard-mega-x
3. charizard-mega-y
4. blastoise-mega
5. alakazam-mega
6. gengar-mega
7. garchomp-mega
8. slowbro-mega
9. pidgeot-mega
10. beedrill-mega
11. clefable-mega
12. victreebel-mega
13. starmie-mega
14. dragonite-mega
15. meganium-mega
16. feraligatr-mega
17. skarmory-mega
18. froslass-mega
19. emboar-mega
20. excadrill-mega
21. scolipede-mega
22. scrafty-mega
23. eelektross-mega
24. chandelure-mega
25. chesnaught-mega
26. delphox-mega
27. greninja-mega
28. pyroar-mega
29. floette-mega
30. malamar-mega
31. barbaracle-mega
32. dragalge-mega
33. hawlucha-mega
34. zygarde-mega
35. drampa-mega
36. falinks-mega
37. raichu-mega-x
38. raichu-mega-y
39. chimecho-mega
40. absol-mega-z (wariant Z)
41. staraptor-mega
42. garchomp-mega-z (wariant Z)
43. lucario-mega-z (wariant Z)
44. heatran-mega
45. darkrai-mega
46. golurk-mega
47. meowstic-male-mega
48. crabominable-mega
49. golisopod-mega
50. magearna-mega
51. magearna-original-mega
52. zeraora-mega
53. scovillain-mega
54. glimmora-mega
55. tatsugiri-curly-mega
56. tatsugiri-droopy-mega
57. tatsugiri-stretchy-mega
58. baxcalibur-mega
59. meowstic-female-mega

---

## NOWA PEŁNA LISTA (97 form)

```javascript
const forms = [
  'abomasnow-mega',
  'absol-mega',
  'absol-mega-z',
  'aerodactyl-mega',
  'aggron-mega',
  'alakazam-mega',
  'altaria-mega',
  'ampharos-mega',
  'audino-mega',
  'banette-mega',
  'barbaracle-mega',
  'baxcalibur-mega',
  'beedrill-mega',
  'blastoise-mega',
  'blaziken-mega',
  'camerupt-mega',
  'chandelure-mega',
  'charizard-mega-x',
  'charizard-mega-y',
  'chesnaught-mega',
  'chimecho-mega',
  'clefable-mega',
  'crabominable-mega',
  'darkrai-mega',
  'delphox-mega',
  'diancie-mega',
  'dragalge-mega',
  'dragonite-mega',
  'drampa-mega',
  'eelektross-mega',
  'emboar-mega',
  'excadrill-mega',
  'falinks-mega',
  'feraligatr-mega',
  'floette-mega',
  'froslass-mega',
  'gallade-mega',
  'garchomp-mega',
  'garchomp-mega-z',
  'gardevoir-mega',
  'gengar-mega',
  'glalie-mega',
  'glimmora-mega',
  'golisopod-mega',
  'golurk-mega',
  'greninja-mega',
  'gyarados-mega',
  'hawlucha-mega',
  'heatran-mega',
  'heracross-mega',
  'houndoom-mega',
  'kangaskhan-mega',
  'latias-mega',
  'latios-mega',
  'lopunny-mega',
  'lucario-mega',
  'lucario-mega-z',
  'magearna-mega',
  'magearna-original-mega',
  'malamar-mega',
  'manectric-mega',
  'mawile-mega',
  'medicham-mega',
  'meganium-mega',
  'meowstic-female-mega',
  'meowstic-male-mega',
  'metagross-mega',
  'mewtwo-mega-x',
  'mewtwo-mega-y',
  'pidgeot-mega',
  'pinsir-mega',
  'pyroar-mega',
  'raichu-mega-x',
  'raichu-mega-y',
  'rayquaza-mega',
  'sableye-mega',
  'salamence-mega',
  'sceptile-mega',
  'scizor-mega',
  'scolipede-mega',
  'scovillain-mega',
  'scrafty-mega',
  'sharpedo-mega',
  'skarmory-mega',
  'slowbro-mega',
  'staraptor-mega',
  'starmie-mega',
  'steelix-mega',
  'swampert-mega',
  'tatsugiri-curly-mega',
  'tatsugiri-droopy-mega',
  'tatsugiri-stretchy-mega',
  'tyranitar-mega',
  'venusaur-mega',
  'victreebel-mega',
  'zeraora-mega',
  'zygarde-mega'
];
```

---

## Interesujące obserwacje

### Mega formy z wariantami Z (Alola):
- `absol-mega-z`
- `garchomp-mega-z`
- `lucario-mega-z`

### Nowe Mega formy z Gen VIII+ (Galar/Paldea):
- `heatran-mega`
- `darkrai-mega`
- `golurk-mega`
- `meowstic-male-mega`
- `crabominable-mega`
- `golisopod-mega`
- `magearna-mega`
- `magearna-original-mega`
- `zeraora-mega`
- `scovillain-mega`
- `glimmora-mega`
- `tatsugiri-curly-mega`
- `tatsugiri-droopy-mega`
- `tatsugiri-stretchy-mega`
- `baxcalibur-mega`
- `meowstic-female-mega`

### Formy Starożytne (z poprzednich generacji, które nie były zbierane):
- `venusaur-mega`
- `charizard-mega-x` i `charizard-mega-y`
- `blastoise-mega`
- `alakazam-mega`
- `gengar-mega`
- `garchomp-mega`
- `slowbro-mega`
- `pidgeot-mega`
- I wiele innych...

---

## Pliki wygenerowane

1. `fetch-mega-ids-UPDATED.js` - Zaktualizowany skrypt z pełną listą 97 form
2. `compare-mega-forms.js` - Skrypt porównujący listy (dla przyszłych aktualizacji)
3. `MEGA_FORMS_ANALYSIS.md` - Ten raport

Możesz teraz uruchomić `fetch-mega-ids-UPDATED.js` aby pobrać ID wszystkich 97 Mega form z PokeAPI.
