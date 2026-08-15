"use strict";

/* =========================================================
   BOOKSWAGON LABEL STUDIO
   FINAL JAVASCRIPT
========================================================= */

const CONFIG = {
    email: "ashish.verma@bookswagon.in",
    address: "Ground Floor, 2/14 Ansari Road, Daryaganj, Delhi - 110002",
    maps: "https://maps.app.goo.gl/7McYApm1u9x4QSj7A"
};

let currentTool = "Coco Blue PO";

let poExcelRows = [];
let isbnExcelRows = [];
let addressExcelRows = [];


/* =========================================================
   HELPERS
========================================================= */

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function toast(message, type = "success") {

    const container = $("#toastContainer");

    if (!container) return;

    const item = document.createElement("div");

    item.className =
        "toast" +
        (type === "error" ? " error" : "");

    item.textContent = message;

    container.appendChild(item);

    setTimeout(() => {
        item.remove();
    }, 2600);
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function safeFileName(value) {

    return String(value || "LABEL")
        .replace(/[^a-z0-9_-]+/gi, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80);
}


function downloadBlob(blob, filename) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}


function showElement(selector, visible) {

    const element = $(selector);

    if (!element) return;

    element.style.display = visible ? "" : "none";
}


function splitValues(value) {

    return String(value || "")
        .split(/[\n,;|]+/)
        .map(value => value.trim())
        .filter(Boolean);
}


/* =========================================================
   PO INPUTS
========================================================= */

function createPOInputs() {

    const grid = $("#poGrid");

    if (!grid) return;

    grid.innerHTML = "";

    for (let i = 1; i <= 20; i++) {

        const wrapper =
            document.createElement("div");

        wrapper.className = "po-field";

        wrapper.innerHTML = `
            <span>PO ${i}</span>

            <input
                class="po-input"
                type="text"
                placeholder="PO Number ${i}"
                autocomplete="off"
            >
        `;

        grid.appendChild(wrapper);
    }
}


/* =========================================================
   TOOL SWITCHING
========================================================= */

function openTool(tool) {

    currentTool = tool;

    $("#workspace")?.classList.add("active");

    const title = $("#workspaceTitle");
    const description = $("#workspaceDescription");

    if (title) {
        title.textContent = tool;
    }

    if (description) {

        if (tool === "Coco Blue PO") {

            description.textContent =
                "Coco Blue PO and Box label generator.";

        } else if (tool === "Other PO") {

            description.textContent =
                "Other PO and Box label generator.";

        } else if (tool === "ISBN Barcode") {

            description.textContent =
                "ISBN barcode generator.";

        } else {

            description.textContent =
                "From and To address sticker generator.";
        }
    }

    $$(".tool-select-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.selectTool === tool
        );

    });

    configureTool();

    $("#workspace")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function configureTool() {

    const isPO =
        currentTool === "Coco Blue PO" ||
        currentTool === "Other PO";

    const isISBN =
        currentTool === "ISBN Barcode";

    const isAddress =
        currentTool === "Address Sticker";


    showElement("#poInputSection", isPO);
    showElement("#boxSection", isPO);
    showElement("#poAddressSection", isPO);
    showElement("#printSection", isPO);
    showElement("#borderSection", isPO);
    showElement("#fontSection", isPO);
    showElement("#previewSection", isPO);
    showElement("#downloadSection", true);


    showElement("#isbnSection", isISBN);
    showElement("#addressSection", isAddress);


    updatePreview();
    updateISBNPreview();
    updateAddressPreview();
}


/* =========================================================
   TOOL CARDS
========================================================= */

$$(".tool-card").forEach(card => {

    card.addEventListener("click", () => {

        openTool(card.dataset.tool);

    });

});


$$(".tool-select-btn").forEach(button => {

    button.addEventListener("click", () => {

        openTool(button.dataset.selectTool);

    });

});


$("#openStudio")?.addEventListener("click", () => {

    $("#tools")?.scrollIntoView({
        behavior: "smooth"
    });

});


$("#closeWorkspace")?.addEventListener("click", () => {

    $("#workspace")?.classList.remove("active");

    $("#tools")?.scrollIntoView({
        behavior: "smooth"
    });

});


/* =========================================================
   PO INPUT TABS
========================================================= */

$$("[data-input]").forEach(button => {

    button.addEventListener("click", () => {

        const mode = button.dataset.input;

        $$("[data-input]").forEach(item => {

            item.classList.toggle(
                "active",
                item === button
            );

        });


        $("#individualInput")
            ?.classList.toggle(
                "active",
                mode === "individual"
            );


        $("#multipleInput")
            ?.classList.toggle(
                "active",
                mode === "multiple"
            );


        $("#poExcelInput")
            ?.classList.toggle(
                "active",
                mode === "excel"
            );

    });

});


/* =========================================================
   ISBN TABS
========================================================= */

$$("[data-isbn-input]").forEach(button => {

    button.addEventListener("click", () => {

        const mode =
            button.dataset.isbnInput;

        $$("[data-isbn-input]").forEach(item => {

            item.classList.toggle(
                "active",
                item === button
            );

        });


        $("#isbnManual")
            ?.classList.toggle(
                "active",
                mode === "manual"
            );


        $("#isbnExcel")
            ?.classList.toggle(
                "active",
                mode === "excel"
            );

    });

});


