// --- Imports ---
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as Primitives from './shapes/primitives.js';
import * as Wireframes from './shapes/wireframes.js';
import * as Variations from './shapes/variations.js';
import * as BasicCombinations from './shapes/combinations_basic.js';
import * as SeparatedCombinations from './shapes/combinations_separated.js';
import * as RingsArrays from './shapes/rings_arrays.js';
import * as StaticFigures from './shapes/figures_static.js';
import * as DynamicPeople from './shapes/figures_dynamic_people.js';
import * as DynamicAnimals from './shapes/figures_dynamic_animals.js';
import * as Objects from './shapes/objects.js';
import * as Abstract from './shapes/abstract.js';


// --- Debug Logging (Simplified) ---
const debugConsole = document.getElementById('debug-console');
function logToPage(message, type = 'log') {
     const consoleEl = document.getElementById('debug-console');
     if (!consoleEl) { console.log("DEBUG CONSOLE NOT FOUND! Msg:", message); return; }
    try {
        const p = document.createElement('p');
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        p.textContent = `[${timestamp}] ${message}`;
        if (type === 'error') {
            p.classList.add('error');
            console.error(message);
        } else if (type === 'success') {
            p.classList.add('success');
            console.log(message);
        } else {
            console.log(message);
        }
        consoleEl.appendChild(p);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    } catch (e) {
        console.error("logToPage failed:", e);
        console.error("Original message:", message);
    }
}

// --- Global Error Handler ---
window.onerror = function (message, source, lineno, colno, error) {
    const errorMsg = `GLOBAL ERROR: ${message} at ${source}:${lineno}:${colno}`;
    logToPage(errorMsg, 'error');
    return true;
};
window.onunhandledrejection = function (event) {
     const reason = event.reason || 'Unknown reason';
     const errorMsg = `UNHANDLED REJECTION: ${reason.message || reason}`;
     logToPage(errorMsg, 'error');
};

logToPage("Script start");

// --- Constants ---
const LOCAL_STORAGE_KEY = 'dynamicPoseExplorerState_v1'; // Key for local storage

// --- Global Variables ---
let scene, camera, renderer, controls;
let spotLight, lightTarget, lightVisualizer;
let floor, gridHelper, axesHelper;
let currentObject = null;
let objectMaterial; // The single, shared standard material instance
let floorBaseMaterial; // Keep base floor roughness/metalness
let originalShapeOptions = [];
let objectBaseY = 0;

// --- DOM Elements ---
let sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn;
let cameraLockBtn, gridHelperToggle, axesHelperToggle;
let resetObjectBtn;
let saveStateBtn, loadStateBtn, resetSceneBtn; // Save/Load buttons
// Environment Sliders
let wallHueSlider, wallHueValueSpan, wallSaturationSlider, wallSaturationValueSpan, wallBrightnessSlider, wallBrightnessValueSpan;
let floorHueSlider, floorHueValueSpan, floorSaturationSlider, floorSaturationValueSpan, floorBrightnessSlider, floorBrightnessValueSpan;
// Object Sliders
let modelYOffsetSlider, modelYOffsetValueSpan;
let objectRotationXSlider, objectRotationXValueSpan, objectRotationYSlider, objectRotationYValueSpan, objectRotationZSlider, objectRotationZValueSpan;
let objectScaleSlider, objectScaleValueSpan;
let modelColorHueSlider, modelColorHueValueSpan, objectBrightnessSlider, objectBrightnessValueSpan;
let objectRoughnessSlider, objectRoughnessValueSpan, objectMetalnessSlider, objectMetalnessValueSpan;
// Light Sliders
let lightIntensitySlider, lightIntensityValueSpan, lightAngleSlider, lightAngleValueSpan, lightPenumbraSlider, lightPenumbraValueSpan;
let lightXSlider, lightYSlider, lightZSlider, lightXValueSpan, lightYValueSpan, lightZValueSpan;


