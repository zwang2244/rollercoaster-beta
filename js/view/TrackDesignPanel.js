/**
 * TrackDesignButtons for adding the simulation/design buttons for track design/simulation.
 *
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var EraserButton = require( 'SCENERY_PHET/buttons/EraserButton' );
  var RefreshButton = require( 'SCENERY_PHET/buttons/RefreshButton' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var ImageButton = require( 'ROLLERCOASTER/view/ImageButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Range = require( 'DOT/Range' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var CheckBox = require( 'SUN/CheckBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var Image = require( 'SCENERY/nodes/Image' );


  //specific modules
  var PlaybackSpeedControl = require( 'ROLLERCOASTER/view/PlaybackSpeedControl' );
  var ControlSlider = require( 'ROLLERCOASTER/view/ControlSlider' );
  var Constants = require( 'ROLLERCOASTER/Constants' );

	//images
  var WallImage = require( 'image!ROLLERCOASTER/wall.png' );
  var flagImage = require( 'image!ROLLERCOASTER/flag1.png' );
  var flagImage2 = require( 'image!ROLLERCOASTER/flag2.png' );

  /**
   * @param {SimulationModel} model
   * @constructor
   */
  function TrackDesignPanel( model, View, options ) {

    options = _.extend( {
      xMargin: 15,
      yMargin: 10,
      stroke: 'black',
      lineWidth: 2,
    }, options );

    Node.call( this );
    var buttons = this;

//Dummy text
    var valueText = new Text( "",new PhetFont(14) );
    View.addChild(valueText);
    valueText.centerX = View.layoutBounds.centerX;
    valueText.top = 50;

//Wall
    var wallImgNodeH = new Image ( WallImage ); 
    var wallImgNodeV = new Image ( WallImage );
    wallImgNodeH.scale(0.35);
    wallImgNodeV.scale(0.4);
    wallImgNodeH.rotate(Math.PI/2);
    View.addChild(wallImgNodeH);
    View.addChild(wallImgNodeV);

//Flag
    var flagImgNode = new Image ( flagImage ); 
    View.addChild(flagImgNode);
    flagImgNode.scale(0.20);

    var speedFlagImgNode = new Image ( flagImage2 ); 
    View.addChild(speedFlagImgNode);
    speedFlagImgNode.scale(0.20);


//Function to merge the tracks
    var mergeTracks = function() {
        var unmerged_tracks = model.getAllTracks() ;
	var tracks = model.getAllTracks();
	//store the unmerged tracks
//	model.previousTracks = tracks;
	model.tracks.forEach( function(track) {
	    model.previousTracks.add(track);
         } );
	
	var trackLength = tracks.length;
	var maxMerges = tracks.length - 1;
	var merges = 0, i = 0;
	var track,t, myPoints;
	valueText.text = "";
	if(trackLength==0)
	{
		valueText.text = "Error ! No Track to simulate, add atleast one track ! ";
	        valueText.centerX = View.layoutBounds.centerX;
		return false;
	}
	// if snapTarget is intact
	while( (i < trackLength ) && ( merges < maxMerges) )
	{
		track = tracks[i];
		myPoints = [track.controlPoints[0], track.controlPoints[track.controlPoints.length - 1]];
		if ( myPoints[0].snapTarget || myPoints[1].snapTarget ) 
		{
			if(model.joinTracks(track)) //if snapTarget is intact
			{
				merges++;
				trackLength--;
				i = 0;
				tracks = model.getAllTracks();
//				valueText.text = valueText.text + tracks[trackLength-1].trackName;
			}
			else if(model.joinTracks2(track))  // find the closest point if snapTarget exists but point shifted while merging some other track
			{
				merges++;
				trackLength--;
				i = 0;
				tracks = model.getAllTracks();
//				valueText.text = valueText.text + tracks[trackLength-1].trackName;
			}
			else //move on if snapping does not work
			{
				i++;
			}
		}
		else 
		{
			i++;
		}
	}

//	valueText.text = valueText.text + "X";

	// unsnapped points
	i=0;
	tracks = model.getAllTracks();
	trackLength = tracks.length;
	while((i < trackLength )&&(merges < maxMerges))
	{
		t = tracks[i];
		if(model.snapControlPoint(t))
		{
			model.joinTracks(t);
			merges++;
			trackLength--;
			i = 0;
			tracks = model.getAllTracks();
//			valueText.text = valueText.text + tracks[trackLength-1].trackName;
			continue;
		}
		i++;
  }
 



//	if(merges < maxMerges)
	if(model.getAllTracks().length !==1 ) //make sure there is only one track
	{

		valueText.text = "Error ! Tracks must be kept closer to merge properly !" + model.getAllTracks().length.toFixed(0);
	        valueText.centerX = View.layoutBounds.centerX;
	        
		model.tracks.clear();
		model.previousTracks.forEach( function(track)
		{
			track.interactive=true;
			model.tracks.add(track);
		} );
		model.previousTracks.clear();
		model.mergedTrackCount = 0;
  /*
      for(var i=0;i<unmerged_tracks.length;i++)
      {
        var track=unmerged_tracks[i];
        track.interactive=true;
        model.tracks.add(track);
      }
  */

      //Zhilin
    // var n =0;
    // var m =0;
    // while( (n < trackLength ) )
    // {
    //   var t1 = tracks[n];
    //   while((m > n ) && (m < trackLength)){
    //     var t2 = tracks[m];
    //     // calculate the overlap
    //     valueText.text = "x value" + t1.x;
    //     valueText.centerX = View.layoutBounds.centerX;
    //     m++;
    //   }
    //   n++;
    // }


		return false;
	}
	else
	{
		//add flat portion of the track
		var track  = model.getAllTracks();
		var right = track[0].getRightControlPointXY();
		model.tracks.add(model.flatTrack);
		model.flatTrack.position = new Vector2(right.x,right.y);
		model.flatTrack.updateLinSpace();
		model.flatTrack.updateSplines();
		model.flatTrack.trigger('scaled');
		track[0].updateSplines();

/*		var cps = track[0].controlPoints;
		var x = cps[cps.length-1];
		var dist = x.position.distance(model.flatTrack.controlPoints[0].position);
		valueText.text = dist.toFixed(2);
		valueText.centerX = View.layoutBounds.centerX;*/
		
		var track  = model.getAllTracks();
		var tkNo = (track[1].trackName) == "Flat" ? 0:1;
		var rCP = track[0].getRightControlPoint();
		rCP.snapTarget = model.flatTrack.controlPoints[0];
		if(model.joinTracks(track[0]))
		{
		}
		track  = model.getAllTracks();
		rCP = track[0].getRightControlPoint().sourcePosition;
		wallImgNodeH.bottom = View.modelViewTransform.modelToViewY(rCP.y)+6;
		wallImgNodeH.left = View.modelViewTransform.modelToViewX(rCP.x);
		var adj = (model.skater.mass-40)/20*10;
		wallImgNodeV.right = wallImgNodeH.right + adj;
		wallImgNodeV.bottom = wallImgNodeH.bottom;
		return true;
	}
    };
   // Mass Slider
    var massSlider = new ControlSlider (
    	  "Car Mass",
    	 'kg',
    	 model.skater.massProperty,
    	 new Range(Constants.MIN_MASS,Constants.MAX_MASS), //range
    	 function(val){return val;},
    	 new Property(true),
    	 {delX:2, decimals:0} );
   massSlider.scale(0.550);

   //Friction SLIDER
    var frictionSlider = new ControlSlider (
    	  "Friction",
    	 '',
    	 model.frictionProperty,
    	 new Range(0,0.1), //friction range
    	 function(val){return val;},
    	 new Property(true),
    	 {delX:0.01, decimals:2} );
   frictionSlider.scale(0.550);

    var children = [massSlider,frictionSlider];
    var panelContent = new HBox( { spacing: 15, children: children } );
    var massFrictionPanel = new Panel(panelContent,{fill:'#F0F0F0',xMargin:10});  
    View.addChild(massFrictionPanel);
	
  //Adjust heights button 
    var adjHeightsButton = new TextPushButton (  'Adjust Height', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 12 ),
      textFill: 'white',
      xMargin: 10,
      listener: function() {
      	   model.trackDesignStateProperty.set('height');
      },
    } );

    var adjWidthButton = new TextPushButton (  'Adjust Width', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 12 ),
      textFill: 'white',
      xMargin: 10,
      listener: function() {
      	   model.trackDesignStateProperty.set('width');
      },
    } );

    var adjFrictionButton = new TextPushButton (  'Adjust Friction', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 12 ),
      textFill: 'white',
      xMargin: 10,
      listener: function() {
      	   model.trackDesignStateProperty.set('friction');
      },
    } );

    var doneButton = new TextPushButton (  'Done', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 14 ),
      textFill: 'white',
      xMargin: 10,
      listener: function() {
      	   model.trackDesignStateProperty.set('addTrack');
      },
    } );

