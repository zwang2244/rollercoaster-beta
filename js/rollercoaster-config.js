
/**
 * RequireJS configuration file for the sim.
 *
 */
require.config(
  {
    // An array of dependencies to load. Useful when require is defined as a config object before require.js
    // is loaded, and you want to specify dependencies to load as soon as require() is defined.
    deps: ['rollercoaster-main'],

    // baseUrl: don't bother trying to set it here, it is overridden by data-main in the top-level HTML file

    // Path mappings for module names not found directly under baseUrl. The path settings are assumed to be
    // relative to baseUrl unless the paths setting starts with a '/' or has a URL protocol.
    paths: {

      // third-party libs
      text: '../../sherpa/text',

      // PhET plugins
      image: '../../chipper/requirejs-plugins/image',
      string: '../../chipper/requirejs-plugins/string',
      mipmap: '../../chipper/requirejs-plugins/mipmap',

      // common directories, uppercase names to identify them in require imports
      ASSERT: '../../assert/js',
      AXON: '../../axon/js',
      BRAND: '../../brand/js',
      DOT: '../../dot/js',
      JOIST: '../../joist/js',
      KITE: '../../kite/js',
      PHET_CORE: '../../phet-core/js',
      PHETCOMMON: '../../phetcommon/js',
      SCENERY: '../../scenery/js',
      SCENERY_PHET: '../../scenery-phet/js',
      SUN: '../../sun/js',
      NITROGLYCERIN: '../../nitroglycerin/js',
      // this sim
      ROLLERCOASTER: '.'
    },

    urlArgs: new Date().getTime()  // cache buster to make browser reload all included scripts
  } );
