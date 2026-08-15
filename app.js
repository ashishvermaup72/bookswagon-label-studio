/* =========================================================
   BOOKSWAGON LABEL STUDIO
   FINAL APP.JS
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
    email: "ashish.verma@bookswagon.in",

    mapsURL:
        "https://maps.app.goo.gl/7McYApm1u9x4QSj7A",

    address:
        "Ground Floor, 2/14, Ansari Rd, Old Delhi, Daryaganj, Delhi, 110002",

    maxPOFields: 20
};


/* =========================================================
   SHORTCUTS
========================================================= */

const $ = (selector, root = document) =>
    root.querySelector(selector);

const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


/* =========================================================
   UTILITY
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


function unique(values) {

    const result = [];
    const seen = new Set();

    values.forEach(value => {

        const clean =
            String(value ?? "")
                .trim();

        if (!clean) {
            return;
        }

        const key =
            clean.toUpperCase();

        if (!seen.has(key)) {

            seen.add(key);

            result.push(clean);
        }

    });

    return result;
}


function safeFilename(value) {

    return String(value || "PO")
        .replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            "_"
        )
        .replace(
            /\s+/g,
            "_"
        )
        .slice(0, 100);
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    type,
    title,
    message
) {

    const container =
        $("#toastContainer");


    if (!container) {
        return;
    }


    const toast =
        document.createElement("div");


    toast.className =
        `confirmation-toast ${
            type === "success"
                ? "toast-success"
                : "toast-danger"
        }`;


    toast.innerHTML = `
        <div class="toast-title">
            ${escapeHTML(title)}
        </div>

        <div class="toast-message">
            ${escapeHTML(message)}
        </div>
    `;


    container.appendChild(
        toast
    );


    requestAnimationFrame(() => {

        toast.classList.add(
            "show"
        );

    });


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );


        setTimeout(
            () => toast.remove(),
            250
        );

    }, 3200);
}


/* =========================================================
   CHECKBOX CONFIRMATION
   =========================================================
   
   IMPORTANT:
   The confirmation system is already present in HTML.
   This JS DOES NOT attach another checkbox click handler.
   
   That prevents the old double-toggle bug.
========================================================= */

function setupCheckboxStateTracking() {

    $$(
        'input[type="checkbox"][data-confirm="true"]'
    )
    .forEach(checkbox => {

        checkbox.dataset.initialized =
            "true";


        checkbox.addEventListener(
            "change",
            () => {

                updateAllPreviews();

            }
        );

    });
}


/* =========================================================
   TOOL NAVIGATION
========================================================= */

function setupToolNavigation() {

    $$("[data-open-tool]")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const tool =
                        card.dataset.openTool;


                    $$(".tool-workspace")
                        .forEach(section => {

                            section.classList.remove(
                                "active"
                            );

                        });


                    const workspace =
                        document.getElementById(
                            `${tool}Workspace`
                        );


                    if (!workspace) {
                        return;
                    }


                    workspace.classList.add(
                        "active"
                    );


                    workspace.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );


            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        card.click();

                    }

                }
            );

        });


    $$("[data-close-tool]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    $$(".tool-workspace")
                        .forEach(section => {

                            section.classList.remove(
                                "active"
                            );

                        });


                    $("#tools")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );

        });
}


/* =========================================================
   INPUT TABS
========================================================= */

function setupCocoTabs() {

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
                        .forEach(tab => {

                            tab.classList.toggle(
                                "active",
                                tab === button
                            );

                        });

                }
            );

        });
}


function setupOtherTabs() {

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
                        .forEach(tab => {

                            tab.classList.toggle(
                                "active",
                                tab === button
                            );

                        });

                }
            );

        });
}


/* =========================================================
   PO PARSER
========================================================= */

function parsePOText(text) {

    return unique(
        String(text || "")
            .split(
                /[\n,;]+/
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean)
    );
}


function getCocoPOs() {

    const individual =
        $$(".coco-po")
            .map(
                input =>
                    input.value.trim()
            )
            .filter(Boolean);


    const bulk =
        parsePOText(
            $("#cocoCommaPO")
                ?.value || ""
        );


    return unique([
        ...individual,
        ...bulk
    ]);
}


function getOtherPOs() {

    const individual =
        $$(".other-po")
            .map(
                input =>
                    input.value.trim()
            )
            .filter(Boolean);


    const bulk =
        parsePOText(
            $("#otherCommaPO")
                ?.value || ""
        );


    return unique([
        ...individual,
        ...bulk
    ]);
}


