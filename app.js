// ==========================================================
// BOOKSWAGON LABEL STUDIO
// COCOBLUE PO WORKSPACE
// Sticker Page + Address Print
// ==========================================================

const { jsPDF } = window.jspdf;


// ==========================================================
// STATE
// ==========================================================

let cocoBluePOs = [];
let cocoBlueStickerPageSize = "4x6";
let cocoBlueAddressPageSize = "4x6";

let cocoBlueStickerZoom = 1;


// ==========================================================
// ELEMENTS
// ==========================================================

const cocoblueStickerTab =
    document.getElementById("cocoblueStickerTab");

const cocoblueAddressTab =
    document.getElementById("cocoblueAddressTab");

const cocoblueStickerWorkspace =
    document.getElementById("cocoblueStickerWorkspace");

const cocoblueAddressWorkspace =
    document.getElementById("cocoblueAddressWorkspace");

const closeCocoBlue =
    document.getElementById("closeCocoBlue");


// Manual / Excel
const cocoblueManualBtn =
    document.getElementById("cocoblueManualBtn");

const cocoblueExcelBtn =
    document.getElementById("cocoblueExcelBtn");

const cocoblueManualArea =
    document.getElementById("cocoblueManualArea");

const cocoblueExcelArea =
    document.getElementById("cocoblueExcelArea");

const cocoblueExcelFile =
    document.getElementById("cocoblueExcelFile");

const cocoblueExcelStatus =
    document.getElementById("cocoblueExcelStatus");

const cocobluePOInputs =
    document.querySelectorAll(
        ".cocoblue-po-input"
    );


// Sticker settings
const cocoblueStartBox =
    document.getElementById("cocoblueStartBox");

const cocoblueEndBox =
    document.getElementById("cocoblueEndBox");

const cocoblueLabelsPerPage =
    document.getElementById("cocoblueLabelsPerPage");

const cocobluePageCount =
    document.getElementById("cocobluePageCount");

const cocoblueBorderEnabled =
    document.getElementById("cocoblueBorderEnabled");

const cocoblueBorderStyle =
    document.getElementById("cocoblueBorderStyle");

const cocoblueFont =
    document.getElementById("cocoblueFont");

const cocoblueFontSize =
    document.getElementById("cocoblueFontSize");

const cocoblueFontWeight =
    document.getElementById("cocoblueFontWeight");


// Sticker custom size
const cocoblueWidth =
    document.getElementById("cocoblueWidth");

const cocoblueHeight =
    document.getElementById("cocoblueHeight");

const cocoblueCustomSize =
    document.getElementById("cocoblueCustomSize");


// Sticker preview
const cocoblueStickerPreview =
    document.getElementById(
        "cocoblueStickerPreview"
    );

const cocobluePreviewPO =
    document.getElementById(
        "cocobluePreviewPO"
    );

const cocobluePreviewBox =
    document.getElementById(
        "cocobluePreviewBox"
    );

const cocoblueSummarySize =
    document.getElementById(
        "cocoblueSummarySize"
    );

const cocoblueSummaryLabels =
    document.getElementById(
        "cocoblueSummaryLabels"
    );

const cocoblueSummaryPages =
    document.getElementById(
        "cocoblueSummaryPages"
    );

const cocoblueZoomIn =
    document.getElementById(
        "cocoblueZoomIn"
    );

const cocoblueZoomOut =
    document.getElementById(
        "cocoblueZoomOut"
    );

const cocoblueZoomValue =
    document.getElementById(
        "cocoblueZoomValue"
    );

const cocoblueReset =
    document.getElementById(
        "cocoblueReset"
    );

const cocoblueGeneratePDF =
    document.getElementById(
        "cocoblueGeneratePDF"
    );

const cocoblueStatus =
    document.getElementById(
        "cocoblueStatus"
    );


// Address
const cocoblueFromAddress =
    document.getElementById(
        "cocoblueFromAddress"
    );

const cocoblueToAddress =
    document.getElementById(
        "cocoblueToAddress"
    );

const cocoblueAddressBorder =
    document.getElementById(
        "cocoblueAddressBorder"
    );

