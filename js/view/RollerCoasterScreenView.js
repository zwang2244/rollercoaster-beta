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
//  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
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
  var GridNode = require( 'ROLLERCOASTER/view/GridNode' );
  var ControlSlider = require( 'ROLLERCOASTER/view/ControlSlider' );
  var TrackCreationPanel = require( 'ROLLERCOASTER/view/TrackCreationPanel' );
  var StateDisplayPanel = require( 'ROLLERCOASTER/view/StateDisplayPanel' );
  var TrackDesignPanel = require( 'ROLLERCOASTER/view/TrackDesignPanel' );
  var SkaterNode = require( 'ROLLERCOASTER/view/SkaterNode' );
  var TrackLayerNode = require( 'ROLLERCOASTER/view/TrackLayerNode' );
  var BarGraphBackground = require( 'ROLLERCOASTER/view/BarGraphBackground' );
  var BarGraphForeground = require( 'ROLLERCOASTER/view/BarGraphForeground' );
  var ForceVectors = require( 'ROLLERCOASTER/view/ForceVectors' );
  var DisplayPanelFirst = require( 'ROLLERCOASTER/view/DisplayPanelFirst' );

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
//	var earthHeight=screenHeight*1/2.5;
	var earthHeight=screenHeight*1/2.99;
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
    var scale = 50; //1m = 50px
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( modelPoint, viewPoint, scale );
    this.modelViewTransform = modelViewTransform;

  //Grid Node
    this.gridNode = new GridNode( model.gridVisibleProperty, modelViewTransform, earthHeight);
    View.addChild( this.gridNode );

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
    

  //Track Creation Panel
   var trackCreationPanel = new TrackCreationPanel( model, View );
   View.addChild(trackCreationPanel);
   trackCreationPanel.top = View.interfaceHeight + 15;
   trackCreationPanel.left = 10;

    //Simulation State(Design/State) Display Panel
/*    var stateDisplayPanel = new StateDisplayPanel( model );
    View.addChild(stateDisplayPanel); 
    stateDisplayPanel.centerX = View.layoutBounds.width/2;
    stateDisplayPanel.top = 10;
*/
    //Track Design Buttons
    var trackDesignPanel = new TrackDesignPanel( model, View );
    View.addChild(trackDesignPanel);
    trackDesignPanel.top = View.layoutBounds.top + 10;
    trackDesignPanel.centerX = View.layoutBounds.centerX;

    //hide the trackCreationPanel when trackDesignState changes
    model.trackDesignStateProperty.link( function (state) {
	var value = (state == 'addTrack') ? true:false;
	trackCreationPanel.visible = value;		
//	trackCreationPanel.visible = true;		
	
    } );

    // Skater Node
    var allowWebGL = window.phetcommon.getQueryParameter( 'webgl' ) !== 'false';
    var webGLSupported = Util.isWebGLSupported && allowWebGL;
    var renderer = webGLSupported ? 'webgl' : 'svg';
//var renderer
    var skaterNode = new SkaterNode(
      model.skater,
      this,
      modelViewTransform,
      model.getClosestTrackAndPositionAndParameter.bind( model ),
      model.getPhysicalTracks.bind( model ),
      renderer
    );

    model.skater.trigger('updated');
    View.addChild(skaterNode);

//Bar Graph Nodes

    var energyBarGraph = new Node();
    var barGraphBackground = new BarGraphBackground( model.skater, model.barGraphVisibleProperty, model.clearThermal.bind( model ) );
    energyBarGraph.addChild( barGraphBackground );
    energyBarGraph.addChild( new BarGraphForeground( model.skater, barGraphBackground, model.barGraphVisibleProperty, renderer ) );
    energyBarGraph.rotate(Math.PI/2);
    energyBarGraph.scale(0.82);
    energyBarGraph.left = View.layoutBounds.left + 10;
    energyBarGraph.top = View.interfaceHeight + 15;
    View.addChild(energyBarGraph);
    model.barGraphVisibleProperty.linkAttribute( energyBarGraph, 'visible' ); 

// Force Vectors
    var fV = new ForceVectors( model, skaterNode, View );
   
//Display Panels
    var displayPanel = new DisplayPanelFirst(model,View);
    View.addChild(displayPanel);
    displayPanel.top = energyBarGraph.top;
    displayPanel.left = energyBarGraph.right + 10;

//Property Links
    model.simStateProperty.link( function(state) { 
    	var visibility = state =='simulation'? true:false;	
    	//display skaterNode only in simuation screen
	skaterNode.visible = visibility;
	//display barGraph only 
	model.barGraphVisibleProperty.set(visibility);
	//display barGraph only 
	displayPanel.visible = visibility;
	//heights Panels
//	View.HeightsPanel.visible = visibility;

    } );
    var valueText = new Text( "",new PhetFont(5) );
    View.addChild(valueText);
    valueText.centerY=100;

    model.skater.normalForceProperty.link( function(value) {
//	valueText.text = value.x;
    } );


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
      this.gridNode.layout( offsetX, offsetY, width, height, scale );

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