function getSBMOPos() {

    const individual =
        $$(".sbmo-po")
            .map(
                input =>
                    input.value.trim()
            )
            .filter(Boolean);


    const bulk =
        parsePOText(
            $("#sbmoCommaPO")
                ?.value || ""
        );


    return unique([
        ...individual,
        ...bulk
    ]);
}


/* =========================================================
   NUMBER HELPERS
========================================================= */

function getNumber(
    selector,
    fallback = 1
) {

    const element =
        $(selector);


    if (!element) {
        return fallback;
    }


    const value =
        Number(
            element.value
        );


    if (
        !Number.isFinite(value) ||
        value < 1
    ) {

        return fallback;
    }


    return Math.floor(value);
}


function getRange(
    startSelector,
    endSelector
) {

    const start =
        getNumber(
            startSelector,
            1
        );


    const end =
        getNumber(
            endSelector,
            start
        );


    if (end < start) {

        showToast(
            "error",
            "Invalid Box Range",
            "The End Box must be greater than or equal to the Start Box."
        );


        return null;
    }


    return {
        start,
        end
    };
}


/* =========================================================
   PRINT MODE
========================================================= */

function getPrintMode(
    poSelector,
    boxSelector,
    bothSelector
) {

    const po =
        $(poSelector)?.checked === true;

    const box =
        $(boxSelector)?.checked === true;

    const both =
        $(bothSelector)?.checked === true;


    /*
     * If PO + Box is explicitly selected,
     * it wins.
     */

    if (both) {
        return "both";
    }


    if (po && box) {
        return "both";
    }


    if (po) {
        return "po";
    }


    if (box) {
        return "box";
    }


    return "none";
}


function validatePrintMode(
    poSelector,
    boxSelector,
    bothSelector
) {

    const mode =
        getPrintMode(
            poSelector,
            boxSelector,
            bothSelector
        );


    if (mode === "none") {

        showToast(
            "error",
            "Print Option Required",
            "Select PO Number, Box Number, or PO + Box Number."
        );


        return false;
    }


    return true;
}


/* =========================================================
   PREVIEW BUILDER
========================================================= */

function buildPreview(
    po,
    box,
    options
) {

    const mode =
        options.mode;


    let html =
        "";


    /*
     * PO
     */

    if (
        mode === "po" ||
        mode === "both"
    ) {

        html += `
            <div
                class="${
                    options.poBorder
                        ? "preview-item-border"
                        : ""
                }"
            >
                ${escapeHTML(po)}
            </div>
        `;
    }


    /*
     * Cutting line
     */

    if (
        mode === "both" &&
        options.cutting
    ) {

        html += `
            <div class="preview-dotted-line">
                ${
                    options.scissor
                        ? "· · · · · ✂ · · · · ·"
                        : "· · · · · · · · · ·"
                }
            </div>
        `;
    }


    /*
     * Box
     */

    if (
        mode === "box" ||
        mode === "both"
    ) {

        html += `
            <div
                class="${
                    options.boxBorder
                        ? "preview-box-number"
                        : ""
                }"
            >
                BOX NO. ${escapeHTML(box)}
            </div>
        `;
    }


    /*
     * Nothing selected
     */

    if (!html) {

        html = `
            <span
                style="
                    color:#98a2b3;
                    font-size:11px;
                "
            >
                Select a print option
            </span>
        `;
    }


    return `
        <div
            class="
                dynamic-label-preview
                ${
                    options.combinedBorder
                        ? "has-outer-border"
                        : ""
                }
            "
        >
            ${html}
        </div>
    `;
}


/* =========================================================
   COCO OPTIONS
========================================================= */

function getCocoOptions() {

    return {

        mode:
            getPrintMode(
                "#cocoPrintPO",
                "#cocoPrintBox",
                "#cocoPrintPOBox"
            ),

        pageBorder:
            $("#cocoPageBorder")
                ?.checked === true,

        poBorder:
            $("#cocoPOBorder")
                ?.checked === true,

        boxBorder:
            $("#cocoBoxBorder")
                ?.checked === true,

        combinedBorder:
            $("#cocoPOBoxOuterBorder")
                ?.checked === true,

        cutting:
            $("#cocoCutting")
                ?.checked === true,

        scissor:
            $("#cocoScissorLine")
                ?.checked === true,

        bold:
            $("#cocoBoldText")
                ?.checked === true,

        font:
            $("#cocoFont")
                ?.value ||
            "helvetica",

        fontSize:
            getNumber(
                "#cocoFontSize",
                16
            ),

        borderStyle:
            $("#cocoBorderStyle")
                ?.value ||
            "solid"
    };
}


