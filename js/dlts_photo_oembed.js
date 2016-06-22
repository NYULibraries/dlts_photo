;YUI().use('node', 'event', 'pjax', function (Y) {
  
  'use strict';
  
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
      
      var node, 
          map, 
          next, 
          prev,
          nav_previous,
          nav_next,
          sequence, 
          sequence_count, 
          config;

      node = e.content.node;
      
      map = node.one('.dlts_image_map');
      
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

      Y.on('available', change_page, '#' + config.id, OpenLayers, config);

  };
  
  var change_page = function(config) {
      var map, service, zoom, open_layers_dlts;
      
      open_layers_dlts = OpenLayers.DLTS;

      if (Y.Lang.isObject(open_layers_dlts.pages[0], true)) {
          map =  open_layers_dlts.pages[0];
          service = map.baseLayer.url;
          zoom = map.getZoom();
          map.destroy();
          open_layers_dlts.pages = [];
      }

      if (Y.Object.isEmpty(open_layers_dlts.pages)) {
    	  open_layers_dlts.Page(config.id, config.uri, { 
              zoom: zoom,
              boxes: config.boxes,
              service: service,
              imgMetadata: config.metadata
          });
          
          Y.on('contentready', function() {
              Y.fire('openlayers:change', config);
              Y.later(3000, Y.one('.pane.load'), function() {
                  this.hide();
              });
          }, '#' + config.id);
      }
  };

function onThumbnails(e) {
  e.halt();
  
  var node = Y.one('.node.pjax')
    , dataSequence = 0
    , container = Y.one('.pjax-container')
    ;
  
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
  
  Y.one('body').delegate('click', pjax_callback, 'a.previous-page, a.next-page');
  
  Y.one('body').delegate('click', onThumbnails, 'a.thumbnails');  
  
  pjax.on('load', pjax_load);
  
  pjax.on('navigate', pjax_navigate, Y.one('.pane.load'));
  
  Y.on('contentready', function() {
      Y.later(500, Y.one('.pane.load'), function() {
          this.hide();
      });
  }, '.dlts_image_map');

});