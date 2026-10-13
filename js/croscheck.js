// =========================================
// CROS CHECK
// Sumber data: file Excel yang sudah di-upload
// =========================================


const STORAGE_KEY =
    "opnameTokoData";


const HIDDEN_KEY =
    "croscheckHiddenProduk";


const VIEW_STATE_KEY =
    "croscheckViewState";


// Simpan kondisi menu hanya selama sesi tab.
// Refresh manual menghapus kondisi tampilan, tetapi data hidden tetap tersimpan.
let tampilanCroscheckTersimpan = null;

try {
    const navEntry = performance.getEntriesByType("navigation")[0];
    const jenisNavigasi = navEntry?.type ||
        (performance.navigation?.type === 1 ? "reload" : "navigate");

    if (jenisNavigasi === "reload") {
        sessionStorage.removeItem(VIEW_STATE_KEY);
    } else {
        tampilanCroscheckTersimpan = JSON.parse(
            sessionStorage.getItem(VIEW_STATE_KEY) || "null"
        );
    }
} catch (e) {
    tampilanCroscheckTersimpan = null;
}


const PAGE_SIZE = 100;



let dataProduk = [];

let hiddenProduk = {};

let filteredProduk = [];

let halamanSekarang = 1;

let renderTimer = null;
let kolomSortir = "";
let arahSortir = 1;



// =========================================
// FILTER RAK
// =========================================

let modeRak =
    "all";

let rakTerpilih = [];

let rakRangeFrom =
    "";

let rakRangeTo =
    "";

let daftarRak =
    [];


let rakTerpilihSementara = [];


let rakRangeFromSementara =
    "";


let rakRangeToSementara =
    "";



// =========================================
// ELEMENT
// =========================================

const inputSearch =
    document.getElementById(
        "inputSearch"
    );

const searchWrap =
    document.getElementById("searchWrap");

const clearSearchButton =
    document.getElementById("clearSearchButton");

const searchSelectionVisual =
    document.getElementById("searchSelectionVisual");


const toggleHiddenCopy =
    document.getElementById(
        "toggleHiddenCopy"
    );


const tableBody =
    document.getElementById(
        "productTableBody"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const pageInfo =
    document.getElementById(
        "pageInfo"
    );


const btnPrev =
    document.getElementById(
        "btnPrev"
    );


const btnNext =
    document.getElementById(
        "btnNext"
    );


const itemInfo =
    document.getElementById(
        "itemInfo"
    );


const btnRakFilter =
    document.getElementById(
        "btnRakFilter"
    );


const rakFilterText =
    document.getElementById(
        "rakFilterText"
    );


const rakPopup =
    document.getElementById(
        "rakPopup"
    );


const rakList =
    document.getElementById(
        "rakList"
    );


const rakSelectedList =
    document.getElementById(
        "rakSelectedList"
    );


const inputSearchRak =
    document.getElementById(
        "inputSearchRak"
    );


const inputSearchRakFrom =
    document.getElementById(
        "inputSearchRakFrom"
    );


const inputSearchRakTo =
    document.getElementById(
        "inputSearchRakTo"
    );


const rakRangeFromList =
    document.getElementById(
        "rakRangeFromList"
    );


const rakRangeToList =
    document.getElementById(
        "rakRangeToList"
    );


const rakRangeFromSelected =
    document.getElementById(
        "rakRangeFromSelected"
    );


const rakRangeToSelected =
    document.getElementById(
        "rakRangeToSelected"
    );


const selectRakArea =
    document.getElementById(
        "selectRakArea"
    );


const rangeRakArea =
    document.getElementById(
        "rangeRakArea"
    );


const btnCancelRak =
    document.getElementById(
        "btnCancelRak"
    );


const btnApplyRak =
    document.getElementById(
        "btnApplyRak"
    );



// =========================================
// NORMALISASI
// =========================================

function normalisasi(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}



// =========================================
// FORMAT ANGKA
// =========================================

function formatAngka(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "id-ID"
    );

}



// =========================================
// BACA DATA EXCEL
// =========================================

function bacaDataExcel() {

    try {

        const tersimpan =
            JSON.parse(

                localStorage.getItem(
                    STORAGE_KEY
                )

            );


        dataProduk =

            Array.isArray(
                tersimpan?.dataProduk
            )

                ? tersimpan.dataProduk

                : [];

    }

    catch (e) {

        dataProduk = [];

    }



    try {

        hiddenProduk =

            JSON.parse(

                localStorage.getItem(
                    HIDDEN_KEY
                )

            ) || {};

    }

    catch (e) {

        hiddenProduk = {};

    }


    buatDaftarRak();

}



// =========================================
// BUAT DAFTAR RAK
// =========================================

