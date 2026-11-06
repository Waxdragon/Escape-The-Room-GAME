# Escape the Room Game — Development Timeline

This timeline is based on the Git commit history for the project. All timestamps use the repository's recorded timezone: **UTC+05:30**.

## Development duration

- **Started:** November 6, 2026 at 12:11:03
- **Latest recorded development change:** November 6, 2026 at 13:40:13
- **Recorded development span:** approximately **1 hour, 29 minutes, 10 seconds**
- **Author recorded in Git:** Waxdragon

## Timeline

### 12:11:03 — Project foundation

**Commit:** `5ca54d2` — `Initial Escape the Room game`

Created the initial React and Three.js escape-room game, including:

- Vite project setup
- React entry point and application shell
- First-person 3D room
- North study environment
- Interactive painting, desk, chest, bookcase, and exit door
- Investigation log and map interface
- Object discovery and round progression
- Timer and objective progress UI
- Initial responsive styling
- Dependency lockfile and project configuration

**Main files created:**

- `index.html`
- `package.json`
- `package-lock.json`
- `src/main.jsx`
- `src/App.jsx`
- `src/styles.css`
- `.gitignore`

### 12:15:25 — Haunted atmosphere and animated objects

**Commit:** `ad9cb1b` — `Add room lighting creatures and broken props`

Expanded the original room with a darker haunted-house atmosphere:

- Added ceiling lamps and wall sconces
- Added blinking and flickering lighting
- Added broken mirror with cracks
- Added damaged chair and broken vase
- Added two animated wandering rats
- Added additional environmental lighting

### 12:22:26 — Stairway and final-key progression

**Commit:** `99e2bcd` — `Add haunted stairway final key progression`

Added a progression system where completing the room objectives unlocks a final haunted stairway:

- Added smoother first-person movement
- Added 360-degree horizontal camera rotation
- Added haunted staircase visuals
- Added a floating final key
- Added final-key discovery logic
- Added final escape message
- Added transition UI for room completion
- Added map route styling for the stairway

### 13:05:35 — Three-floor free-roam house

**Commit:** `8bf2d16` — `Open haunted house for free roam`

Changed the progression into a free-roam haunted-house layout:

- Added ground floor, first floor, and second floor areas
- Made the exit and staircase available without completing every task
- Added floor-specific objective concepts
- Added multiple dead bodies across the floors
- Added haunted lighting for each floor
- Added a final key on the ground floor
- Added vertical movement behavior for the external staircase
- Added free-roam objective messaging

### 13:05:49 — Free-roam objective styling

**Commit:** `a2e964c` — `Style three-floor house objectives`

Added visual styling for the floor objective panel:

- Added floor objective cards
- Added task list styling
- Added floor labels and room names
- Added scrolling behavior for the objective list
- Added haunted color accents to the task display

### 13:40:13 — Return to focused one-room progression

**Commit:** `dba0915` — `Return to one-room haunted chamber progression`

Simplified the gameplay flow again to make it easier to understand:

1. Start in one focused study room.
2. Complete three tasks:
   - Inspect the brass portrait
   - Search the writing desk
   - Open the ironbound chest
3. Transition into a larger haunted chamber.
4. Search the new chamber for the final key.
5. Win after finding the final key.

The new haunted chamber includes:

- Large Christian crosses
- Ritual table
- Knife prop
- Old guns and weapon rack
- Multiple dead bodies
- Dark haunted lighting
- A final key
- Larger walkable boundaries

## Current game structure

The current gameplay is intentionally divided into two stages:

### Stage 1 — The study

The player explores one room and completes three nearby-object tasks. This keeps the opening gameplay focused and easy to understand.

### Stage 2 — The haunted chamber

After all three study tasks are found, the scene changes to a larger haunted room containing the final props and the final key.

## Current technology

- React 18
- React Three Fiber
- Three.js
- Drei
- Vite
- CSS with responsive layout styling

## Validation performed during development

The production build was repeatedly verified with:

```bash
npm run build
```

The final recorded changes built successfully, and VS Code diagnostics reported no errors in the changed source files.
