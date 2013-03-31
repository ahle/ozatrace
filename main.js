/**
 * loadResource.
 * @param type 	type of resource.
 * @param src 	source of resource.
 */
function loadResource(type,src,pos){
	var res = false;
	if(type=='js'){
		res = document.createElement('script');
		res.type = "text/javascript";
		res.src = src;
		//res.onload = callback1;
	} else if(type=='css'){
		res = document.createElement('link');
		res.rel = "stylesheet";
		res.href = src;
	}
	
	if(res){
		if(pos=="ebody"){
			document.body.appendChild(res);
		}
		else{
			document.getElementsByTagName('head')[0].appendChild(res);
		}
	}
	else{
		console.log("The resource is not loaded!");
	}	
}

if (typeof trace === 'undefined') {
	trace = {};
}

var buff = {};
var buff_seq = 0;

trace.StartUI = function (container){
	this.container = container;
	this.icon = null;
	this.active = false;
	this.visualisationUI = false;
	
	this.open = open;
	open = function(){
		
	};
	
	node = document.createElement("input");
	node.type = 'button';
	node.id = 'traceicon';
	node.value = 'Trace';
	node.setAttribute('class','btn btn-primary');
	startUI = this;	
	this.container.appendChild(node);
	node.onclick = function(){
		//alert("click");
		
		if(!startUI.visualisationUI){
			startUI.visualisationUI = new trace.VisualisationUI();
		} else{
			startUI.visualisationUI.show();
		}
	};
	this.node = node;
};

trace.VisualisationUI = function(){
	this.autoOpen = true;
	this.timeline = null;
	
	var modal = new trace.Modal();
	modal.createModal();
	this.modal = modal;
	
	if(this.autoOpen){				
		modal.setModal("Trace", function(){});
		modal.show();		
	}
	this.close = function(){
		//alert("close");
	};
	this.show = function(){
		modal.show();
	};
	
};

/**
 * Created by Hoang, SILEX
 */
// loading scritps and styles
var ozatrace_prefix = window.location.protocol + "//" + window.location.host + "/ozalid/";


trace.Modal = function(){
	this.modal = null;
	
	this.createModal = function (){
		var dialog 
				= '<div id="traceModal" class="modal hide fade" style="width:80%; min-width:200px">';
	    dialog += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3></h3></div>';
	    dialog += '<div class="modal-body" style="padding: 5px"><select id="tick1" style="display:none"> '
	    	+'<option value="0">1 day</option> '
	    	+'<option value="1">4 hours</option> '
	    	+'</select><center><div id="chart1"></div></center></div>';
	    dialog += '<div class="modal-footer"><button class="btn btn-primary callback-btn" data-dismiss="modal">Close</button></div></div>';	    
	    $('body').append(dialog);
	    
	    var btPanForward = '<button id="pan_forward" class="btn">Pan Forward </button>';
		var btPanBackward = '<button id="pan_backward" class="btn">Pan Backward </button>';
		var btZoomIn = '<button id="zoom_in" class="btn">Zoom In </button>';
		var btZoomOut = '<button id="zoom_out" class="btn">Zoom Out </button>';
		var gButtonLayout = '<div class="btn-group pull-right">&content</div>';
		var gButton = [btPanBackward, btPanForward, btZoomIn, btZoomOut].join("");
		var btnGroup = gButtonLayout.replace("&content", gButton);
		
		
	    
	    this.node = $("#traceModal")[0];
	};
	
	this.setModal = function (header, text, callback) {
	    $(this.node)
	      .find('.modal-header > h3').text(header).end()
	      //.find('.modal-body').text(text).end()
	      .find('.callback-btn').off('click.callback')
	        .on('click.callback', callback);
	  };
	this.show = function(){
		$(this.node).modal('show');
		if($("#chart1").children().size()==0){
			var chart = new trace.Chart();
		}
	};
};