function buatDaftarRak() {

    const rakSet =
        new Set();


    dataProduk.forEach(
        function(item) {

            const rak =
                String(
                    item.RAK ?? ""
                ).trim();


            if (rak) {

                rakSet.add(
                    rak
                );

            }

        }
    );


    daftarRak =
        Array.from(
            rakSet
        );


    daftarRak.sort(
        function(a, b) {

            return a.localeCompare(
                b,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        }
    );


    renderDaftarRak();

    renderPilihanRentang();

}



// =========================================
// RENDER HASIL PENCARIAN RAK
// =========================================

function buatHasilRak(container, hasil) {

    container.replaceChildren();

    if (hasil.length === 0) {

        const kosong = document.createElement("div");

        kosong.className = "rak-empty";

        kosong.textContent = "Rak tidak ditemukan.";

        container.appendChild(kosong);

        return;

    }

    hasil.forEach(function(rak) {

        const tombol = document.createElement("button");

        tombol.type = "button";

        tombol.className = "rak-result";

        tombol.textContent = rak;

        tombol.dataset.rak = rak;

        container.appendChild(tombol);

    });

}


// =========================================
// PILIH HASIL RAK
// =========================================

rakList.addEventListener(
    "click",
    function(event) {

        const tombol =
            event.target.closest(".rak-result");

        if (!tombol) return;

        event.preventDefault();
        event.stopPropagation();

        const rak = tombol.dataset.rak;

        if (!rak) return;

        if (!rakTerpilihSementara.includes(rak)) {

            rakTerpilihSementara.push(rak);

        }

        inputSearchRak.value = "";

        renderHasilPilihRak();
        renderRakTerpilih();

        inputSearchRak.focus();

    }
);


rakRangeFromList.addEventListener(
    "click",
    function(event) {

        const tombol =
            event.target.closest(".rak-result");

        if (!tombol) return;

        event.preventDefault();
        event.stopPropagation();

        const rak = tombol.dataset.rak;

        if (!rak) return;

        rakRangeFromSementara = rak;
        inputSearchRakFrom.value = rak;
        rakRangeFromList.replaceChildren();

        inputSearchRakFrom.focus();

    }
);


rakRangeToList.addEventListener(
    "click",
    function(event) {

        const tombol =
            event.target.closest(".rak-result");

        if (!tombol) return;

        event.preventDefault();
        event.stopPropagation();

        const rak = tombol.dataset.rak;

        if (!rak) return;

        rakRangeToSementara = rak;
        inputSearchRakTo.value = rak;
        rakRangeToList.replaceChildren();

        inputSearchRakTo.focus();

    }
);


function hasilCariRak(searchValue) {

    const search = normalisasi(searchValue);

    if (!search) return [];

    return daftarRak.filter(function(rak) {

        return normalisasi(rak).includes(search);

    });

}


function renderDaftarRak() {

    renderHasilPilihRak();

    renderRakTerpilih();

}


function renderHasilPilihRak() {

    if (!normalisasi(inputSearchRak.value)) {

        rakList.replaceChildren();

        return;

    }

    const hasil =
        hasilCariRak(
            inputSearchRak.value
        ).filter(function(rak) {

            return !rakTerpilihSementara.includes(rak);

        });

    buatHasilRak(
        rakList,
        hasil.slice(0, 30)
    );

}


function renderRakTerpilih() {

    rakSelectedList.replaceChildren();

    rakTerpilihSementara.forEach(function(rak) {

        const chip = document.createElement("span");

        chip.className = "rak-selected";

        chip.appendChild(document.createTextNode(rak));

        const tombolHapus = document.createElement("button");

        tombolHapus.type = "button";

        tombolHapus.textContent = "×";

        tombolHapus.setAttribute("aria-label", `Hapus rak ${rak}`);

        tombolHapus.addEventListener("click", function(event) {

            event.preventDefault();
            event.stopPropagation();

            rakTerpilihSementara =
                rakTerpilihSementara.filter(function(item) {
                    return item !== rak;
                });

            renderHasilPilihRak();
            renderRakTerpilih();

        });

        chip.appendChild(tombolHapus);

        rakSelectedList.appendChild(chip);

    });

}


function renderPilihanRentang() {

    renderHasilRentang("from");
    renderHasilRentang("to");

}


function renderHasilRentang(sisi) {

    const input =
        sisi === "from"
            ? inputSearchRakFrom
            : inputSearchRakTo;

    const container =
        sisi === "from"
            ? rakRangeFromList
            : rakRangeToList;

    const nilaiTerpilih =
        sisi === "from"
            ? rakRangeFromSementara
            : rakRangeToSementara;

    if (!normalisasi(input.value)) {

        container.replaceChildren();

        return;

    }

    const hasil =
        hasilCariRak(input.value).filter(function(rak) {

            return rak !== nilaiTerpilih;

        });

    buatHasilRak(
        container,
        hasil.slice(0, 20)
    );

}


function siapkanRakSementara() {

    rakTerpilihSementara = [...rakTerpilih];

    rakRangeFromSementara = rakRangeFrom;

    rakRangeToSementara = rakRangeTo;

    inputSearchRak.value = "";

    inputSearchRakFrom.value = rakRangeFromSementara;

    inputSearchRakTo.value = rakRangeToSementara;

    renderDaftarRak();

    renderPilihanRentang();

}


// =========================================
// SIMPAN STATUS HIDDEN
// =========================================

function simpanHidden() {

    localStorage.setItem(

        HIDDEN_KEY,

        JSON.stringify(
            hiddenProduk
        )

    );

}



// =========================================
// KODE PRODUK
// =========================================

function kodeProduk(item) {

    return String(
        item.KODE ?? ""
    ).trim();

}



// =========================================
// CEK HIDDEN
// =========================================

function isHidden(item) {

    return (

        hiddenProduk[
            kodeProduk(item)
        ] === true

    );

}



// =========================================
// SET HIDDEN
// =========================================

function setHidden(
    item,
    nilai
) {

    const kode =
        kodeProduk(item);


    if (!kode) return;


    if (nilai) {

        hiddenProduk[kode] =
            true;

    }

    else {

        delete hiddenProduk[kode];

    }


    simpanHidden();

}



// =========================================
// SALIN BARCODE
// =========================================

function salinKode(kode) {

    if (!kode) {

        return Promise.resolve(
            false
        );

    }


    if (
        navigator.clipboard?.writeText
    ) {

        return navigator.clipboard
            .writeText(kode)

            .then(
                function() {

                    return true;

                }
            )

            .catch(
                function() {

                    return false;

                }
            );

    }



    const area =
        document.createElement(
            "textarea"
        );


    area.value =
        kode;


    area.style.position =
        "fixed";


    area.style.opacity =
        "0";


    document.body.appendChild(
        area
    );


    area.select();


    let berhasil =
        false;


    try {

        berhasil =
            document.execCommand(
                "copy"
            );

    }

    catch (e) {}


    area.remove();


    return Promise.resolve(
        berhasil
    );

}



// =========================================
// HASIL FILTER RAK
// =========================================

function cocokRak(item) {

    const rakItem =
        String(
            item.RAK ?? ""
        ).trim();


    // Semua rak

    if (
        modeRak === "all"
    ) {

        return true;

    }



    // Pilih rak

    if (
        modeRak === "select"
    ) {

        return rakTerpilih.includes(
            rakItem
        );

    }



    // Rentang rak

    if (
        modeRak === "range"
    ) {

        const indexItem =
            daftarRak.indexOf(
                rakItem
            );


        const indexFrom =
            daftarRak.indexOf(
                rakRangeFrom
            );


        const indexTo =
            daftarRak.indexOf(
                rakRangeTo
            );


        if (
            indexItem === -1 ||
            indexFrom === -1 ||
            indexTo === -1
        ) {

            return false;

        }


        const awal =
            Math.min(
                indexFrom,
                indexTo
            );


        const akhir =
            Math.max(
                indexFrom,
                indexTo
            );


        return (
            indexItem >= awal &&
            indexItem <= akhir
        );

    }


    return true;

}


document.querySelectorAll(".sort-button").forEach(function(tombol) {
    tombol.addEventListener("click", function() {
        const kolom = tombol.dataset.sort;

        if (kolomSortir === kolom) {
            arahSortir *= -1;
        } else {
            kolomSortir = kolom;
            arahSortir = 1;
        }

        document.querySelectorAll(".sort-button").forEach(function(btn) {
            btn.querySelector("span").textContent =
                btn.dataset.sort === kolomSortir
                    ? (arahSortir === 1 ? "↑" : "↓")
                    : "↕";
        });

        halamanSekarang = 1;
        filterData();
        renderTabel();
    });
});


// =========================================
// FILTER DATA
// =========================================

function filterData() {

    const search =
        normalisasi(
            inputSearch.value
        );


    filteredProduk =
        dataProduk.filter(
            function(item) {


                // FILTER RAK

                if (
                    !cocokRak(item)
                ) {

                    return false;

                }



                // SEARCH

                if (!search) {

                    return true;

                }


                const kode =
                    normalisasi(
                        item.KODE
                    );


                const nama =
                    normalisasi(
                        item.NAMA
                    );


                return (

                    kode.includes(
                        search
                    )

                    ||

                    nama.includes(
                        search
                    )

                );

            }
        );
  

    if (kolomSortir) {
        filteredProduk.sort(function(a, b) {
            let hasil;

            if (kolomSortir === "STOK") {
                hasil = Number(a.STOK || 0) - Number(b.STOK || 0);
            } else if (kolomSortir === "RAK") {
                hasil = String(a.RAK ?? "").localeCompare(
                    String(b.RAK ?? ""),
                    undefined,
                    { numeric: true, sensitivity: "base" }
                );
            } else {
                hasil = String(a.NAMA ?? "").localeCompare(
                    String(b.NAMA ?? ""),
                    undefined,
                    { numeric: true, sensitivity: "base" }
                );
            }

            return hasil * arahSortir;
        });
    }



    const totalHalaman =
        Math.max(

            1,

            Math.ceil(

                filteredProduk.length /
                PAGE_SIZE

            )

        );


    if (
        halamanSekarang >
        totalHalaman
    ) {

        halamanSekarang =
            totalHalaman;

    }

}



// =========================================
// RENDER DENGAN DEBOUNCE
// =========================================

function jadwalkanRender(
    resetHalaman = false
) {

    if (
        resetHalaman
    ) {

        halamanSekarang =
            1;

    }


    clearTimeout(
        renderTimer
    );


    renderTimer =

        setTimeout(

            function() {

                filterData();

                renderTabel();

            },

            30

        );

}



// =========================================
// UPDATE INFO ITEM
// =========================================

function updateItemInfo(
    start,
    akhir
) {

    const jumlahHalaman =
        Math.max(
            0,
            akhir - start
        );


    let jumlahShowing;


    /*
        TANPA FILTER RAK:
        Showing mengikuti
        jumlah item halaman.
    */

    if (
        modeRak === "all"
    ) {

        jumlahShowing =
            jumlahHalaman;

    }

    /*
        DENGAN FILTER RAK:
        Showing mengikuti
        seluruh hasil filter rak.
    */

    else {

        jumlahShowing =
            filteredProduk.length;

    }


    itemInfo.textContent =

        `Showing ${formatAngka(
            jumlahShowing
        )} of ${formatAngka(
            dataProduk.length
        )} item`;

}



// =========================================
// UPDATE LABEL FILTER RAK
// =========================================

function updateRakFilterText() {

    if (
        modeRak === "all"
    ) {

        rakFilterText.textContent =
            "Semua Rak";

        return;

    }



    if (
        modeRak === "select"
    ) {

        if (
            rakTerpilih.length === 0
        ) {

            rakFilterText.textContent =
                "Pilih Rak";

            return;

        }


        if (
            rakTerpilih.length === 1
        ) {

            rakFilterText.textContent =
                rakTerpilih[0];

            return;

        }


        rakFilterText.textContent =
            `${rakTerpilih.length} Rak`;

        return;

    }



    if (
        modeRak === "range"
    ) {

        rakFilterText.textContent =
            `${rakRangeFrom} - ${rakRangeTo}`;

    }

}



// =========================================
// MODE FILTER RAK
// =========================================

function updateRakModeUI() {

    const radio =
        document.querySelector(
            'input[name="rakMode"]:checked'
        );


    if (!radio) return;


    const mode =
        radio.value;


    selectRakArea.style.display =
        mode === "select"
            ? "block"
            : "none";


    rangeRakArea.style.display =
        mode === "range"
            ? "block"
            : "none";

}



// =========================================
// SEARCH PILIHAN RAK
// =========================================

inputSearchRak.addEventListener(
    "input",
    function() {
        renderHasilPilihRak();
    }
);

inputSearchRakFrom.addEventListener(
    "input",
    function() {
        renderHasilRentang("from");
    }
);

inputSearchRakTo.addEventListener(
    "input",
    function() {
        renderHasilRentang("to");
    }
);


// =========================================
// LONG PRESS DATA HIDDEN UNTUK SHOW SEMUA PADA HALAMAN AKTIF
// =========================================

function dataHiddenPadaHalamanAktif() {
    const start = (halamanSekarang - 1) * PAGE_SIZE;
    const akhir = Math.min(start + PAGE_SIZE, filteredProduk.length);

    return filteredProduk
        .slice(start, akhir)
        .filter(function(item) {
            return isHidden(item);
        });
}

function tampilkanKonfirmasiShowSemua() {
    const targetHidden = dataHiddenPadaHalamanAktif();
    if (targetHidden.length === 0) return;

    // Hindari membuka konfirmasi dobel bila event long-press terpanggil berdekatan.
    if (document.getElementById("showHiddenConfirmOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "showHiddenConfirmOverlay";
    overlay.style.cssText = [
        "position:fixed", "inset:0", "z-index:100000",
        "display:flex", "align-items:center", "justify-content:center",
        "padding:20px", "background:rgba(15,23,42,.42)",
        "backdrop-filter:blur(2px)"
    ].join(";");

    const modal = document.createElement("div");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "showHiddenConfirmTitle");
    modal.style.cssText = [
        "width:100%", "max-width:360px", "box-sizing:border-box",
        "padding:24px", "border-radius:18px", "background:#fff",
        "box-shadow:0 18px 55px rgba(15,23,42,.24)",
        "font-family:Arial,sans-serif", "text-align:center",
        "transform:translateY(8px)", "opacity:0",
        "transition:opacity .18s ease, transform .18s ease"
    ].join(";");

    const icon = document.createElement("div");
    icon.textContent = "↗";
    icon.style.cssText = [
        "display:flex", "align-items:center", "justify-content:center",
        "width:48px", "height:48px", "margin:0 auto 14px",
        "border-radius:50%", "background:#e8f2ff", "color:#1976d2",
        "font-size:28px", "font-weight:700"
    ].join(";");

    const title = document.createElement("div");
    title.id = "showHiddenConfirmTitle";
    title.textContent = "Tampilkan semua data?";
    title.style.cssText = "font-size:18px;font-weight:700;color:#172033;margin-bottom:8px";

    const message = document.createElement("div");
    message.textContent = targetHidden.length.toLocaleString("id-ID") +
        " data tersembunyi pada halaman ini akan ditampilkan kembali.";
    message.style.cssText = "font-size:14px;line-height:1.55;color:#647084;margin-bottom:22px";

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:10px";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Batal";
    cancel.style.cssText = [
        "flex:1", "min-height:43px", "border:1px solid #d9e0e8",
        "border-radius:10px", "background:#f8fafc", "color:#334155",
        "font-size:14px", "font-weight:700", "cursor:pointer"
    ].join(";");

    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.textContent = "Tampilkan";
    confirm.style.cssText = [
        "flex:1", "min-height:43px", "border:0", "border-radius:10px",
        "background:#1976d2", "color:#fff", "font-size:14px",
        "font-weight:700", "cursor:pointer", "box-shadow:0 3px 8px rgba(25,118,210,.2)"
    ].join(";");

    actions.append(cancel, confirm);
    modal.append(icon, title, message, actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(function() {
        modal.style.opacity = "1";
        modal.style.transform = "translateY(0)";
    });

    function tutup() {
        modal.style.opacity = "0";
        modal.style.transform = "translateY(8px)";
        setTimeout(function() { overlay.remove(); }, 180);
    }

    cancel.addEventListener("click", tutup);
    overlay.addEventListener("click", function(event) {
        if (event.target === overlay) tutup();
    });
    confirm.addEventListener("click", function() {
        // Hapus hanya status hidden untuk item yang berada di halaman/filter aktif.
        targetHidden.forEach(function(item) {
            const kode = kodeProduk(item);
            if (kode) delete hiddenProduk[kode];
        });
        simpanHidden();
        tutup();
        renderTabel();
        simpanTampilanCroscheck();
    });

    cancel.focus({ preventScroll: true });
}

function pasangLongPressTampilkanSemua(area) {
    let timerLongPress = null;
    let posisiAwalX = 0;
    let posisiAwalY = 0;
    let blokKlikSampai = 0;

    function batalkanTimer() {
        clearTimeout(timerLongPress);
        timerLongPress = null;
    }

    area.addEventListener("pointerdown", function(event) {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        posisiAwalX = event.clientX;
        posisiAwalY = event.clientY;
        batalkanTimer();

        timerLongPress = setTimeout(function() {
            timerLongPress = null;
            blokKlikSampai = Date.now() + 1000;
            // Mencegah event klik setelah menahan data mengubah status satu item.
            setTimeout(function() { blokKlikSampai = 0; }, 1100);
            tampilkanKonfirmasiShowSemua();
        }, 650);
    });

    area.addEventListener("pointermove", function(event) {
        if (Math.abs(event.clientX - posisiAwalX) > 12 ||
            Math.abs(event.clientY - posisiAwalY) > 12) {
            batalkanTimer();
        }
    });
    area.addEventListener("pointerup", batalkanTimer);
    area.addEventListener("pointercancel", batalkanTimer);
    area.addEventListener("pointerleave", batalkanTimer);

    // Bila browser tetap mengirim click setelah long-press, abaikan click tersebut.
    area.addEventListener("click", function(event) {
        if (Date.now() <= blokKlikSampai) {
            event.preventDefault();
            event.stopImmediatePropagation();
            blokKlikSampai = 0;
        }
    }, true);

    area.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });
}


// =========================================
// DOUBLE CLICK / DOUBLE TAP UNTUK SHOW / HIDDEN
// =========================================

function pasangDoubleClick(td, item) {
    let waktuKlikTerakhir = 0;
    let timerKlik = null;

    td.addEventListener("click", function(event) {
        const sekarang = Date.now();
        const selang = sekarang - waktuKlikTerakhir;

        if (selang > 0 && selang <= 550) {
            clearTimeout(timerKlik);
            waktuKlikTerakhir = 0;
            event.preventDefault();
            event.stopPropagation();

            setHidden(item, !isHidden(item));
            renderTabel();
            simpanTampilanCroscheck();
            return;
        }

        waktuKlikTerakhir = sekarang;
        clearTimeout(timerKlik);
        timerKlik = setTimeout(function() {
            waktuKlikTerakhir = 0;
        }, 600);
    });

    // Cegah seleksi teks bawaan browser; aksi dua kali ditangani oleh click di atas.
    td.addEventListener("dblclick", function(event) {
        event.preventDefault();
        event.stopPropagation();
    });
}


// =========================================
// BUAT INPUT PLACEHOLDER HIDDEN
// =========================================

function buatPlaceholderHidden(
    nilai,
    item
) {

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


    input.placeholder =
        String(
            nilai ?? "-"
        );


    input.readOnly =
        true;


    input.tabIndex =
        -1;


    input.className =
        "hidden-placeholder";


    return input;

}



// =========================================
// BUAT BARIS
// =========================================

function buatBaris(item) {

    const hidden =
        isHidden(item);


    const tr =
        document.createElement(
            "tr"
        );


    if (hidden) {

        tr.classList.add(
            "hidden-row"
        );

    }



    // =========================
    // BARCODE
    // =========================

    const tdKode =
        document.createElement(
            "td"
        );


    if (hidden) {

        const placeholder =
            buatPlaceholderHidden(
                kodeProduk(item),
                item
            );


        tdKode.appendChild(
            placeholder
        );

    }

    else {

        const kodeButton =
            document.createElement(
                "button"
            );


        kodeButton.type =
            "button";


        kodeButton.className =
            "code-button";


        kodeButton.textContent =
            kodeProduk(item) || "-";


        kodeButton.title =

            toggleHiddenCopy.checked

                ? "Klik untuk salin dan sembunyikan"

                : "Klik untuk salin";


        kodeButton.addEventListener(
            "click",
            function() {

                const kode =
                    kodeProduk(item);


                if (!kode) return;


                salinKode(kode)

                    .then(
                        function(berhasil) {

                            if (!berhasil) {

                                alert(
                                    "Browser tidak mengizinkan salin otomatis."
                                );

                                return;

                            }


                            if (
                                toggleHiddenCopy.checked
                            ) {

                                setHidden(
                                    item,
                                    true
                                );


                                renderTabel();

                            }

                        }
                    );

            }
        );


        tdKode.appendChild(
            kodeButton
        );

    }



    // Pada sel barcode, aktifkan dua kali klik hanya saat datanya hidden.
    // Saat barcode normal, satu klik tetap khusus untuk menyalin barcode.
    if (hidden) {
        pasangDoubleClick(
            tdKode,
            item
        );
        pasangLongPressTampilkanSemua(tdKode);
    }


    // =========================
    // NAMA PRODUK
    // =========================

    const tdNama =
        document.createElement(
            "td"
        );


if (hidden) {

        tdNama.appendChild(

            buatPlaceholderHidden(
                item.NAMA ?? "-",
                item
            )

        );

    }

    else {

        const namaProduk =
            document.createElement(
                "div"
            );


        namaProduk.className =
            "product-name";


        namaProduk.textContent =
            String(
                item.NAMA ?? "-"
            );


        tdNama.appendChild(
            namaProduk
        );

    }


    pasangDoubleClick(
        tdNama,
        item
    );
    if (hidden) {
        pasangLongPressTampilkanSemua(tdNama);
    }



    // =========================
    // STOK
    // =========================

    const tdStok =
        document.createElement(
            "td"
        );


    if (hidden) {

        const placeholderStok =
            buatPlaceholderHidden(
                item.STOK ?? "0",
                item
            );


        placeholderStok.style.textAlign =
            "center";


        tdStok.appendChild(
            placeholderStok
        );

    }

    else {

        tdStok.textContent =
            String(
                item.STOK ?? "0"
            );

    }


    tdStok.style.textAlign =
        "center";


    pasangDoubleClick(
        tdStok,
        item
    );
    if (hidden) {
        pasangLongPressTampilkanSemua(tdStok);
    }



    // =========================
    // RAK
    // =========================

    const tdRak =
        document.createElement(
            "td"
        );


    if (hidden) {

        tdRak.appendChild(

            buatPlaceholderHidden(
                item.RAK ?? "-",
                item
            )

        );

    }

    else {

        tdRak.textContent =
            String(
                item.RAK ?? "-"
            );

    }


    pasangDoubleClick(
        tdRak,
        item
    );
    if (hidden) {
        pasangLongPressTampilkanSemua(tdRak);
    }



    // =========================
    // GABUNGKAN BARIS
    // =========================

    tr.append(

        tdKode,

        tdNama,

        tdStok,

        tdRak

    );


    return tr;

}



// =========================================
// RENDER TABEL
// =========================================

function renderTabel() {

    const totalHalaman =
        Math.max(

            1,

            Math.ceil(

                filteredProduk.length /
                PAGE_SIZE

            )

        );


    const start =
        (halamanSekarang - 1) *
        PAGE_SIZE;


    const akhir =
        Math.min(

            start + PAGE_SIZE,

            filteredProduk.length

        );


    tableBody.replaceChildren();



    if (
        filteredProduk.length === 0
    ) {

        emptyState.style.display =
            "block";


        emptyState.textContent =

            dataProduk.length === 0

                ? "Belum ada file Excel yang di-upload."

                : "Produk tidak ditemukan.";

    }

    else {

        emptyState.style.display =
            "none";


        const fragment =
            document.createDocumentFragment();


        for (

            let i = start;

            i < akhir;

            i++

        ) {

            fragment.appendChild(

                buatBaris(

                    filteredProduk[i]

                )

            );

        }


        tableBody.appendChild(
            fragment
        );

    }



    updateItemInfo(
        start,
        akhir
    );


    pageInfo.textContent =

        `Halaman ${halamanSekarang} / ${totalHalaman}`;


    btnPrev.disabled =
        halamanSekarang <= 1;


    btnNext.disabled =
        halamanSekarang >=
        totalHalaman;

}



// =========================================
// BUKA / TUTUP POPUP
// =========================================

btnRakFilter.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        const akanDibuka =
            !rakPopup.classList.contains(
                "show"
            );

        if (akanDibuka) {
            siapkanRakSementara();
        }

        rakPopup.classList.toggle(
            "show"
        );

    }
);