/* =========================================================
   OTHER OPTIONS
========================================================= */

function getOtherOptions() {

    return {

        mode:
            getPrintMode(
                "#otherPrintPO",
                "#otherPrintBox",
                "#otherPrintPOBox"
            ),

        pageBorder:
            $("#otherPageBorder")
                ?.checked === true,

        poBorder:
            $("#otherPOBorder")
                ?.checked === true,

        boxBorder:
            $("#otherBoxBorder")
                ?.checked === true,

        combinedBorder:
            $("#otherPOBoxOuterBorder")
                ?.checked === true,

        cutting:
            $("#otherCutting")
                ?.checked === true,

        scissor: true,

        bold: true,

        font: "helvetica",

        fontSize: 16,

        borderStyle: "solid"
    };
}


/* =========================================================
   SBMO OPTIONS
========================================================= */

function getSBMOOptions() {

    return {

        mode:
            getPrintMode(
                "#sbmoPrintPO",
                "#sbmoPrintBox",
                "#sbmoPrintPOBox"
            ),

        pageBorder: true,

        poBorder:
            $("#sbmoPOBorder")
                ?.checked === true,

        boxBorder:
            $("#sbmoBoxBorder")
                ?.checked === true,

        combinedBorder: false,

        cutting:
            $("#sbmoCutting")
                ?.checked === true,

        scissor: true,

        bold: true,

        font: "helvetica",

        fontSize: 16,

        borderStyle: "solid"
    };
}


/* =========================================================
   PREVIEW UPDATE
========================================================= */

function updateCocoPreview() {

    const page =
        $("#cocoPreviewPage");


    if (!page) {
        return;
    }


    const poList =
        getCocoPOs();


    const po =
        poList[0] ||
        "PO NUMBER";


    const box =
        $("#cocoStartBox")
            ?.value ||
        "1";


    const options =
        getCocoOptions();


    page.innerHTML =
        buildPreview(
            po,
            box,
            options
        );


    page.style.border =
        options.pageBorder
            ? "1.5px solid #101828"
            : "0";
}


function updateOtherPreview() {

    const page =
        $("#otherPreviewPage");


    if (!page) {
        return;
    }


    const poList =
        getOtherPOs();


    const po =
        poList[0] ||
        "PO NUMBER";


    const box =
        $("#otherStartBox")
            ?.value ||
        "1";


    const options =
        getOtherOptions();


    page.innerHTML =
        buildPreview(
            po,
            box,
            options
        );


    page.style.border =
        options.pageBorder
            ? "1.5px solid #101828"
            : "0";
}


function updateSBMOPreview() {

    const page =
        $("#sbmoPreviewPage");


    if (!page) {
        return;
    }


    const poList =
        getSBMOPos();


    const po =
        poList[0] ||
        "PO NUMBER";


    const box =
        $("#sbmoStartBox")
            ?.value ||
        "1";


    const options =
        getSBMOOptions();


    page.innerHTML =
        buildPreview(
            po,
            box,
            options
        );
}


function updateAllPreviews() {

    updateCocoPreview();

    updateOtherPreview();

    updateSBMOPreview();
}


/* =========================================================
   PDF
========================================================= */

function getPDFConstructor() {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        throw new Error(
            "PDF library is not loaded. Please reload the page."
        );
    }


    return window.jspdf.jsPDF;
}


/* =========================================================
   BORDER STYLE
========================================================= */

function applyPDFBorderStyle(
    doc,
    style
) {

    if (style === "double") {

        doc.setLineWidth(
            .7
        );

    } else if (
        style === "dashed"
    ) {

        doc.setLineDashPattern(
            [3, 2],
            0
        );

        doc.setLineWidth(
            .5
        );

    } else {

        doc.setLineDashPattern(
            [],
            0
        );

        doc.setLineWidth(
            .7
        );
    }
}


/* =========================================================
   DRAW LABEL
========================================================= */

