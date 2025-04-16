import * as THREE from 'three';
import { createStackedSpheresGroup } from './combinations_basic.js'; // Import snowman base

export const createSnowmanFigureGroup = (s, matClone) => createStackedSpheresGroup(s, matClone);

export function createSimplePersonGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.3, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const limbGeom = new THREE.CapsuleGeometry(s*0.1, s*0.8, 4, 8);
    const armL = new THREE.Mesh(limbGeom, matClone());
    const armR = new THREE.Mesh(limbGeom, matClone());
    const legL = new THREE.Mesh(limbGeom, matClone()); // Use same limb geom
    const legR = new THREE.Mesh(limbGeom, matClone());

    head.position.y = s*0.6 + s*0.4;
    armL.position.set(-s*0.4, s*0.3, 0);
    armR.position.set(s*0.4, s*0.3, 0);
    legL.position.set(-s*0.15, -s*0.6 - s*0.4, 0);
    legR.position.set(s*0.15, -s*0.6 - s*0.4, 0);

    body.castShadow = true; head.castShadow = true; armL.castShadow = true; armR.castShadow = true; legL.castShadow = true; legR.castShadow = true;
    group.add(body, head, armL, armR, legL, legR);
    return group;
}

export function createPersonBoxGroup(s, matClone) {
    const group = new THREE.Group();
    const bodyB = new THREE.Mesh(new THREE.BoxGeometry(s*0.8, s*1.2, s*0.4), matClone());
    const headB = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.5, s*0.5), matClone());
    const limbGeomB = new THREE.BoxGeometry(s*0.2, s*0.9, s*0.2);
    const armLB = new THREE.Mesh(limbGeomB, matClone());
    const armRB = new THREE.Mesh(limbGeomB, matClone());
    const legLB = new THREE.Mesh(limbGeomB, matClone());
    const legRB = new THREE.Mesh(limbGeomB, matClone());

    headB.position.y = s*1.2/2 + s*0.5/2;
    legLB.scale.y = 1.1;
    legRB.scale.y = 1.1;
    armLB.position.set(-s*0.4-s*0.1, s*0.3, 0);
    armRB.position.set(s*0.4+s*0.1, s*0.3, 0);
    legLB.position.set(-s*0.25, -s*1.2/2 - s*0.9*1.1/2 + 0.1, 0);
    legRB.position.set(s*0.25, -s*1.2/2 - s*0.9*1.1/2 + 0.1, 0);

    bodyB.castShadow = true; headB.castShadow = true; armLB.castShadow = true; armRB.castShadow = true; legLB.castShadow = true; legRB.castShadow = true;
    group.add(bodyB, headB, armLB, armRB, legLB, legRB);
    return group;
}

export function createPersonSpheresGroup(s, matClone) {
    const group = new THREE.Group();
    const bodyLower = new THREE.Mesh(new THREE.SphereGeometry(s*0.6, 16, 8), matClone());
    const bodyUpper = new THREE.Mesh(new THREE.SphereGeometry(s*0.4, 16, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.3, 16, 8), matClone());
    const limbGeomS = new THREE.CapsuleGeometry(s*0.08, s*0.7, 4, 8);
    const armLS = new THREE.Mesh(limbGeomS, matClone());
    const armRS = new THREE.Mesh(limbGeomS, matClone());
    const legLS = new THREE.Mesh(limbGeomS, matClone());
    const legRS = new THREE.Mesh(limbGeomS, matClone());

    bodyUpper.position.y = s*0.6 + s*0.4;
    head.position.y = bodyUpper.position.y + s*0.4 + s*0.3;
    armLS.position.set(-s*0.4, bodyUpper.position.y - s*0.1, 0);
    armRS.position.set(s*0.4, bodyUpper.position.y - s*0.1, 0);
    legLS.position.set(-s*0.2, -s*0.35, 0);
    legRS.position.set(s*0.2, -s*0.35, 0);

    bodyLower.castShadow = true; bodyUpper.castShadow = true; head.castShadow = true; armLS.castShadow = true; armRS.castShadow = true; legLS.castShadow = true; legRS.castShadow = true;
    group.add(bodyLower, bodyUpper, head, armLS, armRS, legLS, legRS);
    return group;
}