// --- Shape Creation Mapping ---
const shapeFunctionMap = {
    // Primitives
    'sphere': Primitives.createSphereGeometry,
    'cube': Primitives.createCubeGeometry,
    'cylinder': Primitives.createCylinderGeometry,
    'torus': Primitives.createTorusGeometry,
    'cone': Primitives.createConeGeometry,
    'pyramid': Primitives.createPyramidGeometry, // Alias
    'capsule': Primitives.createCapsuleGeometry,
    'dodecahedron': Primitives.createDodecahedronGeometry,
    'icosahedron': Primitives.createIcosahedronGeometry,
    'octahedron': Primitives.createOctahedronGeometry,
    'tetrahedron': Primitives.createTetrahedronGeometry,
    // Variations
    'tall_box': Variations.createTallBoxGeometry,
    'flat_box': Variations.createFlatBoxGeometry,
    'thin_cylinder': Variations.createThinCylinderGeometry,
    'thick_torus': Variations.createThickTorusGeometry,
    'thin_torus': Variations.createThinTorusGeometry,
    'squashed_sphere': Variations.createSquashedSphereGroup, // Returns Group
    'stretched_cube': Variations.createStretchedCubeGroup,   // Returns Group
    'lowpoly_sphere': Variations.createLowPolySphereGeometry,
    'open_cylinder': Variations.createOpenCylinderGeometry,
    'half_sphere': Variations.createHalfSphereGeometry,
    // Basic Combinations (Return Groups)
    'stacked_cubes': BasicCombinations.createStackedCubesGroup,
    'stacked_cylinders': BasicCombinations.createStackedCylindersGroup,
    'stacked_spheres': BasicCombinations.createStackedSpheresGroup,
    'snowman': BasicCombinations.createSnowmanGroup, // Alias
    'stacked_tori': BasicCombinations.createStackedToriGroup,
    'sphere_on_cube': BasicCombinations.createSphereOnCubeGroup,
    'cube_on_sphere': BasicCombinations.createCubeOnSphereGroup,
    'cone_on_cylinder': BasicCombinations.createConeOnCylinderGroup,
    'offset_cubes': BasicCombinations.createOffsetCubesGroup,
    'offset_spheres': BasicCombinations.createOffsetSpheresGroup,
    'offset_capsules': BasicCombinations.createOffsetCapsulesGroup,
    'cube_pyramid_stack': BasicCombinations.createCubePyramidStackGroup,
    'three_spheres_line': BasicCombinations.createThreeSpheresLineGroup,
    'three_cubes_line': BasicCombinations.createThreeCubesLineGroup,
    'three_spheres_triangle': BasicCombinations.createThreeSpheresTriangleGroup,
    'three_cubes_triangle': BasicCombinations.createThreeCubesTriangleGroup,
    'linked_tori': BasicCombinations.createLinkedToriGroup,
    'intersecting_cube_sphere': BasicCombinations.createIntersectingCubeSphereGroup,
    'intersecting_cylinders': BasicCombinations.createIntersectingCylindersGroup,
    'intersecting_tori': BasicCombinations.createIntersectingToriGroup,
    'cylinder_thru_torus': BasicCombinations.createCylinderThruTorusGroup,
    'sphere_thru_torus': BasicCombinations.createSphereThruTorusGroup,
    'cube_thru_torus': BasicCombinations.createCubeThruTorusGroup,
    // Separated Combinations (Return Groups)
    'two_cubes_apart': SeparatedCombinations.createTwoCubesApartGroup,
    'two_spheres_apart': SeparatedCombinations.createTwoSpheresApartGroup,
    'sphere_cube_apart': SeparatedCombinations.createSphereCubeApartGroup,
    'four_corners_cubes': SeparatedCombinations.createFourCornersCubesGroup,
    'line_of_cubes': SeparatedCombinations.createLineOfCubesGroup,
    // Rings & Arrays (Return Groups)
    'box_with_poles': RingsArrays.createBoxWithPolesGroup,
    'cylinder_ring': RingsArrays.createCylinderRingGroup,
    'sphere_ring': RingsArrays.createSphereRingGroup,
    'cube_ring': RingsArrays.createCubeRingGroup,
    'cube_grid_flat': RingsArrays.createCubeGridFlatGroup,
    'sphere_grid_flat': RingsArrays.createSphereGridFlatGroup,
    'random_cubes_cluster': RingsArrays.createRandomCubesClusterGroup,
    'random_spheres_cluster': RingsArrays.createRandomSpheresClusterGroup,
    'random_mixed_cluster': RingsArrays.createRandomMixedClusterGroup,
    // Static Figures (Return Groups)
    'simple_person': StaticFigures.createSimplePersonGroup,
    'person_box': StaticFigures.createPersonBoxGroup,
    'person_spheres': StaticFigures.createPersonSpheresGroup,
    'person_mixed': StaticFigures.createPersonMixedGroup,
    'person_abstract': StaticFigures.createPersonAbstractGroup,
    'basic_robot': StaticFigures.createBasicRobotGroup,
    'basic_dog': StaticFigures.createBasicDogGroup,
    'basic_cat': StaticFigures.createBasicCatGroup,
    // Dynamic People (Return Groups)
    'person_running': DynamicPeople.createPersonRunningGroup,
    'person_jumping': DynamicPeople.createPersonJumpingGroup,
    'person_sitting': DynamicPeople.createPersonSittingGroup,
    'person_waving': DynamicPeople.createPersonWavingGroup,
    'person_reaching': DynamicPeople.createPersonReachingGroup,
    'person_fighting_stance': DynamicPeople.createPersonFightingStanceGroup,
    'person_yoga_tree': DynamicPeople.createPersonYogaTreeGroup,
    'person_thinking': DynamicPeople.createPersonThinkingGroup,
    'person_dancing_1': DynamicPeople.createPersonDancing1Group,
    'person_dancing_2': DynamicPeople.createPersonDancing2Group,
    'person_kneeling': DynamicPeople.createPersonKneelingGroup,
    'person_lying_down': DynamicPeople.createPersonLyingDownGroup,
    'person_pointing': DynamicPeople.createPersonPointingGroup,
    'person_superhero_pose': DynamicPeople.createPersonSuperheroPoseGroup,
    'person_walking': DynamicPeople.createPersonWalkingGroup,
    'person_cartwheel_prep': DynamicPeople.createPersonCartwheelPrepGroup,
    'person_pushup': DynamicPeople.createPersonPushupGroup,
    'person_reading_seated': DynamicPeople.createPersonReadingSeatedGroup,
    'person_shrugging': DynamicPeople.createPersonShruggingGroup,
    'person_bowing': DynamicPeople.createPersonBowingGroup,
    'person_tiptoe': DynamicPeople.createPersonTiptoeGroup,
    'person_carrying_box': DynamicPeople.createPersonCarryingBoxGroup,
    'person_looking_up': DynamicPeople.createPersonLookingUpGroup,
    'person_crouching': DynamicPeople.createPersonCrouchingGroup,
    'person_balancing_one_leg': DynamicPeople.createPersonBalancingOneLegGroup,
     // Dynamic Animals (Return Groups)
    'dog_running': DynamicAnimals.createDogRunningGroup,
    'dog_sitting': DynamicAnimals.createDogSittingGroup,
    'dog_playing_bow': DynamicAnimals.createDogPlayingBowGroup,
    'dog_begging': DynamicAnimals.createDogBeggingGroup,
    'dog_lying_down': DynamicAnimals.createDogLyingDownGroup,
    'cat_stretching': DynamicAnimals.createCatStretchingGroup,
    'cat_playing': DynamicAnimals.createCatPlayingGroup,
    'cat_sleeping_curled': DynamicAnimals.createCatSleepingCurledGroup,
    'cat_walking_tail_up': DynamicAnimals.createCatWalkingTailUpGroup,
    'cat_crouching_low': DynamicAnimals.createCatCrouchingLowGroup,
    'bird_flying': DynamicAnimals.createBirdFlyingGroup,
    'bird_perched': DynamicAnimals.createBirdPerchedGroup,
    'bird_taking_off': DynamicAnimals.createBirdTakingOffGroup,
    'bird_pecking': DynamicAnimals.createBirdPeckingGroup,
    'bird_wings_folded': DynamicAnimals.createBirdWingsFoldedGroup,
    'horse_galloping': DynamicAnimals.createHorseGallopingGroup,
    'horse_rearing': DynamicAnimals.createHorseRearingGroup,
    'horse_trotting': DynamicAnimals.createHorseTrottingGroup,
    'horse_grazing': DynamicAnimals.createHorseGrazingGroup,
    'horse_standing': DynamicAnimals.createHorseStandingGroup,
    'fish_swimming': DynamicAnimals.createFishSwimmingGroup,
    'snake_coiled': DynamicAnimals.createSnakeCoiledGroup,
    'snake_slithering': DynamicAnimals.createSnakeSlitheringGroup,
    'frog_jumping': DynamicAnimals.createFrogJumpingGroup,
    'deer_leaping': DynamicAnimals.createDeerLeapingGroup,
    'elephant_walking': DynamicAnimals.createElephantWalkingGroup,
    'monkey_hanging': DynamicAnimals.createMonkeyHangingGroup,
    'bear_standing': DynamicAnimals.createBearStandingGroup,
    'bear_walking_4legs': DynamicAnimals.createBearWalking4LegsGroup,
    'rabbit_sitting': DynamicAnimals.createRabbitSittingGroup,
    // Objects (Return Groups)
    'table_chair': Objects.createTableChairGroup,
    'archway': Objects.createArchwayGroup,
    'simple_house': Objects.createSimpleHouseGroup,
    'dumbbell': Objects.createDumbbellGroup,
    'mushroom': Objects.createMushroomGroup,
    'simple_tree': Objects.createSimpleTreeGroup,
    'stylized_tree': Objects.createStylizedTreeGroup,
    'rocket_basic': Objects.createRocketBasicGroup,
    'lamp_simple': Objects.createLampSimpleGroup,
    'bridge_simple': Objects.createBridgeSimpleGroup,
    'simple_car': Objects.createSimpleCarGroup,
    'bench_simple': Objects.createBenchSimpleGroup,
    'tower_basic': Objects.createTowerBasicGroup,
    'stairs_simple': Objects.createStairsSimpleGroup,
    'plant_pot': Objects.createPlantPotGroup,
    // Abstract (Return Geometry or Group)
    'leaning_tower_cubes': Abstract.createLeaningTowerCubesGroup,
    'spiral_cubes': Abstract.createSpiralCubesGroup,
    'spiral_spheres': Abstract.createSpiralSpheresGroup,
    'abstract_sculpture_1': Abstract.createAbstractSculpture1Group,
    'abstract_sculpture_2': Abstract.createAbstractSculpture2Group,
    'abstract_sculpture_3': Abstract.createAbstractSculpture3Group,
    'abstract_sculpture_4': Abstract.createAbstractSculpture4Group,
    'saturn_like': Abstract.createSaturnLikeGroup,
    'wireframe_cube_nested': Abstract.createWireframeCubeNestedBase, // Base structure
    'wireframe_icosahedron_in_sphere': Abstract.createIcosahedronInSphereBase // Base structure
};


// --- Shape Handling Functions ---

// Function to create the base geometry or group object using the map
function createObject(shapeType, s, matClone) {
    const creationFunc = shapeFunctionMap[shapeType];

    if (creationFunc) {
        try {
            // Pass 's' (size) and matClone (material cloning function)
            // TODO: Pass specific shape params here when implemented
            return creationFunc(s, matClone);
        } catch (error) {
            logToPage(`Shape Creation Error (${shapeType}): ${error.message}\n${error.stack}`, 'error');
            // Fallback to sphere geometry if creation fails
            return Primitives.createSphereGeometry(s);
        }
    } else {
        logToPage(`Unknown shape type in map: ${shapeType}`, 'error');
        // Fallback to sphere geometry if type not found
        return Primitives.createSphereGeometry(s);
    }
}


