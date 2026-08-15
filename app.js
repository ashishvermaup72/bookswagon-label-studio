/* =========================================================
   BOOKSWAGON LABEL STUDIO
   FINAL ROBUST APP.JS

   Tools:
   1. CocoBlue PO
   2. Other PO
   3. ISBN Barcode Generator

   Important:
   - jsPDF is loaded only when PDF is requested.
   - XLSX is checked only when Excel is used.
   - UI remains functional even if an external library fails.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       LIBRARY HELPERS
    ====================================================== */

    function getPDFConstructor() {

        if (
            window.jspdf &&
            typeof window.jspdf.jsPDF === "function"
        ) {
            return window.jspdf.jsPDF;
        }

        alert(
            "PDF library is not loaded.\n\n" +
            "Please refresh the page and try again."
        );

        return null;
    }


    function hasXLSX() {

        if (
            window.XLSX &&
            typeof window.XLSX.read === "function"
        ) {
            return true;
        }

        alert(
            "Excel library is not loaded.\n\n" +
            "Please refresh the page and try again."
        );

        return false;
    }


    /* =====================================================
       GENERAL HELPERS
    ====================================================== */

    function safeName(value) {

        return String(value || "BooksWagon")
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );

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


    function getPDFOrientation(
        page
    ) {

        return page.width > page.height
            ? "landscape"
            : "portrait";

    }


    function getPdfFont(
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


    function getCssBorder(
        style
    ) {

        const map = {

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
                "5px solid #111"

        };


        return (
            map[style] ||
            map["solid-dark"]
        );

    }


    function drawPDFBorder(
        pdf,
        width,
        height,
        enabled,
        style
    ) {

        if (!enabled) {
            return;
        }


        const map = {

            "solid-dark":
                {
                    width: 0.8,
                    color: 25
                },

            "solid-medium":
                {
                    width: 0.5,
                    color: 80
                },

            "solid-light":
                {
                    width: 0.25,
                    color: 160
                },

            "double":
                {
                    width: 0.5,
                    color: 45
                },

            "dashed":
                {
                    width: 0.4,
                    color: 80
                },

            "dotted":
                {
                    width: 0.4,
                    color: 80
                },

            "bold":
                {
                    width: 1.4,
                    color: 10
                }

        };


        const cfg =
            map[style] ||
            map["solid-dark"];


        pdf.setLineWidth(
            cfg.width
        );


        pdf.setDrawColor(
            cfg.color,
            cfg.color,
            cfg.color
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


        if (style === "double") {

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


    function getGrid(
        count
    ) {

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


        return (
            grids[count] ||
            [2, 5]
        );

    }


    function readInputs(
        selector
    ) {

        return Array.from(
            document.querySelectorAll(
                selector
            )
        )
        .map(
            element =>
                element.value.trim()
        )
        .filter(Boolean);

    }


    /* =====================================================
       TOOL WORKSPACE NAVIGATION
    ====================================================== */

    const workspaces =
        document.querySelectorAll(
            ".tool-workspace"
        );


    function hideAllWorkspaces() {

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

                        const tool =
                            button.dataset.openTool;


                        hideAllWorkspaces();


                        let targetId = null;


                        if (
                            tool ===
                            "cocoblue"
                        ) {

                            targetId =
                                "cocoblueWorkspace";

                        }


                        if (
                            tool ===
                            "otherpo"
                        ) {

                            targetId =
                                "otherpoWorkspace";

                        }


                        if (
                            tool ===
                            "isbn"
                        ) {

                            targetId =
                                "isbnWorkspace";

                        }


                        if (!targetId) {
                            return;
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


                        const tools =
                            document.getElementById(
                                "tools"
                            );


                        if (tools) {

                            tools.scrollIntoView({
                                behavior: "smooth"
                            });

                        }

                    }
                );

            }
        );


    /* =====================================================
       COCOBLUE
    ====================================================== */

    let cocoInputMode =
        "manual";

    let cocoSize =
        "4x6";

    let cocoAddressSize =
        "4x6";

    let cocoExcelPOs =
        [];


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


    /* -----------------------------------------------------
       COCO INPUT MODE
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


                        const manual =
                            document.getElementById(
                                "cocoManualArea"
                            );

                        const excel =
                            document.getElementById(
                                "cocoExcelArea"
                            );


                        manual.classList.toggle(
                            "hidden",
                            cocoInputMode !==
                            "manual"
                        );


                        excel.classList.toggle(
                            "hidden",
                            cocoInputMode !==
                            "excel"
                        );


                        updateCocoPreview();

                    }
                );

            }
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


        return readInputs(
            ".coco-po"
        );

    }


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


                if (!hasXLSX()) {
                    return;
                }


                try {

                    cocoExcelStatus.textContent =
                        "Reading Excel...";


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


                    if (
                        !workbook.SheetNames.length
                    ) {

                        throw new Error(
                            "No worksheet found."
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


                    cocoExcelPOs =
                        [];


                    rows.forEach(
                        (
                            row,
                            index
                        ) => {

                            if (
                                !row ||
                                !row.length
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


                    cocoExcelStatus.textContent =
                        `${cocoExcelPOs.length} PO(s) loaded`;


                    updateCocoPreview();

                }
                catch (error) {

                    console.error(error);

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
       COCO PAGE SIZE
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


                        const custom =
                            document.getElementById(
                                "cocoCustomSize"
                            );


                        custom.classList.toggle(
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


        const labels =
            Number(
                document.getElementById(
                    "cocoLabelsPerPage"
                ).value
            ) || 1;


        const pagesPerPO =
            Number(
                document.getElementById(
                    "cocoPagesPerPO"
                ).value
            ) || 1;


        const customWidth =
            document.getElementById(
                "cocoCustomWidth"
            ).value;


        const customHeight =
            document.getElementById(
                "cocoCustomHeight"
            ).value;


        const size =
            getPageSize(
                cocoSize,
                customWidth,
                customHeight
            );


        const preview =
            document.getElementById(
                "cocoPreview"
            );


        const fontSize =
            Number(
                document.getElementById(
                    "cocoFontSize"
                ).value
            ) || 10;


        const font =
            document.getElementById(
                "cocoFont"
            ).value;


        const weight =
            document.getElementById(
                "cocoFontWeight"
            ).value;


        const border =
            document.getElementById(
                "cocoBorder"
            ).checked;


        const borderStyle =
            document.getElementById(
                "cocoBorderStyle"
            ).value;


        document.getElementById(
            "cocoPreviewPO"
        ).textContent =
            pos[0] ||
            "BWG123";


        document.getElementById(
            "cocoLabelsSummary"
        ).textContent =
            labels;


        document.getElementById(
            "cocoPagesSummary"
        ).textContent =
            Math.max(
                1,
                pos.length *
                pagesPerPO
            );


        document.getElementById(
            "cocoSizeSummary"
        ).textContent =
            size
                ? size.label
                : "Custom";


        document.getElementById(
            "cocoSummary"
        ).textContent =
            `${Math.max(
                1,
                pos.length *
                pagesPerPO
            )} pages`;


        preview.style.fontFamily =
            font;


        preview.style.fontSize =
            `${fontSize}px`;


        preview.style.fontWeight =
            weight;


        preview.style.border =
            border
                ? getCssBorder(
                    borderStyle
                )
                : "none";

    }


    [
        ...cocoPOInputs,
        document.getElementById(
            "cocoLabelsPerPage"
        ),
        document.getElementById(
            "cocoPagesPerPO"
        ),
        document.getElementById(
            "cocoCustomWidth"
        ),
        document.getElementById(
            "cocoCustomHeight"
        ),
        document.getElementById(
            "cocoBorder"
        ),
        document.getElementById(
            "cocoBorderStyle"
        ),
        document.getElementById(
            "cocoFont"
        ),
        document.getElementById(
            "cocoFontSize"
        ),
        document.getElementById(
            "cocoFontWeight"
        )
    ]
    .filter(Boolean)
    .forEach(
        element => {

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
       COCO STICKER PDF
    ----------------------------------------------------- */

    const cocoGenerate =
        document.getElementById(
            "cocoGenerate"
        );


    if (cocoGenerate) {

        cocoGenerate.addEventListener(
            "click",
            () => {

                const PDF =
                    getPDFConstructor();


                if (!PDF) {
                    return;
                }


                const pos =
                    getCocoPOs();


                if (!pos.length) {

                    alert(
                        "Please enter at least one PO."
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


                const labels =
                    Number(
                        document.getElementById(
                            "cocoLabelsPerPage"
                        ).value
                    ) || 1;


                const pagesPerPO =
                    Number(
                        document.getElementById(
                            "cocoPagesPerPO"
                        ).value
                    ) || 1;


                const pdf =
                    new PDF({

                        orientation:
                            getPDFOrientation(
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


                let outputPages = 0;


                pos.forEach(
                    po => {

                        for (
                            let p = 0;
                            p < pagesPerPO;
                            p++
                        ) {

                            if (
                                outputPages >
                                0
                            ) {

                                pdf.addPage(
                                    [
                                        page.width,
                                        page.height
                                    ],
                                    getPDFOrientation(
                                        page
                                    )
                                );

                            }


                            drawPDFBorder(
                                pdf,
                                page.width,
                                page.height,
                                document.getElementById(
                                    "cocoBorder"
                                ).checked,
                                document.getElementById(
                                    "cocoBorderStyle"
                                ).value
                            );


                            const [
                                rows,
                                columns
                            ] =
                                getGrid(
                                    labels
                                );


                            const cellWidth =
                                page.width /
                                columns;


                            const cellHeight =
                                page.height /
                                rows;


                            const font =
                                pdfFont(
                                    document.getElementById(
                                        "cocoFont"
                                    ).value
                                );


                            const fontSize =
                                Number(
                                    document.getElementById(
                                        "cocoFontSize"
                                    ).value
                                ) || 10;


                            const weight =
                                document.getElementById(
                                    "cocoFontWeight"
                                ).value;


                            pdf.setTextColor(
                                25,
                                25,
                                25
                            );


                            for (
                                let i = 0;
                                i < labels;
                                i++
                            ) {

                                const row =
                                    Math.floor(
                                        i /
                                        columns
                                    );


                                const col =
                                    i %
                                    columns;


                                const centerX =
                                    col *
                                    cellWidth +
                                    cellWidth /
                                    2;


                                const centerY =
                                    row *
                                    cellHeight +
                                    cellHeight /
                                    2;


                                pdf.setFont(
                                    font,
                                    weight
                                );


                                pdf.setFontSize(
                                    fontSize
                                );


                                pdf.text(
                                    String(
                                        po
                                    ),
                                    centerX,
                                    centerY,
                                    {
                                        align:
                                            "center"
                                    }
                                );

                            }


                            outputPages++;

                        }

                    }
                );


                pdf.save(
                    `${safeName(
                        pos[0]
                    )}_CocoBlue_Labels.pdf`
                );


                document.getElementById(
                    "cocoStatus"
                ).textContent =
                    `Generated ${outputPages} page(s).`;

            }
        );

    }


    /* -----------------------------------------------------
       COCO RESET
    ----------------------------------------------------- */

    const cocoReset =
        document.getElementById(
            "cocoReset"
        );


    if (cocoReset) {

        cocoReset.addEventListener(
            "click",
            () => {

                cocoPOInputs.forEach(
                    input =>
                        input.value = ""
                );


                cocoExcelPOs = [];


                if (cocoExcel) {
                    cocoExcel.value = "";
                }


                if (cocoExcelStatus) {

                    cocoExcelStatus.textContent =
                        "No file selected";

                }


                updateCocoPreview();

            }
        );

    }


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
            `${document.getElementById(
                "cocoAddressFontSize"
            ).value}px`;


        preview.style.border =
            document.getElementById(
                "cocoAddressBorder"
            ).checked
                ? getCssBorder(
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

                const PDF =
                    getPDFConstructor();


                if (!PDF) {
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


                if (!from || !to) {

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
                        "Please select a valid page size."
                    );

                    return;

                }


                const pdf =
                    new PDF({

                        orientation:
                            getPDFOrientation(
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


                drawPDFBorder(
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


                pdf.save(
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


                updateCocoAddress();

            }
        );


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
       OTHER PO
    ====================================================== */

    let otherInputMode =
        "manual";

    let otherSize =
        "4x6";

    let otherAddressSize =
        "4x6";

    let otherExcelPOs =
        [];


    function getOtherPOs() {

        if (
            otherInputMode ===
            "excel"
        ) {

            return [
                ...otherExcelPOs
            ];

        }


        return readInputs(
            ".other-po"
        );

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


                if (!hasXLSX()) {
                    return;
                }


                try {

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
                                header: 1,
                                defval: ""
                            }
                        );


                    otherExcelPOs =
                        [];


                    rows.forEach(
                        (
                            row,
                            index
                        ) => {

                            if (
                                !row ||
                                !row[0]
                            ) {
                                return;
                            }


                            const value =
                                String(
                                    row[0]
                                ).trim();


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

                }
                catch (error) {

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


    function getOtherLayout() {

        const checked =
            document.querySelector(
                'input[name="otherLayout"]:checked'
            );


        return checked
            ? checked.value
            : "same";

    }


    function updateOtherPreview() {

        const pos =
            getOtherPOs();


        const labels =
            Number(
                document.getElementById(
                    "otherLabelsPerPage"
                ).value
            ) || 1;


        const pages =
            Number(
                document.getElementById(
                    "otherPageCount"
                ).value
            ) || 1;


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


        let totalPages = 1;


        if (
            getOtherLayout() ===
            "same"
        ) {

            totalPages =
                Math.max(
                    1,
                    pos.length *
                    pages
                );

        }
        else {

            const boxCount =
                Math.max(
                    0,
                    end - start + 1
                );


            totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        (
                            Math.max(
                                1,
                                pos.length
                            ) *
                            boxCount
                        ) /
                        labels
                    )
                );

        }


        document.getElementById(
            "otherPreviewPO"
        ).textContent =
            pos[0] ||
            "BWG123";


        document.getElementById(
            "otherPreviewBox"
        ).textContent =
            `BOX ${start}`;


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


        document.getElementById(
            "otherSizeSummary"
        ).textContent =
            page
                ? page.label
                : "Custom";


        document.getElementById(
            "otherLabelsSummary"
        ).textContent =
            labels;


        document.getElementById(
            "otherPagesSummary"
        ).textContent =
            totalPages;


        document.getElementById(
            "otherPreview"
        ).style.border =
            document.getElementById(
                "otherBorder"
            ).checked
                ? getCssBorder(
                    document.getElementById(
                        "otherBorderStyle"
                    ).value
                )
                : "none";

    }


    [
        "otherCustomWidth",
        "otherCustomHeight",
        "otherStartBox",
        "otherEndBox",
        "otherLabelsPerPage",
        "otherPageCount",
        "otherBorder",
        "otherBorderStyle",
        "otherFont",
        "otherFontSize"
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
                updateOtherPreview
            );


            element.addEventListener(
                "change",
                updateOtherPreview
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


    /* -----------------------------------------------------
       OTHER PDF
    ----------------------------------------------------- */

    document
        .getElementById(
            "otherGenerate"
        )
        .addEventListener(
            "click",
            () => {

                const PDF =
                    getPDFConstructor();


                if (!PDF) {
                    return;
                }


                const pos =
                    getOtherPOs();


                if (!pos.length) {

                    alert(
                        "Please enter at least one PO."
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


                const labels =
                    Number(
                        document.getElementById(
                            "otherLabelsPerPage"
                        ).value
                    ) || 1;


                const pages =
                    Number(
                        document.getElementById(
                            "otherPageCount"
                        ).value
                    ) || 1;


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


                const layout =
                    getOtherLayout();


                const pdf =
                    new PDF({

                        orientation:
                            getPDFOrientation(
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


                const outputPages =
                    [];


                if (
                    layout ===
                    "same"
                ) {

                    pos.forEach(
                        po => {

                            for (
                                let p = 0;
                                p < pages;
                                p++
                            ) {

                                outputPages.push(
                                    Array.from(
                                        {
                                            length:
                                                labels
                                        },
                                        () => ({
                                            po,
                                            box:
                                                start
                                        })
                                    )
                                );

                            }

                        }
                    );

                }
                else {

                    pos.forEach(
                        po => {

                            let current =
                                start;


                            while (
                                current <= end
                            ) {

                                const pageLabels =
                                    [];


                                while (
                                    pageLabels.length <
                                    labels &&
                                    current <= end
                                ) {

                                    pageLabels.push({
                                        po,
                                        box:
                                            current
                                    });


                                    current++;

                                }


                                outputPages.push(
                                    pageLabels
                                );

                            }

                        }
                    );

                }


                outputPages.forEach(
                    (
                        pageLabels,
                        index
                    ) => {

                        if (
                            index > 0
                        ) {

                            pdf.addPage(
                                [
                                    page.width,
                                    page.height
                                ],
                                getPDFOrientation(
                                    page
                                )
                            );

                        }


                        drawPDFBorder(
                            pdf,
                            page.width,
                            page.height,
                            document.getElementById(
                                "otherBorder"
                            ).checked,
                            document.getElementById(
                                "otherBorderStyle"
                            ).value
                        );


                        const [
                            rows,
                            columns
                        ] =
                            getGrid(
                                pageLabels.length
                            );


                        const cellWidth =
                            page.width /
                            columns;


                        const cellHeight =
                            page.height /
                            rows;


                        const font =
                            pdfFont(
                                document.getElementById(
                                    "otherFont"
                                ).value
                            );


                        const fontSize =
                            Number(
                                document.getElementById(
                                    "otherFontSize"
                                ).value
                            ) || 10;


                        pageLabels.forEach(
                            (
                                item,
                                i
                            ) => {

                                const row =
                                    Math.floor(
                                        i /
                                        columns
                                    );


                                const col =
                                    i %
                                    columns;


                                const centerX =
                                    col *
                                    cellWidth +
                                    cellWidth /
                                    2;


                                const centerY =
                                    row *
                                    cellHeight +
                                    cellHeight /
                                    2;


                                pdf.setFont(
                                    font,
                                    "bold"
                                );


                                pdf.setFontSize(
                                    fontSize
                                );


                                pdf.text(
                                    String(
                                        item.po
                                    ),
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
                                        fontSize +
                                        8
                                    )
                                );


                                pdf.text(
                                    `BOX ${item.box}`,
                                    centerX,
                                    centerY + 10,
                                    {
                                        align:
                                            "center"
                                    }
                                );

                            }
                        );

                    }
                );


                pdf.save(
                    `${safeName(
                        pos[0]
                    )}_Other_PO_Labels.pdf`
                );


                document.getElementById(
                    "otherStatus"
                ).textContent =
                    `Generated ${outputPages.length} page(s).`;

            }
        );


    /* -----------------------------------------------------
       OTHER ADDRESS
    ----------------------------------------------------- */

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
            from ||
            "FROM";


        document.getElementById(
            "otherToPreview"
        ).textContent =
            to ||
            "TO";


        document.getElementById(
            "otherAddressPreview"
        ).style.border =
            document.getElementById(
                "otherAddressBorder"
            ).checked
                ? getCssBorder(
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

                const PDF =
                    getPDFConstructor();


                if (!PDF) {
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


                if (!from || !to) {

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
                        "Please select a valid page size."
                    );

                    return;

                }


                const pdf =
                    new PDF({

                        orientation:
                            getPDFOrientation(
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


                drawPDFBorder(
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


                pdf.save(
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


                updateOtherAddress();

            }
        );


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
       ISBN BARCODE
    ====================================================== */

    let isbnInputMode =
        "manual";


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


    function cleanISBN(
        value
    ) {

        return String(
            value || ""
        )
        .replace(
            /[^0-9Xx]/g,
            ""
        );

    }


    function toISBN13(
        value
    ) {

        const clean =
            cleanISBN(
                value
            );


        if (
            /^\d{13}$/.test(
                clean
            )
        ) {

            return clean;

        }


        if (
            clean.length === 10
        ) {

            const base =
                "978" +
                clean.substring(
                    0,
                    9
                );


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
                String(
                    check
                )
            );

        }


        return null;

    }


    function validISBN13(
        isbn
    ) {

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


    const parityMap = {

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


    function eanPattern(
        isbn
    ) {

        let pattern =
            "101";


        const parity =
            parityMap[
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


            pattern +=
                parity[i - 1] ===
                "L"
                    ? L[digit]
                    : G[digit];

        }


        pattern +=
            "01010";


        for (
            let i = 7;
            i <= 12;
            i++
        ) {

            pattern +=
                R[
                    Number(
                        isbn[i]
                    )
                ];

        }


        pattern +=
            "101";


        return pattern;

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
                pattern[i] ===
                "1"
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


        const result = [];


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

                    result.push({

                        isbn,

                        title,

                        edition:
                            edition ||
                            "N"

                    });

                }

            }
        );


        return result;

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


                if (!hasXLSX()) {
                    return;
                }


                try {

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
                                header: 1,
                                defval: ""
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
                                    row[0] ||
                                    ""
                                ).trim();


                            const title =
                                String(
                                    row[1] ||
                                    ""
                                ).trim();


                            const edition =
                                String(
                                    row[2] ||
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
                catch(error) {

                    console.error(error);

                    alert(
                        "Unable to read ISBN Excel file."
                    );

                }

            }
        );


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
            toISBN13(
                row.isbn
            );


        number.textContent =
            isbn13 ||
            row.isbn ||
            "9780000000000";


        title.textContent =
            row.title ||
            "Book Title";


        edition.textContent =
            row.edition ||
            "N";


        barcode.innerHTML =
            "";


        if (
            isbn13 &&
            validISBN13(
                isbn13
            )
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


    [
        ...document.querySelectorAll(
            ".isbn-manual"
        ),
        ...document.querySelectorAll(
            ".title-manual"
        ),
        ...document.querySelectorAll(
            ".edition-manual"
        )
    ]
    .forEach(
        input => {

            input.addEventListener(
                "input",
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

                const PDF =
                    getPDFConstructor();


                if (!PDF) {
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


                const validated =
                    [];


                for (
                    const row
                    of rows
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
                        toISBN13(
                            row.isbn
                        );


                    if (
                        !isbn13 ||
                        !validISBN13(
                            isbn13
                        )
                    ) {

                        alert(
                            `Invalid ISBN: ${row.isbn}`
                        );

                        return;

                    }


                    validated.push({

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
                        document.getElementById(
                            "isbnPageSize"
                        ).value
                    );


                if (!page) {

                    alert(
                        "Invalid page size."
                    );

                    return;

                }


                const labels =
                    Number(
                        document.getElementById(
                            "isbnLabelsPerPage"
                        ).value
                    ) || 1;


                const pdf =
                    new PDF({

                        orientation:
                            getPDFOrientation(
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


                let generatedPages =
                    0;


                for (
                    let start = 0;
                    start <
                    validated.length;
                    start += labels
                ) {

                    const pageRows =
                        validated.slice(
                            start,
                            start + labels
                        );


                    if (
                        generatedPages >
                        0
                    ) {

                        pdf.addPage(
                            [
                                page.width,
                                page.height
                            ],
                            getPDFOrientation(
                                page
                            )
                        );

                    }


                    drawPDFBorder(
                        pdf,
                        page.width,
                        page.height,
                        border,
                        borderStyle
                    );


                    const [
                        rowsGrid,
                        columnsGrid
                    ] =
                        getGrid(
                            pageRows.length
                        );


                    const cellWidth =
                        page.width /
                        columnsGrid;


                    const cellHeight =
                        page.height /
                        rowsGrid;


                    pageRows.forEach(
                        (
                            row,
                            index
                        ) => {

                            const r =
                                Math.floor(
                                    index /
                                    columnsGrid
                                );


                            const c =
                                index %
                                columnsGrid;


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
                                    28,
                                    cellHeight * 0.28
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
                                    cellWidth /
                                    2,
                                y +
                                    barcodeHeight +
                                    14,
                                {
                                    align:
                                        "center"
                                }
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
                                    cellWidth /
                                    2,
                                y +
                                    barcodeHeight +
                                    21,
                                {
                                    align:
                                        "center"
                                }
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
                                    cellWidth /
                                    2,
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


                    generatedPages++;

                }


                pdf.save(
                    "BooksWagon_ISBN_Barcodes.pdf"
                );


                document.getElementById(
                    "isbnStatus"
                ).textContent =
                    `Generated ${validated.length} barcode label(s).`;

            }
        );


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
                        element =>
                            element.value =
                            ""
                    );


                document
                    .querySelectorAll(
                        ".title-manual"
                    )
                    .forEach(
                        element =>
                            element.value =
                            ""
                    );


                document
                    .querySelectorAll(
                        ".edition-manual"
                    )
                    .forEach(
                        element =>
                            element.value =
                            ""
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
       TOOL TABS INITIAL STATE
    ====================================================== */

    updateCocoPreview();
    updateCocoAddress();
    updateOtherPreview();
    updateOtherAddress();
    updateISBNPreview();


    /* =====================================================
       DEBUG MESSAGE
    ====================================================== */

    console.log(
        "BooksWagon Label Studio loaded successfully."
    );

});
