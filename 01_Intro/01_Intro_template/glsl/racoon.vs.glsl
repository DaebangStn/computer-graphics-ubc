// Create shared variable for the vertex and fragment shaders
varying vec3 interpolatedNormal;
uniform vec3 remotePosition;

void main() {
    vec4 ofs = vec4(0, -0.661133, 0, 0);

    float threshold = 2.0;
    vec3 scaledPosition = position * 3.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaledPosition, 1.0);

    vec3 adjustedRemote = vec3(remotePosition.x, remotePosition.z, remotePosition.y) * 3.5;
    vec3 adjustedGLPosition = vec3(scaledPosition.x, scaledPosition.y, scaledPosition.z);
    float distanceToRemote = length(adjustedRemote - adjustedGLPosition);

    if (distanceToRemote < threshold) {
        interpolatedNormal = vec3(1.0, 1.0, 0.0);
    } else {
        interpolatedNormal = normal;
    } 
}
