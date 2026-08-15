/* =========================================================
   BOOKSWAGON LABEL STUDIO
   FINAL SCRIPT.JS
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
    email: "ashish.verma@bookswagon.in",

    address:
        "Ground Floor, 2/14, Ansari Rd, Old Delhi, Daryaganj, Delhi, 110002",

    maps:
        "https://maps.app.goo.gl/7McYApm1u9x4QSj7A"
};


/* =========================================================
   STATE
========================================================= */

let currentTool = "Coco Blue";


/* =========================================================
   SHORTCUTS
========================================================= */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    [...document.querySelectorAll(selector)];


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "success") {

    const container =
        $("#toastContainer");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className =
        `toast${type === "error" ? " error" : ""}`;

    toast.textContent =
        message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2800);
}


/* =========================================================
   CREATE 20 PO INPUTS
========================================================= */

function createPOFields() {

    const grid =
        $("#poGrid");

    if (!grid) return;

    grid.innerHTML = "";

    for (let i = 1; i <= 20; i++) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "po-field";


        const label =
            document.createElement("span");

        label.textContent =
            `PO ${i}`;


        const input =
            document.createElement("input");

        input.type =
            "text";

        input.className =
            "po-input";

        input.placeholder =
            `PO Number ${i}`;

        input.autocomplete =
            "off";


        wrapper.append(
            label,
            input
        );


        grid.appendChild(
            wrapper
        );
    }
}


/* =========================================================
   PARSE MULTIPLE PO
========================================================= */

function parsePOText(value) {

    return String(value || "")
        .split(/[\n,;|]+/)
        .map(item => item.trim())
        .filter(Boolean);
}


/* =========================================================
   GET PO LIST
========================================================= */

function getPOList() {

    const individual =
        $$(".po-input")
            .map(input =>
                input.value.trim()
            )
            .filter(Boolean);


    const bulk =
        parsePOText(
            $("#bulkPO")?.value
        );


    return [
        ...new Set([
            ...individual,
            ...bulk
        ])
    ];
}


/* =========================================================
   INPUT TABS
========================================================= */

function setupInputTabs() {

    $$(".input-tab")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.input;


                    $$(".input-tab")
                        .forEach(item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        });


                    $("#individualInput")
                        ?.classList.toggle(
                            "active",
                            target === "individual"
                        );


                    $("#bulkInput")
                        ?.classList.toggle(
                            "active",
                            target === "bulk"
                        );

                }
            );

        });
}


/* =========================================================
   TOOL SELECTION
========================================================= */

function openTool(tool) {

    currentTool =
        tool;


    const title =
        $("#workspaceTitle");

    const description =
        $("#workspaceDescription");


    if (title) {

        title.textContent =
            `${tool} Label Generator`;

    }


    if (description) {

        description.textContent =
            `Create ${tool} PO and Box labels with complete customization.`;

    }


    $("#workspace")
        ?.classList.add("active");


    $$(".tool-select-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.selectTool === tool
            );

        });


    $("#workspace")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    updatePreview();
}


/* =========================================================
   TOOL CARDS
========================================================= */

function setupTools() {

    $$(".tool-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    openTool(
                        card.dataset.tool
                    );

                }
            );

        });


    $$(".tool-select-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openTool(
                        button.dataset.selectTool
                    );

                }
            );

        });


    $("#closeWorkspace")
        ?.addEventListener(
            "click",
            () => {

                $("#workspace")
                    ?.classList.remove(
                        "active"
                    );


                $("#tools")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );

}


/* =========================================================
   SIMPLE CHECKBOX SYSTEM
   NO CONFIRMATION POPUP
========================================================= */

function setupCheckboxes() {

    $$(".feature-checkbox input")
        .forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    const feature =
                        checkbox.dataset.feature ||
                        "Feature";


                    if (checkbox.checked) {

                        showToast(
                            `${feature} is enabled.`,
                            "success"
                        );

                    } else {

                        showToast(
                            `${feature} is disabled.`,
                            "error"
                        );

                    }


                    updatePreview();

                }
            );

        });

}


/* =========================================================
   PRINT MODE
========================================================= */

