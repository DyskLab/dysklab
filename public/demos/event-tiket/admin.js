"use strict";
/* Panel penyelenggara: #/admin, PIN demo 2468 */
var ADM=[["dash","Ringkasan","home"],["event","Event","cal"],["order","Pesanan","list"],["checkin","Check-in","scan"],["promo","Promo","tag"],["set","Setelan","gear"]];
var uiA={dev:"",dm:"rev",eq:"",ostat:"",oev:"",oq:"",opage:1,ciq:"",cipage:1,newOrd:""};
var PAGE=12;
function admShell(){
 return '<div class="adm"><nav class="anav" aria-label="Menu penyelenggara"><a class="a-brand" href="#/admin">'+ico("tix")+'<span><b id="a-org"></b><small>Panel penyelenggara</small></span></a>'+
 ADM.map(function(a){return '<a class="a-l" href="#/admin'+(a[0]==="dash"?"":"/"+a[0])+'" data-a="'+a[0]+'">'+ico(a[2])+'<span>'+a[1]+'</span></a>'}).join("")+'</nav>'+
 '<div class="amain"><header class="atop"><h1 id="atitle"></h1><div class="a-act"><a class="btn alt sm" href="#/">Lihat situs</a><button class="btn alt sm" type="button" data-act="logout">Keluar</button></div></header><main id="app" tabindex="-1"></main></div></div>';
}
function admRoute(p){
 if(!admOk()){setShell("login");pageLogin();document.title="Masuk penyelenggara | Panggung Kita (demo)";return}
 setShell("adm");
 var sub=p[1]||"dash",t="Ringkasan";
 ADM.forEach(function(a){if(a[0]===sub){t=a[1]}});
 $("atitle").textContent=t;$("a-org").textContent=db.org;document.title=t+" | Penyelenggara (demo)";
 Array.prototype.forEach.call(document.querySelectorAll(".a-l"),function(x){if(x.getAttribute("data-a")===sub)x.setAttribute("aria-current","page");else x.removeAttribute("aria-current")});
 ({dash:admDash,event:admEvents,order:admOrders,checkin:admCheckin,promo:admPromo,set:admSettings}[sub]||admDash)();
}
function pageLogin(){
 $("app").innerHTML='<div class="login"><div class="login-b">'+ico("tix","brand-i")+'<h1>Panel penyelenggara</h1><p>Masuk untuk mengelola event, penjualan, dan check-in.</p></div><form class="card-f" data-form="login" novalidate><label class="fld">PIN (4 angka)<input class="inp pin" name="pin" inputmode="numeric" maxlength="4" autocomplete="off" aria-describedby="e-pin"></label><p class="err" id="e-pin" role="alert"></p><button class="btn go" type="submit">Masuk</button><p class="note">PIN demo: <b>'+esc(db.pin)+'</b></p><a class="lnk" href="#/">Kembali ke situs pembeli</a></form></div>';
 var i=document.querySelector("[name=pin]");if(i)i.focus();
}
FORMS.login=function(f){
 var v=f.elements.pin.value.trim();
 if(v!==db.pin){$("e-pin").textContent="PIN salah. Coba lagi.";f.elements.pin.value="";f.elements.pin.focus();return}
 setAdm(true);mode=null;route(true);toast("Selamat datang.");
};
ACT.logout=function(){setAdm(false);mode=null;location.hash="#/admin";route(true)};

