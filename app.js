"use strict";


/* =========================================================
   GLOBAL
========================================================= */

const state = {

    tool: "coco",

    coco: {
        mode: "manual",
        content: "combined",
        layout: "separate",
        excel: []
    },

    other: {
        mode: "manual",
        excel: []
    },

    isbn: {
        mode: "manual",
        excel: []
    },

    address: {
        mode: "manual",
        excel: []
    }

};


const $ = id =>
    document.getElementById(id);


const exists = id =>
    !!$(id);


function val(id, fallback = "") {

    const el = $(id);

    return el
        ? String(el.value || "").trim()
        : fallback;

}


function esc(text) {

    return String(text ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   TOAST
========================================================= */

function notify(message, type = "green") {

    const container =
        $("toastContainer");

    if (!container) return;


    const item =
        document.createElement("div");

    item.className =
        `toast ${type}`;


    item.innerHTML = `

        <div class="toast-icon">
            ${type === "green" ? "✓" : "!"}
        </div>

        <div>

            <strong>
                ${
                    type === "green"
                    ? "This feature has been enabled"
                    : "This feature has been disabled"
                }
            </strong>

            <span>
                ${esc(message)}
            </span>

        </div>

    `;


    container.appendChild(item);


    setTimeout(() => {

        item.style.opacity = "0";

        item.style.transform =
            "translateX(100%)";

        setTimeout(
            () => item.remove(),
            250
        );

    }, 2300);

}


/* =========================================================
   TOOL SWITCH
========================================================= */

document
.querySelectorAll(".tool")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const tool =
                button.dataset.tool;

            state.tool =
                tool;


            document
            .querySelectorAll(".tool")
            .forEach(btn => {

                btn.classList.toggle(
                    "active",
                    btn === button
                );

            });


            document
            .querySelectorAll(".panel")
            .forEach(panel => {

                panel.classList.toggle(
                    "active",
                    panel.id ===
                    `${tool}Panel`
                );

            });


            notify(
                `${button.querySelector("strong")?.textContent || tool} opened.`,
                "green"
            );

        }
    );

});


/* =========================================================
   MANUAL INPUTS
========================================================= */

function createInputs(
    containerId,
    className,
    label
) {

    const container =
        $(containerId);

    if (!container) return;


    container.innerHTML = "";


    for (
        let i = 1;
        i <= 20;
        i++
    ) {

        const field =
            document.createElement("div");

        field.className =
            "field";


        field.innerHTML = `

            <label>
                ${label} ${i}
            </label>

            <input
                class="${className}"
                placeholder="Enter ${label}"
            >

        `;


        container.appendChild(field);

    }

}


createInputs(
    "cocoManualInputs",
    "coco-po",
    "PO"
);


createInputs(
    "otherManualInputs",
    "other-po",
    "PO"
);


createInputs(
    "isbnManualInputs",
    "isbn-value",
    "ISBN"
);


/* =========================================================
   MODE SWITCH
========================================================= */

function setupModes(
    selector,
    dataAttr,
    toolState,
    prefixes
) {

    document
    .querySelectorAll(selector)
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mode =
                    button.getAttribute(
                        dataAttr
                    );


                toolState.mode =
                    mode;


                document
                .querySelectorAll(
                    selector
                )
                .forEach(btn => {

                    btn.classList.toggle(
                        "active",
                        btn === button
                    );

                });


                prefixes
                .forEach(prefix => {

                    const element =
                        $(
                            prefix +
                            mode.charAt(0)
                            .toUpperCase() +
                            mode.slice(1)
                        );

                    if (!element) return;

                    element.classList.add(
                        "active"
                    );

                });


                prefixes
                .forEach(prefix => {

                    [
                        "Manual",
                        "Bulk",
                        "Excel"
                    ]
                    .forEach(name => {

                        const element =
                            $(
                                prefix +
                                name
                            );

                        if (!element)
                            return;

                        const current =
                            name
                            .toLowerCase();

                        element.classList.toggle(
                            "active",
                            current === mode
                        );

                    });

                });


                notify(
                    `${mode.toUpperCase()} mode enabled.`,
                    "green"
                );


                renderAll();

            }
        );

    });

}


