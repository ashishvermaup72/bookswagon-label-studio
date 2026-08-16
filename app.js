/* =========================================================
   BOOKS LABEL STUDIO
   FINAL APP.JS
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

const AppState = {

    language: "en",

    category: "cocoBlue",

    cocoMode: "individual",

    otherMode: "individual",

    addressMode: "manual",

    pageSize: "4x6",

    orientation: "portrait",

    customWidth: 70,

    customHeight: 35,

    labelsPerPage: 2,

    cocoPOs: [],

    otherPOs: [],

    cocoExcelRows: [],

    otherExcelRows: [],

    addressExcelRows: [],

    toastTimer: null

};


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);


function all(selector) {
    return Array.from(document.querySelectorAll(selector));
}


function safeNumber(value, fallback = 0) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "success") {

    const toast = $("toast");
    const toastMessage = $("toastMessage");
    const toastIcon = $("toastIcon");

    if (!toast || !toastMessage) {
        return;
    }

    clearTimeout(AppState.toastTimer);

    toast.classList.remove(
        "success",
        "error",
        "warning",
        "show"
    );

    if (type === "success") {

        toast.classList.add("success");

        if (toastIcon) {
            toastIcon.textContent = "✓";
        }

    } else {

        toast.classList.add("error");

        if (toastIcon) {
            toastIcon.textContent = "!";
        }

    }

    toastMessage.textContent = message;

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    AppState.toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2600);
}


/* =========================================================
   CATEGORY SWITCHING
========================================================= */

function switchCategory(category) {

    AppState.category = category;

    all(".category-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.category === category
        );

    });


    all(".tool-section").forEach(section => {

        section.classList.toggle(
            "active",
            section.dataset.tool === category
        );

    });


    updateLivePreview();

}


function initCategoryNavigation() {

    all(".category-btn").forEach(button => {

        button.addEventListener("click", () => {

            switchCategory(
                button.dataset.category
            );

        });

    });

}


/* =========================================================
   COCO SUB CATEGORIES
========================================================= */

function switchCocoMode(mode) {

    AppState.cocoMode = mode;

    all("[data-coco-mode]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.cocoMode === mode
        );

    });


    const panels = {

        individual: "cocoIndividualPanel",

        multiple: "cocoMultiplePanel",

        excel: "cocoExcelPanel",

        address: "cocoAddressPanel"

    };


    Object.entries(panels).forEach(
        ([key, id]) => {

            const panel = $(id);

            if (!panel) {
                return;
            }

            panel.classList.toggle(
                "active",
                key === mode
            );

        }
    );


    updateLivePreview();

}


function initCocoModes() {

    all("[data-coco-mode]").forEach(button => {

        button.addEventListener("click", () => {

            switchCocoMode(
                button.dataset.cocoMode
            );

        });

    });

}


/* =========================================================
   OTHER PO SUB CATEGORIES
========================================================= */

function switchOtherMode(mode) {

    AppState.otherMode = mode;

    all("[data-other-mode]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.otherMode === mode
        );

    });


    const panels = {

        individual: "otherIndividualPanel",

        multiple: "otherMultiplePanel",

        excel: "otherExcelPanel",

        address: "otherAddressPanel"

    };


    Object.entries(panels).forEach(
        ([key, id]) => {

            const panel = $(id);

            if (!panel) {
                return;
            }

            panel.classList.toggle(
                "active",
                key === mode
            );

        }
    );

}


function initOtherModes() {

    all("[data-other-mode]").forEach(button => {

        button.addEventListener("click", () => {

            switchOtherMode(
                button.dataset.otherMode
            );

        });

    });

}


/* =========================================================
   ADDRESS MODES
========================================================= */

function switchAddressMode(mode) {

    AppState.addressMode = mode;

    all("[data-address-mode]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.addressMode === mode
        );

    });


    const manual = $("addressManualPanel");
    const excel = $("addressExcelPanel");

    if (manual) {
        manual.classList.toggle(
            "active",
            mode === "manual"
        );
    }

    if (excel) {
        excel.classList.toggle(
            "active",
            mode === "excel"
        );
    }

}


function initAddressModes() {

    all("[data-address-mode]").forEach(button => {

        button.addEventListener("click", () => {

            switchAddressMode(
                button.dataset.addressMode
            );

        });

    });

}


/* =========================================================
   CREATE 40 PO INPUTS
========================================================= */

