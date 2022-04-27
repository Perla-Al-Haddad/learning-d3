
function createSVG( id ) {
    return d3.select( "#" + id )
	         .append("svg:svg");
}



function Widget() {
    this.init = function( id, buttons ) {
			if( arguments.length < 2 )
				buttons = [];
			this.id = id;
			this.svg = createSVG( this.id );
			this.controlPanel = createControlPanel( this.id, buttons, "cubic-in-out", 1000);

			
			this.coordSys = createCoordSys( this.id,0,0,128,128,15,4);
			createObject( this.coordSys );
			
			var me = this;
			
			this.controlPanel["easeOnChange"] = function() {
					plot( me.coordSys, 
						  me.controlPanel["ease"],
						  0,1 );  
				};    
			
			
			this.controlPanel["easeOnChange"]();


			return this;
		};
}

function WidgetStart( ) {
	this.init = function( id, buttons ) {
			if( arguments.length < 2 )
				buttons = [];
			WidgetStart.prototype.init.call( this, id, ["start"].concat(buttons) );
			
			var me = this;

			this.controlPanel["start"].on("click", function() {
					startTransition( me.coordSys, 
									 me.controlPanel["ease"], 
									 me.controlPanel["time"] );
				} );
			
			
			return this;
		};
}
WidgetStart.prototype = new Widget();

function WidgetStartStop( ) {
	this.init = function( id, buttons ) {
			if( arguments.length < 2 )
				buttons = [];
			WidgetStartStop.prototype.init.call( this, id, ["stop"].concat(buttons) );
			
			var me = this;

			this.controlPanel["stop"].on("click", function() {
					stopTransition( me.coordSys );
				} );
			
			return this;
		};
}
WidgetStartStop.prototype = new WidgetStart();

function WidgetStartStopResume1( ) {
	this.init = function( id, buttons ) {
			if( arguments.length < 2 )
				buttons = [];
			WidgetStartStopResume1.prototype.init.call( this, id, [ "start","pause","resume" ].concat( buttons ) );
			
			this.time = this.svg.append("svg:text")
					.attr("x",130)
					.attr("y",120)
                    .attr("T",0)
					.text("");
			
			var me = this;

            var resetTime = function() {
                me.time.attr("T",0);
            }
			
			var startTime = function( time ) {
				if( arguments.length < 1 )
					time = me.controlPanel["time"];
				me.time.transition()
					   .duration( time )
					   .ease( "linear" )
                       .attr("T",1);
			}
			
			var stopTime = function() {
				me.time.transition()
				       .duration(0);
			}
			
			var getTime = function() {
				return me.time.attr("T");
			}
			
			this.controlPanel["start"].on("click", function() {
					resetTime();
					startTime();
					startTransition( me.coordSys, 
									 me.controlPanel["ease"], 
									 me.controlPanel["time"] );
				} );

			this.controlPanel["pause"].on("click", function() {
					stopTime();
					stopTransition( me.coordSys );
				} );

			function removeChildCS() {
				me.coordSys.e.selectAll(".childs .coordsys").remove();
			}
			
			this.controlPanel["easeOnChange"] = function() {
					resetTime();
					removeChildCS();
					plot( me.coordSys, 
						  me.controlPanel["ease"],
						  0,1 );  
				};    
			
			this.controlPanel["resume"].on("click", function() {
					removeChildCS();
					var cs = createCoordSys( me.coordSys, 
									me.coordSys.x( getTime() ), 
									me.coordSys.circle.attr("cy"),
									me.coordSys.w( 1-getTime() ),
									me.coordSys.y( 1 ) - me.coordSys.circle.attr("cy"),
									0,0);
					plot( cs, me.controlPanel["ease"], 0, 1 );
					startTime( me.controlPanel["time"] * ( 1 - getTime() ) );
					resumeTransition( me.coordSys, 
									  me.controlPanel["ease"], 
									  me.controlPanel["time"],
									  getTime() );
				} );
				
			
			
			return this;
		};
}
WidgetStartStopResume1.prototype = new Widget();