setupModes(
    '[data-coco-mode]',
    "data-coco-mode",
    state.coco,
    ["coco"]
);


setupModes(
    '[data-other-mode]',
    "data-other-mode",
    state.other,
    ["other"]
);


setupModes(
    '[data-isbn-mode]',
    "data-isbn-mode",
    state.isbn,
    ["isbn"]
);


setupModes(
    '[data-address-mode]',
    "data-address-mode",
    state.address,
    ["address"]
);


/* =========================================================
   COCO CONTENT
========================================================= */

document
.querySelectorAll(
    'input[name="cocoContent"]'
)
.forEach(input => {

    input.addEventListener(
        "change",
        () => {

            if (!input.checked)
                return;


            state.coco.content =
                input.value;


            const freeze =
                $("cocoFreeze");


            if (
                state.coco.content ===
                "combined"
            ) {

                freeze.textContent =
                    "🔒 Combined PO + Box selected. PO and Box content are locked together.";

                notify(
                    "Combined PO + Box enabled.",
                    "green"
                );

            }

            else {

                freeze.textContent =
                    "Individual content mode selected.";

                notify(
                    `${input.value} content enabled.`,
                    "green"
                );

            }


            renderCoco();

        }
    );

});


/* =========================================================
   COCO LAYOUT
========================================================= */

document
.querySelectorAll(
    'input[name="cocoLayout"]'
)
.forEach(input => {

    input.addEventListener(
        "change",
        () => {

            if (!input.checked)
                return;


            state.coco.layout =
                input.value;


            notify(
                `${input.value === "same" ? "Same Line" : "Separate Line"} enabled.`,
                "green"
            );


            renderCoco();

        }
    );

});


/* =========================================================
   COCO DATA
========================================================= */

function cocoPOs() {

    if (
        state.coco.mode ===
        "manual"
    ) {

        return [
            ...document
            .querySelectorAll(
                ".coco-po"
            )
        ]
        .map(i =>
            i.value.trim()
        )
        .filter(Boolean);

    }


    if (
        state.coco.mode ===
        "bulk"
    ) {

        return val(
            "cocoBulkInput"
        )
        .split(",")
        .map(x =>
            x.trim()
        )
        .filter(Boolean);

    }


    return state.coco.excel
        .map(row =>
            String(
                row[0] ?? ""
            ).trim()
        )
        .filter(Boolean);

}


function cocoItems() {

    const start =
        Number(
            val(
                "cocoStartBox",
                "1"
            )
        );


    const end =
        Number(
            val(
                "cocoEndBox",
                "1"
            )
        );


    const warning =
        $("cocoRangeWarning");


    if (
        start > end
    ) {

        warning.style.display =
            "block";

        warning.textContent =
            "⚠️ Start Box Number must be less than or equal to End Box Number.";

        return [];

    }


    warning.style.display =
        "none";


    const result = [];


    cocoPOs()
    .forEach(po => {

        for (
            let box = start;
            box <= end;
            box++
        ) {

            result.push({
                po,
                box
            });

        }

    });


    return result;

}


/* =========================================================
   COCO PAGE
========================================================= */

function pageClass(
    name = "4x6"
) {

    if (name === "4x6")
        return "four-six";

    if (name === "70x35")
        return "seventy-thirtyfive";

    return "a4";

}


