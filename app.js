"use strict";

/* =========================================================
   BOOKS LABEL STUDIO
   FINAL SCRIPT.JS
========================================================= */

const APP = {
  email: "ashish.verma@bookswagon.in",
  map:
    "https://maps.app.goo.gl/7McYApm1u9x4QSj7A",

  currentTool: "",
  currentSubMode: "individual",
  isbnMode: "manual",
  addressMode: "manual",

  poExcelRows: [],
  isbnExcelRows: [],
  addressExcelRows: []
};


/* =========================================================
   DOM HELPERS
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


function safeFileName(value) {
  return String(value || "Labels")
    .replace(/[^a-z0-9_-]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "Labels";
}


/* =========================================================
   TOAST
   No confirmation dialogs.
   Only visual notification.
========================================================= */

function showToast(message, type = "success") {
  const container = $("#toastContainer");

  if (!container) return;

  const toast = document.createElement("div");

  toast.className =
    type === "error"
      ? "toast error"
      : "toast";

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
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
    chooseTool: "Choose your label tool",
    chooseText: "Select a category to start."
  },

  hi: {
    tools: "टूल्स",
    support: "सपोर्ट",
    about: "अबाउट",
    heroText:
      "PO लेबल, ISBN बारकोड और Address Sticker बनाएं। Page Size, Excel Upload और Print Controls उपलब्ध हैं।",
    openStudio: "स्टूडियो खोलें",
    contact: "कॉन्टैक्ट",
    chooseTool: "अपना लेबल टूल चुनें",
    chooseText: "शुरू करने के लिए कैटेगरी चुनें।"
  }
};


function setLanguage(language) {
  const lang =
    language === "hi"
      ? "hi"
      : "en";

  document.documentElement.lang =
    lang;

  $$("[data-i18n]").forEach(
    (element) => {

      const key =
        element.dataset.i18n;

      if (
        translations[lang] &&
        translations[lang][key]
      ) {
        element.textContent =
          translations[lang][key];
      }
    }
  );

  $$(".lang-btn").forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.lang === lang
      );
    }
  );

  localStorage.setItem(
    "booksLabelLanguage",
    lang
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


function fillFontSelect(selector) {
  const select = $(selector);

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
].forEach(fillFontSelect);


function fillFontSizes(selector) {
  const select = $(selector);

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
].forEach(fillFontSizes);


/* =========================================================
   PO INPUTS
   Maximum manual PO fields = 40
========================================================= */

function createPOInputs() {
  const grid = $("#poGrid");

  if (!grid) return;

  grid.innerHTML = "";

  for (
    let index = 1;
    index <= 40;
    index++
  ) {

    const field =
      document.createElement("div");

    field.className =
      "po-field";

    field.innerHTML = `
      <span>PO ${index}</span>

      <input
        class="po-input"
        type="text"
        placeholder="PO Number ${index}"
        autocomplete="off"
      >
    `;

    grid.appendChild(field);
  }
}


createPOInputs();


/* =========================================================
   TOOL OPEN
========================================================= */

function openTool(tool) {
  APP.currentTool = tool;

  const workspace =
    $("#workspace");

  if (!workspace) return;

  workspace.classList.add(
    "active"
  );

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


  $("#workspaceDescription")
    .textContent =
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

  updatePageSizeLock();

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


$("#closeWorkspace")
  ?.addEventListener(
    "click",
    () => {

      $("#workspace")
        ?.classList.remove(
          "active"
        );

      $("#tools")?.scrollIntoView({
        behavior: "smooth"
      });

    }
  );


/* =========================================================
   COCO BLUE / OTHER PO SUB CATEGORIES
========================================================= */

$$("[data-sub]").forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        APP.currentSubMode =
          button.dataset.sub;


        $$("[data-sub]")
          .forEach(
            (btn) => {
              btn.classList.remove(
                "active"
              );
            }
          );


        button.classList.add(
          "active"
        );


        $("#individualInput")
          .style.display =
          APP.currentSubMode ===
          "individual"
            ? ""
            : "none";


        $("#multipleInput")
          .style.display =
          APP.currentSubMode ===
          "multiple"
            ? ""
            : "none";


        $("#poExcelInput")
          .style.display =
          APP.currentSubMode ===
          "excel"
            ? ""
            : "none";


        updatePreview();

      }
    );

  }
);


/* =========================================================
   PO + BOX NUMBER
========================================================= */

function updatePOFeatureLocks() {

  const poPlusBox =
    $("#poPlusBox");

  const printPO =
    $("#printPO");

  const printBox =
    $("#printBox");


  if (
    !poPlusBox ||
    !printPO ||
    !printBox
  ) {
    return;
  }


  const poWrap =
    printPO.closest(
      ".feature-checkbox"
    );

  const boxWrap =
    printBox.closest(
      ".feature-checkbox"
    );

  const plusWrap =
    poPlusBox.closest(
      ".feature-checkbox"
    );


  if (poPlusBox.checked) {

    printPO.checked =
      false;

    printBox.checked =
      false;


    printPO.disabled =
      true;

    printBox.disabled =
      true;


    poWrap?.classList.add(
      "locked"
    );

    boxWrap?.classList.add(
      "locked"
    );

    plusWrap?.classList.add(
      "active"
    );

  } else {

    printPO.disabled =
      false;

    printBox.disabled =
      false;


    poWrap?.classList.remove(
      "locked"
    );

    boxWrap?.classList.remove(
      "locked"
    );

    plusWrap?.classList.remove(
      "active"
    );
  }
}


