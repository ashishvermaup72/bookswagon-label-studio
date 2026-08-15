// ==========================================================
// BOOKSWAGON LABEL STUDIO
// THREE TOOL WORKSPACE
//
// 1. CocoBlue PO
// 2. Other PO
// 3. ISBN Barcode Generator
// ==========================================================


// ==========================================================
// GLOBAL STATE
// ==========================================================

let activeTool = null;


// ==========================================================
// TOOL BUTTONS
// ==========================================================

const toolButtons =
    document.querySelectorAll(
        ".tool-button"
    );


// ==========================================================
// TOOL BUTTON EVENTS
// ==========================================================

toolButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const tool =
                    button.dataset.tool;

                openTool(tool);

            }
        );

    }
);


// ==========================================================
// OPEN TOOL
// ==========================================================

function openTool(tool) {

    activeTool =
        tool;


    switch (tool) {

        case "cocoblue":

            showMessage(
                "CocoBlue PO",
                "CocoBlue PO workspace will open here."
            );

            break;


        case "other-po":

            showMessage(
                "Other PO",
                "Other PO workspace will open here."
            );

            break;


        case "isbn":

            showMessage(
                "ISBN Barcode Generator",
                "ISBN Barcode Generator workspace will open here."
            );

            break;


        default:

            showMessage(
                "BooksWagon Label Studio",
                "Please select a valid tool."
            );

    }

}


// ==========================================================
// TEMPORARY TOOL MESSAGE
// ==========================================================
//
// This is intentionally temporary.
// We will replace these messages with
// the actual tool interfaces.
// ==========================================================

function showMessage(
    title,
    message
) {

    alert(
        `${title}\n\n${message}`
    );

}


// ==========================================================
// HEADER CONTACT
// ==========================================================

const contactLinks =
    document.querySelectorAll(
        'a[href^="mailto:"]'
    );


contactLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            () => {

                console.log(
                    "Contact:",
                    "ashish.varma@bookswagon.in"
                );

            }
        );

    }
);


// ==========================================================
// SMOOTH SCROLL
// ==========================================================

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );


// ==========================================================
// INITIAL STATE
// ==========================================================

console.log(
    "BooksWagon Label Studio loaded."
);

console.log(
    "Available tools:",
    [
        "CocoBlue PO",
        "Other PO",
        "ISBN Barcode Generator"
    ]
);
