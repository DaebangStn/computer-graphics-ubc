varying vec4 V_Color;

void main() {
	// COMPUTE COLOR ACCORDING TO GOURAUD HERE
	
	V_Color = vec4(1.0, 0.0, 0.0, 1.0);

	// Position
	gl_Position = projectionMatrix *  modelViewMatrix * vec4(position, 1.0);
}