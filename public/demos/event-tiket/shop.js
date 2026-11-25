"use strict";
/* Halaman pembeli + router */
var lastH=null,mode=null,curEv=null;
function imgAlt(f){for(var i=0;i<IMGS.length;i++)if(IMGS[i].f===f)return IMGS[i].l;return "Foto event"}
function evImg(ev,cls,w,h){return '<span class="ph '+(cls||"")+'"><img src="'+esc(ev.img)+'" alt="'+esc(imgAlt(ev.img)+": "+ev.name)+'" loading="lazy" width="'+(w||800)+'" height="'+(h||450)+'" style="object-position:'+esc(ev.pos||"50% 50%")+'"></span>'}
function okList(){try{return JSON.parse(sessionStorage.getItem("tiket.ok")||"[]")}catch(e){return[]}}
function addOk(id){var l=okList();if(l.indexOf(id)<0)l.push(id);try{sessionStorage.setItem("tiket.ok",JSON.stringify(l))}catch(e){}}
function admOk(){try{return sessionStorage.getItem("tiket.adm")==="1"}catch(e){return false}}
function setAdm(v){try{sessionStorage.setItem("tiket.adm",v?"1":"0")}catch(e){}}

/* ---------- router ---------- */
function setShell(m){
 if(mode===m)return;mode=m;
 if(m==="pub"){
  $("shell").innerHTML='<header class="top" id="top"><div class="wrap hbar"><a class="brand" href="#/" aria-label="Beranda"><b class="logo" id="orgname"></b></a><button class="menu-b" type="button" data-act="menu" aria-expanded="false" aria-controls="nav"><span class="vh">Menu</span><i></i><i></i></button><nav class="nav" id="nav" aria-label="Menu utama"><a href="#/" data-n="home">Event</a><a href="#/" data-act="jump" data-t="s-cara">Cara beli</a><a href="#/" data-act="jump" data-t="s-faq">FAQ</a><a href="#/checkout" data-n="cart">Keranjang <span class="bdg" id="cartbdg"></span></a><a href="#/admin" data-n="adm">Penyelenggara</a><a class="gbtn" href="#/cek" data-n="cek">Cek pesanan</a></nav></div></header><main id="app" class="wrap main" tabindex="-1"></main><footer class="foot"><div class="wrap"><div class="foot-g"><div><b class="logo" id="orgfoot"></b><p>Tiket konser, seminar, workshop, dan festival.</p></div><ul><li><a href="#/">Event</a></li><li><a href="#/" data-act="jump" data-t="s-cara">Cara beli</a></li><li><a href="#/cek">Cek pesanan</a></li><li><a href="#/admin">Penyelenggara</a></li></ul></div><div class="foot-n"><p>Demo penjualan tiket. Semua event, nama, dan nomor adalah contoh fiktif. Pembayaran hanya simulasi.</p><p>Foto: Wikimedia Commons, <a href="credits.json" target="_blank" rel="noopener">lihat kredit</a>.</p></div></div></footer>';
 }else if(m==="login"){
  $("shell").innerHTML='<main id="app" class="login-wrap" tabindex="-1"></main>';
 }else{
  $("shell").innerHTML=admShell();
 }
}
function route(keep){
 var h=(location.hash||"").replace(/^#\/?/,""),p=h.split("/");
 closeMenu();purgeHolds();cartExpiryCheck();
 var scroll=!keep&&h!==lastH;lastH=h;curEv=null;
 if(p[0]==="admin"){admRoute(p)}else{setShell("pub");pubRoute(p);updateNav(p[0])}
 if(scroll)window.scrollTo(0,0);
}
function updateNav(k){
 var n=cartCount();$("orgname").textContent=db.org;$("orgfoot").textContent=db.org;
 $("cartbdg").textContent=n||"";$("cartbdg").style.display=n?"":"none";
 var map={"":"home",event:"home",cek:"cek",order:"cek",checkout:"cart",bayar:"cart"},a=map[k||""];
 Array.prototype.forEach.call(document.querySelectorAll(".nav a"),function(x){if(x.getAttribute("data-n")===a)x.setAttribute("aria-current","page");else x.removeAttribute("aria-current")});
}
function pubRoute(p){
 var a=$("app");a.className="wrap main";document.title="Panggung Kita: tiket event (demo)";
 if(p[0]==="event"&&p[1])return pageEvent(p[1]);
 if(p[0]==="checkout")return pageCheckout();
 if(p[0]==="bayar")return pagePay();
 if(p[0]==="cek")return pageCek();
 if(p[0]==="order"&&p[1])return pageOrder(p[1]);
 pageHome();
}

/* ---------- keranjang ---------- */
function cartCount(){var n=0,c=db.cart;for(var k in c.q)n+=c.q[k];return n}
function releaseCart(){db.holds=db.holds.filter(function(h){return h.sid!==SID});db.cart={ev:null,q:{},seats:[],promo:"",hold:0};save()}
function cartExpiryCheck(){
 var c=db.cart;
 if(c.ev&&c.seats.length&&c.hold&&c.hold<Date.now()){
  var ev=evById(c.ev);if(ev&&ev.seat)delete c.q[ev.seat.tier];
  c.seats=[];c.hold=0;db.holds=db.holds.filter(function(h){return h.sid!==SID});
  if(!cartCount())c.ev=null;
  save();toast("Waktu tahan kursi habis. Pilih kursi lagi.",true);return true;
 }
 return false;
}
function cartFor(ev){
 var c=db.cart;
 if(c.ev&&c.ev!==ev.id&&cartCount()>0){releaseCart();toast("Keranjang diganti: satu pesanan hanya untuk satu event.")}
 db.cart.ev=ev.id;return db.cart;
}
function keepFocus(fn){
 var a=document.activeElement,sel=null;
 if(a&&a.getAttribute&&a.getAttribute("data-act")){sel='[data-act="'+a.getAttribute("data-act")+'"]';["e","t","d","s"].forEach(function(k){if(a.getAttribute("data-"+k)!=null)sel+='[data-'+k+'="'+a.getAttribute("data-"+k)+'"]'})}
 fn();
 if(sel){var n=document.querySelector(sel+":not([disabled])");if(n)n.focus()}
}

/* ---------- beranda ---------- */
function closeMenu(){document.body.classList.remove("menu-open");var m=document.querySelector(".menu-b");if(m)m.setAttribute("aria-expanded","false")}
ACT.menu=function(b){var on=!document.body.classList.contains("menu-open");document.body.classList.toggle("menu-open",on);b.setAttribute("aria-expanded",String(on))};
ACT.jump=function(b,e){
 e.preventDefault();closeMenu();var id=b.getAttribute("data-t");
 var go=function(){var el=$(id);if(!el)return;var rm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;el.scrollIntoView({behavior:rm?"auto":"smooth",block:"start"})};
 var h=location.hash;if(mode==="pub"&&(h===""||h==="#"||h==="#/"))go();else{location.hash="#/";setTimeout(go,80)}
};
document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("#nav a"))closeMenu()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeMenu()});
function pad(n,l){n=String(n);while(n.length<l)n="0"+n;return n}
function boardHtml(ts){
 var s=Math.max(0,Math.floor((ts-Date.now())/1000)),v=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60],l=["Hari","Jam","Menit","Detik"];
 return v.map(function(x,i){return '<div class="bd"><b>'+pad(x,2)+'</b><small>'+l[i]+'</small></div>'}).join("");
}
function boardTick(){Array.prototype.forEach.call(document.querySelectorAll("[data-board]"),function(el){el.innerHTML=boardHtml(+el.getAttribute("data-board"))})}
function pageHome(){
 $("app").className="main home";
 var cities={},up=db.events.filter(function(e){return e.status==="publish"&&!isPast(e)}).sort(function(a,b){return a.start-b.start});
 db.events.forEach(function(e){if(e.status==="publish")cities[e.city]=1});
 var ft=up.filter(function(e){return e.cat==="Konser"&&evStat(e).left>0})[0]||up.filter(function(e){return evStat(e).left>0})[0]||up[0];
 var chips='<button type="button" class="chip" data-act="cat" data-v="" aria-pressed="'+(!ui.cat)+'">Semua</button>'+CATS.map(function(c){return '<button type="button" class="chip" data-act="cat" data-v="'+c+'" aria-pressed="'+(ui.cat===c)+'">'+c+'</button>'}).join("");
 var hero;
 if(ft){
  hero='<section class="ph-hero" aria-labelledby="h-hero"><div class="ph-bg" aria-hidden="true"><img src="'+esc(ft.img)+'" alt="" width="1000" height="560" style="object-position:'+esc(ft.pos||"50% 50%")+'"></div><div class="ph-sh" aria-hidden="true"></div><div class="in ph-in"><div class="ph-main"><p class="lab">Event unggulan &middot; '+esc(ft.cat)+'</p><h1 class="poster ph-t gt-text" id="h-hero">'+esc(ft.name)+'</h1><p class="ph-m"><span>'+esc(dstr(ft.start))+' &middot; '+tstr(ft.start)+' WIB</span><span>'+esc(ft.venue)+', '+esc(ft.city)+'</span></p><div class="ph-act"><a class="btn neon" href="#/event/'+esc(ft.id)+'">Beli tiket</a><a class="btn alt" href="#/" data-act="jump" data-t="s-event">Semua event</a></div></div>'+
  '<div class="ph-side"><div class="stubp"><div class="stubp-t"><p class="lab">Dimulai dalam</p><div class="board" role="timer" aria-label="Hitung mundur menuju '+esc(ft.name)+'" data-board="'+ft.start+'">'+boardHtml(ft.start)+'</div></div><div class="stubp-b"><div><p class="lab">Mulai dari</p><b class="price">'+rp(minPrice(ft))+'</b></div><a class="btn sm" href="#/event/'+esc(ft.id)+'">Pilih tiket</a></div></div></div></div></section>';
 }else{
  hero='<section class="ph-hero" aria-labelledby="h-hero"><div class="ph-bg" aria-hidden="true"></div><div class="ph-sh" aria-hidden="true"></div><div class="in ph-in"><div><p class="lab">Panggung Kita</p><h1 class="poster ph-t gt-text" id="h-hero">Belum ada event</h1><p class="ph-m">Event berikutnya segera hadir.</p></div></div></section>';
 }
 var names=db.events.filter(function(e){return e.status==="publish"&&!isPast(e)}).map(function(e){return '<span>'+esc(e.name)+'</span>'}).join("");
 var half='<div class="mq-h">'+names+names+'</div>';
 var mq=names?'<div class="mq-w" aria-hidden="true"><div class="mq-r"><div class="mq">'+half+half+'</div></div></div>':"";
 var seatEv=up.filter(function(e){return e.seat})[0],den="";
 if(seatEv){
  var st=seatEv.tiers.filter(function(t){return t.id===seatEv.seat.tier})[0],left=st?avail(seatEv,st):0,tot=st?st.quota:0;
  den='<section class="in sec" id="s-denah" aria-labelledby="h-den"><div class="den"><div class="den-c"><p class="lab">Kursi bernomor</p><h2 class="poster sec-t gt-text" id="h-den">Pilih kursimu sendiri</h2><p>Lihat denah, pilih kursi yang kamu mau, dan kami tahan 10 menit selagi kamu bayar.</p><ul class="den-f"><li>'+esc(seatEv.name)+'</li><li>Tersisa <b>'+left+'</b> dari '+tot+' kursi</li></ul><a class="btn" href="#/event/'+esc(seatEv.id)+'">Lihat denah kursi</a></div><div class="den-a" aria-hidden="true"><div class="den-s">PANGGUNG</div><div class="den-d"></div></div></div></section>';
 }
 $("app").innerHTML=hero+mq+
 '<section class="in sec" id="s-event" aria-labelledby="h-ev"><div class="sec-h"><p class="lab">Seluruh pertunjukan</p><h2 class="poster sec-t gt-text" id="h-ev">Cari panggungmu</h2><p class="lead">Konser kecil, seminar, workshop, dan festival. Pilih tiket, bayar, dan e-tiket langsung terbit.</p></div>'+
 '<form class="filters" role="search" data-form="noop" aria-label="Cari event"><label class="fld grow">Cari event<input class="inp" type="search" id="f-q" data-in="fq" value="'+esc(ui.q)+'" placeholder="Nama, tempat, atau kota"></label>'+
 '<label class="fld">Kota<select class="inp" id="f-city" data-in="fcity"><option value="">Semua kota</option>'+Object.keys(cities).sort().map(function(c){return '<option'+(ui.city===c?" selected":"")+'>'+esc(c)+'</option>'}).join("")+'</select></label>'+
 '<label class="fld">Mulai dari tanggal<input class="inp" type="date" id="f-from" data-in="ffrom" value="'+esc(ui.from)+'"></label>'+
 '<div class="chips" role="group" aria-label="Kategori">'+chips+'</div>'+
 '<label class="chk"><input type="checkbox" id="f-past" data-in="fpast"'+(ui.past?" checked":"")+'> Tampilkan event yang sudah selesai</label></form>'+
 '<p class="count" id="count" aria-live="polite"></p><div class="grid" id="grid"></div></section>'+
 '<section class="in sec" id="s-cara" aria-labelledby="h-cara"><div class="sec-h"><p class="lab">Tiga langkah</p><h2 class="poster sec-t gt-text" id="h-cara">Cara beli</h2></div><ol class="stubs">'+
 '<li class="stb"><p class="lab">Stub 1 / 3</p><p class="stb-n" aria-hidden="true">01</p><h3>Pilih tiket</h3><p>Pilih event, kategori, dan jumlah tiket. Untuk event berkursi, pilih juga kursinya di denah.</p></li>'+
 '<li class="stb"><p class="lab">Stub 2 / 3</p><p class="stb-n" aria-hidden="true">02</p><h3>Bayar</h3><p>Isi data pembeli, pakai kode promo bila ada, lalu bayar. Pembayaran di demo ini hanya simulasi.</p></li>'+
 '<li class="stb"><p class="lab">Stub 3 / 3</p><p class="stb-n" aria-hidden="true">03</p><h3>Masuk</h3><p>E-tiket dengan kode QR terbit seketika. Tunjukkan di pintu masuk untuk dipindai petugas.</p></li></ol></section>'+
 den+
 '<section class="in sec home-end" id="s-faq" aria-labelledby="h-faq"><div class="sec-h"><p class="lab">Sering ditanyakan</p><h2 class="poster sec-t gt-text" id="h-faq">FAQ</h2></div><div class="faq">'+
 '<details><summary>Apakah pembayarannya sungguhan?</summary><p>Tidak. Ini demo: tidak ada uang yang berpindah dan semua data contoh tersimpan di peramban kamu.</p></details>'+
 '<details><summary>Berapa lama kursi ditahan?</summary><p>10 menit sejak kursi dipilih. Setelah itu kursi dilepas dan bisa dipilih orang lain.</p></details>'+
 '<details><summary>Di mana e-tiket saya?</summary><p>Muncul setelah pembayaran, dan bisa dibuka lagi lewat menu Cek pesanan dengan kode pesanan dan nomor telepon.</p></details>'+
 '<details><summary>Bisa ganti nama pemegang tiket?</summary><p>Bisa, lewat tombol Transfer nama di halaman e-tiket selama acara belum dimulai.</p></details>'+
 '<details><summary>Apa itu harga early bird?</summary><p>Harga lebih murah untuk event tertentu sampai tanggal yang tertera di halaman event. Setelah itu berlaku harga regular.</p></details></div></section>';
 homeGrid();
}
function homeGrid(){
 var q=ui.q.trim().toLowerCase(),from=ui.from?fromInput(ui.from,"00:00"):0;
 var list=db.events.filter(function(e){
  if(e.status!=="publish")return false;
  if(!ui.past&&isPast(e))return false;
  if(ui.cat&&e.cat!==ui.cat)return false;
  if(ui.city&&e.city!==ui.city)return false;
  if(from&&e.start<from)return false;
  if(q&&(e.name+" "+e.venue+" "+e.city+" "+e.cat).toLowerCase().indexOf(q)<0)return false;
  return true;
 }).sort(function(a,b){var pa=isPast(a),pb=isPast(b);return pa!==pb?(pa?1:-1):a.start-b.start});
 $("count").textContent=list.length?list.length+" event ditemukan":"";
 $("grid").innerHTML=list.length?list.map(function(e,i){
  var fl=evFlag(e),mn=minPrice(e),past=isPast(e);
  return '<div class="pcw"><a class="pc'+(past?" past":"")+'" href="#/event/'+esc(e.id)+'"><span class="pc-ph"><img src="'+esc(e.img)+'" alt="" loading="lazy" width="800" height="450" style="object-position:'+esc(e.pos||"50% 50%")+'"><span class="pc-top"><span class="pc-no">No. '+pad(i+1,4)+'</span><span class="pc-tags">'+pill("pri",e.cat)+(earlyOn(e)&&!fl?pill("acc","Early bird"):"")+(fl?pill(fl.c,fl.t):"")+'</span></span><span class="pc-t">'+esc(e.name)+'</span><span class="pc-m">'+esc(dstr(e.start))+' &middot; '+tstr(e.start)+' WIB</span><span class="pc-m">'+esc(e.venue)+', '+esc(e.city)+'</span></span><span class="pc-stub"><span class="pc-pr">'+(past?'<small>Status</small><b>Selesai</b>':'<small>Mulai dari</small><b>'+rp(mn)+'</b>')+'</span><span class="pc-go">'+(past?"Lihat":"Beli tiket")+'</span></span></a></div>';
 }).join(""):'<div class="empty"><h2>Tidak ada event yang cocok</h2><p>Ubah kata kunci, kota, atau tanggal.</p><button class="btn" type="button" data-act="fclear">Hapus filter</button></div>';
}
INP.fq=function(t){ui.q=t.value;homeGrid()};
INP.fcity=function(t){ui.city=t.value;homeGrid()};
INP.ffrom=function(t){ui.from=t.value;homeGrid()};
INP.fpast=function(t){ui.past=t.checked;homeGrid()};
ACT.cat=function(b){ui.cat=b.getAttribute("data-v");Array.prototype.forEach.call(document.querySelectorAll(".chips .chip"),function(x){x.setAttribute("aria-pressed",String(x===b))});homeGrid()};
ACT.fclear=function(){ui={q:"",cat:"",city:"",from:"",past:false};pageHome()};
FORMS.noop=function(){};

