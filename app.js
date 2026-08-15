/* =========================================================
   BOOKSWAGON PAGES — FINAL SCRIPT.JS
   Simple Checkbox System
   No confirmation dialog
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
    email: "ashish.verma@bookswagon.in",

    maps:
        "https://maps.app.goo.gl/7McYApm1u9x4QSj7A"
};


/* =========================================================
   SHORTCUTS
========================================================= */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    [...document.querySelectorAll(selector)];


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "success") {

    const container = $("#toast");

    if (!container) {
        return;
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast-message ${type}`;

    toast.textContent =
        message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2800);
}


/* =========================================================
   SIMPLE CHECKBOX
   NO CONFIRMATION POPUP
========================================================= */

function setupCheckboxes() {

    $$('.check input[type="checkbox"]')
        .forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                function () {

                    const feature =
                        this.dataset.feature ||
                        "Feature";

                    if (this.checked) {

                        showToast(
                            `${feature} is now enabled.`,
                            "success"
                        );

                    } else {

                        showToast(
                            `${feature} is now disabled.`,
                            "error"
                        );
                    }

                    updatePreviews();
                }
            );

        });
}


/* =========================================================
   TOOL CARDS
========================================================= */

function setupToolCards() {

    $$(".tool-card")
        .forEach(card => {

            const openTool = () => {

                const tool =
                    card.dataset.tool;

                if (!tool) {
                    return;
                }

                $$(".workspace")
                    .forEach(workspace => {

                        workspace.classList.remove(
                            "active"
                        );

                    });

                const workspace =
                    $(`#${tool}Workspace`);

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
            };


            card.addEventListener(
                "click",
                openTool
            );


            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        openTool();
                    }
                }
            );

        });
}


/* =========================================================
   CLOSE WORKSPACE
========================================================= */

function setupCloseButtons() {

    $$(".close-workspace")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    $$(".workspace")
                        .forEach(workspace => {

                            workspace.classList.remove(
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
   TABS
========================================================= */

function setupTabs() {

    $$(".tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.tab;

                    if (!target) {
                        return;
                    }


                    /*
                     * Coco tabs
                     */

                    if (
                        target.startsWith(
                            "coco-"
                        )
                    ) {

                        [
                            "coco-manual",
                            "coco-bulk",
                            "coco-excel"
                        ]
                        .forEach(id => {

                            const element =
                                document.getElementById(
                                    id
                                );

                            if (!element) {
                                return;
                            }

                            element.style.display =
                                id === target
                                    ? "block"
                                    : "none";

                        });


                        $$('.tab[data-tab^="coco-"]')
                            .forEach(item => {

                                item.classList.toggle(
                                    "active",
                                    item === tab
                                );

                            });
                    }

                }
            );

        });
}


/* =========================================================
   PO PARSER
========================================================= */

function parsePOText(text) {

    return [
        ...new Set(

            String(text || "")
                .split(
                    /[\n,;]+/
                )
                .map(
                    value =>
                        value.trim()
                )
                .filter(Boolean)

        )
    ];
}


/* =========================================================
   COCO PO
========================================================= */

function getCocoPOs() {

    const manual =
        $$(".coco-po")
            .map(
                input =>
                    input.value.trim()
            )
            .filter(Boolean);


    const bulk =
        parsePOText(
            $("#cocoBulk")
                ?.value
        );


    return [
        ...new Set([
            ...manual,
            ...bulk
        ])
    ];
}


/* =========================================================
   OTHER PO
========================================================= */

function getOtherPOs() {

    const manual =
        $$(".other-po")
            .map(
                input =>
                    input.value.trim()
            )
            .filter(Boolean);


    const bulk =
        parsePOText(
            $("#otherBulk")
                ?.value
        );


    return [
        ...new Set([
            ...manual,
            ...bulk
        ])
    ];
}


/* =========================================================
   SBMO PO
========================================================= */

function getSBMOPOs() {

    const manual =
        $$(".sbmo-po")
            .map(
                input =>
                    input.value.trim()
            )
            .filter(Boolean);


    const bulk =
        parsePOText(
            $("#sbmoBulk")
                ?.value
        );


    return [
        ...new Set([
            ...manual,
            ...bulk
        ])
    ];
}


/* =========================================================
   BOX RANGE
   NO 200 LIMIT
========================================================= */

function getRange(startSelector, endSelector) {

    const start =
        Number(
            $(startSelector)?.value
        );

    const end =
        Number(
            $(endSelector)?.value
        );


    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end)
    ) {

        showToast(
            "Please enter a valid box range.",
            "error"
        );

        return null;
    }


    if (
        start < 1 ||
        end < 1
    ) {

        showToast(
            "Box numbers must be 1 or greater.",
            "error"
        );

        return null;
    }


    if (
        end < start
    ) {

        showToast(
            "End Box cannot be smaller than Start Box.",
            "error"
        );

        return null;
    }


    return {
        start:
            Math.floor(start),

        end:
            Math.floor(end)
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


/* =========================================================
   VALIDATE PRINT MODE
========================================================= */

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
            "Select PO Number, Box Number or PO + Box.",
            "error"
        );

        return false;
    }


    return true;
}


