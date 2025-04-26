# START OF FILE: convert_poses_to_keyed_actions.py (v10.1 - Corrected Names)
import bpy
import re

print("\n--- Starting Pose Conversion Script (v10.1) ---")

# --- Configuration ---
# Find armatures automatically (MODIFIED TO MATCH USER'S FILE)
FEMALE_ARMATURE_NAME = "metarig.001" # Or the specific name of the female rig object
MALE_ARMATURE_NAME = "metarig.002"     # Or the specific name of the male rig object
NLA_TRACK_NAME = "Pose Actions"      # Name for the NLA track to store poses
ACTION_PREFIX = "Pose_"               # Prefix for the newly created single-frame actions

# --- Helper Functions ---
def get_armature(name):
    """Gets the armature object by name."""
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'ARMATURE':
        print(f"Found armature: '{name}'")
        return obj
    print(f"Warning: Armature object named '{name}' not found or not an armature.")
    return None

def clean_action_name(original_name):
    """Cleans the action name for use in the new pose action."""
    # Remove gender suffix like " F" or " M" if present at the end
    cleaned = re.sub(r'\s+[FM]$', '', original_name).strip()
    # Replace spaces/periods with underscores for cleaner naming convention
    cleaned = re.sub(r'[ .]+', '_', cleaned)
    return cleaned

def ensure_object_visible_and_selectable(obj):
    """Ensures an object is visible and selectable in the current view layer."""
    if not obj:
        return False
    try:
        if obj.hide_get(): obj.hide_set(False); print(f"  Made object '{obj.name}' visible.")
        if obj.hide_render: obj.hide_render = False; print(f"  Made object '{obj.name}' renderable.")
        if obj.hide_select: obj.hide_select = False; print(f"  Made object '{obj.name}' selectable.")

        for coll in bpy.data.collections:
            if obj.name in coll.objects:
                layer_collection = bpy.context.view_layer.layer_collection.children.get(coll.name)
                if not layer_collection: # Might be nested deeper, basic check
                    for lc in bpy.context.view_layer.layer_collection.children:
                        if layer_collection: break
                        if hasattr(lc, 'children'):
                            layer_collection = lc.children.get(coll.name)

                if layer_collection:
                    current_lc = layer_collection
                    while current_lc:
                        if current_lc.hide_viewport: current_lc.hide_viewport = False; print(f"  Made LayerColl '{current_lc.name}' visible.")
                        if current_lc.exclude: current_lc.exclude = False; print(f"  Included LayerColl '{current_lc.name}'.")
                        current_lc = current_lc.parent
                else:
                     print(f"  Warning: Could not find Layer Collection for Collection '{coll.name}'. Visibility might be indirect.")


        bpy.context.view_layer.update()
        print(f"  Visibility/Selectability checks complete for '{obj.name}'.")
        return True

    except Exception as e:
        print(f"Error ensuring visibility/selectability for {obj.name}: {e}")
        return False

