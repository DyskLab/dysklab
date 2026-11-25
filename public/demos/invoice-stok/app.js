/* Invoice & Stok: demo UMKM. Data tersimpan di localStorage, tanpa backend. */
var KEY="invoice-stok.v1",AUTHK="invoice-stok.auth";
var db,TODAY,ui={q:{},lim:{},inv:"semua",mv:"semua",cat:"semua",low:false,rt:"jual",rg:"bulan",rf:"",rto:""},ed=null,armed=null,armT=null,pinIn="",shSave=null,tt=null,lastHash="";
var MON=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
var METHODS=["Transfer bank","Tunai","QRIS","Lainnya"];
var TYPEL={awal:"Stok awal",jual:"Penjualan",beli:"Pembelian",sesuai:"Penyesuaian",batal:"Pembatalan"};
var STL={draf:"Draf",terkirim:"Terkirim",sebagian:"Sebagian",lunas:"Lunas","jatuh tempo":"Jatuh tempo",batal:"Batal"};
var STC={draf:"draf",terkirim:"terkirim",sebagian:"sebagian",lunas:"lunas","jatuh tempo":"jt",batal:"batal"};
var IC={
 home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',inv:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',
 cus:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 010 7M18 14.5c2.2.6 3.5 2.4 3.5 5.5"/>',
 sup:'<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',box:'<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9"/>',
 buy:'<path d="M3 4h3l2.4 11h10.2l2-8H7M10 20h.01M17 20h.01"/>',mov:'<path d="M7 4v14M7 18l-3-3M7 18l3-3M17 20V6M17 6l-3 3M17 6l3 3"/>',
 rep:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>'};
function ico(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>'}
var NAV=[["#/dashboard","Beranda","home"],["#/invoice","Invoice","inv"],["#/customers","Pelanggan","cus"],["#/items","Barang","box"],["#/purchases","Pembelian","buy"],["#/suppliers","Pemasok","sup"],["#/moves","Mutasi stok","mov"],["#/reports","Laporan","rep"],["#/settings","Pengaturan","set"]];

/* util */
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function rp(n){n=Math.round(n||0);return(n<0?"-":"")+"Rp "+String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function nf(n){return String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function num(s){var v=String(s==null?"":s).replace(/[^\d]/g,"");return v?parseInt(v,10):0}
function pad(n,l){n=String(n);while(n.length<l)n="0"+n;return n}
function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1,2)+"-"+pad(d.getDate(),2)}
function pd(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function addDays(s,n){var d=pd(s);d.setDate(d.getDate()+n);return ymd(d)}
function diff(a,b){return Math.round((pd(b)-pd(a))/864e5)}
function fdate(s){if(!s)return"-";var p=s.split("-");return +p[2]+" "+MON[+p[1]-1]+" "+p[0]}
function mkey(off){var d=new Date(+TODAY.slice(0,4),+TODAY.slice(5,7)-1+off,1);return d.getFullYear()+"-"+pad(d.getMonth()+1,2)}
function nid(){return db.seq++}
function by(arr,id){id=Number(id);for(var i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];return null}
function cu(id){return by(db.customers,id)}function su(id){return by(db.suppliers,id)}function it(id){return by(db.items,id)}function iv(id){return by(db.invoices,id)}function po(id){return by(db.purchases,id)}
function lc(s){return String(s||"").toLowerCase()}
function toast(m,bad){var t=$("toast");t.textContent=m;t.className="toast on"+(bad?" bad":"");clearTimeout(tt);tt=setTimeout(function(){t.className="toast"},2600)}

/* kalkulasi */
function calc(v){var sub=0,cost=0;v.lines.forEach(function(l){sub+=l.qty*l.price;if(l.kind==="barang")cost+=l.qty*(l.cost||0)});
 var disc=v.discType==="pct"?Math.round(sub*Math.min(v.discVal||0,100)/100):Math.min(v.discVal||0,sub);var base=sub-disc,tax=Math.round(base*(v.taxPct||0)/100);
 return{sub:sub,disc:disc,base:base,tax:tax,ship:v.ship||0,total:base+tax+(v.ship||0),cost:cost}}
function paid(v){var s=0;v.payments.forEach(function(p){s+=p.amt});return s}
function remain(v){return Math.max(0,calc(v).total-paid(v))}
function stat(v){if(v.status==="batal")return"batal";if(v.status==="draf")return"draf";var t=calc(v).total,p=paid(v);if(p>=t)return"lunas";if(v.due<TODAY)return"jatuh tempo";return p>0?"sebagian":"terkirim"}
function live(v){var s=v.status;return s==="terkirim"}
function bd(s){return '<span class="bd '+STC[s]+'">'+STL[s]+'</span>'}

/* stok */
function move(iid,type,qty,ref,note,date){var t=it(iid);t.stock+=qty;db.moves.push({id:nid(),date:date||TODAY,iid:iid,type:type,qty:qty,bal:t.stock,ref:ref||"",note:note||""})}
function need(v){var m={};v.lines.forEach(function(l){if(l.kind==="barang")m[l.iid]=(m[l.iid]||0)+l.qty});return m}
function sendInv(v,date,force){var n=need(v),k,bad=[],t;for(k in n){t=it(k);if(!t)return"Ada barang di invoice yang sudah dihapus";if(!force&&t.stock<n[k])bad.push(t.name+" (stok "+t.stock+", butuh "+n[k]+")")}
 if(bad.length)return"Stok kurang: "+bad.join(", ");
 v.lines.forEach(function(l){if(l.kind==="barang"){var t=it(l.iid);l.cost=t.buy;move(t.id,"jual",-l.qty,v.no,"",date)}});v.status="terkirim";return null}
function cancelInv(v,date){if(paid(v)>0)return"Hapus pembayaran dulu sebelum membatalkan";
 if(v.status==="terkirim")v.lines.forEach(function(l){if(l.kind==="barang"&&it(l.iid))move(l.iid,"batal",l.qty,v.no,"Invoice dibatalkan",date)});v.status="batal";return null}
function receive(p,date){p.lines.forEach(function(l){var t=it(l.iid);move(t.id,"beli",l.qty,p.no,"",date);t.buy=l.cost})}
function fmtNo(date){var f=db.fmt;return f.prefix+(f.year?"/"+date.slice(0,4):"")+"/"+pad(f.next,f.pad)}
function newInv(e){var no;while(true){no=fmtNo(e.date);var dup=db.invoices.some(function(x){return x.no===no});if(!dup)break;db.fmt.next++}
 var v={id:nid(),no:no,date:e.date,due:e.due,cid:e.cid,lines:e.lines,discType:e.discType||"rp",discVal:e.discVal||0,taxPct:e.taxPct||0,ship:e.ship||0,note:e.note||"",status:"draf",payments:[]};db.fmt.next++;db.invoices.push(v);return v}
function addPay(v,amt,date,method,note){v.payments.push({id:nid(),date:date,amt:amt,method:method,note:note||""})}
function ln(i,q){var t=db.items[i];return{kind:"barang",iid:t.id,name:t.name,unit:t.unit,qty:q,price:t.sell,cost:0}}
function lj(n,q,p){return{kind:"jasa",iid:0,name:n,unit:"jasa",qty:q,price:p,cost:0}}

/* seed deterministik */
function seed(){
 TODAY=ymd(new Date());
 db={v:1,pin:"1234",biz:{name:"Sinar Kemasan Jaya",addr:"Jl. Contoh Raya No. 12, Kota Contoh",phone:"0812-0000-0100",email:"halo@sinarkemasan.example",bank:"Bank Contoh 000-000-0000 a.n. Sinar Kemasan Jaya",foot:"Terima kasih atas pesanan Anda."},
  fmt:{prefix:"INV",year:true,pad:4,next:1},tax:11,terms:14,customers:[],suppliers:[],items:[],invoices:[],purchases:[],moves:[],seq:1,pseq:1};
 [["Kopi Rantau Cafe","0812-0000-0101","Jl. Melati No. 4, Kota Contoh"],["Warung Bu Sari","0812-0000-0102","Jl. Kenanga No. 17, Kota Contoh"],["Toko Kue Manis Hati","0812-0000-0103","Jl. Mawar No. 9, Kota Contoh"],["Bakso Pak Darto","0812-0000-0104","Jl. Cempaka No. 21, Kota Contoh"],["CV Karya Mandiri","0812-0000-0105","Kompleks Ruko Contoh Blok C-3"],["Kedai Teh Nusantara","0812-0000-0106","Jl. Anggrek No. 30, Kota Contoh"],["Dapur Nova Catering","0812-0000-0107","Jl. Dahlia No. 8, Kota Contoh"],["Rina Handmade","0812-0000-0108","Jl. Flamboyan No. 2, Kota Contoh"]].forEach(function(c){db.customers.push({id:nid(),name:c[0],phone:c[1],email:"",addr:c[2],note:""})});
 [["PT Plastik Nusa","0812-0000-0201","Kawasan Industri Contoh Blok A"],["UD Kertas Sejahtera","0812-0000-0202","Jl. Pasar Lama No. 5"],["Grosir ATK Lestari","0812-0000-0203","Jl. Niaga No. 11"],["CV Roll Prima","0812-0000-0204","Jl. Industri Kecil No. 7"]].forEach(function(c){db.suppliers.push({id:nid(),name:c[0],phone:c[1],email:"",addr:c[2],note:""})});
 var IT=[["KMS-001","Cup plastik 12oz","pak",14000,18500,42,20,"Kemasan"],["KMS-002","Cup plastik 16oz","pak",16500,21500,12,20,"Kemasan"],["KMS-003","Tutup cup datar","pak",8000,11500,60,25,"Kemasan"],["KMS-004","Sedotan hitam isi 100","pak",6500,9500,8,15,"Kemasan"],["KMS-005","Kantong plastik isi 24","pak",9000,13000,35,10,"Kemasan"],["KMS-006","Box makanan kertas M","pak",22000,29500,18,10,"Kemasan"],["KMS-007","Box makanan kertas L","pak",27500,36000,9,10,"Kemasan"],["KMS-008","Paper bag coklat S","pcs",1100,1800,240,100,"Kemasan"],["KMS-009","Paper bag coklat M","pcs",1600,2600,150,100,"Kemasan"],["KMS-010","Lakban bening 48mm","roll",7500,11000,55,20,"Pengiriman"],["KMS-011","Bubble wrap 50 m","roll",62000,85000,6,5,"Pengiriman"],["KMS-012","Kardus 30x20x20","pcs",3200,5000,120,50,"Pengiriman"],["LBL-001","Stiker label thermal","roll",18000,26000,4,10,"Label"],["LBL-002","Kertas thermal 57mm","roll",4500,7000,90,40,"Label"],["ATK-001","Pulpen hitam","lusin",21000,30000,25,10,"ATK"],["ATK-002","Buku nota 2 ply","pcs",5500,9000,0,10,"ATK"],["ATK-003","Spidol permanen","pcs",3800,6500,48,20,"ATK"]];
 IT.forEach(function(r){db.items.push({id:nid(),sku:r[0],name:r[1],unit:r[2],buy:r[3],sell:r[4],stock:0,min:r[6],cat:r[7],target:r[5]})});
 var P=[[100,0,[[0,40],[1,15],[2,40],[3,20]]],[70,1,[[5,20],[6,15],[7,200]]],[40,3,[[12,10],[13,60]]],[15,0,[[1,10]]],[8,2,[[14,12]]]];
 var V=[[140,0,[[0,20],[2,20]],0,0,0,"f"],[125,1,[[7,100],[8,50]],0,0,0,"f"],[110,2,[[5,10],[6,6]],0,0,0,"f"],[95,4,[[9,24],[10,3],[11,40]],2,0,0,"f"],[80,0,[[0,15],[1,10],[2,25],[3,10]],0,0,0,"f"],[62,6,[[0,10],[13,20]],0,0,0,"f"],[55,3,[[5,8],[7,60]],0,15000,0,"f"],[47,7,[[6,10],[5,6],["j","Jasa desain stiker kemasan",1,350000]],0,0,0,0.6],[38,4,[[11,60],[9,12]],0,0,0,0],[30,1,[[8,40],[7,80]],0,0,0,0.3],[24,0,[[1,10],[0,10]],0,0,0,"f"],[18,5,[[13,30],[12,6],["j","Jasa pasang printer thermal",1,150000]],0,0,0,0],[12,6,[[0,12],[2,12],[3,6]],0,0,0,0.4],[9,2,[[14,3],[16,12],[15,5]],0,0,0,"f"],[6,7,[[5,6],[6,4]],0,20000,0,0],[4,3,[[8,30]],0,0,0,"x"],[2,0,[[1,8],[0,8]],0,0,0,"d"],[0,5,[[10,2]],0,0,0,0]];
 var sold={},bought={};
 P.forEach(function(p){p[2].forEach(function(l){bought[l[0]]=(bought[l[0]]||0)+l[1]})});
 V.forEach(function(v){if(v[6]!=="d"&&v[6]!=="x")v[2].forEach(function(l){if(l[0]!=="j")sold[l[0]]=(sold[l[0]]||0)+l[1]})});
 var ev=[];
 db.items.forEach(function(t,i){t.stock=t.target+(sold[i]||0)-(bought[i]||0);if(t.stock>0)db.moves.push({id:nid(),date:addDays(TODAY,-150),iid:t.id,type:"awal",qty:t.stock,bal:t.stock,ref:"",note:"Stok awal"});delete t.target});
 P.forEach(function(p){ev.push({d:p[0],o:0,f:function(){var dt=addDays(TODAY,-p[0]);var o={id:nid(),no:"PB-"+pad(db.pseq++,4),date:dt,sid:db.suppliers[p[1]].id,lines:p[2].map(function(l){var t=db.items[l[0]];return{iid:t.id,qty:l[1],cost:t.buy}}),note:"",status:"diterima"};db.purchases.push(o);receive(o,dt)}})});
 V.forEach(function(v){ev.push({d:v[0],o:1,f:function(){var dt=addDays(TODAY,-v[0]);var lines=v[2].map(function(l){return l[0]==="j"?lj(l[1],l[2],l[3]):ln(l[0],l[1])});
  var o=newInv({date:dt,due:addDays(dt,14),cid:db.customers[v[1]].id,lines:lines,discType:"pct",discVal:v[3],taxPct:11,ship:v[4],note:""});
  if(v[6]==="d")return;sendInv(o,dt,true);var tot=calc(o).total;
  if(v[6]==="f")addPay(o,tot,addDays(dt,Math.min(5,v[0])),v[1]%2?"Tunai":"Transfer bank");
  else if(typeof v[6]==="number"&&v[6]>0)addPay(o,Math.round(tot*v[6]/1000)*1000,addDays(dt,Math.min(9,v[0])),"QRIS");
  if(v[6]==="x")cancelInv(o,addDays(dt,1))}})});
 ev.sort(function(a,b){return b.d-a.d||a.o-b.o});ev.forEach(function(e){e.f()});
 return db}
function load(){try{var x=JSON.parse(localStorage.getItem(KEY));if(x&&x.v===1&&x.items&&x.invoices&&x.biz){TODAY=ymd(new Date());return x}}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}

/* sheet */
function sheet(title,body,saveLabel,onSave,extra){$("sht").textContent=title;$("shb").innerHTML=body;$("sherr").textContent="";shSave=onSave||null;
 $("shfoot").innerHTML=(extra||"")+'<button type="button" class="btn" data-act="shclose">'+(onSave?"Batal":"Tutup")+'</button>'+(onSave?'<button type="submit" class="btn pri">'+esc(saveLabel||"Simpan")+'</button>':"");
 $("shw").hidden=false;var f=$("shb").querySelector("input,select,textarea");if(f)f.focus();else $("shf").querySelector("button").focus()}
function shClose(){$("shw").hidden=true;shSave=null}
function shErr(m){$("sherr").textContent=m;var f=$("shb").querySelector(".bad");toast(m,true);return false}
function fld(l,id,v,a){return '<label class="fld">'+esc(l)+'<input class="inp" id="'+id+'" value="'+esc(v==null?"":v)+'" '+(a||"")+'></label>'}
function sel(l,id,opts,v,a){return '<label class="fld">'+esc(l)+'<select class="inp" id="'+id+'" '+(a||"")+'>'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(o[0])===String(v)?" selected":"")+'>'+esc(o[1])+'</option>'}).join("")+'</select></label>'}

