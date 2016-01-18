/**
 * StateDisplayPanel for selecting and creating a track.
 * Display the simulation state
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {SimulationModel} model
   * @constructor
   */
  function StateDisplayPanel( model, options ) {

    options = _.extend( {
      xMargin: 5,
      yMargin: 5,
      fill: 'rgb(230,230,230)',
      stroke: 'black',
      lineWidth: 1,
      resize: true,
    }, options );

    var contentNode = new Node();

    // Simulation State Display	
    var stateText = new Text('Simulation State', {font : new PhetFont({ fill: 'black', size: 14}) } );
    contentNode.addChild(stateText);

    model.simStateProperty.link( function(value){
    	stateText.text = "Roller Coaster " + value;
    } );

    Panel.call( this, contentNode, options );
  }

  return inherit( Panel, StateDisplayPanel );
} );

