# Gemini Pose Modification Task for 3D Character Rig

## 1. Objective

The primary goal is to leverage a multimodal LLM (Gemini 1.5 Pro or similar) to **modify existing 3D character bone transform data** to **approximate a target pose** depicted in a reference image. This is **not** about generating poses from scratch, but rather about intelligently **adjusting the numerical values** of a *current* pose based on a visual target.

The output must be structured JSON data compatible with the provided poser tool (`poser.html`), which uses local bone transforms. This process will be initially experimented with for approximately a dozen common static poses using Google AI Studio or the Gemini API.

## 2. Input Data Provided to the LLM

You will receive the following information within the prompt:

1.  **Target Pose Image:** A clear image file (.jpg, .png) showing a human figure in the desired target pose (e.g., T-Pose, sitting, waving).
2.  **Current Pose Data (JSON):** A JSON string representing an array of objects. Each object corresponds to a bone in the character's skeleton and contains its *current* **local** transforms relative to its parent bone. The structure for each bone object is:
    ```json
    {
      "name": "bone_name_string",
      "position": [x, y, z],    // Local position array (Float[3])
      "quaternion": [x, y, z, w], // Local rotation quaternion array (Float[4])
      "scale": [x, y, z]       // Local scale array (Float[3]) - Usually [1,1,1]
    }
    ```
    *(This data will be captured from the poser tool's debug output or a saved file representing the character's state **before** modification).*
3.  **Skeleton Hierarchy & Naming Context:** A definitive list of all bone names present in the target character rig's skeleton (e.g., `['hip', 'spine001', ..., 'handL', 'f_index01L', ..., 'toeR']`). Explicitly stating the parent-child relationships is ideal if possible, but providing the complete list of expected bone names is essential.
4.  **Coordinate System:** Explicit definition: **Y-Up, +Z Forward, +X Right** (standard for glTF/Blender).

## 3. Output Requirements

The LLM **MUST** output:

1.  **Valid JSON:** The output should be **only** the modified JSON data, without any introductory text, explanations, or code formatting backticks.
2.  **Identical Structure:** The JSON structure must exactly match the input `Current Pose Data` format: an array of objects, each with `name`, `position`, `quaternion`, and `scale` keys containing arrays of numbers.
3.  **Modified Values:** The numerical values for `position` and `quaternion` should be adjusted from the input data to make the rig approximate the pose shown in the `Target Pose Image`.
4.  **Local Transforms:** **Crucially**, the output `position` and `quaternion` values **MUST remain local transforms** relative to each bone's parent. Do **NOT** output world-space coordinates or rotations.
5.  **Scale:** Maintain the `scale` values from the input data, which will typically be `[1.0, 1.0, 1.0]` for all bones, unless specifically instructed otherwise for a unique effect.
6.  **Completeness:** The output JSON array **MUST contain an object for EVERY bone name** provided in the Skeleton Hierarchy context, even if its transform doesn't change significantly from the input data.

## 4. Core Task: Analysis & Modification

The core task involves:

1.  **Visual Analysis:** Understand the spatial arrangement of limbs, torso posture, head direction, and potentially finer details (like hand shapes if clear) in the `Target Pose Image`.
2.  **Contextual Comparison:** Relate the visual target pose to the provided `Current Pose Data`. Understand which bone transforms need modification.
3.  **Numerical Adjustment:** Calculate the necessary changes to the local `position` and `quaternion` values in the input JSON to achieve the target pose approximation. This requires an implicit understanding of how local rotations/positions combine up the hierarchy to form the final pose.
4.  **Constraint Adherence:** While performing adjustments, attempt to respect natural human joint limits (e.g., prevent elbows/knees bending backward, limit neck/spine twisting). *Note: Perfect physical accuracy is not expected, basic plausibility is the goal. Post-processing may handle fine-tuning.*

## 5. Key Considerations & Constraints

*   **LOCAL TRANSFORMS ARE PARAMOUNT:** Output values must be relative to parent bones.
*   **Quaternions:** Output rotations as quaternions `[x, y, z, w]`.
*   **Completeness:** Output data for all specified bones.
*   **Plausibility > Perfection:** Aim for poses that look anatomically reasonable. Minor inaccuracies are acceptable and may be corrected later. Avoid impossible joint configurations.
*   **Root Bone:** Pay attention to the root bone's (`hip` or equivalent) position and orientation, especially if the target pose involves sitting or a significant shift in stance relative to the input pose. However, often only child bone transforms need significant changes.
*   **Fingers:** For poses like a fist, attempt to rotate the local finger joint quaternions appropriately.