const cocoblueAddressBorderStyle =
    document.getElementById(
        "cocoblueAddressBorderStyle"
    );

const cocoblueAddressFont =
    document.getElementById(
        "cocoblueAddressFont"
    );

const cocoblueAddressFontSize =
    document.getElementById(
        "cocoblueAddressFontSize"
    );

const cocoblueAddressWeight =
    document.getElementById(
        "cocoblueAddressWeight"
    );

const cocoblueAddressPreview =
    document.getElementById(
        "cocoblueAddressPreview"
    );

const cocobluePreviewFrom =
    document.getElementById(
        "cocobluePreviewFrom"
    );

const cocobluePreviewTo =
    document.getElementById(
        "cocobluePreviewTo"
    );

const cocoblueAddressReset =
    document.getElementById(
        "cocoblueAddressReset"
    );

const cocoblueAddressPDF =
    document.getElementById(
        "cocoblueAddressPDF"
    );

const cocoblueAddressStatus =
    document.getElementById(
        "cocoblueAddressStatus"
    );


// Address page size buttons
const cocoblueAddressSizeButtons =
    document.querySelectorAll(
        ".cocoblue-address-page-size"
    );


// Sticker page size buttons
const cocoblueStickerSizeButtons =
    document.querySelectorAll(
        ".cocoblue-page-size"
    );


// ==========================================================
// UTILITY
// ==========================================================

function positiveNumber(
    value,
    fallback
) {

    const n =
        Number(value);

    return Number.isFinite(n) && n > 0
        ? n
        : fallback;
}


function safeFileName(
    value
) {

    return String(value)
        .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );
}


function currentPOs() {

    return [...cocoBluePOs];
}


// ==========================================================
// TOOL OPEN/CLOSE
// ==========================================================

function showCocoBlueWorkspace() {

    const section =
        document.getElementById(
            "cocoblue-workspace"
        );

    if (!section) {
        return;
    }

    section.style.display = "block";

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


function hideCocoBlueWorkspace() {

    const section =
        document.getElementById(
            "cocoblue-workspace"
        );

    if (!section) {
        return;
    }

    section.style.display = "none";

}


document
    .querySelectorAll(
        '[data-tool="cocoblue"]'
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                showCocoBlueWorkspace
            );

        }
    );


closeCocoBlue.addEventListener(
    "click",
    hideCocoBlue
);


// ==========================================================
// STICKER / ADDRESS TABS
// ==========================================================

function activateStickerMode() {

    cocoblueStickerTab.classList.add(
        "active"
    );

    cocoblueAddressTab.classList.remove(
        "active"
    );

    cocoblueStickerWorkspace.classList.remove(
        "hidden"
    );

    cocoblueAddressWorkspace.classList.add(
        "hidden"
    );

}


function activateAddressMode() {

    cocoblueAddressTab.classList.add(
        "active"
    );

    cocoblueStickerTab.classList.remove(
        "active"
    );

    cocoblueAddressWorkspace.classList.remove(
        "hidden"
    );

    cocoblueStickerWorkspace.classList.add(
        "hidden"
    );

}


cocoblueStickerTab.addEventListener(
    "click",
    activateStickerMode
);


cocoblueAddressTab.addEventListener(
    "click",
    activateAddressMode
);


// ==========================================================
// MANUAL / EXCEL
// ==========================================================

cocoblueManualBtn.addEventListener(
    "click",
    () => {

        cocoblueManualBtn.classList.add(
            "active"
        );

        cocoblueExcelBtn.classList.remove(
            "active"
        );

        cocoblueManualArea.classList.remove(
            "hidden"
        );

        cocoblueExcelArea.classList.add(
            "hidden"
        );

        updateCocoBlueSticker();

    }
);


cocoblueExcelBtn.addEventListener(
    "click",
    () => {

        cocoblueExcelBtn.classList.add(
            "active"
        );

        cocoblueManualBtn.classList.remove(
            "active"
        );

        cocoblueExcelArea.classList.remove(
            "hidden"
        );

        cocoblueManualArea.classList.add(
            "hidden"
        );

        updateCocoBlueSticker();

    }
);


