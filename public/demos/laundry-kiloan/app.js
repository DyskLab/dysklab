var KEY="laundrykiloan.v1",DAY=864e5;
function $(i){return document.getElementById(i)}
function rp(n){return(n<0?"-":"")+"Rp"+Math.abs(Math.round(n)).toLocaleString("id-ID")}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function num(v){return +(String(v).replace(/\D/g,"")||0)}
function dec(v){var x=parseFloat(String(v).replace(",","."));return isFinite(x)&&x>0?Math.round(x*100)/100:0}
function kgs(n){return String(Math.round(n*100)/100).replace(".",",")}
function two(n){return String(n).padStart(2,"0")}
function dayStart(t){var d=new Date(t);d.setHours(0,0,0,0);return d.getTime()}
function hm(t){var d=new Date(t);return two(d.getHours())+":"+two(d.getMinutes())}
function dm(t){var d=new Date(t);return two(d.getDate())+"/"+two(d.getMonth()+1)}
function fmt(t){return dm(t)+" "+hm(t)}
function dlong(t){return new Date(t).toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short"})+" "+hm(t)}
function ymd(t){var d=new Date(t);return d.getFullYear()+"-"+two(d.getMonth()+1)+"-"+two(d.getDate())}
function normPh(s){var d=String(s).replace(/\D/g,"");if(!d)return"";if(d.indexOf("62")===0)return d;if(d.charAt(0)==="0")return"62"+d.slice(1);return"62"+d}
var ST=["Diterima","Dicuci","Disetrika","Siap diambil","Diambil"],STS=["Diterima","Dicuci","Disetrika","Siap","Diambil"],NEXT=["Mulai dicuci","Pindah ke setrika","Tandai siap diambil","Serahkan ke pelanggan"];

function calc(items,ex,dv,du,cfg){var sub=items.reduce(function(a,b){return a+Math.round(b.q*b.p)},0),sur=ex?Math.round(sub*cfg.exPct/100):0,base=sub+sur,disc=du==="%"?Math.round(base*Math.min(dv,100)/100):Math.min(dv,base);return{sub:sub,sur:sur,disc:disc,total:base-disc}}
function orderNo(n){return"LD-"+String(n).padStart(4,"0")}

function seed(){
  var s=11,r=function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  var cfg={shop:"Laundry Kiloan Contoh",addr:"Jl. Melati No. 12, Kota Contoh",phone:"0812-0000-9000",pin:"1234",exPct:50,regD:2,expD:1};
  var svc=[[ "Cuci Setrika Kiloan","kg",7000,1],["Cuci Kering Kiloan","kg",5000,1],["Setrika Saja","kg",4000,1],["Selimut","pcs",25000,1],["Bed Cover","pcs",35000,1],["Jaket","pcs",15000,1],["Sepatu","pcs",30000,1],["Boneka","pcs",15000,0]].map(function(x,i){return{id:i+1,n:x[0],t:x[1],p:x[2],on:x[3]}});
  var nm=["Ani Wijaya","Budi Santoso","Citra Lestari","Dedi Pratama","Eka Putri","Fajar Nugroho","Gita Maharani","Hendra Saputra","Indah Permata","Joko Susilo"];
  var cus=nm.map(function(n,i){return{id:i+1,n:n,ph:"0812-0000-"+String(i+1).padStart(4,"0"),ad:"Jl. Contoh No. "+(i+3)}});
  var now=Date.now(),today=dayStart(now),ords=[],meth=["Tunai","Tunai","QRIS","Transfer"];
  for(var d=13;d>=0;d--){
    var n=d===0?4:2+Math.floor(r()*3);
    for(var k=0;k<n;k++){
      var ts=today-d*DAY+(8+Math.floor(r()*10))*36e5+Math.floor(r()*60)*6e4;if(ts>now)ts=now-(k+1)*9e5;
      var c=cus[Math.floor(r()*cus.length)],items=[],cnt=1+Math.floor(r()*2),used={};
      while(items.length<cnt){var sv=svc[Math.floor(r()*7)];if(used[sv.id])continue;used[sv.id]=1;items.push({sid:sv.id,n:sv.n,t:sv.t,p:sv.p,q:sv.t==="kg"?(10+Math.floor(r()*90))/10:1+Math.floor(r()*2)})}
      var ex=r()<.25,t=calc(items,ex,0,"Rp",cfg),due=ts+(ex?cfg.expD:cfg.regD)*DAY,p=(now-ts)/(due-ts);
      var st=p>=1.5?4:p>=1?(r()<.5?4:3):p>=.66?2:p>=.33?1:0,mul=[0,.35,.65,.95,1.2],hist=[];
      for(var i=0;i<=st;i++){var ht=Math.round(ts+(due-ts)*mul[i]),hd=new Date(ht);if(i>0){if(hd.getHours()<8)hd.setHours(8);else if(hd.getHours()>19)hd.setHours(19);ht=Math.max(hd.getTime(),hist[i-1].ts)}hist.push({st:i,ts:Math.min(now,ht)})}
      var dp=st===4?0:(r()<.35?Math.min(t.total,Math.round(t.total*.5/1000)*1000):(r()<.2?t.total:0)),m=meth[Math.floor(r()*meth.length)],pays=[];
      if(dp)pays.push({ts:ts,amt:dp,m:m,k:dp>=t.total?"Lunas":"Uang muka"});
      if(st===4&&t.total-dp>0)pays.push({ts:hist[4].ts,amt:t.total-dp,m:m,k:"Pelunasan"});
      ords.push({cid:c.id,cn:c.n,ph:c.ph,items:items,sub:t.sub,sur:t.sur,disc:0,total:t.total,ex:ex,note:"",ts:ts,due:due,st:st,hist:hist,pays:pays,cx:false})
    }
  }
  ords.sort(function(a,b){return a.ts-b.ts}).forEach(function(o,i){o.id=i+1;o.no=orderNo(i+1)});
  var en=["Deterjen","Pelembut","Listrik","Plastik kemasan","Gas LPG","Air galon"],ea=[45000,30000,150000,20000,22000,15000],exps=[];
  for(var d2=13;d2>=0;d2--){var q=1+Math.floor(r()*2);for(var j=0;j<q;j++){var x=Math.floor(r()*en.length),et=Math.min(now-(j+1)*6e4,today-d2*DAY+(9+j*3)*36e5);exps.push({id:exps.length+1,ts:et,n:en[x],amt:ea[x]})}}
  return{v:1,shop:cfg.shop,addr:cfg.addr,phone:cfg.phone,pin:cfg.pin,exPct:cfg.exPct,regD:cfg.regD,expD:cfg.expD,svc:svc,customers:cus,orders:ords,exps:exps,seq:ords.length+1,oid:ords.length+1,cid:cus.length+1,sid:svc.length+1,xid:exps.length+1}
}
var db;
function load(){try{var x=JSON.parse(localStorage.getItem(KEY));if(x&&x.v===1&&x.orders&&x.customers&&x.svc&&x.exps)return x}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
db=load();save();

var tab=0,bst=0,pin="",authed=false,armed=null,tt,curO=0,curC=0,nf,last=null,nback="",rmode="d",payO=0,payAdv=false,payM="Tunai",editC=0,editV=0,editX=0;
function O(id){return db.orders.filter(function(o){return o.id===id})[0]}
function C(id){return db.customers.filter(function(c){return c.id===id})[0]}
function S(id){return db.svc.filter(function(c){return c.id===id})[0]}
function paid(o){return o.pays.reduce(function(a,b){return a+b.amt},0)}
function sisa(o){return o.cx?0:Math.max(0,o.total-paid(o))}
function cfg(){return{exPct:db.exPct}}
function toast(m,bad){var t=$("toast");t.textContent=m;t.className="toast on"+(bad?" bad":"");clearTimeout(tt);tt=setTimeout(function(){t.className="toast"},2600)}
function arm(k,btn,label){if(armed!==k){armed=k;btn.textContent=label;return false}armed=null;return true}
function sum(o){return o.items.map(function(i){return(i.t==="kg"?kgs(i.q)+" kg ":i.q+" ")+i.n}).join(", ")}
function badge(o){if(o.cx)return'<span class="bg late">Batal</span>';var h='<span class="bg s'+o.st+'">'+ST[o.st]+'</span>';if(o.st<3&&o.due<Date.now())h+='<span class="bg late">Terlambat</span>';return h}

/* login dan layar */
function show(id){["login","app","rcpt","trk"].forEach(function(s){$(s).classList.toggle("on",s===id)});closeAll()}
function closeAll(){document.querySelectorAll(".sheet.on").forEach(function(s){s.classList.remove("on")});armed=null}
function openSheet(id){armed=null;var s=$(id);s.classList.add("on");var b=s.querySelector(".sh");if(b)b.scrollTop=0;if(b)b.focus({preventScroll:true})}
function pad(){var k=["1","2","3","4","5","6","7","8","9","","0","⌫"];$("pad").innerHTML=k.map(function(x){return x?'<button data-k="'+x+'" aria-label="'+(x==="⌫"?"Hapus":x)+'">'+x+'</button>':'<span></span>'}).join("")}
function dots(){Array.prototype.forEach.call($("dots").children,function(d,i){d.classList.toggle("on",i<pin.length)})}
function key(k){if(k==="⌫")pin=pin.slice(0,-1);else if(pin.length<4)pin+=k;dots();if(pin.length===4){if(pin===db.pin){setTimeout(function(){pin="";dots();authed=true;show("app");$("date").textContent=new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"});go(0)},150)}else{$("dots").classList.add("err");setTimeout(function(){$("dots").classList.remove("err");pin="";dots()},420)}}}
function brand(){$("shopname").textContent=db.shop;$("trkshop").textContent=db.shop;document.title=db.shop+" | Contoh aplikasi laundry";$("pinhint").textContent=db.pin==="1234"?"PIN contoh: 1234":"Masukkan PIN laundry"}

/* papan */
function board(){
  var q=$("oq").value.trim().toLowerCase(),qd=q.replace(/\D/g,""),cnt=[0,0,0,0,0],l;
  db.orders.forEach(function(o){if(!o.cx)cnt[o.st]++});
  $("oseg").innerHTML=STS.map(function(s,i){return'<button class="'+(i===bst&&!q?"on":"")+'" data-bs="'+i+'" aria-label="'+ST[i]+', '+cnt[i]+' order"><b>'+cnt[i]+'</b>'+s+'</button>'}).join("");
  if(q){l=db.orders.filter(function(o){return o.no.toLowerCase().indexOf(q)>-1||o.cn.toLowerCase().indexOf(q)>-1||(qd.length>=3&&o.ph.replace(/\D/g,"").indexOf(qd)>-1)}).sort(function(a,b){return b.ts-a.ts})}
  else{l=db.orders.filter(function(o){return !o.cx&&o.st===bst});if(bst===4)l.sort(function(a,b){return b.hist[4].ts-a.hist[4].ts});else l.sort(function(a,b){return a.due-b.due})}
  var more=l.length>40;l=l.slice(0,40);
  $("olist").innerHTML=(q?'<p class="note">Hasil pencarian: '+l.length+(more?"+":"")+' order</p>':"")+(l.length?l.map(function(o){var s=sisa(o);
    return'<div class="oc"><button class="ocm" data-o="'+o.id+'"><div class="t"><span><b>'+o.no+'</b>'+badge(o)+(o.ex&&!o.cx?'<span class="bg due">Kilat</span>':"")+'</span><b>'+rp(o.total)+'</b></div><div class="it">'+esc(o.cn)+'</div><small>'+esc(sum(o))+'</small><small>'+(o.st===4?"Diambil "+dlong(o.hist[4].ts):"Selesai "+dlong(o.due))+(s?" &middot; sisa "+rp(s):(o.cx?"":" &middot; lunas"))+'</small></button>'+(!q&&o.st<4||q&&!o.cx&&o.st<4?'<button class="go s" data-adv="'+o.id+'">'+NEXT[o.st]+'</button>':"")+'</div>'}).join("")+(more?'<p class="note">Menampilkan 40 teratas. Persempit pencarian.</p>':""):'<div class="none"><img class="bn" src="img/keranjang.jpg" alt="Keranjang cucian hijau yang kosong" width="640" height="480" loading="lazy" style="max-width:200px"><p style="margin:8px 0 0">'+(q?"Tidak ada order yang cocok.":"Belum ada order di status ini.")+'</p></div>')}

function advance(id){var o=O(id);if(!o||o.cx||o.st>=4)return;if(o.st===3&&sisa(o)>0){payShow(o.id,true);return}
  o.st++;o.hist.push({st:o.st,ts:Date.now()});save();board();
  if(o.st===3){toast("Siap diambil. Kabari pelanggan lewat WhatsApp.");openDetail(o.id)}else{toast(o.no+": "+ST[o.st]);if($("osheet").classList.contains("on"))openDetail(o.id)}}

function line(a,b){return'<div class="kv"><span>'+a+'</span><span>'+b+'</span></div>'}
function openDetail(id){var o=O(id);if(!o)return;curO=id;var s=sisa(o);
  var tl=ST.map(function(n,i){var h=o.hist.filter(function(x){return x.st===i})[0];return'<li class="'+(h?"done":"")+'"><i></i>'+n+'<span>'+(h?dlong(h.ts):"")+'</span></li>'}).join("");
  $("osb").innerHTML='<h3>'+o.no+' '+badge(o)+'</h3>'+line("Pelanggan",esc(o.cn))+line("Telepon",esc(o.ph))+line("Diterima",dlong(o.ts))+line(o.st===4?"Selesai":"Estimasi selesai",dlong(o.due)+(o.ex?" (kilat)":""))+(o.note?line("Catatan",esc(o.note)):"")
   +'<hr style="border:0;border-top:1px dashed var(--line);margin:8px 0">'+o.items.map(function(i){return line(esc(i.n)+" ("+(i.t==="kg"?kgs(i.q)+" kg":i.q+" pcs")+")",rp(Math.round(i.q*i.p)))}).join("")
   +(o.sur?line("Biaya kilat",rp(o.sur)):"")+(o.disc?line("Diskon","-"+rp(o.disc)):"")+'<div class="tt" style="margin:6px 0"><span>Total</span><span>'+rp(o.total)+'</span></div>'
   +o.pays.map(function(p){return line(esc(p.k)+" ("+esc(p.m)+") "+dm(p.ts),rp(p.amt))}).join("")+line("<b>"+(o.cx?"Status":"Sisa")+"</b>","<b>"+(o.cx?"Dibatalkan":(s?rp(s):"Lunas"))+"</b>")
   +'<ul class="tl">'+tl+'</ul>'
   +(o.cx?"":(o.st<4?'<button class="go" data-adv="'+o.id+'">'+NEXT[o.st]+'</button>':"")+(o.st===3?'<button class="go w" data-wa="'+o.id+'" style="margin-top:8px">Kabari lewat WhatsApp: siap diambil</button>':"")+(s&&o.st<3?'<button class="go l" data-pay="'+o.id+'" style="margin-top:8px">Terima pembayaran '+rp(s)+'</button>':""))
   +'<button class="go l" data-nota="'+o.id+'" style="margin-top:8px">Lihat dan cetak nota</button>'+(!o.cx&&o.st<4?'<button class="go d" id="ocx" style="margin-top:8px">Batalkan order</button>':"")+'<button class="go g" data-close="osheet">Tutup</button>';
  openSheet("osheet")}
function cancelO(){var o=O(curO);if(!o||o.cx||o.st>=4)return;if(!arm("cx",$("ocx"),"Tekan lagi untuk membatalkan"))return;
  var p=paid(o);if(p>0)o.pays.push({ts:Date.now(),amt:-p,m:"Tunai",k:"Refund"});o.cx=true;save();board();openDetail(o.id);toast("Order dibatalkan"+(p?", uang muka dikembalikan "+rp(p):""))}

/* bayar */
function payShow(id,adv){var o=O(id);if(!o)return;payO=id;payAdv=adv;payM="Tunai";$("pin").value="";$("ptt").textContent=adv?"Pelunasan saat pengambilan":"Terima pembayaran";
  $("pinfo").innerHTML=line("Order",o.no+" &middot; "+esc(o.cn))+line("Total",rp(o.total))+line("Sudah dibayar",rp(paid(o)))+'<div class="tt" style="margin:6px 0"><span>Sisa</span><span>'+rp(sisa(o))+'</span></div>';
  document.querySelectorAll("#pm button").forEach(function(b){b.classList.toggle("on",b.dataset.pm==="Tunai")});payui();openSheet("psheet")}
function payui(){var o=O(payO),s=sisa(o),v=num($("pin").value);$("pcash").style.display=payM==="Tunai"?"":"none";
  var q=[s,Math.ceil(s/10000)*10000,Math.ceil(s/50000)*50000,100000].filter(function(x,i,a){return x>=s&&a.indexOf(x)===i});$("pq").innerHTML=q.map(function(x){return'<button data-qk="'+x+'">'+(x===s?"Uang pas":rp(x))+'</button>'}).join("");
  var c=$("pchg"),g=$("pgo");if(payM!=="Tunai"){c.textContent="";g.disabled=false;return}
  if(!v){c.textContent="";c.className="chg";g.disabled=true}else if(v<s){c.textContent="Kurang "+rp(s-v);c.className="chg no";g.disabled=true}else{c.textContent="Kembalian "+rp(v-s);c.className="chg ok";g.disabled=false}}
function payDo(){var o=O(payO);if(!o||o.cx)return;var s=sisa(o);if(!s)return;
  if(payM==="Tunai"&&num($("pin").value)<s){toast("Uang diterima kurang",true);return}
  o.pays.push({ts:Date.now(),amt:s,m:payM,k:payAdv?"Pelunasan":"Bayar"});
  if(payAdv){o.st=4;o.hist.push({st:4,ts:Date.now()})}
  save();$("psheet").classList.remove("on");board();
  if(payAdv){closeAll();toast(o.no+" lunas dan sudah diambil")}else{toast("Pembayaran diterima");openDetail(o.id)}}

/* WhatsApp dan nota */
function waOpen(ph,text){window.open("https://wa.me/"+normPh(ph)+"?text="+encodeURIComponent(text),"_blank","noopener")}
function lacakUrl(){return location.href.split("#")[0]+"#/lacak"}
function waReady(o){var s=sisa(o);return"Halo "+o.cn+", cucian Anda dengan nomor "+o.no+" sudah selesai dan siap diambil di "+db.shop+"."+(s?" Sisa pembayaran "+rp(s)+".":" Pembayaran sudah lunas.")+" Terima kasih."}
function waNota(o){var s=sisa(o);return db.shop+"\nNota "+o.no+" ("+dlong(o.ts)+")\nPelanggan: "+o.cn+"\n"+o.items.map(function(i){return(i.t==="kg"?kgs(i.q)+" kg":i.q+" pcs")+" "+i.n+" = "+rp(Math.round(i.q*i.p))}).join("\n")+(o.sur?"\nBiaya kilat: "+rp(o.sur):"")+(o.disc?"\nDiskon: -"+rp(o.disc):"")+"\nTotal: "+rp(o.total)+"\nDibayar: "+rp(paid(o))+(s?"\nSisa: "+rp(s):"\nLunas")+"\nEstimasi selesai: "+dlong(o.due)+"\nLacak order: "+lacakUrl()+" (isi nomor dan telepon)"}
var C39={"0":"nnnwwnwnn","1":"wnnwnnnnw","2":"nnwwnnnnw","3":"wnwwnnnnn","4":"nnnwwnnnw","5":"wnnwwnnnn","6":"nnwwwnnnn","7":"nnnwnnwnw","8":"wnnwnnwnn","9":"nnwwnnwnn","D":"nnnnwwnnw","L":"nnwnnnnww","-":"nwnnnnwnw","*":"nwnnwnwnn"};
function code39(t){var s="*"+t+"*",x=10,r="";for(var i=0;i<s.length;i++){var p=C39[s.charAt(i)];if(!p)continue;for(var j=0;j<9;j++){var w=p.charAt(j)==="w"?3:1;if(j%2===0)r+='<rect x="'+x+'" y="0" width="'+w+'" height="40"/>';x+=w}x+=1}
  return'<svg viewBox="0 0 '+(x+9)+' 40" preserveAspectRatio="none" role="img" aria-label="Kode batang '+esc(t)+'" fill="#000">'+r+'</svg>'}
function nota(o,back){last=o;nback=back||"";var s=sisa(o);$("again").textContent=back==="new"?"Selesai":"Kembali";$("rct").textContent=back==="new"?"Order tersimpan":"Nota "+o.no;$("rc0").textContent=o.no+" · "+fmt(o.ts);
  $("strk").innerHTML='<div class="c"><b>'+esc(db.shop.toUpperCase())+'</b></div><div class="c">'+esc(db.addr)+'</div><div class="c">Telp '+esc(db.phone)+'</div><hr><div class="l"><span>Nota</span><span>'+o.no+'</span></div><div class="l"><span>Tanggal</span><span>'+fmt(o.ts)+'</span></div><div class="l"><span>Pelanggan</span><span>'+esc(o.cn)+'</span></div><hr>'
   +o.items.map(function(i){return'<div>'+esc(i.n)+'</div><div class="l"><span>&nbsp;&nbsp;'+(i.t==="kg"?kgs(i.q)+" kg":i.q+" pcs")+" x "+i.p.toLocaleString("id-ID")+'</span><span>'+rp(Math.round(i.q*i.p))+'</span></div>'}).join("")+'<hr>'
   +((o.sur||o.disc)?'<div class="l"><span>Subtotal</span><span>'+rp(o.sub)+'</span></div>':"")+(o.sur?'<div class="l"><span>Biaya kilat</span><span>'+rp(o.sur)+'</span></div>':"")+(o.disc?'<div class="l"><span>Diskon</span><span>-'+rp(o.disc)+'</span></div>':"")
   +'<div class="l"><b>Total</b><b>'+rp(o.total)+'</b></div><div class="l"><span>Dibayar</span><span>'+rp(paid(o))+'</span></div><div class="l"><b>'+(o.cx?"BATAL":(s?"Sisa":"LUNAS"))+'</b><b>'+(s?rp(s):"")+'</b></div><hr><div class="l"><span>Estimasi selesai</span><span>'+dlong(o.due)+'</span></div>'+(o.ex?'<div class="l"><span>Layanan</span><span>Kilat</span></div>':"")+(o.note?'<div>Catatan: '+esc(o.note)+'</div>':"")
   +code39(o.no)+'<div class="c">'+o.no+'</div><hr><div class="c">Lacak order: buka halaman lacak, isi nomor dan telepon. Nota dibawa saat mengambil cucian.</div>';
  show("rcpt")}

/* order baru */
function newReset(){nf={items:[],ex:false,match:0};$("nph").value="";$("nnm").value="";$("ndv").value="";$("ndu").value="Rp";$("nnote").value="";$("ndp").value="";$("ndm").value="Tunai";$("nsug").innerHTML="";$("nhint").textContent="";newui()}
function newui(){
  $("nsv").innerHTML=db.svc.filter(function(v){return v.on}).map(function(v){return'<button data-sv="'+v.id+'">+ '+esc(v.n)+'<small>'+rp(v.p)+' / '+(v.t==="kg"?"kg":"pcs")+'</small></button>'}).join("")||'<p class="note">Belum ada layanan aktif. Atur di tab Kelola.</p>';
  $("nlines").innerHTML=nf.items.length?nf.items.map(function(it,i){return'<div class="ln"><div><b>'+esc(it.n)+'</b><small>'+rp(it.p)+' / '+(it.t==="kg"?"kg":"pcs")+' = <b id="lt'+i+'">'+rp(Math.round(it.q*it.p))+'</b></small></div><label class="qty"><span class="sr">Jumlah '+esc(it.n)+'</span><input class="inp" data-q="'+i+'" inputmode="decimal" value="'+(it.q?String(it.q).replace(".",","):"")+'" placeholder="0"><i>'+(it.t==="kg"?"kg":"pcs")+'</i></label><button class="x" data-rmv="'+i+'" aria-label="Hapus '+esc(it.n)+'">&times;</button></div>'}).join(""):'<p class="note">Ketuk layanan di atas untuk menambah.</p>';
  Array.prototype.forEach.call($("nspd").children,function(b,i){b.classList.toggle("on",!!i===nf.ex)});nsum()}
function nsum(){var t=calc(nf.items,nf.ex,num($("ndv").value),$("ndu").value,cfg());
  $("nsub").textContent=rp(t.sub);$("nsl").textContent="Biaya kilat "+db.exPct+"%";$("nsx").textContent=rp(t.sur);$("nsr").style.display=nf.ex?"":"none";$("ndd").textContent="-"+rp(t.disc);$("ndr").style.display=t.disc?"":"none";$("ntot").textContent=rp(t.total);
  var dp=num($("ndp").value);$("nrem").textContent=rp(Math.max(0,t.total-dp));
  var d=Date.now()+(nf.ex?db.expD:db.regD)*DAY;$("neta").textContent="Estimasi selesai: "+dlong(d)+(nf.ex?" (kilat, +"+db.exPct+"%)":" (reguler, "+db.regD+" hari)");return t}
function findPh(ph){var n=normPh(ph);if(!n)return null;return db.customers.filter(function(c){return normPh(c.ph)===n})[0]||null}
function ordersOf(c){return db.orders.filter(function(o){return o.cid===c.id&&!o.cx})}
function custHint(){var ph=$("nph").value,nm=$("nnm").value.trim().toLowerCase(),pd=ph.replace(/\D/g,""),c=findPh(ph),h=$("nhint");
  if(c){if(nf.match!==c.id){$("nnm").value=c.n;nf.match=c.id}h.textContent="Pelanggan lama: "+c.n+", "+ordersOf(c).length+" order sebelumnya.";h.className="note ok"}
  else{nf.match=0;h.className="note";h.textContent=pd.length>=8?"Pelanggan baru, akan disimpan saat order disimpan.":"Ketik telepon atau nama untuk mencari pelanggan."}
  var m=[];if(!c&&(pd.length>=3||nm.length>=2))m=db.customers.filter(function(x){return(pd.length>=3&&x.ph.replace(/\D/g,"").indexOf(pd)>-1)||(nm.length>=2&&x.n.toLowerCase().indexOf(nm)>-1)}).slice(0,4);
  $("nsug").innerHTML=m.map(function(x){return'<button data-pick="'+x.id+'"><b>'+esc(x.n)+'</b><small>'+esc(x.ph)+' &middot; '+ordersOf(x).length+' order</small></button>'}).join("")}
function addSv(id){var v=S(id);if(!v)return;var e=nf.items.filter(function(i){return i.sid===id})[0];
  if(e){if(v.t==="pcs"){e.q++;newui()}else{toast("Sudah ada di daftar, ubah beratnya");var i=nf.items.indexOf(e),el=document.querySelector('[data-q="'+i+'"]');if(el)el.focus()}return}
  nf.items.push({sid:v.id,n:v.n,t:v.t,p:v.p,q:v.t==="pcs"?1:0});newui();var el2=document.querySelector('[data-q="'+(nf.items.length-1)+'"]');if(el2&&v.t==="kg")el2.focus()}
function saveOrder(){
  var ph=$("nph").value.trim(),nm=$("nnm").value.trim(),pd=ph.replace(/\D/g,"");
  if(pd.length<8){toast("Isi nomor telepon, minimal 8 angka",true);$("nph").focus();return}
  var c=findPh(ph);if(!c&&!nm){toast("Isi nama pelanggan baru",true);$("nnm").focus();return}
  if(!nf.items.length){toast("Pilih minimal satu layanan",true);return}
  for(var i=0;i<nf.items.length;i++){var it=nf.items[i];
    if(!it.q){toast("Isi jumlah untuk "+it.n,true);var e=document.querySelector('[data-q="'+i+'"]');if(e)e.focus();return}
    if(it.t==="pcs"&&it.q%1){toast(it.n+": jumlah harus bilangan bulat",true);return}
    if(it.q>(it.t==="kg"?100:99)){toast(it.n+": jumlah terlalu besar",true);return}}
  var t=nsum();if(t.total<=0){toast("Total harus lebih dari nol",true);return}
  var dp=num($("ndp").value);if(dp>t.total){toast("Uang muka melebihi total",true);$("ndp").focus();return}
  if(!c){c={id:db.cid++,n:nm,ph:ph,ad:""};db.customers.push(c)}
  var now=Date.now(),o={id:db.oid++,no:orderNo(db.seq++),cid:c.id,cn:c.n,ph:c.ph,items:nf.items.map(function(i){return{sid:i.sid,n:i.n,t:i.t,p:i.p,q:i.q}}),sub:t.sub,sur:t.sur,disc:t.disc,total:t.total,ex:nf.ex,note:$("nnote").value.trim(),ts:now,due:now+(nf.ex?db.expD:db.regD)*DAY,st:0,hist:[{st:0,ts:now}],pays:[],cx:false};
  if(dp)o.pays.push({ts:now,amt:dp,m:$("ndm").value,k:dp>=t.total?"Lunas":"Uang muka"});
  db.orders.push(o);save();newReset();nota(o,"new");toast("Order "+o.no+" tersimpan")}

/* pelanggan */
function custList(){var q=$("cq").value.trim().toLowerCase(),qd=q.replace(/\D/g,"");
  var l=db.customers.filter(function(c){return!q||c.n.toLowerCase().indexOf(q)>-1||(qd.length>=3&&c.ph.replace(/\D/g,"").indexOf(qd)>-1)}).sort(function(a,b){return a.n.localeCompare(b.n)});
  $("clist").innerHTML=l.length?l.map(function(c){var os=ordersOf(c);return'<button class="row" data-cd="'+c.id+'"><div><b>'+esc(c.n)+'</b><br><small>'+esc(c.ph)+' &middot; '+os.length+' order &middot; '+rp(os.reduce(function(a,b){return a+b.total},0))+'</small></div><span style="color:var(--pri);font-weight:800">Lihat</span></button>'}).join(""):'<p class="none">Pelanggan tidak ditemukan.</p>'}
function custDetail(id){var c=C(id);if(!c)return;curC=id;var os=db.orders.filter(function(o){return o.cid===id}).sort(function(a,b){return b.ts-a.ts}),ok=os.filter(function(o){return!o.cx});
  $("cdb").innerHTML='<h3>'+esc(c.n)+'</h3>'+line("Telepon",esc(c.ph))+line("Alamat",esc(c.ad||"-"))+line("Jumlah order",ok.length)+line("Total belanja",rp(ok.reduce(function(a,b){return a+b.total},0)))+line("Order pertama",ok.length?fmt(ok[ok.length-1].ts):"-")
   +'<div class="two" style="margin:10px 0"><button class="go" data-cnew="'+id+'">Order baru</button><button class="go l" data-cedit="'+id+'">Ubah data</button></div><h4 style="margin:6px 0">Riwayat order</h4>'
   +(os.length?os.map(function(o){return'<button class="row" data-o="'+o.id+'"><div><b>'+o.no+'</b>'+badge(o)+'<br><small>'+esc(sum(o))+' &middot; '+fmt(o.ts)+'</small></div><b>'+rp(o.total)+'</b></button>'}).join(""):'<p class="none" style="padding:14px 0">Belum ada order.</p>')+'<button class="go g" data-close="cdsheet">Tutup</button>';
  openSheet("cdsheet")}
function custForm(id){editC=id;var c=id?C(id):{n:"",ph:"",ad:""};$("ctt").textContent=id?"Ubah pelanggan":"Tambah pelanggan";$("cn").value=c.n;$("cp").value=c.ph;$("ca").value=c.ad||"";$("cdel").style.display=id?"":"none";$("cdel").textContent="Hapus pelanggan";openSheet("csheet")}
function custSave(){var n=$("cn").value.trim(),p=$("cp").value.trim(),pd=p.replace(/\D/g,"");
  if(!n){toast("Nama wajib diisi",true);return}if(pd.length<8){toast("Telepon minimal 8 angka",true);return}
  var dup=findPh(p);if(dup&&dup.id!==editC){toast("Telepon sudah dipakai "+dup.n,true);return}
  if(editC){var c=C(editC);c.n=n;c.ph=p;c.ad=$("ca").value.trim();db.orders.forEach(function(o){if(o.cid===c.id){o.cn=c.n;o.ph=c.ph}})}else db.customers.push({id:db.cid++,n:n,ph:p,ad:$("ca").value.trim()});
  save();$("csheet").classList.remove("on");custList();board();if(editC)custDetail(editC);toast("Pelanggan disimpan")}
function custDel(){var c=C(editC);if(!c)return;if(db.orders.some(function(o){return o.cid===c.id})){toast("Pelanggan punya riwayat order, tidak bisa dihapus",true);return}
  if(!arm("cdel",$("cdel"),"Tekan lagi untuk menghapus"))return;db.customers=db.customers.filter(function(x){return x.id!==c.id});save();closeAll();custList();toast("Pelanggan dihapus")}

/* laporan */
function range(){if(rmode==="d"){var p=($("rdt").value||ymd(Date.now())).split("-").map(Number);return[new Date(p[0],p[1]-1,p[2]).getTime(),new Date(p[0],p[1]-1,p[2]+1).getTime()]}
  var m=($("rmo").value||ymd(Date.now()).slice(0,7)).split("-").map(Number);return[new Date(m[0],m[1]-1,1).getTime(),new Date(m[0],m[1],1).getTime()]}
function inR(t,r){return t>=r[0]&&t<r[1]}
function rep(){var r=range(),os=db.orders.filter(function(o){return!o.cx&&inR(o.ts,r)}),kin=0,kout=0,kgt=0,sv={};
  db.orders.forEach(function(o){o.pays.forEach(function(p){if(inR(p.ts,r))kin+=p.amt})});
  var ex=db.exps.filter(function(x){return inR(x.ts,r)}).sort(function(a,b){return b.ts-a.ts});ex.forEach(function(x){kout+=x.amt});
  var rev=os.reduce(function(a,b){return a+b.total},0);
  os.forEach(function(o){o.items.forEach(function(i){var k=sv[i.n]||(sv[i.n]={q:0,t:i.t,rev:0});k.q+=i.q;k.rev+=Math.round(i.q*i.p);if(i.t==="kg")kgt+=i.q})});
  $("r1").textContent=rp(rev);$("r2").textContent=os.length;$("r3").textContent=rp(kin);$("r4").textContent=rp(kout);$("r5").textContent=rp(kin-kout);$("r6").textContent=kgs(kgt)+" kg";
  var bars=[],mx=1;
  if(rmode==="d"){$("chtt").textContent="Pendapatan per jam";for(var h=8;h<=20;h+=2)bars.push([h,0]);os.forEach(function(o){var h=Math.min(20,Math.max(8,Math.floor(new Date(o.ts).getHours()/2)*2));bars.forEach(function(b){if(b[0]===h)b[1]+=o.total})})}
  else{var d0=new Date(r[0]),nd=new Date(d0.getFullYear(),d0.getMonth()+1,0).getDate();$("chtt").textContent="Pendapatan per hari";for(var i=1;i<=nd;i++)bars.push([i%5===0||i===1?i:"",0]);os.forEach(function(o){bars[new Date(o.ts).getDate()-1][1]+=o.total})}
  bars.forEach(function(b){mx=Math.max(mx,b[1])});$("bars").innerHTML=bars.map(function(b){return'<div title="'+rp(b[1])+'"><i style="height:'+Math.max(3,b[1]/mx*100)+'%"></i>'+b[0]+'</div>'}).join("");
  var ks=Object.keys(sv).sort(function(a,b){return sv[b].rev-sv[a].rev}).slice(0,5);$("rt").innerHTML=ks.length?ks.map(function(k,i){return'<li><span>'+(i+1)+". "+esc(k)+" ("+(sv[k].t==="kg"?kgs(sv[k].q)+" kg":sv[k].q+" pcs")+')</span><b>'+rp(sv[k].rev)+'</b></li>'}).join(""):'<li><span>Belum ada order</span></li>';
  $("xl").innerHTML=ex.length?ex.map(function(x){return'<button class="row" data-ex="'+x.id+'"><div><b>'+esc(x.n)+'</b><br><small>'+fmt(x.ts)+'</small></div><b>'+rp(x.amt)+'</b></button>'}).join(""):'<p class="none" style="padding:14px 0">Belum ada pengeluaran pada periode ini.</p>'}
function doCsv(){var r=range(),q=function(s){s=String(s);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"'},rows=[["ORDER"],["Nomor","Tanggal","Pelanggan","Telepon","Layanan","Kilat","Subtotal","Biaya kilat","Diskon","Total","Dibayar","Status"]];
  db.orders.filter(function(o){return inR(o.ts,r)}).sort(function(a,b){return a.ts-b.ts}).forEach(function(o){rows.push([o.no,new Date(o.ts).toLocaleString("id-ID"),o.cn,o.ph,sum(o),o.ex?"Ya":"Tidak",o.sub,o.sur,o.disc,o.total,paid(o),o.cx?"Batal":ST[o.st]])});
  rows.push([],["PENGELUARAN"],["Tanggal","Keterangan","Jumlah"]);db.exps.filter(function(x){return inR(x.ts,r)}).sort(function(a,b){return a.ts-b.ts}).forEach(function(x){rows.push([new Date(x.ts).toLocaleString("id-ID"),x.n,x.amt])});
  rows.push([],["RINGKASAN"],["Pendapatan",$("r1").textContent],["Kas masuk",$("r3").textContent],["Kas keluar",$("r4").textContent],["Saldo kas",$("r5").textContent]);
  var txt="﻿"+rows.map(function(r){return r.map(function(c){return typeof c==="number"?c:q(c)}).join(",")}).join("\r\n"),b=new Blob([txt],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
  a.href=URL.createObjectURL(b);a.download="laporan-laundry-"+(rmode==="d"?($("rdt").value||ymd(Date.now())):($("rmo").value||ymd(Date.now()).slice(0,7)))+".csv";document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);toast("Laporan diunduh")}
function expForm(id){editX=id;var x=id?db.exps.filter(function(e){return e.id===id})[0]:{ts:Date.now(),n:"",amt:""};$("xtt").textContent=id?"Ubah pengeluaran":"Catat pengeluaran";
  $("xd").value=id?ymd(x.ts):(rmode==="d"?($("rdt").value||ymd(Date.now())):ymd(Date.now()));$("xn").value=x.n;$("xa").value=x.amt;$("xdel").style.display=id?"":"none";$("xdel").textContent="Hapus pengeluaran";openSheet("xsheet")}
function expSave(){var n=$("xn").value.trim(),a=num($("xa").value),d=$("xd").value;if(!d){toast("Tanggal wajib diisi",true);return}if(!n){toast("Keterangan wajib diisi",true);return}if(!a){toast("Jumlah wajib diisi",true);return}
  var p=d.split("-").map(Number),ts=ymd(Date.now())===d?Date.now():new Date(p[0],p[1]-1,p[2],12).getTime();
  if(editX){var x=db.exps.filter(function(e){return e.id===editX})[0];if(ymd(x.ts)!==d)x.ts=ts;x.n=n;x.amt=a}else db.exps.push({id:db.xid++,ts:ts,n:n,amt:a});
  save();$("xsheet").classList.remove("on");rep();toast("Pengeluaran disimpan")}
function expDel(){if(!arm("xdel",$("xdel"),"Tekan lagi untuk menghapus"))return;db.exps=db.exps.filter(function(e){return e.id!==editX});save();$("xsheet").classList.remove("on");rep();toast("Pengeluaran dihapus")}

/* layanan dan pengaturan */
function svcList(){var kg=db.svc.filter(function(v){return v.on&&v.t==="kg"}),pc=db.svc.filter(function(v){return v.on&&v.t!=="kg"}),mn=function(L){return L.length?"mulai "+rp(Math.min.apply(null,L.map(function(v){return v.p}))):"belum ada"};
  $("svc3").innerHTML='<div class="sv"><img src="img/handuk.jpg" alt="Pakaian terlipat rapi" width="400" height="300" loading="lazy"><div><b>Kiloan</b><small>'+kg.length+' layanan, '+mn(kg)+'/kg</small></div></div><div class="sv"><img src="img/gantungan.jpg" alt="Gantungan baju" width="400" height="300" loading="lazy"><div><b>Satuan</b><small>'+pc.length+' layanan, '+mn(pc)+'</small></div></div><div class="sv"><img src="img/setrika.jpg" alt="Setrika uap" width="400" height="300" loading="lazy"><div><b>Kilat</b><small>+'+db.exPct+'%, selesai '+db.expD+' hari</small></div></div>';
  $("vlist").innerHTML=db.svc.map(function(v){return'<button class="row '+(v.on?"":"off")+'" data-vd="'+v.id+'"><span class="rl"><img class="th" src="img/'+(v.t==="kg"?"handuk":"gantungan")+'.jpg" alt="" width="48" height="48" loading="lazy"><span><b>'+esc(v.n)+'</b>'+(v.on?"":' <span class="bg s4">Nonaktif</span>')+'<br><small>'+(v.t==="kg"?"Kiloan":"Satuan")+' &middot; '+rp(v.p)+' / '+(v.t==="kg"?"kg":"pcs")+'</small></span></span><span style="color:var(--pri);font-weight:800">Ubah</span></button>'}).join("")||'<p class="none">Belum ada layanan.</p>'}
function svcForm(id){editV=id;var v=id?S(id):{n:"",t:"kg",p:"",on:1};$("vtt").textContent=id?"Ubah layanan":"Tambah layanan";$("vn").value=v.n;$("vt").value=v.t;$("vp").value=v.p;$("von").checked=!!v.on;$("vdel").style.display=id?"":"none";$("vdel").textContent="Hapus layanan";openSheet("vsheet")}
function svcSave(){var n=$("vn").value.trim(),p=num($("vp").value);if(!n){toast("Nama layanan wajib diisi",true);return}if(!p){toast("Harga wajib diisi",true);return}
  if(db.svc.some(function(x){return x.id!==editV&&x.n.toLowerCase()===n.toLowerCase()})){toast("Nama layanan sudah ada",true);return}
  if(editV){var v=S(editV);v.n=n;v.t=$("vt").value;v.p=p;v.on=$("von").checked?1:0}else db.svc.push({id:db.sid++,n:n,t:$("vt").value,p:p,on:$("von").checked?1:0});
  save();$("vsheet").classList.remove("on");svcList();newui();toast("Layanan disimpan")}
function svcDel(){if(!arm("vdel",$("vdel"),"Tekan lagi untuk menghapus"))return;db.svc=db.svc.filter(function(x){return x.id!==editV});nf.items=nf.items.filter(function(i){return i.sid!==editV});save();$("vsheet").classList.remove("on");svcList();newui();toast("Layanan dihapus")}
function setForm(){$("sn").value=db.shop;$("sa").value=db.addr;$("st").value=db.phone;$("sp").value=db.pin;$("sx").value=db.exPct;$("sr").value=db.regD;$("sk").value=db.expD;$("reset").textContent="Reset data demo";openSheet("ssheet")}
function setSave(){var p=$("sp").value.replace(/\D/g,""),x=num($("sx").value),r=num($("sr").value),k=num($("sk").value);
  if(!$("sn").value.trim()){toast("Nama laundry wajib diisi",true);return}if(p.length!==4){toast("PIN harus 4 angka",true);return}if(x>100){toast("Biaya kilat maksimal 100%",true);return}
  if(r<1||r>14){toast("Hari reguler 1 sampai 14",true);return}if(k<1||k>r){toast("Hari kilat 1 sampai "+r+" (tidak lebih lama dari reguler)",true);return}
  db.shop=$("sn").value.trim();db.addr=$("sa").value.trim();db.phone=$("st").value.trim();db.pin=p;db.exPct=x;db.regD=r;db.expD=k;save();brand();$("ssheet").classList.remove("on");svcList();newui();toast("Pengaturan disimpan")}
function doReset(){if(!arm("reset",$("reset"),"Tekan lagi untuk reset"))return;db=seed();save();brand();closeAll();bst=0;$("oq").value="";newReset();go(tab);toast("Data demo dikembalikan")}

/* lacak */
function trackHint(){var o=db.orders.filter(function(x){return!x.cx&&x.st<4})[0]||db.orders[0];$("tdemo").innerHTML=o?'Contoh demo: nomor '+o.no+', telepon '+esc(o.ph)+'. <button class="chips" style="display:inline;border:0;background:none;color:var(--pri);font-weight:800;text-decoration:underline;min-height:40px" id="tfill" data-n="'+o.no+'" data-p="'+esc(o.ph)+'">Isi otomatis</button>':""}
function trackGo(){var no=$("tno").value.trim().toUpperCase().replace(/\s/g,""),ph=normPh($("tph").value),res=$("tres");if(/^\d{1,4}$/.test(no))no=orderNo(+no);
  if(!no||!ph){res.innerHTML='<p class="note" style="color:var(--bad);font-weight:700">Isi nomor order dan telepon.</p>';return}
  var o=db.orders.filter(function(x){return x.no===no&&normPh(x.ph)===ph})[0];
  if(!o){res.innerHTML='<p class="note" style="color:var(--bad);font-weight:700">Nomor order atau telepon tidak cocok. Periksa nota Anda.</p>';return}
  var s=sisa(o),msg=o.cx?"Order ini dibatalkan.":["Cucian sudah kami terima.","Cucian sedang dicuci.","Cucian sedang disetrika.","Cucian siap diambil di "+db.shop+".","Cucian sudah diambil. Terima kasih."][o.st];
  res.innerHTML='<div class="card"><h4>'+o.no+' '+badge(o)+'</h4><p style="margin:0 0 8px;font-weight:700">'+esc(msg)+'</p>'+(o.cx?"":'<ul class="tl">'+ST.map(function(n,i){var h=o.hist.filter(function(x){return x.st===i})[0];return'<li class="'+(h?"done":"")+'"><i></i>'+n+'<span>'+(h?dlong(h.ts):"")+'</span></li>'}).join("")+'</ul>')
   +line("Pelanggan",esc(o.cn))+line("Cucian",esc(sum(o)))+line(o.st===4?"Selesai":"Estimasi selesai",dlong(o.due))+line("Total",rp(o.total))+line("Sudah dibayar",rp(paid(o)))+line("Sisa",o.cx?"-":(s?rp(s):"Lunas"))+'<p class="note" style="margin-top:8px">Alamat: '+esc(db.addr)+'. Telp '+esc(db.phone)+'.</p></div>'}

/* navigasi */
var TTL=["Papan order","Order baru","Pelanggan","Laporan","Kelola"];
function go(t){tab=t;$("ttl").textContent=TTL[t];[0,1,2,3,4].forEach(function(i){$("v"+i).classList.toggle("on",i===t)});document.querySelectorAll(".tabs button").forEach(function(b,i){b.classList.toggle("on",i===t)});
  if(t===0)board();if(t===1)newui();if(t===2)custList();if(t===3)rep();if(t===4)svcList();document.querySelector(".views").scrollTop=0}
function route(){if(location.hash==="#/lacak"){show("trk");trackHint();$("tres").innerHTML=""}else if($("trk").classList.contains("on"))show(authed?"app":"login")}

document.addEventListener("click",function(e){var t=e.target.closest("button");if(!t)return;var d=t.dataset,id=t.id;
 if(d.k)key(d.k);
 if(d.t!==undefined)go(+d.t);
 if(d.bs!==undefined){bst=+d.bs;$("oq").value="";board()}
 if(d.o){closeAll();openDetail(+d.o)}
 if(d.adv)advance(+d.adv);
 if(d.wa){var o=O(+d.wa);if(o)waOpen(o.ph,waReady(o))}
 if(d.pay)payShow(+d.pay,false);
 if(d.nota){var o2=O(+d.nota);if(o2)nota(o2,"hist")}
 if(id==="ocx")cancelO();
 if(d.pm){payM=d.pm;document.querySelectorAll("#pm button").forEach(function(b){b.classList.toggle("on",b===t)});payui()}
 if(d.qk){$("pin").value=d.qk;payui()}
 if(id==="pgo")payDo();
 if(d.close)$(d.close).classList.remove("on");
 if(id==="out"){authed=false;show("login")}
 if(id==="tolacak"||id==="tolacak2")location.hash="#/lacak";
 if(id==="trkback"){location.hash="#/";route()}
 if(id==="tgo")trackGo();
 if(id==="tfill"){$("tno").value=d.n;$("tph").value=d.p;trackGo()}
 if(d.sv)addSv(+d.sv);
 if(d.rmv!==undefined){nf.items.splice(+d.rmv,1);newui()}
 if(d.spd!==undefined){nf.ex=d.spd==="1";newui()}
 if(d.pick){var c=C(+d.pick);if(c){$("nph").value=c.ph;$("nnm").value=c.n;nf.match=0;custHint()}}
 if(id==="nfull")$("ndp").value=nsum().total||"",nsum();
 if(id==="nsave")saveOrder();
 if(id==="again"){if(nback==="hist"&&last){show("app");go(tab);openDetail(last.id)}else{show("app");go(0)}}
 if(id==="prt")window.print();
 if(id==="wanota"&&last)waOpen(last.ph,waNota(last));
 if(d.cd)custDetail(+d.cd);
 if(id==="cadd")custForm(0);
 if(d.cedit){closeAll();custForm(+d.cedit)}
 if(d.cnew){var c2=C(+d.cnew);if(c2){closeAll();go(1);$("nph").value=c2.ph;nf.match=0;custHint()}}
 if(id==="csave")custSave();if(id==="cdel")custDel();
 if(d.rm){rmode=d.rm;document.querySelectorAll("[data-rm]").forEach(function(b){b.classList.toggle("on",b===t)});$("rdw").style.display=rmode==="d"?"":"none";$("rmw").style.display=rmode==="m"?"":"none";rep()}
 if(id==="csv")doCsv();
 if(id==="xadd")expForm(0);if(d.ex)expForm(+d.ex);if(id==="xsave")expSave();if(id==="xdel")expDel();
 if(id==="vadd")svcForm(0);if(d.vd)svcForm(+d.vd);if(id==="vsave")svcSave();if(id==="vdel")svcDel();
 if(id==="setb")setForm();if(id==="ssave")setSave();if(id==="reset")doReset()});
document.addEventListener("input",function(e){var t=e.target,id=t.id;
 if(t.dataset.q!==undefined){var i=+t.dataset.q,it=nf.items[i];it.q=dec(t.value);var el=$("lt"+i);if(el)el.textContent=rp(Math.round(it.q*it.p));nsum()}
 if(id==="nph"||id==="nnm")custHint();
 if(id==="ndv"||id==="ndp")nsum();
 if(id==="oq")board();if(id==="cq")custList();if(id==="pin")payui();
 if(id==="rdt"||id==="rmo")rep()});
document.addEventListener("change",function(e){if(e.target.id==="ndu")nsum()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){var s=document.querySelectorAll(".sheet.on");if(s.length)s[s.length-1].classList.remove("on")}if(e.key==="Enter"&&(e.target.id==="tno"||e.target.id==="tph"))trackGo()});
window.addEventListener("hashchange",route);
$("rdt").value=ymd(Date.now());$("rmo").value=ymd(Date.now()).slice(0,7);
nf={items:[],ex:false,match:0};brand();pad();newui();route();
