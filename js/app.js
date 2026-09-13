// ================================
// SISTEM NOTIFIKASI GLOBAL
// ================================

function notif(pesan) {

    const notifikasi = document.createElement("div");

    notifikasi.innerText = pesan;

    notifikasi.style.cssText = `
        position:fixed !important;
        top:50vh !important;
        left:50vw !important;
        transform:translate(-50%, -50%) !important;
        
        background:white;
        color:#000000;
        padding:14px 22px;
        border-radius:10px;
        font-size:16px;
        font-weight:bold;
        white-space:nowrap;
        z-index:9999;
        box-shadow:0 3px 10px rgba(0,0,0,0.2);

        pointer-events:none;

        opacity:0;
        transition:opacity 0.25s ease;
    `;

    document.body.appendChild(notifikasi);

    // Muncul perlahan
    setTimeout(function () {
        notifikasi.style.opacity = "1";
    }, 50);

    // Mulai menghilang
    setTimeout(function () {
        notifikasi.style.opacity = "0";
    }, 1750);

    // Hapus setelah selesai
    setTimeout(function () {
        notifikasi.remove();
    }, 2000);
}


// Semua alert() otomatis menggunakan notif global
window.alert = function(pesan) {
    notif(pesan);
};


// ================================
// SISTEM KONFIRMASI GLOBAL
// ================================

function konfirmasi(judul, pesan) {

    return new Promise(function(resolve) {

        const overlay = document.createElement("div");

        overlay.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.35);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:10000;
        `;

        const popup = document.createElement("div");

        popup.style.cssText = `
            background:white;
            width:calc(100% - 40px);
            max-width:360px;
            padding:22px;
            border-radius:16px;
            box-shadow:0 8px 30px rgba(0,0,0,0.2);
            text-align:center;
            font-family:inherit;
            transform:scale(0.95);
            opacity:0;
            transition:opacity 0.2s ease, transform 0.2s ease;
        `;

        popup.innerHTML = `
            <div style="
                font-size:30px;
                margin-bottom:10px;
            ">⚠️</div>

            <div style="
                font-size:19px;
                font-weight:bold;
                margin-bottom:8px;
            ">
                ${judul}
            </div>

            <div style="
                font-size:14px;
                color:#666;
                line-height:1.5;
                margin-bottom:20px;
            ">
                ${pesan}
            </div>

            <div style="
                display:flex;
                gap:10px;
            ">
                <button id="btnBatalReset" style="
                    flex:1;
                    padding:11px;
                    border:none;
                    border-radius:9px;
                    background:#eeeeee;
                    font-size:15px;
                    font-weight:bold;
                ">
                    Batal
                </button>

                <button id="btnKonfirmasiReset" style="
                    flex:1;
                    padding:11px;
                    border:none;
                    border-radius:9px;
                    background:#d32f2f;
                    color:white;
                    font-size:15px;
                    font-weight:bold;
                ">
                    Reset
                </button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Animasi muncul
        setTimeout(function() {
            popup.style.opacity = "1";
            popup.style.transform = "scale(1)";
        }, 30);

        document.getElementById("btnBatalReset")
            .addEventListener("click", function() {
                tutup(false);
            });

        document.getElementById("btnKonfirmasiReset")
            .addEventListener("click", function() {
                tutup(true);
            });

        function tutup(hasil) {

            popup.style.opacity = "0";
            popup.style.transform = "scale(0.95)";

            setTimeout(function() {
                overlay.remove();
                resolve(hasil);
            }, 200);
        }

    });
}

const input = document.getElementById("excelFile");

let dataProduk = [];

let barcodeSekarang = "";

let autoSalinAktif = false;

// ================================
// PENCARIAN PRODUK
// ================================

const inputCariProduk =
    document.getElementById("inputCariProduk");

const hasilPencarianProduk =
    document.getElementById("hasilPencarianProduk");

