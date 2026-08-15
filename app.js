/* =========================================================
   BOOKS LABEL STUDIO
   FINAL SCRIPT.JS
========================================================= */

"use strict";


/* =========================================================
   GLOBAL CONFIG
========================================================= */

const CONFIG = window.BOOKS_STUDIO_CONFIG || {
    mapUrl: "https://maps.app.goo.gl/7McYApm1u9x4QSj7A",
    email: "ashish.verma@bookswagon.in"
};


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (id) => document.getElementById(id);

const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));


/* =========================================================
   STATE
========================================================= */

const state = {

    activeSection: "cocoBlueSection",

    activeCocoMode: "cocoIndividual",

    language: "en",

    pageSize: "4x6",

    orientation: "portrait",

    customWidth: null,

    customHeight: null,

    poPlusBox: false,

    showPO: true,

    showBox: true,

    combinedBorder: false,

    poBorder: false,

    boxBorder: false,

    cutLine: false,

    pageBorder: false,

    pageFlowSamePO: false,

    startBox: 1,

    endBox: 10,

    repeatCount: 1,

    poFont: "Arial",

    poFontSize: 24,

    poBold: false,

    poItalic: false,

    poUnderline: false,

    boxFont: "Arial",

    boxFontSize: 20,

    boxBold: false,

    boxItalic: false,

    boxUnderline: false,

    poNumbers: [],

    excelRows: [],

    generatedLabels: []

};


/* =========================================================
   LANGUAGE
========================================================= */

const translations = {

    en: {
        title: "Books Label Studio Tool",
        subtitle: "Books Label & Barcode Management Studio",
        coco: "Coco Blue PO",
        other: "Other PO",
        isbn: "ISBN Barcode",
        address: "Address Sticker",
        generate: "Generate PDF",
        reset: "Reset",
        ready: "Ready",
        individual: "Individual",
        multiple: "Multiple",
        excel: "Excel Upload",
        addressPrint: "Address Print"
    },

    hi: {
        title: "बुक्स लेबल स्टूडियो टूल",
        subtitle: "बुक लेबल और बारकोड मैनेजमेंट स्टूडियो",
        coco: "कोको ब्लू PO",
        other: "अन्य PO",
        isbn: "ISBN बारकोड",
        address: "एड्रेस स्टिकर",
        generate: "PDF बनाएं",
        reset: "रीसेट",
        ready: "तैयार",
        individual: "इंडिविजुअल",
        multiple: "मल्टीपल",
        excel: "एक्सेल अपलोड",
        addressPrint: "एड्रेस प्रिंट"
    }

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeApplication();

});


/* =========================================================
   INITIALIZE
========================================================= */

function initializeApplication() {

    bindNavigation();

    bindCocoTabs();

    bindPageSettings();

    bindBoxSettings();

    bindLabelSettings();

    bindFontSettings();

    bindExcelUpload();

    bindAddressSettings();

    bindAddressModes();

    bindISBN();

    bindModal();

    bindMainButtons();

    bindLanguage();

    initializeQR();

    initializeDefaults();

    updateAll();

}


/* =========================================================
   NAVIGATION
========================================================= */

function bindNavigation() {

    const buttons = $$(".nav-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const sectionId =
                button.dataset.section;

            if (!sectionId) return;

            buttons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            $$(".tool-section").forEach(section => {

                section.classList.remove(
                    "active-section"
                );

            });

            const target = $(sectionId);

            if (target) {

                target.classList.add(
                    "active-section"
                );

            }

            state.activeSection = sectionId;

        });

    });

}


/* =========================================================
   COCO TABS
========================================================= */

function bindCocoTabs() {

    $$(".sub-tab[data-subsection]").forEach(button => {

        button.addEventListener("click", () => {

            const panelId =
                button.dataset.subsection;

            $$(".sub-tab[data-subsection]")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            $$(".sub-panel").forEach(panel =>
                panel.classList.remove(
                    "active-sub-panel"
                )
            );

            const panel = $(panelId);

            if (panel) {

                panel.classList.add(
                    "active-sub-panel"
                );

            }

            state.activeCocoMode = panelId;

        });

    });

}


/* =========================================================
   PAGE SETTINGS
========================================================= */

function bindPageSettings() {

    const pageSize = $("pageSize");

    const orientation = $("orientation");

    const customWidth = $("customWidth");

    const customHeight = $("customHeight");


    if (pageSize) {

        pageSize.addEventListener("change", () => {

            state.pageSize =
                pageSize.value;

            updateCustomSizeState();

            updatePageInfo();

            updatePreview();

            showToast(
                getPageSizeLabel(),
                "success"
            );

        });

    }


    if (orientation) {

        orientation.addEventListener(
            "change",
            () => {

                state.orientation =
                    orientation.value;

                updatePreview();

                showToast(
                    `${capitalize(
                        orientation.value
                    )} mode selected`,
                    "success"
                );

            }
        );

    }


    [customWidth, customHeight]
        .filter(Boolean)
        .forEach(input => {

            input.addEventListener(
                "input",
                () => {

                    state.customWidth =
                        parseFloat(
                            customWidth.value
                        ) || null;

                    state.customHeight =
                        parseFloat(
                            customHeight.value
                        ) || null;

                    updatePageInfo();

                    updatePreview();

                }
            );

        });

}


