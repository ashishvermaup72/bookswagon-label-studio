const { jsPDF } = window.jspdf;


/* =========================================================
   GLOBAL
========================================================= */

let activeTool = null;

let cocoInputMode = "manual";
let cocoSize = "4x6";
let cocoAddressSize = "4x6";

let otherInputMode = "manual";
let otherSize = "4x6";
let otherAddressSize = "4x6";

let isbnInputMode = "manual";
let isbnSize = "4x6";


/* =========================================================
   HELPERS
========================================================= */

function pageSize(type, customW, customH) {

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

        const width = Number(customW);
        const height = Number(customH);

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


function pdfFont(font) {

    if (font === "Georgia") {
        return "times";
    }

    if (font === "Times New Roman") {
        return "times";
    }

    if (font === "Courier New") {
        return "courier";
    }

    return "helvetica";
}


function safeName(value) {

    return String(value)
        .replace(/[^a-zA-Z0-9_-]/g, "_");
}


function gridFor(count) {

    const grids = {
        1: [1,1],
        2: [1,2],
        3: [1,3],
        4: [2,2],
        5: [2,3],
        6: [2,3],
        7: [2,4],
        8: [2,4],
        9: [3,3],
        10: [2,5]
    };

    return grids[count] || [2,5];
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

    const map = {

        "solid-dark": [0.8,25],
        "solid-medium": [0.5,80],
        "solid-light": [0.25,160],
        "double": [0.5,45],
        "dashed": [0.4,80],
        "dotted": [0.4,80],
        "bold": [1.4,10]

    };

    const config =
        map[style] ||
        map["solid-dark"];

    pdf.setLineWidth(config[0]);

    pdf.setDrawColor(
        config[1],
        config[1],
        config[1]
    );

    if (style === "dashed") {
        pdf.setLineDashPattern([2,2],0);
    }

    if (style === "dotted") {
        pdf.setLineDashPattern([0.5,1.5],0);
    }

    pdf.rect(
        3,
        3,
        width - 6,
        height - 6
    );

    if (style === "double") {

        pdf.setLineDashPattern([],0);

        pdf.setLineWidth(.25);

        pdf.rect(
            6,
            6,
            width - 12,
            height - 12
        );
    }

    pdf.setLineDashPattern([],0);
}


function getManualValues(selector) {

    return Array.from(
        document.querySelectorAll(selector)
    )
    .map(el => el.value.trim())
    .filter(Boolean);
}


/* =========================================================
   TOOL OPEN/CLOSE
========================================================= */

function showWorkspace(id) {

    document.querySelectorAll(
        ".tool-workspace"
    ).forEach(
        ws => ws.style.display = "none"
    );

    const target =
        document.getElementById(id);

    if (!target) {
        return;
    }

    target.style.display = "block";

    document
        .getElementById("workspaceSection")
        .scrollIntoView({
            behavior: "smooth"
        });

    activeTool = id;
}


document
    .querySelectorAll("[data-open-tool]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const tool =
                        button.dataset.openTool;

                    if (tool === "cocoblue") {
                        showWorkspace(
                            "cocoblueWorkspace"
                        );
                    }

                    if (tool === "otherpo") {
                        showWorkspace(
                            "otherpoWorkspace"
                        );
                    }

                    if (tool === "isbn") {
                        showWorkspace(
                            "isbnWorkspace"
                        );
                    }

                }
            );
        }
    );


document
    .querySelectorAll("[data-close-tool]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document.querySelectorAll(
                        ".tool-workspace"
                    ).forEach(
                        ws => ws.style.display = "none"
                    );

                    document
                        .getElementById("tools")
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );
        }
    );


/* =========================================================
   COCOBLUE
========================================================= */

const cocoPOInputs =
    document.querySelectorAll(".coco-po");

const cocoExcel =
    document.getElementById("cocoExcel");

const cocoExcelStatus =
    document.getElementById("cocoExcelStatus");

let cocoExcelPOs = [];