/* =========================================================
   ADDRESS TABS
========================================================= */

$$("[data-address-mode]").forEach(button => {

    button.addEventListener("click", () => {

        const mode =
            button.dataset.addressMode;

        $$("[data-address-mode]").forEach(item => {

            item.classList.toggle(
                "active",
                item === button
            );

        });


        $("#addressManual")
            ?.classList.toggle(
                "active",
                mode === "manual"
            );


        $("#addressExcel")
            ?.classList.toggle(
                "active",
                mode === "excel"
            );

    });

});


/* =========================================================
   CHECKBOXES
   NO CONFIRMATION DIALOG
========================================================= */

$$(".feature-checkbox input").forEach(check => {

    check.addEventListener("change", () => {

        const parent =
            check.closest(".feature-checkbox");

        const label =
            parent?.querySelector(".checkbox-text")
                ?.textContent
                ?.trim() ||
            "Feature";


        toast(
            `${label} ${
                check.checked
                    ? "enabled"
                    : "disabled"
            }.`
        );


        updatePreview();
    });

});


/* =========================================================
   PAGE SIZE
========================================================= */

$("#pageSize")?.addEventListener(
    "change",
    updatePageSizeState
);


function updatePageSizeState() {

    const custom =
        $("#pageSize")?.value === "CUSTOM";

    if ($("#customWidth")) {
        $("#customWidth").disabled = !custom;
    }

    if ($("#customHeight")) {
        $("#customHeight").disabled = !custom;
    }

    updatePreview();
}


/* =========================================================
   PAGE DIMENSIONS
========================================================= */

function getPageDimensions() {

    const size =
        $("#pageSize")?.value;

    if (size === "4x6") {

        return {
            width: 101.6,
            height: 152.4
        };
    }


    if (size === "70x25") {

        return {
            width: 70,
            height: 25
        };
    }


    if (size === "A4") {

        return {
            width: 210,
            height: 297
        };
    }


    return {

        width:
            Number(
                $("#customWidth")?.value
            ) || 101.6,

        height:
            Number(
                $("#customHeight")?.value
            ) || 152.4
    };
}


function getOrientedDimensions() {

    let {
        width,
        height
    } = getPageDimensions();


    if (
        $("#orientation")?.value ===
        "landscape"
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
   PO VALUES
========================================================= */

function getPOValues() {

    const manual =
        $$(".po-input")
            .map(input => input.value.trim())
            .filter(Boolean);


    const multiple =
        splitValues(
            $("#multiplePO")?.value
        );


    const excel =
        poExcelRows
            .map(row => {

                const keys =
                    Object.keys(row);

                if (!keys.length) {
                    return "";
                }

                return String(
                    row[keys[0]] ?? ""
                ).trim();
            })
            .filter(Boolean);


    return [
        ...new Set([
            ...manual,
            ...multiple,
            ...excel
        ])
    ];
}


/* =========================================================
   BOX NUMBERS
========================================================= */

function getBoxNumbers() {

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


    const boxes = [];

    for (
        let number = start;
        number <= end;
        number++
    ) {

        boxes.push(number);
    }


    return boxes;
}


/* =========================================================
   REPEAT COUNT
========================================================= */

function getRepeatCount() {

    return Math.max(
        1,
        Number(
            $("#repeatCount")?.value
        ) || 1
    );
}


/* =========================================================
   BUILD PO LABEL SEQUENCE
========================================================= */

function buildLabelSequence() {

    const poNumbers =
        getPOValues();

    const boxes =
        getBoxNumbers();

    const repeat =
        getRepeatCount();


    if (!poNumbers.length) {
        return [];
    }


    const sequence = [];


    poNumbers.forEach(po => {

        boxes.forEach(box => {

            for (
                let count = 0;
                count < repeat;
                count++
            ) {

                sequence.push({
                    po,
                    box
                });

            }

        });

    });


    return sequence;
}


/* =========================================================
   EXCEL TABLE PREVIEW
========================================================= */

function renderTable(rows, selector) {

    const target = $(selector);

    if (!target) return;


    if (!rows.length) {

        target.innerHTML = "";

        return;
    }


    const columns =
        Object.keys(rows[0]);


    let html =
        "<table><thead><tr>";


    columns.forEach(column => {

        html +=
            `<th>${escapeHTML(column)}</th>`;

    });


    html +=
        "</tr></thead><tbody>";


    rows
        .slice(0, 100)
        .forEach(row => {

            html += "<tr>";

            columns.forEach(column => {

                html +=
                    `<td>${escapeHTML(
                        row[column]
                    )}</td>`;

            });

            html += "</tr>";
        });


    html +=
        "</tbody></table>";


    target.innerHTML = html;
}


/* =========================================================
   PO EXCEL
========================================================= */

$("#poExcelFile")?.addEventListener(
    "change",
    async function () {

        const file =
            this.files?.[0];

        if (!file) return;


        try {

            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                    { type: "array" }
                );


            const sheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];


            poExcelRows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    { defval: "" }
                );


            renderTable(
                poExcelRows,
                "#poExcelPreview"
            );


            $("#poExcelStatus").textContent =
                `${poExcelRows.length} PO row(s) loaded.`;


            toast(
                `${poExcelRows.length} PO row(s) loaded.`
            );


            updatePreview();

        } catch (error) {

            console.error(error);

            toast(
                "Could not read PO Excel.",
                "error"
            );
        }

    }
);