/* =========================================================
   PAGE SIZE STATE
========================================================= */

function updateCustomSizeState() {

    const pageSize = $("pageSize");

    const customBox = $("customSize");

    const customWidth = $("customWidth");

    const customHeight = $("customHeight");


    if (!pageSize) return;


    const isCustom =
        pageSize.value === "custom";


    if (customBox) {

        customBox.classList.toggle(
            "hidden",
            !isCustom
        );

    }


    if (customWidth) {

        customWidth.disabled =
            !isCustom;

    }


    if (customHeight) {

        customHeight.disabled =
            !isCustom;

    }


    if (!isCustom) {

        if (customWidth)
            customWidth.disabled = true;

        if (customHeight)
            customHeight.disabled = true;

    }

}


/* =========================================================
   PAGE DIMENSIONS
========================================================= */

function getPageDimensions() {

    let width;
    let height;

    switch (state.pageSize) {

        case "4x6":

            width = 101.6;
            height = 152.4;

            break;


        case "70x35":

            width = 70;
            height = 35;

            break;


        case "a4":

            width = 210;
            height = 297;

            break;


        case "custom":

            width =
                Number(
                    state.customWidth
                ) || 100;

            height =
                Number(
                    state.customHeight
                ) || 150;

            break;


        default:

            width = 101.6;
            height = 152.4;

    }


    if (
        state.orientation ===
        "landscape"
    ) {

        return {
            width: height,
            height: width
        };

    }


    return {
        width,
        height
    };

}


/* =========================================================
   PAGE LABEL
========================================================= */

function getPageSizeLabel() {

    const dimensions =
        getPageDimensions();


    if (state.pageSize === "4x6") {

        return "4 × 6 Inches";

    }


    if (state.pageSize === "70x35") {

        return "70 × 35 mm";

    }


    if (state.pageSize === "a4") {

        return "A4";

    }


    return `${dimensions.width} × ${dimensions.height} mm`;

}


/* =========================================================
   PAGE INFO
========================================================= */

function updatePageInfo() {

    const info =
        $("selectedPageInfo");

    if (!info) return;

    info.textContent =
        getPageSizeLabel();

}


/* =========================================================
   BOX SETTINGS
========================================================= */

function bindBoxSettings() {

    const startBox = $("startBox");

    const endBox = $("endBox");

    const repeatCount =
        $("repeatCount");

    const pageFlow =
        $("pageFlowSamePO");


    if (startBox) {

        startBox.addEventListener(
            "input",
            () => {

                state.startBox =
                    Math.max(
                        1,
                        Number(
                            startBox.value
                        ) || 1
                    );

                updatePreview();

            }
        );

    }


    if (endBox) {

        endBox.addEventListener(
            "input",
            () => {

                state.endBox =
                    Math.max(
                        state.startBox,
                        Number(
                            endBox.value
                        ) || state.startBox
                    );

                updatePreview();

            }
        );

    }


    if (repeatCount) {

        repeatCount.addEventListener(
            "input",
            () => {

                state.repeatCount =
                    Math.max(
                        1,
                        Number(
                            repeatCount.value
                        ) || 1
                    );

                updatePreview();

            }
        );

    }


    if (pageFlow) {

        pageFlow.addEventListener(
            "change",
            () => {

                state.pageFlowSamePO =
                    pageFlow.checked;

                showToast(
                    pageFlow.checked
                        ? "Page Flow — Same PO enabled"
                        : "Page Flow — Same PO disabled",
                    pageFlow.checked
                        ? "success"
                        : "warning"
                );

            }
        );

    }

}


/* =========================================================
   LABEL SETTINGS
========================================================= */

