import * as THREE from 'three';

export function createDogRunningGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.4, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.5, s*0.5), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.1, s*0.1, s*0.6, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI / 2; body.position.y = s*0.4; body.castShadow = true;
    head.position.set(s*0.6, s*0.6, 0); head.castShadow = true;

    legFL.position.set(s*0.4, 0.1, s*0.25); legFL.rotation.x = 1.0; legFL.castShadow = true;
    legFR.position.set(s*0.4, 0.1, -s*0.25); legFR.rotation.x = -0.5; legFR.castShadow = true;
    legBL.position.set(-s*0.4, 0.1, s*0.25); legBL.rotation.x = -0.8; legBL.castShadow = true;
    legBR.position.set(-s*0.4, 0.1, -s*0.25); legBR.rotation.x = 0.6; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createDogSittingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.4, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.5, s*0.5), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.1, s*0.1, s*0.5, 8); // Slightly shorter?
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.position.set(-s*0.3, s*0.3, 0); body.rotation.z = -0.8; body.castShadow = true;
    head.position.set(s*0.2, s*0.8, 0); head.rotation.y = -0.2; head.castShadow = true;

    legFL.position.set(s*0.1, 0, s*0.25); legFL.castShadow = true;
    legFR.position.set(s*0.1, 0, -s*0.25); legFR.castShadow = true;
    legBL.position.set(-s*0.5, -s*0.1, s*0.25); legBL.rotation.x = 1.5; legBL.castShadow = true;
    legBR.position.set(-s*0.5, -s*0.1, -s*0.25); legBR.rotation.x = 1.5; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createDogPlayingBowGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.4, s*1.1, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.5, s*0.5), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.1, s*0.1, s*0.6, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = 1.0; body.position.set(-s*0.1, s*0.6, 0); body.castShadow = true;
    head.position.set(s*0.4, s*0.3, 0); head.castShadow = true;

    legFL.position.set(s*0.3, 0, s*0.25); legFL.castShadow = true;
    legFR.position.set(s*0.3, 0, -s*0.25); legFR.castShadow = true;
    legBL.position.set(-s*0.5, s*0.8, s*0.25); legBL.rotation.x = -0.5; legBL.castShadow = true;
    legBR.position.set(-s*0.5, s*0.8, -s*0.25); legBR.rotation.x = -0.5; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createDogBeggingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.4, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.5, s*0.5), matClone());
    const pawGeom = new THREE.CylinderGeometry(s*0.1, s*0.1, s*0.3, 8); // Front paws
    const legGeom = new THREE.CylinderGeometry(s*0.1, s*0.1, s*0.5, 8); // Back legs
    const pawL = new THREE.Mesh(pawGeom, matClone());
    const pawR = new THREE.Mesh(pawGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.position.set(-s*0.3, s*0.3, 0); body.rotation.z = -0.8; body.castShadow = true;
    head.position.set(s*0.2, s*0.8, 0); head.rotation.y = -0.2; head.castShadow = true;

    pawL.position.set(s*0.1, s*0.5, s*0.15); pawL.rotation.x = -1.0; pawL.castShadow = true;
    pawR.position.set(s*0.1, s*0.5, -s*0.15); pawR.rotation.x = -1.0; pawR.castShadow = true;
    legBL.position.set(-s*0.5, -s*0.1, s*0.25); legBL.rotation.x = 1.5; legBL.castShadow = true;
    legBR.position.set(-s*0.5, -s*0.1, -s*0.25); legBR.rotation.x = 1.5; legBR.castShadow = true;

    group.add(body, head, pawL, pawR, legBL, legBR);
    return group;
}

