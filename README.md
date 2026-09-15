# Kagura Atlas

An interactive map of the Kagura region, built for a Pokémon roleplay server.

Drag to move, scroll to zoom, click a marker. Every location has its own link,
so `#kagura/ember` opens Ember Hollow directly — handy for pointing someone at
the place they are meant to be roleplaying in.

## How it is put together

    index.html          the page: a full-height map and the floating controls
    atlas.js            the engine — knows how to draw *a* region, not this one
    regions/kagura.js   all Kagura data: islands, routes, places, gyms, artwork
    art/kagura/         location artwork

The terrain is not an image. It is generated per pixel from the island outlines
in the region file, which is why zooming in gives you more map rather than
bigger pixels. Rendering happens at a fraction of the window size and is
upscaled without smoothing — fast, and the right look for pixel art.

## Adding a region

Copy `regions/kagura.js`, change the contents, and add one `<script>` line to
`index.html`. The region picker builds itself from whatever is loaded, and the
engine needs no changes at all.