/* ---------- ringkasan ---------- */
function paidOrders(evId){return db.orders.filter(function(o){return o.status==="paid"&&(!evId||o.ev===evId)})}
function shortRp(n){if(n>=1e6)return (n/1e6).toFixed(1).replace(".0","").replace(".",",")+"jt";if(n>=1e3)return Math.round(n/1e3)+"rb";return String(n)}
function statCard(l,v,s){return '<div class="stat"><span>'+esc(l)+'</span><b>'+v+'</b><small>'+s+'</small></div>'}
function admDash(){
 var po=paidOrders(),rev=0,tix=0,used=0,issued=0;
 po.forEach(function(o){rev+=o.total;o.tickets.forEach(function(t){tix++;if(t.used)used++})});
 var today=dayKey(Date.now()),tr=0,tn=0;po.forEach(function(o){if(dayKey(o.at)===today){tr+=o.total;tn++}});
 var evs=db.events.filter(function(e){return e.status==="publish"}).sort(function(a,b){return a.start-b.start});
 $("app").innerHTML='<div class="live"><span class="dot" aria-hidden="true"></span><span>Langsung: halaman ini ikut berubah saat ada pesanan baru dari tab pembeli lain.</span><button class="btn alt sm" type="button" data-act="simorder">Simulasikan pembelian</button></div>'+
 '<div class="stats">'+statCard("Pendapatan",rp(rev),"Hari ini "+rp(tr))+statCard("Tiket terjual",tix,"Hari ini "+tn+" pesanan")+statCard("Pesanan lunas",po.length,db.orders.length-po.length+" refund")+statCard("Sudah check-in",used,tix?Math.round(used/tix*100)+"% dari tiket":"-")+'</div>'+
 '<div class="panel"><div class="panel-h"><h2>Penjualan 14 hari terakhir</h2><div class="row2"><label class="fld sm">Event<select class="inp" data-in="adev"><option value="">Semua event</option>'+db.events.map(function(e){return '<option value="'+e.id+'"'+(uiA.dev===e.id?" selected":"")+'>'+esc(e.name)+'</option>'}).join("")+'</select></label><label class="fld sm">Ukuran<select class="inp" data-in="adm"><option value="rev"'+(uiA.dm==="rev"?" selected":"")+'>Pendapatan</option><option value="qty"'+(uiA.dm==="qty"?" selected":"")+'>Jumlah tiket</option></select></label></div></div><div id="chartbox"></div></div>'+
 '<div class="two-c"><div class="panel"><h2>Penjualan per event</h2><div class="evp">'+evs.map(function(e){var s=evStat(e),pc=s.quota?Math.round(s.sold/s.quota*100):0;return '<div class="evp-i"><div class="evp-t"><b>'+esc(e.name)+'</b><span>'+rp(s.rev)+'</span></div><div class="bar" role="img" aria-label="'+s.sold+' dari '+s.quota+' tiket terjual"><i style="width:'+pc+'%"></i></div><small>'+s.sold+' / '+s.quota+' tiket ('+pc+'%)'+e.tiers.map(function(t){return " &middot; "+esc(t.name)+" "+sold(e.id,t.id)+"/"+t.quota}).join("")+'</small></div>'}).join("")+'</div></div>'+
 '<div class="panel"><h2>Pesanan terbaru</h2><ul class="feed">'+db.orders.slice().sort(function(a,b){return b.at-a.at}).slice(0,8).map(function(o){var e=evById(o.ev),q=o.tickets.length;return '<li'+(o.id===uiA.newOrd?' class="new"':"")+'><div><b>'+esc(o.buyer.name)+'</b> <span>'+q+' tiket &middot; '+esc(e?e.name:"")+'</span></div><div class="feed-r"><b>'+rp(o.total)+'</b><small>'+(o.status==="paid"?ago(o.at):"Refund")+'</small></div></li>'}).join("")+'</ul></div></div>';
 chart();
}
INP.adev=function(t){uiA.dev=t.value;chart()};
INP.adm=function(t){uiA.dm=t.value;chart()};
function chart(){
 var days=[],map={},i;
 for(i=13;i>=0;i--){var k=dayKey(jktMid(-i)+36e5);days.push(k);map[k]=0}
 paidOrders(uiA.dev).forEach(function(o){var k=dayKey(o.at);if(k in map)map[k]+=uiA.dm==="rev"?o.total:o.tickets.length});
 var vals=days.map(function(k){return map[k]}),mx=Math.max.apply(null,vals.concat([1]));
 var pw=Math.pow(10,Math.floor(Math.log(mx)/Math.LN10)),top=Math.ceil(mx/pw*2)/2*pw;if(top<mx)top=mx;
 var W=420,H=220,L=40,B=26,T=10,pwid=W-L-4,ph=H-B-T,bw=pwid/14,out='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Grafik batang '+(uiA.dm==="rev"?"pendapatan":"jumlah tiket")+' per hari, 14 hari terakhir. Total '+(uiA.dm==="rev"?rp(vals.reduce(function(a,b){return a+b},0)):vals.reduce(function(a,b){return a+b},0)+" tiket")+'">';
 for(i=0;i<=4;i++){var y=T+ph-ph*i/4;out+='<line x1="'+L+'" x2="'+(W-4)+'" y1="'+y+'" y2="'+y+'" class="gl"/><text x="'+(L-5)+'" y="'+(y+4)+'" text-anchor="end" class="gt">'+(uiA.dm==="rev"?shortRp(top*i/4):Math.round(top*i/4))+'</text>'}
 vals.forEach(function(v,j){
  var h=top?ph*v/top:0,x=L+j*bw+bw*.18,d=days[j];
  out+='<rect x="'+x.toFixed(1)+'" y="'+(T+ph-h).toFixed(1)+'" width="'+(bw*.64).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" class="'+(j===13?"bar-t":"bar-b")+'"><title>'+esc(d.slice(8)+"/"+d.slice(5,7)+": "+(uiA.dm==="rev"?rp(v):v+" tiket"))+'</title></rect><text x="'+(x+bw*.32).toFixed(1)+'" y="'+(H-9)+'" text-anchor="middle" class="gt">'+(+d.slice(8))+'</text>';
 });
 $("chartbox").innerHTML=out+'</svg><p class="note">Sumbu bawah: tanggal. Batang tua: hari ini.</p>';
}
function rndName(){return NAMES[Math.floor(Math.random()*NAMES.length)]+" "+LAST[Math.floor(Math.random()*LAST.length)]}
ACT.simorder=function(){
 var evs=db.events.filter(function(e){return e.status==="publish"&&!isPast(e)&&e.tiers.some(function(t){return avail(e,t)>0})});
 if(!evs.length)return toast("Semua tiket sudah habis, tidak ada yang bisa disimulasikan.",true);
 var ev=evs[Math.floor(Math.random()*evs.length)],ts=ev.tiers.filter(function(t){return avail(ev,t)>0}),t=ts[Math.floor(Math.random()*ts.length)];
 var q=Math.min(1+Math.floor(Math.random()*3),avail(ev,t),ev.maxPer),seats=[];
 if(ev.seat&&ev.seat.tier===t.id){
  var tk=takenSeats(ev.id),ho=heldOthers(ev.id),mine={};db.cart.seats.forEach(function(s){mine[s]=1});
  var free=[];for(var r=0;r<ev.seat.rows;r++)for(var c=1;c<=ev.seat.cols;c++){var cd=String.fromCharCode(65+r)+c;if(!tk[cd]&&!ho[cd]&&!mine[cd])free.push(cd)}
  q=Math.min(q,free.length);if(!q)return toast("Tidak ada kursi bebas untuk disimulasikan.",true);
  for(var i=0;i<q;i++)seats.push(free.splice(Math.floor(Math.random()*free.length),1)[0]);
 }
 var pr=curPrice(ev,t),nm=rndName(),tickets=[];
 for(var k=0;k<q;k++)tickets.push({code:ticketCode(),tier:t.id,holder:nm,seat:seats[k]||"",used:null,log:[]});
 var o={id:orderCode(),ev:ev.id,items:[{tier:t.id,qty:q,price:pr}],buyer:{name:nm,phone:"0812-0000-"+("000"+Math.floor(Math.random()*10000)).slice(-4),email:nm.toLowerCase().replace(/\W+/g,".")+"@contoh.id"},sub:pr*q,disc:0,promo:"",total:pr*q,status:"paid",at:Date.now(),method:"Simulasi",tickets:tickets};
 db.orders.push(o);uiA.newOrd=o.id;save();route(true);toast("Pesanan masuk: "+nm+", "+q+" tiket "+t.name+".");
};

