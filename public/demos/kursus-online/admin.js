"use strict";
/* Panel pengajar/admin Kelas Nusa. PIN demo: 2024 */
var ED=null,KE=null,SELQ="",TABS=[["","Ringkasan"],["kursus","Kursus"],["peserta","Peserta"],["pesanan","Pesanan"],["kupon","Kupon"],["forum","Tanya jawab"]];
var DT={},DTC={},FQ=false;
function sel(v,t,cur){return'<option value="'+esc(v)+'"'+(String(cur)===String(v)?" selected":"")+">"+esc(t)+"</option>"}
function revenue(){var t=0;db.orders.forEach(function(o){if(o.status==="lunas")t+=o.total});return t}

function adminView(){
 var p=R.p;if(!isAdmin()){TITLE="Masuk panel";return'<div class="alogin"><form class="card pad" data-form="alogin" novalidate><span class="lm big">K</span><h1>Panel pengajar</h1><p class="hint">PIN demo: <b>'+esc(db.pin)+'</b></p><label>PIN<input name="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="12"></label><p class="err" role="alert"></p><button class="btn lg block">Masuk</button><p class="mut small"><a href="#/">Kembali ke situs</a></p></form></div>'}
 var tab=p[1]||"";if(!(tab==="kursus"&&p[2]))ED=null;
 var body;
 switch(tab){case"":TITLE="Ringkasan";body=aHome();break;case"kursus":body=p[2]?aEdit(p[2]):aCourses();break;case"peserta":body=aUsers(p[2]);break;case"pesanan":body=aOrders();break;case"kupon":body=aCoupons();break;case"forum":body=aForum();break;default:body='<div class="empty"><h1>Halaman tidak ditemukan</h1></div>'}
 return'<div class="adm"><aside class="aside"><a class="logo" href="#/admin"><span class="lm">K</span><span>Panel pengajar</span></a><nav aria-label="Menu panel">'+TABS.map(function(t){var n=t[0]==="forum"?db.qa.filter(function(q){return!q.ans}).length:0;return'<a href="#/admin'+(t[0]?"/"+t[0]:"")+'"'+(tab===t[0]?' aria-current="page"':"")+'>'+t[1]+(n?'<b class="bdg">'+n+'</b>':"")+'</a>'}).join("")+'</nav><div class="afoot"><a href="#/">Lihat situs</a><button class="lnk" data-act="alogout">Keluar panel</button><button class="lnk" data-act="reset">Reset data demo</button></div></aside><main class="amain">'+body+'</main></div>'}

/* ===== tabel generik ===== */
function dtSt(n){return DT[n]||(DT[n]={q:"",page:1,sort:"",dir:1})}
function dtInner(n){var c=DTC[n],s=dtSt(n),rows=c.rows(),q=s.q.trim().toLowerCase();
 if(q)rows=rows.filter(function(r){return c.s(r).toLowerCase().indexOf(q)>=0});
 if(s.sort!==""){var col=c.cols[+s.sort];rows=rows.slice().sort(function(a,b){var x=col.k(a),y=col.k(b);return(x>y?1:x<y?-1:0)*s.dir})}
 var size=c.size||8,pages=Math.max(1,Math.ceil(rows.length/size));if(s.page>pages)s.page=pages;var pg=rows.slice((s.page-1)*size,s.page*size);
 var h='<div class="tw"><table><thead><tr>'+c.cols.map(function(col,i){var a=s.sort===String(i);return'<th'+(col.c?' class="'+col.c+'"':"")+(a?' aria-sort="'+(s.dir>0?"ascending":"descending")+'"':"")+'>'+(col.k?'<button class="th" data-act="dts" data-n="'+n+'" data-i="'+i+'">'+esc(col.h)+(a?(s.dir>0?" ▲":" ▼"):"")+'</button>':esc(col.h))+'</th>'}).join("")+'</tr></thead><tbody>';
 h+=pg.length?pg.map(function(r){return'<tr>'+c.cols.map(function(col){return'<td'+(col.c?' class="'+col.c+'"':"")+' data-l="'+esc(col.h)+'">'+col.r(r)+'</td>'}).join("")+'</tr>'}).join(""):'<tr><td colspan="'+c.cols.length+'" class="empty-s">'+esc(c.empty||"Tidak ada data.")+'</td></tr>';
 h+='</tbody></table></div><div class="pgr"><span class="mut small">'+rows.length+' data</span><span><button class="btn sm ghost" data-act="dtp" data-n="'+n+'" data-d="-1"'+(s.page<=1?" disabled":"")+'>Sebelumnya</button> <span class="small">Hal. '+s.page+' dari '+pages+'</span> <button class="btn sm ghost" data-act="dtp" data-n="'+n+'" data-d="1"'+(s.page>=pages?" disabled":"")+'>Berikutnya</button></span></div>';return h}
function dtBox(n,cfg,ph){DTC[n]=cfg;var s=dtSt(n);return'<div class="tbar"><label class="sr">Cari<input type="search" data-dq="'+n+'" value="'+esc(s.q)+'" placeholder="'+esc(ph||"Cari")+'"></label>'+(cfg.csv?'<button class="btn sm ghost" data-act="dtcsv" data-n="'+n+'">'+ico("down")+' CSV</button>':"")+(cfg.extra||"")+'</div><div id="dt-'+n+'">'+dtInner(n)+'</div>'}
function dtRefresh(n){var e=$("dt-"+n);if(e)e.innerHTML=dtInner(n)}
function dtRows(n){var c=DTC[n],s=dtSt(n),rows=c.rows(),q=s.q.trim().toLowerCase();if(q)rows=rows.filter(function(r){return c.s(r).toLowerCase().indexOf(q)>=0});return rows}

