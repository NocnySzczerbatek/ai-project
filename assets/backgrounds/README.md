# assets/backgrounds/

Miejsce na przyszłe grafiki teł walki (PNG/WebP, styl anime), które w przyszłości
zastąpią obecne, czysto CSS-owe tła biomów Areny (`css/arena.css`,
sekcja "BATTLE BIOME BACKGROUNDS").

## Konwencja nazw

Jedna grafika na biom, proporcje 16:9 (zalecane 1920×1080), format `.webp`:

| Plik            | Biom               |
|------------------|--------------------|
| forest.webp      | Las                |
| cave.webp        | Jaskinia           |
| ocean.webp       | Ocean              |
| mountain.webp    | Góry               |
| plains.webp      | Równiny            |
| desert.webp      | Pustynia           |
| snow.webp        | Śnieg              |
| swamp.webp       | Bagno              |
| volcano.webp     | Wulkan             |
| cyber.webp       | Cyber-Laboratorium |
| sky.webp         | Niebo              |
| void.webp        | Otchłań            |

## Jak podmienić tło CSS na własną grafikę

W `css/arena.css` znajdź regułę danego biomu, np. `.battle-scene[data-biome="forest"]`,
i dopisz nową, pierwszą warstwę do `background-image` + `background-size:cover`
(jeden dodatkowy `auto` w `background-size` na każdą z pozostałych warstw gradientu,
żeby zostały jako subtelny efekt świetlny na wierzchu grafiki):

```css
.battle-scene[data-biome="forest"]{
  background-image:url('assets/backgrounds/forest.webp'),
    radial-gradient(...), /* zostaje bez zmian */
    radial-gradient(...),
    repeating-linear-gradient(...),
    linear-gradient(...);
  background-size:cover, auto, auto, auto, auto;
}
```

Po dodaniu/zmianie plików tutaj zwiększ numer `?v=` przy `css/arena.css`
w `arena.html` i `service-worker.js` (cache-busting), inaczej zmiana może
nie być widoczna dla powracających użytkowników.

## Dodatkowe grafiki

- [catchzone-login.jpg](assets/backgrounds/catchzone-login.jpg)