export function createDogLyingDownGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.4, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.5, s*0.5), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.1, s*0.1, s*0.6, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI/2; body.position.y = s*0.2; body.castShadow = true;
    head.position.set(s*0.6, s*0.3, 0); head.castShadow = true;

    legFL.position.set(s*0.4, 0, s*0.25); legFL.rotation.x = 1.57; legFL.castShadow = true;
    legFR.position.set(s*0.4, 0, -s*0.25); legFR.rotation.x = 1.57; legFR.castShadow = true;
    legBL.position.set(-s*0.4, 0, s*0.25); legBL.rotation.x = 1.57; legBL.castShadow = true;
    legBR.position.set(-s*0.4, 0, -s*0.25); legBR.rotation.x = 1.57; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}


export function createCatStretchingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.35, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.35, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.08, s*0.08, s*0.6, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = 0.5; body.position.set(-s*0.2, s*0.3, 0); body.castShadow = true;
    head.position.set(s*0.5, s*0.5, 0); head.rotation.z = -0.3; head.castShadow = true;

    legFL.position.set(s*0.3, 0, s*0.2); legFL.rotation.x = -0.5; legFL.castShadow = true;
    legFR.position.set(s*0.3, 0, -s*0.2); legFR.rotation.x = -0.5; legFR.castShadow = true;
    legBL.position.set(-s*0.6, 0.1, s*0.2); legBL.rotation.x = 0.2; legBL.castShadow = true;
    legBR.position.set(-s*0.6, 0.1, -s*0.2); legBR.rotation.x = 0.2; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createCatPlayingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.35, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.35, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.08, s*0.08, s*0.5, 8);
    const toy = new THREE.Mesh(new THREE.SphereGeometry(s*0.1, 16, 8), matClone());
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = -1.0; body.position.y = s*0.5; body.castShadow = true;
    head.position.set(s*0.1, s*0.9, 0); head.castShadow = true;
    toy.position.set(s*0.5, 0, 0); toy.castShadow = true;

    legFL.position.set(s*0.2, s*0.3, s*0.2); legFL.rotation.x = -1.5; legFL.castShadow = true;
    legFR.position.set(s*0.2, s*0.3, -s*0.2); legFR.rotation.x = -1.5; legFR.castShadow = true;
    legBL.position.set(-s*0.3, 0, s*0.2); legBL.castShadow = true;
    legBR.position.set(-s*0.3, 0, -s*0.2); legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR, toy);
    return group;
}

export function createCatSleepingCurledGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.TorusGeometry(s*0.5, s*0.25, 8, 50, Math.PI * 1.8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.3, 16, 8), matClone());
    body.rotation.x = Math.PI / 2; body.position.y = s*0.25; body.castShadow = true;
    head.position.set(s*0.4, s*0.2, 0); head.castShadow = true;
    group.add(body, head);
    return group;
}

export function createCatWalkingTailUpGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.35, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.35, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.08, s*0.08, s*0.5, 8);
    const earGeom = new THREE.ConeGeometry(s*0.1, s*0.2, 8);
    const tailGeom = new THREE.CylinderGeometry(s*0.05, s*0.05, s*0.8, 8);
    const earL = new THREE.Mesh(earGeom, matClone());
    const earR = new THREE.Mesh(earGeom, matClone());
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());
    const tail = new THREE.Mesh(tailGeom, matClone());

    body.rotation.z = Math.PI / 2; body.position.y = s*0.3; body.castShadow = true;
    head.position.set(s*0.5, s*0.45, 0); head.castShadow = true;
    earL.position.set(s*0.5, s*0.7, 0.15); earL.castShadow = true;
    earR.position.set(s*0.5, s*0.7, -0.15); earR.castShadow = true;
    tail.position.set(-s*0.5, s*0.5, 0); tail.rotation.x = -1.2; tail.castShadow = true;

    legFL.position.set(s*0.35, 0, s*0.2); legFL.rotation.x = -0.2; legFL.castShadow = true;
    legFR.position.set(s*0.35, 0, -s*0.2); legFR.castShadow = true;
    legBL.position.set(-s*0.35, 0, s*0.2); legBL.castShadow = true;
    legBR.position.set(-s*0.35, 0, -s*0.2); legBR.rotation.x = -0.2; legBR.castShadow = true;

    group.add(body, head, earL, earR, legFL, legFR, legBL, legBR, tail);
    return group;
}

