/* =========================================================
   BOOKS LABEL STUDIO
   FINAL JS
========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
========================================================= */

const state = {
    section: "coco",

    cocoBorder: "solid",
    otherBorder: "solid",
    isbnBorder: "solid",
    addressBorder: "solid",

    history: [],
    historyIndex: -1,

    copiedStyle: null,

    libraries: {
        xlsx: false,
        qrcode: false,
        barcode: false,
        jspdf: false
    }
};


/* =========================================================
   HELPERS
========================================================= */

const $ = id => document.getElementById(id);

const $$ = selector =>
    Array.from(document.querySelectorAll(selector));


function safeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "green") {

    const toast = $("toast");

    if (!toast) {
        console.log(message);
        return;
    }

    const text = $("toastText");

    if (text) {
        text.textContent = message;
    }

    toast.className =
        "toast " + type + " show";

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}


/* =========================================================
   DYNAMIC LIBRARY LOADER
   Fixes "PDF library is not loaded"
========================================================= */

function loadScript(url) {

    return new Promise((resolve, reject) => {

        const existing =
            document.querySelector(
                `script[src="${url}"]`
            );

        if (existing) {

            existing.addEventListener(
                "load",
                () => resolve()
            );

            existing.addEventListener(
                "error",
                () =>
                    reject(
                        new Error(
                            "Unable to load " + url
                        )
                    )
            );

            return;
        }


        const script =
            document.createElement("script");

        script.src = url;
        script.async = true;

        script.onload = () => resolve();

        script.onerror = () =>
            reject(
                new Error(
                    "Unable to load " + url
                )
            );

        document.head.appendChild(script);

    });

}


/* =========================================================
   LIBRARY SOURCES
========================================================= */

const LIBRARIES = {

    xlsx: [
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
        "https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js"
    ],

    qrcode: [
        "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js",
        "https://unpkg.com/qrcode@1.5.4/build/qrcode.min.js"
    ],

    barcode: [
        "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js",
        "https://unpkg.com/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"
    ],

    jspdf: [
        "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
        "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js"
    ]
};


/* =========================================================
   CHECK LIBRARY
========================================================= */

function isLibraryReady(name) {

    switch (name) {

        case "xlsx":
            return (
                typeof window.XLSX !== "undefined"
            );

        case "qrcode":
            return (
                typeof window.QRCode !== "undefined"
            );

        case "barcode":
            return (
                typeof window.JsBarcode !== "undefined"
            );

        case "jspdf":
            return (
                typeof window.jspdf !== "undefined" &&
                typeof window.jspdf.jsPDF === "function"
            ) ||
            typeof window.jsPDF === "function";

        default:
            return false;
    }
}


/* =========================================================
   LOAD LIBRARY WITH FALLBACK
========================================================= */

async function ensureLibrary(name) {

    if (isLibraryReady(name)) {

        state.libraries[name] = true;
        return true;
    }


    const sources =
        LIBRARIES[name] || [];


    for (const url of sources) {

        try {

            await loadScript(url);

            if (isLibraryReady(name)) {

                state.libraries[name] = true;
                return true;
            }

        } catch (error) {

            console.warn(
                "Library load failed:",
                url
            );

        }

    }


    state.libraries[name] = false;

    return false;
}


/* =========================================================
   INITIAL LIBRARY CHECK
========================================================= */

async function initializeLibraries() {

    await Promise.allSettled([

        ensureLibrary("xlsx"),

        ensureLibrary("qrcode"),

        ensureLibrary("barcode"),

        ensureLibrary("jspdf")

    ]);

}


initializeLibraries();


/* =========================================================
   MAIN TABS
========================================================= */

$$(".tab").forEach(tab => {

    tab.addEventListener("click", () => {

        const section =
            tab.dataset.section;

        if (!section) return;

        state.section =
            section;


        $$(".tab").forEach(item => {

            item.classList.toggle(
                "active",
                item === tab
            );

        });


        $$(".section").forEach(sectionEl => {

            sectionEl.classList.toggle(
                "active",
                sectionEl.id ===
                "section-" + section
            );

        });

        saveHistory();

    });

});


/* =========================================================
   COCO SUB TABS
========================================================= */

$$("[data-mode]").forEach(button => {

    button.addEventListener("click", () => {

        const mode =
            button.dataset.mode;

        $$(".sub-tab").forEach(item => {

            item.classList.toggle(
                "active",
                item === button
            );

        });


        $$(".mode").forEach(panel => {

            panel.classList.toggle(
                "active",
                panel.id ===
                "mode-" + mode
            );

        });

        livePreview();

    });

});


/* =========================================================
   CREATE PO INPUTS
========================================================= */

function createPOInputs() {

    const container =
        $("cocoPOGrid");

    if (!container) return;

    container.innerHTML = "";


    for (let i = 1; i <= 20; i++) {

        const input =
            document.createElement("input");

        input.type = "text";

        input.placeholder =
            "PO " + i;

        input.autocomplete = "off";

        input.addEventListener(
            "input",
            () => {
                livePreview();
            }
        );

        container.appendChild(input);
    }
}


/* =========================================================
   GET PO VALUE
========================================================= */

function getPO() {

    const grid =
        $("cocoPOGrid");

    if (grid) {

        const inputs =
            grid.querySelectorAll("input");

        for (const input of inputs) {

            const value =
                input.value.trim();

            if (value) {
                return value;
            }
        }
    }


    const multiple =
        $("cocoMultiplePO");

    if (
        multiple &&
        multiple.value.trim()
    ) {

        const values =
            multiple.value
                .split(/\r?\n/)
                .map(v => v.trim())
                .filter(Boolean);

        if (values.length) {
            return values[0];
        }
    }


    return "ABC123";
}


/* =========================================================
   GET ALL PO VALUES
========================================================= */

function getAllPOs() {

    const values = [];

    const grid =
        $("cocoPOGrid");

    if (grid) {

        grid.querySelectorAll("input")
            .forEach(input => {

                const value =
                    input.value.trim();

                if (value) {
                    values.push(value);
                }

            });

    }


    const multiple =
        $("cocoMultiplePO");

    if (
        !values.length &&
        multiple &&
        multiple.value.trim()
    ) {

        multiple.value
            .split(/\r?\n/)
            .map(v => v.trim())
            .filter(Boolean)
            .forEach(v => values.push(v));

    }


    if (!values.length) {
        values.push("ABC123");
    }


    return values;
}


