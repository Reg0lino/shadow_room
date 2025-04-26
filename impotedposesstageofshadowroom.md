# Shadow Room - Project Status & System Prompt (v2 - Animation Pivot)

## Project Goal

To create a web-based 3D environment ("Shadow Room") using Three.js primarily for artists as a drawing reference tool. Key features include loading various 3D objects, manipulating lighting, adjusting object transforms (position, rotation, scale) and materials, and specifically, loading and posing rigged character models (`femalebase0.glb`, `malebase0.glb`) using a library of predefined poses embedded as single-frame animations within the GLB files.

## Previous Approach & Challenges (External JSON Poses)

*   Initial attempt involved extracting bone transforms (pos/quat/scale) from Blender Actions into separate JSON files (`poses/female/*.json`, `poses/male/*.json`).
*   A Python script (`extract_applied_poses.py`) was developed and iteratively refined to handle gender detection, bone name cleaning (removing `.` -> `spine.001` to `spine001`), and visibility/selection issues (`Cannot edit hidden object`).
*   **BLOCKER:** Despite successful extraction and name cleaning, applying these external JSON poses in the web app (`main.js`) resulted in severe model distortion (collapsing/exploding mesh). This indicated a fundamental mismatch in Rest Pose or coordinate system interpretation between the Blender extraction environment and the Three.js loading/application environment.

## Current Approach: Embedded Animations (Pivot)

*   **Strategy Change:** Pivoted to embedding each static pose as a **single-frame animation clip** directly within the `femalebase0.glb` and `malebase0.glb` files. This ensures perfect consistency between the pose data and the model's internal structure.
*   **Blender Script (`convert_poses_to_keyed_actions.py`):**
    *   Successfully developed and ran a script (v10) in Blender.
    *   This script iterated through the original Asset Actions (`... F`, `... M`).
    *   For each, it created a *new* Action prefixed with `Pose_` (e.g., `Pose_Sit_19_Kneel_M`).
    *   It applied the original pose and inserted a **single keyframe** (location, quaternion rotation, scale) for **all** bones at frame 1 into the new `Pose_...` action.
    *   It successfully added these new `Pose_...` actions as strips to dedicated NLA tracks (`Pose Actions`) for each armature, ensuring they were saved correctly.
*   **Blender File ("Golden Source"):** The source `.blend` file has been prepared:
    *   Both Male/Female Armatures & Meshes have Scale (1,1,1) and Rotation (0,0,0) applied (`Ctrl+A`).
    *   The A-Pose has been applied as the Rest Pose (`Pose -> Apply -> Apply Pose as Rest Pose`).
    *   The `Pose_...` single-frame actions exist and are linked via NLA tracks.
*   **GLB Export:** `femalebase0.glb` and `malebase0.glb` were re-exported from this "Golden Source" file with the crucial **"Animations" checkbox CHECKED** and **"Use Rest Position" UNCHECKED**. These exported files now contain the embedded pose animations.
*   **`poses/` Directory:** The old `poses/` directory containing external JSON files and manifests has been correctly **deleted** as it is obsolete.

## Web Application (`main.js`) Modifications

*   **Significant Overhaul:** `main.js` was substantially modified to support the new embedded animation workflow. Key conceptual changes include:
    *   Added `THREE.Clock` for animation timing.
    *   Modified the `sceneObjects` array structure to store references to `mixer`, `clips`, `availablePoseNames`, `currentAction`, `baseScale`, and `initialBoneState` for each poseable object.
    *   Updated `processLoadedGltf` to initialize the `AnimationMixer`, extract clip names, and calculate the `baseScale` (2.5 for base models, 1.0 otherwise). It applies the `baseScale` as the *initial* scale.
    *   Replaced external JSON loading (`loadPosesForModel`) with `populatePoseDropdownFromClips` which reads clip names from the loaded GLB data.
    *   Replaced JSON pose application (`applyPose`, `applyPoseData`) with `applyPoseAnimation` which uses the `AnimationMixer` to find and play the selected `AnimationClip` (setting it to loop once and pausing on the first frame to "stick" the pose).
    *   Implemented **relative scaling**: The UI scale slider now modifies the object's scale *relative* to its `baseScale`. (`finalScale = baseScale * sliderValue`). `updateSliderValuesFromObject` was updated to reflect this.
    *   Updated `animate` loop to call `mixer.update(deltaTime)`.
    *   **Save/Load Disabled:** The `saveSceneState` and `loadSceneState` functions, along with their button listeners, were **commented out** during debugging to isolate a syntax error. They will need uncommenting and modification later to correctly handle `baseScale`/`relativeScale` and remove pose data saving.

