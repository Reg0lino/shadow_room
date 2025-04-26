// --- START OF FILE main.js ---

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

// --- EXPANDED CONSTANT ---
// List of models that should be controllable by poser.html
const POSEABLE_MODELS = [
    'models/femalebase0.glb',           // Pose pack female (A-Pose)
    'models/malebase0.glb',             // Pose pack male (A-Pose)
    'models/male_base1.glb',            // Added
    'models/male_base2.glb',            // Added
    'models/game_character_base.glb',   // Added
    'models/jumping_man.glb',           // Added
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
// Updated Key for local storage to reflect poser/localStorage workflow
const LOCAL_STORAGE_KEY = 'dynamicPoseExplorerState_v3_0_poser'; // Keeping v3.0 as state format is same

// --- Global Variables ---
let scene, camera, renderer, controls;
let spotLight, lightTarget, lightVisualizer;
let floor, gridHelper, axesHelper; // axesHelper itself remains for visibility control
// --- REVISED sceneObjects Structure ---
let sceneObjects = []; // Array holds { uuid, originalType, objectType, object3D, isPoseable, baseScale, initialBoneState, appliedPoseName }
let selectedObjectUUID = null;
let objectMaterial;
let floorBaseMaterial;
let originalShapeOptions = [];
let openPoserBtn;
let poseSelect;
let refreshPosesBtn; // Button to refresh pose list from localStorage
let focusCameraBtn;
let decoupleCameraBtn;
let isCameraDecoupled = false;
let raycaster;

// --- Free Look Camera State Variables ---
let isDraggingFreeLook = false;
let previousMousePosition = { x: 0, y: 0 };
const freeLookSensitivity = 0.002;

// --- DOM Elements ---
let sceneContainer, controlsContainer, toggleControlsBtn, shapeSelect, shapeSearchInput, refreshShapeListBtn, copyLogBtn;
let cameraLockBtn, gridHelperToggle;
let resetObjectBtn;
let saveStateBtn, loadStateBtn, resetSceneBtn; // Refs kept
let objectListElement;
// Environment Sliders
let wallHueSlider, wallHueValueSpan, wallSaturationSlider, wallSaturationValueSpan, wallBrightnessSlider, wallBrightnessValueSpan;
let floorHueSlider, floorHueValueSpan, floorSaturationSlider, floorSaturationValueSpan, floorBrightnessSlider, floorBrightnessValueSpan;
// Object Sliders
let modelYOffsetSlider, modelYOffsetValueSpan;
let objectXPositionSlider, objectXPositionValueSpan;
let objectZPositionSlider, objectZPositionValueSpan;
let objectRotationXSlider, objectRotationXValueSpan, objectRotationYSlider, objectRotationYValueSpan, objectRotationZSlider, objectRotationZValueSpan;
let objectScaleSlider, objectScaleValueSpan; // Represents RELATIVE scale
let modelColorHueSlider, modelColorHueValueSpan, objectBrightnessSlider, objectBrightnessValueSpan;
let objectRoughnessSlider, objectRoughnessValueSpan, objectMetalnessSlider, objectMetalnessValueSpan;
// Light Sliders
let lightIntensitySlider, lightIntensityValueSpan, lightAngleSlider, lightAngleValueSpan, lightPenumbraSlider, lightPenumbraValueSpan;
let lightXSlider, lightYSlider, lightZSlider, lightXValueSpan, lightYValueSpan, lightZValueSpan;
// Pose controls
let poserControlsDiv;
let boneHierarchyContainer;


// --- Shape Creation Mapping (Unchanged) ---
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
            return creationFunc(s, matClone);
        } catch (error) {
            logToPage(`Shape Creation Error (${shapeType}): ${error.message}\n${error.stack}`, 'error');
            return Primitives.createSphereGeometry(s);
        }
    } else {
        logToPage(`Unknown shape type in map: ${shapeType}`, 'error');
        return Primitives.createSphereGeometry(s);
    }
}

function getSelectedObjectData() {
    if (!selectedObjectUUID) return null;
    return sceneObjects.find(obj => obj.uuid === selectedObjectUUID) || null;
}

function getSelectedObject3D() {
    const selectedData = getSelectedObjectData();
    return selectedData ? selectedData.object3D : null;
}

function calculateObjectBaseY(object) {
    if (!object) return 0;
    object.updateMatrixWorld(true);
    const boundingBox = new THREE.Box3().setFromObject(object, true);
    let base = 0;
    if (!boundingBox.isEmpty() && !boundingBox.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0, 0, 0))) {
        base = -boundingBox.min.y;
    } else {
        base = object.position.y;
        // logToPage(`Warning: calculateObjectBaseY fallback for object ${object.uuid}. BBox empty/zero.`, 'warn');
    }
    return base;
}

function isPoseableModel(modelPath) {
    if (!modelPath || typeof modelPath !== 'string') return false;
    return POSEABLE_MODELS.includes(modelPath) && modelPath.toLowerCase().endsWith('.glb');
}

// --- REVISED processLoadedGltf (Simplified Scaling) ---
// Handles scaling consistently and initial bone state capture.
// Returns an object with { modelGroup, baseScale (final), isPoseable, initialBoneState }
function processLoadedGltf(gltf, targetHeight, modelPath) {
    try {
        logToPage(`Processing GLTF data for ${modelPath}...`);
        const modelGroup = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!modelGroup) throw new Error("Loaded GLTF has no scene data.");

        // --- Base Scale Calculation (Height-based for ALL models) ---
        let finalBaseScale = 1.0;
        const box = new THREE.Box3().setFromObject(modelGroup);
        const size = box.getSize(new THREE.Vector3());
        if (size.y > 0.001) {
            finalBaseScale = targetHeight / size.y;
            logToPage(`Target height base scale calculated: ${finalBaseScale.toFixed(3)} for ${modelPath}`);
        } else {
            finalBaseScale = 1.0; // Fallback if height is zero
            logToPage(`Model ${modelPath} has zero/small height, using base scale 1.0.`, 'warn');
        }

        // --- Apply Final Scale ---
        modelGroup.scale.set(finalBaseScale, finalBaseScale, finalBaseScale);
        modelGroup.updateMatrixWorld(true); // IMPORTANT: Update world matrix after scaling

        // --- Shadows & Materials ---
        modelGroup.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // --- Check Poseability & Capture Initial Bone State ---
        const isDesignatedPoseable = isPoseableModel(modelPath); // Use the helper from updated POSEABLE_MODELS
        let initialBoneState = null;
        if (isDesignatedPoseable) {
            initialBoneState = [];
            modelGroup.traverse((child) => {
                if (child.isBone) {
                    initialBoneState.push({
                        name: child.name,
                        position: child.position.clone(),
                        quaternion: child.quaternion.clone(),
                        scale: child.scale.clone()
                    });
                }
            });
            logToPage(`Model is poseable. Captured initial state for ${initialBoneState.length} bones.`);
        } else {
            logToPage(`Model ${modelPath} is not in POSEABLE_MODELS list. Skipping initial bone state capture.`);
        }

        logToPage(`Finished processing GLTF for ${modelPath}. Poseable: ${isDesignatedPoseable}, Final BaseScale: ${finalBaseScale.toFixed(3)}`, 'success');

        // Return relevant data
        return {
            modelGroup,
            baseScale: finalBaseScale, // Store the final applied scale
            isPoseable: isDesignatedPoseable,
            initialBoneState: initialBoneState // null if not poseable
        };

    } catch (processingError) {
        logToPage(`Error processing GLTF for ${modelPath}: ${processingError.message}`, 'error');
        console.error(processingError);
        return { modelGroup: null, baseScale: 1.0, isPoseable: false, initialBoneState: null };
    }
}


async function loadGLBModel(source, targetHeight = 3.0) {
    const loader = new GLTFLoader();
    const isData = source instanceof ArrayBuffer;
    const sourceDesc = isData ? 'pose data buffer' : source;
    logToPage(`Loading GLB model from ${sourceDesc}...`);

    return new Promise((resolve, reject) => {
        const onLoad = (gltf) => {
            try {
                const modelPathForProcessing = isData ? 'loaded_from_data.glb' : source;
                const processedData = processLoadedGltf(gltf, targetHeight, modelPathForProcessing);

                if (!processedData.modelGroup) {
                     reject(new Error(`GLTF processing failed for ${sourceDesc}`));
                     return;
                }
                resolve(processedData);

            } catch (processingError) { reject(processingError); }
        };

        const onError = (error) => {
            const errorMsg = error.message || JSON.stringify(error);
            logToPage(`Failed load/parse GLB ${sourceDesc}: ${errorMsg}`, 'error'); console.error(error);
            reject(new Error(`GLB Load/Parse Error: ${errorMsg}`));
        };

        if (isData) { loader.parse(source, '', onLoad, onError); }
        else { loader.load(source, onLoad, undefined, onError); }

    }).catch(error => {
        logToPage(`GLB load/process failed for ${sourceDesc}. Creating fallback box. Error: ${error.message}`, 'error');
        const fallbackGeo = Primitives.createCubeGeometry(1.0);
        const mat = objectMaterial || new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const fallbackMesh = new THREE.Mesh(fallbackGeo, mat.clone());
        fallbackMesh.castShadow = true; fallbackMesh.receiveShadow = true; fallbackMesh.name = "Fallback Cube";
        const fallbackGroup = new THREE.Group(); fallbackGroup.add(fallbackMesh);
        return {
             modelGroup: fallbackGroup,
             baseScale: 1.0,
             isPoseable: false,
             initialBoneState: null
        };
    });
}


