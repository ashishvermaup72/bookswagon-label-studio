"use strict";

/* =========================================================
   BOOKS LABEL STUDIO
   FINAL SCRIPT
========================================================= */

const CONFIG = {
  email: "ashish.verma@bookswagon.in",
  map: "https://maps.app.goo.gl/7McYApm1u9x4QSj7A"
};

let currentTool = "Coco Blue PO";
let currentSubMode = "individual";

let isbnMode = "manual";
let addressMode = "manual";

let poExcelRows = [];
let isbnExcelRows = [];
let addressExcelRows = [];


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  [...document.querySelectorAll(selector)];


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function safeName(value) {
  return String(value || "LABEL")
    .replace(/[^a-z0-9_-]+/gi, "_")
    .slice(0, 80);
}


/* =========================================================
   TOAST
========================================================= */

function toast(message, type = "success") {

  const container =
    $("#toastContainer");

  if (!container) return;

  const item =
    document.createElement("div");

  item.className =
    type === "error"
      ? "toast error"
      : "toast";

  item.textContent = message;

  container.appendChild(item);

  setTimeout(() => {
    item.remove();
  }, 2800);
}


/* =========================================================
   LANGUAGE
========================================================= */

const translations = {

  en: {
    tools: "TOOLS",
    support: "SUPPORT",
    about: "ABOUT",

    heroText:
      "Create professional PO labels, ISBN barcodes and address stickers with flexible page sizes, Excel upload and print controls.",

    openStudio: "OPEN STUDIO",
    contact: "CONTACT",

    chooseTool:
      "Choose your label tool",

    chooseText:
      "Select a category to start."
  },

  hi: {
    tools: "टूल्स",
    support: "सपोर्ट",
    about: "अबाउट",

    heroText:
      "PO लेबल, ISBN बारकोड और Address Sticker बनाएं। Page Size, Excel Upload और Print Controls उपलब्ध हैं।",

    openStudio:
      "स्टूडियो खोलें",

    contact:
      "कॉन्टैक्ट",

    chooseTool:
      "अपना लेबल टूल चुनें",

    chooseText:
      "शुरू करने के लिए कैटेगरी चुनें।"
  }

};


function setLanguage(language) {

  document.documentElement.lang =
    language === "hi"
      ? "hi"
      : "en";

  $$("[data-i18n]").forEach(
    (element) => {

      const key =
        element.dataset.i18n;

      if (
        translations[language] &&
        translations[language][key]
      ) {
        element.textContent =
          translations[language][key];
      }

    }
  );

  $$(".lang-btn").forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.lang === language
      );

    }
  );

  localStorage.setItem(
    "booksWagonLanguage",
    language
  );
}


$$(".lang-btn").forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {
        setLanguage(
          button.dataset.lang
        );
      }
    );

  }
);


/* =========================================================
   FONT LIST
========================================================= */

const FONT_LIST = [

  "Arial",
  "Arial Black",
  "Calibri",
  "Cambria",
  "Candara",
  "Comic Sans MS",
  "Consolas",
  "Constantia",
  "Courier New",
  "Georgia",
  "Impact",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Microsoft Sans Serif",
  "Palatino Linotype",
  "Segoe UI",
  "Segoe Print",
  "Segoe Script",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Garamond",
  "Book Antiqua",
  "Franklin Gothic Medium",
  "Century Gothic",
  "Rockwell",
  "Baskerville",
  "Gill Sans",
  "Helvetica"

];


function populateFontSelect(selector) {

  const select =
    $(selector);

  if (!select) return;

  select.innerHTML = "";

  FONT_LIST.forEach(
    (font) => {

      const option =
        document.createElement("option");

      option.value = font;
      option.textContent = font;
      option.style.fontFamily = font;

      select.appendChild(option);

    }
  );
}


[
  "#poFontFamily",
  "#boxFontFamily",
  "#fromFontFamily",
  "#toFontFamily"
].forEach(
  populateFontSelect
);


function populateFontSizes(selector) {

  const select =
    $(selector);

  if (!select) return;

  select.innerHTML = "";

  for (
    let size = 1;
    size <= 48;
    size++
  ) {

    const option =
      document.createElement("option");

    option.value = size;
    option.textContent =
      `${size}px`;

    if (size === 18) {
      option.selected = true;
    }

    select.appendChild(option);

  }
}


[
  "#poFontSize",
  "#boxFontSize",
  "#fromFontSize",
  "#toFontSize"
].forEach(
  populateFontSizes
);


/* =========================================================
   TOOL SWITCHING
========================================================= */

function openTool(tool) {

  currentTool = tool;

  const workspace =
    $("#workspace");

  if (!workspace) return;

  workspace.classList.add("active");

  $("#workspaceTitle").textContent =
    tool;

  const descriptions = {

    "Coco Blue PO":
      "Coco Blue PO and Box label generator.",

    "Other PO":
      "Other PO and Box label generator.",

    "ISBN Barcode":
      "ISBN barcode generator.",

    "Address Sticker":
      "From and To address sticker generator."
  };

  $("#workspaceDescription").textContent =
    descriptions[tool] || "";


  const isPO =
    tool === "Coco Blue PO" ||
    tool === "Other PO";

  const isISBN =
    tool === "ISBN Barcode";

  const isAddress =
    tool === "Address Sticker";


  $("#poSubTools").style.display =
    isPO ? "" : "none";

  $("#isbnSubTools").style.display =
    isISBN ? "flex" : "none";

  $("#addressSubTools").style.display =
    isAddress ? "flex" : "none";


  $("#poSection").style.display =
    isPO ? "" : "none";

  $("#boxSection").style.display =
    isPO ? "" : "none";

  $("#labelFeatures").style.display =
    isPO ? "" : "none";

  $("#poFontSection").style.display =
    isPO ? "" : "none";

  $("#boxFontSection").style.display =
    isPO ? "" : "none";

  $("#poPreviewSection").style.display =
    isPO ? "" : "none";


  $("#isbnSection").style.display =
    isISBN ? "" : "none";

  $("#addressSection").style.display =
    isAddress ? "" : "none";


  updatePOFeatureLocks();
  updateCombinedBorderLock();

  updatePreview();
  updateISBNPreview();
  updateAddressPreview();


  workspace.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


$$(".tool-card").forEach(
  (card) => {

    card.addEventListener(
      "click",
      () => {

        openTool(
          card.dataset.tool
        );

      }
    );

  }
);


$("#openStudio")?.addEventListener(
  "click",
  () => {

    $("#tools")?.scrollIntoView({
      behavior: "smooth"
    });

  }
);


$("#closeWorkspace")?.addEventListener(
  "click",
  () => {

    $("#workspace")
      ?.classList.remove("active");

    $("#tools")?.scrollIntoView({
      behavior: "smooth"
    });

  }
);


/* =========================================================
   PO SUB CATEGORIES
========================================================= */

$$("[data-sub]").forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        currentSubMode =
          button.dataset.sub;

        $$("[data-sub]").forEach(
          (btn) => {
            btn.classList.remove(
              "active"
            );
          }
        );

        button.classList.add(
          "active"
        );


        $("#individualInput").style.display =
          currentSubMode === "individual"
            ? ""
            : "none";

        $("#multipleInput").style.display =
          currentSubMode === "multiple"
            ? ""
            : "none";

        $("#poExcelInput").style.display =
          currentSubMode === "excel"
            ? ""
            : "none";


        updatePreview();

      }
    );

  }
);


