import * as THREE from 'three';

// Helper to create a standard person limb mesh
function createPersonLimb(s, length, radius, matClone) {
    const limb = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length - 2 * radius, 4, 8), matClone());
    limb.castShadow = true;
    return limb;
}

export function createPersonRunningGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.9, s*0.12, matClone);
    const legR = createPersonLimb(s, s*0.9, s*0.12, matClone);

    body.rotation.x = 0.2;
    head.position.y = s*0.6 + s*0.4;
    head.rotation.x = -0.1;
    armL.position.set(-s*0.3, s*0.4, 0); armL.rotation.z = -1.5;
    armR.position.set(s*0.3, s*0.4, 0); armR.rotation.z = 1.0;
    legL.position.set(-s*0.15, -s*0.5, 0); legL.rotation.x = 0.8;
    legR.position.set(s*0.15, -s*0.5, 0); legR.rotation.x = -1.0;

    body.castShadow = true; head.castShadow = true; // Limbs already cast shadow
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonJumpingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.9, s*0.12, matClone);
    const legR = createPersonLimb(s, s*0.9, s*0.12, matClone);

    body.rotation.x = -0.1;
    body.position.y = s*0.3;
    head.position.y = s*0.5 + s*0.4 + body.position.y;
    armL.position.set(-s*0.3, s*0.3 + body.position.y, 0); armL.rotation.z = -2.5;
    armR.position.set(s*0.3, s*0.3 + body.position.y, 0); armR.rotation.z = 2.5;
    legL.position.set(-s*0.15, -s*0.4 + body.position.y, 0); legL.rotation.x = -1.2;
    legR.position.set(s*0.15, -s*0.4 + body.position.y, 0); legR.rotation.x = -1.5;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonSittingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.7, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.7, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.12, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.12, matClone);

    body.position.y = s*0.4;
    head.position.y = s*0.5 + s*0.4 + body.position.y;
    armL.position.set(-s*0.3, s*0.2 + body.position.y, s*0.2); armL.rotation.z = -0.5;
    armR.position.set(s*0.3, s*0.2 + body.position.y, s*0.2); armR.rotation.z = 0.5;
    legL.position.set(-s*0.15, 0, s*0.4); legL.rotation.x = 1.57;
    legR.position.set(s*0.15, 0, s*0.4); legR.rotation.x = 1.57;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonWavingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    head.position.y = s*0.6 + s*0.4;
    armL.position.set(-s*0.4, s*0.3, 0);
    armR.position.set(s*0.4, s*0.7, 0); armR.rotation.z = 2.5; armR.rotation.x = 0.3;
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, 0);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonReachingGroup(s, matClone) {
     const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    body.rotation.x = 0.1;
    head.position.y = s*0.6 + s*0.4;
    head.rotation.x = -0.2;
    armL.position.set(-s*0.3, s*0.7, s*0.3); armL.rotation.z = -1.0; armL.rotation.x = -0.8;
    armR.position.set(s*0.3, s*0.4, 0);
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, -s*0.1); legR.rotation.x = 0.2;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonFightingStanceGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.1, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.7, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.7, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.12, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.12, matClone);

    body.position.y = s*0.1; body.rotation.x = -0.1;
    head.position.y = s*0.55 + s*0.4 + body.position.y;
    armL.position.set(-s*0.3, s*0.5 + body.position.y, s*0.3); armL.rotation.z = -1.5;
    armR.position.set(s*0.3, s*0.5 + body.position.y, s*0.3); armR.rotation.z = 1.5;
    legL.position.set(-s*0.2, -s*0.3 + body.position.y, -s*0.3); legL.rotation.x = -0.4; legL.rotation.z = 0.2;
    legR.position.set(s*0.2, -s*0.3 + body.position.y, s*0.2); legR.rotation.x = -0.5; legR.rotation.z = -0.2;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonYogaTreeGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.3, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.9, s*0.12, matClone);
    const legR = createPersonLimb(s, s*0.9, s*0.12, matClone);

    head.position.y = s*0.65 + s*0.4;
    armL.position.set(0, s*1.0, 0); armL.rotation.x = -1.57;
    armR.position.set(0, s*1.0, 0); armR.rotation.x = -1.57;
    legL.position.set(-s*0.15, -s*0.65 - s*0.45, 0);
    legR.position.set(0, -s*0.2, s*0.2); legR.rotation.z = -1.5; legR.rotation.x = 0.2;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonThinkingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    head.position.y = s*0.6 + s*0.4; head.rotation.y = -0.3;
    armL.position.set(-s*0.4, s*0.3, 0);
    armR.position.set(s*0.1, s*0.8, s*0.3); armR.rotation.z = 1.0; armR.rotation.x = -1.0;
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, 0);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonDancing1Group(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.1, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    body.rotation.z = -0.2;
    head.position.y = s*0.55 + s*0.4; head.rotation.z = 0.2;
    armL.position.set(-s*0.4, s*0.7, 0); armL.rotation.z = -2.0;
    armR.position.set(s*0.5, s*0.2, s*0.2); armR.rotation.z = 1.0;
    legL.position.set(-s*0.1, -s*0.55 - s*0.4, 0); legL.rotation.x = -0.5;
    legR.position.set(s*0.2, -s*0.55 - s*0.4, s*0.2); legR.rotation.z = -0.5; legR.rotation.x = -0.2;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonDancing2Group(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    body.rotation.z = 0.1;
    head.position.y = s*0.6 + s*0.4; head.rotation.y = 0.5;
    armL.position.set(-s*0.3, s*0.7, s*0.2); armL.rotation.z = -1.0; armL.rotation.x = -1.0;
    armR.position.set(s*0.3, s*0.7, -s*0.2); armR.rotation.z = 1.0; armR.rotation.x = -1.0;
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, s*0.2); legL.rotation.x = 0.3;
    legR.position.set(s*0.15, -s*0.6 - s*0.4, -s*0.2); legR.rotation.x = -0.3;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonKneelingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.7, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.7, s*0.1, matClone);
    const legKneeling = createPersonLimb(s, s*0.5, s*0.12, matClone);
    const legStanding = createPersonLimb(s, s*0.9, s*0.12, matClone);

    body.position.y = s*0.5;
    head.position.y = s*0.5 + s*0.4 + body.position.y;
    armL.position.set(-s*0.3, s*0.3 + body.position.y, 0);
    armR.position.set(s*0.3, s*0.3 + body.position.y, 0);
    legKneeling.position.set(-s*0.15, 0, 0); legKneeling.rotation.x = 1.57;
    legStanding.position.set(s*0.15, -s*0.45, -s*0.3);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legKneeling, legStanding);
    return group;
}

