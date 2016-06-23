<div class="node pjax" data-identifier="<?php print $identifier ?>" data-sequence="<?php print $sequence_number ?>" data-title="<?php print $page_title ?>">
  <?php if (isset($prevpage)) { print $prevpage; } ?>
  <?php print $page_content; ?>
  <?php if (isset($nextpage)) { print $nextpage; } ?>
  <?php print dlts_utilities_get_script(); ?>
</div>