/* =========================================================
   CREATE 40 PO INPUTS
========================================================= */

function createPOInputs() {

  const grid =
    $("#poGrid");

  if (!grid) return;

  grid.innerHTML = "";

  for (
    let i = 1;
    i <= 40;
    i++
  ) {

    const field =
      document.createElement("div");

    field.className =
      "po-field";

    field.innerHTML = `
      <span>PO ${i}</span>

      <input
        class="po-input"
        type="text"
        placeholder="PO Number ${i}"
        autocomplete="off"
      >
    `;

    grid.appendChild(field);

  }

}

createPOInputs();


/* =========================================================
   PO + BOX FEATURE
========================================================= */

/*
   NEW REQUIREMENT:

   If "PO Number + Box Number" is enabled:

   PO Number checkbox -> locked
   Box Number checkbox -> locked

   The combined option itself remains enabled.
*/

function updatePOFeatureLocks() {

  const poPlusBox =
    $("#poPlusBox");

  const printPO =
    $("#printPO");

  const printBox =
    $("#printBox");

  const poWrap =
    printPO?.closest(
      ".feature-checkbox"
    );

  const boxWrap =
    printBox?.closest(
      ".feature-checkbox"
    );

  if (
    !poPlusBox ||
    !printPO ||
    !printBox
  ) {
    return;
  }


  if (poPlusBox.checked) {

    /*
      PO + BOX is now one combined
      display feature.
    */

    printPO.checked = false;
    printBox.checked = false;

    printPO.disabled = true;
    printBox.disabled = true;

    poWrap?.classList.add(
      "locked"
    );

    boxWrap?.classList.add(
      "locked"
    );

    poPlusBox
      .closest(".feature-checkbox")
      ?.classList.add("active");

  } else {

    printPO.disabled = false;
    printBox.disabled = false;

    poWrap?.classList.remove(
      "locked"
    );

    boxWrap?.classList.remove(
      "locked"
    );

    poPlusBox
      .closest(".feature-checkbox")
      ?.classList.remove("active");

  }

}


/* =========================================================
   COMBINED BORDER LOCK
========================================================= */

function updateCombinedBorderLock() {

  const combined =
    $("#combinedBorder");

  const po =
    $("#poBorder");

  const box =
    $("#boxBorder");

  if (
    !combined ||
    !po ||
    !box
  ) {
    return;
  }


  const poWrap =
    po.closest(
      ".feature-checkbox"
    );

  const boxWrap =
    box.closest(
      ".feature-checkbox"
    );


  if (combined.checked) {

    po.checked = false;
    box.checked = false;

    po.disabled = true;
    box.disabled = true;

    poWrap?.classList.add(
      "locked"
    );

    boxWrap?.classList.add(
      "locked"
    );

  } else {

    po.disabled = false;
    box.disabled = false;

    poWrap?.classList.remove(
      "locked"
    );

    boxWrap?.classList.remove(
      "locked"
    );

  }

}


/* =========================================================
   FEATURE CHECKBOX EVENTS
========================================================= */

$$(".feature-checkbox input")
  .forEach(
    (checkbox) => {

      checkbox.addEventListener(
        "change",
        () => {

          const wrapper =
            checkbox.closest(
              ".feature-checkbox"
            );

          const label =
            wrapper
              ?.querySelector(
                ".checkbox-text"
              )
              ?.textContent
              ?.trim() ||
            "Function";


          /*
            PO + BOX
          */

          if (
            checkbox.id ===
            "poPlusBox"
          ) {

            updatePOFeatureLocks();

            toast(
              checkbox.checked
                ? "PO Number + Box Number has been enabled."
                : "PO Number + Box Number has been disabled."
            );

            updatePreview();

            return;
          }


          /*
            Combined Border
          */

          if (
            checkbox.id ===
            "combinedBorder"
          ) {

            updateCombinedBorderLock();

            toast(
              checkbox.checked
                ? "Combined Border has been enabled."
                : "Combined Border has been disabled."
            );

            updatePreview();

            return;
          }


          /*
            Normal feature
          */

          toast(
            `${label} ${
              checkbox.checked
                ? "has been enabled."
                : "has been disabled."
            }`
          );

          updatePreview();

        }
      );

    }
  );


/* =========================================================
   FONT TOGGLE
========================================================= */

$$(".font-toggle")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const target =
            $("#" + button.dataset.target);

          if (!target) return;

          target.checked =
            !target.checked;

          button.classList.toggle(
            "active",
            target.checked
          );

          updatePreview();
          updateAddressPreview();

        }
      );

    }
  );


/* =========================================================
   PAGE SIZE
========================================================= */

function updatePageSizeLock() {

  const pageSize =
    $("#pageSize");

  const customWidth =
    $("#customWidth");

  const customHeight =
    $("#customHeight");

  if (
    !pageSize ||
    !customWidth ||
    !customHeight
  ) {
    return;
  }


  const custom =
    pageSize.value === "CUSTOM";


  customWidth.disabled =
    !custom;

  customHeight.disabled =
    !custom;


  /*
    IMPORTANT:

    70x35 = 70mm width
           = 35mm height

    Portrait:
       70 × 35

    Landscape:
       35 × 70
  */


  const labels = {

    "4x6":
      "4 × 6 Inches page selected.",

    "70x35":
      "70 × 35 mm page selected.",

    "A4":
      "A4 page selected.",

    "CUSTOM":
      "Custom page size selected."

  };


  toast(
    labels[pageSize.value] ||
    "Page size selected."
  );


  updatePreview();
  updateAddressPreview();
}


$("#pageSize")?.addEventListener(
  "change",
  updatePageSizeLock
);


/* =========================================================
   ORIENTATION
========================================================= */

