# Shadow Room / Dynamic Pose Explorer (Buddy README)

## Project Goal

This is the **Shadow Room / Dynamic Pose Explorer**, a web-based 3D reference tool for artists. The main goal is to provide an interactive space to load various 3D objects (primitives, combinations, and poseable models), manipulate lighting (currently a single spotlight), and study the resulting shadows and form. It's intended as a quick reference tool for drawing, painting, or general 3D understanding.

---

**>>> Live Demo <<<**

Check out the latest build here:
**[https://reg0lino.github.io/shadow_room/](https://reg0lino.github.io/shadow_room/)**

---

## How It Was Built (The "Vibecoding" Experiment)

This project has been developed using a somewhat unconventional "vibecoding" approach, heavily relying on AI assistance. Here's the gist:

*   **AI Collaboration:** The core development loop involved iterative dialogue with Large Language Models (LLMs), primarily Google's Gemini (often accessed via Google AI Studio or integrated APIs). High-level goals and feature requests were described in natural language.
*   **AI-First Editor:** Much of the coding, refactoring, and debugging was orchestrated within Cursor, an AI-first code editor based on VS Code. This allowed for generating, modifying, and analyzing code blocks through AI prompts directly in the editor context.
*   **Iterative Refinement:** Instead of detailed pre-planning, features were added incrementally based on achieving a desired "vibe" or functionality. This often involved the AI generating code, testing the result, identifying issues (bugs or deviations from the goal), and then refining the prompts to guide the AI toward a better solution.
*   **Learning Curve:** This process has been an experiment in AI-assisted development, involving significant back-and-forth, occasional AI-induced regressions (like functions disappearing!), and learning how to prompt effectively for complex web development tasks involving libraries like Three.js.

Essentially, it's less about traditional, meticulously planned coding and more about exploring possibilities through a conversation with AI, using tools that integrate that conversation directly into the development workflow.

---

## Current Features

*   **3D Scene:** Basic Three.js setup.
*   **Navigation:** OrbitControls (orbit, zoom, pan).
*   **Object Loading:**
    *   Selection dropdown with primitives, combinations, static figures, etc. (defined in `shapes/` modules).
    *   Basic GLB model loading (poseable and static).
    *   Wireframe view support (for geometric shapes).
*   **Lighting:** Controllable spotlight (Intensity, Angle, Penumbra, XYZ Position).
*   **Environment:** Control over floor color and background/wall color (HSL).
*   **Object Transform:** Y-Offset, Rotation (X/Y/Z), Uniform Scale.
*   **Object Material:** Adjust Hue/Brightness (non-textured objects), Roughness, Metalness via sliders.
*   **Helpers:** Toggle Grid and Axes visibility.
*   **Layout:** Responsive controls (bottom panel portrait, right sidebar landscape).
*   **State Persistence:** Basic Save/Load scene state to browser `localStorage`.
*   **Pose Editor Link:** Button to open `poser.html` for selected poseable models (passes model path as URL param).
*   **Pose Loading:** Basic loading/applying of saved poses from `localStorage` via dropdown in the main view.

---

## Planned Features / TODOs

*(This is a rough list, priorities might shift!)*

*   **Object Parameters:** Add controls for geometry-specific details (e.g., sphere segments, cylinder radius).
*   **Dynamic Shape List:** Load the shape list from JS instead of hardcoding in HTML.
*   **Texture Loading:** Improve reliability for non-embedded textures in GLBs (e.g., Male Base 0/1). *(Best fix might be re-exporting GLBs with embedded textures)*.
*   **Advanced Lighting:** Explore options like multiple lights, different light types (point, directional).
*   **Named Save/Load:** Allow users to name saved scene states and manage multiple saves.
*   **Multi-Object Support:** Potentially allow spawning/managing multiple objects in the scene.
*   **Performance:** Optimizations, especially if complexity increases.
*   **User Model Import:** (Maybe way down the line) Allow users to load their own GLB files.

---

## Tech Stack

*   **3D:** Three.js (`r163` via CDN/ESM)
*   **Language:** JavaScript (ES Modules)
*   **Styling:** CSS3
*   **Development:** AI-Assisted (Cursor Editor, Google LLMs)
*   **Hosting:** GitHub Pages

---

## Quick Start / How to Use

1.  Open the [Live Demo](https://reg0lino.github.io/shadow_room/).
2.  **Navigate:** Drag to orbit, Scroll/Pinch to zoom, Right-drag/Two-finger-drag to pan.
3.  **Controls Panel:** Use the sliders and dropdowns to:
    *   Select an object (`Type` dropdown).
    *   Adjust light settings.
    *   Transform the object (Offset, Rotation, Scale).
    *   Change object material properties (Color, Roughness, etc.).
    *   Modify environment colors.
    *   Toggle Grid/Axes visibility (`View Options`).
    *   Lock/Unlock camera movement (`Lock Camera` button).
    *   Save/Load the overall scene state.
    *   For poseable models: Use the `Pose` dropdown to apply saved poses, or click `Open Poser` to edit in a new window.

---

## Deployment Notes (GitHub Pages)

*   If you fork and deploy this to GitHub Pages yourself, remember to add an empty file named `.nojekyll` to the root of the repository.
*   This prevents GitHub Pages from using Jekyll and ensures it serves the `index.html` and associated JS/CSS files correctly as a single-page application.

---