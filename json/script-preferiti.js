const listaPreferitiEl = document.getElementById('lista-preferiti');
const svuotaBtn = document.getElementById('svuota');
const contatorePrefEl = document.getElementById('contatore-preferiti');
const erroreEl = document.getElementById('errore-localstorage');

function loadFavorites(){
  try{
    const raw = localStorage.getItem('preferiti');
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)) throw new Error('Formato preferiti non valido');
    return parsed;
  }catch(e){
    console.error(e);
    if(erroreEl) erroreEl.textContent = 'Errore: contenuto preferiti non valido.';
    return null; // signal error
  }
}

function renderPreferiti(){
  const arr = loadFavorites();
  if(arr === null) {
    listaPreferitiEl.innerHTML = '';
    updateCounter(0);
    return;
  }
  if(arr.length === 0){
    listaPreferitiEl.innerHTML = '<p>Non ci sono libri nei preferiti.</p>';
    updateCounter(0);
    return;
  }
  listaPreferitiEl.innerHTML = arr.map(b=>`<article class="card">
    <h3>${escapeHtml(b.titolo)}</h3>
    <div class="meta">${escapeHtml(b.autore)} — ${b.anno} — ${b.genere}</div>
  </article>`).join('');
  updateCounter(arr.length);
}

function updateCounter(n){
  if(contatorePrefEl) contatorePrefEl.textContent = `Hai ${n} libri nei preferiti`;
}

function clearFavorites(){
  localStorage.removeItem('preferiti');
  renderPreferiti();
}

function escapeHtml(s){
  if(!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

if(svuotaBtn) svuotaBtn.addEventListener('click', () => {
  if(confirm('Svuotare i preferiti?')) clearFavorites();
});

document.addEventListener('DOMContentLoaded', () => renderPreferiti());