function drawLabel(
    doc,
    po,
    box,
    options
) {

    const pageWidth =
        doc.internal.pageSize
            .getWidth();

    const pageHeight =
        doc.internal.pageSize
            .getHeight();


    const centerX =
        pageWidth / 2;


    /*
     * Page border
     */

    if (
        options.pageBorder
    ) {

        doc.setDrawColor(
            17,
            24,
            39
        );

        applyPDFBorderStyle(
            doc,
            options.borderStyle
        );


        doc.rect(
            6,
            6,
            pageWidth - 12,
            pageHeight - 12
        );


        doc.setLineDashPattern(
            [],
            0
        );
    }


    /*
     * Combined outer border
     */

    if (
        options.combinedBorder
    ) {

        doc.setDrawColor(
            17,
            24,
            39
        );

        doc.setLineWidth(
            1
        );

        doc.rect(
            15,
            15,
            pageWidth - 30,
            pageHeight - 30
        );
    }


    let y =
        pageHeight * .35;


    /*
     * Font
     */

    doc.setFont(
        options.font || "helvetica",
        options.bold
            ? "bold"
            : "normal"
    );


    doc.setFontSize(
        options.fontSize || 16
    );


    /*
     * PO NUMBER
     */

    if (
        options.mode === "po" ||
        options.mode === "both"
    ) {

        const text =
            String(po);


        const textWidth =
            doc.getTextWidth(
                text
            );


        const width =
            Math.max(
                70,
                textWidth + 30
            );


        const x =
            centerX -
            width / 2;


        if (
            options.poBorder
        ) {

            doc.setDrawColor(
                17,
                24,
                39
            );

            applyPDFBorderStyle(
                doc,
                options.borderStyle
            );


            doc.rect(
                x,
                y - 16,
                width,
                32
            );


            doc.setLineDashPattern(
                [],
                0
            );
        }


        doc.text(
            text,
            centerX,
            y + 5,
            {
                align: "center"
            }
        );


        y += 50;
    }


    /*
     * Cutting line
     */

    if (
        options.mode === "both" &&
        options.cutting
    ) {

        const left =
            18;

        const right =
            pageWidth - 18;

        const lineY =
            y - 14;


        doc.setDrawColor(
            80,
            80,
            80
        );


        doc.setLineWidth(
            .4
        );


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
            options.scissor
        ) {

            doc.setFontSize(
                10
            );


            doc.text(
                "✂",
                centerX,
                lineY + 3,
                {
                    align:
                        "center"
                }
            );

        }


        y += 28;
    }


    /*
     * BOX NUMBER
     */

    if (
        options.mode === "box" ||
        options.mode === "both"
    ) {

        const text =
            `BOX NO. ${box}`;


        const textWidth =
            doc.getTextWidth(
                text
            );


        const width =
            Math.max(
                90,
                textWidth + 30
            );


        const x =
            centerX -
            width / 2;


        if (
            options.boxBorder
        ) {

            doc.setDrawColor(
                17,
                24,
                39
            );

            applyPDFBorderStyle(
                doc,
                options.borderStyle
            );


            doc.rect(
                x,
                y - 16,
                width,
                32
            );


            doc.setLineDashPattern(
                [],
                0
            );
        }


        doc.text(
            text,
            centerX,
            y + 5,
            {
                align: "center"
            }
        );
    }
}


/* =========================================================
   CREATE PDF
========================================================= */

function createPDF(
    po,
    start,
    end,
    options
) {

    const JsPDF =
        getPDFConstructor();


    const doc =
        new JsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });


    let first =
        true;


    for (
        let box = start;
        box <= end;
        box++
    ) {

        if (!first) {

            doc.addPage();

        }


        first =
            false;


        drawLabel(
            doc,
            po,
            box,
            options
        );
    }


    return doc;
}


/* =========================================================
   MERGED PDF
========================================================= */

function createMergedPDF(
    poList,
    start,
    end,
    options
) {

    const JsPDF =
        getPDFConstructor();


    const doc =
        new JsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
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


            first =
                false;


            drawLabel(
                doc,
                po,
                box,
                options
            );
        }

    });


    return doc;
}


/* =========================================================
   DOWNLOAD
========================================================= */

function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const anchor =
        document.createElement(
            "a"
        );


    anchor.href =
        url;

    anchor.download =
        filename;


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();


    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1500
    );
}


/* =========================================================
   ZIP
========================================================= */