/* ===== ringkasan ===== */
function aHome(){
 var paid=db.orders.filter(function(o){return o.status==="lunas"}),tot=revenue(),now=Date.now(),m30=0;paid.forEach(function(o){if(o.at>=now-30*DAY())m30+=o.total});
 var comp=0,sum=0;db.enr.forEach(function(e){var c=by(db.courses,e.cid);if(!c)return;var p=prog(e,c);sum+=p.pct;if(p.pct===100)comp++});
 var avg=db.enr.length?Math.round(sum/db.enr.length):0,un=db.qa.filter(function(q){return!q.ans}).length;
 var days=[],k;for(k=13;k>=0;k--){var d=new Date(now-k*DAY());days.push({key:ds(d),lbl:pad(d.getDate())+"/"+pad(d.getMonth()+1),v:0})}
 paid.forEach(function(o){var key=ds(new Date(o.at));days.forEach(function(x){if(x.key===key)x.v+=o.total})});
 var mx=Math.max.apply(null,days.map(function(x){return x.v}).concat([1]));
 var svg='<svg class="chart" viewBox="0 0 560 190" role="img" aria-label="Pendapatan 14 hari terakhir">'+days.map(function(x,i){var h=Math.round(x.v/mx*130),X=10+i*39;return'<rect x="'+X+'" y="'+(150-h)+'" width="28" height="'+h+'" rx="3" fill="var(--pri)"><title>'+x.lbl+': '+rp(x.v)+'</title></rect><text x="'+(X+14)+'" y="170" text-anchor="middle" font-size="10" fill="var(--mut)">'+(i%2===0?x.lbl:"")+'</text>'+(x.v?'<text x="'+(X+14)+'" y="'+(144-h)+'" text-anchor="middle" font-size="9" fill="var(--ink)">'+Math.round(x.v/1000)+'rb</text>':"")}).join("")+'<line x1="0" y1="150" x2="560" y2="150" stroke="var(--line)"/></svg>';
 var rows=db.courses.map(function(c){var es=db.enr.filter(function(e){return e.cid===c.id}),rev=0;paid.forEach(function(o){if(o.cid===c.id)rev+=o.total});var s=0,cm=0;es.forEach(function(e){var p=prog(e,c);s+=p.pct;if(p.pct===100)cm++});return{c:c,n:es.length,rev:rev,avg:es.length?Math.round(s/es.length):0,cm:cm}});
 return'<h1>Ringkasan</h1><div class="kpi"><div class="card"><span>Pendapatan total</span><b>'+rp(tot)+'</b></div><div class="card"><span>Pendapatan 30 hari</span><b>'+rp(m30)+'</b></div><div class="card"><span>Peserta terdaftar</span><b>'+db.users.length+'</b></div><div class="card"><span>Pendaftaran kursus</span><b>'+db.enr.length+'</b></div><div class="card"><span>Rata-rata progres</span><b>'+avg+'%</b></div><div class="card"><span>Lulus (100%)</span><b>'+comp+'</b></div></div>'+
 '<section class="card pad"><h2>Pendapatan 14 hari terakhir</h2>'+svg+'</section>'+
 (un?'<p class="note"><b>'+un+' pertanyaan belum dijawab.</b> <a href="#/admin/forum">Buka tanya jawab</a></p>':"")+
 '<section><h2>Per kursus</h2><div class="tw"><table><thead><tr><th>Kursus</th><th class="r">Peserta</th><th class="r">Progres rata-rata</th><th class="r">Lulus</th><th class="r">Pendapatan</th></tr></thead><tbody>'+rows.map(function(x){return'<tr><td data-l="Kursus"><a href="#/admin/kursus/'+x.c.id+'">'+esc(x.c.title)+'</a>'+(x.c.active?"":' <em class="mut">(draf)</em>')+'</td><td class="r" data-l="Peserta">'+x.n+'</td><td class="r" data-l="Progres">'+x.avg+'%</td><td class="r" data-l="Lulus">'+x.cm+'</td><td class="r" data-l="Pendapatan">'+rp(x.rev)+'</td></tr>'}).join("")+'</tbody></table></div></section>'}