function WidgetStartStopResume2( ) {
	this.init = function( id, buttons ) {
			if( arguments.length < 2 )
				buttons = [];
			WidgetStartStopResume2.prototype.init.call( this, id, [ "start","pause","resume" ].concat( buttons ) );
			
            this.time = this.svg.append("svg:text")
                    .attr("x",130)
                    .attr("y",120)
                    .attr("T",0)
                    .text("");
            
            var me = this;

            var resetTime = function() {
                me.time.attr("T",0);
            }
            
            var startTime = function( time ) {
                if( arguments.length < 1 )
                    time = me.controlPanel["time"];
                me.time.transition()
                       .duration( time )
                       .ease( "linear" )
                       .attr("T",1);
            }
            
            var stopTime = function() {
                me.time.transition()
                       .duration(0);
            }
            
            var getTime = function() {
                return me.time.attr("T");
            }
			
			function removeChildCS() {
				me.coordSys.e.selectAll(".childs .coordsys").remove();
			}

			this.controlPanel["easeOnChange"] = function() {
					resetTime();
					removeChildCS();
					plot( me.coordSys, 
						  me.controlPanel["ease"],
						  0,1 );  
				};    

			this.controlPanel["start"].on("click", function() {
					removeChildCS();
					resetTime();
					startTime();
					startTransition( me.coordSys, 
									 me.controlPanel["ease"], 
									 me.controlPanel["time"] );
				} );

			this.controlPanel["pause"].on("click", function() {
					stopTime();
					stopTransition( me.coordSys );
				} );

			
			this.controlPanel["resume"].on("click", function() {
					removeChildCS();
					var cs = createCoordSys( me.coordSys, 
									me.coordSys.x( getTime() ), 
									me.coordSys.circle.attr("cy"),
									me.coordSys.w( 1-getTime() ),
									me.coordSys.y( 1 ) - me.coordSys.circle.attr("cy"),
									0,0);
					plot( cs, resumed_ease( me.controlPanel["ease"], getTime() ), 0, 1 );
					startTime( me.controlPanel["time"] * ( 1 - getTime() ) );
					resumeTransition( me.coordSys, 
									  resumed_ease( me.controlPanel["ease"], getTime() ) , 
									  me.controlPanel["time"],
									  getTime() );
				} );
			
			return this;
		};
}
WidgetStartStopResume2.prototype = new Widget();


function createCoordSys( parentCoordSys, x, y, width, height, padding, grid ) {
    var parent;
    if( typeof(parentCoordSys) == "string" ) {
        parent = d3.select( "#" + parentCoordSys + " > svg" )
                        .append("svg:g")
                        .attr("class","flip")
                        .attr("transform",Transformation()
                                            .scale(1,-1)
                                            .translate(0,height)
                                            .translate(0.5,0.5) );
    } else {
        parent = parentCoordSys.e.select(".childs");
    }

    
    var e = parent
              .append("svg:g")
              .attr("class","coordsys")
              .attr("transform",Transformation()
                                    .translate(x,y) );
              
    var x = function(d) { 
            return Math.round( d3.scale
                  .linear()
                  .domain([0,1])
                  .range([padding,width-0.5-padding]) (d) );
        }
    var y = function(d) { 
            return Math.round( d3.scale
                  .linear()
                  .domain([0,1])
                  .range([padding,height-0.5-padding]) (d) );
        }

    if( grid > 0) {
        var steps = d3.range( 0 , 1 + ( 1 / (grid+1)), 1 / grid );
                  
        e.selectAll("line.horizontal")
            .data(steps)
            .enter().append("svg:line")
            .attr("class","horizontal")
            .attr("x1",x(0))
            .attr("x2",x(1))
            .attr("y1", y )
            .attr("y2", y )
            .attr("stroke", "#ccc");
        e.selectAll("line.vertical")
            .data(steps)
            .enter().append("svg:line")
            .attr("class","vertical")
            .attr("y1",y(0))
            .attr("y2",y(1))
            .attr("x1", x )
            .attr("x2", x )
            .attr("stroke", "#ccc");
    }
        
    e.append("svg:line")
        .attr("class", "x-axis")
        .attr("x1",x(0))
        .attr("x2",x(1))
        .attr("y1",y(0))
        .attr("y2",y(0))
        .attr("stroke", "black");
        
    e.append("svg:line")
        .attr("class", "y-axis")
        .attr("x1",x(0))
        .attr("x2",x(0))
        .attr("y1",y(0))
        .attr("y2",y(1))
        .attr("stroke", "black");

    e.append("svg:g")
     .attr("class", "childs");

        
    e.append("svg:g")
     .attr("class", "plot");

    return {
            parent: parentCoordSys,
            e: e,
            width: width,
            height: height,
            plot: e.select(".plot"),
            x: x,
            y: y,
            w: function(d) { return x(d) - x(0); },
            h: function(d) { return y(d) - y(0); }
        };
}

