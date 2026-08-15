/* =========================================================
   BOOKS LABEL STUDIO
   FINAL APP.JS
   Works with the latest index.html + style.css
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const APP = {

    mapUrl:
        "https://maps.app.goo.gl/7McYApm1u9x4QSj7A",

    email:
        "ashish.verma@bookswagon.in",

    maxPO:
        40,

    maxFont:
        48,

    language:
        "en",

    category:
        "cocoBlue",

    cocoMode:
        "individual",

    otherMode:
        "individual",

    addressMode:
        "manual",

    toastTimer:
        null

};


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function $all(selector) {
    return Array.from(
        document.querySelectorAll(selector)
    );
}


function getValue(id, fallback = "") {

    const el = $(id);

    return el
        ? el.value
        : fallback;

}


function isChecked(id) {

    const el = $(id);

    return !!(
        el &&
        el.checked
    );

}


function setValue(id, value) {

    const el = $(id);

    if (el) {
        el.value = value;
    }

}


function setChecked(id, value) {

    const el = $(id);

    if (el) {
        el.checked = !!value;
    }

}


function setText(id, text) {

    const el = $(id);

    if (el) {
        el.textContent = text;
    }

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function numberValue(
    id,
    fallback = 0
) {

    const n =
        Number(
            getValue(
                id,
                fallback
            )
        );

    return Number.isFinite(n)
        ? n
        : fallback;

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

    const text =
        $("toastMessage");

    const icon =
        $("toastIcon");


    if (!toast || !text) {
        return;
    }


    clearTimeout(
        APP.toastTimer
    );


    text.textContent =
        message;


    toast.classList.remove(
        "success",
        "warning",
        "error",
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


    APP.toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2300
        );

}


function featureToast(
    name,
    enabled
) {

    showToast(
        enabled
            ? `${name} has been enabled`
            : `${name} has been disabled`,
        enabled
            ? "success"
            : "warning"
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initApp
);


function initApp() {

    buildPOInputs(
        "individualPOGrid",
        "cocoPO"
    );


    buildPOInputs(
        "otherIndividualPOGrid",
        "otherPO"
    );


    bindCategoryNavigation();

    bindCocoNavigation();

    bindOtherNavigation();

    bindAddressNavigation();

    bindPOInputs();

    bindBoxSettings();

    bindPageSettings();

    bindLabelFeatures();

    bindFontSettings();

    bindExcel();

    bindISBN();

    bindAddress();

    bindButtons();

    bindModal();

    bindLanguage();

    initializeState();

    generateLocationQR();

    updateAll();

}


/* =========================================================
   BUILD 40 PO INPUTS
========================================================= */

function buildPOInputs(
    containerId,
    prefix
) {

    const container =
        $(containerId);

    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    for (
        let i = 1;
        i <= APP.maxPO;
        i++
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "po-input-wrapper";


        wrapper.innerHTML = `

            <label for="${prefix}${i}">
                PO ${i}
            </label>

            <input
                id="${prefix}${i}"
                class="po-input"
                type="text"
                autocomplete="off"
                placeholder="PO ${i}"
            >

        `;


        container.appendChild(
            wrapper
        );

    }

}


/* =========================================================
   CATEGORY NAVIGATION
========================================================= */

function bindCategoryNavigation() {

    $all(".category-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.dataset.category;


                    if (!category) {
                        return;
                    }


                    APP.category =
                        category;


                    $all(".category-btn")
                        .forEach(btn => {

                            btn.classList.toggle(
                                "active",
                                btn === button
                            );

                        });


                    $all(".tool-section")
                        .forEach(section => {

                            section.classList.toggle(
                                "active",
                                section.dataset.tool ===
                                    category
                            );

                        });


                    updateAll();

                }
            );

        });

}


/* =========================================================
   COCO SUB NAV
========================================================= */

function bindCocoNavigation() {

    $all("[data-coco-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    APP.cocoMode =
                        button.dataset.cocoMode;


                    $all(
                        "[data-coco-mode]"
                    )
                    .forEach(btn => {

                        btn.classList.toggle(
                            "active",
                            btn === button
                        );

                    });


                    const panelMap = {

                        individual:
                            "cocoIndividualPanel",

                        multiple:
                            "cocoMultiplePanel",

                        excel:
                            "cocoExcelPanel",

                        address:
                            "cocoAddressPanel"

                    };


                    $all(
                        "#cocoIndividualPanel, #cocoMultiplePanel, #cocoExcelPanel, #cocoAddressPanel"
                    )
                    .forEach(panel => {

                        panel.classList.toggle(
                            "active",
                            panel.id ===
                                panelMap[
                                    APP.cocoMode
                                ]
                        );

                    });


                    updatePreview();

                }
            );

        });

}


/* =========================================================
   OTHER PO NAV
========================================================= */

function bindOtherNavigation() {

    $all("[data-other-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    APP.otherMode =
                        button.dataset.otherMode;


                    $all(
                        "[data-other-mode]"
                    )
                    .forEach(btn => {

                        btn.classList.toggle(
                            "active",
                            btn === button
                        );

                    });


                    const panelMap = {

                        individual:
                            "otherIndividualPanel",

                        multiple:
                            "otherMultiplePanel",

                        excel:
                            "otherExcelPanel",

                        address:
                            "otherAddressPanel"

                    };


                    $all(
                        "#otherIndividualPanel, #otherMultiplePanel, #otherExcelPanel, #otherAddressPanel"
                    )
                    .forEach(panel => {

                        panel.classList.toggle(
                            "active",
                            panel.id ===
                                panelMap[
                                    APP.otherMode
                                ]
                        );

                    });


                    updatePreview();

                }
            );

        });

}


/* =========================================================
   ADDRESS NAV
========================================================= */

function bindAddressNavigation() {

    $all("[data-address-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    APP.addressMode =
                        button.dataset.addressMode;


                    $all(
                        "[data-address-mode]"
                    )
                    .forEach(btn => {

                        btn.classList.toggle(
                            "active",
                            btn === button
                        );

                    });


                    const target =
                        APP.addressMode ===
                        "manual"
                            ? "addressManualPanel"
                            : "addressExcelPanel";


                    $all(
                        "#addressManualPanel, #addressExcelPanel"
                    )
                    .forEach(panel => {

                        panel.classList.toggle(
                            "active",
                            panel.id ===
                                target
                        );

                    });

                }
            );

        });

}


/* =========================================================
   PO INPUT EVENTS
========================================================= */

function bindPOInputs() {

    $all(".po-input")
        .forEach(input => {

            input.addEventListener(
                "input",
                updatePreview
            );

        });


    [
        "cocoMultiplePO",
        "otherMultiplePO"
    ]
    .forEach(id => {

        const el =
            $(id);

        if (!el) {
            return;
        }

        el.addEventListener(
            "input",
            updatePreview
        );

    });

}


