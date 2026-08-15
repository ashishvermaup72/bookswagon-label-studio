// ============================================================
// BOOKSWAGON LABEL STUDIO
// FINAL JAVASCRIPT ENGINE
// ============================================================

const { jsPDF } = window.jspdf;


// ============================================================
// GLOBAL STATE
// ============================================================

let uploadedPOs = [];
let currentPageSize = "4x6";
let zoom = 1;


// ============================================================
// ELEMENTS
// ============================================================

const manualTab = document.getElementById("manualTab");
const excelTab = document.getElementById("excelTab");

const manualPOArea = document.getElementById("manualPOArea");
const excelPOArea = document.getElementById("excelPOArea");

const excelFile = document.getElementById("excelFile");
const excelFileStatus =
    document.getElementById("excelFileStatus");

const poInputs =
    document.querySelectorAll(".po-input");

const pageSizeButtons =
    document.querySelectorAll(".page-size-button");

const customWidth =
    document.getElementById("customWidth");

const customHeight =
    document.getElementById("customHeight");

const startBox =
    document.getElementById("startBox");

const endBox =
    document.getElementById("endBox");

const labelsPerPage =
    document.getElementById("labelsPerPage");

const pageCount =
    document.getElementById("pageCount");

const borderEnabled =
    document.getElementById("borderEnabled");

const borderStyle =
    document.getElementById("borderStyle");

const fontFamily =
    document.getElementById("fontFamily");

const fontSize =
    document.getElementById("fontSize");

const fontWeight =
    document.getElementById("fontWeight");

const previewPO =
    document.getElementById("previewPO");

const previewBox =
    document.getElementById("previewBox");

const labelPreview =
    document.getElementById("labelPreview");

const summaryPageSize =
    document.getElementById("summaryPageSize");

const summaryLabels =
    document.getElementById("summaryLabels");

const summaryPages =
    document.getElementById("summaryPages");

const generationStatus =
    document.getElementById("generationStatus");

const generatePDFButton =
    document.getElementById("generatePDFButton");

const resetButton =
    document.getElementById("resetButton");

const newProjectButton =
    document.getElementById("newProjectButton");

const zoomIn =
    document.getElementById("zoomIn");

const zoomOut =
    document.getElementById("zoomOut");

const zoomValue =
    document.getElementById("zoomValue");


// ============================================================
// HELPERS
// ============================================================

function getActiveInputMode() {
    return excelTab.classList.contains("active")
        ? "excel"
        : "manual";
}


function getPOs() {

    if (getActiveInputMode() === "excel") {
        return [...uploadedPOs];
    }

    return Array.from(poInputs)
        .map(input => input.value.trim())
        .filter(Boolean);
}


function getLayoutMode() {

    const selected =
        document.querySelector(
            'input[name="layoutMode"]:checked'
        );

    return selected
        ? selected.value
        : "same";
}


function safeFileName(value) {

    return String(value)
        .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );
}


function getPositiveNumber(value, fallback) {

    const number =
        Number(value);

    return Number.isFinite(number) &&
           number > 0
        ? number
        : fallback;
}


// ============================================================
// INPUT MODE
// ============================================================

manualTab.addEventListener(
    "click",
    () => {

        manualTab.classList.add("active");
        excelTab.classList.remove("active");

        manualPOArea.classList.remove("hidden");
        excelPOArea.classList.add("hidden");

        updateAll();
    }
);


excelTab.addEventListener(
    "click",
    () => {

        excelTab.classList.add("active");
        manualTab.classList.remove("active");

        excelPOArea.classList.remove("hidden");
        manualPOArea.classList.add("hidden");

        updateAll();
    }
);


// ============================================================
// EXCEL UPLOAD
// ============================================================

