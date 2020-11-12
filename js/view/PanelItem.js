
/************************************************
*		PanelItem			*
*************************************************
*
* Entity that displays one item for the DisplayPanel
*
* author: Dinesh
*/

define( function( require ) {
  'use strict';

  // general modules

  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Vector2 = require('DOT/Vector2');


  var pattern_0value_1units = require( 'string!ROLLERCOASTER/pattern_0value_1units' );

  var CORNER_RADIUS = 3;
  
  /**
   * Constructor for the MixtureItem
   * @param string{label} Display label
   * @param Property{value} value of the parameter to be displayed
   * @param string{units} Units of the parameter that is displayed
   * @param number{scale} any scaling if needs to be done to the valueProperty

   * @constructor
   */

  function PanelItem( label, valueProperty, units, options ) {

    options = _.extend( {
        xMargin: 10,
        yMargin: 10,
        lineWidth: 3,
	decimals:2,
	max_value:10000,
	scaleFunction:function(val) { return val; },
	labelSize: 14,
      },
      options );
 
    Node.call( this , {cursor: 'pointer'});

    var fontOptions = {font: new PhetFont( {  fill: 'black', size: 14 } )};

    var ItemDisplay=new Node();

    var ItemLabel = new Text( label, new PhetFont(options.labelSize) );

    var ItemValue=0;

    var ItemText = new SubSupText( StringUtils.format( pattern_0value_1units, options.max_value , 'U' ), fontOptions);

    // rectangle that the value is displayed in

    var valueXMargin = 8;
    var valueYMargin = 5;
    var ItemRectangle = new Rectangle( 0, 0, ItemText.width + ( 2 * valueXMargin ), ItemText.height + ( 2 * valueYMargin ), CORNER_RADIUS, CORNER_RADIUS, { fill: 'white', stroke: 'black', lineWidth:1 } );
     
     ItemRectangle.left=ItemLabel.right + 10;
     ItemRectangle.centerY =ItemLabel.centerY;
     ItemText.right=ItemRectangle.right-options.xMargin;
     
     ItemText.text=StringUtils.format( pattern_0value_1units, ItemValue.toFixed(options.decimals), units );
     ItemText.right=ItemRectangle.right-options.xMargin;

     ItemDisplay.addChild(ItemRectangle);
     ItemDisplay.addChild(ItemLabel);
     ItemDisplay.addChild(ItemText);
 
     this.addChild(ItemDisplay);

 
       valueProperty.link( function(val) { 
		ItemValue=options.scaleFunction(val);  //update the value of the variable
		ItemText.text=StringUtils.format( pattern_0value_1units, ItemValue.toFixed(options.decimals), units );
//		ItemText.right=ItemRectangle.right-options.xMargin;
		ItemText.centerX=ItemRectangle.centerX;
	} );
  }

  return inherit( Node, PanelItem );
} );
