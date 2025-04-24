// --- Imports ---
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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

// --- ADDED CONSTANT ---
const POSEABLE_MODELS = [
    'models/game_character_base.glb',
    'models/jumping_man.glb',
    'models/male_base0.glb',
    'models/male_base1.glb',
    'models/male_base2.glb'
    // Add more poseable model paths here if needed
];

// --- ADDED CONSTANT for Interaction Layer ---
const INTERACTION_LAYER = 1;


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
        } else if (type === 'warn') { // Added warn style
            p.classList.add('warn');
            console.warn(message);
        }
        else {
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
    return true; // Prevent default handling
};
window.onunhandledrejection = function (event) {
     const reason = event.reason || 'Unknown reason';
     let errorMsg = `UNHANDLED REJECTION: `;
     if (reason instanceof Error) {
         errorMsg += `${reason.message}\n${reason.stack}`;
     } else {
         errorMsg += String(reason);
     }
     logToPage(errorMsg, 'error');
};


logToPage("Script start");

// --- Constants ---
const LOCAL_STORAGE_KEY = 'dynamicPoseExplorerState_v1_2'; // Key for local storage (Ensure matches save/load)

// --- Global Variables ---
let scene, camera, renderer, controls;
let spotLight, lightTarget, lightVisualizer;
let floor, gridHelper, axesHelper; // axesHelper itself remains for visibility control
let sceneObjects = [];
let selectedObjectUUID = null;
let objectMaterial;
let floorBaseMaterial;
let originalShapeOptions = [];
let objectBaseY = 0;
let openPoserBtn;
let poseSelect;
let refreshPosesBtn;
let currentModelPath = null;
let loadedModelGroup = null;
let initialBoneTransforms = null;
let focusCameraBtn;
let decoupleCameraBtn;
let isCameraDecoupled = false;
let raycaster;

// --- DOM Elements ---
let sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn;
let cameraLockBtn, gridHelperToggle; // Removed axesHelperToggle
let resetObjectBtn;
let saveStateBtn, loadStateBtn, resetSceneBtn;
let objectListElement;
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
// Pose controls
let poserControlsDiv;
let boneHierarchyContainer;


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
    'person_abstract': StaticFigures.createPersonAbstractGroup, // Keep GLB loading logic separate
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
    'wireframe_cube_nested': Wireframes.createWireframeCubeNestedBase, // Base structure
    'wireframe_icosahedron_in_sphere': Wireframes.createIcosahedronInSphereBase // Base structure
};


// --- Shape Handling Functions ---
function createObject(shapeType, s, matClone) {
    const creationFunc = shapeFunctionMap[shapeType];

    if (creationFunc) {
        try {
            // Pass 's' (size) and matClone (material cloning function)
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

function getSelectedObject3D() {
    if (!selectedObjectUUID) return null; // No object selected
    const selectedData = sceneObjects.find(obj => obj.uuid === selectedObjectUUID);
    return selectedData ? selectedData.object3D : null;
}

function isPoseableModel(modelPath) {
    if (!modelPath || typeof modelPath !== 'string') return false;
    // Check against the known list and also ensure it's a .glb file
    return POSEABLE_MODELS.includes(modelPath) && modelPath.toLowerCase().endsWith('.glb');
}

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

function applyPoseData(modelGroup, poseData) {
    if (!modelGroup || !poseData || !Array.isArray(poseData)) {
        logToPage("Cannot apply pose data: Invalid model or data.", 'error');
        return false; // Indicate failure
    }
    // logToPage(`Applying saved pose data to ${modelGroup.name || 'model'}...`); // Too noisy
    let bonesApplied = 0;
    let bonesNotFound = 0;
    let success = true;

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
                bonesApplied++;
            } catch (applyError) {
                logToPage(`Error applying transform to bone ${bonePose.name}: ${applyError.message}`, 'error');
                success = false; // Mark as failed if any bone fails
            }
        } else {
            // Only log missing bones if needed for debugging, can be noisy
            // logToPage(`Warning: Bone named "${bonePose.name}" from saved pose not found in the current model.`, 'warn');
            bonesNotFound++;
        }
    });

    // Update the skeleton helper or matrix world once after all bones are set
    modelGroup.updateMatrixWorld(true); // Force update world matrices
    modelGroup.traverse(obj => {
        if (obj.isSkinnedMesh) {
             if (obj.skeleton) { // Check if skeleton exists
                obj.skeleton.update(); // Update skeleton if applicable
            } else {
                // logToPage(`Warning: SkinnedMesh found but no skeleton property for ${obj.name || 'Unnamed Mesh'}`, 'warn'); // Too noisy
            }
        }
    });

    if(bonesNotFound > 0) logToPage(`Pose data application complete. Applied: ${bonesApplied}, Not Found: ${bonesNotFound}.`, success ? 'success' : 'warn');
    else if(bonesApplied > 0) logToPage(`Pose data application complete. Applied: ${bonesApplied}.`, 'success');
    // else logToPage(`Pose data: No bones found or applied.`, 'info'); // Too noisy

    return success; // Return true if all applications were successful
}

function processLoadedGltf(gltf, targetHeight, modelPath) {
    // This function takes the loaded GLTF data and processes it (scaling, shadows)
    // It's called by loadGLBModel after successful loading/parsing.
    try {
        logToPage(`Processing GLTF data for ${modelPath}...`);

        const modelGroup = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!modelGroup) {
            throw new Error("Loaded GLTF has no scene data.");
        }

        // --- Store initial bone transforms if poseable ---
        // Note: This stores the *last loaded* poseable model's initial state globally.
        // A per-instance initial state is more complex.
        initialBoneTransforms = null; // Clear previous initial state
        loadedModelGroup = modelGroup; // Store reference to the loaded group

        if (isPoseableModel(modelPath)) {
            logToPage(`Poseable model detected (${modelPath}). Storing initial bone transforms...`);
            initialBoneTransforms = []; // Initialize array
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
            logToPage(`Stored initial state for ${initialBoneTransforms ? initialBoneTransforms.length : 0} bones.`);
        } else {
            logToPage(`Model (${modelPath}) is not marked as poseable. Initial state not stored.`);
        }
         // Assign model path *after* processing potentially poseable model
         // This global variable is still used by "Open Poser"
         currentModelPath = modelPath;
        // --- End Initial Bone State Storage ---

        // --- Calculate Scaling ---
        const box = new THREE.Box3().setFromObject(modelGroup);
        const size = new THREE.Vector3();
        box.getSize(size);

        let scaleFactor = 1.0;
        if (size.y > 0.001) { // Avoid division by zero
            scaleFactor = targetHeight / size.y;
            logToPage(`Original height: ${size.y.toFixed(2)}, Target height: ${targetHeight.toFixed(2)}, Scale factor: ${scaleFactor.toFixed(3)}`);
        } else {
            logToPage("Model has zero/small height, using default scale 1.0.", 'warn');
        }

        modelGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
        modelGroup.updateMatrixWorld(true); // Update world matrix after scaling

        // --- Apply Shadows & Material Settings ---
        modelGroup.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                 child.receiveShadow = true; // << ADD receiveShadow for models too
                // Don't force DoubleSide on loaded models unless necessary
                // if (child.material) {
                //     child.material.side = THREE.DoubleSide;
                // }
                // Don't force shared material, allow original materials
            }
        });

        logToPage(`Finished processing GLTF for ${modelPath}.`, 'success');
        return modelGroup; // Return the processed group

    } catch (processingError) {
        logToPage(`Error processing GLTF data for ${modelPath}: ${processingError.message}`, 'error');
        console.error(processingError);
        throw processingError; // Re-throw the error to be caught by the caller
    }
}

async function loadGLBModel(source, targetHeight = 3.0) {
    // source can be path (string) or ArrayBuffer containing glb data
    const loader = new GLTFLoader();
    const isData = source instanceof ArrayBuffer; // Check if source is data or path
    const sourceDesc = isData ? 'pose data buffer' : source;

    logToPage(`Loading GLB model from ${sourceDesc}...`);

    return new Promise((resolve, reject) => {
        const onLoad = (gltf) => {
            try {
                 // Determine the model path - crucial for pose loading later
                 // If loading from data, we assume currentModelPath holds the relevant base model path
                 const modelPathForProcessing = isData ? currentModelPath : source;
                if (!modelPathForProcessing) {
                     throw new Error("Cannot process GLTF: Model path is unknown when loading from data buffer.");
                }
                const modelGroup = processLoadedGltf(gltf, targetHeight, modelPathForProcessing);
                resolve(modelGroup); // Resolve with the processed group
            } catch (processingError) {
                reject(processingError); // Reject if processing fails
            }
        };

        const onError = (error) => {
            const errorMsg = error.message || JSON.stringify(error);
            logToPage(`Failed to load/parse GLB from ${sourceDesc}: ${errorMsg}`, 'error');
            console.error(error);
            reject(new Error(`GLB Load/Parse Error: ${errorMsg}`)); // Reject with a clear error
        };

        if (isData) {
            // Parse the ArrayBuffer
            loader.parse(source, '', onLoad, onError);
        } else {
            // Load from path (string)
            loader.load(source, onLoad, undefined /* onProgress */, onError);
        }
    }).catch(error => {
        logToPage(`GLB loading/processing failed for ${sourceDesc}. Creating fallback box. Error: ${error.message}`, 'error');
        // --- Fallback Logic ---
        const fallbackGeo = Primitives.createCubeGeometry(1.0);
        // Ensure objectMaterial is defined before creating fallback
        const mat = objectMaterial || new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const fallbackMesh = new THREE.Mesh(fallbackGeo, mat.clone()); // Clone material
        fallbackMesh.castShadow = true;
        fallbackMesh.receiveShadow = true; // << ADD receiveShadow
        fallbackMesh.name = "Fallback Cube";
        const fallbackGroup = new THREE.Group();
        fallbackGroup.add(fallbackMesh);
        return fallbackGroup; // Return fallback group on error
    });
}

function loadPosesForModel(modelPath) {
    if (!poseSelect || !modelPath) return;
    logToPage(`Loading poses for model: ${modelPath}`);

    poseSelect.innerHTML = ''; // Clear existing options
    // Add the default pose option first
    const defaultOption = document.createElement('option');
    defaultOption.value = ''; // Empty value signifies default pose
    defaultOption.textContent = 'Default Pose';
    poseSelect.appendChild(defaultOption);

    const storageKey = `poses_${modelPath}`;
    let savedPoses = {};
    try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            savedPoses = JSON.parse(storedData);
            // Basic validation
            if (typeof savedPoses !== 'object' || savedPoses === null) {
                savedPoses = {};
                logToPage(`Invalid pose data found for ${modelPath}. Resetting.`, 'warn');
            }
        }
    } catch (e) {
        logToPage(`Error parsing poses for ${modelPath}: ${e.message}`, 'error');
        savedPoses = {};
    }

    const poseNames = Object.keys(savedPoses).sort(); // Get sorted names
    logToPage(`Found ${poseNames.length} saved poses for ${modelPath}.`);

    poseNames.forEach(poseName => {
        const option = document.createElement('option');
        option.value = poseName; // Value is the pose name
        option.textContent = poseName;
        poseSelect.appendChild(option);
    });

    poseSelect.value = ''; // Select "Default Pose" initially
}