/* =========================================================
   COCO PREVIEW
========================================================= */

function updateCocoPreview() {

    const preview =
        $("#cocoPreview");

    if (!preview) {
        return;
    }


    const po =
        getCocoPOs()[0] ||
        "PO NUMBER";


    const box =
        $("#cocoStart")
            ?.value ||
        "1";


    const mode =
        getPrintMode(
            "#cocoPO",
            "#cocoBox",
            "#cocoPOBox"
        );


    const poElement =
        $("#previewPO");

    const boxElement =
        $("#previewBox");

    const cutElement =
        $("#previewCut");


    if (
        !poElement ||
        !boxElement ||
        !cutElement
    ) {

        return;
    }


    poElement.textContent =
        po;

    boxElement.textContent =
        `BOX NO. ${box}`;


    poElement.style.display =
        (
            mode === "po" ||
            mode === "both"
        )
            ? "inline-flex"
            : "none";


    boxElement.style.display =
        (
            mode === "box" ||
            mode === "both"
        )
            ? "inline-flex"
            : "none";


    cutElement.style.display =
        (
            mode === "both" &&
            $("#cocoCut")?.checked
        )
            ? "block"
            : "none";


    poElement.classList.toggle(
        "border",
        $("#cocoPOBorder")
            ?.checked === true
    );


    boxElement.classList.toggle(
        "border",
        $("#cocoBoxBorder")
            ?.checked === true
    );


    preview.style.border =
        $("#cocoPageBorder")
            ?.checked === true
            ? "1px solid #111827"
            : "0";


    const label =
        preview.querySelector(
            ".preview-label"
        );


    if (label) {

        label.style.border =
            $("#cocoCombinedBorder")
                ?.checked === true
                ? "2px solid #111827"
                : "0";


        label.style.fontWeight =
            $("#cocoBold")
                ?.checked === true
                ? "900"
                : "400";
    }
}


/* =========================================================
   ALL PREVIEWS
========================================================= */

function updatePreviews() {

    updateCocoPreview();
}


/* =========================================================
   LIVE INPUT
========================================================= */

function setupLiveUpdates() {

    document.addEventListener(
        "input",
        event => {

            if (
                event.target.matches(
                    "input, textarea, select"
                )
            ) {

                updatePreviews();
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

                updatePreviews();
            }
        }
    );
}


/* =========================================================
   PDF LIBRARY
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
   DRAW PDF LABEL
========================================================= */