document
    .querySelectorAll("[data-coco-input]")
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
                            x =>
                                x.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add("active");

                    cocoInputMode =
                        button.dataset.cocoInput;

                    document
                        .getElementById("cocoManualArea")
                        .classList.toggle(
                            "hidden",
                            cocoInputMode !== "manual"
                        );

                    document
                        .getElementById("cocoExcelArea")
                        .classList.toggle(
                            "hidden",
                            cocoInputMode !== "excel"
                        );

                    updateCoco();

                }
            );
        }
    );


function getCocoPOs() {

    if (cocoInputMode === "excel") {
        return [...cocoExcelPOs];
    }

    return getManualValues(".coco-po");
}


cocoExcel.addEventListener(
    "change",
    async event => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        try {

            const buffer =
                await file.arrayBuffer();

            const wb =
                XLSX.read(
                    buffer,
                    {type:"array"}
                );

            const sheet =
                wb.Sheets[
                    wb.SheetNames[0]
                ];

            const rows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    {
                        header:1,
                        defval:""
                    }
                );

            cocoExcelPOs = [];

            rows.forEach(
                (row,index) => {

                    if (!row || !row[0]) {
                        return;
                    }

                    const value =
                        String(row[0]).trim();

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
                        ].includes(normalized)
                    ) {
                        return;
                    }

                    cocoExcelPOs.push(value);

                }
            );

            cocoExcelPOs =
                [...new Set(cocoExcelPOs)];

            cocoExcelStatus.textContent =
                `${cocoExcelPOs.length} PO(s) loaded`;

            updateCoco();

        }
        catch(error) {

            console.error(error);

            cocoExcelStatus.textContent =
                "Excel reading failed";

            alert(
                "Unable to read the Excel file."
            );

        }

    }
);


/* =========================================================
   COCO PAGE SIZE
========================================================= */

document
    .querySelectorAll("[data-coco-size]")
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
                            x =>
                                x.classList.remove("active")
                        );

                    button.classList.add("active");

                    cocoSize =
                        button.dataset.cocoSize;

                    document
                        .getElementById(
                            "cocoCustomSize"
                        )
                        .classList.toggle(
                            "hidden",
                            cocoSize !== "custom"
                        );

                    updateCoco();

                }
            );
        }
    );


/* =========================================================
   COCO STICKER
========================================================= */

[
    ...cocoPOInputs,
    document.getElementById("cocoLabelsPerPage"),
    document.getElementById("cocoPagesPerPO"),
    document.getElementById("cocoCustomWidth"),
    document.getElementById("cocoCustomHeight"),
    document.getElementById("cocoBorder"),
    document.getElementById("cocoBorderStyle"),
    document.getElementById("cocoFont"),
    document.getElementById("cocoFontSize"),
    document.getElementById("cocoFontWeight")
]
.forEach(
    element => {

        element.addEventListener(
            "input",
            updateCoco
        );

        element.addEventListener(
            "change",
            updateCoco
        );

    }
);


