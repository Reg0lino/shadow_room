import * as THREE from 'three';

export function createLeaningTowerCubesGroup(s, matClone) {
    const group = new THREE.Group();
    const numLTCubes = 8;
    let yPosLT = 0; let leanLT = 0;
    for(let i=0; i<numLTCubes; i++) {
        const cubeSizeLT = s * (1.0 - i*0.05);
        const geom = new THREE.BoxGeometry(cubeSizeLT, cubeSizeLT*0.5, cubeSizeLT);
        const cube = new THREE.Mesh(geom, matClone());
        yPosLT += cubeSizeLT*0.25;
        leanLT += s * 0.05;
        cube.position.set(leanLT, yPosLT, 0);
        yPosLT += cubeSizeLT*0.25;
        cube.rotation.y = i * 0.2;
        cube.castShadow = true;
        group.add(cube);
    }
    return group;
}

export function createSpiralCubesGroup(s, matClone) {
    const group = new THREE.Group();
    const numSpiralC = 20; const spiralHeightC = s*3; const turnsC = 2;
    for(let i=0; i<numSpiralC; i++) {
        const angle = (i / numSpiralC) * Math.PI * 2 * turnsC;
        const radiusC = s * (0.2 + (i/numSpiralC)*0.8);
        const cubeSizeC = s * (0.1 + (1 - i/numSpiralC)*0.3);
        const geom = new THREE.BoxGeometry(cubeSizeC, cubeSizeC, cubeSizeC);
        const cube = new THREE.Mesh(geom, matClone());
        cube.position.set(Math.cos(angle)*radiusC, (i/numSpiralC)*spiralHeightC, Math.sin(angle)*radiusC);
        cube.rotation.y = -angle;
        cube.castShadow = true;
        group.add(cube);
    }
    return group;
}

export function createSpiralSpheresGroup(s, matClone) {
    const group = new THREE.Group();
    const numSpiralS = 25; const spiralHeightS = s*3.5; const turnsS = 2.5;
    for(let i=0; i<numSpiralS; i++) {
        const angle = (i / numSpiralS) * Math.PI * 2 * turnsS;
        const radiusS = s * (0.1 + (i/numSpiralS)*1.0);
        const sphereSizeS = s * (0.05 + (1 - i/numSpiralS)*0.3);
        const geom = new THREE.SphereGeometry(sphereSizeS, 16, 8);
        const sphere = new THREE.Mesh(geom, matClone());
        sphere.position.set(Math.cos(angle)*radiusS, (i/numSpiralS)*spiralHeightS, Math.sin(angle)*radiusS);
        sphere.castShadow = true;
        group.add(sphere);
    }
    return group;
}

export function createAbstractSculpture1Group(s, matClone) {
    const group = new THREE.Group();
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(s*0.8, s*0.2, 100, 16, 2, 3), matClone());
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(s*0.5), matClone());
    const bar = new THREE.Mesh(new THREE.BoxGeometry(s*0.2, s*3, s*0.2), matClone());
    ico.position.set(s*0.8, s*0.8, 0);
    bar.position.set(-s*0.8, s*1.5, s*0.5); bar.rotation.z = 0.5;
    knot.castShadow = true; ico.castShadow = true; bar.castShadow = true;
    group.add(knot, ico, bar);
    return group;
}

export function createAbstractSculpture2Group(s, matClone) {
    const group = new THREE.Group();
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(s, 32, 16), matClone());
    const ring = new THREE.Mesh(new THREE.TorusGeometry(s*1.2, s*0.1, 8, 50), matClone());
    const cone = new THREE.Mesh(new THREE.ConeGeometry(s*0.5, s*2.5, 5), matClone());
    const box = new THREE.Mesh(new THREE.BoxGeometry(s*0.3, s*0.3, s*2), matClone());
    ring.rotation.x = Math.PI/2;
    cone.position.y = s; cone.rotation.x = -0.3;
    box.position.set(-s*0.8, s*0.3, 0); box.rotation.y = 0.8;
    sphere.castShadow = true; ring.castShadow = true; cone.castShadow = true; box.castShadow = true;
    group.add(sphere, ring, cone, box);
    return group;
}