/* =========================================================
   LIVE PO / BOX PREVIEW
========================================================= */

function livePreview() {

    const previewPO =
        $("previewPO");

    const previewBox =
        $("previewBox");

    if (!previewPO || !previewBox) {
        return;
    }


    const po =
        getPO();


    /* -----------------------------------------
       PO
    ----------------------------------------- */

    const showPO =
        $("showPO")
            ? $("showPO").checked
            : true;


    previewPO.style.display =
        showPO ? "block" : "none";


    if (showPO) {

        /*
           IMPORTANT:
           Only actual PO value is shown.
           "PO NUMBER" is NOT added.
        */

        previewPO.textContent =
            po;
    }


    /* -----------------------------------------
       BOX
    ----------------------------------------- */

    const showBox =
        $("showBox")
            ? $("showBox").checked
            : true;


    previewBox.style.display =
        showBox ? "block" : "none";


    if (showBox) {

        const box =
            Math.max(
                1,
                safeNumber(
                    $("startBox")
                        ? $("startBox").value
                        : 1,
                    1
                )
            );


        /*
           BOX NUMBER is shown below PO.
        */

        previewBox.textContent =
            "BOX NO. " + box;
    }


    /* -----------------------------------------
       PO FONT
    ----------------------------------------- */

    if ($("poFont")) {

        previewPO.style.fontFamily =
            $("poFont").value;
    }


    if ($("poFontSize")) {

        previewPO.style.fontSize =
            safeNumber(
                $("poFontSize").value,
                26
            ) + "px";
    }


    if ($("poAlign")) {

        previewPO.style.textAlign =
            $("poAlign").value;
    }


    previewPO.style.fontWeight =
        $("poBold") &&
        $("poBold").checked
            ? "bold"
            : "normal";


    previewPO.style.fontStyle =
        $("poItalic") &&
        $("poItalic").checked
            ? "italic"
            : "normal";


    previewPO.style.textDecoration =
        $("poUnderline") &&
        $("poUnderline").checked
            ? "underline"
            : "none";


    /* -----------------------------------------
       BOX FONT
    ----------------------------------------- */

    if ($("boxFont")) {

        previewBox.style.fontFamily =
            $("boxFont").value;
    }


    if ($("boxFontSize")) {

        previewBox.style.fontSize =
            safeNumber(
                $("boxFontSize").value,
                20
            ) + "px";
    }


    previewBox.style.fontWeight =
        $("boxBold") &&
        $("boxBold").checked
            ? "bold"
            : "normal";


    previewBox.style.fontStyle =
        $("boxItalic") &&
        $("boxItalic").checked
            ? "italic"
            : "normal";


    applyCocoBorder();

    updatePagePreview();

    updateAllPreview();

}


/* =========================================================
   BORDER STYLE
========================================================= */

function getCSSBorderStyle(style) {

    switch (style) {

        case "double":
        case "double-thin":
        case "double-thick":
            return "double";

        case "groove":
            return "groove";

        case "ridge":
            return "ridge";

        case "inset":
            return "inset";

        case "outset":
            return "outset";

        case "dashed":
            return "dashed";

        case "dotted":
            return "dotted";

        default:
            return "solid";
    }
}


/* =========================================================
   BORDER COLOR
========================================================= */

function getBorderColor(style) {

    switch (style) {

        case "blue":
            return "#2563eb";

        case "red":
            return "#dc2626";

        case "green":
            return "#16a34a";

        case "gray":
            return "#64748b";

        default:
            return (
                $("borderColor")
                    ? $("borderColor").value
                    : "#222222"
            );
    }
}


/* =========================================================
   APPLY COCO BORDER
========================================================= */

function applyCocoBorder() {

    const label =
        $("labelPreview");

    if (!label) return;


    const style =
        state.cocoBorder || "solid";


    const width =
        Math.max(
            0,
            safeNumber(
                $("borderWidth")
                    ? $("borderWidth").value
                    : 2,
                2
            )
        );


    const radius =
        Math.max(
            0,
            safeNumber(
                $("borderRadius")
                    ? $("borderRadius").value
                    : 0,
                0
            )
        );


    const borderStyle =
        getCSSBorderStyle(style);


    const color =
        getBorderColor(style);


    label.style.borderWidth =
        width + "px";

    label.style.borderColor =
        color;

    label.style.borderRadius =
        radius + "px";


    label.style.borderTopStyle =
        $("borderTop") &&
        !$("borderTop").checked
            ? "none"
            : borderStyle;


    label.style.borderRightStyle =
        $("borderRight") &&
        !$("borderRight").checked
            ? "none"
            : borderStyle;


    label.style.borderBottomStyle =
        $("borderBottom") &&
        !$("borderBottom").checked
            ? "none"
            : borderStyle;


    label.style.borderLeftStyle =
        $("borderLeft") &&
        !$("borderLeft").checked
            ? "none"
            : borderStyle;


    if (
        style === "shadow" ||
        style === "shadow-soft"
    ) {

        label.style.boxShadow =
            "5px 5px 0 #aaa";

    } else {

        label.style.boxShadow =
            "none";
    }

}


/* =========================================================
   BORDER BUTTONS
========================================================= */

$$("[data-border]").forEach(button => {

    button.addEventListener("click", () => {

        state.cocoBorder =
            button.dataset.border;


        $$("#section-coco .border-option")
            .forEach(item => {

                item.classList.toggle(
                    "active",
                    item === button
                );

            });


        applyCocoBorder();

        saveHistory();

        showToast(
            "Border style applied",
            "green"
        );

    });

});


/* =========================================================
   OTHER PO BORDER
========================================================= */

$$("[data-other-border]").forEach(button => {

    button.addEventListener("click", () => {

        state.otherBorder =
            button.dataset.otherBorder;


        $$("#section-other .border-option")
            .forEach(item => {

                item.classList.toggle(
                    "active",
                    item === button
                );

            });


        applyOtherBorder();

        saveHistory();

        showToast(
            "Other PO border changed",
            "green"
        );

    });

});


function applyOtherBorder() {

    const element =
        $("otherPreview");

    if (!element) return;

    const style =
        state.otherBorder || "solid";

    element.style.borderStyle =
        getCSSBorderStyle(style);


    element.style.borderColor =
        getBorderColor(style);


    if (style === "shadow") {

        element.style.boxShadow =
            "5px 5px 0 #aaa";

    } else {

        element.style.boxShadow =
            "none";
    }

}