// --- Update Object Function (Refactored & Random Color Added) ---
function updateObject(requestedShapeType) {
    logToPage(`Updating object to: ${requestedShapeType}`);
    const s = 1.5; // Base size unit
    // Ensure objectMaterial exists before creating matClone
    if (!objectMaterial) {
        logToPage("ERROR: objectMaterial not initialized before updateObject call!", 'error');
        return;
    }
    const matClone = () => objectMaterial.clone();

    // --- Randomize Color Hue before creation ---
    const randomHue = Math.random();
    modelColorHueSlider.value = randomHue; // Set slider value
    onModelColorOrBrightnessChange();      // Update shared material & UI span
    logToPage(`Randomized object hue to: ${Math.round(randomHue * 360)}°`);


    // --- 1. Cleanup previous object ---
    if (currentObject) {
        logToPage(`Removing previous object (${currentObject.name || currentObject.type || currentObject.constructor.name})`);
        scene.remove(currentObject);
        // Dispose geometry and materials
        try {
            if (currentObject.traverse) {
                currentObject.traverse((child) => {
                    if (child.isMesh) {
                        if (child.geometry) child.geometry.dispose();
                        // Dispose materials if they are not the shared one or if it's an array
                        if (child.material) {
                             if (Array.isArray(child.material)) {
                                 child.material.forEach(m => { if (m && m.dispose && m !== objectMaterial) m.dispose(); });
                             } else if (child.material.dispose && child.material !== objectMaterial) {
                                 child.material.dispose();
                             }
                         }
                    }
                });
            }
            logToPage("Previous object resources disposed.");
        } catch (disposeError) { logToPage(`Disposal Error: ${disposeError.message}`, 'error'); }
        currentObject = null;
    }

    // --- 2. Determine if wireframe and get base shape type ---
    const isWireframe = requestedShapeType.startsWith('wireframe_');
    const baseShapeType = isWireframe ? requestedShapeType.substring('wireframe_'.length) : requestedShapeType;

    // --- 3. Show/Hide Specific Parameter UI ---
    // (Parameter UI Implementation Deferred)

    // --- 4. Create the new object (Geometry or Group) ---
    let newObject = null;
    let createdItem = null;

    try {
        createdItem = createObject(baseShapeType, s, matClone); // Call the mapped function

        if (!createdItem) {
            throw new Error("Shape creation function returned null/undefined!");
        }

        if (createdItem instanceof THREE.BufferGeometry) {
            // Function returned Geometry - Create the Mesh
            logToPage(`Created Geometry for ${baseShapeType}. Creating Mesh...`);
            let materialToUse = objectMaterial; // Use the shared material (now with randomized color)
            if (isWireframe) {
                materialToUse = matClone(); // Clone for wireframe modification
                materialToUse.wireframe = true;
                logToPage(`Applied wireframe material.`);
            }
            newObject = new THREE.Mesh(createdItem, materialToUse);
            newObject.castShadow = true;

        } else if (createdItem instanceof THREE.Group) {
            // Function returned a Group
            logToPage(`Created Group directly for ${baseShapeType}.`);
            newObject = createdItem;
            // Apply wireframe if requested
            if (isWireframe) {
                logToPage(`Applying wireframe material to group...`);
                Wireframes.applyWireframeMaterial(newObject, objectMaterial); // Use the helper
            }
             // Ensure shadows are cast by group children
             newObject.traverse(child => { if (child.isMesh) child.castShadow = true; });

        } else {
            throw new Error(`Shape function for ${baseShapeType} returned unexpected type: ${typeof createdItem}`);
        }

    } catch (creationError) {
        logToPage(`Object Creation Error (${requestedShapeType}): ${creationError.message}\n${creationError.stack}`, 'error');
        const fallbackGeo = Primitives.createSphereGeometry(s);
        newObject = new THREE.Mesh(fallbackGeo, objectMaterial);
        newObject.castShadow = true;
    }

    newObject.name = requestedShapeType;

    // --- 5. Reset Transform Sliders and Apply Initial Transform ---
    if (objectRotationXSlider) objectRotationXSlider.value = 0;
    if (objectRotationYSlider) objectRotationYSlider.value = 0;
    if (objectRotationZSlider) objectRotationZSlider.value = 0;
    if (objectScaleSlider) objectScaleSlider.value = 1.0; // Reset scale slider too
    // Don't reset Y Offset slider here, keep its current value
    newObject.rotation.set(0, 0, 0);
    newObject.scale.set(1, 1, 1); // Start with scale 1 before applying slider value
    logToPage("Rotation/Scale sliders reset.");
    updateObjectRotationDisplay(); // Update UI
    // Call scale handler to update span for scale slider
    if (objectScaleSlider) objectScaleSlider.dispatchEvent(new Event('input'));


    // --- 6. Calculate Base Y Position ---
    // (Bounds calculation remains the same as before)
    const boundingBox = new THREE.Box3();
    objectBaseY = 0;
    try {
        const tempPos = newObject.position.clone();
        const tempRot = newObject.rotation.clone();
        const tempScale = newObject.scale.clone();
        newObject.position.set(0,0,0);
        newObject.rotation.set(0,0,0);
        newObject.scale.set(1,1,1);
        newObject.updateMatrixWorld(true);
        boundingBox.setFromObject(newObject, true);
        if (!boundingBox.isEmpty()) {
            objectBaseY = -boundingBox.min.y;
            logToPage(`Calculated objectBaseY: ${objectBaseY.toFixed(3)} (MinY: ${boundingBox.min.y.toFixed(3)})`);
        } else {
            logToPage("Warning: BoundingBox empty during base Y calculation.", 'error');
        }
        newObject.position.copy(tempPos);
        newObject.rotation.copy(tempRot);
        newObject.scale.copy(tempScale); // Restore original scale (likely 1,1,1)
        newObject.updateMatrixWorld(true);
    } catch (boundsError) {
        logToPage(`Base bounds calculation error: ${boundsError.message}`, 'error');
         objectBaseY = 0;
    }


    // --- 7. Position Object & Apply Current Slider Values ---
    onModelYOffsetChange(); // Apply Y offset based on new base Y and current slider
    onObjectRotationChange(); // Apply rotation based on current sliders (likely 0 now)
    onObjectScaleChange();   // Apply scale based on current slider (likely 1.0 now)


    // --- 8. Add to Scene & Update World Center ---
    scene.add(newObject);
    currentObject = newObject;
    logToPage(`Object ${newObject.name} added to scene.`);


    // --- 9. Target light and controls ---
    // (Targeting logic remains the same as before)
    const worldCenter = new THREE.Vector3();
    try {
        currentObject.updateMatrixWorld(true);
        const finalBounds = new THREE.Box3().setFromObject(currentObject, true);
        if(!finalBounds.isEmpty()) {
            finalBounds.getCenter(worldCenter);
            logToPage(`Final object center: ${worldCenter.x.toFixed(2)}, ${worldCenter.y.toFixed(2)}, ${worldCenter.z.toFixed(2)}`);
        } else {
            logToPage("Warning: Final BoundingBox empty.", 'error');
            worldCenter.copy(currentObject.position).y += 1 * currentObject.scale.y; // Adjust fallback for scale
        }
    } catch(e) {
        logToPage(`Final bounds/center calculation error: ${e.message}`, 'error');
        worldCenter.copy(currentObject.position).y += 1 * currentObject.scale.y; // Adjust fallback for scale
    }
    lightTarget.position.copy(worldCenter);
    const lightY = parseFloat(lightYSlider.value);
    const lightX = parseFloat(lightXSlider.value);
    const lightZ = parseFloat(lightZSlider.value);
    spotLight.position.set(lightX, lightY, lightZ);
    if (lightVisualizer) lightVisualizer.position.copy(spotLight.position);
    updateLightPositionDisplays();
    controls.target.copy(worldCenter);
    controls.update();
    logToPage("Light & controls targeted to object center.");
}


