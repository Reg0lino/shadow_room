import bpy
import os

print("\n--- Listing Assets Found in Current File ---")

asset_count = 0
pose_asset_count = 0

if not bpy.data.assets:
    print("INFO: bpy.data.assets collection is empty or not available.")
else:
    print(f"Iterating through {len(bpy.data.assets)} assets found in bpy.data.assets...")
    for asset in bpy.data.assets:
        asset_count += 1
        asset_name = asset.name
        local_datablock = asset.local_datablock # The actual data (Action, Object, etc.)
        datablock_type = type(local_datablock).__name__ if local_datablock else "None"
        catalog_info = "N/A"
        catalog_label = "Unknown Catalog"

        if asset.asset_data:
            if hasattr(asset.asset_data, 'catalog_id') and asset.asset_data.catalog_id:
                 catalog = bpy.data.asset_catalogs.get(asset.asset_data.catalog_id)
                 if catalog:
                      path_parts = []
                      current_cat = catalog
                      while current_cat:
                          path_parts.append(current_cat.label)
                          # Access parent ID safely
                          parent_id = getattr(current_cat, 'parent_id', None)
                          current_cat = bpy.data.asset_catalogs.get(parent_id) if parent_id else None
                      catalog_info = "/".join(reversed(path_parts)) if path_parts else catalog.label
                      catalog_label = catalog.label
                 else:
                     catalog_info = f"Catalog ID '{asset.asset_data.catalog_id}' not found"
            else:
                 catalog_info = "No Catalog ID"

        print(f"\nAsset {asset_count}:")
        print(f"  Name: '{asset_name}'")
        print(f"  Type: '{datablock_type}'") # What kind of data block is it? Action? Object? Pose?
        print(f"  Catalog: '{catalog_info}'")
        # Check if it looks like a pose (often stored as Action)
        if local_datablock and isinstance(local_datablock, bpy.types.Action):
             print("  INFO: Asset data block is an Action.")
             pose_asset_count += 1
        elif "pose" in asset_name.lower() or "pose" in catalog_info.lower():
            print("  INFO: Name or Catalog suggests it might be a pose.")
            # Pose assets might be represented differently, need more investigation
            # if datablock_type != 'Action': pose_asset_count += 1 # Count non-action poses too?


print("\n--- Asset Listing Complete ---")
print(f"Total Assets Found: {asset_count}")
print(f"Assets identified as Actions: {pose_asset_count}") # Focus on Action-based assets