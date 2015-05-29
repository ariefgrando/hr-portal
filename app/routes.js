// app/routes.js

module.exports = function(app, io, client,router) {

app.use(function (req, res, next) {
  res.io = io;
  next();
});

router.use(function(req, res, next) {  
    res.header('Access-Control-Allow-Origin', 'http://10.16.107.73:3333');
    next();
});

	function requireLogin (req, res, next) {
		if (!req.session.user) {
			res.render('login');
		} else {
			next();
		}
	};

	// get all news
	var get_valid_news = function(data, callback) {
	  client.query("SELECT id, type, subject, content, DATE_FORMAT(date_created,'%d/%m/%Y %h:%i %p') as tgl_upload_berita,DATE_FORMAT(valid_date,'%d/%m/%Y %h:%i %p') as tgl_akhir_tayang_berita, created_by FROM news where valid_date >= NOW() and type = ? ORDER BY id DESC", [data] , function(err, results, fields) {
		// callback 
		if (err) {
			console.log("ERROR: " + err.message);
			throw err;
		}
		var obj = {"news":results};
		callback(JSON.stringify(obj));
	  });
	}


	// Log in ==================================================================
	app.post('/login', function (req, res) {
		sess=req.session;

		var ActiveDirectory = require('activedirectory');

		var ad = new ActiveDirectory({	
										url: 'ldap://10.16.1.22:389',
										baseDN: 'DC=pusat,DC=corp,DC=pln,DC=co,DC=id',
										username: 'arief.grando@pusat.corp.pln.co.id',
										password: 'Bold9000',
										attributes: {
										 user: [ 'displayName','mail','title','employeeNumber','department', 'physicalDeliveryOfficeName' ]
										}
									});
		ad.authenticate(req.body.username+"@pusat.corp.pln.co.id", req.body.password, function(err, auth) {
			if (err) {
				//console.log('ERROR: '+JSON.stringify(err));
				res.sendFile(__dirname + '/views/login.html');
			}

			if (auth) {
				ad.findUser(req.body.username+"@pusat.corp.pln.co.id", function(err, user) {
					//sess.email=user;
					req.session.user = user;
					//console.log("NILAI SESSION SEKARANG ------> "+req.session.user);

					// get user role
						var returnedDataRole='';
						http = require('http')
			
						http.get("http://10.16.107.77/plnv3/getrole.php?nip="+req.session.user.employeeNumber, function(resRole){
							resRole.setEncoding('utf8');
							resRole.on('data', function(chunk){
								returnedDataRole+=chunk
							});
							resRole.on('end', function() { 
								req.session.role=JSON.parse(returnedDataRole);
								console.log(req.session.role);
								//console.log(sess.email);
								res.redirect('/registeredUser');
							});


						});


					
				});
			}else{
				res.sendFile(__dirname + '/views/login.html');
			}
		});
	});

	// logged out ==============================================================
	app.get('/logout', function (req, res) {

		io.emit('check_out', req.session.user.employeeNumber);
			req.session.reset();
			res.redirect('/');
		//});
	});
	

	// logged in ===============================================================
	app.get('/registeredUser', requireLogin, function (req, res) {
		res.render('pages/welcome',{ data : req.session.user, datarole : req.session.role });
	});

	// cpanel  ===============================================================
	app.get('/cpanel', requireLogin, function (req, res) {
		if(req.session.role==""){
			res.redirect('/na');
		}else{
			//io.to('portalsdm').emit('check_in', sess.email.employeeNumber);
			res.render('pages/adminPanel',{ data : req.session.user, datarole : req.session.role } );
		}
	});

	// cpanel  ===============================================================
	app.get('/news', requireLogin, function (req, res) {
		//if(sess.email==null){
		//	res.redirect('/');
		//}else{
			//io.to('portalsdm').emit('check_in', sess.email.employeeNumber);
			res.render('pages/uploadNews',{ data : req.session.user, datarole : req.session.role } );

		//}
	});

	// inbox ===============================================================
	app.get('/inbox', requireLogin, function (req, res) {
		//if(sess.email==null){
		//	res.redirect('/');
		//}else{
			res.render('pages/inbox',{ data : req.session.user, datarole : req.session.role } );

		//}
	});

	// Buku in ===============================================================
	app.get('/buku', requireLogin, function (req, res) {
		//if(sess.email==null){
		//	res.redirect('/');
		//}else{
			var recursive = require('recursive-readdir');

			recursive('./public/assets/img/buku', function (err, files) {
			  // Files is an array of filename
			  //console.log(files);
			  res.render('pages/buku',{ data2 : files, data : req.session.user, datarole : req.session.role } );
			});

			//res.render('pages/buku',{ data2 : sess.filez, data : sess.email } );

		//}
	});

	// Riwayat Kehadiran ===============================================================
	app.get('/presensi', requireLogin, function (req, res2) {
			var ds = require('date-stylish'),
			Y  = ds.YYYY,
			M  = ds.MM;
			console.log(M+'/'+Y+'/'+req.session.user.employeeNumber);
			var returnedData='';
			//var currentMonth = d.getMonthName();
			http = require('http')
			
			http.get("http://10.16.107.77/plnv3/getmyrecord.php?bln="+M+"&thn="+Y+"&nipeg="+req.session.user.employeeNumber, function(res){
				res.setEncoding('utf8');
				res.on('data', function(chunk){
					returnedData+=chunk
				});
				res.on('end', function() { 
					//console.log(returnedData);	
					res2.render('pages/myrecord',{ data2 : JSON.parse(returnedData), data : req.session.user, datarole : req.session.role } );
				});


			});
	});

	app.post('/custompresensi', requireLogin, function(req, res){
		//var sess=req.session;
		//if(sess.email==null){
		//	res.redirect('/');
		//}else{

			var bln = req.body.bulan;
			var thn = req.body.tahun;
			if(bln.length<2){
				bln = '0'+bln;
			}

			var returnedData='';

			http = require('http')
			
			http.get("http://10.16.107.77/plnv3/getmyrecord.php?bln="+bln+"&thn="+thn+"&nipeg="+req.session.user.employeeNumber, function(result){
				result.setEncoding('utf8');
				result.on('data', function(chunk){
					returnedData+=chunk
				});
				result.on('end', function() { 
					//console.log(returnedData);	
					res.render('pages/myrecord',{ data2 : JSON.parse(returnedData), data : req.session.user, datarole : req.session.role } );
				});


			});

		//}

	});


	// application =============================================================
	app.get('/', requireLogin, function(req, res) {
		get_valid_news("front_news", function(resultnews) {
				if(resultnews[0]==undefined){

				}else{
					console.log(resultnews);
					res.send(resultnews);
					//return (resultnews);
					//socket.emit('activity_done', result_check[0].id_activity);
					//res.render('pages/index',{ data : req.session.user, datarole : req.session.role, news : resultnews } );
				}
				//return resultnews;
		});
	});

	// application =============================================================
	app.get('/home', requireLogin, function(req, res) {
		res.render('pages/index',{ data : req.session.user, datarole : req.session.role });
	});

}