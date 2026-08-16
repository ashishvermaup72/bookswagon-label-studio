/* =========================================================
   BOOKS LABEL STUDIO
   FINAL app.js
========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
========================================================= */

const App = {

    activeTool: "cocoBlue",
    activeCocoMode: "individual",
    activeOtherMode: "individual",
    activeAddressMode: "manual",

    history: [],
    historyIndex: -1,

    clipboardStyle: null,

    borderStyles: {
        coco: "solid",
        other: "solid",
        isbn: "solid",
        address: "solid"
    },

    enabledState: {},

    defaultStyle: null
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
    const el = $(id);

    if (!el) {
        return fallback;
    }

    return el.value;
}


function setValue(id, val) {
    const el = $(id);

    if (el) {
        el.value = val;
    }
}


function checked(id) {
    const el = $(id);

    return el ? el.checked : false;
}


function setChecked(id, state) {
    const el = $(id);

    if (el) {
        el.checked = !!state;
    }
}


function clamp(number, min, max) {
    return Math.min(
        Math.max(number, min),
        max
    );
}


function safeNumber(value, fallback = 0) {

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : fallback;
}


function escapeHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message,
    type = "success",
    duration = 2800
) {

    const toast = $("toast");
    const icon = $("toastIcon");
    const msg = $("toastMessage");

    if (!toast || !msg) {
        return;
    }

    clearTimeout(toastTimer);

    toast.classList.remove(
        "show",
        "success",
        "error",
        "warning"
    );

    toast.classList.add(type);

    if (icon) {

        icon.textContent =
            type === "error"
                ? "!"
                : type === "warning"
                    ? "!"
                    : "✓";
    }

    msg.textContent = message;

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, duration);
}


function notifyEnabled(name) {

    showToast(
        `${name} Enabled`,
        "success"
    );
}


function notifyDisabled(name) {

    showToast(
        `${name} Disabled`,
        "error"
    );
}


/* =========================================================
   ENABLE / DISABLE TRACKING
========================================================= */

function trackToggle(id, name) {

    const el = $(id);

    if (!el) {
        return;
    }

    App.enabledState[id] = el.checked;

    el.addEventListener("change", () => {

        App.enabledState[id] = el.checked;

        if (el.checked) {
            notifyEnabled(name);
        } else {
            notifyDisabled(name);
        }

        saveHistory();

        liveRefresh();

    });
}


/* =========================================================
   HISTORY
========================================================= */

function collectFormState() {

    const data = {};

    $$("input, select, textarea").forEach(el => {

        if (!el.id) {
            return;
        }

        if (el.type === "file") {
            return;
        }

        if (el.type === "checkbox") {

            data[el.id] = {
                type: "checkbox",
                value: el.checked
            };

        } else if (el.type === "range") {

            data[el.id] = {
                type: "range",
                value: el.value
            };

        } else {

            data[el.id] = {
                type: el.type || "text",
                value: el.value
            };
        }

    });

    data.__borderStyles =
        JSON.parse(
            JSON.stringify(App.borderStyles)
        );

    data.__activeTool =
        App.activeTool;

    return data;
}


function restoreFormState(data) {

    if (!data) {
        return;
    }

    Object.keys(data).forEach(key => {

        if (key.startsWith("__")) {
            return;
        }

        const el = $(key);

        if (!el) {
            return;
        }

        const item = data[key];

        if (item.type === "checkbox") {

            el.checked = !!item.value;

        } else {

            el.value = item.value;
        }

    });

    if (data.__borderStyles) {

        App.borderStyles =
            JSON.parse(
                JSON.stringify(
                    data.__borderStyles
                )
            );
    }

    if (data.__activeTool) {

        App.activeTool =
            data.__activeTool;
    }

    syncPresetInputs();

    applyActiveTool();

    liveRefresh();
}


function saveHistory() {

    const state = collectFormState();

    const last =
        App.history[App.historyIndex];

    if (
        last &&
        JSON.stringify(last) ===
        JSON.stringify(state)
    ) {
        return;
    }

    App.history =
        App.history.slice(
            0,
            App.historyIndex + 1
        );

    App.history.push(state);

    if (App.history.length > 60) {

        App.history.shift();

    }

    App.historyIndex =
        App.history.length - 1;

    updateHistoryButtons();
}


function undo() {

    if (App.historyIndex <= 0) {

        showToast(
            "Nothing to undo",
            "warning"
        );

        return;
    }

    App.historyIndex--;

    restoreFormState(
        App.history[
            App.historyIndex
        ]
    );

    showToast(
        "Undo",
        "success"
    );

    updateHistoryButtons();
}


function redo() {

    if (
        App.historyIndex >=
        App.history.length - 1
    ) {

        showToast(
            "Nothing to redo",
            "warning"
        );

        return;
    }

    App.historyIndex++;

    restoreFormState(
        App.history[
            App.historyIndex
        ]
    );

    showToast(
        "Redo",
        "success"
    );

    updateHistoryButtons();
}


function updateHistoryButtons() {

    const undoButton =
        $("undoButton");

    const redoButton =
        $("redoButton");

    if (undoButton) {

        undoButton.disabled =
            App.historyIndex <= 0;
    }

    if (redoButton) {

        redoButton.disabled =
            App.historyIndex >=
            App.history.length - 1;
    }
}


/* =========================================================
   DEFAULT STYLE
========================================================= */

function saveDefaultStyle() {

    App.defaultStyle =
        collectFormState();

    try {

        localStorage.setItem(
            "booksLabelStudioDefaultStyle",
            JSON.stringify(
                App.defaultStyle
            )
        );

    } catch (error) {

        console.warn(
            "Could not save default style",
            error
        );
    }

    showToast(
        "Default style saved",
        "success"
    );
}


function loadDefaultStyle() {

    let style =
        App.defaultStyle;

    try {

        const stored =
            localStorage.getItem(
                "booksLabelStudioDefaultStyle"
            );

        if (stored) {

            style =
                JSON.parse(stored);
        }

    } catch (error) {

        console.warn(
            "Could not load default style",
            error
        );
    }

    if (!style) {

        showToast(
            "No saved default style found",
            "warning"
        );

        return;
    }

    restoreFormState(style);

    saveHistory();

    showToast(
        "Default style loaded",
        "success"
    );
}


/* =========================================================
   RESET
========================================================= */

function resetAll() {

    const confirmed =
        window.confirm(
            "Reset all settings and styles?"
        );

    if (!confirmed) {
        return;
    }

    $$("input, select, textarea")
        .forEach(el => {

            if (
                el.type === "file" ||
                el.id === "languageSelect"
            ) {
                return;
            }

            if (el.type === "checkbox") {

                el.checked =
                    el.defaultChecked;

            } else if (el.type === "range") {

                el.value =
                    el.defaultValue;

            } else {

                el.value =
                    el.defaultValue;
            }

        });

    App.borderStyles = {
        coco: "solid",
        other: "solid",
        isbn: "solid",
        address: "solid"
    };

    App.clipboardStyle = null;

    syncPresetInputs();

    applyActiveTool();

    liveRefresh();

    saveHistory();

    showToast(
        "All settings reset",
        "success"
    );
}


function resetCurrentStyle() {

    const ids = [

        "poFontFamily",
        "poFontSize",
        "poAlignment",
        "poLineHeight",

        "boxFontFamily",
        "boxFontSize",
        "boxAlignment",
        "boxLineHeight",

        "otherFontFamily",
        "otherFontSize",
        "otherAlignment",
        "otherLineHeight",

        "isbnFontFamily",
        "isbnFontSize",
        "isbnAlignment",
        "isbnLineHeight",

        "fromFontFamily",
        "fromFontSize",
        "fromAlignment",
        "fromLineHeight",

        "toFontFamily",
        "toFontSize",
        "toAlignment",
        "toLineHeight"
    ];

    ids.forEach(id => {

        const el = $(id);

        if (el) {

            el.value =
                el.defaultValue ||
                el.value;
        }

    });

    syncPresetInputs();

    liveRefresh();

    saveHistory();

    showToast(
        "Current style reset",
        "success"
    );
}


/* =========================================================
   COPY / PASTE STYLE
========================================================= */

function getStyleSnapshot() {

    const ids = [

        "poFontFamily",
        "poFontSize",
        "poAlignment",
        "poLineHeight",
        "poBoldCheck",
        "poItalicCheck",
        "poUnderlineCheck",
        "poStrikeCheck",
        "poUppercaseCheck",

        "boxFontFamily",
        "boxFontSize",
        "boxAlignment",
        "boxLineHeight",
        "boxBoldCheck",
        "boxItalicCheck",
        "boxUnderlineCheck",
        "boxStrikeCheck",

        "otherFontFamily",
        "otherFontSize",
        "otherAlignment",
        "otherLineHeight",
        "otherBold",
        "otherItalic",
        "otherUnderline",
        "otherStrike",

        "isbnFontFamily",
        "isbnFontSize",
        "isbnAlignment",
        "isbnLineHeight",
        "isbnBold",
        "isbnItalic",
        "isbnUnderline",

        "fromFontFamily",
        "fromFontSize",
        "fromAlignment",
        "fromLineHeight",
        "fromBold",
        "fromItalic",
        "fromUnderline",
        "fromStrike",

        "toFontFamily",
        "toFontSize",
        "toAlignment",
        "toLineHeight",
        "toBold",
        "toItalic",
        "toUnderline",
        "toStrike"
    ];

    const result = {};

    ids.forEach(id => {

        const el = $(id);

        if (!el) {
            return;
        }

        if (el.type === "checkbox") {

            result[id] = {
                type: "checkbox",
                value: el.checked
            };

        } else {

            result[id] = {
                type: "value",
                value: el.value
            };
        }

    });

    return result;
}


