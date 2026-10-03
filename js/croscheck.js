// =========================================
// CROS CHECK
// Sumber data: file Excel yang sudah di-upload
// =========================================


const STORAGE_KEY = "opnameTokoData";

const HIDDEN_KEY =
    "croscheckHiddenProduk";


const PAGE_SIZE = 100;


let dataProduk = [];

let hiddenProduk = {};

let filteredProduk = [];

let halamanSekarang = 1;

let renderTimer = null;



// =========================================
// ELEMENT
// =========================================

const inputRak =
    document.getElementById("inputRak");


const inputSearch =
    document.getElementById("inputSearch");


const toggleHiddenCopy =
    document.getElementById("toggleHiddenCopy");


const tableBody =
    document.getElementById("productTableBody");


const emptyState =
    document.getElementById("emptyState");


const pageInfo =
    document.getElementById("pageInfo");


const btnPrev =
    document.getElementById("btnPrev");


const btnNext =
    document.getElementById("btnNext");



// =========================================
// NORMALISASI
// =========================================

function normalisasi(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase();

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


    } catch (e) {

        dataProduk = [];

    }



    try {

        hiddenProduk =
            JSON.parse(
                localStorage.getItem(
                    HIDDEN_KEY
                )
            ) || {};


    } catch (e) {

        hiddenProduk = {};

    }

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

function setHidden(item, nilai) {

    const kode =
        kodeProduk(item);


    if (!kode) return;


    if (nilai) {

        hiddenProduk[kode] = true;

    } else {

        delete hiddenProduk[kode];

    }


    simpanHidden();

}



// =========================================
// SALIN BARCODE
// =========================================

function salinKode(kode) {

    if (!kode) {

        return Promise.resolve(false);

    }


    if (
        navigator.clipboard?.writeText
    ) {

        return navigator.clipboard
            .writeText(kode)

            .then(function() {

                return true;

            })

            .catch(function() {

                return false;

            });

    }



    // Fallback

    const area =
        document.createElement(
            "textarea"
        );


    area.value = kode;

    area.style.position = "fixed";

    area.style.opacity = "0";


    document.body.appendChild(area);


    area.select();


    let berhasil = false;


    try {

        berhasil =
            document.execCommand(
                "copy"
            );

    } catch (e) {}



    area.remove();


    return Promise.resolve(
        berhasil
    );

}



// =========================================
// FILTER DATA
// =========================================

function filterData() {

    const rak =
        normalisasi(
            inputRak.value
        );


    const search =
        normalisasi(
            inputSearch.value
        );


    /*
        FILTER RAK DAHULU.

        Rak kosong:
        search berlaku ke semua data.

        Rak diisi:
        search hanya mencari
        di rak tersebut.
    */

    filteredProduk =
        dataProduk.filter(
            function(item) {

                if (
                    rak &&
                    normalisasi(
                        item.RAK
                    ) !== rak
                ) {

                    return false;

                }


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
                    kode.includes(search) ||
                    nama.includes(search)
                );

            }
        );



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

    if (resetHalaman) {

        halamanSekarang = 1;

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


    const kodeButton =
        document.createElement(
            "button"
        );


    kodeButton.type =
        "button";


    kodeButton.className =
        "code-button";



    if (hidden) {

        kodeButton.innerHTML =
            '<span class="hidden-value">••••••</span>';


        kodeButton.title =
            "Data tersembunyi — gunakan icon mata untuk menampilkan";


    } else {

        kodeButton.textContent =
            kodeProduk(item) || "-";


        kodeButton.title =
            toggleHiddenCopy.checked
                ? "Klik untuk salin dan sembunyikan"
                : "Klik untuk salin";

    }



    /*
        Kalau data sudah hidden,
        barcode tidak bisa diklik.

        Harus dibuka dulu lewat
        icon mata.
    */

    if (!hidden) {

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


                            /*
                                Hidden Copy ON:
                                klik barcode =
                                salin + sembunyikan.
                            */

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

    }


    tdKode.appendChild(
        kodeButton
    );



    // =========================
    // PRODUK
    // =========================

    const tdNama =
        document.createElement(
            "td"
        );


    tdNama.textContent =
        hidden
            ? "••••••"
            : String(
                item.NAMA ?? "-"
            );


    if (hidden) {

        tdNama.className =
            "hidden-value";

    }



    // =========================
    // RAK
    // =========================

    const tdRak =
        document.createElement(
            "td"
        );


    tdRak.textContent =
        hidden
            ? "••••"
            : String(
                item.RAK ?? "-"
            );


    if (hidden) {

        tdRak.className =
            "hidden-value";

    }



    // =========================
    // STOK
    // =========================

    const tdStok =
        document.createElement(
            "td"
        );


    tdStok.textContent =
        hidden
            ? "••"
            : String(
                item.STOK ?? "0"
            );


    if (hidden) {

        tdStok.className =
            "hidden-value";

    }


    tdStok.style.textAlign =
        "right";



    // =========================
    // ACTION
    // =========================

    const tdAction =
        document.createElement(
            "td"
        );


    tdAction.style.textAlign =
        "center";


    const eyeButton =
        document.createElement(
            "button"
        );


    eyeButton.type =
        "button";


    eyeButton.className =
        "eye-button";


    /*
        👁  = tampil
        👁̶ = hidden
    */

    eyeButton.textContent =
        hidden
            ? "👁̶"
            : "👁";


    eyeButton.title =
        hidden
            ? "Tampilkan data"
            : "Sembunyikan data";


    eyeButton.addEventListener(
        "click",
        function() {

            setHidden(
                item,
                !isHidden(item)
            );


            renderTabel();

        }
    );


    tdAction.appendChild(
        eyeButton
    );



    tr.append(
        tdKode,
        tdNama,
        tdRak,
        tdStok,
        tdAction
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


    } else {

        emptyState.style.display =
            "none";


        /*
            Hanya 100 data aktif
            yang dibuat di DOM.
        */

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



    pageInfo.textContent =
        `Halaman ${halamanSekarang} / ${totalHalaman}`;


    btnPrev.disabled =
        halamanSekarang <= 1;


    btnNext.disabled =
        halamanSekarang >=
        totalHalaman;

}



// =========================================
// INPUT RAK
// =========================================

inputRak.addEventListener(
    "input",
    function() {

        const posisi =
            this.selectionStart;


        this.value =
            this.value.toUpperCase();


        try {

            this.setSelectionRange(
                posisi,
                posisi
            );

        } catch (e) {}


        jadwalkanRender(true);

    }
);



// =========================================
// SEARCH
// =========================================

inputSearch.addEventListener(
    "input",
    function() {

        /*
            Tidak langsung render
            setiap karakter.

            Tunggu 30ms agar tetap
            ringan tetapi terasa
            responsif.
        */

        jadwalkanRender(true);

    }
);



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
// KEMBALI KE OPNAME
// =========================================

document
    .getElementById("btnBack")
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
            event.key === STORAGE_KEY
        ) {

            bacaDataExcel();

            jadwalkanRender(true);

        }

    }
);



// =========================================
// MULAI
// =========================================

bacaDataExcel();

filterData();

renderTabel();