// --- DOM & Control Setup ---
function getDOMElements() {
    logToPage("Getting DOM elements...");
    sceneContainer = document.getElementById('scene-container');
    controlsContainer = document.getElementById('controls-container');
    toggleControlsBtn = document.getElementById('toggleControlsBtn');
    shapeSelect = document.getElementById('shapeSelect');
    shapeSearchInput = document.getElementById('shapeSearch');
    refreshShapeListBtn = document.getElementById('refreshShapeListBtn');
    copyLogBtn = document.getElementById('copyLogBtn');
    cameraLockBtn = document.getElementById('cameraLockBtn');
    gridHelperToggle = document.getElementById('gridHelperToggle');
    axesHelperToggle = document.getElementById('axesHelperToggle');
    resetObjectBtn = document.getElementById('resetObjectBtn');
    saveStateBtn = document.getElementById('saveStateBtn'); // Get Save button
    loadStateBtn = document.getElementById('loadStateBtn'); // Get Load button
    resetSceneBtn = document.getElementById('resetSceneBtn'); // <-- ADD THIS LINE
    // Environment
    wallHueSlider = document.getElementById('wallHue'); wallHueValueSpan = document.getElementById('wallHueValue');
    wallSaturationSlider = document.getElementById('wallSaturation'); wallSaturationValueSpan = document.getElementById('wallSaturationValue');
    wallBrightnessSlider = document.getElementById('wallBrightness'); wallBrightnessValueSpan = document.getElementById('wallBrightnessValue');
    floorHueSlider = document.getElementById('floorHue'); floorHueValueSpan = document.getElementById('floorHueValue');
    floorSaturationSlider = document.getElementById('floorSaturation'); floorSaturationValueSpan = document.getElementById('floorSaturationValue');
    floorBrightnessSlider = document.getElementById('floorBrightness'); floorBrightnessValueSpan = document.getElementById('floorBrightnessValue');
    // Object
    modelYOffsetSlider = document.getElementById('modelYOffset'); modelYOffsetValueSpan = document.getElementById('modelYOffsetValue');
    objectRotationXSlider = document.getElementById('objectRotationX'); objectRotationXValueSpan = document.getElementById('objectRotationXValue');
    objectRotationYSlider = document.getElementById('objectRotationY'); objectRotationYValueSpan = document.getElementById('objectRotationYValue');
    objectRotationZSlider = document.getElementById('objectRotationZ'); objectRotationZValueSpan = document.getElementById('objectRotationZValue');
    objectScaleSlider = document.getElementById('objectScale'); objectScaleValueSpan = document.getElementById('objectScaleValue');
    modelColorHueSlider = document.getElementById('modelColorHue'); modelColorHueValueSpan = document.getElementById('modelColorHueValue');
    objectBrightnessSlider = document.getElementById('objectBrightness'); objectBrightnessValueSpan = document.getElementById('objectBrightnessValue');
    objectRoughnessSlider = document.getElementById('objectRoughness'); objectRoughnessValueSpan = document.getElementById('objectRoughnessValue');
    objectMetalnessSlider = document.getElementById('objectMetalness'); objectMetalnessValueSpan = document.getElementById('objectMetalnessValue');
    // Light
    lightIntensitySlider = document.getElementById('lightIntensity'); lightIntensityValueSpan = document.getElementById('lightIntensityValue');
    lightAngleSlider = document.getElementById('lightAngle'); lightAngleValueSpan = document.getElementById('lightAngleValue');
    lightPenumbraSlider = document.getElementById('lightPenumbra'); lightPenumbraValueSpan = document.getElementById('lightPenumbraValue');
    lightXSlider = document.getElementById('lightX'); lightXValueSpan = document.getElementById('lightXValue');
    lightYSlider = document.getElementById('lightY'); lightYValueSpan = document.getElementById('lightYValue');
    lightZSlider = document.getElementById('lightZ'); lightZValueSpan = document.getElementById('lightZValue');
    logToPage("DOM elements assigned.");

    // Check if all elements were found
     const requiredElements = [sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn, cameraLockBtn, gridHelperToggle, axesHelperToggle, resetObjectBtn, saveStateBtn, loadStateBtn, resetSceneBtn, wallHueSlider, wallHueValueSpan, wallSaturationSlider, wallSaturationValueSpan, wallBrightnessSlider, wallBrightnessValueSpan, floorHueSlider, floorHueValueSpan, floorSaturationSlider, floorSaturationValueSpan, floorBrightnessSlider, floorBrightnessValueSpan, modelYOffsetSlider, modelYOffsetValueSpan, objectRotationXSlider, objectRotationXValueSpan, objectRotationYSlider, objectRotationYValueSpan, objectRotationZSlider, objectRotationZValueSpan, objectScaleSlider, objectScaleValueSpan, modelColorHueSlider, modelColorHueValueSpan, objectBrightnessSlider, objectBrightnessValueSpan, objectRoughnessSlider, objectRoughnessValueSpan, objectMetalnessSlider, objectMetalnessValueSpan, lightIntensitySlider, lightIntensityValueSpan, lightAngleSlider, lightAngleValueSpan, lightPenumbraSlider, lightPenumbraValueSpan, lightXSlider, lightYSlider, lightZSlider, lightXValueSpan, lightYValueSpan, lightZValueSpan];
     if (requiredElements.some(el => !el)) {
         const elementNames = ["sceneContainer", "controlsContainer", "toggleControlsBtn", "shapeSelect", "shapeSearchInput", "refreshShapeListBtn", "copyLogBtn", "cameraLockBtn", "gridHelperToggle", "axesHelperToggle", "resetObjectBtn", "saveStateBtn", "loadStateBtn", "resetSceneBtn", "wallHueSlider", "wallHueValueSpan", "wallSaturationSlider", "wallSaturationValueSpan", "wallBrightnessSlider", "wallBrightnessValueSpan", "floorHueSlider", "floorHueValueSpan", "floorSaturationSlider", "floorSaturationValueSpan", "floorBrightnessSlider", "floorBrightnessValueSpan", "modelYOffsetSlider", "modelYOffsetValueSpan", "objectRotationXSlider", "objectRotationXValueSpan", "objectRotationYSlider", "objectRotationYValueSpan", "objectRotationZSlider", "objectRotationZValueSpan", "objectScaleSlider", "objectScaleValueSpan", "modelColorHueSlider", "modelColorHueValueSpan", "objectBrightnessSlider", "objectBrightnessValueSpan", "objectRoughnessSlider", "objectRoughnessValueSpan", "objectMetalnessSlider", "objectMetalnessValueSpan", "lightIntensitySlider", "lightIntensityValueSpan", "lightAngleSlider", "lightAngleValueSpan", "lightPenumbraSlider", "lightPenumbraValueSpan", "lightXSlider", "lightYSlider", "lightZSlider", "lightXValueSpan", "lightYValueSpan", "lightZValueSpan"];
         const missingNames = requiredElements.map((el, i) => el ? null : elementNames[i]).filter(name => name !== null);
         logToPage(`CRITICAL ERROR: Missing DOM elements: ${missingNames.join(', ')}. Check HTML IDs.`, 'error');
         throw new Error("Essential control elements missing!");
     }
}

function storeOriginalOptions() {
     if (!shapeSelect) return;
     logToPage("Storing original shape options...");
     try {
         originalShapeOptions = Array.from(shapeSelect.options).map(opt => ({
             value: opt.value,
             text: opt.text
         }));
         logToPage(`Stored ${originalShapeOptions.length} options.`);
     } catch (e) {
         logToPage(`Error storing options: ${e.message}`, 'error');
     }
 }

function filterShapeDropdown() {
    if (!shapeSelect || !shapeSearchInput || !originalShapeOptions) return;
    logToPage(`Filtering shapes for term: "${shapeSearchInput.value}"`);
    const searchTerm = shapeSearchInput.value.toLowerCase().trim().replace(/_/g, ' ');
    const currentSelectedValue = shapeSelect.value;
    let newSelectedIndex = -1;
    let firstValidIndex = -1;

    shapeSelect.innerHTML = ''; // Clear current options
    let foundCount = 0;

    originalShapeOptions.forEach((optData, index) => { // Use index from original array
        const matches = searchTerm === '' ||
                        optData.value.toLowerCase().replace(/_/g, ' ').includes(searchTerm) ||
                        optData.text.toLowerCase().includes(searchTerm);

        if (matches) {
            const newOption = document.createElement('option');
            newOption.value = optData.value;
            newOption.textContent = optData.text;
            shapeSelect.appendChild(newOption);

            const newOptionIndexInDropdown = shapeSelect.options.length - 1;
            if (firstValidIndex === -1) { firstValidIndex = newOptionIndexInDropdown; }
            // Check if the *current* option matches the value that *was* selected
            if (optData.value === currentSelectedValue) {
                newSelectedIndex = newOptionIndexInDropdown;
             }
            foundCount++;
        }
    });

    if (shapeSelect.options.length === 0) {
         const noResultOption = document.createElement('option');
         noResultOption.textContent = "No matches found";
         noResultOption.disabled = true;
         shapeSelect.appendChild(noResultOption);
    } else if (newSelectedIndex !== -1) {
         shapeSelect.selectedIndex = newSelectedIndex; // Reselect previously selected if still visible
     } else if (firstValidIndex !== -1) {
         shapeSelect.selectedIndex = firstValidIndex; // Select first match otherwise
     }
     logToPage(`Filtering complete. Found ${foundCount} matches.`);
     // Trigger shape change if the selection actually changed due to filtering
     if(shapeSelect.value !== currentSelectedValue && shapeSelect.options.length > 0) {
         onShapeChange({ target: shapeSelect }); // Simulate event
     }
}

function resetShapeDropdown() {
     if (!shapeSearchInput) return;
     logToPage("Resetting shape dropdown.");
     shapeSearchInput.value = '';
     filterShapeDropdown(); // Repopulate with all options and reset selection logic
 }