async function createZIP(
    files,
    filename
) {

    if (
        typeof JSZip ===
        "undefined"
    ) {

        throw new Error(
            "ZIP library is not loaded. Please reload the page."
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
        filename
    );
}


/* =========================================================
   DOWNLOAD MODE
========================================================= */

function getDownloadMode(
    zipSelector,
    mergedSelector
) {

    const zip =
        $(zipSelector)
            ?.checked === true;

    const merged =
        $(mergedSelector)
            ?.checked === true;


    if (merged) {
        return "merged";
    }


    if (zip) {
        return "zip";
    }


    return "separate";
}


/* =========================================================
   COCO GENERATOR
========================================================= */

async function generateCoco() {

    try {

        const range =
            getRange(
                "#cocoStartBox",
                "#cocoEndBox"
            );


        if (!range) {
            return;
        }


        if (
            !validatePrintMode(
                "#cocoPrintPO",
                "#cocoPrintBox",
                "#cocoPrintPOBox"
            )
        ) {

            return;
        }


        const poList =
            getCocoPOs();


        if (!poList.length) {

            showToast(
                "error",
                "PO Number Required",
                "Please enter at least one PO number."
            );


            return;
        }


        const options =
            getCocoOptions();


        const mode =
            getDownloadMode(
                "#cocoZIP",
                "#cocoMergedPDF"
            );


        /*
         * ONE PDF
         */

        if (
            poList.length === 1 &&
            mode === "separate"
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


            showToast(
                "success",
                "PDF Downloaded",
                "Your PO label PDF has been downloaded."
            );


            return;
        }


        /*
         * MERGED
         */

        if (
            mode === "merged"
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


            showToast(
                "success",
                "Merged PDF Downloaded",
                "All selected PO labels are in one PDF."
            );


            return;
        }


        /*
         * ZIP
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
                    doc.output(
                        "blob"
                    )

            });

        }


        await createZIP(
            files,
            `BOOKSWAGON_PO_LABELS_${Date.now()}.zip`
        );


        showToast(
            "success",
            "ZIP Downloaded",
            `${files.length} PDF file(s) were packed into one ZIP.`
        );

    } catch (error) {

        console.error(
            "CocoBlue error:",
            error
        );


        showToast(
            "error",
            "Generation Failed",
            error.message ||
            "Unable to generate the PDF."
        );
    }
}


/* =========================================================
   OTHER PO GENERATOR
========================================================= */

async function generateOther() {

    try {

        const range =
            getRange(
                "#otherStartBox",
                "#otherEndBox"
            );


        if (!range) {
            return;
        }


        if (
            !validatePrintMode(
                "#otherPrintPO",
                "#otherPrintBox",
                "#otherPrintPOBox"
            )
        ) {

            return;
        }


        const poList =
            getOtherPOs();


        if (!poList.length) {

            showToast(
                "error",
                "PO Number Required",
                "Please enter at least one PO number."
            );


            return;
        }


        const options =
            getOtherOptions();


        const mode =
            getDownloadMode(
                "#otherZIP",
                "#otherMergedPDF"
            );


        if (
            poList.length === 1 &&
            mode === "separate"
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


            showToast(
                "success",
                "PDF Downloaded",
                "Your PDF has been downloaded."
            );


            return;
        }


        if (
            mode === "merged"
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


            showToast(
                "success",
                "Merged PDF Downloaded",
                "All Other PO labels are in one PDF."
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
                    doc.output(
                        "blob"
                    )

            });

        }


        await createZIP(
            files,
            `BOOKSWAGON_OTHER_PO_${Date.now()}.zip`
        );


        showToast(
            "success",
            "ZIP Downloaded",
            `${files.length} PDF file(s) packed into ZIP.`
        );

    } catch (error) {

        console.error(
            "Other PO error:",
            error
        );


        showToast(
            "error",
            "Generation Failed",
            error.message ||
            "Unable to generate the PDF."
        );
    }
}


/* =========================================================
   SBMO GENERATOR
========================================================= */

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


        if (
            !validatePrintMode(
                "#sbmoPrintPO",
                "#sbmoPrintBox",
                "#sbmoPrintPOBox"
            )
        ) {

            return;
        }


        const poList =
            getSBMOPos();


        if (!poList.length) {

            showToast(
                "error",
                "PO Number Required",
                "Please enter at least one PO number."
            );


            return;
        }


        const options =
            getSBMOOptions();


        const mode =
            getDownloadMode(
                "#sbmoZIP",
                "#sbmoMergedPDF"
            );


        if (
            poList.length === 1 &&
            mode === "separate"
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


            showToast(
                "success",
                "SBMO PDF Downloaded",
                "The SBMO PDF has been downloaded."
            );


            return;
        }


        if (
            mode === "merged"
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


            showToast(
                "success",
                "Merged PDF Downloaded",
                "All SBMO labels are in one PDF."
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
                    doc.output(
                        "blob"
                    )

            });

        }


        await createZIP(
            files,
            `BOOKSWAGON_SBMO_${Date.now()}.zip`
        );


        showToast(
            "success",
            "ZIP Downloaded",
            `${files.length} SBMO PDF file(s) packed into ZIP.`
        );

    } catch (error) {

        console.error(
            "SBMO error:",
            error
        );


        showToast(
            "error",
            "Generation Failed",
            error.message ||
            "Unable to generate SBMO PDF."
        );
    }
}


