import * as THREE from 'three';

export function createTableChairGroup(s, matClone) {
    const group = new THREE.Group();
    // Table
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(s*1.8, s*0.1, s*1.0), matClone());
    const tableLegGeom = new THREE.CylinderGeometry(s*0.08, s*0.08, s*0.8, 8);
    tableTop.position.y = s*0.8; tableTop.castShadow = true;
    const tLeg1 = new THREE.Mesh(tableLegGeom, matClone()); tLeg1.position.set(s*0.7, s*0.4, s*0.4); tLeg1.castShadow = true;
    const tLeg2 = new THREE.Mesh(tableLegGeom, matClone()); tLeg2.position.set(-s*0.7, s*0.4, s*0.4); tLeg2.castShadow = true;
    const tLeg3 = new THREE.Mesh(tableLegGeom, matClone()); tLeg3.position.set(s*0.7, s*0.4, -s*0.4); tLeg3.castShadow = true;
    const tLeg4 = new THREE.Mesh(tableLegGeom, matClone()); tLeg4.position.set(-s*0.7, s*0.4, -s*0.4); tLeg4.castShadow = true;
    group.add(tableTop, tLeg1, tLeg2, tLeg3, tLeg4);

    // Chair
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.08, s*0.5), matClone());
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(s*0.5, s*0.7, s*0.08), matClone());
    const chairLegGeom = new THREE.CylinderGeometry(s*0.06, s*0.06, s*0.4, 8);
    chairSeat.position.set(-s*1.4, s*0.4, 0); chairSeat.castShadow = true;
    chairBack.position.set(-s*1.4, s*0.4+s*0.04+s*0.35, -s*0.25+s*0.04); chairBack.castShadow = true;
    const cLeg1 = new THREE.Mesh(chairLegGeom, matClone()); cLeg1.position.set(-s*1.4+s*0.2, s*0.2, s*0.2); cLeg1.castShadow = true;
    const cLeg2 = new THREE.Mesh(chairLegGeom, matClone()); cLeg2.position.set(-s*1.4-s*0.2, s*0.2, s*0.2); cLeg2.castShadow = true;
    const cLeg3 = new THREE.Mesh(chairLegGeom, matClone()); cLeg3.position.set(-s*1.4+s*0.2, s*0.2, -s*0.2); cLeg3.castShadow = true;
    const cLeg4 = new THREE.Mesh(chairLegGeom, matClone()); cLeg4.position.set(-s*1.4-s*0.2, s*0.2, -s*0.2); cLeg4.castShadow = true;
    group.add(chairSeat, chairBack, cLeg1, cLeg2, cLeg3, cLeg4);

    return group;
}

export function createArchwayGroup(s, matClone) {
    const group = new THREE.Group();
    const pillarGeom = new THREE.BoxGeometry(s*0.5, s*2.0, s*0.5);
    const pillar1 = new THREE.Mesh(pillarGeom, matClone());
    const pillar2 = new THREE.Mesh(pillarGeom, matClone());
    const arch = new THREE.Mesh(new THREE.TorusGeometry(s*0.75, s*0.25, 8, 50, Math.PI), matClone());
    pillar1.position.x = -s*0.75; pillar1.castShadow = true;
    pillar2.position.x = s*0.75; pillar2.castShadow = true;
    arch.position.y = s*2.0; arch.rotation.z = Math.PI; arch.castShadow = true;
    group.add(pillar1, pillar2, arch);
    return group;
}

export function createSimpleHouseGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(s*1.8, s*1.2, s*1.4), matClone());
    const roof = new THREE.Mesh(new THREE.ConeGeometry(s*1.4, s*1.0, 4), matClone());
    roof.position.y = s*1.2/2 + s*1.0/2; roof.rotation.y = Math.PI / 4;
    body.castShadow = true; roof.castShadow = true;
    group.add(body, roof);
    return group;
}

export function createDumbbellGroup(s, matClone) {
    const group = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(s*0.15, s*0.15, s*1.5, 16), matClone());
    const weightGeom = new THREE.SphereGeometry(s*0.5, 16, 8);
    const weight1 = new THREE.Mesh(weightGeom, matClone());
    const weight2 = new THREE.Mesh(weightGeom, matClone());
    bar.rotation.z = Math.PI / 2; bar.castShadow = true;
    weight1.position.x = -s*0.75; weight1.castShadow = true;
    weight2.position.x = s*0.75; weight2.castShadow = true;
    group.add(bar, weight1, weight2);
    return group;
}

