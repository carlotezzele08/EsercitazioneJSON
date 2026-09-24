let allBooks = [];

const listaEl = document.getElementById('lista-libri');
const titoloEl = document.getElementById('titolo');
const searchEl = document.getElementById('search');
const genereEl = document.getElementById('filter-genere');
const contatoreEl = document.getElementById('contatore');

function fetchBooks(){
  fetch('json/libri.json')
    .then(response => {
      if(!response.ok) throw new Error('Archivio libri non trovato (response.ok false)');
      return response.json();
    })
    .then(data => {
      titoloEl.textContent = data.titolo_catalogo || 'Catalogo';
      allBooks = data.libri || [];
      populateGenreFilter();
      renderList(allBooks);
      updateCounter();
    })
    .catch(err => {
      console.error(err);
      titoloEl.textContent = 'Errore nel caricamento del catalogo';
      listaEl.innerHTML = `<p class="error">${err.message}</p>`;
    });
}

function populateGenreFilter(){
  const generi = Array.from(new Set(allBooks.map(b => b.genere).filter(Boolean)));
  genereEl.innerHTML = '<option value="">Tutti i generi</option>' + generi.map(g=>`<option value="${g}">${g}</option>`).join('');
}

function renderList(lista){
  if(!lista.length){
    listaEl.innerHTML = '<p>Nessun risultato.</p>';
    return;
  }
  listaEl.innerHTML = lista.map(b => {
    return (`<article class="card">
      <h3>${escapeHtml(b.titolo)}</h3>
      <div class="meta">${escapeHtml(b.autore)} — ${b.anno} — ${b.genere}</div>
      <div>${b.disponibile ? 'Disponibile' : 'Non disponibile'}</div>
      <div style="margin-top:10px"><button data-id="${b.id}">Aggiungi ai preferiti</button></div>
    </article>`);
  }).join('');

  // attach listeners
  listaEl.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const book = allBooks.find(x => x.id === id);
      if(book) addToFavorites(book);
    });
  });
}

function filterBooks(){
  const q = (searchEl.value || '').trim().toLowerCase();
  const selectedGenere = genereEl.value;
  let filtered = allBooks.filter(b => {
    const matchesQ = q === '' || (b.titolo && b.titolo.toLowerCase().includes(q)) || (b.autore && b.autore.toLowerCase().includes(q));
    const matchesGenere = selectedGenere === '' || b.genere === selectedGenere;
    return matchesQ && matchesGenere;
  });
  renderList(filtered);
}

function getFavorites(){
  try{
    const raw = localStorage.getItem('preferiti');
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)) return [];
    return parsed;
  }catch(e){
    console.error('Preferiti non leggibili:', e);
    return [];
  }
}

function saveFavorites(arr){
  localStorage.setItem('preferiti', JSON.stringify(arr));
}

function addToFavorites(book){
  const list = getFavorites();
  if(list.find(b => b.id === book.id)) return alert('Libro già nei preferiti');
  list.push(book);
  saveFavorites(list);
  updateCounter();
}

function updateCounter(){
  const n = getFavorites().length;
  if(contatoreEl) contatoreEl.textContent = n;
}

function escapeHtml(s){
  if(!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

if(searchEl) searchEl.addEventListener('input', filterBooks);
if(genereEl) genereEl.addEventListener('change', filterBooks);

document.addEventListener('DOMContentLoaded', () => fetchBooks());
