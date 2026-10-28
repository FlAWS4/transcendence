// Manifest of the loader's fixture (not a design trial, never shown in the gallery): it declares the three kinds of
// file a trial may provide, so that one page load checks all of them (README.md).
horizonEssais.declare({
 id: '_controle',
 titre: 'Contrôle du chargeur',
 resume: 'Fixture of the loader: a stylesheet, a module and a replaced module, with no visible change.',
 styles: true,
 module: true,
 remplace: ['scope-pill.mjs'],
});