function renderCoco() {

    const area =
        $("cocoPreview");

    if (!area) return;


    area.innerHTML = "";


    const items =
        cocoItems();


    const labelsPerPage =
        2;


    const pages =
        Math.ceil(
            items.length /
            labelsPerPage
        );


    $("cocoPreviewCount")
        .textContent =
        Math.min(
            pages,
            5
        );


    if (!items.length)
        return;


    for (
        let pageNo = 0;
        pageNo <
        Math.min(pages, 5);
        pageNo++
    ) {

        const page =
            document.createElement("div");


        const selected =
            document.querySelector(
                'input[name="cocoPage"]:checked'
            )?.value ||
            "4x6";


        page.className =
            `preview-page ${pageClass(selected)}`;


        page.style.display =
            "grid";

        page.style.gridTemplateColumns =
            "1fr 1fr";


        items
        .slice(
            pageNo * labelsPerPage,
            pageNo * labelsPerPage +
            labelsPerPage
        )
        .forEach(item => {

            const label =
                document.createElement("div");

            label.className =
                "label";


            const po =
                document.createElement("div");

            po.className =
                "po-value";

            po.textContent =
                `${val("cocoPoPrefix")}${item.po}`;


            const box =
                document.createElement("div");

            box.className =
                "box-value";

            box.textContent =
                `${val("cocoBoxPrefix", "BOX-")}${item.box}`;


            po.style.fontSize =
                "clamp(15px, 2.3vw, 25px)";

            po.style.fontWeight =
                "900";


            box.style.fontSize =
                "clamp(13px, 1.7vw, 20px)";

            box.style.fontWeight =
                "800";


            if (
                state.coco.content ===
                "po"
            ) {

                po.style.border =
                    "3px double #222";

                po.style.padding =
                    "6px 12px";

                label.appendChild(po);

            }


            else if (
                state.coco.content ===
                "box"
            ) {

                box.style.border =
                    "3px double #222";

                box.style.padding =
                    "6px 12px";

                label.appendChild(box);

            }


            else {

                const wrap =
                    document.createElement("div");


                wrap.className =
                    state.coco.layout ===
                    "same"
                    ? "same-line"
                    : "separate-line";


                po.style.border =
                    "3px double #222";

                box.style.border =
                    "3px double #222";


                po.style.padding =
                    "5px 9px";

                box.style.padding =
                    "5px 9px";


                wrap.appendChild(po);
                wrap.appendChild(box);

                label.appendChild(wrap);

            }


            page.appendChild(label);

        });


        area.appendChild(page);

    }

}


/* =========================================================
   OTHER PO
========================================================= */

function otherPOs() {

    if (
        state.other.mode ===
        "manual"
    ) {

        return [
            ...document
            .querySelectorAll(
                ".other-po"
            )
        ]
        .map(x =>
            x.value.trim()
        )
        .filter(Boolean);

    }


    if (
        state.other.mode ===
        "bulk"
    ) {

        return val(
            "otherBulkInput"
        )
        .split(",")
        .map(x =>
            x.trim()
        )
        .filter(Boolean);

    }


    return state.other.excel
        .map(row =>
            String(
                row[0] ?? ""
            ).trim()
        )
        .filter(Boolean);

}


function renderOther() {

    const area =
        $("otherPreview");

    if (!area) return;


    area.innerHTML = "";


    const data =
        otherPOs();


    const perPage =
        10;


    const pages =
        Math.ceil(
            data.length /
            perPage
        );


    if (!data.length)
        return;


    for (
        let p = 0;
        p < Math.min(pages, 5);
        p++
    ) {

        const page =
            document.createElement("div");

        page.className =
            "preview-page a4";


        page.style.display =
            "grid";

        page.style.gridTemplateColumns =
            "1fr 1fr";

        page.style.gridTemplateRows =
            "repeat(5,1fr)";


        data
        .slice(
            p * perPage,
            p * perPage + perPage
        )
        .forEach(
            (po, index) => {

                const label =
                    document.createElement("div");

                label.className =
                    "label";


                const box =
                    Number(
                        val(
                            "otherStartBox",
                            "1"
                        )
                    ) +
                    p * perPage +
                    index;


                label.innerHTML = `

                    <div class="separate-line">

                        <div
                            class="po-value"
                            style="
                            font-size:20px;
                            font-weight:900;
                            border:3px double #222;
                            padding:5px 9px;">
                            ${esc(
                                val(
                                    "otherPoPrefix"
                                )
                            )}${esc(po)}
                        </div>

                        <div
                            class="box-value"
                            style="
                            font-size:15px;
                            font-weight:800;
                            border:3px double #222;
                            padding:5px 9px;">
                            ${esc(
                                val(
                                    "otherBoxPrefix",
                                    "BOX-"
                                )
                            )}${box}
                        </div>

                    </div>

                `;


                page.appendChild(label);

            }
        );


        area.appendChild(page);

    }

}


