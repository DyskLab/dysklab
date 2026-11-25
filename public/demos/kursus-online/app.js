"use strict";
/* Kelas Nusa: demo platform kursus online. Data di localStorage, semua nama dan angka fiktif. */
var KEY="kursus-online.v1",SESS="kursus-online.sess",ADM="kursus-online.admin";
var CATS=["Pemrograman Web","Desain","Bahasa Inggris","Akuntansi"],LVLS=["Pemula","Menengah","Lanjut"];
var IMGS={
 kelas:{f:"img/kelas.jpg",alt:"Papan tulis putih beroda di ruang kelas"},
 laptop:{f:"img/laptop.jpg",alt:"Laptop, tumpukan buku, dan ponsel di atas meja kayu dilihat dari atas"},
 buku:{f:"img/buku.jpg",alt:"Deretan buku di rak perpustakaan"},
 buku2:{f:"img/buku2.jpg",alt:"Rak buku di perpustakaan"},
 meja:{f:"img/meja.jpg",alt:"Meja belajar dengan laptop, buku, apel, dan tanaman kecil"},
 meja2:{f:"img/meja2.jpg",alt:"Laptop dan tanaman kecil di meja kerja"}
};
var MON=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pad(n){return n<10?"0"+n:""+n}
function rp(n){n=Math.round(n||0);return(n<0?"-":"")+"Rp"+String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function price(n){return n>0?rp(n):"Gratis"}
function num1(x){return(Math.round(x*10)/10).toFixed(1).replace(".",",")}
function ds(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function fdt(ts){var d=new Date(ts);return d.getDate()+" "+MON[d.getMonth()].slice(0,3)+" "+d.getFullYear()}
function fdtl(ts){var d=new Date(ts);return d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear()}
function dur(m){return m<60?m+" mnt":Math.floor(m/60)+" jam"+(m%60?" "+m%60+" mnt":"")}
function by(a,id){for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function DAY(){return 86400000}
var toastT;function toast(m,bad){var t=$("toast");t.textContent=m;t.className="on"+(bad?" bad":"");clearTimeout(toastT);toastT=setTimeout(function(){t.className=""},3000)}
function hash(s){var h=5381,t="kn1:"+s;for(var i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))>>>0;return h.toString(36)}

/* ===== data ===== */
var db;
function load(){try{var r=localStorage.getItem(KEY);if(r){var d=JSON.parse(r);if(d&&d.v===1&&d.courses){db=d;return d}}}catch(e){}db=seed();save();return db}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){toast("Data tidak bisa disimpan di peramban ini",true)}}
function nid(p){db.seq++;return p+db.seq}
function seed(){
 var now=Date.now(),sv=7771,rnd=function(n){sv=(Math.imul(sv,1664525)+1013904223)>>>0;return(sv>>>8)%n};
 var d={v:1,seq:100,pin:"2024",
  ins:[
   {id:"i1",name:"Raka Pratama",role:"Pengembang web",bio:"Menulis kode untuk situs usaha kecil dan mengajar dasar web sejak 2018.",color:"#3b3fd8"},
   {id:"i2",name:"Sinta Maharani",role:"Desainer produk",bio:"Merancang antarmuka aplikasi dan membimbing pemula menyusun portofolio.",color:"#c2410c"},
   {id:"i3",name:"Anita Wulandari",role:"Pengajar bahasa",bio:"Mengajar bahasa Inggris untuk dunia kerja dan percakapan sehari-hari.",color:"#0f766e"},
   {id:"i4",name:"Hendra Kusuma",role:"Akuntan",bio:"Mendampingi pemilik usaha kecil merapikan pembukuan bulanan.",color:"#7c3aed"}],
  courses:SEED_COURSES(),users:[],enr:[],orders:[],reviews:[],qa:[],notes:{},
  coupons:[
   {code:"HEMAT10",type:"pct",value:10,min:100000,max:0,exp:"",active:true,used:0,desc:"Diskon 10% untuk kursus berbayar"},
   {code:"BELAJAR50K",type:"nom",value:50000,min:250000,max:50,exp:"",active:true,used:0,desc:"Potongan Rp50.000 untuk belanja mulai Rp250.000"},
   {code:"LAMA20",type:"pct",value:20,min:0,max:0,exp:ds(new Date(now-5*DAY())),active:true,used:0,desc:"Kupon contoh yang sudah kedaluwarsa"}]};
 var n=0;d.courses.forEach(function(c,ci){
  c.at=now-c.ago*DAY();delete c.ago;c.active=true;
  c.modules.forEach(function(m,mi){m.id="m"+(ci+1)+"_"+(mi+1);m.lessons.forEach(function(l,li){l.id="l"+(ci+1)+"_"+(mi+1)+"_"+(li+1)});if(m.quiz)m.quiz.qs.forEach(function(q,qi){q.id="q"+(ci+1)+"_"+(mi+1)+"_"+(qi+1)})})});
 var nm=["Dewi Contoh","Raka Fiktif","Salsa Sample","Tono Demo","Mira Contoh","Ilham Fiktif","Putri Sample","Yoga Contoh","Nisa Demo","Bayu Fiktif","Citra Contoh","Fajar Sample"];
 var em=["demo","raka","salsa","tono","mira","ilham","putri","yoga","nisa","bayu","citra","fajar"];
 nm.forEach(function(x,i){d.users.push({id:"u"+(i+1),name:x,email:em[i]+"@contoh.id",pw:hash("demo123"),at:now-(60-i*4)*DAY()})});
 function enroll(uid,cid,ago,frac,coupon,method){
  var c=by(d.courses,cid),e={id:"e"+(++n),uid:uid,cid:cid,at:now-ago*DAY()-rnd(40000000),done:{},quiz:{},cert:null};
  var tot=0;c.modules.forEach(function(m){tot+=m.lessons.length});var target=Math.round(tot*frac),k=0;
  c.modules.forEach(function(m){var all=true;m.lessons.forEach(function(l){if(k<target){e.done[l.id]=e.at+(k+1)*3600000;k++}else all=false});
   if(m.quiz&&all&&frac>0){var n=m.quiz.qs.length,rr=[n-1,n,n,n,Math.max(1,n-1)][rnd(5)],sc=Math.round(rr*100/n),p=sc>=m.quiz.pass;e.quiz[m.id]={best:Math.max(sc,p?sc:0),last:sc,attempts:p?1:2,passed:p}}});
  d.enr.push(e);
  var pr=c.price,disc=0;if(coupon){var cp=by2(d.coupons,coupon);disc=cp.type==="pct"?Math.round(pr*cp.value/100):cp.value;cp.used++}
  var u=by(d.users,uid);
  d.orders.push({id:"INV-"+(2600+d.orders.length),uid:uid,uname:u.name,cid:cid,ctitle:c.title,price:pr,disc:disc,total:Math.max(0,pr-disc),coupon:coupon||"",method:pr?method||"Transfer bank":"Gratis",at:e.at,status:"lunas"});
  return e}
 function by2(a,code){for(var i=0;i<a.length;i++)if(a[i].code===code)return a[i]}
 enroll("u1","c1",14,0.65,"","E-wallet");enroll("u1","c5",30,1,"","");enroll("u1","c7",6,0.25,"HEMAT10","Transfer bank");
 var cids=["c1","c2","c3","c4","c5","c6","c7","c8"];
 for(var u=2;u<=12;u++){var cnt=1+rnd(3),used={};
  for(var j=0;j<cnt;j++){var cid=cids[rnd(8)];if(used[cid])continue;used[cid]=1;var c=by(d.courses,cid),ago=1+rnd(28),fr=[0,0.25,0.5,0.75,1][rnd(5)];
   var cp="";if(c.price>=250000&&rnd(3)===0)cp="BELAJAR50K";else if(c.price>=100000&&rnd(3)===0)cp="HEMAT10";
   enroll("u"+u,cid,ago,fr,cp,["Transfer bank","E-wallet","Kartu"][rnd(3)])}}
 var u1c5=d.enr[1];var c5=by(d.courses,"c5");c5.modules.forEach(function(m){m.lessons.forEach(function(l){u1c5.done[l.id]=u1c5.at+1000});u1c5.quiz[m.id]={best:100,last:100,attempts:1,passed:true}});
 u1c5.cert={id:"KN-C5-U1-4821",at:u1c5.at+3*DAY()};
 var T=["Materinya runtut dan mudah diikuti.","Contoh dan latihannya membantu.","Cocok untuk pemula, penjelasannya tidak bertele-tele.","Kuis di akhir modul membuat saya mengulang bagian yang lemah.","Durasi pelajaran pas untuk belajar sebelum berangkat kerja.","Ada bagian yang menurut saya terlalu singkat, tetapi secara umum bagus."];
 var R=[5,5,4,5,4,3,5,4];
 d.courses.forEach(function(c,ci){var k=3+(ci%3);for(var i=0;i<k;i++){var u=d.users[(ci*3+i+1)%12];d.reviews.push({id:"r"+(d.reviews.length+1),cid:c.id,uid:u.id,name:u.name,rating:R[(ci+i*3)%8],text:T[(ci+i)%6],at:now-(2+ci*3+i*5)*DAY()})}});
 d.qa=[
  {id:"qa1",cid:"c1",uid:"u2",name:"Raka Fiktif",text:"Apa bedanya margin dan padding saat elemen bersebelahan?",at:now-6*DAY(),ans:{by:"Raka Pratama",text:"Padding ada di dalam kotak, margin di luar. Margin antara dua elemen bersebelahan bisa menyatu, jadi jarak yang dipakai adalah yang lebih besar.",at:now-5*DAY()}},
  {id:"qa2",cid:"c5",uid:"u3",name:"Salsa Sample",text:"Apakah ada latihan pengucapan?",at:now-4*DAY(),ans:{by:"Anita Wulandari",text:"Belum di kursus ini. Ulangi kalimat contoh dengan suara keras dan rekam dirimu sendiri untuk dibandingkan.",at:now-3*DAY()}},
  {id:"qa3",cid:"c7",uid:"u5",name:"Mira Contoh",text:"Apakah buku kas harian cukup untuk usaha kecil?",at:now-2*DAY(),ans:null},
  {id:"qa4",cid:"c2",uid:"u4",name:"Tono Demo",text:"Kapan sebaiknya memakai let dan kapan const?",at:now-1*DAY(),ans:null}];
 return d}

