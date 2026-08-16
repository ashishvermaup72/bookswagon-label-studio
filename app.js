"use strict";

/* =========================================================
   BOOKS LABEL STUDIO — FINAL APP.JS
========================================================= */

const AppState = {
    category: "cocoBlue",
    cocoMode: "individual",
    otherMode: "individual",
    addressMode: "manual",

    cocoExcelRows: [],
    otherExcelRows: [],
    addressExcelRows: [],

    toastTimer: null
};


/* =========================================================
   HELPERS
========================================================= */

const $ = id => document.getElementById(id);

const $$ = selector =>
    Array.from(document.querySelectorAll(selector));

function value(id, fallback = "") {
    return $(id)?.value?.trim() || fallback;
}

function numberValue(id, fallback = 0) {
    const n = Number($(id)?.value);
    return Number.isFinite(n) ? n : fallback;
}

function checked(id, fallback = false) {
    return $(id)
        ? Boolean($(id).checked)
        : fallback;
}


/* =========================================================
   TOAST
   GREEN = ENABLE
   RED   = DISABLE
========================================================= */

function showToast(message, type = "success") {

    const toast = $("toast");
    const icon = $("toastIcon");
    const text = $("toastMessage");

    if (!toast || !text) return;

    clearTimeout(AppState.toastTimer);

    toast.classList.remove(
        "show",
        "success",
        "error",
        "warning"
    );

    toast.classList.add(
        type === "success"
            ? "success"
            : "error"
    );

    if (icon) {
        icon.textContent =
            type === "success"
                ? "✓"
                : "!";
    }

    text.textContent = message;

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    AppState.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================================================
   MAIN CATEGORY NAVIGATION
========================================================= */

function initCategoryNavigation() {

    $$(".category-btn").forEach(button => {

        button.addEventListener("click", () => {

            const category =
                button.dataset.category;

            AppState.category = category;

            $$(".category-btn").forEach(btn => {
                btn.classList.toggle(
                    "active",
                    btn === button
                );
            });

            $$(".tool-section").forEach(section => {
                section.classList.toggle(
                    "active",
                    section.dataset.tool === category
                );
            });

            updateLivePreview();

        });

    });
}


/* =========================================================
   COCO MODES
========================================================= */

function initCocoModes() {

    $$(".sub-category-btn[data-coco-mode]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const mode =
                    button.dataset.cocoMode;

                AppState.cocoMode = mode;

                $$(".sub-category-btn[data-coco-mode]")
                    .forEach(btn => {

                        btn.classList.toggle(
                            "active",
                            btn === button
                        );

                    });

                const panels = {
                    individual:
                        "cocoIndividualPanel",

                    multiple:
                        "cocoMultiplePanel",

                    excel:
                        "cocoExcelPanel",

                    address:
                        "cocoAddressPanel"
                };

                Object.entries(panels).forEach(
                    ([key, id]) => {

                        $(id)?.classList.toggle(
                            "active",
                            key === mode
                        );

                    }
                );

                updateLivePreview();

            });

        });

}


/* =========================================================
   OTHER PO MODES
========================================================= */

function initOtherModes() {

    $$(".sub-category-btn[data-other-mode]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const mode =
                    button.dataset.otherMode;

                AppState.otherMode = mode;

                $$(".sub-category-btn[data-other-mode]")
                    .forEach(btn => {

                        btn.classList.toggle(
                            "active",
                            btn === button
                        );

                    });

                const panels = {
                    individual:
                        "otherIndividualPanel",

                    multiple:
                        "otherMultiplePanel",

                    excel:
                        "otherExcelPanel",

                    address:
                        "otherAddressPanel"
                };

                Object.entries(panels).forEach(
                    ([key, id]) => {

                        $(id)?.classList.toggle(
                            "active",
                            key === mode
                        );

                    }
                );

            });

        });

}


/* =========================================================
   ADDRESS MODES
========================================================= */

function initAddressModes() {

    $$(".sub-category-btn[data-address-mode]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const mode =
                    button.dataset.addressMode;

                AppState.addressMode = mode;

                $$(".sub-category-btn[data-address-mode]")
                    .forEach(btn => {

                        btn.classList.toggle(
                            "active",
                            btn === button
                        );

                    });

                $("addressManualPanel")
                    ?.classList.toggle(
                        "active",
                        mode === "manual"
                    );

                $("addressExcelPanel")
                    ?.classList.toggle(
                        "active",
                        mode === "excel"
                    );

            });

        });

}


/* =========================================================
   CREATE PO INPUTS
========================================================= */

function createPOInputs(
    containerId,
    prefix
) {

    const container =
        $(containerId);

    if (!container) return;

    container.innerHTML = "";

    for (let i = 1; i <= 40; i++) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "po-input-wrapper";

        const label =
            document.createElement("label");

        label.textContent =
            `PO ${i}`;

        const input =
            document.createElement("input");

        input.type = "text";

        input.id =
            `${prefix}${i}`;

        input.placeholder =
            `PO ${i}`;

        input.autocomplete =
            "off";

        input.addEventListener(
            "input",
            updateLivePreview
        );

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        container.appendChild(wrapper);
    }
}


function initPOInputs() {

    createPOInputs(
        "individualPOGrid",
        "cocoPO"
    );

    createPOInputs(
        "otherIndividualPOGrid",
        "otherPO"
    );

}


/* =========================================================
   GET PO VALUES
========================================================= */

function getManualPOValues(prefix) {

    const result = [];

    for (let i = 1; i <= 40; i++) {

        const input =
            $(`${prefix}${i}`);

        const text =
            input?.value?.trim();

        if (text) {
            result.push(text);
        }

    }

    return result;
}