function getPrintMode() {

    const po =
        $("#printPO")?.checked === true;

    const box =
        $("#printBox")?.checked === true;

    const both =
        $("#printPOBox")?.checked === true;


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
   BORDER WIDTH
========================================================= */

function getBorderWidth() {

    const value =
        $("#borderSize")?.value;


    if (value === "thin") {
        return 1;
    }


    if (value === "thick") {
        return 4;
    }


    return 2;
}


/* =========================================================
   UPDATE PREVIEW
========================================================= */

function updatePreview() {

    const mode =
        getPrintMode();


    const po =
        getPOList()[0] ||
        "PO NUMBER";


    const box =
        $("#startBox")?.value ||
        "1";


    const previewPO =
        $("#previewPO");

    const previewBox =
        $("#previewBox");

    const previewCut =
        $("#previewCut");

    const previewPage =
        $("#labelPreview");

    const previewContent =
        $("#previewContent");


    if (
        !previewPO ||
        !previewBox ||
        !previewCut ||
        !previewPage ||
        !previewContent
    ) {
        return;
    }


    /* Content */

    previewPO.textContent =
        po;

    previewBox.textContent =
        `BOX NO. ${box}`;


    previewPO.classList.toggle(
        "hidden-preview",
        !(
            mode === "po" ||
            mode === "both"
        )
    );


    previewBox.classList.toggle(
        "hidden-preview",
        !(
            mode === "box" ||
            mode === "both"
        )
    );


    previewCut.classList.toggle(
        "hidden-preview",
        !(
            mode === "both" &&
            $("#cutLine")?.checked
        )
    );


    /* =====================================================
       PAGE SIZE PREVIEW
    ===================================================== */

    const pageSizes = {

        A4: {
            width: 420,
            height: 594
        },

        A5: {
            width: 340,
            height: 480
        },

        A6: {
            width: 280,
            height: 395
        },

        LETTER: {
            width: 420,
            height: 545
        },

        LEGAL: {
            width: 420,
            height: 650
        },

        CUSTOM: {
            width:
                Number(
                    $("#customWidth")?.value
                ) || 210,

            height:
                Number(
                    $("#customHeight")?.value
                ) || 297
        }

    };


    const selectedSize =
        $("#pageSize")?.value ||
        "A4";


    const size =
        pageSizes[selectedSize] ||
        pageSizes.A4;


    let width =
        size.width;

    let height =
        size.height;


    if (
        $("#orientation")?.value ===
        "landscape"
    ) {

        [
            width,
            height
        ] = [
            height,
            width
        ];

    }


    const maxWidth =
        540;

    const maxHeight =
        520;


    const scale =
        Math.min(
            maxWidth / width,
            maxHeight / height
        );


    previewPage.style.width =
        `${Math.max(
            250,
            width * scale
        )}px`;


    previewPage.style.minHeight =
        `${Math.max(
            280,
            height * scale
        )}px`;


    /* =====================================================
       PAGE BORDER
    ===================================================== */

    const borderColor =
        $("#borderColor")?.value ||
        "#111827";


    const borderStyle =
        $("#borderStyle")?.value ||
        "solid";


    const borderWidth =
        getBorderWidth();


    previewPage.style.border =
        $("#pageBorder")?.checked
            ? `${borderWidth}px ${borderStyle} ${borderColor}`
            : "0";


    /* =====================================================
       PO BORDER
    ===================================================== */

    previewPO.style.border =
        $("#poBorder")?.checked
            ? `${borderWidth}px ${borderStyle} ${borderColor}`
            : "0";


    /* =====================================================
       BOX BORDER
    ===================================================== */

    previewBox.style.border =
        $("#boxBorder")?.checked
            ? `${borderWidth}px ${borderStyle} ${borderColor}`
            : "0";


    /* =====================================================
       COMBINED BORDER
    ===================================================== */

    previewContent.style.border =
        $("#combinedBorder")?.checked
            ? `${borderWidth}px ${borderStyle} ${borderColor}`
            : "0";


    /* =====================================================
       FONT
    ===================================================== */

    const fonts = {

        helvetica:
            "Arial, Helvetica, sans-serif",

        times:
            "Times New Roman, Times, serif",

        courier:
            "Courier New, Courier, monospace",

        georgia:
            "Georgia, serif"

    };


    previewContent.style.fontFamily =
        fonts[
            $("#fontFamily")?.value
        ] ||
        fonts.helvetica;


    previewContent.style.fontSize =
        `${$("#fontSize")?.value || 18}px`;


    previewContent.style.fontWeight =
        $("#fontBold")?.checked
            ? "900"
            : "400";


    previewContent.style.fontStyle =
        $("#fontItalic")?.checked
            ? "italic"
            : "normal";


    previewContent.style.textDecoration =
        $("#fontUnderline")?.checked
            ? "underline"
            : "none";

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

                updatePreview();

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

                updatePreview();

            }

        }
    );

}


