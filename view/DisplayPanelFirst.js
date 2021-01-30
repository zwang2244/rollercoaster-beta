
/************************************************
*		DisplayPanel			*
*************************************************
*
* Displays Compost Mixture composition
*
* author: Dinesh
*/

define( function( require ) {
  'use strict';

  // general modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var Vector2 = require('DOT/Vector2');
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Panel = require( 'SUN/Panel' );

   //specific modules
  var PanelItem = require( 'ROLLERCOASTER/view/PanelItem' );
  var CORNER_RADIUS = 3;

/**
   * Constructor for the DisplayPanelItem
   * @param {model} simulation model
   * @param options{ }

   * @constructor
   */

  function DisplayPanelFirst( model, View, options ) {

    options = _.extend( {
        xMargin: 10,
        yMargin: 10,
        lineWidth: 3
      },
      options );

     Node.call( this , {cursor: 'pointer'});

// ------  Positiononing each item of a Node panel --------------------------------
    var positionItems = function (node) {
      var items = node.getChildren();

	var maxwidth_1=0;

	for(var i=0;i<items.length;i++) //get maximum width
	{
		if(items[i].right>maxwidth_1) { maxwidth_1 = items[i].right; }
	}

	for(i=0;i<items.length;i++)  //right align each item
	{
		items[i].right=maxwidth_1;
	}
	for(i=1;i<items.length;i++)
	{
		items[i].top=items[i-1].bottom+options.yMargin;
	}
    };

// ---------- horizontalPositionItems -----------------
    var horizontalPositionItems = function (node) {
      var items = node.getChildren();
	for(var i=1;i<items.length;i++)
	{
		items[i].top=items[i-1].top;
		items[i].left =items[i-1].right + options.xMargin;
	}
    };
// Other functions
     var getHeight = function(pos){ return pos.y; };
     var getMagnitude = function(v){ return v.magnitude(); };
     var getFrictionForce = function (normalForce) { return normalForce.times(model.friction).magnitude();};
     var getWeight = function (mass) {return Math.abs(mass*model.skater.gravity);}


// ----------------    INPUT ELEMENTS    ----------------------

    var massDisplay = new PanelItem('Mass', model.skater.massProperty,'kg', {decimals:0});
    var frictionDisplay = new PanelItem('Friction', model.frictionProperty,'', {decimals:2});

     var Input=new Node();
     Input.addChild(massDisplay);
     Input.addChild(frictionDisplay);
     positionItems(Input);

// --------------- TRACK HEIGHT DISPLAYS ------------------------

    var Heights = new Node();
    var HeightsPanel = new Panel(Heights,{fill:'#F0F0F0',xMargin:10,yMargin:10});
    HeightsPanel.scale(0.70);
    View.HeightsPanel = HeightsPanel;
    View.addChild(HeightsPanel);
        
     var addHeightDisplay = function(track) {
     	var trackHeightDisplay = new PanelItem(track.trackName, track.trackHeightProperty,'m', {decimals:2});
	Heights.addChild(trackHeightDisplay);
        horizontalPositionItems(Heights);
        
	// When track removed, remove its view
        var itemRemovedListener = function( removed ) {
          if ( removed === track ) {
	    Heights.removeChild(trackHeightDisplay);
            model.previousTracks.removeItemRemovedListener( itemRemovedListener );// Clean up memory leak
          }
        };
        model.previousTracks.addItemRemovedListener( itemRemovedListener );
        
        HeightsPanel.bottom = View.layoutBounds.height - 5;
        HeightsPanel.left = 10;
	return trackHeightDisplay;
     };
     var trackHeightDisplays = model.previousTracks.map( addHeightDisplay ).getArray();
     model.previousTracks.addItemAddedListener( addHeightDisplay );

// ---------------  SPEED VELOCITY ACCELERATION PANEL ---------

    var speedDisplay = new PanelItem('Speed', model.skater.uDProperty,'m/s', {decimals:2,scaleFunction:Math.abs});
    var accelerationDisplay = new PanelItem('Acceleration', model.skater.accelerationProperty,'m/s<sup>2</sup>', {decimals:2,scaleFunction:getMagnitude,labelSize:13});
//    var heightDisplay = new PanelItem('Height', model.skater.positionProperty,'m', {decimals:2,scaleFunction:getHeight});
    var maxADisplay = new PanelItem('Max Accleration', model.skater.maxAProperty,'m/s<sup>2</sup>', {decimals:1,scaleFunction:Math.abs,labelSize:12});
    var maxUDisplay = new PanelItem('Max Speed', model.skater.maxUProperty,'m/s', {decimals:1,scaleFunction:Math.abs,labelSize:12});

     var Speed = new Node();
     Speed.addChild(speedDisplay);
     Speed.addChild(accelerationDisplay);
     Speed.addChild(maxADisplay);
     Speed.addChild(maxUDisplay);

     positionItems(Speed); 

// --------------- FORCE ELEMENTS ----------------------

    var weightDisplay = new PanelItem('Weight', model.skater.massProperty,'N', {decimals:0,scaleFunction:getWeight});
    var normalForceDisplay = new PanelItem('Normal Force', model.skater.normalForceProperty,'N', {decimals:0,scaleFunction:getMagnitude,labelSize:13});
    var frictionForceDisplay = new PanelItem('Friction Force', model.skater.normalForceProperty,'N', {decimals:1,scaleFunction:getFrictionForce,labelSize:13});
    var netForceDisplay = new PanelItem('Net Force', model.skater.netForceProperty,'N', {decimals:1,scaleFunction:getMagnitude,labelSize:14});

     var Forces = new Node();
     Forces.addChild(weightDisplay);
     Forces.addChild(normalForceDisplay);
     Forces.addChild(frictionForceDisplay);
     Forces.addChild(netForceDisplay);

     positionItems(Forces); 


    var fontOptions = {font: new PhetFont( {  fill: 'black', size: 14 } )};


// ----------------   Accorodion Box for Inputs -------------------------------------------
	
     var InputBox = new AccordionBox( Input,
      {
        titleNode: new Text( 'Inputs', { fill:'black', font: new PhetFont( { size: 14 , weight: 'bold' } ) } ),
        fill: 'rgb(230,230,230)',
        stroke: 'black',
	lineWidth:2,
	contentYSpacing: 5,
	contentXMargin: 15,
	contentYMargin: 15,        
        contentAlign: 'center',
        titleAlign: 'center',
        buttonAlign: 'left',
        scale: 0.75,
        cornerRadius: 10,
        buttonXMargin: 5,
        buttonYMargin: 5,
	showTitleWhenExpanded: true,
	minWidth: 100,
      } );

// ----------------   Accorodion Box for Forces -------------------------------------------

     var ForcesBox = new AccordionBox( Forces,
      {
        titleNode: new Text( 'Forces', { fill:'black', font: new PhetFont( { size: 14 , weight: 'bold' } ) } ),
        fill: 'rgb(230,230,230)',
        stroke: 'black',
	lineWidth:2,
	contentYSpacing: 5,
	contentXMargin: 15,
	contentYMargin: 15,        
        contentAlign: 'center',
        titleAlign: 'center',
        buttonAlign: 'left',
        scale: 0.75,
        cornerRadius: 10,
        buttonXMargin: 5,
        buttonYMargin: 5,
	showTitleWhenExpanded: true,
	minWidth: 100,
      } );

// ----------------   Accorodion Box for Speed -------------------------------------------

     var SpeedBox = new AccordionBox( Speed,
      {
        titleNode: new Text( 'Speed', { fill:'black', font: new PhetFont( { size: 14 , weight: 'bold' } ) } ),
        fill: 'rgb(230,230,230)',
        stroke: 'black',
	lineWidth:2,
	contentYSpacing: 5,
	contentXMargin: 15,
	contentYMargin: 15,        
        contentAlign: 'center',
        titleAlign: 'center',
        buttonAlign: 'left',
        scale: 0.75,
        cornerRadius: 10,
        buttonXMargin: 5,
        buttonYMargin: 5,
	showTitleWhenExpanded: true,
	minWidth: 100,
      } );

// ----------------   Heights Box  -------------------------------------------

    this.addChild( InputBox );
    this.addChild( ForcesBox );
    this.addChild( SpeedBox ); 

    ForcesBox.left = InputBox.right + 7;
    SpeedBox.left = ForcesBox.right + 7;

  }

  return inherit( Node, DisplayPanelFirst );
} );
