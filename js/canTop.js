// Temporary data holder for canTopData
var canTopData = {};
canTopData.activeSelection = [];
canTopData.renderItems = [];
canTopData.renderQueue = [];
canTopData.renderQueueSize = 0;
canTopData.activeWindow = false;
canTopData.mouseTraps = [];
canTopData.lastId = 0;

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

    function pushBoundaries(item, styleOffset, coordOffset) {
        cordSize = item[coordOffset].length;
        for (var index = 0; index < cordSize; index++) {
            if (item[styleOffset][index] === "line") {
                if (minX < item[coordOffset][index][0]) {
                    minX = item[coordOffset][index][0];
                }

                if (minY < item[coordOffset][index][1]) {
                    minY = item[coordOffset][index][1];
                }

                cords = item[coordOffset][index].length;
                for (var cord = 0; cord < cords; cord += 2) {
                    if (item[coordOffset][index][cord] > minX) {
                        maxX = item[coordOffset][index][cord];
                    }

                    if (item[coordOffset][index][cord + 1] > minY) {
                        maxY = item[coordOffset][index][cord + 1];
                    }
                }
            } else if (item[styleOffset][index] === "rect") {
                minX = 0;
                minY = 0;
                maxX = item[coordOffset][index][2];
                maxY = item[coordOffset][index][3];
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
            design.defaultMouse = ["#fff", "#000", "round", "line", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15]];
            design.textMouse = ["#888", "#fff", "round", "stroke", [-3, -5, 3, -5, 0, -5, 0, 5, -3, 5, 3, 5, 0, 5, 0, -5]];

            design.lineJoin = "round";

            // Icons
            design.imageMap.src = "./img/template_imagemap.png";
            design.folderIcon = [50, 50, [[0, 0], [50, 0], [100, 0], [150, 0]], ["#dedede", "#fff"]];

            // Window prototype
            design.windowTitleBar = ["static", "x", ["#fff", "#aeaeae"], ["rect"], ["gradient_bt"], [["#4a0000", "#1a0000", "#000"]], [[0, 0, 100, 17]]];
            design.windowContent = ["static", "both", ["#fff", "#aeaeae"], ["rect"], ["solid"], [["#2a0000"]], [[0, 17, 100, 150]]];
            design.windowStatusBar = ["static", "x", ["#fff", "#aeaeae"], ["rect"], ["solid"], [["#4a0000"]], [[0, 167, 100, 17]]];

            // Window controls
            design.windowResize = ["dynamic", "both", [-12, -12], ["line", "line"], ["solid", "solid"], [["#222"], ["#fff"]], [[10, 0, 10, 10, 0, 10, 10, 0], [8, 2, 8, 8, 2, 8, 8, 2]]];
            design.windowMaximize = ["dynamic", "both", [-36, 3], ["rect", "rect", "rect"], ["solid", "solid", "solid"], [["#dedede"], ["#aeaeae"], ["#333"]], [[0, 0, 10, 10], [2, 2, 6, 6], [2, 3, 6, 5]]];
            design.windowMinimize = ["dynamic", "both", [-24, 3], ["rect", "rect", "rect"], ["solid", "solid", "solid"], [["#dedede"], ["#aeaeae"], ["#333"]], [[0, 0, 10, 10], [2, 2, 6, 6], [2, 6, 6, 2]]];
            design.windowClose = ["dynamic", "both", [-12, 3], ["rect", "rect", "line", "line"], ["solid", "solid", "stroke", "stroke"], [["#dedede"], ["#aeaeae"], ["#333"], ["#333"]], [[0, 0, 10, 10], [2, 2, 6, 6], [2, 2, 8, 8], [2, 8, 8, 2]]];

            // Window contents
            design.contentScrollbar = [["rect"], ["solid"], [["#555"]], [[0, 0, 12, 100]], -12, 0];
            design.contentScrollbarPlugY = [["rect"], ["solid"], [["#ddd"]], [[0, 0, 6, 15]], 3, 3];

            // Interactive elements
            design.textCursor = ["#888", 2];
            design.contentInputField = [["rect"], ["solid"], [["#999"]], [[0, 0, 100, 20]], 0, 0];
            design.contentInputFieldText = ["#000", "transparent"], ["#009900", "#00003a"];
            break;
    }

    // Get the boundaries for the design items listed below and push it at end of the design
    pushBoundaries(design.windowTitleBar, 3, 6);
    pushBoundaries(design.windowContent, 3, 6);
    pushBoundaries(design.windowStatusBar, 3, 6);

    pushBoundaries(design.contentScrollbar, 0, 3);
    pushBoundaries(design.contentScrollbarPlugY, 0, 3);
    pushBoundaries(design.contentInputField, 0, 3);

    return design;
}