function applyPose(poseName) {
    const selectedObjData = sceneObjects.find(obj => obj.uuid === selectedObjectUUID);
    const modelGroup = selectedObjData?.object3D; // Get the 3D object of the *selected* item
    const modelPath = selectedObjData?.originalType; // Get the path of the *selected* item

    if (!modelGroup || !modelPath || !selectedObjData.isPoseable) {
        logToPage("Cannot apply pose: No poseable object selected.", 'error');
        return;
    }

    logToPage(`Applying pose "${poseName || 'Default'}" to selected object ${selectedObjectUUID} (${modelPath})`);

    if (!poseName || poseName === '') { // Empty value means reset to default
        logToPage("Applying default pose (attempting reload)...");
        // For default pose, the most reliable way might be to reload the model segment
        // or apply *initial* bone transforms if we stored them RELIABLY for *this instance*
        // Storing initial state *reliably* per instance is complex.
        // Let's try applying the global initialBoneTransforms IF the selected model path matches
        if (initialBoneTransforms && currentModelPath === modelPath) {
             const success = applyPoseData(modelGroup, initialBoneTransforms);
             logToPage(`Applied stored initial bone state: ${success ? 'Success' : 'Failed'}`);
        } else {
            logToPage("Cannot apply default pose: Initial transforms not available for this specific instance or model path mismatch.", 'warn');
             // As a fallback, maybe just deselect the pose in the dropdown?
             if (poseSelect) poseSelect.value = '';
        }
        return;
    }

    // Load the specific named pose for the *selected model's path*
    const storageKey = `poses_${modelPath}`; // Use selected object's path
    let poseData = null;
    try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            const allPoses = JSON.parse(storedData);
            if (allPoses && typeof allPoses === 'object' && allPoses[poseName]) {
                poseData = allPoses[poseName];
            }
        }
    } catch (e) {
        logToPage(`Error loading pose "${poseName}" for ${modelPath}: ${e.message}`, 'error');
    }

    if (poseData) {
         const success = applyPoseData(modelGroup, poseData);
         if (!success) {
             logToPage(`There were errors applying pose "${poseName}".`, 'error');
             // Optionally, reset dropdown to default if apply fails?
             // poseSelect.value = '';
         } else {
             logToPage(`Pose "${poseName}" applied successfully.`, 'success');
         }
    } else {
        logToPage(`Pose data for "${poseName}" not found or invalid for ${modelPath}.`, 'error');
        // Reset dropdown to default if pose not found
        if (poseSelect) poseSelect.value = '';
    }
}

function resetObjectTransforms() {
    if (objectRotationXSlider) objectRotationXSlider.value = 0;
    if (objectRotationYSlider) objectRotationYSlider.value = 0;
    if (objectRotationZSlider) objectRotationZSlider.value = 0;
    if (objectScaleSlider) objectScaleSlider.value = 1.0;
    // Don't reset Y offset here, it's handled by onModelYOffsetChange using objectBaseY
    logToPage("Object transform sliders reset to defaults (Rot 0, Scale 1).");
    updateObjectRotationDisplay();
    if (objectScaleValueSpan) objectScaleValueSpan.textContent = '1.00x';

     // Also apply these resets to the selected object if one exists
     const selectedObj3D = getSelectedObject3D();
     if (selectedObj3D) {
         selectedObj3D.rotation.set(0, 0, 0); // Reset rotation directly
         selectedObj3D.quaternion.setFromEuler(selectedObj3D.rotation); // Update quaternion
         selectedObj3D.scale.set(1, 1, 1);
         // Re-apply Y offset after scale reset
         onModelYOffsetChange(); // This calculates base Y and applies offset
         updateTargets();
     }
}

function updateTargets() {
    const selectedObj3D = getSelectedObject3D();
    // If nothing is selected, target the origin
    const targetObject = selectedObj3D || new THREE.Object3D(); // Use dummy object if nothing selected

    if (!lightTarget || !controls || !spotLight) return; // Check core components

    // Update logging slightly
    // if(selectedObj3D) logToPage("Updating light and camera targets..."); // Too noisy
    // else logToPage("No object selected, resetting targets to default."); // Too noisy


    const worldCenter = new THREE.Vector3();
    try {
        targetObject.updateMatrixWorld(true); // Ensure world matrix is up-to-date
        const finalBounds = new THREE.Box3().setFromObject(targetObject, true); // Use precise bounds

        if (!finalBounds.isEmpty() && !finalBounds.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0,0,0))) { // << Check for zero size
            finalBounds.getCenter(worldCenter);
             // if(selectedObj3D) logToPage(`Targeting center: ${worldCenter.x.toFixed(2)}, ${worldCenter.y.toFixed(2)}, ${worldCenter.z.toFixed(2)}`); // Too noisy
        } else {
            // Fallback if bounds are empty or zero size
            worldCenter.copy(targetObject.position); // Use object's origin
            const scaleY = targetObject.scale ? targetObject.scale.y : 1.0;
            // Add a small offset based on scale if bounds are bad
            worldCenter.y += Math.min(0.5 * scaleY, 1.0); // Add less offset
             if(selectedObj3D) logToPage("Warning: BoundingBox empty/zero size. Targeting estimated center.", 'warn');
             else worldCenter.set(0,1,0); // Default target if no object selected and dummy failed
        }
    } catch (e) {
         if(selectedObj3D) logToPage(`Target calculation error: ${e.message}. Using object position as fallback.`, 'error');
        worldCenter.copy(targetObject.position);
        if (!selectedObj3D) worldCenter.set(0,1,0); // Default target
    }

    // ALWAYS update light target
    lightTarget.position.copy(worldCenter);
    spotLight.target.updateMatrixWorld(); // << NEED TO UPDATE TARGET'S MATRIX

    // Update light position based on sliders (already done in onLightPositionChange)
    // Ensure light visualizer is correct
     if (lightVisualizer && spotLight) lightVisualizer.position.copy(spotLight.position);


     // *** ONLY update OrbitControls target if NOT decoupled ***
     if (!isCameraDecoupled) {
         controls.target.copy(worldCenter);
         // if(selectedObj3D) logToPage("OrbitControls target updated."); // Too noisy
     } else {
          // if(selectedObj3D) logToPage("OrbitControls target update skipped (camera decoupled)."); // Too noisy
     }

     // if(selectedObj3D) logToPage("Light target updated."); // Too noisy
     // No immediate controls.update() needed here, handled by animation loop or specific actions.
}

function updateSliderValuesFromObject() {
    // No Log here, gets called too often during gizmo drag

    const selectedObj3D = getSelectedObject3D(); // Get selected object

    // --- Update Material Sliders ---
    if (modelColorHueSlider && objectBrightnessSlider && objectRoughnessSlider && objectMetalnessSlider) {
        let representativeMaterial = null;
        if (selectedObj3D) {
             if (selectedObj3D.isMesh && selectedObj3D.material && selectedObj3D.material.isMeshStandardMaterial) {
                  representativeMaterial = selectedObj3D.material;
             } else if (selectedObj3D.isGroup) {
                  selectedObj3D.traverse((child) => {
                      // Find the *first* suitable material
                      if (!representativeMaterial && child.isMesh && child.material && child.material.isMeshStandardMaterial) {
                          representativeMaterial = child.material;
                      }
                  });
             }
        }
        // Fallback to the shared base material if no object selected or no material found
        if (!representativeMaterial) {
             representativeMaterial = objectMaterial; // The global one used for new primitives
        }

        if (representativeMaterial && representativeMaterial.isMeshStandardMaterial) {
            const currentHSL = { h: 0, s: 0, l: 0 };
            // Use a default saturation if the color is grayscale (s=0)
            representativeMaterial.color.getHSL(currentHSL);
            const displayHue = currentHSL.s === 0 ? parseFloat(modelColorHueSlider.value) : currentHSL.h; // Use slider value if grayscale

            // Check if the material has a texture map - disable Hue/Brightness if so?
            const hasTextureMap = representativeMaterial.map !== null;
            modelColorHueSlider.disabled = hasTextureMap;
            objectBrightnessSlider.disabled = hasTextureMap;
            if (hasTextureMap) {
                // Optionally gray out or visually indicate disabled state
                modelColorHueSlider.style.opacity = 0.5;
                objectBrightnessSlider.style.opacity = 0.5;
                modelColorHueValueSpan.textContent = 'N/A';
                objectBrightnessValueSpan.textContent = 'N/A';
            } else {
                 modelColorHueSlider.style.opacity = 1;
                 objectBrightnessSlider.style.opacity = 1;
                 modelColorHueSlider.value = displayHue;
                 objectBrightnessSlider.value = currentHSL.l;
                 modelColorHueValueSpan.textContent = `${Math.round(displayHue * 360)}°`;
                 objectBrightnessValueSpan.textContent = currentHSL.l.toFixed(2);
            }


            objectRoughnessSlider.value = representativeMaterial.roughness;
            objectMetalnessSlider.value = representativeMaterial.metalness;

            // Update spans regardless of dragging (simpler logic)
            objectRoughnessValueSpan.textContent = representativeMaterial.roughness.toFixed(2);
            objectMetalnessValueSpan.textContent = representativeMaterial.metalness.toFixed(2);

            if(!modelColorHueSlider.disabled) modelColorHueSlider.dispatchEvent(new Event('input'));
            if(!objectBrightnessSlider.disabled) objectBrightnessSlider.dispatchEvent(new Event('input'));
            objectRoughnessSlider.dispatchEvent(new Event('input'));
            objectMetalnessSlider.dispatchEvent(new Event('input'));
        }
    }

    // --- Update Transform Sliders ---
    if (selectedObj3D) {
        // Position / Y Offset
         if (modelYOffsetSlider) {
             // Calculate offset relative to the object's *own* base Y
            const bounds = new THREE.Box3().setFromObject(selectedObj3D, true); // Precise bounds
            let selectedBaseY = 0;
            // Use origin Y if bounds are bad
            if (!bounds.isEmpty() && !bounds.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0,0,0))) {
                 selectedBaseY = -bounds.min.y;
            } else {
                 selectedBaseY = selectedObj3D.position.y - parseFloat(modelYOffsetSlider.value); // Estimate base Y from current pos and slider
                 // logToPage("Using estimated base Y for Y-offset calc due to bad bounds", "warn"); // Too noisy
            }

            // Calculate offset based on current position and calculated base
            const currentOffset = selectedObj3D.position.y - selectedBaseY;
            modelYOffsetSlider.value = currentOffset; // Update slider value
            // Update span directly
             if(modelYOffsetValueSpan) modelYOffsetValueSpan.textContent = currentOffset.toFixed(1);
        }
        // Rotation
        if (objectRotationXSlider) {
            const euler = new THREE.Euler().setFromQuaternion(selectedObj3D.quaternion, 'XYZ'); // Read from Quaternion
            objectRotationXSlider.value = THREE.MathUtils.radToDeg(euler.x);
            objectRotationYSlider.value = THREE.MathUtils.radToDeg(euler.y);
            objectRotationZSlider.value = THREE.MathUtils.radToDeg(euler.z);
            // Update spans directly
            updateObjectRotationDisplay();
        }
        // Scale
        if (objectScaleSlider) {
            // Assume uniform scaling for the slider control
            const scaleValue = selectedObj3D.scale.x; // Read X scale
            objectScaleSlider.value = scaleValue;
            // Update span directly
            if(objectScaleValueSpan) objectScaleValueSpan.textContent = scaleValue.toFixed(2) + 'x';
        }
    } else {
        // No object selected - Reset sliders to default visual state?
        // Resetting values might be confusing, just ensure they reflect the base material
        if (objectMaterial) { // Only if not dragging
             const hsl = {h:0, s:0, l:0};
             objectMaterial.color.getHSL(hsl);
             if (modelColorHueSlider) modelColorHueSlider.value = hsl.h;
             if (objectBrightnessSlider) objectBrightnessSlider.value = hsl.l;
             if (objectRoughnessSlider) objectRoughnessSlider.value = objectMaterial.roughness;
             if (objectMetalnessSlider) objectMetalnessSlider.value = objectMaterial.metalness;
             if (modelColorHueSlider) modelColorHueSlider.dispatchEvent(new Event('input'));
             if (objectBrightnessSlider) objectBrightnessSlider.dispatchEvent(new Event('input'));
             if (objectRoughnessSlider) objectRoughnessSlider.dispatchEvent(new Event('input'));
             if (objectMetalnessSlider) objectMetalnessSlider.dispatchEvent(new Event('input'));
        }
        // Reset transform sliders visuals
        if (modelYOffsetSlider) { modelYOffsetSlider.value = 0; modelYOffsetSlider.dispatchEvent(new Event('input'));}
        if (objectRotationXSlider) { objectRotationXSlider.value = 0; objectRotationXSlider.dispatchEvent(new Event('input'));}
        if (objectRotationYSlider) { objectRotationYSlider.value = 0; objectRotationYSlider.dispatchEvent(new Event('input'));}
        if (objectRotationZSlider) { objectRotationZSlider.value = 0; objectRotationZSlider.dispatchEvent(new Event('input'));}
        if (objectScaleSlider) { objectScaleSlider.value = 1; objectScaleSlider.dispatchEvent(new Event('input'));}
    }
}

