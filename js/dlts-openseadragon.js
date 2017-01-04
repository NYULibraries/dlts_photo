/*
document.onreadystatechange = function () {
  if (document.readyState == "complete") {  
     var $ = jQuery;
     
     var $viewer = $(".openseadragon_viewer");
     var imgId = encodeURIComponent($viewer.data('image-source')); 
     $.get("http://loris-dev.dlts.org/loris/" + imgId + "/info.json", function(data) {
      OpenSeadragon({
        id:                 $viewer.attr("id"),
        prefixUrl:          "/sites/all/libraries/openseadragon/images/",
        preserveViewport:   true,
        visibilityRatio:    1,
        sequenceMode:       true,
        collectionMode:       true,
	collectionRows:       1, 
	tileSources: data 
    	}); 	
    });    
		
  }
}
*/