/* ===== kursus ===== */
function aCourses(){TITLE="Kursus";
 var cfg={rows:function(){return db.courses},s:function(c){var i=by(db.ins,c.ins);return c.title+" "+c.cat+" "+c.lvl+" "+(i?i.name:"")},size:8,empty:"Belum ada kursus.",
  csv:true,extra:'<a class="btn sm" href="#/admin/kursus/baru">Tambah kursus</a>',
  cols:[{h:"Kursus",k:function(c){return c.title.toLowerCase()},r:function(c){var i=by(db.ins,c.ins);return'<b>'+esc(c.title)+'</b><br><span class="mut small">'+esc(c.cat)+' &middot; '+esc(c.lvl)+' &middot; '+esc(i?i.name:"-")+'</span>'}},
   {h:"Harga",c:"r",k:function(c){return c.price},r:function(c){return price(c.price)}},
   {h:"Modul",c:"r",k:function(c){return c.modules.length},r:function(c){return c.modules.length+" / "+lessonsOf(c).length}},
   {h:"Peserta",c:"r",k:function(c){return students(c)},r:function(c){return db.enr.filter(function(e){return e.cid===c.id}).length}},
   {h:"Rating",c:"r",k:function(c){return rating(c.id).avg},r:function(c){var r=rating(c.id);return r.n?num1(r.avg)+" ("+r.n+")":"-"}},
   {h:"Status",k:function(c){return c.active?1:0},r:function(c){return c.active?'<span class="tag ok">Aktif</span>':'<span class="tag">Draf</span>'}},
   {h:"Aksi",r:function(c){return'<span class="acts"><a class="btn sm ghost" href="#/admin/kursus/'+c.id+'">Ubah</a><button class="btn sm ghost" data-act="ctoggle" data-id="'+c.id+'">'+(c.active?"Nonaktifkan":"Aktifkan")+'</button><button class="btn sm danger" data-act="cdel" data-id="'+c.id+'">Hapus</button></span>'}}]};
 DTC.kursus=cfg;cfg.csvf=function(){var r=[["Judul","Bidang","Tingkat","Harga","Modul","Pelajaran","Peserta","Rating","Status"]];dtRows("kursus").forEach(function(c){r.push([c.title,c.cat,c.lvl,c.price,c.modules.length,lessonsOf(c).length,db.enr.filter(function(e){return e.cid===c.id}).length,num1(rating(c.id).avg),c.active?"Aktif":"Draf"])});return r};
 return'<h1>Kursus</h1>'+dtBox("kursus",cfg,"Cari kursus, bidang, atau pengajar")}

/* ===== penyunting kursus ===== */
function blankCourse(){return{id:nid("c"),title:"",cat:CATS[0],lvl:"Pemula",price:0,img:"kelas",ins:db.ins[0].id,base:0,desc:"",active:false,at:Date.now(),modules:[]}}
function ensureED(id){if(id==="baru"){if(!ED||!ED.isNew)ED={isNew:true,open:{},c:blankCourse()}}else if(!ED||ED.c.id!==id||ED.isNew){var c=by(db.courses,id);ED=c?{isNew:false,open:{},c:JSON.parse(JSON.stringify(c))}:null}}
function aEdit(id){ensureED(id);if(!ED)return nf();var c=ED.c;TITLE=ED.isNew?"Kursus baru":"Ubah kursus";
 var h='<h1>'+(ED.isNew?"Kursus baru":"Ubah kursus")+'</h1><form data-form="aced" novalidate class="ed">'+
 '<section class="card pad"><h2>Informasi</h2><div class="fg"><label class="w2">Judul kursus<input data-b="title" value="'+esc(c.title)+'" maxlength="80"></label>'+
 '<label>Bidang<select data-b="cat">'+CATS.map(function(x){return sel(x,x,c.cat)}).join("")+'</select></label>'+
 '<label>Tingkat<select data-b="lvl">'+LVLS.map(function(x){return sel(x,x,c.lvl)}).join("")+'</select></label>'+
 '<label>Harga (Rp, isi 0 untuk gratis)<input data-b="price" data-t="n" type="number" min="0" step="1000" inputmode="numeric" value="'+c.price+'"></label>'+
 '<label>Pengajar<select data-b="ins">'+db.ins.map(function(x){return sel(x.id,x.name,c.ins)}).join("")+'</select></label>'+
 '<label>Foto<select data-b="img" id="imgsel">'+Object.keys(IMGS).map(function(k){return sel(k,IMGS[k].alt,c.img)}).join("")+'</select></label>'+
 '<div class="ph sm-ph" id="imgprev">'+img(c.img)+'</div>'+
 '<label class="w2">Deskripsi<textarea data-b="desc" rows="3" maxlength="400">'+esc(c.desc)+'</textarea></label>'+
 '<label class="chk"><input type="checkbox" data-b="active" data-t="b"'+(c.active?" checked":"")+'> Tampil di katalog (aktif)</label></div></section>'+
 '<h2>Modul dan pelajaran</h2>'+(c.modules.length?"":'<p class="empty-s">Belum ada modul.</p>')+
 c.modules.map(function(m,mi){return edMod(m,mi,c)}).join("")+
 '<button type="button" class="btn ghost" data-act="aed" data-op="addmod">Tambah modul</button>'+
 '<p class="err" role="alert"></p><div class="acts sticky"><button class="btn">Simpan kursus</button><a class="btn ghost" href="#/admin/kursus" data-act="edcancel">Batal</a></div></form>';
 return h}