/* ===== VIEW: dashboard ===== */
function sentInvs(){return db.invoices.filter(function(v){return v.status==="terkirim"})}
function monthSales(k){var s=0;sentInvs().forEach(function(v){if(v.date.slice(0,7)===k)s+=calc(v).total});return s}
function aging(){var b=[0,0,0,0];sentInvs().forEach(function(v){var r=remain(v);if(r<=0)return;var d=diff(v.due,TODAY);b[d<=0?0:d<=30?1:d<=60?2:3]+=r});return b}
function shortRp(n){if(n>=1e6)return(Math.round(n/1e5)/10).toString().replace(".",",")+" jt";if(n>=1e3)return Math.round(n/1e3)+" rb";return String(n)}
function barChart(){var ks=[],i,vals=[],mx=1;for(i=5;i>=0;i--){ks.push(mkey(-i))}vals=ks.map(monthSales);vals.forEach(function(v){if(v>mx)mx=v});
 var W=360,H=170,bw=34,gap=(W-6*bw)/7,s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Omzet 6 bulan terakhir">';
 [0,.5,1].forEach(function(f){var y=130-f*100;s+='<line x1="0" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="#e2e8f0"/>'});
 ks.forEach(function(k,j){var h=Math.round(vals[j]/mx*100),x=gap+j*(bw+gap),cur=j===5;
  s+='<rect x="'+x+'" y="'+(130-h)+'" width="'+bw+'" height="'+Math.max(h,2)+'" rx="5" fill="'+(cur?"#1d4ed8":"#93b0ee")+'"><title>'+MON[+k.slice(5)-1]+" "+k.slice(0,4)+": "+rp(vals[j])+'</title></rect>';
  s+='<text class="v" x="'+(x+bw/2)+'" y="'+(124-h)+'" text-anchor="middle">'+(vals[j]?shortRp(vals[j]):"0")+'</text><text x="'+(x+bw/2)+'" y="150" text-anchor="middle">'+MON[+k.slice(5)-1]+'</text>'});
 return s+"</svg>"}
function vDash(){var open=0,nOpen=0,od=0,nOd=0,low=db.items.filter(function(t){return t.stock<=t.min});
 sentInvs().forEach(function(v){var r=remain(v);if(r>0){open+=r;nOpen++;if(v.due<TODAY){od+=r;nOd++}}});
 var cm=monthSales(mkey(0)),pm=monthSales(mkey(-1)),dl=pm?Math.round((cm-pm)/pm*100):null;
 var due=sentInvs().filter(function(v){return remain(v)>0&&v.due<TODAY}).sort(function(a,b){return a.due<b.due?-1:1}).slice(0,5);
 var ag=aging(),tot=ag[0]+ag[1]+ag[2]+ag[3],cols=["#1d4ed8","#d97706","#ea580c","#b91c1c"],lab=["Belum jatuh tempo","1-30 hari","31-60 hari","Lebih dari 60 hari"];
 var rec=db.invoices.slice().sort(function(a,b){return a.date===b.date?b.id-a.id:a.date<b.date?1:-1}).slice(0,5);
 return '<div class="ph"><div><h1>Beranda</h1><p class="sub">'+esc(db.biz.name)+' &middot; '+fdate(TODAY)+'</p></div><div class="acts"><a class="btn pri" href="#/invoice/new">+ Invoice baru</a></div></div>'+
 '<div class="hero"><img src="img/gudang.jpg" alt="Gudang dengan rak barang dan tumpukan kardus" width="900" height="563"><div><b>'+esc(db.biz.name)+'</b><span>'+db.items.length+' barang &middot; nilai stok '+rp(stockVal())+'</span></div></div>'+
 '<div class="grid4"><button type="button" class="kpi" data-act="goinv" data-f="belum"><small>Piutang</small><b>'+rp(open)+'</b><em>'+nOpen+' invoice belum lunas</em></button>'+
 '<button type="button" class="kpi'+(nOd?" warn":"")+'" data-act="goinv" data-f="jatuh tempo"><small>Jatuh tempo</small><b>'+rp(od)+'</b><em>'+nOd+' invoice terlambat</em></button>'+
 '<a class="kpi" href="#/reports"><small>Omzet bulan ini</small><b>'+rp(cm)+'</b><em>'+(dl===null?"Bulan lalu belum ada":(dl>=0?"+":"")+dl+"% dari bulan lalu")+'</em></a>'+
 '<button type="button" class="kpi'+(low.length?" warn":"")+'" data-act="golow"><small>Stok menipis</small><b>'+low.length+' barang</b><em>Di bawah atau sama dengan minimum</em></button></div>'+
 '<div class="two"><section class="card"><h2>Omzet 6 bulan terakhir</h2>'+barChart()+'</section>'+
 '<section class="card"><h2>Umur piutang</h2>'+(tot?'<div class="age" role="img" aria-label="Komposisi umur piutang">'+ag.map(function(v,i){return v?'<span style="width:'+(v/tot*100)+'%;background:'+cols[i]+'" title="'+lab[i]+": "+rp(v)+'"></span>':""}).join("")+'</div><div class="leg">'+ag.map(function(v,i){return '<span><i style="background:'+cols[i]+'"></i>'+lab[i]+": <b>"+rp(v)+"</b></span>"}).join("")+'</div>':'<p class="mut">Tidak ada piutang. Semua invoice sudah lunas.</p>')+'</section></div>'+
 '<div class="two eq"><section class="card"><h2>Invoice jatuh tempo</h2>'+(due.length?'<ul class="lst">'+due.map(function(v){return '<li><span><a href="#/invoice/'+v.id+'"><b>'+esc(v.no)+'</b></a><small>'+esc(cu(v.cid).name)+" &middot; telat "+diff(v.due,TODAY)+" hari</small></span><span><b>"+rp(remain(v))+'</b></span></li>'}).join("")+'</ul>':'<p class="mut">Tidak ada yang terlambat.</p>')+'</section>'+
 '<section class="card"><h2>Stok menipis</h2>'+(low.length?'<ul class="lst">'+low.slice(0,6).map(function(t){return '<li><span><b>'+esc(t.name)+'</b><small>'+esc(t.sku)+' &middot; minimum '+t.min+' '+esc(t.unit)+'</small></span><span class="bd '+(t.stock<=0?"out":"low")+'">'+(t.stock<=0?"Habis":t.stock+" "+esc(t.unit))+'</span></li>'}).join("")+'</ul><p style="margin:10px 0 0"><a class="btn sm" href="#/purchases/new">Buat pembelian</a></p>':'<p class="mut">Semua stok aman.</p>')+'</section></div>'+
 '<section class="card"><h2>Invoice terbaru</h2>'+(rec.length?'<ul class="lst">'+rec.map(function(v){return '<li><span><a href="#/invoice/'+v.id+'"><b>'+esc(v.no)+'</b></a><small>'+esc(cu(v.cid)?cu(v.cid).name:"-")+" &middot; "+fdate(v.date)+'</small></span><span style="text-align:right"><b>'+rp(calc(v).total)+'</b><br>'+bd(stat(v))+'</span></li>'}).join("")+'</ul>':'<p class="mut">Belum ada invoice.</p>')+'</section>'}