function bindLabelSettings() {

    const showPO =
        $("showPO");

    const showBox =
        $("showBox");

    const poPlusBox =
        $("poPlusBox");

    const combinedBorder =
        $("combinedBorder");

    const poBorder =
        $("poBorder");

    const boxBorder =
        $("boxBorder");

    const cutLine =
        $("cutLine");

    const pageBorder =
        $("pageBorder");


    /* ---------------------------------------------
       PO NUMBER
    ---------------------------------------------- */

    if (showPO) {

        showPO.addEventListener(
            "change",
            () => {

                state.showPO =
                    showPO.checked;

                showToast(
                    showPO.checked
                        ? "PO Number enabled"
                        : "PO Number disabled",
                    showPO.checked
                        ? "success"
                        : "warning"
                );

                updatePreview();

            }
        );

    }


    /* ---------------------------------------------
       BOX NUMBER
    ---------------------------------------------- */

    if (showBox) {

        showBox.addEventListener(
            "change",
            () => {

                state.showBox =
                    showBox.checked;

                showToast(
                    showBox.checked
                        ? "Box Number enabled"
                        : "Box Number disabled",
                    showBox.checked
                        ? "success"
                        : "warning"
                );

                updatePreview();

            }
        );

    }


    /* ---------------------------------------------
       PO + BOX
    ---------------------------------------------- */

    if (poPlusBox) {

        poPlusBox.addEventListener(
            "change",
            () => {

                state.poPlusBox =
                    poPlusBox.checked;


                if (
                    poPlusBox.checked
                ) {

                    /*
                     * PO + BOX is one combined
                     * content option.
                     *
                     * Freeze separate PO and BOX
                     * controls.
                     */

                    if (showPO) {

                        showPO.checked = false;

                        showPO.disabled = true;

                        lockRow(showPO);

                    }


                    if (showBox) {

                        showBox.checked = false;

                        showBox.disabled = true;

                        lockRow(showBox);

                    }


                } else {

                    if (showPO) {

                        showPO.disabled = false;

                        showPO.checked = true;

                        unlockRow(showPO);

                    }


                    if (showBox) {

                        showBox.disabled = false;

                        showBox.checked = true;

                        unlockRow(showBox);

                    }

                }


                showToast(
                    poPlusBox.checked
                        ? "PO Number + Box Number enabled"
                        : "PO Number + Box Number disabled",
                    poPlusBox.checked
                        ? "success"
                        : "warning"
                );

                updatePreview();

            }
        );

    }


    /* ---------------------------------------------
       COMBINED BORDER
    ---------------------------------------------- */

    if (combinedBorder) {

        combinedBorder.addEventListener(
            "change",
            () => {

                state.combinedBorder =
                    combinedBorder.checked;


                if (
                    combinedBorder.checked
                ) {

                    if (poBorder) {

                        poBorder.checked = false;

                        poBorder.disabled = true;

                        lockRow(poBorder);

                    }


                    if (boxBorder) {

                        boxBorder.checked = false;

                        boxBorder.disabled = true;

                        lockRow(boxBorder);

                    }

                } else {

                    if (poBorder) {

                        poBorder.disabled = false;

                        unlockRow(poBorder);

                    }


                    if (boxBorder) {

                        boxBorder.disabled = false;

                        unlockRow(boxBorder);

                    }

                }


                showToast(
                    combinedBorder.checked
                        ? "Combined Border enabled"
                        : "Combined Border disabled",
                    combinedBorder.checked
                        ? "success"
                        : "warning"
                );

                updatePreview();

            }
        );

    }


    /* ---------------------------------------------
       PO BORDER
    ---------------------------------------------- */

    if (poBorder) {

        poBorder.addEventListener(
            "change",
            () => {

                state.poBorder =
                    poBorder.checked;

                showToast(
                    poBorder.checked
                        ? "PO Border enabled"
                        : "PO Border disabled",
                    poBorder.checked
                        ? "success"
                        : "warning"
                );

                updatePreview();

            }
        );

    }


    /* ---------------------------------------------
       BOX BORDER
    ---------------------------------------------- */

    if (boxBorder) {

        boxBorder.addEventListener(
            "change",
            () => {

                state.boxBorder =
                    boxBorder.checked;

                showToast(
                    boxBorder.checked
                        ? "Box Border enabled"
                        : "Box Border disabled",
                    boxBorder.checked
                        ? "success"
                        : "warning"
                );

                updatePreview();

            }
        );

    }


    /* ---------------------------------------------
       CUT LINE
    ---------------------------------------------- */

    if (cutLine) {

        cutLine.addEventListener(
            "change",
            () => {

                state.cutLine =
                    cutLine.checked;

                showToast(
                    cutLine.checked
                        ? "Cut Line enabled"
                        : "Cut Line disabled",
                    cutLine.checked
                        ? "success"
                        : "warning"
                );

                updatePreview();

            }
        );

    }


    /* ---------------------------------------------
       PAGE BORDER
    ---------------------------------------------- */

    if (pageBorder) {

        pageBorder.addEventListener(
            "change",
            () => {

                state.pageBorder =
                    pageBorder.checked;

                showToast(
                    pageBorder.checked
                        ? "Page Border enabled"
                        : "Page Border disabled",
                    pageBorder.checked
                        ? "success"
                        : "warning"
                );

                updatePreview();

            }
        );

    }

}


/* =========================================================
   LOCK / UNLOCK ROW
========================================================= */

function lockRow(input) {

    const row =
        input.closest(".check-row");

    if (row) {

        row.classList.add("locked");

    }

}


function unlockRow(input) {

    const row =
        input.closest(".check-row");

    if (row) {

        row.classList.remove("locked");

    }

}


/* =========================================================
   FONT SETTINGS
========================================================= */

function bindFontSettings() {

    bindFontGroup(
        "poFont",
        "poFontSize",
        "poBold",
        "poItalic",
        "poUnderline",
        "po"
    );


    bindFontGroup(
        "boxFont",
        "boxFontSize",
        "boxBold",
        "boxItalic",
        "boxUnderline",
        "box"
    );

}


function bindFontGroup(
    fontId,
    sizeId,
    boldId,
    italicId,
    underlineId,
    type
) {

    const font =
        $(fontId);

    const size =
        $(sizeId);

    const bold =
        $(boldId);

    const italic =
        $(italicId);

    const underline =
        $(underlineId);


    if (font) {

        font.addEventListener(
            "change",
            () => {

                state[
                    `${type}Font`
                ] = font.value;

                updatePreview();

            }
        );

    }


    if (size) {

        size.addEventListener(
            "change",
            () => {

                state[
                    `${type}FontSize`
                ] =
                    Number(size.value);

                updatePreview();

            }
        );

    }


    if (bold) {

        bold.addEventListener(
            "change",
            () => {

                state[
                    `${type}Bold`
                ] =
                    bold.checked;

                updatePreview();

            }
        );

    }


    if (italic) {

        italic.addEventListener(
            "change",
            () => {

                state[
                    `${type}Italic`
                ] =
                    italic.checked;

                updatePreview();

            }
        );

    }


    if (underline) {

        underline.addEventListener(
            "change",
            () => {

                state[
                    `${type}Underline`
                ] =
                    underline.checked;

                updatePreview();

            }
        );

    }

}


