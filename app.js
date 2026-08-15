/* =========================================================
   BOOKSWAGON LABEL STUDIO
   app.js
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];


    const escapeHTML = (value) => {
        const div = document.createElement("div");
        div.textContent = value ?? "";
        return div.innerHTML;
    };


    const sleep = (ms) =>
        new Promise(resolve => setTimeout(resolve, ms));


    /* =====================================================
       TOAST
    ===================================================== */

    const toastContainer = $("#toastContainer");


    function showToast(
        type = "info",
        title = "Notice",
        message = ""
    ) {
        if (!toastContainer) return;

        const toast = document.createElement("div");

        toast.className = `toast ${type}`;

        const icon =
            type === "success"
                ? "✓"
                : type === "error"
                    ? "!"
                    : "i";

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>

            <div class="toast-content">
                <strong>${escapeHTML(title)}</strong>
                <span>${escapeHTML(message)}</span>
            </div>
        `;

        toastContainer.appendChild(toast);


        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(20px)";

            setTimeout(() => {
                toast.remove();
            }, 200);

        }, 3500);
    }


    /* =====================================================
       CONFIRMATION MODAL
    ===================================================== */

    const confirmModal = $("#featureConfirmModal");
    const confirmTitle = $("#featureConfirmTitle");
    const confirmMessage = $("#featureConfirmMessage");

    const confirmCancel = $("#featureConfirmCancel");
    const confirmOK = $("#featureConfirmOK");


    let pendingCheckbox = null;
    let pendingDesiredState = null;


    function closeConfirmation() {
        if (!confirmModal) return;

        confirmModal.classList.add("hidden");

        pendingCheckbox = null;
        pendingDesiredState = null;
    }


    function openConfirmation(checkbox, desiredState) {
        pendingCheckbox = checkbox;
        pendingDesiredState = desiredState;

        const label =
            checkbox.closest(".check-row")
                ?.querySelector("span")
                ?.textContent
                ?.trim()
            || "this feature";

        if (confirmTitle) {
            confirmTitle.textContent =
                desiredState
                    ? "Confirm Enable"
                    : "Confirm Disable";
        }

        if (confirmMessage) {
            confirmMessage.textContent =
                desiredState
                    ? `Are you sure you want to enable "${label}"?`
                    : `Are you sure you want to disable "${label}"?`;
        }

        if (confirmOK) {
            confirmOK.textContent =
                desiredState
                    ? "Yes, Enable"
                    : "Yes, Disable";
        }

        if (confirmModal) {
            confirmModal.classList.remove("hidden");
        }
    }


    function setupCheckboxConfirmations() {
        $$(
            'input[type="checkbox"]'
        ).forEach(checkbox => {

            checkbox.dataset.confirmReady = "true";

            checkbox.addEventListener("click", event => {

                /*
                 * Prevent the native checkbox state from changing.
                 * The state changes only after confirmation.
                 */

                event.preventDefault();

                const desiredState =
                    !checkbox.checked;

                openConfirmation(
                    checkbox,
                    desiredState
                );
            });
        });
    }


    if (confirmCancel) {
        confirmCancel.addEventListener(
            "click",
            closeConfirmation
        );
    }


    if (confirmOK) {
        confirmOK.addEventListener("click", () => {

            if (
                !pendingCheckbox ||
                pendingDesiredState === null
            ) {
                closeConfirmation();
                return;
            }


            const checkbox = pendingCheckbox;
            const newState = pendingDesiredState;


            checkbox.checked = newState;


            const label =
                checkbox.closest(".check-row")
                    ?.querySelector("span")
                    ?.textContent
                    ?.trim()
                || "Feature";


            closeConfirmation();


            if (newState) {

                showToast(
                    "success",
                    "Feature Enabled",
                    `${label} is now enabled.`
                );

            } else {

                showToast(
                    "success",
                    "Feature Disabled",
                    `${label} is now disabled.`
                );
            }


            updateAllPreviews();
        });
    }


    if (confirmModal) {

        confirmModal.addEventListener(
            "click",
            event => {

                if (event.target === confirmModal) {
                    closeConfirmation();
                }

            }
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                confirmModal &&
                !confirmModal.classList.contains("hidden")
            ) {
                closeConfirmation();
            }

        }
    );


    /* =====================================================
       TOOL NAVIGATION
    ===================================================== */

    const workspaces = $$(".tool-workspace");


    function closeAllWorkspaces() {

        workspaces.forEach(workspace => {
            workspace.classList.remove("active");
        });

        const workspaceSection =
            $("#workspace");

        if (workspaceSection) {
            workspaceSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }


    $$("[data-open-tool]").forEach(button => {

        button.addEventListener("click", () => {

            const tool =
                button.dataset.openTool;

            closeAllWorkspaces();


            const workspace =
                $(`#${tool}Workspace`);

            if (!workspace) return;

            workspace.classList.add("active");


            setTimeout(() => {

                workspace.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 30);
        });
    });


    $$("[data-close-tool]").forEach(button => {

        button.addEventListener("click", () => {

            closeAllWorkspaces();

            $("#tools")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

    });


    /* =====================================================
       GENERIC NUMBER PARSER
       IMPORTANT:
       NO 200 LIMIT
    ===================================================== */

    function getPositiveInteger(
        element,
        fallback = 1
    ) {

        if (!element) {
            return fallback;
        }

        const raw =
            String(element.value ?? "")
                .trim();

        if (!raw) {
            return fallback;
        }

        const value =
            Number(raw);

        if (
            !Number.isFinite(value) ||
            !Number.isInteger(value) ||
            value < 1
        ) {
            return fallback;
        }

        /*
         * Deliberately NO:
         *
         * if (value > 200) ...
         *
         * This fixes the old "range must be between 1 to 200"
         * problem.
         */

        return value;
    }


    function validateRange(startElement, endElement) {

        const start =
            getPositiveInteger(
                startElement,
                1
            );

        const end =
            getPositiveInteger(
                endElement,
                start
            );


        if (end < start) {

            showToast(
                "error",
                "Invalid Box Range",
                "End Box Number must be greater than or equal to Start Box Number."
            );

            return null;
        }


        return {
            start,
            end
        };
    }


    /* =====================================================
       PO PARSING
    ===================================================== */

    function cleanPO(value) {

        return String(value ?? "")
            .trim()
            .replace(/\s+/g, " ");
    }


    function parseCommaSeparatedPO(value) {

        return String(value ?? "")
            .split(",")
            .map(cleanPO)
            .filter(Boolean);
    }


    function collectPOsFromInputs(selector) {

        return $$(selector)
            .map(input => cleanPO(input.value))
            .filter(Boolean);
    }


    function getUniquePOs(values) {

        const seen = new Set();
        const result = [];

        values.forEach(value => {

            const normalized =
                value.toUpperCase();

            if (!seen.has(normalized)) {

                seen.add(normalized);
                result.push(value);
            }

        });

        return result;
    }


    /* =====================================================
       EXCEL READER
    ===================================================== */

    async function readExcelPOs(file) {

        if (!file) {
            return [];
        }

        if (
            typeof XLSX === "undefined"
        ) {

            showToast(
                "error",
                "Excel Library Missing",
                "The Excel library could not be loaded."
            );

            return [];
        }


        try {

            const buffer =
                await file.arrayBuffer();

            const workbook =
                XLSX.read(
                    buffer,
                    { type: "array" }
                );


            const firstSheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];


            if (!firstSheet) {
                return [];
            }


            const rows =
                XLSX.utils.sheet_to_json(
                    firstSheet,
                    {
                        header: 1,
                        defval: ""
                    }
                );


            const values = [];


            rows.forEach(row => {

                if (!Array.isArray(row)) {
                    return;
                }


                const firstNonEmpty =
                    row.find(
                        cell =>
                            String(cell).trim()
                    );


                if (
                    firstNonEmpty !== undefined &&
                    String(firstNonEmpty).trim()
                ) {
                    values.push(
                        cleanPO(firstNonEmpty)
                    );
                }
            });


            return getUniquePOs(values);

        } catch (error) {

            console.error(error);

            showToast(
                "error",
                "Excel Error",
                "Unable to read the selected Excel file."
            );

            return [];
        }
    }


    /* =====================================================
       INPUT MODE — COCOBLUE
    ===================================================== */

    function setCocoInputMode(mode) {

        const manual = $("#cocoManualArea");
        const comma = $("#cocoCommaArea");
        const excel = $("#cocoExcelArea");


        manual?.classList.add("hidden");
        comma?.classList.add("hidden");
        excel?.classList.add("hidden");


        if (mode === "manual") {
            manual?.classList.remove("hidden");
        }

        if (mode === "comma") {
            comma?.classList.remove("hidden");
        }

        if (mode === "excel") {
            excel?.classList.remove("hidden");
        }


        $$("[data-coco-input]").forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.cocoInput === mode
            );

        });


        updateCocoPreview();
    }


    $$("[data-coco-input]").forEach(button => {

        button.addEventListener("click", () => {

            setCocoInputMode(
                button.dataset.cocoInput
            );

        });

    });


    let cocoInputMode = "manual";


    /* =====================================================
       COCOBLUE EXCEL
    ===================================================== */

    $("#cocoExcel")?.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];

            const status =
                $("#cocoExcelStatus");


            if (!file) {

                if (status) {
                    status.textContent =
                        "No file selected.";
                }

                return;
            }


            if (status) {
                status.textContent =
                    `Reading ${file.name}...`;
            }


            const values =
                await readExcelPOs(file);


            /*
             * Fill the first 20 PO fields.
             */

            const fields =
                $$(".coco-po");


            fields.forEach((field, index) => {

                field.value =
                    values[index] || "";

            });


            if (status) {

                status.textContent =
                    values.length
                        ? `${Math.min(values.length, 20)} PO number(s) loaded.`
                        : "No PO numbers found.";
            }


            updateCocoPreview();
        }
    );


    /* =====================================================
       INPUT MODE — OTHER PO
    ===================================================== */

    function setOtherInputMode(mode) {

        $("#otherManualArea")
            ?.classList.toggle(
                "hidden",
                mode !== "manual"
            );


        $("#otherCommaArea")
            ?.classList.toggle(
                "hidden",
                mode !== "comma"
            );


        $("#otherExcelArea")
            ?.classList.toggle(
                "hidden",
                mode !== "excel"
            );


        $$("[data-other-input]").forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.otherInput === mode
            );

        });


        updateOtherPreview();
    }


    $$("[data-other-input]").forEach(button => {

        button.addEventListener("click", () => {

            setOtherInputMode(
                button.dataset.otherInput
            );

        });

    });


    $("#otherExcel")?.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];

            const status =
                $("#otherExcelStatus");


            if (!file) {

                if (status) {
                    status.textContent =
                        "No file selected.";
                }

                return;
            }


            const values =
                await readExcelPOs(file);


            const fields =
                $$(".other-po");


            fields.forEach((field, index) => {

                field.value =
                    values[index] || "";

            });


            if (status) {

                status.textContent =
                    values.length
                        ? `${Math.min(values.length, 20)} PO number(s) loaded.`
                        : "No PO numbers found.";
            }


            updateOtherPreview();
        }
    );


    /* =====================================================
       GET COCOBLUE POs
    ===================================================== */

    function getCocoPOs() {

        let values = [];


        if (
            !$("#cocoCommaArea")
                ?.classList.contains("hidden")
        ) {

            values =
                parseCommaSeparatedPO(
                    $("#cocoCommaPO")?.value
                );

        } else {

            values =
                collectPOsFromInputs(
                    ".coco-po"
                );
        }


        return getUniquePOs(values);
    }


    /* =====================================================
       GET OTHER POs
    ===================================================== */

    function getOtherPOs() {

        if (
            !$("#otherCommaArea")
                ?.classList.contains("hidden")
        ) {

            return getUniquePOs(
                parseCommaSeparatedPO(
                    $("#otherCommaPO")?.value
                )
            );
        }


        return getUniquePOs(
            collectPOsFromInputs(
                ".other-po"
            )
        );
    }


    /* =====================================================
       PRINT MODE
    ===================================================== */

    function getPrintMode(
        poCheckbox,
        boxCheckbox,
        poBoxCheckbox
    ) {

        const po =
            poCheckbox?.checked;

        const box =
            boxCheckbox?.checked;

        const both =
            poBoxCheckbox?.checked;


        if (both) {
            return "po-box";
        }

        if (po && !box) {
            return "po";
        }

        if (box && !po) {
            return "box";
        }

        if (po && box) {
            return "po-box";
        }

        return "none";
    }


    /* =====================================================
       FORMAT BOX NUMBER
    ===================================================== */

    function formatBoxNumber(
        number
    ) {

        return `BOX NO. ${number}`;
    }


    /* =====================================================
       LABEL CONTENT
    ===================================================== */

    function createLabelHTML(
        po,
        box,
        options = {}
    ) {

        const {
            printMode = "po-box",
            poBorder = true,
            boxBorder = true,
            outerBorder = false,
            cutting = true,
            scissor = true,
            bold = true
        } = options;


        const labelClass = [
            "dynamic-label-preview",

            outerBorder
                ? "has-outer-border"
                : ""
        ]
            .filter(Boolean)
            .join(" ");


        let content = "";


        if (
            printMode === "po" ||
            printMode === "po-box"
        ) {

            content += `
                <strong
                    class="${poBorder ? "preview-item-border" : ""}"
                >
                    ${escapeHTML(po)}
                </strong>
            `;
        }


        if (
            printMode === "po-box" &&
            cutting
        ) {

            content += `
                <div class="preview-dotted-line">
                    ${scissor ? "· · · · · ✂ · · · · ·" : "· · · · · · · · · ·"}
                </div>
            `;
        }


        if (
            printMode === "box" ||
            printMode === "po-box"
        ) {

            content += `
                <div
                    class="preview-box-number ${boxBorder ? "preview-item-border" : ""}"
                >
                    ${escapeHTML(
                        formatBoxNumber(box)
                    )}
                </div>
            `;
        }


        if (
            !content.trim()
        ) {

            content = `
                <div class="preview-empty">
                    No print content selected
                </div>
            `;
        }


        return `
            <div
                class="${labelClass} ${bold ? "bold-label" : ""}"
            >
                ${content}
            </div>
        `;
    }


    /* =====================================================
       COCOBLUE PREVIEW
    ===================================================== */

    function updateCocoPreview() {

        const range =
            validateRange(
                $("#cocoStartBox"),
                $("#cocoEndBox")
            );


        if (!range) {
            return;
        }


        const poList =
            getCocoPOs();


        const samplePO =
            poList[0] ||
            "BWG 123";


        const mode =
            getPrintMode(
                $("#cocoPrintPO"),
                $("#cocoPrintBox"),
                $("#cocoPrintPOBox")
            );


        const page =
            $("#cocoPreviewPage");

        const preview =
            $("#cocoPreviewLabel");


        if (!page || !preview) {
            return;
        }


        const pageBorder =
            $("#cocoPageBorder")?.checked;


        page.style.border =
            pageBorder
                ? "1.5px solid #111827"
                : "0";


        const html =
            createLabelHTML(
                samplePO,
                range.start,
                {
                    printMode: mode,
                    poBorder:
                        $("#cocoPOBorder")?.checked,
                    boxBorder:
                        $("#cocoBoxBorder")?.checked,
                    outerBorder:
                        $("#cocoPOBoxOuterBorder")?.checked ||
                        $("#cocoBorder")?.checked,
                    cutting:
                        $("#cocoCutting")?.checked,
                    scissor:
                        $("#cocoScissorLine")?.checked,
                    bold:
                        $("#cocoBoldText")?.checked
                }
            );


        preview.outerHTML =
            html.replace(
                "dynamic-label-preview",
                "dynamic-label-preview"
            );


        const updatedPreview =
            $("#cocoPreviewLabel");


        if (updatedPreview) {

            const borderStyle =
                $("#cocoBorderStyle")?.value;

            updatedPreview.style.border =
                getBorderStyleCSS(
                    borderStyle
                );
        }


        const summary =
            $("#cocoBoxSummary");

        if (summary) {

            summary.textContent =
                `${range.start}–${range.end}`;
        }


        const filename =
            $("#cocoFilenamePreview");


        if (filename) {

            filename.textContent =
                `PO_BOX_${range.start}-${range.end}.pdf`;
        }


        const output =
            $("#cocoSummary");

        if (output) {

            output.textContent =
                poList.length
                    ? `${poList.length} PO(s)`
                    : "Ready";
        }
    }


    /* =====================================================
       OTHER PREVIEW
    ===================================================== */

    function updateOtherPreview() {

        const range =
            validateRange(
                $("#otherStartBox"),
                $("#otherEndBox")
            );


        if (!range) {
            return;
        }


        const poList =
            getOtherPOs();


        const samplePO =
            poList[0] ||
            "BWG 123";


        const mode =
            getPrintMode(
                $("#otherPrintPO"),
                $("#otherPrintBox"),
                $("#otherPrintPOBox")
            );


        const preview =
            $("#otherPreviewPage");


        if (!preview) {
            return;
        }


        preview.innerHTML =
            createLabelHTML(
                samplePO,
                range.start,
                {
                    printMode: mode,
                    poBorder:
                        $("#otherPOBorder")?.checked,
                    boxBorder:
                        $("#otherBoxBorder")?.checked,
                    outerBorder:
                        $("#otherPOBoxOuterBorder")?.checked ||
                        $("#otherBorder")?.checked,
                    cutting:
                        $("#otherCutting")?.checked,
                    scissor: true,
                    bold: true
                }
            );


        const boxSummary =
            $("#otherBoxSummary");

        if (boxSummary) {

            boxSummary.textContent =
                `${range.start}–${range.end}`;
        }
    }


    /* =====================================================
       SBMO PREVIEW
    ===================================================== */

    function updateSBMOPreview() {

        const start =
            getPositiveInteger(
                $("#sbmoStartBox"),
                1
            );


        const preview =
            $("#sbmoWorkspace .dynamic-page-preview");


        if (!preview) {
            return;
        }


        const po =
            collectPOsFromInputs(
                ".sbmo-po"
            )[0] ||
            parseCommaSeparatedPO(
                $("#sbmoCommaPO")?.value
            )[0] ||
            "BWG 123";


        const mode =
            getPrintMode(
                $("#sbmoPrintPO"),
                $("#sbmoPrintBox"),
                $("#sbmoPrintPOBox")
            );


        preview.innerHTML =
            createLabelHTML(
                po,
                start,
                {
                    printMode: mode,
                    poBorder:
                        $("#sbmoPOBorder")?.checked,
                    boxBorder:
                        $("#sbmoBoxBorder")?.checked,
                    outerBorder: false,
                    cutting:
                        $("#sbmoCutting")?.checked,
                    scissor: true,
                    bold: true
                }
            );
    }


    /* =====================================================
       BORDER STYLE
    ===================================================== */

    function getBorderStyleCSS(style) {

        switch (style) {

            case "double":
                return "3px double #111827";

            case "double-dark":
                return "4px double #111827";

            case "dashed":
                return "2px dashed #111827";

            case "dotted":
                return "2px dotted #111827";

            case "bold":
                return "4px solid #111827";

            case "triple":
                return "5px double #111827";

            case "solid-light":
                return "1px solid #667085";

            case "solid-medium":
                return "2px solid #111827";

            case "solid-dark":
            default:
                return "2px solid #111827";
        }
    }


    /* =====================================================
       LIVE INPUT LISTENERS
    ===================================================== */

    [
        "#cocoStartBox",
        "#cocoEndBox",
        "#cocoCopiesPerBox",
        "#cocoLabelsPerPage",
        "#cocoCommaPO",
        "#cocoBorderStyle",
        "#cocoFont",
        "#cocoFontSize"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "input",
            updateCocoPreview
        );

        $(selector)?.addEventListener(
            "change",
            updateCocoPreview
        );
    });


    $$(".coco-po").forEach(input => {

        input.addEventListener(
            "input",
            updateCocoPreview
        );

    });


    [
        "#otherStartBox",
        "#otherEndBox",
        "#otherCopiesPerBox",
        "#otherLabelsPerPage",
        "#otherCommaPO",
        "#otherBorderStyle"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "input",
            updateOtherPreview
        );

        $(selector)?.addEventListener(
            "change",
            updateOtherPreview
        );
    });


    $$(".other-po").forEach(input => {

        input.addEventListener(
            "input",
            updateOtherPreview
        );

    });


    $$(".sbmo-po").forEach(input => {

        input.addEventListener(
            "input",
            updateSBMOPreview
        );

    });


    $("#sbmoCommaPO")?.addEventListener(
        "input",
        updateSBMOPreview
    );


    [
        "#sbmoStartBox",
        "#sbmoEndBox"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "input",
            updateSBMOPreview
        );

    });


    /* =====================================================
       UPDATE ALL PREVIEWS
    ===================================================== */

    function updateAllPreviews() {

        updateCocoPreview();
        updateOtherPreview();
        updateSBMOPreview();
    }


    /* =====================================================
       ADDRESS PREVIEW
    ===================================================== */

    $("#cocoFrom")?.addEventListener(
        "input",
        event => {

            const preview =
                $("#cocoFromPreview");

            if (preview) {
                preview.textContent =
                    event.target.value;
            }
        }
    );


    $("#cocoTo")?.addEventListener(
        "input",
        event => {

            const preview =
                $("#cocoToPreview");

            if (preview) {
                preview.textContent =
                    event.target.value ||
                    "Recipient Address";
            }
        }
    );


    /* =====================================================
       COCOBLUE TABS
    ===================================================== */

    $$("[data-cocoblue-mode]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mode =
                    button.dataset.cocoblueMode;


                $$("[data-cocoblue-mode]")
                    .forEach(tab => {

                        tab.classList.toggle(
                            "active",
                            tab === button
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
            }
        );
    });


    /* =====================================================
       VALIDATE PRINT SELECTION
    ===================================================== */

    function validatePrintSelection(
        poCheckbox,
        boxCheckbox,
        poBoxCheckbox
    ) {

        if (
            !poCheckbox?.checked &&
            !boxCheckbox?.checked &&
            !poBoxCheckbox?.checked
        ) {

            showToast(
                "error",
                "Print Option Required",
                "Please select PO Number, Box Number, or PO + Box Number."
            );

            return false;
        }


        return true;
    }


    /* =====================================================
       BUILD JOBS
    ===================================================== */

    function buildJobs(
        poList,
        start,
        end,
        copies
    ) {

        const jobs = [];


        /*
         * No 200 restriction.
         *
         * WARNING:
         * Very large ranges naturally generate very large
         * output files.
         */

        for (
            let box = start;
            box <= end;
            box++
        ) {

            for (
                let copy = 1;
                copy <= copies;
                copy++
            ) {

                jobs.push({
                    po: poList,
                    box,
                    copy
                });

            }
        }


        return jobs;
    }


    /* =====================================================
       PDF LABEL DRAWING
    ===================================================== */

    function drawPDFLabel(
        doc,
        po,
        box,
        options = {}
    ) {

        const {
            printMode = "po-box",
            pageBorder = true,
            poBorder = true,
            boxBorder = true,
            outerBorder = false,
            cutting = true,
            scissor = true,
            bold = true,
            font = "helvetica",
            fontSize = 16
        } = options;


        const pageWidth =
            doc.internal.pageSize.getWidth();

        const pageHeight =
            doc.internal.pageSize.getHeight();


        const margin = 12;

        const labelX = margin;
        const labelY = margin;

        const labelW =
            pageWidth - margin * 2;

        const labelH =
            pageHeight - margin * 2;


        /* PAGE BORDER */

        if (pageBorder) {

            doc.setLineWidth(.7);

            doc.setDrawColor(
                17,
                24,
                39
            );

            doc.rect(
                6,
                6,
                pageWidth - 12,
                pageHeight - 12
            );
        }


        /* OUTER LABEL BORDER */

        if (outerBorder) {

            doc.setLineWidth(1.3);

            doc.rect(
                labelX,
                labelY,
                labelW,
                labelH
            );
        }


        doc.setFont(
            font,
            bold ? "bold" : "normal"
        );


        const centerX =
            pageWidth / 2;


        let currentY =
            pageHeight * .34;


        /* PO */

        if (
            printMode === "po" ||
            printMode === "po-box"
        ) {

            const text =
                String(po || "");


            const boxWidth =
                Math.min(
                    labelW * .8,
                    Math.max(
                        65,
                        doc.getTextWidth(text) + 24
                    )
                );


            const boxX =
                centerX - boxWidth / 2;


            if (poBorder) {

                doc.setLineWidth(.8);

                doc.rect(
                    boxX,
                    currentY - 15,
                    boxWidth,
                    30
                );
            }


            doc.setFontSize(
                Number(fontSize) || 16
            );


            doc.text(
                text,
                centerX,
                currentY + 4,
                {
                    align: "center"
                }
            );


            currentY += 48;
        }


        /* CUTTING LINE */

        if (
            printMode === "po-box" &&
            cutting
        ) {

            doc.setLineWidth(.5);

            doc.setDrawColor(
                80,
                80,
                80
            );


            const lineY =
                currentY - 13;


            /*
             * Dashed horizontal line
             */

            const left =
                labelX + 18;

            const right =
                labelX + labelW - 18;

            const dash = 4;
            const gap = 3;


            for (
                let x = left;
                x < right;
                x += dash + gap
            ) {

                doc.line(
                    x,
                    lineY,
                    Math.min(
                        x + dash,
                        right
                    ),
                    lineY
                );
            }


            if (scissor) {

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(11);

                doc.text(
                    "✂",
                    centerX,
                    lineY + 3,
                    {
                        align: "center"
                    }
                );
            }


            currentY += 30;
        }


        /* BOX */

        if (
            printMode === "box" ||
            printMode === "po-box"
        ) {

            const text =
                `BOX NO. ${box}`;


            const boxWidth =
                Math.min(
                    labelW * .8,
                    Math.max(
                        90,
                        doc.getTextWidth(text) + 28
                    )
                );


            const boxX =
                centerX - boxWidth / 2;


            if (boxBorder) {

                doc.setLineWidth(.8);

                doc.rect(
                    boxX,
                    currentY - 15,
                    boxWidth,
                    30
                );
            }


            doc.setFont(
                font,
                bold ? "bold" : "normal"
            );

            doc.setFontSize(
                Number(fontSize) || 16
            );


            doc.text(
                text,
                centerX,
                currentY + 4,
                {
                    align: "center"
                }
            );
        }
    }


    /* =====================================================
       CREATE PDF BLOB
    ===================================================== */

    function createPDFBlob(
        po,
        start,
        end,
        options
    ) {

        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            throw new Error(
                "jsPDF library is not loaded."
            );
        }


        const {
            jsPDF
        } = window.jspdf;


        const doc =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });


        let firstPage = true;


        for (
            let box = start;
            box <= end;
            box++
        ) {

            if (!firstPage) {

                doc.addPage();
            }


            firstPage = false;


            drawPDFLabel(
                doc,
                po,
                box,
                options
            );
        }


        return doc.output(
            "blob"
        );
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


        const anchor =
            document.createElement("a");


        anchor.href = url;
        anchor.download = filename;


        document.body.appendChild(anchor);

        anchor.click();

        anchor.remove();


        setTimeout(() => {

            URL.revokeObjectURL(url);

        }, 1000);
    }


    /* =====================================================
       ZIP CREATION
    ===================================================== */

    async function downloadAsZIP(
        files,
        zipName
    ) {

        if (
            typeof JSZip === "undefined"
        ) {

            throw new Error(
                "JSZip library is not loaded."
            );
        }


        const zip =
            new JSZip();


        files.forEach(file => {

            zip.file(
                file.name,
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


        downloadBlob(
            blob,
            zipName
        );
    }


    /* =====================================================
       COCOBLUE GENERATE
    ===================================================== */

    $("#cocoGenerate")?.addEventListener(
        "click",
        async () => {

            try {

                const range =
                    validateRange(
                        $("#cocoStartBox"),
                        $("#cocoEndBox")
                    );


                if (!range) {
                    return;
                }


                const poList =
                    getCocoPOs();


                if (!poList.length) {

                    showToast(
                        "error",
                        "PO Required",
                        "Please enter at least one PO number."
                    );

                    return;
                }


                if (
                    !validatePrintSelection(
                        $("#cocoPrintPO"),
                        $("#cocoPrintBox"),
                        $("#cocoPrintPOBox")
                    )
                ) {
                    return;
                }


                const copies =
                    getPositiveInteger(
                        $("#cocoCopiesPerBox"),
                        1
                    );


                const separate =
                    $("#cocoSeparatePDF")?.checked;

                const zip =
                    $("#cocoZIP")?.checked;

                const merged =
                    $("#cocoMergedPDF")?.checked;


                const options = {

                    printMode:
                        getPrintMode(
                            $("#cocoPrintPO"),
                            $("#cocoPrintBox"),
                            $("#cocoPrintPOBox")
                        ),

                    pageBorder:
                        $("#cocoPageBorder")?.checked,

                    poBorder:
                        $("#cocoPOBorder")?.checked,

                    boxBorder:
                        $("#cocoBoxBorder")?.checked,

                    outerBorder:
                        $("#cocoPOBoxOuterBorder")?.checked ||
                        $("#cocoBorder")?.checked,

                    cutting:
                        $("#cocoCutting")?.checked,

                    scissor:
                        $("#cocoScissorLine")?.checked,

                    bold:
                        $("#cocoBoldText")?.checked,

                    font:
                        String(
                            $("#cocoFont")?.value ||
                            "Helvetica"
                        ).toLowerCase(),

                    fontSize:
                        getPositiveInteger(
                            $("#cocoFontSize"),
                            16
                        )
                };


                const status =
                    $("#cocoStatus");


                if (status) {
                    status.textContent =
                        "Generating PDF...";
                }


                /*
                 * Single PO:
                 * direct PDF download.
                 */

                if (
                    poList.length === 1 &&
                    !zip &&
                    !merged
                ) {

                    const blob =
                        createPDFBlob(
                            poList[0],
                            range.start,
                            range.end,
                            options
                        );


                    downloadBlob(
                        blob,
                        `${safeFilename(poList[0])}_BOX_${range.start}-${range.end}.pdf`
                    );


                    if (status) {
                        status.textContent =
                            "PDF generated successfully.";
                    }


                    showToast(
                        "success",
                        "PDF Ready",
                        "Your PDF has been downloaded directly."
                    );


                    return;
                }


                /*
                 * Multiple PO + MERGED
                 */

                if (
                    merged &&
                    !zip
                ) {

                    const {
                        jsPDF
                    } = window.jspdf;


                    const doc =
                        new jsPDF({
                            orientation: "portrait",
                            unit: "mm",
                            format: "a4"
                        });


                    let first =
                        true;


                    poList.forEach(po => {

                        for (
                            let box = range.start;
                            box <= range.end;
                            box++
                        ) {

                            for (
                                let copy = 1;
                                copy <= copies;
                                copy++
                            ) {

                                if (!first) {
                                    doc.addPage();
                                }

                                first = false;


                                drawPDFLabel(
                                    doc,
                                    po,
                                    box,
                                    options
                                );
                            }
                        }

                    });


                    doc.save(
                        `BOOKSWAGON_MERGED_PO_LABELS.pdf`
                    );


                    if (status) {
                        status.textContent =
                            "Merged PDF generated successfully.";
                    }


                    showToast(
                        "success",
                        "Merged PDF Ready",
                        "All selected PO labels were merged into one PDF."
                    );


                    return;
                }


                /*
                 * Multiple PO + ZIP
                 */

                if (
                    poList.length > 1 ||
                    zip
                ) {

                    const files = [];


                    for (
                        const po of poList
                    ) {

                        const blob =
                            createPDFBlob(
                                po,
                                range.start,
                                range.end,
                                options
                            );


                        files.push({
                            name:
                                `${safeFilename(po)}_BOX_${range.start}-${range.end}.pdf`,
                            blob
                        });
                    }


                    if (zip || poList.length > 1) {

                        await downloadAsZIP(
                            files,
                            `BOOKSWAGON_PO_LABELS_${Date.now()}.zip`
                        );


                        if (status) {
                            status.textContent =
                                "ZIP file generated successfully.";
                        }


                        showToast(
                            "success",
                            "ZIP Ready",
                            `${files.length} PDF file(s) were packed into one ZIP file.`
                        );


                        return;
                    }
                }


                /*
                 * Fallback
                 */

                if (
                    separate &&
                    poList.length === 1
                ) {

                    const blob =
                        createPDFBlob(
                            poList[0],
                            range.start,
                            range.end,
                            options
                        );


                    downloadBlob(
                        blob,
                        `${safeFilename(poList[0])}.pdf`
                    );


                    showToast(
                        "success",
                        "PDF Ready",
                        "PDF downloaded successfully."
                    );
                }


            } catch (error) {

                console.error(error);

                $("#cocoStatus").textContent =
                    "Generation failed.";

                showToast(
                    "error",
                    "Generation Error",
                    error.message ||
                    "Unable to generate the PDF."
                );
            }
        }
    );


    /* =====================================================
       OTHER PO GENERATE
    ===================================================== */

    $("#otherGenerate")?.addEventListener(
        "click",
        async () => {

            try {

                const range =
                    validateRange(
                        $("#otherStartBox"),
                        $("#otherEndBox")
                    );


                if (!range) {
                    return;
                }


                const poList =
                    getOtherPOs();


                if (!poList.length) {

                    showToast(
                        "error",
                        "PO Required",
                        "Please enter at least one PO number."
                    );

                    return;
                }


                if (
                    !validatePrintSelection(
                        $("#otherPrintPO"),
                        $("#otherPrintBox"),
                        $("#otherPrintPOBox")
                    )
                ) {
                    return;
                }


                const options = {

                    printMode:
                        getPrintMode(
                            $("#otherPrintPO"),
                            $("#otherPrintBox"),
                            $("#otherPrintPOBox")
                        ),

                    pageBorder:
                        $("#otherPageBorder")?.checked,

                    poBorder:
                        $("#otherPOBorder")?.checked,

                    boxBorder:
                        $("#otherBoxBorder")?.checked,

                    outerBorder:
                        $("#otherPOBoxOuterBorder")?.checked ||
                        $("#otherBorder")?.checked,

                    cutting:
                        $("#otherCutting")?.checked,

                    scissor: true,

                    bold: true
                };


                const zip =
                    $("#otherZIP")?.checked;

                const merged =
                    $("#otherMergedPDF")?.checked;


                if (
                    merged &&
                    !zip
                ) {

                    const {
                        jsPDF
                    } = window.jspdf;


                    const doc =
                        new jsPDF({
                            orientation: "portrait",
                            unit: "mm",
                            format: "a4"
                        });


                    let first = true;


                    poList.forEach(po => {

                        for (
                            let box = range.start;
                            box <= range.end;
                            box++
                        ) {

                            if (!first) {
                                doc.addPage();
                            }

                            first = false;


                            drawPDFLabel(
                                doc,
                                po,
                                box,
                                options
                            );
                        }

                    });


                    doc.save(
                        "BOOKSWAGON_OTHER_PO_MERGED.pdf"
                    );


                    showToast(
                        "success",
                        "Merged PDF Ready",
                        "All Other PO labels were merged into one PDF."
                    );


                    return;
                }


                const files = [];


                for (
                    const po of poList
                ) {

                    const blob =
                        createPDFBlob(
                            po,
                            range.start,
                            range.end,
                            options
                        );


                    files.push({
                        name:
                            `${safeFilename(po)}_BOX_${range.start}-${range.end}.pdf`,
                        blob
                    });
                }


                /*
                 * One PDF = direct PDF.
                 * Multiple PDFs = ZIP.
                 */

                if (
                    files.length === 1 &&
                    !zip
                ) {

                    downloadBlob(
                        files[0].blob,
                        files[0].name
                    );


                    showToast(
                        "success",
                        "PDF Ready",
                        "PDF downloaded directly."
                    );


                    return;
                }


                await downloadAsZIP(
                    files,
                    `BOOKSWAGON_OTHER_PO_${Date.now()}.zip`
                );


                showToast(
                    "success",
                    "ZIP Ready",
                    `${files.length} PDF file(s) were packed into one ZIP.`
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "error",
                    "Generation Error",
                    error.message ||
                    "Unable to generate the PDF."
                );
            }
        }
    );


    /* =====================================================
       SBMO GENERATE
    ===================================================== */

    function getSBMOPOs() {

        const individual =
            collectPOsFromInputs(
                ".sbmo-po"
            );


        const comma =
            parseCommaSeparatedPO(
                $("#sbmoCommaPO")?.value
            );


        return getUniquePOs([
            ...individual,
            ...comma
        ]);
    }


    $("#sbmoGenerate")?.addEventListener(
        "click",
        async () => {

            try {

                const start =
                    getPositiveInteger(
                        $("#sbmoStartBox"),
                        1
                    );


                const end =
                    getPositiveInteger(
                        $("#sbmoEndBox"),
                        start
                    );


                if (end < start) {

                    showToast(
                        "error",
                        "Invalid Range",
                        "End Box Number must be greater than or equal to Start Box Number."
                    );

                    return;
                }


                const poList =
                    getSBMOPOs();


                if (!poList.length) {

                    showToast(
                        "error",
                        "PO Required",
                        "Please enter at least one PO number."
                    );

                    return;
                }


                const options = {

                    printMode:
                        getPrintMode(
                            $("#sbmoPrintPO"),
                            $("#sbmoPrintBox"),
                            $("#sbmoPrintPOBox")
                        ),

                    pageBorder: true,

                    poBorder:
                        $("#sbmoPOBorder")?.checked,

                    boxBorder:
                        $("#sbmoBoxBorder")?.checked,

                    outerBorder: false,

                    cutting:
                        $("#sbmoCutting")?.checked,

                    scissor: true,

                    bold: true
                };


                const zip =
                    $("#sbmoZIP")?.checked;

                const merged =
                    $("#sbmoMergedPDF")?.checked;


                if (
                    merged &&
                    !zip
                ) {

                    const {
                        jsPDF
                    } = window.jspdf;


                    const doc =
                        new jsPDF({
                            orientation: "portrait",
                            unit: "mm",
                            format: "a4"
                        });


                    let first = true;


                    poList.forEach(po => {

                        for (
                            let box = start;
                            box <= end;
                            box++
                        ) {

                            if (!first) {
                                doc.addPage();
                            }

                            first = false;


                            drawPDFLabel(
                                doc,
                                po,
                                box,
                                options
                            );
                        }

                    });


                    doc.save(
                        "BOOKSWAGON_SBMO_MERGED.pdf"
                    );


                    showToast(
                        "success",
                        "Merged PDF Ready",
                        "All SBMO labels were merged into one PDF."
                    );


                    return;
                }


                const files = [];


                for (
                    const po of poList
                ) {

                    const blob =
                        createPDFBlob(
                            po,
                            start,
                            end,
                            options
                        );


                    files.push({
                        name:
                            `${safeFilename(po)}_SBMO_BOX_${start}-${end}.pdf`,
                        blob
                    });
                }


                if (
                    files.length === 1 &&
                    !zip
                ) {

                    downloadBlob(
                        files[0].blob,
                        files[0].name
                    );


                    showToast(
                        "success",
                        "PDF Ready",
                        "SBMO PDF downloaded directly."
                    );


                    return;
                }


                await downloadAsZIP(
                    files,
                    `BOOKSWAGON_SBMO_${Date.now()}.zip`
                );


                showToast(
                    "success",
                    "ZIP Ready",
                    `${files.length} SBMO PDF file(s) packed into one ZIP.`
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "error",
                    "SBMO Error",
                    error.message ||
                    "Unable to generate SBMO PDF."
                );
            }
        }
    );


    /* =====================================================
       ADDRESS PDF
    ===================================================== */

    $("#cocoAddressGenerate")?.addEventListener(
        "click",
        () => {

            try {

                if (
                    !window.jspdf
                ) {

                    throw new Error(
                        "jsPDF library is not loaded."
                    );
                }


                const {
                    jsPDF
                } = window.jspdf;


                const doc =
                    new jsPDF({
                        orientation: "portrait",
                        unit: "mm",
                        format: "a4"
                    });


                const from =
                    $("#cocoFrom")?.value ||
                    "";


                const to =
                    $("#cocoTo")?.value ||
                    "";


                const pageWidth =
                    doc.internal.pageSize.getWidth();


                const pageHeight =
                    doc.internal.pageSize.getHeight();


                const border =
                    $("#cocoAddressBorder")?.checked;


                if (border) {

                    doc.setLineWidth(.8);

                    doc.rect(
                        10,
                        10,
                        pageWidth - 20,
                        pageHeight - 20
                    );
                }


                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(18);


                doc.text(
                    "BOOKSWAGON OFFICE",
                    pageWidth / 2,
                    30,
                    {
                        align: "center"
                    }
                );


                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(11);


                let y = 55;


                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "FROM",
                    25,
                    y
                );


                y += 8;


                doc.setFont(
                    "helvetica",
                    "normal"
                );


                const fromLines =
                    doc.splitTextToSize(
                        from,
                        pageWidth - 50
                    );


                doc.text(
                    fromLines,
                    25,
                    y
                );


                y +=
                    fromLines.length * 6 +
                    15;


                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "TO",
                    25,
                    y
                );


                y += 8;


                doc.setFont(
                    "helvetica",
                    "normal"
                );


                const toLines =
                    doc.splitTextToSize(
                        to ||
                        "Recipient Address",
                        pageWidth - 50
                    );


                doc.text(
                    toLines,
                    25,
                    y
                );


                doc.save(
                    "BOOKSWAGON_ADDRESS_LABEL.pdf"
                );


                $("#cocoAddressStatus").textContent =
                    "Address PDF generated successfully.";


                showToast(
                    "success",
                    "Address PDF Ready",
                    "The address label has been downloaded."
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "error",
                    "Address PDF Error",
                    error.message
                );
            }
        }
    );


    /* =====================================================
       RESET — COCOBLUE
    ===================================================== */

    $("#cocoReset")?.addEventListener(
        "click",
        () => {

            /*
             * Reset without firing confirmation dialogs
             * for every checkbox.
             */

            $$(".coco-po").forEach(input => {
                input.value = "";
            });


            if ($("#cocoStartBox")) {
                $("#cocoStartBox").value = 1;
            }


            if ($("#cocoEndBox")) {
                $("#cocoEndBox").value = 200;
            }


            if ($("#cocoCopiesPerBox")) {
                $("#cocoCopiesPerBox").value = 1;
            }


            if ($("#cocoLabelsPerPage")) {
                $("#cocoLabelsPerPage").value = 1;
            }


            if ($("#cocoCommaPO")) {
                $("#cocoCommaPO").value = "";
            }


            /*
             * Defaults
             */

            const defaults = {

                cocoPrintPO: true,
                cocoPrintBox: false,
                cocoPrintPOBox: true,

                cocoVertical: true,

                cocoPageBorder: true,
                cocoPOBorder: true,
                cocoBoxBorder: true,

                cocoPOBoxOuterBorder: false,
                cocoBorder: false,
                cocoTaxBorder: false,

                cocoCutting: true,
                cocoScissorLine: true,
                cocoBoldText: true,

                cocoSeparatePDF: true,
                cocoZIP: false,
                cocoMergedPDF: false
            };


            Object.entries(defaults)
                .forEach(([id, value]) => {

                    const checkbox =
                        document.getElementById(id);

                    if (checkbox) {
                        checkbox.checked = value;
                    }

                });


            updateCocoPreview();


            showToast(
                "success",
                "Reset Complete",
                "CocoBlue settings have been restored."
            );
        }
    );


    /* =====================================================
       RESET — OTHER PO
    ===================================================== */

    $("#otherReset")?.addEventListener(
        "click",
        () => {

            $$(".other-po").forEach(input => {
                input.value = "";
            });


            if ($("#otherCommaPO")) {
                $("#otherCommaPO").value = "";
            }


            if ($("#otherStartBox")) {
                $("#otherStartBox").value = 1;
            }


            if ($("#otherEndBox")) {
                $("#otherEndBox").value = 200;
            }


            const defaults = {

                otherPrintPO: true,
                otherPrintBox: false,
                otherPrintPOBox: true,

                otherPageBorder: true,
                otherPOBorder: true,
                otherBoxBorder: true,

                otherPOBoxOuterBorder: false,
                otherBorder: false,
                otherTaxBorder: false,

                otherCutting: true,

                otherSeparatePDF: true,
                otherZIP: false,
                otherMergedPDF: false
            };


            Object.entries(defaults)
                .forEach(([id, value]) => {

                    const checkbox =
                        document.getElementById(id);

                    if (checkbox) {
                        checkbox.checked = value;
                    }

                });


            updateOtherPreview();


            showToast(
                "success",
                "Reset Complete",
                "Other PO settings have been restored."
            );
        }
    );


    /* =====================================================
       SAFE FILE NAME
    ===================================================== */

    function safeFilename(
        value
    ) {

        return String(value || "PO")
            .replace(
                /[<>:"/\\|?*\x00-\x1F]/g,
                "_"
            )
            .replace(
                /\s+/g,
                "_"
            )
            .slice(
                0,
                100
            );
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        /*
         * Start with all workspaces hidden.
         */

        workspaces.forEach(workspace => {
            workspace.classList.remove("active");
        });


        /*
         * Default input modes.
         */

        setCocoInputMode("manual");
        setOtherInputMode("manual");


        /*
         * Initial previews.
         */

        updateAllPreviews();


        /*
         * Confirmation checkbox system.
         */

        setupCheckboxConfirmations();


        /*
         * Address defaults.
         */

        const fromPreview =
            $("#cocoFromPreview");


        if (fromPreview) {

            fromPreview.textContent =
                $("#cocoFrom")?.value ||
                "BooksWagon Office";
        }


        /*
         * Make sure the old 1–200 browser constraint
         * is NOT being imposed by JavaScript.
         */

        [
            "#cocoStartBox",
            "#cocoEndBox",
            "#otherStartBox",
            "#otherEndBox",
            "#sbmoStartBox",
            "#sbmoEndBox"
        ].forEach(selector => {

            const input = $(selector);

            if (input) {

                input.removeAttribute("max");

                input.min = "1";
            }

        });
    }


    /* =====================================================
       START APP
    ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }


})();
