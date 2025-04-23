// --- Imports ---
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // <-- ADDED IMPORT
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
// --- ADDED GLOBALS ---
let openPoserBtn;
let poseSelect;
let refreshPosesBtn;
let currentModelPath = null; // Track the path of the loaded GLB
let loadedModelGroup = null; // Reference to the loaded GLB group itself
let initialBoneTransforms = null; // To store the default pose of a model


// --- DOM Elements ---
let sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn;
let cameraLockBtn, gridHelperToggle, axesHelperToggle;
let resetObjectBtn;
let saveStateBtn, loadStateBtn, resetSceneBtn; // Added resetSceneBtn back
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

// --- ADDED HELPER FUNCTIONS ---
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
    logToPage(`Applying saved pose data to ${modelGroup.name || 'model'}...`);
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
            obj.skeleton.update(); // Update skeleton if applicable
        }
    });

    logToPage(`Pose data application complete. Applied: ${bonesApplied}, Not Found: ${bonesNotFound}.`, success ? 'success' : 'error');
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
                     throw new Error("Cannot process GLTF: Model path is unknown.");
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
    if (!loadedModelGroup || !currentModelPath) {
        logToPage("Cannot apply pose: No poseable model loaded.", 'error');
        return;
    }

    if (!poseName || poseName === '') { // Empty value means reset to default
        logToPage("Applying default pose...");
        if (initialBoneTransforms) {
            // Apply the stored initial transforms
            const success = applyPoseData(loadedModelGroup, initialBoneTransforms);
             if (success) {
                logToPage("Default pose restored successfully.", "success");
            } else {
                logToPage("Failed to fully restore default pose.", "error");
            }
        } else {
            logToPage("Cannot apply default pose: Initial transforms not available.", 'error');
        }
        return;
    }

    // Load the specific named pose
    logToPage(`Applying pose: "${poseName}" for model ${currentModelPath}`);
    const storageKey = `poses_${currentModelPath}`;
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
        logToPage(`Error loading pose "${poseName}": ${e.message}`, 'error');
    }

    if (poseData) {
         const success = applyPoseData(loadedModelGroup, poseData);
         if (!success) {
             logToPage(`There were errors applying pose "${poseName}".`, 'error');
             // Optionally, reset dropdown to default if apply fails?
             // poseSelect.value = '';
         }
    } else {
        logToPage(`Pose data for "${poseName}" not found or invalid.`, 'error');
        // Reset dropdown to default if pose not found
        poseSelect.value = '';
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
}

function updateTargets() {
    if (!currentObject || !lightTarget || !controls || !spotLight) return;
    logToPage("Updating light and control targets...");
    const worldCenter = new THREE.Vector3();
    try {
        currentObject.updateMatrixWorld(true); // Ensure world matrix is up-to-date
        const finalBounds = new THREE.Box3().setFromObject(currentObject, true); // Use precise bounds

        if (!finalBounds.isEmpty()) {
            finalBounds.getCenter(worldCenter);
            logToPage(`Targeting center: ${worldCenter.x.toFixed(2)}, ${worldCenter.y.toFixed(2)}, ${worldCenter.z.toFixed(2)}`);
        } else {
            // Fallback if bounds are empty (e.g., points, lines, or error)
            worldCenter.copy(currentObject.position); // Target object's origin
            // Try to estimate a reasonable center Y based on scale if bounds fail
            const scaleY = currentObject.scale ? currentObject.scale.y : 1.0;
            worldCenter.y += 1.0 * scaleY; // Add approx half-height based on scale
            logToPage("Warning: Final BoundingBox empty. Targeting estimated center.", 'warn');
        }
    } catch (e) {
        logToPage(`Target calculation error: ${e.message}. Using object position as fallback.`, 'error');
        worldCenter.copy(currentObject.position);
    }

    lightTarget.position.copy(worldCenter);
    // Update spotlight position based on sliders *relative* to the target if needed,
    // but here we just keep its absolute position from sliders.
    // Ensure light position is also updated if sliders changed
    if (lightXSlider && lightYSlider && lightZSlider) {
         const lightY = parseFloat(lightYSlider.value);
         const lightX = parseFloat(lightXSlider.value);
         const lightZ = parseFloat(lightZSlider.value);
         spotLight.position.set(lightX, lightY, lightZ);
         if (lightVisualizer) lightVisualizer.position.copy(spotLight.position);
         updateLightPositionDisplays(); // Update light position UI spans
    }

    controls.target.copy(worldCenter);
    // controls.update(); // Let the animation loop handle controls update
    logToPage("Light & controls targets updated.");
}