/* =========================================================
   EXCEL UPLOAD
========================================================= */

function bindExcelUpload() {

    const excelFile =
        $("excelFile");

    if (!excelFile) return;


    excelFile.addEventListener(
        "change",
        handleExcelUpload
    );

}


function handleExcelUpload(event) {

    const file =
        event.target.files[0];

    if (!file) return;


    if (
        typeof XLSX ===
        "undefined"
    ) {

        showToast(
            "Excel library is not loaded",
            "error"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function(e) {

        try {

            const data =
                new Uint8Array(
                    e.target.result
                );

            const workbook =
                XLSX.read(
                    data,
                    {
                        type: "array"
                    }
                );


            const firstSheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];


            const rows =
                XLSX.utils.sheet_to_json(
                    firstSheet,
                    {
                        header: 1,
                        defval: ""
                    }
                );


            state.excelRows =
                rows;


            const poValues =
                rows
                    .map(row =>
                        row?.[0]
                    )
                    .filter(value =>
                        String(value)
                            .trim()
                            .length > 0
                    )
                    .map(value =>
                        String(value)
                            .trim()
                    );


            state.poNumbers =
                poValues;


            showToast(
                `${poValues.length} PO records loaded`,
                "success"
            );


            updatePreview();

        } catch (error) {

            console.error(error);

            showToast(
                "Could not read Excel file",
                "error"
            );

        }

    };


    reader.onerror =
        () => {

            showToast(
                "Unable to read file",
                "error"
            );

        };


    reader.readAsArrayBuffer(file);

}


/* =========================================================
   MANUAL PO INPUT
========================================================= */

function collectManualPOs() {

    const inputs =
        $$(".po-input");


    return inputs
        .map(input =>
            String(
                input.value || ""
            ).trim()
        )
        .filter(Boolean);

}


/* =========================================================
   MULTIPLE PO
========================================================= */

function collectMultiplePOs() {

    const textarea =
        $("multiplePO");

    if (!textarea) return [];


    return textarea.value
        .split(/[\n,]+/)
        .map(value =>
            value.trim()
        )
        .filter(Boolean);

}


/* =========================================================
   GET ALL PO NUMBERS
========================================================= */

function getAllPOs() {

    const manual =
        collectManualPOs();

    const multiple =
        collectMultiplePOs();


    let excel =
        [];


    if (
        state.activeCocoMode ===
        "cocoExcel"
    ) {

        excel =
            state.poNumbers;

    }


    return [
        ...manual,
        ...multiple,
        ...excel
    ];

}


/* =========================================================
   ADDRESS SETTINGS
========================================================= */

function bindAddressSettings() {

    const pageSize =
        $("addressPageSize");

    const orientation =
        $("addressOrientation");

    const customBox =
        $("addressCustomSize");

    const customWidth =
        $("addressCustomWidth");

    const customHeight =
        $("addressCustomHeight");


    if (pageSize) {

        pageSize.addEventListener(
            "change",
            () => {

                const isCustom =
                    pageSize.value ===
                    "custom";


                if (customBox) {

                    customBox.classList.toggle(
                        "hidden",
                        !isCustom
                    );

                }


                if (customWidth) {

                    customWidth.disabled =
                        !isCustom;

                }


                if (customHeight) {

                    customHeight.disabled =
                        !isCustom;

                }


                showToast(
                    getAddressPageLabel(),
                    "success"
                );

            }
        );

    }


    if (orientation) {

        orientation.addEventListener(
            "change",
            () => {

                showToast(
                    `${capitalize(
                        orientation.value
                    )} mode selected`,
                    "success"
                );

            }
        );

    }


    [customWidth, customHeight]
        .filter(Boolean)
        .forEach(input => {

            input.addEventListener(
                "input",
                () => {

                    updateAddressQR();

                }
            );

        });

}


function getAddressPageLabel() {

    const page =
        $("addressPageSize");

    if (!page) {

        return "Address page selected";

    }


    switch (page.value) {

        case "4x6":
            return "4 × 6 Inches selected";

        case "70x35":
            return "70 × 35 mm selected";

        case "a4":
            return "A4 selected";

        case "custom":
            return "Custom page size selected";

        default:
            return "Page selected";

    }

}


/* =========================================================
   ADDRESS MODE
========================================================= */

function bindAddressModes() {

    $$(
        ".sub-tab[data-address-mode]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                $$(
                    ".sub-tab[data-address-mode]"
                ).forEach(btn =>
                    btn.classList.remove(
                        "active"
                    )
                );

                button.classList.add(
                    "active"
                );


                const mode =
                    button.dataset.addressMode;


                if (mode === "excel") {

                    showToast(
                        "Address Excel Upload selected",
                        "success"
                    );

                } else {

                    showToast(
                        "Address Manual mode selected",
                        "success"
                    );

                }

            }
        );

    });

}


/* =========================================================
   ISBN
========================================================= */

function bindISBN() {

    [
        "isbnInput",
        "bookTitle",
        "edition"
    ]
        .map(id => $(id))
        .filter(Boolean)
        .forEach(input => {

            input.addEventListener(
                "input",
                updateISBNPreview
            );

        });

}


