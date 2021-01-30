/************************************************
*		Model for Simulation		*
*************************************************
*
* Defines simulation state variables
* Instantiates objects: Shaker, 
* Defines some functions 
* Defines the animation loop
*
* author: Dinesh
*/

define( function( require ) {
  'use strict';

  // general modules
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Range = require( 'DOT/Range' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Color = require( 'SCENERY/util/Color' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Util = require( 'DOT/Util' );

  //specific modules
  var Track = require( 'ROLLERCOASTER/model/Track' );
  var ControlPoint = require( 'ROLLERCOASTER/model/ControlPoint' );
  var Skater = require( 'ROLLERCOASTER/model/Skater' );
  var SkaterState = require( 'ROLLERCOASTER/model/SkaterState' );

  var MAX_NUMBER_CONTROL_POINTS = 12;
  var MIN_DIST = 0.25;

  // Reuse empty object for creating SkaterStates to avoid allocations
  var EMPTY_OBJECT = {};

  function isApproxEqual( a, b, tolerance ) { return Math.abs( a - b ) <= tolerance; }
  // Flag to enable debugging for physics issues
  var debug = window.phetcommon.getQueryParameter( 'debugLog' ) ? function() {
    console.log.apply( console, arguments );
  } : null;
  var debugAttachDetach = window.phetcommon.getQueryParameter( 'debugAttachDetach' ) ? function() {
    console.log.apply( console, arguments );
  } : null;

  var modelIterations = 0;

// Thrust is not currently implemented, but variable defintion is necessary as in EnergySkatePark_Phet
  var thrust = new Vector2();

  
  function SimulationModel() {

     var model=this;
     var frictionAllowed=false;
  
   //property set : model property parameters
    PropertySet.call( this, {

      // Model for visibility of various view parameters
      speedFlagVisible: false,
      accFlagVisible: false,
      barGraphVisible: false,
      gridVisible: false,
      speedometerVisible: false,
      vectorsVisible: false,

      // Enabled/disabled for the track editing buttons
      editButtonEnabled: false,
      clearButtonEnabled: false,

      // Simulation state, {'design', 'simulation'}
      simState: 'design',

      // Whether the sim is paused or running
      paused: true,

      // speed of the model, either 'normal' or 'slow'
      speed: 'normal',

      // Coefficient of friction (unitless) between skater and track
      friction: 0,

      // Whether the skater should stick to the track like a roller coaster, or be able to fly off like a street
      detachable: false,

      // Will be filled in by the view, used to prevent control points from moving outside the visible model bounds when
      // adjusted, see #195
      availableModelBounds: null,

      //scale factor for track
      trackScale:1,

      // to determine the state of the track design panel (height, friction, deleteTrack, addTrack)
      trackDesignState: 'addTrack',
      
      //rollerState: 'start', 'end'
      rollerState: 'start',
      
    } ); 

    this.allTracks = new ObservableArray();
    this.tracks = new ObservableArray();
//    this.previousTracks = null; //stored value of previously used tracks
    this.previousTracks = new ObservableArray(); //stored value of previously used tracks
    var mergedTrackCount = 0;
    this.mergedTrackCount = mergedTrackCount;
      // Shape types
      // For the double well, move the left well up a bit since the interpolation moves it down by that much, and we
      // don't want the skater to go to y<0 while on the track.  Numbers determined by trial and error.
      var drop, bank, hill, loop, flat;

	      drop = [
		new ControlPoint( -6, 5 ),
		new ControlPoint( -5, 4.90 ),
		new ControlPoint( -3.9, 4.25 ),
		new ControlPoint( -3, 2.5 ),
		new ControlPoint( -2.1, 0.75 ),
		new ControlPoint( -1, 0.10 ),
		new ControlPoint( 0, 0 ),
	      ];

	      bank = [
		new ControlPoint( 6, 5 ),
		new ControlPoint( 5, 4.90 ),
		new ControlPoint( 3.9, 4.25 ),
		new ControlPoint( 3, 2.5 ),
		new ControlPoint( 2.1, 0.75 ),
		new ControlPoint( 1, 0.10 ),
		new ControlPoint( 0, 0 ),
	      ];

	      hill = [
		new ControlPoint( -4.25, 0 ),
		new ControlPoint( -2.5, 0.60 ),
		new ControlPoint( -1.5, 3 ),
		new ControlPoint( 0, 5),
		new ControlPoint( 1.5, 3 ),
		new ControlPoint( 2.5, 0.60 ),
		new ControlPoint( 4.25, 0 ),
	      ];

	      loop = [
		new ControlPoint( -3, 0 ),
		new ControlPoint( -0.75, 0.5 ),
		new ControlPoint( 1.5, 3 ),
		new ControlPoint( 0, 5),
		new ControlPoint( -1.5, 3 ),
		new ControlPoint( 0.75, 0.5 ),
		new ControlPoint( 3, 0 ),
	      ];

	      flat = [
		new ControlPoint( 0, 0 ),
		new ControlPoint( 1, 0 ),
		new ControlPoint( 2, 0 ),
	      ];

//default scales: 0.55H,0.6V
//changed to 0.5,0.5
     var vSc1 = 0.5;
     var hSc1 = 0.5;
      var dropTrack = new Track( this, this.tracks, drop, true, null, this.availableModelBoundsProperty,{trackName:'Drop', hScale: vSc1, vScale: hSc1} );
      var bankTrack = new Track( this, this.tracks, bank, true, null, this.availableModelBoundsProperty,
      	{trackName:'Bank', hScale: vSc1, vScale: hSc1, vRange: new Range(0,1)} );
      var hillTrack = new Track( this, this.tracks, hill, true, null, this.availableModelBoundsProperty, {trackName:'Hill', hScale: vSc1, vScale: hSc1} );
      var loopTrack = new Track( this, this.tracks, loop, true, null, this.availableModelBoundsProperty, {trackName:'Loop', hScale: vSc1, vScale: hSc1} );
      var flatTrack = new Track( this, this.tracks, flat, true, null, this.availableModelBoundsProperty, {trackName:'Flat', hScale: vSc1, vScale: hSc1} );

      model.flatTrack = flatTrack;
/*      bankTrack.physical = true;
      dropTrack.physical = true;
      flatTrack.physical = true;
      loopTrack.physical = true;
      hillTrack.physical = true;*/

      // Flag to indicate whether the skater transitions from the right edge of this track directly to the ground
      // see #164
//      slopeTrack.slopeToGround = true;

	this.allTracks.addAll([dropTrack, bankTrack, hillTrack, loopTrack]);

      this.trackScaleProperty.link( function (scale )
      {
	var point, scaledPoint, xHScale, xVScale;
     	model.tracks.forEach( function(track) {
     		for(var i=0;i<track.controlPoints.length;i++)
     		{
			point = track.controlPoints[i].sourcePosition;
			xVScale = track.controlPoints[i].vScale;
			xHScale = track.controlPoints[i].hScale;
			scaledPoint = new Vector2(point.x*scale/xHScale, point.y*scale/xVScale);
			track.controlPoints[i].vScale = scale;
			track.controlPoints[i].hScale = scale;
			track.controlPoints[i].sourcePosition = scaledPoint;
		}
	      track.updateLinSpace();
	      track.updateSplines();
	      track.trigger('scaled');
     	} );
      } );

    // the skater model instance
    this.skater = new Skater();

    // If the mass changes while the sim is paused, trigger an update so the skater image size will update, see #115
    this.skater.property( 'mass' ).link( function() { if ( model.paused ) { model.skater.trigger( 'updated' ); } } );
    this.frictionProperty.link( function (c) { model.skater.friction = c; } );

   } //end of constructor

  return inherit( PropertySet, SimulationModel , {
    reset: function()
    {
	PropertySet.prototype.reset.call( this );
	this.mergedTrackCount = 0;
//	this.skater.reset();
	this.allTracks.forEach( function(track) {
		track.reset();
	} );
	this.previousTracks.clear();
	this.clearTracks();
    },

    // step one frame, assuming 60fps
    manualStep: function() {
      var skaterState = new SkaterState( this.skater, EMPTY_OBJECT );
      var dt = 1.0 / 60;
      var result = this.stepModel( dt, skaterState );
      result.setToSkater( this.skater );
      this.skater.trigger( 'updated' );
    },
    // Step the model, automatically called from Joist
    step: function( dt ) {

      // This simulation uses a fixed time step to make the skater's motion reproducible.  Making the time step fixed
      // did not significantly reduce performance/speed on iPad3.
      dt = 1.0 / 60.0;

      var initialEnergy = null;

      // If the delay makes dt too high, then truncate it.  This helps e.g. when clicking in the address bar on ipad,
      // which gives a huge dt and problems for integration
      if ( !this.paused && !this.skater.dragging ) {

        var initialThermalEnergy = this.skater.thermalEnergy;

        // If they switched windows or tabs, just bail on that delta
        if ( dt > 1 || dt <= 0 ) {
          dt = 1.0 / 60.0;
        }

        var skaterState = new SkaterState( this.skater, EMPTY_OBJECT );
        if ( debug ) {
          initialEnergy = skaterState.getTotalEnergy();
        }

/*
        var updatedState = null;
//       updatedState = this.stepFreeFall(dt,skaterState,false);
         updatedState = (skaterState.track) ? this.stepTrack( dt, skaterState ) : skaterState;
         updatedState.setToSkater( this.skater );
         this.skater.trigger( 'updated' ); */

        // Update the skater state by running the dynamics engine
        // There are issues in running multiple iterations here (the skater won't attach to the track).  I presume some
        // of that work is being done in setToSkater() below or skater.trigger('updated')
        // In either case, 10 subdivisions on iPad3 makes the sim run too slowly, so we may just want to leave it as is
        var updatedState = null;
        modelIterations++;
        if ( this.speed === 'normal' || modelIterations % 3 === 0 ) {
          updatedState = this.stepModel( dt, skaterState );
        }
        
        if ( debug && Math.abs( updatedState.getTotalEnergy() - initialEnergy ) > 1E-6 ) {
          var initialStateCopy = new SkaterState( this.skater, EMPTY_OBJECT );
          var redo = this.stepModel( this.speed === 'normal' ? dt : dt * 0.25, initialStateCopy );
          debug && debug( redo );
        }
        if ( updatedState ) {
          updatedState.setToSkater( this.skater );
          this.skater.trigger( 'updated' );

          // Make sure the thermal energy doesn't go negative
          var finalThermalEnergy = this.skater.thermalEnergy;
          var deltaThermalEnergy = finalThermalEnergy - initialThermalEnergy;
          if ( deltaThermalEnergy < 0 ) {
            debug && debug( 'thermal energy wanted to decrease' );
          }
        }
      }

      // Clear the track change pending flag for the next step
      this.trackChangePending = false;

      // If traveling on the ground, face in the direction of motion, see #181
      if ( this.skater.track === null && this.skater.position.y === 0 ) {
        if ( this.skater.velocity.x > 0 ) {
          this.skater.direction = 'right';
        }
        if ( this.skater.velocity.x < 0 ) {
          this.skater.direction = 'left';
        }
        else {
          // skater wasn't moving, so don't change directions
        } 
      }
    },

    // The skater moves along the ground with the same coefficient of friction as the tracks, see #11
    stepGround: function( dt, skaterState ) {
      var x0 = skaterState.positionX;
      var frictionMagnitude = (this.friction === 0 || skaterState.getSpeed() < 1E-2) ? 0 :
                              this.friction * skaterState.mass * skaterState.gravity;
      var acceleration = Math.abs( frictionMagnitude ) * (skaterState.velocityX > 0 ? -1 : 1) / skaterState.mass;
      var v1 = skaterState.velocityX + acceleration * dt;
      this.skater.normalForce = new Vector2(0,-1*skaterState.mass * skaterState.gravity); //normal force = weight
      this.skater.acceleration = new Vector2(acceleration,0);

      // Exponentially decay the velocity if already nearly zero, see #138
      if ( this.friction !== 0 && skaterState.getSpeed() < 1E-2 ) {
        v1 = v1 / 2;
      }
      var x1 = x0 + v1 * dt;
      var newPosition = new Vector2( x1, 0 );
      var originalEnergy = skaterState.getTotalEnergy();

      var updated = skaterState.updatePositionAngleUpVelocity( newPosition.x, newPosition.y, 0, true, v1, 0 );

      var newEnergy = updated.getTotalEnergy();
      return updated.updateThermalEnergy( updated.thermalEnergy + (originalEnergy - newEnergy) );
    },

    // No bouncing on the ground, but the code is very similar to attachment part of interactWithTracksWhileFalling
    switchToGround: function( skaterState, initialEnergy, proposedPosition, proposedVelocity, dt ) {
      var segment = new Vector2( 1, 0 );

      var newSpeed = segment.dot( proposedVelocity );

      // Make sure energy perfectly conserved when falling to the ground.
      var newKineticEnergy = 0.5 * newSpeed * newSpeed * skaterState.mass;
      var newPotentialEnergy = 0;
      var newThermalEnergy = initialEnergy - newKineticEnergy - newPotentialEnergy;

      if ( !isFinite( newThermalEnergy ) ) { throw new Error( "not finite" ); }
      return skaterState.switchToGround( newThermalEnergy, newSpeed, 0, proposedPosition.x, proposedPosition.y );
    },

    /**
     * Update the skater in free fall
     * @param {Number} dt the time that passed, in seconds
     * @param {SkaterState} skaterState the original state of the skater
     * @param {Boolean} justLeft true if the skater just fell off or launched off the track: in this case it should not
     * interact with the track.
     * @return {SkaterState} the new state
     */

    stepFreeFall: function( dt, skaterState, justLeft ) {
      var initialEnergy = skaterState.getTotalEnergy();

      var acceleration = new Vector2( 0, skaterState.gravity );
      this.skater.acceleration = acceleration;

      this.skater.normalForce = new Vector2(0,0); //normal force = 0 free fall

      var proposedVelocity = skaterState.getVelocity().plus( acceleration.times( dt ) );
      var position = skaterState.getPosition();
      var proposedPosition = position.plus( proposedVelocity.times( dt ) );

      if ( proposedPosition.y < 0 ) {
        proposedPosition.y = 0;

        return this.switchToGround( skaterState, initialEnergy, proposedPosition, proposedVelocity, dt );
      }
      else if ( position.x !== proposedPosition.x || position.y !== proposedPosition.y ) {

        // see if it crossed the track
        var physicalTracks = this.getPhysicalTracks();

        // Don't interact with the track if the skater just left the track in this same frame, see #142
        if ( physicalTracks.length && !justLeft ) {
          return this.interactWithTracksWhileFalling( physicalTracks, skaterState, proposedPosition, initialEnergy, dt, proposedVelocity );
        }
        else {
          return this.continueFreeFall( skaterState, initialEnergy, proposedPosition, proposedVelocity, dt );
        }
      }
      else {
        return skaterState;
      }
      
    },

    // Add the tracks that will be in the track toolbox for the "Playground" screen
    addDraggableTracks: function() {
      for ( var i = 0; i < 4; i++ ) {
        this.addDraggableTrack();
      }
    },

    // Add a single track to the track control panel.
    addDraggableTrack: function() {

      // Move the tracks over so they will be in the right position in the view coordinates, under the grass to the left
      // of the clock controls.  Could use view transform for this, but it would require creating the view first, so just
      // eyeballing it for now.
      var offset = new Vector2( -5.1, -0.85 );
      var controlPoints = [
        new ControlPoint( offset.x - 1, offset.y ),
        new ControlPoint( offset.x, offset.y ),
        new ControlPoint( offset.x + 1, offset.y )
      ];
      this.tracks.add( new Track( this, this.tracks, controlPoints, true, null, this.availableModelBoundsProperty ) );
    },

    clearTracks: function() {
	
	this.tracks.clear();
//        this.addDraggableTracks();
      // For the first two screens, make the default track physical
      if ( this.draggableTracks ) {
        this.tracks.clear();
        this.addDraggableTracks();

        // If the skater was on a track, then he should fall off, see #97
/*        if ( this.skater.track ) {
          this.skater.track = null;
        }*/
      }
    },

    // Find the closest track to the skater, to see what he can bounce off of or attach to, and return the closest point
    // on that track took
    getClosestTrackAndPositionAndParameter: function( position, physicalTracks ) {
      var closestTrack = null;
      var closestMatch = null;
      var closestDistance = Number.POSITIVE_INFINITY;
      for ( var i = 0; i < physicalTracks.length; i++ ) {
        var track = physicalTracks[i];

        // PERFORMANCE/ALLOCATION maybe get closest point shouldn't return a new object allocation each time, or use
        // pooling for it, or pass in reference as an arg?
        var bestMatch = track.getClosestPositionAndParameter( position );
        if ( bestMatch.distance < closestDistance ) {
          closestDistance = bestMatch.distance;
          closestTrack = track;
          closestMatch = bestMatch;
        }
      }
      if ( closestTrack ) {
        return {track: closestTrack, u: closestMatch.u, point: closestMatch.point};
      }
      else {
        return null;
      }
    },

    // Check to see if the points crossed the track
    crossedTrack: function( closestTrackAndPositionAndParameter, physicalTracks, beforeX, beforeY, afterX, afterY ) {
      var track = closestTrackAndPositionAndParameter.track;
      var u = closestTrackAndPositionAndParameter.u;
      var trackPoint = closestTrackAndPositionAndParameter.point;

      if ( !track.isParameterInBounds( u ) ) {
        return false;
      }
      else {

        // Linearize the spline, and check to see if the skater crossed by performing a line segment intersection between
        // the skater's trajectory segment and the linearized track segment.
        // Note, this has an error for cusps, see #212
        var unitParallelVector = track.getUnitParallelVector( u );
        var a = trackPoint.plus( unitParallelVector.times( 100 ) );
        var b = trackPoint.plus( unitParallelVector.times( -100 ) );
        var intersection = Util.lineSegmentIntersection( a.x, a.y, b.x, b.y, beforeX, beforeY, afterX, afterY );
        return intersection !== null;
      }
    },
    // Check to see if it should hit or attach to track during free fall
    interactWithTracksWhileFalling: function( physicalTracks, skaterState, proposedPosition, initialEnergy, dt, proposedVelocity ) {

      // Find the closest track, and see if the skater would cross it in this time step.
      // Assuming the skater's initial + final locations determine a line segment, we search for the best point for the
      // skater's start point, midpoint and end point and choose whichever is closest.  This helps avoid "high curvature"
      // problems like the one identified in #212
      var a = this.getClosestTrackAndPositionAndParameter( skaterState.getPosition(), physicalTracks );
      var averagePosition = new Vector2( (skaterState.positionX + proposedPosition.x) / 2, (skaterState.positionY + proposedPosition.y) / 2 );
      var b = this.getClosestTrackAndPositionAndParameter( averagePosition, physicalTracks );
      var c = this.getClosestTrackAndPositionAndParameter( new Vector2( proposedPosition.x, proposedPosition.y ), physicalTracks );

      var initialPosition = skaterState.getPosition();
      var distanceA = Util.distToSegment( a.point, initialPosition, proposedPosition );
      var distanceB = Util.distToSegment( b.point, initialPosition, proposedPosition );
      var distanceC = Util.distToSegment( c.point, initialPosition, proposedPosition );

      var distances = [distanceA, distanceB, distanceC];
      var minDistance = _.min( distances );

      var closestTrackAndPositionAndParameter = minDistance === distanceA ? a : minDistance === distanceC ? c : b;

      debugAttachDetach && debugAttachDetach( 'minDistance', distances.indexOf( minDistance ) );

      var crossed = this.crossedTrack( closestTrackAndPositionAndParameter, physicalTracks,
        skaterState.positionX, skaterState.positionY, proposedPosition.x, proposedPosition.y );

      var track = closestTrackAndPositionAndParameter.track;
      var u = closestTrackAndPositionAndParameter.u;
      var trackPoint = closestTrackAndPositionAndParameter.point;

      if ( crossed ) {
        debugAttachDetach && debugAttachDetach( 'attaching' );
        var normal = track.getUnitNormalVector( u );
        var segment = normal.perpendicular();

        var beforeVector = skaterState.getPosition().minus( trackPoint );

        // If crossed the track, attach to it.
        var newVelocity = segment.times( segment.dot( proposedVelocity ) );
        var newSpeed = newVelocity.magnitude();
        var newKineticEnergy = 0.5 * skaterState.mass * newVelocity.magnitudeSquared();
        var newPosition = track.getPoint( u );
        var newPotentialEnergy = -skaterState.mass * skaterState.gravity * newPosition.y;
        var newThermalEnergy = initialEnergy - newKineticEnergy - newPotentialEnergy;
	var position = track.getTrackStartingPoint();
        // Sometimes (depending on dt) the thermal energy can go negative by the above calculation, see #141
        // In that case, set the thermal energy to zero and reduce the speed to compensate.
        if ( newThermalEnergy < skaterState.thermalEnergy ) {
          newThermalEnergy = skaterState.thermalEnergy;
          newKineticEnergy = initialEnergy - newPotentialEnergy - newThermalEnergy;

          assert && assert( newKineticEnergy >= 0 );
          if ( newKineticEnergy < 0 ) {
            newKineticEnergy = 0;
          }

          // ke = 1/2 m v v
          newSpeed = Math.sqrt( 2 * newKineticEnergy / skaterState.mass );
          newVelocity = segment.times( newSpeed );
        }

        var dot = proposedVelocity.normalized().dot( segment );

        // Sanity test
        assert && assert( isFinite( dot ) );
        assert && assert( isFinite( newVelocity.x ) );
        assert && assert( isFinite( newVelocity.y ) );
        assert && assert( isFinite( newThermalEnergy ) );
        assert && assert( newThermalEnergy >= 0 );

        var uD = (dot > 0 ? +1 : -1) * newSpeed;
        var up = beforeVector.dot( normal ) > 0;

        debug && debug( 'attach to track, ' + ', ' + u + ', ' + track.maxPoint );

        // Double check the velocities and invert uD if incorrect, see #172
        // Compute the new velocities same as in stepTrack
        var unitParallelVector = track.getUnitParallelVector( u );
        var newVelocityX = unitParallelVector.x * uD;
        var newVelocityY = unitParallelVector.y * uD;

        var velocityDotted = skaterState.velocityX * newVelocityX + skaterState.velocityY * newVelocityY;

        // See if the track attachment will cause velocity to flip, and inverse it if so, see #172
        if ( velocityDotted < -1E-6 ) {
          uD = uD * -1;
        }

        return skaterState.attachToTrack( newThermalEnergy, track, up, u, uD, newVelocity.x, newVelocity.y, newPosition.x, newPosition.y );
      }

      // It just continued in free fall
      else {
        return this.continueFreeFall( skaterState, initialEnergy, proposedPosition, proposedVelocity, dt );
      }
    },

    // Started in free fall and did not interact with a track
    continueFreeFall: function( skaterState, initialEnergy, proposedPosition, proposedVelocity, dt ) {
      // make up for the difference by changing the y value
      var y = (initialEnergy - 0.5 * skaterState.mass * proposedVelocity.magnitudeSquared() - skaterState.thermalEnergy) / (-1 * skaterState.mass * skaterState.gravity);
      if ( y <= 0 ) {
        // When falling straight down, stop completely and convert all energy to thermal
        return skaterState.strikeGround( initialEnergy, proposedPosition.x );
      }
      else {
        return skaterState.continueFreeFall( proposedVelocity.x, proposedVelocity.y, proposedPosition.x, y );
      }
    },

    /**
     * Gets the net force discluding normal force.
     *
     * Split into component-wise to prevent allocations, see #50
     *
     * @param {SkaterState} skaterState the state
     * @return {Number} netForce in the X direction
     */
    getNetForceWithoutNormalX: function( skaterState ) {
      return this.getFrictionForceX( skaterState );
    },

    /**
     * Gets the net force but without the normal force.
     *
     * Split into component-wise to prevent allocations, see #50
     *
     * @param {SkaterState} skaterState the state
     * @return {Number} netForce in the Y direction
     */
    getNetForceWithoutNormalY: function( skaterState ) {
      return skaterState.mass * skaterState.gravity + this.getFrictionForceY( skaterState );
    },

    // The only other force on the object in the direction of motion is the gravity force
    // Component-wise to reduce allocations, see #50
    getFrictionForceX: function( skaterState ) {
      // Friction force should not exceed sum of other forces (in the direction of motion), otherwise the friction could
      // start a stopped object moving. Hence we check to see if the object is already stopped and don't add friction
      // in that case
      if ( this.friction === 0 || skaterState.getSpeed() < 1E-2 ) {
        return 0;
      }
      else {
        var magnitude = this.friction * this.getNormalForce( skaterState ).magnitude();
        var angleComponent = Math.cos( skaterState.getVelocity().angle() + Math.PI );
        return magnitude * angleComponent;
      }
    },

    // The only other force on the object in the direction of motion is the gravity force
    // Component-wise to reduce allocations, see #50
    getFrictionForceY: function( skaterState ) {
      // Friction force should not exceed sum of other forces (in the direction of motion), otherwise the friction could
      // start a stopped object moving.  Hence we check to see if the object is already stopped and don't add friction in
      // that case
      if ( this.friction === 0 || skaterState.getSpeed() < 1E-2 ) {
        return 0;
      }
      else {
        var magnitude = this.friction * this.getNormalForce( skaterState ).magnitude();
        return magnitude * Math.sin( skaterState.getVelocity().angle() + Math.PI );
      }
    },

    // Use a separate pooled curvature variable
    curvatureTemp2: {r: 1, x: 0, y: 0},

    // Get the normal force (Newtons) on the skater
    getNormalForce: function( skaterState ) {
      skaterState.getCurvature( this.curvatureTemp2 );
      var radiusOfCurvature = Math.min( this.curvatureTemp2.r, 100000 );
      var netForceRadial = new Vector2();

      netForceRadial.addXY( 0, skaterState.mass * skaterState.gravity );// gravity
      var curvatureDirection = this.getCurvatureDirection( this.curvatureTemp2, skaterState.positionX, skaterState.positionY );
      var normalForce = skaterState.mass * skaterState.getSpeed() * skaterState.getSpeed() / Math.abs( radiusOfCurvature ) - netForceRadial.dot( curvatureDirection );
      debug && debug( normalForce );

      var n = Vector2.createPolar( normalForce, curvatureDirection.angle() );
      return n;
    },

    // Use an Euler integration step to move the skater along the track
    // This code is in an inner loop of the model physics and has been heavily optimized
    stepEuler: function( dt, skaterState ) {

      var track = skaterState.track;
      var origEnergy = skaterState.getTotalEnergy();
      var origLocX = skaterState.positionX;
      var origLocY = skaterState.positionY;
      var thermalEnergy = skaterState.thermalEnergy;
      var uD = skaterState.uD;
      assert && assert( isFinite( uD ) );
      var u = skaterState.u;

      // Component-wise math to prevent allocations, see #50
      var netForceX = this.getNetForceWithoutNormalX( skaterState );
      var netForceY = this.getNetForceWithoutNormalY( skaterState );
      var netForce = new Vector2(netForceX,netForceY);
      var netForceMagnitude = Math.sqrt( netForceX * netForceX + netForceY * netForceY );
      var netForceAngle = Math.atan2( netForceY, netForceX );

      this.skater.normalForce = this.getNormalForce(skaterState);
      this.skater.acceleration = this.skater.normalForce.plus(netForce).times(1/skaterState.mass);
      var acceleration = this.skater.acceleration.magnitude();
      this.skater.maxAPos = (this.skater.maxA < acceleration) ? this.skater.position.copy() : this.skater.maxAPos;
      this.skater.maxA = (this.skater.maxA < acceleration) ? acceleration: this.skater.maxA ;

      var spd = this.skater.speedProperty.get();
      this.skater.maxUPos = (this.skater.maxU < spd) ? this.skater.position.copy() : this.skater.maxUPos;
      this.skater.maxU = Math.max(this.skater.maxU,spd);

      // Get the net force in the direction of the track.  Dot product is a * b * cos(theta)
      var a = netForceMagnitude * Math.cos( skaterState.track.getModelAngleAt( u ) - netForceAngle ) / skaterState.mass;

      uD += a * dt;
      assert && assert( isFinite( uD ) );
      u += track.getParametricDistance( u, uD * dt + 1 / 2 * a * dt * dt );
      var newPointX = skaterState.track.getX( u );
      var newPointY = skaterState.track.getY( u );
      var unitParallelVector = skaterState.track.getUnitParallelVector( u );
      var parallelUnitX = unitParallelVector.x;
      var parallelUnitY = unitParallelVector.y;
      var newVelocityX = parallelUnitX * uD;
      var newVelocityY = parallelUnitY * uD;

      // Exponentially decay the velocity if already nearly zero and on a flat slope, see #129
      if ( parallelUnitX / parallelUnitY > 5 && Math.sqrt( newVelocityX * newVelocityX + newVelocityY * newVelocityY ) < 1E-2 ) {
        newVelocityX /= 2;
        newVelocityY /= 2;
      }

      // choose velocity by using the unit parallel vector to the track
      var newState = skaterState.updateUUDVelocityPosition( u, uD, newVelocityX, newVelocityY, newPointX, newPointY );
      
      if ( this.friction > 0 ) {

        // Compute friction force magnitude component-wise to prevent allocations, see #50
        var frictionForceX = this.getFrictionForceX( skaterState );
        var frictionForceY = this.getFrictionForceY( skaterState );
        var frictionForceMagnitude = Math.sqrt( frictionForceX * frictionForceX + frictionForceY * frictionForceY );

        var newPoint = new Vector2( newPointX, newPointY );

        var therm = frictionForceMagnitude * newPoint.distanceXY( origLocX, origLocY );
        thermalEnergy += therm;

        var newTotalEnergy = newState.getTotalEnergy() + therm;

        // Conserve energy, but only if the user is not adding energy, see #135
        if ( thrust.magnitude() === 0 && !this.trackChangePending ) {
          if ( newTotalEnergy < origEnergy ) {
            thermalEnergy += Math.abs( newTotalEnergy - origEnergy );// add some thermal to exactly match
            if ( Math.abs( newTotalEnergy - origEnergy ) > 1E-6 ) {
              debug && debug( "Added thermal, dE=" + ( newState.getTotalEnergy() - origEnergy ) );
            }
          }
          if ( newTotalEnergy > origEnergy ) {
            if ( Math.abs( newTotalEnergy - origEnergy ) < therm ) {
              debug && debug( "gained energy, removing thermal (Would have to remove more than we gained)" );
            }
            else {
              thermalEnergy -= Math.abs( newTotalEnergy - origEnergy );
              if ( Math.abs( newTotalEnergy - origEnergy ) > 1E-6 ) {
                debug && debug( "Removed thermal, dE=" + ( newTotalEnergy - origEnergy ) );
              }
            }
          }
        }

        // Discrepancy with original version: original version allowed drop of thermal energy here, to be fixed in the
        // heuristic patch. We have clamped it here to make it amenable to a smaller number of euler updates,
        // to improve performance
        return newState.updateThermalEnergy( Math.max( thermalEnergy, skaterState.thermalEnergy ) );
      }
      else {
        return newState;
      }
    },

    curvatureTemp: {r: 1, x: 0, y: 0},

    // Update the skater as it moves along the track, and fly off the track if it goes over a jump or off the track's end
    stepTrack: function( dt, skaterState ) {

      skaterState.getCurvature( this.curvatureTemp );

      var curvatureDirectionX = this.getCurvatureDirectionX( this.curvatureTemp, skaterState.positionX, skaterState.positionY );
      var curvatureDirectionY = this.getCurvatureDirectionY( this.curvatureTemp, skaterState.positionX, skaterState.positionY );

      var track = skaterState.track;
      var sideVectorX = skaterState.up ? track.getUnitNormalVector( skaterState.u ).x :
                        track.getUnitNormalVector( skaterState.u ).x * -1;
      var sideVectorY = skaterState.up ? track.getUnitNormalVector( skaterState.u ).y :
                        track.getUnitNormalVector( skaterState.u ).y * -1;

      // Dot product written out component-wise to avoid allocations, see #50
      var outsideCircle = sideVectorX * curvatureDirectionX + sideVectorY * curvatureDirectionY < 0;

      // compare a to v/r^2 to see if it leaves the track
      var r = Math.abs( this.curvatureTemp.r );
      var centripetalForce = skaterState.mass * skaterState.uD * skaterState.uD / r;

      var netForceWithoutNormalX = this.getNetForceWithoutNormalX( skaterState );
      var netForceWithoutNormalY = this.getNetForceWithoutNormalY( skaterState );

      // Net force in the radial direction is the dot product.  Component-wise to avoid allocations, see #50
      var netForceRadial = netForceWithoutNormalX * curvatureDirectionX + netForceWithoutNormalY * curvatureDirectionY;

      var leaveTrack = (netForceRadial < centripetalForce && outsideCircle) || (netForceRadial > centripetalForce && !outsideCircle);

      if ( leaveTrack && this.detachable ) {

        // Leave the track.  Make sure the velocity is pointing away from the track or keep track of frames away from the
        // track so it doesn't immediately recollide.  Or project a ray and see if a collision is imminent?
        var freeSkater = skaterState.leaveTrack();

        debugAttachDetach && debugAttachDetach( 'left middle track', freeSkater.velocityX, freeSkater.velocityY );

        var nudged = this.nudge( freeSkater, sideVectorX, sideVectorY, +1 );

        // Step after switching to free fall, so it doesn't look like it pauses
        return this.stepFreeFall( dt, nudged, true );
      }
      else {
        var newState = skaterState;

        // Turning this value to 5 or less causes thermal energy to decrease on some time steps
        // Discrepancy with original version: original version had 10 divisions here.  We have reduced it to make it more
        // smooth and less GC
        var numDivisions = 4;
        for ( var i = 0; i < numDivisions; i++ ) {
          newState = this.stepEuler( dt / numDivisions, newState );
        }

        // Correct energy
        var correctedState = this.correctEnergy( skaterState, newState );

        // Check whether the skater has left the track
        if ( skaterState.track.isParameterInBounds( correctedState.u ) ) {
          return correctedState;
        }
        else {

        //roller has come to stop
        this.rollerStateProperty.set('end');
/*
          // Fly off the left or right side of the track
          // Off the edge of the track.  If the skater transitions from the right edge of the 2nd track directly to the
          // ground then do not lose thermal energy during the transition, see #164
          if ( correctedState.u > skaterState.track.maxPoint && skaterState.track.slopeToGround ) {
            var result = correctedState.switchToGround( correctedState.thermalEnergy, correctedState.getSpeed(), 0, correctedState.positionX, 0 );

            // Correct the energy discrepancy when switching to the ground, see #301
            return this.correctEnergy( skaterState, result );
          }
          else {
            debugAttachDetach && debugAttachDetach( 'left edge track: ' + correctedState.u + ', ' + skaterState.track.maxPoint );

            // There is a situation in which the `u` of the skater exceeds the track bounds before the
            // getClosestPositionAndParameter.u does, which can cause the skater to immediately reattach
            // So make sure the skater is far enough from the track so it won't reattach right away, see #167
            var freeSkaterState = skaterState.updateTrackUD( null, 0 );

            var nudgedState = this.nudge( freeSkaterState, sideVectorX, sideVectorY, -1 );

            // Step after switching to free fall, so it doesn't look like it pauses
            return this.stepFreeFall( dt, nudgedState, true );
          } */
        }//
      }
    },

    // When the skater leaves the track, adjust the position and velocity.  This prevents the following problems:
    // 1. When leaving from the sides, adjust the skater under the track so it won't immediately re-collide
    // 2. When leaving from the middle of the track (say going over a jump or falling upside-down from a loop),
    // adjust the skater so it won't fall through or re-collide
    nudge: function( freeSkater, sideVectorX, sideVectorY, sign ) {

      // angle the velocity down a bit and underset from track so that it won't immediately re-collide
      // Nudge the velocity in the 'up' direction so the skater won't pass through the track, see #207
      var velocity = new Vector2( freeSkater.velocityX, freeSkater.velocityY );
      var upVector = new Vector2( sideVectorX, sideVectorY );
      var revisedVelocity = velocity.normalized().blend( upVector, 0.01 * sign ).normalized().times( velocity.magnitude() );
      freeSkater = freeSkater.updateUDVelocity( 0, revisedVelocity.x, revisedVelocity.y );

      // Nudge the position away from the track, slightly since it was perfectly centered on the track, see #212
      // Note this will change the energy of the skater, but only by a tiny amount (that should be undetectable in the
      // bar chart)
      var origPosition = freeSkater.getPosition();
      var newPosition = origPosition.plus( upVector.times( sign * 1E-6 ) );
      freeSkater = freeSkater.updatePosition( newPosition.x, newPosition.y );

      debugAttachDetach && debugAttachDetach( 'newdot', revisedVelocity.dot( upVector ) );
      return freeSkater;
    },

    // Try to match the target energy by reducing the velocity of the skaterState
    correctEnergyReduceVelocity: function( skaterState, targetState ) {

      // Make a clone we can mutate and return, to protect the input argument
      var newSkaterState = targetState.copy();
      var e0 = skaterState.getTotalEnergy();
      var mass = skaterState.mass;

      // Find the direction of velocity.  This is on the track unless the skater just left the "slope" track
      var unit = newSkaterState.track ? newSkaterState.track.getUnitParallelVector( newSkaterState.u ) :
                 newSkaterState.getVelocity().normalized();

      // Binary search, but bail after too many iterations
      for ( var i = 0; i < 100; i++ ) {
        var dv = ( newSkaterState.getTotalEnergy() - e0 ) / ( mass * newSkaterState.uD );

        var newVelocity = newSkaterState.uD - dv;

        // We can just set the state directly instead of calling update since we are keeping a protected clone of the
        // newSkaterState
        newSkaterState.uD = newVelocity;
        var result = unit.times( newVelocity );
        newSkaterState.velocityX = result.x;
        newSkaterState.velocityY = result.y;

        if ( isApproxEqual( e0, newSkaterState.getTotalEnergy(), 1E-8 ) ) {
          break;
        }
      }
      return newSkaterState;
    },

    // Binary search to find the parametric coordinate along the track that matches the e0 energy
    searchSplineForEnergy: function( skaterState, u0, u1, e0, numSteps ) {
      var da = ( u1 - u0 ) / numSteps;
      var bestAlpha = ( u1 - u0 ) / 2;
      var p = skaterState.track.getPoint( bestAlpha );
      var bestDE = skaterState.updatePosition( p.x, p.y ).getTotalEnergy();
      for ( var i = 0; i < numSteps; i++ ) {
        var proposedAlpha = u0 + da * i;
        var p2 = skaterState.track.getPoint( bestAlpha );
        var e = skaterState.updatePosition( p2.x, p2.y ).getTotalEnergy();
        if ( Math.abs( e - e0 ) <= Math.abs( bestDE ) ) {
          bestDE = e - e0;
          bestAlpha = proposedAlpha;
        }// continue to find best value closest to proposed u, even if several values give dE=0.0
      }
      debug && debug( "After " + numSteps + " steps, origAlpha=" + u0 + ", bestAlpha=" + bestAlpha + ", dE=" + bestDE );
      return bestAlpha;
    },

    // A number of heuristic energy correction steps to ensure energy is conserved while keeping the motion smooth and
    // accurate.  Copied from the Java version directly (with a few different magic numbers)
    correctEnergy: function( skaterState, newState ) {
      if ( this.trackChangePending ) {
        return newState;
      }
      var u0 = skaterState.u;
      var e0 = skaterState.getTotalEnergy();

      if ( !isFinite( newState.getTotalEnergy() ) ) { throw new Error( 'not finite' );}
      var dE = newState.getTotalEnergy() - e0;
      if ( Math.abs( dE ) < 1E-6 ) {
        // small enough
        return newState;
      }
      else {
        if ( newState.getTotalEnergy() > e0 ) {
          debug && debug( "Energy too high" );

          // can we reduce the velocity enough?
          // amount we could reduce the energy if we deleted all the kinetic energy:
          if ( Math.abs( newState.getKineticEnergy() ) > Math.abs( dE ) ) {

            // This is the current rule for reducing the energy.  But in a future version maybe should only do this
            // if all velocity is not converted?
            debug && debug( "Could fix all energy by changing velocity." );
            var correctedStateA = this.correctEnergyReduceVelocity( skaterState, newState );
            debug && debug( "changed velocity: dE=" + ( correctedStateA.getTotalEnergy() - e0 ) );
            if ( !isApproxEqual( e0, correctedStateA.getTotalEnergy(), 1E-8 ) ) {
              debug && debug( "Energy error[0]" );
            }
            return correctedStateA;
          }
          else {
            debug && debug( "Not enough KE to fix with velocity alone: normal:" );
            debug && debug( "changed position u: dE=" + ( newState.getTotalEnergy() - e0 ) );
            // search for a place between u and u0 with a better energy

            var numRecursiveSearches = 10;
            var u = newState.u;
            var bestAlpha = ( u + u0 ) / 2.0;
            var da = ( u - u0 ) / 2;
            for ( var i = 0; i < numRecursiveSearches; i++ ) {
              var numSteps = 10;
              bestAlpha = this.searchSplineForEnergy( newState, bestAlpha - da, bestAlpha + da, e0, numSteps );
              da = ( ( bestAlpha - da ) - ( bestAlpha + da ) ) / numSteps;
            }

            var point = newState.track.getPoint( bestAlpha );
            var correctedState = newState.updateUPosition( bestAlpha, point.x, point.y );
            debug && debug( "changed position u: dE=" + ( correctedState.getTotalEnergy() - e0 ) );
            if ( !isApproxEqual( e0, correctedState.getTotalEnergy(), 1E-8 ) ) {

              // amount we could reduce the energy if we deleted all the kinetic energy:
              if ( Math.abs( correctedState.getKineticEnergy() ) > Math.abs( dE ) ) {

                // TODO: maybe should only do this if all velocity is not converted
                debug && debug( "Fixed position some, still need to fix velocity as well." );
                var correctedState2 = this.correctEnergyReduceVelocity( skaterState, correctedState );
                if ( !isApproxEqual( e0, correctedState2.getTotalEnergy(), 1E-8 ) ) {
                  debug && debug( "Changed position & Velocity and still had energy error" );
                  debug && debug( "Energy error[123]" );
                }
                return correctedState2;
              }
              else {

                // TODO: This error case can still occur, especially with friction turned on
                debug && debug( "Changed position, wanted to change velocity, but didn't have enough to fix it..., dE=" + ( newState.getTotalEnergy() - e0 ) );
              }
            }
            return correctedState;
          }
        }
        else {
          if ( !isFinite( newState.getTotalEnergy() ) ) { throw new Error( 'not finite' );}
          debug && debug( "Energy too low" );

          // increasing the kinetic energy
          // Choose the exact velocity in the same direction as current velocity to ensure total energy conserved.
          var vSq = Math.abs( 2 / newState.mass * ( e0 - newState.getPotentialEnergy() - newState.thermalEnergy ) );
          var v = Math.sqrt( vSq );

          // TODO: What if uD ===0?
          var newVelocity = v * (newState.uD > 0 ? +1 : -1);
          var unitParallelVector = newState.track.getUnitParallelVector( newState.u );
          var updatedVelocityX = unitParallelVector.x * newVelocity;
          var updatedVelocityY = unitParallelVector.y * newVelocity;
          var fixedState = newState.updateUDVelocity( newVelocity, updatedVelocityX, updatedVelocityY );
          debug && debug( "Set velocity to match energy, when energy was low: " );
          debug && debug( "INC changed velocity: dE=" + ( fixedState.getTotalEnergy() - e0 ) );
          if ( !isApproxEqual( e0, fixedState.getTotalEnergy(), 1E-8 ) ) {
            new Error( "Energy error[2]" ).printStackTrace();
          }
          return fixedState;
        }
      }
    },

    // PERFORMANCE/ALLOCATION
    getCurvatureDirection: function( curvature, x2, y2 ) {
      var v = new Vector2( curvature.x - x2, curvature.y - y2 );
      return v.x !== 0 || v.y !== 0 ? v.normalized() : v;
    },

    getCurvatureDirectionX: function( curvature, x2, y2 ) {
      var vx = curvature.x - x2;
      var vy = curvature.y - y2;
      return vx !== 0 || vy !== 0 ? vx / Math.sqrt( vx * vx + vy * vy ) : vx;
    },

    getCurvatureDirectionY: function( curvature, x2, y2 ) {
      var vx = curvature.x - x2;
      var vy = curvature.y - y2;
      return vx !== 0 || vy !== 0 ? vy / Math.sqrt( vx * vx + vy * vy ) : vy;
    },

    // Update the skater based on which state it is in
    stepModel: function( dt, skaterState ) {
      this.time += dt;
      return skaterState.dragging ? skaterState : // User is dragging the skater, nothing to update here
             !skaterState.track && skaterState.positionY <= 0 ? this.stepGround( dt, skaterState ) :
             !skaterState.track && skaterState.positionY > 0 ? this.stepFreeFall( dt, skaterState, false ) :
             skaterState.track ? this.stepTrack( dt, skaterState ) :
             skaterState;
    },

    // Return to the starting position on the track
    returnSkaterStart: function() { //I think Dinesh wrote it ?
      if(this.getAllTracks())
      {
	var track = this.getAllTracks()[0];
	var skater = this.skater;
//	var position = track.getTrackStartingPoint();
	var position = track.getLeftControlPointXY();
	position = new Vector2(position.x+0.2, position.y);
	//add a small offset to that left most controlPoint to make it easier for stater to move
		
        var closestTrackAndPositionAndParameter = this.getClosestTrackAndPositionAndParameter( position, this.getPhysicalTracks() );
        var closestPoint = closestTrackAndPositionAndParameter.point;
        var targetTrack = closestTrackAndPositionAndParameter.track;
        var targetU = closestTrackAndPositionAndParameter.u;

      // Choose the right side of the track, i.e. the side of the track that would have the skater upside up
	skater.released( targetTrack, targetU );
	var normal = targetTrack.getUnitNormalVector( targetU );
	skater.up = normal.y > 0;
	skater.angle = targetTrack.getViewAngleAt( targetU ) + (skater.up ? 0 : Math.PI);
	skater.position = targetTrack.getPoint( targetU );
	skater.returnSkaterStart();
      }
    },

    // Return to the place he was last released by the user.  Also restores the track the skater was on so the initial
    // conditions are the same as the previous release
    returnSkater: function() {

      // if the skater's original track is available, restore her to it, see #143
      var originalTrackAvailable = _.contains( this.getPhysicalTracks(), this.skater.startingTrack );
      if ( originalTrackAvailable ) {
        this.skater.track = this.skater.startingTrack;
      }
      this.skater.returnSkater();
    },

    // Clear the thermal energy from the model
    clearThermal: function() { this.skater.clearThermal(); },

    getAllTracks: function() {
      var allTracks = [];
      for ( var i = 0; i < this.tracks.length; i++ ) {
        var track = this.tracks.get( i );
          allTracks.push( track );
        }
      return allTracks;
    },

    getPhysicalTracks: function() {
      var physicalTracks = [];
      for ( var i = 0; i < this.tracks.length; i++ ) {
        var track = this.tracks.get( i );
        if ( track.physical ) {
          physicalTracks.push( track );
        }
      }
      return physicalTracks;
    },

    getNonPhysicalTracks: function() {

      // Use vanilla instead of lodash for speed since this is in an inner loop
      var nonphysicalTracks = [];
      for ( var i = 0; i < this.tracks.length; i++ ) {
        var track = this.tracks.get( i );

        if ( !track.physical ) {
          nonphysicalTracks.push( track );
        }
      }
      return nonphysicalTracks;
    },
    snapControlPoint: function( track ) {
    var tracks = this.getAllTracks();
    var bestDistance = null;
    var bestPoint = null;
    var t,distance;
    var controlPoint = [track.controlPoints[0], track.controlPoints[track.controlPoints.length - 1]];
    var bestOtherPoint = controlPoint[0];

    for(var k=0; k < 2 ; k++ ) //2 controlPoints for given track
    {
	    for(var i=0; i < tracks.length; i++) 
	    {
	    	t=tracks[i];
		if(t.trackName !== track.trackName)
		{
		      var myPoints = [t.controlPoints[0], t.controlPoints[t.controlPoints.length - 1]];
		      for(var j=0; j<2; j++) // 2 control points for each track
		      {
			distance = myPoints[j].position.distance(controlPoint[k].position);
			if(bestDistance==null) { bestDistance = distance; bestPoint = myPoints[j];}
			bestPoint = (distance < bestDistance) ? myPoints[j] : bestPoint;
			bestDistance = (distance < bestDistance) ? distance : bestDistance;
			bestOtherPoint = (distance < bestDistance) ? controlPoint[k] : bestOtherPoint;
		      }
		}
	      }
     }
//     return bestDistance;
      if (bestDistance < MIN_DIST) {
//	bestOtherPoint.snapTarget = bestPoint;
        if( bestOtherPoint == controlPoint[0]) {
        	track.controlPoints[0].snapTarget = bestPoint;
         }
         else {
        	track.controlPoints[track.controlPoints.length-1].snapTarget = bestPoint;
         }
         track.updateSplines();
         track.trigger('scaled');
         return true;
      }
      else { return null; } 
    },

    // Find whatever track is connected to the specified track and join them together to a new track
    joinTracks: function( track ) {
    var flag=0;
      var connectedPoint = track.getSnapTarget();
      var physicalTracks = this.getPhysicalTracks();
      var otherTrack;
      for ( var i = 0; i < physicalTracks.length; i++ ) {
         otherTrack = physicalTracks[i];
        if ( otherTrack.containsControlPoint( connectedPoint ) ) {
          this.joinTrackToTrack( track, otherTrack );
          flag=1;
          break;
        }
      }
      if(flag==1) {
      	return true;
      }
      else {
      	return false;
      }	

      // if the number of control points is low enough, replenish the toolbox
/*      if ( this.getNumberOfControlPoints() <= MAX_NUMBER_CONTROL_POINTS - 3 ) {
        this.addDraggableTrack();
      }*/
    },

    // Merge the track very close to the given track, but not snapped due to controlPoint Error
    joinTracks2: function( track ) {
    var flag=0;
      var connectedPoint = track.getSnapTarget();
      for ( var i = 0; i < this.getPhysicalTracks().length; i++ ) {
        var otherTrack = this.getPhysicalTracks()[i];
        if(otherTrack.trackName != track.trackName) //search all tracks except given track
        {
		var value = otherTrack.closestControlPoint( connectedPoint );
		if ( value ) {
		  track.setSnapTarget(value);
		  this.joinTrackToTrack( track, otherTrack );
		  flag=1;
		  break;
        	}
        }
      }
      if(flag==1) {
      	return true;
      }
      else {
      	return false;
      }	
    },

    // The user has pressed the "delete" button for the specified track's specified control point, and it should be
    // deleted.
    // It should be an inner point of a track (not an end point)
    // If there were only 2 points on the track, just delete the entire track
    deleteControlPoint: function( track, controlPointIndex ) {
      track.trigger( 'remove' );
      this.tracks.remove( track );

      if ( track.controlPoints.length > 2 ) {
        var points = _.without( track.controlPoints, track.controlPoints[controlPointIndex] );
        var newTrack = new Track( this, this.tracks, points, true, track.getParentsOrSelf(), this.availableModelBoundsProperty );
        newTrack.physical = true;
        newTrack.dropped = true;

        // smooth out the new track, see #177
        var smoothingPoint = controlPointIndex >= newTrack.controlPoints.length ? newTrack.controlPoints.length - 1 : controlPointIndex;
        newTrack.smooth( smoothingPoint );

        // Make sure the new track doesn't go underground after a control point is deleted, see #174
        newTrack.bumpAboveGround();

        //Zhilin
        newTrack.bumpAsideLeftWindow();
        newTrack.bumpAsideRightWindow();

        this.tracks.add( newTrack );
      }

      // Trigger track changed first to update the edit enabled properties
      this.trigger( 'track-changed' );

      // If the skater was on track, then he should fall off
/*      if ( this.skater.track === track ) {
        this.skater.track = null;
      }*/

      // if the number of control points is low enough, replenish the toolbox
      if ( this.getNumberOfControlPoints() <= MAX_NUMBER_CONTROL_POINTS - 3 ) {
        this.addDraggableTrack();
      }
    },

    // The user has pressed the "delete" button for the specified track's specified control point, and it should be
    // deleted. It should be an inner point of a track (not an end point)
    splitControlPoint: function( track, controlPointIndex, modelAngle ) {
      var vector = Vector2.createPolar( 0.5, modelAngle );
      var newPoint1 = new ControlPoint( track.controlPoints[controlPointIndex].sourcePosition.x - vector.x, track.controlPoints[controlPointIndex].sourcePosition.y - vector.y );
      var newPoint2 = new ControlPoint( track.controlPoints[controlPointIndex].sourcePosition.x + vector.x, track.controlPoints[controlPointIndex].sourcePosition.y + vector.y );

      var points1 = track.controlPoints.slice( 0, controlPointIndex );
      var points2 = track.controlPoints.slice( controlPointIndex + 1, track.controlPoints.length );

      points1.push( newPoint1 );
      points2.unshift( newPoint2 );

      var newTrack1 = new Track( this, this.tracks, points1, true, track.getParentsOrSelf(), this.availableModelBoundsProperty );
      newTrack1.physical = true;
      newTrack1.dropped = true;
      var newTrack2 = new Track( this, this.tracks, points2, true, track.getParentsOrSelf(), this.availableModelBoundsProperty );
      newTrack2.physical = true;
      newTrack2.dropped = true;

      track.trigger( 'remove' );
      this.tracks.remove( track );
      this.tracks.add( newTrack1 );
      this.tracks.add( newTrack2 );


      // Smooth the new tracks, see #177
      newTrack1.smooth( controlPointIndex - 1 );
      newTrack2.smooth( 0 );

      // Trigger track changed first to update the edit enabled properties
      this.trigger( 'track-changed' );

      // If the skater was on track, then he should fall off, see #97
/*      if ( this.skater.track === track ) {
        this.skater.track = null;
      } */

      // If a control point was split and that makes too many "live" control points total, remove a piece of track from
      // the toolbox to keep the total number of control points low enough.
      if ( this.getNumberOfControlPoints() > MAX_NUMBER_CONTROL_POINTS ) {
        // find a nonphysical track, then remove it

        var trackToRemove = this.getNonPhysicalTracks()[0];
        trackToRemove.trigger( 'remove' );
        this.tracks.remove( trackToRemove );
      }
    },

    joinTrackToTrack: function( a, b ) {
      var points = [];
      var i;

      // Join in the right direction for a & b so that the joined point is in the middle

      var firstTrackForward = function() {
      	points.push( a.controlPoints[0].copyWithSnap() );
      	for ( i = 1; i < a.controlPoints.length; i++ ) { points.push( a.controlPoints[i].copy() ); }
      };
      var firstTrackBackward = function() {
      	points.push( a.controlPoints[a.controlPoints.length - 1].copyWithSnap() );
	for ( i = a.controlPoints.length - 2; i >= 0; i-- ) { points.push( a.controlPoints[i].copy() ); }
      };
      var secondTrackForward = function() {
      	for ( i = 1; i < b.controlPoints.length-1; i++ ) {points.push( b.controlPoints[i].copy() ); }
	points.push( b.controlPoints[i].copyWithSnap() );
      };
      var secondTrackBackward = function() {
      	for ( i = b.controlPoints.length - 2; i >= 1; i-- ) {points.push( b.controlPoints[i].copy() ); }
	points.push( b.controlPoints[i].copyWithSnap() );
      };

      // Only include one copy of the snapped point
      // Forward Forward
      if ( a.controlPoints[a.controlPoints.length - 1].snapTarget === b.controlPoints[0] ) {
        firstTrackForward();
        secondTrackForward();
      }

      // Forward Backward
      else if ( a.controlPoints[a.controlPoints.length - 1].snapTarget === b.controlPoints[b.controlPoints.length - 1] ) {
        firstTrackForward();
        secondTrackBackward();
      }

      // Backward Forward
      else if ( a.controlPoints[0].snapTarget === b.controlPoints[0] ) {
        firstTrackBackward();
        secondTrackForward();
      }

      // Backward backward
      else if ( a.controlPoints[0].snapTarget === b.controlPoints[b.controlPoints.length - 1] ) {
        firstTrackBackward();
        secondTrackBackward();
      }
      this.mergedTrackCount = this.mergedTrackCount + 1;
      var trackName = "Track" + this.mergedTrackCount.toString();
      var newTrack = new Track( this, 
      	this.tracks, 
      	points,
      	true, 
      	a.getParentsOrSelf().concat( b.getParentsOrSelf() ), 
      	this.availableModelBoundsProperty,
      	{trackName: trackName } 
      );

      newTrack.physical = true;
      newTrack.dropped = true;

      a.trigger( 'remove' );
      this.tracks.remove( a );

      b.trigger( 'remove' );
      this.tracks.remove( b );

      // When tracks are joined, bump the new track above ground so the y value (and potential energy) cannot go negative,
      // and so it won't make the "return skater" button get bigger, see #158
      newTrack.bumpAboveGround();
      //Zhilin
      newTrack.bumpAsideLeftWindow();
      newTrack.bumpAsideRightWindow();
      this.tracks.add( newTrack );

      // Move skater to new track if he was on the old track, by searching for the best fit point on the new track
      // Note: Energy is not conserved when tracks joined since the user has added or removed energy from the system
/*
      if ( this.skater.track === a || this.skater.track === b ) {

        var originalDirectionVector = this.skater.track.getUnitParallelVector( this.skater.u ).times( this.skater.uD );

        // Keep track of the skater direction so we can toggle the 'up' flag if the track orientation changed
        var originalNormal = this.skater.upVector;
        var p = newTrack.getClosestPositionAndParameter( this.skater.position.copy() );
        this.skater.track = newTrack;
        this.skater.u = p.u;
        var x2 = newTrack.getX( p.u );
        var y2 = newTrack.getY( p.u );
        this.skater.position = new Vector2( x2, y2 );
        this.skater.angle = newTrack.getViewAngleAt( p.u ) + (this.skater.up ? 0 : Math.PI);

        // Trigger an initial update now so we can get the right up vector, see #150
        this.skater.trigger( 'updated' );
        var newNormal = this.skater.upVector;

        // If the skater flipped upside down because the track directionality is different, toggle his 'up' flag
        if ( originalNormal.dot( newNormal ) < 0 ) {
          this.skater.up = !this.skater.up;
          this.skater.angle = newTrack.getViewAngleAt( p.u ) + (this.skater.up ? 0 : Math.PI);
          this.skater.trigger( 'updated' );
        }

        // If the skater changed direction of motion because of the track polarity change, flip the parametric velocity
        // 'uD' value, see #180
        var newDirectionVector = this.skater.track.getUnitParallelVector( this.skater.u ).times( this.skater.uD );
        debugAttachDetach && debugAttachDetach( newDirectionVector.dot( originalDirectionVector ) );
        if ( newDirectionVector.dot( originalDirectionVector ) < 0 ) {
          this.skater.uD = -this.skater.uD;
        }
      } */

      // When joining tracks, smooth out the new track, but without moving the point that joined the tracks, see #177 #238
      newTrack.smoothPointOfHighestCurvature( [] );
    },
    // When a track is dragged, update the skater's energy (if the sim was paused), since it wouldn't be handled in the
    // update loop.
    trackModified: function( track ) {
      if ( this.paused && this.skater.track === track ) {
        this.skater.updateEnergy();
      }
      // Flag the track as having changed *this frame* so energy doesn't need to be conserved during this frame, see #127
      this.trackChangePending = true;
    },

    // Get the state, say, to put in a query parameter
    getState: function() {
      return {
        properties: this.get(),
        skater: this.skater.getState( this.tracks ),
        tracks: this.tracks.getArray().map( function( track ) {
          return {physical: track.physical, points: track.controlPoints.map( function( controlPoint ) { return controlPoint.sourcePosition; } )};
        } )
      };
    },

    // Set the state, say from a query parameter
    setState: function( state ) {
      // Clear old tracks
      this.tracks.clear();
      for ( var i = 0; i < state.tracks.length; i++ ) {
        var controlPoints = state.tracks[i].points.map( function( point ) {
          return new ControlPoint( point.x, point.y );
        } );
        var newTrack = new Track( this, this.tracks, controlPoints, true, null, this.availableModelBoundsProperty );
        newTrack.physical = state.tracks[i].physical;
        newTrack.dropped = state.tracks[i].dropped;
        this.tracks.add( newTrack );
      }

      // Trigger track changed first to update the edit enabled properties
      this.trigger( 'track-changed' );

      this.set( state.properties );

      this.skater.setState( state.skater, this.tracks );
    },

    // Get the number of physical control points (i.e. control points outside of the toolbox)
    getNumberOfPhysicalControlPoints: function() {
      var numberOfPointsInEachTrack = _.map( this.getPhysicalTracks(), function( track ) {return track.controlPoints.length;} );
      return _.reduce( numberOfPointsInEachTrack, function( memo, num ) { return memo + num; }, 0 );
    },

    getNumberOfControlPoints: function() {
      var numberOfPointsInEachTrack = _.map( this.tracks.getArray(), function( track ) {return track.controlPoints.length;} );
      return _.reduce( numberOfPointsInEachTrack, function( memo, num ) { return memo + num; }, 0 );
    },

    // Logic to determine whether a control point can be added by cutting a track's control point in two
    // This is feasible if the number of control points in the play area (above y>0) is less than the maximum
    canCutTrackControlPoint: function() {
      return this.getNumberOfPhysicalControlPoints() < MAX_NUMBER_CONTROL_POINTS;
    },

    // Check whether the model contains a track so that input listeners for detached elements can't create bugs, see #230
    containsTrack: function( track ) {
      return this.tracks.contains( track );
    },

   } ); //end of return



} ); //end of define


/********** Simulation States *********************************************************

****************************************************************************************/