function updateCoco() {

    const pos =
        getCocoPOs();

    const labels =
        Number(
            document.getElementById(
                "cocoLabelsPerPage"
            ).value
        ) || 1;

    const pages =
        Number(
            document.getElementById(
                "cocoPagesPerPO"
            ).value
        ) || 1;

    const size =
        pageSize(
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
        pos[0] || "BWG123";


    document.getElementById(
        "cocoLabelsSummary"
    ).textContent =
        labels;


    document.getElementById(
        "cocoPagesSummary"
    ).textContent =
        Math.max(
            1,
            pos.length * pages
        );


    document.getElementById(
        "cocoSizeSummary"
    ).textContent =
        size
            ? size.label
            : "Custom";


    const preview =
        document.getElementById(
            "cocoPreview"
        );


    const fs =
        Number(
            document.getElementById(
                "cocoFontSize"
            ).value
        ) || 10;


    preview.style.fontFamily =
        document.getElementById(
            "cocoFont"
        ).value;

    preview.style.fontSize =
        `${fs}px`;

    preview.style.fontWeight =
        document.getElementById(
            "cocoFontWeight"
        ).value;


    preview.style.border =
        document.getElementById(
            "cocoBorder"
        ).checked
            ? getCssBorder(
                document.getElementById(
                    "cocoBorderStyle"
                ).value
            )
            : "none";


    document.getElementById(
        "cocoSummary"
    ).textContent =
        `${Math.max(
            1,
            pos.length * pages
        )} pages`;

}


function getCssBorder(style) {

    const map = {

        "solid-dark": "3px solid #1c1c1a",
        "solid-medium": "2px solid #555",
        "solid-light": "1px solid #aaa",
        "double": "4px double #333",
        "dashed": "2px dashed #555",
        "dotted": "2px dotted #555",
        "bold": "5px solid #111"

    };

    return map[style] || map["solid-dark"];
}


/* =========================================================
   COCO ADDRESS
========================================================= */

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
                            x =>
                                x.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add("active");

                    cocoAddressSize =
                        button.dataset.cocoAddressSize;

                }
            );
        }
    );


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

        document
            .getElementById(id)
            .addEventListener(
                "input",
                updateCocoAddress
            );

        document
            .getElementById(id)
            .addEventListener(
                "change",
                updateCocoAddress
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


function generateAddressPDF(
    from,
    to,
    size,
    borderEnabled,
    borderStyle,
    font,
    fontSize,
    filename
) {

    const orientation =
        size.width > size.height
            ? "landscape"
            : "portrait";

    const pdf =
        new jsPDF({
            orientation,
            unit:"mm",
            format:[
                size.width,
                size.height
            ]
        });


    drawBorder(
        pdf,
        size.width,
        size.height,
        borderEnabled,
        borderStyle
    );


    pdf.setFont(
        pdfFont(font),
        "normal"
    );

    pdf.setFontSize(
        Number(fontSize) || 10
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
            size.width - 20
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
            size.width - 20
        );


    pdf.text(
        toLines,
        10,
        y
    );


    pdf.save(filename);
}


document
    .getElementById("cocoAddressGenerate")
    .addEventListener(
        "click",
        () => {

            const from =
                document
                    .getElementById("cocoFrom")
                    .value.trim();

            const to =
                document
                    .getElementById("cocoTo")
                    .value.trim();

            if (!from || !to) {

                alert(
                    "From Address and To Address are mandatory."
                );

                return;
            }


            const size =
                cocoAddressSize === "custom"
                    ? {
                        width: 101.6,
                        height: 152.4,
                        label: "Custom"
                    }
                    : pageSize(
                        cocoAddressSize
                    );


            generateAddressPDF(
                from,
                to,
                size,
                document.getElementById(
                    "cocoAddressBorder"
                ).checked,
                document.getElementById(
                    "cocoAddressBorderStyle"
                ).value,
                document.getElementById(
                    "cocoAddressFont"
                ).value,
                document.getElementById(
                    "cocoAddressFontSize"
                ).value,
                "CocoBlue_Address_Label.pdf"
            );


            document.getElementById(
                "cocoAddressStatus"
            ).textContent =
                "PDF generated successfully.";

        }
    );


document
    .getElementById("cocoAddressReset")
    .addEventListener(
        "click",
        () => {

            document.getElementById("cocoFrom").value = "";
            document.getElementById("cocoTo").value = "";

            document.getElementById(
                "cocoAddressBorder"
            ).checked = false;

            updateCocoAddress();

        }
    );


/* =========================================================
   COCO STICKER PDF
========================================================= */

document
    .getElementById("cocoGenerate")
    .addEventListener(
        "click",
        () => {

            const pos =
                getCocoPOs();

            if (!pos.length) {

                alert(
                    "Please enter at least one PO."
                );

                return;
            }


            const size =
                pageSize(
                    cocoSize,
                    document.getElementById(
                        "cocoCustomWidth"
                    ).value,
                    document.getElementById(
                        "cocoCustomHeight"
                    ).value
                );


            if (!size) {

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
                );

            const pages =
                Number(
                    document.getElementById(
                        "cocoPagesPerPO"
                    ).value
                );


            const orientation =
                size.width > size.height
                    ? "landscape"
                    : "portrait";


            const pdf =
                new jsPDF({
                    orientation,
                    unit:"mm",
                    format:[
                        size.width,
                        size.height
                    ]
                });


            let pageIndex = 0;


            pos.forEach(
                po => {

                    for (
                        let p = 0;
                        p < pages;
                        p++
                    ) {

                        if (pageIndex > 0) {

                            pdf.addPage(
                                [
                                    size.width,
                                    size.height
                                ],
                                orientation
                            );

                        }


                        drawBorder(
                            pdf,
                            size.width,
                            size.height,
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
                            gridFor(
                                labels
                            );


                        const cellW =
                            size.width /
                            columns;

                        const cellH =
                            size.height /
                            rows;


                        const font =
                            pdfFont(
                                document.getElementById(
                                    "cocoFont"
                                ).value
                            );


                        const fs =
                            Number(
                                document.getElementById(
                                    "cocoFontSize"
                                ).value
                            ) || 10;


                        for (
                            let i = 0;
                            i < labels;
                            i++
                        ) {

                            const row =
                                Math.floor(
                                    i / columns
                                );

                            const col =
                                i % columns;


                            const x =
                                col * cellW;

                            const y =
                                row * cellH;


                            pdf.setFont(
                                font,
                                document.getElementById(
                                    "cocoFontWeight"
                                ).value
                            );


                            pdf.setFontSize(fs);


                            pdf.text(
                                String(po),
                                x + cellW/2,
                                y + cellH/2,
                                {
                                    align:"center"
                                }
                            );

                        }


                        pageIndex++;

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
                `Generated ${pageIndex} PDF page(s).`;

        }
    );


document
    .getElementById("cocoReset")
    .addEventListener(
        "click",
        () => {

            cocoPOInputs.forEach(
                input =>
                    input.value = ""
            );

            cocoExcelPOs = [];

            cocoExcel.value = "";

            cocoExcelStatus.textContent =
                "No file selected";

            updateCoco();

        }
    );


/* =========================================================
   COCO TAB SWITCH
========================================================= */

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
                            x =>
                                x.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add("active");

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
   OTHER PO
========================================================= */

let otherExcelPOs = [];


function getOtherPOs() {

    if (otherInputMode === "excel") {
        return [...otherExcelPOs];
    }

    return getManualValues(".other-po");
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
                            x =>
                                x.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add("active");

                    otherInputMode =
                        button.dataset.otherInput;

                    document
                        .getElementById(
                            "otherManualArea"
                        )
                        .classList.toggle(
                            "hidden",
                            otherInputMode !== "manual"
                        );

                    document
                        .getElementById(
                            "otherExcelArea"
                        )
                        .classList.toggle(
                            "hidden",
                            otherInputMode !== "excel"
                        );

                }
            );
        }
    );


document
    .getElementById("otherExcel")
    .addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];

            if (!file) return;


            try {

                const buffer =
                    await file.arrayBuffer();

                const wb =
                    XLSX.read(
                        buffer,
                        {type:"array"}
                    );

                const sheet =
                    wb.Sheets[
                        wb.SheetNames[0]
                    ];

                const rows =
                    XLSX.utils.sheet_to_json(
                        sheet,
                        {
                            header:1,
                            defval:""
                        }
                    );


                otherExcelPOs = [];


                rows.forEach(
                    (row,index) => {

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
                                "po no."
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


                document
                    .getElementById(
                        "otherExcelStatus"
                    )
                    .textContent =
                    `${otherExcelPOs.length} PO(s) loaded`;

                updateOther();

            }
            catch(error) {

                console.error(error);

                alert(
                    "Unable to read the Excel file."
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
                            x =>
                                x.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add("active");

                    otherSize =
                        button.dataset.otherSize;

                    document
                        .getElementById(
                            "otherCustomSize"
                        )
                        .classList.toggle(
                            "hidden",
                            otherSize !== "custom"
                        );

                    updateOther();

                }
            );
        }
    );


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

        document
            .getElementById(id)
            .addEventListener(
                "input",
                updateOther
            );

        document
            .getElementById(id)
            .addEventListener(
                "change",
                updateOther
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
                () => {

                    updateOther();

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


function updateOther() {

    const pos =
        getOtherPOs();

    const labels =
        Number(
            document.getElementById(
                "otherLabelsPerPage"
            ).value
        );

    const pages =
        Number(
            document.getElementById(
                "otherPageCount"
            ).value
        );


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


    let totalPages;


    if (
        getOtherLayout() === "same"
    ) {

        totalPages =
            Math.max(
                1,
                pos.length * pages
            );

    }
    else {

        const boxCount =
            Math.max(
                0,
                end - start + 1
            );

        totalPages =
            Math.ceil(
                (
                    Math.max(
                        1,
                        pos.length
                    ) *
                    boxCount
                ) /
                labels
            );

    }


    document.getElementById(
        "otherPreviewPO"
    ).textContent =
        pos[0] || "BWG123";


    document.getElementById(
        "otherPreviewBox"
    ).textContent =
        `BOX ${start}`;


    const size =
        pageSize(
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
        size
            ? size.label
            : "Custom";


    document.getElementById(
        "otherLabelsSummary"
    ).textContent =
        labels;


    document.getElementById(
        "otherPagesSummary"
    ).textContent =
        totalPages;


    const preview =
        document.getElementById(
            "otherPreview"
        );


    preview.style.border =
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


document
    .getElementById("otherGenerate")
    .addEventListener(
        "click",
        generateOtherPDF
    );


function generateOtherPDF() {

    const pos =
        getOtherPOs();

    if (!pos.length) {

        alert(
            "Please enter at least one PO."
        );

        return;

    }


    const size =
        pageSize(
            otherSize,
            document.getElementById(
                "otherCustomWidth"
            ).value,
            document.getElementById(
                "otherCustomHeight"
            ).value
        );


    if (!size) {

        alert(
            "Please select a valid page size."
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


    const labels =
        Number(
            document.getElementById(
                "otherLabelsPerPage"
            ).value
        );


    const pages =
        Number(
            document.getElementById(
                "otherPageCount"
            ).value
        );


    const mode =
        getOtherLayout();


    const orientation =
        size.width > size.height
            ? "landscape"
            : "portrait";


    const pdf =
        new jsPDF({
            orientation,
            unit:"mm",
            format:[
                size.width,
                size.height
            ]
        });


    const font =
        pdfFont(
            document.getElementById(
                "otherFont"
            ).value
        );


    const fs =
        Number(
            document.getElementById(
                "otherFontSize"
            ).value
        );


    const border =
        document.getElementById(
            "otherBorder"
        ).checked;


    const borderStyle =
        document.getElementById(
            "otherBorderStyle"
        ).value;


    let pdfPages = [];


    if (mode === "same") {

        pos.forEach(
            po => {

                for (
                    let p=0;
                    p<pages;
                    p++
                ) {

                    pdfPages.push(
                        Array.from(
                            {length:labels},
                            () => ({
                                po,
                                box:start
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

                let box = start;

                while (
                    box <= end
                ) {

                    const pageLabels = [];

                    while (
                        pageLabels.length <
                        labels &&
                        box <= end
                    ) {

                        pageLabels.push({
                            po,
                            box
                        });

                        box++;

                    }

                    pdfPages.push(
                        pageLabels
                    );

                }

            }
        );

    }


    pdfPages.forEach(
        (pageLabels,index) => {

            if (index > 0) {

                pdf.addPage(
                    [
                        size.width,
                        size.height
                    ],
                    orientation
                );

            }


            drawBorder(
                pdf,
                size.width,
                size.height,
                border,
                borderStyle
            );


            const [
                rows,
                columns
            ] =
                gridFor(
                    pageLabels.length
                );


            const cellW =
                size.width / columns;

            const cellH =
                size.height / rows;


            pageLabels.forEach(
                (label,i) => {

                    const row =
                        Math.floor(
                            i / columns
                        );

                    const col =
                        i % columns;


                    pdf.setFont(
                        font,
                        "bold"
                    );

                    pdf.setFontSize(
                        fs
                    );


                    pdf.text(
                        String(label.po),
                        col*cellW + cellW/2,
                        row*cellH + cellH*.45,
                        {
                            align:"center"
                        }
                    );


                    pdf.setFontSize(
                        Math.min(
                            40,
                            fs+8
                        )
                    );


                    pdf.text(
                        `BOX ${label.box}`,
                        col*cellW + cellW/2,
                        row*cellH + cellH*.60,
                        {
                            align:"center"
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
        `Generated ${pdfPages.length} page(s).`;

}


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

            updateOther();

        }
    );


/* =========================================================
   OTHER ADDRESS
========================================================= */

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
                            x =>
                                x.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add("active");

                    otherAddressSize =
                        button.dataset.otherAddressSize;

                }
            );

        }
    );


function updateOtherAddress() {

    const from =
        document
            .getElementById(
                "otherFrom"
            )
            .value.trim();

    const to =
        document
            .getElementById(
                "otherTo"
            )
            .value.trim();


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

        document
            .getElementById(id)
            .addEventListener(
                "input",
                updateOtherAddress
            );

        document
            .getElementById(id)
            .addEventListener(
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


            const size =
                pageSize(
                    otherAddressSize
                );


            generateAddressPDF(
                from,
                to,
                size,
                document.getElementById(
                    "otherAddressBorder"
                ).checked,
                document.getElementById(
                    "otherAddressBorderStyle"
                ).value,
                document.getElementById(
                    "otherAddressFont"
                ).value,
                document.getElementById(
                    "otherAddressFontSize"
                ).value,
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

            updateOtherAddress();

        }
    );


/* =========================================================
   OTHER TABS
========================================================= */

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
                            x =>
                                x.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add("active");


                    document
                        .getElementById(
                            "otherStickerMode"
                        )
                        .classList.toggle(
                            "hidden",
                            button.dataset.otherMode !== "sticker"
                        );


                    document
                        .getElementById(
                            "otherAddressMode"
                        )
                        .classList.toggle(
                            "hidden",
                            button.dataset.otherMode !== "address"
                        );

                }
            );

        }
    );


/* =========================================================
   ISBN
========================================================= */

let isbnRows = [];


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
                            x =>
                                x.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add("active");

                    isbnInputMode =
                        button.dataset.isbnInput;


                    document
                        .getElementById(
                            "isbnManualCard"
                        )
                        .classList.toggle(
                            "hidden",
                            isbnInputMode !== "manual"
                        );


                    document
                        .getElementById(
                            "isbnExcelCard"
                        )
                        .classList.toggle(
                            "hidden",
                            isbnInputMode !== "excel"
                        );

                }
            );

        }
    );


function normalizeISBN(value) {

    return String(value)
        .replace(
            /[^0-9Xx]/g,
            ""
        );

}


function isbnTo13(value) {

    const clean =
        normalizeISBN(value);


    if (
        clean.length === 13 &&
        /^\d{13}$/.test(clean)
    ) {

        return clean;

    }


    if (
        clean.length === 10
    ) {

        const first9 =
            clean.substring(
                0,
                9
            );


        const base =
            "978" +
            first9;


        let sum = 0;


        for (
            let i=0;
            i<12;
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
            ) % 10;


        return (
            base +
            String(check)
        );

    }


    return null;

}


function validateISBN13(
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
        let i=0;
        i<12;
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
        ) % 10;


    return (
        check ===
        Number(
            isbn[12]
        )
    );

}


/* ---------------------------------------------------------
   EAN-13 BARCODE
--------------------------------------------------------- */

const L_PATTERNS = {

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


const G_PATTERNS = {

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


const R_PATTERNS = {

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


function ean13Pattern(
    isbn
) {

    const first =
        Number(
            isbn[0]
        );


    const parity =
        PARITY[first];


    let pattern =
        "101";


    for (
        let i=1;
        i<=6;
        i++
    ) {

        const digit =
            Number(
                isbn[i]
            );


        pattern +=
            parity[i-1] === "L"
                ? L_PATTERNS[digit]
                : G_PATTERNS[digit];

    }


    pattern +=
        "01010";


    for (
        let i=7;
        i<=12;
        i++
    ) {

        pattern +=
            R_PATTERNS[
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
        let i=0;
        i<pattern.length;
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


/* ---------------------------------------------------------
   ISBN DATA
--------------------------------------------------------- */

document
    .querySelectorAll(
        ".isbn-manual,.title-manual,.edition-manual"
    )
    .forEach(
        input => {

            input.addEventListener(
                "input",
                updateISBNPreview
            );

        }
    );


document
    .getElementById(
        "isbnExcel"
    )
    .addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];

            if (!file) return;


            try {

                const buffer =
                    await file.arrayBuffer();

                const wb =
                    XLSX.read(
                        buffer,
                        {type:"array"}
                    );

                const sheet =
                    wb.Sheets[
                        wb.SheetNames[0]
                    ];

                const rows =
                    XLSX.utils.sheet_to_json(
                        sheet,
                        {
                            header:1,
                            defval:""
                        }
                    );


                isbnRows = [];


                rows.forEach(
                    (row,index) => {

                        if (
                            !row ||
                            row.length <
                            2
                        ) {
                            return;
                        }


                        const isbn =
                            String(
                                row[0]
                            ).trim();

                        const title =
                            String(
                                row[1]
                            ).trim();

                        const edition =
                            row.length > 2
                                ? String(
                                    row[2] || ""
                                ).trim()
                                : "";


                        if (
                            index === 0 &&
                            (
                                isbn.toLowerCase() === "isbn" ||
                                title.toLowerCase() === "book name"
                            )
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

            }
            catch(error) {

                console.error(error);

                alert(
                    "Unable to read ISBN Excel file."
                );

            }

        }
    );


function getISBNRows() {

    if (
        isbnInputMode ===
        "excel"
    ) {

        return isbnRows;

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
        (input,index) => {

            const isbn =
                input.value.trim();

            const title =
                titleInputs[index]
                    .value
                    .trim();

            const edition =
                editionInputs[index]
                    .value
                    .trim();


            if (
                isbn ||
                title
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


function updateISBNPreview() {

    const rows =
        getISBNRows();


    if (!rows.length) {

        document.getElementById(
            "isbnPreviewNumber"
        ).textContent =
            "9780000000000";

        document.getElementById(
            "isbnPreviewTitle"
        ).textContent =
            "Book Title";

        document.getElementById(
            "isbnPreviewEdition"
        ).textContent =
            "N";

        return;

    }


    const row =
        rows[0];


    const converted =
        isbnTo13(
            row.isbn
        );


    document.getElementById(
        "isbnPreviewNumber"
    ).textContent =
        converted ||
        row.isbn;


    document.getElementById(
        "isbnPreviewTitle"
    ).textContent =
        row.title ||
        "Book Title";


    document.getElementById(
        "isbnPreviewEdition"
    ).textContent =
        row.edition ||
        "N";


    if (converted) {

        drawPreviewBarcode(
            converted
        );

    }

}


function drawPreviewBarcode(
    isbn
) {

    const container =
        document.getElementById(
            "isbnBarcode"
        );


    container.innerHTML = "";


    if (
        !validateISBN13(
            isbn
        )
    ) {
        return;
    }


    const pattern =
        ean13Pattern(
            isbn
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
                    `${100 /
                    pattern.length}%`;

                bar.style.background =
                    bit === "1"
                        ? "#000"
                        : "transparent";

                container.appendChild(
                    bar
                );

            }
        );

}


/* ---------------------------------------------------------
   ISBN PDF
--------------------------------------------------------- */

document
    .getElementById(
        "isbnPageSize"
    )
    .addEventListener(
        "change",
        event => {

            isbnSize =
                event.target.value;

        }
    );


document
    .getElementById(
        "isbnGenerate"
    )
    .addEventListener(
        "click",
        () => {

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
                    isbnTo13(
                        row.isbn
                    );


                if (
                    !isbn13 ||
                    !validateISBN13(
                        isbn13
                    )
                ) {

                    alert(
                        `Invalid ISBN: ${row.isbn}`
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


            let size =
                pageSize(
                    isbnSize
                );


            if (!size) {

                size = {
                    width:101.6,
                    height:152.4,
                    label:"4 × 6 inch"
                };

            }


            const labelsPerPage =
                Number(
                    document.getElementById(
                        "isbnLabelsPerPage"
                    ).value
                );


            const orientation =
                size.width > size.height
                    ? "landscape"
                    : "portrait";


            const pdf =
                new jsPDF({
                    orientation,
                    unit:"mm",
                    format:[
                        size.width,
                        size.height
                    ]
                });


            const border =
                document.getElementById(
                    "isbnBorder"
                ).checked;


            const borderStyle =
                document.getElementById(
                    "isbnBorderStyle"
                ).value;


            const fontSize =
                Number(
                    document.getElementById(
                        "isbnFontSize"
                    ).value
                );


            let pageIndex = 0;


            for (
                let start = 0;
                start < validRows.length;
                start += labelsPerPage
            ) {

                const pageRows =
                    validRows.slice(
                        start,
                        start +
                        labelsPerPage
                    );


                if (
                    pageIndex > 0
                ) {

                    pdf.addPage(
                        [
                            size.width,
                            size.height
                        ],
                        orientation
                    );

                }


                drawBorder(
                    pdf,
                    size.width,
                    size.height,
                    border,
                    borderStyle
                );


                const [
                    rowsGrid,
                    columnsGrid
                ] =
                    gridFor(
                        pageRows.length
                    );


                const cellWidth =
                    size.width /
                    columnsGrid;

                const cellHeight =
                    size.height /
                    rowsGrid;


                pageRows.forEach(
                    (row,index) => {

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
                                cellWidth -
                                12,
                                55
                            );


                        const barcodeHeight =
                            Math.min(
                                cellHeight *
                                .28,
                                28
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
                                10,
                                fontSize
                            )
                        );


                        pdf.text(
                            row.isbn,
                            x +
                                cellWidth/2,
                            y +
                                barcodeHeight +
                                14,
                            {
                                align:"center"
                            }
                        );


                        pdf.setFontSize(
                            Math.min(
                                14,
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
                                cellWidth/2,
                            y +
                                barcodeHeight +
                                22,
                            {
                                align:"center"
                            }
                        );


                        pdf.setFontSize(
                            Math.min(
                                11,
                                fontSize
                            )
                        );


                        pdf.text(
                            `Edition: ${
                                row.edition ||
                                "N"
                            }`,
                            x +
                                cellWidth/2,
                            y +
                                cellHeight -
                                8,
                            {
                                align:"center"
                            }
                        );

                    }
                );


                pageIndex++;

            }


            pdf.save(
                "BooksWagon_ISBN_Barcodes.pdf"
            );


            document.getElementById(
                "isbnStatus"
            ).textContent =
                `Generated ${validRows.length} barcode label(s).`;

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
                    x =>
                        x.value = ""
                );

            document
                .querySelectorAll(
                    ".title-manual"
                )
                .forEach(
                    x =>
                        x.value = ""
                );

            document
                .querySelectorAll(
                    ".edition-manual"
                )
                .forEach(
                    x =>
                        x.value = ""
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
========================================================= */

updateCoco();

updateCocoAddress();

updateOther();

updateOtherAddress();

updateISBNPreview();