$("#orientation")?.addEventListener(
  "change",
  () => {

    const orientation =
      $("#orientation").value;

    toast(
      orientation === "landscape"
        ? "Landscape orientation selected."
        : "Portrait orientation selected."
    );

    updatePreview();
    updateAddressPreview();

  }
);


/* =========================================================
   PAGE DIMENSIONS
========================================================= */

function pageDimensions() {

  let width = 101.6;
  let height = 152.4;


  const size =
    $("#pageSize")?.value ||
    "4x6";


  /*
    4 × 6 INCH
    1 inch = 25.4mm
  */

  if (
    size === "4x6"
  ) {

    width = 101.6;
    height = 152.4;

  }


  /*
    70 × 35 MM
  */

  if (
    size === "70x35"
  ) {

    width = 70;
    height = 35;

  }


  /*
    A4
  */

  if (
    size === "A4"
  ) {

    width = 210;
    height = 297;

  }


  /*
    CUSTOM
  */

  if (
    size === "CUSTOM"
  ) {

    width =
      Number(
        $("#customWidth")?.value
      ) || 101.6;

    height =
      Number(
        $("#customHeight")?.value
      ) || 152.4;

  }


  /*
    LANDSCAPE

    Swap width and height.

    Example:

    70 × 35 portrait
       becomes
    35 × 70 landscape
  */

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
   PO DATA
========================================================= */

function getPOValues() {

  /*
    MULTIPLE
  */

  if (
    currentSubMode ===
    "multiple"
  ) {

    return (
      $("#multiplePO")
        ?.value
        .split(",")
        .map(
          value =>
            value.trim()
        )
        .filter(Boolean)
      || []
    );

  }


  /*
    EXCEL
  */

  if (
    currentSubMode ===
    "excel"
  ) {

    return poExcelRows
      .map(
        row => {

          const keys =
            Object.keys(row);

          if (!keys.length)
            return "";

          return String(
            row[keys[0]]
          ).trim();

        }
      )
      .filter(Boolean);

  }


  /*
    INDIVIDUAL
  */

  return $$(".po-input")
    .map(
      input =>
        input.value.trim()
    )
    .filter(Boolean);

}


/* =========================================================
   BOX / REPEAT SEQUENCE
========================================================= */

function buildSequence() {

  const pos =
    getPOValues();

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

  const repeat =
    Math.max(
      1,
      Number(
        $("#repeatCount")?.value
      ) || 1
    );

  const copies =
    Math.max(
      1,
      Number(
        $("#copies")?.value
      ) || 1
    );


  const sequence = [];


  pos.forEach(
    (po) => {

      for (
        let box = start;
        box <= end;
        box++
      ) {

        for (
          let repeatIndex = 1;
          repeatIndex <= repeat;
          repeatIndex++
        ) {

          for (
            let copyIndex = 1;
            copyIndex <= copies;
            copyIndex++
          ) {

            sequence.push({
              po,
              box,
              repeatIndex,
              copyIndex
            });

          }

        }

      }

    }
  );


  return sequence;

}


/* =========================================================
   BORDER
========================================================= */

function borderWidth() {

  const value =
    $("#borderSize")?.value;

  if (
    value === "thin"
  ) {
    return "1px";
  }

  if (
    value === "thick"
  ) {
    return "4px";
  }

  return "2px";

}


function borderValue() {

  return `
    ${borderWidth()}
    ${$("#borderStyle")?.value || "solid"}
    ${$("#borderColor")?.value || "#111827"}
  `;

}


/* =========================================================
   PO LABEL PREVIEW
========================================================= */

function updatePreview() {

  if (
    currentTool !==
      "Coco Blue PO" &&
    currentTool !==
      "Other PO"
  ) {
    return;
  }


  const sequence =
    buildSequence();


  const labelsPerPage =
    Math.max(
      1,
      Number(
        $("#labelsPerPage")?.value
      ) || 1
    );


  const previewPage =
    $("#previewPage");


  if (!previewPage)
    return;


  /*
    70 × 35 preview is kept
    proportional through aspect ratio.
  */

  const dimensions =
    pageDimensions();


  previewPage.style.aspectRatio =
    `${dimensions.width}/${dimensions.height}`;


  /*
    Currently HTML has two preview
    label slots.

    If user selects 1:
      one label

    If selects 2:
      two half-page labels
  */

  const previewLabels =
    [
      $("#previewLabel1"),
      $("#previewLabel2")
    ];


  previewLabels.forEach(
    (label, index) => {

      if (!label)
        return;


      label.style.display =
        index < labelsPerPage
          ? "flex"
          : "none";


      const item =
        sequence[index];


      if (!item) {

        label.innerHTML = `
          <div class="preview-inner">
            <div class="preview-empty">
              EMPTY LABEL
            </div>
          </div>
        `;

        return;

      }


      let content = "";


      /*
        NEW:

        PO + BOX

        Example:

        PO001
        BOX 001

        as one combined label feature.
      */

      if (
        $("#poPlusBox")?.checked
      ) {

        content = `
          <div
            class="preview-po"
            style="
              font-family:${escapeHTML(
                $("#poFontFamily")?.value ||
                "Arial"
              )};
              font-size:${Number(
                $("#poFontSize")?.value ||
                18
              )}px;
              font-weight:${
                $("#poBold")?.checked
                  ? 900
                  : 400
              };
              font-style:${
                $("#poItalic")?.checked
                  ? "italic"
                  : "normal"
              };
              text-decoration:${
                $("#poUnderline")?.checked
                  ? "underline"
                  : "none"
              };
            "
          >
            ${escapeHTML(item.po)}
          </div>

          <div
            class="preview-box"
            style="
              font-family:${escapeHTML(
                $("#boxFontFamily")?.value ||
                "Arial"
              )};
              font-size:${Number(
                $("#boxFontSize")?.value ||
                18
              )}px;
              font-weight:${
                $("#boxBold")?.checked
                  ? 900
                  : 400
              };
              font-style:${
                $("#boxItalic")?.checked
                  ? "italic"
                  : "normal"
              };
              text-decoration:${
                $("#boxUnderline")?.checked
                  ? "underline"
                  : "none"
              };
            "
          >
            BOX ${escapeHTML(item.box)}
          </div>
        `;

      } else {

        /*
          Normal PO
        */

        if (
          $("#printPO")?.checked
        ) {

          content += `
            <div
              class="preview-po"
              style="
                font-family:${escapeHTML(
                  $("#poFontFamily")?.value ||
                  "Arial"
                )};
                font-size:${Number(
                  $("#poFontSize")?.value ||
                  18
                )}px;
                font-weight:${
                  $("#poBold")?.checked
                    ? 900
                    : 400
                };
                font-style:${
                  $("#poItalic")?.checked
                    ? "italic"
                    : "normal"
                };
                text-decoration:${
                  $("#poUnderline")?.checked
                    ? "underline"
                    : "none"
                };
              "
            >
              ${escapeHTML(item.po)}
            </div>
          `;

        }


        /*
          Normal BOX
        */

        if (
          $("#printBox")?.checked
        ) {

          content += `
            <div
              class="preview-box"
              style="
                font-family:${escapeHTML(
                  $("#boxFontFamily")?.value ||
                  "Arial"
                )};
                font-size:${Number(
                  $("#boxFontSize")?.value ||
                  18
                )}px;
                font-weight:${
                  $("#boxBold")?.checked
                    ? 900
                    : 400
                };
                font-style:${
                  $("#boxItalic")?.checked
                    ? "italic"
                    : "normal"
                };
                text-decoration:${
                  $("#boxUnderline")?.checked
                    ? "underline"
                    : "none"
                };
              "
            >
              BOX ${escapeHTML(item.box)}
            </div>
          `;

        }

      }


      label.innerHTML = `
        <div class="preview-inner">
          ${content}
        </div>
      `;


      applyLabelBorder(label);

    }
  );

}


/* =========================================================
   LABEL BORDER LOGIC
========================================================= */

function applyLabelBorder(label) {

  if (
    !$("#pageBorder")?.checked
  ) {

    label.style.border =
      "0";

  }


  const inner =
    label.querySelector(
      ".preview-inner"
    );


  if (!inner)
    return;


  /*
    COMBINED BORDER
  */

  if (
    $("#combinedBorder")?.checked
  ) {

    label.style.border =
      borderValue();

    inner
      .querySelector(
        ".preview-po"
      )
      ?.style.setProperty(
        "border",
        "0"
      );

    inner
      .querySelector(
        ".preview-box"
      )
      ?.style.setProperty(
        "border",
        "0"
      );

    return;

  }


  /*
    PO BORDER
  */

  label.style.border =
    $("#pageBorder")?.checked
      ? "0"
      : "0";


  const po =
    inner.querySelector(
      ".preview-po"
    );

  const box =
    inner.querySelector(
      ".preview-box"
    );


  if (po) {

    po.style.border =
      $("#poBorder")?.checked
        ? borderValue()
        : "0";

  }


  if (box) {

    box.style.border =
      $("#boxBorder")?.checked
        ? borderValue()
        : "0";

  }

}


/* =========================================================
   ISBN MODE
========================================================= */

$$("[data-isbn-mode]")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          isbnMode =
            button.dataset.isbnMode;

          $$("[data-isbn-mode]")
            .forEach(
              btn => {
                btn.classList.remove(
                  "active"
                );
              }
            );

          button.classList.add(
            "active"
          );


          $("#isbnManual").style.display =
            isbnMode === "manual"
              ? ""
              : "none";

          $("#isbnExcel").style.display =
            isbnMode === "excel"
              ? ""
              : "none";


          updateISBNPreview();

        }
      );

    }
  );