// ==========================================================
// EXCEL UPLOAD
// First column = PO number
// ==========================================================

cocoblueExcelFile.addEventListener(
    "change",
    async event => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        try {

            cocoblueExcelStatus.textContent =
                "Reading Excel...";


            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                    {
                        type: "array"
                    }
                );


            if (
                !workbook.SheetNames.length
            ) {

                throw new Error(
                    "No worksheet."
                );

            }


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


            cocoBluePOs = [];


            rows.forEach(
                (row, index) => {

                    if (
                        !row ||
                        row.length === 0
                    ) {

                        return;

                    }


                    const value =
                        String(
                            row[0]
                        ).trim();


                    if (!value) {
                        return;
                    }


                    const normalized =
                        value
                            .toLowerCase()
                            .trim();


                    const headers = [
                        "po",
                        "po number",
                        "po no",
                        "po no.",
                        "po_number",
                        "purchase order"
                    ];


                    if (
                        index === 0 &&
                        headers.includes(
                            normalized
                        )
                    ) {

                        return;

                    }


                    cocoBluePOs.push(
                        value
                    );

                }
            );


            cocoBluePOs =
                [...new Set(
                    cocoBluePOs
                )];


            if (
                cocoBluePOs.length === 0
            ) {

                cocoblueExcelStatus.textContent =
                    "No PO numbers found.";

                alert(
                    "No PO numbers found in the first Excel column."
                );

                return;

            }


            cocoblueExcelStatus.textContent =
                `${cocoBluePOs.length} PO(s) loaded`;


            updateCocoBlueSticker();

        }

        catch (error) {

            console.error(error);

            cocoblueExcelStatus.textContent =
                "Excel reading failed.";

            alert(
                "Unable to read this Excel file."
            );

        }

    }
);


// ==========================================================
// MANUAL PO
// ==========================================================

cocobluePOInputs.forEach(
    input => {

        input.addEventListener(
            "input",
            () => {

                cocoBluePOs =
                    Array.from(
                        cocobluePOInputs
                    )
                    .map(
                        item =>
                            item.value.trim()
                    )
                    .filter(Boolean);

                updateCocoBlueSticker();

            }
        );

    }
);


// ==========================================================
// PAGE SIZE
// ==========================================================

function getCocoBlueStickerPageSize() {

    if (
        cocoBlueStickerPageSize ===
        "4x6"
    ) {

        return {
            width: 101.6,
            height: 152.4,
            label: "4 × 6 inch"
        };

    }


    if (
        cocoBlueStickerPageSize ===
        "a4"
    ) {

        return {
            width: 210,
            height: 297,
            label: "A4"
        };

    }


    if (
        cocoBlueStickerPageSize ===
        "70x35"
    ) {

        return {
            width: 70,
            height: 35,
            label: "70 × 35 mm"
        };

    }


    const width =
        positiveNumber(
            cocoblueWidth.value,
            null
        );

    const height =
        positiveNumber(
            cocoblueHeight.value,
            null
        );

    if (!width || !height) {
        return null;
    }

    return {
        width,
        height,
        label:
            `${width} × ${height} mm`
    };

}


function getCocoBlueAddressPageSize() {

    if (
        cocoBlueAddressPageSize ===
        "4x6"
    ) {

        return {
            width: 101.6,
            height: 152.4,
            label: "4 × 6 inch"
        };

    }


    if (
        cocoBlueAddressPageSize ===
        "a4"
    ) {

        return {
            width: 210,
            height: 297,
            label: "A4"
        };

    }


    if (
        cocoBlueAddressPageSize ===
        "70x35"
    ) {

        return {
            width: 70,
            height: 35,
            label: "70 × 35 mm"
        };

    }


    return {
        width: 101.6,
        height: 152.4,
        label: "Custom"
    };

}


cocoblueStickerSizeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                cocoblueStickerSizeButtons
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                cocoBlueStickerPageSize =
                    button.dataset.size;


                if (
                    cocoBlueStickerPageSize ===
                    "custom"
                ) {

                    cocoblueCustomSize.classList.remove(
                        "hidden"
                    );

                }

                else {

                    cocoblueCustomSize.classList.add(
                        "hidden"
                    );

                }


                updateCocoBlueSticker();

            }
        );

    }
);


cocoblueAddressSizeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                cocoblueAddressSizeButtons
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                cocoBlueAddressPageSize =
                    button.dataset.size;

            }
        );

    }
);


cocoblueWidth.addEventListener(
    "input",
    updateCocoBlueSticker
);


cocoblueHeight.addEventListener(
    "input",
    updateCocoBlueSticker
);


// ==========================================================
// STICKER SETTINGS
// ==========================================================

[
    cocoblueStartBox,
    cocoblueEndBox,
    cocoblueLabelsPerPage,
    cocobluePageCount,
    cocoblueBorderEnabled,
    cocoblueBorderStyle,
    cocoblueFont,
    cocoblueFontSize,
    cocoblueFontWeight
].forEach(
    element => {

        element.addEventListener(
            "input",
            updateCocoBlueSticker
        );

        element.addEventListener(
            "change",
            updateCocoBlueSticker
        );

    }
);


// ==========================================================
// STICKER PREVIEW DESIGN
// ==========================================================

function updateCocoBluePreviewDesign() {

    const size =
        parseInt(
            cocoblueFontSize.value,
            10
        ) || 10;


    cocobluePreviewPO.style.fontFamily =
        cocoblueFont.value;

    cocobluePreviewBox.style.fontFamily =
        cocoblueFont.value;


    cocobluePreviewPO.style.fontSize =
        `${size}px`;


    cocobluePreviewBox.style.fontSize =
        `${Math.min(
            40,
            size + 8
        )}px`;


    cocobluePreviewPO.style.fontWeight =
        cocoblueFontWeight.value;

    cocobluePreviewBox.style.fontWeight =
        cocoblueFontWeight.value;


    if (
        !cocoblueBorderEnabled.checked
    ) {

        cocoblueStickerPreview.style.border =
            "none";

    }

    else {

        const styles = {

            dark:
                "3px solid #1d1d1b",

            medium:
                "2px solid #555",

            light:
                "1px solid #aaa",

            double:
                "4px double #333",

            dashed:
                "2px dashed #555",

            dot:
                "2px dotted #555",

            bold:
                "5px solid #111"

        };


        cocoblueStickerPreview.style.border =
            styles[
                cocoblueBorderStyle.value
            ] ||
            styles.dark;

    }


    cocoblueStickerPreview.style.transform =
        `scale(${cocoBlueStickerZoom})`;


    cocoblueZoomValue.textContent =
        `${Math.round(
            cocoBlueStickerZoom * 100
        )}%`;

}


// ==========================================================
// STICKER SUMMARY
// ==========================================================

function updateCocoBlueSummary() {

    const settings = {

        start:
            parseInt(
                cocoblueStartBox.value,
                10
            ) || 1,

        end:
            parseInt(
                cocoblueEndBox.value,
                10
            ) || 1,

        perPage:
            parseInt(
                cocoblueLabelsPerPage.value,
                10
            ) || 1,

        pages:
            parseInt(
                cocobluePageCount.value,
                10
            ) || 1

    };


    const pos =
        currentPOs();


    const page =
        getCocoBlueStickerPageSize();


    cocoblueSummarySize.textContent =
        page
            ? page.label
            : "Custom";


    cocoblueSummaryLabels.textContent =
        settings.perPage;


    let totalPages = 0;


    if (
        pos.length === 0
    ) {

        totalPages = 1;

    }

    else {

        // Same box repeated for selected pages
        totalPages =
            pos.length *
            settings.pages;

    }


    cocoblueSummaryPages.textContent =
        totalPages;

}


// ==========================================================
// STICKER PREVIEW
// ==========================================================

function updateCocoBlueSticker() {

    const pos =
        currentPOs();


    const start =
        parseInt(
            cocoblueStartBox.value,
            10
        ) || 1;


    cocobluePreviewPO.textContent =
        pos.length > 0
            ? pos[0]
            : "BWG123";


    cocobluePreviewBox.textContent =
        `BOX ${start}`;


    updateCocoBlueSummary();

    updateCocoBluePreviewDesign();

}


