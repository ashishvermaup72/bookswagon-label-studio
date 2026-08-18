"use strict";

/* =========================================================
   BOOKSWAGON LABEL CREATIONS STUDIO
   CocoBlu PO + Other PO
   Full JavaScript
========================================================= */


/* =========================================================
   BASIC HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const $$ = (selector) => [
    ...document.querySelectorAll(selector)
];


/* =========================================================
   TOAST / NOTIFICATION
========================================================= */

function toast(message, type = "ok") {

    const el = $("toast");

    if (!el) return;

    el.textContent = message;

    el.className =
        "toast show " +
        (type === "bad" ? "bad" : "");

    clearTimeout(window.__toastTimer);

    window.__toastTimer = setTimeout(() => {
        el.className = "toast";
    }, 2800);
}


/* =========================================================
   BORDER OPTIONS
========================================================= */

const borderOptions = [

    ["none", "No Border"],

    ["solid", "Solid"],

    ["dashed", "Dashed"],

    ["dotted", "Dotted"],

    ["double", "Double"],

    ["groove", "Groove"],

    ["ridge", "Ridge"],

    ["inset", "Inset"],

    ["outset", "Outset"],

    ["bold", "Bold"],

    ["thin", "Thin"],

    ["medium", "Medium"],

    ["thick", "Thick"],

    ["dashdot", "Dash-Dot"],

    ["longdash", "Long Dash"]

];


/* =========================================================
   LOAD BORDER DROPDOWNS
========================================================= */

function loadBorderOptions() {

    const ids = [

        "poBorder",

        "boxBorder",

        "bothBorder",

        "otherPOBorder",

        "otherBoxBorder",

        "otherBothBorder"

    ];

    ids.forEach((id) => {

        const select = $(id);

        if (!select) return;

        select.innerHTML =
            borderOptions
                .map(([value, label]) => {

                    return `
                        <option value="${value}">
                            ${label}
                        </option>
                    `;

                })
                .join("");

    });

}

loadBorderOptions();


/* =========================================================
   PANEL SWITCHING
========================================================= */

function activatePanel(panelId) {

    $$(".tab").forEach((tab) => {

        tab.classList.toggle(
            "active",
            tab.dataset.panel === panelId
        );

    });


    $$(".panel").forEach((panel) => {

        panel.classList.toggle(
            "active",
            panel.id === panelId
        );

    });


    const isCoco =
        panelId === "cocoPanel";


    if ($("workspaceTitle")) {

        $("workspaceTitle").textContent =
            isCoco
                ? "CocoBlu PO Label Maker"
                : "Others PO Label Maker";

    }


    if ($("workspaceDescription")) {

        $("workspaceDescription").textContent =
            isCoco
                ? "Create PO and Box labels using Manual, Bulk or Excel / CSV."
                : "Create PO and Box labels for other purchase orders.";

    }

}


/* =========================================================
   TAB EVENTS
========================================================= */

$$(".tab").forEach((tab) => {

    tab.addEventListener("click", () => {

        activatePanel(tab.dataset.panel);

        toast(
            tab.textContent.trim() + " enabled."
        );

    });

});


/* =========================================================
   MAIN FEATURE CARDS
========================================================= */

$$(".feature").forEach((card) => {

    card.addEventListener("click", () => {

        const tool = card.dataset.tool;


        if (tool === "future") {

            toast(
                "This module will be added in the next phase.",
                "bad"
            );

            return;

        }


        if (tool === "coco") {

            activatePanel("cocoPanel");

            toast(
                "CocoBlu PO enabled."
            );

        }


        if (tool === "other") {

            activatePanel("otherPanel");

            toast(
                "Others PO enabled."
            );

        }

    });

});


/* =========================================================
   INPUT MODE
   MANUAL / BULK / EXCEL
========================================================= */

function getCurrentMode() {

    const active =
        document.querySelector(
            ".mode.active"
        );

    return active
        ? active.dataset.mode
        : "manual";

}


/* =========================================================
   MODE BUTTON EVENTS
========================================================= */

$$(".mode").forEach((modeButton) => {

    modeButton.addEventListener(
        "click",
        () => {

            $$(".mode").forEach((button) => {

                button.classList.remove(
                    "active"
                );

            });


            modeButton.classList.add(
                "active"
            );


            const mode =
                modeButton.dataset.mode;


            if ($("manualArea")) {

                $("manualArea")
                    .classList.toggle(
                        "hidden",
                        mode !== "manual"
                    );

            }


            if ($("bulkArea")) {

                $("bulkArea")
                    .classList.toggle(
                        "hidden",
                        mode !== "bulk"
                    );

            }


            if ($("excelArea")) {

                $("excelArea")
                    .classList.toggle(
                        "hidden",
                        mode !== "excel"
                    );

            }


            toast(
                mode.charAt(0).toUpperCase() +
                mode.slice(1) +
                " mode enabled."
            );


            renderCoco();

        }
    );

});