/* =========================================================
   ISBN VALIDATION
========================================================= */

function validateISBN() {

  const isbn =
    $("#isbnValue")
      ?.value
      .trim();

  const title =
    $("#isbnTitle")
      ?.value
      .trim();


  if (!isbn) {

    toast(
      "ISBN is mandatory.",
      "error"
    );

    return false;

  }


  if (!title) {

    toast(
      "Book Title is mandatory.",
      "error"
    );

    return false;

  }


  /*
    No artificial character
    length restriction.

    Alphanumeric, numeric,
    alphabetic all allowed.
  */

  return true;

}


/* =========================================================
   ISBN PREVIEW
========================================================= */

function updateISBNPreview() {

  if (
    currentTool !==
    "ISBN Barcode"
  ) {
    return;
  }


  const title =
    $("#isbnTitle")
      ?.value
      .trim() ||
    "Book Title";


  const edition =
    $("#isbnEdition")
      ?.value
      .trim() ||
    "";


  $("#isbnPreviewTitle").textContent =
    title;


  $("#isbnPreviewEdition").textContent =
    edition
      ? `Edition: ${edition}`
      : "";


  const svg =
    $("#isbnBarcode");


  if (!svg)
    return;


  svg.innerHTML = "";


  const isbn =
    $("#isbnValue")
      ?.value
      .trim();


  if (!isbn)
    return;


  if (
    typeof JsBarcode ===
    "undefined"
  ) {
    return;
  }


  try {

    JsBarcode(
      svg,
      isbn,
      {
        format: "CODE128",
        displayValue: true,
        fontSize: 14,
        margin: 8,
        height: 70,
        width: 2
      }
    );

  } catch (error) {

    console.error(error);

  }

}


/* =========================================================
   ADDRESS MODE
========================================================= */

$$("[data-address-mode]")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          addressMode =
            button.dataset.addressMode;


          $$("[data-address-mode]")
            .forEach(
              btn => {
                btn.classList.remove(
                  "active"
                );
              }
            );


          button.classList.add(
            "active"
          );


          $("#addressManual").style.display =
            addressMode === "manual"
              ? ""
              : "none";


          $("#addressExcel").style.display =
            addressMode === "excel"
              ? ""
              : "none";


          updateAddressPreview();

        }
      );

    }
  );


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


  const fromName =
    $("#fromName")
      ?.value
      .trim() ||
    "From Name";


  const fromAddress =
    $("#fromAddress")
      ?.value
      .trim() ||
    "From Address";


  const toName =
    $("#toName")
      ?.value
      .trim() ||
    "To Name";


  const toAddress =
    $("#toAddress")
      ?.value
      .trim() ||
    "To Address";


  $("#previewFromName").textContent =
    fromName;

  $("#previewFromAddress").textContent =
    fromAddress;

  $("#previewToName").textContent =
    toName;

  $("#previewToAddress").textContent =
    toAddress;


  const fromSide =
    document.querySelector(
      ".address-preview-side:first-child"
    );

  const toSide =
    document.querySelector(
      ".address-preview-side:last-child"
    );


  if (fromSide) {

    const style =
      $("#fromBorderStyle")
        ?.value ||
      "none";


    fromSide.style.border =
      style === "none"
        ? ""
        : `2px ${style} #203d72`;

  }


  if (toSide) {

    const style =
      $("#toBorderStyle")
        ?.value ||
      "none";


    toSide.style.border =
      style === "none"
        ? ""
        : `2px ${style} #203d72`;

  }


  applyAddressTextStyle(
    $("#previewFromName"),
    "from"
  );

  applyAddressTextStyle(
    $("#previewFromAddress"),
    "from"
  );

  applyAddressTextStyle(
    $("#previewToName"),
    "to"
  );

  applyAddressTextStyle(
    $("#previewToAddress"),
    "to"
  );

}