inputCariProduk.addEventListener("input", function () {

    const kata = this.value.trim().toLowerCase();

    hasilPencarianProduk.innerHTML = "";

    if (kata === "") {
        return;
    }

    if (dataProduk.length === 0) {

        hasilPencarianProduk.innerHTML =
            '<div class="tidak-ditemukan">' +
            'Import file Excel terlebih dahulu.' +
            '</div>';

        return;
    }

    const hasil = dataProduk.filter(function (item) {

        const kode =
            String(item.KODE || "").toLowerCase();

        const nama =
            String(item.NAMA || "").toLowerCase();

        return kode.includes(kata) ||
               nama.includes(kata);

    });

    if (hasil.length === 0) {

        hasilPencarianProduk.innerHTML =
            '<div class="tidak-ditemukan">' +
            '❌ Produk tidak ditemukan' +
            '</div>';

        return;
    }

    hasil.forEach(function (item) {

        const div =
            document.createElement("div");

        div.className = "hasil-produk";

        div.innerHTML =
            '<span class="hasil-produk-kode">' +
            item.KODE +
            '</span> : ' +
            '<span class="hasil-produk-nama">' +
            item.NAMA +
            '</span>';

        div.addEventListener("click", function () {

            pilihProdukDariPencarian(item);

        });

        hasilPencarianProduk.appendChild(div);

    });

});

let dataTersimpan = {};

let kulkasAktif = false;

let stokSistemSekarang = 0;

let namaSekarang = "";

let rakSekarang = "";

let statusImportTersimpan = "📂 Belum ada file dipilih";


// ================================
// MEMUAT DATA TERAKHIR
// ================================

try {

    const dataAplikasi =
        JSON.parse(localStorage.getItem("opnameTokoData"));

    if (dataAplikasi) {

        dataProduk = dataAplikasi.dataProduk || [];

        dataTersimpan = dataAplikasi.dataTersimpan || {};

        barcodeSekarang =
            dataAplikasi.barcodeSekarang || "";

        kulkasAktif =
            dataAplikasi.kulkasAktif || false;

        stokSistemSekarang =
            dataAplikasi.stokSistemSekarang || 0;

        namaSekarang =
            dataAplikasi.namaSekarang || "";

        rakSekarang =
            dataAplikasi.rakSekarang || "";

        statusImportTersimpan =
            dataAplikasi.statusImportTersimpan ||
            "📂 Belum ada file dipilih";

    }

} catch (e) {

    console.log("Data tersimpan tidak dapat dibaca.");

}
// ================================
// SIMPAN KONDISI APLIKASI
// ================================

function simpanKondisiAplikasi() {

    const kondisi = {

        dataProduk: dataProduk,

        dataTersimpan: dataTersimpan,

        barcodeSekarang: barcodeSekarang,

        kulkasAktif: kulkasAktif,

        stokSistemSekarang: stokSistemSekarang,

        namaSekarang: namaSekarang,

        rakSekarang: rakSekarang,

        statusImportTersimpan: statusImportTersimpan,

        stokKulkas:
            document.getElementById("stokKulkas").value,

        stokFisik:
            document.getElementById("stokFisik").value

    };

    localStorage.setItem(
        "opnameTokoData",
        JSON.stringify(kondisi)
    );

}

input.addEventListener("change", function (e) {

    const file = e.target.files[0];

    if (!file) return;

    document.getElementById("statusImport").innerHTML =
        "📂 Memuat file : " + file.name;

    const reader = new FileReader();

    reader.onload = function (evt) {

        const data = new Uint8Array(evt.target.result);

        const workbook = XLSX.read(data, {
            type: "array"
        });

        const sheet = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheet];

        dataProduk = XLSX.utils.sheet_to_json(worksheet);

      dataProduk = XLSX.utils.sheet_to_json(worksheet);


// =================================
// SIMPAN KETERANGAN FILE EXCEL
// =================================

statusImportTersimpan =
    "📂 " + file.name +
    "<br>✅ Produk berhasil dimuat : " +
    dataProduk.length;


// Tampilkan keterangan
document.getElementById("statusImport").innerHTML =
    statusImportTersimpan;


// Simpan semua kondisi aplikasi
simpanKondisiAplikasi();


alert(
    " ✅ Produk berhasil dimuat : " +
    dataProduk.length
);
    
        document.getElementById("statusImport").innerHTML =
            "📂 " + file.name +
            "<br>✅ Produk berhasil dimuat : " +
            dataProduk.length;

        console.log(dataProduk);

        if (dataProduk.length > 0) {
            console.log(
                Object.keys(dataProduk[0])
            );
        }

    };

    reader.readAsArrayBuffer(file);

});

const btnScan = document.querySelector(".scan-button");

let scannerAktif = false;
let html5QrCode;
let torchNyala = false;

