"use strict";
/* Panel gym (#/admin), PIN demo */
var A={q:"",f:"all",sort:"name",page:1,range:30,attDate:null,expWin:14,ppage:1,res:null,ciq:"",focusCi:false};
var TABS=[["checkin","Check-in"],["anggota","Anggota"],["kelas","Kelas dan jadwal"],["kehadiran","Kehadiran"],["kasir","Kasir"],["pendapatan","Pendapatan"],["habis","Segera habis"],["paket","Paket dan promo"],["setelan","Pengaturan"]];
var DORDER=[1,2,3,4,5,6,0];
var ROOMS=["Studio A","Studio B","Studio Cycle"];

function viewAdmin(tab){
  if(!isAdmin())return '<div class="page"><div class="wrap" style="max-width:420px"><span class="eyebrow">Panel gym</span><h1 style="font-size:30px">Masuk panel</h1><div class="hint">PIN demo: <b>2468</b></div><form class="card" data-form="adminlogin" novalidate><label class="fld"><span>PIN (4 angka)</span><input class="inp" name="pin" inputmode="numeric" maxlength="4" autocomplete="off" required></label><button class="btn p w" type="submit">Masuk</button></form></div></div>';
  tab=tab||"checkin";if(!TABS.some(function(t){return t[0]===tab}))tab="checkin";
  var n=expList(14).length;
  var tabs=TABS.map(function(t){return '<a class="tab'+(t[0]===tab?" on":"")+'" href="#/admin/'+t[0]+'">'+t[1]+(t[0]==="habis"&&n?' <span class="n">'+n+'</span>':'')+'</a>'}).join("");
  var fn={checkin:tCheckin,anggota:tAnggota,kelas:tKelas,kehadiran:tKehadiran,kasir:tKasir,pendapatan:tPendapatan,habis:tHabis,paket:tPaket,setelan:tSetelan}[tab];
  return '<div class="page"><div class="wrap"><div class="rowf" style="align-items:center;justify-content:space-between;margin-bottom:12px"><div><span class="eyebrow" style="margin:0">Panel gym</span><h1 style="font-size:26px;margin:0">'+esc((TABS.filter(function(t){return t[0]===tab})[0]||[])[1])+'</h1></div><button class="btn s" type="button" data-act="adminout" style="flex:none">Keluar panel</button></div><nav class="tabs" aria-label="Menu panel">'+tabs+'</nav>'+fn()+'</div></div>';
}
function adminMount(tab){if((tab||"checkin")==="checkin"&&isAdmin()&&A.focusCi){var i=$("ciq");if(i)i.focus();A.focusCi=false}}
function statusOpts(){return [["all","Semua status"],["active","Aktif"],["soon","Segera habis"],["expired","Kedaluwarsa"],["frozen","Dibekukan"],["notyet","Belum mulai"]]}
function mailWa(m,kind){var p="62"+normPhone(m.phone).slice(1);var txt="Halo "+m.name.split(" ")[0]+", keanggotaan Anda di Kinetik Fit Center "+(kind==="expired"?"sudah berakhir pada ":"akan berakhir pada ")+fmtDate(m.end)+". Perpanjang di kasir atau lewat portal anggota ya.";return "https://wa.me/"+p+"?text="+encodeURIComponent(txt)}

/* ---------- check-in ---------- */
function cands(q){return findMembers(q).map(function(m){var s=mState(m);return '<div class="li"><div class="l"><b>'+esc(m.name)+'</b><div class="mu sm">'+esc(m.no)+' &middot; '+esc(fmtPhone(m.phone))+' &middot; berakhir '+fmtDate(m.end)+'</div></div>'+badge(m)+'<button class="btn s p" type="button" data-act="ci" data-id="'+m.id+'">Check-in</button></div>'}).join("")}
function tCheckin(){
  var r=A.res,t=today(),vs=db.visits.filter(function(v){return dOf(v.at)===t}).sort(function(a,b){return a.at<b.at?1:-1});
  var rh=r?'<div class="res '+r.level+'" role="status"><h3>'+esc(r.title)+'</h3><div><b>'+esc(r.m.name)+'</b> ('+esc(r.m.no)+', paket '+esc(plan(r.m.planId).name)+')</div><div>'+esc(r.msg)+'</div>'+(!r.ok&&r.level==="no"&&mState(r.m)==="expired"?'<div style="margin-top:10px"><button class="btn s p" type="button" data-act="mren" data-id="'+r.m.id+'">Perpanjang sekarang</button></div>':'')+'</div>':'';
  return '<div class="split"><div><form data-form="ci" novalidate><label class="fld"><span>Nomor anggota, nama, atau telepon (pemindai kode batang mengetik nomor lalu Enter)</span><input class="inp" id="ciq" name="q" value="'+esc(A.ciq)+'" autocomplete="off" placeholder="mis. GYM-0001 atau Andi" style="font-size:17px;min-height:52px"></label><button class="btn p w" type="submit">Check-in</button></form><div id="cires" class="list" style="margin-top:12px">'+(A.ciq?cands(A.ciq):"")+'</div><div id="cimsg">'+rh+'</div></div><div><h3>Hari ini: '+vs.length+' kunjungan</h3><div class="list">'+(vs.slice(0,12).map(function(v){var m=mById(v.mid);return '<div class="li"><div class="l"><b>'+esc(m?m.name:"-")+'</b><div class="mu sm">'+esc(m?m.no:"")+'</div></div><span class="mu">'+hm(v.at)+'</span></div>'}).join("")||'<div class="empty">Belum ada check-in hari ini.</div>')+'</div></div></div>';
}
function doCheckIn(m){A.res=checkIn(m);A.res.m=m;A.ciq="";A.focusCi=true;rerender();adminMount("checkin")}