/* ---------- detail event ---------- */
function pageEvent(id){
 var ev=evById(id);
 if(!ev||ev.status!=="publish"){$("app").innerHTML='<div class="empty"><h1>Event tidak ditemukan</h1><p>Event ini tidak ada atau belum dibuka.</p><a class="btn" href="#/">Lihat semua event</a></div>';return}
 curEv=ev;document.title=ev.name+" | Panggung Kita (demo)";
 var fl=evFlag(ev);
 var sched=String(ev.sched||"").split("\n").filter(Boolean).map(function(l){var a=l.split("|");return '<li><b>'+esc((a[0]||"").trim())+'</b><span>'+esc((a[1]||"").trim())+'</span></li>'}).join("");
 $("app").innerHTML='<nav class="crumb" aria-label="Jejak halaman"><a href="#/">Event</a><span aria-hidden="true">/</span><span>'+esc(ev.name)+'</span></nav>'+
 '<div class="ev-grid"><div class="ev-main">'+
 '<div class="hero">'+evImg(ev,"hero-i",1000,520)+'</div>'+
 '<div class="ev-head"><div class="card-tags">'+pill("pri",ev.cat)+(fl?pill(fl.c,fl.t):"")+'</div><h1>'+esc(ev.name)+'</h1>'+
 '<ul class="meta"><li>'+ico("cal")+'<span>'+esc(dstr(ev.start))+'<br>'+tstr(ev.start)+' sampai '+tstr(ev.end)+' WIB</span></li><li>'+ico("home")+'<span>'+esc(ev.venue)+'<br>'+esc(ev.city)+'</span></li></ul></div>'+
 '<section class="blk" aria-labelledby="h-tk"><h2 id="h-tk">Pilih tiket</h2><div id="early"></div><div id="tiers"></div></section>'+
 (ev.seat?'<section class="blk" aria-labelledby="h-st"><h2 id="h-st">Pilih kursi</h2><div id="seatmap"></div></section>':"")+
 '<section class="blk"><h2>Tentang event</h2><p>'+esc(ev.desc)+'</p></section>'+
 '<section class="blk"><h2>Jadwal acara</h2><ol class="sched">'+sched+'</ol></section>'+
 '<section class="blk"><h2>Lokasi</h2><p><b>'+esc(ev.venue)+'</b><br>'+esc(ev.addr)+'</p></section>'+
 '</div><aside class="ev-side" id="sum" aria-label="Ringkasan pesanan"></aside></div>';
 evParts(ev);
}
function evParts(ev){
 keepFocus(function(){
  var c=db.cart,mine=c.ev===ev.id,past=isPast(ev);
  var eb=earlyOn(ev);
  $("early").innerHTML=eb?'<p class="note acc">Harga early bird berlaku sampai '+esc(dshort(ev.earlyUntil))+' pukul 23.59 WIB. Setelah itu harga regular.</p>':(ev.earlyUntil&&ev.tiers.some(function(t){return t.early!=null})?'<p class="note">Early bird sudah berakhir. Harga regular berlaku.</p>':"");
  $("tiers").innerHTML=ev.tiers.map(function(t){
   var av=avail(ev,t),q=mine?(c.q[t.id]||0):0,pr=curPrice(ev,t),seated=ev.seat&&ev.seat.tier===t.id;
   var ctrl;
   if(past)ctrl='<span class="pill mut">Ditutup</span>';
   else if(av<=0)ctrl='<span class="pill bad">Habis</span>';
   else if(seated)ctrl='<span class="seated">'+(q?q+" kursi dipilih":"Pilih di denah")+'</span>';
   else ctrl='<div class="step" role="group" aria-label="Jumlah tiket '+esc(t.name)+'"><button type="button" class="sb" data-act="qty" data-e="'+ev.id+'" data-t="'+t.id+'" data-d="-1" aria-label="Kurangi" '+(q?"":"disabled")+'>&minus;</button><output aria-live="polite">'+q+'</output><button type="button" class="sb" data-act="qty" data-e="'+ev.id+'" data-t="'+t.id+'" data-d="1" aria-label="Tambah">+</button></div>';
   return '<div class="tier'+(av<=0?" off":"")+'"><div class="tier-i"><h3>'+esc(t.name)+'</h3><p>'+esc(t.desc)+'</p><p class="stock">'+(av<=0?"Stok habis":(av<=10?"Tinggal "+av:av+" tersedia"))+'</p></div><div class="tier-p">'+(eb&&t.early!=null?'<s>'+rp(t.price)+'</s>':"")+'<b>'+rp(pr)+'</b>'+(eb&&t.early!=null?'<small>Early bird</small>':"")+'</div><div class="tier-c">'+ctrl+'</div></div>';
  }).join("")+'<p class="note">Maksimal '+ev.maxPer+' tiket per transaksi.</p>';
  if(ev.seat)$("seatmap").innerHTML=mapHtml(ev);
  $("sum").innerHTML=sumHtml(ev);
 });
}
function mapHtml(ev){
 var st=ev.seat,tk=takenSeats(ev.id),ho=heldOthers(ev.id),c=db.cart,mine=c.ev===ev.id?c.seats:[],rows="";
 var t=tierOf(ev,st.tier);
 for(var r=0;r<st.rows;r++){
  var L=String.fromCharCode(65+r),cells='<span class="rl" aria-hidden="true">'+L+'</span>';
  for(var k=1;k<=st.cols;k++){
   var code=L+k,cls="s-free",lab="tersedia",dis="";
   if(tk[code]){cls="s-sold";lab="terjual";dis=" disabled"}
   else if(ho[code]){cls="s-held";lab="ditahan pembeli lain";dis=" disabled"}
   else if(mine.indexOf(code)>=0){cls="s-mine";lab="dipilih"}
   if(isPast(ev))dis=" disabled";
   cells+='<button type="button" class="seat '+cls+(k===Math.ceil(st.cols/2)?" gap":"")+'" data-act="seat" data-e="'+ev.id+'" data-s="'+code+'" aria-label="Kursi '+code+', '+lab+'" aria-pressed="'+(mine.indexOf(code)>=0)+'"'+dis+'>'+k+'</button>';
  }
  rows+='<div class="srow">'+cells+'</div>';
 }
 var held=0;for(var h in ho)held++;
 return '<p class="note">Harga kursi '+rp(curPrice(ev,t))+' per kursi. Kursi yang dipilih ditahan 10 menit selama kamu menyelesaikan pesanan.</p><div class="seatmap"><div class="stage">PANGGUNG</div><div class="seats">'+rows+'</div></div>'+
 '<ul class="legend"><li><i class="seat s-free"></i>Tersedia</li><li><i class="seat s-mine"></i>Dipilihmu</li><li><i class="seat s-held"></i>Ditahan lain</li><li><i class="seat s-sold"></i>Terjual</li></ul>'+
 '<p class="selseat" aria-live="polite">'+(mine.length?'Kursi dipilih: <b>'+mine.slice().sort(seatCmp).join(", ")+'</b>. Ditahan <span class="cd" data-cd="'+c.hold+'">'+fmtCd(c.hold-Date.now())+'</span>':'Belum ada kursi dipilih.')+'</p>';
}
function sumHtml(ev){
 var c=db.cart,r=c.ev===ev.id?calc(c):{lines:[],qty:0,total:0,sub:0,disc:0};
 var lines=r.lines.map(function(l){return '<li><span>'+l.qty+' &times; '+esc(l.t.name)+(l.seats.length?'<br><small>Kursi '+esc(l.seats.join(", "))+'</small>':"")+'</span><b>'+rp(l.sub)+'</b></li>'}).join("");
 var seatHold=c.ev===ev.id&&c.seats.length&&c.hold;
 return '<div class="sum"><h2 class="sum-h">Pesanan kamu</h2>'+(lines?'<ul class="sum-l">'+lines+'</ul>':'<p class="sum-e">Belum ada tiket dipilih.</p>')+
 '<div class="sum-t"><span>'+(r.qty?r.qty+" tiket":"Total")+'</span><b>'+rp(r.sub)+'</b></div>'+
 (seatHold?'<p class="hold">Kursi ditahan <b class="cd" data-cd="'+c.hold+'">'+fmtCd(c.hold-Date.now())+'</b></p>':"")+
 '<button class="btn go" type="button" data-act="tocheckout" data-e="'+ev.id+'"'+(r.qty&&!isPast(ev)?"":" disabled")+'>Lanjut ke data pembeli</button></div>';
}
ACT.qty=function(b){
 var ev=evById(b.getAttribute("data-e")),t=tierOf(ev,b.getAttribute("data-t")),d=+b.getAttribute("data-d");
 if(isPast(ev))return toast("Penjualan event ini sudah ditutup.",true);
 var c=cartFor(ev),q=c.q[t.id]||0,n=q+d,tot=cartCount();
 if(n<0)return;
 if(d>0){
  if(tot+d>ev.maxPer)return toast("Maksimal "+ev.maxPer+" tiket per transaksi.",true);
  if(n>avail(ev,t))return toast("Stok "+t.name+" tinggal "+avail(ev,t)+".",true);
 }
 if(n===0)delete c.q[t.id];else c.q[t.id]=n;
 if(!cartCount())c.ev=null;
 save();evParts(ev);updateNav("event");
};
ACT.seat=function(b){
 var ev=evById(b.getAttribute("data-e")),s=b.getAttribute("data-s");
 if(isPast(ev))return;
 var t=tierOf(ev,ev.seat.tier),c=cartFor(ev),i=c.seats.indexOf(s);
 if(i>=0){
  c.seats.splice(i,1);db.holds=db.holds.filter(function(h){return !(h.sid===SID&&h.ev===ev.id&&h.seat===s)});
  if(c.seats.length)c.q[t.id]=c.seats.length;else{delete c.q[t.id];c.hold=0}
  if(!cartCount())c.ev=null;
 }else{
  if(takenSeats(ev.id)[s]){toast("Kursi "+s+" sudah terjual.",true);return evParts(ev)}
  if(heldOthers(ev.id)[s]){toast("Kursi "+s+" sedang ditahan pembeli lain.",true);return evParts(ev)}
  if(cartCount()+1>ev.maxPer)return toast("Maksimal "+ev.maxPer+" tiket per transaksi.",true);
  if(!c.hold||c.hold<Date.now())c.hold=Date.now()+HOLD_MS;
  c.seats.push(s);c.q[t.id]=c.seats.length;
  db.holds.push({ev:ev.id,seat:s,sid:SID,until:c.hold});
 }
 save();evParts(ev);updateNav("event");
};
ACT.tocheckout=function(b){var ev=evById(b.getAttribute("data-e"));if(db.cart.ev!==ev.id||!cartCount())return toast("Pilih tiket dulu.",true);location.hash="#/checkout"};

