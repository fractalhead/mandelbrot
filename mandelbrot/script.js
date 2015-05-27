// Mandelbrot Set (c) Joby Bednar 2010
// All rights reserved

var msEngine = {
	vars : {
		draw : true,
		fastDraw : false,
		center : {x:-0.75, y:0.0},
		bounds : {x:3.5, y:2.0},
		scale : 1.0,
		zoomScale : 2,
		pixel : {x:0, y:0},
		max : {x:800, y:460},
		step : [10, 5, 2, 1],
		curStep : 0,
		gfx : {
			screen : null,
			snapshot : null
		},
		mouse : {x:0, y:0},
		renderMouse : false,
		timer : null
	},
	
	draw : function(){
		if(this.vars.timer) clearTimeout(this.vars.timer);
		
		var sc = this.vars.gfx.screen;
		this.vars.fastDraw = false;
		
		if(this.vars.renderMouse) sc.putImageData(this.vars.gfx.snapshot,0,0);
		
		if(this.vars.draw){
			//get current pixel
			var x0 = (this.vars.pixel.x * ((this.vars.bounds.x*this.vars.scale)/800.0)) + (this.vars.center.x - (this.vars.bounds.x*this.vars.scale)/2.0);
			var y0 = (this.vars.pixel.y * ((this.vars.bounds.y*this.vars.scale)/460.0)) + (this.vars.center.y - (this.vars.bounds.y*this.vars.scale)/2.0);
			var x = 0;
			var y = 0;
			var iteration = 0;
			var max_iteration = 1000;
			var color = '#FFF';
		
			//calculate pixel color
			while ( (x*x) + (y*y) <= (2*2) && iteration < max_iteration )
			{
				var xtemp = (x*x) - (y*y) + x0;
				y = (2*x*y) + y0;
				x = xtemp;
				iteration++;
			}
			if ( iteration != max_iteration ){
				//range from 0-255 based on iteration of 0-1000
				var val = Math.round(255.0 * (iteration / 1000.0));
				//scale sinusoidally rather than linear to see more gray
				val = Math.round(255.0 * Math.sin(Math.acos((255-val)/255.0)));
				color = 'rgba('+val+','+val+','+val+',1.0)';	
			}
		
			//plot(x0,y0,color)
			sc.fillStyle = color;
			sc.fillRect(this.vars.pixel.x, this.vars.pixel.y, this.vars.step[this.vars.curStep], this.vars.step[this.vars.curStep]);
		
			//set next pixel
			if(this.vars.pixel.x != this.vars.max.x){
				this.vars.pixel.x += this.vars.step[this.vars.curStep];
				this.vars.fastDraw = true;
			} else {
				this.vars.pixel.x = 0;
				this.vars.pixel.y += this.vars.step[this.vars.curStep];
				if(this.vars.pixel.y > this.vars.max.y){
					this.vars.pixel.x = 0;
					this.vars.pixel.y = 0;
					this.vars.curStep++;
					if(this.vars.curStep == this.vars.step.length){
						this.vars.draw = false;
					}
				}
				this.vars.fastDraw = false;
			}
		}
		
		//draw mouse, if needed
		if(this.vars.renderMouse){
			this.vars.gfx.snapshot = sc.getImageData(0,0,800,460);
			sc.fillStyle = 'rgba(200,200,255,0.5)';
			var dx = Math.round(800/this.vars.zoomScale);
			var dy = Math.round(460/this.vars.zoomScale);;
			sc.fillRect(this.vars.mouse.x-Math.round(dx/2), this.vars.mouse.y-Math.round(dy/2), dx, dy);
		}
	
		//animation pause
		if(this.vars.draw){
			//color next pixel to evaluate to show progress
			sc.fillStyle = 'rgba(0,0,255,0.2)';
			if(!this.vars.renderMouse && this.vars.fastDraw){
				if(this.vars.pixel.x == 800) sc.fillRect(0, this.vars.pixel.y+this.vars.step[this.vars.curStep], 800, this.vars.step[this.vars.curStep]);
			} else {
				sc.fillRect(this.vars.pixel.x, this.vars.pixel.y, this.vars.step[this.vars.curStep], this.vars.step[this.vars.curStep]);
			}
		}
		
		if(!this.vars.renderMouse && this.vars.fastDraw){
			this.draw();
		} else {
			this.vars.timer = setTimeout("msEngine.draw()",1);
		}
	},
	
	mouseMove : function(e){
		msEngine.vars.mouse.x = e.pageX;
		msEngine.vars.mouse.y = e.pageY;
		if(!msEngine.vars.renderMouse){
			var sc = msEngine.vars.gfx.screen;
			msEngine.vars.gfx.snapshot = sc.getImageData(0,0,800,460);
			msEngine.vars.renderMouse = true;
		}
	},
	
	mouseOut : function(e){
		msEngine.vars.renderMouse = false;
		var sc = msEngine.vars.gfx.screen;
		sc.putImageData(msEngine.vars.gfx.snapshot,0,0);
	},
	
	mouseClick : function(e){
		if(msEngine.vars.timer) clearTimeout(msEngine.vars.timer); 
		msEngine.vars.center.x = (e.pageX * ((msEngine.vars.bounds.x*msEngine.vars.scale)/800.0)) + (msEngine.vars.center.x - (msEngine.vars.bounds.x*msEngine.vars.scale)/2.0);
		msEngine.vars.center.y = (e.pageY * ((msEngine.vars.bounds.y*msEngine.vars.scale)/460.0)) + (msEngine.vars.center.y - (msEngine.vars.bounds.y*msEngine.vars.scale)/2.0);
		msEngine.vars.scale *= 1.0/parseFloat(msEngine.vars.zoomScale+'.0');
		msEngine.vars.pixel = {x:0, y:0};
		msEngine.vars.curStep = 0;
		msEngine.vars.timer = setTimeout("msEngine.resetDraw()",100);
	},
	
	resetDraw : function(){
		if(this.vars.timer) clearTimeout(this.vars.timer);
		var sc = this.vars.gfx.screen;
		sc.fillStyle = "#000";
		sc.fillRect(0,0,sc.canvas.width,sc.canvas.height);
		this.vars.gfx.snapshot = sc.getImageData(0,0,800,460);
		this.vars.draw = true;
		this.vars.timer = setTimeout("msEngine.draw()",100);
	},
	
	zoomOut : function(){
		if(msEngine.vars.timer) clearTimeout(msEngine.vars.timer);
		msEngine.vars.scale *= msEngine.vars.zoomScale;
		msEngine.vars.pixel = {x:0, y:0};
		msEngine.vars.curStep = 0;
		this.vars.timer = setTimeout("msEngine.resetDraw()",100);
	},
	
	zoomIn : function(){
		if(msEngine.vars.timer) clearTimeout(msEngine.vars.timer);
		msEngine.vars.scale *= 1.0/parseFloat(msEngine.vars.zoomScale+'.0');
		msEngine.vars.pixel = {x:0, y:0};
		msEngine.vars.curStep = 0;
		msEngine.vars.timer = setTimeout("msEngine.resetDraw()",100);
	},
	
	reset : function(){
		if(msEngine.vars.timer) clearTimeout(msEngine.vars.timer);
		msEngine.vars.draw = false;
		msEngine.vars.scale = 1.0;
		msEngine.vars.center = {x:-0.75, y:0.0};
		msEngine.vars.pixel = {x:0, y:0};
		msEngine.vars.curStep = 0;
		var sc = msEngine.vars.gfx.screen;
		sc.drawImage($('#screen_base').get(0),0,0);
		msEngine.vars.timer = setTimeout("msEngine.draw()",100);
	},
	
	init : function(){
		//grfx init
		this.vars.gfx.screen = $('#screen_gfx').get(0).getContext('2d');
		
		//bind to mouse movement events
		$('#screen_gfx').mousemove(this.mouseMove);
		$('#screen_gfx').mouseleave(this.mouseOut);
		$('#screen').click(this.mouseClick);
		$('#zoom-out-button').click(this.zoomOut);
		$('#zoom-in-button').click(this.zoomIn);
		$('#reset-button').click(this.reset);
		
		//start timer
		this.vars.timer = setTimeout("msEngine.reset()",100);
	}
};

$(function(){
	if($.browser.msie){
		$('#iesupport').show();
	} else {
		$("#zoom-scale").slider({
			animate : 'fast',
			min : 2,
			max : 5,
			step : 1,
			value : 2,
			slide: function(event, ui) {
				msEngine.vars.zoomScale = ui.value;
				$('#zoom-scale-note').html('x'+ui.value);
			},
			change: function(event, ui) {
				msEngine.vars.zoomScale = ui.value;
				$('#zoom-scale-note').html('x'+ui.value);
			}
		});
		msEngine.init();
	}
});