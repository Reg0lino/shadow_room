import bpy
import json
import os
import re

# --- Configuration ---
# !! Set these to the armature object name currently active/posed !!
# You might change this depending on whether you have Female or Male active
# Or the script could try to guess the active armature
# ACTIVE_ARMATURE_NAME = "Female" # Or "Male"

# !! Output directory relative to THIS script file's location !!
OUTPUT_BASE_DIR = "poses"

# --- Helper ---
def sanitize_filename(name):
    name = name.split('/')[-1]
    name = re.sub(r'[\s./\\:]+', '_', name)
    name = re.sub(r'[^\w\-]+', '', name)
    return name if name else "unnamed_pose"

# --- Main Function ---
def save_current_pose_to_json(output_filename_base):
    """
    Saves the current pose of the active armature object to a JSON file.
    Assumes you have manually applied the desired pose asset first.
    """
    print(f"\n--- Saving Current Pose to JSON: {output_filename_base} ---")
    context = bpy.context
    obj = context.active_object

    # --- Validate Object ---
    if not obj:
        print("ERROR: No active object selected.")
        return {'CANCELLED'}
    if obj.type != 'ARMATURE':
        # Maybe the mesh is selected? Try finding its armature modifier
        armature_mod = next((mod for mod in obj.modifiers if mod.type == 'ARMATURE'), None)
        if armature_mod and armature_mod.object:
            obj = armature_mod.object
            print(f"INFO: Found armature '{obj.name}' via mesh modifier.")
            if obj.type != 'ARMATURE':
                 print(f"ERROR: Object '{obj.name}' found via modifier is not an Armature.")
                 return {'CANCELLED'}
        else:
            print(f"ERROR: Active object '{obj.name}' is not an Armature, and no armature found via modifier.")
            return {'CANCELLED'}

    armature = obj
    print(f"Processing Armature: {armature.name}")

    # --- Determine Gender and Output Path ---
    gender = "unknown"
    gender_subdir = None
    relative_dir = None
    # Basic check based on common names (adjust if needed)
    if "female" in armature.name.lower() or armature.name == "Female":
         gender = "female"
         gender_subdir = os.path.join(OUTPUT_BASE_DIR, "female")
         relative_dir = os.path.join(OUTPUT_BASE_DIR, "female")
    elif "male" in armature.name.lower() or armature.name == "Male":
         gender = "male"
         gender_subdir = os.path.join(OUTPUT_BASE_DIR, "male")
         relative_dir = os.path.join(OUTPUT_BASE_DIR, "male")
    else:
         print("WARNING: Could not determine gender from armature name. Saving to 'unknown' folder.")
         gender_subdir = os.path.join(OUTPUT_BASE_DIR, "unknown")
         relative_dir = os.path.join(OUTPUT_BASE_DIR, "unknown")


    script_dir = ""
    try: # Determine script directory (best effort)
        if context.space_data and context.space_data.type == 'TEXT_EDITOR' and context.space_data.text and context.space_data.text.filepath:
             script_dir = os.path.dirname(context.space_data.text.filepath)
        elif bpy.data.filepath:
             script_dir = os.path.dirname(bpy.data.filepath)
    except Exception as e:
         print(f"Warning: Could not reliably determine script path: {e}")

    if not script_dir:
         print("Warning: Saving relative to blend file or current directory as script path unknown.")

    output_path = os.path.abspath(os.path.join(script_dir, gender_subdir))
    os.makedirs(output_path, exist_ok=True)
    print(f"Target Output Directory: {output_path}")


    # --- Ensure Pose Mode & Extract Data ---
    original_mode = armature.mode
    pose_data = []
    try:
        # Need to be in pose mode OR ensure visual transforms are applied if in object mode
        if original_mode != 'POSE':
            # Applying visual transform might be needed if called from object mode after posing
             bpy.ops.object.mode_set(mode='OBJECT') # Ensure object mode first maybe?
             # The following line might require the armature to be the active object
             # context.view_layer.objects.active = armature
             # bpy.ops.pose.visual_transform_apply() # This operator only works in Pose Mode
             print("INFO: Armature not in Pose Mode. Reading transforms as-is.")
             # Reading directly might work if pose was just applied

        # Access pose bones (might fail if not truly in pose mode context)
        if not armature.pose:
             print(f"ERROR: Armature '{armature.name}' has no accessible pose data.")
             return {'CANCELLED'}

        print(f"Extracting transforms for {len(armature.pose.bones)} bones...")
        for pbone in armature.pose.bones:
            # Read LOCAL transforms
            loc = list(pbone.location)
            quat = list(pbone.rotation_quaternion) # W, X, Y, Z
            scale = list(pbone.scale)
            pose_data.append({ "name": pbone.name, "position": loc, "quaternion": quat, "scale": scale })

    except Exception as e:
        print(f"ERROR extracting bone data: {e}")
        return {'CANCELLED'}
    finally:
        # Try to restore original mode if we attempted to change it (less critical here)
        pass # Avoid mode setting if reading directly worked


    # --- Save JSON File ---
    if not pose_data:
        print("ERROR: No pose data was extracted.")
        return {'CANCELLED'}

    json_filename = f"{sanitize_filename(output_filename_base)}.json"
    json_filepath = os.path.join(output_path, json_filename)
    relative_json_path = os.path.join(relative_dir, json_filename).replace("\\", "/") if relative_dir else json_filename


    try:
        with open(json_filepath, 'w') as f:
            json.dump(pose_data, f, indent=2)
        print(f"SUCCESS: Saved current pose to: {json_filepath}")

        # --- Optionally update manifest (can be run separately later) ---
        # manifest_path = os.path.join(output_path, "manifest.json")
        # # ... (code to load, update, save manifest) ...

    except IOError as e:
        print(f"ERROR saving JSON file '{json_filepath}': {e}")
        return {'CANCELLED'}
    except Exception as e:
        print(f"ERROR saving JSON data: {e}")
        return {'CANCELLED'}

    return {'FINISHED'}


# --- HOW TO USE ---
# 1. Open your Pose Pack .blend file.
# 2. Select the armature you want to apply poses TO (e.g., "Female" or "Male").
# 3. Go to Pose Mode.
# 4. Use the Asset Browser to apply the desired pose (e.g., double-click "Walk 01 S F").
# 5. IMPORTANT: Define the desired OUTPUT filename base below. Use the Pose Name.
# 6. Run this script from the Text Editor (Alt+P or Run Script button).
# 7. Check the System Console for success/error messages.
# 8. Repeat steps 4-7 for EACH pose you want to extract.
# 9. (Optional) Create manifest.json files manually or with another script later.

# --- !! CHANGE THIS FOR EACH POSE !! ---
pose_name_for_filename = "A-Pose_F" # Example: CHANGE THIS TO MATCH THE APPLIED POSE

# --- Run the function ---
if pose_name_for_filename:
    save_current_pose_to_json(pose_name_for_filename)
else:
    print("ERROR: Please set the 'pose_name_for_filename' variable in the script.")