// --- applyPoseData (Applies bone transforms from an array) ---
function applyPoseData(modelGroup, poseDataArray) {
    if (!modelGroup || !poseDataArray || !Array.isArray(poseDataArray)) {
        logToPage("applyPoseData: Invalid input (modelGroup or poseDataArray).", "error");
        return false;
    }
    const isInitialState = poseDataArray.length > 0 && poseDataArray[0].position instanceof THREE.Vector3;
    const sourceDesc = isInitialState ? "initial state" : "saved pose data";
    logToPage(`Applying pose from ${sourceDesc} (${poseDataArray.length} bones)...`);

    let appliedCount = 0;
    let notFoundCount = 0;
    let success = true;
    const boneMap = new Map();
    modelGroup.traverse(child => { if (child.isBone) boneMap.set(child.name, child); });

    poseDataArray.forEach(boneData => {
        const targetBone = boneMap.get(boneData.name);
        if (targetBone) {
            try {
                if (isInitialState) {
                    targetBone.position.copy(boneData.position);
                    targetBone.quaternion.copy(boneData.quaternion);
                    targetBone.scale.copy(boneData.scale);
                } else {
                    if (boneData.position) targetBone.position.fromArray(boneData.position);
                    if (boneData.quaternion) targetBone.quaternion.fromArray(boneData.quaternion);
                    if (boneData.scale) targetBone.scale.fromArray(boneData.scale);
                }
                appliedCount++;
            } catch (e) {
                logToPage(`Error applying transform to bone '${boneData.name}': ${e.message}`, 'error');
                success = false;
            }
        } else {
            notFoundCount++;
        }
    });

    modelGroup.updateMatrixWorld(true);
    modelGroup.traverse(object => { if (object.isSkinnedMesh && object.skeleton) object.skeleton.update(); });

    if (notFoundCount > 0) logToPage(`Pose apply warning: ${notFoundCount} bone(s) from pose data not found in the current model.`, 'warn');
    logToPage(`Pose application from ${sourceDesc} finished. Applied: ${appliedCount}, NotFound: ${notFoundCount}. Success: ${success}`, success ? 'info' : 'warn');
    return success;
}


// --- populatePoseDropdown (Reads from localStorage) ---
function populatePoseDropdown(sceneObjectData) {
    if (!poseSelect || !sceneObjectData || !sceneObjectData.isPoseable || !sceneObjectData.initialBoneState) {
        if(poseSelect) {
             poseSelect.innerHTML = '<option value="" disabled>Pose N/A</option>';
             poseSelect.disabled = true;
        }
        return;
    }

    const modelPath = sceneObjectData.originalType;
    const localStorageKey = `poses_${modelPath}`;
    logToPage(`Populating pose dropdown for ${modelPath} from localStorage key: ${localStorageKey}`);
    poseSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'A-Pose / Default';
    poseSelect.appendChild(defaultOption);

    let savedPoses = null;
    try {
        const savedPosesJSON = localStorage.getItem(localStorageKey);
        if (savedPosesJSON) savedPoses = JSON.parse(savedPosesJSON);
        if (typeof savedPoses !== 'object' || savedPoses === null) {
            logToPage(`Invalid data in localStorage for ${localStorageKey}. Resetting.`, 'warn');
            savedPoses = null; localStorage.removeItem(localStorageKey);
        }
    } catch (error) { logToPage(`Error reading poses from localStorage ${localStorageKey}: ${error.message}`, 'error'); savedPoses = null; }

    if (savedPoses) {
        const poseNames = Object.keys(savedPoses).sort((a, b) => a.localeCompare(b));
        if (poseNames.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'User Saved Poses';
            poseNames.forEach(poseName => {
                const option = document.createElement('option');
                option.value = poseName; option.textContent = poseName;
                optgroup.appendChild(option);
            });
            poseSelect.appendChild(optgroup);
            logToPage(`Added ${poseNames.length} saved poses to dropdown.`);
        } else logToPage(`No saved poses found in localStorage for ${modelPath}.`);
    }

    poseSelect.value = sceneObjectData.appliedPoseName || '';
    poseSelect.disabled = false;
}


function resetObjectTransforms() {
    if (objectRotationXSlider) objectRotationXSlider.value = 0;
    if (objectRotationYSlider) objectRotationYSlider.value = 0;
    if (objectRotationZSlider) objectRotationZSlider.value = 0;
    if (objectScaleSlider) objectScaleSlider.value = 1.0;
    if (modelYOffsetSlider) modelYOffsetSlider.value = 0;
    if (objectXPositionSlider) objectXPositionSlider.value = 0;
    if (objectZPositionSlider) objectZPositionSlider.value = 0;
    logToPage("Object transform sliders reset to defaults (Pos 0, Rot 0, Relative Scale 1).");

    const selectedObjData = getSelectedObjectData();
    const selectedObj3D = selectedObjData?.object3D;

    if (selectedObj3D && selectedObjData) {
        const baseOffsetY = calculateObjectBaseY(selectedObj3D);
        selectedObj3D.position.set(0, baseOffsetY, 0);
        selectedObj3D.rotation.set(0, 0, 0);
        selectedObj3D.quaternion.setFromEuler(selectedObj3D.rotation);

        const baseScale = selectedObjData.baseScale || 1.0;
        selectedObj3D.scale.set(baseScale, baseScale, baseScale);

        if (selectedObjData.isPoseable && selectedObjData.initialBoneState) {
            logToPage(`Resetting pose for object ${selectedObjectUUID} to initial state.`);
            applyPoseData(selectedObj3D, selectedObjData.initialBoneState);
            selectedObjData.appliedPoseName = '';
            if (poseSelect) poseSelect.value = '';
        }

        updateSliderValuesFromObject(selectedObj3D);
        updateTargets();
        logToPage(`Object ${selectedObjectUUID} transforms and pose reset.`, 'success');
    } else {
        logToPage("Reset Object Transform: No object selected.", "warn");
    }
}

function resetObjectState() { resetObjectTransforms(); }

function updateTargets() { /* ... unchanged ... */ const selectedObj3D = getSelectedObject3D(); const targetObject = selectedObj3D || new THREE.Object3D(); if (!lightTarget || !controls || !spotLight) return; const worldCenter = new THREE.Vector3(); try { targetObject.updateMatrixWorld(true); const finalBounds = new THREE.Box3().setFromObject(targetObject, true); if (!finalBounds.isEmpty() && !finalBounds.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0,0,0))) { finalBounds.getCenter(worldCenter); } else { worldCenter.copy(targetObject.position); const scaleY = targetObject.scale ? targetObject.scale.y : 1.0; worldCenter.y += Math.min(0.5 * scaleY, 1.0); if (selectedObj3D) { /* log warning */ } else { worldCenter.set(0, 1, 0); } } } catch (e) { if(selectedObj3D) logToPage(`Target calculation error: ${e.message}. Using object position fallback.`, 'error'); worldCenter.copy(targetObject.position); if (!selectedObj3D) worldCenter.set(0,1,0); } lightTarget.position.copy(worldCenter); spotLight.target.updateMatrixWorld(); if (lightVisualizer && spotLight) lightVisualizer.position.copy(spotLight.position); if (!isCameraDecoupled) controls.target.copy(worldCenter); }

function updateSliderValuesFromObject(object) { /* ... unchanged ... */ const selectedObjData = getSelectedObjectData(); if (!object || !selectedObjData) { if (modelYOffsetSlider) modelYOffsetSlider.value = 0; if (modelYOffsetValueSpan) modelYOffsetValueSpan.textContent = '0.0'; if (objectXPositionSlider) objectXPositionSlider.value = 0; if (objectXPositionValueSpan) objectXPositionValueSpan.textContent = '0.0'; if (objectZPositionSlider) objectZPositionSlider.value = 0; if (objectZPositionValueSpan) objectZPositionValueSpan.textContent = '0.0'; if (objectRotationXSlider) objectRotationXSlider.value = 0; if (objectRotationYSlider) objectRotationYSlider.value = 0; if (objectRotationZSlider) objectRotationZSlider.value = 0; updateObjectRotationDisplay(); if (objectScaleSlider) objectScaleSlider.value = 1.0; if (objectScaleValueSpan) objectScaleValueSpan.textContent = '1.00x'; return; } const currentBaseY = calculateObjectBaseY(object); const currentYOffset = object.position.y - currentBaseY; if (modelYOffsetSlider) modelYOffsetSlider.value = currentYOffset; if (modelYOffsetValueSpan) modelYOffsetValueSpan.textContent = currentYOffset.toFixed(1); if (objectXPositionSlider) objectXPositionSlider.value = object.position.x; if (objectXPositionValueSpan) objectXPositionValueSpan.textContent = object.position.x.toFixed(1); if (objectZPositionSlider) objectZPositionSlider.value = object.position.z; if (objectZPositionValueSpan) objectZPositionValueSpan.textContent = object.position.z.toFixed(1); const euler = new THREE.Euler().setFromQuaternion(object.quaternion, 'YXZ'); if (objectRotationXSlider) objectRotationXSlider.value = THREE.MathUtils.radToDeg(euler.x); if (objectRotationYSlider) objectRotationYSlider.value = THREE.MathUtils.radToDeg(euler.y); if (objectRotationZSlider) objectRotationZSlider.value = THREE.MathUtils.radToDeg(euler.z); updateObjectRotationDisplay(); const baseScale = selectedObjData.baseScale || 1.0; const actualScale = object.scale.x; const relativeScale = baseScale !== 0 ? actualScale / baseScale : 1.0; if (objectScaleSlider) objectScaleSlider.value = relativeScale; if (objectScaleValueSpan) objectScaleValueSpan.textContent = relativeScale.toFixed(2) + 'x'; let representativeMaterial = null; if (object.isMesh && object.material?.isMeshStandardMaterial) representativeMaterial = object.material; else if (object.isGroup) object.traverse((child) => { if (!representativeMaterial && child.isMesh && child.material?.isMeshStandardMaterial) representativeMaterial = child.material; if (!representativeMaterial && child.isMesh && Array.isArray(child.material)) representativeMaterial = child.material.find(m => m?.isMeshStandardMaterial); }); if (representativeMaterial) { if (!representativeMaterial.map) { const hsl = { h: 0, s: 0, l: 0 }; representativeMaterial.color.getHSL(hsl); if (modelColorHueSlider) modelColorHueSlider.value = hsl.h; if (objectBrightnessSlider) objectBrightnessSlider.value = hsl.l; if (modelColorHueValueSpan) modelColorHueValueSpan.textContent = `${Math.round(hsl.h * 360)}°`; if (objectBrightnessValueSpan) objectBrightnessValueSpan.textContent = hsl.l.toFixed(2); } if (objectRoughnessSlider) objectRoughnessSlider.value = representativeMaterial.roughness; if (objectMetalnessSlider) objectMetalnessSlider.value = representativeMaterial.metalness; if (objectRoughnessValueSpan) objectRoughnessValueSpan.textContent = representativeMaterial.roughness.toFixed(2); if (objectMetalnessValueSpan) objectMetalnessValueSpan.textContent = representativeMaterial.metalness.toFixed(2); } }

