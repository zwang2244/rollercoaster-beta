/************************************************
*		ControlSlider	 		*
*************************************************
 *
 * A generic slider control that can be used to control a numeric property within a given range.
 * It has a slider and buttons on either ends of the display to change the property value.
 * It can be expanded or collapsed using a plus/minus button at top left.
 * Has support to show ticks for important values and snaps to these values when the value is within 5% of a tick.
 * Triggers a callback function to update the display value when trackProperty or unitsProperty changes.
 * 
 * Adapted from Under pressure / ControlSlider.js
 *
 */

define( function( require ) {
  'use strict';

  // modules
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var HSlider = require( 'SUN/HSlider' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Util = require( 'DOT/Util' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  //strings
  var pattern_0value_1units = require( 'string!ROLLERCOASTER/pattern_0value_1units' );
Object

  // constants
  var TRACK_SIZE = new Dimension2( 200, 3 );

  /**
   * Constructor for the slider control
   * @param {Property<Number>} trackProperty tracks the property used in the slider
   * @param {Range} trackRange is the range of values that the trackProperty can take
   * @param {Object} options
   * @constructor
   */
  function ControlSlider( title, units, trackProperty,  trackRange, scaleFunction, displayVisibleProperty, 
                          options ) {
    options = _.extend( {
      fill: 'rgb(230,230,230)',
      buttonColor:'rgb(0,200,0)',
      delX:1,
      xMargin: 15,
      yMargin: 5,
      decimals: 0,
      calibrate:0,
      thumbSize: new Dimension2( 22, 45 ),
      ticks: [
          {
            title: scaleFunction(trackRange.min).toFixed(options.decimals),
            value: trackRange.min
          },

          {
            title: scaleFunction(trackRange.max).toFixed(options.decimals),
            value: trackRange.max
          }
        ],
      ticksVisible: true,
      titleAlign: 'center'       
    }, options );
	
    Node.call( this );
	
    var hSlider = new HSlider( trackProperty, trackRange, {
      enabledProperty: displayVisibleProperty,
      trackSize: TRACK_SIZE,
      thumbSize: options.thumbSize,
      majorTickLineWidth: (options.ticksVisible ? 1 : 0),
      trackFill: '#000',
      endDrag: function() {
        for ( var i = 0; i < options.ticks.length; i++ ) {

          if ( Math.abs( options.ticks[i].value - trackProperty.value ) <= 0.05 * options.ticks[i].value ) {
            trackProperty.value = options.ticks[i].value;
            break;
          } }

	if(options.calibrate===1) { //calibrate weight
	 if(trackProperty.value!=trackProperty.value.toFixed(0) )
	   {
		trackProperty.value=trackProperty.value.toFixed(0);		
	   }
	}
	if(options.calibrate===2) { //height calibrate
	 if(trackProperty.value%5!=0 )
	   {
		trackProperty.value=((trackProperty.value/options.delX).toFixed(0))*options.delX;		
	   }
	}
        
      }
    } );


   var labelNode = new Text( title, { fill: 'black', font: new PhetFont( { size: 19 , weight: 'bold' } ) } );

    var plusButton = new ArrowButton( 'right', function propertyPlus() {
      trackProperty.set( Util.toFixedNumber( parseFloat( Math.min( trackProperty.get() + options.delX, trackRange.max ) ), options.decimals ) );
    },
     { arrowFill: options.buttonColor }	
    );
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
        plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 20 );

    var minusButton = new ArrowButton( 'left', function propertyMinus() 
    { 
      trackProperty.set( Util.toFixedNumber( parseFloat( Math.max( trackProperty.get() - options.delX, trackRange.min ) ), options.decimals ) );
      }, 
      { arrowFill: options.buttonColor }
    );
    minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
        minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 20 );

    var valueLabel = new SubSupText( '', { font: new PhetFont( 19 ), pickable: false } );
    var valueField = new Rectangle( 0, 0, 100, 30, 3, 3,
      { fill: '#FFF', stroke: 'black', lineWidth: 1, pickable: false } );
    var labelFont = new PhetFont( 14 );

    options.ticks.forEach( function( tick ) {
      hSlider.addMajorTick( tick.value, new Text( tick.title, { font: labelFont, visible: options.ticksVisible } ) );
    } );

    // rendering order
    this.addChild( labelNode );
    this.addChild( valueField );
    this.addChild( valueLabel );
    this.addChild( hSlider );
    this.addChild( plusButton );
    this.addChild( minusButton );

    // relative layout, everything relative to the track
//    valueField.centerX = this.centerX;
//    valueField.bottom = hSlider.top - 5;

     hSlider.centerX = valueField.centerX;
     hSlider.top = valueField.bottom + 5;

    valueLabel.centerX = valueField.centerX;
    valueLabel.centerY = valueField.centerY - 3;

    // plus button to the right of the value
    plusButton.left = valueField.right + 10;
    plusButton.centerY = valueField.centerY;

    // minus button to the left of the value
    minusButton.right = valueField.left - 10;
    minusButton.centerY = valueField.centerY;

    labelNode.bottom=valueField.top-10;
    labelNode.centerX=valueField.centerX;

/*
    this.accordionContent = new Node();
    this.accordionContent.addChild( this.content );

    var accordionBox = new AccordionBox( this.accordionContent,
      {
        titleNode: new Text( options.title, { fill:'black', font: new PhetFont( { size: 19 , weight: 'bold' } ) } ),
        fill: options.fill,
        stroke: 'black',
	lineWidth:2,
        expandedProperty: expandedProperty,
        minWidth: 270,
        contentAlign: 'right',
        titleAlign: options.titleAlign,
        buttonAlign: 'left',
        scale: scale,
        cornerRadius: 10,
        buttonXMargin: 8,
        buttonYMargin: 8
      } );
    this.addChild( accordionBox );

    //question mark, show if unknown property
    this.questionMark = new Node( {visible: false} );
    this.questionMark.addChild( new Text( '?', { font: new PhetFont( 80 )} ) );
    this.questionMark.centerX = accordionBox.width / 2 + 16;
    this.questionMark.top = this.top;
    this.accordionContent.addChild( this.questionMark );
*/

    trackProperty.link( function( value ) {
      valueLabel.text = StringUtils.format( pattern_0value_1units, scaleFunction(trackProperty.value).toFixed(options.decimals), units);
      valueLabel.center = valueField.center; // keep the value centered in the field
      plusButton.enabled = ( value <= trackRange.max );
      minusButton.enabled = ( value >= trackRange.min );
    } );

   displayVisibleProperty.link( function ( value ) {
         plusButton.enabled = value;
         minusButton.enabled = value;
   } );

    this.mutate( options );
  }

  return inherit( Node, ControlSlider);

} );
