
/**
 * The 'Simulation' screen. Conforms to the contract specified in joist/Screen.
 *
 */

define( function( require ) {
  'use strict';

  // modules

  var SimulationModel = require( 'ROLLERCOASTER/model/SimulationModel' );
  var RollerCoasterScreenView = require( 'ROLLERCOASTER/view/RollerCoasterScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var exampleSimString = require( 'string!ROLLERCOASTER/sim.name' );

  /**
   * Creates the model and view for the ExampleScreen
   * @constructor
   */

  function RollerCoasterScreen() {

    Screen.call( this, exampleSimString, null , //no icon, single screen sim
      function() { return new SimulationModel(); },
      function( model ) { return new RollerCoasterScreenView( model );} 
    );

  }

  return inherit( Screen, RollerCoasterScreen );

} );



