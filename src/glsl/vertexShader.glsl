attribute vec2 position;
varying vec2 texCoords;
void main() {
  gl_Position = vec4( position, 0, 1.0);
}
