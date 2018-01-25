precision mediump float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
    vec4 color  = texture2D( u_image, v_texCoord);
    color.rgb += 0.5; 
    gl_FragColor = color;
}