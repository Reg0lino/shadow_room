# Shadow Room Project: Bug Analysis & Feature Planning

## Layman's Terms Outline

1. **Poseable Models List Order**  
   The list of poseable models should always appear at the top of the dropdown for easy access.

2. **Pose Button Not Working**  
   The button to open the pose editor is not functioning, so users can't edit or save poses.

3. **Model Spawning & Management**  
   Currently, new models are being placed on top of each other without removing the previous one. We want to allow users to spawn multiple models, manage them via tabs, and remove them individually.

4. **Default Slider Values**  
   When the app starts, all controls (light, object, environment) should have specific default values for consistency.

5. **Named Save/Load State**  
   Users should be able to save the scene state with a custom name, see a list of saved states, and delete them as needed.

6. **Camera Focus on Selected Object**  
   When multiple objects are present, the camera should focus on the currently selected object.

7. **Camera Decoupling**  
   There should be a button to decouple the camera from the object, allowing free movement instead of always rotating around the object.

---

## Detailed Technical Analysis & Solutions

### 1. Poseable Models List Order

**Problem:**  
Poseable models are not at the top of the dropdown.

**Cause:**  
The HTML `<select>` options are ordered with poseable models after other categories.

**Solution:**  
Reorder the `<optgroup label="Poseable Models">` to be the first group in the dropdown. This is a simple HTML change.

---

### 2. Pose Button Not Working

**Problem:**  
The "Pose" button does nothing.

**Possible Causes:**  
- The button may be disabled due to logic errors.
- The event handler may not be attached or is failing.
- The code that opens the pose editor window is not being called.

**Solution:**  
- Ensure the button is enabled when a poseable model is selected.
- Check that the event handler is attached and correctly opens `glb_extractor.html` with the model path as a parameter.
- Debug the logic in the `handleOpenPoser` function.

---

### 3. Model Spawning & Management

**Problem:**  
New models are spawned on top of existing ones, instead of replacing them.  
**Feature Request:** Allow multiple models, each with a tab for selection and an "X" to remove.

**Current Method:**  
The code removes the previous object before adding a new one. This is a single-object workflow.

**Solution:**  
- Refactor to support an array of objects in the scene.
- Each object gets a tab (with truncated name and "X" button).
- Clicking a tab selects/focuses that object; clicking "X" removes it from the scene and the tab bar.
- Update all transform and material controls to act on the selected object.

---

### 4. Default Slider Values

**Problem:**  
Sliders do not always start at the desired defaults.

**Solution:**  
- Set the default values for all sliders in the HTML and/or initialization code.
- On app start (and when resetting), explicitly set each slider to the required value and trigger their change handlers.

---

### 5. Named Save/Load State

**Problem:**  
Save/load is not user-friendly; users can't name or manage saved states.

**Solution:**  
- Allow users to enter a name when saving a state.
- Store each state in `localStorage` under a key like `sceneState_<name>`.
- Display a list of saved states with their names and an "X" to delete.
- Clicking a name loads that state.

---

### 6. Camera Focus on Selected Object

**Problem:**  
Camera does not focus on the selected object when multiple are present.

**Solution:**  
- When a tab/object is selected, update the camera's target and position to center on that object.
- Use Three.js controls to smoothly move the camera if desired.

---

### 7. Camera Decoupling

**Problem:**  
Camera is always locked to orbit around the object.

**Solution:**  
- Add a button to toggle between "orbit" mode (camera rotates around object) and "free" mode (camera moves independently).
- In "free" mode, disable or modify the OrbitControls target logic.

---

## Methods & Approaches

### Methods Already in Use

- **Single-object management:** The code currently removes the previous object before adding a new one.
- **Dropdown population:** HTML and JS are used to populate and filter the shape/model dropdown.
- **Pose saving/loading:** Uses `localStorage` for pose data, but only for one object at a time.
- **Scene state save/load:** Uses `localStorage` for a single scene state.

### Methods Needed

- **Multi-object management:**  
  - Maintain an array of objects and their metadata (name, type, etc.).
  - Render a tab bar UI for object selection/removal.
  - Update controls and camera based on selected object.

- **Enhanced save/load:**  
  - Store multiple named states in `localStorage`.
  - UI for listing, loading, and deleting states.

- **Camera logic:**  
  - Add logic to focus on selected object.
  - Add toggle for camera decoupling.

- **UI improvements:**  
  - Reorder dropdowns.
  - Add tab bar for objects.
  - Add dialogs/inputs for naming states.

---

## Next Steps

1. **Reorder the poseable models in the dropdown.**
2. **Fix the pose button event handler and enable logic.**
3. **Refactor object management for multi-object support and tab UI.**
4. **Set all slider and control defaults on init/reset.**
5. **Implement named save/load state UI and logic.**
6. **Update camera logic for object focus and decoupling.**
7. **Test all features and refine UI for usability.**

---

## Summary

This plan addresses all current bugs and requested features. The next session should focus on one feature at a time, starting with the dropdown order and pose button, then moving to multi-object support and UI improvements.



