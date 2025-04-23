// --- Imports ---
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // <-- ADD THIS
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
const POSEABLE_MODELS = [
    'models/game_character_base.glb',
    'models/jumping_man.glb',
    'models/male_base0.glb',
    'models/male_base1.glb',
    'models/male_base2.glb'
    // Add more poseable model paths here if needed
];

// --- Global Variables ---
let scene, camera, renderer, controls;
let spotLight, lightTarget, lightVisualizer;
let floor, gridHelper, axesHelper; // Keep gridHelper reference
let currentObject = null;
let objectMaterial; // The single, shared standard material instance
let floorBaseMaterial; // RE-ADD - Store non-color defaults
let originalShapeOptions = [];
let objectBaseY = 0;
let openPoserBtn; // Add variable for the button
let poseSelect; // Add variable for pose dropdown
let currentModelPath = null; // Add variable for current model path
let loadedModelGroup = null; // Add variable for loaded model group
let initialBoneTransforms = null; // Add variable for initial bone transforms

// --- DOM Elements ---
let sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn;
let cameraLockBtn, gridHelperToggle, axesHelperToggle;
let resetObjectBtn;
let saveStateBtn, loadStateBtn, resetSceneBtn; // Save/Load buttons
// Environment Sliders
let wallHueSlider, wallHueValueSpan, wallSaturationSlider, wallSaturationValueSpan, wallBrightnessSlider, wallBrightnessValueSpan;
let floorHueSlider, floorHueValueSpan, floorSaturationSlider, floorSaturationValueSpan, floorBrightnessSlider, floorBrightnessValueSpan; // RE-ADD Floor slider variables
// Object Sliders
let modelYOffsetSlider, modelYOffsetValueSpan;
let objectRotationXSlider, objectRotationXValueSpan, objectRotationYSlider, objectRotationYValueSpan, objectRotationZSlider, objectRotationZValueSpan;
let objectScaleSlider, objectScaleValueSpan;
let modelColorHueSlider, modelColorHueValueSpan, objectBrightnessSlider, objectBrightnessValueSpan;
let objectRoughnessSlider, objectRoughnessValueSpan, objectMetalnessSlider, objectMetalnessValueSpan;
// Light Sliders
let lightIntensitySlider, lightIntensityValueSpan, lightAngleSlider, lightAngleValueSpan, lightPenumbraSlider, lightPenumbraValueSpan;
let lightXSlider, lightYSlider, lightZSlider, lightXValueSpan, lightYValueSpan, lightZValueSpan;

// --- Get DOM Elements ---
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
    openPoserBtn = document.getElementById('openPoserBtn');
    poseSelect = document.getElementById('poseSelect'); // Add pose dropdown
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
     const requiredElements = [sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn, cameraLockBtn, gridHelperToggle, axesHelperToggle, resetObjectBtn, saveStateBtn, loadStateBtn, resetSceneBtn, wallHueSlider, wallHueValueSpan, wallSaturationSlider, wallSaturationValueSpan, wallBrightnessSlider, wallBrightnessValueSpan, floorHueSlider, floorHueValueSpan, floorSaturationSlider, floorSaturationValueSpan, floorBrightnessSlider, floorBrightnessValueSpan, modelYOffsetSlider, modelYOffsetValueSpan, objectRotationXSlider, objectRotationXValueSpan, objectRotationYSlider, objectRotationYValueSpan, objectRotationZSlider, objectRotationZValueSpan, objectScaleSlider, objectScaleValueSpan, modelColorHueSlider, modelColorHueValueSpan, objectBrightnessSlider, objectBrightnessValueSpan, objectRoughnessSlider, objectRoughnessValueSpan, objectMetalnessSlider, objectMetalnessValueSpan, lightIntensitySlider, lightIntensityValueSpan, lightAngleSlider, lightAngleValueSpan, lightPenumbraSlider, lightPenumbraValueSpan, lightXSlider, lightYSlider, lightZSlider, lightXValueSpan, lightYValueSpan, lightZValueSpan, openPoserBtn, poseSelect];
     if (requiredElements.some(el => !el)) {
         const elementNames = ["sceneContainer", "controlsContainer", "toggleControlsBtn", "shapeSelect", "shapeSearchInput", "refreshShapeListBtn", "copyLogBtn", "cameraLockBtn", "gridHelperToggle", "axesHelperToggle", "resetObjectBtn", "saveStateBtn", "loadStateBtn", "resetSceneBtn", "wallHueSlider", "wallHueValueSpan", "wallSaturationSlider", "wallSaturationValueSpan", "wallBrightnessSlider", "wallBrightnessValueSpan", "floorHueSlider", "floorHueValueSpan", "floorSaturationSlider", "floorSaturationValueSpan", "floorBrightnessSlider", "floorBrightnessValueSpan", "modelYOffsetSlider", "modelYOffsetValueSpan", "objectRotationXSlider", "objectRotationXValueSpan", "objectRotationYSlider", "objectRotationYValueSpan", "objectRotationZSlider", "objectRotationZValueSpan", "objectScaleSlider", "objectScaleValueSpan", "modelColorHueSlider", "modelColorHueValueSpan", "objectBrightnessSlider", "objectBrightnessValueSpan", "objectRoughnessSlider", "objectRoughnessValueSpan", "objectMetalnessSlider", "objectMetalnessValueSpan", "lightIntensitySlider", "lightIntensityValueSpan", "lightAngleSlider", "lightAngleValueSpan", "lightPenumbraSlider", "lightPenumbraValueSpan", "lightXSlider", "lightYSlider", "lightZSlider", "lightXValueSpan", "lightYValueSpan", "lightZValueSpan", "openPoserBtn", "poseSelect"];
         const missingNames = requiredElements.map((el, i) => el ? null : elementNames[i]).filter(name => name !== null);
         logToPage(`CRITICAL ERROR: Missing DOM elements: ${missingNames.join(', ')}. Check HTML IDs.`, 'error');
         throw new Error("Essential control elements missing!");
     }
}

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

