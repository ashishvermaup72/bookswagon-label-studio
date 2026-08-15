/* =========================================================
   BOOKS LABEL STUDIO
   FINAL SCRIPT.JS
   Matches the latest HTML + CSS
========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const CONFIG = window.BOOKS_LABEL_STUDIO_CONFIG || {
    mapUrl: "https://maps.app.goo.gl/7McYApm1u9x4QSj7A",
    email: "ashish.verma@bookswagon.in",
    maxManualPO: 40,
    maxFontSize: 48
};


/* =========================================================
   APP STATE
========================================================= */

const state = {
    category: "cocoBlue",
    cocoMode: "individual",
    otherMode: "individual",
    addressMode: "manual",

    language: "en",

    pageSize: "4x6",
    orientation: "portrait",
    customWidth: "",
    customHeight: "",

    poPlusBox: false,
    showPO: true,
    showBox: true,

    combinedBorder: false,
    poBorder: false,
    boxBorder: false,
    cutLine: false,
    pageBorder: false,

    samePOFlow: false,
    halfPageFlow: true,

    startBox: 1,
    endBox: 10,
    repeatCount: 1,

    labelsPerPage: 2,
    labelGap: 2,

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

    addressFromFont: "Arial",
    addressFromSize: 14,
    addressFromBold: false,
    addressFromItalic: false,
    addressFromUnderline: false,
    addressFromBorder: false,

    addressToFont: "Arial",
    addressToSize: 14,
    addressToBold: false,
    addressToItalic: false,
    addressToUnderline: false,
    addressToBorder: false,

    cocoPOs: [],
    otherPOs: [],

    cocoExcelRows: [],
    otherExcelRows: [],
    addressExcelRows: []
};


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));


function on(id, event, handler) {
    const el = $(id);

    if (el) {
        el.addEventListener(event, handler);
    }
}


function value(id, fallback = "") {
    const el = $(id);
    return el ? el.value : fallback;
}


function checked(id, fallback = false) {
    const el = $(id);
    return el ? el.checked : fallback;
}


function setValue(id, val) {
    const el = $(id);

    if (el) {
        el.value = val;
    }
}


function setChecked(id, val) {
    const el = $(id);

    if (el) {
        el.checked = Boolean(val);
    }
}


function clampNumber(number, min, max = Infinity) {
    const n = Number(number);

    if (!Number.isFinite(n)) {
        return min;
    }

    return Math.min(
        max,
        Math.max(min, n)
    );
}


function escapeHTML(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function capitalize(text) {
    if (!text) return "";

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    buildManualPOInputs(
        "individualPOGrid",
        "cocoPO"
    );

    buildManualPOInputs(
        "otherIndividualPOGrid",
        "otherPO"
    );

    bindCategoryNavigation();

    bindCocoNavigation();

    bindOtherNavigation();

    bindAddressNavigation();

    bindCocoInputs();

    bindPageSettings();

    bindLabelSettings();

    bindFontSettings();

    bindExcelUploads();

    bindISBN();

    bindAddressInputs();

    bindMainButtons();

    bindModal();

    initializeDefaults();

    updateEverything();

}


/* =========================================================
   CATEGORY NAVIGATION
========================================================= */

function bindCategoryNavigation() {

    $$(".category-btn").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;

                if (!category) return;

                state.category =
                    category;

                $$(".category-btn")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                $$(".tool-section")
                    .forEach(section =>
                        section.classList.remove(
                            "active"
                        )
                    );

                const section =
                    document.querySelector(
                        `.tool-section[data-tool="${category}"]`
                    );

                if (section) {
                    section.classList.add(
                        "active"
                    );
                }

                updateEverything();

            }
        );

    });

}


/* =========================================================
   COCO NAVIGATION
========================================================= */

function bindCocoNavigation() {

    $$("[data-coco-mode]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mode =
                    button.dataset.cocoMode;

                if (!mode) return;

                state.cocoMode =
                    mode;

                $$("[data-coco-mode]")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                $$(".mode-panel")
                    .forEach(panel =>
                        panel.classList.remove(
                            "active"
                        )
                    );

                const panel =
                    $(`coco${capitalize(mode)}Panel`);

                if (panel) {
                    panel.classList.add(
                        "active"
                    );
                }

            }
        );

    });

}


/* =========================================================
   OTHER PO NAVIGATION
========================================================= */

function bindOtherNavigation() {

    $$("[data-other-mode]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mode =
                    button.dataset.otherMode;

                state.otherMode =
                    mode;

                $$("[data-other-mode]")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                $$(".other-po-panel")
                    .forEach(panel =>
                        panel.classList.remove(
                            "active"
                        )
                    );

                const map = {
                    individual:
                        "otherIndividualPanel",

                    multiple:
                        "otherMultiplePanel",

                    excel:
                        "otherExcelPanel",

                    address:
                        "otherAddressPanel"
                };

                const panel =
                    $(map[mode]);

                if (panel) {
                    panel.classList.add(
                        "active"
                    );
                }

            }
        );

    });

}


/* =========================================================
   ADDRESS NAVIGATION
========================================================= */

function bindAddressNavigation() {

    $$("[data-address-mode]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mode =
                    button.dataset.addressMode;

                state.addressMode =
                    mode;

                $$("[data-address-mode]")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                $$(".address-mode-panel")
                    .forEach(panel =>
                        panel.classList.remove(
                            "active"
                        )
                    );

                const panel =
                    mode === "manual"
                        ? $("addressManualPanel")
                        : $("addressExcelPanel");

                if (panel) {
                    panel.classList.add(
                        "active"
                    );
                }

            }
        );

    });

}


/* =========================================================
   MANUAL PO INPUTS
========================================================= */

function buildManualPOInputs(
    containerId,
    prefix
) {

    const container =
        $(containerId);

    if (!container) return;

    container.innerHTML = "";

    for (
        let i = 1;
        i <= CONFIG.maxManualPO;
        i++
    ) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "po-manual-field";

        wrapper.innerHTML = `
            <label for="${prefix}${i}">
                PO ${i}
            </label>

            <input
                type="text"
                id="${prefix}${i}"
                class="${prefix}-input"
                placeholder="PO ${i}"
                autocomplete="off">
        `;

        container.appendChild(
            wrapper
        );

    }

}


/* =========================================================
   COCO INPUTS
========================================================= */

