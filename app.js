"use strict";

/* =========================================================
   BOOKSWAGON LABEL STUDIO — FINAL JS
========================================================= */

const CONFIG = {
  email: "ashish.verma@bookswagon.in",
  map: "https://maps.app.goo.gl/7McYApm1u9x4QSj7A"
};

let currentTool = "Coco Blue PO";
let currentSubMode = "individual";

let poExcelRows = [];
let isbnExcelRows = [];
let addressExcelRows = [];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function toast(message, type = "success") {
  const box = $("#toastContainer");
  if (!box) return;

  const item = document.createElement("div");
  item.className = `toast ${type === "error" ? "error" : ""}`;
  item.textContent = message;

  box.appendChild(item);

  setTimeout(() => item.remove(), 2800);
}

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
  document.documentElement.lang = language === "hi" ? "hi" : "en";

  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;

    if (translations[language]?.[key]) {
      el.textContent = translations[language][key];
    }
  });

  $$(".lang-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.dataset.lang === language
    );
  });

  localStorage.setItem(
    "booksWagonLanguage",
    language
  );
}

$$(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setLanguage(btn.dataset.lang);
  });
});

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

function populateFontSelect(id) {
  const select = $(id);
  if (!select) return;

  select.innerHTML = "";

  FONT_LIST.forEach((font) => {
    const option = document.createElement("option");
    option.value = font;
    option.textContent = font;
    option.style.fontFamily = font;

    select.appendChild(option);
  });
}

[
  "#poFontFamily",
  "#boxFontFamily",
  "#fromFontFamily",
  "#toFontFamily"
].forEach(populateFontSelect);

