import * as THREE from 'three';

export function createBoxWithPolesGroup(s, matClone) {
    const group = new THREE.Group();
    const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(s*1.5, s*0.5, s*1.5), matClone());
    const poleGeom = new THREE.CylinderGeometry(s*0.1, s*0.1, s*2.5, 16);
    const mesh2 = new THREE.Mesh(poleGeom, matClone());
    const mesh3 = new THREE.Mesh(poleGeom, matClone());
    const mesh4 = new THREE.Mesh(poleGeom, matClone());
    const mesh5 = new THREE.Mesh(poleGeom, matClone());
    mesh2.position.set(s*0.6, s*1.0, s*0.6);
    mesh3.position.set(-s*0.6, s*1.0, s*0.6);
    mesh4.position.set(s*0.6, s*1.0, -s*0.6);
    mesh5.position.set(-s*0.6, s*1.0, -s*0.6);
    mesh1.castShadow = true; mesh2.castShadow = true; mesh3.castShadow = true; mesh4.castShadow = true; mesh5.castShadow = true;
    group.add(mesh1, mesh2, mesh3, mesh4, mesh5);
    return group;
}

export function createCylinderRingGroup(s, matClone) {
    const group = new THREE.Group();
    const numCylinders = 12;
    const ringRadiusC = s * 1.5;
    const cylGeom = new THREE.CylinderGeometry(s*0.15, s*0.15, s*0.8, 16);
    for(let i=0; i<numCylinders; i++) {
        const angle = (i / numCylinders) * Math.PI * 2;
        const mesh1 = new THREE.Mesh(cylGeom, matClone());
        mesh1.castShadow = true;
        mesh1.position.set(Math.cos(angle) * ringRadiusC, s*0.4, Math.sin(angle) * ringRadiusC);
        mesh1.rotation.z = Math.PI / 2;
        group.add(mesh1);
    }
    return group;
}

export function createSphereRingGroup(s, matClone) {
    const group = new THREE.Group();
    const numSpheresRing = 10;
    const ringRadiusS = s * 1.3;
    const sphereGeomRing = new THREE.SphereGeometry(s*0.3, 16, 8);
    for(let i=0; i<numSpheresRing; i++) {
        const angle = (i / numSpheresRing) * Math.PI * 2;
        const mesh1 = new THREE.Mesh(sphereGeomRing, matClone());
        mesh1.castShadow = true;
        mesh1.position.set(Math.cos(angle) * ringRadiusS, 0, Math.sin(angle) * ringRadiusS);
        group.add(mesh1);
    }
    return group;
}

export function createCubeRingGroup(s, matClone) {
    const group = new THREE.Group();
    const numCubesRing = 8;
    const ringRadiusB = s * 1.4;
    const boxGeomRing = new THREE.BoxGeometry(s*0.4, s*0.4, s*0.4);
    for(let i=0; i<numCubesRing; i++) {
        const angle = (i / numCubesRing) * Math.PI * 2;
        const mesh1 = new THREE.Mesh(boxGeomRing, matClone());
        mesh1.castShadow = true;
        mesh1.position.set(Math.cos(angle) * ringRadiusB, 0, Math.sin(angle) * ringRadiusB);
        mesh1.rotation.y = -angle;
        group.add(mesh1);
    }
    return group;
}

export function createCubeGridFlatGroup(s, matClone) {
    const group = new THREE.Group();
    const gridSizeF = 5;
    const gridSpacingF = s*0.7;
    const gridBoxSizeF = s*0.4;
    const geom = new THREE.BoxGeometry(gridBoxSizeF,gridBoxSizeF,gridBoxSizeF);
    for(let x=0; x<gridSizeF; x++) {
        for(let z=0; z<gridSizeF; z++) {
            const mesh1 = new THREE.Mesh(geom, matClone());
            mesh1.castShadow = true;
            mesh1.position.set((x - (gridSizeF-1)/2)*gridSpacingF, 0, (z - (gridSizeF-1)/2)*gridSpacingF);
            group.add(mesh1);
        }
    }
    return group;
}

export function createSphereGridFlatGroup(s, matClone) {
    const group = new THREE.Group();
    const gridSizeF_S = 4;
    const gridSpacingF_S = s*0.9;
    const gridSphereSizeF = s*0.3;
    const geom = new THREE.SphereGeometry(gridSphereSizeF, 16, 8);
    for(let x=0; x<gridSizeF_S; x++) {
        for(let z=0; z<gridSizeF_S; z++) {
            const mesh1 = new THREE.Mesh(geom, matClone());
            mesh1.castShadow = true;
            mesh1.position.set((x - (gridSizeF_S-1)/2)*gridSpacingF_S, gridSphereSizeF, (z - (gridSizeF_S-1)/2)*gridSpacingF_S);
            group.add(mesh1);
        }
    }
    return group;
}

export function createRandomCubesClusterGroup(s, matClone) {
    const group = new THREE.Group();
    const numRandCubes = 20;
    for(let i=0; i<numRandCubes; i++) {
        const geom = new THREE.BoxGeometry(s*(0.1+Math.random()*0.5), s*(0.1+Math.random()*0.5), s*(0.1+Math.random()*0.5));
        const mesh1 = new THREE.Mesh(geom, matClone());
        mesh1.castShadow = true;
        mesh1.position.set( (Math.random()-0.5)*s*2.5, (Math.random())*s*2.5, (Math.random()-0.5)*s*2.5 );
        mesh1.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        group.add(mesh1);
    }
    return group;
}

export function createRandomSpheresClusterGroup(s, matClone) {
    const group = new THREE.Group();
    const numRandSpheres = 15;
    for(let i=0; i<numRandSpheres; i++) {
        const geom = new THREE.SphereGeometry(s*(0.1 + Math.random()*0.4), 16, 8);
        const mesh1 = new THREE.Mesh(geom, matClone());
        mesh1.castShadow = true;
        mesh1.position.set( (Math.random()-0.5)*s*2, (Math.random())*s*2.5, (Math.random()-0.5)*s*2 );
        group.add(mesh1);
    }
    return group;
}

export function createRandomMixedClusterGroup(s, matClone) {
    const group = new THREE.Group();
    const numRandMixed = 25;
    for(let i=0; i<numRandMixed; i++) {
        let geom;
        const type = Math.random();
        if(type < 0.4) geom = new THREE.BoxGeometry(s*(0.1+Math.random()*0.4), s*(0.1+Math.random()*0.4), s*(0.1+Math.random()*0.4));
        else if (type < 0.8) geom = new THREE.SphereGeometry(s*(0.1+Math.random()*0.3), 16, 8);
        else geom = new THREE.ConeGeometry(s*(0.1+Math.random()*0.3), s*(0.2+Math.random()*0.5), 16);
        const mesh1 = new THREE.Mesh(geom, matClone());
        mesh1.castShadow = true;
        mesh1.position.set( (Math.random()-0.5)*s*3, (Math.random())*s*3, (Math.random()-0.5)*s*3 );
        mesh1.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        group.add(mesh1);
    }
    return group;
}