// ================================
// PILIH PRODUK DARI PENCARIAN
// ================================

function pilihProdukDariPencarian(hasil) {

    const dataLama =
        dataTersimpan[String(hasil.KODE).trim()];

    if (dataLama) {

        document.getElementById("stokKulkas").value =
            dataLama.kulkas;

        document.getElementById("stokFisik").value =
            dataLama.fisik;

    } else {

        document.getElementById("stokKulkas").value = "";

        document.getElementById("stokFisik").value = "";

    }

    aturTampilanKulkas();

    hitungTotalFisik();

    barcodeSekarang = hasil.KODE;

    stokSistemSekarang = Number(hasil.STOK);

    namaSekarang = hasil.NAMA;

    rakSekarang = hasil.RAK;

    simpanKondisiAplikasi();

    document.getElementById("kodeProduk").innerHTML =
        hasil.KODE;

    document.getElementById("namaProduk").innerHTML =
        hasil.NAMA;

    document.getElementById("rakProduk").innerHTML =
        hasil.RAK;

    document.getElementById("stokProduk").innerHTML =
        hasil.STOK;

  // AUTO SALIN SETELAH PILIH PRODUK DARI PENCARIAN
if (autoSalinAktif) {

    setTimeout(function () {

        document.getElementById("copyKode").click();

    }, 500);

}

    // Kosongkan hasil pencarian
    inputCariProduk.value = "";

    hasilPencarianProduk.innerHTML = "";
}


// ================================
// TOGGLE AUTO SALIN
// ================================

document.getElementById("toggleAutoSalin").addEventListener(
    "change",
    function () {

        autoSalinAktif = this.checked;

        const switchBg =
            document.getElementById("autoSalinSwitch");

        const knob =
            document.getElementById("autoSalinKnob");

        if (autoSalinAktif) {

            switchBg.style.background = "#2196F3";
            knob.style.left = "25px";

        } else {

            switchBg.style.background = "#bdbdbd";
            knob.style.left = "3px";

        }

    }
);

function bunyiBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        oscillator.frequency.value = 1000;
        oscillator.type = "sine";

        gain.gain.value = 0.15;

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
        console.log("Beep tidak tersedia:", e);
    }
}
btnScan.addEventListener("click", function () {

    if (dataProduk.length == 0) {

        alert("Import file Excel terlebih dahulu ‼️");

        return;

    }

    if (scannerAktif) return;

    scannerAktif = true;

    document.getElementById("scannerArea").style.display = "block";
    document.getElementById("btnTorch").style.display = "block";

    html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },

        function (barcode) {

            html5QrCode.stop();
            bunyiBeep();
            document.getElementById("scannerArea").style.display = "none";
            document.getElementById("btnTorch").style.display = "none";

            scannerAktif = false;

            const hasil = dataProduk.find(function(item){

    return String(item.KODE).trim() === String(barcode).trim();

});

if(!hasil){

    document.getElementById("kodeProduk").innerHTML = "-";
    document.getElementById("namaProduk").innerHTML = "Belum ada produk";
    document.getElementById("rakProduk").innerHTML = "-";
    document.getElementById("stokProduk").innerHTML = "-";

    document.getElementById("stokKulkas").value = "";
    document.getElementById("stokFisik").value = "";
    document.getElementById("totalFisik").innerText = "0";

    barcodeSekarang = "";
    stokSistemSekarang = 0;
    namaSekarang = "";
    rakSekarang = "";

    document.getElementById("stokKulkas").disabled = true;

    alert("❌ Produk tidak ditemukan");

    return;
}

const dataLama = dataTersimpan[String(hasil.KODE).trim()];

if (dataLama) {

    document.getElementById("stokKulkas").value =
        dataLama.kulkas;

    document.getElementById("stokFisik").value =
        dataLama.fisik;

} else {

    document.getElementById("stokKulkas").value = "";

    document.getElementById("stokFisik").value = "";

}

aturTampilanKulkas();
          

hitungTotalFisik();

barcodeSekarang = hasil.KODE;

stokSistemSekarang = Number(hasil.STOK);

namaSekarang = hasil.NAMA;

rakSekarang = hasil.RAK;

simpanKondisiAplikasi();

document.getElementById("kodeProduk").innerHTML =
    hasil.KODE;

document.getElementById("namaProduk").innerHTML =
    hasil.NAMA;

document.getElementById("rakProduk").innerHTML =
    hasil.RAK;

document.getElementById("stokProduk").innerHTML =
    hasil.STOK;

          // AUTO SALIN SETELAH SCAN
    
if (autoSalinAktif) {

    setTimeout(function () {

        document.getElementById("copyKode").click();

    }, 500);

}
    
        },

        function () {

        }

    );

});
document.getElementById("btnTorch").addEventListener("click", async function () {

    if (!html5QrCode) return;

    try {

        torchNyala = !torchNyala;

        await html5QrCode.applyVideoConstraints({
            torch: torchNyala,
            advanced: [{
                torch: torchNyala
            }]
        });

        this.innerHTML = torchNyala
         ? "⚡̸"
         : "⚡";

    } catch (e) {

        alert("HP atau browser tidak mendukung senter.");

    }

});
document.getElementById("btnSimpan").addEventListener(
    "click",
    function () {

        if (barcodeSekarang == "") {

            alert("Scan produk terlebih dahulu ‼️");

            return;

        }

      const inputStokFisik = document.getElementById("stokFisik");

if (inputStokFisik.value.trim() === "") {

    alert("Masukkan stok fisik dulu ‼️");

    inputStokFisik.focus();

    return;
}

        const kulkas = kulkasAktif
            ? Number(document.getElementById("stokKulkas").value) || 0
            : 0;

        const fisik =
            Number(document.getElementById("stokFisik").value) || 0;

        const total = kulkas + fisik;

      delete dataTersimpan[barcodeSekarang];

        dataTersimpan[barcodeSekarang] = {

            barcode: barcodeSekarang,

            nama: namaSekarang,

            rak: rakSekarang,

            sistem: stokSistemSekarang,

            kulkas: kulkas,

            fisik: fisik,

            total: total,

            kulkasAktif: kulkasAktif

        };

        tampilkanDataTersimpan();

        simpanKondisiAplikasi();

        notif("✅ Data berhasil disimpan");
      
    }
);

