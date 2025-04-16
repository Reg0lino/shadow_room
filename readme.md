
+-----------------------------------------------------------------------------+
|      A Cyber-Assisted 3D Object & Shadow Viewer for Art Reference           |
+-----------------------------------------------------------------------------+



===============================================================================
                              >> ABOUT THIS PROJECT <<
===============================================================================

Welcome, fellow traveler on the digital canvas!

This is the **Shadow Room / Dynamic Pose Explorer**, a tool forged in the fires
of creativity (and JavaScript) to aid artists like you. Its prime directive?
To provide a simple, interactive 3D space for viewing objects, manipulating
lighting, and studying the resulting shadows – a crucial reference for drawing,
painting, and understanding form.

This project is currently **UNDER ACTIVE DEVELOPMENT**. It's being built using
a unique "vibecoding" approach – a blend of intuition, experimentation, and
iterative refinement guided by natural language interaction with Google's
Gemini 2.5 AI model, all orchestrated within the Cursor code editor. It's
less about traditional programming paths and more about exploring possibilities
through dialogue.


===============================================================================
                       *** ATTENTION! VIEW THE LATEST BUILD ***
===============================================================================

     Ready to see it in action? Beam yourself over to the live demo:

     > ============================================================ <
     >
     >           ### https://reg0lino.github.io/shadow_room/ ###
     >           
     >
     > ============================================================ <

     (Link should be clickable and ✨ magically colored ✨ by GitHub!)


===============================================================================
                                  >> FEATURES <<
===============================================================================

  [*] Core Scene Setup (Three.js)
  [*] Orbit Controls (Navigate the 3D space - Drag, Zoom, Pan)
  [*] Basic Shape Loading (Select from a list of primitives & combinations)
  [*] Wireframe Object Support (With shadows!)
  [*] Controllable Spotlight (Adjust Intensity, Angle, Penumbra, Position)
  [*] Environment Color Control (Set Floor and Background/Wall colors)
  [*] Basic Object Manipulation (Y-Offset, Rotation X/Y/Z, Uniform Scale)
  [*] Object Material Adjustments (Hue, Brightness, Roughness, Metalness)
  [*] Helper Visuals (Grid, Axes - Toggleable)
  [*] Responsive Layout (Adapts between portrait/bottom controls and landscape/sidebar controls)
  [*] Save/Load Scene State (Using Browser `localStorage`)

  [+] PLANNED / IN-PROGRESS:
      - Granular Object Parameters (Segments, specific dimensions, etc.)
      - Dynamic Shape List Loading (No more hardcoding in HTML!)
      - More advanced lighting options?
      - User-defined object import? (Maybe far future!)
      - Performance optimizations


===============================================================================
                            >> TECH STACK & TOOLS <<
===============================================================================

  * Framework: Three.js (The magic behind the 3D)
  * Language: JavaScript (ES Modules)
  * Styling: CSS3
  * Editor: Cursor (AI-first Code Editor based on VS Code)
  * Development Method: "Vibecoding" / Iterative Natural Language Prompting
  * Hosting: GitHub Pages


===============================================================================
                                >> HOW TO USE <<
===============================================================================

  1. Access the live link provided above.
  2. Use your mouse/touchscreen to navigate the scene:
     - Drag (Left-click/One-finger) = Orbit camera
     - Scroll Wheel / Pinch = Zoom in/out
     - Right-click Drag / Two-finger Drag = Pan camera
  3. Use the sliders and controls in the bottom/side panel to:
     - Change the object shape.
     - Adjust light properties and position.
     - Modify the object's appearance and transform.
     - Change environment colors.
     - Toggle helpers (Grid/Axes).
     - Lock/Unlock camera movement.
     - Save your current setup or Load the previously saved state.


===============================================================================
                         >> DEVELOPMENT NOTES & PHILOSOPHY <<
===============================================================================

This project started as a mobile-first experiment without traditional dev tools,
relying heavily on the integrated debug console and careful, incremental steps.
It's now transitioned to PC development using Cursor.

The "vibecoding" aspect means the code structure and features evolve based on
high-level goals expressed in natural language, with the AI generating and
refining the implementation. This leads to an interesting, sometimes unexpected,
development path focused on achieving the desired *feel* and functionality.


===============================================================================
                      >> GITHUB PAGES DEPLOYMENT NOTE <<
===============================================================================

If you are forking or deploying this yourself to GitHub Pages, remember to add
an empty file named `.nojekyll` to the root directory of your repository. This
tells GitHub Pages to bypass the Jekyll static site generator and serve your
files directly, which is necessary for single-page apps like this, especially
those using folders starting with underscores (like `_` which Jekyll ignores).

   >>> Action Needed: Create an empty `.nojekyll` file in the root! <<<


===============================================================================
                                   >> LICENSE <<
===============================================================================

This project is likely intended to be open and shared. Consider adding a
standard open-source license. The MIT license is a common permissive choice:

```
MIT License

Copyright (c) [Year] [Your Name/Handle]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