// JOIN TRACKS AND SIMULATE BUTTON            
    var mergeTracksButton = new TextPushButton (  'Join Tracks & Simulate', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 12 ),
      textFill: 'white',
      xMargin: 10,
      listener: function() {

      	   model.trackDesignStateProperty.set('merge');
      	   if(mergeTracks())
      	   {
      	   	model.simStateProperty.set('simulation');
      	   }
      	   else
      	   {
      	   	model.simStateProperty.set('design');
	        model.trackDesignStateProperty.set('addTrack');
      	   }
      },
    } );

// ERASER BUTTON
    var eraserButton = new EraserButton (  {
      iconWidth : 24,
      listener: function() {
      	   model.trackDesignStateProperty.set('deleteTrack');
      },
    } );
 
    var eraserText = new Text('Delete Track', {font:new PhetFont({ fill: 'black', size: 11}) } );
    eraserText.centerX = eraserButton.centerX;
    eraserText.top = eraserButton.bottom + 5;    
    var eraserButtonNode = new Node( {children:[eraserText,eraserButton]} ); 

// Zhilin
// Export BUTTON

var exportButton = new TextPushButton (  'Export Data', {
  baseColor: 'rgb(50,50,180)',
  font: new PhetFont( 12 ),
  textFill: 'white',
  xMargin: 10,
  listener: function() {

      //  model.trackDesignStateProperty.set('merge');
      //  if(mergeTracks())
      //  {
      //    model.simStateProperty.set('simulation');
      //  }
      //  else
      //  {
      //    model.simStateProperty.set('design');
      // model.trackDesignStateProperty.set('addTrack');
      //  }
  },
} );