// --- ADD applyPoseData Function ---
function applyPoseData(modelGroup, poseData) {
    if (!modelGroup || !poseData || !Array.isArray(poseData)) {
        logToPage("Cannot apply pose data: Invalid model or data.", 'error');
        return;
    }
    logToPage(`Applying saved pose data to ${modelGroup.name || 'model'}...`);
    let bonesApplied = 0;
    let bonesNotFound = 0;

    // Create a map of bones in the target model for efficient lookup
    const boneMap = new Map();
    modelGroup.traverse(child => {
        if (child.isBone) {
            boneMap.set(child.name, child);
        }
    });

    // Iterate through the saved pose data
    poseData.forEach(bonePose => {
        const targetBone = boneMap.get(bonePose.name);
        if (targetBone) {
            try {
                // Apply position, quaternion, and scale from the saved arrays
                if (bonePose.position) targetBone.position.fromArray(bonePose.position);
                if (bonePose.quaternion) targetBone.quaternion.fromArray(bonePose.quaternion);
                if (bonePose.scale) targetBone.scale.fromArray(bonePose.scale);
                // targetBone.updateMatrixWorld(true); // Update matrix immediately (might be slow)
                bonesApplied++;
            } catch (applyError) {
                logToPage(`Error applying transform to bone ${bonePose.name}: ${applyError.message}`, 'error');
            }
        } else {
            // logToPage(`Warning: Bone named "${bonePose.name}" from saved pose not found in the current model.`, 'warn');
            bonesNotFound++;
        }
    });

    // Update the skeleton helper or matrix world once after all bones are set
    modelGroup.updateMatrixWorld(true); // Force update world matrices
    modelGroup.traverse(obj => {
        if (obj.isSkinnedMesh) {
            obj.skeleton.update(); // Update skeleton if applicable
        }
    });


    logToPage(`Pose data application complete. Applied: ${bonesApplied}, Not Found: ${bonesNotFound}.`);
}
// --- END ADD ---

