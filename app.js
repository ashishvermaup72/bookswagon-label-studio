/* =========================================================
   BooksWagon Label Studio
   JavaScript
========================================================= */

"use strict";

/* =========================================================
   DATA
========================================================= */

const FONT_LIST = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Courier New",
  "Lucida Console",
  "Lucida Sans",
  "Palatino Linotype",
  "Book Antiqua",
  "Garamond",
  "Cambria",
  "Calibri",
  "Candara",
  "Consolas",
  "Constantia",
  "Corbel",
  "Segoe UI",
  "Segoe UI Light",
  "Segoe UI Semibold",
  "Century Gothic",
  "Franklin Gothic Medium",
  "Gill Sans",
  "Impact",
  "Rockwell",
  "Baskerville",
  "Didot",
  "Copperplate",
  "Futura",
  "Optima",
  "Avenir",
  "Monaco",
  "Menlo",
  "Courier",
  "System UI",
  "Sans Serif",
  "Serif",
  "Monospace"
];

const BORDER_LIST = [
  ["none", "No Border"],
  ["solid", "Solid"],
  ["dashed", "Dashed"],
  ["dotted", "Dotted"],
  ["double", "Double"],
  ["groove", "Groove"],
  ["ridge", "Ridge"],
  ["inset", "Inset"],
  ["outset", "Outset"],
  ["thin", "Thin Solid"],
  ["medium", "Medium Solid"],
  ["thick", "Thick Solid"],
  ["thin-double", "Thin Double"],
  ["thick-double", "Thick Double"],
  ["short-dash", "Short Dash"],
  ["long-dash", "Long Dash"],
  ["dash-dot", "Dash Dot"],
  ["dash-dot-dot", "Dash Dot Dot"],
  ["triple", "Triple"],
  ["quadruple", "Quadruple"],
  ["soft", "Soft"],
  ["bold", "Bold"],
  ["extra", "Extra Bold"],
  ["minimal", "Minimal"],
  ["classic", "Classic"],
  ["modern", "Modern"],
  ["decorative", "Decorative"],
  ["shadow", "Shadow"],
  ["rounded", "Rounded"],
  ["square", "Square"],
  ["double-soft", "Double Soft"],
  ["double-bold", "Double Bold"],
  ["groove-thin", "Thin Groove"],
  ["ridge-thin", "Thin Ridge"],
  ["classic-double", "Classic Double"]
];

/* =========================================================
   HELPERS
========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

function showToast(type, title, message) {
  const toast = $("#toast");
  const icon = $("#toastIcon");
  const toastTitle = $("#toastTitle");
  const toastText = $("#toastText");

  if (!toast) return;

  clearTimeout(window.__toastTimer);

  toast.className = `toast ${type}`;

  if (icon) {
    icon.textContent = type === "green" ? "✓" : "!";
  }

  if (toastTitle) {
    toastTitle.textContent = title;
  }

  if (toastText) {
    toastText.textContent = message;
  }

  void toast.offsetWidth;

  toast.classList.add("show");

  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function getChecked(name, fallback = null) {
  return $(`input[name="${name}"]:checked`)?.value ?? fallback;
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/* =========================================================
   FONT DROPDOWNS
========================================================= */

function populateFontDropdowns() {
  const selectors = [
    "#poFont",
    "#boxFont",
    ".fontSelect"
  ];

  selectors.forEach(selector => {
    $$(selector).forEach(select => {
      if (select.options.length > 0) return;

      FONT_LIST.forEach(font => {
        const option = document.createElement("option");

        option.value = font;
        option.textContent = font;

        select.appendChild(option);
      });
    });
  });
}

/* =========================================================
   BORDER DROPDOWNS
========================================================= */

function populateBorderDropdowns() {
  const selectors = [
    "#pageBorderStyle",
    "#poBorderStyle",
    "#boxBorderStyle",
    "#allBorderStyle",
    ".borderSelect"
  ];

  selectors.forEach(selector => {
    $$(selector).forEach(select => {
      if (select.options.length > 0) return;

      BORDER_LIST.forEach(([value, label]) => {
        const option = document.createElement("option");

        option.value = value;
        option.textContent = label;

        select.appendChild(option);
      });
    });
  });
}

/* =========================================================
   MODULE SWITCHING
   FOUR MODULES STAY COMPLETELY INDEPENDENT
========================================================= */

