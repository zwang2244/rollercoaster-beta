// Copyright 2002-2013, University of Colorado Boulder

/**
 * Scenery node for the skater, which is draggable.
 *
 * Converted to composition instead of inheritance for SkaterNode to work around updateSVGFragment problem, see #123
 *
 * @author Sam Reid
 * @ Modified by Dinesh for Roller Coaster */
 
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Constants = require( 'ROLLERCOASTER/Constants' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Range = require( 'DOT/Range' );

  // images
  var skaterLeftImage = require( 'image!ROLLERCOASTER/cart3_small.png' );
  var skaterRightImage = require( 'image!ROLLERCOASTER/cart3_small.png' );

  // Map from mass(kg) to the amount to scale the image
  var centerMassValue = (Constants.MIN_MASS + Constants.MAX_MASS) / 2;
  var width = skaterLeftImage.width;
  var imgPxRange = new Range(55,70); //75,100 originally
  var massToScale = new LinearFunction( centerMassValue, Constants.MAX_MASS, imgPxRange.min/width, imgPxRange.max/width );

//  var massToScale = new LinearFunction( centerMassValue, Constants.MAX_MASS, 0.34, 0.43 );

  /**
   * SkaterNode constructor
   *
   * @param {Skater} skater
   * @param {EnergySkateParkBasicsScreenView} view
   * @param {ModelViewTransform} modelViewTransform
   * @param {function} getClosestTrackAndPositionAndParameter function that gets the closest track properties, used when
   * the skater is being dragged close to the track
   * @param {function} getPhysicalTracks function that returns the physical tracks in the model, so the skater can try
   * to attach to them while dragging
   * @constructor
   */
  function SkaterNode( skater, view, modelViewTransform, getClosestTrackAndPositionAndParameter, getPhysicalTracks, renderer ) {
    this.skater = skater;
    var skaterNode = this;

    // Use a separate texture for left/right skaters to avoid WebGL performance issues when switching textures
    var leftSkaterImageNode = new Image( skaterLeftImage, { cursor: 'pointer' } );
    var rightSkaterImageNode = new Image( skaterRightImage, { cursor: 'pointer' } );

    Node.call( this, {children: [leftSkaterImageNode, rightSkaterImageNode], renderer: renderer} );

    skater.directionProperty.link( function( direction ) {
      leftSkaterImageNode.visible = direction === 'left';
      rightSkaterImageNode.visible = direction === 'right';
    } );

    var imageWidth = this.width;
    var imageHeight = this.height;

    // Update the position and angle.  Normally the angle would only change if the position has also changed, so no need
    // for a duplicate callback there.  Uses pooling to avoid allocations, see #50
    this.skater.on( 'updated', function() {
      var mass = skater.mass;
      var position = skater.position;
      var angle = skater.angle;

      var view = modelViewTransform.modelToViewPosition( position );

      // Translate to the desired location
      var matrix = Matrix3.translation( view.x, view.y );

      // Rotate about the pivot (bottom center of the skater)
      var rotationMatrix = Matrix3.rotation2( angle );
      matrix.multiplyMatrix( rotationMatrix );
      rotationMatrix.freeToPool();

      var scale = massToScale( mass );
      var scalingMatrix = Matrix3.scaling( scale );
      matrix.multiplyMatrix( scalingMatrix );
      scalingMatrix.freeToPool();

      // Think of it as a multiplying the Vector2 to the right, so this step happens first actually.  Use it to center
      // the registration point
      var translation = Matrix3.translation( -imageWidth / 2, -imageHeight );
      matrix.multiplyMatrix( translation );
      translation.freeToPool();

      skaterNode.setMatrix( matrix );
    } );

    // Show a red dot in the bottom center as the important particle model coordinate
    var circle = new Circle( 8, {fill: 'red', x: imageWidth / 2, y: imageHeight } );
    if ( renderer === 'webgl' ) {
      circle = circle.toCanvasNodeSynchronous();
    }
    this.addChild( circle );

    var targetTrack = null;

    var targetU = null;
	
    this.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          skater.dragging = true;

          // Clear thermal energy whenever skater is grabbed, see #32
          skater.thermalEnergy = 0;

          // Jump to the input location when dragged
          this.drag( event );
        },

        drag: function( event ) {

          var globalPoint = skaterNode.globalToParentPoint( event.pointer.point );
          var position = modelViewTransform.viewToModelPosition( globalPoint );

          // make sure it is within the visible bounds
          position = view.availableModelBounds.getClosestPoint( position.x, position.y, position ); //works if layout function exists in View

          // PERFORMANCE/ALLOCATION: lots of unnecessary allocations and computation here, biggest improvement could be
          // to use binary search for position on the track
          var closestTrackAndPositionAndParameter = getClosestTrackAndPositionAndParameter( position, getPhysicalTracks() );
          var closeEnough = false;
          if ( closestTrackAndPositionAndParameter && closestTrackAndPositionAndParameter.track && closestTrackAndPositionAndParameter.track.isParameterInBounds( closestTrackAndPositionAndParameter.u ) ) {
            var closestPoint = closestTrackAndPositionAndParameter.point;
            var distance = closestPoint.distance( position );
            if ( distance < 0.5 ) {
              position = closestPoint;
              targetTrack = closestTrackAndPositionAndParameter.track;
              targetU = closestTrackAndPositionAndParameter.u;

              // Choose the right side of the track, i.e. the side of the track that would have the skater upside up
              var normal = targetTrack.getUnitNormalVector( targetU );
              skater.up = normal.y > 0;

              skater.angle = targetTrack.getViewAngleAt( targetU ) + (skater.up ? 0 : Math.PI);

              closeEnough = true;
            }
          }
          if ( !closeEnough ) {
            targetTrack = null;
            targetU = null;

            // make skater upright if not near the track
            skater.angle = 0;
            skater.up = true;

            skater.position = position;
          }

          else {
            skater.position = targetTrack.getPoint( targetU );
          }

          skater.updateEnergy();
          skater.trigger( 'updated' );
        },

        end: function() {

          // Record the state of the skater for "return skater"
          skater.released( targetTrack, targetU );
        }
      } ) );
      
  }

  return inherit( Node, SkaterNode );
} );