function updateISBNPreview() {

    const preview =
        $("isbnBarcodePreview");

    if (!preview) return;


    const isbn =
        $("isbnInput")?.value
            ?.trim() || "";

    const title =
        $("bookTitle")?.value
            ?.trim() || "";

    const edition =
        $("edition")?.value
            ?.trim() || "";


    preview.innerHTML = "";


    if (!isbn) {

        preview.innerHTML =
            `<div class="preview-empty">
                Enter ISBN to preview barcode
             </div>`;

        return;

    }


    /*
     * Simple CODE128-like visual preview.
     * Actual PDF generation uses the same value.
     */

    const barcode =
        document.createElement(
            "div"
        );

    barcode.style.display =
        "flex";

    barcode.style.alignItems =
        "flex-end";

    barcode.style.height =
        "90px";

    barcode.style.gap =
        "2px";

    barcode.style.padding =
        "8px";


    const source =
        isbn
            .replace(
                /[^0-9A-Za-z]/g,
                ""
            );


    for (
        let i = 0;
        i < Math.min(
            source.length * 5,
            160
        );
        i++
    ) {

        const bar =
            document.createElement(
                "span"
            );

        const charCode =
            source.charCodeAt(
                i % source.length
            );


        bar.style.width =
            `${(charCode % 3) + 1}px`;

        bar.style.height =
            `${45 + (charCode % 45)}px`;

        bar.style.background =
            "#111827";

        barcode.appendChild(
            bar
        );

    }


    preview.appendChild(
        barcode
    );


    const text =
        document.createElement(
            "div"
        );

    text.style.marginTop =
        "8px";

    text.style.textAlign =
        "center";

    text.style.fontWeight =
        "700";

    text.textContent =
        `${isbn}${title ? " — " + title : ""}${edition ? " — " + edition : ""}`;


    preview.appendChild(
        text
    );

}


/* =========================================================
   QR CODE
========================================================= */

function initializeQR() {

    updateAddressQR();

}


function updateAddressQR() {

    const container =
        $("addressQR");

    if (!container) return;


    container.innerHTML = "";


    if (
        typeof QRCode ===
        "undefined"
    ) {

        container.innerHTML =
            `<div class="preview-empty">
                QR library not loaded
             </div>`;

        return;

    }


    new QRCode(
        container,
        {
            text:
                CONFIG.mapUrl,

            width:
                150,

            height:
                150,

            correctLevel:
                QRCode.CorrectLevel.M
        }
    );

}


/* =========================================================
   PREVIEW
========================================================= */

function updatePreview() {

    const preview =
        $("previewArea");

    if (!preview) return;


    const dimensions =
        getPageDimensions();


    const scale =
        calculatePreviewScale(
            dimensions
        );


    const pageWidth =
        dimensions.width *
        scale;


    const pageHeight =
        dimensions.height *
        scale;


    preview.innerHTML = "";


    const page =
        document.createElement(
            "div"
        );


    page.className =
        "preview-page";


    page.style.width =
        `${pageWidth}px`;

    page.style.height =
        `${pageHeight}px`;


    if (
        state.pageBorder
    ) {

        page.style.border =
            "2px solid #111827";

    } else {

        page.style.border =
            "1px solid #d9e1ec";

    }


    const labels =
        buildPreviewLabels();


    if (!labels.length) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "preview-empty";

        empty.textContent =
            "Enter PO number(s) to preview labels.";

        page.appendChild(
            empty
        );

    } else {

        renderPreviewLabel(
            page,
            labels[0]
        );

    }


    preview.appendChild(
        page
    );

}


function calculatePreviewScale(
    dimensions
) {

    const maxWidth =
        480;

    const maxHeight =
        520;


    const scaleX =
        maxWidth /
        dimensions.width;

    const scaleY =
        maxHeight /
        dimensions.height;


    return Math.min(
        scaleX,
        scaleY,
        3
    );

}


/* =========================================================
   BUILD LABELS
========================================================= */

function buildPreviewLabels() {

    const pos =
        getAllPOs();


    if (!pos.length) {

        return [];

    }


    const labels =
        [];


    const start =
        state.startBox;


    const end =
        Math.max(
            start,
            state.endBox
        );


    const repeat =
        Math.max(
            1,
            state.repeatCount
        );


    pos.forEach(po => {

        for (
            let box = start;
            box <= end;
            box++
        ) {

            for (
                let r = 0;
                r < repeat;
                r++
            ) {

                labels.push({

                    po,
                    box

                });

            }

        }

    });


    return labels;

}


/* =========================================================
   RENDER PREVIEW LABEL
========================================================= */