## Current File Structure

```
shadow_room/
│
├── index.html              # Main application page, UI layout
├── poser.html              # Separate tool for detailed bone posing (Not yet updated for embedded anims)
├── js/
│   ├── main.js             # <<< HEAVILY MODIFIED for animations, HAS SYNTAX ERROR
│   └── shapes/             # Shape modules (Unchanged)
│       └── ...
│
├── css/
│   ├── style.css           # Styles for index.html
│   └── poser_style.css     # Styles for poser.html
│
├── models/                 # Stores 3D models
│   ├── femalebase0.glb     # <<< RE-EXPORTED with embedded animations
│   └── malebase0.glb       # <<< RE-EXPORTED with embedded animations
│   └── ... (other models)
│
├── scripts/                # Blender scripts
│   ├── convert_poses_to_keyed_actions.py # Script used to create embedded animations (v10)
│   └── extract_applied_poses.py        # Older script for external JSONs (Obsolete for current approach)
│
└── (other config/readme files)
```

## Immediate Problem & Blocker

*   The Blender side of creating embedded animations seems **complete and successful**.
*   The necessary GLB files containing these animations have been exported.
*   The `main.js` file incorporating the logic for loading and playing these animations has been written.
*   **BLOCKER:** The current `main.js` file **fails to load** in the browser due to a syntax error: **`Uncaught SyntaxError: Unexpected end of input`** (reported at line ~1108-1126).
*   Debugging confirmed the error originates from **within the `loadSceneState` function block** (which is currently commented out, but the error was present when it was *not* commented out). This indicates a missing or misplaced closing brace `}` or parenthesis `)` within that specific function block.

## Next Steps (Assistance Required)

1.  **Fix Syntax Error in `main.js`:**
    *   **Provide the *entire current content* of `main.js` (the version with save/load commented out that still gives the error, or preferably, the version right *before* commenting out save/load).**
    *   **Request:** Ask the next Gemini instance to carefully analyze the provided `main.js` code, specifically focusing on the structure of the `loadSceneState` function (and surrounding functions if necessary), to identify and fix the missing/mismatched closing brace `}` or parenthesis `)` causing the `Unexpected end of input` error.
2.  **Test Core Functionality:** Once the syntax error is fixed:
    *   Load `index.html`. Verify no console errors on load.
    *   Load `femalebase0.glb` or `malebase0.glb`. Verify it loads at 2.5x scale.
    *   Verify the Pose dropdown (`#poseSelect`) populates with animation names (e.g., "Sit 19 Kneel M").
    *   Select various poses. Verify the model **snaps to the correct pose visually** without distortion.
3.  **Test Relative Scaling:** Verify the Scale slider works correctly relative to the base 2.5x scale.
4.  **Re-enable & Fix Save/Load:**
    *   Uncomment the `saveSceneState`, `loadSceneState` functions and their event listeners.
    *   Modify them to correctly save/load `baseScale` and `relativeScale`, removing any attempt to save/load pose-specific data. Test thoroughly.
5.  **(Future) Update `poser.html`:** Adapt `poser.html` to optionally load and apply the embedded pose animations alongside its manual posing tools.
