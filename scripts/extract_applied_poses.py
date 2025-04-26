import bpy
import json
import os
import mathutils # Keep for potential future use

print("--- Starting Pose Extraction Script (v6) ---")

# --- Configuration ---
OUTPUT_DIR_BASE = os.path.join(os.path.dirname(bpy.data.filepath), "..", "poses")
FEMALE_ARMATURE_NAME = "Female"
MALE_ARMATURE_NAME = "Male"
FLOAT_TOLERANCE = 1e-5

# --- Helper Functions ---

def ensure_object_mode():
    """Ensures Blender is in Object Mode."""
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        try:
            bpy.ops.object.mode_set(mode='OBJECT')
        except RuntimeError as e:
            if "context is incorrect" not in str(e):
                 print(f"    WARNING: Could not switch to Object Mode automatically: {e}. Might be okay.")


# --- === REVISED Collection Visibility Logic v6 === ---
def unhide_path_to_collection(layer_collection_root, target_collection):
    """
    Recursively searches for the layer collection matching target_collection
    and unhides it and its parents in the viewport. Returns True if found and path unhidden.
    """
    # Check current layer collection
    if layer_collection_root.collection == target_collection:
        # Found the target collection's layer_collection. Unhide it.
        needs_update = False
        if layer_collection_root.hide_viewport:
            print(f"    Unhiding Viewport: LayerCollection '{layer_collection_root.name}' (for Collection '{target_collection.name}')")
            layer_collection_root.hide_viewport = False
            needs_update = True
        if layer_collection_root.exclude:
            print(f"    Disabling Exclude: LayerCollection '{layer_collection_root.name}' (for Collection '{target_collection.name}')")
            layer_collection_root.exclude = False
            needs_update = True
        # if needs_update: print("    -> Path node unhidden.")
        return True # Found the target down this path

    # Recursively search children
    for child_lc in layer_collection_root.children:
        if unhide_path_to_collection(child_lc, target_collection):
            # If target was found in a child, ensure this parent is also visible
            needs_update = False
            if layer_collection_root.hide_viewport:
                print(f"    Unhiding Viewport Parent: LayerCollection '{layer_collection_root.name}'")
                layer_collection_root.hide_viewport = False
                needs_update = True
            if layer_collection_root.exclude:
                print(f"    Disabling Exclude Parent: LayerCollection '{layer_collection_root.name}'")
                layer_collection_root.exclude = False
                needs_update = True
            # if needs_update: print("    -> Path parent node unhidden.")
            return True # Target was found down this branch

    # Target collection not found in this branch
    return False

def ensure_collection_visible(obj, view_layer):
    """Ensures the collection path containing the object is visible in the view layer."""
    if not obj or not view_layer:
        print(f"    ERROR: Invalid input to ensure_collection_visible (obj: {obj}, view_layer: {view_layer})")
        return False
    path_ensured = False
    try:
        if not obj.users_collection:
             print(f"    INFO: Object '{obj.name}' is not linked to any collection. Assuming visible.")
             return True

        print(f"    Ensuring collection visibility path for '{obj.name}'...")
        # We need to ensure at least one collection path is visible
        for coll in obj.users_collection:
             if unhide_path_to_collection(view_layer.layer_collection, coll):
                  path_ensured = True
                  # print(f"    Successfully ensured visibility for path containing Collection '{coll.name}'.")
                  # Break? Or ensure all paths are visible? Let's ensure at least one.
                  break # Found one visible path, that should be enough
             else:
                  # This collection wasn't found under the root view layer collection tree
                  print(f"    INFO: Collection '{coll.name}' for object '{obj.name}' not found under root LayerCollection '{view_layer.layer_collection.name}'.")

        if not path_ensured:
             print(f"    WARNING: Could not ensure any collection path was visible for '{obj.name}'.")
             # Might still work if object is linked directly to scene collection and scene is visible

        return True # Return true, but rely on subsequent steps to fail if truly hidden

    except Exception as e:
        print(f"    ERROR ensuring collection visibility for '{obj.name}': {e}")
        import traceback
        traceback.print_exc()
        return False
# --- === END REVISED Collection Visibility Logic v6 === ---