/* ---------- checkout ---------- */
function coState(){if(!ui.co)ui.co={name:"",phone:"",email:"",holders:[],ok:false,method:"QRIS"};return ui.co}
function captureCo(){
 var f=$("coform");if(!f)return;var s=coState();
 s.name=f.elements.name.value;s.phone=f.elements.phone.value;s.email=f.elements.email.value;
 s.holders=Array.prototype.map.call(f.querySelectorAll("[data-h]"),function(x){return x.value});
}
function seatLines(r){var a=[];r.lines.forEach(function(l){for(var i=0;i<l.qty;i++)a.push({t:l.t,seat:l.seats[i]||""})});return a}
function sumBlock(r,withTotal){
 var h='<ul class="sum-l">'+r.lines.map(function(l){return '<li><span>'+l.qty+' &times; '+esc(l.t.name)+(l.seats.length?'<br><small>Kursi '+esc(l.seats.join(", "))+'</small>':"")+'</span><b>'+rp(l.sub)+'</b></li>'}).join("")+'</ul>';
 h+='<dl class="sum-d"><dt>Subtotal</dt><dd>'+rp(r.sub)+'</dd>'+(r.promo?'<dt>Promo '+esc(r.promo.code)+'</dt><dd class="okc">&minus;'+rp(r.disc)+'</dd>':"")+'</dl><div class="sum-t"><span>Total</span><b>'+rp(r.total)+'</b></div>';
 return h;
}
function pageCheckout(){
 var c=db.cart,r=calc(c),ev=r.ev;
 if(!ev||!r.qty){$("app").innerHTML='<div class="empty"><h1>Keranjang kosong</h1><p>Pilih event dan tiket dulu.</p><a class="btn" href="#/">Lihat event</a></div>';return}
 var s=coState(),sl=seatLines(r);
 var holders=sl.map(function(x,i){return '<label class="fld">Tiket '+(i+1)+': '+esc(x.t.name)+(x.seat?', kursi '+esc(x.seat):"")+'<input class="inp" data-h="'+i+'" maxlength="40" value="'+esc(s.holders[i]||"")+'" placeholder="Sama dengan nama pembeli"></label>'}).join("");
 var seatHold=c.seats.length&&c.hold;
 $("app").innerHTML='<nav class="crumb" aria-label="Jejak halaman"><a href="#/">Event</a><span aria-hidden="true">/</span><a href="#/event/'+esc(ev.id)+'">'+esc(ev.name)+'</a><span aria-hidden="true">/</span><span>Data pembeli</span></nav><h1>Data pembeli</h1>'+
 '<div class="co-grid"><div>'+(seatHold?'<p class="note acc">Kursi kamu ditahan <b class="cd" data-cd="'+c.hold+'">'+fmtCd(c.hold-Date.now())+'</b>. Selesaikan sebelum waktu habis.</p>':"")+
 '<form id="coform" class="card-f" data-form="co" novalidate><h2>Pembeli</h2>'+
 '<label class="fld">Nama lengkap<input class="inp" name="name" autocomplete="name" maxlength="40" value="'+esc(s.name)+'" aria-describedby="e-name"><span class="err" id="e-name"></span></label>'+
 '<label class="fld">Nomor telepon<input class="inp" name="phone" inputmode="tel" autocomplete="tel" maxlength="16" value="'+esc(s.phone)+'" placeholder="0812-0000-1234" aria-describedby="e-phone"><span class="err" id="e-phone"></span></label>'+
 '<label class="fld">Email<input class="inp" name="email" type="email" autocomplete="email" maxlength="60" value="'+esc(s.email)+'" aria-describedby="e-email"><span class="err" id="e-email"></span></label>'+
 '<h2>Nama pemegang tiket</h2><p class="note">Nama ini tercetak di e-tiket. Kosongkan untuk memakai nama pembeli.</p>'+holders+'</form>'+
 '<form class="card-f promo" data-form="promo" novalidate><h2>Kode promo</h2><div class="row"><label class="fld grow">Kode<input class="inp" id="pcode" maxlength="20" value="'+esc(c.promo)+'" placeholder="Contoh: HEMAT10" style="text-transform:uppercase"></label><button class="btn alt" type="submit">Pakai</button></div><p class="'+(r.perr?"err":"okc")+'" id="pmsg" role="status">'+(r.perr?esc(r.perr):(r.promo?"Promo "+esc(r.promo.code)+" dipakai, hemat "+rp(r.disc):""))+'</p>'+(c.promo?'<button class="lnk" type="button" data-act="promo-x">Lepas promo</button>':"")+'</form></div>'+
 '<aside class="ev-side"><div class="sum"><h2 class="sum-h">'+esc(ev.name)+'</h2><p class="sum-m">'+esc(dtstr(ev.start))+'</p>'+sumBlock(r)+'<button class="btn go" type="submit" form="coform">Lanjut ke pembayaran</button><a class="lnk" href="#/event/'+esc(ev.id)+'">Ubah tiket</a></div></aside></div>';
}
function fieldErr(k,m){var e=$("e-"+k);if(e)e.textContent=m||"";var i=document.querySelector('#coform [name="'+k+'"]');if(i){if(m)i.setAttribute("aria-invalid","true");else i.removeAttribute("aria-invalid")}}
FORMS.co=function(){
 captureCo();var s=coState(),bad=0,ph=s.phone.replace(/\D/g,"");
 ["name","phone","email"].forEach(function(k){fieldErr(k,"")});
 if(s.name.trim().length<3){fieldErr("name","Isi nama lengkap, minimal 3 huruf.");bad++}
 if(!/^(0|62)8\d{7,12}$/.test(ph)){fieldErr("phone","Nomor tidak valid. Contoh: 0812-0000-1234.");bad++}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email.trim())){fieldErr("email","Email tidak valid. Contoh: nama@contoh.id");bad++}
 if(bad){toast("Periksa isian yang bertanda merah.",true);var f=document.querySelector('#coform [aria-invalid="true"]');if(f)f.focus();return}
 s.ok=true;location.hash="#/bayar";
};
FORMS.promo=function(){
 captureCo();var v=$("pcode").value.trim().toUpperCase();
 if(!v){db.cart.promo="";save();return pageCheckout()}
 var r=calc(db.cart),k=promoCheck(v,r.ev,r.sub);
 if(k.err){db.cart.promo="";save();pageCheckout();$("pcode").value=v;var m=$("pmsg");m.className="err";m.textContent=k.err;$("pcode").focus();return}
 db.cart.promo=v;save();pageCheckout();toast("Promo dipakai.");
};
ACT["promo-x"]=function(){captureCo();db.cart.promo="";save();pageCheckout()};

