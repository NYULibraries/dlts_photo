<?php if ($page) : ?>
  <div id="book-navbar">
    <div class="navbar">
      <ul>
        <?php if (isset($thumbnails)) : print $thumbnails; endif; ?>
      </ul>
      <?php if ($control_panel) : print $control_panel; endif; ?>
        <ul>
          <?php if ($prevpage): print '<li class="navbar-item">' . $prevpage . '</li>'; endif; ?>
          <?php if ($nextpage): print '<li class="navbar-item">' . $nextpage . '</li>'; endif; ?>
        </ul>
      </div>
    </div>
    <div class="pjax-container" data-sequence-count="<?php print $sequence_count ?>" data-sequence="<?php print $sequence_number ?>"><?php print $page_content; ?></div>
    <?php print $loadpane ?>
<?php endif; ?>