/* =========================================================
   UNIVERSAL PDF DOWNLOAD
   ========================================================= */

async function downloadPreviewPDF(previewId, fileName) {

    const preview = document.getElementById(previewId);

    if (!preview) {
        toast("Preview area not found.", "red");
        return;
    }

    const pages = [
        ...preview.querySelectorAll(".preview-page")
    ];

    if (!pages.length) {
        toast("Please generate some labels first.", "red");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        toast(
            "PDF library is not loaded. Check your internet connection.",
            "red"
        );
        return;
    }

    const { jsPDF } = window.jspdf;

    toast("Preparing PDF...", "green");

    try {

        let pdf = null;

        for (let i = 0; i < pages.length; i++) {

            const page = pages[i];

            /*
             * Temporarily move the page outside the visible area.
             * This makes html2canvas capture the complete label.
             */

            const oldPosition = page.style.position;
            const oldLeft = page.style.left;
            const oldTop = page.style.top;

            page.style.position = "fixed";
            page.style.left = "-10000px";
            page.style.top = "0";

            const canvas = await html2canvas(page, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false
            });

            page.style.position = oldPosition;
            page.style.left = oldLeft;
            page.style.top = oldTop;

            const image = canvas.toDataURL(
                "image/jpeg",
                0.95
            );

            /*
             * Keep the PDF page proportional to the preview page.
             */

            const width = canvas.width;
            const height = canvas.height;

            if (!pdf) {

                pdf = new jsPDF({
                    orientation:
                        width >= height
                            ? "landscape"
                            : "portrait",

                    unit: "px",

                    format: [
                        width / 2,
                        height / 2
                    ],

                    compress: true
                });

            } else {

                pdf.addPage(
                    [
                        width / 2,
                        height / 2
                    ],
                    width >= height
                        ? "landscape"
                        : "portrait"
                );

            }

            pdf.addImage(
                image,
                "JPEG",
                0,
                0,
                width / 2,
                height / 2,
                undefined,
                "FAST"
            );

        }

        if (!pdf) {
            toast("Nothing available to export.", "red");
            return;
        }

        pdf.save(fileName);

        toast(
            "PDF downloaded successfully.",
            "green"
        );

    } catch (error) {

        console.error(
            "PDF generation error:",
            error
        );

        toast(
            "PDF generation failed. Please try again.",
            "red"
        );

    }
}


/* =========================================================
   DOWNLOAD BUTTONS
========================================================= */

document
    .getElementById("cocoDownload")
    .addEventListener("click", function () {

        renderCoco();

        setTimeout(() => {

            downloadPreviewPDF(
                "cocoPreview",
                "BWG-Coco-Blue-Labels.pdf"
            );

        }, 100);

    });


document
    .getElementById("otherDownload")
    .addEventListener("click", function () {

        renderOther();

        setTimeout(() => {

            downloadPreviewPDF(
                "otherPreview",
                "BWG-Other-PO-Labels.pdf"
            );

        }, 100);

    });


document
    .getElementById("isbnDownload")
    .addEventListener("click", function () {

        renderISBN();

        setTimeout(() => {

            downloadPreviewPDF(
                "isbnPreview",
                "BWG-ISBN-Barcodes.pdf"
            );

        }, 100);

    });


document
    .getElementById("addressDownload")
    .addEventListener("click", function () {

        renderAddress();

        setTimeout(() => {

            downloadPreviewPDF(
                "addressPreview",
                "BWG-Address-Labels.pdf"
            );

        }, 100);

    });