/* =========================================================
   GET MANUAL PO
========================================================= */

function getManualPOs(
    prefix
) {

    const result = [];


    for (
        let i = 1;
        i <= APP.maxPO;
        i++
    ) {

        const input =
            $(`${prefix}${i}`);


        if (!input) {
            continue;
        }


        const value =
            input.value.trim();


        if (value) {
            result.push(value);
        }

    }


    return result;

}


/* =========================================================
   GET MULTIPLE PO
========================================================= */

function getMultiplePOs(id) {

    const text =
        getValue(id);


    return text
        .split(/[\n,]+/)
        .map(value => value.trim())
        .filter(Boolean);

}


/* =========================================================
   GET CURRENT COCO PO
========================================================= */

function getCocoPOs() {

    if (
        APP.cocoMode ===
        "multiple"
    ) {

        return getMultiplePOs(
            "cocoMultiplePO"
        );

    }


    if (
        APP.cocoMode ===
        "excel"
    ) {

        return APP.cocoExcelPOs || [];

    }


    return getManualPOs(
        "cocoPO"
    );

}


/* =========================================================
   GET CURRENT OTHER PO
========================================================= */

function getOtherPOs() {

    if (
        APP.otherMode ===
        "multiple"
    ) {

        return getMultiplePOs(
            "otherMultiplePO"
        );

    }


    if (
        APP.otherMode ===
        "excel"
    ) {

        return APP.otherExcelPOs || [];

    }


    return getManualPOs(
        "otherPO"
    );

}


/* =========================================================
   BOX SETTINGS
========================================================= */

function bindBoxSettings() {

    [
        "startBoxNumber",
        "endBoxNumber",
        "boxRepeatCount",
        "labelsPerPage",
        "labelGap"
    ]
    .forEach(id => {

        const input =
            $(id);

        if (!input) {
            return;
        }


        input.addEventListener(
            "input",
            () => {

                normalizeBoxSettings();

                updatePreview();

            }
        );

    });


    [
        "samePOPageFlow",
        "halfPageFlowCheck"
    ]
    .forEach(id => {

        const input =
            $(id);

        if (!input) {
            return;
        }


        input.addEventListener(
            "change",
            () => {

                featureToast(
                    id === "samePOPageFlow"
                        ? "Same PO Page Flow"
                        : "Half Page Label Flow",
                    input.checked
                );

                updatePreview();

            }
        );

    });

}


/* =========================================================
   NORMALIZE BOX SETTINGS
========================================================= */

function normalizeBoxSettings() {

    let start =
        numberValue(
            "startBoxNumber",
            1
        );


    let end =
        numberValue(
            "endBoxNumber",
            start
        );


    let repeat =
        numberValue(
            "boxRepeatCount",
            1
        );


    if (start < 1) {
        start = 1;
    }


    if (end < start) {
        end = start;
    }


    if (repeat < 1) {
        repeat = 1;
    }


    /*
     * NO ARTIFICIAL LIMIT.
     * User requested unlimited repeat count.
     */


    setValue(
        "startBoxNumber",
        start
    );


    setValue(
        "endBoxNumber",
        end
    );


    setValue(
        "boxRepeatCount",
        repeat
    );

}


/* =========================================================
   CREATE LABEL DATA
========================================================= */

function createLabels(
    pos
) {

    const labels = [];


    const start =
        numberValue(
            "startBoxNumber",
            1
        );


    const end =
        numberValue(
            "endBoxNumber",
            start
        );


    const repeat =
        numberValue(
            "boxRepeatCount",
            1
        );


    if (!pos.length) {
        return labels;
    }


    pos.forEach(po => {

        for (
            let box = start;
            box <= end;
            box++
        ) {

            for (
                let copy = 1;
                copy <= repeat;
                copy++
            ) {

                labels.push({

                    po,

                    box,

                    copy

                });

            }

        }

    });


    return labels;

}


/* =========================================================
   PAGE SIZE
========================================================= */

function getPageSizeFrom(
    sizeId,
    orientationId,
    widthId,
    heightId
) {

    const selected =
        getValue(
            sizeId,
            "4x6"
        );


    let width;
    let height;


    if (
        selected ===
        "4x6"
    ) {

        width =
            101.6;

        height =
            152.4;

    }


    else if (
        selected ===
        "70x35"
    ) {

        /*
         * Exact requested size:
         * WIDTH 70 mm
         * HEIGHT 35 mm
         */

        width =
            70;

        height =
            35;

    }


    else if (
        selected ===
        "a4"
    ) {

        width =
            210;

        height =
            297;

    }


    else if (
        selected ===
        "custom"
    ) {

        width =
            Number(
                getValue(
                    widthId,
                    0
                )
            );


        height =
            Number(
                getValue(
                    heightId,
                    0
                )
            );


        if (
            !width ||
            !height ||
            width <= 0 ||
            height <= 0
        ) {

            return null;

        }

    }


    else {

        return null;

    }


    const orientation =
        getValue(
            orientationId,
            "portrait"
        );


    if (
        orientation ===
        "landscape"
    ) {

        const temp =
            width;

        width =
            height;

        height =
            temp;

    }


    return {

        width,

        height,

        name:
            selected

    };

}


/* =========================================================
   COCO PAGE SIZE
========================================================= */

function getCocoPage() {

    return getPageSizeFrom(
        "pageSize",
        "orientation",
        "customWidth",
        "customHeight"
    );

}


/* =========================================================
   CUSTOM SIZE CONTROLS
========================================================= */

function bindPageSettings() {

    bindPageSelector(
        "pageSize",
        "customSizePanel",
        "customWidth",
        "customHeight"
    );


    bindPageSelector(
        "otherPageSize",
        "otherCustomSizePanel",
        "otherCustomWidth",
        "otherCustomHeight"
    );


    bindPageSelector(
        "isbnPageSize",
        "isbnCustomSizePanel",
        "isbnCustomWidth",
        "isbnCustomHeight"
    );


    bindPageSelector(
        "addressPageSize",
        "addressCustomSizePanel",
        "addressCustomWidth",
        "addressCustomHeight"
    );


    [
        "orientation",
        "otherOrientation",
        "isbnOrientation",
        "addressOrientation",
        "customWidth",
        "customHeight",
        "otherCustomWidth",
        "otherCustomHeight",
        "isbnCustomWidth",
        "isbnCustomHeight",
        "addressCustomWidth",
        "addressCustomHeight"
    ]
    .forEach(id => {

        const el =
            $(id);

        if (!el) {
            return;
        }


        el.addEventListener(
            "change",
            updateAll
        );


        el.addEventListener(
            "input",
            updateAll
        );

    });

}