// --- Initialization ---
function init() {
    try {
        logToPage("Init started...");
        getDOMElements(); // Includes save/load buttons now
         logToPage("DOM elements retrieved successfully.");

        storeOriginalOptions();

        // --- Scene Setup ---
        scene = new THREE.Scene();
        logToPage("Scene created.");

        const aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
        camera = new THREE.PerspectiveCamera(60, aspect > 0 ? aspect : 1, 0.1, 100);
        camera.position.set(0, 6, 14);
        camera.lookAt(0, 1, 0);
        logToPage("Camera created.");

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        sceneContainer.appendChild(renderer.domElement);
        logToPage("Renderer created and added to DOM.");

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
        scene.add(ambientLight);

        spotLight = new THREE.SpotLight(0xffffff, 1.0, 150, 1.0, 0, 1); // Default intensity, distance, angle, penumbra, decay
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024; spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 0.5; spotLight.shadow.camera.far = 50;
        spotLight.shadow.bias = -0.001;
        scene.add(spotLight);
        logToPage("Lights added.");

        lightTarget = new THREE.Object3D(); // Target for the spotlight
        scene.add(lightTarget);
        spotLight.target = lightTarget;
         logToPage("Spotlight target created.");

        // Optional: Visualizer for the light's position
        const lightSphereGeometry = new THREE.SphereGeometry(0.2, 16, 8);
        const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        lightVisualizer = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
        scene.add(lightVisualizer);
        logToPage("Light visualizer added.");

        // --- Floor ---
        const floorGeometry = new THREE.PlaneGeometry(40, 40);
        floorBaseMaterial = { roughness: 0.9, metalness: 0.1 }; // Store non-color defaults
        const floorMaterial = new THREE.MeshStandardMaterial({
            ...floorBaseMaterial, // Apply base roughness/metalness
            color: 0x808080 // Initial color, will be set by handler
        });
        floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);
        logToPage("Floor added.");

        // --- Helpers ---
        gridHelper = new THREE.GridHelper(40, 40, 0x888888, 0x444444);
        axesHelper = new THREE.AxesHelper(3);
        gridHelper.visible = gridHelperToggle.checked; // Set initial visibility from checkbox
        axesHelper.visible = axesHelperToggle.checked; // Set initial visibility from checkbox
        scene.add(gridHelper);
        scene.add(axesHelper);
        logToPage("Grid and Axes helpers added.");

        // --- Controls ---
        if (!OrbitControls) throw new Error("OrbitControls not loaded!");
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enabled = true; // Start enabled
        controls.enableDamping = true; controls.dampingFactor = 0.05; controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2 - 0.01; // Prevent looking underneath the floor
        controls.minDistance = 2; controls.maxDistance = 50;
        controls.target.set(0, 1, 0); // Initial target
        controls.update();
        logToPage("OrbitControls added.");

        // --- Shared Object Material ---
        objectMaterial = new THREE.MeshStandardMaterial({
            color: 0x3399ff, // Default color (will be overridden by HSL controls)
            roughness: parseFloat(objectRoughnessSlider.value), // Read initial value
            metalness: parseFloat(objectMetalnessSlider.value), // Read initial value
            side: THREE.DoubleSide // Render both sides (useful for planes, open shapes)
        });
        logToPage("Base object material created.");

        // --- Initial Object ---
        logToPage(`Creating initial object ('${shapeSelect.value}')...`);
        // Don't call updateObject yet, allow loadState to potentially override selection
        // updateObject(shapeSelect.value); // Create and position the default object

        // --- Event Listeners ---
        window.addEventListener('resize', onWindowResize, false);
        toggleControlsBtn.addEventListener('click', toggleControls);
        refreshShapeListBtn.addEventListener('click', resetShapeDropdown);
        cameraLockBtn.addEventListener('click', toggleCameraLock);
        gridHelperToggle.addEventListener('change', () => { gridHelper.visible = gridHelperToggle.checked; logToPage(`Grid visibility: ${gridHelper.visible}`) });
        axesHelperToggle.addEventListener('change', () => { axesHelper.visible = axesHelperToggle.checked; logToPage(`Axes visibility: ${axesHelper.visible}`) });
        resetObjectBtn.addEventListener('click', resetObjectState);
         // Environment Listeners
        wallHueSlider.addEventListener('input', onWallColorChange);
        wallSaturationSlider.addEventListener('input', onWallColorChange);
        wallBrightnessSlider.addEventListener('input', onWallColorChange);
        floorHueSlider.addEventListener('input', onFloorColorChange);
        floorSaturationSlider.addEventListener('input', onFloorColorChange);
        floorBrightnessSlider.addEventListener('input', onFloorColorChange);
         // Object Listeners
        modelYOffsetSlider.addEventListener('input', onModelYOffsetChange);
        objectRotationXSlider.addEventListener('input', onObjectRotationChange);
        objectRotationYSlider.addEventListener('input', onObjectRotationChange);
        objectRotationZSlider.addEventListener('input', onObjectRotationChange);
        objectScaleSlider.addEventListener('input', onObjectScaleChange); // Listener for scale
        modelColorHueSlider.addEventListener('input', onModelColorOrBrightnessChange);
        objectBrightnessSlider.addEventListener('input', onModelColorOrBrightnessChange);
        objectRoughnessSlider.addEventListener('input', onObjectMaterialChange);
        objectMetalnessSlider.addEventListener('input', onObjectMaterialChange);
        // Light Listeners
        lightIntensitySlider.addEventListener('input', onLightIntensityChange);
        lightAngleSlider.addEventListener('input', onSpotlightParamsChange);
        lightPenumbraSlider.addEventListener('input', onSpotlightParamsChange);
        lightXSlider.addEventListener('input', onLightPositionChange);
        lightYSlider.addEventListener('input', onLightPositionChange);
        lightZSlider.addEventListener('input', onLightPositionChange);
         // Other Listeners
        shapeSelect.addEventListener('change', onShapeChange);
        shapeSearchInput.addEventListener('input', filterShapeDropdown);
        copyLogBtn.addEventListener('click', () => {
            try {
                navigator.clipboard.writeText(debugConsole.innerText);
                logToPage("Log copied to clipboard.", "success");
            } catch (err) {
                logToPage(`Failed to copy log: ${err.message}`, "error");
            }
        });
        // Add listener for reset buttons within the controls container
        controlsContainer.addEventListener('click', handleSliderReset);

        // --- Add listeners for Save/Load/Reset buttons ---
        saveStateBtn?.addEventListener('click', saveSceneState);
        loadStateBtn?.addEventListener('click', loadSceneState);
        resetSceneBtn?.addEventListener('click', resetSceneToDefaults);

        logToPage("Event listeners added.");

        // --- Apply Initial Control Values OR Load State ---
        let stateLoaded = false;
        try {
            stateLoaded = loadSceneState(); // Attempt to load
        } catch (loadErr) {
            logToPage(`Error during initial state load: ${loadErr.message}`, 'error');
        }

        // --- Updated Block: Apply Defaults or Ensure Initial Object ---
        if (!stateLoaded) {
            logToPage("No valid saved state found, applying defaults via reset function.");
            resetSceneToDefaults(); // Call the reset function
        } else {
            // If state *was* loaded, make sure currentObject is valid
            if (!currentObject) {
                logToPage("State loaded but currentObject is null. Recreating from loaded type.", "error");
                updateObject(shapeSelect.value || 'sphere'); // Recreate using loaded type or fallback
            }
            logToPage("Loaded state applied successfully.");
        }
        // --- End of Updated Block ---

        // --- Start Animation ---
        animate();
        logToPage("Init complete, starting animation loop.", "success");

    } catch (error) {
        logToPage(`Initialization Error: ${error.message}\n${error.stack}`, 'error');
        if(sceneContainer){
            sceneContainer.innerHTML = `<p style='color: #ff8080; padding: 20px;'>Initialization Error: ${error.message}<br>Check Debug Log Below.</p>`;
        } else {
            // Fallback if sceneContainer itself is missing
            alert(`Initialization Error: ${error.message}`);
        }
    }
}

// --- Event Handlers ---

function onWindowResize() {
    logToPage("Window resize detected.");
    // Delay resize slightly to allow layout changes (e.g., sidebar) to settle
    setTimeout(() => {
        try {
            const width = sceneContainer.clientWidth;
            const height = sceneContainer.clientHeight;
            if (width > 0 && height > 0) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                logToPage(`Resized renderer to ${width}x${height}`);
            } else {
                 logToPage(`Resize skipped: Invalid dimensions ${width}x${height}`, 'error');
            }
        } catch(e){ logToPage(`Resize error: ${e.message}`,'error')}
    }, 50); // 50ms delay
}

function toggleControls() {
    try {
        logToPage("Toggling controls...");
        const isCollapsed = document.body.classList.toggle('controls-collapsed');
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        const minWidthThreshold = 768; // Same as CSS

        // Adjust button text based on state and screen orientation/size
        if (isLandscape && window.innerWidth >= minWidthThreshold) {
            toggleControlsBtn.textContent = isCollapsed ? '>>' : '<<';
        } else {
            toggleControlsBtn.textContent = isCollapsed ? 'Expand' : 'Collapse';
        }

        logToPage(`Controls ${isCollapsed ? 'collapsed' : 'expanded'}.`);
        // Trigger resize *after* the sidebar animation might have started/finished
        // A small delay helps ensure the scene container has its final size.
        setTimeout(onWindowResize, 150); // Use the existing resize handler

    } catch (error) {
        logToPage(`Error toggling controls: ${error.message}`, 'error');
    }
}

