"use strict";

/* =========================================================
   BOOKS LABEL STUDIO
   FINAL APP.JS
   Matching:
   index.html + style.css
========================================================= */


/* =========================================================
   GLOBAL STATE
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
   DOM HELPERS
========================================================= */

const $ = (id) =>
    document.getElementById(id);

const $$ = (selector) =>
    Array.from(
        document.querySelectorAll(selector)
    );

function getValue(id, fallback = "") {

    const element = $(id);

    if (!element) {
        return fallback;
    }

    return String(
        element.value ?? ""
    ).trim();

}

function getNumber(id, fallback = 0) {

    const value =
        Number(
            getValue(id)
        );

    return Number.isFinite(value)
        ? value
        : fallback;
}

function isChecked(
    id,
    fallback = false
) {

    const element = $(id);

    if (!element) {
        return fallback;
    }

    return Boolean(
        element.checked
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        $("toast");

    const icon =
        $("toastIcon");

    const text =
        $("toastMessage");

    if (!toast || !text) {
        return;
    }

    clearTimeout(
        AppState.toastTimer
    );

    toast.classList.remove(
        "show",
        "success",
        "error",
        "warning"
    );

    const toastType =
        type === "success"
            ? "success"
            : "error";

    toast.classList.add(
        toastType
    );

    if (icon) {

        icon.textContent =
            toastType === "success"
                ? "✓"
                : "!";

    }

    text.textContent =
        message;

    requestAnimationFrame(() => {

        toast.classList.add(
            "show"
        );

    });

    AppState.toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2800);

}


/* =========================================================
   PDF LIBRARY
========================================================= */

function getJsPDF() {

    if (
        window.jspdf &&
        typeof window.jspdf.jsPDF ===
        "function"
    ) {

        return window.jspdf.jsPDF;

    }

    return null;

}

function checkPDFLibrary() {

    const jsPDF =
        getJsPDF();

    if (!jsPDF) {

        showToast(
            "PDF library load नहीं हुई। Internet/CDN connection check करें।",
            "error"
        );

        console.error(
            "jsPDF is not available."
        );

        return false;
    }

    return true;

}


/* =========================================================
   MAIN CATEGORY NAVIGATION
========================================================= */

function initCategoryNavigation() {

    $$(".category-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.dataset.category;

                    if (!category) {
                        return;
                    }

                    AppState.category =
                        category;

                    $$(".category-btn")
                        .forEach(btn => {

                            btn.classList.toggle(
                                "active",
                                btn === button
                            );

                        });


                    $$(".tool-section")
                        .forEach(section => {

                            section.classList.toggle(
                                "active",
                                section.dataset.tool ===
                                category
                            );

                        });


                    updateLivePreview();

                }
            );

        });

}


/* =========================================================
   COCO MODE NAVIGATION
========================================================= */

function initCocoModes() {

    $$(".sub-category-btn[data-coco-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const mode =
                        button.dataset.cocoMode;

                    AppState.cocoMode =
                        mode;


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


                    Object.entries(
                        panels
                    ).forEach(
                        ([key, id]) => {

                            $(id)
                                ?.classList.toggle(
                                    "active",
                                    key === mode
                                );

                        }
                    );


                    showToast(
                        `${button.textContent.trim()} selected.`,
                        "success"
                    );

                    updateLivePreview();

                }
            );

        });

}


/* =========================================================
   OTHER PO MODES
========================================================= */

function initOtherModes() {

    $$(".sub-category-btn[data-other-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const mode =
                        button.dataset.otherMode;

                    AppState.otherMode =
                        mode;


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


                    Object.entries(
                        panels
                    ).forEach(
                        ([key, id]) => {

                            $(id)
                                ?.classList.toggle(
                                    "active",
                                    key === mode
                                );

                        }
                    );


                    showToast(
                        `${button.textContent.trim()} selected.`,
                        "success"
                    );

                }
            );

        });

}


/* =========================================================
   ADDRESS MODES
========================================================= */

