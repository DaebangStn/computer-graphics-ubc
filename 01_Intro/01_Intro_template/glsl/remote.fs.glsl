precision mediump float;

uniform int rcState;

void main() {
    vec4 color;

    if (rcState == 1) {
        // Set color to red
        color = vec4(1.0, 0.0, 0.0, 1.0); // Red
    } else if (rcState == 2) {
        // Set color to green
        color = vec4(0.0, 1.0, 0.0, 1.0); // Green
    } else if (rcState == 3) {
        // Set color to blue
        color = vec4(0.0, 0.0, 1.0, 1.0); // Blue
    } else {
        // Default color
        color = vec4(1.0, 1.0, 1.0, 1.0); // White or any other default color
    }

    gl_FragColor = color;
}
