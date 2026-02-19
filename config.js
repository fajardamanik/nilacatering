const CONFIG_KONTAK = {
    nomorWA: "62811832527",
    pesanUmum: "Halo Nila Catering, saya ingin bertanya.", // Pesan untuk tombol melayang
    sheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjrZ3tU58xi_h2nGOLj794bP5sIprTC9sXRfRgsccJ5o1VPEjgi8OBcwN5Xx0qonoQ63f8nq1jn26o/pub?gid=0&single=true&output=csv"
};

let globalMenuData = {};

async function fetchSheetData() {
    try {
        const response = await fetch(CONFIG.sheetUrl);
        const csvText = await response.text();
        const rows = csvText.split('\n');
        
        rows.forEach(row => {
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (columns.length >= 2) {
                // Kolom A (Nama/Key) -> Kolom B (Title Pesan)
                const keyNama = columns[0].trim().replace(/"/g, ''); 
                const titlePesan = columns[1].trim().replace(/"/g, ''); 
                globalMenuData[keyNama] = titlePesan;
            }
        });
    } catch (e) {
        console.error("Gagal ambil data", e);
    }
}

// Fungsi ini untuk memasang link WA ke tombol yang sudah muncul di layar
function updateWALinks() {
    document.querySelectorAll('.wa-link').forEach(link => {
        const namaMenuKey = link.getAttribute('data-menu-nama');
        const titleDariSheet = globalMenuData[namaMenuKey];

        if (titleDariSheet) {
            const pesan = `Halo, saya ingin memesan: ${titleDariSheet}`;
            link.href = `https://wa.me/${CONFIG.nomorWA}?text=${encodeURIComponent(pesan)}`;
        }
    });
}

fetchSheetData();