// RESET All button     	

       var resetAllButton = new ResetAllButton( { listener: function() {
	model.returnSkaterStart();	  
	model.reset();
	}
       } );

      var resetText=new Text('Reset', {font:new PhetFont({ fill: 'black', size: 10}) } );
      var resetButtonNode = new Node( {children:[resetText,resetAllButton]} ); 

      resetAllButton.scale(0.80);
      resetText.centerX=resetAllButton.centerX;
      resetText.top=resetAllButton.bottom+3;

//Checkbox
    var textOptions = {font: new PhetFont( 12 )};
    var gridSet = {label: new Text( 'Grid', textOptions )};
    var forceVectorsSet = {label: new Text( 'Force Vectors', textOptions )};
    var speedFlagSet = {label: new Text( 'Max Speed', textOptions )};
    var accFlagSet = {label: new Text( 'Max Acceleration', textOptions )};
    var options = {boxWidth: 18};
    // In the absence of any sun (or other) layout packages, just manually space them out so they will have the icons aligned

    var pad = function( itemSet ) {
      var padWidth = 20 - itemSet.label.width;
      return [itemSet.label, new Rectangle( 0, 0, padWidth + 20, 20 )];
    };

    var gridChkBox =  new CheckBox( new HBox( {children: pad(gridSet)} ), model.gridVisibleProperty , options );
    var vectorsChkBox = new CheckBox( new HBox( {children: pad(forceVectorsSet)} ), model.vectorsVisibleProperty , options );
    var speedChkBox = new CheckBox( new HBox( {children: pad(speedFlagSet)} ), model.speedFlagVisibleProperty , options );
    var accChkBox = new CheckBox( new HBox( {children: pad(accFlagSet)} ), model.accFlagVisibleProperty , options );

    var checkBoxChildren = [
	gridChkBox,
	vectorsChkBox,
	speedChkBox,
	accChkBox
        ];
    var checkBoxes = new VBox( {align: 'left', spacing: 4, children: checkBoxChildren} );
    View.addChild(checkBoxes);

//Positioning of Buttons & Checkboxes

    buttons.addChild(adjHeightsButton);
//    buttons.addChild(adjFrictionButton);
    buttons.addChild(adjWidthButton);
    buttons.addChild(mergeTracksButton);
    //Zhilin
    View.addChild(exportButton);
    View.addChild(doneButton);
    View.addChild(eraserButtonNode);
    
    View.addChild(resetButtonNode);
