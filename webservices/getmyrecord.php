<?php	
class Getmyrecord{

	function koneksioci(){
		$conn = oci_connect('absenbsi', 'absenbsi', 'ABSEN');
		if (!$conn) {
			$e = oci_error();
			trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
		}else{
			return $conn;
		}
	}

	function riwayatkehadiran($bln, $thn, $nipeg){
		$cekerr="";
		$thnbln=$thn.$bln;
			
				$strsqlpersonal="
select 
       a2.*, 
       to_char(floor(nvl(j1,0)/60)) || ':' || case when mod(nvl(j1,0),60) < 10 then '0' else '' end || to_char(mod(nvl(j1,0),60)) jj1
from (
  select a1.*,
         case when substr(trim(keterangan),1,4) in ('DIKL', 'DINA', 'SPPD') then 480
         else 
           case 
                when nvl(holidays,0) = 1 or keterangan like '%LIBUR%' then 0
                else p1-d1 - case when hari like '%JUMAT%' then 60 else 30 end
           end 
         end j1
  from (
  				select 
  					   lr.*, 
  					   to_char(floor(jam/60)) || ':' || case when mod(jam,60) < 10 then '0' else '' end || to_char(mod(jam,60)) jumlahjam,
               case when dtg1 <= 480 then 480 else dtg1 end d1,
               case 
                    when hari like '%JUMAT%' then 
                         case when plg1 > 1020 then 1020 else plg1 end
                    else 
                         case when plg1 > 990 then 990 else plg1 end
               end p1,
               
  					   case when to_char(tgl,'YYYYMMDD') >= to_char(sysdate,'YYYYMMDD') then ''  
  					   else
  						 case when libur is not null then libur
  						 else
  						   case 
  								when nvl(keterangan,' ') = ' ' then 
  									 case when hari like '%SABTU%' or hari like '%MINGGU%' then 'LIBUR' else
  									 case 
  										  when dtg is null and plg is null then 'TANPA KETERANGAN'
  										  when dtg > '08:00' then 'TERLAMBAT MASUK KERJA'
  										  when dtg is null then 'JAM MASUK TIDAK DIREGISTER'
  										  when plg is null then 'JAM KELUAR TIDAK DIREGISTER'
  									 end 
  								end 
  						   else keterangan end 
  						 end 
  					   end keterangan
  				from
  				(
  				  select unit,nama,nip,dt.*,
  						 (
  						   (60 * to_number(substr(plg, 1, 2)) + to_number(substr(plg, 4, 2))) - 
  						   (case when to_number(substr(dtg, 1, 2)) < 8 then (60 * 8) else
  								 (60 * to_number(substr(dtg, 1, 2)) + to_number(substr(dtg, 4, 2)))
  						   end) - 30 - case when trim(hari) = 'JUMAT' then 30 else 0 end -- 30 menit istirahat
  						 ) jam,
               (60 * to_number(substr(dtg, 1, 2))) + (to_number(substr(dtg, 4, 2))) dtg1,
               (60 * to_number(substr(plg, 1, 2))) + (to_number(substr(plg, 4, 2))) plg1
  				  from
  				  (select upper(deptname) unit, ssn nip, Name nama from userinfo u, departments d where u.defaultdeptid = d.deptid (+) and ssn = '".$nipeg."') usr, -- ubah di sini
  				  (
  					select 
  						   upper(to_char(tgl,'Month - YYYY')) periode, tgl, to_char(tgl,'DAY','nls_date_language = INDONESIAN') hari,
  						   (
  							select to_char(min(checktime),'HH24:MI') from checkinout 
  							where checktype in('1', 'i', 'I') and to_char(checktime,'YYYYMMDD') = to_char(t.tgl,'YYYYMMDD') and userid = 
  								  (select userid idnum from userinfo u where ssn = '".$nipeg."')  -- ubah di sini
  						   ) dtg,
  						   (
  							select to_char(max(checktime),'HH24:MI') from checkinout 
  							where checktype in('0', 'o', 'O') and to_char(checktime,'YYYYMMDD') = to_char(t.tgl,'YYYYMMDD') and userid = 
  								  (select userid idnum from userinfo u where ssn = '".$nipeg."')  -- ubah di sini
  						   ) plg, 
  						   keterangan libur,
                 libur holidays
  					from tanggal t where to_char(tgl,'YYYYMM') = '".$thnbln."'  -- ubah di sini
  				  ) dt
  				) lr, absen_keterangan a
  				where 
  					  lr.nip = a.nip (+) and
  					  tgl = tanggal (+)  -- to_date(tgl,'DD/MM/YYYY') = tanggal (+)
  ) a1
) a2				
				";
				
					
			$stid = oci_parse($this->koneksioci(), $strsqlpersonal);
			oci_execute($stid);
			$counter = 1;
			$no=0;
			$dummy = 0;
			$jk = '';
			$res="";
			//echo "Jumlah Row".count($row);
			//if(oci_num_rows($stid)>0){
			while ($row = oci_fetch_assoc($stid)) {
//					$dummy += $row['JAM'];
					$dummy += $row['J1'];

					//echo "Tanggal -> ".$row["TGL"]."<br>";
					$no++;
					if(trim($row["HARI"])=="SABTU" || $row["HARI"]=="MINGGU"){
						$ceklibur = 'classmerah';
					}else{
						$ceklibur = 'classbiru';
					}
					if($counter==1) {
						$counter += 1;

						if($_GET["action"]=='caridatakehadiran' || $_GET["action"]=='editjamhadir' || $_GET["action"]=='editfromnama' || $_GET["action"]=='generateabsenpersonal'){
						}else{
						$res.= "<span id='printbutton' onclick='printeveryitem(\"riwayatabsensi\")'>Print</span>";
						}
						
						$res.= "<div id='riwayatabsensi'><table width='100%' id='tabel'><tr><td align='left' colspan = '6' style='padding-left:3px;'><table><tr>";
						$res.= "<td class='headlaporan' width='62'>UNIT</td><td class='headlaporan' width='9'>:</td><td class='headlaporan'>$row[UNIT]</td></tr>";
						$res.= "<tr><td class='headlaporan'>NIP</td><td class='headlaporan'>:</td><td class='headlaporan'>$row[NIP]</td></tr>";
						$res.= "<tr><td class='headlaporan'>NAMA</td><td class='headlaporan'>:</td><td class='headlaporan'>$row[NAMA]</td></tr>";
						$res.= "<tr><td class='headlaporan'>PERIODE</td><td class='headlaporan'>:</td><td class='headlaporan'>$row[PERIODE]</td></tr>";
						$res.= "<tr><td class='headlaporan' colspan='7' id='p1'>TOTAL JAM KERJA : </td></tr></table>";
						$res.= "</td></tr>";

						
						$res.= "<tr height='40'>";
						$res.= "<td class='tabelhead'>NO</td><td class='tabelhead'>TANGGAL</td><td class='tabelhead'>HARI</td><td class='tabelhead'>DATANG</td><td class='tabelhead'>PULANG</td><td class='tabelhead'>JAMKERJA</td><td class='tabelhead'>KETERANGAN</td>";
						$res.= "</tr>";
					}
					$res.= "<tr height='32' class='".$ceklibur."'>
						<td class='tabelclass'>".$no."</td>
						<td class='tabelclass'>$row[TGL]</td>
						<td class='tabelclass'>$row[HARI]</td>
						<td class='tabelclass'>$row[DTG]</td>
						<td class='tabelclass'>$row[PLG]</td>
						<td class='tabelclass'>" . ($row['JJ1']=='0:00'? '': $row['JJ1']) . "</td>
						";
					if($_GET["action"]=='caridatakehadiran' || $_GET["action"]=='editjamhadir' || $_GET["action"]=='editfromnama'){
						if($row["KETERANGAN"]!="LIBUR"){

							$sqluserid="select USERID from userinfo where SSN = '".$nipeg."'";
							$stidsqluserid = oci_parse($this->koneksioci(), $sqluserid);
							oci_execute($stidsqluserid);
							$rowid = oci_fetch_assoc($stidsqluserid);

							// Patch - prevent sub manager to edit attendance history
							if($_SESSION["HAKADMIN"]!='000' && $_SESSION["HAKADMIN"]!='sup' && strlen($_SESSION["HAKADMIN"])>10){


							$res.= "<td class='tabelket' align='center'>$row[KETERANGAN]</td>";

							}elseif($_GET["sessionid"]=='sup'  || strlen($_SESSION["HAKADMIN"])<=10){


							$res.= "<td class='tabelket' align='center'>$row[KETERANGAN]&nbsp;&nbsp;<A HREF='index.php?action=gotoeditform&judul=gotoeditform&ssn=".$nipeg."&tanggal=".$row["TGL"]."&in=$row[DTG]&out=$row[PLG]&userid=".$rowid["USERID"]."' style='text-decoration:none'><FONT COLOR='#009900'>[ EDIT ]</FONT></A></td>";

							}

							oci_free_statement($stidsqluserid);
							oci_close($this->koneksioci()); 

						}else{
							$res.= "<td class='tabelket'>LIBUR</td>";
						}
					}else{
						$res.= "<td class='tabelket'>$row[KETERANGAN]</td>";
					}
					$res.= "</tr>";
					
				}
					$res.= "</table></div>";	
			//}else{
			//	echo "<div id='section'><h4><FONT COLOR='red'>Riwayat Kehadiran Tidak Tersedia</FONT></h4></div>";
			//}

		// Free the statement identifier when closing the connection
			oci_free_statement($stid);
			oci_close($this->koneksioci()); 
			
			if(floor($dummy/60)<10) $jk = 0;
			$jk .= floor($dummy/60) . ':';
			
			if(($dummy%60)<10) $jk .= '0';
			$jk .= $dummy%60;
			/*$res.= "
			<script type='text/javascript'>
				document.getElementById('p1').innerHTML=
					\"TOTAL JAM KERJA : ".$jk."\"</script>";*/
					echo $res;
		}
	}



$myrecord = new Getmyrecord();
$myrecord->riwayatkehadiran($_GET["bln"], $_GET["thn"], $_GET["nipeg"]);
?>