function createObject( coordSys ) {
    var e = coordSys.e.append("svg:g")
              .attr("class","object");
        
    coordSys.gpos = e.append( "svg:g" )
        .attr("class", "pos")
        .attr("transform", Transformation()
                            .translate( coordSys.x(0),0) );
        
    coordSys.circle = coordSys.gpos.append( "svg:circle" )
        .attr("r", 5 )
        .attr("fill", "red")
        .attr("cx", 0 )    //always zero , x position is changed by g.pos
        .attr("cy", coordSys.y(0.0) );
    
    
    
    return coordSys;
}

function createControlPanel( id, buttons, preselected_ease, preselected_time ) {
    if( typeof( preselected_ease ) == "string" ) {
        var i = preselected_ease.indexOf("-");
        preselected_ease = { 
                ease: i >= 0 ? preselected_ease.substring(0, i) : preselected_ease,
                mode: i >= 0 ? preselected_ease.substring(i + 1) : "in",
				toString: function() { return this.ease + "-" + this.mode }
            };
    }
    
    var e = d3.select( "#" + id )
                .append("form");
  
    var cp = new Object();    //cp : controlpanel
    
	cp[ "form" ] = e;
	
    for( var i in buttons ) {
        cp[buttons[i]] = e.append("input")
            .attr("type", "button")
            .attr("value", buttons[i] );
//            .attr("disabled", "disabled")
//            .on("click",function(){});
    }
    
    cp["ease"] = preselected_ease.toString();
    
    cp["select_ease"] = e.append("select");
    
    //copied from d3.js
    var d3_ease = {
      linear: 0,
      quad: 2,
      cubic: 3,
      sin: 4,
      exp: 5,
      circle: 6,
      elastic: 7,
      back: 8,
      bounce: 9
    };
    for( ease in d3_ease ) {
        var o = cp["select_ease"].append("option")
                                 .text(ease);
                                
        if( preselected_ease.ease == ease ) {
            o.attr("selected","selected");
        }
            
    }

    cp["select_mode"] = e.append("select");
    
    var d3_ease_mode = {
      "": 0,
      "in": 1,
      "out": 2,
      "in-out": 3,
      "out-in": 4
    };
    for( mode in d3_ease_mode ) {
        var o = cp["select_mode"].append("option")
                                 .text(mode);
        if( preselected_ease.mode == mode ) {
            o.attr("selected","selected");
        }
    }
    
    var onchange = function() {
            var se = cp["select_ease"].node();
            var sm = cp["select_mode"].node();
            var st = cp["select_time"].node();
            var ease = se.options[ se.selectedIndex ].value;
            var mode = sm.options[ sm.selectedIndex ].value;
            var time = st.options[ st.selectedIndex ].value;
            
			if( cp["ease"] != ease + ( mode == "" ? "" : "-" + mode ) ) {
				cp["ease"] = ease + ( mode == "" ? "" : "-" + mode );
				if( typeof(cp["easeOnChange"]) == "function" ) {
					cp["easeOnChange"]();
				}
			}
			
			cp["time"] = time;
        };
		
	cp["time"] = preselected_time;
		
    cp["select_time"] = e.append("select");
	var times = [500,1000,2500,5000];
    for( var i in times ) {
        var o = cp["select_time"].append("option")
                                 .text(times[i]);
        if( preselected_time == times[i] ) {
            o.attr("selected","selected");
        }
	}
    cp["select_mode"].on("change", onchange);
    cp["select_ease"].on("change", onchange);
    cp["select_time"].on("change", onchange);
    
    
    
    return cp;
}

function startTransition( coordSys, ease, time ) {
    if( arguments.length < 2)
        ease = "cubic-in-out";
    var gpos = coordSys.e.select( "g.pos" );
    
    gpos.attr("transform", Transformation()
                            .translate( coordSys.x(0),0) );
    gpos.transition()
        .duration( time )
        .ease( "linear" )
        .attr("transform", Transformation()
                            .translate( coordSys.x(1),0) );
    
    var c = gpos.selectAll("circle");
    
    c.attr("cy",coordSys.y(0));
    c.transition()
        .duration( time )
        .ease( ease )
        .attr("cy",coordSys.y(1));
    
    
}

function stopTransition( coordSys ) {
    var gpos = coordSys.e.select( "g.pos" );
    
    gpos.transition()
        .duration( 0 );;
    
    var c = gpos.selectAll("circle");
    
    c.transition()
        .duration( 0 );
    
    
}

