import bpy
import json
import os
import re

# --- Configuration ---
# !! VERY IMPORTANT: Set these to the EXACT names of your armature objects !!
FEMALE_ARMATURE_NAME = "metarig.001"
MALE_ARMATURE_NAME = "metarig.002"

# !! IMPORTANT: Output directory relative to THIS script file's location !!
# This will create ./poses/female/ and ./poses/male/ relative to where you save the script
OUTPUT_BASE_DIR = "poses"

# --- Helper Functions ---

def sanitize_filename(name):
    """Removes or replaces characters unsafe for filenames."""
    # Remove path prefix if present (e.g., "Female/01_Body/")
    name = name.split('/')[-1]
    # Replace spaces and common separators with underscores
    name = re.sub(r'[\s./\\:]+', '_', name)
    # Remove any characters other than letters, numbers, underscores, hyphens
    name = re.sub(r'[^\w\-]+', '', name)
    # Ensure it's not empty
    return name if name else "unnamed_pose"

def get_friendly_pose_name(action_name):
    """Creates a friendlier name from the action/asset name."""
    name = action_name.split('/')[-1] # Get last part of path
    name = name.replace('_', ' ') # Replace underscores with spaces
    # Simple title case (optional, adjust as needed)
    name = name.title()
    return name

# --- Main Extraction Logic ---

