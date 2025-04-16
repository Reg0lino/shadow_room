import * as THREE from 'three';

// These functions create groups with Meshes using the provided matClone function

export function createStackedCubesGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), matClone());
    const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(s * 0.9, s * 0.9, s * 0.9), matClone());
    mesh2.position.y = s;
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createStackedCylindersGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.CylinderGeometry(s*0.6, s*0.6, s*0.8, 32), matClone());
    const mesh2 = new THREE.Mesh(new THREE.CylinderGeometry(s*0.5, s*0.5, s*0.7, 32), matClone());
    const mesh3 = new THREE.Mesh(new THREE.CylinderGeometry(s*0.4, s*0.4, s*0.6, 32), matClone());
    mesh2.position.y = s*0.8;
    mesh3.position.y = s*0.8 + s*0.7;
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    mesh3.castShadow = true;
    group.add(mesh1, mesh2, mesh3);
    return group;
}

export function createStackedSpheresGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(s*0.8, 32, 16), matClone());
    const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(s*0.6, 32, 16), matClone());
    const mesh3 = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 32, 16), matClone());
    mesh2.position.y = s*0.8 + s*0.6;
    mesh3.position.y = mesh2.position.y + s*0.6 + s*0.4;
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    mesh3.castShadow = true;
    group.add(mesh1, mesh2, mesh3);
    return group;
}
export const createSnowmanGroup = (s, matClone) => createStackedSpheresGroup(s, matClone);

export function createStackedToriGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(s*0.8, s*0.2, 16, 50), matClone());
    const mesh2 = mesh1.clone(); // Clone mesh including material instance
    const mesh3 = mesh1.clone();
    mesh2.material = matClone(); // Ensure unique materials if needed later
    mesh3.material = matClone();
    mesh2.scale.setScalar(0.8);
    mesh3.scale.setScalar(0.6);
    mesh2.position.y = s*0.4;
    mesh3.position.y = s*0.4 + s*0.32;
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    mesh3.castShadow = true;
    group.add(mesh1, mesh2, mesh3);
    return group;
}

export function createSphereOnCubeGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s * 1.2, s * 1.2, s * 1.2), matClone());
    const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(s * 0.8, 32, 32), matClone());
    mesh2.position.y = (s * 1.2 / 2) + (s * 0.8);
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createCubeOnSphereGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(s * 0.9, 32, 32), matClone());
    const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(s * 0.8, s * 0.8, s * 0.8), matClone());
    mesh2.position.y = s * 0.9 + s * 0.4;
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createConeOnCylinderGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.CylinderGeometry(s*0.6, s*0.6, s*1.5, 32), matClone());
    const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(s*0.6, s*0.8, 32), matClone());
    mesh2.position.y = s*1.5/2 + s*0.8/2;
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createOffsetCubesGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), matClone());
    const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(s*0.6, s*0.6, s*0.6), matClone());
    mesh2.position.set(s*0.5, s*0.2, s*0.5);
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createOffsetSpheresGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(s*0.7, 32, 16), matClone());
    const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 32, 16), matClone());
    mesh2.position.set(s*0.6, s*0.3, s*0.2);
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createOffsetCapsulesGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.5, s*1.0, 4, 16), matClone());
    const mesh2 = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.4, s*0.8, 4, 16), matClone());
    mesh2.position.set(s*0.6, s*0.3, 0);
    mesh2.rotation.z = Math.PI / 4;
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createCubePyramidStackGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s*1.1, s*1.1, s*1.1), matClone());
    const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(s*0.9, s*1.5, 32), matClone());
    mesh2.position.y = (s*1.1/2) + (s*1.5/2);
    mesh1.castShadow = true;
    mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createThreeSpheresLineGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(s*0.5, 32, 16), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    const mesh3 = mesh1.clone(); mesh3.material = matClone();
    mesh1.position.x = -s*0.8;
    mesh3.position.x = s*0.8;
    mesh1.castShadow = true; mesh2.castShadow = true; mesh3.castShadow = true;
    group.add(mesh1, mesh2, mesh3);
    return group;
}

export function createThreeCubesLineGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s*0.6, s*0.6, s*0.6), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    const mesh3 = mesh1.clone(); mesh3.material = matClone();
    mesh1.position.x = -s*0.8;
    mesh3.position.x = s*0.8;
     mesh1.castShadow = true; mesh2.castShadow = true; mesh3.castShadow = true;
    group.add(mesh1, mesh2, mesh3);
    return group;
}

export function createThreeSpheresTriangleGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(s*0.6, 32, 16), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    const mesh3 = mesh1.clone(); mesh3.material = matClone();
    mesh1.position.set(-s*0.7, 0, 0);
    mesh2.position.set(s*0.7, 0, 0);
    mesh3.position.set(0, s*1.0, 0);
     mesh1.castShadow = true; mesh2.castShadow = true; mesh3.castShadow = true;
    group.add(mesh1, mesh2, mesh3);
    return group;
}

export function createThreeCubesTriangleGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s*0.7, s*0.7, s*0.7), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    const mesh3 = mesh1.clone(); mesh3.material = matClone();
    mesh1.position.set(-s*0.8, 0, 0);
    mesh2.position.set(s*0.8, 0, 0);
    mesh3.position.set(0, s*1.1, 0);
     mesh1.castShadow = true; mesh2.castShadow = true; mesh3.castShadow = true;
    group.add(mesh1, mesh2, mesh3);
    return group;
}

export function createLinkedToriGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(s*0.7, s*0.15, 16, 50), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    mesh2.rotation.y = Math.PI/2;
    mesh2.position.x = s*0.7;
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createIntersectingCubeSphereGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s*1.2, s*1.2, s*1.2), matClone());
    const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(s*0.9, 32, 32), matClone());
    mesh2.position.set(s*0.5, s*0.5, s*0.5);
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createIntersectingCylindersGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.CylinderGeometry(s*0.5, s*0.5, s*2, 32), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    mesh2.rotation.x = Math.PI/2;
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createIntersectingToriGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(s*0.8, s*0.2, 16, 50), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    mesh2.rotation.x = Math.PI/2;
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createCylinderThruTorusGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(s * 0.9, s * 0.4, 16, 100), matClone());
    const mesh2 = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.25, s * 0.25, s * 3, 32), matClone());
    mesh2.rotation.x = Math.PI / 2;
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createSphereThruTorusGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(s * 0.9, s * 0.2, 16, 100), matClone());
    const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(s*1.0, 32, 32), matClone());
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createCubeThruTorusGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(s * 0.9, s * 0.2, 16, 100), matClone());
    const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(s*0.8, s*0.8, s*3), matClone());
    mesh2.rotation.x = Math.PI / 2;
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}