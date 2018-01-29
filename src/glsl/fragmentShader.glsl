precision mediump float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {

    vec4 color = vec4( v_texCoord, 1., 1.);//
    vec4 alpha = texture2D( u_image, v_texCoord);

    gl_FragColor = vec4( color.r, color.g, color.b, alpha.a);
    //gl_FragColor = color * ( vec4( .2) + .5);
}