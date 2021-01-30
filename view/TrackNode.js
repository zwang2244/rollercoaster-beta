// Copyright 2002-2013, University of Colorado Boulder

/**
 * Scenery node for the track, which can be translated by dragging the track, or manipulated by dragging its control points.
 * If the track's length is changed (by deleting a control point or linking two tracks together) a new TrackNode is created.
 * Keep track of whether the track is dragging, so performance can be optimized while dragging
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var SplineEvaluation = require( 'ROLLERCOASTER/model/SplineEvaluation' );
  var ControlPointNode = require( 'ROLLERCOASTER/view/ControlPointNode' );
  var TrackDragHandler = require( 'ROLLERCOASTER/view/TrackDragHandler' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var dot = require( 'DOT/dot' );

  // constants
  var FastArray = dot.FastArray;

  /*
   * Constructor for TrackNode
   * @param {EnergySkateParkBasicsModel} model the entire model.  Not absolutely necessary, but so many methods are called on it for joining and
   * splitting tracks that we pass the entire model anyways.
   * @param {Track} track the track for this track node
   * @param {ModelViewTransform} modelViewTransform the model view transform for the view
   * @constructor
   */
  function TrackNode( model, track, modelViewTransform, availableBoundsProperty ) {

    var trackNode = this;
    this.track = track;
    this.model = model;
    this.modelViewTransform = modelViewTransform;
    this.availableBoundsProperty = availableBoundsProperty;

    this.road = new Path( null, {fill: 'gray', cursor: track.interactive ? 'pointer' : 'default'} );
    this.centerLine = new Path( null, {stroke: 'black', lineWidth: '1.2', lineDash: [11, 8]} );

    model.property( 'detachable' ).link( function( detachable ) {
      trackNode.centerLine.lineDash = detachable ? null : [11, 8];
    } );

    Node.call( this, {children: [this.road, this.centerLine]} );

    // Reuse arrays to save allocations and prevent garbage collections, see #38
    this.xArray = new FastArray( track.controlPoints.length );
    this.yArray = new FastArray( track.controlPoints.length );

    // Store for performance
    this.lastPoint = (track.controlPoints.length - 1) / track.controlPoints.length;

    // Sample space, which is recomputed if the track gets longer, to keep it looking smooth no matter how many control points
    this.linSpace = numeric.linspace( 0, this.lastPoint, 20 * (track.controlPoints.length - 1) );
    this.lengthForLinSpace = track.controlPoints.length;

    //If the track is interactive, make it draggable and make the control points visible and draggable
    if ( track.interactive ) {

      var trackDragHandler = new TrackDragHandler( this );
      this.road.addInputListener( trackDragHandler );

      for ( var i = 0; i < track.controlPoints.length; i++ ) {
        var isEndPoint = i === 0 || i === track.controlPoints.length - 1;
        trackNode.addChild( new ControlPointNode( trackNode, trackDragHandler, i, isEndPoint ) );
      }
     
    }
/*
    //Add DownUpListener
    var downUpListener =  new DownUpListener ( {
    	mouseButton: 0,
    	down : function(event,trail) {
    	},
    	up : function(event,trail) {
    	},
    } );
    this.addInputListener(downUpListener); 
*/    
    // Init the track shape
    this.updateTrackShape();

    // Update the track shape when the whole track is translated
    // Just observing the control points individually would lead to N expensive callbacks (instead of 1) for each of the N points
    // So we use this broadcast mechanism instead

    track.on( 'translated', this.updateTrackShape.bind( this ) );

    track.draggingProperty.link( function( dragging ) {
      if ( !dragging ) {
        trackNode.updateTrackShape();
      }
    } );

    track.on( 'reset', this.updateTrackShape.bind( this ) );
    track.on( 'scaled', this.updateTrackShape.bind( this ) );
    track.on( 'smoothed', this.updateTrackShape.bind( this ) );
    track.on( 'reset', this.updateTrackShape.bind( this ) );
   
  }

  return inherit( Node, TrackNode, {

    // When a control point has moved, or the track has moved, or the track has been reset, or on initialization
    // update the shape of the track.
    updateTrackShape: function() {

      var track = this.track;
      var model = this.model;

      var i;
      // Update the sample range when the number of control points has changed
      if ( this.lengthForLinSpace !== track.controlPoints.length ) {
        this.lastPoint = (track.controlPoints.length - 1) / track.controlPoints.length;
        this.linSpace = numeric.linspace( 0, this.lastPoint, 20 * (track.controlPoints.length - 1) );
        this.lengthForLinSpace = track.controlPoints.length;
      }

      // Arrays are fixed length, so just overwrite values
      for ( i = 0; i < track.controlPoints.length; i++ ) {
        this.xArray[i] = track.controlPoints[i].position.x;
        this.yArray[i] = track.controlPoints[i].position.y;
      }

      // Compute points for lineTo
      var xPoints = SplineEvaluation.atArray( track.xSpline, this.linSpace );
      var yPoints = SplineEvaluation.atArray( track.ySpline, this.linSpace );

      var tx = this.getTranslation();
      var shape = new Shape().moveTo(
          this.modelViewTransform.modelToViewX( xPoints[0] ) - tx.x,
          this.modelViewTransform.modelToViewY( yPoints[0] ) - tx.y
      );

      // Show the track at reduced resolution while dragging so it will be smooth and responsive while dragging
      // (whether updating the entire track, some of the control points or both)

      var delta = track.dragging ? 3 : 1;
      for ( i = 1; i < xPoints.length; i = i + delta ) {
        shape.lineTo( this.modelViewTransform.modelToViewX( xPoints[i] ) - tx.x, this.modelViewTransform.modelToViewY( yPoints[i] ) - tx.y );
      }

      // If at reduced resolution, still make sure we draw to the end point
      if ( i !== xPoints.length - 1 ) {
        i = xPoints.length - 1;
        shape.lineTo( this.modelViewTransform.modelToViewX( xPoints[i] ) - tx.x, this.modelViewTransform.modelToViewY( yPoints[i] ) - tx.y );
      }

      var strokeStyles = new LineStyles( {
        lineWidth: 10,
        lineCap: 'butt',
        lineJoin: 'miter',
        miterLimit: 10
      } );
      this.road.shape = shape.getStrokedShape( strokeStyles );
      this.centerLine.shape = shape;

/*Comm.Dins.
      // Update the skater if the track is moved while the sim is paused, see #84
      if ( model.skater.track === track && model.paused ) {
        model.skater.position = track.getPoint( model.skater.u );
        model.skater.angle = model.skater.track.getViewAngleAt( model.skater.u ) + (model.skater.up ? 0 : Math.PI);
        model.skater.trigger( 'updated' );
      }
*/
      
    }
  } );
} );