def set_active_and_selected(obj):
    """Sets the object as active and selected, ensuring visibility of object and collection."""
    if not obj:
        print("   ERROR: Object provided to set_active_and_selected is None.")
        return False
    try:
        ensure_object_mode()
        view_layer = bpy.context.view_layer

        # 1. Ensure Collection Path is Visible FIRST
        if not ensure_collection_visible(obj, view_layer):
             print(f"   WARNING: Failed attempting to ensure collection visibility for '{obj.name}'. Proceeding with caution.")
             # Don't abort yet, maybe object itself is the issue or it's linked differently

        # 2. Ensure Object is Visible/Selectable
        obj.hide_set(False)
        obj.hide_select = False
        obj.hide_render = False
        print(f"    Set object '{obj.name}' visibility/selectability flags.")

        # 3. Deselect All and Select/Activate Object
        bpy.ops.object.select_all(action='DESELECT')
        try:
             obj.select_set(True)
             print(f"    Set '{obj.name}' selected state.")
        except Exception as e_sel:
             # This might fail if truly hidden despite checks
             print(f"    ERROR during obj.select_set(True) for '{obj.name}': {e_sel}. Aborting.")
             return False
        try:
            if view_layer.objects.active != obj:
                 view_layer.objects.active = obj
            print(f"    Set '{obj.name}' as active object for the view layer.")
        except Exception as e_act:
             print(f"    ERROR setting '{obj.name}' as active object: {e_act}. Aborting.")
             return False

        # 4. Force View Layer Update (Crucial after visibility changes)
        view_layer.update()
        # bpy.context.evaluated_depsgraph_get().update() # Maybe not needed if view_layer.update() works

        print(f"    Finished selection/activation attempt for '{obj.name}'.")
        return True

    except Exception as e:
        print(f"    ERROR: Unexpected failure in set_active_and_selected for '{obj.name}': {e}")
        import traceback
        traceback.print_exc()
        return False

# --- Main Script ---
# (Initialize directories, get armatures, prepare data dicts - same as v5)
# ...
female_output_dir = os.path.join(OUTPUT_DIR_BASE, "female")
male_output_dir = os.path.join(OUTPUT_DIR_BASE, "male")
os.makedirs(female_output_dir, exist_ok=True)
os.makedirs(male_output_dir, exist_ok=True)

female_armature_obj = bpy.data.objects.get(FEMALE_ARMATURE_NAME)
male_armature_obj = bpy.data.objects.get(MALE_ARMATURE_NAME)

if not female_armature_obj: print(f"WARNING: Female armature '{FEMALE_ARMATURE_NAME}' not found.")
if not male_armature_obj: print(f"WARNING: Male armature '{MALE_ARMATURE_NAME}' not found.")

female_poses, male_poses = {}, {}
processed_pose_names_female, processed_pose_names_male = set(), set()
total_actions, asset_actions_count, processed_count = len(bpy.data.actions), 0, 0
skipped_gender_count, skipped_duplicate_count, error_count = 0, 0, 0

print(f"Scanning {total_actions} total actions...")