/* ===== VIEW: pihak (pelanggan/pemasok) ===== */
function partyRows(kind){var q=lc(ui.q[kind]),L=db[kind].filter(function(c){return!q||lc(c.name+" "+c.phone+" "+c.addr+" "+c.email).indexOf(q)>=0});
 if(!L.length)return '<div class="none">'+(q?"Tidak ada yang cocok dengan pencarian.":"Belum ada data. Tambahkan lewat tombol di atas.")+'</div>';
 var cus=kind==="customers";
 return '<div class="tw"><table class="t"><thead><tr><th>Nama</th><th>Telepon</th><th>Alamat</th><th class="r">'+(cus?"Piutang":"Total beli")+'</th><th></th></tr></thead><tbody>'+L.map(function(c){
  var m=0,n=0;if(cus)db.invoices.forEach(function(v){if(v.cid===c.id&&v.status==="terkirim"){n++;m+=remain(v)}});else db.purchases.forEach(function(p){if(p.sid===c.id&&p.status==="diterima"){n++;m+=ptot(p)}});
  return '<tr><td class="nl"><b>'+esc(c.name)+'</b>'+(c.email?'<br><small class="mut">'+esc(c.email)+'</small>':"")+'</td><td data-l="Telepon">'+esc(c.phone||"-")+'</td><td data-l="Alamat">'+esc(c.addr||"-")+'</td><td class="r" data-l="'+(cus?"Piutang":"Total beli")+'"><span>'+rp(m)+'<br><small class="mut">'+n+(cus?" invoice aktif":" pembelian")+'</small></span></td><td class="ac">'+
  (cus?'<button class="btn sm" data-act="cinv" data-id="'+c.id+'">Invoice</button>':"")+'<button class="btn sm" data-act="pedit" data-k="'+kind+'" data-id="'+c.id+'">Ubah</button><button class="btn sm bad" data-act="pdel" data-k="'+kind+'" data-id="'+c.id+'" data-arm="1">Hapus</button></td></tr>'}).join("")+'</tbody></table></div>'}
function vParty(kind){var cus=kind==="customers";return '<div class="ph"><div><h1>'+(cus?"Pelanggan":"Pemasok")+'</h1><p class="sub">'+db[kind].length+(cus?" pelanggan":" pemasok")+'</p></div><div class="acts"><button class="btn pri" data-act="pnew" data-k="'+kind+'">+ '+(cus?"Pelanggan":"Pemasok")+'</button></div></div><div class="tools"><input class="inp" type="search" data-q="'+kind+'" value="'+esc(ui.q[kind]||"")+'" placeholder="Cari nama, telepon, alamat" aria-label="Cari"></div><div id="lb">'+partyRows(kind)+'</div>'}
function partyForm(kind,id,after){var c=id?by(db[kind],id):{name:"",phone:"",email:"",addr:"",note:""},cus=kind==="customers";
 sheet((id?"Ubah ":"Tambah ")+(cus?"pelanggan":"pemasok"),fld("Nama *","pn",c.name,'maxlength="60" autocomplete="off"')+'<div class="row2">'+fld("Telepon / WhatsApp","pp",c.phone,'inputmode="tel" maxlength="20"')+fld("Email","pe",c.email,'type="email" maxlength="60"')+'</div><label class="fld">Alamat<textarea class="inp" id="pa" maxlength="160">'+esc(c.addr)+'</textarea></label>'+fld("Catatan","pt",c.note,'maxlength="100"'),"Simpan",function(){
  var n=$("pn").value.trim(),e=$("pe").value.trim();if(!n)return shErr("Nama wajib diisi");if(e&&!/^\S+@\S+\.\S+$/.test(e))return shErr("Format email belum benar");
  if(db[kind].some(function(x){return x.id!==(id||0)&&lc(x.name)===lc(n)}))return shErr("Nama sudah dipakai");
  var o=id?c:{id:nid()};o.name=n;o.phone=$("pp").value.trim();o.email=e;o.addr=$("pa").value.trim();o.note=$("pt").value.trim();if(!id)db[kind].push(o);save();toast("Data tersimpan");shClose();if(after)after(o);else go();return true})}

/* ===== VIEW: barang ===== */
var PH={"KMS-001":"tumbler","KMS-002":"tumbler","KMS-003":"tumbler","KMS-004":"sedotan","KMS-005":"plastik","KMS-008":"bag","KMS-009":"bag","KMS-010":"lakban","KMS-011":"bubble","KMS-012":"kardus","LBL-001":"label","LBL-002":"label","ATK-001":"pulpen","ATK-002":"buku","ATK-003":"spidol"},PHC={"Kemasan":"bag","Pengiriman":"kardus","Label":"label","ATK":"buku"};
function thumb(t){var f=PH[t.sku]||PHC[t.cat];return f?'<img src="img/'+f+'.jpg" alt="Foto '+esc(t.name)+'" width="48" height="48" loading="lazy">':'<span class="ph0" aria-hidden="true">'+esc((t.name||"?").charAt(0).toUpperCase())+'</span>'}
function itemRows(){var q=lc(ui.q.items),L=db.items.filter(function(t){return(ui.cat==="semua"||t.cat===ui.cat)&&(!ui.low||t.stock<=t.min)&&(!q||lc(t.name+" "+t.sku+" "+t.cat).indexOf(q)>=0)});
 if(!L.length)return '<div class="none">Tidak ada barang yang cocok.</div>';
 return '<div class="tw"><table class="t"><thead><tr><th>Barang</th><th>Kategori</th><th class="r">Harga beli</th><th class="r">Harga jual</th><th class="r">Stok</th><th></th></tr></thead><tbody>'+L.map(function(t){
  return '<tr><td class="nl"><div class="pn">'+thumb(t)+'<span><b>'+esc(t.name)+'</b><br><small class="mut">'+esc(t.sku)+' &middot; per '+esc(t.unit)+'</small></span></div></td><td data-l="Kategori">'+esc(t.cat)+'</td><td class="r" data-l="Harga beli">'+rp(t.buy)+'</td><td class="r" data-l="Harga jual">'+rp(t.sell)+'</td><td class="r" data-l="Stok"><span>'+t.stock+" "+esc(t.unit)+' '+(t.stock<=0?'<span class="bd out">Habis</span>':t.stock<=t.min?'<span class="bd low">Menipis</span>':"")+'<br><small class="mut">minimum '+t.min+'</small></span></td><td class="ac"><button class="btn sm" data-act="ihist" data-id="'+t.id+'">Riwayat</button><button class="btn sm" data-act="iedit" data-id="'+t.id+'">Ubah</button><button class="btn sm bad" data-act="idel" data-id="'+t.id+'" data-arm="1">Hapus</button></td></tr>'}).join("")+'</tbody></table></div>'}
function cats(){var m={};db.items.forEach(function(t){m[t.cat]=1});return Object.keys(m).sort()}
function vItems(){return '<div class="ph"><div><h1>Barang</h1><p class="sub">'+db.items.length+' barang &middot; nilai stok '+rp(stockVal())+'</p></div><div class="acts"><button class="btn" data-act="adj">Penyesuaian stok</button><button class="btn pri" data-act="inew">+ Barang</button></div></div>'+
 '<div class="tools"><input class="inp" type="search" data-q="items" value="'+esc(ui.q.items||"")+'" placeholder="Cari nama atau SKU" aria-label="Cari barang"><select class="inp" id="catf" aria-label="Kategori" style="max-width:190px"><option value="semua">Semua kategori</option>'+cats().map(function(c){return '<option'+(ui.cat===c?" selected":"")+'>'+esc(c)+'</option>'}).join("")+'</select><div class="seg"><button type="button" class="'+(ui.low?"on":"")+'" data-act="lowtog" aria-pressed="'+ui.low+'">Stok menipis</button></div></div><div id="lb">'+itemRows()+'</div>'}
function stockVal(){var s=0;db.items.forEach(function(t){s+=Math.max(0,t.stock)*t.buy});return s}
function itemForm(id){var t=id?it(id):{sku:"",name:"",unit:"pcs",buy:0,sell:0,stock:0,min:5,cat:""};
 sheet(id?"Ubah barang":"Tambah barang",'<div class="row2">'+fld("SKU *","is",t.sku,'maxlength="20" autocomplete="off"')+fld("Satuan *","iu",t.unit,'maxlength="10" list="ul"')+'</div><datalist id="ul"><option>pcs<option>pak<option>roll<option>lusin<option>kg<option>box</datalist>'+fld("Nama barang *","in",t.name,'maxlength="60"')+fld("Kategori","ic",t.cat,'maxlength="30" list="cl"')+'<datalist id="cl">'+cats().map(function(c){return '<option>'+esc(c)}).join("")+'</datalist><div class="row2">'+fld("Harga beli (Rp)","ib",t.buy,'inputmode="numeric"')+fld("Harga jual (Rp)","ij",t.sell,'inputmode="numeric"')+'</div><div class="row2">'+(id?'<label class="fld">Stok sekarang<input class="inp" value="'+t.stock+'" disabled><small class="mut">Ubah lewat Penyesuaian stok</small></label>':fld("Stok awal","ist",0,'inputmode="numeric"'))+fld("Stok minimum","im",t.min,'inputmode="numeric"')+'</div>',"Simpan",function(){
  var sku=$("is").value.trim().toUpperCase(),n=$("in").value.trim(),u=$("iu").value.trim();if(!sku||!n||!u)return shErr("SKU, nama, dan satuan wajib diisi");
  if(db.items.some(function(x){return x.id!==(id||0)&&x.sku===sku}))return shErr("SKU sudah dipakai barang lain");
  var b=num($("ib").value),j=num($("ij").value);if(j<=0)return shErr("Harga jual harus lebih dari 0");
  var o=id?t:{id:nid(),stock:0};o.sku=sku;o.name=n;o.unit=u;o.cat=$("ic").value.trim()||"Lainnya";o.buy=b;o.sell=j;o.min=num($("im").value);
  if(!id){db.items.push(o);var s=num($("ist").value);if(s>0)move(o.id,"awal",s,"","Stok awal")}
  save();toast("Barang tersimpan");shClose();go();return true})}
function itemHist(id){var t=it(id),L=db.moves.filter(function(m){return m.iid===id}).reverse();
 sheet(t.name,'<p class="sub" style="margin-bottom:10px">'+esc(t.sku)+' &middot; stok <b>'+t.stock+" "+esc(t.unit)+'</b> &middot; minimum '+t.min+'</p>'+(L.length?'<div class="tw"><table class="t"><thead><tr><th>Tanggal</th><th>Jenis</th><th class="r">Jumlah</th><th class="r">Saldo</th></tr></thead><tbody>'+L.map(function(m){return '<tr><td data-l="Tanggal">'+fdate(m.date)+'</td><td data-l="Jenis">'+TYPEL[m.type]+(m.ref?'<br><small class="mut">'+esc(m.ref)+'</small>':"")+'</td><td class="r '+(m.qty>0?"pos":"neg")+'" data-l="Jumlah">'+(m.qty>0?"+":"")+m.qty+'</td><td class="r" data-l="Saldo">'+m.bal+'</td></tr>'}).join("")+'</tbody></table></div>':'<div class="none">Belum ada mutasi.</div>'),null,null,'<button type="button" class="btn" data-act="adj" data-id="'+id+'">Sesuaikan stok</button>')}
