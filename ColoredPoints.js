// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
// we added a uniform variable, u_Size to pass the desired size to
// webgl
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform float u_Size;
void main() {
  gl_Position = a_Position; 
  gl_PointSize = u_Size;
}`
// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`


// Global variables. They're already defined later but they're beneficial to have global because there is only one
// of each in our program
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setUpWebGL() {
  // Retrieve <canvas> element
  // We got rid of the vars because it made a new local variable
  // instead of just using the global one
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  const error = gl.getError();
if (error !== gl.NO_ERROR) {
  console.error(`WebGL Error: ${error}`);
}
 
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  const error2 = gl.getError();
if (error2 !== gl.NO_ERROR) {
  console.error(`WebGL Error: ${error2}`);
}

  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  // connects u_size variable to local one
  u_Size = gl.getUniformLocation(gl.program, 'u_Size')
  const error3 = gl.getError();
if (error3 !== gl.NO_ERROR) {
  console.error(`WebGL Error: ${error3}`);
}

  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y])
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  const error4 = gl.getError();
if (error4 !== gl.NO_ERROR) {
  console.error(`WebGL Error: ${error4}`);
}

  var len = g_shapesList.length; 

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global variable which is the color chosen by the user
let g_selectedColor = [1.0,1.0,1.0,1.0];
// Global variable which is the user selected point size
let g_selectedSize=5;
// global variable that's the selected shape type
let g_selectedType=POINT;

// Set up actions for the html UI elements 
// make it so that uswer interaction w/the sliders calls 
// It gets the element by id, add an event listenr for 'mouseup' and does an anonymous function that
// sets each value of the g_selectedColor array. The vaalues of the sliders are divided by 100 because 
// theh have a range of 0-100. Those slides will determine the values of the red, green, and blue in the
// selected color instead of being hard coded.
function addActionsForHtmlUI() {
  // color slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });

  // size slider events
  document.getElementById('sizeSlide').addEventListener('mouseup', function () {g_selectedSize = this.value})

  // Button events
  document.getElementById('clearButton').onclick = function() {g_shapesList = []; renderAllShapes(); };
  document.getElementById('pointButton').onclick = function() {g_selectedType = POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType = TRIANGLE; };
  document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE; };
  document.getElementById('picButton').onclick = function() { drawPicture(); };
}

function main() {

  // Set up canvas and gl variables
  setUpWebGL();

  // Set up GLSL shader program and connect GLSL variables
  connectVariablesToGLSL();
  
  // Set up actions for the html UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown  = click;
  canvas.onmousemove  = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  const error5 = gl.getError();
if (error5 !== gl.NO_ERROR) {
  console.error(`WebGL Error: ${error5}`);
}


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  const error6 = gl.getError();
  if (error6!== gl.NO_ERROR) {
    console.error(`WebGL Error: ${error6}`);
  }
  
}

// Array of Points
var g_shapesList = [];

/*
var g_points = [];  // The array for the position of a mouse press. Each (x,y) point will be stored here as an array
var g_colors = [];  // The array to store the color of a point, each point has their color here with a matching index
var g_sizes = [];   // array that holds the size for each point
*/

function click(ev) {
  //convert coordinates to correct format
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }

  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();  
}

function drawPicture() {
  let d = g_selectedSize / 200;
  let triArray = [];

  for(let i = 0; i < 22; i++) {
    triArray[i] = new Triangle();    
  }

  // Set different positions for each triangle
  triArray[0].position = [0.0, 0.0];  // Empty triangle 
  triArray[1].position = [-0.2, 0.0];  
  triArray[2].position = [-0.1, 0.0];  
  triArray[3].position = [0.0, 0.0];  
  triArray[4].position = [0.1, 0.0];  
  triArray[5].position = [-0.1, -0.1];  
  triArray[6].position = [0.0, -0.1];  
  triArray[7].position = [0.1, -0.1];  
  triArray[8].position = [0.2, -0.1];  
  triArray[17].position = [0.15, -0.051];  
  triArray[9].position = [0.0, -0.2];
  triArray[10].position = [0.1, -0.2];
  triArray[11].position = [0.2, -0.2];
  triArray[11].position = [0.2, -0.2];
  triArray[12].position = [-0.2, 0.05];
  triArray[13].position = [-0.1, 0.05];
  triArray[14].position = [0.0, 0.05];
  triArray[15].position = [0.1, 0.05];
  triArray[16].position = [0.05, -0.15];
  triArray[18].position = [0.25, -0.1];
  triArray[19].position = [0.25, -0.2];
  triArray[20].position = [0.29, -0.17];
  triArray[21].position = [0.346, -0.17];

  triArray.forEach(triangle => {
    triangle.size = 20.0;  // Set the size to the global selected size
  });

  let purpleColor =  [0.7, 0.0, 0.7, 1.0];
  triArray.forEach(triangle => {
    triangle.color = purpleColor;  // Set the size to the global selected size
  });

  //fish highlights
  let num_highlights = 6;

  // color and size of highlights
  for(let n=12; n < 20; n++) {
    if(n == 17) {
      // fish eyeball
      triArray[n].color = [1.0,0.0,0.0,1.0];
      triArray[n].size = 10;
    }
    /*
    else if(n==18 || n ==19) {
      triArray[i].color = [0.4, 0.0, 0.4, 1.0]; // dark purple color
    } else {
      triArray
    }*/
    else {
      triArray[n].size = 10;
      triArray[n].color = [0.4, 0.0, 0.4, 1.0]; // dark purple color
    }
  }

  // Other small fish color and size
  triArray[20].color = [0.5, 0.0, 0.5, 1.0];
  triArray[21].color = [0.5, 0.0, 0.5, 1.0];
  triArray[20].size = 12;
  triArray[21].size = 5;

    // Log the positions of each triangle for debugging
    console.log("Triangle 1 Position: ", triArray[0].position);
    console.log("Triangle 2 Position: ", triArray[1].position);
    console.log("Triangle 3 Position: ", triArray[2].position);

  gl.clear(gl.COLOR_BUFFER_BIT);
  let len = triArray.length;
  for(let i = 0; i < len; i++) {
    triArray[i].render();
  }
  
}