function copyStyle() {

    App.clipboardStyle =
        getStyleSnapshot();

    showToast(
        "Style copied",
        "success"
    );
}


function pasteStyle() {

    if (!App.clipboardStyle) {

        showToast(
            "No copied style available",
            "warning"
        );

        return;
    }

    Object.keys(
        App.clipboardStyle
    ).forEach(id => {

        const el = $(id);

        if (!el) {
            return;
        }

        const item =
            App.clipboardStyle[id];

        if (item.type === "checkbox") {

            el.checked =
                !!item.value;

        } else {

            el.value =
                item.value;
        }

    });

    syncPresetInputs();

    liveRefresh();

    saveHistory();

    showToast(
        "Style pasted",
        "success"
    );
}


/* =========================================================
   CATEGORY NAVIGATION
========================================================= */

function applyActiveTool() {

    $$(".category-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                App.activeTool
            );

        });

    $$(".tool-section")
        .forEach(section => {

            section.classList.toggle(
                "active",
                section.dataset.tool ===
                App.activeTool
            );

        });
}


function setupCategoryNavigation() {

    $$(".category-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    App.activeTool =
                        button.dataset.category;

                    applyActiveTool();

                    liveRefresh();

                }
            );

        });
}


/* =========================================================
   COCO MODES
========================================================= */

function setupCocoModes() {

    $$("[data-coco-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    App.activeCocoMode =
                        button.dataset.cocoMode;

                    $$("[data-coco-mode]")
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

                    Object.keys(panels)
                        .forEach(mode => {

                            const panel =
                                $(panels[mode]);

                            if (panel) {

                                panel.classList.toggle(
                                    "active",
                                    mode ===
                                    App.activeCocoMode
                                );
                            }

                        });

                }
            );

        });
}


/* =========================================================
   OTHER MODES
========================================================= */

function setupOtherModes() {

    $$("[data-other-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    App.activeOtherMode =
                        button.dataset.otherMode;

                    $$("[data-other-mode]")
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

                    Object.keys(panels)
                        .forEach(mode => {

                            const panel =
                                $(panels[mode]);

                            if (panel) {

                                panel.classList.toggle(
                                    "active",
                                    mode ===
                                    App.activeOtherMode
                                );
                            }

                        });

                }
            );

        });
}


/* =========================================================
   ADDRESS MODES
========================================================= */

function setupAddressModes() {

    $$("[data-address-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    App.activeAddressMode =
                        button.dataset.addressMode;

                    $$("[data-address-mode]")
                        .forEach(btn => {

                            btn.classList.toggle(
                                "active",
                                btn === button
                            );

                        });

                    const panels = {

                        manual:
                            "addressManualPanel",

                        excel:
                            "addressExcelPanel"
                    };

                    Object.keys(panels)
                        .forEach(mode => {

                            const panel =
                                $(panels[mode]);

                            if (panel) {

                                panel.classList.toggle(
                                    "active",
                                    mode ===
                                    App.activeAddressMode
                                );
                            }

                        });

                }
            );

        });
}


/* =========================================================
   CREATE PO INPUTS
========================================================= */

function createPOInputs(
    containerId,
    prefix,
    count = 12
) {

    const container =
        $(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    for (
        let i = 1;
        i <= count;
        i++
    ) {

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

                liveRefresh();

            }
        );

        container.appendChild(input);
    }
}


/* =========================================================
   BORDER STYLE
========================================================= */

function setupBorderStyleButtons() {

    $$("[data-border-style]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const style =
                        button.dataset.borderStyle;

                    App.borderStyles.coco =
                        style;

                    markSelected(
                        "[data-border-style]",
                        button
                    );

                    applyCocoBorder();

                    saveHistory();

                }
            );

        });


    $$("[data-other-border]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    App.borderStyles.other =
                        button.dataset.otherBorder;

                    markSelected(
                        "[data-other-border]",
                        button
                    );

                    applyOtherBorder();

                    saveHistory();

                }
            );

        });


    $$("[data-isbn-border]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    App.borderStyles.isbn =
                        button.dataset.isbnBorder;

                    markSelected(
                        "[data-isbn-border]",
                        button
                    );

                    applyISBNBorder();

                    saveHistory();

                }
            );

        });


    $$("[data-address-border]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    App.borderStyles.address =
                        button.dataset.addressBorder;

                    markSelected(
                        "[data-address-border]",
                        button
                    );

                    applyAddressBorder();

                    saveHistory();

                }
            );

        });

}


function markSelected(
    selector,
    selected
) {

    $$(selector)
        .forEach(button => {

            button.classList.toggle(
                "active",
                button === selected
            );

        });
}


/* =========================================================
   BORDER STYLE CONVERSION
========================================================= */

function cssBorderStyle(style) {

    const styles = {

        solid: "solid",
        double: "double",
        dashed: "dashed",
        dotted: "dotted",
        groove: "groove",
        ridge: "ridge",
        inset: "inset",
        outset: "outset",

        thin: "solid",
        medium: "solid",
        thick: "solid",

        thinDouble: "double",
        thickDouble: "double",

        dashDot: "dashed",
        dashDotDot: "dotted",
        longDash: "dashed",
        longDashDot: "dashed",
        dotDash: "dotted",

        triple: "double",
        hairline: "solid",

        wave: "double",
        doubleWave: "double",

        threeD: "outset",
        shadow: "solid",

        custom: "solid"
    };

    return styles[style] || "solid";
}


/* =========================================================
   BORDER CONFIG
========================================================= */

function borderConfig(
    prefix
) {

    const styleMap = {

        coco: App.borderStyles.coco,
        other: App.borderStyles.other,
        isbn: App.borderStyles.isbn,
        address: App.borderStyles.address
    };

    const style =
        styleMap[prefix] || "solid";

    const width =
        prefix === "coco"
            ? value("borderWidth", 2)
            : prefix === "other"
                ? value("otherBorderWidth", 2)
                : prefix === "isbn"
                    ? value("isbnBorderWidth", 2)
                    : value("addressBorderWidth", 2);

    const color =
        prefix === "coco"
            ? value("borderColor", "#111827")
            : prefix === "other"
                ? value("otherBorderColor", "#111827")
                : prefix === "isbn"
                    ? value("isbnBorderColor", "#111827")
                    : value(
                        "addressBorderColor",
                        "#111827"
                    );

    const radius =
        prefix === "coco"
            ? value("borderRadius", 0)
            : prefix === "other"
                ? value(
                    "otherBorderRadius",
                    0
                )
                : prefix === "isbn"
                    ? value(
                        "isbnBorderRadius",
                        0
                    )
                    : value(
                        "addressBorderRadius",
                        0
                    );

    const opacity =
        prefix === "coco"
            ? value("borderOpacity", 100)
            : prefix === "other"
                ? value(
                    "otherBorderOpacity",
                    100
                )
                : prefix === "isbn"
                    ? value(
                        "isbnBorderOpacity",
                        100
                    )
                    : value(
                        "addressBorderOpacity",
                        100
                    );

    return {

        style,
        cssStyle:
            cssBorderStyle(style),

        width:
            safeNumber(width, 2),

        color,

        radius:
            safeNumber(radius, 0),

        opacity:
            clamp(
                safeNumber(opacity, 100),
                0,
                100
            )
    };
}


function applyBorderToElement(
    element,
    config,
    sides = {}
) {

    if (!element) {
        return;
    }

    const alpha =
        config.opacity / 100;

    const color =
        hexToRGBA(
            config.color,
            alpha
        );

    const width =
        `${config.width}px`;

    const style =
        config.cssStyle;

    const sideNames = [
        "Top",
        "Right",
        "Bottom",
        "Left"
    ];

    sideNames.forEach(side => {

        const enabled =
            sides[side] !== false;

        element.style[
            `border${side}`
        ] =
            enabled
                ? `${width} ${style} ${color}`
                : "none";
    });

    element.style.borderRadius =
        `${config.radius}px`;

    if (
        App.activeTool === "cocoBlue" &&
        App.borderStyles.coco === "shadow"
    ) {

        element.style.boxShadow =
            `6px 6px 0 ${color}`;

    } else {

        element.style.boxShadow =
            "none";
    }
}