function populateFontSizes(id) {
  const select = $(id);
  if (!select) return;

  select.innerHTML = "";

  for (let i = 1; i <= 48; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}px`;

    if (i === 18) option.selected = true;

    select.appendChild(option);
  }
}

[
  "#poFontSize",
  "#boxFontSize",
  "#fromFontSize",
  "#toFontSize"
].forEach(populateFontSizes);

/* =========================================================
   TOOL OPEN
========================================================= */

function openTool(tool) {
  currentTool = tool;

  $("#workspace")?.classList.add("active");

  $("#workspaceTitle").textContent = tool;

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

  updatePreview();
  updateISBNPreview();
  updateAddressPreview();

  $("#workspace").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

$$(".tool-card").forEach((card) => {
  card.addEventListener("click", () => {
    openTool(card.dataset.tool);
  });
});

$("#openStudio")?.addEventListener("click", () => {
  $("#tools")?.scrollIntoView({
    behavior: "smooth"
  });
});

$("#closeWorkspace")?.addEventListener("click", () => {
  $("#workspace")?.classList.remove("active");

  $("#tools")?.scrollIntoView({
    behavior: "smooth"
  });
});

/* =========================================================
   SUB-CATEGORIES — PO
========================================================= */

$$("[data-sub]").forEach((button) => {
  button.addEventListener("click", () => {
    currentSubMode = button.dataset.sub;

    $$("[data-sub]").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

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
  });
});

/* =========================================================
   CREATE 40 INDIVIDUAL PO FIELDS
========================================================= */

function createPOInputs() {
  const grid = $("#poGrid");
  if (!grid) return;

  grid.innerHTML = "";

  for (let i = 1; i <= 40; i++) {
    const field = document.createElement("div");

    field.className = "po-field";

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
   CHECKBOX TOAST
   NO CONFIRMATION DIALOG
========================================================= */

$$(".feature-checkbox input").forEach((check) => {
  check.addEventListener("change", () => {
    const parent =
      check.closest(".feature-checkbox");

    const label =
      parent
        ?.querySelector(".checkbox-text")
        ?.textContent
        ?.trim() || "Function";

    toast(
      `${label} ${
        check.checked
          ? "has been enabled"
          : "has been disabled"
      }.`
    );

    if (check.id === "combinedBorder") {
      updateCombinedBorderLock();
    }

    updatePreview();
  });
});

/* =========================================================
   COMBINED BORDER LOCK
========================================================= */

function updateCombinedBorderLock() {
  const combined =
    $("#combinedBorder")?.checked;

  const po = $("#poBorder");
  const box = $("#boxBorder");

  const poWrap = $("#poBorderWrap");
  const boxWrap = $("#boxBorderWrap");

  if (!po || !box) return;

  if (combined) {
    po.checked = false;
    box.checked = false;

    po.disabled = true;
    box.disabled = true;

    poWrap?.classList.add("locked");
    boxWrap?.classList.add("locked");
  } else {
    po.disabled = false;
    box.disabled = false;

    poWrap?.classList.remove("locked");
    boxWrap?.classList.remove("locked");
  }
}

updateCombinedBorderLock();

/* =========================================================
   FONT TOGGLES
========================================================= */

$$(".font-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const target =
      $("#" + button.dataset.target);

    if (!target) return;

    target.checked = !target.checked;

    button.classList.toggle(
      "active",
      target.checked
    );

    updatePreview();
    updateAddressPreview();
  });
});

/* =========================================================
   PAGE SIZE
========================================================= */

$("#pageSize")?.addEventListener("change", () => {
  const isCustom =
    $("#pageSize").value === "CUSTOM";

  $("#customWidth").disabled = !isCustom;
  $("#customHeight").disabled = !isCustom;

  const selected =
    $("#pageSize").selectedOptions[0]
      ?.textContent || "";

  toast(
    isCustom
      ? "Custom page size selected."
      : `${selected} page selected.`
  );

  updatePreview();
  updateAddressPreview();
});

/* =========================================================
   ORIENTATION
========================================================= */

$("#orientation")?.addEventListener(
  "change",
  () => {
    toast(
      `${$("#orientation").value === "portrait"
        ? "Portrait"
        : "Landscape"} orientation selected.`
    );

    updatePreview();
  }
);

/* =========================================================
   PAGE DIMENSIONS
========================================================= */

function pageDimensions() {
  let width = 101.6;
  let height = 152.4;

  const size = $("#pageSize")?.value;

  if (size === "4x6") {
    width = 101.6;
    height = 152.4;
  }

  if (size === "70x35") {
    width = 70;
    height = 35;
  }

  if (size === "A4") {
    width = 210;
    height = 297;
  }

  if (size === "CUSTOM") {
    width =
      Number($("#customWidth")?.value) ||
      101.6;

    height =
      Number($("#customHeight")?.value) ||
      152.4;
  }

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
  if (currentSubMode === "multiple") {
    return (
      $("#multiplePO")?.value
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean) || []
    );
  }

  if (currentSubMode === "excel") {
    return poExcelRows
      .map((row) => {
        const keys = Object.keys(row);
        return keys.length
          ? String(row[keys[0]]).trim()
          : "";
      })
      .filter(Boolean);
  }

  return $$(".po-input")
    .map((input) => input.value.trim())
    .filter(Boolean);
}

/* =========================================================
   LABEL SEQUENCE
   PO -> BOX -> REPEAT -> COPIES
========================================================= */

function buildSequence() {
  const pos = getPOValues();

  const start = Math.max(
    1,
    Number($("#startBox")?.value) || 1
  );

  const end = Math.max(
    start,
    Number($("#endBox")?.value) || start
  );

  const repeat = Math.max(
    1,
    Number($("#repeatCount")?.value) || 1
  );

  const copies = Math.max(
    1,
    Number($("#copies")?.value) || 1
  );

  const sequence = [];

  pos.forEach((po) => {
    for (let box = start; box <= end; box++) {
      for (let r = 0; r < repeat; r++) {
        for (let c = 0; c < copies; c++) {
          sequence.push({
            po,
            box,
            repeatIndex: r + 1,
            copyIndex: c + 1
          });
        }
      }
    }
  });

  return sequence;
}

/* =========================================================
   LABEL CSS
========================================================= */

function borderWidth() {
  const size = $("#borderSize")?.value;

  if (size === "thin") return "1px";
  if (size === "thick") return "4px";

  return "2px";
}

function borderValue() {
  return `${borderWidth()} ${
    $("#borderStyle")?.value || "solid"
  } ${
    $("#borderColor")?.value || "#111827"
  }`;
}

/* =========================================================
   PREVIEW
========================================================= */

function updatePreview() {
  if (
    currentTool !== "Coco Blue PO" &&
    currentTool !== "Other PO"
  ) {
    return;
  }

  const sequence = buildSequence();

  const perPage = Math.max(
    1,
    Number($("#labelsPerPage")?.value) || 1
  );

  const label1 = $("#previewLabel1");
  const label2 = $("#previewLabel2");

  const labels = [label1, label2];

  labels.forEach((label, index) => {
    if (!label) return;

    label.style.display =
      index < perPage ? "flex" : "none";

    const item = sequence[index];

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

    if ($("#printPO")?.checked) {
      html += `
        <div
          class="preview-po"
          style="
            font-family:${escapeHTML(
              $("#poFontFamily")?.value || "Arial"
            )};
            font-size:${Number(
              $("#poFontSize")?.value || 18
            )}px;
            font-weight:${
              $("#poBold")?.checked ? 900 : 400
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

    if ($("#printBox")?.checked) {
      html += `
        <div
          class="preview-box"
          style="
            font-family:${escapeHTML(
              $("#boxFontFamily")?.value || "Arial"
            )};
            font-size:${Number(
              $("#boxFontSize")?.value || 18
            )}px;
            font-weight:${
              $("#boxBold")?.checked ? 900 : 400
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

    label.innerHTML = `
      <div class="preview-inner">
        ${html}
      </div>
    `;

    applyLabelBorder(label);
  });

  const dimensions = pageDimensions();
  const page = $("#previewPage");

  if (page) {
    page.style.aspectRatio =
      `${dimensions.width}/${dimensions.height}`;

    page.style.minHeight = "0";
  }
}

/* =========================================================
   LABEL BORDER LOGIC
========================================================= */

function applyLabelBorder(label) {
  if (!$("#pageBorder")?.checked) {
    label.style.border = "0";
    return;
  }

  const inner =
    label.querySelector(".preview-inner");

  if (!inner) return;

  if ($("#combinedBorder")?.checked) {
    label.style.border = borderValue();

    inner.querySelector(".preview-po")
      ?.style.setProperty("border", "0");

    inner.querySelector(".preview-box")
      ?.style.setProperty("border", "0");

    return;
  }

  label.style.border = "0";

  inner.querySelector(".preview-po")
    ?.style.setProperty(
      "border",
      $("#poBorder")?.checked
        ? borderValue()
        : "0"
    );

  inner.querySelector(".preview-box")
    ?.style.setProperty(
      "border",
      $("#boxBorder")?.checked
        ? borderValue()
        : "0"
    );
}

/* =========================================================
   ISBN
========================================================= */

function updateISBNPreview() {
  if (currentTool !== "ISBN Barcode") return;

  const isbn =
    $("#isbnValue")?.value.trim() || "";

  const title =
    $("#isbnTitle")?.value.trim() || "";

  const edition =
    $("#isbnEdition")?.value.trim() || "";

  $("#isbnPreviewTitle").textContent =
    title || "Book Title";

  $("#isbnPreviewEdition").textContent =
    edition
      ? `Edition: ${edition}`
      : "";

  const svg = $("#isbnBarcode");

  if (!svg) return;

  svg.innerHTML = "";

  if (!isbn) return;

  if (
    typeof JsBarcode ===
    "undefined"
  ) {
    toast(
      "Barcode library is not available.",
      "error"
    );
    return;
  }

  try {
    JsBarcode(svg, isbn, {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      margin: 8,
      height: 70,
      width: 2
    });
  } catch (error) {
    console.error(error);
    toast(
      "Unable to generate barcode.",
      "error"
    );
  }
}

/* =========================================================
   ISBN SUB-MODE
========================================================= */

$$("[data-isbn-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    $$("[data-isbn-mode]").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    const mode =
      button.dataset.isbnMode;

    $("#isbnManual").style.display =
      mode === "manual" ? "" : "none";

    $("#isbnExcel").style.display =
      mode === "excel" ? "" : "none";
  });
});

/* =========================================================
   ADDRESS
========================================================= */

function updateAddressPreview() {
  if (currentTool !== "Address Sticker") {
    return;
  }

  $("#previewFromName").textContent =
    $("#fromName")?.value ||
    "From Name";

  $("#previewFromAddress").textContent =
    $("#fromAddress")?.value ||
    "From Address";

  $("#previewToName").textContent =
    $("#toName")?.value ||
    "To Name";

  $("#previewToAddress").textContent =
    $("#toAddress")?.value ||
    "To Address";

  const from =
    document.querySelector(
      ".address-preview-side:first-child"
    );

  const to =
    document.querySelector(
      ".address-preview-side:last-child"
    );

  if (from) {
    const style =
      $("#fromBorderStyle")?.value;

    from.style.border =
      style === "none"
        ? ""
        : `2px ${style} #203d72`;
  }

  if (to) {
    const style =
      $("#toBorderStyle")?.value;

    to.style.border =
      style === "none"
        ? ""
        : `2px ${style} #203d72`;
  }

  const fromName =
    $("#previewFromName");

  const fromAddress =
    $("#previewFromAddress");

  const toName =
    $("#previewToName");

  const toAddress =
    $("#previewToAddress");

  applyAddressTextStyle(
    fromName,
    "from"
  );

  applyAddressTextStyle(
    fromAddress,
    "from"
  );

  applyAddressTextStyle(
    toName,
    "to"
  );

  applyAddressTextStyle(
    toAddress,
    "to"
  );
}

function applyAddressTextStyle(
  element,
  side
) {
  if (!element) return;

  const prefix =
    side === "from" ? "from" : "to";

  element.style.fontFamily =
    $(`#${prefix}FontFamily`)?.value ||
    "Arial";

  element.style.fontSize =
    `${Number(
      $(`#${prefix}FontSize`)?.value || 18
    )}px`;

  element.style.fontWeight =
    $(`#${prefix}Bold`)?.checked
      ? "900"
      : "400";

  element.style.fontStyle =
    $(`#${prefix}Italic`)?.checked
      ? "italic"
      : "normal";

  element.style.textDecoration =
    $(`#${prefix}Underline`)?.checked
      ? "underline"
      : "none";
}