/* =========================================================
   ISBN
========================================================= */

function isbns() {

    if (
        state.isbn.mode ===
        "manual"
    ) {

        return [
            ...document
            .querySelectorAll(
                ".isbn-value"
            )
        ]
        .map(x =>
            x.value.trim()
        )
        .filter(Boolean);

    }


    if (
        state.isbn.mode ===
        "bulk"
    ) {

        return val(
            "isbnBulkInput"
        )
        .split(",")
        .map(x =>
            x.trim()
        )
        .filter(Boolean);

    }


    return state.isbn.excel
        .map(row =>
            String(
                row[0] ?? ""
            ).trim()
        )
        .filter(Boolean);

}


function barcode(isbn) {

    let html = "";

    const clean =
        String(isbn)
        .replace(/\D/g, "");


    if (!clean)
        return "";


    for (
        let i = 0;
        i < 110;
        i++
    ) {

        const width =
            1 +
            (
                (
                    Number(
                        clean[
                            i %
                            clean.length
                        ]
                    ) +
                    i
                ) % 3
            );


        html += `

            <span
                style="
                display:block;
                width:${width}px;
                height:70px;
                background:#111;
                margin-right:1px;">
            </span>

        `;

    }


    return `

        <div
            style="
            display:flex;
            justify-content:center;
            overflow:hidden;
            height:70px;">

            ${html}

        </div>

    `;

}


function renderISBN() {

    const area =
        $("isbnPreview");

    if (!area) return;


    area.innerHTML = "";


    const data =
        isbns();


    data
    .slice(0, 5)
    .forEach(isbn => {

        const page =
            document.createElement("div");

        page.className =
            "preview-page four-six";


        page.style.display =
            "flex";

        page.style.flexDirection =
            "column";

        page.style.justifyContent =
            "center";

        page.style.alignItems =
            "center";

        page.style.gap =
            "15px";


        page.innerHTML = `

            <strong
                style="
                font-size:22px;">
                ${esc(isbn)}
            </strong>

            <div
                style="
                width:300px;
                padding:12px;
                border:1px solid #222;
                background:#fff;">

                ${barcode(isbn)}

            </div>

            <small>
                ${esc(
                    val(
                        "isbnBarcodeType",
                        "EAN-13"
                    )
                )}
            </small>

        `;


        area.appendChild(page);

    });

}


/* =========================================================
   ADDRESS
========================================================= */

function addressData() {

    if (
        state.address.mode ===
        "manual"
    ) {

        return [{

            fromName:
                val("fromName"),

            fromPhone:
                val("fromPhone"),

            fromAddress:
                val("fromAddress"),

            toName:
                val("toName"),

            toPhone:
                val("toPhone"),

            toAddress:
                val("toAddress")

        }];

    }


    if (
        state.address.mode ===
        "bulk"
    ) {

        return val(
            "addressBulkInput"
        )
        .split("\n")
        .map(line => {

            const p =
                line.split("|");


            return {

                fromName: "",
                fromPhone: "",

                fromAddress:
                    p[0]?.trim() || "",

                toName: "",
                toPhone: "",

                toAddress:
                    p.slice(1)
                    .join("|")
                    .trim()

            };

        })
        .filter(
            x =>
            x.fromAddress ||
            x.toAddress
        );

    }


    return state.address.excel;

}


