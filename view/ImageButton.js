
/**
 * Button with an Image.
 *
 * @author Dinesh
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function ImageButton( imgNode, options ) {

    options = _.extend( {
      baseColor: '#F2E916',
      iconWidth: 50, // width of eraser icon, used for scaling, the aspect ratio will determine height
      xMargin: 3,
      yMargin: 3,
    }, options );

    // eraser icon
    options.content = imgNode;
    options.content.scale( options.iconWidth / options.content.width );

    RectangularPushButton.call( this, options );
  }

  return inherit( RectangularPushButton, ImageButton );
} );