/* =========================================================
   COMBINED BORDER
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

  const combinedWrap =
    combined.closest(
      ".feature-checkbox"
    );


  if (combined.checked) {

    po.checked =
      false;

    box.checked =
      false;


    po.disabled =
      true;

    box.disabled =
      true;


    poWrap?.classList.add(
      "locked"
    );

    boxWrap?.classList.add(
      "locked"
    );

    combinedWrap?.classList.add(
      "active"
    );

  } else {

    po.disabled =
      false;

    box.disabled =
      false;


    poWrap?.classList.remove(
      "locked"
    );

    boxWrap?.classList.remove(
      "locked"
    );

    combinedWrap?.classList.remove(
      "active"
    );
  }
}


/* =========================================================
   FEATURE CHECKBOXES
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


          if (
            checkbox.id ===
            "poPlusBox"
          ) {

            updatePOFeatureLocks();

            showToast(
              checkbox.checked
                ? "PO Number + Box Number has been enabled."
                : "PO Number + Box Number has been disabled."
            );

            updatePreview();

            return;
          }


          if (
            checkbox.id ===
            "combinedBorder"
          ) {

            updateCombinedBorderLock();

            showToast(
              checkbox.checked
                ? "Combined Border has been enabled."
                : "Combined Border has been disabled."
            );

            updatePreview();

            return;
          }


          showToast(
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
   FONT TOGGLES
========================================================= */

$$(".font-toggle")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const target =
            $(
              "#" +
              button.dataset.target
            );


          if (!target)
            return;


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


  const isCustom =
    pageSize.value ===
    "CUSTOM";


  customWidth.disabled =
    !isCustom;

  customHeight.disabled =
    !isCustom;


  /*
    Normal page size selected:
    custom fields locked.

    Custom selected:
    custom fields unlocked.
  */


  const messages = {
    "4x6":
      "4 × 6 Inches page selected.",

    "70x35":
      "70 × 35 mm page selected.",

    "A4":
      "A4 page selected.",

    "CUSTOM":
      "Custom page size selected."
  };


  showToast(
    messages[
      pageSize.value
    ] ||
    "Page size selected."
  );


  updatePreview();
  updateAddressPreview();
}


$("#pageSize")
  ?.addEventListener(
    "change",
    updatePageSizeLock
  );


/* =========================================================
   ORIENTATION
========================================================= */