function edMod(m,mi,c){var p="modules."+mi;
 return'<section class="card pad emod"><div class="mh"><label class="grow">Judul modul '+(mi+1)+'<input data-b="'+p+'.title" value="'+esc(m.title)+'" maxlength="80"></label><span class="acts"><button type="button" class="btn sm ghost" data-act="aed" data-op="mup" data-i="'+mi+'" aria-label="Naikkan modul"'+(mi===0?" disabled":"")+'>Naik</button><button type="button" class="btn sm ghost" data-act="aed" data-op="mdn" data-i="'+mi+'"'+(mi===c.modules.length-1?" disabled":"")+'>Turun</button><button type="button" class="btn sm danger" data-act="aed" data-op="mdel" data-i="'+mi+'">Hapus modul</button></span></div>'+
 '<ul class="elist">'+m.lessons.map(function(l,li){var open=ED.open[l.id],lp=p+".lessons."+li;
  return'<li><div class="lr"><b>'+(li+1)+'. '+esc(l.title||"(tanpa judul)")+'</b><span class="acts"><button type="button" class="btn sm ghost" data-act="aed" data-op="ltg" data-id="'+l.id+'" aria-expanded="'+!!open+'">'+(open?"Tutup":"Ubah")+'</button><button type="button" class="btn sm ghost" data-act="aed" data-op="lup" data-i="'+mi+'" data-j="'+li+'"'+(li===0?" disabled":"")+'>Naik</button><button type="button" class="btn sm ghost" data-act="aed" data-op="ldn" data-i="'+mi+'" data-j="'+li+'"'+(li===m.lessons.length-1?" disabled":"")+'>Turun</button><button type="button" class="btn sm danger" data-act="aed" data-op="ldel" data-i="'+mi+'" data-j="'+li+'">Hapus</button></span></div>'+
  (open?'<div class="fg"><label class="w2">Judul pelajaran<input data-b="'+lp+'.title" value="'+esc(l.title)+'" maxlength="80"></label><label>Durasi (menit)<input type="number" min="1" max="240" data-t="n" data-b="'+lp+'.mins" value="'+esc(l.mins)+'"></label><label class="w2">Materi (pisahkan paragraf dengan baris kosong)<textarea rows="6" data-b="'+lp+'.body">'+esc(l.body)+'</textarea></label><label class="w2">Poin penting (satu per baris)<textarea rows="3" data-t="lines" data-b="'+lp+'.pts">'+esc((l.pts||[]).join("\n"))+'</textarea></label></div>':"")+'</li>'}).join("")+'</ul>'+
 '<button type="button" class="btn sm ghost" data-act="aed" data-op="addles" data-i="'+mi+'">Tambah pelajaran</button>'+
 '<div class="qed"><label class="chk"><input type="checkbox" data-act="aed" data-op="qtog" data-i="'+mi+'"'+(m.quiz?" checked":"")+'> Modul ini punya kuis</label>'+
 (m.quiz?'<div class="fg"><label>Nilai lulus (%)<input type="number" min="1" max="100" data-t="n" data-b="'+p+'.quiz.pass" value="'+m.quiz.pass+'"></label></div>'+m.quiz.qs.map(function(q,qi){var qp=p+".quiz.qs."+qi;
  return'<div class="qb"><div class="lr"><b>Soal '+(qi+1)+'</b><button type="button" class="btn sm danger" data-act="aed" data-op="qdel" data-i="'+mi+'" data-j="'+qi+'">Hapus soal</button></div><label>Pertanyaan<input data-b="'+qp+'.q" value="'+esc(q.q)+'" maxlength="200"></label><div class="fg">'+q.o.map(function(o,oi){return'<label>Pilihan '+"ABCD".charAt(oi)+'<input data-b="'+qp+'.o.'+oi+'" value="'+esc(o)+'" maxlength="120"></label>'}).join("")+'<label>Jawaban benar<select data-t="n" data-b="'+qp+'.a">'+q.o.map(function(o,oi){return sel(oi,"Pilihan "+"ABCD".charAt(oi),q.a)}).join("")+'</select></label></div></div>'}).join("")+'<button type="button" class="btn sm ghost" data-act="aed" data-op="addq" data-i="'+mi+'">Tambah soal</button>':"")+'</div></section>'}
function setPath(o,path,v){var k=path.split(".");for(var i=0;i<k.length-1;i++){o=o[k[i]];if(o==null)return}o[k[k.length-1]]=v}
function mv(a,i,d){var j=i+d;if(j<0||j>=a.length)return;var t=a[i];a[i]=a[j];a[j]=t}
function keepScroll(){var y=window.scrollY;render();window.scrollTo(0,y)}
function checkCourse(c){
 if(c.title.trim().length<3)return["Judul kursus minimal 3 huruf.","title"];
 if(c.price===""||!(c.price>=0)||c.price%1)return["Harga harus angka bulat nol atau lebih.","price"];
 if(c.desc.trim().length<10)return["Deskripsi minimal 10 karakter.","desc"];
 if(c.active&&!c.modules.length)return["Kursus aktif harus punya minimal satu modul.",""];
 for(var i=0;i<c.modules.length;i++){var m=c.modules[i];
  if(!m.title.trim())return["Modul "+(i+1)+" belum punya judul.","modules."+i+".title"];
  if(c.active&&!m.lessons.length)return["Modul "+(i+1)+" belum punya pelajaran.",""];
  for(var j=0;j<m.lessons.length;j++){var l=m.lessons[j];
   if(!l.title.trim()){ED.open[l.id]=true;return["Pelajaran "+(j+1)+" di modul "+(i+1)+" belum punya judul.","modules."+i+".lessons."+j+".title"]}
   if(!(l.mins>=1&&l.mins<=240)){ED.open[l.id]=true;return["Durasi pelajaran "+(j+1)+" di modul "+(i+1)+" harus 1 sampai 240 menit.","modules."+i+".lessons."+j+".mins"]}
   if(!String(l.body||"").trim()){ED.open[l.id]=true;return["Materi pelajaran "+(j+1)+" di modul "+(i+1)+" masih kosong.","modules."+i+".lessons."+j+".body"]}}
  if(m.quiz){if(!(m.quiz.pass>=1&&m.quiz.pass<=100))return["Nilai lulus kuis modul "+(i+1)+" harus 1 sampai 100.","modules."+i+".quiz.pass"];
   for(var q=0;q<m.quiz.qs.length;q++){var Q=m.quiz.qs[q],qp="modules."+i+".quiz.qs."+q;
    if(!Q.q.trim())return["Soal "+(q+1)+" kuis modul "+(i+1)+" belum ditulis.",qp+".q"];
    var ne=Q.o.filter(function(x){return x.trim()}).length;if(ne<2)return["Soal "+(q+1)+" kuis modul "+(i+1)+" butuh minimal dua pilihan.",qp+".o.0"];
    if(!String(Q.o[Q.a]||"").trim())return["Jawaban benar soal "+(q+1)+" kuis modul "+(i+1)+" menunjuk pilihan kosong.",qp+".a"]}}}
 return null}
