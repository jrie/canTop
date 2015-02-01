// Temporary data holder for canTopData
var canTopData = {};
canTopData.activeSelection = [];
canTopData.renderItems = [];
canTopData.renderQueue = [];
canTopData.renderQueueSize = 0;

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
            // Background design - type img/draw, draw solid/gradient_tb/gradient_lr,
            // sizeX, sizeY, colors
            design.background = ["draw", "solid", width, heigth, ["#3a0700", "#000", "#001100", "#003300", "#000"]];

            // Mouse design
            design.defaultMouse = ["#fff", "#000", "round", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15]];

            design.lineJoin = "round";

            // Icons
            design.imageMap.src = "./img/template_imagemap.png";
            design.folderIcon = [50, 50, [[0, 0], [50, 0], [100, 0], [150, 0]], ["#dedede", "#fff"]];

            // Window prototype
            design.windowTitleBar = ["x", ["#fff", "#aeaeae"], ["rect"], ["gradient_bt"], [["#4a0000", "#1a0000", "#000"]], [[0, 0, 100, 17]]];
            design.windowContent = ["both", ["#fff", "#aeaeae"], ["rect"], ["solid"], [["#2a0000"]], [[0, 18, 100, 150]]];
            break;
    }

    var cords = 0;
    var cordSize = 0;
    var minY = -1;
    var minX = -1;
    var maxX = -1;
    var maxY = -1;

    function pushBoundaries(item) {
        cordSize = item[5].length;
        for (var index = 0; index < cordSize; index++) {
            cords = item[5][index].length;

            if (minX < item[5][index][0]) {
                minX = item[5][index][0];
            }

            if (minY < item[5][index][1]) {
                minY = item[5][index][1];
            }

            for (var cord = 0; cord < cords; cord += 2) {
                if (item[5][index][cord] > minX) {
                    maxX = item[5][index][cord];
                }

                if (item[5][index][cord + 1] > minY) {
                    maxY = item[5][index][cord + 1];
                }
            }
        }

        item.push([minX, minY, maxX, maxY]);
    }

    pushBoundaries(design.windowTitleBar);
    pushBoundaries(design.windowContent);
    return design;
}