trace.KtbsSync = function(server_bk_url, trace_uri,model_uri){
	this.trace_uri = trace_uri;
	this.model_uri = model_uri;
	this.server_bk_url = server_bk_url;
	
	this.getObselSet = function(){
		var obsels = JSON.parse(localStorage["obselset"]);
		return obsels;
	};
	
	this.saveObselSet = function(obselset){
		localStorage["obselset"] = JSON.stringify(obselset);// save
	};
	
	this.deleteObsel = function(id){
		var obsels = this.getObselSet();
		delete obsels[id];
		this.saveObselSet(obsels);
		console.log("delete obs["+id+"].");
	};
	
	this.add2buff = function(item){
		buff_seq++;
		buff[buff_seq] = item;
	};
	
	this.checkBuff_deleteObsel = function(id){
		var all_ok = true;
		var keys = [];
		// check
		for(var i in buff){
			var item = buff[i];
			if(item["id"]==id){
				if (item["status"] == "sent"){					
					keys.push(i);
				}
				else{
					all_ok = false;
					break;
				}
			}
		}
		// delete
		if(all_ok && keys.length>0){
			for(var i in keys){
				delete buff[i];
			}
			this.deleteObsel(id);
		}
	};
	
	this.obsel2buff = function(){
		var sync = this;
		var newobsels = [];
		var obsels = this.getObselSet();
		
		for(var i in obsels){
			var obsel = obsels[i];
			var id = obsel["id"];
			var exist = false;
			for(var key in buff){
				var item = buff[key];
				if(item["id"]==id && item["url"]==this.server_bk_url){
					exist = true;
					break;
				}
			}
			if(exist===false){
				//item["lc_index"] = index;// marker for retrieving the item in localStorage
				var sent1 = {"id": id, "url": this.server_bk_url, "status": "new"};
				var sent2 = {"id": id, "url": this.trace_uri, "status": "new"};
				
				sync.add2buff(sent1);
				sync.add2buff(sent2);
			}			
		}
		return;
	};
	
	this.toTurtle = function(item){
		
	};
	
	this.send = function(){
		this.obsel2buff();
		var obsels = this.getObselSet();
		var is_get = false;// hack for cors request of https
		
		
		
		for(var i in buff){
			var item = buff[i];
			if(item["status"] == "new"){
				var id = item["id"];
				var obsel = obsels[id];
				
				if(item["url"]==this.server_bk_url){
					this.post2server(item,obsel);
				}
				if(item["url"]==this.trace_uri){
					if(!is_get){// hack for cors request of https
						//an head request is pre-sent for POST CORS requests
						$.ajax({
							type: "HEAD",
							url: this.trace_uri,
							async:false,
							success: function(date){
								console.log("HEAD before POST to ktbs");
							}
						});
					}
					
					var obsel_in_turle = this.toTurtle(obsel);
					this.post2ktbs(item,obsel_in_turle);
				}
			}
		}
	};
	
	this.post2server = function (item,obsel) {
		var id = obsel["id"];
		var sync = this;
		// post to server
		$.post(this.server_bk_url, {'obsel': JSON.stringify(obsel), 'id': id}, function(ret){
			if (ret == "ok"){
				item["status"] = "sent";
				sync.checkBuff_deleteObsel(id);
				console.log("I: obs["+id+"] is sent to server");
			}
			else{
				item["status"] = "new";
				console.log("E: obs["+id+"] cannot be sent to server. => "+ret);
			}
		});
		item["status"] = "pending";
	};
	
	this.post2ktbs = function(item,obsel){
		var obsel = obsel;
		var ctype = "text/turtle";
		var id = item["id"];
		var sync = this;
				
		// post to ktbs
		$.ajax({
			url: this.trace_uri,
			type: 'POST',
			data: obsel,
			contentType: ctype,
			crossDomain: true,
			success: function(ret){
					item["status"] = "sent";
					sync.checkBuff_deleteObsel(id);
					console.log("I: obs["+id+"] is sent to ktbs");
				},
			error: function(){
					item["status"] = "new";
					console.log("E: obs["+id+"] cannot be sent to ktbs.");
				}
		});
		item["status"] = "pending";
		
	};

	this.postMany2ktbs = function(obselset){
		
		
		
		
	};
};

trace.Turtle.stringify = function(ktbsobsel){
	var id = ktbsobsel["id"];
	
	var prefixes = [];
	prefixes.push("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .");
	prefixes.push("@prefix ktbs: <http://liris.cnrs.fr/silex/2009/ktbs#> .");
	prefixes.push("@prefix : <"+ktbsobsel["model_uri"]+"> .");
	
	var statements = [];
	statements.push("<"+id+"> a <"+ktbsobsel["type"]+">.");
	statements.push("<"+id+"> ktbs:hasTrace <> .");
	statements.push("<"+id+"> ktbs:hasSubject \""+ktbsobsel["subject"]+"\" .");
	statements.push("<"+id+"> ktbs:hasBeginDT \""+ktbsobsel["begin"]+"\"^^xsd:dateTime .");
	statements.push("<"+id+"> ktbs:hasEndDT \""+ktbsobsel["end"]+"\"^^xsd:dateTime .");
	
	// TODO
	
	return prefixes.join("\n")+"\n"+statements.join("\n");
};

trace.obsel = function(ddfd){
	
};

trace.ktbs_obsel = function(ddfd){
	this.id = 1;
};