function applyAddressTextStyle(
  element,
  side
) {

  if (!element)
    return;


  const prefix =
    side === "from"
      ? "from"
      : "to";


  element.style.fontFamily =
    $(`#${prefix}FontFamily`)
      ?.value ||
    "Arial";


  element.style.fontSize =
    `${Number(
      $(`#${prefix}FontSize`)
        ?.value ||
      18
    )}px`;


  element.style.fontWeight =
    $(`#${prefix}Bold`)
      ?.checked
      ? "900"
      : "400";


  element.style.fontStyle =
    $(`#${prefix}Italic`)
      ?.checked
      ? "italic"
      : "normal";


  element.style.textDecoration =
    $(`#${prefix}Underline`)
      ?.checked
      ? "underline"
      : "none";

}


/* =========================================================
   LIVE INPUT
========================================================= */

document.addEventListener(
  "input",
  (event) => {

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
   EXCEL
========================================================= */

async function readWorkbook(file) {

  if (
    typeof XLSX ===
    "undefined"
  ) {

    throw new Error(
      "Excel library is not loaded."
    );

  }


  const buffer =
    await file.arrayBuffer();


  return XLSX.read(
    buffer,
    {
      type: "array"
    }
  );

}


/* =========================================================
   RENDER EXCEL
========================================================= */

function renderExcel(
  rows,
  target
) {

  if (!target)
    return;


  if (!rows.length) {

    target.innerHTML = "";

    return;

  }


  const columns =
    Object.keys(rows[0]);


  let html =
    "<table><thead><tr>";


  columns.forEach(
    column => {

      html += `
        <th>
          ${escapeHTML(column)}
        </th>
      `;

    }
  );


  html +=
    "</tr></thead><tbody>";


  rows
    .slice(0, 100)
    .forEach(
      row => {

        html +=
          "<tr>";


        columns.forEach(
          column => {

            html += `
              <td>
                ${escapeHTML(
                  row[column]
                )}
              </td>
            `;

          }
        );


        html +=
          "</tr>";

      }
    );


  html +=
    "</tbody></table>";


  target.innerHTML =
    html;

}


/* =========================================================
   PO EXCEL
========================================================= */

$("#poExcelFile")
  ?.addEventListener(
    "change",
    async function () {

      const file =
        this.files?.[0];

      if (!file)
        return;


      try {

        const workbook =
          await readWorkbook(
            file
          );


        const sheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];


        poExcelRows =
          XLSX.utils.sheet_to_json(
            sheet,
            {
              defval: ""
            }
          );


        renderExcel(
          poExcelRows,
          $("#poExcelPreview")
        );


        $("#poExcelStatus")
          .textContent =
          `${poExcelRows.length} row(s) loaded.`;


        toast(
          `${poExcelRows.length} PO row(s) loaded.`
        );


        updatePreview();

      } catch (error) {

        console.error(error);

        toast(
          "PO Excel could not be read.",
          "error"
        );

      }

    }
  );


/* =========================================================
   ISBN EXCEL
========================================================= */

$("#isbnExcelFile")
  ?.addEventListener(
    "change",
    async function () {

      const file =
        this.files?.[0];

      if (!file)
        return;


      try {

        const workbook =
          await readWorkbook(
            file
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


        if (
          rows.length < 2
        ) {

          throw new Error(
            "ISBN Excel has no data."
          );

        }


        const headers =
          rows[0].map(
            value =>
              String(value)
                .trim()
                .toLowerCase()
          );


        let isbnIndex =
          headers.indexOf(
            "isbn"
          );

        let titleIndex =
          headers.indexOf(
            "title"
          );

        let editionIndex =
          headers.indexOf(
            "edition"
          );


        if (
          isbnIndex < 0
        ) {
          isbnIndex = 0;
        }


        if (
          titleIndex < 0
        ) {
          titleIndex = 1;
        }


        if (
          editionIndex < 0
        ) {
          editionIndex = 2;
        }


        isbnExcelRows =
          rows
            .slice(1)
            .map(
              row => ({

                ISBN:
                  String(
                    row[isbnIndex] ??
                    ""
                  ).trim(),

                Title:
                  String(
                    row[titleIndex] ??
                    ""
                  ).trim(),

                Edition:
                  String(
                    row[editionIndex] ??
                    ""
                  ).trim()

              })
            )
            .filter(
              row =>
                row.ISBN ||
                row.Title
            );


        const invalid =
          isbnExcelRows.some(
            row =>
              !row.ISBN ||
              !row.Title
          );


        if (invalid) {

          throw new Error(
            "ISBN and Title are mandatory."
          );

        }


        renderExcel(
          isbnExcelRows,
          $("#isbnExcelPreview")
        );


        $("#isbnExcelStatus")
          .textContent =
          `${isbnExcelRows.length} row(s) loaded.`;


        toast(
          `${isbnExcelRows.length} ISBN row(s) loaded.`
        );

      } catch (error) {

        console.error(error);

        toast(
          error.message ||
          "ISBN Excel could not be read.",
          "error"
        );

      }

    }
  );


/* =========================================================
   ADDRESS EXCEL
========================================================= */

$("#addressExcelFile")
  ?.addEventListener(
    "change",
    async function () {

      const file =
        this.files?.[0];

      if (!file)
        return;


      try {

        const workbook =
          await readWorkbook(
            file
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


        if (
          rows.length < 2
        ) {

          throw new Error(
            "Address Excel needs From and To columns."
          );

        }


        const headers =
          rows[0].map(
            value =>
              String(value)
                .trim()
                .toLowerCase()
          );


        const fromIndex =
          headers.indexOf(
            "from"
          );

        const toIndex =
          headers.indexOf(
            "to"
          );


        if (
          fromIndex === -1 ||
          toIndex === -1
        ) {

          throw new Error(
            "Address Excel must have headers: From and To."
          );

        }


        addressExcelRows =
          rows
            .slice(1)
            .map(
              row => ({

                From:
                  String(
                    row[fromIndex] ??
                    ""
                  ).trim(),

                To:
                  String(
                    row[toIndex] ??
                    ""
                  ).trim()

              })
            )
            .filter(
              row =>
                row.From ||
                row.To
            );


        renderExcel(
          addressExcelRows,
          $("#addressExcelPreview")
        );


        $("#addressExcelStatus")
          .textContent =
          `${addressExcelRows.length} row(s) loaded.`;


        toast(
          `${addressExcelRows.length} address row(s) loaded.`
        );

      } catch (error) {

        console.error(error);

        toast(
          error.message ||
          "Address Excel could not be read.",
          "error"
        );

      }

    }
  );


/* =========================================================
   RESET
========================================================= */

$("#resetButton")
  ?.addEventListener(
    "click",
    () => {

      $$(
        "input, textarea"
      ).forEach(
        input => {

          if (
            input.type ===
            "checkbox"
          ) {

            input.checked =
              false;

          } else if (
            input.type !==
              "file" &&
            input.type !==
              "color"
          ) {

            input.value = "";

          }

        }
      );


      /*
        Defaults
      */

      $("#printPO").checked =
        true;

      $("#printBox").checked =
        true;

      $("#pageBorder").checked =
        true;

      $("#poBorder").checked =
        true;

      $("#boxBorder").checked =
        true;


      $("#poPlusBox").checked =
        false;

      $("#combinedBorder").checked =
        false;


      $("#startBox").value =
        1;

      $("#endBox").value =
        1;

      $("#repeatCount").value =
        1;

      $("#copies").value =
        1;

      $("#labelsPerPage").value =
        1;


      $("#pageSize").value =
        "4x6";

      $("#orientation").value =
        "portrait";


      $("#customWidth").value =
        101.6;

      $("#customHeight").value =
        152.4;


      poExcelRows = [];
      isbnExcelRows = [];
      addressExcelRows = [];


      if (
        $("#poExcelPreview")
      ) {
        $("#poExcelPreview")
          .innerHTML = "";
      }


      if (
        $("#isbnExcelPreview")
      ) {
        $("#isbnExcelPreview")
          .innerHTML = "";
      }


      if (
        $("#addressExcelPreview")
      ) {
        $("#addressExcelPreview")
          .innerHTML = "";
      }


      updatePageSizeLock();
      updatePOFeatureLocks();
      updateCombinedBorderLock();

      updatePreview();
      updateISBNPreview();
      updateAddressPreview();


      toast(
        "Settings reset."
      );

    }
  );


/* =========================================================
   PDF
========================================================= */

function getJsPDF() {

  if (
    typeof window.jspdf ===
    "undefined"
  ) {

    throw new Error(
      "PDF library is not available."
    );

  }

  return window.jspdf.jsPDF;

}


function getPDFPageSize() {

  const dimensions =
    pageDimensions();

  return [
    dimensions.width,
    dimensions.height
  ];

}


/* =========================================================
   PDF FONT
========================================================= */

function pdfFont(font) {

  const value =
    String(
      font || ""
    ).toLowerCase();


  if (
    value.includes(
      "times"
    )
  ) {
    return "times";
  }


  if (
    value.includes(
      "courier"
    )
  ) {
    return "courier";
  }


  return "helvetica";

}


function pdfFontStyle(
  type
) {

  const bold =
    $(`#${type}Bold`)
      ?.checked;

  const italic =
    $(`#${type}Italic`)
      ?.checked;


  if (
    bold &&
    italic
  ) {
    return "bolditalic";
  }


  if (bold)
    return "bold";


  if (italic)
    return "italic";


  return "normal";

}


/* =========================================================
   DRAW UNDERLINE
========================================================= */

function drawUnderlinedText(
  doc,
  text,
  x,
  y,
  align = "center"
) {

  doc.text(
    text,
    x,
    y,
    {
      align
    }
  );


  const width =
    doc.getTextWidth(
      text
    );


  let startX =
    x;


  if (
    align ===
    "center"
  ) {

    startX =
      x -
      width / 2;

  }


  doc.setLineWidth(
    0.3
  );


  doc.line(
    startX,
    y + 1,
    startX + width,
    y + 1
  );

}


/* =========================================================
   PO PDF
========================================================= */

function generatePOLabelPDF() {

  const JsPDF =
    getJsPDF();


  const dimensions =
    pageDimensions();


  const sequence =
    buildSequence();


  if (
    !sequence.length
  ) {

    throw new Error(
      "Enter at least one PO number."
    );

  }


  const perPage =
    Math.max(
      1,
      Number(
        $("#labelsPerPage")
          ?.value
      ) || 1
    );


  const doc =
    new JsPDF({
      unit: "mm",
      format:
        getPDFPageSize()
    });


  const pages =
    Math.ceil(
      sequence.length /
      perPage
    );


  for (
    let pageIndex = 0;
    pageIndex < pages;
    pageIndex++
  ) {

    if (
      pageIndex > 0
    ) {

      doc.addPage(
        getPDFPageSize()
      );

    }


    const pageItems =
      sequence.slice(
        pageIndex *
          perPage,

        pageIndex *
          perPage +
          perPage
      );


    const slotHeight =
      dimensions.height /
      perPage;


    pageItems.forEach(
      (item, index) => {

        const top =
          index *
          slotHeight;


        const x = 3;
        const y =
          top + 3;

        const w =
          dimensions.width -
          6;

        const h =
          slotHeight -
          6;


        /*
          PAGE BORDER
        */

        if (
          $("#pageBorder")
            ?.checked
        ) {

          let lineWidth =
            0.7;


          if (
            $("#borderSize")
              ?.value ===
            "thin"
          ) {
            lineWidth =
              0.35;
          }


          if (
            $("#borderSize")
              ?.value ===
            "thick"
          ) {
            lineWidth =
              1.5;
          }


          doc.setLineWidth(
            lineWidth
          );


          doc.setDrawColor(
            $("#borderColor")
              ?.value ||
            "#111827"
          );


          const style =
            $("#borderStyle")
              ?.value ||
            "solid";


          if (
            style ===
            "dashed"
          ) {

            doc.setLineDashPattern(
              [3, 2],
              0
            );

          } else if (
            style ===
            "dotted"
          ) {

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
            w,
            h
          );


          doc.setLineDashPattern(
            [],
            0
          );

        }


        const centerX =
          dimensions.width /
          2;


        const centerY =
          top +
          slotHeight /
          2;


        /*
          COMBINED BORDER
        */

        if (
          $("#combinedBorder")
            ?.checked
        ) {

          doc.setDrawColor(
            $("#borderColor")
              ?.value ||
            "#111827"
          );


          doc.rect(
            8,
            top + 8,
            dimensions.width -
              16,
            slotHeight -
              16
          );

        }


        /*
          PO + BOX
        */

        if (
          $("#poPlusBox")
            ?.checked
        ) {

          /*
            PO
          */

          doc.setFont(
            pdfFont(
              $("#poFontFamily")
                ?.value
            ),
            pdfFontStyle(
              "po"
            )
          );


          doc.setFontSize(
            Number(
              $("#poFontSize")
                ?.value ||
              18
            )
          );


          doc.setTextColor(
            "#203d72"
          );


          const poText =
            String(
              item.po
            );


          if (
            $("#poUnderline")
              ?.checked
          ) {

            drawUnderlinedText(
              doc,
              poText,
              centerX,
              centerY - 7
            );

          } else {

            doc.text(
              poText,
              centerX,
              centerY - 7,
              {
                align:
                  "center"
              }
            );

          }


          /*
            BOX
          */

          doc.setFont(
            pdfFont(
              $("#boxFontFamily")
                ?.value
            ),
            pdfFontStyle(
              "box"
            )
          );


          doc.setFontSize(
            Number(
              $("#boxFontSize")
                ?.value ||
              18
            )
          );


          const boxText =
            `BOX ${item.box}`;


          if (
            $("#boxUnderline")
              ?.checked
          ) {

            drawUnderlinedText(
              doc,
              boxText,
              centerX,
              centerY + 12
            );

          } else {

            doc.text(
              boxText,
              centerX,
              centerY + 12,
              {
                align:
                  "center"
              }
            );

          }

        } else {

          /*
            NORMAL PO
          */

          if (
            $("#printPO")
              ?.checked
          ) {

            doc.setFont(
              pdfFont(
                $("#poFontFamily")
                  ?.value
              ),
              pdfFontStyle(
                "po"
              )
            );


            doc.setFontSize(
              Number(
                $("#poFontSize")
                  ?.value ||
                18
              )
            );


            const poText =
              String(
                item.po
              );


            if (
              $("#poUnderline")
                ?.checked
            ) {

              drawUnderlinedText(
                doc,
                poText,
                centerX,
                centerY - 5
              );

            } else {

              doc.text(
                poText,
                centerX,
                centerY - 5,
                {
                  align:
                    "center"
                }
              );

            }

          }


          /*
            NORMAL BOX
          */

          if (
            $("#printBox")
              ?.checked
          ) {

            doc.setFont(
              pdfFont(
                $("#boxFontFamily")
                  ?.value
              ),
              pdfFontStyle(
                "box"
              )
            );


            doc.setFontSize(
              Number(
                $("#boxFontSize")
                  ?.value ||
                18
              )
            );


            const boxText =
              `BOX ${item.box}`;


            if (
              $("#boxUnderline")
                ?.checked
            ) {

              drawUnderlinedText(
                doc,
                boxText,
                centerX,
                centerY + 12
              );

            } else {

              doc.text(
                boxText,
                centerX,
                centerY + 12,
                {
                  align:
                    "center"
                }
              );

            }

          }

        }


        /*
          CUT LINE
        */

        if (
          $("#cutLine")
            ?.checked &&
          index <
            pageItems.length - 1
        ) {

          doc.setDrawColor(
            "#777777"
          );

          doc.setLineDashPattern(
            [3, 2],
            0
          );


          doc.line(
            5,
            top +
              slotHeight,
            dimensions.width -
              5,
            top +
              slotHeight
          );


          doc.setLineDashPattern(
            [],
            0
          );

        }


        /*
          SCISSOR
        */

        if (
          $("#scissorMark")
            ?.checked
        ) {

          drawScissorMarks(
            doc,
            dimensions.width,
            top,
            slotHeight
          );

        }

      }
    );

  }


  doc.save(
    `${safeName(
      currentTool
    )}_Labels.pdf`
  );

}


/* =========================================================
   SCISSOR
========================================================= */

function drawScissorMarks(
  doc,
  width,
  top,
  slotHeight
) {

  const y =
    top +
    slotHeight;


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(
    7
  );


  doc.text(
    "X",
    3,
    y - 1
  );


  doc.text(
    "X",
    width - 6,
    y - 1
  );

}


/* =========================================================
   ISBN PDF
========================================================= */

async function generateISBNBarcodePDF() {

  if (
    isbnMode ===
    "manual"
  ) {

    if (
      !validateISBN()
    ) {
      return;
    }

  }


  if (
    isbnMode ===
    "excel"
  ) {

    if (
      !isbnExcelRows.length
    ) {

      throw new Error(
        "Upload ISBN Excel first."
      );

    }

  }


  const JsPDF =
    getJsPDF();


  const dimensions =
    pageDimensions();


  const rows =
    isbnMode ===
      "excel"
      ? isbnExcelRows
      : [
          {
            ISBN:
              $("#isbnValue")
                ?.value
                .trim(),

            Title:
              $("#isbnTitle")
                ?.value
                .trim(),

            Edition:
              $("#isbnEdition")
                ?.value
                .trim()
          }
        ];


  const doc =
    new JsPDF({
      unit: "mm",
      format:
        getPDFPageSize()
    });


  for (
    let i = 0;
    i < rows.length;
    i++
  ) {

    if (
      i > 0
    ) {

      doc.addPage(
        getPDFPageSize()
      );

    }


    const row =
      rows[i];


    const centerX =
      dimensions.width /
      2;


    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.setFontSize(
      16
    );


    doc.text(
      String(row.Title),
      centerX,
      20,
      {
        align:
          "center"
      }
    );


    if (
      row.Edition
    ) {

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(
        9
      );


      doc.text(
        `Edition: ${row.Edition}`,
        centerX,
        28,
        {
          align:
            "center"
        }
      );

    }


    /*
      Generate barcode SVG
    */

    const svg =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );


    if (
      typeof JsBarcode ===
      "undefined"
    ) {

      throw new Error(
        "Barcode library is not available."
      );

    }


    JsBarcode(
      svg,
      String(row.ISBN),
      {
        format:
          "CODE128",

        displayValue:
          true,

        fontSize:
          12,

        margin:
          8,

        height:
          60,

        width:
          2
      }
    );


    const svgString =
      new XMLSerializer()
        .serializeToString(
          svg
        );


    const blob =
      new Blob(
        [svgString],
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
      await new Promise(
        (resolve, reject) => {

          const img =
            new Image();

          img.onload =
            () => resolve(img);

          img.onerror =
            reject;

          img.src =
            url;

        }
      );


    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width =
      image.width;

    canvas.height =
      image.height;


    canvas
      .getContext("2d")
      .drawImage(
        image,
        0,
        0
      );


    const data =
      canvas.toDataURL(
        "image/png"
      );


    URL.revokeObjectURL(
      url
    );


    doc.addImage(
      data,
      "PNG",
      10,
      dimensions.height / 2 - 20,
      dimensions.width - 20,
      40
    );

  }


  doc.save(
    "ISBN_Barcodes.pdf"
  );


  toast(
    `${rows.length} ISBN barcode(s) generated.`
  );

}


/* =========================================================
   ADDRESS PDF
========================================================= */

function generateAddressPDF() {

  const JsPDF =
    getJsPDF();


  const dimensions =
    pageDimensions();


  let rows = [];


  if (
    addressMode ===
      "excel" &&
    addressExcelRows.length
  ) {

    rows =
      addressExcelRows;

  } else {

    rows = [
      {
        From:
          `${$("#fromName")
            ?.value
            .trim() || ""}\n${
            $("#fromAddress")
              ?.value
              .trim() || ""
          }`,

        To:
          `${$("#toName")
            ?.value
            .trim() || ""}\n${
            $("#toAddress")
              ?.value
              .trim() || ""
          }`
      }
    ];

  }


  const doc =
    new JsPDF({
      unit: "mm",
      format:
        getPDFPageSize()
    });


  rows.forEach(
    (row, index) => {

      if (
        index > 0
      ) {

        doc.addPage(
          getPDFPageSize()
        );

      }


      drawAddressPage(
        doc,
        row,
        dimensions
      );

    }
  );


  doc.save(
    "Address_Stickers.pdf"
  );


  toast(
    `${rows.length} address sticker(s) generated.`
  );

}


/* =========================================================
   ADDRESS PAGE
========================================================= */

function drawAddressPage(
  doc,
  row,
  dimensions
) {

  const width =
    dimensions.width;

  const height =
    dimensions.height;


  const margin = 5;


  /*
    PAGE BORDER
  */

  if (
    $("#pageBorder")
      ?.checked
  ) {

    doc.setDrawColor(
      $("#borderColor")
        ?.value ||
      "#111827"
    );


    doc.rect(
      margin,
      margin,
      width -
        margin * 2,
      height -
        margin * 2
    );

  }


  const half =
    width / 2;


  const fromText =
    row.From || "";


  const toText =
    row.To || "";


  /*
    FROM BORDER
  */

  const fromBorder =
    $("#fromBorderStyle")
      ?.value ||
    "none";


  if (
    fromBorder !==
    "none"
  ) {

    doc.setDrawColor(
      "#203d72"
    );


    doc.rect(
      margin + 3,
      margin + 10,
      half -
        margin -
        8,
      height - 20
    );

  }


  /*
    TO BORDER
  */

  const toBorder =
    $("#toBorderStyle")
      ?.value ||
    "none";


  if (
    toBorder !==
    "none"
  ) {

    doc.setDrawColor(
      "#203d72"
    );


    doc.rect(
      half + 3,
      margin + 10,
      half -
        margin -
        8,
      height - 20
    );

  }


  /*
    FROM
  */

  doc.setFont(
    pdfFont(
      $("#fromFontFamily")
        ?.value ||
      "Arial"
    ),
    pdfFontStyle(
      "from"
    )
  );


  doc.setFontSize(
    Number(
      $("#fromFontSize")
        ?.value ||
      18
    )
  );


  doc.text(
    "FROM",
    margin + 8,
    margin + 18
  );


  const fromLines =
    doc.splitTextToSize(
      fromText,
      half - 22
    );


  doc.text(
    fromLines,
    margin + 8,
    margin + 30
  );


  /*
    TO
  */

  doc.setFont(
    pdfFont(
      $("#toFontFamily")
        ?.value ||
      "Arial"
    ),
    pdfFontStyle(
      "to"
    )
  );


  doc.setFontSize(
    Number(
      $("#toFontSize")
        ?.value ||
      18
    )
  );


  doc.text(
    "TO",
    half + 8,
    margin + 18
  );


  const toLines =
    doc.splitTextToSize(
      toText,
      half - 22
    );


  doc.text(
    toLines,
    half + 8,
    margin + 30
  );


  /*
    DIVIDER
  */

  doc.setDrawColor(
    "#777777"
  );


  doc.setLineDashPattern(
    [3, 2],
    0
  );


  doc.line(
    half,
    margin + 5,
    half,
    height -
      margin -
      5
  );


  doc.setLineDashPattern(
    [],
    0
  );

}


/* =========================================================
   GENERATE ROUTER
========================================================= */

async function generatePDF() {

  if (
    currentTool ===
    "ISBN Barcode"
  ) {

    await generateISBNBarcodePDF();

    return;

  }


  if (
    currentTool ===
    "Address Sticker"
  ) {

    generateAddressPDF();

    return;

  }


  if (
    currentTool ===
      "Coco Blue PO" ||
    currentTool ===
      "Other PO"
  ) {

    generatePOLabelPDF();

    return;

  }


  throw new Error(
    "Select a label category first."
  );

}


/* =========================================================
   GENERATE BUTTON
========================================================= */

$("#generateButton")
  ?.addEventListener(
    "click",
    async () => {

      const button =
        $("#generateButton");


      button.disabled =
        true;


      button.textContent =
        "GENERATING...";


      try {

        await generatePDF();

      } catch (error) {

        console.error(
          error
        );


        toast(
          error.message ||
          "Generation failed.",
          "error"
        );

      } finally {

        button.disabled =
          false;

        button.textContent =
          "GENERATE";

      }

    }
  );


/* =========================================================
   QR CODE
========================================================= */

function createQR() {

  if (
    typeof QRCode ===
    "undefined"
  ) {

    console.warn(
      "QRCode library unavailable."
    );

    return;

  }


  const locationQR =
    $("#locationQR");


  const emailQR =
    $("#emailQR");


  if (
    locationQR
  ) {

    locationQR.innerHTML =
      "";


    new QRCode(
      locationQR,
      {
        text:
          CONFIG.map,

        width:
          130,

        height:
          130,

        correctLevel:
          QRCode.CorrectLevel.M
      }
    );

  }


  if (
    emailQR
  ) {

    emailQR.innerHTML =
      "";


    new QRCode(
      emailQR,
      {
        text:
          `mailto:${CONFIG.email}`,

        width:
          130,

        height:
          130,

        correctLevel:
          QRCode.CorrectLevel.M
      }
    );

  }

}


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key.toLowerCase() ===
        "enter"
    ) {

      event.preventDefault();

      $("#generateButton")
        ?.click();

    }

  }
);


/* =========================================================
   INITIALIZATION
========================================================= */

(function init() {

  const language =
    localStorage.getItem(
      "booksWagonLanguage"
    ) ||
    "en";


  setLanguage(
    language
  );


  updatePageSizeLock();

  updatePOFeatureLocks();

  updateCombinedBorderLock();

  createQR();

  updatePreview();

  updateISBNPreview();

  updateAddressPreview();

})();