export function createPersonLyingDownGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.6, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    body.rotation.z = Math.PI/2; body.position.y = s*0.3;
    head.position.set(s*0.8, s*0.3, 0);
    armL.position.set(s*0.2, s*0.3, s*0.2); armL.rotation.x = -0.2;
    armR.position.set(s*0.2, s*0.3, -s*0.2); armR.rotation.x = 0.2;
    legL.position.set(-s*0.8, s*0.3, s*0.1);
    legR.position.set(-s*0.8, s*0.3, -s*0.1);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonPointingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    head.position.y = s*0.6 + s*0.4;
    armL.position.set(-s*0.4, s*0.3, 0);
    armR.position.set(s*0.4, s*0.5, 0); armR.rotation.z = 1.57;
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, 0);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonSuperheroPoseGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    body.position.y = s*0.1;
    head.position.y = s*0.6 + s*0.4 + body.position.y;
    armL.position.set(-s*0.3, s*1.0 + body.position.y, 0); armL.rotation.z = -2.0;
    armR.position.set(s*0.4, s*0.1 + body.position.y, 0); armR.rotation.z = 0.5;
    legL.position.set(-s*0.2, -s*0.6 + body.position.y, 0);
    legR.position.set(s*0.2, -s*0.6 + body.position.y, 0);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonWalkingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.9, s*0.12, matClone);
    const legR = createPersonLimb(s, s*0.9, s*0.12, matClone);

    head.position.y = s*0.6 + s*0.4;
    armL.position.set(-s*0.3, s*0.3, 0); armL.rotation.x = 0.3;
    armR.position.set(s*0.3, s*0.3, 0); armR.rotation.x = -0.3;
    legL.position.set(-s*0.15, -s*0.5, 0); legL.rotation.x = -0.4;
    legR.position.set(s*0.15, -s*0.5, 0); legR.rotation.x = 0.4;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonCartwheelPrepGroup(s, matClone) {
     const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    body.rotation.z = -0.5; body.position.y = s*0.6;
    head.position.y = s*0.6 + s*0.4 + body.position.y;
    armL.position.set(-s*0.6, s*0.2 + body.position.y, 0); armL.rotation.z = -1.0;
    armR.position.set(s*0.0, s*1.0 + body.position.y, 0); armR.rotation.z = 1.8;
    legL.position.set(-s*0.15, -s*0.6 + body.position.y, -s*0.3); legL.rotation.z = 0.2;
    legR.position.set(s*0.15, -s*0.6 + body.position.y, s*0.3); legR.rotation.z = -0.2;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonPushupGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.4, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armUpper = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.1, s*0.4, 4, 8), matClone()); armUpper.castShadow = true;
    const armLower = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.1, s*0.4, 4, 8), matClone()); armLower.castShadow = true;
    const legUpper = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.12, s*0.6, 4, 8), matClone()); legUpper.castShadow = true;
    const legLower = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.12, s*0.6, 4, 8), matClone()); legLower.castShadow = true;

    const armLPushU = armUpper.clone(); armLPushU.material = matClone();
    const armRPushU = armUpper.clone(); armRPushU.material = matClone();
    const armLPushL = armLower.clone(); armLPushL.material = matClone();
    const armRPushL = armLower.clone(); armRPushL.material = matClone();
    const legLPushU = legUpper.clone(); legLPushU.material = matClone();
    const legRPushU = legUpper.clone(); legRPushU.material = matClone();
    const legLPushL = legLower.clone(); legLPushL.material = matClone();
    const legRPushL = legLower.clone(); legRPushL.material = matClone();


    body.rotation.z = Math.PI/2; body.position.y = s*0.3; body.castShadow = true;
    head.position.set(s*0.7, s*0.4, 0); head.castShadow = true;

    armLPushU.position.set(s*0.5, s*0.3, s*0.3); armLPushU.rotation.x = -1.0;
    armRPushU.position.set(s*0.5, s*0.3, -s*0.3); armRPushU.rotation.x = -1.0;
    armLPushL.position.set(s*0.5, 0, s*0.3);
    armRPushL.position.set(s*0.5, 0, -s*0.3);

    legLPushU.position.set(-s*0.7, s*0.3, s*0.1);
    legRPushU.position.set(-s*0.7, s*0.3, -s*0.1);
    legLPushL.position.set(-s*1.0, 0, s*0.1); legLPushL.rotation.z = -0.2;
    legRPushL.position.set(-s*1.0, 0, -s*0.1); legRPushL.rotation.z = -0.2;

    group.add(body, head, armLPushU, armRPushU, armLPushL, armRPushL, legLPushU, legRPushU, legLPushL, legRPushL);
    return group;
}