// --- ADD Base64 Helper ---
function base64ToArrayBuffer(base64) {
    try {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (e) {
        logToPage(`Base64 decode error: ${e.message}`, 'error');
        throw e; // Re-throw error after logging
    }
}
// --- END ADD ---

// --- MODIFY loadGLBModel ---
// Function to load a GLB model from a path OR parse from ArrayBuffer
async function loadGLBModel(source, targetHeight = 3.0) { // source can be path (string) or ArrayBuffer
    const loader = new GLTFLoader();
    let isPosedData = source instanceof ArrayBuffer; // Check if source is data

    logToPage(`Loading GLB model ${isPosedData ? 'from saved pose data' : 'from path: ' + source}`);

    return new Promise(async (resolve, reject) => { // Wrap in promise for parse
        try {
            let gltf;
            if (isPosedData) {
                // Parse the ArrayBuffer
                loader.parse(source, '', (loadedGltf) => {
                    gltf = loadedGltf; // Assign loaded data
                    processLoadedGltf(gltf, targetHeight, resolve, reject, isPosedData); // Call shared processing logic
                }, (error) => { // <-- Ensure this error callback is correctly placed
                    reject(new Error(`Failed to parse GLB data: ${error.message || error}`));
                }); // <-- Ensure the parse call is properly closed
            } else {
                // Load from path (string)
                loader.load(source,
                    (loadedGltf) => { // Success callback
                        gltf = loadedGltf; // Assign loaded data

                        // --- Store initial bone transforms if poseable ---
                        initialBoneTransforms = []; // Clear previous initial state
                        currentModelPath = source; // Store the path of the currently loaded model
                        loadedModelGroup = gltf.scene; // Store the loaded group

                        if (isPoseableModel(currentModelPath)) {
                            logToPage(`Poseable model detected (${currentModelPath}). Storing initial bone transforms...`);
                            loadedModelGroup.traverse(child => {
                                if (child.isBone) {
                                    initialBoneTransforms.push({
                                        name: child.name,
                                        position: child.position.clone(),
                                        quaternion: child.quaternion.clone(),
                                        scale: child.scale.clone()
                                    });
                                }
                            });
                            logToPage(`Stored initial state for ${initialBoneTransforms.length} bones.`);
                        } else {
                            logToPage(`Model (${currentModelPath}) is not marked as poseable. Initial state not stored.`);
                        }
                        // --- End Initial Bone State Storage ---

                        // Enable poser button and pose controls if poseable
                        const poseable = isPoseableModel(currentModelPath);
                        openPoserBtn.disabled = !poseable;
                        poseSelect.disabled = !poseable; // Disable if not poseable
                        const refreshPosesBtn = document.getElementById('refreshPosesBtn');
                        if (refreshPosesBtn) refreshPosesBtn.disabled = !poseable;

                        logToPage(`Successfully loaded GLB: ${source}`, 'success');
                        updateObjectControlsState(true); // Enable relevant sliders

                        // Load poses for the newly loaded model if it's poseable
                        if (poseable) {
                            loadPosesForModel(currentModelPath);
                        } else {
                            poseSelect.innerHTML = '<option value="">Default Pose</option>'; // Reset dropdown if not poseable
                        }

                        // Reset transforms for the new model
                        resetObjectTransforms();
                        updateSliderValuesFromObject(); // Update sliders to reflect the new object's state

                        // Call shared processing logic AFTER storing initial state and path
                        processLoadedGltf(gltf, targetHeight, resolve, reject, isPosedData);

                    },
                    undefined, // Progress callback (optional)
                    (error) => { // Error callback
                        logToPage(`Failed to load GLB from path ${source}: ${error.message}`, 'error');
                        console.error(error);
                        openPoserBtn.disabled = true;
                        poseSelect.disabled = true;
                        const refreshPosesBtn = document.getElementById('refreshPosesBtn');
                        if (refreshPosesBtn) refreshPosesBtn.disabled = true;
                        reject(error); // Reject the promise on load error
                    }
                );
            }
        } catch (error) {
            logToPage(`Failed to load/parse GLB ${isPosedData ? 'data' : 'from ' + source}: ${error.message}`, 'error');
            console.error(error);
            reject(error); // Reject the promise
        }
    }).catch(error => {
         // --- Fallback Logic (moved inside catch) ---
         logToPage(`GLB loading failed, creating fallback box. Error: ${error.message}`, 'error');
         const fallbackGeo = Primitives.createCubeGeometry(1.0);
         const fallbackMesh = new THREE.Mesh(fallbackGeo, objectMaterial.clone());
         fallbackMesh.castShadow = true;
         const fallbackGroup = new THREE.Group();
         fallbackGroup.add(fallbackMesh);
         return fallbackGroup; // Return fallback group on error
    });
}

// Helper function to process GLTF after loading/parsing
function processLoadedGltf(gltf, targetHeight, resolve, reject, isPosedData) {
    try {
        logToPage(`Model ${isPosedData ? 'parsed' : 'loaded'} successfully.`);

        const modelGroup = gltf.scene || gltf.scenes[0];
        if (!modelGroup) {
            throw new Error("Loaded GLTF has no scene data.");
        }

        // --- Calculate Scaling ---
        const box = new THREE.Box3().setFromObject(modelGroup);
        const size = new THREE.Vector3();
        box.getSize(size);

        let scaleFactor = 1.0;
        if (size.y > 0.001) { // Avoid division by zero
            scaleFactor = targetHeight / size.y;
            logToPage(`Original height: ${size.y.toFixed(2)}, Target height: ${targetHeight.toFixed(2)}, Scale factor: ${scaleFactor.toFixed(3)}`);
        } else {
            logToPage("Model has zero/small height, using default scale 1.0.", 'warn'); // Changed to warn
        }

        modelGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
        modelGroup.updateMatrixWorld(true); // Update world matrix after scaling

        // --- Apply Shadows & Material ---
        modelGroup.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                if (child.material) {
                    child.material.side = THREE.DoubleSide;
                    // Don't force shared material on loaded models, respect original
                }
            }
        });

        logToPage("Applied scale and shadow settings to the loaded GLB model.");
        resolve(modelGroup); // Resolve the promise with the processed group

    } catch (processingError) {
        logToPage(`Error processing GLTF data: ${processingError.message}`, 'error');
        console.error(processingError);
        reject(processingError); // Reject the promise on processing error
    }
}