function bindPageSelector(
    selectId,
    panelId,
    widthId,
    heightId
) {

    const select =
        $(selectId);


    if (!select) {
        return;
    }


    const update =
        () => {

            const custom =
                select.value ===
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
                    !custom
                );

            }


            if (width) {
                width.disabled =
                    !custom;
            }


            if (height) {
                height.disabled =
                    !custom;
            }


            updatePreview();

        };


    select.addEventListener(
        "change",
        update
    );


    update();

}


/* =========================================================
   PAGE LABEL
========================================================= */

function pageSizeName(
    value
) {

    switch (value) {

        case "4x6":
            return "4 × 6 Inches";

        case "70x35":
            return "70 × 35 mm";

        case "a4":
            return "A4";

        case "custom":
            return "Custom Size";

        default:
            return "Page";

    }

}


/* =========================================================
   LABEL FEATURES
========================================================= */

function bindLabelFeatures() {

    const simpleFeatures = [

        [
            "poNumberCheck",
            "PO Number"
        ],

        [
            "boxNumberCheck",
            "Box Number"
        ],

        [
            "cutLineCheck",
            "Cut Line / Scissor Mark"
        ],

        [
            "pageBorderCheck",
            "Page Border"
        ]

    ];


    simpleFeatures.forEach(
        ([id, name]) => {

            const input =
                $(id);

            if (!input) {
                return;
            }


            input.addEventListener(
                "change",
                () => {

                    featureToast(
                        name,
                        input.checked
                    );

                    updatePreview();

                }
            );

        }
    );


    const poPlus =
        $("poPlusBoxCheck");


    if (poPlus) {

        poPlus.addEventListener(
            "change",
            () => {

                applyPOPlusLock();

                featureToast(
                    "PO Number + Box Number",
                    poPlus.checked
                );

                updatePreview();

            }
        );

    }


    const combined =
        $("combinedBorderCheck");


    if (combined) {

        combined.addEventListener(
            "change",
            () => {

                applyCombinedBorderLock();

                featureToast(
                    "Combined Border",
                    combined.checked
                );

                updatePreview();

            }
        );

    }


    [
        [
            "poBorderCheck",
            "PO Border"
        ],

        [
            "boxBorderCheck",
            "Box Border"
        ]

    ]
    .forEach(
        ([id, name]) => {

            const input =
                $(id);

            if (!input) {
                return;
            }


            input.addEventListener(
                "change",
                () => {

                    featureToast(
                        name,
                        input.checked
                    );

                    updatePreview();

                }
            );

        }
    );

}


/* =========================================================
   PO + BOX LOCK
========================================================= */

function applyPOPlusLock() {

    const master =
        $("poPlusBoxCheck");

    const po =
        $("poNumberCheck");

    const box =
        $("boxNumberCheck");


    const enabled =
        !!(
            master &&
            master.checked
        );


    if (enabled) {

        if (po) {

            po.checked =
                false;

            po.disabled =
                true;

            setLocked(
                po,
                true
            );

        }


        if (box) {

            box.checked =
                false;

            box.disabled =
                true;

            setLocked(
                box,
                true
            );

        }

    }

    else {

        if (po) {

            po.disabled =
                false;

            setLocked(
                po,
                false
            );

        }


        if (box) {

            box.disabled =
                false;

            setLocked(
                box,
                false
            );

        }

    }

}


function setLocked(
    input,
    locked
) {

    const label =
        input.closest(
            ".feature-check"
        );


    if (!label) {
        return;
    }


    /*
     * CSS supports .locked.
     */

    label.classList.toggle(
        "locked",
        locked
    );

}


/* =========================================================
   COMBINED BORDER LOCK
========================================================= */

function applyCombinedBorderLock() {

    const master =
        $("combinedBorderCheck");

    const po =
        $("poBorderCheck");

    const box =
        $("boxBorderCheck");


    const enabled =
        !!(
            master &&
            master.checked
        );


    if (enabled) {

        if (po) {

            po.checked =
                false;

            po.disabled =
                true;

            setLocked(
                po,
                true
            );

        }


        if (box) {

            box.checked =
                false;

            box.disabled =
                true;

            setLocked(
                box,
                true
            );

        }

    }

    else {

        if (po) {

            po.disabled =
                false;

            setLocked(
                po,
                false
            );

        }


        if (box) {

            box.disabled =
                false;

            setLocked(
                box,
                false
            );

        }

    }

}


/* =========================================================
   FONT SETTINGS
========================================================= */

function bindFontSettings() {

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

        const el =
            $(id);

        if (!el) {
            return;
        }


        el.addEventListener(
            "change",
            () => {

                updatePreview();

            }
        );


        el.addEventListener(
            "input",
            () => {

                updatePreview();

            }
        );

    });

}


/* =========================================================
   GET FONT STYLE
========================================================= */