// Klik luar popup = tutup

document.addEventListener(
    "click",
    function(event) {

        if (
            !rakPopup.contains(event.target) &&
            event.target !== btnRakFilter
        ) {

            rakPopup.classList.remove(
                "show"
            );

        }

    }
);



// =========================================
// MODE RAK BERUBAH
// =========================================

document
    .querySelectorAll(
        'input[name="rakMode"]'
    )
    .forEach(
        function(radio) {

            radio.addEventListener(
                "change",
                function() {

                    updateRakModeUI();

                }
            );

        }
    );



// =========================================
// BATAL
// =========================================

btnCancelRak.addEventListener(
    "click",
    function() {

        siapkanRakSementara();

        rakPopup.classList.remove(
            "show"
        );

        updateRakModeUI();

    }
);


// =========================================
// TERAPKAN FILTER RAK
// =========================================

btnApplyRak.addEventListener(
    "click",
    function() {

        const radio =
            document.querySelector(
                'input[name="rakMode"]:checked'
            );

        if (!radio) return;

        const mode =
            radio.value;

        if (mode === "all") {

            modeRak =
                "all";

        }
        else if (mode === "select") {

            if (rakTerpilihSementara.length === 0) {

                alert(
                    "Silakan pilih minimal satu rak."
                );

                return;

            }

            rakTerpilih =
                [...rakTerpilihSementara];

            modeRak =
                "select";

        }
        else if (mode === "range") {

            if (!rakRangeFromSementara || !rakRangeToSementara) {

                alert(
                    "Silakan pilih rak awal dan rak akhir."
                );

                return;

            }

            rakRangeFrom =
                rakRangeFromSementara;

            rakRangeTo =
                rakRangeToSementara;

            modeRak =
                "range";

        }

        halamanSekarang =
            1;

        updateRakFilterText();

        siapkanRakSementara();

        rakPopup.classList.remove(
            "show"
        );

        jadwalkanRender(true);

    }
);


