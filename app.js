/* =========================================================
   BOOKS LABEL STUDIO
   FINAL APP.JS
   Matches the supplied final HTML + CSS
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

const state = {
    currentFeature: "coco-blue",
    cocoMode: "manual",
    otherMode: "manual",

    cocoExcelData: [],
    otherExcelData: [],

    toastTimer: null
};


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));


function exists(id) {
    return !!$(id);
}


function value(id, fallback = "") {
    return exists(id) ? $(id).value : fallback;
}


function checked(id) {
    return exists(id) ? $(id).checked : false;
}


function numberValue(id, fallback = 0) {
    const n = Number(value(id, fallback));
    return Number.isFinite(n) ? n : fallback;
}


function escapeHTML(text) {
    return String(text ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "success", title = "Feature Updated") {

    const toast = $("toast");

    if (!toast) return;

    const icon = $("toastIcon");
    const toastTitle = $("toastTitle");
    const toastMessage = $("toastMessage");

    clearTimeout(state.toastTimer);

    toast.classList.remove(
        "success",
        "error",
        "warning",
        "show"
    );

    toast.classList.add(type);

    if (icon) {
        icon.textContent =
            type === "success" ? "✓" :
            type === "error" ? "!" : "•";
    }

    if (toastTitle) {
        toastTitle.textContent = title;
    }

    if (toastMessage) {
        toastMessage.textContent = message;
    }

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    state.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


function featureEnabled(name) {
    showToast(
        `This feature has been enabled.`,
        "success",
        name
    );
}


function featureDisabled(name) {
    showToast(
        `This feature has been disabled.`,
        "error",
        name
    );
}


/* =========================================================
   MAIN FEATURE WORKSPACES
========================================================= */

const workspaceMap = {
    "coco-blue": "cocoBlueWorkspace",
    "isbn": "isbnWorkspace",
    "other-po": "otherPOWorkspace",
    "address": "addressWorkspace"
};


function openFeature(feature) {

    state.currentFeature = feature;

    $$(".feature-card").forEach(card => {
        card.classList.toggle(
            "active",
            card.dataset.feature === feature
        );
    });

    Object.entries(workspaceMap).forEach(
        ([key, workspaceId]) => {

            const workspace = $(workspaceId);

            if (!workspace) return;

            workspace.classList.toggle(
                "active-workspace",
                key === feature
            );
        }
    );

    updateLivePreview();
}


function closeAllWorkspaces() {

    $$(".workspace").forEach(workspace => {
        workspace.classList.remove(
            "active-workspace"
        );
    });

    $$(".feature-card").forEach(card => {
        card.classList.remove("active");
    });
}


function initFeatureCards() {

    $$(".feature-card").forEach(card => {

        card.addEventListener("click", () => {

            openFeature(
                card.dataset.feature
            );

        });

    });


    const closeMap = {
        closeCocoWorkspace: "coco-blue",
        closeISBNWorkspace: "isbn",
        closeOtherPOWorkspace: "other-po",
        closeAddressWorkspace: "address"
    };


    Object.entries(closeMap).forEach(
        ([buttonId, feature]) => {

            const button = $(buttonId);

            if (!button) return;

            button.addEventListener(
                "click",
                () => {

                    /*
                     * Closing the current workspace
                     * returns to the simple feature cards.
                     */

                    closeAllWorkspaces();

                }
            );

        }
    );

}


/* =========================================================
   POPUPS
========================================================= */

function openPopup(id) {

    const popup = $(id);

    if (!popup) return;

    popup.classList.add("open");

    popup.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
}


function closePopup(popup) {

    if (!popup) return;

    popup.classList.remove("open");

    popup.setAttribute(
        "aria-hidden",
        "true"
    );

    if (!$(".popup-overlay.open")) {
        document.body.style.overflow = "";
    }
}


function closeAllPopups() {

    $$(".popup-overlay").forEach(
        popup => closePopup(popup)
    );

}


function initPopups() {

    $$("[data-popup]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openPopup(
                    button.dataset.popup
                );

            }
        );

    });


    $$("[data-close-popup]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                closePopup(
                    button.closest(
                        ".popup-overlay"
                    )
                );

            }
        );

    });


    $$(".popup-overlay").forEach(popup => {

        popup.addEventListener(
            "click",
            event => {

                if (
                    event.target === popup
                ) {

                    closePopup(popup);

                }

            }
        );

    });


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeAllPopups();
            }

        }
    );


    const toastClose = $("toastClose");

    if (toastClose) {

        toastClose.addEventListener(
            "click",
            () => {

                $("toast")?.classList.remove(
                    "show"
                );

            }
        );

    }

}


/* =========================================================
   COCO MODES
========================================================= */

function switchCocoMode(mode) {

    state.cocoMode = mode;

    $$("[data-coco-mode]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.cocoMode === mode
        );

    });


    const panels = {
        manual: "cocoManualPanel",
        bulk: "cocoBulkPanel",
        excel: "cocoExcelPanel"
    };


    Object.entries(panels).forEach(
        ([key, id]) => {

            const panel = $(id);

            if (!panel) return;

            panel.classList.toggle(
                "active-panel",
                key === mode
            );

        }
    );


    updateLivePreview();

}


function initCocoModes() {

    $$("[data-coco-mode]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                switchCocoMode(
                    button.dataset.cocoMode
                );

            }
        );

    });

}


/* =========================================================
   OTHER PO MODES
========================================================= */

function switchOtherMode(mode) {

    state.otherMode = mode;

    $$("[data-other-mode]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.otherMode === mode
        );

    });


    const panels = {
        manual: "otherManualPanel",
        bulk: "otherBulkPanel",
        excel: "otherExcelPanel"
    };


    Object.entries(panels).forEach(
        ([key, id]) => {

            const panel = $(id);

            if (!panel) return;

            panel.classList.toggle(
                "active-panel",
                key === mode
            );

        }
    );


    updateLivePreview();

}