/*
    adjFrictionButton.centerX = adjHeightsButton.centerX;
    adjFrictionButton.top = adjHeightsButton.bottom + 10;
    mergeTracksButton.centerX = adjHeightsButton.centerX;
    mergeTracksButton.top = adjFrictionButton.bottom + 10;
    adjFrictionButton.left = adjHeightsButton.right + 10;
    adjFrictionButton.top = adjHeightsButton.top;
*/
    adjHeightsButton.left =  adjWidthButton.right + 10;
    adjHeightsButton.top =  adjWidthButton.top;
    mergeTracksButton.left = adjHeightsButton.right + 10;
    mergeTracksButton.top = adjHeightsButton.top;

    //Zhilin

    resetButtonNode.right =  adjWidthButton.left + 170;
    resetButtonNode.top =  adjWidthButton.top + 15;

    checkBoxes.right = View.layoutBounds.right - 10;
    checkBoxes.top = View.layoutBounds.top + 5;


    eraserButtonNode.centerY = resetButtonNode.centerY + 2;
    eraserButtonNode.right = resetButtonNode.left - 10 ;

    //Zhilin
    // exportButton.centerY = eraserButtonNode.centerY - 7;
    // exportButton.right = eraserButtonNode.left - 10;
    exportButton.top = checkBoxes.top + 105;
    exportButton.right = checkBoxes.right - 30;

    massFrictionPanel.right = View.layoutBounds.right + 65 - 120;
    massFrictionPanel.top = View.interfaceHeight + 15;

    doneButton.centerX=60;
    doneButton.centerY=30;


// Property links
    model.trackDesignStateProperty.link( function(state) {
    	adjHeightsButton.visible = (state == 'addTrack') ? true:false;
    	adjWidthButton.visible = (state == 'addTrack') ? true:false;
      adjFrictionButton.visible = (state == 'addTrack') ? true:false;
      //Zhilin
      eraserButtonNode.visible = (state == 'addTrack') ? true:false;
      //exportButton.visible = (state == 'addTrack') ? true:false;
    	mergeTracksButton.visible = (state == 'addTrack') ? true:false;
    	massFrictionPanel.visible = (state == 'addTrack') ? true:false;
      doneButton.visible = ((state !== 'addTrack')&&(state!=='merge')) ? true:false;
      exportButton.visible = ((state !== 'addTrack')) ? true:false;
//    	resetButtonNode.visible = ((state=='addTrack')||(state=='merge')) ?true : false;
    } );

// Simulation Screen Buttons

    var playProperty = model.property( 'paused' ).not();
    var playPauseButton = new PlayPauseButton( playProperty ).mutate( {scale: 0.5} );

    // Make the Play/Pause button bigger when it is showing the pause button, see #298
    var pauseSizeIncreaseFactor = 1.15;
    playProperty.lazyLink( function( isPlaying ) {
      playPauseButton.scale( isPlaying ? ( 1 / pauseSizeIncreaseFactor ) : pauseSizeIncreaseFactor );
    } );

    var stepButton = new StepButton( function() { model.manualStep(); }, playProperty );

    var restartSkaterButton = new RefreshButton( { listener: function() { 
	model.returnSkaterStart();
	model.rollerState = 'start';
	model.manualStep();
	}
    } );
    restartSkaterButton.scale(0.8);
    var restartSkaterText = new Text('Restart Car', {font:new PhetFont({ fill: 'black', size: 9}) } );

/*    var restartSkaterButton = new TextPushButton ( 'Restart Skater', {
      font: new PhetFont( 12 ),
      baseColor: '#44c767',
      xMargin: 5,
      listener: function() {
      	model.returnSkaterStart();
      },
    } );
*/
   var disconnectTracks =  function() {
      	model.simStateProperty.set('design');
      	model.rollerStateProperty.set('start');
      	model.trackDesignStateProperty.set('addTrack');
	model.skater.maxAProperty.reset();
	model.skater.maxAPosProperty.reset();
//   	model.skater.reset();
	model.tracks.clear();
   	model.paused = true;
   	model.mergedTrackCount = 0;

	model.previousTracks.forEach( function(track)
	{
		track.interactive=true;
		model.tracks.add(track);
	} );
	model.previousTracks.clear();
   };

    var disconnectTracksButton = new TextPushButton ( 'Modify Design', {
      baseColor: 'rgb(50,50,180)',
	baseColor: '#f0c911',
      font: new PhetFont( 12 ),
//      textFill: 'white',
      xMargin: 5,
      listener: disconnectTracks,
    } );

    var playbackSpeedControl = new PlaybackSpeedControl(model.speedProperty);
    
    // Make the step button the same size as the pause button.
    stepButton.mutate( {scale: playPauseButton.height / stepButton.height} );
    model.property( 'paused' ).linkAttribute( stepButton, 'enabled' );
    var simControlNode = new Node();
    simControlNode.addChild( playbackSpeedControl  );
    simControlNode.addChild( playPauseButton );
    simControlNode.addChild( stepButton );
    simControlNode.addChild( restartSkaterButton );
    simControlNode.addChild( restartSkaterText );
    View.addChild( disconnectTracksButton );
     var simControlPanel = new Panel(simControlNode,{xMargin: 10, yMargin: 5, fill: '#F0F0F0', lineWidth: 1});
     View.addChild(simControlPanel);

    //positioning
