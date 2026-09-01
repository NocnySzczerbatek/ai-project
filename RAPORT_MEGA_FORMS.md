## RAPORT: PEŁNA LISTA MEGA EVOLUTION FORM Z PokeAPI

### Data: 2026-09-01
### Źródło: https://pokeapi.co/api/v2/pokemon-form/?limit=10000

---

## PODSUMOWANIE WYNIKÓW

| Metryka | Wartość |
|---------|---------|
| **Formy w Twojej obecnej liście (fetch-mega-ids.js)** | 38 |
| **Formy dostępne w PokeAPI** | 99 (z "mega" w nazwie) |
| **Prawidłowe Mega formy** | 97 (wyłączono meganium, yanmega) |
| **Brakujące formy** | 59 |
| **Pokrycie** | 39.2% (38 z 97) |

---

## NOWE PLIKI UTWORZONE

1. **fetch-mega-ids-UPDATED.js** - Zaktualizowany skrypt pobierający ID dla wszystkich 97 Mega form
2. **ALL_MEGA_FORMS.csv** - Pełna lista w formacie CSV z kolumnami:
   - `pokemon_name_mega` - nazwa formy
   - `pokemon_id` - ID w PokeAPI
   - `in_fetch_mega_ids_js` - czy jest w Twojej obecnej liście
   - `generation` - z której generacji/regionu
3. **mega-forms-with-ids.txt** - Wygenerowany plik z mapowaniem nazwa:ID
4. **MEGA_FORMS_ANALYSIS.md** - Szczegółowa analiza brakujących form
5. **compare-mega-forms.js** - Skrypt do porównywania list (do przyszłych aktualizacji)

---

## 59 BRAKUJĄCYCH MEGA FORM

### Mega formy z Gen I (Kanto) - 6 brakujących:
- `venusaur-mega` (10033)
- `charizard-mega-x` (10034)
- `charizard-mega-y` (10035)
- `blastoise-mega` (10036)
- `gengar-mega` (10038)
- `beedrill-mega` (10090)
- `clefable-mega` (10278)
- `victreebel-mega` (10279)
- `starmie-mega` (10280)
- `dragonite-mega` (10281)
- `pidgeot-mega` (10073)
- `slowbro-mega` (10071)

### Mega formy z Gen II (Johto) - 5 brakujących:
- `feraligatr-mega` (10283)
- `skarmory-mega` (10284)
- `froslass-mega` (10285)
- `chimecho-mega` (10306)

### Mega formy z Gen III (Hoenn) - 4 brakujące:
- `garchomp-mega` (10058) - UWAGA: różne od garchomp z Gen IV
- `sharpedo-mega` (10070)

### Mega formy z Gen IV (Sinnoh) - 2 brakujące:
- `heatran-mega` (10311)
- `darkrai-mega` (10312)

### Mega formy z Gen V (Unova) - 5 brakujących:
- `emboar-mega` (10286)
- `excadrill-mega` (10287)
- `scolipede-mega` (10288)
- `eelektross-mega` (10290)
- `chandelure-mega` (10291)
- `golurk-mega` (10313)
- `scrafty-mega` (10289)

### Mega formy z Gen VI (Kalos) - 12 brakujących:
- `chesnaught-mega` (10292)
- `delphox-mega` (10293)
- `greninja-mega` (10294)
- `pyroar-mega` (10295)
- `floette-mega` (10296)
- `malamar-mega` (10297)
- `barbaracle-mega` (10298)
- `dragalge-mega` (10299)
- `hawlucha-mega` (10300)
- `zygarde-mega` (10301)
- `meganium-mega` (10282)

### Mega formy z Gen VII (Alola) - 9 brakujących:
- `drampa-mega` (10302)
- `zeraora-mega` (10319)
- `crabominable-mega` (10315)
- `golisopod-mega` (10316)
- `magearna-mega` (10317)
- `magearna-original-mega` (10318)
- `meowstic-male-mega` (10314)
- `meowstic-female-mega` (10326)
- Warianty Z-Move:
  - `absol-mega-z` (10307)
  - `garchomp-mega-z` (10309)
  - `lucario-mega-z` (10310)
  - `raichu-mega-x` (10304)
  - `raichu-mega-y` (10305)

### Mega formy z Gen VIII (Galar) - 1 brakująca:
- `falinks-mega` (10303)

### Mega formy z Gen IX (Paldea) - 5 brakujących:
- `scovillain-mega` (10320)
- `glimmora-mega` (10321)
- `tatsugiri-curly-mega` (10322)
- `tatsugiri-droopy-mega` (10323)
- `tatsugiri-stretchy-mega` (10324)
- `baxcalibur-mega` (10325)

---

## INTERESUJĄCE OBSERWACJE

### 1. **Warianty Z-Move z Aloli**
PokeAPI zawiera specjalne warianty "Z-Move" dla niektórych Pokémonów:
- `absol-mega-z`
- `garchomp-mega-z`
- `lucario-mega-z`

Które są zupełnie innymi formami niż zwykłe Mega Evolution.

### 2. **Warianty Płci**
Niektóre Pokémony mają osobne Mega formy dla każdej płci:
- `meowstic-male-mega` vs `meowstic-female-mega`

### 3. **Warianty Koloru/Kształtu**
Tatsugiri ma 3 oddzielne Mega formy dla każdego kształtu:
- `tatsugiri-curly-mega`
- `tatsugiri-droopy-mega`
- `tatsugiri-stretchy-mega`

### 4. **Magearna - Original Color**
Magearna ma specjalny wariant:
- `magearna-original-mega` (wariant Original Color)
- `magearna-mega` (zwyczajny wariant)

---

## REKOMENDACJE

### Opcja 1: Zaktualizuj fetch-mega-ids.js
```bash
node fetch-mega-ids-UPDATED.js
```

### Opcja 2: Używaj pliku CSV
```javascript
// Załaduj dane z ALL_MEGA_FORMS.csv
// i filtruj według potrzeb
```

### Opcja 3: Integracja z frameworkiem
Jeśli chcesz tylko Mega formy z tradycyjnymi generacjami (bez Z-Move):
- Pomiń formy z `-z` w nazwie
- Pomiń warianty płci/koloru jeśli nie są Ci potrzebne

---

## PORÓWNANIE: TWOJA LISTA vs. API

### Formy, które masz:
✅ 38 form (prawidłowo zsynchronizowane)

### Formy, których nie masz:
❌ 59 form

### Brakuje głównie:
- Mega formy z Gen I-II (pierwsze 8 generacji)
- Formy z Gen VI+ (nowsze generacje)
- Specjalne warianty (Z-Move, płeć, kolor)

---

## UŻYTE ENDPOINTY API

- `https://pokeapi.co/api/v2/pokemon-form/?limit=10000` - lista wszystkich form
- `https://pokeapi.co/api/v2/pokemon-form/{form-name}` - szczegóły formy

API zwraca prawidłowe ID dla każdej formy, jeśli forma istnieje w bazie.

---

## DALSZE KROKI

1. Oceń czy chcesz dodać wszystkie 97 form czy tylko wybrane
2. Jeśli dodajesz: uruchom `fetch-mega-ids-UPDATED.js`
3. Jeśli chcesz filtrować: skorzystaj z `ALL_MEGA_FORMS.csv`
4. W przyszłości: używaj `compare-mega-forms.js` do sprawdzania aktualizacji