export function createCatCrouchingLowGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.35, s*1.1, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.35, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.08, s*0.08, s*0.3, 8); // Bent legs
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI/2; body.position.y = s*0.15; body.castShadow = true;
    head.position.set(s*0.55, s*0.25, 0); head.castShadow = true;

    legFL.position.set(s*0.4, 0, s*0.2); legFL.rotation.x=1.4; legFL.castShadow = true;
    legFR.position.set(s*0.4, 0, -s*0.2); legFR.rotation.x=1.4; legFR.castShadow = true;
    legBL.position.set(-s*0.4, 0, s*0.2); legBL.rotation.x=1.5; legBL.castShadow = true;
    legBR.position.set(-s*0.4, 0, -s*0.2); legBR.rotation.x=1.5; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

// --- Bird Poses ---
export function createBirdFlyingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.2, s*0.8, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.25, 16, 8), matClone());
    const wingGeom = new THREE.BoxGeometry(s*1.5, s*0.05, s*0.4); wingGeom.translate(-s*0.75, 0, 0); // Pivot at base
    const wingL = new THREE.Mesh(wingGeom, matClone());
    const wingR = new THREE.Mesh(wingGeom, matClone());

    body.rotation.x = 0.2; body.position.y = s*0.5; body.castShadow = true;
    head.position.set(s*0.4, s*0.6, 0); head.castShadow = true;
    wingL.position.set(0, s*0.5, s*0.2); wingL.rotation.z = -0.5; wingL.castShadow = true;
    wingR.position.set(0, s*0.5, -s*0.2); wingR.rotation.z = 0.5; wingR.castShadow = true;

    group.add(body, head, wingL, wingR);
    return group;
}

export function createBirdPerchedGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.2, s*0.7, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.25, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.05, s*0.05, s*0.2, 8);
    const legL = new THREE.Mesh(legGeom, matClone());
    const legR = new THREE.Mesh(legGeom, matClone());

    body.rotation.x = -0.5; body.position.y = s*0.3; body.castShadow = true;
    head.position.set(s*0.25, s*0.5, 0); head.castShadow = true;
    legL.position.set(s*0.1, 0, s*0.05); legL.castShadow = true;
    legR.position.set(s*0.1, 0, -s*0.05); legR.castShadow = true;

    group.add(body, head, legL, legR);
    return group;
}

export function createBirdTakingOffGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.2, s*0.8, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.25, 16, 8), matClone());
    const wingGeom = new THREE.BoxGeometry(s*1.5, s*0.05, s*0.4); wingGeom.translate(-s*0.75, 0, 0);
    const wingL = new THREE.Mesh(wingGeom, matClone());
    const wingR = new THREE.Mesh(wingGeom, matClone());

    body.rotation.x = -0.8; body.position.y = s*0.3; body.castShadow = true;
    head.position.set(s*0.3, s*0.7, 0); head.castShadow = true;
    wingL.position.set(0, s*0.4, s*0.2); wingL.rotation.z = -1.2; wingL.castShadow = true;
    wingR.position.set(0, s*0.4, -s*0.2); wingR.rotation.z = 1.2; wingR.castShadow = true;

    group.add(body, head, wingL, wingR);
    return group;
}

export function createBirdPeckingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.2, s*0.7, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.25, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.05, s*0.05, s*0.2, 8);
    const legL = new THREE.Mesh(legGeom, matClone());
    const legR = new THREE.Mesh(legGeom, matClone());

    body.rotation.x = 0.8; body.position.y = s*0.2; body.castShadow = true;
    head.position.set(s*0.4, s*0.1, 0); head.rotation.x = 0.5; head.castShadow = true;
    legL.position.set(-s*0.1, 0, s*0.05); legL.castShadow = true;
    legR.position.set(-s*0.1, 0, -s*0.05); legR.castShadow = true;

    group.add(body, head, legL, legR);
    return group;
}