function hexToRGBA(
    hex,
    alpha
) {

    if (!hex) {
        return `rgba(17,24,39,${alpha})`;
    }

    let h =
        hex.replace("#", "");

    if (h.length === 3) {

        h =
            h
                .split("")
                .map(x => x + x)
                .join("");
    }

    const r =
        parseInt(
            h.substring(0, 2),
            16
        );

    const g =
        parseInt(
            h.substring(2, 4),
            16
        );

    const b =
        parseInt(
            h.substring(4, 6),
            16
        );

    return `rgba(${r},${g},${b},${alpha})`;
}


/* =========================================================
   COCO BORDER
========================================================= */

function applyCocoBorder() {

    const label =
        $("previewLabel");

    if (!label) {
        return;
    }

    const config =
        borderConfig("coco");

    applyBorderToElement(
        label,
        config,
        {
            Top:
                checked(
                    "borderTopEnabled"
                ),

            Right:
                checked(
                    "borderRightEnabled"
                ),

            Bottom:
                checked(
                    "borderBottomEnabled"
                ),

            Left:
                checked(
                    "borderLeftEnabled"
                )
        }
    );

    if (
        App.borderStyles.coco ===
        "shadow"
    ) {

        label.style.boxShadow =
            `6px 6px 0 ${config.color}`;
    }
}


function removeCocoBorder() {

    const label =
        $("previewLabel");

    if (!label) {
        return;
    }

    label.style.border =
        "none";

    label.style.boxShadow =
        "none";
}


/* =========================================================
   OTHER BORDER
========================================================= */

function applyOtherBorder() {

    const label =
        $("otherPreviewLabel");

    if (!label) {
        return;
    }

    const config =
        borderConfig("other");

    applyBorderToElement(
        label,
        config,
        {
            Top:
                checked(
                    "otherBorderTop"
                ),

            Right:
                checked(
                    "otherBorderRight"
                ),

            Bottom:
                checked(
                    "otherBorderBottom"
                ),

            Left:
                checked(
                    "otherBorderLeft"
                )
        }
    );
}


function removeOtherBorder() {

    const label =
        $("otherPreviewLabel");

    if (!label) {
        return;
    }

    label.style.border =
        "none";

    label.style.boxShadow =
        "none";
}


/* =========================================================
   ISBN BORDER
========================================================= */

function applyISBNBorder() {

    const preview =
        $("barcodePreview");

    if (!preview) {
        return;
    }

    const config =
        borderConfig("isbn");

    applyBorderToElement(
        preview,
        config,
        {
            Top:
                checked(
                    "isbnBorderTop"
                ),

            Right:
                checked(
                    "isbnBorderRight"
                ),

            Bottom:
                checked(
                    "isbnBorderBottom"
                ),

            Left:
                checked(
                    "isbnBorderLeft"
                )
        }
    );
}


/* =========================================================
   ADDRESS BORDER
========================================================= */

function applyAddressBorder() {

    const label =
        $("addressPreviewLabel");

    if (!label) {
        return;
    }

    const config =
        borderConfig("address");

    applyBorderToElement(
        label,
        config,
        {
            Top:
                checked(
                    "addressBorderTop"
                ),

            Right:
                checked(
                    "addressBorderRight"
                ),

            Bottom:
                checked(
                    "addressBorderBottom"
                ),

            Left:
                checked(
                    "addressBorderLeft"
                )
        }
    );
}


/* =========================================================
   FONT SIZE PRESETS
========================================================= */

function connectFontPreset(
    presetId,
    inputId
) {

    const preset =
        $(presetId);

    const input =
        $(inputId);

    if (!preset || !input) {
        return;
    }

    preset.addEventListener(
        "change",
        () => {

            if (preset.value) {

                input.value =
                    preset.value;

                liveRefresh();

            }
        }
    );

    input.addEventListener(
        "input",
        () => {

            preset.value = "";

            liveRefresh();

        }
    );
}


function syncPresetInputs() {

    const pairs = [

        [
            "poFontSizePreset",
            "poFontSize"
        ],

        [
            "boxFontSizePreset",
            "boxFontSize"
        ],

        [
            "otherFontSizePreset",
            "otherFontSize"
        ],

        [
            "isbnFontSizePreset",
            "isbnFontSize"
        ],

        [
            "fromFontSizePreset",
            "fromFontSize"
        ],

        [
            "toFontSizePreset",
            "toFontSize"
        ],

        [
            "borderWidthPreset",
            "borderWidth"
        ],

        [
            "otherBorderWidthPreset",
            "otherBorderWidth"
        ],

        [
            "isbnBorderWidthPreset",
            "isbnBorderWidth"
        ],

        [
            "addressBorderWidthPreset",
            "addressBorderWidth"
        ]
    ];

    pairs.forEach(
        ([presetId, inputId]) => {

            const preset =
                $(presetId);

            const input =
                $(inputId);

            if (!preset || !input) {
                return;
            }

            const matching =
                Array.from(
                    preset.options
                )
                    .some(
                        option =>
                            String(
                                option.value
                            ) ===
                            String(
                                input.value
                            )
                    );

            preset.value =
                matching
                    ? input.value
                    : "";

        }
    );
}


function setupFontPresets() {

    const pairs = [

        [
            "poFontSizePreset",
            "poFontSize"
        ],

        [
            "boxFontSizePreset",
            "boxFontSize"
        ],

        [
            "otherFontSizePreset",
            "otherFontSize"
        ],

        [
            "isbnFontSizePreset",
            "isbnFontSize"
        ],

        [
            "fromFontSizePreset",
            "fromFontSize"
        ],

        [
            "toFontSizePreset",
            "toFontSize"
        ],

        [
            "borderWidthPreset",
            "borderWidth"
        ],

        [
            "otherBorderWidthPreset",
            "otherBorderWidth"
        ],

        [
            "isbnBorderWidthPreset",
            "isbnBorderWidth"
        ],

        [
            "addressBorderWidthPreset",
            "addressBorderWidth"
        ]
    ];

    pairs.forEach(
        pair =>
            connectFontPreset(
                pair[0],
                pair[1]
            )
    );

    syncPresetInputs();
}


/* =========================================================
   TYPOGRAPHY
========================================================= */

function applyTextStyle(
    element,
    config
) {

    if (!element) {
        return;
    }

    if (!config) {
        return;
    }

    element.style.fontFamily =
        config.fontFamily;

    element.style.fontSize =
        `${config.fontSize}px`;

    element.style.textAlign =
        config.alignment;

    element.style.lineHeight =
        config.lineHeight;

    element.style.fontWeight =
        config.bold
            ? "800"
            : "400";

    element.style.fontStyle =
        config.italic
            ? "italic"
            : "normal";

    const decorations = [];

    if (config.underline) {
        decorations.push(
            "underline"
        );
    }

    if (config.strike) {
        decorations.push(
            "line-through"
        );
    }

    element.style.textDecoration =
        decorations.length
            ? decorations.join(" ")
            : "none";
}


function textConfig(
    prefix
) {

    const config = {

        fontFamily:
            value(
                `${prefix}FontFamily`,
                "Arial"
            ),

        fontSize:
            safeNumber(
                value(
                    `${prefix}FontSize`,
                    16
                ),
                16
            ),

        alignment:
            String(
                value(
                    `${prefix}Alignment`,
                    "center"
                )
            ).toLowerCase(),

        lineHeight:
            safeNumber(
                value(
                    `${prefix}LineHeight`,
                    1
                ),
                1
            ),

        bold:
            checked(
                `${prefix}BoldCheck`
            ) ||
            checked(
                `${prefix}Bold`
            ),

        italic:
            checked(
                `${prefix}ItalicCheck`
            ) ||
            checked(
                `${prefix}Italic`
            ),

        underline:
            checked(
                `${prefix}UnderlineCheck`
            ) ||
            checked(
                `${prefix}Underline`
            ),

        strike:
            checked(
                `${prefix}StrikeCheck`
            ) ||
            checked(
                `${prefix}Strike`
            )
    };

    return config;
}


/* =========================================================
   COCO PREVIEW
========================================================= */

function getPOValues() {

    const result = [];

    for (
        let i = 1;
        i <= 40;
        i++
    ) {

        const el =
            $(`cocoPO${i}`);

        if (
            el &&
            el.value.trim()
        ) {

            result.push(
                el.value.trim()
            );
        }
    }

    return result;
}


function updateCocoPreview() {

    const previewPO =
        $("previewPO");

    const previewBox =
        $("previewBox");

    if (!previewPO || !previewBox) {
        return;
    }

    const values =
        getPOValues();

    previewPO.textContent =
        values[0] ||
        "ABC123";

    const box =
        safeNumber(
            value(
                "startBoxNumber",
                1
            ),
            1
        );

    /*
      IMPORTANT:
      PO value is shown as actual value only.
      We do NOT write "PO NUMBER".
    */

    previewBox.textContent =
        `BOX NO. ${box}`;

    applyTextStyle(
        previewPO,
        textConfig("po")
    );

    applyTextStyle(
        previewBox,
        textConfig("box")
    );

    applyCocoBorder();

    updatePagePreview(
        "previewPage",
        "pageSize",
        "orientation"
    );

    const badge =
        $("previewPageSize");

    if (badge) {

        badge.textContent =
            getPageSizeLabel(
                value(
                    "pageSize",
                    "4x6"
                )
            );
    }
}