function renderPreviewLabel(
    page,
    label
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "preview-label";


    wrapper.style.width =
        "100%";

    wrapper.style.height =
        "100%";


    if (state.cutLine) {

        wrapper.style.border =
            "2px dashed #9ca3af";

    }


    if (
        state.combinedBorder
    ) {

        wrapper.style.border =
            "3px solid #111827";

    }


    const inner =
        document.createElement(
            "div"
        );


    inner.className =
        "preview-inner";


    const poText =
        document.createElement(
            "div"
        );


    poText.className =
        "preview-po";


    const boxText =
        document.createElement(
            "div"
        );


    boxText.className =
        "preview-box";


    /* ---------------------------------------------
       PO + BOX
    ---------------------------------------------- */

    if (
        state.poPlusBox
    ) {

        poText.textContent =
            `${label.po} — BOX NO. ${label.box}`;


        applyFontStyle(
            poText,
            "po"
        );


        applyCombinedBorder(
            poText
        );


        inner.appendChild(
            poText
        );

    } else {

        /* -----------------------------------------
           PO
        ------------------------------------------ */

        if (state.showPO) {

            poText.textContent =
                label.po;

            applyFontStyle(
                poText,
                "po"
            );


            if (state.poBorder) {

                poText.style.border =
                    "2px solid #111827";

            }


            inner.appendChild(
                poText
            );

        }


        /* -----------------------------------------
           BOX
        ------------------------------------------ */

        if (state.showBox) {

            boxText.textContent =
                `BOX NO. ${label.box}`;

            applyFontStyle(
                boxText,
                "box"
            );


            if (state.boxBorder) {

                boxText.style.border =
                    "2px solid #111827";

            }


            inner.appendChild(
                boxText
            );

        }

    }


    if (
        !inner.children.length
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "preview-empty";

        empty.textContent =
            "Select PO Number or Box Number";

        inner.appendChild(
            empty
        );

    }


    wrapper.appendChild(
        inner
    );


    page.appendChild(
        wrapper
    );

}


/* =========================================================
   FONT STYLE
========================================================= */

function applyFontStyle(
    element,
    type
) {

    const prefix =
        type === "po"
            ? "po"
            : "box";


    element.style.fontFamily =
        state[
            `${prefix}Font`
        ];


    element.style.fontSize =
        `${state[
            `${prefix}FontSize`
        ]}px`;


    element.style.fontWeight =
        state[
            `${prefix}Bold`
        ]
            ? "800"
            : "500";


    element.style.fontStyle =
        state[
            `${prefix}Italic`
        ]
            ? "italic"
            : "normal";


    element.style.textDecoration =
        state[
            `${prefix}Underline`
        ]
            ? "underline"
            : "none";


    element.style.padding =
        "8px 14px";


    element.style.borderRadius =
        "5px";

}


function applyCombinedBorder(
    element
) {

    if (
        state.combinedBorder
    ) {

        element.style.border =
            "3px solid #111827";

    }

}


/* =========================================================
   MAIN BUTTONS
========================================================= */

function bindMainButtons() {

    const generateBtn =
        $("generateBtn");

    const resetBtn =
        $("resetBtn");


    if (generateBtn) {

        generateBtn.addEventListener(
            "click",
            generatePDF
        );

    }


    if (resetBtn) {

        resetBtn.addEventListener(
            "click",
            resetApplication
        );

    }

}


/* =========================================================
   GENERATE PDF
========================================================= */

