const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjrZ3tU58xi_h2nGOLj794bP5sIprTC9sXRfRgsccJ5o1VPEjgi8OBcwN5Xx0qonoQ63f8nq1jn26o/pub?gid=0&single=true&output=csv";

// --- Helper Functions ---
const cleanStr = (str) => str ? str.replace(/["']/g, "").trim() : "";
const getVal = (str) => parseInt(str.replace(/[^0-9]/g, "")) || 0;






function updateGridLayout() {
    const container = document.getElementById('menu-container');
    if (!container) return;
    
    const visibleCards = Array.from(container.querySelectorAll('.menu-card'))
                              .filter(c => c.style.display !== 'none');
    const count = visibleCards.length;
    
    // Hapus semua class layout lama
    container.classList.remove('grid-1-item', 'grid-2x2', 'grid-3-items');
    
    // Reset style manual yang mungkin tertinggal dari script lama
    container.style.gridTemplateColumns = "";
    container.style.maxWidth = "";

    // Tambahkan class sesuai jumlah item
    if (count === 1) {
        container.classList.add('grid-1-item');
    } else if (count === 3) {
        container.classList.add('grid-3-items');
    } else if (count === 2 || count === 4) {
        container.classList.add('grid-2x2');
    } else {
        // Default untuk jumlah banyak
        container.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
    }
}











// --- Main Init Function ---
async function initContent() {
    const menuContainer = document.getElementById('menu-container'); 
    const pricingWrapper = document.getElementById('pricing-wrapper'); 

    try {
        const response = await fetch(sheetURL);
        const data = await response.text();
        const rows = data.split(/\r?\n/).filter(row => row.trim() !== "").slice(1);

        const list = rows.map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (cols.length < 5) return null;
            
            const promoVal = getVal(cleanStr(cols[4]));
            const priceVal = getVal(cleanStr(cols[3]));
            
            return {
                category: cleanStr(cols[0]).toLowerCase(),
                title: cleanStr(cols[1]),
                detail: cleanStr(cols[2]),
                price: cleanStr(cols[3]),
                promo: cleanStr(cols[4]),
                ribbon: cleanStr(cols[5]),
                image: cleanStr(cols[6]),
                isBest: cleanStr(cols[5]).toLowerCase() === "yes" || cleanStr(cols[5]).toLowerCase() === "best seller",
                sortVal: (cols[4] && promoVal > 0) ? promoVal : priceVal
            };
        }).filter(item => item !== null);

        // 1. RENDER HALAMAN MENU (menu.html)
        if (menuContainer) {
            list.sort((a, b) => b.sortVal - a.sortVal);
            menuContainer.innerHTML = list.map(item => `
                <div class="menu-card" data-category="${item.category}">
                    ${item.ribbon ? `<div class="ribbon"><span>${item.ribbon}</span></div>` : ""}
                    <div class="menu-img-wrapper">
                        <img src="${item.image}" onerror="this.src='https://via.placeholder.com/300x200?text=Menu'">
                    </div>
                    <div class="menu-info">
                        <h3>${item.title}</h3>
                        <ul class="menu-detail-list">${item.detail.split(',').map(d => `<li>${d.trim()}</li>`).join('')}</ul>
                        <div class="price-container">
                            ${item.promo ? `<span class="price-old">${item.price}</span>` : ""}
                            <span class="menu-price">${item.promo || item.price}</span>
                        </div>
                        <a href="https://wa.me/${CONFIG_KONTAK.nomorWA}?text=Halo Nila Catering, saya mau pesan *${item.title}*" class="btn-order" target="_blank">Pesan via WA</a>
                    </div>
                </div>`).join('');
            
            // Paksa update layout setelah render selesai
            setTimeout(updateGridLayout, 100);
        }

        // 2. RENDER HALAMAN INDEX (index.html)
        if (pricingWrapper) {
            const paketOnly = list.filter(i => i.category === "paket").sort((a, b) => a.sortVal - b.sortVal);
            
            pricingWrapper.innerHTML = paketOnly.map(item => `
                <div class="price-card ${item.isBest ? 'featured' : ''}">
                    ${item.ribbon ? `<div class="ribbon"><span>${item.ribbon}</span></div>` : ""}
                    <h3>${item.title}</h3>
                    <div class="menu-img-wrapper">
                        <img src="${item.image}" style="width:100%; border-radius:12px;" onerror="this.src='https://via.placeholder.com/300x200?text=Gambar'">
                    </div>
                    <div class="price-amount">${item.promo || item.price}</div>
                    <ul class="price-list">${item.detail.split(',').map(d => `<li><i class="fas fa-check"></i> ${d.trim()}</li>`).join('')}</ul>
                    <a href="https://wa.me/${CONFIG_KONTAK.nomorWA}?text=Halo Nila Catering, saya pesan paket: *${item.title}*" class="btn btn-primary" target="_blank">Pilih Paket</a>
                </div>`).join('');
        }
    } catch (e) { console.error("Gagal memuat data:", e); }
}

// --- Universal Logic ---
function filterMenu(cat) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase().includes(cat) || (cat === 'all' && b.innerText.toLowerCase() === 'semua')));
    document.querySelectorAll('.menu-card').forEach(c => c.style.display = (cat === 'all' || c.dataset.category === cat) ? 'flex' : 'none');
    updateGridLayout();
}

document.addEventListener('DOMContentLoaded', () => {
    initContent();
    
    // Inisialisasi tombol WA dinamis (konsultasi/diskon)
    setTimeout(() => {
        document.querySelectorAll('.wa-dynamic').forEach(l => {
            const msg = l.dataset.pesan || "Halo Nila Catering";
            l.href = `https://wa.me/${CONFIG_KONTAK.nomorWA}?text=${encodeURIComponent(msg)}`;
        });
    }, 500);
});










async function loadNavbar() {
    const el = document.getElementById('navbar-placeholder');
    if (!el) return;
    try {
        const res = await fetch('nav-header.html');
        if (res.ok) {
            el.outerHTML = await res.text();
            // Logika Active Link
            const currentPage = window.location.pathname.split("/").pop() || 'index.html';
            document.querySelectorAll('.nav-link-item').forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }
            });
        }
    } catch (err) { console.error("Gagal load nav:", err); }
}

async function loadFooter() { 
    const el = document.getElementById('footer-placeholder'); 
    if (el) { 
        try { 
            const res = await fetch('nav-footer.html'); 
            if (res.ok) el.outerHTML = await res.text(); 
        } 
        catch (e) { console.error(e); } 
    } 
}

// Pastikan di bagian akhir script.js Anda memanggilnya:
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadFooter(); // Tambahkan ini
    initContent();
});

