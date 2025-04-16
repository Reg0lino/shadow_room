import * as THREE from 'three';

export function createTwoCubesApartGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s*0.8, s*0.8, s*0.8), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    mesh1.position.x = -s*0.8;
    mesh2.position.x = s*0.8;
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createTwoSpheresApartGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(s*0.6, 32, 16), matClone());
    const mesh2 = mesh1.clone(); mesh2.material = matClone();
    mesh1.position.x = -s*1.0;
    mesh2.position.x = s*1.0;
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createSphereCubeApartGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(s*0.7, 32, 16), matClone());
    const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(s*0.9, s*0.9, s*0.9), matClone());
    mesh1.position.x = -s*1.0;
    mesh2.position.x = s*1.0;
    mesh1.castShadow = true; mesh2.castShadow = true;
    group.add(mesh1, mesh2);
    return group;
}

export function createFourCornersCubesGroup(s, matClone) {
    const group = new THREE.Group();
    const cornerDist = s*1.2;
    const cornerSize = s*0.5;
    const geom = new THREE.BoxGeometry(cornerSize,cornerSize,cornerSize);
    const mesh1 = new THREE.Mesh(geom, matClone()); mesh1.castShadow = true;
    const mesh2 = new THREE.Mesh(geom, matClone()); mesh2.castShadow = true;
    const mesh3 = new THREE.Mesh(geom, matClone()); mesh3.castShadow = true;
    const mesh4 = new THREE.Mesh(geom, matClone()); mesh4.castShadow = true;
    mesh1.position.set(-cornerDist, 0, -cornerDist);
    mesh2.position.set(cornerDist, 0, -cornerDist);
    mesh3.position.set(-cornerDist, 0, cornerDist);
    mesh4.position.set(cornerDist, 0, cornerDist);
    group.add(mesh1, mesh2, mesh3, mesh4);
    return group;
}

export function createLineOfCubesGroup(s, matClone) {
    const group = new THREE.Group();
    const lineNum=5;
    const lineDist = s*0.8;
    const lineSize=s*0.4;
    const geom = new THREE.BoxGeometry(lineSize,lineSize,lineSize);
    for(let i=0; i<lineNum; i++){
        const mesh1 = new THREE.Mesh(geom, matClone());
        mesh1.castShadow = true;
        mesh1.position.x = (i - (lineNum-1)/2) * lineDist;
        group.add(mesh1);
    }
    return group;
}