// --- updateObject (Handles GLB/Primitive creation) ---
async function updateObject(requestedShapeType) {
    logToPage(`Creating/Loading object definition for: ${requestedShapeType}`);
    const s = 1.5;

    if (!objectMaterial) { logToPage("CRITICAL ERROR: objectMaterial not initialized!", 'error'); return null; }

    let newObject = null; let createdObjectType = 'primitive';
    let baseScale = 1.0; let isPoseable = false; let initialBoneState = null;
    const isGlb = typeof requestedShapeType === 'string' && requestedShapeType.toLowerCase().endsWith('.glb');

    try {
        if (isGlb) {
            createdObjectType = 'glb';
            logToPage(`Preparing to load GLB model: ${requestedShapeType}`);
            const loadedData = await loadGLBModel(requestedShapeType);
            if (!loadedData || !loadedData.modelGroup) throw new Error(`Failed to load or process GLB: ${requestedShapeType}`);
            newObject = loadedData.modelGroup; baseScale = loadedData.baseScale; isPoseable = loadedData.isPoseable; initialBoneState = loadedData.initialBoneState;
        } else {
            createdObjectType = 'primitive';
            logToPage(`Creating geometric shape: ${requestedShapeType}`);
            const isWireframe = requestedShapeType.startsWith('wireframe_');
            const baseShapeType = isWireframe ? requestedShapeType.substring('wireframe_'.length) : requestedShapeType;
            const primitiveMaterial = objectMaterial.clone();
            const randomHue = Math.random();
            primitiveMaterial.color.setHSL(randomHue, 0.8, parseFloat(objectBrightnessSlider?.value || 0.5));
            logToPage(`Randomized primitive hue: ${Math.round(randomHue * 360)}°`);
            let createdItem = createObject(baseShapeType, s, () => primitiveMaterial);
            if (!createdItem) throw new Error(`Shape creation function for ${baseShapeType} returned null!`);
            if (createdItem instanceof THREE.BufferGeometry) {
                if (isWireframe) primitiveMaterial.wireframe = true;
                newObject = new THREE.Mesh(createdItem, primitiveMaterial);
                newObject.castShadow = true; newObject.receiveShadow = true;
                createdObjectType = 'primitive_mesh';
            } else if (createdItem instanceof THREE.Group) {
                newObject = createdItem; createdObjectType = 'primitive_group';
                newObject.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; if (!child.material || child.material === objectMaterial) child.material = primitiveMaterial; else if (Array.isArray(child.material)) child.material = child.material.map(m => (!m || m === objectMaterial) ? primitiveMaterial : m); /* Apply wireframe if needed */ } });
            } else throw new Error(`Shape function for ${baseShapeType} returned unexpected type: ${typeof createdItem}`);
            baseScale = 1.0; isPoseable = false; initialBoneState = null;
        }
        if (!newObject) throw new Error("Object creation/loading resulted in null.");
        logToPage(`updateObject successful for type: ${requestedShapeType}`);
        return { object3D: newObject, objectType: createdObjectType, originalType: requestedShapeType, baseScale, isPoseable, initialBoneState, appliedPoseName: '' };
    } catch (creationError) {
        logToPage(`Failed inside updateObject for ${requestedShapeType}: ${creationError.message}`, 'error');
        console.error(creationError); return null;
    }
}


// --- DOM & Control Setup ---
function getDOMElements() { /* ... unchanged, assigns all DOM element vars ... */ logToPage("Getting DOM elements..."); sceneContainer = document.getElementById('scene-container'); controlsContainer = document.getElementById('controls-container'); toggleControlsBtn = document.getElementById('toggleControlsBtn'); shapeSelect = document.getElementById('shapeSelect'); shapeSearchInput = document.getElementById('shapeSearch'); refreshShapeListBtn = document.getElementById('refreshShapeListBtn'); copyLogBtn = document.getElementById('copyLogBtn'); cameraLockBtn = document.getElementById('cameraLockBtn'); gridHelperToggle = document.getElementById('gridHelperToggle'); resetObjectBtn = document.getElementById('resetObjectBtn'); saveStateBtn = document.getElementById('saveStateBtn'); loadStateBtn = document.getElementById('loadStateBtn'); resetSceneBtn = document.getElementById('resetSceneBtn'); wallHueSlider = document.getElementById('wallHue'); wallHueValueSpan = document.getElementById('wallHueValue'); wallSaturationSlider = document.getElementById('wallSaturation'); wallSaturationValueSpan = document.getElementById('wallSaturationValue'); wallBrightnessSlider = document.getElementById('wallBrightness'); wallBrightnessValueSpan = document.getElementById('wallBrightnessValue'); floorHueSlider = document.getElementById('floorHue'); floorHueValueSpan = document.getElementById('floorHueValue'); floorSaturationSlider = document.getElementById('floorSaturation'); floorSaturationValueSpan = document.getElementById('floorSaturationValue'); floorBrightnessSlider = document.getElementById('floorBrightness'); floorBrightnessValueSpan = document.getElementById('floorBrightnessValue'); modelYOffsetSlider = document.getElementById('modelYOffset'); modelYOffsetValueSpan = document.getElementById('modelYOffsetValue'); objectXPositionSlider = document.getElementById('objectXPosition'); objectXPositionValueSpan = document.getElementById('objectXPositionValue'); objectZPositionSlider = document.getElementById('objectZPosition'); objectZPositionValueSpan = document.getElementById('objectZPositionValue'); objectRotationXSlider = document.getElementById('objectRotationX'); objectRotationXValueSpan = document.getElementById('objectRotationXValue'); objectRotationYSlider = document.getElementById('objectRotationY'); objectRotationYValueSpan = document.getElementById('objectRotationYValue'); objectRotationZSlider = document.getElementById('objectRotationZ'); objectRotationZValueSpan = document.getElementById('objectRotationZValue'); objectScaleSlider = document.getElementById('objectScale'); objectScaleValueSpan = document.getElementById('objectScaleValue'); modelColorHueSlider = document.getElementById('modelColorHue'); modelColorHueValueSpan = document.getElementById('modelColorHueValue'); objectBrightnessSlider = document.getElementById('objectBrightness'); objectBrightnessValueSpan = document.getElementById('objectBrightnessValue'); objectRoughnessSlider = document.getElementById('objectRoughness'); objectRoughnessValueSpan = document.getElementById('objectRoughnessValue'); objectMetalnessSlider = document.getElementById('objectMetalness'); objectMetalnessValueSpan = document.getElementById('objectMetalnessValue'); lightIntensitySlider = document.getElementById('lightIntensity'); lightIntensityValueSpan = document.getElementById('lightIntensityValue'); lightAngleSlider = document.getElementById('lightAngle'); lightAngleValueSpan = document.getElementById('lightAngleValue'); lightPenumbraSlider = document.getElementById('lightPenumbra'); lightPenumbraValueSpan = document.getElementById('lightPenumbraValue'); lightXSlider = document.getElementById('lightX'); lightXValueSpan = document.getElementById('lightXValue'); lightYSlider = document.getElementById('lightY'); lightYValueSpan = document.getElementById('lightYValue'); lightZSlider = document.getElementById('lightZ'); lightZValueSpan = document.getElementById('lightZValue'); openPoserBtn = document.getElementById('openPoserBtn'); poseSelect = document.getElementById('poseSelect'); refreshPosesBtn = document.getElementById('refreshPosesBtn'); objectListElement = document.getElementById('objectList'); focusCameraBtn = document.getElementById('focusCameraBtn'); decoupleCameraBtn = document.getElementById('decoupleCameraBtn'); logToPage("DOM elements assigned."); if (!sceneContainer || !controlsContainer || !shapeSelect || !objectListElement || !poseSelect) throw new Error("Essential DOM elements missing!"); }

// --- Shape Dropdown Handling (Unchanged) ---
function storeOriginalOptions() { /* ... */ if (!shapeSelect) return; logToPage("Storing original shape options..."); try { originalShapeOptions = Array.from(shapeSelect.options).map(opt => ({ value: opt.value, text: opt.text, styleDisplay: opt.style.display || '' })); logToPage(`Stored ${originalShapeOptions.length} options.`); } catch (e) { logToPage(`Error storing options: ${e.message}`, 'error'); } }
function filterShapeDropdown() { /* ... */ if (!shapeSelect || !shapeSearchInput || !originalShapeOptions) return; const searchTerm = shapeSearchInput.value.toLowerCase().trim().replace(/_/g, ' '); const currentSelectedValue = shapeSelect.value; let newSelectedIndex = -1; let firstValidIndex = -1; shapeSelect.innerHTML = ''; let foundCount = 0; originalShapeOptions.forEach((optData) => { if (optData.styleDisplay === 'none') return; const matches = searchTerm === '' || optData.value.toLowerCase().replace(/_/g, ' ').includes(searchTerm) || optData.text.toLowerCase().includes(searchTerm); if (matches) { const newOption = document.createElement('option'); newOption.value = optData.value; newOption.textContent = optData.text; shapeSelect.appendChild(newOption); const newOptionIndexInDropdown = shapeSelect.options.length - 1; if (firstValidIndex === -1) firstValidIndex = newOptionIndexInDropdown; if (optData.value === currentSelectedValue) newSelectedIndex = newOptionIndexInDropdown; foundCount++; } }); if (shapeSelect.options.length === 0) { const noResultOption = document.createElement('option'); noResultOption.textContent = "No matches found"; noResultOption.disabled = true; shapeSelect.appendChild(noResultOption); } else if (newSelectedIndex !== -1) { shapeSelect.selectedIndex = newSelectedIndex; } else if (firstValidIndex !== -1) { shapeSelect.selectedIndex = firstValidIndex; } else { shapeSelect.selectedIndex = -1; } }
function resetShapeDropdown() { /* ... */ if (!shapeSearchInput || !shapeSelect) return; logToPage("Resetting shape dropdown."); shapeSearchInput.value = ''; const currentVal = shapeSelect.value; filterShapeDropdown(); shapeSelect.value = currentVal; if (shapeSelect.selectedIndex === -1 && shapeSelect.options.length > 0 && !shapeSelect.options[0].disabled) { shapeSelect.selectedIndex = 0; } }

