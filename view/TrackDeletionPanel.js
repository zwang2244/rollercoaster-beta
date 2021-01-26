/**
 * TrackDeletionPanel for selecting and creating a track.
 *
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var ImageButton = require( 'SCENERY_PHET/buttons/ImageButton' );
  var Range = require( 'DOT/Range' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Text = require( 'SCENERY/nodes/Text' );

  //specific modules
  /**
   * @param {SimulationModel} model
   * @constructor
   */
  function TrackDeletionPanel( model, options ) {

    options = _.extend( {
      xMargin: 15,
      yMargin: 10,
      stroke: 'black',
      lineWidth: 2,
    }, options );

    Node.call( this );
    var buttons = this;

    //Function that creates a Button for a given track 
    var addTrackButton = function (track) {
    var k=0;
    	    for(var i=0; i< imgNodes.length ; i++)
    	    {
    	    	if(track.trackName == trackNames[i]) 
    	    	{ 
    	    	   k=i;
    	    	 }
    	    }
    	    
	    var trackButton = new ImageButton (  imgNodes[k], {
	      baseColor: 'rgb(240,240,240)',
	      xMargin: 3,
	      yMargin: 3,
	      iconWidth:50,
	      stroke: 'black',
	      lineWidth: 1,
	      listener: function() { 
	      	   model.tracks.add(track);
	      },
	    } );
	    return trackButton;
	};

    model.trackDesignStateProperty.link( function(state) {
    } );

  }

  return inherit( Node, TrackDeletionPanel );
} );