function initModules() {
  $$(".module-btn").forEach(button => {
    button.addEventListener("click", () => {

      const targetId = button.dataset.panel;
      const target = document.getElementById(targetId);

      if (!target) return;

      $$(".module-btn").forEach(btn => {
        btn.classList.remove("active");
      });

      $$(".panel").forEach(panel => {
        panel.classList.remove("active");
      });

      button.classList.add("active");
      target.classList.add("active");

      showToast(
        "green",
        "Tool Enabled",
        `${button.querySelector("strong")?.textContent || "Tool"} has been enabled.`
      );

      refreshActivePreview();
    });
  });

  $$(".close").forEach(button => {
    button.addEventListener("click", () => {

      $$(".panel").forEach(panel => {
        panel.classList.remove("active");
      });

      $$(".module-btn").forEach(btn => {
        btn.classList.remove("active");
      });

      showToast(
        "red",
        "Tool Disabled",
        "The active tool has been disabled."
      );
    });
  });
}

/* =========================================================
   COCOBLUE TABS
========================================================= */

function initCocoTabs() {
  $$("#cocoPanel .tab").forEach(tab => {

    tab.addEventListener("click", () => {

      const targetId = tab.dataset.tab;

      $$("#cocoPanel .tab").forEach(t => {
        t.classList.remove("active");
      });

      $$("#cocoPanel .cocoTab").forEach(panel => {
        panel.style.display =
          panel.id === targetId ? "block" : "none";
      });

      tab.classList.add("active");

      showToast(
        "green",
        "Input Mode Enabled",
        `${tab.textContent.trim()} has been enabled.`
      );
    });

  });
}

/* =========================================================
   MANUAL PO — 20 FIELDS
========================================================= */

function createManualPOFields() {
  const container = $("#manualList");

  if (!container || container.children.length > 0) {
    return;
  }

  for (let i = 1; i <= 20; i++) {

    const item = document.createElement("div");

    item.className = "manual-item";

    item.innerHTML = `
      <small>PO ${i}</small>
      <input
        class="manualPO"
        type="text"
        placeholder="PO Number"
      >
    `;

    container.appendChild(item);
  }

  $$(".manualPO").forEach(input => {
    input.addEventListener("input", refreshActivePreview);
  });
}

/* =========================================================
   BULK PO
   UNLIMITED INPUT
========================================================= */

function initBulkInput() {
  const input = $("#bulkInput");
  const counter = $("#bulkCount");

  if (!input) return;

  function updateBulkCount() {

    const values = input.value
      .split(/[,\n\r]+/)
      .map(value => value.trim())
      .filter(Boolean);

    if (counter) {
      counter.textContent =
        `${values.length} PO numbers`;
    }
  }

  input.addEventListener("input", updateBulkCount);

  updateBulkCount();
}

/* =========================================================
   EXCEL
========================================================= */

function initExcel() {
  const input = $("#excelInput");
  const status = $("#excelStatus");

  if (!input) return;

  input.addEventListener("change", () => {

    if (!input.files.length) {
      if (status) {
        status.textContent =
          "No Excel file selected.";
      }

      return;
    }

    const file = input.files[0];

    if (status) {
      status.textContent =
        `${file.name} selected — first row will be treated as header.`;
    }

    showToast(
      "green",
      "Excel Enabled",
      "Excel input has been enabled."
    );
  });
}

/* =========================================================
   COMBINED PO + BOX
========================================================= */

function initContentMode() {

  const combinedFreeze =
    $("#combinedFreeze");

  const contentInputs =
    $$('input[name="content"]');

  if (!combinedFreeze) return;

  combinedFreeze.addEventListener("change", () => {

    if (combinedFreeze.checked) {

      const combined =
        $("#combined");

      if (combined) {
        combined.checked = true;
      }

      contentInputs.forEach(input => {
        input.disabled = true;
      });

      showToast(
        "green",
        "Combined Enabled",
        "PO and Box content controls are now frozen."
      );

    } else {

      contentInputs.forEach(input => {
        input.disabled = false;
      });

      showToast(
        "red",
        "Combined Disabled",
        "PO Number and Box Number controls are available individually."
      );
    }

    refreshActivePreview();
  });

  contentInputs.forEach(input => {
    input.addEventListener("change", refreshActivePreview);
  });
}

/* =========================================================
   CUSTOM PAGE SIZE
========================================================= */

