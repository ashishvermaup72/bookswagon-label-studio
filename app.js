:root {
    --navy: #203d72;
    --dark: #132b54;
    --yellow: #ffc83d;
    --bg: #f4f6f9;
    --white: #ffffff;
    --text: #172033;
    --muted: #6b7483;
    --border: #dce2ea;
    --green: #149c60;
    --red: #d83d3d;
    --shadow: 0 10px 30px rgba(20, 45, 85, 0.10);
}

* {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: Arial, Helvetica, sans-serif;
}

button,
input,
select,
textarea {
    font: inherit;
}

button {
    cursor: pointer;
}

a {
    text-decoration: none;
    color: inherit;
}

.container {
    width: min(1180px, calc(100% - 30px));
    margin: auto;
}

/* =========================
   HEADER
========================= */

.topbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: var(--navy);
    border-bottom: 3px solid var(--yellow);
    box-shadow: 0 4px 15px rgba(0, 0, 0, .15);
}

.topbar-inner {
    min-height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand {
    color: #fff;
    font-size: 22px;
    font-weight: 900;
}

.nav {
    display: flex;
    gap: 25px;
}

.nav a {
    color: #fff;
    font-size: 11px;
    font-weight: 800;
}

/* =========================
   HERO
========================= */

.hero {
    background: var(--navy);
    color: #fff;
    padding: 65px 0 80px;
}

.hero-grid {
    display: grid;
    grid-template-columns: 1.1fr .9fr;
    gap: 50px;
    align-items: center;
}

.kicker {
    color: var(--yellow);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 2px;
}

.hero h1 {
    margin: 12px 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(42px, 6vw, 68px);
    line-height: 1;
}

.hero h1 span {
    color: var(--yellow);
}

.hero p {
    max-width: 620px;
    color: rgba(255, 255, 255, .75);
    font-size: 13px;
    line-height: 1.8;
}

.hero-buttons {
    display: flex;
    gap: 10px;
    margin-top: 25px;
}

.btn {
    min-height: 42px;
    padding: 0 17px;
    border: 0;
    border-radius: 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    transition: .18s ease;
}

.btn:hover {
    transform: translateY(-1px);
}

.btn:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
}

.btn-primary {
    background: var(--yellow);
    color: var(--dark);
}

.btn-secondary {
    background: #eef1f5;
    color: var(--navy);
}

.btn-outline {
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, .4);
}

.book-preview {
    width: 220px;
    height: 300px;
    margin: auto;
    padding: 25px;
    background: #f8f5e9;
    color: var(--navy);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    box-shadow: 20px 25px 50px rgba(0, 0, 0, .3);
    transform: rotate(-2deg);
}

.book-preview h2 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 28px;
}

/* =========================
   SECTIONS
========================= */

.section {
    padding: 70px 0;
}

.section-heading {
    margin-bottom: 30px;
}

.section-heading span {
    color: var(--navy);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 1.5px;
}

.section-heading h2 {
    margin: 6px 0;
    color: var(--navy);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 34px;
}

.section-heading p {
    color: var(--muted);
    font-size: 12px;
}

/* =========================
   TOOL CARDS
========================= */

.tool-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.tool-card {
    width: 100%;
    padding: 24px;
    background: #fff;
    border: 1px solid var(--border);
    border-top: 4px solid var(--yellow);
    box-shadow: var(--shadow);
    text-align: left;
    transition: .2s ease;
}

.tool-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(20, 45, 85, .14);
}

.tool-number {
    color: #b68b00;
    font-size: 9px;
    font-weight: 900;
}

.tool-card h3 {
    margin: 9px 0;
    color: var(--navy);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 21px;
}

.tool-card p {
    color: var(--muted);
    font-size: 10px;
    line-height: 1.7;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 15px;
}

.tags span {
    padding: 4px 7px;
    background: #eef2f7;
    color: var(--navy);
    font-size: 8px;
    font-weight: 900;
}

/* =========================
   WORKSPACE
========================= */

.workspace {
    display: none;
    padding: 30px 0 70px;
}

.workspace.active {
    display: block;
}

.workspace-card {
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
}