function getFontStyle(
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
            Math.min(
                APP.maxFont,
                Math.max(
                    1,
                    numberValue(
                        sizeId,
                        14
                    )
                )
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


/* =========================================================
   PREVIEW
========================================================= */

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
        getCocoPage();


    if (!dimensions) {
        return;
    }


    const maxWidth =
        450;

    const maxHeight =
        480;


    const scale =
        Math.min(
            maxWidth /
                dimensions.width,

            maxHeight /
                dimensions.height
        );


    page.style.width =
        `${Math.max(
            90,
            dimensions.width *
                scale
        )}px`;


    page.style.height =
        `${Math.max(
            90,
            dimensions.height *
                scale
        )}px`;


    const poEnabled =
        isChecked(
            "poNumberCheck"
        );


    const boxEnabled =
        isChecked(
            "boxNumberCheck"
        );


    const combined =
        isChecked(
            "poPlusBoxCheck"
        );


    const poBorder =
        isChecked(
            "poBorderCheck"
        );


    const boxBorder =
        isChecked(
            "boxBorderCheck"
        );


    const combinedBorder =
        isChecked(
            "combinedBorderCheck"
        );


    const cutLine =
        isChecked(
            "cutLineCheck"
        );


    const pageBorder =
        isChecked(
            "pageBorderCheck"
        );


    const pos =
        getCocoPOs();


    const samplePO =
        pos[0] ||
        "PO NUMBER";


    const sampleBox =
        numberValue(
            "startBoxNumber",
            1
        );


    if (combined) {

        po.style.display =
            "block";

        box.style.display =
            "none";

        po.textContent =
            `${samplePO} — BOX NO. ${sampleBox}`;

    }

    else {

        po.style.display =
            poEnabled
                ? "block"
                : "none";


        box.style.display =
            boxEnabled
                ? "block"
                : "none";


        po.textContent =
            samplePO;


        box.textContent =
            `BOX NO. ${sampleBox}`;

    }


    po.classList.toggle(
        "with-border",
        poBorder &&
            !combined
    );


    box.classList.toggle(
        "with-border",
        boxBorder &&
            !combined
    );


    label.classList.toggle(
        "combined-border",
        combinedBorder
    );


    label.style.borderStyle =
        pageBorder
            ? "solid"
            : "none";


    if (cutLine) {

        label.style.outline =
            "1px dashed #94a3b8";

    }

    else {

        label.style.outline =
            "none";

    }


    applyPreviewFont(
        po,
        getFontStyle(
            "poFontFamily",
            "poFontSize",
            "poBoldCheck",
            "poItalicCheck",
            "poUnderlineCheck"
        )
    );


    applyPreviewFont(
        box,
        getFontStyle(
            "boxFontFamily",
            "boxFontSize",
            "boxBoldCheck",
            "boxItalicCheck",
            "boxUnderlineCheck"
        )
    );


    setText(
        "selectedPageInfo",
        pageSizeName(
            getValue(
                "pageSize",
                "4x6"
            )
        )
    );


    setText(
        "previewPageSize",
        pageSizeName(
            getValue(
                "pageSize",
                "4x6"
            )
        )
    );

}


/* =========================================================
   PREVIEW FONT
========================================================= */

function applyPreviewFont(
    element,
    style
) {

    if (!element) {
        return;
    }


    element.style.fontFamily =
        style.family;


    element.style.fontSize =
        `${style.size}px`;


    element.style.fontWeight =
        style.bold
            ? "800"
            : "600";


    element.style.fontStyle =
        style.italic
            ? "italic"
            : "normal";


    element.style.textDecoration =
        style.underline
            ? "underline"
            : "none";

}


/* =========================================================
   EXCEL
========================================================= */

function bindExcel() {

    bindExcelInput(
        "cocoExcelFile",
        "coco"
    );


    bindExcelInput(
        "otherExcelFile",
        "other"
    );


    bindExcelInput(
        "addressExcelFile",
        "address"
    );

}


function bindExcelInput(
    inputId,
    type
) {

    const input =
        $(inputId);


    if (!input) {
        return;
    }


    input.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            setText(
                `${type}ExcelFileName`,
                file.name
            );


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


            try {

                showToast(
                    "Reading Excel file...",
                    "success"
                );


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


                if (
                    type ===
                    "coco"
                ) {

                    APP.cocoExcelPOs =
                        extractPOs(
                            rows
                        );

                    renderExcel(
                        "cocoExcelPreview",
                        rows
                    );

                }


                else if (
                    type ===
                    "other"
                ) {

                    APP.otherExcelPOs =
                        extractPOs(
                            rows
                        );

                    renderExcel(
                        "otherExcelPreview",
                        rows
                    );

                }


                else if (
                    type ===
                    "address"
                ) {

                    APP.addressExcelRows =
                        rows;

                    renderExcel(
                        "addressExcelPreview",
                        rows
                    );

                }


                showToast(
                    `${rows.length} rows loaded`,
                    "success"
                );


                updatePreview();

            }


            catch (error) {

                console.error(
                    error
                );


                showToast(
                    "Unable to read Excel file",
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   EXTRACT PO
========================================================= */

function extractPOs(
    rows
) {

    const headers = [

        "po",
        "po number",
        "po no",
        "po no.",
        "po_number",
        "purchase order"

    ];


    const result = [];


    rows.forEach(
        (row, index) => {

            if (
                !Array.isArray(row) ||
                !row.length
            ) {

                return;

            }


            const value =
                String(
                    row[0] ?? ""
                ).trim();


            if (!value) {
                return;
            }


            const normalized =
                value
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


            if (
                index === 0 &&
                headers.includes(
                    normalized
                )
            ) {

                return;

            }


            result.push(
                value
            );

        }
    );


    return [
        ...new Set(
            result
        )
    ];

}


/* =========================================================
   EXCEL PREVIEW
========================================================= */

function renderExcel(
    containerId,
    rows
) {

    const container =
        $(containerId);


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (!rows.length) {
        return;
    }


    const table =
        document.createElement(
            "table"
        );


    rows
        .slice(
            0,
            30
        )
        .forEach(
            (row, rowIndex) => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                row.forEach(
                    cell => {

                        const td =
                            document.createElement(
                                rowIndex === 0
                                    ? "th"
                                    : "td"
                            );


                        td.textContent =
                            cell;


                        tr.appendChild(
                            td
                        );

                    }
                );


                table.appendChild(
                    tr
                );

            }
        );


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
    ]
    .forEach(id => {

        const el =
            $(id);

        if (!el) {
            return;
        }


        el.addEventListener(
            "input",
            updateISBNPreview
        );

    });


    const generate =
        $("isbnGenerateButton");


    if (generate) {

        generate.addEventListener(
            "click",
            generateISBNPDF
        );

    }


    const reset =
        $("isbnResetButton");


    if (reset) {

        reset.addEventListener(
            "click",
            resetISBN
        );

    }

}


function updateISBNPreview() {

    const svg =
        $("isbnBarcodeSvg");

    const text =
        $("isbnBarcodeText");


    if (!svg || !text) {
        return;
    }


    const isbn =
        getValue(
            "isbnValue"
        ).trim();


    const title =
        getValue(
            "isbnBookTitle"
        ).trim();


    const edition =
        getValue(
            "isbnEdition"
        ).trim();


    svg.innerHTML =
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

                format:
                    "CODE128",

                width:
                    2,

                height:
                    70,

                displayValue:
                    true,

                fontSize:
                    13,

                margin:
                    10,

                background:
                    "#ffffff"

            }
        );


        text.textContent =
            [
                title,
                edition
            ]
            .filter(Boolean)
            .join(
                " • "
            );

    }


    catch (error) {

        console.error(
            error
        );


        text.textContent =
            "Invalid barcode value";

    }

}


/* =========================================================
   ADDRESS
========================================================= */

function bindAddress() {

    [
        "addressFrom",
        "addressTo",
        "cocoFromAddress",
        "cocoToAddress",
        "otherFromAddress",
        "otherToAddress"
    ]
    .forEach(id => {

        const el =
            $(id);

        if (!el) {
            return;
        }


        el.addEventListener(
            "input",
            updateAddressPreview
        );

    });


    [
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
    ]
    .forEach(id => {

        const el =
            $(id);

        if (!el) {
            return;
        }


        el.addEventListener(
            "change",
            updateAddressPreview
        );

    });


    const generate =
        $("addressGenerateButton");


    if (generate) {

        generate.addEventListener(
            "click",
            generateAddressPDF
        );

    }


    const reset =
        $("addressResetButton");


    if (reset) {

        reset.addEventListener(
            "click",
            resetAddress
        );

    }

}