export function createMushroomGroup(s, matClone) {
    const group = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(s*0.3, s*0.4, s*1.0, 16), matClone());
    const cap = new THREE.Mesh(new THREE.SphereGeometry(s*0.8, 32, 16, 0, Math.PI*2, 0, Math.PI/1.8), matClone());
    cap.position.y = s*1.0; cap.rotation.x = Math.PI;
    stem.castShadow = true; cap.castShadow = true;
    group.add(stem, cap);
    return group;
}

export function createSimpleTreeGroup(s, matClone) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(s*0.3, s*0.4, s*1.8, 16), matClone());
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(s*1.2, 1), matClone());
    leaves.position.y = s*1.8 + s*0.6;
    trunk.castShadow = true; leaves.castShadow = true;
    group.add(trunk, leaves);
    return group;
}

export function createStylizedTreeGroup(s, matClone) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(s*0.2, s*0.25, s*1.5, 8), matClone());
    const coneGeom = new THREE.ConeGeometry(s*0.8, s*1.0, 6);
    const cone1 = new THREE.Mesh(coneGeom, matClone());
    const cone2 = new THREE.Mesh(coneGeom, matClone());
    const cone3 = new THREE.Mesh(coneGeom, matClone());
    cone1.position.y = s*1.0;
    cone2.position.y = s*1.5; cone2.scale.setScalar(0.8);
    cone3.position.y = s*1.9; cone3.scale.setScalar(0.6);
    trunk.castShadow = true; cone1.castShadow = true; cone2.castShadow = true; cone3.castShadow = true;
    group.add(trunk,cone1,cone2,cone3);
    return group;
}

export function createRocketBasicGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(s*0.5, s*0.5, s*2.5, 32), matClone());
    const nose = new THREE.Mesh(new THREE.ConeGeometry(s*0.5, s*1.0, 32), matClone());
    const finGeom = new THREE.BoxGeometry(s*0.8, s*0.6, s*0.1); finGeom.translate(0, -s*0.3, 0); // Pivot at top edge
    const fin1 = new THREE.Mesh(finGeom, matClone());
    const fin2 = new THREE.Mesh(finGeom, matClone());
    const fin3 = new THREE.Mesh(finGeom, matClone());
    const fin4 = new THREE.Mesh(finGeom, matClone());

    nose.position.y = s*2.5/2 + s*1.0/2;
    const finY = -s*1.25; const finRad = s*0.5;
    fin1.position.set(0, finY, finRad);
    fin2.position.set(0, finY, -finRad); fin2.rotation.y = Math.PI;
    fin3.position.set(finRad, finY, 0); fin3.rotation.y = Math.PI/2;
    fin4.position.set(-finRad, finY, 0); fin4.rotation.y = -Math.PI/2;

    body.castShadow = true; nose.castShadow = true; fin1.castShadow = true; fin2.castShadow = true; fin3.castShadow = true; fin4.castShadow = true;
    group.add(body, nose, fin1, fin2, fin3, fin4);
    return group;
}

export function createLampSimpleGroup(s, matClone) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(s*0.1, s*0.15, s*1.8, 16), matClone());
    const shade = new THREE.Mesh(new THREE.ConeGeometry(s*0.5, s*0.6, 32, 1, true), matClone());
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(s*0.1, 16, 8), matClone()); // Optional bulb
    shade.position.y = s*1.8; shade.rotation.x = Math.PI;
    bulb.position.y = s*1.7;
    pole.castShadow = true; shade.castShadow = true; bulb.castShadow = true;
    group.add(pole, shade, bulb);
    return group;
}

export function createBridgeSimpleGroup(s, matClone) {
    const group = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(s*4.0, s*0.2, s*1.0), matClone());
    const supportGeom = new THREE.BoxGeometry(s*0.8, s*1.0, s*1.0);
    const support1 = new THREE.Mesh(supportGeom, matClone());
    const support2 = new THREE.Mesh(supportGeom, matClone());
    deck.position.y = s*1.0; deck.castShadow = true;
    support1.position.set(-s*1.6, s*0.5, 0); support1.castShadow = true;
    support2.position.set(s*1.6, s*0.5, 0); support2.castShadow = true;
    group.add(deck, support1, support2);
    return group;
}

