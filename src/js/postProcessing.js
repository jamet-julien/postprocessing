function createShader( gl, type, source) {

  let shader = gl.createShader( type);

  gl.shaderSource( shader, source);
  gl.compileShader( shader);
  let success = gl.getShaderParameter( shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog( shader));
  gl.deleteShader(shader);

  return 0;
}

function createProgram(gl, srcVertex, srcFrag) {
  let vertexShader = createShader(gl, gl.VERTEX_SHADER, srcVertex);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, srcFrag);

  let  program = gl.createProgram();
  gl.attachShader( program, vertexShader);
  gl.attachShader( program, fragmentShader);
  gl.linkProgram( program);
  let  success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    gl.validateProgram( program);
    if (gl.getProgramParameter( program, gl.VALIDATE_STATUS)) {
      return program;
    }
    console.error(gl.getProgramInfoLog(program));
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);

  return 0;
}


function addVariable(gl, program, arrVar){

  arrVar.forEach( name =>{
    const variable = gl.getAttribLocation( program, name);
    gl.vertexAttribPointer(variable, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(variable);
  });

}


function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}

export function createRender( canvas, { vertexShader, fragmentShader}, ...variable){

  return Promise.all([
      fetch( vertexShader),
      fetch( fragmentShader)
    ])
  .then(([ proVertex, proFrag]) => Promise.all( [ proVertex.text(), proFrag.text()]))
  .then(([ srcVertex, srcFrag]) =>{

    const webgl = document.createElement("canvas");
    webgl.width  = canvas.width;
    webgl.height = canvas.height;

    const gl = webgl.getContext('webgl');

    gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor( 0.0, 0.0, 0.0, 0.0);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if( !gl){
      gl = canvas.getContext('experimental-webgl');
    }

    let program        = createProgram( gl, srcVertex, srcFrag);
/****************************************************/

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, canvas.width, canvas.height);

    // provide texture coordinates for the rectangle.
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0,
    ]), gl.STATIC_DRAW);

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset)

    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset)

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);


/****************************************************/

    return {
      draw : ( time) => {
        gl.drawArrays( gl.TRIANGLES, 0, 6);
        return webgl;
      }
    }
  });
}