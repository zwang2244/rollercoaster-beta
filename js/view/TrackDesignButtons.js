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
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var ImageButton = require( 'SCENERY_PHET/buttons/ImageButton' );
  var Range = require( 'DOT/Range' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );

  //specific modules
  var PlaybackSpeedControl = require( 'ROLLERCOASTER/view/PlaybackSpeedControl' );

  /**
   * @param {SimulationModel} model
   * @constructor
   */
  function TrackDesignButtons( model, View, options ) {

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
    
    //Function to merge the tracks
	
    var mergeTracks = function() {
        var unmerged_tracks = model.getAllTracks() ;
	var tracks = model.getAllTracks();
	//store the unmerged tracks
	model.previousTracks = tracks;
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
		if ( myPoints[0].snapTarget || myPoints[1].snapTarget ) {
			if(model.joinTracks(track)) //if snapTarget is intact
			{
				merges++;
				trackLength--;
				i = 0;
				tracks = model.getAllTracks();
//				valueText.text = valueText.text + tracks[trackLength-1].trackName;
				continue;
			}
			else  // find the closest point if snapTarget exists but point shifted while merging 
			{
				model.joinTracks2(track);
				merges++;
				trackLength--;
				i = 0;
				tracks = model.getAllTracks();
//				valueText.text = valueText.text + tracks[trackLength-1].trackName;
				continue;
			}
		}
		i++;
	}

	// unsnapped points
	i=0;
	tracks = model.getAllTracks();
	trackLength = tracks.length;
	while((i < trackLength )&&(merges < maxMerges))
	{
		t = tracks[i];
		if(model.snapControlPoint(t))
		{
//			valueText.text = valueText.text + "SUCCESS";
			model.joinTracks(t);
			merges++;
			trackLength--;
			i = 0;
			tracks = model.getAllTracks();
			continue;
		}
		i++;
	}
//	valueText.text = valueText.text + merges;
	if(merges < maxMerges)
	{
		model.tracks.clear();
		for(var i=0;i<unmerged_tracks.length;i++)
		{
			var track=unmerged_tracks[i];
			track.interactive=true;
			model.tracks.add(track);
		}
		valueText.text = "Error ! Tracks must be kept closer to merge properly ! ";
	        valueText.centerX = View.layoutBounds.centerX;
		return false;
	}
	else
	{
		return true;
	}
    };
	
  //Adjust heights button 
    var adjHeightsButton = new TextPushButton (  'Adjust Heights', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 14 ),
      textFill: 'white',
      xMargin: 10,
      listener: function() {
      	   model.trackDesignStateProperty.set('height');
      },
    } );

    var adjFrictionButton = new TextPushButton (  'Adjust Friction', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 14 ),
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
            
    var mergeTracksButton = new TextPushButton (  'Join Tracks and Simulate', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 14 ),
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
	        model.trackDesignStateProperty.set('addTrack');
      	   }
      	   
      },
    } );

    var eraserButton = new EraserButton (  {
      iconWidth : 28,
      listener: function() {
      	   model.trackDesignStateProperty.set('deleteTrack');
      },
    } );

    var eraserText = new Text('Delete Track', {font:new PhetFont({ fill: 'black', size: 11}) } );
    eraserText.centerX = eraserButton.centerX;
    eraserText.top = eraserButton.bottom + 5;    
    var eraserButtonNode = new Node( {children:[eraserText,eraserButton]} ); 

    buttons.addChild(adjHeightsButton);
    buttons.addChild(adjFrictionButton);
    View.addChild(doneButton);
    buttons.addChild(eraserButtonNode);
    buttons.addChild(mergeTracksButton);

    adjFrictionButton.centerX = adjHeightsButton.centerX;
    adjFrictionButton.top = adjHeightsButton.bottom + 20;
    eraserButtonNode.centerX = adjHeightsButton.centerX;
    eraserButtonNode.top = adjFrictionButton.bottom + 20;
    mergeTracksButton.left = adjHeightsButton.right + 20;
    mergeTracksButton.centerY = adjHeightsButton.centerY;
    doneButton.centerX=60;
    doneButton.centerY=30;

    model.trackDesignStateProperty.link( function(state) {
    	adjHeightsButton.visible = (state == 'addTrack') ? true:false;
    	adjFrictionButton.visible = (state == 'addTrack') ? true:false;
    	eraserButtonNode.visible = (state == 'addTrack') ? true:false;
    	mergeTracksButton.visible = (state == 'addTrack') ? true:false;
    	doneButton.visible = ((state !== 'addTrack')&&(state!=='merge')) ? true:false;
    } );

// Simulation Screen Buttons

    var playProperty = model.property( 'paused' ).not();
    var playPauseButton = new PlayPauseButton( playProperty ).mutate( {scale: 0.6} );

    // Make the Play/Pause button bigger when it is showing the pause button, see #298
    var pauseSizeIncreaseFactor = 1.35;
    playProperty.lazyLink( function( isPlaying ) {
      playPauseButton.scale( isPlaying ? ( 1 / pauseSizeIncreaseFactor ) : pauseSizeIncreaseFactor );
    } );

    var stepButton = new StepButton( function() { model.manualStep(); }, playProperty );

    var restartSkaterButton = new TextPushButton ( 'Restart Skater', {
      font: new PhetFont( 12 ),
      xMargin: 10,
      listener: function() {
      	model.returnSkaterStart();
      },
    } );

   var disconnectTracks =  function() {
      	model.simStateProperty.set('design');
      	model.trackDesignStateProperty.set('addTrack');
	model.tracks.clear();
	for(var i=0 ; i<model.previousTracks.length ; i++)
	{
		var track = model.previousTracks[i];
		track.interactive=true;
		model.tracks.add(track);
	}
      	
   };
    var disconnectTracksButton = new TextPushButton ( 'Modify Track Design', {
      baseColor: 'rgb(50,50,180)',
      font: new PhetFont( 14 ),
      textFill: 'white',
      xMargin: 10,
      listener: disconnectTracks,
    } );

    var playbackSpeedControl = new PlaybackSpeedControl(model.speedProperty);
    
    // Make the step button the same size as the pause button.
    stepButton.mutate( {scale: playPauseButton.height / stepButton.height} );
    model.property( 'paused' ).linkAttribute( stepButton, 'enabled' );

    // Add the buttons directly to the view for easier positioning
    View.addChild( playPauseButton.mutate( {centerX: View.layoutBounds.centerX, top: View.interfaceHeight + 15} ) );
    View.addChild( stepButton.mutate( {left: playPauseButton.right + 15, centerY: playPauseButton.centerY} ) );
    View.addChild( restartSkaterButton.mutate( {left: stepButton.right + 10, centerY: playPauseButton.centerY} )  );
    View.addChild( disconnectTracksButton.mutate( {left: View.layoutBounds.left + 10, top: View.interfaceHeight + 15} )  );
    View.addChild( playbackSpeedControl.mutate( {right: playPauseButton.left - 25, centerY: playPauseButton.centerY} )  );

   model.simStateProperty.link( function(state) {
   	if(state=='simulation') { 
   		model.pausedProperty.set(true); 
   		model.returnSkaterStart(); 
   	}
	playPauseButton.visible = (state==='simulation') ? true:false;
	stepButton.visible = (state==='simulation') ? true:false;
	restartSkaterButton.visible = (state==='simulation') ? true:false;
	disconnectTracksButton.visible = (state==='simulation') ? true:false;
	playbackSpeedControl.visible = (state==='simulation') ? true:false;
   } );

  } 
  return inherit( Node, TrackDesignButtons );
} );