/* =========================================================
   ADDRESS SUB-MODE
========================================================= */

$$("[data-address-mode]").forEach(
  (button) => {
    button.addEventListener("click", () => {
      $$("[data-address-mode]").forEach(
        (btn) => {
          btn.classList.remove("active");
        }
      );

      button.classList.add("active");

      const mode =
        button.dataset.addressMode;

      $("#addressManual").style.display =
        mode === "manual" ? "" : "none";

      $("#addressExcel").style.display =
        mode === "excel" ? "" : "none";
    });
  }
);

/* =========================================================
   GENERIC LIVE UPDATE
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
   EXCEL HELPERS
========================================================= */

function renderExcel(rows, target) {
  if (!target) return;

  if (!rows.length) {
    target.innerHTML = "";
    return;
  }

  const columns =
    Object.keys(rows[0]);

  let html =
    "<table><thead><tr>";

  columns.forEach((column) => {
    html += `
      <th>${escapeHTML(column)}</th>
    `;
  });

  html +=
    "</tr></thead><tbody>";

  rows.slice(0, 100).forEach((row) => {
    html += "<tr>";

    columns.forEach((column) => {
      html += `
        <td>${escapeHTML(row[column])}</td>
      `;
    });

    html += "</tr>";
  });

  html +=
    "</tbody></table>";

  target.innerHTML = html;
}