function canTop(canvasItem, designName, width, height, gridX, gridY, useCustomMouse, useDebug) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

    function drawQueueItem(queueIndex) {
        var item = canTopData.renderQueue[queueIndex];
        var drawingCount = item.drawingItems.length;
        var index = 0;
        var drawingDesign = [];

        var dimensionX = 0;
        var dimensionY = 0;

        while (index < drawingCount) {
            drawingDesign = design[item.drawingItems[index]];

            var drawingDimension = drawingDesign[0];
            var sizeX = drawingDesign[6][2];
            var sizeY = drawingDesign[6][3];

            if (drawingDimension === "both") {
                dimensionX = item.width;
                dimensionY = item.height;

                if (sizeX < item.width) {
                    dimensionX = Math.round(sizeX * (item.width / sizeX));
                }

                if (sizeY < item.height) {
                    dimensionY = Math.round(sizeY * (item.height / sizeY));
                }

            } else if (drawingDimension === "x") {
                dimensionX = sizeX;
                dimensionY = sizeY;

                if (sizeX < item.width) {
                    dimensionX = Math.round(sizeX * (item.width / sizeX));
                }
            }

            // Generarte the fill style
            var drawType = drawingDesign[3][0].split("_", 2);
            switch (drawType[0]) {
                case "solid":
                    dc.fillStyle = drawingDesign[4][0][0];
                    break;
                case "gradient":
                    dc.fillStyle = createGradient(drawType[1], item.x, item.y, dimensionX, dimensionY, drawingDesign[4][0]);
                    break
            }

            // Actual drawing
            switch (drawingDesign[2][0]) {
                case "rect":
                default:
                    dc.strokeRect(item.x + drawingDesign[5][0][0], item.y + drawingDesign[5][0][1], dimensionX, dimensionY);
                    dc.fillRect(item.x + drawingDesign[5][0][0], item.y + drawingDesign[5][0][1], dimensionX, dimensionY);
                    break;
            }

            // If we have a item containing more information, we draw those hear
            if (item.drawingItems[index] === "windowTitleBar") {
                // Add the title
                dc.fillStyle = drawingDesign[1][0];
                dc.textAlign = "left";
                dc.fillText(item.title, item.x + 5, item.y + 11);
            }

            index++;
        }


    }


    function createWindow(design) {
        var windowItem = {};
        windowItem.title = "Test Windowtitel";
        windowItem.width = 300;
        windowItem.height = 120;
        windowItem.x = 200;
        windowItem.y = 200;
        windowItem.zOrder = canTopData.renderQueueSize;
        windowItem.drawingItems = ["windowTitleBar", "windowContent"];
        windowItem.hotSpots = ["windowTitleBar", "windowContent"];
        windowItem.items = ["Item 1", "Item 2", "Item 3"];
        windowItem.style = "list";
        windowItem.type = "window";
        canTopData.renderQueue.push(windowItem);
        canTopData.renderQueueSize++;
    }

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

    mouse.realiseMovement = false;
    mouse.moveInterval = null;
    mouse.movementSpeed = 5;

    mouse.activeItem = null;

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

    function createGradient(direction, x, y, width, height, colors) {
        stepSize = (1.0 / (colors.length - 1)).toPrecision(2);
        current = 1.0;
        switch (direction) {
            case "lr":
                colors = getArrayCopy(colors).reverse();
            case "rl":
                background = dc.createLinearGradient(x, y, x + width, y);
                break;
            case "tb":
                colors = getArrayCopy(colors).reverse();
            case "bt":
            default:
                background = dc.createLinearGradient(x, y, x, y + height);
                break;
        }

        for (var index = 0; index < colors.length; index++) {
            background.addColorStop(current, colors[index]);
            current -= stepSize;
        }

        return background;
    }

    // Beginn of generic helper functions

    // Create and return a copy of an array item
    function getArrayCopy(arrayItem) {
        var arrayCopy = [];
        var items = arrayItem.length;
        for (var index = 0; index < items; index++) {
            arrayCopy.push(arrayItem[index]);
        }

        return arrayCopy;
    }

    // Calculate mouse px to grid
    function getMouseGridPoint() {
        return [Math.floor((mouse.x - mouse.offsetX) / gridX), Math.floor((mouse.y - mouse.offsetY) / gridY)];
    }

    // Calculate px to grid
    function getGridPoint(x, y) {
        return [Math.floor(x / gridX), Math.floor(y / gridY)];
    }

    // Beginn of drawing routines
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
                        dc.fillStyle = createGradient(drawType[1], 0, 0, ctBackground[2], ctBackground[3], ctBackground[4]);
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

        drawingCords = activeMouse[3];
        drawingSteps = drawingCords.length;

        dc.fillStyle = activeMouse[0];
        dc.strokeStyle = activeMouse[1];
        dc.lineJoin = activeMouse[2];

        dc.lineWidth = 2;
        dc.moveTo(mouse.x, mouse.y);
        dc.beginPath();

        for (var index = 0; index < drawingSteps; index += 2) {
            dc.lineTo(mouse.x + drawingCords[index] - mouse.offsetX, mouse.y + drawingCords[index + 1] - mouse.offsetY);
        }

        dc.lineTo(mouse.x + drawingCords[0] - mouse.offsetX, mouse.y + drawingCords[1] - mouse.offsetY);

        dc.closePath();
        dc.stroke();
        dc.fill();
    }

    // Click handler to check count of clicks
    function checkClick(evt) {
        mouse.clickCount++;
        if (mouse.clickInterval === null) {
            mouse.previousX = evt.clientX;
            mouse.previousY = evt.clientY;
            mouse.clickInterval = setInterval(recognizeDoubleClick, mouse.doubleClickSpeed);
        }
    }

    // Timed function to check for double click
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

    // The actual mouse click handler
    function doClick() {
        var mx = mouse.x - mouse.offsetX;
        var my = mouse.y - mouse.offsetY;

        var index = 0;
        var item = {};
        var hotSpot = 0;

        // Check window clicks and window item hotspots for special features
        index = canTopData.renderQueueSize;
        while (index--) {
            item = canTopData.renderQueue[index];
            if (mx >= item.x && mx <= (item.x + item.width) && my >= item.y && my <= (item.y + item.height)) {
                if (mouse.clickCount > 1) {
                    // Do something with the item here
                    lg("in two mouseclicks")
                } else {
                    lg("in one mouseclicks")
                    // DO someting else when there is only one click, like set it active
                    hotSpot = item.hotSpots.length;
                    var designItem = [];
                    var designHotSpots = [];
                    var pressedItem = false;

                    while (hotSpot--) {
                        designItem = design[item.hotSpots[hotSpot]];
                        designHotSpots = getArrayCopy(designItem[6]);

                        if (designItem[0] === "both") {
                            if (designHotSpots[2] < item.width) {
                                designHotSpots[2] = Math.round(designHotSpots[2] * (item.width / designHotSpots[2]));
                            }

                            if (designHotSpots[3] < item.height) {
                                designHotSpots[3] = Math.round(designHotSpots[3] * (item.height / designHotSpots[3]));
                            }
                        } else if (designItem[0] === "x") {
                            designHotSpots[2] = Math.round(designHotSpots[2] * (item.width / designHotSpots[2]));
                        }

                        designHotSpots[0] += item.x;
                        designHotSpots[1] += item.y;
                        designHotSpots[2] += item.x;
                        designHotSpots[3] += item.y;

                        if (mx >= designHotSpots[0] && mx <= designHotSpots[2] && my >= designHotSpots[1] && my <= designHotSpots[3]) {
                            lg("Pressed item: " + item.hotSpots[hotSpot]);
                            pressedItem = item.hotSpots[hotSpot];
                            break;
                        }
                    }

                    if (pressedItem) {
                        if (mouse.clickCount === 0) {
                            if (pressedItem === "windowTitleBar") {
                                if (mouse.moveInterval === null) {
                                    mouse.previousX = mouse.x;
                                    mouse.previousY = mouse.y;
                                    mouse.moveInterval = setInterval(realiseMouseMovement, mouse.movementSpeed);
                                    mouse.activeItem = item;
                                }
                            }
                        }
                    }
                }

                break;
            }
        }

        // Dont check folders if we have no mouse clicks counted
        if (mouse.realiseMovement) {
            return;
        }

        // Check folder clicks
        index = canTopData.renderItems.length;
        while (index--) {
            item = canTopData.renderItems[index];
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

    // Mouse movement
    function checkMovement(evt) {
        evt.preventDefault();
        mouse.realiseMovement = !mouse.realiseMovement;
        if (evt.type === "mousedown") {
            doClick();
        }
    }

    function realiseMouseMovement() {
        if (!mouse.realiseMovement) {
            clearInterval(mouse.moveInterval);
            mouse.moveInterval = null;
            mouse.activeItem = null;
            return;
        }

        if (mouse.activeItem !== null) {
            mouse.activeItem.x -= mouse.previousX - mouse.x;
            mouse.activeItem.y -= mouse.previousY - mouse.y;
            mouse.previousX = mouse.x;
            mouse.previousY = mouse.y;
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
        createWindow(design);

        // Main loop
        function mainloop() {
            drawBackground();

            drawRenderItems();

            drawQueueItem(0);

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
        canvas.addEventListener("mousedown", checkMovement);
        canvas.addEventListener("mouseup", checkMovement);
        mainloop();
    }

    // Image loader check to see if a image has been completely loaded
    function checkLoaded() {
        if (design.imageMap.src === "" || (design.imageMap.width !== 0 && design.imageMap.height !== 0 && design.imageMap.complete === true)) {
            clearInterval(loaderCheckInterval);
            initialized();
        }
    }

    var loaderCheckInterval = setInterval(checkLoaded, 120);
}