function updateSliderValuesFromObject() {
    // This function primarily updates material sliders based on the object.
    // Transforms are usually set *from* sliders, but this can sync if needed.
    logToPage("Updating sliders from object state (primarily material)...");
    if (!currentObject) return;

    let representativeMaterial = objectMaterial; // Default to shared material

    // Try to find a representative material on the loaded object
    if (currentObject.isMesh && currentObject.material && currentObject.material.isMeshStandardMaterial) {
         representativeMaterial = currentObject.material;
    } else if (currentObject.isGroup) {
         currentObject.traverse((child) => {
             // Find the first suitable mesh material in the group
             if (!representativeMaterial || representativeMaterial === objectMaterial) {
                 if (child.isMesh && child.material && child.material.isMeshStandardMaterial) {
                     representativeMaterial = child.material;
                     // Optional: break traversal if found? Depends if you want the *first* or *last*.
                 }
             }
         });
    }

    // Update Material Sliders if a valid material was found
    if (representativeMaterial && representativeMaterial.isMeshStandardMaterial) {
        const currentHSL = { h: 0, s: 0, l: 0 };
        representativeMaterial.color.getHSL(currentHSL);
        // Only update Hue/Brightness sliders if NOT a GLB, as GLBs have their own texture colors
        if (!isPoseableModel(currentModelPath) && !currentModelPath?.toLowerCase().endsWith('.glb') ) {
            modelColorHueSlider.value = currentHSL.h;
            objectBrightnessSlider.value = currentHSL.l;
        }
        objectRoughnessSlider.value = representativeMaterial.roughness;
        objectMetalnessSlider.value = representativeMaterial.metalness;

         // Dispatch events to update UI spans for material properties
         modelColorHueSlider.dispatchEvent(new Event('input'));
         objectBrightnessSlider.dispatchEvent(new Event('input'));
         objectRoughnessSlider.dispatchEvent(new Event('input'));
         objectMetalnessSlider.dispatchEvent(new Event('input'));
        logToPage(`Material sliders updated from object: H:${currentHSL.h.toFixed(2)} L:${currentHSL.l.toFixed(2)} R:${representativeMaterial.roughness.toFixed(2)} M:${representativeMaterial.metalness.toFixed(2)}`);

    } else {
         logToPage("Could not find representative material on object to update sliders from.", "warn");
    }

     // Update Transform sliders (optional, usually sliders drive object)
     // modelYOffsetSlider.value = currentObject.position.y - objectBaseY;
     // objectRotationXSlider.value = THREE.MathUtils.radToDeg(currentObject.rotation.x);
     // ... etc ...
     // Dispatch events if transform sliders are updated here
}