// store
trace.Store = function(){	
	
	this.loadWindowId = function(window){//default: window
		return window.name;
	};
		
	this.saveWindowId = function(windowid,window){// default: window
		window.name = windowid;
	};
	
	this.makeWindowId = function(){
		return "W"+(new Date()).getTime();
	};
	
	this.loadCurrentWindowId = function(){
		return this.loadWindowId(window);
	};
	
	this.loadUserId = function(cookie){// default: document.cookie
		var parts = cookie.replace(" ","").split(";");
		for(var i=0;i<parts.length;i++){
			var ck = parts[i].replace(" ","").split("=");
			if(ck[0].replace(" ","")==="UserID"){
				return ck[1].replace(" ","");
			}
		}
	};
	
	this.saveUserId = function(userid,cookie){// default: document.cookie
		var userid = (new Date()).getTime();
		document.cookie += "; UserID="+userid;
	};
};
trace.Store.make_store = function(windowid,userid){
	var store = new trace.Store();
	store.windowid = windowid;
	store.userid = userid;
	return store;
};

// localstore

trace.LocalStore = function(windowid,userid){
	//this.windowid = getCurrentWindowId();
	//this.userid = getCurrentUserId();
	//this.model = loadModel();
	
	function parse_localstorage(name){
		ret = false;
		try{
			ret = JSON.parse(localStorage[name]);
		} catch(e){
			console.log("cannot parse localStorage["+name+"]");
		}
		return ret;
	}
	
	function makeId(windowid,userid){
		return windowid && userid ? "S"+windowid.substr(1)+userid+(new Date()).getTime() : false;
	}
	
	function getId(){
		for(var name in localStorage){
			if(name^= "S"){
				if (checkStore(name,this.windowid,this.userid)) return name;
			}
		}
		return makeId(this.windowid,this.userid);
	};
	
	function loadModal(storeid){
		this.model = parse_localstorage(storeid);
	};
	
	function checkStore(storeid,windowid,userid){
		var store = parse_localstorage(storeid);		
		return store && store["windowid"] == windowid && store["userid"] == userid;
	}
	
	function saveModel(storeid,model){
		try{
			localStorage[storeid] = JSON.stringify(model);// save
		} catch(e){
			console.log("cannot save obsels into localStorage");
		}
	};
	
	function getCurrentUserId(){
		var parts = document.cookie.replace(" ","").split(";");
		for(var i=0;i<parts.length;i++){
			var ck = parts[i].replace(" ","").split("=");
			if(ck[0].replace(" ","")==="UserID"){
				return ck[1].replace(" ","");
			}
		}
		var userid = (new Date()).getTime();
		document.cookie += "; UserID="+userid;
		
		return userid;
	}
	
	function getObselById(id){
		// TODO
	}
	
	function getObselSet(){
		var obsels = JSON.parse(localStorage["obselset"]);
		return obsels;
	};	
	
	function deleteObsel(id){
		delete this.obsels[id];
		console.log("delete obs["+id+"].");
		this.saveObsels();		
	};
	
	
	//this.id = getId();
	
};
trace.LocalStore.prototype = new trace.Store();

// trace.Job
trace.Job = function(func,interval){
	
	this.running = true;
	//this.func = func;
	this.stop = function(){
		this.running = false;
	};
	
	this.run = function(){
		console.log("run job");		
		func();
		var a = this;
		setTimeout(function() {a.run();},interval);
	};
};

