# N.U Generation 1 Layout Modes

Branch: feature/nu-g1-layout-modes

The page root declares data-nu-layout="online" by default. In this mode, interactive object spawns avoid the central 22%-78% width band and the active publication reading column.

For a downloadable full-screen build, set the root HTML attribute to data-nu-layout="fullscreen". In that mode, the central exclusion and article-column exclusion are disabled; target spawns can use the full playfield.

This change does not modify nu-engine.js or nu-pixel-world.js. It changes only layout-mode selection and object spawn placement in nu-games.js.

Static source review only. Browser runtime tests and responsive-device validation remain NOT_TESTED.