export function createPersonReadingSeatedGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.7, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.7, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.12, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.12, matClone);
    const book = new THREE.Mesh(new THREE.BoxGeometry(s*0.4, s*0.05, s*0.3), matClone()); book.castShadow = true;

    body.position.y = s*0.4; body.castShadow = true;
    head.position.y = s*0.5 + s*0.4 + body.position.y; head.rotation.x=0.3; head.castShadow = true;

    armL.position.set(-s*0.2, s*0.3 + body.position.y, s*0.3); armL.rotation.z = -1.2; armL.rotation.x = -0.5;
    armR.position.set(s*0.2, s*0.3 + body.position.y, s*0.3); armR.rotation.z = 1.2; armR.rotation.x = -0.5;
    legL.position.set(-s*0.15, 0, s*0.4); legL.rotation.x = 1.57;
    legR.position.set(s*0.15, 0, s*0.4); legR.rotation.x = 1.57;
    book.position.set(0, s*0.5 + body.position.y, s*0.5); book.rotation.x = -0.8;

    group.add(body, head, armL, armR, legL, legR, book);
    return group;
}

export function createPersonShruggingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    head.position.y = s*0.6 + s*0.4;
    armL.position.set(-s*0.4, s*0.5, 0); armL.rotation.z = -0.8;
    armR.position.set(s*0.4, s*0.5, 0); armR.rotation.z = 0.8;
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, 0);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonBowingGroup(s, matClone) {
     const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    body.rotation.x = 1.0;
    head.position.set(0, s*0.6 + s*0.4, -s*0.2); head.rotation.x = 0.5;
    armL.position.set(-s*0.3, s*0.2, 0); armL.rotation.x = 0.8;
    armR.position.set(s*0.3, s*0.2, 0); armR.rotation.x = 0.8;
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, 0);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonTiptoeGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.3, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.9, s*0.12, matClone);
    const legR = createPersonLimb(s, s*0.9, s*0.12, matClone);

    body.position.y = s*0.2; // Raised body
    head.position.y = s*0.65 + s*0.4 + body.position.y;
    armL.position.set(-s*0.4, s*0.8 + body.position.y, 0); armL.rotation.z = -0.5; // Arms raised slightly
    armR.position.set(s*0.4, s*0.8 + body.position.y, 0); armR.rotation.z = 0.5;
    legL.position.set(-s*0.15, -s*0.65 + body.position.y, 0); legL.rotation.x = -0.1; // Slight leg angle for tiptoe
    legR.position.set(s*0.15, -s*0.65 + body.position.y, 0); legR.rotation.x = -0.1;

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonCarryingBoxGroup(s, matClone) {
     const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const box = new THREE.Mesh(new THREE.BoxGeometry(s*0.6, s*0.5, s*0.5), matClone()); box.castShadow = true;

    head.position.y = s*0.6 + s*0.4;
    armL.position.set(-s*0.2, s*0.3, s*0.3); armL.rotation.z = -1.2; armL.rotation.x = -0.4; // Arms holding box
    armR.position.set(s*0.2, s*0.3, s*0.3); armR.rotation.z = 1.2; armR.rotation.x = -0.4;
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, 0);
    box.position.set(0, s*0.3, s*0.4); // Box position in front

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR, box);
    return group;
}

