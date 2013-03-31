
if (typeof trace === 'undefined') {
	trace = {};
}

trace.ObselSet = function(){
	
};

trace.ObselSet.generateObselId = function(){
	var id = "o"+(new Date()).getTime() + Math.floor(Math.random()*1000);
	return id;
};

trace.ObselSet.click = function(e){
	var obselset = {};
	try {
		obselset = JSON.parse(localStorage["obselset"]);
	} catch(e){}
	
	var id = trace.ObselSet.generateObselId();
	
	var obsel = {
	"id" : id,
	"type": "click",
	"start": new Date(),
	"subject": "undefined",
	"content": 	"element id = '" + e.target.id + "', " 
				+ "element_name = '" + e.target.nodeName + "'" 		
	};
	
	obselset[id] = obsel;
	localStorage["obselset"] = JSON.stringify(obselset);
	console.log("save obsel[id='"+id+"',type='"+obsel["type"]+"']");
};

$(document).ready(function(){
	setTimeout(function(){$("td,input,button,a").click(function(e){
		trace.ObselSet.click(e);
	});},1000);
	
	
	$("input,textarea").keypress(function(e){		
		var keyCode = (e.keyCode ? e.keyCode : e.which);
				
		var obselset = {};
		try {
			obselset = JSON.parse(localStorage["obselset"]);
		} catch(e){}
		
		var id = trace.ObselSet.generateObselId();
		
		var obsel = {
		"id" : id,
		"type": "keypress",
		"start": new Date(),
		"subject": "undefined",
		"content": 	"keycode = '" + keyCode + "', " 
					+ "charCode = '" + e.charCode + "'"
		};
		
		obselset[id] = obsel;
		localStorage["obselset"] = JSON.stringify(obselset);
		console.log("save obsel[id='"+id+"',type='"+obsel["type"]+"']");
	});
});

// window.onkeypress = function dokeypress(e){
	
// };
	
// window.onclick = function doclick(e){
	// console.log("onclick");
	
	// var obselset = [];
	// if (localStorage["obselset"]==undefined){
		// localStorage["obselset"] = [];
	// }
	// else{
		// obselset = JSON.parse(localStorage["obselset"]);
	// }
	
	// var obsel = {
	// "type": "click",
	// "start": new Date(),
	// "content": 	"element id = '" + e.target.id + "', " 
				// + "element_name = '" + e.target.nodeName + "'" 		
	// }
	
	// obselset.push(obsel);
	// localStorage["obselset"] = JSON.stringify(obselset);
	// console.log("save localStorage");
// };	