.workspace-header {
    padding: 25px 28px;
    background: var(--navy);
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.workspace-header h2 {
    margin: 5px 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 27px;
}

.workspace-header p {
    margin: 0;
    color: rgba(255, 255, 255, .7);
    font-size: 10px;
}

.workspace-body {
    padding: 28px;
}

/* =========================
   TOOL SELECTOR
========================= */

.tool-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 25px;
}

.tool-select-btn {
    padding: 10px 16px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--muted);
    font-size: 10px;
    font-weight: 900;
    transition: .18s ease;
}

.tool-select-btn:hover {
    border-color: var(--navy);
}

.tool-select-btn.active {
    background: var(--navy);
    color: #fff;
    border-color: var(--navy);
}

/* =========================
   CONFIGURATION
========================= */

.config-section {
    padding: 25px 0;
    border-bottom: 1px solid var(--border);
}

.section-title {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 17px;
}

.step {
    width: 28px;
    height: 28px;
    min-width: 28px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--yellow);
    color: var(--dark);
    font-size: 9px;
    font-weight: 900;
}

.section-title h3 {
    margin: 0;
    color: var(--navy);
    font-size: 14px;
}

.section-title p {
    margin: 3px 0 0;
    color: var(--muted);
    font-size: 10px;
}

/* =========================
   FORM
========================= */

.form-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.form-field label {
    display: block;
    margin-bottom: 5px;
    color: var(--muted);
    font-size: 9px;
    font-weight: 900;
}

input,
select,
textarea {
    width: 100%;
    min-height: 40px;
    padding: 9px 10px;
    background: #fff;
    color: var(--text);
    border: 1px solid #ccd3dd;
    border-radius: 4px;
    outline: none;
    transition: .15s ease;
}

input:focus,
select:focus,
textarea:focus {
    border-color: var(--navy);
    box-shadow: 0 0 0 3px rgba(32, 61, 114, .08);
}

textarea {
    min-height: 110px;
    resize: vertical;
}

/* =========================
   PAGE SIZE LOCK
========================= */

input:disabled,
select:disabled {
    cursor: not-allowed;
    opacity: .55;
    background: #edf0f4;
}

.locked {
    opacity: .45;
    pointer-events: none;
    background: #edf0f4 !important;
}

/* =========================
   INPUT TABS
========================= */

.input-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
}

.input-tab {
    padding: 9px 13px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--muted);
    font-size: 9px;
    font-weight: 900;
    transition: .15s ease;
}

.input-tab:hover {
    border-color: var(--navy);
}

.input-tab.active {
    background: var(--navy);
    color: #fff;
    border-color: var(--navy);
}

.input-panel {
    display: none;
}

.input-panel.active {
    display: block;
}

/* =========================
   PO INPUTS
========================= */

.po-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 9px;
}

.po-field {
    position: relative;
}

.po-field span {
    position: absolute;
    left: 9px;
    top: 50%;
    transform: translateY(-50%);
    color: #9aa3b2;
    font-size: 8px;
    font-weight: 900;
    pointer-events: none;
}

.po-field input {
    padding-left: 38px;
}

/* =========================
   EXCEL
========================= */

.excel-box {
    padding: 22px;
    background: #f8fafc;
    border: 1px dashed #aeb8c6;
    border-radius: 5px;
}

.excel-box h4 {
    margin: 0 0 7px;
    color: var(--navy);
    font-size: 13px;
}

.excel-box p {
    margin: 0 0 15px;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.7;
}

.excel-box input[type="file"] {
    padding: 8px;
    background: #fff;
    cursor: pointer;
}

.excel-status {
    margin-top: 10px;
    color: var(--green);
    font-size: 10px;
    font-weight: 900;
}

.excel-preview {
    max-height: 240px;
    overflow: auto;
    margin-top: 15px;
    border: 1px solid var(--border);
    border-radius: 4px;
}

.excel-preview:empty {
    display: none;
}

.excel-preview table {
    width: 100%;
    border-collapse: collapse;
}

.excel-preview th,
.excel-preview td {
    padding: 8px;
    border: 1px solid var(--border);
    text-align: left;
    font-size: 9px;
    white-space: nowrap;
}

.excel-preview th {
    background: var(--navy);
    color: #fff;
    position: sticky;
    top: 0;
    z-index: 2;
}

/* =========================
   ADDRESS
========================= */