/* =========================================================
   ISBN EXCEL
========================================================= */

$("#isbnExcelFile")?.addEventListener(
    "change",
    async function () {

        const file =
            this.files?.[0];

        if (!file) return;


        try {

            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                    { type: "array" }
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


            if (rows.length < 2) {

                throw new Error(
                    "ISBN Excel has no data."
                );
            }


            let headers =
                rows[0].map(value =>
                    String(value)
                        .trim()
                        .toLowerCase()
                );


            let isbnIndex =
                headers.indexOf("isbn");

            let titleIndex =
                headers.indexOf("title");

            let editionIndex =
                headers.indexOf("edition");


            if (isbnIndex < 0) {
                isbnIndex = 0;
            }

            if (titleIndex < 0) {
                titleIndex = 1;
            }

            if (editionIndex < 0) {
                editionIndex = 2;
            }


            isbnExcelRows =
                rows
                    .slice(1)
                    .map(row => ({

                        ISBN:
                            String(
                                row[isbnIndex] ?? ""
                            ).trim(),

                        Title:
                            String(
                                row[titleIndex] ?? ""
                            ).trim(),

                        Edition:
                            String(
                                row[editionIndex] ?? ""
                            ).trim()

                    }))
                    .filter(
                        row =>
                            row.ISBN ||
                            row.Title
                    );


            if (
                isbnExcelRows.some(
                    row =>
                        !row.ISBN ||
                        !row.Title
                )
            ) {

                throw new Error(
                    "ISBN and Title are mandatory."
                );
            }


            renderTable(
                isbnExcelRows,
                "#isbnExcelPreview"
            );


            $("#isbnExcelStatus").textContent =
                `${isbnExcelRows.length} ISBN row(s) loaded.`;


            toast(
                `${isbnExcelRows.length} ISBN row(s) loaded.`
            );


            updateISBNPreview();

        } catch (error) {

            console.error(error);

            toast(
                error.message ||
                "Could not read ISBN Excel.",
                "error"
            );
        }

    }
);


/* =========================================================
   ADDRESS EXCEL
========================================================= */

$("#addressExcelFile")?.addEventListener(
    "change",
    async function () {

        const file =
            this.files?.[0];

        if (!file) return;


        try {

            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                    { type: "array" }
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


            if (rows.length < 2) {

                throw new Error(
                    "Address Excel needs From and To columns."
                );
            }


            const headers =
                rows[0].map(value =>
                    String(value)
                        .trim()
                        .toLowerCase()
                );


            let fromIndex =
                headers.indexOf("from");

            let toIndex =
                headers.indexOf("to");


            if (fromIndex < 0) {
                fromIndex = 0;
            }

            if (toIndex < 0) {
                toIndex = 1;
            }


            addressExcelRows =
                rows
                    .slice(1)
                    .map(row => ({

                        From:
                            String(
                                row[fromIndex] ?? ""
                            ).trim(),

                        To:
                            String(
                                row[toIndex] ?? ""
                            ).trim()

                    }))
                    .filter(
                        row =>
                            row.From ||
                            row.To
                    );


            if (!addressExcelRows.length) {

                throw new Error(
                    "No address rows found."
                );
            }


            renderTable(
                addressExcelRows,
                "#addressExcelPreview"
            );


            $("#addressExcelStatus").textContent =
                `${addressExcelRows.length} address row(s) loaded.`;


            $("#stickerFromAddress").value =
                addressExcelRows[0].From;


            $("#stickerToAddress").value =
                addressExcelRows[0].To;


            updateAddressPreview();


            toast(
                `${addressExcelRows.length} address row(s) loaded.`
            );

        } catch (error) {

            console.error(error);

            toast(
                error.message ||
                "Could not read Address Excel.",
                "error"
            );
        }

    }
);


/* =========================================================
   PO PREVIEW
========================================================= */

function updatePreview() {

    if (
        currentTool === "ISBN Barcode" ||
        currentTool === "Address Sticker"
    ) {
        return;
    }


    const sequence =
        buildLabelSequence();


    const twoLabels =
        $("#labelsPerPage")?.value === "2";


    const label1 =
        $("#previewLabel1");

    const label2 =
        $("#previewLabel2");


    if (!label1 || !label2) {
        return;
    }


    label2.style.display =
        twoLabels
            ? "flex"
            : "none";


    label1.classList.toggle(
        "half",
        twoLabels
    );

    label2.classList.toggle(
        "half",
        twoLabels
    );


    renderPreviewLabel(
        label1,
        sequence[0]
    );


    if (twoLabels) {

        renderPreviewLabel(
            label2,
            sequence[1]
        );

    } else {

        renderPreviewLabel(
            label2,
            null
        );
    }


    applyPreviewStyles();
}


