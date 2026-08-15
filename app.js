"use strict";

/* =========================================================
   BOOKSWAGON LABEL STUDIO — FINAL JS
========================================================= */

const CONFIG = {
    email: "ashish.verma@bookswagon.in",
    address:
        "Ground Floor, 2/14, Ansari Rd, Old Delhi, Daryaganj, Delhi, 110002",
    maps: "https://maps.app.goo.gl/7McYApm1u9x4QSj7A"
};

let currentTool = "Coco Blue";
let excelRows = [];
let addressExcelRows = [];


/* =========================================================
   HELPERS
========================================================= */

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeFilename(value) {
    return String(value || "LABEL")
        .replace(/[^a-z0-9_-]+/gi, "_")
        .slice(0, 80);
}

function toast(message, type = "success") {
    const container = $("#toastContainer");

    if (!container) {
        console.log(message);
        return;
    }

    const item = document.createElement("div");

    item.className =
        type === "error"
            ? "toast error"
            : "toast";

    item.textContent = message;

    container.appendChild(item);

    setTimeout(() => {
        item.remove();
    }, 2800);
}


/* =========================================================
   LOAD JSZIP IF NOT AVAILABLE
========================================================= */

function ensureJSZip() {
    return new Promise((resolve, reject) => {

        if (window.JSZip) {
            resolve(window.JSZip);
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

        script.onload = () => {
            if (window.JSZip) {
                resolve(window.JSZip);
            } else {
                reject(
                    new Error("JSZip could not be loaded.")
                );
            }
        };

        script.onerror = () => {
            reject(
                new Error("Unable to load ZIP library.")
            );
        };

        document.head.appendChild(script);
    });
}


/* =========================================================
   CREATE 20 PO FIELDS
========================================================= */

function createPOFields() {

    const grid = $("#poGrid");

    if (!grid) return;

    grid.innerHTML = "";

    for (let i = 1; i <= 20; i++) {

        const wrapper = document.createElement("div");

        wrapper.className = "po-field";

        const label = document.createElement("span");

        label.textContent = `PO ${i}`;

        const input = document.createElement("input");

        input.type = "text";
        input.className = "po-input";
        input.placeholder = `PO Number ${i}`;

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        grid.appendChild(wrapper);
    }
}


/* =========================================================
   PARSE MULTIPLE VALUES
========================================================= */

function parseList(value) {

    return String(value || "")
        .split(/[\n,;|]+/)
        .map(item => item.trim())
        .filter(Boolean);
}


/* =========================================================
   FIND EXCEL VALUE
========================================================= */

function findValue(row, possibleNames) {

    if (!row || typeof row !== "object") {
        return "";
    }

    const keys = Object.keys(row);

    for (const name of possibleNames) {

        const wanted =
            name
                .toLowerCase()
                .replace(/[\s_-]/g, "");

        const matchedKey = keys.find(key => {

            return (
                key
                    .toLowerCase()
                    .replace(/[\s_-]/g, "") === wanted
            );

        });

        if (
            matchedKey &&
            row[matchedKey] !== undefined &&
            row[matchedKey] !== null
        ) {
            return String(row[matchedKey]).trim();
        }
    }

    return "";
}


/* =========================================================
   GET PO / ISBN LIST
========================================================= */

function getPOList() {

    const manual =
        $$(".po-input")
            .map(input => input.value.trim())
            .filter(Boolean);

    const bulk =
        parseList(
            $("#bulkPO")?.value
        );

    const excel =
        excelRows
            .map(row =>
                findValue(row, [
                    "PO",
                    "PO Number",
                    "PONumber",
                    "ISBN",
                    "ISBN Number"
                ])
            )
            .filter(Boolean);

    return [
        ...new Set([
            ...manual,
            ...bulk,
            ...excel
        ])
    ];
}


/* =========================================================
   EXCEL PREVIEW
========================================================= */

function showExcelPreview(rows, targetSelector) {

    const container = $(targetSelector);

    if (!container) return;

    if (!rows || !rows.length) {
        container.innerHTML = "";
        return;
    }

    const columns = Object.keys(rows[0]);

    let html = "<table>";
    html += "<thead><tr>";

    columns.forEach(column => {
        html += `<th>${escapeHTML(column)}</th>`;
    });

    html += "</tr></thead>";
    html += "<tbody>";

    rows.slice(0, 10).forEach(row => {

        html += "<tr>";

        columns.forEach(column => {

            html +=
                `<td>${escapeHTML(row[column])}</td>`;

        });

        html += "</tr>";
    });

    html += "</tbody>";
    html += "</table>";

    container.innerHTML = html;
}


/* =========================================================
   PO / ISBN EXCEL UPLOAD
========================================================= */

const excelFile = $("#excelFile");

if (excelFile) {

    excelFile.addEventListener("change", async event => {

        const file = event.target.files[0];

        if (!file) return;

        try {

            if (!window.XLSX) {
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

            excelRows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    {
                        defval: ""
                    }
                );

            const status = $("#excelStatus");

            if (status) {
                status.textContent =
                    `${excelRows.length} Excel row(s) loaded successfully.`;
            }

            showExcelPreview(
                excelRows,
                "#excelPreview"
            );

            toast(
                `${excelRows.length} Excel row(s) loaded.`
            );

            updatePreview();

        } catch (error) {

            console.error(error);

            toast(
                "Could not read the Excel file.",
                "error"
            );
        }
    });
}


/* =========================================================
   ADDRESS EXCEL UPLOAD
========================================================= */

const addressExcelFile =
    $("#addressExcelFile");

if (addressExcelFile) {

    addressExcelFile.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];

            if (!file) return;

            try {

                if (!window.XLSX) {
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

                addressExcelRows =
                    XLSX.utils.sheet_to_json(
                        sheet,
                        {
                            defval: ""
                        }
                    );

                const status =
                    $("#addressExcelStatus");

                if (status) {
                    status.textContent =
                        `${addressExcelRows.length} address row(s) loaded.`;
                }

                showExcelPreview(
                    addressExcelRows,
                    "#addressExcelPreview"
                );

                if (addressExcelRows.length) {
                    applyAddressRow(
                        addressExcelRows[0]
                    );
                }

                toast(
                    `${addressExcelRows.length} address row(s) loaded.`
                );

            } catch (error) {

                console.error(error);

                toast(
                    "Could not read address Excel file.",
                    "error"
                );
            }
        }
    );
}