/* ---------- anggota ---------- */
function memberFiltered(){
  var q=A.q.trim().toLowerCase(),dq=q.replace(/\D/g,"");
  var l=db.members.filter(function(m){var s=mState(m);if(A.f==="active"&&s!=="active"&&s!=="soon")return false;if(A.f!=="all"&&A.f!=="active"&&s!==A.f)return false;if(!q)return true;return m.name.toLowerCase().indexOf(q)>-1||m.no.toLowerCase().indexOf(q)>-1||(dq.length>=3&&normPhone(m.phone).indexOf(dq)>-1)});
  l.sort(function(a,b){if(A.sort==="no")return a.no<b.no?-1:1;if(A.sort==="end")return a.end<b.end?-1:a.end>b.end?1:0;if(A.sort==="new")return b.id-a.id;return a.name.localeCompare(b.name)});
  return l;
}
function memberList(){
  var l=memberFiltered(),per=10,pages=Math.max(1,Math.ceil(l.length/per));if(A.page>pages)A.page=pages;
  var rows=l.slice((A.page-1)*per,A.page*per).map(function(m){var left=remaining(m);return '<tr><td class="nl"><b>'+esc(m.name)+'</b><div class="mu sm">'+esc(m.no)+' &middot; '+esc(fmtPhone(m.phone))+'</div></td><td data-l="Paket">'+esc(plan(m.planId).name)+'</td><td data-l="Berakhir">'+fmtDate(m.end)+'<span class="mu sm"> &middot; '+(left>=0?left+" hari":Math.abs(left)+" hari lalu")+'</span></td><td data-l="Status">'+badge(m)+'</td><td class="nl"><div class="a rowf"><button class="btn s" type="button" data-act="medit" data-id="'+m.id+'">Ubah</button><button class="btn s" type="button" data-act="mren" data-id="'+m.id+'">Perpanjang</button><a class="btn s" href="#/kartu/'+esc(m.no)+'">Kartu</a></div></td></tr>'}).join("");
  if(!l.length)return '<div class="empty">Tidak ada anggota yang cocok.</div>';
  return '<table class="tbl"><thead><tr><th>Anggota</th><th>Paket</th><th>Berakhir</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table><div class="pg"><span>'+l.length+' anggota &middot; halaman '+A.page+' dari '+pages+'</span><span class="rowf" style="flex:none"><button class="btn s" type="button" data-act="mpage" data-d="-1"'+(A.page<=1?" disabled":"")+'>Sebelumnya</button><button class="btn s" type="button" data-act="mpage" data-d="1"'+(A.page>=pages?" disabled":"")+'>Berikutnya</button></span></div>';
}
function tAnggota(){
  return '<div class="toolbar"><label class="fld" style="flex:2 1 200px"><span>Cari nama, nomor, telepon</span><input class="inp" id="mq" value="'+esc(A.q)+'" autocomplete="off"></label><label class="fld"><span>Status</span><select id="mf">'+statusOpts().map(function(o){return '<option value="'+o[0]+'"'+(A.f===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></label><label class="fld"><span>Urutkan</span><select id="ms">'+[["name","Nama"],["no","Nomor"],["end","Berakhir terdekat"],["new","Terbaru"]].map(function(o){return '<option value="'+o[0]+'"'+(A.sort===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></label></div><div class="rowf" style="margin-bottom:12px"><button class="btn p" type="button" data-act="madd">Tambah anggota</button><button class="btn" type="button" data-act="csvm">Unduh CSV</button></div><div id="mlist">'+memberList()+'</div>';
}
function memberSheet(id){
  var m=id?mById(id):null,isNew=!m;
  var planSel=db.plans.map(function(p){return '<option value="'+p.id+'"'+((m?m.planId:2)===p.id?" selected":"")+'>'+esc(p.name)+' ('+rp(p.price)+')</option>'}).join("");
  var f='<form data-form="member" novalidate><input type="hidden" name="id" value="'+(m?m.id:"")+'"><label class="fld"><span>Nama lengkap</span><input class="inp" name="name" maxlength="60" value="'+esc(m?m.name:"")+'"></label><div class="two k"><label class="fld"><span>Telepon</span><input class="inp" name="phone" inputmode="tel" value="'+esc(m?fmtPhone(m.phone):"")+'" placeholder="0812-0000-1234"></label><label class="fld"><span>Tanggal lahir</span><input class="inp" type="date" name="birth" max="'+today()+'" value="'+esc(m?m.birth:"")+'"></label></div><label class="fld"><span>Email (opsional)</span><input class="inp" type="email" name="email" maxlength="80" value="'+esc(m?m.email:"")+'"></label><label class="fld"><span>Paket</span><select name="plan">'+planSel+'</select></label>';
  if(isNew)f+='<div class="two k"><label class="fld"><span>Mulai</span><input class="inp" type="date" name="start" value="'+today()+'" max="'+addDays(today(),60)+'"></label><label class="fld"><span>Metode bayar</span><select name="method"><option>Tunai</option><option>QRIS</option><option>Transfer</option><option>Kartu debit</option></select></label></div><p class="mu sm">Dicatat sebagai pembayaran paket + biaya kartu '+rp(REG_FEE)+'.</p>';
  else f+='<div class="two k"><label class="fld"><span>Mulai</span><input class="inp" type="date" name="start" value="'+m.start+'"></label><label class="fld"><span>Berakhir</span><input class="inp" type="date" name="end" value="'+m.end+'"></label></div><label class="fld"><span>Catatan</span><textarea name="note" maxlength="200">'+esc(m.note)+'</textarea></label><p class="sm mu">Status: '+badge(m)+' &middot; kunjungan tercatat '+db.visits.filter(function(v){return v.mid===m.id}).length+'</p>';
  f+='<button class="btn p w" type="submit">'+(isNew?"Simpan anggota":"Simpan perubahan")+'</button></form>';
  if(m){var bf=m.frozen?'<button class="btn" type="button" data-act="afreeze" data-id="'+m.id+'" data-v="0">Aktifkan kembali</button>':'<button class="btn" type="button" data-act="afreeze" data-id="'+m.id+'" data-v="1">Bekukan</button>';f+='<div class="sep"></div><div class="rowf"><a class="btn" href="#/kartu/'+esc(m.no)+'">Kartu</a><button class="btn" type="button" data-act="mren" data-id="'+m.id+'">Perpanjang</button>'+bf+'<button class="btn d" type="button" data-act="mdel" data-id="'+m.id+'" data-arm="1">Hapus anggota</button></div>'}
  openSheet(isNew?"Tambah anggota":"Ubah anggota",f);
}
function validMember(f,self){
  var name=f.name.value.trim(),ph=normPhone(f.phone.value),em=f.email.value.trim(),b=f.birth.value;
  if(name.length<3)return"Nama minimal 3 huruf.";
  if(!/^[A-Za-zÀ-ɏ .,'\-]+$/.test(name))return"Nama hanya boleh berisi huruf dan spasi.";
  if(!/^08\d{8,11}$/.test(ph))return"Telepon harus diawali 08 dan 10 sampai 13 angka.";
  var dup=memberByPhone(ph);if(dup&&(!self||dup.id!==self.id))return"Telepon ini sudah dipakai "+dup.name+" ("+dup.no+").";
  if(em&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))return"Format email belum benar.";
  if(!b)return"Tanggal lahir wajib diisi.";
  return"";
}

/* ---------- kelas dan jadwal ---------- */
function tKelas(){
  var cl=liveClasses().map(function(c){return '<div class="li"><div class="l"><b>'+esc(c.name)+'</b><div class="mu sm">'+esc(c.level)+' &middot; '+c.dur+' menit</div></div><div class="a rowf"><button class="btn s" type="button" data-act="cedit" data-id="'+c.id+'">Ubah</button><button class="btn s d" type="button" data-act="cdel" data-id="'+c.id+'" data-arm="1">Hapus</button></div></div>'}).join("");
  var days=DORDER.map(function(dw){var l=liveSessions().filter(function(s){return s.dow===dw}).sort(function(a,b){return a.time<b.time?-1:1});return '<div class="card"><h3>'+DOW[dw]+'</h3><div class="list">'+(l.map(function(s){return '<div class="li"><div class="l"><b>'+s.time.replace(":",".")+' '+esc(cls(s.classId).name)+'</b><div class="mu sm">'+esc((coach(s.coachId)||{}).name||"-")+' &middot; '+esc(s.room)+' &middot; kuota '+s.cap+'</div></div><div class="a rowf"><button class="btn s" type="button" data-act="sedit" data-id="'+s.id+'">Ubah</button><button class="btn s d" type="button" data-act="sdel" data-id="'+s.id+'" data-arm="1">Hapus</button></div></div>'}).join("")||'<div class="mu sm">Tidak ada kelas.</div>')+'</div></div>'}).join("");
  return '<div class="rowf" style="margin-bottom:14px"><button class="btn p" type="button" data-act="cadd">Tambah kelas</button><button class="btn p" type="button" data-act="sadd">Tambah sesi jadwal</button></div><h3>Jenis kelas ('+liveClasses().length+')</h3><div class="list" style="margin-bottom:22px">'+cl+'</div><h3>Jadwal mingguan</h3><div class="grid g2">'+days+'</div>';
}
function classSheet(id){
  var c=id?cls(id):null;
  var po=[""].concat(Object.keys(PHOTOS)).map(function(k){return '<option value="'+k+'"'+((c?c.photo:"")===k?" selected":"")+'>'+(k?PHOTOS[k]:"Tanpa foto (blok warna)")+'</option>'}).join("");
  openSheet(c?"Ubah kelas":"Tambah kelas",'<form data-form="class" novalidate><input type="hidden" name="id" value="'+(c?c.id:"")+'"><label class="fld"><span>Nama kelas</span><input class="inp" name="name" maxlength="30" value="'+esc(c?c.name:"")+'"></label><div class="two k"><label class="fld"><span>Level</span><select name="level">'+["Semua level","Pemula","Menengah"].map(function(x){return '<option'+((c?c.level:"Semua level")===x?" selected":"")+'>'+x+'</option>'}).join("")+'</select></label><label class="fld"><span>Durasi (menit)</span><input class="inp" name="dur" inputmode="numeric" value="'+(c?c.dur:60)+'"></label></div><label class="fld"><span>Foto</span><select name="photo">'+po+'</select></label><label class="fld"><span>Warna (untuk blok tanpa foto)</span><input class="inp" type="color" name="color" value="'+esc(c?c.color:"#3b8fe0")+'" style="padding:4px"></label><label class="fld"><span>Deskripsi</span><textarea name="desc" maxlength="200">'+esc(c?c.desc:"")+'</textarea></label><button class="btn p w" type="submit">Simpan kelas</button></form>');
}
function sessionSheet(id){
  var s=id?sess(id):null;
  var cs=liveClasses().map(function(c){return '<option value="'+c.id+'"'+(s&&s.classId===c.id?" selected":"")+'>'+esc(c.name)+'</option>'}).join("");
  var ds=DORDER.map(function(d){return '<option value="'+d+'"'+(s&&s.dow===d?" selected":"")+'>'+DOW[d]+'</option>'}).join("");
  var co=db.coaches.map(function(c){return '<option value="'+c.id+'"'+(s&&s.coachId===c.id?" selected":"")+'>'+esc(c.name)+'</option>'}).join("");
  var rs=ROOMS.map(function(r){return '<option'+(s&&s.room===r?" selected":"")+'>'+r+'</option>'}).join("");
  openSheet(s?"Ubah sesi jadwal":"Tambah sesi jadwal",'<form data-form="session" novalidate><input type="hidden" name="id" value="'+(s?s.id:"")+'"><label class="fld"><span>Kelas</span><select name="cid">'+cs+'</select></label><div class="two k"><label class="fld"><span>Hari</span><select name="dow">'+ds+'</select></label><label class="fld"><span>Jam mulai</span><input class="inp" type="time" name="time" value="'+(s?s.time:"07:00")+'"></label></div><div class="two k"><label class="fld"><span>Kuota</span><input class="inp" name="cap" inputmode="numeric" value="'+(s?s.cap:12)+'"></label><label class="fld"><span>Ruang</span><select name="room">'+rs+'</select></label></div><label class="fld"><span>Pelatih</span><select name="coach">'+co+'</select></label><button class="btn p w" type="submit">Simpan sesi</button></form>');
}

/* ---------- kehadiran ---------- */
function tKehadiran(){
  var t=today();if(!A.attDate)A.attDate=t;var d=A.attDate;
  var inst=dayInstances(d).map(function(s){
    var c=cls(s.classId),all=db.bookings.filter(function(b){return b.sid===s.id&&b.date===d&&b.status!=="cancelled"}).sort(function(a,b){return a.id-b.id});
    var rows=all.map(function(b){var m=mById(b.mid),st=BST[b.status];return '<div class="li"><div class="l"><b>'+esc(m?m.name:"-")+'</b> <span class="mu sm">'+esc(m?m.no:"")+'</span></div><span class="pill '+st[1]+'">'+st[0]+'</span>'+(b.status==="wait"?'':'<div class="a rowf"><button class="btn s" type="button" data-act="attm" data-id="'+b.id+'" data-v="attended">Hadir</button><button class="btn s" type="button" data-act="attm" data-id="'+b.id+'" data-v="noshow">Tidak hadir</button>'+(b.status==="booked"?'<button class="btn s d" type="button" data-act="cancelb" data-id="'+b.id+'">Batalkan</button>':'')+'</div>')+'</div>'}).join("");
    return '<div class="card"><div class="rowf" style="justify-content:space-between;align-items:baseline"><h3 style="margin:0">'+s.time.replace(":",".")+' '+esc(c.name)+'</h3><span class="mu sm">'+booked(s.id,d)+'/'+s.cap+(waitN(s.id,d)?' &middot; '+waitN(s.id,d)+' menunggu':'')+'</span></div><div class="mu sm" style="margin-bottom:8px">'+esc((coach(s.coachId)||{}).name||"")+' &middot; '+esc(s.room)+'</div><div class="list">'+(rows||'<div class="mu sm">Belum ada peserta.</div>')+'</div></div>'}).join("")||'<div class="empty">Tidak ada kelas pada tanggal ini.</div>';
  var vs=db.visits.filter(function(v){return dOf(v.at)===d}).sort(function(a,b){return a.at<b.at?-1:1});
  var vals=[],lb=[];for(var i=13;i>=0;i--){var dd=addDays(t,-i);vals.push(db.visits.filter(function(v){return dOf(v.at)===dd}).length);lb.push(P(dd).getDate()+" "+MON[P(dd).getMonth()])}
  return '<div class="toolbar"><label class="fld"><span>Tanggal</span><input class="inp" type="date" id="attd" value="'+d+'"></label><button class="btn" type="button" data-act="csvv">Unduh CSV kunjungan</button></div><div class="card" style="margin-bottom:14px"><h3>Kunjungan 14 hari terakhir</h3>'+barChart(vals,lb,null)+'</div><div class="split"><div><h3>Kelas, '+fmtDay(d)+'</h3><div class="grid">'+inst+'</div></div><div><h3>Check-in, '+fmtDay(d)+' ('+vs.length+')</h3><div class="list">'+(vs.map(function(v){var m=mById(v.mid);return '<div class="li"><div class="l"><b>'+esc(m?m.name:"-")+'</b> <span class="mu sm">'+esc(m?m.no:"")+'</span></div><span class="mu">'+hm(v.at)+'</span></div>'}).join("")||'<div class="empty">Tidak ada check-in.</div>')+'</div></div></div>';
}

/* ---------- kasir ---------- */
function tKasir(){
  var ms=db.members.slice().sort(function(a,b){return a.name.localeCompare(b.name)}).map(function(m){return '<option value="'+m.id+'">'+esc(m.name)+' ('+esc(m.no)+')</option>'}).join("");
  var last=db.payments.slice(-8).reverse().map(function(p){return '<div class="li"><div class="l"><b>'+esc(p.label)+'</b><div class="mu sm">'+esc(p.name)+' &middot; '+fmtDate(dOf(p.at))+' '+hm(p.at)+'</div></div><b>'+rp(p.amount)+'</b><button class="btn s" type="button" data-act="receipt" data-id="'+p.id+'">Struk</button></div>'}).join("");
  return '<div class="split"><div class="grid"><form class="card" data-form="ksale" novalidate><h3>Paket untuk anggota</h3><label class="fld"><span>Anggota</span><select name="mid"><option value="">Pilih anggota</option>'+ms+'</select></label><button class="btn p w" type="submit">Pilih paket dan bayar</button></form><form class="card" data-form="daypass" novalidate><h3>Day pass ('+rp(DAYPASS)+')</h3><label class="fld"><span>Nama tamu (opsional)</span><input class="inp" name="name" maxlength="40"></label><label class="fld"><span>Metode bayar</span><select name="method"><option>Tunai</option><option>QRIS</option><option>Kartu debit</option></select></label><button class="btn p w" type="submit">Catat day pass</button></form></div><div><h3>Transaksi terakhir</h3><div class="list">'+last+'</div></div></div>';
}

/* ---------- pendapatan ---------- */
function payRange(){var s=addDays(today(),-(A.range-1));return db.payments.filter(function(p){return dOf(p.at)>=s}).sort(function(a,b){return a.at<b.at?1:-1})}
function tPendapatan(){
  var l=payRange(),tot=l.reduce(function(s,p){return s+p.amount},0),t=today();
  var by={daftar:0,perpanjang:0,daypass:0},cnt={daftar:0,perpanjang:0,daypass:0};l.forEach(function(p){by[p.kind]=(by[p.kind]||0)+p.amount;cnt[p.kind]=(cnt[p.kind]||0)+1});
  var vals=[],lb=[];for(var i=A.range-1;i>=0;i--){var d=addDays(t,-i);vals.push(l.filter(function(p){return dOf(p.at)===d}).reduce(function(s,p){return s+p.amount},0));lb.push(P(d).getDate()+" "+MON[P(d).getMonth()])}
  var per=10,pages=Math.max(1,Math.ceil(l.length/per));if(A.ppage>pages)A.ppage=pages;
  var rows=l.slice((A.ppage-1)*per,A.ppage*per).map(function(p){return '<tr><td class="nl"><b>'+esc(p.label)+'</b><div class="mu sm">'+esc(p.name)+'</div></td><td data-l="Tanggal">'+fmtDate(dOf(p.at))+'</td><td data-l="Metode">'+esc(p.method)+'</td><td data-l="Total"><b>'+rp(p.amount)+'</b></td><td class="nl"><button class="btn s" type="button" data-act="receipt" data-id="'+p.id+'">Struk</button></td></tr>'}).join("");
  var K={daftar:"Anggota baru",perpanjang:"Perpanjangan",daypass:"Day pass"};
  return '<div class="toolbar"><label class="fld"><span>Periode</span><select id="rng">'+[7,30,90].map(function(n){return '<option value="'+n+'"'+(A.range===n?" selected":"")+'>'+n+' hari terakhir</option>'}).join("")+'</select></label><button class="btn" type="button" data-act="csvp">Unduh CSV</button></div><div class="grid g4" style="margin-bottom:14px"><div class="stat"><b>'+rp(tot)+'</b><span>Total pendapatan</span></div><div class="stat"><b>'+l.length+'</b><span>Transaksi</span></div><div class="stat"><b>'+rp(l.length?tot/l.length:0)+'</b><span>Rata-rata transaksi</span></div><div class="stat"><b>'+cnt.daftar+'</b><span>Anggota baru</span></div></div><div class="card" style="margin-bottom:14px"><h3>Pendapatan harian</h3>'+barChart(vals,lb,rp)+'</div><div class="grid g3" style="margin-bottom:14px">'+Object.keys(K).map(function(k){return '<div class="stat"><b>'+rp(by[k]||0)+'</b><span>'+K[k]+' ('+(cnt[k]||0)+')</span></div>'}).join("")+'</div>'+(l.length?'<table class="tbl"><thead><tr><th>Transaksi</th><th>Tanggal</th><th>Metode</th><th>Total</th><th></th></tr></thead><tbody>'+rows+'</tbody></table><div class="pg"><span>Halaman '+A.ppage+' dari '+pages+'</span><span class="rowf" style="flex:none"><button class="btn s" type="button" data-act="ppage" data-d="-1"'+(A.ppage<=1?" disabled":"")+'>Sebelumnya</button><button class="btn s" type="button" data-act="ppage" data-d="1"'+(A.ppage>=pages?" disabled":"")+'>Berikutnya</button></span></div>':'<div class="empty">Belum ada transaksi pada periode ini.</div>');
}

/* ---------- segera habis ---------- */
function expList(win){return db.members.filter(function(m){var s=mState(m);return(s==="active"||s==="soon")&&remaining(m)<=win}).sort(function(a,b){return a.end<b.end?-1:1})}
function tHabis(){
  var l=expList(A.expWin),t=today();
  var ex=db.members.filter(function(m){return mState(m)==="expired"&&diff(m.end,t)<=30}).sort(function(a,b){return a.end<b.end?1:-1});
  function row(m,k){var left=remaining(m);return '<div class="li"><div class="l"><b>'+esc(m.name)+'</b><div class="mu sm">'+esc(m.no)+' &middot; '+esc(plan(m.planId).name)+' &middot; '+(k==="expired"?"berakhir "+Math.abs(left)+" hari lalu":(left===0?"berakhir hari ini":left+" hari lagi"))+'</div></div><div class="a rowf"><a class="btn s" href="'+mailWa(m,k)+'" target="_blank" rel="noopener">Ingatkan via WhatsApp</a><button class="btn s p" type="button" data-act="mren" data-id="'+m.id+'">Perpanjang</button></div></div>'}
  return '<div class="toolbar"><label class="fld"><span>Berakhir dalam</span><select id="ew">'+[7,14,30].map(function(n){return '<option value="'+n+'"'+(A.expWin===n?" selected":"")+'>'+n+' hari</option>'}).join("")+'</select></label></div><h3>Akan habis ('+l.length+')</h3><div class="list" style="margin-bottom:22px">'+(l.map(function(m){return row(m,"soon")}).join("")||'<div class="empty">Tidak ada anggota yang akan habis dalam '+A.expWin+' hari.</div>')+'</div><h3>Baru kedaluwarsa, 30 hari terakhir ('+ex.length+')</h3><div class="list">'+(ex.map(function(m){return row(m,"expired")}).join("")||'<div class="empty">Tidak ada.</div>')+'</div>';
}

/* ---------- paket dan promo ---------- */
function tPaket(){
  var pl=db.plans.map(function(p){return '<div class="li"><div class="l"><b>'+esc(p.name)+'</b> &middot; '+rp(p.price)+'<div class="mu sm">'+p.months+' bulan &middot; '+rp(perMonth(p))+' per bulan &middot; '+db.members.filter(function(m){return m.planId===p.id}).length+' anggota</div></div><button class="btn s" type="button" data-act="pedit" data-id="'+p.id+'">Ubah</button></div>'}).join("");
  var pr=db.promos.map(function(x){return '<div class="li"><div class="l"><b>'+esc(x.code)+'</b> <span class="pill '+(x.active?"ok":"mt")+'">'+(x.active?"Aktif":"Nonaktif")+'</span><div class="mu sm">'+(x.type==="pct"?x.val+"%":rp(x.val))+' &middot; min '+x.minMonths+' bulan &middot; dipakai '+x.used+(x.max?" dari "+x.max:"")+'</div></div><div class="a rowf"><button class="btn s" type="button" data-act="ptoggle" data-c="'+esc(x.code)+'">'+(x.active?"Nonaktifkan":"Aktifkan")+'</button><button class="btn s d" type="button" data-act="pdel" data-c="'+esc(x.code)+'" data-arm="1">Hapus</button></div></div>'}).join("")||'<div class="empty">Belum ada promo.</div>';
  return '<div class="split"><div><h3>Paket</h3><div class="list">'+pl+'</div></div><div><h3>Kode promo</h3><div class="list" style="margin-bottom:14px">'+pr+'</div><form class="card" data-form="promo" novalidate><h4>Tambah kode</h4><div class="two k"><label class="fld"><span>Kode</span><input class="inp" name="code" maxlength="20" autocomplete="off" placeholder="MERDEKA"></label><label class="fld"><span>Jenis</span><select name="type"><option value="pct">Persen</option><option value="flat">Nominal (Rp)</option></select></label></div><div class="two k"><label class="fld"><span>Nilai</span><input class="inp" name="val" inputmode="numeric"></label><label class="fld"><span>Paket minimal (bulan)</span><select name="min"><option value="1">1</option><option value="3">3</option><option value="12">12</option></select></label></div><label class="fld"><span>Kuota (0 = tanpa batas)</span><input class="inp" name="max" inputmode="numeric" value="0"></label><button class="btn p w" type="submit">Tambah kode</button></form></div></div>';
}
function planSheet(id){
  var p=plan(id);
  openSheet("Ubah paket "+p.name,'<form data-form="plan" novalidate><input type="hidden" name="id" value="'+p.id+'"><label class="fld"><span>Nama paket</span><input class="inp" name="name" maxlength="20" value="'+esc(p.name)+'"></label><label class="fld"><span>Harga (Rp)</span><input class="inp" name="price" inputmode="numeric" value="'+p.price+'"></label><label class="fld"><span>Keuntungan (satu per baris)</span><textarea name="perks" maxlength="300">'+esc(p.perks.join("\n"))+'</textarea></label><p class="mu sm">Lama paket ('+p.months+' bulan) tetap. Harga baru berlaku untuk transaksi berikutnya.</p><button class="btn p w" type="submit">Simpan paket</button></form>');
}
function tSetelan(){
  return '<div class="split"><form class="card" data-form="pin" novalidate><h3>Ganti PIN panel</h3><label class="fld"><span>PIN baru (4 angka)</span><input class="inp" name="pin" inputmode="numeric" maxlength="4" autocomplete="off"></label><button class="btn p w" type="submit">Simpan PIN</button></form><div class="card"><h3>Data demo</h3><p class="mu sm">Semua data tersimpan di peramban ini. Reset mengembalikan data contoh seperti awal.</p><button class="btn d w" type="button" data-act="reset">Reset data demo</button></div></div>';
}

/* ---------- form admin ---------- */
var ADMIN_FORMS={
  adminlogin:function(f){if(f.pin.value!==db.pin)return ferr(f,"PIN salah.");sessionStorage.setItem(ADM,"1");toast("Masuk panel gym.");go("#/admin/checkin")},
  ci:function(f){
    var q=f.q.value.trim();if(!q)return ferr(f,"Ketik nomor anggota, nama, atau telepon.");
    var m=memberByNo(q);if(!m){var l=findMembers(q);if(l.length===1)m=l[0];else if(l.length>1){A.ciq=q;$("cires").innerHTML=cands(q);return ferr(f,"Ada "+l.length+" anggota cocok. Pilih salah satu di bawah.")}}
    if(!m){A.res=null;$("cimsg").innerHTML="";return ferr(f,"Anggota tidak ditemukan. Cek nomor atau nama.")}
    doCheckIn(m);
  },
  member:function(f){
    var self=f.id.value?mById(+f.id.value):null,e=validMember(f,self);if(e)return ferr(f,e);
    var pl=plan(+f.plan.value);
    if(!self){
      var s=f.start.value;if(!s||s>addDays(today(),60))return ferr(f,"Tanggal mulai tidak valid (maksimal 60 hari ke depan).");
      var id=nid("m"),m={id:id,no:"GYM-"+("0000"+id).slice(-4),name:f.name.value.trim(),phone:normPhone(f.phone.value),email:f.email.value.trim(),birth:f.birth.value,planId:pl.id,start:s,end:addDays(addMonths(s,pl.months),-1),frozen:null,freezeDays:0,joined:today(),note:"",goal:"Kebugaran umum"};
      db.members.push(m);var pay=addPayment({mid:id,name:m.name,kind:"daftar",label:"Paket "+pl.name+" + kartu",amount:pl.price+REG_FEE,method:f.method.value});save();
      toast("Anggota "+m.no+" ditambahkan.");rerender();openReceipt(pay);return;
    }
    if(!f.start.value||!f.end.value)return ferr(f,"Tanggal mulai dan berakhir wajib diisi.");
    if(f.end.value<f.start.value)return ferr(f,"Tanggal berakhir tidak boleh sebelum tanggal mulai.");
    self.name=f.name.value.trim();self.phone=normPhone(f.phone.value);self.email=f.email.value.trim();self.birth=f.birth.value;self.planId=pl.id;self.start=f.start.value;self.end=f.end.value;self.note=f.note.value.trim();
    save();closeSheet();toast("Perubahan tersimpan.");rerender();
  },
  "class":function(f){
    var name=f.name.value.trim(),dur=+f.dur.value;
    if(name.length<2)return ferr(f,"Nama kelas minimal 2 huruf.");
    if(liveClasses().some(function(c){return c.name.toLowerCase()===name.toLowerCase()&&String(c.id)!==f.id.value}))return ferr(f,"Sudah ada kelas dengan nama itu.");
    if(!/^\d+$/.test(f.dur.value.trim())||dur<15||dur>120)return ferr(f,"Durasi harus 15 sampai 120 menit.");
    var c=f.id.value?cls(+f.id.value):null;if(!c){c={id:Math.max.apply(null,db.classes.map(function(x){return x.id}))+1};db.classes.push(c)}
    c.name=name;c.level=f.level.value;c.dur=dur;c.photo=f.photo.value;c.color=f.color.value;c.desc=f.desc.value.trim()||"Kelas grup.";
    save();closeSheet();toast("Kelas tersimpan.");rerender();
  },
  session:function(f){
    var cap=+f.cap.value,tm=f.time.value,dow=+f.dow.value,c=cls(+f.cid.value),id=f.id.value?+f.id.value:0;
    if(!tm)return ferr(f,"Jam mulai wajib diisi.");
    if(!/^\d+$/.test(f.cap.value.trim())||cap<1||cap>60)return ferr(f,"Kuota harus 1 sampai 60.");
    var a1=tm,e1=new Date(2000,0,1,+tm.split(":")[0],+tm.split(":")[1]+c.dur),s1=new Date(2000,0,1,+tm.split(":")[0],+tm.split(":")[1]),bad=null;
    liveSessions().forEach(function(o){if(o.id===id||o.dow!==dow||o.room!==f.room.value)return;var os=new Date(2000,0,1,+o.time.split(":")[0],+o.time.split(":")[1]),oe=new Date(os.getTime()+cls(o.classId).dur*60000);if(os<e1&&oe>s1)bad=o});
    if(bad)return ferr(f,f.room.value+" sudah dipakai "+cls(bad.classId).name+" pukul "+bad.time.replace(":",".")+" pada hari itu.");
    if(id){var mx=0;for(var i=0;i<7;i++){var d=addDays(today(),i);if(P(d).getDay()===sess(id).dow)mx=Math.max(mx,booked(id,d))}if(cap<mx)return ferr(f,"Sudah ada "+mx+" peserta terdaftar pada jadwal mendatang. Kuota tidak boleh lebih kecil.")}
    var s=id?sess(id):null;if(!s){s={id:nid("s")};db.sessions.push(s)}
    s.classId=c.id;s.dow=dow;s.time=tm;s.cap=cap;s.room=f.room.value;s.coachId=+f.coach.value;
    for(var j=0;j<7;j++){var dd=addDays(today(),j);if(P(dd).getDay()===dow)promote(s.id,dd)}
    save();closeSheet();toast("Sesi jadwal tersimpan.");rerender();
  },
  ksale:function(f){if(!f.mid.value)return ferr(f,"Pilih anggota dulu.");openRenew(+f.mid.value,"kasir")},
  daypass:function(f){var p=addPayment({mid:0,name:f.name.value.trim()||"Tamu",kind:"daypass",label:"Day pass",amount:DAYPASS,method:f.method.value});save();toast("Day pass dicatat.");rerender();openReceipt(p)},
  promo:function(f){
    var code=f.code.value.trim().toUpperCase(),val=+f.val.value,max=+f.max.value,type=f.type.value;
    if(!/^[A-Z0-9]{3,20}$/.test(code))return ferr(f,"Kode 3 sampai 20 huruf atau angka tanpa spasi.");
    if(db.promos.some(function(p){return p.code===code}))return ferr(f,"Kode "+code+" sudah ada.");
    if(!/^\d+$/.test(f.val.value.trim())||val<1)return ferr(f,"Isi nilai promo dengan angka.");
    if(type==="pct"&&val>90)return ferr(f,"Persen maksimal 90.");
    if(type==="flat"&&(val<1000||val>1000000))return ferr(f,"Potongan nominal antara Rp 1.000 dan Rp 1.000.000.");
    if(!/^\d+$/.test(f.max.value.trim()))return ferr(f,"Kuota harus angka (0 = tanpa batas).");
    db.promos.push({code:code,type:type,val:val,minMonths:+f.min.value,max:max,used:0,active:true});save();toast("Kode "+code+" ditambahkan.");rerender();
  },
  plan:function(f){
    var p=plan(+f.id.value),name=f.name.value.trim(),price=+f.price.value,perks=f.perks.value.split("\n").map(function(x){return x.trim()}).filter(Boolean);
    if(name.length<2)return ferr(f,"Nama paket minimal 2 huruf.");
    if(!/^\d+$/.test(f.price.value.trim())||price<50000||price>20000000)return ferr(f,"Harga harus antara Rp 50.000 dan Rp 20.000.000.");
    if(!perks.length)return ferr(f,"Isi minimal satu keuntungan.");
    p.name=name;p.price=price;p.perks=perks.slice(0,8);save();closeSheet();toast("Paket tersimpan.");rerender();
  },
  pin:function(f){if(!/^\d{4}$/.test(f.pin.value))return ferr(f,"PIN harus 4 angka.");db.pin=f.pin.value;save();f.reset();toast("PIN diganti.")}
};

/* ---------- aksi admin ---------- */
function adminAct(a,el,e){
  var d=el.dataset,id=+d.id;
  switch(a){
    case"adminout":sessionStorage.removeItem(ADM);toast("Keluar dari panel.");go("#/admin");break;
    case"ci":doCheckIn(mById(id));break;
    case"mpage":A.page+=+d.d;$("mlist").innerHTML=memberList();break;
    case"ppage":A.ppage+=+d.d;rerender();break;
    case"madd":memberSheet(0);break;
    case"medit":memberSheet(id);break;
    case"mren":openRenew(id,"admin");break;
    case"mdel":{var m=mById(id);db.members=db.members.filter(function(x){return x.id!==id});db.bookings.forEach(function(b){if(b.mid===id&&(b.status==="booked"||b.status==="wait")&&b.date>=today()){b.status="cancelled"}});
      db.sessions.forEach(function(s){for(var i=0;i<7;i++){var dd=addDays(today(),i);if(P(dd).getDay()===s.dow)promote(s.id,dd)}});
      save();closeSheet();toast("Anggota "+m.no+" dihapus.");rerender();break}
    case"afreeze":{var mm=mById(id),r=d.v==="1"?freezeMember(mm):unfreezeMember(mm);toast(r.msg,!r.ok);if(r.ok){closeSheet();rerender()}break}
    case"cadd":classSheet(0);break;
    case"cedit":classSheet(id);break;
    case"cdel":{var c=cls(id);if(liveSessions().some(function(s){return s.classId===id})){toast("Hapus dulu semua sesi jadwal kelas "+c.name+".",1);break}c.removed=true;save();toast("Kelas dihapus.");rerender();break}
    case"sadd":sessionSheet(0);break;
    case"sedit":sessionSheet(id);break;
    case"sdel":{var s=sess(id),n=0;db.bookings.forEach(function(b){if(b.sid===id&&b.date>=today()&&(b.status==="booked"||b.status==="wait")){b.status="cancelled";n++;db.notifs.push({id:nid("n"),mid:b.mid,at:nowIso(),text:"Kelas "+cls(s.classId).name+" "+fmtDay(b.date)+" dibatalkan oleh gym."})}});s.removed=true;save();toast("Sesi dihapus."+(n?" "+n+" booking dibatalkan.":""));rerender();break}
    case"attm":{db.bookings.forEach(function(b){if(b.id===id)b.status=d.v});save();rerender();break}
    case"pedit":planSheet(id);break;
    case"ptoggle":db.promos.forEach(function(p){if(p.code===d.c)p.active=!p.active});save();rerender();break;
    case"pdel":db.promos=db.promos.filter(function(p){return p.code!==d.c});save();toast("Kode dihapus.");rerender();break;
    case"csvm":downloadCsv("anggota-kinetik.csv",[["Nomor","Nama","Telepon","Email","Paket","Mulai","Berakhir","Status","Sisa hari"]].concat(db.members.map(function(m){return[m.no,m.name,fmtPhone(m.phone),m.email,plan(m.planId).name,m.start,m.end,STL[mState(m)][0],remaining(m)]})));toast("CSV anggota diunduh.");break;
    case"csvp":downloadCsv("pendapatan-kinetik.csv",[["No","Tanggal","Jam","Nama","Jenis","Keterangan","Promo","Potongan","Metode","Total"]].concat(payRange().map(function(p){return[p.no,dOf(p.at),hm(p.at),p.name,p.kind,p.label,p.promo||"",p.disc||0,p.method,p.amount]})));toast("CSV pendapatan diunduh.");break;
    case"csvv":downloadCsv("kunjungan-kinetik.csv",[["Tanggal","Jam","Nomor","Nama"]].concat(db.visits.slice().sort(function(a,b){return a.at<b.at?1:-1}).map(function(v){var m=mById(v.mid)||{};return[dOf(v.at),hm(v.at),m.no||"",m.name||""]})));toast("CSV kunjungan diunduh.");break;
  }
}
document.addEventListener("input",function(e){
  var t=e.target;
  if(t.id==="mq"){A.q=t.value;A.page=1;$("mlist").innerHTML=memberList()}
  if(t.id==="ciq"){A.ciq=t.value;$("cires").innerHTML=cands(t.value)}
});
document.addEventListener("change",function(e){
  var t=e.target;
  if(t.id==="mf"){A.f=t.value;A.page=1;$("mlist").innerHTML=memberList()}
  if(t.id==="ms"){A.sort=t.value;$("mlist").innerHTML=memberList()}
  if(t.id==="rng"){A.range=+t.value;A.ppage=1;rerender()}
  if(t.id==="ew"){A.expWin=+t.value;rerender()}
  if(t.id==="attd"){A.attDate=t.value||today();rerender()}
});
