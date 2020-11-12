// Copyright 2002-2013, University of Colorado Boulder

/**
 * Scenery node that shows animating bar chart bars as rectangles.  Should be shown in front of the
 * BarGraphBackground.  This was split into separate layers in order to keep the animation fast on iPad.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var EnergySkateParkColorScheme = require( 'ROLLERCOASTER/view/EnergySkateParkColorScheme' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Color = require( 'SCENERY/util/Color' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var pattern_0value_1units = require( 'string!ROLLERCOASTER/pattern_0value_1units' );

  /**
   * Constructor for the BarGraph
   * @param {Skater} skater the model's skater model
   * @param {Property<Boolean>} barGraphVisibleProperty property that indicates whether the bar graph is visible
   * @param {string} barRenderer the renderer type to use for the bars.  For some reason it is not currently inherited.
   * @constructor
   */
  function BarGraphForeground( skater, barGraphBackground, barGraphVisibleProperty, barRenderer ) {

    var barWidth = barGraphBackground.barWidth;
    var getBarX = barGraphBackground.getBarX;
    var originY = barGraphBackground.originY;

    // Create an energy bar that animates as the skater moves
    var createBar = function( index, color, property ) {

      // Convert to graph coordinates
      // However, do not floor for values less than 1 otherwise a nonzero value will show up as zero, see #159
      var barHeightProperty = property.map( function( value ) {
//        var result = value / 30;
	var result = value / 15; //this is just a display scale

        // Floor and protect against duplicates.
        // Make sure that nonzero values are big enough to be visible, see #307
        return result > 1 ? Math.floor( result ) :
               result < 1E-6 ? 0 :
               1;
      } );

      var barX = getBarX( index );
//      var bar = new Rectangle( barX, 0, barWidth, 100, {fill: color, pickable: false, renderer: barRenderer} );
	//remove renderer type (DINESH)	
      var bar = new Rectangle( barX, 0, barWidth, 100, {fill: color, pickable: false} );


      // update the bars when the graph becomes visible, and skip update when they are invisible
      DerivedProperty.multilink( [barHeightProperty, barGraphVisibleProperty], function( barHeight, visible ) {
        if ( visible ) {
          // PERFORMANCE/ALLOCATION: Possible performance improvement to avoid allocations in Rectangle.setRect

          // TODO: just omit negative bars altogether?
          if ( barHeight >= 0 ) {
            bar.setRect( barX, originY - barHeight, barWidth, barHeight );
          }
          else {
            bar.setRect( barX, originY, barWidth, -barHeight );
          }
        }
      } );
     
      return bar;
    };

    var kineticBar = createBar( 0, EnergySkateParkColorScheme.kineticEnergy, skater.kineticEnergyProperty );
    var potentialBar = createBar( 1, EnergySkateParkColorScheme.potentialEnergy, skater.potentialEnergyProperty );
    var thermalBar = createBar( 2, EnergySkateParkColorScheme.thermalEnergy, skater.thermalEnergyProperty );
    var totalBar = createBar( 3, EnergySkateParkColorScheme.totalEnergy, skater.totalEnergyProperty );


   //Create display label texts
    var createText = function ( index, itemProperty ) {

	var displayText = new Text( '9999 J', {fill: '#000', font: new PhetFont( 12 ), pickable: false} );
	displayText.rotate(-Math.PI/2);
	displayText.centerY= barGraphBackground.displayBoxCenterY;
	displayText.centerX= getBarX( index ) + barWidth / 2;

	itemProperty.link( function(value) {
		displayText.text = StringUtils.format( pattern_0value_1units, value.toFixed(0), 'J' );
		displayText.centerY= barGraphBackground.displayBoxCenterY;
	} );

	return displayText; 
    };

    var kineticText = createText( 0, skater.kineticEnergyProperty );
    var potentialText = createText( 1, skater.potentialEnergyProperty );
    var thermalText = createText( 2, skater.thermalEnergyProperty );
    var totalText = createText( 3, skater.totalEnergyProperty );
          
    Node.call( this, {

      // Manually align with the baseline of the bar chart.
      x: 24, y: 15,

      children: [
        kineticBar,
        kineticText,
        potentialBar,
        potentialText,
        thermalBar,
        thermalText,
        totalBar,
        totalText
      ]} );

    // When the bar graph is shown, update the bars (because they do not get updated when invisible for performance reasons)
    barGraphVisibleProperty.linkAttribute( this, 'visible' );
  }

  return inherit( Node, BarGraphForeground );
} );