// --- OBJECT MANAGEMENT FUNCTIONS ---
function populateObjectList() { /* ... unchanged ... */ if (!objectListElement) return; objectListElement.innerHTML = ''; if (sceneObjects.length === 0) { const placeholder = document.createElement('li'); placeholder.textContent = '(No objects in scene)'; placeholder.classList.add('placeholder'); objectListElement.appendChild(placeholder); return; } sceneObjects.forEach((objData, index) => { const li = document.createElement('li'); li.dataset.uuid = objData.uuid; const nameSpan = document.createElement('span'); nameSpan.classList.add('object-name'); let displayName = objData.originalType.split('/').pop().replace('.glb', '').replace(/_/g, ' '); if (displayName.startsWith('apply pose:')) displayName = displayName.substring('apply pose:'.length).trim() + ' (Posed)'; displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1); displayName += `_${index}`; nameSpan.textContent = displayName; nameSpan.title = objData.originalType; li.appendChild(nameSpan); const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'X'; deleteBtn.title = `Delete ${displayName}`; deleteBtn.classList.add('delete-object-btn'); deleteBtn.addEventListener('click', (event) => { event.stopPropagation(); deleteObject(objData.uuid); }); li.appendChild(deleteBtn); li.addEventListener('click', () => selectObject(objData.uuid)); if (objData.uuid === selectedObjectUUID) li.classList.add('selected'); objectListElement.appendChild(li); }); }
function deleteObject(uuid) { /* ... unchanged ... */ const idx = sceneObjects.findIndex(obj => obj.uuid === uuid); if (idx === -1) { logToPage(`Delete Object: UUID ${uuid} not found.`, 'warn'); return; } const objData = sceneObjects[idx]; logToPage(`Deleting object: ${uuid} (${objData.originalType})`); if (objData.object3D && objData.object3D.parent) objData.object3D.parent.remove(objData.object3D); if (objData.object3D) objData.object3D.traverse(child => { if (child.isMesh) { child.geometry?.dispose(); if (child.material) { if (Array.isArray(child.material)) child.material.forEach(mat => mat?.dispose()); else child.material.dispose(); } } }); logToPage(`Disposed geo/mat for ${uuid}.`); sceneObjects.splice(idx, 1); logToPage(`Removed data for ${uuid}.`); if (selectedObjectUUID === uuid) selectObject(null); else { populateObjectList(); if (sceneObjects.length === 0) updateTargets(); } }

// --- selectObject (Handles poser state) ---
function selectObject(uuidToSelect) {
    if (selectedObjectUUID === uuidToSelect) return;

    selectedObjectUUID = uuidToSelect;
    populateObjectList(); // Update list highlighting

    const selectedObjData = getSelectedObjectData();

    if (selectedObjData?.object3D) {
        logToPage(`Selected object: ${selectedObjectUUID} (${selectedObjData.originalType})`);
        updateTargets();

        // Enable pose controls ONLY if model is in POSEABLE_MODELS and has initial bone state
        const enablePoseControls = selectedObjData.isPoseable && selectedObjData.initialBoneState;

        if (openPoserBtn) openPoserBtn.disabled = !enablePoseControls;
        if (poseSelect) poseSelect.disabled = !enablePoseControls;
        if (refreshPosesBtn) refreshPosesBtn.disabled = !enablePoseControls;

        if (enablePoseControls) {
            logToPage("Poseable object selected. Populating pose dropdown from localStorage.");
            populatePoseDropdown(selectedObjData); // Populate dropdown
        } else {
             logToPage("Non-poseable object selected.");
             if(poseSelect) {
                poseSelect.innerHTML = '<option value="" disabled>Pose N/A</option>';
                poseSelect.disabled = true;
             }
        }
        updateSliderValuesFromObject(selectedObjData.object3D);

    } else { // Deselection
        if (uuidToSelect) logToPage(`SelectObject: UUID ${uuidToSelect} not found. Deselecting.`, 'warn');
        else logToPage("Object deselected.");
        selectedObjectUUID = null;
        if(openPoserBtn) openPoserBtn.disabled = true;
        if(poseSelect) poseSelect.disabled = true;
        if(refreshPosesBtn) refreshPosesBtn.disabled = true;
        if(poseSelect) poseSelect.innerHTML = '<option value="" disabled>No Object Selected</option>';
        updateSliderValuesFromObject(null); // Reset sliders visually
        updateTargets();
    }
}


// --- Initialization ---
async function init() {
    try {
        logToPage("Init started...");
        getDOMElements();
        storeOriginalOptions();

        scene = new THREE.Scene();
        raycaster = new THREE.Raycaster(); raycaster.layers.set(INTERACTION_LAYER);
        const aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
        camera = new THREE.PerspectiveCamera(60, aspect > 0 ? aspect : 1, 0.1, 100); camera.layers.enableAll();
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
        sceneContainer.appendChild(renderer.domElement);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); scene.add(ambientLight);
        spotLight = new THREE.SpotLight(0xffffff, 1.0, 150, 1.0, 0, 1);
        spotLight.castShadow = true; spotLight.shadow.mapSize.width = 1024; spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 0.5; spotLight.shadow.camera.far = 50; spotLight.shadow.bias = -0.001;
        scene.add(spotLight);
        lightTarget = new THREE.Object3D(); scene.add(lightTarget); spotLight.target = lightTarget;
        const lightSphereGeometry = new THREE.SphereGeometry(0.2, 16, 8);
        const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        lightVisualizer = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial); scene.add(lightVisualizer);
        const floorGeometry = new THREE.PlaneGeometry(40, 40);
        floorBaseMaterial = { roughness: 0.9, metalness: 0.1 };
        const floorMaterial = new THREE.MeshStandardMaterial({ ...floorBaseMaterial, color: 0x808080 });
        floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; floor.position.y = 0; floor.receiveShadow = true; scene.add(floor);
        gridHelper = new THREE.GridHelper(40, 40, 0x888888, 0x444444); scene.add(gridHelper);
        axesHelper = new THREE.AxesHelper(3); scene.add(axesHelper); axesHelper.visible = false;
        controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.05; controls.screenSpacePanning = false; controls.maxPolarAngle = Math.PI / 2 - 0.01; controls.minDistance = 0.5; controls.maxDistance = 50; controls.enableRotate = true; controls.update();
        objectMaterial = new THREE.MeshStandardMaterial({ color: 0x3399ff, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide });

        // --- Event Listeners ---
        window.addEventListener('resize', onWindowResize, false);
        toggleControlsBtn.addEventListener('click', toggleControls);
        refreshShapeListBtn.addEventListener('click', resetShapeDropdown);
        cameraLockBtn.addEventListener('click', toggleCameraLock);
        gridHelperToggle.addEventListener('change', () => { gridHelper.visible = gridHelperToggle.checked; });
        resetObjectBtn.addEventListener('click', resetObjectState);
        wallHueSlider.addEventListener('input', onWallColorChange); wallSaturationSlider.addEventListener('input', onWallColorChange); wallBrightnessSlider.addEventListener('input', onWallColorChange);
        floorHueSlider.addEventListener('input', onFloorColorChange); floorSaturationSlider.addEventListener('input', onFloorColorChange); floorBrightnessSlider.addEventListener('input', onFloorColorChange);
        modelYOffsetSlider.addEventListener('input', onModelYOffsetChange); objectXPositionSlider.addEventListener('input', onObjectXPositionChange); objectZPositionSlider.addEventListener('input', onObjectZPositionChange);
        objectRotationXSlider.addEventListener('input', onObjectRotationChange); objectRotationYSlider.addEventListener('input', onObjectRotationChange); objectRotationZSlider.addEventListener('input', onObjectRotationChange);
        objectScaleSlider.addEventListener('input', onObjectScaleChange);
        modelColorHueSlider.addEventListener('input', onModelColorOrBrightnessChange); objectBrightnessSlider.addEventListener('input', onModelColorOrBrightnessChange);
        objectRoughnessSlider.addEventListener('input', onObjectMaterialChange); objectMetalnessSlider.addEventListener('input', onObjectMaterialChange);
        lightIntensitySlider.addEventListener('input', onLightIntensityChange); lightAngleSlider.addEventListener('input', onSpotlightParamsChange); lightPenumbraSlider.addEventListener('input', onSpotlightParamsChange);
        lightXSlider.addEventListener('input', onLightPositionChange); lightYSlider.addEventListener('input', onLightPositionChange); lightZSlider.addEventListener('input', onLightPositionChange);
        shapeSelect.addEventListener('change', handleShapeSelectionChange);
        shapeSearchInput.addEventListener('input', filterShapeDropdown);
        copyLogBtn.addEventListener('click', () => { try { navigator.clipboard.writeText(debugConsole.innerText).then(() => logToPage('Log copied.', 'success'), () => logToPage('Copy failed.', 'error')); } catch (e) { logToPage(`Copy log error: ${e.message}`, 'error'); } });
        controlsContainer.addEventListener('click', handleSliderReset);
        saveStateBtn?.addEventListener('click', saveSceneState); // Re-enabled
        loadStateBtn?.addEventListener('click', async () => { await loadSceneState(); }); // Re-enabled
        resetSceneBtn?.addEventListener('click', async () => { await resetSceneToDefaults(); });

        // --- Pose Select Listener (Uses localStorage) ---
        poseSelect?.addEventListener('change', (event) => {
            const selectedObjData = getSelectedObjectData();
            if (selectedObjData && selectedObjData.isPoseable && selectedObjData.initialBoneState) {
                const selectedPoseName = event.target.value;
                selectedObjData.appliedPoseName = selectedPoseName; // Store applied name

                if (selectedPoseName === '') {
                    logToPage(`Applying default pose to ${selectedObjectUUID}`);
                    applyPoseData(selectedObjData.object3D, selectedObjData.initialBoneState);
                } else {
                    const modelPath = selectedObjData.originalType;
                    const localStorageKey = `poses_${modelPath}`;
                    try {
                        const savedPosesJSON = localStorage.getItem(localStorageKey);
                        const savedPoses = savedPosesJSON ? JSON.parse(savedPosesJSON) : null;
                        const poseDataArray = savedPoses ? savedPoses[selectedPoseName] : null;
                        if (poseDataArray && Array.isArray(poseDataArray)) {
                            logToPage(`Applying saved pose "${selectedPoseName}" from localStorage to ${selectedObjectUUID}`);
                            applyPoseData(selectedObjData.object3D, poseDataArray);
                        } else {
                            logToPage(`Pose data for "${selectedPoseName}" not found/invalid in localStorage for ${modelPath}. Resetting to default.`, 'error');
                            selectedObjData.appliedPoseName = ''; event.target.value = '';
                            applyPoseData(selectedObjData.object3D, selectedObjData.initialBoneState);
                        }
                    } catch (error) {
                        logToPage(`Error accessing/applying pose "${selectedPoseName}" from localStorage: ${error.message}. Resetting.`, 'error');
                        selectedObjData.appliedPoseName = ''; event.target.value = '';
                        applyPoseData(selectedObjData.object3D, selectedObjData.initialBoneState);
                    }
                }
            } else logToPage("Pose change ignored: No poseable object selected or initial state missing.", "warn");
        });

        openPoserBtn?.addEventListener('click', handleOpenPoser); // Updated logic inside handleOpenPoser

        // --- Refresh Poses Button Listener ---
        refreshPosesBtn?.addEventListener('click', () => {
            const selectedObjData = getSelectedObjectData();
            if (selectedObjData && selectedObjData.isPoseable) {
                populatePoseDropdown(selectedObjData); // Re-read from localStorage
                logToPage("Refreshed pose list from localStorage.");
            } else logToPage("Refresh poses ignored: No poseable object selected.", "warn");
        });

        renderer.domElement.addEventListener('click', onSceneClick, false);
        focusCameraBtn?.addEventListener('click', () => focusCameraOnSelection(false));
        decoupleCameraBtn?.addEventListener('click', toggleCameraDecoupling);

        logToPage("Event listeners added.");

        await resetSceneToDefaults(); // Start with defaults
        populateObjectList();
        animate(); // Start render loop
        logToPage("Init complete, starting animation loop.", "success");

    } catch (error) {
        logToPage(`Initialization Error: ${error.message}\n${error.stack}`, 'error');
        if(sceneContainer) sceneContainer.innerHTML = `<p style='color:#ff8080;padding:20px;'>Init Error: ${error.message}<br>Check Log.</p>`;
        else alert(`Initialization Error: ${error.message}`);
    }
}

