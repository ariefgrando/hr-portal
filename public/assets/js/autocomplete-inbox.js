  $("#to").autocomplete({
    source: "http://10.16.107.77/plnv3/getalluser.php", // name of controller followed by function
	select: function( event, ui ) {
        $( "#to" ).val( ui.item.nipeg ); 
        return false;
	}
   }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
        var inner_html = '<a><div class="list_item_container"><div class="image"><img src="assets/img/pegawai/' + item.nipeg + '.png  " width="150" height="150"></div><div class="label">' + item.nipeg + '</div><div class="description">' + item.nama + '</div></div></a>';
        return $( "<li></li>" )
            .data( "item.autocomplete", item )
            .append(inner_html)
            .appendTo( ul );
    };
