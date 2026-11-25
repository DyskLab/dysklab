"use strict";
var adminOK=false;
function isAdmin(){try{return sessionStorage.getItem(AKEY)==="1"}catch(e){return adminOK}}
function setAdmin(v){adminOK=v;try{v?sessionStorage.setItem(AKEY,"1"):sessionStorage.removeItem(AKEY)}catch(e){}}
function openSheet(title,html){var s=$("#sheet");s.innerHTML='<h3><span id="sheett">'+esc(title)+'</span><button type="button" class="btn sm" data-act="closesheet">Tutup</button></h3>'+html;$("#sheetbg").classList.add("on");sheetOpen=true;var f=$("input:not([type=hidden]),select,textarea,button.btn:not([data-act=closesheet])",s);if(f)f.focus()}
function closeSheet(){$("#sheetbg").classList.remove("on");$("#sheet").innerHTML="";sheetOpen=false}
function after(msg,bad){closeSheet();if(msg)toast(msg,bad);render()}
function fld(label,inner,hint){return'<label class="fld">'+label+inner+(hint?'<small>'+hint+'</small>':"")+'</label>'}

/* ---------- csv ---------- */
function csvText(rows){return"﻿"+rows.map(function(r){return r.map(function(c){c=String(c==null?"":c);if(/^[=+\-@\t\r]/.test(c))c="'"+c;return'"'+c.replace(/"/g,'""')+'"'}).join(",")}).join("\r\n")}
function csv(name,rows){var b=new Blob([csvText(rows)],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name+"-"+today()+".csv";document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);toast("CSV diunduh: "+a.download)}

/* ---------- shell ---------- */
var ATABS=[["dapur","Dapur"],["meja","Denah meja"],["reservasi","Reservasi"],["menu","Kelola menu"],["jam","Jam & pengaturan"],["laporan","Laporan"]];
function newOrders(){return db.orders.filter(function(o){return o.status==="baru"}).length}
function pendingResv(){return db.resv.filter(function(r){return r.status==="menunggu"}).length}
function adminShell(r){
  if(!isAdmin())return'<main><div class="wrap pg"><form class="card login" data-form="login" novalidate><div style="display:flex;justify-content:center;margin-bottom:6px">'+logo()+'</div><h1 style="margin:10px 0 4px">Panel restoran</h1><p style="color:var(--mute);margin:0 0 12px">Masukkan PIN untuk masuk.</p>'+errBox()+'<label class="fld" style="text-align:left">PIN (4 angka)<input class="inp" type="password" inputmode="numeric" maxlength="4" data-d="pin" autocomplete="off" id="pinin"></label><button class="btn pri blk" type="submit">Masuk</button><p style="margin:12px 0 0;color:var(--mute);font-size:.88rem">PIN demo: <span class="code" style="font-size:1rem;padding:2px 8px;margin:0">'+esc(db.set.pin===""?"1234":"1234")+'</span><br>Dipakai hanya di demo ini. Jika PIN sudah diganti, gunakan reset data.</p><p><a href="#/">Kembali ke situs</a></p></form></main>';
  var tab=r[1]||"dapur",P={dapur:aDapur,meja:aMeja,reservasi:aResv,menu:aMenu,jam:aJam,laporan:aLaporan};if(!P[tab])tab="dapur";
  var tabs=ATABS.map(function(t){var n=t[0]==="dapur"?newOrders():t[0]==="reservasi"?pendingResv():0;return'<a href="#/admin/'+t[0]+'"'+(t[0]===tab?' class="on" aria-current="page"':"")+'>'+t[1]+(n?' <i aria-label="'+n+' baru">'+n+'</i>':"")+'</a>'}).join("");
  return'<div class="ahead"><div class="wrap"><b>Panel restoran Sekar Jati</b><div style="display:flex;gap:8px"><a class="btn sm" href="#/">Lihat situs</a><button type="button" class="btn sm" data-act="logout">Keluar</button></div></div></div><main><div class="wrap pg"><nav class="atabs" aria-label="Panel">'+tabs+'</nav>'+P[tab]()+'</div></main>';
}
document.title="Sekar Jati | Contoh website restoran";

/* ---------- dapur ---------- */
var NEXT={baru:["masak","Mulai masak"],masak:["siap","Tandai siap"],siap:["selesai",null]};
function kCard(o){
  var nx=NEXT[o.status],lbl=nx&&(nx[1]||(o.mode==="antar"?"Sudah diantar":"Sudah diambil"));
  return'<div class="ko'+(o.status==="baru"?" new":"")+'"><div class="hd"><b>'+esc(o.code)+'</b>'+pill(o.mode==="antar"?"blue":"mute",o.mode==="antar"?"Antar":"Ambil")+'</div><small style="color:var(--mute)">'+esc(o.name)+' - '+esc(o.phone)+' - '+ago(o.t)+'</small><ul>'+o.items.map(function(i){return'<li>'+i.q+' x '+esc(i.n)+(i.note?'<small>'+esc(i.note)+'</small>':"")+'</li>'}).join("")+'</ul>'+(o.note?'<div class="note" style="margin:0">'+esc(o.note)+'</div>':"")+(o.mode==="antar"?'<small>Alamat: '+esc(o.addr)+'</small>':"")+'<div class="hd"><b>'+rp(o.total)+'</b><small>'+esc(PAYS[o.pay]||o.pay)+'</small></div>'+
  (nx?'<div class="acts">'+B("kstat",o.code,lbl,"pri sm")+B2("kcancel",o.code,"Batalkan","sm")+'</div>':"")+'</div>';
}
function aDapur(){
  var td=today(),cols=[["baru","Baru"],["masak","Dimasak"],["siap","Siap"],["selesai","Selesai hari ini"]];
  var by={};cols.forEach(function(c){by[c[0]]=db.orders.filter(function(o){return o.status===c[0]&&(c[0]!=="selesai"||ymd(new Date(o.t))===td)}).sort(function(a,b){return c[0]==="selesai"?b.t-a.t:a.t-b.t})});
  return'<h1>Papan dapur</h1><p style="color:var(--mute);margin:4px 0 12px">Status yang Anda ubah di sini langsung tampil di halaman lacak pelanggan.</p><div class="chips kseg" role="group" aria-label="Kolom" style="margin-bottom:12px">'+cols.map(function(c){return'<button type="button" class="chip'+(draft.kcol===c[0]?" on":"")+'" data-act="kcol" data-id="'+c[0]+'" data-fk="kcol:'+c[0]+'" aria-pressed="'+(draft.kcol===c[0])+'">'+c[1]+' <small>'+by[c[0]].length+'</small></button>'}).join("")+'</div><div class="kb">'+
  cols.map(function(c){return'<section class="kc'+(draft.kcol===c[0]?" on":"")+'" aria-label="'+c[1]+'"><h3>'+c[1]+'<span>'+by[c[0]].length+'</span></h3>'+(by[c[0]].length?by[c[0]].slice(0,c[0]==="selesai"?12:99).map(kCard).join(""):'<div class="empty">Tidak ada pesanan</div>')+'</section>'}).join("")+'</div>';
}
acts.kcol=function(el){draft.kcol=el.dataset.id;render()};
acts.kstat=function(el){var o=orderOf(el.dataset.id),nx=o&&NEXT[o.status];if(!nx){render();return}o.status=nx[0];o.hist.push({s:nx[0],t:Date.now()});save();draft.kcol=nx[0];toast(o.code+": "+OST[o.status]);render()};
acts.kcancel=function(el){var o=orderOf(el.dataset.id);if(!o||!NEXT[o.status])return;o.status="batal";o.why="Dibatalkan restoran";o.hist.push({s:"batal",t:Date.now()});save();toast(o.code+" dibatalkan");render()};

/* ---------- denah meja ---------- */
function tstat(t,date,slot){
  if(t.off)return{s:"off",label:"Tidak dipakai"};
  var r=db.resv.filter(function(x){return x.table===t.id&&x.date===date&&x.slot===slot&&ACTIVE.indexOf(x.status)>=0})[0];
  return r?{s:r.status,label:RST[r.status],r:r}:{s:"kosong",label:"Kosong"};
}
function aMeja(){
  if(!validDate(draft.mdate))draft.mdate=today();
  if(SLOTS.indexOf(draft.mslot)<0){var n=Date.now();draft.mslot=SLOTS.filter(function(s){return slotT(draft.mdate,s)+SLOTMIN*60000>n})[0]||SLOTS[SLOTS.length-1]}
  var d=draft.mdate,sl=draft.mslot,di=dayInfo(d),st=db.tables.map(function(t){return tstat(t,d,sl)}),used=0,seats=0,tot=0;
  db.tables.forEach(function(t,i){if(!t.off){tot+=t.seats;if(st[i].s!=="kosong")seats+=t.seats}if(st[i].s!=="kosong"&&st[i].s!=="off")used++});
  var svg='<svg class="plan" viewBox="0 0 640 430" role="group" aria-label="Denah meja"><rect x="4" y="4" width="632" height="422" rx="14" fill="#1b1511" stroke="#4a3c2c" stroke-width="2"/><rect x="470" y="24" width="150" height="110" rx="10" fill="#2a221a"/><text x="545" y="84" text-anchor="middle" font-size="18" fill="#b0a28c" font-weight="700">Dapur</text><rect x="500" y="160" width="120" height="70" rx="10" fill="#2a221a"/><text x="560" y="200" text-anchor="middle" font-size="16" fill="#b0a28c" font-weight="700">Kasir</text><rect x="260" y="398" width="120" height="14" rx="4" fill="#c5a059"/><text x="320" y="392" text-anchor="middle" font-size="13" fill="#b0a28c">Pintu masuk</text>';
  db.tables.forEach(function(t,i){var s=st[i],nm=s.r?s.r.name.replace(/ \(contoh\)/,"").slice(0,10):"";
    svg+='<g class="tb" role="button" tabindex="0" data-act="tbl" data-id="'+t.id+'" data-fk="tbl:'+t.id+'" aria-label="Meja '+t.n+', '+t.seats+' kursi, '+s.label+(nm?", "+esc(nm):"")+'"><rect class="s-'+s.s+'" x="'+t.x+'" y="'+t.y+'" width="'+t.w+'" height="'+t.h+'" rx="12"/><text x="'+(t.x+t.w/2)+'" y="'+(t.y+24)+'" text-anchor="middle" font-size="18" font-weight="800" fill="#efe6d2">'+t.n+' <tspan font-size="13" font-weight="600">('+t.seats+')</tspan></text><text x="'+(t.x+t.w/2)+'" y="'+(t.y+44)+'" text-anchor="middle" font-size="13" font-weight="700" fill="#efe6d2">'+(s.s==="kosong"?"Kosong":s.s==="off"?"Mati":s.label.slice(0,12))+'</text>'+(nm?'<text x="'+(t.x+t.w/2)+'" y="'+(t.y+62)+'" text-anchor="middle" font-size="12" fill="#efe6d2">'+esc(nm)+'</text>':"")+'</g>'});
  svg+='</svg>';
  var leg=[["kosong","Kosong"],["menunggu","Menunggu"],["dikonfirmasi","Dikonfirmasi"],["datang","Sudah datang"],["off","Tidak dipakai"]].map(function(l){return'<span><i class="lg-'+l[0]+'"></i>'+l[1]+'</span>'}).join("");
  var list=db.tables.map(function(t,i){var s=st[i];return'<button type="button" class="lrow" data-act="tbl" data-id="'+t.id+'" data-fk="tbll:'+t.id+'" style="width:100%;text-align:left;font:inherit"><span><b>'+t.n+'</b> - '+t.seats+' kursi<small>'+(s.r?esc(s.r.name)+', '+s.r.guests+' tamu':s.label)+'</small></span>'+(s.s==="kosong"?pill("ok","Kosong"):s.s==="off"?pill("mute","Tidak dipakai"):rstPill(s.s))+'</button>'}).join("");
  return'<h1>Denah meja</h1><div class="vtop" style="margin-top:12px"><label class="fld">Tanggal<input class="inp" type="date" data-chg="mdate" value="'+esc(d)+'"></label><div class="fld" style="flex:2">Sesi<div class="chips" role="group" aria-label="Sesi" style="margin-top:4px">'+SLOTS.map(function(s){return'<button type="button" class="chip'+(s===sl?" on":"")+'" data-act="mslot" data-id="'+s+'" data-fk="mslot:'+s+'" aria-pressed="'+(s===sl)+'">'+s+'</button>'}).join("")+'</div></div></div>'+
  (di.open?"":'<div class="note bad">'+(di.holiday?"Libur: "+esc(di.holiday):"Restoran tutup pada hari ini")+'.</div>')+'<p style="margin:0 0 8px"><b>'+used+'</b> dari '+db.tables.filter(function(t){return!t.off}).length+' meja terisi. Kursi terpakai '+seats+' dari '+tot+'.</p>'+svg+'<div class="leg">'+leg+'</div><p style="color:var(--mute);margin:0 0 8px;font-size:.88rem">Ketuk meja untuk detail, catat tamu langsung, atau menonaktifkan meja.</p><div class="lst">'+list+'</div>';
}
acts.mslot=function(el){draft.mslot=el.dataset.id;render()};
acts.mdate=function(el){if(validDate(el.value)){draft.mdate=el.value;render()}};
function resvActs(r){
  var h="",td=today(),a=[];
  if(r.status==="menunggu")a.push(B("rstat",r.code+"|dikonfirmasi","Konfirmasi","ok sm"),B("rreject",r.code,"Tolak","sm"));
  if(r.status==="dikonfirmasi"){
    if(r.date===td)a.push(B("rstat",r.code+"|datang","Tandai datang","ok sm"));
    if(r.date<td||(r.date===td&&slotT(r.date,r.slot)+15*60000<Date.now()))a.push(B2("rstat",r.code+"|tidak","Tidak datang","sm"));
    a.push(B2("radmcancel",r.code,"Batalkan","sm"));
  }
  if(ACTIVE.indexOf(r.status)>=0&&r.status!=="datang")a.push(B("rmove",r.code,"Pindah meja","sm"));
  return a.length?'<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap">'+a.join("")+'</div>':"";
}
acts.tbl=function(el){
  var t=tableOf(+el.dataset.id),d=draft.mdate,sl=draft.mslot,s=tstat(t,d,sl),h;
  if(s.r){var r=s.r;h='<dl class="kv"><dt>Kode</dt><dd>'+esc(r.code)+'</dd><dt>Nama</dt><dd>'+esc(r.name)+'</dd><dt>HP</dt><dd>'+esc(r.phone)+'</dd><dt>Tamu</dt><dd>'+r.guests+' dari '+t.seats+' kursi</dd><dt>Status</dt><dd>'+rstPill(r.status)+'</dd>'+(r.note?'<dt>Permintaan</dt><dd>'+esc(r.note)+'</dd>':"")+'</dl><div style="margin-top:12px">'+resvActs(r)+'</div>';openSheet("Meja "+t.n+" - "+r.slot,h);return}
  h=t.off?'<p>Meja ini ditandai tidak dipakai (mis. rusak atau dipakai untuk acara).</p>':'<p>Kosong pada '+esc(fdate(d))+', sesi '+sl+'.</p>';
  if(!t.off&&d===today())h+='<form data-form="walkin" data-id="'+t.id+'" novalidate><h4 style="margin:8px 0">Catat tamu datang langsung</h4><div class="cols">'+fld("Nama",'<input class="inp" name="n" maxlength="40">')+fld("Jumlah tamu",'<input class="inp" name="g" type="number" min="1" max="'+t.seats+'" value="'+Math.min(2,t.seats)+'">')+'</div><div id="sherr" class="errs" role="alert" hidden></div><button class="btn pri" type="submit">Catat tamu datang</button></form>';
  h+='<div class="acts">'+B("toff",t.id,t.off?"Aktifkan meja":"Nonaktifkan meja","sm")+'</div>';
  openSheet("Meja "+t.n+" ("+t.seats+" kursi)",h);
};
acts.toff=function(el){var t=tableOf(+el.dataset.id);
  if(!t.off&&db.resv.some(function(r){return r.table===t.id&&r.date>=today()&&ACTIVE.indexOf(r.status)>=0&&r.status!=="datang"})){toast("Masih ada reservasi aktif di meja ini. Pindahkan dulu.",true);return}
  t.off=!t.off;save();after("Meja "+t.n+(t.off?" dinonaktifkan":" diaktifkan"))};
function shErr(m){var e=$("#sherr");if(e){e.hidden=false;e.textContent=m}else toast(m,true)}

/* ---------- reservasi (admin) ---------- */
function resvFilter(){
  var td=today(),q=(draft.rs||"").trim().toLowerCase(),f=draft.rf;
  var l=db.resv.filter(function(r){
    if(q&&(r.code+" "+r.name+" "+r.phone).toLowerCase().indexOf(q)<0)return false;
    if(f==="hariini")return r.date===td;
    if(f==="mendatang")return r.date>td&&ACTIVE.indexOf(r.status)>=0;
    if(f==="menunggu")return r.status==="menunggu";
    if(f==="riwayat")return r.date<td||ACTIVE.indexOf(r.status)<0||r.status==="datang";
    return true});
  return l.sort(function(a,b){var k=(a.date+a.slot)<(b.date+b.slot)?-1:1;return f==="riwayat"?-k:k});
}
function rCard(r){
  var tb=tableOf(r.table);
  return'<div class="card" style="margin-bottom:10px"><div class="rowc"><div><b style="font-family:ui-monospace,Menlo,monospace">'+esc(r.code)+'</b> '+rstPill(r.status)+(r.walkin?' '+pill("mute","Langsung"):"")+'</div><b>'+esc(sdate(r.date))+', '+r.slot+'</b></div><p style="margin:6px 0">'+esc(r.name)+' - '+esc(r.phone)+'<br>'+r.guests+' tamu - Meja '+(tb?tb.n:"-")+(r.note?'<br><span style="color:var(--mute)">Permintaan: '+esc(r.note)+'</span>':"")+(r.why&&(r.status==="ditolak"||r.status==="batal")?'<br><span style="color:var(--bad)">'+esc(r.why)+'</span>':"")+'</p>'+resvActs(r)+'</div>';
}
function aResvList(){var l=resvFilter();return l.length?l.map(rCard).join(""):empty("Tidak ada reservasi di filter ini")}
function aResv(){
  var F=[["hariini","Hari ini"],["mendatang","Mendatang"],["menunggu","Menunggu"],["riwayat","Riwayat"],["semua","Semua"]];
  return'<div class="rowc"><h1>Reservasi</h1><button type="button" class="btn sm" data-act="csvr" data-fk="csvr">Unduh CSV</button></div><div class="tools" style="margin-top:12px"><label class="sr" for="rsq">Cari reservasi</label><input class="inp" id="rsq" type="search" data-d="rs" data-live="ares" value="'+dv("rs")+'" placeholder="Cari kode, nama, atau HP" autocomplete="off"><div class="chips" role="group" aria-label="Filter">'+F.map(function(f){var n=db.resv.length&&0;return'<button type="button" class="chip'+(draft.rf===f[0]?" on":"")+'" data-act="rf" data-id="'+f[0]+'" data-fk="rf:'+f[0]+'" aria-pressed="'+(draft.rf===f[0])+'">'+f[1]+'</button>'}).join("")+'</div></div><div id="alist">'+aResvList()+'</div>';
}
acts.rf=function(el){draft.rf=el.dataset.id;render()};
acts.rstat=function(el){
  var p=el.dataset.id.split("|"),r=resvOf(p[0]),to=p[1];if(!r)return;
  var ok={dikonfirmasi:["menunggu"],datang:["dikonfirmasi"],tidak:["dikonfirmasi"]}[to];
  if(!ok||ok.indexOf(r.status)<0){toast("Status tidak bisa diubah dari "+RST[r.status],true);after();return}
  if(to==="datang"&&r.date!==today()){toast("Hanya bisa ditandai datang pada hari reservasi",true);return}
  r.status=to;save();after(r.code+": "+RST[to]);
};
acts.radmcancel=function(el){var r=resvOf(el.dataset.id);if(!r||ACTIVE.indexOf(r.status)<0)return;r.status="batal";r.why="Dibatalkan restoran";save();after(r.code+" dibatalkan, meja dilepas")};
acts.rreject=function(el){var r=resvOf(el.dataset.id);if(!r)return;openSheet("Tolak "+r.code,'<form data-form="reject" data-id="'+esc(r.code)+'" novalidate><p>'+esc(r.name)+', '+esc(sdate(r.date))+' '+r.slot+', '+r.guests+' tamu.</p>'+fld("Alasan (tampil ke pelanggan)",'<input class="inp" name="why" maxlength="100" value="Maaf, meja penuh pada sesi itu">')+'<div id="sherr" class="errs" role="alert" hidden></div><button class="btn bad" type="submit">Tolak reservasi</button></form>')};
acts.rmove=function(el){var r=resvOf(el.dataset.id);if(!r)return;var f=freeTables(r.date,r.slot,r.guests,r.code);
  openSheet("Pindah meja "+r.code,'<form data-form="move" data-id="'+esc(r.code)+'" novalidate><p>'+esc(r.name)+', '+r.guests+' tamu, '+esc(sdate(r.date))+' '+r.slot+'. Sekarang di meja '+tableOf(r.table).n+'.</p>'+(f.length?fld("Meja tujuan",'<select class="inp" name="t">'+f.map(function(t){return'<option value="'+t.id+'"'+(t.id===r.table?" selected":"")+'>'+t.n+' ('+t.seats+' kursi)</option>'}).join("")+'</select>')+'<button class="btn pri" type="submit">Pindahkan</button>':'<div class="note bad">Tidak ada meja kosong untuk sesi ini.</div>')+'</form>')};
acts.csvr=function(){csv("reservasi",[["Kode","Nama","HP","Tanggal","Sesi","Tamu","Meja","Status","Permintaan","Catatan admin"]].concat(db.resv.slice().sort(function(a,b){return(a.date+a.slot)<(b.date+b.slot)?-1:1}).map(function(r){return[r.code,r.name,r.phone,r.date,r.slot,r.guests,tableOf(r.table).n,RST[r.status],r.note,r.why]})))};

/* ---------- menu (admin) ---------- */
function aMenuList(){
  var q=(draft.mq||"").trim().toLowerCase(),l=db.menu.filter(function(m){return!q||(m.n+" "+m.c).toLowerCase().indexOf(q)>=0});
  return l.length?'<div class="card">'+l.map(function(m){return'<div class="mrow"><div><b>'+esc(m.n)+'</b> '+(m.av?"":pill("bad","Habis"))+'<br><small style="color:var(--mute)">'+esc(m.c)+' - '+rp(m.p)+(m.tags.length?' - '+m.tags.map(function(t){return TAGS[t]}).join(", "):"")+'</small></div><div class="acts"><button type="button" class="sw'+(m.av?" on":"")+'" data-act="mav" data-id="'+m.id+'" data-fk="mav:'+m.id+'" aria-pressed="'+m.av+'">'+(m.av?"Tersedia":"Habis")+'</button>'+B("medit",m.id,"Ubah","sm")+'</div></div>'}).join("")+'</div>':empty("Menu tidak ditemukan");
}
function aMenu(){return'<div class="rowc"><h1>Kelola menu</h1>'+B("medit","new","Tambah menu","pri sm")+'</div><div class="tools" style="margin-top:12px"><label class="sr" for="mqq">Cari menu</label><input class="inp" id="mqq" type="search" data-d="mq" data-live="amenu" placeholder="Cari menu" value="'+dv("mq")+'" autocomplete="off"></div><div id="alist">'+aMenuList()+'</div>'}
acts.mav=function(el){var m=menuOf(+el.dataset.id);m.av=!m.av;save();toast(m.n+(m.av?" tersedia":" ditandai habis"));render()};
acts.medit=function(el){
  var nw=el.dataset.id==="new",m=nw?{id:0,n:"",c:CATS[0],p:"",d:"",tags:[],av:true}:menuOf(+el.dataset.id);if(!m)return;
  openSheet(nw?"Tambah menu":"Ubah menu",'<form data-form="mform" data-id="'+m.id+'" novalidate>'+fld("Nama menu",'<input class="inp" name="n" maxlength="40" value="'+esc(m.n)+'">')+'<div class="cols">'+fld("Kategori",'<select class="inp" name="c">'+CATS.map(function(c){return'<option'+(c===m.c?" selected":"")+'>'+esc(c)+'</option>'}).join("")+'</select>')+fld("Harga (Rp)",'<input class="inp" name="p" inputmode="numeric" maxlength="7" value="'+esc(m.p)+'">')+'</div>'+fld("Deskripsi",'<textarea class="inp" name="d" maxlength="120">'+esc(m.d)+'</textarea>')+
  '<div class="fld">Label<div class="opts" style="margin-top:6px">'+Object.keys(TAGS).map(function(t){return'<label class="opt"><input type="checkbox" name="tg" value="'+t+'"'+(m.tags.indexOf(t)>=0?" checked":"")+'><span>'+TAGS[t]+'</span></label>'}).join("")+'</div></div><label class="opt" style="margin-bottom:12px"><input type="checkbox" name="av"'+(m.av?" checked":"")+'><span>Tersedia untuk dipesan</span></label><div id="sherr" class="errs" role="alert" hidden></div><div class="acts"><button class="btn pri" type="submit">Simpan</button>'+(nw?"":B2("mdel",m.id,"Hapus menu","sm"))+'</div></form>');
};
acts.mdel=function(el){var id=+el.dataset.id;db.menu=db.menu.filter(function(m){return m.id!==id});delete db.cart.items[id];save();after("Menu dihapus")};

/* ---------- jam & pengaturan ---------- */
function aJam(){
  var S=db.set,order=[1,2,3,4,5,6,0];
  var hol=S.holidays.slice().sort(function(a,b){return a.d<b.d?-1:1});
  return'<h1>Jam buka dan pengaturan</h1><div class="two" style="margin-top:12px"><form class="card" data-form="hours" novalidate><h3 style="margin-bottom:8px">Jam buka mingguan</h3>'+order.map(function(d){var h=S.hours[d];return'<div class="hday"><label class="opt"><input type="checkbox" name="on'+d+'"'+(h.on?" checked":"")+'><span>'+DAYN[d]+'</span></label><span>'+(h.on?"":"Tutup")+'</span><div class="tm"><label class="sr" for="f'+d+'">Buka '+DAYN[d]+'</label><input class="inp" id="f'+d+'" type="time" name="f'+d+'" value="'+h.from+'"><span>-</span><label class="sr" for="t'+d+'">Tutup '+DAYN[d]+'</label><input class="inp" id="t'+d+'" type="time" name="t'+d+'" value="'+h.to+'"></div></div>'}).join("")+
  '<p style="color:var(--mute);font-size:.85rem">Sesi reservasi 2 jam mulai 11:00, 13:00, 15:00, 17:00, 19:00. Sesi yang melewati jam tutup tidak ditawarkan.</p><h3 style="margin:10px 0 8px">Pesan antar</h3><div class="cols">'+fld("Ongkir (Rp)",'<input class="inp" name="fee" inputmode="numeric" value="'+S.fee+'">')+fld("Gratis ongkir mulai (Rp)",'<input class="inp" name="free" inputmode="numeric" value="'+S.freeFrom+'">')+'</div>'+fld("Minimal pesan antar (Rp)",'<input class="inp" name="min" inputmode="numeric" value="'+S.minOrder+'">')+'<label class="opt" style="margin-bottom:12px"><input type="checkbox" name="accept"'+(S.accept?" checked":"")+'><span>Terima pesanan online</span></label><div id="sherr" class="errs" role="alert" hidden></div><button class="btn pri" type="submit">Simpan pengaturan</button></form>'+
  '<div><div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:8px">Hari libur</h3>'+(hol.length?'<ul class="rl">'+hol.map(function(h,i){return'<li><span>'+esc(fdate(h.d))+'<br><small style="color:var(--mute)">'+esc(h.r)+'</small></span>'+B2("hdel",h.d,"Hapus","sm")+'</li>'}).join("")+'</ul>':'<p style="color:var(--mute)">Belum ada hari libur.</p>')+
  '<form data-form="holiday" novalidate style="margin-top:12px">'+fld("Tanggal",'<input class="inp" type="date" name="d" min="'+today()+'">')+fld("Keterangan",'<input class="inp" name="r" maxlength="60" placeholder="Mis. Libur hari raya">')+'<div id="sherr2" class="errs" role="alert" hidden></div><button class="btn sm" type="submit">Tambah hari libur</button></form></div>'+
  '<form class="card" data-form="pin" novalidate style="margin-bottom:14px"><h3 style="margin-bottom:8px">PIN panel</h3>'+fld("PIN baru (4 angka)",'<input class="inp" name="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off">')+'<div id="sherr3" class="errs" role="alert" hidden></div><button class="btn sm" type="submit">Ganti PIN</button></form>'+
  '<div class="card"><h3 style="margin-bottom:8px">Data demo</h3><p style="color:var(--mute);margin-top:0">Kembalikan semua pesanan, reservasi, menu, dan pengaturan ke data awal.</p>'+B2("reset","x","Reset data demo","sm")+'</div></div></div>';
}
function errIn(f,id,m){var e=$("#"+id)||$("#sherr");if(e){e.hidden=false;e.textContent=m}toast(m,true)}
acts.hdel=function(el){db.set.holidays=db.set.holidays.filter(function(h){return h.d!==el.dataset.id});save();toast("Hari libur dihapus");render()};
acts.reset=function(){db=seed();save();draft.errs=[];draft.just=null;draft.ver={};draft.edit=null;toast("Data demo dikembalikan");render()};

/* ---------- laporan ---------- */
function repData(){
  var td=today(),n=+draft.rep,from=addD(td,-(n-1));
  var os=db.orders.filter(function(o){return o.status==="selesai"&&ymd(new Date(o.t))>=from}),all=db.orders.filter(function(o){return ymd(new Date(o.t))>=from});
  var rs=db.resv.filter(function(r){return r.date>=from&&r.date<=td});
  var sales=os.reduce(function(a,o){return a+o.total},0),items={};
  os.forEach(function(o){o.items.forEach(function(i){var x=items[i.n]||(items[i.n]={q:0,v:0});x.q+=i.q;x.v+=i.q*i.p})});
  var top=Object.keys(items).map(function(k){return{n:k,q:items[k].q,v:items[k].v}}).sort(function(a,b){return b.v-a.v});
  var b=[];
  if(n===1){for(var h=10;h<=21;h++)b.push({l:two(h),v:0});os.forEach(function(o){var h2=new Date(o.t).getHours(),x=b.filter(function(y){return y.l===two(h2)})[0];if(x)x.v+=o.total})}
  else{for(var i=n-1;i>=0;i--)b.push({l:sdate(addD(td,-i)).split(" ")[0],k:addD(td,-i),v:0});os.forEach(function(o){var k=ymd(new Date(o.t)),x=b.filter(function(y){return y.k===k})[0];if(x)x.v+=o.total})}
  return{from:from,os:os,all:all,rs:rs,sales:sales,top:top,b:b,n:n};
}
function aLaporan(){
  var d=repData(),mx=Math.max.apply(null,d.b.map(function(x){return x.v}).concat([1])),cnt=function(s){return d.rs.filter(function(r){return r.status===s}).length},ant=d.os.filter(function(o){return o.mode==="antar"}).length;
  var P=[["1","Hari ini"],["7","7 hari"],["30","30 hari"]],guests=d.rs.filter(function(r){return r.status==="datang"}).reduce(function(a,r){return a+r.guests},0);
  return'<div class="rowc noprint"><h1>Laporan penjualan</h1><div class="acts" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn sm" data-act="csvs" data-fk="csvs">CSV penjualan</button><button type="button" class="btn sm" data-act="csvo" data-fk="csvo">CSV pesanan</button><button type="button" class="btn sm" data-act="print" data-fk="print">Cetak</button></div></div><h1 style="display:none">Laporan</h1>'+
  '<div class="chips noprint" role="group" aria-label="Periode" style="margin:12px 0">'+P.map(function(p){return'<button type="button" class="chip'+(draft.rep===p[0]?" on":"")+'" data-act="rep" data-id="'+p[0]+'" data-fk="rep:'+p[0]+'" aria-pressed="'+(draft.rep===p[0])+'">'+p[1]+'</button>'}).join("")+'</div>'+
  '<div class="stats"><div class="card"><small>Omzet (selesai)</small><b>'+rp(d.sales)+'</b></div><div class="card"><small>Pesanan selesai</small><b>'+d.os.length+'</b></div><div class="card"><small>Rata-rata pesanan</small><b>'+rp(d.os.length?d.sales/d.os.length:0)+'</b></div><div class="card"><small>Pesanan dibatalkan</small><b>'+d.all.filter(function(o){return o.status==="batal"}).length+'</b></div></div>'+
  '<div class="card" style="margin-bottom:14px"><h3>'+(d.n===1?"Omzet per jam":"Omzet per hari")+'</h3><div class="bars'+(d.b.length>14?" dense":"")+'" role="img" aria-label="Grafik omzet">'+d.b.map(function(x){return'<div title="'+esc(x.l)+': '+rp(x.v)+'"><i style="height:'+Math.round(x.v/mx*80)+'%"></i><span>'+esc(x.l)+'</span></div>'}).join("")+'</div></div>'+
  '<div class="two eq"><div class="card"><h3 style="margin-bottom:8px">Menu terlaris</h3>'+(d.top.length?'<ol class="rl" style="padding-left:0">'+d.top.slice(0,8).map(function(t){return'<li><span>'+esc(t.n)+' <small style="color:var(--mute)">x'+t.q+'</small></span><b>'+rp(t.v)+'</b></li>'}).join("")+'</ol>':'<p style="color:var(--mute)">Belum ada penjualan di periode ini.</p>')+'</div><div class="card"><h3 style="margin-bottom:8px">Ringkasan</h3><ul class="rl"><li><span>Pesan antar</span><b>'+ant+'</b></li><li><span>Ambil sendiri</span><b>'+(d.os.length-ant)+'</b></li><li><span>Reservasi</span><b>'+d.rs.length+'</b></li><li><span>Tamu datang</span><b>'+cnt("datang")+' ('+guests+' orang)</b></li><li><span>Tidak datang</span><b>'+cnt("tidak")+'</b></li><li><span>Dibatalkan atau ditolak</span><b>'+(cnt("batal")+cnt("ditolak"))+'</b></li></ul></div></div>';
}
acts.rep=function(el){draft.rep=el.dataset.id;render()};
acts.print=function(){window.print()};
acts.csvs=function(){var d=repData(),rows=[["Tanggal","Pesanan selesai","Omzet (Rp)"]],m={};d.os.forEach(function(o){var k=ymd(new Date(o.t)),x=m[k]||(m[k]={n:0,v:0});x.n++;x.v+=o.total});Object.keys(m).sort().forEach(function(k){rows.push([k,m[k].n,m[k].v])});rows.push(["Total",d.os.length,d.sales]);csv("penjualan",rows)};
acts.csvo=function(){var d=repData(),rows=[["Kode","Waktu","Nama","Terima","Pembayaran","Status","Item","Subtotal","Ongkir","Total"]];d.all.sort(function(a,b){return a.t-b.t}).forEach(function(o){rows.push([o.code,new Date(o.t).toISOString(),o.name,o.mode,PAYS[o.pay]||o.pay,OST[o.status],o.items.map(function(i){return i.q+"x "+i.n}).join("; "),o.sub,o.fee,o.total])});csv("pesanan",rows)};

/* ---------- form admin ---------- */
adminForm=function(f,k){
  var E=f.elements,id=f.dataset.id;
  if(k==="login"){if((draft.pin||"")===db.set.pin){setAdmin(true);draft.pin="";draft.errs=[];toast("Selamat datang");go("#/admin/dapur")}else{draft.errs=["PIN salah"];draft.pin="";render();var p=$("#pinin");if(p)p.focus()}return}
  if(k==="walkin"){var t=tableOf(+id),n=E.n.value.trim(),g=num(E.g.value);
    if(n.length<2)return shErr("Nama minimal 2 huruf");if(g<1||g>t.seats)return shErr("Jumlah tamu 1 sampai "+t.seats);
    if(tstat(t,draft.mdate,draft.mslot).s!=="kosong")return shErr("Meja sudah terisi");
    var r=mkResv({name:n,phone:"-",date:today(),slot:draft.mslot,guests:g,status:"datang",table:t.id,walkin:true,t:Date.now()});save();after("Tamu dicatat di meja "+t.n+" ("+r.code+")");return}
  if(k==="reject"){var rr=resvOf(id),w=E.why.value.trim();if(w.length<3)return shErr("Isi alasan minimal 3 huruf");if(!rr||rr.status!=="menunggu"){after("Status sudah berubah",true);return}rr.status="ditolak";rr.why=w;save();after(rr.code+" ditolak");return}
  if(k==="move"){var r2=resvOf(id),tid=+E.t.value;if(!r2||freeTables(r2.date,r2.slot,r2.guests,r2.code).map(function(x){return x.id}).indexOf(tid)<0)return shErr("Meja tidak tersedia");r2.table=tid;save();after(r2.code+" dipindah ke "+tableOf(tid).n);return}
  if(k==="mform"){var n2=E.n.value.trim(),p=num(E.p.value),nw=id==="0";
    if(n2.length<2)return shErr("Nama menu minimal 2 huruf");if(p<1000)return shErr("Harga minimal Rp1.000");if(p>999999)return shErr("Harga terlalu besar");
    if(db.menu.some(function(m){return m.id!==+id&&m.n.toLowerCase()===n2.toLowerCase()}))return shErr("Nama menu sudah ada");
    var tg=$$("input[name=tg]:checked",f).map(function(x){return x.value}),m=nw?{id:db.menu.reduce(function(a,x){return Math.max(a,x.id)},0)+1,k:{"Makanan Utama":"rice","Bakar & Sate":"ribs","Sayur & Lauk":"salad","Camilan":"fried","Minuman":"glass","Penutup":"sweet"}[E.c.value]||"rice",h:Math.floor(Math.random()*360)}:menuOf(+id);
    m.n=n2;m.c=E.c.value;m.p=p;m.d=E.d.value.trim();m.tags=tg;m.av=E.av.checked;if(nw)db.menu.push(m);save();after("Menu disimpan");return}
  if(k==="hours"){var H={};
    for(var d=0;d<7;d++){var on=E["on"+d].checked,fr=E["f"+d].value,to=E["t"+d].value;if(on&&(!fr||!to||tmin(fr)>=tmin(to)))return errIn(f,"sherr","Jam buka "+DAYN[d]+" harus lebih awal dari jam tutup");H[d]={on:on,from:fr||"10:00",to:to||"21:00"}}
    var fee=num(E.fee.value),fr2=num(E.free.value),mn=num(E.min.value);if(fr2<1000)return errIn(f,"sherr","Batas gratis ongkir minimal Rp1.000");
    db.set.hours=H;db.set.fee=fee;db.set.freeFrom=fr2;db.set.minOrder=mn;db.set.accept=E.accept.checked;save();toast("Pengaturan disimpan");render();return}
  if(k==="holiday"){var dd=E.d.value,rs=E.r.value.trim();
    if(!validDate(dd)||dd<today())return errIn(f,"sherr2","Pilih tanggal hari ini atau setelahnya");if(rs.length<3)return errIn(f,"sherr2","Isi keterangan minimal 3 huruf");
    if(db.set.holidays.some(function(h){return h.d===dd}))return errIn(f,"sherr2","Tanggal itu sudah ditandai libur");
    var c=db.resv.filter(function(r){return r.date===dd&&ACTIVE.indexOf(r.status)>=0&&r.status!=="datang"}).length;
    if(c)return errIn(f,"sherr2","Ada "+c+" reservasi aktif pada tanggal itu. Tolak atau batalkan dulu.");
    db.set.holidays.push({d:dd,r:rs});save();toast("Hari libur ditambah");render();return}
  if(k==="pin"){var pn=E.pin.value.replace(/\D/g,"");if(pn.length!==4)return errIn(f,"sherr3","PIN harus 4 angka");db.set.pin=pn;save();toast("PIN diganti");render();return}
};

/* ---------- inti: render, event, mulai ---------- */
function page(r){
  var p=r[0]||"";
  return p==="menu"?pgMenu():p==="keranjang"?pgCart():p==="checkout"?pgCheckout():p==="lacak"?pgTrack(r[1]):p==="reservasi"?pgResv():p==="cek"?pgCek(r[1]):pgHome();
}
var TITLES={"":"Beranda",menu:"Menu",keranjang:"Keranjang",checkout:"Checkout",lacak:"Lacak pesanan",reservasi:"Reservasi meja",cek:"Cek reservasi",admin:"Panel restoran"};
function render(){
  var r=route(),key=r.join("/"),sy=window.scrollY,isA=r[0]==="admin";
  document.body.className=(isA?"adm":"")+(navOpen&&!isA?" navlock":"");
  $("#app").innerHTML=isA?adminShell(r):siteShell(r,page(r));
  document.title=(TITLES[r[0]||""]||"Sekar Jati")+" | Sekar Jati, contoh restoran";
  if(key!==lastRoute){window.scrollTo(0,0);var h=$("h1");if(h){h.setAttribute("tabindex","-1");if(lastRoute!==""||true)h.focus({preventScroll:true})}}else window.scrollTo(0,sy);
  lastRoute=key;navSolid();
  if(lastFocus){var f=$('[data-fk="'+lastFocus.replace(/"/g,"")+'"]');if(f)f.focus({preventScroll:true});lastFocus=null}
}
var LIVE={menu:function(){$("#mlist").innerHTML=menuList()},amenu:function(){$("#alist").innerHTML=aMenuList()},ares:function(){$("#alist").innerHTML=aResvList()}};
document.addEventListener("click",function(e){
  var bg=e.target;if(bg.id==="sheetbg"){closeSheet();return}
  var el=e.target.closest("[data-act]");if(!el)return;var a=el.dataset.act;
  if(a==="closesheet"){closeSheet();return}
  if(a==="logout"){setAdmin(false);toast("Anda sudah keluar");go("#/admin");return}
  var fn=acts[a];if(!fn)return;
  var key=a+":"+(el.dataset.id||"");
  if(el.dataset.two){if(armed!==key){armed=key;clearTimeout(armT);armT=setTimeout(function(){armed=null;if(!sheetOpen)render()},4000);lastFocus=el.dataset.fk;
      if(sheetOpen){el.textContent="Tekan lagi untuk yakin";el.classList.add("arm")}else render();return}
    armed=null;clearTimeout(armT)}
  lastFocus=el.dataset.fk||null;fn(el,e);
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&sheetOpen){closeSheet();return}
  if((e.key==="Enter"||e.key===" ")&&e.target.getAttribute&&e.target.getAttribute("role")==="button"&&e.target.dataset.act){e.preventDefault();e.target.dispatchEvent(new MouseEvent("click",{bubbles:true}))}
});
document.addEventListener("input",function(e){
  var t=e.target;
  if(t.dataset.d){draft[t.dataset.d]=t.value;if(t.dataset.live&&LIVE[t.dataset.live])LIVE[t.dataset.live]()}
  else if(t.dataset.note){var it=db.cart.items[t.dataset.note];if(it){it.note=t.value.slice(0,80);save()}}
});
document.addEventListener("change",function(e){
  var t=e.target;
  if(t.dataset.chg&&acts[t.dataset.chg]){acts[t.dataset.chg](t,e);return}
  if(t.dataset.d&&(t.type==="radio"||t.type==="checkbox"))draft[t.dataset.d]=t.value;
});
document.addEventListener("submit",function(e){e.preventDefault();submitForm(e.target)});
window.addEventListener("hashchange",function(){armed=null;navOpen=false;render()});
window.addEventListener("scroll",navSolid,{passive:true});
document.addEventListener("click",function(e){if(navOpen&&e.target.closest("#mnav a"))setNav(false,false)});
document.addEventListener("keydown",function(e){
  if(!navOpen)return;
  if(e.key==="Escape"){setNav(false,true);return}
  if(e.key==="Tab"){var f=$$("#burger,.brand,.mcart,#mnav a").filter(function(x){return x.offsetParent!==null||x.id==="burger"}),i=f.indexOf(document.activeElement);if(!f.length)return;if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus()}}
});
window.addEventListener("storage",function(e){if(e.key===KEY&&reload()&&!typing())render()});
function typing(){var a=document.activeElement;return sheetOpen||(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=="radio"&&a.type!=="checkbox")}
setInterval(function(){if(reload()&&!typing())render()},2500);
setInterval(function(){var r=route();if(r[0]==="admin"&&(r[1]||"dapur")==="dapur"&&!typing())render()},30000);
window.addEventListener("error",function(e){window.__errs=(window.__errs||[]).concat([String(e.message)])});
db=load();
render();