$("#orientation")
  ?.addEventListener(
    "change",
    () => {

      const orientation =
        $("#orientation")
          .value;


      showToast(
        orientation ===
        "landscape"
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

function getPageDimensions() {

  const selected =
    $("#pageSize")?.value ||
    "4x6";


  let width;
  let height;


  /*
    4 × 6 INCHES

    Default:
    101.6 × 152.4 mm
  */

  if (
    selected ===
    "4x6"
  ) {

    width =
      101.6;

    height =
      152.4;
  }


  /*
    70 × 35 MM

    IMPORTANT:
    Width stays 70 mm.
    Height stays 35 mm.

    Landscape is NOT allowed
    to silently convert this into
    35 × 70.

    The selected dimensions remain
    70 × 35.
  */

  else if (
    selected ===
    "70x35"
  ) {

    width =
      70;

    height =
      35;
  }


  /*
    A4
  */

  else if (
    selected ===
    "A4"
  ) {

    width =
      210;

    height =
      297;
  }


  /*
    CUSTOM
  */

  else {

    width =
      Number(
        $("#customWidth")
          ?.value
      ) || 101.6;

    height =
      Number(
        $("#customHeight")
          ?.value
      ) || 152.4;
  }


  /*
    Orientation

    For 70 × 35:
    user specifically wants
    70 width × 35 height.

    Therefore we preserve it.

    Other page sizes can rotate.
  */

  if (
    selected !== "70x35" &&
    $("#orientation")
      ?.value ===
      "landscape"
  ) {

    [
      width,
      height
    ] =
      [
        height,
        width
      ];
  }


  return {
    width,
    height
  };
}


/* =========================================================
   PO VALUES
========================================================= */

function getPOValues() {

  /*
    MULTIPLE
  */

  if (
    APP.currentSubMode ===
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
    APP.currentSubMode ===
    "excel"
  ) {

    return APP.poExcelRows
      .map(
        (row) => {

          const keys =
            Object.keys(row);

          if (
            !keys.length
          ) {
            return "";
          }


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
   BOX SEQUENCE
========================================================= */

function getBoxSequence() {

  const start =
    Math.max(
      1,
      Number(
        $("#startBox")
          ?.value
      ) || 1
    );


  const end =
    Math.max(
      start,
      Number(
        $("#endBox")
          ?.value
      ) || start
    );


  const repeat =
    Math.max(
      1,
      Number(
        $("#repeatCount")
          ?.value
      ) || 1
    );


  const copies =
    Math.max(
      1,
      Number(
        $("#copies")
          ?.value
      ) || 1
    );


  const POs =
    getPOValues();


  const result = [];


  /*
    Page Flow:
    SAME PO FIRST

    Example:

    BW1 Box 1
    BW1 Box 1 repeat
    BW1 Box 2
    BW1 Box 2 repeat

    Then BW2...
  */

  POs.forEach(
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

            result.push({
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


  return result;
}


/* =========================================================
   BORDER
========================================================= */

function getBorderWidth() {

  const value =
    $("#borderSize")
      ?.value;


  if (
    value ===
    "thin"
  ) {
    return "1px";
  }


  if (
    value ===
    "thick"
  ) {
    return "4px";
  }


  return "2px";
}


function getBorderCSS() {

  return `
    ${getBorderWidth()}
    ${$("#borderStyle")?.value || "solid"}
    ${$("#borderColor")?.value || "#111827"}
  `;
}


/* =========================================================
   PREVIEW BORDER
========================================================= */

function applyPreviewBorder(label) {

  const inner =
    label.querySelector(
      ".preview-inner"
    );


  if (!inner)
    return;


  const po =
    inner.querySelector(
      ".preview-po"
    );


  const box =
    inner.querySelector(
      ".preview-box"
    );


  /*
    Combined
  */

  if (
    $("#combinedBorder")
      ?.checked
  ) {

    inner.style.border =
      getBorderCSS();


    if (po) {
      po.style.border =
        "0";
    }


    if (box) {
      box.style.border =
        "0";
    }


    return;
  }


  inner.style.border =
    "0";


  /*
    PO Border
  */

  if (po) {

    const enabled =
      $("#poBorder")
        ?.checked;


    po.style.border =
      enabled
        ? getBorderCSS()
        : "0";


    po.style.padding =
      enabled
        ? "6px 10px"
        : "0";
  }


  /*
    Box Border
  */

  if (box) {

    const enabled =
      $("#boxBorder")
        ?.checked;


    box.style.border =
      enabled
        ? getBorderCSS()
        : "0";


    box.style.padding =
      enabled
        ? "6px 10px"
        : "0";
  }
}


/* =========================================================
   FONT STYLE
========================================================= */

function getFontStyleCSS(
  prefix
) {

  const family =
    $(`#${prefix}FontFamily`)
      ?.value ||
    "Arial";


  const size =
    Number(
      $(`#${prefix}FontSize`)
        ?.value ||
      18
    );


  const bold =
    $(`#${prefix}Bold`)
      ?.checked;


  const italic =
    $(`#${prefix}Italic`)
      ?.checked;


  const underline =
    $(`#${prefix}Underline`)
      ?.checked;


  return `
    font-family:${escapeHTML(family)};
    font-size:${size}px;
    font-weight:${bold ? 900 : 400};
    font-style:${italic ? "italic" : "normal"};
    text-decoration:${underline ? "underline" : "none"};
  `;
}


/* =========================================================
   PO PREVIEW
========================================================= */

function updatePreview() {

  const isPO =
    APP.currentTool ===
      "Coco Blue PO" ||
    APP.currentTool ===
      "Other PO";


  if (!isPO)
    return;


  const page =
    $("#previewPage");


  if (!page)
    return;


  const dimensions =
    getPageDimensions();


  page.style.aspectRatio =
    `${dimensions.width}/${dimensions.height}`;


  const sequence =
    getBoxSequence();


  const labelsPerPage =
    Math.max(
      1,
      Number(
        $("#labelsPerPage")
          ?.value
      ) || 1
    );


  const previewLabels = [
    $("#previewLabel1"),
    $("#previewLabel2")
  ];


  previewLabels.forEach(
    (label, index) => {

      if (!label)
        return;


      const item =
        sequence[index];


      if (
        index >=
        Math.min(
          labelsPerPage,
          2
        )
      ) {

        label.style.display =
          "none";

        return;
      }


      label.style.display =
        "flex";


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


      let html = "";


      /*
        PO + BOX
      */

      if (
        $("#poPlusBox")
          ?.checked
      ) {

        html += `
          <div
            class="preview-po"
            style="${getFontStyleCSS("po")}"
          >
            ${escapeHTML(item.po)}
          </div>

          <div
            class="preview-box"
            style="${getFontStyleCSS("box")}"
          >
            BOX ${escapeHTML(item.box)}
          </div>
        `;

      } else {

        /*
          PO
        */

        if (
          $("#printPO")
            ?.checked
        ) {

          html += `
            <div
              class="preview-po"
              style="${getFontStyleCSS("po")}"
            >
              ${escapeHTML(item.po)}
            </div>
          `;
        }


        /*
          BOX
        */

        if (
          $("#printBox")
            ?.checked
        ) {

          html += `
            <div
              class="preview-box"
              style="${getFontStyleCSS("box")}"
            >
              BOX ${escapeHTML(item.box)}
            </div>
          `;
        }
      }


      label.innerHTML = `
        <div class="preview-inner">
          ${html}
        </div>
      `;


      applyPreviewBorder(
        label
      );
    }
  );
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

          APP.isbnMode =
            button.dataset
              .isbnMode;


          $$("[data-isbn-mode]")
            .forEach(
              (btn) => {
                btn.classList.remove(
                  "active"
                );
              }
            );


          button.classList.add(
            "active"
          );


          $("#isbnManual")
            .style.display =
            APP.isbnMode ===
            "manual"
              ? ""
              : "none";


          $("#isbnExcel")
            .style.display =
            APP.isbnMode ===
            "excel"
              ? ""
              : "none";


          updateISBNPreview();
        }
      );

    }
  );


/* =========================================================
   ISBN PREVIEW
========================================================= */

function updateISBNPreview() {

  if (
    APP.currentTool !==
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


  if (
    $("#isbnPreviewTitle")
  ) {

    $("#isbnPreviewTitle")
      .textContent =
      title;
  }


  if (
    $("#isbnPreviewEdition")
  ) {

    $("#isbnPreviewEdition")
      .textContent =
      edition
        ? `Edition: ${edition}`
        : "";
  }


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
        format:
          "CODE128",

        displayValue:
          true,

        fontSize:
          14,

        margin:
          8,

        height:
          70,

        width:
          2
      }
    );

  } catch (error) {

    console.error(
      error
    );

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

          APP.addressMode =
            button.dataset
              .addressMode;


          $$("[data-address-mode]")
            .forEach(
              (btn) => {
                btn.classList.remove(
                  "active"
                );
              }
            );


          button.classList.add(
            "active"
          );


          $("#addressManual")
            .style.display =
            APP.addressMode ===
            "manual"
              ? ""
              : "none";


          $("#addressExcel")
            .style.display =
            APP.addressMode ===
            "excel"
              ? ""
              : "none";


          updateAddressPreview();

        }
      );

    }
  );


/* =========================================================
   ADDRESS PREVIEW STYLE
========================================================= */

function applyAddressStyle(
  element,
  prefix
) {

  if (!element)
    return;


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
   ADDRESS PREVIEW
========================================================= */

function updateAddressPreview() {

  if (
    APP.currentTool !==
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


  if (
    $("#previewFromName")
  ) {

    $("#previewFromName")
      .textContent =
      fromName;
  }


  if (
    $("#previewFromAddress")
  ) {

    $("#previewFromAddress")
      .textContent =
      fromAddress;
  }


  if (
    $("#previewToName")
  ) {

    $("#previewToName")
      .textContent =
      toName;
  }


  if (
    $("#previewToAddress")
  ) {

    $("#previewToAddress")
      .textContent =
      toAddress;
  }


  applyAddressStyle(
    $("#previewFromName"),
    "from"
  );


  applyAddressStyle(
    $("#previewFromAddress"),
    "from"
  );


  applyAddressStyle(
    $("#previewToName"),
    "to"
  );


  applyAddressStyle(
    $("#previewToAddress"),
    "to"
  );


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
}


/* =========================================================
   EXCEL READER
========================================================= */

async function readExcelFile(
  file
) {

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
   EXCEL PREVIEW
========================================================= */

function renderExcelPreview(
  rows,
  target
) {

  if (!target)
    return;


  target.innerHTML = "";


  if (!rows.length)
    return;


  const columns =
    Object.keys(
      rows[0]
    );


  let html =
    "<table><thead><tr>";


  columns.forEach(
    (column) => {

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
      (row) => {

        html +=
          "<tr>";


        columns.forEach(
          (column) => {

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
          await readExcelFile(
            file
          );


        const sheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];


        APP.poExcelRows =
          XLSX.utils.sheet_to_json(
            sheet,
            {
              defval: ""
            }
          );


        renderExcelPreview(
          APP.poExcelRows,
          $("#poExcelPreview")
        );


        if (
          $("#poExcelStatus")
        ) {

          $("#poExcelStatus")
            .textContent =
            `${APP.poExcelRows.length} row(s) loaded.`;
        }


        showToast(
          `${APP.poExcelRows.length} PO row(s) loaded.`
        );


        updatePreview();

      } catch (error) {

        console.error(
          error
        );


        showToast(
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
          await readExcelFile(
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
          rows.length <
          2
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


        APP.isbnExcelRows =
          rows
            .slice(1)
            .map(
              row => ({
                ISBN:
                  String(
                    row[
                      isbnIndex
                    ] ?? ""
                  ).trim(),

                Title:
                  String(
                    row[
                      titleIndex
                    ] ?? ""
                  ).trim(),

                Edition:
                  String(
                    row[
                      editionIndex
                    ] ?? ""
                  ).trim()
              })
            )
            .filter(
              row =>
                row.ISBN ||
                row.Title
            );


        const invalid =
          APP.isbnExcelRows.some(
            row =>
              !row.ISBN ||
              !row.Title
          );


        if (invalid) {

          throw new Error(
            "ISBN and Title are mandatory."
          );
        }


        renderExcelPreview(
          APP.isbnExcelRows,
          $("#isbnExcelPreview")
        );


        $("#isbnExcelStatus")
          .textContent =
          `${APP.isbnExcelRows.length} row(s) loaded.`;


        showToast(
          `${APP.isbnExcelRows.length} ISBN row(s) loaded.`
        );

      } catch (error) {

        console.error(
          error
        );


        showToast(
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
          await readExcelFile(
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
          rows.length <
          2
        ) {

          throw new Error(
            "Address Excel has no data."
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
            "Address Excel must contain From and To columns."
          );
        }


        APP.addressExcelRows =
          rows
            .slice(1)
            .map(
              row => ({
                From:
                  String(
                    row[
                      fromIndex
                    ] ?? ""
                  ).trim(),

                To:
                  String(
                    row[
                      toIndex
                    ] ?? ""
                  ).trim()
              })
            )
            .filter(
              row =>
                row.From ||
                row.To
            );


        renderExcelPreview(
          APP.addressExcelRows,
          $("#addressExcelPreview")
        );


        $("#addressExcelStatus")
          .textContent =
          `${APP.addressExcelRows.length} row(s) loaded.`;


        showToast(
          `${APP.addressExcelRows.length} address row(s) loaded.`
        );

      } catch (error) {

        console.error(
          error
        );


        showToast(
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

      /*
        Text / number inputs
      */

      $(
        "input:not([type='checkbox']):not([type='file']):not([type='color']), textarea"
      ).forEach(
        (input) => {
          input.value = "";
        }
      );


      /*
        Checkbox defaults
      */

      $$(
        ".feature-checkbox input[type='checkbox']"
      ).forEach(
        (checkbox) => {
          checkbox.checked = false;
        }
      );


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


      /*
        Number defaults
      */

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


      /*
        Page defaults
      */

      $("#pageSize").value =
        "4x6";

      $("#orientation").value =
        "portrait";


      $("#customWidth").value =
        101.6;

      $("#customHeight").value =
        152.4;


      /*
        Clear Excel
      */

      APP.poExcelRows =
        [];

      APP.isbnExcelRows =
        [];

      APP.addressExcelRows =
        [];


      [
        "#poExcelPreview",
        "#isbnExcelPreview",
        "#addressExcelPreview"
      ].forEach(
        (selector) => {

          if ($(selector)) {
            $(selector)
              .innerHTML = "";
          }

        }
      );


      /*
        Rebuild font states
      */

      $$(".font-toggle")
        .forEach(
          button => {
            button.classList.remove(
              "active"
            );
          }
        );


      [
        "#poBold",
        "#poItalic",
        "#poUnderline",
        "#boxBold",
        "#boxItalic",
        "#boxUnderline",
        "#fromBold",
        "#fromItalic",
        "#fromUnderline",
        "#toBold",
        "#toItalic",
        "#toUnderline"
      ].forEach(
        selector => {

          if ($(selector)) {
            $(selector)
              .checked = false;
          }

        }
      );


      updatePageSizeLock();

      updatePOFeatureLocks();

      updateCombinedBorderLock();

      updatePreview();

      updateISBNPreview();

      updateAddressPreview();


      showToast(
        "Settings reset."
      );
    }
  );


/* =========================================================
   PDF LIBRARY
========================================================= */

function getJsPDF() {

  if (
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {

    throw new Error(
      "PDF library is not loaded."
    );
  }


  return window.jspdf.jsPDF;
}


/* =========================================================
   PDF PAGE FORMAT
========================================================= */

function getPDFPageSize() {

  const dimensions =
    getPageDimensions();


  return [
    dimensions.width,
    dimensions.height
  ];
}


/* =========================================================
   PDF FONT
========================================================= */

function getPDFFontFamily(
  font
) {

  const value =
    String(
      font || ""
    ).toLowerCase();


  if (
    value.includes(
      "times"
    ) ||
    value.includes(
      "georgia"
    ) ||
    value.includes(
      "garamond"
    )
  ) {

    return "times";
  }


  if (
    value.includes(
      "courier"
    ) ||
    value.includes(
      "consolas"
    )
  ) {

    return "courier";
  }


  return "helvetica";
}


function getPDFFontStyle(
  prefix
) {

  const bold =
    $(`#${prefix}Bold`)
      ?.checked;


  const italic =
    $(`#${prefix}Italic`)
      ?.checked;


  if (
    bold &&
    italic
  ) {

    return "bolditalic";
  }


  if (bold) {
    return "bold";
  }


  if (italic) {
    return "italic";
  }


  return "normal";
}


/* =========================================================
   UNDERLINE PDF TEXT
========================================================= */

function pdfText(
  doc,
  text,
  x,
  y,
  options = {},
  underline = false
) {

  doc.text(
    text,
    x,
    y,
    options
  );


  if (!underline)
    return;


  const align =
    options.align ||
    "left";


  const width =
    doc.getTextWidth(
      String(text)
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

  } else if (
    align ===
    "right"
  ) {

    startX =
      x -
      width;
  }


  doc.setLineWidth(
    0.25
  );


  doc.line(
    startX,
    y + 1,
    startX + width,
    y + 1
  );
}


/* =========================================================
   PDF BORDER STYLE
========================================================= */

function setPDFBorderStyle(
  doc
) {

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
}


/* =========================================================
   PO PDF
========================================================= */

function generatePOPDF() {

  const JsPDF =
    getJsPDF();


  const dimensions =
    getPageDimensions();


  const sequence =
    getBoxSequence();


  if (
    !sequence.length
  ) {

    throw new Error(
      "Please enter at least one PO number."
    );
  }


  const labelsPerPage =
    Math.max(
      1,
      Number(
        $("#labelsPerPage")
          ?.value
      ) || 1
    );


  const doc =
    new JsPDF({
      unit:
        "mm",

      format:
        getPDFPageSize(),

      orientation:
        "p"
    });


  const totalPages =
    Math.ceil(
      sequence.length /
      labelsPerPage
    );


  for (
    let page =
      0;
    page <
    totalPages;
    page++
  ) {

    if (
      page >
      0
    ) {

      doc.addPage(
        getPDFPageSize(),
        "p"
      );
    }


    const pageItems =
      sequence.slice(
        page *
          labelsPerPage,

        page *
          labelsPerPage +
          labelsPerPage
      );


    const labelHeight =
      dimensions.height /
      labelsPerPage;


    pageItems.forEach(
      (item, index) => {

        const top =
          index *
          labelHeight;


        const x =
          3;

        const y =
          top + 3;

        const w =
          dimensions.width -
          6;

        const h =
          labelHeight -
          6;


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


          setPDFBorderStyle(
            doc
          );


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


          setPDFBorderStyle(
            doc
          );


          doc.setLineWidth(
            getPDFBorderWidth()
          );


          doc.rect(
            8,
            top + 8,
            dimensions.width -
              16,
            labelHeight -
              16
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
          labelHeight /
            2;


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
            getPDFFontFamily(
              $("#poFontFamily")
                ?.value
            ),
            getPDFFontStyle(
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


          pdfText(
            doc,
            poText,
            centerX,
            centerY - 7,
            {
              align:
                "center"
            },
            $("#poUnderline")
              ?.checked
          );


          /*
            BOX
          */

          doc.setFont(
            getPDFFontFamily(
              $("#boxFontFamily")
                ?.value
            ),
            getPDFFontStyle(
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


          pdfText(
            doc,
            boxText,
            centerX,
            centerY + 12,
            {
              align:
                "center"
            },
            $("#boxUnderline")
              ?.checked
          );

        } else {

          /*
            NORMAL PO
          */

          if (
            $("#printPO")
              ?.checked
          ) {

            doc.setFont(
              getPDFFontFamily(
                $("#poFontFamily")
                  ?.value
              ),
              getPDFFontStyle(
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


            pdfText(
              doc,
              String(
                item.po
              ),
              centerX,
              centerY - 5,
              {
                align:
                  "center"
              },
              $("#poUnderline")
                ?.checked
            );
          }


          /*
            NORMAL BOX
          */

          if (
            $("#printBox")
              ?.checked
          ) {

            doc.setFont(
              getPDFFontFamily(
                $("#boxFontFamily")
                  ?.value
              ),
              getPDFFontStyle(
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


            pdfText(
              doc,
              `BOX ${item.box}`,
              centerX,
              centerY + 12,
              {
                align:
                  "center"
              },
              $("#boxUnderline")
                ?.checked
            );
          }
        }


        /*
          PO BORDER
        */

        if (
          $("#poBorder")
            ?.checked &&
          !$("#combinedBorder")
            ?.checked &&
          !$("#poPlusBox")
            ?.checked
        ) {

          drawPDFTextBorder(
            doc,
            String(
              item.po
            ),
            centerX,
            centerY - 5,
            "po"
          );
        }


        /*
          BOX BORDER
        */

        if (
          $("#boxBorder")
            ?.checked &&
          !$("#combinedBorder")
            ?.checked &&
          !$("#poPlusBox")
            ?.checked
        ) {

          drawPDFTextBorder(
            doc,
            `BOX ${item.box}`,
            centerX,
            centerY + 12,
            "box"
          );
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
            "#777"
          );


          doc.setLineDashPattern(
            [3, 2],
            0
          );


          doc.line(
            5,
            top +
              labelHeight,
            dimensions.width -
              5,
            top +
              labelHeight
          );


          doc.setLineDashPattern(
            [],
            0
          );
        }


        /*
          SCISSOR MARK
        */

        if (
          $("#scissorMark")
            ?.checked
        ) {

          drawScissorMarks(
            doc,
            dimensions.width,
            top,
            labelHeight
          );
        }

      }
    );
  }


  doc.save(
    `${safeFileName(
      APP.currentTool
    )}_Labels.pdf`
  );


  showToast(
    `${sequence.length} label(s) generated successfully.`
  );
}


/* =========================================================
   PDF BORDER WIDTH
========================================================= */

function getPDFBorderWidth() {

  const value =
    $("#borderSize")
      ?.value;


  if (
    value ===
    "thin"
  ) {
    return 0.35;
  }


  if (
    value ===
    "thick"
  ) {
    return 1.5;
  }


  return 0.7;
}


/* =========================================================
   TEXT BORDER
========================================================= */

function drawPDFTextBorder(
  doc,
  text,
  centerX,
  baselineY,
  prefix
) {

  const fontSize =
    Number(
      $(`#${prefix}FontSize`)
        ?.value ||
      18
    );


  doc.setFontSize(
    fontSize
  );


  const textWidth =
    doc.getTextWidth(
      text
    );


  const paddingX =
    4;

  const paddingY =
    5;


  const rectWidth =
    textWidth +
    paddingX * 2;


  const rectHeight =
    fontSize *
      0.3528 +
    paddingY;


  const rectX =
    centerX -
    rectWidth / 2;


  const rectY =
    baselineY -
    fontSize *
      0.3528;


  doc.setDrawColor(
    $("#borderColor")
      ?.value ||
    "#111827"
  );


  setPDFBorderStyle(
    doc
  );


  doc.setLineWidth(
    getPDFBorderWidth()
  );


  doc.rect(
    rectX,
    rectY,
    rectWidth,
    rectHeight
  );


  doc.setLineDashPattern(
    [],
    0
  );
}


/* =========================================================
   SCISSOR MARKS
========================================================= */

function drawScissorMarks(
  doc,
  width,
  top,
  height
) {

  const y =
    top +
    height;


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(
    7
  );


  doc.text(
    "✂",
    2,
    y - 1
  );


  doc.text(
    "✂",
    width - 7,
    y - 1
  );
}


/* =========================================================
   ISBN VALIDATION
========================================================= */

function validateISBNManual() {

  const isbn =
    $("#isbnValue")
      ?.value
      .trim();


  const title =
    $("#isbnTitle")
      ?.value
      .trim();


  if (!isbn) {

    showToast(
      "ISBN is mandatory.",
      "error"
    );

    return false;
  }


  if (!title) {

    showToast(
      "Book Title is mandatory.",
      "error"
    );

    return false;
  }


  return true;
}


/* =========================================================
   ISBN PDF
========================================================= */

async function generateISBNPDF() {

  if (
    APP.isbnMode ===
    "manual"
  ) {

    if (
      !validateISBNManual()
    ) {
      return;
    }
  }


  if (
    APP.isbnMode ===
      "excel" &&
    !APP.isbnExcelRows.length
  ) {

    throw new Error(
      "Please upload ISBN Excel first."
    );
  }


  const JsPDF =
    getJsPDF();


  const dimensions =
    getPageDimensions();


  const rows =
    APP.isbnMode ===
    "excel"
      ? APP.isbnExcelRows
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
      unit:
        "mm",

      format:
        getPDFPageSize()
    });


  for (
    let index = 0;
    index < rows.length;
    index++
  ) {

    if (
      index > 0
    ) {

      doc.addPage(
        getPDFPageSize()
      );
    }


    const row =
      rows[index];


    const centerX =
      dimensions.width /
      2;


    /*
      TITLE
    */

    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.setFontSize(
      16
    );


    doc.text(
      String(
        row.Title
      ),
      centerX,
      20,
      {
        align:
          "center"
      }
    );


    /*
      EDITION
    */

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
      BARCODE
    */

    const svg =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );


    JsBarcode(
      svg,
      String(
        row.ISBN
      ),
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
        (
          resolve,
          reject
        ) => {

          const img =
            new Image();


          img.onload =
            () => resolve(
              img
            );


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


    const imageData =
      canvas.toDataURL(
        "image/png"
      );


    URL.revokeObjectURL(
      url
    );


    doc.addImage(
      imageData,
      "PNG",
      10,
      dimensions.height /
        2 -
        20,
      dimensions.width -
        20,
      40
    );
  }


  doc.save(
    "ISBN_Barcodes.pdf"
  );


  showToast(
    `${rows.length} ISBN barcode(s) generated successfully.`
  );
}


/* =========================================================
   ADDRESS PDF
========================================================= */

function generateAddressPDF() {

  const JsPDF =
    getJsPDF();


  const dimensions =
    getPageDimensions();


  let rows;


  if (
    APP.addressMode ===
      "excel" &&
    APP.addressExcelRows.length
  ) {

    rows =
      APP.addressExcelRows;

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
      unit:
        "mm",

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


      drawAddressPDFPage(
        doc,
        row,
        dimensions
      );

    }
  );


  doc.save(
    "Address_Stickers.pdf"
  );


  showToast(
    `${rows.length} address sticker(s) generated successfully.`
  );
}


/* =========================================================
   ADDRESS PDF PAGE
========================================================= */

function drawAddressPDFPage(
  doc,
  row,
  dimensions
) {

  const width =
    dimensions.width;

  const height =
    dimensions.height;


  const margin =
    5;


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


    setPDFBorderStyle(
      doc
    );


    doc.setLineWidth(
      getPDFBorderWidth()
    );


    doc.rect(
      margin,
      margin,
      width -
        margin * 2,
      height -
        margin * 2
    );


    doc.setLineDashPattern(
      [],
      0
    );
  }


  /*
    FROM / TO SPLIT
  */

  const center =
    width / 2;


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


    doc.setLineWidth(
      0.7
    );


    doc.rect(
      margin + 3,
      margin + 10,
      center -
        margin -
        8,
      height -
        20
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


    doc.setLineWidth(
      0.7
    );


    doc.rect(
      center + 3,
      margin + 10,
      center -
        margin -
        8,
      height -
        20
    );
  }


  /*
    FROM
  */

  doc.setFont(
    getPDFFontFamily(
      $("#fromFontFamily")
        ?.value
    ),
    getPDFFontStyle(
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
      String(
        row.From || ""
      ),
      center -
        margin -
        20
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
    getPDFFontFamily(
      $("#toFontFamily")
        ?.value
    ),
    getPDFFontStyle(
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
    center + 8,
    margin + 18
  );


  const toLines =
    doc.splitTextToSize(
      String(
        row.To || ""
      ),
      center -
        margin -
        20
    );


  doc.text(
    toLines,
    center + 8,
    margin + 30
  );


  /*
    CENTER CUT LINE
  */

  if (
    $("#cutLine")
      ?.checked
  ) {

    doc.setDrawColor(
      "#777"
    );


    doc.setLineDashPattern(
      [3, 2],
      0
    );


    doc.line(
      center,
      margin + 5,
      center,
      height -
        margin -
        5
    );


    doc.setLineDashPattern(
      [],
      0
    );
  }
}


/* =========================================================
   GENERATE ROUTER
========================================================= */

async function generatePDF() {

  if (
    APP.currentTool ===
    "Coco Blue PO"
  ) {

    generatePOPDF();

    return;
  }


  if (
    APP.currentTool ===
    "Other PO"
  ) {

    generatePOPDF();

    return;
  }


  if (
    APP.currentTool ===
    "ISBN Barcode"
  ) {

    await generateISBNPDF();

    return;
  }


  if (
    APP.currentTool ===
    "Address Sticker"
  ) {

    generateAddressPDF();

    return;
  }


  throw new Error(
    "Please select a tool first."
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


      if (!button)
        return;


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


        showToast(
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
   QR CODES
========================================================= */

function createQRCodes() {

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


  if (locationQR) {

    locationQR.innerHTML =
      "";


    new QRCode(
      locationQR,
      {
        text:
          APP.map,

        width:
          130,

        height:
          130,

        correctLevel:
          QRCode
            .CorrectLevel
            .M
      }
    );
  }


  if (emailQR) {

    emailQR.innerHTML =
      "";


    new QRCode(
      emailQR,
      {
        text:
          `mailto:${APP.email}`,

        width:
          130,

        height:
          130,

        correctLevel:
          QRCode
            .CorrectLevel
            .M
      }
    );
  }
}


/* =========================================================
   LIVE UPDATE
========================================================= */

document.addEventListener(
  "input",
  (event) => {

    const target =
      event.target;


    if (
      target.matches(
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
   KEYBOARD SHORTCUT
   Ctrl + Enter
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
   INITIAL DEFAULTS
========================================================= */

function initializeDefaults() {

  /*
    Page
  */

  if (
    $("#pageSize")
  ) {

    $("#pageSize")
      .value =
      "4x6";
  }


  if (
    $("#orientation")
  ) {

    $("#orientation")
      .value =
      "portrait";
  }


  /*
    PO / Box
  */

  if (
    $("#printPO")
  ) {

    $("#printPO")
      .checked =
      true;
  }


  if (
    $("#printBox")
  ) {

    $("#printBox")
      .checked =
      true;
  }


  if (
    $("#pageBorder")
  ) {

    $("#pageBorder")
      .checked =
      true;
  }


  if (
    $("#poBorder")
  ) {

    $("#poBorder")
      .checked =
      true;
  }


  if (
    $("#boxBorder")
  ) {

    $("#boxBorder")
      .checked =
      true;
  }


  /*
    Numbers
  */

  if (
    $("#startBox")
  ) {

    $("#startBox")
      .value =
      1;
  }


  if (
    $("#endBox")
  ) {

    $("#endBox")
      .value =
      1;
  }


  if (
    $("#repeatCount")
  ) {

    $("#repeatCount")
      .value =
      1;
  }


  if (
    $("#copies")
  ) {

    $("#copies")
      .value =
      1;
  }


  if (
    $("#labelsPerPage")
  ) {

    $("#labelsPerPage")
      .value =
      1;
  }


  /*
    Custom
  */

  if (
    $("#customWidth")
  ) {

    $("#customWidth")
      .value =
      101.6;
  }


  if (
    $("#customHeight")
  ) {

    $("#customHeight")
      .value =
      152.4;
  }
}


/* =========================================================
   INIT
========================================================= */

(function init() {

  const savedLanguage =
    localStorage.getItem(
      "booksLabelLanguage"
    ) ||
    "en";


  setLanguage(
    savedLanguage
  );


  initializeDefaults();


  updatePageSizeLock();

  updatePOFeatureLocks();

  updateCombinedBorderLock();

  createQRCodes();

  updatePreview();

  updateISBNPreview();

  updateAddressPreview();

})();
