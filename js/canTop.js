// Temporary data holder for canTopData
const canTopData = {};
canTopData.activeSelection = [];
canTopData.renderItems = [];
canTopData.renderQueue = [];
canTopData.renderQueueSize = 0;
canTopData.activeWindow = null;
canTopData.mouseTraps = [];
canTopData.lastId = 0;

// Start of main functions

function getDesign (designName, useBackground, width, heigth, gridX, gridY) {
  const design = {};
  design.imageMap = new window.Image();
  if (useBackground) {
    design.bg = new window.Image();
  }

  // Incooperate font measuring and evaluation
  /*
  dc.font = dcFont;
  const fontSize = dc.measureText('Wj');
  const fontHeight = parseInt(dc.font);
  const fontWidth = fontSize.width;
  */

  function pushBoundaries (item, styleOffset, coordOffset) {
    const cordSize = item[coordOffset].length;
    let cords = 0;
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;

    for (let index = 0; index < cordSize; index++) {
      switch (item[styleOffset][index]) {
        case 'line':
          minX = minX < item[coordOffset][index][0] ? item[coordOffset][index][0] : 0;
          minY = minY < item[coordOffset][index][1] ? item[coordOffset][index][1] : 0;

          cords = item[coordOffset][index].length;
          for (let cord = 0; cord < cords; cord += 2) {
            maxX = item[coordOffset][index][cord] > minX ? item[coordOffset][index][cord] > minX : maxX;
            maxY = item[coordOffset][index][cord] > minY ? item[coordOffset][index][cord] > minY : maxY;
          }

          break;
        case 'rect':
        default:
          maxX = item[coordOffset][index][2];
          maxY = item[coordOffset][index][3];
          break;
      }
    }

    item.push([minX, minY, maxX, maxY]);
  }

  switch (designName) {
    case 'template':
    default:
      // Background design - type img/draw, draw solid/gradient_tb/gradient_lr, sizeX, sizeY, colors
      design.background = ['draw', 'solid', width, heigth, ['#3a0700', '#000', '#001100', '#003300', '#000']];

      if (useBackground) {
        design.bg.src = './img/bg.webp';
      }

      // Mouse design
      design.defaultMouse = ['#fff', '#000', 'round', 'line', [0, 0, 1, 0, 12, 10, 12, 15, 5, 15]];
      design.textMouse = ['#888', '#fff', 'round', 'stroke', [-3, -5, 3, -5, 0, -5, 0, 5, -3, 5, 3, 5, 0, 5, 0, -5]];

      design.lineJoin = 'round';

      // Icons
      design.imageMap.src = './img/template_imagemap.png';
      design.folderIcon = [50, 50, [[0, 0], [50, 0], [100, 0], [150, 0]], ['#dedede', '#fff']];

      // Window prototype
      design.windowTitleBar = ['static', 'x', ['#fff', '#aeaeae'], ['rect'], ['gradient_bt'], [['#4a0000', '#1a0000', '#000']], [[0, 0, 100, 17]]];
      design.windowContent = ['static', 'both', ['#fff', '#aeaeae'], ['rect'], ['solid'], [['rgba(112, 0, 0,0.85)']], [[0, 17, 100, 150]]];
      design.windowStatusBar = ['static', 'x', ['#fff', '#aeaeae'], ['rect'], ['solid'], [['#4a0000']], [[0, 167, 100, 17]]];

      // Window controls
      design.windowResize = ['dynamic', 'both', [-12, -12], ['line', 'line'], ['solid', 'solid'], [['#222'], ['#fff']], [[10, 0, 10, 10, 0, 10, 10, 0], [8, 2, 8, 8, 2, 8, 8, 2]]];
      design.windowMaximize = ['dynamic', 'both', [-36, 3], ['rect', 'rect', 'rect'], ['solid', 'solid', 'solid'], [['#dedede'], ['#aeaeae'], ['#333']], [[0, 0, 10, 10], [2, 2, 6, 6], [2, 3, 6, 5]]];
      design.windowMinimize = ['dynamic', 'both', [-24, 3], ['rect', 'rect', 'rect'], ['solid', 'solid', 'solid'], [['#dedede'], ['#aeaeae'], ['#333']], [[0, 0, 10, 10], [2, 2, 6, 6], [2, 6, 6, 2]]];
      design.windowClose = ['dynamic', 'both', [-12, 3], ['rect', 'rect', 'line', 'line'], ['solid', 'solid', 'stroke', 'stroke'], [['#dedede'], ['#aeaeae'], ['#333'], ['#333']], [[0, 0, 10, 10], [2, 2, 6, 6], [2, 2, 8, 8], [2, 8, 8, 2]]];

      // Window contents
      // Vertical scrollbar
      design.windowScrollbarY = [['rect'], ['solid'], [['rgba(190, 190, 190, 0.4)']], [[0, 0, 12, 100]], -12, 0];
      design.windowScrollbarPlugY = [['rect'], ['solid'], [['#ddd']], [[0, 0, 6, 15]], 3, 3];

      // Horizontal scrollbar
      design.windowScrollbarX = [['rect'], ['solid'], [['rgba(190,190,190,0.4)']], [[0, 0, 100, 14]], 0, -14];
      design.windowScrollbarPlugX = [['rect'], ['solid'], [['#ddd']], [[0, 0, 15, 6]], 3, 4];

      // Interactive elements
      design.textCursor = ['#fff', 1];
      design.contentInputField = [['rect', 'rect'], ['solid', 'solid'], [['#999'], ['#333']], [[0, 0, 100, 20], [1, 1, 97, 17]], 0, 0];
      design.contentInputFieldText = [['#fff', 'transparent'], ['#009900', '#00003a']];
      break;
  }

  // Get the boundaries for the design items listed below and push it at end of the design
  pushBoundaries(design.windowTitleBar, 3, 6);
  pushBoundaries(design.windowContent, 3, 6);
  pushBoundaries(design.windowStatusBar, 3, 6);

  pushBoundaries(design.windowScrollbarX, 0, 3);
  pushBoundaries(design.windowScrollbarPlugX, 0, 3);

  pushBoundaries(design.windowScrollbarY, 0, 3);
  pushBoundaries(design.windowScrollbarPlugY, 0, 3);

  pushBoundaries(design.contentInputField, 0, 3);

  return design;
}