function renderAddress() {

    const area =
        $("addressPreview");

    if (!area) return;


    area.innerHTML = "";


    const data =
        addressData()
        .filter(
            x =>
            x.fromName ||
            x.fromAddress ||
            x.toName ||
            x.toAddress
        );


    $("addressPreviewCount")
        .textContent =
        Math.min(
            data.length,
            5
        );


    data
    .slice(0, 5)
    .forEach(item => {

        const page =
            document.createElement("div");

        page.className =
            "preview-page four-six";


        page.style.display =
            "flex";

        page.style.alignItems =
            "center";

        page.style.justifyContent =
            "center";


        const card =
            document.createElement("div");

        card.className =
            "address-label-design";


        if (
            !$("addressPageBorder")?.checked
        ) {

            card.style.border =
                "none";

        }


        const from =
            document.createElement("div");

        from.className =
            "address-from-preview";


        if (
            !$("addressFromBorder")?.checked
        ) {

            from.style.border =
                "none";

        }


        from.innerHTML = `

            <div class="address-small-title">
                📤 FROM
            </div>

            <div class="address-person">
                ${esc(
                    item.fromName ||
                    "Sender Name"
                )}
            </div>

            <div class="address-phone">
                ${esc(
                    item.fromPhone
                )}
            </div>

            <div class="address-body">
                ${esc(
                    item.fromAddress ||
                    "Sender Address"
                )}
            </div>

        `;


        const to =
            document.createElement("div");

        to.className =
            "address-to-preview";


        if (
            !$("addressToBorder")?.checked
        ) {

            to.style.border =
                "none";

        }


        to.innerHTML = `

            <div class="address-small-title">
                📥 TO
            </div>

            <div class="address-person">
                ${esc(
                    item.toName ||
                    "Receiver Name"
                )}
            </div>

            <div class="address-phone">
                ${esc(
                    item.toPhone
                )}
            </div>

            <div class="address-body">
                ${esc(
                    item.toAddress ||
                    "Receiver Address"
                )}
            </div>

        `;


        card.appendChild(from);
        card.appendChild(to);

        page.appendChild(card);

        area.appendChild(page);

    });

}


/* =========================================================
   EXCEL
========================================================= */