function updateAddressPreview() {

    /*
     * Address settings are applied when PDF
     * is generated. No confirmation popup.
     */

}


/* =========================================================
   MAIN BUTTONS
========================================================= */

function bindButtons() {

    const cocoGenerate =
        $("cocoGenerateButton");


    if (cocoGenerate) {

        cocoGenerate.addEventListener(
            "click",
            generateCocoPDF
        );

    }


    const cocoReset =
        $("cocoResetButton");


    if (cocoReset) {

        cocoReset.addEventListener(
            "click",
            resetCoco
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


    const otherReset =
        $("otherResetButton");


    if (otherReset) {

        otherReset.addEventListener(
            "click",
            resetOther
        );

    }

}


/* =========================================================
   PDF LIBRARY
========================================================= */

function getPDFClass() {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        showToast(
            "PDF library is not loaded",
            "error"
        );

        return null;

    }


    return window.jspdf.jsPDF;

}


/* =========================================================
   GENERATE COCO
========================================================= */

function generateCocoPDF() {

    const JsPDF =
        getPDFClass();


    if (!JsPDF) {
        return;
    }


    const pos =
        getCocoPOs();


    if (!pos.length) {

        showToast(
            "Please enter at least one PO number",
            "error"
        );

        return;

    }


    normalizeBoxSettings();


    const page =
        getCocoPage();


    if (!page) {

        showToast(
            "Please enter valid page dimensions",
            "error"
        );

        return;

    }


    const labels =
        createLabels(
            pos
        );


    if (!labels.length) {

        showToast(
            "No labels available",
            "error"
        );

        return;

    }


    generateLabelPDF(
        JsPDF,
        labels,
        page,
        "Coco_Blue_PO"
    );

}


/* =========================================================
   GENERATE OTHER PO
========================================================= */

function generateOtherPDF() {

    const JsPDF =
        getPDFClass();


    if (!JsPDF) {
        return;
    }


    const pos =
        getOtherPOs();


    if (!pos.length) {

        showToast(
            "Please enter at least one Other PO",
            "error"
        );

        return;

    }


    const page =
        getPageSizeFrom(
            "otherPageSize",
            "otherOrientation",
            "otherCustomWidth",
            "otherCustomHeight"
        );


    if (!page) {

        showToast(
            "Please enter valid page dimensions",
            "error"
        );

        return;

    }


    const labels =
        createLabels(
            pos
        );


    generateLabelPDF(
        JsPDF,
        labels,
        page,
        "Other_PO"
    );

}


/* =========================================================
   GENERATE LABEL PDF
========================================================= */

function generateLabelPDF(
    JsPDF,
    labels,
    page,
    filename
) {

    const orientation =
        page.width >
        page.height
            ? "landscape"
            : "portrait";


    const pdf =
        new JsPDF({

            orientation,

            unit:
                "mm",

            format: [
                page.width,
                page.height
            ],

            compress:
                true

        });


    const halfFlow =
        isChecked(
            "halfPageFlowCheck"
        );


    const labelsPerPage =
        halfFlow
            ? 2
            : Math.max(
                1,
                numberValue(
                    "labelsPerPage",
                    1
                )
            );


    labels.forEach(
        (label, index) => {

            const slot =
                index %
                labelsPerPage;


            if (
                index > 0 &&
                slot === 0
            ) {

                pdf.addPage(
                    [
                        page.width,
                        page.height
                    ],
                    orientation
                );

            }


            const slotHeight =
                page.height /
                labelsPerPage;


            const y =
                slot *
                slotHeight;


            drawPDFLabel(
                pdf,
                label,
                0,
                y,
                page.width,
                slotHeight
            );

        }
    );


    let safeName =
        filename
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );


    const firstPO =
        String(
            labels[0]?.po ||
            "Labels"
        )
        .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );


    safeName +=
        "_" +
        firstPO;


    pdf.save(
        `${safeName}_Labels.pdf`
    );


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

    const centerX =
        x +
        width / 2;


    const centerY =
        y +
        height / 2;


    const poEnabled =
        isChecked(
            "poNumberCheck"
        );


    const boxEnabled =
        isChecked(
            "boxNumberCheck"
        );


    const poPlus =
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


    const pageBorder =
        isChecked(
            "pageBorderCheck"
        );


    /*
     * PAGE BORDER
     */

    if (pageBorder) {

        pdf.setDrawColor(
            30,
            41,
            59
        );

        pdf.setLineWidth(
            0.45
        );

        pdf.rect(
            x + 1,
            y + 1,
            width - 2,
            height - 2
        );

    }


    /*
     * CUT LINE
     */

    if (cutLine) {

        pdf.setDrawColor(
            120,
            130,
            145
        );

        pdf.setLineWidth(
            0.25
        );

        pdf.setLineDashPattern(
            [2, 2],
            0
        );

        pdf.rect(
            x + 2,
            y + 2,
            width - 4,
            height - 4
        );

        pdf.setLineDashPattern(
            [],
            0
        );

    }


    /*
     * PO + BOX COMBINED
     */

    if (poPlus) {

        const text =
            `${label.po} — BOX NO. ${label.box}`;


        applyPDFFont(
            pdf,
            "po"
        );


        const textWidth =
            pdf.getTextWidth(
                text
            );


        const boxWidth =
            Math.min(
                width - 8,
                textWidth + 10
            );


        const boxHeight =
            Math.max(
                15,
                getPDFFontSize(
                    "po"
                ) * 0.65
                    + 8
            );


        if (combinedBorder) {

            pdf.setDrawColor(
                17,
                24,
                39
            );

            pdf.setLineWidth(
                0.5
            );

            pdf.rect(
                centerX -
                    boxWidth / 2,

                centerY -
                    boxHeight / 2,

                boxWidth,

                boxHeight
            );

        }


        pdf.text(
            text,
            centerX,
            centerY +
                getPDFFontSize(
                    "po"
                ) * 0.18,
            {
                align:
                    "center"
            }
        );


        return;

    }


    /*
     * SEPARATE PO
     */

    let poY =
        centerY -
        5;


    if (poEnabled) {

        applyPDFFont(
            pdf,
            "po"
        );


        const poText =
            String(
                label.po
            );


        const poWidth =
            pdf.getTextWidth(
                poText
            );


        if (poBorder) {

            pdf.setLineWidth(
                0.45
            );

            pdf.rect(
                centerX -
                    poWidth / 2 -
                    4,

                poY -
                    getPDFFontSize(
                        "po"
                    ) * 0.38 -
                    3,

                poWidth + 8,

                getPDFFontSize(
                    "po"
                ) * 0.7 +
                    7
            );

        }


        pdf.text(
            poText,
            centerX,
            poY,
            {
                align:
                    "center"
            }
        );

    }


    /*
     * SEPARATE BOX
     */

    if (boxEnabled) {

        const boxY =
            centerY +
            10;


        const boxText =
            `BOX NO. ${label.box}`;


        applyPDFFont(
            pdf,
            "box"
        );


        const boxWidth =
            pdf.getTextWidth(
                boxText
            );


        if (boxBorder) {

            pdf.setLineWidth(
                0.45
            );

            pdf.rect(
                centerX -
                    boxWidth / 2 -
                    4,

                boxY -
                    getPDFFontSize(
                        "box"
                    ) * 0.38 -
                    3,

                boxWidth + 8,

                getPDFFontSize(
                    "box"
                ) * 0.7 +
                    7
            );

        }


        pdf.text(
            boxText,
            centerX,
            boxY,
            {
                align:
                    "center"
            }
        );

    }

}