def process_armature(armature, gender_suffix):
    """Processes poses for a specific armature."""
    if not armature:
        return

    print(f"\nProcessing Armature: {armature.name} (Expected Gender: {gender_suffix})")

    if not ensure_object_visible_and_selectable(armature):
         print(f"Skipping {armature.name} due to visibility/selectability issues.")
         return

    # Ensure armature is the active object and in Pose Mode
    try:
        if bpy.context.mode != 'OBJECT':
            bpy.ops.object.mode_set(mode='OBJECT') # Go to object mode first
        bpy.ops.object.select_all(action='DESELECT')
        armature.select_set(True)
        bpy.context.view_layer.objects.active = armature
        bpy.ops.object.mode_set(mode='POSE')
        print(f"  Switched {armature.name} to Pose Mode.")
    except RuntimeError as e:
        print(f"  Error setting mode for {armature.name}: {e}. Attempting to continue...")
        if bpy.context.object != armature or bpy.context.mode != 'POSE':
            print(f"  FATAL: Could not switch {armature.name} to Pose Mode. Skipping.")
            bpy.ops.object.mode_set(mode='OBJECT') # Try to return to object mode
            return


    # Find the NLA track or create it
    if not armature.animation_data:
        armature.animation_data_create()

    nla_track = armature.animation_data.nla_tracks.get(NLA_TRACK_NAME)
    if not nla_track:
        nla_track = armature.animation_data.nla_tracks.new(name=NLA_TRACK_NAME)
        print(f"  Created NLA track: '{NLA_TRACK_NAME}'")
    else:
        print(f"  Found existing NLA track: '{NLA_TRACK_NAME}'")
        # Optional: Clear existing strips if you want to rebuild
        # strips_to_remove = [strip for strip in nla_track.strips]
        # for strip in strips_to_remove:
        #    nla_track.strips.remove(strip)
        # print(f"  Cleared existing strips from '{NLA_TRACK_NAME}'.")


    # Filter original actions based on gender suffix in their name
    original_actions = [
        action for action in bpy.data.actions
        if action.name.endswith(f" {gender_suffix}") and not action.name.startswith(ACTION_PREFIX)
    ]

    print(f"  Found {len(original_actions)} original actions ending with ' {gender_suffix}'.")

    processed_count = 0
    skipped_count = 0

    for original_action in original_actions:
        print(f"\n  Processing Original Action: '{original_action.name}'")

        # Generate the new action name
        new_action_name_base = clean_action_name(original_action.name)
        new_action_name = f"{ACTION_PREFIX}{new_action_name_base}_{gender_suffix}" # Add gender back for uniqueness if needed

        # Check if a pose action with this name already exists
        existing_pose_action = bpy.data.actions.get(new_action_name)
        strip_exists_for_action = False
        if existing_pose_action:
             strip_exists_for_action = any(strip.action == existing_pose_action for strip in nla_track.strips)

        if existing_pose_action and strip_exists_for_action:
            print(f"    Skipping: Pose action '{new_action_name}' already exists AND is on NLA track.")
            skipped_count += 1
            continue # Skip to the next original action
        elif existing_pose_action and not strip_exists_for_action:
             print(f"    Pose action '{new_action_name}' exists but not on NLA track. Adding strip.")
             try:
                 nla_track.strips.new(name=new_action_name, start=1, action=existing_pose_action) # Adjust start frame if needed
                 print(f"      Added existing action '{new_action_name}' to NLA track.")
             except Exception as e:
                 print(f"      ERROR adding existing action strip for '{new_action_name}': {e}")
             skipped_count += 1 # Count as skipped creation, but added strip
             continue


        # 1. Apply the original pose action
        current_action_backup = None # Backup current action if any
        if armature.animation_data:
            current_action_backup = armature.animation_data.action

        try:
            print(f"    Applying original action '{original_action.name}'...")
            # Ensure mode is correct
            if bpy.context.mode != 'POSE':
                bpy.ops.object.mode_set(mode='POSE')
            if bpy.context.object != armature:
                 bpy.ops.object.select_all(action='DESELECT')
                 armature.select_set(True)
                 bpy.context.view_layer.objects.active = armature
                 bpy.ops.object.mode_set(mode='POSE')


            # Assign the action temporarily to apply the pose
            armature.animation_data.action = original_action
            bpy.context.scene.frame_set(1) # Evaluate pose at frame 1
            bpy.context.view_layer.update() # Ensure pose updates
            print(f"    Pose applied from '{original_action.name}'.")

        except Exception as e:
            print(f"    ERROR applying original action '{original_action.name}': {e}. Skipping.")
            skipped_count += 1
            # Restore backup action
            if armature.animation_data:
                 armature.animation_data.action = current_action_backup
            continue


        # 2. Create the new single-frame action
        print(f"    Creating new pose action: '{new_action_name}'")
        new_action = bpy.data.actions.new(name=new_action_name)
        # Assign it temporarily to the armature to receive keyframes
        armature.animation_data.action = new_action


        # 3. Keyframe ALL pose bones at frame 1
        keyframed_bones = 0
        try:
            bpy.ops.pose.select_all(action='SELECT') # Select all pose bones
            # Insert keyframe for Location, Rotation (Quaternion), and Scale AT FRAME 1
            bpy.ops.anim.keyframe_insert_menu(type='LocRotScale', frame=1)
            keyframed_bones = len(bpy.context.selected_pose_bones)
            print(f"    Inserted LocRotScale keyframe for {keyframed_bones} selected bones at frame 1 into '{new_action.name}'.")

        except Exception as e:
            print(f"    ERROR keyframing pose for '{new_action_name}': {e}. Skipping.")
            # Clean up the potentially partially created action
            bpy.data.actions.remove(new_action)
            # Restore backup action
            if armature.animation_data:
                 armature.animation_data.action = current_action_backup
            skipped_count += 1
            continue

        # 4. Add the new action as a strip to the NLA track
        try:
            # Make sure NLA track exists
             if not armature.animation_data.nla_tracks.get(NLA_TRACK_NAME):
                 nla_track = armature.animation_data.nla_tracks.new(name=NLA_TRACK_NAME)
                 print(f"      Re-created NLA track: '{NLA_TRACK_NAME}' just in case.")
             else:
                 nla_track = armature.animation_data.nla_tracks.get(NLA_TRACK_NAME)

            strip = nla_track.strips.new(name=new_action.name, start=1, action=new_action)
            strip.frame_end = 2 # Ensure strip has a length of 1 frame visually
            print(f"    Added action '{new_action.name}' to NLA track '{NLA_TRACK_NAME}'.")
            processed_count += 1
        except Exception as e:
             print(f"    ERROR adding strip for '{new_action.name}' to NLA: {e}. Action created but not added to NLA.")
             skipped_count += 1

        # Restore backup action (or clear if none existed)
        if armature.animation_data:
            armature.animation_data.action = current_action_backup


    print(f"\nFinished processing for {armature.name}.")
    print(f"  Successfully processed and added to NLA: {processed_count}")
    print(f"  Skipped/Existing/Error: {skipped_count}")