// --- Event Handlers ---
function onWindowResize() { /* ... unchanged ... */ setTimeout(() => { try { const width = sceneContainer.clientWidth; const height = sceneContainer.clientHeight; if (width > 0 && height > 0) { camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); } else { logToPage(`Resize skipped: Invalid dimensions ${width}x${height}`, 'warn'); } } catch(e){ logToPage(`Resize error: ${e.message}`,'error')} }, 50); }
function onSceneClick(event) { /* ... unchanged ... */ if (isDraggingFreeLook || isCameraDecoupled) return; if (!raycaster || !camera || sceneObjects.length === 0) return; const mouse = new THREE.Vector2(); const rect = renderer.domElement.getBoundingClientRect(); mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(mouse, camera); raycaster.layers.set(INTERACTION_LAYER); const objectsToCheck = sceneObjects.map(data => data.object3D); const intersects = raycaster.intersectObjects(objectsToCheck, true); if (intersects.length > 0) { let clickedObjectData = null; const closestIntersectedObject = intersects[0].object; let searchObj = closestIntersectedObject; while (searchObj && searchObj !== scene) { const foundData = sceneObjects.find(data => data.object3D === searchObj); if (foundData) { clickedObjectData = foundData; break; } searchObj = searchObj.parent; } if (clickedObjectData) { selectObject(clickedObjectData.uuid); } else { logToPage(`Raycast Warn: Hit object "${closestIntersectedObject.name || 'Unnamed'}" but couldn't find root. Deselecting.`, "warn"); selectObject(null); } } else { selectObject(null); } }
function handleOpenPoser() { /* ... UPDATED to check POSEABLE_MODELS ... */ logToPage("Open Poser button clicked."); const selectedObjData = getSelectedObjectData(); const modelPathForPoser = selectedObjData?.originalType; if (!modelPathForPoser || !POSEABLE_MODELS.includes(modelPathForPoser)) { logToPage("Cannot open poser: No poseable model selected or model not in POSEABLE_MODELS list.", 'error'); alert("Please select a model from the POSEABLE_MODELS list first (e.g., Female/Male Base 0/1/2, etc.)."); return; } const poserUrl = `poser.html?model=${encodeURIComponent(modelPathForPoser)}`; logToPage(`Opening poser for: ${modelPathForPoser} at ${poserUrl}`); const poserWindow = window.open(poserUrl, '_blank'); if (!poserWindow) { logToPage("Failed to open poser window. Pop-up blocker?", 'error'); alert("Could not open poser window. Check pop-up blocker."); } else { logToPage("Poser window opened (or attempted).", "success"); } }
function toggleControls() { /* ... unchanged ... */ try { const isCollapsed = document.body.classList.toggle('controls-collapsed'); toggleControlsBtn.textContent = isCollapsed ? '▲' : '▼'; toggleControlsBtn.title = isCollapsed ? 'Expand Controls' : 'Collapse Controls'; logToPage(`Controls ${isCollapsed ? 'collapsed' : 'expanded'}.`); setTimeout(onWindowResize, 50); } catch (error) { logToPage(`Error toggling controls: ${error.message}`, 'error'); console.error("Toggle Controls Error:", error); } }
function toggleCameraLock() { /* ... unchanged ... */ try { if (!controls || !cameraLockBtn) return; controls.enabled = !controls.enabled; if (!controls.enabled && isDraggingFreeLook) isDraggingFreeLook = false; cameraLockBtn.textContent = controls.enabled ? 'Lock Camera' : 'Unlock Camera'; logToPage(`Camera controls ${controls.enabled ? 'enabled' : 'disabled'}.`); } catch (e) { logToPage(`Camera lock toggle error: ${e.message}`, 'error'); } }
async function resetSceneToDefaults() { /* ... unchanged ... */ logToPage("Resetting scene to defaults..."); try { gridHelperToggle.checked = true; document.body.classList.remove('controls-collapsed'); /* toggleControls(); toggleControls(); */ controls.enabled = true; cameraLockBtn.textContent = 'Lock Camera'; if (isCameraDecoupled) toggleCameraDecoupling(); logToPage("UI toggles reset."); logToPage("Clearing existing scene objects..."); selectObject(null); while(sceneObjects.length > 0) deleteObject(sceneObjects[sceneObjects.length - 1].uuid); logToPage("Existing objects cleared."); logToPage("Setting default slider values..."); document.querySelectorAll('#controls-container .reset-slider-btn').forEach(btn => { try { btn.click(); } catch (e) { logToPage(`Error clicking reset btn for ${btn.dataset.targetSlider}: ${e.message}`, 'warn');} }); logToPage("Default slider values applied."); logToPage("Setting randomized environment hues..."); const randomWallHue = Math.random(); const randomFloorHue = Math.random(); if(wallHueSlider) wallHueSlider.value = randomWallHue; if(floorHueSlider) floorHueSlider.value = randomFloorHue; onWallColorChange(); onFloorColorChange(); logToPage("Selecting random primitive..."); resetShapeDropdown(); const primitiveOptions = Array.from(shapeSelect.querySelectorAll('optgroup[label="Primitives"] option')); let selectedPrimitiveValue = 'sphere'; if (primitiveOptions.length > 0) { const randomIndex = Math.floor(Math.random() * primitiveOptions.length); selectedPrimitiveValue = primitiveOptions[randomIndex].value; logToPage(`Random primitive selected: ${selectedPrimitiveValue}`); } else { logToPage("No primitive options found, defaulting to sphere.", 'warn'); } shapeSelect.value = selectedPrimitiveValue; await handleShapeSelectionChange(); logToPage("Resetting camera and helpers..."); gridHelper.visible = gridHelperToggle.checked; axesHelper.visible = false; camera.position.set(4.0, 6, 14); controls.target.set(0,1,0); controls.update(); logToPage("Scene reset to defaults completed.", "success"); } catch (error) { logToPage(`Error resetting scene: ${error.message}\n${error.stack}`, 'error'); } }