async function updateObject(requestedShapeType) { // Make async
    logToPage(`Creating/Loading object definition for: ${requestedShapeType}`);
    const s = 1.5; // Base size unit

    if (!objectMaterial) {
        logToPage("CRITICAL ERROR: objectMaterial not initialized in updateObject!", 'error');
        return null; // Return null on critical error
    }
    // Note: matClone is not needed here anymore, as materials are handled by calling functions or loader

    let newObject = null;
    const isGlb = typeof requestedShapeType === 'string' && requestedShapeType.toLowerCase().endsWith('.glb');
    const isApplyPose = typeof requestedShapeType === 'string' && requestedShapeType.startsWith('apply_pose:');
    let targetModelPath = requestedShapeType;
    let poseToApply = null;
    let createdObjectType = 'primitive'; // Track type for later metadata

    // --- Clear variables related to the *last* loaded poseable model ---
    // Note: `currentModelPath` is now less critical globally, used mainly by poser opener/initial state saver
    // loadedModelGroup is also less critical, used for initial state storage check maybe?
    // We need to manage poses PER selected object now.

    try {
        if (isApplyPose) {
            createdObjectType = 'posed_glb';
            const parts = requestedShapeType.substring('apply_pose:'.length).split('?pose=');
            targetModelPath = parts[0];
            poseToApply = parts.length > 1 ? decodeURIComponent(parts[1]) : null;
            logToPage(`Preparing to load model ${targetModelPath} and apply pose: ${poseToApply || 'Default'}`);
            // Load the GLB model
            newObject = await loadGLBModel(targetModelPath); // loadGLBModel handles currentModelPath etc.
            // Actual pose application will happen *after* it's added to the sceneObjects array

        } else if (isGlb) {
            createdObjectType = 'glb';
            logToPage(`Preparing to load GLB model: ${targetModelPath}`);
            newObject = await loadGLBModel(targetModelPath); // loadGLBModel handles currentModelPath etc.

        } else {
            // Handle standard geometric shapes from shapeFunctionMap
            createdObjectType = 'primitive'; // Or 'combination', 'figure' etc. based on mapping if needed later
            logToPage(`Creating geometric shape: ${targetModelPath}`);
            const isWireframe = targetModelPath.startsWith('wireframe_');
            const baseShapeType = isWireframe ? targetModelPath.substring('wireframe_'.length) : targetModelPath;

            // --- Create material instance for this specific primitive ---
            // Primitives will use a clone of the base objectMaterial
            const primitiveMaterial = objectMaterial.clone();
           // --- Randomize Color Hue for NON-GLB shapes ---
           const randomHue = Math.random();
           // Directly set the material color, don't touch the slider here
           primitiveMaterial.color.setHSL(randomHue, 0.8, parseFloat(objectBrightnessSlider?.value || 0.5)); // Use slider default if missing
           logToPage(`Randomized primitive hue: ${Math.round(randomHue * 360)}°`);
           // Note: onModelColorOrBrightnessChange() is NOT called here anymore
          // --- END Randomize ---

            let createdItem = createObject(baseShapeType, s, () => primitiveMaterial); // Pass factory for the specific material

            if (!createdItem) {
                throw new Error(`Shape creation function for ${baseShapeType} returned null/undefined!`);
            }

            if (createdItem instanceof THREE.BufferGeometry) {
                logToPage(`Created Geometry for ${baseShapeType}. Creating Mesh...`);
                if (isWireframe) {
                    primitiveMaterial.wireframe = true; // Modify the specific instance
                    logToPage(`Applied wireframe material.`);
                }
                newObject = new THREE.Mesh(createdItem, primitiveMaterial); // Use the specific material instance
                newObject.castShadow = true;
                newObject.receiveShadow = true; // << ADD receiveShadow


            } else if (createdItem instanceof THREE.Group) {
                logToPage(`Created Group directly for ${baseShapeType}.`);
                newObject = createdItem;
                 // Ensure all meshes within the group use the specific primitiveMaterial instance
                 // (Unless the creation function assigned something else intentionally)
                 newObject.traverse(child => {
                     if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true; // << ADD receiveShadow
                        // Only assign if material seems default/missing
                        if (!child.material || child.material === objectMaterial) {
                             child.material = primitiveMaterial;
                        } else if (Array.isArray(child.material)) {
                            // Handle multi-material case if needed
                            child.material = child.material.map(m => (!m || m === objectMaterial) ? primitiveMaterial : m);
                        }
                        // Apply wireframe if needed
                        if (isWireframe && child.material !== primitiveMaterial) { // Apply to others too
                            child.material.wireframe = true;
                        } else if (isWireframe && child.material === primitiveMaterial) {
                             primitiveMaterial.wireframe = true; // Ensure instance is wireframe
                        }
                     }
                 });
                 if (isWireframe) logToPage(`Applied wireframe material to group meshes.`);

            } else {
                throw new Error(`Shape function for ${baseShapeType} returned unexpected type: ${typeof createdItem}`);
            }
        }

        if (!newObject) {
             throw new Error("Object creation/loading failed.");
        }

        // We don't set name, position, rotation, scale, or add to scene here.
        // We return the raw Object3D and its type.
        logToPage(`updateObject successful for type: ${requestedShapeType}`);
        return { object3D: newObject, type: createdObjectType, originalType: requestedShapeType, poseToApply: poseToApply }; // Return object and type info

    } catch (creationError) {
        logToPage(`Failed inside updateObject for ${requestedShapeType}: ${creationError.message}`, 'error');
        console.error(creationError);
        // Return null to indicate failure to the caller
        return null;
    }
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
    // axesHelperToggle = document.getElementById('axesHelperToggle'); // <-- REMOVED
    resetObjectBtn = document.getElementById('resetObjectBtn');
    saveStateBtn = document.getElementById('saveStateBtn');
    loadStateBtn = document.getElementById('loadStateBtn');
    resetSceneBtn = document.getElementById('resetSceneBtn');
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
    // Posing
    openPoserBtn = document.getElementById('openPoserBtn');
    poseSelect = document.getElementById('poseSelect');
    refreshPosesBtn = document.getElementById('refreshPosesBtn');
    // Object List
    objectListElement = document.getElementById('objectList');
    // Camera Controls
    focusCameraBtn = document.getElementById('focusCameraBtn');
    decoupleCameraBtn = document.getElementById('decoupleCameraBtn');
    logToPage("DOM elements assigned.");

    // Check required elements (Removed axesHelperToggle from check)
     const requiredElements = [
        sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn, cameraLockBtn, gridHelperToggle, /*axesHelperToggle REMOVED*/, resetObjectBtn, saveStateBtn, loadStateBtn, resetSceneBtn,
        wallHueSlider, wallHueValueSpan, wallSaturationSlider, wallSaturationValueSpan, wallBrightnessSlider, wallBrightnessValueSpan, floorHueSlider, floorHueValueSpan, floorSaturationSlider, floorSaturationValueSpan, floorBrightnessSlider, floorBrightnessValueSpan,
        modelYOffsetSlider, modelYOffsetValueSpan, objectRotationXSlider, objectRotationXValueSpan, objectRotationYSlider, objectRotationYValueSpan, objectRotationZSlider, objectRotationZValueSpan, objectScaleSlider, objectScaleValueSpan,
        modelColorHueSlider, modelColorHueValueSpan, objectBrightnessSlider, objectBrightnessValueSpan, objectRoughnessSlider, objectRoughnessValueSpan, objectMetalnessSlider, objectMetalnessValueSpan,
        lightIntensitySlider, lightIntensityValueSpan, lightAngleSlider, lightAngleValueSpan, lightPenumbraSlider, lightPenumbraValueSpan, lightXSlider, lightYSlider, lightZSlider, lightXValueSpan, lightYValueSpan, lightZValueSpan,
        openPoserBtn, poseSelect, refreshPosesBtn, objectListElement, focusCameraBtn, decoupleCameraBtn
    ];
    if (requiredElements.some(el => !el)) {
        const elementNames = [
            "sceneContainer", "controlsContainer", "toggleControlsBtn", "shapeSelect", "shapeSearchInput", "refreshShapeListBtn", "copyLogBtn", "cameraLockBtn", "gridHelperToggle", /*axesHelperToggle REMOVED*/, "resetObjectBtn", "saveStateBtn", "loadStateBtn", "resetSceneBtn",
            "wallHueSlider", "wallHueValueSpan", "wallSaturationSlider", "wallSaturationValueSpan", "wallBrightnessSlider", "wallBrightnessValueSpan", "floorHueSlider", "floorHueValueSpan", "floorSaturationSlider", "floorSaturationValueSpan", "floorBrightnessSlider", "floorBrightnessValueSpan",
            "modelYOffsetSlider", "modelYOffsetValueSpan", "objectRotationXSlider", "objectRotationXValueSpan", "objectRotationYSlider", "objectRotationYValueSpan", "objectRotationZSlider", "objectRotationZValueSpan", "objectScaleSlider", "objectScaleValueSpan",
            "modelColorHueSlider", "modelColorHueValueSpan", "objectBrightnessSlider", "objectBrightnessValueSpan", "objectRoughnessSlider", "objectRoughnessValueSpan", "objectMetalnessSlider", "objectMetalnessValueSpan",
            "lightIntensitySlider", "lightIntensityValueSpan", "lightAngleSlider", "lightAngleValueSpan", "lightPenumbraSlider", "lightPenumbraValueSpan", "lightXSlider", "lightYSlider", "lightZSlider", "lightXValueSpan", "lightYValueSpan", "lightZValueSpan",
            "openPoserBtn", "poseSelect", "refreshPosesBtn", "objectListElement", "focusCameraBtn", "decoupleCameraBtn"
        ];
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
             text: opt.text,
             // Store display style to handle hidden pose options
             styleDisplay: opt.style.display || '' // Default to empty string
         }));
         logToPage(`Stored ${originalShapeOptions.length} options.`);
     } catch (e) {
         logToPage(`Error storing options: ${e.message}`, 'error');
     }
 }