/* =========================================================
   EXCEL DATA
========================================================= */

let excelPOs = [];


/* =========================================================
   GET COCO PO LIST
========================================================= */

function getCocoPOs() {

    const mode =
        getCurrentMode();


    /* -------------------------
       BULK
    ------------------------- */

    if (mode === "bulk") {

        const value =
            $("bulkPO")
                ? $("bulkPO").value
                : "";

        return value
            .split(/[\n,\r]+/)
            .map((item) => item.trim())
            .filter(Boolean);

    }


    /* -------------------------
       EXCEL
    ------------------------- */

    if (mode === "excel") {

        return excelPOs;

    }


    /* -------------------------
       MANUAL
    ------------------------- */

    const manualValue =
        $("manualPO")
            ? $("manualPO").value.trim()
            : "";

    return manualValue
        ? [manualValue]
        : [];

}


/* =========================================================
   BULK INPUT
========================================================= */

if ($("bulkPO")) {

    $("bulkPO").addEventListener(
        "input",
        () => {

            const count =
                getCocoPOs().length;


            if ($("bulkCount")) {

                $("bulkCount").textContent =
                    `${count} PO number${count === 1 ? "" : "s"} detected.`;

            }


            renderCoco();

        }
    );

}


/* =========================================================
   EXCEL / CSV UPLOAD
========================================================= */