/* =========================================================
   APPLY ADDRESS ROW
========================================================= */

function applyAddressRow(row) {

    const name =
        findValue(row, [
            "Name",
            "Customer Name",
            "Company",
            "Company Name",
            "To Name"
        ]);

    const address =
        findValue(row, [
            "Address",
            "To Address",
            "Shipping Address"
        ]);

    const city =
        findValue(row, [
            "City"
        ]);

    const state =
        findValue(row, [
            "State"
        ]);

    const pin =
        findValue(row, [
            "PIN",
            "Pincode",
            "Pin Code",
            "Postal Code"
        ]);

    const completeAddress =
        [
            address,
            city,
            state,
            pin
        ]
        .filter(Boolean)
        .join(", ");

    if ($("#toName")) {
        $("#toName").value = name;
    }

    if ($("#toAddress")) {
        $("#toAddress").value =
            completeAddress;
    }

    if ($("#stickerToName")) {
        $("#stickerToName").value =
            name;
    }

    if ($("#stickerToAddress")) {
        $("#stickerToAddress").value =
            completeAddress;
    }

    updateAddressPreview();
}


/* =========================================================
   OPEN TOOL
========================================================= */

function openTool(tool) {

    currentTool = tool;

    const workspace =
        $("#workspace");

    if (!workspace) return;

    workspace.classList.add("active");

    if ($("#workspaceTitle")) {
        $("#workspaceTitle").textContent =
            `${tool} Generator`;
    }

    if ($("#workspaceDescription")) {

        $("#workspaceDescription").textContent =
            tool === "Address Sticker"
                ? "Create From BooksWagon → To Customer / Company address stickers."
                : `Create ${tool} labels with Excel and address support.`;
    }

    $$(".tool-select-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.selectTool === tool
            );

        });

    configureToolUI();

    workspace.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   TOOL UI
========================================================= */