// --- Update Object Function (Refactored & Handles GLB) ---
async function updateObject(requestedShapeType) { // Make async
    logToPage(`Updating object to: ${requestedShapeType}`);
    const s = 1.5; // Base size unit

    // Ensure objectMaterial exists before creating matClone
    if (!objectMaterial) {
        logToPage("CRITICAL ERROR: objectMaterial not initialized before updateObject call!", 'error');
        throw new Error("objectMaterial not ready"); // Stop execution
    }
    const matClone = () => objectMaterial.clone(); // Function to clone the shared material

    // --- Cleanup previous object ---
    if (currentObject) {
        logToPage(`Removing previous object (${currentObject.name || 'Unnamed'})`);
        scene.remove(currentObject);
        // Dispose geometry and materials carefully
        try {
            if (currentObject.traverse) {
                currentObject.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry?.dispose();
                        // Dispose materials, careful not to dispose the main shared one unless intended
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => {
                                if (m && m !== objectMaterial && m.dispose) m.dispose();
                            });
                        } else if (child.material && child.material !== objectMaterial && child.material.dispose) {
                            child.material.dispose();
                        }
                    }
                });
            }
            logToPage("Previous object resources disposed.");
        } catch (disposeError) { logToPage(`Disposal Error: ${disposeError.message}`, 'error'); }
        currentObject = null;
        loadedModelGroup = null; // Clear reference to previous loaded model
        currentModelPath = null; // Clear previous path
        initialBoneTransforms = null; // Clear initial state
    }

    // --- Create the new object ---
    let newObject = null;
    const isGlb = requestedShapeType.toLowerCase().endsWith('.glb');
    const isApplyPose = requestedShapeType.startsWith('apply_pose:');
    let targetModelPath = requestedShapeType;
    let poseToApply = null;

    try {
        if (isApplyPose) {
             // Extract model path and pose name
             const parts = requestedShapeType.substring('apply_pose:'.length).split('?pose=');
             targetModelPath = parts[0];
             poseToApply = parts.length > 1 ? decodeURIComponent(parts[1]) : null;
             logToPage(`Loading model ${targetModelPath} to apply pose: ${poseToApply || 'Default'}`);
             // Treat as GLB loading
             newObject = await loadGLBModel(targetModelPath); // Await the promise

        } else if (isGlb) {
            // Load a GLB model directly
            logToPage(`Loading GLB model: ${targetModelPath}`);
            newObject = await loadGLBModel(targetModelPath); // Await the promise

        } else {
            // Handle standard geometric shapes from shapeFunctionMap
            logToPage(`Creating geometric shape: ${targetModelPath}`);
            const isWireframe = targetModelPath.startsWith('wireframe_');
            const baseShapeType = isWireframe ? targetModelPath.substring('wireframe_'.length) : targetModelPath;

            // --- Randomize Color Hue for NON-GLB shapes ---
             const randomHue = Math.random();
             modelColorHueSlider.value = randomHue; // Set slider value
             onModelColorOrBrightnessChange();      // Update shared material & UI span
             logToPage(`Randomized object hue for geometric shape: ${Math.round(randomHue * 360)}°`);
            // --- END Randomize ---

            let createdItem = createObject(baseShapeType, s, matClone); // Call the mapped function

            if (!createdItem) {
                throw new Error("Shape creation function returned null/undefined!");
            }

            if (createdItem instanceof THREE.BufferGeometry) {
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
                logToPage(`Created Group directly for ${baseShapeType}.`);
                newObject = createdItem;
                if (isWireframe) {
                    logToPage(`Applying wireframe material to group...`);
                    Wireframes.applyWireframeMaterial(newObject, objectMaterial);
                }
                // Ensure shadows are cast by group children
                newObject.traverse(child => { if (child.isMesh) child.castShadow = true; });

            } else {
                throw new Error(`Shape function for ${baseShapeType} returned unexpected type: ${typeof createdItem}`);
            }
             // For non-GLB models, path is null, group is null
             currentModelPath = null;
             loadedModelGroup = null;
             initialBoneTransforms = null;
        }

        if (!newObject) {
             throw new Error("Object creation/loading resulted in null object.");
        }

        newObject.name = requestedShapeType; // Name the object based on selection value

        // --- Reset Transform Sliders and Apply Initial Transform ---
        resetObjectTransforms(); // Use helper function

        // --- Calculate Base Y Position ---
        objectBaseY = 0; // Reset base Y
        const boundingBox = new THREE.Box3();
        try {
             // Temporarily reset object's state for accurate bounds calculation
            const tempPos = newObject.position.clone();
            const tempRot = newObject.rotation.clone();
            const tempScale = newObject.scale.clone(); // Store original scale (might be from GLB processing)

            newObject.position.set(0, 0, 0);
            newObject.rotation.set(0, 0, 0);
             // Use the *intended* base scale (1 for shapes, calculated for GLB) for bounds
             const baseScale = isGlb ? newObject.scale.x : 1; // Assume uniform scale from GLB process
             newObject.scale.set(baseScale, baseScale, baseScale);
             newObject.updateMatrixWorld(true);

            boundingBox.setFromObject(newObject, true); // Use precise bounds if possible
            if (!boundingBox.isEmpty()) {
                objectBaseY = -boundingBox.min.y; // Base Y is negative of min Y
                logToPage(`Calculated objectBaseY: ${objectBaseY.toFixed(3)} (MinY: ${boundingBox.min.y.toFixed(3)}, SizeY: ${(boundingBox.max.y - boundingBox.min.y).toFixed(3)})`);
            } else {
                logToPage("Warning: BoundingBox empty during base Y calculation.", 'warn');
            }
             // Restore original position/rotation/scale
             newObject.position.copy(tempPos);
             newObject.rotation.copy(tempRot);
             newObject.scale.copy(tempScale);
             newObject.updateMatrixWorld(true);

        } catch (boundsError) {
            logToPage(`Base bounds calculation error: ${boundsError.message}`, 'error');
            objectBaseY = 0;
        }

        // --- Position Object & Apply Current Slider Values ---
        // Call handlers to apply slider values to the new object using the calculated base Y
        onModelYOffsetChange(); // Uses objectBaseY + slider value
        onObjectRotationChange(); // Applies 0 rotation from reset sliders
        onObjectScaleChange();   // Applies 1.0 scale from reset sliders

         // --- Apply Saved/Selected Pose (if applicable) ---
         if (isApplyPose && poseToApply && loadedModelGroup) {
             applyPose(poseToApply); // Apply the specific pose requested
         } else if (isApplyPose && loadedModelGroup) {
             applyPose(''); // Apply default pose if 'apply_pose:' was used but no specific pose given
         }
         // Standard GLBs or geometric shapes will be in their default loaded/created state here

         // --- Add to Scene ---
        scene.add(newObject);
        currentObject = newObject;
        logToPage(`Object ${newObject.name} added to scene.`);

        // --- Target light and controls ---
        updateTargets(); // Use helper function

        // --- Update Object Material Controls ---
        // Ensure sliders reflect the state of the loaded object (especially for GLB)
        // For GLB, we don't change material props unless user interacts
        // For geometric shapes, color was randomized, other props use slider defaults
         updateSliderValuesFromObject();


    } catch (creationError) {
        logToPage(`Failed to update object to ${requestedShapeType}: ${creationError.message}`, 'error');
        console.error(creationError);
        // Attempt to create a fallback sphere if everything else failed
        if (!currentObject) {
             try {
                 const fallbackGeo = Primitives.createSphereGeometry(s);
                 newObject = new THREE.Mesh(fallbackGeo, objectMaterial);
                 newObject.castShadow = true;
                 newObject.name = "Fallback Sphere";
                 scene.add(newObject);
                 currentObject = newObject;
                 resetObjectTransforms(); // Reset sliders for fallback
                 onModelYOffsetChange();
                 onObjectRotationChange();
                 onObjectScaleChange();
                 updateTargets();
                 updateSliderValuesFromObject();
                 logToPage("Created fallback sphere.", "warn");
             } catch (fallbackError) {
                 logToPage("CRITICAL: Failed even to create fallback sphere.", 'error');
             }
        }
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
    axesHelperToggle = document.getElementById('axesHelperToggle');
    resetObjectBtn = document.getElementById('resetObjectBtn');
    saveStateBtn = document.getElementById('saveStateBtn');
    loadStateBtn = document.getElementById('loadStateBtn');
    resetSceneBtn = document.getElementById('resetSceneBtn'); // Added back
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
    // --- ADDED LINES for Poser Controls ---
    openPoserBtn = document.getElementById('openPoserBtn');
    poseSelect = document.getElementById('poseSelect');
    refreshPosesBtn = document.getElementById('refreshPosesBtn'); // Get refresh button
    // --- END ADD ---
    logToPage("DOM elements assigned.");

    // --- MODIFIED the requiredElements check ---
    const requiredElements = [
        sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn, cameraLockBtn, gridHelperToggle, axesHelperToggle, resetObjectBtn, saveStateBtn, loadStateBtn, resetSceneBtn, // Added resetSceneBtn
        wallHueSlider, wallHueValueSpan, wallSaturationSlider, wallSaturationValueSpan, wallBrightnessSlider, wallBrightnessValueSpan, floorHueSlider, floorHueValueSpan, floorSaturationSlider, floorSaturationValueSpan, floorBrightnessSlider, floorBrightnessValueSpan,
        modelYOffsetSlider, modelYOffsetValueSpan, objectRotationXSlider, objectRotationXValueSpan, objectRotationYSlider, objectRotationYValueSpan, objectRotationZSlider, objectRotationZValueSpan, objectScaleSlider, objectScaleValueSpan,
        modelColorHueSlider, modelColorHueValueSpan, objectBrightnessSlider, objectBrightnessValueSpan, objectRoughnessSlider, objectRoughnessValueSpan, objectMetalnessSlider, objectMetalnessValueSpan,
        lightIntensitySlider, lightIntensityValueSpan, lightAngleSlider, lightAngleValueSpan, lightPenumbraSlider, lightPenumbraValueSpan, lightXSlider, lightYSlider, lightZSlider, lightXValueSpan, lightYValueSpan, lightZValueSpan,
        openPoserBtn, poseSelect, refreshPosesBtn // <-- Added new elements here
    ];
    if (requiredElements.some(el => !el)) {
        const elementNames = [
            "sceneContainer", "controlsContainer", "toggleControlsBtn", "shapeSelect", "shapeSearchInput", "refreshShapeListBtn", "copyLogBtn", "cameraLockBtn", "gridHelperToggle", "axesHelperToggle", "resetObjectBtn", "saveStateBtn", "loadStateBtn", "resetSceneBtn", // Added name
            "wallHueSlider", "wallHueValueSpan", "wallSaturationSlider", "wallSaturationValueSpan", "wallBrightnessSlider", "wallBrightnessValueSpan", "floorHueSlider", "floorHueValueSpan", "floorSaturationSlider", "floorSaturationValueSpan", "floorBrightnessSlider", "floorBrightnessValueSpan",
            "modelYOffsetSlider", "modelYOffsetValueSpan", "objectRotationXSlider", "objectRotationXValueSpan", "objectRotationYSlider", "objectRotationYValueSpan", "objectRotationZSlider", "objectRotationZValueSpan", "objectScaleSlider", "objectScaleValueSpan",
            "modelColorHueSlider", "modelColorHueValueSpan", "objectBrightnessSlider", "objectBrightnessValueSpan", "objectRoughnessSlider", "objectRoughnessValueSpan", "objectMetalnessSlider", "objectMetalnessValueSpan",
            "lightIntensitySlider", "lightIntensityValueSpan", "lightAngleSlider", "lightAngleValueSpan", "lightPenumbraSlider", "lightPenumbraValueSpan", "lightXSlider", "lightYSlider", "lightZSlider", "lightXValueSpan", "lightYValueSpan", "lightZValueSpan",
            "openPoserBtn", "poseSelect", "refreshPosesBtn" // <-- Added corresponding names here
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
     // AND the new selection is different from what *was* selected before filtering
     if (shapeSelect.options.length > 0 && shapeSelect.value !== currentSelectedValue) {
         handleShapeSelectionChange(); // Trigger the async handler
     }
}

function resetShapeDropdown() {
     if (!shapeSearchInput) return;
     logToPage("Resetting shape dropdown.");
     shapeSearchInput.value = '';
     filterShapeDropdown(); // Repopulate with all options and reset selection logic
 }


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

        spotLight = new THREE.SpotLight(0xffffff, 1.0, 150, 1.0, 0, 1);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024; spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 0.5; spotLight.shadow.camera.far = 50;
        spotLight.shadow.bias = -0.001;
        scene.add(spotLight);
        logToPage("Lights added.");

        lightTarget = new THREE.Object3D();
        scene.add(lightTarget);
        spotLight.target = lightTarget;
        logToPage("Spotlight target created.");

        // Optional: Light Visualizer
        const lightSphereGeometry = new THREE.SphereGeometry(0.2, 16, 8);
        const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        lightVisualizer = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
        scene.add(lightVisualizer);
        logToPage("Light visualizer added.");

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
        scene.add(floor);
        logToPage("Floor added.");

        // --- Helpers ---
        gridHelper = new THREE.GridHelper(40, 40, 0x888888, 0x444444);
        axesHelper = new THREE.AxesHelper(3);
        gridHelper.visible = gridHelperToggle.checked;
        axesHelper.visible = axesHelperToggle.checked;
        scene.add(gridHelper);
        scene.add(axesHelper);
        logToPage("Grid and Axes helpers added.");

        // --- Controls ---
        if (!OrbitControls) throw new Error("OrbitControls not loaded!");
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enabled = true;
        controls.enableDamping = true; controls.dampingFactor = 0.05; controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2 - 0.01;
        controls.minDistance = 2; controls.maxDistance = 50;
        controls.target.set(0, 1, 0);
        controls.update();
        logToPage("OrbitControls added.");

        // --- Shared Object Material ---
        objectMaterial = new THREE.MeshStandardMaterial({
            color: 0x3399ff,
            roughness: parseFloat(objectRoughnessSlider.value),
            metalness: parseFloat(objectMetalnessSlider.value),
            side: THREE.DoubleSide
        });
        logToPage("Base object material created.");

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
        objectScaleSlider.addEventListener('input', onObjectScaleChange);
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
        shapeSelect.addEventListener('change', handleShapeSelectionChange); // <-- MODIFIED LISTENER
        shapeSearchInput.addEventListener('input', filterShapeDropdown);
        copyLogBtn.addEventListener('click', () => {
            try {
                navigator.clipboard.writeText(debugConsole.innerText);
                logToPage("Log copied to clipboard.", "success");
            } catch (err) {
                logToPage(`Failed to copy log: ${err.message}`, "error");
            }
        });
        controlsContainer.addEventListener('click', handleSliderReset);

        // Save/Load/Reset Listeners
        saveStateBtn?.addEventListener('click', saveSceneState);
        loadStateBtn?.addEventListener('click', async () => { // <-- MODIFIED LISTENER (async)
            logToPage("Manual load button clicked.");
            await loadSceneState(); // Await the async load
        });
        resetSceneBtn?.addEventListener('click', async () => { // Add reset listener
            logToPage("Manual reset button clicked.");
            await resetSceneToDefaults();
            saveSceneState(); // Also save after manual reset
        });

        // --- ADDED POSE LISTENERS ---
         poseSelect?.addEventListener('change', (event) => {
             applyPose(event.target.value); // Pass the selected pose name (value)
         });
         openPoserBtn?.addEventListener('click', handleOpenPoser);
         refreshPosesBtn?.addEventListener('click', () => {
             if (currentModelPath && isPoseableModel(currentModelPath)) {
                 logToPage('Refreshing poses from local storage...');
                 loadPosesForModel(currentModelPath); // Reload poses for the current model
             } else {
                 logToPage('No poseable model loaded to refresh poses for.', 'info');
             }
         });
         // Initially disable pose controls until a model is loaded and checked
         if(openPoserBtn) openPoserBtn.disabled = true;
         if(poseSelect) poseSelect.disabled = true;
         if(refreshPosesBtn) refreshPosesBtn.disabled = true;
        // --- END ADD ---

        logToPage("Event listeners added.");

        // --- Apply Initial Control Values OR Load State ---
        let stateLoaded = false;
        try {
            logToPage("Attempting initial state load...");
            stateLoaded = await loadSceneState(); // Await the async load
        } catch (loadErr) {
            logToPage(`Error during initial state load: ${loadErr.message}`, 'error');
        }

        // --- MODIFIED BLOCK ---
        if (!stateLoaded) {
             logToPage("No valid saved state found, applying defaults and creating default object.");
             // Set default slider values by clicking reset buttons
             document.querySelectorAll('.reset-slider-btn').forEach(button => {
                 try { button.click(); } catch(e){ /* Ignore errors here */ }
             });
             // Set checkbox defaults
             gridHelperToggle.checked = true; // Default grid on
             axesHelperToggle.checked = false; // Default axes off

            // Create the default object explicitly if loading failed
            await updateObject(shapeSelect.value); // Use await

            // Trigger handlers again AFTER creating the default object to ensure styles match
            onWallColorChange();
            onFloorColorChange();
            // No need to call color/material/transform handlers here,
            // updateObject and its helpers already applied slider defaults.

            // Ensure helper visibility matches checkboxes
            gridHelper.visible = gridHelperToggle.checked;
            axesHelper.visible = axesHelperToggle.checked;

            // Final check on pose controls state (should be disabled for default sphere)
             const loadedIsPoseable = isPoseableModel(currentModelPath);
             if(openPoserBtn) openPoserBtn.disabled = !loadedIsPoseable;
             if(poseSelect) poseSelect.disabled = !loadedIsPoseable;
             if(refreshPosesBtn) refreshPosesBtn.disabled = !loadedIsPoseable;

             logToPage("Default state fully applied after failed load.");
        }
         // --- END MODIFY BLOCK ---

        // Start Animation Loop
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
    logToPage("Window resize detected.");
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
    }, 50);
}