# --- Main Execution ---
female_armature = get_armature(FEMALE_ARMATURE_NAME)
male_armature = get_armature(MALE_ARMATURE_NAME)

if not female_armature and not male_armature:
    print("Error: Neither specified armature found. Aborting.")
else:
    # --- IMPORTANT: Reset to Rest Pose before processing ---
    print("\nEnsuring armatures are in Rest Pose before starting...")
    initial_mode = bpy.context.mode
    active_obj_backup = bpy.context.view_layer.objects.active
    selected_obj_backup = bpy.context.selected_objects[:]

    try:
        bpy.ops.object.mode_set(mode='OBJECT') # Go to object mode
        if female_armature:
            bpy.ops.object.select_all(action='DESELECT')
            female_armature.select_set(True)
            bpy.context.view_layer.objects.active = female_armature
            bpy.ops.object.mode_set(mode='POSE')
            bpy.ops.pose.select_all(action='SELECT')
            bpy.ops.pose.transforms_clear() # Clear transforms (alternative to applying rest)
            print(f"  Cleared transforms for {female_armature.name} (Reset to Rest)")
            bpy.ops.object.mode_set(mode='OBJECT') # Back to object mode
        if male_armature:
            bpy.ops.object.select_all(action='DESELECT')
            male_armature.select_set(True)
            bpy.context.view_layer.objects.active = male_armature
            bpy.ops.object.mode_set(mode='POSE')
            bpy.ops.pose.select_all(action='SELECT')
            bpy.ops.pose.transforms_clear() # Clear transforms
            print(f"  Cleared transforms for {male_armature.name} (Reset to Rest)")
            bpy.ops.object.mode_set(mode='OBJECT') # Back to object mode

        # Process each armature
        process_armature(female_armature, "F")
        process_armature(male_armature, "M")

    except Exception as e:
        print(f"An error occurred during main execution: {e}")
    finally:
        # Attempt to restore initial state
        print("\nAttempting to restore initial selection and mode...")
        try:
            bpy.ops.object.mode_set(mode='OBJECT') # Ensure Object mode first
            bpy.ops.object.select_all(action='DESELECT')
            for obj in selected_obj_backup:
                if obj and obj.name in bpy.data.objects: # Check if obj still exists
                    obj.select_set(True)
            if active_obj_backup and active_obj_backup.name in bpy.data.objects:
                 bpy.context.view_layer.objects.active = active_obj_backup
            # Restore original mode if possible
            if initial_mode in {'OBJECT', 'POSE', 'EDIT'} : # Add other valid modes if needed
                try:
                    bpy.ops.object.mode_set(mode=initial_mode)
                except RuntimeError:
                     print(f"  Could not restore original mode '{initial_mode}'. Staying in Object mode.")
            print("  Restored.")
        except Exception as e_restore:
            print(f"  Error during state restoration: {e_restore}")


    print("\n--- Pose Conversion Script Finished ---")

# END OF FILE