function commitCourse(){var c=JSON.parse(JSON.stringify(ED.c));c.title=c.title.trim();c.desc=c.desc.trim();
 c.modules.forEach(function(m){m.title=m.title.trim();m.lessons.forEach(function(l){l.title=l.title.trim();l.mins=Math.round(l.mins);l.pts=(l.pts||[]).map(function(x){return String(x).trim()}).filter(Boolean)});
  if(m.quiz){m.quiz.qs.forEach(function(q){var map=[],o=[];q.o.forEach(function(x,i){if(x.trim()){map[i]=o.length;o.push(x.trim())}});q.q=q.q.trim();q.a=map[q.a];q.o=o});if(!m.quiz.qs.length)m.quiz=null}});
 if(ED.isNew)db.courses.push(c);else{for(var i=0;i<db.courses.length;i++)if(db.courses[i].id===c.id)db.courses[i]=c}
 save();return c}

/* ===== peserta ===== */
function userStats(u){var es=db.enr.filter(function(e){return e.uid===u.id&&by(db.courses,e.cid)}),s=0;es.forEach(function(e){s+=prog(e,by(db.courses,e.cid)).pct});return{n:es.length,avg:es.length?Math.round(s/es.length):0}}
function aUsers(uid){TITLE="Peserta";
 var cfg={rows:function(){return db.users},s:function(u){return u.name+" "+u.email},size:8,empty:"Belum ada peserta.",csv:true,
  cols:[{h:"Nama",k:function(u){return u.name.toLowerCase()},r:function(u){return'<b>'+esc(u.name)+'</b><br><span class="mut small">'+esc(u.email)+'</span>'}},
   {h:"Daftar",k:function(u){return u.at},r:function(u){return fdt(u.at)}},
   {h:"Kursus",c:"r",k:function(u){return userStats(u).n},r:function(u){return userStats(u).n}},
   {h:"Progres",c:"r",k:function(u){return userStats(u).avg},r:function(u){return userStats(u).avg+"%"}},
   {h:"Aksi",r:function(u){return'<a class="btn sm ghost" href="#/admin/peserta/'+u.id+'">Detail</a>'}}]};
 cfg.csvf=function(){var r=[["Nama","Email","Tanggal daftar","Kursus","Progres rata-rata","Sertifikat"]];dtRows("peserta").forEach(function(u){var st=userStats(u),cert=db.enr.filter(function(e){return e.uid===u.id&&e.cert}).length;r.push([u.name,u.email,ds(new Date(u.at)),st.n,st.avg+"%",cert])});return r};
 var det="";
 if(uid){var u=by(db.users,uid);if(u){var es=db.enr.filter(function(e){return e.uid===u.id&&by(db.courses,e.cid)});
  det='<section class="card pad" id="det"><div class="lr"><div><h2>'+esc(u.name)+'</h2><p class="mut">'+esc(u.email)+' &middot; daftar '+fdt(u.at)+'</p></div><a class="btn sm ghost" href="#/admin/peserta">Tutup</a></div>'+
   (es.length?'<div class="tw"><table><thead><tr><th>Kursus</th><th>Progres</th><th>Kuis</th><th>Sertifikat</th><th>Aksi</th></tr></thead><tbody>'+es.map(function(e){var c=by(db.courses,e.cid),p=prog(e,c);
    return'<tr><td data-l="Kursus">'+esc(c.title)+'<br><span class="mut small">Mulai '+fdt(e.at)+'</span></td><td data-l="Progres"><div class="bar"><i style="width:'+p.pct+'%"></i></div>'+p.pct+'% ('+p.l+'/'+p.lt+' pelajaran)</td><td data-l="Kuis">'+quizzesOf(c).map(function(m){var s=e.quiz[m.id];return'<div class="small">'+esc(m.title)+': '+(s?s.best+"% ("+s.attempts+"x)"+(s.passed?" lulus":" belum lulus"):"belum")+'</div>'}).join("")+(quizzesOf(c).length?"":"-")+'</td><td data-l="Sertifikat">'+(e.cert?esc(e.cert.id):(p.pct===100?"Siap terbit":"-"))+'</td><td data-l="Aksi"><span class="acts"><button class="btn sm ghost" data-act="ureset" data-id="'+e.id+'">Reset progres</button><button class="btn sm danger" data-act="uunenroll" data-id="'+e.id+'">Cabut</button></span></td></tr>'}).join("")+'</tbody></table></div>':'<p class="empty-s">Belum mengikuti kursus.</p>')+
   '<button class="btn sm danger" data-act="udel" data-id="'+u.id+'">Hapus peserta</button></section>'}}
 return'<h1>Peserta</h1>'+det+dtBox("peserta",cfg,"Cari nama atau email")}

