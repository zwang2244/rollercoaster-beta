/*
*********************************************************
*		View for the Roller Coaster Screen	*
*********************************************************
* Instantiates all nodes to be placed in the screen
*
* author:Dinesh
*/

define( function( require ) {
  'use strict';

  // general modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Range = require( 'DOT/Range' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var RefreshButton = require( 'SCENERY_PHET/buttons/RefreshButton' );
  var Panel = require( 'SUN/Panel' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var SkyNode = require( 'SCENERY_PHET/SkyNode' );
  var GroundNode = require( 'SCENERY_PHET/GroundNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var DotRectangle = require( 'DOT/Rectangle' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );

  //specific modules
  var TrackNode = require( 'ROLLERCOASTER/view/TrackNode' );
  var ControlSlider = require( 'ROLLERCOASTER/view/ControlSlider' );
  var TrackCreationPanel = require( 'ROLLERCOASTER/view/TrackCreationPanel' );
  var StateDisplayPanel = require( 'ROLLERCOASTER/view/StateDisplayPanel' );
  var TrackDesignButtons = require( 'ROLLERCOASTER/view/TrackDesignButtons' );
  var SkaterNode = require( 'ROLLERCOASTER/view/SkaterNode' );
  var TrackLayerNode = require( 'ROLLERCOASTER/view/TrackLayerNode' );

  /**
   * @param {SimluationModel}  model of the simulation
   * @constructor
   */

  var X_MARGIN=10;  
  var Y_MARGIN=10;


  function RollerCoasterScreenView( model ) {

    var View = this;
    ScreenView.call( View );
	
    //background colour node
	var skygroundx=this.layoutBounds.centerX;  // skygroundx- centerX of the boundary between sky and ground  
	var skygroundy=this.layoutBounds.centerY*1.2 ; // skygroundy- Y coordinate of the boundary between sky and ground  
	var screenWidth=this.layoutBounds.width;
	var screenHeight=this.layoutBounds.height;
	var earthHeight=screenHeight*1/2.5;
	View.interfaceHeight = screenHeight - earthHeight;

	View.addChild( new SkyNode(
		-screenWidth/2,
		-screenHeight*1/2, 
		screenWidth*2, 
		screenHeight*3/2-earthHeight, 
		screenHeight*3/4
		) );
	
	View.addChild( new GroundNode( 
		-screenWidth/2, 
		screenHeight-earthHeight , 
		screenWidth*2, 
		earthHeight, 
		earthHeight*1/4,
		{topColor: '#93774c', bottomColor:'#93774c'} 
		) );

   // Model View Transform
    var modelPoint = new Vector2( 0, 0 );
    var viewPoint = new Vector2( this.layoutBounds.width / 2, this.layoutBounds.height - earthHeight );
    var scale = 50;
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( modelPoint, viewPoint, scale );
    this.modelViewTransform = modelViewTransform;

  //  Reset button 
       var resetAllButton = new ResetAllButton( { listener: function() { 
	  model.reset();
	 }
       } );

      var resetText=new Text('Reset', {font:new PhetFont({ fill: 'black', size: 11}) } );
      this.addChild(resetAllButton);
      this.addChild(resetText);

      resetAllButton.scale(0.80);
      resetAllButton.right=this.layoutBounds.right - 20;
      resetAllButton.bottom=this.layoutBounds.bottom - 20;
      resetText.top=resetAllButton.bottom+3;
      resetText.centerX=resetAllButton.centerX;

   //Model bounds
    this.availableViewBounds = new DotRectangle(0,0,this.layoutBounds.width,this.layoutBounds.height);
    this.availableModelBoundsProperty = new Property();
    this.availableModelBoundsProperty.linkAttribute( model, 'availableModelBounds' );
    var modelBounds = this.modelViewTransform.viewToModelBounds( this.availableViewBounds );
    this.availableModelBoundsProperty.value = modelBounds;    
//    this.availableModelBounds = this.modelViewTransform.viewToModelBounds( this.availableViewBounds );
//    this.availableModelBoundsProperty.value = this.availableModelBounds;

    //TrackLayer that contains all TrackNodes
    var trackLayerNode = new TrackLayerNode(model,View, {screenHeight: screenHeight, earthHeight: earthHeight} );
    View.addChild(trackLayerNode);

/*
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

	//TrackLayer contains all the tracks
      var trackLayer = new Node();

      var addTrackNode = function( track ) {

        var trackNode = new TrackNode( model, track, modelViewTransform, View.availableModelBoundsProperty );
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
            model.tracks.removeItemRemovedListener( itemRemovedListener );// Clean up memory leak
	    View.removeChild(frictionSlider);
	    View.removeChild(heightSlider);
	    View.removeChild(deleteButton);
          }
        };
        model.tracks.addItemRemovedListener( itemRemovedListener );
        return trackNode;
      };

      var trackNodes = model.tracks.map( addTrackNode ).getArray();
      model.tracks.addItemAddedListener( addTrackNode );
      View.addChild( trackLayer );
*/

  //Track Creation Panel
   var trackCreationPanel = new TrackCreationPanel( model );
   View.addChild(trackCreationPanel);
   trackCreationPanel.top = screenHeight - earthHeight + 10;
   trackCreationPanel.left = 10;

    //Simulation State(Design/State) Display Panel
    var stateDisplayPanel = new StateDisplayPanel( model );
    View.addChild(stateDisplayPanel); 
    stateDisplayPanel.centerX = View.layoutBounds.width/2;
    stateDisplayPanel.top = 10;

    //Track Design Buttons
    var trackDesignButtons = new TrackDesignButtons( model, View );
    View.addChild(trackDesignButtons);
    trackDesignButtons.top = screenHeight - earthHeight + 10;
    trackDesignButtons.left = trackCreationPanel.right + 10;

    //hide the trackCreationPanel when trackDesignState changes
    model.trackDesignStateProperty.link( function (state) {
	var value = (state == 'addTrack') ? true:false;
	trackCreationPanel.visible = value;		
    } );

    // Skater Node
    var allowWebGL = window.phetcommon.getQueryParameter( 'webgl' ) !== 'false';
    var webGLSupported = Util.isWebGLSupported && allowWebGL;
    var renderer = webGLSupported ? 'webgl' : 'svg';
    var skaterNode = new SkaterNode(
      model.skater,
      this,
      modelViewTransform,
      model.getClosestTrackAndPositionAndParameter.bind( model ),
      model.getPhysicalTracks.bind( model ),
      renderer
    );
    View.addChild(skaterNode);
    model.simStateProperty.link( function(state) { //display skaterNode only in simuation screen
	skaterNode.visible = state =='simulation'? true:false;	
    } );

    var valueText = new Text( "",new PhetFont(14) );
    View.addChild(valueText);
    valueText.centerY=100;
    model.skater.trigger('updated');

    model.skater.kineticEnergyProperty.link( function(value) {
//	valueText.text = value;
    } );

    
/*
  //Track sliders
    var trackSliders = model.allTracks.map(addTrackSlider).getArray();
    var i=0;
    trackSliders.forEach ( function ( sliderNode ) {
	    View.addChild(sliderNode);
	    sliderNode.left = 10;
	    sliderNode.centerY = 100*i;
	    i=i+1;
    } );
*/

//scale slider, not needed anymore
/*
     var scaleSlider = new ControlSlider(
     'Scale', 
     '', 
     model.trackScaleProperty, 
     new Range(0.5,1), 
     function(val){return val;},
     new Property(true),
     {delX:0.05, decimals:2}
      );
      View.addChild(scaleSlider);
*/
/*
      model.trackScaleProperty.link( function ( ) {
	trackNode.track = model.track;
	trackNode.updateTrackShape();
      } );
*/      


  } //end of function

  return inherit( ScreenView, RollerCoasterScreenView,  {

    // No state that is specific to the view, in this case
    getState: function() {},
    setState: function() {},

    // Layout the EnergySkateParkBasicsScreenView, scaling it up and down with the size of the screen to ensure a
    // minimially visible area, but keeping it centered at the bottom of the screen, so there is more area in the +y
    // direction to build tracks and move the skater

    layout: function( width, height ) {  //I have no idea what role this function plays

      this.resetTransform();	
      var scale = this.getLayoutScale( width, height );
      this.setScaleMagnitude( scale );

      var offsetX = 0;
      var offsetY = 0;

      // Move to bottom vertically
      if ( scale === width / this.layoutBounds.width ) {
        offsetY = (height / scale - this.layoutBounds.height);
      }

      // center horizontally
      else if ( scale === height / this.layoutBounds.height ) {
        offsetX = (width - this.layoutBounds.width * scale) / 2 / scale;
      }
      this.translate( offsetX, offsetY );

//      this.groundNode.layout( offsetX, offsetY, width, height, scale );
//      this.gridNode.layout( offsetX, offsetY, width, height, scale );

      this.availableViewBounds = new DotRectangle( -offsetX, -offsetY, width / scale, this.modelViewTransform.modelToViewY( 0 ) + Math.abs( offsetY ) );
/*
      // Float the control panel to the right (but not arbitrarily far because it could get too far from the play area)
      this.controlPanel.right = Math.min( 890, this.availableViewBounds.maxX ) - 5;

      if ( this.attachDetachToggleButtons ) {
        this.attachDetachToggleButtons.centerX = this.controlPanel.centerX;
      }

      if ( this.sceneSelectionPanel ) {
        var panelAbove = this.attachDetachToggleButtons || this.controlPanel;
        this.sceneSelectionPanel.centerX = panelAbove.centerX;
        this.sceneSelectionPanel.top = panelAbove.bottom + 5;
      }
      this.resetAllButton.right = this.controlPanel.right;
      this.returnSkaterButton.right = this.resetAllButton.left - 10;
*/
      // Compute the visible model bounds so we will know when a model object like the skater has gone offscreen
      this.availableModelBounds = this.modelViewTransform.viewToModelBounds( this.availableViewBounds );
      this.availableModelBoundsProperty.value = this.availableModelBounds;
/*
      // Show it for debugging
      if ( showAvailableBounds ) {
        this.viewBoundsPath.shape = Shape.bounds( this.availableViewBounds );
      } */
      
    }
  } );

} ); //end of define