function toggleCameraLock() {
     try {
         if (!controls || !cameraLockBtn) return; // Check if elements exist
         controls.enabled = !controls.enabled;
         cameraLockBtn.textContent = controls.enabled ? 'Lock Camera' : 'Unlock Camera';
         logToPage(`Camera controls ${controls.enabled ? 'enabled' : 'disabled'}.`);
     } catch (e) { logToPage(`Camera lock toggle error: ${e.message}`, 'error'); }
 }

function resetObjectState() {
    logToPage("Resetting object state...");
    try {
        // IDs of sliders related to the object's visual state
        const objectControlSliderIds = [
            'modelYOffset', 'objectRotationX', 'objectRotationY', 'objectRotationZ',
            'objectScale', // Include scale
            'modelColorHue', 'objectBrightness', 'objectRoughness', 'objectMetalness'
        ];
        objectControlSliderIds.forEach(id => {
             const slider = document.getElementById(id);
             // Find the corresponding reset button using dataset attribute
             const resetButton = slider?.closest('.control-group')?.querySelector(`.reset-slider-btn[data-target-slider="${id}"]`);
             if (resetButton && resetButton.click) { // Check if button exists and has click method
                 resetButton.click(); // Simulate clicking the reset button
             } else {
                 logToPage(`Could not find or click reset button for slider ${id}`, 'error');
             }
        });
        logToPage("Object state reset triggered via reset buttons.");
    } catch (e) {
         logToPage(`Error during object reset: ${e.message}`, 'error');
    }
 }

function onModelYOffsetChange() {
    if (!currentObject || !modelYOffsetSlider || !modelYOffsetValueSpan) return;
    try {
        const offset = parseFloat(modelYOffsetSlider.value);
        modelYOffsetValueSpan.textContent = offset.toFixed(1);
        // Recalculate Y position based on potentially updated objectBaseY and new offset
        currentObject.position.y = objectBaseY + offset;

        // Update targets after position change
        currentObject.updateMatrixWorld(true);
        const newWorldCenter = new THREE.Vector3();
        const finalBounds = new THREE.Box3().setFromObject(currentObject, true);
        if(!finalBounds.isEmpty()) {
            finalBounds.getCenter(newWorldCenter);
        } else {
            newWorldCenter.copy(currentObject.position).y += 1 * currentObject.scale.y; // Adjust fallback for scale
        }
        lightTarget.position.copy(newWorldCenter);
        controls.target.copy(newWorldCenter);

    } catch(e){ logToPage(`Y Offset change error: ${e.message}`,'error')}
}

function onObjectRotationChange() {
    if (!currentObject || !objectRotationXSlider || !objectRotationYSlider || !objectRotationZSlider) return;
    try {
        const rxDeg = parseFloat(objectRotationXSlider.value);
        const ryDeg = parseFloat(objectRotationYSlider.value);
        const rzDeg = parseFloat(objectRotationZSlider.value);

        // Apply rotation in Radians
        currentObject.rotation.x = THREE.MathUtils.degToRad(rxDeg);
        currentObject.rotation.y = THREE.MathUtils.degToRad(ryDeg);
        currentObject.rotation.z = THREE.MathUtils.degToRad(rzDeg);

        updateObjectRotationDisplay(); // Update UI spans

        // Update targets after rotation change
        currentObject.updateMatrixWorld(true);
        const newWorldCenter = new THREE.Vector3();
        const finalBounds = new THREE.Box3().setFromObject(currentObject, true);
        if(!finalBounds.isEmpty()) {
            finalBounds.getCenter(newWorldCenter);
        } else {
            newWorldCenter.copy(currentObject.position).y += 1 * currentObject.scale.y; // Adjust fallback for scale
        }
        lightTarget.position.copy(newWorldCenter);
        controls.target.copy(newWorldCenter);

    } catch(e){ logToPage(`Rotation change error: ${e.message}`,'error')}
}

function onObjectScaleChange() {
    if (!currentObject || !objectScaleSlider || !objectScaleValueSpan) return;
    try {
        const scaleValue = parseFloat(objectScaleSlider.value);

        // Apply uniform scale
        currentObject.scale.set(scaleValue, scaleValue, scaleValue);

        // Update UI Span
        objectScaleValueSpan.textContent = scaleValue.toFixed(2) + 'x';

        // Recalculate center and update targets (important as scale changes bounds)
        currentObject.updateMatrixWorld(true);
        const newWorldCenter = new THREE.Vector3();
        const finalBounds = new THREE.Box3().setFromObject(currentObject, true);
        if(!finalBounds.isEmpty()) {
            finalBounds.getCenter(newWorldCenter);
        } else {
            newWorldCenter.copy(currentObject.position).y += 1 * scaleValue; // Fallback takes scale into account slightly
        }
        lightTarget.position.copy(newWorldCenter);
        controls.target.copy(newWorldCenter);
        // controls.update(); // Called in animation loop

    } catch(e) {
        logToPage(`Scale change error: ${e.message}`, 'error');
    }
}

function updateObjectRotationDisplay() {
    try {
         if(objectRotationXValueSpan) objectRotationXValueSpan.textContent = `${parseFloat(objectRotationXSlider.value)}°`;
         if(objectRotationYValueSpan) objectRotationYValueSpan.textContent = `${parseFloat(objectRotationYSlider.value)}°`;
         if(objectRotationZValueSpan) objectRotationZValueSpan.textContent = `${parseFloat(objectRotationZSlider.value)}°`;
    } catch(e){ logToPage(`Update rotation display error: ${e.message}`,'error')}
}

// Combined handler for Hue and Brightness - Updates shared material AND traverses groups
function onModelColorOrBrightnessChange() {
    if (!objectMaterial || !modelColorHueSlider || !objectBrightnessSlider) return;
    try {
        const hue = parseFloat(modelColorHueSlider.value);
        const lightness = parseFloat(objectBrightnessSlider.value);
        const saturation = 0.8; // Keep saturation constant for simplicity

        // --- Update the shared material instance first ---
        objectMaterial.color.setHSL(hue, saturation, lightness);

        // --- Update UI spans ---
        if(modelColorHueValueSpan) modelColorHueValueSpan.textContent = `${Math.round(hue * 360)}°`;
        if(objectBrightnessValueSpan) objectBrightnessValueSpan.textContent = lightness.toFixed(2);

        // --- Update materials on the current object if it's a Group ---
        // This handles objects created with matClone() in shape modules
        if (currentObject && currentObject.isGroup) {
            currentObject.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Check if the child's material is NOT the shared one
                    // AND is a standard material (to avoid errors on BasicMaterial etc.)
                    // AND is NOT a wireframe material (wireframes often keep base color)
                    if (child.material !== objectMaterial &&
                        child.material.isMeshStandardMaterial &&
                        !child.material.wireframe) // Don't change wireframe color here
                    {
                        child.material.color.copy(objectMaterial.color); // Copy the updated color
                    }
                }
            });
        }
        // If currentObject is a single Mesh using objectMaterial, it's already updated.
        // If it's a single Mesh using a cloned material (e.g., explicit wireframe), it won't be updated here.

    } catch(e){ logToPage(`Color/Brightness change error: ${e.message}`,'error')}
}

// --- Environment Control Handlers ---
function onFloorColorChange() {
     if (!floor || !floor.material || !floorHueSlider || !floorSaturationSlider || !floorBrightnessSlider) return;
     try {
        const hue = parseFloat(floorHueSlider.value);
        const saturation = parseFloat(floorSaturationSlider.value);
        const brightness = parseFloat(floorBrightnessSlider.value);

        floor.material.color.setHSL(hue, saturation, brightness);

        if(floorHueValueSpan) floorHueValueSpan.textContent = `${Math.round(hue * 360)}°`;
        if(floorSaturationValueSpan) floorSaturationValueSpan.textContent = saturation.toFixed(2);
        if(floorBrightnessValueSpan) floorBrightnessValueSpan.textContent = brightness.toFixed(2);
    } catch(e){ logToPage(`Floor color error: ${e.message}`,'error')}
}

function onWallColorChange() { // Wall color affects scene background AND scene container div bg
    if (!wallHueSlider || !wallSaturationSlider || !wallBrightnessSlider) return;
    try {
        const hue = parseFloat(wallHueSlider.value);
        const saturation = parseFloat(wallSaturationSlider.value);
        const brightness = parseFloat(wallBrightnessSlider.value); // This is Lightness for HSL

        const bgColor = new THREE.Color();
        bgColor.setHSL(hue, saturation, brightness);

        if(scene) scene.background = bgColor; // Update THREE scene background
        if(sceneContainer) sceneContainer.style.backgroundColor = bgColor.getStyle(); // Update div background

        if(wallHueValueSpan) wallHueValueSpan.textContent = `${Math.round(hue * 360)}°`;
        if(wallSaturationValueSpan) wallSaturationValueSpan.textContent = saturation.toFixed(2);
        if(wallBrightnessValueSpan) wallBrightnessValueSpan.textContent = brightness.toFixed(2);
    } catch(e){ logToPage(`Wall/Background color error: ${e.message}`,'error')}
}

