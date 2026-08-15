/* =========================================================
   BOOKSWAGON LABEL STUDIO — FINAL APP.JS
   =========================================================
   Features:
   ✓ Unlimited box range (minimum 1, no 200 limit)
   ✓ 20 manual PO fields
   ✓ Comma-separated multiple PO input
   ✓ PO-only / Box-only / PO + Box
   ✓ Individual PO border
   ✓ Individual Box border
   ✓ Combined PO + Box outer border
   ✓ Page border
   ✓ Cutting line + scissor
   ✓ Checkbox confirmation before enable/disable
   ✓ Green success / red disabled toast
   ✓ One PDF = direct PDF
   ✓ Multiple PDFs = ZIP
   ✓ Merged PDF option
   ✓ Address PDF
   ✓ Safe filenames
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       SHORTCUTS
    ===================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));


    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    let confirmationCheckbox = null;
    let confirmationState = false;

    let activeToastContainer = null;


    /* =====================================================
       GENERAL HELPERS
    ===================================================== */

    function text(value) {
        return String(value ?? "").trim();
    }


    function unique(values) {
        const seen = new Set();

        return values.filter(value => {
            const key = text(value).toUpperCase();

            if (!key || seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
    }


    function safeFilename(value) {
        return text(value || "PO")
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
            .replace(/\s+/g, "_")
            .slice(0, 100);
    }


    function positiveInteger(element, fallback = 1) {
        if (!element) {
            return fallback;
        }

        const value = Number(
            text(element.value)
        );

        if (
            !Number.isFinite(value) ||
            !Number.isInteger(value) ||
            value < 1
        ) {
            return fallback;
        }

        /*
         * IMPORTANT:
         * There is intentionally NO max = 200 check.
         */
        return value;
    }


    function getRange(startSelector, endSelector) {
        const startElement = $(startSelector);
        const endElement = $(endSelector);

        const start =
            positiveInteger(startElement, 1);

        const end =
            positiveInteger(endElement, start);

        if (end < start) {
            toast(
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
       TOAST SYSTEM
    ===================================================== */

    function getToastContainer() {
        if (activeToastContainer) {
            return activeToastContainer;
        }

        activeToastContainer =
            document.getElementById(
                "toastContainer"
            );

        if (!activeToastContainer) {
            activeToastContainer =
                document.createElement("div");

            activeToastContainer.id =
                "toastContainer";

            activeToastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 100000;
                width: min(370px, calc(100vw - 30px));
                pointer-events: none;
            `;

            document.body.appendChild(
                activeToastContainer
            );
        }

        return activeToastContainer;
    }


    function toast(
        type = "info",
        title = "Notice",
        message = ""
    ) {
        const container =
            getToastContainer();

        const item =
            document.createElement("div");

        const success =
            type === "success";

        const error =
            type === "error";

        const accent =
            success
                ? "#12b76a"
                : error
                    ? "#f04438"
                    : "#1264f5";

        item.style.cssText = `
            pointer-events: auto;
            margin-bottom: 10px;
            padding: 14px 16px;
            background: #ffffff;
            border: 1px solid ${success
                ? "#abefc6"
                : error
                    ? "#fecdca"
                    : "#b2ddff"};
            border-left: 4px solid ${accent};
            border-radius: 12px;
            box-shadow: 0 18px 45px rgba(16,24,40,.15);
            transition: opacity .22s ease, transform .22s ease;
            animation: bsToastIn .22s ease;
        `;

        item.innerHTML = `
            <div style="
                color:${accent};
                font-size:12px;
                font-weight:900;
                margin-bottom:3px;
            ">
                ${escapeHTML(title)}
            </div>

            <div style="
                color:#667085;
                font-size:11px;
                line-height:1.5;
            ">
                ${escapeHTML(message)}
            </div>
        `;

        container.appendChild(item);

        setTimeout(() => {
            item.style.opacity = "0";
            item.style.transform =
                "translateX(25px)";

            setTimeout(() => {
                item.remove();
            }, 230);
        }, 3500);
    }


    function escapeHTML(value) {
        const element =
            document.createElement("div");

        element.textContent =
            value ?? "";

        return element.innerHTML;
    }


    /* =====================================================
       CONFIRMATION MODAL
    ===================================================== */

    function createConfirmationModal() {
        if (
            document.getElementById(
                "featureConfirmModal"
            )
        ) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.id =
            "featureConfirmModal";

        wrapper.className =
            "hidden";

        wrapper.innerHTML = `
            <div class="bs-confirm-backdrop">

                <div class="bs-confirm-box">

                    <div class="bs-confirm-icon">
                        ?
                    </div>

                    <h3 id="featureConfirmTitle">
                        Confirm Change
                    </h3>

                    <p id="featureConfirmMessage">
                        Are you sure?
                    </p>

                    <div class="bs-confirm-actions">

                        <button
                            type="button"
                            id="featureConfirmCancel"
                            class="bs-confirm-cancel"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            id="featureConfirmOK"
                            class="bs-confirm-ok"
                        >
                            Confirm
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(wrapper);


        const style =
            document.createElement("style");

        style.textContent = `
            #featureConfirmModal.hidden {
                display:none !important;
            }

            .bs-confirm-backdrop {
                position:fixed;
                inset:0;
                z-index:99999;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:20px;
                background:rgba(15,23,42,.48);
                backdrop-filter:blur(5px);
            }

            .bs-confirm-box {
                width:min(420px,100%);
                padding:26px;
                background:#fff;
                border-radius:18px;
                box-shadow:0 25px 80px rgba(16,24,40,.22);
                animation:bsModalIn .18s ease;
            }

            .bs-confirm-icon {
                width:40px;
                height:40px;
                display:grid;
                place-items:center;
                margin-bottom:13px;
                border-radius:50%;
                background:#edf5ff;
                color:#1264f5;
                font-weight:950;
            }

            .bs-confirm-box h3 {
                margin:0 0 7px;
                color:#101828;
                font-size:18px;
                font-weight:950;
            }

            .bs-confirm-box p {
                margin:0;
                color:#667085;
                font-size:12px;
                line-height:1.6;
            }

            .bs-confirm-actions {
                display:flex;
                justify-content:flex-end;
                gap:8px;
                margin-top:23px;
            }

            .bs-confirm-actions button {
                min-height:40px;
                padding:0 15px;
                border-radius:9px;
                font-size:11px;
                font-weight:850;
                cursor:pointer;
            }

            .bs-confirm-cancel {
                border:1px solid #d0d5dd;
                background:#fff;
                color:#344054;
            }

            .bs-confirm-ok {
                border:0;
                background:#1264f5;
                color:#fff;
            }

            @keyframes bsModalIn {
                from {
                    opacity:0;
                    transform:scale(.97) translateY(5px);
                }
                to {
                    opacity:1;
                    transform:scale(1) translateY(0);
                }
            }

            @keyframes bsToastIn {
                from {
                    opacity:0;
                    transform:translateX(25px);
                }
                to {
                    opacity:1;
                    transform:translateX(0);
                }
            }
        `;

        document.head.appendChild(style);
    }


    function featureName(checkbox) {
        const row =
            checkbox.closest(
                "label, .check-row, .checkbox-row, .option-row, .feature-option"
            );

        if (row) {
            const clone =
                row.cloneNode(true);

            clone
                .querySelectorAll(
                    "input, button"
                )
                .forEach(element =>
                    element.remove()
                );

            const label =
                text(clone.textContent);

            if (label) {
                return label;
            }
        }

        return (
            checkbox.dataset.feature ||
            checkbox.getAttribute("aria-label") ||
            checkbox.name ||
            checkbox.id ||
            "this feature"
        );
    }


    function openConfirmation(
        checkbox,
        desiredState
    ) {
        createConfirmationModal();

        confirmationCheckbox =
            checkbox;

        confirmationState =
            desiredState;


        const modal =
            $("#featureConfirmModal");

        const title =
            $("#featureConfirmTitle");

        const message =
            $("#featureConfirmMessage");

        const ok =
            $("#featureConfirmOK");


        const name =
            featureName(checkbox);


        title.textContent =
            desiredState
                ? "Enable Feature?"
                : "Disable Feature?";


        message.textContent =
            desiredState
                ? `Are you sure you want to enable "${name}"?`
                : `Are you sure you want to disable "${name}"?`;


        ok.textContent =
            desiredState
                ? "Yes, Enable"
                : "Yes, Disable";


        ok.style.background =
            desiredState
                ? "#1264f5"
                : "#f04438";


        modal.classList.remove(
            "hidden"
        );
    }


    function closeConfirmation() {
        const modal =
            $("#featureConfirmModal");

        if (modal) {
            modal.classList.add(
                "hidden"
            );
        }

        confirmationCheckbox =
            null;

        confirmationState =
            false;
    }


    function setupConfirmationSystem() {
        createConfirmationModal();


        /*
         * EVENT DELEGATION
         *
         * This is the important fix.
         * It works even when checkboxes are created
         * dynamically after page load.
         */

        document.addEventListener(
            "click",
            event => {

                const checkbox =
                    event.target.closest(
                        'input[type="checkbox"]'
                    );

                if (!checkbox) {
                    return;
                }


                /*
                 * Allow explicitly exempt checkboxes.
                 */

                if (
                    checkbox.dataset.confirmSkip ===
                    "true"
                ) {
                    return;
                }


                /*
                 * If click was already handled by
                 * our system, do nothing.
                 */

                if (
                    checkbox.dataset.bsProcessing ===
                    "true"
                ) {
                    return;
                }


                /*
                 * Prevent native browser toggle.
                 */

                event.preventDefault();

                event.stopPropagation();


                const desiredState =
                    !checkbox.checked;


                openConfirmation(
                    checkbox,
                    desiredState
                );

            },
            true
        );


        document.addEventListener(
            "change",
            event => {

                const checkbox =
                    event.target.closest(
                        'input[type="checkbox"]'
                    );

                if (!checkbox) {
                    return;
                }


                /*
                 * We intentionally do not modify
                 * checkbox state here.
                 *
                 * The confirmation handler is the
                 * single source of truth.
                 */

            },
            true
        );


        $("#featureConfirmCancel")
            ?.addEventListener(
                "click",
                closeConfirmation
            );


        $("#featureConfirmOK")
            ?.addEventListener(
                "click",
                () => {

                    if (!confirmationCheckbox) {
                        closeConfirmation();
                        return;
                    }


                    const checkbox =
                        confirmationCheckbox;

                    const newState =
                        confirmationState;


                    /*
                     * ACTUAL ENABLE / DISABLE
                     */

                    checkbox.dataset.bsProcessing =
                        "true";

                    checkbox.checked =
                        newState;


                    /*
                     * Trigger normal change handlers.
                     */

                    checkbox.dispatchEvent(
                        new Event(
                            "change",
                            {
                                bubbles:true
                            }
                        )
                    );


                    checkbox.dataset.bsProcessing =
                        "false";


                    const name =
                        featureName(
                            checkbox
                        );


                    closeConfirmation();


                    if (newState) {

                        toast(
                            "success",
                            "Feature Enabled",
                            `"${name}" is now enabled.`
                        );

                    } else {

                        toast(
                            "error",
                            "Feature Disabled",
                            `"${name}" is now disabled.`
                        );
                    }


                    /*
                     * Refresh previews after
                     * every checkbox change.
                     */

                    updateAllPreviews();
                }
            );


        $("#featureConfirmModal")
            ?.addEventListener(
                "click",
                event => {

                    if (
                        event.target.classList.contains(
                            "bs-confirm-backdrop"
                        )
                    ) {
                        closeConfirmation();
                    }

                }
            );


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
                        closeConfirmation();
                    }
                }

            }
        );
    }


    /* =====================================================
       RANGE FIX
    ===================================================== */

    function removeOldRangeLimits() {

        const selectors = [
            'input[type="number"][id*="Box"]',
            'input[type="number"][name*="box"]',
            'input[type="number"][name*="Box"]',
            "#boxStart",
            "#boxEnd",
            "#startBox",
            "#endBox",
            "#cocoStartBox",
            "#cocoEndBox",
            "#otherStartBox",
            "#otherEndBox",
            "#sbmoStartBox",
            "#sbmoEndBox"
        ];


        selectors.forEach(selector => {

            $$(selector).forEach(input => {

                input.removeAttribute("max");

                input.min = "1";

            });

        });


        /*
         * Remove browser validation from old
         * 1–200 constraints.
         */

        $$('input[type="number"]')
            .forEach(input => {

                const id =
                    `${input.id} ${input.name}`
                        .toLowerCase();

                if (
                    id.includes("box") ||
                    id.includes("range")
                ) {

                    input.removeAttribute(
                        "max"
                    );

                    if (
                        !input.min ||
                        Number(input.min) < 1
                    ) {
                        input.min = "1";
                    }
                }
            });
    }


    /* =====================================================
       PO PARSING
    ===================================================== */

    function parsePOText(value) {
        return unique(
            text(value)
                .split(/[,\n;]+/)
                .map(item =>
                    text(item)
                )
                .filter(Boolean)
        );
    }


    function collectPOInputs(selector) {
        return unique(
            $$(selector)
                .map(input =>
                    text(input.value)
                )
                .filter(Boolean)
        );
    }


    /* =====================================================
       GET PRINT MODE
    ===================================================== */

    function printMode(
        poCheckbox,
        boxCheckbox,
        bothCheckbox
    ) {
        const po =
            Boolean(poCheckbox?.checked);

        const box =
            Boolean(boxCheckbox?.checked);

        const both =
            Boolean(bothCheckbox?.checked);


        if (both) {
            return "po-box";
        }

        if (po && box) {
            return "po-box";
        }

        if (po) {
            return "po";
        }

        if (box) {
            return "box";
        }

        return "none";
    }


    /* =====================================================
       LABEL HTML PREVIEW
    ===================================================== */

    function labelPreviewHTML(
        po,
        box,
        options = {}
    ) {
        const mode =
            options.mode || "po-box";

        const poBorder =
            options.poBorder !== false;

        const boxBorder =
            options.boxBorder !== false;

        const outerBorder =
            options.outerBorder === true;

        const cutting =
            options.cutting !== false;

        const scissor =
            options.scissor !== false;


        let content = "";


        if (
            mode === "po" ||
            mode === "po-box"
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
            mode === "po-box" &&
            cutting
        ) {

            content += `
                <div class="preview-dotted-line">
                    ${
                        scissor
                            ? "· · · · · ✂ · · · · ·"
                            : "· · · · · · · · · ·"
                    }
                </div>
            `;
        }


        if (
            mode === "box" ||
            mode === "po-box"
        ) {

            content += `
                <div
                    class="${
                        boxBorder
                            ? "preview-box-number"
                            : ""
                    }"
                >
                    BOX NO. ${escapeHTML(box)}
                </div>
            `;
        }


        if (!content) {
            content = `
                <div style="
                    color:#98a2b3;
                    font-size:11px;
                ">
                    Select a print option
                </div>
            `;
        }


        return `
            <div
                class="dynamic-label-preview ${
                    outerBorder
                        ? "has-outer-border"
                        : ""
                }"
            >
                ${content}
            </div>
        `;
    }


    /* =====================================================
       COCOBLUE PREVIEW
    ===================================================== */

    function updateCocoPreview() {

        const start =
            positiveInteger(
                $("#cocoStartBox"),
                1
            );

        const end =
            positiveInteger(
                $("#cocoEndBox"),
                start
            );


        const poList =
            collectPOInputs(".coco-po");


        const commaPO =
            parsePOText(
                $("#cocoCommaPO")?.value
            );


        const allPOs =
            unique([
                ...poList,
                ...commaPO
            ]);


        const po =
            allPOs[0] ||
            "PO NUMBER";


        const mode =
            printMode(
                $("#cocoPrintPO"),
                $("#cocoPrintBox"),
                $("#cocoPrintPOBox")
            );


        const page =
            $("#cocoPreviewPage");

        const label =
            $("#cocoPreviewLabel");


        if (!page || !label) {
            return;
        }


        const pageBorder =
            $("#cocoPageBorder")?.checked;


        page.style.border =
            pageBorder
                ? "1.5px solid #111827"
                : "0";


        label.outerHTML =
            labelPreviewHTML(
                po,
                start,
                {
                    mode,
                    poBorder:
                        $("#cocoPOBorder")
                            ?.checked,
                    boxBorder:
                        $("#cocoBoxBorder")
                            ?.checked,
                    outerBorder:
                        $("#cocoPOBoxOuterBorder")
                            ?.checked ||
                        $("#cocoBorder")
                            ?.checked,
                    cutting:
                        $("#cocoCutting")
                            ?.checked,
                    scissor:
                        $("#cocoScissorLine")
                            ?.checked
                }
            );


        const summary =
            $("#cocoBoxSummary");

        if (summary) {
            summary.textContent =
                `${start}–${end}`;
        }


        const status =
            $("#cocoSummary");

        if (status) {
            status.textContent =
                allPOs.length
                    ? `${allPOs.length} PO(s)`
                    : "Ready";
        }
    }


    /* =====================================================
       OTHER PO PREVIEW
    ===================================================== */

    function updateOtherPreview() {

        const start =
            positiveInteger(
                $("#otherStartBox"),
                1
            );

        const end =
            positiveInteger(
                $("#otherEndBox"),
                start
            );


        const individual =
            collectPOInputs(
                ".other-po"
            );


        const comma =
            parsePOText(
                $("#otherCommaPO")?.value
            );


        const allPOs =
            unique([
                ...individual,
                ...comma
            ]);


        const po =
            allPOs[0] ||
            "PO NUMBER";


        const mode =
            printMode(
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
            labelPreviewHTML(
                po,
                start,
                {
                    mode,
                    poBorder:
                        $("#otherPOBorder")
                            ?.checked,
                    boxBorder:
                        $("#otherBoxBorder")
                            ?.checked,
                    outerBorder:
                        $("#otherPOBoxOuterBorder")
                            ?.checked ||
                        $("#otherBorder")
                            ?.checked,
                    cutting:
                        $("#otherCutting")
                            ?.checked,
                    scissor:true
                }
            );


        const summary =
            $("#otherBoxSummary");

        if (summary) {
            summary.textContent =
                `${start}–${end}`;
        }
    }


    /* =====================================================
       SBMO PREVIEW
    ===================================================== */

    function updateSBMOPreview() {

        const start =
            positiveInteger(
                $("#sbmoStartBox"),
                1
            );


        const individual =
            collectPOInputs(
                ".sbmo-po"
            );


        const comma =
            parsePOText(
                $("#sbmoCommaPO")?.value
            );


        const po =
            unique([
                ...individual,
                ...comma
            ])[0] ||
            "PO NUMBER";


        const preview =
            $("#sbmoWorkspace .dynamic-page-preview");


        if (!preview) {
            return;
        }


        preview.innerHTML =
            labelPreviewHTML(
                po,
                start,
                {
                    mode:
                        printMode(
                            $("#sbmoPrintPO"),
                            $("#sbmoPrintBox"),
                            $("#sbmoPrintPOBox")
                        ),

                    poBorder:
                        $("#sbmoPOBorder")
                            ?.checked,

                    boxBorder:
                        $("#sbmoBoxBorder")
                            ?.checked,

                    cutting:
                        $("#sbmoCutting")
                            ?.checked,

                    scissor:true
                }
            );
    }


    function updateAllPreviews() {
        updateCocoPreview();
        updateOtherPreview();
        updateSBMOPreview();
    }


    /* =====================================================
       TOOL OPEN / CLOSE
    ===================================================== */

    function setupToolNavigation() {

        $$("[data-open-tool]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.openTool;

                        $$(".tool-workspace")
                            .forEach(workspace =>
                                workspace.classList.remove(
                                    "active"
                                )
                            );


                        const workspace =
                            document.getElementById(
                                `${id}Workspace`
                            );


                        if (!workspace) {
                            return;
                        }


                        workspace.classList.add(
                            "active"
                        );


                        setTimeout(() => {

                            workspace.scrollIntoView({
                                behavior:"smooth",
                                block:"start"
                            });

                        }, 20);
                    }
                );

            });


        $$("[data-close-tool]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        $$(".tool-workspace")
                            .forEach(workspace =>
                                workspace.classList.remove(
                                    "active"
                                )
                            );


                        $("#tools")
                            ?.scrollIntoView({
                                behavior:"smooth",
                                block:"start"
                            });
                    }
                );

            });
    }


    /* =====================================================
       GENERIC INPUT LISTENERS
    ===================================================== */

    function setupLiveInputs() {

        const selectors = [
            "#cocoStartBox",
            "#cocoEndBox",
            "#cocoCommaPO",
            "#cocoBorderStyle",
            "#otherStartBox",
            "#otherEndBox",
            "#otherCommaPO",
            "#otherBorderStyle",
            "#sbmoStartBox",
            "#sbmoEndBox",
            "#sbmoCommaPO"
        ];


        selectors.forEach(selector => {

            $(selector)?.addEventListener(
                "input",
                updateAllPreviews
            );

            $(selector)?.addEventListener(
                "change",
                updateAllPreviews
            );

        });


        [
            ".coco-po",
            ".other-po",
            ".sbmo-po"
        ].forEach(selector => {

            $$(selector).forEach(input => {

                input.addEventListener(
                    "input",
                    updateAllPreviews
                );

            });

        });
    }


    /* =====================================================
       INPUT MODE TABS
    ===================================================== */

    function setupInputTabs() {

        $$("[data-coco-input]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const mode =
                            button.dataset.cocoInput;


                        $("#cocoManualArea")
                            ?.classList.toggle(
                                "hidden",
                                mode !== "manual"
                            );

                        $("#cocoCommaArea")
                            ?.classList.toggle(
                                "hidden",
                                mode !== "comma"
                            );

                        $("#cocoExcelArea")
                            ?.classList.toggle(
                                "hidden",
                                mode !== "excel"
                            );


                        $$("[data-coco-input]")
                            .forEach(item =>
                                item.classList.toggle(
                                    "active",
                                    item === button
                                )
                            );
                    }
                );
            });


        $$("[data-other-input]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const mode =
                            button.dataset.otherInput;


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


                        $$("[data-other-input]")
                            .forEach(item =>
                                item.classList.toggle(
                                    "active",
                                    item === button
                                )
                            );
                    }
                );
            });
    }


    /* =====================================================
       EXCEL IMPORT
    ===================================================== */

    async function readExcel(file) {

        if (!file) {
            return [];
        }


        if (
            typeof XLSX ===
            "undefined"
        ) {

            toast(
                "error",
                "Excel Error",
                "XLSX library is not loaded."
            );

            return [];
        }


        try {

            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                    {
                        type:"array"
                    }
                );


            const sheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];


            if (!sheet) {
                return [];
            }


            const rows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    {
                        header:1,
                        defval:""
                    }
                );


            const values = [];


            rows.forEach(row => {

                if (!Array.isArray(row)) {
                    return;
                }


                row.forEach(cell => {

                    const value =
                        text(cell);

                    if (value) {
                        values.push(value);
                    }

                });

            });


            return unique(values);

        } catch (error) {

            console.error(error);

            toast(
                "error",
                "Excel Error",
                "Unable to read the Excel file."
            );

            return [];
        }
    }


    function setupExcelInputs() {

        $("#cocoExcel")
            ?.addEventListener(
                "change",
                async event => {

                    const file =
                        event.target.files?.[0];

                    if (!file) {
                        return;
                    }


                    const values =
                        await readExcel(file);


                    $$(".coco-po")
                        .forEach(
                            (input, index) => {

                                input.value =
                                    values[index] ||
                                    "";

                            }
                        );


                    $("#cocoExcelStatus")
                        ?.replaceChildren(
                            document.createTextNode(
                                `${Math.min(
                                    values.length,
                                    20
                                )} PO(s) loaded.`
                            )
                        );


                    updateCocoPreview();
                }
            );


        $("#otherExcel")
            ?.addEventListener(
                "change",
                async event => {

                    const file =
                        event.target.files?.[0];

                    if (!file) {
                        return;
                    }


                    const values =
                        await readExcel(file);


                    $$(".other-po")
                        .forEach(
                            (input, index) => {

                                input.value =
                                    values[index] ||
                                    "";

                            }
                        );


                    $("#otherExcelStatus")
                        ?.replaceChildren(
                            document.createTextNode(
                                `${Math.min(
                                    values.length,
                                    20
                                )} PO(s) loaded.`
                            )
                        );


                    updateOtherPreview();
                }
            );
    }


    /* =====================================================
       PRINT OPTION VALIDATION
    ===================================================== */

    function validatePrintMode(
        po,
        box,
        both
    ) {

        if (
            !po?.checked &&
            !box?.checked &&
            !both?.checked
        ) {

            toast(
                "error",
                "Print Option Required",
                "Select PO Number, Box Number, or PO + Box Number."
            );

            return false;
        }


        return true;
    }


    /* =====================================================
       jsPDF CHECK
    ===================================================== */

    function requirePDFLibrary() {

        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            throw new Error(
                "jsPDF is not loaded. Add the jsPDF CDN before app.js."
            );
        }

        return window.jspdf.jsPDF;
    }


    /* =====================================================
       DRAW PDF LABEL
    ===================================================== */

    function drawPDFLabel(
        doc,
        po,
        box,
        options = {}
    ) {

        const pageWidth =
            doc.internal.pageSize.getWidth();

        const pageHeight =
            doc.internal.pageSize.getHeight();


        const margin = 12;

        const centerX =
            pageWidth / 2;


        const mode =
            options.mode || "po-box";


        /* PAGE BORDER */

        if (
            options.pageBorder !== false
        ) {

            doc.setDrawColor(
                17,
                24,
                39
            );

            doc.setLineWidth(.7);

            doc.rect(
                6,
                6,
                pageWidth - 12,
                pageHeight - 12
            );
        }


        /* COMBINED OUTER BORDER */

        if (
            options.outerBorder === true
        ) {

            doc.setLineWidth(1.2);

            doc.rect(
                margin,
                margin,
                pageWidth - margin * 2,
                pageHeight - margin * 2
            );
        }


        let y =
            pageHeight * .35;


        const fontSize =
            Number(
                options.fontSize || 16
            );


        doc.setFont(
            "helvetica",
            options.bold === false
                ? "normal"
                : "bold"
        );

        doc.setFontSize(
            fontSize
        );


        /* PO */

        if (
            mode === "po" ||
            mode === "po-box"
        ) {

            const value =
                text(po);


            const width =
                Math.max(
                    65,
                    doc.getTextWidth(
                        value
                    ) + 28
                );


            const x =
                centerX -
                width / 2;


            if (
                options.poBorder !== false
            ) {

                doc.setLineWidth(.8);

                doc.rect(
                    x,
                    y - 15,
                    width,
                    30
                );
            }


            doc.text(
                value,
                centerX,
                y + 4,
                {
                    align:"center"
                }
            );


            y += 48;
        }


        /* CUTTING LINE */

        if (
            mode === "po-box" &&
            options.cutting !== false
        ) {

            const left =
                margin + 15;

            const right =
                pageWidth - margin - 15;

            const lineY =
                y - 13;


            doc.setDrawColor(
                80,
                80,
                80
            );

            doc.setLineWidth(.45);


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


            if (
                options.scissor !== false
            ) {

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
                        align:"center"
                    }
                );
            }


            y += 30;
        }


        /* BOX */

        if (
            mode === "box" ||
            mode === "po-box"
        ) {

            const value =
                `BOX NO. ${box}`;


            doc.setFont(
                "helvetica",
                options.bold === false
                    ? "normal"
                    : "bold"
            );

            doc.setFontSize(
                fontSize
            );


            const width =
                Math.max(
                    90,
                    doc.getTextWidth(
                        value
                    ) + 30
                );


            const x =
                centerX -
                width / 2;


            if (
                options.boxBorder !== false
            ) {

                doc.setLineWidth(.8);

                doc.rect(
                    x,
                    y - 15,
                    width,
                    30
                );
            }


            doc.text(
                value,
                centerX,
                y + 4,
                {
                    align:"center"
                }
            );
        }
    }


    /* =====================================================
       CREATE MULTI-PAGE PDF
    ===================================================== */

    function createPDF(
        po,
        start,
        end,
        options = {}
    ) {

        const jsPDF =
            requirePDFLibrary();


        const doc =
            new jsPDF({
                orientation:"portrait",
                unit:"mm",
                format:"a4"
            });


        let firstPage =
            true;


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


        return doc;
    }


    /* =====================================================
       BLOB DOWNLOAD
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
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();


        setTimeout(
            () =>
                URL.revokeObjectURL(url),
            1500
        );
    }


    /* =====================================================
       ZIP
    ===================================================== */

    async function createZIP(
        files,
        filename
    ) {

        if (
            typeof JSZip ===
            "undefined"
        ) {

            throw new Error(
                "JSZip is not loaded. Add the JSZip CDN before app.js."
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
                type:"blob",
                compression:"DEFLATE",
                compressionOptions:{
                    level:6
                }
            });


        downloadBlob(
            blob,
            filename
        );
    }


    /* =====================================================
       MULTIPLE PO MERGED PDF
    ===================================================== */

    function createMergedPDF(
        poList,
        start,
        end,
        options
    ) {

        const jsPDF =
            requirePDFLibrary();


        const doc =
            new jsPDF({
                orientation:"portrait",
                unit:"mm",
                format:"a4"
            });


        let first =
            true;


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


        return doc;
    }


    /* =====================================================
       GET COCO PO LIST
    ===================================================== */

    function getCocoPOList() {

        return unique([
            ...collectPOInputs(
                ".coco-po"
            ),

            ...parsePOText(
                $("#cocoCommaPO")?.value
            )
        ]);
    }


    /* =====================================================
       GET OTHER PO LIST
    ===================================================== */

    function getOtherPOList() {

        return unique([
            ...collectPOInputs(
                ".other-po"
            ),

            ...parsePOText(
                $("#otherCommaPO")?.value
            )
        ]);
    }


    /* =====================================================
       GET SBMO PO LIST
    ===================================================== */

    function getSBMOPOList() {

        return unique([
            ...collectPOInputs(
                ".sbmo-po"
            ),

            ...parsePOText(
                $("#sbmoCommaPO")?.value
            )
        ]);
    }


    /* =====================================================
       BUILD OPTIONS
    ===================================================== */

    function cocoOptions() {

        return {
            mode:
                printMode(
                    $("#cocoPrintPO"),
                    $("#cocoPrintBox"),
                    $("#cocoPrintPOBox")
                ),

            pageBorder:
                $("#cocoPageBorder")
                    ?.checked,

            poBorder:
                $("#cocoPOBorder")
                    ?.checked,

            boxBorder:
                $("#cocoBoxBorder")
                    ?.checked,

            outerBorder:
                $("#cocoPOBoxOuterBorder")
                    ?.checked ||
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

            fontSize:
                positiveInteger(
                    $("#cocoFontSize"),
                    16
                )
        };
    }


    function otherOptions() {

        return {
            mode:
                printMode(
                    $("#otherPrintPO"),
                    $("#otherPrintBox"),
                    $("#otherPrintPOBox")
                ),

            pageBorder:
                $("#otherPageBorder")
                    ?.checked,

            poBorder:
                $("#otherPOBorder")
                    ?.checked,

            boxBorder:
                $("#otherBoxBorder")
                    ?.checked,

            outerBorder:
                $("#otherPOBoxOuterBorder")
                    ?.checked ||
                $("#otherBorder")
                    ?.checked,

            cutting:
                $("#otherCutting")
                    ?.checked,

            scissor:true,

            bold:true,

            fontSize:16
        };
    }


    function sbmoOptions() {

        return {
            mode:
                printMode(
                    $("#sbmoPrintPO"),
                    $("#sbmoPrintBox"),
                    $("#sbmoPrintPOBox")
                ),

            pageBorder:true,

            poBorder:
                $("#sbmoPOBorder")
                    ?.checked,

            boxBorder:
                $("#sbmoBoxBorder")
                    ?.checked,

            outerBorder:false,

            cutting:
                $("#sbmoCutting")
                    ?.checked,

            scissor:true,

            bold:true,

            fontSize:16
        };
    }


    /* =====================================================
       GENERATE COCOBLUE
    ===================================================== */

    async function generateCocoBlue() {

        try {

            const range =
                getRange(
                    "#cocoStartBox",
                    "#cocoEndBox"
                );


            if (!range) {
                return;
            }


            const poList =
                getCocoPOList();


            if (!poList.length) {

                toast(
                    "error",
                    "PO Number Required",
                    "Please enter at least one PO number."
                );

                return;
            }


            if (
                !validatePrintMode(
                    $("#cocoPrintPO"),
                    $("#cocoPrintBox"),
                    $("#cocoPrintPOBox")
                )
            ) {
                return;
            }


            const options =
                cocoOptions();


            const zip =
                $("#cocoZIP")
                    ?.checked;

            const merged =
                $("#cocoMergedPDF")
                    ?.checked;


            /*
             * ONE PO + NO ZIP + NO MERGE
             * => DIRECT PDF
             */

            if (
                poList.length === 1 &&
                !zip &&
                !merged
            ) {

                const doc =
                    createPDF(
                        poList[0],
                        range.start,
                        range.end,
                        options
                    );


                doc.save(
                    `${safeFilename(
                        poList[0]
                    )}_BOX_${range.start}-${range.end}.pdf`
                );


                toast(
                    "success",
                    "PDF Ready",
                    "Your PDF has been downloaded directly."
                );


                return;
            }


            /*
             * MERGED PDF
             */

            if (
                merged &&
                !zip
            ) {

                const doc =
                    createMergedPDF(
                        poList,
                        range.start,
                        range.end,
                        options
                    );


                doc.save(
                    `BOOKSWAGON_MERGED_${Date.now()}.pdf`
                );


                toast(
                    "success",
                    "Merged PDF Ready",
                    "All selected PO labels were merged into one PDF."
                );


                return;
            }


            /*
             * MULTIPLE PDF FILES
             * => ZIP
             */

            const files = [];


            for (
                const po of poList
            ) {

                const doc =
                    createPDF(
                        po,
                        range.start,
                        range.end,
                        options
                    );


                files.push({
                    name:
                        `${safeFilename(
                            po
                        )}_BOX_${range.start}-${range.end}.pdf`,

                    blob:
                        doc.output("blob")
                });
            }


            await createZIP(
                files,
                `BOOKSWAGON_PO_LABELS_${Date.now()}.zip`
            );


            toast(
                "success",
                "ZIP Ready",
                `${files.length} PDF file(s) were packed into one ZIP file.`
            );

        } catch (error) {

            console.error(error);

            toast(
                "error",
                "PDF Generation Failed",
                error.message ||
                "Unable to generate the PDF."
            );
        }
    }


    /* =====================================================
       GENERATE OTHER PO
    ===================================================== */

    async function generateOtherPO() {

        try {

            const range =
                getRange(
                    "#otherStartBox",
                    "#otherEndBox"
                );


            if (!range) {
                return;
            }


            const poList =
                getOtherPOList();


            if (!poList.length) {

                toast(
                    "error",
                    "PO Number Required",
                    "Please enter at least one PO number."
                );

                return;
            }


            if (
                !validatePrintMode(
                    $("#otherPrintPO"),
                    $("#otherPrintBox"),
                    $("#otherPrintPOBox")
                )
            ) {
                return;
            }


            const options =
                otherOptions();


            const zip =
                $("#otherZIP")
                    ?.checked;

            const merged =
                $("#otherMergedPDF")
                    ?.checked;


            if (
                poList.length === 1 &&
                !zip &&
                !merged
            ) {

                const doc =
                    createPDF(
                        poList[0],
                        range.start,
                        range.end,
                        options
                    );


                doc.save(
                    `${safeFilename(
                        poList[0]
                    )}_BOX_${range.start}-${range.end}.pdf`
                );


                toast(
                    "success",
                    "PDF Ready",
                    "PDF downloaded directly."
                );


                return;
            }


            if (
                merged &&
                !zip
            ) {

                const doc =
                    createMergedPDF(
                        poList,
                        range.start,
                        range.end,
                        options
                    );


                doc.save(
                    `BOOKSWAGON_OTHER_PO_MERGED_${Date.now()}.pdf`
                );


                toast(
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

                const doc =
                    createPDF(
                        po,
                        range.start,
                        range.end,
                        options
                    );


                files.push({
                    name:
                        `${safeFilename(
                            po
                        )}_BOX_${range.start}-${range.end}.pdf`,

                    blob:
                        doc.output("blob")
                });
            }


            await createZIP(
                files,
                `BOOKSWAGON_OTHER_PO_${Date.now()}.zip`
            );


            toast(
                "success",
                "ZIP Ready",
                `${files.length} PDF file(s) packed into one ZIP.`
            );

        } catch (error) {

            console.error(error);

            toast(
                "error",
                "Generation Failed",
                error.message ||
                "Unable to generate PDF."
            );
        }
    }


    /* =====================================================
       GENERATE SBMO
    ===================================================== */

    async function generateSBMO() {

        try {

            const range =
                getRange(
                    "#sbmoStartBox",
                    "#sbmoEndBox"
                );


            if (!range) {
                return;
            }


            const poList =
                getSBMOPOList();


            if (!poList.length) {

                toast(
                    "error",
                    "PO Number Required",
                    "Please enter at least one PO number."
                );

                return;
            }


            if (
                !validatePrintMode(
                    $("#sbmoPrintPO"),
                    $("#sbmoPrintBox"),
                    $("#sbmoPrintPOBox")
                )
            ) {
                return;
            }


            const options =
                sbmoOptions();


            const zip =
                $("#sbmoZIP")
                    ?.checked;

            const merged =
                $("#sbmoMergedPDF")
                    ?.checked;


            if (
                poList.length === 1 &&
                !zip &&
                !merged
            ) {

                const doc =
                    createPDF(
                        poList[0],
                        range.start,
                        range.end,
                        options
                    );


                doc.save(
                    `${safeFilename(
                        poList[0]
                    )}_SBMO_BOX_${range.start}-${range.end}.pdf`
                );


                toast(
                    "success",
                    "PDF Ready",
                    "SBMO PDF downloaded directly."
                );


                return;
            }


            if (
                merged &&
                !zip
            ) {

                const doc =
                    createMergedPDF(
                        poList,
                        range.start,
                        range.end,
                        options
                    );


                doc.save(
                    `BOOKSWAGON_SBMO_MERGED_${Date.now()}.pdf`
                );


                toast(
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

                const doc =
                    createPDF(
                        po,
                        range.start,
                        range.end,
                        options
                    );


                files.push({
                    name:
                        `${safeFilename(
                            po
                        )}_SBMO_BOX_${range.start}-${range.end}.pdf`,

                    blob:
                        doc.output("blob")
                });
            }


            await createZIP(
                files,
                `BOOKSWAGON_SBMO_${Date.now()}.zip`
            );


            toast(
                "success",
                "ZIP Ready",
                `${files.length} SBMO PDF file(s) packed into one ZIP.`
            );

        } catch (error) {

            console.error(error);

            toast(
                "error",
                "SBMO Generation Failed",
                error.message ||
                "Unable to generate SBMO PDF."
            );
        }
    }


    /* =====================================================
       ADDRESS PDF
    ===================================================== */

    function generateAddressPDF() {

        try {

            const jsPDF =
                requirePDFLibrary();


            const doc =
                new jsPDF({
                    orientation:"portrait",
                    unit:"mm",
                    format:"a4"
                });


            const pageWidth =
                doc.internal.pageSize.getWidth();

            const pageHeight =
                doc.internal.pageSize.getHeight();


            if (
                $("#cocoAddressBorder")
                    ?.checked
            ) {

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
                    align:"center"
                }
            );


            const address =
                $("#cocoFrom")
                    ?.value ||
                "Ground Floor, 2/14, Ansari Rd, Old Delhi, Daryaganj, Delhi, 110002";


            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(11);


            const lines =
                doc.splitTextToSize(
                    address,
                    pageWidth - 50
                );


            doc.text(
                lines,
                25,
                55
            );


            doc.save(
                "BOOKSWAGON_ADDRESS.pdf"
            );


            toast(
                "success",
                "Address PDF Ready",
                "The address PDF has been downloaded."
            );

        } catch (error) {

            console.error(error);

            toast(
                "error",
                "Address PDF Error",
                error.message ||
                "Unable to create address PDF."
            );
        }
    }


    /* =====================================================
       RESET
    ===================================================== */

    function resetInputs() {

        $$(
            'input[type="text"], input[type="number"], textarea'
        ).forEach(input => {

            /*
             * Do not reset contact information
             * automatically.
             */

            if (
                input.id === "cocoFrom" ||
                input.id === "cocoTo"
            ) {
                return;
            }

            input.value = "";
        });


        $$(
            'input[type="checkbox"]'
        ).forEach(checkbox => {

            /*
             * Do NOT use click() here because
             * click() would invoke confirmation.
             */

            checkbox.checked =
                checkbox.dataset.default ===
                "true";
        });


        [
            "#cocoStartBox",
            "#otherStartBox",
            "#sbmoStartBox"
        ].forEach(selector => {

            const input =
                $(selector);

            if (input) {
                input.value = "1";
            }
        });


        [
            "#cocoEndBox",
            "#otherEndBox",
            "#sbmoEndBox"
        ].forEach(selector => {

            const input =
                $(selector);

            if (input) {
                input.value = "200";
            }
        });


        updateAllPreviews();


        toast(
            "success",
            "Reset Complete",
            "The tool has been reset."
        );
    }


    /* =====================================================
       BUTTONS
    ===================================================== */

    function setupButtons() {

        $("#cocoGenerate")
            ?.addEventListener(
                "click",
                generateCocoBlue
            );


        $("#otherGenerate")
            ?.addEventListener(
                "click",
                generateOtherPO
            );


        $("#sbmoGenerate")
            ?.addEventListener(
                "click",
                generateSBMO
            );


        $("#cocoAddressGenerate")
            ?.addEventListener(
                "click",
                generateAddressPDF
            );


        $("#cocoReset")
            ?.addEventListener(
                "click",
                resetInputs
            );


        $("#otherReset")
            ?.addEventListener(
                "click",
                resetInputs
            );
    }


    /* =====================================================
       20 MANUAL PO FIELDS
       CREATE THEM IF HTML ONLY HAS FEWER THAN 20
    ===================================================== */

    function ensureTwentyPOFields() {

        const groups = [
            {
                selector: ".coco-po",
                container: "#cocoPOGrid",
                prefix: "cocoPO"
            },
            {
                selector: ".other-po",
                container: "#otherPOGrid",
                prefix: "otherPO"
            },
            {
                selector: ".sbmo-po",
                container: "#sbmoPOGrid",
                prefix: "sbmoPO"
            }
        ];


        groups.forEach(group => {

            const container =
                $(group.container);


            if (!container) {
                return;
            }


            const existing =
                $$(group.selector, container);


            for (
                let index = existing.length;
                index < 20;
                index++
            ) {

                const input =
                    document.createElement(
                        "input"
                    );


                input.type =
                    "text";

                input.className =
                    group.selector
                        .replace(".", "");

                input.id =
                    `${group.prefix}${index + 1}`;

                input.placeholder =
                    `PO Number ${index + 1}`;

                input.autocomplete =
                    "off";


                container.appendChild(
                    input
                );


                input.addEventListener(
                    "input",
                    updateAllPreviews
                );
            }

        });
    }


    /* =====================================================
       DEFAULT CHECKBOX VALUES
    ===================================================== */

    function markDefaults() {

        $$(
            'input[type="checkbox"]'
        ).forEach(checkbox => {

            if (
                checkbox.dataset.default ===
                undefined
            ) {

                checkbox.dataset.default =
                    checkbox.checked
                        ? "true"
                        : "false";
            }

        });
    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {

        removeOldRangeLimits();

        ensureTwentyPOFields();

        markDefaults();

        setupConfirmationSystem();

        setupToolNavigation();

        setupInputTabs();

        setupLiveInputs();

        setupExcelInputs();

        setupButtons();

        updateAllPreviews();


        console.log(
            "BOOKSWAGON Label Studio initialized."
        );

        console.log(
            "✓ Unlimited box range"
        );

        console.log(
            "✓ 20 manual PO fields"
        );

        console.log(
            "✓ Checkbox confirmation enabled"
        );

        console.log(
            "✓ Single PDF = direct download"
        );

        console.log(
            "✓ Multiple PDFs = ZIP"
        );

        console.log(
            "✓ Merged PDF supported"
        );
    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();
