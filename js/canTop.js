// Temporary data holder for canTopData
var canTopData = {};
canTopData.controls = [];
canTopData.labels = [];
canTopData.selections = [];
canTopData.activeSelection = [false, 0, 0];
canTopData.folderItems = [];

// This functions later will be moved into the main function and are not global
var canvas = document.getElementById("canTopCanvas");
var dc = canvas.getContext("2d");

var hasConsole = window.console ? true : false;
function lg(msg) {
    if (hasConsole) {
        window.console.log(msg);
    }
}

// Start of main functions

function getDesign(designName, width, heigth, girdX, gridY) {

    var design = {};
    switch (designName) {
        case "template":
        default:
            design.background = ["draw", "solid", width, heigth, ["#3a0700", "#000", "#001100", "#003300", "#000"]]; // type img/draw, draw solid/gradient_direction, sizeX, sizeY, color
            design.folderItem = ["draw", "solid", 50, 30, [[0, 0, 45, 0, 45, 5, 50, 5, 50, 35, 0, 35, 0, 0], [0, 0, 45, 0, 45, 5, 50, 5, 50, 35, 0, 35, 0, 0]], ["#ea0000"], ["#000"], ["ea5000"], ["#eaeaea"], "#fff"];
            design.mouse = ["draw", "#fff", "#000", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15, 0, 0]];
            break;
    }

    if (design.mouse[3].length % 2 !== 0) {
        lg("Unqeual coordinates to draw the mouse, falling back to default replacement.");
        design.mouse = ["draw", "#fff", "#000", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15, 0, 0]];
    }

    return design;
}

function canTop(canvasItem, designName, width, height, gridX, gridY, useCustomMouse, useDebug) {

    //var canvas = document.getElementById(canvasItem);
    //var dc = canvas.getContext("2d");
    var design = getDesign(designName, width, height, gridX, gridY);
    canvas.width = width;
    canvas.height = height;

    // Get the default design values for quicker access
    var ctBackground = design.background;
    var ctMouse = design.mouse;
    var ctFolderItem = design.folderItem;

    // Other values we work with
    var mouse = {};
    mouse.x = 0;
    mouse.y = 0;
    mouse.offsetX = canvas.offsetLeft;
    mouse.offsetY = canvas.offsetTop;

    // Helper function to generate gradients
    function createGradient(direction, width, height, colors) {
        var background;
        var stepSize = (1.0 / (colors.length - 1)).toPrecision(2);
        var current = 1.0;
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
        var maxWidth = canvas.width - gridX;
        var maxHeight = canvas.height - gridY;
        var stepX = 0;
        var stepY = gridY;

        dc.lineWidth = 0.6;
        dc.strokeStyle = "rgba(255, 255, 255, 0.1)";

        dc.beginPath();

        while (stepY <= maxHeight) {
            dc.moveTo(0, stepY);
            dc.lineTo(canvas.width, stepY);
            stepY += gridY;
        }

        while (stepX <= maxWidth) {
            dc.moveTo(stepX, 0);
            dc.lineTo(stepX, canvas.height);
            stepX += gridX;
        }

        dc.stroke();
        dc.closePath();
    }


    function drawActiveCell() {
        var activeX = Math.floor((mouse.x - mouse.offsetX) / gridX);
        var activeY = Math.floor((mouse.y - mouse.offsetY) / gridY);
        dc.fillStyle = "rgba(200, 200, 0, 0.4)";
        dc.fillRect(activeX * gridX, activeY * gridY, gridX, gridY);
    }


    function drawMouse() {
        if (ctMouse[0] === "draw") {
            var drawingCords = ctMouse[3];
            var drawingSteps = drawingCords.length;

            dc.fillStyle = ctMouse[1];
            dc.strokeStyle = ctMouse[2];
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


    // Generate test folder items
    var testFolderItems = [[20, 20, "Drawing Board"], [20, 90, "Documents"]];

    function createFolder(x, y, title) {
        var folderItem = {};
        folderItem.x = x;
        folderItem.y = y;
        folderItem.open = false;
        folderItem.width = ctFolderItem[2];
        folderItem.height = ctFolderItem[3];
        folderItem.title = title;
        canTopData.folderItems.push(folderItem);
    }

    for (var testItem = 0; testItem < testFolderItems.length; testItem++) {
        createFolder(testFolderItems[testItem][0], testFolderItems[testItem][1], testFolderItems[testItem][2]);
    }

    //design.folderItem = ["draw", "solid", 50, 30, [0, 0, 45, 10, 50, 14, 50, 30, 0, 30, 0, 0], ["#ea0000"], ["#000"], ["ea5000"], ["#eaeaea"], "#fff"];
    function drawFolderItems() {
        var folderItems = canTopData.folderItems.length;
        for (var folderItem = 0; folderItem < folderItems; folderItem++) {
            var folder = canTopData.folderItems[folderItem];
            if (ctFolderItem[0] === "draw") {
                var drawingCords = [];
                if (folder.open) {
                    drawingCords = ctFolderItem[4][1];
                } else {
                    drawingCords = ctFolderItem[4][0];
                }

                var drawingSteps = drawingCords.length;
                var drawType = ctFolderItem[1].split("_", 2);
                switch (drawType[0]) {
                    case "solid":
                    default:
                        dc.fillStyle = ctFolderItem[5][0];
                        dc.strokeStyle = ctFolderItem[6][0];
                        break;
                    case "gradient":
                        dc.fillStyle = createGradient(drawType[1], ctFolderItem[2], ctFolderItem[3], ctFolderItem[5]);
                        dc.strokeStyle = createGradient(drawType[1], ctFolderItem[2], ctFolderItem[3], ctFolderItem[6]);
                        break;
                }

                dc.lineWidth = 2;
                dc.moveTo(folder.x + drawingCords[0], folder.y + drawingCords[1]);

                dc.beginPath();
                for (var index = 0; index < drawingSteps; index += 2) {
                    dc.lineTo(folder.x + drawingCords[index], folder.y + drawingCords[index + 1]);
                }

                dc.closePath();
                dc.stroke();
                dc.fill();

                dc.textAlign = "center";
                dc.fillText(folder.title, folder.x + (folder.width / 2), folder.y + ctFolderItem[3] + 20);
            }
        }
    }

    function mainloop() {
        drawBackground();
        drawFolderItems();

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

    mainloop();
}
