document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =========================================================
       LIBRARIES
    ========================================================== */

    const PDF =
        window.jspdf &&
        typeof window.jspdf.jsPDF === "function"
            ? window.jspdf.jsPDF
            : null;

    const ZIP =
        window.JSZip || null;

    const XLSX_LIB =
        window.XLSX || null;


    /* =========================================================
       STATE
    ========================================================== */

    let cocoInputMode = "manual";
    let cocoSize = "4x6";
    let cocoAddressSize = "4x6";
    let cocoExcelPOs = [];

    let otherInputMode = "manual";
    let otherSize = "4x6";
    let otherAddressSize = "4x6";
    let otherExcelPOs = [];

    let isbnInputMode = "manual";
    let isbnSize = "4x6";
    let isbnRows = [];


    /* =========================================================
       HELPERS
    ========================================================== */

    function requirePDF() {
        if (!PDF) {
            alert(
                "PDF library load nahi hui.\n\n" +
                "Please refresh the page and try again."
            );
            return false;
        }
        return true;
    }


    function requireXLSX() {
        if (!XLSX_LIB) {
            alert(
                "Excel library load nahi hui.\n\n" +
                "Please refresh the page and try again."
            );
            return false;
        }
        return true;
    }


    function safeName(value) {
        return String(value || "BooksWagon")
            .trim()
            .replace(/[^a-zA-Z0-9_-]/g, "_");
    }


    function pad2(value) {
        return String(value).padStart(2, "0");
    }


    function timestamp() {
        const d = new Date();

        return {
            date:
                `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,

            time:
                `${pad2(d.getHours())}-${pad2(d.getMinutes())}-${pad2(d.getSeconds())}`
        };
    }


    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1500);
    }


    function downloadPDF(pdf, filename) {
        try {
            downloadBlob(
                pdf.output("blob"),
                filename
            );
            return true;
        } catch (error) {
            console.error(error);
            alert("PDF download failed.");
            return false;
        }
    }


    async function downloadZip(files, filename) {

        if (!ZIP) {
            alert(
                "ZIP library load nahi hui."
            );
            return false;
        }

        const zip = new ZIP();

        files.forEach(file => {
            zip.file(
                file.name,
                file.blob
            );
        });

        const blob =
            await zip.generateAsync({
                type: "blob"
            });

        downloadBlob(
            blob,
            filename
        );

        return true;
    }


    function getPageSize(
        type,
        customWidth,
        customHeight
    ) {

        if (type === "4x6") {
            return {
                width: 101.6,
                height: 152.4,
                label: "4 × 6 inch"
            };
        }

        if (type === "a4") {
            return {
                width: 210,
                height: 297,
                label: "A4"
            };
        }

        if (type === "70x35") {
            return {
                width: 70,
                height: 35,
                label: "70 × 35 mm"
            };
        }

        if (type === "custom") {

            const width = Number(customWidth);
            const height = Number(customHeight);

            if (
                !Number.isFinite(width) ||
                !Number.isFinite(height) ||
                width <= 0 ||
                height <= 0
            ) {
                return null;
            }

            return {
                width,
                height,
                label: `${width} × ${height} mm`
            };
        }

        return null;
    }


    function getOrientation(page) {
        return page.width > page.height
            ? "landscape"
            : "portrait";
    }


    function pdfFont(font) {
        if (
            font === "Georgia" ||
            font === "Times New Roman"
        ) {
            return "times";
        }

        if (font === "Courier New") {
            return "courier";
        }

        return "helvetica";
    }


    function getBorderCSS(style) {

        const borders = {

            "solid-dark":
                "3px solid #1c1c1a",

            "solid-medium":
                "2px solid #555",

            "solid-light":
                "1px solid #aaa",

            "double":
                "4px double #333",

            "dashed":
                "2px dashed #555",

            "dotted":
                "2px dotted #555",

            "bold":
                "5px solid #111",

            "double-dark":
                "5px double #111",

            "inner":
                "2px inset #444",

            "outer":
                "4px outset #444",

            "triple":
                "6px double #222",

            "text-box":
                "2px solid #222"

        };

        return (
            borders[style] ||
            borders["solid-dark"]
        );
    }


    function drawBorder(
        pdf,
        width,
        height,
        enabled,
        style
    ) {

        if (!enabled) {
            return;
        }

        const configs = {

            "solid-dark": [.8, 25],
            "solid-medium": [.5, 80],
            "solid-light": [.25, 160],
            "double": [.5, 45],
            "dashed": [.4, 80],
            "dotted": [.4, 80],
            "bold": [1.4, 10],
            "double-dark": [1, 20],
            "inner": [.5, 50],
            "outer": [1, 50],
            "triple": [.6, 30],
            "text-box": [.7, 30]

        };

        const cfg =
            configs[style] ||
            configs["solid-dark"];

        pdf.setDrawColor(
            cfg[1],
            cfg[1],
            cfg[1]
        );

        pdf.setLineWidth(cfg[0]);

        if (style === "dashed") {
            pdf.setLineDashPattern(
                [2, 2],
                0
            );
        }

        if (style === "dotted") {
            pdf.setLineDashPattern(
                [.5, 1.5],
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
            style === "double" ||
            style === "double-dark"
        ) {
            pdf.setLineDashPattern([], 0);
            pdf.setLineWidth(.3);

            pdf.rect(
                6,
                6,
                width - 12,
                height - 12
            );
        }

        if (style === "triple") {
            pdf.setLineDashPattern([], 0);
            pdf.setLineWidth(.25);

            pdf.rect(
                7,
                7,
                width - 14,
                height - 14
            );
        }

        if (style === "inner") {
            pdf.setLineDashPattern([], 0);
            pdf.setLineWidth(.35);

            pdf.rect(
                7,
                7,
                width - 14,
                height - 14
            );
        }

        pdf.setLineDashPattern([], 0);
    }


    function drawTaxBorder(
        pdf,
        width,
        height,
        enabled
    ) {

        if (!enabled) {
            return;
        }

        pdf.setDrawColor(
            100,
            100,
            100
        );

        pdf.setLineWidth(.35);

        pdf.setLineDashPattern(
            [1, 1],
            0
        );

        pdf.rect(
            9,
            9,
            width - 18,
            height - 18
        );

        pdf.setLineDashPattern([], 0);
    }


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

        return grids[count] || [1, count];
    }


    /* =========================================================
       PREVIEW SIZE
    ========================================================== */

    function updatePagePreview(
        element,
        type,
        customW,
        customH
    ) {

        if (!element) {
            return;
        }

        element.classList.remove(
            "size-4x6",
            "size-a4",
            "size-70x35",
            "size-custom"
        );

        element.classList.add(
            `size-${type}`
        );

        const page =
            getPageSize(
                type,
                customW,
                customH
            );

        if (!page) {
            return;
        }

        const ratio =
            page.width /
            page.height;

        let height = 435;
        let width =
            height * ratio;

        if (width > 330) {
            width = 330;
            height = width / ratio;
        }

        element.style.width =
            `${Math.max(120, width)}px`;

        element.style.height =
            `${Math.max(90, height)}px`;
    }


    /* =========================================================
       WORKSPACE OPEN
    ========================================================== */

    const workspaces =
        document.querySelectorAll(
            ".tool-workspace"
        );


    function hideWorkspaces() {
        workspaces.forEach(
            item => {
                item.style.display = "none";
            }
        );
    }


    document
        .querySelectorAll(
            "[data-open-tool]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        hideWorkspaces();

                        const tool =
                            button.dataset.openTool;

                        let id = "";

                        if (
                            tool === "cocoblue"
                        ) {
                            id =
                                "cocoblueWorkspace";
                        }

                        if (
                            tool === "otherpo"
                        ) {
                            id =
                                "otherpoWorkspace";
                        }

                        if (
                            tool === "isbn"
                        ) {
                            id =
                                "isbnWorkspace";
                        }

                        const workspace =
                            document.getElementById(
                                id
                            );

                        if (!workspace) {
                            return;
                        }

                        workspace.style.display =
                            "block";

                        workspace.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                );
            }
        );


    document
        .querySelectorAll(
            "[data-close-tool]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        hideWorkspaces();

                        document
                            .getElementById("tools")
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });
                    }
                );
            }
        );


    /* =========================================================
       COCOBLUE
    ========================================================== */

    function getCocoPOs() {

        if (
            cocoInputMode === "excel"
        ) {
            return [...cocoExcelPOs];
        }

        return Array.from(
            document.querySelectorAll(".coco-po")
        )
        .map(
            input =>
                input.value.trim()
        )
        .filter(Boolean);
    }


    document
        .querySelectorAll(
            "[data-coco-input]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-coco-input]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        cocoInputMode =
                            button.dataset.cocoInput;

                        document
                            .getElementById(
                                "cocoManualArea"
                            )
                            .classList.toggle(
                                "hidden",
                                cocoInputMode !==
                                "manual"
                            );

                        document
                            .getElementById(
                                "cocoExcelArea"
                            )
                            .classList.toggle(
                                "hidden",
                                cocoInputMode !==
                                "excel"
                            );

                        updateCocoPreview();
                    }
                );
            }
        );


    document
        .getElementById("cocoExcel")
        .addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files[0];

                if (!file) {
                    return;
                }

                if (!requireXLSX()) {
                    return;
                }

                try {

                    const buffer =
                        await file.arrayBuffer();

                    const workbook =
                        XLSX_LIB.read(
                            buffer,
                            {
                                type: "array"
                            }
                        );

                    const sheet =
                        workbook.Sheets[
                            workbook.SheetNames[0]
                        ];

                    const rows =
                        XLSX_LIB.utils.sheet_to_json(
                            sheet,
                            {
                                header: 1,
                                defval: ""
                            }
                        );

                    cocoExcelPOs = [];

                    rows.forEach(
                        (row, index) => {

                            const value =
                                String(
                                    row?.[0] ||
                                    ""
                                ).trim();

                            if (!value) {
                                return;
                            }

                            const header =
                                value.toLowerCase();

                            if (
                                index === 0 &&
                                [
                                    "po",
                                    "po number",
                                    "po no",
                                    "po no.",
                                    "po_number"
                                ].includes(
                                    header
                                )
                            ) {
                                return;
                            }

                            cocoExcelPOs.push(
                                value
                            );
                        }
                    );

                    cocoExcelPOs =
                        [...new Set(cocoExcelPOs)];

                    document.getElementById(
                        "cocoExcelStatus"
                    ).textContent =
                        `${cocoExcelPOs.length} PO(s) loaded`;

                    updateCocoPreview();

                } catch (error) {

                    console.error(error);

                    document.getElementById(
                        "cocoExcelStatus"
                    ).textContent =
                        "Excel reading failed.";

                    alert(
                        "Unable to read the Excel file."
                    );
                }
            }
        );


    /* ---------------------------------------------------------
       COCO PAGE SIZE
    ---------------------------------------------------------- */

    document
        .querySelectorAll(
            "[data-coco-size]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-coco-size]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        cocoSize =
                            button.dataset.cocoSize;

                        document
                            .getElementById(
                                "cocoCustomSize"
                            )
                            .classList.toggle(
                                "hidden",
                                cocoSize !==
                                "custom"
                            );

                        updateCocoPreview();
                    }
                );
            }
        );


    /* ---------------------------------------------------------
       COCO PREVIEW
    ---------------------------------------------------------- */

    function updateCocoPreview() {

        const pos =
            getCocoPOs();

        const start =
            Number(
                document.getElementById(
                    "cocoStartBox"
                ).value
            ) || 1;

        const end =
            Number(
                document.getElementById(
                    "cocoEndBox"
                ).value
            ) || start;

        const pagePreview =
            document.getElementById(
                "cocoPreviewPage"
            );

        const label =
            document.getElementById(
                "cocoPreviewLabel"
            );

        const poPreview =
            document.getElementById(
                "cocoPreviewPO"
            );

        const boxPreview =
            document.getElementById(
                "cocoPreviewBox"
            );

        updatePagePreview(
            pagePreview,
            cocoSize,
            document.getElementById(
                "cocoCustomWidth"
            ).value,
            document.getElementById(
                "cocoCustomHeight"
            ).value
        );

        poPreview.textContent =
            pos[0] || "";

        boxPreview.textContent =
            `BOX NO. ${start}`;

        document.getElementById(
            "cocoBoxSummary"
        ).textContent =
            `${start}–${end}`;

        const page =
            getPageSize(
                cocoSize,
                document.getElementById(
                    "cocoCustomWidth"
                ).value,
                document.getElementById(
                    "cocoCustomHeight"
                ).value
            );

        if (page) {

            document.getElementById(
                "cocoSizeSummary"
            ).textContent =
                page.label;

        }

        document.getElementById(
            "cocoSummary"
        ).textContent =
            `${Math.max(
                1,
                end - start + 1
            )} boxes`;

        label.style.border =
            document.getElementById(
                "cocoBoxHighlight"
            ).checked
                ? "2px solid #1c1c1a"
                : "0";

        boxPreview.style.border =
            document.getElementById(
                "cocoBoxHighlight"
            ).checked
                ? "2px solid #1c1c1a"
                : "0";

        boxPreview.style.fontFamily =
            document.getElementById(
                "cocoFont"
            ).value;

        boxPreview.style.fontSize =
            `${
                Number(
                    document.getElementById(
                        "cocoFontSize"
                    ).value
                ) || 10
            }px`;

        boxPreview.style.fontWeight =
            document.getElementById(
                "cocoFontWeight"
            ).value;

        label.style.border =
            document.getElementById(
                "cocoBoxHighlight"
            ).checked
                ? "2px solid #1c1c1a"
                : "0";
    }


    [
        ".coco-po",
        "cocoStartBox",
        "cocoEndBox",
        "cocoCopiesPerBox",
        "cocoLabelsPerPage",
        "cocoVertical",
        "cocoCutting",
        "cocoBoxHighlight",
        "cocoTaxBorder",
        "cocoBorder",
        "cocoBorderStyle",
        "cocoFont",
        "cocoFontSize",
        "cocoFontWeight",
        "cocoCustomWidth",
        "cocoCustomHeight"
    ]
    .forEach(item => {

        const elements =
            item.startsWith(".")
                ? document.querySelectorAll(item)
                : [
                    document.getElementById(item)
                ];

        elements.forEach(
            element => {

                if (!element) {
                    return;
                }

                element.addEventListener(
                    "input",
                    updateCocoPreview
                );

                element.addEventListener(
                    "change",
                    updateCocoPreview
                );
            }
        );
    });


    /* ---------------------------------------------------------
       COCO LABEL PDF
    ---------------------------------------------------------- */

    function makeLabelPDF(
        labels,
        options
    ) {

        const pdf =
            new PDF({
                orientation:
                    getOrientation(
                        options.page
                    ),
                unit: "mm",
                format: [
                    options.page.width,
                    options.page.height
                ]
            });

        const labelsPerPage =
            Math.max(
                1,
                Number(
                    options.labelsPerPage
                ) || 1
            );

        const totalPages =
            Math.ceil(
                labels.length /
                labelsPerPage
            );

        for (
            let pageIndex = 0;
            pageIndex < totalPages;
            pageIndex++
        ) {

            if (
                pageIndex > 0
            ) {

                pdf.addPage(
                    [
                        options.page.width,
                        options.page.height
                    ],
                    getOrientation(
                        options.page
                    )
                );
            }

            drawBorder(
                pdf,
                options.page.width,
                options.page.height,
                options.border,
                options.borderStyle
            );

            drawTaxBorder(
                pdf,
                options.page.width,
                options.page.height,
                options.taxBorder
            );

            const current =
                labels.slice(
                    pageIndex *
                    labelsPerPage,
                    (
                        pageIndex + 1
                    ) *
                    labelsPerPage
                );

            /*
             * Vertical default.
             * One label below another.
             */

            const vertical =
                options.vertical !== false;

            if (vertical) {

                const cellHeight =
                    options.page.height /
                    current.length;

                current.forEach(
                    (item, index) => {

                        drawLabel(
                            pdf,
                            item,
                            {
                                x: 0,
                                y:
                                    index *
                                    cellHeight,
                                width:
                                    options.page.width,
                                height:
                                    cellHeight,
                                font:
                                    pdfFont(
                                        options.font
                                    ),
                                fontSize:
                                    options.fontSize,
                                cutting:
                                    options.cutting,
                                boxHighlight:
                                    options.boxHighlight
                            }
                        );
                    }
                );

            } else {

                const [rows, columns] =
                    getGrid(
                        current.length
                    );

                const cellWidth =
                    options.page.width /
                    columns;

                const cellHeight =
                    options.page.height /
                    rows;

                current.forEach(
                    (item, index) => {

                        const row =
                            Math.floor(
                                index /
                                columns
                            );

                        const col =
                            index %
                            columns;

                        drawLabel(
                            pdf,
                            item,
                            {
                                x:
                                    col *
                                    cellWidth,
                                y:
                                    row *
                                    cellHeight,
                                width:
                                    cellWidth,
                                height:
                                    cellHeight,
                                font:
                                    pdfFont(
                                        options.font
                                    ),
                                fontSize:
                                    options.fontSize,
                                cutting:
                                    options.cutting,
                                boxHighlight:
                                    options.boxHighlight
                            }
                        );
                    }
                );
            }
        }

        return pdf;
    }


    function drawLabel(
        pdf,
        item,
        options
    ) {

        const centerX =
            options.x +
            options.width /
            2;

        const centerY =
            options.y +
            options.height /
            2;


        /*
         * PO number only.
         */

        pdf.setTextColor(
            25,
            25,
            25
        );

        pdf.setFont(
            options.font,
            "bold"
        );

        pdf.setFontSize(
            Number(
                options.fontSize
            ) || 10
        );

        pdf.text(
            String(item.po),
            centerX,
            centerY - 15,
            {
                align: "center"
            }
        );


        /*
         * Dotted separator.
         */

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(
            8
        );

        const dots =
            ". . . . . . . . . .";


        pdf.text(
            dots,
            centerX,
            centerY - 5,
            {
                align: "center"
            }
        );


        /*
         * BOX NO. format.
         */

        pdf.setFont(
            options.font,
            "bold"
        );

        pdf.setFontSize(
            Math.max(
                12,
                Number(
                    options.fontSize
                ) + 4
            )
        );


        const boxText =
            `BOX NO. ${item.box}`;


        const boxWidth =
            Math.min(
                options.width - 12,
                Math.max(
                    35,
                    pdf.getTextWidth(
                        boxText
                    ) + 16
                )
            );


        const boxHeight =
            18;


        if (
            options.boxHighlight
        ) {

            pdf.setLineWidth(
                0.8
            );

            pdf.setDrawColor(
                25,
                25,
                25
            );

            pdf.rect(
                centerX -
                boxWidth / 2,

                centerY -

                boxHeight / 2 +

                7,

                boxWidth,

                boxHeight
            );
        }


        pdf.text(
            boxText,
            centerX,
            centerY + 13,
            {
                align: "center"
            }
        );


        /*
         * Cutting symbol.
         */

        if (
            options.cutting
        ) {

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(
                10
            );

            pdf.text(
                "✂",
                centerX,
                options.y +
                options.height -
                7,
                {
                    align: "center"
                }
            );
        }
    }


    /* ---------------------------------------------------------
       COCO GENERATE
    ---------------------------------------------------------- */

    document
        .getElementById(
            "cocoGenerate"
        )
        .addEventListener(
            "click",
            async () => {

                if (!requirePDF()) {
                    return;
                }

                const pos =
                    getCocoPOs();

                if (!pos.length) {

                    alert(
                        "Please enter at least one PO number."
                    );

                    return;
                }

                const start =
                    Number(
                        document.getElementById(
                            "cocoStartBox"
                        ).value
                    );

                const end =
                    Number(
                        document.getElementById(
                            "cocoEndBox"
                        ).value
                    );

                /*
                 * No 200 limit.
                 */

                if (
                    !Number.isFinite(start) ||
                    !Number.isFinite(end) ||
                    start < 0 ||
                    end < start
                ) {

                    alert(
                        "Please enter a valid box range."
                    );

                    return;
                }

                const page =
                    getPageSize(
                        cocoSize,
                        document.getElementById(
                            "cocoCustomWidth"
                        ).value,
                        document.getElementById(
                            "cocoCustomHeight"
                        ).value
                    );

                if (!page) {

                    alert(
                        "Please select a valid page size."
                    );

                    return;
                }

                const copies =
                    Number(
                        document.getElementById(
                            "cocoCopiesPerBox"
                        ).value
                    ) || 1;

                const labelsPerPage =
                    Number(
                        document.getElementById(
                            "cocoLabelsPerPage"
                        ).value
                    ) || 1;

                const options = {

                    page,

                    copies,

                    labelsPerPage,

                    vertical:
                        document.getElementById(
                            "cocoVertical"
                        ).checked,

                    cutting:
                        document.getElementById(
                            "cocoCutting"
                        ).checked,

                    boxHighlight:
                        document.getElementById(
                            "cocoBoxHighlight"
                        ).checked,

                    taxBorder:
                        document.getElementById(
                            "cocoTaxBorder"
                        ).checked,

                    border:
                        document.getElementById(
                            "cocoBorder"
                        ).checked,

                    borderStyle:
                        document.getElementById(
                            "cocoBorderStyle"
                        ).value,

                    font:
                        document.getElementById(
                            "cocoFont"
                        ).value,

                    fontSize:
                        document.getElementById(
                            "cocoFontSize"
                        ).value
                };


                const zipEnabled =
                    document.getElementById(
                        "cocoZip"
                    ).checked;


                const files = [];
                const time = timestamp();


                for (
                    const po of pos
                ) {

                    const labels = [];

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

                            labels.push({
                                po,
                                box,
                                copy
                            });
                        }
                    }


                    const pdf =
                        makeLabelPDF(
                            labels,
                            options
                        );


                    const filename =
                        `${safeName(
                            po
                        )}_BOX${start}-${end}_${time.date}_${time.time}.pdf`;


                    const blob =
                        pdf.output("blob");


                    files.push({
                        name: filename,
                        blob
                    });


                    /*
                     * Single PDF:
                     * direct download.
                     */

                    if (
                        pos.length === 1
                    ) {

                        downloadBlob(
                            blob,
                            filename
                        );

                    }
                }


                /*
                 * Multiple PO:
                 * ZIP only.
                 */

                if (
                    pos.length > 1
                ) {

                    await downloadZip(
                        files,
                        `BooksWagon_${time.date}_${time.time}.zip`
                    );

                }


                /*
                 * Multiple PO ZIP ON/OFF:
                 * User specifically requested ZIP when
                 * multiple PDFs are generated, so ZIP is
                 * automatically used.
                 */

                document.getElementById(
                    "cocoStatus"
                ).textContent =
                    pos.length > 1
                        ? `${pos.length} PO PDFs packed into ZIP.`
                        : "PDF downloaded successfully.";
            }
        );


    /* ---------------------------------------------------------
       COCO RESET
    ---------------------------------------------------------- */

    document
        .getElementById(
            "cocoReset"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".coco-po"
                    )
                    .forEach(
                        input =>
                            input.value = ""
                    );

                cocoExcelPOs = [];

                document.getElementById(
                    "cocoExcel"
                ).value = "";

                document.getElementById(
                    "cocoExcelStatus"
                ).textContent =
                    "No file selected";

                updateCocoPreview();
            }
        );


    /* ---------------------------------------------------------
       COCO MODE
    ---------------------------------------------------------- */

    document
        .querySelectorAll(
            "[data-cocoblue-mode]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-cocoblue-mode]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        const mode =
                            button.dataset.cocoblueMode;

                        document
                            .getElementById(
                                "cocoblueStickerMode"
                            )
                            .classList.toggle(
                                "hidden",
                                mode !== "sticker"
                            );

                        document
                            .getElementById(
                                "cocoblueAddressMode"
                            )
                            .classList.toggle(
                                "hidden",
                                mode !== "address"
                            );
                    }
                );
            }
        );


    /* =========================================================
       COCO ADDRESS
    ========================================================== */

    document
        .querySelectorAll(
            "[data-coco-address-size]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-coco-address-size]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        cocoAddressSize =
                            button.dataset.cocoAddressSize;

                        updateCocoAddress();
                    }
                );
            }
        );


    function updateCocoAddress() {

        const from =
            document.getElementById(
                "cocoFrom"
            ).value.trim();

        const to =
            document.getElementById(
                "cocoTo"
            ).value.trim();

        document.getElementById(
            "cocoFromPreview"
        ).textContent =
            from || "FROM";

        document.getElementById(
            "cocoToPreview"
        ).textContent =
            to || "TO";

        const preview =
            document.getElementById(
                "cocoAddressPreview"
            );

        preview.style.border =
            document.getElementById(
                "cocoAddressBorder"
            ).checked
                ? getBorderCSS(
                    document.getElementById(
                        "cocoAddressBorderStyle"
                    ).value
                )
                : "none";

        preview.style.fontFamily =
            document.getElementById(
                "cocoAddressFont"
            ).value;

        preview.style.fontSize =
            `${
                document.getElementById(
                    "cocoAddressFontSize"
                ).value
            }px`;
    }


    [
        "cocoFrom",
        "cocoTo",
        "cocoAddressBorder",
        "cocoAddressTaxBorder",
        "cocoAddressBorderStyle",
        "cocoAddressFont",
        "cocoAddressFontSize"
    ]
    .forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );

            if (!el) {
                return;
            }

            el.addEventListener(
                "input",
                updateCocoAddress
            );

            el.addEventListener(
                "change",
                updateCocoAddress
            );
        }
    );


    document
        .getElementById(
            "cocoAddressGenerate"
        )
        .addEventListener(
            "click",
            () => {

                if (!requirePDF()) {
                    return;
                }

                const from =
                    document.getElementById(
                        "cocoFrom"
                    ).value.trim();

                const to =
                    document.getElementById(
                        "cocoTo"
                    ).value.trim();

                if (
                    !from ||
                    !to
                ) {

                    alert(
                        "From Address and To Address are mandatory."
                    );

                    return;
                }

                const page =
                    getPageSize(
                        cocoAddressSize
                    );

                if (!page) {

                    alert(
                        "Invalid page size."
                    );

                    return;
                }

                const pdf =
                    new PDF({
                        orientation:
                            getOrientation(
                                page
                            ),
                        unit: "mm",
                        format: [
                            page.width,
                            page.height
                        ]
                    });

                drawBorder(
                    pdf,
                    page.width,
                    page.height,
                    document.getElementById(
                        "cocoAddressBorder"
                    ).checked,
                    document.getElementById(
                        "cocoAddressBorderStyle"
                    ).value
                );

                drawTaxBorder(
                    pdf,
                    page.width,
                    page.height,
                    document.getElementById(
                        "cocoAddressTaxBorder"
                    ).checked
                );

                pdf.setFont(
                    pdfFont(
                        document.getElementById(
                            "cocoAddressFont"
                        ).value
                    ),
                    "normal"
                );

                pdf.setFontSize(
                    Number(
                        document.getElementById(
                            "cocoAddressFontSize"
                        ).value
                    ) || 10
                );

                let y = 20;

                pdf.text(
                    "FROM",
                    10,
                    y
                );

                y += 7;

                const fromLines =
                    pdf.splitTextToSize(
                        from,
                        page.width - 20
                    );

                pdf.text(
                    fromLines,
                    10,
                    y
                );

                y +=
                    fromLines.length *
                    5 +
                    18;

                pdf.text(
                    "TO",
                    10,
                    y
                );

                y += 7;

                const toLines =
                    pdf.splitTextToSize(
                        to,
                        page.width - 20
                    );

                pdf.text(
                    toLines,
                    10,
                    y
                );

                downloadPDF(
                    pdf,
                    "CocoBlue_Address_Label.pdf"
                );

                document.getElementById(
                    "cocoAddressStatus"
                ).textContent =
                    "PDF generated successfully.";
            }
        );


    document
        .getElementById(
            "cocoAddressReset"
        )
        .addEventListener(
            "click",
            () => {

                document.getElementById(
                    "cocoFrom"
                ).value = "";

                document.getElementById(
                    "cocoTo"
                ).value = "";

                document.getElementById(
                    "cocoAddressBorder"
                ).checked = false;

                document.getElementById(
                    "cocoAddressTaxBorder"
                ).checked = false;

                updateCocoAddress();
            }
        );


    /* =========================================================
       OTHER PO
    ========================================================== */

    function getOtherPOs() {

        if (
            otherInputMode ===
            "excel"
        ) {
            return [...otherExcelPOs];
        }

        return Array.from(
            document.querySelectorAll(
                ".other-po"
            )
        )
        .map(
            input =>
                input.value.trim()
        )
        .filter(Boolean);
    }


    document
        .querySelectorAll(
            "[data-other-input]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-other-input]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        otherInputMode =
                            button.dataset.otherInput;

                        document
                            .getElementById(
                                "otherManualArea"
                            )
                            .classList.toggle(
                                "hidden",
                                otherInputMode !==
                                "manual"
                            );

                        document
                            .getElementById(
                                "otherExcelArea"
                            )
                            .classList.toggle(
                                "hidden",
                                otherInputMode !==
                                "excel"
                            );

                        updateOtherPreview();
                    }
                );
            }
        );


    document
        .getElementById(
            "otherExcel"
        )
        .addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files[0];

                if (!file) {
                    return;
                }

                if (!requireXLSX()) {
                    return;
                }

                try {

                    const buffer =
                        await file.arrayBuffer();

                    const workbook =
                        XLSX_LIB.read(
                            buffer,
                            {
                                type: "array"
                            }
                        );

                    const sheet =
                        workbook.Sheets[
                            workbook.SheetNames[0]
                        ];

                    const rows =
                        XLSX_LIB.utils.sheet_to_json(
                            sheet,
                            {
                                header: 1,
                                defval: ""
                            }
                        );

                    otherExcelPOs = [];

                    rows.forEach(
                        (row, index) => {

                            const value =
                                String(
                                    row?.[0] ||
                                    ""
                                ).trim();

                            if (!value) {
                                return;
                            }

                            if (
                                index === 0 &&
                                [
                                    "po",
                                    "po number",
                                    "po no",
                                    "po no.",
                                    "po_number"
                                ].includes(
                                    value.toLowerCase()
                                )
                            ) {
                                return;
                            }

                            otherExcelPOs.push(
                                value
                            );
                        }
                    );

                    otherExcelPOs =
                        [
                            ...new Set(
                                otherExcelPOs
                            )
                        ];

                    document.getElementById(
                        "otherExcelStatus"
                    ).textContent =
                        `${otherExcelPOs.length} PO(s) loaded`;

                    updateOtherPreview();

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to read Other PO Excel."
                    );
                }
            }
        );


    document
        .querySelectorAll(
            "[data-other-size]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-other-size]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        otherSize =
                            button.dataset.otherSize;

                        document
                            .getElementById(
                                "otherCustomSize"
                            )
                            .classList.toggle(
                                "hidden",
                                otherSize !==
                                "custom"
                            );

                        updateOtherPreview();
                    }
                );
            }
        );


    function updateOtherPreview() {

        const pos =
            getOtherPOs();

        const start =
            Number(
                document.getElementById(
                    "otherStartBox"
                ).value
            ) || 1;

        const end =
            Number(
                document.getElementById(
                    "otherEndBox"
                ).value
            ) || start;

        const previewPage =
            document.getElementById(
                "otherPreviewPage"
            );

        const preview =
            document.getElementById(
                "otherPreview"
            );

        const boxPreview =
            document.getElementById(
                "otherPreviewBox"
            );

        updatePagePreview(
            previewPage,
            otherSize,
            document.getElementById(
                "otherCustomWidth"
            ).value,
            document.getElementById(
                "otherCustomHeight"
            ).value
        );

        document.getElementById(
            "otherPreviewPO"
        ).textContent =
            pos[0] || "";

        boxPreview.textContent =
            `BOX NO. ${start}`;

        document.getElementById(
            "otherBoxSummary"
        ).textContent =
            `${start}–${end}`;

        const page =
            getPageSize(
                otherSize,
                document.getElementById(
                    "otherCustomWidth"
                ).value,
                document.getElementById(
                    "otherCustomHeight"
                ).value
            );

        if (page) {

            document.getElementById(
                "otherSizeSummary"
            ).textContent =
                page.label;
        }

        const highlight =
            document.getElementById(
                "otherBoxHighlight"
            ).checked;

        preview.style.border =
            highlight
                ? "2px solid #1c1c1a"
                : "none";

        boxPreview.style.border =
            highlight
                ? "2px solid #1c1c1a"
                : "none";

        document
            .querySelectorAll(
                "#otherPreview .preview-scissor"
            )
            .forEach(
                scissor => {

                    scissor.style.display =
                        document.getElementById(
                            "otherCutting"
                        ).checked
                            ? "inline-block"
                            : "none";
                }
            );
    }


    [
        ".other-po",
        "otherStartBox",
        "otherEndBox",
        "otherCopiesPerBox",
        "otherLabelsPerPage",
        "otherCustomWidth",
        "otherCustomHeight",
        "otherCutting",
        "otherBoxHighlight",
        "otherTaxBorder",
        "otherBorder",
        "otherBorderStyle",
        "otherFont",
        "otherFontSize"
    ]
    .forEach(item => {

        const elements =
            item.startsWith(".")
                ? document.querySelectorAll(item)
                : [
                    document.getElementById(item)
                ];

        elements.forEach(
            element => {

                if (!element) {
                    return;
                }

                element.addEventListener(
                    "input",
                    updateOtherPreview
                );

                element.addEventListener(
                    "change",
                    updateOtherPreview
                );
            }
        );
    });


    document
        .querySelectorAll(
            'input[name="otherLayout"]'
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    updateOtherPreview
                );
            }
        );


    function getOtherLabels(
        po
    ) {

        const start =
            Number(
                document.getElementById(
                    "otherStartBox"
                ).value
            ) || 1;

        const end =
            Number(
                document.getElementById(
                    "otherEndBox"
                ).value
            ) || start;

        const copies =
            Number(
                document.getElementById(
                    "otherCopiesPerBox"
                ).value
            ) || 1;

        const labels = [];

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

                labels.push({
                    po,
                    box,
                    copy
                });
            }
        }

        return labels;
    }


    document
        .getElementById(
            "otherGenerate"
        )
        .addEventListener(
            "click",
            async () => {

                if (!requirePDF()) {
                    return;
                }

                const pos =
                    getOtherPOs();

                if (!pos.length) {

                    alert(
                        "Please enter at least one PO number."
                    );

                    return;
                }

                const start =
                    Number(
                        document.getElementById(
                            "otherStartBox"
                        ).value
                    );

                const end =
                    Number(
                        document.getElementById(
                            "otherEndBox"
                        ).value
                    );

                if (
                    !Number.isFinite(start) ||
                    !Number.isFinite(end) ||
                    start < 0 ||
                    end < start
                ) {

                    alert(
                        "Please enter a valid box range."
                    );

                    return;
                }

                const page =
                    getPageSize(
                        otherSize,
                        document.getElementById(
                            "otherCustomWidth"
                        ).value,
                        document.getElementById(
                            "otherCustomHeight"
                        ).value
                    );

                if (!page) {

                    alert(
                        "Please select a valid page size."
                    );

                    return;
                }

                const options = {

                    page,

                    labelsPerPage:
                        Number(
                            document.getElementById(
                                "otherLabelsPerPage"
                            ).value
                        ) || 1,

                    vertical: true,

                    cutting:
                        document.getElementById(
                            "otherCutting"
                        ).checked,

                    boxHighlight:
                        document.getElementById(
                            "otherBoxHighlight"
                        ).checked,

                    taxBorder:
                        document.getElementById(
                            "otherTaxBorder"
                        ).checked,

                    border:
                        document.getElementById(
                            "otherBorder"
                        ).checked,

                    borderStyle:
                        document.getElementById(
                            "otherBorderStyle"
                        ).value,

                    font:
                        document.getElementById(
                            "otherFont"
                        ).value,

                    fontSize:
                        document.getElementById(
                            "otherFontSize"
                        ).value
                };

                const files = [];
                const time = timestamp();


                for (
                    const po of pos
                ) {

                    const labels =
                        getOtherLabels(
                            po
                        );

                    const pdf =
                        makeLabelPDF(
                            labels,
                            options
                        );

                    const filename =
                        `${safeName(
                            po
                        )}_BOX${start}-${end}_${time.date}_${time.time}.pdf`;

                    const blob =
                        pdf.output("blob");

                    files.push({
                        name: filename,
                        blob
                    });

                    if (
                        pos.length === 1
                    ) {

                        downloadBlob(
                            blob,
                            filename
                        );
                    }
                }


                if (
                    pos.length > 1
                ) {

                    await downloadZip(
                        files,
                        `BooksWagon_OtherPO_${time.date}_${time.time}.zip`
                    );
                }


                document.getElementById(
                    "otherStatus"
                ).textContent =
                    pos.length > 1
                        ? `${pos.length} PO PDFs packed into ZIP.`
                        : "PDF downloaded successfully.";
            }
        );


    document
        .getElementById(
            "otherReset"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".other-po"
                    )
                    .forEach(
                        input =>
                            input.value = ""
                    );

                otherExcelPOs = [];

                document.getElementById(
                    "otherExcel"
                ).value = "";

                document.getElementById(
                    "otherExcelStatus"
                ).textContent =
                    "No file selected";

                updateOtherPreview();
            }
        );


    /* =========================================================
       OTHER TABS
    ========================================================== */

    document
        .querySelectorAll(
            "[data-other-mode]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-other-mode]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        const mode =
                            button.dataset.otherMode;

                        document
                            .getElementById(
                                "otherStickerMode"
                            )
                            .classList.toggle(
                                "hidden",
                                mode !==
                                "sticker"
                            );

                        document
                            .getElementById(
                                "otherAddressMode"
                            )
                            .classList.toggle(
                                "hidden",
                                mode !==
                                "address"
                            );
                    }
                );
            }
        );


    /* =========================================================
       OTHER ADDRESS
    ========================================================== */

    document
        .querySelectorAll(
            "[data-other-address-size]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-other-address-size]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        otherAddressSize =
                            button.dataset.otherAddressSize;
                    }
                );
            }
        );


    function updateOtherAddress() {

        const from =
            document.getElementById(
                "otherFrom"
            ).value.trim();

        const to =
            document.getElementById(
                "otherTo"
            ).value.trim();

        document.getElementById(
            "otherFromPreview"
        ).textContent =
            from || "FROM";

        document.getElementById(
            "otherToPreview"
        ).textContent =
            to || "TO";

        document.getElementById(
            "otherAddressPreview"
        ).style.border =
            document.getElementById(
                "otherAddressBorder"
            ).checked
                ? getBorderCSS(
                    document.getElementById(
                        "otherAddressBorderStyle"
                    ).value
                )
                : "none";

        document.getElementById(
            "otherAddressPreview"
        ).style.fontFamily =
            document.getElementById(
                "otherAddressFont"
            ).value;

        document.getElementById(
            "otherAddressPreview"
        ).style.fontSize =
            `${
                document.getElementById(
                    "otherAddressFontSize"
                ).value
            }px`;
    }


    [
        "otherFrom",
        "otherTo",
        "otherAddressBorder",
        "otherAddressTaxBorder",
        "otherAddressBorderStyle",
        "otherAddressFont",
        "otherAddressFontSize"
    ]
    .forEach(
        id => {

            const el =
                document.getElementById(id);

            if (!el) {
                return;
            }

            el.addEventListener(
                "input",
                updateOtherAddress
            );

            el.addEventListener(
                "change",
                updateOtherAddress
            );
        }
    );


    document
        .getElementById(
            "otherAddressGenerate"
        )
        .addEventListener(
            "click",
            () => {

                if (!requirePDF()) {
                    return;
                }

                const from =
                    document.getElementById(
                        "otherFrom"
                    ).value.trim();

                const to =
                    document.getElementById(
                        "otherTo"
                    ).value.trim();

                if (
                    !from ||
                    !to
                ) {

                    alert(
                        "From Address and To Address are mandatory."
                    );

                    return;
                }

                const page =
                    getPageSize(
                        otherAddressSize
                    );

                if (!page) {
                    alert(
                        "Invalid page size."
                    );
                    return;
                }

                const pdf =
                    new PDF({
                        orientation:
                            getOrientation(
                                page
                            ),
                        unit: "mm",
                        format: [
                            page.width,
                            page.height
                        ]
                    });

                drawBorder(
                    pdf,
                    page.width,
                    page.height,
                    document.getElementById(
                        "otherAddressBorder"
                    ).checked,
                    document.getElementById(
                        "otherAddressBorderStyle"
                    ).value
                );

                drawTaxBorder(
                    pdf,
                    page.width,
                    page.height,
                    document.getElementById(
                        "otherAddressTaxBorder"
                    ).checked
                );

                pdf.setFont(
                    pdfFont(
                        document.getElementById(
                            "otherAddressFont"
                        ).value
                    ),
                    "normal"
                );

                pdf.setFontSize(
                    Number(
                        document.getElementById(
                            "otherAddressFontSize"
                        ).value
                    ) || 10
                );

                let y = 20;

                pdf.text(
                    "FROM",
                    10,
                    y
                );

                y += 7;

                const fromLines =
                    pdf.splitTextToSize(
                        from,
                        page.width - 20
                    );

                pdf.text(
                    fromLines,
                    10,
                    y
                );

                y +=
                    fromLines.length *
                    5 +
                    18;

                pdf.text(
                    "TO",
                    10,
                    y
                );

                y += 7;

                const toLines =
                    pdf.splitTextToSize(
                        to,
                        page.width - 20
                    );

                pdf.text(
                    toLines,
                    10,
                    y
                );

                downloadPDF(
                    pdf,
                    "Other_PO_Address_Label.pdf"
                );

                document.getElementById(
                    "otherAddressStatus"
                ).textContent =
                    "PDF generated successfully.";
            }
        );


    document
        .getElementById(
            "otherAddressReset"
        )
        .addEventListener(
            "click",
            () => {

                document.getElementById(
                    "otherFrom"
                ).value = "";

                document.getElementById(
                    "otherTo"
                ).value = "";

                document.getElementById(
                    "otherAddressBorder"
                ).checked = false;

                document.getElementById(
                    "otherAddressTaxBorder"
                ).checked = false;

                updateOtherAddress();
            }
        );


    /* =========================================================
       ISBN
    ========================================================== */

    document
        .querySelectorAll(
            "[data-isbn-input]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-isbn-input]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        isbnInputMode =
                            button.dataset.isbnInput;

                        document
                            .getElementById(
                                "isbnManualCard"
                            )
                            .classList.toggle(
                                "hidden",
                                isbnInputMode !==
                                "manual"
                            );

                        document
                            .getElementById(
                                "isbnExcelCard"
                            )
                            .classList.toggle(
                                "hidden",
                                isbnInputMode !==
                                "excel"
                            );

                        updateISBNPreview();
                    }
                );
            }
        );


    document
        .querySelectorAll(
            "[data-isbn-size]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-isbn-size]"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        isbnSize =
                            button.dataset.isbnSize;
                    }
                );
            }
        );


    /* ---------------------------------------------------------
       ISBN VALIDATION
    ---------------------------------------------------------- */

    function cleanISBN(value) {

        return String(
            value || ""
        )
        .trim()
        .replace(
            /[\s-]/g,
            ""
        )
        .replace(
            /[^0-9Xx]/g,
            ""
        );
    }


    function validISBN10(isbn) {

        if (
            !/^[0-9]{9}[0-9Xx]$/.test(
                isbn
            )
        ) {
            return false;
        }

        let sum = 0;

        for (
            let i = 0;
            i < 9;
            i++
        ) {

            sum +=
                Number(
                    isbn[i]
                ) *
                (
                    10 - i
                );
        }

        const last =
            isbn[9].toUpperCase() === "X"
                ? 10
                : Number(
                    isbn[9]
                );

        sum += last;

        return (
            sum % 11 === 0
        );
    }


    function validISBN13(isbn) {

        if (
            !/^\d{13}$/.test(
                isbn
            )
        ) {
            return false;
        }

        let sum = 0;

        for (
            let i = 0;
            i < 12;
            i++
        ) {

            sum +=
                Number(
                    isbn[i]
                ) *
                (
                    i % 2 === 0
                        ? 1
                        : 3
                );
        }

        const check =
            (
                10 -
                (
                    sum % 10
                )
            ) %
            10;

        return (
            check ===
            Number(
                isbn[12]
            )
        );
    }


    function convertISBN10To13(isbn) {

        const base =
            "978" +
            isbn.substring(0, 9);

        let sum = 0;

        for (
            let i = 0;
            i < 12;
            i++
        ) {

            sum +=
                Number(
                    base[i]
                ) *
                (
                    i % 2 === 0
                        ? 1
                        : 3
                );
        }

        const check =
            (
                10 -
                (
                    sum % 10
                )
            ) %
            10;

        return (
            base +
            String(check)
        );
    }


    function normalizeISBN13(raw) {

        const isbn =
            cleanISBN(raw);

        if (
            isbn.length === 13
        ) {

            return validISBN13(isbn)
                ? isbn
                : null;
        }

        if (
            isbn.length === 10
        ) {

            if (
                !validISBN10(isbn)
            ) {
                return null;
            }

            return convertISBN10To13(
                isbn
            );
        }

        return null;
    }


    /* ---------------------------------------------------------
       ISBN TABLES
    ---------------------------------------------------------- */

    const L = {
        0: "0001101",
        1: "0011001",
        2: "0010011",
        3: "0111101",
        4: "0100011",
        5: "0110001",
        6: "0101111",
        7: "0111011",
        8: "0110111",
        9: "0001011"
    };


    const G = {
        0: "0100111",
        1: "0110011",
        2: "0011011",
        3: "0100001",
        4: "0011101",
        5: "0111001",
        6: "0000101",
        7: "0010001",
        8: "0001001",
        9: "0010111"
    };


    const R = {
        0: "1110010",
        1: "1100110",
        2: "1101100",
        3: "1000010",
        4: "1011100",
        5: "1001110",
        6: "1010000",
        7: "1000100",
        8: "1001000",
        9: "1110100"
    };


    const PARITY = {
        0: "LLLLLL",
        1: "LLGLGG",
        2: "LLGGLG",
        3: "LLGGGL",
        4: "LGLLGG",
        5: "LGGLLG",
        6: "LGGGLL",
        7: "LGLGLG",
        8: "LGLGGL",
        9: "LGGLGL"
    };


    function ean13Pattern(isbn) {

        let result = "101";

        const pattern =
            PARITY[
                Number(
                    isbn[0]
                )
            ];

        for (
            let i = 1;
            i <= 6;
            i++
        ) {

            const digit =
                Number(
                    isbn[i]
                );

            result +=
                pattern[i - 1] === "L"
                    ? L[digit]
                    : G[digit];
        }

        result += "01010";

        for (
            let i = 7;
            i <= 12;
            i++
        ) {

            result +=
                R[
                    Number(
                        isbn[i]
                    )
                ];
        }

        result += "101";

        return result;
    }


    function drawBarcode(
        pdf,
        isbn,
        x,
        y,
        width,
        height
    ) {

        const pattern =
            ean13Pattern(
                isbn
            );

        const moduleWidth =
            width /
            pattern.length;

        pdf.setFillColor(
            0,
            0,
            0
        );

        for (
            let i = 0;
            i < pattern.length;
            i++
        ) {

            if (
                pattern[i] === "1"
            ) {

                pdf.rect(
                    x +
                    i *
                    moduleWidth,
                    y,
                    moduleWidth + .01,
                    height,
                    "F"
                );
            }
        }
    }


    /* ---------------------------------------------------------
       ISBN DATA
    ---------------------------------------------------------- */

    function getISBNRows() {

        if (
            isbnInputMode ===
            "excel"
        ) {
            return [...isbnRows];
        }

        const isbn =
            document.querySelectorAll(
                ".isbn-manual"
            );

        const title =
            document.querySelectorAll(
                ".title-manual"
            );

        const edition =
            document.querySelectorAll(
                ".edition-manual"
            );

        const rows = [];

        isbn.forEach(
            (
                input,
                index
            ) => {

                const isbnValue =
                    input.value.trim();

                const titleValue =
                    title[index]
                        .value
                        .trim();

                const editionValue =
                    edition[index]
                        .value
                        .trim();

                if (
                    isbnValue ||
                    titleValue ||
                    editionValue
                ) {

                    rows.push({

                        isbn:
                            isbnValue,

                        title:
                            titleValue,

                        edition:
                            editionValue ||
                            "N"
                    });
                }
            }
        );

        return rows;
    }


    /* ---------------------------------------------------------
       ISBN EXCEL
    ---------------------------------------------------------- */

    document
        .getElementById(
            "isbnExcel"
        )
        .addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files[0];

                if (!file) {
                    return;
                }

                if (!requireXLSX()) {
                    return;
                }

                try {

                    const buffer =
                        await file.arrayBuffer();

                    const workbook =
                        XLSX_LIB.read(
                            buffer,
                            {
                                type: "array"
                            }
                        );

                    const sheet =
                        workbook.Sheets[
                            workbook.SheetNames[0]
                        ];

                    const rows =
                        XLSX_LIB.utils.sheet_to_json(
                            sheet,
                            {
                                header: 1,
                                defval: ""
                            }
                        );

                    isbnRows = [];

                    rows.forEach(
                        (
                            row,
                            index
                        ) => {

                            const isbn =
                                String(
                                    row?.[0] ||
                                    ""
                                ).trim();

                            const title =
                                String(
                                    row?.[1] ||
                                    ""
                                ).trim();

                            const edition =
                                String(
                                    row?.[2] ||
                                    ""
                                ).trim();

                            if (
                                index === 0 &&
                                (
                                    isbn.toLowerCase() ===
                                    "isbn" ||
                                    title.toLowerCase() ===
                                    "book name"
                                )
                            ) {
                                return;
                            }

                            if (
                                !isbn &&
                                !title
                            ) {
                                return;
                            }

                            isbnRows.push({

                                isbn,

                                title,

                                edition:
                                    edition ||
                                    "N"
                            });
                        }
                    );

                    document.getElementById(
                        "isbnExcelStatus"
                    ).textContent =
                        `${isbnRows.length} row(s) loaded`;

                    updateISBNPreview();

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to read ISBN Excel file."
                    );
                }
            }
        );


    /* ---------------------------------------------------------
       ISBN PREVIEW
    ---------------------------------------------------------- */

    function updateISBNPreview() {

        const rows =
            getISBNRows();

        const num =
            document.getElementById(
                "isbnPreviewNumber"
            );

        const title =
            document.getElementById(
                "isbnPreviewTitle"
            );

        const edition =
            document.getElementById(
                "isbnPreviewEdition"
            );

        const barcode =
            document.getElementById(
                "isbnBarcode"
            );


        if (!rows.length) {

            num.textContent =
                "9780000000000";

            title.textContent =
                "Book Title";

            edition.textContent =
                "N";

            barcode.innerHTML =
                "";

            return;
        }


        const row =
            rows[0];

        const isbn13 =
            normalizeISBN13(
                row.isbn
            );

        num.textContent =
            isbn13 ||
            row.isbn;

        title.textContent =
            row.title ||
            "";

        edition.textContent =
            row.edition ||
            "N";

        barcode.innerHTML =
            "";

        if (isbn13) {

            const pattern =
                ean13Pattern(
                    isbn13
                );

            pattern
                .split("")
                .forEach(
                    bit => {

                        const bar =
                            document.createElement(
                                "span"
                            );

                        bar.className =
                            "isbn-bar";

                        bar.style.width =
                            `${
                                100 /
                                pattern.length
                            }%`;

                        bar.style.background =
                            bit === "1"
                                ? "#000"
                                : "transparent";

                        barcode.appendChild(
                            bar
                        );
                    }
                );
        }
    }


    document
        .querySelectorAll(
            ".isbn-manual," +
            ".title-manual," +
            ".edition-manual"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    updateISBNPreview
                );
            }
        );


    /* ---------------------------------------------------------
       ISBN PDF
    ---------------------------------------------------------- */

    document
        .getElementById(
            "isbnGenerate"
        )
        .addEventListener(
            "click",
            () => {

                if (!requirePDF()) {
                    return;
                }

                const rows =
                    getISBNRows();

                if (!rows.length) {

                    alert(
                        "Please enter ISBN and Book Name."
                    );

                    return;
                }

                const validRows = [];

                for (
                    const row of rows
                ) {

                    if (!row.isbn) {

                        alert(
                            "ISBN is mandatory."
                        );

                        return;
                    }

                    if (!row.title) {

                        alert(
                            "Book Name is mandatory."
                        );

                        return;
                    }

                    const isbn13 =
                        normalizeISBN13(
                            row.isbn
                        );

                    if (!isbn13) {

                        alert(
                            `Invalid ISBN: ${row.isbn}\n\n` +
                            "Spaces and hyphens are accepted, " +
                            "but the ISBN check digit must be valid."
                        );

                        return;
                    }

                    validRows.push({

                        isbn:
                            isbn13,

                        title:
                            row.title,

                        edition:
                            row.edition ||
                            "N"
                    });
                }


                const page =
                    getPageSize(
                        isbnSize
                    );


                const labelsPerPage =
                    Number(
                        document.getElementById(
                            "isbnLabelsPerPage"
                        ).value
                    ) || 1;


                const pdf =
                    new PDF({

                        orientation:
                            getOrientation(
                                page
                            ),

                        unit:
                            "mm",

                        format:
                            [
                                page.width,
                                page.height
                            ]
                    });


                const font =
                    pdfFont(
                        document.getElementById(
                            "isbnFont"
                        ).value
                    );


                const fontSize =
                    Number(
                        document.getElementById(
                            "isbnFontSize"
                        ).value
                    ) || 10;


                for (
                    let start = 0;
                    start <
                    validRows.length;
                    start +=
                        labelsPerPage
                ) {

                    const current =
                        validRows.slice(
                            start,
                            start +
                            labelsPerPage
                        );


                    if (
                        start > 0
                    ) {

                        pdf.addPage(
                            [
                                page.width,
                                page.height
                            ],
                            getOrientation(
                                page
                            )
                        );
                    }


                    drawBorder(
                        pdf,
                        page.width,
                        page.height,
                        document.getElementById(
                            "isbnBorder"
                        ).checked,
                        document.getElementById(
                            "isbnBorderStyle"
                        ).value
                    );


                    drawTaxBorder(
                        pdf,
                        page.width,
                        page.height,
                        document.getElementById(
                            "isbnTaxBorder"
                        ).checked
                    );


                    const [
                        rowsGrid,
                        colsGrid
                    ] =
                        getGrid(
                            current.length
                        );


                    const cellW =
                        page.width /
                        colsGrid;


                    const cellH =
                        page.height /
                        rowsGrid;


                    current.forEach(
                        (
                            row,
                            index
                        ) => {

                            const r =
                                Math.floor(
                                    index /
                                    colsGrid
                                );

                            const c =
                                index %
                                colsGrid;

                            const x =
                                c *
                                cellW;

                            const y =
                                r *
                                cellH;


                            const barcodeW =
                                Math.min(
                                    55,
                                    cellW - 12
                                );


                            const barcodeH =
                                Math.min(
                                    30,
                                    cellH * .28
                                );


                            drawBarcode(
                                pdf,
                                row.isbn,
                                x +
                                (
                                    cellW -
                                    barcodeW
                                ) / 2,
                                y + 8,
                                barcodeW,
                                barcodeH
                            );


                            pdf.setFont(
                                "helvetica",
                                "normal"
                            );

                            pdf.setFontSize(
                                Math.min(
                                    11,
                                    fontSize
                                )
                            );

                            pdf.text(
                                row.isbn,
                                x +
                                cellW /
                                2,
                                y +
                                barcodeH +
                                14,
                                {
                                    align:
                                        "center"
                                }
                            );


                            pdf.setFont(
                                font,
                                "bold"
                            );

                            pdf.setFontSize(
                                Math.min(
                                    13,
                                    fontSize
                                )
                            );


                            const titleLines =
                                pdf.splitTextToSize(
                                    row.title,
                                    cellW - 12
                                );


                            pdf.text(
                                titleLines,
                                x +
                                cellW /
                                2,
                                y +
                                barcodeH +
                                21,
                                {
                                    align:
                                        "center"
                                }
                            );


                            pdf.setFont(
                                font,
                                "normal"
                            );

                            pdf.setFontSize(
                                10
                            );

                            pdf.text(
                                `Edition: ${
                                    row.edition ||
                                    "N"
                                }`,
                                x +
                                cellW /
                                2,
                                y +
                                cellH -
                                8,
                                {
                                    align:
                                        "center"
                                }
                            );

                        }
                    );
                }


                downloadPDF(
                    pdf,
                    "BooksWagon_ISBN_Barcodes.pdf"
                );


                document.getElementById(
                    "isbnStatus"
                ).textContent =
                    `${validRows.length} barcode label(s) generated.`;
            }
        );


    /* ---------------------------------------------------------
       ISBN RESET
    ---------------------------------------------------------- */

    document
        .getElementById(
            "isbnReset"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".isbn-manual"
                    )
                    .forEach(
                        input =>
                            input.value = ""
                    );

                document
                    .querySelectorAll(
                        ".title-manual"
                    )
                    .forEach(
                        input =>
                            input.value = ""
                    );

                document
                    .querySelectorAll(
                        ".edition-manual"
                    )
                    .forEach(
                        input =>
                            input.value = ""
                    );

                isbnRows = [];

                document.getElementById(
                    "isbnExcel"
                ).value = "";

                document.getElementById(
                    "isbnExcelStatus"
                ).textContent =
                    "No file selected";

                updateISBNPreview();
            }
        );


    /* =========================================================
       INITIAL
    ========================================================== */

    updateCocoPreview();
    updateCocoAddress();
    updateOtherPreview();
    updateOtherAddress();
    updateISBNPreview();


    console.log(
        "BooksWagon Label Studio loaded successfully."
    );

});