function canTop(canvasItem, designName, width, height, gridX, gridY, useCustomMouse, snapToEdges, useDebug) {

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
                        break;
                    case "stroke":
                        dc.strokeStyle = drawingDesign[5][drawingIndex][0];
                        break;
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
                            if (linePoints.length > 4) {
                                for (var cord = 0; cord < drawingSteps; cord += 2) {
                                    dc.lineTo(item.x + posX + linePoints[cord], item.y + posY + linePoints[cord + 1]);
                                }
                            } else {
                                dc.lineWidth = 1;
                                dc.lineTo(item.x + posX + linePoints[0], item.y + posY + linePoints[1]);
                                dc.lineTo(item.x + posX + linePoints[2], item.y + posY + linePoints[3]);
                                dc.stroke();
                                dc.strokeStyle = "#000";
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
                if (canTopData.activeWindow === item.id) {
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


    function createWindow(design, type, title, x, y) {
        var windowItem = {};
        windowItem.title = title;
        windowItem.x = x;
        windowItem.y = y;
        windowItem.zOrder = canTopData.renderQueueSize;
        windowItem.drawingItems = ["windowTitleBar", "windowContent", "windowStatusBar", "windowResize", "windowClose", "windowMaximize", "windowMinimize"];
        windowItem.hotSpots = ["windowTitleBar", "windowContent", "windowStatusBar", "windowResize", "windowClose", "windowMaximize", "windowMinimize"];
        if (type === "data") {
            windowItem.items = generateDummyData(parseInt(Math.random() * 50) + 25);
        } else {
            windowItem.items = [];
        }
        windowItem.style = "list";
        windowItem.type = "window";
        windowItem.hotSpotOffsetY = [];
        windowItem.drawData = [];
        windowItem.isMinimized = false;
        windowItem.isMaximized = false;
        windowItem.oldX = x;
        windowItem.oldY = y;
        windowItem.mode = type;

        var newId = 0;
        while (true) {
            newId = new Date().getTime();
            if (newId === canTopData.lastId) {
                continue;
            } else {
                break;
            }
        }

        windowItem.id = newId;
        canTopData.lastId = windowItem.id;

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

        windowItem.width = 300;
        windowItem.height = offsetY;

        windowItem.oldWidth = windowItem.width;
        windowItem.oldHeight = windowItem.height;

        // windowItem.contentArea = [posX, posY, sizeX, sizeY, (spaceX, spaceY, scrollX, scrollY)];
        // (items) <- become pushed later after the window has been calculated
        windowItem.contentArea = [windowItem.x, windowItem.y + windowItem.hotSpotOffsetY[0], windowItem.width, windowItem.drawData[1][2][3]];

        // itemDesign, parent, positioningOn, fill-axis, action, datafield, datatype, initialValue, datastep
        windowItem.contentItems = [["contentScrollbar", -1, "x", "fillY", false, false], ["contentScrollbarPlugY", 0, "both", "none", "scrollY", 0, 0, 1, 0.1]];
        windowItem.contentBoundaries = [];
        windowItem.contentData = [];
        windowItem.contentActions = [];

        var contentItem = [];
        var designItem = [];
        var itemX = 0;
        var itemY = 0;
        var itemWidth = 0;
        var itemHeight = 0;

        // Those are used to offset and regulate items from filled controls
        var offsetX = 0;
        var offsetY = 0;
        var spaceX = windowItem.contentArea[2];
        var spaceY = windowItem.contentArea[3];

        var parent = -1;
        for (var index = 0; index < windowItem.contentItems.length; index++) {
            contentItem = windowItem.contentItems[index];
            designItem = design[contentItem[0]];

            parent = contentItem[1];

            // Define the height of the element based on the fillstyle
            // In case there is no parent set, deduct the available space of the content area
            if (contentItem[3] === "fillY") {
                itemWidth = designItem[6][2];
                itemHeight = spaceY;

                if (parent === -1) {
                    if (designItem[4] < 0) {
                        spaceX -= itemWidth;
                    } else {
                        offsetX += itemWidth;
                    }
                }

            } else if (contentItem[3] === "fillX") {
                itemWidth = spaceX;
                itemHeight = designItem[6][1];

                if (parent === -1) {
                    if (designItem[5] < 0) {
                        spaceY -= itemHeight;
                    } else {
                        offsetY += itemHeight;
                    }
                }
            } else {
                itemWidth = designItem[6][2];
                itemHeight = designItem[6][3];
            }

            // Prepare the item X and Y coordinate
            if (parent === -1) {
                if (contentItem[2] === "x") {
                    if (designItem[4] < 0) {
                        itemX = windowItem.contentArea[2] + designItem[4];
                    } else {
                        itemX = designItem[4];
                    }
                    itemY = 0;
                } else if (contentItem[2] === "y") {
                    itemX = 0;
                    if (designItem[5] < 0) {
                        itemY = windowItem.contentArea[3] + designItem[5];
                    } else {
                        itemY = designItem[5];
                    }
                } else if (contentItem[2] === "both") {
                    itemX = windowItem.contentArea[2] + designItem[4];
                    itemY = windowItem.contentArea[3] + designItem[5];
                }
            } else {
                if (contentItem[2] === "x") {
                    itemX = windowItem.contentBoundaries[parent][0] + designItem[4];
                    itemY = windowItem.contentBoundaries[parent][1];
                } else if (contentItem[2] === "y") {
                    itemX = windowItem.contentBoundaries[parent][0];
                    itemY = windowItem.contentBoundaries[parent][1] + designItem[5];
                } else if (contentItem[2] === "both") {
                    itemX = windowItem.contentBoundaries[parent][0] + designItem[4];
                    itemY = windowItem.contentBoundaries[parent][1] + designItem[5];
                }
            }

            // Add the item dimensions and spacing onto the content drawing list for rendering
            windowItem.contentBoundaries.push([itemX, itemY, itemWidth, itemHeight, itemX + itemWidth, itemY + itemHeight]);

            // Check if this item has a action combined to it and push the index and action on the actionData stack
            if (contentItem[4] !== false) {
                windowItem.contentActions.push([index, contentItem[4]]);

                if (contentItem[5] === "number" || contentItem[5] === "percent") {
                    windowItem.contentData.push([index, contentItem[6], contentItem[7], contentItem[8], contentItem[9]]);
                } else {
                    windowItem.contentData.push([index, contentItem[6], contentItem[7], contentItem[8], false]);
                }
            }
        }
        // Push the available visible space onto the contentArea array
        windowItem.contentArea.push([offsetX, offsetY, spaceX, spaceY]);
        windowItem.contentArea.push([0, 0]);

        windowItem.contentHeight = (windowItem.items.length * 18);
        canTopData.renderQueue.push(windowItem);
        canTopData.renderQueueSize++;
    }

    //var canvas = document.getElementById(canvasItem);
    //var dc = canvas.getContext("2d");
    var design = getDesign(designName, width, height, gridX, gridY);
    canvas.width = width;
    canvas.height = height;

    // Get the default design values for quicker access
    var ctFolderIcon = design.folderIcon;

    // Other values we work with
    var mouse = {};
    mouse.x = 0;
    mouse.y = 0;
    mouse.previousX = 0;
    mouse.previousY = 0;
    // The threshold counts the pixels the mouse can offset from its initial click position so the click is still counted
    mouse.threshold = 25;
    mouse.offsetX = canvas.offsetLeft;
    mouse.offsetY = canvas.offsetTop;
    mouse.current = "default";
    mouse.clickCount = 0;
    mouse.clickInterval = null;
    mouse.doubleClickSpeed = 220;

    mouse.realiseMovement = false;
    mouse.moveInterval = null;
    mouse.movementSpeed = 100 / 60;

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
    function generateDummyData(count) {
        var dummyItems = [];

        // Create the date
        var dateObject = new Date();
        var day = dateObject.getDate() < 10 ? "0" + dateObject.getDate() : dateObject.getDate();
        var month = dateObject.getMonth() < 9 ? "0" + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1;
        var year = dateObject.getFullYear();
        var date = [month, day, year].join("\/");

        // Create the timestamp
        var hours = dateObject.getHours() < 10 ? "0" + dateObject.getHours() : dateObject.getHours();
        var minutes = dateObject.getMinutes() < 10 ? "0" + dateObject.getMinutes() : dateObject.getMinutes();
        var seconds = dateObject.getSeconds() < 10 ? "0" + dateObject.getSeconds() : dateObject.getSeconds();
        var time = [hours, minutes, seconds].join(":");

        // Create folders
        var folderItems = Math.round(count / 10);
        var dataIndex = 0;
        var item = 0;

        for (item = 0; item < folderItems; item++) {
            dataIndex = item;
            dummyItems.push([0, "Folder Item " + item, [[parseInt(month), parseInt(day), year, date], [parseInt(hours), parseInt(minutes), parseInt(seconds), time], dataIndex]]);
        }


        // Create files
        var fileSize = 0;
        var fileItems = count - folderItems;
        for (item = 0; item < fileItems; item++) {
            fileSize = (Math.random() * 12500) + 1;
            dummyItems.push([1, "File Item " + item, [[parseInt(month), parseInt(day), year, date], [hours, minutes, seconds, time], parseFloat((fileSize / 1024).toFixed(2))]]);
        }

        return dummyItems;
    }

    // Create and return a copy of an array item
    function getArrayCopy(arrayItem) {
        var arrayCopy = [];
        var items = arrayItem.length;
        var arraySubItems = 0;
        for (var index = 0; index < items; index++) {
            if (typeof (arrayItem[index]) === "object") {
                var subArray = [];
                arraySubItems = arrayItem[index].length;
                for (var subIndex = 0; subIndex < arraySubItems; subIndex++) {
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

    // Get the index of the last item which can be selected depending
    // on the content boundaries information of a window
    function getLastItemIndex(windowItem) {
        var contentBoundaries = windowItem.contentBoundaries;
        var boundary = [];
        var mX = mouse.x - (windowItem.contentArea[0] + canvas.offsetLeft);
        var mY = mouse.y - (windowItem.contentArea[1] + windowItem.hotSpotOffsetY[0]);
        var lockedItem = null;
        for (var item = 0; item < contentBoundaries.length; item++) {
            boundary = contentBoundaries[item];
            if (mX >= boundary[0] && mX <= boundary[4] && mY >= boundary[1] && mY <= (boundary[1] + boundary[5])) {
                lockedItem = item;
            }
        }

        return lockedItem;
    }

    // Create the info item object for the currently selected item
    function getItemInfoAtIndex(lastItem, activeItem, itemIndex) {
        var item = {};
        item.type = lastItem[0];
        item.itemIndex = itemIndex;
        item.pointer = 0;
        item.parentWindow = activeItem.zOrder;

        for (var index = 0; index < activeItem.contentData.length; index++) {
            if (activeItem.contentData[index][0] === itemIndex) {
                item.data = activeItem.contentData[index];
                item.action = activeItem.contentActions[index][1];
                item.pointer = index;
                break;
            }
        }

        return item;
    }

    // Beginn of drawing routines
    function drawBackground() {
        switch (design.background[0]) {
            case "draw":
            default:
                var drawType = design.background[1].split("_", 2);
                dc.rect(0, 0, width, height);
                switch (drawType[0]) {
                    case "solid":
                    default:
                        dc.fillStyle = design.background[4][0];
                        break;
                    case "gradient":
                        dc.fillStyle = createGradient(drawType[1], 0, 0, design.background[2], design.background[3], design.background[4]);
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

        dc.closePath();
        dc.stroke();
    }

    function drawActiveCell() {
        gridPoint = getMouseGridPoint();
        dc.fillStyle = "rgba(200, 200, 0, 0.4)";
        dc.fillRect(gridPoint[0] * gridX, gridPoint[1] * gridY, gridX, gridY);
    }

    function drawMouse() {
        var activeMouse = [];
        switch (mouse.current) {
            case "text":
                activeMouse = design.textMouse;
                break;
            case "default":
            default:
                activeMouse = design.defaultMouse;
                break;
        }

        drawingCords = activeMouse[4];
        drawingSteps = drawingCords.length;

        dc.fillStyle = activeMouse[0];
        dc.strokeStyle = activeMouse[1];
        dc.lineJoin = activeMouse[2];

        dc.moveTo(mouse.x, mouse.y);
        dc.beginPath();

        if (activeMouse[3] === "line") {
            dc.lineWidth = 2;
            for (var index = 0; index < drawingSteps; index += 2) {
                dc.lineTo(mouse.x + drawingCords[index] - mouse.offsetX, mouse.y + drawingCords[index + 1] - mouse.offsetY);
            }

            dc.closePath();
            dc.stroke();
            dc.fill();
        } else if (activeMouse[3] === "stroke") {
            dc.lineWidth = 1;
            for (var index = 0; index < drawingSteps; index += 2) {
                dc.lineTo(mouse.x + drawingCords[index] - mouse.offsetX, mouse.y + drawingCords[index + 1] - mouse.offsetY);
            }

            dc.closePath();
            dc.stroke();
        }

        dc.strokeStyle = "#000";
    }

    // Click handler to check count of clicks
    function checkClick(evt) {
        mouse.clickCount++;
        if (mouse.clickInterval === null) {
            mouse.previousX = evt.clientX;
            mouse.previousY = evt.clientY;
            mouse.clickInterval = setInterval(recognizeDoubleClick, mouse.doubleClickSpeed);
        }

        doClick();
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
                    canTopData.activeWindow = item.id;
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
                clearInterval(mouse.clickInternval);
                mouse.clickInternval = null;
                // Double click counted
                lg("in two mouseclicks");
                if (mouse.activeItem) {
                    lg("Pressed item: " + activeItem.title + " / " + pressedItem);
                }

                mouse.clickCount = 0;
                return;
            } else {
                if (mouse.clickCount === 1) {
                    // Single mouse click
                    lg("in one mouseclick");
                    lg("Pressed item: " + activeItem.title + " / " + pressedItem);

                    if (pressedItem === "windowMaximize") {
                        var newWidth = 0;
                        var newHeight = 0;
                        if (!activeItem.isMaximized) {
                            // Store values before maximizing the window
                            activeItem.oldX = activeItem.x;
                            activeItem.oldY = activeItem.y;
                            activeItem.oldWidth = activeItem.width;
                            activeItem.oldHeight = activeItem.height;

                            activeItem.x = 0;
                            activeItem.y = 0;
                            activeItem.isMaximized = true;
                            newWidth = canvas.width;
                            newHeight = canvas.height;
                        } else {
                            // Restore saved values on demaximizing
                            activeItem.x = activeItem.oldX;
                            activeItem.y = activeItem.oldY;
                            activeItem.isMaximized = false;
                            newWidth = activeItem.oldWidth;
                            newHeight = activeItem.oldHeight;
                        }
                        resizeWindowItem(activeItem, newWidth, newHeight);
                        sizeWindowContent(activeItem, newWidth, newHeight);
                    } else if (pressedItem === "windowContent") {
                        var lockedItem = getLastItemIndex(activeItem);

                        if (lockedItem !== null) {
                            var lastItem = activeItem.contentItems[lockedItem];
                            lg("Pressed item: " + activeItem.title + " / " + lastItem[0]);
                        }
                        return;
                    }
                }

                if (mouse.realiseMovement) {
                    if (pressedItem === "windowTitleBar") {
                        if (mouse.moveInterval === null && !activeItem.isMaximized) {
                            mouse.previousX = mouse.x;
                            mouse.previousY = mouse.y;
                            mouse.moveInterval = setInterval(realiseMouseMovement, mouse.movementSpeed);
                            mouse.activeItem = activeItem;
                        }
                        return;
                    } else if (pressedItem === "windowContent") {
                        var lockedItem = getLastItemIndex(activeItem);

                        if (lockedItem !== null) {
                            var lastItem = activeItem.contentItems[lockedItem];
                            lg("Pressed item: " + activeItem.title + " / " + lastItem[0]);

                            switch (lastItem[0]) {
                                case "contentScrollbarPlugY":
                                case "contentScrollbarPlugX":
                                    mouse.previousX = mouse.x;
                                    mouse.previousY = mouse.y;
                                    mouse.moveInterval = setInterval(realiseMouseMovement, mouse.movementSpeed);
                                    mouse.activeItem = getItemInfoAtIndex(lastItem, activeItem, lockedItem);
                                    break;
                            }
                        }
                    }

                    if (pressedItem === "windowResize") {
                        if (mouse.moveInterval === null) {
                            mouse.previousX = mouse.x;
                            mouse.previousY = mouse.y;
                            mouse.moveInterval = setInterval(realiseMouseResize, mouse.movementSpeed);
                            mouse.activeItem = activeItem;
                        }
                        return;
                    } else if (pressedItem === "windowClose") {
                        for (var trap = 0; trap < canTopData.mouseTraps.length; trap++) {
                            if (canTopData.mouseTraps[trap][0] === activeItem.id) {
                                canTopData.mouseTraps.splice(trap, 1);
                                break;
                            }
                        }

                        canTopData.renderQueue.splice(activeItem.zOrder);
                        canTopData.renderQueueSize--;

                        index = canTopData.renderQueueSize - 1;
                        while (index--) {
                            canTopData.renderQueue[index].zOrder = index;
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
        if (mouse.clickInterval !== null) {
            return;
        }

        index = canTopData.renderItems.length;
        while (index--) {
            item = canTopData.renderItems[index];
            if (mx >= item.x && mx <= (item.x + item.width) && my >= item.y && my <= (item.y + item.height)) {
                if (mouse.clickCount > 1) {
                    clearInterval(mouse.clickInternval);
                    mouse.clickInternval = null;

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
            switch (mouse.activeItem.type) {
                case "window":
                    mouse.activeItem.x -= mouse.previousX - mouse.x;
                    mouse.activeItem.y -= mouse.previousY - mouse.y;

                    if (snapToEdges) {
                        if (mouse.activeItem.x <= 0) {
                            mouse.activeItem.x = 0;
                        } else if (mouse.activeItem.x + mouse.activeItem.width >= canvas.width) {
                            mouse.activeItem.x = canvas.width - mouse.activeItem.width;
                        }

                        if (mouse.activeItem.y <= 0) {
                            mouse.activeItem.y = 0;
                        } else if (mouse.activeItem.y + mouse.activeItem.height >= canvas.height) {
                            mouse.activeItem.y = canvas.height - mouse.activeItem.height;
                        }
                    }

                    // Update the dimensions of the contentArea for content drawing
                    mouse.activeItem.contentArea[0] = mouse.activeItem.x;
                    mouse.activeItem.contentArea[1] = mouse.activeItem.y + mouse.activeItem.hotSpotOffsetY[0];

                    for (var trapIndex = 0; trapIndex < canTopData.mouseTraps.length; trapIndex++) {
                        var trap = canTopData.mouseTraps[trapIndex];
                        var boundary = mouse.activeItem.contentBoundaries[trap[1]];
                        if (trap[0] === mouse.activeItem.id) {
                            canTopData.mouseTraps[trapIndex] = [trap[0], trap[1], mouse.activeItem.contentArea[0] + boundary[0], mouse.activeItem.contentArea[1] + boundary[1], trap[4], trap[5], trap[6]]
                        }
                    }

                    break;
                case "contentScrollbarPlugY":
                case "contentScrollbarPlugX":
                    var parentWindow = canTopData.renderQueue[mouse.activeItem.parentWindow];

                    if (mouse.activeItem.action === "scrollY") {
                        var itemBaseY = design[mouse.activeItem.type][5];
                        var itemHeight = parentWindow.contentBoundaries[mouse.activeItem.itemIndex][3];
                        var scrollHeight = parentWindow.contentArea[3] - (itemBaseY + itemHeight);

                        parentWindow.contentBoundaries[mouse.activeItem.itemIndex][1] -= (mouse.previousY - mouse.y);
                        var scrollPercentage = 0;
                        if (parentWindow.contentBoundaries[mouse.activeItem.itemIndex][1] <= itemBaseY) {
                            parentWindow.contentBoundaries[mouse.activeItem.itemIndex][1] = itemBaseY;
                            scrollPercentage = 0;
                        } else if (parentWindow.contentBoundaries[mouse.activeItem.itemIndex][1] >= scrollHeight) {
                            parentWindow.contentBoundaries[mouse.activeItem.itemIndex][1] = scrollHeight;
                            scrollPercentage = 1;
                        } else {
                            scrollPercentage = (parentWindow.contentBoundaries[mouse.activeItem.itemIndex][1] - itemBaseY) / scrollHeight;
                        }

                        // Maximum positive scroll in Y
                        var contentHeight = parentWindow.contentHeight;
                        if (parentWindow.contentArea[5][1] <= (contentHeight - parentWindow.contentArea[3])) {
                            parentWindow.contentArea[5][1] = ((contentHeight - parentWindow.contentArea[3]) * scrollPercentage);
                        } else if (parentWindow.contentArea[3] < contentHeight) {
                            parentWindow.contentArea[5][1] = contentHeight - parentWindow.contentArea[3];
                        } else {
                            parentWindow.contentBoundaries[mouse.activeItem.itemIndex][1] = itemBaseY;
                        }
                    }
                    break;
            }

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

            if (snapToEdges) {
                if (width > mouse.activeItem.width && (mouse.activeItem.width + mouse.activeItem.x) >= canvas.width) {
                    width = canvas.width - mouse.activeItem.x;
                }

                if (height > mouse.activeItem.height && (mouse.activeItem.height + mouse.activeItem.y) >= canvas.height) {
                    height = canvas.height - mouse.activeItem.y;
                }
            }

            mouse.previousX = mouse.x;
            mouse.previousY = mouse.y;
            resizeWindowItem(mouse.activeItem, width, height);
        }
    }

    // Interactions
    function resizeWindowItem(activeItem, newWidth, newHeight) {
        var drawData = [];
        var drawItems = activeItem.drawData.length;
        var drawDesign = [];
        var drawIndexes = 0;
        var usedPixels = 0;
        var index = 0;
        var hotSpotOffsetY = activeItem.hotSpotOffsetY;
        var offsetsY = activeItem.hotSpotOffsetY.length;
        activeItem.width = newWidth;
        activeItem.height = newHeight;

        for (index = 0; index < drawItems; index++) {

            drawData = activeItem.drawData[index];

            drawDesign = design[drawData[0]];
            drawIndexes = drawDesign[3].length;

            usedPixels = newHeight;
            for (var subIndex = 0; subIndex < offsetsY; subIndex++) {
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
                    if (index > 1) {
                        usedPixels += drawData[1][0][3];
                    }
                    drawData[1][0][1] = newHeight - usedPixels;
                    drawData[2][1] = usedPixels;
                }
            }
        }

        // Update the dimensions of the contentArea for content drawing
        // and size the window content area content according to rules
        //activeItem.contentArea = [activeItem.x, activeItem.y + activeItem.hotSpotOffsetY[0], newWidth, activeItem.drawData[1][2][3] - activeItem.hotSpotOffsetY[0], activeItem.contentArea[4], activeItem.contentArea[5]];
        sizeWindowContent(activeItem, newWidth, newHeight);
    }

    // Size window content area content according to ruleset
    function sizeWindowContent(windowItem, width, height) {
        // General variables
        var contentItem = [];
        var designItem = [];
        var itemX = 0;
        var itemY = 0;
        var itemWidth = 0;
        var itemHeight = 0;

        // Those are used to offset and regulate items from filled controls
        var offsetX = 0;
        var offsetY = 0;
        var spaceX = windowItem.contentArea[2];
        var spaceY = windowItem.contentArea[3];
        var parent = -1;

        var designBoundaries = [];

        for (var index = 0; index < windowItem.contentItems.length; index++) {
            contentItem = windowItem.contentItems[index];
            designItem = design[contentItem[0]];

            parent = contentItem[1];
            designBoundaries = designItem[designItem.length - 1];

            // Define the height of the element based on the fillstyle
            // In case there is no parent set, deduct the available space of the content area
            if (contentItem[3] === "fillY") {
                itemWidth = designBoundaries[2];
                itemHeight = spaceY;

                if (parent === -1) {
                    if (designItem[4] < 0) {
                        spaceX -= itemWidth;
                    } else {
                        offsetX += itemWidth;
                    }
                }

            } else if (contentItem[3] === "fillX") {
                itemWidth = spaceX;
                itemHeight = designBoundaries[1];

                if (parent === -1) {
                    if (designItem[5] < 0) {
                        spaceY -= itemHeight;
                    } else {
                        offsetY += itemHeight;
                    }
                }
            } else if (contentItem[3] === "pos") {
                itemWidth = windowItem.contentBoundaries[index][2];
                itemHeight = windowItem.contentBoundaries[index][3];
            } else {
                itemWidth = designBoundaries[2];
                itemHeight = designBoundaries[3];
            }

            // Prepare the item X and Y coordinate
            if (parent === -1) {
                if (contentItem[2] === "x") {
                    if (designItem[4] < 0) {
                        itemX = windowItem.contentArea[2] + designItem[4];
                    } else {
                        itemX = designItem[4];
                    }
                    itemY = 0;
                } else if (contentItem[2] === "y") {
                    itemX = 0;
                    if (designItem[5] < 0) {
                        itemY = windowItem.contentArea[3] + designItem[5];
                    } else {
                        itemY = designItem[5];
                    }
                } else if (contentItem[2] === "both") {
                    if (contentItem[3] === "pos") {
                        itemX = windowItem.contentBoundaries[index][0];
                        itemY = windowItem.contentBoundaries[index][1];
                    } else {
                        if (designItem[4] < 0) {
                            itemX = windowItem.contentArea[2] + designItem[4];
                        } else {
                            itemX = designItem[4];
                        }

                        if (designItem[5] < 0) {
                            itemY = windowItem.contentArea[3] + designItem[5];
                        } else {
                            itemX = designItem[5];
                        }
                    }
                }
            } else {
                if (contentItem[2] === "x") {
                    itemX = windowItem.contentBoundaries[parent][0] + designItem[4];
                    itemY = windowItem.contentBoundaries[parent][1];
                } else if (contentItem[2] === "y") {
                    itemX = windowItem.contentBoundaries[parent][0];
                    itemY = windowItem.contentBoundaries[parent][1] + designItem[5];
                } else if (contentItem[2] === "both") {
                    itemX = windowItem.contentBoundaries[parent][0] + designItem[4];
                    itemY = windowItem.contentBoundaries[parent][1] + designItem[5];
                }
            }

            // Save the new dimensions for rendering
            windowItem.contentBoundaries[index] = [itemX, itemY, itemWidth, itemHeight, itemX + itemWidth, itemY + itemHeight];
        }

        windowItem.contentArea = [windowItem.x, windowItem.y + windowItem.hotSpotOffsetY[0], width, windowItem.drawData[1][2][3] - windowItem.hotSpotOffsetY[0], [offsetX, offsetY, spaceX, spaceY], [0, 0]];

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
    function drawFolderItems() {
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

    function renderWindowContent(queueItem) {
        var windowItem = canTopData.renderQueue[queueItem];
        var contentItems = windowItem.contentItems;
        var contentArea = windowItem.contentArea;
        var boundaries = windowItem.contentBoundaries;
        var items = windowItem.items;

        var index = 0;
        var contentItem = [];
        var designItem = [];
        var itemBoundaries = [];
        var subIndex = 0;

        var fillMethod = "";
        var drawType = [];
        var drawingMethod = "";
        var colors = [];
        var posX = 0;
        var posY = 0;

        for (index = 0; index < contentItems.length; index++) {
            contentItem = contentItems[index];
            designItem = design[contentItem[0]];
            itemBoundaries = boundaries[index];

            for (subIndex = 0; subIndex < designItem[0].length; subIndex++) {
                drawingMethod = designItem[0][subIndex];
                fillMethod = designItem[1][subIndex];
                colors = designItem[2][subIndex];

                posX = contentArea[0] + itemBoundaries[0];
                posY = itemBoundaries[1];

                drawType = fillMethod.split("_", 2);
                if (drawType[0] === "solid") {
                    dc.fillStyle = colors[0];
                } else if (drawType[0] === "gradient") {
                    dc.fillStyle = createGradient(drawType[1], contentArea[0] + posX, contentArea[1] + posY, itemBoundaries[2], itemBoundaries[3]);
                }

                if (drawingMethod === "rect") {
                    dc.lineWidth = 1;
                    dc.strokeRect(posX, contentArea[1] + posY, itemBoundaries[2], itemBoundaries[3]);
                    dc.fillRect(posX, contentArea[1] + posY, itemBoundaries[2], itemBoundaries[3]);
                }
            }
        }

        var currentItem = [];
        var offsetX = contentArea[0] + 3;
        var offsetY = contentArea[1] + 12;

        if (windowItem.mode === "data") {
            // Clip the drawable area by the dimensions of the content area
            dc.save();
            dc.beginPath();
            dc.rect(contentArea[0], contentArea[1], contentArea[4][2], contentArea[3]);
            dc.clip();

            for (var item = 0; item < items.length; item++) {
                currentItem = items[item];

                dc.textAlign = "left";
                if (offsetY >= (contentArea[1] + contentArea[5][1] - 18)) {
                    if (currentItem[0] === 0) {
                        dc.fillStyle = "#aaaa00";
                        dc.fillText(currentItem[1], offsetX, offsetY - contentArea[5][1]);
                    } else if (currentItem[0] === 1) {
                        dc.fillStyle = "#aaa";
                        dc.fillText(currentItem[1], offsetX, offsetY - contentArea[5][1]);
                        dc.fillText([currentItem[2][0][3], currentItem[2][1][3]].join("    "), offsetX + 100, offsetY - contentArea[5][1]);
                        dc.fillText(currentItem[2][2] + " MB", offsetX + 240, offsetY - contentArea[5][1]);
                    }
                }
                offsetY += 18;

                if ((offsetY - contentArea[5][1]) > (contentArea[1] + contentArea[3])) {
                    break;
                }
            }

            dc.restore();
            windowItem.contentHeight = (items.length * 18);
        }
    }

    function createWindowControl(type, value, parentWindowIndex, parentIndex, offsetX, offsetY, sizeX, sizeY) {
        var parentWindow = canTopData.renderQueue[parentWindowIndex];
        // TODO: Start here
        if (type === "input") {
            parentWindow.contentBoundaries.push([offsetX, offsetY, sizeX, sizeY, offsetX + sizeX, offsetY + sizeY]);
            parentWindow.contentData.push([parentWindow.contentItems.length, value, "", "", false]);
            parentWindow.contentItems.push(["contentInputField", parentIndex, "both", "pos", "string", value, "", false]);
            parentWindow.contentActions.push([itemIndex, "setInput"]);

            var itemIndex = parentWindow.contentItems.length - 1;
            var windowId = canTopData.renderQueue[parentWindowIndex].id;
            canTopData.mouseTraps.push([windowId, itemIndex, parentWindow.contentArea[0] + offsetX, parentWindow.contentArea[1] + offsetY, sizeX, sizeY, "text"]);
        }
    }

    // Main function executes after desktop imagemap has been loaded
    function initialized() {
        createFolderItem("Documents", 20, 10);
        createFolderItem("Briefcase", 20, 80);
        createWindow(design, "data", "Window Testtitle - Data Window 1", 70, 100);
        createWindow(design, "data", "Window Testtitle - Data Window 2", 420, 100);
        createWindow(design, "data", "Window Testtitle - Data Window 3", 150, 240);

        createWindow(design, "app", "Window Testtitle - App Window 4", 420, 240);
        //createWindowControl(type, value, parentWindowIndex, parentIndex, offsetX, offsetY, sizeX, sizeY) {
        createWindowControl("input", "StringValue", canTopData.renderQueueSize - 1, -1, 20, 20, 70, 14);

        // Main loop
        var queueItem = 0;

        function mainloop() {
            drawBackground();
            drawFolderItems();

            for (queueItem = 0; queueItem < canTopData.renderQueueSize; queueItem++) {
                drawQueueItem(queueItem);
                if (canTopData.renderQueue[queueItem].type === "window") {
                    renderWindowContent(queueItem);
                }
            }

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
            if (canTopData.activeWindow !== null) {
                var mouseTraps = canTopData.mouseTraps;
                var trap = [];
                var mX = evt.clientX - mouse.offsetX;
                var mY = evt.clientY - mouse.offsetY;
                mouse.current = "default";

                for (var trapIndex = 0; trapIndex < mouseTraps.length; trapIndex++) {
                    trap = mouseTraps[trapIndex];

                    if (trap[0] !== canTopData.activeWindow) {
                        continue;
                    }

                    dc.beginPath();
                    dc.rect(trap[2], trap[3], trap[4], trap[5]);
                    dc.closePath();
                    if (dc.isPointInPath(mX, mY)) {
                        mouse.current = trap[6];
                        break;
                    }
                }
            }
        });

        canvas.addEventListener("click", checkClick);
        canvas.addEventListener("mousedown", activateMovement);
        canvas.addEventListener("mouseup", deactivateMovement);
        canvas.addEventListener("mouseout", deactivateMovement);

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