function resumeTransition( coordSys, ease, time, elapsed ) {
    if( arguments.length < 2)
        ease = "cubic-in-out";
    var gpos = coordSys.e.select( "g.pos" );
    
	var timeTodo = time * ( 1 - elapsed );
	
//    gpos.attr("transform", Transformation()
//                            .translate( coordSys.x(elapsed),0) );
    gpos.transition()
        .duration( timeTodo )
        .ease( "linear" )
        .attr("transform", Transformation()
                            .translate( coordSys.x(1),0) );
    
    var c = gpos.selectAll("circle");
    
//    c.attr("cy",coordSys.y(0));
    c.transition()
        .duration( timeTodo )
        .ease( ease )
        .attr("cy",coordSys.y(1));
    
    
}


function delayedEase( ease, x_ ) {

    var d3_ease = d3.ease(ease);
    var x = d3.scale
              .linear()
              .domain([0,1])
              .range([paused,1]) 
              ( x_ );
               
    return d3.scale
             .linear()
             .domain([ d3_ease(paused), 1])
             .range([0,1]) 
             ( d3_ease( x ) );

}

function resumed_ease( ease, elapsed ) {
    var y = typeof ease == "function" ? ease : d3.ease.call(d3, ease);
    return function( x_resumed ) {
        var x_original = d3.scale
                        .linear()
                        .domain([0,1])
                        .range([elapsed,1])
                        ( x_resumed );
        return d3.scale
                 .linear()
                 .domain([ y(elapsed), 1 ])
                 .range([0,1])
                 ( y ( x_original ) );
    };
}

function plot( coordSys, ease, xbegin, xend ) {
    if( arguments.length < 4 ) {
        xend = 1;
    }
    if( arguments.length < 3 ) {
        xbegin = 0;
    }
    var ix = d3.scale
              .linear()
              .domain([coordSys.x(0),coordSys.x(1)])
              .range([0,1]);
    
    function point( x ) {
        var y = typeof ease == "function" ? ease : d3.ease.call(d3, ease);
        return {
            x: coordSys.x( ix ( x ) ),
            y: coordSys.y( y ( ix ( x ) ) ),
            toString: function() { return this.x + " " + this.y; }
        };
    }
    var points = d3.range(coordSys.x(xbegin),coordSys.x(xend),1);
    points.push(coordSys.x(xend));
    points = points.map( point );
    
    var path = "M" + points.join(" L");
        
    var data = [path];
    
    var e =coordSys.plot;
    
    e.selectAll( "path" )
        .data( data )
        .enter().append("svg:path")
        .attr("d",function(d){ return d; });
        
    e.selectAll( "path" )
        .data( data )
        //.update()
        .attr("d",function(d){ return d; });
        
    e.selectAll( "path" )
        .data( data )
        .exit().remove();
}

function main() {


	var w1 = new WidgetStart()
				.init( "transition_example" );
				
	var w2 = new WidgetStartStop()
				.init( "transition_example_stop" );
				
	var w3 = new WidgetStartStopResume1()
				.init( "transition_example_stop_resume" );
	var w4 = new WidgetStartStopResume2()
				.init( "transition_example_stop_properresume" );
	

/*
    createSVG("transition_example");
    
    var cp = createControlPanel("transition_example", ["start"], "cubic-in-out", 1000);

    
    var cs = createCoordSys("transition_example",0,0,128,128,15,4);
    createObject( cs );
    
    cp["easeOnChange"] = function() {
			plot( cs, cp["ease"],0,1 );  
		};    
	
	cp["start"].on("click", function() {
			startTransition( cs, cp["ease"], cp["time"] );
		} );
	
	cp["easeOnChange"]();
	
	
	createSVG("transition_example_stop");
    var cp2 = createControlPanel("transition_example_stop", ["start","stop"], "cubic-in-out", 1000);

    
    var cs2 = createCoordSys("transition_example_stop",0,0,128,128,15,4);
    createObject( cs2 );
    
    cp2["easeOnChange"] = function() {
			plot( cs2, cp2["ease"],0,1 );  
		};    
	
	cp2["start"].on("click", function() {
			startTransition( cs2, cp2["ease"], cp2["time"] );
		} );
	cp2["stop"].on("click", function() {
			stopTransition( cs2 );
		} );
	
	cp2["easeOnChange"]();
	
	
	
//    plot( cs, "cubic-in-out",0,0.5 );
    
//    startTransition( cs, "cubic-in-out" );
    
//    d3.select("#transition_example .start").on("click", function(node) { startTransition( cs, "cubic-in-out"); } );
    
    
  /*  var cs2 = createCoordSys(cs,cs.x(0.5),cs.y(0.5),
                cs.w(0.5),cs.h(0.5),0,0);
    plot( cs2, resumed_ease("cubic-in-out",0.5) );
//    plot( cs2, "cubic-in-out");
    */
    return;
}