/* =========================================================
   PAGE FORMAT
========================================================= */

function getPageFormat() {

    const size =
        $("#pageSize")?.value ||
        "A4";


    if (size === "A4") {
        return "a4";
    }


    if (size === "A5") {
        return "a5";
    }


    if (size === "A6") {
        return "a6";
    }


    if (size === "LETTER") {
        return "letter";
    }


    if (size === "LEGAL") {
        return "legal";
    }


    return [
        Number(
            $("#customWidth")?.value
        ) || 210,

        Number(
            $("#customHeight")?.value
        ) || 297
    ];

}


/* =========================================================
   FONT STYLE
========================================================= */

function getPDFFontStyle() {

    const bold =
        $("#fontBold")?.checked === true;

    const italic =
        $("#fontItalic")?.checked === true;


    if (
        bold &&
        italic
    ) {

        return "bolditalic";

    }


    if (bold) {
        return "bold";
    }


    if (italic) {
        return "italic";
    }


    return "normal";
}


/* =========================================================
   PDF FONT
========================================================= */

function getPDFFont() {

    const value =
        $("#fontFamily")?.value;


    /*
     * jsPDF built-in fonts:
     * helvetica
     * times
     * courier
     */

    if (
        value === "times"
    ) {

        return "times";

    }


    if (
        value === "courier"
    ) {

        return "courier";

    }


    /*
     * Georgia falls back to Times
     * because jsPDF doesn't have Georgia
     * as a built-in font.
     */

    return "helvetica";
}


/* =========================================================
   HEX → RGB
========================================================= */

function hexToRGB(hex) {

    hex =
        String(hex || "#111827")
            .replace("#", "");


    if (hex.length !== 6) {

        return {
            r: 17,
            g: 24,
            b: 39
        };

    }


    return {

        r:
            parseInt(
                hex.substring(0, 2),
                16
            ),

        g:
            parseInt(
                hex.substring(2, 4),
                16
            ),

        b:
            parseInt(
                hex.substring(4, 6),
                16
            )

    };

}


/* =========================================================
   PDF BORDER STYLE
========================================================= */

function applyPDFLineStyle(doc) {

    const style =
        $("#borderStyle")?.value ||
        "solid";


    if (
        style === "dashed"
    ) {

        doc.setLineDashPattern(
            [4, 3],
            0
        );

    } else if (
        style === "dotted"
    ) {

        doc.setLineDashPattern(
            [1, 2],
            0
        );

    } else {

        doc.setLineDashPattern(
            [],
            0
        );

    }

}


/* =========================================================
   DRAW BORDER
========================================================= */

function drawPDFBorder(
    doc,
    x,
    y,
    width,
    height
) {

    const style =
        $("#borderStyle")?.value ||
        "solid";


    applyPDFLineStyle(doc);


    if (
        style === "double"
    ) {

        doc.rect(
            x,
            y,
            width,
            height
        );


        doc.rect(
            x + 2,
            y + 2,
            width - 4,
            height - 4
        );

    } else {

        doc.rect(
            x,
            y,
            width,
            height
        );

    }


    doc.setLineDashPattern(
        [],
        0
    );

}


/* =========================================================
   DRAW ONE PDF LABEL
========================================================= */