async function generatePDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        showToast(
            "PDF library is not loaded",
            "error"
        );

        return;

    }


    const pos =
        getAllPOs();


    if (!pos.length) {

        showToast(
            "Please enter at least one PO number",
            "error"
        );

        return;

    }


    const labels =
        buildPreviewLabels();


    if (!labels.length) {

        showToast(
            "No labels available to generate",
            "error"
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPageDimensions();


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const pdf =
        new jsPDF({

            orientation,

            unit: "mm",

            format: [
                dimensions.width,
                dimensions.height
            ],

            compress: true

        });


    const pageWidth =
        dimensions.width;

    const pageHeight =
        dimensions.height;


    /*
     * Half-page layout.
     *
     * Two labels are placed on one page
     * when possible.
     */

    const halfHeight =
        pageHeight / 2;


    labels.forEach(
        (label, index) => {

            if (
                index > 0 &&
                index % 2 === 0
            ) {

                pdf.addPage(
                    [
                        pageWidth,
                        pageHeight
                    ],
                    pageWidth >
                    pageHeight
                        ? "landscape"
                        : "portrait"
                );

            }


            const position =
                index % 2;


            const y =
                position === 0
                    ? 0
                    : halfHeight;


            drawPDFLabel(
                pdf,
                label,
                0,
                y,
                pageWidth,
                halfHeight
            );

        }
    );


    const filename =
        `Books_Label_Studio_${formatDateForFile()}.pdf`;


    pdf.save(
        filename
    );


    state.generatedLabels =
        labels;


    showToast(
        `${labels.length} labels generated successfully`,
        "success"
    );

}


/* =========================================================
   DRAW PDF LABEL
========================================================= */

function drawPDFLabel(
    pdf,
    label,
    x,
    y,
    width,
    height
) {

    /* ---------------------------------------------
       PAGE / CUT BORDER
    ---------------------------------------------- */

    if (
        state.pageBorder ||
        state.cutLine
    ) {

        if (state.cutLine) {

            pdf.setLineDashPattern(
                [2, 2],
                0
            );

        } else {

            pdf.setLineDashPattern(
                [],
                0
            );

        }


        pdf.rect(
            x + 1,
            y + 1,
            width - 2,
            height - 2
        );


        pdf.setLineDashPattern(
            [],
            0
        );

    }


    const centerX =
        x + width / 2;


    let currentY =
        y + height * 0.40;


    /* ---------------------------------------------
       PO + BOX
    ---------------------------------------------- */

    if (
        state.poPlusBox
    ) {

        const text =
            `${label.po} — BOX NO. ${label.box}`;


        setPDFTextStyle(
            pdf,
            "po"
        );


        const textWidth =
            pdf.getTextWidth(
                text
            );


        if (
            state.combinedBorder
        ) {

            pdf.rect(
                centerX -
                    textWidth / 2 -
                    4,

                currentY -
                    state.poFontSize / 4 -
                    4,

                textWidth + 8,

                state.poFontSize / 1.4 +
                    8
            );

        }


        pdf.text(
            text,
            centerX,
            currentY,
            {
                align: "center"
            }
        );


        return;

    }


    /* ---------------------------------------------
       PO NUMBER
    ---------------------------------------------- */

    if (
        state.showPO
    ) {

        setPDFTextStyle(
            pdf,
            "po"
        );


        const poText =
            String(label.po);


        const poWidth =
            pdf.getTextWidth(
                poText
            );


        if (
            state.poBorder
        ) {

            pdf.rect(
                centerX -
                    poWidth / 2 -
                    4,

                currentY -
                    state.poFontSize / 4 -
                    4,

                poWidth + 8,

                state.poFontSize / 1.4 +
                    8
            );

        }


        pdf.text(
            poText,
            centerX,
            currentY,
            {
                align: "center"
            }
        );


        currentY +=
            Math.max(
                14,
                state.poFontSize * 0.7
            );

    }


    /* ---------------------------------------------
       BOX NUMBER
    ---------------------------------------------- */

    if (
        state.showBox
    ) {

        const boxText =
            `BOX NO. ${label.box}`;


        setPDFTextStyle(
            pdf,
            "box"
        );


        const boxWidth =
            pdf.getTextWidth(
                boxText
            );


        if (
            state.boxBorder
        ) {

            pdf.rect(
                centerX -
                    boxWidth / 2 -
                    4,

                currentY -
                    state.boxFontSize / 4 -
                    4,

                boxWidth + 8,

                state.boxFontSize / 1.4 +
                    8
            );

        }


        pdf.text(
            boxText,
            centerX,
            currentY,
            {
                align: "center"
            }
        );

    }

}


/* =========================================================
   PDF FONT STYLE
========================================================= */

function setPDFTextStyle(
    pdf,
    type
) {

    const font =
        type === "po"
            ? state.poFont
            : state.boxFont;


    const size =
        type === "po"
            ? state.poFontSize
            : state.boxFontSize;


    const bold =
        type === "po"
            ? state.poBold
            : state.boxBold;


    const italic =
        type === "po"
            ? state.poItalic
            : state.boxItalic;


    let style = "normal";


    if (
        bold &&
        italic
    ) {

        style = "bolditalic";

    } else if (bold) {

        style = "bold";

    } else if (italic) {

        style = "italic";

    }


    /*
     * jsPDF standard fonts are limited.
     * Map unsupported UI font names to
     * the closest built-in font.
     */

    let pdfFont =
        "helvetica";


    const lower =
        font.toLowerCase();


    if (
        lower.includes(
            "times"
        ) ||
        lower.includes(
            "cambria"
        ) ||
        lower.includes(
            "georgia"
        ) ||
        lower.includes(
            "palatino"
        )
    ) {

        pdfFont =
            "times";

    }


    if (
        lower.includes(
            "courier"
        ) ||
        lower.includes(
            "console"
        )
    ) {

        pdfFont =
            "courier";

    }


    pdf.setFont(
        pdfFont,
        style
    );


    pdf.setFontSize(
        Number(size) || 20
    );

}


/* =========================================================
   RESET
========================================================= */

function resetApplication() {

    /*
     * Text inputs
     */

    $$("input[type='text']")
        .forEach(input => {

            if (
                input.classList.contains(
                    "po-input"
                )
            ) {

                input.value = "";

            }

        });


    if ($("multiplePO")) {

        $("multiplePO").value =
            "";

    }


    if ($("excelFile")) {

        $("excelFile").value =
            "";

    }


    if ($("isbnInput")) {

        $("isbnInput").value =
            "";

    }


    if ($("bookTitle")) {

        $("bookTitle").value =
            "";

    }


    if ($("edition")) {

        $("edition").value =
            "";

    }


    if ($("fromAddress")) {

        $("fromAddress").value =
            "";

    }


    if ($("toAddress")) {

        $("toAddress").value =
            "";

    }


    if ($("cocoFromAddress")) {

        $("cocoFromAddress").value =
            "";

    }


    if ($("cocoToAddress")) {

        $("cocoToAddress").value =
            "";

    }


    /*
     * Numbers
     */

    setValue(
        "startBox",
        1
    );

    setValue(
        "endBox",
        10
    );

    setValue(
        "repeatCount",
        1
    );


    /*
     * Checkboxes
     */

    setChecked(
        "showPO",
        true
    );

    setChecked(
        "showBox",
        true
    );

    setChecked(
        "poPlusBox",
        false
    );

    setChecked(
        "combinedBorder",
        false
    );

    setChecked(
        "poBorder",
        false
    );

    setChecked(
        "boxBorder",
        false
    );

    setChecked(
        "cutLine",
        false
    );

    setChecked(
        "pageBorder",
        false
    );

    setChecked(
        "pageFlowSamePO",
        false
    );


    /*
     * Re-enable locked controls
     */

    [
        "showPO",
        "showBox",
        "poBorder",
        "boxBorder"
    ]
        .forEach(id => {

            const input =
                $(id);

            if (input) {

                input.disabled =
                    false;

                unlockRow(
                    input
                );

            }

        });


    /*
     * Page
     */

    setValue(
        "pageSize",
        "4x6"
    );

    setValue(
        "orientation",
        "portrait"
    );


    setValue(
        "customWidth",
        ""
    );

    setValue(
        "customHeight",
        ""
    );


    /*
     * State
     */

    state.pageSize =
        "4x6";

    state.orientation =
        "portrait";

    state.customWidth =
        null;

    state.customHeight =
        null;

    state.poPlusBox =
        false;

    state.showPO =
        true;

    state.showBox =
        true;

    state.combinedBorder =
        false;

    state.poBorder =
        false;

    state.boxBorder =
        false;

    state.cutLine =
        false;

    state.pageBorder =
        false;

    state.pageFlowSamePO =
        false;

    state.poNumbers =
        [];

    state.excelRows =
        [];


    updateAll();


    showToast(
        "Settings reset successfully",
        "success"
    );

}


/* =========================================================
   MODAL
========================================================= */

function bindModal() {

    const modal =
        $("confirmationModal");

    const close =
        $("closeModal");

    const cancel =
        $("modalCancel");


    if (close) {

        close.addEventListener(
            "click",
            () => {

                closeModal();

            }
        );

    }


    if (cancel) {

        cancel.addEventListener(
            "click",
            () => {

                closeModal();

            }
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeModal();

                }

            }
        );

    }

}