/* =========================================================
   OTHER PREVIEW
========================================================= */

function updateOtherPreview() {

    const preview =
        $("otherPreviewLabel");

    if (!preview) {
        return;
    }

    let text = "ABC123";

    const first =
        $$(
            "#otherIndividualPOGrid input"
        )[0];

    if (
        first &&
        first.value.trim()
    ) {

        text =
            first.value.trim();
    }

    preview.textContent =
        text;

    applyTextStyle(
        preview,
        textConfig("other")
    );

    applyOtherBorder();

    updatePagePreview(
        "otherPreviewPage",
        "pageSize",
        "orientation"
    );
}


/* =========================================================
   PAGE PREVIEW
========================================================= */

function getPageDimensions(
    pageSize,
    orientation
) {

    let width = 420;
    let height = 594;

    const sizes = {

        "4x6": [
            384,
            576
        ],

        "70x35": [
            397,
            198
        ],

        "a4": [
            420,
            594
        ],

        "a5": [
            420,
            594
        ],

        "letter": [
            459,
            594
        ],

        "legal": [
            459,
            720
        ]
    };

    if (sizes[pageSize]) {

        [
            width,
            height
        ] =
            sizes[pageSize];

    }

    if (
        orientation ===
        "landscape"
    ) {

        [
            width,
            height
        ] =
            [
                height,
                width
            ];
    }

    return {
        width,
        height
    };
}


function updatePagePreview(
    pageId,
    pageSizeId,
    orientationId
) {

    const page =
        $(pageId);

    if (!page) {
        return;
    }

    let pageSize =
        value(
            pageSizeId,
            "4x6"
        );

    let orientation =
        value(
            orientationId,
            "portrait"
        );

    if (pageSize === "custom") {

        let width =
            safeNumber(
                value(
                    "customWidth",
                    70
                ),
                70
            );

        let height =
            safeNumber(
                value(
                    "customHeight",
                    35
                ),
                35
            );

        const scale = 4.5;

        if (
            orientation ===
            "landscape"
        ) {

            [
                width,
                height
            ] =
                [
                    height,
                    width
                ];
        }

        page.style.width =
            `${clamp(
                width * scale,
                180,
                850
            )}px`;

        page.style.minHeight =
            `${clamp(
                height * scale,
                120,
                1000
            )}px`;

        return;
    }

    const dimensions =
        getPageDimensions(
            pageSize,
            orientation
        );

    page.style.width =
        `${dimensions.width}px`;

    page.style.minHeight =
        `${dimensions.height}px`;
}


function getPageSizeLabel(
    value
) {

    const labels = {

        "4x6":
            "4 × 6 Inches",

        "70x35":
            "70 × 35 mm",

        "a4":
            "A4",

        "a5":
            "A5",

        "letter":
            "Letter",

        "legal":
            "Legal",

        "custom":
            "Custom"
    };

    return labels[value] || value;
}


/* =========================================================
   LABELS PER PAGE
========================================================= */

function setupLabelsPerPage() {

    const input =
        $("labelsPerPage");

    if (!input) {
        return;
    }

    input.addEventListener(
        "change",
        () => {

            updatePreviewGrid();

            saveHistory();

        }
    );
}


function updatePreviewGrid() {

    const page =
        $("previewPage");

    if (!page) {
        return;
    }

    const count =
        safeNumber(
            value(
                "labelsPerPage",
                2
            ),
            2
        );

    const label =
        $("previewLabel");

    if (!label) {
        return;
    }

    if (count <= 1) {

        page.style.display =
            "flex";

        label.style.width =
            "90%";

        label.style.minHeight =
            "180px";

        return;
    }

    const columns =
        count === 2
            ? 1
            : count <= 4
                ? 2
                : count <= 6
                    ? 2
                    : 3;

    page.style.display =
        "grid";

    page.style.gridTemplateColumns =
        `repeat(${columns}, minmax(0, 1fr))`;

    page.style.alignContent =
        "center";

    page.style.gap =
        "8px";

    label.style.width =
        "100%";

    label.style.minHeight =
        count >= 8
            ? "75px"
            : "120px";
}


/* =========================================================
   CUSTOM PAGE SIZE
========================================================= */

function setupCustomPageSizes() {

    const pairs = [

        [
            "pageSize",
            "customSizePanel"
        ],

        [
            "isbnPageSize",
            "isbnCustomSizePanel"
        ],

        [
            "addressPageSize",
            "addressCustomSizePanel"
        ]
    ];

    pairs.forEach(
        ([selectId, panelId]) => {

            const select =
                $(selectId);

            const panel =
                $(panelId);

            if (!select || !panel) {
                return;
            }

            const update = () => {

                panel.classList.toggle(
                    "hidden",
                    select.value !==
                    "custom"
                );

                liveRefresh();
            };

            select.addEventListener(
                "change",
                update
            );

            update();
        }
    );
}


/* =========================================================
   EXCEL
========================================================= */

function parseCSV(text) {

    const rows = [];

    let row = [];
    let current = "";
    let quoted = false;

    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];

        if (
            char === '"' &&
            quoted &&
            next === '"'
        ) {

            current += '"';

            i++;

            continue;
        }

        if (char === '"') {

            quoted =
                !quoted;

            continue;
        }

        if (
            char === "," &&
            !quoted
        ) {

            row.push(current);

            current = "";

            continue;
        }

        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !quoted
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;
            }

            row.push(current);

            rows.push(row);

            row = [];

            current = "";

            continue;
        }

        current += char;
    }

    if (
        current.length ||
        row.length
    ) {

        row.push(current);

        rows.push(row);
    }

    return rows;
}


async function readExcelFile(file) {

    if (!file) {
        return [];
    }

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    if (
        extension === "csv"
    ) {

        const text =
            await file.text();

        return parseCSV(text);
    }

    if (
        typeof XLSX ===
        "undefined"
    ) {

        throw new Error(
            "Excel library is not loaded."
        );
    }

    const buffer =
        await file.arrayBuffer();

    const workbook =
        XLSX.read(
            buffer,
            {
                type: "array"
            }
        );

    const sheetName =
        workbook.SheetNames[0];

    const sheet =
        workbook.Sheets[
            sheetName
        ];

    return XLSX.utils.sheet_to_json(
        sheet,
        {
            header: 1,
            defval: ""
        }
    );
}


/*
  User requirement:
  First row is Header and MUST be ignored.
*/

function excelDataWithoutHeader(
    rows
) {

    if (
        !Array.isArray(rows) ||
        rows.length <= 1
    ) {

        return [];
    }

    return rows.slice(1);
}


function renderExcelPreview(
    containerId,
    rows
) {

    const container =
        $(containerId);

    if (!container) {
        return;
    }

    if (!rows.length) {

        container.innerHTML =
            "<p style='padding:15px'>No data found.</p>";

        return;
    }

    const header =
        rows[0] || [];

    const body =
        rows.slice(1, 21);

    let html =
        "<table><thead><tr>";

    header.forEach(
        cell => {

            html +=
                `<th>${escapeHTML(
                    cell
                )}</th>`;
        }
    );

    html +=
        "</tr></thead><tbody>";

    body.forEach(
        row => {

            html += "<tr>";

            header.forEach(
                (_, index) => {

                    html +=
                        `<td>${escapeHTML(
                            row[index] ?? ""
                        )}</td>`;
                }
            );

            html += "</tr>";
        }
    );

    html +=
        "</tbody></table>";

    container.innerHTML =
        html;
}


async function handleExcel(
    inputId,
    previewId,
    nameId,
    targetInputPrefix
) {

    const input =
        $(inputId);

    if (!input || !input.files[0]) {
        return;
    }

    const file =
        input.files[0];

    const name =
        $(nameId);

    if (name) {
        name.textContent =
            file.name;
    }

    try {

        const rows =
            await readExcelFile(file);

        renderExcelPreview(
            previewId,
            rows
        );

        /*
          HEADER IS ROW 1.
          It is deliberately NOT imported
          into PO values.
        */

        const data =
            excelDataWithoutHeader(
                rows
            );

        if (
            targetInputPrefix ===
            "cocoPO"
        ) {

            const inputs =
                $$(
                    "#individualPOGrid input"
                );

            inputs.forEach(
                (inputEl, index) => {

                    const row =
                        data[index];

                    if (
                        Array.isArray(row)
                    ) {

                        inputEl.value =
                            String(
                                row[0] ?? ""
                            ).trim();
                    }

                }
            );
        }

        if (
            targetInputPrefix ===
            "otherPO"
        ) {

            const inputEl =
                $("otherMultiplePO");

            if (inputEl) {

                inputEl.value =
                    data
                        .map(
                            row =>
                                Array.isArray(row)
                                    ? row[0]
                                    : ""
                        )
                        .filter(
                            x =>
                                String(x)
                                    .trim()
                                    .length
                        )
                        .join("\n");
            }
        }

        liveRefresh();

        showToast(
            `Excel loaded. Header row ignored.`,
            "success"
        );

        saveHistory();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Could not read Excel file.",
            "error",
            4000
        );
    }
}


