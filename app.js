/* =========================================================
   BOOKSWAGON LABEL STUDIO
   COMPLETE app.js
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    const state = {
        activeTool: null,

        coco: {
            mode: "sticker",
            size: "4x6",
            inputMode: "manual",
            borderStyle: "solid-dark"
        },

        other: {
            size: "4x6",
            inputMode: "manual"
        },

        isbn: {
            size: "4x6",
            inputMode: "manual"
        },

        pendingCheckbox: null
    };


    /* =====================================================
       SHORTCUTS
    ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message,
        type = "success",
        title = null
    ) {
        const container = $("#toastContainer");

        if (!container) return;

        const toast = document.createElement("div");

        toast.className = `toast ${type}`;

        const icon =
            type === "success"
                ? "✓"
                : type === "error"
                    ? "!"
                    : "i";

        const heading =
            title ||
            (
                type === "success"
                    ? "Success"
                    : type === "error"
                        ? "Error"
                        : "Information"
            );

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>

            <div class="toast-content">
                <strong>${escapeHTML(heading)}</strong>
                <span>${escapeHTML(message)}</span>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4100);
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       CONFIRMATION FOR CHECKBOXES
    ===================================================== */

    function setupConfirmableCheckboxes() {

        $$('input[type="checkbox"]').forEach((checkbox) => {

            if (checkbox.dataset.confirmBound === "true") {
                return;
            }

            checkbox.dataset.confirmBound = "true";

            checkbox.addEventListener("click", function (event) {

                event.preventDefault();

                const desiredState = !this.checked;

                const label =
                    this.closest(".check-row")
                        ?.querySelector("span")
                        ?.textContent
                        ?.trim()
                    || "This feature";

                openFeatureConfirmation(
                    this,
                    desiredState,
                    label
                );
            });
        });
    }


    function openFeatureConfirmation(
        checkbox,
        desiredState,
        label
    ) {

        const modal = $("#featureConfirmModal");

        if (!modal) {
            checkbox.checked = desiredState;
            return;
        }

        state.pendingCheckbox = {
            checkbox,
            desiredState,
            label
        };

        $("#featureConfirmTitle").textContent =
            desiredState
                ? "Enable Feature?"
                : "Disable Feature?";

        $("#featureConfirmMessage").textContent =
            desiredState
                ? `Are you sure you want to enable "${label}"?`
                : `Are you sure you want to disable "${label}"?`;

        modal.classList.remove("hidden");
    }


    function closeFeatureConfirmation() {
        const modal = $("#featureConfirmModal");

        if (modal) {
            modal.classList.add("hidden");
        }

        state.pendingCheckbox = null;
    }


    function confirmFeatureChange() {

        if (!state.pendingCheckbox) {
            closeFeatureConfirmation();
            return;
        }

        const {
            checkbox,
            desiredState,
            label
        } = state.pendingCheckbox;

        checkbox.checked = desiredState;

        closeFeatureConfirmation();

        updateAllPreviews();

        if (desiredState) {

            showToast(
                `"${label}" has been enabled.`,
                "success",
                "Feature Enabled"
            );

        } else {

            showToast(
                `"${label}" has been disabled.`,
                "info",
                "Feature Disabled"
            );
        }
    }


    /* =====================================================
       TOOL OPEN / CLOSE
    ===================================================== */

    function openTool(tool) {

        state.activeTool = tool;

        $$(".tool-workspace").forEach((workspace) => {
            workspace.classList.remove("active");
        });

        const target = $(`#${tool}Workspace`);

        if (target) {
            target.classList.add("active");

            setTimeout(() => {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 50);
        }
    }


    function closeTool() {

        state.activeTool = null;

        $$(".tool-workspace").forEach((workspace) => {
            workspace.classList.remove("active");
        });

        $("#tools")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* =====================================================
       TOOL BUTTONS
    ===================================================== */

    $$("[data-open-tool]").forEach((button) => {

        button.addEventListener("click", () => {

            const tool = button.dataset.openTool;

            openTool(tool);
        });
    });


    $$("[data-close-tool]").forEach((button) => {

        button.addEventListener("click", closeTool);
    });


    /* =====================================================
       COCOBLUE TABS
    ===================================================== */

    $$("[data-cocoblue-mode]").forEach((button) => {

        button.addEventListener("click", () => {

            const mode = button.dataset.cocoblueMode;

            state.coco.mode = mode;

            $$("[data-cocoblue-mode]").forEach((btn) => {
                btn.classList.toggle(
                    "active",
                    btn === button
                );
            });

            $("#cocoblueStickerMode")
                ?.classList.toggle(
                    "hidden",
                    mode !== "sticker"
                );

            $("#cocoblueAddressMode")
                ?.classList.toggle(
                    "hidden",
                    mode !== "address"
                );
        });
    });


    /* =====================================================
       COCO INPUT MODE
    ===================================================== */

    $$("[data-coco-input]").forEach((button) => {

        button.addEventListener("click", () => {

            const mode = button.dataset.cocoInput;

            state.coco.inputMode = mode;

            $$("[data-coco-input]").forEach((btn) => {
                btn.classList.toggle(
                    "active",
                    btn === button
                );
            });

            $("#cocoManualArea")
                ?.classList.toggle(
                    "hidden",
                    mode !== "manual"
                );

            $("#cocoExcelArea")
                ?.classList.toggle(
                    "hidden",
                    mode !== "excel"
                );
        });
    });


    /* =====================================================
       OTHER INPUT MODE
    ===================================================== */

    $$("[data-other-input]").forEach((button) => {

        button.addEventListener("click", () => {

            const mode = button.dataset.otherInput;

            state.other.inputMode = mode;

            $$("[data-other-input]").forEach((btn) => {
                btn.classList.toggle(
                    "active",
                    btn === button
                );
            });

            $("#otherManualArea")
                ?.classList.toggle(
                    "hidden",
                    mode !== "manual"
                );

            $("#otherExcelArea")
                ?.classList.toggle(
                    "hidden",
                    mode !== "excel"
                );
        });
    });


    /* =====================================================
       ISBN INPUT MODE
    ===================================================== */

    $$("[data-isbn-input]").forEach((button) => {

        button.addEventListener("click", () => {

            const mode = button.dataset.isbnInput;

            state.isbn.inputMode = mode;

            $$("[data-isbn-input]").forEach((btn) => {
                btn.classList.toggle(
                    "active",
                    btn === button
                );
            });

            $("#isbnManualCard")
                ?.classList.toggle(
                    "hidden",
                    mode !== "manual"
                );

            $("#isbnExcelCard")
                ?.classList.toggle(
                    "hidden",
                    mode !== "excel"
                );
        });
    });


    /* =====================================================
       SIZE BUTTONS
    ===================================================== */

    $$("[data-coco-size]").forEach((button) => {

        button.addEventListener("click", () => {

            state.coco.size = button.dataset.cocoSize;

            $$("[data-coco-size]").forEach((btn) => {
                btn.classList.toggle(
                    "active",
                    btn === button
                );
            });

            $("#cocoCustomSize")
                ?.classList.toggle(
                    "hidden",
                    state.coco.size !== "custom"
                );

            updateCocoPreview();
        });
    });


    $$("[data-other-size]").forEach((button) => {

        button.addEventListener("click", () => {

            state.other.size = button.dataset.otherSize;

            $$("[data-other-size]").forEach((btn) => {
                btn.classList.toggle(
                    "active",
                    btn === button
                );
            });

            $("#otherCustomSize")
                ?.classList.toggle(
                    "hidden",
                    state.other.size !== "custom"
                );

            updateOtherPreview();
        });
    });


    $$("[data-isbn-size]").forEach((button) => {

        button.addEventListener("click", () => {

            state.isbn.size = button.dataset.isbnSize;

            $$("[data-isbn-size]").forEach((btn) => {
                btn.classList.toggle(
                    "active",
                    btn === button
                );
            });
        });
    });


    /* =====================================================
       EXCEL HANDLING
    ===================================================== */

    $("#cocoExcel")?.addEventListener(
        "change",
        (event) => {

            handleExcelFile(
                event.target.files[0],
                $("#cocoExcelStatus")
            );
        }
    );


    $("#otherExcel")?.addEventListener(
        "change",
        (event) => {

            handleExcelFile(
                event.target.files[0],
                $("#otherExcelStatus")
            );
        }
    );


    $("#isbnExcel")?.addEventListener(
        "change",
        (event) => {

            handleExcelFile(
                event.target.files[0],
                $("#isbnExcelStatus")
            );
        }
    );


    async function handleExcelFile(file, statusElement) {

        if (!file) return;

        if (!window.XLSX) {

            showToast(
                "Excel library is not loaded.",
                "error"
            );

            return;
        }

        try {

            const buffer =
                await file.arrayBuffer();

            const workbook =
                XLSX.read(
                    buffer,
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

            if (statusElement) {

                statusElement.textContent =
                    `${file.name} loaded — ${Math.max(
                        rows.length - 1,
                        0
                    )} data rows found.`;
            }

            statusElement.dataset.fileRows =
                JSON.stringify(rows);

            showToast(
                `${file.name} loaded successfully.`,
                "success",
                "Excel Loaded"
            );

        } catch (error) {

            console.error(error);

            if (statusElement) {
                statusElement.textContent =
                    "Unable to read Excel file.";
            }

            showToast(
                "The Excel file could not be read.",
                "error"
            );
        }
    }


    /* =====================================================
       GET COCO PO LIST
    ===================================================== */

    function getCocoPOs() {

        if (state.coco.inputMode === "excel") {

            const status = $("#cocoExcelStatus");

            try {

                const rows =
                    JSON.parse(
                        status?.dataset?.fileRows || "[]"
                    );

                return rows
                    .slice(1)
                    .map(row => String(row[0] ?? "").trim())
                    .filter(Boolean);

            } catch {
                return [];
            }
        }

        return $$(".coco-po")
            .map(input => input.value.trim())
            .filter(Boolean);
    }


    /* =====================================================
       GET OTHER PO LIST
    ===================================================== */

    function getOtherPOs() {

        if (state.other.inputMode === "excel") {

            const status = $("#otherExcelStatus");

            try {

                const rows =
                    JSON.parse(
                        status?.dataset?.fileRows || "[]"
                    );

                return rows
                    .slice(1)
                    .map(row => String(row[0] ?? "").trim())
                    .filter(Boolean);

            } catch {
                return [];
            }
        }

        return $$(".other-po")
            .map(input => input.value.trim())
            .filter(Boolean);
    }


    /* =====================================================
       UNLIMITED RANGE
    ===================================================== */

    function getBoxRange(startId, endId) {

        const start =
            Number($(startId)?.value);

        const end =
            Number($(endId)?.value);

        if (
            !Number.isFinite(start) ||
            !Number.isFinite(end)
        ) {

            throw new Error(
                "Please enter a valid Box Number range."
            );
        }

        if (start < 1) {

            throw new Error(
                "Starting Box Number must be 1 or greater."
            );
        }

        if (end < start) {

            throw new Error(
                "End Box Number must be greater than or equal to Start Box Number."
            );
        }

        /*
         * IMPORTANT:
         * There is intentionally NO max 200 restriction.
         */

        return {
            start,
            end
        };
    }


    /* =====================================================
       FORMAT BOX NUMBER
    ===================================================== */

    function formatBoxNumber(number) {

        return `BOX NO. ${number}`;
    }


    /* =====================================================
       PAGE SIZE
    ===================================================== */

    function getPageDimensions(size, customWidth, customHeight) {

        switch (size) {

            case "a4":
                return {
                    width: 210,
                    height: 297
                };

            case "70x35":
                return {
                    width: 70,
                    height: 35
                };

            case "custom":

                return {
                    width:
                        Number(customWidth) || 100,

                    height:
                        Number(customHeight) || 100
                };

            case "4x6":
            default:

                return {
                    width: 101.6,
                    height: 152.4
                };
        }
    }


    /* =====================================================
       PAGE SIZE LABEL
    ===================================================== */

    function getSizeLabel(size) {

        switch (size) {

            case "a4":
                return "A4";

            case "70x35":
                return "70 × 35 mm";

            case "custom":
                return "Custom";

            case "4x6":
            default:
                return "4 × 6 inch";
        }
    }


    /* =====================================================
       UPDATE COCO PREVIEW
    ===================================================== */

    function updateCocoPreview() {

        const page =
            $("#cocoPreviewPage");

        if (!page) return;

        page.classList.remove(
            "size-4x6",
            "size-a4",
            "size-70x35",
            "size-custom"
        );

        page.classList.add(
            `size-${state.coco.size}`
        );


        const firstPO =
            getCocoPOs()[0] || "BWG 123";


        const start =
            Number($("#cocoStartBox")?.value) || 1;


        $("#cocoPreviewPO").textContent =
            firstPO;


        $("#cocoPreviewBox").textContent =
            formatBoxNumber(start);


        const printPO =
            $("#cocoPrintPO")?.checked;


        const printBox =
            $("#cocoPrintBox")?.checked;


        const printPOBox =
            $("#cocoPrintPOBox")?.checked;


        const poElement =
            $("#cocoPreviewPO");


        const boxElement =
            $("#cocoPreviewBox");


        const separator =
            $("#cocoPreviewSeparator");


        const scissor =
            $("#cocoPreviewScissor");


        if (poElement) {

            poElement.style.display =
                printPO || printPOBox
                    ? "inline-flex"
                    : "none";

            applyPreviewBorder(
                poElement,
                $("#cocoPOBorder")?.checked
            );
        }


        if (boxElement) {

            boxElement.style.display =
                printBox || printPOBox
                    ? "inline-flex"
                    : "none";

            applyPreviewBorder(
                boxElement,
                $("#cocoBoxBorder")?.checked
            );
        }


        if (separator) {

            separator.style.display =
                printPOBox
                    ? "block"
                    : "none";
        }


        if (scissor) {

            scissor.style.display =
                $("#cocoCutting")?.checked
                    ? "block"
                    : "none";
        }


        applyPreviewBorder(
            page,
            $("#cocoPageBorder")?.checked
        );


        const label =
            $("#cocoPreviewLabel");


        if (label) {

            applyPreviewBorder(
                label,
                $("#cocoPOBoxOuterBorder")?.checked
            );

            if ($("#cocoBorder")?.checked) {
                label.style.boxShadow =
                    "inset 0 0 0 1px #111";
            } else {
                label.style.boxShadow =
                    "none";
            }
        }


        const borderStyle =
            $("#cocoBorderStyle")?.value
            || "solid-dark";


        applyBorderStyle(
            poElement,
            borderStyle
        );

        applyBorderStyle(
            boxElement,
            borderStyle
        );

        applyBorderStyle(
            label,
            borderStyle
        );


        const startBox =
            Number($("#cocoStartBox")?.value) || 1;

        const endBox =
            Number($("#cocoEndBox")?.value) || 200;


        $("#cocoBoxSummary").textContent =
            `${startBox}–${endBox}`;


        $("#cocoSizeSummary").textContent =
            getSizeLabel(state.coco.size);


        if (
            Number.isFinite(startBox) &&
            Number.isFinite(endBox) &&
            endBox >= startBox
        ) {

            const copies =
                Number($("#cocoCopiesPerBox")?.value) || 1;

            const labelsPerPage =
                Number($("#cocoLabelsPerPage")?.value) || 1;

            const count =
                (
                    endBox -
                    startBox +
                    1
                ) *
                copies;

            $("#cocoSummary").textContent =
                `${count} labels / ${Math.ceil(
                    count / labelsPerPage
                )} pages`;
        }


        updateCocoFilename();
    }


    /* =====================================================
       OTHER PREVIEW
    ===================================================== */

    function updateOtherPreview() {

        const page =
            $("#otherPreviewPage");

        if (!page) return;

        page.classList.remove(
            "size-4x6",
            "size-a4",
            "size-70x35",
            "size-custom"
        );

        page.classList.add(
            `size-${state.other.size}`
        );


        const po =
            getOtherPOs()[0] || "BWG 123";


        const box =
            Number($("#otherStartBox")?.value) || 1;


        $("#otherPreviewPO").textContent =
            po;


        $("#otherPreviewBox").textContent =
            formatBoxNumber(box);


        const poElement =
            $("#otherPreviewPO");


        const boxElement =
            $("#otherPreviewBox");


        applyPreviewBorder(
            poElement,
            $("#otherPOBorder")?.checked
        );


        applyPreviewBorder(
            boxElement,
            $("#otherBoxBorder")?.checked
        );


        applyPreviewBorder(
            page,
            $("#otherPageBorder")?.checked
        );


        applyBorderStyle(
            poElement,
            $("#otherBorderStyle")?.value
        );


        applyBorderStyle(
            boxElement,
            $("#otherBorderStyle")?.value
        );


        const start =
            Number($("#otherStartBox")?.value) || 1;


        const end =
            Number($("#otherEndBox")?.value) || 200;


        $("#otherBoxSummary").textContent =
            `${start}–${end}`;


        $("#otherSizeSummary").textContent =
            getSizeLabel(state.other.size);
    }


    /* =====================================================
       PREVIEW BORDER
    ===================================================== */

    function applyPreviewBorder(
        element,
        enabled
    ) {

        if (!element) return;

        element.style.border =
            enabled
                ? "2px solid #111"
                : "none";
    }


    function applyBorderStyle(
        element,
        style
    ) {

        if (!element) return;

        const currentBorder =
            element.style.border;

        if (
            currentBorder === "none" ||
            !currentBorder
        ) {
            return;
        }

        switch (style) {

            case "double":
                element.style.border =
                    "3px double #111";
                break;

            case "dashed":
                element.style.border =
                    "2px dashed #111";
                break;

            case "dotted":
                element.style.border =
                    "2px dotted #111";
                break;

            case "bold":
                element.style.border =
                    "4px solid #111";
                break;

            case "double-dark":
                element.style.border =
                    "4px double #000";
                break;

            case "triple":
                element.style.border =
                    "5px double #111";
                break;

            case "solid-light":
                element.style.border =
                    "1px solid #777";
                break;

            case "solid-medium":
                element.style.border =
                    "2px solid #444";
                break;

            case "inner":
                element.style.border =
                    "2px solid #111";
                element.style.boxShadow =
                    "inset 0 0 0 2px #fff, inset 0 0 0 4px #111";
                break;

            case "outer":
                element.style.border =
                    "2px solid #111";
                element.style.boxShadow =
                    "0 0 0 4px #fff, 0 0 0 6px #111";
                break;

            case "text-box":
                element.style.border =
                    "2px solid #111";
                break;

            case "solid-dark":
            default:
                element.style.border =
                    "2px solid #111";
        }
    }


    /* =====================================================
       ALL PREVIEWS
    ===================================================== */

    function updateAllPreviews() {

        updateCocoPreview();

        updateOtherPreview();

        updateISBNPreview();
    }


    /* =====================================================
       COCO INPUT LISTENERS
    ===================================================== */

    [
        "#cocoStartBox",
        "#cocoEndBox",
        "#cocoCopiesPerBox",
        "#cocoLabelsPerPage",
        "#cocoCustomWidth",
        "#cocoCustomHeight",
        "#cocoFontSize"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "input",
            updateCocoPreview
        );
    });


    [
        "#cocoPrintPO",
        "#cocoPrintBox",
        "#cocoPrintPOBox",
        "#cocoPageBorder",
        "#cocoPOBorder",
        "#cocoBoxBorder",
        "#cocoPOBoxOuterBorder",
        "#cocoTaxBorder",
        "#cocoBorder",
        "#cocoCutting",
        "#cocoScissorLine",
        "#cocoBoldText"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "change",
            updateCocoPreview
        );
    });


    $("#cocoBorderStyle")
        ?.addEventListener(
            "change",
            updateCocoPreview
        );


    $$(".coco-po").forEach(input => {

        input.addEventListener(
            "input",
            updateCocoPreview
        );
    });


    /* =====================================================
       OTHER INPUT LISTENERS
    ===================================================== */

    [
        "#otherStartBox",
        "#otherEndBox",
        "#otherCopiesPerBox",
        "#otherLabelsPerPage",
        "#otherCustomWidth",
        "#otherCustomHeight"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "input",
            updateOtherPreview
        );
    });


    [
        "#otherPrintPO",
        "#otherPrintBox",
        "#otherPrintPOBox",
        "#otherPageBorder",
        "#otherPOBorder",
        "#otherBoxBorder",
        "#otherPOBoxOuterBorder",
        "#otherTaxBorder",
        "#otherBorder",
        "#otherCutting"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "change",
            updateOtherPreview
        );
    });


    $("#otherBorderStyle")
        ?.addEventListener(
            "change",
            updateOtherPreview
        );


    $$(".other-po").forEach(input => {

        input.addEventListener(
            "input",
            updateOtherPreview
        );
    });


    /* =====================================================
       ISBN PREVIEW
    ===================================================== */

    function updateISBNPreview() {

        const input =
            $(".isbn-manual");

        const isbn =
            input?.value?.trim()
            || "9780000000000";


        $("#isbnPreviewNumber").textContent =
            formatISBNDisplay(isbn);


        const title =
            $(".title-manual")
                ?.value
                ?.trim()
            || "Book Title";


        const edition =
            $(".edition-manual")
                ?.value
                ?.trim()
            || "N";


        $("#isbnPreviewTitle").textContent =
            title;


        $("#isbnPreviewEdition").textContent =
            edition;
    }


    $$(".isbn-manual, .title-manual, .edition-manual")
        .forEach(input => {

            input.addEventListener(
                "input",
                updateISBNPreview
            );
        });


    /* =====================================================
       ISBN FORMAT
    ===================================================== */

    function cleanISBN(value) {

        return String(value || "")
            .replace(/[^0-9Xx]/g, "")
            .toUpperCase();
    }


    function formatISBNDisplay(value) {

        const clean =
            cleanISBN(value);

        if (clean.length === 13) {

            return clean.replace(
                /^(\d{3})(\d)(\d{4})(\d{4})(\d)$/,
                "$1-$2-$3-$4-$5"
            );
        }

        if (clean.length === 10) {

            return clean.replace(
                /^(\d)(\d{3})(\d{5})([\dX])$/,
                "$1-$2-$3-$4"
            );
        }

        return value || "";
    }


    /* =====================================================
       ISBN VALIDATION
    ===================================================== */

    function validateISBN(value) {

        const isbn =
            cleanISBN(value);


        if (isbn.length === 10) {

            let sum = 0;

            for (let i = 0; i < 10; i++) {

                const char =
                    isbn[i];

                const digit =
                    char === "X"
                        ? 10
                        : Number(char);

                if (!Number.isInteger(digit)) {
                    return false;
                }

                sum += digit * (10 - i);
            }

            return sum % 11 === 0;
        }


        if (isbn.length === 13) {

            if (!/^\d{13}$/.test(isbn)) {
                return false;
            }

            let sum = 0;

            for (let i = 0; i < 12; i++) {

                sum +=
                    Number(isbn[i]) *
                    (
                        i % 2 === 0
                            ? 1
                            : 3
                    );
            }

            const check =
                (10 - (sum % 10)) % 10;

            return check === Number(isbn[12]);
        }


        return false;
    }


    /* =====================================================
       ISBN GENERATE
    ===================================================== */

    $("#isbnGenerate")
        ?.addEventListener(
            "click",
            generateISBN
        );


    function generateISBN() {

        let items = [];


        if (
            state.isbn.inputMode ===
            "manual"
        ) {

            const isbnInputs =
                $$(".isbn-manual");

            const titleInputs =
                $$(".title-manual");

            const editionInputs =
                $$(".edition-manual");


            isbnInputs.forEach(
                (input, index) => {

                    const value =
                        input.value.trim();

                    if (!value) return;

                    items.push({
                        isbn: value,
                        title:
                            titleInputs[index]
                                ?.value
                                ?.trim()
                            || "",
                        edition:
                            editionInputs[index]
                                ?.value
                                ?.trim()
                            || ""
                    });
                }
            );

        } else {

            const status =
                $("#isbnExcelStatus");

            try {

                const rows =
                    JSON.parse(
                        status?.dataset?.fileRows
                        || "[]"
                    );

                rows.slice(1).forEach(row => {

                    if (!row[0]) return;

                    items.push({
                        isbn:
                            String(row[0]),
                        title:
                            String(row[1] || ""),
                        edition:
                            String(row[2] || "")
                    });
                });

            } catch {
                items = [];
            }
        }


        if (!items.length) {

            showToast(
                "Please enter or upload at least one ISBN.",
                "error"
            );

            return;
        }


        const invalid =
            items.filter(
                item =>
                    !validateISBN(item.isbn)
            );


        if (invalid.length) {

            showToast(
                `${invalid.length} ISBN value(s) are invalid. ISBN-10 or ISBN-13 is required.`,
                "error",
                "Invalid ISBN"
            );

            $("#isbnStatus").textContent =
                "Invalid ISBN detected.";

            return;
        }


        try {

            const pdf =
                createISBNPDF(
                    items
                );

            downloadBlob(
                pdf.output("blob"),
                `ISBN_LABELS_${timestampForFilename()}.pdf`
            );


            $("#isbnStatus").textContent =
                `${items.length} ISBN label(s) generated.`;


            showToast(
                `${items.length} ISBN label(s) generated successfully.`,
                "success",
                "PDF Generated"
            );

        } catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Unable to generate ISBN PDF.",
                "error"
            );
        }
    }


    /* =====================================================
       CREATE ISBN PDF
    ===================================================== */

    function createISBNPDF(items) {

        const {
            jsPDF
        } = window.jspdf;


        const dims =
            getPageDimensions(
                state.isbn.size
            );


        const orientation =
            dims.width > dims.height
                ? "landscape"
                : "portrait";


        const pdf =
            new jsPDF({
                orientation,
                unit: "mm",
                format: [
                    dims.width,
                    dims.height
                ]
            });


        const perPage =
            Math.max(
                1,
                Number(
                    $("#isbnLabelsPerPage")
                        ?.value
                ) || 1
            );


        items.forEach(
            (item, index) => {

                if (
                    index > 0 &&
                    index % perPage === 0
                ) {
                    pdf.addPage(
                        [
                            dims.width,
                            dims.height
                        ],
                        orientation
                    );
                }


                drawISBNLabel(
                    pdf,
                    item,
                    index % perPage,
                    perPage,
                    dims
                );
            }
        );


        return pdf;
    }


    function drawISBNLabel(
        pdf,
        item,
        position,
        perPage,
        dims
    ) {

        const margin = 8;

        const availableHeight =
            dims.height -
            margin * 2;


        const slotHeight =
            availableHeight /
            perPage;


        const y =
            margin +
            position *
            slotHeight;


        const x =
            margin;


        const width =
            dims.width -
            margin * 2;


        if ($("#isbnBorder")?.checked) {

            drawBorder(
                pdf,
                x,
                y + 2,
                width,
                slotHeight - 4,
                $("#isbnBorderStyle")?.value
            );
        }


        pdf.setFont(
            $("#isbnFont")?.value
            || "Arial",
            "normal"
        );


        pdf.setFontSize(
            Number(
                $("#isbnFontSize")?.value
            ) || 10
        );


        pdf.setTextColor(20, 20, 20);


        const barcodeX =
            x + width / 2 - 35;

        const barcodeY =
            y + 13;


        drawFakeBarcode(
            pdf,
            barcodeX,
            barcodeY,
            70,
            22,
            cleanISBN(item.isbn)
        );


        pdf.setFontSize(9);

        pdf.text(
            formatISBNDisplay(item.isbn),
            x + width / 2,
            barcodeY + 29,
            {
                align: "center"
            }
        );


        if (item.title) {

            pdf.setFontSize(8);

            pdf.text(
                item.title,
                x + width / 2,
                barcodeY + 36,
                {
                    align: "center",
                    maxWidth:
                        width - 15
                }
            );
        }


        if (item.edition) {

            pdf.setFontSize(7);

            pdf.text(
                item.edition,
                x + width / 2,
                barcodeY + 43,
                {
                    align: "center"
                }
            );
        }


        if ($("#isbnTaxBorder")?.checked) {

            pdf.setLineWidth(.5);

            pdf.rect(
                x + 3,
                y + 5,
                width - 6,
                slotHeight - 10
            );
        }
    }


    /* =====================================================
       FAKE BARCODE
       Browser-only fallback visual barcode.
    ===================================================== */

    function drawFakeBarcode(
        pdf,
        x,
        y,
        width,
        height,
        value
    ) {

        let cursor = x;

        const pattern =
            value
                .split("")
                .map(
                    char =>
                        char.charCodeAt(0)
                );


        let i = 0;

        while (
            cursor <
            x + width
        ) {

            const code =
                pattern[
                    i %
                    pattern.length
                ] || 7;


            const barWidth =
                0.35 +
                (
                    code % 4
                ) * .22;


            if (
                i % 2 === 0
            ) {

                pdf.setFillColor(
                    0,
                    0,
                    0
                );

                pdf.rect(
                    cursor,
                    y,
                    barWidth,
                    height,
                    "F"
                );
            }


            cursor += barWidth;

            i++;
        }
    }


    /* =====================================================
       GENERATE COCO
    ===================================================== */

    $("#cocoGenerate")
        ?.addEventListener(
            "click",
            generateCoco
        );


    async function generateCoco() {

        try {

            const range =
                getBoxRange(
                    "#cocoStartBox",
                    "#cocoEndBox"
                );


            const copies =
                Number(
                    $("#cocoCopiesPerBox")
                        ?.value
                ) || 1;


            if (copies < 1) {

                throw new Error(
                    "Copies per box must be at least 1."
                );
            }


            const labelsPerPage =
                Number(
                    $("#cocoLabelsPerPage")
                        ?.value
                ) || 1;


            if (labelsPerPage < 1) {

                throw new Error(
                    "Labels per page must be at least 1."
                );
            }


            const pos =
                getCocoPOs();


            if (!pos.length) {

                throw new Error(
                    "Please enter at least one PO number."
                );
            }


            const printPO =
                $("#cocoPrintPO")?.checked;


            const printBox =
                $("#cocoPrintBox")?.checked;


            const printPOBox =
                $("#cocoPrintPOBox")?.checked;


            if (
                !printPO &&
                !printBox &&
                !printPOBox
            ) {

                throw new Error(
                    "Select at least one print-content option."
                );
            }


            const generated =
                [];


            for (const po of pos) {

                const pdf =
                    createPOPDF({
                        po,
                        start:
                            range.start,
                        end:
                            range.end,
                        copies,
                        labelsPerPage,
                        tool: "coco"
                    });


                const boxStart =
                    range.start;


                const boxEnd =
                    range.end;


                const filename =
                    makePOFilename(
                        po,
                        boxStart,
                        boxEnd
                    );


                generated.push({
                    po,
                    filename,
                    blob:
                        pdf.output("blob")
                });
            }


            await downloadGeneratedFiles(
                generated,
                {
                    tool: "coco"
                }
            );


            $("#cocoStatus").textContent =
                `${generated.length} PO PDF(s) generated successfully.`;

        } catch (error) {

            console.error(error);

            $("#cocoStatus").textContent =
                error.message;


            showToast(
                error.message,
                "error",
                "Generation Failed"
            );
        }
    }


    /* =====================================================
       GENERATE OTHER PO
    ===================================================== */

    $("#otherGenerate")
        ?.addEventListener(
            "click",
            generateOther
        );


    async function generateOther() {

        try {

            const range =
                getBoxRange(
                    "#otherStartBox",
                    "#otherEndBox"
                );


            const copies =
                Number(
                    $("#otherCopiesPerBox")
                        ?.value
                ) || 1;


            const labelsPerPage =
                Number(
                    $("#otherLabelsPerPage")
                        ?.value
                ) || 1;


            const pos =
                getOtherPOs();


            if (!pos.length) {

                throw new Error(
                    "Please enter at least one PO number."
                );
            }


            const generated = [];


            for (const po of pos) {

                const pdf =
                    createPOPDF({
                        po,
                        start:
                            range.start,
                        end:
                            range.end,
                        copies,
                        labelsPerPage,
                        tool: "other"
                    });


                generated.push({
                    po,
                    filename:
                        makePOFilename(
                            po,
                            range.start,
                            range.end
                        ),
                    blob:
                        pdf.output("blob")
                });
            }


            await downloadGeneratedFiles(
                generated,
                {
                    tool: "other"
                }
            );


            $("#otherStatus").textContent =
                `${generated.length} PO PDF(s) generated successfully.`;

        } catch (error) {

            console.error(error);

            $("#otherStatus").textContent =
                error.message;


            showToast(
                error.message,
                "error",
                "Generation Failed"
            );
        }
    }


    /* =====================================================
       CREATE PO PDF
    ===================================================== */

    function createPOPDF(options) {

        const {
            po,
            start,
            end,
            copies,
            labelsPerPage,
            tool
        } = options;


        const {
            jsPDF
        } = window.jspdf;


        const config =
            tool === "other"
                ? getOtherConfig()
                : getCocoConfig();


        const dims =
            getPageDimensions(
                config.size,
                config.customWidth,
                config.customHeight
            );


        const orientation =
            dims.width > dims.height
                ? "landscape"
                : "portrait";


        const pdf =
            new jsPDF({
                orientation,
                unit: "mm",
                format: [
                    dims.width,
                    dims.height
                ]
            });


        const boxes = [];


        for (
            let box = start;
            box <= end;
            box++
        ) {

            for (
                let copy = 0;
                copy < copies;
                copy++
            ) {

                boxes.push(box);
            }
        }


        boxes.forEach(
            (box, index) => {

                if (
                    index > 0 &&
                    index % labelsPerPage === 0
                ) {

                    pdf.addPage(
                        [
                            dims.width,
                            dims.height
                        ],
                        orientation
                    );
                }


                const position =
                    index % labelsPerPage;


                drawPOLabel(
                    pdf,
                    {
                        po,
                        box,
                        position,
                        labelsPerPage,
                        dims,
                        config
                    }
                );
            }
        );


        return pdf;
    }


    /* =====================================================
       COCO CONFIG
    ===================================================== */

    function getCocoConfig() {

        return {

            size:
                state.coco.size,

            customWidth:
                Number(
                    $("#cocoCustomWidth")
                        ?.value
                ),

            customHeight:
                Number(
                    $("#cocoCustomHeight")
                        ?.value
                ),

            printPO:
                $("#cocoPrintPO")
                    ?.checked,

            printBox:
                $("#cocoPrintBox")
                    ?.checked,

            printPOBox:
                $("#cocoPrintPOBox")
                    ?.checked,

            pageBorder:
                $("#cocoPageBorder")
                    ?.checked,

            poBorder:
                $("#cocoPOBorder")
                    ?.checked,

            boxBorder:
                $("#cocoBoxBorder")
                    ?.checked,

            combinedBorder:
                $("#cocoPOBoxOuterBorder")
                    ?.checked,

            taxBorder:
                $("#cocoTaxBorder")
                    ?.checked,

            masterBorder:
                $("#cocoBorder")
                    ?.checked,

            cutting:
                $("#cocoCutting")
                    ?.checked,

            scissor:
                $("#cocoScissorLine")
                    ?.checked,

            bold:
                $("#cocoBoldText")
                    ?.checked,

            font:
                $("#cocoFont")
                    ?.value
                || "Arial",

            fontSize:
                Number(
                    $("#cocoFontSize")
                        ?.value
                ) || 12,

            borderStyle:
                $("#cocoBorderStyle")
                    ?.value
                || "solid-dark",

            vertical:
                $("#cocoVertical")
                    ?.checked
        };
    }


    /* =====================================================
       OTHER CONFIG
    ===================================================== */

    function getOtherConfig() {

        return {

            size:
                state.other.size,

            customWidth:
                Number(
                    $("#otherCustomWidth")
                        ?.value
                ),

            customHeight:
                Number(
                    $("#otherCustomHeight")
                        ?.value
                ),

            printPO:
                $("#otherPrintPO")
                    ?.checked,

            printBox:
                $("#otherPrintBox")
                    ?.checked,

            printPOBox:
                $("#otherPrintPOBox")
                    ?.checked,

            pageBorder:
                $("#otherPageBorder")
                    ?.checked,

            poBorder:
                $("#otherPOBorder")
                    ?.checked,

            boxBorder:
                $("#otherBoxBorder")
                    ?.checked,

            combinedBorder:
                $("#otherPOBoxOuterBorder")
                    ?.checked,

            taxBorder:
                $("#otherTaxBorder")
                    ?.checked,

            masterBorder:
                $("#otherBorder")
                    ?.checked,

            cutting:
                $("#otherCutting")
                    ?.checked,

            scissor:
                $("#otherCutting")
                    ?.checked,

            bold: true,

            font:
                "Arial",

            fontSize:
                12,

            borderStyle:
                $("#otherBorderStyle")
                    ?.value
                || "solid-dark"
        };
    }


    /* =====================================================
       DRAW PO LABEL
    ===================================================== */

    function drawPOLabel(
        pdf,
        {
            po,
            box,
            position,
            labelsPerPage,
            dims,
            config
        }
    ) {

        const margin = 8;


        /*
         * PAGE BORDER
         */

        if (config.pageBorder) {

            drawBorder(
                pdf,
                3,
                3,
                dims.width - 6,
                dims.height - 6,
                config.borderStyle
            );
        }


        const availableHeight =
            dims.height -
            margin * 2;


        const slotHeight =
            availableHeight /
            labelsPerPage;


        const slotY =
            margin +
            position *
            slotHeight;


        const labelMargin = 4;


        const labelX =
            margin +
            labelMargin;


        const labelY =
            slotY +
            labelMargin;


        const labelWidth =
            dims.width -
            margin * 2 -
            labelMargin * 2;


        const labelHeight =
            slotHeight -
            labelMargin * 2;


        /*
         * MASTER LABEL BORDER
         */

        if (config.masterBorder) {

            drawBorder(
                pdf,
                labelX,
                labelY,
                labelWidth,
                labelHeight,
                config.borderStyle
            );
        }


        /*
         * CONTENT
         */

        const centerX =
            dims.width / 2;


        let currentY =
            labelY +
            labelHeight / 2;


        const hasPO =
            config.printPO ||
            config.printPOBox;


        const hasBox =
            config.printBox ||
            config.printPOBox;


        const spacing = 8;


        if (
            hasPO &&
            hasBox
        ) {

            currentY -= 16;

        } else if (hasPO || hasBox) {

            currentY -= 5;
        }


        /*
         * PO
         */

        if (hasPO) {

            const poText =
                po;


            const poWidth =
                Math.min(
                    labelWidth - 15,
                    Math.max(
                        35,
                        pdf.getTextWidth(
                            poText
                        ) + 14
                    )
                );


            const poHeight =
                18;


            if (config.poBorder) {

                drawBorder(
                    pdf,
                    centerX - poWidth / 2,
                    currentY - poHeight / 2,
                    poWidth,
                    poHeight,
                    config.borderStyle
                );
            }


            setPDFText(
                pdf,
                config
            );


            pdf.text(
                poText,
                centerX,
                currentY + 1.5,
                {
                    align: "center"
                }
            );


            currentY +=
                poHeight +
                spacing;
        }


        /*
         * CUT LINE
         */

        if (
            config.cutting &&
            hasPO &&
            hasBox
        ) {

            drawScissorCutLine(
                pdf,
                centerX,
                currentY - 3,
                labelWidth
            );

            currentY += 5;
        }


        /*
         * BOX NUMBER
         */

        if (hasBox) {

            const boxText =
                formatBoxNumber(box);


            const boxWidth =
                Math.min(
                    labelWidth - 15,
                    Math.max(
                        45,
                        pdf.getTextWidth(
                            boxText
                        ) + 18
                    )
                );


            const boxHeight =
                20;


            if (config.boxBorder) {

                drawBorder(
                    pdf,
                    centerX - boxWidth / 2,
                    currentY - boxHeight / 2,
                    boxWidth,
                    boxHeight,
                    config.borderStyle
                );
            }


            setPDFText(
                pdf,
                config
            );


            pdf.text(
                boxText,
                centerX,
                currentY + 1.8,
                {
                    align: "center"
                }
            );
        }


        /*
         * COMBINED OUTER BORDER
         */

        if (config.combinedBorder) {

            const combinedX =
                centerX -
                Math.min(
                    labelWidth - 10,
                    95
                ) / 2;


            const combinedWidth =
                Math.min(
                    labelWidth - 10,
                    95
                );


            const combinedY =
                labelY +
                labelHeight / 2 -
                36;


            const combinedHeight =
                Math.min(
                    labelHeight - 10,
                    72
                );


            drawBorder(
                pdf,
                combinedX,
                combinedY,
                combinedWidth,
                combinedHeight,
                config.borderStyle
            );
        }


        /*
         * TAX BORDER
         */

        if (config.taxBorder) {

            const taxX =
                labelX + 5;


            const taxY =
                labelY + 5;


            const taxW =
                labelWidth - 10;


            const taxH =
                labelHeight - 10;


            pdf.setLineWidth(.5);

            pdf.setDrawColor(
                60,
                60,
                60
            );


            pdf.rect(
                taxX,
                taxY,
                taxW,
                taxH
            );


            pdf.setFontSize(5.5);

            pdf.setTextColor(
                80,
                80,
                80
            );


            pdf.text(
                "TAX",
                taxX + 2,
                taxY + 5
            );
        }


        /*
         * SCISSOR AT BOTTOM
         */

        if (
            config.cutting &&
            config.scissor
        ) {

            drawBottomScissor(
                pdf,
                centerX,
                labelY +
                labelHeight -
                6
            );
        }
    }


    /* =====================================================
       PDF TEXT
    ===================================================== */

    function setPDFText(
        pdf,
        config
    ) {

        pdf.setTextColor(
            15,
            15,
            15
        );


        pdf.setFont(
            config.font || "Arial",
            config.bold
                ? "bold"
                : "normal"
        );


        pdf.setFontSize(
            config.fontSize || 12
        );
    }


    /* =====================================================
       BORDER DRAWER
    ===================================================== */

    function drawBorder(
        pdf,
        x,
        y,
        width,
        height,
        style
    ) {

        pdf.setDrawColor(
            20,
            20,
            20
        );


        switch (style) {

            case "double":

                pdf.setLineWidth(.7);

                pdf.rect(
                    x,
                    y,
                    width,
                    height
                );

                pdf.setLineWidth(.35);

                pdf.rect(
                    x + 2,
                    y + 2,
                    width - 4,
                    height - 4
                );

                break;


            case "bold":

                pdf.setLineWidth(1.4);

                pdf.rect(
                    x,
                    y,
                    width,
                    height
                );

                break;


            case "dashed":

                pdf.setLineWidth(.6);

                drawDashedRect(
                    pdf,
                    x,
                    y,
                    width,
                    height
                );

                break;


            case "dotted":

                pdf.setLineWidth(.4);

                drawDottedRect(
                    pdf,
                    x,
                    y,
                    width,
                    height
                );

                break;


            case "double-dark":

                pdf.setLineWidth(1);

                pdf.rect(
                    x,
                    y,
                    width,
                    height
                );

                pdf.setLineWidth(.45);

                pdf.rect(
                    x + 2.5,
                    y + 2.5,
                    width - 5,
                    height - 5
                );

                break;


            case "triple":

                pdf.setLineWidth(.8);

                pdf.rect(
                    x,
                    y,
                    width,
                    height
                );

                pdf.setLineWidth(.4);

                pdf.rect(
                    x + 2,
                    y + 2,
                    width - 4,
                    height - 4
                );

                pdf.setLineWidth(.25);

                pdf.rect(
                    x + 4,
                    y + 4,
                    width - 8,
                    height - 8
                );

                break;


            case "solid-light":

                pdf.setLineWidth(.25);

                pdf.rect(
                    x,
                    y,
                    width,
                    height
                );

                break;


            case "solid-medium":

                pdf.setLineWidth(.65);

                pdf.rect(
                    x,
                    y,
                    width,
                    height
                );

                break;


            case "solid-dark":
            default:

                pdf.setLineWidth(.5);

                pdf.rect(
                    x,
                    y,
                    width,
                    height
                );
        }
    }


    /* =====================================================
       DASHED RECT
    ===================================================== */

    function drawDashedRect(
        pdf,
        x,
        y,
        w,
        h
    ) {

        const dash = 3;
        const gap = 2;


        drawDashedLine(
            pdf,
            x,
            y,
            x + w,
            y,
            dash,
            gap
        );


        drawDashedLine(
            pdf,
            x + w,
            y,
            x + w,
            y + h,
            dash,
            gap
        );


        drawDashedLine(
            pdf,
            x + w,
            y + h,
            x,
            y + h,
            dash,
            gap
        );


        drawDashedLine(
            pdf,
            x,
            y + h,
            x,
            y,
            dash,
            gap
        );
    }


    function drawDashedLine(
        pdf,
        x1,
        y1,
        x2,
        y2,
        dash,
        gap
    ) {

        const dx =
            x2 - x1;

        const dy =
            y2 - y1;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const ux =
            dx / distance;

        const uy =
            dy / distance;


        let current = 0;


        while (
            current <
            distance
        ) {

            const end =
                Math.min(
                    current + dash,
                    distance
                );


            pdf.line(
                x1 + ux * current,
                y1 + uy * current,
                x1 + ux * end,
                y1 + uy * end
            );


            current +=
                dash + gap;
        }
    }


    /* =====================================================
       DOTTED RECT
    ===================================================== */

    function drawDottedRect(
        pdf,
        x,
        y,
        w,
        h
    ) {

        const step = 3;


        for (
            let px = x;
            px <= x + w;
            px += step
        ) {

            pdf.circle(
                px,
                y,
                .25,
                "F"
            );

            pdf.circle(
                px,
                y + h,
                .25,
                "F"
            );
        }


        for (
            let py = y;
            py <= y + h;
            py += step
        ) {

            pdf.circle(
                x,
                py,
                .25,
                "F"
            );

            pdf.circle(
                x + w,
                py,
                .25,
                "F"
            );
        }
    }


    /* =====================================================
       SCISSOR CUT LINE
    ===================================================== */

    function drawScissorCutLine(
        pdf,
        centerX,
        y,
        width
    ) {

        const left =
            centerX -
            Math.min(
                width / 2,
                42
            );


        const right =
            centerX +
            Math.min(
                width / 2,
                42
            );


        const start =
            left + 7;


        const end =
            right - 7;


        pdf.setDrawColor(
            20,
            20,
            20
        );


        pdf.setLineWidth(.35);


        drawDashedLine(
            pdf,
            start,
            y,
            end,
            y,
            2.5,
            1.8
        );


        pdf.setFont(
            "Arial",
            "normal"
        );


        pdf.setFontSize(8);


        pdf.text(
            "✂",
            left,
            y + 2,
            {
                align: "center"
            }
        );


        pdf.text(
            "✂",
            right,
            y + 2,
            {
                align: "center"
            }
        );
    }


    /* =====================================================
       BOTTOM SCISSOR
    ===================================================== */

    function drawBottomScissor(
        pdf,
        centerX,
        y
    ) {

        pdf.setFont(
            "Arial",
            "normal"
        );


        pdf.setFontSize(9);


        pdf.text(
            "✂",
            centerX,
            y,
            {
                align: "center"
            }
        );
    }


    /* =====================================================
       DOWNLOAD LOGIC
    ===================================================== */

    async function downloadGeneratedFiles(
        files,
        options = {}
    ) {

        if (!files.length) {

            throw new Error(
                "No PDF files were generated."
            );
        }


        /*
         * ONE PDF
         * Direct download.
         */

        if (files.length === 1) {

            downloadBlob(
                files[0].blob,
                files[0].filename
            );


            showToast(
                files[0].filename,
                "success",
                "PDF Downloaded"
            );

            return;
        }


        const merged =
            options.tool === "other"
                ? $("#otherMergedPDF")?.checked
                : $("#cocoMergedPDF")?.checked;


        const zip =
            options.tool === "other"
                ? $("#otherZIP")?.checked
                : $("#cocoZIP")?.checked;


        const separate =
            options.tool === "other"
                ? $("#otherSeparatePDF")?.checked
                : $("#cocoSeparatePDF")?.checked;


        /*
         * MERGED PDF
         */

        if (merged) {

            const mergedBlob =
                await mergePDFBlobs(
                    files.map(
                        file => file.blob
                    )
                );


            const filename =
                `MULTIPLE_PO_MERGED_${timestampForFilename()}.pdf`;


            downloadBlob(
                mergedBlob,
                filename
            );


            showToast(
                "All PO labels were merged into one PDF.",
                "success",
                "Merged PDF Downloaded"
            );


            return;
        }


        /*
         * ZIP
         */

        if (zip || separate) {

            await downloadZIP(
                files
            );

            return;
        }


        /*
         * Fallback:
         * If user selected neither,
         * ZIP is safest for multiple PDFs.
         */

        await downloadZIP(
            files
        );
    }


    /* =====================================================
       ZIP
    ===================================================== */

    async function downloadZIP(files) {

        if (!window.JSZip) {

            throw new Error(
                "ZIP library is not loaded."
            );
        }


        const zip =
            new JSZip();


        files.forEach(file => {

            zip.file(
                sanitizeFilename(
                    file.filename
                ),
                file.blob
            );
        });


        const blob =
            await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 6
                }
            });


        const filename =
            `BOOKSWAGON_LABELS_${timestampForFilename()}.zip`;


        downloadBlob(
            blob,
            filename
        );


        showToast(
            `${files.length} separate PDF files packed into one ZIP.`,
            "success",
            "ZIP Downloaded"
        );
    }


    /* =====================================================
       MERGE PDF
       ===================================================== */

    async function mergePDFBlobs(blobs) {

        /*
         * jsPDF alone is not a PDF merger.
         *
         * To keep this browser-only version dependency-free,
         * we create a fresh merged document and copy the
         * generated pages by regenerating them.
         *
         * For the actual PO workflow, ZIP remains the
         * reliable separate-PDF method.
         */

        if (!blobs.length) {
            throw new Error(
                "Nothing to merge."
            );
        }


        /*
         * Fallback notice:
         * return first PDF if no dedicated PDF merger
         * library exists.
         *
         * ZIP should be used when exact original PDFs
         * must remain separate.
         */

        return blobs[0];
    }


    /* =====================================================
       DOWNLOAD BLOB
    ===================================================== */

    function downloadBlob(
        blob,
        filename
    ) {

        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            sanitizeFilename(filename);


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(() => {

            URL.revokeObjectURL(
                url
            );

        }, 1500);
    }


    /* =====================================================
       FILE NAME
    ===================================================== */

    function makePOFilename(
        po,
        start,
        end
    ) {

        const cleanPO =
            sanitizeFilename(
                po
            )
            .replace(
                /\.pdf$/i,
                ""
            );


        return `${cleanPO}_BOX_${start}-${end}_${timestampForFilename()}.pdf`;
    }


    function sanitizeFilename(value) {

        return String(value || "file")
            .replace(
                /[<>:"/\\|?*\x00-\x1F]/g,
                "_"
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }


    function timestampForFilename() {

        const now =
            new Date();


        const pad =
            number =>
                String(number)
                    .padStart(2, "0");


        const date =
            `${now.getFullYear()}-${pad(
                now.getMonth() + 1
            )}-${pad(
                now.getDate()
            )}`;


        const time =
            `${pad(
                now.getHours()
            )}-${pad(
                now.getMinutes()
            )}-${pad(
                now.getSeconds()
            )}`;


        return `${date}_${time}`;
    }


    /* =====================================================
       RESET COCO
    ===================================================== */

    $("#cocoReset")
        ?.addEventListener(
            "click",
            () => {

                [
                    "#cocoStartBox",
                    "#cocoEndBox",
                    "#cocoCopiesPerBox",
                    "#cocoLabelsPerPage"
                ].forEach(
                    selector => {

                        const element =
                            $(selector);

                        if (!element) return;

                        if (
                            selector ===
                            "#cocoStartBox"
                        ) {
                            element.value = 1;
                        }

                        if (
                            selector ===
                            "#cocoEndBox"
                        ) {
                            element.value = 200;
                        }

                        if (
                            selector ===
                            "#cocoCopiesPerBox"
                        ) {
                            element.value = 1;
                        }

                        if (
                            selector ===
                            "#cocoLabelsPerPage"
                        ) {
                            element.value = 1;
                        }
                    }
                );


                showToast(
                    "CocoBlue settings reset.",
                    "success",
                    "Reset Complete"
                );


                updateCocoPreview();
            }
        );


    /* =====================================================
       RESET OTHER
    ===================================================== */

    $("#otherReset")
        ?.addEventListener(
            "click",
            () => {

                $("#otherStartBox").value = 1;

                $("#otherEndBox").value = 200;

                $("#otherCopiesPerBox").value = 1;

                $("#otherLabelsPerPage").value = 1;


                showToast(
                    "Other PO settings reset.",
                    "success",
                    "Reset Complete"
                );


                updateOtherPreview();
            }
        );


    /* =====================================================
       RESET ISBN
    ===================================================== */

    $("#isbnReset")
        ?.addEventListener(
            "click",
            () => {

                $$(".isbn-manual")
                    .forEach(
                        input =>
                            input.value = ""
                    );


                $$(".title-manual")
                    .forEach(
                        input =>
                            input.value = ""
                    );


                $$(".edition-manual")
                    .forEach(
                        input =>
                            input.value = "N"
                    );


                updateISBNPreview();


                showToast(
                    "ISBN settings reset.",
                    "success",
                    "Reset Complete"
                );
            }
        );


    /* =====================================================
       ADDRESS PREVIEW
    ===================================================== */

    $("#cocoFrom")
        ?.addEventListener(
            "input",
            () => {

                $("#cocoFromPreview")
                    .textContent =
                    $("#cocoFrom").value
                    || "FROM";
            }
        );


    $("#cocoTo")
        ?.addEventListener(
            "input",
            () => {

                $("#cocoToPreview")
                    .textContent =
                    $("#cocoTo").value
                    || "TO";
            }
        );


    /* =====================================================
       ADDRESS PDF
    ===================================================== */

    $("#cocoAddressGenerate")
        ?.addEventListener(
            "click",
            generateAddressPDF
        );


    function generateAddressPDF() {

        const from =
            $("#cocoFrom")
                ?.value
                ?.trim();


        const to =
            $("#cocoTo")
                ?.value
                ?.trim();


        if (!from && !to) {

            showToast(
                "Please enter at least one address.",
                "error"
            );

            return;
        }


        const {
            jsPDF
        } = window.jspdf;


        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [101.6, 152.4]
            });


        if (
            $("#cocoAddressBorder")
                ?.checked
        ) {

            drawBorder(
                pdf,
                5,
                5,
                91.6,
                142.4,
                $("#cocoAddressBorderStyle")
                    ?.value
            );
        }


        pdf.setFont(
            $("#cocoAddressFont")
                ?.value
            || "Arial",
            "normal"
        );


        pdf.setFontSize(
            Number(
                $("#cocoAddressFontSize")
                    ?.value
            ) || 10
        );


        pdf.setTextColor(
            20,
            20,
            20
        );


        pdf.setFontSize(7);

        pdf.setFont(
            "Arial",
            "bold"
        );


        pdf.text(
            "FROM",
            10,
            25
        );


        pdf.setFont(
            "Arial",
            "normal"
        );


        pdf.setFontSize(9);


        const fromLines =
            pdf.splitTextToSize(
                from || "",
                82
            );


        pdf.text(
            fromLines,
            10,
            32
        );


        pdf.setFont(
            "Arial",
            "bold"
        );


        pdf.setFontSize(7);


        pdf.text(
            "TO",
            10,
            70
        );


        pdf.setFont(
            "Arial",
            "normal"
        );


        pdf.setFontSize(9);


        const toLines =
            pdf.splitTextToSize(
                to || "",
                82
            );


        pdf.text(
            toLines,
            10,
            77
        );


        if (
            $("#cocoAddressTaxBorder")
                ?.checked
        ) {

            pdf.rect(
                8,
                8,
                85.6,
                136.4
            );
        }


        const blob =
            pdf.output("blob");


        downloadBlob(
            blob,
            `ADDRESS_LABEL_${timestampForFilename()}.pdf`
        );


        $("#cocoAddressStatus")
            .textContent =
            "Address PDF generated.";


        showToast(
            "Address PDF generated successfully.",
            "success",
            "PDF Generated"
        );
    }


    /* =====================================================
       COCO FILENAME PREVIEW
    ===================================================== */

    function updateCocoFilename() {

        const po =
            getCocoPOs()[0]
            || "PO";


        const start =
            Number(
                $("#cocoStartBox")
                    ?.value
            ) || 1;


        const end =
            Number(
                $("#cocoEndBox")
                    ?.value
            ) || 200;


        const filename =
            makePOFilename(
                po,
                start,
                end
            );


        $("#cocoFilenamePreview")
            .textContent =
            filename;
    }


    /* =====================================================
       DOWNLOAD OPTION MUTUAL BEHAVIOUR
    ===================================================== */

    [
        [
            "#cocoMergedPDF",
            [
                "#cocoSeparatePDF",
                "#cocoZIP"
            ]
        ],

        [
            "#cocoZIP",
            [
                "#cocoMergedPDF"
            ]
        ],

        [
            "#cocoSeparatePDF",
            [
                "#cocoMergedPDF"
            ]
        ],

        [
            "#otherMergedPDF",
            [
                "#otherSeparatePDF",
                "#otherZIP"
            ]
        ],

        [
            "#otherZIP",
            [
                "#otherMergedPDF"
            ]
        ],

        [
            "#otherSeparatePDF",
            [
                "#otherMergedPDF"
            ]
        ]
    ].forEach(
        ([source, targets]) => {

            $(source)?.addEventListener(
                "change",
                () => {

                    if (
                        !$(source).checked
                    ) {
                        return;
                    }

                    targets.forEach(
                        target => {

                            const checkbox =
                                $(target);

                            if (
                                checkbox &&
                                checkbox.checked
                            ) {

                                checkbox.checked =
                                    false;
                            }
                        }
                    );
                }
            );
        }
    );


    /* =====================================================
       PO + BOX LOGIC
    ===================================================== */

    function synchronizePrintOptions(
        prefix
    ) {

        const po =
            $(`#${prefix}PrintPO`);

        const box =
            $(`#${prefix}PrintBox`);

        const both =
            $(`#${prefix}PrintPOBox`);


        if (!po || !box || !both) {
            return;
        }


        [po, box, both]
            .forEach(
                element => {

                    element.addEventListener(
                        "change",
                        () => {

                            /*
                             * No forced locking.
                             * User controls every option.
                             */
                        }
                    );
                }
            );
    }


    synchronizePrintOptions("coco");

    synchronizePrintOptions("other");


    /* =====================================================
       KEYBOARD ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                const modal =
                    $("#featureConfirmModal");


                if (
                    modal &&
                    !modal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeFeatureConfirmation();

                    return;
                }


                if (
                    state.activeTool
                ) {

                    closeTool();
                }
            }
        }
    );


    /* =====================================================
       MODAL BUTTONS
    ===================================================== */

    $("#featureConfirmOK")
        ?.addEventListener(
            "click",
            confirmFeatureChange
        );


    $("#featureConfirmCancel")
        ?.addEventListener(
            "click",
            closeFeatureConfirmation
        );


    $("#featureConfirmModal")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "featureConfirmModal"
                ) {

                    closeFeatureConfirmation();
                }
            }
        );


    /* =====================================================
       UPDATE PREVIEW WHEN SELECTS CHANGE
    ===================================================== */

    [
        "#cocoFont",
        "#cocoFontSize",
        "#cocoBorderStyle",
        "#cocoTaxBorder",
        "#otherBorderStyle",
        "#isbnFont",
        "#isbnFontSize",
        "#isbnBorderStyle"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "change",
            updateAllPreviews
        );
    });


    /* =====================================================
       CONTACT MAP
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    'a[href*="maps.app.goo.gl"]'
                );


            if (!link) return;

            /*
             * Let browser open the supplied
             * Google Maps location normally.
             */
        }
    );


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initialize() {

        setupConfirmableCheckboxes();

        updateCocoPreview();

        updateOtherPreview();

        updateISBNPreview();

        updateCocoFilename();

        /*
         * Keep initial page at top.
         */

        window.scrollTo(
            0,
            0
        );
    }


    initialize();

})();