function initAddressModes() {

    $$(".sub-category-btn[data-address-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const mode =
                        button.dataset.addressMode;

                    AppState.addressMode =
                        mode;


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


                    showToast(
                        `${button.textContent.trim()} selected.`,
                        "success"
                    );

                }
            );

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

    if (!container) {
        return;
    }

    container.innerHTML = "";

    for (
        let i = 1;
        i <= 40;
        i++
    ) {

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "po-input-wrapper";


        const label =
            document.createElement(
                "label"
            );

        label.htmlFor =
            `${prefix}${i}`;

        label.textContent =
            `PO ${i}`;


        const input =
            document.createElement(
                "input"
            );

        input.type =
            "text";

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


        wrapper.appendChild(
            label
        );

        wrapper.appendChild(
            input
        );

        container.appendChild(
            wrapper
        );

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
   PO PARSER
========================================================= */

function splitPOText(text) {

    return String(
        text || ""
    )
        .split(
            /[\n,;]+/
        )
        .map(
            value =>
                value.trim()
        )
        .filter(
            Boolean
        );

}


function getManualPOValues(
    prefix
) {

    const result = [];

    for (
        let i = 1;
        i <= 40;
        i++
    ) {

        const input =
            $(`${prefix}${i}`);

        if (!input) {
            continue;
        }

        const text =
            input.value.trim();

        if (text) {

            result.push(
                text
            );

        }

    }

    return result;

}


/* =========================================================
   COCO PO VALUES
========================================================= */

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
            getValue(
                "cocoMultiplePO"
            )
        );

    }


    if (
        AppState.cocoMode ===
        "excel"
    ) {

        return AppState.cocoExcelRows
            .map(row => {

                if (
                    Array.isArray(row)
                ) {

                    return row[0];

                }

                return Object.values(
                    row
                )[0];

            })
            .map(
                value =>
                    String(
                        value ?? ""
                    ).trim()
            )
            .filter(
                Boolean
            );

    }

    return [];

}


/* =========================================================
   OTHER PO VALUES
========================================================= */

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
            getValue(
                "otherMultiplePO"
            )
        );

    }


    if (
        AppState.otherMode ===
        "excel"
    ) {

        return AppState.otherExcelRows
            .map(row => {

                if (
                    Array.isArray(row)
                ) {

                    return row[0];

                }

                return Object.values(
                    row
                )[0];

            })
            .map(
                value =>
                    String(
                        value ?? ""
                    ).trim()
            )
            .filter(
                Boolean
            );

    }

    return [];

}


/* =========================================================
   EXCEL
   FIRST ROW = HEADER
   DATA STARTS FROM ROW 2
========================================================= */

function readExcelFile(
    file,
    onData,
    previewId,
    fileNameId
) {

    if (!file) {
        return;
    }

    if (
        typeof window.XLSX ===
        "undefined"
    ) {

        showToast(
            "Excel library load नहीं हुई।",
            "error"
        );

        return;
    }


    if (fileNameId && $(fileNameId)) {

        $(fileNameId).textContent =
            file.name;

    }


    const reader =
        new FileReader();


    reader.onload =
        event => {

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
                 * IMPORTANT:
                 *
                 * ROW 1 = HEADER
                 *
                 * We intentionally remove it.
                 */

                const header =
                    rows.length
                        ? rows[0]
                        : [];


                const dataRows =
                    rows.slice(1);


                onData(
                    dataRows,
                    header
                );


                renderExcelPreview(
                    previewId,
                    header,
                    dataRows
                );


                showToast(
                    `Excel loaded: header ignored, ${dataRows.length} data row(s) found.`,
                    "success"
                );


            } catch (error) {

                console.error(
                    error
                );

                showToast(
                    "Excel file पढ़ने में error आया।",
                    "error"
                );

            }

        };


    reader.onerror =
        () => {

            showToast(
                "Excel file open नहीं हो सकी।",
                "error"
            );

        };


    reader.readAsArrayBuffer(
        file
    );

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

    if (!container) {
        return;
    }

    container.innerHTML = "";


    if (
        !header.length &&
        !rows.length
    ) {

        return;

    }


    const table =
        document.createElement(
            "table"
        );


    const thead =
        document.createElement(
            "thead"
        );


    const headRow =
        document.createElement(
            "tr"
        );


    header.forEach(
        cell => {

            const th =
                document.createElement(
                    "th"
                );

            th.textContent =
                String(
                    cell ?? ""
                );

            headRow.appendChild(
                th
            );

        }
    );


    thead.appendChild(
        headRow
    );


    const tbody =
        document.createElement(
            "tbody"
        );


    rows
        .slice(0, 100)
        .forEach(
            row => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                row.forEach(
                    cell => {

                        const td =
                            document.createElement(
                                "td"
                            );

                        td.textContent =
                            String(
                                cell ?? ""
                            );

                        tr.appendChild(
                            td
                        );

                    }
                );


                tbody.appendChild(
                    tr
                );

            }
        );


    table.appendChild(
        thead
    );

    table.appendChild(
        tbody
    );

    container.appendChild(
        table
    );

}


