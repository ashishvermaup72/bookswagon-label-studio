/* =========================================================
   BOOKSWAGON LABEL STUDIO
   FINAL APP.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       LIBRARIES
    ====================================================== */

    const PDF =
        window.jspdf &&
        typeof window.jspdf.jsPDF === "function"
            ? window.jspdf.jsPDF
            : null;

    const ZIP =
        window.JSZip ||
        null;

    const XLSX_LIB =
        window.XLSX ||
        null;


    /* =====================================================
       STATE
    ====================================================== */

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
    let isbnExcelRows = [];


    /* =====================================================
       GENERAL HELPERS
    ====================================================== */

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
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );
    }


    function pad2(value) {

        return String(value)
            .padStart(2, "0");
    }


    function currentDateTime() {

        const now =
            new Date();

        const date =
            [
                now.getFullYear(),
                pad2(now.getMonth() + 1),
                pad2(now.getDate())
            ].join("-");

        const time =
            [
                pad2(now.getHours()),
                pad2(now.getMinutes()),
                pad2(now.getSeconds())
            ].join("-");

        return {
            date,
            time
        };
    }


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
            () => {
                URL.revokeObjectURL(url);
            },
            1500
        );

    }


    function downloadPDF(
        pdf,
        filename
    ) {

        try {

            const blob =
                pdf.output("blob");

            downloadBlob(
                blob,
                filename
            );

            return true;

        }
        catch (error) {

            console.error(
                "PDF error:",
                error
            );

            alert(
                "PDF download failed."
            );

            return false;
        }

    }


    async function makeZip(
        files,
        zipFilename
    ) {

        if (!ZIP) {

            alert(
                "ZIP library load nahi hui.\n\n" +
                "Individual PDF download try karein."
            );

            return false;
        }


        const zip =
            new ZIP();


        files.forEach(
            file => {

                zip.file(
                    file.name,
                    file.blob
                );

            }
        );


        const blob =
            await zip.generateAsync({
                type: "blob"
            });


        downloadBlob(
            blob,
            zipFilename
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

            const width =
                Number(customWidth);

            const height =
                Number(customHeight);


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


    function orientation(
        page
    ) {

        return page.width >
            page.height
            ? "landscape"
            : "portrait";

    }


    function pdfFont(
        font
    ) {

        if (
            font === "Georgia" ||
            font === "Times New Roman"
        ) {

            return "times";

        }


        if (
            font === "Courier New"
        ) {

            return "courier";

        }


        return "helvetica";

    }


    /* =====================================================
       BORDER SYSTEM
    ====================================================== */

    const cssBorders = {

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


    function cssBorder(
        style
    ) {

        return (
            cssBorders[style] ||
            cssBorders["solid-dark"]
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

            "solid-dark": {
                line: 0.8,
                color: 25
            },

            "solid-medium": {
                line: 0.5,
                color: 80
            },

            "solid-light": {
                line: 0.25,
                color: 160
            },

            "double": {
                line: 0.5,
                color: 45
            },

            "dashed": {
                line: 0.4,
                color: 80
            },

            "dotted": {
                line: 0.4,
                color: 80
            },

            "bold": {
                line: 1.4,
                color: 10
            },

            "double-dark": {
                line: 1,
                color: 20
            },

            "inner": {
                line: 0.5,
                color: 50
            },

            "outer": {
                line: 1,
                color: 50
            },

            "triple": {
                line: 0.6,
                color: 30
            },

            "text-box": {
                line: 0.7,
                color: 30
            }

        };


        const cfg =
            styles[style] ||
            styles["solid-dark"];


        pdf.setDrawColor(
            cfg.color,
            cfg.color,
            cfg.color
        );

        pdf.setLineWidth(
            cfg.line
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
            style === "dotted"
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
            style === "double" ||
            style === "double-dark"
        ) {

            pdf.setLineDashPattern(
                [],
                0
            );

            pdf.setLineWidth(
                0.3
            );

            pdf.rect(
                6,
                6,
                width - 12,
                height - 12
            );

        }


        if (
            style === "triple"
        ) {

            pdf.setLineDashPattern(
                [],
                0
            );

            pdf.setLineWidth(
                0.25
            );

            pdf.rect(
                7,
                7,
                width - 14,
                height - 14
            );

        }


        if (
            style === "inner"
        ) {

            pdf.setLineDashPattern(
                [],
                0
            );

            pdf.setLineWidth(
                0.35
            );

            pdf.rect(
                7,
                7,
                width - 14,
                height - 14
            );

        }


        pdf.setLineDashPattern(
            [],
            0
        );

    }


    /* =====================================================
       TAX BORDER
       Additional inner document border.
    ====================================================== */

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


        pdf.setLineDashPattern(
            [],
            0
        );

    }


    /* =====================================================
       CUTTING MARKS
    ====================================================== */

    function drawCutMarks(
        pdf,
        width,
        height,
        count
    ) {

        if (count <= 1) {
            return;
        }


        pdf.setDrawColor(
            90,
            90,
            90
        );

        pdf.setLineWidth(
            0.25
        );

        pdf.setLineDashPattern(
            [1.5, 1.5],
            0
        );


        const step =
            height / count;


        for (
            let i = 1;
            i < count;
            i++
        ) {

            const y =
                step * i;


            pdf.line(
                4,
                y,
                width - 4,
                y
            );

        }


        pdf.setLineDashPattern(
            [],
            0
        );


        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(
            8
        );


        for (
            let i = 1;
            i < count;
            i++
        ) {

            const y =
                step * i;


            pdf.text(
                "✂",
                width - 7,
                y - 1,
                {
                    align:
                        "center"
                }
            );

        }

    }


    /* =====================================================
       PREVIEW PAGE
    ====================================================== */

    function updatePreviewPage(
        element,
        sizeType,
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
            `size-${sizeType}`
        );


        const page =
            getPageSize(
                sizeType,
                customWidth,
                customHeight
            );


        if (!page) {
            return;
        }


        const ratio =
            page.width /
            page.height;


        const maxHeight =
            440;

        let height =
            maxHeight;

        let width =
            height * ratio;


        const maxWidth =
            330;


        if (
            width > maxWidth
        ) {

            width =
                maxWidth;

            height =
                width / ratio;

        }


        element.style.width =
            `${Math.max(
                120,
                width
            )}px`;


        element.style.height =
            `${Math.max(
                90,
                height
            )}px`;

    }


    /* =====================================================
       TOOL NAVIGATION
    ====================================================== */

    const workspaces =
        document.querySelectorAll(
            ".tool-workspace"
        );


    function hideWorkspaces() {

        workspaces.forEach(
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

                        hideWorkspaces();


                        const tool =
                            button.dataset.openTool;


                        let id = "";


                        if (
                            tool ===
                            "cocoblue"
                        ) {

                            id =
                                "cocoblueWorkspace";

                        }


                        if (
                            tool ===
                            "otherpo"
                        ) {

                            id =
                                "otherpoWorkspace";

                        }


                        if (
                            tool ===
                            "isbn"
                        ) {

                            id =
                                "isbnWorkspace";

                        }


                        const target =
                            document.getElementById(
                                id
                            );


                        if (!target) {
                            return;
                        }


                        target.style.display =
                            "block";


                        target.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
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


                        const tools =
                            document.getElementById(
                                "tools"
                            );


                        if (tools) {

                            tools.scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                        }

                    }
                );

            }
        );


    /* =====================================================
       COCOBLUE
    ====================================================== */

    const cocoPOInputs =
        document.querySelectorAll(
            ".coco-po"
        );


    const cocoExcel =
        document.getElementById(
            "cocoExcel"
        );


    const cocoExcelStatus =
        document.getElementById(
            "cocoExcelStatus"
        );


    function getCocoPOs() {

        if (
            cocoInputMode ===
            "excel"
        ) {

            return [
                ...cocoExcelPOs
            ];

        }


        return Array.from(
            cocoPOInputs
        )
        .map(
            input =>
                input.value.trim()
        )
        .filter(Boolean);

    }


    /* -----------------------------------------------------
       COCO INPUT SWITCH
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       COCO EXCEL
    ----------------------------------------------------- */

    if (cocoExcel) {

        cocoExcel.addEventListener(
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


                    cocoExcelPOs =
                        [];


                    rows.forEach(
                        (
                            row,
                            index
                        ) => {

                            const value =
                                String(
                                    row?.[0] ||
                                    ""
                                ).trim();


                            if (!value) {
                                return;
                            }


                            const normalized =
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
                                    normalized
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


                    cocoExcelStatus.textContent =
                        `${cocoExcelPOs.length} PO(s) loaded`;


                    updateCocoPreview();

                }
                catch (error) {

                    console.error(
                        error
                    );

                    cocoExcelStatus.textContent =
                        "Excel reading failed.";

                    alert(
                        "Unable to read the Excel file."
                    );

                }

            }
        );

    }


    /* -----------------------------------------------------
       COCO SIZE
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       COCO PREVIEW
    ----------------------------------------------------- */

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


        const copies =
            Number(
                document.getElementById(
                    "cocoCopiesPerBox"
                ).value
            ) || 1;


        const cutting =
            document.getElementById(
                "cocoCutting"
            ).checked;


        const border =
            document.getElementById(
                "cocoBorder"
            ).checked;


        const borderStyle =
            document.getElementById(
                "cocoBorderStyle"
            ).value;


        const vertical =
            document.getElementById(
                "cocoVertical"
            ).checked;


        const previewPage =
            document.getElementById(
                "cocoPreviewPage"
            );


        const previewLabel =
            document.getElementById(
                "cocoPreviewLabel"
            );


        updatePreviewPage(
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
            pos[0] ||
            "";


        document.getElementById(
            "cocoPreviewBox"
        ).textContent =
            `BOX ${start}`;


        document.getElementById(
            "cocoBoxSummary"
        ).textContent =
            `${start}–${end}`;


        document.getElementById(
            "cocoSummary"
        ).textContent =
            `${Math.max(
                1,
                end - start + 1
            )} boxes`;


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


        previewLabel.style.border =
            border
                ? cssBorder(
                    borderStyle
                )
                : "none";


        previewLabel.style.flexDirection =
            vertical
                ? "column"
                : "row";


        document.getElementById(
            "cocoPreviewDotted"
        ).style.display =
            copies > 0
                ? "inline-block"
                : "none";


        document.getElementById(
            "cocoPreviewScissor"
        ).style.display =
            cutting
                ? "inline-block"
                : "none";

    }


    [
        ...cocoPOInputs,
        "cocoStartBox",
        "cocoEndBox",
        "cocoCopiesPerBox",
        "cocoLabelsPerPage",
        "cocoVertical",
        "cocoCutting",
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

            const element =
                typeof item === "string"
                    ? document.getElementById(
                        item
                    )
                    : item;


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


    /* -----------------------------------------------------
       COCO BOX DATA
    ----------------------------------------------------- */

    function buildCocoLabels(
        po
    ) {

        let start =
            Number(
                document.getElementById(
                    "cocoStartBox"
                ).value
            ) || 1;


        let end =
            Number(
                document.getElementById(
                    "cocoEndBox"
                ).value
            ) || start;


        start =
            Math.max(
                1,
                Math.min(
                    200,
                    start
                )
            );


        end =
            Math.max(
                start,
                Math.min(
                    200,
                    end
                )
            );


        const copies =
            Number(
                document.getElementById(
                    "cocoCopiesPerBox"
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


    /* -----------------------------------------------------
       BUILD LABEL PDF
    ----------------------------------------------------- */

    function createLabelPDF(
        labels,
        options
    ) {

        const page =
            options.page;


        const pdf =
            new PDF({

                orientation:
                    orientation(
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


        const font =
            pdfFont(
                options.font
            );


        const fontSize =
            Number(
                options.fontSize
            ) || 10;


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
                        page.width,
                        page.height
                    ],
                    orientation(
                        page
                    )
                );

            }


            drawBorder(
                pdf,
                page.width,
                page.height,
                options.border,
                options.borderStyle
            );


            drawTaxBorder(
                pdf,
                page.width,
                page.height,
                options.taxBorder
            );


            const currentLabels =
                labels.slice(
                    pageIndex *
                    labelsPerPage,
                    (
                        pageIndex + 1
                    ) *
                    labelsPerPage
                );


            /*
             * User requested vertical top-to-bottom
             * layout by default.
             */

            const vertical =
                options.vertical !==
                false;


            const count =
                currentLabels.length;


            if (vertical) {

                const cellHeight =
                    page.height /
                    count;


                currentLabels.forEach(
                    (
                        label,
                        index
                    ) => {

                        const top =
                            index *
                            cellHeight;


                        const centerX =
                            page.width /
                            2;


                        const centerY =
                            top +
                            cellHeight /
                            2;


                        drawLabelContent(
                            pdf,
                            label,
                            {
                                centerX,
                                centerY,
                                cellWidth:
                                    page.width,
                                cellHeight,
                                font,
                                fontSize,
                                cutting:
                                    options.cutting,
                                first:
                                    index === 0,
                                last:
                                    index ===
                                    count - 1
                            }
                        );

                    }
                );

            }
            else {

                const [
                    rows,
                    columns
                ] =
                    getGrid(
                        count
                    );


                const cellWidth =
                    page.width /
                    columns;


                const cellHeight =
                    page.height /
                    rows;


                currentLabels.forEach(
                    (
                        label,
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


                        const centerX =
                            column *
                            cellWidth +
                            cellWidth /
                            2;


                        const centerY =
                            row *
                            cellHeight +
                            cellHeight /
                            2;


                        drawLabelContent(
                            pdf,
                            label,
                            {
                                centerX,
                                centerY,
                                cellWidth,
                                cellHeight,
                                font,
                                fontSize,
                                cutting:
                                    options.cutting,
                                first:
                                    index === 0,
                                last:
                                    index ===
                                    count - 1
                            }
                        );

                    }
                );

            }


            if (
                options.cutting
            ) {

                drawCutMarks(
                    pdf,
                    page.width,
                    page.height,
                    count
                );

            }

        }


        return pdf;

    }


    /* -----------------------------------------------------
       LABEL CONTENT
    ----------------------------------------------------- */

    function drawLabelContent(
        pdf,
        label,
        settings
    ) {

        const {
            centerX,
            centerY,
            cellWidth,
            cellHeight,
            font,
            fontSize,
            cutting
        } =
            settings;


        pdf.setTextColor(
            25,
            25,
            25
        );


        pdf.setFont(
            font,
            "bold"
        );


        pdf.setFontSize(
            fontSize
        );


        /*
         * PO number only.
         * No "PO" prefix.
         */

        pdf.text(
            String(
                label.po
            ),
            centerX,
            centerY - 10,
            {
                align:
                    "center"
            }
        );


        /*
         * Mandatory dotted separator.
         */

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(
            7
        );


        const dotted =
            ". ".repeat(
                Math.max(
                    8,
                    Math.floor(
                        cellWidth /
                        7
                    )
                )
            );


        pdf.text(
            dotted,
            centerX,
            centerY - 2,
            {
                align:
                    "center"
            }
        );


        /*
         * Box number.
         */

        pdf.setFont(
            font,
            "bold"
        );


        pdf.setFontSize(
            Math.max(
                12,
                fontSize + 4
            )
        );


        pdf.text(
            `BOX ${label.box}`,
            centerX,
            centerY + 12,
            {
                align:
                    "center"
            }
        );


        /*
         * Cutting mark.
         */

        if (cutting) {

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
                centerY +
                Math.min(
                    25,
                    cellHeight /
                    3
                ),
                {
                    align:
                        "center"
                }
            );

        }

    }


    /* -----------------------------------------------------
       COCO GENERATE
    ----------------------------------------------------- */

    document
        .getElementById(
            "cocoGenerate"
        )
        .addEventListener(
            "click",
            async () => {

                if (
                    !requirePDF()
                ) {
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


                if (
                    start < 1 ||
                    end < start ||
                    end > 200
                ) {

                    alert(
                        "Box range must be between 1 and 200."
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


                const labelsPerPage =
                    Number(
                        document.getElementById(
                            "cocoLabelsPerPage"
                        ).value
                    ) || 1;


                const copies =
                    Number(
                        document.getElementById(
                            "cocoCopiesPerBox"
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


                const zipFiles =
                    [];


                const timestamp =
                    currentDateTime();


                for (
                    const po of pos
                ) {

                    const labels =
                        buildCocoLabels(
                            po
                        );


                    const pdf =
                        createLabelPDF(
                            labels,
                            options
                        );


                    const filename =
                        `${safeName(
                            po
                        )}_BOX${start}-${end}_${timestamp.date}_${timestamp.time}.pdf`;


                    const blob =
                        pdf.output(
                            "blob"
                        );


                    zipFiles.push({
                        name:
                            filename,
                        blob
                    });


                    if (!zipEnabled) {

                        downloadBlob(
                            blob,
                            filename
                        );


                        /*
                         * Small delay prevents
                         * browser download blocking.
                         */

                        await new Promise(
                            resolve =>
                                setTimeout(
                                    resolve,
                                    350
                                )
                        );

                    }

                }


                if (
                    zipEnabled
                ) {

                    await makeZip(
                        zipFiles,
                        `BooksWagon_${timestamp.date}_${timestamp.time}.zip`
                    );

                }


                document.getElementById(
                    "cocoStatus"
                ).textContent =
                    `${pos.length} separate PDF(s) generated.`;

            }
        );


    /* -----------------------------------------------------
       COCO STICKER TABS
    ----------------------------------------------------- */

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
                                mode !==
                                "sticker"
                            );


                        document
                            .getElementById(
                                "cocoblueAddressMode"
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


    /* =====================================================
       COCO ADDRESS
    ====================================================== */

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


                        updateCocoAddressPreview();

                    }
                );

            }
        );


    /*
     * Dynamically create custom address size fields.
     */

    function ensureAddressCustomInputs(
        containerId,
        prefix
    ) {

        const container =
            document.getElementById(
                containerId
            );


        if (!container) {
            return null;
        }


        let wrapper =
            document.getElementById(
                `${prefix}CustomAddressSize`
            );


        if (wrapper) {
            return wrapper;
        }


        wrapper =
            document.createElement(
                "div"
            );


        wrapper.id =
            `${prefix}CustomAddressSize`;


        wrapper.className =
            "custom-grid";


        wrapper.innerHTML = `
            <input
                type="number"
                id="${prefix}CustomAddressWidth"
                min="1"
                placeholder="Custom Width (mm)"
            >

            <input
                type="number"
                id="${prefix}CustomAddressHeight"
                min="1"
                placeholder="Custom Height (mm)"
            >
        `;


        container.appendChild(
            wrapper
        );


        return wrapper;

    }


    ensureAddressCustomInputs(
        "cocoblueAddressMode",
        "coco"
    );


    function getCocoAddressPage() {

        return getPageSize(
            cocoAddressSize,
            document.getElementById(
                "cocoCustomAddressWidth"
            )?.value,
            document.getElementById(
                "cocoCustomAddressHeight"
            )?.value
        );

    }


    function updateCocoAddressPreview() {

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
            from ||
            "FROM";


        document.getElementById(
            "cocoToPreview"
        ).textContent =
            to ||
            "TO";


        const preview =
            document.getElementById(
                "cocoAddressPreview"
            );


        preview.style.fontFamily =
            document.getElementById(
                "cocoAddressFont"
            ).value;


        preview.style.fontSize =
            `${
                Number(
                    document.getElementById(
                        "cocoAddressFontSize"
                    ).value
                ) || 10
            }px`;


        preview.style.border =
            document.getElementById(
                "cocoAddressBorder"
            ).checked
                ? cssBorder(
                    document.getElementById(
                        "cocoAddressBorderStyle"
                    ).value
                )
                : "none";

    }


    [
        "cocoFrom",
        "cocoTo",
        "cocoAddressBorder",
        "cocoAddressBorderStyle",
        "cocoAddressFont",
        "cocoAddressFontSize"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {
                return;
            }


            element.addEventListener(
                "input",
                updateCocoAddressPreview
            );


            element.addEventListener(
                "change",
                updateCocoAddressPreview
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
                    getCocoAddressPage();


                if (!page) {

                    alert(
                        "Please enter valid custom size."
                    );

                    return;

                }


                const pdf =
                    new PDF({

                        orientation:
                            orientation(
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


                let y =
                    20;


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


                updateCocoAddressPreview();

            }
        );


    /* =====================================================
       OTHER PO
    ====================================================== */

    function getOtherPOs() {

        if (
            otherInputMode ===
            "excel"
        ) {

            return [
                ...otherExcelPOs
            ];

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
                                header:
                                    1,
                                defval:
                                    ""
                            }
                        );


                    otherExcelPOs =
                        [];


                    rows.forEach(
                        (
                            row,
                            index
                        ) => {

                            const value =
                                String(
                                    row?.[0] ||
                                    ""
                                ).trim();


                            if (!value) {
                                return;
                            }


                            const normalized =
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
                                    normalized
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

                }
                catch (error) {

                    console.error(
                        error
                    );

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


    function otherLayout() {

        return (
            document.querySelector(
                'input[name="otherLayout"]:checked'
            )?.value ||
            "same"
        );

    }


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


        updatePreviewPage(
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
            pos[0] ||
            "";


        document.getElementById(
            "otherPreviewBox"
        ).textContent =
            `BOX ${start}`;


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


        preview.style.border =
            document.getElementById(
                "otherBorder"
            ).checked
                ? cssBorder(
                    document.getElementById(
                        "otherBorderStyle"
                    ).value
                )
                : "none";


        document
            .querySelectorAll(
                "#otherPreview .preview-scissor"
            )
            .forEach(
                mark => {

                    mark.style.display =
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
                    ? document.querySelectorAll(
                        item
                    )
                    : [
                        document.getElementById(
                            item
                        )
                    ];


            elements
                .forEach(
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


    function buildOtherLabels(
        po
    ) {

        const start =
            Math.max(
                1,
                Math.min(
                    200,
                    Number(
                        document.getElementById(
                            "otherStartBox"
                        ).value
                    ) || 1
                )
            );


        const end =
            Math.max(
                start,
                Math.min(
                    200,
                    Number(
                        document.getElementById(
                            "otherEndBox"
                        ).value
                    ) || start
                )
            );


        const copies =
            Number(
                document.getElementById(
                    "otherCopiesPerBox"
                ).value
            ) || 1;


        const result =
            [];


        if (
            otherLayout() ===
            "same"
        ) {

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

                    result.push({
                        po,
                        box,
                        copy
                    });

                }

            }

        }
        else {

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

                    result.push({
                        po,
                        box,
                        copy
                    });

                }

            }

        }


        return result;

    }


    document
        .getElementById(
            "otherGenerate"
        )
        .addEventListener(
            "click",
            async () => {

                if (
                    !requirePDF()
                ) {
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
                    start < 1 ||
                    start > 200 ||
                    end < start ||
                    end > 200
                ) {

                    alert(
                        "Box range must be from 1 to 200."
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


                const zipEnabled =
                    document.getElementById(
                        "otherZip"
                    ).checked;


                const zipFiles =
                    [];


                const timestamp =
                    currentDateTime();


                for (
                    const po of pos
                ) {

                    const labels =
                        buildOtherLabels(
                            po
                        );


                    const pdf =
                        createLabelPDF(
                            labels,
                            options
                        );


                    const filename =
                        `${safeName(
                            po
                        )}_BOX${start}-${end}_${timestamp.date}_${timestamp.time}.pdf`;


                    const blob =
                        pdf.output(
                            "blob"
                        );


                    zipFiles.push({
                        name:
                            filename,
                        blob
                    });


                    if (!zipEnabled) {

                        downloadBlob(
                            blob,
                            filename
                        );


                        await new Promise(
                            resolve =>
                                setTimeout(
                                    resolve,
                                    350
                                )
                        );

                    }

                }


                if (
                    zipEnabled
                ) {

                    await makeZip(
                        zipFiles,
                        `BooksWagon_OtherPO_${timestamp.date}_${timestamp.time}.zip`
                    );

                }


                document.getElementById(
                    "otherStatus"
                ).textContent =
                    `${pos.length} separate PDF(s) generated.`;

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


                otherExcelPOs =
                    [];


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


    /* =====================================================
       OTHER TABS
    ====================================================== */

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


    /* =====================================================
       OTHER ADDRESS
    ====================================================== */

    function ensureOtherAddressCustomInputs() {

        const parent =
            document.getElementById(
                "otherAddressMode"
            );


        if (!parent) {
            return;
        }


        if (
            document.getElementById(
                "otherCustomAddressSize"
            )
        ) {
            return;
        }


        const card =
            parent.querySelector(
                ".workspace-card"
            );


        if (!card) {
            return;
        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.id =
            "otherCustomAddressSize";


        wrapper.className =
            "custom-grid";


        wrapper.innerHTML = `
            <input
                id="otherCustomAddressWidth"
                type="number"
                min="1"
                placeholder="Custom Width (mm)"
            >

            <input
                id="otherCustomAddressHeight"
                type="number"
                min="1"
                placeholder="Custom Height (mm)"
            >
        `;


        const pageGrid =
            card.querySelector(
                ".page-grid"
            );


        if (pageGrid) {

            pageGrid.insertAdjacentElement(
                "afterend",
                wrapper
            );

        }

    }


    ensureOtherAddressCustomInputs();


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


                        const custom =
                            document.getElementById(
                                "otherCustomAddressSize"
                            );


                        if (custom) {

                            custom.classList.toggle(
                                "hidden",
                                otherAddressSize !==
                                "custom"
                            );

                        }


                        updateOtherAddressPreview();

                    }
                );

            }
        );


    function updateOtherAddressPreview() {

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
            from ||
            "FROM";


        document.getElementById(
            "otherToPreview"
        ).textContent =
            to ||
            "TO";


        const preview =
            document.getElementById(
                "otherAddressPreview"
            );


        preview.style.fontFamily =
            document.getElementById(
                "otherAddressFont"
            ).value;


        preview.style.fontSize =
            `${
                Number(
                    document.getElementById(
                        "otherAddressFontSize"
                    ).value
                ) || 10
            }px`;


        preview.style.border =
            document.getElementById(
                "otherAddressBorder"
            ).checked
                ? cssBorder(
                    document.getElementById(
                        "otherAddressBorderStyle"
                    ).value
                )
                : "none";

    }


    [
        "otherFrom",
        "otherTo",
        "otherAddressBorder",
        "otherAddressBorderStyle",
        "otherAddressFont",
        "otherAddressFontSize"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {
                return;
            }


            element.addEventListener(
                "input",
                updateOtherAddressPreview
            );


            element.addEventListener(
                "change",
                updateOtherAddressPreview
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
                        otherAddressSize,
                        document.getElementById(
                            "otherCustomAddressWidth"
                        )?.value,
                        document.getElementById(
                            "otherCustomAddressHeight"
                        )?.value
                    );


                if (!page) {

                    alert(
                        "Please enter valid custom size."
                    );

                    return;

                }


                const pdf =
                    new PDF({

                        orientation:
                            orientation(
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


                let y =
                    20;


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


                updateOtherAddressPreview();

            }
        );


    /* =====================================================
       ISBN
    ====================================================== */

    let isbnRows =
        [];


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


    /* -----------------------------------------------------
       ISBN PAGE SIZE
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       ISBN NORMALIZATION
    ----------------------------------------------------- */

    function cleanISBN(
        value
    ) {

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


    function isbn10Check(
        digits
    ) {

        if (
            !/^[0-9]{9}[0-9Xx]$/.test(
                digits
            )
        ) {

            return false;

        }


        let sum =
            0;


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            sum +=
                Number(
                    digits[i]
                ) *
                (
                    10 - i
                );

        }


        const last =
            digits[9].toUpperCase() ===
            "X"
                ? 10
                : Number(
                    digits[9]
                );


        sum +=
            last;


        return (
            sum % 11 ===
            0
        );

    }


    function isbn13Check(
        digits
    ) {

        if (
            !/^\d{13}$/.test(
                digits
            )
        ) {

            return false;

        }


        let sum =
            0;


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            sum +=
                Number(
                    digits[i]
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
                digits[12]
            )
        );

    }


    function isbn10To13(
        isbn10
    ) {

        const base =
            "978" +
            isbn10.substring(
                0,
                9
            );


        let sum =
            0;


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
            String(
                check
            )
        );

    }


    /*
     * IMPORTANT:
     * We still validate check digits.
     * Spaces/hyphens do NOT cause invalid.
     */

    function normalizeToISBN13(
        raw
    ) {

        const cleaned =
            cleanISBN(
                raw
            );


        if (
            cleaned.length === 13
        ) {

            return isbn13Check(
                cleaned
            )
                ? cleaned
                : null;

        }


        if (
            cleaned.length === 10
        ) {

            if (
                !isbn10Check(
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


    /* -----------------------------------------------------
       ISBN DATA
    ----------------------------------------------------- */

    function getISBNRows() {

        if (
            isbnInputMode ===
            "excel"
        ) {

            return [
                ...isbnRows
            ];

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


        const rows =
            [];


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
                            edition ||
                            "N"

                    });

                }

            }
        );


        return rows;

    }


    /* -----------------------------------------------------
       ISBN EXCEL
    ----------------------------------------------------- */

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


                    isbnRows =
                        [];


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

                }
                catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        "Unable to read ISBN Excel file."
                    );

                }

            }
        );


    /* -----------------------------------------------------
       EAN-13 BARCODE TABLES
    ----------------------------------------------------- */

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


    const parity = {

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


    function eanPattern(
        isbn
    ) {

        const first =
            Number(
                isbn[0]
            );


        let output =
            "101";


        const p =
            parity[
                first
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


            output +=
                p[
                    i - 1
                ] === "L"

                    ? L[digit]

                    : G[digit];

        }


        output +=
            "01010";


        for (
            let i = 7;
            i <= 12;
            i++
        ) {

            output +=
                R[
                    Number(
                        isbn[i]
                    )
                ];

        }


        output +=
            "101";


        return output;

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
            eanPattern(
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

                    moduleWidth +
                    0.01,

                    height,

                    "F"
                );

            }

        }

    }


    /* -----------------------------------------------------
       ISBN PREVIEW
    ----------------------------------------------------- */

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
            normalizeToISBN13(
                row.isbn
            );


        number.textContent =
            isbn13 ||
            row.isbn ||
            "";


        title.textContent =
            row.title ||
            "";


        edition.textContent =
            row.edition ||
            "N";


        barcode.innerHTML =
            "";


        if (
            isbn13
        ) {

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
                            `${(
                                100 /
                                pattern.length
                            )}%`;


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


    /* -----------------------------------------------------
       ISBN SETTINGS
    ----------------------------------------------------- */

    [
        "isbnLabelsPerPage",
        "isbnFontSize",
        "isbnBorder",
        "isbnTaxBorder",
        "isbnBorderStyle",
        "isbnFont"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {
                return;
            }


            element.addEventListener(
                "input",
                updateISBNPreview
            );


            element.addEventListener(
                "change",
                updateISBNPreview
            );

        }
    );


    /* -----------------------------------------------------
       ISBN PDF
    ----------------------------------------------------- */

    document
        .getElementById(
            "isbnGenerate"
        )
        .addEventListener(
            "click",
            () => {

                if (
                    !requirePDF()
                ) {
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


                const validRows =
                    [];


                for (
                    const row of rows
                ) {

                    if (
                        !row.isbn
                    ) {

                        alert(
                            "ISBN is mandatory."
                        );

                        return;
                    }


                    if (
                        !row.title
                    ) {

                        alert(
                            "Book Name is mandatory."
                        );

                        return;
                    }


                    /*
                     * Allows:
                     * 978-...
                     * 978 ...
                     * ISBN-10
                     * ISBN-13
                     */

                    const isbn13 =
                        normalizeToISBN13(
                            row.isbn
                        );


                    if (
                        !isbn13
                    ) {

                        alert(
                            `Invalid ISBN: ${row.isbn}\n\n` +
                            "Please check the ISBN digits/check digit."
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
                            orientation(
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


                const border =
                    document.getElementById(
                        "isbnBorder"
                    ).checked;


                const borderStyle =
                    document.getElementById(
                        "isbnBorderStyle"
                    ).value;


                const taxBorder =
                    document.getElementById(
                        "isbnTaxBorder"
                    ).checked;


                for (
                    let start = 0;
                    start <
                    validRows.length;
                    start +=
                        labelsPerPage
                ) {

                    const currentRows =
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
                            orientation(
                                page
                            )
                        );

                    }


                    drawBorder(
                        pdf,
                        page.width,
                        page.height,
                        border,
                        borderStyle
                    );


                    drawTaxBorder(
                        pdf,
                        page.width,
                        page.height,
                        taxBorder
                    );


                    const [
                        rowsGrid,
                        columnsGrid
                    ] =
                        getGrid(
                            currentRows.length
                        );


                    const cellWidth =
                        page.width /
                        columnsGrid;


                    const cellHeight =
                        page.height /
                        rowsGrid;


                    currentRows.forEach(
                        (
                            row,
                            index
                        ) => {

                            const gridRow =
                                Math.floor(
                                    index /
                                    columnsGrid
                                );


                            const gridColumn =
                                index %
                                columnsGrid;


                            const cellX =
                                gridColumn *
                                cellWidth;


                            const cellY =
                                gridRow *
                                cellHeight;


                            const barcodeWidth =
                                Math.min(
                                    55,
                                    cellWidth -
                                    12
                                );


                            const barcodeHeight =
                                Math.min(
                                    30,
                                    cellHeight *
                                    0.28
                                );


                            drawEAN13(
                                pdf,
                                row.isbn,
                                cellX +
                                (
                                    cellWidth -
                                    barcodeWidth
                                ) / 2,
                                cellY + 8,
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
                                cellX +
                                cellWidth /
                                2,
                                cellY +
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
                                    cellWidth -
                                    12
                                );


                            pdf.text(
                                titleLines,
                                cellX +
                                cellWidth /
                                2,
                                cellY +
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
                                cellX +
                                cellWidth /
                                2,
                                cellY +
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


    /* -----------------------------------------------------
       ISBN RESET
    ----------------------------------------------------- */

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


                isbnRows =
                    [];


                document.getElementById(
                    "isbnExcel"
                ).value =
                    "";


                document.getElementById(
                    "isbnExcelStatus"
                ).textContent =
                    "No file selected";


                updateISBNPreview();

            }
        );


    /* =====================================================
       INITIAL UPDATE
    ====================================================== */

    updateCocoPreview();

    updateCocoAddressPreview();

    updateOtherPreview();

    updateOtherAddressPreview();

    updateISBNPreview();


    console.log(
        "BooksWagon Label Studio: ready."
    );

});