/* =========================================================
   ADDRESS PDF
========================================================= */

function generateAddressPDF() {

    try {

        const JsPDF =
            getPDFConstructor();


        const doc =
            new JsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });


        const width =
            doc.internal.pageSize
                .getWidth();


        const height =
            doc.internal.pageSize
                .getHeight();


        doc.setDrawColor(
            17,
            24,
            39
        );

        doc.setLineWidth(
            .8
        );


        doc.rect(
            10,
            10,
            width - 20,
            height - 20
        );


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(
            18
        );


        doc.text(
            "BOOKSWAGON OFFICE",
            width / 2,
            32,
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


        const lines =
            doc.splitTextToSize(
                CONFIG.address,
                width - 50
            );


        doc.text(
            lines,
            25,
            55
        );


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            "Email:",
            25,
            82
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            CONFIG.email,
            45,
            82
        );


        doc.save(
            "BOOKSWAGON_OFFICE_ADDRESS.pdf"
        );


        showToast(
            "success",
            "Address PDF Downloaded",
            "The office address PDF has been downloaded."
        );

    } catch (error) {

        console.error(
            error
        );


        showToast(
            "error",
            "Address PDF Failed",
            error.message
        );
    }
}


/* =========================================================
   EXCEL IMPORT
========================================================= */

async function importExcelFile(
    file
) {

    if (!file) {
        return [];
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
                header: 1,
                defval: ""
            }
        );


    const values = [];


    rows.forEach(row => {

        if (!Array.isArray(row)) {
            return;
        }


        row.forEach(cell => {

            const value =
                String(cell || "")
                    .trim();


            if (value) {

                values.push(
                    value
                );

            }

        });

    });


    return unique(values);
}


function setupExcelImport() {

    $("#cocoExcel")
        ?.addEventListener(
            "change",
            async event => {

                try {

                    const values =
                        await importExcelFile(
                            event.target.files[0]
                        );


                    $$(".coco-po")
                        .forEach(
                            (input, index) => {

                                input.value =
                                    values[index] ||
                                    "";

                            }
                        );


                    const status =
                        $("#cocoExcelStatus");


                    if (status) {

                        status.textContent =
                            `${Math.min(
                                values.length,
                                CONFIG.maxPOFields
                            )} PO(s) loaded.`;

                    }


                    updateAllPreviews();

                } catch (error) {

                    showToast(
                        "error",
                        "Excel Import Failed",
                        error.message
                    );

                }

            }
        );


    $("#otherExcel")
        ?.addEventListener(
            "change",
            async event => {

                try {

                    const values =
                        await importExcelFile(
                            event.target.files[0]
                        );


                    $$(".other-po")
                        .forEach(
                            (input, index) => {

                                input.value =
                                    values[index] ||
                                    "";

                            }
                        );


                    updateAllPreviews();

                } catch (error) {

                    showToast(
                        "error",
                        "Excel Import Failed",
                        error.message
                    );

                }

            }
        );
}


/* =========================================================
   QR CODE
========================================================= */

function createQR(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (
        !element ||
        typeof QRCode ===
        "undefined"
    ) {

        return;
    }


    element.innerHTML =
        "";


    new QRCode(
        element,
        {
            text: value,
            width: 140,
            height: 140,
            correctLevel:
                QRCode.CorrectLevel.M
        }
    );
}