/* ---------- event ---------- */
function thumb(ev){return '<img class="thumb" src="'+esc(ev.img)+'" alt="" width="64" height="40" loading="lazy" style="object-position:'+esc(ev.pos||"50% 50%")+'">'}
function admEvents(){
 $("app").innerHTML='<div class="bar-a"><label class="fld grow">Cari event<input class="inp" type="search" data-in="aeq" value="'+esc(uiA.eq)+'" placeholder="Nama, kota, atau kategori"></label><button class="btn go" type="button" data-act="evnew">Event baru</button></div><div id="evtable"></div>';
 evTable();
}
INP.aeq=function(t){uiA.eq=t.value;evTable()};
function evTable(){
 var q=uiA.eq.trim().toLowerCase(),l=db.events.filter(function(e){return !q||(e.name+" "+e.city+" "+e.cat).toLowerCase().indexOf(q)>=0}).sort(function(a,b){return b.start-a.start});
 $("evtable").innerHTML=l.length?'<table class="tbl"><thead><tr><th>Event</th><th>Jadwal</th><th>Terjual</th><th>Pendapatan</th><th>Status</th><th><span class="vh">Aksi</span></th></tr></thead><tbody>'+l.map(function(e){
  var s=evStat(e),pc=s.quota?Math.round(s.sold/s.quota*100):0,fl=e.status==="draft"?{t:"Draft",c:"mut"}:(isPast(e)?{t:"Selesai",c:"mut"}:(s.left<=0?{t:"Habis",c:"bad"}:{t:"Dijual",c:"ok"}));
  return '<tr><td data-l="Event" class="tdmain">'+thumb(e)+'<span><b>'+esc(e.name)+'</b><small>'+esc(e.cat)+' &middot; '+esc(e.city)+'</small></span></td><td data-l="Jadwal">'+esc(dtstr(e.start))+'</td><td data-l="Terjual"><div class="bar sm" aria-hidden="true"><i style="width:'+pc+'%"></i></div>'+s.sold+' / '+s.quota+'</td><td data-l="Pendapatan">'+rp(s.rev)+'</td><td data-l="Status">'+pill(fl.c,fl.t)+'</td><td class="acts"><button class="btn alt sm" type="button" data-act="evedit" data-id="'+e.id+'">Ubah</button><button class="btn alt sm" type="button" data-act="tiers" data-id="'+e.id+'">Tiket</button><button class="btn alt sm dng" type="button" data-act="evdel" data-id="'+e.id+'" data-key="evdel'+e.id+'">Hapus</button></td></tr>';
 }).join("")+'</tbody></table>':'<div class="empty"><h2>Tidak ada event</h2><p>Buat event pertama atau ubah kata kunci.</p></div>';
}
ACT.evnew=function(){evForm(null)};
ACT.evedit=function(b){evForm(b.getAttribute("data-id"))};
ACT.evdel=function(b){
 var ev=evById(b.getAttribute("data-id"));
 if(db.orders.some(function(o){return o.ev===ev.id}))return toast("Event ini sudah punya pesanan. Ubah statusnya ke Draft untuk menyembunyikan.",true);
 twice(b,"Hapus","Tekan lagi",function(){db.events=db.events.filter(function(e){return e!==ev});if(db.cart.ev===ev.id)releaseCart();save();evTable();toast("Event dihapus.")});
};
function opt(v,l,sel){return '<option value="'+esc(v)+'"'+(sel?" selected":"")+'>'+esc(l)+'</option>'}
function evForm(id){
 var ev=id?evById(id):null,d=ev||{name:"",cat:"Konser",city:"",venue:"",addr:"",start:jktMid(30)+19*36e5,end:jktMid(30)+22*36e5,img:IMGS[0].f,desc:"",sched:"",maxPer:6,earlyUntil:null,status:"draft",seat:null,tiers:[{id:"t1",name:"Reguler",price:100000,quota:100}]};
 var st=d.seat||{rows:0,cols:0,tier:d.tiers[0].id};
 openSheet(ev?"Ubah event":"Event baru",'<form data-form="evsave" novalidate><input type="hidden" name="id" value="'+esc(id||"")+'">'+
 fld("Nama event",'<input class="inp" name="nm" maxlength="60" value="'+esc(d.name)+'">',"nm")+
 '<div class="two">'+fld("Kategori",'<select class="inp" name="cat">'+CATS.map(function(c){return opt(c,c,c===d.cat)}).join("")+'</select>',"cat")+fld("Kota",'<input class="inp" name="city" maxlength="30" value="'+esc(d.city)+'">',"city")+'</div>'+
 fld("Tempat",'<input class="inp" name="venue" maxlength="60" value="'+esc(d.venue)+'">',"venue")+fld("Alamat",'<input class="inp" name="addr" maxlength="100" value="'+esc(d.addr)+'">',"addr")+
 '<div class="three">'+fld("Tanggal",'<input class="inp" type="date" name="date" value="'+dayKey(d.start)+'">',"date")+fld("Mulai",'<input class="inp" type="time" name="t1" value="'+timeInput(d.start)+'">',"t1")+fld("Selesai",'<input class="inp" type="time" name="t2" value="'+timeInput(d.end)+'">',"t2")+'</div>'+
 fld("Foto",'<select class="inp" name="img">'+IMGS.map(function(m){return opt(m.f,m.l,m.f===d.img)}).join("")+'</select>',"img")+
 fld("Deskripsi",'<textarea class="inp" name="desc" rows="4" maxlength="500">'+esc(d.desc)+'</textarea>',"desc")+
 fld("Jadwal acara (satu baris: jam|acara)",'<textarea class="inp" name="sched" rows="4" maxlength="600" placeholder="19.00|Pintu dibuka">'+esc(d.sched)+'</textarea>',"sched")+
 '<div class="two">'+fld("Maks. tiket per transaksi",'<input class="inp" name="max" inputmode="numeric" maxlength="2" value="'+d.maxPer+'">',"max")+fld("Early bird sampai (opsional)",'<input class="inp" type="date" name="early" value="'+(d.earlyUntil?dayKey(d.earlyUntil):"")+'">',"early")+'</div>'+
 fld("Status",'<select class="inp" name="status">'+opt("publish","Dijual",d.status==="publish")+opt("draft","Draft (tersembunyi)",d.status==="draft")+'</select>',"status")+
 '<fieldset class="fs"><legend>Denah kursi (opsional)</legend><p class="note">Isi baris dan kolom untuk menyalakan pilih kursi pada satu kategori tiket. Kosongkan (0) untuk mematikan.</p><div class="three">'+fld("Baris (maks. 8)",'<input class="inp" name="rows" inputmode="numeric" maxlength="1" value="'+st.rows+'">',"rows")+fld("Kolom (maks. 12)",'<input class="inp" name="cols" inputmode="numeric" maxlength="2" value="'+st.cols+'">',"cols")+fld("Kategori",'<select class="inp" name="stier">'+d.tiers.map(function(t){return opt(t.id,t.name,t.id===st.tier)}).join("")+'</select>',"stier")+'</div></fieldset>'+
 '<button class="btn go" type="submit">Simpan event</button><button class="btn alt" type="button" data-act="sheet-close">Batal</button></form>');
}
function fld(label,input,k){return '<label class="fld">'+label+input+'<span class="err" id="se-'+k+'"></span></label>'}
function sErr(k,m){var e=$("se-"+k);if(e)e.textContent=m||""}
FORMS.evsave=function(f){
 var E=f.elements,id=E.id.value,ev=id?evById(id):null,bad=false,first=null;
 ["nm","cat","city","venue","addr","date","t1","t2","img","desc","sched","max","early","status","rows","cols","stier"].forEach(function(k){sErr(k,"")});
 var e=function(k,m){sErr(k,m);bad=true;if(!first)first=E[k]};
 var nm=E.nm.value.trim(),city=E.city.value.trim(),venue=E.venue.value.trim(),addr=E.addr.value.trim(),desc=E.desc.value.trim();
 if(nm.length<3)e("nm","Isi nama event, minimal 3 huruf.");
 if(!city)e("city","Isi kota.");
 if(!venue)e("venue","Isi nama tempat.");
 if(!desc)e("desc","Isi deskripsi singkat.");
 var s1=fromInput(E.date.value,E.t1.value),s2=fromInput(E.date.value,E.t2.value);
 if(isNaN(s1))e("date","Pilih tanggal.");
 else if(!E.t1.value||!E.t2.value)e("t1","Isi jam mulai dan selesai.");
 else if(s2<=s1)e("t2","Jam selesai harus setelah jam mulai.");
 var mp=num(E.max.value);if(mp<1||mp>10)e("max","Isi 1 sampai 10.");
 var eu=null;if(E.early.value){eu=fromInput(E.early.value,"23:59");if(isNaN(s1)||eu>s1)e("early","Early bird harus berakhir sebelum acara.")}
 var rows=num(E.rows.value),cols=num(E.cols.value),stier=E.stier.value;
 if((rows>0)!==(cols>0))e("rows","Isi baris dan kolom, atau kosongkan keduanya.");
 else if(rows>8||cols>12)e("rows","Maksimal 8 baris dan 12 kolom.");
 else if(rows>0&&cols<2)e("cols","Minimal 2 kolom.");
 if(ev&&!bad){
  var old=ev.seat,seated=paidTickets(ev.id).filter(function(t){return t.seat});
  if(seated.length){
   if(!rows)e("rows","Sudah ada kursi terjual. Denah tidak bisa dimatikan.");
   else if(old&&stier!==old.tier)e("stier","Sudah ada kursi terjual. Kategori kursi tidak bisa diganti.");
   else seated.forEach(function(t){if(t.seat.charCodeAt(0)-64>rows||+t.seat.slice(1)>cols)e("rows","Ada kursi terjual di luar denah baru ("+t.seat+").")});
  }
 }
 if(bad){toast("Periksa isian yang bertanda merah.",true);if(first)first.focus();return}
 var wasNew=!ev;
 if(!ev){ev={id:newId("e"),tiers:[{id:"t1",name:"Reguler",desc:"Masuk sepanjang acara",price:100000,early:null,quota:100}]};db.events.push(ev)}
 ev.name=nm;ev.cat=E.cat.value;ev.city=city;ev.venue=venue;ev.addr=addr||"-";ev.start=s1;ev.end=s2;ev.img=E.img.value;ev.desc=desc;ev.sched=E.sched.value.trim();ev.maxPer=mp;ev.earlyUntil=eu;ev.status=E.status.value;
 if(!ev.pos)ev.pos="50% 50%";
 if(rows>0){ev.seat={rows:rows,cols:cols,tier:stier};var t=tierOf(ev,stier);if(t)t.quota=rows*cols}else ev.seat=null;
 save();closeSheet();route(true);toast(wasNew?"Event dibuat sebagai draft. Atur kategori tiket lalu ubah status ke Dijual.":"Event disimpan.");
};
function tiersSheet(id,edit){
 var ev=evById(id);if(!ev)return;
 if(edit!==undefined&&edit!==null){
  var t=edit==="new"?{id:"",name:"",desc:"",price:0,early:null,quota:50}:tierOf(ev,edit),seated=ev.seat&&ev.seat.tier===t.id,sd=t.id?sold(ev.id,t.id):0;
  openSheet(edit==="new"?"Kategori tiket baru":"Ubah kategori tiket",'<form data-form="tiersave" novalidate><input type="hidden" name="e" value="'+esc(ev.id)+'"><input type="hidden" name="t" value="'+esc(t.id)+'">'+
  '<p class="note">Event: <b>'+esc(ev.name)+'</b>'+(sd?'. Sudah terjual '+sd+'.':"")+'</p>'+
  fld("Nama kategori",'<input class="inp" name="nm" maxlength="30" value="'+esc(t.name)+'">',"nm")+fld("Keterangan",'<input class="inp" name="desc" maxlength="80" value="'+esc(t.desc||"")+'">',"desc")+
  '<div class="two">'+fld("Harga regular (Rp)",'<input class="inp" name="price" inputmode="numeric" maxlength="9" value="'+t.price+'">',"price")+fld("Harga early bird (opsional)",'<input class="inp" name="early" inputmode="numeric" maxlength="9" value="'+(t.early!=null?t.early:"")+'">',"early")+'</div>'+
  fld("Kuota"+(seated?" (otomatis dari denah kursi)":""),'<input class="inp" name="quota" inputmode="numeric" maxlength="5" value="'+t.quota+'"'+(seated?" readonly":"")+'>',"quota")+
  '<button class="btn go" type="submit">Simpan kategori</button><button class="btn alt" type="button" data-act="tiers" data-id="'+ev.id+'">Kembali ke daftar</button></form>');
  return;
 }
 openSheet("Kategori tiket: "+ev.name,'<p class="note">'+(earlyOn(ev)?"Early bird aktif sampai "+esc(dshort(ev.earlyUntil))+".":"Harga regular berlaku.")+'</p><ul class="tl">'+ev.tiers.map(function(t){var s=sold(ev.id,t.id);return '<li><div><b>'+esc(t.name)+'</b><small>'+esc(t.desc||"")+'</small><small>'+rp(t.price)+(t.early!=null?' &middot; early bird '+rp(t.early):"")+' &middot; terjual '+s+' / '+t.quota+(ev.seat&&ev.seat.tier===t.id?" &middot; berkursi":"")+'</small></div><div class="acts"><button class="btn alt sm" type="button" data-act="tieredit" data-e="'+ev.id+'" data-t="'+t.id+'">Ubah</button><button class="btn alt sm dng" type="button" data-act="tierdel" data-e="'+ev.id+'" data-t="'+t.id+'" data-key="td'+ev.id+t.id+'">Hapus</button></div></li>'}).join("")+'</ul><button class="btn go" type="button" data-act="tiernew" data-e="'+ev.id+'">Tambah kategori</button>');
}
ACT.tiers=function(b){tiersSheet(b.getAttribute("data-id"))};
ACT.tiernew=function(b){tiersSheet(b.getAttribute("data-e"),"new")};
ACT.tieredit=function(b){tiersSheet(b.getAttribute("data-e"),b.getAttribute("data-t"))};
ACT.tierdel=function(b){
 var ev=evById(b.getAttribute("data-e")),t=tierOf(ev,b.getAttribute("data-t"));
 if(ev.tiers.length<2)return toast("Event harus punya minimal satu kategori.",true);
 if(sold(ev.id,t.id)||db.orders.some(function(o){return o.ev===ev.id&&o.tickets.some(function(x){return x.tier===t.id})}))return toast("Kategori ini sudah punya pesanan, tidak bisa dihapus.",true);
 if(ev.seat&&ev.seat.tier===t.id)return toast("Kategori ini dipakai denah kursi. Matikan denah dulu di pengaturan event.",true);
 twice(b,"Hapus","Tekan lagi",function(){ev.tiers=ev.tiers.filter(function(x){return x!==t});delete db.cart.q[t.id];save();tiersSheet(ev.id);evTable&&$("evtable")&&evTable();toast("Kategori dihapus.")});
};
FORMS.tiersave=function(f){
 var E=f.elements,ev=evById(E.e.value),t=E.t.value?tierOf(ev,E.t.value):null,bad=false;
 ["nm","desc","price","early","quota"].forEach(function(k){sErr(k,"")});
 var e=function(k,m){sErr(k,m);bad=true};
 var nm=E.nm.value.trim(),price=E.price.value.trim()===""?NaN:num(E.price.value),ea=E.early.value.trim()===""?null:num(E.early.value),q=num(E.quota.value);
 if(nm.length<2)e("nm","Isi nama kategori.");
 else if(ev.tiers.some(function(x){return x!==t&&x.name.toLowerCase()===nm.toLowerCase()}))e("nm","Nama kategori sudah dipakai.");
 if(isNaN(price))e("price","Isi harga. Isi 0 untuk tiket gratis.");
 if(ea!==null&&!isNaN(price)&&ea>price)e("early","Harga early bird tidak boleh di atas harga regular.");
 var sd=t?sold(ev.id,t.id):0;
 if(!(ev.seat&&t&&ev.seat.tier===t.id)){if(q<1)e("quota","Kuota minimal 1.");else if(q<sd)e("quota","Kuota tidak boleh di bawah jumlah terjual ("+sd+").")}
 if(bad){toast("Periksa isian yang bertanda merah.",true);return}
 if(!t){t={id:newId("t")};ev.tiers.push(t)}
 t.name=nm;t.desc=E.desc.value.trim();t.price=price;t.early=ea;if(!(ev.seat&&ev.seat.tier===t.id))t.quota=q;
 save();tiersSheet(ev.id);if($("evtable"))evTable();toast("Kategori disimpan.");
};