function bindCocoInputs() {

    for (
        let i = 1;
        i <= CONFIG.maxManualPO;
        i++
    ) {

        on(
            `cocoPO${i}`,
            "input",
            () => {
                state.cocoPOs =
                    collectPOInputs(
                        "cocoPO",
                        CONFIG.maxManualPO
                    );

                updatePreview();
            }
        );

    }


    on(
        "cocoMultiplePO",
        "input",
        () => {

            state.cocoPOs =
                collectMultiplePOs(
                    "cocoMultiplePO"
                );

            updatePreview();

        }
    );


    on(
        "startBoxNumber",
        "input",
        () => {

            state.startBox =
                clampNumber(
                    value(
                        "startBoxNumber",
                        1
                    ),
                    1
                );

            normalizeBoxRange();

            updatePreview();

        }
    );


    on(
        "endBoxNumber",
        "input",
        () => {

            state.endBox =
                clampNumber(
                    value(
                        "endBoxNumber",
                        state.startBox
                    ),
                    state.startBox
                );

            updatePreview();

        }
    );


    on(
        "boxRepeatCount",
        "input",
        () => {

            state.repeatCount =
                clampNumber(
                    value(
                        "boxRepeatCount",
                        1
                    ),
                    1
                );

            updatePreview();

        }
    );


    on(
        "samePOPageFlow",
        "change",
        () => {

            state.samePOFlow =
                checked(
                    "samePOPageFlow"
                );

            notifyToggle(
                state.samePOFlow,
                "Page Flow — Same PO"
            );

        }
    );


    on(
        "labelsPerPage",
        "input",
        () => {

            state.labelsPerPage =
                clampNumber(
                    value(
                        "labelsPerPage",
                        2
                    ),
                    1
                );

            updatePreview();

        }
    );


    on(
        "labelGap",
        "input",
        () => {

            state.labelGap =
                clampNumber(
                    value(
                        "labelGap",
                        2
                    ),
                    0
                );

            updatePreview();

        }
    );


    on(
        "halfPageFlowCheck",
        "change",
        () => {

            state.halfPageFlow =
                checked(
                    "halfPageFlowCheck"
                );

            notifyToggle(
                state.halfPageFlow,
                "Half Page Label Flow"
            );

            updatePreview();

        }
    );

}


/* =========================================================
   PO COLLECTION
========================================================= */

function collectPOInputs(
    prefix,
    max
) {

    const result = [];

    for (
        let i = 1;
        i <= max;
        i++
    ) {

        const input =
            $(`${prefix}${i}`);

        if (!input) continue;

        const text =
            input.value.trim();

        if (text) {
            result.push(text);
        }

    }

    return result;

}


function collectMultiplePOs(id) {

    const text =
        value(id);

    return text
        .split(/[\n,]+/)
        .map(item => item.trim())
        .filter(Boolean);

}


function getCurrentPOs() {

    if (
        state.category ===
        "otherPO"
    ) {

        if (
            state.otherMode ===
            "multiple"
        ) {

            return collectMultiplePOs(
                "otherMultiplePO"
            );

        }

        if (
            state.otherMode ===
            "excel"
        ) {

            return state.otherPOs;

        }

        return collectPOInputs(
            "otherPO",
            CONFIG.maxManualPO
        );

    }


    if (
        state.cocoMode ===
        "multiple"
    ) {

        return collectMultiplePOs(
            "cocoMultiplePO"
        );

    }


    if (
        state.cocoMode ===
        "excel"
    ) {

        return state.cocoPOs;

    }


    return collectPOInputs(
        "cocoPO",
        CONFIG.maxManualPO
    );

}


/* =========================================================
   BOX RANGE
========================================================= */

function normalizeBoxRange() {

    if (
        state.endBox <
        state.startBox
    ) {

        state.endBox =
            state.startBox;

        setValue(
            "endBoxNumber",
            state.endBox
        );

    }

}


/* =========================================================
   PAGE SETTINGS
========================================================= */

function bindPageSettings() {

    on(
        "pageSize",
        "change",
        () => {

            state.pageSize =
                value(
                    "pageSize",
                    "4x6"
                );

            updateCustomSizeState();

            updatePreview();

            showToast(
                `${getPageSizeLabel()} page selected`,
                "success"
            );

        }
    );


    on(
        "orientation",
        "change",
        () => {

            state.orientation =
                value(
                    "orientation",
                    "portrait"
                );

            updatePreview();

            showToast(
                `${capitalize(state.orientation)} mode selected`,
                "success"
            );

        }
    );


    on(
        "customWidth",
        "input",
        () => {

            state.customWidth =
                value(
                    "customWidth"
                );

            updatePreview();

        }
    );


    on(
        "customHeight",
        "input",
        () => {

            state.customHeight =
                value(
                    "customHeight"
                );

            updatePreview();

        }
    );


    bindIndependentPageSettings(
        "otherPageSize",
        "otherOrientation",
        "otherCustomSizePanel",
        "otherCustomWidth",
        "otherCustomHeight"
    );


    bindIndependentPageSettings(
        "isbnPageSize",
        "isbnOrientation",
        "isbnCustomSizePanel",
        "isbnCustomWidth",
        "isbnCustomHeight"
    );


    bindIndependentPageSettings(
        "addressPageSize",
        "addressOrientation",
        "addressCustomSizePanel",
        "addressCustomWidth",
        "addressCustomHeight"
    );

}


function bindIndependentPageSettings(
    pageId,
    orientationId,
    customPanelId,
    widthId,
    heightId
) {

    on(
        pageId,
        "change",
        () => {

            updateIndependentCustomState(
                pageId,
                customPanelId,
                widthId,
                heightId
            );

            showToast(
                `${getIndependentPageLabel(pageId)} selected`,
                "success"
            );

        }
    );


    on(
        orientationId,
        "change",
        () => {

            showToast(
                `${capitalize(
                    value(
                        orientationId
                    )
                )} mode selected`,
                "success"
            );

        }
    );

}


function updateIndependentCustomState(
    pageId,
    panelId,
    widthId,
    heightId
) {

    const isCustom =
        value(pageId) ===
        "custom";


    const panel =
        $(panelId);

    const width =
        $(widthId);

    const height =
        $(heightId);


    if (panel) {

        panel.classList.toggle(
            "hidden",
            !isCustom
        );

    }


    if (width) {
        width.disabled =
            !isCustom;
    }

    if (height) {
        height.disabled =
            !isCustom;
    }

}