// ==========================================================
// ZOOM
// ==========================================================

cocoblueZoomIn.addEventListener(
    "click",
    () => {

        cocoBlueStickerZoom =
            Math.min(
                1.5,
                cocoBlueStickerZoom + 0.1
            );

        updateCocoBluePreviewDesign();

    }
);


cocoblueZoomOut.addEventListener(
    "click",
    () => {

        cocoBlueStickerZoom =
            Math.max(
                0.6,
                cocoBlueStickerZoom - 0.1
            );

        updateCocoBluePreviewDesign();

    }
);


// ==========================================================
// PDF FONT
// ==========================================================

function getPdfFont(
    font
) {

    switch (font) {

        case "Georgia":
            return "times";

        case "Times New Roman":
            return "times";

        case "Courier New":
            return "courier";

        default:
            return "helvetica";

    }

}


// ==========================================================
// PDF BORDER
// ==========================================================

function drawCocoBlueBorder(
    pdf,
    width,
    height,
    enabled,
    style
) {

    if (!enabled) {
        return;
    }


    const borderStyles = {

        dark: {
            width: 0.8,
            color: [30, 30, 30]
        },

        medium: {
            width: 0.5,
            color: [85, 85, 85]
        },

        light: {
            width: 0.25,
            color: [160, 160, 160]
        },

        double: {
            width: 0.5,
            color: [45, 45, 45]
        },

        dashed: {
            width: 0.4,
            color: [80, 80, 80]
        },

        dot: {
            width: 0.4,
            color: [80, 80, 80]
        },

        bold: {
            width: 1.4,
            color: [15, 15, 15]
        }

    };


    const current =
        borderStyles[style] ||
        borderStyles.dark;


    pdf.setLineWidth(
        current.width
    );

    pdf.setDrawColor(
        ...current.color
    );


    if (
        style === "dashed"
    ) {

        pdf.setLineDashPattern(
            [2, 2],
            0
        );

    }


    if (
        style === "dot"
    ) {

        pdf.setLineDashPattern(
            [0.5, 1.5],
            0
        );

    }


    pdf.rect(
        3,
        3,
        width - 6,
        height - 6
    );


    if (
        style === "double"
    ) {

        pdf.setLineDashPattern(
            [],
            0
        );

        pdf.setLineWidth(
            0.25
        );

        pdf.rect(
            6,
            6,
            width - 12,
            height - 12
        );

    }


    pdf.setLineDashPattern(
        [],
        0
    );

}


// ==========================================================
// STICKER PDF
// ==========================================================