function initCustomPage() {

  const pageSize = $("#pageSize");
  const customPage = $("#customPage");

  if (!pageSize || !customPage) return;

  pageSize.addEventListener("change", () => {

    const isCustom =
      pageSize.value === "custom";

    customPage.classList.toggle(
      "open",
      isCustom
    );

    showToast(
      isCustom ? "green" : "red",
      isCustom
        ? "Custom Page Enabled"
        : "Custom Page Disabled",
      isCustom
        ? "Custom width and height fields are available."
        : "Custom page fields have been hidden."
    );

    refreshActivePreview();
  });
}

/* =========================================================
   CUSTOM LABEL COUNT
========================================================= */

function initCustomLabelCount() {

  const select = $("#labelsPerPage");
  const customBox = $("#customLabels");

  if (!select || !customBox) return;

  select.addEventListener("change", () => {

    const isCustom =
      select.value === "custom";

    customBox.classList.toggle(
      "open",
      isCustom
    );

    showToast(
      isCustom ? "green" : "red",
      isCustom
        ? "Custom Label Count Enabled"
        : "Custom Label Count Disabled",
      isCustom
        ? "Enter your required labels per page."
        : "Predefined label count selected."
    );

    refreshActivePreview();
  });
}

/* =========================================================
   BOX RANGE VALIDATION
========================================================= */

function validateBoxRange(
  startSelector,
  endSelector
) {

  const startInput =
    $(startSelector);

  const endInput =
    $(endSelector);

  if (!startInput || !endInput) {
    return true;
  }

  const startRaw =
    startInput.value.trim();

  const endRaw =
    endInput.value.trim();

  if (!startRaw || !endRaw) {
    startInput.setCustomValidity("");
    endInput.setCustomValidity("");

    return true;
  }

  const start =
    safeNumber(startRaw);

  const end =
    safeNumber(endRaw);

  if (start > end) {

    const message =
      "Start Box Number must be lower than or equal to End Box Number.";

    startInput.setCustomValidity(message);
    endInput.setCustomValidity(message);

    showToast(
      "red",
      "Invalid Box Range",
      "Start Box Number cannot be greater than End Box Number."
    );

    return false;
  }

  startInput.setCustomValidity("");
  endInput.setCustomValidity("");

  return true;
}

/* =========================================================
   COCO BOX RANGE
========================================================= */

function initCocoRange() {

  ["#startBox", "#endBox"].forEach(selector => {

    const input = $(selector);

    if (!input) return;

    input.addEventListener("input", () => {

      validateBoxRange(
        "#startBox",
        "#endBox"
      );

      updateCocoPreview();
    });
  });
}

/* =========================================================
   OTHER PO BOX RANGE
========================================================= */

function initOtherRange() {

  ["#otherStart", "#otherEnd"].forEach(selector => {

    const input = $(selector);

    if (!input) return;

    input.addEventListener("input", () => {

      validateBoxRange(
        "#otherStart",
        "#otherEnd"
      );

      updateOtherPreview();
    });
  });
}

/* =========================================================
   ALL BORDER MODE
========================================================= */

function initAllBorder() {

  const allBorder =
    $("#allBorder");

  if (!allBorder) return;

  const individualIds = [
    "pageBorder",
    "poBorder",
    "boxBorder"
  ];

  allBorder.addEventListener(
    "change",
    () => {

      const checked =
        allBorder.checked;

      individualIds.forEach(id => {

        const input =
          document.getElementById(id);

        if (!input) return;

        input.checked = checked;
        input.disabled = checked;

        const card =
          input.closest(".border-card");

        if (card) {
          card.classList.toggle(
            "frozen",
            checked
          );
        }
      });

      showToast(
        checked ? "green" : "red",
        checked
          ? "All Border Enabled"
          : "All Border Disabled",
        checked
          ? "Page, PO and Box borders are enabled and frozen."
          : "Individual border controls are available."
      );

      updateCocoPreview();
    }
  );
}

/* =========================================================
   ENABLE / DISABLE TOASTS
========================================================= */