function renderPreviewLabel(
    element,
    item
) {

    if (!element) return;


    if (!item) {

        element.innerHTML = `
            <div class="preview-inner">
                <div class="preview-empty">
                    EMPTY LABEL
                </div>
            </div>
        `;

        return;
    }


    const showPO =
        $("#printPO")?.checked;

    const showBox =
        $("#printBox")?.checked;

    const combined =
        $("#printPOBox")?.checked;


    let content = "";


    if (showPO || combined) {

        content += `
            <div class="preview-po">
                ${escapeHTML(item.po)}
            </div>
        `;
    }


    if (showBox || combined) {

        content += `
            <div class="preview-box">
                BOX ${escapeHTML(item.box)}
            </div>
        `;
    }


    element.innerHTML = `
        <div class="preview-inner">
            ${content}
        </div>
    `;
}


/* =========================================================
   PREVIEW STYLING
========================================================= */

function applyPreviewStyles() {

    const font =
        $("#fontFamily")?.value;


    const fontFamily =
        font === "times"
            ? "Times New Roman"
            : font === "courier"
                ? "Courier New"
                : "Arial";


    const fontSize =
        Number(
            $("#fontSize")?.value
        ) || 18;


    const weight =
        $("#fontBold")?.checked
            ? "900"
            : "400";


    const style =
        $("#fontItalic")?.checked
            ? "italic"
            : "normal";


    const decoration =
        $("#fontUnderline")?.checked
            ? "underline"
            : "none";


    $$(".preview-inner").forEach(element => {

        element.style.fontFamily =
            fontFamily;

        element.style.fontSize =
            `${fontSize}px`;

        element.style.fontWeight =
            weight;

        element.style.fontStyle =
            style;

        element.style.textDecoration =
            decoration;
    });


    const borderSize =
        $("#borderSize")?.value;


    const borderWidth =
        borderSize === "thin"
            ? "1px"
            : borderSize === "thick"
                ? "4px"
                : "2px";


    const borderStyle =
        $("#borderStyle")?.value ||
        "solid";


    const borderColor =
        $("#borderColor")?.value ||
        "#111827";


    $$(".preview-label").forEach(label => {

        const enabled =
            $("#pageBorder")?.checked;


        label.style.border =
            enabled
                ? `${borderWidth} ${borderStyle} ${borderColor}`
                : "0";

    });
}


/* =========================================================
   ISBN PREVIEW
========================================================= */

function getISBNRows() {

    if (isbnExcelRows.length) {

        return isbnExcelRows;
    }


    const isbn =
        $("#manualISBN")?.value.trim();

    const title =
        $("#manualTitle")?.value.trim();

    const edition =
        $("#manualEdition")?.value.trim();


    if (!isbn || !title) {

        return [];
    }


    return [{
        ISBN: isbn,
        Title: title,
        Edition: edition
    }];
}


function updateISBNPreview() {

    if (
        currentTool !==
        "ISBN Barcode"
    ) {
        return;
    }


    const rows =
        getISBNRows();


    const data =
        rows[0];


    if (!data) {

        $("#isbnPreviewTitle").textContent =
            "Book Title";

        $("#isbnPreviewEdition").textContent = "";

        if ($("#isbnBarcode")) {
            $("#isbnBarcode").innerHTML = "";
        }

        return;
    }


    $("#isbnPreviewTitle").textContent =
        data.Title ||
        "Book Title";


    $("#isbnPreviewEdition").textContent =
        data.Edition
            ? `Edition: ${data.Edition}`
            : "";


    const svg =
        $("#isbnBarcode");


    if (!svg) return;


    svg.innerHTML = "";


    if (
        !data.ISBN ||
        typeof JsBarcode ===
        "undefined"
    ) {
        return;
    }


    try {

        JsBarcode(
            svg,
            data.ISBN,
            {
                format: "CODE128",
                displayValue: true,
                fontSize: 16,
                margin: 10,
                height: 80,
                width: 2
            }
        );

    } catch (error) {

        console.error(error);

        toast(
            "Barcode generation failed.",
            "error"
        );
    }
}


/* =========================================================
   ADDRESS PREVIEW
========================================================= */

function updateAddressPreview() {

    if (
        currentTool !==
        "Address Sticker"
    ) {
        return;
    }


    if ($("#previewFromName")) {

        $("#previewFromName").textContent =
            $("#stickerFromName")?.value ||
            "BooksWagon";
    }


    if ($("#previewFromAddress")) {

        $("#previewFromAddress").textContent =
            $("#stickerFromAddress")?.value ||
            CONFIG.address;
    }


    if ($("#previewToName")) {

        $("#previewToName").textContent =
            $("#stickerToName")?.value ||
            "Customer";
    }


    if ($("#previewToAddress")) {

        $("#previewToAddress").textContent =
            $("#stickerToAddress")?.value ||
            "Customer Address";
    }
}


/* =========================================================
   LIVE UPDATE
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
            updateISBNPreview();
            updateAddressPreview();
        }
    }
);


/* =========================================================
   PDF SETTINGS
========================================================= */