function updateCustomSizeState() {

    const isCustom =
        state.pageSize ===
        "custom";


    const panel =
        $("customSizePanel");

    const width =
        $("customWidth");

    const height =
        $("customHeight");


    if (panel) {

        panel.classList.toggle(
            "hidden",
            !isCustom
        );

    }


    if (width) {
        width.disabled =
            !isCustom;
    }

    if (height) {
        height.disabled =
            !isCustom;
    }

}


function getPageDimensions() {

    let width;
    let height;


    switch (state.pageSize) {

        case "4x6":

            width = 101.6;
            height = 152.4;

            break;


        case "70x35":

            /*
             * IMPORTANT:
             * Portrait = 70 W × 35 H
             * Landscape = 35 W × 70 H
             */

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
                ) || 70;

            height =
                Number(
                    state.customHeight
                ) || 35;

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


function getPageSizeLabel() {

    switch (state.pageSize) {

        case "4x6":
            return "4 × 6 Inches";

        case "70x35":
            return "70 × 35 mm";

        case "a4":
            return "A4";

        case "custom":
            return `${state.customWidth || 70} × ${state.customHeight || 35} mm`;

        default:
            return "Page";

    }

}


function getIndependentPageLabel(id) {

    const val =
        value(id);

    switch (val) {

        case "4x6":
            return "4 × 6 Inches";

        case "70x35":
            return "70 × 35 mm";

        case "a4":
            return "A4";

        case "custom":
            return "Custom";

        default:
            return "Page";

    }

}


/* =========================================================
   LABEL SETTINGS
========================================================= */

function bindLabelSettings() {

    on(
        "poNumberCheck",
        "change",
        () => {

            state.showPO =
                checked(
                    "poNumberCheck"
                );

            notifyToggle(
                state.showPO,
                "PO Number"
            );

            updatePreview();

        }
    );


    on(
        "boxNumberCheck",
        "change",
        () => {

            state.showBox =
                checked(
                    "boxNumberCheck"
                );

            notifyToggle(
                state.showBox,
                "Box Number"
            );

            updatePreview();

        }
    );


    on(
        "poPlusBoxCheck",
        "change",
        () => {

            state.poPlusBox =
                checked(
                    "poPlusBoxCheck"
                );

            applyPOPlusBoxLock();

            notifyToggle(
                state.poPlusBox,
                "PO Number + Box Number"
            );

            updatePreview();

        }
    );


    on(
        "combinedBorderCheck",
        "change",
        () => {

            state.combinedBorder =
                checked(
                    "combinedBorderCheck"
                );

            applyCombinedBorderLock();

            notifyToggle(
                state.combinedBorder,
                "Combined Border"
            );

            updatePreview();

        }
    );


    on(
        "poBorderCheck",
        "change",
        () => {

            state.poBorder =
                checked(
                    "poBorderCheck"
                );

            notifyToggle(
                state.poBorder,
                "PO Border"
            );

            updatePreview();

        }
    );


    on(
        "boxBorderCheck",
        "change",
        () => {

            state.boxBorder =
                checked(
                    "boxBorderCheck"
                );

            notifyToggle(
                state.boxBorder,
                "Box Border"
            );

            updatePreview();

        }
    );


    on(
        "cutLineCheck",
        "change",
        () => {

            state.cutLine =
                checked(
                    "cutLineCheck"
                );

            notifyToggle(
                state.cutLine,
                "Cut Line / Scissor Mark"
            );

            updatePreview();

        }
    );


    on(
        "pageBorderCheck",
        "change",
        () => {

            state.pageBorder =
                checked(
                    "pageBorderCheck"
                );

            notifyToggle(
                state.pageBorder,
                "Page Border"
            );

            updatePreview();

        }
    );

}


/* =========================================================
   PO + BOX LOCK
========================================================= */

function applyPOPlusBoxLock() {

    const po =
        $("poNumberCheck");

    const box =
        $("boxNumberCheck");


    if (
        state.poPlusBox
    ) {

        /*
         * Separate PO and Box controls
         * are frozen.
         */

        if (po) {

            po.checked = false;
            po.disabled = true;

            markDisabled(
                po,
                true
            );

        }


        if (box) {

            box.checked = false;
            box.disabled = true;

            markDisabled(
                box,
                true
            );

        }

    } else {

        if (po) {

            po.disabled = false;

            /*
             * Restore normal defaults.
             */
            po.checked =
                state.showPO;

            markDisabled(
                po,
                false
            );

        }


        if (box) {

            box.disabled = false;

            box.checked =
                state.showBox;

            markDisabled(
                box,
                false
            );

        }

    }

}


function applyCombinedBorderLock() {

    const po =
        $("poBorderCheck");

    const box =
        $("boxBorderCheck");


    if (
        state.combinedBorder
    ) {

        if (po) {

            po.checked = false;
            po.disabled = true;

            markDisabled(
                po,
                true
            );

        }


        if (box) {

            box.checked = false;
            box.disabled = true;

            markDisabled(
                box,
                true
            );

        }

    } else {

        if (po) {

            po.disabled = false;

            markDisabled(
                po,
                false
            );

        }


        if (box) {

            box.disabled = false;

            markDisabled(
                box,
                false
            );

        }

    }

}


function markDisabled(
    input,
    disabled
) {

    const label =
        input.closest(
            ".feature-check"
        );


    if (!label) return;


    label.classList.toggle(
        "locked-control",
        disabled
    );

}


/* =========================================================
   FONT SETTINGS
========================================================= */

function bindFontSettings() {

    bindFontGroup(
        "poFontFamily",
        "poFontSize",
        "poBoldCheck",
        "poItalicCheck",
        "poUnderlineCheck",
        "po"
    );


    bindFontGroup(
        "boxFontFamily",
        "boxFontSize",
        "boxBoldCheck",
        "boxItalicCheck",
        "boxUnderlineCheck",
        "box"
    );


    bindFontGroup(
        "fromFontFamily",
        "fromFontSize",
        "fromBold",
        "fromItalic",
        "fromUnderline",
        "addressFrom"
    );


    on(
        "fromBorder",
        "change",
        () => {

            state.addressFromBorder =
                checked(
                    "fromBorder"
                );

            notifyToggle(
                state.addressFromBorder,
                "From Border"
            );

        }
    );


    bindFontGroup(
        "toFontFamily",
        "toFontSize",
        "toBold",
        "toItalic",
        "toUnderline",
        "addressTo"
    );


    on(
        "toBorder",
        "change",
        () => {

            state.addressToBorder =
                checked(
                    "toBorder"
                );

            notifyToggle(
                state.addressToBorder,
                "To Border"
            );

        }
    );

}


function bindFontGroup(
    familyId,
    sizeId,
    boldId,
    italicId,
    underlineId,
    type
) {

    on(
        familyId,
        "change",
        () => {

            if (type === "po") {
                state.poFont =
                    value(familyId);
            } else if (type === "box") {
                state.boxFont =
                    value(familyId);
            } else if (
                type === "addressFrom"
            ) {
                state.addressFromFont =
                    value(familyId);
            } else {
                state.addressToFont =
                    value(familyId);
            }

            updatePreview();

        }
    );


    on(
        sizeId,
        "change",
        () => {

            const size =
                clampNumber(
                    value(sizeId),
                    1,
                    CONFIG.maxFontSize
                );


            if (type === "po") {
                state.poFontSize = size;
            } else if (type === "box") {
                state.boxFontSize = size;
            } else if (
                type === "addressFrom"
            ) {
                state.addressFromSize = size;
            } else {
                state.addressToSize = size;
            }

            updatePreview();

        }
    );


    on(
        boldId,
        "change",
        () => {

            const val =
                checked(boldId);

            if (type === "po") {
                state.poBold = val;
            } else if (type === "box") {
                state.boxBold = val;
            } else if (
                type === "addressFrom"
            ) {
                state.addressFromBold = val;
            } else {
                state.addressToBold = val;
            }

            updatePreview();

        }
    );


    on(
        italicId,
        "change",
        () => {

            const val =
                checked(italicId);

            if (type === "po") {
                state.poItalic = val;
            } else if (type === "box") {
                state.boxItalic = val;
            } else if (
                type === "addressFrom"
            ) {
                state.addressFromItalic = val;
            } else {
                state.addressToItalic = val;
            }

            updatePreview();

        }
    );


    on(
        underlineId,
        "change",
        () => {

            const val =
                checked(underlineId);

            if (type === "po") {
                state.poUnderline = val;
            } else if (type === "box") {
                state.boxUnderline = val;
            } else if (
                type === "addressFrom"
            ) {
                state.addressFromUnderline = val;
            } else {
                state.addressToUnderline = val;
            }

            updatePreview();

        }
    );

}


/* =========================================================
   EXCEL UPLOAD
========================================================= */

function bindExcelUploads() {

    on(
        "cocoExcelFile",
        "change",
        (event) => {

            handleExcelFile(
                event,
                "coco"
            );

        }
    );


    on(
        "otherExcelFile",
        "change",
        (event) => {

            handleExcelFile(
                event,
                "other"
            );

        }
    );


    on(
        "addressExcelFile",
        "change",
        (event) => {

            handleExcelFile(
                event,
                "address"
            );

        }
    );

}


function handleExcelFile(
    event,
    type
) {

    const file =
        event.target.files?.[0];

    if (!file) return;


    const filename =
        file.name;


    if (type === "coco") {

        setText(
            "cocoExcelFileName",
            filename
        );

    }


    if (type === "other") {

        setText(
            "otherExcelFileName",
            filename
        );

    }


    if (type === "address") {

        setText(
            "addressExcelFileName",
            filename
        );

    }


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


    reader.onload =
        (e) => {

            try {

                const workbook =
                    XLSX.read(
                        new Uint8Array(
                            e.target.result
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


                if (
                    type === "coco"
                ) {

                    state.cocoExcelRows =
                        rows;

                    state.cocoPOs =
                        extractPOsFromRows(
                            rows
                        );

                    renderExcelPreview(
                        "cocoExcelPreview",
                        rows
                    );

                }


                if (
                    type === "other"
                ) {

                    state.otherExcelRows =
                        rows;

                    state.otherPOs =
                        extractPOsFromRows(
                            rows
                        );

                    renderExcelPreview(
                        "otherExcelPreview",
                        rows
                    );

                }


                if (
                    type === "address"
                ) {

                    state.addressExcelRows =
                        rows;

                    renderExcelPreview(
                        "addressExcelPreview",
                        rows
                    );

                }


                showToast(
                    `${rows.length} rows loaded`,
                    "success"
                );


            } catch (error) {

                console.error(
                    error
                );

                showToast(
                    "Excel file could not be read",
                    "error"
                );

            }

        };


    reader.onerror =
        () => {

            showToast(
                "Unable to read Excel file",
                "error"
            );

        };


    reader.readAsArrayBuffer(
        file
    );

}


function extractPOsFromRows(rows) {

    return rows
        .map(row => row?.[0])
        .map(item =>
            String(item ?? "")
                .trim()
        )
        .filter(Boolean);

}


function renderExcelPreview(
    containerId,
    rows
) {

    const container =
        $(containerId);

    if (!container) return;


    const previewRows =
        rows.slice(
            0,
            20
        );


    if (!previewRows.length) {

        container.innerHTML =
            "";

        return;

    }


    const table =
        document.createElement(
            "table"
        );


    previewRows.forEach(
        (row, rowIndex) => {

            const tr =
                document.createElement(
                    "tr"
                );


            row.forEach(cell => {

                const cellElement =
                    document.createElement(
                        rowIndex === 0
                            ? "th"
                            : "td"
                    );


                cellElement.textContent =
                    cell;


                tr.appendChild(
                    cellElement
                );

            });


            table.appendChild(
                tr
            );

        }
    );


    container.innerHTML =
        "";

    container.appendChild(
        table
    );

}


/* =========================================================
   ISBN
========================================================= */

function bindISBN() {

    [
        "isbnValue",
        "isbnBookTitle",
        "isbnEdition"
    ].forEach(id => {

        on(
            id,
            "input",
            updateISBNPreview
        );

    });


    on(
        "isbnPageSize",
        "change",
        () => {

            updateIndependentCustomState(
                "isbnPageSize",
                "isbnCustomSizePanel",
                "isbnCustomWidth",
                "isbnCustomHeight"
            );

        }
    );


    on(
        "isbnGenerateButton",
        "click",
        generateISBNPDF
    );


    on(
        "isbnResetButton",
        "click",
        resetISBN
    );

}


function updateISBNPreview() {

    const svg =
        $("isbnBarcodeSvg");

    const text =
        $("isbnBarcodeText");


    if (!svg || !text) return;


    const isbn =
        value(
            "isbnValue"
        ).trim();


    const title =
        value(
            "isbnBookTitle"
        ).trim();


    const edition =
        value(
            "isbnEdition"
        ).trim();


    svg.innerHTML =
        "";

    text.textContent =
        "";


    if (!isbn) {

        text.textContent =
            "Enter ISBN to preview";

        return;

    }


    if (
        typeof JsBarcode ===
        "undefined"
    ) {

        text.textContent =
            isbn;

        return;

    }


    try {

        JsBarcode(
            svg,
            isbn,
            {
                format: "CODE128",
                lineColor: "#111827",
                background: "#ffffff",
                width: 2,
                height: 75,
                displayValue: true,
                fontSize: 13,
                margin: 10
            }
        );

    } catch (error) {

        console.error(
            error
        );

        text.textContent =
            "Invalid barcode value";

        return;

    }


    text.textContent =
        [
            title,
            edition
        ]
            .filter(Boolean)
            .join(" • ");

}


/* =========================================================
   ADDRESS INPUTS
========================================================= */

function bindAddressInputs() {

    [
        "addressFrom",
        "addressTo",
        "cocoFromAddress",
        "cocoToAddress",
        "otherFromAddress",
        "otherToAddress"
    ].forEach(id => {

        on(
            id,
            "input",
            updateAddressPreview
        );

    });


    [
        "fromBorder",
        "toBorder",
        "fromBold",
        "fromItalic",
        "fromUnderline",
        "toBold",
        "toItalic",
        "toUnderline"
    ].forEach(id => {

        on(
            id,
            "change",
            updateAddressPreview
        );

    });


    on(
        "fromFontFamily",
        "change",
        updateAddressPreview
    );

    on(
        "fromFontSize",
        "change",
        updateAddressPreview
    );

    on(
        "toFontFamily",
        "change",
        updateAddressPreview
    );

    on(
        "toFontSize",
        "change",
        updateAddressPreview
    );


    on(
        "addressGenerateButton",
        "click",
        generateAddressPDF
    );


    on(
        "addressResetButton",
        "click",
        resetAddress
    );

}


/* =========================================================
   MAIN BUTTONS
========================================================= */

function bindMainButtons() {

    on(
        "cocoGenerateButton",
        "click",
        generateCocoPDF
    );


    on(
        "cocoResetButton",
        "click",
        resetCoco
    );


    on(
        "otherGenerateButton",
        "click",
        generateOtherPDF
    );


    on(
        "otherResetButton",
        "click",
        resetOther
    );

}


/* =========================================================
   PREVIEW
========================================================= */

function updateEverything() {

    updateCustomSizeState();

    updatePageInfo();

    updatePreview();

    updateISBNPreview();

    updateAddressPreview();

}


function updatePageInfo() {

    setText(
        "selectedPageInfo",
        getPageSizeLabel()
    );

    setText(
        "previewPageSize",
        getPageSizeLabel()
    );

}


function updatePreview() {

    const page =
        $("previewPage");

    const label =
        $("previewLabel");

    const po =
        $("previewPO");

    const box =
        $("previewBox");


    if (
        !page ||
        !label ||
        !po ||
        !box
    ) {
        return;
    }


    const dimensions =
        getPageDimensions();


    const maxWidth =
        440;

    const maxHeight =
        470;


    const scale =
        Math.min(
            maxWidth / dimensions.width,
            maxHeight / dimensions.height
        );


    page.style.width =
        `${Math.max(
            80,
            dimensions.width * scale
        )}px`;


    page.style.height =
        `${Math.max(
            80,
            dimensions.height * scale
        )}px`;


    page.classList.toggle(
        "page-border",
        state.pageBorder
    );


    page.classList.toggle(
        "cut-lines",
        state.cutLine
    );


    label.classList.toggle(
        "combined-border",
        state.combinedBorder
    );


    po.classList.toggle(
        "individual-border",
        state.poBorder &&
        !state.poPlusBox
    );


    box.classList.toggle(
        "individual-border",
        state.boxBorder &&
        !state.poPlusBox
    );


    po.style.fontFamily =
        state.poFont;


    po.style.fontSize =
        `${state.poFontSize}px`;


    po.style.fontWeight =
        state.poBold
            ? "800"
            : "500";


    po.style.fontStyle =
        state.poItalic
            ? "italic"
            : "normal";


    po.style.textDecoration =
        state.poUnderline
            ? "underline"
            : "none";


    box.style.fontFamily =
        state.boxFont;


    box.style.fontSize =
        `${state.boxFontSize}px`;


    box.style.fontWeight =
        state.boxBold
            ? "800"
            : "500";


    box.style.fontStyle =
        state.boxItalic
            ? "italic"
            : "normal";


    box.style.textDecoration =
        state.boxUnderline
            ? "underline"
            : "none";


    const poList =
        getCurrentPOs();


    const samplePO =
        poList[0] ||
        "PO NUMBER";


    const sampleBox =
        state.startBox || 1;


    if (
        state.poPlusBox
    ) {

        po.style.display =
            "block";

        box.style.display =
            "none";

        po.textContent =
            `${samplePO} — BOX NO. ${sampleBox}`;

    } else {

        po.style.display =
            state.showPO
                ? "block"
                : "none";

        box.style.display =
            state.showBox
                ? "block"
                : "none";

        po.textContent =
            samplePO;

        box.textContent =
            `BOX NO. ${sampleBox}`;

    }

}


/* =========================================================
   LABEL GENERATION DATA
========================================================= */

function buildLabels(
    pos
) {

    const labels = [];


    if (!pos.length) {
        return labels;
    }


    const start =
        Math.max(
            1,
            Number(
                state.startBox
            ) || 1
        );


    const end =
        Math.max(
            start,
            Number(
                state.endBox
            ) || start
        );


    const repeat =
        Math.max(
            1,
            Number(
                state.repeatCount
            ) || 1
        );


    pos.forEach(po => {

        for (
            let box = start;
            box <= end;
            box++
        ) {

            for (
                let count = 0;
                count < repeat;
                count++
            ) {

                labels.push({
                    po,
                    box,
                    repeat: count + 1
                });

            }

        }

    });


    return labels;

}


/* =========================================================
   PDF SIZE
========================================================= */

function getPDFPageOptions(
    pageSizeId,
    orientationId,
    widthId,
    heightId
) {

    let width;
    let height;


    const size =
        value(
            pageSizeId,
            "4x6"
        );


    switch (size) {

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
                    value(
                        widthId,
                        70
                    )
                ) || 70;

            height =
                Number(
                    value(
                        heightId,
                        35
                    )
                ) || 35;

            break;


        default:

            width = 101.6;
            height = 152.4;

    }


    if (
        value(
            orientationId,
            "portrait"
        ) === "landscape"
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
   PDF GENERATOR
========================================================= */

function getJsPDF() {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        showToast(
            "jsPDF library is not loaded",
            "error"
        );

        return null;

    }


    return window.jspdf.jsPDF;

}


/* =========================================================
   COCO PDF
========================================================= */

function generateCocoPDF() {

    const JsPDF =
        getJsPDF();

    if (!JsPDF) return;


    const pos =
        getCurrentPOs();


    if (!pos.length) {

        showToast(
            "Please enter at least one PO number",
            "error"
        );

        return;

    }


    const labels =
        buildLabels(pos);


    generateLabelPDF(
        labels,
        {
            pageSize: "pageSize",
            orientation: "orientation",
            customWidth: "customWidth",
            customHeight: "customHeight"
        },
        "Coco_Blue_PO"
    );

}


/* =========================================================
   OTHER PO PDF
========================================================= */

function generateOtherPDF() {

    const JsPDF =
        getJsPDF();

    if (!JsPDF) return;


    const pos =
        getCurrentPOs();


    if (!pos.length) {

        showToast(
            "Please enter at least one Other PO number",
            "error"
        );

        return;

    }


    const labels =
        buildLabels(pos);


    generateLabelPDF(
        labels,
        {
            pageSize: "otherPageSize",
            orientation: "otherOrientation",
            customWidth: "otherCustomWidth",
            customHeight: "otherCustomHeight"
        },
        "Other_PO"
    );

}


/* =========================================================
   GENERIC LABEL PDF
========================================================= */

function generateLabelPDF(
    labels,
    pageConfig,
    filenamePrefix
) {

    const JsPDF =
        getJsPDF();

    if (!JsPDF) return;


    const dimensions =
        getPDFPageOptions(
            pageConfig.pageSize,
            pageConfig.orientation,
            pageConfig.customWidth,
            pageConfig.customHeight
        );


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const pdf =
        new JsPDF({
            orientation,
            unit: "mm",
            format: [
                dimensions.width,
                dimensions.height
            ],
            compress: true
        });


    const labelsPerPage =
        state.halfPageFlow
            ? 2
            : Math.max(
                1,
                Number(
                    state.labelsPerPage
                ) || 1
            );


    labels.forEach(
        (label, index) => {

            if (
                index > 0 &&
                index % labelsPerPage === 0
            ) {

                pdf.addPage(
                    [
                        dimensions.width,
                        dimensions.height
                    ],
                    orientation
                );

            }


            const slot =
                index %
                labelsPerPage;


            const slotHeight =
                dimensions.height /
                labelsPerPage;


            const y =
                slot *
                slotHeight;


            drawLabelOnPDF(
                pdf,
                label,
                0,
                y,
                dimensions.width,
                slotHeight
            );

        }
    );


    const filename =
        `${filenamePrefix}_${timestamp()}.pdf`;


    pdf.save(
        filename
    );


    showToast(
        `${labels.length} labels generated successfully`,
        "success"
    );

}


/* =========================================================
   DRAW LABEL
========================================================= */

function drawLabelOnPDF(
    pdf,
    label,
    x,
    y,
    width,
    height
) {

    const centerX =
        x + width / 2;


    /* ---------------------------------------------
       CUT LINE
    ---------------------------------------------- */

    if (
        state.cutLine
    ) {

        pdf.setDrawColor(
            120,
            130,
            145
        );

        pdf.setLineDashPattern(
            [2, 2],
            0
        );

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


    /* ---------------------------------------------
       PAGE / LABEL BORDER
    ---------------------------------------------- */

    if (
        state.pageBorder
    ) {

        pdf.setDrawColor(
            20,
            30,
            45
        );

        pdf.setLineWidth(
            .5
        );

        pdf.rect(
            x + 1,
            y + 1,
            width - 2,
            height - 2
        );

    }


    let currentY =
        y + height * .42;


    /* ---------------------------------------------
       PO + BOX
    ---------------------------------------------- */

    if (
        state.poPlusBox
    ) {

        const text =
            `${label.po} — BOX NO. ${label.box}`;


        applyPDFText(
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

            pdf.setLineWidth(
                .5
            );

            pdf.rect(
                centerX -
                    textWidth / 2 -
                    4,

                currentY -
                    state.poFontSize * .35 -
                    3,

                textWidth + 8,

                state.poFontSize * .7 +
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
       PO
    ---------------------------------------------- */

    if (
        state.showPO
    ) {

        applyPDFText(
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
                    state.poFontSize * .35 -
                    3,

                poWidth + 8,

                state.poFontSize * .7 +
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
                state.poFontSize * .8
            );

    }


    /* ---------------------------------------------
       BOX
    ---------------------------------------------- */

    if (
        state.showBox
    ) {

        const boxText =
            `BOX NO. ${label.box}`;


        applyPDFText(
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
                    state.boxFontSize * .35 -
                    3,

                boxWidth + 8,

                state.boxFontSize * .7 +
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
   PDF FONT
========================================================= */

function applyPDFText(
    pdf,
    type
) {

    const isPO =
        type === "po";


    const font =
        isPO
            ? state.poFont
            : state.boxFont;


    const size =
        isPO
            ? state.poFontSize
            : state.boxFontSize;


    const bold =
        isPO
            ? state.poBold
            : state.boxBold;


    const italic =
        isPO
            ? state.poItalic
            : state.boxItalic;


    let style =
        "normal";


    if (
        bold &&
        italic
    ) {

        style =
            "bolditalic";

    } else if (bold) {

        style =
            "bold";

    } else if (italic) {

        style =
            "italic";

    }


    let pdfFont =
        "helvetica";


    const lower =
        String(font)
            .toLowerCase();


    if (
        lower.includes("times") ||
        lower.includes("cambria") ||
        lower.includes("georgia") ||
        lower.includes("garamond")
    ) {

        pdfFont =
            "times";

    }


    if (
        lower.includes("courier") ||
        lower.includes("consolas")
    ) {

        pdfFont =
            "courier";

    }


    pdf.setFont(
        pdfFont,
        style
    );


    pdf.setFontSize(
        clampNumber(
            size,
            1,
            48
        )
    );

}


/* =========================================================
   ADDRESS PREVIEW
========================================================= */

function updateAddressPreview() {

    /*
     * Address preview is kept independent
     * from the PO label preview.
     */

    const from =
        value(
            "addressFrom"
        );

    const to =
        value(
            "addressTo"
        );


    if (!from && !to) {
        return;
    }

}


/* =========================================================
   ADDRESS PDF
========================================================= */

function generateAddressPDF() {

    const JsPDF =
        getJsPDF();

    if (!JsPDF) return;


    const from =
        value(
            "addressFrom"
        ).trim();


    const to =
        value(
            "addressTo"
        ).trim();


    if (!from && !to) {

        showToast(
            "Enter From or To address",
            "error"
        );

        return;

    }


    const dimensions =
        getPDFPageOptions(
            "addressPageSize",
            "addressOrientation",
            "addressCustomWidth",
            "addressCustomHeight"
        );


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const pdf =
        new JsPDF({
            orientation,
            unit: "mm",
            format: [
                dimensions.width,
                dimensions.height
            ]
        });


    const half =
        dimensions.height / 2;


    if (from) {

        drawAddressBlock(
            pdf,
            from,
            5,
            5,
            dimensions.width - 10,
            half - 10,
            "from"
        );

    }


    if (to) {

        drawAddressBlock(
            pdf,
            to,
            5,
            half + 5,
            dimensions.width - 10,
            half - 10,
            "to"
        );

    }


    pdf.save(
        `Address_Sticker_${timestamp()}.pdf`
    );


    showToast(
        "Address PDF generated successfully",
        "success"
    );

}


function drawAddressBlock(
    pdf,
    text,
    x,
    y,
    width,
    height,
    type
) {

    const isFrom =
        type === "from";


    const font =
        isFrom
            ? state.addressFromFont
            : state.addressToFont;


    const size =
        isFrom
            ? state.addressFromSize
            : state.addressToSize;


    const bold =
        isFrom
            ? state.addressFromBold
            : state.addressToBold;


    const italic =
        isFrom
            ? state.addressFromItalic
            : state.addressToItalic;


    const underline =
        isFrom
            ? state.addressFromUnderline
            : state.addressToUnderline;


    const border =
        isFrom
            ? state.addressFromBorder
            : state.addressToBorder;


    let pdfFont =
        "helvetica";


    const lower =
        font.toLowerCase();


    if (
        lower.includes("times") ||
        lower.includes("cambria") ||
        lower.includes("georgia") ||
        lower.includes("garamond")
    ) {

        pdfFont =
            "times";

    }


    if (
        lower.includes("courier") ||
        lower.includes("consolas")
    ) {

        pdfFont =
            "courier";

    }


    let style =
        "normal";


    if (
        bold &&
        italic
    ) {

        style =
            "bolditalic";

    } else if (bold) {

        style =
            "bold";

    } else if (italic) {

        style =
            "italic";

    }


    pdf.setFont(
        pdfFont,
        style
    );


    pdf.setFontSize(
        clampNumber(
            size,
            1,
            48
        )
    );


    if (border) {

        pdf.rect(
            x,
            y,
            width,
            height
        );

    }


    const lines =
        pdf.splitTextToSize(
            text,
            width - 8
        );


    let currentY =
        y + 8;


    lines.forEach(line => {

        if (
            currentY >
            y + height - 3
        ) {
            return;
        }


        pdf.text(
            line,
            x + 4,
            currentY
        );


        if (underline) {

            const lineWidth =
                pdf.getTextWidth(
                    line
                );


            pdf.line(
                x + 4,
                currentY + 1,
                x + 4 + lineWidth,
                currentY + 1
            );

        }


        currentY +=
            Math.max(
                4,
                Number(size) * .4
            );

    });

}


/* =========================================================
   ISBN PDF
========================================================= */

function generateISBNPDF() {

    const JsPDF =
        getJsPDF();

    if (!JsPDF) return;


    const isbn =
        value(
            "isbnValue"
        ).trim();


    const title =
        value(
            "isbnBookTitle"
        ).trim();


    const edition =
        value(
            "isbnEdition"
        ).trim();


    if (!isbn) {

        showToast(
            "Enter ISBN",
            "error"
        );

        return;

    }


    if (!title) {

        showToast(
            "Enter Book Name / Title",
            "error"
        );

        return;

    }


    const dimensions =
        getPDFPageOptions(
            "isbnPageSize",
            "isbnOrientation",
            "isbnCustomWidth",
            "isbnCustomHeight"
        );


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    const pdf =
        new JsPDF({
            orientation,
            unit: "mm",
            format: [
                dimensions.width,
                dimensions.height
            ]
        });


    const centerX =
        dimensions.width / 2;


    let currentY =
        dimensions.height * .30;


    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(
        18
    );


    pdf.text(
        title,
        centerX,
        currentY,
        {
            align: "center"
        }
    );


    currentY += 10;


    if (edition) {

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(
            11
        );

        pdf.text(
            edition,
            centerX,
            currentY,
            {
                align: "center"
            }
        );

        currentY += 9;

    }


    /*
     * Draw a simple barcode representation
     * directly into PDF.
     */

    drawBarcodePDF(
        pdf,
        isbn,
        centerX,
        currentY,
        Math.min(
            dimensions.width * .75,
            100
        ),
        28
    );


    pdf.save(
        `ISBN_Barcode_${timestamp()}.pdf`
    );


    showToast(
        "ISBN Barcode PDF generated successfully",
        "success"
    );

}


/* =========================================================
   SIMPLE PDF BARCODE
========================================================= */

function drawBarcodePDF(
    pdf,
    text,
    centerX,
    y,
    width,
    height
) {

    const clean =
        String(text)
            .replace(
                /\s+/g,
                ""
            );


    if (!clean) return;


    const bars = [];


    for (
        let i = 0;
        i < clean.length;
        i++
    ) {

        const code =
            clean.charCodeAt(i);


        bars.push(
            1 + (code % 3),
            1 + ((code >> 2) % 3)
        );

    }


    const total =
        bars.reduce(
            (sum, n) => sum + n,
            0
        );


    const unit =
        width / total;


    let currentX =
        centerX -
        width / 2;


    bars.forEach(
        (barWidth, index) => {

            if (
                index % 2 === 0
            ) {

                pdf.setFillColor(
                    0,
                    0,
                    0
                );

                pdf.rect(
                    currentX,
                    y,
                    barWidth * unit,
                    height,
                    "F"
                );

            }


            currentX +=
                barWidth * unit;

        }
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(
        9
    );


    pdf.text(
        text,
        centerX,
        y + height + 7,
        {
            align: "center"
        }
    );

}


/* =========================================================
   RESET COCO
========================================================= */

function resetCoco() {

    for (
        let i = 1;
        i <= CONFIG.maxManualPO;
        i++
    ) {

        setValue(
            `cocoPO${i}`,
            ""
        );

    }


    setValue(
        "cocoMultiplePO",
        ""
    );


    if ($("cocoExcelFile")) {
        $("cocoExcelFile").value = "";
    }


    setText(
        "cocoExcelFileName",
        "No file selected"
    );


    state.cocoPOs =
        [];

    state.cocoExcelRows =
        [];


    setValue(
        "startBoxNumber",
        1
    );

    setValue(
        "endBoxNumber",
        10
    );

    setValue(
        "boxRepeatCount",
        1
    );


    state.startBox =
        1;

    state.endBox =
        10;

    state.repeatCount =
        1;


    showToast(
        "Coco Blue settings reset",
        "success"
    );


    updatePreview();

}


/* =========================================================
   RESET OTHER PO
========================================================= */

function resetOther() {

    for (
        let i = 1;
        i <= CONFIG.maxManualPO;
        i++
    ) {

        setValue(
            `otherPO${i}`,
            ""
        );

    }


    setValue(
        "otherMultiplePO",
        ""
    );


    if ($("otherExcelFile")) {
        $("otherExcelFile").value = "";
    }


    setText(
        "otherExcelFileName",
        "No file selected"
    );


    state.otherPOs =
        [];

    state.otherExcelRows =
        [];


    showToast(
        "Other PO settings reset",
        "success"
    );

}


/* =========================================================
   RESET ISBN
========================================================= */

function resetISBN() {

    setValue(
        "isbnValue",
        ""
    );

    setValue(
        "isbnBookTitle",
        ""
    );

    setValue(
        "isbnEdition",
        ""
    );


    updateISBNPreview();


    showToast(
        "ISBN settings reset",
        "success"
    );

}


/* =========================================================
   RESET ADDRESS
========================================================= */

function resetAddress() {

    setValue(
        "addressFrom",
        ""
    );

    setValue(
        "addressTo",
        ""
    );


    showToast(
        "Address settings reset",
        "success"
    );

}


/* =========================================================
   MODAL
========================================================= */

function bindModal() {

    on(
        "modalCloseButton",
        "click",
        closeModal
    );


    on(
        "modalCancelButton",
        "click",
        closeModal
    );


    on(
        "confirmationModal",
        "click",
        (event) => {

            if (
                event.target ===
                $("confirmationModal")
            ) {

                closeModal();

            }

        }
    );

}


function openModal(
    title,
    message,
    confirmCallback
) {

    const modal =
        $("confirmationModal");


    if (!modal) return;


    setText(
        "modalTitle",
        title
    );


    setText(
        "modalMessage",
        message
    );


    modal.classList.add(
        "show"
    );


    const confirmButton =
        $("modalConfirmButton");


    if (confirmButton) {

        confirmButton.onclick =
            () => {

                if (
                    typeof confirmCallback ===
                    "function"
                ) {

                    confirmCallback();

                }

                closeModal();

            };

    }

}


function closeModal() {

    const modal =
        $("confirmationModal");


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message,
    type = "success"
) {

    const toast =
        $("toast");

    const messageBox =
        $("toastMessage");

    const icon =
        $("toastIcon");


    if (
        !toast ||
        !messageBox
    ) {

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


    if (icon) {

        icon.textContent =
            type === "error"
                ? "!"
                : type === "warning"
                    ? "!"
                    : "✓";

    }


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
            2400
        );

}


function notifyToggle(
    enabled,
    feature
) {

    showToast(
        enabled
            ? `${feature} has been enabled`
            : `${feature} has been disabled`,
        enabled
            ? "success"
            : "warning"
    );

}


/* =========================================================
   TEXT HELPER
========================================================= */

function setText(
    id,
    text
) {

    const el =
        $(id);

    if (el) {

        el.textContent =
            text;

    }

}


/* =========================================================
   DEFAULTS
========================================================= */

function initializeDefaults() {

    state.pageSize =
        value(
            "pageSize",
            "4x6"
        );


    state.orientation =
        value(
            "orientation",
            "portrait"
        );


    state.showPO =
        checked(
            "poNumberCheck",
            true
        );


    state.showBox =
        checked(
            "boxNumberCheck",
            true
        );


    state.poPlusBox =
        checked(
            "poPlusBoxCheck"
        );


    state.combinedBorder =
        checked(
            "combinedBorderCheck"
        );


    state.poBorder =
        checked(
            "poBorderCheck"
        );


    state.boxBorder =
        checked(
            "boxBorderCheck"
        );


    state.cutLine =
        checked(
            "cutLineCheck"
        );


    state.pageBorder =
        checked(
            "pageBorderCheck"
        );


    state.halfPageFlow =
        checked(
            "halfPageFlowCheck",
            true
        );


    state.poFont =
        value(
            "poFontFamily",
            "Arial"
        );


    state.poFontSize =
        Number(
            value(
                "poFontSize",
                24
            )
        );


    state.boxFont =
        value(
            "boxFontFamily",
            "Arial"
        );


    state.boxFontSize =
        Number(
            value(
                "boxFontSize",
                20
            )
        );


    updateCustomSizeState();

    applyPOPlusBoxLock();

    applyCombinedBorderLock();

}


/* =========================================================
   TIMESTAMP
========================================================= */

function timestamp() {

    const d =
        new Date();


    const pad =
        n =>
            String(n)
                .padStart(
                    2,
                    "0"
                );


    return [
        d.getFullYear(),
        pad(d.getMonth() + 1),
        pad(d.getDate())
    ].join("-") +
        "_" +
        [
            pad(d.getHours()),
            pad(d.getMinutes()),
            pad(d.getSeconds())
        ].join("-");

}


/* =========================================================
   PUBLIC DEBUG API
========================================================= */

window.BooksLabelStudio = {

    state,

    updatePreview,

    generateCocoPDF,

    generateOtherPDF,

    generateISBNPDF,

    generateAddressPDF,

    resetCoco,

    resetOther,

    resetISBN,

    resetAddress,

    showToast

};
