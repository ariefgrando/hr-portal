$(document).ready(function() {

	var socket  = io.connect('http://10.16.107.73:3333', {transport:'polling'});

    socket.emit('check_in', {NIP : $('#nid').val(), NAMA : $('#namauser').val(), urlnow : window.location.pathname});     
	
	socket.on("newuseronline", function(newuser){

			$("#onlineuser").html("");

         	var PG_Table="";
			$.each(newuser, function() {
				//alert(this['content']);
				PG_Table+="<div class='desc'><div class='thumb'><img class='img-circle' src='assets/img/pegawai/"+this['NIP']+".png' width='35px' height='35px' align=''></div><div class='details'><p><a href='#'>"+this['useronline']+"</a><br/><muted>Available</muted></p></div></div>";
		  
			});

			$("#onlineuser").prepend(PG_Table);

    });

	socket.on('upload_frontnews_result', function (data){
		if(data=="error"){
			//alert("Gagal mengupload berita !");
		}else{
			//alert("Berhasil mengupload berita !");
			//console.log("#################################################"+data);
			var PG_Table="";
			$.each(data, function() {
				//alert(this['content']);
				PG_Table+="<ul class='messages_layout' id='infoadminbaru' style='display:table;'><li class='' style='display: table-cell; width: 100%; '><div class='message_wrap'> <span class='arrow'></span><div class='info'> <a class='name'>"+this['subject']+"</a> <span class='time'>"+this['date_created']+"</span> <span class='' style='float:right; font-size:11px; font-style:italic;'><i class='icon-pushpin'></i>&nbsp;&nbsp;informasi ini tayang sampai "+this['valid_date']+"</span>&nbsp;&nbsp;</div><div class='text'>"+this['content']+"</div></div></li></ul>";
		  
			});

			$("#main_news_placeholder").prepend(PG_Table);
			//alert($("#main_news_placeholder").html());

		}
		//console.log(data);

	});


});