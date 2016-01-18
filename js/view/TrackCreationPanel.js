/**
 * TrackCreationPanel for selecting and creating a track.
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

  //images
  var HillImage = require( 'image!ROLLERCOASTER/hill.png' );
  var DropImage = require( 'image!ROLLERCOASTER/drop.png' );
  var LoopImage = require( 'image!ROLLERCOASTER/loop.png' );
  var BankImage = require( 'image!ROLLERCOASTER/bank.png' );
  
  //specific modules
//  var ControlSlider = require( 'ROLLERCOASTER/view/ControlSlider' );

  /**
   * @param {SimulationModel} model
   * @constructor
   */
  function TrackCreationPanel( model, options ) {

    options = _.extend( {
      xMargin: 15,
      yMargin: 10,
//      fill: 'rgb(242,250,136)',
      fill: 'rgb(230,230,230)',
      stroke: 'black',
      lineWidth: 2,
      resize: false,
      opacity: 0.9,
    }, options );

    var track;
    var contentNode = new Node();
    var hillImgNode = new Image ( HillImage ); 
    var dropImgNode = new Image ( DropImage ); 
    var bankImgNode = new Image ( BankImage ); 
    var loopImgNode = new Image ( LoopImage ); 

    var imgNodes = [hillImgNode, dropImgNode, bankImgNode, loopImgNode];
    var trackNames = ["Hill", "Drop", "Bank", "Loop"];

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
	      	   track.physicalProperty.set(true);
	      	   track.droppedProperty.set(true);
	      },
	    } );
	    return trackButton;
	};

    //Map track buttons to tracks 
    var trackButtons = model.allTracks.map(addTrackButton).getArray();
    var i=0;    
    trackButtons.forEach ( function ( buttonNode ) {
	    contentNode.addChild(buttonNode);
	    buttonNode.centerY = Math.floor(i/2)*75;
	    buttonNode.centerX = 75*(i%2);
	    i=i+1;
    } );

    //Panel Title
    var panelTitle = new Text("Add Track", {font: new PhetFont({ fill: 'black', size: 13, style:'bold'}) } );
    contentNode.addChild(panelTitle);
    panelTitle.bottom = contentNode.top - 5;
    panelTitle.centerX = contentNode.centerX;


/*    var hillButton = new ImageButton(hillImgNode, {baseColor: 'rgb(0, 0, 0)'});
    contentNode.addChild(hillButton);
    hillButton.centerX=150;
*/
    Panel.call( this, contentNode, options );
  }

  return inherit( Panel, TrackCreationPanel );
} );