cocoblueGeneratePDF.addEventListener(
    "click",
    () => {

        const pos =
            currentPOs();


        if (
            pos.length === 0
        ) {

            alert(
                "Please enter at least one PO number."
            );

            return;

        }


        const page =
            getCocoBlueStickerPageSize();


        if (!page) {

            alert(
                "Please enter a valid custom page size."
            );

            return;

        }


        const start =
            parseInt(
                cocoblueStartBox.value,
                10
            ) || 1;


        const pages =
            parseInt(
                cocobluePageCount.value,
                10
            ) || 1;


        const labelsPerPage =
            parseInt(
                cocoblueLabelsPerPage.value,
                10
            ) || 1;


        cocoblueStatus.textContent =
            "Generating PDF...";


        const orientation =
            page.width > page.height
                ? "landscape"
                : "portrait";


        const pdf =
            new jsPDF({

                orientation,

                unit:
                    "mm",

                format:
                    [
                        page.width,
                        page.height
                    ]

            });


        const font =
            getPdfFont(
                cocoblueFont.value
            );


        const fontSize =
            parseInt(
                cocoblueFontSize.value,
                10
            ) || 10;


        const weight =
            cocoblueFontWeight.value ===
            "bold"
                ? "bold"
                : "normal";


        let pageIndex = 0;


        pos.forEach(
            po => {

                for (
                    let pageNo = 1;
                    pageNo <= pages;
                    pageNo++
                ) {

                    if (
                        pageIndex > 0
                    ) {

                        pdf.addPage(
                            [
                                page.width,
                                page.height
                            ],
                            orientation
                        );

                    }


                    drawCocoBlueBorder(
                        pdf,
                        page.width,
                        page.height,
                        cocoblueBorderEnabled.checked,
                        cocoblueBorderStyle.value
                    );


                    const rows =
                        labelsPerPage <= 2
                            ? 1
                            : Math.ceil(
                                labelsPerPage /
                                2
                            );


                    const columns =
                        labelsPerPage === 1
                            ? 1
                            : 2;


                    const cellWidth =
                        page.width /
                        columns;


                    const cellHeight =
                        page.height /
                        rows;


                    for (
                        let i = 0;
                        i < labelsPerPage;
                        i++
                    ) {

                        const row =
                            Math.floor(
                                i / columns
                            );


                        const column =
                            i % columns;


                        const x =
                            column *
                            cellWidth;


                        const y =
                            row *
                            cellHeight;


                        const centerX =
                            x +
                            cellWidth / 2;


                        const centerY =
                            y +
                            cellHeight / 2;


                        pdf.setFont(
                            font,
                            weight
                        );


                        pdf.setTextColor(
                            20,
                            20,
                            20
                        );


                        pdf.setFontSize(
                            fontSize
                        );


                        pdf.text(
                            String(po),
                            centerX,
                            centerY - 4,
                            {
                                align:
                                    "center"
                            }
                        );


                        pdf.setFontSize(
                            Math.min(
                                40,
                                fontSize + 8
                            )
                        );


                        pdf.text(
                            `BOX ${start}`,
                            centerX,
                            centerY + 10,
                            {
                                align:
                                    "center"
                            }
                        );

                    }


                    pageIndex++;

                }

            }
        );


        const filename =
            `${safeFileName(pos[0])}_CocoBlue_Labels.pdf`;


        pdf.save(
            filename
        );


        cocoblueStatus.textContent =
            `PDF generated successfully — ${pageIndex} page(s)`;

    }
);


// ==========================================================
// ADDRESS PREVIEW
// ==========================================================

function updateCocoBlueAddressPreview() {

    const from =
        cocoblueFromAddress.value.trim();

    const to =
        cocoblueToAddress.value.trim();


    cocobluePreviewFrom.textContent =
        from
            ? `FROM\n${from}`
            : "FROM";


    cocobluePreviewTo.textContent =
        to
            ? `TO\n${to}`
            : "TO";


    cocobluePreviewFrom.style.fontFamily =
        cocoblueAddressFont.value;

    cocobluePreviewTo.style.fontFamily =
        cocoblueAddressFont.value;


    const size =
        parseInt(
            cocoblueAddressFontSize.value,
            10
        ) || 10;


    cocobluePreviewFrom.style.fontSize =
        `${size}px`;

    cocobluePreviewTo.style.fontSize =
        `${size}px`;


    cocobluePreviewFrom.style.fontWeight =
        cocoblueAddressWeight.value;

    cocobluePreviewTo.style.fontWeight =
        cocoblueAddressWeight.value;


    if (
        !cocoblueAddressBorder.checked
    ) {

        cocoblueAddressPreview.style.border =
            "none";

    }

    else {

        const styles = {

            dark: "3px solid #1d1d1b",
            medium: "2px solid #555",
            light: "1px solid #aaa",
            double: "4px double #333",
            dashed: "2px dashed #555",
            dot: "2px dotted #555",
            bold: "5px solid #111"

        };


        cocoblueAddressPreview.style.border =
            styles[
                cocoblueAddressBorderStyle.value
            ] ||
            styles.dark;

    }

}


[
    cocoblueFromAddress,
    cocoblueToAddress,
    cocoblueAddressBorder,
    cocoblueAddressBorderStyle,
    cocoblueAddressFont,
    cocoblueAddressFontSize,
    cocoblueAddressWeight
].forEach(
    element => {

        element.addEventListener(
            "input",
            updateCocoBlueAddressPreview
        );

        element.addEventListener(
            "change",
            updateCocoBlueAddressPreview
        );

    }
);


