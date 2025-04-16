import * as THREE from 'three';

// Helper function to apply wireframe material using MeshStandardMaterial
export function applyWireframeMaterial(obj, baseMaterial) {
    const wireMaterial = baseMaterial.clone();
    wireMaterial.wireframe = true;
    wireMaterial.color.copy(baseMaterial.color); // Sync color

    if (obj.isMesh) {
        obj.material = wireMaterial;
        obj.castShadow = true; // Standard wireframes can cast shadows
    } else if (obj.isGroup) {
        obj.traverse((child) => {
            if (child.isMesh) {
                // Use a unique clone for each child in the group
                child.material = wireMaterial.clone();
                child.castShadow = true;
            }
        });
    }
    return obj; // Return the modified object
}

// Note: The actual creation of the underlying geometry/group
// will still be handled by the main mapping in main.js,
// which will then call this helper.