// --- Shape Selection Handler ---
function onShapeChange(event) {
    try {
        if (event?.target?.value) { // Ensure there's a value selected
             updateObject(event.target.value); // Call the main update function
        } else {
            logToPage("Shape change event triggered without valid target value.", "error");
        }
    } catch (e) { logToPage(`Shape change error: ${e.message}`,'error') }
}

// --- Slider Reset Handler (ensure this is present) ---
 function handleSliderReset(event) {
     // Event delegation: Only act if a reset button was clicked
     if (!event.target.classList.contains('reset-slider-btn')) {
         return;
     }
     event.stopPropagation(); // Prevent triggering other listeners if nested
     try {
         const button = event.target;
         const sliderId = button.dataset.targetSlider;
         const resetValue = button.dataset.resetValue;
         const sliderElement = document.getElementById(sliderId);

         if (sliderElement && resetValue !== undefined) {
             sliderElement.value = resetValue;
             // Dispatch 'input' event to trigger updates (UI spans, potentially THREE updates)
             sliderElement.dispatchEvent(new Event('input', { bubbles: true }));
             logToPage(`Slider '${sliderId}' reset to ${resetValue}.`);
         } else {
              logToPage(`Reset failed: Slider '${sliderId}' or reset value '${resetValue}' not found/defined.`, 'error');
         }
     } catch (e) {
          logToPage(`Slider reset error: ${e.message}`, 'error');
     }
 }

// --- Save/Load State Functions ---

function saveSceneState() {
    logToPage("Attempting to save scene state...");
    if (!camera || !controls || !spotLight || !shapeSelect || !currentObject) {
        logToPage("Cannot save state: Core components not ready.", 'error');
        return;
    }

    try {
        const state = {
            version: 1.0, // For future compatibility checks
            camera: {
                position: camera.position.toArray(),
                target: controls.target.toArray()
            },
            light: {
                intensity: parseFloat(lightIntensitySlider.value),
                angle: parseFloat(lightAngleSlider.value), // Store degrees
                penumbra: parseFloat(lightPenumbraSlider.value),
                position: spotLight.position.toArray() // Store actual light position
            },
            object: {
                type: shapeSelect.value,
                yOffset: parseFloat(modelYOffsetSlider.value),
                rotation: { // Store degrees
                    x: parseFloat(objectRotationXSlider.value),
                    y: parseFloat(objectRotationYSlider.value),
                    z: parseFloat(objectRotationZSlider.value)
                },
                scale: parseFloat(objectScaleSlider.value),
                material: {
                    hue: parseFloat(modelColorHueSlider.value),
                    brightness: parseFloat(objectBrightnessSlider.value),
                    roughness: parseFloat(objectRoughnessSlider.value),
                    metalness: parseFloat(objectMetalnessSlider.value)
                },
                // params: {} // TODO: Add specific shape params later
            },
            environment: {
                wall: {
                    hue: parseFloat(wallHueSlider.value),
                    saturation: parseFloat(wallSaturationSlider.value),
                    brightness: parseFloat(wallBrightnessSlider.value)
                },
                floor: {
                    hue: parseFloat(floorHueSlider.value),
                    saturation: parseFloat(floorSaturationSlider.value),
                    brightness: parseFloat(floorBrightnessSlider.value)
                }
            },
            helpers: {
                gridVisible: gridHelperToggle.checked,
                axesVisible: axesHelperToggle.checked
            },
            ui: {
                controlsCollapsed: document.body.classList.contains('controls-collapsed'),
                cameraLocked: !controls.enabled // Save opposite of controls.enabled
            }
        };

        const stateString = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, stateString);
        logToPage("Scene state saved successfully.", "success");

    } catch (error) {
        logToPage(`Error saving state: ${error.message}`, 'error');
        console.error("Save State Error Details:", error);
    }
}


function loadSceneState() {
    logToPage("Attempting to load scene state...");
    const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!savedStateJSON) {
        logToPage("No saved state found in localStorage.");
        return false; // Indicate nothing was loaded
    }

    let loadedState;
    try {
        loadedState = JSON.parse(savedStateJSON);
        if (!loadedState || loadedState.version !== 1.0) {
             logToPage(`Saved state version mismatch or invalid. Expected 1.0, got ${loadedState?.version}. Ignoring.`, 'error');
             localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid state
             return false;
        }
        logToPage("Saved state parsed successfully.");
    } catch (error) {
        logToPage(`Error parsing saved state: ${error.message}. Clearing invalid state.`, 'error');
        console.error("Parse State Error Details:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid state
        return false;
    }

    try {
        logToPage("Applying loaded state...");

        // --- Apply UI Control Values FIRST ---
        // Environment
        wallHueSlider.value = loadedState.environment.wall.hue;
        wallSaturationSlider.value = loadedState.environment.wall.saturation;
        wallBrightnessSlider.value = loadedState.environment.wall.brightness;
        floorHueSlider.value = loadedState.environment.floor.hue;
        floorSaturationSlider.value = loadedState.environment.floor.saturation;
        floorBrightnessSlider.value = loadedState.environment.floor.brightness;

        // Light
        lightIntensitySlider.value = loadedState.light.intensity;
        lightAngleSlider.value = loadedState.light.angle;
        lightPenumbraSlider.value = loadedState.light.penumbra;
        // Apply light position from saved state AFTER calling handler
        lightXSlider.value = loadedState.light.position[0];
        lightYSlider.value = loadedState.light.position[1];
        lightZSlider.value = loadedState.light.position[2];

        // Object Material & Transform Sliders
        modelColorHueSlider.value = loadedState.object.material.hue;
        objectBrightnessSlider.value = loadedState.object.material.brightness;
        objectRoughnessSlider.value = loadedState.object.material.roughness;
        objectMetalnessSlider.value = loadedState.object.material.metalness;
        modelYOffsetSlider.value = loadedState.object.yOffset;
        objectRotationXSlider.value = loadedState.object.rotation.x;
        objectRotationYSlider.value = loadedState.object.rotation.y;
        objectRotationZSlider.value = loadedState.object.rotation.z;
        objectScaleSlider.value = loadedState.object.scale;

        // Helpers
        gridHelperToggle.checked = loadedState.helpers.gridVisible;
        axesHelperToggle.checked = loadedState.helpers.axesVisible;

        // UI State
        controls.enabled = !loadedState.ui.cameraLocked; // Set OrbitControls state
        cameraLockBtn.textContent = controls.enabled ? 'Lock Camera' : 'Unlock Camera';
        if (loadedState.ui.controlsCollapsed) {
            document.body.classList.add('controls-collapsed');
        } else {
            document.body.classList.remove('controls-collapsed');
        }
        // Manually call toggleControls logic just to update button text correctly
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        const minWidthThreshold = 768;
         if (isLandscape && window.innerWidth >= minWidthThreshold) {
            toggleControlsBtn.textContent = loadedState.ui.controlsCollapsed ? '>>' : '<<';
        } else {
            toggleControlsBtn.textContent = loadedState.ui.controlsCollapsed ? 'Expand' : 'Collapse';
        }


        // --- Apply State to Three.js Objects / Scene ---

        // Apply Camera
        camera.position.fromArray(loadedState.camera.position);
        controls.target.fromArray(loadedState.camera.target);
        controls.update(); // IMPORTANT: Update controls after changing target/position

        // Apply Environment Colors (read from sliders)
        onWallColorChange();
        onFloorColorChange();

        // Apply Helper Visibility
        gridHelper.visible = loadedState.helpers.gridVisible;
        axesHelper.visible = loadedState.helpers.axesVisible;

        // Apply Light Settings (read from sliders)
        onLightIntensityChange();
        onSpotlightParamsChange();
        onLightPositionChange(); // Applies position based on sliders set above

        // --- Update Object (Crucial Order) ---
        // 1. Set the shape selector
        shapeSelect.value = loadedState.object.type;
        // Ensure the selected option exists; fallback if not
        if (shapeSelect.value !== loadedState.object.type) {
            logToPage(`Warning: Loaded shape type "${loadedState.object.type}" not found in dropdown. Using default.`, 'error');
            shapeSelect.value = originalShapeOptions[0]?.value || 'sphere'; // Fallback
        }

        // 2. Update the object (this creates it with random color, default transform)
        // Color randomization will happen here, overriding saved color temporarily.
        // We will re-apply saved color/material/transform right after.
        updateObject(shapeSelect.value);

        // 3. Re-apply loaded Material, Transform AFTER updateObject created the new mesh/group
        if (currentObject) {
            // Apply Material (overriding the random color set by updateObject)
            onModelColorOrBrightnessChange(); // Reads sliders we set earlier
            onObjectMaterialChange();       // Reads sliders we set earlier
            // Apply Transform
            onModelYOffsetChange();         // Reads slider
            onObjectRotationChange();       // Reads sliders
            onObjectScaleChange();          // Reads slider
        } else {
             logToPage("Warning: currentObject is null after updateObject call during load.", 'error');
        }


        // --- Dispatch Events to Update UI Spans ---
        // Trigger 'input' for ranges and 'change' for checkboxes
         document.querySelectorAll('#controls-container input[type="range"]').forEach(slider => {
             slider.dispatchEvent(new Event('input', { bubbles: true }));
         });
         document.querySelectorAll('#controls-container input[type="checkbox"]').forEach(checkbox => {
             checkbox.dispatchEvent(new Event('change', { bubbles: true }));
         });

        logToPage("Scene state loaded and applied successfully.", "success");
        return true; // Indicate success

    } catch (error) {
        logToPage(`Error applying loaded state: ${error.message}`, 'error');
        console.error("Apply State Error Details:", error);
        return false; // Indicate failure
    }
}