function createPOInputs(containerId, prefix) {

    const container = $(containerId);

    if (!container) {
        return;
    }

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
   GET MANUAL PO VALUES
========================================================= */

function getManualPOValues(prefix) {

    const values = [];

    for (let i = 1; i <= 40; i++) {

        const input =
            $(`${prefix}${i}`);

        if (!input) {
            continue;
        }

        const value =
            input.value.trim();

        if (value) {
            values.push(value);
        }

    }

    return values;
}


/* =========================================================
   MULTIPLE PO PARSER
========================================================= */

function parseMultipleValues(value) {

    if (!value) {
        return [];
    }

    return value
        .split(/[\n,;]+/)
        .map(item => item.trim())
        .filter(Boolean);
}


/* =========================================================
   GET COCO PO VALUES
========================================================= */

function getCocoPOValues() {

    if (AppState.cocoMode === "individual") {

        return getManualPOValues(
            "cocoPO"
        );

    }


    if (AppState.cocoMode === "multiple") {

        return parseMultipleValues(
            $("cocoMultiplePO")?.value
        );

    }


    if (AppState.cocoMode === "excel") {

        return AppState.cocoExcelRows
            .map(row => {

                if (Array.isArray(row)) {
                    return row[0];
                }

                return Object.values(row)[0];

            })
            .map(value =>
                String(value ?? "").trim()
            )
            .filter(Boolean);

    }


    return ["PO NUMBER"];
}


/* =========================================================
   GET OTHER PO VALUES
========================================================= */

function getOtherPOValues() {

    if (AppState.otherMode === "individual") {

        return getManualPOValues(
            "otherPO"
        );

    }


    if (AppState.otherMode === "multiple") {

        return parseMultipleValues(
            $("otherMultiplePO")?.value
        );

    }


    if (AppState.otherMode === "excel") {

        return AppState.otherExcelRows
            .map(row => {

                if (Array.isArray(row)) {
                    return row[0];
                }

                return Object.values(row)[0];

            })
            .map(value =>
                String(value ?? "").trim()
            )
            .filter(Boolean);

    }


    return ["PO NUMBER"];
}


/* =========================================================
   EXCEL FILE READER
========================================================= */

function readExcelFile(
    file,
    onComplete,
    fileNameElement,
    previewElement
) {

    if (!file) {
        return;
    }

    if (
        typeof XLSX === "undefined"
    ) {

        showToast(
            "Excel library could not be loaded.",
            "error"
        );

        return;
    }


    if (fileNameElement) {

        fileNameElement.textContent =
            file.name;

    }


    const reader =
        new FileReader();


    reader.onload = function(event) {

        try {

            const data =
                new Uint8Array(
                    event.target.result
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


            /*
             * header: 1 means array-of-arrays.
             * FIRST ROW IS HEADER.
             */

            const rows =
                XLSX.utils.sheet_to_json(
                    firstSheet,
                    {
                        header: 1,
                        defval: ""
                    }
                );


            /*
             * IMPORTANT:
             * First row is intentionally ignored.
             */

            const dataRows =
                rows.slice(1);


            onComplete(
                dataRows,
                rows
            );


            if (previewElement) {

                renderExcelPreview(
                    rows
                );

            }


            showToast(
                `Excel loaded. Header row ignored. ${dataRows.length} data rows found.`,
                "success"
            );

        } catch (error) {

            console.error(error);

            showToast(
                "Could not read the Excel file.",
                "error"
            );

        }

    };


    reader.onerror = function() {

        showToast(
            "Could not open the selected file.",
            "error"
        );

    };


    reader.readAsArrayBuffer(file);

}


/* =========================================================
   EXCEL PREVIEW
========================================================= */

function renderExcelPreview(rows) {

    if (!rows || !rows.length) {
        return "";
    }


    const preview =
        document.createElement("table");


    const header =
        document.createElement("thead");


    const headerRow =
        document.createElement("tr");


    rows[0].forEach(cell => {

        const th =
            document.createElement("th");

        th.textContent =
            String(cell ?? "");

        headerRow.appendChild(th);

    });


    header.appendChild(headerRow);


    const body =
        document.createElement("tbody");


    rows.slice(1, 21).forEach(row => {

        const tr =
            document.createElement("tr");


        row.forEach(cell => {

            const td =
                document.createElement("td");

            td.textContent =
                String(cell ?? "");

            tr.appendChild(td);

        });


        body.appendChild(tr);

    });


    preview.appendChild(header);
    preview.appendChild(body);


    return preview;
}


function setExcelPreview(
    containerId,
    rows
) {

    const container =
        $(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const table =
        renderExcelPreview(rows);

    if (table) {
        container.appendChild(table);
    }

}


/* =========================================================
   EXCEL EVENTS
========================================================= */

function initExcelUploads() {

    const cocoFile =
        $("cocoExcelFile");

    if (cocoFile) {

        cocoFile.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];

                readExcelFile(
                    file,

                    rows => {

                        AppState.cocoExcelRows =
                            rows;

                        setExcelPreview(
                            "cocoExcelPreview",
                            [
                                ...[
                                    ["PO Number"]
                                ],
                                ...rows
                            ]
                        );

                        updateLivePreview();

                    },

                    $("cocoExcelFileName"),

                    $("cocoExcelPreview")
                );

            }
        );

    }


    const otherFile =
        $("otherExcelFile");

    if (otherFile) {

        otherFile.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];

                readExcelFile(
                    file,

                    rows => {

                        AppState.otherExcelRows =
                            rows;

                        setExcelPreview(
                            "otherExcelPreview",
                            [
                                ...[
                                    ["PO Number"]
                                ],
                                ...rows
                            ]
                        );

                    },

                    $("otherExcelFileName"),

                    $("otherExcelPreview")
                );

            }
        );

    }


    const addressFile =
        $("addressExcelFile");

    if (addressFile) {

        addressFile.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];

                readExcelFile(
                    file,

                    rows => {

                        AppState.addressExcelRows =
                            rows;

                        setExcelPreview(
                            "addressExcelPreview",
                            [
                                ...[
                                    [
                                        "From",
                                        "To"
                                    ]
                                ],
                                ...rows
                            ]
                        );

                    },

                    null,

                    $("addressExcelPreview")
                );

            }
        );

    }

}


/* =========================================================
   PAGE SIZE CONFIG
========================================================= */

function getPageDimensions(size) {

    switch (size) {

        case "4x6":

            return {
                width: 101.6,
                height: 152.4,
                label: "4 × 6 Inches"
            };


        case "70x35":

            /*
             * WIDTH = 70 mm
             * HEIGHT = 35 mm
             */

            return {
                width: 70,
                height: 35,
                label: "70 × 35 mm"
            };


        case "a4":

            return {
                width: 210,
                height: 297,
                label: "A4"
            };


        case "custom":

            return {
                width:
                    safeNumber(
                        $("customWidth")?.value,
                        70
                    ),

                height:
                    safeNumber(
                        $("customHeight")?.value,
                        35
                    ),

                label: "Custom Size"
            };


        default:

            return {
                width: 101.6,
                height: 152.4,
                label: "4 × 6 Inches"
            };

    }

}


/* =========================================================
   APPLY ORIENTATION
========================================================= */