/* ---------- pembayaran (simulasi) ---------- */
function pagePay(){
 var c=db.cart,r=calc(c),ev=r.ev,s=coState();
 if(!ev||!r.qty){location.hash="#/checkout";return}
 if(!s.ok){location.hash="#/checkout";return}
 var seatHold=c.seats.length&&c.hold;
 var ms=METHODS.map(function(m,i){return '<label class="radio"><input type="radio" name="method" value="'+esc(m)+'"'+((s.method||"QRIS")===m?" checked":"")+'> <span>'+esc(m)+'<small>'+["Nomor virtual account contoh","Pindai QRIS contoh","Saldo dompet digital contoh","Kartu contoh, tanpa data kartu"][i]+'</small></span></label>'}).join("");
 $("app").innerHTML='<nav class="crumb" aria-label="Jejak halaman"><a href="#/">Event</a><span aria-hidden="true">/</span><a href="#/checkout">Data pembeli</a><span aria-hidden="true">/</span><span>Pembayaran</span></nav><h1>Pembayaran</h1>'+
 '<div class="co-grid"><div>'+(seatHold?'<p class="note acc">Kursi ditahan <b class="cd" data-cd="'+c.hold+'">'+fmtCd(c.hold-Date.now())+'</b>.</p>':"")+
 '<form class="card-f" data-form="pay" id="payform"><h2>Metode pembayaran</h2><p class="note">Ini simulasi. Tidak ada uang atau data kartu yang diproses.</p><div class="radios">'+ms+'</div>'+
 '<div class="note" id="vabox">Pembeli: <b>'+esc(s.name)+'</b>, '+esc(s.phone)+'</div><p class="err" id="payerr" role="alert"></p>'+
 '<button class="btn go" type="submit" id="paybtn">Bayar '+rp(r.total)+'</button><button class="btn alt" type="button" data-act="payfail" id="failbtn">Simulasikan pembayaran gagal</button></form></div>'+
 '<aside class="ev-side"><div class="sum"><h2 class="sum-h">'+esc(ev.name)+'</h2><p class="sum-m">'+esc(dtstr(ev.start))+'</p>'+sumBlock(r)+'</div></aside></div>';
}
var paying=false;
FORMS.pay=function(f){
 if(paying)return;
 var m=f.querySelector("input[name=method]:checked");coState().method=m?m.value:"QRIS";
 paying=true;var b=$("paybtn");b.disabled=true;b.textContent="Memproses pembayaran...";$("failbtn").disabled=true;$("payerr").textContent="";
 setTimeout(function(){
  paying=false;var res=placeOrder();
  if(res.err){var e=$("payerr");if(e){e.textContent=res.err;$("paybtn").disabled=false;$("paybtn").textContent="Coba bayar lagi";$("failbtn").disabled=false}toast(res.err,true);return}
  location.hash="#/order/"+res.o.id;toast("Pembayaran berhasil. E-tiket terbit.");
 },900);
};
ACT.payfail=function(){
 if(paying)return;paying=true;var b=$("paybtn");b.disabled=true;b.textContent="Memproses pembayaran...";$("failbtn").disabled=true;
 setTimeout(function(){paying=false;var e=$("payerr");if(!e)return;e.textContent="Pembayaran gagal (simulasi). Saldo tidak terpotong dan kursi masih ditahan. Coba lagi atau pilih metode lain.";b.disabled=false;b.textContent="Coba bayar lagi";$("failbtn").disabled=false},900);
};
function orderCode(){var c;do{c="ORD-"+mkCode(Math.random,6)}while(ordById(c));return c}
function ticketCode(){var c,ok;do{c=mkCode(Math.random,4)+"-"+mkCode(Math.random,4);ok=!findTicket(c)}while(!ok);return c}
function placeOrder(){
 purgeHolds();cartExpiryCheck();
 var c=db.cart,r=calc(c),ev=r.ev,s=coState();
 if(!ev||!r.qty)return{err:"Keranjang kosong atau kursi sudah dilepas. Pilih tiket lagi."};
 if(ev.status!=="publish"||isPast(ev))return{err:"Penjualan event ini sudah ditutup."};
 if(r.qty>ev.maxPer)return{err:"Maksimal "+ev.maxPer+" tiket per transaksi."};
 var i,l;
 for(i=0;i<r.lines.length;i++){l=r.lines[i];if(l.qty>avail(ev,l.t))return{err:"Stok "+l.t.name+" tinggal "+avail(ev,l.t)+". Kurangi jumlah tiket."}}
 if(ev.seat){
  var sl=r.lines.filter(function(x){return x.t.id===ev.seat.tier})[0];
  if(sl){
   if(sl.seats.length!==sl.qty)return{err:"Jumlah kursi tidak sama dengan jumlah tiket."};
   var tk=takenSeats(ev.id),ho=heldOthers(ev.id);
   for(i=0;i<sl.seats.length;i++){
    if(tk[sl.seats[i]])return{err:"Kursi "+sl.seats[i]+" sudah terjual. Pilih kursi lain."};
    if(ho[sl.seats[i]])return{err:"Kursi "+sl.seats[i]+" sudah ditahan pembeli lain."};
    var mine=db.holds.some(function(h){return h.sid===SID&&h.ev===ev.id&&h.seat===sl.seats[i]});
    if(!mine)return{err:"Waktu tahan kursi "+sl.seats[i]+" sudah habis."};
   }
  }
 }
 if(c.promo&&r.perr)return{err:"Promo: "+r.perr};
 var holders=s.holders||[],tickets=[],idx=0;
 r.lines.forEach(function(l){for(var k=0;k<l.qty;k++){tickets.push({code:ticketCode(),tier:l.t.id,holder:(holders[idx]||"").trim()||s.name.trim(),seat:l.seats[k]||"",used:null,log:[]});idx++}});
 var o={id:orderCode(),ev:ev.id,items:r.lines.map(function(l){return{tier:l.t.id,qty:l.qty,price:l.price}}),buyer:{name:s.name.trim(),phone:s.phone.trim(),email:s.email.trim()},sub:r.sub,disc:r.disc,promo:r.promo?r.promo.code:"",total:r.total,status:"paid",at:Date.now(),method:s.method||"QRIS",tickets:tickets};
 db.orders.push(o);
 if(r.promo)r.promo.used++;
 db.holds=db.holds.filter(function(h){return h.sid!==SID});
 db.cart={ev:null,q:{},seats:[],promo:"",hold:0};
 ui.co=null;addOk(o.id);save();
 return{o:o};
}

