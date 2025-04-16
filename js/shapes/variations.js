import * as THREE from 'three';

export function createTallBoxGeometry(s) {
    return new THREE.BoxGeometry(s * 0.8, s * 3, s * 0.8);
}

export function createFlatBoxGeometry(s) {
    return new THREE.BoxGeometry(s * 2.5, s * 0.5, s * 2.5);
}

export function createThinCylinderGeometry(s) {
    const radialSegments = 32;
    const heightSegments = 1;
    // Note: openEnded is not used here as the variation is a closed thin cylinder
    return new THREE.CylinderGeometry(s * 0.2, s * 0.2, s * 3, radialSegments, heightSegments);
}

export function createThickTorusGeometry(s) {
    const tubeSegments = 16;
    const radialSegments = 100;
    return new THREE.TorusGeometry(s * 0.8, s * 0.5, tubeSegments, radialSegments);
}

export function createThinTorusGeometry(s) {
    const tubeSegments = 16;
    const radialSegments = 100;
    return new THREE.TorusGeometry(s * 1.2, s * 0.1, tubeSegments, radialSegments);
}

export function createSquashedSphereGroup(s, matClone) {
    const group = new THREE.Group(); // Use group to handle scale correctly
    const segments = 32;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(s, segments, segments), matClone());
    mesh.scale.y = 0.5;
    mesh.castShadow = true;
    group.add(mesh);
    return group;
}

export function createStretchedCubeGroup(s, matClone) {
    const group = new THREE.Group();
    // Pass params if BoxGeometry gets parameters later
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s /*, potential params */), matClone());
    mesh.scale.set(0.5, 2.0, 0.5);
    mesh.castShadow = true;
    group.add(mesh);
    return group;
}

export function createLowPolySphereGeometry(s) {
    // Ignores params.sphereSegments, uses fixed low values
    return new THREE.SphereGeometry(s, 8, 6);
}

export function createOpenCylinderGeometry(s) {
    const radialSegments = 32;
    const heightSegments = 1;
    const openEnded = true; // This variation forces openEnded
    return new THREE.CylinderGeometry(s * 0.7, s * 0.7, s * 2, radialSegments, heightSegments, openEnded);
}

export function createHalfSphereGeometry(s) {
    const segments = 32;
    // Keeps custom phiLength for the half-sphere effect
    return new THREE.SphereGeometry(s, segments, Math.max(1, Math.floor(segments / 2)), 0, Math.PI * 2, 0, Math.PI / 2);
}