/* =========================================================
   PDF FONT
========================================================= */

function getPDFFontSize(
    type
) {

    return type === "po"

        ? Math.min(
            APP.maxFont,
            numberValue(
                "poFontSize",
                24
            )
        )

        : Math.min(
            APP.maxFont,
            numberValue(
                "boxFontSize",
                20
            )
        );

}


function applyPDFFont(
    pdf,
    type
) {

    const po =
        type === "po";


    const family =
        getValue(
            po
                ? "poFontFamily"
                : "boxFontFamily",
            "Arial"
        );


    const size =
        getPDFFontSize(
            type
        );


    const bold =
        isChecked(
            po
                ? "poBoldCheck"
                : "boxBoldCheck"
        );


    const italic =
        isChecked(
            po
                ? "poItalicCheck"
                : "boxItalicCheck"
        );


    let pdfFont =
        "helvetica";


    const lower =
        family.toLowerCase();


    if (
        lower.includes(
            "times"
        ) ||
        lower.includes(
            "georgia"
        ) ||
        lower.includes(
            "cambria"
        ) ||
        lower.includes(
            "garamond"
        ) ||
        lower.includes(
            "palatino"
        )
    ) {

        pdfFont =
            "times";

    }


    else if (
        lower.includes(
            "courier"
        ) ||
        lower.includes(
            "consolas"
        )
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

    }

    else if (bold) {

        style =
            "bold";

    }

    else if (italic) {

        style =
            "italic";

    }


    pdf.setFont(
        pdfFont,
        style
    );


    pdf.setFontSize(
        size
    );

}


/* =========================================================
   ISBN PDF
========================================================= */

function generateISBNPDF() {

    const JsPDF =
        getPDFClass();


    if (!JsPDF) {
        return;
    }


    const isbn =
        getValue(
            "isbnValue"
        ).trim();


    const title =
        getValue(
            "isbnBookTitle"
        ).trim();


    const edition =
        getValue(
            "isbnEdition"
        ).trim();


    if (!isbn) {

        showToast(
            "Please enter ISBN",
            "error"
        );

        return;

    }


    const page =
        getPageSizeFrom(
            "isbnPageSize",
            "isbnOrientation",
            "isbnCustomWidth",
            "isbnCustomHeight"
        );


    if (!page) {

        showToast(
            "Please enter valid page dimensions",
            "error"
        );

        return;

    }


    const orientation =
        page.width >
        page.height
            ? "landscape"
            : "portrait";


    const pdf =
        new JsPDF({

            orientation,

            unit:
                "mm",

            format: [
                page.width,
                page.height
            ]

        });


    const centerX =
        page.width / 2;


    let y =
        page.height * 0.25;


    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(
        18
    );


    if (title) {

        pdf.text(
            title,
            centerX,
            y,
            {
                align:
                    "center"
            }
        );


        y += 10;

    }


    if (edition) {

        pdf.setFont(
            "helvetica",
            "normal"
        );


        pdf.setFontSize(
            10
        );


        pdf.text(
            edition,
            centerX,
            y,
            {
                align:
                    "center"
            }
        );


        y += 9;

    }


    drawSimpleBarcode(
        pdf,
        isbn,
        centerX,
        y,
        Math.min(
            100,
            page.width * 0.75
        ),
        30
    );


    pdf.save(
        `ISBN_${safeFileName(isbn)}.pdf`
    );


    showToast(
        "ISBN Barcode PDF generated successfully",
        "success"
    );

}


/* =========================================================
   BARCODE DRAW
========================================================= */

