const image     = document.getElementById("space_deux"),
      context2d = image.getContext('2d');

      image.width  = 800;
      image.height = 600;

const canvas = document.createElement("canvas");

canvas.width  = 800;
canvas.height = 600;

const gl = canvas.getContext('webgl');

gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
gl.clearColor( 0.0, 0.0, 0.0, 0.0);
gl.clear( gl.COLOR_BUFFER_BIT);

const vertShaderText = `
    attribute vec2 position;
    varying vec2 texCoords;
    void main() {
      gl_Position = vec4( position, 0, 1.0);
    }
  `;

const fragShaderText = `
    precision highp float;
    varying vec2 texCoords;
    uniform sampler2D textureSampler;
    void main() {
      float brightness = 0.5;
      vec4 color = texture2D( textureSampler, texCoords);
      color.rgb += brightness;
      gl_FragColor = color;
    }
  `;

function createWebgl(){

}

const program = gl.createProgram();

const vertShader = gl.createShader( gl.VERTEX_SHADER);
gl.shaderSource( vertShader, vertShaderText);
gl.compileShader( vertShader);
if (!gl.getShaderParameter( vertShader, gl.COMPILE_STATUS)) {
  console.error('ERROR : vertex [compile]', gl.getShaderInfoLog( vertShader));
}

const fragShader = gl.createShader( gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragShaderText);
gl.compileShader(fragShader);
if (!gl.getShaderParameter( fragShader, gl.COMPILE_STATUS)) {
  console.error('ERROR : fragment [compile]', gl.getShaderInfoLog( fragShader));
}

gl.attachShader(program, fragShader);
gl.attachShader(program, vertShader);

gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error('ERROR : program [link]', gl.getProgramInfoLog(program));
}

gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
  console.error('ERROR : program [validating]', gl.getProgramInfoLog(program));
}

gl.useProgram(program);

const vertices = new Float32Array([
  -1, -1,
  -1, 1,
  1, 1,

  -1, -1,
  1, 1,
  1, -1,
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, 'position');

gl.vertexAttribPointer( positionLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.enableVertexAttribArray( positionLocation);

const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

let pos = {
  x : 0,
  y : 0
}

function render(){
  context2d.clearRect(0, 0, image.width, image.height);
  pos.x = (pos.x +1)% image.width;
  pos.y = (pos.y +1)% image.height;
  context2d.fillStyle = "red";
  context2d.fillRect( pos.x,  pos.y, 20, 20);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  context2d.drawImage( canvas, 0, 0, image.width, image.height);

  requestAnimationFrame(render);
}


render(0);