export function createBirdWingsFoldedGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.2, s*0.7, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.25, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.05, s*0.05, s*0.2, 8);
    const wingGeom = new THREE.BoxGeometry(s*0.1, s*0.05, s*0.5); // Folded wing
    const legL = new THREE.Mesh(legGeom, matClone());
    const legR = new THREE.Mesh(legGeom, matClone());
    const wingL = new THREE.Mesh(wingGeom, matClone());
    const wingR = new THREE.Mesh(wingGeom, matClone());

    body.rotation.x = -0.5; body.position.y = s*0.3; body.castShadow = true;
    head.position.set(s*0.25, s*0.5, 0); head.castShadow = true;
    legL.position.set(s*0.1, 0, s*0.05); legL.castShadow = true;
    legR.position.set(s*0.1, 0, -s*0.05); legR.castShadow = true;
    wingL.position.set(0, s*0.3, s*0.1); wingL.castShadow = true;
    wingR.position.set(0, s*0.3, -s*0.1); wingR.castShadow = true;

    group.add(body, head, legL, legR, wingL, wingR);
    return group;
}

// --- Horse Poses ---
export function createHorseGallopingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.6, s*2.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.6, s*0.7, s*0.6), matClone()); // Approx head shape
    const legGeom = new THREE.CylinderGeometry(s*0.15, s*0.12, s*1.2, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI / 2; body.position.y = s*0.8; body.castShadow = true;
    head.position.set(s*0.9, s*1.1, 0); head.castShadow = true;

    legFL.position.set(s*0.7, 0.2, s*0.3); legFL.rotation.x = 1.2; legFL.castShadow = true;
    legFR.position.set(s*0.7, 0.2, -s*0.3); legFR.rotation.x = 0.8; legFR.castShadow = true;
    legBL.position.set(-s*0.7, 0.2, s*0.3); legBL.rotation.x = -0.6; legBL.castShadow = true;
    legBR.position.set(-s*0.7, 0.2, -s*0.3); legBR.rotation.x = -1.0; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createHorseRearingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.6, s*2.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.6, s*0.7, s*0.6), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.15, s*0.12, s*1.2, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = -0.8; body.position.y = s*0.8; body.castShadow = true;
    head.position.set(-s*0.8, s*1.8, 0); head.rotation.z = 0.5; head.castShadow = true;

    legFL.position.set(-s*0.4, s*1.0, s*0.3); legFL.rotation.x = -1.5; legFL.castShadow = true;
    legFR.position.set(-s*0.4, s*1.0, -s*0.3); legFR.rotation.x = -1.2; legFR.castShadow = true;
    legBL.position.set(s*0.6, 0, s*0.3); legBL.castShadow = true;
    legBR.position.set(s*0.6, 0, -s*0.3); legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createHorseTrottingGroup(s, matClone) {
     const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.6, s*2.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.6, s*0.7, s*0.6), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.15, s*0.12, s*1.2, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI / 2; body.position.y = s*0.8; body.castShadow = true;
    head.position.set(s*0.9, s*1.1, 0); head.castShadow = true;

    legFL.position.set(s*0.7, 0.1, s*0.3); legFL.rotation.x = -0.6; legFL.castShadow = true;
    legFR.position.set(s*0.7, 0.1, -s*0.3); legFR.rotation.x = 0.1; legFR.castShadow = true;
    legBL.position.set(-s*0.7, 0.1, s*0.3); legBL.rotation.x = 0.2; legBL.castShadow = true;
    legBR.position.set(-s*0.7, 0.1, -s*0.3); legBR.rotation.x = -0.7; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createHorseGrazingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.6, s*2.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.6, s*0.7, s*0.6), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.15, s*0.12, s*1.2, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI / 2; body.position.y = s*0.8; body.castShadow = true;
    head.position.set(s*0.8, s*0.4, 0); head.rotation.z = -0.8; head.castShadow = true;

    legFL.position.set(s*0.7, 0, s*0.3); legFL.castShadow = true;
    legFR.position.set(s*0.7, 0, -s*0.3); legFR.castShadow = true;
    legBL.position.set(-s*0.7, 0, s*0.3); legBL.castShadow = true;
    legBR.position.set(-s*0.7, 0, -s*0.3); legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createHorseStandingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.6, s*2.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.6, s*0.7, s*0.6), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.15, s*0.12, s*1.2, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI / 2; body.position.y = s*0.8; body.castShadow = true;
    head.position.set(s*0.9, s*1.1, 0); head.castShadow = true;

    legFL.position.set(s*0.7, 0, s*0.3); legFL.castShadow = true;
    legFR.position.set(s*0.7, 0, -s*0.3); legFR.castShadow = true;
    legBL.position.set(-s*0.7, 0, s*0.3); legBL.castShadow = true;
    legBR.position.set(-s*0.7, 0, -s*0.3); legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

