	var nzmap = document.getElementById("nzmap"),
	prevLoc, pathDist, locName,
	si = document.getElementById("si"),
	ni = document.getElementById("ni"),
	locale = document.getElementById("locale"),
	map = document.getElementById("map"),
	description = document.getElementById("description");
	
	function pathTravel(travelPath, pathDist) {
		 travelPath.animate([
		 	{ strokeDashoffset: pathDist },
		 	{ strokeDashoffset: '0' }
		 	], {
		duration: pathDist * 5,
		fill: 'forwards'
	 	});
	}			
	
	function fillDesc(locName, desc) {
		var imageURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/",
	  	fileName = locName.split("."),
	  	longDesc = '<img src='+imageURL + locName.toLowerCase() +'.jpg srcset="'+imageURL + fileName[0].toLowerCase() +'.jpg 2x" alt>';
	  	longDesc += "<h1>"+locName+"</h1>";
	  	longDesc += "<p>"+desc+"</p>";	
	  	return longDesc;
	}
	
	nzmap.addEventListener("click", function(e) {
		var loc = e.target.parentNode;
		e.preventDefault();
		var desc = loc.querySelector("desc").textContent;
		if (loc.nodeName == "a") {	
			var locName = loc.querySelector("text").textContent;
			if (locName == "Rotorua") {
				si.classList.add("hide");
				ni.classList.add("hide");
			}
			if (locName == "Taranaki") {
				if (prevLoc == "Fiordland") {
					si.classList.add("hide");
				}
				if (prevLoc !== "Taranaki") {
					ni.classList.remove("hide");
					travelPath = ni;
					pathDist = travelPath.pathLength.baseVal;
					pathTravel(travelPath, pathDist);	
				}
	  		}
	  		if (locName == "Fiordland" && prevLoc !== "Fiordland") { 
		  		travelPath = si;
		  		travelPath.classList.remove("hide");
		  		pathDist = travelPath.pathLength.baseVal;
			  	pathTravel(travelPath, pathDist);
		  	} 
		description.classList.remove("active");  
		description.innerHTML = "";
	  	prevLoc = locName; 
	  	description.insertAdjacentHTML("afterbegin", fillDesc(locName, desc));
	  	description.classList.add("active");
	}
});

function showHide() {
		var locs = nzmap.getElementsByTagName("text"),
		descs = nzmap.getElementsByTagName("desc");
		for (var i = 0; i < locs.length; i++) {
			description.insertAdjacentHTML("afterbegin", "<div>"+fillDesc(locs[i].textContent, descs[i].textContent)+"</div>");
		}
}

var screencheck = window.matchMedia("(max-width: 790px)");
window.addEventListener("load", function() {
	if (screencheck.matches) { showHide(); }
});