if ($("excelFile")) {

    $("excelFile").addEventListener(
        "change",
        async (event) => {

            const file =
                event.target.files[0];


            if (!file) return;


            try {

                const fileName =
                    file.name.toLowerCase();


                /* -------------------------
                   CSV
                ------------------------- */

                if (
                    fileName.endsWith(".csv")
                ) {

                    const text =
                        await file.text();


                    const rows =
                        text
                            .split(/\r?\n/)
                            .map((row) => {

                                return row
                                    .split(",")[0]
                                    .trim()
                                    .replace(
                                        /^"|"$/g,
                                        ""
                                    );

                            })
                            .filter(Boolean);


                    /*
                       First row is treated as header.
                    */

                    excelPOs =
                        rows.slice(1);

                }


                /* -------------------------
                   XLSX / XLS
                ------------------------- */

                else {

                    if (
                        typeof XLSX ===
                        "undefined"
                    ) {

                        throw new Error(
                            "Excel library unavailable."
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


                    /*
                       First row = Header
                       Column A = PO number
                    */

                    excelPOs =
                        rows
                            .slice(1)
                            .map((row) => {

                                return String(
                                    row[0] ?? ""
                                ).trim();

                            })
                            .filter(Boolean);

                }


                /* -------------------------
                   REMOVE DUPLICATES
                ------------------------- */

                excelPOs = [
                    ...new Set(excelPOs)
                ];


                if ($("excelCount")) {

                    $("excelCount").textContent =
                        `${excelPOs.length} PO numbers loaded from Column A.`;

                }


                toast(
                    "Excel / CSV loaded successfully."
                );


                renderCoco();

            }
            catch (error) {

                console.error(
                    "Excel Error:",
                    error
                );


                excelPOs = [];


                if ($("excelCount")) {

                    $("excelCount").textContent =
                        "Unable to read this file.";

                }


                toast(
                    "Could not read this Excel / CSV file.",
                    "bad"
                );

            }

        }
    );

}


/* =========================================================
   BOX RANGE
========================================================= */

function getCocoRange() {

    return {

        start: Number(
            $("startBox")
                ? $("startBox").value
                : ""
        ),

        end: Number(
            $("endBox")
                ? $("endBox").value
                : ""
        )

    };

}


/* =========================================================
   RANGE VALIDATION
========================================================= */

function isCocoRangeValid() {

    const {
        start,
        end
    } = getCocoRange();


    const bothEmpty =
        !Number.isFinite(start) &&
        !Number.isFinite(end);


    const valid =
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start <= end;


    if ($("rangeWarning")) {

        $("rangeWarning")
            .classList.toggle(
                "hidden",
                valid || bothEmpty
            );

    }


    return valid;

}


/* =========================================================
   RANGE EVENTS
========================================================= */

if ($("startBox")) {

    $("startBox")
        .addEventListener(
            "input",
            renderCoco
        );

}


if ($("endBox")) {

    $("endBox")
        .addEventListener(
            "input",
            renderCoco
        );

}


/* =========================================================
   BORDER CSS
========================================================= */

function getBorderCSS(value) {

    const map = {

        none:
            "none",

        solid:
            "1px solid #172033",

        dashed:
            "1px dashed #172033",

        dotted:
            "1px dotted #172033",

        double:
            "3px double #172033",

        groove:
            "3px groove #172033",

        ridge:
            "3px ridge #172033",

        inset:
            "3px inset #172033",

        outset:
            "3px outset #172033",

        bold:
            "3px solid #172033",

        thin:
            "1px solid #172033",

        medium:
            "2px solid #172033",

        thick:
            "4px solid #172033",

        dashdot:
            "1px dashed #172033",

        longdash:
            "2px dashed #172033"

    };


    return map[value] || "none";

}


/* =========================================================
   CREATE PREVIEW LABEL
========================================================= */

function createPreviewLabel(
    po,
    box,
    content,
    poBorder,
    boxBorder,
    bothBorder
) {

    const label =
        document.createElement(
            "div"
        );


    label.className =
        "preview-label";


    const poElement =
        document.createElement(
            "div"
        );


    poElement.className =
        "preview-po";


    poElement.textContent =
        po;


    const boxElement =
        document.createElement(
            "div"
        );


    boxElement.className =
        "preview-box";


    boxElement.textContent =
        "BOX NO. " + box;


    /* -------------------------
       CONTENT
    ------------------------- */

    if (content === "po") {

        boxElement.style.display =
            "none";

    }


    if (content === "box") {

        poElement.style.display =
            "none";

    }


    /* -------------------------
       BOTH BORDER
    ------------------------- */

    if (bothBorder !== "none") {

        label.style.border =
            getBorderCSS(
                bothBorder
            );

    }


    /* -------------------------
       INDIVIDUAL BORDERS
    ------------------------- */

    else {

        if (
            poBorder !==
            "none"
        ) {

            poElement.style.border =
                getBorderCSS(
                    poBorder
                );

            poElement.style.padding =
                "4px 8px";

        }


        if (
            boxBorder !==
            "none"
        ) {

            boxElement.style.border =
                getBorderCSS(
                    boxBorder
                );

            boxElement.style.padding =
                "4px 8px";

        }

    }


    label.appendChild(
        poElement
    );


    label.appendChild(
        boxElement
    );


    return label;

}


/* =========================================================
   COCOBLU LIVE PREVIEW
========================================================= */

function renderCoco() {

    const page =
        $("labelPage");


    if (!page) return;


    page.innerHTML =
        "";


    const poList =
        getCocoPOs();


    const {
        start,
        end
    } =
        getCocoRange();


    /* -------------------------
       EMPTY STATE
    ------------------------- */

    if (
        !poList.length ||
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start > end
    ) {

        page.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    display:grid;
                    place-items:center;
                    min-height:350px;
                    text-align:center;
                    color:#94a3b8;
                    padding:25px;
                "
            >

                Enter PO number and
                Box Start / End number
                to see the live preview.

            </div>

        `;


        if ($("previewStatus")) {

            $("previewStatus").textContent =
                "Ready. Enter PO and Box range.";

        }


        return;

    }


    const content =
        $("contentType")
            ? $("contentType").value
            : "po";


    const poBorder =
        $("poBorder")
            ? $("poBorder").value
            : "none";


    const boxBorder =
        $("boxBorder")
            ? $("boxBorder").value
            : "none";


    const bothBorder =
        $("bothBorder")
            ? $("bothBorder").value
            : "none";


    let box =
        start;


    /*
       Show first 8 labels
       in live preview.
    */

    for (
        let index = 0;
        index < 8;
        index++
    ) {

        page.appendChild(

            createPreviewLabel(

                poList[
                    index %
                    poList.length
                ],

                Math.min(
                    box,
                    end
                ),

                content,

                poBorder,

                boxBorder,

                bothBorder

            )

        );


        if (box < end) {

            box++;

        }

    }


    if ($("previewStatus")) {

        $("previewStatus").textContent =
            `${poList.length} PO number${poList.length === 1 ? "" : "s"} • ` +
            `${end - start + 1} Box number${end - start + 1 === 1 ? "" : "s"} • ` +
            `Previewing first 8 labels.`;

    }

}


/* =========================================================
   COCO LIVE CHANGE EVENTS
========================================================= */

[
    "manualPO",
    "contentType",
    "poBorder",
    "boxBorder",
    "bothBorder"
].forEach((id) => {

    const element = $(id);

    if (!element) return;


    element.addEventListener(
        "input",
        renderCoco
    );


    element.addEventListener(
        "change",
        renderCoco
    );

});


/* =========================================================
   CLEAR COCOBLU
========================================================= */

if ($("clearCoco")) {

    $("clearCoco")
        .addEventListener(
            "click",
            () => {

                if ($("manualPO"))
                    $("manualPO").value = "";


                if ($("bulkPO"))
          