excelFile.addEventListener(
    "change",
    async (event) => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        try {

            excelFileStatus.textContent =
                "Reading Excel file...";

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
                !workbook.SheetNames ||
                workbook.SheetNames.length === 0
            ) {

                throw new Error(
                    "No worksheet found."
                );

            }

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

            uploadedPOs = [];

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

                    const headerNames = [
                        "po",
                        "po number",
                        "po no",
                        "po no.",
                        "po_number",
                        "purchase order"
                    ];

                    if (
                        index === 0 &&
                        headerNames.includes(
                            normalized
                        )
                    ) {
                        return;
                    }

                    uploadedPOs.push(value);
                }
            );

            uploadedPOs =
                [...new Set(uploadedPOs)];

            if (
                uploadedPOs.length === 0
            ) {

                excelFileStatus.textContent =
                    "No PO numbers found.";

                alert(
                    "No PO numbers found in the first column."
                );

                return;
            }

            excelFileStatus.textContent =
                `${uploadedPOs.length} PO(s) loaded`;

            updateAll();

        }

        catch (error) {

            console.error(error);

            excelFileStatus.textContent =
                "Excel reading failed.";

            alert(
                "Unable to read the Excel file."
            );
        }

    }
);


// ============================================================
// PAGE SIZE
// ============================================================

pageSizeButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                pageSizeButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                button.classList.add("active");

                currentPageSize =
                    button.dataset.pageSize;

                updateAll();
            }
        );

    }
);


function getPageSize() {

    if (currentPageSize === "4x6") {

        return {
            width: 101.6,
            height: 152.4,
            label: "4 × 6 inch"
        };
    }


    if (currentPageSize === "a4") {

        return {
            width: 210,
            height: 297,
            label: "A4"
        };
    }


    if (currentPageSize === "70x35") {

        return {
            width: 70,
            height: 35,
            label: "70 × 35 mm"
        };
    }


    const width =
        getPositiveNumber(
            customWidth.value,
            null
        );

    const height =
        getPositiveNumber(
            customHeight.value,
            null
        );

    if (!width || !height) {
        return null;
    }

    return {
        width,
        height,
        label: `${width} × ${height} mm`
    };
}


// ============================================================
// SETTINGS
// ============================================================

function getSettings() {

    let start =
        parseInt(
            startBox.value,
            10
        );

    let end =
        parseInt(
            endBox.value,
            10
        );

    let perPage =
        parseInt(
            labelsPerPage.value,
            10
        );

    let pages =
        parseInt(
            pageCount.value,
            10
        );

    if (
        !Number.isFinite(start) ||
        start < 1
    ) {
        start = 1;
    }

    if (
        !Number.isFinite(end) ||
        end < start
    ) {
        end = start;
    }

    if (
        !Number.isFinite(perPage) ||
        perPage < 1
    ) {
        perPage = 1;
    }

    if (
        !Number.isFinite(pages) ||
        pages < 1
    ) {
        pages = 1;
    }

    return {
        start,
        end,
        perPage,
        pages
    };
}


// ============================================================
// LABEL/PAGE GRID
// ============================================================

function getGrid(count) {

    const grids = {

        1: [1, 1],
        2: [1, 2],
        3: [1, 3],
        4: [2, 2],
        5: [2, 3],
        6: [2, 3],
        7: [2, 4],
        8: [2, 4],
        9: [3, 3],
        10: [2, 5]

    };

    return grids[count] || [2, 5];
}


// ============================================================
// BUILD OUTPUT PAGES
// ============================================================

