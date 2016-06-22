<div id="book-navbar">
  <div class="navbar">
    <?php if ($pager) : ?>
      <?php print $pager; ?>
    <?php endif; ?>
  </div>
</div>
<?php if ($rows) : ?>
  <div class="dlts-photo-collection">
    <?php print $rows; ?>
  </div>
<?php endif; ?>