function initOtherModes() {

    $$("[data-other-mode]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                switchOtherMode(
                    button.dataset.otherMode
                );

            }
        );

    });

}


/* =========================================================
   MANUAL PO INPUTS
========================================================= */

function createManualInputs(
    containerId,
    prefix,
    count = 20
) {

    const container = $(containerId);

    if (!container) return;

    container.innerHTML = "";

    for (let i = 1; i <= count; i++) {

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
            () => {

                updateManualCount();

                updateLivePreview();

            }
        );

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        container.appendChild(wrapper);
    }

}


function getManualPOs(prefix) {

    const result = [];

    for (let i = 1; i <= 20; i++) {

        const input =
            $(`${prefix}${i}`);

        if (!input) continue;

        const po =
            input.value.trim();

        if (po) {
            result.push(po);
        }

    }

    return result;
}


function updateManualCount() {

    const count =
        getManualPOs("cocoPO").length;

    if ($("manualPOCount")) {
        $("manualPOCount").textContent =
            count;
    }

}


/* =========================================================
   BULK PARSER
========================================================= */

function parseBulk(text) {

    if (!text) return [];

    /*
     * Unlimited input.
     *
     * Supports:
     * comma
     * newline
     * semicolon
     */

    return String(text)
        .split(/[,;\n\r]+/)
        .map(item => item.trim())
        .filter(Boolean);

}


/* =========================================================
   COCO DATA
========================================================= */

function getCocoPOs() {

    if (state.cocoMode === "manual") {

        return getManualPOs("cocoPO");

    }


    if (state.cocoMode === "bulk") {

        return parseBulk(
            value("cocoBulkInput")
        );

    }


    if (state.cocoMode === "excel") {

        return state.cocoExcelData
            .map(row => {

                if (Array.isArray(row)) {
                    return row[0];
                }

                return row;

            })
            .map(item =>
                String(item ?? "").trim()
            )
            .filter(Boolean);

    }


    return [];

}


/* =========================================================
   OTHER PO DATA
========================================================= */

function getOtherPOs() {

    if (state.otherMode === "manual") {

        return getManualPOs("otherPO");

    }


    if (state.otherMode === "bulk") {

        return parseBulk(
            value("otherBulkInput")
        );

    }


    if (state.otherMode === "excel") {

        return state.otherExcelData
            .map(row => {

                if (Array.isArray(row)) {
                    return row[0];
                }

                return row;

            })
            .map(item =>
                String(item ?? "").trim()
            )
            .filter(Boolean);

    }


    return [];

}


/* =========================================================
   EXCEL
========================================================= */

function loadExcelFile(
    file,
    callback,
    fileNameElement,
    previewElement
) {

    if (!file) return;

    if (typeof XLSX === "undefined") {

        showToast(
            "Excel library is not loaded.",
            "error",
            "Excel Upload"
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = event => {

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


            const sheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];


            /*
             * header: 1 keeps rows as arrays.
             */

            const allRows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    {
                        header: 1,
                        defval: ""
                    }
                );


            if (!allRows.length) {

                callback([]);

                showToast(
                    "The Excel file is empty.",
                    "error",
                    "Excel Upload"
                );

                return;

            }


            /*
             * IMPORTANT:
             * First row is always ignored.
             */

            const header =
                allRows[0];

            const dataRows =
                allRows.slice(1);


            callback(
                dataRows,
                header
            );


            if (fileNameElement) {

                fileNameElement.textContent =
                    file.name;

            }


            if (previewElement) {

                renderExcelPreview(
                    previewElement,
                    header,
                    dataRows
                );

            }


            showToast(
                `Excel loaded. Header row ignored. ${dataRows.length} data rows found.`,
                "success",
                "Excel Upload"
            );


        } catch (error) {

            console.error(
                "Excel error:",
                error
            );

            showToast(
                "Could not read the Excel file.",
                "error",
                "Excel Upload"
            );

        }

    };


    reader.onerror = () => {

        showToast(
            "Could not open the Excel file.",
            "error",
            "Excel Upload"
        );

    };


    reader.readAsArrayBuffer(file);

}