function drawSimpleBarcode(
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


    if (!clean) {
        return;
    }


    const bars = [];


    for (
        let i = 0;
        i < clean.length;
        i++
    ) {

        const code =
            clean.charCodeAt(i);


        bars.push(
            1 + (
                code % 3
            ),

            1 + (
                (code >> 2) % 3
            )

        );

    }


    const total =
        bars.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    const unit =
        width /
        total;


    let x =
        centerX -
        width / 2;


    bars.forEach(
        (bar, index) => {

            if (
                index % 2 === 0
            ) {

                pdf.setFillColor(
                    0,
                    0,
                    0
                );


                pdf.rect(
                    x,
                    y,
                    bar * unit,
                    height,
                    "F"
                );

            }


            x +=
                bar * unit;

        }
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.setFontSize(
        8
    );


    pdf.text(
        text,
        centerX,
        y + height + 6,
        {
            align:
                "center"
        }
    );

}


/* =========================================================
   ADDRESS PDF
========================================================= */

function generateAddressPDF() {

    const JsPDF =
        getPDFClass();


    if (!JsPDF) {
        return;
    }


    let from =
        getValue(
            "addressFrom"
        ).trim();


    let to =
        getValue(
            "addressTo"
        ).trim();


    /*
     * Excel address mode
     */

    if (
        APP.addressMode ===
        "excel" &&
        APP.addressExcelRows?.length
    ) {

        const row =
            APP.addressExcelRows[1] ||
            APP.addressExcelRows[0] ||
            [];


        from =
            from ||
            String(
                row[0] ||
                ""
            ).trim();


        to =
            to ||
            String(
                row[1] ||
                ""
            ).trim();

    }


    if (!from && !to) {

        showToast(
            "Please enter From or To address",
            "error"
        );

        return;

    }


    const page =
        getPageSizeFrom(
            "addressPageSize",
            "addressOrientation",
            "addressCustomWidth",
            "addressCustomHeight"
        );


    if (!page) {

        showToast(
            "Please enter valid page dimensions",
            "error"
        );

        return;

    }


    const orientation =
        page.width >
        page.height
            ? "landscape"
            : "portrait";


    const pdf =
        new JsPDF({

            orientation,

            unit:
                "mm",

            format: [
                page.width,
                page.height
            ]

        });


    const blockHeight =
        page.height / 2;


    if (from) {

        drawAddressBlock(
            pdf,
            from,
            5,
            5,
            page.width - 10,
            blockHeight - 10,
            "from"
        );

    }


    if (to) {

        drawAddressBlock(
            pdf,
            to,
            5,
            blockHeight + 5,
            page.width - 10,
            blockHeight - 10,
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


/* =========================================================
   DRAW ADDRESS BLOCK
========================================================= */

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


    const family =
        getValue(
            isFrom
                ? "fromFontFamily"
                : "toFontFamily",
            "Arial"
        );


    const size =
        Math.min(
            APP.maxFont,
            numberValue(
                isFrom
                    ? "fromFontSize"
                    : "toFontSize",
                14
            )
        );


    const bold =
        isChecked(
            isFrom
                ? "fromBold"
                : "toBold"
        );


    const italic =
        isChecked(
            isFrom
                ? "fromItalic"
                : "toItalic"
        );


    const underline =
        isChecked(
            isFrom
                ? "fromUnderline"
                : "toUnderline"
        );


    const border =
        isChecked(
            isFrom
                ? "fromBorder"
                : "toBorder"
        );


    let font =
        "helvetica";


    const lower =
        family.toLowerCase();


    if (
        lower.includes("times") ||
        lower.includes("georgia") ||
        lower.includes("cambria") ||
        lower.includes("garamond")
    ) {

        font =
            "times";

    }


    else if (
        lower.includes("courier") ||
        lower.includes("consolas")
    ) {

        font =
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

    }

    else if (bold) {

        style =
            "bold";

    }

    else if (italic) {

        style =
            "italic";

    }


    pdf.setFont(
        font,
        style
    );


    pdf.setFontSize(
        size
    );


    if (border) {

        pdf.setLineWidth(
            0.45
        );


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
            width - 10
        );


    let currentY =
        y + 9;


    lines.forEach(
        line => {

            if (
                currentY >
                y + height - 4
            ) {

                return;

            }


            pdf.text(
                line,
                x + 5,
                currentY
            );


            if (underline) {

                const lineWidth =
                    pdf.getTextWidth(
                        line
                    );


                pdf.line(
                    x + 5,
                    currentY + 1,
                    x + 5 + lineWidth,
                    currentY + 1
                );

            }


            currentY +=
                Math.max(
                    5,
                    size * 0.42
                );

        }
    );

}


/* =========================================================
   QR CODE
========================================================= */

function generateLocationQR() {

    const container =
        $("addressQRPreview");


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        typeof QRCode ===
        "undefined"
    ) {

        container.textContent =
            "QR library not loaded";

        return;

    }


    const canvas =
        document.createElement(
            "canvas"
        );


    container.appendChild(
        canvas
    );


    QRCode.toCanvas(
        canvas,
        APP.mapUrl,
        {
            width:
                150,

            margin:
                2,

            errorCorrectionLevel:
                "M"
        },
        error => {

            if (error) {

                console.error(
                    error
                );

                container.textContent =
                    "Unable to generate QR";

            }

        }
    );

}


/* =========================================================
   RESET COCO
========================================================= */

function resetCoco() {

    for (
        let i = 1;
        i <= APP.maxPO;
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


    clearFile(
        "cocoExcelFile"
    );


    setText(
        "cocoExcelFileName",
        "No file selected"
    );


    APP.cocoExcelPOs =
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


    setValue(
        "labelsPerPage",
        2
    );


    setValue(
        "labelGap",
        2
    );


    setChecked(
        "samePOPageFlow",
        false
    );


    setChecked(
        "halfPageFlowCheck",
        true
    );


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


    setChecked(
        "poNumberCheck",
        true
    );


    setChecked(
        "boxNumberCheck",
        true
    );


    setChecked(
        "poPlusBoxCheck",
        false
    );


    setChecked(
        "combinedBorderCheck",
        false
    );


    setChecked(
        "poBorderCheck",
        false
    );


    setChecked(
        "boxBorderCheck",
        false
    );


    setChecked(
        "cutLineCheck",
        false
    );


    setChecked(
        "pageBorderCheck",
        false
    );


    applyPOPlusLock();

    applyCombinedBorderLock();

    updateAll();


    showToast(
        "Coco Blue settings reset",
        "success"
    );

}


/* =========================================================
   RESET OTHER
========================================================= */

function resetOther() {

    for (
        let i = 1;
        i <= APP.maxPO;
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


    clearFile(
        "otherExcelFile"
    );


    setText(
        "otherExcelFileName",
        "No file selected"
    );


    APP.otherExcelPOs =
        [];


    setValue(
        "otherPageSize",
        "4x6"
    );


    setValue(
        "otherOrientation",
        "portrait"
    );


    setValue(
        "otherCustomWidth",
        ""
    );


    setValue(
        "otherCustomHeight",
        ""
    );


    updateAll();


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


    setValue(
        "isbnPageSize",
        "4x6"
    );


    setValue(
        "isbnOrientation",
        "portrait"
    );


    setValue(
        "isbnCustomWidth",
        ""
    );


    setValue(
        "isbnCustomHeight",
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


    setValue(
        "addressPageSize",
        "4x6"
    );


    setValue(
        "addressOrientation",
        "portrait"
    );


    setValue(
        "addressCustomWidth",
        ""
    );


    setValue(
        "addressCustomHeight",
        ""
    );


    updateAddressPreview();


    showToast(
        "Address settings reset",
        "success"
    );

}


/* =========================================================
   FILE CLEAR
========================================================= */

function clearFile(id) {

    const input =
        $(id);


    if (input) {

        input.value =
            "";

    }

}


/* =========================================================
   LANGUAGE
========================================================= */

function bindLanguage() {

    const select =
        $("languageSelect");


    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        () => {

            APP.language =
                select.value;


            applyLanguage();

        }
    );

}


const translations = {

    en: {

        coco:
            "Coco Blue PO Labels",

        other:
            "Other PO",

        isbn:
            "ISBN Barcode Generator",

        address:
            "Address Sticker"

    },


    hi: {

        coco:
            "कोको ब्लू पीओ लेबल",

        other:
            "अन्य पीओ",

        isbn:
            "आईएसबीएन बारकोड जनरेटर",

        address:
            "एड्रेस स्टिकर"

    }

};


function applyLanguage() {

    const t =
        translations[
            APP.language
        ] ||
        translations.en;


    const sections = {

        cocoBlue:
            t.coco,

        otherPO:
            t.other,

        isbnBarcode:
            t.isbn,

        addressSticker:
            t.address

    };


    Object.entries(
        sections
    )
    .forEach(
        ([category, text]) => {

            const section =
                document.querySelector(
                    `.tool-section[data-tool="${category}"]`
                );


            if (!section) {
                return;
            }


            const heading =
                section.querySelector(
                    ".section-heading h2"
                );


            if (heading) {
                heading.textContent =
                    text;
            }

        }
    );


    if (
        APP.language ===
        "hi"
    ) {

        translateBasicHindi();

    }

    else {

        restoreEnglish();

    }

}


/*
 * Main platform labels.
 * Controls remain functional in both languages.
 */

const originalText =
    new Map();


function rememberText(
    element
) {

    if (
        !originalText.has(
            element
        )
    ) {

        originalText.set(
            element,
            element.textContent
        );

    }

}


function translateBasicHindi() {

    const replacements = {

        "Generate PDF":
            "PDF बनाएं",

        "Reset":
            "रीसेट",

        "Individual":
            "इंडिविजुअल",

        "Multiple":
            "मल्टीपल",

        "Excel Upload":
            "Excel अपलोड",

        "Manual":
            "मैनुअल",

        "From / To Address":
            "From / To एड्रेस",

        "Page Settings":
            "पेज सेटिंग्स",

        "Orientation":
            "ओरिएंटेशन",

        "Portrait":
            "पोर्ट्रेट",

        "Landscape":
            "लैंडस्केप",

        "Custom Size":
            "कस्टम साइज",

        "Box Repeat Settings":
            "बॉक्स रिपीट सेटिंग्स",

        "Label Features":
            "लेबल फीचर्स",

        "PO Number":
            "पीओ नंबर",

        "Box Number":
            "बॉक्स नंबर",

        "PO Number + Box Number":
            "पीओ नंबर + बॉक्स नंबर",

        "Combined Border":
            "कम्बाइंड बॉर्डर",

        "PO Border":
            "पीओ बॉर्डर",

        "Box Border":
            "बॉक्स बॉर्डर",

        "Page Border":
            "पेज बॉर्डर",

        "Cut Line / Scissor Mark":
            "कट लाइन / सिजर मार्क",

        "Live Preview":
            "लाइव प्रीव्यू",

        "From Address":
            "फ्रॉम एड्रेस",

        "To Address":
            "टू एड्रेस"

    };


    $all(
        "button, label, h3, p, span"
    )
    .forEach(
        element => {

            const text =
                element.textContent.trim();


            if (
                replacements[
                    text
                ]
            ) {

                rememberText(
                    element
                );


                element.textContent =
                    replacements[
                        text
                    ];

            }

        }
    );

}


function restoreEnglish() {

    originalText
        .forEach(
            (text, element) => {

                element.textContent =
                    text;

            }
        );


    originalText.clear();

}


/* =========================================================
   MODAL
========================================================= */

function bindModal() {

    const close =
        $("modalCloseButton");


    const cancel =
        $("modalCancelButton");


    const modal =
        $("confirmationModal");


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


    if (modal) {

        modal.classList.remove(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


/*
 * Kept only for compatibility.
 * Feature toggles do NOT call this.
 */

function openModal(
    title,
    message,
    callback
) {

    const modal =
        $("confirmationModal");


    if (!modal) {
        return;
    }


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


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    const confirm =
        $("modalConfirmButton");


    if (confirm) {

        confirm.onclick =
            () => {

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback();

                }


                closeModal();

            };

    }

}


/* =========================================================
   UTILITY
========================================================= */

function safeFileName(
    value
) {

    return String(
        value || "file"
    )
    .replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
    );

}


function timestamp() {

    const d =
        new Date();


    const pad =
        value =>
            String(value)
                .padStart(
                    2,
                    "0"
                );


    return (

        d.getFullYear() +
        "-" +
        pad(
            d.getMonth() + 1
        ) +
        "-" +
        pad(
            d.getDate()
        ) +
        "_" +
        pad(
            d.getHours()
        ) +
        "-" +
        pad(
            d.getMinutes()
        ) +
        "-" +
        pad(
            d.getSeconds()
        )

    );

}


/* =========================================================
   UPDATE ALL
========================================================= */

function updateAll() {

    bindPageVisibility();

    applyPOPlusLock();

    applyCombinedBorderLock();

    updatePreview();

    updateISBNPreview();

    updateAddressPreview();

}


/* =========================================================
   PAGE VISIBILITY
========================================================= */

function bindPageVisibility() {

    const configs = [

        [
            "pageSize",
            "customSizePanel",
            "customWidth",
            "customHeight"
        ],

        [
            "otherPageSize",
            "otherCustomSizePanel",
            "otherCustomWidth",
            "otherCustomHeight"
        ],

        [
            "isbnPageSize",
            "isbnCustomSizePanel",
            "isbnCustomWidth",
            "isbnCustomHeight"
        ],

        [
            "addressPageSize",
            "addressCustomSizePanel",
            "addressCustomWidth",
            "addressCustomHeight"
        ]

    ];


    configs.forEach(
        config => {

            const [
                selectId,
                panelId,
                widthId,
                heightId
            ] = config;


            const select =
                $(selectId);


            if (!select) {
                return;
            }


            const custom =
                select.value ===
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
                    !custom
                );

            }


            if (width) {
                width.disabled =
                    !custom;
            }


            if (height) {
                height.disabled =
                    !custom;
            }

        }
    );

}


/* =========================================================
   INITIAL DEFAULTS
========================================================= */

function initializeState() {

    APP.language =
        getValue(
            "languageSelect",
            "en"
        );


    APP.category =
        "cocoBlue";


    APP.cocoMode =
        "individual";


    APP.otherMode =
        "individual";


    APP.addressMode =
        "manual";


    setChecked(
        "poNumberCheck",
        true
    );


    setChecked(
        "boxNumberCheck",
        true
    );


    setChecked(
        "poPlusBoxCheck",
        false
    );


    setChecked(
        "combinedBorderCheck",
        false
    );


    applyPOPlusLock();

    applyCombinedBorderLock();

}


/* =========================================================
   GLOBAL API
========================================================= */

window.BooksLabelStudio = {

    getCocoPOs,

    getOtherPOs,

    createLabels,

    updatePreview,

    generateCocoPDF,

    generateOtherPDF,

    generateISBNPDF,

    generateAddressPDF,

    resetCoco,

    resetOther,

    resetISBN,

    resetAddress,

    showToast,

    state:
        APP

};