//    restartSkaterButton.left = stepButton.right + 10;
    restartSkaterText.centerX = restartSkaterButton.centerX;
    restartSkaterText.top = restartSkaterButton.bottom + 5;    
    playPauseButton.left = restartSkaterButton.right + 15;
    playPauseButton.centerY = restartSkaterButton.centerY;
    stepButton.left = playPauseButton.right + 15;
    stepButton.centerY = playPauseButton.centerY;
    playbackSpeedControl.left = stepButton.right+15;
    playbackSpeedControl.centerY = stepButton.centerY;
     simControlPanel.centerX = View.layoutBounds.centerX;
     simControlPanel.top = View.layoutBounds.top + 5;
    disconnectTracksButton.right = simControlPanel.left - 10;
    disconnectTracksButton.centerY = simControlPanel.centerY;

/*
    // Add the buttons directly to the view for easier positioning
    View.addChild( playPauseButton.mutate( {centerX: View.layoutBounds.centerX, top: View.interfaceHeight + 15} ) );
    View.addChild( stepButton.mutate( {left: playPauseButton.right + 15, centerY: playPauseButton.centerY} ) );
    View.addChild( restartSkaterButton.mutate( {left: stepButton.right + 10, centerY: playPauseButton.centerY} )  );
    View.addChild( disconnectTracksButton.mutate( {left: View.layoutBounds.left + 10, top: View.interfaceHeight + 15} )  );
    View.addChild( playbackSpeedControl.mutate( {right: playPauseButton.left - 25, centerY: playPauseButton.centerY} )  );
*/

   model.rollerStateProperty.link( function(state) {
	flagImgNode.visible =  ((state=='end')&&(model.accFlagVisible==true))? true: false;
	flagImgNode.bottom = View.modelViewTransform.modelToViewY(model.skater.maxAPos.y); 
	flagImgNode.centerX = View.modelViewTransform.modelToViewX(model.skater.maxAPos.x);
	speedFlagImgNode.visible =  ((state=='end')&&(model.speedFlagVisible==true))? true: false;
	speedFlagImgNode.bottom = View.modelViewTransform.modelToViewY(model.skater.maxUPos.y); 
	speedFlagImgNode.centerX = View.modelViewTransform.modelToViewX(model.skater.maxUPos.x);

   } );
   model.accFlagVisibleProperty.link( function(state) {
	flagImgNode.visible =  ((state==true)&&(model.rollerState=='end'))? true: false;
	flagImgNode.bottom = View.modelViewTransform.modelToViewY(model.skater.maxAPos.y); 
	flagImgNode.centerX = View.modelViewTransform.modelToViewX(model.skater.maxAPos.x);
   } );
   model.speedFlagVisibleProperty.link( function(state) {
	speedFlagImgNode.visible =  ((state==true)&&(model.rollerState=='end'))? true: false;
	speedFlagImgNode.bottom = View.modelViewTransform.modelToViewY(model.skater.maxUPos.y); 
	speedFlagImgNode.centerX = View.modelViewTransform.modelToViewX(model.skater.maxUPos.x);
   } );


   model.simStateProperty.link( function(state) {
   	if(state=='simulation') { 
   		model.pausedProperty.set(true); 
   		model.returnSkaterStart(); 
   		model.manualStep();
   	}
/*
	playPauseButton.visible = (state==='simulation') ? true:false;
	stepButton.visible = (state==='simulation') ? true:false;
	restartSkaterButton.visible = (state==='simulation') ? true:false;
	playbackSpeedControl.visible = (state==='simulation') ? true:false;
	*/
	disconnectTracksButton.visible = (state==='simulation') ? true:false;
	simControlPanel.visible = (state==='simulation') ? true:false;
	vectorsChkBox.visible = (state==='simulation') ? true:false;
	speedChkBox.visible = (state==='simulation') ? true:false;
	accChkBox.visible = (state==='simulation') ? true:false;
    	wallImgNodeH.visible = (state==='simulation') ? true:false;
    	wallImgNodeV.visible = (state==='simulation') ? true:false;
		
   } );

  } 
  return inherit( Node, TrackDesignPanel, {

   } );
} );

