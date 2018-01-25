precision highp float;
varying vec2 texCoords;
uniform sampler2D textureSampler;

void main() {
  float brightness = 0.5;
  vec4 color = texture2D( textureSampler, texCoords);
  color.rgb += brightness;
  gl_FragColor = color;
}