// --- Other Animals ---
export function createFishSwimmingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(s*0.8, 32, 16), matClone());
    const tail = new THREE.Mesh(new THREE.ConeGeometry(s*0.4, s*0.6, 8), matClone());
    const finGeom = new THREE.PlaneGeometry(s*0.5, s*0.3);
    const finTop = new THREE.Mesh(finGeom, matClone());
    const finSideL = new THREE.Mesh(finGeom, matClone());
    const finSideR = new THREE.Mesh(finGeom, matClone());

    body.scale.set(1.8, 0.8, 1.0); body.position.y = s*0.4; body.castShadow = true;
    tail.position.set(-s*1.2, s*0.4, 0); tail.rotation.z = -1.57; tail.castShadow = true;

    finTop.scale.set(0.8, 0.6, 1); finTop.position.set(0, s*0.7, 0); finTop.rotation.x = -0.2; finTop.castShadow = true;
    finSideL.scale.set(0.7, 0.7, 1); finSideL.position.set(s*0.2, s*0.2, s*0.3); finSideL.rotation.y = -0.5; finSideL.castShadow = true;
    finSideR.scale.set(0.7, 0.7, 1); finSideR.position.set(s*0.2, s*0.2, -s*0.3); finSideR.rotation.y = 0.5; finSideR.castShadow = true;

    group.add(body, tail, finTop, finSideL, finSideR);
    return group;
}

export function createSnakeCoiledGroup(s, matClone) {
    const group = new THREE.Group();
    const snakePointsC = [];
    const coilRC = s*0.8; const coilHC = s*0.15; const coilTurnsC = 3; const coilSegmentsC = 100;
    for(let i=0; i<=coilSegmentsC; i++){
        const t = i/coilSegmentsC; const angle = t * Math.PI * 2 * coilTurnsC;
        const radius = coilRC * (1 - t*0.8);
        const x = Math.cos(angle) * radius; const z = Math.sin(angle) * radius; const y = t*coilHC;
        snakePointsC.push(new THREE.Vector3(x, y, z));
    }
    const snakeCurveC = new THREE.CatmullRomCurve3(snakePointsC);
    const body = new THREE.Mesh(new THREE.TubeGeometry(snakeCurveC, coilSegmentsC, s*0.1, 8, false), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.15, 16, 8), matClone());
    head.position.copy(snakePointsC[snakePointsC.length-1]);
    body.castShadow = true; head.castShadow = true;
    group.add(body, head);
    return group;
}