/* ---------- pesanan ---------- */
function ordFiltered(){
 var q=uiA.oq.trim().toLowerCase();
 return db.orders.filter(function(o){
  if(uiA.oev&&o.ev!==uiA.oev)return false;
  if(uiA.ostat&&o.status!==uiA.ostat)return false;
  if(q&&(o.id+" "+o.buyer.name+" "+o.buyer.phone+" "+o.buyer.email).toLowerCase().indexOf(q)<0)return false;
  return true;
 }).sort(function(a,b){return b.at-a.at});
}
function admOrders(){
 $("app").innerHTML='<form class="filters" data-form="noop" role="search" aria-label="Filter pesanan"><label class="fld grow">Cari pesanan<input class="inp" type="search" data-in="aoq" value="'+esc(uiA.oq)+'" placeholder="Kode, nama, telepon, email"></label><label class="fld">Event<select class="inp" data-in="aoev"><option value="">Semua event</option>'+db.events.map(function(e){return opt(e.id,e.name,e.id===uiA.oev)}).join("")+'</select></label><label class="fld">Status<select class="inp" data-in="aost">'+opt("","Semua",!uiA.ostat)+opt("paid","Lunas",uiA.ostat==="paid")+opt("refunded","Refund",uiA.ostat==="refunded")+'</select></label></form>'+
 '<div class="bar-a"><span class="count" id="ocount" aria-live="polite"></span><div class="acts"><button class="btn alt sm" type="button" data-act="csvo">CSV pesanan</button><button class="btn alt sm" type="button" data-act="csvp">CSV peserta</button></div></div><div id="otable"></div>';
 ordTable();
}
INP.aoq=function(t){uiA.oq=t.value;uiA.opage=1;ordTable()};
INP.aoev=function(t){uiA.oev=t.value;uiA.opage=1;ordTable()};
INP.aost=function(t){uiA.ostat=t.value;uiA.opage=1;ordTable()};
function pager(total,page,size,act){
 var n=Math.max(1,Math.ceil(total/size));if(n<2)return "";
 return '<div class="pager"><button class="btn alt sm" type="button" data-act="'+act+'" data-d="-1"'+(page<=1?" disabled":"")+'>Sebelumnya</button><span>Halaman '+page+' dari '+n+'</span><button class="btn alt sm" type="button" data-act="'+act+'" data-d="1"'+(page>=n?" disabled":"")+'>Berikutnya</button></div>';
}
function ordTable(){
 var l=ordFiltered(),n=Math.max(1,Math.ceil(l.length/PAGE));if(uiA.opage>n)uiA.opage=n;
 var rows=l.slice((uiA.opage-1)*PAGE,uiA.opage*PAGE);
 $("ocount").textContent=l.length+" pesanan";
 $("otable").innerHTML=rows.length?'<table class="tbl"><thead><tr><th>Kode</th><th>Waktu</th><th>Pembeli</th><th>Event</th><th>Tiket</th><th>Total</th><th>Status</th><th><span class="vh">Aksi</span></th></tr></thead><tbody>'+rows.map(function(o){
  var e=evById(o.ev);
  return '<tr><td data-l="Kode"><button class="lnk b" type="button" data-act="odet" data-id="'+esc(o.id)+'">'+esc(o.id)+'</button></td><td data-l="Waktu">'+esc(dtstr(o.at))+'</td><td data-l="Pembeli"><b>'+esc(o.buyer.name)+'</b><small>'+esc(o.buyer.phone)+'</small></td><td data-l="Event">'+esc(e?e.name:"-")+'</td><td data-l="Tiket">'+o.tickets.length+'</td><td data-l="Total">'+rp(o.total)+'</td><td data-l="Status">'+pill(o.status==="paid"?"ok":"bad",o.status==="paid"?"Lunas":"Refund")+'</td><td class="acts"><button class="btn alt sm" type="button" data-act="odet" data-id="'+esc(o.id)+'">Detail</button>'+(o.status==="paid"?'<button class="btn alt sm dng" type="button" data-act="refund" data-id="'+esc(o.id)+'" data-key="rf'+esc(o.id)+'">Refund</button>':"")+'</td></tr>';
 }).join("")+'</tbody></table>'+pager(l.length,uiA.opage,PAGE,"opg"):'<div class="empty"><h2>Tidak ada pesanan</h2><p>Ubah filter atau kata kunci.</p></div>';
}
ACT.opg=function(b){uiA.opage+=+b.getAttribute("data-d");ordTable()};
ACT.odet=function(b){orderSheet(b.getAttribute("data-id"))};
function orderSheet(id){
 var o=ordById(id);if(!o)return;var ev=evById(o.ev);
 openSheet("Pesanan "+o.id,'<dl class="kv"><dt>Status</dt><dd>'+pill(o.status==="paid"?"ok":"bad",o.status==="paid"?"Lunas":"Refund")+(o.refundAt?" "+esc(dtstr(o.refundAt)):"")+'</dd><dt>Event</dt><dd>'+esc(ev?ev.name:"-")+'</dd><dt>Dibeli</dt><dd>'+esc(dtstr(o.at))+'</dd><dt>Pembeli</dt><dd>'+esc(o.buyer.name)+'<br>'+esc(o.buyer.phone)+'<br>'+esc(o.buyer.email)+'</dd><dt>Metode</dt><dd>'+esc(o.method)+'</dd><dt>Subtotal</dt><dd>'+rp(o.sub)+'</dd><dt>Promo</dt><dd>'+(o.promo?esc(o.promo)+" (&minus;"+rp(o.disc)+")":"-")+'</dd><dt>Total</dt><dd><b>'+rp(o.total)+'</b></dd></dl>'+
 '<h3 class="sh3">Tiket</h3><ul class="tl">'+o.tickets.map(function(t){var tr=ev?tierOf(ev,t.tier):null,st=tkStatus(o,t);return '<li><div><b>'+esc(t.holder)+'</b><small>'+esc(tr?tr.name:"")+(t.seat?" &middot; kursi "+esc(t.seat):"")+'</small><small class="mono">'+esc(t.code)+'</small></div>'+pill(st.c,st.t)+'</li>'}).join("")+'</ul>'+
 (o.status==="paid"?'<button class="btn dng-b" type="button" data-act="refund" data-id="'+esc(o.id)+'" data-key="rfs'+esc(o.id)+'">Refund pesanan</button><p class="note">Refund membatalkan semua tiket dan membebaskan kursi. Tidak bisa dilakukan jika ada tiket yang sudah dipakai.</p>':"")+
 '<button class="btn alt" type="button" data-act="sheet-close">Tutup</button>');
}
ACT.refund=function(b){
 var o=ordById(b.getAttribute("data-id"));if(!o||o.status!=="paid")return;
 if(o.tickets.some(function(t){return t.used}))return toast("Ada tiket yang sudah check-in. Pesanan ini tidak bisa di-refund.",true);
 twice(b,b.textContent,"Tekan lagi untuk refund",function(){
  o.status="refunded";o.refundAt=Date.now();o.tickets.forEach(function(t){t.void=true});
  if(o.promo){db.promos.forEach(function(p){if(p.code===o.promo&&p.used>0)p.used--})}
  save();var sh=sheetOpen();if(sh)orderSheet(o.id);route(true);toast("Refund "+rp(o.total)+" dicatat. Tiket dibatalkan.");
 });
};
function evName(id){var e=evById(id);return e?e.name:"-"}
ACT.csvo=function(){
 var rows=[["Kode","Waktu (UTC)","Event","Pembeli","Telepon","Email","Tiket","Jumlah","Subtotal","Diskon","Promo","Total","Metode","Status"]];
 ordFiltered().forEach(function(o){var ev=evById(o.ev);rows.push([o.id,new Date(o.at).toISOString(),evName(o.ev),o.buyer.name,o.buyer.phone,o.buyer.email,o.items.map(function(i){var t=ev?tierOf(ev,i.tier):null;return (t?t.name:i.tier)+" x"+i.qty}).join("; "),o.tickets.length,o.sub,o.disc,o.promo,o.total,o.method,o.status==="paid"?"Lunas":"Refund"])});
 csvDownload("pesanan-"+dayKey(Date.now())+".csv",rows);toast("CSV pesanan diunduh ("+(rows.length-1)+" baris).");
};
ACT.csvp=function(){
 var rows=[["Kode tiket","Kode pesanan","Event","Kategori","Kursi","Pemegang","Pembeli","Telepon","Status","Check-in (UTC)"]];
 ordFiltered().forEach(function(o){var ev=evById(o.ev);o.tickets.forEach(function(t){var tr=ev?tierOf(ev,t.tier):null;rows.push([t.code,o.id,evName(o.ev),tr?tr.name:"",t.seat,t.holder,o.buyer.name,o.buyer.phone,tkStatus(o,t).t,t.used?new Date(t.used).toISOString():""])})});
 csvDownload("peserta-"+dayKey(Date.now())+".csv",rows);toast("CSV peserta diunduh ("+(rows.length-1)+" tiket).");
};