function drawPDFLabel(
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
     * PAGE BORDER
     */

    if (
        options.pageBorder
    ) {

        doc.setDrawColor(
            17,
            24,
            39
        );

        doc.setLineWidth(
            0.7
        );

        doc.rect(
            7,
            7,
            pageWidth - 14,
            pageHeight - 14
        );
    }


    /*
     * OUTER COMBINED BORDER
     */

    if (
        options.combined
    ) {

        doc.setLineWidth(
            1
        );

        doc.rect(
            20,
            20,
            pageWidth - 40,
            pageHeight - 40
        );
    }


    let y =
        pageHeight * 0.36;


    doc.setFont(
        "helvetica",
        options.bold
            ? "bold"
            : "normal"
    );


    /*
     * PO NUMBER
     */

    if (
        options.mode === "po" ||
        options.mode === "both"
    ) {

        const poText =
            String(po);


        doc.setFontSize(
            18
        );


        const textWidth =
            doc.getTextWidth(
                poText
            );


        if (
            options.poBorder
        ) {

            const boxWidth =
                Math.max(
                    80,
                    textWidth + 30
                );


            doc.setLineWidth(
                0.9
            );


            doc.rect(
                centerX -
                    boxWidth / 2,

                y - 15,

                boxWidth,

                30
            );
        }


        doc.text(
            poText,
            centerX,
            y + 5,
            {
                align:
                    "center"
            }
        );


        y += 50;
    }


    /*
     * CUTTING LINE
     */

    if (
        options.mode === "both" &&
        options.cutting
    ) {

        doc.setDrawColor(
            70,
            70,
            70
        );


        doc.setLineWidth(
            0.4
        );


        doc.setLineDashPattern(
            [3, 3],
            0
        );


        doc.line(
            20,
            y - 15,
            pageWidth - 20,
            y - 15
        );


        doc.setLineDashPattern(
            [],
            0
        );


        if (
            options.scissor
        ) {

            doc.setFontSize(
                10
            );


            doc.text(
                "✂",
                centerX,
                y - 11,
                {
                    align:
                        "center"
                }
            );
        }


        y += 25;
    }


    /*
     * BOX NUMBER
     */

    if (
        options.mode === "box" ||
        options.mode === "both"
    ) {

        const boxText =
            `BOX NO. ${box}`;


        doc.setFontSize(
            16
        );


        const textWidth =
            doc.getTextWidth(
                boxText
            );


        if (
            options.boxBorder
        ) {

            const boxWidth =
                Math.max(
                    100,
                    textWidth + 30
                );


            doc.setLineWidth(
                0.9
            );


            doc.rect(
                centerX -
                    boxWidth / 2,

                y - 15,

                boxWidth,

                30
            );
        }


        doc.text(
            boxText,
            centerX,
            y + 5,
            {
                align:
                    "center"
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
            orientation:
                "portrait",

            unit:
                "mm",

            format:
                "a4"
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


        firstPage =
            false;


        drawPDFLabel(
            doc,
            po,
            box,
            options
        );
    }


    return doc;
}


/* =========================================================
   CREATE MERGED PDF
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
            orientation:
                "portrait",

            unit:
                "mm",

            format:
                "a4"
        });


    let firstPage =
        true;


    poList.forEach(po => {

        for (
            let box = start;
            box <= end;
            box++
        ) {

            if (!firstPage) {
                doc.addPage();
            }


            firstPage =
                false;


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


/* =========================================================
   COCO OPTIONS
========================================================= */

function getCocoOptions() {

    return {

        mode:
            getPrintMode(
                "#cocoPO",
                "#cocoBox",
                "#cocoPOBox"
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

        combined:
            $("#cocoCombinedBorder")
                ?.checked === true,

        cutting:
            $("#cocoCut")
                ?.checked === true,

        scissor:
            $("#cocoScissor")
                ?.checked === true,

        bold:
            $("#cocoBold")
                ?.checked === true
    };
}


/* =========================================================
   GENERATE COCO
========================================================= */

async function generateCoco() {

    try {

        const range =
            getRange(
                "#cocoStart",
                "#cocoEnd"
            );


        if (!range) {
            return;
        }


        if (
            !validatePrintMode(
                "#cocoPO",
                "#cocoBox",
                "#cocoPOBox"
            )
        ) {

            return;
        }


        const poList =
            getCocoPOs();


        if (!poList.length) {

            showToast(
                "Please enter at least one PO number.",
                "error"
            );

            return;
        }


        const options =
            getCocoOptions();


        const merge =
            $("#cocoMerge")
                ?.checked === true;


        const zip =
            $("#cocoZIP")
                ?.checked === true;


        /*
         * MERGED PDF
         */

        if (merge) {

            const doc =
                createMergedPDF(
                    poList,
                    range.start,
                    range.end,
                    options
                );


            doc.save(
                "BOOKSWAGON_MERGED_PO_LABELS.pdf"
            );


            showToast(
                "Merged PDF downloaded successfully.",
                "success"
            );

            return;
        }


        /*
         * ZIP
         */

        if (
            zip &&
            typeof JSZip !==
                "undefined"
        ) {

            const zipFile =
                new JSZip();


            poList.forEach(po => {

                const doc =
                    createPDF(
                        po,
                        range.start,
                        range.end,
                        options
                    );


                zipFile.file(
                    `${safeFilename(po)}_BOX_${range.start}-${range.end}.pdf`,
                    doc.output("blob")
                );

            });


            const blob =
                await zipFile.generateAsync({
                    type: "blob"
                });


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
                "BOOKSWAGON_PO_LABELS.zip";


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
                1000
            );


            showToast(
                "ZIP downloaded successfully.",
                "success"
            );

            return;
        }


        /*
         * SEPARATE PDF
         */

        poList.forEach(po => {

            const doc =
                createPDF(
                    po,
                    range.start,
                    range.end,
                    options
                );


            doc.save(
                `${safeFilename(po)}_BOX_${range.start}-${range.end}.pdf`
            );

        });


        showToast(
            `${poList.length} PDF file(s) generated.`,
            "success"
        );

    } catch (error) {

        console.error(
            "CocoBlue:",
            error
        );


        showToast(
            error.message ||
            "PDF generation failed.",
            "error"
        );
    }
}


/* =========================================================
   OTHER OPTIONS
========================================================= */

function getOtherOptions() {

    return {

        mode:
            getPrintMode(
                "#otherPO",
                "#otherBox",
                "#otherPOBox"
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

        combined:
            $("#otherCombined")
                ?.checked === true,

        cutting:
            $("#otherCut")
                ?.checked === true,

        scissor:
            true,

        bold:
            true
    };
}


/* =========================================================
   GENERATE OTHER PO
========================================================= */

async function generateOther() {

    try {

        const range =
            getRange(
                "#otherStart",
                "#otherEnd"
            );


        if (!range) {
            return;
        }


        if (
            !validatePrintMode(
                "#otherPO",
                "#otherBox",
                "#otherPOBox"
            )
        ) {

            return;
        }


        const poList =
            getOtherPOs();


        if (!poList.length) {

            showToast(
                "Please enter at least one PO number.",
                "error"
            );

            return;
        }


        const options =
            getOtherOptions();


        if (
            $("#otherMerge")
                ?.checked === true
        ) {

            const doc =
                createMergedPDF(
                    poList,
                    range.start,
                    range.end,
                    options
                );


            doc.save(
                "BOOKSWAGON_OTHER_PO_MERGED.pdf"
            );


            showToast(
                "Merged Other PO PDF downloaded.",
                "success"
            );

            return;
        }


        poList.forEach(po => {

            const doc =
                createPDF(
                    po,
                    range.start,
                    range.end,
                    options
                );


            doc.save(
                `${safeFilename(po)}_OTHER_PO.pdf`
            );

        });


        showToast(
            "Other PO PDF(s) generated.",
            "success"
        );

    } catch (error) {

        console.error(
            "Other PO:",
            error
        );


        showToast(
            error.message ||
            "Other PO generation failed.",
            "error"
        );
    }
}


/* =========================================================
   SBMO OPTIONS
========================================================= */

function getSBMOOptions() {

    return {

        mode:
            getPrintMode(
                "#sbmoPO",
                "#sbmoBox",
                "#sbmoPOBox"
            ),

        pageBorder:
            $("#sbmoPageBorder")
                ?.checked === true,

        poBorder:
            $("#sbmoPOBorder")
                ?.checked === true,

        boxBorder:
            $("#sbmoBoxBorder")
                ?.checked === true,

        combined:
            false,

        cutting:
            $("#sbmoCut")
                ?.checked === true,

        scissor:
            true,

        bold:
            true
    };
}


/* =========================================================
   GENERATE SBMO
========================================================= */

async function generateSBMO() {

    try {

        const range =
            getRange(
                "#sbmoStart",
                "#sbmoEnd"
            );


        if (!range) {
            return;
        }


        if (
            !validatePrintMode(
                "#sbmoPO",
                "#sbmoBox",
                "#sbmoPOBox"
            )
        ) {

            return;
        }


        const poList =
            getSBMOPOs();


        if (!poList.length) {

            showToast(
                "Please enter at least one PO number.",
                "error"
            );

            return;
        }


        const options =
            getSBMOOptions();


        if (
            $("#sbmoMerge")
                ?.checked === true
        ) {

            const doc =
                createMergedPDF(
                    poList,
                    range.start,
                    range.end,
                    options
                );


            doc.save(
                "BOOKSWAGON_SBMO_MERGED.pdf"
            );


            showToast(
                "SBMO merged PDF downloaded.",
                "success"
            );

            return;
        }


        poList.forEach(po => {

            const doc =
                createPDF(
                    po,
                    range.start,
                    range.end,
                    options
                );


            doc.save(
                `${safeFilename(po)}_SBMO.pdf`
            );

        });


        showToast(
            "SBMO PDF(s) generated.",
            "success"
        );

    } catch (error) {

        console.error(
            "SBMO:",
            error
        );


        showToast(
            error.message ||
            "SBMO generation failed.",
            "error"
        );
    }
}


/* =========================================================
   SAFE FILE NAME
========================================================= */

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
        .slice(
            0,
            100
        );
}


/* =========================================================
   RESET
========================================================= */

function resetWorkspace(
    workspaceSelector
) {

    const workspace =
        $(workspaceSelector);


    if (!workspace) {
        return;
    }


    /*
     * Text inputs
     */

    $$(
        'input[type="text"]',
        workspace
    )
    .forEach(input => {

        input.value =
            "";

    });


    /*
     * Textareas
     */

    $$(
        "textarea",
        workspace
    )
    .forEach(textarea => {

        textarea.value =
            "";

    });


    /*
     * Checkboxes
     */

    $$(
        'input[type="checkbox"]',
        workspace
    )
    .forEach(checkbox => {

        checkbox.checked =
            false;

    });


    /*
     * Number inputs
     */

    $$(
        'input[type="number"]',
        workspace
    )
    .forEach(input => {

        if (
            input.id
                .toLowerCase()
                .includes("end")
        ) {

            input.value =
                "200";

        } else {

            input.value =
                "1";
        }

    });


    updatePreviews();


    showToast(
        "Tool has been reset.",
        "success"
    );
}


/* =========================================================
   RESET BUTTONS
========================================================= */

function setupResetButtons() {

    $("#cocoReset")
        ?.addEventListener(
            "click",
            () =>
                resetWorkspace(
                    "#cocoWorkspace"
                )
        );


    $("#otherReset")
        ?.addEventListener(
            "click",
            () =>
                resetWorkspace(
                    "#otherWorkspace"
                )
        );


    $("#sbmoReset")
        ?.addEventListener(
            "click",
            () =>
                resetWorkspace(
                    "#sbmoWorkspace"
                )
        );
}


/* =========================================================
   GENERATE BUTTONS
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
   EXCEL IMPORT
========================================================= */

function setupExcel() {

    $("#cocoExcel")
        ?.addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files?.[0];


                if (!file) {
                    return;
                }


                try {

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
                                type:
                                    "array"
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
                                header:
                                    1,

                                defval:
                                    ""
                            }
                        );


                    const values =
                        rows
                            .flat()
                            .map(
                                value =>
                                    String(
                                        value
                                    ).trim()
                            )
                            .filter(Boolean);


                    $$(".coco-po")
                        .forEach(
                            (input, index) => {

                                input.value =
                                    values[index] ||
                                    "";

                            }
                        );


                    updatePreviews();


                    showToast(
                        `${Math.min(values.length, 20)} PO(s) imported.`,
                        "success"
                    );

                } catch (error) {

                    console.error(
                        error
                    );


                    showToast(
                        error.message ||
                        "Excel import failed.",
                        "error"
                    );
                }

            }
        );
}


