# Escape the Room Game — Development Plan for Today

**Date:** Friday, November 6, 2026  
**Working hours:** 2:30 PM – 7:00 PM  
**Timezone:** IST / UTC+05:30  
**Goal:** Complete and verify the next haunted-house gameplay improvements by 7:00 PM.

## Schedule

### 2:30 PM – 3:30 PM — Add house floors

**Duration:** 1 hour

- [ ] Add the ground floor
- [ ] Add the current first floor as the main room
- [ ] Add the second floor
- [ ] Connect the floors with a usable staircase
- [ ] Add floor boundaries so the player does not fall outside the house
- [ ] Confirm that the player can move between all floors

**Done when:** The player can enter and explore all three floors without the scene breaking.

---

### 3:30 PM – 4:15 PM — Improve floor navigation

**Duration:** 45 minutes

- [ ] Add clear staircase entrances and exits
- [ ] Add lighting or visual markers for each floor
- [ ] Add floor labels or objective indicators
- [ ] Check that movement remains smooth on the stairs
- [ ] Test moving up and down several times

**Done when:** A new player can understand how to move between the ground floor, first floor, and second floor.

---

### 4:15 PM – 5:00 PM — Hide the final key

**Duration:** 45 minutes

- [ ] Choose a difficult but fair hiding place for the key
- [ ] Hide the key inside a prop, behind furniture, or in a dark corner
- [ ] Add subtle clues that lead toward the key
- [ ] Make sure the key cannot be found accidentally from too far away
- [ ] Confirm that the key discovery trigger works correctly
- [ ] Confirm that finding the key completes the game

**Done when:** The key requires exploration and clue-following, but remains possible to find.

---

### 5:00 PM – 6:00 PM — Add more tasks and clues

**Duration:** 1 hour

- [x] Add at least two new tasks to the first floor
- [x] Add at least two new tasks to the ground floor
- [x] Add at least two new tasks to the second floor
- [x] Add clues connected to the hidden key
- [x] Add task completion feedback in the investigation log
- [x] Update the objective checklist in the interface

**Done when:** Each floor has meaningful activities instead of being only an area to walk through.

---

### 6:00 PM – 6:30 PM — Haunted atmosphere and props

**Duration:** 30 minutes

- [x] Add or improve haunted lighting
- [x] Add broken objects and environmental details
- [x] Add dead-body placement without blocking movement
- [x] Add sound or visual effects if time allows — procedural floor-specific audio and visual effects added
- [x] Make sure the key area is visually distinct but not obvious

**Done when:** The house feels haunted and each floor has its own atmosphere.

---

### 6:30 PM – 7:00 PM — Testing and delivery

**Duration:** 30 minutes

- [ ] Test the complete game from a fresh page load
- [ ] Test all three floors
- [ ] Test every new task
- [ ] Test the hidden key and final win state
- [ ] Run `npm run build`
- [ ] Fix any blocking errors
- [ ] Commit the completed work
- [ ] Push the commit to GitHub

**Done when:** The game builds successfully, the main flow works, and the repository is pushed.

## End-of-day success criteria

By **7:00 PM**, the project should have:

- [x] Three explorable floors
- [x] Working stairs between floors
- [x] A hidden final key
- [x] More tasks and clues across the house
- [x] Haunted props and atmosphere
- [x] A working final win condition
- [x] A successful production build
- [ ] Changes committed and pushed

## Notes for reporting to the senior

At the end of the work session, report:

1. Which tasks were completed.
2. Which tasks remain incomplete.
3. Any known bugs or limitations.
4. The final commit hash.
5. Whether the production build passed.