function drawLabel(
    doc,
    po,
    box
) {

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();


    const center =
        pageWidth / 2;


    const rgb =
        hexToRGB(
            $("#borderColor")?.value
        );


    const lineWidth =
        getBorderWidth();


    /* =====================================================
       PAGE BORDER
    ===================================================== */

    if (
        $("#pageBorder")?.checked
    ) {

        doc.setDrawColor(
            rgb.r,
            rgb.g,
            rgb.b
        );

        doc.setLineWidth(
            lineWidth
        );


        drawPDFBorder(
            doc,
            7,
            7,
            pageWidth - 14,
            pageHeight - 14
        );

    }


    /* =====================================================
       FONT
    ===================================================== */

    doc.setFont(
        getPDFFont(),
        getPDFFontStyle()
    );


    doc.setFontSize(
        Number(
            $("#fontSize")?.value
        ) || 18
    );


    let y =
        pageHeight / 2 - 35;


    const mode =
        getPrintMode();


    /* =====================================================
       PO
    ===================================================== */

    if (
        mode === "po" ||
        mode === "both"
    ) {

        const poText =
            String(po);


        const poWidth =
            doc.getTextWidth(
                poText
            );


        if (
            $("#poBorder")?.checked
        ) {

            doc.setDrawColor(
                rgb.r,
                rgb.g,
                rgb.b
            );

            doc.setLineWidth(
                lineWidth
            );


            drawPDFBorder(
                doc,

                center -
                    (poWidth + 30) / 2,

                y - 14,

                poWidth + 30,

                28
            );

        }


        doc.text(
            poText,
            center,
            y + 5,
            {
                align: "center"
            }
        );


        y += 48;

    }


    /* =====================================================
       CUTTING LINE
    ===================================================== */

    if (
        mode === "both" &&
        $("#cutLine")?.checked
    ) {

        const lineStyle =
            $("#cutLineStyle")?.value ||
            "dashed";


        doc.setDrawColor(
            70,
            70,
            70
        );


        doc.setLineWidth(
            .5
        );


        if (
            lineStyle === "dashed"
        ) {

            doc.setLineDashPattern(
                [4, 3],
                0
            );

        } else if (
            lineStyle === "dotted"
        ) {

            doc.setLineDashPattern(
                [1, 3],
                0
            );

        } else {

            doc.setLineDashPattern(
                [],
                0
            );

        }


        doc.line(
            20,
            y - 10,
            pageWidth - 20,
            y - 10
        );


        doc.setLineDashPattern(
            [],
            0
        );


        if (
            $("#scissorMark")?.checked
        ) {

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(
                10
            );


            doc.text(
                "✂",
                center,
                y - 6,
                {
                    align: "center"
                }
            );


            doc.setFont(
                getPDFFont(),
                getPDFFontStyle()
            );


            doc.setFontSize(
                Number(
                    $("#fontSize")?.value
                ) || 18
            );

        }


        y += 25;

    }


    /* =====================================================
       BOX
    ===================================================== */

    if (
        mode === "box" ||
        mode === "both"
    ) {

        const boxText =
            `BOX NO. ${box}`;


        const boxWidth =
            doc.getTextWidth(
                boxText
            );


        if (
            $("#boxBorder")?.checked
        ) {

            doc.setDrawColor(
                rgb.r,
                rgb.g,
                rgb.b
            );

            doc.setLineWidth(
                lineWidth
            );


            drawPDFBorder(
                doc,

                center -
                    (boxWidth + 30) / 2,

                y - 14,

                boxWidth + 30,

                28
            );

        }


        doc.text(
            boxText,
            center,
            y + 5,
            {
                align: "center"
            }
        );

    }


    /* =====================================================
       COMBINED BORDER
    ===================================================== */

    if (
        $("#combinedBorder")?.checked
    ) {

        doc.setDrawColor(
            rgb.r,
            rgb.g,
            rgb.b
        );

        doc.setLineWidth(
            lineWidth
        );


        drawPDFBorder(
            doc,

            18,
            pageHeight / 2 - 82,

            pageWidth - 36,
            164
        );

    }


    /* =====================================================
       UNDERLINE
    ===================================================== */

    if (
        $("#fontUnderline")?.checked
    ) {

        /*
         * jsPDF doesn't have a native underline
         * option for text, so a line is drawn
         * below the main content.
         */

        doc.setDrawColor(
            rgb.r,
            rgb.g,
            rgb.b
        );

        doc.setLineWidth(
            .5
        );


        doc.line(
            center - 45,
            y + 10,
            center + 45,
            y + 10
        );

    }

}


/* =========================================================
   VALIDATE SETTINGS
========================================================= */

function validateSettings() {

    const mode =
        getPrintMode();


    if (
        mode === "none"
    ) {

        showToast(
            "Select PO Number Only, Box Number Only, or PO + Box.",
            "error"
        );

        return false;

    }


    const poList =
        getPOList();


    if (
        poList.length === 0
    ) {

        showToast(
            "Please enter at least one PO number.",
            "error"
        );

        return false;

    }


    const start =
        Number(
            $("#startBox")?.value
        );


    const end =
        Number(
            $("#endBox")?.value
        );


    if (
        !Number.isInteger(start) ||
        !Number.isInteger(end)
    ) {

        showToast(
            "Start Box and End Box must be valid numbers.",
            "error"
        );

        return false;

    }


    if (
        start < 1 ||
        end < start
    ) {

        showToast(
            "Please enter a valid Box range.",
            "error"
        );

        return false;

    }


    return true;

}