function canTop (canvasItem, designName, useBackground, width, height, gridX, gridY, useCustomMouse, snapToEdges, useDebug) {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

  function drawQueueItem (queueIndex) {
    const item = canTopData.renderQueue[queueIndex];

    let index = 0;
    for (const drawingItemName of item.drawingItems) {
      const drawingDesign = design[drawingItemName];
      const drawingCoords = item.drawData[index][1];
      const sizeY = item.drawData[index][2][3];

      for (let drawingIndex = 0; drawingIndex < drawingCoords.length; drawingIndex++) {
        // Generarte the fill style
        const drawType = drawingDesign[4][drawingIndex].split('_', 2);
        switch (drawType[0]) {
          case 'solid':
            dc.fillStyle = drawingDesign[5][drawingIndex][0];
            break;
          case 'gradient':
            dc.fillStyle = createGradient(drawType[1], item.x, item.y, item.width, sizeY, drawingDesign[5][drawingIndex]);
            break;
          case 'stroke':
            dc.strokeStyle = drawingDesign[5][drawingIndex][0];
            break;
        }

        const dynamicCoords = getDynamicOffset(drawingDesign, item);
        const posX = dynamicCoords[0];
        const posY = dynamicCoords[1];

        // Actual drawing
        const linePoints = drawingCoords[drawingIndex];
        const drawingSteps = linePoints.length;
        let cord = 0;

        switch (drawingDesign[3][drawingIndex]) {
          case 'line':
            dc.beginPath();

            if (drawingDesign[0] === 'static') {
              for (cord = 0; cord < drawingSteps; cord += 2) {
                dc.lineTo(item.x + linePoints[cord], item.y + linePoints[cord + 1]);
              }
              dc.lineTo(item.x + linePoints[cord][0], item.y + linePoints[cord][1]);
            } else {
              if (linePoints.length > 4) {
                for (cord = 0; cord < drawingSteps; cord += 2) {
                  dc.lineTo(item.x + posX + linePoints[cord], item.y + posY + linePoints[cord + 1]);
                }
              } else {
                dc.lineWidth = 1;
                dc.lineTo(item.x + posX + linePoints[0], item.y + posY + linePoints[1]);
                dc.lineTo(item.x + posX + linePoints[2], item.y + posY + linePoints[3]);
                dc.stroke();
                dc.strokeStyle = '#000';
              }
            }

            dc.closePath();
            dc.fill();

            break;

          case 'rect':
          default:
            if (drawingDesign[0] === 'static') {
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
      if (drawingItemName === 'windowTitleBar') {
        if (canTopData.activeWindow === item.id) {
          dc.fillStyle = drawingDesign[2][0];
        } else {
          dc.fillStyle = drawingDesign[2][1];
        }

        dc.textAlign = 'left';
        dc.fillText(item.title, item.x + 5, item.y + item.hotSpotOffsetY[index] - 6);
      }

      // Add the count of items in this window
      if (drawingItemName === 'windowStatusBar') {
        dc.fillStyle = drawingDesign[2][1];
        dc.textAlign = 'left';
        dc.fillText(item.items.length + ' item(s)', item.x + 5, item.y + item.height - 5);
      }

      index++;
    }
  }

  function createWindow (design, mode, title, x, y) {
    const windowItem = {};
    windowItem.title = title;
    windowItem.x = x;
    windowItem.y = y;
    windowItem.zOrder = canTopData.renderQueueSize;
    windowItem.drawingItems = ['windowTitleBar', 'windowContent', 'windowStatusBar', 'windowResize', 'windowClose', 'windowMaximize', 'windowMinimize'];
    windowItem.hotSpots = ['windowTitleBar', 'windowContent', 'windowStatusBar', 'windowResize', 'windowClose', 'windowMaximize', 'windowMinimize'];
    if (mode === 'data') {
      windowItem.items = generateDummyData(parseInt(Math.random() * 50) + 5);
    } else {
      windowItem.items = [];
    }
    windowItem.style = 'list';
    windowItem.type = 'window';
    windowItem.hotSpotOffsetY = [];
    windowItem.drawData = [];
    windowItem.isMinimized = false;
    windowItem.isMaximized = false;
    windowItem.oldX = x;
    windowItem.oldY = y;
    windowItem.mode = mode;

    let newId = 0;
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

    let offsetX = 0;
    let offsetY = 0;
    let dimensions = [];
    let drawingCoords = [];
    for (let index = 0; index < windowItem.drawingItems.length; index++) {
      drawingCoords = getArrayCopy(design[windowItem.drawingItems[index]][6]);
      if (design[windowItem.drawingItems[index]][0] === 'static') {
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

    // itemDesign, parent, positioningOn, fill-axis, scrollAble, action, datafield, datatype, initialValue, datastep
    windowItem.contentItems = [['windowScrollbarY', -1, 'x', 'fillY', false, false, false], ['windowScrollbarPlugY', 0, 'both', false, 'scrollY', false, 0.0], ['windowScrollbarX', -1, 'y', 'fillX', false, false, false], ['windowScrollbarPlugX', 2, 'both', false, 'scrollX', false, 0.0]];
    windowItem.contentBoundaries = [];
    windowItem.contentData = [];
    windowItem.contentActions = [];
    windowItem.contentHeight = (windowItem.items.length * 18);
    windowItem.contentWidth = 0;

    const measurementItem = windowItem.items[windowItem.items.length - 1];
    if (windowItem.items.length > 0) {
      windowItem.contentWidth = dc.measureText(measurementItem[1]).width + dc.measureText(measurementItem[2][0][3]).width + dc.measureText(measurementItem[2][1][3]).width + 135;
    }

    let designItem = [];
    let itemX = 0;
    let itemY = 0;
    let itemWidth = 0;
    let itemHeight = 0;

    // Those are used to offset and regulate items from filled controls
    offsetX = 0;
    offsetY = 0;
    let spaceX = windowItem.contentArea[2];
    let spaceY = windowItem.contentArea[3];

    let parent = -1;
    let index = 0;
    for (const contentItem of windowItem.contentItems) {
      designItem = design[contentItem[0]];
      parent = contentItem[1];
      itemX = offsetX;
      itemY = offsetY;

      // Define the height of the element based on the fillstyle
      // In case there is no parent set, deduct the available space of the content area
      if (parent === -1) {
        switch (contentItem[2]) {
          case 'x':
            itemX = designItem[4] < 0 ? windowItem.contentArea[2] + designItem[4] + offsetX : designItem[4] + offsetX;
            break;
          case 'y':
            itemY = designItem[5] < 0 ? windowItem.contentArea[3] + designItem[5] + offsetY : designItem[5] + offsetY;
            break;
          case 'both':
          default:
            itemX = windowItem.contentArea[2] + designItem[4];
            itemY = windowItem.contentArea[3] + designItem[5];
            break;
        }
      } else {
        switch (contentItem[2]) {
          case 'x':
            itemX = windowItem.contentBoundaries[parent][0] + designItem[4];
            itemY = windowItem.contentBoundaries[parent][1];
            break;
          case 'y':
            itemX = windowItem.contentBoundaries[parent][0];
            itemY = windowItem.contentBoundaries[parent][1] + designItem[5];
            break;
          case 'both':
          default:
            itemX = windowItem.contentBoundaries[parent][0] + designItem[4];
            itemY = windowItem.contentBoundaries[parent][1] + designItem[5];
            break;
        }
      }

      switch (contentItem[3]) {
        case 'fillY':
          itemWidth = designItem[6][2] - offsetX;
          itemHeight = spaceY - offsetY;

          if (parent === -1) {
            if (designItem[4] < 0) {
              spaceX -= itemWidth + 1;
            }

            if (designItem[4] >= 0) {
              offsetX += itemWidth + 1;
            }
          }
          break;
        case 'fillX':
          itemWidth = spaceX - offsetX;
          itemHeight = designItem[6][3] - offsetY;

          if (parent === -1) {
            if (designItem[5] < 0) {
              spaceY -= itemHeight + 1;
            }

            if (designItem[5] >= 0) {
              offsetY += itemHeight + 1;
            }
          }
          break;
        default:
          itemWidth = designItem[6][2];
          itemHeight = designItem[6][3];
          break;
      }

      // Add the item dimensions and spacing onto the content drawing list for rendering
      windowItem.contentBoundaries.push([itemX, itemY, itemWidth, itemHeight, itemX + itemWidth, itemY + itemHeight]);

      if (contentItem[4] !== false) {
        windowItem.contentActions.push([index, contentItem[4]]);
      }

      if (contentItem[5] === 'number' || contentItem[5] === 'percent') {
        windowItem.contentData.push([index, contentItem[5], contentItem[6], contentItem[7], contentItem[8]]);
      } else if (contentItem[5] !== false) {
        windowItem.contentData.push([index, contentItem[5], contentItem[6], contentItem[7], false]);
      }

      ++index;
    }

    // Push the available visible space onto the contentArea array
    windowItem.contentArea.push([offsetX, offsetY, spaceX, spaceY]);
    windowItem.contentArea.push([0, 0]);
    canTopData.renderQueue.push(windowItem);
    canTopData.renderQueueSize++;
  }

  const canvas = document.getElementById(canvasItem);
  const dc = canvas.getContext('2d');
  const design = getDesign(designName, useBackground, width, height, gridX, gridY);
  canvas.width = width;
  canvas.height = height;

  // Other values we work with
  const mouse = {};
  mouse.x = 0;
  mouse.y = 0;
  mouse.previousX = 0;
  mouse.previousY = 0;
  mouse.controlPressed = false;
  mouse.shiftPressed = false;

  if (useCustomMouse) {
    canvas.style.cursor = 'none';
  }

  // The threshold counts the pixels the mouse can offset from its initial click position so the click is still counted
  mouse.threshold = 15;
  mouse.offsetX = canvas.offsetLeft;
  mouse.offsetY = canvas.offsetTop;
  mouse.current = 'default';
  mouse.clickCount = 0;
  mouse.clickInterval = null;
  mouse.doubleClickSpeed = 220;

  mouse.realiseMovement = false;
  mouse.moveInterval = null;
  mouse.movementSpeed = 100 / 60;

  mouse.activeItem = null;
  mouse.cursorItem = null;
  mouse.cursorAt = [];
  mouse.cursorBlinkRate = 36;
  mouse.cursorBlink = 0;

  // Variables for grid drawing
  let gridPoint = [];
  const gridStart = [0, 0];
  const gridEnd = [canvas.width, canvas.height];

  // Helper function to generate gradients
  function createGradient (direction, x, y, width, height, colors) {
    const stepSize = (1.0 / (colors.length - 1)).toPrecision(2);
    let current = 1.0;
    let background = null;

    switch (direction) {
      case 'lr':
        colors = getArrayCopy(colors).reverse();
        background = dc.createLinearGradient(x, y, x + width, y);
        break;
      case 'rl':
        background = dc.createLinearGradient(x, y, x + width, y);
        break;
      case 'tb':
        colors = getArrayCopy(colors).reverse();
        background = dc.createLinearGradient(x, y, x, y + height);
        break;
      case 'bt':
      default:
        background = dc.createLinearGradient(x, y, x, y + height);
        break;
    }

    for (let index = 0; index < colors.length; index++) {
      background.addColorStop(current, colors[index]);
      current -= stepSize;
    }

    return background;
  }

  // Beginn of generic helper functions
  function generateDummyData (count) {
    const dummyItems = [];

    // Create the date
    const dateObject = new Date();
    const day = dateObject.getDate() < 10 ? '0' + dateObject.getDate() : dateObject.getDate();
    const month = dateObject.getMonth() < 9 ? '0' + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    const date = [month, day, year].join('/');

    // Create the timestamp
    const hours = dateObject.getHours() < 10 ? '0' + dateObject.getHours() : dateObject.getHours();
    const minutes = dateObject.getMinutes() < 10 ? '0' + dateObject.getMinutes() : dateObject.getMinutes();
    const seconds = dateObject.getSeconds() < 10 ? '0' + dateObject.getSeconds() : dateObject.getSeconds();
    const time = [hours, minutes, seconds].join(':');

    // Create folders
    const folderItems = Math.round(count / 10);
    let dataIndex = 0;
    let item = 0;

    for (item = 0; item < folderItems; item++) {
      dataIndex = item;
      dummyItems.push([0, 'Folder Item ' + item, [[parseInt(month), parseInt(day), year, date], [parseInt(hours), parseInt(minutes), parseInt(seconds), time], dataIndex]]);
    }

    // Create files
    let fileSize = 0;
    const fileItems = count - folderItems;
    for (item = 0; item < fileItems; item++) {
      fileSize = (Math.random() * 12500) + 1;
      dummyItems.push([1, 'File Item ' + item, [[parseInt(month), parseInt(day), year, date], [hours, minutes, seconds, time], parseFloat((fileSize / 1024).toFixed(2))]]);
    }

    return dummyItems;
  }

  // Create and return a copy of an array item
  function getArrayCopy (arrayItem) {
    const arrayCopy = [];
    const items = arrayItem.length;
    let arraySubItems = 0;
    for (let index = 0; index < items; index++) {
      if (typeof (arrayItem[index]) === 'object') {
        const subArray = [];
        arraySubItems = arrayItem[index].length;
        for (let subIndex = 0; subIndex < arraySubItems; subIndex++) {
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
  function getDynamicOffset (drawingDesign, item) {
    let posX = drawingDesign[2][0];
    let posY = drawingDesign[2][1];
    switch (drawingDesign[0]) {
      case 'dynamic':
        switch (drawingDesign[1]) {
          case 'x':
            posX = posX < 0 ? item.width + drawingDesign[2][0] : posX;
            break;
          case 'y':
            posY = posY < 0 ? item.height + drawingDesign[2][1] : posY;
            break;
          case 'both':
            posX = posX < 0 ? item.width + drawingDesign[2][0] : posX;
            posY = posY < 0 ? item.height + drawingDesign[2][1] : posY;
        }
        break;
      default:
        posX = 0;
        posY = 0;
        break;
    }

    return [posX, posY];
  }

  // Get window by id
  function getWindowById (id) {
    for (const item of canTopData.renderQueue) {
      if (item.type === 'window' && item.id === id) {
        return item;
      }
    }
  }

  // Calculate mouse px to grid
  function getMouseGridPoint () {
    return [Math.floor((mouse.x - mouse.offsetX) / gridX), Math.floor((mouse.y - mouse.offsetY) / gridY)];
  }

  // Calculate px to grid
  function getGridPoint (x, y) {
    return [Math.floor(x / gridX), Math.floor(y / gridY)];
  }

  // Get the index of the last item which can be selected depending
  // on the content boundaries information of a window
  function getLastItemIndex (windowItem) {
    const contentBoundaries = windowItem.contentBoundaries;
    const contentItems = windowItem.contentItems;
    let boundary = [];
    let contentItem = [];

    const mX = mouse.x - (windowItem.contentArea[0] + mouse.offsetX);
    const mY = mouse.y - (windowItem.contentArea[1] + mouse.offsetY);
    let lockedItem = null;

    let finalOffsetX = 0;
    let finalOffsetY = 0;

    for (let item = 0; item < contentBoundaries.length; item++) {
      boundary = contentBoundaries[item];
      contentItem = contentItems[item];
      // Check if the item is scrollable
      if (!contentItem[4]) {
        finalOffsetX = 0;
        finalOffsetY = 0;
      } else {
        // If not, does its parent scroll?
        if (contentItem[1] !== -1) {
          if (contentItems[contentItem[1]][4]) {
            finalOffsetX = windowItem.contentArea[5][0];
            finalOffsetY = windowItem.contentArea[5][1];
          } else {
            finalOffsetX = 0;
            finalOffsetY = 0;
          }
        } else {
          finalOffsetX = windowItem.contentArea[5][0];
          finalOffsetY = windowItem.contentArea[5][1];
        }
      }

      if (mX >= (boundary[0] - finalOffsetX) && mX <= (boundary[4] - finalOffsetX) && mY >= (boundary[1] - finalOffsetY) && mY <= (boundary[5] - finalOffsetY)) {
        lockedItem = item;
      }
    }

    return lockedItem;
  }

  // Create the info item object for the currently selected item
  function getItemInfoAtIndex (lastItem, activeItem, itemIndex) {
    const item = {};
    item.type = lastItem[0];
    item.itemIndex = itemIndex;
    item.pointer = 0;
    item.parentWindow = activeItem.id;
    item.selection = [0, 0];
    item.controlPressed = false;
    item.shiftPressed = false;

    for (let index = 0; index < activeItem.contentData.length; index++) {
      if (activeItem.contentData[index][0] === itemIndex) {
        item.data = activeItem.contentData[index];
        item.pointer = index;
        item.x = activeItem.contentArea[0] + activeItem.contentBoundaries[itemIndex][0];
        item.y = activeItem.contentArea[1] + activeItem.contentBoundaries[itemIndex][1];
        item.width = activeItem.contentBoundaries[itemIndex][2];
        item.height = activeItem.contentBoundaries[itemIndex][3];
        break;
      }
    }

    for (let index = 0; index < activeItem.contentActions.length; index++) {
      if (activeItem.contentActions[index][0] === itemIndex) {
        item.action = activeItem.contentActions[index][1];
        break;
      }
    }

    return item;
  }

  // Beginn of drawing routines
  function drawBackground () {
    let drawType = false;
    switch (design.background[0]) {
      case 'draw':
      default:
        drawType = design.background[1].split('_', 2);
        switch (drawType[0]) {
          case 'gradient':
            dc.fillStyle = createGradient(drawType[1], 0, 0, design.background[2], design.background[3], design.background[4]);
            break;
          case 'solid':
          default:
            dc.fillStyle = design.background[4][0];
            break;
        }

        dc.fillRect(0, 0, width, height);

        if (useBackground && design.bg && design.bg.complete) {
          dc.drawImage(design.bg, 0, 0);
        }
    }
  }

  function drawGrid () {
    let stepX = 0;
    let stepY = gridY;

    dc.lineWidth = 0.6;
    dc.strokeStyle = 'rgba(255, 255, 255, 0.1)';

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

  function drawActiveCell () {
    gridPoint = getMouseGridPoint();
    dc.fillStyle = 'rgba(200, 200, 0, 0.4)';
    dc.fillRect(gridPoint[0] * gridX, gridPoint[1] * gridY, gridX, gridY);
  }

  function drawMouse () {
    let activeMouse = [];
    switch (mouse.current) {
      case 'text':
        activeMouse = design.textMouse;
        break;
      case 'default':
      default:
        activeMouse = design.defaultMouse;
        break;
    }

    const drawingCords = activeMouse[4];

    dc.fillStyle = activeMouse[0];
    dc.strokeStyle = activeMouse[1];
    dc.lineJoin = activeMouse[2];

    dc.moveTo(mouse.x, mouse.y);
    dc.beginPath();

    switch (activeMouse[3]) {
      case 'line':
        dc.lineWidth = 2;
        for (let index = 0; index < drawingCords.length; index += 2) {
          dc.lineTo(mouse.x + drawingCords[index] - mouse.offsetX, mouse.y + drawingCords[index + 1] - mouse.offsetY);
        }

        dc.closePath();
        dc.stroke();
        dc.fill();
        break;
      case 'stroke':
        dc.lineWidth = 1;
        for (let index = 0; index < drawingCords.length; index += 2) {
          dc.lineTo(mouse.x + drawingCords[index] - mouse.offsetX, mouse.y + drawingCords[index + 1] - mouse.offsetY);
        }

        dc.closePath();
        dc.stroke();
        break;
    }

    dc.strokeStyle = '#000';
  }

  // Mouse wheel handler
  function checkWheel (evt) {
    if (canTopData.activeWindow === null) {
      return;
    }

    evt.preventDefault();

    const cantopWindow = getWindowById(canTopData.activeWindow);

    if ((mouse.x < cantopWindow.x || mouse.x > cantopWindow.x + cantopWindow.width) || (mouse.y < cantopWindow.y || mouse.y > cantopWindow.y + cantopWindow.height)) {
      return;
    }

    if (mouse.shiftPressed && cantopWindow.contentWidth > cantopWindow.contentArea[4][2]) {
      const scrollStep = cantopWindow.contentArea[1] / 5;
      cantopWindow.contentArea[5][0] += evt.deltaY > 0 ? scrollStep : -scrollStep;

      // Check if we have a scrollbar
      let scrollBar = -1;
      for (let index = 0; index < cantopWindow.contentItems.length; index++) {
        // Select a scrollbar plug for animation which parent item parentIndex is -1 (the main window)
        if (cantopWindow.contentItems[index][0] === 'windowScrollbarPlugX' && cantopWindow.contentItems[cantopWindow.contentItems[index][1]][1] === -1) {
          scrollBar = index;
          break;
        }
      }

      if (cantopWindow.contentArea[5][0] < 0) {
        cantopWindow.contentArea[5][0] = 0;
      } else if (cantopWindow.contentArea[5][0] >= cantopWindow.contentWidth - cantopWindow.contentArea[4][2]) {
        cantopWindow.contentArea[5][0] = cantopWindow.contentWidth - cantopWindow.contentArea[4][2];
      }

      if (scrollBar !== -1) {
        let scrollProgress = 0;
        if (cantopWindow.contentArea[5][0] !== 0) {
          scrollProgress = cantopWindow.contentArea[5][0] / (cantopWindow.contentWidth - cantopWindow.contentArea[4][2]);
        }

        const itemBaseX = design.windowScrollbarPlugX[5];
        const itemWidth = cantopWindow.contentBoundaries[scrollBar][4];
        const scrollHeight = cantopWindow.contentArea[4][2] - (itemBaseX + itemWidth);

        cantopWindow.contentBoundaries[scrollBar][0] = scrollHeight * scrollProgress;
        cantopWindow.contentBoundaries[scrollBar][5] = (scrollHeight * scrollProgress) + itemBaseX + itemWidth;

        if (cantopWindow.contentBoundaries[scrollBar][0] <= itemBaseX) {
          cantopWindow.contentBoundaries[scrollBar][0] = itemBaseX;
          cantopWindow.contentBoundaries[scrollBar][5] = cantopWindow.contentBoundaries[scrollBar][4] + itemBaseX + itemWidth;
        }

        cantopWindow.contentItems[scrollBar][6] = scrollProgress;
      }

      return;
    }

    if (!mouse.shiftPressed && cantopWindow.contentHeight > cantopWindow.contentArea[3]) {
      const scrollStep = cantopWindow.contentArea[3] / 5;
      cantopWindow.contentArea[5][1] += evt.deltaY > 0 ? scrollStep : -scrollStep;

      // Check if we have a scrollbar
      let scrollBar = -1;
      for (let index = 0; index < cantopWindow.contentItems.length; index++) {
        // Select a scrollbar plug for animation which parent item parentIndex is -1 (the main window)
        if (cantopWindow.contentItems[index][0] === 'windowScrollbarPlugY' && cantopWindow.contentItems[cantopWindow.contentItems[index][1]][1] === -1) {
          scrollBar = index;
          break;
        }
      }

      if (cantopWindow.contentArea[5][1] < 0) {
        cantopWindow.contentArea[5][1] = 0;
      } else if (cantopWindow.contentArea[5][1] >= cantopWindow.contentHeight - cantopWindow.contentArea[4][3]) {
        cantopWindow.contentArea[5][1] = cantopWindow.contentHeight - cantopWindow.contentArea[4][3];
      }

      if (scrollBar !== -1) {
        let scrollProgress = 0;
        if (cantopWindow.contentArea[5][1] !== 0) {
          scrollProgress = cantopWindow.contentArea[5][1] / (cantopWindow.contentHeight - cantopWindow.contentArea[4][3]);
        }

        const itemBaseY = design.windowScrollbarPlugY[5];
        const itemHeight = cantopWindow.contentBoundaries[scrollBar][3];
        const scrollHeight = cantopWindow.contentArea[4][3] - (itemBaseY + itemHeight);

        cantopWindow.contentBoundaries[scrollBar][1] = scrollHeight * scrollProgress;
        cantopWindow.contentBoundaries[scrollBar][5] = (scrollHeight * scrollProgress) + itemBaseY + itemHeight;

        if (cantopWindow.contentBoundaries[scrollBar][1] <= itemBaseY) {
          cantopWindow.contentBoundaries[scrollBar][1] = itemBaseY;
          cantopWindow.contentBoundaries[scrollBar][5] = cantopWindow.contentBoundaries[scrollBar][3] + itemBaseY + itemHeight;
        }

        cantopWindow.contentItems[scrollBar][6] = scrollProgress;
      }
    }
  }

  // Click handler to check count of clicks
  function checkClick (evt) {
    mouse.clickCount++;
    if (mouse.clickInterval === null) {
      mouse.previousX = evt.clientX;
      mouse.previousY = evt.clientY;
      mouse.shiftPressed = false;
      mouse.controlPressed = false;
      mouse.activeItem = null;
      mouse.clickInterval = setInterval(recognizeDoubleClick, mouse.doubleClickSpeed);
    }

    doClick();
  }

  // Timed function to check for double click
  function recognizeDoubleClick () {
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
  function doClick () {
    const mX = mouse.x - mouse.offsetX;
    const mY = mouse.y - mouse.offsetY;

    let activeItem = {};
    let zOrderIndex = -1;
    let pressedItem = false;

    // Reset the active selection on click and select later
    canTopData.activeWindow = null;
    let index = canTopData.renderQueueSize;

    // Check window clicks
    for (const item of canTopData.renderQueue) {
      if (mX >= item.x && mX <= (item.x + item.width) && mY >= item.y && mY <= (item.y + item.height)) {
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
      // Reorder the window layering on window activation
      canTopData.renderQueue[zOrderIndex].zOrder = canTopData.renderQueueSize - 1;
      canTopData.renderQueue.push(canTopData.renderQueue[zOrderIndex]);
      canTopData.renderQueue.splice(zOrderIndex, 1);
      index = canTopData.renderQueueSize - 1;
      while (index--) {
        canTopData.renderQueue[index].zOrder = index;
      }

      // Check the hotspots of the active window
      let hotSpot = activeItem.hotSpots.length;
      index = 0;

      while (hotSpot--) {
        const drawDataSize = activeItem.drawData.length;
        const drawingDesign = design[activeItem.hotSpots[hotSpot]];

        for (index = 0; index < drawDataSize; index++) {
          if (activeItem.hotSpots[hotSpot] === activeItem.drawData[index][0]) {
            break;
          }
        }

        const drawingCoords = activeItem.drawData[index][1];

        dc.beginPath();

        for (let drawingIndex = 0; drawingIndex < drawingDesign[3].length; drawingIndex++) {
          const dynamicCoords = getDynamicOffset(drawingDesign, activeItem);
          const posX = dynamicCoords[0];
          const posY = dynamicCoords[1];

          const linePoints = drawingCoords[drawingIndex];
          const drawingSteps = linePoints.length;
          // Phantom drawing
          switch (drawingDesign[3][0]) {
            case 'line':
              if (drawingDesign[0] === 'static') {
                for (let cord = 0; cord < drawingSteps; cord += 2) {
                  dc.lineTo(activeItem.x + linePoints[cord], activeItem.y + linePoints[cord + 1]);
                }

                dc.lineTo(activeItem.x + linePoints[0], activeItem.y + linePoints[1]);
              } else {
                dc.moveTo(activeItem.x + posX + linePoints[0], activeItem.x + posY + linePoints[1]);
                for (let cord = 0; cord < drawingSteps; cord += 2) {
                  dc.lineTo(activeItem.x + posX + linePoints[cord], activeItem.y + posY + linePoints[cord + 1]);
                }
              }
              break;

            case 'rect':
            default:
              if (drawingDesign[0] === 'static') {
                dc.rect(activeItem.x + drawingCoords[drawingIndex][0], activeItem.y + drawingCoords[drawingIndex][1], activeItem.width, activeItem.drawData[index][2][3]);
              } else {
                dc.rect(activeItem.x + posX + drawingCoords[drawingIndex][0], activeItem.y + posY + drawingCoords[drawingIndex][1], drawingCoords[drawingIndex][2], drawingCoords[drawingIndex][3]);
              }
              break;
          }
        }

        dc.closePath();

        if (dc.isPointInPath(mX, mY)) {
          pressedItem = activeItem.hotSpots[hotSpot];
          break;
        }
      }
    }

    // Clean any active cursor positioning on window change
    if (mouse.cursorItem !== null) {
      if (canTopData.activeWindow !== mouse.cursorItem.parentWindow) {
        mouse.cursorItem = null;
        mouse.cursorAt = [0, 0];
      }
    }

    // Do something with the pressed Item
    if (pressedItem) {
      if (mouse.clickCount > 1) {
        clearInterval(mouse.clickInternval);
        mouse.clickInternval = null;

        // Double click counted
        console.log('in two mouseclicks');

        if (mouse.activeItem) {
          console.log('Pressed item: ' + activeItem.title + ' / ' + pressedItem);
        }

        mouse.clickCount = 0;
        return;
      } else {
        if (mouse.clickCount === 1) {
          // Single mouse click
          console.log('in one mouseclick');
          console.log('Pressed item: ' + activeItem.title + ' / ' + pressedItem);

          if (pressedItem === 'windowMaximize') {
            let newWidth = 0;
            let newHeight = 0;
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

            // Update the mouse cursor position and cursorItem itself
            if (mouse.cursorItem !== null) {
              mouse.cursorItem = getItemInfoAtIndex(mouse.cursorItem.type, activeItem, mouse.cursorItem.itemIndex);
              const textWidth = dc.measureText(mouse.cursorItem.data[1].split('\n', 1)[0]).width;
              mouse.cursorAt = [mouse.cursorItem.x + 3 + textWidth, mouse.cursorItem.y + 3, mouse.cursorAt[2]];
            }

            return;
          } else if (pressedItem === 'windowContent' || pressedItem === 'windowScrollbarX' || pressedItem === 'windowScrollbarY') {
            const lockedItem = getLastItemIndex(activeItem);

            // Clean any active cursor positioning on content click
            if (mouse.cursorItem !== null) {
              mouse.cursorItem = null;
              mouse.cursorAt = [0, 0, 0];
            }

            // Handle actions for the last locked content item
            if (lockedItem !== null) {
              const lastItem = activeItem.contentItems[lockedItem];
              document.removeEventListener('keydown', handleInputFieldInput);
              console.log('Pressed content item: ' + activeItem.title + ' / ' + lastItem[0]);

              let text = '';
              let textWidth = 0;
              let letterWidth = 0;
              let hasCursor = false;

              let mouseX = 0;

              switch (lastItem[0]) {
                case 'windowScrollbarPlugY':
                case 'windowScrollbarPlugX':
                  mouse.previousX = mouse.x;
                  mouse.previousY = mouse.y;
                  mouse.moveInterval = setInterval(realiseMouseMovement, mouse.movementSpeed);
                  mouse.activeItem = getItemInfoAtIndex(lastItem, activeItem, lockedItem);
                  break;
                case 'contentInputField':
                  mouse.cursorItem = getItemInfoAtIndex(lastItem, activeItem, lockedItem);
                  text = mouse.cursorItem.data[1];
                  textWidth = 0;
                  letterWidth = 0;
                  mouseX = mouse.x - (mouse.offsetX + mouse.cursorItem.x);
                  hasCursor = false;

                  for (let letter = 0; letter < text.length; letter++) {
                    letterWidth = dc.measureText(text.slice(0, letter)).width;
                    if (mouseX <= letterWidth + 4) {
                      mouse.cursorAt = [mouse.cursorItem.x + letterWidth + 3, mouse.cursorItem.y + 3, letter - 1];
                      hasCursor = true;
                      break;
                    }
                  }

                  if (!hasCursor) {
                    textWidth = dc.measureText(text).width;
                    mouse.cursorAt = [mouse.cursorItem.x + 3 + textWidth, mouse.cursorItem.y + 3, text.length - 1];
                  }

                  document.addEventListener('keydown', handleInputFieldInput);
                  break;
                default:
                  mouse.activeItem = null;
                  break;
              }
            }
            return;
          }
        }

        if (mouse.realiseMovement) {
          if (pressedItem === 'windowTitleBar') {
            if (mouse.moveInterval === null && !activeItem.isMaximized) {
              mouse.previousX = mouse.x;
              mouse.previousY = mouse.y;
              mouse.moveInterval = setInterval(realiseMouseMovement, mouse.movementSpeed);
              mouse.activeItem = activeItem;
            }
            return;
          } else if (pressedItem === 'windowContent') {
            const lockedItem = getLastItemIndex(activeItem);

            if (lockedItem !== null) {
              const lastItem = activeItem.contentItems[lockedItem];
              console.log('Pressed item: ' + activeItem.title + ' / ' + lastItem[0]);

              switch (lastItem[0]) {
                case 'windowScrollbarPlugY':
                case 'windowScrollbarPlugX':
                  mouse.previousX = mouse.x;
                  mouse.previousY = mouse.y;
                  mouse.moveInterval = setInterval(realiseMouseMovement, mouse.movementSpeed);
                  mouse.activeItem = getItemInfoAtIndex(lastItem, activeItem, lockedItem);
                  break;
              }
            }
          }

          if (pressedItem === 'windowResize') {
            if (mouse.moveInterval === null) {
              mouse.previousX = mouse.x;
              mouse.previousY = mouse.y;
              mouse.moveInterval = setInterval(realiseMouseResize, mouse.movementSpeed);
              mouse.activeItem = activeItem;
            }
            return;
          } else if (pressedItem === 'windowClose') {
            if (mouse.moveInterval === null) {
              for (let trap = 0; trap < canTopData.mouseTraps.length; trap++) {
                if (canTopData.mouseTraps[trap][0] === activeItem.id) {
                  canTopData.mouseTraps.splice(trap, 1);
                  --trap;
                }
              }

              canTopData.renderQueue.splice(activeItem.zOrder);
              --canTopData.renderQueueSize;

              index = canTopData.renderQueueSize - 1;
              if (index > 0) {
                while (index--) {
                  canTopData.renderQueue[index].zOrder = index;
                }
              }
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
      const item = canTopData.renderItems[index];
      if (mX >= item.x && mX <= (item.x + item.width) && mY >= item.y && mY <= (item.y + item.height)) {
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
  function activateMovement (evt) {
    evt.preventDefault();
    mouse.realiseMovement = true;
    doClick();
  }

  function deactivateMovement (evt) {
    evt.preventDefault();
    mouse.realiseMovement = false;
  }

  function realiseMouseMovement () {
    if (!mouse.realiseMovement) {
      clearInterval(mouse.moveInterval);
      mouse.moveInterval = null;
      mouse.activeItem = null;
      return;
    }

    if (mouse.activeItem !== null) {
      switch (mouse.activeItem.type) {
        case 'window':
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

          for (let trapIndex = 0; trapIndex < canTopData.mouseTraps.length; trapIndex++) {
            const trap = canTopData.mouseTraps[trapIndex];
            const boundary = mouse.activeItem.contentBoundaries[trap[1]];
            if (trap[0] === mouse.activeItem.id) {
              canTopData.mouseTraps[trapIndex] = [trap[0], trap[1], mouse.activeItem.contentArea[0] + boundary[0], mouse.activeItem.contentArea[1] + boundary[1], trap[4], trap[5], trap[6]];
            }
          }

          break;
        case 'windowScrollbarPlugY':
          if (mouse.activeItem.action === 'scrollY') {
            const parentWindow = getWindowById(mouse.activeItem.parentWindow);
            const item = parentWindow.contentBoundaries[mouse.activeItem.itemIndex];
            const itemBaseY = design[mouse.activeItem.type][5];
            const itemHeight = item[3];
            const scrollHeight = parentWindow.contentArea[4][3] - itemBaseY;

            item[1] -= mouse.previousY - mouse.y;
            item[5] -= mouse.previousY - mouse.y;
            let scrollProgress = 0;

            if (item[1] <= itemBaseY) {
              item[1] = itemBaseY;
              item[5] = item[3] + itemBaseY + itemHeight;
              scrollProgress = 0;
            } else if (item[1] >= scrollHeight) {
              item[1] = scrollHeight;
              item[5] = scrollHeight + itemHeight + itemBaseY;
              scrollProgress = 1;
            } else {
              scrollProgress = item[1] / scrollHeight;
            }

            // Maximum positive scroll in Y
            const contentHeight = parentWindow.contentHeight + parentWindow.contentArea[4][1];
            if (parentWindow.contentArea[5][1] <= contentHeight - parentWindow.contentArea[4][3]) {
              parentWindow.contentArea[5][1] = (contentHeight - parentWindow.contentArea[4][3]) * scrollProgress;
            } else if (parentWindow.contentArea[4][3] < contentHeight) {
              parentWindow.contentArea[5][1] = contentHeight - parentWindow.contentArea[4][3];
            } else {
              item[1] = itemBaseY;
            }

            parentWindow.contentItems[mouse.activeItem.itemIndex][6] = scrollProgress;
          }

          break;
        case 'windowScrollbarPlugX':
          if (mouse.activeItem.action === 'scrollX') {
            const parentWindow = getWindowById(mouse.activeItem.parentWindow);
            const item = parentWindow.contentBoundaries[mouse.activeItem.itemIndex];
            const itemBaseX = design[mouse.activeItem.type][4];
            const itemWidth = item[2];
            const scrollWidth = parentWindow.contentArea[4][2] - itemBaseX - itemWidth;

            // Dynamically get the boundary for scrolling

            item[0] -= mouse.previousX - mouse.x;
            item[4] -= mouse.previousX - mouse.x;
            let scrollProgress = 0;

            if (item[0] <= itemBaseX) {
              item[0] = itemBaseX;
              item[4] = item[2] + itemBaseX + itemWidth;
              scrollProgress = 0;
            } else if (item[0] >= scrollWidth) {
              item[0] = scrollWidth;
              item[4] = scrollWidth + itemWidth + itemBaseX;
              scrollProgress = 1;
            } else {
              scrollProgress = item[0] / scrollWidth;
            }

            // Maximum positive scroll in X and scolling
            const contentWidth = parentWindow.contentWidth + parentWindow.contentArea[4][0];
            if (parentWindow.contentArea[5][0] <= contentWidth - parentWindow.contentArea[4][2]) {
              parentWindow.contentArea[5][0] = (contentWidth - parentWindow.contentArea[4][2]) * scrollProgress;
            } else if (parentWindow.contentArea[4][2] < contentWidth) {
              parentWindow.contentArea[5][0] = contentWidth - parentWindow.contentArea[4][2];
            } else {
              item[0] = itemBaseX;
            }

            parentWindow.contentItems[mouse.activeItem.itemIndex][6] = scrollProgress;
          }
          break;
      }

      if (mouse.cursorItem !== null) {
        if (mouse.activeItem.id === mouse.cursorItem.parentWindow) {
          mouse.cursorAt[0] -= mouse.previousX - mouse.x;
          mouse.cursorAt[1] -= mouse.previousY - mouse.y;
          mouse.cursorItem.x -= mouse.previousX - mouse.x;
          mouse.cursorItem.y -= mouse.previousY - mouse.y;
        }
      }

      mouse.previousX = mouse.x;
      mouse.previousY = mouse.y;
    }
  }

  function realiseMouseResize () {
    if (!mouse.realiseMovement) {
      clearInterval(mouse.moveInterval);
      mouse.moveInterval = null;
      mouse.activeItem = null;
      return;
    }

    if (mouse.activeItem !== null) {
      let width = mouse.activeItem.width - (mouse.previousX - mouse.x);
      let height = mouse.activeItem.height - (mouse.previousY - mouse.y);

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
      sizeWindowContent(mouse.activeItem, width, height);

      const cantopWindow = mouse.activeItem;
      for (let index = 0; index < cantopWindow.contentItems.length; index++) {
        // Select a scrollbar plug for animation which parent item parentIndex is -1 (the main window)
        const item = cantopWindow.contentItems[index];
        if (item[0] === 'windowScrollbarPlugY') {
          const scrollProgress = item[6];
          const itemBaseY = design[item[0]][5];

          if (scrollProgress === 0) {
            cantopWindow.contentBoundaries[index][1] = design.windowScrollbarPlugY[5];
          } else if (scrollProgress === 1) {
            cantopWindow.contentBoundaries[index][1] = cantopWindow.contentArea[4][3] - cantopWindow.contentBoundaries[index][3] - design.windowScrollbarPlugY[5];
          } else {
            cantopWindow.contentBoundaries[index][1] = (cantopWindow.contentArea[4][3] - cantopWindow.contentBoundaries[index][3]) * scrollProgress;
          }

          cantopWindow.contentBoundaries[index][5] = ((cantopWindow.contentArea[4][3] + cantopWindow.contentBoundaries[index][3] - itemBaseY) * scrollProgress) - itemBaseY;
        } else if (item[0] === 'windowScrollbarPlugX') {
          const scrollProgress = item[6];
          const itemBaseX = design[item[0]][4];

          if (scrollProgress === 0) {
            cantopWindow.contentBoundaries[index][0] = design.windowScrollbarPlugX[4];
          } else if (scrollProgress === 1) {
            cantopWindow.contentBoundaries[index][0] = cantopWindow.contentArea[4][2] - cantopWindow.contentBoundaries[index][2] - design.windowScrollbarPlugX[4] - itemBaseX;
          } else {
            cantopWindow.contentBoundaries[index][0] = ((cantopWindow.contentArea[4][2] - cantopWindow.contentBoundaries[index][2] + itemBaseX) * scrollProgress) - itemBaseX;
          }

          cantopWindow.contentBoundaries[index][4] = ((cantopWindow.contentArea[4][2] + cantopWindow.contentBoundaries[index][2] - itemBaseX) * scrollProgress) - itemBaseX;
        }
      }
    }
  }

  // Interactions
  function resizeWindowItem (activeItem, newWidth, newHeight) {
    activeItem.width = newWidth;
    activeItem.height = newHeight;

    let index = 0;
    for (const drawData of activeItem.drawData) {
      const drawDesign = design[drawData[0]];
      let drawIndexes = drawDesign[3].length;
      let usedPixels = newHeight;

      for (let subIndex = 0; subIndex < activeItem.hotSpotOffsetY.length; subIndex++) {
        if (index !== subIndex) {
          usedPixels -= activeItem.hotSpotOffsetY[subIndex];
        } else {
          break;
        }
      }

      if (drawDesign[0] === 'static') {
        switch (drawDesign[1]) {
          case 'both':
            while (drawIndexes--) {
              if (drawDesign[3][drawIndexes] === 'rect') {
                drawData[1][0][3] = usedPixels;
                drawData[2][3] = usedPixels;
                activeItem.hotSpotOffsetY[index] = usedPixels;
              }
            }
            break;
          case 'x':
            if (index > 1) {
              usedPixels += drawData[1][0][3];
            }
            drawData[1][0][1] = newHeight - usedPixels;
            drawData[2][1] = usedPixels;
            break;
          default:
            break;
        }
      }

      ++index;
    }

    // Update the dimensions of the contentArea for content drawing
    // and size the window content area content according to rules
    // activeItem.contentArea = [activeItem.x, activeItem.y + activeItem.hotSpotOffsetY[0], newWidth, activeItem.drawData[1][2][3] - activeItem.hotSpotOffsetY[0], activeItem.contentArea[4], activeItem.contentArea[5]];
    sizeWindowContent(activeItem, newWidth, newHeight);
  }

  // Size window content area content according to ruleset
  function sizeWindowContent (windowItem, width, height) {
    // General variables
    let itemX = 0;
    let itemY = 0;
    let itemWidth = 0;
    let itemHeight = 0;

    // Those are used to offset and regulate items from filled controls
    let offsetX = 0;
    let offsetY = 0;
    let spaceX = windowItem.contentArea[2];
    let spaceY = windowItem.contentArea[3];

    for (let index = 0; index < windowItem.contentItems.length; index++) {
      const contentItem = windowItem.contentItems[index];
      const designItem = design[contentItem[0]];

      const parent = contentItem[1];
      const designBoundaries = designItem[designItem.length - 1];

      // Define the height of the element based on the fillstyle
      // In case there is no parent set, deduct the available space of the content area
      switch (contentItem[3]) {
        case 'fillY':
          itemWidth = designItem[6][2] - offsetX;
          itemHeight = spaceY - offsetY;
          if (parent === -1 && designItem[4] < 0) {
            spaceX -= itemWidth + 1;
          }
          break;
        case 'fillX':
          itemWidth = spaceX - offsetX;
          itemHeight = designItem[6][3] - offsetY;

          if (parent === -1 && designItem[5] < 0) {
            spaceY -= itemHeight + 1;
          }
          break;
        case 'pos':
          itemWidth = windowItem.contentBoundaries[index][2];
          itemHeight = windowItem.contentBoundaries[index][3];
          break;
        case 'both':
        default:
          itemWidth = designBoundaries[2];
          itemHeight = designBoundaries[3];
          break;
      }

      // Prepare the item X and Y coordinate
      if (parent === -1) {
        switch (contentItem[2]) {
          case 'x':
            itemX = designItem[4] < 0 ? windowItem.contentArea[2] + designItem[4] + offsetX : designItem[4] + offsetX;
            itemY = offsetY;
            break;
          case 'y':
            itemY = designItem[5] < 0 ? windowItem.contentArea[3] + designItem[5] + offsetY : designItem[5] + offsetY;
            itemX = offsetX;
            break;
          case 'both':
            if (contentItem[3] === 'pos') {
              itemX = windowItem.contentBoundaries[index][0];
              itemY = windowItem.contentBoundaries[index][1];
            } else {
              itemX = designItem[4] < 0 ? windowItem.contentArea[2] + designItem[4] : designItem[4];
              itemY = designItem[5] < 0 ? windowItem.contentArea[3] + designItem[5] : designItem[5];
            }
            break;
        }

        switch (contentItem[3]) {
          case 'fillY':
            if (designItem[4] >= 0) {
              offsetX += itemWidth + 1;
            }
            break;
          case 'fillX':
            if (designItem[5] >= 0) {
              offsetY += itemHeight + 1;
            }
            break;
        }
      } else {
        switch (contentItem[2]) {
          case 'x':
            itemX = windowItem.contentBoundaries[parent][0] + designItem[4];
            itemY = windowItem.contentBoundaries[parent][1];
            break;
          case 'y':
            itemX = windowItem.contentBoundaries[parent][0];
            itemY = windowItem.contentBoundaries[parent][1] + designItem[5];
            break;
          case 'both':
            itemX = windowItem.contentBoundaries[parent][0] + designItem[4];
            itemY = windowItem.contentBoundaries[parent][1] + designItem[5];
            break;
          default:
            break;
        }
      }

      // Save the new dimensions for rendering
      windowItem.contentBoundaries[index] = [itemX, itemY, itemWidth, itemHeight, itemX + itemWidth, itemY + itemHeight];
    }

    // windowItem.contentArea = [windowItem.x, windowItem.y + windowItem.hotSpotOffsetY[0], width, windowItem.drawData[1][2][3] - windowItem.hotSpotOffsetY[0], [offsetX, offsetY, spaceX, spaceY], [0, 0]];
    windowItem.contentArea = [windowItem.x, windowItem.y + windowItem.hotSpotOffsetY[0], width, windowItem.drawData[1][2][3] - windowItem.hotSpotOffsetY[0], [offsetX, offsetY, spaceX, spaceY], windowItem.contentArea[5]];

    // Restore scrollbar positions after contentarea resize
    let indexScrollPlugX = -1;
    let indexScrollPlugY = -1;

    for (let index = 0; index < windowItem.contentItems.length; ++index) {
      switch (windowItem.contentItems[index][0]) {
        case 'windowScrollbarPlugX':
          indexScrollPlugX = index;
          break;
        case 'windowScrollbarPlugY':
          indexScrollPlugY = index;
          break;
        default:
          break;
      }
    }

    if (indexScrollPlugY !== -1) {
      const itemBaseY = design.windowScrollbarPlugY[5];

      if (windowItem.contentArea[3] >= windowItem.contentHeight) {
        windowItem.contentArea[5][1] = 0;
      } else if (windowItem.contentArea[3] <= windowItem.contentHeight) {
        windowItem.contentArea[5][1] = (windowItem.contentHeight - windowItem.contentArea[3]) * windowItem.contentItems[indexScrollPlugY][6];
      }

      if (windowItem.contentItems[indexScrollPlugY][6] === 0 || windowItem.contentArea[5][1] === 0) {
        windowItem.contentBoundaries[indexScrollPlugY][1] = itemBaseY;
      } else if (windowItem.contentItems[indexScrollPlugY][6] === 1) {
        windowItem.contentBoundaries[indexScrollPlugY][1] = (windowItem.contentArea[4][3] * windowItem.contentItems[indexScrollPlugY][6]) - windowItem.contentBoundaries[indexScrollPlugY][5];
        windowItem.contentArea[5][1] += 15;
      } else {
        windowItem.contentBoundaries[indexScrollPlugY][1] = ((windowItem.contentArea[4][3]) * windowItem.contentItems[indexScrollPlugY][6]) - itemBaseY;
      }
    }

    if (indexScrollPlugX !== -1) {
      const itemBaseX = design.windowScrollbarPlugX[4];

      if (windowItem.contentArea[2] >= windowItem.contentWidth) {
        windowItem.contentArea[5][0] = 0;
      } else if (windowItem.contentArea[3] <= windowItem.contentWidth) {
        windowItem.contentArea[5][0] = (windowItem.contentWidth - windowItem.contentArea[2]) * windowItem.contentItems[indexScrollPlugX][6];
      }

      if (windowItem.contentItems[indexScrollPlugX][6] === 0 || windowItem.contentArea[5][0] === 0) {
        windowItem.contentBoundaries[indexScrollPlugX][0] = itemBaseX;
      } else if (windowItem.contentItems[indexScrollPlugX][6] === 1) {
        windowItem.contentBoundaries[indexScrollPlugX][0] = (windowItem.contentArea[4][2] * windowItem.contentItems[indexScrollPlugX][6]) - windowItem.contentBoundaries[indexScrollPlugX][5];
        windowItem.contentArea[5][0] += 15;
      } else {
        windowItem.contentBoundaries[indexScrollPlugX][0] = ((windowItem.contentArea[4][2]) * windowItem.contentItems[indexScrollPlugX][6]) - itemBaseX;
      }
    }
  }

  function handleInputFieldInput (evt) {
    // Dont accept user input if not targetted
    if (evt.target.nodeName === 'input' || evt.target.nodeName === 'textarea') {
      return;
    }

    if (mouse.cursorItem === null) {
      return;
    }

    if (evt.keyCode === 9) {
      // Tab key pressed
      evt.preventDefault();
      if (mouse.cursorItem.type !== 'contentInputArea') {
        const parentWindow = getWindowById(mouse.cursorItem.parentWindow);
        const contentItems = parentWindow.contentItems;
        // console.log('parentWindow.contentItems', parentWindow.contentItems);

        let index = 0;
        if (mouse.shiftPressed) {
          --mouse.cursorItem.itemIndex;
        } else {
          ++mouse.cursorItem.itemIndex;
        }

        let minIndex = -1;
        let maxIndex = -1;
        for (let targetIndex = 0; targetIndex < parentWindow.contentItems.length; ++targetIndex) {
          const item = parentWindow.contentItems[targetIndex];
          if (item[0].startsWith('window')) {
            continue;
          }
          if (minIndex === -1) {
            minIndex = targetIndex;
            maxIndex = targetIndex;
          }

          if (maxIndex < targetIndex) {
            maxIndex = targetIndex;
          }
        }

        if (mouse.cursorItem.itemIndex < minIndex) {
          mouse.cursorItem.itemIndex = maxIndex;
        } else if (mouse.cursorItem.itemIndex > maxIndex) {
          mouse.cursorItem.itemIndex = minIndex;
        }

        index = mouse.cursorItem.itemIndex;

        for (index; index < contentItems.length; index++) {
          if (contentItems[index][0] === 'contentInputField') {
            mouse.cursorItem = getItemInfoAtIndex(contentItems[index], parentWindow, index);
            const text = mouse.cursorItem.data[1];
            mouse.cursorAt = [mouse.cursorItem.x + 3 + dc.measureText(text).width, mouse.cursorItem.y + 3, text.length - 1];
            parentWindow.contentArea[5][1] = 0;
            if (parentWindow.contentBoundaries[index][1] > parentWindow.contentArea[4][3]) {
              parentWindow.contentArea[5][1] = parentWindow.contentBoundaries[index][1] - (parentWindow.contentArea[4][3] - 18);
            }
            break;
          }
        }
      }
      return;
    }

    const text = mouse.cursorItem.data[1];
    let cursorIndex = -1;
    const cursorSelection = mouse.cursorItem.selection.sort();

    switch (evt.keyCode) {
      case 35:
        // End key
        evt.preventDefault();
        mouse.cursorAt[0] = mouse.cursorItem.x + dc.measureText(text).width + 3;
        mouse.cursorAt[2] = text.length - 1;
        if (mouse.cursorItem.controlPressed) {
          mouse.cursorItem.selection[0] = mouse.cursorAt[2] + 1;
        }
        return;
      case 36:
        // Position 1 key
        evt.preventDefault();
        mouse.cursorAt[0] = mouse.cursorItem.x + 3;
        mouse.cursorAt[2] = -1;
        if (mouse.cursorItem.controlPressed) {
          mouse.cursorItem.selection[0] = 0;
        }
        return;
      case 46:
        // Delete key
        evt.preventDefault();
        cursorIndex = mouse.cursorAt[2];
        if (mouse.cursorItem.selection && mouse.cursorItem.controlPressed) {
          mouse.cursorItem.data[1] = mouse.cursorItem.data[1].substring(0, cursorSelection[0]) + mouse.cursorItem.data[1].substring(cursorSelection[1] + 1, text.length);
          mouse.cursorAt[0] = mouse.cursorItem.x + dc.measureText(mouse.cursorItem.data[1].substring(0, cursorSelection[0])).width + 3;
          mouse.cursorAt[2] = cursorSelection[0] - 1;
          mouse.cursorItem.selection = [0, 0];
          mouse.cursorItem.controlPressed = false;
        } else if (cursorIndex < text.length - 1) {
          mouse.cursorItem.data[1] = mouse.cursorItem.data[1].substring(0, cursorIndex + 1) + mouse.cursorItem.data[1].substring(cursorIndex + 2, text.length);
        }
        return;
      case 9:
        // Tabulator
        evt.preventDefault();
        break;
      case 32:
        // Spacebar
        evt.preventDefault();
        break;
      case 13:
        // Enter key
        if (mouse.cursorItem.action === 'setWindowTitle') {
          getWindowById(mouse.cursorItem.parentWindow).title = mouse.cursorItem.data[1];
        }
        return;
      case 17:
        // Control/Strg key
        return;
      case 8:
        // Backspace key
        evt.preventDefault();
        cursorIndex = mouse.cursorAt[2];

        if (cursorIndex > -1) {
          const letterWidth = dc.measureText(text.substr(cursorIndex, 1)).width;
          mouse.cursorAt[0] -= letterWidth;
          if (cursorIndex < text.length - 1) {
            mouse.cursorItem.data[1] = mouse.cursorItem.data[1].substring(0, cursorIndex) + mouse.cursorItem.data[1].substring(cursorIndex + 1, text.length);
          } else {
            mouse.cursorItem.data[1] = mouse.cursorItem.data[1].substring(0, cursorIndex);
          }
          mouse.cursorAt[2] -= 1;
        }
        return;
      case 16:
        //  Shift key
        evt.preventDefault();
        mouse.cursorItem.selection = [0, 0];
        mouse.cursorItem.controlPressed = !mouse.cursorItem.controlPressed;
        mouse.cursorItem.selection[0] = mouse.cursorAt[2] + 1;
        mouse.cursorItem.selection[1] = mouse.cursorAt[2] + 1;
        return;

      case 37:
        evt.preventDefault();
        // Arrow key left
        cursorIndex = mouse.cursorAt[2];

        if (cursorIndex > -1) {
          const letterWidth = dc.measureText(text.substr(cursorIndex, 1)).width;
          mouse.cursorAt = [mouse.cursorAt[0] - letterWidth, mouse.cursorAt[1], mouse.cursorAt[2] - 1];
          if (mouse.cursorItem.controlPressed) {
            mouse.cursorItem.selection[0] = cursorIndex;
          }
        }

        return;

      case 39:
        // Arrow key right
        evt.preventDefault();
        cursorIndex = mouse.cursorAt[2];
        if (cursorIndex < text.length - 1) {
          const letterWidth = dc.measureText(text.substr(cursorIndex + 1, 1)).width;
          mouse.cursorAt = [mouse.cursorAt[0] + letterWidth, mouse.cursorAt[1], mouse.cursorAt[2] + 1];
        }
        if (mouse.cursorItem.controlPressed) {
          if (cursorIndex < text.length) {
            mouse.cursorItem.selection[1] = mouse.cursorAt[2] + 1;
          } else {
            mouse.cursorItem.selection[1] = mouse.cursorAt[2];
          }
        }

        return;
    }

    if (evt.key.length === 1) {
      const letterWidth = dc.measureText(evt.key).width;
      const textWidth = dc.measureText(text).width;
      const maxWidth = mouse.cursorItem.width - 10;
      if ((textWidth + letterWidth) > maxWidth) {
        return;
      }
      cursorIndex = mouse.cursorAt[2];
      if (cursorIndex < text.length - 1) {
        mouse.cursorItem.data[1] = mouse.cursorItem.data[1].substring(0, cursorIndex + 1) + evt.key + mouse.cursorItem.data[1].substring(cursorIndex + 1, text.length);
      } else {
        mouse.cursorItem.data[1] = mouse.cursorItem.data[1] + evt.key;
      }
      mouse.cursorAt[2] += 1;
      mouse.cursorAt[0] += letterWidth;
    }
  }

  // Render item creation functions
  function createFolderItem (title, x, y) {
    const item = {};
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
  function drawFolderItems () {
    let item = {};

    for (let index = 0; index < canTopData.renderItems.length; index++) {
      item = canTopData.renderItems[index];

      if (item.type === 0) {
        if (!item.open) {
          if (item.selected) {
            dc.drawImage(design.imageMap, design.folderIcon[2][2][0], design.folderIcon[2][2][1], design.folderIcon[0], design.folderIcon[1], item.x, item.y, item.width, design.folderIcon[1]);
          } else {
            dc.drawImage(design.imageMap, design.folderIcon[2][0][0], design.folderIcon[2][0][1], design.folderIcon[0], design.folderIcon[1], item.x, item.y, item.width, design.folderIcon[1]);
          }
          dc.fillStyle = design.folderIcon[3][0];
        } else {
          if (item.selected) {
            dc.drawImage(design.imageMap, design.folderIcon[2][3][0], design.folderIcon[2][3][1], design.folderIcon[0], design.folderIcon[1], item.x, item.y, item.width, design.folderIcon[1]);
          } else {
            dc.drawImage(design.imageMap, design.folderIcon[2][1][0], design.folderIcon[2][1][1], design.folderIcon[0], design.folderIcon[1], item.x, item.y, item.width, design.folderIcon[1]);
          }
          dc.fillStyle = design.folderIcon[3][1];
        }

        dc.textAlign = 'center';
        dc.fillText(item.title, item.x + (item.width / 2), design.folderIcon[1] + item.y + 5);
      }
    }
  }

  function renderWindowContent (queueItem) {
    const windowItem = canTopData.renderQueue[queueItem];
    const contentItems = windowItem.contentItems;
    const contentArea = windowItem.contentArea;
    const boundaries = windowItem.contentBoundaries;
    const items = windowItem.items;

    let index = 0;

    let offsetX = contentArea[5][0] - contentArea[4][0];
    let offsetY = contentArea[5][1] - contentArea[4][1];
    let finalOffsetX = 0;
    let finalOffsetY = 0;

    for (index = 0; index < contentItems.length; index++) {
      const contentItem = contentItems[index];
      const designItem = design[contentItem[0]];
      const itemBoundaries = boundaries[index];
      let isNonMoveAble = false;
      let useClip = false;

      // Check if the item is scrollable
      if (contentItem[4] === false) {
        finalOffsetX = 0;
        finalOffsetY = 0;
        isNonMoveAble = true;
      } else {
        // If not, does its parent scroll?
        if (contentItem[1] !== -1) {
          if (contentItems[contentItem[1]][4] !== false) {
            finalOffsetY = offsetY;
            finalOffsetX = offsetX;
            isNonMoveAble = false;
          } else {
            finalOffsetX = 0;
            finalOffsetY = 0;
            isNonMoveAble = true;
          }
        } else {
          finalOffsetX = offsetX;
          finalOffsetY = offsetY;
          isNonMoveAble = false;
        }
      }

      for (let subIndex = 0; subIndex < designItem[0].length; subIndex++) {
        const drawingMethod = designItem[0][subIndex];
        const fillMethod = designItem[1][subIndex];
        const colors = designItem[2][subIndex];
        const coords = designItem[3][subIndex];
        let posX = contentArea[0] + itemBoundaries[0];
        let posY = itemBoundaries[1];

        let sizeX = itemBoundaries[2];
        let sizeY = itemBoundaries[3];
        let useStroke = true;
        if (coords[0] > 0) {
          posX += coords[0];
          sizeX -= (coords[0] * 2);
          useStroke = false;
        }

        if (coords[1] > 0) {
          posY += coords[1];
          sizeY -= (coords[1] * 2);
          useStroke = false;
        }

        posX -= finalOffsetX;
        posY -= finalOffsetY;

        if (!isNonMoveAble) {
          if (posY - finalOffsetY < 0 || (posY + sizeY) > contentArea[4][3]) {
            dc.save();
            dc.beginPath();
            dc.rect(contentArea[0] + contentArea[4][0], contentArea[1] + contentArea[4][1], contentArea[4][2] - contentArea[4][0], contentArea[4][3] - contentArea[4][1]);
            dc.clip();
            useClip = true;
          }
        }

        const drawType = fillMethod.split('_', 2);
        if (drawType[0] === 'solid') {
          dc.fillStyle = colors[0];
        } else if (drawType[0] === 'gradient') {
          dc.fillStyle = createGradient(drawType[1], posX, contentArea[1] + posY, sizeX, sizeY);
        }

        if (drawingMethod === 'rect') {
          dc.lineWidth = 1;
          if (useStroke) {
            dc.strokeRect(posX, contentArea[1] + posY, sizeX, sizeY);
          }
          dc.fillRect(posX, contentArea[1] + posY, sizeX, sizeY);
        }

        if (useClip) {
          dc.restore();
        }
      }
    }

    dc.save();
    dc.beginPath();
    dc.rect(contentArea[0] + contentArea[4][0], contentArea[1] + contentArea[4][1], contentArea[4][2] - contentArea[4][0], contentArea[4][3] - contentArea[4][1]);
    dc.clip();

    if (windowItem.mode === 'data') {
      offsetX = contentArea[0] + 3 + contentArea[4][0];
      offsetY = contentArea[1] + 12 + contentArea[4][1];
      const mouseY = mouse.y - (mouse.offsetY + 6);
      let hasDrawnSelection = false;
      windowItem.contentWidth = 0;

      for (const currentItem of items) {
        dc.textAlign = 'left';
        if (offsetY >= (contentArea[1] + contentArea[5][1] - 18)) {
          const calculatedWidth = dc.measureText(currentItem[1]).width + dc.measureText(currentItem[2][0][3]).width + dc.measureText(currentItem[2][1][3]).width + 135;
          if (windowItem.contentWidth < calculatedWidth) {
            windowItem.contentWidth = calculatedWidth;
          }

          if (!hasDrawnSelection && windowItem.id === canTopData.activeWindow && (mouse.x - mouse.offsetX) > contentArea[0] && (mouse.x - mouse.offsetX) < (contentArea[0] + contentArea[2])) {
            if (mouseY > contentArea[1] && offsetY >= mouseY + contentArea[5][1]) {
              dc.fillStyle = 'rgba(0,0,0, 0.6)';
              dc.fillRect(contentArea[0], offsetY - (contentArea[5][1] + 12), contentArea[2], 18);
              hasDrawnSelection = true;
            }
          }
          if (currentItem[0] === 0) {
            dc.fillStyle = '#aaaa00';
            dc.fillText(currentItem[1], offsetX - contentArea[5][0], offsetY - contentArea[5][1]);
          } else if (currentItem[0] === 1) {
            dc.fillStyle = '#aaa';
            dc.fillText(currentItem[1], offsetX - contentArea[5][0], offsetY - contentArea[5][1]);
            dc.fillText([currentItem[2][0][3], currentItem[2][1][3]].join('    '), offsetX + 100 - contentArea[5][0], offsetY - contentArea[5][1]);
            dc.fillText(currentItem[2][2] + ' MB', offsetX + 240 - contentArea[5][0], offsetY - contentArea[5][1]);
          }
        }
        offsetY += 18;

        if ((offsetY - contentArea[5][1]) > (contentArea[1] + contentArea[3])) {
          break;
        }
      }

      dc.restore();
    } else if (windowItem.mode === 'app') {
      for (index = 0; index < contentItems.length; index++) {
        if (contentItems[index][0] === 'contentInputField') {
          const itemDetails = getItemInfoAtIndex(contentItems[index], windowItem, index);
          const textWidth = dc.measureText(itemDetails.data[1]).width;
          dc.fillStyle = design.contentInputFieldText[0][1];
          dc.fillRect(itemDetails.x - offsetX, itemDetails.y + 1 - offsetY, textWidth + 5, itemDetails.height - 2);
          dc.fillStyle = design.contentInputFieldText[0][0];
          dc.textAlign = 'left';
          dc.fillText(itemDetails.data[1], itemDetails.x + 2 - offsetX, (itemDetails.y + (itemDetails.height / 1.5)) - offsetY);
        }
      }
    }

    if (mouse.cursorItem !== null && mouse.cursorItem.parentWindow === windowItem.id) {
      // Create a text selection
      const minSelection = Math.min(mouse.cursorItem.selection[0], mouse.cursorItem.selection[1]);
      const maxSelection = Math.max(mouse.cursorItem.selection[0], mouse.cursorItem.selection[1]);
      if (minSelection > -1) {
        const textData = mouse.cursorItem.data[1];
        const selectedData = textData.substring(minSelection, maxSelection);
        const textWidth = dc.measureText(textData.substring(0, minSelection)).width;
        const selectedWidth = dc.measureText(selectedData).width;

        if (selectedData.length !== 0) {
          dc.fillStyle = design.contentInputFieldText[1][1];
          dc.fillRect(mouse.cursorItem.x + textWidth + 2 - offsetX, mouse.cursorAt[1] - 2 - offsetY, selectedWidth + 1, mouse.cursorItem.height - 2);
        }
        if (selectedData.length !== 0) {
          dc.fillStyle = design.contentInputFieldText[1][0];
          dc.fillText(selectedData, mouse.cursorItem.x + 2 + textWidth - offsetX, mouse.cursorAt[1] + 9 - offsetY);
        }
      }

      mouse.cursorBlink++;
      if (mouse.cursorBlink === mouse.cursorBlinkRate) {
        mouse.cursorBlink = 0;
      } else {
        const cursorAt = mouse.cursorAt;
        dc.beginPath();
        dc.moveTo(cursorAt[0] - offsetX, cursorAt[1] - offsetY);
        dc.lineTo(cursorAt[0] - offsetX, cursorAt[1] + 12 - offsetY);
        dc.closePath();
        dc.strokeStyle = design.textCursor[0];
        dc.lineWidth = design.textCursor[1];
        dc.stroke();
        dc.strokeStyle = '#000';
        dc.lineWidth = 1;
      }
    }

    dc.restore();
  }

  function createWindowControl (type, value, parentWindowIndex, parentIndex, offsetX, offsetY, sizeX, sizeY, functionName) {
    const parentWindow = canTopData.renderQueue[parentWindowIndex];
    // TODO: Start here
    if (type === 'inputField') {
      if ((offsetY + sizeY) > parentWindow.contentHeight) {
        parentWindow.contentHeight = offsetY + sizeY;
      }

      parentWindow.contentBoundaries.push([offsetX, offsetY, sizeX, sizeY, offsetX + sizeX, offsetY + sizeY]);
      parentWindow.contentData.push([parentWindow.contentItems.length, value, '', '', false]);
      parentWindow.contentItems.push(['contentInputField', parentIndex, 'both', 'pos', 'string', value, '', false]);

      const itemIndex = parentWindow.contentItems.length - 1;
      const windowId = canTopData.renderQueue[parentWindowIndex].id;
      parentWindow.contentActions.push([itemIndex, functionName]);

      canTopData.mouseTraps.push([windowId, itemIndex, parentWindow.contentArea[0] + offsetX, parentWindow.contentArea[1] + offsetY, sizeX, sizeY, 'text']);
    }
  }

  // Main function executes after desktop imagemap has been loaded
  function initialized () {
    createFolderItem('Documents', 20, 10);
    createFolderItem('Briefcase', 20, 80);
    createWindow(design, 'data', 'Window Testtitle - Data Window 1', 70, 100);
    createWindow(design, 'data', 'Window Testtitle - Data Window 2', 420, 100);
    createWindow(design, 'data', 'Window Testtitle - Data Window 3', 150, 240);

    createWindow(design, 'app', 'Window Testtitle - App Window 4', 420, 240);
    // createWindowControl(type, value, parentWindowIndex, parentIndex, offsetX, offsetY, sizeX, sizeY) {
    const lastWindow = canTopData.renderQueueSize - 1;
    createWindowControl('inputField', 'Enter new window title here', lastWindow, -1, 20, 20, 150, 18, 'setWindowTitle');
    createWindowControl('inputField', 'Or right in this textfield', lastWindow, -1, 20, 60, 120, 18, 'setWindowTitle');
    createWindowControl('inputField', 'Press Enter', lastWindow, -1, 20, 160, 120, 18, 'setWindowTitle');

    // Main loop
    let queueItem = 0;

    function mainloop () {
      drawBackground();
      drawFolderItems();

      for (queueItem = 0; queueItem < canTopData.renderQueueSize; queueItem++) {
        drawQueueItem(queueItem);
        if (canTopData.renderQueue[queueItem].type === 'window') {
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
    canvas.addEventListener('mousemove', function (evt) {
      mouse.x = evt.clientX;
      mouse.y = evt.clientY;
      if (canTopData.activeWindow !== null) {
        const mouseTraps = canTopData.mouseTraps;
        let trap = [];
        const mX = evt.clientX - mouse.offsetX;
        const mY = evt.clientY - mouse.offsetY;
        mouse.current = 'default';

        const parentWindow = getWindowById(canTopData.activeWindow);

        for (let trapIndex = 0; trapIndex < mouseTraps.length; trapIndex++) {
          trap = mouseTraps[trapIndex];

          if (trap[0] !== canTopData.activeWindow) {
            continue;
          }

          if (mX >= parentWindow.contentArea[0] && mX <= (parentWindow.contentArea[0] + parentWindow.contentArea[4][2]) && mY >= parentWindow.contentArea[1] && mY <= parentWindow.contentArea[1] + parentWindow.contentArea[4][3]) {
            dc.beginPath();
            dc.rect(trap[2] - parentWindow.contentArea[5][0], trap[3] - parentWindow.contentArea[5][1], trap[4], trap[5]);
            dc.closePath();
            if (dc.isPointInPath(mX, mY)) {
              mouse.current = trap[6];
              break;
            }
          }
        }
      }
    });

    function checkKeyboardInput (evt) {
      console.log('checkKeyboardInput ==> evt.keyCode', evt.keyCode);
      switch (evt.keyCode) {
        case 16:
          // Shift key
          evt.preventDefault();
          mouse.shiftPressed = !mouse.shiftPressed;
          break;
        case 17:
          evt.preventDefault();
          // Control key
          mouse.controlPressed = !mouse.controlPressed;
          break;
        default:
          break;
      }
    }

    canvas.addEventListener('click', checkClick);
    canvas.addEventListener('mousedown', activateMovement);
    canvas.addEventListener('mouseup', deactivateMovement);
    canvas.addEventListener('mouseout', deactivateMovement);
    canvas.addEventListener('wheel', checkWheel);
    document.addEventListener('keydown', checkKeyboardInput);
    document.addEventListener('keyup', checkKeyboardInput);

    // Get the right offset values after window resizing
    window.addEventListener('resize', function () {
      mouse.offsetX = canvas.offsetLeft;
      mouse.offsetY = canvas.offsetTop;
    });

    mainloop();
  }

  // Image loader check to see if a image has been completely loaded
  /*
  function checkLoaded () {
    if (design.imageMap.src === '' || (design.imageMap.width !== 0 && design.imageMap.height !== 0 && design.imageMap.complete === true)) {
      clearInterval(loaderCheckInterval);
      initialized();
    }
  }
  */
  // var loaderCheckInterval = setInterval(checkLoaded, 120);

  initialized();
}