trace.Chart = function(){
	//var start = new Date(new Date("2013-02-25T19:51:38.777Z") - 1200195068*0.2);
	var timeticks = [[d3.time.days,1,"%Y-%b-%d"],[d3.time.hours,4,"%Y-%b-%d %H"]];
	
	function x(d){
		var date = new Date(d["begin"]);
		return date;
	}
	function y(d){
		if(d["@type"]=="click"){
			return "click";
		}else {
			return "keyevent";
		}
	}

	function radius(d){	return 10;}
	function color(d){ return "green";}
	function symbol(d){
		if(d["@type"]=="click"){
			return "circle";
		}else {
			return "square";
		}
	}

	var margin = {top: 5.5, right: 19.5, bottom: 80, left: 60};
	var win_width = window.outerWidth;
	var bd = $('#traceModal >.modal-body').css("max-height","none").get(0);
	console.log(bd.clientWidth);
	var width = Math.max(Math.floor(document.body.clientWidth*0.7) - margin.left - margin.right - 20, 200), 
		height = Math.max(bd.clientHeight - margin.top - margin.bottom - 20, 320);
	var modal_width = $('#traceModal').width();
	var margin_left = modal_width <= 480 ? -Math.floor((modal_width)/2) : -Math.floor((modal_width)/2);
	$('#traceModal').css("left","50%").css("margin-left", margin_left+"px");
	
	
	var xs = [];
	//d3.json("obselset.json", function(obselset) {
		
	//});
	//console.log(xs);
	var xScale = d3.fisheye.scale(d3.time.scale).domain([new Date(), new Date()]).range([0, width]),
    yScale = d3.scale.ordinal().domain(["click", "keyevent"]).range([height - 50, height - 100]);
    
    //radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]),
    //colorScale = d3.scale.category10().domain(["Sub-Saharan Africa", "South Asia", "Middle East & North Africa", "America", "Europe & Central Asia", "East Asia & Pacific"]);
	
	// The x & y axes.
	  var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(d3.time.days,1).tickFormat(d3.time.format("%Y-%b-%d")).tickSubdivide(5).tickSize(-20,-10,0),
	      yAxis = d3.svg.axis().scale(yScale).orient("left").tickPadding(10).tickSize(-width);
	
	// Create the SVG container and set the origin.
	  var svg = d3.select("#chart1").append("svg")
	      .attr("width", width + margin.left + margin.right)
	      .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	// Add a background rect for mousemove.
	  svg.append("rect")
	      .attr("class", "background")
	      .attr("width", width)
	      .attr("height", height);

	// Add the x-axis.
	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);
	// Add the y-axis.
	  svg.append("g")
	      .attr("class", "y axis")
	      //.attr("transform", "translate(0," + width + ")")
	      .call(yAxis);	
      
	  
	  //
	  //d3.json("http://localhost/ozalid/trace/obselset.json", function(obselset) {
	  d3.json("https://dsi-liris-silex.univ-lyon1.fr/base1/t01/@obsels.json", function(obsel_in_json) {
		  // var obsel_dict = JSON.parse(localStorage["obselset"]);
		   //var obselset = [];
		   //for (var k in obsel_in_json){
		  //	  obselset.push(obsel_in_json[k]);
		  // };
		  var obselset = obsel_in_json["obsels"];
		  
		  
		  var xs = d3.extent(obselset, function(d){
					return new Date(d["begin"]);
				});
			console.log(xs);
			xScale = xScale.domain(xs).range([0, width]);
			xAxis = xAxis.scale(xScale);
			svg.select(".x.axis")
				.call(xAxis)
				.selectAll("text")
					.attr("transform", "translate(-10,30) rotate(-65)");
			
		    // Add a dot per nation. Initialize the data at 1800, and set the colors.
		    var dot = svg.append("g")
		        .attr("class", "dots")
		      .selectAll(".dot")
		        .data(obselset)
		      .enter().append("svg:path")
		        .attr("class", "dot")
		        .attr("d",d3.svg.symbol().type(function(d){return symbol(d);}).size(128))
		        .style("fill", function(d) { return color(d); })
		        .call(position);
		        //.sort(function(a, b) { return radius(b) - radius(a); });

		    // Add a title.
		    dot.append("title")
		        .text(function(d) { 
					
			        return d["start"]; 
			});

		    // Positions the dots based on data.
		    function position(dot) {
		      dot.attr("transform", function(d) { return "translate("+xScale(x(d))+","+yScale(y(d))+")"; });
		          
		    }

		    svg.on("mousemove", function() {
		   	  //console.log(d3.mouse(this)[0]);
			  var mouse = d3.mouse(this);
		      
		      xScale.distortion(2).focus(mouse[0]);
		      //yScale.distortion(2).focus(mouse[1]);

		      dot.call(position);
		      svg.select(".x.axis").call(xAxis);
		      svg.select(".y.axis").call(yAxis);
		    });
	  });
	  
//	  var tick1 = document.getElementById("tick1");
//	  tick1.addEventListener("change",function(){
//			//console.log(xAxis);
//			var index = this.value;
//			xAxis = xAxis.ticks(timeticks[index][0],timeticks[index][1]).tickFormat(d3.time.format(timeticks[index][2]));
//			svg.select(".x.axis").call(xAxis).selectAll("text")
//			.attr("transform", "translate(-10,30) rotate(-65)");
//	  });
};
    
$(document).ready(function(){
	
	// append trace icon
	var btn_container = $("div[class='container']").find("div[class='nav-collapse collapse']")[0];
	//var btn_container = document.body;
	var start = new trace.StartUI(btn_container);
	//$("#traceicon").click();
	
	var sync = new trace.KtbsSync("https://localhost/ozalid/trace/srv/index.php","https://dsi-liris-silex.univ-lyon1.fr/base1/t01/","https://dsi-liris-silex.univ-lyon1.fr/base1/model1/");
	var job = new trace.Job(function(){ sync.send();}, 30000);
		job.run();
	//});
	//sync.send();	
});