// --- Environment Control Handlers ---
function onFloorColorChange() { /* ... unchanged ... */ if (!floor?.material || !floorHueSlider || !floorSaturationSlider || !floorBrightnessSlider) return; try { const h = parseFloat(floorHueSlider.value), s = parseFloat(floorSaturationSlider.value), l = parseFloat(floorBrightnessSlider.value); floor.material.color.setHSL(h, s, l); if(floorHueValueSpan) floorHueValueSpan.textContent = `${Math.round(h * 360)}°`; if(floorSaturationValueSpan) floorSaturationValueSpan.textContent = s.toFixed(2); if(floorBrightnessValueSpan) floorBrightnessValueSpan.textContent = l.toFixed(2); } catch(e){ logToPage(`Floor color error: ${e.message}`,'error')} }
function onWallColorChange() { /* ... unchanged ... */ if (!wallHueSlider || !wallSaturationSlider || !wallBrightnessSlider) return; try { const h = parseFloat(wallHueSlider.value), s = parseFloat(wallSaturationSlider.value), l = parseFloat(wallBrightnessSlider.value); const bgColor = new THREE.Color().setHSL(h, s, l); if(scene) scene.background = bgColor; if(sceneContainer) sceneContainer.style.backgroundColor = bgColor.getStyle(); if(wallHueValueSpan) wallHueValueSpan.textContent = `${Math.round(h * 360)}°`; if(wallSaturationValueSpan) wallSaturationValueSpan.textContent = s.toFixed(2); if(wallBrightnessValueSpan) wallBrightnessValueSpan.textContent = l.toFixed(2); } catch(e){ logToPage(`Wall/BG color error: ${e.message}`,'error')} }

// --- Object Control Handlers ---
function onModelYOffsetChange() { /* ... unchanged ... */ const selectedObj3D = getSelectedObject3D(); if (!selectedObj3D || !modelYOffsetSlider || !modelYOffsetValueSpan) return; try { const offset = parseFloat(modelYOffsetSlider.value); modelYOffsetValueSpan.textContent = offset.toFixed(1); const selectedBaseY = calculateObjectBaseY(selectedObj3D); selectedObj3D.position.y = selectedBaseY + offset; updateTargets(); } catch(e){ logToPage(`Y Offset change error: ${e.message}`,'error')} }
function onObjectXPositionChange() { /* ... unchanged ... */ const selectedObj3D = getSelectedObject3D(); if (!selectedObj3D || !objectXPositionSlider || !objectXPositionValueSpan) return; try { const value = parseFloat(objectXPositionSlider.value); selectedObj3D.position.x = value; objectXPositionValueSpan.textContent = value.toFixed(1); updateTargets(); } catch(e){ logToPage(`X Position change error: ${e.message}`,'error')} }
function onObjectZPositionChange() { /* ... unchanged ... */ const selectedObj3D = getSelectedObject3D(); if (!selectedObj3D || !objectZPositionSlider || !objectZPositionValueSpan) return; try { const value = parseFloat(objectZPositionSlider.value); selectedObj3D.position.z = value; objectZPositionValueSpan.textContent = value.toFixed(1); updateTargets(); } catch(e){ logToPage(`Z Position change error: ${e.message}`,'error')} }
function onObjectRotationChange() { /* ... unchanged ... */ const selectedObj3D = getSelectedObject3D(); if (!selectedObj3D || !objectRotationXSlider || !objectRotationYSlider || !objectRotationZSlider) return; try { const rx = THREE.MathUtils.degToRad(parseFloat(objectRotationXSlider.value)); const ry = THREE.MathUtils.degToRad(parseFloat(objectRotationYSlider.value)); const rz = THREE.MathUtils.degToRad(parseFloat(objectRotationZSlider.value)); const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')); selectedObj3D.quaternion.copy(q); updateObjectRotationDisplay(); updateTargets(); } catch(e){ logToPage(`Rotation change error: ${e.message}`,'error')} }
function updateObjectRotationDisplay() { /* ... unchanged ... */ try { if(objectRotationXValueSpan && objectRotationXSlider) objectRotationXValueSpan.textContent = `${parseFloat(objectRotationXSlider.value)}°`; if(objectRotationYValueSpan && objectRotationYSlider) objectRotationYValueSpan.textContent = `${parseFloat(objectRotationYSlider.value)}°`; if(objectRotationZValueSpan && objectRotationZSlider) objectRotationZValueSpan.textContent = `${parseFloat(objectRotationZSlider.value)}°`; } catch(e){ logToPage(`Update rotation display error: ${e.message}`,'error')} }
function onModelColorOrBrightnessChange() { /* ... unchanged ... */ const selectedObj3D = getSelectedObject3D(); if ((!selectedObj3D && !objectMaterial) || !modelColorHueSlider || !objectBrightnessSlider) return; try { const hue = parseFloat(modelColorHueSlider.value); const lightness = parseFloat(objectBrightnessSlider.value); const saturation = 0.8; if(modelColorHueValueSpan) modelColorHueValueSpan.textContent = `${Math.round(hue * 360)}°`; if(objectBrightnessValueSpan) objectBrightnessValueSpan.textContent = lightness.toFixed(2); const applyColorChange = (mat) => { if (mat?.isMeshStandardMaterial && !mat.map) { mat.color.setHSL(hue, saturation, lightness); return true; } return false; }; let changed = false; if (selectedObj3D) { if (selectedObj3D.isMesh) { if(applyColorChange(selectedObj3D.material)) changed = true; } else if (selectedObj3D.isGroup) { selectedObj3D.traverse((child) => { if (child.isMesh && child.material) { if (Array.isArray(child.material)) { child.material.forEach(m => { if(applyColorChange(m)) changed = true; }); } else { if(applyColorChange(child.material)) changed = true; } } }); } } else if (objectMaterial) { /* Apply to default material? Maybe not desired */ } } catch(e){ logToPage(`Color/Brightness change error: ${e.message}`,'error')} }
function onObjectMaterialChange() { /* ... unchanged ... */ const selectedObj3D = getSelectedObject3D(); if ((!selectedObj3D && !objectMaterial) || !objectRoughnessSlider || !objectMetalnessSlider) return; try { const roughness = parseFloat(objectRoughnessSlider.value); const metalness = parseFloat(objectMetalnessSlider.value); if(objectRoughnessValueSpan) objectRoughnessValueSpan.textContent = roughness.toFixed(2); if(objectMetalnessValueSpan) objectMetalnessValueSpan.textContent = metalness.toFixed(2); const applyRoughMetal = (mat) => { if (mat?.isMeshStandardMaterial) { mat.roughness = roughness; mat.metalness = metalness; mat.needsUpdate = true; return true; } return false; }; let changed = false; if (selectedObj3D) { if (selectedObj3D.isMesh) { if(applyRoughMetal(selectedObj3D.material)) changed = true; } else if (selectedObj3D.isGroup) { selectedObj3D.traverse((child) => { if (child.isMesh && child.material) { if (Array.isArray(child.material)) { child.material.forEach(m => { if(applyRoughMetal(m)) changed = true; }); } else { if(applyRoughMetal(child.material)) changed = true; } } }); } } else if (objectMaterial) { /* Apply to default material? Maybe not desired */ } } catch(e){ logToPage(`Material props change error: ${e.message}`,'error')} }
function onObjectScaleChange() { /* ... unchanged (Handles Relative Scale) ... */ const selectedObjData = getSelectedObjectData(); const selectedObj3D = selectedObjData?.object3D; if (!selectedObj3D || !selectedObjData || !objectScaleSlider || !objectScaleValueSpan) { logToPage("Scale change skipped: No object or slider.", "warn"); return; } try { const relativeScaleValue = parseFloat(objectScaleSlider.value); const baseScale = selectedObjData.baseScale || 1.0; const finalScale = baseScale * relativeScaleValue; selectedObj3D.scale.set(finalScale, finalScale, finalScale); selectedObj3D.updateMatrixWorld(true); objectScaleValueSpan.textContent = relativeScaleValue.toFixed(2) + 'x'; const currentBaseY = calculateObjectBaseY(selectedObj3D); const currentYOffset = parseFloat(modelYOffsetSlider?.value || 0); selectedObj3D.position.y = currentBaseY + currentYOffset; updateTargets(); } catch(e) { logToPage(`Scale change error: ${e.message}`, 'error'); } }

// --- Light Control Handlers ---
function onLightIntensityChange() { /* ... unchanged ... */ if (!spotLight || !lightIntensityValueSpan || !lightIntensitySlider) return; try { spotLight.intensity = parseFloat(lightIntensitySlider.value); lightIntensityValueSpan.textContent = spotLight.intensity.toFixed(1); } catch(e){ logToPage(`Intensity change error: ${e.message}`,'error')} }
function onSpotlightParamsChange() { /* ... unchanged ... */ if (!spotLight || !lightAngleValueSpan || !lightPenumbraValueSpan || !lightAngleSlider || !lightPenumbraSlider) return; try { const angleDeg = parseFloat(lightAngleSlider.value); const penumbra = parseFloat(lightPenumbraSlider.value); spotLight.angle = THREE.MathUtils.degToRad(angleDeg); spotLight.penumbra = penumbra; lightAngleValueSpan.innerHTML = `${angleDeg}°`; lightPenumbraValueSpan.textContent = penumbra.toFixed(2); } catch(e){ logToPage(`Spotlight params error: ${e.message}`,'error')} }
function onLightPositionChange() { /* ... unchanged ... */ if (!spotLight || !lightVisualizer || !lightXSlider || !lightYSlider || !lightZSlider) return; try { const newX = parseFloat(lightXSlider.value); const newY = parseFloat(lightYSlider.value); const newZ = parseFloat(lightZSlider.value); spotLight.position.set(newX, newY, newZ); lightVisualizer.position.copy(spotLight.position); updateLightPositionDisplays(); updateTargets(); } catch(e){ logToPage(`Light pos change error: ${e.message}`,'error')} }
function updateLightPositionDisplays() { /* ... unchanged ... */ try { if(lightXValueSpan && lightXSlider) lightXValueSpan.textContent = parseFloat(lightXSlider.value).toFixed(1); if(lightYValueSpan && lightYSlider) lightYValueSpan.textContent = parseFloat(lightYSlider.value).toFixed(1); if(lightZValueSpan && lightZSlider) lightZValueSpan.textContent = parseFloat(lightZSlider.value).toFixed(1); } catch(e){ logToPage(`Update light display error: ${e.message}`,'error')} }

// --- Shape Selection Handler ---
async function handleShapeSelectionChange() { /* ... unchanged ... */ const selectedValue = shapeSelect.value; logToPage(`Shape selection changed to: ${selectedValue}`); if(openPoserBtn) openPoserBtn.disabled = true; if(poseSelect) { poseSelect.disabled = true; poseSelect.innerHTML = '<option value="" disabled>Loading...</option>'; } if(refreshPosesBtn) refreshPosesBtn.disabled = true; logToPage("Loading new object...", 'info'); try { const result = await updateObject(selectedValue); if (!result || !result.object3D) { logToPage(`Failed to create/load object: ${selectedValue}`, 'error'); selectObject(null); return; } const newObject = result.object3D; const newId = THREE.MathUtils.generateUUID(); newObject.uuid = newId; newObject.layers.enable(INTERACTION_LAYER); newObject.traverse(child => { child.layers.enable(INTERACTION_LAYER); }); logToPage(`Assigned layer ${INTERACTION_LAYER} to ${newId}`); logToPage(`Adding new object ${newId} (${result.originalType}) to scene...`); newObject.rotation.set(0, 0, 0); newObject.quaternion.setFromEuler(newObject.rotation); newObject.updateMatrixWorld(true); const newObjectBaseY = calculateObjectBaseY(newObject); newObject.position.set(0, newObjectBaseY, 0); newObject.updateMatrixWorld(true); scene.add(newObject); const sceneObjectData = { uuid: newId, originalType: result.originalType, objectType: result.objectType, object3D: newObject, baseScale: result.baseScale, isPoseable: result.isPoseable, initialBoneState: result.initialBoneState, appliedPoseName: '' }; sceneObjects.push(sceneObjectData); logToPage(`Positioned new object ${newId} at Y: ${newObjectBaseY.toFixed(3)}`); if (sceneObjectData.isPoseable && sceneObjectData.initialBoneState) { logToPage(`Applying initial bone state to new object ${newId}.`); applyPoseData(newObject, sceneObjectData.initialBoneState); } populateObjectList(); selectObject(newId); logToPage(`Object ${newId} added and selected successfully.`, 'success'); } catch (error) { logToPage(`Error during shape change handling: ${error.message}\n${error.stack}`, 'error'); selectObject(null); } finally { logToPage("Finished loading/creating object."); } }

// --- Slider Reset Handler ---
 function handleSliderReset(event) { /* ... unchanged ... */ if (!event.target.classList.contains('reset-slider-btn')) return; event.stopPropagation(); try { const button = event.target; const sliderId = button.dataset.targetSlider; const resetValue = button.dataset.resetValue; const sliderElement = document.getElementById(sliderId); if (sliderElement && resetValue !== undefined) { sliderElement.value = resetValue; sliderElement.dispatchEvent(new Event('input', { bubbles: true })); logToPage(`Slider '${sliderId}' reset to ${resetValue}.`); } else { logToPage(`Reset failed: Slider '${sliderId}' or reset value '${resetValue}' not found/defined.`, 'warn'); } } catch (e) { logToPage(`Slider reset error: ${e.message}`, 'error'); } }

// --- Camera Control Handlers ---
function focusCameraOnSelection(smooth = false) { /* ... unchanged ... */ const selectedObj3D = getSelectedObject3D(); if (!selectedObj3D) { logToPage("Focus camera: No object selected. Focusing on origin.", "info"); controls.target.set(0, 1, 0); const defaultPos = new THREE.Vector3(0, 6, 14); if (smooth) { logToPage("Smooth focus to default view NYI."); camera.position.copy(defaultPos); } else { camera.position.copy(defaultPos); } controls.update(); if (isCameraDecoupled) toggleCameraDecoupling(); return; } logToPage(`Focusing camera on ${selectedObjectUUID}`); const targetCenter = new THREE.Vector3(); const boundingBox = new THREE.Box3().setFromObject(selectedObj3D, true); if (!boundingBox.isEmpty() && !boundingBox.getSize(new THREE.Vector3()).equals(new THREE.Vector3(0,0,0))) { boundingBox.getCenter(targetCenter); const size = boundingBox.getSize(new THREE.Vector3()); const maxDim = Math.max(size.x, size.y, size.z); const fitOffset = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5))); const desiredDist = fitOffset + maxDim * 0.75; const finalDist = THREE.MathUtils.clamp(desiredDist, controls.minDistance, controls.maxDistance); const offset = new THREE.Vector3().subVectors(camera.position, controls.target); offset.normalize().multiplyScalar(finalDist); const newPos = targetCenter.clone().add(offset); if (smooth) { logToPage("Smooth camera focus NYI."); camera.position.copy(newPos); controls.target.copy(targetCenter); controls.update(); } else { camera.position.copy(newPos); controls.target.copy(targetCenter); controls.update(); } logToPage(`Camera focused. Target: ${targetCenter.x.toFixed(1)},${targetCenter.y.toFixed(1)},${targetCenter.z.toFixed(1)}. Dist: ${finalDist.toFixed(1)}`); } else { logToPage("Focus camera: Invalid bounds. Targeting origin.", "warn"); controls.target.copy(selectedObj3D.position); const defaultPos = new THREE.Vector3(0, 6, 14); camera.position.copy(defaultPos); controls.update(); } if (isCameraDecoupled) toggleCameraDecoupling(); }
function onFreeLookMouseDown(event) { /* ... unchanged ... */ if (event.button !== 0) return; isDraggingFreeLook = true; previousMousePosition.x = event.clientX; previousMousePosition.y = event.clientY; renderer.domElement.style.cursor = 'grabbing'; }
function onFreeLookMouseMove(event) { /* ... unchanged ... */ if (!isDraggingFreeLook || !isCameraDecoupled) return; const deltaX = event.clientX - previousMousePosition.x; const deltaY = event.clientY - previousMousePosition.y; const rotY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -deltaX * freeLookSensitivity); const cameraRight = new THREE.Vector3(); camera.getWorldDirection(cameraRight); cameraRight.cross(camera.up); const rotX = new THREE.Quaternion().setFromAxisAngle(cameraRight, -deltaY * freeLookSensitivity); camera.quaternion.premultiply(rotY); camera.quaternion.multiply(rotX); previousMousePosition.x = event.clientX; previousMousePosition.y = event.clientY; }
function onFreeLookMouseUp(event) { /* ... unchanged ... */ if (event.button !== 0) return; isDraggingFreeLook = false; renderer.domElement.style.cursor = 'grab'; }
function toggleCameraDecoupling() { /* ... unchanged ... */ isCameraDecoupled = !isCameraDecoupled; logToPage(`Camera decoupling ${isCameraDecoupled ? 'ENABLED' : 'DISABLED'}.`); if (isCameraDecoupled) { decoupleCameraBtn.textContent = 'Free'; decoupleCameraBtn.classList.add('decoupled'); controls.enableRotate = false; controls.enablePan = true; renderer.domElement.addEventListener('mousedown', onFreeLookMouseDown, false); window.addEventListener('mousemove', onFreeLookMouseMove, false); window.addEventListener('mouseup', onFreeLookMouseUp, false); renderer.domElement.style.cursor = 'grab'; logToPage("OrbitControls rotation disabled. Free Look enabled."); } else { decoupleCameraBtn.textContent = 'Orbit'; decoupleCameraBtn.classList.remove('decoupled'); isDraggingFreeLook = false; renderer.domElement.removeEventListener('mousedown', onFreeLookMouseDown, false); window.removeEventListener('mousemove', onFreeLookMouseMove, false); window.removeEventListener('mouseup', onFreeLookMouseUp, false); controls.enableRotate = true; controls.enablePan = true; renderer.domElement.style.cursor = 'grab'; updateTargets(); controls.update(); logToPage("OrbitControls rotation enabled. Free Look disabled."); } }

