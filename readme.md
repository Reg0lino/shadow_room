# Shadow Room / Dynamic Pose Explorer
## A Cyber-Assisted 3D Object & Shadow Viewer for Art Reference

---

**>>> VIEW THE LATEST BUILD <<<**

Ready to see it in action? Beam yourself over to the live demo:

## [https://reg0lino.github.io/shadow_room/](https://reg0lino.github.io/shadow_room/)

*(Tap or Click the link above to launch the tool)*

---

## >> ABOUT THIS PROJECT <<

Welcome, fellow traveler on the digital canvas!

This is the **Shadow Room / Dynamic Pose Explorer**, a tool forged in the fires of creativity (and JavaScript) to aid artists like you. Its prime directive? To provide a simple, interactive 3D space for viewing objects, manipulating lighting, and studying the resulting shadows – a crucial reference for drawing, painting, and understanding form.

This project is currently **UNDER ACTIVE DEVELOPMENT**. It's being built using a unique "vibecoding" approach – a blend of intuition, experimentation, and iterative refinement guided by natural language interaction with Google's Gemini AI model, all orchestrated within the Cursor code editor. It's less about traditional programming paths and more about exploring possibilities through dialogue.

---

## >> FEATURES <<

*   **Core Scene Setup:** Powered by Three.js.
*   **Orbit Controls:** Navigate the 3D space (Drag, Zoom, Pan).
*   **Basic Shape Loading:** Select from a list of primitives & combinations.
*   **Wireframe Object Support:** View objects as wireframes, still casting shadows.
*   **Controllable Spotlight:** Adjust Intensity, Angle, Penumbra, and Position.
*   **Environment Color Control:** Set Floor and Background/Wall colors.
*   **Basic Object Manipulation:** Y-Offset, Rotation (X/Y/Z), Uniform Scale.
*   **Object Material Adjustments:** Hue, Brightness, Roughness, Metalness.
*   **Helper Visuals:** Toggle Grid and Axes visibility.
*   **Responsive Layout:** Adapts controls for portrait (bottom) and landscape (sidebar) views.
*   **Save/Load Scene State:** Uses Browser `localStorage` to persist your setup.

**PLANNED / IN-PROGRESS:**

*   Granular Object Parameters (Segments, specific dimensions, etc.)
*   Dynamic Shape List Loading (No more hardcoding in HTML!)
*   More advanced lighting options?
*   User-defined object import? (Maybe far future!)
*   Performance optimizations

---

## >> TECH STACK & TOOLS <<

*   **Framework:** Three.js (The magic behind the 3D)
*   **Language:** JavaScript (ES Modules)
*   **Styling:** CSS3
*   **Editor:** Cursor (AI-first Code Editor based on VS Code)
*   **Development Method:** "Vibecoding" / Iterative Natural Language Prompting
*   **Hosting:** GitHub Pages

---

## >> HOW TO USE <<

1.  Access the live link provided near the top of this page.
2.  Use your mouse or touchscreen to navigate the scene:
    *   **Drag (Left-click/One-finger):** Orbit camera
    *   **Scroll Wheel / Pinch:** Zoom in/out
    *   **Right-click Drag / Two-finger Drag:** Pan camera
3.  Use the sliders and controls in the bottom/side panel to:
    *   Change the object shape.
    *   Adjust light properties and position.
    *   Modify the object's appearance and transform.
    *   Change environment colors.
    *   Toggle helpers (Grid/Axes).
    *   Lock/Unlock camera movement.
    *   Save your current setup or Load the previously saved state.

---

## >> DEVELOPMENT NOTES & PHILOSOPHY <<

This project started as a mobile-first experiment without traditional dev tools, relying heavily on the integrated debug console and careful, incremental steps. It's now transitioned to PC development using Cursor.

The "vibecoding" aspect means the code structure and features evolve based on high-level goals expressed in natural language, with the AI generating and refining the implementation. This leads to an interesting, sometimes unexpected, development path focused on achieving the desired *feel* and functionality.

---

## >> GITHUB PAGES DEPLOYMENT NOTE <<

If you are forking or deploying this yourself to GitHub Pages, remember to add an empty file named `.nojekyll` to the root directory of your repository. This tells GitHub Pages to bypass the Jekyll static site generator and serve your files directly, which is necessary for single-page apps like this.

**Action Needed:** Create an empty `.nojekyll` file in the root!

---

