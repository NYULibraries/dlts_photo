<?php

/**
 * Unset meta variable in the header that are part of the core.
 */
function dlts_photo_html_head_alter(&$head_elements) {
  $head_elements = array();
}

function dlts_photo_preprocess_node(&$vars) {
  /** Include utilities files */
  module_load_include('inc', 'dlts_utilities', 'inc/dlts_utilities.photograph') ;
  switch ( $vars['type'] ) {
    case 'dlts_photograph' :
      /** Set the template based on the view type */
      switch( $vars['view_mode'] ) {
        case 'gallery':
          $vars['theme_hook_suggestions'][] = 'node__' . 'dlts_photograph' . '__gallery';
          break;
        /** Use node--photo-or-gallery.tpl.php for dlts_photograph and dlts_photo_set */
        case 'full':
          if ( dlts_utilities_is_pjax() ) {
            $vars['theme_hook_suggestions'][] = 'node__' . 'dlts_photograph_pjax';
          }
          else {
            $vars['theme_hook_suggestions'][] = 'node__' . 'dlts_photograph';
          }
          /** Node object */
          $node = $vars['node'];
          /** We hide the comments */
          hide($vars['content']['comments']);
          /** We hide the links */
          hide($vars['content']['links']);
          $vars['firstpage'] = $vars['node']->firstpage;
          $vars['prevpage'] = $vars['node']->prevpage;
          $vars['nextpage'] = $vars['node']->nextpage;
          $vars['lastpage'] = $vars['node']->lastpage;
          $vars['node']->photo_set_title = '';
          /** Look up the Photo Set ID */
          $items = field_get_items('node', $vars['node'], 'field_photo_set');

          if (isset($items[0]['node'])) {
            $vars['photo_set_nid'] = $items[0]['node']->nid;
            $vars['node']->photo_set_title = $items[0]['node']->title;
          }
          elseif (isset($items[0]['nid'])) {
            $vars['photo_set_nid'] = $items[0]['nid'];
          }

          /** Photo identifier */
          $identifier = dlts_utilities_photograph_page_get_identifier($node);

          /** Look up the Photo Collection ID */
          $items = field_get_items('node', $vars['node'], 'field_photo_collection');
          /** Send photo_Collection_nid to the view */
          if ( isset($items[0]['node']) ) {
            $vars['photo_collection_nid'] = $items[0]['node']->nid;
          }

          /** Provide a path for the thumbnails view */
          $vars['thumbnails'] =  '<li class="navbar-item">' . l( t('Return to photo set'), 'set/' . $vars['photo_set_nid'], array('attributes' => array('title' => t('Return to photo set'), 'class' => array('thumbnails')))) . '</li>';
          /** Create Zoom in and out links */
          $vars['control_panel'] = '<div id="control-zoom"><div id="control-zoom-in" class="navbar-item"></div><div id="control-zoom-out" class="navbar-item"></div></div>';
          $vars['identifier'] = $identifier;
          $vars['sequence_number'] = dlts_utilities_photograph_page_get_sequence_number($node);
          $vars['page_title'] = $node->title;
          $vars['page_content'] = render($vars['content']);
          /** will do the right way some day */
          $vars['loadpane'] = '<div class="pane load loading">
            <div id="squaresWaveG">
              <span id="squaresWaveG_1" class="squaresWaveG"></span>
              <span id="squaresWaveG_2" class="squaresWaveG"></span>
              <span id="squaresWaveG_3" class="squaresWaveG"></span>
              <span id="squaresWaveG_4" class="squaresWaveG"></span>
              <span id="squaresWaveG_5" class="squaresWaveG"></span>
              <span id="squaresWaveG_6" class="squaresWaveG"></span>
              <span id="squaresWaveG_7" class="squaresWaveG"></span>
              <span id="squaresWaveG_8" class="squaresWaveG"></span>
            </div>
            <p>Loading image <span class="current_page"></span></p>
          </div>';
          break;
        case 'default':
          break;
      }
      break;
    default:
      break;
  }
}