function toggleControls() {
     // This function exists from the user's provided base file
    try {
        logToPage("Toggling controls...");
        const isCollapsed = document.body.classList.toggle('controls-collapsed');
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        const minWidthThreshold = 768;

        if (isLandscape && window.innerWidth >= minWidthThreshold) {
            toggleControlsBtn.textContent = isCollapsed ? '>>' : '<<';
        } else {
            toggleControlsBtn.textContent = isCollapsed ? 'Expand' : 'Collapse';
        }

        logToPage(`Controls ${isCollapsed ? 'collapsed' : 'expanded'}.`);
        setTimeout(onWindowResize, 150);

    } catch (error) {
        logToPage(`Error toggling controls: ${error.message}`, 'error');
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
    // This function exists from the user's provided base file
    logToPage("Resetting object state...");
    try {
        const objectControlSliderIds = [
            'modelYOffset', 'objectRotationX', 'objectRotationY', 'objectRotationZ',
            'objectScale',
            'modelColorHue', 'objectBrightness', 'objectRoughness', 'objectMetalness'
        ];
        objectControlSliderIds.forEach(id => {
             const slider = document.getElementById(id);
             const resetButton = slider?.closest('.control-group')?.querySelector(`.reset-slider-btn[data-target-slider="${id}"]`);
             if (resetButton && resetButton.click) {
                 resetButton.click();
             } else {
                 logToPage(`Could not find or click reset button for slider ${id}`, 'error');
             }
        });
        logToPage("Object state reset triggered via reset buttons.");
    } catch (e) {
         logToPage(`Error during object reset: ${e.message}`, 'error');
    }
 }

// --- Reset Scene Function ---
async function resetSceneToDefaults() {
    logToPage("Resetting scene to defaults...");
    try {
        // Reset all sliders using their reset buttons
        document.querySelectorAll('.reset-slider-btn').forEach(button => {
            try { button.click(); } catch(e) { /* ignore errors */ }
        });

        // Reset checkboxes
        gridHelperToggle.checked = true;
        axesHelperToggle.checked = false;
        gridHelper.visible = true;
        axesHelper.visible = false;

        // Reset UI toggles
        document.body.classList.remove('controls-collapsed');
        toggleControls(); // Call toggle to update button text etc.
        controls.enabled = true; // Unlock camera
        cameraLockBtn.textContent = 'Lock Camera';


        // Reset dropdown and search
        resetShapeDropdown(); // Resets search and dropdown filter
        shapeSelect.selectedIndex = 0; // Select the first item (might be Poseable or Sphere)

        // Update the object to the default selected shape
        await updateObject(shapeSelect.value); // Await ensures it finishes

        // Explicitly set default environment colors after updateObject
        onWallColorChange();
        onFloorColorChange();

        // Reset camera position and target
        camera.position.set(0, 6, 14);
        controls.target.set(0, 1, 0); // Reset target explicitly
        if (currentObject) {
            updateTargets(); // Re-target to the default object
        }
        controls.update();

        logToPage("Scene reset to defaults.", "success");

    } catch (error) {
        logToPage(`Error resetting scene: ${error.message}`, 'error');
    }
}


// --- Environment Control Handlers ---
function onFloorColorChange() {
     // This function exists from the user's provided base file
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
    // This function exists from the user's provided base file
    if (!wallHueSlider || !wallSaturationSlider || !wallBrightnessSlider) return;
    try {
        const hue = parseFloat(wallHueSlider.value);
        const saturation = parseFloat(wallSaturationSlider.value);
        const brightness = parseFloat(wallBrightnessSlider.value);
        const bgColor = new THREE.Color();
        bgColor.setHSL(hue, saturation, brightness);
        if(scene) scene.background = bgColor;
        if(sceneContainer) sceneContainer.style.backgroundColor = bgColor.getStyle();
        if(wallHueValueSpan) wallHueValueSpan.textContent = `${Math.round(hue * 360)}°`;
        if(wallSaturationValueSpan) wallSaturationValueSpan.textContent = saturation.toFixed(2);
        if(wallBrightnessValueSpan) wallBrightnessValueSpan.textContent = brightness.toFixed(2);
    } catch(e){ logToPage(`Wall/Background color error: ${e.message}`,'error')}
}


// --- Object Control Handlers ---
function onModelYOffsetChange() {
    // This function exists from the user's provided base file
    if (!currentObject || !modelYOffsetSlider || !modelYOffsetValueSpan) return;
    try {
        const offset = parseFloat(modelYOffsetSlider.value);
        modelYOffsetValueSpan.textContent = offset.toFixed(1);
        currentObject.position.y = objectBaseY + offset;
        updateTargets(); // Update targets after position change
    } catch(e){ logToPage(`Y Offset change error: ${e.message}`,'error')}
}

function onObjectRotationChange() {
    // This function exists from the user's provided base file
    if (!currentObject || !objectRotationXSlider || !objectRotationYSlider || !objectRotationZSlider) return;
    try {
        const rxDeg = parseFloat(objectRotationXSlider.value);
        const ryDeg = parseFloat(objectRotationYSlider.value);
        const rzDeg = parseFloat(objectRotationZSlider.value);
        currentObject.rotation.x = THREE.MathUtils.degToRad(rxDeg);
        currentObject.rotation.y = THREE.MathUtils.degToRad(ryDeg);
        currentObject.rotation.z = THREE.MathUtils.degToRad(rzDeg);
        updateObjectRotationDisplay();
        updateTargets(); // Update targets after rotation change
    } catch(e){ logToPage(`Rotation change error: ${e.message}`,'error')}
}

// --- ADD OPEN POSER HANDLER ---
function handleOpenPoser() {
    logToPage("Open Poser button clicked.");
    if (!currentModelPath) {
        logToPage("Cannot open poser: No model selected/loaded.", 'error');
        alert("No model selected. Please select a poseable model first.");
        return;
    }

    if (!isPoseableModel(currentModelPath)) {
        logToPage(`Cannot open poser: Model '${currentModelPath}' is not designated as poseable.`, 'warn');
        alert("The currently selected object is not a poseable model.");
        return;
    }

    // Construct the URL for the poser window
    // IMPORTANT: Use poser.html instead of glb_extractor.html
    const poserUrl = `poser.html?model=${encodeURIComponent(currentModelPath)}`;

    logToPage(`Opening poser for model: ${currentModelPath} at URL: ${poserUrl}`);

    // Open the poser in a new tab/window
    const poserWindow = window.open(poserUrl, '_blank', 'noopener,noreferrer');

    if (!poserWindow) {
        logToPage("Failed to open poser window. Pop-up blocker might be active.", 'error');
        alert("Could not open the poser window. Please check if your browser blocked the pop-up.");
    } else {
        logToPage("Poser window opened (or attempted).", "success");
    }
}
// --- END OPEN POSER HANDLER ---

function onObjectScaleChange() {
     // This function exists from the user's provided base file
    if (!currentObject || !objectScaleSlider || !objectScaleValueSpan) return;
    try {
        const scaleValue = parseFloat(objectScaleSlider.value);
        currentObject.scale.set(scaleValue, scaleValue, scaleValue);
        objectScaleValueSpan.textContent = scaleValue.toFixed(2) + 'x';
        // Recalculate center and update targets is crucial after scaling
        objectBaseY = 0; // Scale changes the base Y, needs recalculation
        const boundingBox = new THREE.Box3().setFromObject(currentObject, true);
        if (!boundingBox.isEmpty()) {
            objectBaseY = -boundingBox.min.y;
        }
        // Re-apply Y offset based on the *new* base Y
        const currentOffset = parseFloat(modelYOffsetSlider.value);
        currentObject.position.y = objectBaseY + currentOffset;
        updateTargets();
    } catch(e) {
        logToPage(`Scale change error: ${e.message}`, 'error');
    }
}

function updateObjectRotationDisplay() {
     // This function exists from the user's provided base file
    try {
         if(objectRotationXValueSpan) objectRotationXValueSpan.textContent = `${parseFloat(objectRotationXSlider.value)}°`;
         if(objectRotationYValueSpan) objectRotationYValueSpan.textContent = `${parseFloat(objectRotationYSlider.value)}°`;
         if(objectRotationZValueSpan) objectRotationZValueSpan.textContent = `${parseFloat(objectRotationZSlider.value)}°`;
    } catch(e){ logToPage(`Update rotation display error: ${e.message}`,'error')}
}

function onModelColorOrBrightnessChange() {
     // This function exists from the user's provided base file (Combined Handler)
    if (!objectMaterial || !modelColorHueSlider || !objectBrightnessSlider) return;
    try {
        const hue = parseFloat(modelColorHueSlider.value);
        const lightness = parseFloat(objectBrightnessSlider.value);
        const saturation = 0.8;
        objectMaterial.color.setHSL(hue, saturation, lightness);
        if(modelColorHueValueSpan) modelColorHueValueSpan.textContent = `${Math.round(hue * 360)}°`;
        if(objectBrightnessValueSpan) objectBrightnessValueSpan.textContent = lightness.toFixed(2);
        if (currentObject && currentObject.isGroup) {
            currentObject.traverse((child) => {
                if (child.isMesh && child.material &&
                    child.material !== objectMaterial &&
                    child.material.isMeshStandardMaterial &&
                    !child.material.wireframe)
                {
                    child.material.color.copy(objectMaterial.color);
                }
            });
        }
    } catch(e){ logToPage(`Color/Brightness change error: ${e.message}`,'error')}
}

function onObjectMaterialChange() {
     // This function exists from the user's provided base file (Combined Handler)
     if (!objectMaterial || !objectRoughnessSlider || !objectMetalnessSlider) return;
     try {
         const roughness = parseFloat(objectRoughnessSlider.value);
         const metalness = parseFloat(objectMetalnessSlider.value);
         objectMaterial.roughness = roughness;
         objectMaterial.metalness = metalness;
         if(objectRoughnessValueSpan) objectRoughnessValueSpan.textContent = roughness.toFixed(2);
         if(objectMetalnessValueSpan) objectMetalnessValueSpan.textContent = metalness.toFixed(2);
         if (currentObject && currentObject.isGroup) {
             currentObject.traverse((child) => {
                 if (child.isMesh && child.material &&
                      child.material !== objectMaterial &&
                      child.material.isMeshStandardMaterial)
                  {
                      child.material.roughness = roughness;
                      child.material.metalness = metalness;
                  }
             });
         }
     } catch(e){ logToPage(`Material properties change error: ${e.message}`,'error')}
}


// --- Light Control Handlers ---
function onLightIntensityChange() {
     // This function exists from the user's provided base file
     if (!spotLight || !lightIntensityValueSpan || !lightIntensitySlider) return;
     try {
         spotLight.intensity = parseFloat(lightIntensitySlider.value);
         lightIntensityValueSpan.textContent = spotLight.intensity.toFixed(1);
     } catch(e){ logToPage(`Intensity change error: ${e.message}`,'error')}
}

function onSpotlightParamsChange() {
    // This function exists from the user's provided base file
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
     // This function exists from the user's provided base file
     if (!spotLight || !lightVisualizer || !lightXSlider || !lightYSlider || !lightZSlider) return;
     try {
         const newX = parseFloat(lightXSlider.value);
         const newY = parseFloat(lightYSlider.value);
         const newZ = parseFloat(lightZSlider.value);
         spotLight.position.set(newX, newY, newZ);
         lightVisualizer.position.copy(spotLight.position);
         updateLightPositionDisplays();
     } catch(e){ logToPage(`Light position change error: ${e.message}`,'error')}
}

function updateLightPositionDisplays() {
    // This function exists from the user's provided base file
    try {
        if(lightXValueSpan) lightXValueSpan.textContent = parseFloat(lightXSlider.value).toFixed(1);
        if(lightYValueSpan) lightYValueSpan.textContent = parseFloat(lightYSlider.value).toFixed(1);
        if(lightZValueSpan) lightZValueSpan.textContent = parseFloat(lightZSlider.value).toFixed(1);
    } catch(e){ logToPage(`Update light display error: ${e.message}`,'error')}
}

// --- Shape Selection Handler (Using New Name) ---
async function handleShapeSelectionChange() { // Make async
    const selectedValue = shapeSelect.value;
    logToPage(`Shape selection changed to: ${selectedValue}`);

    // Disable pose controls immediately before loading starts
    if(openPoserBtn) openPoserBtn.disabled = true;
    if(poseSelect) poseSelect.disabled = true;
    if(refreshPosesBtn) refreshPosesBtn.disabled = true;
    if(poseSelect) poseSelect.innerHTML = '<option value="">Default Pose</option>'; // Clear old poses

    try {
        // Await the updateObject process which now handles async GLB loading
        await updateObject(selectedValue);

        // AFTER the object is loaded and currentModelPath might be set:
        // Re-evaluate if the newly loaded model is poseable
        const loadedIsPoseable = isPoseableModel(currentModelPath);
        logToPage(`Model loaded. Is poseable: ${loadedIsPoseable}`);

        // Enable/disable pose controls based on the *actually loaded* model
        if(openPoserBtn) openPoserBtn.disabled = !loadedIsPoseable;
        if(poseSelect) poseSelect.disabled = !loadedIsPoseable;
        if(refreshPosesBtn) refreshPosesBtn.disabled = !loadedIsPoseable;

        // Load poses *only* if the loaded model is poseable
        if (loadedIsPoseable) {
            loadPosesForModel(currentModelPath); // Load poses specific to this model
        }

    } catch (error) {
        logToPage(`Error during shape change handling: ${error.message}`, 'error');
        // Ensure controls are disabled if loading failed badly
        if(openPoserBtn) openPoserBtn.disabled = true;
        if(poseSelect) poseSelect.disabled = true;
        if(refreshPosesBtn) refreshPosesBtn.disabled = true;
        if(poseSelect) poseSelect.innerHTML = '<option value="">Default Pose</option>';
    }
}

// --- Slider Reset Handler ---
 function handleSliderReset(event) {
     // This function exists from the user's provided base file
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
    // This function exists from the user's provided base file
    logToPage("Attempting to save scene state...");
    if (!camera || !controls || !spotLight || !shapeSelect || !currentObject) {
        logToPage("Cannot save state: Core components not ready.", 'error');
        return;
    }

    try {
        const state = {
            version: 1.0,
            camera: {
                position: camera.position.toArray(),
                target: controls.target.toArray()
            },
            light: {
                intensity: parseFloat(lightIntensitySlider.value),
                angle: parseFloat(lightAngleSlider.value),
                penumbra: parseFloat(lightPenumbraSlider.value),
                position: spotLight.position.toArray()
            },
            object: {
                type: shapeSelect.value, // Save the selected value
                yOffset: parseFloat(modelYOffsetSlider.value),
                rotation: {
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
                // params: {} // TODO
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
                cameraLocked: !controls.enabled
            }
            // TODO: Add selected pose name if applicable?
             // selectedPose: (isPoseableModel(currentModelPath) && poseSelect) ? poseSelect.value : null
        };

        const stateString = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, stateString);
        logToPage("Scene state saved successfully.", "success");

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
        if (!loadedState || loadedState.version !== 1.0) {
             logToPage(`Saved state version mismatch or invalid. Expected 1.0, got ${loadedState?.version}. Ignoring.`, 'error');
             localStorage.removeItem(LOCAL_STORAGE_KEY);
             return false;
        }
        logToPage("Saved state parsed successfully.");
    } catch (error) {
        logToPage(`Error parsing saved state: ${error.message}. Clearing invalid state.`, 'error');
        console.error("Parse State Error Details:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return false;
    }

    try {
        logToPage("Applying loaded state...");

        // Apply UI Control Values FIRST
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
        controls.enabled = !loadedState.ui.cameraLocked;
        cameraLockBtn.textContent = controls.enabled ? 'Lock Camera' : 'Unlock Camera';
        if (loadedState.ui.controlsCollapsed) {
            document.body.classList.add('controls-collapsed');
        } else {
            document.body.classList.remove('controls-collapsed');
        }
        // Update toggle button text
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        const minWidthThreshold = 768;
         if (isLandscape && window.innerWidth >= minWidthThreshold) {
            toggleControlsBtn.textContent = loadedState.ui.controlsCollapsed ? '>>' : '<<';
        } else {
            toggleControlsBtn.textContent = loadedState.ui.controlsCollapsed ? 'Expand' : 'Collapse';
        }

        // Apply State to Three.js Objects / Scene
        // Camera
        camera.position.fromArray(loadedState.camera.position);
        controls.target.fromArray(loadedState.camera.target);
        controls.update();
        // Environment Colors
        onWallColorChange();
        onFloorColorChange();
        // Helper Visibility
        gridHelper.visible = loadedState.helpers.gridVisible;
        axesHelper.visible = loadedState.helpers.axesVisible;
        // Light Settings
        onLightIntensityChange();
        onSpotlightParamsChange();
        onLightPositionChange();

        // --- MODIFIED OBJECT LOADING SECTION ---
        // 1. Set the shape selector FIRST
        shapeSelect.value = loadedState.object.type;
        // Ensure the selected option exists; fallback if not
        if (shapeSelect.value !== loadedState.object.type) {
            logToPage(`Warning: Loaded shape type "${loadedState.object.type}" not found in dropdown. Using default.`, 'error');
             // Find the first available option as fallback
             const firstOption = shapeSelect.querySelector('option');
             shapeSelect.value = firstOption ? firstOption.value : 'sphere'; // Fallback
        }
        logToPage(`Shape selector set to: ${shapeSelect.value}`);

        // 2. Update the object (this awaits creation/loading)
        await updateObject(shapeSelect.value); // <<< USE AWAIT HERE

        // 3. Re-apply loaded Material & Transform AFTER updateObject finishes
        if (currentObject) {
             logToPage(`Re-applying saved transforms/materials to loaded object: ${currentObject.name}`);
            // Apply Material (overriding any defaults/randomization from updateObject)
            modelColorHueSlider.value = loadedState.object.material.hue;
            objectBrightnessSlider.value = loadedState.object.material.brightness;
            objectRoughnessSlider.value = loadedState.object.material.roughness;
            objectMetalnessSlider.value = loadedState.object.material.metalness;
            onModelColorOrBrightnessChange(); // Apply loaded H, L
            onObjectMaterialChange();       // Apply loaded R, M

            // Apply Transform
            modelYOffsetSlider.value = loadedState.object.yOffset;
            objectRotationXSlider.value = loadedState.object.rotation.x;
            objectRotationYSlider.value = loadedState.object.rotation.y;
            objectRotationZSlider.value = loadedState.object.rotation.z;
            objectScaleSlider.value = loadedState.object.scale;
            onModelYOffsetChange();         // Apply loaded Y offset
            onObjectRotationChange();       // Apply loaded rotation
            onObjectScaleChange();          // Apply loaded scale

            // Ensure targets are correct after final transforms
             updateTargets();

             // Check pose controls state AFTER loading is complete
             const loadedIsPoseable = isPoseableModel(currentModelPath);
             if(openPoserBtn) openPoserBtn.disabled = !loadedIsPoseable;
             if(poseSelect) poseSelect.disabled = !loadedIsPoseable;
             if(refreshPosesBtn) refreshPosesBtn.disabled = !loadedIsPoseable;
             if (loadedIsPoseable) {
                 loadPosesForModel(currentModelPath); // Load poses for the loaded model
                 // TODO: Potentially select a saved pose if that was part of the state?
                 // if (loadedState.object.selectedPose && poseSelect) {
                 //    poseSelect.value = loadedState.object.selectedPose;
                 //    applyPose(loadedState.object.selectedPose); // Apply the pose
                 // }
             }

        } else {
             logToPage("Warning: currentObject is null after awaited updateObject call during load.", 'error');
             // Ensure pose controls are disabled if object loading failed
             if(openPoserBtn) openPoserBtn.disabled = true;
             if(poseSelect) poseSelect.disabled = true;
             if(refreshPosesBtn) refreshPosesBtn.disabled = true;
        }
        // --- END MODIFIED SECTION ---

        // --- Dispatch Events to Update UI Spans ---
         document.querySelectorAll('#controls-container input[type="range"]').forEach(slider => {
             slider.dispatchEvent(new Event('input', { bubbles: true }));
         });
         document.querySelectorAll('#controls-container input[type="checkbox"]').forEach(checkbox => {
             checkbox.dispatchEvent(new Event('change', { bubbles: true }));
         });

        logToPage("Scene state loaded and applied successfully.", "success");
        return true;

    } catch (error) {
        logToPage(`Error applying loaded state: ${error.message}`, 'error');
        console.error("Apply State Error Details:", error);
        return false;
    }
}


// --- Animation Loop ---
function animate() {
    try {
        requestAnimationFrame(animate);
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