/* =========================================================
   ISBN BORDER
========================================================= */

$$("[data-isbn-border]").forEach(button => {

    button.addEventListener("click", () => {

        state.isbnBorder =
            button.dataset.isbnBorder;


        $$("#section-isbn .border-option")
            .forEach(item => {

                item.classList.toggle(
                    "active",
                    item === button
                );

            });


        applyISBNBorder();

        saveHistory();

        showToast(
            "ISBN border changed",
            "green"
        );

    });

});


function applyISBNBorder() {

    const element =
        $("isbnPreview");

    if (!element) return;

    const style =
        state.isbnBorder || "solid";

    element.style.borderStyle =
        getCSSBorderStyle(style);

    element.style.borderColor =
        getBorderColor(style);


    if (style === "shadow") {

        element.style.boxShadow =
            "5px 5px 0 #aaa";

    } else {

        element.style.boxShadow =
            "none";
    }

}


/* =========================================================
   ADDRESS BORDER
========================================================= */

$$("[data-address-border]").forEach(button => {

    button.addEventListener("click", () => {

        state.addressBorder =
            button.dataset.addressBorder;


        $$("#section-address .border-option")
            .forEach(item => {

                item.classList.toggle(
                    "active",
                    item === button
                );

            });


        applyAddressBorder();

        saveHistory();

        showToast(
            "Address border changed",
            "green"
        );

    });

});


function applyAddressBorder() {

    const element =
        $("addressPreview");

    if (!element) return;

    const style =
        state.addressBorder || "solid";

    element.style.borderStyle =
        getCSSBorderStyle(style);

    element.style.borderColor =
        getBorderColor(style);


    if (style === "shadow") {

        element.style.boxShadow =
            "5px 5px 0 #aaa";

    } else {

        element.style.boxShadow =
            "none";
    }

}


/* =========================================================
   FONT SIZE SELECT + MANUAL INPUT
========================================================= */

function connectFontSize(
    selectId,
    inputId
) {

    const select =
        $(selectId);

    const input =
        $(inputId);

    if (!select || !input) {
        return;
    }


    select.addEventListener(
        "change",
        () => {

            if (select.value) {

                input.value =
                    select.value;
            }

            livePreview();

            saveHistory();

        }
    );


    input.addEventListener(
        "input",
        () => {

            livePreview();

        }
    );


    input.addEventListener(
        "change",
        saveHistory
    );

}


connectFontSize(
    "poFontPreset",
    "poFontSize"
);

connectFontSize(
    "boxFontPreset",
    "boxFontSize"
);

connectFontSize(
    "otherFontPreset",
    "otherFontSize"
);

connectFontSize(
    "isbnFontPreset",
    "isbnFontSize"
);

connectFontSize(
    "addressFontPreset",
    "addressFontSize"
);


/* =========================================================
   GENERIC LIVE INPUT
========================================================= */

$$(
    "input:not([type=file]), select, textarea"
).forEach(element => {

    element.addEventListener(
        "input",
        () => {

            livePreview();
            updateAllPreview();

        }
    );


    element.addEventListener(
        "change",
        () => {

            livePreview();
            updateAllPreview();

            saveHistory();

        }
    );

});


/* =========================================================
   PAGE PREVIEW
========================================================= */

function updatePagePreview() {

    const page =
        $("previewPage");

    const label =
        $("labelPreview");

    if (!page || !label) {
        return;
    }


    const size =
        $("pageSize")
            ? $("pageSize").value
            : "4x6";


    const orientation =
        $("orientation")
            ? $("orientation").value
            : "portrait";


    let width = 380;
    let height = 540;


    switch (size) {

        case "a4":
            width = 420;
            height = 594;
            break;

        case "a5":
            width = 350;
            height = 495;
            break;

        case "letter":
            width = 420;
            height = 545;
            break;

        case "4x6":
            width = 380;
            height = 540;
            break;

        case "custom":
            width = 380;
            height = 540;
            break;
    }


    if (orientation === "landscape") {

        [width, height] =
            [height, width];

    }


    page.style.width =
        width + "px";

    page.style.minHeight =
        height + "px";


    const labels =
        safeNumber(
            $("labelsPerPage")
                ? $("labelsPerPage").value
                : 1,
            1
        );


    /*
       LIVE MULTI-LABEL PREVIEW
    */

    if (labels <= 1) {

        page.style.display =
            "flex";

        page.style.gridTemplateColumns =
            "";

        page.style.gridTemplateRows =
            "";

        page.style.gap =
            "";

        label.style.width =
            "90%";

        return;
    }


    page.style.display =
        "grid";


    let columns = 1;

    if (labels === 2) {
        columns = 1;
    } else if (labels <= 6) {
        columns = 2;
    } else {
        columns = 3;
    }


    page.style.gridTemplateColumns =
        `repeat(${columns}, minmax(0, 1fr))`;


    page.style.gap =
        "7px";


    label.style.width =
        "100%";

}


/* =========================================================
   EXCEL UPLOAD
   First row = HEADER and ignored
========================================================= */

const excelInput =
    $("cocoExcel");


if (excelInput) {

    excelInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];

            if (!file) return;


            const ready =
                await ensureLibrary("xlsx");


            if (!ready) {

                showToast(
                    "Excel library could not be loaded",
                    "red"
                );

                return;
            }


            try {

                const data =
                    await file.arrayBuffer();


                const workbook =
                    XLSX.read(
                        data,
                        {
                            type: "array"
                        }
                    );


                const sheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];


                const rows =
                    XLSX.utils.sheet_to_json(
                        sheet,
                        {
                            header: 1,
                            defval: ""
                        }
                    );


                if (!rows.length) {

                    showToast(
                        "Excel file is empty",
                        "red"
                    );

                    return;
                }


                /*
                   FIRST ROW IS HEADER
                   DO NOT USE IT AS DATA
                */

                const dataRows =
                    rows.slice(1);


                const grid =
                    $("cocoPOGrid");

                if (grid) {

                    const inputs =
                        grid.querySelectorAll(
                            "input"
                        );


                    inputs.forEach(
                        (input, index) => {

                            input.value =
                                dataRows[index] &&
                                dataRows[index][0] !==
                                undefined
                                    ? dataRows[index][0]
                                    : "";

                        }
                    );

                }


                renderExcel(rows);

                livePreview();

                saveHistory();


                showToast(
                    "Excel loaded — first row treated as header and ignored",
                    "green"
                );


            } catch (error) {

                console.error(error);

                showToast(
                    "Excel file could not be read",
                    "red"
                );

            }

        }
    );

}


