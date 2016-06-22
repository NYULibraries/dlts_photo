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