export function createPersonLookingUpGroup(s, matClone) {
     const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legR = createPersonLimb(s, s*0.8, s*0.1, matClone);

    head.position.y = s*0.6 + s*0.4; head.rotation.x = -0.5; // Tilt head up
    armL.position.set(-s*0.4, s*0.3, 0);
    armR.position.set(s*0.4, s*0.3, 0);
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, 0);

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonCrouchingGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*0.8, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.6, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.6, s*0.1, matClone);
    const legL = createPersonLimb(s, s*0.6, s*0.12, matClone); // Crouched legs
    const legR = createPersonLimb(s, s*0.6, s*0.12, matClone);

    body.position.y = s*0.3; body.rotation.x = 0.5; body.castShadow = true;
    head.position.y = s*0.4 + s*0.4 + body.position.y; head.castShadow = true;

    armL.position.set(-s*0.3, s*0.1 + body.position.y, s*0.3); armL.rotation.z = -1.0;
    armR.position.set(s*0.3, s*0.1 + body.position.y, s*0.3); armR.rotation.z = 1.0;
    legL.position.set(-s*0.15, 0, s*0.1); legL.rotation.x = 1.5; // Legs bent sharply
    legR.position.set(s*0.15, 0, s*0.1); legR.rotation.x = 1.5;

    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonBalancingOneLegGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const armL = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const armR = createPersonLimb(s, s*0.8, s*0.1, matClone);
    const legStanding = createPersonLimb(s, s*0.9, s*0.12, matClone);
    const legRaised = createPersonLimb(s, s*0.9, s*0.12, matClone);

    head.position.y = s*0.6 + s*0.4;
    armL.position.set(-s*0.4, s*0.4, 0); armL.rotation.z = -1.57; // Arms out for balance
    armR.position.set(s*0.4, s*0.4, 0); armR.rotation.z = 1.57;
    legStanding.position.set(-s*0.15, -s*0.6 - s*0.45, 0); // Standing leg slightly offset/longer
    legRaised.position.set(s*0.15, -s*0.2, 0); legRaised.rotation.x = 1.2; // Raised leg bent up

    body.castShadow = true; head.castShadow = true;
    group.add(body, head, armL, armR, legStanding, legRaised);
    return group;
}