function buildOutputPages() {

    const pos =
        getPOs();

    const {
        start,
        end,
        perPage,
        pages
    } =
        getSettings();

    const mode =
        getLayoutMode();

    const outputPages = [];


    // ========================================================
    // SAME BOX MODE
    // ========================================================

    if (mode === "same") {

        pos.forEach(
            po => {

                for (
                    let pageNo = 1;
                    pageNo <= pages;
                    pageNo++
                ) {

                    const pageLabels = [];

                    for (
                        let i = 0;
                        i < perPage;
                        i++
                    ) {

                        pageLabels.push({
                            po,
                            box: start
                        });

                    }

                    outputPages.push(
                        pageLabels
                    );
                }

            }
        );

        return outputPages;
    }


    // ========================================================
    // SEQUENTIAL MODE
    // ========================================================

    pos.forEach(
        po => {

            let currentBox =
                start;

            let currentPageLabels =
                [];

            while (
                currentBox <= end
            ) {

                currentPageLabels.push({

                    po,
                    box: currentBox

                });

                currentBox++;


                if (
                    currentPageLabels.length ===
                    perPage
                    ||
                    currentBox > end
                ) {

                    outputPages.push(
                        currentPageLabels
                    );

                    currentPageLabels = [];

                }

            }

        }
    );


    return outputPages;
}


// ============================================================
// PREVIEW
// ============================================================

function updatePreview() {

    const pos =
        getPOs();

    const settings =
        getSettings();

    const mode =
        getLayoutMode();


    previewPO.textContent =
        pos.length > 0
            ? pos[0]
            : "BWG123";


    previewBox.textContent =
        `BOX ${settings.start}`;


    const page =
        getPageSize();


    summaryPageSize.textContent =
        page
            ? page.label
            : "Custom";


    summaryLabels.textContent =
        settings.perPage;


    let totalPages = 1;


    if (pos.length > 0) {

        if (mode === "same") {

            totalPages =
                pos.length *
                settings.pages;

        }

        else {

            const boxCount =
                settings.end -
                settings.start +
                1;

            totalPages =
                Math.ceil(
                    (
                        pos.length *
                        boxCount
                    )
                    /
                    settings.perPage
                );

        }

    }


    summaryPages.textContent =
        totalPages;


    updatePreviewDesign();
}


// ============================================================
// PREVIEW DESIGN
// ============================================================

function updatePreviewDesign() {

    // --------------------------------------------------------
    // BORDER
    // --------------------------------------------------------

    if (
        !borderEnabled.checked
    ) {

        labelPreview.style.border =
            "none";

    }

    else {

        const styles = {

            "solid-dark":
                "3px solid #1d1d1b",

            "solid-medium":
                "2px solid #555",

            "solid-light":
                "1px solid #aaa",

            "double":
                "4px double #333",

            "dashed":
                "2px dashed #555"

        };

        labelPreview.style.border =
            styles[
                borderStyle.value
            ] ||
            styles["solid-dark"];
    }


    // --------------------------------------------------------
    // FONT
    // --------------------------------------------------------

    previewPO.style.fontFamily =
        fontFamily.value;

    previewBox.style.fontFamily =
        fontFamily.value;


    const size =
        parseInt(
            fontSize.value,
            10
        ) || 10;


    previewPO.style.fontSize =
        `${size}px`;


    previewBox.style.fontSize =
        `${Math.min(
            40,
            size + 8
        )}px`;


    previewPO.style.fontWeight =
        fontWeight.value;

    previewBox.style.fontWeight =
        fontWeight.value;


    // --------------------------------------------------------
    // ZOOM
    // --------------------------------------------------------

    labelPreview.style.transform =
        `scale(${zoom})`;

    zoomValue.textContent =
        `${Math.round(
            zoom * 100
        )}%`;
}


// ============================================================
// EVENT LISTENERS
// ============================================================

poInputs.forEach(
    input => {

        input.addEventListener(
            "input",
            updateAll
        );

    }
);


[
    customWidth,
    customHeight,
    startBox,
    endBox,
    labelsPerPage,
    pageCount,
    borderEnabled,
    borderStyle,
    fontFamily,
    fontSize,
    fontWeight
].forEach(
    element => {

        element.addEventListener(
            "input",
            updateAll
        );

        element.addEventListener(
            "change",
            updateAll
        );

    }
);


// ============================================================
// LAYOUT RADIO BUTTONS
// ============================================================