function splitPOText(text) {

    return String(text || "")
        .split(/[\n,;]+/)
        .map(x => x.trim())
        .filter(Boolean);
}


function getCocoPOValues() {

    if (
        AppState.cocoMode ===
        "individual"
    ) {

        return getManualPOValues(
            "cocoPO"
        );

    }


    if (
        AppState.cocoMode ===
        "multiple"
    ) {

        return splitPOText(
            value("cocoMultiplePO")
        );

    }


    if (
        AppState.cocoMode ===
        "excel"
    ) {

        return AppState.cocoExcelRows
            .map(row => {

                if (Array.isArray(row)) {
                    return row[0];
                }

                return Object.values(row)[0];

            })
            .map(x => String(x ?? "").trim())
            .filter(Boolean);

    }


    return [];
}


function getOtherPOValues() {

    if (
        AppState.otherMode ===
        "individual"
    ) {

        return getManualPOValues(
            "otherPO"
        );

    }


    if (
        AppState.otherMode ===
        "multiple"
    ) {

        return splitPOText(
            value("otherMultiplePO")
        );

    }


    if (
        AppState.otherMode ===
        "excel"
    ) {

        return AppState.otherExcelRows
            .map(row => {

                if (Array.isArray(row)) {
                    return row[0];
                }

                return Object.values(row)[0];

            })
            .map(x => String(x ?? "").trim())
            .filter(Boolean);

    }


    return [];
}


/* =========================================================
   EXCEL
   FIRST ROW = HEADER
   FIRST ROW IS IGNORED FOR DATA
========================================================= */

