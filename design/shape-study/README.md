# Shape study: Pokédex from the reference render

Measured from a 3D render of the anime Pokédex, in a separate modelling project that holds the full
measurements and a 3D model. The numbers this app uses are in `src/shape.js` and the table below.

The lid's outline is fitted to close flush around the raised head. In the render itself it falls 3–8 mm short.

| File | Shows |
| --- | --- |
| proof.jpg | Reference vs the model from the same camera; perspective-free reference vs model top view |
| overlay_on_reference.jpg | Model outlines drawn on the reference render |
| fold.jpg | Open, half-open (120°) and closed |
| top_0.png / top_180.png / side_180.png | Top view open, top view closed, side view closed |

## Measured shape in this app's units (base height 568)

| | Old design | Measured |
| --- | --- | --- |
| Base | 400 × 568 | 356 × 568 |
| Head's S-step | 60 wide, sharp | 236 wide, gentle; 141 deep at the outer side, 45 at the hinge; runs 101 → 337 from the left edge |
| Hinge | Ø 28 | Ø 43 (equals closed thickness) |
| Thickness | base 18, lid 10 | base 23, head 31, lid rim 17, lid floor 11 |
| Lid | same as base, stepped 104 | 356 wide, rim 19; top edge = head's S-step mirrored over the hinge |
| Main screen bezel | 352 × 303 | 310 × 260, bottom-left corner cut 43 |