export function createSnakeSlitheringGroup(s, matClone) {
    const group = new THREE.Group();
    const snakePointsS = [];
    const slitherAmp = s*0.5; const slitherLen = s*3; const slitherSegs = 100;
    for(let i=0; i<=slitherSegs; i++){
        const t = i/slitherSegs;
        const x = (t - 0.5) * slitherLen;
        const z = Math.sin(t * Math.PI * 4) * slitherAmp;
        snakePointsS.push(new THREE.Vector3(x, s*0.1, z));
    }
    const snakeCurveS = new THREE.CatmullRomCurve3(snakePointsS);
    const body = new THREE.Mesh(new THREE.TubeGeometry(snakeCurveS, slitherSegs, s*0.1, 8, false), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.15, 16, 8), matClone());
    head.position.copy(snakePointsS[snakePointsS.length-1]);
    body.castShadow = true; head.castShadow = true;
    group.add(body, head);
    return group;
}

export function createFrogJumpingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.2, 16, 8), matClone());
    const fLegUpperGeom = new THREE.CylinderGeometry(s*0.05, s*0.05, s*0.3, 8);
    const fLegLowerGeom = new THREE.CylinderGeometry(s*0.05, s*0.05, s*0.3, 8); // Same geom, different pos/rot
    const bLegUpperGeom = new THREE.CylinderGeometry(s*0.08, s*0.06, s*0.6, 8);
    const bLegLowerGeom = new THREE.CylinderGeometry(s*0.08, s*0.06, s*0.6, 8); // Same geom, different pos/rot

    const fLegUL = new THREE.Mesh(fLegUpperGeom, matClone()); const fLegUR = new THREE.Mesh(fLegUpperGeom, matClone());
    const fLegLL = new THREE.Mesh(fLegLowerGeom, matClone()); const fLegLR = new THREE.Mesh(fLegLowerGeom, matClone());
    const bLegUL = new THREE.Mesh(bLegUpperGeom, matClone()); const bLegUR = new THREE.Mesh(bLegUpperGeom, matClone());
    const bLegLL = new THREE.Mesh(bLegLowerGeom, matClone()); const bLegLR = new THREE.Mesh(bLegLowerGeom, matClone());

    body.scale.y = 0.7; body.position.y = s*0.2; body.castShadow = true;
    head.position.set(s*0.3, s*0.4, 0); head.castShadow = true;

    fLegUL.position.set(s*0.2, s*0.1, s*0.2); fLegUL.rotation.x = -0.5; fLegUL.castShadow = true;
    fLegUR.position.set(s*0.2, s*0.1, -s*0.2); fLegUR.rotation.x = -0.5; fLegUR.castShadow = true;
    fLegLL.position.copy(fLegUL.position).y -= s*0.15; fLegLL.rotation.x = -1.0; fLegLL.castShadow = true; // Adjust pos relative
    fLegLR.position.copy(fLegUR.position).y -= s*0.15; fLegLR.rotation.x = -1.0; fLegLR.castShadow = true; // Adjust pos relative

    bLegUL.position.set(-s*0.2, s*0.1, s*0.25); bLegUL.rotation.x = 1.0; bLegUL.castShadow = true;
    bLegUR.position.set(-s*0.2, s*0.1, -s*0.25); bLegUR.rotation.x = 1.0; bLegUR.castShadow = true;
    bLegLL.position.copy(bLegUL.position).y -= s*0.2; bLegLL.rotation.x = 2.5; bLegLL.castShadow = true; // Adjust pos relative
    bLegLR.position.copy(bLegUR.position).y -= s*0.2; bLegLR.rotation.x = 2.5; bLegLR.castShadow = true; // Adjust pos relative

    group.add(body, head, fLegUL, fLegUR, fLegLL, fLegLR, bLegUL, bLegUR, bLegLL, bLegLR);
    return group;
}