function setupQRCodes() {

    createQR(
        "addressQR",
        CONFIG.mapsURL
    );


    createQR(
        "emailQR",
        `mailto:${CONFIG.email}`
    );


    createQR(
        "footerAddressQR",
        CONFIG.mapsURL
    );


    createQR(
        "footerEmailQR",
        `mailto:${CONFIG.email}`
    );
}


/* =========================================================
   BUTTONS
========================================================= */

function setupGenerateButtons() {

    $("#cocoGenerate")
        ?.addEventListener(
            "click",
            generateCoco
        );


    $("#otherGenerate")
        ?.addEventListener(
            "click",
            generateOther
        );


    $("#sbmoGenerate")
        ?.addEventListener(
            "click",
            generateSBMO
        );
}


/* =========================================================
   LIVE PREVIEW
========================================================= */

function setupLivePreview() {

    document.addEventListener(
        "input",
        event => {

            if (
                event.target.matches(
                    "input, textarea, select"
                )
            ) {

                updateAllPreviews();

            }

        }
    );


    document.addEventListener(
        "change",
        event => {

            if (
                event.target.matches(
                    "input, textarea, select"
                )
            ) {

                updateAllPreviews();

            }

        }
    );
}


/* =========================================================
   RESET
========================================================= */

function resetWorkspace(
    workspace
) {

    if (!workspace) {
        return;
    }


    /*
     * Text fields
     */

    $$(
        'input[type="text"], textarea',
        workspace
    )
    .forEach(input => {

        input.value =
            "";

    });


    /*
     * Number fields
     */

    $$(
        'input[type="number"]',
        workspace
    )
    .forEach(input => {

        if (
            input.id.toLowerCase()
                .includes("end")
        ) {

            input.value =
                "200";

        } else {

            input.value =
                "1";

        }

    });


    /*
     * Checkbox reset.
     *
     * IMPORTANT:
     * We directly reset state here.
     * Reset is not a feature toggle.
     */

    $$(
        'input[type="checkbox"]',
        workspace
    )
    .forEach(input => {

        input.checked =
            false;

    });


    updateAllPreviews();


    showToast(
        "success",
        "Reset Complete",
        "The selected tool has been reset."
    );
}


function setupResetButtons() {

    $$("[data-reset]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const workspace =
                        button.closest(
                            ".tool-workspace"
                        );


                    resetWorkspace(
                        workspace
                    );

                }
            );

        });
}


/* =========================================================
   RELOAD → BOTTOM
========================================================= */

function setupReloadPosition() {

    if (
        "scrollRestoration"
        in history
    ) {

        history.scrollRestoration =
            "manual";
    }


    /*
     * Remove old #tools hash.
     */

    if (
        window.location.hash
    ) {

        history.replaceState(
            null,
            "",
            window.location.pathname +
            window.location.search
        );
    }


    const navigation =
        performance
            .getEntriesByType(
                "navigation"
            )[0];


    if (
        navigation &&
        navigation.type === "reload"
    ) {

        setTimeout(
            () => {

                window.scrollTo({
                    top:
                        document.documentElement
                            .scrollHeight,

                    left: 0,

                    behavior:
                        "instant"
                });

            },
            300
        );

    }
}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

    setupCheckboxStateTracking();

    setupToolNavigation();

    setupCocoTabs();

    setupOtherTabs();

    setupExcelImport();

    setupQRCodes();

    setupGenerateButtons();

    setupLivePreview();

    setupResetButtons();

    updateAllPreviews();

    setupReloadPosition();


    console.log(
        "BooksWagon Label Studio initialized."
    );

    console.log(
        "✓ 20 manual PO fields"
    );

    console.log(
        "✓ Comma-separated PO input"
    );

    console.log(
        "✓ Unlimited box range"
    );

    console.log(
        "✓ PO / Box / PO + Box"
    );

    console.log(
        "✓ PO border"
    );

    console.log(
        "✓ Box border"
    );

    console.log(
        "✓ Combined border"
    );

    console.log(
        "✓ Page border"
    );

    console.log(
        "✓ PDF"
    );

    console.log(
        "✓ ZIP"
    );

    console.log(
        "✓ Merged PDF"
    );

    console.log(
        "✓ Address QR"
    );

    console.log(
        "✓ Email QR"
    );

    console.log(
        "✓ Confirmation handled by HTML"
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
        init,
        {
            once: true
        }
    );

} else {

    init();

}