/* ===== pesanan ===== */
function aOrders(){TITLE="Pesanan";
 var cfg={rows:function(){return db.orders.slice().sort(function(a,b){return b.at-a.at})},s:function(o){return o.id+" "+o.uname+" "+o.ctitle+" "+o.coupon+" "+o.status},size:8,empty:"Belum ada pesanan.",csv:true,
  cols:[{h:"No.",k:function(o){return o.id},r:function(o){return esc(o.id)}},
   {h:"Tanggal",k:function(o){return o.at},r:function(o){return fdt(o.at)}},
   {h:"Peserta",k:function(o){return o.uname.toLowerCase()},r:function(o){return esc(o.uname)}},
   {h:"Kursus",k:function(o){return o.ctitle.toLowerCase()},r:function(o){return esc(o.ctitle)}},
   {h:"Kupon",r:function(o){return o.coupon?esc(o.coupon):"-"}},
   {h:"Total",c:"r",k:function(o){return o.total},r:function(o){return price(o.total)}},
   {h:"Status",k:function(o){return o.status},r:function(o){return'<span class="tag '+(o.status==="lunas"?"ok":"")+'">'+esc(o.status)+'</span>'}},
   {h:"Aksi",r:function(o){return o.status==="lunas"&&o.total>0?'<button class="btn sm danger" data-act="refund" data-id="'+esc(o.id)+'">Kembalikan dana</button>':"-"}}]};
 cfg.csvf=function(){var r=[["No","Tanggal","Peserta","Kursus","Kupon","Harga","Diskon","Total","Metode","Status"]];dtRows("pesanan").forEach(function(o){r.push([o.id,ds(new Date(o.at)),o.uname,o.ctitle,o.coupon,o.price,o.disc,o.total,o.method,o.status])});return r};
 return'<h1>Pesanan</h1><p class="mut">Total pendapatan (lunas): <b>'+rp(revenue())+'</b></p>'+dtBox("pesanan",cfg,"Cari nomor, peserta, atau kursus")}

/* ===== kupon ===== */
function aCoupons(){TITLE="Kupon";var k=KE||{code:"",type:"pct",value:10,min:0,max:0,exp:"",active:true,desc:"",_new:true};
 return'<h1>Kupon</h1><div class="two"><section><div class="tw"><table><thead><tr><th>Kode</th><th>Potongan</th><th class="r">Min. belanja</th><th class="r">Dipakai</th><th>Berlaku sampai</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+
 (db.coupons.length?db.coupons.map(function(c){var ex=c.exp&&c.exp<ds(new Date());return'<tr><td data-l="Kode"><b>'+esc(c.code)+'</b><br><span class="mut small">'+esc(c.desc)+'</span></td><td data-l="Potongan">'+(c.type==="pct"?c.value+"%":rp(c.value))+'</td><td class="r" data-l="Min. belanja">'+rp(c.min)+'</td><td class="r" data-l="Dipakai">'+c.used+(c.max?" / "+c.max:"")+'</td><td data-l="Berlaku">'+(c.exp?fdt(new Date(c.exp+"T00:00:00").getTime())+(ex?" (lewat)":""):"Tanpa batas")+'</td><td data-l="Status">'+(c.active?'<span class="tag ok">Aktif</span>':'<span class="tag">Nonaktif</span>')+'</td><td data-l="Aksi"><span class="acts"><button class="btn sm ghost" data-act="kedit" data-id="'+esc(c.code)+'">Ubah</button><button class="btn sm ghost" data-act="ktog" data-id="'+esc(c.code)+'">'+(c.active?"Matikan":"Aktifkan")+'</button><button class="btn sm danger" data-act="kdel" data-id="'+esc(c.code)+'">Hapus</button></span></td></tr>'}).join(""):'<tr><td colspan="7" class="empty-s">Belum ada kupon.</td></tr>')+'</tbody></table></div></section>'+
 '<form class="card pad" data-form="akupon" novalidate><h2>'+(k._new?"Kupon baru":"Ubah kupon")+'</h2><input type="hidden" name="orig" value="'+(k._new?"":esc(k.code))+'"><label>Kode (huruf dan angka)<input name="code" value="'+esc(k.code)+'" maxlength="20" autocapitalize="characters"></label><label>Jenis<select name="type">'+sel("pct","Persen (%)",k.type)+sel("nom","Nominal (Rp)",k.type)+'</select></label><label>Nilai<input name="value" type="number" min="1" inputmode="numeric" value="'+k.value+'"></label><label>Minimal belanja (Rp)<input name="min" type="number" min="0" inputmode="numeric" value="'+k.min+'"></label><label>Batas pemakaian (0 = tanpa batas)<input name="max" type="number" min="0" inputmode="numeric" value="'+k.max+'"></label><label>Berlaku sampai (opsional)<input name="exp" type="date" value="'+esc(k.exp)+'"></label><label>Keterangan<input name="desc" value="'+esc(k.desc)+'" maxlength="80"></label><label class="chk"><input type="checkbox" name="active"'+(k.active?" checked":"")+'> Aktif</label><p class="err" role="alert"></p><div class="acts"><button class="btn">Simpan kupon</button>'+(k._new?"":'<button type="button" class="btn ghost" data-act="kcancel">Batal ubah</button>')+'</div></form></div>'}