/* =========================================================
   EXCEL TABLE PREVIEW
========================================================= */

function renderExcel(rows) {

    const container =
        $("cocoExcelPreview");

    if (!container) return;


    if (!rows || !rows.length) {

        container.innerHTML = "";
        return;
    }


    let html =
        "<table>" +
        "<thead><tr>";


    /*
       HEADER DISPLAY ONLY
       DATA STARTS FROM ROW 2
    */

    rows[0].forEach(cell => {

        html +=
            "<th>" +
            escapeHTML(cell) +
            "</th>";

    });


    html +=
        "</tr></thead><tbody>";


    rows
        .slice(1, 101)
        .forEach(row => {

            html += "<tr>";


            rows[0].forEach(
                (_, index) => {

                    html +=
                        "<td>" +
                        escapeHTML(
                            row[index] ?? ""
                        ) +
                        "</td>";

                }
            );


            html += "</tr>";

        });


    html +=
        "</tbody></table>";


    container.innerHTML =
        html;

}


/* =========================================================
   QR GENERATOR
========================================================= */

async function makeQR(
    container,
    text
) {

    if (!container) return false;


    const value =
        String(text || "").trim();


    if (!value) {

        showToast(
            "QR data is empty",
            "red"
        );

        return false;
    }


    const ready =
        await ensureLibrary("qrcode");


    if (!ready) {

        showToast(
            "QR library could not be loaded",
            "red"
        );

        return false;
    }


    container.innerHTML = "";


    try {

        const canvas =
            document.createElement("canvas");


        container.appendChild(
            canvas
        );


        await QRCode.toCanvas(
            canvas,
            value,
            {
                width: 150,
                margin: 2
            }
        );


        return true;


    } catch (error) {

        console.error(error);

        showToast(
            "QR generation failed",
            "red"
        );

        return false;
    }

}


/* =========================================================
   ADDRESS QR
========================================================= */

const addressQRButton =
    $("addressQRBtn");


if (addressQRButton) {

    addressQRButton.addEventListener(
        "click",
        async () => {

            const from =
                $("fromAddress")
                    ? $("fromAddress").value.trim()
                    : "";

            const to =
                $("toAddress")
                    ? $("toAddress").value.trim()
                    : "";


            const address =
                [
                    from,
                    to
                ]
                .filter(Boolean)
                .join("\n");


            const success =
                await makeQR(
                    $("addressQR"),
                    address
                );


            if (success) {

                showToast(
                    "Address QR generated",
                    "green"
                );

            }

        }
    );

}


/* =========================================================
   EMAIL QR
========================================================= */

const emailQRButton =
    $("emailQRBtn");


if (emailQRButton) {

    emailQRButton.addEventListener(
        "click",
        async () => {

            const email =
                $("email")
                    ? $("email").value.trim()
                    : "";


            if (!email) {

                showToast(
                    "Enter email address first",
                    "red"
                );

                return;
            }


            const success =
                await makeQR(
                    $("emailQR"),
                    "mailto:" + email
                );


            if (success) {

                showToast(
                    "Email QR generated",
                    "green"
                );

            }

        }
    );

}


/* =========================================================
   ISBN UPDATE
========================================================= */

async function updateISBN() {

    const isbn =
        $("isbn")
            ? $("isbn").value.trim()
            : "";


    const title =
        $("bookTitle")
            ? $("bookTitle").value.trim()
            : "";


    if ($("isbnPreviewTitle")) {

        $("isbnPreviewTitle")
            .textContent =
            title || "Book Title";

    }


    if ($("isbnPreviewNumber")) {

        $("isbnPreviewNumber")
            .textContent =
            isbn || "ISBN";

    }


    if (!isbn) {

        const barcode =
            $("barcode");

        if (barcode) {
            barcode.innerHTML = "";
        }

        return;
    }


    const ready =
        await ensureLibrary("barcode");


    if (!ready) {

        return;
    }


    try {

        JsBarcode(
            "#barcode",
            isbn,
            {
                format: "auto",
                width: 1.5,
                height: 55,
                displayValue: true,
                margin: 5
            }
        );

    } catch (error) {

        console.error(error);

        const barcode =
            $("barcode");

        if (barcode) {
            barcode.innerHTML = "";
        }

    }

}


/* =========================================================
   ADDRESS LIVE PREVIEW
========================================================= */

function updateAddressPreview() {

    const from =
        $("fromAddress")
            ? $("fromAddress").value
            : "";

    const to =
        $("toAddress")
            ? $("toAddress").value
            : "";


    if ($("previewFrom")) {

        $("previewFrom")
            .textContent =
            from || "FROM ADDRESS";

    }


    if ($("previewTo")) {

        $("previewTo")
            .textContent =
            to || "TO ADDRESS";

    }


    const preview =
        $("addressPreview");

    if (!preview) return;


    if ($("addressFont")) {

        preview.style.fontFamily =
            $("addressFont").value;
    }


    if ($("addressFontSize")) {

        preview.style.fontSize =
            safeNumber(
                $("addressFontSize").value,
                14
            ) + "px";
    }

}


/* =========================================================
   OTHER PO PREVIEW
========================================================= */

function updateOtherPreview() {

    const preview =
        $("otherPreview");

    if (!preview) return;


    const values =
        $("otherPO")
            ? $("otherPO").value
                .split(/\r?\n/)
                .map(v => v.trim())
                .filter(Boolean)
            : [];


    preview.textContent =
        values[0] || "ABC123";


    if ($("otherFont")) {

        preview.style.fontFamily =
            $("otherFont").value;
    }


    if ($("otherFontSize")) {

        preview.style.fontSize =
            safeNumber(
                $("otherFontSize").value,
                20
            ) + "px";
    }


    applyOtherBorder();

}


/* =========================================================
   UPDATE EVERYTHING
========================================================= */

function updateAllPreview() {

    updateAddressPreview();

    updateOtherPreview();

    applyISBNBorder();

    applyAddressBorder();

    updateISBN();

}


/* =========================================================
   ENABLE / DISABLE POPUP
========================================================= */

$$(
    'input[type="checkbox"]'
).forEach(checkbox => {

    checkbox.addEventListener(
        "change",
        () => {

            const parent =
                checkbox.parentElement;


            const label =
                parent
                    ? parent.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                    : "Feature";


            if (checkbox.checked) {

                showToast(
                    label + " Enabled",
                    "green"
                );

            } else {

                showToast(
                    label + " Disabled",
                    "red"
                );

            }


            livePreview();

            saveHistory();

        }
    );

});


