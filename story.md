# The story of the Pokéggdex

How this project started, and the turns it took on the way to what it is now.

## Where it started

**The question:** what if the Pokédex from the first season of the anime actually worked?

Not a list of Pokémon with a red border, but the device itself: the red clamshell Ash pulls out of his pocket, with
its lens, its little lights, its hinge and its keypad. The device had to be real enough to hold:

- **Its shape was measured, not guessed.** The outline, the hinge and the thickness come from a 3D render of the anime
  Pokédex ([design/shape-study/](design/shape-study/)), and the lid closes flush around the raised sensor plate.
- **Every part does something.** The lens glows while data loads, the lights show the app's state, the black button
  plays the original 8-bit cry, the keypad jumps to a number, the hinge folds the lid shut
  ([design/pokedex-design-document.md](design/pokedex-design-document.md)).
- **The data is live.** The first 151 Pokémon come from PokéAPI, shown on Game Boy-style screens from Red and Blue.

The device sat in front of a small pixel-art game world: sky, trees, a Pokémon Center, tall grass.

## The turns it took

### 1. From a background to a room

The Pokédex got a place to live: a cosy living room seen from the sofa, with a big TV on the wall showing the same
page as the Pokédex. That raised a new question: what should a Pokémon's page look like on a TV?

### 2. Never realistic

Real photos came up for the TV backgrounds (lava for fire, ocean for water, forest for grass) and were dropped at
once. The rule since then: **everything looks like the Pokémon world**, bright and flat, never photo-real. The TV
became a Game Boy-style picture instead, split on the diagonal into the Pokémon's type colours, with its Crystal
sprite on top.

### 3. Aboard the S.S. Anne

The living room was replaced by a cabin on the S.S. Anne, docked in Vermilion City, drawn as Game Boy Color pixel
art to match the sprites. A porthole looks out on the dock, with Pokémon swimming by. The project was trimmed down
to the Pokédex and its scene.

### 4. The screen and the device talk to each other

The TV turned into a tilted, Poké Ball-shaped wall screen that has to be **linked** to the Pokédex. Once linked,
the two behave like one system: the screen's button flashes in a pattern and the Pokédex's lights echo it, one shiny
setting drives both, and when someone in the cabin talks about a Pokémon, the Pokédex opens to it and its lens
lights up.

### 5. Easter eggs for true fans

The cabin filled up with things only a Red/Blue kid from 1999 would look for: Mew under the truck, MissingNo. at
No.000, the Magikarp salesman, a 1 in 8192 shiny, a Lapras that only comes on Fridays. They're listed in
[pokeggs.md](pokeggs.md) and on the guide page at `/lore/`. The project went public under its new name, the
**Pokéggdex**.

### 6. One device, many scenes

The Pokédex became its own component that a scene calls in, instead of being the whole app. The cabin is the first
scene; the direction now is several scenes, each with its own place and its own eggs, picked from a menu.

## Still true from the start

The Pokédex is still the centre of everything, and every part of it still does something.