function readExcel(
    file,
    callback,
    previewId,
    fileNameId
) {

    if (!file) return;

    if (typeof XLSX === "undefined") {

        showToast(
            "Excel library is not loaded.",
            "error"
        );

        return;
    }

    if ($(fileNameId)) {
        $(fileNameId).textContent =
            file.name;
    }

    const reader =
        new FileReader();

    reader.onload = event => {

        try {

            const workbook =
                XLSX.read(
                    new Uint8Array(
                        event.target.result
                    ),
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

            /*
             * FIRST ROW IS HEADER.
             * DO NOT PROCESS IT.
             */
            const header =
                rows.length
                    ? rows[0]
                    : [];

            const dataRows =
                rows.slice(1);

            callback(
                dataRows,
                header
            );

            renderExcelPreview(
                previewId,
                header,
                dataRows
            );

            showToast(
                `Excel loaded. Header ignored. ${dataRows.length} data rows found.`,
                "success"
            );

        } catch (error) {

            console.error(
                "Excel error:",
                error
            );

            showToast(
                "Could not read Excel file.",
                "error"
            );

        }

    };

    reader.onerror = () => {

        showToast(
            "Could not open Excel file.",
            "error"
        );

    };

    reader.readAsArrayBuffer(file);
}


/* =========================================================
   EXCEL PREVIEW
========================================================= */

function renderExcelPreview(
    containerId,
    header,
    rows
) {

    const container =
        $(containerId);

    if (!container) return;

    container.innerHTML = "";

    if (!header.length && !rows.length) {
        return;
    }

    const table =
        document.createElement("table");

    const thead =
        document.createElement("thead");

    const headRow =
        document.createElement("tr");

    header.forEach(cell => {

        const th =
            document.createElement("th");

        th.textContent =
            String(cell ?? "");

        headRow.appendChild(th);

    });

    thead.appendChild(headRow);

    const tbody =
        document.createElement("tbody");

    rows.slice(0, 50).forEach(row => {

        const tr =
            document.createElement("tr");

        row.forEach(cell => {

            const td =
                document.createElement("td");

            td.textContent =
                String(cell ?? "");

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    table.appendChild(thead);
    table.appendChild(tbody);

    container.appendChild(table);
}


/* =========================================================
   EXCEL UPLOADS
========================================================= */

function initExcelUploads() {

    $("cocoExcelFile")
        ?.addEventListener(
            "change",
            event => {

                readExcel(
                    event.target.files[0],

                    rows => {

                        AppState.cocoExcelRows =
                            rows;

                        updateLivePreview();

                    },

                    "cocoExcelPreview",

                    "cocoExcelFileName"
                );

            }
        );


    $("otherExcelFile")
        ?.addEventListener(
            "change",
            event => {

                readExcel(
                    event.target.files[0],

                    rows => {

                        AppState.otherExcelRows =
                            rows;

                    },

                    "otherExcelPreview",

                    "otherExcelFileName"
                );

            }
        );


    $("addressExcelFile")
        ?.addEventListener(
            "change",
            event => {

                readExcel(
                    event.target.files[0],

                    rows => {

                        AppState.addressExcelRows =
                            rows;

                    },

                    "addressExcelPreview",

                    null
                );

            }
        );

}


/* =========================================================
   PAGE DIMENSIONS
========================================================= */

function getPageSize(
    size,
    widthId,
    heightId
) {

    switch (size) {

        case "4x6":

            return {
                width: 101.6,
                height: 152.4
            };

        case "70x35":

            return {
                width: 70,
                height: 35
            };

        case "a4":

            return {
                width: 210,
                height: 297
            };

        case "custom":

            return {
                width:
                    numberValue(
                        widthId,
                        70
                    ),

                height:
                    numberValue(
                        heightId,
                        35
                    )
            };

        default:

            return {
                width: 101.6,
                height: 152.4
            };
    }
}


function applyOrientation(
    dimensions,
    orientation
) {

    let {
        width,
        height
    } = dimensions;

    if (
        orientation === "landscape" &&
        height > width
    ) {

        [width, height] =
            [height, width];

    }

    if (
        orientation === "portrait" &&
        width > height
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
   PAGE SETTINGS
========================================================= */

function initPageSettings() {

    const configs = [

        {
            size: "pageSize",
            orientation: "orientation",
            panel: "customSizePanel",
            width: "customWidth",
            height: "customHeight",
            info: "selectedPageInfo"
        },

        {
            size: "otherPageSize",
            orientation: "otherOrientation",
            panel: "otherCustomSizePanel",
            width: "otherCustomWidth",
            height: "otherCustomHeight"
        },

        {
            size: "isbnPageSize",
            orientation: "isbnOrientation",
            panel: "isbnCustomSizePanel",
            width: "isbnCustomWidth",
            height: "isbnCustomHeight"
        },

        {
            size: "addressPageSize",
            orientation: "addressOrientation",
            panel: "addressCustomSizePanel",
            width: "addressCustomWidth",
            height: "addressCustomHeight"
        }

    ];


    configs.forEach(config => {

        const update =
            () => {

                const isCustom =
                    value(config.size) ===
                    "custom";

                $(config.panel)
                    ?.classList.toggle(
                        "hidden",
                        !isCustom
                    );

                if ($(config.width)) {
                    $(config.width).disabled =
                        !isCustom;
                }

                if ($(config.height)) {
                    $(config.height).disabled =
                        !isCustom;
                }

                if (config.info) {

                    const dimensions =
                        applyOrientation(

                            getPageSize(
                                value(
                                    config.size,
                                    "4x6"
                                ),
                                config.width,
                                config.height
                            ),

                            value(
                                config.orientation,
                                "portrait"
                            )

                        );

                    $(config.info).textContent =
                        `${dimensions.width.toFixed(1)} × ${dimensions.height.toFixed(1)} mm`;
                }

                updateLivePreview();
            };


        $(config.size)
            ?.addEventListener(
                "change",
                update
            );

        $(config.orientation)
            ?.addEventListener(
                "change",
                update
            );

        $(config.width)
            ?.addEventListener(
                "input",
                update
            );

        $(config.height)
            ?.addEventListener(
                "input",
                update
            );

        update();

    });

}


/* =========================================================
   FEATURE LOGIC
========================================================= */

function setLocked(
    id,
    locked
) {

    const input =
        $(id);

    if (!input) return;

    input.disabled =
        locked;

    input.closest(
        ".feature-check"
    )?.classList.toggle(
        "locked",
        locked
    );
}


function applyFeatureRules(
    announce = false
) {

    const combined =
        checked(
            "poPlusBoxCheck"
        );

    const combinedBorder =
        checked(
            "combinedBorderCheck"
        );


    /*
     * PO + BOX MODE
     *
     * Individual PO and Box options
     * are locked.
     */

    if (combined) {

        if ($("poNumberCheck")) {
            $("poNumberCheck").checked =
                false;
        }

        if ($("boxNumberCheck")) {
            $("boxNumberCheck").checked =
                false;
        }

        setLocked(
            "poNumberCheck",
            true
        );

        setLocked(
            "boxNumberCheck",
            true
        );

        if (announce) {

            showToast(
                "PO + Box enabled.",
                "success"
            );

        }

    } else {

        setLocked(
            "poNumberCheck",
            false
        );

        setLocked(
            "boxNumberCheck",
            false
        );

    }


    /*
     * COMBINED BORDER MODE
     *
     * Individual borders are locked.
     */

    if (combinedBorder) {

        if ($("poBorderCheck")) {
            $("poBorderCheck").checked =
                false;
        }

        if ($("boxBorderCheck")) {
            $("boxBorderCheck").checked =
                false;
        }

        setLocked(
            "poBorderCheck",
            true
        );

        setLocked(
            "boxBorderCheck",
            true
        );

        if (announce) {

            showToast(
                "Combined Border enabled.",
                "success"
            );

        }

    } else {

        setLocked(
            "poBorderCheck",
            false
        );

        setLocked(
            "boxBorderCheck",
            false
        );

    }
}


/* =========================================================
   FEATURE EVENTS
========================================================= */

function readableName(id) {

    const names = {

        poNumberCheck:
            "PO Value",

        boxNumberCheck:
            "Box Number",

        poPlusBoxCheck:
            "PO + Box",

        combinedBorderCheck:
            "Combined Border",

        poBorderCheck:
            "PO Border",

        boxBorderCheck:
            "Box Border",

        cutLineCheck:
            "Cut Line",

        pageBorderCheck:
            "Page Border",

        samePOPageFlow:
            "Same PO Flow",

        halfPageFlowCheck:
            "Half Page Flow",

        poBoldCheck:
            "PO Bold",

        poItalicCheck:
            "PO Italic",

        poUnderlineCheck:
            "PO Underline",

        boxBoldCheck:
            "Box Bold",

        boxItalicCheck:
            "Box Italic",

        boxUnderlineCheck:
            "Box Underline",

        fromBold:
            "From Bold",

        fromItalic:
            "From Italic",

        fromUnderline:
            "From Underline",

        fromBorder:
            "From Border",

        toBold:
            "To Bold",

        toItalic:
            "To Italic",

        toUnderline:
            "To Underline",

        toBorder:
            "To Border"

    };

    return names[id] || "Function";
}


function initFeatureCheckboxes() {

    const ids = [

        "poNumberCheck",
        "boxNumberCheck",
        "poPlusBoxCheck",

        "combinedBorderCheck",
        "poBorderCheck",
        "boxBorderCheck",

        "cutLineCheck",
        "pageBorderCheck",

        "samePOPageFlow",
        "halfPageFlowCheck",

        "poBoldCheck",
        "poItalicCheck",
        "poUnderlineCheck",

        "boxBoldCheck",
        "boxItalicCheck",
        "boxUnderlineCheck",

        "fromBold",
        "fromItalic",
        "fromUnderline",
        "fromBorder",

        "toBold",
        "toItalic",
        "toUnderline",
        "toBorder"

    ];


    ids.forEach(id => {

        $(id)?.addEventListener(
            "change",
            () => {

                const isChecked =
                    checked(id);

                showToast(
                    `${readableName(id)} ${isChecked ? "enabled" : "disabled"}.`,
                    isChecked
                        ? "success"
                        : "error"
                );

                if (
                    id ===
                    "poPlusBoxCheck"
                ) {

                    applyFeatureRules(
                        false
                    );

                }

                if (
                    id ===
                    "combinedBorderCheck"
                ) {

                    applyFeatureRules(
                        false
                    );

                }

                updateLivePreview();

            }
        );

    });

    applyFeatureRules(false);
}


/* =========================================================
   FONT STYLE
========================================================= */

function getFont(
    familyId,
    sizeId,
    boldId,
    italicId,
    underlineId
) {

    return {

        family:
            value(
                familyId,
                "Arial"
            ),

        size:
            numberValue(
                sizeId,
                20
            ),

        bold:
            checked(
                boldId
            ),

        italic:
            checked(
                italicId
            ),

        underline:
            checked(
                underlineId
            )

    };
}


function applyFont(
    element,
    font
) {

    if (!element) return;

    element.style.fontFamily =
        `"${font.family}"`;

    element.style.fontSize =
        `${font.size}px`;

    element.style.fontWeight =
        font.bold
            ? "700"
            : "400";

    element.style.fontStyle =
        font.italic
            ? "italic"
            : "normal";

    element.style.textDecoration =
        font.underline
            ? "underline"
            : "none";
}


/* =========================================================
   LIVE PAGE PREVIEW
========================================================= */

function updatePreviewPage() {

    const page =
        $("previewPage");

    if (!page) return;

    const dimensions =
        applyOrientation(

            getPageSize(
                value(
                    "pageSize",
                    "4x6"
                ),

                "customWidth",
                "customHeight"
            ),

            value(
                "orientation",
                "portrait"
            )

        );


    const ratio =
        dimensions.width /
        dimensions.height;


    const maxWidth =
        600;

    const maxHeight =
        520;


    let width;
    let height;


    if (ratio >= 1) {

        width =
            Math.min(
                maxWidth,
                dimensions.width * 2.7
            );

        height =
            width / ratio;

    } else {

        height =
            Math.min(
                maxHeight,
                dimensions.height * 2.7
            );

        width =
            height * ratio;

    }


    page.style.width =
        `${Math.max(100, width)}px`;

    page.style.height =
        `${Math.max(100, height)}px`;


    const pageBorder =
        checked(
            "pageBorderCheck"
        );

    page.style.border =
        pageBorder
            ? "2px solid #111827"
            : "1px solid #cbd5e1";


    const info =
        $("previewPageSize");

    if (info) {

        const size =
            value(
                "pageSize",
                "4x6"
            );

        if (size === "70x35") {
            info.textContent =
                "70 × 35 mm";
        } else if (size === "a4") {
            info.textContent =
                "A4";
        } else if (size === "custom") {
            info.textContent =
                "Custom Size";
        } else {
            info.textContent =
                "4 × 6 Inches";
        }

    }
}


/* =========================================================
   CRITICAL PO PREVIEW
========================================================= */

function updatePOPreview() {

    const poElement =
        $("previewPO");

    const boxElement =
        $("previewBox");

    const label =
        $("previewLabel");

    if (
        !poElement ||
        !boxElement ||
        !label
    ) {
        return;
    }


    const poList =
        getCocoPOValues();


    /*
     * IMPORTANT:
     *
     * PO VALUE ONLY.
     *
     * NO "PO NUMBER" prefix.
     *
     * Example:
     * ABC123
     *
     * NOT:
     * PO NUMBER ABC123
     */

    const po =
        poList[0] ||
        "ABC123";


    const box =
        numberValue(
            "startBoxNumber",
            1
        );


    const poEnabled =
        checked(
            "poNumberCheck",
            true
        );

    const boxEnabled =
        checked(
            "boxNumberCheck",
            true
        );

    const poPlusBox =
        checked(
            "poPlusBoxCheck"
        );

    const combinedBorder =
        checked(
            "combinedBorderCheck"
        );

    const poBorder =
        checked(
            "poBorderCheck"
        );

    const boxBorder =
        checked(
            "boxBorderCheck"
        );

    const cutLine =
        checked(
            "cutLineCheck"
        );


    /*
     * PO text
     */

    poElement.textContent =
        po;


    /*
     * BOX text
     *
     * Exact format:
     *
     * BOX NO. 123
     */

    boxElement.textContent =
        `BOX NO. ${box}`;


    /*
     * Visibility
     */

    if (poPlusBox) {

        poElement.style.display =
            "block";

        boxElement.style.display =
            "block";

    } else {

        poElement.style.display =
            poEnabled
                ? "block"
                : "none";

        boxElement.style.display =
            boxEnabled
                ? "block"
                : "none";

    }


    /*
     * Combined border
     */

    label.classList.toggle(
        "combined-border",
        combinedBorder
    );


    /*
     * Individual borders
     */

    poElement.classList.toggle(
        "with-border",
        poBorder &&
        !combinedBorder
    );

    boxElement.classList.toggle(
        "with-border",
        boxBorder &&
        !combinedBorder
    );


    /*
     * Cut line
     */

    label.style.outline =
        cutLine
            ? "1px dashed #64748b"
            : "none";


    /*
     * ALWAYS STACK:
     *
     * PO
     * BOX NO. 123
     *
     * vertically.
     */

    label.style.flexDirection =
        "column";

    label.style.gap =
        "10px";


    /*
     * PO font
     */

    applyFont(
        poElement,

        getFont(
            "poFontFamily",
            "poFontSize",
            "poBoldCheck",
            "poItalicCheck",
            "poUnderlineCheck"
        )
    );


    /*
     * BOX font
     */

    applyFont(
        boxElement,

        getFont(
            "boxFontFamily",
            "boxFontSize",
            "boxBoldCheck",
            "boxItalicCheck",
            "boxUnderlineCheck"
        )
    );
}


/* =========================================================
   LIVE PREVIEW
========================================================= */

function updateLivePreview() {

    updatePreviewPage();

    updatePOPreview();
}


/* =========================================================
   ISBN BARCODE
========================================================= */

function initISBN() {

    const inputs = [
        "isbnValue",
        "isbnBookTitle",
        "isbnEdition"
    ];

    inputs.forEach(id => {

        $(id)?.addEventListener(
            "input",
            generateISBNBarcode
        );

    });

    generateISBNBarcode();
}


function generateISBNBarcode() {

    const svg =
        $("isbnBarcodeSvg");

    const text =
        value(
            "isbnValue"
        );


    if (!svg) return;

    svg.innerHTML = "";


    if (!text) {

        $("isbnBarcodeText")
            && (
                $("isbnBarcodeText")
                    .textContent =
                    "Enter ISBN to preview"
            );

        return;
    }


    if (
        typeof JsBarcode ===
        "undefined"
    ) {

        $("isbnBarcodeText")
            && (
                $("isbnBarcodeText")
                    .textContent =
                    "Barcode library not loaded."
            );

        return;
    }


    try {

        JsBarcode(
            svg,
            text,
            {
                format: "EAN13",
                displayValue: true,
                width: 2,
                height: 70,
                margin: 10
            }
        );

    } catch {

        try {

            JsBarcode(
                svg,
                text,
                {
                    format: "CODE128",
                    displayValue: true,
                    width: 2,
                    height: 70,
                    margin: 10
                }
            );

        } catch {

            $("isbnBarcodeText")
                && (
                    $("isbnBarcodeText")
                        .textContent =
                        "Invalid barcode value."
                );

        }

    }
}


/* =========================================================
   QR CODE
========================================================= */

function createQR(
    elementId,
    text
) {

    const container =
        $(elementId);

    if (!container) return;

    container.innerHTML = "";

    if (
        typeof QRCode ===
        "undefined"
    ) {

        container.textContent =
            "QR library not loaded.";

        return;
    }


    QRCode.toCanvas(
        text,
        {
            width: 170,
            margin: 2,
            errorCorrectionLevel: "M"
        },
        error => {

            if (error) {

                console.error(
                    "QR error:",
                    error
                );

                container.textContent =
                    "QR generation failed.";

                return;
            }

        }
    );


    /*
     * qrcode library can return canvas
     * only through callback depending
     * on version.
     */

    QRCode.toCanvas(
        document.createElement("canvas"),
        text,
        {
            width: 170,
            margin: 2
        },
        (error, canvas) => {

            if (error) return;

            container.innerHTML = "";

            container.appendChild(
                canvas
            );

        }
    );
}


function initQRCodes() {

    createQR(
        "addressQRPreview",
        "https://maps.app.goo.gl/7McYApm1u9x4QSj7A"
    );

    createQR(
        "emailQRPreview",
        "mailto:ashish.verma@bookswagon.in"
    );
}


/* =========================================================
   PDF HELPERS
========================================================= */

function getPDFDimensions(
    size,
    orientation,
    widthId,
    heightId
) {

    let dimensions =
        getPageSize(
            size,
            widthId,
            heightId
        );

    dimensions =
        applyOrientation(
            dimensions,
            orientation
        );

    return dimensions;
}


function getPDFStyle(font) {

    if (
        font.bold &&
        font.italic
    ) {
        return "bolditalic";
    }

    if (font.bold) {
        return "bold";
    }

    if (font.italic) {
        return "italic";
    }

    return "normal";
}


/* =========================================================
   DRAW COCO LABEL
========================================================= */

function drawCocoLabel(
    doc,
    x,
    y,
    width,
    height,
    po,
    box
) {

    const poEnabled =
        checked(
            "poNumberCheck",
            true
        );

    const boxEnabled =
        checked(
            "boxNumberCheck",
            true
        );

    const poPlusBox =
        checked(
            "poPlusBoxCheck"
        );

    const combinedBorder =
        checked(
            "combinedBorderCheck"
        );

    const poBorder =
        checked(
            "poBorderCheck"
        );

    const boxBorder =
        checked(
            "boxBorderCheck"
        );

    const cutLine =
        checked(
            "cutLineCheck"
        );


    /*
     * Label border
     */

    if (combinedBorder) {

        doc.setDrawColor(
            17,
            24,
            39
        );

        doc.setLineWidth(
            .7
        );

        doc.rect(
            x,
            y,
            width,
            height
        );

    }


    if (cutLine) {

        doc.setDrawColor(
            100,
            116,
            139
        );

        doc.setLineDashPattern(
            [2, 2],
            0
        );

        doc.rect(
            x,
            y,
            width,
            height
        );

        doc.setLineDashPattern(
            [],
            0
        );

    }


    const showPO =
        poPlusBox ||
        poEnabled;

    const showBox =
        poPlusBox ||
        boxEnabled;


    let centerY =
        y + height / 2;


    if (
        showPO &&
        showBox
    ) {
        centerY -= 7;
    }


    /*
     * PO
     *
     * ONLY ACTUAL PO VALUE.
     */

    if (showPO) {

        const poFont =
            getFont(
                "poFontFamily",
                "poFontSize",
                "poBoldCheck",
                "poItalicCheck",
                "poUnderlineCheck"
            );


        doc.setFont(
            poFont.family,
            getPDFStyle(
                poFont
            )
        );

        doc.setFontSize(
            poFont.size
        );


        const lines =
            doc.splitTextToSize(
                String(po),
                width - 10
            );


        doc.text(
            lines,
            x + width / 2,
            centerY,
            {
                align: "center"
            }
        );


        if (
            poBorder &&
            !combinedBorder
        ) {

            doc.rect(
                x + 4,
                centerY -
                    poFont.size / 2 -
                    2,

                width - 8,

                poFont.size + 5
            );

        }


        centerY +=
            poFont.size + 10;
    }


    /*
     * BOX
     *
     * EXACT FORMAT:
     *
     * BOX NO. 123
     */

    if (showBox) {

        const boxFont =
            getFont(
                "boxFontFamily",
                "boxFontSize",
                "boxBoldCheck",
                "boxItalicCheck",
                "boxUnderlineCheck"
            );


        doc.setFont(
            boxFont.family,
            getPDFStyle(
                boxFont
            )
        );

        doc.setFontSize(
            boxFont.size
        );


        const boxText =
            `BOX NO. ${box}`;


        doc.text(
            boxText,
            x + width / 2,
            centerY,
            {
                align: "center"
            }
        );


        if (
            boxBorder &&
            !combinedBorder
        ) {

            doc.rect(
                x + 4,
                centerY -
                    boxFont.size / 2 -
                    2,

                width - 8,

                boxFont.size + 5
            );

        }
    }
}


/* =========================================================
   COCO PDF
========================================================= */

function generateCocoPDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        showToast(
            "PDF library is not loaded.",
            "error"
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const size =
        value(
            "pageSize",
            "4x6"
        );

    const orientation =
        value(
            "orientation",
            "portrait"
        );


    const dimensions =
        getPDFDimensions(
            size,
            orientation,
            "customWidth",
            "customHeight"
        );


    const pdfOrientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const doc =
        new jsPDF({

            orientation:
                pdfOrientation,

            unit:
                "mm",

            format: [
                dimensions.width,
                dimensions.height
            ]

        });


    const poValues =
        getCocoPOValues();


    /*
     * If user has not entered a PO,
     * keep one preview/label.
     */

    const pos =
        poValues.length
            ? poValues
            : ["ABC123"];


    const startBox =
        Math.max(
            1,
            numberValue(
                "startBoxNumber",
                1
            )
        );


    const endBox =
        Math.max(
            startBox,
            numberValue(
                "endBoxNumber",
                startBox
            )
        );


    const repeat =
        Math.max(
            1,
            numberValue(
                "boxRepeatCount",
                1
            )
        );


    const labelsPerPage =
        Math.max(
            1,
            numberValue(
                "labelsPerPage",
                2
            )
        );


    const gap =
        Math.max(
            1,
            numberValue(
                "labelGap",
                2
            )
        );


    const labels = [];


    pos.forEach(po => {

        for (
            let r = 0;
            r < repeat;
            r++
        ) {

            for (
                let box = startBox;
                box <= endBox;
                box++
            ) {

                labels.push({
                    po,
                    box
                });

            }

        }

    });


    if (!labels.length) {

        labels.push({
            po: "ABC123",
            box: startBox
        });

    }


    for (
        let pageStart = 0;
        pageStart < labels.length;
        pageStart += labelsPerPage
    ) {

        if (pageStart > 0) {

            doc.addPage(
                [
                    dimensions.width,
                    dimensions.height
                ],
                pdfOrientation
            );

        }


        const pageLabels =
            labels.slice(
                pageStart,
                pageStart +
                labelsPerPage
            );


        const totalGap =
            gap *
            (
                pageLabels.length + 1
            );


        const labelHeight =
            (
                dimensions.height -
                totalGap
            ) /
            pageLabels.length;


        const pageBorder =
            checked(
                "pageBorderCheck"
            );


        if (pageBorder) {

            doc.setDrawColor(
                17,
                24,
                39
            );

            doc.setLineWidth(
                .6
            );

            doc.rect(
                2,
                2,
                dimensions.width - 4,
                dimensions.height - 4
            );

        }


        pageLabels.forEach(
            (item, index) => {

                const x =
                    gap;

                const y =
                    gap +
                    index *
                    (
                        labelHeight +
                        gap
                    );


                const width =
                    dimensions.width -
                    gap * 2;


                drawCocoLabel(
                    doc,
                    x,
                    y,
                    width,
                    labelHeight,
                    item.po,
                    item.box
                );

            }
        );

    }


    doc.save(
        "books-label-studio-coco-blue.pdf"
    );


    showToast(
        "Coco Blue PDF generated successfully.",
        "success"
    );
}


/* =========================================================
   OTHER PO PDF
========================================================= */

function generateOtherPDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        showToast(
            "PDF library is not loaded.",
            "error"
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFDimensions(
            value(
                "otherPageSize",
                "4x6"
            ),

            value(
                "otherOrientation",
                "portrait"
            ),

            "otherCustomWidth",
            "otherCustomHeight"
        );


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const doc =
        new jsPDF({

            orientation,

            unit: "mm",

            format: [
                dimensions.width,
                dimensions.height
            ]

        });


    const pos =
        getOtherPOValues();


    const list =
        pos.length
            ? pos
            : ["ABC123"];


    list.forEach(
        (po, index) => {

            if (index > 0) {

                doc.addPage(
                    [
                        dimensions.width,
                        dimensions.height
                    ],
                    orientation
                );

            }


            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                26
            );


            doc.text(
                String(po),
                dimensions.width / 2,
                dimensions.height / 2,
                {
                    align: "center"
                }
            );

        }
    );


    doc.save(
        "books-label-studio-other-po.pdf"
    );


    showToast(
        "Other PO PDF generated successfully.",
        "success"
    );
}


/* =========================================================
   ISBN PDF
========================================================= */

function generateISBNPDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        showToast(
            "PDF library is not loaded.",
            "error"
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFDimensions(
            value(
                "isbnPageSize",
                "4x6"
            ),

            value(
                "isbnOrientation",
                "portrait"
            ),

            "isbnCustomWidth",
            "isbnCustomHeight"
        );


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const doc =
        new jsPDF({

            orientation,

            unit: "mm",

            format: [
                dimensions.width,
                dimensions.height
            ]

        });


    const isbn =
        value(
            "isbnValue",
            "ISBN"
        );


    const title =
        value(
            "isbnBookTitle",
            "ISBN BARCODE"
        );


    const edition =
        value(
            "isbnEdition"
        );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        18
    );


    doc.text(
        title,
        dimensions.width / 2,
        20,
        {
            align: "center"
        }
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        11
    );


    doc.text(
        isbn,
        dimensions.width / 2,
        28,
        {
            align: "center"
        }
    );


    if (edition) {

        doc.text(
            edition,
            dimensions.width / 2,
            35,
            {
                align: "center"
            }
        );

    }


    drawSimpleBarcode(
        doc,
        isbn,
        10,
        dimensions.height / 2,
        dimensions.width - 20,
        30
    );


    doc.save(
        "books-label-studio-isbn.pdf"
    );


    showToast(
        "ISBN PDF generated successfully.",
        "success"
    );
}


/* =========================================================
   SIMPLE BARCODE FALLBACK
========================================================= */

function drawSimpleBarcode(
    doc,
    text,
    x,
    y,
    width,
    height
) {

    const string =
        String(text);


    const unit =
        width /
        Math.max(
            1,
            string.length * 11
        );


    let cursor =
        x;


    string.split("")
        .forEach(char => {

            const code =
                char.charCodeAt(0);


            for (
                let bit = 0;
                bit < 8;
                bit++
            ) {

                if (
                    (code >> bit) & 1
                ) {

                    doc.setFillColor(
                        0,
                        0,
                        0
                    );

                    doc.rect(
                        cursor,
                        y,
                        Math.max(
                            .25,
                            unit
                        ),
                        height,
                        "F"
                    );

                }

                cursor += unit;

            }

            cursor +=
                unit * 3;

        });


    doc.setFontSize(
        8
    );

    doc.setTextColor(
        0,
        0,
        0
    );

    doc.text(
        string,
        x + width / 2,
        y + height + 5,
        {
            align: "center"
        }
    );
}


/* =========================================================
   ADDRESS PDF
========================================================= */

function generateAddressPDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        showToast(
            "PDF library is not loaded.",
            "error"
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFDimensions(
            value(
                "addressPageSize",
                "4x6"
            ),

            value(
                "addressOrientation",
                "portrait"
            ),

            "addressCustomWidth",
            "addressCustomHeight"
        );


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const doc =
        new jsPDF({

            orientation,

            unit: "mm",

            format: [
                dimensions.width,
                dimensions.height
            ]

        });


    let from =
        value(
            "addressFrom",
            "FROM ADDRESS"
        );


    let to =
        value(
            "addressTo",
            "TO ADDRESS"
        );


    /*
     * Excel:
     * FIRST ROW ALREADY REMOVED.
     */

    if (
        AppState.addressMode ===
        "excel" &&
        AppState.addressExcelRows.length
    ) {

        const row =
            AppState.addressExcelRows[0];


        if (Array.isArray(row)) {

            from =
                String(
                    row[0] ||
                    from
                );

            to =
                String(
                    row[1] ||
                    to
                );

        }

    }


    const margin = 8;
    const gap = 5;

    const width =
        (
            dimensions.width -
            margin * 2 -
            gap
        ) / 2;

    const height =
        dimensions.height -
        margin * 2;


    drawAddressBox(
        doc,
        from,
        margin,
        margin,
        width,
        height,
        {
            family:
                value(
                    "fromFontFamily",
                    "Arial"
                ),

            size:
                numberValue(
                    "fromFontSize",
                    14
                ),

            bold:
                checked("fromBold"),

            italic:
                checked("fromItalic"),

            underline:
                checked("fromUnderline"),

            border:
                checked("fromBorder")
        }
    );


    drawAddressBox(
        doc,
        to,
        margin +
            width +
            gap,
        margin,
        width,
        height,
        {
            family:
                value(
                    "toFontFamily",
                    "Arial"
                ),

            size:
                numberValue(
                    "toFontSize",
                    14
                ),

            bold:
                checked("toBold"),

            italic:
                checked("toItalic"),

            underline:
                checked("toUnderline"),

            border:
                checked("toBorder")
        }
    );


    doc.save(
        "books-label-studio-address.pdf"
    );


    showToast(
        "Address PDF generated successfully.",
        "success"
    );
}


/* =========================================================
   ADDRESS BOX
========================================================= */

function drawAddressBox(
    doc,
    text,
    x,
    y,
    width,
    height,
    settings
) {

    if (settings.border) {

        doc.setDrawColor(
            17,
            24,
            39
        );

        doc.rect(
            x,
            y,
            width,
            height
        );

    }


    let style =
        "normal";


    if (
        settings.bold &&
        settings.italic
    ) {

        style =
            "bolditalic";

    } else if (
        settings.bold
    ) {

        style =
            "bold";

    } else if (
        settings.italic
    ) {

        style =
            "italic";

    }


    doc.setFont(
        settings.family,
        style
    );


    doc.setFontSize(
        settings.size
    );


    const lines =
        doc.splitTextToSize(
            text,
            width - 8
        );


    doc.text(
        lines,
        x + 4,
        y + 9
    );
}


/* =========================================================
   RESET COCO
========================================================= */

function resetCoco() {

    for (
        let i = 1;
        i <= 40;
        i++
    ) {

        if ($(`cocoPO${i}`)) {
            $(`cocoPO${i}`).value = "";
        }

    }


    if ($("cocoMultiplePO")) {
        $("cocoMultiplePO").value = "";
    }


    $("startBoxNumber")
        && (
            $("startBoxNumber").value =
            "1"
        );


    $("endBoxNumber")
        && (
            $("endBoxNumber").value =
            "10"
        );


    $("boxRepeatCount")
        && (
            $("boxRepeatCount").value =
            "1"
        );


    $("labelsPerPage")
        && (
            $("labelsPerPage").value =
            "2"
        );


    $("pageSize")
        && (
            $("pageSize").value =
            "4x6"
        );


    $("orientation")
        && (
            $("orientation").value =
            "portrait"
        );


    const defaults = {

        poNumberCheck: true,

        boxNumberCheck: true,

        poPlusBoxCheck: false,

        combinedBorderCheck: false,

        poBorderCheck: false,

        boxBorderCheck: false,

        cutLineCheck: false,

        pageBorderCheck: false,

        samePOPageFlow: false,

        halfPageFlowCheck: false

    };


    Object.entries(defaults)
        .forEach(
            ([id, state]) => {

                if ($(id)) {
                    $(id).checked =
                        state;
                }

            }
        );


    applyFeatureRules(false);

    updateLivePreview();

    showToast(
        "Coco Blue reset successfully.",
        "success"
    );
}


/* =========================================================
   RESET OTHER
========================================================= */

function resetOther() {

    for (
        let i = 1;
        i <= 40;
        i++
    ) {

        if ($(`otherPO${i}`)) {
            $(`otherPO${i}`).value = "";
        }

    }


    if ($("otherMultiplePO")) {
        $("otherMultiplePO").value = "";
    }


    showToast(
        "Other PO reset successfully.",
        "success"
    );
}


/* =========================================================
   RESET ISBN
========================================================= */

function resetISBN() {

    [
        "isbnValue",
        "isbnBookTitle",
        "isbnEdition"
    ].forEach(id => {

        if ($(id)) {
            $(id).value = "";
        }

    });


    if ($("isbnBarcodeSvg")) {
        $("isbnBarcodeSvg").innerHTML =
            "";
    }


    if ($("isbnBarcodeText")) {
        $("isbnBarcodeText").textContent =
            "Enter ISBN to preview";
    }


    showToast(
        "ISBN reset successfully.",
        "success"
    );
}


/* =========================================================
   RESET ADDRESS
========================================================= */

function resetAddress() {

    [
        "addressFrom",
        "addressTo"
    ].forEach(id => {

        if ($(id)) {
            $(id).value = "";
        }

    });


    showToast(
        "Address reset successfully.",
        "success"
    );
}


/* =========================================================
   ACTION BUTTONS
========================================================= */

function initActionButtons() {

    $("cocoResetButton")
        ?.addEventListener(
            "click",
            resetCoco
        );

    $("cocoGenerateButton")
        ?.addEventListener(
            "click",
            generateCocoPDF
        );


    $("otherResetButton")
        ?.addEventListener(
            "click",
            resetOther
        );

    $("otherGenerateButton")
        ?.addEventListener(
            "click",
            generateOtherPDF
        );


    $("isbnResetButton")
        ?.addEventListener(
            "click",
            resetISBN
        );

    $("isbnGenerateButton")
        ?.addEventListener(
            "click",
            generateISBNPDF
        );


    $("addressResetButton")
        ?.addEventListener(
            "click",
            resetAddress
        );

    $("addressGenerateButton")
        ?.addEventListener(
            "click",
            generateAddressPDF
        );
}


/* =========================================================
   LIVE CONTROLS
========================================================= */

function initLiveControls() {

    $$(
        "input:not([type='file']), textarea, select"
    ).forEach(element => {

        element.addEventListener(
            "input",
            updateLivePreview
        );

        element.addEventListener(
            "change",
            updateLivePreview
        );

    });
}


/* =========================================================
   LANGUAGE
========================================================= */

function initLanguage() {

    $("languageSelect")
        ?.addEventListener(
            "change",
            event => {

                const title =
                    document.querySelector(
                        ".brand-text h1"
                    );

                const subtitle =
                    document.querySelector(
                        ".brand-text p"
                    );


                if (
                    event.target.value ===
                    "hi"
                ) {

                    if (title) {
                        title.textContent =
                            "बुक्स लेबल स्टूडियो";
                    }

                    if (subtitle) {
                        subtitle.textContent =
                            "प्रोफेशनल लेबल और बारकोड जनरेटर";
                    }

                } else {

                    if (title) {
                        title.textContent =
                            "Books Label Studio";
                    }

                    if (subtitle) {
                        subtitle.textContent =
                            "Professional Label & Barcode Generator";
                    }

                }

            }
        );
}


/* =========================================================
   INITIALIZE
========================================================= */

function initApp() {

    initCategoryNavigation();

    initCocoModes();

    initOtherModes();

    initAddressModes();

    initPOInputs();

    initExcelUploads();

    initPageSettings();

    initFeatureCheckboxes();

    initISBN();

    initQRCodes();

    initActionButtons();

    initLiveControls();

    initLanguage();

    updateLivePreview();

    console.log(
        "Books Label Studio loaded successfully."
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();

}