// --- Save/Load State Functions (Unchanged from v3.0 logic) ---
 function saveSceneState() { /* ... same as v3.0 ... */ logToPage("Attempting save scene state (v3.0 - poser)..."); if (!camera || !controls || !spotLight) { logToPage("Cannot save state: Core components not ready.", 'error'); return; } try { const objectsToSave = sceneObjects.map(objData => { const obj3D = objData.object3D; let materialData = null; let representativeMaterial = null; if (obj3D.isMesh && obj3D.material?.isMeshStandardMaterial) representativeMaterial = obj3D.material; else if (obj3D.isGroup) obj3D.traverse(c => { if (!representativeMaterial && c.isMesh && c.material?.isMeshStandardMaterial) representativeMaterial = c.material; }); if (representativeMaterial && !representativeMaterial.map) { const hsl = { h: 0, s: 0, l: 0 }; representativeMaterial.color.getHSL(hsl); materialData = { hue: hsl.h, brightness: hsl.l, roughness: representativeMaterial.roughness, metalness: representativeMaterial.metalness }; } else if (representativeMaterial) { materialData = { hue: null, brightness: null, roughness: representativeMaterial.roughness, metalness: representativeMaterial.metalness }; } const baseScale = objData.baseScale || 1.0; const actualScale = obj3D.scale.x; const relativeScale = baseScale !== 0 ? actualScale / baseScale : 1.0; return { uuid: objData.uuid, originalType: objData.originalType, transform: { position: obj3D.position.toArray(), quaternion: obj3D.quaternion.toArray(), relativeScale: relativeScale }, material: materialData, appliedPoseName: objData.appliedPoseName || '' }; }); const state = { version: 3.0, camera: { position: camera.position.toArray(), target: controls.target.toArray(), quaternion: camera.quaternion.toArray() }, light: { intensity: parseFloat(lightIntensitySlider.value), angle: parseFloat(lightAngleSlider.value), penumbra: parseFloat(lightPenumbraSlider.value), position: spotLight.position.toArray() }, sceneObjects: objectsToSave, selectedObjectUUID: selectedObjectUUID, environment: { wall: { hue: parseFloat(wallHueSlider.value), saturation: parseFloat(wallSaturationSlider.value), brightness: parseFloat(wallBrightnessSlider.value) }, floor: { hue: parseFloat(floorHueSlider.value), saturation: parseFloat(floorSaturationSlider.value), brightness: parseFloat(floorBrightnessSlider.value) } }, helpers: { gridVisible: gridHelperToggle.checked }, ui: { controlsCollapsed: document.body.classList.contains('controls-collapsed'), cameraLocked: !controls.enabled, cameraDecoupled: isCameraDecoupled } }; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)); logToPage("Scene state saved successfully (v3.0 - poser).", "success"); } catch (error) { logToPage(`Error saving state: ${error.message}`, 'error'); console.error("Save State Error:", error); } }
 async function loadSceneState() { /* ... same as v3.0 ... */ logToPage("Attempting load scene state (v3.0 - poser)..."); const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY); if (!savedStateJSON) { logToPage("No saved state found for key: " + LOCAL_STORAGE_KEY); return false; } let loadedState; try { loadedState = JSON.parse(savedStateJSON); if (!loadedState || loadedState.version !== 3.0) { logToPage(`Saved state version mismatch/invalid. Got ${loadedState?.version}, expected 3.0. Ignoring.`, 'warn'); return false; } if (!loadedState.sceneObjects || !Array.isArray(loadedState.sceneObjects)) { logToPage(`Saved state invalid 'sceneObjects'. Ignoring.`, 'error'); return false; } logToPage(`Saved state v${loadedState.version} parsed.`); } catch (error) { logToPage(`Error parsing saved state: ${error.message}. Clearing invalid state.`, 'error'); localStorage.removeItem(LOCAL_STORAGE_KEY); return false; } try { logToPage("Applying loaded state..."); logToPage("Clearing current scene..."); selectObject(null); while (sceneObjects.length > 0) deleteObject(sceneObjects[sceneObjects.length - 1].uuid); logToPage("Current scene cleared."); controls.enabled = !loadedState.ui.cameraLocked; cameraLockBtn.textContent = controls.enabled ? 'Lock Camera' : 'Unlock Camera'; if (loadedState.ui.controlsCollapsed) document.body.classList.add('controls-collapsed'); else document.body.classList.remove('controls-collapsed'); camera.position.fromArray(loadedState.camera.position); controls.target.fromArray(loadedState.camera.target); if (loadedState.camera.quaternion) camera.quaternion.fromArray(loadedState.camera.quaternion); else camera.lookAt(controls.target); camera.updateProjectionMatrix(); lightIntensitySlider.value = loadedState.light.intensity; lightIntensitySlider.dispatchEvent(new Event('input')); lightAngleSlider.value = loadedState.light.angle; lightAngleSlider.dispatchEvent(new Event('input')); lightPenumbraSlider.value = loadedState.light.penumbra; lightPenumbraSlider.dispatchEvent(new Event('input')); lightXSlider.value = loadedState.light.position[0]; lightXSlider.dispatchEvent(new Event('input')); lightYSlider.value = loadedState.light.position[1]; lightYSlider.dispatchEvent(new Event('input')); lightZSlider.value = loadedState.light.position[2]; lightZSlider.dispatchEvent(new Event('input')); wallHueSlider.value = loadedState.environment.wall.hue; wallHueSlider.dispatchEvent(new Event('input')); wallSaturationSlider.value = loadedState.environment.wall.saturation; wallSaturationSlider.dispatchEvent(new Event('input')); wallBrightnessSlider.value = loadedState.environment.wall.brightness; wallBrightnessSlider.dispatchEvent(new Event('input')); floorHueSlider.value = loadedState.environment.floor.hue; floorHueSlider.dispatchEvent(new Event('input')); floorSaturationSlider.value = loadedState.environment.floor.saturation; floorSaturationSlider.dispatchEvent(new Event('input')); floorBrightnessSlider.value = loadedState.environment.floor.brightness; floorBrightnessSlider.dispatchEvent(new Event('input')); gridHelperToggle.checked = loadedState.helpers.gridVisible; gridHelper.visible = loadedState.helpers.gridVisible; axesHelper.visible = false; logToPage(`Recreating ${loadedState.sceneObjects.length} objects...`); let lastSelectedUUID = loadedState.selectedObjectUUID || null; selectedObjectUUID = null; for (const savedObjData of loadedState.sceneObjects) { const result = await updateObject(savedObjData.originalType); if (!result || !result.object3D) { logToPage(`Failed recreate object ${savedObjData.uuid} (${savedObjData.originalType})`, 'error'); continue; } const newObject = result.object3D; newObject.uuid = savedObjData.uuid; newObject.layers.enable(INTERACTION_LAYER); newObject.traverse(child => { child.layers.enable(INTERACTION_LAYER); }); const sceneObjectData = { uuid: savedObjData.uuid, originalType: result.originalType, objectType: result.objectType, object3D: newObject, baseScale: result.baseScale, isPoseable: result.isPoseable, initialBoneState: result.initialBoneState, appliedPoseName: savedObjData.appliedPoseName || '' }; if (savedObjData.transform) { newObject.position.fromArray(savedObjData.transform.position); if (savedObjData.transform.quaternion) newObject.quaternion.fromArray(savedObjData.transform.quaternion); else newObject.rotation.set(0,0,0); const relativeScale = savedObjData.transform.relativeScale || 1.0; const absoluteScale = sceneObjectData.baseScale * relativeScale; newObject.scale.set(absoluteScale, absoluteScale, absoluteScale); newObject.updateMatrixWorld(true); } else { logToPage(`No transform data for ${savedObjData.uuid}, placing at base.`, 'warn'); newObject.updateMatrixWorld(true); const baseY = calculateObjectBaseY(newObject); newObject.position.set(0, baseY, 0); newObject.updateMatrixWorld(true); } if (savedObjData.material) { const applySavedMaterial = (mat, savedMat) => { if (!mat?.isMeshStandardMaterial || !savedMat) return false; if (savedMat.hue !== null && savedMat.brightness !== null) mat.color.setHSL(savedMat.hue, 0.8, savedMat.brightness); mat.roughness = savedMat.roughness ?? mat.roughness; mat.metalness = savedMat.metalness ?? mat.metalness; mat.needsUpdate = true; return true; }; if (newObject.isMesh) applySavedMaterial(newObject.material, savedObjData.material); else if (newObject.isGroup) newObject.traverse(c => { if (c.isMesh) { if(Array.isArray(c.material)) c.material.forEach(m=>applySavedMaterial(m, savedObjData.material)); else applySavedMaterial(c.material, savedObjData.material); } }); } scene.add(newObject); sceneObjects.push(sceneObjectData); } logToPage("Applying saved poses to objects..."); for (const objData of sceneObjects) { if (objData.isPoseable && objData.initialBoneState) { const poseName = objData.appliedPoseName; if (poseName && poseName !== '') { const modelPath = objData.originalType; const localStorageKey = `poses_${modelPath}`; let poseApplied = false; try { const savedPosesJSON = localStorage.getItem(localStorageKey); const savedPoses = savedPosesJSON ? JSON.parse(savedPosesJSON) : null; const poseDataArray = savedPoses ? savedPoses[poseName] : null; if (poseDataArray && Array.isArray(poseDataArray)) { logToPage(`Applying saved pose "${poseName}" to ${objData.uuid} from localStorage.`); applyPoseData(objData.object3D, poseDataArray); poseApplied = true; } } catch (error) { logToPage(`Error applying saved pose "${poseName}" to ${objData.uuid}: ${error.message}`, 'error'); } if (!poseApplied) { logToPage(`Saved pose "${poseName}" for ${objData.uuid} not found or invalid. Applying default pose.`, 'warn'); applyPoseData(objData.object3D, objData.initialBoneState); objData.appliedPoseName = ''; } } else { logToPage(`Applying default pose to ${objData.uuid}.`); applyPoseData(objData.object3D, objData.initialBoneState); } } } if (loadedState.ui.cameraDecoupled !== isCameraDecoupled) toggleCameraDecoupling(); populateObjectList(); controls.update(); if (lastSelectedUUID && sceneObjects.some(o => o.uuid === lastSelectedUUID)) selectObject(lastSelectedUUID); else selectObject(null); logToPage("Scene state loaded successfully.", "success"); return true; } catch (error) { logToPage(`Error applying loaded state: ${error.message}\n${error.stack}`, 'error'); console.error("Apply State Error:", error); await resetSceneToDefaults(); return false; } }

// --- Animation Loop (Simple Render Loop) ---
function animate() {
    requestAnimationFrame(animate);
    try {
        if (controls) controls.update(); // Always update for damping
        if (renderer && scene && camera) renderer.render(scene, camera);
    } catch (renderError) {
        logToPage(`Animation loop error: ${renderError.message}\n${renderError.stack}`, 'error');
    }
}

// --- Run ---
async function runInitialization() { /* ... unchanged ... */ logToPage("Running initialization..."); try { await init(); } catch (error) { logToPage(`Error during runInitialization: ${error.message}`, 'error'); console.error("Initialization Run Error:", error); if(sceneContainer) sceneContainer.innerHTML = `<p style='color:#ff8080;padding:20px;'>Init Error: ${error.message}<br>Check Log.</p>`; } }
logToPage("Checking DOM state..."); if (document.readyState === 'loading') { logToPage("DOM not ready, listening."); document.addEventListener('DOMContentLoaded', runInitialization); } else { logToPage("DOM ready, running init."); runInitialization(); }

// --- END OF FILE main.js ---