/**
 * TrackLayerNode for adding trackNodes and their corresponding sliders/buttons.
 * TrackLayerNode contains all the tracks
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
  var Range = require( 'DOT/Range' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var DotRectangle = require( 'DOT/Rectangle' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );

  //specific modules
  var ControlSlider = require( 'ROLLERCOASTER/view/ControlSlider' );
  var TrackNode = require( 'ROLLERCOASTER/view/TrackNode' );


  /**
   * @param {SimulationModel} model
   * @constructor
   */
  function TrackLayerNode( model, View, options ) {

    options = _.extend( {
      xMargin: 15,
      yMargin: 10,
      stroke: 'black',
      lineWidth: 2,
      screenHeight: 700,
      earthHeight: 300
    }, options );

   //TrackLayer contains all the tracks
    Node.call( this );
    var trackLayer = this;
    var screenHeight = options.screenHeight;
    var earthHeight = options.earthHeight;

    //Function that creates a Height slider
    var addHeightSlider = function (track) {
	    var trackSlider = new ControlSlider ( 
	    	track.trackName + " Height",
	    	 'px',
	    	 track.vScaleProperty,
	    	 new Range(0.5,1), //height range
	    	 function(val){return val;},
	    	 new Property(true),
	    	 {delX:0.05, decimals:2} );
	    	 trackSlider.scale(0.60);
	    return trackSlider;
	} ;

    //Function that creates a Friction Slider
    var addFrictionSlider = function (track) {
	    var trackSlider = new ControlSlider ( 
	    	track.trackName + " Friction",
	    	 'px',
	    	 track.frictionProperty,
	    	 new Range(0,1), //friction range
	    	 function(val){return val;},
	    	 new Property(true),
	    	 {delX:0.05, decimals:2} );
	    	 trackSlider.scale(0.60);
	    return trackSlider;
	} ;

// Track Node

      var addTrackNode = function( track ) {

        var trackNode = new TrackNode( model, track, View.modelViewTransform, View.availableModelBoundsProperty );
        trackLayer.addChild( trackNode );

	//add height and friction sliders
        var heightSlider = addHeightSlider(track);
        var frictionSlider = addFrictionSlider(track);
        View.addChild(heightSlider);
        View.addChild(frictionSlider);
        frictionSlider.visible = false;
        heightSlider.visible = false;
	heightSlider.top = screenHeight - earthHeight + 10;
	frictionSlider.top = screenHeight - earthHeight + 10;
	
	//include a delete button for each track
	var deleteNode = new FontAwesomeNode( 'times_circle', {fill: 'red', scale: 0.6} );
	var deleteButton = new RoundPushButton( {
	listener: function() { model.tracks.remove( track ); },
	content: deleteNode,
	radius: 20,
	touchAreaRadius: 20 * 1.3,
	xContentOffset: -0.5,
	baseColor: new Color('#fefd53')
	} );
	View.addChild(deleteButton);

	//design state change, modify visibilities 
	model.trackDesignStateProperty.link( function (state) {
		frictionSlider.visible = (state == 'friction') ? true:false;			
		heightSlider.visible = (state == 'height') ? true:false;			
		frictionSlider.centerX = trackNode.centerX;
		heightSlider.centerX = trackNode.centerX;
		deleteButton.visible = (state == 'deleteTrack') ? true:false;
		deleteButton.centerX = trackNode.centerX;
		deleteButton.bottom = trackNode.top - 10;
		track.interactive = (state == 'addTrack') ? true:false;
	} );

        // When track removed, remove its view
        var itemRemovedListener = function( removed ) {
          if ( removed === track ) {
            trackLayer.removeChild( trackNode );
	    View.removeChild(frictionSlider);
	    View.removeChild(heightSlider);
	    View.removeChild(deleteButton);
            model.tracks.removeItemRemovedListener( itemRemovedListener );// Clean up memory leak
          }
        };
        model.tracks.addItemRemovedListener( itemRemovedListener ); 

        return trackNode;
      };

     var trackNodes = model.tracks.map( addTrackNode ).getArray();
      model.tracks.addItemAddedListener( addTrackNode );
//      View.addChild( trackLayer );
  }

  return inherit( Node, TrackLayerNode );
} );

