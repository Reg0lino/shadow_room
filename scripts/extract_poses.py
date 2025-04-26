import bpy
import json
import os
import re
import math
from mathutils import Vector, Quaternion, Matrix # Keep imports

# --- Configuration ---
# !! CORRECTED Armature Object Names !!
FEMALE_ARMATURE_NAME = "Female"
MALE_ARMATURE_NAME = "Male"

# !! IMPORTANT: Output directory relative to THIS script file's location !!
OUTPUT_BASE_DIR = "poses"

# --- Helper Functions ---
def sanitize_filename(name):
    """Removes or replaces characters unsafe for filenames."""
    name = name.split('/')[-1] # Get base name if path-like
    name = re.sub(r'[\s./\\:]+', '_', name) # Replace separators
    name = re.sub(r'[^\w\-]+', '', name)    # Remove unsafe chars
    # Attempt to remove trailing digits/suffixes often added by Blender/AssetBrowser
    name = re.sub(r'(_[FM])?([\._]\d+)?$', '', name).strip() # More robust cleaning
    return name if name else "unnamed_pose"

def get_friendly_pose_name(action_name):
    """Creates a friendlier name from the action/asset name."""
    name = action_name.split('/')[-1] # Get base name
    name = name.replace('_', ' ')
    # Attempt to clean up potential suffixes like .001, .002 etc.
    name = re.sub(r'\.\d+$', '', name).strip()
    # Keep the F/M suffix for display clarity in the manifest key
    # name = re.sub(r'\s+[FM]$', '', name).strip() # Don't remove F/M here
    name = name.title()
    # Handle potential duplicate spaces after replacements
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def update_manifest(manifest_path, pose_friendly_name, relative_json_path):
    """Loads, updates, and saves the manifest JSON file."""
    manifest_data = {}
    try:
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r') as f: manifest_data = json.load(f)
        if not isinstance(manifest_data, dict): manifest_data = {}
    except Exception as e: print(f"  Warning loading manifest '{manifest_path}': {e}")

    # Only add if the friendly name isn't already there (first one wins for duplicates)
    if pose_friendly_name not in manifest_data:
        manifest_data[pose_friendly_name] = relative_json_path
        print(f"  Adding manifest entry: '{pose_friendly_name}' -> '{relative_json_path}'")
        try: # Save the updated manifest immediately after adding
            sorted_manifest = dict(sorted(manifest_data.items()))
            with open(manifest_path, 'w') as f: json.dump(sorted_manifest, f, indent=2)
            # print(f"  Saved updated manifest: {manifest_path}") # Make less verbose
            return True # Indicate update happened
        except Exception as e: print(f"  ERROR saving updated manifest '{manifest_path}': {e}")
    else:
        print(f"  Skipping manifest entry: '{pose_friendly_name}' already exists.")
        return False # Indicate no update happened
    return False