/* =========================================================
   QR CODE
========================================================= */

function generateQRCode(
    containerId,
    text
) {

    const container =
        $(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!text) {

        container.innerHTML =
            "<span style='color:#94a3b8;font-size:12px'>No QR data</span>";

        return;
    }

    if (
        typeof QRCode ===
        "undefined"
    ) {

        container.innerHTML =
            "<span style='color:#dc2626;font-size:12px'>QR library not loaded</span>";

        return;
    }

    const canvas =
        document.createElement(
            "canvas"
        );

    container.appendChild(
        canvas
    );

    try {

        QRCode.toCanvas(
            canvas,
            text,
            {
                width: 160,
                margin: 2,
                errorCorrectionLevel: "M"
            },
            error => {

                if (error) {

                    console.error(
                        "QR Error:",
                        error
                    );

                    container.innerHTML =
                        "<span style='color:#dc2626'>QR generation failed</span>";
                }

            }
        );

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<span style='color:#dc2626'>QR generation failed</span>";
    }
}


function updateAddressQR() {

    const address =
        [
            value(
                "addressFrom"
            ),

            value(
                "addressTo"
            )
        ]
            .filter(Boolean)
            .join("\n");

    generateQRCode(
        "addressQRPreview",
        address
    );


    const email =
        value(
            "emailAddress",
            ""
        );

    if (
        email
    ) {

        generateQRCode(
            "emailQRPreview",
            `mailto:${email}`
        );

    } else {

        const container =
            $("emailQRPreview");

        if (container) {

            container.innerHTML =
                "<span style='color:#94a3b8;font-size:12px'>Enter email to generate Email QR</span>";
        }
    }
}


/* =========================================================
   BARCODE
========================================================= */