export function createDeerLeapingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.5, s*1.8, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.4, s*0.6, s*0.4), matClone()); // Approx head
    const legGeom = new THREE.CylinderGeometry(s*0.1, s*0.08, s*1.0, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = 0.6; body.position.y = s*1.0; body.castShadow = true;
    head.position.set(s*0.8, s*1.6, 0); head.castShadow = true;

    legFL.position.set(s*0.6, s*0.8, s*0.2); legFL.rotation.x = -1.2; legFL.castShadow = true;
    legFR.position.set(s*0.6, s*0.8, -s*0.2); legFR.rotation.x = -1.5; legFR.castShadow = true;
    legBL.position.set(-s*0.7, s*0.7, s*0.2); legBL.rotation.x = 1.5; legBL.castShadow = true;
    legBR.position.set(-s*0.7, s*0.7, -s*0.2); legBR.rotation.x = 1.8; legBR.castShadow = true;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createElephantWalkingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(s*1.2, 16, 12), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.8, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.3, s*0.25, s*1.5, 12); // Thick legs
    const trunkGeom = new THREE.CylinderGeometry(s*0.1, s*0.3, s*1.0, 12); // Trunk
    const trunk = new THREE.Mesh(trunkGeom, matClone());
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.scale.set(1.5, 1.0, 1.0); body.position.y=s*0.75; body.castShadow = true;
    head.position.set(s*1.0, s*1.0, 0); head.castShadow = true;
    trunk.position.set(s*1.3, s*0.6, 0); trunk.rotation.z = 0.8; trunk.castShadow = true;

    legFL.position.set(s*0.6, 0, s*0.4); legFL.rotation.x = -0.2; legFL.castShadow = true;
    legFR.position.set(s*0.6, 0, -s*0.4); legFR.castShadow = true;
    legBL.position.set(-s*0.6, 0, s*0.4); legBL.castShadow = true;
    legBR.position.set(-s*0.6, 0, -s*0.4); legBR.rotation.x = -0.2; legBR.castShadow = true;

    group.add(body, head, trunk, legFL, legFR, legBL, legBR);
    return group;
}

export function createMonkeyHangingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.25, s*0.8, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.3, 16, 8), matClone());
    const armGeom = new THREE.CapsuleGeometry(s*0.08, s*0.9, 4, 8); // Long arms
    const legGeom = new THREE.CapsuleGeometry(s*0.1, s*0.7, 4, 8); // Legs
    const tailGeom = new THREE.CylinderGeometry(s*0.05, s*0.05, s*1.0, 8); // Tail
    const armL = new THREE.Mesh(armGeom, matClone());
    const armR = new THREE.Mesh(armGeom, matClone());
    const legL = new THREE.Mesh(legGeom, matClone());
    const legR = new THREE.Mesh(legGeom, matClone());
    const tail = new THREE.Mesh(tailGeom, matClone());

    body.position.y = s*1.2; body.castShadow = true;
    head.position.y = s*1.2 + s*0.4+s*0.15; head.castShadow = true;
    tail.position.set(0, s*0.8, -s*0.1); tail.rotation.x = 0.8; tail.castShadow = true;

    armL.position.set(-s*0.2, s*1.5, 0); armL.rotation.z = -1.8; armL.castShadow = true; // Arms reaching up
    armR.position.set(s*0.2, s*1.5, 0); armR.rotation.z = 1.8; armR.castShadow = true;
    legL.position.set(-s*0.15, s*0.8, 0); legL.rotation.z = -0.5; legL.castShadow = true; // Legs dangling
    legR.position.set(s*0.15, s*0.8, 0); legR.rotation.z = 0.5; legR.castShadow = true;

    group.add(body, head, armL, armR, legL, legR, tail);
    return group;
}