def extract_poses():
    """
    Finds pose library actions, applies them, extracts bone data,
    and saves as JSON files and manifests.
    """
    context = bpy.context
    script_dir = os.path.dirname(bpy.data.filepath) # Gets directory of the SAVED script

    if not script_dir:
         print("ERROR: Please save this script file inside your project first!")
         return {'CANCELLED'}


    output_path = os.path.abspath(os.path.join(script_dir, OUTPUT_BASE_DIR))
    female_dir = os.path.join(output_path, "female")
    male_dir = os.path.join(output_path, "male")

    os.makedirs(female_dir, exist_ok=True)
    os.makedirs(male_dir, exist_ok=True)
    print(f"Output directories ensured: \n  {female_dir}\n  {male_dir}")

    # --- Get Armature References ---
    try:
        female_armature = bpy.data.objects[FEMALE_ARMATURE_NAME]
        if female_armature.type != 'ARMATURE':
            raise TypeError(f"{FEMALE_ARMATURE_NAME} is not an Armature")
        print(f"Found Female Armature: {female_armature.name}")
    except KeyError:
        print(f"ERROR: Female Armature named '{FEMALE_ARMATURE_NAME}' not found in the scene.")
        return {'CANCELLED'}
    except TypeError as e:
        print(f"ERROR: {e}")
        return {'CANCELLED'}

    try:
        male_armature = bpy.data.objects[MALE_ARMATURE_NAME]
        if male_armature.type != 'ARMATURE':
            raise TypeError(f"{MALE_ARMATURE_NAME} is not an Armature")
        print(f"Found Male Armature: {male_armature.name}")
    except KeyError:
        print(f"ERROR: Male Armature named '{MALE_ARMATURE_NAME}' not found in the scene.")
        return {'CANCELLED'}
    except TypeError as e:
        print(f"ERROR: {e}")
        return {'CANCELLED'}


    female_manifest = {}
    male_manifest = {}
    processed_count = 0
    skipped_count = 0

    original_active_object = context.view_layer.objects.active
    original_mode = context.mode if context.object else 'OBJECT'


    print("\n--- Starting Pose Extraction ---")

    # Iterate through all actions, checking if they are pose assets
    for action in bpy.data.actions:
        if not action.asset_data:
            continue # Skip actions not marked as assets

        action_name = action.name # Use the action's name which often includes path
        target_armature = None
        gender_subdir = None
        manifest_dict = None
        relative_dir = None

        # Determine target armature based on action name convention
        if "Female/" in action_name or "/Female/" in action_name:
            target_armature = female_armature
            gender_subdir = female_dir
            manifest_dict = female_manifest
            relative_dir = os.path.join(OUTPUT_BASE_DIR, "female")
            print(f"\nProcessing Female Pose Asset: {action_name}")
        elif "Male/" in action_name or "/Male/" in action_name:
            target_armature = male_armature
            gender_subdir = male_dir
            manifest_dict = male_manifest
            relative_dir = os.path.join(OUTPUT_BASE_DIR, "male")
            print(f"\nProcessing Male Pose Asset: {action_name}")
        else:
            print(f"Skipping action '{action_name}': Cannot determine gender from name/path.")
            skipped_count += 1
            continue

        # --- Apply Pose ---
        try:
            # Ensure armature has animation data container
            if not target_armature.animation_data:
                target_armature.animation_data_create()

            # Set active object and mode
            context.view_layer.objects.active = target_armature
            bpy.ops.object.mode_set(mode='POSE')

            # Apply the action (pose)
            target_armature.animation_data.action = action
            # Evaluate at the first frame of the action (usually frame 1 for pose assets)
            context.scene.frame_set(int(action.frame_range[0]))
            context.view_layer.update() # Force update to apply pose visually
            print(f"  Applied pose '{action.name}' to {target_armature.name}")

            # --- Extract Bone Data ---
            pose_data = []
            for pbone in target_armature.pose.bones:
                # Use LOCAL space transforms - often more reliable for applying poses
                # If this causes issues, switch to world space by getting world matrix
                # and decomposing, but local is usually correct for pose libs.
                loc = pbone.location.to_list()
                quat = pbone.rotation_quaternion.to_list()
                scale = pbone.scale.to_list()

                pose_data.append({
                    "name": pbone.name,
                    "position": loc,
                    "quaternion": quat,
                    "scale": scale
                })
            print(f"  Extracted data for {len(pose_data)} bones.")

            # --- Save JSON File ---
            friendly_name = get_friendly_pose_name(action_name)
            filename_base = sanitize_filename(action_name)
            json_filename = f"{filename_base}.json"
            json_filepath = os.path.join(gender_subdir, json_filename)
            relative_json_path = os.path.join(relative_dir, json_filename).replace("\\", "/") # Use forward slashes

            try:
                with open(json_filepath, 'w') as f:
                    json.dump(pose_data, f, indent=2)
                print(f"  Saved pose JSON to: {json_filepath}")

                # Add to manifest
                manifest_dict[friendly_name] = relative_json_path
                processed_count += 1

            except IOError as e:
                print(f"  ERROR saving JSON file '{json_filepath}': {e}")
            except Exception as e:
                 print(f"  ERROR processing or saving JSON for '{action_name}': {e}")


            # Clean up action link for next iteration
            target_armature.animation_data.action = None
            context.view_layer.update()


        except Exception as e:
            print(f"  ERROR processing asset '{action_name}': {e}")
            skipped_count += 1
        finally:
            # Attempt to switch back to Object mode after each pose
            try:
                 bpy.ops.object.mode_set(mode='OBJECT')
            except:
                 pass # Might already be in object mode or fail if context is wrong


    # --- Save Manifest Files ---
    try:
        female_manifest_path = os.path.join(female_dir, "manifest.json")
        with open(female_manifest_path, 'w') as f:
            json.dump(female_manifest, f, indent=2, sort_keys=True)
        print(f"\nSaved Female Manifest: {female_manifest_path} ({len(female_manifest)} poses)")

        male_manifest_path = os.path.join(male_dir, "manifest.json")
        with open(male_manifest_path, 'w') as f:
            json.dump(male_manifest, f, indent=2, sort_keys=True)
        print(f"Saved Male Manifest: {male_manifest_path} ({len(male_manifest)} poses)")

    except IOError as e:
        print(f"ERROR saving manifest file: {e}")
    except Exception as e:
         print(f"ERROR saving manifests: {e}")


    print("\n--- Extraction Complete ---")
    print(f"Successfully processed: {processed_count}")
    print(f"Skipped/Errors: {skipped_count}")

    # Restore original selection and mode
    try:
        bpy.ops.object.mode_set(mode=original_mode)
        context.view_layer.objects.active = original_active_object
    except Exception as e:
         print(f"Warning: Could not fully restore original state: {e}")

    return {'FINISHED'}

# --- Run the Extraction ---
if __name__ == "__main__":
    extract_poses()