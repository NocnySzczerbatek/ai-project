// Port tabeli typow z js/arena.js (TYPE_EFF) — jedno, spojne zrodlo prawdy
// dla efektywnosci typow uzywane przez wszystkie silniki walki (bot/gym/PvP).
export type TypeName = 'normal'|'fire'|'water'|'electric'|'grass'|'ice'|'fighting'|'poison'|'ground'
  |'flying'|'psychic'|'bug'|'rock'|'ghost'|'dragon'|'dark'|'steel'|'fairy';

export const TYPE_EFF: Record<TypeName, { weak: TypeName[]; resist: TypeName[]; immune: TypeName[] }> = {
  normal:{weak:['fighting'],resist:[],immune:['ghost']},
  fire:{weak:['water','ground','rock'],resist:['fire','grass','ice','bug','steel','fairy'],immune:[]},
  water:{weak:['electric','grass'],resist:['fire','water','ice','steel'],immune:[]},
  electric:{weak:['ground'],resist:['electric','flying','steel'],immune:[]},
  grass:{weak:['fire','ice','poison','flying','bug'],resist:['water','electric','grass','ground'],immune:[]},
  ice:{weak:['fire','fighting','rock','steel'],resist:['ice'],immune:[]},
  fighting:{weak:['flying','psychic','fairy'],resist:['bug','rock','dark'],immune:[]},
  poison:{weak:['ground','psychic'],resist:['fighting','poison','bug','grass','fairy'],immune:[]},
  ground:{weak:['water','grass','ice'],resist:['poison','rock'],immune:['electric']},
  flying:{weak:['electric','ice','rock'],resist:['fighting','bug','grass'],immune:['ground']},
  psychic:{weak:['bug','ghost','dark'],resist:['fighting','psychic'],immune:[]},
  bug:{weak:['fire','flying','rock'],resist:['fighting','ground','grass'],immune:[]},
  rock:{weak:['water','grass','fighting','ground','steel'],resist:['normal','fire','poison','flying'],immune:[]},
  ghost:{weak:['ghost','dark'],resist:['poison','bug'],immune:['normal','fighting']},
  dragon:{weak:['ice','dragon','fairy'],resist:['fire','water','electric','grass'],immune:[]},
  dark:{weak:['fighting','bug','fairy'],resist:['ghost','dark'],immune:['psychic']},
  steel:{weak:['fire','fighting','ground'],resist:['normal','grass','ice','flying','psychic','bug','rock','dragon','steel','fairy'],immune:['poison']},
  fairy:{weak:['poison','steel'],resist:['fighting','bug','dark'],immune:['dragon']},
};

export function typeEffectiveness(moveType: string, defenderTypes: string[]): number {
  // defenderTypes moze przyjsc jako null/undefined (brak kolumny 'types' u obrońcy)
  // albo jako pojedynczy string/obiekt zamiast tablicy — nigdy nie ufamy ksztaltowi z zewnatrz.
  const types: unknown[] = Array.isArray(defenderTypes) ? defenderTypes : [defenderTypes].filter(Boolean);
  let mult = 1;
  for (const dt of types) {
    const chart = TYPE_EFF[dt as TypeName];
    if (!chart) continue;
    if (chart.immune.includes(moveType as TypeName)) mult *= 0;
    else if (chart.weak.includes(moveType as TypeName)) mult *= 2;
    else if (chart.resist.includes(moveType as TypeName)) mult *= 0.5;
  }
  return mult;
}