document.getElementById("copyKode").addEventListener("click", async function () {

    const kodeElement = document.getElementById("kodeProduk");
    const barisKode = document.getElementById("barisKode");
    const kode = kodeElement.innerText;
    const produkElement = document.getElementById("namaProduk");

    if (kode == "-") {

        alert("❌ Belum ada kode");

        return;
    }

    await navigator.clipboard.writeText(kode);

    // EFEK BERKEDIP MERAH 2x
  
    barisKode.classList.remove("kode-tersalin");
    produkElement.classList.remove("kode-tersalin");

    // Memaksa animasi bisa berjalan lagi setiap kali tombol ditekan
    void barisKode.offsetWidth;
    void produkElement.offsetWidth;

    barisKode.classList.add("kode-tersalin");
    produkElement.classList.add("kode-tersalin");

});

function hitungTotalFisik() {

    const kulkas = kulkasAktif
        ? Number(document.getElementById("stokKulkas").value) || 0
        : 0;

    const fisik =
        Number(document.getElementById("stokFisik").value) || 0;

    const total = kulkas + fisik;

    document.getElementById("totalFisik").innerText = total;
}


document.getElementById("stokKulkas").addEventListener(
    "input",
    function () {

        hitungTotalFisik();

        simpanKondisiAplikasi();

    }
);

document.getElementById("stokFisik").addEventListener(
    "input",
    function () {

        hitungTotalFisik();

        simpanKondisiAplikasi();

    }
);

function aturTampilanKulkas() {

    const area = document.getElementById("stokKulkasArea");
    const switchBg = document.getElementById("kulkasSwitch");
    const knob = document.getElementById("kulkasKnob");

    if (kulkasAktif) {

        area.style.display = "block";

        switchBg.style.background = "#2196F3";

        knob.style.left = "25px";

        document.getElementById("stokKulkas").disabled = false;

    } else {

        area.style.display = "none";

        switchBg.style.background = "#bdbdbd";

        knob.style.left = "3px";

        document.getElementById("stokKulkas").disabled = true;

    }

    hitungTotalFisik();
}


document.getElementById("toggleKulkas").addEventListener(
    "change",
    function () {

        kulkasAktif = this.checked;

      simpanKondisiAplikasi();

        if (!kulkasAktif) {

            document.getElementById("stokKulkas").value = "";

        }

        aturTampilanKulkas();

    }
);