/* ---------- cek pesanan + e-tiket ---------- */
function pageCek(code){
 var first=db.orders.filter(function(o){return o.status==="paid"})[0];
 $("app").innerHTML='<h1>Cek pesanan</h1><p class="lead">Masukkan kode pesanan dan nomor telepon saat membeli untuk melihat e-tiket.</p>'+
 '<form class="card-f narrow" data-form="cek" novalidate><label class="fld">Kode pesanan<input class="inp" name="code" maxlength="14" autocapitalize="characters" value="'+esc(code||"")+'" placeholder="ORD-ABC234" aria-describedby="e-cek"></label><label class="fld">Nomor telepon<input class="inp" name="phone" inputmode="tel" maxlength="16" placeholder="0812-0000-1234"></label><p class="err" id="e-cek" role="alert"></p><button class="btn go" type="submit">Lihat pesanan</button>'+
 (first?'<p class="note">Untuk mencoba: kode <b>'+esc(first.id)+'</b>, telepon <b>'+esc(first.buyer.phone)+'</b>.</p>':"")+'</form>';
}
FORMS.cek=function(f){
 var code=f.elements.code.value.trim().toUpperCase().replace(/\s/g,"");if(code&&code.indexOf("ORD-")!==0)code="ORD-"+code;
 var ph=normPhone(f.elements.phone.value),o=ordById(code),e=$("e-cek");
 if(!code||!ph){e.textContent="Isi kode pesanan dan nomor telepon.";return}
 if(!o||normPhone(o.buyer.phone)!==ph){e.textContent="Kode atau nomor telepon tidak cocok. Periksa lagi.";return}
 addOk(o.id);if(location.hash==="#/order/"+o.id)route(true);else location.hash="#/order/"+o.id;
};
function tkCard(o,t,ev){
 var tr=tierOf(ev,t.tier),st=tkStatus(o,t),can=st.t==="Valid"&&t.log.length<2;
 return '<article class="tkw"><div class="tk'+(st.t==="Valid"?"":" dim")+'"><div class="tk-m"><p class="tk-b">'+esc(db.org)+' &middot; E-TIKET</p><h3>'+esc(ev.name)+'</h3><p>'+esc(dstr(ev.start))+', '+tstr(ev.start)+' WIB</p><p>'+esc(ev.venue)+', '+esc(ev.city)+'</p>'+
 '<dl><div><dt>Pemegang</dt><dd>'+esc(t.holder)+'</dd></div><div><dt>Kategori</dt><dd>'+esc(tr?tr.name:"")+'</dd></div>'+(t.seat?'<div><dt>Kursi</dt><dd>'+esc(t.seat)+'</dd></div>':"")+'</dl><p class="code">'+esc(t.code)+'</p>'+pill(st.c,st.t)+(t.used?' <small>masuk '+esc(dtstr(t.used))+'</small>':"")+'</div><div class="tk-q">'+qrSvg("TKT:"+t.code,"qr","Kode QR tiket "+t.code)+'</div></div>'+
 (t.log.length?'<p class="tk-log">Riwayat nama: '+t.log.map(function(x){return esc(x.from)+" &rarr; "+esc(x.to)}).join("; ")+'</p>':"")+
 '<div class="tk-a noprint"><button class="btn alt" type="button" data-act="dl" data-o="'+esc(o.id)+'" data-c="'+esc(t.code)+'">Unduh tiket (SVG)</button><button class="btn alt" type="button" data-act="xfer" data-o="'+esc(o.id)+'" data-c="'+esc(t.code)+'"'+(can?"":" disabled")+'>Transfer nama</button></div></article>';
}
function pageOrder(id){
 var o=ordById(id);
 if(!o||okList().indexOf(o.id)<0){pageCek(id);if(o||id)$("e-cek").textContent="Masukkan nomor telepon pembeli untuk membuka pesanan ini.";return}
 var ev=evById(o.ev);
 $("app").innerHTML='<nav class="crumb noprint" aria-label="Jejak halaman"><a href="#/cek">Cek pesanan</a><span aria-hidden="true">/</span><span>'+esc(o.id)+'</span></nav>'+
 '<div class="ord-h"><div><h1>Pesanan '+esc(o.id)+'</h1><p>'+esc(dtstr(o.at))+' &middot; '+esc(o.method)+' &middot; '+rp(o.total)+(o.promo?' (promo '+esc(o.promo)+')':"")+'</p></div>'+pill(o.status==="paid"?"ok":"bad",o.status==="paid"?"Lunas":"Dibatalkan, dana dikembalikan")+'</div>'+
 (o.status!=="paid"?'<p class="note bad">Pesanan ini sudah di-refund. Tiket tidak berlaku lagi.</p>':"")+
 '<div class="ord-a noprint"><button class="btn" type="button" data-act="print">Cetak semua tiket</button><a class="btn alt" href="#/event/'+esc(ev.id)+'">Lihat event</a></div>'+
 '<div class="tickets print-area" id="tickets">'+o.tickets.map(function(t){return tkCard(o,t,ev)}).join("")+'</div>';
}
ACT.print=function(){window.print()};
ACT.dl=function(b){
 var o=ordById(b.getAttribute("data-o")),t=o&&o.tickets.filter(function(x){return x.code===b.getAttribute("data-c")})[0];if(!t)return;
 download("tiket-"+t.code+".svg",ticketSvgFile(o,t),"image/svg+xml");toast("Tiket diunduh.");
};
ACT.xfer=function(b){
 var o=ordById(b.getAttribute("data-o")),t=o&&o.tickets.filter(function(x){return x.code===b.getAttribute("data-c")})[0];if(!t)return;
 openSheet("Transfer nama tiket",'<form data-form="xfer" novalidate><input type="hidden" name="o" value="'+esc(o.id)+'"><input type="hidden" name="c" value="'+esc(t.code)+'"><p>Tiket <b>'+esc(t.code)+'</b> saat ini atas nama <b>'+esc(t.holder)+'</b>.</p><label class="fld">Nama pemegang baru<input class="inp" name="to" maxlength="40" autocomplete="off" aria-describedby="e-xfer"></label><p class="err" id="e-xfer" role="alert"></p><p class="note">Kode QR tetap sama. Transfer maksimal 2 kali per tiket dan tidak bisa setelah tiket dipakai. Sisa: '+(2-t.log.length)+'.</p><button class="btn go" type="submit">Simpan nama baru</button><button class="btn alt" type="button" data-act="sheet-close">Batal</button></form>');
};
FORMS.xfer=function(f){
 var o=ordById(f.elements.o.value),t=o&&o.tickets.filter(function(x){return x.code===f.elements.c.value})[0],to=f.elements.to.value.trim(),e=$("e-xfer");
 if(!t)return;
 if(tkStatus(o,t).t!=="Valid"){e.textContent="Tiket ini tidak bisa ditransfer.";return}
 if(t.log.length>=2){e.textContent="Batas transfer sudah tercapai.";return}
 if(to.length<3){e.textContent="Isi nama baru, minimal 3 huruf.";return}
 if(to.toLowerCase()===t.holder.toLowerCase()){e.textContent="Nama baru sama dengan nama sekarang.";return}
 t.log.push({at:Date.now(),from:t.holder,to:to});t.holder=to;save();closeSheet();pageOrder(o.id);toast("Nama pemegang diubah.");
};

/* ---------- jam ---------- */
function tick(){
 var n=Date.now();boardTick();
 if(cartExpiryCheck()){route(true);return}
 Array.prototype.forEach.call(document.querySelectorAll("[data-cd]"),function(el){var left=+el.getAttribute("data-cd")-n;el.textContent=fmtCd(left);el.classList.toggle("low",left<60000)});
 if(purgeHolds()&&curEv&&!sheetOpen())evParts(curEv);
}
