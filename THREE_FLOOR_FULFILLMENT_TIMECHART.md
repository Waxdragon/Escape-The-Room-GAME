# Three-Floor Fulfillment Time Chart

## Goal

Make the existing three floors feel complete, distinct, and satisfying **without adding another floor or creating a new required task chain**.

This plan focuses on atmosphere, clarity, feedback, sound, and stronger connections between the existing tasks.

## Scope Guardrails

- Keep exactly three floors: Ground floor, First floor, and Second floor.
- Keep the existing room transition and final-key progression.
- Keep the dog, hammer, weapon, gunmen, gems, and combat systems working.
- Do not restore the removed crumbs-and-rats task chain.
- Rats may remain as ambient characters or optional visual clues, but they must not block progression.
- Do not change the current first-room completion flow unless a test finds a regression.
- Every change must be tested with `npm run build` before moving to the next block.

## Schedule Until 1 PM

| Time | Focus | Work | Completion check |
|---|---|---|---|
| 09:00–09:20 | Baseline and safety pass | Play the current build once. Record the existing state of each floor, current task order, gun behavior, dog behavior, room transition, and final-key flow. | No baseline regression is introduced. Existing systems are listed before changes begin. |
| 09:20–10:00 | Ground-floor identity | Give the Ground floor a clear investigation atmosphere: evidence trail, body placement, blood-marked clue area, distinct lighting, and readable task feedback. Keep the existing evidence-file and cabinet tasks unchanged. | The Ground floor feels like an investigation area and both existing tasks remain completable. |
| 10:00–10:40 | Ground-floor feedback | Add small non-blocking details: discovery glow, short result message, nearby clue emphasis, and ambient sound balance. Keep rats decorative or observational only. | The player can understand what was found without relying only on the right-side panel. |
| 10:40–11:25 | First-floor purpose | Strengthen the current First-floor sequence: calm the dog, find the hammer, open the cross panel, break the weapons crate, and collect the weapon. Improve visual reactions and task messages without adding new prerequisites. | The dog, hammer, cross, crate, and weapon all have clear results and the existing order still works. |
| 11:25–12:05 | Second-floor pressure | Improve the existing Second-floor experience: moving gunmen, weapon feedback, enemy muzzle flashes, hit confirmation, defeat feedback, the body file, stone panel, and final-key discovery. | The player can understand when an enemy is active, hit, defeated, or when the final key is available. |
| 12:05–12:25 | Audio and accessibility pass | Check weapon sounds, dog barking, ambience, mute, volume controls, pause, sensitivity, reduced motion, and low-quality graphics. Adjust only values that are clearly too quiet, too loud, or distracting. | Audio is audible after the sound unlock action, mute works, and accessibility controls do not interrupt movement. |
| 12:25–12:45 | Full three-floor play-test | Test the full route: first room transition, Ground floor tasks, First-floor dog and tools, Second-floor combat, gems, and final key. Test shooting walls and wooden objects as well. | No broken transition, missing interaction, stuck stair route, invisible result, or runtime error is found. |
| 12:45–13:00 | Stabilize and record | Run the production build, review the changed files, record remaining issues, and stop adding new features for the session. | `npm run build` passes and remaining work is documented instead of being added hastily. |

## Floor Fulfillment Targets

### Ground Floor — Investigation

The player should feel that they are examining what happened in the house.

- Make the fallen body, evidence file, blood marks, and cabinet feel connected.
- Use a consistent warm red or amber lighting language.
- Give each completed task a short result and a next-step message.
- Keep rats as atmosphere or optional observation only.
- Avoid adding a new required item or inventory dependency.

### First Floor — Tools and Trust

The player should feel that they are preparing for danger.

- The dog is the main NPC interaction.
- The hammer should clearly enable the cross panel, crate, and stone panel.
- The weapon pickup should have a clear equip sound and visible equip state.
- The cross and crate should visibly react when damaged or opened.
- The player should understand that this floor prepares them for the Second-floor gunmen.

### Second Floor — Pressure and Resolution

The player should feel that the earlier preparation matters.

- Gunmen should patrol, notice the player through combat, and visibly react to hits.
- Gunfire, reloads, empty shots, hits, and defeats should have distinct feedback.
- The body file and stone panel should support the final investigation mood.
- The final key should have a strong visual and audio discovery moment.
- After the key is found, the existing game-win state must remain intact.

## Definition of Done

- [ ] All three floors have a distinct identity.
- [ ] Existing tasks are clearer without becoming more complicated.
- [ ] No new required rat or crumbs task exists.
- [ ] Dog, hammer, weapon, enemies, gems, and final key still work.
- [ ] First-room transition still works.
- [ ] Stairs still connect the existing floors correctly.
- [ ] Wall bullet holes and wood impact effects remain visible.
- [ ] Sound is audible after audio is enabled and can be muted.
- [ ] Pause, sensitivity, reduced motion, and low-quality graphics work.
- [ ] `npm run build` passes.
- [ ] Remaining issues are recorded in `task.md` or this file.

## Out of Scope Before 1 PM

- Adding a fourth floor.
- Rebuilding the main progression.
- Adding a new inventory system.
- Making rats required for progress.
- Adding a new enemy type.
- Replacing the current weapon or dog mechanics.
- Large visual redesigns that could destabilize the current game.