/* ---------- check-in ---------- */
var ciRes=null;
function ciEvent(){
 if(uiA.ciev&&evById(uiA.ciev))return evById(uiA.ciev);
 var l=db.events.filter(function(e){return e.status==="publish"}),up=l.filter(function(e){return !isPast(e)&&evStat(e).sold>0}).sort(function(a,b){return a.start-b.start});
 return up[0]||l[0]||null;
}
function admCheckin(){
 var ev=ciEvent();
 if(!ev){$("app").innerHTML='<div class="empty"><h2>Belum ada event</h2></div>';return}
 var tk=[];db.orders.forEach(function(o){if(o.ev===ev.id&&o.status==="paid")o.tickets.forEach(function(t){tk.push(t)})});
 var used=tk.filter(function(t){return t.used}).length,pc=tk.length?Math.round(used/tk.length*100):0;
 $("app").innerHTML='<div class="ci-grid"><div><label class="fld">Event di pintu<select class="inp" data-in="ciev">'+db.events.filter(function(e){return e.status==="publish"}).map(function(e){return opt(e.id,e.name+" ("+dshort(e.start)+")",e.id===ev.id)}).join("")+'</select></label>'+
 '<div class="panel"><h2>Pindai tiket</h2><form data-form="scan" novalidate><label class="fld">Kode tiket<input class="inp scan" id="scode" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD-2345 atau isi QR" maxlength="30"></label><button class="btn go" type="submit">Periksa tiket</button></form><p class="note">Tidak ada kamera di demo. Ketik kode di tiket, atau tempel isi QR (TKT:...). Kode contoh ada di daftar peserta di bawah.</p><div id="scanres" role="status" aria-live="assertive">'+(ciRes&&ciRes.ev===ev.id?scanHtml(ciRes):"")+'</div></div>'+
 '<div class="panel"><h2>Sudah masuk</h2><p class="big">'+used+' <small>dari '+tk.length+' tiket</small></p><div class="bar" role="img" aria-label="'+pc+' persen sudah masuk"><i style="width:'+pc+'%"></i></div></div>'+
 '<div class="panel"><h2>Pemindaian terakhir</h2><ul class="feed">'+(db.scans.filter(function(s){return s.ev===ev.id}).slice(0,6).map(function(s){return '<li><div><b class="mono">'+esc(s.code)+'</b> <span>'+esc(s.msg)+'</span></div><div class="feed-r">'+pill(s.res==="ok"?"ok":"bad",s.res==="ok"?"Masuk":"Ditolak")+'<small>'+ago(s.at)+'</small></div></li>'}).join("")||'<li><span>Belum ada pemindaian.</span></li>')+'</ul></div></div>'+
 '<div class="panel"><div class="panel-h"><h2>Daftar peserta</h2><label class="fld sm">Cari<input class="inp" type="search" data-in="ciq" value="'+esc(uiA.ciq)+'" placeholder="Nama atau kode"></label></div><div id="citable"></div></div></div>';
 ciTable(ev);var s=$("scode");if(s&&ciRes&&ciRes.focus){s.focus();ciRes.focus=false}
}
INP.ciev=function(t){uiA.ciev=t.value;uiA.cipage=1;ciRes=null;admCheckin()};
INP.ciq=function(t){uiA.ciq=t.value;uiA.cipage=1;ciTable(ciEvent())};
function ciTable(ev){
 var q=uiA.ciq.trim().toLowerCase().replace(/[-\s]/g,""),l=[];
 db.orders.forEach(function(o){if(o.ev===ev.id)o.tickets.forEach(function(t){if(!q||(t.holder+t.code+o.id).toLowerCase().replace(/[-\s]/g,"").indexOf(q)>=0)l.push({o:o,t:t})})});
 var n=Math.max(1,Math.ceil(l.length/PAGE));if(uiA.cipage>n)uiA.cipage=n;
 var rows=l.slice((uiA.cipage-1)*PAGE,uiA.cipage*PAGE);
 $("citable").innerHTML=rows.length?'<table class="tbl"><thead><tr><th>Pemegang</th><th>Kode tiket</th><th>Kategori</th><th>Kursi</th><th>Status</th></tr></thead><tbody>'+rows.map(function(x){var tr=tierOf(ev,x.t.tier),st=tkStatus(x.o,x.t);return '<tr><td data-l="Pemegang">'+esc(x.t.holder)+'</td><td data-l="Kode" class="mono">'+esc(x.t.code)+'</td><td data-l="Kategori">'+esc(tr?tr.name:"")+'</td><td data-l="Kursi">'+esc(x.t.seat||"-")+'</td><td data-l="Status">'+pill(st.c,st.t)+'</td></tr>'}).join("")+'</tbody></table>'+pager(l.length,uiA.cipage,PAGE,"cipg"):'<p class="note">Tidak ada tiket yang cocok.</p>';
}
ACT.cipg=function(b){uiA.cipage+=+b.getAttribute("data-d");ciTable(ciEvent())};
function scanHtml(r){
 var cls=r.res==="ok"?"ok":"bad";
 return '<div class="scan-r '+cls+'"><b>'+(r.res==="ok"?"MASUK":"DITOLAK")+'</b><p>'+esc(r.msg)+'</p>'+(r.info?'<p class="scan-i">'+r.info+'</p>':"")+(r.res==="ok"&&r.code?'<button class="btn alt sm" type="button" data-act="unscan" data-c="'+esc(r.code)+'">Urungkan check-in</button>':"")+'</div>';
}
FORMS.scan=function(f){
 var ev=ciEvent(),raw=f.elements.code.value.trim();
 if(!raw)return toast("Ketik atau tempel kode tiket.",true);
 var hit=findTicket(raw),res;
 var log=function(r,msg,code){db.scans.unshift({at:Date.now(),code:code||raw.toUpperCase().slice(0,20),res:r,msg:msg,ev:ev.id});db.scans=db.scans.slice(0,40)};
 if(!hit){res={res:"bad",msg:"Kode tidak dikenal. Tiket palsu atau salah ketik.",ev:ev.id};log("bad","Tidak dikenal")}
 else if(hit.o.status!=="paid"||hit.t.void){res={res:"bad",msg:"Tiket dibatalkan (pesanan di-refund).",info:esc(hit.t.holder),ev:ev.id};log("bad","Dibatalkan",hit.t.code)}
 else if(hit.o.ev!==ev.id){res={res:"bad",msg:"Tiket ini untuk event lain.",info:esc(evName(hit.o.ev)),ev:ev.id};log("bad","Event lain",hit.t.code)}
 else if(hit.t.used){res={res:"bad",msg:"Tiket sudah dipakai pada "+dtstr(hit.t.used)+".",info:esc(hit.t.holder),ev:ev.id};log("bad","Sudah dipakai",hit.t.code)}
 else{
  hit.t.used=Date.now();var tr=tierOf(ev,hit.t.tier);
  res={res:"ok",msg:"Tiket valid. Silakan masuk.",info:'<b>'+esc(hit.t.holder)+'</b> &middot; '+esc(tr?tr.name:"")+(hit.t.seat?" &middot; kursi "+esc(hit.t.seat):""),code:hit.t.code,ev:ev.id};log("ok","Valid",hit.t.code);
 }
 res.focus=true;ciRes=res;save();admCheckin();
};
ACT.unscan=function(b){
 var hit=findTicket(b.getAttribute("data-c"));if(!hit)return;hit.t.used=null;
 db.scans=db.scans.filter(function(s){return !(s.code===hit.t.code&&s.res==="ok")});
 ciRes={res:"bad",msg:"Check-in diurungkan.",ev:ciEvent().id};save();admCheckin();toast("Check-in diurungkan.");
};

