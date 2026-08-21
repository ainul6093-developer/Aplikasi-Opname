const input = document.getElementById("excelFile");

let dataProduk = [];

let barcodeSekarang = "";

let dataTersimpan = {};

let kulkasAktif = false;

let stokSistemSekarang = 0;

let namaSekarang = "";

let rakSekarang = "";

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

        // ===== POP UP =====
        alert("Produk berhasil dimuat : " + dataProduk.length);

        // ===== INDIKATOR PERMANEN =====
document.getElementById("statusImport").innerHTML =
"📂 " + file.name +
"<br>✅ Produk berhasil dimuat : " + dataProduk.length;

        // ===== CONSOLE =====
        console.log(dataProduk);
console.log(Object.keys(dataProduk[0]));
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
    kulkasAktif = false;

    document.getElementById("stokKulkas").disabled = true;

    alert("❌ Produk tidak ditemukan");

    return;
}

const dataLama = dataTersimpan[String(hasil.KODE).trim()];

if (dataLama) {

    kulkasAktif = dataLama.kulkasAktif;

    document.getElementById("stokKulkas").value =
        dataLama.kulkas;

    document.getElementById("stokFisik").value =
        dataLama.fisik;

    document.getElementById("stokKulkas").disabled =
        !kulkasAktif;

} else {

    kulkasAktif = false;

    document.getElementById("stokKulkas").value = "";

    document.getElementById("stokFisik").value = "";

    document.getElementById("stokKulkas").disabled = true;

}

hitungTotalFisik();

barcodeSekarang = hasil.KODE;

stokSistemSekarang = Number(hasil.STOK);

namaSekarang = hasil.NAMA;

rakSekarang = hasil.RAK;

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
    hitungTotalFisik
);


document.getElementById("stokFisik").addEventListener(
    "input",
    hitungTotalFisik
);

document.getElementById("aktifKulkas").addEventListener(
    "click",
    function () {

        kulkasAktif = true;

        document.getElementById("stokKulkas").disabled = false;

        document.getElementById("stokKulkas").focus();

        hitungTotalFisik();

    }
);


document.getElementById("nonaktifKulkas").addEventListener(
    "click",
    function () {

        kulkasAktif = false;

        document.getElementById("stokKulkas").disabled = true;

        document.getElementById("stokKulkas").value = "";

        hitungTotalFisik();

    }
);

function tampilkanDataTersimpan() {

    const container =
        document.getElementById("dataTersimpan");

    container.innerHTML = "";

    Object.values(dataTersimpan).forEach(function (data) {

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

document.getElementById("btnHapusSemua").addEventListener(
    "click",
    function () {

        if (Object.keys(dataTersimpan).length === 0) {

            alert("Belum ada data.");

            return;

        }

        if (!confirm("Hapus semua data opname?")) {

            return;

        }

        dataTersimpan = {};

        document.getElementById("dataTersimpan").innerHTML = "";

        alert("✅ Semua data berhasil dihapus.");

    }
);