aturTampilanKulkas();

function tampilkanDataTersimpan() {

    const container =
        document.getElementById("dataTersimpan");

    container.innerHTML = "";

    Object.values(dataTersimpan).reverse().forEach(function (data) {

        const item = document.createElement("div");

        const selisih = data.total - data.sistem;

item.style.cssText = `
    background:${selisih === 0 ? "#f5f5f5" : "#ffe5e5"};
    border-radius:10px;
    padding:15px;
    margin-bottom:10px;
`;

        item.innerHTML = `

            <div style="
            font-weight:bold;
            font-size:18px;">
                ${data.barcode}
            </div>

            <div style="margin-top:5px;">
                ${data.nama}
            </div>

            <div style="margin-top:5px;">
                Rak : ${data.rak}
            </div>

                  ${data.kulkasAktif ? `
            <div style="margin-top:5px;">
                Kulkas : ${data.kulkas}
            </div>
                      ` : ""}

            <div>
                Fisik : ${data.fisik}
            </div>

            <div style="
            font-weight:bold;
            margin-top:5px;">
                Total : ${data.total}
            </div>

            <div>
                Stok Sistem : ${data.sistem}
            </div>
            
<div style="
font-weight:bold;
margin-top:5px;
color:${selisih === 0 ? "#333" : "#d32f2f"};">

    Selisih : ${selisih > 0 ? "+" : ""}${selisih}

</div>
        `;

        container.appendChild(item);

    });
}


// ================================
// KEMBALIKAN TAMPILAN TERAKHIR
// ================================

function pulihkanTampilanTerakhir() {

    if (dataProduk.length > 0 && barcodeSekarang !== "") {

        const hasil = dataProduk.find(function(item) {

            return String(item.KODE).trim() ===
                   String(barcodeSekarang).trim();

        });

        if (hasil) {

            document.getElementById("namaProduk").innerHTML =
                hasil.NAMA;

            document.getElementById("rakProduk").innerHTML =
                hasil.RAK;

            document.getElementById("stokProduk").innerHTML =
                hasil.STOK;

            document.getElementById("kodeProduk").innerHTML =
                hasil.KODE;

        }

    }

    const dataAplikasi =
        JSON.parse(
            localStorage.getItem("opnameTokoData")
        );

    if (dataAplikasi) {

        document.getElementById("statusImport").innerHTML =
            dataAplikasi.statusImportTersimpan ||
            "📂 Belum ada file dipilih";

        document.getElementById("stokKulkas").value =
            dataAplikasi.stokKulkas || "";

        document.getElementById("stokFisik").value =
            dataAplikasi.stokFisik || "";

    }

    const toggle =
        document.getElementById("toggleKulkas");

    if (toggle) {

        toggle.checked = kulkasAktif;

        aturTampilanKulkas();

    }

    hitungTotalFisik();

    tampilkanDataTersimpan();

}

pulihkanTampilanTerakhir();



// ================================
// TOMBOL RESET TOTAL
// ================================

document.getElementById("btnReset").addEventListener(
    "click",
    async function () {

        const yakin = await konfirmasi(
    "Reset aplikasi?",
    "Semua data opname dan file Excel akan dihapus."
);

if (!yakin) {
    return;
}

        localStorage.removeItem("opnameTokoData");

        dataProduk = [];
        dataTersimpan = {};

        barcodeSekarang = "";
        stokSistemSekarang = 0;
        namaSekarang = "";
        rakSekarang = "";
        kulkasAktif = false;

        document.getElementById("kodeProduk").innerHTML = "-";

        document.getElementById("namaProduk").innerHTML =
            "Belum ada produk";

        document.getElementById("rakProduk").innerHTML = "-";

        document.getElementById("stokProduk").innerHTML = "-";

        document.getElementById("stokKulkas").value = "";

        document.getElementById("stokFisik").value = "";

        document.getElementById("totalFisik").innerText = "0";

        const toggle =
            document.getElementById("toggleKulkas");

        if (toggle) {
            toggle.checked = false;
        }

        document.getElementById("dataTersimpan").innerHTML = "";

        statusImportTersimpan =
            "📂 Belum ada file dipilih";
      
        document.getElementById("statusImport").innerHTML =
            "📂 Belum ada file dipilih";

        document.getElementById("excelFile").value = "";

        alert("✅ Aplikasi berhasil direset");

    }
);