function closeModal() {

    const modal =
        $("confirmationModal");

    if (!modal) return;

    modal.classList.add(
        "hidden"
    );

}


/* =========================================================
   LANGUAGE
========================================================= */

function bindLanguage() {

    const language =
        $("languageSelect");

    if (!language) return;


    language.addEventListener(
        "change",
        () => {

            state.language =
                language.value;

            applyLanguage();

            showToast(
                language.value === "hi"
                    ? "भाषा हिंदी में बदल दी गई"
                    : "Language changed to English",
                "success"
            );

        }
    );

}


function applyLanguage() {

    const lang =
        translations[
            state.language
        ] ||
        translations.en;


    const title =
        document.querySelector(
            ".brand h1"
        );


    const subtitle =
        document.querySelector(
            ".brand p"
        );


    if (title)
        title.textContent =
            lang.title;


    if (subtitle)
        subtitle.textContent =
            lang.subtitle;


    const navButtons =
        $$(".nav-btn");


    if (navButtons[0])
        navButtons[0].textContent =
            lang.coco;


    if (navButtons[1])
        navButtons[1].textContent =
            lang.other;


    if (navButtons[2])
        navButtons[2].textContent =
            lang.isbn;


    if (navButtons[3])
        navButtons[3].textContent =
            lang.address;


    const generate =
        $("generateBtn");


    const reset =
        $("resetBtn");


    if (generate)
        generate.textContent =
            lang.generate;


    if (reset)
        reset.textContent =
            lang.reset;

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer =
    null;


function showToast(
    message,
    type = "success"
) {

    const toast =
        $("toast");

    const messageBox =
        $("toastMessage");


    if (!toast || !messageBox) {

        return;

    }


    clearTimeout(
        toastTimer
    );


    messageBox.textContent =
        message;


    toast.classList.remove(
        "success",
        "error",
        "warning",
        "show"
    );


    toast.classList.add(
        type
    );


    /*
     * No confirmation dialog.
     * Only notification popup.
     */

    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );

        }
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   UPDATE ALL
========================================================= */

function updateAll() {

    updateCustomSizeState();

    updatePageInfo();

    updatePreview();

    updateISBNPreview();

    updateAddressQR();

    applyLanguage();

}


/* =========================================================
   INITIAL DEFAULTS
========================================================= */

function initializeDefaults() {

    if ($("pageSize")) {

        state.pageSize =
            $("pageSize").value ||
            "4x6";

    }


    if ($("orientation")) {

        state.orientation =
            $("orientation").value ||
            "portrait";

    }


    if ($("poFont")) {

        state.poFont =
            $("poFont").value ||
            "Arial";

    }


    if ($("poFontSize")) {

        state.poFontSize =
            Number(
                $("poFontSize").value
            ) || 24;

    }


    if ($("boxFont")) {

        state.boxFont =
            $("boxFont").value ||
            "Arial";

    }


    if ($("boxFontSize")) {

        state.boxFontSize =
            Number(
                $("boxFontSize").value
            ) || 20;

    }


    updateCustomSizeState();

}


/* =========================================================
   HELPERS
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        $(id);

    if (element) {

        element.value =
            value;

    }

}


function setChecked(
    id,
    value
) {

    const element =
        $(id);

    if (element) {

        element.checked =
            value;

    }

}


function capitalize(
    text
) {

    if (!text) return "";

    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );

}


function formatDateForFile() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const hour =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}_${hour}-${minute}`;

}


/* =========================================================
   GLOBAL SAFETY
========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "Books Label Studio error:",
            event.error
        );

    }
);


/* =========================================================
   EXPORT DEBUG STATE
========================================================= */

window.BooksLabelStudio = {

    state,

    generatePDF,

    resetApplication,

    updatePreview,

    showToast

};