function adjForm(id){if(!db.items.length){toast("Tambahkan barang dulu",true);return}
 var opts=db.items.map(function(t){return[t.id,t.name+" (stok "+t.stock+")"]});
 sheet("Penyesuaian stok",sel("Barang","ai",opts,id||db.items[0].id)+sel("Cara","am",[["set","Stok hasil hitung fisik"],["add","Tambah atau kurangi"]],"set")+fld("Jumlah","aq","",'inputmode="numeric" autocomplete="off"')+'<p class="stk" id="ah">Hasil hitung fisik: isi jumlah stok yang ada di rak.</p>'+sel("Alasan","ar",[["Stok opname","Stok opname"],["Rusak","Rusak"],["Hilang","Hilang"],["Retur","Retur"],["Lainnya","Lainnya"]],"Stok opname")+fld("Catatan","an","",'maxlength="80"'),"Simpan",function(){
  var t=it($("ai").value),m=$("am").value,raw=$("aq").value.trim();if(!/^-?\d+$/.test(raw))return shErr("Isi jumlah dengan angka bulat");var q=parseInt(raw,10);
  var tgt=m==="set"?q:t.stock+q;if(tgt<0)return shErr("Stok tidak boleh kurang dari 0");var d=tgt-t.stock;if(d===0)return shErr("Tidak ada perubahan stok");
  move(t.id,"sesuai",d,$("ar").value,$("an").value.trim());save();toast("Stok "+t.name+" jadi "+t.stock);shClose();go();return true})}

/* ===== VIEW: mutasi ===== */
function moveRows(){var q=lc(ui.q.moves),L=db.moves.filter(function(m){var t=it(m.iid);return(ui.mv==="semua"||m.type===ui.mv)&&(!q||(t&&lc(t.name+" "+t.sku).indexOf(q)>=0)||lc(m.ref).indexOf(q)>=0)}).reverse(),lim=ui.lim.moves||30;
 if(!L.length)return '<div class="none">Belum ada mutasi yang cocok.</div>';
 return '<div class="tw"><table class="t"><thead><tr><th>Tanggal</th><th>Barang</th><th>Jenis</th><th class="r">Jumlah</th><th class="r">Saldo</th></tr></thead><tbody>'+L.slice(0,lim).map(function(m){var t=it(m.iid);return '<tr><td data-l="Tanggal">'+fdate(m.date)+'</td><td class="nl"><b>'+esc(t?t.name:"(dihapus)")+'</b></td><td data-l="Jenis">'+TYPEL[m.type]+(m.ref||m.note?'<br><small class="mut">'+esc([m.ref,m.note].filter(Boolean).join(" - "))+'</small>':"")+'</td><td class="r '+(m.qty>0?"pos":"neg")+'" data-l="Jumlah">'+(m.qty>0?"+":"")+m.qty+'</td><td class="r" data-l="Saldo">'+m.bal+'</td></tr>'}).join("")+'</tbody></table></div>'+(L.length>lim?'<p style="text-align:center"><button class="btn" data-act="more" data-k="moves">Tampilkan lebih banyak ('+(L.length-lim)+')</button></p>':"")}
function vMoves(){return '<div class="ph"><div><h1>Mutasi stok</h1><p class="sub">Semua pergerakan stok, dari yang terbaru</p></div><div class="acts"><button class="btn pri" data-act="adj">Penyesuaian stok</button></div></div><div class="tools"><input class="inp" type="search" data-q="moves" value="'+esc(ui.q.moves||"")+'" placeholder="Cari barang atau nomor" aria-label="Cari mutasi"><div class="seg">'+[["semua","Semua"],["jual","Penjualan"],["beli","Pembelian"],["sesuai","Penyesuaian"],["batal","Pembatalan"]].map(function(s){return '<button type="button" class="'+(ui.mv===s[0]?"on":"")+'" data-act="mvf" data-f="'+s[0]+'">'+s[1]+'</button>'}).join("")+'</div></div><div id="lb">'+moveRows()+'</div>'}

/* ===== VIEW: invoice list ===== */
function invMatch(v,f){var s=stat(v);if(f==="semua")return true;if(f==="belum")return v.status==="terkirim"&&remain(v)>0;return s===f}
function invRows(){var q=lc(ui.q.inv),L=db.invoices.filter(function(v){var c=cu(v.cid);return invMatch(v,ui.inv)&&(!q||lc(v.no+" "+(c?c.name:"")).indexOf(q)>=0)}).sort(function(a,b){return a.date===b.date?b.id-a.id:a.date<b.date?1:-1}),lim=ui.lim.inv||20;
 if(!L.length)return '<div class="none">'+(db.invoices.length?"Tidak ada invoice yang cocok.":"Belum ada invoice. Buat yang pertama.")+'</div>';
 return '<div class="tw"><table class="t"><thead><tr><th>Nomor</th><th>Pelanggan</th><th>Tanggal</th><th>Jatuh tempo</th><th class="r">Total</th><th class="r">Sisa</th><th>Status</th></tr></thead><tbody>'+L.slice(0,lim).map(function(v){var c=cu(v.cid),s=stat(v);
  return '<tr data-go="#/invoice/'+v.id+'"><td class="nl"><a href="#/invoice/'+v.id+'"><b>'+esc(v.no)+'</b></a></td><td data-l="Pelanggan">'+esc(c?c.name:"-")+'</td><td data-l="Tanggal">'+fdate(v.date)+'</td><td data-l="Jatuh tempo">'+fdate(v.due)+'</td><td class="r" data-l="Total">'+rp(calc(v).total)+'</td><td class="r" data-l="Sisa">'+(v.status==="terkirim"?rp(remain(v)):"-")+'</td><td data-l="Status">'+bd(s)+'</td></tr>'}).join("")+'</tbody></table></div>'+(L.length>lim?'<p style="text-align:center"><button class="btn" data-act="more" data-k="inv">Tampilkan lebih banyak ('+(L.length-lim)+')</button></p>':"")}
function vInvs(){var F=[["semua","Semua"],["draf","Draf"],["terkirim","Terkirim"],["sebagian","Sebagian"],["lunas","Lunas"],["jatuh tempo","Jatuh tempo"],["batal","Batal"]];
 return '<div class="ph"><div><h1>Invoice</h1><p class="sub">'+db.invoices.length+' invoice</p></div><div class="acts"><a class="btn pri" href="#/invoice/new">+ Invoice baru</a></div></div><div class="tools"><input class="inp" type="search" data-q="inv" value="'+esc(ui.q.inv||"")+'" placeholder="Cari nomor atau pelanggan" aria-label="Cari invoice"></div><div class="seg" style="margin-bottom:12px">'+F.map(function(s){return '<button type="button" class="'+(ui.inv===s[0]?"on":"")+'" data-act="invf" data-f="'+s[0]+'">'+s[1]+' ('+db.invoices.filter(function(v){return invMatch(v,s[0])}).length+')</button>'}).join("")+'</div><div id="lb">'+invRows()+'</div>'}