function initToggleToasts() {

  $$(`
    #cocoPanel input[type="checkbox"],
    #cocoPanel input[type="radio"]
  `).forEach(input => {

    input.addEventListener("change", () => {

      /*
        Do not duplicate the Combined/All Border
        specialized messages.
      */

      if (
        input.id === "combinedFreeze" ||
        input.id === "allBorder"
      ) {
        return;
      }

      const wrapper =
        input.closest(
          ".choice,.format,.border-card"
        );

      const label =
        wrapper?.querySelector(
          "label,strong"
        );

      const feature =
        label?.textContent.trim() ||
        "Feature";

      showToast(
        input.checked
          ? "green"
          : "red",
        input.checked
          ? "Feature Enabled"
          : "Feature Disabled",
        `${feature} has been ${
          input.checked
            ? "enabled"
            : "disabled"
        }.`
      );

      refreshActivePreview();
    });
  });
}

/* =========================================================
   BORDER CSS
========================================================= */

function getBorderCSS(style) {

  const map = {

    none: "none",

    solid:
      "1px solid #111",

    dashed:
      "2px dashed #111",

    dotted:
      "2px dotted #111",

    double:
      "3px double #111",

    groove:
      "3px groove #111",

    ridge:
      "3px ridge #111",

    inset:
      "3px inset #111",

    outset:
      "3px outset #111",

    thin:
      "1px solid #111",

    medium:
      "2px solid #111",

    thick:
      "4px solid #111",

    "thin-double":
      "2px double #111",

    "thick-double":
      "5px double #111",

    "short-dash":
      "2px dashed #111",

    "long-dash":
      "3px dashed #111",

    "dash-dot":
      "2px dashed #111",

    "dash-dot-dot":
      "2px dashed #111",

    triple:
      "5px double #111",

    quadruple:
      "6px double #111",

    soft:
      "1px solid #94a3b8",

    bold:
      "4px solid #111",

    extra:
      "6px solid #111",

    minimal:
      "1px solid #cbd5e1",

    classic:
      "2px solid #111",

    modern:
      "2px solid #2563eb",

    decorative:
      "3px double #111",

    shadow:
      "1px solid #111",

    rounded:
      "2px solid #111",

    square:
      "2px solid #111",

    "double-soft":
      "3px double #64748b",

    "double-bold":
      "5px double #111",

    "groove-thin":
      "2px groove #64748b",

    "ridge-thin":
      "2px ridge #64748b",

    "classic-double":
      "4px double #111"
  };

  return map[style] || "1px solid #111";
}

/* =========================================================
   GET LABEL COUNT
========================================================= */

function getCocoLabelCount() {

  const select =
    $("#labelsPerPage");

  if (!select) return 1;

  if (select.value === "custom") {

    return Math.max(
      1,
      safeNumber(
        $("#customLabelCount")?.value,
        1
      )
    );
  }

  return Math.max(
    1,
    safeNumber(
      select.value,
      1
    )
  );
}

/* =========================================================
   PAGE SIZE PREVIEW
========================================================= */

function applyCocoPageSize(preview) {

  const size =
    $("#pageSize")?.value;

  if (!preview) return;

  if (size === "4x6") {

    preview.style.width = "500px";
    preview.style.minHeight = "340px";
  }

  else if (size === "70x35") {

    preview.style.width = "430px";
    preview.style.minHeight = "220px";
  }

  else if (size === "a4") {

    preview.style.width = "500px";
    preview.style.minHeight = "680px";
  }

  else if (size === "custom") {

    const width =
      safeNumber(
        $("#customWidth")?.value,
        70
      );

    const height =
      safeNumber(
        $("#customHeight")?.value,
        35
      );

    preview.style.width =
      `${Math.min(
        Math.max(width * 5, 250),
        700
      )}px`;

    preview.style.minHeight =
      `${Math.min(
        Math.max(height * 5, 180),
        850
      )}px`;
  }
}

/* =========================================================
   COCO CONTENT
========================================================= */

function getCocoContentMode() {

  if ($("#combinedFreeze")?.checked) {
    return "combined";
  }

  return getChecked(
    "content",
    "po"
  );
}

/* =========================================================
   COCO PREVIEW
========================================================= */