.address-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.address-card {
    padding: 18px;
    background: #f8fafc;
    border: 1px solid var(--border);
    border-radius: 5px;
}

.address-card h4 {
    margin: 0 0 12px;
    color: var(--navy);
    font-size: 12px;
}

.address-card textarea {
    min-height: 130px;
}

/* =========================
   ADDRESS STICKER
========================= */

.address-sticker-preview {
    width: min(100%, 650px);
    min-height: 300px;
    margin: 25px auto;
    padding: 28px;
    background: #fff;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: center;
    border: 2px solid #111827;
    box-shadow: var(--shadow);
}

.address-side {
    padding: 20px;
}

.address-side:first-child {
    border-right: 1px dashed #888;
}

.address-side small {
    display: block;
    margin-bottom: 8px;
    color: #888;
    font-size: 9px;
    font-weight: 900;
}

.address-side strong {
    display: block;
    margin-bottom: 10px;
    color: var(--navy);
    font-size: 18px;
}

.address-side div {
    white-space: pre-line;
    font-size: 11px;
    line-height: 1.6;
}

/* =========================
   ISBN BARCODE
========================= */

.isbn-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
}

.isbn-card {
    padding: 18px;
    background: #f8fafc;
    border: 1px solid var(--border);
    border-radius: 5px;
}

.isbn-card h4 {
    margin: 0 0 12px;
    color: var(--navy);
    font-size: 12px;
}

.isbn-card small {
    display: block;
    margin-top: 8px;
    color: var(--muted);
    font-size: 9px;
    line-height: 1.6;
}

.isbn-barcode-preview {
    margin: 25px auto;
    padding: 25px;
    min-height: 220px;
    max-width: 600px;
    background: #fff;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    text-align: center;
}

.isbn-barcode-preview svg {
    max-width: 100%;
}

.isbn-barcode-preview .book-title {
    margin-top: 12px;
    color: var(--navy);
    font-weight: 900;
    font-size: 15px;
}

.isbn-barcode-preview .edition {
    margin-top: 5px;
    color: var(--muted);
    font-size: 10px;
}

/* =========================
   CHECKBOX
========================= */

.checkbox-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.feature-checkbox {
    min-height: 44px;
    padding: 9px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--border);
    background: #fff;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;
    transition: .15s ease;
}

.feature-checkbox:hover {
    border-color: var(--navy);
    background: #fafbfd;
}

.feature-checkbox input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.custom-check {
    width: 18px;
    height: 18px;
    min-width: 18px;
    position: relative;
    border: 2px solid #aab3c0;
    border-radius: 3px;
    background: #fff;
    transition: .15s;
}

.feature-checkbox input:checked + .custom-check {
    background: var(--navy);
    border-color: var(--navy);
}

.feature-checkbox input:checked + .custom-check::after {
    content: "✓";
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--yellow);
    font-size: 12px;
    font-weight: 900;
}

.checkbox-text {
    font-size: 10px;
    font-weight: 800;
}

/* =========================
   PREVIEW
========================= */

.preview-section {
    margin-top: 28px;
    padding: 25px;
    background: #eef1f5;
    border: 1px solid var(--border);
    border-radius: 5px;
}

.preview-page {
    width: min(100%, 600px);
    min-height: 420px;
    margin: auto;
    padding: 30px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: .2s ease;
}

.preview-content {
    width: 85%;
    padding: 20px;
    text-align: center;
    transition: .2s ease;
}

.preview-po,
.preview-box {
    min-width: 180px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 22px;
    margin: 5px;
    font-size: 18px;
    font-weight: 700;
}

.preview-cut {
    margin: 12px 0;
    color: #555;
    font-size: 12px;
    letter-spacing: 2px;
}

.hidden-preview {
    display: none !important;
}

/* =========================
   DOWNLOAD
========================= */

.workspace-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
}

/* =========================
   SUPPORT
========================= */

.support-card {
    padding: 30px;
    background: #fff;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    border-radius: 5px;
}

.support-card h2 {
    margin: 5px 0 10px;
    color: var(--navy);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 30px;
}

.address-link,
.email-link {
    display: block;
    color: var(--navy);
    font-size: 11px;
    font-weight: 800;
    line-height: 1.8;
    margin-bottom: 6px;
}

.address-link:hover,
.email-link:hover {
    color: #315da8;
    text-decoration: underline;
}