function dlts_photo_preprocess_page( &$vars ) {
  $browser = dlts_utilities_browser_info();
  $theme_path = path_to_theme();
  drupal_add_js(libraries_get_path('openseadragon').'/openseadragon.min.js',  array('group' => JS_LIBRARY));
  drupal_add_js($theme_path.'/js/dlts-openseadragon.js',  array('group' => JS_LIBRARY));
  
  /** Look up the Photo Set ID */
  if ( isset($vars["node"] )) { 
  	$items = field_get_items('node', $vars['node'], 'field_photo_set');

	  if (isset($items[0]['node'])) {
	    $vars['photo_set_nid'] = $items[0]['node']->nid;
	    $vars['node']->photo_set_title = $items[0]['node']->title;
	  }
	  elseif (isset($items[0]['nid'])) {
	    $vars['photo_set_nid'] = $items[0]['nid'];
  	 }


  	$js_inline = 'var set_id ='. $vars['photo_set_nid'] . ';';
	  $js_options = array(
	      'group' => JS_DEFAULT,
	      'type' => 'inline',
	      'every_page' => FALSE,
	      'weight' => 5,
	      'scope' => 'header',
	      'cache' => TRUE,
	      'defer' => TRUE,
	  );
	  drupal_add_js($js_inline, $js_options);
  } 
  if ( dlts_utilities_is_pjax() ) {
    $vars['theme_hook_suggestions'][] = 'page__pjax__photo__page';
    if ( isset( $vars['node'] ) ) {
      /** Fallback to AJAX and hash browsing in IE <= 9 */
      if (isset($browser['msie']) && $browser['msie'] < 10 && !isset($_GET['routed'])) {
        drupal_goto(str_replace('1#/' . dlts_utilities_collection() . '/', '', $_GET['pjax']), array('query'=>array('pjax' => 1, 'routed' => 1 )), 301);
      }
      return;
    }
  }
  if ( isset ( $vars['node'] ) ) {
    if ($vars['node']->type == 'dlts_photograph') {
      $yui = 'http://yui.yahooapis.com/3.18.1/build/yui/yui-min.js';
      /** Add YUI Library from YUI Open CDN */
      drupal_add_js($yui, 'external', array('group' => JS_LIBRARY, 'weight' => -100 ));
      drupal_add_js($theme_path . '/js/crossframe.js', array('type' => 'file', 'scope' => 'header', 'weight' => 4));
      drupal_add_js($theme_path . '/js/ui.keyboard.yui.js', array('type' => 'file', 'scope' => 'header', 'weight' => 4));      
      drupal_add_js($theme_path . '/js/dlts_photo_oembed.js', array('type' => 'file', 'scope' => 'header', 'weight' => 5));
      if (isset($browser['msie']) && $browser['msie'] < 10) {
        drupal_add_js ( $theme_path . '/js/history.js', array('group' => JS_LIBRARY, 'weight' => -101 ));
      }
    }
  }
}

function dlts_photo_dlts_image_hires($variables) {
  $module_path = drupal_get_path('module', 'dlts_image');
  $theme_path = path_to_theme();
  drupal_add_js(libraries_get_path('openseadragon').'/openseadragon.min.js',  array('group' => JS_LIBRARY));
  drupal_add_js($theme_path.'/js/dlts-openseadragon.js',  array('group' => JS_LIBRARY));
  drupal_add_css($module_path . '/css/dlts_image.css');
  $file = $variables['file'];
  $fileUri = str_replace("public://", "", $file['uri']); 
  $fid = 'id-'. $file['fid'];
  return '<div id="' . $fid . '" class="openseadragon-data" style="width:100%; height:100%" data-image-source="' . $fileUri . '"></div>'; 
}

/**
 * Add non JavaScript tags to document
 * See: http://api.drupal.org/api/drupal/includes%21theme.inc/function/template_preprocess_html/7
 */
function dlts_photo_process_html(&$vars) {
  if (dlts_utilities_is_pjax()) {
    $vars['theme_hook_suggestions'][] = 'html__pjax';
  }
  else {
    $vars['classes'] = $vars['classes'] . ' oembed ' . dlts_utilities_collection();
  }
}

function dlts_photo_dlts_photo_pager_link($arguments) {
  return l( $arguments['text'], $arguments['url'], $arguments );
}

function dlts_photo_dlts_photo_pager_span($arguments) {
  return '<span class="' . $arguments['attributes']['class'] . '" title="' . $arguments['attributes']['title'] . '">' . $arguments['attributes']['title'] . '</span>';
}