function filterShapeDropdown() {
    if (!shapeSelect || !shapeSearchInput || !originalShapeOptions) return;
    // logToPage(`Filtering shapes for term: "${shapeSearchInput.value}"`); // Too noisy
    const searchTerm = shapeSearchInput.value.toLowerCase().trim().replace(/_/g, ' ');
    const currentSelectedValue = shapeSelect.value; // Store value *before* clearing
    let newSelectedIndex = -1;
    let firstValidIndex = -1;

    shapeSelect.innerHTML = ''; // Clear current options
    let foundCount = 0;

    originalShapeOptions.forEach((optData) => { // No index needed here
         // Skip hidden options (like "apply_pose:" ones)
         if (optData.styleDisplay === 'none') {
             return;
         }

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
    } else {
         // If somehow all options were filtered out, but wasn't empty before
         shapeSelect.selectedIndex = -1; // Ensure nothing is selected
    }
    // logToPage(`Filtering complete. Found ${foundCount} matches.`); // Too noisy
    // NOTE: DO NOT trigger handleShapeSelectionChange here.
    // Filtering should just update the list; user action selects.
}

function resetShapeDropdown() {
     if (!shapeSearchInput || !shapeSelect) return;
     logToPage("Resetting shape dropdown.");
     shapeSearchInput.value = '';
     const currentVal = shapeSelect.value; // Store current selection
     filterShapeDropdown(); // Repopulate
     // Try to restore previous selection
     shapeSelect.value = currentVal;
     // If previous selection was filtered out or invalid, the browser might select index 0 or keep it blank.
     // Let's ensure *something* valid is selected if possible.
     if (shapeSelect.selectedIndex === -1 && shapeSelect.options.length > 0 && !shapeSelect.options[0].disabled) {
          shapeSelect.selectedIndex = 0; // Explicitly select first valid option if restore failed
     }
 }

// --- ADD OBJECT MANAGEMENT FUNCTIONS ---

function populateObjectList() {
    if (!objectListElement) return;
    // logToPage("Populating object list UI..."); // Too noisy
    objectListElement.innerHTML = ''; // Clear previous list

    if (sceneObjects.length === 0) {
        const placeholder = document.createElement('li');
        placeholder.textContent = '(No objects in scene)';
        placeholder.classList.add('placeholder');
        objectListElement.appendChild(placeholder);
        return;
    }

    sceneObjects.forEach((objData, index) => {
        const li = document.createElement('li');
        li.dataset.uuid = objData.uuid; // Store UUID for identification

        // Create span for the name
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('object-name');
        // Try to create a user-friendly name
        let displayName = objData.originalType.split('/').pop().replace('.glb', '').replace(/_/g, ' ');
         // Handle 'apply_pose:' prefix
        if (displayName.startsWith('apply pose:')) {
            displayName = displayName.substring('apply pose:'.length).trim() + ' (Posed)';
        }
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1); // Capitalize
        displayName += `_${index}`; // Add index for uniqueness if types are same
        nameSpan.textContent = displayName;
        nameSpan.title = objData.originalType; // Show full type on hover
        li.appendChild(nameSpan);

                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'X';
                deleteBtn.title = `Delete ${displayName}`;
                deleteBtn.classList.add('delete-object-btn');
                deleteBtn.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent li click event from firing
                    // --- REMOVED Confirmation ---
                    // Directly call deleteObject when the button is clicked
                    deleteObject(objData.uuid);
                    // --- END REMOVAL ---
                });
                li.appendChild(deleteBtn);

        // Add click listener to select the object
        li.addEventListener('click', () => {
            selectObject(objData.uuid);
        });

        // Add selected class if this is the currently selected object
        if (objData.uuid === selectedObjectUUID) {
            li.classList.add('selected');
        }

        objectListElement.appendChild(li);
    });
    // logToPage(`Object list UI populated with ${sceneObjects.length} items.`); // Too noisy
}

function selectObject(uuidToSelect) {
    if (selectedObjectUUID === uuidToSelect) return;
    selectedObjectUUID = uuidToSelect;
    populateObjectList();
    const selectedObjData = sceneObjects.find(obj => obj.uuid === selectedObjectUUID);

    if (selectedObjData?.object3D) {
        updateTargets();
        const isPoseable = selectedObjData.isPoseable;
        if(openPoserBtn) openPoserBtn.disabled = !isPoseable;
        if(poseSelect) poseSelect.disabled = !isPoseable;
        if(refreshPosesBtn) refreshPosesBtn.disabled = !isPoseable;
        if(poseSelect) poseSelect.innerHTML = '<option value="">Default Pose</option>';
        if (isPoseable) {
             currentModelPath = selectedObjData.originalType;
             loadPosesForModel(selectedObjData.originalType);
        } else {
              currentModelPath = null;
        }
        updateSliderValuesFromObject();

    } else {
        // Deselection logic
        if(uuidToSelect) {
            logToPage(`Selected object data or 3D object not found for UUID: ${uuidToSelect}`, 'error');
        }
        selectedObjectUUID = null;
        if(openPoserBtn) openPoserBtn.disabled = true;
        if(poseSelect) poseSelect.disabled = true;
        if(refreshPosesBtn) refreshPosesBtn.disabled = true;
        if(poseSelect) poseSelect.innerHTML = '<option value="">Default Pose</option>';
        currentModelPath = null;
        updateSliderValuesFromObject();
        updateTargets();
    }
}

function deleteObject(uuid) {
    // Remove from sceneObjects
    const idx = sceneObjects.findIndex(obj => obj.uuid === uuid);
    if (idx === -1) return;
    const objData = sceneObjects[idx];
    // Remove from scene
    if (objData.object3D && objData.object3D.parent) {
        objData.object3D.parent.remove(objData.object3D);
    }
    // Remove from array
    sceneObjects.splice(idx, 1);
    // Deselect if it was selected
    if (selectedObjectUUID === uuid) {
        selectedObjectUUID = null;
    }
    populateObjectList();
    updateSliderValuesFromObject();
    updateTargets();
}

// --- END OBJECT MANAGEMENT FUNCTIONS ---


// --- Initialization ---
async function init() { // Make init async
    try {
        logToPage("Init started...");
        getDOMElements();
        logToPage("DOM elements retrieved successfully.");

        storeOriginalOptions();

        // --- Scene Setup ---
        scene = new THREE.Scene();
        logToPage("Scene created.");

        // --- Initialize Raycaster ---
        raycaster = new THREE.Raycaster();
        logToPage("Raycaster initialized.");

        const aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
        camera = new THREE.PerspectiveCamera(60, aspect > 0 ? aspect : 1, 0.1, 100);
        camera.layers.enableAll();
        logToPage("Camera created and layers enabled.");


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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);
        spotLight = new THREE.SpotLight(0xffffff, 1.0, 150, 1.0, 0, 1);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024; spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 0.5; spotLight.shadow.camera.far = 50;
        spotLight.shadow.bias = -0.001;
        spotLight.layers.disable(INTERACTION_LAYER);
        scene.add(spotLight);

        lightTarget = new THREE.Object3D();
        lightTarget.layers.disable(INTERACTION_LAYER);
        scene.add(lightTarget);
        spotLight.target = lightTarget;

        const lightSphereGeometry = new THREE.SphereGeometry(0.2, 16, 8);
        const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        lightVisualizer = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
        lightVisualizer.layers.disable(INTERACTION_LAYER);
        scene.add(lightVisualizer);
        logToPage("Lights setup complete (disabled interaction layer).");

        // --- Floor ---
        const floorGeometry = new THREE.PlaneGeometry(40, 40);
        floorBaseMaterial = { roughness: 0.9, metalness: 0.1 };
        const floorMaterial = new THREE.MeshStandardMaterial({
            ...floorBaseMaterial,
            color: 0x808080
        });
        floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        floor.layers.disable(INTERACTION_LAYER);
        scene.add(floor);
        logToPage("Floor added (disabled interaction layer).");

        // --- Helpers ---
        gridHelper = new THREE.GridHelper(40, 40, 0x888888, 0x444444);
        axesHelper = new THREE.AxesHelper(3);
        gridHelper.layers.disable(INTERACTION_LAYER);
        axesHelper.layers.disable(INTERACTION_LAYER);
        scene.add(gridHelper);
        scene.add(axesHelper);
        logToPage("Helpers added (disabled interaction layer).");

        // --- Controls ---
        if (!OrbitControls) throw new Error("OrbitControls not loaded!");
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enabled = true;
        controls.enableDamping = true; controls.dampingFactor = 0.05; controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2 - 0.01;
        controls.minDistance = 2; controls.maxDistance = 50;
        controls.update();
        /*
            Mobile/Touch support:
            - OrbitControls supports pinch-to-zoom, pan, and orbit by default.
            - In Chrome DevTools mobile emulation, use Shift+drag to simulate pinch/zoom.
            - Scroll wheel does NOT simulate pinch/zoom in mobile emulation.
            - On real mobile devices, pinch/zoom and pan work as expected.
        */
        logToPage("OrbitControls added.");
        logToPage("Tip: Pinch-to-zoom and touch gestures work on real mobile devices. Chrome mobile emulation does not support pinch for 3D view.", "info");

        // --- Shared Object Material ---
        objectMaterial = new THREE.MeshStandardMaterial({
            color: 0x3399ff,
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        logToPage("Base object material created.");

        // --- Event Listeners ---
        window.addEventListener('resize', onWindowResize, false);
        toggleControlsBtn.addEventListener('click', toggleControls);
        refreshShapeListBtn.addEventListener('click', resetShapeDropdown);
        cameraLockBtn.addEventListener('click', toggleCameraLock);
        gridHelperToggle.addEventListener('change', () => { gridHelper.visible = gridHelperToggle.checked; });
        resetObjectBtn.addEventListener('click', resetObjectState);
        wallHueSlider.addEventListener('input', onWallColorChange);
        wallSaturationSlider.addEventListener('input', onWallColorChange);
        wallBrightnessSlider.addEventListener('input', onWallColorChange);
        floorHueSlider.addEventListener('input', onFloorColorChange);
        floorSaturationSlider.addEventListener('input', onFloorColorChange);
        floorBrightnessSlider.addEventListener('input', onFloorColorChange);
        modelYOffsetSlider.addEventListener('input', onModelYOffsetChange);
        objectRotationXSlider.addEventListener('input', onObjectRotationChange);
        objectRotationYSlider.addEventListener('input', onObjectRotationChange);
        objectRotationZSlider.addEventListener('input', onObjectRotationChange);
        objectScaleSlider.addEventListener('input', onObjectScaleChange);
        modelColorHueSlider.addEventListener('input', onModelColorOrBrightnessChange);
        objectBrightnessSlider.addEventListener('input', onModelColorOrBrightnessChange);
        objectRoughnessSlider.addEventListener('input', onObjectMaterialChange);
        objectMetalnessSlider.addEventListener('input', onObjectMaterialChange);
        lightIntensitySlider.addEventListener('input', onLightIntensityChange);
        lightAngleSlider.addEventListener('input', onSpotlightParamsChange);
        lightPenumbraSlider.addEventListener('input', onSpotlightParamsChange);
        lightXSlider.addEventListener('input', onLightPositionChange);
        lightYSlider.addEventListener('input', onLightPositionChange);
        lightZSlider.addEventListener('input', onLightPositionChange);
        shapeSelect.addEventListener('change', handleShapeSelectionChange);
        shapeSearchInput.addEventListener('input', filterShapeDropdown);
        copyLogBtn.addEventListener('click', () => {
             try {
                const logText = debugConsole.innerText || debugConsole.textContent;
                navigator.clipboard.writeText(logText)
                    .then(() => logToPage('Log copied to clipboard.', 'success'))
                    .catch(err => logToPage(`Failed to copy log: ${err}`, 'error'));
            } catch (e) { logToPage(`Copy log error: ${e.message}`, 'error'); }
        });
        controlsContainer.addEventListener('click', handleSliderReset);
        saveStateBtn?.addEventListener('click', saveSceneState);
        loadStateBtn?.addEventListener('click', async () => { await loadSceneState(); });
        resetSceneBtn?.addEventListener('click', async () => { await resetSceneToDefaults(); });
        poseSelect?.addEventListener('change', (event) => { applyPose(event.target.value); });
        openPoserBtn?.addEventListener('click', handleOpenPoser);
        refreshPosesBtn?.addEventListener('click', () => {
            const selectedObjData = sceneObjects.find(obj => obj.uuid === selectedObjectUUID);
             if(selectedObjData && selectedObjData.isPoseable) {
                  logToPage(`Refreshing poses for ${selectedObjData.originalType}...`);
                  loadPosesForModel(selectedObjData.originalType);
             } else {
                 logToPage("Refresh poses: No poseable object selected.", "warn");
             }
         });
        renderer.domElement.addEventListener('click', onSceneClick, false);
        focusCameraBtn?.addEventListener('click', () => focusCameraOnSelection(false));
        decoupleCameraBtn?.addEventListener('click', toggleCameraDecoupling);
        logToPage("Event listeners added.");

        // --- Apply Initial State ---
        await resetSceneToDefaults(); // Load defaults (includes a random primitive)
        logToPage("Skipping automatic load state on init during development.");
        populateObjectList();
        animate();
        logToPage("Init complete, starting animation loop.", "success");

    } catch (error) {
        logToPage(`Initialization Error: ${error.message}\n${error.stack}`, 'error');
        if(sceneContainer){
            sceneContainer.innerHTML = `<p style='color: #ff8080; padding: 20px;'>Initialization Error: ${error.message}<br>Check Debug Log Below.</p>`;
        } else {
            alert(`Initialization Error: ${error.message}`);
        }
    }
}


// --- Event Handlers ---

function onWindowResize() {
    // This function exists from the user's provided base file
    // logToPage("Window resize detected."); // Too noisy
    setTimeout(() => {
        try {
            const width = sceneContainer.clientWidth;
            const height = sceneContainer.clientHeight;
            if (width > 0 && height > 0) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                // logToPage(`Resized renderer to ${width}x${height}`); // Too noisy
            } else {
                 logToPage(`Resize skipped: Invalid dimensions ${width}x${height}`, 'error');
            }
        } catch(e){ logToPage(`Resize error: ${e.message}`,'error')}
    }, 50);
}

