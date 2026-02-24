/* ================================================================
   state.js — Zmienne stanu aplikacji
   ================================================================ */

let allPokemon = [];
let filteredList = [];
let selectedGen = 0;
let searchQuery = '';
let currentPage = 'welcome';
let selectedId = null;
let detailCache = {};
let listOffset = 0;
let currentBuildIndex = 0;
let lastBuildData = null;
let rankingSelectedType = 'fire';

/* ── Stan kalkulatora słabości ── */
var wcType1 = '';
var wcType2 = '';

/* ── Stan symulatora walki ── */
let battleState = null;
let battleSetupData = { player: null, opponent: null };
let battleSearchTimeout = null;