# --- Loop Through Actions Marked as Assets ---
for i, action in enumerate(bpy.data.actions):
    if not action.asset_data: continue

    asset_actions_count += 1
    action_name = action.name
    action_name_clean_suffix = action_name.strip()
    action_name_lower = action_name_clean_suffix.lower()

    print(f"\nProcessing Asset Action {asset_actions_count}: '{action_name}' ({i+1}/{total_actions})")

    armature_obj, output_dir, pose_dict, processed_names_set = None, None, None, None
    gender, relative_dir_name = "Unknown", ""

    # (Gender detection logic - same as v5)
    # ...
    if action_name_lower.endswith(' f'):
        armature_obj, output_dir, pose_dict, processed_names_set, gender, relative_dir_name = female_armature_obj, female_output_dir, female_poses, processed_pose_names_female, "Female", "female"
    elif action_name_lower.endswith(' m'):
        armature_obj, output_dir, pose_dict, processed_names_set, gender, relative_dir_name = male_armature_obj, male_output_dir, male_poses, processed_pose_names_male, "Male", "male"
    elif "female" in action_name_lower or "woman" in action_name_lower:
         armature_obj, output_dir, pose_dict, processed_names_set, gender, relative_dir_name = female_armature_obj, female_output_dir, female_poses, processed_pose_names_female, "Female (Keyword Match)", "female"; print(f"  INFO: Matched gender via keyword for '{action_name}'.")
    elif "male" in action_name_lower or "man" in action_name_lower:
         armature_obj, output_dir, pose_dict, processed_names_set, gender, relative_dir_name = male_armature_obj, male_output_dir, male_poses, processed_pose_names_male, "Male (Keyword Match)", "male"; print(f"  INFO: Matched gender via keyword for '{action_name}'.")
    else:
         print(f"  Skipping '{action_name}': Could not determine gender."); skipped_gender_count += 1; continue

    if not armature_obj:
        print(f"  Skipping '{action_name}': Target {gender} armature object not found.");
        if gender != "Unknown": error_count += 1
        continue

    friendly_pose_name = action_name
    if friendly_pose_name in processed_names_set:
        print(f"  Skipping '{friendly_pose_name}': Duplicate name."); skipped_duplicate_count += 1; continue

    print(f"  Targeting {gender} Armature: '{armature_obj.name}'")

    # --- Apply the Pose ---
    current_action_applied = False
    try:
        ensure_object_mode()
        if not set_active_and_selected(armature_obj):
             print(f"  ERROR: Failed critical step to activate/select '{armature_obj.name}'. Skipping pose.")
             error_count += 1
             continue

        if not armature_obj.animation_data: armature_obj.animation_data_create()
        armature_obj.animation_data.action = action
        current_action_applied = True

        bpy.context.scene.frame_set(1)
        bpy.context.view_layer.update() # Update after setting action and frame
        print(f"  Applied action '{action_name}' to '{armature_obj.name}' at frame 1.")

        print("  Attempting to switch to Pose Mode...")
        bpy.ops.object.mode_set(mode='POSE')
        print("  Successfully entered Pose Mode.")

        # (Extract bone data - same as v5)
        # ...
        current_pose_data = []
        extracted_bone_count = 0
        # print("  Extracting bone transforms...") # Reduce log noise
        for bone in armature_obj.pose.bones:
            cleaned_name = bone.name.replace(".", "")
            pos = bone.location; quat = bone.rotation_quaternion; scale = bone.scale
            bone_data = {'name': cleaned_name, 'position': [pos.x, pos.y, pos.z], 'quaternion': [quat.x, quat.y, quat.z, quat.w], 'scale': [scale.x, scale.y, scale.z]}
            current_pose_data.append(bone_data)
            extracted_bone_count += 1
        print(f"  Extracted data for {extracted_bone_count} bones.")

        # (Save Pose JSON - same as v5)
        # ...
        safe_filename = friendly_pose_name.replace(" ", "_").replace("/", "-").replace("\\", "-")
        json_filename = f"{safe_filename}.json"; json_filepath = os.path.join(output_dir, json_filename)
        relative_filepath = os.path.join("poses", relative_dir_name, json_filename).replace("\\", "/")
        # print(f"  Saving pose data to: {json_filepath}") # Reduce log noise
        try:
            with open(json_filepath, 'w') as f: json.dump(current_pose_data, f, indent=2)
            pose_dict[friendly_pose_name] = relative_filepath
            processed_names_set.add(friendly_pose_name); processed_count += 1
            print(f"  Successfully saved '{friendly_pose_name}'.")
        except IOError as e: print(f"  ERROR writing JSON '{json_filepath}': {e}"); error_count += 1
        except TypeError as e: print(f"  ERROR serializing JSON for '{friendly_pose_name}': {e}"); error_count += 1

    except RuntimeError as e:
        if "Cannot edit hidden object" in str(e) or "context is incorrect" in str(e).lower():
             print(f"  ERROR switching mode for '{armature_obj.name}': {e}. Object/Collection still hidden?")
        else: print(f"  RUNTIME ERROR processing action '{action_name}': {e}")
        error_count += 1
    except Exception as e:
        print(f"  UNEXPECTED ERROR processing action '{action_name}': {e}")
        error_count += 1
        import traceback; traceback.print_exc()
    finally:
        # --- Ensure back to Object Mode & clear action ---
        ensure_object_mode()
        if current_action_applied and armature_obj and armature_obj.animation_data:
             if armature_obj.animation_data.action == action: armature_obj.animation_data.action = None

# --- Save Manifest Files & Summary ---
# ... (same as v5) ...
print("\n--- Saving Manifest Files ---")
female_manifest_path = os.path.join(female_output_dir, "manifest.json"); male_manifest_path = os.path.join(male_output_dir, "manifest.json")
try:
    with open(female_manifest_path, 'w') as f: json.dump(female_poses, f, indent=4, sort_keys=True)
    print(f"Female manifest saved: '{female_manifest_path}' ({len(female_poses)} poses)")
except IOError as e: print(f"ERROR writing Female manifest '{female_manifest_path}': {e}"); error_count += 1
try:
    with open(male_manifest_path, 'w') as f: json.dump(male_poses, f, indent=4, sort_keys=True)
    print(f"Male manifest saved: '{male_manifest_path}' ({len(male_poses)} poses)")
except IOError as e: print(f"ERROR writing Male manifest '{male_manifest_path}': {e}"); error_count += 1

print("\n--- Pose Extraction Summary ---")
print(f"Total Asset Actions Found: {asset_actions_count}"); print(f"Successfully Processed & Saved: {processed_count}")
print(f"Skipped (Ambiguous Gender): {skipped_gender_count}"); print(f"Skipped (Duplicate Name): {skipped_duplicate_count}")
print(f"Errors Encountered: {error_count}"); print("--- Script Finished ---")