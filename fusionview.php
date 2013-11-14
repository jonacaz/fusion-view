<?php

/*
 Plugin Name: FusionView
 Plugin URI: http://wordpress.org/extend/plugins/fusionview/
 Description: FusionView queries a google fusion table and show locations in a table or on a google map
 Version: 0.1.2
 Author: John Ackers
 Author URI: john.ackers HATT ymail.com

 Copyright 2013  John Ackers

 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License, version 2, as
 published by the Free Software Foundation.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

*/

function fusionview_short_code($attributes, $body)
{
  $pageAttributes = (object) shortcode_atts(array(
    ), $attributes);

  try {


      ?>
      
    <div id='panel' class='panel'>
      <div class='label'>Filter by intervention</div>
      <div id='tags' class='subpanel'></div>
      <div class='label'>Filter by ward</div>
      <div id='ward' class='subpanel'></div>

      <div id='tab-content' class='tab-group'>
        <div>table</div>
        <div>map</div>
      </div> 
      
    </div>
    <div style='clear:both'></div>
      
    &nbsp;
    
    <div id='map-wrapper'>
      <div id="map-canvas" style='text-align:center; font-style:italic;'>Click on 'table' or 'map' tab</div>
    </div>
    

    <div id='latlong'></div>
    <div id='table-wrapper'>
      <h1 id="ft-title"></h1>
      <div id="ft-query"></div>
      <div id="ft-data"></div>
    </div>
    <p id='edit-link'></p>
    
    
<?php

  }
  catch (Exception $e)  // exception does not get thrown
  {
    die(__("Unable to load {$pageAttributes->class}. Error:" . $e->getMessage()));
  }
}



function fusionview_load()
{
  wp_enqueue_script('gmapapi-js', 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false');
  wp_enqueue_script('jsapi', 'http://www.google.com/jsapi');

  wp_enqueue_style('fusionview-style', plugin_dir_url( __FILE__ ) . 'fusionview.css');
  wp_enqueue_script('fusionview-js', plugin_dir_url( __FILE__ ) . 'fusionview.js', array('jquery'));
}


if (is_admin())
{
}
else
{
  add_action('init', 'fusionview_load', 1);
  add_shortcode('fusionview', 'fusionview_short_code');
}



?>