export function createSimpleCarGroup(s, matClone) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(s*2.0, s*0.6, s*1.0), matClone());
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(s*1.2, s*0.5, s*0.9), matClone());
    const wheelGeom = new THREE.CylinderGeometry(s*0.3, s*0.3, s*0.15, 16);
    const wFL = new THREE.Mesh(wheelGeom, matClone());
    const wFR = new THREE.Mesh(wheelGeom, matClone());
    const wBL = new THREE.Mesh(wheelGeom, matClone());
    const wBR = new THREE.Mesh(wheelGeom, matClone());

    cabin.position.set(-s*0.2, s*0.6/2 + s*0.5/2, 0);
    const wheelY = -s*0.3+s*0.075; const wheelX = s*0.7; const wheelZ = s*0.5+s*0.075;
    wFL.rotation.z = Math.PI/2; wFL.position.set(wheelX, wheelY, wheelZ);
    wFR.rotation.z = Math.PI/2; wFR.position.set(wheelX, wheelY, -wheelZ);
    wBL.rotation.z = Math.PI/2; wBL.position.set(-wheelX, wheelY, wheelZ);
    wBR.rotation.z = Math.PI/2; wBR.position.set(-wheelX, wheelY, -wheelZ);

    body.castShadow = true; cabin.castShadow = true; wFL.castShadow = true; wFR.castShadow = true; wBL.castShadow = true; wBR.castShadow = true;
    group.add(body, cabin, wFL, wFR, wBL, wBR);
    return group;
}

export function createBenchSimpleGroup(s, matClone) {
    const group = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(s*2.0, s*0.15, s*0.5), matClone());
    const legGeom = new THREE.BoxGeometry(s*0.2, s*0.5, s*0.5);
    const leg1 = new THREE.Mesh(legGeom, matClone());
    const leg2 = new THREE.Mesh(legGeom, matClone());
    seat.position.y = s*0.5; seat.castShadow = true;
    leg1.position.set(-s*0.8, s*0.25, 0); leg1.castShadow = true;
    leg2.position.set(s*0.8, s*0.25, 0); leg2.castShadow = true;
    group.add(seat, leg1, leg2);
    return group;
}

export function createTowerBasicGroup(s, matClone) {
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(s*0.8, s*1.0, s*3.0, 8), matClone());
    const top = new THREE.Mesh(new THREE.CylinderGeometry(s*1.2, s*1.1, s*0.4, 8), matClone());
    top.position.y = s*1.5+s*0.2;
    shaft.castShadow = true; top.castShadow = true;
    group.add(shaft, top);
    return group;
}

export function createStairsSimpleGroup(s, matClone) {
    const group = new THREE.Group();
    const stepNum=5; const stepW=s*1.5; const stepH=s*0.2; const stepD=s*0.4;
    const stepGeom = new THREE.BoxGeometry(stepW, stepH, stepD);
    for(let i=0; i<stepNum; i++){
        const step = new THREE.Mesh(stepGeom, matClone());
        step.position.set(0, i*stepH + stepH/2, -i*stepD);
        step.castShadow = true;
        group.add(step);
    }
    return group;
}

export function createPlantPotGroup(s, matClone) {
    const group = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(s*0.4, s*0.6, s*0.8, 16), matClone());
    const soil = new THREE.Mesh(new THREE.SphereGeometry(s*0.5, 16, 8), matClone()); // Approx soil
    const leafGeom = new THREE.ConeGeometry(s*0.1, s*0.6, 8);
    const leaf1 = new THREE.Mesh(leafGeom, matClone());
    const leaf2 = new THREE.Mesh(leafGeom, matClone());
    const leaf3 = new THREE.Mesh(leafGeom, matClone());

    soil.position.y = s*0.8;
    leaf1.position.set(0, s*1.1, s*0.1); leaf1.rotation.x = 0.5;
    leaf2.position.set(s*0.1, s*1.0, -s*0.1); leaf2.rotation.z=-0.4;
    leaf3.position.set(-s*0.1, s*1.0, -s*0.1); leaf3.rotation.z=0.4;

    pot.castShadow = true; soil.castShadow = true; leaf1.castShadow = true; leaf2.castShadow = true; leaf3.castShadow = true;
    group.add(pot, soil, leaf1, leaf2, leaf3);
    return group;
}