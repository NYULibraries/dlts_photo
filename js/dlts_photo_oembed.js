;YUI().use('node', 'event', 'event-custom', 'pjax', 'gallery-soon', 'io', 'json-parse', 'promise', 'crossframe', function (Y) {

  'use strict';

  /** set a X-PJAX HTTP header for all IO requests */
  /** not sure if we need this but it does require setting some headers on the LORIS server */ 
  Y.io.header('X-PJAX', 'true');

  var html = Y.one('html');
  var os = OpenSeadragon({
		 id:   "openseadragon-viewer",
		 prefixUrl:          "/sites/all/libraries/openseadragon/images/",
		preserveViewport:   true,
		visibilityRatio:    1,
		 sequenceMode:      false,
		  tileSources: [] 
	});


 
 function openseadragonTilesLoading() {
    if (Y.one('body').hasClass('openseadragon-loading')) {
      Y.later(500, window, openseadragonLoading, [], false);
    }
    else {
      Y.one('.pane.load').hide();
    }
  }

  function fullscreenOn(e) {
      var docElm = document.documentElement;
      var metadata = Y.one('.pagemeta');
      var top = Y.one('.top');
      var button = Y.one('#button-metadata');
      if (button) {
    	button.removeClass('on');
      }
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      }
      else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
      else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      }
      else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      }
      if (top) {
        top.addClass('hidden');
      }
      Y.CrossFrame.postMessage("parent", JSON.stringify({fire: 'button:button-fullscreen:on'}));
  }

  function fullscreenOff(e) {
      var fullscreenButton = Y.one('a.fullscreen');
      var top = Y.one('.top');
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      if (fullscreenButton) {
        fullscreenButton.blur();
      }
      if (top) {
        top.removeClass('hidden');
      }
      Y.CrossFrame.postMessage("parent", JSON.stringify({fire: 'button:button-fullscreen:off'}));
  }

  var embedded = window.self !== window.top;

  if (embedded) {
    window.addEventListener('message', function(event) { console.log(event); }, false);
  }

  /** pjax object */
  var pjax = new Y.Pjax({ container: '.pjax-container' });

  /** pjax callback can be call by clicking a pjax enable link or by reference with data-url */
  var pjax_callback = function(e) {
      e.preventDefault();
      var url;
      /** if this has referenceTarget, then this event was trigger by reference*/
      if (Y.Lang.isObject(e.referenceTarget, true)) {
          url = e.referenceTarget.getAttribute('data-url');
      }
      /** trigger by a pjax enable link */
      else {
          url = this.get('href');
      }
      pjax.navigate(url);
  };

  var pjax_load = function(e) {
      var node, map, next, prev, nav_previous, nav_next, sequence, sequence_count, config;
      node = e.content.node;
      map = node.one('.openseadragon-data');
      next = node.one('.next-page');
      prev = node.one('.previous-page');
      sequence = parseInt(node.getAttribute('data-sequence'), 10);
      sequence_count = parseInt(node.getAttribute('data-sequence-count'), 10);
      nav_previous = Y.one('.navbar .previous-page');
      nav_next = Y.one('.navbar .next-page');
      if (!prev) {
          prev = node.one('.previous-page-off');
      }
      if (!next) {
          next = node.one('.next-page-off');
      }
      if (!nav_previous) {
          nav_previous = Y.one('.navbar .previous-page-off');
      }
      if (!nav_next) {
    	  nav_next = Y.one('.navbar .next-page-off');
      }
      nav_previous.replace(prev.cloneNode(true));
      nav_next.replace(next.cloneNode(true));
      /** Configuration for the new map */
      config = {
          id: map.get('id'),
          title: node.getAttribute('data-title'),
          node: map,
          boxes: [],
          sequence: node.getAttribute('data-sequence'),
          uri: map.getAttribute('data-uri'),
          metadata: {
              width: map.getAttribute('data-width'),
              height: map.getAttribute('data-height'),
              levels: map.getAttribute('data-levels'),
              dwtLevels: map.getAttribute('data-dwtlevels'),
              compositingLayerCount: map.getAttribute('data-compositing-layer')
          }
      };
      Y.on('available', change_page, '#' + config.id, this, config);
  };

  
  function init_viewer(viewEl) {
	var uuid = viewEl.getAttribute("data-image-source");
	Y.Promise(function (resolve, reject) {
	    Y.io("http://loris-dev.dlts.org/loris/" + encodeURIComponent(uuid) + "/info.json", {
		on: { 
		  success : function(tx,r) { 
			 try { 
				resolve( Y.JSON.parse(r.responseText) );
			 }
			 catch (e) { alert("JSON issue with LORIS" + e); return; }	
		  }
		} 
      })
	}).then( function(manifest) { 
   		os.open(manifest);
	        openseadragonTilesLoading();	
      }); 

   }
  
  var change_page = function(config) {
	init_viewer(config.node);	
  }
  
  function onThumbnails(e) {

    e.halt();
    var node = Y.one('.node.pjax');
    var dataSequence = 0;
    var container = Y.one('.pjax-container');
    if (node) {
      dataSequence = Math.round(parseInt(node.getAttribute('data-sequence'), 10) /20);
    }
    else if (container) {
      dataSequence = Math.round(parseInt(container.getAttribute('data-sequence'), 10) /20);
    }
    location.href = e.currentTarget.get('href') + '?page=' + dataSequence
  }

  var pjax_navigate = function(e) {
      this.addClass('loading');
      this.show();
  };

  function on_button_click(e) {
      e.preventDefault();
      var self = this;
      var current_target = e.currentTarget;
      var event_prefix;
      var event_id;
      var node_target;
      var data_target;
      /** don't waste time if the button is inactive */
      if (current_target.hasClass('inactive')) return;
      /** if current target has target, get target from data-target */
      if (current_target.hasClass('target')) {
        data_target = self.getAttribute('data-target');
        event_prefix = 'button:' + data_target;
        /** look-up for the main target */
        node_target = Y.all('#' + data_target);
      }
      /** current target is the main target */
      else {
        event_id = self.get('id');
        event_prefix = 'button:' + event_id;
        /** find possible reference targets to this target */
        node_target = Y.all('a[data-target=' + event_id + ']');
      }
      if (self.hasClass('on')) {
        self.removeClass('on');
        if (Y.Lang.isObject(node_target)) {
          node_target.each(function(node) {
            node.removeClass('on');
          });
        }
        Y.fire(event_prefix + ':off', e);
      }
      else {
        self.addClass('on');
        if (Y.Lang.isObject(node_target)) {
          node_target.each(function(node) {
            node.addClass('on');
          });
        }
        Y.fire(event_prefix + ':on', e);
      }
      Y.fire(event_prefix + ':toggle', e);
  }

  Y.one('body').delegate('click', pjax_callback, 'a.previous-page, a.next-page');

  Y.one('body').delegate('click', onThumbnails, 'a.thumbnails');

  pjax.on('load', pjax_load);

  pjax.on('navigate', pjax_navigate, Y.one('.pane.load'));

  Y.on('button:button-fullscreen:on', fullscreenOn);

  Y.on('button:button-fullscreen:off', fullscreenOff);

  html.delegate('click', on_button_click, 'a.button');

  Y.soon(openseadragonTilesLoading);

  Y.Promise(function (resolve, reject) {
	var reasonForFailure = new Error('unable to get manifest');	
        var viewEl = Y.one(".openseadragon-data");
	var manifest = init_viewer(viewEl); 
	resolve(manifest);
  });  


});