/* ===== tanya jawab ===== */
function aForum(){TITLE="Tanya jawab";var a=db.qa.slice().sort(function(x,y){return y.at-x.at});if(FQ)a=a.filter(function(q){return!q.ans});
 return'<h1>Tanya jawab</h1><label class="chk"><input type="checkbox" data-act="fq"'+(FQ?" checked":"")+'> Hanya yang belum dijawab</label>'+(a.length?'<ul class="qa adm-qa">'+a.map(function(q){var c=by(db.courses,q.cid),i=c&&by(db.ins,c.ins);
  return'<li class="card pad"><p><b>'+esc(q.name)+'</b> <span class="mut">di '+esc(c?c.title:"-")+' &middot; '+fdt(q.at)+'</span></p><p>'+esc(q.text)+'</p>'+(q.ans?'<div class="ans"><b>'+esc(q.ans.by)+'</b> <span class="mut">'+fdt(q.ans.at)+'</span><p>'+esc(q.ans.text)+'</p></div>':"")+
  '<form data-form="aans" data-id="'+q.id+'" novalidate><label>'+(q.ans?"Ubah jawaban":"Jawaban")+'<textarea name="text" rows="3" maxlength="600">'+esc(q.ans?q.ans.text:"")+'</textarea></label><p class="err" role="alert"></p><span class="acts"><button class="btn sm">'+(q.ans?"Simpan jawaban":"Kirim jawaban")+'</button><button type="button" class="btn sm danger" data-act="qdelq" data-id="'+q.id+'">Hapus</button></span></form></li>'}).join("")+'</ul>':'<p class="empty-s">Tidak ada pertanyaan.</p>')}

/* ===== aksi admin ===== */
ACT.alogout=function(){localStorage.removeItem(ADM);toast("Keluar dari panel");go("/admin")};
ACT.dts=function(t){var s=dtSt(t.dataset.n);if(s.sort===t.dataset.i)s.dir=-s.dir;else{s.sort=t.dataset.i;s.dir=1}dtRefresh(t.dataset.n)};
ACT.dtp=function(t){var s=dtSt(t.dataset.n);s.page+=+t.dataset.d;if(s.page<1)s.page=1;dtRefresh(t.dataset.n)};
ACT.dtcsv=function(t){var n=t.dataset.n,c=DTC[n];csvDown(({kursus:"kursus",peserta:"peserta",pesanan:"pesanan"}[n]||n)+".csv",c.csvf())};
ACT.ctoggle=function(t){var c=by(db.courses,t.dataset.id);if(!c)return;if(!c.active&&!c.modules.length){toast("Tambah modul dulu sebelum mengaktifkan",true);return}c.active=!c.active;save();render();toast(c.active?"Kursus diaktifkan":"Kursus dinonaktifkan")};
ACT.cdel=function(t){var c=by(db.courses,t.dataset.id);if(!c)return;if(db.enr.some(function(e){return e.cid===c.id})){toast("Kursus sudah punya peserta. Nonaktifkan saja.",true);return}
 if(!armed(t,"Yakin? Tekan lagi"))return;db.courses=db.courses.filter(function(x){return x!==c});db.reviews=db.reviews.filter(function(r){return r.cid!==c.id});db.qa=db.qa.filter(function(q){return q.cid!==c.id});save();render();toast("Kursus dihapus")};
ACT.edcancel=function(t,ev){ED=null;location.hash="#/admin/kursus"};
ACT.aed=function(t){
 if(t.tagName==="INPUT"&&t.type==="checkbox"&&t.dataset.op!=="qtog")return;
 var op=t.dataset.op,c=ED&&ED.c,i=+t.dataset.i,j=+t.dataset.j,m=c&&c.modules[i];if(!c)return;
 if(op==="addmod")c.modules.push({id:nid("m"),title:"",lessons:[],quiz:null});
 else if(op==="mup")mv(c.modules,i,-1);else if(op==="mdn")mv(c.modules,i,1);
 else if(op==="mdel"){if(!armed(t,"Yakin? Tekan lagi"))return;c.modules.splice(i,1)}
 else if(op==="addles"){var l={id:nid("l"),title:"",mins:10,body:"",pts:[]};m.lessons.push(l);ED.open[l.id]=true}
 else if(op==="ltg"){ED.open[t.dataset.id]=!ED.open[t.dataset.id]}
 else if(op==="lup")mv(m.lessons,j,-1);else if(op==="ldn")mv(m.lessons,j,1);
 else if(op==="ldel"){if(!armed(t,"Yakin?"))return;m.lessons.splice(j,1)}
 else if(op==="qtog"){if(t.checked){m.quiz={pass:70,qs:[]};m.quiz.qs.push({id:nid("q"),q:"",o:["","","",""],a:0})}else{if(m.quiz&&m.quiz.qs.length&&!window.__qok){t.checked=true;toast("Mematikan kuis menghapus soalnya. Hapus soal satu per satu untuk melanjutkan.",true);return}m.quiz=null}}
 else if(op==="addq")m.quiz.qs.push({id:nid("q"),q:"",o:["","","",""],a:0});
 else if(op==="qdel"){if(!armed(t,"Yakin?"))return;m.quiz.qs.splice(j,1)}
 keepScroll()};
ACT.ureset=function(t){var e=by(db.enr,t.dataset.id);if(!e)return;if(!armed(t,"Yakin? Tekan lagi"))return;e.done={};e.quiz={};save();render();toast("Progres direset (sertifikat yang sudah terbit tetap tercatat)")};
ACT.uunenroll=function(t){var e=by(db.enr,t.dataset.id);if(!e)return;if(!armed(t,"Yakin? Tekan lagi"))return;db.enr=db.enr.filter(function(x){return x!==e});save();render();toast("Pendaftaran dicabut")};
ACT.udel=function(t){var u=by(db.users,t.dataset.id);if(!u)return;if(!armed(t,"Yakin? Tekan lagi"))return;
 db.users=db.users.filter(function(x){return x!==u});db.enr=db.enr.filter(function(e){return e.uid!==u.id});db.reviews=db.reviews.filter(function(r){return r.uid!==u.id});db.qa=db.qa.filter(function(q){return q.uid!==u.id});
 Object.keys(db.notes).forEach(function(k){if(k.indexOf(u.id+"|")===0)delete db.notes[k]});if(localStorage.getItem(SESS)===u.id)localStorage.removeItem(SESS);save();toast("Peserta dihapus");go("/admin/peserta")};