function onSceneClick(event) {
    if (!raycaster || !camera || !sceneObjects || sceneObjects.length === 0) return;

    const mouse = new THREE.Vector2();
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    raycaster.layers.set(INTERACTION_LAYER);

    const objectsToCheck = sceneObjects.map(data => data.object3D);
    const intersects = raycaster.intersectObjects(objectsToCheck, true);

    if (intersects.length > 0) {
        let clickedObjectData = null;
        const closestIntersectedObject = intersects[0].object; // The specific mesh/part clicked

        // --- Revised Traversal Logic ---
        let searchObj = closestIntersectedObject;
        while (searchObj && searchObj !== scene) {
             // Check if the *current* searchObj is the root of a managed object
             const foundData = sceneObjects.find(data => data.object3D === searchObj);
             if (foundData) {
                 clickedObjectData = foundData;
                 logToPage(`Raycast Success: Identified managed object ${foundData.uuid} (Root: ${searchObj.name || 'Unnamed'}) by traversing up from clicked mesh ${closestIntersectedObject.name || 'Unnamed'}.`);
                 break; // Found the managed root
             }
             searchObj = searchObj.parent; // Go up one level
        }
        // --- End Revised Logic ---


        if (clickedObjectData) {
            selectObject(clickedObjectData.uuid); // Select the identified managed object
        } else {
             logToPage(`Raycast Warn: Hit object "${closestIntersectedObject.name || 'Unnamed'}" but couldn't find its root in sceneObjects during traversal.`, "warn");
             selectObject(null); // Deselect if we hit something but can't map it
        }
    } else {
        // logToPage("Raycast miss (clicked empty space)."); // Too noisy
        selectObject(null); // Deselect if clicking empty space
    }
}

function handleOpenPoser() {
    logToPage("Open Poser button clicked.");
    if (!currentModelPath) {
        logToPage("Cannot open poser: No poseable model selected.", 'error');
        alert("No poseable model selected. Please select a poseable model from the list or scene first.");
        return;
    }
    if (!isPoseableModel(currentModelPath)) {
        logToPage(`Cannot open poser: Model '${currentModelPath}' is not designated as poseable.`, 'warn');
        alert("The currently selected object is not designated as a poseable model.");
        return;
    }
    const poserUrl = `poser.html?model=${encodeURIComponent(currentModelPath)}`;
    logToPage(`Opening poser for model: ${currentModelPath} at URL: ${poserUrl}`);
    const poserWindow = window.open(poserUrl, '_blank');
    if (!poserWindow) {
        logToPage("Failed to open poser window. Pop-up blocker might be active.", 'error');
        alert("Could not open the poser window. Please check if your browser blocked the pop-up and allow pop-ups for this site.");
    } else {
        logToPage("Poser window opened (or attempted).", "success");
    }
}

function toggleControls() {
    try {
        const isCollapsed = document.body.classList.toggle('controls-collapsed');

        // Use simpler, consistent button text/icons
        // Option 1: Text
        // toggleControlsBtn.textContent = isCollapsed ? 'Show Controls' : 'Hide Controls';
        // Option 2: Arrows (Example)
        toggleControlsBtn.textContent = isCollapsed ? '▲' : '▼';
        toggleControlsBtn.title = isCollapsed ? 'Expand Controls' : 'Collapse Controls';


        logToPage(`Controls ${isCollapsed ? 'collapsed' : 'expanded'}.`);

        // Delay resize slightly to allow CSS transitions/layout changes to start
        // This ensures the renderer sizes to the *new* container dimensions
        setTimeout(onWindowResize, 50); // Keep the resize call

    } catch (error) {
        logToPage(`Error toggling controls: ${error.message}`, 'error');
        console.error("Toggle Controls Error:", error); // Log full error for details
    }
}

function toggleCameraLock() {
    // This function exists from the user's provided base file
     try {
         if (!controls || !cameraLockBtn) return;
         controls.enabled = !controls.enabled;
         cameraLockBtn.textContent = controls.enabled ? 'Lock Camera' : 'Unlock Camera';
         logToPage(`Camera controls ${controls.enabled ? 'enabled' : 'disabled'}.`);
     } catch (e) { logToPage(`Camera lock toggle error: ${e.message}`, 'error'); }
 }

function resetObjectState() {
     logToPage("Resetting selected object state (if any)...");
     const selectedObj3D = getSelectedObject3D();
     if (!selectedObj3D) {
         logToPage("No object selected to reset.", "info");
         return;
     }
     logToPage(`Resetting state for object: ${selectedObjectUUID}`);
     try {
         // Reset sliders controlling the selected object
         const objectControlSliderIds = [
             'modelYOffset', 'objectRotationX', 'objectRotationY', 'objectRotationZ',
             'objectScale', 'modelColorHue', 'objectBrightness', 'objectRoughness', 'objectMetalness'
         ];
         objectControlSliderIds.forEach(id => {
             const resetButton = document.querySelector(`.reset-slider-btn[data-target-slider="${id}"]`);
             if (resetButton?.click) {
                 resetButton.click(); // Simulate clicking the reset button for that specific slider
             } else {
                 logToPage(`Could not find or click reset button for slider ${id}`, 'warn');
             }
         });

         // Also reset pose if it's a poseable model
         const selectedObjData = sceneObjects.find(obj => obj.uuid === selectedObjectUUID);
          if (selectedObjData?.isPoseable && poseSelect) {
              poseSelect.value = ''; // Select "Default Pose"
              applyPose(''); // Apply the default pose logic
              logToPage("Reset applied default pose to selected object.");
          }

         logToPage("Selected object state reset triggered via sliders/pose.");
     } catch (e) {
          logToPage(`Error during object reset: ${e.message}`, 'error');
     }
  }

async function resetSceneToDefaults() {
    logToPage("Resetting scene to defaults...");
    try {
        // --- 1. Reset UI Toggles ---
        gridHelperToggle.checked = true;
        // axesHelperToggle.checked = false; // <-- REMOVED
        document.body.classList.remove('controls-collapsed');
        toggleControls(); toggleControls(); // Ensure correct button text

        logToPage("UI panel set to open.");
        controls.enabled = true;
        cameraLockBtn.textContent = 'Lock Camera';
        logToPage("UI toggles reset.");
        // --- End Reset UI Toggles ---

        // --- ADD: Clear existing objects ---
        logToPage("Clearing existing scene objects...");
        selectObject(null);
        while(sceneObjects.length > 0) {
            deleteObject(sceneObjects[sceneObjects.length - 1].uuid);
        }
        logToPage("Existing objects cleared.");
        // --- END ADD ---

        // --- 2. Set Default Slider Values via Reset Buttons ---
        logToPage("Setting default slider values...");
        // ** Apply Specific Light Defaults BEFORE clicking general reset **
        if(document.querySelector('.reset-slider-btn[data-target-slider="lightIntensity"]')) document.querySelector('.reset-slider-btn[data-target-slider="lightIntensity"]').dataset.resetValue = "3.5";
        if(document.querySelector('.reset-slider-btn[data-target-slider="lightAngle"]')) document.querySelector('.reset-slider-btn[data-target-slider="lightAngle"]').dataset.resetValue = "45";
        if(document.querySelector('.reset-slider-btn[data-target-slider="lightPenumbra"]')) document.querySelector('.reset-slider-btn[data-target-slider="lightPenumbra"]').dataset.resetValue = "0.20";
        if(document.querySelector('.reset-slider-btn[data-target-slider="lightY"]')) document.querySelector('.reset-slider-btn[data-target-slider="lightY"]').dataset.resetValue = "10.0";
        if(document.querySelector('.reset-slider-btn[data-target-slider="lightX"]')) document.querySelector('.reset-slider-btn[data-target-slider="lightX"]').dataset.resetValue = "4.0"; // Corrected X value
        if(document.querySelector('.reset-slider-btn[data-target-slider="lightZ"]')) document.querySelector('.reset-slider-btn[data-target-slider="lightZ"]').dataset.resetValue = "0.0";

        // Click all reset buttons to apply defaults (including the updated light ones)
        document.querySelectorAll('#controls-container .reset-slider-btn').forEach(btn => {
            try { btn.click(); } catch (e) { logToPage(`Error clicking reset btn for ${btn.dataset.targetSlider}: ${e.message}`, 'warn');}
        });
        logToPage("Default slider values applied via reset buttons.");

        // --- 3. Set Randomized Hues (Manually) ---
        logToPage("Setting randomized environment hues...");
        const randomWallHue = Math.random();
        const randomFloorHue = Math.random();
        if(wallHueSlider) wallHueSlider.value = randomWallHue;
        if(floorHueSlider) floorHueSlider.value = randomFloorHue;
        onWallColorChange();
        onFloorColorChange();

        // --- 4. Select and Load Random Primitive ---
        logToPage("Selecting random primitive...");
        resetShapeDropdown();
        const primitiveOptions = Array.from(shapeSelect.querySelectorAll('optgroup[label="Primitives"] option'));
        let selectedPrimitiveValue = 'sphere'; // Keep sphere as fallback default
        if (primitiveOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * primitiveOptions.length);
            selectedPrimitiveValue = primitiveOptions[randomIndex].value;
            logToPage(`Random primitive selected: ${selectedPrimitiveValue}`);
        } else {
            logToPage("No primitive options found, defaulting to sphere.", 'warn');
        }
        shapeSelect.value = selectedPrimitiveValue;
        await handleShapeSelectionChange();

        // --- 5. Reset Camera and Helpers ---
        logToPage("Resetting camera and helpers...");
        gridHelper.visible = gridHelperToggle.checked;
        axesHelper.visible = false; // <-- Directly set visibility to false
        camera.position.set(0, 6, 14);
        if (isCameraDecoupled) {
             toggleCameraDecoupling();
        }
        controls.update();

        // --- 6. Final UI State ---
        logToPage("Scene reset to defaults completed.", "success");

    } catch (error) {
        logToPage(`Error resetting scene: ${error.message}\n${error.stack}`, 'error');
    }
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