/* ===== VIEW: invoice editor ===== */
function newEd(){return{id:0,date:TODAY,due:addDays(TODAY,db.terms),cid:0,lines:[],discType:"rp",discVal:0,taxPct:db.tax,ship:0,note:""}}
function edLine(l,i){var barang=l.kind==="barang",t=barang&&l.iid?it(l.iid):null;
 return '<div class="ln" data-i="'+i+'"><div><label for="lk'+i+'">Jenis</label><select class="inp" id="lk'+i+'" data-f="kind"><option value="barang"'+(barang?" selected":"")+'>Barang</option><option value="jasa"'+(barang?"":" selected")+'>Jasa</option></select></div>'+
 (barang?'<div class="full"><label for="li'+i+'">Barang</label><select class="inp" id="li'+i+'" data-f="iid"><option value="">Pilih barang</option>'+db.items.map(function(x){return '<option value="'+x.id+'"'+(x.id===l.iid?" selected":"")+'>'+esc(x.name+" ("+x.sku+") stok "+x.stock)+'</option>'}).join("")+'</select>'+(t?'<span class="stk'+(t.stock<l.qty?" neg":"")+'">Stok '+t.stock+" "+esc(t.unit)+(t.stock<l.qty?" (kurang)":"")+'</span>':"")+'</div>':
 '<div class="full"><label for="li'+i+'">Deskripsi jasa</label><input class="inp" id="li'+i+'" data-f="name" value="'+esc(l.name)+'" maxlength="80" placeholder="Contoh: Ongkos pasang"></div>')+
 '<div><label for="lq'+i+'">Jumlah</label><input class="inp" id="lq'+i+'" data-f="qty" inputmode="numeric" value="'+l.qty+'"></div><div><label for="lp'+i+'">Harga satuan</label><input class="inp" id="lp'+i+'" data-f="price" inputmode="numeric" value="'+l.price+'"></div>'+
 '<div class="lt full"><span class="mut">Jumlah</span><span id="lt'+i+'">'+rp(l.qty*l.price)+'</span></div><div><button type="button" class="ib" data-act="rmline" data-i="'+i+'" aria-label="Hapus baris '+(i+1)+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></div></div>'}
function edLinesHtml(){return ed.lines.length?ed.lines.map(edLine).join(""):'<div class="none" style="padding:18px">Belum ada baris. Tambahkan barang atau jasa.</div>'}
function edTot(){var c=calc(ed);return '<div><span>Subtotal</span><span>'+rp(c.sub)+'</span></div><div><span>Diskon</span><span>- '+rp(c.disc)+'</span></div><div><span>Pajak '+ed.taxPct+'%</span><span>'+rp(c.tax)+'</span></div><div><span>Ongkir</span><span>'+rp(c.ship)+'</span></div><div class="g"><span>Total</span><span>'+rp(c.total)+'</span></div>'}
function vEd(){var e=ed,no=e.id?iv(e.id).no:fmtNo(e.date);
 return '<div class="ph"><div><h1>'+(e.id?"Ubah draf ":"Invoice baru")+'</h1><p class="sub">Nomor '+esc(no)+(e.id?"":" (otomatis)")+'</p></div></div>'+
 '<form id="edf" novalidate><section class="card"><div class="row2"><div><label class="fld" for="ec">Pelanggan *</label><div style="display:flex;gap:8px"><select class="inp" id="ec" style="margin:4px 0 0;flex:1;min-width:0"><option value="">Pilih pelanggan</option>'+db.customers.map(function(c){return '<option value="'+c.id+'"'+(c.id===e.cid?" selected":"")+'>'+esc(c.name)+'</option>'}).join("")+'</select><button type="button" class="btn" style="white-space:nowrap;margin-top:4px" data-act="ednewc">+ Baru</button></div></div><div></div></div><div style="height:12px"></div>'+
 '<div class="row3"><label class="fld">Tanggal<input class="inp" type="date" id="ed" value="'+e.date+'"></label><label class="fld">Jatuh tempo<input class="inp" type="date" id="eu" value="'+e.due+'"></label><label class="fld">Termin<select class="inp" id="et"><option value="">Pilih</option><option value="0">Tunai</option><option value="7">7 hari</option><option value="14">14 hari</option><option value="30">30 hari</option><option value="45">45 hari</option></select></label></div></section>'+
 '<section class="card"><h2>Baris invoice</h2><div class="lines" id="edl">'+edLinesHtml()+'</div><div class="tools"><button type="button" class="btn" data-act="addline" data-k="barang">+ Barang</button><button type="button" class="btn" data-act="addline" data-k="jasa">+ Jasa</button></div></section>'+
 '<div class="two eq"><section class="card"><h2>Diskon, pajak, ongkir</h2><div class="row2"><label class="fld">Diskon<input class="inp" id="edv" inputmode="numeric" value="'+e.discVal+'"></label><label class="fld">Jenis diskon<select class="inp" id="edt"><option value="rp"'+(e.discType==="rp"?" selected":"")+'>Rupiah</option><option value="pct"'+(e.discType==="pct"?" selected":"")+'>Persen</option></select></label></div><div class="row2"><label class="fld">Pajak (%)<input class="inp" id="etx" inputmode="numeric" value="'+e.taxPct+'"></label><label class="fld">Ongkir (Rp)<input class="inp" id="esh" inputmode="numeric" value="'+e.ship+'"></label></div><label class="fld">Catatan di invoice<textarea class="inp" id="eno" maxlength="200">'+esc(e.note)+'</textarea></label></section>'+
 '<section class="card"><h2>Ringkasan</h2><div class="tot" id="edtot">'+edTot()+'</div></section></div>'+
 '<div class="ph"><a class="btn" href="'+(e.id?"#/invoice/"+e.id:"#/invoice")+'">Batal</a><div class="acts"><button type="button" class="btn" data-act="edsave" data-send="0">Simpan draf</button><button type="button" class="btn pri" data-act="edsave" data-send="1">Simpan dan kirim</button></div></div></form>'}
function edSync(){ed.cid=Number($("ec").value)||0;ed.date=$("ed").value;ed.due=$("eu").value;ed.discVal=num($("edv").value);ed.discType=$("edt").value;ed.taxPct=Math.min(100,num($("etx").value));ed.ship=num($("esh").value);ed.note=$("eno").value.trim()}
function edSave(send){edSync();var e=ed;
 if(!e.cid)return toast("Pilih pelanggan dulu",true);if(!e.date||!e.due)return toast("Tanggal dan jatuh tempo wajib diisi",true);if(e.due<e.date)return toast("Jatuh tempo tidak boleh sebelum tanggal invoice",true);
 if(!e.lines.length)return toast("Tambahkan minimal satu baris",true);
 for(var i=0;i<e.lines.length;i++){var l=e.lines[i],n=i+1;if(l.kind==="barang"&&!l.iid)return toast("Baris "+n+": pilih barang",true);if(l.kind==="jasa"&&!l.name.trim())return toast("Baris "+n+": isi deskripsi jasa",true);if(!(l.qty>0))return toast("Baris "+n+": jumlah harus lebih dari 0",true);}
 if(e.discType==="pct"&&e.discVal>100)return toast("Diskon persen maksimal 100",true);
 var v;if(e.id){v=iv(e.id);v.date=e.date;v.due=e.due;v.cid=e.cid;v.lines=e.lines;v.discType=e.discType;v.discVal=e.discVal;v.taxPct=e.taxPct;v.ship=e.ship;v.note=e.note}else v=newInv(e);
 if(send){var er=sendInv(v,TODAY);if(er){save();toast(er+". Disimpan sebagai draf.",true);ed=null;location.hash="#/invoice/"+v.id;return}}
 save();toast(send?"Invoice terkirim, stok berkurang":"Draf tersimpan");ed=null;location.hash="#/invoice/"+v.id}
function dupInv(v){var c=JSON.parse(JSON.stringify(v.lines));c.forEach(function(l){l.cost=0;if(l.kind==="barang"&&it(l.iid)){l.name=it(l.iid).name;l.price=it(l.iid).sell}});
 return newInv({date:TODAY,due:addDays(TODAY,db.terms),cid:v.cid,lines:c,discType:v.discType,discVal:v.discVal,taxPct:v.taxPct,ship:v.ship,note:v.note})}

/* ===== VIEW: invoice detail ===== */
function waLink(v,dun){var c=cu(v.cid),ph=(c.phone||"").replace(/\D/g,"");if(ph.charAt(0)==="0")ph="62"+ph.slice(1);var t=calc(v).total,r=remain(v);
 var msg="Halo "+c.name+", "+(dun?"kami mengingatkan invoice ":"berikut invoice ")+v.no+" dari "+db.biz.name+" senilai "+rp(t)+(r<t?", sisa tagihan "+rp(r):"")+", jatuh tempo "+fdate(v.due)+"."+(db.biz.bank?" Pembayaran ke "+db.biz.bank+".":"")+" Terima kasih.";
 return"https://wa.me/"+ph+"?text="+encodeURIComponent(msg)}
function paper(v){var c=cu(v.cid)||{name:"-",addr:"",phone:""},t=calc(v),s=stat(v),p=paid(v),b=db.biz;
 return '<article class="paper" id="paper">'+(s==="lunas"?'<div class="stamp">LUNAS</div>':s==="batal"?'<div class="stamp b">BATAL</div>':"")+
 '<header class="pk"><div><h2>'+esc(b.name)+'</h2><p>'+esc(b.addr)+'<br>'+esc(b.phone)+(b.email?" &middot; "+esc(b.email):"")+'</p></div><div class="pt"><h3>INVOICE</h3><p><b>'+esc(v.no)+'</b></p></div></header>'+
 '<div class="pm"><div><h4>Ditagih kepada</h4><p><b>'+esc(c.name)+'</b></p><p>'+esc(c.addr)+'</p><p>'+esc(c.phone)+'</p></div><div><h4>Rincian</h4><p>Tanggal: '+fdate(v.date)+'</p><p>Jatuh tempo: '+fdate(v.due)+'</p><p>Status: '+STL[s]+'</p></div></div>'+
 '<table class="pl"><thead><tr><th>Deskripsi</th><th class="r hs">Jumlah</th><th class="r hs">Harga</th><th class="r">Total</th></tr></thead><tbody>'+v.lines.map(function(l){return '<tr><td>'+esc(l.name)+'<small class="ms">'+l.qty+" "+esc(l.unit)+" x "+rp(l.price)+'</small></td><td class="r hs">'+l.qty+" "+esc(l.unit)+'</td><td class="r hs">'+rp(l.price)+'</td><td class="r">'+rp(l.qty*l.price)+'</td></tr>'}).join("")+'</tbody></table>'+
 '<div class="tot" style="margin-top:12px"><div><span>Subtotal</span><span>'+rp(t.sub)+'</span></div>'+(t.disc?'<div><span>Diskon'+(v.discType==="pct"?" "+v.discVal+"%":"")+'</span><span>- '+rp(t.disc)+'</span></div>':"")+(v.taxPct?'<div><span>Pajak '+v.taxPct+'%</span><span>'+rp(t.tax)+'</span></div>':"")+(t.ship?'<div><span>Ongkir</span><span>'+rp(t.ship)+'</span></div>':"")+'<div class="g"><span>Total</span><span>'+rp(t.total)+'</span></div>'+(p?'<div><span>Dibayar</span><span>- '+rp(p)+'</span></div><div><b>Sisa tagihan</b><b>'+rp(Math.max(0,t.total-p))+'</b></div>':"")+'</div>'+
 '<div class="pf">'+(v.note?'<p><b>Catatan:</b> '+esc(v.note)+'</p>':"")+(b.bank?'<p><b>Pembayaran:</b> '+esc(b.bank)+'</p>':"")+(b.foot?'<p>'+esc(b.foot)+'</p>':"")+'</div></article>'}
function vInv(id){var v=iv(id);if(!v)return '<div class="none">Invoice tidak ditemukan. <a href="#/invoice">Kembali ke daftar</a></div>';var s=stat(v),sent=v.status==="terkirim",r=remain(v);
 return '<div class="ph noprint"><div><h1>'+esc(v.no)+' '+bd(s)+'</h1><p class="sub">'+esc(cu(v.cid)?cu(v.cid).name:"-")+'</p></div><div class="acts">'+
 (v.status==="draf"?'<button class="btn pri" data-act="isend" data-id="'+v.id+'">Kirim (kurangi stok)</button><a class="btn" href="#/invoice/'+v.id+'/edit">Ubah</a>':"")+
 (sent&&r>0?'<button class="btn pri" data-act="ipay" data-id="'+v.id+'">Catat pembayaran</button>':"")+
 '<button class="btn" data-act="iprint">Cetak / simpan PDF</button><a class="btn" data-act="iwa" data-id="'+v.id+'" href="'+esc(waLink(v,false))+'" target="_blank" rel="noopener">WhatsApp</a>'+
 (sent&&r>0&&v.due<TODAY?'<a class="btn" data-act="iwa" data-id="'+v.id+'" href="'+esc(waLink(v,true))+'" target="_blank" rel="noopener">Tagih via WA</a>':"")+
 '<button class="btn" data-act="idup" data-id="'+v.id+'">Duplikat</button>'+
 (v.status!=="batal"?'<button class="btn bad" data-act="icancel" data-id="'+v.id+'" data-arm="1">Batalkan</button>':"")+
 (v.status==="draf"||v.status==="batal"?'<button class="btn bad" data-act="idel" data-id="'+v.id+'" data-arm="1">Hapus</button>':"")+'</div></div>'+
 paper(v)+
 (v.status==="terkirim"||v.payments.length?'<section class="card noprint"><h2>Pembayaran</h2>'+(v.payments.length?v.payments.map(function(p){return '<div class="pay"><span><b>'+rp(p.amt)+'</b> &middot; '+esc(p.method)+'<br><small class="mut">'+fdate(p.date)+(p.note?" - "+esc(p.note):"")+'</small></span><button class="btn sm bad" data-act="pdelpay" data-id="'+v.id+'" data-p="'+p.id+'" data-arm="1">Hapus</button></div>'}).join(""):'<p class="mut">Belum ada pembayaran.</p>')+'</section>':"")}
function payForm(id){var v=iv(id),r=remain(v);
 sheet("Catat pembayaran",'<p class="sub" style="margin-bottom:10px">'+esc(v.no)+' &middot; sisa tagihan <b>'+rp(r)+'</b></p>'+fld("Jumlah dibayar (Rp) *","pa",r,'inputmode="numeric"')+'<div class="seg" style="margin-bottom:12px"><button type="button" data-act="payfull" data-v="'+r+'">Lunasi</button><button type="button" data-act="payfull" data-v="'+Math.round(r/2)+'">Setengah</button></div><div class="row2">'+fld("Tanggal","pdt",TODAY,'type="date" max="'+TODAY+'"')+sel("Metode","pm",METHODS.map(function(m){return[m,m]}),"Transfer bank")+'</div>'+fld("Catatan","pn","",'maxlength="80"'),"Simpan pembayaran",function(){
  var a=num($("pa").value),d=$("pdt").value;if(a<=0)return shErr("Jumlah harus lebih dari 0");if(a>r)return shErr("Jumlah melebihi sisa tagihan ("+rp(r)+")");if(!d)return shErr("Tanggal wajib diisi");if(d<v.date)return shErr("Tanggal bayar tidak boleh sebelum tanggal invoice");
  addPay(v,a,d,$("pm").value,$("pn").value.trim());save();toast(remain(v)?"Pembayaran dicatat":"Invoice lunas");shClose();go();return true})}

/* ===== VIEW: pembelian ===== */
var pe=null;
function ptot(p){var s=0;p.lines.forEach(function(l){s+=l.qty*l.cost});return s}
function vPurch(){var L=db.purchases.slice().reverse();
 return '<div class="ph"><div><h1>Pembelian</h1><p class="sub">Pembelian ke pemasok menambah stok</p></div><div class="acts"><a class="btn pri" href="#/purchases/new">+ Pembelian</a></div></div>'+(L.length?'<div class="tw"><table class="t"><thead><tr><th>Nomor</th><th>Pemasok</th><th>Tanggal</th><th class="r">Total</th><th>Status</th><th></th></tr></thead><tbody>'+L.map(function(p){var s=su(p.sid);
  return '<tr><td class="nl"><b>'+esc(p.no)+'</b></td><td data-l="Pemasok">'+esc(s?s.name:"-")+'</td><td data-l="Tanggal">'+fdate(p.date)+'</td><td class="r" data-l="Total">'+rp(ptot(p))+'</td><td data-l="Status"><span class="bd '+(p.status==="diterima"?"ok":"batal")+'">'+(p.status==="diterima"?"Diterima":"Batal")+'</span></td><td class="ac"><button class="btn sm" data-act="pview" data-id="'+p.id+'">Lihat</button></td></tr>'}).join("")+'</tbody></table></div>':'<div class="none">Belum ada pembelian.</div>')}
function pLine(l,i){return '<div class="ln" data-i="'+i+'" style="grid-template-columns:1fr 1fr"><div class="full"><label for="pi'+i+'">Barang</label><select class="inp" id="pi'+i+'" data-f="iid"><option value="">Pilih barang</option>'+db.items.map(function(x){return '<option value="'+x.id+'"'+(x.id===l.iid?" selected":"")+'>'+esc(x.name+" ("+x.sku+") stok "+x.stock)+'</option>'}).join("")+'</select></div><div><label for="pq'+i+'">Jumlah</label><input class="inp" id="pq'+i+'" data-f="qty" inputmode="numeric" value="'+l.qty+'"></div><div><label for="pc'+i+'">Harga beli satuan</label><input class="inp" id="pc'+i+'" data-f="cost" inputmode="numeric" value="'+l.cost+'"></div><div class="lt full"><span class="mut">Jumlah</span><span id="plt'+i+'">'+rp(l.qty*l.cost)+'</span><button type="button" class="ib" data-act="prm" data-i="'+i+'" aria-label="Hapus baris '+(i+1)+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></div></div>'}
function pLinesHtml(){return pe.lines.length?pe.lines.map(pLine).join(""):'<div class="none" style="padding:18px">Belum ada baris. Tambahkan barang.</div>'}
function pTotHtml(){var s=0;pe.lines.forEach(function(l){s+=l.qty*l.cost});return '<div class="g"><span>Total pembelian</span><span>'+rp(s)+'</span></div>'}
function vPNew(){return '<div class="ph"><div><h1>Pembelian baru</h1><p class="sub">Stok bertambah saat disimpan</p></div></div><form id="pef" novalidate><section class="card"><div class="row2"><label class="fld">Pemasok *<select class="inp" id="ps"><option value="">Pilih pemasok</option>'+db.suppliers.map(function(s){return '<option value="'+s.id+'"'+(s.id===pe.sid?" selected":"")+'>'+esc(s.name)+'</option>'}).join("")+'</select></label><label class="fld">Tanggal<input class="inp" type="date" id="pdate" value="'+pe.date+'" max="'+TODAY+'"></label></div><label class="fld">Catatan<input class="inp" id="pnote" maxlength="100" value="'+esc(pe.note)+'"></label></section><section class="card"><h2>Barang dibeli</h2><div class="lines" id="pl">'+pLinesHtml()+'</div><button type="button" class="btn" data-act="padd">+ Barang</button><div class="tot" id="ptot" style="margin-top:12px">'+pTotHtml()+'</div></section><div class="ph"><a class="btn" href="#/purchases">Batal</a><div class="acts"><button type="button" class="btn pri" data-act="psave">Simpan dan tambah stok</button></div></div></form>'}
function pSave(){pe.sid=Number($("ps").value)||0;pe.date=$("pdate").value;pe.note=$("pnote").value.trim();
 if(!pe.sid)return toast("Pilih pemasok dulu",true);if(!pe.date)return toast("Tanggal wajib diisi",true);if(pe.date>TODAY)return toast("Tanggal tidak boleh di masa depan",true);if(!pe.lines.length)return toast("Tambahkan minimal satu barang",true);
 for(var i=0;i<pe.lines.length;i++){var l=pe.lines[i];if(!l.iid)return toast("Baris "+(i+1)+": pilih barang",true);if(!(l.qty>0))return toast("Baris "+(i+1)+": jumlah harus lebih dari 0",true)}
 var o={id:nid(),no:"PB-"+pad(db.pseq++,4),date:pe.date,sid:pe.sid,lines:pe.lines.map(function(l){return{iid:l.iid,qty:l.qty,cost:l.cost}}),note:pe.note,status:"diterima"};db.purchases.push(o);receive(o,o.date);save();pe=null;toast("Pembelian disimpan, stok bertambah");location.hash="#/purchases"}
function pView(id){var p=po(id),s=su(p.sid);
 sheet(p.no,'<p class="sub" style="margin-bottom:10px">'+esc(s?s.name:"-")+' &middot; '+fdate(p.date)+(p.note?" &middot; "+esc(p.note):"")+'</p><ul class="lst">'+p.lines.map(function(l){var t=it(l.iid);return '<li><span><b>'+esc(t?t.name:"(dihapus)")+'</b><small>'+l.qty+" x "+rp(l.cost)+'</small></span><b>'+rp(l.qty*l.cost)+'</b></li>'}).join("")+'</ul><div class="tot"><div class="g"><span>Total</span><span>'+rp(ptot(p))+'</span></div></div>',null,null,p.status==="diterima"?'<button type="button" class="btn bad" data-act="pcancel" data-id="'+p.id+'" data-arm="1">Batalkan pembelian</button>':"")}

/* ===== VIEW: laporan ===== */
function rng(){if(!ui.rf)ui.rf=mkey(-2)+"-01";if(!ui.rto)ui.rto=TODAY}
function inRng(d){return d>=ui.rf&&d<=ui.rto}
function rSales(){var L=sentInvs().filter(function(v){return inRng(v.date)}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:a.id-b.id}),tot=0,pd2=0,g={},ks=[];
 L.forEach(function(v){var t=calc(v).total;tot+=t;pd2+=Math.min(paid(v),t);var k=ui.rg==="hari"?v.date:v.date.slice(0,7);if(!g[k]){g[k]={n:0,t:0};ks.push(k)}g[k].n++;g[k].t+=t});
 var rows=[["Nomor","Tanggal","Pelanggan","Total","Dibayar","Sisa"]].concat(L.map(function(v){return[v.no,v.date,cu(v.cid)?cu(v.cid).name:"",calc(v).total,paid(v),remain(v)]}));
 var html='<div class="grid4"><div class="kpi"><small>Invoice</small><b>'+L.length+'</b></div><div class="kpi"><small>Total penjualan</small><b>'+rp(tot)+'</b></div><div class="kpi"><small>Sudah dibayar</small><b>'+rp(pd2)+'</b></div><div class="kpi"><small>Belum dibayar</small><b>'+rp(tot-pd2)+'</b></div></div>'+
 '<div class="tools"><div class="seg"><button type="button" class="'+(ui.rg==="bulan"?"on":"")+'" data-act="rg" data-f="bulan">Per bulan</button><button type="button" class="'+(ui.rg==="hari"?"on":"")+'" data-act="rg" data-f="hari">Per hari</button></div></div>'+
 (ks.length?'<div class="tw" style="margin-bottom:14px"><table class="t"><thead><tr><th>Periode</th><th class="r">Invoice</th><th class="r">Penjualan</th></tr></thead><tbody>'+ks.map(function(k){return '<tr><td class="nl"><b>'+(ui.rg==="hari"?fdate(k):MON[+k.slice(5)-1]+" "+k.slice(0,4))+'</b></td><td class="r" data-l="Invoice">'+g[k].n+'</td><td class="r" data-l="Penjualan">'+rp(g[k].t)+'</td></tr>'}).join("")+'</tbody><tfoot><tr><td>Total</td><td class="r">'+L.length+'</td><td class="r">'+rp(tot)+'</td></tr></tfoot></table></div>':'<div class="none">Tidak ada penjualan pada periode ini.</div>')+
 (L.length?'<div class="tw"><table class="t"><thead><tr><th>Nomor</th><th>Pelanggan</th><th>Tanggal</th><th class="r">Total</th><th class="r">Dibayar</th></tr></thead><tbody>'+L.map(function(v){return '<tr><td class="nl"><a href="#/invoice/'+v.id+'"><b>'+esc(v.no)+'</b></a></td><td data-l="Pelanggan">'+esc(cu(v.cid)?cu(v.cid).name:"-")+'</td><td data-l="Tanggal">'+fdate(v.date)+'</td><td class="r" data-l="Total">'+rp(calc(v).total)+'</td><td class="r" data-l="Dibayar">'+rp(paid(v))+'</td></tr>'}).join("")+'</tbody></table></div>':"");
 return{html:html,rows:rows,file:"penjualan"}}
function rAr(){var m={},tot=[0,0,0,0];sentInvs().forEach(function(v){var r=remain(v);if(r<=0)return;var d=diff(v.due,TODAY),b=d<=0?0:d<=30?1:d<=60?2:3;if(!m[v.cid])m[v.cid]={n:0,b:[0,0,0,0]};m[v.cid].n++;m[v.cid].b[b]+=r;tot[b]+=r});
 var ids=Object.keys(m).sort(function(a,b){var x=m[a].b.reduce(function(s,v){return s+v},0),y=m[b].b.reduce(function(s,v){return s+v},0);return y-x}),sum=function(b){return b.reduce(function(s,v){return s+v},0)};
 var rows=[["Pelanggan","Invoice","Belum jatuh tempo","1-30 hari","31-60 hari","Lebih dari 60 hari","Total"]].concat(ids.map(function(id){var o=m[id];return[cu(id).name,o.n].concat(o.b,[sum(o.b)])}));rows.push(["Total",""].concat(tot,[sum(tot)]));
 var html=ids.length?'<div class="tw"><table class="t"><thead><tr><th>Pelanggan</th><th class="r">Invoice</th><th class="r">Belum jatuh tempo</th><th class="r">1-30 hari</th><th class="r">31-60 hari</th><th class="r">&gt; 60 hari</th><th class="r">Total</th></tr></thead><tbody>'+ids.map(function(id){var o=m[id];return '<tr><td class="nl"><b>'+esc(cu(id).name)+'</b></td><td class="r" data-l="Invoice">'+o.n+'</td>'+o.b.map(function(x,i){return '<td class="r" data-l="'+["Belum jatuh tempo","1-30 hari","31-60 hari","> 60 hari"][i]+'">'+(x?rp(x):"-")+'</td>'}).join("")+'<td class="r" data-l="Total"><b>'+rp(sum(o.b))+'</b></td></tr>'}).join("")+'</tbody><tfoot><tr><td>Total</td><td></td>'+tot.map(function(x){return '<td class="r">'+rp(x)+'</td>'}).join("")+'<td class="r">'+rp(sum(tot))+'</td></tr></tfoot></table></div><p class="sub">Umur dihitung dari tanggal jatuh tempo sampai hari ini.</p>':'<div class="none">Tidak ada piutang.</div>';
 return{html:html,rows:rows,file:"piutang"}}
function rStock(){var tb=0,ts=0,rows=[["SKU","Barang","Kategori","Satuan","Stok","Harga beli","Nilai beli","Harga jual","Nilai jual"]];
 var body=db.items.map(function(t){var q=Math.max(0,t.stock),b=q*t.buy,s=q*t.sell;tb+=b;ts+=s;rows.push([t.sku,t.name,t.cat,t.unit,t.stock,t.buy,b,t.sell,s]);return '<tr><td class="nl"><b>'+esc(t.name)+'</b><br><small class="mut">'+esc(t.sku)+'</small></td><td class="r" data-l="Stok">'+t.stock+" "+esc(t.unit)+'</td><td class="r" data-l="Nilai beli">'+rp(b)+'</td><td class="r" data-l="Nilai jual">'+rp(s)+'</td></tr>'}).join("");rows.push(["","Total","","","","",tb,"",ts]);
 return{html:'<div class="grid4"><div class="kpi"><small>Nilai stok (harga beli)</small><b>'+rp(tb)+'</b></div><div class="kpi"><small>Nilai stok (harga jual)</small><b>'+rp(ts)+'</b></div><div class="kpi"><small>Potensi selisih</small><b>'+rp(ts-tb)+'</b></div><div class="kpi"><small>Jumlah barang</small><b>'+db.items.length+'</b></div></div><div class="tw"><table class="t"><thead><tr><th>Barang</th><th class="r">Stok</th><th class="r">Nilai beli</th><th class="r">Nilai jual</th></tr></thead><tbody>'+body+'</tbody><tfoot><tr><td>Total</td><td></td><td class="r">'+rp(tb)+'</td><td class="r">'+rp(ts)+'</td></tr></tfoot></table></div>',rows:rows,file:"nilai-stok"}}
function rProfit(){var L=sentInvs().filter(function(v){return inRng(v.date)}).sort(function(a,b){return a.date<b.date?-1:1}),tn=0,th=0,rows=[["Nomor","Tanggal","Penjualan bersih","HPP","Laba kotor","Margin %"]];
 var body=L.map(function(v){var c=calc(v),lb=c.base-c.cost,mg=c.base?Math.round(lb/c.base*1000)/10:0;tn+=c.base;th+=c.cost;rows.push([v.no,v.date,c.base,c.cost,lb,mg]);return '<tr><td class="nl"><a href="#/invoice/'+v.id+'"><b>'+esc(v.no)+'</b></a><br><small class="mut">'+fdate(v.date)+'</small></td><td class="r" data-l="Penjualan bersih">'+rp(c.base)+'</td><td class="r" data-l="HPP">'+rp(c.cost)+'</td><td class="r '+(lb>=0?"pos":"neg")+'" data-l="Laba kotor">'+rp(lb)+'</td><td class="r" data-l="Margin">'+mg.toString().replace(".",",")+'%</td></tr>'}).join("");
 var lb=tn-th;rows.push(["Total","",tn,th,lb,tn?Math.round(lb/tn*1000)/10:0]);
 return{html:'<div class="grid4"><div class="kpi"><small>Penjualan bersih</small><b>'+rp(tn)+'</b></div><div class="kpi"><small>HPP</small><b>'+rp(th)+'</b></div><div class="kpi"><small>Laba kotor</small><b>'+rp(lb)+'</b></div><div class="kpi"><small>Margin</small><b>'+(tn?(Math.round(lb/tn*1000)/10).toString().replace(".",","):"0")+'%</b></div></div>'+(L.length?'<div class="tw"><table class="t"><thead><tr><th>Invoice</th><th class="r">Penjualan bersih</th><th class="r">HPP</th><th class="r">Laba kotor</th><th class="r">Margin</th></tr></thead><tbody>'+body+'</tbody></table></div><p class="sub">Penjualan bersih = subtotal dikurangi diskon, tanpa pajak dan ongkir. HPP memakai harga beli saat invoice dikirim. Jasa dianggap tanpa modal.</p>':'<div class="none">Tidak ada penjualan pada periode ini.</div>'),rows:rows,file:"laba-kotor"}}
var lastRep=null;
function vReports(){rng();var T=[["jual","Penjualan"],["piutang","Piutang"],["stok","Nilai stok"],["laba","Laba kotor"]],r=ui.rt==="piutang"?rAr():ui.rt==="stok"?rStock():ui.rt==="laba"?rProfit():rSales();lastRep=r;var dated=ui.rt==="jual"||ui.rt==="laba";
 return '<div class="ph"><div><h1>Laporan</h1><p class="sub">Hanya invoice yang sudah dikirim dan tidak batal</p></div><div class="acts"><button class="btn pri" data-act="csv">Unduh CSV</button></div></div><div class="seg" style="margin-bottom:12px">'+T.map(function(t){return '<button type="button" class="'+(ui.rt===t[0]?"on":"")+'" data-act="rt" data-f="'+t[0]+'">'+t[1]+'</button>'}).join("")+'</div>'+
 (dated?'<div class="row2" style="max-width:420px"><label class="fld">Dari<input class="inp" type="date" id="rf" data-r="rf" value="'+ui.rf+'"></label><label class="fld">Sampai<input class="inp" type="date" id="rto" data-r="rto" value="'+ui.rto+'"></label></div>':"")+'<div id="rb">'+r.html+'</div>'}
function csvText(rows){return"﻿"+rows.map(function(r){return r.map(function(c){c=String(c==null?"":c);if(/^[=+\-@]/.test(c)&&isNaN(c))c="'"+c;return/[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(",")}).join("\r\n")}
function dl(name,rows){var b=new Blob([csvText(rows)],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},800)}

/* ===== VIEW: pengaturan ===== */
function vSet(){var b=db.biz,f=db.fmt;
 return '<div class="ph"><div><h1>Pengaturan</h1><p class="sub">Profil usaha tampil di kop invoice</p></div></div><form id="setf" novalidate><section class="card"><h2>Profil usaha</h2>'+fld("Nama usaha *","sbn",b.name,'maxlength="50"')+'<label class="fld">Alamat<textarea class="inp" id="sba" maxlength="160">'+esc(b.addr)+'</textarea></label><div class="row2">'+fld("Telepon","sbp",b.phone,'maxlength="20"')+fld("Email","sbe",b.email,'maxlength="60"')+'</div><label class="fld">Rekening pembayaran<input class="inp" id="sbb" maxlength="120" value="'+esc(b.bank)+'"></label><label class="fld">Catatan kaki invoice<input class="inp" id="sbf" maxlength="120" value="'+esc(b.foot)+'"></label></section>'+
 '<section class="card"><h2>Nomor invoice</h2><div class="row3">'+fld("Awalan","sfp",f.prefix,'maxlength="8"')+sel("Sertakan tahun","sfy",[["1","Ya"],["0","Tidak"]],f.year?"1":"0")+sel("Jumlah digit","sfd",[[3,"3"],[4,"4"],[5,"5"],[6,"6"]],f.pad)+'</div>'+fld("Nomor berikutnya","sfn",f.next,'inputmode="numeric"')+'<p class="stk">Contoh: <b id="sfx"></b></p></section>'+
 '<section class="card"><h2>Bawaan invoice</h2><div class="row2">'+fld("Pajak default (%)","sxt",db.tax,'inputmode="numeric"')+fld("Termin default (hari)","sxd",db.terms,'inputmode="numeric"')+'</div>'+fld("PIN masuk (4 angka)","spn",db.pin,'inputmode="numeric" maxlength="4"')+'</section><button type="button" class="btn pri" data-act="setsave">Simpan pengaturan</button></form>'+
 '<section class="card" style="margin-top:18px"><h2>Data demo</h2><p class="sub" style="margin-bottom:10px">Mengembalikan semua data ke contoh awal. Invoice, stok, dan pengaturan buatan Anda akan hilang.</p><button class="btn bad" id="resetb" data-act="reset" data-arm="1">Reset data demo</button></section>'}
function setPrev(){var f={prefix:($("sfp").value||"").trim(),year:$("sfy").value==="1",pad:+$("sfd").value,next:num($("sfn").value)||1};$("sfx").textContent=f.prefix+(f.year?"/"+TODAY.slice(0,4):"")+"/"+pad(f.next,f.pad)}
function setSave(){var n=$("sbn").value.trim(),pf=$("sfp").value.trim(),pn=$("spn").value.trim(),tx=num($("sxt").value),dd=num($("sxd").value),nx=num($("sfn").value);
 if(!n)return toast("Nama usaha wajib diisi",true);if(!/^[A-Za-z0-9-]{1,8}$/.test(pf))return toast("Awalan: 1-8 huruf, angka, atau tanda hubung",true);if(nx<1)return toast("Nomor berikutnya minimal 1",true);
 if(tx>100)return toast("Pajak maksimal 100%",true);if(dd>365)return toast("Termin maksimal 365 hari",true);if(!/^\d{4}$/.test(pn))return toast("PIN harus 4 angka",true);
 var b=db.biz;b.name=n;b.addr=$("sba").value.trim();b.phone=$("sbp").value.trim();b.email=$("sbe").value.trim();b.bank=$("sbb").value.trim();b.foot=$("sbf").value.trim();
 db.fmt={prefix:pf,year:$("sfy").value==="1",pad:+$("sfd").value,next:nx};db.tax=tx;db.terms=dd;db.pin=pn;save();toast("Pengaturan tersimpan");$("bname").textContent=n}
function resetAll(){try{localStorage.removeItem(KEY)}catch(e){}seed();save();ed=null;pe=null;ui.q={};ui.inv="semua";ui.cat="semua";ui.low=false;ui.mv="semua";ui.rf="";ui.rto="";armed=null;$("bname").textContent=db.biz.name;location.hash="#/dashboard";go();toast("Data demo dikembalikan")}

/* ===== router ===== */
var TITLES={dashboard:"Beranda",invoice:"Invoice",customers:"Pelanggan",suppliers:"Pemasok",items:"Barang",purchases:"Pembelian",moves:"Mutasi stok",reports:"Laporan",settings:"Pengaturan"};
function go(){var h=location.hash||"#/dashboard",p=h.replace(/^#\//,"").split("/"),sec=p[0]||"dashboard",html="",m=$("main");
 if(!(sec==="invoice"&&(p[1]==="new"||p[2]==="edit")))ed=null;if(!(sec==="purchases"&&p[1]==="new"))pe=null;
 if(sec==="invoice"&&p[1]==="new"){if(!ed||ed.id)ed=newEd();html=vEd()}
 else if(sec==="invoice"&&p[1]&&p[2]==="edit"){var v=iv(p[1]);if(!v||v.status!=="draf"){location.hash="#/invoice/"+p[1];return}if(!ed||ed.id!==v.id)ed={id:v.id,date:v.date,due:v.due,cid:v.cid,lines:JSON.parse(JSON.stringify(v.lines)),discType:v.discType,discVal:v.discVal,taxPct:v.taxPct,ship:v.ship,note:v.note};html=vEd()}
 else if(sec==="invoice"&&p[1])html=vInv(p[1]);else if(sec==="invoice")html=vInvs();
 else if(sec==="customers")html=vParty("customers");else if(sec==="suppliers")html=vParty("suppliers");else if(sec==="items")html=vItems();
 else if(sec==="purchases"&&p[1]==="new"){if(!pe)pe={sid:0,date:TODAY,note:"",lines:[]};html=vPNew()}else if(sec==="purchases")html=vPurch();
 else if(sec==="moves")html=vMoves();else if(sec==="reports")html=vReports();else if(sec==="settings"){html=vSet()}else{sec="dashboard";html=vDash()}
 m.innerHTML=html;$("ttl").textContent=TITLES[sec]||"";if(sec==="settings")setPrev();
 var nv=NAV.map(function(n){return '<a href="'+n[0]+'"'+(n[0]==="#/"+sec?' class="on" aria-current="page"':"")+'>'+ico(n[2])+n[1]+'</a>'}).join("");$("nav").innerHTML=nv;
 var bn=[["#/dashboard","Beranda","home"],["#/invoice","Invoice","inv"],["#/items","Barang","box"],["#/reports","Laporan","rep"]];$("bnav").innerHTML=bn.map(function(n){return '<a href="'+n[0]+'"'+(n[0]==="#/"+sec?' class="on"':"")+'>'+ico(n[2])+n[1]+'</a>'}).join("")+'<button type="button" id="bmenu">'+ico("menu")+'Menu</button>';
 closeSide();if(h!==lastHash){window.scrollTo(0,0);lastHash=h}}
function closeSide(){$("side").classList.remove("on");$("scrim").classList.remove("on")}
function lb(){var s=(location.hash||"").replace(/^#\//,"").split("/")[0],h="";if(s==="customers"||s==="suppliers")h=partyRows(s);else if(s==="items")h=itemRows();else if(s==="moves")h=moveRows();else if(s==="invoice")h=invRows();if($("lb"))$("lb").innerHTML=h}

/* ===== events ===== */
function redrawLines(){$("edl").innerHTML=edLinesHtml();$("edtot").innerHTML=edTot()}
function edField(el){var row=el.closest(".ln"),i=+row.getAttribute("data-i"),l=ed.lines[i],f=el.getAttribute("data-f");
 if(f==="kind"){ed.lines[i]=el.value==="barang"?{kind:"barang",iid:0,name:"",unit:"pcs",qty:l.qty,price:0,cost:0}:{kind:"jasa",iid:0,name:"",unit:"jasa",qty:l.qty,price:0,cost:0};redrawLines();return}
 if(f==="iid"){var t=it(el.value);l.iid=t?t.id:0;if(t){l.name=t.name;l.unit=t.unit;l.price=t.sell}else{l.name="";l.price=0}redrawLines();return}
 if(f==="name")l.name=el.value;else l[f]=num(el.value);var s=$("lt"+i);if(s)s.textContent=rp(l.qty*l.price);edSync();$("edtot").innerHTML=edTot();
 var t2=l.iid&&it(l.iid);if(t2&&f==="qty"){var st=row.querySelector(".stk");if(st){st.className="stk"+(t2.stock<l.qty?" neg":"");st.textContent="Stok "+t2.stock+" "+t2.unit+(t2.stock<l.qty?" (kurang)":"")}}}
function pField(el){var row=el.closest(".ln"),i=+row.getAttribute("data-i"),l=pe.lines[i],f=el.getAttribute("data-f");
 if(f==="iid"){var t=it(el.value);l.iid=t?t.id:0;if(t)l.cost=t.buy;pe.sid=Number($("ps").value)||0;pe.date=$("pdate").value;pe.note=$("pnote").value;$("pl").innerHTML=pLinesHtml();$("ptot").innerHTML=pTotHtml();return}
 l[f]=num(el.value);$("plt"+i).textContent=rp(l.qty*l.cost);$("ptot").innerHTML=pTotHtml()}
function arm(el){var key=el.getAttribute("data-act")+"|"+(el.getAttribute("data-id")||"")+"|"+(el.getAttribute("data-p")||"")+"|"+(el.getAttribute("data-k")||"");
 if(armed&&armed.key===key)return false;disarm();armed={key:key,el:el,txt:el.textContent};el.textContent="Yakin? Tekan lagi";el.classList.add("arm");clearTimeout(armT);armT=setTimeout(disarm,3500);return true}
function disarm(){if(armed&&armed.el){armed.el.textContent=armed.txt;armed.el.classList.remove("arm")}armed=null;clearTimeout(armT)}
document.addEventListener("click",function(e){var el=e.target.closest("[data-act]"),r=e.target.closest("[data-go]");
 if(e.target.id==="bmenu"||e.target.closest("#bmenu")){$("side").classList.add("on");$("scrim").classList.add("on");return}
 if(e.target.id==="scrim"||e.target.id==="shs"){if(e.target.id==="scrim")closeSide();else shClose();return}
 if(!el){if(r&&!e.target.closest("a,button"))location.hash=r.getAttribute("data-go");return}
 var a=el.getAttribute("data-act"),id=Number(el.getAttribute("data-id")),k=el.getAttribute("data-k"),f=el.getAttribute("data-f");
 if(el.hasAttribute("data-arm")){if(arm(el))return;disarm()}
 switch(a){
 case"shclose":shClose();break;
 case"goinv":ui.inv=f;ui.q.inv="";location.hash="#/invoice";go();break;
 case"golow":ui.low=true;ui.cat="semua";ui.q.items="";location.hash="#/items";go();break;
 case"invf":ui.inv=f;ui.lim.inv=0;go();break;
 case"mvf":ui.mv=f;ui.lim.moves=0;go();break;
 case"more":ui.lim[k]=(ui.lim[k]||(k==="inv"?20:30))+30;lb();break;
 case"lowtog":ui.low=!ui.low;go();break;
 case"cinv":ui.inv="semua";ui.q.inv=cu(id).name;location.hash="#/invoice";go();break;
 case"pnew":partyForm(k,0);break;
 case"pedit":partyForm(k,id);break;
 case"pdel":{var used=k==="customers"?db.invoices.some(function(v){return v.cid===id}):db.purchases.some(function(p){return p.sid===id});if(used){toast("Tidak bisa dihapus: sudah dipakai di "+(k==="customers"?"invoice":"pembelian"),true);break}db[k]=db[k].filter(function(x){return x.id!==id});save();toast("Data dihapus");go();break}
 case"inew":itemForm(0);break;
 case"iedit":itemForm(id);break;
 case"ihist":itemHist(id);break;
 case"idel":{if(iv(id)){var v0=iv(id);if(v0.status==="terkirim"){toast("Batalkan invoice dulu",true);break}db.invoices=db.invoices.filter(function(x){return x.id!==id});save();toast("Invoice dihapus");location.hash="#/invoice";break}
  var used2=db.invoices.some(function(v){return v.lines.some(function(l){return l.iid===id})})||db.purchases.some(function(p){return p.lines.some(function(l){return l.iid===id})});if(used2){toast("Tidak bisa dihapus: dipakai di invoice atau pembelian",true);break}db.items=db.items.filter(function(x){return x.id!==id});db.moves=db.moves.filter(function(m){return m.iid!==id});save();toast("Barang dihapus");go();break}
 case"adj":adjForm(id||0);break;
 case"ednewc":edSync();partyForm("customers",0,function(c){ed.cid=c.id;$("main").innerHTML=vEd()});break;
 case"addline":edSync();ed.lines.push(k==="barang"?{kind:"barang",iid:0,name:"",unit:"pcs",qty:1,price:0,cost:0}:{kind:"jasa",iid:0,name:"",unit:"jasa",qty:1,price:0,cost:0});redrawLines();break;
 case"rmline":ed.lines.splice(+el.getAttribute("data-i"),1);redrawLines();break;
 case"edsave":edSave(el.getAttribute("data-send")==="1");break;
 case"isend":{var v1=iv(id),er=sendInv(v1,TODAY);if(er){toast(er,true);break}save();toast("Invoice terkirim, stok berkurang");go();break}
 case"ipay":payForm(id);break;
 case"payfull":$("pa").value=el.getAttribute("data-v");break;
 case"pdelpay":{var v2=iv(id);v2.payments=v2.payments.filter(function(p){return p.id!==Number(el.getAttribute("data-p"))});save();toast("Pembayaran dihapus");go();break}
 case"iprint":window.print();break;
 case"iwa":break;
 case"idup":{var d=dupInv(iv(id));save();toast("Draf duplikat dibuat: "+d.no);location.hash="#/invoice/"+d.id;break}
 case"icancel":{var v3=iv(id),er2=cancelInv(v3,TODAY);if(er2){toast(er2,true);break}save();toast("Invoice dibatalkan, stok dikembalikan");go();break}
 case"padd":pe.sid=Number($("ps").value)||0;pe.date=$("pdate").value;pe.note=$("pnote").value;pe.lines.push({iid:0,qty:1,cost:0});$("pl").innerHTML=pLinesHtml();$("ptot").innerHTML=pTotHtml();break;
 case"prm":pe.lines.splice(+el.getAttribute("data-i"),1);$("pl").innerHTML=pLinesHtml();$("ptot").innerHTML=pTotHtml();break;
 case"psave":pSave();break;
 case"pview":pView(id);break;
 case"pcancel":{var p=po(id),bad=[];p.lines.forEach(function(l){var t=it(l.iid);if(t&&t.stock<l.qty)bad.push(t.name)});if(bad.length){toast("Stok sudah terpakai: "+bad.join(", "),true);break}
  p.lines.forEach(function(l){if(it(l.iid))move(l.iid,"batal",-l.qty,p.no,"Pembelian dibatalkan")});p.status="batal";save();shClose();toast("Pembelian dibatalkan, stok dikurangi");go();break}
 case"rt":ui.rt=f;go();break;
 case"rg":ui.rg=f;go();break;
 case"csv":if(lastRep){dl("laporan-"+lastRep.file+".csv",lastRep.rows);toast("CSV diunduh")}break;
 case"setsave":setSave();break;
 case"reset":resetAll();break}
});
document.addEventListener("input",function(e){var t=e.target;
 if(t.hasAttribute("data-q")){ui.q[t.getAttribute("data-q")]=t.value;ui.lim.inv=0;ui.lim.moves=0;lb();return}
 if(t.tagName==="SELECT")return;
 if(t.closest&&t.closest("#edl")&&t.hasAttribute("data-f")){edField(t);return}
 if(t.closest&&t.closest("#pl")&&t.hasAttribute("data-f")){pField(t);return}
 if(t.closest&&t.closest("#edf")&&ed){edSync();$("edtot").innerHTML=edTot();return}
 if(t.closest&&t.closest("#setf"))setPrev()});
document.addEventListener("change",function(e){var t=e.target;
 if(t.tagName==="SELECT"){
  if(t.closest("#edl")&&t.hasAttribute("data-f")){edField(t);return}
  if(t.closest("#pl")&&t.hasAttribute("data-f")){pField(t);return}
  if(t.id==="et"&&t.value!==""){$("eu").value=addDays($("ed").value||TODAY,+t.value);edSync();return}
  if(t.id==="catf"){ui.cat=t.value;lb();return}
  if(t.closest("#edf")&&ed){edSync();$("edtot").innerHTML=edTot();return}
  if(t.closest("#setf"))setPrev();return}
 if(t.hasAttribute("data-r")){ui[t.getAttribute("data-r")]=t.value;if(ui.rf&&ui.rto&&ui.rf>ui.rto){toast("Tanggal awal setelah tanggal akhir",true);return}go();return}
 if(t.closest&&t.closest("#edf")&&ed){edSync();$("edtot").innerHTML=edTot()}});
$("shf").addEventListener("submit",function(e){e.preventDefault();if(shSave)shSave()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("shw").hidden)shClose();
 if(!$("login").hidden&&/^\d$/.test(e.key))pinKey(e.key);else if(!$("login").hidden&&e.key==="Backspace")pinKey("b")});
window.addEventListener("hashchange",go);
window.addEventListener("pageshow",function(){});

/* login */
function pinKey(k){if(k==="c")pinIn="";else if(k==="b")pinIn=pinIn.slice(0,-1);else if(pinIn.length<4)pinIn+=k;
 var ds=$("dots").children,i;for(i=0;i<4;i++)ds[i].className=i<pinIn.length?"on":"";$("dots").className="dots";
 if(pinIn.length===4){if(pinIn===db.pin){try{sessionStorage.setItem(AUTHK,"1")}catch(e){}pinIn="";enter()}else{$("dots").className="dots err";$("lhint").innerHTML="PIN salah. PIN demo: <b>1234</b>";setTimeout(function(){pinIn="";for(var j=0;j<4;j++)ds[j].className="";$("dots").className="dots"},450)}}}
$("pad").addEventListener("click",function(e){var b=e.target.closest("button");if(b)pinKey(b.getAttribute("data-k"))});
function enter(){$("login").hidden=true;$("app").hidden=false;$("bname").textContent=db.biz.name;if(!location.hash)location.hash="#/dashboard";go()}
$("logout").addEventListener("click",function(){try{sessionStorage.removeItem(AUTHK)}catch(e){}$("app").hidden=true;$("login").hidden=false;pinIn="";for(var i=0;i<4;i++)$("dots").children[i].className="";location.hash=""});
window.addEventListener("error",function(e){window.__errs=(window.__errs||[]);window.__errs.push(e.message)});
db=load();save();
var authed=false;try{authed=sessionStorage.getItem(AUTHK)==="1"}catch(e){}
if(authed)enter();
