canTop
=======

canTop is a canvas desktop.

Try it out here: https://jrie.github.io/canTop

![canTop-preview](https://github.com/user-attachments/assets/bb2f7502-2688-404e-a081-eacd2b258442)


General information
=======

In canTop all designs are defined by the design object. The design object then defines the designs for icons using an image map and a also the drawing shapes used to draw windows and the window controls. All can be styled using solid or gradient fill styles as well as strokes for line based items, like the present closing control button of a window (drawing the "x"). Some elements are static and can only grow on width, another can grow in both dimensions - the code to do this actions does make some calculation, but at present it isnt possible to define a window and, for example by percentage, divide the growing window elements into the space remaining from the subtraction of fixed height elements (titlebar and statusbar) and the actual window height set. This might happen in a later version. Controls are placed using "dynamic" and given the fixed position inside the window space using negative or positive numbers to offset the controls in the window.

If the debug is set to active, also a grid and highlighted grid cells are drawn - tempting to do a minesweeper using this basement or a drawing app. But this feature is mostly done to allow later snapping of items to the grid, helper function to calculate grid to px and px to a grid position are implemented, the grid can be set to a custom value on init of canTop.

Plans / toDo's
======
- Adding designs for the mouse then the default to show the action performed/performing
- Adding a calculation to work with multiple growing elements inside a window instance, for now only one growing/shrinking element on xy-coords can be defined
- Using the grid system, allowing to snap objects like icons or when resizing
- Writing a grid based drawing app, placed into the window content, to produce design template code in this format [["drawType1", "drawType2"], ["fillStyle1", "fillStyle2"], [["colorsA", "colorB"], ["colors2"]], [["drawing_coords1"], ["drawing_coords2]]]
- Writing a minesweeper clone using the grid drawing system, allowing the window content to be used
- Allowing to select and edit text right on the canvas of nearly all items
- A listing of files and folders inside a window container content which allows selection and display of information of a selected element using the statusBar
- Implementing a scrollbar to allow scrolling of the window content area or other items, binding it
- Create custom controls like dropdowns or text input edit box