export function createPersonMixedGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(s*0.4, s*0.3, s*1.4, 16), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.45, 16, 8), matClone());
    const limbGeomM = new THREE.BoxGeometry(s*0.15, s*0.9, s*0.15);
    const armLM = new THREE.Mesh(limbGeomM, matClone());
    const armRM = new THREE.Mesh(limbGeomM, matClone());
    const legLM = new THREE.Mesh(limbGeomM, matClone());
    const legRM = new THREE.Mesh(limbGeomM, matClone());

    head.position.y = s*1.4/2 + s*0.45;
    legLM.scale.y = 1.1;
    legRM.scale.y = 1.1;
    armLM.position.set(-s*0.4-s*0.075, s*0.4, 0);
    armRM.position.set(s*0.4+s*0.075, s*0.4, 0);
    legLM.position.set(-s*0.2, -s*1.4/2 - s*0.9*1.1/2 + 0.1, 0);
    legRM.position.set(s*0.2, -s*1.4/2 - s*0.9*1.1/2 + 0.1, 0);

    body.castShadow = true; head.castShadow = true; armLM.castShadow = true; armRM.castShadow = true; legLM.castShadow = true; legRM.castShadow = true;
    group.add(body, head, armLM, armRM, legLM, legRM);
    return group;
}

export function createPersonAbstractGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*2.0, s*0.3), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.4, s*0.4, s*0.4), matClone());
    head.position.y = s*1.0 + s*0.2;
    body.castShadow = true; head.castShadow = true;
    group.add(body, head);
    return group;
}

export function createBasicRobotGroup(s, matClone) {
    const group = new THREE.Group();
    const bodyR = new THREE.Mesh(new THREE.BoxGeometry(s*1, s*1.5, s*0.8), matClone());
    const headR = new THREE.Mesh(new THREE.BoxGeometry(s*0.7, s*0.7, s*0.7), matClone());
    const armGeomR = new THREE.CylinderGeometry(s*0.15, s*0.15, s*1.2, 16);
    const legGeomR = new THREE.CylinderGeometry(s*0.2, s*0.2, s*1.4, 16);
    const armLR = new THREE.Mesh(armGeomR, matClone());
    const armRR = new THREE.Mesh(armGeomR, matClone());
    const legLR = new THREE.Mesh(legGeomR, matClone());
    const legRR = new THREE.Mesh(legGeomR, matClone());

    headR.position.y = s*1.5/2 + s*0.7/2;
    armLR.position.set(-s*0.5-s*0.15, s*0.4, 0);
    armRR.position.set(s*0.5+s*0.15, s*0.4, 0);
    legLR.position.set(-s*0.3, -s*1.5/2 - s*1.4/2 + 0.1, 0);
    legRR.position.set(s*0.3, -s*1.5/2 - s*1.4/2 + 0.1, 0);

    bodyR.castShadow = true; headR.castShadow = true; armLR.castShadow = true; armRR.castShadow = true; legLR.castShadow = true; legRR.castShadow = true;
    group.add(bodyR, headR, armLR, armRR, legLR, legRR);
    return group;
}

export function createBasicDogGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.4, s*1.2, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.5, s*0.5), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.1, s*0.1, s*0.6, 8);
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI / 2;
    body.position.y = s*0.4;
    head.position.set(s*0.6, s*0.6, 0);
    legFL.position.set(s*0.4, 0, s*0.25);
    legFR.position.set(s*0.4, 0, -s*0.25);
    legBL.position.set(-s*0.4, 0, s*0.25);
    legBR.position.set(-s*0.4, 0, -s*0.25);

    body.castShadow = true; head.castShadow = true; legFL.castShadow = true; legFR.castShadow = true; legBL.castShadow = true; legBR.castShadow = true;
    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
}

export function createBasicCatGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s*0.35, s*1.0, 4, 8), matClone());
    const head = new THREE.Mesh(new THREE.SphereGeometry(s*0.35, 16, 8), matClone());
    const legGeom = new THREE.CylinderGeometry(s*0.08, s*0.08, s*0.5, 8);
    const earGeom = new THREE.ConeGeometry(s*0.1, s*0.2, 8);
    const earL = new THREE.Mesh(earGeom, matClone());
    const earR = new THREE.Mesh(earGeom, matClone());
    const legFL = new THREE.Mesh(legGeom, matClone());
    const legFR = new THREE.Mesh(legGeom, matClone());
    const legBL = new THREE.Mesh(legGeom, matClone());
    const legBR = new THREE.Mesh(legGeom, matClone());

    body.rotation.z = Math.PI / 2;
    body.position.y = s*0.3;
    head.position.set(s*0.5, s*0.45, 0);
    earL.position.set(s*0.5, s*0.7, 0.15);
    earR.position.set(s*0.5, s*0.7, -0.15);
    legFL.position.set(s*0.35, 0, s*0.2);
    legFR.position.set(s*0.35, 0, -s*0.2);
    legBL.position.set(-s*0.35, 0, s*0.2);
    legBR.position.set(-s*0.35, 0, -s*0.2);

    body.castShadow = true; head.castShadow = true; earL.castShadow = true; earR.castShadow = true; legFL.castShadow = true; legFR.castShadow = true; legBL.castShadow = true; legBR.castShadow = true;
    group.add(body, head, earL, earR, legFL, legFR, legBL, legBR);
    return group;
}