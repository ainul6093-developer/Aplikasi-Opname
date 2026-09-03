const input = document.getElementById("excelFile");

let dataProduk = [];

let barcodeSekarang = "";

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
    "Produk berhasil dimuat : " +
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

        alert("Import file Excel terlebih dahulu.");

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

            alert("Scan produk terlebih dahulu.");

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

        alert("✅ Data berhasil disimpan");

    }
);
document.getElementById("copyKode").addEventListener("click", async function () {

    const kode = document.getElementById("kodeProduk").innerText;

    if (kode == "-") {

        alert("Belum ada kode.");

        return;

    }

    await navigator.clipboard.writeText(kode);

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

            <div style="margin-top:5px;">
                Kulkas : ${data.kulkas}
            </div>

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
    function () {

        const yakin = confirm(
            "Reset aplikasi?\n\n" +
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

        alert("✅ Aplikasi berhasil direset.");

    }
);