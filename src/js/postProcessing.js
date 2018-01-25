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

function createProgram(gl, vertexShader, fragmentShader) {
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

export function createRender( canvas, { vertexShader, fragmentShader}){

  return Promise.all([
      fetch( vertexShader),
      fetch( fragmentShader)
    ])
  .then(([ proVertex, proFrag]) => Promise.all([proVertex.text(), proFrag.text()]))
  .then(([ srcVertex, srcFrag]) =>{

    const webgl = document.createElement("canvas");
    webgl.width  = canvas.width;
    webgl.height = canvas.height;

    const gl = webgl.getContext('webgl');


    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor( 0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const vertices = new Float32Array([
      -1, -1,
      -1, 1,
      1, 1,

      -1, -1,
      1, 1,
      1, -1,
    ]);




    if( !gl){
      gl = canvas.getContext('experimental-webgl');
    }

    let vertexShader   = createShader( gl, gl.VERTEX_SHADER, srcVertex);
    let fragmentShader = createShader( gl, gl.FRAGMENT_SHADER, srcFrag);
    let program        = createProgram( gl, vertexShader, fragmentShader);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'position');

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(positionLocation);

    const texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return {
      draw : ( time) => {
        gl.drawArrays( gl.TRIANGLES, 0, vertices.length / 2);
        return webgl;
      }
    }
  });
}