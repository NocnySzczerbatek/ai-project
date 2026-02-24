/* ================================================================
   favorites.js — System ulubionych Pokémonów
   ================================================================ */

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
  catch(e) { return []; }
}

function isFavorite(id) { return getFavorites().some(function(f){ return f.id === id; }); }

function toggleFavorite(id, name) {
  var favs = getFavorites();
  var idx = -1;
  for (var i = 0; i < favs.length; i++) { if (favs[i].id === id) { idx = i; break; } }
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push({ id: id, name: name });
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  var star = document.getElementById('fav-star-btn');
  if (star) star.classList.toggle('active', isFavorite(id));
}

function renderFavoritesSection() {
  var favs = getFavorites();
  if (!favs.length) {
    return '<div class="welcome-card"><h3>\u2b50 Twoje Ulubione Buildy</h3><p>Kliknij gwiazdk\u0119 \u2b50 obok nazwy Pok\u00e9mona, aby doda\u0107 go do ulubionych.</p></div>';
  }
  var cards = favs.map(function(f){
    return '<div class="fav-card" onclick="loadDetail('+f.id+',\''+f.name+'\')">' +
      '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+f.id+'.png" alt="'+f.name+'"/>' +
      '<span>'+f.name+'</span></div>';
  }).join('');
  return '<div class="welcome-card" style="grid-column:1/-1"><h3>\u2b50 Twoje Ulubione Buildy</h3><div class="fav-grid">'+cards+'</div></div>';
}