/* =========================================================
   BUILD PDF FOR ONE PO
========================================================= */

function buildPDF(
    po
) {

    const JsPDF =
        window.jspdf?.jsPDF;


    if (!JsPDF) {

        throw new Error(
            "jsPDF library is not available."
        );

    }


    const orientation =
        $("#orientation")?.value ||
        "portrait";


    const format =
        getPageFormat();


    const doc =
        new JsPDF({

            orientation,

            unit: "mm",

            format

        });


    const start =
        Number(
            $("#startBox").value
        );


    const end =
        Number(
            $("#endBox").value
        );


    const copies =
        Math.max(
            1,
            Number(
                $("#copies").value
            ) || 1
        );


    let firstPage =
        true;


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

            if (!firstPage) {

                doc.addPage();

            }


            firstPage =
                false;


            drawLabel(
                doc,
                po,
                box
            );

        }

    }


    return doc;

}


/* =========================================================
   GENERATE SEPARATE PDFS
========================================================= */

function generateSeparatePDFs(
    poList
) {

    poList.forEach(
        po => {

            const doc =
                buildPDF(po);


            doc.save(
                `${safeFilename(po)}_${safeFilename(currentTool)}.pdf`
            );

        }
    );

}


/* =========================================================
   GENERATE MERGED PDF
========================================================= */

function generateMergedPDF(
    poList
) {

    const JsPDF =
        window.jspdf?.jsPDF;


    const orientation =
        $("#orientation")?.value ||
        "portrait";


    const format =
        getPageFormat();


    const merged =
        new JsPDF({

            orientation,

            unit: "mm",

            format

        });


    let firstPage =
        true;


    const start =
        Number(
            $("#startBox").value
        );


    const end =
        Number(
            $("#endBox").value
        );


    const copies =
        Math.max(
            1,
            Number(
                $("#copies").value
            ) || 1
        );


    for (
        const po of poList
    ) {

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

                if (!firstPage) {

                    merged.addPage();

                }


                firstPage =
                    false;


                drawLabel(
                    merged,
                    po,
                    box
                );

            }

        }

    }


    merged.save(
        `${safeFilename(currentTool)}_MERGED.pdf`
    );

}


/* =========================================================
   GENERATE ZIP
========================================================= */

async function generateZIP(
    poList
) {

    if (
        typeof JSZip ===
        "undefined"
    ) {

        throw new Error(
            "JSZip library is not available."
        );

    }


    const zip =
        new JSZip();


    poList.forEach(
        po => {

            const doc =
                buildPDF(po);


            zip.file(
                `${safeFilename(po)}_${safeFilename(currentTool)}.pdf`,
                doc.output("blob")
            );

        }
    );


    const blob =
        await zip.generateAsync({
            type: "blob"
        });


    downloadBlob(
        blob,
        `${safeFilename(currentTool)}_LABELS.zip`
    );

}


/* =========================================================
   MAIN GENERATOR
========================================================= */

