import * as THREE from 'three';

export function createSphereGeometry(s) {
    const segments = 32;
    return new THREE.SphereGeometry(s, segments, segments);
}

export function createCubeGeometry(s) {
    return new THREE.BoxGeometry(s * 1.3, s * 1.3, s * 1.3);
}

export function createCylinderGeometry(s) {
    const radialSegments = 32;
    const heightSegments = 1;
    const openEnded = false;
    return new THREE.CylinderGeometry(s * 0.7, s * 0.7, s * 2, radialSegments, heightSegments, openEnded);
}

export function createTorusGeometry(s) {
    const tubeSegments = 16;
    const radialSegments = 100;
    return new THREE.TorusGeometry(s * 0.8, s * 0.3, tubeSegments, radialSegments);
}

export function createConeGeometry(s) {
    const radialSegments = 32;
    const heightSegments = 1;
    const openEnded = false;
    return new THREE.ConeGeometry(s, s * 2, radialSegments, heightSegments, openEnded);
}
export const createPyramidGeometry = createConeGeometry; // Alias

export function createCapsuleGeometry(s) {
    const capSegments = 4;
    const lengthSegments = 8;
    return new THREE.CapsuleGeometry(s*0.6, s*1.2, capSegments, lengthSegments);
}

export function createDodecahedronGeometry(s) {
    return new THREE.DodecahedronGeometry(s);
}

export function createIcosahedronGeometry(s) {
    return new THREE.IcosahedronGeometry(s);
}

export function createOctahedronGeometry(s) {
    return new THREE.OctahedronGeometry(s);
}

export function createTetrahedronGeometry(s) {
    return new THREE.TetrahedronGeometry(s);
}