/**
 * Scenery node for the speed controls, with "normal" and "slow motion" radio buttons.
 *
 * @author Sam Reid
 * Modified by Dinesh
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // strings
  /**
   * @param {Property<Number>} speedProperty the instantaneous speed of the skater (magnitude of the velocity vector)
   * @constructor
   */
  function PlaybackSpeedControl( speedProperty ) {
    var dilateX = 4;
    var dilateY = 2;
    var slowMotionButton = new AquaRadioButton( speedProperty, 'slow', new Text( "Slow", {font: new PhetFont( 12 )} ), {radius: 7} );
    var normalButton = new AquaRadioButton( speedProperty, 'normal', new Text( "Normal", {font: new PhetFont( 12 )} ), {radius: 7, x: 130} );
    slowMotionButton.touchArea = slowMotionButton.localBounds.dilatedXY( dilateX, dilateY );
    normalButton.touchArea = normalButton.localBounds.dilatedXY( dilateX, dilateY );
    VBox.call( this, {
      align: 'left',
      spacing: 4,
      children: [
        slowMotionButton,
        normalButton
      ]} );
  }
  return inherit( VBox, PlaybackSpeedControl );
} );