// ==========================================================
// ADDRESS PDF
// ==========================================================

cocoblueAddressPDF.addEventListener(
    "click",
    () => {

        const from =
            cocoblueFromAddress.value.trim();

        const to =
            cocoblueToAddress.value.trim();


        if (!from) {

            alert(
                "Please enter From Address."
            );

            return;

        }


        if (!to) {

            alert(
                "Please enter To Address."
            );

            return;

        }


        const page =
            getCocoBlueAddressPageSize();


        cocoblueAddressStatus.textContent =
            "Generating address PDF...";


        const orientation =
            page.width >
            page.height
                ? "landscape"
                : "portrait";


        const pdf =
            new jsPDF({

                orientation,

                unit:
                    "mm",

                format:
                    [
                        page.width,
                        page.height
                    ]

            });


        // Border

        drawCocoBlueBorder(
            pdf,
            page.width,
            page.height,
            cocoblueAddressBorder.checked,
            cocoblueAddressBorderStyle.value
        );


        const font =
            getPdfFont(
                cocoblueAddressFont.value
            );


        const size =
            parseInt(
                cocoblueAddressFontSize.value,
                10
            ) || 10;


        const weight =
            cocoblueAddressWeight.value ===
            "bold"
                ? "bold"
                : "normal";


        pdf.setFont(
            font,
            weight
        );


        pdf.setFontSize(
            size
        );


        const left =
            10;


        const top =
            20;


        const usableWidth =
            page.width - 20;


        pdf.text(
            "FROM",
            left,
            top
        );


        const fromLines =
            pdf.splitTextToSize(
                from,
                usableWidth
            );


        pdf.text(
            fromLines,
            left,
            top + 8
        );


        const toStart =
            top +
            25 +
            (
                fromLines.length *
                size *
                0.45
            );


        pdf.text(
            "TO",
            left,
            toStart
        );


        const toLines =
            pdf.splitTextToSize(
                to,
                usableWidth
            );


        pdf.text(
            toLines,
            left,
            toStart + 8
        );


        pdf.save(
            "CocoBlue_Address_Label.pdf"
        );


        cocoblueAddressStatus.textContent =
            "Address PDF generated successfully.";

    }
);


// ==========================================================
// STICKER RESET
// ==========================================================

cocoblueReset.addEventListener(
    "click",
    () => {

        cocobluePOInputs.forEach(
            input => {
                input.value = "";
            }
        );


        cocoBluePOs = [];


        cocoblueExcelFile.value =
            "";


        cocoblueExcelStatus.textContent =
            "No file selected";


        cocoblueStartBox.value =
            1;

        cocoblueEndBox.value =
            10;

        cocoblueLabelsPerPage.value =
            1;

        cocobluePageCount.value =
            1;


        cocoblueBorderEnabled.checked =
            false;


        cocoblueBorderStyle.value =
            "dark";


        cocoblueFont.value =
            "Arial";


        cocoblueFontSize.value =
            10;


        cocoblueFontWeight.value =
            "normal";


        cocoBlueStickerZoom =
            1;


        updateCocoBlueSticker();


        cocoblueStatus.textContent =
            "Ready to generate.";

    }
);


// ==========================================================
// ADDRESS RESET
// ==========================================================

cocoblueAddressReset.addEventListener(
    "click",
    () => {

        cocoblueFromAddress.value =
            "";

        cocoblueToAddress.value =
            "";


        cocoblueAddressBorder.checked =
            false;


        cocoblueAddressBorderStyle.value =
            "dark";


        cocoblueAddressFont.value =
            "Arial";


        cocoblueAddressFontSize.value =
            10;


        cocoblueAddressWeight.value =
            "normal";


        updateCocoBlueAddressPreview();


        cocoblueAddressStatus.textContent =
            "Ready to generate.";

    }
);


// ==========================================================
// INITIAL STATE
// ==========================================================

activateStickerMode();

updateCocoBlueSticker();

updateCocoBlueAddressPreview();
