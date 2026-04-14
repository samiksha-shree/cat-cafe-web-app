window.dispatchEvent(new Event('favsUpdated'));
const cats = [
    {id:1,name:'Momo',age:2,color:'orange',personality:['playful','friendly'],bio:'A curious ball of energy who loves toys and laps.',img:'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=60'},
    {id:2,name:'Luna',age:1,color:'black',personality:['shy'],bio:'Soft spoken and gentle — warms up slowly but loves chin scratches.',img:'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=60'},
    {id:3,name:'Kiko',age:5,color:'white',personality:['calm','senior'],bio:'A dignified senior who enjoys sunbeams and quiet company.',img:'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800&q=60'},
    {id:4,name:'Pip',age:3,color:'tabby',personality:['playful','friendly'],bio:'Finds mischief in boxes — best playmate for visitors!',img:'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=60'},
    {id:5,name:'Nala',age:4,color:'calico',personality:['calm'],bio:'Affectionate and patient — perfect for long cuddles.',img:'cat5.webp'}
];

const FAV_KEY = 'purr_favs_v1';

let state = {
    cats: cats.slice(),
    filter: 'all',
    query: '',
    favs: new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'))
};

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function renderGrid(){
    const grid = $('#cat-grid');
    grid.innerHTML = '';
    const filtered = state.cats.filter(c => {
    if(state.filter !== 'all' && !c.personality.includes(state.filter)) return false;
    const q = state.query.trim().toLowerCase();
    if(!q) return true;
    return (c.name.toLowerCase().includes(q) || c.color.toLowerCase().includes(q) || c.personality.join(' ').includes(q));
    });

    if(filtered.length === 0){
    grid.innerHTML = '<div class="card" style="grid-column:1/-1;text-align:center;padding:40px">No cats match your search.</div>';
    return;
    }

    filtered.forEach(cat => {
    const el = document.createElement('div');
    el.className = 'card cat';
    el.innerHTML = `
        <img src="${cat.img}" alt="${cat.name}" loading="lazy">
        <div class="body">
        <h3>${cat.name} <small class="small">• ${cat.age}y</small></h3>
        <div class="meta">${cat.color} · ${cat.personality.join(', ')}</div>
        <p class="small" style="margin-top:8px">${cat.bio.substring(0,70)}...</p>
        <div class="actions">
            <button class="btn" data-id="${cat.id}" data-action="view">View</button>
            <button class="fav" aria-label="favorite" data-id="${cat.id}" data-action="fav">${state.favs.has(cat.id) ? '★' : '☆'}</button>
        </div>
        </div>
    `;
    grid.appendChild(el);
    });
    updateFavCount();
}

function updateFavCount(){
    $('#fav-count').textContent = state.favs.size;
}

function openModal(contentHtml){
    const modal = $('#modal');
    $('#modal-content').innerHTML = contentHtml;
    modal.style.display = 'flex';
}
function closeModal(){
    $('#modal').style.display = 'none';
    $('#modal-content').innerHTML = '';
}

document.addEventListener('click', (e) => {
    const action = e.target.dataset?.action;
    const id = Number(e.target.dataset?.id);
    if(action === 'view'){
    const cat = cats.find(c=>c.id===id);
    openModal(`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start">
        <div><img src="${cat.img}" style="width:100%;height:260px;object-fit:cover;border-radius:8px"></div>
        <div>
            <h2>${cat.name} <small class="small">• ${cat.age}y</small></h2>
            <div class="meta">${cat.color} · ${cat.personality.join(', ')}</div>
            <p style="margin-top:10px">${cat.bio}</p>
            <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn" data-id="${cat.id}" data-action="fav">${state.favs.has(cat.id)?'Remove favorite':'Add to favorites'}</button>
            <button class="btn ghost" id="close-modal">Close</button>
            </div>
        </div>
        </div>
    `);
    // attach listener to close button after open
    setTimeout(()=>{
        $('#close-modal')?.addEventListener('click', closeModal);
    },0);
    }
    if(action === 'fav'){
    if(state.favs.has(id)) state.favs.delete(id); else state.favs.add(id);
    localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(state.favs)));
    renderGrid();
    // if modal is open, update text inside modal button
    const modalBtn = document.querySelector('#modal-content button[data-action="fav"]');
    if(modalBtn) modalBtn.textContent = state.favs.has(id)?'Remove favorite':'Add to favorites';
    }
});

