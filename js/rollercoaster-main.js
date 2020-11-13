
/**
 * Main entry point for the sim.
 *
 */
define( function( require ) {
  'use strict';

  // general modules
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

   //specific modules
  var RollerCoasterScreen = require( 'ROLLERCOASTER/RollerCoasterScreen' );

  // strings
  var titleString = require( 'string!ROLLERCOASTER/sim.name' );

  var simOptions = {
    credits: {
      // all credits fields are optional, see joist.AboutDialog
      softwareDevelopment: 'Dinesh Pattabiraman',
      team: 'Interactive Learning and Design Lab, UW-Madison (http://ildl.wceruw.org/)',
      thanks: 'Thanks to PhET Interactive Simulations for developing HTML5-Javascript libraries for science simulations'
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
      var sim = new Sim( titleString, [ new RollerCoasterScreen() ], simOptions );
      sim.start();
  } );
} );