ACT.refund=function(t){var o=null;db.orders.forEach(function(x){if(x.id===t.dataset.id)o=x});if(!o)return;if(!armed(t,"Yakin? Tekan lagi"))return;
 o.status="dikembalikan";db.enr=db.enr.filter(function(e){return!(e.uid===o.uid&&e.cid===o.cid)});save();render();toast("Dana dikembalikan (simulasi), pendaftaran dicabut")};
ACT.kedit=function(t){var k=null;db.coupons.forEach(function(x){if(x.code===t.dataset.id)k=x});KE=k?JSON.parse(JSON.stringify(k)):null;render()};
ACT.kcancel=function(){KE=null;render()};
ACT.ktog=function(t){db.coupons.forEach(function(x){if(x.code===t.dataset.id)x.active=!x.active});save();render()};
ACT.kdel=function(t){if(!armed(t,"Yakin? Tekan lagi"))return;db.coupons=db.coupons.filter(function(x){return x.code!==t.dataset.id});if(KE&&KE.code===t.dataset.id)KE=null;save();render();toast("Kupon dihapus")};
ACT.fq=function(t){FQ=t.checked;render()};
ACT.qdelq=function(t){if(!armed(t,"Yakin?"))return;db.qa=db.qa.filter(function(q){return q.id!==t.dataset.id});save();render();toast("Pertanyaan dihapus")};

var AFORMS={
 alogin:function(f){if(f.pin.value.trim()!==db.pin)return fail(f,"PIN salah.","pin");localStorage.setItem(ADM,"1");toast("Selamat datang di panel");go("/admin")},
 aced:function(f){var er=checkCourse(ED.c);if(er){fail(f,er[0]);toast(er[0],true);if(er[1]){var el=f.querySelector('[data-b="'+er[1]+'"]');if(!el){keepScroll();el=document.querySelector('[data-b="'+er[1]+'"]')}if(el&&el.focus)el.focus()}return}
  var isNew=ED.isNew,c=commitCourse();ED=null;toast(isNew?"Kursus dibuat":"Kursus disimpan");go("/admin/kursus")},
 akupon:function(f){var code=f.code.value.trim().toUpperCase(),orig=f.orig.value,type=f.type.value,val=+f.value.value,min=+f.min.value||0,max=+f.max.value||0,exp=f.exp.value;
  if(!/^[A-Z0-9]{3,20}$/.test(code))return fail(f,"Kode 3 sampai 20 huruf atau angka, tanpa spasi.","code");
  if(code!==orig&&db.coupons.some(function(x){return x.code===code}))return fail(f,"Kode sudah dipakai.","code");
  if(!(val>=1)||val%1)return fail(f,"Nilai harus angka bulat minimal 1.","value");if(type==="pct"&&val>100)return fail(f,"Persen maksimal 100.","value");
  if(min<0||max<0)return fail(f,"Angka tidak boleh negatif.","min");if(exp&&!/^\d{4}-\d{2}-\d{2}$/.test(exp))return fail(f,"Tanggal tidak valid.","exp");
  var o={code:code,type:type,value:val,min:min,max:max,exp:exp,active:f.active.checked,used:0,desc:f.desc.value.trim()};
  if(orig){var old=null;db.coupons.forEach(function(x){if(x.code===orig)old=x});if(old){o.used=old.used;db.coupons[db.coupons.indexOf(old)]=o}}else db.coupons.push(o);
  KE=null;save();render();toast("Kupon disimpan")},
 aans:function(f){var q=by(db.qa,f.dataset.id),t=f.text.value.trim();if(!q)return;if(t.length<5)return fail(f,"Jawaban minimal 5 karakter.","text");
  var c=by(db.courses,q.cid),i=c&&by(db.ins,c.ins);q.ans={by:i?i.name:"Pengajar",text:t,at:Date.now()};save();render();toast("Jawaban terkirim")}
};
document.addEventListener("input",function(ev){var t=ev.target;
 if(t.dataset&&t.dataset.dq){var s=dtSt(t.dataset.dq);s.q=t.value;s.page=1;dtRefresh(t.dataset.dq);return}
 if(t.dataset&&t.dataset.b&&ED){var v=t.type==="checkbox"?t.checked:t.value;if(t.dataset.t==="n")v=v===""?"":+v;else if(t.dataset.t==="lines")v=String(v).split("\n");setPath(ED.c,t.dataset.b,v);
  if(t.dataset.b==="img"){var pv=$("imgprev");if(pv)pv.innerHTML=img(v)}}});
document.addEventListener("change",function(ev){var t=ev.target;if(t.dataset&&t.dataset.b&&ED&&(t.tagName==="SELECT"||t.type==="checkbox")){var v=t.type==="checkbox"?t.checked:t.value;if(t.dataset.t==="n")v=+v;setPath(ED.c,t.dataset.b,v);if(t.dataset.b==="img"){var pv=$("imgprev");if(pv)pv.innerHTML=img(v)}}});