function getPDFFormat() {

    const {
        width,
        height
    } = getOrientedDimensions();


    return [width, height];
}


function getPDFOrientation() {

    return "portrait";
}


/* =========================================================
   PDF BORDER
========================================================= */

function drawPDFBorder(
    doc,
    x,
    y,
    width,
    height
) {

    const color =
        $("#borderColor")?.value ||
        "#111827";


    const red =
        parseInt(
            color.substring(1, 3),
            16
        );

    const green =
        parseInt(
            color.substring(3, 5),
            16
        );

    const blue =
        parseInt(
            color.substring(5, 7),
            16
        );


    doc.setDrawColor(
        red,
        green,
        blue
    );


    const size =
        $("#borderSize")?.value;


    doc.setLineWidth(
        size === "thin"
            ? 0.5
            : size === "thick"
                ? 1.8
                : 1
    );


    const style =
        $("#borderStyle")?.value ||
        "solid";


    if (style === "dashed") {

        doc.setLineDashPattern(
            [4, 3],
            0
        );

    } else if (style === "dotted") {

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


    doc.rect(
        x,
        y,
        width,
        height
    );


    if (style === "double") {

        doc.setLineDashPattern(
            [],
            0
        );

        doc.rect(
            x + 2,
            y + 2,
            width - 4,
            height - 4
        );
    }


    doc.setLineDashPattern(
        [],
        0
    );
}


/* =========================================================
   PDF FONT
========================================================= */

function getPDFFont() {

    const value =
        $("#fontFamily")?.value;


    if (value === "times") {
        return "times";
    }


    if (value === "courier") {
        return "courier";
    }


    return "helvetica";
}


function getPDFFontStyle() {

    const bold =
        $("#fontBold")?.checked;

    const italic =
        $("#fontItalic")?.checked;


    if (bold && italic) {
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
   DRAW PO LABEL
========================================================= */

function drawPOLabel(
    doc,
    item,
    slot,
    totalSlots
) {

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();


    const slotHeight =
        pageHeight / totalSlots;


    const top =
        slot * slotHeight;


    const padding = 7;


    if ($("#pageBorder")?.checked) {

        drawPDFBorder(
            doc,
            3,
            top + 3,
            pageWidth - 6,
            slotHeight - 6
        );
    }


    if (
        $("#cutLine")?.checked &&
        slot < totalSlots - 1
    ) {

        doc.setLineDashPattern(
            [4, 3],
            0
        );

        doc.setLineWidth(0.5);

        doc.line(
            padding,
            top + slotHeight,
            pageWidth - padding,
            top + slotHeight
        );

        doc.setLineDashPattern(
            [],
            0
        );
    }


    const font =
        getPDFFont();

    const fontStyle =
        getPDFFontStyle();


    doc.setFont(
        font,
        fontStyle
    );


    doc.setFontSize(
        Number(
            $("#fontSize")?.value
        ) || 18
    );


    const showPO =
        $("#printPO")?.checked;

    const showBox =
        $("#printBox")?.checked;

    const combined =
        $("#printPOBox")?.checked;


    const lines = [];


    if (showPO || combined) {

        lines.push({
            text: String(item.po),
            type: "po"
        });
    }


    if (showBox || combined) {

        lines.push({
            text: `BOX ${item.box}`,
            type: "box"
        });
    }


    if (!lines.length) {
        return;
    }


    const centerY =
        top +
        slotHeight / 2;


    const lineGap =
        Math.min(
            22,
            slotHeight /
            (lines.length + 1)
        );


    lines.forEach(
        (line, index) => {

            const y =
                centerY +
                (
                    index -
                    (lines.length - 1) / 2
                ) *
                lineGap;


            const textWidth =
                doc.getTextWidth(
                    line.text
                );


            const shouldBorder =
                line.type === "po"
                    ? $("#poBorder")?.checked
                    : $("#boxBorder")?.checked;


            if (shouldBorder) {

                drawPDFBorder(
                    doc,
                    pageWidth / 2 -
                    textWidth / 2 -
                    8,

                    y - 11,

                    textWidth + 16,

                    20
                );
            }


            doc.text(
                line.text,
                pageWidth / 2,
                y,
                {
                    align: "center"
                }
            );


            if (
                $("#fontUnderline")?.checked
            ) {

                doc.setLineWidth(0.4);

                doc.line(
                    pageWidth / 2 -
                    textWidth / 2,

                    y + 2,

                    pageWidth / 2 +
                    textWidth / 2,

                    y + 2
                );
            }

        }
    );


    if (
        $("#combinedBorder")?.checked
    ) {

        drawPDFBorder(
            doc,
            7,
            top + 7,
            pageWidth - 14,
            slotHeight - 14
        );
    }


    if (
        $("#scissorMark")?.checked &&
        slot < totalSlots - 1
    ) {

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);

        doc.text(
            "CUT",
            pageWidth / 2,
            top + slotHeight - 2,
            {
                align: "center"
            }
        );
    }
}


/* =========================================================
   CREATE PO PDF
========================================================= */

function createPOPDF(sequence) {

    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFFormat();


    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: dimensions
        });


    const labelsPerPage =
        Math.max(
            1,
            Number(
                $("#labelsPerPage")?.value
            ) || 1
        );


    let firstPage = true;


    for (
        let index = 0;
        index < sequence.length;
        index += labelsPerPage
    ) {

        if (!firstPage) {

            doc.addPage(
                dimensions,
                "portrait"
            );
        }


        firstPage = false;


        const pageItems =
            sequence.slice(
                index,
                index + labelsPerPage
            );


        for (
            let slot = 0;
            slot < labelsPerPage;
            slot++
        ) {

            const item =
                pageItems[slot];


            if (item) {

                drawPOLabel(
                    doc,
                    item,
                    slot,
                    labelsPerPage
                );

            } else if (
                $("#pageBorder")?.checked
            ) {

                const pageWidth =
                    doc.internal.pageSize
                        .getWidth();

                const pageHeight =
                    doc.internal.pageSize
                        .getHeight();

                const slotHeight =
                    pageHeight /
                    labelsPerPage;


                drawPDFBorder(
                    doc,
                    3,
                    slot * slotHeight + 3,
                    pageWidth - 6,
                    slotHeight - 6
                );
            }
        }
    }


    return doc;
}