# Shadow Room Project: Bug Analysis, Methods, and Script Change Plan

## 1. Poseable Models List Order

**Bug:** Poseable models are not at the top of the dropdown.

**Cause:** The `<optgroup label="Poseable Models">` is not the first group in the HTML `<select>`.

**Method & Script Change:**
- Move the `<optgroup label="Poseable Models">` to the top of the `<select id="shapeSelect">` in `index.html`.
- If the dropdown is dynamically generated, ensure the poseable models are inserted first in the JS logic that builds the dropdown.

---

## 2. Pose Button Not Working

**Bug:** The pose button does not open the pose editor.

**Causes:**
- The button may be disabled due to logic errors.
- The event handler may not be attached or is failing.
- The code that opens the pose editor window is not being called.

**Method & Script Change:**
- Ensure the pose button is enabled when a poseable model is selected.
- Attach an event handler to the pose button that opens `glb_extractor.html` with the model path as a parameter.
- In `main.js`, check the logic in the function that handles the pose button click (likely `handleOpenPoser` or similar).

---

## 3. Model Spawning & Management

**Bug:** New models spawn on top of existing ones; no way to manage multiple models.

**Current Method:** Only one object is managed at a time; new objects replace the old.

**Feature Request:** Allow multiple models, each with a tab for selection and an "X" to remove.

**Method & Script Change:**
- Refactor `main.js` to use an array (e.g., `let objects = [];`) to track all models in the scene.
- Add a UI tab bar (HTML + CSS) that lists each object (truncate name, add "X" for removal).
- Update controls and camera logic to act on the selected object.
- When a new model is added, push it to the array and create a new tab.
- When "X" is clicked, remove the object from the scene and the array.

---

## 4. Default Slider Values

**Bug:** Sliders do not always start at the desired defaults.

**Method & Script Change:**
- In `main.js`, set all slider values explicitly on initialization and reset.
- For randomized values (wall/floor hue, color hue), use a random number generator and assign the value in the initialization function.
- Ensure all slider change handlers are triggered after setting values.

---

## 5. Named Save/Load State

**Bug:** Save/load is not user-friendly; users can't name or manage saved states.

**Method & Script Change:**
- Add an input for naming the state and a save button.
- Store each state in `localStorage` under a key like `sceneState_<name>`.
- Render a list of saved states with their names and an "X" to delete.
- Clicking a name loads that state; clicking "X" deletes it.

---

## 6. Camera Focus on Selected Object

**Bug:** Camera does not focus on the selected object when multiple are present.

**Method & Script Change:**
- When a tab/object is selected, update the camera’s target and position to center on that object.
- Use Three.js controls to smoothly move the camera if desired.

---

## 7. Camera Decoupling

**Bug:** Camera is always locked to orbit around the object.

**Method & Script Change:**
- Add a button to toggle between "orbit" mode (camera rotates around object) and "free" mode (camera moves independently).
- In "free" mode, disable or modify the OrbitControls target logic.

---

## 8. Default Values Reference

Reference for default values (from your notes):

```
Light (SpotLight) --- ON INIT
Intensity: 3.5
Angle: 45°
Penumbra: 0.20
Pos Y: 10.0
Pos X: 3.5
Pos Z: 0.0

Object --- ON INIT
Y Offset: 0.0
Rot X: 0°
Rot Y: 0°
Rot Z: 0°
Scale: 1.00x
Color Hue: RANDOMIZED ON CHOOSING NEW OBJECT (for non-posable objects)
Brightness: 0.50
Roughness: 0.40
Shine: 0.10

Environment
Wall Hue: RANDOMIZED ON INIT
Wall Sat: 0.30
Wall Bright: 0.02
Floor Hue: RANDOMIZED ON INIT
Floor Sat: 0.20
Floor Bright: 0.50
```

---

## Summary Table

| Issue/Feature                | Method/Script Change Summary                                      |
|------------------------------|-------------------------------------------------------------------|
| Poseable Models List Order   | Move optgroup to top in HTML or JS                                |
| Pose Button Not Working      | Fix enable logic, attach handler, open pose editor                |
| Model Spawning & Management  | Use array for objects, add tab UI, update controls/camera         |
| Default Slider Values        | Set values on init/reset, randomize where needed                  |
| Named Save/Load State        | Add input, save/load/delete logic, render list in UI              |
| Camera Focus on Selection    | Update camera target/position on tab select                       |
| Camera Decoupling            | Add toggle button, modify OrbitControls logic                     |

---

## Next Steps

1. Reorder dropdown for poseable models.
2. Fix pose button logic.
3. Refactor for multi-object support and tab UI.
4. Set all slider and control defaults on init/reset.
5. Implement named save/load state UI and logic.
6. Update camera logic for object focus and decoupling.
7. Test all features and refine UI for usability.

---

**This document can be used as a reference for developers and LLMs to understand the current state, bugs, and the required changes to move the project forward.**