# --- Main Extraction Logic ---
def extract_poses():
    """
    Finds Actions marked as Assets, applies them visually, extracts bone data,
    and saves as JSON files and manifests.
    """
    print("\n--- Starting Pose Extraction (Action Apply Version) ---")
    context = bpy.context
    script_dir = None
    try: # Determine script directory
        if context.space_data and context.space_data.type == 'TEXT_EDITOR' and context.space_data.text and context.space_data.text.filepath:
             script_dir = os.path.dirname(context.space_data.text.filepath)
             print(f"DEBUG: Using saved script file path: {script_dir}")
        elif bpy.data.filepath:
             script_dir = os.path.dirname(bpy.data.filepath)
             print(f"DEBUG: Using saved blend file path: {script_dir}")
        else: print("ERROR: Cannot determine base path."); return {'CANCELLED'}
    except Exception as e: print(f"ERROR determining script path: {e}"); return {'CANCELLED'}

    if script_dir is None: print("ERROR: Failed to determine base directory."); return {'CANCELLED'}

    output_path = os.path.abspath(os.path.join(script_dir, OUTPUT_BASE_DIR))
    female_dir = os.path.join(output_path, "female")
    male_dir = os.path.join(output_path, "male")

    try: # Create output directories
        os.makedirs(female_dir, exist_ok=True); os.makedirs(male_dir, exist_ok=True)
        print(f"Output directories ensured:\n  {female_dir}\n  {male_dir}")
    except OSError as e: print(f"ERROR: Could not create output dirs: {e}"); return {'CANCELLED'}

    # --- Get Armature Objects ---
    female_armature = bpy.data.objects.get(FEMALE_ARMATURE_NAME)
    male_armature = bpy.data.objects.get(MALE_ARMATURE_NAME)

    if not female_armature or female_armature.type != 'ARMATURE': print(f"Warning: Female armature '{FEMALE_ARMATURE_NAME}' not found/invalid."); female_armature = None
    if not male_armature or male_armature.type != 'ARMATURE': print(f"Warning: Male armature '{MALE_ARMATURE_NAME}' not found/invalid."); male_armature = None
    if not female_armature and not male_armature: print("ERROR: Neither armature object found. Aborting."); return {'CANCELLED'}

    print(f"Found Female Armature: {female_armature.name if female_armature else 'Not Found'}")
    print(f"Found Male Armature: {male_armature.name if male_armature else 'Not Found'}")

    female_manifest = {}; male_manifest = {}
    processed_count = 0; skipped_count = 0; error_count = 0
    processed_unique_friendly_names = {"female": set(), "male": set()} # Track unique FRIENDLY names per gender

    original_active_object = context.view_layer.objects.active
    original_mode = 'OBJECT'
    # FIX: Correctly handle mode setting before loop
    if context.object and context.object.mode != 'OBJECT':
        original_mode = context.object.mode
        try:
            bpy.ops.object.mode_set(mode='OBJECT')
        except RuntimeError as e:
            print(f"Warning: Could not ensure Object Mode before starting: {e}")


    print("\n--- Processing Actions Marked as Assets ---")
    asset_actions = [action for action in bpy.data.actions if action.asset_data]
    print(f"Found {len(asset_actions)} actions marked as assets.")

    if not asset_actions: print("Loop skipped as no asset actions were found.")
    else:
        # Sort actions by name for consistent processing order
        asset_actions.sort(key=lambda act: act.name)

        for action in asset_actions:
            action_name = action.name
            target_armature = None
            gender_subdir = None
            manifest_dict = None
            relative_dir = None
            gender = "Unknown"
            gender_subdir_name = "unknown" # For paths

            # --- Determine Gender ---
            action_name_lower = action_name.lower()
            if action_name_lower.endswith(" f") or action_name_lower.endswith("_f") or "/female/" in action_name_lower: gender = "female"
            elif action_name_lower.endswith(" m") or action_name_lower.endswith("_m") or "/male/" in action_name_lower: gender = "male"

            if gender == "female":
                 if female_armature: target_armature, gender_subdir, manifest_dict, relative_dir, gender_subdir_name = female_armature, female_dir, female_manifest, os.path.join(OUTPUT_BASE_DIR, "female"), "female"
                 else: print(f"\nSkipping Female Action '{action_name}': Female armature object not found."); skipped_count += 1; continue
            elif gender == "male":
                 if male_armature: target_armature, gender_subdir, manifest_dict, relative_dir, gender_subdir_name = male_armature, male_dir, male_manifest, os.path.join(OUTPUT_BASE_DIR, "male"), "male"
                 else: print(f"\nSkipping Male Action '{action_name}': Male armature object not found."); skipped_count += 1; continue
            else: print(f"\nSkipping Action '{action_name}': Cannot determine gender from name."); skipped_count += 1; continue

            print(f"\nProcessing Action: '{action_name}' (Gender: {gender}, Target: {target_armature.name})")

            # --- Handle Uniqueness by Friendly Name ---
            friendly_name = get_friendly_pose_name(action_name)
            if friendly_name in processed_unique_friendly_names[gender]:
                print(f"  Skipping: Friendly name '{friendly_name}' already processed for {gender}.")
                skipped_count += 1
                continue
            processed_unique_friendly_names[gender].add(friendly_name)


            # --- Apply Pose and Extract ---
            try:
                if not target_armature.animation_data: target_armature.animation_data_create()

                context.view_layer.objects.active = target_armature
                bpy.ops.object.select_all(action='DESELECT')
                target_armature.select_set(True)
                bpy.ops.object.mode_set(mode='POSE')

                target_armature.animation_data.action = action
                frame_to_set = int(action.frame_range[0]) if action.frame_range else 1
                context.scene.frame_set(frame_to_set)
                context.view_layer.update()
                print(f"  Applied Action visually at frame {frame_to_set}")

                pose_data = []
                if not target_armature.pose: raise ValueError("No pose bones accessible.")

                for pbone in target_armature.pose.bones:
                    loc = list(pbone.location); quat = list(pbone.rotation_quaternion); scale = list(pbone.scale)
                    pose_data.append({ "name": pbone.name, "position": loc, "quaternion": quat, "scale": scale })
                print(f"  Extracted data for {len(pose_data)} bones.")

                # --- Save JSON & Update Manifest ---
                filename_base = sanitize_filename(friendly_name) # Use sanitized FRIENDLY name for file
                if not filename_base: filename_base = sanitize_filename(action_name)
                if not filename_base: filename_base = f"pose_{processed_count}"

                json_filename = f"{filename_base}.json"
                json_filepath = os.path.join(gender_subdir, json_filename)
                relative_json_path = f"{OUTPUT_BASE_DIR}/{gender_subdir_name}/{json_filename}".replace("\\","/")

                # Save JSON
                with open(json_filepath, 'w') as f: json.dump(pose_data, f, indent=2)
                print(f"  Saved pose JSON to: {json_filepath}")

                # Update Manifest (function handles loading/saving)
                update_manifest(os.path.join(gender_subdir, "manifest.json"), friendly_name, relative_json_path)

                processed_count += 1
                target_armature.animation_data.action = None # Unlink action
                bpy.ops.object.mode_set(mode='OBJECT') # Switch back after success

            except Exception as e:
                print(f"  ERROR processing action '{action_name}': {e}")
                error_count += 1
                # Remove from processed set if error occurred before saving
                if friendly_name in processed_unique_friendly_names[gender]:
                     processed_unique_friendly_names[gender].remove(friendly_name)
                # Try to clean up mode
                try:
                    if context.object and context.mode != 'OBJECT': bpy.ops.object.mode_set(mode='OBJECT')
                except: pass

    # --- Final Manifest Save (Ensures file exists even if empty) ---
    try:
        female_manifest_path = os.path.join(female_dir, "manifest.json")
        if not os.path.exists(female_manifest_path): update_manifest(female_manifest_path,"Placeholder", "delete.me") # Create empty if needed
        print(f"\nChecked Female Manifest: {female_manifest_path}")

        male_manifest_path = os.path.join(male_dir, "manifest.json")
        if not os.path.exists(male_manifest_path): update_manifest(male_manifest_path,"Placeholder", "delete.me") # Create empty if needed
        print(f"Checked Male Manifest: {male_manifest_path}")
    except Exception as e: print(f"ERROR checking/creating final manifests: {e}")


    print("\n--- Extraction Complete ---")
    print(f"Successfully processed & saved (unique poses): {processed_count}")
    print(f"Actions skipped (not asset/no gender/duplicate/etc): {skipped_count}")
    print(f"Errors during processing: {error_count}")

    # Restore original state
    try:
        # FIX: Correctly restore original mode
        current_mode = 'OBJECT'
        if context.object and context.object.mode != 'OBJECT':
            current_mode = context.object.mode # Get current mode before changing active

        if original_active_object and original_active_object.name in bpy.data.objects:
            context.view_layer.objects.active = original_active_object
        elif bpy.data.objects: # Fallback: make sure *something* is active
             context.view_layer.objects.active = list(bpy.data.objects)[0]

        # Now try to restore original mode IF the active object supports it
        if context.object and context.object.mode != original_mode:
             try:
                  bpy.ops.object.mode_set(mode=original_mode)
             except RuntimeError:
                  # If original mode isn't valid for the now-active object, just go to object mode
                  if context.object.mode != 'OBJECT':
                      try:
                           bpy.ops.object.mode_set(mode='OBJECT')
                      except: pass # Final fallback, ignore error
                  pass

    except Exception as e: print(f"Warning: Could not fully restore original state: {e}")

    print("--- Script Finished ---")
    return {'FINISHED'}

# --- Run ---
if __name__ == "__main__":
    extract_poses()