export function createAbstractSculpture3Group(s, matClone) {
    const group = new THREE.Group();
    const planeGeom = new THREE.PlaneGeometry(s*2, s*2);
    const plane1 = new THREE.Mesh(planeGeom, matClone());
    const plane2 = new THREE.Mesh(planeGeom, matClone());
    const plane3 = new THREE.Mesh(planeGeom, matClone());
    plane2.rotation.x = Math.PI/2;
    plane3.rotation.y = Math.PI/2;
    // Note: Planes might not cast/receive shadows well by default depending on light angle
    plane1.castShadow = true; plane1.receiveShadow = true; // Enable if needed
    plane2.castShadow = true; plane2.receiveShadow = true;
    plane3.castShadow = true; plane3.receiveShadow = true;
    plane1.material.side = THREE.DoubleSide; // Make planes visible from both sides
    plane2.material.side = THREE.DoubleSide;
    plane3.material.side = THREE.DoubleSide;
    group.add(plane1, plane2, plane3);
    return group;
}

export function createAbstractSculpture4Group(s, matClone) {
    const group = new THREE.Group();
    const numRings=6;
    const ringGeom=new THREE.TorusGeometry(s*1.0, s*0.1, 8, 50);
    for(let i=0; i<numRings; i++){
        const ring = new THREE.Mesh(ringGeom, matClone());
        ring.position.y = i*s*0.3;
        ring.rotation.y = i*0.5;
        ring.scale.x = 1.0 - i*0.1;
        ring.scale.z = 1.0 - i*0.1;
        ring.castShadow = true;
        group.add(ring);
    }
    return group;
}

export function createSaturnLikeGroup(s, matClone) {
    const group = new THREE.Group();
    const planet = new THREE.Mesh(new THREE.SphereGeometry(s, 32, 32), matClone());
    const ring = new THREE.Mesh(new THREE.TorusGeometry(s*1.5, s*0.1, 2, 100), matClone());
    ring.rotation.x = Math.PI / 2.2;
    planet.castShadow = true; ring.castShadow = true; ring.receiveShadow = true; // Ring can receive shadow from planet
    group.add(planet, ring);
    return group;
}

// Note: Wireframe specific combos handled by wireframe logic in main.js
// using the base geometry functions.
export function createWireframeCubeNestedBase(s) { // Returns geometry for the group structure
    const group = new THREE.Group(); // Structure only
    const geomOuter = new THREE.BoxGeometry(s * 1.5, s * 1.5, s * 1.5);
    const geomInner = new THREE.BoxGeometry(s * 1.5 * 0.6, s * 1.5 * 0.6, s * 1.5 * 0.6); // Scale geometry directly
    // We return geometries and let main.js handle mesh/material/wireframe
    // Need a way to represent this... maybe return an array of geometries/transforms?
    // Simpler for now: Return a group containing meshes with dummy material info, main.js replaces material
    const meshOuter = new THREE.Mesh(geomOuter); meshOuter.name="outer";
    const meshInner = new THREE.Mesh(geomInner); meshInner.name="inner";
    meshInner.rotation.y = 0.5;
    group.add(meshOuter, meshInner);
    return group; // Return group, main.js will apply wireframe material
}

export function createIcosahedronInSphereBase(s) { // Returns group structure
     const group = new THREE.Group();
     const sphere = new THREE.Mesh(new THREE.SphereGeometry(s*1.2, 16, 8)); sphere.name="sphere";
     const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(s*0.8)); icosahedron.name="icosahedron";
     group.add(sphere, icosahedron);
     return group; // Return group, main.js will apply wireframe material
}