/* =========================================================
   GENERATE PO
========================================================= */

async function generatePO() {

    const values =
        getPOValues();


    if (!values.length) {

        toast(
            "Enter or upload at least one PO.",
            "error"
        );

        return;
    }


    const sequence =
        buildLabelSequence();


    if (!sequence.length) {

        toast(
            "No labels to generate.",
            "error"
        );

        return;
    }


    const copies =
        Math.max(
            1,
            Number(
                $("#copies")?.value
            ) || 1
        );


    const finalSequence = [];


    for (
        let copy = 0;
        copy < copies;
        copy++
    ) {

        finalSequence.push(
            ...sequence
        );
    }


    if (
        $("#zipPDF")?.checked
    ) {

        const zip =
            new JSZip();


        for (
            const po of values
        ) {

            const poSequence =
                finalSequence.filter(
                    item =>
                        item.po === po
                );


            if (!poSequence.length) {
                continue;
            }


            const doc =
                createPOPDF(
                    poSequence
                );


            zip.file(
                `${safeFileName(po)}_Labels.pdf`,
                doc.output("blob")
            );
        }


        const blob =
            await zip.generateAsync({
                type: "blob"
            });


        downloadBlob(
            blob,
            `${safeFileName(currentTool)}_Labels.zip`
        );


        toast(
            "ZIP generated successfully."
        );

        return;
    }


    if (
        $("#mergePDF")?.checked
    ) {

        const doc =
            createPOPDF(
                finalSequence
            );


        doc.save(
            `${safeFileName(currentTool)}_Merged.pdf`
        );


        toast(
            "Merged PDF generated."
        );

        return;
    }


    for (
        const po of values
    ) {

        const poSequence =
            finalSequence.filter(
                item =>
                    item.po === po
            );


        if (!poSequence.length) {
            continue;
        }


        const doc =
            createPOPDF(
                poSequence
            );


        doc.save(
            `${safeFileName(po)}_Labels.pdf`
        );
    }


    toast(
        "PO label PDFs generated."
    );
}


/* =========================================================
   ISBN
========================================================= */

function createBarcodeSVG(value) {

    return new Promise(
        (resolve, reject) => {

            const svg =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg"
                );


            try {

                JsBarcode(
                    svg,
                    value,
                    {
                        format: "CODE128",
                        displayValue: true,
                        fontSize: 14,
                        margin: 8,
                        height: 70,
                        width: 2
                    }
                );


                const text =
                    new XMLSerializer()
                        .serializeToString(
                            svg
                        );


                const blob =
                    new Blob(
                        [text],
                        {
                            type:
                                "image/svg+xml"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const image =
                    new Image();


                image.onload = () => {

                    URL.revokeObjectURL(
                        url
                    );


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        image.width;

                    canvas.height =
                        image.height;


                    const context =
                        canvas.getContext(
                            "2d"
                        );


                    context.drawImage(
                        image,
                        0,
                        0
                    );


                    resolve(
                        canvas.toDataURL(
                            "image/png"
                        )
                    );
                };


                image.onerror =
                    reject;


                image.src = url;

            } catch (error) {

                reject(error);
            }

        }
    );
}


async function createISBNPDF(row) {

    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFFormat();


    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: dimensions
        });


    const pageWidth =
        doc.internal.pageSize
            .getWidth();

    const pageHeight =
        doc.internal.pageSize
            .getHeight();


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(16);


    doc.text(
        row.Title,
        pageWidth / 2,
        25,
        {
            align: "center"
        }
    );


    if (row.Edition) {

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);


        doc.text(
            `Edition: ${row.Edition}`,
            pageWidth / 2,
            33,
            {
                align: "center"
            }
        );
    }


    const barcode =
        await createBarcodeSVG(
            row.ISBN
        );


    const imageWidth =
        Math.min(
            pageWidth - 25,
            110
        );


    doc.addImage(
        barcode,
        "PNG",
        (pageWidth - imageWidth) / 2,
        pageHeight / 2 - 15,
        imageWidth,
        40
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);


    doc.text(
        row.ISBN,
        pageWidth / 2,
        pageHeight / 2 + 35,
        {
            align: "center"
        }
    );


    return doc;
}