function applyOrientation(
    dimensions,
    orientation
) {

    let width =
        dimensions.width;

    let height =
        dimensions.height;


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
   PAGE SIZE CONTROLS
========================================================= */

function updateCustomSizeState(
    selectId,
    panelId,
    widthId,
    heightId,
    infoId
) {

    const select =
        $(selectId);

    if (!select) {
        return;
    }


    const panel =
        $(panelId);

    const widthInput =
        $(widthId);

    const heightInput =
        $(heightId);

    const isCustom =
        select.value === "custom";


    if (panel) {

        panel.classList.toggle(
            "hidden",
            !isCustom
        );

    }


    if (widthInput) {

        widthInput.disabled =
            !isCustom;

    }


    if (heightInput) {

        heightInput.disabled =
            !isCustom;

    }


    if (infoId) {

        const info =
            $(infoId);

        if (info) {

            let dimensions =
                getPageDimensions(
                    select.value
                );


            if (
                select.value !== "custom"
            ) {

                dimensions =
                    applyOrientation(
                        dimensions,
                        getOrientationForSelect(
                            selectId
                        )
                    );

            }


            info.textContent =
                `${dimensions.width} × ${dimensions.height} mm`;

        }

    }

}


function getOrientationForSelect(
    selectId
) {

    const map = {

        pageSize:
            "orientation",

        otherPageSize:
            "otherOrientation",

        isbnPageSize:
            "isbnOrientation",

        addressPageSize:
            "addressOrientation"

    };


    const id =
        map[selectId];

    return $(id)?.value ||
        "portrait";
}


/* =========================================================
   PAGE SETTINGS EVENTS
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

        const size =
            $(config.size);

        const orientation =
            $(config.orientation);

        if (size) {

            size.addEventListener(
                "change",
                () => {

                    updateCustomSizeState(
                        config.size,
                        config.panel,
                        config.width,
                        config.height,
                        config.info
                    );

                    updateLivePreview();

                }
            );

        }


        if (orientation) {

            orientation.addEventListener(
                "change",
                () => {

                    updateCustomSizeState(
                        config.size,
                        config.panel,
                        config.width,
                        config.height,
                        config.info
                    );

                    updateLivePreview();

                }
            );

        }


        const width =
            $(config.width);

        const height =
            $(config.height);

        if (width) {

            width.addEventListener(
                "input",
                updateLivePreview
            );

        }

        if (height) {

            height.addEventListener(
                "input",
                updateLivePreview
            );

        }

    });


    updateCustomSizeState(
        "pageSize",
        "customSizePanel",
        "customWidth",
        "customHeight",
        "selectedPageInfo"
    );

    updateCustomSizeState(
        "otherPageSize",
        "otherCustomSizePanel",
        "otherCustomWidth",
        "otherCustomHeight"
    );

    updateCustomSizeState(
        "isbnPageSize",
        "isbnCustomSizePanel",
        "isbnCustomWidth",
        "isbnCustomHeight"
    );

    updateCustomSizeState(
        "addressPageSize",
        "addressCustomSizePanel",
        "addressCustomWidth",
        "addressCustomHeight"
    );

}


/* =========================================================
   PO + BOX CHECKBOX LOGIC
========================================================= */

function setLocked(
    element,
    locked
) {

    if (!element) {
        return;
    }

    element.disabled =
        locked;

    const label =
        element.closest(
            ".feature-check"
        );

    if (label) {

        label.classList.toggle(
            "locked",
            locked
        );

    }

}


/* =========================================================
   LABEL FEATURE LOGIC
========================================================= */

function updateLabelFeatureState(
    showToastMessage = false
) {

    const po =
        $("poNumberCheck");

    const box =
        $("boxNumberCheck");

    const poPlusBox =
        $("poPlusBoxCheck");

    const combined =
        $("combinedBorderCheck");

    const poBorder =
        $("poBorderCheck");

    const boxBorder =
        $("boxBorderCheck");


    /*
     * PO + BOX freezes individual PO and BOX.
     */

    if (poPlusBox?.checked) {

        if (po) {
            po.checked = false;
        }

        if (box) {
            box.checked = false;
        }

        setLocked(
            po,
            true
        );

        setLocked(
            box,
            true
        );

    } else {

        setLocked(
            po,
            false
        );

        setLocked(
            box,
            false
        );

        /*
         * Default to both enabled when
         * combined mode is switched off.
         */

        if (
            po &&
            !po.checked &&
            !box.checked
        ) {

            po.checked = true;
            box.checked = true;

        }

    }


    /*
     * Combined Border freezes PO Border
     * and Box Border.
     */

    if (combined?.checked) {

        if (poBorder) {
            poBorder.checked = false;
        }

        if (boxBorder) {
            boxBorder.checked = false;
        }

        setLocked(
            poBorder,
            true
        );

        setLocked(
            boxBorder,
            true
        );

    } else {

        setLocked(
            poBorder,
            false
        );

        setLocked(
            boxBorder,
            false
        );

    }


    if (showToastMessage) {

        if (poPlusBox?.checked) {

            showToast(
                "PO Number + Box Number has been enabled.",
                "success"
            );

        }


        if (combined?.checked) {

            showToast(
                "Combined Border has been enabled.",
                "success"
            );

        }

    }


    updateLivePreview();

}


/* =========================================================
   CHECKBOX EVENT LISTENERS
========================================================= */

function initFeatureCheckboxes() {

    const featureIds = [

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


    featureIds.forEach(id => {

        const checkbox =
            $(id);

        if (!checkbox) {
            return;
        }


        checkbox.addEventListener(
            "change",
            () => {

                /*
                 * No confirmation modal.
                 */

                const label =
                    checkbox.closest(
                        ".feature-check"
                    );


                if (
                    checkbox.checked
                ) {

                    if (
                        id !== "poPlusBoxCheck" &&
                        id !== "combinedBorderCheck"
                    ) {

                        showToast(
                            `${getReadableFeatureName(id)} has been enabled.`,
                            "success"
                        );

                    }

                } else {

                    showToast(
                        `${getReadableFeatureName(id)} has been disabled.`,
                        "error"
                    );

                }


                if (
                    id === "poPlusBoxCheck" ||
                    id === "combinedBorderCheck"
                ) {

                    updateLabelFeatureState(
                        true
                    );

                } else {

                    updateLivePreview();

                }

            }
        );

    });


    updateLabelFeatureState(
        false
    );

}


function getReadableFeatureName(id) {

    const names = {

        poNumberCheck:
            "PO Number",

        boxNumberCheck:
            "Box Number",

        poPlusBoxCheck:
            "PO Number + Box Number",

        combinedBorderCheck:
            "Combined Border",

        poBorderCheck:
            "PO Border",

        boxBorderCheck:
            "Box Border",

        cutLineCheck:
            "Cut Line / Scissor Mark",

        pageBorderCheck:
            "Page Border",

        samePOPageFlow:
            "Same PO Page Flow",

        halfPageFlowCheck:
            "Half Page Label Flow"

    };


    return names[id] ||
        "Function";

}


/* =========================================================
   FONT CONTROL HELPERS
========================================================= */

function getFontStyle(
    familyId,
    sizeId,
    boldId,
    italicId,
    underlineId
) {

    const family =
        $(familyId)?.value ||
        "Arial";

    const size =
        safeNumber(
            $(sizeId)?.value,
            20
        );

    const bold =
        $(boldId)?.checked;

    const italic =
        $(italicId)?.checked;

    const underline =
        $(underlineId)?.checked;


    return {

        family,

        size,

        weight:
            bold
                ? "700"
                : "400",

        style:
            italic
                ? "italic"
                : "normal",

        decoration:
            underline
                ? "underline"
                : "none"

    };

}


function applyTextStyle(
    element,
    style
) {

    if (!element) {
        return;
    }

    element.style.fontFamily =
        `"${style.family}"`;

    element.style.fontSize =
        `${style.size}px`;

    element.style.fontWeight =
        style.weight;

    element.style.fontStyle =
        style.style;

    element.style.textDecoration =
        style.decoration;

}


/* =========================================================
   FONT EVENTS
========================================================= */

function initFontControls() {

    const ids = [

        "poFontFamily",
        "poFontSize",
        "poBoldCheck",
        "poItalicCheck",
        "poUnderlineCheck",

        "boxFontFamily",
        "boxFontSize",
        "boxBoldCheck",
        "boxItalicCheck",
        "boxUnderlineCheck",

        "fromFontFamily",
        "fromFontSize",
        "fromBold",
        "fromItalic",
        "fromUnderline",
        "fromBorder",

        "toFontFamily",
        "toFontSize",
        "toBold",
        "toItalic",
        "toUnderline",
        "toBorder"

    ];


    ids.forEach(id => {

        const element =
            $(id);

        if (!element) {
            return;
        }

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
   LABEL CONTENT
========================================================= */

function getCurrentPO() {

    const values =
        getCocoPOValues();

    return values[0] ||
        "PO NUMBER";

}


function getCurrentBoxNumber() {

    const start =
        safeNumber(
            $("startBoxNumber")?.value,
            1
        );

    return start;

}


/* =========================================================
   PREVIEW PAGE DIMENSIONS
========================================================= */

function updatePreviewPageSize() {

    const page =
        $("previewPage");

    if (!page) {
        return;
    }


    const size =
        $("pageSize")?.value ||
        "4x6";


    let dimensions =
        getPageDimensions(
            size
        );


    dimensions =
        applyOrientation(
            dimensions,
            $("orientation")?.value ||
            "portrait"
        );


    /*
     * Keep preview at a practical
     * screen size while preserving ratio.
     */

    const maxWidth = 650;
    const maxHeight = 520;


    const ratio =
        dimensions.width /
        dimensions.height;


    let width;
    let height;


    if (ratio >= 1) {

        width =
            Math.min(
                maxWidth,
                dimensions.width * 2.4
            );

        height =
            width / ratio;

    } else {

        height =
            Math.min(
                maxHeight,
                dimensions.height * 2.4
            );

        width =
            height * ratio;

    }


    page.style.width =
        `${Math.max(90, width)}px`;

    page.style.height =
        `${Math.max(90, height)}px`;


    const pageInfo =
        $("previewPageSize");

    if (pageInfo) {

        let label =
            getPageDimensions(
                size
            ).label;


        if (
            size === "70x35"
        ) {

            label =
                "70 × 35 mm";

        }


        pageInfo.textContent =
            label;

    }


    const selectedInfo =
        $("selectedPageInfo");

    if (selectedInfo) {

        selectedInfo.textContent =
            `${dimensions.width.toFixed(1)} × ${dimensions.height.toFixed(1)} mm`;

    }

}


/* =========================================================
   LABEL PREVIEW
========================================================= */

function updateLabelPreview() {

    const label =
        $("previewLabel");

    const poElement =
        $("previewPO");

    const boxElement =
        $("previewBox");


    if (
        !label ||
        !poElement ||
        !boxElement
    ) {

        return;

    }


    const poCheck =
        $("poNumberCheck")?.checked;

    const boxCheck =
        $("boxNumberCheck")?.checked;

    const poPlusBox =
        $("poPlusBoxCheck")?.checked;

    const combinedBorder =
        $("combinedBorderCheck")?.checked;

    const poBorder =
        $("poBorderCheck")?.checked;

    const boxBorder =
        $("boxBorderCheck")?.checked;

    const cutLine =
        $("cutLineCheck")?.checked;

    const pageBorder =
        $("pageBorderCheck")?.checked;


    const poNumber =
        getCurrentPO();

    const boxNumber =
        getCurrentBoxNumber();


    /*
     * PO text.
     */

    if (
        poPlusBox
    ) {

        poElement.textContent =
            `PO NUMBER ${poNumber}`;

        boxElement.textContent =
            `BOX NO. ${boxNumber}`;

        poElement.style.display =
            "block";

        boxElement.style.display =
            "block";

    } else {

        poElement.textContent =
            poNumber;

        boxElement.textContent =
            `BOX NO. ${boxNumber}`;

        poElement.style.display =
            poCheck
                ? "block"
                : "none";

        boxElement.style.display =
            boxCheck
                ? "block"
                : "none";

    }


    /*
     * Combined border.
     */

    label.classList.toggle(
        "combined-border",
        combinedBorder
    );


    /*
     * Individual borders.
     */

    poElement.classList.toggle(
        "with-border",
        poBorder && !combinedBorder
    );

    boxElement.classList.toggle(
        "with-border",
        boxBorder && !combinedBorder
    );


    /*
     * Cut line.
     */

    label.style.outline =
        cutLine
            ? "1px dashed #64748b"
            : "none";


    /*
     * Page border.
     */

    const page =
        $("previewPage");

    if (page) {

        page.style.border =
            pageBorder
                ? "2px solid #111827"
                : "1px solid #cbd5e1";

    }


    /*
     * PO font.
     */

    applyTextStyle(
        poElement,

        getFontStyle(
            "poFontFamily",
            "poFontSize",
            "poBoldCheck",
            "poItalicCheck",
            "poUnderlineCheck"
        )
    );


    /*
     * Box font.
     */

    applyTextStyle(
        boxElement,

        getFontStyle(
            "boxFontFamily",
            "boxFontSize",
            "boxBoldCheck",
            "boxItalicCheck",
            "boxUnderlineCheck"
        )
    );


    /*
     * When PO + Box is active,
     * stack them vertically.
     */

    label.style.flexDirection =
        "column";

    label.style.gap =
        "10px";


    /*
     * Labels per page affects
     * preview layout.
     */

    const labelsPerPage =
        safeNumber(
            $("labelsPerPage")?.value,
            2
        );


    if (
        labelsPerPage >= 2
    ) {

        label.style.transform =
            "scale(0.92)";

    } else {

        label.style.transform =
            "scale(1)";

    }

}


/* =========================================================
   LIVE PREVIEW
========================================================= */

function updateLivePreview() {

    updatePreviewPageSize();

    updateLabelPreview();

}


/* =========================================================
   LABELS PER PAGE
========================================================= */

function initLabelsPerPage() {

    const select =
        $("labelsPerPage");

    if (!select) {
        return;
    }

    select.addEventListener(
        "change",
        () => {

            AppState.labelsPerPage =
                safeNumber(
                    select.value,
                    2
                );

            updateLivePreview();

        }
    );

}


/* =========================================================
   BOX NUMBER INPUTS
========================================================= */

function initBoxSettings() {

    [
        "startBoxNumber",
        "endBoxNumber",
        "boxRepeatCount",
        "labelGap"
    ].forEach(id => {

        const element =
            $(id);

        if (!element) {
            return;
        }

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
   ISBN BARCODE
========================================================= */

function generateISBNBarcode() {

    const value =
        $("isbnValue")?.value.trim();


    const svg =
        $("isbnBarcodeSvg");


    const text =
        $("isbnBarcodeText");


    if (!svg) {
        return;
    }


    if (!value) {

        svg.innerHTML = "";

        if (text) {
            text.textContent =
                "Enter ISBN to preview";
        }

        return;

    }


    if (
        typeof JsBarcode ===
        "undefined"
    ) {

        if (text) {
            text.textContent =
                "Barcode library not loaded.";
        }

        return;

    }


    try {

        JsBarcode(
            svg,
            value,
            {

                format: "EAN13",

                displayValue: true,

                lineColor: "#111827",

                background: "#ffffff",

                width: 2,

                height: 70,

                margin: 10,

                fontSize: 14

            }
        );


        if (text) {

            text.textContent =
                value;

        }

    } catch (error) {

        /*
         * Fallback to CODE128
         * if ISBN/EAN validation fails.
         */

        try {

            JsBarcode(
                svg,
                value,
                {

                    format: "CODE128",

                    displayValue: true,

                    lineColor: "#111827",

                    background: "#ffffff",

                    width: 2,

                    height: 70,

                    margin: 10

                }
            );


            if (text) {

                text.textContent =
                    value;

            }

        } catch (fallbackError) {

            svg.innerHTML = "";

            if (text) {

                text.textContent =
                    "Invalid barcode value.";

            }

        }

    }

}


function initISBN() {

    [
        "isbnValue",
        "isbnBookTitle",
        "isbnEdition"
    ].forEach(id => {

        const element =
            $(id);

        if (!element) {
            return;
        }

        element.addEventListener(
            "input",
            generateISBNBarcode
        );

    });

}


/* =========================================================
   QR CODE GENERATION
========================================================= */

function generateQR(
    container,
    value,
    size = 170
) {

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        typeof QRCode ===
        "undefined"
    ) {

        container.textContent =
            "QR library not loaded.";

        return;

    }


    if (!value) {
        return;
    }


    const canvas =
        document.createElement(
            "canvas"
        );


    QRCode.toCanvas(
        canvas,
        value,
        {

            width: size,

            margin: 2,

            errorCorrectionLevel:
                "M",

            color: {

                dark: "#111827",

                light: "#ffffff"

            }

        },

        error => {

            if (error) {

                console.error(
                    "QR error:",
                    error
                );

                container.textContent =
                    "Unable to create QR code.";

                return;

            }

            container.appendChild(
                canvas
            );

        }
    );

}


function initQRCodes() {

    const mapURL =
        "https://maps.app.goo.gl/7McYApm1u9x4QSj7A";


    const email =
        "mailto:ashish.verma@bookswagon.in";


    generateQR(
        $("addressQRPreview"),
        mapURL,
        170
    );


    generateQR(
        $("emailQRPreview"),
        email,
        170
    );

}


/* =========================================================
   PDF PAGE DIMENSIONS
========================================================= */

function getPDFPageDimensions(
    size,
    orientation,
    customWidth,
    customHeight
) {

    let dimensions;


    switch (size) {

        case "4x6":

            dimensions = {
                width: 101.6,
                height: 152.4
            };

            break;


        case "70x35":

            dimensions = {
                width: 70,
                height: 35
            };

            break;


        case "a4":

            dimensions = {
                width: 210,
                height: 297
            };

            break;


        case "custom":

            dimensions = {
                width:
                    safeNumber(
                        customWidth,
                        70
                    ),

                height:
                    safeNumber(
                        customHeight,
                        35
                    )
            };

            break;


        default:

            dimensions = {
                width: 101.6,
                height: 152.4
            };

    }


    if (
        orientation === "landscape" &&
        dimensions.height > dimensions.width
    ) {

        [
            dimensions.width,
            dimensions.height
        ] = [
            dimensions.height,
            dimensions.width
        ];

    }


    if (
        orientation === "portrait" &&
        dimensions.width > dimensions.height
    ) {

        [
            dimensions.width,
            dimensions.height
        ] = [
            dimensions.height,
            dimensions.width
        ];

    }


    return dimensions;

}


/* =========================================================
   PDF LABEL DRAWING
========================================================= */

function drawLabelOnPDF(
    doc,
    x,
    y,
    width,
    height,
    poNumber,
    boxNumber,
    settings
) {

    const {

        poEnabled,
        boxEnabled,
        poPlusBox,
        combinedBorder,
        poBorder,
        boxBorder,
        cutLine,
        poFont,
        boxFont

    } = settings;


    /*
     * Label background.
     */

    doc.setFillColor(
        255,
        255,
        255
    );

    doc.rect(
        x,
        y,
        width,
        height,
        "F"
    );


    /*
     * Combined border.
     */

    if (combinedBorder) {

        doc.setDrawColor(
            17,
            24,
            39
        );

        doc.setLineWidth(
            0.6
        );

        doc.rect(
            x,
            y,
            width,
            height
        );

    }


    /*
     * Cut line.
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


    const visiblePO =
        poPlusBox ||
        poEnabled;


    const visibleBox =
        poPlusBox ||
        boxEnabled;


    const centerX =
        x + width / 2;


    /*
     * Vertical layout.
     */

    let currentY =
        y + height / 2;


    if (
        visiblePO &&
        visibleBox
    ) {

        currentY -= 8;

    }


    /*
     * PO.
     */

    if (visiblePO) {

        const text =
            poPlusBox
                ? `PO NUMBER ${poNumber}`
                : String(poNumber);


        doc.setFont(
            poFont.family,
            getJSPDFFontStyle(
                poFont
            )
        );


        doc.setFontSize(
            poFont.size
        );


        doc.setTextColor(
            17,
            24,
            39
        );


        const lines =
            doc.splitTextToSize(
                text,
                width - 10
            );


        doc.text(
            lines,
            centerX,
            currentY,
            {
                align: "center"
            }
        );


        if (
            poBorder &&
            !combinedBorder
        ) {

            drawTextBorder(
                doc,
                x + 4,
                currentY -
                    poFont.size / 2 -
                    2,
                width - 8,
                poFont.size + 5
            );

        }


        currentY +=
            poFont.size + 10;

    }


    /*
     * BOX.
     */

    if (visibleBox) {

        const text =
            `BOX NO. ${boxNumber}`;


        doc.setFont(
            boxFont.family,
            getJSPDFFontStyle(
                boxFont
            )
        );


        doc.setFontSize(
            boxFont.size
        );


        doc.setTextColor(
            17,
            24,
            39
        );


        doc.text(
            text,
            centerX,
            currentY,
            {
                align: "center"
            }
        );


        if (
            boxBorder &&
            !combinedBorder
        ) {

            drawTextBorder(
                doc,
                x + 4,
                currentY -
                    boxFont.size / 2 -
                    2,
                width - 8,
                boxFont.size + 5
            );

        }

    }

}


/* =========================================================
   jsPDF FONT STYLE
========================================================= */

function getJSPDFFontStyle(font) {

    if (
        font.weight === "700" &&
        font.style === "italic"
    ) {

        return "bolditalic";

    }


    if (
        font.weight === "700"
    ) {

        return "bold";

    }


    if (
        font.style === "italic"
    ) {

        return "italic";

    }


    return "normal";

}


/* =========================================================
   TEXT BORDER
========================================================= */

function drawTextBorder(
    doc,
    x,
    y,
    width,
    height
) {

    doc.setDrawColor(
        17,
        24,
        39
    );

    doc.setLineWidth(
        0.4
    );

    doc.rect(
        x,
        y,
        width,
        height
    );

}


/* =========================================================
   GET COCO SETTINGS
========================================================= */

function getCocoSettings() {

    return {

        poEnabled:
            $("poNumberCheck")?.checked,

        boxEnabled:
            $("boxNumberCheck")?.checked,

        poPlusBox:
            $("poPlusBoxCheck")?.checked,

        combinedBorder:
            $("combinedBorderCheck")?.checked,

        poBorder:
            $("poBorderCheck")?.checked,

        boxBorder:
            $("boxBorderCheck")?.checked,

        cutLine:
            $("cutLineCheck")?.checked,

        pageBorder:
            $("pageBorderCheck")?.checked,

        poFont: {

            family:
                $("poFontFamily")?.value ||
                "Arial",

            size:
                safeNumber(
                    $("poFontSize")?.value,
                    24
                ),

            weight:
                $("poBoldCheck")?.checked
                    ? "700"
                    : "400",

            style:
                $("poItalicCheck")?.checked
                    ? "italic"
                    : "normal"

        },

        boxFont: {

            family:
                $("boxFontFamily")?.value ||
                "Arial",

            size:
                safeNumber(
                    $("boxFontSize")?.value,
                    20
                ),

            weight:
                $("boxBoldCheck")?.checked
                    ? "700"
                    : "400",

            style:
                $("boxItalicCheck")?.checked
                    ? "italic"
                    : "normal"

        }

    };

}


/* =========================================================
   GENERATE COCO PDF
========================================================= */

function generateCocoPDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        showToast(
            "PDF library could not be loaded.",
            "error"
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const size =
        $("pageSize")?.value ||
        "4x6";


    const orientation =
        $("orientation")?.value ||
        "portrait";


    const dimensions =
        getPDFPageDimensions(
            size,
            orientation,
            $("customWidth")?.value,
            $("customHeight")?.value
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

            format:
                [
                    dimensions.width,
                    dimensions.height
                ]

        });


    const settings =
        getCocoSettings();


    const pos =
        getCocoPOValues();


    const poList =
        pos.length
            ? pos
            : ["PO NUMBER"];


    const start =
        Math.max(
            1,
            safeNumber(
                $("startBoxNumber")?.value,
                1
            )
        );


    const end =
        Math.max(
            start,
            safeNumber(
                $("endBoxNumber")?.value,
                start
            )
        );


    const repeat =
        Math.max(
            1,
            safeNumber(
                $("boxRepeatCount")?.value,
                1
            )
        );


    const labelsPerPage =
        Math.max(
            1,
            safeNumber(
                $("labelsPerPage")?.value,
                2
            )
        );


    const gap =
        Math.max(
            0,
            safeNumber(
                $("labelGap")?.value,
                2
            )
        );


    /*
     * Generate label records.
     */

    const labels = [];


    poList.forEach(po => {

        for (
            let r = 0;
            r < repeat;
            r++
        ) {

            for (
                let box = start;
                box <= end;
                box++
            ) {

                labels.push({

                    po,
                    box

                });

            }

        }

    });


    /*
     * Always generate at least one.
     */

    if (!labels.length) {

        labels.push({

            po: "PO NUMBER",

            box: start

        });

    }


    let pageIndex = 0;


    for (
        let i = 0;
        i < labels.length;
        i += labelsPerPage
    ) {

        if (pageIndex > 0) {

            doc.addPage(
                [
                    dimensions.width,
                    dimensions.height
                ],
                pdfOrientation
            );

        }


        pageIndex++;


        /*
         * Page border.
         */

        if (settings.pageBorder) {

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


        const batch =
            labels.slice(
                i,
                i + labelsPerPage
            );


        const availableHeight =
            dimensions.height -
            gap *
                (batch.length + 1);


        const labelHeight =
            availableHeight /
            batch.length;


        batch.forEach(
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


                drawLabelOnPDF(
                    doc,
                    x,
                    y,
                    width,
                    labelHeight,
                    item.po,
                    item.box,
                    settings
                );

            }
        );

    }


    const filename =
        "books-label-studio-coco-blue.pdf";


    doc.save(
        filename
    );


    showToast(
        "Coco Blue PDF generated successfully.",
        "success"
    );

}


/* =========================================================
   GENERIC OTHER PO PDF
========================================================= */

function generateOtherPDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        showToast(
            "PDF library could not be loaded.",
            "error"
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFPageDimensions(
            $("otherPageSize")?.value ||
                "4x6",

            $("otherOrientation")?.value ||
                "portrait",

            $("otherCustomWidth")?.value,

            $("otherCustomHeight")?.value
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
            : ["PO NUMBER"];


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
            "PDF library could not be loaded.",
            "error"
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFPageDimensions(
            $("isbnPageSize")?.value ||
                "4x6",

            $("isbnOrientation")?.value ||
                "portrait",

            $("isbnCustomWidth")?.value,

            $("isbnCustomHeight")?.value
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
        $("isbnValue")?.value.trim() ||
        "ISBN";


    const title =
        $("isbnBookTitle")?.value.trim() ||
        "";


    const edition =
        $("isbnEdition")?.value.trim() ||
        "";


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        18
    );


    doc.text(
        title ||
            "ISBN BARCODE",
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


    /*
     * Draw simple machine-readable
     * barcode approximation.
     */

    const barcodeY =
        dimensions.height / 2;


    const barcodeWidth =
        Math.min(
            dimensions.width - 20,
            100
        );


    const barcodeHeight =
        30;


    drawSimpleBarcode(
        doc,
        isbn,
        (
            dimensions.width -
            barcodeWidth
        ) / 2,
        barcodeY,
        barcodeWidth,
        barcodeHeight
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
   SIMPLE BARCODE DRAWING
========================================================= */

function drawSimpleBarcode(
    doc,
    value,
    x,
    y,
    width,
    height
) {

    const text =
        String(value);


    let cursor =
        x;


    const total =
        text.length * 11;


    const unit =
        width / total;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const code =
            text.charCodeAt(i);


        for (
            let bit = 0;
            bit < 8;
            bit++
        ) {

            const isBlack =
                (
                    code >>
                    bit
                ) & 1;


            if (isBlack) {

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


    doc.setFontSize(
        8
    );


    doc.setTextColor(
        0,
        0,
        0
    );


    doc.text(
        text,
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
            "PDF library could not be loaded.",
            "error"
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFPageDimensions(
            $("addressPageSize")?.value ||
                "4x6",

            $("addressOrientation")?.value ||
                "portrait",

            $("addressCustomWidth")?.value,

            $("addressCustomHeight")?.value
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


    let fromText =
        $("addressFrom")?.value.trim() ||
        "FROM ADDRESS";


    let toText =
        $("addressTo")?.value.trim() ||
        "TO ADDRESS";


    /*
     * If Excel mode is selected,
     * use first data row after header.
     */

    if (
        AppState.addressMode ===
        "excel" &&
        AppState.addressExcelRows.length
    ) {

        const row =
            AppState.addressExcelRows[0];


        if (Array.isArray(row)) {

            fromText =
                String(
                    row[0] ||
                    fromText
                );

            toText =
                String(
                    row[1] ||
                    toText
                );

        }

    }


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


    /*
     * FROM
     */

    drawAddressBox(
        doc,

        fromText,

        margin,
        margin,

        boxWidth,
        boxHeight,

        {

            family:
                $("fromFontFamily")?.value ||
                "Arial",

            size:
                safeNumber(
                    $("fromFontSize")?.value,
                    14
                ),

            bold:
                $("fromBold")?.checked,

            italic:
                $("fromItalic")?.checked,

            underline:
                $("fromUnderline")?.checked,

            border:
                $("fromBorder")?.checked

        }
    );


    /*
     * TO
     */

    drawAddressBox(
        doc,

        toText,

        margin +
            boxWidth +
            gap,

        margin,

        boxWidth,
        boxHeight,

        {

            family:
                $("toFontFamily")?.value ||
                "Arial",

            size:
                safeNumber(
                    $("toFontSize")?.value,
                    14
                ),

            bold:
                $("toBold")?.checked,

            italic:
                $("toItalic")?.checked,

            underline:
                $("toUnderline")?.checked,

            border:
                $("toBorder")?.checked

        }
    );


    /*
     * QR codes represented as text links
     * in the generated PDF if canvas
     * extraction isn't available.
     */

    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        6
    );


    doc.text(
        "Location: https://maps.app.goo.gl/7McYApm1u9x4QSj7A",
        margin,
        dimensions.height - 3
    );


    doc.text(
        "Email: ashish.verma@bookswagon.in",
        dimensions.width / 2,
        dimensions.height - 3
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
   ADDRESS BOX DRAWING
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


    doc.setTextColor(
        17,
        24,
        39
    );


    const lines =
        doc.splitTextToSize(
            text,
            width - 8
        );


    doc.text(
        lines,
        x + 4,
        y + 8
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

        const input =
            $(`cocoPO${i}`);

        if (input) {
            input.value = "";
        }

    }


    if ($("cocoMultiplePO")) {
        $("cocoMultiplePO").value = "";
    }


    if ($("cocoFromAddress")) {
        $("cocoFromAddress").value = "";
    }


    if ($("cocoToAddress")) {
        $("cocoToAddress").value = "";
    }


    if ($("startBoxNumber")) {
        $("startBoxNumber").value = "1";
    }


    if ($("endBoxNumber")) {
        $("endBoxNumber").value = "10";
    }


    if ($("boxRepeatCount")) {
        $("boxRepeatCount").value = "1";
    }


    if ($("labelsPerPage")) {
        $("labelsPerPage").value = "2";
    }


    if ($("pageSize")) {
        $("pageSize").value = "4x6";
    }


    if ($("orientation")) {
        $("orientation").value = "portrait";
    }


    /*
     * Restore feature defaults.
     */

    setCheckbox(
        "poNumberCheck",
        true
    );

    setCheckbox(
        "boxNumberCheck",
        true
    );

    setCheckbox(
        "poPlusBoxCheck",
        false
    );

    setCheckbox(
        "combinedBorderCheck",
        false
    );

    setCheckbox(
        "poBorderCheck",
        false
    );

    setCheckbox(
        "boxBorderCheck",
        false
    );

    setCheckbox(
        "cutLineCheck",
        false
    );

    setCheckbox(
        "pageBorderCheck",
        false
    );


    updateLabelFeatureState(
        false
    );


    switchCocoMode(
        "individual"
    );


    updateCustomSizeState(
        "pageSize",
        "customSizePanel",
        "customWidth",
        "customHeight",
        "selectedPageInfo"
    );


    updateLivePreview();


    showToast(
        "Coco Blue settings reset.",
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

        const input =
            $(`otherPO${i}`);

        if (input) {
            input.value = "";
        }

    }


    if ($("otherMultiplePO")) {
        $("otherMultiplePO").value = "";
    }


    if ($("otherPageSize")) {
        $("otherPageSize").value =
            "4x6";
    }


    if ($("otherOrientation")) {
        $("otherOrientation").value =
            "portrait";
    }


    switchOtherMode(
        "individual"
    );


    updateCustomSizeState(
        "otherPageSize",
        "otherCustomSizePanel",
        "otherCustomWidth",
        "otherCustomHeight"
    );


    showToast(
        "Other PO settings reset.",
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


    if ($("isbnPageSize")) {
        $("isbnPageSize").value =
            "4x6";
    }


    if ($("isbnOrientation")) {
        $("isbnOrientation").value =
            "portrait";
    }


    if ($("isbnBarcodeSvg")) {
        $("isbnBarcodeSvg").innerHTML =
            "";
    }


    if ($("isbnBarcodeText")) {
        $("isbnBarcodeText").textContent =
            "Enter ISBN to preview";
    }


    showToast(
        "ISBN settings reset.",
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


    if ($("addressPageSize")) {
        $("addressPageSize").value =
            "4x6";
    }


    if ($("addressOrientation")) {
        $("addressOrientation").value =
            "portrait";
    }


    switchAddressMode(
        "manual"
    );


    updateCustomSizeState(
        "addressPageSize",
        "addressCustomSizePanel",
        "addressCustomWidth",
        "addressCustomHeight"
    );


    showToast(
        "Address settings reset.",
        "success"
    );

}


/* =========================================================
   SET CHECKBOX
========================================================= */

function setCheckbox(
    id,
    value
) {

    const element =
        $(id);

    if (element) {
        element.checked =
            Boolean(value);
    }

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

function initActionButtons() {

    const cocoReset =
        $("cocoResetButton");

    if (cocoReset) {

        cocoReset.addEventListener(
            "click",
            resetCoco
        );

    }


    const cocoGenerate =
        $("cocoGenerateButton");

    if (cocoGenerate) {

        cocoGenerate.addEventListener(
            "click",
            generateCocoPDF
        );

    }


    const otherReset =
        $("otherResetButton");

    if (otherReset) {

        otherReset.addEventListener(
            "click",
            resetOther
        );

    }


    const otherGenerate =
        $("otherGenerateButton");

    if (otherGenerate) {

        otherGenerate.addEventListener(
            "click",
            generateOtherPDF
        );

    }


    const isbnReset =
        $("isbnResetButton");

    if (isbnReset) {

        isbnReset.addEventListener(
            "click",
            resetISBN
        );

    }


    const isbnGenerate =
        $("isbnGenerateButton");

    if (isbnGenerate) {

        isbnGenerate.addEventListener(
            "click",
            generateISBNPDF
        );

    }


    const addressReset =
        $("addressResetButton");

    if (addressReset) {

        addressReset.addEventListener(
            "click",
            resetAddress
        );

    }


    const addressGenerate =
        $("addressGenerateButton");

    if (addressGenerate) {

        addressGenerate.addEventListener(
            "click",
            generateAddressPDF
        );

    }

}


/* =========================================================
   LANGUAGE
========================================================= */

const translations = {

    en: {

        title:
            "Books Label Studio",

        subtitle:
            "Professional Label & Barcode Generator"

    },

    hi: {

        title:
            "बुक्स लेबल स्टूडियो",

        subtitle:
            "प्रोफेशनल लेबल और बारकोड जनरेटर"

    }

};


function applyLanguage(language) {

    AppState.language =
        language;


    const translation =
        translations[language] ||
        translations.en;


    const title =
        document.querySelector(
            ".brand-text h1"
        );


    const subtitle =
        document.querySelector(
            ".brand-text p"
        );


    if (title) {
        title.textContent =
            translation.title;
    }


    if (subtitle) {
        subtitle.textContent =
            translation.subtitle;
    }


    /*
     * Keep HTML functional.
     * Main UI text can be expanded
     * here without changing IDs.
     */

}


function initLanguage() {

    const select =
        $("languageSelect");

    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        () => {

            applyLanguage(
                select.value
            );

        }
    );

}


/* =========================================================
   GENERIC LIVE INPUT LISTENER
========================================================= */

function initLiveInputs() {

    all(
        "input, textarea, select"
    ).forEach(element => {

        /*
         * Avoid duplicate behaviour
         * on file inputs.
         */

        if (
            element.type ===
            "file"
        ) {
            return;
        }


        element.addEventListener(
            "input",
            () => {

                if (
                    element.id ===
                    "isbnValue"
                ) {

                    generateISBNBarcode();

                }


                updateLivePreview();

            }
        );


        element.addEventListener(
            "change",
            () => {

                updateLivePreview();

            }
        );

    });

}


/* =========================================================
   MODAL COMPATIBILITY
========================================================= */

function initModal() {

    const modal =
        $("confirmationModal");


    const close =
        $("modalCloseButton");

    const cancel =
        $("modalCancelButton");


    const closeModal =
        () => {

            if (!modal) {
                return;
            }

            modal.classList.remove(
                "show"
            );

            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        };


    if (close) {
        close.addEventListener(
            "click",
            closeModal
        );
    }


    if (cancel) {
        cancel.addEventListener(
            "click",
            closeModal
        );
    }


    /*
     * Feature changes do not call this
     * modal. Kept only for compatibility.
     */

}


/* =========================================================
   CHECK REQUIRED LIBRARIES
========================================================= */

function checkLibraries() {

    const missing = [];


    if (
        typeof XLSX ===
        "undefined"
    ) {

        missing.push(
            "Excel"
        );

    }


    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        missing.push(
            "PDF"
        );

    }


    if (
        typeof JsBarcode ===
        "undefined"
    ) {

        missing.push(
            "Barcode"
        );

    }


    if (
        typeof QRCode ===
        "undefined"
    ) {

        missing.push(
            "QR"
        );

    }


    if (missing.length) {

        console.warn(
            "Missing libraries:",
            missing
        );

    }

}


/* =========================================================
   INITIALIZATION
========================================================= */

function initApp() {

    try {

        initCategoryNavigation();

        initCocoModes();

        initOtherModes();

        initAddressModes();

        initPOInputs();

        initExcelUploads();

        initPageSettings();

        initFeatureCheckboxes();

        initFontControls();

        initLabelsPerPage();

        initBoxSettings();

        initISBN();

        initQRCodes();

        initActionButtons();

        initLanguage();

        initLiveInputs();

        initModal();

        checkLibraries();


        updateCustomSizeState(
            "pageSize",
            "customSizePanel",
            "customWidth",
            "customHeight",
            "selectedPageInfo"
        );


        updateLivePreview();


        console.log(
            "Books Label Studio initialized successfully."
        );

    } catch (error) {

        console.error(
            "Application initialization error:",
            error
        );


        showToast(
            "Application initialization failed. Check the browser console.",
            "error"
        );

    }

}


/* =========================================================
   START
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