/* ===== sesi dan hitungan ===== */
function me(){var id=null;try{id=localStorage.getItem(SESS)}catch(e){}return id?by(db.users,id):null}
function isAdmin(){try{return localStorage.getItem(ADM)==="1"}catch(e){return false}}
function enr(uid,cid){for(var i=0;i<db.enr.length;i++)if(db.enr[i].uid===uid&&db.enr[i].cid===cid)return db.enr[i];return null}
function lessonsOf(c){var a=[];c.modules.forEach(function(m){m.lessons.forEach(function(l){a.push(l)})});return a}
function quizzesOf(c){return c.modules.filter(function(m){return m.quiz&&m.quiz.qs.length})}
function mins(c){var t=0;lessonsOf(c).forEach(function(l){t+=+l.mins||0});return t}
function prog(e,c){var L=lessonsOf(c),Q=quizzesOf(c),n=0,q=0;L.forEach(function(l){if(e.done[l.id])n++});Q.forEach(function(m){if(e.quiz[m.id]&&e.quiz[m.id].passed)q++});var t=L.length+Q.length;return{l:n,lt:L.length,q:q,qt:Q.length,pct:t?Math.round((n+q)*100/t):0}}
function rating(cid){var a=db.reviews.filter(function(r){return r.cid===cid}),s=0;a.forEach(function(r){s+=r.rating});return{n:a.length,avg:a.length?s/a.length:0}}
function students(c){var n=0;db.enr.forEach(function(e){if(e.cid===c.id)n++});return(c.base||0)+n}
function activeCourses(){return db.courses.filter(function(c){return c.active})}
function firstLesson(c,e){var L=lessonsOf(c);for(var i=0;i<L.length;i++)if(!e||!e.done[L[i].id])return L[i];return L[0]}
function modOfLesson(c,lid){for(var i=0;i<c.modules.length;i++)for(var j=0;j<c.modules[i].lessons.length;j++)if(c.modules[i].lessons[j].id===lid)return c.modules[i];return null}
function stars(r){return'<span class="stars" role="img" aria-label="Rating '+num1(r)+' dari 5" style="--p:'+Math.round(r*20)+'%">★★★★★</span>'}
function img(k,cls){var i=IMGS[k]||IMGS.kelas;return'<img'+(cls?' class="'+cls+'"':"")+' src="'+i.f+'" alt="'+esc(i.alt)+'" loading="lazy" width="800" height="533">'}
function ico(n){var p={code:"M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",pen:"M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3",chat:"M4 5h16v11H9l-5 4V5z",calc:"M6 3h12v18H6zM9 7h6M9 12h2M13 12h2M9 16h2M13 16h2",check:"M5 12l5 5 9-10",lock:"M6 11h12v9H6zM8 11V8a4 4 0 018 0v3",play:"M7 5l12 7-12 7z",print:"M7 9V3h10v6M6 17H4v-6h16v6h-2M7 14h10v7H7z",down:"M12 4v12M7 11l5 5 5-5M5 20h14"};
 return'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(p[n]||"")+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
function catIco(c){return ico({"Pemrograman Web":"code","Desain":"pen","Bahasa Inggris":"chat","Akuntansi":"calc"}[c])}
function initials(n){return String(n||"?").split(/\s+/).slice(0,2).map(function(w){return w.charAt(0)}).join("").toUpperCase()}
function csvDown(name,rows){var t=rows.map(function(r){return r.map(function(v){v=String(v==null?"":v);if(/^[=+\-@]/.test(v))v="'"+v;return'"'+v.replace(/"/g,'""')+'"'}).join(",")}).join("\r\n");
 var b=new Blob(["﻿"+t],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);toast("CSV diunduh: "+name)}

/* ===== routing ===== */
var R={p:[],q:{}};
function parse(){var h=location.hash.replace(/^#/,"")||"/",q={},i=h.indexOf("?");if(i>=0){h.slice(i+1).split("&").forEach(function(kv){var a=kv.split("=");if(a[0])q[decodeURIComponent(a[0])]=decodeURIComponent(a[1]||"")});h=h.slice(0,i)}R={p:h.split("/").filter(Boolean),q:q}}
function go(p){if(location.hash==="#"+p)render();else location.hash=p}
var F={q:"",cat:"",lvl:"",harga:"",urut:"populer"},CK=null,QR=null,INV=null;
function render(){
 parse();var p=R.p,adm=p[0]==="admin",v;
 document.body.className=adm?"is-admin":"";
 $("hd").innerHTML=adm?"":header();$("ft").innerHTML=adm?"":footer();
 var y=window.scrollY;
 if(adm)v=adminView();else v=publicView();
 $("app").innerHTML=v;
 document.title=(TITLE?TITLE+" | ":"")+"Kelas Nusa";TITLE="";
 if(R.p.join("/")!==LASTR){window.scrollTo(0,0);LASTR=R.p.join("/")}else window.scrollTo(0,y);
 if(typeof afterRender==="function")afterRender();
}
var TITLE="",LASTR="";
function publicView(){var p=R.p;
 if(!p.length)return vHome();
 switch(p[0]){
  case"katalog":TITLE="Katalog";return vCatalog();
  case"kursus":return vCourse(p[1]);
  case"masuk":TITLE="Masuk";return vAuth("masuk");
  case"daftar":TITLE="Daftar";return vAuth("daftar");
  case"checkout":return vCheckout(p[1]);
  case"saya":TITLE="Kursus saya";return vMine();
  case"belajar":return vLearn(p[1],p[2]);
  case"kuis":return vQuiz(p[1],p[2]);
  case"sertifikat":return vCert(p[1]);
 }
 return nf()}
function nf(){return'<div class="wrap pg"><div class="empty"><h1>Halaman tidak ditemukan</h1><p>Alamat yang kamu buka tidak ada.</p><a class="btn" href="#/katalog">Lihat katalog</a></div></div>'}
function header(){var u=me(),p=R.p[0]||"";
 function a(h,t,k){return'<a href="#/'+h+'"'+(p===k?' aria-current="page"':"")+">"+t+"</a>"}
 return'<div class="wrap"><div class="cap"><a class="logo" href="#/"><span class="lm">K</span><span>Kelas Nusa</span></a><nav aria-label="Menu utama">'+a("katalog","Katalog","katalog")+a("saya","Kursus saya","saya")+
 (u?'<span class="who">Halo, '+esc(u.name.split(" ")[0])+'</span><button class="lnk nx" data-act="logout">Keluar</button>':a("masuk","Masuk","masuk")+'<a class="btn sm nx" href="#/daftar">Daftar</a>')+'</nav></div></div>'}
function footer(){return'<div class="wrap fti"><div><strong>Kelas Nusa</strong><p>Platform kursus contoh untuk demo. Semua kursus, pengajar, dan peserta adalah data fiktif.</p></div><div class="ftl"><a href="#/katalog">Katalog</a><a href="#/admin">Panel pengajar</a><a href="credits.json" target="_blank" rel="noopener">Foto: Wikimedia Commons, lihat kredit</a><button class="lnk" data-act="reset">Reset data demo</button></div></div>'}

/* ===== beranda ===== */
function kc(cat){var i=CATS.indexOf(cat);return"k"+(i<0?0:i%4)}
function pad2(n){return n<10?"0"+n:""+n}
function card(c){var r=rating(c.id),i=by(db.ins,c.ins),im=IMGS[c.img]||IMGS.kelas;
 return'<a class="lc '+kc(c.cat)+'" href="#/kursus/'+c.id+'"><div class="lct"><div><span class="chip">'+esc(c.cat)+'</span><span class="no">'+pad2(c.modules.length)+'<small>modul</small></span></div><span class="pho"><img src="'+im.f+'" alt="'+esc(im.alt)+'" loading="lazy" width="92" height="92"></span></div><div class="lb"><h3>'+esc(c.title)+'</h3><p class="mut">'+esc(i?i.name:"")+'</p><p class="meta">'+esc(c.lvl)+' &middot; '+dur(mins(c))+(r.n?' &middot; '+num1(r.avg)+' dari 5 ('+r.n+' ulasan)':'')+'</p><div class="ft2"><span class="price">'+price(c.price)+'</span></div></div></a>'}
function miniCard(c){var im=IMGS[c.img]||IMGS.kelas;
 return'<a class="mc '+kc(c.cat)+'" href="#/kursus/'+c.id+'"><span class="mt"><span class="mn">'+pad2(c.modules.length)+'</span><span class="pho"><img src="'+im.f+'" alt="'+esc(im.alt)+'" width="76" height="76"></span></span><span><b>'+esc(c.title)+'</b><small>'+esc(c.cat)+' &middot; '+esc(c.lvl)+'</small></span></a>'}
var LVN={"Pemula":"Pemula","Menengah":"Menengah","Lanjut":"Lanjutan"};
function roadmap(ac){return'<ol class="trk">'+CATS.map(function(cat){var cs=ac.filter(function(c){return c.cat===cat});
 return'<li class="tr '+kc(cat)+'"><button class="tl" data-act="gocat" data-v="'+esc(cat)+'">'+esc(cat)+'<span>'+cs.length+' kursus</span></button><ol class="sts">'+LVLS.map(function(l,n){var c=cs.filter(function(x){return x.lvl===l})[0];
  return c?'<li class="st"><span class="dot">'+(n+1)+'</span><span class="lv">'+LVN[l]+'</span><a href="#/kursus/'+c.id+'">'+esc(c.title)+'</a><span class="sm">'+dur(mins(c))+' &middot; '+price(c.price)+'</span></li>'
   :'<li class="st nil"><span class="dot">'+(n+1)+'</span><span class="lv">'+LVN[l]+'</span><p>Belum tersedia</p></li>'}).join("")+'</ol></li>'}).join("")+'</ol>'}
function vHome(){
 var ac=activeCourses(),pop=ac.slice().sort(function(a,b){return students(b)-students(a)}),top=pop.slice(0,4),seen={},hero=[];
 pop.forEach(function(c){if(hero.length<3&&!seen[c.cat]){seen[c.cat]=1;hero.push(c)}});
 pop.forEach(function(c){if(hero.length<3&&hero.indexOf(c)<0)hero.push(c)});
 var free=ac.filter(function(c){return c.price<=0})[0],words=["bisa","paham","mahir","siap"];
 var steps=[["Pelajaran","Baca materi singkat, catat, lalu tandai selesai."],["Kuis","Tiap modul ditutup kuis dengan batas lulus."],["Sertifikat","Selesaikan semuanya, lalu cetak sertifikatmu."],["Forum","Tanya di halaman kursus, pengajar menjawab di sana."]];
 return'<section class="wrap hero2"><div><p class="kick">Kursus online &middot; materi teks &middot; kuis</p><h1 class="mega"><span class="ln">Belajar</span><span class="ln">sampai</span><span class="hi"><span class="rot" id="rot">'+words.map(function(w,i){return'<span class="rw'+(i?"":" on")+'"'+(i?' aria-hidden="true"':"")+'>'+w+'</span>'}).join("")+'</span></span></h1><p class="sub">Kursus singkat dengan kuis tiap modul dan sertifikat yang bisa dicetak.</p><div class="acts"><a class="btn ink lg" href="#/katalog">Lihat katalog</a><a class="btn ghost lg" href="#/daftar">Buat akun gratis</a></div></div>'+
 '<div class="stk" aria-label="Kursus pilihan">'+hero.map(miniCard).join("")+'</div></section>'+
 '<div class="wrap"><form class="band" data-hs novalidate><label for="hq">Cari kursus</label><div class="bin"><input id="hq" type="search" placeholder="Judul, topik, atau pengajar" autocomplete="off"><button class="btn lime">Cari</button></div><div class="chips"><span>Bidang:</span>'+CATS.map(function(c){return'<button type="button" class="ch '+kc(c)+'" data-act="gocat" data-v="'+esc(c)+'">'+esc(c)+'</button>'}).join("")+(free?'<button type="button" class="ch fr" data-act="gofree">Gratis</button>':"")+'</div></form></div>'+
 '<section class="wrap sec"><h2 class="big">Pilih bidangmu</h2><div class="bento">'+CATS.map(function(cat,i){var cs=ac.filter(function(x){return x.cat===cat});return'<button class="bk '+kc(cat)+'" data-act="gocat" data-v="'+esc(cat)+'"><span class="gh" aria-hidden="true">'+pad2(i+1)+'</span><b>'+esc(cat)+'</b><span><span class="lst">'+cs.map(function(x){return esc(x.title)}).join(" / ")+'</span><span class="go">'+cs.length+' kursus, lihat &rarr;</span></span></button>'}).join("")+'</div></section>'+
 '<section class="wrap sec"><div class="sh"><h2 class="big">Kursus pilihan</h2><a href="#/katalog">Semua kursus</a></div><div class="grid">'+top.map(card).join("")+'</div></section>'+
 '<section class="wrap sec"><h2 class="big">Peta jalur belajar</h2><p class="lede">Mulai dari tingkat pemula, lalu naik ke menengah dan lanjutan di bidang yang sama.</p>'+roadmap(ac)+'</section>'+
 '<section class="wrap sec"><h2 class="big">Bagaimana belajar di sini</h2><ol class="stp">'+steps.map(function(s,i){return'<li class="k'+i+'"><span class="n" aria-hidden="true">'+(i+1)+'</span><h3>'+s[0]+'</h3><p>'+s[1]+'</p></li>'}).join("")+'</ol></section>'+
 '<section class="wrap sec"><h2 class="big">Pengajar</h2><div class="ins2">'+db.ins.map(function(i,n){var cs=ac.filter(function(c){return c.ins===i.id});return'<div class="pc k'+(n%4)+'"><span class="pav" aria-hidden="true">'+esc(initials(i.name))+'</span><div class="pb"><h3>'+esc(i.name)+'</h3><p class="mut">'+esc(i.role)+'</p><p>'+esc(i.bio)+'</p>'+(cs.length?'<p class="tg">'+cs.map(function(c){return'<a href="#/kursus/'+c.id+'">'+esc(c.title)+'</a>'}).join("")+'</p>':"")+'</div></div>'}).join("")+'</div></section>'+
 '<section class="wrap sec"><div class="cta"><span class="s1"></span><span class="s2"></span><span class="s3"></span><h2>Mulai dari yang <span class="hi">gratis</span></h2><p>'+(free?'Coba '+esc(free.title)+'. Daftar, belajar, dan dapatkan sertifikat tanpa biaya.':'Lihat semua kursus dan pilih yang cocok untukmu.')+'</p><div class="acts"><a class="btn lime lg" href="#/'+(free?"kursus/"+free.id:"katalog")+'">'+(free?"Coba kursus gratis":"Lihat katalog")+'</a><a class="btn ghost lg" href="#/katalog">Semua kursus</a></div></div></section>'}
var ROT=null;
function afterRender(){if(ROT){clearInterval(ROT);ROT=null}var r=$("rot");if(!r||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches))return;
 var w=r.children,i=0;ROT=setInterval(function(){if(!r.isConnected){clearInterval(ROT);ROT=null;return}var o=w[i];i=(i+1)%w.length;o.className="rw out";o.setAttribute("aria-hidden","true");w[i].className="rw on";w[i].removeAttribute("aria-hidden");setTimeout(function(){o.className="rw"},400)},2200)}
document.addEventListener("submit",function(ev){var f=ev.target;if(f&&f.hasAttribute&&f.hasAttribute("data-hs")){ev.preventDefault();F={q:$("hq").value,cat:"",lvl:"",harga:"",urut:"populer"};go("/katalog")}});

/* ===== katalog ===== */
function filtered(){var q=F.q.trim().toLowerCase(),a=activeCourses().filter(function(c){
 if(F.cat&&c.cat!==F.cat)return false;if(F.lvl&&c.lvl!==F.lvl)return false;
 if(F.harga==="gratis"&&c.price>0)return false;if(F.harga==="murah"&&!(c.price>0&&c.price<200000))return false;if(F.harga==="mahal"&&c.price<200000)return false;
 if(q){var i=by(db.ins,c.ins);if((c.title+" "+c.desc+" "+c.cat+" "+(i?i.name:"")).toLowerCase().indexOf(q)<0)return false}return true});
 var s=F.urut;a.sort(function(x,y){if(s==="rating")return rating(y.id).avg-rating(x.id).avg;if(s==="murah")return x.price-y.price;if(s==="mahal")return y.price-x.price;if(s==="baru")return y.at-x.at;return students(y)-students(x)});return a}
function resHtml(){var a=filtered();
 if(!a.length)return'<div class="empty"><h3>Tidak ada kursus yang cocok</h3><p>Ubah kata kunci atau longgarkan filter.</p><button class="btn" data-act="fclear">Atur ulang filter</button></div>';
 return'<div class="grid g3">'+a.map(card).join("")+'</div>'}
function opt(v,t,sel){return'<option value="'+esc(v)+'"'+(sel===v?" selected":"")+">"+esc(t)+"</option>"}
function vCatalog(){
 if(R.q.cat&&CATS.indexOf(R.q.cat)>=0){F.cat=R.q.cat}
 return'<div class="wrap pg"><h1>Katalog kursus</h1><div class="cat-lay"><form class="card filt" onsubmit="return false"><label>Cari<input type="search" id="f-q" data-f="q" value="'+esc(F.q)+'" placeholder="Judul, topik, atau pengajar"></label>'+
 '<label>Bidang<select data-f="cat">'+opt("","Semua bidang",F.cat)+CATS.map(function(c){return opt(c,c,F.cat)}).join("")+'</select></label>'+
 '<label>Tingkat<select data-f="lvl">'+opt("","Semua tingkat",F.lvl)+LVLS.map(function(c){return opt(c,c,F.lvl)}).join("")+'</select></label>'+
 '<label>Harga<select data-f="harga">'+opt("","Semua harga",F.harga)+opt("gratis","Gratis",F.harga)+opt("murah","Di bawah Rp200.000",F.harga)+opt("mahal","Rp200.000 ke atas",F.harga)+'</select></label>'+
 '<label>Urutkan<select data-f="urut">'+opt("populer","Paling populer",F.urut)+opt("rating","Rating tertinggi",F.urut)+opt("baru","Terbaru",F.urut)+opt("murah","Harga terendah",F.urut)+opt("mahal","Harga tertinggi",F.urut)+'</select></label>'+
 '<button type="button" class="btn ghost" data-act="fclear">Atur ulang</button></form><div><p class="cnt" id="cnt" aria-live="polite">'+filtered().length+' kursus</p><div id="res">'+resHtml()+'</div></div></div></div>'}
function refreshCat(){var r=$("res");if(!r)return;r.innerHTML=resHtml();$("cnt").textContent=filtered().length+" kursus"}

/* ===== halaman kursus ===== */
function vCourse(id){var c=by(db.courses,id),u=me();
 if(!c||(!c.active&&!isAdmin()))return nf();TITLE=c.title;
 var i=by(db.ins,c.ins),r=rating(c.id),e=u?enr(u.id,c.id):null,pr=e?prog(e,c):null,nl=lessonsOf(c).length,nq=quizzesOf(c).length;
 var buy=e?'<p class="mut">Progres kamu: <b>'+pr.pct+'%</b></p><div class="bar"><i style="width:'+pr.pct+'%"></i></div><a class="btn lg block" href="#/belajar/'+c.id+'">'+(pr.pct?"Lanjutkan belajar":"Mulai belajar")+'</a>'+(pr.pct===100?'<a class="btn ghost block" href="#/sertifikat/'+c.id+'">Lihat sertifikat</a>':"")
  :'<a class="btn lg block" href="#/checkout/'+c.id+'">'+(c.price>0?"Beli kursus":"Daftar gratis")+'</a>';
 var cur=c.modules.map(function(m,mi){return'<details class="mod"'+(mi===0?" open":"")+'><summary><b>Modul '+(mi+1)+': '+esc(m.title)+'</b><span class="mut">'+m.lessons.length+' pelajaran</span></summary><ul>'+m.lessons.map(function(l){return'<li>'+(e&&e.done[l.id]?ico("check"):ico("play"))+'<span>'+esc(l.title)+'</span><em>'+l.mins+' mnt</em></li>'}).join("")+(m.quiz&&m.quiz.qs.length?'<li class="qz">'+ico("pen")+'<span>Kuis modul ('+m.quiz.qs.length+' soal, lulus '+m.quiz.pass+'%)</span></li>':"")+'</ul></details>'}).join("");
 var rv=db.reviews.filter(function(x){return x.cid===c.id}).sort(function(a,b){return b.at-a.at});
 var mine=u?rv.filter(function(x){return x.uid===u.id})[0]:null;
 var rform=e&&!mine?'<form class="card rf" data-form="review" data-id="'+c.id+'" novalidate><h3>Tulis ulasan</h3><label>Rating<select name="rating"><option value="">Pilih rating</option><option value="5">5 (sangat bagus)</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option></select></label><label>Ulasan<textarea name="text" rows="3" maxlength="400" placeholder="Ceritakan pengalamanmu belajar"></textarea></label><p class="err" role="alert"></p><button class="btn">Kirim ulasan</button></form>':"";
 var qa=db.qa.filter(function(x){return x.cid===c.id}).sort(function(a,b){return b.at-a.at});
 return'<div class="chead"><div class="wrap chin"><div><span class="chip lt">'+esc(c.cat)+'</span><h1>'+esc(c.title)+'</h1><p class="lead">'+esc(c.desc)+'</p><p class="rt">'+stars(r.avg)+' <b>'+(r.n?num1(r.avg):"Belum ada rating")+'</b> <span>('+r.n+' ulasan)</span> &middot; '+students(c).toLocaleString("id-ID")+' peserta</p><p class="meta2">Pengajar: <b>'+esc(i?i.name:"-")+'</b> &middot; Tingkat: '+esc(c.lvl)+' &middot; '+nl+' pelajaran &middot; '+dur(mins(c))+(c.active?"":" &middot; <b>Draf (tidak tampil di katalog)</b>")+'</p></div>'+
 '<aside class="card buy"><div class="ph">'+img(c.img)+'</div><div class="bb"><p class="price big">'+price(c.price)+'</p>'+buy+'<ul class="inc"><li>'+ico("check")+nl+' pelajaran teks</li><li>'+ico("check")+nq+' kuis modul</li><li>'+ico("check")+'Sertifikat yang bisa dicetak</li><li>'+ico("check")+'Catatan pribadi dan tanya pengajar</li></ul></div></aside></div></div>'+
 '<div class="wrap pg cbody"><section><h2>Kurikulum</h2>'+cur+'</section><section><h2>Pengajar</h2><div class="card ic"><span class="av" style="background:'+esc(i?i.color:"#666")+'">'+esc(initials(i?i.name:"?"))+'</span><div><h3>'+esc(i?i.name:"-")+'</h3><p class="mut">'+esc(i?i.role:"")+'</p><p>'+esc(i?i.bio:"")+'</p></div></div></section>'+
 '<section><h2>Ulasan peserta</h2><p class="mut small">Ulasan di bawah adalah data contoh.</p>'+rform+(rv.length?'<ul class="rv">'+rv.map(function(x){return'<li><div class="rvh"><b>'+esc(x.name)+'</b>'+stars(x.rating)+'<span class="mut">'+fdt(x.at)+'</span></div><p>'+esc(x.text)+'</p></li>'}).join("")+'</ul>':'<p class="empty-s">Belum ada ulasan.</p>')+'</section>'+
 '<section><h2>Tanya pengajar</h2>'+forumBlock(c,e)+'</section></div>'}
function forumBlock(c,e){var u=me(),qa=db.qa.filter(function(x){return x.cid===c.id}).sort(function(a,b){return b.at-a.at});
 var f=e?'<form class="card rf" data-form="ask" data-id="'+c.id+'" novalidate><label>Pertanyaanmu<textarea name="text" rows="3" maxlength="400" placeholder="Tulis pertanyaan tentang materi kursus ini"></textarea></label><p class="err" role="alert"></p><button class="btn">Kirim pertanyaan</button></form>':'<p class="mut small">'+(u?"Daftar kursus ini untuk bertanya kepada pengajar.":"Masuk dan daftar kursus ini untuk bertanya kepada pengajar.")+'</p>';
 return f+(qa.length?'<ul class="qa">'+qa.map(function(x){return'<li><p><b>'+esc(x.name)+'</b> <span class="mut">'+fdt(x.at)+'</span></p><p>'+esc(x.text)+'</p>'+(x.ans?'<div class="ans"><b>'+esc(x.ans.by)+' (pengajar)</b> <span class="mut">'+fdt(x.ans.at)+'</span><p>'+esc(x.ans.text)+'</p></div>':'<p class="mut small">Menunggu jawaban pengajar.</p>')+'</li>'}).join("")+'</ul>':'<p class="empty-s">Belum ada pertanyaan.</p>')}

/* ===== masuk dan daftar ===== */
function vAuth(mode){var u=me();if(u){return'<div class="wrap pg narrow"><div class="card pad"><h1>Kamu sudah masuk</h1><p>Masuk sebagai '+esc(u.name)+'.</p><a class="btn" href="#/saya">Kursus saya</a></div></div>'}
 var nx=esc(R.q.next||"");
 if(mode==="masuk")return'<div class="wrap pg narrow"><form class="card pad" data-form="login" novalidate><h1>Masuk</h1><p class="hint">Akun demo: <b>demo@contoh.id</b> dengan kata sandi <b>demo123</b>.</p><label>Email<input name="email" type="email" autocomplete="email" inputmode="email"></label><label>Kata sandi<input name="pw" type="password" autocomplete="current-password"></label><input type="hidden" name="next" value="'+nx+'"><p class="err" role="alert"></p><button class="btn lg block">Masuk</button><p class="mut small">Belum punya akun? <a href="#/daftar'+(nx?"?next="+encodeURIComponent(R.q.next):"")+'">Daftar</a></p></form></div>';
 return'<div class="wrap pg narrow"><form class="card pad" data-form="signup" novalidate><h1>Buat akun</h1><label>Nama lengkap<input name="name" autocomplete="name" maxlength="60"></label><label>Email<input name="email" type="email" autocomplete="email" inputmode="email"></label><label>Kata sandi (minimal 6 karakter)<input name="pw" type="password" autocomplete="new-password"></label><label>Ulangi kata sandi<input name="pw2" type="password" autocomplete="new-password"></label><input type="hidden" name="next" value="'+nx+'"><p class="err" role="alert"></p><button class="btn lg block">Daftar</button><p class="mut small">Sudah punya akun? <a href="#/masuk'+(nx?"?next="+encodeURIComponent(R.q.next):"")+'">Masuk</a></p><p class="mut small">Demo: data akun hanya disimpan di peramban ini.</p></form></div>'}

/* ===== checkout ===== */
function couponCheck(code,c){code=String(code||"").trim().toUpperCase();if(!code)return{err:"Tulis kode kupon dulu."};
 var k=null;db.coupons.forEach(function(x){if(x.code===code)k=x});if(!k||!k.active)return{err:"Kode kupon tidak ditemukan."};
 if(k.exp&&k.exp<ds(new Date()))return{err:"Kupon sudah kedaluwarsa."};
 if(k.max>0&&k.used>=k.max)return{err:"Kuota kupon sudah habis."};
 if(c.price<k.min)return{err:"Kupon berlaku untuk belanja mulai "+rp(k.min)+"."};
 var disc=k.type==="pct"?Math.round(c.price*k.value/100):k.value;return{k:k,disc:Math.min(disc,c.price)}}
function vCheckout(id){var c=by(db.courses,id),u=me();if(!c||!c.active)return nf();TITLE="Checkout";
 if(!u)return'<div class="wrap pg narrow"><div class="card pad"><h1>Masuk dulu</h1><p>Kamu perlu akun untuk mendaftar kursus ini.</p><a class="btn" href="#/masuk?next='+encodeURIComponent("/checkout/"+id)+'">Masuk</a> <a class="btn ghost" href="#/daftar?next='+encodeURIComponent("/checkout/"+id)+'">Daftar</a></div></div>';
 if(enr(u.id,id))return'<div class="wrap pg narrow"><div class="card pad"><h1>Kamu sudah terdaftar</h1><p>Kursus ini sudah ada di akunmu.</p><a class="btn" href="#/belajar/'+id+'">Mulai belajar</a></div></div>';
 var cc=CK&&CK.cid===id?couponCheck(CK.code,c):null,disc=cc&&cc.k?cc.disc:0,total=c.price-disc,free=total<=0;
 return'<div class="wrap pg"><h1>Checkout</h1><div class="co-lay"><div><form class="card pad" data-form="pay" data-id="'+id+'" novalidate><h2>Pembayaran</h2>'+
 (c.price>0?'<fieldset><legend>Metode pembayaran (simulasi)</legend><label class="rad"><input type="radio" name="method" value="Transfer bank" checked> Transfer bank (virtual account)</label><label class="rad"><input type="radio" name="method" value="E-wallet"> E-wallet</label><label class="rad"><input type="radio" name="method" value="Kartu"> Kartu debit atau kredit</label></fieldset><p class="note">Ini simulasi. Tidak ada uang yang diproses dan tidak ada data pembayaran yang diminta.</p>':'<p>Kursus ini gratis. Tidak perlu metode pembayaran.</p>')+
 '<p class="err" role="alert"></p><button class="btn lg block">'+(free?"Daftar sekarang":"Bayar "+rp(total)+" (simulasi)")+'</button></form></div>'+
 '<aside class="card pad sum"><h2>Ringkasan</h2><div class="sumc"><div class="ph">'+img(c.img)+'</div><div><b>'+esc(c.title)+'</b><p class="mut">'+esc(c.cat)+' &middot; '+esc(c.lvl)+'</p></div></div>'+
 '<form class="cpn" data-form="coupon" data-id="'+id+'" novalidate><label>Kode kupon<span class="row"><input name="code" value="'+esc(CK&&CK.cid===id?CK.code:"")+'" placeholder="Contoh: HEMAT10" autocapitalize="characters"><button class="btn ghost">Pakai</button></span></label><p class="'+(cc&&cc.err?"err":"okmsg")+'" role="status">'+(cc?(cc.err?esc(cc.err):"Kupon "+esc(cc.k.code)+" dipakai: hemat "+rp(cc.disc)+"."):"")+'</p></form>'+
 '<dl class="tot"><div><dt>Harga</dt><dd>'+price(c.price)+'</dd></div>'+(disc?'<div><dt>Diskon</dt><dd>-'+rp(disc)+'</dd></div>':"")+'<div class="gt"><dt>Total</dt><dd>'+price(total)+'</dd></div></dl></aside></div></div>'}

/* ===== kursus saya ===== */
function vMine(){var u=me();
 if(!u)return'<div class="wrap pg narrow"><div class="card pad"><h1>Masuk untuk melihat kursusmu</h1><a class="btn" href="#/masuk?next=/saya">Masuk</a> <a class="btn ghost" href="#/daftar?next=/saya">Daftar</a></div></div>';
 var es=db.enr.filter(function(e){return e.uid===u.id&&by(db.courses,e.cid)}).sort(function(a,b){return b.at-a.at}),os=db.orders.filter(function(o){return o.uid===u.id}).sort(function(a,b){return b.at-a.at});
 var done=0;es.forEach(function(e){if(prog(e,by(db.courses,e.cid)).pct===100)done++});
 return'<div class="wrap pg"><h1>Kursus saya</h1><p class="mut">'+esc(u.name)+' &middot; '+esc(u.email)+'</p>'+
 (es.length?'<p class="cnt">'+es.length+' kursus &middot; '+done+' selesai</p><div class="grid g3">'+es.map(function(e){var c=by(db.courses,e.cid),p=prog(e,c);
  return'<div class="card cc"><a class="ph" href="#/kursus/'+c.id+'" tabindex="-1" aria-hidden="true">'+img(c.img)+'</a><div class="cb"><span class="chip">'+esc(c.cat)+'</span><h3><a href="#/kursus/'+c.id+'">'+esc(c.title)+'</a></h3><div class="bar"><i style="width:'+p.pct+'%"></i></div><p class="meta">'+p.pct+'% &middot; '+p.l+'/'+p.lt+' pelajaran &middot; '+p.q+'/'+p.qt+' kuis</p><div class="acts"><a class="btn sm" href="#/belajar/'+c.id+'">'+(p.pct?(p.pct===100?"Tinjau":"Lanjutkan"):"Mulai")+'</a>'+(p.pct===100?'<a class="btn sm ghost" href="#/sertifikat/'+c.id+'">Sertifikat</a>':"")+'</div></div></div>'}).join("")+'</div>'
  :'<div class="empty"><h3>Belum ada kursus</h3><p>Pilih kursus pertamamu di katalog.</p><a class="btn" href="#/katalog">Lihat katalog</a></div>')+
 (os.length?'<h2>Riwayat pesanan</h2><div class="tw st"><table><thead><tr><th>No.</th><th>Tanggal</th><th>Kursus</th><th>Metode</th><th class="r">Total</th></tr></thead><tbody>'+os.map(function(o){return'<tr><td data-l="No.">'+esc(o.id)+'</td><td data-l="Tanggal">'+fdt(o.at)+'</td><td data-l="Kursus">'+esc(o.ctitle)+(o.status!=="lunas"?' <em class="mut">('+esc(o.status)+')</em>':"")+'</td><td data-l="Metode">'+esc(o.method)+'</td><td class="r" data-l="Total">'+price(o.total)+'</td></tr>'}).join("")+'</tbody></table></div>':"")+'</div>'}

/* ===== pemutar pelajaran ===== */
function sideNav(c,e,curL,curQ){return'<nav class="side card" aria-label="Daftar pelajaran">'+c.modules.map(function(m,mi){var all=m.lessons.every(function(l){return e.done[l.id]});
 return'<div class="sm-mod"><b>Modul '+(mi+1)+': '+esc(m.title)+'</b><ul>'+m.lessons.map(function(l){return'<li><a href="#/belajar/'+c.id+'/'+l.id+'"'+(curL===l.id?' aria-current="page"':"")+'>'+(e.done[l.id]?ico("check"):ico("play"))+'<span>'+esc(l.title)+'</span></a></li>'}).join("")+
 (m.quiz&&m.quiz.qs.length?'<li><a href="#/kuis/'+c.id+'/'+m.id+'"'+(curQ===m.id?' aria-current="page"':"")+'>'+(e.quiz[m.id]&&e.quiz[m.id].passed?ico("check"):(all?ico("pen"):ico("lock")))+'<span>Kuis modul'+(e.quiz[m.id]?" ("+e.quiz[m.id].best+"%)":"")+'</span></a></li>':"")+'</ul></div>'}).join("")+'</nav>'}
function guardEnr(cid){var c=by(db.courses,cid),u=me();if(!c)return{h:nf()};
 if(!u)return{h:'<div class="wrap pg narrow"><div class="card pad"><h1>Masuk dulu</h1><p>Masuk untuk membuka pelajaran.</p><a class="btn" href="#/masuk?next='+encodeURIComponent(location.hash.slice(1))+'">Masuk</a></div></div>'};
 var e=enr(u.id,cid);if(!e)return{h:'<div class="wrap pg narrow"><div class="card pad"><h1>Kursus belum diikuti</h1><p>Daftar kursus ini untuk membuka pelajaran.</p><a class="btn" href="#/kursus/'+cid+'">Lihat kursus</a></div></div>'};
 return{c:c,u:u,e:e}}
function vLearn(cid,lid){var g=guardEnr(cid);if(g.h)return g.h;var c=g.c,e=g.e,u=g.u,L=lessonsOf(c);
 if(!L.length)return'<div class="wrap pg narrow"><div class="empty"><h1>Kursus belum punya pelajaran</h1></div></div>';
 var l=lid?by(L,lid):firstLesson(c,e);if(!l)return nf();TITLE=l.title;
 var m=modOfLesson(c,l.id),idx=L.indexOf(l),pv=L[idx-1],nx=L[idx+1],p=prog(e,c),done=!!e.done[l.id],note=db.notes[u.id+"|"+l.id]||"";
 var nextHref=nx?"#/belajar/"+cid+"/"+nx.id:(m.quiz&&m.quiz.qs.length?"#/kuis/"+cid+"/"+m.id:"");
 var after=nx?(modOfLesson(c,nx.id)!==m&&m.quiz&&m.quiz.qs.length?'<a class="btn" href="#/kuis/'+cid+"/"+m.id+'">Kuis modul</a>':'<a class="btn" href="#/belajar/'+cid+"/"+nx.id+'">Pelajaran berikutnya</a>'):(m.quiz&&m.quiz.qs.length?'<a class="btn" href="#/kuis/'+cid+"/"+m.id+'">Kuis modul</a>':(p.pct===100?'<a class="btn" href="#/sertifikat/'+cid+'">Lihat sertifikat</a>':""));
 if(nx&&modOfLesson(c,nx.id)!==m&&m.quiz&&m.quiz.qs.length)after='<a class="btn" href="#/kuis/'+cid+"/"+m.id+'">Kuis modul</a>';
 return'<div class="wrap pg"><div class="lh"><div><p class="mut small"><a href="#/kursus/'+cid+'">'+esc(c.title)+'</a></p></div><div class="lp"><span>'+p.pct+'% selesai</span><div class="bar"><i style="width:'+p.pct+'%"></i></div></div></div>'+
 '<div class="lay">'+sideNav(c,e,l.id)+'<div><article class="card pad lesson"><p class="mut small">'+esc(m.title)+' &middot; Pelajaran '+(idx+1)+' dari '+L.length+' &middot; '+l.mins+' menit</p><h1>'+esc(l.title)+'</h1>'+
 '<div class="mat">'+String(l.body||"").split(/\n\s*\n/).map(function(t){return"<p>"+esc(t)+"</p>"}).join("")+(l.pts&&l.pts.length?'<h2>Poin penting</h2><ul class="pts">'+l.pts.map(function(t){return"<li>"+esc(t)+"</li>"}).join("")+"</ul>":"")+'</div>'+
 '<div class="lact"><button class="btn'+(done?" ghost":"")+'" data-act="toggle" data-l="'+l.id+'" data-c="'+cid+'" aria-pressed="'+done+'">'+(done?"Selesai, batalkan tanda":"Tandai selesai")+'</button>'+(done?after:"")+'</div>'+
 '<div class="pn">'+(pv?'<a class="btn ghost sm" href="#/belajar/'+cid+'/'+pv.id+'">Sebelumnya</a>':"<span></span>")+(nx?'<a class="btn ghost sm" href="#/belajar/'+cid+'/'+nx.id+'">Berikutnya</a>':"")+'</div></article>'+
 '<section class="card pad"><h2>Catatan pribadi</h2><label>Catatan untuk pelajaran ini<textarea id="note" rows="4" maxlength="2000" data-l="'+l.id+'" placeholder="Tulis hal yang ingin kamu ingat">'+esc(note)+'</textarea></label><button class="btn sm" data-act="savenote" data-l="'+l.id+'">Simpan catatan</button> <span class="mut small" id="notest"></span></section>'+
 '<section class="card pad"><h2>Tanya pengajar</h2>'+forumBlock(c,e)+'</section></div></div></div>'}

/* ===== kuis ===== */
function vQuiz(cid,mid){var g=guardEnr(cid);if(g.h)return g.h;var c=g.c,e=g.e,m=by(c.modules,mid);if(!m||!m.quiz||!m.quiz.qs.length)return nf();TITLE="Kuis: "+m.title;
 var allDone=m.lessons.every(function(l){return e.done[l.id]}),st=e.quiz[m.id],mi=c.modules.indexOf(m);
 var head='<div class="wrap pg"><div class="lay">'+sideNav(c,e,null,m.id)+'<div><article class="card pad"><p class="mut small"><a href="#/kursus/'+cid+'">'+esc(c.title)+'</a> &middot; Modul '+(mi+1)+'</p><h1>Kuis: '+esc(m.title)+'</h1>';
 if(!allDone){var rest=m.lessons.filter(function(l){return !e.done[l.id]});return head+'<div class="note lock">'+ico("lock")+'<div><b>Kuis terkunci</b><p>Selesaikan dulu '+rest.length+' pelajaran di modul ini.</p><a class="btn sm" href="#/belajar/'+cid+'/'+rest[0].id+'">Buka '+esc(rest[0].title)+'</a></div></div></article></div></div></div>'}
 var info='<p class="mut">'+m.quiz.qs.length+' soal. Nilai lulus: '+m.quiz.pass+'%.'+(st?" Nilai terbaikmu: "+st.best+"% dari "+st.attempts+" percobaan.":"")+'</p>';
 if(QR&&QR.mid===mid&&QR.cid===cid){var r=QR;
  return head+info+'<div class="note '+(r.passed?"okk":"bad")+'" role="status"><b>'+(r.passed?"Lulus":"Belum lulus")+'</b><p>Skor kamu '+r.score+'% ('+r.right+' dari '+m.quiz.qs.length+' benar).'+(r.passed?"":" Ulangi untuk mencapai "+m.quiz.pass+"%.")+'</p></div><ol class="rev">'+m.quiz.qs.map(function(q,i){var a=r.ans[q.id],ok=a===q.a;return'<li class="'+(ok?"okk":"bad")+'"><p><b>'+esc(q.q)+'</b></p><p>Jawabanmu: '+(a==null?"-":esc(q.o[a]))+(ok?" (benar)":" (salah)")+'</p>'+(ok?"":'<p>Jawaban benar: '+esc(q.o[q.a])+'</p>')+'</li>'}).join("")+'</ol><div class="lact"><button class="btn" data-act="retry">Ulangi kuis</button>'+nextAfterQuiz(c,m,e)+'</div></article></div></div></div>'}
 return head+info+(st&&st.passed?'<p class="note okk">Kamu sudah lulus modul ini. Kamu boleh mengulang untuk memperbaiki skor.</p>':"")+'<form data-form="quiz" data-c="'+cid+'" data-m="'+mid+'" novalidate><ol class="qs">'+m.quiz.qs.map(function(q,i){return'<li><fieldset><legend>'+esc(q.q)+'</legend>'+q.o.map(function(o,k){return'<label class="rad"><input type="radio" name="'+q.id+'" value="'+k+'"> '+esc(o)+'</label>'}).join("")+'</fieldset></li>'}).join("")+'</ol><p class="err" role="alert"></p><button class="btn lg">Kirim jawaban</button></form></article></div></div></div>'}
function nextAfterQuiz(c,m,e){var mi=c.modules.indexOf(m),nm=c.modules[mi+1],p=prog(e,c);
 if(e.quiz[m.id]&&e.quiz[m.id].passed){if(p.pct===100)return'<a class="btn" href="#/sertifikat/'+c.id+'">Lihat sertifikat</a>';if(nm&&nm.lessons.length)return'<a class="btn" href="#/belajar/'+c.id+'/'+nm.lessons[0].id+'">Modul berikutnya</a>';return'<a class="btn" href="#/belajar/'+c.id+'">Kembali ke pelajaran</a>'}return""}

/* ===== sertifikat ===== */
function vCert(cid){var g=guardEnr(cid);if(g.h)return g.h;var c=g.c,e=g.e,u=g.u,p=prog(e,c);TITLE="Sertifikat";
 if(p.pct<100)return'<div class="wrap pg narrow"><div class="card pad"><h1>Sertifikat belum tersedia</h1><p>Selesaikan semua pelajaran dan lulus semua kuis. Progresmu saat ini '+p.pct+'% ('+p.l+'/'+p.lt+' pelajaran, '+p.q+'/'+p.qt+' kuis).</p><a class="btn" href="#/belajar/'+cid+'">Lanjut belajar</a></div></div>';
 if(!e.cert){e.cert={id:"KN-"+c.id.toUpperCase()+"-"+u.id.toUpperCase()+"-"+(1000+(hash(u.id+c.id).length*137+db.enr.indexOf(e)*11)%9000),at:Date.now()};save()}
 var i=by(db.ins,c.ins),sc=[];quizzesOf(c).forEach(function(m){if(e.quiz[m.id])sc.push(e.quiz[m.id].best)});var avg=sc.length?Math.round(sc.reduce(function(a,b){return a+b},0)/sc.length):0;
 return'<div class="wrap pg"><div class="noprint cert-act"><button class="btn" data-act="print">'+ico("print")+' Cetak sertifikat</button><a class="btn ghost" href="#/saya">Kursus saya</a></div><div class="cert" id="cert"><div class="cin"><span class="lm big">K</span><p class="cs">Kelas Nusa</p><h1>Sertifikat Penyelesaian</h1><p>Diberikan kepada</p><p class="cn">'+esc(u.name)+'</p><p>yang telah menyelesaikan seluruh pelajaran dan lulus semua kuis pada kursus</p><p class="cc2">'+esc(c.title)+'</p><p class="mut">Rata-rata nilai kuis '+avg+'% &middot; '+lessonsOf(c).length+' pelajaran &middot; '+dur(mins(c))+'</p><div class="csg"><div><b>'+esc(i?i.name:"-")+'</b><span>Pengajar</span></div><div><b>'+fdtl(e.cert.at)+'</b><span>Tanggal terbit</span></div><div><b>'+esc(e.cert.id)+'</b><span>Nomor sertifikat</span></div></div><p class="small mut">Sertifikat contoh untuk demo. Tidak berlaku sebagai dokumen resmi.</p></div></div></div>'}

/* ===== aksi umum ===== */
function armed(t,label){if(t.dataset.arm==="1")return true;t.dataset.arm="1";var o=t.textContent;t.dataset.o=o;t.textContent=label||"Yakin? Tekan lagi";setTimeout(function(){if(t.isConnected){t.dataset.arm="";t.textContent=t.dataset.o}},3200);return false}
var ACT={
 logout:function(){localStorage.removeItem(SESS);toast("Kamu sudah keluar");go("/")},
 reset:function(t){if(!armed(t,"Yakin? Tekan lagi"))return;localStorage.removeItem(KEY);localStorage.removeItem(SESS);localStorage.removeItem(ADM);CK=null;QR=null;db=null;load();toast("Data demo dikembalikan");go("/")},
 gofree:function(){F={q:"",cat:"",lvl:"",harga:"gratis",urut:"populer"};go("/katalog")},
 gocat:function(t){F.cat=t.dataset.v;go("/katalog")},
 fclear:function(){F={q:"",cat:"",lvl:"",harga:"",urut:"populer"};if(R.p[0]==="katalog"&&R.q.cat){location.hash="#/katalog"}else render()},
 print:function(){window.print()},
 toggle:function(t){var u=me(),e=u&&enr(u.id,t.dataset.c);if(!e)return;var id=t.dataset.l;if(e.done[id]){delete e.done[id];toast("Tanda selesai dibatalkan")}else{e.done[id]=Date.now();toast("Pelajaran selesai")}save();render()},
 savenote:function(t){var u=me();if(!u)return;var v=$("note").value.trim(),k=u.id+"|"+t.dataset.l;if(v)db.notes[k]=v;else delete db.notes[k];save();$("notest").textContent=v?"Catatan tersimpan.":"Catatan dihapus."},
 retry:function(){QR=null;render()}
};
document.addEventListener("click",function(ev){var t=ev.target.closest("[data-act]");if(!t)return;var f=ACT[t.dataset.act];if(f){if(t.type!=="checkbox")ev.preventDefault();f(t,ev)}});
document.addEventListener("input",function(ev){var t=ev.target;if(t.dataset&&t.dataset.f){F[t.dataset.f]=t.value;if(t.dataset.f==="cat"&&R.q.cat){history.replaceState(null,"","#/katalog");parse()}refreshCat()}});
document.addEventListener("change",function(ev){var t=ev.target;if(t.dataset&&t.dataset.f){F[t.dataset.f]=t.value;if(t.dataset.f==="cat"&&R.q.cat){history.replaceState(null,"","#/katalog");parse()}refreshCat()}});
function fail(f,msg,name){var e=f.querySelector(".err");if(e)e.textContent=msg;var el=name&&f.elements[name];if(el&&el.focus)el.focus();return false}
var EM=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var FORMS={
 login:function(f){var em=f.email.value.trim().toLowerCase(),pw=f.pw.value;
  if(!EM.test(em))return fail(f,"Tulis email yang benar.","email");if(!pw)return fail(f,"Tulis kata sandi.","pw");
  var u=db.users.filter(function(x){return x.email===em})[0];if(!u||u.pw!==hash(pw))return fail(f,"Email atau kata sandi salah.","pw");
  localStorage.setItem(SESS,u.id);toast("Selamat datang, "+u.name.split(" ")[0]);go(f.next.value||"/saya")},
 signup:function(f){var n=f.elements.name.value.trim().replace(/\s+/g," "),em=f.email.value.trim().toLowerCase(),pw=f.pw.value;
  if(n.length<3)return fail(f,"Nama minimal 3 huruf.","name");if(!EM.test(em))return fail(f,"Tulis email yang benar.","email");
  if(db.users.some(function(x){return x.email===em}))return fail(f,"Email ini sudah terdaftar. Silakan masuk.","email");
  if(pw.length<6)return fail(f,"Kata sandi minimal 6 karakter.","pw");if(pw!==f.pw2.value)return fail(f,"Ulangi kata sandi dengan sama persis.","pw2");
  var u={id:nid("u"),name:n,email:em,pw:hash(pw),at:Date.now()};db.users.push(u);save();localStorage.setItem(SESS,u.id);toast("Akun dibuat. Selamat datang, "+n.split(" ")[0]);go(f.next.value||"/saya")},
 coupon:function(f){var c=by(db.courses,f.dataset.id),code=f.code.value.trim().toUpperCase();var r=couponCheck(code,c);CK={cid:c.id,code:code};render();if(r.err)toast(r.err,true);else toast("Kupon dipakai")},
 pay:function(f){var u=me(),c=by(db.courses,f.dataset.id);if(!u)return fail(f,"Masuk dulu.");if(!c||!c.active)return fail(f,"Kursus tidak tersedia.");
  if(enr(u.id,c.id)){go("/belajar/"+c.id);return}
  var cc=CK&&CK.cid===c.id?couponCheck(CK.code,c):null,disc=cc&&cc.k?cc.disc:0,total=c.price-disc,mc=f.querySelector('input[name=method]:checked'),m=mc?mc.value:"";
  if(c.price>0&&total>0&&!mc)return fail(f,"Pilih metode pembayaran.");
  if(cc&&cc.k)cc.k.used++;
  db.enr.push({id:nid("e"),uid:u.id,cid:c.id,at:Date.now(),done:{},quiz:{},cert:null});
  db.orders.push({id:"INV-"+(2600+db.orders.length),uid:u.id,uname:u.name,cid:c.id,ctitle:c.title,price:c.price,disc:disc,total:total,coupon:cc&&cc.k?cc.k.code:"",method:c.price>0?(total>0?m:"Kupon"):"Gratis",at:Date.now(),status:"lunas"});
  CK=null;save();toast(total>0?"Pembayaran berhasil (simulasi). Selamat belajar":"Pendaftaran berhasil. Selamat belajar");go("/belajar/"+c.id)},
 review:function(f){var u=me(),c=by(db.courses,f.dataset.id);if(!u||!enr(u.id,c.id))return fail(f,"Hanya peserta yang bisa menulis ulasan.");
  var r=+f.rating.value,t=f.text.value.trim();if(!(r>=1&&r<=5))return fail(f,"Pilih rating 1 sampai 5.","rating");if(t.length<10)return fail(f,"Ulasan minimal 10 karakter.","text");
  if(db.reviews.some(function(x){return x.cid===c.id&&x.uid===u.id}))return fail(f,"Kamu sudah menulis ulasan.");
  db.reviews.push({id:nid("r"),cid:c.id,uid:u.id,name:u.name,rating:r,text:t,at:Date.now()});save();toast("Ulasan terkirim");render()},
 ask:function(f){var u=me(),c=by(db.courses,f.dataset.id);if(!u||!enr(u.id,c.id))return fail(f,"Hanya peserta yang bisa bertanya.");var t=f.text.value.trim();
  if(t.length<10)return fail(f,"Pertanyaan minimal 10 karakter.","text");db.qa.push({id:nid("qa"),cid:c.id,uid:u.id,name:u.name,text:t,at:Date.now(),ans:null});save();toast("Pertanyaan terkirim ke pengajar");render()},
 quiz:function(f){var u=me(),c=by(db.courses,f.dataset.c),e=u&&enr(u.id,f.dataset.c),m=c&&by(c.modules,f.dataset.m);if(!e||!m||!m.quiz)return false;
  if(!m.lessons.every(function(l){return e.done[l.id]}))return fail(f,"Selesaikan semua pelajaran modul ini dulu.");
  var ans={},right=0,miss=[];m.quiz.qs.forEach(function(q,i){var s=f.querySelector('input[name="'+q.id+'"]:checked');if(!s)miss.push(i+1);else{ans[q.id]=+s.value;if(+s.value===q.a)right++}});
  if(miss.length)return fail(f,"Jawab semua soal. Belum dijawab: nomor "+miss.join(", ")+".");
  var score=Math.round(right*100/m.quiz.qs.length),passed=score>=m.quiz.pass,st=e.quiz[m.id]||{best:0,attempts:0,passed:false};
  st.attempts++;st.last=score;st.best=Math.max(st.best,score);st.passed=st.passed||passed;e.quiz[m.id]=st;save();
  QR={cid:c.id,mid:m.id,score:score,right:right,passed:passed,ans:ans};toast(passed?"Kamu lulus kuis":"Belum lulus, coba lagi",!passed);render()}
};
document.addEventListener("submit",function(ev){var f=ev.target.closest("form[data-form]");if(!f)return;ev.preventDefault();var fn=FORMS[f.dataset.form]||(typeof AFORMS!=="undefined"&&AFORMS[f.dataset.form]);if(fn)fn(f)});
window.addEventListener("hashchange",function(){QR=null;render()});
window.addEventListener("error",function(e){window.__errs=(window.__errs||[]);window.__errs.push(String(e.message))});
load();
document.addEventListener("DOMContentLoaded",render);
if(document.readyState!=="loading")render();