// --- Shape Selection Handler ---
async function handleShapeSelectionChange() { // Make async
    const selectedValue = shapeSelect.value;
    const isPoseable = isPoseableModel(selectedValue); // Check if the NEW selection is poseable

    // Disable pose controls immediately before loading starts
    openPoserBtn.disabled = true;
    poseSelect.disabled = true;
    const refreshPosesBtn = document.getElementById('refreshPosesBtn');
    if (refreshPosesBtn) refreshPosesBtn.disabled = true;

    // Trigger the object update (which handles loading, initial state saving, etc.)
    await updateObject(selectedValue); // Await the update process

    // AFTER the object is loaded and currentModelPath is set by updateObject/loadGLBModel:
    // Re-enable pose controls ONLY if the loaded model is actually poseable
    const loadedIsPoseable = isPoseableModel(currentModelPath); // Check the path of the *actually* loaded model
    openPoserBtn.disabled = !loadedIsPoseable;
    poseSelect.disabled = !loadedIsPoseable;
    if (refreshPosesBtn) refreshPosesBtn.disabled = !loadedIsPoseable;

    // Load poses only if the loaded model is poseable
    if (loadedIsPoseable) {
        loadPosesForModel(currentModelPath);
    } else {
        poseSelect.innerHTML = '<option value="">Default Pose</option>'; // Reset dropdown if not poseable
    }
}

// --- ADD THIS FUNCTION DEFINITION ---
function onWindowResize() {
    if (!sceneContainer || !camera || !renderer) {
        // Don't try to resize if core components aren't ready
        logToPage("onWindowResize: Core components not ready, skipping resize.", "warn");
        return;
    }

    try {
        const width = sceneContainer.clientWidth;
        const height = sceneContainer.clientHeight;

        // Prevent errors if container somehow has 0 size temporarily
        if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            logToPage(`Resized renderer to ${width}x${height}`);
        } else {
             logToPage(`onWindowResize: Invalid dimensions (${width}x${height}), skipping resize update.`, "warn");
        }
    } catch (error) {
         logToPage(`Error during onWindowResize: ${error.message}`, 'error');
    }
}
// --- END OF FUNCTION DEFINITION ---

// --- Run ---
// Define a separate async function to call init
async function runInitialization() {
    logToPage("Running initialization...");
    try {
        await init(); // Call the main init function
    } catch (error) {
        logToPage(`Error during runInitialization: ${error.message}`, 'error');
        console.error("Initialization Run Error:", error);
        // Optionally display an error message to the user in the UI
        if(sceneContainer){
             sceneContainer.innerHTML = `<p style='color: #ff8080; padding: 20px;'>Initialization Error: ${error.message}<br>Check Debug Log Below.</p>`;
        }
    }
}

// Check DOM state and call the initialization runner
logToPage("Checking DOM state for initialization...");
if (document.readyState === 'loading') {
    // Wait for the DOM to load before running initialization
    logToPage("DOM not ready, adding DOMContentLoaded listener.");
    document.addEventListener('DOMContentLoaded', runInitialization);
} else {
    // DOM is already loaded, run initialization directly
    logToPage("DOM already loaded, running initialization directly.");
    runInitialization();
}