function updateBarcode() {

    const svg =
        $("isbnBarcodeSvg");

    const text =
        $("isbnBarcodeText");

    if (!svg || !text) {
        return;
    }

    const isbn =
        value(
            "isbnValue",
            ""
        ).trim();

    text.textContent =
        isbn ||
        "Enter ISBN to preview";

    if (!isbn) {

        svg.innerHTML = "";

        return;
    }

    if (
        typeof JsBarcode ===
        "undefined"
    ) {

        svg.innerHTML = "";

        text.textContent =
            "Barcode library not loaded";

        return;
    }

    try {

        JsBarcode(
            svg,
            isbn,
            {
                format: "auto",
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

        console.error(error);

        svg.innerHTML = "";

        text.textContent =
            "Invalid barcode value";
    }
}


/* =========================================================
   PDF LIBRARY CHECK
========================================================= */

function getPDFLibrary() {

    /*
      jsPDF CDN exposes:
      window.jspdf.jsPDF

      Older builds sometimes expose:
      window.jsPDF
    */

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


function ensurePDFLibrary() {

    const jsPDF =
        getPDFLibrary();

    if (!jsPDF) {

        showToast(
            "PDF library is not loaded. Check internet/CDN connection and reload the page.",
            "error",
            5000
        );

        return null;
    }

    return jsPDF;
}


/* =========================================================
   PDF PAGE SIZE
========================================================= */

function getPDFPageConfig(
    pageSize,
    orientation,
    customWidth,
    customHeight
) {

    let format =
        "a4";

    let unit =
        "mm";

    let width =
        210;

    let height =
        297;

    if (
        pageSize ===
        "4x6"
    ) {

        width = 101.6;
        height = 152.4;

    } else if (
        pageSize ===
        "70x35"
    ) {

        width = 70;
        height = 35;

    } else if (
        pageSize ===
        "a5"
    ) {

        width = 148;
        height = 210;

    } else if (
        pageSize ===
        "letter"
    ) {

        width = 215.9;
        height = 279.4;

    } else if (
        pageSize ===
        "legal"
    ) {

        width = 215.9;
        height = 355.6;

    } else if (
        pageSize ===
        "custom"
    ) {

        width =
            safeNumber(
                customWidth,
                70
            );

        height =
            safeNumber(
                customHeight,
                35
            );
    }

    if (
        orientation ===
        "landscape"
    ) {

        [
            width,
            height
        ] =
            [
                height,
                width
            ];
    }

    return {
        orientation:
            width > height
                ? "landscape"
                : "portrait",

        unit,

        format:
            [
                width,
                height
            ]
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
    config
) {

    if (!config) {
        return;
    }

    const color =
        hexToRGB(
            config.color
        );

    doc.setDrawColor(
        color[0],
        color[1],
        color[2]
    );

    doc.setLineWidth(
        Math.max(
            0.1,
            config.width
        )
    );

    const style =
        config.style;

    if (
        style ===
        "dashed"
    ) {

        doc.setLineDashPattern(
            [3, 2],
            0
        );

    } else if (
        style ===
        "dotted"
    ) {

        doc.setLineDashPattern(
            [0.8, 1.8],
            0
        );

    } else {

        doc.setLineDashPattern(
            [],
            0
        );
    }

    if (
        style ===
        "double" ||
        style ===
        "thinDouble" ||
        style ===
        "thickDouble"
    ) {

        doc.rect(
            x,
            y,
            width,
            height
        );

        const gap =
            style ===
            "thickDouble"
                ? 2.5
                : 1.5;

        doc.rect(
            x + gap,
            y + gap,
            width - gap * 2,
            height - gap * 2
        );

    } else {

        doc.rect(
            x,
            y,
            width,
            height,
            "S"
        );
    }

    doc.setLineDashPattern(
        [],
        0
    );
}


function hexToRGB(hex) {

    if (!hex) {
        return [
            17,
            24,
            39
        ];
    }

    let h =
        hex.replace(
            "#",
            ""
        );

    if (h.length === 3) {

        h =
            h
                .split("")
                .map(
                    x => x + x
                )
                .join("");
    }

    return [

        parseInt(
            h.substring(0, 2),
            16
        ),

        parseInt(
            h.substring(2, 4),
            16
        ),

        parseInt(
            h.substring(4, 6),
            16
        )
    ];
}


/* =========================================================
   PDF FONT
========================================================= */

function setPDFFont(
    doc,
    family,
    bold = false,
    italic = false
) {

    const supported = {

        "Arial":
            "helvetica",

        "Calibri":
            "helvetica",

        "Cambria":
            "times",

        "Times New Roman":
            "times",

        "Georgia":
            "times",

        "Verdana":
            "helvetica",

        "Tahoma":
            "helvetica",

        "Trebuchet MS":
            "helvetica",

        "Courier New":
            "courier",

        "Impact":
            "helvetica",

        "Garamond":
            "times",

        "Book Antiqua":
            "times"
    };

    const font =
        supported[family] ||
        "helvetica";

    let style = "normal";

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

    doc.setFont(
        font,
        style
    );
}


/* =========================================================
   PDF TEXT
========================================================= */

function addPDFText(
    doc,
    text,
    x,
    y,
    pageWidth,
    config
) {

    if (!text) {
        return;
    }

    setPDFFont(
        doc,
        config.fontFamily,
        config.bold,
        config.italic
    );

    doc.setFontSize(
        config.fontSize
    );

    const align =
        config.alignment === "left"
            ? "left"
            : config.alignment === "right"
                ? "right"
                : "center";

    let textX = x;

    if (align === "center") {
        textX =
            x +
            pageWidth / 2;

    } else if (
        align === "right"
    ) {

        textX =
            x +
            pageWidth;
    }

    let finalText =
        String(text);

    if (
        config.uppercase
    ) {

        finalText =
            finalText.toUpperCase();
    }

    doc.text(
        finalText,
        textX,
        y,
        {
            align
        }
    );
}


/* =========================================================
   GENERATE COCO PDF
========================================================= */

function generateCocoPDF() {

    const jsPDF =
        ensurePDFLibrary();

    if (!jsPDF) {
        return;
    }

    try {

        const pageConfig =
            getPDFPageConfig(
                value(
                    "pageSize",
                    "4x6"
                ),
                value(
                    "orientation",
                    "portrait"
                ),
                value(
                    "customWidth",
                    70
                ),
                value(
                    "customHeight",
                    35
                )
            );

        const doc =
            new jsPDF({
                orientation:
                    pageConfig.orientation,

                unit:
                    "mm",

                format:
                    pageConfig.format
            });

        const pageWidth =
            pageConfig.format[0];

        const pageHeight =
            pageConfig.format[1];

        const labelsPerPage =
            safeNumber(
                value(
                    "labelsPerPage",
                    2
                ),
                2
            );

        const poValues =
            getPOValues();

        const values =
            poValues.length
                ? poValues
                : ["ABC123"];

        const rows =
            labelsPerPage <= 1
                ? 1
                : labelsPerPage <= 4
                    ? 2
                    : Math.ceil(
                        labelsPerPage / 2
                    );

        const cols =
            labelsPerPage <= 1
                ? 1
                : 2;

        const margin = 8;

        const gap = 4;

        const cellWidth =
            (
                pageWidth -
                margin * 2 -
                gap * (cols - 1)
            ) / cols;

        const cellHeight =
            (
                pageHeight -
                margin * 2 -
                gap * (rows - 1)
            ) / rows;

        const poConfig =
            textConfig("po");

        const boxConfig =
            textConfig("box");

        const border =
            borderConfig("coco");

        let labelIndex = 0;

        values.forEach(
            (poValue, index) => {

                if (
                    labelIndex > 0 &&
                    labelIndex %
                    labelsPerPage === 0
                ) {

                    doc.addPage();
                }

                const position =
                    labelIndex %
                    labelsPerPage;

                const row =
                    Math.floor(
                        position / cols
                    );

                const col =
                    position % cols;

                const x =
                    margin +
                    col *
                    (
                        cellWidth +
                        gap
                    );

                const y =
                    margin +
                    row *
                    (
                        cellHeight +
                        gap
                    );

                drawPDFBorder(
                    doc,
                    x,
                    y,
                    cellWidth,
                    cellHeight,
                    border
                );

                const centerX =
                    x +
                    cellWidth / 2;

                setPDFFont(
                    doc,
                    poConfig.fontFamily,
                    poConfig.bold,
                    poConfig.italic
                );

                doc.setFontSize(
                    poConfig.fontSize
                );

                doc.text(
                    String(
                        poValue
                    ),
                    centerX,
                    y +
                    cellHeight * 0.42,
                    {
                        align: "center"
                    }
                );

                if (
                    checked(
                        "boxNumberCheck"
                    )
                ) {

                    setPDFFont(
                        doc,
                        boxConfig.fontFamily,
                        boxConfig.bold,
                        boxConfig.italic
                    );

                    doc.setFontSize(
                        boxConfig.fontSize
                    );

                    const boxNumber =
                        safeNumber(
                            value(
                                "startBoxNumber",
                                1
                            ),
                            1
                        ) +
                        index;

                    doc.text(
                        `BOX NO. ${boxNumber}`,
                        centerX,
                        y +
                        cellHeight * 0.62,
                        {
                            align:
                                "center"
                        }
                    );
                }

                labelIndex++;
            }
        );

        doc.save(
            "books-label-studio-coco-blue.pdf"
        );

        showToast(
            "Coco Blue PDF generated",
            "success"
        );

    } catch (error) {

        console.error(
            "Coco PDF error:",
            error
        );

        showToast(
            `PDF generation failed: ${error.message}`,
            "error",
            5000
        );
    }
}


/* =========================================================
   GENERATE OTHER PO PDF
========================================================= */

function getOtherPOValues() {

    const result = [];

    const multiple =
        value(
            "otherMultiplePO",
            ""
        );

    if (multiple.trim()) {

        return multiple
            .split(/\r?\n/)
            .map(
                x => x.trim()
            )
            .filter(Boolean);
    }

    $$(
        "#otherIndividualPOGrid input"
    )
        .forEach(
            input => {

                if (
                    input.value.trim()
                ) {

                    result.push(
                        input.value.trim()
                    );
                }
            }
        );

    return result;
}


function generateOtherPDF() {

    const jsPDF =
        ensurePDFLibrary();

    if (!jsPDF) {
        return;
    }

    try {

        const pageConfig =
            getPDFPageConfig(
                value(
                    "pageSize",
                    "4x6"
                ),
                value(
                    "orientation",
                    "portrait"
                ),
                70,
                35
            );

        const doc =
            new jsPDF({
                orientation:
                    pageConfig.orientation,

                unit:
                    "mm",

                format:
                    pageConfig.format
            });

        const pageWidth =
            pageConfig.format[0];

        const pageHeight =
            pageConfig.format[1];

        const values =
            getOtherPOValues();

        const list =
            values.length
                ? values
                : ["ABC123"];

        const margin = 10;

        const width =
            pageWidth -
            margin * 2;

        const height = 40;

        const font =
            textConfig("other");

        const border =
            borderConfig("other");

        list.forEach(
            (po, index) => {

                if (
                    index > 0 &&
                    index % 5 === 0
                ) {

                    doc.addPage();
                }

                const row =
                    index % 5;

                const y =
                    margin +
                    row *
                    (
                        height + 5
                    );

                drawPDFBorder(
                    doc,
                    margin,
                    y,
                    width,
                    height,
                    border
                );

                setPDFFont(
                    doc,
                    font.fontFamily,
                    font.bold,
                    font.italic
                );

                doc.setFontSize(
                    font.fontSize
                );

                doc.text(
                    po,
                    pageWidth / 2,
                    y + 24,
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
            "Other PO PDF generated",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            `PDF generation failed: ${error.message}`,
            "error",
            5000
        );
    }
}


/* =========================================================
   GENERATE ISBN PDF
========================================================= */

function generateISBNPDF() {

    const jsPDF =
        ensurePDFLibrary();

    if (!jsPDF) {
        return;
    }

    try {

        const pageConfig =
            getPDFPageConfig(
                value(
                    "isbnPageSize",
                    "4x6"
                ),
                value(
                    "isbnOrientation",
                    "portrait"
                ),
                value(
                    "isbnCustomWidth",
                    70
                ),
                value(
                    "isbnCustomHeight",
                    35
                )
            );

        const doc =
            new jsPDF({
                orientation:
                    pageConfig.orientation,

                unit:
                    "mm",

                format:
                    pageConfig.format
            });

        const pageWidth =
            pageConfig.format[0];

        const pageHeight =
            pageConfig.format[1];

        const isbn =
            value(
                "isbnValue",
                "ISBN"
            );

        const title =
            value(
                "isbnBookTitle",
                ""
            );

        const edition =
            value(
                "isbnEdition",
                ""
            );

        const font =
            textConfig("isbn");

        const border =
            borderConfig("isbn");

        drawPDFBorder(
            doc,
            8,
            8,
            pageWidth - 16,
            pageHeight - 16,
            border
        );

        setPDFFont(
            doc,
            font.fontFamily,
            font.bold,
            font.italic
        );

        doc.setFontSize(
            font.fontSize
        );

        doc.text(
            title || "Book",
            pageWidth / 2,
            25,
            {
                align: "center"
            }
        );

        doc.setFontSize(
            Math.max(
                10,
                font.fontSize
            )
        );

        doc.text(
            edition || "",
            pageWidth / 2,
            34,
            {
                align: "center"
            }
        );

        /*
          Barcode SVG cannot reliably be inserted into
          jsPDF without additional SVG processing.
          Therefore we create a simple barcode-like
          representation when JsBarcode is available.
        */

        let x =
            pageWidth / 2 -
            35;

        const y = 55;

        const clean =
            isbn.replace(
                /\D/g,
                ""
            ) || "123456789";

        for (
            let i = 0;
            i < clean.length;
            i++
        ) {

            const digit =
                Number(
                    clean[i]
                );

            const barWidth =
                digit % 3 === 0
                    ? 1.2
                    : 0.55;

            const barHeight =
                38;

            doc.setFillColor(
                17,
                24,
                39
            );

            doc.rect(
                x,
                y,
                barWidth,
                barHeight,
                "F"
            );

            x +=
                barWidth +
                0.7;
        }

        doc.setFontSize(10);

        doc.text(
            isbn,
            pageWidth / 2,
            y + 46,
            {
                align: "center"
            }
        );

        doc.save(
            "books-label-studio-isbn.pdf"
        );

        showToast(
            "ISBN PDF generated",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            `PDF generation failed: ${error.message}`,
            "error",
            5000
        );
    }
}


/* =========================================================
   GENERATE ADDRESS PDF
========================================================= */

function generateAddressPDF() {

    const jsPDF =
        ensurePDFLibrary();

    if (!jsPDF) {
        return;
    }

    try {

        const pageConfig =
            getPDFPageConfig(
                value(
                    "addressPageSize",
                    "4x6"
                ),
                value(
                    "addressOrientation",
                    "portrait"
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
            new jsPDF({
                orientation:
                    pageConfig.orientation,

                unit:
                    "mm",

                format:
                    pageConfig.format
            });

        const pageWidth =
            pageConfig.format[0];

        const pageHeight =
            pageConfig.format[1];

        const border =
            borderConfig(
                "address"
            );

        const from =
            value(
                "addressFrom",
                ""
            );

        const to =
            value(
                "addressTo",
                ""
            );

        drawPDFBorder(
            doc,
            8,
            8,
            pageWidth - 16,
            pageHeight - 16,
            border
        );

        const fromConfig = {
            fontFamily:
                value(
                    "fromFontFamily",
                    "Arial"
                ),

            fontSize:
                safeNumber(
                    value(
                        "fromFontSize",
                        14
                    ),
                    14
                ),

            alignment:
                value(
                    "fromAlignment",
                    "center"
                ).toLowerCase(),

            lineHeight:
                safeNumber(
                    value(
                        "fromLineHeight",
                        1
                    ),
                    1
                ),

            bold:
                checked(
                    "fromBold"
                ),

            italic:
                checked(
                    "fromItalic"
                ),

            underline:
                checked(
                    "fromUnderline"
                ),

            strike:
                checked(
                    "fromStrike"
                )
        };

        const toConfig = {
            fontFamily:
                value(
                    "toFontFamily",
                    "Arial"
                ),

            fontSize:
                safeNumber(
                    value(
                        "toFontSize",
                        14
                    ),
                    14
                ),

            alignment:
                value(
                    "toAlignment",
                    "center"
                ).toLowerCase(),

            lineHeight:
                safeNumber(
                    value(
                        "toLineHeight",
                        1
                    ),
                    1
                ),

            bold:
                checked(
                    "toBold"
                ),

            italic:
                checked(
                    "toItalic"
                ),

            underline:
                checked(
                    "toUnderline"
                ),

            strike:
                checked(
                    "toStrike"
                )
        };

        setPDFFont(
            doc,
            fromConfig.fontFamily,
            fromConfig.bold,
            fromConfig.italic
        );

        doc.setFontSize(
            fromConfig.fontSize
        );

        doc.text(
            "FROM",
            pageWidth / 2,
            25,
            {
                align: "center"
            }
        );

        const fromLines =
            doc.splitTextToSize(
                from || "From Address",
                pageWidth - 30
            );

        doc.text(
            fromLines,
            pageWidth / 2,
            34,
            {
                align: "center"
            }
        );

        setPDFFont(
            doc,
            toConfig.fontFamily,
            toConfig.bold,
            toConfig.italic
        );

        doc.setFontSize(
            toConfig.fontSize
        );

        doc.text(
            "TO",
            pageWidth / 2,
            pageHeight / 2,
            {
                align: "center"
            }
        );

        const toLines =
            doc.splitTextToSize(
                to || "To Address",
                pageWidth - 30
            );

        doc.text(
            toLines,
            pageWidth / 2,
            pageHeight / 2 + 9,
            {
                align: "center"
            }
        );

        doc.save(
            "books-label-studio-address.pdf"
        );

        showToast(
            "Address PDF generated",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            `PDF generation failed: ${error.message}`,
            "error",
            5000
        );
    }
}


/* =========================================================
   GENERATE CURRENT PDF
========================================================= */

function generateCurrentPDF() {

    switch (App.activeTool) {

        case "cocoBlue":
            generateCocoPDF();
            break;

        case "otherPO":
            generateOtherPDF();
            break;

        case "isbn":
            generateISBNPDF();
            break;

        case "address":
            generateAddressPDF();
            break;

        default:

            showToast(
                "Select a module first",
                "warning"
            );
    }
}


/* =========================================================
   LIVE REFRESH
========================================================= */

function liveRefresh() {

    updateCocoPreview();

    updateOtherPreview();

    updateBarcode();

    updateAddressQR();

    updateAddressPreview();

    updatePreviewGrid();

    applyCocoBorder();

    applyOtherBorder();

    applyISBNBorder();

    applyAddressBorder();

    updateCustomPagePanels();

    flashPreview();
}


function flashPreview() {

    $$(".preview-label, .preview-page, .barcode-preview")
        .forEach(
            element => {

                element.classList.remove(
                    "live-updated"
                );

                void element.offsetWidth;

                element.classList.add(
                    "live-updated"
                );
            }
        );
}


/* =========================================================
   ADDRESS PREVIEW
========================================================= */

function updateAddressPreview() {

    const fromPreview =
        $("addressPreviewFrom");

    const toPreview =
        $("addressPreviewTo");

    if (
        fromPreview
    ) {

        fromPreview.textContent =
            value(
                "addressFrom",
                "FROM ADDRESS"
            ) ||
            "FROM ADDRESS";

        applyTextStyle(
            fromPreview,
            {
                fontFamily:
                    value(
                        "fromFontFamily",
                        "Arial"
                    ),

                fontSize:
                    safeNumber(
                        value(
                            "fromFontSize",
                            14
                        ),
                        14
                    ),

                alignment:
                    value(
                        "fromAlignment",
                        "center"
                    ).toLowerCase(),

                lineHeight:
                    safeNumber(
                        value(
                            "fromLineHeight",
                            1
                        ),
                        1
                    ),

                bold:
                    checked(
                        "fromBold"
                    ),

                italic:
                    checked(
                        "fromItalic"
                    ),

                underline:
                    checked(
                        "fromUnderline"
                    ),

                strike:
                    checked(
                        "fromStrike"
                    )
            }
        );
    }


    if (
        toPreview
    ) {

        toPreview.textContent =
            value(
                "addressTo",
                "TO ADDRESS"
            ) ||
            "TO ADDRESS";

        applyTextStyle(
            toPreview,
            {
                fontFamily:
                    value(
                        "toFontFamily",
                        "Arial"
                    ),

                fontSize:
                    safeNumber(
                        value(
                            "toFontSize",
                            14
                        ),
                        14
                    ),

                alignment:
                    value(
                        "toAlignment",
                        "center"
                    ).toLowerCase(),

                lineHeight:
                    safeNumber(
                        value(
                            "toLineHeight",
                            1
                        ),
                        1
                    ),

                bold:
                    checked(
                        "toBold"
                    ),

                italic:
                    checked(
                        "toItalic"
                    ),

                underline:
                    checked(
                        "toUnderline"
                    ),

                strike:
                    checked(
                        "toStrike"
                    )
            }
        );
    }

    updatePagePreview(
        "addressPreviewPage",
        "addressPageSize",
        "addressOrientation"
    );

    applyAddressBorder();
}


/* =========================================================
   CUSTOM PANEL REFRESH
========================================================= */

function updateCustomPagePanels() {

    const pairs = [

        [
            "pageSize",
            "customSizePanel"
        ],

        [
            "isbnPageSize",
            "isbnCustomSizePanel"
        ],

        [
            "addressPageSize",
            "addressCustomSizePanel"
        ]
    ];

    pairs.forEach(
        ([selectId, panelId]) => {

            const select =
                $(selectId);

            const panel =
                $(panelId);

            if (!select || !panel) {
                return;
            }

            panel.classList.toggle(
                "hidden",
                select.value !==
                "custom"
            );
        }
    );
}


/* =========================================================
   CONNECT LIVE INPUTS
========================================================= */

function setupLiveInputs() {

    $$(
        "input:not([type='file']), select, textarea"
    )
        .forEach(
            element => {

                element.addEventListener(
                    "input",
                    () => {

                        liveRefresh();
                    }
                );

                element.addEventListener(
                    "change",
                    () => {

                        liveRefresh();

                        saveHistory();
                    }
                );
            }
        );
}


/* =========================================================
   BORDER BUTTONS
========================================================= */

function setupBorderActions() {

    const actions = [

        [
            "applyBorderButton",
            () => {

                applyCocoBorder();

                showToast(
                    "Coco Blue border applied",
                    "success"
                );

                saveHistory();
            }
        ],

        [
            "clearBorderButton",
            () => {

                removeCocoBorder();

                showToast(
                    "Coco Blue border removed",
                    "error"
                );

                saveHistory();
            }
        ],

        [
            "otherApplyBorderButton",
            () => {

                applyOtherBorder();

                showToast(
                    "Other PO border applied",
                    "success"
                );

                saveHistory();
            }
        ],

        [
            "otherClearBorderButton",
            () => {

                removeOtherBorder();

                showToast(
                    "Other PO border removed",
                    "error"
                );

                saveHistory();
            }
        ],

        [
            "isbnGenerateButton",
            generateISBNPDF
        ],

        [
            "addressApplyBorderButton",
            () => {

                applyAddressBorder();

                showToast(
                    "Address border applied",
                    "success"
                );

                saveHistory();
            }
        ],

        [
            "addressClearBorderButton",
            () => {

                const label =
                    $("addressPreviewLabel");

                if (label) {

                    label.style.border =
                        "none";

                    label.style.boxShadow =
                        "none";
                }

                showToast(
                    "Address border removed",
                    "error"
                );

                saveHistory();
            }
        ]
    ];

    actions.forEach(
        ([id, handler]) => {

            const button =
                $(id);

            if (button) {

                button.addEventListener(
                    "click",
                    handler
                );
            }
        }
    );
}


/* =========================================================
   GENERATE PDF BUTTONS
========================================================= */

function setupGenerateButtons() {

    const buttons = [

        [
            "cocoGenerateButton",
            generateCocoPDF
        ],

        [
            "otherGenerateButton",
            generateOtherPDF
        ],

        [
            "isbnGenerateButton",
            generateISBNPDF
        ],

        [
            "addressGenerateButton",
            generateAddressPDF
        ]
    ];

    buttons.forEach(
        ([id, handler]) => {

            const button =
                $(id);

            if (button) {

                button.addEventListener(
                    "click",
                    handler
                );
            }
        }
    );
}


/* =========================================================
   RESET BUTTONS
========================================================= */

function setupResetButtons() {

    const buttons = [

        "cocoResetButton",
        "otherResetButton",
        "isbnResetButton",
        "addressResetButton"
    ];

    buttons.forEach(
        id => {

            const button =
                $(id);

            if (!button) {
                return;
            }

            button.addEventListener(
                "click",
                () => {

                    resetCurrentStyle();

                }
            );
        }
    );
}


/* =========================================================
   EXCEL EVENTS
========================================================= */

function setupExcelEvents() {

    const coco =
        $("cocoExcelFile");

    if (coco) {

        coco.addEventListener(
            "change",
            () => {

                handleExcel(
                    "cocoExcelFile",
                    "cocoExcelPreview",
                    "cocoExcelFileName",
                    "cocoPO"
                );
            }
        );
    }


    const other =
        $("otherExcelFile");

    if (other) {

        other.addEventListener(
            "change",
            () => {

                handleExcel(
                    "otherExcelFile",
                    "otherExcelPreview",
                    "otherExcelFileName",
                    "otherPO"
                );
            }
        );
    }


    const address =
        $("addressExcelFile");

    if (address) {

        address.addEventListener(
            "change",
            async () => {

                try {

                    const rows =
                        await readExcelFile(
                            address.files[0]
                        );

                    renderExcelPreview(
                        "addressExcelPreview",
                        rows
                    );

                    showToast(
                        "Address Excel loaded. Header ignored.",
                        "success"
                    );

                } catch (error) {

                    showToast(
                        error.message,
                        "error"
                    );
                }
            }
        );
    }
}


/* =========================================================
   EMAIL QR SUPPORT
========================================================= */

function addEmailFieldIfMissing() {

    /*
      HTML version can optionally contain
      #emailAddress.

      If it doesn't, we create a small field
      dynamically inside the Email QR card.
    */

    if (
        $("emailAddress")
    ) {
        return;
    }

    const container =
        $("emailQRPreview");

    if (!container) {
        return;
    }

    const parent =
        container.parentElement;

    if (!parent) {
        return;
    }

    const field =
        document.createElement(
            "div"
        );

    field.className =
        "field";

    field.style.marginBottom =
        "12px";

    field.innerHTML = `

        <label for="emailAddress">
            ✉️ Email Address
        </label>

        <input
            id="emailAddress"
            type="email"
            placeholder="name@example.com"
        >

    `;

    parent.insertBefore(
        field,
        container
    );

    const input =
        $("emailAddress");

    if (input) {

        input.addEventListener(
            "input",
            liveRefresh
        );
    }
}


/* =========================================================
   TRACK REQUIRED TOGGLES
========================================================= */

function setupToggleNotifications() {

    const toggles = [

        [
            "poNumberCheck",
            "PO Value"
        ],

        [
            "boxNumberCheck",
            "Box Number"
        ],

        [
            "poPlusBoxCheck",
            "PO + Box"
        ],

        [
            "cutLineCheck",
            "Cut Line"
        ],

        [
            "pageBorderCheck",
            "Page Border"
        ],

        [
            "samePOPageFlow",
            "Same PO Flow"
        ],

        [
            "halfPageFlowCheck",
            "Half Page Flow"
        ],

        [
            "borderTopEnabled",
            "Top Border"
        ],

        [
            "borderRightEnabled",
            "Right Border"
        ],

        [
            "borderBottomEnabled",
            "Bottom Border"
        ],

        [
            "borderLeftEnabled",
            "Left Border"
        ],

        [
            "borderInsideEnabled",
            "Inside Border"
        ],

        [
            "borderOutsideEnabled",
            "Outside Border"
        ],

        [
            "otherBorderTop",
            "Other PO Top Border"
        ],

        [
            "otherBorderRight",
            "Other PO Right Border"
        ],

        [
            "otherBorderBottom",
            "Other PO Bottom Border"
        ],

        [
            "otherBorderLeft",
            "Other PO Left Border"
        ],

        [
            "isbnBorderTop",
            "ISBN Top Border"
        ],

        [
            "isbnBorderRight",
            "ISBN Right Border"
        ],

        [
            "isbnBorderBottom",
            "ISBN Bottom Border"
        ],

        [
            "isbnBorderLeft",
            "ISBN Left Border"
        ],

        [
            "addressBorderTop",
            "Address Top Border"
        ],

        [
            "addressBorderRight",
            "Address Right Border"
        ],

        [
            "addressBorderBottom",
            "Address Bottom Border"
        ],

        [
            "addressBorderLeft",
            "Address Left Border"
        ],

        [
            "addressBorderInside",
            "Address Inside Border"
        ],

        [
            "addressBorderOutside",
            "Address Outside Border"
        ]
    ];

    toggles.forEach(
        ([id, name]) =>
            trackToggle(
                id,
                name
            )
    );
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            const ctrl =
                event.ctrlKey ||
                event.metaKey;

            if (!ctrl) {
                return;
            }

            if (
                event.key.toLowerCase() ===
                "z"
            ) {

                event.preventDefault();

                if (
                    event.shiftKey
                ) {

                    redo();

                } else {

                    undo();
                }
            }

            if (
                event.key.toLowerCase() ===
                "y"
            ) {

                event.preventDefault();

                redo();
            }
        }
    );
}


/* =========================================================
   PDF LIBRARY DIAGNOSTIC
========================================================= */

function checkLibraries() {

    const status = {

        XLSX:
            typeof window.XLSX !==
            "undefined",

        QRCode:
            typeof window.QRCode !==
            "undefined",

        JsBarcode:
            typeof window.JsBarcode !==
            "undefined",

        jsPDF:
            !!getPDFLibrary()
    };

    console.table(status);

    /*
      Don't show a scary PDF error on page load.
      Only notify when user actually clicks Generate PDF.
    */

    if (!status.XLSX) {

        console.warn(
            "XLSX library is not available."
        );
    }

    if (!status.QRCode) {

        console.warn(
            "QRCode library is not available."
        );
    }

    if (!status.JsBarcode) {

        console.warn(
            "JsBarcode library is not available."
        );
    }

    if (!status.jsPDF) {

        console.warn(
            "jsPDF library is not available."
        );
    }
}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeApp() {

    createPOInputs(
        "individualPOGrid",
        "cocoPO",
        40
    );

    createPOInputs(
        "otherIndividualPOGrid",
        "otherPO",
        20
    );

    setupCategoryNavigation();

    setupCocoModes();

    setupOtherModes();

    setupAddressModes();

    setupBorderStyleButtons();

    setupFontPresets();

    setupCustomPageSizes();

    setupLabelsPerPage();

    setupLiveInputs();

    setupExcelEvents();

    setupGenerateButtons();

    setupBorderActions();

    setupResetButtons();

    setupToggleNotifications();

    setupKeyboardShortcuts();

    addEmailFieldIfMissing();


    const undoButton =
        $("undoButton");

    if (undoButton) {

        undoButton.addEventListener(
            "click",
            undo
        );
    }


    const redoButton =
        $("redoButton");

    if (redoButton) {

        redoButton.addEventListener(
            "click",
            redo
        );
    }


    const saveDefault =
        $("saveDefaultButton");

    if (saveDefault) {

        saveDefault.addEventListener(
            "click",
            saveDefaultStyle
        );
    }


    const loadDefault =
        $("loadDefaultButton");

    if (loadDefault) {

        loadDefault.addEventListener(
            "click",
            loadDefaultStyle
        );
    }


    const resetAllBtn =
        $("resetAllButton");

    if (resetAllBtn) {

        resetAllBtn.addEventListener(
            "click",
            resetAll
        );
    }


    const copyButton =
        $("copyStyleButton");

    if (copyButton) {

        copyButton.addEventListener(
            "click",
            copyStyle
        );
    }


    const pasteButton =
        $("pasteStyleButton");

    if (pasteButton) {

        pasteButton.addEventListener(
            "click",
            pasteStyle
        );
    }


    const resetStyleButton =
        $("resetStyleButton");

    if (resetStyleButton) {

        resetStyleButton.addEventListener(
            "click",
            resetCurrentStyle
        );
    }


    const saveBorderPreset =
        $("saveBorderPresetButton");

    if (saveBorderPreset) {

        saveBorderPreset.addEventListener(
            "click",
            () => {

                try {

                    localStorage.setItem(
                        "booksLabelStudioBorderPreset",
                        JSON.stringify({
                            coco:
                                borderConfig(
                                    "coco"
                                ),

                            other:
                                borderConfig(
                                    "other"
                                ),

                            isbn:
                                borderConfig(
                                    "isbn"
                                ),

                            address:
                                borderConfig(
                                    "address"
                                )
                        })
                    );

                    showToast(
                        "Border preset saved",
                        "success"
                    );

                } catch (error) {

                    showToast(
                        "Could not save border preset",
                        "error"
                    );
                }
            }
        );
    }


    syncPresetInputs();

    applyActiveTool();

    liveRefresh();

    checkLibraries();

    /*
      First history snapshot.
    */

    App.history = [];

    App.historyIndex = -1;

    saveHistory();

    updateHistoryButtons();

    console.log(
        "Books Label Studio initialized successfully."
    );
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
        initializeApp
    );

} else {

    initializeApp();
}
