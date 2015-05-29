$(document).ready(function() {

	var socket  = io.connect('http://10.16.107.73:3333', {transport:'polling'});
	
	//$('#bataswaktu').datetimepicker();

	$("#uplNews").click(function(){

		var dNow = new Date();
		var tglnow = ((dNow.getDate())>=10)? (dNow.getDate()) : '0' + (dNow.getDate());
		var blnnow = ((dNow.getMonth()+1)>=10)? (dNow.getMonth()+1) : '0' + (dNow.getMonth()+1);

		var meta_validdate = $('#bataswaktu').val().substr(0,10);
		var arr_meta_validdate = meta_validdate.split("/");
		var final_valid_date = arr_meta_validdate[2]+"-"+arr_meta_validdate[1]+"-"+arr_meta_validdate[0]+" 00:00:00";
		
		var data = {
			  id:'',
			  type:'front_news',
			  subject: $('#subject').val(),
			  newscontent: tinyMCE.get('content').getContent(),
			  datecreated: dNow.getFullYear() + '-' + blnnow + '-' + tglnow + ' ' + dNow.getHours() + ':' + dNow.getMinutes()+ ':' + dNow.getSeconds(),
              validdate: final_valid_date,
			  createdby: $('#nid').val()
		};
		console.log(data);
		socket.emit('upload_frontnews', data);
	});

	// Private Message
	$("#sendChat").click(function(){

		var dNow = new Date();
		var tglnow = ((dNow.getDate())>=10)? (dNow.getDate()) : '0' + (dNow.getDate());
		var blnnow = ((dNow.getMonth()+1)>=10)? (dNow.getMonth()+1) : '0' + (dNow.getMonth()+1);

		var data = {
			  id:'',
			  from:$('#nid').val(),
			  receiver: $('#to').val(),
			  subject: $('#subjectChat').val(),
			  mess: $('#chatContent').val(),
			  datecreated: dNow.getFullYear() + '-' + blnnow + '-' + tglnow + ' ' + dNow.getHours() + ':' + dNow.getMinutes()+ ':' + dNow.getSeconds()
		};
		console.log(data);
		socket.emit('sending_chat', data);
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

	//List Connected Clients
	socket.on("update", function(msg) {
         $("#listconnected").append("" + msg + "");
    })


	socket.on("private", function(msg){
         alert(msg);
    });



});




$(function () {
	$('#bataswaktu').datetimepicker({
		daysOfWeekDisabled: [0, 6],
		locale: 'id'
	});
});


function printeveryitem(idelement){
	var divToPrint =  $('#'+idelement).html();
	var popupWin = window.open('', '_blank', 'width=900,height=300,scrollbars=1');
           
           popupWin.document.write('<html><link href="http://10.16.107.73:3333/assets/css/bootstrap.css" rel="stylesheet"><link href="http://10.16.107.73:3333/assets/css/style.css" rel="stylesheet"><body onload="window.print()">' + divToPrint + '</html>');
		   
	popupWin.document.open();
	popupWin.document.close();
}
