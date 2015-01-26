// Temporary data holder for canTopData
var canTopData = {};
canTopData.activeSelection = [];
canTopData.renderItems = [];

// This functions later will be moved into the main function and are not global
var canvas = document.getElementById("canTopCanvas");
var dc = canvas.getContext("2d");
var design = {};

var hasConsole = window.console ? true : false;
function lg(msg) {
    if (hasConsole) {
        window.console.log(msg);
    }
}

// Start of main functions

function getDesign(designName, width, heigth, gridX, gridY) {

    //var design = {};
    design.imageMap = new Image();

    switch (designName) {
        case "template":
        default:
            // Background design - type img/draw, draw solid/gradient_direction,
            // sizeX, sizeY, colors
            design.background = ["draw", "solid", width, heigth, ["#3a0700", "#000", "#001100", "#003300", "#000"]];

            // Mouse design
            design.defaultMouse = ["draw", "#fff", "#000", "round", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15, 0, 0]];

            design.lineJoin = "round";

            // Icons
            design.imageMap.src = "./img/template_imagemap.png";
            design.folderIcon = [50, 50, [[0, 0], [50, 0], [100, 0], [150, 0]], ["#dedede", "#fff"]];
            break;
    }

    return design;
}

function canTop(canvasItem, designName, width, height, gridX, gridY, useCustomMouse, useDebug) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

    //var canvas = document.getElementById(canvasItem);
    //var dc = canvas.getContext("2d");
    var design = getDesign(designName, width, height, gridX, gridY);
    canvas.width = width;
    canvas.height = height;

    // Get the default design values for quicker access
    var ctBackground = design.background;
    var ctDefaultMouse = design.defaultMouse;
    var ctFolderIcon = design.folderIcon;

    // Other values we work with
    var mouse = {};
    mouse.x = 0;
    mouse.y = 0;
    mouse.previousX = 0;
    mouse.previousY = 0;
    mouse.threshold = 20;
    mouse.offsetX = canvas.offsetLeft;
    mouse.offsetY = canvas.offsetTop;
    mouse.current = "default";
    mouse.clickCount = 0;
    mouse.clickInterval = null;
    mouse.doubleClickSpeed = 320;

    // Variables for grid drawing
    var gridPoint = [];
    var gridStart = [0, 0];
    var gridEnd = [canvas.width, canvas.height];

    // Settings

    // Generally used for drawing procedures
    var stepX = 0;
    var stepY = 0;
    var drawingCords = [];
    var drawingSteps = 0;

    // Helper function to generate gradients
    var background;
    var stepSize = 0.0;
    var current = 1.0;

    function createGradient(direction, width, height, colors) {
        stepSize = (1.0 / (colors.length - 1)).toPrecision(2);
        current = 1.0;
        switch (direction) {
            case "rl":
                colors.reverse();
            case "lr":
                background = dc.createLinearGradient(width, 0, 0, 0, 0);
                break;
            case "bt":
                colors.reverse();
            case "tb":
            default:
                background = dc.createLinearGradient(0, height, 0, 0);
                break;
        }

        for (var index = 0; index < colors.length; index++) {
            background.addColorStop(current, colors[index]);
            current -= stepSize;
        }

        return background;
    }

    // Calculate mouse px to grid
    function getMouseGridPoint() {
        return [Math.floor((mouse.x - mouse.offsetX) / gridX), Math.floor((mouse.y - mouse.offsetY) / gridY)];
    }

    // Calculate px to grid
    function getGridPoint(x, y) {
        return [Math.floor(x / gridX), Math.floor(y / gridY)];
    }

    // Drawing routines
    function drawBackground() {
        switch (ctBackground[0]) {
            case "draw":
            default:
                var drawType = ctBackground[1].split("_", 2);
                dc.rect(0, 0, width, height);
                switch (drawType[0]) {
                    case "solid":
                    default:
                        dc.fillStyle = ctBackground[4][0];
                        break;
                    case "gradient":
                        dc.fillStyle = createGradient(drawType[1], ctBackground[2], ctBackground[3], ctBackground[4]);
                        break;
                }

                dc.fill();
        }
    }

    function drawGrid() {
        stepX = 0;
        stepY = gridY;

        dc.lineWidth = 0.6;
        dc.strokeStyle = "rgba(255, 255, 255, 0.1)";

        dc.beginPath();

        while (stepY <= gridEnd[1]) {
            dc.moveTo(gridStart[0], stepY);
            dc.lineTo(gridEnd[0], stepY);
            stepY += gridY;
        }

        while (stepX <= gridEnd[0]) {
            dc.moveTo(stepX, gridStart[1]);
            dc.lineTo(stepX, gridEnd[1]);
            stepX += gridX;
        }

        dc.stroke();
        dc.closePath();
    }

    function drawActiveCell() {
        gridPoint = getMouseGridPoint();
        dc.fillStyle = "rgba(200, 200, 0, 0.4)";
        dc.fillRect(gridPoint[0] * gridX, gridPoint[1] * gridY, gridX, gridY);
    }

    function drawMouse() {
        var activeMouse = [];
        switch (mouse.current) {
            case "default":
            default:
                activeMouse = ctDefaultMouse;
                break;
        }

        if (ctDefaultMouse[0] === "draw") {
            drawingCords = activeMouse[4];
            drawingSteps = drawingCords.length;

            dc.fillStyle = activeMouse[1];
            dc.strokeStyle = activeMouse[2];
            dc.lineJoin = activeMouse[3];

            dc.lineWidth = 2;
            dc.moveTo(mouse.x, mouse.y);
            dc.beginPath();

            for (var index = 0; index < drawingSteps; index += 2) {
                dc.lineTo(mouse.x + drawingCords[index] - mouse.offsetX, mouse.y + drawingCords[index + 1] - mouse.offsetY);
            }

            dc.closePath();
            dc.stroke();
            dc.fill();
        }
    }

    // The actual mouse click handler
    function doClick() {
        var mx = mouse.x - mouse.offsetX;
        var my = mouse.y - mouse.offsetY;

        var folderItem = {};
        var index = canTopData.renderItems.length;

        while (index--) {
            var item = canTopData.renderItems[index];
            if (mx >= item.x && mx <= (item.x + item.width) && my >= item.y && my <= (item.y + item.height)) {
                if (mouse.clickCount > 1) {
                    if (item.type === 0) {
                        item.open = !item.open;
                    }
                } else {
                    if (item.type === 0) {
                        item.selected = !item.selected;
                    }
                }

                break;
            }
        }

        mouse.clickCount = 0;
    }

    function recognizeDoubleClick() {
        clearInterval(mouse.clickInterval);
        mouse.clickInterval = null;

        // Check if the mouse made a large movement above our trigger threshold
        // which renders the click(s) invalid
        if (mouse.threshold < Math.abs(mouse.x - mouse.previousX) || mouse.threshold < Math.abs(mouse.y - mouse.previousY)) {
            mouse.clickCount = 0;
            return;
        }

        doClick();
    }

    function checkClick(evt) {
        mouse.clickCount++;
        if (mouse.clickInterval === null) {
            mouse.previousX = evt.clientX;
            mouse.previousY = evt.clientY;
            mouse.clickInterval = setInterval(recognizeDoubleClick, mouse.doubleClickSpeed);
        }
    }

    // Render item creation functions
    function createFolderItem(title, x, y) {
        var item = {};
        item.type = 0;
        item.title = title;
        item.open = false;
        item.selected = false;
        item.x = x;
        item.y = y;
        item.width = 50;
        item.height = 60;
        canTopData.renderItems.push(item);
    }

    // Drawing of render items based on item status
    function drawRenderItems() {
        var item = {};

        for (var index = 0; index < canTopData.renderItems.length; index++) {
            item = canTopData.renderItems[index];

            if (item.type === 0) {
                if (!item.open) {
                    if (item.selected) {
                        dc.drawImage(design.imageMap, ctFolderIcon[2][2][0], ctFolderIcon[2][2][1], ctFolderIcon[0], ctFolderIcon[1], item.x, item.y, item.width, ctFolderIcon[1]);
                    } else {
                        dc.drawImage(design.imageMap, ctFolderIcon[2][0][0], ctFolderIcon[2][0][1], ctFolderIcon[0], ctFolderIcon[1], item.x, item.y, item.width, ctFolderIcon[1]);
                    }
                    dc.fillStyle = ctFolderIcon[3][0];
                } else {
                    if (item.selected) {
                        dc.drawImage(design.imageMap, ctFolderIcon[2][3][0], ctFolderIcon[2][3][1], ctFolderIcon[0], ctFolderIcon[1], item.x, item.y, item.width, ctFolderIcon[1]);
                    } else {
                        dc.drawImage(design.imageMap, ctFolderIcon[2][1][0], ctFolderIcon[2][1][1], ctFolderIcon[0], ctFolderIcon[1], item.x, item.y, item.width, ctFolderIcon[1]);
                    }
                    dc.fillStyle = ctFolderIcon[3][1];
                }

                dc.textAlign = "center";
                dc.fillText(item.title, item.x + (item.width / 2), ctFolderIcon[1] + item.y + 5);
            }
        }
    }


    // Main function executes after desktop imagemap has been loaded
    function initialized() {
        createFolderItem("Documents", 20, 10);
        createFolderItem("Briefcase", 20, 80);

        // Main loop
        function mainloop() {
            drawBackground();

            drawRenderItems();

            if (useDebug) {
                drawGrid();
                drawActiveCell();
            }

            if (useCustomMouse) {
                drawMouse();
            }

            window.requestAnimationFrame(mainloop);
        }


        // Bind the mouse to the current window
        canvas.addEventListener("mousemove", function (evt) {
            mouse.x = evt.clientX;
            mouse.y = evt.clientY;
        });

        canvas.addEventListener("click", checkClick);
        mainloop();
    }

    function checkLoaded() {
        if (design.imageMap.src === "" || (design.imageMap.width !== 0 || design.imageMap.height !== 0 || design.imageMap.complete === true)) {
            clearInterval(loaderCheckInterval);
            initialized();
        }
    }

    var loaderCheckInterval = setInterval(checkLoaded, 120);
}
