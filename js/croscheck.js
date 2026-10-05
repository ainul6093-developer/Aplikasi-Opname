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

const itemInfo =
    document.getElementById("itemInfo");

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
// DOUBLE CLICK UNTUK SHOW / HIDDEN
// =========================================

function pasangDoubleClick(td, item) {

    td.addEventListener(
        "dblclick",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            setHidden(
                item,
                !isHidden(item)
            );

            renderTabel();

        }
    );

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


    input.type = "text";

    input.placeholder =
        String(
            nilai ?? "-"
        );


    input.readOnly = true;

    input.tabIndex = -1;

    input.className =
        "hidden-placeholder";


    /*
        Double-click placeholder
        untuk menampilkan data.
    */

    input.addEventListener(
        "dblclick",
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            if (!isHidden(item)) {

                return;

            }


            setHidden(
                item,
                false
            );


            renderTabel();

        }
    );


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

        /*
            Barcode tetap disimpan
            sebagai data asli.

            Yang ditampilkan adalah
            native placeholder.
        */

        const placeholder =
            buatPlaceholderHidden(
                kodeProduk(item),
                item
            );


        tdKode.appendChild(
            placeholder
        );


    } else {

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


        tdKode.appendChild(
            kodeButton
        );

    }



    // =========================
    // PRODUK
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

} else {

    const namaProduk =
        document.createElement("div");

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

    } else {

        tdRak.textContent =
            String(
                item.RAK ?? "-"
            );

    }

pasangDoubleClick(
    tdRak,
    item
);
  

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
            "right";


        tdStok.appendChild(
            placeholderStok
        );


    } else {

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
  
  
    // =========================
    // GABUNGKAN BARIS
    // =========================

    tr.append(

        tdKode,

        tdNama,

        tdStok,

        tdRak,

    );


    return tr;

}



// =========================================
// RENDER TABEL
// =========================================

function renderTabel() {

const jumlahDitampilkan =
    Math.min(
        PAGE_SIZE,
        Math.max(
            0,
            filteredProduk.length -
            ((halamanSekarang - 1) * PAGE_SIZE)
        )
    );

const totalProduk =
    dataProduk.length;

itemInfo.textContent =
    `Showing ${jumlahDitampilkan.toLocaleString("id-ID")} of ${totalProduk.toLocaleString("id-ID")} item`;
  
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
            Tunggu 30ms agar search
            tetap ringan dan responsif.
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