document
    .querySelectorAll(
        'input[name="layoutMode"]'
    )
    .forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {

                    document
                        .querySelectorAll(
                            ".layout-option"
                        )
                        .forEach(
                            card =>
                                card.classList.remove(
                                    "active"
                                )
                        );


                    const activeCard =
                        radio.closest(
                            ".layout-option"
                        );


                    if (activeCard) {

                        activeCard.classList.add(
                            "active"
                        );

                    }


                    updateAll();
                }
            );

        }
    );


// ============================================================
// ZOOM
// ============================================================

zoomIn.addEventListener(
    "click",
    () => {

        zoom =
            Math.min(
                1.5,
                zoom + 0.1
            );

        updatePreviewDesign();
    }
);


zoomOut.addEventListener(
    "click",
    () => {

        zoom =
            Math.max(
                0.6,
                zoom - 0.1
            );

        updatePreviewDesign();
    }
);


// ============================================================
// PDF FONT MAPPING
// ============================================================

function getPDFFont() {

    switch (
        fontFamily.value
    ) {

        case "Georgia":
            return "times";

        case "Times New Roman":
            return "times";

        default:
            return "helvetica";
    }
}


// ============================================================
// PDF BORDER
// ============================================================

function drawPDFBorder(
    pdf,
    width,
    height
) {

    if (
        !borderEnabled.checked
    ) {
        return;
    }


    switch (
        borderStyle.value
    ) {

        case "solid-dark":

            pdf.setDrawColor(
                30,
                30,
                30
            );

            pdf.setLineWidth(
                0.8
            );

            pdf.rect(
                3,
                3,
                width - 6,
                height - 6
            );

            break;


        case "solid-medium":

            pdf.setDrawColor(
                85,
                85,
                85
            );

            pdf.setLineWidth(
                0.5
            );

            pdf.rect(
                3,
                3,
                width - 6,
                height - 6
            );

            break;


        case "solid-light":

            pdf.setDrawColor(
                160,
                160,
                160
            );

            pdf.setLineWidth(
                0.25
            );

            pdf.rect(
                3,
                3,
                width - 6,
                height - 6
            );

            break;


        case "double":

            pdf.setDrawColor(
                50,
                50,
                50
            );

            pdf.setLineWidth(
                0.5
            );

            pdf.rect(
                3,
                3,
                width - 6,
                height - 6
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

            break;


        case "dashed":

            pdf.setDrawColor(
                80,
                80,
                80
            );

            pdf.setLineWidth(
                0.4
            );

            pdf.setLineDashPattern(
                [2, 2],
                0
            );

            pdf.rect(
                3,
                3,
                width - 6,
                height - 6
            );

            pdf.setLineDashPattern(
                [],
                0
            );

            break;

    }
}


// ============================================================
// DRAW LABEL
// ============================================================

function drawLabel(
    pdf,
    label,
    x,
    y,
    width,
    height
) {

    const size =
        parseInt(
            fontSize.value,
            10
        ) || 10;


    const font =
        getPDFFont();


    const weight =
        fontWeight.value ===
        "bold"
            ? "bold"
            : "normal";


    pdf.setTextColor(
        25,
        25,
        25
    );


    pdf.setFont(
        font,
        weight
    );


    // --------------------------------------------------------
    // PO NUMBER
    // --------------------------------------------------------

    pdf.setFontSize(
        size
    );


    pdf.text(
        String(label.po),
        x + width / 2,
        y + height * 0.43,
        {
            align: "center"
        }
    );


    // --------------------------------------------------------
    // BOX NUMBER
    // --------------------------------------------------------

    pdf.setFontSize(
        Math.min(
            40,
            size + 8
        )
    );


    pdf.text(
        `BOX ${label.box}`,
        x + width / 2,
        y + height * 0.60,
        {
            align: "center"
        }
    );
}


// ============================================================
// PDF GENERATION
// ============================================================

generatePDFButton.addEventListener(
    "click",
    () => {

        const pos =
            getPOs();


        if (
            pos.length === 0
        ) {

            alert(
                "Please enter at least one PO number."
            );

            return;
        }


        const page =
            getPageSize();


        if (!page) {

            alert(
                "Please select a valid page size."
            );

            return;
        }


        const outputPages =
            buildOutputPages();


        if (
            outputPages.length === 0
        ) {

            alert(
                "No labels available."
            );

            return;
        }


        generationStatus.textContent =
            "Generating PDF...";


        const orientation =
            page.width > page.height
                ? "landscape"
                : "portrait";


        const pdf =
            new jsPDF({
                orientation,
                unit: "mm",
                format: [
                    page.width,
                    page.height
                ]
            });


        // ====================================================
        // EACH PDF PAGE
        // ====================================================

        outputPages.forEach(
            (pageLabels, pageIndex) => {

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


                drawPDFBorder(
                    pdf,
                    page.width,
                    page.height
                );


                const count =
                    pageLabels.length;


                const [
                    rows,
                    columns
                ] =
                    getGrid(count);


                const cellWidth =
                    page.width /
                    columns;


                const cellHeight =
                    page.height /
                    rows;


                pageLabels.forEach(
                    (label, index) => {

                        const row =
                            Math.floor(
                                index /
                                columns
                            );


                        const column =
                            index %
                            columns;


                        const x =
                            column *
                            cellWidth;


                        const y =
                            row *
                            cellHeight;


                        drawLabel(
                            pdf,
                            label,
                            x,
                            y,
                            cellWidth,
                            cellHeight
                        );

                    }
                );

            }
        );


        // ====================================================
        // FILE NAME
        // ====================================================

        const firstPO =
            safeFileName(
                pos[0]
            );


        const filename =
            `${firstPO}_BooksWagon_Labels.pdf`;


        pdf.save(
            filename
        );


        generationStatus.textContent =
            `PDF generated successfully — ${outputPages.length} page(s)`;
    }
);


// ============================================================
// RESET
// ============================================================

function resetAll() {

    // PO

    poInputs.forEach(
        input => {
            input.value = "";
        }
    );


    uploadedPOs = [];


    excelFile.value =
        "";


    excelFileStatus.textContent =
        "No file selected";


    // Mode

    manualTab.classList.add(
        "active"
    );

    excelTab.classList.remove(
        "active"
    );

    manualPOArea.classList.remove(
        "hidden"
    );

    excelPOArea.classList.add(
        "hidden"
    );


    // Page size

    currentPageSize =
        "4x6";


    pageSizeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.pageSize ===
                    "4x6"
            );

        }
    );


    customWidth.value = "";
    customHeight.value = "";


    // Box

    startBox.value = 1;
    endBox.value = 10;

    labelsPerPage.value = 1;
    pageCount.value = 1;


    // Layout

    const sameMode =
        document.querySelector(
            'input[name="layoutMode"][value="same"]'
        );


    if (sameMode) {

        sameMode.checked = true;

    }


    document
        .querySelectorAll(
            ".layout-option"
        )
        .forEach(
            card =>
                card.classList.remove(
                    "active"
                )
        );


    const sameCard =
        sameMode
            ? sameMode.closest(
                ".layout-option"
            )
            : null;


    if (sameCard) {

        sameCard.classList.add(
            "active"
        );

    }


    // Design

    borderEnabled.checked =
        false;

    borderStyle.value =
        "solid-dark";

    fontFamily.value =
        "Arial";

    fontSize.value =
        "10";

    fontWeight.value =
        "normal";


    // Zoom

    zoom = 1;


    generationStatus.textContent =
        "Ready to generate";


    updateAll();
}


resetButton.addEventListener(
    "click",
    resetAll
);


newProjectButton.addEventListener(
    "click",
    () => {

        resetAll();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// ============================================================
// UPDATE
// ============================================================

function updateAll() {

    updatePreview();

}


// ============================================================
// INITIALIZE
// ============================================================

updateAll();