/* ---------- promo ---------- */
function admPromo(){
 $("app").innerHTML='<div class="bar-a"><p class="note">Kode promo dipakai pembeli di halaman data pembeli.</p><button class="btn go" type="button" data-act="promonew">Promo baru</button></div><div id="ptable"></div>';
 promoTable();
}
function promoTable(){
 $("ptable").innerHTML=db.promos.length?'<table class="tbl"><thead><tr><th>Kode</th><th>Potongan</th><th>Berlaku untuk</th><th>Terpakai</th><th>Sampai</th><th>Status</th><th><span class="vh">Aksi</span></th></tr></thead><tbody>'+db.promos.map(function(p){
  var exp=p.until&&p.until<Date.now(),full=p.max&&p.used>=p.max,st=!p.active?{t:"Nonaktif",c:"mut"}:(exp?{t:"Berakhir",c:"bad"}:(full?{t:"Habis",c:"bad"}:{t:"Aktif",c:"ok"}));
  return '<tr><td data-l="Kode" class="mono"><b>'+esc(p.code)+'</b></td><td data-l="Potongan">'+(p.type==="pct"?p.value+"%":rp(p.value))+'</td><td data-l="Berlaku untuk">'+(p.ev?esc(evName(p.ev)):"Semua event")+'</td><td data-l="Terpakai">'+p.used+(p.max?" / "+p.max:" (tanpa batas)")+'</td><td data-l="Sampai">'+(p.until?esc(dstr(p.until)):"-")+'</td><td data-l="Status">'+pill(st.c,st.t)+'</td><td class="acts"><button class="btn alt sm" type="button" data-act="promotog" data-c="'+esc(p.code)+'">'+(p.active?"Nonaktifkan":"Aktifkan")+'</button><button class="btn alt sm" type="button" data-act="promoedit" data-c="'+esc(p.code)+'">Ubah</button><button class="btn alt sm dng" type="button" data-act="promodel" data-c="'+esc(p.code)+'" data-key="pd'+esc(p.code)+'">Hapus</button></td></tr>';
 }).join("")+'</tbody></table>':'<div class="empty"><h2>Belum ada promo</h2></div>';
}
function promoForm(code){
 var p=code?db.promos.filter(function(x){return x.code===code})[0]:{code:"",type:"pct",value:10,ev:"",max:0,used:0,until:null,active:true};
 openSheet(code?"Ubah promo":"Promo baru",'<form data-form="promosave" novalidate><input type="hidden" name="old" value="'+esc(code||"")+'">'+
 fld("Kode (huruf dan angka)",'<input class="inp" name="code" maxlength="12" style="text-transform:uppercase" value="'+esc(p.code)+'"'+(code?" readonly":"")+'>',"code")+
 '<div class="two">'+fld("Jenis",'<select class="inp" name="type">'+opt("pct","Persen (%)",p.type==="pct")+opt("nom","Nominal (Rp)",p.type==="nom")+'</select>',"type")+fld("Nilai",'<input class="inp" name="value" inputmode="numeric" maxlength="9" value="'+p.value+'">',"value")+'</div>'+
 fld("Berlaku untuk",'<select class="inp" name="ev">'+opt("","Semua event",!p.ev)+db.events.map(function(e){return opt(e.id,e.name,e.id===p.ev)}).join("")+'</select>',"ev")+
 '<div class="two">'+fld("Batas pemakaian (0 = tanpa batas)",'<input class="inp" name="max" inputmode="numeric" maxlength="5" value="'+p.max+'">',"max")+fld("Berlaku sampai (opsional)",'<input class="inp" type="date" name="until" value="'+(p.until?dayKey(p.until):"")+'">',"until")+'</div>'+
 '<label class="chk"><input type="checkbox" name="active"'+(p.active?" checked":"")+'> Aktif</label><button class="btn go" type="submit">Simpan promo</button><button class="btn alt" type="button" data-act="sheet-close">Batal</button></form>');
}
ACT.promonew=function(){promoForm(null)};
ACT.promoedit=function(b){promoForm(b.getAttribute("data-c"))};
ACT.promotog=function(b){db.promos.forEach(function(p){if(p.code===b.getAttribute("data-c"))p.active=!p.active});save();promoTable();toast("Status promo diubah.")};
ACT.promodel=function(b){var c=b.getAttribute("data-c");twice(b,"Hapus","Tekan lagi",function(){db.promos=db.promos.filter(function(p){return p.code!==c});if(db.cart.promo===c)db.cart.promo="";save();promoTable();toast("Promo dihapus.")})};
FORMS.promosave=function(f){
 var E=f.elements,old=E.old.value,bad=false;
 ["code","value","max","until"].forEach(function(k){sErr(k,"")});
 var e=function(k,m){sErr(k,m);bad=true};
 var code=E.code.value.trim().toUpperCase(),type=E.type.value,val=num(E.value.value),max=num(E.max.value),until=E.until.value?fromInput(E.until.value,"23:59"):null;
 if(!/^[A-Z0-9]{3,12}$/.test(code))e("code","Kode 3 sampai 12 huruf atau angka, tanpa spasi.");
 else if(!old&&db.promos.some(function(p){return p.code===code}))e("code","Kode sudah ada.");
 if(type==="pct"&&(val<1||val>100))e("value","Persen 1 sampai 100.");
 if(type==="nom"&&val<1000)e("value","Nominal minimal Rp1.000.");
 var p=old?db.promos.filter(function(x){return x.code===old})[0]:null;
 if(p&&max&&max<p.used)e("max","Batas tidak boleh di bawah jumlah terpakai ("+p.used+").");
 if(bad){toast("Periksa isian yang bertanda merah.",true);return}
 if(!p){p={code:code,used:0};db.promos.push(p)}
 p.type=type;p.value=val;p.ev=E.ev.value;p.max=max;p.until=until;p.active=E.active.checked;
 save();closeSheet();promoTable();toast("Promo disimpan.");
};