// =========================================
// INPUT SEARCH + BLOK OTOMATIS + TOMBOL HAPUS
// =========================================

function perbaruiTampilanSearch() {
    if (searchSelectionVisual) {
        searchSelectionVisual.textContent = inputSearch.value;
    }

    if (clearSearchButton) {
        clearSearchButton.hidden = inputSearch.value.length === 0;
    }
}

inputSearch.addEventListener("input", function() {
    // Saat pengguna mengetik lagi, buka blok visual lama terlebih dahulu.
    if (searchWrap) {
        searchWrap.classList.remove("selection-locked");
    }

    perbaruiTampilanSearch();
    jadwalkanRender(true);

    clearTimeout(inputSearch.selectTimer);
    inputSearch.selectTimer = setTimeout(function() {
        // Hanya membuat blok otomatis ketika kolom search masih aktif.
        if (document.activeElement !== inputSearch || !inputSearch.value) {
            return;
        }

        inputSearch.select();
        if (searchWrap) {
            searchWrap.classList.add("selection-locked");
        }
        perbaruiTampilanSearch();
    }, 2000);
});

function lepasBlokSearch() {
    // Klik khusus pada kolom search adalah satu-satunya tindakan yang melepas blok.
    if (searchWrap) {
        searchWrap.classList.remove("selection-locked");
    }
    perbaruiTampilanSearch();
}