function configureToolUI() {

    const isAddressSticker =
        currentTool === "Address Sticker";

    const isISBN =
        currentTool === "ISBN";

    const poSection =
        $("#poSection");

    const boxSection =
        $("#boxSection");

    const poAddressSection =
        $("#poAddressSection");

    const addressSection =
        $("#addressSection");

    const printSection =
        $("#printSection");

    const borderSection =
        $("#borderSection");

    const fontSection =
        $("#fontSection");

    const cutSection =
        $("#cutSection");

    const previewSection =
        $("#labelPreviewSection");

    if (poSection) {
        poSection.style.display =
            isAddressSticker
                ? "none"
                : "";
    }

    if (boxSection) {
        boxSection.style.display =
            isAddressSticker || isISBN
                ? "none"
                : "";
    }

    if (poAddressSection) {
        poAddressSection.style.display =
            !isAddressSticker &&
            !isISBN
                ? ""
                : "none";
    }

    if (addressSection) {
        addressSection.style.display =
            isAddressSticker
                ? ""
                : "none";
    }

    if (printSection) {
        printSection.style.display =
            isAddressSticker
                ? "none"
                : "";
    }

    if (borderSection) {
        borderSection.style.display =
            isAddressSticker
                ? "none"
                : "";
    }

    if (fontSection) {
        fontSection.style.display =
            isAddressSticker
                ? "none"
                : "";
    }

    if (cutSection) {
        cutSection.style.display =
            isAddressSticker
                ? "none"
                : "";
    }

    if (previewSection) {
        previewSection.style.display =
            isAddressSticker
                ? "none"
                : "";
    }

    updatePreview();
    updateAddressPreview();
}


/* =========================================================
   TOOL CARD EVENTS
========================================================= */

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


const closeWorkspace =
    $("#closeWorkspace");

if (closeWorkspace) {

    closeWorkspace.addEventListener(
        "click",
        () => {

            $("#workspace")
                ?.classList.remove("active");

            $("#tools")
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        }
    );
}


/* =========================================================
   INPUT TABS
========================================================= */

$$(".input-tab")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.input;

                if (!target) return;

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

                $("#excelInput")
                    ?.classList.toggle(
                        "active",
                        target === "excel"
                    );
            }
        );

    });


/* =========================================================
   ADDRESS TABS
========================================================= */

$$("[data-address-input]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.addressInput;

                $$("[data-address-input]")
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );

                    });

                $("#addressManualPanel")
                    ?.classList.toggle(
                        "active",
                        type === "manual"
                    );

                $("#addressExcelPanel")
                    ?.classList.toggle(
                        "active",
                        type === "excel"
                    );

            }
        );

    });


/* =========================================================
   SIMPLE CHECKBOXES
   NO CONFIRMATION POPUP
========================================================= */

$$(".feature-checkbox input")
    .forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                const feature =
                    checkbox.dataset.feature ||
                    "Feature";

                if (checkbox.checked) {

                    toast(
                        `${feature} enabled.`
                    );

                } else {

                    toast(
                        `${feature} disabled.`,
                        "error"
                    );
                }

                updatePreview();
            }
        );

    });


/* =========================================================
   PRINT MODE
========================================================= */