/* =========================================================
   PAGE SETTINGS
========================================================= */

if ($("pageSize")) {

    $("pageSize")
        .addEventListener(
            "change",
            () => {

                updatePagePreview();

                showToast(
                    "Page size updated",
                    "green"
                );

                saveHistory();

            }
        );

}


if ($("orientation")) {

    $("orientation")
        .addEventListener(
            "change",
            () => {

                updatePagePreview();

                saveHistory();

            }
        );

}


if ($("labelsPerPage")) {

    $("labelsPerPage")
        .addEventListener(
            "change",
            () => {

                updatePagePreview();

                showToast(
                    $("labelsPerPage").value +
                    " labels per page",
                    "green"
                );

                saveHistory();

            }
        );

}


/* =========================================================
   SNAPSHOT
========================================================= */

function snapshot() {

    const data = {};

    $$(
        "input, select, textarea"
    ).forEach(element => {

        if (
            !element.id ||
            element.type === "file"
        ) {
            return;
        }


        data[element.id] =
            element.type === "checkbox"
                ? element.checked
                : element.value;

    });


    data._state =
        JSON.stringify({
            section:
                state.section,

            cocoBorder:
                state.cocoBorder,

            otherBorder:
                state.otherBorder,

            isbnBorder:
                state.isbnBorder,

            addressBorder:
                state.addressBorder
        });


    return data;
}


/* =========================================================
   RESTORE SNAPSHOT
========================================================= */

function restore(data) {

    if (!data) return;


    Object.keys(data).forEach(id => {

        if (id === "_state") {
            return;
        }


        const element =
            $(id);

        if (!element) {
            return;
        }


        if (
            element.type === "checkbox"
        ) {

            element.checked =
                Boolean(data[id]);

        } else {

            element.value =
                data[id];

        }

    });


    if (data._state) {

        try {

            const savedState =
                JSON.parse(
                    data._state
                );


            state.section =
                savedState.section ||
                "coco";

            state.cocoBorder =
                savedState.cocoBorder ||
                "solid";

            state.otherBorder =
                savedState.otherBorder ||
                "solid";

            state.isbnBorder =
                savedState.isbnBorder ||
                "solid";

            state.addressBorder =
                savedState.addressBorder ||
                "solid";

        } catch (error) {

            console.warn(
                "State restore failed"
            );

        }

    }


    refreshTabs();

    refreshBorderButtons();

    livePreview();

    updateAllPreview();

}


/* =========================================================
   REFRESH TABS
========================================================= */

function refreshTabs() {

    $$(".tab").forEach(tab => {

        tab.classList.toggle(
            "active",
            tab.dataset.section ===
            state.section
        );

    });


    $$(".section").forEach(section => {

        section.classList.toggle(
            "active",
            section.id ===
            "section-" +
            state.section
        );

    });

}


/* =========================================================
   REFRESH BORDER BUTTONS
========================================================= */

function refreshBorderButtons() {

    $$(".border-option").forEach(button => {

        const coco =
            button.dataset.border;

        const other =
            button.dataset.otherBorder;

        const isbn =
            button.dataset.isbnBorder;

        const address =
            button.dataset.addressBorder;


        let active = false;


        if (
            coco &&
            coco === state.cocoBorder
        ) {
            active = true;
        }


        if (
            other &&
            other === state.otherBorder
        ) {
            active = true;
        }


        if (
            isbn &&
            isbn === state.isbnBorder
        ) {
            active = true;
        }


        if (
            address &&
            address === state.addressBorder
        ) {
            active = true;
        }


        button.classList.toggle(
            "active",
            active
        );

    });

}


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory() {

    const current =
        snapshot();


    const last =
        state.history[
            state.historyIndex
        ];


    if (
        last &&
        JSON.stringify(last) ===
        JSON.stringify(current)
    ) {
        return;
    }


    state.history =
        state.history.slice(
            0,
            state.historyIndex + 1
        );


    state.history.push(
        current
    );


    if (
        state.history.length > 50
    ) {

        state.history.shift();

    }


    state.historyIndex =
        state.history.length - 1;

}


/* =========================================================
   UNDO
========================================================= */

if ($("undoBtn")) {

    $("undoBtn")
        .addEventListener(
            "click",
            () => {

                if (
                    state.historyIndex <= 0
                ) {

                    showToast(
                        "Nothing to undo",
                        "orange"
                    );

                    return;
                }


                state.historyIndex--;


                restore(
                    state.history[
                        state.historyIndex
                    ]
                );


                showToast(
                    "Undo",
                    "green"
                );

            }
        );

}


/* =========================================================
   REDO
========================================================= */

if ($("redoBtn")) {

    $("redoBtn")
        .addEventListener(
            "click",
            () => {

                if (
                    state.historyIndex >=
                    state.history.length - 1
                ) {

                    showToast(
                        "Nothing to redo",
                        "orange"
                    );

                    return;
                }


                state.historyIndex++;


                restore(
                    state.history[
                        state.historyIndex
                    ]
                );


                showToast(
                    "Redo",
                    "green"
                );

            }
        );

}


/* =========================================================
   COPY STYLE
========================================================= */

if ($("copyStyleBtn")) {

    $("copyStyleBtn")
        .addEventListener(
            "click",
            () => {

                state.copiedStyle = {

                    poFont:
                        $("poFont")
                            ? $("poFont").value
                            : "Arial",

                    poFontSize:
                        $("poFontSize")
                            ? $("poFontSize").value
                            : 26,

                    boxFont:
                        $("boxFont")
                            ? $("boxFont").value
                            : "Arial",

                    boxFontSize:
                        $("boxFontSize")
                            ? $("boxFontSize").value
                            : 20,

                    border:
                        state.cocoBorder,

                    borderWidth:
                        $("borderWidth")
                            ? $("borderWidth").value
                            : 2,

                    borderColor:
                        $("borderColor")
                            ? $("borderColor").value
                            : "#222222",

                    borderRadius:
                        $("borderRadius")
                            ? $("borderRadius").value
                            : 0

                };


                showToast(
                    "Style copied",
                    "green"
                );

            }
        );

}


/* =========================================================
   PASTE STYLE
========================================================= */