// Close modal by clicking backdrop or Esc
$('#modal').addEventListener('click', (e)=>{ if(e.target === $('#modal')) closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

// Search & filters
$('#search').addEventListener('input', e=>{ state.query = e.target.value; renderGrid(); });
$$('.chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
    $$('.chip').forEach(c=>c.style.borderColor='#eee');
    chip.style.borderColor='var(--accent)';
    state.filter = chip.dataset.filter;
    renderGrid();
    });
});

// Quick nav buttons
$('#scroll-cats').addEventListener('click', ()=>{ document.querySelector('#cats').scrollIntoView({behavior:'smooth'}); });
$('#open-reserve').addEventListener('click', ()=>{ document.querySelector('#reserve').scrollIntoView({behavior:'smooth'}); });

// Reservation form validation and DOM feedback
$('#reserve-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $('#r-name').value.trim();
    const email = $('#r-email').value.trim();
    const date = $('#r-date').value;
    const time = $('#r-time').value;
    const notes = $('#r-notes').value.trim();

    // Basic validation
    if(!name || !email || !date || !time){
    $('#reserve-msg').textContent = 'Please fill all required fields.';
    return;
    }
    const chosen = new Date(date + 'T' + time);
    const now = new Date();
    if(chosen < now){
    $('#reserve-msg').textContent = 'Please choose a future date/time.';
    return;
    }

    // Simulate booking (DOM update)
    $('#reserve-msg').textContent = 'Booking confirmed! Check your email for details.';
    $('#reserve-form').reset();
    setTimeout(()=>$('#reserve-msg').textContent='',(3*1000));
});

// View favorites button opens modal listing favs
$('#view-favs').addEventListener('click', ()=>{
    const favList = Array.from(state.favs).map(id => cats.find(c => c.id === id));
    if(favList.length === 0){
    openModal('<div style="padding:24px;text-align:center"><h3>No favorites yet</h3><p class="small">Click the star next to a cat to add it to your favorites.</p><div style="margin-top:12px"><button class="btn" id="close-modal">Close</button></div></div>');
    setTimeout(()=>$('#close-modal')?.addEventListener('click', closeModal),0);
    return;
    }

    const html = `
    <div>
        <h3>Your favorites</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:12px">
        ${favList.map(c => `
            <div style="border-radius:8px;overflow:hidden;background:#fff;border:1px solid #eee;padding:8px">
            <img src="${c.img}" style="width:100%;height:120px;object-fit:cover;border-radius:6px">
            <div style="margin-top:8px">
                <div style="font-weight:700">${c.name}</div>
                <div class="small">${c.age}y · ${c.personality.join(', ')}</div>
                <div style="margin-top:6px"><button class="btn" data-action="view" data-id="${c.id}">View</button></div>
            </div>
            </div>
        `).join('')}
        </div>
        <div style="margin-top:12px;text-align:right"><button class="btn ghost" id="close-modal">Close</button></div>
    </div>
    `;
    openModal(html);
    setTimeout(()=>$('#close-modal')?.addEventListener('click', closeModal),0);
});

// Initialize UI
renderGrid();

// Accessibility: focus trap inside modal (simple)
document.addEventListener('focus', function(event){
    const modal = $('#modal');
    if(modal.style.display === 'flex' && !modal.contains(event.target)){
    event.stopPropagation();
    modal.focus();
    }
}, true);