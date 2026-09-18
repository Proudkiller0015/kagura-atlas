# Sinnoh artwork

**Real artwork only. Nothing generated.**

Kagura is ours and invented, so generated art was a reasonable way to fill it.
Sinnoh is canon: Twinleaf, Jubilife, Mt. Coronet and the rest are real places
with real, published artwork, and a generated impression of Hearthome is just a
wrong picture of somewhere that already has a right one. Anyone looking at the
map knows what these places look like, which is exactly why a fake reads as
fake.

Use official material — game screenshots, official art, anime backgrounds, or
the scans on Bulbapedia — or leave the slot empty.

## Until then

Nothing here is required. A place with no entry in the region file's `ART` map
renders an **"artwork coming"** placeholder with the place's name, which is
correct and deliberate: an honest gap beats a wrong picture.

## Adding one

1. Drop the file in this folder. Match Kagura's convention: `<place id>.webp`,
   the id being the one in `regions/sinnoh.js` (`twinleaf.webp`, `coronet.webp`,
   `sinnohleague.webp`). WebP, roughly 4:3, around 640px wide.
2. Add it to the `ART` map in `regions/sinnoh.js`:

   ```js
   var ART = {
     twinleaf: 'twinleaf.webp',
     coronet:  'coronet.webp',
   };
   ```

The panel picks it up with no other change (`showArt` in `atlas.js`).

## Overlays

`OVERLAYS` is for structures the terrain generator could never produce — Kagura
uses one for Aether Paradise, a symmetrical steel platform. Sinnoh has no such
building, so its `OVERLAYS` is empty and should stay that way unless something
genuinely unbuildable turns up.