function updateCocoPreview() {

  const preview =
    $("#cocoPreview");

  if (!preview) return;

  const count =
    getCocoLabelCount();

  const visualCount =
    Math.min(count, 20);

  let columns = 1;

  if (visualCount >= 4) {
    columns = 2;
  }

  if (visualCount >= 9) {
    columns = 3;
  }

  preview.style.gridTemplateColumns =
    `repeat(${columns}, 1fr)`;

  applyCocoPageSize(preview);

  preview.innerHTML = "";

  const po =
    $("#poNumber")?.value.trim() ||
    "BWG123";

  const poPrefix =
    $("#poPrefix")?.value.trim() ||
    "";

  const boxPrefix =
    $("#boxPrefix")?.value.trim() ||
    "BOX NO.";

  const start =
    safeNumber(
      $("#startBox")?.value,
      121
    );

  const content =
    getCocoContentMode();

  const lineMode =
    getChecked(
      "lineMode",
      "separate"
    );

  const pageBorderEnabled =
    $("#pageBorder")?.checked ||
    $("#allBorder")?.checked;

  const poBorderEnabled =
    $("#poBorder")?.checked ||
    $("#allBorder")?.checked;

  const boxBorderEnabled =
    $("#boxBorder")?.checked ||
    $("#allBorder")?.checked;

  if (pageBorderEnabled) {

    const style =
      $("#allBorder")?.checked
        ? $("#allBorderStyle")?.value
        : $("#pageBorderStyle")?.value;

    preview.style.border =
      getBorderCSS(style);
  }
  else {
    preview.style.border = "none";
  }

  for (let i = 0; i < visualCount; i++) {

    const label =
      document.createElement("div");

    label.className = "label";

    label.style.flexDirection =
      lineMode === "same"
        ? "row"
        : "column";

    label.style.gap = "7px";

    const poElement =
      document.createElement("div");

    poElement.className =
      "po-preview";

    poElement.textContent =
      `${poPrefix}${po}`;

    const boxElement =
      document.createElement("div");

    boxElement.className =
      "box-preview";

    boxElement.textContent =
      `${boxPrefix}${start + i}`;

    /* CONTENT MODE */

    if (content === "po") {
      boxElement.style.display = "none";
    }

    if (content === "box") {
      poElement.style.display = "none";
    }

    /* PO FONT */

    poElement.style.fontFamily =
      $("#poFont")?.value ||
      "Arial";

    poElement.style.fontSize =
      `${safeNumber(
        $("#poSize")?.value,
        20
      )}px`;

    poElement.style.opacity =
      safeNumber(
        $("#poOpacity")?.value,
        100
      ) / 100;

    poElement.style.fontWeight =
      $("#poBold")?.checked
        ? "700"
        : "400";

    poElement.style.fontStyle =
      $("#poItalic")?.checked
        ? "italic"
        : "normal";

    poElement.style.textDecoration =
      $("#poUnderline")?.checked
        ? "underline"
        : "none";

    /* BOX FONT */

    boxElement.style.fontFamily =
      $("#boxFont")?.value ||
      "Arial";

    boxElement.style.fontSize =
      `${safeNumber(
        $("#boxSize")?.value,
        17
      )}px`;

    boxElement.style.opacity =
      safeNumber(
        $("#boxOpacity")?.value,
        100
      ) / 100;

    boxElement.style.fontWeight =
      $("#boxBold")?.checked
        ? "700"
        : "400";

    boxElement.style.fontStyle =
      $("#boxItalic")?.checked
        ? "italic"
        : "normal";

    boxElement.style.textDecoration =
      $("#boxUnderline")?.checked
        ? "underline"
        : "none";

    /* PO BORDER */

    if (poBorderEnabled) {

      const style =
        $("#allBorder")?.checked
          ? $("#allBorderStyle")?.value
          : $("#poBorderStyle")?.value;

      poElement.style.border =
        getBorderCSS(style);

      poElement.style.padding =
        "3px 6px";
    }

    /* BOX BORDER */

    if (boxBorderEnabled) {

      const style =
        $("#allBorder")?.checked
          ? $("#allBorderStyle")?.value
          : $("#boxBorderStyle")?.value;

      boxElement.style.border =
        getBorderCSS(style);

      boxElement.style.padding =
        "3px 6px";
    }

    label.appendChild(poElement);
    label.appendChild(boxElement);

    preview.appendChild(label);
  }
}

/* =========================================================
   OTHER PO PREVIEW
========================================================= */

function updateOtherPreview() {

  const panel =
    $("#otherPanel");

  if (!panel) return;

  const preview =
    $(".preview-page", panel);

  if (!preview) return;

  const po =
    $("#otherPO")?.value.trim() ||
    "BWG123";

  const start =
    safeNumber(
      $("#otherStart")?.value,
      121
    );

  const end =
    safeNumber(
      $("#otherEnd")?.value,
      start
    );

  if (start > end) {
    return;
  }

  const label =
    $(".label", preview);

  if (!label) return;

  const poElement =
    $(".po-preview", label);

  const boxElement =
    $(".box-preview", label);

  if (poElement) {
    poElement.textContent = po;
  }

  if (boxElement) {
    boxElement.textContent =
      `BOX NO.${start}`;
  }
}