.created {
    margin-top: 20px;
    color: var(--muted);
    font-size: 10px;
}

.created strong {
    color: var(--navy);
}

.qr-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.qr-card {
    padding: 15px;
    background: #f7f8fa;
    border: 1px solid var(--border);
    text-align: center;
    border-radius: 5px;
}

.qr-card h4 {
    margin: 0 0 10px;
    color: var(--navy);
    font-size: 10px;
}

.qr-code {
    width: 140px;
    height: 140px;
    margin: auto;
    display: grid;
    place-items: center;
    background: #fff;
}

.qr-code img,
.qr-code canvas {
    max-width: 130px;
    max-height: 130px;
}

/* =========================
   FOOTER
========================= */

footer {
    background: var(--navy);
    color: #fff;
    border-top: 5px solid var(--yellow);
}

.footer-grid {
    padding: 35px 0;
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 30px;
}

.footer-brand {
    font-size: 20px;
    font-weight: 900;
}

.footer-grid strong {
    color: var(--yellow);
    font-size: 10px;
}

.footer-grid p,
.footer-grid a {
    color: rgba(255, 255, 255, .68);
    font-size: 10px;
    line-height: 1.7;
}

.footer-grid a:hover {
    color: #fff;
    text-decoration: underline;
}

.footer-bottom {
    padding: 13px 0;
    border-top: 1px solid rgba(255, 255, 255, .1);
    color: rgba(255, 255, 255, .5);
    font-size: 9px;
    display: flex;
    justify-content: space-between;
}

/* =========================
   TOAST
========================= */

#toastContainer {
    position: fixed;
    top: 82px;
    right: 18px;
    z-index: 99999;
    width: min(350px, calc(100vw - 30px));
    pointer-events: none;
}

.toast {
    padding: 13px 15px;
    margin-bottom: 8px;
    background: #fff;
    border: 1px solid var(--border);
    border-left: 4px solid var(--green);
    box-shadow: var(--shadow);
    color: var(--green);
    font-size: 10px;
    font-weight: 800;
    animation: toastIn .2s ease;
}

.toast.error {
    color: var(--red);
    border-left-color: var(--red);
}

@keyframes toastIn {
    from {
        opacity: 0;
        transform: translateX(15px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* =========================
   MOBILE
========================= */

@media (max-width: 1050px) {

    .tool-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .form-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .po-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .isbn-grid {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 900px) {

    .hero-grid {
        grid-template-columns: 1fr;
    }

    .support-card {
        grid-template-columns: 1fr;
    }

    .footer-grid {
        grid-template-columns: 1fr 1fr;
    }

    .isbn-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 650px) {

    .container {
        width: min(100% - 20px, 1180px);
    }

    .nav {
        display: none;
    }

    .hero {
        padding: 45px 0 60px;
    }

    .hero h1 {
        font-size: 45px;
    }

    .hero-buttons {
        flex-direction: column;
    }

    .hero-buttons .btn {
        width: 100%;
    }

    .tool-grid,
    .form-grid,
    .po-grid,
    .checkbox-grid,
    .address-grid,
    .isbn-grid,
    .address-sticker-preview,
    .footer-grid {
        grid-template-columns: 1fr;
    }

    .workspace-body {
        padding: 18px;
    }

    .workspace-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .workspace-actions {
        flex-direction: column;
    }

    .workspace-actions .btn {
        width: 100%;
    }

    .address-side:first-child {
        border-right: 0;
        border-bottom: 1px dashed #888;
    }

    .qr-grid {
        grid-template-columns: 1fr;
    }

    .preview-page {
        min-height: 300px;
        padding: 15px;
    }

    .preview-content {
        width: 100%;
    }

    #toastContainer {
        top: 72px;
        right: 10px;
        width: calc(100vw - 20px);
    }
}

/* =========================
   PRINT
========================= */

@media print {

    .topbar,
    .hero,
    .tool-grid,
    .workspace-header,
    .workspace-actions,
    footer,
    #support {
        display: none !important;
    }

    body {
        background: #fff;
    }

    .workspace {
        display: block !important;
        padding: 0;
    }

    .workspace-card {
        border: 0;
        box-shadow: none;
    }

    .workspace-body {
        padding: 0;
    }
}