// --- Initialization ---
async function init() {
    try {
        logToPage("Init started...");
        getDOMElements(); // Includes save/load buttons now
         logToPage("DOM elements retrieved successfully.");

        storeOriginalOptions(); // <-- This call should now work

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

        // --- Floor --- RE-ADD Plane Floor
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

        // --- Helpers --- Keep separate GridHelper
        gridHelper = new THREE.GridHelper(40, 40, 0x888888, 0x444444); // Keep original colors
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
        refreshShapeListBtn.addEventListener('click', handleRefreshButtonClick); // <-- Update listener to call renamed function
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
        shapeSelect.addEventListener('change', handleShapeSelectionChange);
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
        loadStateBtn?.addEventListener('click', async () => { // Make manual load async
            logToPage("Manual load button clicked.");
            await loadSceneState();
        });
        resetSceneBtn?.addEventListener('click', async () => { // Make manual reset async
             logToPage("Manual reset button clicked.");
             await resetSceneToDefaults();
             saveSceneState(); // Also save after manual reset
        });
        openPoserBtn.addEventListener('click', handleOpenPoser);
        // --- ADD Refresh Poses Listener ---
        const refreshPosesBtn = document.getElementById('refreshPosesBtn'); // Get the button
        if (refreshPosesBtn) {
            refreshPosesBtn.addEventListener('click', () => {
                if (currentModelPath && isPoseableModel(currentModelPath)) { // Check if a poseable model is loaded
                    logToPage('Refreshing poses from local storage...');
                    loadPosesForModel(currentModelPath); // Reload poses for the current model
                } else {
                    logToPage('No poseable model loaded to refresh poses for.', 'info');
                }
            });
            // Initially disable if no model is loaded (or handled in getDOMElements/init)
            refreshPosesBtn.disabled = !isPoseableModel(currentModelPath);
        } else {
            console.error("Refresh Poses button not found!");
        }
        // --- END ADD ---

        // --- ADD Pose Select Listener ---
        poseSelect.addEventListener('change', (event) => {
            applyPose(event.target.value); // Pass the selected pose name (value)
        });
        // --- END ADD ---

        logToPage("Event listeners added.");

        // --- Apply Initial Control Values OR Load State ---
        logToPage("Applying initial defaults...");
        await resetSceneToDefaults(); // Set the default state initially
        logToPage("Initial defaults applied.");

        // --- Attempt to Load Saved State (will override defaults if successful) ---
        let stateLoaded = false;
        try {
            logToPage("Attempting to load saved state over defaults...");
            // Make loadSceneState async and await it here
            stateLoaded = await loadSceneState(); // Attempt to load and apply saved state
            if (stateLoaded) {
                logToPage("Successfully loaded and applied saved state over defaults.", "success");
            } else {
                logToPage("No valid saved state found or error loading state. Defaults will be used.");
                // If load fails, ensure the default object created by resetSceneToDefaults is correctly targeted
                if (currentObject) {
                    const worldCenter = new THREE.Vector3();
                    const finalBounds = new THREE.Box3().setFromObject(currentObject, true);
                    if(!finalBounds.isEmpty()) finalBounds.getCenter(worldCenter);
                    else worldCenter.copy(currentObject.position).y += 1 * currentObject.scale.y;
                    lightTarget.position.copy(worldCenter);
                    controls.target.copy(worldCenter);
                    controls.update();
                    logToPage("Re-targeted light & controls to default object after failed load.");
                }
            }
        } catch (loadErr) {
            logToPage(`Error during initial state load attempt: ${loadErr.message}`, 'error');
            logToPage("Defaults will be used due to load error.");
             // Ensure targeting after load error as well
             if (currentObject) {
                 const worldCenter = new THREE.Vector3();
                 const finalBounds = new THREE.Box3().setFromObject(currentObject, true);
                 if(!finalBounds.isEmpty()) finalBounds.getCenter(worldCenter);
                 else worldCenter.copy(currentObject.position).y += 1 * currentObject.scale.y;
                 lightTarget.position.copy(worldCenter);
                 controls.target.copy(worldCenter);
                 controls.update();
                 logToPage("Re-targeted light & controls to default object after load exception.");
             }
        }

        // --- Final UI Updates ---
        updatePosedOptionsVisibility(); // Check posed options visibility

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

// --- ADD THIS FUNCTION DEFINITION ---
function storeOriginalOptions() {
    logToPage("Storing original shape select options...");
    if (!shapeSelect) {
        logToPage("storeOriginalOptions: shapeSelect element not found!", 'error');
        return;
    }
    originalShapeOptions = []; // Clear any previous options
    const options = shapeSelect.querySelectorAll('option'); // Get ALL options currently in the select
    options.forEach(option => {
        originalShapeOptions.push({
            value: option.value,
            text: option.textContent || option.innerText // Get the displayed text
        });
    });
    logToPage(`Stored ${originalShapeOptions.length} original options.`);
}
// --- END OF FUNCTION DEFINITION ---