/* =========================================================
   ISBN PREVIEW
========================================================= */

function initISBN() {

  const isbnInput =
    $("#isbnNumber");

  const isbnPreview =
    $("#isbnPreview");

  if (!isbnInput || !isbnPreview) {
    return;
  }

  isbnInput.addEventListener(
    "input",
    () => {

      isbnPreview.textContent =
        isbnInput.value.trim() ||
        "Enter ISBN";
    }
  );
}

/* =========================================================
   ADDRESS PREVIEW
========================================================= */

function initAddress() {

  const address =
    $("#addressInput");

  const email =
    $("#addressEmail");

  const align =
    $("#addressAlign");

  const preview =
    $("#addressPreview");

  if (!preview) return;

  function update() {

    const addressText =
      address?.value.trim() ||
      "Your address will appear here.";

    const emailText =
      email?.value.trim();

    preview.innerHTML =
      addressText.replace(
        /\n/g,
        "<br>"
      ) +
      (
        emailText
          ? `<br><br>✉️ ${emailText}`
          : ""
      );

    if (align) {

      preview.style.textAlign =
        align.value.toLowerCase();
    }
  }

  [address, email, align]
    .filter(Boolean)
    .forEach(element => {

      element.addEventListener(
        "input",
        update
      );

      element.addEventListener(
        "change",
        update
      );
    });

  update();
}

/* =========================================================
   LIVE COCO CONTROLS
========================================================= */

function initLiveCocoControls() {

  const panel =
    $("#cocoPanel");

  if (!panel) return;

  $$(
    "input, select, textarea",
    panel
  ).forEach(element => {

    element.addEventListener(
      "input",
      updateCocoPreview
    );

    element.addEventListener(
      "change",
      updateCocoPreview
    );
  });
}

/* =========================================================
   RESET COCOBLUE
========================================================= */

function initCocoReset() {

  const reset =
    $("#cocoReset");

  if (!reset) return;

  reset.addEventListener(
    "click",
    () => {

      const panel =
        $("#cocoPanel");

      $$(
        "input",
        panel
      ).forEach(input => {

        if (
          input.type === "text" ||
          input.type === "number"
        ) {
          input.value = "";
        }

        if (
          input.type === "checkbox"
        ) {
          input.checked = false;
          input.disabled = false;
        }

        if (
          input.type === "radio"
        ) {
          input.disabled = false;
        }
      });

      if ($("#boxPrefix")) {
        $("#boxPrefix").value =
          "BOX NO.";
      }

      if ($("#poOnly")) {
        $("#poOnly").checked = true;
      }

      if ($("#pageSize")) {
        $("#pageSize").value = "4x6";
      }

      if ($("#labelsPerPage")) {
        $("#labelsPerPage").value = "2";
      }

      if ($("#combinedFreeze")) {
        $("#combinedFreeze").checked = false;
      }

      $$("#cocoPanel .border-card")
        .forEach(card => {
          card.classList.remove("frozen");
        });

      if ($("#customPage")) {
        $("#customPage")
          .classList.remove("open");
      }

      if ($("#customLabels")) {
        $("#customLabels")
          .classList.remove("open");
      }

      updateCocoPreview();

      showToast(
        "green",
        "Settings Reset",
        "CocoBlue settings have been reset."
      );
    }
  );
}

/* =========================================================
   GENERATE PDF
   Separate from Print PDF
========================================================= */

function generatePDF(moduleName = "BooksWagon Label") {

  const activePanel =
    $(".panel.active");

  if (!activePanel) {

    showToast(
      "red",
      "PDF Error",
      "No active tool is selected."
    );

    return;
  }

  const preview =
    $(".preview-page", activePanel);

  if (!preview) {

    showToast(
      "red",
      "PDF Error",
      "No preview is available."
    );

    return;
  }

  const popup =
    window.open(
      "",
      "_blank",
      "width=900,height=900"
    );

  if (!popup) {

    showToast(
      "red",
      "Popup Blocked",
      "Please allow browser popups to generate the PDF."
    );

    return;
  }

  const printCSS = `
    <style>

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 20px;
        background: white;
        font-family: Arial, sans-serif;
      }

      .preview-page {
        background: white;
        box-shadow: none !important;
        margin: auto;
      }

      .label {
        break-inside: avoid;
      }

      @media print {

        body {
          padding: 0;
        }

        .preview-page {
          box-shadow: none !important;
        }
      }

    </style>
  `;

  popup.document.open();

  popup.document.write(`
    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8">

      <title>
        ${moduleName}
      </title>

      ${printCSS}

    </head>

    <body>

      ${preview.outerHTML}

    </body>

    </html>
  `);

  popup.document.close();

  showToast(
    "green",
    "PDF Generated",
    `${moduleName} PDF is ready.`
  );
}

