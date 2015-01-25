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

function getDesign(designName, width, heigth, gridX, gridY) {

    var design = {};

    switch (designName) {
        case "template":
        default:
            // Background design - type img/draw, draw solid/gradient_direction,
            // sizeX, sizeY, colors
            design.background = ["draw", "solid", width, heigth, ["#3a0700", "#000", "#001100", "#003300", "#000"]];

            // Mouse design
            design.defaultMouse = ["draw", "#fff", "#000", "round", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15, 0, 0]];

            design.lineJoin = "round";
            break;
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
    var ctDefaultMouse = design.defaultMouse;

    // Other values we work with
    var mouse = {};
    mouse.x = 0;
    mouse.y = 0;
    mouse.offsetX = canvas.offsetLeft;
    mouse.offsetY = canvas.offsetTop;
    mouse.current = "default";

    var activeMouse = [];

    // Variables for active cell drawing
    var gridPoint = [];

    var gridStart = [0, 0];
    var gridEnd = [canvas.width, canvas.height];

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

    // Main loop
    function mainloop() {
        drawBackground();

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