function excelRead(
    file,
    statusId,
    previewId,
    headId,
    bodyId,
    callback
) {

    if (
        typeof XLSX === "undefined"
    ) {

        notify(
            "Excel library is unavailable.",
            "red"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
    event => {

        try {

            const workbook =
                XLSX.read(
                    event.target.result,
                    {
                        type: "array"
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


            const headers =
                rows[0] || [];


            const data =
                rows
                .slice(1)
                .filter(row =>
                    row.some(
                        cell =>
                            String(
                                cell
                            ).trim()
                    )
                );


            const status =
                $(statusId);


            status.innerHTML = `

                ✅ Your Excel file is uploaded.

                <br>

                📊 Data Rows:
                <strong>
                    ${data.length}
                </strong>

                &nbsp; | &nbsp;

                📑 Columns:
                <strong>
                    ${headers.length}
                </strong>

            `;


            const head =
                $(headId);


            head.innerHTML = `

                <tr>

                    <th>#</th>

                    ${
                        headers
                        .map(
                            h =>
                            `<th>${esc(h)}</th>`
                        )
                        .join("")
                    }

                </tr>

            `;


            const body =
                $(bodyId);


            body.innerHTML =
                data
                .slice(0, 25)
                .map(
                    (row, i) => `

                    <tr>

                        <td>
                            ${i + 1}
                        </td>

                        ${
                            headers
                            .map(
                                (_, c) =>
                                `<td>
                                    ${esc(
                                        row[c] ?? ""
                                    )}
                                </td>`
                            )
                            .join("")
                        }

                    </tr>

                    `
                )
                .join("");


            $(previewId)
                .classList.add(
                    "show"
                );


            callback(
                data,
                headers
            );


            notify(
                `Excel uploaded successfully. ${data.length} rows found.`,
                "green"
            );

        }
        catch(error) {

            console.error(error);

            notify(
                "Excel file could not be read.",
                "red"
            );

        }

    };


    reader.readAsArrayBuffer(file);

}


/* =========================================================
   EXCEL EVENTS
========================================================= */

function excelEvent(
    inputId,
    status,
    preview,
    head,
    body,
    callback
) {

    if (!exists(inputId))
        return;


    $(inputId)
    .addEventListener(
        "change",
        e => {

            const file =
                e.target.files[0];

            if (!file) return;


            excelRead(
                file,
                status,
                preview,
                head,
                body,
                callback
            );

        }
    );

}


excelEvent(
    "cocoExcelFile",
    "cocoExcelStatus",
    "cocoExcelPreview",
    "cocoExcelHead",
    "cocoExcelBody",
    data => {

        state.coco.excel =
            data;

        renderCoco();

    }
);


excelEvent(
    "otherExcelFile",
    "otherExcelStatus",
    "otherExcelPreview",
    "otherExcelHead",
    "otherExcelBody",
    data => {

        state.other.excel =
            data;

        renderOther();

    }
);


excelEvent(
    "isbnExcelFile",
    "isbnExcelStatus",
    "isbnExcelPreview",
    "isbnExcelHead",
    "isbnExcelBody",
    data => {

        state.isbn.excel =
            data;

        renderISBN();

    }
);


excelEvent(
    "addressExcelFile",
    "addressExcelStatus",
    "addressExcelPreview",
    "addressExcelHead",
    "addressExcelBody",
    data => {

        state.address.excel =
            data.map(row => ({

                fromName:
                    row[0] || "",

                fromPhone:
                    row[1] || "",

                fromAddress:
                    row[2] || "",

                toName:
                    row[3] || "",

                toPhone:
                    row[4] || "",

                toAddress:
                    row[5] || ""

            }));


        renderAddress();

    }
);


/* =========================================================
   LIVE INPUTS
========================================================= */

document
.addEventListener(
    "input",
    event => {

        if (
            event.target.closest(
                "#cocoPanel"
            )
        ) {

            renderCoco();

        }


        if (
            event.target.closest(
                "#otherPanel"
            )
        ) {

            renderOther();

        }


        if (
            event.target.closest(
                "#isbnPanel"
            )
        ) {

            renderISBN();

        }


        if (
            event.target.closest(
                "#addressPanel"
            )
        ) {

            renderAddress();

        }

    }
);


/* =========================================================
   CHECKBOX TOAST
========================================================= */

document
.querySelectorAll(
    'input[type="checkbox"]'
)
.forEach(input => {

    input.addEventListener(
        "change",
        () => {

            notify(
                input.checked
                ? `${input.id} enabled.`
                : `${input.id} disabled.`,
                input.checked
                ? "green"
                : "red"
            );


            renderAddress();

        }
    );

});


/* =========================================================
   ALL BORDER
========================================================= */

if (
    exists("addressAllBorder")
) {

    $("addressAllBorder")
    .addEventListener(
        "change",
        () => {

            const enabled =
                $("addressAllBorder")
                .checked;


            [
                "addressPageBorder",
                "addressFromBorder",
                "addressToBorder"
            ]
            .forEach(id => {

                if (!exists(id))
                    return;


                $(id).checked =
                    enabled;


                $(id).disabled =
                    enabled;

            });


            renderAddress();

        }
    );

}


/* =========================================================
   PDF ENGINE
   THIS FIXES BLANK PDF
========================================================= */

async function downloadPDF(
    previewId,
    filename
) {

    const preview =
        $(previewId);


    if (!preview) {

        notify(
            "Preview area not found.",
            "red"
        );

        return;

    }


    const pages =
        [
            ...preview
            .querySelectorAll(
                ".preview-page"
            )
        ];


    if (!pages.length) {

        notify(
            "Please enter data first.",
            "red"
        );

        return;

    }


    if (
        typeof html2canvas ===
        "undefined"
    ) {

        notify(
            "html2canvas is not loaded.",
            "red"
        );

        return;

    }


    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        notify(
            "jsPDF is not loaded.",
            "red"
        );

        return;

    }


    notify(
        "Preparing PDF...",
        "green"
    );


    const {
        jsPDF
    } = window.jspdf;


    let pdf = null;


    try {

        for (
            let i = 0;
            i < pages.length;
            i++
        ) {

            const page =
                pages[i];


            /*
             * Force browser to render page.
             */

            const oldPosition =
                page.style.position;

            const oldLeft =
                page.style.left;

            const oldTop =
                page.style.top;


            page.style.position =
                "fixed";

            page.style.left =
                "-20000px";

            page.style.top =
                "0";


            await new Promise(
                resolve =>
                requestAnimationFrame(
                    resolve
                )
            );


            const canvas =
                await html2canvas(
                    page,
                    {

                        scale: 2,

                        backgroundColor:
                            "#ffffff",

                        useCORS: true,

                        allowTaint: true,

                        logging: false,

                        scrollX: 0,

                        scrollY: 0

                    }
                );


            page.style.position =
                oldPosition;

            page.style.left =
                oldLeft;

            page.style.top =
                oldTop;


            if (
                canvas.width === 0 ||
                canvas.height === 0
            ) {

                throw new Error(
                    "Empty canvas"
                );

            }


            const image =
                canvas.toDataURL(
                    "image/jpeg",
                    .95
                );


            const width =
                canvas.width / 2;

            const height =
                canvas.height / 2;


            if (!pdf) {

                pdf =
                    new jsPDF({

                        orientation:
                            width >
                            height
                            ? "landscape"
                            : "portrait",

                        unit:
                            "px",

                        format:
                            [
                                width,
                                height
                            ]

                    });

            }
            else {

                pdf.addPage(
                    [
                        width,
                        height
                    ],
                    width >
                    height
                    ? "landscape"
                    : "portrait"
                );

            }


            pdf.addImage(
                image,
                "JPEG",
                0,
                0,
                width,
                height,
                undefined,
                "FAST"
            );

        }


        pdf.save(
            filename
        );


        notify(
            "PDF downloaded successfully.",
            "green"
        );

    }
    catch(error) {

        console.error(
            "PDF Error:",
            error
        );


        notify(
            "PDF generation failed.",
            "red"
        );

    }

}


/* =========================================================
   DOWNLOAD BUTTONS
========================================================= */

$("cocoDownload")
.addEventListener(
    "click",
    async () => {

        renderCoco();

        await downloadPDF(
            "cocoPreview",
            "BWG-Coco-Blue.pdf"
        );

    }
);


$("otherDownload")
.addEventListener(
    "click",
    async () => {

        renderOther();

        await downloadPDF(
            "otherPreview",
            "BWG-Other-PO.pdf"
        );

    }
);


$("isbnDownload")
.addEventListener(
    "click",
    async () => {

        renderISBN();

        await downloadPDF(
            "isbnPreview",
            "BWG-ISBN-Barcodes.pdf"
        );

    }
);


$("addressDownload")
.addEventListener(
    "click",
    async () => {

        renderAddress();

        await downloadPDF(
            "addressPreview",
            "BWG-Address-Labels.pdf"
        );

    }
);


/* =========================================================
   PRINT
========================================================= */

function printPDF(previewId) {

    const preview =
        $(previewId);


    if (!preview)
        return;


    const pages =
        [
            ...preview
            .querySelectorAll(
                ".preview-page"
            )
        ];


    if (!pages.length) {

        notify(
            "Please generate labels first.",
            "red"
        );

        return;

    }


    const printArea =
        document.createElement("div");


    printArea.id =
        "printArea";


    pages
    .forEach(page => {

        const clone =
            page.cloneNode(true);


        clone.style.boxShadow =
            "none";

        clone.style.margin =
            "0";

        clone.style.maxWidth =
            "none";


        printArea.appendChild(
            clone
        );

    });


    document.body
        .appendChild(
            printArea
        );


    setTimeout(
        () => {

            window.print();

        },
        300
    );

}


$("cocoPrint")
.addEventListener(
    "click",
    () => {

        renderCoco();

        printPDF(
            "cocoPreview"
        );

    }
);


$("otherPrint")
.addEventListener(
    "click",
    () => {

        renderOther();

        printPDF(
            "otherPreview"
        );

    }
);


$("isbnPrint")
.addEventListener(
    "click",
    () => {

        renderISBN();

        printPDF(
            "isbnPreview"
        );

    }
);


$("addressPrint")
.addEventListener(
    "click",
    () => {

        renderAddress();

        printPDF(
            "addressPreview"
        );

    }
);


/* =========================================================
   CLEAN PRINT AREA
========================================================= */

window.addEventListener(
    "afterprint",
    () => {

        const printArea =
            $("printArea");

        if (printArea)
            printArea.remove();

    }
);


/* =========================================================
   INITIAL RENDER
========================================================= */

renderCoco();
renderOther();
renderISBN();
renderAddress();


console.log(
    "BWG BooksWagon Label Studio loaded successfully."
);