/* =========================================================
   PRINT PDF
   Opens browser print dialog
========================================================= */

function printPDF() {

  showToast(
    "green",
    "Print PDF",
    "Opening the print dialog."
  );

  setTimeout(() => {
    window.print();
  }, 300);
}

/* =========================================================
   OPTIONAL BUTTON HANDLERS
========================================================= */

function initPDFButtons() {

  const generate =
    $("#generatePDF");

  const print =
    $("#printPDF");

  if (generate) {

    generate.addEventListener(
      "click",
      () => {

        generatePDF(
          "CocoBlue"
        );
      }
    );
  }

  if (print) {

    print.addEventListener(
      "click",
      () => {
        printPDF();
      }
    );
  }

  /*
    Other modules already use
    inline onclick handlers in the HTML.
  */
}

/* =========================================================
   LIVE PREVIEW ROUTER
========================================================= */

function refreshActivePreview() {

  const active =
    $(".panel.active");

  if (!active) return;

  if (
    active.id === "cocoPanel"
  ) {
    updateCocoPreview();
  }

  else if (
    active.id === "otherPanel"
  ) {
    updateOtherPreview();
  }

  else if (
    active.id === "isbnPanel"
  ) {

    const input =
      $("#isbnNumber");

    const preview =
      $("#isbnPreview");

    if (input && preview) {

      preview.textContent =
        input.value.trim() ||
        "Enter ISBN";
    }
  }
}

/* =========================================================
   OTHER PO LIVE INPUTS
========================================================= */

function initOtherLive() {

  const panel =
    $("#otherPanel");

  if (!panel) return;

  $$(
    "input, select, textarea",
    panel
  ).forEach(element => {

    element.addEventListener(
      "input",
      updateOtherPreview
    );

    element.addEventListener(
      "change",
      updateOtherPreview
    );
  });
}

/* =========================================================
   GENERAL ENABLE / DISABLE TOAST
========================================================= */

function initGeneralToggleMessages() {

  $$(
    'input[type="checkbox"]'
  ).forEach(input => {

    if (
      input.id === "combinedFreeze" ||
      input.id === "allBorder"
    ) {
      return;
    }

    input.addEventListener(
      "change",
      () => {

        const wrapper =
          input.closest(
            ".choice,.format,.border-card"
          );

        const label =
          wrapper?.querySelector(
            "label,strong"
          );

        const name =
          label?.textContent.trim() ||
          "Feature";

        showToast(
          input.checked
            ? "green"
            : "red",

          input.checked
            ? "Feature Enabled"
            : "Feature Disabled",

          `${name} has been ${
            input.checked
              ? "enabled"
              : "disabled"
          }.`
        );
      }
    );
  });
}

/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
      Ctrl + P
      Browser print dialog
    */

    if (
      event.ctrlKey &&
      event.key.toLowerCase() === "p"
    ) {

      event.preventDefault();

      printPDF();
    }
  }
);

/* =========================================================
   INITIALIZE EVERYTHING
========================================================= */

function initBooksWagonStudio() {

  populateFontDropdowns();

  populateBorderDropdowns();

  createManualPOFields();

  initModules();

  initCocoTabs();

  initBulkInput();

  initExcel();

  initContentMode();

  initCustomPage();

  initCustomLabelCount();

  initCocoRange();

  initOtherRange();

  initAllBorder();

  initToggleToasts();

  initLiveCocoControls();

  initCocoReset();

  initISBN();

  initAddress();

  initOtherLive();

  initPDFButtons();

  initGeneralToggleMessages();

  updateCocoPreview();

  updateOtherPreview();

  refreshActivePreview();
}

/* =========================================================
   START
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initBooksWagonStudio
  );

} else {

  initBooksWagonStudio();
}