// --- Animation Loop ---
function animate() {
    try {
        requestAnimationFrame(animate);
        if (controls.enabled) { // Only update controls if they are enabled
             controls.update();
        }
        renderer.render(scene, camera);
    }
    catch (renderError) {
         logToPage(`Animation loop error: ${renderError.message}\n${renderError.stack}`, 'error');
    }
}

// --- Event Handlers ---

// Add/Replace this function definition within the // --- Event Handlers --- section

  // Handler for Roughness and Metalness - Updates shared material AND traverses groups
  function onObjectMaterialChange() {
     if (!objectMaterial || !objectRoughnessSlider || !objectMetalnessSlider) return;
     try {
         const roughness = parseFloat(objectRoughnessSlider.value);
         const metalness = parseFloat(objectMetalnessSlider.value);

         // --- Update the shared material instance first ---
         objectMaterial.roughness = roughness;
         objectMaterial.metalness = metalness;

         // --- Update UI spans ---
         if(objectRoughnessValueSpan) objectRoughnessValueSpan.textContent = roughness.toFixed(2);
         if(objectMetalnessValueSpan) objectMetalnessValueSpan.textContent = metalness.toFixed(2);

         // --- Update materials on the current object if it's a Group ---
         if (currentObject && currentObject.isGroup) {
             currentObject.traverse((child) => {
                 if (child.isMesh && child.material) {
                      // Check if the child's material is NOT the shared one
                      // AND is a standard material
                      if (child.material !== objectMaterial &&
                          child.material.isMeshStandardMaterial)
                      {
                          child.material.roughness = roughness;
                          child.material.metalness = metalness;
                      }
                 }
             });
         }
        // If currentObject is a single Mesh using objectMaterial, it's already updated.

     } catch(e){ logToPage(`Material properties change error: ${e.message}`,'error')}
  }

// --- Light Control Handlers ---
function onLightIntensityChange() {
     if (!spotLight || !lightIntensityValueSpan || !lightIntensitySlider) return;
     try {
         spotLight.intensity = parseFloat(lightIntensitySlider.value);
         lightIntensityValueSpan.textContent = spotLight.intensity.toFixed(1);
     } catch(e){ logToPage(`Intensity change error: ${e.message}`,'error')}
}

// Add this function definition within the Event Handlers or Light Control Handlers section

function onSpotlightParamsChange() {
    if (!spotLight || !lightAngleValueSpan || !lightPenumbraValueSpan || !lightAngleSlider || !lightPenumbraSlider) return;
    try {
        const angleDeg = parseFloat(lightAngleSlider.value);
        const penumbra = parseFloat(lightPenumbraSlider.value);
        spotLight.angle = THREE.MathUtils.degToRad(angleDeg);
        spotLight.penumbra = penumbra;
        lightAngleValueSpan.innerHTML = `${angleDeg}°`; // Use innerHTML for degree symbol
        lightPenumbraValueSpan.textContent = penumbra.toFixed(2);
    } catch(e){ logToPage(`Spotlight params change error: ${e.message}`,'error')}
}

// Add these function definitions within the Event Handlers or Light Control Handlers section

function onLightPositionChange() {
     if (!spotLight || !lightVisualizer || !lightXSlider || !lightYSlider || !lightZSlider) return;
     try {
         const newX = parseFloat(lightXSlider.value);
         const newY = parseFloat(lightYSlider.value);
         const newZ = parseFloat(lightZSlider.value);
         spotLight.position.set(newX, newY, newZ);
         lightVisualizer.position.copy(spotLight.position); // Update visualizer
         updateLightPositionDisplays(); // Update UI spans
     } catch(e){ logToPage(`Light position change error: ${e.message}`,'error')}
}

function updateLightPositionDisplays() { // Make sure this helper exists too
    try {
        if(lightXValueSpan) lightXValueSpan.textContent = parseFloat(lightXSlider.value).toFixed(1);
        if(lightYValueSpan) lightYValueSpan.textContent = parseFloat(lightYSlider.value).toFixed(1);
        if(lightZValueSpan) lightZValueSpan.textContent = parseFloat(lightZSlider.value).toFixed(1);
    } catch(e){ logToPage(`Update light display error: ${e.message}`,'error')}
}

// --- Event Handlers ---

// ADD THIS FUNCTION within the Event Handlers section

function resetSceneToDefaults() {
    logToPage("Resetting scene to defaults...");

    try {
        // --- Reset All Sliders to Default Values ---
        document.querySelectorAll('.reset-slider-btn').forEach(button => {
            button.click(); // Simulate clicking every individual reset button
        });
         logToPage("Individual sliders reset.");

         // --- Reset Helpers ---
         gridHelperToggle.checked = false; // Or your desired default
         axesHelperToggle.checked = false; // Or your desired default
         gridHelper.visible = gridHelperToggle.checked;
         axesHelper.visible = axesHelperToggle.checked;
         logToPage("Helpers reset.");

         // --- Reset Camera ---
         camera.position.set(0, 6, 14); // Default position
         controls.target.set(0, 1, 0);    // Default target
         controls.update();
         logToPage("Camera reset.");

         // --- Reset UI ---
         controls.enabled = true; // Unlock camera
         cameraLockBtn.textContent = 'Lock Camera';
         if(document.body.classList.contains('controls-collapsed')) {
             toggleControls(); // Use toggle to handle text/layout changes
         }
         logToPage("UI state reset.");


        // --- Select a Random Primitive ---
        let initialShapeType = 'sphere'; // Default fallback
         try {
             const primitiveOptions = originalShapeOptions.filter(opt => {
                 return !opt.value.includes('_') && !opt.value.startsWith('wireframe');
             }).map(opt => opt.value);

             if (primitiveOptions.length > 0) {
                 const randomIndex = Math.floor(Math.random() * primitiveOptions.length);
                 initialShapeType = primitiveOptions[randomIndex];
                 logToPage(`Selected random primitive: ${initialShapeType}`);
             } else {
                 logToPage("Could not find primitive options for random selection, using sphere.", "error");
             }
         } catch (randomErr) {
              logToPage(`Error selecting random primitive: ${randomErr.message}`, "error");
         }

        // Set the dropdown BEFORE creating the object
        shapeSelect.value = initialShapeType;

        // Create the initial random primitive object
        // updateObject handles random color, transform reset, and light/control targeting
        updateObject(initialShapeType);

        // Apply default environment and light settings (handlers read from reset sliders)
        onWallColorChange();
        onFloorColorChange();
        onLightIntensityChange();
        onSpotlightParamsChange();
        onLightPositionChange();

         // Ensure UI spans reflect reset state
         document.querySelectorAll('#controls-container input[type="range"]').forEach(slider => {
             slider.dispatchEvent(new Event('input', { bubbles: true }));
         });
         document.querySelectorAll('#controls-container input[type="checkbox"]').forEach(checkbox => {
             checkbox.dispatchEvent(new Event('change', { bubbles: true }));
         });


        logToPage("Scene reset to defaults successfully.", "success");

    } catch (error) {
        logToPage(`Error resetting scene: ${error.message}`, 'error');
        console.error("Reset Scene Error Details:", error);
    }
}

// --- Run ---
logToPage("Adding DOMContentLoaded listener...");
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    logToPage("DOM already loaded, running init directly.");
    init();
}