/* =========================================================
   EXCEL UPLOADS
========================================================= */

function initExcelUploads() {

    $("cocoExcelFile")
        ?.addEventListener(
            "change",
            event => {

                readExcelFile(

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

                readExcelFile(

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

                readExcelFile(

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
   PAGE SIZE
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
                    getNumber(
                        widthId,
                        70
                    ),

                height:
                    getNumber(
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

    let width =
        dimensions.width;

    let height =
        dimensions.height;


    if (
        orientation ===
        "landscape" &&
        height > width
    ) {

        [
            width,
            height
        ] = [
            height,
            width
        ];

    }


    if (
        orientation ===
        "portrait" &&
        width > height
    ) {

        [
            width,
            height
        ] = [
            height,
            width
        ];

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

            orientation:
                "orientation",

            panel:
                "customSizePanel",

            width:
                "customWidth",

            height:
                "customHeight",

            info:
                "selectedPageInfo"
        },


        {
            size:
                "otherPageSize",

            orientation:
                "otherOrientation",

            panel:
                "otherCustomSizePanel",

            width:
                "otherCustomWidth",

            height:
                "otherCustomHeight"
        },


        {
            size:
                "isbnPageSize",

            orientation:
                "isbnOrientation",

            panel:
                "isbnCustomSizePanel",

            width:
                "isbnCustomWidth",

            height:
                "isbnCustomHeight"
        },


        {
            size:
                "addressPageSize",

            orientation:
                "addressOrientation",

            panel:
                "addressCustomSizePanel",

            width:
                "addressCustomWidth",

            height:
                "addressCustomHeight"
        }

    ];


    configs.forEach(
        config => {

            const update =
                () => {

                    const isCustom =
                        getValue(
                            config.size
                        ) ===
                        "custom";


                    $(config.panel)
                        ?.classList.toggle(
                            "hidden",
                            !isCustom
                        );


                    if ($(config.width)) {

                        $(config.width)
                            .disabled =
                            !isCustom;

                    }


                    if ($(config.height)) {

                        $(config.height)
                            .disabled =
                            !isCustom;

                    }


                    if (config.info) {

                        const dimensions =
                            applyOrientation(

                                getPageSize(

                                    getValue(
                                        config.size,
                                        "4x6"
                                    ),

                                    config.width,

                                    config.height

                                ),

                                getValue(
                                    config.orientation,
                                    "portrait"
                                )

                            );


                        $(config.info)
                            .textContent =
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

        }
    );

}


/* =========================================================
   FEATURE LOCKING
========================================================= */

function setFeatureLocked(
    id,
    locked
) {

    const element =
        $(id);

    if (!element) {
        return;
    }

    element.disabled =
        locked;


    element
        .closest(
            ".feature-check"
        )
        ?.classList.toggle(
            "locked",
            locked
        );

}


/* =========================================================
   FEATURE RULES
========================================================= */

function applyFeatureRules() {

    const poPlusBox =
        isChecked(
            "poPlusBoxCheck"
        );


    const combinedBorder =
        isChecked(
            "combinedBorderCheck"
        );


    /*
     * PO + BOX
     */

    if (poPlusBox) {

        if ($("poNumberCheck")) {
            $("poNumberCheck")
                .checked = false;
        }

        if ($("boxNumberCheck")) {
            $("boxNumberCheck")
                .checked = false;
        }


        setFeatureLocked(
            "poNumberCheck",
            true
        );

        setFeatureLocked(
            "boxNumberCheck",
            true
        );

    } else {

        setFeatureLocked(
            "poNumberCheck",
            false
        );

        setFeatureLocked(
            "boxNumberCheck",
            false
        );

    }


    /*
     * COMBINED BORDER
     */

    if (combinedBorder) {

        if ($("poBorderCheck")) {
            $("poBorderCheck")
                .checked = false;
        }

        if ($("boxBorderCheck")) {
            $("boxBorderCheck")
                .checked = false;
        }


        setFeatureLocked(
            "poBorderCheck",
            true
        );

        setFeatureLocked(
            "boxBorderCheck",
            true
        );

    } else {

        setFeatureLocked(
            "poBorderCheck",
            false
        );

        setFeatureLocked(
            "boxBorderCheck",
            false
        );

    }

}


/* =========================================================
   FEATURE NAMES
========================================================= */

function featureName(id) {

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


    return (
        names[id] ||
        "Function"
    );

}


/* =========================================================
   FEATURE EVENTS
========================================================= */

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


    ids.forEach(
        id => {

            $(id)?.addEventListener(
                "change",
                () => {

                    const enabled =
                        isChecked(id);


                    /*
                     * User explicitly requested:
                     *
                     * ENABLE  = GREEN
                     * DISABLE = RED
                     */

                    showToast(

                        `${featureName(id)} ${enabled ? "enabled" : "disabled"}.`,

                        enabled
                            ? "success"
                            : "error"

                    );


                    if (
                        id ===
                        "poPlusBoxCheck"
                    ) {

                        applyFeatureRules();

                    }


                    if (
                        id ===
                        "combinedBorderCheck"
                    ) {

                        applyFeatureRules();

                    }


                    updateLivePreview();

                }
            );

        }
    );


    applyFeatureRules();

}


/* =========================================================
   FONT HELPERS
========================================================= */

function getFontSettings(
    familyId,
    sizeId,
    boldId,
    italicId,
    underlineId
) {

    return {

        family:
            getValue(
                familyId,
                "Arial"
            ),

        size:
            getNumber(
                sizeId,
                20
            ),

        bold:
            isChecked(
                boldId
            ),

        italic:
            isChecked(
                italicId
            ),

        underline:
            isChecked(
                underlineId
            )

    };

}


function applyPreviewFont(
    element,
    font
) {

    if (!element) {
        return;
    }


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

    if (!page) {
        return;
    }


    const dimensions =
        applyOrientation(

            getPageSize(

                getValue(
                    "pageSize",
                    "4x6"
                ),

                "customWidth",

                "customHeight"

            ),

            getValue(
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
                dimensions.width * 2.8
            );

        height =
            width / ratio;

    } else {

        height =
            Math.min(
                maxHeight,
                dimensions.height * 2.8
            );

        width =
            height * ratio;

    }


    page.style.width =
        `${Math.max(
            90,
            width
        )}px`;


    page.style.height =
        `${Math.max(
            90,
            height
        )}px`;


    const pageBorder =
        isChecked(
            "pageBorderCheck"
        );


    page.style.border =
        pageBorder
            ? "2px solid #111827"
            : "1px solid #cbd5e1";


    const sizeText =
        $("previewPageSize");


    if (sizeText) {

        const selected =
            getValue(
                "pageSize",
                "4x6"
            );


        const orientation =
            getValue(
                "orientation",
                "portrait"
            );


        let text;


        if (
            selected ===
            "70x35"
        ) {

            text =
                "70 × 35 mm";

        } else if (
            selected ===
            "a4"
        ) {

            text =
                "A4";

        } else if (
            selected ===
            "custom"
        ) {

            text =
                `${dimensions.width.toFixed(1)} × ${dimensions.height.toFixed(1)} mm`;

        } else {

            text =
                "4 × 6 Inches";

        }


        sizeText.textContent =
            `${text} • ${orientation}`;

    }

}


/* =========================================================
   LIVE PO PREVIEW
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


    const poValues =
        getCocoPOValues();


    /*
     * IMPORTANT:
     *
     * Only actual PO value.
     *
     * NO "PO NUMBER".
     */

    const po =
        poValues[0] ||
        "ABC123";


    const box =
        getNumber(
            "startBoxNumber",
            1
        );


    const poEnabled =
        isChecked(
            "poNumberCheck",
            true
        );


    const boxEnabled =
        isChecked(
            "boxNumberCheck",
            true
        );


    const poPlusBox =
        isChecked(
            "poPlusBoxCheck"
        );


    const combinedBorder =
        isChecked(
            "combinedBorderCheck"
        );


    const poBorder =
        isChecked(
            "poBorderCheck"
        );


    const boxBorder =
        isChecked(
            "boxBorderCheck"
        );


    const cutLine =
        isChecked(
            "cutLineCheck"
        );


    /*
     * ACTUAL PO VALUE
     */

    poElement.textContent =
        po;


    /*
     * BOX FORMAT
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
     * Always vertical:
     *
     * PO
     *
     * BOX NO. 123
     */

    label.style.flexDirection =
        "column";


    label.style.gap =
        "10px";


    /*
     * Borders
     */

    label.classList.toggle(
        "combined-border",
        combinedBorder
    );


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
     * Fonts
     */

    applyPreviewFont(

        poElement,

        getFontSettings(

            "poFontFamily",

            "poFontSize",

            "poBoldCheck",

            "poItalicCheck",

            "poUnderlineCheck"

        )

    );


    applyPreviewFont(

        boxElement,

        getFontSettings(

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

    [
        "isbnValue",
        "isbnBookTitle",
        "isbnEdition"
    ].forEach(
        id => {

            $(id)?.addEventListener(
                "input",
                generateISBNBarcode
            );

        }
    );


    generateISBNBarcode();

}


function generateISBNBarcode() {

    const svg =
        $("isbnBarcodeSvg");

    if (!svg) {
        return;
    }


    svg.innerHTML =
        "";


    const text =
        getValue(
            "isbnValue"
        );


    if (!text) {

        if ($("isbnBarcodeText")) {

            $("isbnBarcodeText")
                .textContent =
                "Enter ISBN to preview";

        }

        return;

    }


    if (
        typeof window.JsBarcode !==
        "function"
    ) {

        if ($("isbnBarcodeText")) {

            $("isbnBarcodeText")
                .textContent =
                "Barcode library not loaded.";

        }

        return;

    }


    try {

        JsBarcode(
            svg,
            text,
            {

                format:
                    "EAN13",

                displayValue:
                    true,

                width:
                    2,

                height:
                    70,

                margin:
                    10

            }
        );


    } catch (error) {

        try {

            JsBarcode(
                svg,
                text,
                {

                    format:
                        "CODE128",

                    displayValue:
                        true,

                    width:
                        2,

                    height:
                        70,

                    margin:
                        10

                }
            );

        } catch {

            if ($("isbnBarcodeText")) {

                $("isbnBarcodeText")
                    .textContent =
                    "Invalid barcode value.";

            }

        }

    }

}


/* =========================================================
   QR GENERATOR
========================================================= */

function createQRCode(
    elementId,
    text
) {

    const container =
        $(elementId);

    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        typeof window.QRCode !==
        "object" &&
        typeof window.QRCode !==
        "function"
    ) {

        container.textContent =
            "QR library not loaded.";

        return;

    }


    const canvas =
        document.createElement(
            "canvas"
        );


    QRCode.toCanvas(

        canvas,

        text,

        {

            width:
                170,

            margin:
                2,

            errorCorrectionLevel:
                "M"

        },

        error => {

            if (error) {

                console.error(
                    "QR Error:",
                    error
                );

                container.textContent =
                    "QR generation failed.";

                return;

            }


            container.innerHTML =
                "";

            container.appendChild(
                canvas
            );

        }

    );

}


/* =========================================================
   QR INIT
========================================================= */

function initQRCodes() {

    createQRCode(

        "addressQRPreview",

        "https://maps.google.com/"

    );


    createQRCode(

        "emailQRPreview",

        "mailto:ashish.verma@bookswagon.in"

    );

}


/* =========================================================
   PDF DIMENSIONS
========================================================= */

function getPDFDimensions(
    size,
    orientation,
    widthId,
    heightId
) {

    return applyOrientation(

        getPageSize(
            size,
            widthId,
            heightId
        ),

        orientation

    );

}


/* =========================================================
   PDF FONT STYLE
========================================================= */

function getPDFFontStyle(
    font
) {

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
        isChecked(
            "poNumberCheck",
            true
        );


    const boxEnabled =
        isChecked(
            "boxNumberCheck",
            true
        );


    const poPlusBox =
        isChecked(
            "poPlusBoxCheck"
        );


    const combinedBorder =
        isChecked(
            "combinedBorderCheck"
        );


    const poBorder =
        isChecked(
            "poBorderCheck"
        );


    const boxBorder =
        isChecked(
            "boxBorderCheck"
        );


    const cutLine =
        isChecked(
            "cutLineCheck"
        );


    /*
     * Combined border
     */

    if (combinedBorder) {

        doc.setDrawColor(
            17,
            24,
            39
        );

        doc.setLineWidth(
            0.7
        );

        doc.rect(
            x,
            y,
            width,
            height
        );

    }


    /*
     * Cut line
     */

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
        y +
        height / 2;


    if (
        showPO &&
        showBox
    ) {

        centerY -= 7;

    }


    /*
     * PO
     *
     * ONLY ACTUAL VALUE.
     */

    if (showPO) {

        const font =
            getFontSettings(

                "poFontFamily",

                "poFontSize",

                "poBoldCheck",

                "poItalicCheck",

                "poUnderlineCheck"

            );


        doc.setFont(
            font.family,
            getPDFFontStyle(
                font
            )
        );


        doc.setFontSize(
            font.size
        );


        const lines =
            doc.splitTextToSize(
                String(po),
                width - 10
            );


        doc.text(
            lines,
            x +
                width / 2,
            centerY,
            {
                align:
                    "center"
            }
        );


        if (
            poBorder &&
            !combinedBorder
        ) {

            doc.rect(
                x + 4,

                centerY -
                    font.size / 2 -
                    2,

                width - 8,

                font.size + 5
            );

        }


        centerY +=
            font.size +
            10;

    }


    /*
     * BOX
     *
     * BOX NO. 123
     */

    if (showBox) {

        const font =
            getFontSettings(

                "boxFontFamily",

                "boxFontSize",

                "boxBoldCheck",

                "boxItalicCheck",

                "boxUnderlineCheck"

            );


        doc.setFont(
            font.family,
            getPDFFontStyle(
                font
            )
        );


        doc.setFontSize(
            font.size
        );


        const boxText =
            `BOX NO. ${box}`;


        doc.text(
            boxText,

            x +
                width / 2,

            centerY,

            {
                align:
                    "center"
            }
        );


        if (
            boxBorder &&
            !combinedBorder
        ) {

            doc.rect(

                x + 4,

                centerY -
                    font.size / 2 -
                    2,

                width - 8,

                font.size + 5

            );

        }

    }

}


/* =========================================================
   COCO PDF
========================================================= */

function generateCocoPDF() {

    /*
     * IMPORTANT:
     *
     * Correct jsPDF access:
     *
     * window.jspdf.jsPDF
     */

    if (!checkPDFLibrary()) {
        return;
    }


    const jsPDF =
        getJsPDF();


    const dimensions =
        getPDFDimensions(

            getValue(
                "pageSize",
                "4x6"
            ),

            getValue(
                "orientation",
                "portrait"
            ),

            "customWidth",

            "customHeight"

        );


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const doc =
        new jsPDF({

            orientation:
                orientation,

            unit:
                "mm",

            format: [
                dimensions.width,
                dimensions.height
            ]

        });


    let poValues =
        getCocoPOValues();


    /*
     * If nothing is entered,
     * keep a useful preview/sample.
     */

    if (!poValues.length) {

        poValues = [
            "ABC123"
        ];

    }


    const startBox =
        Math.max(
            1,
            getNumber(
                "startBoxNumber",
                1
            )
        );


    const endBox =
        Math.max(
            startBox,
            getNumber(
                "endBoxNumber",
                startBox
            )
        );


    const repeat =
        Math.max(
            1,
            getNumber(
                "boxRepeatCount",
                1
            )
        );


    const labelsPerPage =
        Math.max(
            1,
            getNumber(
                "labelsPerPage",
                2
            )
        );


    const gap =
        Math.max(
            1,
            getNumber(
                "labelGap",
                2
            )
        );


    const labels = [];


    poValues.forEach(
        po => {

            for (
                let repeatIndex = 0;
                repeatIndex < repeat;
                repeatIndex++
            ) {

                for (
                    let box = startBox;
                    box <= endBox;
                    box++
                ) {

                    labels.push({

                        po:
                            po,

                        box:
                            box

                    });

                }

            }

        }
    );


    if (!labels.length) {

        labels.push({

            po:
                "ABC123",

            box:
                startBox

        });

    }


    for (
        let pageStart = 0;

        pageStart <
        labels.length;

        pageStart +=
            labelsPerPage

    ) {


        if (pageStart > 0) {

            doc.addPage(

                [
                    dimensions.width,
                    dimensions.height
                ],

                orientation

            );

        }


        const pageLabels =
            labels.slice(

                pageStart,

                pageStart +
                    labelsPerPage

            );


        const pageBorder =
            isChecked(
                "pageBorderCheck"
            );


        if (pageBorder) {

            doc.setDrawColor(
                17,
                24,
                39
            );

            doc.setLineWidth(
                0.6
            );

            doc.rect(
                2,
                2,
                dimensions.width - 4,
                dimensions.height - 4
            );

        }


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


        pageLabels.forEach(
            (
                item,
                index
            ) => {

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

    if (!checkPDFLibrary()) {
        return;
    }


    const jsPDF =
        getJsPDF();


    const dimensions =
        getPDFDimensions(

            getValue(
                "otherPageSize",
                "4x6"
            ),

            getValue(
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

            unit:
                "mm",

            format: [
                dimensions.width,
                dimensions.height
            ]

        });


    const values =
        getOtherPOValues();


    const poValues =
        values.length
            ? values
            : ["ABC123"];


    poValues.forEach(
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
                    align:
                        "center"
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

    if (!checkPDFLibrary()) {
        return;
    }


    const jsPDF =
        getJsPDF();


    const dimensions =
        getPDFDimensions(

            getValue(
                "isbnPageSize",
                "4x6"
            ),

            getValue(
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

            unit:
                "mm",

            format: [
                dimensions.width,
                dimensions.height
            ]

        });


    const isbn =
        getValue(
            "isbnValue",
            "ISBN"
        );


    const title =
        getValue(
            "isbnBookTitle",
            "ISBN BARCODE"
        );


    const edition =
        getValue(
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
            align:
                "center"
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
            align:
                "center"
        }

    );


    if (edition) {

        doc.text(

            edition,

            dimensions.width / 2,

            35,

            {
                align:
                    "center"
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
   SIMPLE PDF BARCODE
========================================================= */

function drawSimpleBarcode(
    doc,
    text,
    x,
    y,
    width,
    height
) {

    const value =
        String(
            text
        );


    const unit =
        width /
        Math.max(
            1,
            value.length * 12
        );


    let cursor =
        x;


    value.split("")
        .forEach(
            char => {

                const code =
                    char.charCodeAt(0);


                for (
                    let bit = 0;
                    bit < 8;
                    bit++
                ) {

                    if (
                        (code >> bit) &
                        1
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
                                0.25,
                                unit
                            ),

                            height,

                            "F"

                        );

                    }


                    cursor +=
                        unit;

                }


                cursor +=
                    unit * 3;

            }
        );


    doc.setFontSize(
        8
    );


    doc.setTextColor(
        0,
        0,
        0
    );


    doc.text(

        value,

        x +
            width / 2,

        y +
            height +
            5,

        {
            align:
                "center"
        }

    );

}


/* =========================================================
   ADDRESS PDF
========================================================= */

function getAddressValues() {

    let from =
        getValue(
            "addressFrom",
            "FROM ADDRESS"
        );


    let to =
        getValue(
            "addressTo",
            "TO ADDRESS"
        );


    /*
     * Excel:
     *
     * first row already removed.
     */

    if (
        AppState.addressMode ===
        "excel" &&

        AppState.addressExcelRows.length
    ) {

        const row =
            AppState.addressExcelRows[0];


        if (
            Array.isArray(row)
        ) {

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


    return {
        from,
        to
    };

}


function generateAddressPDF() {

    if (!checkPDFLibrary()) {
        return;
    }


    const jsPDF =
        getJsPDF();


    const dimensions =
        getPDFDimensions(

            getValue(
                "addressPageSize",
                "4x6"
            ),

            getValue(
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

            unit:
                "mm",

            format: [
                dimensions.width,
                dimensions.height
            ]

        });


    const addresses =
        getAddressValues();


    const margin =
        8;

    const gap =
        5;


    const boxWidth =
        (
            dimensions.width -
            margin * 2 -
            gap
        ) / 2;


    const boxHeight =
        dimensions.height -
        margin * 2;


    drawAddressBox(

        doc,

        addresses.from,

        margin,

        margin,

        boxWidth,

        boxHeight,

        {

            family:
                getValue(
                    "fromFontFamily",
                    "Arial"
                ),

            size:
                getNumber(
                    "fromFontSize",
                    14
                ),

            bold:
                isChecked(
                    "fromBold"
                ),

            italic:
                isChecked(
                    "fromItalic"
                ),

            underline:
                isChecked(
                    "fromUnderline"
                ),

            border:
                isChecked(
                    "fromBorder"
                )

        }

    );


    drawAddressBox(

        doc,

        addresses.to,

        margin +
            boxWidth +
            gap,

        margin,

        boxWidth,

        boxHeight,

        {

            family:
                getValue(
                    "toFontFamily",
                    "Arial"
                ),

            size:
                getNumber(
                    "toFontSize",
                    14
                ),

            bold:
                isChecked(
                    "toBold"
                ),

            italic:
                isChecked(
                    "toItalic"
                ),

            underline:
                isChecked(
                    "toUnderline"
                ),

            border:
                isChecked(
                    "toBorder"
                )

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
   DRAW ADDRESS BOX
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

        doc.setLineWidth(
            0.5
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
            String(text),
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

            $(`cocoPO${i}`)
                .value = "";

        }

    }


    if ($("cocoMultiplePO")) {

        $("cocoMultiplePO")
            .value = "";

    }


    if ($("startBoxNumber")) {

        $("startBoxNumber")
            .value = "1";

    }


    if ($("endBoxNumber")) {

        $("endBoxNumber")
            .value = "10";

    }


    if ($("boxRepeatCount")) {

        $("boxRepeatCount")
            .value = "1";

    }


    if ($("labelsPerPage")) {

        $("labelsPerPage")
            .value = "2";

    }


    if ($("pageSize")) {

        $("pageSize")
            .value = "4x6";

    }


    if ($("orientation")) {

        $("orientation")
            .value = "portrait";

    }


    const defaults = {

        poNumberCheck:
            true,

        boxNumberCheck:
            true,

        poPlusBoxCheck:
            false,

        combinedBorderCheck:
            false,

        poBorderCheck:
            false,

        boxBorderCheck:
            false,

        cutLineCheck:
            false,

        pageBorderCheck:
            false,

        samePOPageFlow:
            false,

        halfPageFlowCheck:
            false

    };


    Object.entries(
        defaults
    ).forEach(
        ([id, state]) => {

            if ($(id)) {

                $(id).checked =
                    state;

            }

        }
    );


    applyFeatureRules();

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

            $(`otherPO${i}`)
                .value = "";

        }

    }


    if ($("otherMultiplePO")) {

        $("otherMultiplePO")
            .value = "";

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
    ].forEach(
        id => {

            if ($(id)) {

                $(id).value =
                    "";

            }

        }
    );


    if ($("isbnBarcodeSvg")) {

        $("isbnBarcodeSvg")
            .innerHTML = "";

    }


    if ($("isbnBarcodeText")) {

        $("isbnBarcodeText")
            .textContent =
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
    ].forEach(
        id => {

            if ($(id)) {

                $(id).value =
                    "";

            }

        }
    );


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
   ALL LIVE INPUTS
========================================================= */

function initLiveControls() {

    $$(
        "input:not([type='file']), textarea, select"
    ).forEach(
        element => {

            element.addEventListener(
                "input",
                () => {

                    updateLivePreview();

                }
            );


            element.addEventListener(
                "change",
                () => {

                    updateLivePreview();

                }
            );

        }
    );

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


                    showToast(
                        "Hindi enabled.",
                        "success"
                    );


                } else {

                    if (title) {

                        title.textContent =
                            "Books Label Studio";

                    }


                    if (subtitle) {

                        subtitle.textContent =
                            "Professional Label & Barcode Generator";

                    }


                    showToast(
                        "English enabled.",
                        "success"
                    );

                }

            }
        );

}


/* =========================================================
   MODAL
========================================================= */

function initModal() {

    const modal =
        $("confirmationModal");


    const close =
        () => {

            modal
                ?.classList.remove(
                    "show"
                );

            modal
                ?.setAttribute(
                    "aria-hidden",
                    "true"
                );

        };


    $("modalCloseButton")
        ?.addEventListener(
            "click",
            close
        );


    $("modalCancelButton")
        ?.addEventListener(
            "click",
            close
        );


    modal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                close();

            }

        }
    );

}


/* =========================================================
   STARTUP
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

    initModal();

    updateLivePreview();


    console.log(
        "===================================="
    );

    console.log(
        "Books Label Studio loaded."
    );

    console.log(
        "jsPDF:",
        getJsPDF()
            ? "READY"
            : "NOT LOADED"
    );

    console.log(
        "XLSX:",
        typeof window.XLSX ===
        "undefined"
            ? "NOT LOADED"
            : "READY"
    );

    console.log(
        "QRCode:",
        typeof window.QRCode ===
        "undefined"
            ? "NOT LOADED"
            : "READY"
    );

    console.log(
        "JsBarcode:",
        typeof window.JsBarcode ===
        "undefined"
            ? "NOT LOADED"
            : "READY"
    );

    console.log(
        "===================================="
    );


    /*
     * Only warn here.
     * Don't block the website.
     */

    if (!getJsPDF()) {

        console.warn(
            "PDF library is not available."
        );

    }

}


/* =========================================================
   DOM READY
========================================================= */

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