function onWallColorChange() {
    if (!wallHueSlider || !wallSaturationSlider || !wallBrightnessSlider) return;
    try {
        const hue = parseFloat(wallHueSlider.value);
        const saturation = parseFloat(wallSaturationSlider.value);
        const brightness = parseFloat(wallBrightnessSlider.value);
        const bgColor = new THREE.Color();
        bgColor.setHSL(hue, saturation, brightness);
        if(scene) scene.background = bgColor;
        // Update scene container background only if it exists
        if(sceneContainer) sceneContainer.style.backgroundColor = bgColor.getStyle();
        if(wallHueValueSpan) wallHueValueSpan.textContent = `${Math.round(hue * 360)}°`;
        if(wallSaturationValueSpan) wallSaturationValueSpan.textContent = saturation.toFixed(2);
        if(wallBrightnessValueSpan) wallBrightnessValueSpan.textContent = brightness.toFixed(2);
    } catch(e){ logToPage(`Wall/Background color error: ${e.message}`,'error')}
}


// --- Object Control Handlers ---

function onModelYOffsetChange() {
    const selectedObj3D = getSelectedObject3D();
    if (!selectedObj3D || !modelYOffsetSlider || !modelYOffsetValueSpan) return; // Exit if no object selected or sliders missing

    try {
        const offset = parseFloat(modelYOffsetSlider.value);
        modelYOffsetValueSpan.textContent = offset.toFixed(1);

        // Calculate base Y specifically for the selected object
        const bounds = new THREE.Box3().setFromObject(selectedObj3D, true); // Precise bounds
        let selectedBaseY = 0;
        // Use object's current Y if bounds are bad
        if (!bounds.isEmpty() && !bounds.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0,0,0))) {
             selectedBaseY = -bounds.min.y;
        } else {
             selectedBaseY = selectedObj3D.position.y - offset; // Estimate base Y from current pos and slider
        }

        selectedObj3D.position.y = selectedBaseY + offset;

        updateTargets();

    } catch(e){ logToPage(`Y Offset change error: ${e.message}`,'error')}
}

function onObjectRotationChange() {
    const selectedObj3D = getSelectedObject3D();
    if (!selectedObj3D || !objectRotationXSlider || !objectRotationYSlider || !objectRotationZSlider) return; // Exit if no object selected or sliders missing

    try {
        const rxDeg = parseFloat(objectRotationXSlider.value);
        const ryDeg = parseFloat(objectRotationYSlider.value);
        const rzDeg = parseFloat(objectRotationZSlider.value);

        // Apply rotation using Quaternion for better stability
        const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(rxDeg));
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(ryDeg));
        const qz = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(rzDeg));

        // Combine rotations in ZYX order (common convention, adjust if needed)
        selectedObj3D.quaternion.copy(qy).multiply(qx).multiply(qz); // Apply Y, then X, then Z relative to object's local axes

        updateObjectRotationDisplay(); // Update UI spans
        updateTargets(); // Update targets after rotation change

    } catch(e){ logToPage(`Rotation change error: ${e.message}`,'error')}
}

function onObjectScaleChange() {
    const selectedObj3D = getSelectedObject3D();
    if (!selectedObj3D || !objectScaleSlider || !objectScaleValueSpan) return; // Exit if no object selected or sliders missing

    try {
        const scaleValue = parseFloat(objectScaleSlider.value);
        selectedObj3D.scale.set(scaleValue, scaleValue, scaleValue); // Apply uniform scale
        objectScaleValueSpan.textContent = scaleValue.toFixed(2) + 'x'; // Update UI Span

        // Recalculate center and update targets after scaling
        // Also re-apply Y offset as base Y changes with scale
        onModelYOffsetChange(); // Call this to recalculate base Y and apply offset correctly

    } catch(e) {
        logToPage(`Scale change error: ${e.message}`, 'error');
    }
}

function updateObjectRotationDisplay() {
     // This function exists from the user's provided base file
    try {
         // Read degrees from the sliders themselves for display
         if(objectRotationXValueSpan && objectRotationXSlider) objectRotationXValueSpan.textContent = `${parseFloat(objectRotationXSlider.value)}°`;
         if(objectRotationYValueSpan && objectRotationYSlider) objectRotationYValueSpan.textContent = `${parseFloat(objectRotationYSlider.value)}°`;
         if(objectRotationZValueSpan && objectRotationZSlider) objectRotationZValueSpan.textContent = `${parseFloat(objectRotationZSlider.value)}°`;
    } catch(e){ logToPage(`Update rotation display error: ${e.message}`,'error')}
}

function onModelColorOrBrightnessChange() {
    const selectedObj3D = getSelectedObject3D();
    // Also check the base objectMaterial exists for geometric primitives
    if ((!selectedObj3D && !objectMaterial) || !modelColorHueSlider || !objectBrightnessSlider) return;

    try {
        const hue = parseFloat(modelColorHueSlider.value);
        const lightness = parseFloat(objectBrightnessSlider.value);
        const saturation = 0.8; // Keep saturation constant for now

        // Update UI spans first
        if(modelColorHueValueSpan) modelColorHueValueSpan.textContent = `${Math.round(hue * 360)}°`;
        if(objectBrightnessValueSpan) objectBrightnessValueSpan.textContent = lightness.toFixed(2);

        // Helper to apply color if appropriate (no texture map)
        const applyColorChange = (material) => {
            if (material && material.isMeshStandardMaterial && !material.map) { // Only if NO texture map
                material.color.setHSL(hue, saturation, lightness);
                return true;
            }
            if (material && material.isMeshStandardMaterial && material.map) {
                // logToPage(`Skipped HSL change on material with map: ${material.name || 'Unnamed'}`, 'info'); // Too noisy
            }
            return false;
        };

        let changed = false;
        if (selectedObj3D) {
            // Apply to selected object (mesh or group children)
            if (selectedObj3D.isMesh) {
                if(applyColorChange(selectedObj3D.material)) changed = true;
            } else if (selectedObj3D.isGroup) {
                selectedObj3D.traverse((child) => {
                    if (child.isMesh && child.material) {
                         if (Array.isArray(child.material)) {
                            child.material.forEach(m => { if(applyColorChange(m)) changed = true; });
                        } else {
                            if(applyColorChange(child.material)) changed = true;
                        }
                    }
                });
            }
        } else if (objectMaterial) {
            // If nothing is selected, apply to the base material (for next primitive)
             if(applyColorChange(objectMaterial)) changed = true;
        }

        // if(changed) logToPage("Applied HSL color change."); // Too noisy

    } catch(e){ logToPage(`Color/Brightness change error: ${e.message}`,'error')}
}

