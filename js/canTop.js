// Temporary data holder for canTopData
var canTopData = {};
canTopData.activeSelection = [];
canTopData.renderItems = [];
canTopData.renderQueue = [];
canTopData.renderQueueSize = 0;
canTopData.activeWindow = false;

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

    // Variables for helper functions
    var cords = 0;
    var cordSize = 0;
    var minY = -1;
    var minX = -1;
    var maxX = -1;
    var maxY = -1;

    function pushBoundaries(item) {
        cordSize = item[6].length;
        for (var index = 0; index < cordSize; index++) {
            if (item[3][index] === "line") {
                if (minX < item[6][index][0]) {
                    minX = item[6][index][0];
                }

                if (minY < item[6][index][1]) {
                    minY = item[6][index][1];
                }

                cords = item[6][index].length;
                for (var cord = 0; cord < cords; cord += 2) {
                    if (item[6][index][cord] > minX) {
                        maxX = item[6][index][cord];
                    }

                    if (item[6][index][cord + 1] > minY) {
                        maxY = item[6][index][cord + 1];
                    }
                }
            } else if (item[3][index] === "rect") {
                minX = 0;
                minY = 0;
                maxX = item[6][index][2];
                maxY = item[6][index][3];
            }
        }

        item.push([minX, minY, maxX, maxY]);
    }

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
            design.windowTitleBar = ["static", "x", ["#fff", "#aeaeae"], ["rect"], ["gradient_bt"], [["#4a0000", "#1a0000", "#000"]], [[0, 0, 100, 17]]];
            design.windowContent = ["static", "both", ["#fff", "#aeaeae"], ["rect"], ["solid"], [["#2a0000"]], [[0, 17, 100, 150]]];
            design.windowStatusBar = ["static", "x", ["#fff", "#aeaeae"], ["rect"], ["solid"], [["#4a0000"]], [[0, 167, 100, 17]]];
            design.windowResize = ["dynamic", "both", [-12, -12], ["line", "line"], ["solid", "solid"], [["#aeaeae"], ["#dedede"]], [[10, 0, 10, 10, 0, 10, 10, 0], [8, 2, 8, 8, 2, 8, 8, 2]]];
            break;
    }

    pushBoundaries(design.windowTitleBar);
    pushBoundaries(design.windowContent);
    pushBoundaries(design.windowStatusBar);
    return design;
}