inputSearch.addEventListener("focus", lepasBlokSearch);
inputSearch.addEventListener("click", lepasBlokSearch);

if (clearSearchButton) {
    clearSearchButton.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();

        clearTimeout(inputSearch.selectTimer);
        inputSearch.value = "";
        if (searchWrap) {
            searchWrap.classList.remove("selection-locked");
        }
        perbaruiTampilanSearch();
        jadwalkanRender(true);
        inputSearch.focus();
        simpanTampilanCroscheck();
    });
}


// =========================================
// PREVIOUS
// =========================================

btnPrev.addEventListener(
    "click",
    function() {

        if (
            halamanSekarang <= 1
        ) {

            return;

        }


        halamanSekarang--;


        renderTabel();


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);



// =========================================
// NEXT
// =========================================

btnNext.addEventListener(
    "click",
    function() {

        const totalHalaman =
            Math.max(

                1,

                Math.ceil(

                    filteredProduk.length /
                    PAGE_SIZE

                )

            );


        if (
            halamanSekarang >=
            totalHalaman
        ) {

            return;

        }


        halamanSekarang++;


        renderTabel();


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);



// =========================================
// SIMPAN / PULIHKAN KONDISI TAMPILAN CROS CHECK
// =========================================

function simpanTampilanCroscheck() {
    try {
        sessionStorage.setItem(VIEW_STATE_KEY, JSON.stringify({
            search: inputSearch.value,
            searchSelectionLocked: Boolean(searchWrap?.classList.contains("selection-locked")),
            hiddenCopy: Boolean(toggleHiddenCopy.checked),
            modeRak: modeRak,
            rakTerpilih: rakTerpilih,
            rakRangeFrom: rakRangeFrom,
            rakRangeTo: rakRangeTo,
            halaman: halamanSekarang,
            kolomSortir: kolomSortir,
            arahSortir: arahSortir
        }));
    } catch (e) {
        // Jika sessionStorage penuh/tidak tersedia, fungsi utama tetap berjalan.
    }
}

function pulihkanTampilanCroscheck() {
    const state = tampilanCroscheckTersimpan;
    if (!state || typeof state !== "object") return;

    inputSearch.value = String(state.search ?? "");
    toggleHiddenCopy.checked = state.hiddenCopy === true;

    modeRak = ["all", "select", "range"].includes(state.modeRak)
        ? state.modeRak
        : "all";

    rakTerpilih = Array.isArray(state.rakTerpilih)
        ? state.rakTerpilih.map(String)
        : [];

    rakRangeFrom = String(state.rakRangeFrom ?? "");
    rakRangeTo = String(state.rakRangeTo ?? "");

    halamanSekarang = Math.max(1, Number(state.halaman) || 1);
    kolomSortir = ["NAMA", "STOK", "RAK"].includes(state.kolomSortir)
        ? state.kolomSortir
        : "";
    arahSortir = Number(state.arahSortir) === -1 ? -1 : 1;

    const radioRak = document.querySelector(
        `input[name="rakMode"][value="${modeRak}"]`
    );
    if (radioRak) radioRak.checked = true;

    document.querySelectorAll(".sort-button").forEach(function(btn) {
        const icon = btn.querySelector("span");
        if (!icon) return;
        icon.textContent = btn.dataset.sort === kolomSortir
            ? (arahSortir === 1 ? "↑" : "↓")
            : "↕";
    });

    perbaruiTampilanSearch();
    if (state.searchSelectionLocked && inputSearch.value && searchWrap) {
        searchWrap.classList.add("selection-locked");
    }
}

// Simpan setelah aksi selesai, bukan di tengah-tengah event handler.
let timerSimpanTampilan = null;
function jadwalkanSimpanTampilan() {
    clearTimeout(timerSimpanTampilan);
    timerSimpanTampilan = setTimeout(simpanTampilanCroscheck, 80);
}

document.addEventListener("click", jadwalkanSimpanTampilan, true);
document.addEventListener("input", jadwalkanSimpanTampilan, true);
document.addEventListener("change", jadwalkanSimpanTampilan, true);
window.addEventListener("pagehide", simpanTampilanCroscheck);


// =========================================
// KEMBALI KE OPNAME
// =========================================

document
    .getElementById(
        "btnBack"
    )
    .addEventListener(
        "click",
        function() {

            window.location.href =
                "index.html";

        }
    );



// =========================================
// JIKA DATA EXCEL BERUBAH
// =========================================

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            STORAGE_KEY
        ) {

            bacaDataExcel();

            halamanSekarang =
                1;

            jadwalkanRender(
                true
            );

        }

    }
);



// =========================================
// MULAI
// =========================================

bacaDataExcel();

pulihkanTampilanCroscheck();

siapkanRakSementara();

updateRakModeUI();

updateRakFilterText();

filterData();

renderTabel();

perbaruiTampilanSearch();