export function createBearStandingGroup(s, matClone) {
    const group = new THREE.Group();
    const bodyLower = new THREE.Mesh(new THREE.SphereGeometry(s*0.9, 16, 12), matClone());
    const bodyUpper = new THREE.Mesh(new THREE.SphereGeometry(s*0.7, 16, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.5, 16, 8), matClone()); // Head
    const armGeom = new THREE.CylinderGeometry(s*0.2, s*0.15, s*0.8, 8); // Arms
    const legGeom = new THREE.CylinderGeometry(s*0.25, s*0.2, s*1.0, 8); // Legs
    const armL = new THREE.Mesh(armGeom, matClone());
    const armR = new THREE.Mesh(armGeom, matClone());
    const legL = new THREE.Mesh(legGeom, matClone());
    const legR = new THREE.Mesh(legGeom, matClone());

    bodyLower.scale.y=0.8; bodyLower.castShadow = true;
    bodyUpper.position.y = s*0.6; bodyUpper.castShadow = true;
    head.position.y = s*0.6+s*0.7+s*0.25; head.castShadow = true;

    armL.position.set(-s*0.5, s*1.0, 0); armL.rotation.z = -0.5; armL.castShadow = true;
    armR.position.set(s*0.5, s*1.0, 0); armR.rotation.z = 0.5; armR.castShadow = true;
    legL.position.set(-s*0.3, 0, 0); legL.castShadow = true;
    legR.position.set(s*0.3, 0, 0); legR.castShadow = true;

    group.add(bodyLower, bodyUpper, head, armL, armR, legL, legR);
    return group;
}

export function createBearWalking4LegsGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.6, s*1.6, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.5, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.2, s*0.18, s*0.9, 8);
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(s*0.15, s*0.2, s*0.3, 8), matClone());
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.scale.set(1.5, 1, 1.2); body.position.y=s*0.4; body.castShadow = true;
    head.position.set(s*1.0, s*0.6, 0); head.castShadow = true;

    legFL.position.set(s*0.7, 0, s*0.3); legFL.rotation.x = -0.3; legFL.castShadow = true; // Step
    legFR.position.set(s*0.7, 0, -s*0.3); legFR.castShadow = true;
    legBL.position.set(-s*0.7, 0, s*0.3); legBL.castShadow = true;
    legBR.position.set(-s*0.7, 0, -s*0.3); legBR.rotation.x = -0.3; legBR.castShadow = true; // Step

    group.add(body, head, legFL, legFR, legBL, legBR, snout);
    return group;
}

export function createRabbitSittingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(s*0.5, 16, 8), matClone()); // Body lower
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.3, 16, 8), matClone()); // Head
    const earGeom = new THREE.CapsuleGeometry(s*0.1, s*0.6, 4, 8); // Ear
    const pawGeom = new THREE.CylinderGeometry(s*0.08, s*0.08, s*0.2, 8); // Front paw
    const legGeom = new THREE.CapsuleGeometry(s*0.15, s*0.5, 4, 8); // Back leg
    const earL = new THREE.Mesh(earGeom, matClone());
    const earR = new THREE.Mesh(earGeom, matClone());
    const pawL = new THREE.Mesh(pawGeom, matClone());
    const pawR = new THREE.Mesh(pawGeom, matClone());
    const legL = new THREE.Mesh(legGeom, matClone());
    const legR = new THREE.Mesh(legGeom, matClone());

    body.position.y = s*0.25; body.castShadow = true;
    head.position.y = s*0.5 + s*0.15; head.castShadow = true;

    earL.position.set(0, s*0.8, s*0.1); earL.rotation.x = -0.2; earL.castShadow = true;
    earR.position.set(0, s*0.8, -s*0.1); earR.rotation.x = -0.2; earR.castShadow = true;
    pawL.position.set(s*0.1, s*0.1, s*0.2); pawL.castShadow = true;
    pawR.position.set(s*0.1, s*0.1, -s*0.2); pawR.castShadow = true;
    legL.position.set(-s*0.3, 0, s*0.15); legL.rotation.z = -1.0; legL.castShadow = true;
    legR.position.set(-s*0.3, 0, -s*0.15); legR.rotation.z = -1.0; legR.castShadow = true;

    group.add(body, head, earL, earR, pawL, pawR, legL, legR);
    return group;
}