async function generateISBN() {

    const rows =
        getISBNRows();


    if (!rows.length) {

        toast(
            "ISBN and Title are mandatory.",
            "error"
        );

        return;
    }


    if (
        $("#zipPDF")?.checked
    ) {

        const zip =
            new JSZip();


        for (
            let index = 0;
            index < rows.length;
            index++
        ) {

            const doc =
                await createISBNPDF(
                    rows[index]
                );


            zip.file(
                `${safeFileName(
                    rows[index].ISBN
                )}_Barcode.pdf`,
                doc.output("blob")
            );
        }


        const blob =
            await zip.generateAsync({
                type: "blob"
            });


        downloadBlob(
            blob,
            "BooksWagon_ISBN_Barcodes.zip"
        );


        toast(
            "ISBN barcode ZIP generated."
        );

        return;
    }


    if (
        $("#mergePDF")?.checked
    ) {

        let merged = null;


        for (
            let index = 0;
            index < rows.length;
            index++
        ) {

            const one =
                await createISBNPDF(
                    rows[index]
                );


            if (!merged) {

                merged = one;

            } else {

                /*
                 * Add a new page and redraw the
                 * next ISBN directly.
                 */

                merged.addPage(
                    getPDFFormat(),
                    "portrait"
                );


                await drawISBNOnExistingPDF(
                    merged,
                    rows[index]
                );
            }
        }


        merged.save(
            "BooksWagon_ISBN_Barcodes_Merged.pdf"
        );


        toast(
            "Merged ISBN PDF generated."
        );

        return;
    }


    for (
        const row of rows
    ) {

        const doc =
            await createISBNPDF(row);


        doc.save(
            `${safeFileName(
                row.ISBN
            )}_Barcode.pdf`
        );
    }


    toast(
        "ISBN barcode PDFs generated."
    );
}


async function drawISBNOnExistingPDF(
    doc,
    row
) {

    const pageWidth =
        doc.internal.pageSize
            .getWidth();

    const pageHeight =
        doc.internal.pageSize
            .getHeight();


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(16);


    doc.text(
        row.Title,
        pageWidth / 2,
        25,
        {
            align: "center"
        }
    );


    if (row.Edition) {

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);


        doc.text(
            `Edition: ${row.Edition}`,
            pageWidth / 2,
            33,
            {
                align: "center"
            }
        );
    }


    const barcode =
        await createBarcodeSVG(
            row.ISBN
        );


    const imageWidth =
        Math.min(
            pageWidth - 25,
            110
        );


    doc.addImage(
        barcode,
        "PNG",
        (pageWidth - imageWidth) / 2,
        pageHeight / 2 - 15,
        imageWidth,
        40
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);


    doc.text(
        row.ISBN,
        pageWidth / 2,
        pageHeight / 2 + 35,
        {
            align: "center"
        }
    );
}


/* =========================================================
   ADDRESS
========================================================= */

function getAddressRows() {

    if (addressExcelRows.length) {

        return addressExcelRows;
    }


    const from =
        $("#stickerFromAddress")
            ?.value
            .trim();


    const to =
        $("#stickerToAddress")
            ?.value
            .trim();


    if (!from || !to) {
        return [];
    }


    return [{
        From: from,
        To: to
    }];
}


function drawAddressSticker(
    doc,
    from,
    to
) {

    const pageWidth =
        doc.internal.pageSize
            .getWidth();

    const pageHeight =
        doc.internal.pageSize
            .getHeight();


    doc.setDrawColor(
        20,
        20,
        20
    );

    doc.setLineWidth(1);


    doc.rect(
        5,
        5,
        pageWidth - 10,
        pageHeight - 10
    );


    doc.setLineDashPattern(
        [3, 3],
        0
    );


    doc.line(
        pageWidth / 2,
        8,
        pageWidth / 2,
        pageHeight - 8
    );


    doc.setLineDashPattern(
        [],
        0
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(12);


    doc.text(
        "FROM — BOOKSWAGON",
        12,
        20
    );


    doc.text(
        "TO",
        pageWidth / 2 + 8,
        20
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);


    const fromLines =
        doc.splitTextToSize(
            from || CONFIG.address,
            pageWidth / 2 - 25
        );


    const toLines =
        doc.splitTextToSize(
            to || "Customer Address",
            pageWidth / 2 - 25
        );


    doc.text(
        fromLines,
        12,
        30
    );


    doc.text(
        toLines,
        pageWidth / 2 + 8,
        30
    );
}


function createAddressPDF(
    from,
    to
) {

    const {
        jsPDF
    } = window.jspdf;


    const dimensions =
        getPDFFormat();


    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: dimensions
        });


    drawAddressSticker(
        doc,
        from,
        to
    );


    return doc;
}