async function readWorkbook(file) {
  const buffer =
    await file.arrayBuffer();

  return XLSX.read(
    buffer,
    { type: "array" }
  );
}

/* =========================================================
   PO EXCEL
========================================================= */

$("#poExcelFile")?.addEventListener(
  "change",
  async function () {
    const file = this.files?.[0];

    if (!file) return;

    try {
      const workbook =
        await readWorkbook(file);

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      poExcelRows =
        XLSX.utils.sheet_to_json(
          sheet,
          { defval: "" }
        );

      renderExcel(
        poExcelRows,
        $("#poExcelPreview")
      );

      $("#poExcelStatus").textContent =
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

$("#isbnExcelFile")?.addEventListener(
  "change",
  async function () {
    const file = this.files?.[0];

    if (!file) return;

    try {
      const workbook =
        await readWorkbook(file);

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

      if (rows.length < 2) {
        throw new Error(
          "ISBN Excel has no data."
        );
      }

      const headers =
        rows[0].map((x) =>
          String(x)
            .trim()
            .toLowerCase()
        );

      let isbnIndex =
        headers.indexOf("isbn");

      let titleIndex =
        headers.indexOf("title");

      let editionIndex =
        headers.indexOf("edition");

      if (isbnIndex < 0) isbnIndex = 0;
      if (titleIndex < 0) titleIndex = 1;
      if (editionIndex < 0) editionIndex = 2;

      isbnExcelRows =
        rows
          .slice(1)
          .map((row) => ({
            ISBN: String(
              row[isbnIndex] ?? ""
            ).trim(),

            Title: String(
              row[titleIndex] ?? ""
            ).trim(),

            Edition: String(
              row[editionIndex] ?? ""
            ).trim()
          }))
          .filter(
            (row) =>
              row.ISBN ||
              row.Title
          );

      if (
        isbnExcelRows.some(
          (row) =>
            !row.ISBN ||
            !row.Title
        )
      ) {
        throw new Error(
          "ISBN and Title are mandatory."
        );
      }

      renderExcel(
        isbnExcelRows,
        $("#isbnExcelPreview")
      );

      $("#isbnExcelStatus").textContent =
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
   REQUIRED COLUMNS: From, To
========================================================= */

$("#addressExcelFile")?.addEventListener(
  "change",
  async function () {
    const file = this.files?.[0];

    if (!file) return;

    try {
      const workbook =
        await readWorkbook(file);

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

      if (rows.length < 2) {
        throw new Error(
          "Address Excel needs From and To columns."
        );
      }

      const headers =
        rows[0].map((x) =>
          String(x)
            .trim()
            .toLowerCase()
        );

      const fromIndex =
        headers.indexOf("from");

      const toIndex =
        headers.indexOf("to");

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
          .map((row) => ({
            From: String(
              row[fromIndex] ?? ""
            ).trim(),

            To: String(
              row[toIndex] ?? ""
            ).trim()
          }))
          .filter(
            (row) =>
              row.From ||
              row.To
          );

      renderExcel(
        addressExcelRows,
        $("#addressExcelPreview")
      );

      $("#addressExcelStatus").textContent =
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
   ISBN / ADDRESS EXCEL SAMPLE DOWNLOAD
========================================================= */

function downloadCSV(filename, rows) {
  const csv =
    rows
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell ?? "")
              .replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

  const blob =
    new Blob(
      [csv],
      { type: "text/csv;charset=utf-8" }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/* =========================================================
   RESET
========================================================= */

$("#resetButton")?.addEventListener(
  "click",
  () => {
    $$("input, textarea").forEach(
      (input) => {
        if (
          input.type === "checkbox"
        ) {
          input.checked = false;
        } else if (
          input.type !== "file" &&
          input.type !== "color"
        ) {
          input.value = "";
        }
      }
    );

    $("#printPO").checked = true;
    $("#printBox").checked = true;
    $("#pageBorder").checked = true;
    $("#poBorder").checked = true;
    $("#boxBorder").checked = true;

    $("#startBox").value = 1;
    $("#endBox").value = 1;
    $("#repeatCount").value = 1;
    $("#copies").value = 1;
    $("#labelsPerPage").value = 1;

    $("#pageSize").value = "4x6";
    $("#orientation").value =
      "portrait";

    $("#customWidth").value =
      101.6;

    $("#customHeight").value =
      152.4;

    $("#customWidth").disabled = true;
    $("#customHeight").disabled = true;

    poExcelRows = [];
    isbnExcelRows = [];
    addressExcelRows = [];

    $("#poExcelPreview").innerHTML = "";
    $("#isbnExcelPreview").innerHTML = "";
    $("#addressExcelPreview").innerHTML = "";

    updateCombinedBorderLock();
    updatePreview();
    updateISBNPreview();
    updateAddressPreview();

    toast("Settings reset.");
  }
);

/* =========================================================
   PDF HELPERS
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
   PDF — PO LABELS
========================================================= */

function generatePOLabelPDF() {
  const JsPDF = getJsPDF();

  const dimensions =
    pageDimensions();

  const sequence =
    buildSequence();

  if (!sequence.length) {
    throw new Error(
      "Enter at least one PO number."
    );
  }

  const perPage =
    Math.max(
      1,
      Number(
        $("#labelsPerPage")?.value
      ) || 1
    );

  const doc =
    new JsPDF({
      unit: "mm",
      format: getPDFPageSize()
    });

  const pages =
    Math.ceil(
      sequence.length / perPage
    );

  for (
    let pageIndex = 0;
    pageIndex < pages;
    pageIndex++
  ) {
    if (pageIndex > 0) {
      doc.addPage(
        getPDFPageSize()
      );
    }

    const pageItems =
      sequence.slice(
        pageIndex * perPage,
        pageIndex * perPage + perPage
      );

    const slotHeight =
      dimensions.height / perPage;

    pageItems.forEach(
      (item, index) => {
        const top =
          index * slotHeight;

        const x = 3;
        const y = top + 3;

        const w =
          dimensions.width - 6;

        const h =
          slotHeight - 6;

        if ($("#pageBorder")?.checked) {
          doc.setLineWidth(
            $("#borderSize")?.value ===
              "thick"
              ? 1.5
              : $("#borderSize")?.value ===
                "thin"
                ? 0.35
                : 0.7
          );

          doc.setDrawColor(
            $("#borderColor")?.value ||
              "#111827"
          );

          if (
            $("#borderStyle")?.value ===
            "dashed"
          ) {
            doc.setLineDashPattern(
              [3, 2],
              0
            );
          } else if (
            $("#borderStyle")?.value ===
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
          dimensions.width / 2;

        const centerY =
          top + slotHeight / 2;

        if ($("#combinedBorder")?.checked) {
          doc.setDrawColor(
            $("#borderColor")?.value ||
              "#111827"
          );

          doc.rect(
            8,
            top + 8,
            dimensions.width - 16,
            slotHeight - 16
          );
        }

        if ($("#printPO")?.checked) {
          const poFont =
            $("#poFontFamily")?.value ||
            "Arial";

          doc.setFont(
            pdfFont(poFont),
            pdfFontStyle(
              "po"
            )
          );

          doc.setFontSize(
            Number(
              $("#poFontSize")?.value ||
                18
            )
          );

          doc.setTextColor(
            "#203d72"
          );

          if (
            $("#poUnderline")?.checked
          ) {
            drawUnderlinedText(
              doc,
              String(item.po),
              centerX,
              centerY - 5,
              "center"
            );
          } else {
            doc.text(
              String(item.po),
              centerX,
              centerY - 5,
              {
                align: "center"
              }
            );
          }
        }

        if ($("#printBox")?.checked) {
          const boxText =
            `BOX ${item.box}`;

          doc.setFont(
            pdfFont(
              $("#boxFontFamily")?.value ||
                "Arial"
            ),
            pdfFontStyle(
              "box"
            )
          );

          doc.setFontSize(
            Number(
              $("#boxFontSize")?.value ||
                18
            )
          );

          doc.setTextColor(
            "#222222"
          );

          if (
            $("#boxUnderline")?.checked
          ) {
            drawUnderlinedText(
              doc,
              boxText,
              centerX,
              centerY + 12,
              "center"
            );
          } else {
            doc.text(
              boxText,
              centerX,
              centerY + 12,
              {
                align: "center"
              }
            );
          }
        }

        if (
          $("#poBorder")?.checked &&
          !$("#combinedBorder")?.checked
        ) {
          drawTextBorder(
            doc,
            String(item.po),
            centerX,
            centerY - 5,
            Number(
              $("#poFontSize")?.value ||
                18
            )
          );
        }

        if (
          $("#boxBorder")?.checked &&
          !$("#combinedBorder")?.checked
        ) {
          drawTextBorder(
            doc,
            `BOX ${item.box}`,
            centerX,
            centerY + 12,
            Number(
              $("#boxFontSize")?.value ||
                18
            )
          );
        }

        if (
          $("#cutLine")?.checked &&
          index < perPage - 1
        ) {
          doc.setDrawColor("#777777");

          doc.setLineDashPattern(
            [3, 2],
            0
          );

          doc.line(
            5,
            top + slotHeight,
            dimensions.width - 5,
            top + slotHeight
          );

          doc.setLineDashPattern(
            [],
            0
          );
        }

        if (
          $("#scissorMark")?.checked
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

  const filename =
    `${safeName(currentTool)}_Labels.pdf`;

  doc.save(filename);
}

/* =========================================================
   PDF FONT HELPERS
========================================================= */

function pdfFont(font) {
  const value =
    String(font || "").toLowerCase();

  if (value.includes("times"))
    return "times";

  if (value.includes("courier"))
    return "courier";

  return "helvetica";
}

function pdfFontStyle(type) {
  const bold =
    $(`#${type}Bold`)?.checked;

  const italic =
    $(`#${type}Italic`)?.checked;

  if (bold && italic)
    return "bolditalic";

  if (bold)
    return "bold";

  if (italic)
    return "italic";

  return "normal";
}

function drawUnderlinedText(
  doc,
  text,
  x,
  y,
  align
) {
  doc.text(
    text,
    x,
    y,
    { align }
  );

  const width =
    doc.getTextWidth(text);

  let startX = x;

  if (align === "center") {
    startX = x - width / 2;
  }

  doc.setLineWidth(.3);

  doc.line(
    startX,
    y + 1,
    startX + width,
    y + 1
  );
}

function drawTextBorder(
  doc,
  text,
  centerX,
  baselineY,
  fontSize
) {
  const width =
    doc.getTextWidth(text);

  const padding = 4;

  const height =
    fontSize * 0.4;

  doc.setDrawColor(
    $("#borderColor")?.value ||
      "#111827"
  );

  doc.rect(
    centerX -
      width / 2 -
      padding,
    baselineY -
      height -
      padding,
    width +
      padding * 2,
    height +
      padding * 2
  );
}

function drawScissorMarks(
  doc,
  width,
  top,
  slotHeight
) {
  const y =
    top + slotHeight;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(7);

  doc.text(
    "✂",
    3,
    y - 1
  );

  doc.text(
    "✂",
    width - 6,
    y - 1
  );
}

/* =========================================================
   ISBN PDF
========================================================= */

function generateISBNBarcodePDF() {
  const JsPDF = getJsPDF();

  const isbn =
    $("#isbnValue")?.value.trim();

  const title =
    $("#isbnTitle")?.value.trim();

  const edition =
    $("#isbnEdition")?.value.trim();

  if (!isbn || !title) {
    throw new Error(
      "ISBN and Title are mandatory."
    );
  }

  if (
    typeof JsBarcode ===
    "undefined"
  ) {
    throw new Error(
      "Barcode library is not available."
    );
  }

  const dimensions =
    pageDimensions();

  const doc =
    new JsPDF({
      unit: "mm",
      format: getPDFPageSize()
    });

  doc.setFont(
    pdfFont(
      $("#fromFontFamily")?.value ||
        "Arial"
    ),
    "bold"
  );

  doc.setFontSize(18);

  doc.text(
    title,
    dimensions.width / 2,
    22,
    {
      align: "center"
    }
  );

  if (edition) {
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      `Edition: ${edition}`,
      dimensions.width / 2,
      30,
      {
        align: "center"
      }
    );
  }

  const svg =
    $("#isbnBarcode");

  svg.innerHTML = "";

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

  const svgString =
    new XMLSerializer()
      .serializeToString(svg);

  const blob =
    new Blob(
      [svgString],
      {
        type: "image/svg+xml"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const image =
    new Image();

  image.onload = () => {
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

    URL.revokeObjectURL(url);

    doc.addImage(
      data,
      "PNG",
      10,
      dimensions.height / 2 - 20,
      dimensions.width - 20,
      40
    );

    doc.save(
      `${safeName(isbn)}_Barcode.pdf`
    );

    toast(
      "ISBN barcode PDF generated."
    );
  };

  image.onerror = () => {
    URL.revokeObjectURL(url);

    toast(
      "Barcode image could not be prepared.",
      "error"
    );
  };

  image.src = url;
}

/* =========================================================
   ADDRESS PDF
========================================================= */

function generateAddressPDF() {
  const JsPDF = getJsPDF();

  const dimensions =
    pageDimensions();

  let rows = [];

  if (
    addressExcelRows.length
  ) {
    rows =
      addressExcelRows;
  } else {
    rows = [
      {
        From:
          `${$("#fromName")?.value.trim() || ""}\n${
            $("#fromAddress")?.value.trim() || ""
          }`,

        To:
          `${$("#toName")?.value.trim() || ""}\n${
            $("#toAddress")?.value.trim() || ""
          }`
      }
    ];
  }

  if (!rows.length) {
    throw new Error(
      "No address data available."
    );
  }

  const doc =
    new JsPDF({
      unit: "mm",
      format: getPDFPageSize()
    });

  rows.forEach(
    (row, index) => {
      if (index > 0) {
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

function drawAddressPage(
  doc,
  row,
  dimensions
) {
  const pageWidth =
    dimensions.width;

  const pageHeight =
    dimensions.height;

  const margin = 5;

  if (
    $("#pageBorder")?.checked
  ) {
    doc.setDrawColor(
      $("#borderColor")?.value ||
        "#111827"
    );

    doc.rect(
      margin,
      margin,
      pageWidth - margin * 2,
      pageHeight - margin * 2
    );
  }

  const half =
    pageWidth / 2;

  const fromText =
    row.From || "";

  const toText =
    row.To || "";

  const fromStyle =
    $("#fromBorderStyle")?.value ||
    "none";

  const toStyle =
    $("#toBorderStyle")?.value ||
    "none";

  if (fromStyle !== "none") {
    doc.rect(
      margin + 3,
      margin + 10,
      half - margin - 8,
      pageHeight - 20
    );
  }

  if (toStyle !== "none") {
    doc.rect(
      half + 3,
      margin + 10,
      half - margin - 8,
      pageHeight - 20
    );
  }

  doc.setFont(
    pdfFont(
      $("#fromFontFamily")?.value ||
        "Arial"
    ),
    pdfFontStyle(
      "from"
    )
  );

  doc.setFontSize(
    Number(
      $("#fromFontSize")?.value ||
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

  doc.setFont(
    pdfFont(
      $("#toFontFamily")?.value ||
        "Arial"
    ),
    pdfFontStyle(
      "to"
    )
  );

  doc.setFontSize(
    Number(
      $("#toFontSize")?.value ||
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

  doc.setLineDashPattern(
    [3, 2],
    0
  );

  doc.line(
    half,
    margin + 5,
    half,
    pageHeight - margin - 5
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
    currentTool === "ISBN Barcode"
  ) {
    generateISBNBarcodePDF();
    return;
  }

  if (
    currentTool === "Address Sticker"
  ) {
    generateAddressPDF();
    return;
  }

  if (
    currentTool === "Coco Blue PO" ||
    currentTool === "Other PO"
  ) {
    generatePOLabelPDF();
    return;
  }

  throw new Error(
    "Select a label category first."
  );
}

$("#generateButton")?.addEventListener(
  "click",
  async () => {
    const button =
      $("#generateButton");

    button.disabled = true;
    button.textContent =
      "GENERATING...";

    try {
      await generatePDF();
    } catch (error) {
      console.error(error);

      toast(
        error.message ||
          "Generation failed.",
        "error"
      );
    } finally {
      button.disabled = false;
      button.textContent =
        "GENERATE";
    }
  }
);

/* =========================================================
   QR CODES
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

  if (locationQR) {
    locationQR.innerHTML = "";

    new QRCode(
      locationQR,
      {
        text: CONFIG.map,
        width: 130,
        height: 130,
        correctLevel:
          QRCode.CorrectLevel.M
      }
    );
  }

  if (emailQR) {
    emailQR.innerHTML = "";

    new QRCode(
      emailQR,
      {
        text:
          `mailto:${CONFIG.email}`,
        width: 130,
        height: 130,
        correctLevel:
          QRCode.CorrectLevel.M
      }
    );
  }
}

/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {
    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === "enter"
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
  const savedLanguage =
    localStorage.getItem(
      "booksWagonLanguage"
    ) || "en";

  setLanguage(
    savedLanguage
  );

  createQR();

  updateCombinedBorderLock();

  updatePreview();

  updateISBNPreview();

  updateAddressPreview();
})();
