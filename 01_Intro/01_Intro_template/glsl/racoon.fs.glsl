// Create shared variable. The value is given as the interpolation between normals computed in the vertex shader
varying vec3 interpolatedNormal;

void main() {
  gl_FragColor = vec4(normalize(interpolatedNormal), 1.0);
}
