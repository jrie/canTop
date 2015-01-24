var canTopData = {};
canTopData.controls = [];
canTopData.labels = [];
canTopData.selections = [];
canTopData.activeSelection = [false, 0, 0];
var canvas = document.getElementById("canTopCanvas");
var dc = canvas.getContext("2d");

var hasConsole = window.console ? true : false;

function lg(msg) {
    if (hasConsole) {
        window.console.log(msg);
    }
}

function getDesign(designName, width, heigth, girdX, gridY) {

    var design = {};

    switch (designName) {
        case "template":
        default:
            design.background = ["draw", "solid", "tb", width, heigth, ["#3a0700", "#000", "#001100", "#003300", "#000"]]; // type img/draw, draw solid/gradient, sizeX, sizeY, color
            design.folderItem = ["draw", "solid", 30, 50, 10, ["#ea0000"], ["#000"], ["ea5000"], ["#eaeaea"]];
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

    // Other values we work with
    var mouse = {};
    mouse.x = 0;
    mouse.y = 0;
    mouse.offsetX = canvas.offsetLeft;
    mouse.offsetY = canvas.offsetTop;

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
                dc.rect(0, 0, width, height);
                switch (ctBackground[1]) {
                    case "solid":
                    default:
                        dc.fillStyle = ctBackground[5][0];
                        break;
                    case "gradient":
                        dc.fillStyle = createGradient(ctBackground[2], ctBackground[3], ctBackground[4], ctBackground[5]);
                        break;
                }

                dc.fill();
        }
    }

    function drawGrid() {
        var maxWidth = canvas.width - gridX;
        var maxHeight = canvas.height - gridY;
        dc.lineWidth = 0.6;
        dc.strokeStyle = "rgba(255, 255, 255, 0.1)";
        var stepX = 0;
        var stepY = gridY;
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
            var drawingCoords = ctMouse[3];
            var drawingSteps = drawingCoords.length;

            dc.fillStyle = ctMouse[1];
            dc.strokeStyle = ctMouse[2];
            dc.lineWidth = 2;

            dc.moveTo(mouse.x, mouse.y);
            dc.beginPath();
            for (var index = 0; index < drawingSteps; index += 2) {
                dc.lineTo(mouse.x + drawingCoords[index] - mouse.offsetX, mouse.y + drawingCoords[index + 1] - mouse.offsetY);
            }
            dc.closePath();
            dc.stroke();
            dc.fill();
        }
    }

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
