// =========================================
// CROS CHECK
// Sumber data: file Excel yang sudah di-upload
// =========================================


const STORAGE_KEY =
    "opnameTokoData";


const HIDDEN_KEY =
    "croscheckHiddenProduk";


const PAGE_SIZE = 100;



let dataProduk = [];

let hiddenProduk = {};

let filteredProduk = [];

let halamanSekarang = 1;

let renderTimer = null;



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



// =========================================
// ELEMENT
// =========================================

const inputSearch =
    document.getElementById(
        "inputSearch"
    );


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


const selectRakArea =
    document.getElementById(
        "selectRakArea"
    );


const rangeRakArea =
    document.getElementById(
        "rangeRakArea"
    );


const rakRangeFromSelect =
    document.getElementById(
        "rakRangeFrom"
    );

const rakRangeToSelect =
    document.getElementById(
        "rakRangeTo"
    );

const btnSelectAllRak =
    document.getElementById(
        "btnSelectAllRak"
    );


const btnClearRak =
    document.getElementById(
        "btnClearRak"
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
// RENDER DAFTAR RAK
// =========================================

function renderDaftarRak() {

    rakList.replaceChildren();


    if (
        daftarRak.length === 0
    ) {

        const kosong =
            document.createElement(
                "div"
            );


        kosong.textContent =
            "Belum ada data rak.";


        kosong.style.padding =
            "8px";


        kosong.style.color =
            "#777";


        rakList.appendChild(
            kosong
        );


        return;

    }



    daftarRak.forEach(
        function(rak) {

            const label =
                document.createElement(
                    "label"
                );


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.value =
                rak;


            checkbox.className =
                "rak-checkbox";


            if (
                rakTerpilih.includes(
                    rak
                )
            ) {

                checkbox.checked =
                    true;

            }


            const text =
                document.createElement(
                    "span"
                );


            text.textContent =
                rak;


            label.append(
                checkbox,
                text
            );


            rakList.appendChild(
                label
            );

        }
    );

}



// =========================================
// RENDER PILIHAN RENTANG
// =========================================

function renderPilihanRentang() {

    rakRangeFromSelect.replaceChildren();
    rakRangeToSelect.replaceChildren();

    daftarRak.forEach(
        function(rak) {

            const optionFrom =
                document.createElement(
                    "option"
                );

            optionFrom.value =
                rak;

            optionFrom.textContent =
                rak;

            rakRangeFromSelect.appendChild(
                optionFrom
            );


            const optionTo =
                document.createElement(
                    "option"
                );

            optionTo.value =
                rak;

            optionTo.textContent =
                rak;

            rakRangeToSelect.appendChild(
                optionTo
            );

        }
    );


    if (
        rakRangeFromSelect.options.length
    ) {

        rakRangeFromSelect.value =
            rakRangeFromSelect.options[0].value;

        rakRangeToSelect.value =
            rakRangeToSelect.options[
                rakRangeToSelect.options.length - 1
            ].value;

    }


    if (
        rakRangeFromSelect.options.length
    ) {

        if (
            rakTerpilih.length
        ) {

            const pertama =
                rakTerpilih[0];

            const terakhir =
                rakTerpilih[
                    rakTerpilih.length - 1
                ];


            if (
                daftarRak.includes(
                    pertama
                )
            ) {

                rakRangeFromSelect.value =
                    pertama;

            }


            if (
                daftarRak.includes(
                    terakhir
                )
            ) {

                rakRangeToSelect.value =
                    terakhir;

            }

        }

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
// AMBIL RAK YANG DICENTANG
// =========================================

function bacaRakTerpilih() {

    const checkbox =
        rakList.querySelectorAll(
            ".rak-checkbox"
        );


    rakTerpilih =
        Array.from(
            checkbox
        )
        .filter(
            function(item) {

                return item.checked;

            }
        )
        .map(
            function(item) {

                return item.value;

            }
        );

}



// =========================================
// DOUBLE CLICK UNTUK SHOW / HIDDEN
// =========================================

function pasangDoubleClick(
    td,
    item
) {

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


    input.addEventListener(
        "dblclick",
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            if (
                !isHidden(item)
            ) {

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
// PILIH SEMUA RAK
// =========================================

btnSelectAllRak.addEventListener(
    "click",
    function() {

        rakList
            .querySelectorAll(
                ".rak-checkbox"
            )
            .forEach(
                function(checkbox) {

                    checkbox.checked =
                        true;

                }
            );

    }
);



// =========================================
// BERSIHKAN PILIHAN RAK
// =========================================

btnClearRak.addEventListener(
    "click",
    function() {

        rakList
            .querySelectorAll(
                ".rak-checkbox"
            )
            .forEach(
                function(checkbox) {

                    checkbox.checked =
                        false;

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


      // =========================
        // SEMUA RAK
        // =========================

        if (
            mode === "all"
        ) {

            modeRak =
                "all";

        }



        // =========================
        // PILIH RAK
        // =========================

        else if (
            mode === "select"
        ) {

            bacaRakTerpilih();


            if (
                rakTerpilih.length === 0
            ) {

                alert(
                    "Silakan pilih minimal satu rak."
                );

                return;

            }


            modeRak =
                "select";

        }



        // =========================
        // RENTANG RAK
        // =========================

        else if (
            mode === "range"
        ) {

     if (
    !rakRangeFromSelect.value ||
    !rakRangeToSelect.value
) {

    alert(
        "Silakan pilih rak awal dan rak akhir."
    );

    return;

}


rakRangeFrom =
    rakRangeFromSelect.value;

rakRangeTo =
    rakRangeToSelect.value;

            modeRak =
                "range";

        }



        halamanSekarang =
            1;


        updateRakFilterText();


        rakPopup.classList.remove(
            "show"
        );


        jadwalkanRender(true);

    }
);



// =========================================
// INPUT SEARCH
// =========================================

inputSearch.addEventListener(
    "input",
    function() {

        /*
            Search selalu mencari
            dari seluruh hasil filter Rak,
            bukan hanya halaman aktif.
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

updateRakModeUI();

updateRakFilterText();

filterData();

renderTabel();