/* =========================================================
   QR CODE
========================================================= */

function generateQR(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.warn(
            "QRCode library not loaded."
        );

        return;
    }


    element.innerHTML =
        "";


    new QRCode(
        element,
        {
            text:
                value,

            width:
                135,

            height:
                135,

            correctLevel:
                QRCode.CorrectLevel.M
        }
    );
}


function setupQRCodes() {

    generateQR(
        "addressQR",
        CONFIG.maps
    );


    generateQR(
        "emailQR",
        `mailto:${CONFIG.email}`
    );
}


/* =========================================================
   RELOAD / SCROLL
========================================================= */

function setupScrollBehavior() {

    /*
     * Don't force the page to bottom on every load.
     * Browser navigation remains normal.
     */

    if (
        "scrollRestoration"
        in history
    ) {

        history.scrollRestoration =
            "auto";
    }
}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

    setupCheckboxes();

    setupToolCards();

    setupCloseButtons();

    setupTabs();

    setupLiveUpdates();

    setupResetButtons();

    setupGenerateButtons();

    setupExcel();

    setupQRCodes();

    setupScrollBehavior();

    updatePreviews();


    console.log(
        "================================"
    );

    console.log(
        "BooksWagon Pages Label Studio"
    );

    console.log(
        "FINAL JS LOADED"
    );

    console.log(
        "✓ Simple checkboxes"
    );

    console.log(
        "✓ Enable / Disable toast"
    );

    console.log(
        "✓ No confirmation dialog"
    );

    console.log(
        "✓ 20 PO fields"
    );

    console.log(
        "✓ Bulk PO input"
    );

    console.log(
        "✓ Unlimited box range"
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
        "✓ Cutting line"
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
        "================================"
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