function onObjectMaterialChange() {
    const selectedObj3D = getSelectedObject3D();
    // Also check the base objectMaterial exists for geometric primitives
    if ((!selectedObj3D && !objectMaterial) || !objectRoughnessSlider || !objectMetalnessSlider) return;

    try {
        const roughness = parseFloat(objectRoughnessSlider.value);
        const metalness = parseFloat(objectMetalnessSlider.value);

        // Update UI spans
        if(objectRoughnessValueSpan) objectRoughnessValueSpan.textContent = roughness.toFixed(2);
        if(objectMetalnessValueSpan) objectMetalnessValueSpan.textContent = metalness.toFixed(2);

        // Helper to apply properties
        const applyRoughMetal = (material) => {
             if (material && material.isMeshStandardMaterial) {
                 material.roughness = roughness;
                 material.metalness = metalness;
                 material.needsUpdate = true; // May help ensure changes apply visually
                 return true;
             }
             return false;
        };

        let changed = false;
        if (selectedObj3D) {
            // Apply to selected object (mesh or group children)
             if (selectedObj3D.isMesh) {
                 if(applyRoughMetal(selectedObj3D.material)) changed = true;
             } else if (selectedObj3D.isGroup) {
                 selectedObj3D.traverse((child) => {
                     if (child.isMesh && child.material) {
                         if (Array.isArray(child.material)) {
                             child.material.forEach(m => { if(applyRoughMetal(m)) changed = true; });
                         } else {
                             if(applyRoughMetal(child.material)) changed = true;
                         }
                     }
                 });
             }
        } else if (objectMaterial) {
             // If nothing selected, update base material
             if(applyRoughMetal(objectMaterial)) changed = true;
        }

        // if(changed) logToPage("Applied roughness/metalness change."); // Too noisy

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

function onSpotlightParamsChange() {
    if (!spotLight || !lightAngleValueSpan || !lightPenumbraValueSpan || !lightAngleSlider || !lightPenumbraSlider) return;
    try {
        const angleDeg = parseFloat(lightAngleSlider.value);
        const penumbra = parseFloat(lightPenumbraSlider.value);
        spotLight.angle = THREE.MathUtils.degToRad(angleDeg);
        spotLight.penumbra = penumbra;
        lightAngleValueSpan.innerHTML = `${angleDeg}°`;
        lightPenumbraValueSpan.textContent = penumbra.toFixed(2);
    } catch(e){ logToPage(`Spotlight params change error: ${e.message}`,'error')}
}

function onLightPositionChange() {
     if (!spotLight || !lightVisualizer || !lightXSlider || !lightYSlider || !lightZSlider) return;
     try {
         const newX = parseFloat(lightXSlider.value);
         const newY = parseFloat(lightYSlider.value);
         const newZ = parseFloat(lightZSlider.value);
         spotLight.position.set(newX, newY, newZ);
         lightVisualizer.position.copy(spotLight.position);
         updateLightPositionDisplays();
         // Target update is handled separately by updateTargets()
     } catch(e){ logToPage(`Light position change error: ${e.message}`,'error')}
}

function updateLightPositionDisplays() {
    try {
        if(lightXValueSpan && lightXSlider) lightXValueSpan.textContent = parseFloat(lightXSlider.value).toFixed(1);
        if(lightYValueSpan && lightYSlider) lightYValueSpan.textContent = parseFloat(lightYSlider.value).toFixed(1);
        if(lightZValueSpan && lightZSlider) lightZValueSpan.textContent = parseFloat(lightZSlider.value).toFixed(1);
    } catch(e){ logToPage(`Update light display error: ${e.message}`,'error')}
}

// --- Shape Selection Handler (Using New Name) ---
async function handleShapeSelectionChange() { // Make async
    const selectedValue = shapeSelect.value;
    logToPage(`Shape selection changed to: ${selectedValue}`);

    // Disable pose controls immediately (re-enabled later if applicable)
    if(openPoserBtn) openPoserBtn.disabled = true;
    if(poseSelect) poseSelect.disabled = true;
    if(refreshPosesBtn) refreshPosesBtn.disabled = true;
    if(poseSelect) poseSelect.innerHTML = '<option value="">Default Pose</option>'; // Clear old poses

    // --- Start Loading Indication ---
    // Optionally add a loading indicator UI element
    logToPage("Loading new object...", 'loading'); // Use log as indicator for now

    try {
        // Call updateObject to get the new object definition, but DON'T add to scene yet
        const result = await updateObject(selectedValue);

        if (!result || !result.object3D) {
            logToPage(`Failed to create/load object for type: ${selectedValue}`, 'error');
            return; // Stop if object creation failed
        }

        const newObject = result.object3D;
        const newId = THREE.MathUtils.generateUUID(); // Assign a unique ID

        // --- Assign Interaction Layer ---
        newObject.layers.set(INTERACTION_LAYER); // Set the main object layer
        newObject.traverse(child => { // Ensure all children are also on the layer
             child.layers.set(INTERACTION_LAYER);
        });
        logToPage(`Assigned interaction layer ${INTERACTION_LAYER} to new object ${newId}`);

        // --- Add to Scene and State Array ---
        logToPage(`Adding new object ${newId} (${result.originalType}) to scene...`);
        // 1. Set initial position/rotation/scale (usually origin/zero/one)
        newObject.position.set(0, 0, 0);
        newObject.rotation.set(0, 0, 0);
        newObject.quaternion.setFromEuler(newObject.rotation); // Init quaternion
        newObject.scale.set(1, 1, 1);
        // 2. Add to Three.js scene
        scene.add(newObject);
        // 3. Create metadata wrapper and add to our array
        const sceneObjectData = {
            uuid: newId,
            originalType: result.originalType, // e.g., 'models/male_base0.glb' or 'sphere'
            objectType: result.type, // e.g., 'glb', 'primitive'
            object3D: newObject,
            isPoseable: isPoseableModel(result.originalType),
            // Add placeholder for initial pose if needed later per-object
        };
        sceneObjects.push(sceneObjectData);

        // --- Position based on bounds (AFTER adding to scene) ---
        newObject.updateMatrixWorld(true); // Ensure matrix is current
        const boundingBox = new THREE.Box3().setFromObject(newObject, true); // Precise bounds
        let newObjectBaseY = 0;
        if (!boundingBox.isEmpty() && !boundingBox.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0,0,0))) {
            newObjectBaseY = -boundingBox.min.y;
        } else {
            logToPage(`Warning: BBox empty/zero for base Y calc on ${newId}. Using origin Y.`, 'warn');
            newObjectBaseY = newObject.position.y; // Use current Y (likely 0)
        }
        newObject.position.y = newObjectBaseY; // Set initial Y based on its bounds
        newObject.updateMatrixWorld(true);
        logToPage(`Positioned new object ${newId} at Y: ${newObjectBaseY.toFixed(3)}`);

        // --- Apply Pose (if requested during creation) ---
        // Ensure this check happens AFTER the object is added and positioned
        // And use applyPoseData directly with the newly created object
        if (result.type === 'posed_glb' && result.poseToApply && result.object3D.isGroup) { // Check if it's a group (likely poseable)
            const poseDataToLoad = localStorage.getItem(`poses_${result.originalType}`);
            if(poseDataToLoad) {
                 try {
                      const allPoses = JSON.parse(poseDataToLoad);
                      if (allPoses && allPoses[result.poseToApply]) {
                           const poseApplied = applyPoseData(newObject, allPoses[result.poseToApply]);
                           logToPage(`Attempted to apply saved pose "${result.poseToApply}" on load: ${poseApplied ? 'Success' : 'Failed'}`);
                      } else {
                           logToPage(`Pose "${result.poseToApply}" not found in localStorage for ${result.originalType}`, 'warn');
                      }
                 } catch(e) {
                      logToPage(`Error parsing pose data for ${result.originalType} on load: ${e.message}`, 'error');
                 }
            } else {
                 logToPage(`No saved poses found for ${result.originalType} when trying to apply "${result.poseToApply}"`, 'warn');
            }
        } else if (result.type === 'posed_glb' && result.isPoseable) {
             // If it's a poseable GLB but no specific pose was requested,
             // we don't need to apply default here, it should load in its default state.
             logToPage(`Loaded poseable model ${newId} in its default state.`);
        }

        // --- Update UI ---
        populateObjectList(); // Refresh the list UI
        selectObject(newId); // Select the newly added object (this handles gizmo, sliders, etc.)

        logToPage(`Object ${newId} added and selected successfully.`, 'success');

    } catch (error) {
        logToPage(`Error during shape change handling: ${error.message}\n${error.stack}`, 'error');
    } finally {
        // --- End Loading Indication ---
        // Remove loading indicator if one was added
         logToPage("Finished loading object."); // Indicate loading finished
    }
}

// --- Slider Reset Handler ---
 function handleSliderReset(event) {
     if (!event.target.classList.contains('reset-slider-btn')) {
         return;
     }
     event.stopPropagation();
     try {
         const button = event.target;
         const sliderId = button.dataset.targetSlider;
         const resetValue = button.dataset.resetValue;
         const sliderElement = document.getElementById(sliderId);

         if (sliderElement && resetValue !== undefined) {
             sliderElement.value = resetValue;
             // Dispatch 'input' event to trigger associated handlers
             sliderElement.dispatchEvent(new Event('input', { bubbles: true }));
             logToPage(`Slider '${sliderId}' reset to ${resetValue}.`);
         } else {
              logToPage(`Reset failed: Slider '${sliderId}' or reset value '${resetValue}' not found/defined.`, 'error');
         }
     } catch (e) {
          logToPage(`Slider reset error: ${e.message}`, 'error');
     }
 }

function focusCameraOnSelection(smooth = false) { // Defaulting smooth to false for now
    const selectedObj3D = getSelectedObject3D();
    if (!selectedObj3D) {
        logToPage("Focus camera: No object selected. Focusing on origin.", "info");
        // Option 1: Focus on origin
        controls.target.set(0, 1, 0); // Sensible default target
        // Option 2: Zoom out to a default view?
        const defaultPos = new THREE.Vector3(0, 6, 14); // Default camera position
         // If smooth, implement tweening here to defaultPos and target (0,1,0)
         if (smooth) {
             logToPage("Smooth focus to default view not yet implemented.");
             camera.position.copy(defaultPos);
         } else {
             camera.position.copy(defaultPos);
         }
        controls.update();
        // Ensure camera isn't decoupled after focusing
        if (isCameraDecoupled) toggleCameraDecoupling();
        return;
    }

    logToPage(`Focusing camera on ${selectedObjectUUID}`);
    const targetCenter = new THREE.Vector3();
    const boundingBox = new THREE.Box3().setFromObject(selectedObj3D, true); // Precise bounds

    if (!boundingBox.isEmpty() && !boundingBox.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0,0,0))) {
        boundingBox.getCenter(targetCenter);
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Basic calculation for distance based on FOV and object size
        const fitOffset = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
        const desiredDist = fitOffset + maxDim * 0.75; // Add slightly less padding (adjust factor)

        // Clamp distance within OrbitControls limits
        const finalDist = THREE.MathUtils.clamp(desiredDist, controls.minDistance, controls.maxDistance);

        // Calculate new camera position along the current view vector
        // Get vector from current camera position to current target
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        // Normalize this vector and scale it to the desired distance
        offset.normalize().multiplyScalar(finalDist);
        // Calculate new position by adding the scaled offset to the *new* target center
        const newPos = targetCenter.clone().add(offset);


        // TODO: Implement smooth transition using a library like GSAP or TWEEN.js
        if (smooth) {
            logToPage("Smooth camera focus not yet implemented.");
            // Placeholder for tweening logic (tween camera.position to newPos, controls.target to targetCenter)
            camera.position.copy(newPos);
            controls.target.copy(targetCenter);
             controls.update(); // Update needed after manual change
        } else {
            // Instant move
            camera.position.copy(newPos);
            controls.target.copy(targetCenter);
            controls.update(); // Update needed after manual change
        }

        logToPage(`Camera focused. Target: ${targetCenter.x.toFixed(1)},${targetCenter.y.toFixed(1)},${targetCenter.z.toFixed(1)}. Dist: ${finalDist.toFixed(1)}`);

    } else {
        logToPage("Focus camera: Could not get valid bounds of selected object. Targeting origin.", "warn");
        // Fallback: target object origin
        controls.target.copy(selectedObj3D.position); // Target object's origin
        // Keep current distance or reset? Let's reset position too for consistency
        const defaultPos = new THREE.Vector3(0, 6, 14); // Default camera position
        camera.position.copy(defaultPos);
        controls.update();
    }

     // Ensure camera isn't decoupled after focusing
     if (isCameraDecoupled) {
         toggleCameraDecoupling(); // Re-couple the camera
     }
}

function toggleCameraDecoupling() {
    isCameraDecoupled = !isCameraDecoupled;
    logToPage(`Camera decoupling ${isCameraDecoupled ? 'ENABLED' : 'DISABLED'}.`);
    if (isCameraDecoupled) {
        decoupleCameraBtn.textContent = 'Free';
        decoupleCameraBtn.classList.add('decoupled');
        // When decoupling, save the current target so we can potentially return
        // Or just let the user pan freely. For now, just stop target updates.
        controls.enablePan = true; // Ensure panning is enabled in free mode
        logToPage("OrbitControls target updates disabled.");

    } else {
        decoupleCameraBtn.textContent = 'Orbit';
        decoupleCameraBtn.classList.remove('decoupled');
        controls.enablePan = true; // Keep panning enabled (standard orbit behavior)
        // Re-target to selection immediately when re-coupling
        updateTargets(); // This will now set the target again
        logToPage("OrbitControls target updates enabled.");
        controls.update();
    }
}

