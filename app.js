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
       BASIC HELPERS
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


    function getTimestamp() {
        const now = new Date();

        return {
            date:
                `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,

            time:
                `${pad2(now.getHours())}-${pad2(now.getMinutes())}-${pad2(now.getSeconds())}`
        };
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
        }, 1500);
    }


    async function downloadZIP(files, filename) {

        if (!ZIP) {
            alert(
                "ZIP library load nahi hui.\n\n" +
                "Please refresh the page."
            );
            return false;
        }

        const zip = new ZIP();

        files.forEach(file => {
            zip.file(file.name, file.blob);
        });

        const blob =
            await zip.generateAsync({
                type: "blob"
            });

        downloadBlob(blob, filename);

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
                label:
                    `${width} × ${height} mm`
            };
        }

        return null;
    }


    function getOrientation(page) {
        return page.width > page.height
            ? "landscape"
            : "portrait";
    }


    function getPDFSpaceFont(font) {

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


    /* =========================================================
       BORDER
    ========================================================== */

    const borderCSS = {

        "solid-dark":
            "3px solid #111827",

        "solid-medium":
            "2px solid #667085",

        "solid-light":
            "1px solid #98A2B3",

        "double":
            "4px double #344054",

        "dashed":
            "2px dashed #667085",

        "dotted":
            "2px dotted #667085",

        "bold":
            "5px solid #111827",

        "double-dark":
            "5px double #111827",

        "inner":
            "2px inset #475467",

        "outer":
            "4px outset #475467",

        "triple":
            "6px double #111827",

        "text-box":
            "2px solid #1D2939"
    };


    function getBorderCSS(style) {
        return (
            borderCSS[style] ||
            borderCSS["solid-dark"]
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


        const styles = {

            "solid-dark":
                [0.8, 20],

            "solid-medium":
                [0.5, 70],

            "solid-light":
                [0.25, 150],

            "double":
                [0.5, 55],

            "dashed":
                [0.4, 80],

            "dotted":
                [0.4, 80],

            "bold":
                [1.4, 10],

            "double-dark":
                [1, 15],

            "inner":
                [0.5, 50],

            "outer":
                [1, 50],

            "triple":
                [0.6, 30],

            "text-box":
                [0.7, 30]
        };


        const config =
            styles[style] ||
            styles["solid-dark"];


        pdf.setDrawColor(
            config[1],
            config[1],
            config[1]
        );

        pdf.setLineWidth(
            config[0]
        );


        if (style === "dashed") {
            pdf.setLineDashPattern(
                [2, 2],
                0
            );
        }


        if (style === "dotted") {
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
            style === "double" ||
            style === "double-dark"
        ) {

            pdf.setLineDashPattern([], 0);
            pdf.setLineWidth(0.3);

            pdf.rect(
                6,
                6,
                width - 12,
                height - 12
            );
        }


        if (style === "triple") {

            pdf.setLineDashPattern([], 0);
            pdf.setLineWidth(0.25);

            pdf.rect(
                7,
                7,
                width - 14,
                height - 14
            );
        }


        if (style === "inner") {

            pdf.setLineDashPattern([], 0);
            pdf.setLineWidth(0.35);

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

        pdf.setLineWidth(
            0.35
        );

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


    /* =========================================================
       PAGE PREVIEW
    ========================================================== */

    function updatePagePreview(
        element,
        size,
        customWidth,
        customHeight
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
            `size-${size}`
        );


        const page =
            getPageSize(
                size,
                customWidth,
                customHeight
            );


        if (!page) {
            return;
        }


        const ratio =
            page.width /
            page.height;


        let height = 435;
        let width = height * ratio;


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
       TOOL NAVIGATION
    ========================================================== */

    function hideAllWorkspaces() {

        document
            .querySelectorAll(
                ".tool-workspace"
            )
            .forEach(
                workspace => {
                    workspace.style.display =
                        "none";
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

                        hideAllWorkspaces();

                        let targetId = "";

                        if (
                            button.dataset.openTool ===
                            "cocoblue"
                        ) {
                            targetId =
                                "cocoblueWorkspace";
                        }

                        if (
                            button.dataset.openTool ===
                            "otherpo"
                        ) {
                            targetId =
                                "otherpoWorkspace";
                        }

                        if (
                            button.dataset.openTool ===
                            "isbn"
                        ) {
                            targetId =
                                "isbnWorkspace";
                        }


                        const target =
                            document.getElementById(
                                targetId
                            );


                        if (!target) {
                            return;
                        }


                        target.style.display =
                            "block";


                        target.scrollIntoView({
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

                        hideAllWorkspaces();

                        document
                            .getElementById("tools")
                            ?.scrollIntoView({
                                behavior:
                                    "smooth"
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
            document.querySelectorAll(
                ".coco-po"
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


    /* ---------------------------------------------------------
       COCO EXCEL
    ---------------------------------------------------------- */

    document
        .getElementById(
            "cocoExcel"
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
                                    "po_number",
                                    "purchase order"
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
                        [
                            ...new Set(
                                cocoExcelPOs
                            )
                        ];

                    document.getElementById(
                        "cocoExcelStatus"
                    ).textContent =
                        `${cocoExcelPOs.length} PO(s) loaded`;

                    updateCocoPreview();

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to read PO Excel file."
                    );
                }
            }
        );


    /* ---------------------------------------------------------
       COCO SIZE
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


        const previewPage =
            document.getElementById(
                "cocoPreviewPage"
            );

        const previewLabel =
            document.getElementById(
                "cocoPreviewLabel"
            );

        const previewBox =
            document.getElementById(
                "cocoPreviewBox"
            );


        updatePagePreview(
            previewPage,
            cocoSize,
            document.getElementById(
                "cocoCustomWidth"
            ).value,
            document.getElementById(
                "cocoCustomHeight"
            ).value
        );


        document.getElementById(
            "cocoPreviewPO"
        ).textContent =
            pos[0] || "";


        /*
         * Required exact display:
         * BOX NO. 1
         */

        previewBox.textContent =
            `BOX NO. ${start}`;


        const highlight =
            document.getElementById(
                "cocoBoxHighlight"
            ).checked;


        previewBox.style.border =
            highlight
                ? "2px solid #111827"
                : "0";


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


        document.getElementById(
            "cocoPreviewScissor"
        ).style.display =
            document.getElementById(
                "cocoCutting"
            ).checked
                ? "inline-block"
                : "none";


        previewLabel.style.border =
            document.getElementById(
                "cocoBorder"
            ).checked
                ? getBorderCSS(
                    document.getElementById(
                        "cocoBorderStyle"
                    ).value
                )
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
    .forEach(
        item => {

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
        }
    );


    /* ---------------------------------------------------------
       LABEL PDF
    ---------------------------------------------------------- */

    function drawBoxLabel(
        pdf,
        item,
        options
    ) {

        const centerX =
            options.x +
            options.width / 2;

        const centerY =
            options.y +
            options.height / 2;


        pdf.setTextColor(
            16,
            24,
            40
        );


        pdf.setFont(
            options.font,
            "bold"
        );

        pdf.setFontSize(
            options.fontSize
        );


        /*
         * PO number ONLY.
         * No "PO" prefix.
         */

        pdf.text(
            String(item.po),
            centerX,
            centerY - 15,
            {
                align: "center"
            }
        );


        /*
         * Mandatory dotted divider.
         */

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(
            8
        );


        pdf.text(
            ". . . . . . . . . . . .",
            centerX,
            centerY - 5,
            {
                align: "center"
            }
        );


        /*
         * BOX NO. exact format.
         */

        const boxText =
            `BOX NO. ${item.box}`;


        pdf.setFont(
            options.font,
            "bold"
        );

        pdf.setFontSize(
            Math.max(
                12,
                options.fontSize + 4
            )
        );


        const boxWidth =
            Math.min(
                options.width - 12,
                Math.max(
                    42,
                    pdf.getTextWidth(
                        boxText
                    ) + 18
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
                17,
                24,
                39
            );

            pdf.rect(
                centerX -
                boxWidth / 2,

                centerY + 2,

                boxWidth,

                boxHeight
            );
        }


        pdf.text(
            boxText,
            centerX,
            centerY + 14,
            {
                align: "center"
            }
        );


        /*
         * Cutting icon.
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
                6,
                {
                    align: "center"
                }
            );
        }
    }


    function createPOPDF(
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


        const perPage =
            Math.max(
                1,
                Number(
                    options.labelsPerPage
                ) || 1
            );


        const totalPages =
            Math.ceil(
                labels.length /
                perPage
            );


        for (
            let pageIndex = 0;
            pageIndex < totalPages;
            pageIndex++
        ) {

            if (pageIndex > 0) {

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


            const pageLabels =
                labels.slice(
                    pageIndex * perPage,
                    (pageIndex + 1) * perPage
                );


            /*
             * Vertical layout:
             * label 1 top
             * label 2 below
             * label 3 below
             */

            if (
                options.vertical
            ) {

                const cellHeight =
                    options.page.height /
                    pageLabels.length;


                pageLabels.forEach(
                    (
                        item,
                        index
                    ) => {

                        drawBoxLabel(
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
                                    getPDFSpaceFont(
                                        options.font
                                    ),

                                fontSize:
                                    Number(
                                        options.fontSize
                                    ) || 10,

                                cutting:
                                    options.cutting,

                                boxHighlight:
                                    options.boxHighlight
                            }
                        );
                    }
                );


            } else {

                const [
                    rows,
                    columns
                ] =
                    getGrid(
                        pageLabels.length
                    );


                const cellWidth =
                    options.page.width /
                    columns;

                const cellHeight =
                    options.page.height /
                    rows;


                pageLabels.forEach(
                    (
                        item,
                        index
                    ) => {

                        const row =
                            Math.floor(
                                index /
                                columns
                            );

                        const column =
                            index %
                            columns;


                        drawBoxLabel(
                            pdf,
                            item,
                            {
                                x:
                                    column *
                                    cellWidth,

                                y:
                                    row *
                                    cellHeight,

                                width:
                                    cellWidth,

                                height:
                                    cellHeight,

                                font:
                                    getPDFSpaceFont(
                                        options.font
                                    ),

                                fontSize:
                                    Number(
                                        options.fontSize
                                    ) || 10,

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


    /* ---------------------------------------------------------
       COCO GENERATE
       IMPORTANT:
       THERE IS NO 200 LIMIT ANYWHERE.
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
                 * NO MAX 200.
                 *
                 * Only actual validity check:
                 * numbers + start <= end.
                 */

                if (
                    !Number.isFinite(start) ||
                    !Number.isFinite(end)
                ) {

                    alert(
                        "Please enter valid numeric box numbers."
                    );

                    return;
                }


                if (
                    start < 1
                ) {

                    alert(
                        "Start Box must be 1 or greater."
                    );

                    return;
                }


                if (
                    end < start
                ) {

                    alert(
                        "End Box must be greater than or equal to Start Box."
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


                const files = [];
                const stamp =
                    getTimestamp();


                /*
                 * EACH PO GETS ITS OWN PDF.
                 */

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
                        createPOPDF(
                            labels,
                            options
                        );


                    const filename =
                        `${safeName(
                            po
                        )}_BOX${start}-${end}_${stamp.date}_${stamp.time}.pdf`;


                    const blob =
                        pdf.output("blob");


                    files.push({
                        name:
                            filename,

                        blob
                    });
                }


                /*
                 * SINGLE PO = DIRECT PDF
                 * MULTIPLE PO = AUTOMATIC ZIP
                 */

                if (
                    files.length === 1
                ) {

                    downloadBlob(
                        files[0].blob,
                        files[0].name
                    );


                    document.getElementById(
                        "cocoStatus"
                    ).textContent =
                        "PDF downloaded successfully.";

                } else {

                    await downloadZIP(
                        files,
                        `BooksWagon_CocoBlue_${stamp.date}_${stamp.time}.zip`
                    );


                    document.getElementById(
                        "cocoStatus"
                    ).textContent =
                        `${files.length} separate PO PDFs packed into ZIP.`;
                }
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
                        input => {
                            input.value = "";
                        }
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


    /* =========================================================
       COCO MODE
    ========================================================== */

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

            const element =
                document.getElementById(id);

            if (!element) {
                return;
            }

            element.addEventListener(
                "input",
                updateCocoAddress
            );

            element.addEventListener(
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

                        unit:
                            "mm",

                        format:
                            [
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
                    getPDFSpaceFont(
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
                    fromLines.length * 5 +
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


                downloadBlob(
                    pdf.output("blob"),
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
            otherInputMode === "excel"
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
                                type:
                                    "array"
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


    /* ---------------------------------------------------------
       OTHER SIZE
    ---------------------------------------------------------- */

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


        updatePagePreview(
            document.getElementById(
                "otherPreviewPage"
            ),
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


        document.getElementById(
            "otherPreviewBox"
        ).textContent =
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


        document.getElementById(
            "otherPreviewBox"
        ).style.border =
            highlight
                ? "2px solid #111827"
                : "0";


        document.querySelector(
            "#otherPreview .preview-scissor"
        ).style.display =
            document.getElementById(
                "otherCutting"
            ).checked
                ? "inline-block"
                : "none";
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
    .forEach(
        item => {

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
        }
    );


    function getOtherLabels(po) {

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


    /* ---------------------------------------------------------
       OTHER GENERATE
    ---------------------------------------------------------- */

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


                /*
                 * NO 200 LIMIT.
                 */

                if (
                    !Number.isFinite(start) ||
                    !Number.isFinite(end)
                ) {

                    alert(
                        "Please enter valid numeric box numbers."
                    );

                    return;
                }


                if (
                    start < 1
                ) {

                    alert(
                        "Start Box must be 1 or greater."
                    );

                    return;
                }


                if (
                    end < start
                ) {

                    alert(
                        "End Box must be greater than or equal to Start Box."
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

                    vertical:
                        true,

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
                const stamp =
                    getTimestamp();


                for (
                    const po of pos
                ) {

                    const labels =
                        getOtherLabels(po);


                    const pdf =
                        createPOPDF(
                            labels,
                            options
                        );


                    const filename =
                        `${safeName(
                            po
                        )}_BOX${start}-${end}_${stamp.date}_${stamp.time}.pdf`;


                    files.push({

                        name:
                            filename,

                        blob:
                            pdf.output("blob")
                    });
                }


                /*
                 * SINGLE PO:
                 * direct PDF
                 *
                 * MULTIPLE PO:
                 * automatic ZIP
                 */

                if (
                    files.length === 1
                ) {

                    downloadBlob(
                        files[0].blob,
                        files[0].name
                    );


                    document.getElementById(
                        "otherStatus"
                    ).textContent =
                        "PDF downloaded successfully.";

                } else {

                    await downloadZIP(
                        files,
                        `BooksWagon_OtherPO_${stamp.date}_${stamp.time}.zip`
                    );


                    document.getElementById(
                        "otherStatus"
                    ).textContent =
                        `${files.length} separate PO PDFs packed into ZIP.`;
                }
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
                        input => {
                            input.value = "";
                        }
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
       OTHER MODES
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
                                mode !== "sticker"
                            );


                        document
                            .getElementById(
                                "otherAddressMode"
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


        const preview =
            document.getElementById(
                "otherAddressPreview"
            );


        preview.style.border =
            document.getElementById(
                "otherAddressBorder"
            ).checked
                ? getBorderCSS(
                    document.getElementById(
                        "otherAddressBorderStyle"
                    ).value
                )
                : "none";


        preview.style.fontFamily =
            document.getElementById(
                "otherAddressFont"
            ).value;


        preview.style.fontSize =
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

            const element =
                document.getElementById(id);

            if (!element) {
                return;
            }

            element.addEventListener(
                "input",
                updateOtherAddress
            );

            element.addEventListener(
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

                        unit:
                            "mm",

                        format:
                            [
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
                    getPDFSpaceFont(
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
                    fromLines.length * 5 +
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


                downloadBlob(
                    pdf.output("blob"),
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


        let total = 0;


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            total +=
                Number(
                    isbn[i]
                ) *
                (10 - i);
        }


        const last =
            isbn[9].toUpperCase() === "X"
                ? 10
                : Number(
                    isbn[9]
                );


        total += last;


        return (
            total % 11 ===
            0
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


        let total = 0;


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            total +=
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
                (total % 10)
            ) %
            10;


        return (
            check ===
            Number(
                isbn[12]
            )
        );
    }


    function isbn10To13(isbn) {

        const base =
            "978" +
            isbn.substring(
                0,
                9
            );


        let total = 0;


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            total +=
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
                (total % 10)
            ) %
            10;


        return (
            base +
            String(check)
        );
    }


    function normalizeISBN13(raw) {

        const cleaned =
            cleanISBN(raw);


        if (
            cleaned.length === 13
        ) {

            return validISBN13(cleaned)
                ? cleaned
                : null;
        }


        if (
            cleaned.length === 10
        ) {

            if (
                !validISBN10(
                    cleaned
                )
            ) {
                return null;
            }


            return isbn10To13(
                cleaned
            );
        }


        return null;
    }


    /* ---------------------------------------------------------
       ISBN BARCODE TABLES
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


    function eanPattern(isbn) {

        let result =
            "101";


        const first =
            Number(
                isbn[0]
            );


        const parity =
            PARITY[first];


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
                parity[i - 1] === "L"
                    ? L[digit]
                    : G[digit];
        }


        result +=
            "01010";


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


        result +=
            "101";


        return result;
    }


    function drawEAN13(
        pdf,
        isbn,
        x,
        y,
        width,
        height
    ) {

        const pattern =
            eanPattern(isbn);


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

                    moduleWidth +
                    .01,

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


        const isbnInputs =
            document.querySelectorAll(
                ".isbn-manual"
            );


        const titleInputs =
            document.querySelectorAll(
                ".title-manual"
            );


        const editionInputs =
            document.querySelectorAll(
                ".edition-manual"
            );


        const rows = [];


        isbnInputs.forEach(
            (
                input,
                index
            ) => {

                const isbn =
                    input.value.trim();

                const title =
                    titleInputs[
                        index
                    ].value.trim();

                const edition =
                    editionInputs[
                        index
                    ].value.trim();


                if (
                    isbn ||
                    title ||
                    edition
                ) {

                    rows.push({
                        isbn,
                        title,
                        edition:
                            edition || "N"
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
                                type:
                                    "array"
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
                                header:
                                    1,
                                defval:
                                    ""
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
                                    edition || "N"
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


        const number =
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

            number.textContent =
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


        number.textContent =
            isbn13 ||
            row.isbn;


        title.textContent =
            row.title ||
            "Book Title";


        edition.textContent =
            row.edition ||
            "N";


        barcode.innerHTML =
            "";


        if (isbn13) {

            const pattern =
                eanPattern(
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
       ISBN GENERATE
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
                            "Spaces and hyphens are allowed, " +
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


                if (!page) {

                    alert(
                        "Please select a valid page size."
                    );

                    return;
                }


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
                    getPDFSpaceFont(
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
                    start < validRows.length;
                    start += labelsPerPage
                ) {

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


                    const current =
                        validRows.slice(
                            start,
                            start +
                            labelsPerPage
                        );


                    const [
                        rowsGrid,
                        colsGrid
                    ] =
                        getGrid(
                            current.length
                        );


                    const cellWidth =
                        page.width /
                        colsGrid;


                    const cellHeight =
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
                                cellWidth;


                            const y =
                                r *
                                cellHeight;


                            const barcodeWidth =
                                Math.min(
                                    55,
                                    cellWidth - 12
                                );


                            const barcodeHeight =
                                Math.min(
                                    30,
                                    cellHeight * .28
                                );


                            drawEAN13(
                                pdf,
                                row.isbn,
                                x +
                                (
                                    cellWidth -
                                    barcodeWidth
                                ) / 2,

                                y + 8,

                                barcodeWidth,

                                barcodeHeight
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
                                cellWidth / 2,

                                y +
                                barcodeHeight +
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
                                    cellWidth - 12
                                );


                            pdf.text(
                                titleLines,

                                x +
                                cellWidth / 2,

                                y +
                                barcodeHeight +
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
                                cellWidth / 2,

                                y +
                                cellHeight -
                                8,

                                {
                                    align:
                                        "center"
                                }
                            );
                        }
                    );
                }


                downloadBlob(
                    pdf.output("blob"),
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
                        input => {
                            input.value = "";
                        }
                    );


                document
                    .querySelectorAll(
                        ".title-manual"
                    )
                    .forEach(
                        input => {
                            input.value = "";
                        }
                    );


                document
                    .querySelectorAll(
                        ".edition-manual"
                    )
                    .forEach(
                        input => {
                            input.value = "";
                        }
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
       INITIALIZE
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
