/*
*****************************************
*		Force Vectors		*
*****************************************
* Displays the force arrows (weight, friction force, normal force)
*
* author:Dinesh
*/

define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var LinearFunction = require( 'DOT/LinearFunction' );

  function ForceVectors( model, skaterNode, View ) {

	var forceVectors = this;
    Node.call( forceVectors , {cursor: 'pointer'});
/*
    //labels & arrow nodes
    var FrictionLabel = new Text( 'Friction', fontOptions );
    var NormalForceLabel = new Text( 'Normal Force', fontOptions );
    var WeightLabel = new Text( 'Weight', fontOptions );
    
    var FrictionArrow = new ArrowNode(0,0,0,0,{fill:'red'});
    var NormalForceArrow = new ArrowNode(0,0,0,0);
    var GravityArrow = new ArrowNode(0,0,0,0);

//    View.addChild(FrictionLabel);
//    View.addChild(NormalForceLabel);
    View.addChild(WeightLabel);
//    View.addChild(FrictionArrow);
*/

    var modelViewTransform = View.modelViewTransform;
    var scaleFn = function (x,scale) { 
//    	var x1 = 0, x2 = 500;
//    	var y1 = 0, y2 = 50;
//    	return y1 + (y2-y1)*(x-x1)/(x2-x1);
	var xmax = 100;
	if(x>0) { return Math.min(x/scale,xmax);}
	else { return Math.max(x/scale,-1*xmax);}
    };

    var createArrowNode = function(i,arrowText, fillColor, vectorProperty, scale ) {
    	var arrowLabel = new Text( arrowText, {font: new PhetFont(10), fill:fillColor});
    	var arrowVector = new ArrowNode(0,0,0,0,{fill:fillColor});
    	View.addChild(arrowLabel);
    	View.addChild(arrowVector);

    	//update Arrow function
    	var updateArrow = function(position) {
	 	var pos = modelViewTransform.modelToViewPosition( position );
	 	var force = vectorProperty.get();
		arrowVector.setTailAndTip( pos.x, pos.y, pos.x + scaleFn(force.x,scale), pos.y - scaleFn(force.y,scale) );
		//Label positioning
		if(i==1)
		{
	    		arrowLabel.bottom = skaterNode.top - 10;
	    		arrowLabel.centerX = arrowVector.centerX;
		}
		else if(i==2)
		{
	    		arrowLabel.top = arrowVector.bottom + 10;
	    		arrowLabel.centerX = arrowVector.centerX;
		}
		else
		{
			if(model.friction==0)
			{
				arrowLabel.visible=false;
			}
			else
			{
		    		arrowLabel.centerY = arrowVector.centerY;
		    		arrowLabel.right = arrowVector.left - 10;
		    	}
		}
		};
		
    	
    	model.skater.positionProperty.link( function (position) {
    		if(model.vectorsVisible == true)
    		{
	    		updateArrow(position);
    		}
		} );
		//Zhilin
    	model.simStateProperty.link( function(state) {
		model.vectorsVisible = (state != 'simulation') ? false:true;
		arrowVector.visible = (state != 'simulation') ? false:true;
		arrowLabel.visible = (state != 'simulation') ? false:true;
		//model.vectorsVisible = false;
/*		arrowVector.visible = (state==='simulation') ? true:false;
		arrowLabel.visible = (state==='simulation') ? true:false;
		if(state=='simulation') { arrowVector.setTailAndTip(0,0,0,0); }
*/
    	} );
    	model.vectorsVisibleProperty.link( function(value) {
		
		arrowVector.visible = true;
		arrowLabel.visible = true;
		if(value==true) { updateArrow(model.skater.positionProperty.get()); }
    	} );
    	
    };
    createArrowNode(1,'Normal Force','#000000', model.skater.normalForceProperty,10);
    createArrowNode(2,'Weight','#006400', model.skater.weightProperty,10);
    createArrowNode(3,'Friction','#FF0000', model.skater.frictionForceProperty,2);

} 

  return inherit( Node, ForceVectors);

});