if ($("pasteStyleBtn")) {

    $("pasteStyleBtn")
        .addEventListener(
            "click",
            () => {

                const style =
                    state.copiedStyle;


                if (!style) {

                    showToast(
                        "No copied style available",
                        "orange"
                    );

                    return;
                }


                if ($("poFont"))
                    $("poFont").value =
                        style.poFont;


                if ($("poFontSize"))
                    $("poFontSize").value =
                        style.poFontSize;


                if ($("boxFont"))
                    $("boxFont").value =
                        style.boxFont;


                if ($("boxFontSize"))
                    $("boxFontSize").value =
                        style.boxFontSize;


                if ($("borderWidth"))
                    $("borderWidth").value =
                        style.borderWidth;


                if ($("borderColor"))
                    $("borderColor").value =
                        style.borderColor;


                if ($("borderRadius"))
                    $("borderRadius").value =
                        style.borderRadius;


                state.cocoBorder =
                    style.border;


                livePreview();

                saveHistory();


                showToast(
                    "Style pasted",
                    "green"
                );

            }
        );

}


/* =========================================================
   DEFAULT SAVE
========================================================= */

if ($("saveDefaultBtn")) {

    $("saveDefaultBtn")
        .addEventListener(
            "click",
            () => {

                const data =
                    snapshot();


                localStorage.setItem(
                    "BooksLabelStudioDefault",
                    JSON.stringify(data)
                );


                showToast(
                    "Default settings saved",
                    "green"
                );

            }
        );

}


/* =========================================================
   RESET
========================================================= */

if ($("resetBtn")) {

    $("resetBtn")
        .addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Reset all settings to default?"
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "BooksLabelStudioDefault"
                );


                location.reload();

            }
        );

}


/* =========================================================
   KEYBOARD UNDO / REDO
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "z"
        ) {

            event.preventDefault();

            if ($("undoBtn")) {
                $("undoBtn").click();
            }

        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "y"
        ) {

            event.preventDefault();

            if ($("redoBtn")) {
                $("redoBtn").click();
            }

        }

    }
);


/* =========================================================
   GET jsPDF
========================================================= */

function getJsPDF() {

    if (
        window.jspdf &&
        typeof window.jspdf.jsPDF ===
        "function"
    ) {

        return window.jspdf.jsPDF;

    }


    if (
        typeof window.jsPDF ===
        "function"
    ) {

        return window.jsPDF;

    }


    return null;
}


/* =========================================================
   ENSURE PDF LIBRARY
========================================================= */

async function ensurePDFLibrary() {

    let jsPDF =
        getJsPDF();


    if (jsPDF) {
        return jsPDF;
    }


    showToast(
        "Loading PDF library...",
        "orange"
    );


    const loaded =
        await ensureLibrary("jspdf");


    if (!loaded) {

        showToast(
            "PDF library could not be loaded. Check internet connection.",
            "red"
        );

        return null;
    }


    jsPDF =
        getJsPDF();


    if (!jsPDF) {

        showToast(
            "PDF library loaded incorrectly. Reload the page.",
            "red"
        );

        return null;
    }


    return jsPDF;
}


/* =========================================================
   PAGE SIZE FOR PDF
========================================================= */

function getPDFPageSize() {

    const size =
        $("pageSize")
            ? $("pageSize").value
            : "4x6";


    switch (size) {

        case "4x6":
            return [101.6, 152.4];

        case "a5":
            return [148, 210];

        case "letter":
            return [215.9, 279.4];

        case "a4":
        default:
            return [210, 297];

    }

}


/* =========================================================
   APPLY ORIENTATION
========================================================= */

function getPDFDimensions() {

    let [width, height] =
        getPDFPageSize();


    const orientation =
        $("orientation")
            ? $("orientation").value
            : "portrait";


    if (
        orientation === "landscape"
    ) {

        [width, height] =
            [height, width];

    }


    return {
        width,
        height
    };

}


/* =========================================================
   COLOR TO RGB
========================================================= */

function hexToRGB(hex) {

    const clean =
        String(hex || "#222222")
            .replace("#", "");


    if (clean.length !== 6) {

        return {
            r: 34,
            g: 34,
            b: 34
        };

    }


    return {

        r: parseInt(
            clean.substring(0, 2),
            16
        ),

        g: parseInt(
            clean.substring(2, 4),
            16
        ),

        b: parseInt(
            clean.substring(4, 6),
            16
        )

    };

}


/* =========================================================
   PDF BORDER
========================================================= */

function drawPDFBorder(
    doc,
    x,
    y,
    width,
    height,
    style = "solid"
) {

    const color =
        getBorderColor(style);


    const rgb =
        hexToRGB(color);


    doc.setDrawColor(
        rgb.r,
        rgb.g,
        rgb.b
    );


    let lineWidth =
        safeNumber(
            $("borderWidth")
                ? $("borderWidth").value
                : 2,
            2
        );


    /*
       PDF mm line width is much smaller
       than CSS px.
    */

    lineWidth =
        Math.max(
            .2,
            Math.min(
                3,
                lineWidth / 2
            )
        );


    doc.setLineWidth(
        lineWidth
    );


    if (
        style === "dashed"
    ) {

        doc.setLineDashPattern(
            [3, 2],
            0
        );

    } else if (
        style === "dotted"
    ) {

        doc.setLineDashPattern(
            [1, 2],
            0
        );

    } else {

        doc.setLineDashPattern(
            [],
            0
        );

    }


    doc.rect(
        x,
        y,
        width,
        height
    );


    if (
        style === "double" ||
        style === "double-thin" ||
        style === "double-thick"
    ) {

        doc.rect(
            x + 2,
            y + 2,
            width - 4,
            height - 4
        );

    }


    doc.setLineDashPattern(
        [],
        0
    );

}


/* =========================================================
   PDF FONT
========================================================= */

function getPDFFont(fontName) {

    const name =
        String(
            fontName || ""
        ).toLowerCase();


    if (
        name.includes("times") ||
        name.includes("georgia") ||
        name.includes("cambria")
    ) {

        return "times";
    }


    if (
        name.includes("courier")
    ) {

        return "courier";
    }


    return "helvetica";
}


/* =========================================================
   COCO PDF
========================================================= */