async function generateAddress() {

    const rows =
        getAddressRows();


    if (!rows.length) {

        toast(
            "Enter both From and To address.",
            "error"
        );

        return;
    }


    if (
        $("#zipPDF")?.checked
    ) {

        const zip =
            new JSZip();


        rows.forEach(
            (row, index) => {

                const doc =
                    createAddressPDF(
                        row.From,
                        row.To
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
            "Address ZIP generated."
        );

        return;
    }


    if (
        $("#mergePDF")?.checked
    ) {

        const {
            jsPDF
        } = window.jspdf;


        const dimensions =
            getPDFFormat();


        const doc =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: dimensions
            });


        rows.forEach(
            (row, index) => {

                if (index > 0) {

                    doc.addPage(
                        dimensions,
                        "portrait"
                    );
                }


                drawAddressSticker(
                    doc,
                    row.From,
                    row.To
                );
            }
        );


        doc.save(
            "BooksWagon_Address_Stickers_Merged.pdf"
        );


        toast(
            "Merged address PDF generated."
        );

        return;
    }


    rows.forEach(
        (row, index) => {

            const doc =
                createAddressPDF(
                    row.From,
                    row.To
                );


            doc.save(
                `Address_Sticker_${index + 1}.pdf`
            );
        }
    );


    toast(
        "Address sticker PDFs generated."
    );
}


/* =========================================================
   GENERATE BUTTON
========================================================= */

$("#generateButton")?.addEventListener(
    "click",
    async () => {

        const button =
            $("#generateButton");


        if (button) {

            button.disabled = true;
            button.textContent =
                "GENERATING...";
        }


        try {

            if (
                currentTool ===
                "ISBN Barcode"
            ) {

                await generateISBN();

            } else if (
                currentTool ===
                "Address Sticker"
            ) {

                await generateAddress();

            } else {

                await generatePO();
            }

        } catch (error) {

            console.error(error);

            toast(
                error.message ||
                "Generation failed.",
                "error"
            );

        } finally {

            if (button) {

                button.disabled = false;
                button.textContent =
                    "GENERATE";
            }
        }
    }
);


/* =========================================================
   RESET
========================================================= */

$("#resetButton")?.addEventListener(
    "click",
    () => {

        $$(".po-input")
            .forEach(input => {
                input.value = "";
            });


        if ($("#multiplePO")) {
            $("#multiplePO").value = "";
        }


        if ($("#startBox")) {
            $("#startBox").value = 1;
        }


        if ($("#endBox")) {
            $("#endBox").value = 1;
        }


        if ($("#repeatCount")) {
            $("#repeatCount").value = 1;
        }


        if ($("#copies")) {
            $("#copies").value = 1;
        }


        if ($("#labelsPerPage")) {
            $("#labelsPerPage").value = 1;
        }


        if ($("#manualISBN")) {
            $("#manualISBN").value = "";
        }


        if ($("#manualTitle")) {
            $("#manualTitle").value = "";
        }


        if ($("#manualEdition")) {
            $("#manualEdition").value = "";
        }


        if ($("#stickerToName")) {
            $("#stickerToName").value = "";
        }


        if ($("#stickerToAddress")) {
            $("#stickerToAddress").value = "";
        }


        poExcelRows = [];
        isbnExcelRows = [];
        addressExcelRows = [];


        $$(".feature-checkbox input")
            .forEach(input => {
                input.checked = false;
            });


        $("#printPO").checked = true;
        $("#printBox").checked = true;
        $("#pageBorder").checked = true;
        $("#poBorder").checked = true;
        $("#boxBorder").checked = true;
        $("#fontBold").checked = true;


        if ($("#poExcelPreview")) {
            $("#poExcelPreview").innerHTML = "";
        }


        if ($("#isbnExcelPreview")) {
            $("#isbnExcelPreview").innerHTML = "";
        }


        if ($("#addressExcelPreview")) {
            $("#addressExcelPreview").innerHTML = "";
        }


        if ($("#poExcelStatus")) {
            $("#poExcelStatus").textContent =
                "No Excel file selected.";
        }


        if ($("#isbnExcelStatus")) {
            $("#isbnExcelStatus").textContent =
                "No ISBN Excel selected.";
        }


        if ($("#addressExcelStatus")) {
            $("#addressExcelStatus").textContent =
                "No Address Excel selected.";
        }


        updatePreview();
        updateISBNPreview();
        updateAddressPreview();


        toast(
            "Settings reset."
        );
    }
);


/* =========================================================
   QR CODES
========================================================= */

function createQRCodes() {

    if (
        typeof QRCode ===
        "undefined"
    ) {
        return;
    }


    if ($("#addressQR")) {

        $("#addressQR").innerHTML = "";


        new QRCode(
            $("#addressQR"),
            {
                text: CONFIG.maps,
                width: 130,
                height: 130
            }
        );
    }


    if ($("#emailQR")) {

        $("#emailQR").innerHTML = "";


        new QRCode(
            $("#emailQR"),
            {
                text:
                    `mailto:${CONFIG.email}`,
                width: 130,
                height: 130
            }
        );
    }
}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

    createPOInputs();

    updatePageSizeState();

    createQRCodes();

    configureTool();

    updatePreview();

    updateISBNPreview();

    updateAddressPreview();
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

} else {

    initialize();
}