function canTop(canvasItem, designName, width, height, gridX, gridY, useCustomMouse, useDebug) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

    function drawQueueItem(queueIndex) {
        var item = canTopData.renderQueue[queueIndex];
        var drawingCount = item.drawingItems.length;
        var index = 0;
        var drawingDesign = [];
        var drawingCoords = [];
        var posX = 0;
        var posY = 0;
        var sizeY = 0;
        var dynamicCoords = [0, 0];

        while (index < drawingCount) {
            drawingDesign = design[item.drawingItems[index]];
            drawingCoords = item.drawData[index][1];

            sizeY = item.drawData[index][2][3];

            for (var drawingIndex = 0; drawingIndex < drawingCoords.length; drawingIndex++) {
                // Generarte the fill style
                var drawType = drawingDesign[4][drawingIndex].split("_", 2);
                switch (drawType[0]) {
                    case "solid":
                        dc.fillStyle = drawingDesign[5][drawingIndex][0];
                        break;
                    case "gradient":

                        dc.fillStyle = createGradient(drawType[1], item.x, item.y, item.width, sizeY, drawingDesign[5][drawingIndex]);
                        break
                }

                dynamicCoords = getDynamicOffset(drawingDesign, item);
                posX = dynamicCoords[0];
                posY = dynamicCoords[1];

                // Actual drawing
                switch (drawingDesign[3][drawingIndex]) {
                    case "line":
                        var linePoints = drawingCoords[drawingIndex];

                        var drawingSteps = linePoints.length;

                        dc.beginPath();

                        if (drawingDesign[0] === "static") {
                            for (var cord = 0; cord < drawingSteps; cord += 2) {
                                dc.lineTo(item.x + linePoints[cord], item.y + linePoints[cord + 1]);
                            }
                            dc.lineTo(item.x + linePoints[cord][0], item.y + linePoints[cord][1]);

                        } else {
                            for (var cord = 0; cord < drawingSteps; cord += 2) {
                                dc.lineTo(item.x + posX + linePoints[cord], item.y + linePoints[cord + 1] + posY);
                            }
                        }

                        dc.closePath();
                        dc.fill();

                        break;

                    case "rect":
                    default:
                        if (drawingDesign[0] === "static") {
                            dc.strokeRect(item.x + drawingCoords[drawingIndex][0], item.y + drawingCoords[drawingIndex][1], item.width, sizeY);
                            dc.fillRect(item.x + drawingCoords[drawingIndex][0], item.y + drawingCoords[drawingIndex][1], item.width, sizeY);
                        } else {
                            dc.strokeRect(item.x + posX + drawingCoords[drawingIndex][0], item.y + posY + drawingCoords[drawingIndex][1], drawingCoords[drawingIndex][2], drawingCoords[drawingIndex][3]);
                            dc.fillRect(item.x + posX + drawingCoords[drawingIndex][0], item.y + posY + drawingCoords[drawingIndex][1], drawingCoords[drawingIndex][2], drawingCoords[drawingIndex][3]);
                        }
                        break;
                }
            }


            // If we have a item containing more information, we draw those hear
            // Add the title to a window
            if (item.drawingItems[index] === "windowTitleBar") {
                if (canTopData.activeWindow === item.title) {
                    dc.fillStyle = drawingDesign[2][0];
                } else {
                    dc.fillStyle = drawingDesign[2][1];
                }
                dc.textAlign = "left";
                dc.fillText(item.title, item.x + 5, item.y + item.hotSpotOffsetY[index] - 6);
            }

            // Add the count of items in this window
            if (item.drawingItems[index] === "windowStatusBar") {
                dc.fillStyle = drawingDesign[2][1];
                dc.textAlign = "left";
                dc.fillText(item.items.length + " item(s)", item.x + 5, item.y + item.height - 5);
            }

            index++;
        }


    }


    function createWindow(design, title, x, y) {
        var windowItem = {};
        windowItem.title = title;
        windowItem.x = x;
        windowItem.y = y;
        windowItem.zOrder = canTopData.renderQueueSize;
        windowItem.drawingItems = ["windowTitleBar", "windowContent", "windowStatusBar", "windowResize"];
        windowItem.hotSpots = ["windowTitleBar", "windowContent", "windowStatusBar", "windowResize"];
        windowItem.items = ["Item 1", "Item 2", "Item 3"];
        windowItem.style = "list";
        windowItem.type = "window";
        windowItem.hotSpotOffsetY = [];
        windowItem.drawData = [];

        var offsetY = 0;
        var dimensions = [];
        var drawingCoords = [];
        for (var index = 0; index < windowItem.drawingItems.length; index++) {
            drawingCoords = getArrayCopy(design[windowItem.drawingItems[index]][6]);
            if (design[windowItem.drawingItems[index]][0] === "static") {
                dimensions = getArrayCopy(design[windowItem.drawingItems[index]][7]);
                offsetY += dimensions[3];
                windowItem.hotSpotOffsetY.push(offsetY);
            } else {
                dimensions = [0, 0, 0, 0];
            }
            windowItem.drawData.push([windowItem.drawingItems[index], drawingCoords, dimensions]);
        }

        windowItem.height = offsetY;
        windowItem.width = 300;

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
            if (typeof (arrayItem[index]) === "object") {
                var subArray = [];
                for (var subIndex = 0; subIndex < arrayItem[index].length; subIndex++) {
                    subArray.push(arrayItem[index][subIndex]);
                }
                arrayCopy.push(subArray);
            } else {
                arrayCopy.push(arrayItem[index]);
            }
        }

        return arrayCopy;
    }


    // Get positioning if it applies
    function getDynamicOffset(drawingDesign, item) {
        var posX = 0;
        var posY = 0;
        if (drawingDesign[0] === "dynamic") {
            if (drawingDesign[1] === "x") {
                if (drawingDesign[2][0] < 0) {
                    posX = item.width + drawingDesign[2][0];
                } else {
                    posX = drawingDesign[2][0];
                }

                posY = drawingDesign[2][1];
            } else if (drawingDesign[1] === "y") {
                posX = (drawingDesign[2][0]);

                if (drawingDesign[2][1] < 0) {
                    posY = item.height + drawingDesign[2][1];
                } else {
                    posY = drawingDesign[2][1];
                }

            } else if (drawingDesign[1] === "both") {
                if (drawingDesign[2][0] < 0) {
                    posX = item.width + drawingDesign[2][0];
                } else {
                    posX = drawingDesign[2][0];
                }

                if (drawingDesign[2][1] < 0) {
                    posY = item.height + drawingDesign[2][1];
                } else {
                    posY = drawingDesign[2][1];
                }
            } else {
                posX = 0;
                posY = 0;
            }
        }

        return [posX, posY];
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

        var item = {};
        var hotSpot = 0;
        var activeItem = {};
        var zOrderIndex = -1;

        var index = 0;

        var designItem = [];
        var pressedItem = false;

        // Reset the active selection on click and select later
        canTopData.activeWindow = false;

        // Check window clicks
        index = canTopData.renderQueueSize;
        while (index--) {
            item = canTopData.renderQueue[index];
            if (mx >= item.x && mx <= (item.x + item.width) && my >= item.y && my <= (item.y + item.height)) {
                if (zOrderIndex < item.zOrder) {
                    activeItem = item;
                    zOrderIndex = item.zOrder;
                    canTopData.activeWindow = item.title;
                }
            }
        }

        // Move the window on top of the stack and mark it active
        // degerade order index on stack by 1
        if (zOrderIndex !== -1) {
            canTopData.renderQueue[zOrderIndex].zOrder = canTopData.renderQueueSize - 1;
            canTopData.renderQueue.push(canTopData.renderQueue[zOrderIndex]);
            canTopData.renderQueue.splice(zOrderIndex, 1);
            index = canTopData.renderQueueSize - 1;
            while (index--) {
                canTopData.renderQueue[index].zOrder = index;
            }

            // Check the hotspots of the active window
            hotSpot = activeItem.hotSpots.length;
            index = 0;

            var drawingDesign = [];
            var drawingCoords = [];
            var posX = 0;
            var posY = 0;
            var dynamicCoords = [0, 0];

            while (hotSpot--) {
                var drawDataSize = activeItem.drawData.length;
                drawingDesign = design[activeItem.hotSpots[hotSpot]];

                for (index = 0; index < drawDataSize; index++) {
                    if (activeItem.hotSpots[hotSpot] === activeItem.drawData[index][0]) {
                        break;
                    }
                }

                drawingCoords = activeItem.drawData[index][1];
                dc.beginPath();
                for (var drawingIndex = 0; drawingIndex < drawingDesign[3].length; drawingIndex++) {

                    dynamicCoords = getDynamicOffset(drawingDesign, activeItem);
                    posX = dynamicCoords[0];
                    posY = dynamicCoords[1];

                    // Phantom drawing
                    switch (drawingDesign[3][0]) {
                        case "line":
                            var linePoints = drawingCoords[drawingIndex];
                            var drawingSteps = linePoints.length;

                            if (drawingDesign[0] === "static") {

                                for (var cord = 0; cord < drawingSteps; cord += 2) {
                                    dc.lineTo(activeItem.x + linePoints[cord], activeItem.y + linePoints[cord + 1]);
                                }

                                dc.lineTo(activeItem.x + linePoints[cord][0], activeItem.y + linePoints[cord][1]);

                            } else {
                                dc.moveTo(activeItem.x + posX + linePoints[0], activeItem.x + posY + linePoints[1]);
                                for (var cord = 0; cord < drawingSteps; cord += 2) {
                                    dc.lineTo(activeItem.x + posX + linePoints[cord], activeItem.y + posY + linePoints[cord + 1]);

                                }
                            }
                            break;

                        case "rect":
                        default:
                            if (drawingDesign[0] === "static") {
                                dc.rect(activeItem.x + drawingCoords[drawingIndex][0], activeItem.y + drawingCoords[drawingIndex][1], activeItem.width, activeItem.drawData[index][2][3]);
                            } else {
                                dc.rect(activeItem.x + posX + drawingCoords[drawingIndex][0], activeItem.y + posY + drawingCoords[drawingIndex][1], drawingCoords[drawingIndex][2], drawingCoords[drawingIndex][3]);
                            }
                            break;
                    }

                }

                dc.closePath();

                //if (mx >= (designHotSpots[0] + activeItem.x) && mx <= (activeItem.width + activeItem.x) && my >= (designHotSpots[1] + activeItem.y) && my <= (activeItem.hotSpotOffsetY[hotSpot] + activeItem.y)) {
                if (dc.isPointInPath(mx, my)) {
                    pressedItem = activeItem.hotSpots[hotSpot];
                    break;
                }
            }
        }

        // Do something with the pressed Item
        if (pressedItem) {

            if (mouse.clickCount > 1) {
                // Double click counted
                lg("in two mouseclicks");
                lg("Pressed item: " + activeItem.title + " / " + pressedItem);

                mouse.clickCount = 0;
                return;
            } else {
                if (mouse.clickCount === 1) {
                    // Single mouse click
                    lg("in one mouseclick");
                    lg("Pressed item: " + activeItem.title + " / " + pressedItem);
                }

                if (mouse.realiseMovement) {
                    if (pressedItem === "windowTitleBar") {
                        if (mouse.moveInterval === null) {
                            mouse.previousX = mouse.x;
                            mouse.previousY = mouse.y;
                            mouse.moveInterval = setInterval(realiseMouseMovement, mouse.movementSpeed);
                            mouse.activeItem = activeItem;
                        }
                        return;
                    }

                    if (pressedItem === "windowResize") {
                        if (mouse.moveInterval === null) {
                            mouse.previousX = mouse.x;
                            mouse.previousY = mouse.y;
                            mouse.moveInterval = setInterval(realiseMouseResize, mouse.movementSpeed);
                            mouse.activeItem = activeItem;
                        }
                        return;
                    }
                }

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
    function activateMovement(evt) {
        evt.preventDefault();
        mouse.realiseMovement = true;
        if (evt.type === "mousedown") {
            doClick();
        }
    }

    function deactivateMovement(evt) {
        evt.preventDefault();
        mouse.realiseMovement = false;
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

    function realiseMouseResize() {
        if (!mouse.realiseMovement) {
            clearInterval(mouse.moveInterval);
            mouse.moveInterval = null;
            mouse.activeItem = null;
            return;
        }

        if (mouse.activeItem !== null) {
            var moveX = mouse.previousX - mouse.x;
            var moveY = mouse.previousY - mouse.y;
            var width = mouse.activeItem.width - moveX;
            var height = mouse.activeItem.height - moveY;

            if (width < 250) {
                width = mouse.activeItem.width;
            }

            if (height < 150) {
                height = mouse.activeItem.height;
            }

            mouse.previousX = mouse.x;
            mouse.previousY = mouse.y;

            mouse.activeItem.width = width;
            mouse.activeItem.height = height;



            var drawData = [];
            var drawItems = mouse.activeItem.drawData.length;
            var drawDesign = [];
            var drawIndexes = 0;
            var hotSpotOffsetY = [];
            var usedPixels = 0;
            var index = 0;

            for (index = 0; index < drawItems; index++) {
                drawData = mouse.activeItem.drawData[index];
                hotSpotOffsetY = mouse.activeItem.hotSpotOffsetY;

                drawDesign = design[drawData[0]];
                drawIndexes = drawDesign[3].length;

                usedPixels = height;
                for (var subIndex = 0; subIndex < hotSpotOffsetY.length; subIndex++) {
                    if (index !== subIndex) {
                        usedPixels -= hotSpotOffsetY[subIndex];
                    } else {
                        break;
                    }
                }

                if (drawDesign[0] === "static") {
                    if (drawDesign[1] === "both") {
                        while (drawIndexes--) {
                            if (drawDesign[3][drawIndexes] === "rect") {
                                drawData[1][0][3] = usedPixels;
                                drawData[2][3] = usedPixels;
                                hotSpotOffsetY[index] = usedPixels;
                            }
                        }
                    } else if (drawDesign[1] === "x") {
                        if (index + 1 === mouse.activeItem.drawData.length - 1) {
                            usedPixels += drawData[1][0][3];
                        }
                        drawData[1][0][1] = height - usedPixels;
                        drawData[2][1] = usedPixels;
                    }
                }

            }
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
        createWindow(design, "Window Testtitle - Window 1", 100, 100);
        createWindow(design, "Window Testtitle - Window 2", 420, 100);
        createWindow(design, "Window Testtitle - Window 3", 100, 240);

        // Main loop
        function mainloop() {
            drawBackground();

            drawRenderItems();

            drawQueueItem(0);
            drawQueueItem(1);
            drawQueueItem(2);

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
        canvas.addEventListener("mousedown", activateMovement);
        canvas.addEventListener("mouseup", deactivateMovement);

        // Get the right offset values after window resizing
        window.addEventListener("resize", function () {
            mouse.offsetX = canvas.offsetLeft;
            mouse.offsetY = canvas.offsetTop;
        });

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