## 6. Workflow within Google AI Studio (for Experimentation)

1.  **Prepare Inputs:**
    *   Select a clear `Target Pose Image`.
    *   Open the `poser.html` tool, load a model, and pose it roughly (or use its default state).
    *   Open the Debug Panel ('D' key) in `poser.html`.
    *   Copy the *entire* current bone data array displayed in the Debug Panel.
2.  **Prepare Prompt:**
    *   Use the Example Prompt Template below.
    *   Paste the list of bone names for the specific rig being used (e.g., `male_base0.glb`).
    *   Paste the copied *Current Pose Data* JSON into the designated section.
3.  **Use AI Studio:**
    *   Start a new chat with Gemini 1.5 Pro (or the latest multimodal model).
    *   Paste the fully constructed prompt into the input field.
    *   Upload the `Target Pose Image` using the image input feature.
    *   Submit the prompt.
4.  **Evaluate Output:**
    *   Check if the response is **only** valid JSON, starting with `[` and ending with `]`.
    *   Copy the JSON output.
    *   **Validate:** Use a JSON validator (like an online tool or VS Code's features) to ensure it's syntactically correct. Check if it contains all expected bones.
    *   **(Manual Step for Now):** Save the validated JSON output to a local file (e.g., `generated_t_pose.json`).
5.  **Test in Poser:**
    *   Use the "Load Pose File" button in `poser.html` to load the generated JSON file.
    *   Visually inspect if the model approximates the target pose. Note any inaccuracies (joint limits, strange angles).
6.  **Iterate:** Refine the prompt (add more constraints, improve examples, clarify instructions) based on the quality of the generated JSON and the resulting pose. Repeat for different target poses.

## 7. Example Prompt Template

```text
Role: You are an expert 3D character animation assistant specializing in converting pose references into specific bone transform data for game development rigs.

Context:
- You will be given an image showing a target human pose.
- You will also be given the current bone transform data for a 3D character rig in JSON format below, marked as 'Current Pose Data'.
- Each object in the 'Current Pose Data' array represents a bone with its LOCAL position [x,y,z], LOCAL quaternion rotation [x,y,z,w] (relative to its parent bone), and LOCAL scale [x,y,z].
- The coordinate system is Y-Up, +Z Forward, +X Right.
- The target skeleton hierarchy uses exactly these bone names:
  [PASTE THE LIST OF BONE NAMES FOR THE SPECIFIC RIG HERE, e.g., 'hip', 'spine001', 'spine002', ...]

Task:
Analyze the target pose in the provided image: [IMAGE DATA WILL BE PROVIDED HERE].
Compare it to the pose represented by the 'Current Pose Data' below.
Modify the numerical values (primarily 'position' and 'quaternion') within the 'Current Pose Data' JSON structure to make the character rig approximate the target pose shown in the image.
Ensure the output 'position' and 'quaternion' remain LOCAL transforms relative to the parent bone.
Attempt to maintain natural human joint limits and avoid physically impossible configurations (e.g., elbows/knees bending backward, excessive twisting).
Maintain the original scale values (usually [1.0, 1.0, 1.0]) for all bones unless the pose clearly implies a scale change (rare).
Output *only* the modified JSON data for *all* bones listed in the context, ensuring the structure is identical to the input 'Current Pose Data'. Do not include any explanatory text or formatting like markdown code blocks.

Current Pose Data:
```json
[PASTE THE CAPTURED JSON DATA FROM THE POSER TOOL DEBUG PANEL HERE]
```

Modified Pose Data Output (JSON only):
```json
[
  // Generate the modified array of bone transform objects here...
]
```

## 8. Initial Target Poses (Approx. 1 Dozen)

1.  T-Pose (Arms straight out, palms down)
2.  A-Pose (Arms slightly down, palms facing body/slightly back)
3.  Arms Raised (Straight overhead)
4.  Arms Forward (Straight out in front)
5.  Hands on Hips
6.  Sitting (Neutral, on an imaginary chair)
7.  Standing (Neutral, relaxed)
8.  Waving (One arm raised and bent)
9.  Reaching Forward (One arm extended)
10. Left Hand Fist (Focus on modifying only left-hand finger bones, keep others similar to input)
11. Right Hand Fist (Focus on modifying only right-hand finger bones)
12. Crouching/Ready Stance