function getPrintMode() {

    const po =
        $("#printPO")?.checked || false;

    const box =
        $("#printBox")?.checked || false;

    const both =
        $("#printPOBox")?.checked || false;

    if (both || (po && box)) {
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
   UPDATE PREVIEW
========================================================= */

function updatePreview() {

    const previewPO =
        $("#previewPO");

    const previewBox =
        $("#previewBox");

    if (!previewPO || !previewBox) {
        return;
    }

    const mode =
        getPrintMode();

    const po =
        getPOList()[0] ||
        "PO NUMBER";

    const box =
        $("#startBox")?.value ||
        "1";

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

    $("#previewCut")
        ?.classList.toggle(
            "hidden-preview",
            !(
                mode === "both" &&
                $("#cutLine")?.checked
            )
        );

    updatePreviewStyle();
}


/* =========================================================
   PREVIEW STYLE
========================================================= */

function updatePreviewStyle() {

    const labelPreview =
        $("#labelPreview");

    const previewContent =
        $("#previewContent");

    const previewPO =
        $("#previewPO");

    const previewBox =
        $("#previewBox");

    if (
        !labelPreview ||
        !previewContent
    ) {
        return;
    }

    const color =
        $("#borderColor")?.value ||
        "#111827";

    const borderSize =
        $("#borderSize")?.value ||
        "medium";

    const borderWidth =
        borderSize === "thin"
            ? 1
            : borderSize === "thick"
                ? 4
                : 2;

    const borderStyle =
        $("#borderStyle")?.value ||
        "solid";

    labelPreview.style.border =
        $("#pageBorder")?.checked
            ? `${borderWidth}px ${borderStyle} ${color}`
            : "0";

    if (previewPO) {

        previewPO.style.border =
            $("#poBorder")?.checked
                ? `${borderWidth}px ${borderStyle} ${color}`
                : "0";
    }

    if (previewBox) {

        previewBox.style.border =
            $("#boxBorder")?.checked
                ? `${borderWidth}px ${borderStyle} ${color}`
                : "0";
    }

    previewContent.style.border =
        $("#combinedBorder")?.checked
            ? `${borderWidth}px ${borderStyle} ${color}`
            : "0";

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
        ] || fonts.helvetica;

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
   ADDRESS PREVIEW
========================================================= */

function updateAddressPreview() {

    const isSticker =
        currentTool === "Address Sticker";

    const fromName =
        isSticker
            ? $("#stickerFromName")?.value
            : $("#fromName")?.value;

    const fromAddress =
        isSticker
            ? $("#stickerFromAddress")?.value
            : $("#fromAddress")?.value;

    const toName =
        isSticker
            ? $("#stickerToName")?.value
            : $("#toName")?.value;

    const toAddress =
        isSticker
            ? $("#stickerToAddress")?.value
            : $("#toAddress")?.value;

    if ($("#previewFromName")) {

        $("#previewFromName").textContent =
            fromName ||
            "BooksWagon";
    }

    if ($("#previewFromAddress")) {

        $("#previewFromAddress").textContent =
            fromAddress ||
            CONFIG.address;
    }

    if ($("#previewToName")) {

        $("#previewToName").textContent =
            toName ||
            "XYZ Company";
    }

    if ($("#previewToAddress")) {

        $("#previewToAddress").textContent =
            toAddress ||
            "Customer / Company Address";
    }
}


/* =========================================================
   LIVE INPUT UPDATE
========================================================= */

document.addEventListener(
    "input",
    event => {

        if (
            event.target.matches(
                "input, textarea, select"
            )
        ) {

            updatePreview();
            updateAddressPreview();
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
            updateAddressPreview();
        }
    }
);


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
   HEX → RGB
========================================================= */

function hexToRGB(hex) {

    let value =
        String(hex || "#111827")
            .replace("#", "");

    if (value.length === 3) {

        value =
            value
                .split("")
                .map(x => x + x)
                .join("");
    }

    return {
        r: parseInt(
            value.substring(0, 2),
            16
        ),

        g: parseInt(
            value.substring(2, 4),
            16
        ),

        b: parseInt(
            value.substring(4, 6),
            16
        )
    };
}


/* =========================================================
   PDF BORDER
========================================================= */

function drawBorder(
    doc,
    x,
    y,
    width,
    height
) {

    const style =
        $("#borderStyle")?.value ||
        "solid";

    if (style === "dashed") {

        doc.setLineDashPattern(
            [4, 3],
            0
        );

        doc.rect(
            x,
            y,
            width,
            height
        );

        doc.setLineDashPattern(
            [],
            0
        );

        return;
    }

    if (style === "dotted") {

        doc.setLineDashPattern(
            [1, 2],
            0
        );

        doc.rect(
            x,
            y,
            width,
            height
        );

        doc.setLineDashPattern(
            [],
            0
        );

        return;
    }

    if (style === "double") {

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

        return;
    }

    doc.rect(
        x,
        y,
        width,
        height
    );
}


/* =========================================================
   DRAW LABEL
========================================================= */

function drawLabel(
    doc,
    po,
    box
) {

    const width =
        doc.internal.pageSize.getWidth();

    const height =
        doc.internal.pageSize.getHeight();

    const center =
        width / 2;

    const rgb =
        hexToRGB(
            $("#borderColor")?.value
        );

    const borderWidth =
        $("#borderSize")?.value === "thin"
            ? 0.5
            : $("#borderSize")?.value === "thick"
                ? 1.8
                : 1;

    doc.setDrawColor(
        rgb.r,
        rgb.g,
        rgb.b
    );

    doc.setLineWidth(
        borderWidth
    );

    if (
        $("#pageBorder")?.checked
    ) {

        drawBorder(
            doc,
            7,
            7,
            width - 14,
            height - 14
        );
    }

    let font =
        "helvetica";

    const selectedFont =
        $("#fontFamily")?.value;

    if (selectedFont === "times") {
        font = "times";
    }

    if (selectedFont === "courier") {
        font = "courier";
    }

    let fontStyle =
        "normal";

    const bold =
        $("#fontBold")?.checked;

    const italic =
        $("#fontItalic")?.checked;

    if (bold && italic) {
        fontStyle = "bolditalic";
    } else if (bold) {
        fontStyle = "bold";
    } else if (italic) {
        fontStyle = "italic";
    }

    doc.setFont(
        font,
        fontStyle
    );

    doc.setFontSize(
        Number(
            $("#fontSize")?.value
        ) || 18
    );

    const mode =
        getPrintMode();

    let y =
        height / 2 - 30;


    /* ---------------- PO ---------------- */

    if (
        mode === "po" ||
        mode === "both"
    ) {

        const text =
            String(po);

        const textWidth =
            doc.getTextWidth(text);

        if (
            $("#poBorder")?.checked
        ) {

            drawBorder(
                doc,
                center -
                    (textWidth + 30) / 2,
                y - 13,
                textWidth + 30,
                26
            );
        }

        doc.text(
            text,
            center,
            y + 5,
            {
                align: "center"
            }
        );

        y += 48;
    }


    /* ---------------- CUT LINE ---------------- */

    if (
        mode === "both" &&
        $("#cutLine")?.checked
    ) {

        doc.setLineDashPattern(
            [4, 3],
            0
        );

        doc.setLineWidth(0.5);

        doc.line(
            20,
            y - 10,
            width - 20,
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

            doc.setFontSize(10);

            doc.text(
                "✂",
                center,
                y - 5,
                {
                    align: "center"
                }
            );

            doc.setFont(
                font,
                fontStyle
            );

            doc.setFontSize(
                Number(
                    $("#fontSize")?.value
                ) || 18
            );
        }

        y += 22;
    }


    /* ---------------- BOX ---------------- */

    if (
        mode === "box" ||
        mode === "both"
    ) {

        const text =
            `BOX NO. ${box}`;

        const textWidth =
            doc.getTextWidth(text);

        if (
            $("#boxBorder")?.checked
        ) {

            drawBorder(
                doc,
                center -
                    (textWidth + 30) / 2,
                y - 13,
                textWidth + 30,
                26
            );
        }

        doc.text(
            text,
            center,
            y + 5,
            {
                align: "center"
            }
        );
    }


    /* ---------------- COMBINED BORDER ---------------- */

    if (
        $("#combinedBorder")?.checked
    ) {

        drawBorder(
            doc,
            18,
            height / 2 - 80,
            width - 36,
            160
        );
    }
}


/* =========================================================
   BUILD PO PDF
========================================================= */

function buildPOPDF(po) {

    if (!window.jspdf) {
        throw new Error(
            "jsPDF library is not loaded."
        );
    }

    const JsPDF =
        window.jspdf.jsPDF;

    const doc =
        new JsPDF({

            orientation:
                $("#orientation")?.value ||
                "portrait",

            unit: "mm",

            format:
                getPageFormat()
        });

    const start =
        Math.max(
            1,
            Number(
                $("#startBox")?.value
            ) || 1
        );

    const end =
        Math.max(
            start,
            Number(
                $("#endBox")?.value
            ) || start
        );

    const copies =
        Math.max(
            1,
            Number(
                $("#copies")?.value
            ) || 1
        );

    let firstPage = true;

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

            firstPage = false;

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
   ADDRESS PDF
========================================================= */

function buildAddressPDF(
    fromName,
    fromAddress,
    toName,
    toAddress
) {

    if (!window.jspdf) {
        throw new Error(
            "jsPDF library is not loaded."
        );
    }

    const JsPDF =
        window.jspdf.jsPDF;

    const doc =
        new JsPDF({

            orientation: "landscape",

            unit: "mm",

            format: "a6"
        });

    const width =
        doc.internal.pageSize.getWidth();

    const height =
        doc.internal.pageSize.getHeight();


    /* Outer border */

    doc.setDrawColor(
        17,
        24,
        39
    );

    doc.setLineWidth(1);

    doc.rect(
        6,
        6,
        width - 12,
        height - 12
    );


    /* Heading */

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.text(
        "FROM",
        15,
        22
    );

    doc.text(
        "TO",
        width / 2 + 10,
        22
    );


    /* Names */

    doc.setFontSize(14);

    doc.text(
        fromName ||
        "BooksWagon",
        15,
        33
    );

    doc.text(
        toName ||
        "Customer / Company",
        width / 2 + 10,
        33
    );


    /* Addresses */

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    const fromLines =
        doc.splitTextToSize(
            fromAddress ||
            CONFIG.address,
            width / 2 - 30
        );

    const toLines =
        doc.splitTextToSize(
            toAddress ||
            "Customer Address",
            width / 2 - 30
        );

    doc.text(
        fromLines,
        15,
        44
    );

    doc.text(
        toLines,
        width / 2 + 10,
        44
    );


    /* Divider */

    doc.setLineDashPattern(
        [3, 3],
        0
    );

    doc.line(
        width / 2,
        12,
        width / 2,
        height - 12
    );

    doc.setLineDashPattern(
        [],
        0
    );

    return doc;
}


/* =========================================================
   DOWNLOAD BLOB
========================================================= */

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

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}


/* =========================================================
   GENERATE ADDRESS STICKERS
========================================================= */

async function generateAddressStickers() {

    if (!addressExcelRows.length) {

        const doc =
            buildAddressPDF(
                $("#stickerFromName")?.value,
                $("#stickerFromAddress")?.value,
                $("#stickerToName")?.value,
                $("#stickerToAddress")?.value
            );

        doc.save(
            "BooksWagon_Address_Sticker.pdf"
        );

        toast(
            "Address sticker PDF downloaded."
        );

        return;
    }


    const JSZipClass =
        await ensureJSZip();

    const zip =
        new JSZipClass();


    addressExcelRows.forEach(
        (row, index) => {

            const name =
                findValue(
                    row,
                    [
                        "Name",
                        "Customer Name",
                        "Company",
                        "Company Name",
                        "To Name"
                    ]
                );

            const address =
                findValue(
                    row,
                    [
                        "Address",
                        "To Address",
                        "Shipping Address"
                    ]
                );

            const city =
                findValue(
                    row,
                    ["City"]
                );

            const state =
                findValue(
                    row,
                    ["State"]
                );

            const pin =
                findValue(
                    row,
                    [
                        "PIN",
                        "Pincode",
                        "Pin Code",
                        "Postal Code"
                    ]
                );

            const completeAddress =
                [
                    address,
                    city,
                    state,
                    pin
                ]
                .filter(Boolean)
                .join(", ");


            const doc =
                buildAddressPDF(
                    $("#stickerFromName")?.value ||
                    "BooksWagon",

                    $("#stickerFromAddress")?.value ||
                    CONFIG.address,

                    name ||
                    "Customer / Company",

                    completeAddress ||
                    "Customer Address"
                );


            zip.file(
                `Address_Sticker_${index + 1}.pdf`,
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
        "BooksWagon_Address_Stickers.zip"
    );


    toast(
        `${addressExcelRows.length} address stickers downloaded.`
    );
}


/* =========================================================
   GENERATE PO / ISBN
========================================================= */

async function generatePOLabels() {

    const list =
        getPOList();

    if (!list.length) {

        toast(
            "Please enter or upload at least one PO / ISBN.",
            "error"
        );

        return;
    }


    if (
        currentTool !== "ISBN" &&
        getPrintMode() === "none"
    ) {

        toast(
            "Select PO Number, Box Number or PO + Box.",
            "error"
        );

        return;
    }


    const merge =
        $("#mergePDF")?.checked;

    const zipRequested =
        $("#zipPDF")?.checked;


    /* =====================================================
       ZIP
    ===================================================== */

    if (zipRequested) {

        const JSZipClass =
            await ensureJSZip();

        const zip =
            new JSZipClass();


        list.forEach(po => {

            const doc =
                buildPOPDF(po);

            zip.file(
                `${safeFilename(po)}.pdf`,
                doc.output("blob")
            );

        });


        const blob =
            await zip.generateAsync({
                type: "blob"
            });


        downloadBlob(
            blob,
            `${safeFilename(currentTool)}_Labels.zip`
        );


        toast(
            "ZIP downloaded successfully."
        );

        return;
    }


    /* =====================================================
       MERGED PDF
    ===================================================== */

    if (merge) {

        const JsPDF =
            window.jspdf.jsPDF;

        const merged =
            new JsPDF({

                orientation:
                    $("#orientation")?.value ||
                    "portrait",

                unit: "mm",

                format:
                    getPageFormat()
            });


        let firstPage = true;


        const start =
            Math.max(
                1,
                Number(
                    $("#startBox")?.value
                ) || 1
            );

        const end =
            Math.max(
                start,
                Number(
                    $("#endBox")?.value
                ) || start
            );

        const copies =
            Math.max(
                1,
                Number(
                    $("#copies")?.value
                ) || 1
            );


        for (const po of list) {

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

                    firstPage = false;

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


        toast(
            "Merged PDF downloaded."
        );

        return;
    }


    /* =====================================================
       SEPARATE PDFs
    ===================================================== */

    list.forEach(po => {

        const doc =
            buildPOPDF(po);

        doc.save(
            `${safeFilename(po)}_${safeFilename(currentTool)}.pdf`
        );

    });


    toast(
        `${list.length} PDF file(s) generated.`
    );
}


/* =========================================================
   MAIN GENERATE BUTTON
========================================================= */

const generateButton =
    $("#generateButton");

if (generateButton) {

    generateButton.addEventListener(
        "click",
        async () => {

            try {

                generateButton.disabled =
                    true;

                generateButton.textContent =
                    "Generating...";


                if (
                    currentTool ===
                    "Address Sticker"
                ) {

                    await generateAddressStickers();

                } else {

                    await generatePOLabels();

                }

            } catch (error) {

                console.error(error);

                toast(
                    error.message ||
                    "Generation failed.",
                    "error"
                );

            } finally {

                generateButton.disabled =
                    false;

                generateButton.textContent =
                    "Generate PDF";
            }
        }
    );
}


/* =========================================================
   RESET
========================================================= */

const resetButton =
    $("#resetButton");

if (resetButton) {

    resetButton.addEventListener(
        "click",
        () => {

            $$(".po-input")
                .forEach(input => {
                    input.value = "";
                });


            if ($("#bulkPO")) {
                $("#bulkPO").value = "";
            }


            if ($("#startBox")) {
                $("#startBox").value = "1";
            }


            if ($("#endBox")) {
                $("#endBox").value = "200";
            }


            if ($("#copies")) {
                $("#copies").value = "1";
            }


            $$(".feature-checkbox input")
                .forEach(checkbox => {
                    checkbox.checked = false;
                });


            if ($("#toName")) {
                $("#toName").value = "";
            }


            if ($("#toAddress")) {
                $("#toAddress").value = "";
            }


            if ($("#stickerToName")) {
                $("#stickerToName").value = "";
            }


            if ($("#stickerToAddress")) {
                $("#stickerToAddress").value = "";
            }


            excelRows = [];
            addressExcelRows = [];


            if ($("#excelStatus")) {
                $("#excelStatus").textContent =
                    "No Excel file selected.";
            }


            if ($("#addressExcelStatus")) {
                $("#addressExcelStatus").textContent =
                    "No address Excel selected.";
            }


            if ($("#excelPreview")) {
                $("#excelPreview").innerHTML = "";
            }


            if ($("#addressExcelPreview")) {
                $("#addressExcelPreview").innerHTML = "";
            }


            updatePreview();
            updateAddressPreview();


            toast(
                "Settings reset successfully."
            );
        }
    );
}


/* =========================================================
   QR CODE
========================================================= */

function makeQR(
    id,
    text
) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.innerHTML = "";

    if (typeof QRCode === "undefined") {
        return;
    }

    new QRCode(
        element,
        {
            text: text,

            width: 130,

            height: 130,

            correctLevel:
                QRCode.CorrectLevel.M
        }
    );
}


makeQR(
    "addressQR",
    CONFIG.maps
);

makeQR(
    "emailQR",
    `mailto:${CONFIG.email}`
);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createPOFields();

        openTool(
            "Coco Blue"
        );

        updatePreview();

        updateAddressPreview();

    }
);


/*
=========================================================
IMPORTANT
=========================================================

HTML HEAD should contain:

jsPDF
XLSX
QRCode

Example:

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

JSZip is loaded automatically by this file when ZIP is required.

=========================================================
*/