async function generateCocoPDF() {

    const jsPDF =
        await ensurePDFLibrary();


    if (!jsPDF) {
        return;
    }


    try {

        const dimensions =
            getPDFDimensions();


        const doc =
            new jsPDF({

                orientation:
                    dimensions.width >
                    dimensions.height
                        ? "landscape"
                        : "portrait",

                unit: "mm",

                format: [
                    dimensions.width,
                    dimensions.height
                ]

            });


        const pageW =
            dimensions.width;

        const pageH =
            dimensions.height;


        const labels =
            Math.max(
                1,
                safeNumber(
                    $("labelsPerPage")
                        ? $("labelsPerPage").value
                        : 1,
                    1
                )
            );


        const columns =
            labels === 1
                ? 1
                : labels <= 6
                    ? 2
                    : 3;


        const rows =
            Math.ceil(
                labels / columns
            );


        const margin = 8;
        const gap = 4;


        const cellW =
            (
                pageW -
                margin * 2 -
                gap * (columns - 1)
            ) / columns;


        const cellH =
            (
                pageH -
                margin * 2 -
                gap * (rows - 1)
            ) / rows;


        const pos =
            getAllPOs();


        for (
            let i = 0;
            i < pos.length;
            i++
        ) {

            if (
                i > 0 &&
                i % labels === 0
            ) {

                doc.addPage();

            }


            const slot =
                i % labels;


            const row =
                Math.floor(
                    slot / columns
                );


            const column =
                slot % columns;


            const x =
                margin +
                column *
                (cellW + gap);


            const y =
                margin +
                row *
                (cellH + gap);


            drawPDFBorder(
                doc,
                x,
                y,
                cellW,
                cellH,
                state.cocoBorder
            );


            /* ---------------------------
               PO
            --------------------------- */

            if (
                $("showPO") &&
                $("showPO").checked
            ) {

                const font =
                    getPDFFont(
                        $("poFont")
                            ? $("poFont").value
                            : "Arial"
                    );


                const bold =
                    $("poBold") &&
                    $("poBold").checked;


                const italic =
                    $("poItalic") &&
                    $("poItalic").checked;


                let fontStyle =
                    "normal";


                if (
                    bold &&
                    italic
                ) {

                    fontStyle =
                        "bolditalic";

                } else if (bold) {

                    fontStyle =
                        "bold";

                } else if (italic) {

                    fontStyle =
                        "italic";

                }


                doc.setFont(
                    font,
                    fontStyle
                );


                const cssSize =
                    safeNumber(
                        $("poFontSize")
                            ? $("poFontSize").value
                            : 26,
                        26
                    );


                /*
                   CSS px -> PDF pt approximation
                */

                doc.setFontSize(
                    Math.max(
                        6,
                        Math.min(
                            60,
                            cssSize * .75
                        )
                    )
                );


                doc.text(
                    pos[i],
                    x + cellW / 2,
                    y + cellH * .43,
                    {
                        align: "center",
                        maxWidth:
                            cellW - 10
                    }
                );

            }


            /* ---------------------------
               BOX BELOW PO
            --------------------------- */

            if (
                $("showBox") &&
                $("showBox").checked
            ) {

                const font =
                    getPDFFont(
                        $("boxFont")
                            ? $("boxFont").value
                            : "Arial"
                    );


                const bold =
                    $("boxBold") &&
                    $("boxBold").checked;


                const italic =
                    $("boxItalic") &&
                    $("boxItalic").checked;


                let fontStyle =
                    "normal";


                if (
                    bold &&
                    italic
                ) {

                    fontStyle =
                        "bolditalic";

                } else if (bold) {

                    fontStyle =
                        "bold";

                } else if (italic) {

                    fontStyle =
                        "italic";

                }


                doc.setFont(
                    font,
                    fontStyle
                );


                const cssSize =
                    safeNumber(
                        $("boxFontSize")
                            ? $("boxFontSize").value
                            : 20,
                        20
                    );


                doc.setFontSize(
                    Math.max(
                        6,
                        Math.min(
                            50,
                            cssSize * .75
                        )
                    )
                );


                const startBox =
                    Math.max(
                        1,
                        safeNumber(
                            $("startBox")
                                ? $("startBox").value
                                : 1,
                            1
                        )
                    );


                const boxNumber =
                    startBox + i;


                /*
                   IMPORTANT:
                   BOX NO. is below PO.
                */

                doc.text(
                    "BOX NO. " +
                    boxNumber,
                    x + cellW / 2,
                    y + cellH * .63,
                    {
                        align: "center",
                        maxWidth:
                            cellW - 10
                    }
                );

            }

        }


        doc.save(
            "Books-Label-Studio-Coco-Blue.pdf"
        );


        showToast(
            "PDF generated successfully",
            "green"
        );


    } catch (error) {

        console.error(
            "Coco PDF error:",
            error
        );


        showToast(
            "PDF generation failed: " +
            error.message,
            "red"
        );

    }

}


/* =========================================================
   OTHER PO PDF
========================================================= */

async function generateOtherPDF() {

    const jsPDF =
        await ensurePDFLibrary();


    if (!jsPDF) {
        return;
    }


    try {

        const doc =
            new jsPDF({
                unit: "mm",
                format: "a4"
            });


        const values =
            $("otherPO")
                ? $("otherPO").value
                    .split(/\r?\n/)
                    .map(v => v.trim())
                    .filter(Boolean)
                : [];


        const list =
            values.length
                ? values
                : ["ABC123"];


        list.forEach(
            (po, index) => {

                if (
                    index > 0 &&
                    index % 6 === 0
                ) {

                    doc.addPage();

                }


                const position =
                    index % 6;


                const row =
                    Math.floor(
                        position / 2
                    );


                const column =
                    position % 2;


                const x =
                    15 +
                    column * 90;


                const y =
                    20 +
                    row * 42;


                const style =
                    state.otherBorder ||
                    "solid";


                drawPDFBorder(
                    doc,
                    x,
                    y,
                    80,
                    30,
                    style
                );


                doc.setFont(
                    getPDFFont(
                        $("otherFont")
                            ? $("otherFont").value
                            : "Arial"
                    ),
                    "bold"
                );


                doc.setFontSize(
                    Math.max(
                        6,
                        safeNumber(
                            $("otherFontSize")
                                ? $("otherFontSize").value
                                : 20,
                            20
                        ) * .75
                    )
                );


                doc.text(
                    po,
                    x + 40,
                    y + 18,
                    {
                        align: "center",
                        maxWidth: 70
                    }
                );

            }
        );


        doc.save(
            "Books-Label-Studio-Other-PO.pdf"
        );


        showToast(
            "Other PO PDF generated",
            "green"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Other PO PDF generation failed: " +
            error.message,
            "red"
        );

    }

}


