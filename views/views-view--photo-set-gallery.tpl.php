<div id="openseadragon-section">
  <div id="openseadragon-container">
	<div id="openseadragon-viewer"></div>
  </div>
</div>
<div id="openlayers-section">
	<div id="book-navbar">
	  <div class="navbar">
	    <?php if ($pager) : ?>
		  <?php print $pager; ?>
		<?php endif; ?>
	  </div>
	</div>
	<?php if ($rows) : ?>
	  <div class="dlts-photograph-set">
	    <?php print $rows; ?>
	  </div>
	<?php endif; ?>
</div>