// --- Save/Load State Functions ---

 function saveSceneState() {
     logToPage("Attempting to save scene state...");
     if (!camera || !controls || !spotLight ) {
         logToPage("Cannot save state: Core components not ready.", 'error');
         return;
     }

     try {
         // --- Prepare sceneObjects data ---
         const objectsToSave = sceneObjects.map(objData => {
             const obj3D = objData.object3D;
             let materialData = null;
             let poseData = null;
             let representativeMaterial = null;
              if (obj3D.isMesh && obj3D.material && obj3D.material.isMeshStandardMaterial) {
                  representativeMaterial = obj3D.material;
              } else if (obj3D.isGroup) {
                  obj3D.traverse((child) => {
                      if (!representativeMaterial && child.isMesh && child.material && child.material.isMeshStandardMaterial) {
                          representativeMaterial = child.material;
                      }
                  });
              }
              if (representativeMaterial) {
                  if (!representativeMaterial.map) {
                      const hsl = { h: 0, s: 0, l: 0 };
                      representativeMaterial.color.getHSL(hsl);
                      materialData = {
                         hue: hsl.h, brightness: hsl.l,
                         roughness: representativeMaterial.roughness, metalness: representativeMaterial.metalness
                      }
                  } else {
                       materialData = {
                         hue: null, brightness: null,
                         roughness: representativeMaterial.roughness, metalness: representativeMaterial.metalness
                       }
                  }
              }

             if (objData.isPoseable && obj3D.isGroup) {
                 const bones = [];
                 obj3D.traverse(child => { if (child.isBone) bones.push(child); });
                 if (bones.length > 0) {
                      poseData = bones.map(bone => ({
                         name: bone.name,
                         position: bone.position.toArray(), quaternion: bone.quaternion.toArray(), scale: bone.scale.toArray()
                     }));
                 }
             }

             return {
                 uuid: objData.uuid, originalType: objData.originalType,
                 transform: {
                     position: obj3D.position.toArray(),
                     quaternion: obj3D.quaternion.toArray(), scale: obj3D.scale.toArray()
                 },
                 material: materialData, poseData: poseData
             };
         });

         // --- Create Full State Object ---
         const state = {
             version: 1.2,
             camera: { position: camera.position.toArray(), target: controls.target.toArray() },
             light: {
                 intensity: parseFloat(lightIntensitySlider.value), angle: parseFloat(lightAngleSlider.value),
                 penumbra: parseFloat(lightPenumbraSlider.value), position: spotLight.position.toArray()
             },
             sceneObjects: objectsToSave,
             selectedObjectUUID: selectedObjectUUID,
             environment: {
                 wall: {
                     hue: parseFloat(wallHueSlider.value), saturation: parseFloat(wallSaturationSlider.value),
                     brightness: parseFloat(wallBrightnessSlider.value)
                 },
                 floor: {
                     hue: parseFloat(floorHueSlider.value), saturation: parseFloat(floorSaturationSlider.value),
                     brightness: parseFloat(floorBrightnessSlider.value)
                 }
             },
             helpers: {
                 gridVisible: gridHelperToggle.checked,
                 // axesVisible: false // No longer needed to save explicitly
             },
             ui: {
                 controlsCollapsed: document.body.classList.contains('controls-collapsed'),
                 cameraLocked: !controls.enabled, cameraDecoupled: isCameraDecoupled
             }
         };

         const stateString = JSON.stringify(state);
         localStorage.setItem(LOCAL_STORAGE_KEY, stateString);
         logToPage("Scene state saved successfully (v1.2).", "success");

     } catch (error) {
         logToPage(`Error saving state: ${error.message}`, 'error');
         console.error("Save State Error Details:", error);
     }
 }

 async function loadSceneState() { // Make async
     logToPage("Attempting to load scene state...");
     const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);

     if (!savedStateJSON) {
         logToPage("No saved state found in localStorage.");
         return false;
     }

     let loadedState;
     try {
         loadedState = JSON.parse(savedStateJSON);
         if (!loadedState || (loadedState.version !== 1.1 && loadedState.version !== 1.2)) {
              logToPage(`Saved state version mismatch or invalid. Expected 1.1 or 1.2, got ${loadedState?.version}. Ignoring.`, 'error');
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              return false;
         }
         if (!loadedState.sceneObjects || !Array.isArray(loadedState.sceneObjects)) {
              logToPage(`Saved state missing or invalid 'sceneObjects' array. Ignoring.`, 'error');
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              return false;
         }
         logToPage(`Saved state v${loadedState.version} parsed successfully.`);
     } catch (error) {
         logToPage(`Error parsing saved state: ${error.message}. Clearing invalid state.`, 'error');
         console.error("Parse State Error Details:", error);
         localStorage.removeItem(LOCAL_STORAGE_KEY);
         return false;
     }

     try {
         logToPage("Applying loaded state...");

         // --- 1. Clear Existing Scene ---
         logToPage("Clearing current scene...");
         selectObject(null);
         while(sceneObjects.length > 0) {
              deleteObject(sceneObjects[sceneObjects.length - 1].uuid);
         }
         logToPage("Current scene cleared.");

         // --- 2. Apply Global Settings (Camera, Light, Environment, UI) ---
         logToPage("Applying global settings...");
         controls.enabled = !loadedState.ui.cameraLocked;
         cameraLockBtn.textContent = controls.enabled ? 'Lock Camera' : 'Unlock Camera';
         if (loadedState.ui.controlsCollapsed) {
             document.body.classList.add('controls-collapsed');
         } else {
             document.body.classList.remove('controls-collapsed');
         }
         toggleControls(); toggleControls();

         if (loadedState.ui.cameraDecoupled !== undefined && loadedState.ui.cameraDecoupled !== isCameraDecoupled) {
            toggleCameraDecoupling();
         }

         camera.position.fromArray(loadedState.camera.position);
         controls.target.fromArray(loadedState.camera.target);
         controls.update();

         lightIntensitySlider.value = loadedState.light.intensity;
         lightAngleSlider.value = loadedState.light.angle;
         lightPenumbraSlider.value = loadedState.light.penumbra;
         lightXSlider.value = loadedState.light.position[0];
         lightYSlider.value = loadedState.light.position[1];
         lightZSlider.value = loadedState.light.position[2];
         onLightIntensityChange();
         onSpotlightParamsChange();
         onLightPositionChange();

         wallHueSlider.value = loadedState.environment.wall.hue;
         wallSaturationSlider.value = loadedState.environment.wall.saturation;
         wallBrightnessSlider.value = loadedState.environment.wall.brightness;
         floorHueSlider.value = loadedState.environment.floor.hue;
         floorSaturationSlider.value = loadedState.environment.floor.saturation;
         floorBrightnessSlider.value = loadedState.environment.floor.brightness;
         onWallColorChange();
         onFloorColorChange();

         gridHelperToggle.checked = loadedState.helpers.gridVisible;
         gridHelper.visible = loadedState.helpers.gridVisible;
         axesHelper.visible = loadedState.helpers.axesVisible ?? false; // Still handle potential old saves

         // --- 3. Recreate Objects from Saved State ---
         logToPage(`Recreating ${loadedState.sceneObjects.length} objects...`);
         let lastSelectedUUID = loadedState.selectedObjectUUID || null;
         selectedObjectUUID = null;

         for (const savedObjData of loadedState.sceneObjects) {
             // logToPage(`Recreating object: ${savedObjData.uuid} (${savedObjData.originalType})`); // Too noisy
             const result = await updateObject(savedObjData.originalType);

             if (!result || !result.object3D) {
                 logToPage(`Failed to recreate object ${savedObjData.uuid}`, 'error');
                 continue;
             }

             const newObject = result.object3D;
             newObject.layers.set(INTERACTION_LAYER);
             newObject.traverse(child => { child.layers.set(INTERACTION_LAYER); });

             if (savedObjData.transform) {
                  newObject.position.fromArray(savedObjData.transform.position);
                   if (savedObjData.transform.quaternion) {
                        newObject.quaternion.fromArray(savedObjData.transform.quaternion);
                   } else if (savedObjData.transform.rotation) {
                        newObject.rotation.fromArray(savedObjData.transform.rotation);
                        newObject.quaternion.setFromEuler(newObject.rotation);
                        // logToPage(`Applied Euler rotation from older save format for ${savedObjData.uuid}`, 'info'); // Too noisy
                   }
                  newObject.scale.fromArray(savedObjData.transform.scale);
                  newObject.updateMatrixWorld(true);
             } else {
                  logToPage(`No transform data found for ${savedObjData.uuid}, using defaults.`, 'warn');
                   newObject.updateMatrixWorld(true);
                  const bounds = new THREE.Box3().setFromObject(newObject, true);
                  let baseY = 0;
                  if (!bounds.isEmpty() && !bounds.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0,0,0))) {
                       baseY = -bounds.min.y;
                   }
                  newObject.position.set(0, baseY, 0);
             }

             if (savedObjData.material) {
                  let appliedToMesh = false;
                  const applySavedMaterial = (material, savedMatData) => {
                      if (!material || !material.isMeshStandardMaterial || !savedMatData) return false;
                      if (savedMatData.hue !== null && savedMatData.brightness !== null && !material.map) {
                           material.color.setHSL(savedMatData.hue, 0.8, savedMatData.brightness);
                      }
                      material.roughness = savedMatData.roughness;
                      material.metalness = savedMatData.metalness;
                      material.needsUpdate = true;
                      return true;
                  };

                 if (newObject.isMesh) {
                     if(applySavedMaterial(newObject.material, savedObjData.material)) appliedToMesh = true;
                 } else if (newObject.isGroup) {
                      newObject.traverse(child => {
                          if (child.isMesh) {
                              if(Array.isArray(child.material)) {
                                   child.material.forEach(m => {if(applySavedMaterial(m, savedObjData.material)) appliedToMesh = true;});
                              } else {
                                   if(applySavedMaterial(child.material, savedObjData.material)) appliedToMesh = true;
                              }
                          }
                      });
                 }
             }

             const isActuallyPoseable = isPoseableModel(savedObjData.originalType);
             if (isActuallyPoseable && savedObjData.poseData) {
                 // logToPage(`Applying saved pose data to ${savedObjData.uuid}`); // Too noisy
                 applyPoseData(newObject, savedObjData.poseData);
             }

             scene.add(newObject);
             sceneObjects.push({
                 uuid: savedObjData.uuid, originalType: savedObjData.originalType,
                 objectType: result.type, object3D: newObject, isPoseable: isActuallyPoseable
             });
         }

         // --- 4. Restore Selection & Update UI ---
         populateObjectList();
         if (lastSelectedUUID && sceneObjects.some(o => o.uuid === lastSelectedUUID)) {
             selectObject(lastSelectedUUID);
         } else {
             selectObject(null);
         }

         controls.update();
         logToPage("Scene state loaded and applied successfully.", "success");
         return true;

     } catch (error) {
         logToPage(`Error applying loaded state: ${error.message}\n${error.stack}`, 'error');
         console.error("Apply State Error Details:", error);
         await resetSceneToDefaults();
         return false;
     }
 }


// --- Animation Loop ---
function animate() {
    try {
        requestAnimationFrame(animate);

        // Only update OrbitControls if not locked
        if (controls.enabled) {
             controls.update();
        }

        renderer.render(scene, camera);
    }
    catch (renderError) {
         logToPage(`Animation loop error: ${renderError.message}\n${renderError.stack}`, 'error');
    }
}

// --- Run ---
async function runInitialization() { // Make async
    logToPage("Running initialization...");
    try {
        await init(); // Call the main init function (already async)
    } catch (error) {
        logToPage(`Error during runInitialization: ${error.message}`, 'error');
        console.error("Initialization Run Error:", error);
        if(sceneContainer){
             sceneContainer.innerHTML = `<p style='color: #ff8080; padding: 20px;'>Initialization Error: ${error.message}<br>Check Debug Log Below.</p>`;
        }
    }
}

logToPage("Checking DOM state for initialization...");
if (document.readyState === 'loading') {
    logToPage("DOM not ready, adding DOMContentLoaded listener.");
    document.addEventListener('DOMContentLoaded', runInitialization);
} else {
    logToPage("DOM already loaded, running initialization directly.");
    runInitialization();
}