/* ---------- pengaturan ---------- */
function admSettings(){
 $("app").innerHTML='<div class="panel narrow"><h2>Pengaturan</h2><form data-form="setsave" novalidate>'+fld("Nama penyelenggara",'<input class="inp" name="org" maxlength="30" value="'+esc(db.org)+'">',"org")+fld("PIN panel (4 angka)",'<input class="inp" name="pin" inputmode="numeric" maxlength="4" value="'+esc(db.pin)+'">',"pin")+'<button class="btn go" type="submit">Simpan</button></form></div>'+
 '<div class="panel narrow"><h2>Data demo</h2><p class="note">Semua data tersimpan di peramban ini (localStorage). Reset mengembalikan event, pesanan, dan promo contoh dengan tanggal yang disesuaikan ke hari ini.</p><button class="btn alt dng" type="button" id="resetbtn" data-act="reset">Reset data demo</button></div>';
}
FORMS.setsave=function(f){
 var E=f.elements,org=E.org.value.trim(),pin=E.pin.value.trim();sErr("org","");sErr("pin","");
 if(org.length<3){sErr("org","Isi nama, minimal 3 huruf.");return}
 if(!/^\d{4}$/.test(pin)){sErr("pin","PIN harus 4 angka.");return}
 db.org=org;db.pin=pin;save();admSettings();$("a-org").textContent=org;toast("Pengaturan disimpan.");
};
ACT.reset=function(b){
 twice(b,"Reset data demo","Tekan lagi untuk reset",function(){
  try{localStorage.removeItem(KEY)}catch(e){}
  db=seed();save();ciRes=null;uiA.ciev="";ui.co=null;toast("Data demo dikembalikan.");route(true);
 });
};
