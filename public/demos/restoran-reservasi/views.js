"use strict";
var draft={q:"",cat:"Semua",tag:"",rg:2,rdate:"",rslot:"",rname:"",rphone:"",rnote:"",cname:"",cphone:"",caddr:"",cnote:"",cpay:"tunai",lq:"",ckc:"",ckp:"",ver:{},edit:null,eg:2,edate:"",eslot:"",enote:"",kcol:"baru",just:null,errs:[],mdate:"",mslot:"",rf:"hariini",rs:"",rep:"7",mq:"",mcat:"Semua"};
var acts={},armed=null,armT=null,lastFocus=null,lastRoute="",sheetOpen=false;

function toast(m,bad){var t=$("#toast");t.textContent=m;t.className="toast on"+(bad?" bad":"");clearTimeout(toast.t);toast.t=setTimeout(function(){t.className="toast"},2600)}
function go(h){if(location.hash===h)render();else location.hash=h}
function route(){return location.hash.replace(/^#\/?/,"").split("/").filter(Boolean).map(function(x){try{return decodeURIComponent(x)}catch(e){return x}})}
function B(act,id,label,cls,extra){var k=act+":"+id;return'<button type="button" class="btn '+(cls||"")+'" data-act="'+act+'" data-id="'+esc(id)+'" data-fk="'+esc(k)+'"'+(extra||"")+'>'+label+'</button>'}
function B2(act,id,label,cls){var k=act+":"+id,a=armed===k;return'<button type="button" class="btn '+(a?"arm":cls||"")+'" data-act="'+act+'" data-id="'+esc(id)+'" data-fk="'+esc(k)+'" data-two="1">'+(a?"Tekan lagi untuk yakin":label)+'</button>'}
function pill(c,t){return'<span class="pill '+c+'">'+esc(t)+'</span>'}
function ostPill(s){return pill({baru:"warn",masak:"blue",siap:"ok",selesai:"mute",batal:"bad"}[s],OST[s])}
function rstPill(s){return pill({menunggu:"warn",dikonfirmasi:"blue",datang:"ok",tidak:"bad",ditolak:"bad",batal:"mute"}[s],RST[s])}
function tagsHtml(m){return'<div class="tags">'+m.tags.map(function(t){return'<span class="tg '+t+'">'+TAGS[t]+'</span>'}).join("")+'</div>'}
function empty(t,sub){return'<div class="none"><svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="26" r="16" fill="#2a221a"/><path d="M14 26h20M24 14v-4" stroke="#c5a059" stroke-width="3" stroke-linecap="round"/></svg><b>'+esc(t)+'</b>'+(sub?'<div>'+sub+'</div>':"")+'</div>'}
function errBox(){if(!draft.errs.length)return"";return'<div class="errs" role="alert">Periksa lagi:<ul>'+draft.errs.map(function(e){return"<li>"+esc(e)+"</li>"}).join("")+'</ul></div>'}
function dv(k){return esc(draft[k])}

/* ---------- layout ---------- */
var ICON={h:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',m:'<path d="M7 3v8a3 3 0 0 0 3 3v7M10 3v6M13 3v8a3 3 0 0 1-3 3M18 21V3c-3 2-4 6-4 9h4"/>',r:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',l:'<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2"/>',c:'<path d="M3 4h3l2 12h10l2-8H7M9 20h.01M17 20h.01"/>'};
function ic(k){return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[k]+'</svg>'}
var navOpen=false;
function setNav(o,focus){
  navOpen=o;var h=$(".top"),b=$("#burger");if(!h||!b)return;
  h.classList.toggle("open",o);document.body.classList.toggle("navlock",o);
  b.setAttribute("aria-expanded",o?"true":"false");b.setAttribute("aria-label",o?"Tutup menu":"Buka menu");
  if(o){var a=$("#mnav a");if(a)a.focus()}else if(focus)b.focus();
  navSolid();
}
function navSolid(){var h=$(".top.over");if(h)h.classList.toggle("solid",window.scrollY>40)}
function siteShell(r,body){
  var cc=cartCount(),p=r[0]||"",home=p==="";
  var L=[["","Beranda"],["menu","Menu"],["reservasi","Reservasi"]],R=[["lacak","Lacak pesanan"],["cek","Cek reservasi"],["keranjang","Keranjang"]];
  function lk(l){var on=p===l[0]||(l[0]==="keranjang"&&p==="checkout");return'<li><a href="#/'+l[0]+'"'+(on?' aria-current="page"':"")+'>'+l[1]+(l[0]==="keranjang"&&cc?' <i aria-label="'+cc+' item">'+cc+'</i>':"")+'</a></li>'}
  var bar=cc&&p!=="keranjang"&&p!=="checkout"?'<a class="cartbar on" href="#/keranjang"><span>'+cc+' item di keranjang</span><span>'+rp(cartSub())+' &rarr; Lihat</span></a>':"";
  var head='<header class="top'+(home?" over":"")+(navOpen?" open":"")+'"><div class="bar"><button type="button" class="burger" id="burger" data-act="navtoggle" aria-expanded="'+(navOpen?"true":"false")+'" aria-controls="mnav" aria-label="'+(navOpen?"Tutup menu":"Buka menu")+'"><span></span></button>'+
    '<a class="brand" href="#/" aria-label="Sekar Jati, ke beranda">'+logo()+'<b>Sekar Jati</b></a>'+
    '<a class="mcart" href="#/keranjang" aria-label="Keranjang'+(cc?", "+cc+" item":"")+'">'+ic("c")+(cc?'<i aria-hidden="true">'+cc+'</i>':"")+'</a>'+
    '<nav class="mnav" id="mnav" aria-label="Menu utama"><ul>'+L.map(lk).join("")+'</ul><ul>'+R.map(lk).join("")+'</ul></nav></div></header>';
  var foot='<footer class="ft"><div class="wrap"><a class="brand" href="#/">'+logo()+'<b>Sekar Jati</b></a><div class="orn" style="margin:0"><i class="dia"></i></div><ul>'+[["menu","Menu"],["reservasi","Reservasi"],["lacak","Lacak pesanan"],["cek","Cek reservasi"],["admin","Panel restoran"]].map(function(l){return'<li><a href="#/'+l[0]+'">'+l[1]+'</a></li>'}).join("")+'</ul>'+
    '<p>Jl. Contoh No. 1, Kota Contoh. Telp 0812-0000-1234. Semua data di demo ini fiktif.</p><p>Foto: Wikimedia Commons, <a href="credits.json" target="_blank" rel="noopener">lihat kredit</a></p></div></footer>';
  return head+(home?'<main id="main" class="home">'+body+'</main>':'<main id="main"><div class="wrap pg">'+body+'</div></main>')+bar+foot;
}

/* ---------- beranda ---------- */
var HOMECOLS=[["Makanan Utama","Sayur & Lauk","Camilan"],["Bakar & Sate","Minuman","Penutup"]];
function homeItem(m){
  var f=PHOTO[m.n]&&m.tags.indexOf("favorit")>=0;
  var head='<div class="mh"><span class="mn">'+esc(m.n)+'</span><i class="dots" aria-hidden="true"></i><b>'+rp(m.p)+'</b></div><p>'+esc(m.d)+'</p>';
  if(!f)return'<li class="mi">'+head+'</li>';
  return'<li class="mi fav"><img src="img/'+PHOTO[m.n]+'.jpg" alt="'+esc(m.n)+'" width="152" height="152" loading="lazy" decoding="async"><div>'+head+'<span class="tg favorit">Andalan</span></div></li>';
}
function pgHome(){
  var on=openNow(),td=pd(today()).getDay();
  var hrs=[1,2,3,4,5,6,0].map(function(d){var h=db.set.hours[d];return'<tr'+(d===td?' class="now"':"")+'><td>'+DAYN[d]+'</td><td>'+(h.on?h.from+" - "+h.to:"Tutup")+'</td></tr>'}).join("");
  var hol=db.set.holidays.filter(function(h){return h.d>=today()}).sort(function(a,b){return a.d<b.d?-1:1});
  var mcols=HOMECOLS.map(function(col){return'<div class="mcol">'+col.map(function(c){var l=db.menu.filter(function(m){return m.c===c&&m.av}).slice(0,4);return l.length?'<section class="mcat" aria-label="'+esc(c)+'"><h3>'+esc(c)+'</h3><ul>'+l.map(homeItem).join("")+'</ul></section>':""}).join("")+'</div>'}).join("");
  var g=draft.rg,dflt=validDate(draft.rdate)&&draft.rdate>=today()?draft.rdate:firstBookable(g),gopt="";
  for(var i=1;i<=MAXG;i++)gopt+='<option value="'+i+'"'+(i===g?" selected":"")+'>'+i+' orang</option>';
  var sopt='<option value="">Pilih di langkah berikutnya</option>'+SLOTS.map(function(s){return'<option value="'+s+'"'+(draft.rslot===s?" selected":"")+'>'+s+' - '+slotEnd(s)+'</option>'}).join("");
  return'<section class="hero" aria-labelledby="h1"><img src="img/hero.jpg" alt="Teras restoran dengan meja kursi rotan menghadap laut dan pepohonan kelapa" width="900" height="675" decoding="async"><div class="hero-in"><span class="lbl">Rumah makan Nusantara</span><h1 id="h1">Sekar Jati</h1><div class="orn" aria-hidden="true"><i class="dia"></i></div><p>Pesan antar, ambil sendiri, atau pesan meja untuk makan bersama.</p><div class="cta"><a class="btn ghost" href="#/reservasi">Pesan meja</a><a class="btn ghost" href="#/menu">Pesan makanan</a></div>'+
  '<div class="stat'+(on.ok?(on.live?"":" warn"):" bad")+'"><i class="dia" aria-hidden="true"></i><span>'+esc(on.msg)+'</span></div></div><span class="cue" aria-hidden="true"></span></section>'+
  '<section class="sx" aria-labelledby="hcara"><div class="wrap"><div class="sh"><span class="lbl">Cara memesan</span><h2 id="hcara">Tiga jalan ke meja kami</h2><div class="orn" aria-hidden="true"><i class="dia"></i></div></div><div class="steps"><div><b aria-hidden="true">I</b><h3>Pilih menu</h3><p>Cari hidangan, lalu tambahkan catatan seperti tanpa sambal.</p></div><div><b aria-hidden="true">II</b><h3>Antar atau ambil</h3><p>Isi data, kirim, lalu pantau status dapur.</p></div><div><b aria-hidden="true">III</b><h3>Atau pesan meja</h3><p>Pilih tanggal dan sesi, lalu simpan kode reservasi.</p></div></div></div></section>'+
  '<section class="sx menusx" aria-labelledby="hmenu"><div class="wrap"><div class="sh"><span class="lbl">Daftar hidangan</span><h2 id="hmenu">Menu</h2><div class="orn" aria-hidden="true"><i class="dia"></i></div></div><div class="mcard"><div><div class="mcols">'+mcols+'</div></div></div><div class="mfoot"><p>Antar gratis untuk pesanan mulai '+rp(db.set.freeFrom)+'. Ongkir '+rp(db.set.fee)+', minimal pesan antar '+rp(db.set.minOrder)+'.</p><a class="btn pri" href="#/menu">Lihat menu lengkap</a></div></div></section>'+
  '<section class="split" aria-labelledby="hres"><div class="sp-img"><img src="img/reservasi.jpg" alt="Ruang makan dengan meja kursi rotan dan jendela besar menghadap laut" width="900" height="675" loading="lazy" decoding="async"></div><div class="sp-f"><span class="lbl">Reservasi</span><h2 id="hres">Pesan meja</h2><div class="orn" aria-hidden="true"><i class="dia"></i></div><p>Satu sesi berlangsung 2 jam. Meja dipilihkan sesuai jumlah tamu.</p>'+
  '<form data-form="homeresv" novalidate><div class="cols3"><label class="fld wide" for="hd">Tanggal<input class="inp" id="hd" name="hd" type="date" min="'+today()+'" max="'+addD(today(),30)+'" value="'+esc(dflt)+'"></label><label class="fld" for="hg">Tamu<select class="inp" id="hg" name="hg">'+gopt+'</select></label><label class="fld" for="hs">Sesi<select class="inp" id="hs" name="hs">'+sopt+'</select></label></div><button class="btn gold blk" type="submit">Lanjut reservasi</button></form><small class="hint">Sudah punya kode? <a href="#/cek">Cek atau ubah reservasi</a>.</small></div></section>'+
  '<section class="band" aria-label="Jam buka dan lokasi"><div class="wrap"><div><h3>Jam buka</h3><table class="hrs">'+hrs+'</table></div><div><h3>Lokasi</h3><p class="big">Jl. Contoh No. 1<br>Kota Contoh</p><p>Telp 0812-0000-1234. Alamat dan nomor ini contoh untuk demo.</p></div><div><h3>Kabar libur</h3>'+(hol.length?'<ul class="rl">'+hol.map(function(h){return'<li><span>'+esc(fdate(h.d))+'</span><span style="color:var(--mute)">'+esc(h.r)+'</span></li>'}).join("")+'</ul>':'<p>Tidak ada libur dalam waktu dekat.</p>')+'</div></div></section>';
}

/* ---------- menu ---------- */
function dishCard(m){
  var it=db.cart.items[m.id],ctl;
  if(!m.av)ctl='<span class="sold">Habis</span>';
  else if(it)ctl='<span class="step"><button type="button" data-act="dec" data-id="'+m.id+'" data-fk="dec:'+m.id+'" aria-label="Kurangi '+esc(m.n)+'">&minus;</button><span aria-live="polite">'+it.q+'</span><button type="button" data-act="inc" data-id="'+m.id+'" data-fk="inc:'+m.id+'" aria-label="Tambah '+esc(m.n)+'">+</button></span>';
  else ctl=B("inc",m.id,"Tambah","pri sm",' aria-label="Tambah '+esc(m.n)+' ke keranjang"');
  return'<article class="card dish'+(m.av?"":" off")+'"><div class="art">'+photo(m)+'</div><div class="db">'+tagsHtml(m)+'<h3>'+esc(m.n)+'</h3><p>'+esc(m.d)+'</p><div class="pr"><b>'+rp(m.p)+'</b>'+ctl+'</div></div></article>';
}
function menuFiltered(){var q=draft.q.trim().toLowerCase();return db.menu.filter(function(m){return(draft.cat==="Semua"||m.c===draft.cat)&&(!draft.tag||m.tags.indexOf(draft.tag)>=0)&&(!q||(m.n+" "+m.d).toLowerCase().indexOf(q)>=0)})}
function menuList(){
  var l=menuFiltered();
  return l.length?'<div class="grid">'+l.map(dishCard).join("")+'</div>':empty("Menu tidak ditemukan",'<button type="button" class="link" data-act="clearf">Hapus pencarian dan filter</button>');
}
function pgMenu(){
  var cats=["Semua"].concat(CATS),tags=[["","Semua label"],["pedas","Pedas"],["vegetarian","Vegetarian"],["favorit","Favorit"]];
  return'<h1>Menu</h1><div class="tools"><label class="sr" for="mq">Cari menu</label><input class="inp" id="mq" type="search" placeholder="Cari menu, mis. ayam atau sambal" data-d="q" data-live="menu" value="'+dv("q")+'" autocomplete="off"><div class="chips" role="group" aria-label="Kategori">'+
  cats.map(function(c){return'<button type="button" class="chip'+(draft.cat===c?" on":"")+'" data-act="cat" data-id="'+esc(c)+'" data-fk="cat:'+esc(c)+'" aria-pressed="'+(draft.cat===c)+'">'+esc(c)+'</button>'}).join("")+'</div><div class="chips" role="group" aria-label="Label">'+
  tags.map(function(t){return'<button type="button" class="chip'+(draft.tag===t[0]?" on":"")+'" data-act="tag" data-id="'+t[0]+'" data-fk="tag:'+t[0]+'" aria-pressed="'+(draft.tag===t[0])+'">'+t[1]+'</button>'}).join("")+'</div></div><div id="mlist">'+menuList()+'</div>';
}

/* ---------- keranjang & checkout ---------- */
function totals(){var sub=cartSub(),fee=feeFor(sub,db.cart.mode);return{sub:sub,fee:fee,total:sub+fee}}
function sumHtml(){
  var t=totals();
  return'<div class="sum"><span>Subtotal</span><span>'+rp(t.sub)+'</span></div>'+(db.cart.mode==="antar"?'<div class="sum"><span>Ongkir</span><span>'+(t.fee?rp(t.fee):"Gratis")+'</span></div>':"")+'<div class="sum t"><span>Total</span><span>'+rp(t.total)+'</span></div>'+
  (db.cart.mode==="antar"&&t.sub<db.set.freeFrom&&t.sub>0?'<p class="sub" style="color:var(--mute);font-size:.85rem;margin:6px 0 0">Tambah '+rp(db.set.freeFrom-t.sub)+' lagi untuk ongkir gratis.</p>':"");
}
function modeOpts(){return'<div class="opts" role="radiogroup" aria-label="Cara terima">'+[["antar","Antar ke alamat","Ongkir "+rp(db.set.fee)],["ambil","Ambil sendiri","Tanpa ongkir"]].map(function(o){return'<label class="opt"><input type="radio" name="mode" value="'+o[0]+'" data-chg="mode"'+(db.cart.mode===o[0]?" checked":"")+'><span>'+o[1]+'<small>'+o[2]+'</small></span></label>'}).join("")+'</div>'}
function pgCart(){
  var ls=cartLines();
  if(!ls.length)return'<h1>Keranjang</h1><div style="margin-top:14px">'+empty("Keranjang masih kosong",'<a class="btn pri" style="margin-top:10px" href="#/menu">Lihat menu</a>')+'</div>';
  return'<h1>Keranjang</h1><div class="two" style="margin-top:14px"><div class="card">'+ls.map(function(l){var m=l.m;return'<div class="line"><div><div class="nm">'+esc(m.n)+(m.av?"":' '+pill("bad","Habis"))+'</div><div class="sub">'+rp(m.p)+' x '+l.q+'</div></div><div class="rt"><span class="step"><button type="button" data-act="dec" data-id="'+m.id+'" data-fk="dec:'+m.id+'" aria-label="Kurangi '+esc(m.n)+'">&minus;</button><span>'+l.q+'</span><button type="button" data-act="inc" data-id="'+m.id+'" data-fk="inc:'+m.id+'" aria-label="Tambah '+esc(m.n)+'">+</button></span><b>'+rp(m.p*l.q)+'</b></div><label class="sr" for="n'+m.id+'">Catatan untuk '+esc(m.n)+'</label><input class="inp" id="n'+m.id+'" data-note="'+m.id+'" maxlength="80" placeholder="Catatan, mis. tanpa sambal" value="'+esc(l.note)+'"></div>'}).join("")+
  '<div style="margin-top:8px">'+B2("clearcart","all","Kosongkan keranjang","sm")+'</div></div><div class="card"><h3 style="margin-bottom:10px">Cara terima</h3>'+modeOpts()+'<div id="sumbox">'+sumHtml()+'</div><div style="margin-top:12px"><button type="button" class="btn pri blk" data-act="tocheckout" data-fk="tocheckout">Lanjut ke checkout</button></div></div></div>';
}
function checkErrs(){
  var e=[],ls=cartLines(),t=totals(),on=openNow();
  if(!ls.length)e.push("Keranjang kosong");
  ls.forEach(function(l){if(!l.m.av)e.push(l.m.n+" sedang habis, hapus dari keranjang")});
  if(!on.ok)e.push(on.msg);
  if(db.cart.mode==="antar"&&t.sub<db.set.minOrder)e.push("Minimal pesan antar "+rp(db.set.minOrder)+" (kurang "+rp(db.set.minOrder-t.sub)+")");
  return e;
}
function pgCheckout(){
  var ls=cartLines();
  if(!ls.length)return pgCart();
  var on=openNow(),antar=db.cart.mode==="antar";
  return'<h1>Checkout</h1><p style="color:var(--mute);margin:4px 0 14px">'+esc(on.msg)+'</p>'+errBox()+'<div class="two"><form class="card" id="cform" novalidate data-form="order"><h3 style="margin-bottom:10px">Cara terima</h3>'+modeOpts()+
  '<div class="cols"><label class="fld">Nama<input class="inp" data-d="cname" value="'+dv("cname")+'" maxlength="40" autocomplete="name"></label><label class="fld">No. HP<input class="inp" data-d="cphone" inputmode="tel" value="'+dv("cphone")+'" maxlength="16" placeholder="0812-0000-0000" autocomplete="tel"></label></div>'+
  (antar?'<label class="fld">Alamat antar<textarea class="inp" data-d="caddr" maxlength="160" placeholder="Jalan, nomor, patokan">'+dv("caddr")+'</textarea></label>':'<p class="note blue">Ambil di restoran: Jl. Contoh No. 1. Tunjukkan kode pesanan.</p>')+
  '<label class="fld">Catatan pesanan (opsional)<input class="inp" data-d="cnote" maxlength="120" value="'+dv("cnote")+'" placeholder="Mis. tidak pakai plastik"></label>'+
  '<h3 style="margin:6px 0 8px">Pembayaran</h3><div class="opts" role="radiogroup" aria-label="Pembayaran">'+Object.keys(PAYS).map(function(k){return'<label class="opt"><input type="radio" name="pay" value="'+k+'" data-d="cpay"'+(draft.cpay===k?" checked":"")+'><span>'+PAYS[k]+'<small>'+(k==="tunai"?"Bayar saat terima":"Simulasi, tanpa uang sungguhan")+'</small></span></label>'}).join("")+'</div>'+
  '<button type="submit" class="btn pri blk" data-fk="sendorder">Kirim pesanan</button></form><div class="card"><h3 style="margin-bottom:8px">Ringkasan</h3>'+ls.map(function(l){return'<div class="sum"><span>'+l.q+' x '+esc(l.m.n)+(l.note?'<br><small style="color:var(--mute)">'+esc(l.note)+'</small>':"")+'</span><span>'+rp(l.m.p*l.q)+'</span></div>'}).join("")+'<div style="margin-top:8px">'+sumHtml()+'</div><p style="margin:10px 0 0"><a href="#/keranjang">Ubah keranjang</a></p></div></div>';
}
function submitOrder(){
  var e=checkErrs(),n=draft.cname.trim(),antar=db.cart.mode==="antar";
  if(n.length<2)e.push("Nama minimal 2 huruf");
  if(!phoneOk(draft.cphone))e.push("No. HP tidak valid (9-14 angka, diawali 0)");
  if(antar&&draft.caddr.trim().length<8)e.push("Alamat antar belum lengkap");
  draft.errs=e;
  if(e.length){render();toast("Ada isian yang perlu diperbaiki",true);window.scrollTo(0,0);return}
  var o=mkOrder({items:cartLines().map(function(l){return{id:l.m.id,q:l.q,note:l.note}}),mode:db.cart.mode,name:n,phone:draft.cphone.trim(),addr:draft.caddr.trim(),note:draft.cnote.trim(),pay:draft.cpay,t:Date.now(),status:"baru"});
  db.cart.items={};db.mine.o.unshift(o.code);save();draft.errs=[];draft.cnote="";toast("Pesanan terkirim: "+o.code);go("#/lacak/"+o.code);
}

/* ---------- lacak pesanan ---------- */
function orderMsg(o){
  var a=o.mode==="antar";
  return{baru:"Pesanan diterima. Dapur akan segera memulai.",masak:"Dapur sedang memasak pesanan Anda.",siap:a?"Pesanan siap dan sedang diantar.":"Pesanan siap. Silakan ambil di restoran.",selesai:a?"Pesanan sudah diterima. Selamat makan!":"Pesanan sudah diambil. Selamat makan!",batal:"Pesanan dibatalkan"+(o.why?": "+o.why:"")+"."}[o.status];
}
function pgTrack(code){
  var o=code?orderOf(code):null,mine=db.mine.o.map(orderOf).filter(Boolean);
  var h='<h1>Lacak pesanan</h1><form class="card" style="margin:14px 0" data-form="track"><div class="rowc"><label class="fld" style="flex:1;min-width:200px;margin:0">Kode pesanan<input class="inp" data-d="lq" value="'+dv("lq")+'" placeholder="Mis. PS-1046" maxlength="12" autocomplete="off"></label><button class="btn pri" type="submit" style="align-self:flex-end">Cari</button></div></form>';
  if(code&&!o)h+='<div class="note bad" role="alert">Kode '+esc(code)+' tidak ditemukan. Periksa lagi kodenya.</div>';
  if(o){
    var steps=[["baru","Diterima"],["masak","Dimasak"],["siap",o.mode==="antar"?"Siap diantar":"Siap diambil"],["selesai","Selesai"]],idx=steps.map(function(s){return s[0]}).indexOf(o.status);
    h+='<div class="two"><div class="card"><div class="rowc"><div><small style="color:var(--mute)">Kode pesanan</small><div class="code">'+esc(o.code)+'</div></div>'+ostPill(o.status)+'</div><p style="font-weight:700">'+esc(orderMsg(o))+'</p>';
    if(o.status==="batal")h+='<p class="note bad">Dibatalkan pukul '+hm(o.hist[o.hist.length-1].t)+'.</p>';
    else h+='<ol class="tl">'+steps.map(function(s,i){var ht=o.hist.filter(function(x){return x.s===s[0]})[0],c=i<idx||(i===idx&&s[0]==="selesai")?"done":i===idx?"cur":"";return'<li class="'+c+'"><i>'+(c==="done"?"&#10003;":i+1)+'</i><b>'+s[1]+'</b><small>'+(ht?hm(ht.t)+" WIB":"Belum")+'</small></li>'}).join("")+'</ol>';
    if(o.status==="baru")h+=B2("ocancel",o.code,"Batalkan pesanan","sm")+'<p style="color:var(--mute);font-size:.85rem">Pesanan hanya bisa dibatalkan sebelum dapur mulai memasak.</p>';
    h+='</div><div class="card"><h3 style="margin-bottom:8px">Rincian</h3>'+o.items.map(function(i){return'<div class="sum"><span>'+i.q+' x '+esc(i.n)+(i.note?'<br><small style="color:var(--mute)">Catatan: '+esc(i.note)+'</small>':"")+'</span><span>'+rp(i.p*i.q)+'</span></div>'}).join("")+'<div class="sum"><span>Subtotal</span><span>'+rp(o.sub)+'</span></div>'+(o.mode==="antar"?'<div class="sum"><span>Ongkir</span><span>'+(o.fee?rp(o.fee):"Gratis")+'</span></div>':"")+'<div class="sum t"><span>Total</span><span>'+rp(o.total)+'</span></div>'+
    '<dl class="kv" style="margin-top:12px"><dt>Terima</dt><dd>'+(o.mode==="antar"?"Antar":"Ambil sendiri")+'</dd><dt>Nama</dt><dd>'+esc(o.name)+'</dd>'+(o.mode==="antar"?'<dt>Alamat</dt><dd>'+esc(o.addr)+'</dd>':"")+'<dt>Bayar</dt><dd>'+esc(PAYS[o.pay]||o.pay)+'</dd><dt>Dipesan</dt><dd>'+fdt(o.t)+'</dd>'+(o.note?'<dt>Catatan</dt><dd>'+esc(o.note)+'</dd>':"")+'</dl></div></div>';
  }
  if(mine.length)h+='<div class="sec"><h2>Pesanan saya</h2></div><div class="lst">'+mine.map(function(m){return'<a class="lrow" href="#/lacak/'+esc(m.code)+'"><span><b>'+esc(m.code)+'</b><small>'+fdt(m.t)+' - '+rp(m.total)+'</small></span>'+ostPill(m.status)+'</a>'}).join("")+'</div>';
  else if(!o)h+=empty("Belum ada pesanan di perangkat ini",'<a class="btn pri" style="margin-top:10px" href="#/menu">Pesan sekarang</a>');
  return h;
}

/* ---------- reservasi ---------- */
function firstBookable(g){for(var i=0;i<=30;i++){var d=addD(today(),i);if(SLOTS.some(function(s){return slotState(d,s,g).ok}))return d}return today()}
function slotPicker(date,guests,sel,except,key){
  var di=dayInfo(date);
  if(!di.open)return'<div class="note bad">'+(di.holiday?"Libur: "+esc(di.holiday):"Restoran tutup pada hari "+DAYN[pd(date).getDay()])+'. Pilih tanggal lain.</div>';
  return'<div class="slots" role="radiogroup" aria-label="Sesi">'+SLOTS.map(function(s){var st=slotState(date,s,guests,except),on=sel===s&&st.ok;
    return'<button type="button" class="slot'+(on?" on":"")+'" role="radio" aria-checked="'+on+'" data-act="slot" data-id="'+key+'" data-v="'+s+'" data-fk="slot:'+key+s+'"'+(st.ok?"":" disabled")+'>'+s+' - '+slotEnd(s)+'<small>'+(st.ok?st.n+" meja":st.why)+'</small></button>'}).join("")+'</div>';
}
function guestStep(k,v){return'<div class="step" role="group" aria-label="Jumlah tamu"><button type="button" data-act="guest" data-id="'+k+'" data-v="-1" data-fk="g:'+k+'-" aria-label="Kurangi tamu">&minus;</button><span aria-live="polite">'+v+'</span><button type="button" data-act="guest" data-id="'+k+'" data-v="1" data-fk="g:'+k+'+" aria-label="Tambah tamu">+</button></div>'}
function pgResv(){
  if(!validDate(draft.rdate)||draft.rdate<today())draft.rdate=firstBookable(draft.rg);
  if(draft.rslot&&!slotState(draft.rdate,draft.rslot,draft.rg).ok)draft.rslot="";
  return'<h1>Reservasi meja</h1><img class="resvimg" src="img/reservasi.jpg" alt="Ruang makan dengan meja kursi rotan dan jendela besar menghadap laut" width="900" height="675" loading="lazy" decoding="async"><p style="color:var(--mute);margin:4px 0 14px">Satu sesi berlangsung 2 jam. Meja dipilihkan otomatis sesuai jumlah tamu. Sudah punya kode? <a href="#/cek">Cek atau ubah reservasi</a>.</p>'+errBox()+
  '<form class="card" novalidate data-form="resv" style="max-width:640px"><div class="fld">Jumlah tamu (maks. '+MAXG+')<div style="margin-top:6px">'+guestStep("r",draft.rg)+'</div><small>Lebih dari '+MAXG+' orang? Hubungi 0812-0000-1234.</small></div>'+
  '<label class="fld">Tanggal<input class="inp" type="date" data-chg="rdate" min="'+today()+'" max="'+addD(today(),30)+'" value="'+esc(draft.rdate)+'"></label><div class="fld" id="slotlbl">Sesi</div>'+slotPicker(draft.rdate,draft.rg,draft.rslot,null,"r")+
  '<div class="cols"><label class="fld">Nama<input class="inp" data-d="rname" maxlength="40" value="'+dv("rname")+'" autocomplete="name"></label><label class="fld">No. HP<input class="inp" data-d="rphone" inputmode="tel" maxlength="16" value="'+dv("rphone")+'" placeholder="0812-0000-0000" autocomplete="tel"></label></div>'+
  '<label class="fld">Permintaan khusus (opsional)<textarea class="inp" data-d="rnote" maxlength="200" placeholder="Mis. kursi bayi, ulang tahun, dekat jendela">'+dv("rnote")+'</textarea></label><button class="btn pri blk" type="submit" data-fk="sendresv">Pesan meja</button></form>';
}
function submitResv(){
  var e=[],n=draft.rname.trim(),st=draft.rslot?slotState(draft.rdate,draft.rslot,draft.rg):null;
  if(n.length<2)e.push("Nama minimal 2 huruf");
  if(!phoneOk(draft.rphone))e.push("No. HP tidak valid (9-14 angka, diawali 0)");
  if(draft.rg<1||draft.rg>MAXG)e.push("Jumlah tamu 1 sampai "+MAXG);
  if(!validDate(draft.rdate)||draft.rdate<today()||draft.rdate>addD(today(),30))e.push("Tanggal harus dalam 30 hari ke depan");
  if(!draft.rslot)e.push("Pilih sesi");else if(!st||!st.ok)e.push("Sesi tidak tersedia, pilih sesi lain");
  else if(db.resv.some(function(r){return cleanPhone(r.phone)===cleanPhone(draft.rphone)&&r.date===draft.rdate&&r.slot===draft.rslot&&ACTIVE.indexOf(r.status)>=0}))e.push("Nomor ini sudah punya reservasi di sesi yang sama");
  draft.errs=e;
  if(e.length){render();toast("Ada isian yang perlu diperbaiki",true);window.scrollTo(0,0);return}
  var r=mkResv({name:n,phone:draft.rphone.trim(),date:draft.rdate,slot:draft.rslot,guests:draft.rg,note:draft.rnote.trim(),status:"menunggu",t:Date.now()});
  if(!r){draft.errs=["Meja baru saja terisi. Pilih sesi lain."];render();return}
  db.mine.r.unshift(r.code);save();draft.just=r.code;draft.errs=[];draft.rnote="";draft.rslot="";toast("Reservasi terkirim: "+r.code);go("#/cek/"+r.code);
}
var RMSG={menunggu:"Menunggu konfirmasi restoran. Meja sudah ditahan untuk Anda.",dikonfirmasi:"Reservasi dikonfirmasi. Mohon tiba 10 menit sebelum sesi.",datang:"Terima kasih sudah datang. Selamat menikmati.",tidak:"Tercatat tidak datang.",ditolak:"Reservasi ditolak restoran.",batal:"Reservasi dibatalkan."};
function canChange(r){return(r.status==="menunggu"||r.status==="dikonfirmasi")&&slotT(r.date,r.slot)>Date.now()}
function pgCek(code){
  var r=code?resvOf(code):null,mine=db.mine.r.map(resvOf).filter(Boolean),h='<h1>Cek reservasi</h1>';
  var allowed=r&&(db.mine.r.indexOf(r.code)>=0||draft.ver[r.code]);
  if(!allowed){
    h+='<form class="card" style="margin:14px 0;max-width:520px" data-form="cek"><p style="margin-top:0;color:var(--mute)">Masukkan kode reservasi dan nomor HP yang dipakai saat memesan.</p>'+(code&&!r?'<div class="note bad" role="alert">Kode '+esc(code)+' tidak ditemukan.</div>':r?'<div class="note">Masukkan nomor HP untuk membuka reservasi ini.</div>':"")+'<label class="fld">Kode reservasi<input class="inp" data-d="ckc" maxlength="8" placeholder="RV-XXXX" value="'+esc(draft.ckc||code||"")+'" autocomplete="off"></label><label class="fld">No. HP<input class="inp" data-d="ckp" inputmode="tel" maxlength="16" value="'+dv("ckp")+'"></label>'+errBox()+'<button class="btn pri" type="submit">Cek reservasi</button></form>';
  }else{
    h+=(draft.just===r.code?'<div class="note ok" role="status">Reservasi terkirim. Simpan kode di bawah ini untuk cek atau ubah nanti.</div>':"")+'<div class="two" style="margin-top:14px"><div class="card"><div class="rowc"><div><small style="color:var(--mute)">Kode reservasi</small><div class="code">'+esc(r.code)+'</div></div>'+rstPill(r.status)+'</div><p style="font-weight:700">'+esc(RMSG[r.status])+(r.status==="ditolak"&&r.why?" Alasan: "+esc(r.why):"")+'</p>'+
    '<dl class="kv"><dt>Nama</dt><dd>'+esc(r.name)+'</dd><dt>Tanggal</dt><dd>'+esc(fdate(r.date))+'</dd><dt>Sesi</dt><dd>'+r.slot+' - '+slotEnd(r.slot)+'</dd><dt>Tamu</dt><dd>'+r.guests+' orang</dd><dt>Meja</dt><dd>'+esc(tableOf(r.table).n)+'</dd>'+(r.note?'<dt>Permintaan</dt><dd>'+esc(r.note)+'</dd>':"")+'</dl>';
    if(canChange(r))h+='<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">'+B("edit",r.code,"Ubah reservasi","")+B2("rcancel",r.code,"Batalkan reservasi","")+'</div>';
    h+='</div>';
    if(draft.edit===r.code&&canChange(r)){
      h+='<form class="card" novalidate data-form="edit"><h3 style="margin-bottom:10px">Ubah reservasi</h3>'+(r.status==="dikonfirmasi"?'<p class="note">Jika tanggal, sesi, atau jumlah tamu berubah, restoran perlu mengonfirmasi ulang.</p>':"")+errBox()+'<div class="fld">Jumlah tamu<div style="margin-top:6px">'+guestStep("e",draft.eg)+'</div></div><label class="fld">Tanggal<input class="inp" type="date" data-chg="edate" min="'+today()+'" max="'+addD(today(),30)+'" value="'+esc(draft.edate)+'"></label><div class="fld">Sesi</div>'+slotPicker(draft.edate,draft.eg,draft.eslot,r.code,"e")+'<label class="fld">Permintaan khusus<textarea class="inp" data-d="enote" maxlength="200">'+dv("enote")+'</textarea></label><div class="acts" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" type="submit">Simpan perubahan</button>'+B("ecancel","x","Batal","")+'</div></form>';
    }
    h+='</div>';
  }
  if(mine.length)h+='<div class="sec"><h2>Reservasi saya</h2></div><div class="lst">'+mine.map(function(m){return'<a class="lrow" href="#/cek/'+esc(m.code)+'"><span><b>'+esc(m.code)+'</b><small>'+esc(fdate(m.date))+', '+m.slot+' - '+m.guests+' tamu</small></span>'+rstPill(m.status)+'</a>'}).join("")+'</div>';
  return h;
}
function saveEdit(r){
  var e=[],st=draft.eslot?slotState(draft.edate,draft.eslot,draft.eg,r.code):null;
  if(!draft.eslot)e.push("Pilih sesi");else if(!st||!st.ok)e.push("Sesi tidak tersedia");
  if(!validDate(draft.edate)||draft.edate<today()||draft.edate>addD(today(),30))e.push("Tanggal harus dalam 30 hari ke depan");
  if(!e.length&&db.resv.some(function(x){return x.code!==r.code&&cleanPhone(x.phone)===cleanPhone(r.phone)&&x.date===draft.edate&&x.slot===draft.eslot&&ACTIVE.indexOf(x.status)>=0}))e.push("Nomor ini sudah punya reservasi di sesi itu");
  draft.errs=e;if(e.length){render();return}
  var changed=r.date!==draft.edate||r.slot!==draft.eslot||r.guests!==draft.eg,tb=st.tables.filter(function(t){return t.id===r.table})[0]||st.tables[0];
  r.date=draft.edate;r.slot=draft.eslot;r.guests=draft.eg;r.note=draft.enote.trim();r.table=tb.id;if(changed&&r.status==="dikonfirmasi")r.status="menunggu";
  save();draft.edit=null;draft.errs=[];toast(changed&&r.status==="menunggu"?"Diubah, menunggu konfirmasi ulang":"Perubahan disimpan");render();
}

/* ---------- aksi pelanggan ---------- */
acts.navtoggle=function(){setNav(!navOpen,true)};
acts.cat=function(el){draft.cat=el.dataset.id;render()};
acts.tag=function(el){draft.tag=el.dataset.id;render()};
acts.clearf=function(){draft.q="";draft.cat="Semua";draft.tag="";render()};
acts.inc=function(el){cartAdd(+el.dataset.id,1);render()};
acts.dec=function(el){cartAdd(+el.dataset.id,-1);render()};
acts.clearcart=function(){db.cart.items={};save();toast("Keranjang dikosongkan");render()};
acts.mode=function(el){db.cart.mode=el.value==="ambil"?"ambil":"antar";save();render()};
acts.tocheckout=function(){var ls=cartLines(),t=totals();
  for(var i=0;i<ls.length;i++)if(!ls[i].m.av){toast(ls[i].m.n+" sedang habis, hapus dulu",true);return}
  if(db.cart.mode==="antar"&&t.sub<db.set.minOrder){toast("Minimal pesan antar "+rp(db.set.minOrder),true);return}
  draft.errs=[];go("#/checkout")};
acts.ocancel=function(el){var o=orderOf(el.dataset.id);if(!o||o.status!=="baru"){toast("Pesanan sudah diproses dapur",true);render();return}o.status="batal";o.why="Dibatalkan pelanggan";o.hist.push({s:"batal",t:Date.now()});save();toast("Pesanan dibatalkan");render()};
acts.guest=function(el){var k=el.dataset.id,d=+el.dataset.v,key=k==="r"?"rg":"eg",v=draft[key]+d;if(v<1||v>MAXG){toast("Jumlah tamu 1 sampai "+MAXG,true);return}draft[key]=v;render()};
acts.slot=function(el){draft[el.dataset.id==="r"?"rslot":"eslot"]=el.dataset.v;render()};
acts.rdate=function(el){draft.rdate=el.value;draft.rslot="";render()};
acts.edate=function(el){draft.edate=el.value;draft.eslot="";render()};
acts.edit=function(el){var r=resvOf(el.dataset.id);if(!r)return;draft.edit=r.code;draft.eg=r.guests;draft.edate=r.date;draft.eslot=r.slot;draft.enote=r.note;draft.errs=[];render()};
acts.ecancel=function(){draft.edit=null;draft.errs=[];render()};
acts.rcancel=function(el){var r=resvOf(el.dataset.id);if(!r||!canChange(r)){toast("Reservasi tidak bisa dibatalkan",true);render();return}r.status="batal";r.why="Dibatalkan pelanggan";save();draft.edit=null;toast("Reservasi dibatalkan, meja dilepas");render()};
function submitForm(f){
  var k=f.dataset.form;
  if(k==="order")submitOrder();
  else if(k==="resv")submitResv();
  else if(k==="homeresv"){var el=f.elements,d0=el.hd.value,g0=+el.hg.value,s0=el.hs.value;if(!validDate(d0)||d0<today()||d0>addD(today(),30)){toast("Pilih tanggal dalam 30 hari ke depan",true);return}if(s0){var st0=slotState(d0,s0,g0);if(!st0.ok){toast("Sesi "+s0+" tidak tersedia: "+st0.why,true);return}}draft.rg=g0;draft.rdate=d0;draft.rslot=s0;draft.errs=[];go("#/reservasi")}
  else if(k==="track"){var c=draft.lq.trim();if(!c){toast("Isi kode pesanan",true);return}var o=orderOf(c);go("#/lacak/"+encodeURIComponent(o?o.code:c.toUpperCase()))}
  else if(k==="cek"){var c2=(draft.ckc||"").trim();draft.errs=[];if(!c2){draft.errs=["Isi kode reservasi"];render();return}var r=resvOf(c2);
    if(!r||cleanPhone(r.phone)!==cleanPhone(draft.ckp)){draft.errs=["Kode atau nomor HP tidak cocok"];render();return}
    draft.ver[r.code]=true;draft.just=null;go("#/cek/"+r.code)}
  else if(k==="edit"){var rr=resvOf(draft.edit);if(rr&&canChange(rr))saveEdit(rr)}
  else if(adminForm)adminForm(f,k);
}
var adminForm=null;