/* =========================================================
   ISBN PDF
========================================================= */

async function generateISBNPDF() {

    const jsPDF =
        await ensurePDFLibrary();


    if (!jsPDF) {
        return;
    }


    try {

        const doc =
            new jsPDF({
                unit: "mm",
                format: "a4"
            });


        const title =
            $("bookTitle")
                ? $("bookTitle").value.trim()
                : "";


        const isbn =
            $("isbn")
                ? $("isbn").value.trim()
                : "";


        doc.setFont(
            getPDFFont(
                $("isbnFont")
                    ? $("isbnFont").value
                    : "Arial"
            ),
            "normal"
        );


        doc.setFontSize(
            Math.max(
                6,
                safeNumber(
                    $("isbnFontSize")
                        ? $("isbnFontSize").value
                        : 16,
                    16
                ) * .75
            )
        );


        doc.text(
            title || "Book Title",
            105,
            30,
            {
                align: "center",
                maxWidth: 170
            }
        );


        /*
           Use JsBarcode-generated SVG
           if available.
        */

        const ready =
            await ensureLibrary(
                "barcode"
            );


        if (ready && isbn) {

            try {

                const svg =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "svg"
                    );


                JsBarcode(
                    svg,
                    isbn,
                    {
                        format: "auto",
                        width: 1.5,
                        height: 55,
                        displayValue: true,
                        margin: 5
                    }
                );


                const serializer =
                    new XMLSerializer();


                const svgString =
                    serializer.serializeToString(
                        svg
                    );


                /*
                   Convert SVG to data URI.
                */

                const svgData =
                    "data:image/svg+xml;charset=utf-8," +
                    encodeURIComponent(
                        svgString
                    );


                doc.addImage(
                    svgData,
                    "SVG",
                    55,
                    45,
                    100,
                    45
                );


            } catch (barcodeError) {

                console.warn(
                    "SVG barcode PDF fallback:",
                    barcodeError
                );

                drawSimpleBarcode(
                    doc,
                    isbn
                );

            }

        } else {

            drawSimpleBarcode(
                doc,
                isbn || "123456789"
            );

        }


        doc.setFontSize(11);

        doc.text(
            isbn || "ISBN",
            105,
            105,
            {
                align: "center"
            }
        );


        drawPDFBorder(
            doc,
            20,
            15,
            170,
            105,
            state.isbnBorder
        );


        doc.save(
            "Books-Label-Studio-ISBN.pdf"
        );


        showToast(
            "ISBN PDF generated",
            "green"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "ISBN PDF generation failed: " +
            error.message,
            "red"
        );

    }

}


/* =========================================================
   SIMPLE BARCODE FALLBACK
========================================================= */

function drawSimpleBarcode(
    doc,
    value
) {

    const clean =
        String(value || "123456789")
            .replace(/\D/g, "") ||
        "123456789";


    let x = 60;


    for (
        let i = 0;
        i < clean.length;
        i++
    ) {

        const digit =
            Number(clean[i]);


        const width =
            digit % 2
                ? 1
                : 2;


        doc.setFillColor(
            0,
            0,
            0
        );


        doc.rect(
            x,
            50,
            width,
            40,
            "F"
        );


        x +=
            width + 1;

    }

}


/* =========================================================
   ADDRESS PDF
========================================================= */

async function generateAddressPDF() {

    const jsPDF =
        await ensurePDFLibrary();


    if (!jsPDF) {
        return;
    }


    try {

        const doc =
            new jsPDF({
                unit: "mm",
                format: "a4"
            });


        const from =
            $("fromAddress")
                ? $("fromAddress").value.trim()
                : "";


        const to =
            $("toAddress")
                ? $("toAddress").value.trim()
                : "";


        const email =
            $("email")
                ? $("email").value.trim()
                : "";


        doc.setFont(
            getPDFFont(
                $("addressFont")
                    ? $("addressFont").value
                    : "Arial"
            ),
            "normal"
        );


        doc.setFontSize(
            Math.max(
                6,
                safeNumber(
                    $("addressFontSize")
                        ? $("addressFontSize").value
                        : 14,
                    14
                ) * .75
            )
        );


        drawPDFBorder(
            doc,
            15,
            15,
            180,
            150,
            state.addressBorder
        );


        doc.text(
            "FROM",
            25,
            35
        );


        doc.text(
            from ||
            "FROM ADDRESS",
            25,
            45,
            {
                maxWidth: 160
            }
        );


        doc.text(
            "TO",
            25,
            85
        );


        doc.text(
            to ||
            "TO ADDRESS",
            25,
            95,
            {
                maxWidth: 160
            }
        );


        if (email) {

            doc.text(
                "Email: " + email,
                25,
                135,
                {
                    maxWidth: 160
                }
            );

        }


        doc.save(
            "Books-Label-Studio-Address.pdf"
        );


        showToast(
            "Address PDF generated",
            "green"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Address PDF generation failed: " +
            error.message,
            "red"
        );

    }

}


/* =========================================================
   PDF BUTTONS
========================================================= */

if ($("cocoPDF")) {

    $("cocoPDF")
        .addEventListener(
            "click",
            generateCocoPDF
        );

}


if ($("otherPDF")) {

    $("otherPDF")
        .addEventListener(
            "click",
            generateOtherPDF
        );

}


if ($("isbnPDF")) {

    $("isbnPDF")
        .addEventListener(
            "click",
            generateISBNPDF
        );

}


if ($("addressPDF")) {

    $("addressPDF")
        .addEventListener(
            "click",
            generateAddressPDF
        );

}


/* =========================================================
   LOAD SAVED DEFAULT
========================================================= */

function loadSavedDefault() {

    try {

        const saved =
            localStorage.getItem(
                "BooksLabelStudioDefault"
            );


        if (!saved) {
            return;
        }


        const data =
            JSON.parse(saved);


        restore(data);


    } catch (error) {

        console.warn(
            "Could not load saved default",
            error
        );

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeApp() {

    createPOInputs();

    refreshTabs();

    refreshBorderButtons();

    updatePagePreview();

    livePreview();

    updateAllPreview();

    saveHistory();


    /*
       Try libraries once during startup,
       but don't block the UI.
    */

    initializeLibraries()
        .then(() => {

            updateAllPreview();

        });


    console.log(
        "Books Label Studio initialized."
    );

}


/* =========================================================
   START APP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
