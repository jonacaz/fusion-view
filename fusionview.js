/*
 Plugin Name: FusionTable
 ////Plugin URI: http://wordpress.org/extend/plugins/fusiontable/
 Description: FusionTable queries a google fusion table and show and locations on a google map
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
  

var fusionTable = [] ;  
fusionTable.query = [] ;
fusionTable.view = ['table'] ; // initial view 
fusionTable.tableId = '1jriGbijWRykiq7yk_63gGjPR0nKZH8EH54_oci0' ;
fusionTable.map = null ; 

fusionTable.initialize = function () {
  
  var interventions = ["all","not parking or enforcement","quick win","permeability","parking","enforcement","review","done"] ;

  fusionTable.attachSelectBox(interventions, 'tags', 'all', fusionTable.query);
  
  var wards = ["all","Barnsbury","Bunhill","Canonbury","Caledonian","Clerkenwell","Finsbury Park","Holloway","Highbury East","Highbury West","Hillrise","Junction","Mildmay","St. George's","St. Mary's","St. Peter's","Tollington","TfL"] ;
  
  fusionTable.attachSelectBox(wards, 'ward', 'all', fusionTable.query);
   
  jQuery(".tab-group div").click(function(e){  // flip table map
    jQuery(this).addClass('selected').siblings().removeClass('selected'); 
    fusionTable.view = this.innerHTML;
    fusionTable.updateView();
  });
  jQuery('edit-link').html("<a \ href='https://www.google.com/fusiontables/DataSource?docid="+fusionTable.tableId+"'>[edit raw table]</a>");
}    


// Generate a where clause from the radioes. If no boxes
// are checked, or selection contains 'all'  return an empty string.

fusionTable.updateView = function ()
{
  var where = " publish = 1 " ;

  for (colname in fusionTable.query)
  {
    var needle = fusionTable.query[colname] ;
    needle = needle.replace(/'/g, '\\\'');

    if (needle == 'all')
      continue ;    // don't add additional filter
      
    if (needle == 'not parking or enforcement')
    {
      where += " AND  " + colname + " does not contain 'parking' ";
      where += " AND  " + colname + " does not contain 'enforcement' ";
    }
    else
      where += " AND  " + colname + " contains ignoring case '" + needle + "' ";    
  }
  switch (fusionTable.view) {
    case 'map' :
      jQuery('#map-wrapper').show();
      jQuery('#table-wrapper').hide();
      fusionTable.drawMap(where);
      break ;
      
    case 'table' :
    default :
      jQuery('#map-wrapper').hide();
      jQuery('#table-wrapper').show();      
      fusionTable.draw(where);
      break ;
  }
}



  // attach select boxes to the desired elements and attach
  // event handlers to them. 

fusionTable.attachSelectBox = function(options, id, initialValue)
  {     
    var html = "" ;
    for (var i = 0 ; i < options.length ; i++)
      html += "<option value='" + options[i] + "'>" + options[i] + "</option>" ;
    html = "<select>" + html + "</select>" ;

    len = jQuery("#" + id);
    
    jQuery("#" + id).html(html).find('select').change(function()
    {
      jQuery(this).find('option:selected').each( function()
      {
        var tex= jQuery(this).text();
        fusionTable.query[id] = tex ;
        fusionTable.updateView();
      })
    });
  }


fusionTable.draw = function(where) {
  
  // Construct query
  var query = "SELECT ward, location, description, priority as 'priority 1 high', tags, proposer FROM " + fusionTable.tableId + " WHERE " + where + " ORDER BY priority ASC"

  var queryText = encodeURIComponent(query);
  var gvizQuery = new google.visualization.Query(
      'http://www.google.com/fusiontables/gvizdata?tq='  + queryText);

  // Send query and draw table with data in response
  gvizQuery.send(function(response)
  {
    try {
      
      if (response.isError() || response.hasWarning())
        throw  where + ": " + getDetailedMessage();

      if (!response.We === undefined)
        if (response.We != "ok")
      {
        throw where + ": " + response.hb[0].message ;
      }
      
      var table = response.getDataTable();
      if (table == null)
      {
        throw where + ": No table returned";
      }
      var numRows = response.getDataTable().getNumberOfRows();
      if (numRows == 0)
      {
        throw where + ": No rows returned";
      }
      var numCols = response.getDataTable().getNumberOfColumns();

      document.getElementById('ft-query').innerHTML = 'WHERE ' + where ;
      document.getElementById('ft-title').innerHTML = "Filtered ICAG Wish List";


      var table = new google.visualization.Table(document.getElementById('ft-data'));
      table.draw(response.getDataTable(),
          { showRowNumber: false,
        allowHtml: true,
        cssClassNames : { headerRow: 'table-cells',
        tableRow : 'table-cells'
      }
      });

    }
    catch (e)
    {
      document.getElementById('ft-query').innerHTML = "" ;
      document.getElementById('ft-data').innerHTML = "" ;
      document.getElementById('ft-query').innerHTML = e ;
      return ;
    }
  });
}



fusionTable.initializeMap = function ()
{
  var mapOptions = {
      width : 600,
      zoom: 13,
      center: new google.maps.LatLng(51.555,-.12),
      mapTypeId: google.maps.MapTypeId.ROADMAP,

      panControl: true,

      zoomControl: true,

      scaleControl: true,
          scaleControl: true,

      streetViewControl: true,

  };
  fusionTable.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  fusionTable.layer = new google.maps.FusionTablesLayer();
  
  google.maps.event.addListener(fusionTable.layer, 'click', function (e) {

    e.infoWindowHtml =
      "<div class='googft-info-window' style='font-family: sans-serif; font-size: 0.85em; z-index: 4 ; width:180px'>"
      + "<p><strong>" + e.row['location'].value + "</strong>&nbsp;&nbsp;" + e.row['ward'].value + "</p>"

      + "<p>" + e.row['description'].value + "</p>"
      + "<p>Priority:" + e.row['priority'].value + "</p>"
      + "<p>Proposer:" + e.row['proposer'].value + "</p>"
      + "<p>Tags:" + e.row['tags'].value + "</p>"
      + "</div>" ;
  });

  google.maps.event.addListener(fusionTable.map, 'click', function(event) {
    document.getElementById('latlong').innerHTML = "Lat,long is:&nbsp;" + event.latLng + "&nbsp;" ;
  });   
  
}


fusionTable.drawMap = function(where)
{ 
  if (fusionTable.map == null)
  {
    fusionTable.initializeMap();
  }  
  if (where) {
    if (!fusionTable.layer.getMap()) {
      fusionTable.layer.setMap(fusionTable.map);
    }
    fusionTable.layer.setOptions({
      query: {
        select: 'geometry',
        from:   fusionTable.tableId,
        where:  where  
      }
    });
    
  } else {
    fusionTable.layer.setMap(null);
  }
}

google.load('visualization', '1', { packages: ['table'] });

google.maps.event.addDomListener(window, 'load', function() { fusionTable.initialize() } );

