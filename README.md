# The Last Room

**The Last Room** is a browser-based first-person 3D escape-room game set in the abandoned Northmere House. Investigate the study, uncover the house's clues, cross three haunted floors, survive the hunters, collect the hidden gems, and find the final key before the house claims you.

Built with **React**, **Vite**, **Three.js**, and **React Three Fiber**.

> This repository contains the source code for the game. It is a client-side game and can be run locally with Node.js; no database or backend server is required.

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Download and install](#download-and-install)
- [Run the game](#run-the-game)
- [Controls](#controls)
- [How the game works](#how-the-game-works)
- [Furniture and object interactions](#furniture-and-object-interactions)
- [Beginner's strategy](#beginners-strategy)
- [Full spoiler walkthrough](#full-spoiler-walkthrough)
- [Save and resume](#save-and-resume)
- [Settings and accessibility](#settings-and-accessibility)
- [Build and preview production output](#build-and-preview-production-output)
- [Deploy the game](#deploy-the-game)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## Features

- First-person movement and mouse-look exploration.
- A narrative prologue with a choice during the key handoff.
- A study escape-room sequence with a portrait, desk, bookcase, chest, and sealed exit.
- A three-floor haunted chamber with a ground floor, first floor, and second floor.
- Interactive furniture including drawers, cabinets, a coat trunk, weapon crates, and the final-key cabinet.
- Multi-step objectives with locked tasks and floor-by-floor progression.
- Six hidden gems required to reveal the final key.
- Guard bulldogs that can be calmed temporarily.
- An iron hammer for breaking sealed objects and a weapon for surviving the second floor.
- Hunter combat, aiming, ammunition, reloading, health, enemy defeat tracking, and damage feedback.
- Atmospheric lighting, fog, animated props, environmental story notes, procedural sound effects, footsteps, dog sounds, a heartbeat effect, and floor transitions.
- Local browser save/resume support.
- Pause controls, sound sliders, mouse sensitivity, low-quality graphics, reduced motion, and mute options.
- A standard escape ending and an optional hidden ending after completion.

## Requirements

- **Node.js 18 or newer** is recommended.
- npm, included with Node.js.
- A modern desktop browser with WebGL support.

The game is designed primarily for desktop browsers because it uses keyboard controls, mouse-look, and pointer lock. Chrome, Edge, and Firefox are recommended.

## Download and install

### Option 1: Clone with Git

```bash
git clone https://github.com/Waxdragon/Escape-The-Room-GAME.git
cd Escape-The-Room-GAME
npm install
```

### Option 2: Download a ZIP

1. Open the repository on GitHub: <https://github.com/Waxdragon/Escape-The-Room-GAME>
2. Select **Code**.
3. Select **Download ZIP**.
4. Extract the ZIP file.
5. Open a terminal in the extracted project folder.
6. Install the dependencies:

```bash
npm install
```

Do not open `index.html` directly from the file system. The game uses Vite and should be served through the development or preview server.

## Run the game

Start the development server:

```bash
npm run dev
```

Vite will print a local address in the terminal, normally:

```text
http://localhost:5173/
```

Open that address in your browser. If Vite chooses a different port, use the address shown in the terminal.

To make the server available to other devices on the same network:

```bash
npm run dev -- --host
```

Then open the network URL printed by Vite on the other device. Keyboard and pointer-lock support work best on a desktop computer.

Stop the server with `Ctrl+C`.

## Controls

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` | Move forward, left, backward, and right |
| Arrow keys | Alternative movement controls |
| Mouse | Look around after capturing the game view |
| `J` | Jump |
| `C` | Crouch |
| `L` | Toggle the flashlight |
| `Enter` | Interact with a nearby haunted-room object |
| `P` | Pause or resume |
| `F` / `Space` / left click | Fire when the weapon is equipped |
| Right click / `Shift` | Aim the weapon |
| `R` | Reload the weapon |
| `Esc` | Skip the prologue or release pointer lock, depending on browser behavior |

### Capturing the mouse

Click inside the 3D scene to capture the mouse for first-person look controls. If the browser asks for permission to use pointer lock, allow it. Press `Esc` if you need to release the pointer.

The investigation panel on the right side of the screen shows the currently selected object, its clue, task status, and available action. On the haunted-room floors, approach a highlighted task and press `Enter` or use the action button.

## How the game works

### 1. The prologue

The game opens with a short cinematic introduction to Northmere House. Continue through the scenes to begin, or skip the prologue with `Esc` or **Skip prologue**.

The key-handoff scene contains a small story choice. It changes the dialogue but does not prevent the game from starting.

### 2. The study

The first room is a compact escape-room tutorial. Search the three main objectives:

1. **The brass portrait** — reveals the combination `731`.
2. **The writing desk** — contains a torn clue and opens its drawer when searched.
3. **The ironbound chest** — its three dials refer back to the combination clue and the chest opens when the task is completed.

Approach each objective in the 3D scene. The investigation log records completed objects and the furniture changes to reflect the completed search. When all three study tasks are complete, the sealed passage opens and the game transitions to the haunted chamber.

### 3. The haunted chamber

The haunted room has three connected floors. Tasks are intentionally gated so the investigation develops in a clear order:

- **First floor:** Calm the first bulldog, collect the hammer, inspect the cross, and break open the weapons crate. Take the weapon from the rack when you are ready.
- **Ground floor:** Search the evidence desk and blood-marked cabinet after the first-floor route is complete.
- **Second floor:** Search the coat trunk and break the high stone panel. Hunters become active upstairs, so bring the weapon and ammunition.

Every gem task contributes one gem. You need all **six gems** before the final key can be taken from its cabinet.

### 4. Combat and survival

The hunters patrol the second floor once it is alerted. Aim carefully, conserve ammunition, and reload with `R`. Your health is shown at the lower-left of the game view. The heartbeat and red damage vignette indicate danger.

The bulldogs are hazards rather than enemies. Calming one creates a temporary ten-second safe passage, so move through quickly while it is asleep.

### 5. Finishing the game

After collecting six gems, reach the final-key cabinet on the second floor. Take the key to complete the escape. The completion screen displays your remaining time, gem total, and hunters defeated.

After the normal ending, choose **Search for the missing owner** to view the optional hidden ending.

## Furniture and object interactions

Furniture is connected to task state rather than being decoration only:

- The study desk opens its drawer after the desk task is completed and reveals a note.
- The study chest opens and reveals its contents after the chest task is completed. The portrait's `731` sequence is the story clue for its dials.
- The ground-floor evidence desk opens its drawer and reveals the evidence file and amber gem.
- The blood-marked cabinet opens and reveals a glowing green gem.
- The second-floor coat trunk opens and reveals the sealed coat file and blue gem.
- The weapons crate breaks apart when its task is completed.
- The final-key cabinet reveals the key glow after the gem requirement is met.

The visual state of these objects is driven by the same task state shown in the investigation log, so furniture remains consistent when a saved game is resumed.

## Beginner's strategy

- Read the investigation panel instead of rushing through the room.
- Memorize or write down `731` from the portrait.
- Pick up the hammer before attempting the cross or crate tasks.
- Take the weapon before entering the second floor.
- Do not waste ammunition on random walls; aim at the hunters.
- Calm a bulldog immediately before passing its route.
- Use the floor banners and objective groups to understand where the next task is located.
- If you become lost, check the selected object's location and the floor objective list.
- Enable **Low-quality graphics** if the scene is slow, or **Reduce motion** if camera shake is uncomfortable.

## Full spoiler walkthrough

<details>
<summary>Open the complete solution</summary>

### Study solution

1. Walk toward the brass portrait and inspect it. Record `731`.
2. Search the writing desk. Its drawer opens and reveals the torn clue.
3. Approach the ironbound chest and complete its task after examining the portrait combination.
4. Wait for the transition into the haunted chamber.

### First-floor haunted chamber

1. Approach the first bulldog on the left and calm it.
2. Find the rotating iron hammer near the first-floor route and pick it up.
3. Use the hammer on the cross to press its hidden button. Collect the crimson gem.
4. Use the hammer on the weapons crate. Collect the violet gem.
5. Take the rack weapon if you have not already done so.

### Ground floor

1. Descend the left staircase.
2. Approach the evidence desk and open its drawer. Collect the amber gem.
3. Approach the blood-marked cabinet and open it. Collect the green gem.

### Second floor

1. Return to the stairwell and climb to the second floor.
2. The hunters will become active. Equip the weapon, aim, and defeat them or move carefully around them.
3. Open the coat trunk. Collect the blue gem.
4. Use the hammer on the high stone panel near the inscription. Collect the white gem.
5. You should now have six gems in total.
6. Reach the final-key cabinet and take the key.
7. After the escape screen appears, choose **Search for the missing owner** for the hidden ending.

</details>

## Save and resume

The game automatically saves the current run in the browser's `localStorage` under the key `last-room-save`.

The save includes:

- Current room and floor.
- Completed tasks.
- Gems.
- Hammer and weapon state.
- Dropped and equipped items.
- Ammunition and defeated hunters.
- Health and timer.
- Current selected object.

When a save exists, the prologue displays **Continue saved game**. Selecting **Play again** or restarting from the beginning clears the saved run.

Because the save is browser-local, it will not automatically transfer between browsers, computers, private windows, or cleared browser profiles.

To manually clear a stuck save, open the browser developer console and run:

```js
localStorage.removeItem('last-room-save')
```

Then refresh the page.

## Settings and accessibility

Open the gear button in the top-right corner to access:

- Music volume.
- Ambience volume.
- Dog sound volume.
- Weapon sound volume.
- Mouse sensitivity.
- Mute all sound.
- Low-quality graphics.
- Reduced motion and recoil.
- Pause, restart, and audio test controls.

The game also provides visible task messages, floor banners, health status, ammunition status, and interaction prompts to reduce uncertainty during play.

## Build and preview production output

Create an optimized production build:

```bash
npm run build
```

The compiled static files are written to `dist/`.

Preview the production build locally:

```bash
npm run preview
```

Open the local URL printed by Vite. Always run the preview server when testing a production build; do not open files from `dist/` directly with `file://`.

The current build may report a large JavaScript chunk warning because Three.js and the game scene are bundled together. This is a performance warning, not a build failure.

## Deploy the game

The output in `dist/` is a static website and can be deployed to services such as Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any static web server.

General deployment steps:

1. Run `npm install` in the build environment.
2. Run `npm run build`.
3. Publish the `dist/` directory.
4. Configure the host to serve `index.html` for the root route.

For a host that asks for build settings, use:

```text
Build command: npm run build
Publish directory: dist
```

No environment variables are required by the current game.

## Project structure

```text
.
├── index.html                 Vite HTML entry point
├── package.json               Scripts and dependencies
├── package-lock.json          Locked dependency versions
├── src/
│   ├── App.jsx                Game state, 3D scene, tasks, controls, audio, and UI
│   ├── main.jsx               React application entry point
│   └── styles.css             Interface, overlays, HUD, and responsive styles
├── DEVELOPMENT_PLAN.md        Development planning notes
├── DEVELOPMENT_TIMELINE.md    Development timeline
├── THREE_FLOOR_FULFILLMENT_TIMECHART.md
├── today-activities.md        Activity notes
├── task.md                    Task instructions
└── README.md                  This guide
```

Most game content is currently centralized in `src/App.jsx`. The task definitions, hotspots, floor targets, clue text, object models, enemy behavior, and application state can be found there.

## Troubleshooting

### `npm` or `node` is not recognized

Install Node.js from <https://nodejs.org/> and restart the terminal. Verify the installation:

```bash
node --version
npm --version
```

### The page is blank or the 3D scene does not render

- Use `npm run dev` or `npm run preview` instead of opening `index.html` directly.
- Use a current browser with WebGL enabled.
- Check the browser console for graphics-driver errors.
- Try enabling **Low-quality graphics**.

### The mouse will not look around

Click inside the scene to request pointer lock. If pointer lock was denied, check browser permissions and click the scene again. Keyboard movement should still work even if pointer lock is unavailable.

### There is no sound

Browsers block audio until the page receives a user gesture. Click the scene or use the settings panel's **Test sound** button. Confirm that the game is not muted and that the relevant volume slider is above zero.

### A saved game is behaving unexpectedly

Clear the local save and reload:

```js
localStorage.removeItem('last-room-save')
```

### The development port is already in use

Start Vite on another port:

```bash
npm run dev -- --port 5174
```

## Development

Install dependencies after cloning or after changing dependency files:

```bash
npm install
```

Start development with hot module replacement:

```bash
npm run dev
```

Before committing changes, run:

```bash
git diff --check
npm run build
git status
```

The project currently has no automated test suite. The production build is the main automated verification command, while browser playtesting should cover movement, pointer lock, furniture interactions, floor transitions, combat, saving, and both endings.

## License

No license file is currently included. Treat the repository as all rights reserved unless a license is added by the project owner.