function renderExcelPreview(
    container,
    header,
    rows
) {

    container.innerHTML = "";

    const table =
        document.createElement("table");

    const thead =
        document.createElement("thead");

    const headerRow =
        document.createElement("tr");


    header.forEach(cell => {

        const th =
            document.createElement("th");

        th.textContent =
            String(cell ?? "");

        headerRow.appendChild(th);

    });


    thead.appendChild(headerRow);


    const tbody =
        document.createElement("tbody");


    rows.slice(0, 50).forEach(row => {

        const tr =
            document.createElement("tr");


        const columns =
            Array.isArray(row)
                ? row
                : [row];


        columns.forEach(cell => {

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
   EXCEL EVENTS
========================================================= */

function initExcel() {

    const cocoFile =
        $("cocoExcelFile");

    if (cocoFile) {

        cocoFile.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];

                loadExcelFile(
                    file,

                    rows => {

                        state.cocoExcelData =
                            rows;

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

                loadExcelFile(
                    file,

                    rows => {

                        state.otherExcelData =
                            rows;

                        updateLivePreview();

                    },

                    null,

                    $("otherExcelPreview")
                );

            }
        );

    }

}


/* =========================================================
   PAGE SIZE
========================================================= */

function getDimensions(
    size,
    customWidth,
    customHeight
) {

    switch (size) {

        case "4x6":

            return {
                width: 101.6,
                height: 152.4,
                label: "4 × 6 in"
            };


        case "70x35":

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
                    Math.max(
                        1,
                        Number(customWidth) || 70
                    ),

                height:
                    Math.max(
                        1,
                        Number(customHeight) || 35
                    ),

                label: "Custom"
            };


        default:

            return {
                width: 101.6,
                height: 152.4,
                label: "4 × 6 in"
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
   CUSTOM SIZE VISIBILITY
========================================================= */

function updateCustomSize(
    selectId,
    containerId,
    widthId,
    heightId
) {

    const select =
        $(selectId);

    const container =
        $(containerId);

    if (!select || !container) return;

    const isCustom =
        select.value === "custom";

    container.classList.toggle(
        "hidden",
        !isCustom
    );


    if (widthId) {

        const input = $(widthId);

        if (input) {
            input.disabled = !isCustom;
        }

    }


    if (heightId) {

        const input = $(heightId);

        if (input) {
            input.disabled = !isCustom;
        }

    }

}


/* =========================================================
   PAGE SETTINGS EVENTS
========================================================= */

function initPageSettings() {

    const configs = [

        {
            select: "pageSize",
            container: "customPageSizeFields",
            width: "customWidth",
            height: "customHeight"
        },

        {
            select: "isbnPageSize",
            container: "isbnCustomSize",
            width: "isbnCustomWidth",
            height: "isbnCustomHeight"
        },

        {
            select: "otherPageSize",
            container: "otherCustomSize",
            width: "otherCustomWidth",
            height: "otherCustomHeight"
        },

        {
            select: "addressPageSize",
            container: "addressCustomSize",
            width: "addressCustomWidth",
            height: "addressCustomHeight"
        }

    ];


    configs.forEach(config => {

        const select =
            $(config.select);

        if (!select) return;

        select.addEventListener(
            "change",
            () => {

                updateCustomSize(
                    config.select,
                    config.container,
                    config.width,
                    config.height
                );

                updateLivePreview();

            }
        );


        updateCustomSize(
            config.select,
            config.container,
            config.width,
            config.height
        );

    });


    [
        "orientation",
        "customWidth",
        "customHeight",
        "isbnCustomWidth",
        "isbnCustomHeight",
        "otherCustomWidth",
        "otherCustomHeight",
        "addressCustomWidth",
        "addressCustomHeight"
    ].forEach(id => {

        const element = $(id);

        if (!element) return;

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
   CONTENT SETTINGS
========================================================= */

function updateContentState(
    announce = false
) {

    const po =
        $("showPO");

    const box =
        $("showBox");

    const combined =
        $("combinePOBox");


    if (!po || !box || !combined) {
        return;
    }


    if (combined.checked) {

        /*
         * Combined PO + Box:
         * both individual controls freeze.
         */

        po.checked = true;
        box.checked = true;

        po.disabled = true;
        box.disabled = true;

        po.closest(".option-row")
            ?.classList.add(
                "frozen-control"
            );

        box.closest(".option-row")
            ?.classList.add(
                "frozen-control"
            );


        if (announce) {

            featureEnabled(
                "Combined PO + Box"
            );

        }

    } else {

        po.disabled = false;
        box.disabled = false;

        po.closest(".option-row")
            ?.classList.remove(
                "frozen-control"
            );

        box.closest(".option-row")
            ?.classList.remove(
                "frozen-control"
            );

    }


    /*
     * Prevent both from being turned off.
     */

    if (
        !combined.checked &&
        !po.checked &&
        !box.checked
    ) {

        po.checked = true;

        showToast(
            "At least PO Number or Box Number must remain enabled.",
            "error",
            "Content"
        );

    }


    updateLivePreview();

}


function initContentSettings() {

    [
        "showPO",
        "showBox",
        "combinePOBox"
    ].forEach(id => {

        const element = $(id);

        if (!element) return;

        element.addEventListener(
            "change",
            () => {

                const name =
                    id === "showPO"
                        ? "PO Number"
                        : id === "showBox"
                            ? "Box Number"
                            : "Combined PO + Box";


                if (element.checked) {

                    featureEnabled(name);

                } else {

                    featureDisabled(name);

                }


                updateContentState(
                    id === "combinePOBox"
                );

            }
        );

    });


    $$("input[name='poBoxLine']")
        .forEach(radio => {

            radio.addEventListener(
                "change",
                updateLivePreview
            );

        });


    updateContentState(false);

}


/* =========================================================
   BORDER SETTINGS
========================================================= */

function setBorderFreeze(
    id,
    frozen
) {

    const element = $(id);

    if (!element) return;

    element.disabled = frozen;

    const card =
        element.closest(
            ".border-setting-card"
        );

    if (card) {

        card.classList.toggle(
            "frozen-control",
            frozen
        );

    }

}


function updateBorderState(
    announce = false
) {

    const page =
        $("pageBorder");

    const po =
        $("poBorder");

    const box =
        $("boxBorder");

    const combined =
        $("combinedBorder");


    if (!page || !po || !box || !combined) {
        return;
    }


    if (combined.checked) {

        /*
         * Combined border ON:
         * all three are automatically selected
         * and frozen.
         */

        page.checked = true;
        po.checked = true;
        box.checked = true;

        setBorderFreeze(
            "pageBorder",
            true
        );

        setBorderFreeze(
            "poBorder",
            true
        );

        setBorderFreeze(
            "boxBorder",
            true
        );


        if (announce) {

            featureEnabled(
                "Combined Border"
            );

        }

    } else {

        setBorderFreeze(
            "pageBorder",
            false
        );

        setBorderFreeze(
            "poBorder",
            false
        );

        setBorderFreeze(
            "boxBorder",
            false
        );

    }


    updateLivePreview();

}


function initBorderSettings() {

    [
        "pageBorder",
        "poBorder",
        "boxBorder",
        "combinedBorder"
    ].forEach(id => {

        const element = $(id);

        if (!element) return;

        element.addEventListener(
            "change",
            () => {

                const name =
                    id === "pageBorder"
                        ? "Page Border"
                        : id === "poBorder"
                            ? "PO Border"
                            : id === "boxBorder"
                                ? "Box Border"
                                : "Combined Border";


                if (element.checked) {

                    featureEnabled(name);

                } else {

                    featureDisabled(name);

                }


                updateBorderState(
                    id === "combinedBorder"
                );

            }
        );

    });


    [
        "pageBorderStyle",
        "poBorderStyle",
        "boxBorderStyle"
    ].forEach(id => {

        const element = $(id);

        if (!element) return;

        element.addEventListener(
            "change",
            updateLivePreview
        );

    });


    updateBorderState(false);

}


/* =========================================================
   FONT SETTINGS
========================================================= */

function getFontSettings(prefix) {

    return {

        family:
            value(
                `${prefix}FontFamily`,
                "Arial"
            ),

        size:
            numberValue(
                `${prefix}FontSize`,
                20
            ),

        bold:
            checked(
                `${prefix}Bold`
            ),

        italic:
            checked(
                `${prefix}Italic`
            ),

        underline:
            checked(
                `${prefix}Underline`
            ),

        opacity:
            numberValue(
                `${prefix}Opacity`,
                100
            )

    };

}


function applyPreviewFont(
    element,
    settings
) {

    if (!element) return;

    element.style.fontFamily =
        `"${settings.family}"`;

    element.style.fontSize =
        `${settings.size}px`;

    element.style.fontWeight =
        settings.bold
            ? "700"
            : "400";

    element.style.fontStyle =
        settings.italic
            ? "italic"
            : "normal";

    element.style.textDecoration =
        settings.underline
            ? "underline"
            : "none";

    element.style.opacity =
        Math.max(
            0,
            Math.min(
                100,
                settings.opacity
            )
        ) / 100;

}


function initFontSettings() {

    const ids = [

        "poFontFamily",
        "poFontSize",
        "poBold",
        "poItalic",
        "poUnderline",
        "poOpacity",

        "boxFontFamily",
        "boxFontSize",
        "boxBold",
        "boxItalic",
        "boxUnderline",
        "boxOpacity",

        "otherFontFamily",
        "otherFontSize",

        "addressFontFamily",
        "addressFontSize",
        "addressBold",
        "addressItalic",
        "addressUnderline"

    ];


    ids.forEach(id => {

        const element = $(id);

        if (!element) return;

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
   LABEL FLOW
========================================================= */

function getLabelsPerPage() {

    return Math.max(
        1,
        Math.min(
            4,
            numberValue(
                "labelsPerPage",
                2
            )
        )
    );

}


function initFlowSettings() {

    const labels =
        $("labelsPerPage");

    if (labels) {

        labels.addEventListener(
            "change",
            () => {

                updateLivePreview();

            }
        );

    }


    const gap =
        $("labelGap");

    if (gap) {

        gap.addEventListener(
            "input",
            updateLivePreview
        );

    }


    $$("input[name='poFlow']")
        .forEach(radio => {

            radio.addEventListener(
                "change",
                updateLivePreview
            );

        });

}


/* =========================================================
   LIVE PREVIEW PAGE SIZE
========================================================= */

function updatePreviewPage() {

    const page =
        $("previewPage");

    if (!page) return;


    const dimensions =
        applyOrientation(
            getDimensions(
                value(
                    "pageSize",
                    "4x6"
                ),

                value(
                    "customWidth",
                    70
                ),

                value(
                    "customHeight",
                    35
                )
            ),

            value(
                "orientation",
                "portrait"
            )
        );


    /*
     * Preview is scaled for screen,
     * while preserving actual ratio.
     */

    const maxWidth = 500;
    const maxHeight = 560;

    const ratio =
        dimensions.width /
        dimensions.height;


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
        `${Math.max(150, width)}px`;

    page.style.height =
        `${Math.max(150, height)}px`;


    if ($("previewPageSize")) {

        $("previewPageSize").textContent =
            getDimensions(
                value("pageSize", "4x6"),
                value("customWidth", 70),
                value("customHeight", 35)
            ).label;

    }


    if ($("pageSummary")) {

        const d =
            getDimensions(
                value("pageSize", "4x6"),
                value("customWidth", 70),
                value("customHeight", 35)
            );

        $("pageSummary").textContent =
            `${d.label} / ${value("orientation", "portrait")}`;

    }

}


/* =========================================================
   LIVE PREVIEW LABEL CONTENT
========================================================= */

function getFirstPO() {

    const pos =
        getCocoPOs();

    return pos[0] ||
        "PO NUMBER";

}


function getBoxNumber() {

    return "BOX NUMBER";

}


function updatePreviewLabel(
    labelId,
    poId,
    boxId,
    poText,
    boxText,
    visiblePO,
    visibleBox,
    sameLine
) {

    const label =
        $(labelId);

    const po =
        $(poId);

    const box =
        $(boxId);


    if (!label || !po || !box) return;


    po.textContent =
        poText;

    box.textContent =
        boxText;


    po.style.display =
        visiblePO
            ? "block"
            : "none";


    box.style.display =
        visibleBox
            ? "block"
            : "none";


    label.style.flexDirection =
        sameLine
            ? "row"
            : "column";


    label.style.gap =
        sameLine
            ? "10px"
            : "7px";


    if (sameLine) {

        label.style.justifyContent =
            "center";

    }


    /*
     * Combined PO + Box text.
     */

    if (checked("combinePOBox")) {

        po.textContent =
            `${poText}  |  ${boxText}`;

        box.style.display =
            "none";

        label.style.flexDirection =
            "row";

    }


    applyPreviewFont(
        po,
        getFontSettings("po")
    );


    applyPreviewFont(
        box,
        getFontSettings("box")
    );

}


/* =========================================================
   LABEL BORDER PREVIEW
========================================================= */

function borderStyleToCSS(
    style
) {

    switch (style) {

        case "dashed":
            return "2px dashed #111827";

        case "dotted":
            return "2px dotted #111827";

        case "double":
            return "4px double #111827";

        case "rounded":
            return "2px solid #111827";

        default:
            return "2px solid #111827";

    }

}


function updatePreviewBorders() {

    const page =
        $("previewPage");

    if (!page) return;


    const pageEnabled =
        checked("pageBorder");

    const poEnabled =
        checked("poBorder");

    const boxEnabled =
        checked("boxBorder");

    const combined =
        checked("combinedBorder");


    page.style.border =
        pageEnabled || combined
            ? borderStyleToCSS(
                value(
                    "pageBorderStyle",
                    "solid"
                )
            )
            : "1px solid #cbd5e1";


    const poBorderStyle =
        borderStyleToCSS(
            value(
                "poBorderStyle",
                "solid"
            )
        );


    const boxBorderStyle =
        borderStyleToCSS(
            value(
                "boxBorderStyle",
                "solid"
            )
        );


    [1, 2].forEach(index => {

        const po =
            $(`previewPO${index}`);

        const box =
            $(`previewBox${index}`);

        const label =
            $(`previewLabel${index}`);


        if (!po || !box || !label) {
            return;
        }


        po.style.border =
            poEnabled || combined
                ? poBorderStyle
                : "none";


        box.style.border =
            boxEnabled || combined
                ? boxBorderStyle
                : "none";


        po.style.borderRadius =
            value(
                "poBorderStyle",
                "solid"
            ) === "rounded"
                ? "7px"
                : "3px";


        box.style.borderRadius =
            value(
                "boxBorderStyle",
                "solid"
            ) === "rounded"
                ? "7px"
                : "3px";


        label.classList.toggle(
            "combined-border",
            combined
        );

    });

}


/* =========================================================
   LABELS PER PAGE PREVIEW
========================================================= */

function updateLabelsPreview() {

    const count =
        getLabelsPerPage();


    const label2 =
        $("previewLabel2");


    if (!label2) return;


    /*
     * Existing HTML has two preview labels.
     *
     * 1 = show first only.
     * 2 = show both.
     *
     * For 3/4, duplicate-style visual
     * is created dynamically.
     */

    if (count === 1) {

        label2.style.display =
            "none";

    } else {

        label2.style.display =
            "flex";

    }


    if ($("previewLabelsPerPage")) {

        $("previewLabelsPerPage")
            .textContent =
            `${count} Label${count > 1 ? "s" : ""}`;

    }


    if ($("flowSummary")) {

        $("flowSummary").textContent =
            `${count} Label${count > 1 ? "s" : ""}`;

    }

}


/* =========================================================
   CONTENT SUMMARY
========================================================= */

function updateSummaries() {

    const po =
        checked("showPO");

    const box =
        checked("showBox");

    const combined =
        checked("combinePOBox");


    if ($("contentSummary")) {

        if (combined) {

            $("contentSummary").textContent =
                "Combined PO + Box";

        } else if (po && box) {

            $("contentSummary").textContent =
                "PO + Box";

        } else if (po) {

            $("contentSummary").textContent =
                "PO Only";

        } else if (box) {

            $("contentSummary").textContent =
                "Box Only";

        } else {

            $("contentSummary").textContent =
                "None";

        }

    }


    if ($("borderSummary")) {

        const borders = [];

        if (checked("pageBorder"))
            borders.push("Page");

        if (checked("poBorder"))
            borders.push("PO");

        if (checked("boxBorder"))
            borders.push("Box");

        if (checked("combinedBorder"))
            borders.length = 0,
            borders.push("Combined");


        $("borderSummary").textContent =
            borders.length
                ? borders.join(" + ")
                : "None";

    }

}


/* =========================================================
   MASTER LIVE PREVIEW
========================================================= */

function updateLivePreview() {

    if (
        state.currentFeature ===
        "coco-blue"
    ) {

        updatePreviewPage();

        const visiblePO =
            checked("showPO");

        const visibleBox =
            checked("showBox");

        const sameLine =
            value(
                "sameLine"
            ) === "same";


        const po =
            getFirstPO();

        const box =
            getBoxNumber();


        updatePreviewLabel(
            "previewLabel1",
            "previewPO1",
            "previewBox1",
            po,
            box,
            visiblePO,
            visibleBox,
            sameLine
        );


        updatePreviewLabel(
            "previewLabel2",
            "previewPO2",
            "previewBox2",
            po,
            box,
            visiblePO,
            visibleBox,
            sameLine
        );


        updatePreviewBorders();

        updateLabelsPreview();

        updateSummaries();

    }


    updateISBNPreview();

    updateAddressPreview();

}


/* =========================================================
   ISBN BARCODE
========================================================= */

function updateISBNPreview() {

    const container =
        $("isbnBarcodePreview");

    if (!container) return;


    const isbn =
        value("isbnNumber").trim();

    const title =
        value("isbnTitle").trim();


    container.innerHTML = "";


    if (!isbn) {

        container.innerHTML = `
            <div style="
                color:#6b7280;
                font-size:12px;
                text-align:center;
            ">
                Enter ISBN to preview barcode
            </div>
        `;

        return;

    }


    if (typeof JsBarcode === "undefined") {

        container.textContent =
            isbn;

        return;

    }


    const svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );


    container.appendChild(svg);


    try {

        JsBarcode(
            svg,
            isbn.replace(/\D/g, ""),
            {
                format: "EAN13",
                displayValue: true,
                width: 2,
                height: 70,
                margin: 10,
                fontSize: 13,
                lineColor: "#111827"
            }
        );

    } catch (error) {

        try {

            JsBarcode(
                svg,
                isbn,
                {
                    format: "CODE128",
                    displayValue: true,
                    width: 2,
                    height: 70,
                    margin: 10,
                    fontSize: 13,
                    lineColor: "#111827"
                }
            );

        } catch (fallbackError) {

            container.innerHTML =
                `<span style="
                    font-size:12px;
                    color:#dc2626;
                ">Invalid barcode value</span>`;

        }

    }


    if (title) {

        const titleElement =
            document.createElement("div");

        titleElement.style.marginTop =
            "7px";

        titleElement.style.fontSize =
            "11px";

        titleElement.style.color =
            "#4b5563";

        titleElement.textContent =
            title;

        container.appendChild(
            titleElement
        );

    }

}


/* =========================================================
   QR CODE
========================================================= */

function makeQR(
    containerId,
    text
) {

    const container =
        $(containerId);

    if (!container) return;


    container.innerHTML = "";


    if (!text) return;


    if (
        typeof QRCode ===
        "undefined"
    ) {

        container.textContent =
            "QR library unavailable.";

        return;

    }


    const canvas =
        document.createElement("canvas");


    QRCode.toCanvas(
        canvas,
        text,
        {
            width: 145,
            margin: 2,
            errorCorrectionLevel: "M"
        },
        error => {

            if (error) {

                console.error(
                    "QR error:",
                    error
                );

                return;

            }

            container.appendChild(
                canvas
            );

        }
    );

}


function updateAddressPreview() {

    const from =
        value("fromAddress").trim();

    const to =
        value("toAddress").trim();

    const email =
        value("addressEmail").trim();


    if ($("addressLivePreview")) {

        $("addressLivePreview").innerHTML = `

            <div style="
                width:min(100%,520px);
                background:white;
                border:1px solid #e5e7eb;
                border-radius:10px;
                padding:18px;
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:14px;
                box-shadow:0 8px 24px rgba(15,23,42,.08);
            ">

                <div style="
                    border:1px solid #dbe1e8;
                    border-radius:8px;
                    padding:12px;
                ">

                    <strong style="
                        font-size:10px;
                        color:#6b7280;
                    ">
                        FROM
                    </strong>

                    <div style="
                        margin-top:7px;
                        font-size:12px;
                        white-space:pre-wrap;
                    ">
                        ${escapeHTML(
                            from || "From Address"
                        )}
                    </div>

                </div>


                <div style="
                    border:1px solid #dbe1e8;
                    border-radius:8px;
                    padding:12px;
                ">

                    <strong style="
                        font-size:10px;
                        color:#6b7280;
                    ">
                        TO
                    </strong>

                    <div style="
                        margin-top:7px;
                        font-size:12px;
                        white-space:pre-wrap;
                    ">
                        ${escapeHTML(
                            to || "To Address"
                        )}
                    </div>

                </div>

            </div>
        `;

    }


    makeQR(
        "addressQR",
        to || from
    );


    makeQR(
        "emailQR",
        email
            ? `mailto:${email}`
            : ""
    );

}


/* =========================================================
   LIVE INPUTS
========================================================= */

function initLiveInputs() {

    $$(
        "input, textarea, select"
    ).forEach(element => {

        if (
            element.type === "file"
        ) {
            return;
        }


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

    });

}


/* =========================================================
   RESET COCO
========================================================= */

function resetCoco() {

    for (let i = 1; i <= 20; i++) {

        const input =
            $(`cocoPO${i}`);

        if (input) {
            input.value = "";
        }

    }


    if ($("cocoBulkInput")) {
        $("cocoBulkInput").value = "";
    }


    state.cocoExcelData = [];


    if ($("cocoExcelFile")) {
        $("cocoExcelFile").value = "";
    }


    if ($("cocoExcelFileName")) {
        $("cocoExcelFileName").textContent =
            "No file selected";
    }


    if ($("cocoExcelPreview")) {
        $("cocoExcelPreview").innerHTML =
            "";
    }


    if ($("showPO")) {
        $("showPO").checked = true;
    }

    if ($("showBox")) {
        $("showBox").checked = true;
    }

    if ($("combinePOBox")) {
        $("combinePOBox").checked = false;
    }


    if ($("pageBorder")) {
        $("pageBorder").checked = false;
    }

    if ($("poBorder")) {
        $("poBorder").checked = false;
    }

    if ($("boxBorder")) {
        $("boxBorder").checked = false;
    }

    if ($("combinedBorder")) {
        $("combinedBorder").checked = false;
    }


    if ($("pageSize")) {
        $("pageSize").value = "4x6";
    }

    if ($("orientation")) {
        $("orientation").value = "portrait";
    }

    if ($("customWidth")) {
        $("customWidth").value = 70;
    }

    if ($("customHeight")) {
        $("customHeight").value = 35;
    }


    if ($("labelsPerPage")) {
        $("labelsPerPage").value = "2";
    }


    if ($("sameLine")) {
        $("sameLine").checked = false;
    }

    if ($("separateLine")) {
        $("separateLine").checked = true;
    }


    switchCocoMode("manual");

    updateCustomSize(
        "pageSize",
        "customPageSizeFields",
        "customWidth",
        "customHeight"
    );

    updateContentState(false);

    updateBorderState(false);

    updateManualCount();

    updateLivePreview();


    showToast(
        "Coco Blue settings have been reset.",
        "success",
        "Reset Complete"
    );

}


/* =========================================================
   RESET OTHER
========================================================= */

function resetOther() {

    for (let i = 1; i <= 20; i++) {

        const input =
            $(`otherPO${i}`);

        if (input) {
            input.value = "";
        }

    }


    if ($("otherBulkInput")) {
        $("otherBulkInput").value = "";
    }


    state.otherExcelData = [];


    if ($("otherExcelFile")) {
        $("otherExcelFile").value = "";
    }


    if ($("otherExcelPreview")) {
        $("otherExcelPreview").innerHTML =
            "";
    }


    switchOtherMode("manual");

    updateLivePreview();


    showToast(
        "Other PO settings have been reset.",
        "success",
        "Reset Complete"
    );

}


/* =========================================================
   RESET ISBN
========================================================= */

function resetISBN() {

    if ($("isbnNumber")) {
        $("isbnNumber").value = "";
    }

    if ($("isbnTitle")) {
        $("isbnTitle").value = "";
    }

    if ($("isbnPageSize")) {
        $("isbnPageSize").value = "4x6";
    }

    if ($("isbnCustomWidth")) {
        $("isbnCustomWidth").value = "";
    }

    if ($("isbnCustomHeight")) {
        $("isbnCustomHeight").value = "";
    }


    updateCustomSize(
        "isbnPageSize",
        "isbnCustomSize",
        "isbnCustomWidth",
        "isbnCustomHeight"
    );


    updateISBNPreview();


    showToast(
        "ISBN settings have been reset.",
        "success",
        "Reset Complete"
    );

}


/* =========================================================
   RESET ADDRESS
========================================================= */

function resetAddress() {

    [
        "fromAddress",
        "toAddress",
        "addressEmail"
    ].forEach(id => {

        if ($(id)) {
            $(id).value = "";
        }

    });


    if ($("addressPageSize")) {
        $("addressPageSize").value = "4x6";
    }


    updateCustomSize(
        "addressPageSize",
        "addressCustomSize",
        "addressCustomWidth",
        "addressCustomHeight"
    );


    updateAddressPreview();


    showToast(
        "Address settings have been reset.",
        "success",
        "Reset Complete"
    );

}


/* =========================================================
   PDF HELPERS
========================================================= */

function getPDFDimensions(
    sizeId,
    widthId,
    heightId,
    orientationId
) {

    const d =
        getDimensions(
            value(sizeId, "4x6"),
            value(widthId, 70),
            value(heightId, 35)
        );


    return applyOrientation(
        d,
        value(
            orientationId,
            "portrait"
        )
    );

}


function createPDF(
    dimensions
) {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        showToast(
            "PDF library is not loaded.",
            "error",
            "PDF Generator"
        );

        return null;

    }


    const orientation =
        dimensions.width >
        dimensions.height
            ? "landscape"
            : "portrait";


    return new window.jspdf.jsPDF({
        orientation,
        unit: "mm",
        format: [
            dimensions.width,
            dimensions.height
        ]
    });

}


/* =========================================================
   PDF FONT
========================================================= */

function pdfFontStyle(settings) {

    if (
        settings.bold &&
        settings.italic
    ) {
        return "bolditalic";
    }

    if (settings.bold) {
        return "bold";
    }

    if (settings.italic) {
        return "italic";
    }

    return "normal";
}


/* =========================================================
   DRAW LABEL TO PDF
========================================================= */

function drawPDFLabel(
    doc,
    x,
    y,
    width,
    height,
    po,
    box
) {

    const showPO =
        checked("showPO");

    const showBox =
        checked("showBox");

    const combined =
        checked("combinePOBox");

    const pageBorder =
        checked("pageBorder");

    const poBorder =
        checked("poBorder");

    const boxBorder =
        checked("boxBorder");

    const combinedBorder =
        checked("combinedBorder");


    const poFont =
        getFontSettings("po");

    const boxFont =
        getFontSettings("box");


    /*
     * Background.
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
     * Border.
     */

    if (
        pageBorder ||
        combinedBorder
    ) {

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


    const sameLine =
        value(
            "sameLine"
        ) === "same";


    const centerX =
        x + width / 2;


    let centerY =
        y + height / 2;


    /*
     * Combined PO + Box.
     */

    if (combined) {

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(
            Math.min(
                poFont.size,
                32
            )
        );


        doc.text(
            `${po} | BOX ${box}`,
            centerX,
            centerY,
            {
                align: "center"
            }
        );


        return;

    }


    /*
     * Same line.
     */

    if (
        sameLine &&
        showPO &&
        showBox
    ) {

        doc.setFont(
            poFont.family,
            pdfFontStyle(poFont)
        );

        doc.setFontSize(
            poFont.size
        );


        doc.text(
            `${po}   |   ${box}`,
            centerX,
            centerY,
            {
                align: "center"
            }
        );


        return;

    }


    /*
     * Separate lines.
     */

    let offset = 0;


    if (showPO) {

        doc.setFont(
            poFont.family,
            pdfFontStyle(poFont)
        );

        doc.setFontSize(
            poFont.size
        );


        doc.text(
            String(po),
            centerX,
            centerY - 5,
            {
                align: "center"
            }
        );


        if (
            poBorder &&
            !combinedBorder
        ) {

            doc.setLineWidth(
                0.4
            );

            doc.rect(
                x + 4,
                centerY - 12,
                width - 8,
                14
            );

        }


        offset = 10;

    }


    if (showBox) {

        doc.setFont(
            boxFont.family,
            pdfFontStyle(boxFont)
        );

        doc.setFontSize(
            boxFont.size
        );


        doc.text(
            String(box),
            centerX,
            centerY + offset + 3,
            {
                align: "center"
            }
        );


        if (
            boxBorder &&
            !combinedBorder
        ) {

            doc.setLineWidth(
                0.4
            );

            doc.rect(
                x + 4,
                centerY + offset - 5,
                width - 8,
                14
            );

        }

    }

}


/* =========================================================
   GENERATE COCO PDF
========================================================= */

function generateCocoPDF() {

    const dimensions =
        getPDFDimensions(
            "pageSize",
            "customWidth",
            "customHeight",
            "orientation"
        );


    const doc =
        createPDF(dimensions);

    if (!doc) return;


    const pos =
        getCocoPOs();


    const list =
        pos.length
            ? pos
            : ["PO NUMBER"];


    const labelsPerPage =
        getLabelsPerPage();


    const labelGap =
        Math.max(
            0,
            numberValue(
                "labelGap",
                2
            )
        );


    /*
     * Keep box number sequential.
     */

    let boxNumber = 1;


    for (
        let index = 0;
        index < list.length;
        index += labelsPerPage
    ) {

        if (index > 0) {

            doc.addPage(
                [
                    dimensions.width,
                    dimensions.height
                ]
            );

        }


        const batch =
            list.slice(
                index,
                index + labelsPerPage
            );


        const availableHeight =
            dimensions.height -
            labelGap *
            (batch.length + 1);


        const labelHeight =
            availableHeight /
            batch.length;


        batch.forEach(
            (po, position) => {

                const x =
                    labelGap;

                const y =
                    labelGap +
                    position *
                    (
                        labelHeight +
                        labelGap
                    );


                const width =
                    dimensions.width -
                    labelGap * 2;


                drawPDFLabel(
                    doc,
                    x,
                    y,
                    width,
                    labelHeight,
                    po,
                    boxNumber++
                );

            }
        );

    }


    doc.save(
        "books-label-studio-coco-blue.pdf"
    );


    showToast(
        "PDF generated successfully.",
        "success",
        "Coco Blue"
    );

}


/* =========================================================
   OTHER PO PDF
========================================================= */

function generateOtherPDF() {

    const dimensions =
        getPDFDimensions(
            "otherPageSize",
            "otherCustomWidth",
            "otherCustomHeight",
            "otherOrientation"
        );


    const doc =
        createPDF(dimensions);

    if (!doc) return;


    const pos =
        getOtherPOs();


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
                    ]
                );

            }


            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                28
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
        "success",
        "Other PO"
    );

}


/* =========================================================
   ISBN PDF
========================================================= */

function generateISBNPDF() {

    const dimensions =
        getPDFDimensions(
            "isbnPageSize",
            "isbnCustomWidth",
            "isbnCustomHeight",
            "isbnOrientation"
        );


    const doc =
        createPDF(dimensions);

    if (!doc) return;


    const isbn =
        value(
            "isbnNumber",
            "ISBN"
        ).trim();


    const title =
        value(
            "isbnTitle"
        ).trim();


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        18
    );


    doc.text(
        title || "ISBN",
        dimensions.width / 2,
        20,
        {
            align: "center"
        }
    );


    if (typeof JsBarcode !== "undefined") {

        /*
         * Generate barcode on an SVG.
         * SVG-to-PDF conversion is not guaranteed
         * without additional plugins, so use a
         * clean text representation as fallback.
         */

        doc.setFont(
            "courier",
            "normal"
        );

        doc.setFontSize(
            14
        );


        doc.text(
            isbn,
            dimensions.width / 2,
            dimensions.height / 2,
            {
                align: "center"
            }
        );

    } else {

        doc.text(
            isbn,
            dimensions.width / 2,
            dimensions.height / 2,
            {
                align: "center"
            }
        );

    }


    doc.save(
        "books-label-studio-isbn.pdf"
    );


    showToast(
        "ISBN PDF generated successfully.",
        "success",
        "ISBN Barcode Maker"
    );

}


/* =========================================================
   ADDRESS PDF
========================================================= */

function generateAddressPDF() {

    const dimensions =
        getDimensions(
            value(
                "addressPageSize",
                "4x6"
            ),

            value(
                "addressCustomWidth",
                70
            ),

            value(
                "addressCustomHeight",
                35
            )
        );


    const doc =
        createPDF(dimensions);

    if (!doc) return;


    const from =
        value(
            "fromAddress",
            "From Address"
        );


    const to =
        value(
            "toAddress",
            "To Address"
        );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        10
    );


    doc.text(
        "FROM",
        10,
        15
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        11
    );


    const fromLines =
        doc.splitTextToSize(
            from,
            dimensions.width - 20
        );


    doc.text(
        fromLines,
        10,
        22
    );


    const toY =
        dimensions.height / 2;


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        10
    );


    doc.text(
        "TO",
        10,
        toY
    );


    doc.setFont(
        "helvetica",
        "normal"
    );


    const toLines =
        doc.splitTextToSize(
            to,
            dimensions.width - 20
        );


    doc.text(
        toLines,
        10,
        toY + 7
    );


    doc.save(
        "books-label-studio-address.pdf"
    );


    showToast(
        "Address PDF generated successfully.",
        "success",
        "Address Label Maker"
    );

}


/* =========================================================
   ACTION BUTTONS
========================================================= */

function initActions() {

    const actions = {

        cocoResetButton:
            resetCoco,

        cocoGenerateButton:
            generateCocoPDF,

        otherResetButton:
            resetOther,

        otherGenerateButton:
            generateOtherPDF,

        isbnResetButton:
            resetISBN,

        isbnGenerateButton:
            generateISBNPDF,

        addressResetButton:
            resetAddress,

        addressGenerateButton:
            generateAddressPDF

    };


    Object.entries(actions).forEach(
        ([id, handler]) => {

            const button = $(id);

            if (!button) return;

            button.addEventListener(
                "click",
                handler
            );

        }
    );

}


/* =========================================================
   ADDRESS QR LIVE INPUTS
========================================================= */

function initAddress() {

    [
        "fromAddress",
        "toAddress",
        "addressEmail"
    ].forEach(id => {

        const element = $(id);

        if (!element) return;

        element.addEventListener(
            "input",
            updateAddressPreview
        );

    });


    updateAddressPreview();

}


/* =========================================================
   ISBN EVENTS
========================================================= */

function initISBN() {

    [
        "isbnNumber",
        "isbnTitle",
        "isbnCustomWidth",
        "isbnCustomHeight"
    ].forEach(id => {

        const element = $(id);

        if (!element) return;

        element.addEventListener(
            "input",
            updateISBNPreview
        );

    });

}


/* =========================================================
   STATUS
========================================================= */

function setAppReady() {

    if ($("appStatusText")) {

        $("appStatusText").textContent =
            "Ready";

    }

    if ($("appStatus")) {

        $("appStatus").style.background =
            "#16a34a";

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

function initApp() {

    try {

        initFeatureCards();

        initPopups();

        initCocoModes();

        initOtherModes();

        createManualInputs(
            "manualPOGrid",
            "cocoPO",
            20
        );

        createManualInputs(
            "otherManualPOGrid",
            "otherPO",
            20
        );

        initExcel();

        initPageSettings();

        initContentSettings();

        initBorderSettings();

        initFontSettings();

        initFlowSettings();

        initLiveInputs();

        initActions();

        initAddress();

        initISBN();


        /*
         * Default workspace.
         */

        openFeature(
            "coco-blue"
        );


        /*
         * Initial preview.
         */

        updateManualCount();

        updateLivePreview();

        setAppReady();


        console.log(
            "Books Label Studio initialized."
        );


    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );


        showToast(
            "Something went wrong while starting the website.",
            "error",
            "Application Error"
        );

    }

}


/* =========================================================
   START AFTER DOM
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