async function generatePDF() {

    try {

        if (
            !validateSettings()
        ) {

            return;

        }


        const poList =
            getPOList();


        const merge =
            $("#mergePDF")?.checked === true;


        const zip =
            $("#zipPDF")?.checked === true;


        /*
         * If both are selected, ZIP takes priority.
         * This prevents two conflicting download modes.
         */

        if (zip) {

            await generateZIP(
                poList
            );


            showToast(
                "ZIP file downloaded successfully."
            );


            return;

        }


        if (merge) {

            generateMergedPDF(
                poList
            );


            showToast(
                "Merged PDF downloaded successfully."
            );


            return;

        }


        generateSeparatePDFs(
            poList
        );


        showToast(
            `${poList.length} PDF file(s) generated successfully.`
        );


    } catch (error) {

        console.error(
            "PDF generation error:",
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
   SAFE FILE NAME
========================================================= */

function safeFilename(
    value
) {

    return String(value || "LABEL")
        .replace(
            /[^a-z0-9_-]+/gi,
            "_"
        )
        .replace(
            /^_+|_+$/g,
            ""
        )
        .slice(
            0,
            80
        ) || "LABEL";

}


/* =========================================================
   DOWNLOAD BLOB
========================================================= */

function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


/* =========================================================
   RESET
========================================================= */

function resetWorkspace() {

    $$(".po-input")
        .forEach(
            input => {

                input.value = "";

            }
        );


    if ($("#bulkPO")) {

        $("#bulkPO").value =
            "";

    }


    $("#startBox").value =
        "1";


    $("#endBox").value =
        "200";


    $("#copies").value =
        "1";


    $("#labelsPerPage").value =
        "1";


    $$(".feature-checkbox input")
        .forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );


    $("#pageSize").value =
        "A4";


    $("#orientation").value =
        "portrait";


    $("#customWidth").value =
        "210";


    $("#customHeight").value =
        "297";


    $("#borderSize").value =
        "medium";


    $("#borderStyle").value =
        "solid";


    $("#borderColor").value =
        "#111827";


    $("#fontFamily").value =
        "helvetica";


    $("#fontSize").value =
        "18";


    $("#cutLineStyle").value =
        "dashed";


    updatePreview();


    showToast(
        "All settings have been reset."
    );

}


/* =========================================================
   RESET BUTTON
========================================================= */

$("#resetButton")
    ?.addEventListener(
        "click",
        resetWorkspace
    );


/* =========================================================
   GENERATE BUTTON
========================================================= */

$("#generateButton")
    ?.addEventListener(
        "click",
        generatePDF
    );


/* =========================================================
   QR CODES
========================================================= */

function createQR(
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


    element.innerHTML =
        "";


    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.warn(
            "QRCode library is not loaded."
        );

        return;

    }


    new QRCode(
        element,
        {

            text: value,

            width: 130,

            height: 130,

            correctLevel:
                QRCode.CorrectLevel.M

        }
    );

}


function setupQR() {

    createQR(
        "addressQR",
        CONFIG.maps
    );


    createQR(
        "emailQR",
        `mailto:${CONFIG.email}`
    );

}


/* =========================================================
   PAGE SIZE / ORIENTATION HELPERS
========================================================= */

function setupPageSettings() {

    $("#pageSize")
        ?.addEventListener(
            "change",
            updatePreview
        );


    $("#orientation")
        ?.addEventListener(
            "change",
            updatePreview
        );


    $("#customWidth")
        ?.addEventListener(
            "input",
            updatePreview
        );


    $("#customHeight")
        ?.addEventListener(
            "input",
            updatePreview
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

    createPOFields();

    setupInputTabs();

    setupTools();

    setupCheckboxes();

    setupLivePreview();

    setupPageSettings();

    setupQR();

    updatePreview();


    /*
     * Default selected tool
     */

    $$(".tool-select-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.selectTool ===
                currentTool
            );

        });


    console.log(
        "======================================"
    );

    console.log(
        "BOOKSWAGON LABEL STUDIO"
    );

    console.log(
        "FINAL SCRIPT LOADED"
    );

    console.log(
        "✓ Coco Blue"
    );

    console.log(
        "✓ Other PO"
    );

    console.log(
        "✓ ISB"
    );

    console.log(
        "✓ 20 PO fields"
    );

    console.log(
        "✓ Bulk PO"
    );

    console.log(
        "✓ Unlimited box range"
    );

    console.log(
        "✓ PO / Box / PO + Box"
    );

    console.log(
        "✓ Page size"
    );

    console.log(
        "✓ Orientation"
    );

    console.log(
        "✓ Border size"
    );

    console.log(
        "✓ Border style"
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
        "✓ Font family"
    );

    console.log(
        "✓ Font size"
    );

    console.log(
        "✓ Bold / Italic / Underline"
    );

    console.log(
        "✓ Cutting line"
    );

    console.log(
        "✓ Scissor mark"
    );

    console.log(
        "✓ Separate PDF"
    );

    console.log(
        "✓ Merged PDF"
    );

    console.log(
        "✓ ZIP"
    );

    console.log(
        "✓ QR codes"
    );

    console.log(
        "✓ Simple checkbox ON/OFF"
    );

    console.log(
        "✓ No confirmation popup"
    );

    console.log(
        "======================================"
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
