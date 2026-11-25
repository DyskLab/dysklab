(function(){"use strict";
var KEY="nola.v1",PIN="1234",ADM="nola.adm";
var COL={"Hitam":"#1c1c1c","Putih":"#f4f4f2","Krem":"#e6dcc8","Navy":"#23324f","Olive":"#6b6f3f","Terakota":"#b9573a","Abu":"#9a9a98","Biru Muda":"#a9c4dc"};
var SIZES=["XS","S","M","L","XL","XXL","28","30","32","34","Satu ukuran"];
var CATS=["Kaos","Kemeja","Outer","Bawahan","Dress","Aksesori"];
var TYPES={kaos:"Kaos",kemeja:"Kemeja",hoodie:"Hoodie",jaket:"Jaket",celana:"Celana",rok:"Rok",dress:"Dress",tas:"Tas"};
var PATS={plain:"Polos",stripe:"Garis",dots:"Titik"};
var BGS=["#efeeea","#e8ebee","#ede7e0","#e9eee9","#efe9ec","#e7e9ef"];
var COURIERS=[{id:"ekspres",n:"Kurir Ekspres (contoh)",eta:"1-2 hari",base:28000},{id:"reguler",n:"Kurir Reguler (contoh)",eta:"3-5 hari",base:15000},{id:"hemat",n:"Kurir Hemat (contoh)",eta:"5-8 hari",base:9000}];
var WALLETS=["DompetKu","PayContoh","KantongPay"];
var PROVS=["DKI Jakarta","Jawa Barat","Jawa Tengah","Jawa Timur","DI Yogyakarta","Banten","Bali","Sumatera Utara","Sulawesi Selatan","Kalimantan Timur"];
var COD_FEE=4000,RET_DAYS=7;
var ST={pending:"Menunggu bayar",paid:"Diproses",packed:"Dikemas",shipped:"Dikirim",done:"Selesai",cancelled:"Dibatalkan"};
var FLOW=["pending","paid","packed","shipped","done"];
var REASONS=["Ukuran tidak sesuai","Barang cacat atau rusak","Warna berbeda dari gambar","Salah kirim barang","Lainnya"];
var MON=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function rp(n){n=Math.round(n)||0;return (n<0?"-":"")+"Rp"+String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function p2(n){return (n<10?"0":"")+n}
function dt(iso,sh){var d=new Date(iso),s=d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear();return sh?s:s+", "+p2(d.getHours())+":"+p2(d.getMinutes())}
function ymd(d){d=new Date(d);return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())}
function nowIso(){return new Date().toISOString()}
function ago(days,h){return new Date(Date.now()-days*864e5-(h||0)*36e5).toISOString()}
function lum(h){var n=parseInt(h.slice(1),16);return .299*(n>>16)+.587*((n>>8)&255)+.114*(n&255)}
function digits(s){return String(s||"").replace(/\D/g,"")}
function fmtHp(s){var d=digits(s);return d.length>8?d.slice(0,4)+"-"+d.slice(4,8)+"-"+d.slice(8):d}
function sortSizes(a){return a.slice().sort(function(x,y){return SIZES.indexOf(x)-SIZES.indexOf(y)})}
var toastT;
function toast(msg,bad,link){var t=$("#toast");t.className=(bad?"bad ":"")+"on";t.innerHTML=esc(msg)+(link?' <a href="'+esc(link[0])+'">'+esc(link[1])+"</a>":"");clearTimeout(toastT);toastT=setTimeout(function(){t.className=""},link?4500:2800)}

/* ---------- foto produk (Wikimedia Commons, lihat credits.json) ---------- */
var SEEDIMG=["kaos-polos","kaos-garis","kaos-titik","kemeja-linen","kemeja-oxford","kemeja-garis","hoodie","jaket","chino","kulot","jogger","rok","dress-midi","dress-garis","tote","selempang"];
var TYPEIMG={kaos:"kaos-polos",kemeja:"kemeja-oxford",hoodie:"hoodie",jaket:"jaket",celana:"chino",rok:"rok",dress:"dress-midi",tas:"tote"};
function photoOf(p){var k=p.id>=1&&p.id<=SEEDIMG.length?SEEDIMG[p.id-1]:TYPEIMG[p.type]||"kaos-polos";return "img/"+k+".jpg"}
var IMGPOS={"kaos-garis":"50% 30%","kaos-polos":"50% 20%","kemeja-linen":"50% 40%","kemeja-garis":"50% 45%","dress-garis":"50% 35%","dress-midi":"50% 40%","jaket":"50% 40%","chino":"50% 40%","rok":"50% 45%","tote":"50% 60%","selempang":"50% 55%"};
var IMGMUL={hoodie:1,jogger:1,"kaos-titik":1,"kemeja-oxford":1,kulot:1};
function imgKey(p){return photoOf(p).slice(4,-4)}
function pArt(p,color){var d=color&&COL[color]?'<span class="cdot" title="Warna: '+esc(color)+'" style="background:'+COL[color]+'"></span>':"",k=imgKey(p),ps=IMGPOS[k];return '<img'+(IMGMUL[k]?' class="mul"':"")+(ps?' style="object-position:'+ps+'"':"")+' src="'+photoOf(p)+'" alt="Foto '+esc(p.name)+'" width="800" height="960" loading="lazy" decoding="async">'+d}

/* ---------- data awal ---------- */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var NAMES=["Ayu","Bima","Citra","Dimas","Eka","Fajar","Gita","Hana","Indra","Joko","Kirana","Lintang","Maya","Naufal","Oka","Putri"],LAST=["Pratama","Lestari","Wijaya","Santoso","Kusuma","Hidayat"];
var RVT=["Bahannya nyaman dan jatuhnya rapi.","Ukuran sesuai panduan, tidak perlu naik size.","Warnanya sesuai gambar. Jahitan rapi.","Cukup tebal, tidak menerawang.","Potongannya bagus dipakai harian.","Pengiriman cepat dan kemasan aman.","Agak besar di bahu, tapi masih enak dipakai.","Setelah dicuci warnanya tetap bagus."];
var SEED_P=[
["Kaos Polos Boxy","Kaos","kaos",129000,0,"Kaos katun combed potongan boxy, kerah rib tebal. Untuk harian.","Katun combed 24s","plain",["S","M","L","XL"],["Putih","Hitam","Krem","Olive"]],
["Kaos Garis Navy","Kaos","kaos",149000,0,"Kaos bergaris dengan bahan lembut dan elastis ringan.","Katun spandeks","stripe",["S","M","L","XL"],["Navy","Putih"]],
["Kaos Titik Relaxed","Kaos","kaos",139000,169000,"Pola titik halus, potongan relaxed. Cocok dipadu celana apa saja.","Katun combed 30s","dots",["S","M","L"],["Krem","Biru Muda","Hitam"]],
["Kemeja Linen Panjang","Kemeja","kemeja",299000,0,"Kemeja linen campuran, adem dan tidak kaku. Kancing depan penuh.","Linen campuran","plain",["S","M","L","XL"],["Krem","Biru Muda","Olive"]],
["Kemeja Oxford","Kemeja","kemeja",279000,0,"Oxford katun klasik, kerah kancing. Rapi untuk kantor maupun santai.","Katun oxford","plain",["S","M","L","XL","XXL"],["Biru Muda","Putih"]],
["Kemeja Garis Tipis","Kemeja","kemeja",289000,329000,"Garis tipis vertikal, bahan poplin ringan.","Katun poplin","stripe",["S","M","L"],["Navy","Putih"]],
["Hoodie Fleece","Outer","hoodie",349000,399000,"Hoodie fleece lembut di dalam, saku kanguru, tali serut.","Katun fleece 280gsm","plain",["S","M","L","XL"],["Hitam","Abu","Terakota"]],
["Jaket Coach","Outer","jaket",379000,0,"Jaket tipis kancing tekan, tahan angin ringan.","Nilon ripstop","plain",["S","M","L","XL"],["Navy","Olive","Hitam"]],
["Celana Chino Slim","Bawahan","celana",329000,0,"Chino slim fit dengan sedikit stretch. Ukuran pinggang dalam angka.","Katun twill stretch","plain",["28","30","32","34"],["Krem","Olive","Hitam"]],
["Celana Kulot Linen","Bawahan","celana",259000,0,"Kulot longgar, pinggang karet belakang.","Linen rayon","plain",["S","M","L"],["Krem","Hitam","Terakota"]],
["Celana Jogger","Bawahan","celana",239000,279000,"Jogger fleece tipis, karet di pergelangan.","Katun fleece","plain",["S","M","L","XL"],["Abu","Hitam"]],
["Rok Plisket","Bawahan","rok",219000,0,"Rok plisket panjang betis, karet pinggang.","Poliester crinkle","plain",["S","M","L"],["Hitam","Terakota","Navy"]],
["Dress Midi Polos","Dress","dress",369000,0,"Dress midi potongan A, resleting belakang.","Rayon twill","plain",["S","M","L"],["Hitam","Terakota","Olive"]],
["Dress Kemeja Garis","Dress","dress",389000,0,"Dress model kemeja dengan tali pinggang.","Katun poplin","stripe",["S","M","L"],["Biru Muda","Putih"]],
["Tote Kanvas","Aksesori","tas",119000,0,"Tote kanvas tebal, tali panjang, satu kantong dalam.","Kanvas 12oz","plain",["Satu ukuran"],["Krem","Hitam"]],
["Tas Selempang","Aksesori","tas",189000,219000,"Tas selempang dua ruang dengan resleting.","Kanvas waterproof","plain",["Satu ukuran"],["Hitam","Olive"]]];
var SEED_PROMO=[
{code:"HEMAT10",type:"pct",value:10,min:300000,max:100000,cat:"",days:60,quota:100},
{code:"GRATISONGKIR",type:"ongkir",value:0,min:250000,max:0,cat:"",days:60,quota:0},
{code:"BARU50",type:"nom",value:50000,min:400000,max:0,cat:"",days:45,quota:50},
{code:"KAOS20",type:"pct",value:20,min:0,max:60000,cat:"Kaos",days:30,quota:30},
{code:"LAWAS",type:"pct",value:15,min:0,max:0,cat:"",days:-10,quota:0}];
function shipCost(c,q){return c.base+2000*Math.max(0,Math.ceil(q/2)-1)}
function seed(){
var r=rng(20260);
var S={v:1,products:[],promos:[],orders:[],cart:{items:[],promo:""},wish:[],profile:null,seq:{order:0,pid:SEED_P.length,promo:SEED_PROMO.length,rv:0},track:null};
SEED_P.forEach(function(a,i){
var p={id:i+1,n:i+1,name:a[0],cat:a[1],type:a[2],price:a[3],was:a[4],desc:a[5],mat:a[6],pat:a[7],sizes:a[8],colors:a[9],stock:{},active:true,bg:BGS[(i+2)%BGS.length],reviews:[]};
a[8].forEach(function(s){a[9].forEach(function(c){var x=Math.floor(r()*11);if(r()<.14)x=0;p.stock[s+"|"+c]=x})});
var nr=Math.floor(r()*5);for(var k=0;k<nr;k++){p.reviews.push({id:++S.seq.rv,name:NAMES[Math.floor(r()*NAMES.length)],rating:3+Math.floor(r()*3),text:RVT[Math.floor(r()*RVT.length)],at:ago(3+Math.floor(r()*60))})}
S.products.push(p)});
S.products[1].stock["M|Navy"]=0;S.products[1].stock["S|Navy"]=0;S.products[1].stock["L|Navy"]=0;S.products[1].stock["XL|Navy"]=0;
S.products[5].stock["M|Navy"]=2;S.products[6].stock["M|Hitam"]=3;S.products[6].stock["L|Hitam"]=8;
SEED_PROMO.forEach(function(a,i){var d=new Date(Date.now()+a.days*864e5);S.promos.push({id:i+1,code:a.code,type:a.type,value:a.value,min:a.min,max:a.max,cat:a.cat,expires:ymd(d),quota:a.quota,used:0,active:true})});
/* pesanan contoh */
var plan=[[0,2,"transfer","shipped"],[0,1,"transfer","pending"],[2,3,"ewallet","done"],[1,4,"cod","packed"],[6,5,"transfer","done"],[6,9,"cod","done"],[7,6,"ewallet","done"],[8,1,"transfer","cancelled"],[9,2,"transfer","done"],[10,4,"cod","done"],[11,3,"transfer","done"],[12,6,"ewallet","done"],[13,2,"transfer","shipped"],[3,5,"cod","done"],[4,7,"transfer","done"],[5,2,"ewallet","paid"],[14,1,"transfer","done"],[2,5,"transfer","packed"]];
plan.forEach(function(pl,i){
var days=pl[0],hrs=pl[1],method=pl[2],status=pl[3],n=1+Math.floor(r()*3),items=[],sub=0,qty=0;
for(var k=0;k<n;k++){var p=S.products[Math.floor(r()*S.products.length)],s=p.sizes[Math.floor(r()*p.sizes.length)],c=p.colors[Math.floor(r()*p.colors.length)],q=1+(r()<.3?1:0);items.push({pid:p.id,name:p.name,size:s,color:c,qty:q,price:p.price,type:p.type,pat:p.pat,bg:p.bg});sub+=p.price*q;qty+=q}
var co=COURIERS[Math.floor(r()*3)],ship=shipCost(co,qty),promo=null,disc=0;
if(sub>=300000&&r()<.35){disc=Math.min(100000,Math.floor(sub*.1));promo={code:"HEMAT10",disc:disc,shipOff:0};S.promos[0].used++}
var cod=method==="cod"?COD_FEE:0,seqn=i+1,uniq=method==="transfer"?101+(seqn*47)%898:0;
var no="NL-"+(260000+seqn),first=NAMES[(i*5+3)%NAMES.length],cust=i===0?["Ayu Contoh","0812-0000-1001"]:i===1?["Bima Contoh","0812-0000-1002"]:i===2?["Citra Contoh","0812-0000-1003"]:[first+" "+LAST[i%LAST.length],"0812-0000-"+(2000+i*37)];
var o={no:no,at:ago(days,hrs),cust:{nama:cust[0],hp:cust[1],email:"",alamat:"Jl. Contoh No. "+(10+i)+", RT 01/02",kota:["Bandung","Jakarta Selatan","Surabaya","Semarang","Yogyakarta"][i%5],prov:["Jawa Barat","DKI Jakarta","Jawa Timur","Jawa Tengah","DI Yogyakarta"][i%5],pos:"40000",catatan:""},items:items,sub:sub,promo:promo,courier:{id:co.id,n:co.n,cost:ship},shipDisc:0,cod:cod,uniq:uniq,total:sub-disc+ship+cod+uniq,pay:{method:method,via:method==="ewallet"?WALLETS[i%3]:""},status:"pending",hist:[],resi:"",returns:[]};
o.cust.pos=String(40000+i*113).slice(0,5);
var chain=method==="cod"?["paid","packed","shipped","done"]:["pending","paid","packed","shipped","done"];
var target=status==="cancelled"?"pending":status,t=new Date(o.at).getTime(),step=0,gap=Math.min(6*36e5,(Date.now()-t)/(chain.length+1));
for(var j=0;j<chain.length;j++){o.hist.push({s:chain[j],at:new Date(t+step*gap).toISOString(),note:j===0&&method==="cod"?"Pesanan COD, bayar saat diterima":""});o.status=chain[j];step++;if(chain[j]===target)break}
if(status==="cancelled"){o.status="cancelled";o.hist.push({s:"cancelled",at:new Date(t+gap).toISOString(),note:"Dibatalkan pembeli"});if(promo){S.promos[0].used--;}}
if(o.hist.some(function(h){return h.s==="shipped"})){o.resi="NLX"+String(7100000000+i*1234567).slice(0,10)}
S.orders.push(o)});
/* retur contoh pada pesanan selesai lama */
var od=S.orders.filter(function(o){return o.status==="done"&&o.no!=="NL-260003"})[1];
if(od)od.returns.push({id:"R1",at:ago(1),items:[{idx:0,qty:1}],reason:"Ukuran tidak sesuai",note:"Terlalu besar di bahu.",status:"diajukan",refund:0});
S.orders.sort(function(a,b){return b.at<a.at?-1:1});S.seq.order=plan.length;
S.orders.forEach(function(o){o.returns.forEach(function(x){x.refund=x.items.reduce(function(s,i){return s+o.items[i.idx].price*i.qty},0)})});
return S}

var S;
function load(){try{var d=JSON.parse(localStorage.getItem(KEY));if(d&&d.v===1&&d.products)return d}catch(e){}return null}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
S=load();if(!S){S=seed();save()}
/* ---------- helper data ---------- */
function prod(id){for(var i=0;i<S.products.length;i++)if(S.products[i].id===id)return S.products[i];return null}
function vk(s,c){return s+"|"+c}
function stockOf(p,s,c){return +p.stock[vk(s,c)]||0}
function totStock(p){var t=0;p.sizes.forEach(function(s){p.colors.forEach(function(c){t+=stockOf(p,s,c)})});return t}
function inCart(id,s,c){var t=0;S.cart.items.forEach(function(i){if(i.pid===id&&i.size===s&&i.color===c)t+=i.qty});return t}
function avg(p){if(!p.reviews.length)return 0;return p.reviews.reduce(function(s,r){return s+r.rating},0)/p.reviews.length}
function stars(n){var f=Math.round(n),s="";for(var i=1;i<=5;i++)s+=i<=f?"★":"☆";return s}
function soldMap(){var m={};S.orders.forEach(function(o){if(o.status!=="cancelled")o.items.forEach(function(i){m[i.pid]=(m[i.pid]||0)+i.qty})});return m}
function cleanCart(){S.cart.items=S.cart.items.filter(function(i){var p=prod(i.pid);return p&&p.active&&p.sizes.indexOf(i.size)>-1&&p.colors.indexOf(i.color)>-1})}
function lines(){return S.cart.items.map(function(it,i){var p=prod(it.pid);return {i:i,p:p,size:it.size,color:it.color,qty:it.qty,price:p.price,stock:stockOf(p,it.size,it.color)}})}
function todayStr(){return ymd(new Date())}
function promoCheck(code,ls,sub){
code=String(code||"").trim().toUpperCase();if(!code)return null;
var p=S.promos.filter(function(x){return x.code===code})[0];
if(!p||!p.active)return {ok:false,msg:"Kode promo tidak ditemukan."};
if(p.expires&&todayStr()>p.expires)return {ok:false,msg:"Kode "+code+" sudah kedaluwarsa."};
if(p.quota>0&&p.used>=p.quota)return {ok:false,msg:"Kuota kode "+code+" sudah habis."};
var elig=0;ls.forEach(function(l){if(!p.cat||l.p.cat===p.cat)elig+=l.price*l.qty});
if(p.cat&&elig===0)return {ok:false,msg:"Kode ini hanya berlaku untuk kategori "+p.cat+"."};
if(elig<p.min)return {ok:false,msg:"Minimal belanja "+rp(p.min)+(p.cat?" di kategori "+p.cat:"")+" untuk kode ini."};
var disc=0,so=0;
if(p.type==="pct"){disc=Math.floor(elig*p.value/100);if(p.max>0)disc=Math.min(disc,p.max)}
else if(p.type==="nom")disc=Math.min(p.value,elig);
else so=p.value>0?p.value:-1;
return {ok:true,p:p,disc:disc,shipOff:so}}
function uniqCode(){return 101+((S.seq.order+1)*47)%898}
function calc(cid,pay){
var ls=lines(),sub=0,qty=0;ls.forEach(function(l){sub+=l.price*l.qty;qty+=l.qty});
var pr=promoCheck(S.cart.promo,ls,sub),disc=pr&&pr.ok?pr.disc:0;
var c=COURIERS.filter(function(x){return x.id===cid})[0]||null,ship=c?shipCost(c,qty):0,sd=0;
if(pr&&pr.ok&&pr.shipOff&&c)sd=pr.shipOff<0?ship:Math.min(ship,pr.shipOff);
var cod=pay==="cod"?COD_FEE:0,uq=pay==="transfer"?uniqCode():0;
return {ls:ls,sub:sub,qty:qty,pr:pr,disc:disc,courier:c,ship:ship,sd:sd,cod:cod,uniq:uq,total:sub-disc+ship-sd+cod+uq}}
function guide(p){
var A={XS:[46,64],S:[49,67],M:[52,69],L:[55,71],XL:[58,73],XXL:[61,75]},B={XS:[62,96],S:[66,97],M:[70,98],L:[74,99],XL:[78,100],"28":[72,98],"30":[76,99],"32":[80,100],"34":[84,101]},D={S:[84,66,110],M:[88,70,111],L:[92,74,112]};
if(p.type==="tas")return {head:["Ukuran","Lebar","Tinggi","Tebal"],rows:[["Satu ukuran","38 cm","40 cm","10 cm"]]};
if(p.type==="dress")return {head:["Ukuran","Lingkar dada","Pinggang","Panjang"],rows:p.sizes.map(function(s){var d=D[s]||[];return [s,d[0]?d[0]+" cm":"-",d[1]?d[1]+" cm":"-",d[2]?d[2]+" cm":"-"]})};
if(p.type==="celana"||p.type==="rok")return {head:["Ukuran","Pinggang","Panjang"],rows:p.sizes.map(function(s){var d=B[s]||[];return [s,d[0]?d[0]+" cm":"-",d[1]?d[1]+" cm":"-"]})};
return {head:["Ukuran","Lebar dada","Panjang"],rows:p.sizes.map(function(s){var d=A[s]||[];return [s,d[0]?d[0]+" cm":"-",d[1]?d[1]+" cm":"-"]})}}

/* ---------- state tampilan ---------- */
var F={q:"",cat:"",sizes:[],cols:[],min:"",max:"",sort:"new",open:false};
var D={id:0,size:"",color:"",qty:1,guide:false};
var PE={},C=null,T={no:"",hp:""},RET=null,ADMTAB={q:"",seg:"all",range:7},E=null,armed={};
var HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
function priceHtml(p){return '<div class="cp">'+(p.was>p.price?"<em>"+rp(p.price)+"</em><s>"+rp(p.was)+"</s>":rp(p.price))+"</div>"}
var newIds=[];
function calcNew(){newIds=S.products.filter(function(p){return p.active}).sort(function(a,b){return b.n-a.n}).slice(0,4).map(function(p){return p.id})}
function card(p){
var ts=totStock(p),w=S.wish.indexOf(p.id)>-1,tag="",low="";
if(p.was>p.price)tag='<span class="tag sale">Diskon</span>';else if(newIds.indexOf(p.id)>-1)tag='<span class="tag new">Baru</span>';
if(ts===0)low='<span class="tag out">Habis</span>';else if(ts<=5)low='<span class="tag low">Sisa '+ts+"</span>";
var rt=avg(p);
return '<article class="card"><a class="cimg" href="#/p/'+p.id+'" tabindex="-1" aria-hidden="true">'+pArt(p)+tag+low+'</a><button type="button" class="heart'+(w?" on":"")+'" data-act="wish" data-id="'+p.id+'" aria-pressed="'+w+'" aria-label="'+(w?"Hapus dari wishlist: ":"Simpan ke wishlist: ")+esc(p.name)+'">'+HEART+'</button><div class="cb"><span class="ccat">'+esc(p.cat)+'</span><a class="cn" href="#/p/'+p.id+'">'+esc(p.name)+"</a>"+priceHtml(p)+'<div class="dots">'+p.colors.slice(0,5).map(function(c){return '<i style="background:'+COL[c]+'" title="'+esc(c)+'"></i>'}).join("")+(p.colors.length>5?"+"+(p.colors.length-5):"")+(rt?'<span style="margin-left:auto">★ '+rt.toFixed(1)+"</span>":"")+"</div></div></article>"}
function filtered(){
var q=F.q.trim().toLowerCase(),mn=parseInt(F.min,10),mx=parseInt(F.max,10),sm=soldMap();
var list=S.products.filter(function(p){
if(!p.active)return false;if(F.cat&&p.cat!==F.cat)return false;
if(q&&(p.name+" "+p.cat+" "+TYPES[p.type]+" "+p.colors.join(" ")).toLowerCase().indexOf(q)<0)return false;
if(mn>0&&p.price<mn)return false;if(mx>0&&p.price>mx)return false;
if(F.sizes.length||F.cols.length){var ok=false;p.sizes.forEach(function(s){p.colors.forEach(function(c){if((!F.sizes.length||F.sizes.indexOf(s)>-1)&&(!F.cols.length||F.cols.indexOf(c)>-1)&&stockOf(p,s,c)>0)ok=true})});if(!ok)return false}
return true});
list.sort(function(a,b){if(F.sort==="low")return a.price-b.price;if(F.sort==="high")return b.price-a.price;if(F.sort==="best")return (sm[b.id]||0)-(sm[a.id]||0)||b.n-a.n;return b.n-a.n});
return list}
function activeCount(){return (F.cat?1:0)+F.sizes.length+F.cols.length+(F.min?1:0)+(F.max?1:0)}
function filtersHtml(){
var act=S.products.filter(function(p){return p.active}),sizes=[],cols=[];
act.forEach(function(p){p.sizes.forEach(function(s){if(sizes.indexOf(s)<0)sizes.push(s)});p.colors.forEach(function(c){if(cols.indexOf(c)<0)cols.push(c)})});
sizes=sortSizes(sizes);
var h='<h3>Kategori</h3><div class="chips"><button type="button" class="chip" data-act="fcat" data-v="" aria-pressed="'+(!F.cat)+'">Semua</button>'+CATS.map(function(c){var n=act.filter(function(p){return p.cat===c}).length;return n?'<button type="button" class="chip" data-act="fcat" data-v="'+c+'" aria-pressed="'+(F.cat===c)+'">'+c+"<small>"+n+"</small></button>":""}).join("")+"</div>";
h+='<h3>Ukuran</h3><div class="chips">'+sizes.map(function(s){return '<button type="button" class="chip" data-act="fsize" data-v="'+esc(s)+'" aria-pressed="'+(F.sizes.indexOf(s)>-1)+'">'+esc(s)+"</button>"}).join("")+"</div>";
h+='<h3>Warna</h3><div class="chips">'+cols.map(function(c){return '<button type="button" class="sw" data-act="fcol" data-v="'+esc(c)+'" style="background:'+COL[c]+'" aria-pressed="'+(F.cols.indexOf(c)>-1)+'" aria-label="'+esc(c)+'" title="'+esc(c)+'"></button>'}).join("")+"</div>";
h+='<h3>Rentang harga</h3><div class="price"><label class="sr" for="pmin">Harga minimum</label><input id="pmin" inputmode="numeric" placeholder="Min" value="'+esc(F.min)+'" data-ch="pmin"><label class="sr" for="pmax">Harga maksimum</label><input id="pmax" inputmode="numeric" placeholder="Maks" value="'+esc(F.max)+'" data-ch="pmax"></div>';
h+='<div style="margin-top:16px"><button type="button" class="btn ghost sm" data-act="freset">Reset filter</button></div>';
return h}
function pickP(ids,n){var out=[];ids.forEach(function(i){var p=prod(i);if(p&&p.active&&out.indexOf(p)<0)out.push(p)});S.products.forEach(function(p){if(out.length<n&&p.active&&out.indexOf(p)<0)out.push(p)});return out.slice(0,n)}
function promoLine(p){
var m=p.min>0?"min. belanja "+rp(p.min):"tanpa minimum",c=p.cat?" untuk "+p.cat:"";
if(p.type==="ongkir")return "Gratis ongkir "+m+" / kode "+p.code;
if(p.type==="pct")return "Diskon "+p.value+"%"+c+", "+m+" / kode "+p.code;
return "Potongan "+rp(p.value)+c+", "+m+" / kode "+p.code}
function promoLive(p){return p.active&&(!p.expires||todayStr()<=p.expires)&&!(p.quota>0&&p.used>=p.quota)}
function two(n){return (n<10?"0":"")+n}
var IC={ret:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h11a5 5 0 0 1 0 10H8M4 9l4-4M4 9l4 4"/></svg>',kur:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01"/></svg>',pay:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/></svg>',siz:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15l12-12 6 6-12 12zM8 10l2 2M11 7l2 2M5 13l2 2"/></svg>'};
function topbarHtml(){
var fr=S.promos.filter(function(p){return p.type==="ongkir"&&promoLive(p)})[0],o=[];
if(fr)o.push('<span>Gratis ongkir min. belanja <b>'+rp(fr.min)+'</b>, kode <b>'+esc(fr.code)+'</b></span>');
var pc=S.promos.filter(function(p){return p.type!=="ongkir"&&promoLive(p)})[0];
if(pc)o.push('<span>'+(pc.type==="pct"?"Diskon "+pc.value+"%":"Potongan "+rp(pc.value))+(pc.cat?" "+esc(pc.cat):"")+', kode <b>'+esc(pc.code)+'</b></span>');
if(!o.length)o.push("<span>Retur "+RET_DAYS+" hari untuk pesanan yang sudah sampai</span>");
return o.join("<span aria-hidden=\"true\" class=\"tsep\"> | </span>")}
function promoBanner(p,k){
var t=p.type==="ongkir"?"Gratis ongkir":p.type==="pct"?"Diskon "+p.value+"%"+(p.cat?" untuk "+p.cat:""):"Potongan "+rp(p.value)+(p.cat?" untuk "+p.cat:"");
var d=[p.min>0?"Min. belanja "+rp(p.min):"Tanpa minimum belanja"];if(p.type==="pct"&&p.max>0)d.push("maks. potongan "+rp(p.max));if(p.expires)d.push("sampai "+dt(p.expires+"T12:00:00",true));
return '<div class="pb'+(k%2?" dk":"")+'"><span class="eyebrow">Promo aktif</span><h3>'+esc(t)+'</h3><p>'+esc(d.join(", "))+'.</p><span class="code" aria-label="Kode promo '+esc(p.code)+'">'+esc(p.code)+'</span>'+(p.cat?'<a class="btn" href="#/" data-act="gocat" data-v="'+esc(p.cat)+'">Belanja '+esc(p.cat)+'</a>':'<a class="btn" href="#/" data-act="toshop">Belanja sekarang</a>')+'</div>'}
function viewHome(){
calcNew();
var act=S.products.filter(function(p){return p.active});
var hp=pickP([14,13],2);
var hero='<section class="hero" aria-labelledby="h1h"><div class="hero-t"><span class="eyebrow">Koleksi musim hujan 2026</span><h1 id="h1h">Pakaian harian dengan potongan bersih</h1><p>Kaos, kemeja, outer, dan dress dengan panduan ukuran di setiap produk. Retur '+RET_DAYS+' hari setelah pesanan sampai.</p><div class="hero-b"><a class="btn" href="#/" data-act="toshop">Belanja sekarang</a><a class="btn ghost" href="#/track">Lacak pesanan</a></div></div><div class="hero-p">'+hp.map(function(p){return '<a class="hp" href="#/p/'+p.id+'">'+pArt(p).replace('loading="lazy"','loading="eager"')+'<span class="bdg">'+esc(p.name)+'<small>'+rp(p.price)+'</small></span></a>'}).join("")+'</div></section>';
var ben='<div class="wrap ben"><div class="bn">'+IC.ret+'<div><b>Retur '+RET_DAYS+' hari</b><span>Ajukan dari halaman Lacak pesanan</span></div></div><div class="bn">'+IC.kur+'<div><b>Kurir pilihan</b><span>Ekspres, reguler, atau hemat</span></div></div><div class="bn">'+IC.pay+'<div><b>Bayar sesuai kebiasaan</b><span>Transfer, e-wallet, atau COD</span></div></div><div class="bn">'+IC.siz+'<div><b>Panduan ukuran</b><span>Tabel ukuran di tiap produk</span></div></div></div>';
var cats='<div class="cats">'+CATS.map(function(c){var l=act.filter(function(p){return p.cat===c});if(!l.length)return"";return '<a class="ct" href="#/" data-act="gocat" data-v="'+c+'"><span class="ctp" aria-hidden="true">'+pArt(l[0]).replace(/alt="[^"]*"/,'alt=""')+'</span><span><b>'+esc(c)+'</b><small>'+l.length+' produk</small></span></a>'}).join("")+'</div>';
var fresh=act.slice().sort(function(a,b){return b.n-a.n}).slice(0,8);
var sm=soldMap(),best=act.filter(function(p){return fresh.indexOf(p)<0}).sort(function(a,b){return (sm[b.id]||0)-(sm[a.id]||0)||b.n-a.n}).slice(0,6);
var lp=S.promos.filter(promoLive),pbs=lp.filter(function(p){return p.type!=="ongkir"}).concat(lp.filter(function(p){return p.type==="ongkir"})).slice(0,2);
var pol='<section class="sx wrap" aria-labelledby="hpol"><div class="pol"><div><span class="eyebrow">Kebijakan retur</span><h2 id="hpol">Retur '+RET_DAYS+' hari, tanpa ribet</h2><p>Ukuran belum pas atau barang bermasalah? Ajukan retur dari halaman Lacak pesanan selama '+RET_DAYS+' hari setelah pesanan sampai.</p><a class="btn" href="#/track">Lacak atau ajukan retur</a></div><ol><li>Masukkan nomor pesanan dan nomor HP di Lacak pesanan.</li><li>Pilih barang dan alasan retur.</li><li>Penjual memeriksa pengajuan dan memberi keputusan.</li></ol></div></section>';
return hero+ben
+'<section class="sx wrap" id="kat" aria-labelledby="h3b"><div class="sh"><h2 id="h3b">Belanja per kategori</h2></div>'+cats+'</section>'
+'<section class="sx wrap" id="baru" aria-labelledby="h1b"><div class="sh"><h2 id="h1b">Baru masuk</h2><a class="more" href="#/" data-act="toshop">Lihat semua produk</a></div><div class="g4">'+fresh.map(card).join("")+'</div></section>'
+(pbs.length?'<section class="sx wrap" aria-label="Promo"><div class="pbs">'+pbs.map(promoBanner).join("")+'</div></section>':"")
+'<section class="sx wrap" id="laris" aria-labelledby="h2b"><div class="sh"><h2 id="h2b">Paling dicari</h2><div class="rb"><button type="button" class="ib" data-act="rail" data-v="-1" aria-label="Geser ke kiri"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" class="ib" data-act="rail" data-v="1" aria-label="Geser ke kanan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div></div><div class="rail" id="rail" tabindex="0" role="region" aria-label="Produk paling dicari">'+best.map(card).join("")+'</div></section>'
+pol
+'<section class="wrap shop" id="shop" aria-label="Semua produk"><div class="sh shh"><h2>Semua produk</h2></div><button type="button" class="btn ghost fbtn" data-act="ftoggle" aria-expanded="'+F.open+'" aria-controls="fil" id="fbtn">Filter</button><aside class="fil'+(F.open?" open":"")+'" id="fil" aria-label="Filter produk"></aside><div class="res"><div class="bar"><span class="cnt" id="cnt" aria-live="polite"></span><label class="sr" for="sortsel">Urutkan</label><select id="sortsel" data-ch="sort"><option value="new">Terbaru</option><option value="best">Terlaris</option><option value="low">Harga terendah</option><option value="high">Harga tertinggi</option></select></div><div class="grid" id="grid"></div></div></section>'}
function topbarSet(){var t=$("#topbar");if(t)t.innerHTML=topbarHtml();return""}
function drawGrid(){
var g=$("#grid");if(!g)return;var l=filtered();
$("#cnt").textContent=l.length+" produk";$("#sortsel").value=F.sort;
var n=activeCount();$("#fbtn").textContent=n?"Filter ("+n+")":"Filter";
g.innerHTML=l.length?l.map(card).join(""):'<div class="none"><b>Tidak ada produk yang cocok</b>Coba kurangi filter atau ganti kata pencarian.<div style="margin-top:12px"><button type="button" class="btn ghost sm" data-act="freset">Reset filter</button></div></div>'}
function drawFilters(){var f=$("#fil");if(f)f.innerHTML=filtersHtml()}
function viewProduct(id){
var p=prod(id);
if(!p||!p.active)return '<div class="wrap page"><h1>Produk tidak ditemukan</h1><p>Produk ini sudah tidak dijual.</p><a class="btn" href="#/">Kembali ke katalog</a></div>';
if(D.id!==id){D={id:id,size:p.sizes.length===1?p.sizes[0]:"",color:"",qty:1,guide:false};for(var i=0;i<p.colors.length;i++){if(p.sizes.some(function(s){return stockOf(p,s,p.colors[i])>0})){D.color=p.colors[i];break}}if(!D.color)D.color=p.colors[0]}
var sz=sortSizes(p.sizes),selS=D.size,selC=D.color,st=selS&&selC?stockOf(p,selS,selC):null,left=st==null?null:Math.max(0,st-inCart(p.id,selS,selC));
var stk;
if(st==null)stk='<div class="stk">Pilih ukuran untuk melihat stok.</div>';
else if(st===0)stk='<div class="stk out">Habis untuk '+esc(selS)+" / "+esc(selC)+".</div>";
else stk='<div class="stk '+(st<=3?"low":"ok")+'">Stok '+esc(selS)+" / "+esc(selC)+": "+st+(st<=3?" (hampir habis)":"")+(inCart(p.id,selS,selC)?". Di keranjang: "+inCart(p.id,selS,selC):"")+"</div>";
var q=Math.min(D.qty,Math.max(1,left==null?10:left));D.qty=q;
var g=guide(p),w=S.wish.indexOf(p.id)>-1,rt=avg(p);
var rv=p.reviews.slice().sort(function(a,b){return a.at<b.at?1:-1}).map(function(r){return '<div class="rv"><span class="stars" aria-label="Nilai '+r.rating+' dari 5">'+stars(r.rating)+"</span> <b>"+esc(r.name)+"</b><small>"+dt(r.at,1)+"</small><p>"+esc(r.text)+"</p></div>"}).join("")||'<p class="note">Belum ada ulasan. Jadilah yang pertama.</p>';
var rel=S.products.filter(function(x){return x.active&&x.id!==p.id&&x.cat===p.cat}).slice(0,3);
if(rel.length<3)S.products.filter(function(x){return x.active&&x.id!==p.id&&rel.indexOf(x)<0}).slice(0,3-rel.length).forEach(function(x){rel.push(x)});
return '<div class="wrap"><div class="crumb"><a href="#/">Belanja</a> / <a href="#/" data-act="gocat" data-v="'+esc(p.cat)+'">'+esc(p.cat)+"</a> / "+esc(p.name)+'</div><div class="pdp"><div class="pcol"><div class="pimg" role="img" aria-label="Foto '+esc(p.name)+', warna dipilih '+esc(selC||"belum dipilih")+'">'+pArt(p,selC)+'</div><p class="pnote">Foto contoh yang sama untuk semua warna. Titik warna di pojok foto menandai pilihanmu.</p></div><div class="pinfo"><span class="ccat">'+esc(p.cat)+"</span><h1>"+esc(p.name)+'</h1><div class="stars">'+(rt?stars(rt)+"<small>"+rt.toFixed(1)+" ("+p.reviews.length+" ulasan contoh)</small>":"<small>Belum ada ulasan</small>")+'</div><div class="price1" style="margin-top:8px">'+rp(p.price)+(p.was>p.price?"<s>"+rp(p.was)+"</s><em>Hemat "+Math.round((1-p.price/p.was)*100)+"%</em>":"")+"</div><p>"+esc(p.desc)+'</p><div class="opt"><b>Warna</b><span>'+esc(selC)+'</span></div><div class="chips">'+p.colors.map(function(c){var any=selS?stockOf(p,selS,c)>0:sz.some(function(s){return stockOf(p,s,c)>0});return '<button type="button" class="sw'+(any?"":" x")+'" data-act="selcol" data-fk="c'+esc(c)+'" data-v="'+esc(c)+'" style="background:'+COL[c]+'" aria-pressed="'+(c===selC)+'" aria-label="'+esc(c)+(any?"":" (habis)")+'"></button>'}).join("")+'</div><div class="opt"><b>Ukuran</b><span>'+(p.sizes.length>1?'<button type="button" class="lnk" data-act="gtoggle">Panduan ukuran</button>':"")+'</span></div><div class="chips" id="sizes" role="group" aria-label="Ukuran">'+sz.map(function(s){var n=stockOf(p,s,selC);return '<button type="button" class="chip'+(n?"":" dis")+'" data-act="selsize" data-fk="s'+esc(s)+'" data-v="'+esc(s)+'" aria-pressed="'+(s===selS)+'">'+esc(s)+(n?"":'<span class="sr"> (habis)</span>')+"</button>"}).join("")+"</div>"+stk+'<div class="buyrow"><div class="step" role="group" aria-label="Jumlah"><button type="button" data-act="dq" data-v="-1" data-fk="dqm" aria-label="Kurangi" '+(q<=1?"disabled":"")+'>−</button><b aria-live="polite">'+q+'</b><button type="button" data-act="dq" data-v="1" data-fk="dqp" aria-label="Tambah" '+(left!=null&&q>=left?"disabled":"")+'>+</button></div><button type="button" class="btn" data-act="addcart" '+(st===0?"disabled":"")+">Tambah ke keranjang</button></div>"+'<div class="buyrow" style="margin-top:10px"><button type="button" class="btn ghost" data-act="wish" data-id="'+p.id+'" aria-pressed="'+w+'">'+(w?"Tersimpan di wishlist":"Simpan ke wishlist")+"</button></div>"
+(D.guide?'<div class="box"><div class="bd"><b>Panduan ukuran</b><table class="tb"><thead><tr>'+g.head.map(function(h){return "<th>"+h+"</th>"}).join("")+"</tr></thead><tbody>"+g.rows.map(function(r){return "<tr>"+r.map(function(c){return "<td>"+esc(c)+"</td>"}).join("")+"</tr>"}).join("")+'</tbody></table><p class="note" style="margin:10px 0 0">Ukuran dalam cm, selisih 1-2 cm itu wajar. Jika di antara dua ukuran, pilih yang lebih besar.</p></div></div>':"")
+'<ul class="spec"><li>Bahan: <b>'+esc(p.mat)+"</b></li><li>Pola: <b>"+esc(PATS[p.pat]||"Polos")+"</b></li><li>Retur: <b>"+RET_DAYS+" hari setelah pesanan selesai</b></li></ul></div></div>"
+'<section class="sec"><div class="rvgrid"><div><h2>Ulasan contoh</h2><div>'+rv+'</div></div><form data-form="review" novalidate class="card2" style="align-self:start"><h3>Tulis ulasan</h3><p class="note">Data contoh: ulasan tersimpan di peramban ini saja.</p><label class="fld"><span>Nama</span><input name="name" maxlength="40" autocomplete="off"><em class="err" data-e="name"></em></label><label class="fld"><span>Nilai</span><select name="rating"><option value="5">5 bintang</option><option value="4">4 bintang</option><option value="3">3 bintang</option><option value="2">2 bintang</option><option value="1">1 bintang</option></select></label><label class="fld"><span>Ulasan</span><textarea name="text" maxlength="300"></textarea><em class="err" data-e="text"></em></label><button class="btn" type="submit">Kirim ulasan</button></form></div></section>'
+'<section class="sec"><h2>Produk lain</h2><div class="grid" style="grid-template-columns:repeat(2,1fr)">'+rel.map(card).join("")+"</div></section></div>"}
function viewCart(){
cleanCart();var t=calc("",""),ls=t.ls;
if(!ls.length)return '<div class="wrap page"><h1>Keranjang</h1><div class="none"><b>Keranjang masih kosong</b>Pilih produk dulu, lalu ukuran dan warnanya.<div style="margin-top:14px"><a class="btn" href="#/">Lihat koleksi</a></div></div></div>';
var bad=ls.some(function(l){return l.stock<l.qty});
return '<div class="wrap page"><h1>Keranjang</h1><div class="cols2"><div>'+ls.map(function(l){
var warn=l.stock===0?"Stok varian ini habis. Hapus dari keranjang.":l.stock<l.qty?"Stok tinggal "+l.stock+". Kurangi jumlah.":"";
return '<div class="ln"><a class="th" href="#/p/'+l.p.id+'" tabindex="-1" aria-hidden="true">'+pArt(l.p,l.color)+'</a><div><a class="nm" href="#/p/'+l.p.id+'">'+esc(l.p.name)+"</a><small>"+esc(l.size)+" / "+esc(l.color)+"</small><small>"+rp(l.price)+"</small>"+(warn?'<div class="w" role="alert">'+warn+"</div>":"")+'<div class="ac"><div class="step" role="group" aria-label="Jumlah"><button type="button" data-act="cq" data-i="'+l.i+'" data-v="-1" data-fk="m'+l.i+'" aria-label="Kurangi" '+(l.qty<=1?"disabled":"")+'>−</button><b>'+l.qty+'</b><button type="button" data-act="cq" data-i="'+l.i+'" data-v="1" data-fk="p'+l.i+'" aria-label="Tambah" '+(l.qty>=l.stock?"disabled":"")+'>+</button></div><b>'+rp(l.price*l.qty)+'</b><button type="button" class="lnk" data-act="cdel" data-i="'+l.i+'">Hapus</button></div></div></div>'}).join("")+'</div><aside class="sum"><h2>Ringkasan</h2>'+promoBox(t)+sumRows(t,false)+'<a class="btn block" href="#/checkout" '+(bad?'aria-disabled="true" data-act="blocked"':"")+' style="margin-top:14px">Lanjut ke checkout</a></aside></div></div>'}
function promoBox(t){
var has=S.cart.promo,pr=t.pr;
return '<form class="promo" data-form="promo"><label class="sr" for="pc">Kode promo</label><input id="pc" name="code" placeholder="Kode promo" value="'+esc(has)+'" autocomplete="off"><button class="btn ghost sm" type="submit">Pakai</button></form>'+(pr?(pr.ok?'<p class="note ok" style="margin:6px 0 10px">Kode <b>'+esc(pr.p.code)+"</b> dipakai. "+(pr.p.type==="ongkir"?"Potongan ongkir diterapkan di checkout.":"Hemat "+rp(pr.disc)+".")+' <button type="button" class="lnk" data-act="promoOff">Lepas</button></p>':'<p class="note bad" role="alert" style="margin:6px 0 10px">'+esc(pr.msg)+' <button type="button" class="lnk" data-act="promoOff">Lepas</button></p>'):'<p class="note" style="margin:6px 0 10px">Coba HEMAT10, GRATISONGKIR, BARU50 atau KAOS20.</p>')}
function sumRows(t,full){
var h='<div class="sr2"><span>Subtotal ('+t.qty+' barang)</span><span>'+rp(t.sub)+"</span></div>";
if(t.disc)h+='<div class="sr2 d"><span>Diskon promo</span><span>-'+rp(t.disc)+"</span></div>";
if(full){h+='<div class="sr2"><span>Ongkir'+(t.courier?" ("+esc(t.courier.n.replace(" (contoh)",""))+")":"")+"</span><span>"+(t.courier?rp(t.ship):"Pilih kurir")+"</span></div>";
if(t.sd)h+='<div class="sr2 d"><span>Potongan ongkir</span><span>-'+rp(t.sd)+"</span></div>";
if(t.cod)h+='<div class="sr2"><span>Biaya COD</span><span>'+rp(t.cod)+"</span></div>";
if(t.uniq)h+='<div class="sr2"><span>Kode unik transfer</span><span>'+rp(t.uniq)+"</span></div>"}
else h+='<div class="sr2"><span>Ongkir</span><span>Dihitung di checkout</span></div>';
h+='<div class="sr2 t"><span>Total</span><span>'+rp(full?t.total:t.sub-t.disc)+"</span></div>";return h}
function viewWish(){
var l=S.wish.map(prod).filter(function(p){return p&&p.active});
return '<div class="wrap page"><h1>Wishlist</h1>'+(l.length?'<div class="grid">'+l.map(card).join("")+"</div>":'<div class="none"><b>Belum ada yang disimpan</b>Ketuk ikon hati pada produk untuk menyimpannya di sini.<div style="margin-top:14px"><a class="btn" href="#/">Lihat koleksi</a></div></div>')+"</div>"}
function fieldVal(k){return esc((C&&C[k])||"")}
function viewCheckout(){
cleanCart();if(!S.cart.items.length)return viewCart();
if(!C){var pf=S.profile||{};C={nama:pf.nama||"",hp:pf.hp||"",email:pf.email||"",alamat:pf.alamat||"",kota:pf.kota||"",prov:pf.prov||"",pos:pf.pos||"",catatan:"",courier:"reguler",pay:"transfer",via:WALLETS[0],err:{}}}
var t=calc(C.courier,C.pay),er=C.err||{};
function fld(k,label,extra){return '<label class="fld"><span>'+label+'</span><input name="'+k+'" value="'+fieldVal(k)+'" '+(extra||"")+' aria-invalid="'+(!!er[k])+'" aria-describedby="e_'+k+'"><em class="err" id="e_'+k+'" data-e="'+k+'">'+esc(er[k]||"")+"</em></label>"}
return '<div class="wrap page"><h1>Checkout</h1><form data-form="checkout" novalidate><div class="cols2"><div><fieldset class="fs"><legend>Alamat pengiriman</legend><div class="two">'+fld("nama","Nama penerima",'autocomplete="name" maxlength="60"')+fld("hp","Nomor HP",'inputmode="tel" autocomplete="tel" placeholder="0812-0000-0000" maxlength="18"')+"</div>"+fld("email",'Email <small>(opsional)</small>','type="email" autocomplete="email" maxlength="80"')+fld("alamat","Alamat lengkap",'autocomplete="street-address" maxlength="160"')+'<div class="three">'+fld("kota","Kota atau kabupaten",'maxlength="50"')+'<label class="fld"><span>Provinsi</span><select name="prov" aria-invalid="'+(!!er.prov)+'"><option value="">Pilih provinsi</option>'+PROVS.map(function(x){return '<option'+(C.prov===x?" selected":"")+">"+x+"</option>"}).join("")+'</select><em class="err" data-e="prov">'+esc(er.prov||"")+"</em></label>"+fld("pos","Kode pos",'inputmode="numeric" maxlength="5"')+'</div><label class="fld"><span>Catatan untuk kurir <small>(opsional)</small></span><input name="catatan" value="'+fieldVal("catatan")+'" maxlength="100"></label></fieldset>'
+'<fieldset class="fs"><legend>Kurir</legend><div class="opts">'+COURIERS.map(function(c){return '<label class="radio"><input type="radio" name="courier" value="'+c.id+'"'+(C.courier===c.id?" checked":"")+'><span class="rt">'+esc(c.n)+"<small>Estimasi "+c.eta+'</small></span><span class="pr">'+rp(shipCost(c,t.qty))+"</span></label>"}).join("")+'</div></fieldset>'
+'<fieldset class="fs"><legend>Metode pembayaran</legend><div class="opts"><label class="radio"><input type="radio" name="pay" value="transfer"'+(C.pay==="transfer"?" checked":"")+'><span class="rt">Transfer bank<small>Bank Contoh, ada kode unik 3 digit</small></span></label><label class="radio"><input type="radio" name="pay" value="cod"'+(C.pay==="cod"?" checked":"")+'><span class="rt">Bayar di tempat (COD)<small>Biaya COD '+rp(COD_FEE)+'</small></span></label><label class="radio"><input type="radio" name="pay" value="ewallet"'+(C.pay==="ewallet"?" checked":"")+'><span class="rt">E-wallet contoh<small>Pilih dompet digital di bawah</small></span></label></div><div id="via" '+(C.pay==="ewallet"?"":"hidden")+'><label class="fld"><span>E-wallet</span><select name="via">'+WALLETS.map(function(w){return "<option"+(C.via===w?" selected":"")+">"+w+"</option>"}).join("")+"</select></label></div></fieldset></div>"
+'<aside class="sum"><h2>Pesanan kamu</h2>'+t.ls.map(function(l){return '<div class="sr2"><span>'+esc(l.p.name)+" ("+esc(l.size)+"/"+esc(l.color)+") x"+l.qty+"</span><span>"+rp(l.price*l.qty)+"</span></div>"}).join("")+'<div id="sumx" style="margin-top:8px">'+promoBoxCk(t)+sumRows(t,true)+'</div><div id="ckerr" class="note bad" role="alert" style="margin-top:12px" hidden></div><button class="btn block" type="submit" style="margin-top:14px">Buat pesanan</button><p class="note" style="margin:12px 0 0">Ini demo. Tidak ada pembayaran sungguhan yang diproses.</p></aside></div></form></div>'}
function promoBoxCk(t){var pr=t.pr;return (S.cart.promo?(pr&&pr.ok?'<p class="note ok" style="margin:0 0 8px">Kode <b>'+esc(pr.p.code)+"</b> dipakai.</p>":'<p class="note bad" style="margin:0 0 8px">'+esc(pr?pr.msg:"")+" Ubah di keranjang.</p>"):"")}
function paidInfo(o){
if(o.pay.method==="transfer")return '<div class="note left"><b>Transfer ke Bank Contoh</b><br>No. rekening <span class="mono">0000-0000-00</span> a.n. NOLA Studio (contoh)<br>Jumlah tepat: <b>'+rp(o.total)+"</b> (sudah termasuk kode unik "+o.uniq+")</div>";
if(o.pay.method==="ewallet")return '<div class="note left"><b>Bayar lewat '+esc(o.pay.via)+" (contoh)</b><br>Kirim "+rp(o.total)+" ke nomor <span class=\"mono\">0812-0000-9999</span>. Ini data contoh.</div>";
return '<div class="note left"><b>Bayar di tempat</b><br>Siapkan '+rp(o.total)+" saat paket tiba.</div>"}
function viewDone(no){
var o=S.orders.filter(function(x){return x.no===no})[0];
if(!o)return '<div class="wrap page"><h1>Pesanan tidak ditemukan</h1><a class="btn" href="#/">Kembali ke toko</a></div>';
return '<div class="wrap page"><div class="done"><span class="eyebrow">Terima kasih</span><h1 style="margin:8px 0 4px">Pesanan diterima</h1><div class="no">'+esc(o.no)+'</div><p>Simpan nomor ini. Untuk melacak pesanan, masukkan nomor pesanan dan nomor HP.</p><span class="badge '+o.status+'">'+ST[o.status]+"</span><div style=\"margin:18px 0\">"+(o.status==="pending"?paidInfo(o):'<p class="note left">Pesanan COD langsung diproses. Siapkan <b>'+rp(o.total)+"</b> saat paket tiba.</p>")+'</div><div class="buyrow" style="justify-content:center"><a class="btn" href="#/track" data-act="trackgo" data-no="'+esc(o.no)+'">Lacak pesanan</a><a class="btn ghost" href="#/">Lanjut belanja</a></div></div></div>'}
/* ---------- lacak ---------- */
function findOrder(no,hp){no=String(no||"").trim().toUpperCase();var h=digits(hp);return S.orders.filter(function(o){return o.no===no&&digits(o.cust.hp)===h})[0]||null}
function doneAt(o){var h=o.hist.filter(function(x){return x.s==="done"})[0];return h?h.at:null}
function retQty(o,idx){var n=0;o.returns.forEach(function(r){if(r.status!=="ditolak")r.items.forEach(function(i){if(i.idx===idx)n+=i.qty})});return n}
function canReturn(o){var d=doneAt(o);if(o.status!=="done"||!d)return false;if(Date.now()-new Date(d).getTime()>RET_DAYS*864e5)return false;return o.items.some(function(i,k){return retQty(o,k)<i.qty})}
function timeline(o){
var steps=o.pay.method==="cod"?["paid","packed","shipped","done"]:FLOW;
if(o.status==="cancelled"){return '<ol class="tl">'+o.hist.map(function(h){return '<li class="on"><b>'+ST[h.s]+"</b><small>"+dt(h.at)+(h.note?" - "+esc(h.note):"")+"</small></li>"}).join("")+"</ol>"}
return '<ol class="tl">'+steps.map(function(s){var h=o.hist.filter(function(x){return x.s===s})[0];return '<li class="'+(h?"on":"")+'"><b>'+ST[s]+"</b><small>"+(h?dt(h.at)+(h.note?" - "+esc(h.note):""):"Belum")+"</small></li>"}).join("")+"</ol>"}
function courierEvents(o){
var h=o.hist.filter(function(x){return x.s==="shipped"})[0];if(!h)return "";
var t0=new Date(h.at).getTime(),ev=[[0,"Paket diserahkan ke kurir"],[8,"Tiba di hub kota asal"],[20,"Dalam perjalanan ke kota tujuan"],[44,"Tiba di hub kota tujuan"],[60,"Kurir mengantar paket"]].filter(function(e){return t0+e[0]*36e5<=Date.now()}).reverse();
return '<ul class="lst">'+ev.map(function(e){return "<li><span>"+e[1]+"</span><span>"+dt(new Date(t0+e[0]*36e5).toISOString())+"</span></li>"}).join("")+'</ul><p class="note" style="margin:10px 0 0">Data pelacakan kurir adalah contoh.</p>'}
function itemsHtml(o){return o.items.map(function(i,k){return '<div class="sr2"><span>'+esc(i.name)+" ("+esc(i.size)+"/"+esc(i.color)+") x"+i.qty+"</span><span>"+rp(i.price*i.qty)+"</span></div>"}).join("")}
function totalsHtml(o){return itemsHtml(o)+(o.promo&&o.promo.disc?'<div class="sr2 d"><span>Diskon ('+esc(o.promo.code)+")</span><span>-"+rp(o.promo.disc)+"</span></div>":"")+'<div class="sr2"><span>Ongkir</span><span>'+rp(o.courier.cost)+"</span></div>"+(o.shipDisc?'<div class="sr2 d"><span>Potongan ongkir ('+esc(o.promo?o.promo.code:"")+")</span><span>-"+rp(o.shipDisc)+"</span></div>":"")+(o.cod?'<div class="sr2"><span>Biaya COD</span><span>'+rp(o.cod)+"</span></div>":"")+(o.uniq?'<div class="sr2"><span>Kode unik</span><span>'+rp(o.uniq)+"</span></div>":"")+'<div class="sr2 t"><span>Total</span><span>'+rp(o.total)+"</span></div>"}
function returnsHtml(o,admin){
if(!o.returns.length)return "";
return '<div class="card2"><h3>Retur</h3>'+o.returns.map(function(r){
return '<div style="padding:10px 0;border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>'+r.id+' <span class="badge '+r.status+'">'+r.status.charAt(0).toUpperCase()+r.status.slice(1)+"</span></b><small>"+dt(r.at)+"</small></div>"+r.items.map(function(i){var it=o.items[i.idx];return "<div>"+esc(it.name)+" ("+esc(it.size)+"/"+esc(it.color)+") x"+i.qty+"</div>"}).join("")+"<div>Alasan: "+esc(r.reason)+(r.note?". "+esc(r.note):"")+"</div><div>Nilai dana kembali: <b>"+rp(r.refund)+"</b></div>"+(admin?retActs(o,r):"")+"</div>"}).join("")+"</div>"}
function retActs(o,r){
if(r.status==="diajukan")return '<div class="acts"><button class="btn sm" data-act="retok" data-no="'+o.no+'" data-id="'+r.id+'">Setujui</button><button class="btn sm danger" data-act="retno" data-no="'+o.no+'" data-id="'+r.id+'">Tolak</button></div>';
if(r.status==="disetujui")return '<div class="acts"><button class="btn sm" data-act="retfin" data-no="'+o.no+'" data-id="'+r.id+'">Barang diterima, dana dikembalikan</button></div>';
return ""}
function viewTrack(){
var o=T.no?findOrder(T.no,T.hp):null,msg=T.msg||"";
var h='<div class="wrap page"><h1>Lacak pesanan</h1><div class="cols2"><div><form class="card2" data-form="track" novalidate><label class="fld"><span>Nomor pesanan</span><input name="no" value="'+esc(T.no)+'" placeholder="NL-260001" autocomplete="off"></label><label class="fld"><span>Nomor HP saat memesan</span><input name="hp" value="'+esc(T.hp)+'" inputmode="tel" placeholder="0812-0000-1001"></label>'+(msg?'<p class="note bad" role="alert">'+esc(msg)+"</p>":"")+'<button class="btn" type="submit">Cari pesanan</button><p class="note" style="margin:14px 0 0">Contoh: <b>NL-260001</b> dengan HP <b>0812-0000-1001</b> (sedang dikirim), atau <b>NL-260003</b> dengan HP <b>0812-0000-1003</b> (selesai, bisa diretur).</p></form>';
if(!o)return h+"</div></div></div>";
h+='<div class="card2"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div><span class="mono"><b>'+esc(o.no)+'</b></span><br><small>'+dt(o.at)+'</small></div><span class="badge '+o.status+'">'+ST[o.status]+"</span></div></div>"
+'<div class="card2"><h3>Status</h3>'+timeline(o)+"</div>"
+(o.resi?'<div class="card2"><h3>Pengiriman</h3><p style="margin:0 0 10px">'+esc(o.courier.n)+'<br>Nomor resi: <span class="mono"><b>'+esc(o.resi)+"</b></span></p>"+courierEvents(o)+"</div>":"")
+returnsHtml(o,false);
h+='</div><div><div class="card2"><h3>Rincian</h3>'+totalsHtml(o)+'</div><div class="card2"><h3>Alamat</h3><p style="margin:0">'+esc(o.cust.nama)+"<br>"+esc(o.cust.hp)+"<br>"+esc(o.cust.alamat)+", "+esc(o.cust.kota)+", "+esc(o.cust.prov)+" "+esc(o.cust.pos)+'</p></div><div class="card2"><h3>Pembayaran</h3><p style="margin:0">'+(o.pay.method==="transfer"?"Transfer bank":o.pay.method==="cod"?"Bayar di tempat (COD)":"E-wallet "+esc(o.pay.via))+"</p>"+(o.status==="pending"?paidInfo(o):"")+"</div>";
var a="";
if(o.status==="pending")a+='<button class="btn" data-act="simpay" data-no="'+o.no+'">Simulasi: sudah bayar</button><button class="btn danger'+(armed["cx"+o.no]?" armed":"")+'" data-act="custcancel" data-no="'+o.no+'">'+(armed["cx"+o.no]?"Tekan lagi untuk batal":"Batalkan pesanan")+"</button>";
if(o.status==="shipped")a+='<button class="btn" data-act="received" data-no="'+o.no+'">Pesanan sudah diterima</button>';
if(canReturn(o))a+='<button class="btn ghost" data-act="retform" data-no="'+o.no+'">Ajukan retur</button>';
if(o.status==="done"&&!canReturn(o)&&!o.returns.length)a+='<span class="note" style="width:100%;margin:0">Masa retur '+RET_DAYS+" hari sudah lewat.</span>";
if(a)h+='<div class="acts" style="margin-top:0">'+a+"</div>";
if(RET&&RET.no===o.no&&canReturn(o)){
h+='<form class="card2" data-form="retur" novalidate style="margin-top:16px"><h3>Ajukan retur</h3><p class="note">Pilih barang dan jumlah yang dikembalikan.</p>'+o.items.map(function(i,k){var mx=i.qty-retQty(o,k);if(mx<=0)return "";return '<div class="rl"><label for="rq'+k+'">'+esc(i.name)+" ("+esc(i.size)+"/"+esc(i.color)+')</label><select id="rq'+k+'" name="q'+k+'">'+Array.apply(null,Array(mx+1)).map(function(_,n){return "<option>"+n+"</option>"}).join("")+"</select></div>"}).join("")+'<label class="fld" style="margin-top:12px"><span>Alasan</span><select name="reason">'+REASONS.map(function(x){return "<option>"+x+"</option>"}).join("")+'</select></label><label class="fld"><span>Catatan <small>(opsional)</small></span><textarea name="note" maxlength="200"></textarea></label><em class="err" data-e="ret" role="alert"></em><div class="acts"><button class="btn" type="submit">Kirim pengajuan</button><button class="btn ghost" type="button" data-act="retcancel">Batal</button></div></form>'}
return h+"</div></div></div>"}

/* ---------- admin ---------- */
function isAdm(){try{return sessionStorage.getItem(ADM)==="1"}catch(e){return false}}
function aShell(tab,inner){
var tabs=[["summary","Ringkasan"],["orders","Pesanan"],["products","Produk"],["promos","Promo"]];
return '<div class="atop"><div class="wrap"><b class="logo">NOLA</b><small>Panel penjual (demo)</small><a class="btn sm" href="#/">Lihat toko</a><button class="btn sm" data-act="logout">Keluar</button></div></div><nav class="atabs" aria-label="Menu penjual"><div class="wrap">'+tabs.map(function(t){return '<a href="#/admin/'+t[0]+'" class="'+(tab===t[0]?"on":"")+'">'+t[1]+"</a>"}).join("")+'</div></nav><div class="wrap page">'+inner+"</div>"}
function viewLogin(){return '<div class="alogin"><b class="logo">NOLA</b><h1 style="font-size:1.3rem;margin:12px 0 4px">Panel penjual</h1><p style="color:var(--mute);margin:0 0 18px">Masukkan PIN untuk masuk.</p><form data-form="login" novalidate style="text-align:left"><label class="fld"><span>PIN</span><input name="pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off" aria-describedby="pe"><em class="err" id="pe" data-e="pin" role="alert"></em></label><button class="btn block" type="submit">Masuk</button></form><p class="note" style="margin-top:16px">PIN demo: <b>'+PIN+'</b></p><a href="#/">Kembali ke toko</a></div>'}
var PAIDS=["paid","packed","shipped","done"];
function refunded(o){var t=0;o.returns.forEach(function(r){if(r.status==="selesai")t+=r.refund});return t}
function viewSummary(){
var rg=ADMTAB.range,from=rg>0?Date.now()-rg*864e5:0,os=S.orders.filter(function(o){return new Date(o.at).getTime()>=from});
var good=os.filter(function(o){return PAIDS.indexOf(o.status)>-1}),rev=0,units=0,ref=0,cat={},top={};
good.forEach(function(o){rev+=o.total;ref+=refunded(o);o.items.forEach(function(i){units+=i.qty;top[i.name]=(top[i.name]||0)+i.qty;var p=prod(i.pid),c=p?p.cat:"Lainnya";cat[c]=(cat[c]||0)+i.price*i.qty})});
var days=Math.min(rg||30,30),bars=[],mx=1,i;
for(i=days-1;i>=0;i--){var d=ymd(Date.now()-i*864e5),v=0;S.orders.forEach(function(o){if(PAIDS.indexOf(o.status)>-1&&ymd(o.at)===d)v+=o.total});bars.push([d,v]);if(v>mx)mx=v}
var cnt={};Object.keys(ST).forEach(function(k){cnt[k]=0});os.forEach(function(o){cnt[o.status]++});
var tops=Object.keys(top).map(function(k){return [k,top[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5);
var cats=Object.keys(cat).map(function(k){return [k,cat[k]]}).sort(function(a,b){return b[1]-a[1]});
var low=[];S.products.forEach(function(p){p.sizes.forEach(function(s){p.colors.forEach(function(c){var n=stockOf(p,s,c);if(n<=2)low.push([p,s,c,n])})})});low.sort(function(a,b){return a[3]-b[3]});
var pend=S.orders.filter(function(o){return o.status==="pending"}).length,pack=S.orders.filter(function(o){return o.status==="paid"||o.status==="packed"}).length,rq=0;S.orders.forEach(function(o){o.returns.forEach(function(r){if(r.status==="diajukan")rq++})});
return '<div class="ahead"><h1>Ringkasan penjualan</h1><div class="seg">'+[[7,"7 hari"],[30,"30 hari"],[0,"Semua"]].map(function(x){return '<button class="chip" data-act="range" data-v="'+x[0]+'" aria-pressed="'+(rg===x[0])+'">'+x[1]+"</button>"}).join("")+'</div></div><div class="stats"><div class="stat"><small>Omzet</small><b>'+rp(rev-ref)+'</b></div><div class="stat"><small>Pesanan dibayar</small><b>'+good.length+'</b></div><div class="stat"><small>Rata-rata pesanan</small><b>'+rp(good.length?(rev-ref)/good.length:0)+'</b></div><div class="stat"><small>Barang terjual</small><b>'+units+"</b></div></div>"
+'<p class="note">Omzet tidak termasuk pesanan batal dan yang belum dibayar, dikurangi dana retur yang sudah selesai ('+rp(ref)+").</p>"
+'<div class="g2"><div class="card2"><h3>Perlu ditindaklanjuti</h3><div class="todo"><a href="#/admin/orders" data-act="segto" data-v="pending"><span>Menunggu bayar</span><b>'+pend+'</b></a><a href="#/admin/orders" data-act="segto" data-v="paid"><span>Siap dikemas atau dikirim</span><b>'+pack+'</b></a><a href="#/admin/orders" data-act="segto" data-v="retur"><span>Pengajuan retur</span><b>'+rq+"</b></a></div></div>"
+'<div class="card2"><h3>Pesanan per status</h3><ul class="lst">'+Object.keys(ST).map(function(k){return "<li><span>"+ST[k]+"</span><b>"+cnt[k]+"</b></li>"}).join("")+"</ul></div></div>"
+'<div class="card2"><h3>Omzet harian ('+days+' hari terakhir)</h3><div class="chart" role="img" aria-label="Grafik omzet harian">'+bars.map(function(b){return '<div title="'+dt(b[0]+"T12:00:00",1)+": "+rp(b[1])+'"><i style="height:'+Math.max(2,Math.round(b[1]/mx*100))+'%"></i></div>'}).join("")+'</div><div class="cax"><span>'+dt(bars[0][0]+"T12:00:00",1)+"</span><span>Puncak "+rp(mx===1?0:mx)+"</span><span>Hari ini</span></div></div>"
+'<div class="g2"><div class="card2"><h3>Produk terlaris</h3><ul class="lst">'+(tops.map(function(t){return "<li><span>"+esc(t[0])+"</span><b>"+t[1]+" pcs</b></li>"}).join("")||"<li>Belum ada data.</li>")+'</ul></div><div class="card2"><h3>Penjualan per kategori</h3><ul class="lst">'+(cats.map(function(t){return "<li><span>"+esc(t[0])+"</span><b>"+rp(t[1])+"</b></li>"}).join("")||"<li>Belum ada data.</li>")+"</ul></div></div>"
+'<div class="card2"><h3>Stok menipis (2 atau kurang)</h3><ul class="lst">'+(low.slice(0,10).map(function(l){return '<li><span><a href="#/admin/products/'+l[0].id+'">'+esc(l[0].name)+"</a> "+esc(l[1])+" / "+esc(l[2])+'</span><b>'+(l[3]?l[3]+" sisa":"Habis")+"</b></li>"}).join("")||"<li>Semua stok aman.</li>")+"</ul>"+(low.length>10?"<small>dan "+(low.length-10)+" varian lain</small>":"")+"</div>"
+'<div class="acts"><button class="btn" data-act="csvo">Unduh pesanan (CSV)</button><button class="btn ghost" data-act="csvp">Unduh stok produk (CSV)</button><button class="btn danger'+(armed.reset?" armed":"")+'" data-act="reset">'+(armed.reset?"Tekan lagi untuk reset":"Reset data demo")+"</button></div>"}
var SEGS=[["all","Semua"],["pending","Menunggu bayar"],["paid","Diproses"],["packed","Dikemas"],["shipped","Dikirim"],["done","Selesai"],["cancelled","Dibatalkan"],["retur","Retur"]];
function segMatch(o,s){if(s==="all")return true;if(s==="retur")return o.returns.length>0;return o.status===s}
function ordersList(){
var q=ADMTAB.q.trim().toLowerCase(),seg=ADMTAB.seg;
var l=S.orders.filter(function(o){return segMatch(o,seg)&&(!q||(o.no+" "+o.cust.nama).toLowerCase().indexOf(q)>-1)});
return l.length?l.map(function(o){var rq=o.returns.filter(function(r){return r.status==="diajukan"}).length;return '<div class="arow"><div class="m"><a href="#/admin/orders/'+esc(o.no)+'"><b class="mono">'+esc(o.no)+"</b></a> "+esc(o.cust.nama)+"<small>"+dt(o.at)+" - "+o.items.reduce(function(s,i){return s+i.qty},0)+" barang - "+(o.pay.method==="cod"?"COD":o.pay.method==="ewallet"?"E-wallet":"Transfer")+'</small></div><div class="r"><b>'+rp(o.total)+'</b><span class="badge '+o.status+'">'+ST[o.status]+"</span>"+(rq?'<span class="badge diajukan">Retur</span>':"")+"</div></div>"}).join(""):'<div class="none">Tidak ada pesanan.</div>'}
function viewOrders(){
return '<div class="ahead"><h1>Pesanan</h1><button class="btn ghost sm" data-act="csvo">Unduh CSV</button></div><div class="seg" role="group" aria-label="Filter status">'+SEGS.map(function(s){var n=S.orders.filter(function(o){return segMatch(o,s[0])}).length;return '<button class="chip" data-act="seg" data-v="'+s[0]+'" aria-pressed="'+(ADMTAB.seg===s[0])+'">'+s[1]+"<small>"+n+"</small></button>"}).join("")+'</div><label class="fld"><span class="sr">Cari pesanan</span><input id="oq" placeholder="Cari nomor atau nama" value="'+esc(ADMTAB.q)+'" data-ch="oq"></label><div id="olist">'+ordersList()+"</div>"}
function genResi(no){return "NLX"+String(7100000000+(parseInt(no.slice(3),10)%1000)*7919+S.seq.order*13).slice(0,10)}
function viewOrder(no){
var o=S.orders.filter(function(x){return x.no===no})[0];
if(!o)return '<h1>Pesanan tidak ditemukan</h1><a class="btn" href="#/admin/orders">Kembali</a>';
var a="",nx={pending:["paid","Konfirmasi pembayaran"],paid:["packed","Mulai kemas"],packed:["shipped","Kirim pesanan"],shipped:["done","Tandai selesai"]}[o.status];
var ship=nx&&nx[0]==="shipped"?'<label class="fld" style="max-width:320px"><span>Nomor resi (contoh)</span><input id="resi" value="'+esc(o.resi||genResi(o.no))+'" maxlength="30" class="mono"><em class="err" data-e="resi"></em></label>':"";
if(nx)a='<button class="btn" data-act="advance" data-no="'+o.no+'">'+nx[1]+"</button>";
if(o.status==="pending"||o.status==="paid"||o.status==="packed")a+='<button class="btn danger'+(armed["ac"+o.no]?" armed":"")+'" data-act="admcancel" data-no="'+o.no+'">'+(armed["ac"+o.no]?"Tekan lagi untuk batal":"Batalkan pesanan")+"</button>";
return '<div class="ahead noprint"><h1><span class="mono">'+esc(o.no)+'</span> <span class="badge '+o.status+'">'+ST[o.status]+'</span></h1><a class="btn ghost sm" href="#/admin/orders">Semua pesanan</a></div><div class="g2"><div><div class="card2"><h3>Pembeli</h3><p style="margin:0">'+esc(o.cust.nama)+"<br>"+esc(o.cust.hp)+(o.cust.email?"<br>"+esc(o.cust.email):"")+"<br>"+esc(o.cust.alamat)+", "+esc(o.cust.kota)+", "+esc(o.cust.prov)+" "+esc(o.cust.pos)+(o.cust.catatan?"<br><i>Catatan: "+esc(o.cust.catatan)+"</i>":"")+'</p></div><div class="card2"><h3>Barang</h3>'+totalsHtml(o)+'<p style="margin:10px 0 0;color:var(--mute);font-size:.86rem">Kurir: '+esc(o.courier.n)+(o.resi?". Resi: <span class=\"mono\">"+esc(o.resi)+"</span>":"")+". Bayar: "+(o.pay.method==="cod"?"COD":o.pay.method==="ewallet"?"E-wallet "+esc(o.pay.via):"Transfer bank")+".</p></div></div><div><div class=\"card2 noprint\"><h3>Alur status</h3>"+timeline(o)+(a?ship+'<div class="acts">'+a+"</div>":"")+'<div class="acts"><button class="btn ghost sm" data-act="print">Cetak faktur</button></div></div>'+returnsHtml(o,true)+"</div></div>"}
function viewProducts(){
return '<div class="ahead"><h1>Produk</h1><div class="acts" style="margin:0"><a class="btn sm" href="#/admin/products/new">Tambah produk</a><button class="btn ghost sm" data-act="csvp">Unduh CSV</button></div></div>'+S.products.map(function(p){var ts=totStock(p);return '<div class="arow p"><div class="th">'+pArt(p,p.colors[0])+'</div><div class="m"><a href="#/admin/products/'+p.id+'"><b>'+esc(p.name)+"</b></a><small>"+esc(p.cat)+" - "+rp(p.price)+" - "+p.sizes.length+" ukuran, "+p.colors.length+' warna</small><span class="pt'+(ts===0?" off":ts<=5?" low":"")+'">Stok '+ts+'</span> <span class="pt'+(p.active?"":" off")+'">'+(p.active?"Tampil":"Disembunyikan")+'</span></div><div class="r"><button class="btn ghost sm" data-act="ptoggle" data-id="'+p.id+'">'+(p.active?"Sembunyikan":"Tampilkan")+'</button><a class="btn sm" href="#/admin/products/'+p.id+'">Ubah</a></div></div>'}).join("")}
function stockGrid(){
var h="";var ss=sortSizes(E.sizes);
if(!ss.length||!E.colors.length)return '<p class="note">Pilih minimal satu ukuran dan satu warna.</p>';
ss.forEach(function(s){E.colors.forEach(function(c){h+='<label><b>'+esc(s)+" / "+esc(c)+'</b><span class="sr">Stok </span><input inputmode="numeric" data-ch="stk" data-k="'+esc(vk(s,c))+'" value="'+esc(E.stock[vk(s,c)]==null?0:E.stock[vk(s,c)])+'"></label>'})});
return '<div class="sgrid">'+h+"</div>"}
function viewProductForm(id){
if(!E||E.id!==id){var p=id==="new"?null:prod(+id);if(id!=="new"&&!p)return '<h1>Produk tidak ditemukan</h1><a class="btn" href="#/admin/products">Kembali</a>';
E=p?JSON.parse(JSON.stringify(p)):{id:"new",name:"",cat:"Kaos",type:"kaos",price:"",was:"",desc:"",mat:"",pat:"plain",sizes:["S","M","L"],colors:["Hitam"],stock:{},active:true,reviews:[],bg:BGS[0]};
E.id=id==="new"?"new":p.id;if(!E.was)E.was=""}
var er=E.err||{};
function opts(o,sel){return Object.keys(o).map(function(k){return '<option value="'+k+'"'+(k===sel?" selected":"")+">"+esc(o[k])+"</option>"}).join("")}
return '<div class="ahead"><h1>'+(id==="new"?"Produk baru":"Ubah produk")+'</h1><a class="btn ghost sm" href="#/admin/products">Semua produk</a></div><form data-form="product" novalidate><div class="g2"><div><label class="fld"><span>Nama produk</span><input name="name" value="'+esc(E.name)+'" maxlength="70" aria-invalid="'+(!!er.name)+'"><em class="err" data-e="name">'+esc(er.name||"")+'</em></label><div class="two"><label class="fld"><span>Kategori</span><select name="cat">'+CATS.map(function(c){return "<option"+(c===E.cat?" selected":"")+">"+c+"</option>"}).join("")+'</select></label><label class="fld"><span>Jenis ilustrasi</span><select name="type" data-ch="prev">'+opts(TYPES,E.type)+'</select></label></div><div class="two"><label class="fld"><span>Harga (Rp)</span><input name="price" inputmode="numeric" value="'+esc(E.price)+'" aria-invalid="'+(!!er.price)+'"><em class="err" data-e="price">'+esc(er.price||"")+'</em></label><label class="fld"><span>Harga coret <small>(opsional)</small></span><input name="was" inputmode="numeric" value="'+esc(E.was)+'" aria-invalid="'+(!!er.was)+'"><em class="err" data-e="was">'+esc(er.was||"")+'</em></label></div><label class="fld"><span>Deskripsi</span><textarea name="desc" maxlength="400">'+esc(E.desc)+'</textarea></label><div class="two"><label class="fld"><span>Bahan</span><input name="mat" value="'+esc(E.mat)+'" maxlength="60"></label><label class="fld"><span>Pola</span><select name="pat" data-ch="prev">'+opts(PATS,E.pat)+"</select></label></div></div><div>"
+'<div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:14px"><div class="prev" id="prev" aria-hidden="true"></div><p class="note" style="flex:1;margin:0">Foto contoh mengikuti jenis produk. Demo ini tidak mengunggah foto sendiri.</p></div><fieldset class="fs"><legend style="font-size:.9rem">Ukuran</legend>'+SIZES.map(function(s){return '<label class="chk"><input type="checkbox" data-ch="esz" value="'+s+'"'+(E.sizes.indexOf(s)>-1?" checked":"")+">"+s+"</label>"}).join("")+'<em class="err" data-e="sizes">'+esc(er.sizes||"")+'</em></fieldset><fieldset class="fs"><legend style="font-size:.9rem">Warna</legend>'+Object.keys(COL).map(function(c){return '<label class="chk"><input type="checkbox" data-ch="eco" value="'+c+'"'+(E.colors.indexOf(c)>-1?" checked":"")+'><i style="width:14px;height:14px;border-radius:50%;background:'+COL[c]+';border:1px solid #999;display:inline-block"></i>'+c+"</label>"}).join("")+'<em class="err" data-e="colors">'+esc(er.colors||"")+'</em></fieldset><label class="chk"><input type="checkbox" name="active"'+(E.active?" checked":"")+">Tampilkan di toko</label></div></div>"
+'<div class="card2" style="margin-top:14px"><h3>Stok per varian</h3><div style="display:flex;gap:8px;align-items:end;margin-bottom:12px;flex-wrap:wrap"><label class="fld" style="margin:0"><span>Isi semua dengan</span><input id="fillall" inputmode="numeric" style="width:120px" value="10"></label><button type="button" class="btn ghost sm" data-act="fillstock">Terapkan</button></div><div id="stockgrid">'+stockGrid()+'</div><em class="err" data-e="stock">'+esc(er.stock||"")+'</em></div><div class="acts"><button class="btn" type="submit">Simpan produk</button><a class="btn ghost" href="#/admin/products">Batal</a>'+(id!=="new"?'<button type="button" class="btn danger'+(armed["dp"+id]?" armed":"")+'" data-act="pdel" data-id="'+id+'">'+(armed["dp"+id]?"Tekan lagi untuk hapus":"Hapus produk")+"</button>":"")+"</div></form>"}
function drawPrev(){var el=$("#prev");if(!el||!E)return;var f=$("form[data-form=product]");el.innerHTML='<img src="img/'+(TYPEIMG[f.elements.type.value]||"kaos-polos")+'.jpg" alt="" width="800" height="960">'}
function promoRule(p){return (p.type==="pct"?p.value+"% (maks "+(p.max?rp(p.max):"tanpa batas")+")":p.type==="nom"?"Potongan "+rp(p.value):p.value?"Potongan ongkir maks "+rp(p.value):"Gratis ongkir")+(p.min?", min "+rp(p.min):"")+(p.cat?", kategori "+p.cat:"")}
function viewPromos(){
return '<div class="ahead"><h1>Promo</h1><a class="btn sm" href="#/admin/promos/new">Tambah kode</a></div>'+S.promos.map(function(p){var exp=p.expires&&todayStr()>p.expires;return '<div class="arow"><div class="m"><b class="mono">'+esc(p.code)+'</b> <span class="pt'+(p.active&&!exp?"":" off")+'">'+(exp?"Kedaluwarsa":p.active?"Aktif":"Nonaktif")+"</span><small>"+esc(promoRule(p))+"</small><small>Dipakai "+p.used+(p.quota?" dari "+p.quota:"")+"x"+(p.expires?" - berlaku sampai "+dt(p.expires+"T12:00:00",1):"")+'</small></div><div class="r"><button class="btn ghost sm" data-act="pactive" data-id="'+p.id+'">'+(p.active?"Nonaktifkan":"Aktifkan")+'</button><a class="btn sm" href="#/admin/promos/'+p.id+'">Ubah</a></div></div>'}).join("")}
function viewPromoForm(id){
var p=id==="new"?{id:"new",code:"",type:"pct",value:10,min:0,max:0,cat:"",expires:ymd(Date.now()+30*864e5),quota:0,used:0,active:true}:S.promos.filter(function(x){return String(x.id)===id})[0];
if(!p)return '<h1>Kode tidak ditemukan</h1><a class="btn" href="#/admin/promos">Kembali</a>';
var er=PE;
return '<div class="ahead"><h1>'+(id==="new"?"Kode promo baru":"Ubah kode promo")+'</h1><a class="btn ghost sm" href="#/admin/promos">Semua promo</a></div><form data-form="promo-edit" data-id="'+id+'" novalidate style="max-width:560px"><label class="fld"><span>Kode</span><input name="code" value="'+esc(p.code)+'" maxlength="20" style="text-transform:uppercase" aria-invalid="'+(!!er.code)+'"><em class="err" data-e="code">'+esc(er.code||"")+'</em></label><div class="two"><label class="fld"><span>Jenis</span><select name="type"><option value="pct"'+(p.type==="pct"?" selected":"")+'>Persen</option><option value="nom"'+(p.type==="nom"?" selected":"")+'>Potongan rupiah</option><option value="ongkir"'+(p.type==="ongkir"?" selected":"")+'>Potongan ongkir</option></select></label><label class="fld"><span>Nilai <small>(persen atau rupiah, 0 = gratis ongkir penuh)</small></span><input name="value" inputmode="numeric" value="'+esc(p.value)+'" aria-invalid="'+(!!er.value)+'"><em class="err" data-e="value">'+esc(er.value||"")+'</em></label></div><div class="two"><label class="fld"><span>Minimal belanja (Rp)</span><input name="min" inputmode="numeric" value="'+esc(p.min)+'"></label><label class="fld"><span>Maksimal potongan persen (Rp, 0 = bebas)</span><input name="max" inputmode="numeric" value="'+esc(p.max)+'"></label></div><div class="two"><label class="fld"><span>Kategori</span><select name="cat"><option value="">Semua kategori</option>'+CATS.map(function(c){return "<option"+(p.cat===c?" selected":"")+">"+c+"</option>"}).join("")+'</select></label><label class="fld"><span>Berlaku sampai</span><input name="expires" type="date" value="'+esc(p.expires)+'"></label></div><label class="fld" style="max-width:260px"><span>Kuota pemakaian <small>(0 = tanpa batas)</small></span><input name="quota" inputmode="numeric" value="'+esc(p.quota)+'"></label><div class="acts"><button class="btn" type="submit">Simpan</button><a class="btn ghost" href="#/admin/promos">Batal</a>'+(id!=="new"?'<button type="button" class="btn danger'+(armed["dm"+id]?" armed":"")+'" data-act="mdel" data-id="'+id+'">'+(armed["dm"+id]?"Tekan lagi untuk hapus":"Hapus kode")+"</button>":"")+"</div></form>"}

/* ---------- aksi ---------- */
var PEND="";
function secGo(id){PEND=id==="kategori"?"kat":id;if(routeName()==="home")render(true);else location.hash="#/"}
function closeMenu(){var m=$("#mnu");if(!m||m.hidden)return;m.hidden=true;document.body.classList.remove("mopen");$$("[data-act=menu]").forEach(function(b){b.setAttribute("aria-expanded","false")});var mb=$(".menub");if(mb)mb.focus()}
function toggleMenu(){var m=$("#mnu");if(m.hidden){m.hidden=false;document.body.classList.add("mopen");$$("[data-act=menu]").forEach(function(b){b.setAttribute("aria-expanded","true")});$("#mnu .mtop .ib").focus()}else closeMenu()}
document.addEventListener("keydown",function(e){var m=$("#mnu");if(!m||m.hidden)return;if(e.key==="Escape"){closeMenu();return}
if(e.key==="Tab"){var f=$$("#mnu a,#mnu button");if(!f.length)return;var fi=f[0],la=f[f.length-1];if(e.shiftKey&&document.activeElement===fi){e.preventDefault();la.focus()}else if(!e.shiftKey&&document.activeElement===la){e.preventDefault();fi.focus()}}});
document.addEventListener("click",function(e){if(e.target.closest("#mnu a")&&!e.target.closest("[data-act]")){var m=$("#mnu");m.hidden=true;document.body.classList.remove("mopen");$$("[data-act=menu]").forEach(function(b){b.setAttribute("aria-expanded","false")})}});
document.addEventListener("click",function(e){var m=$("#mnu");if(m&&!m.hidden&&!e.target.closest("#mnu")&&!e.target.closest("[data-act=menu]"))closeMenu()},true);
function closeMenuQuiet(){var m=$("#mnu");if(m&&!m.hidden){m.hidden=true;document.body.classList.remove("mopen");$$("[data-act=menu]").forEach(function(b){b.setAttribute("aria-expanded","false")})}}
function go(h){if(location.hash===h)render(true);else location.hash=h}
function badges(){var q=0;S.cart.items.forEach(function(i){q+=i.qty});var c=$("#cn"),w=$("#wn");c.textContent=q;c.hidden=!q;w.textContent=S.wish.length;w.hidden=!S.wish.length}
function twice(key,el){
if(armed[key]){delete armed[key];return true}
armed[key]=1;var orig=el.textContent;el.classList.add("armed");el.textContent="Tekan lagi untuk "+(key==="reset"?"reset":/^(cx|ac)/.test(key)?"batal":"hapus");
setTimeout(function(){if(armed[key]){delete armed[key];el.classList.remove("armed");el.textContent=orig}},3500);return false}
function doReset(){try{localStorage.removeItem(KEY)}catch(e){}S=seed();save();C=null;E=null;PE={};T={no:"",hp:""};RET=null;F={q:"",cat:"",sizes:[],cols:[],min:"",max:"",sort:"new",open:false};D={id:0,size:"",color:"",qty:1,guide:false};$("#hq").value="";badges();toast("Data demo dikembalikan ke awal.");go("#/");render()}
function setStatus(o,s,note){o.status=s;o.hist.push({s:s,at:nowIso(),note:note||""})}
function cancelOrder(o,note){
o.items.forEach(function(i){var p=prod(i.pid);if(p&&p.stock[vk(i.size,i.color)]!=null)p.stock[vk(i.size,i.color)]=stockOf(p,i.size,i.color)+i.qty});
if(o.promo){var pr=S.promos.filter(function(x){return x.code===o.promo.code})[0];if(pr&&pr.used>0)pr.used--}
setStatus(o,"cancelled",note)}
function getOrder(no){return S.orders.filter(function(x){return x.no===no})[0]}
function download(name,rows){
var txt="﻿"+rows.map(function(r){return r.map(function(c){if(typeof c!=="number"){c=String(c==null?"":c);if(/^[=+\-@\t\r]/.test(c))c="'"+c}else c=String(c);return /[",\n;]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(",")}).join("\r\n");
var a=document.createElement("a"),u=URL.createObjectURL(new Blob([txt],{type:"text/csv;charset=utf-8"}));a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},500);toast("File "+name+" diunduh.")}
function csvOrders(){
var rows=[["Nomor","Tanggal","Status","Pembeli","HP","Kota","Produk","Ukuran","Warna","Jumlah","Harga satuan","Subtotal baris","Kurir","Resi","Pembayaran","Total pesanan"]];
S.orders.forEach(function(o){o.items.forEach(function(i){rows.push([o.no,dt(o.at),ST[o.status],o.cust.nama,o.cust.hp,o.cust.kota,i.name,i.size,i.color,i.qty,i.price,i.price*i.qty,o.courier.n,o.resi,o.pay.method+(o.pay.via?" "+o.pay.via:""),o.total])})});
download("pesanan-nola-"+todayStr()+".csv",rows)}
function csvProducts(){
var rows=[["Produk","Kategori","Harga","Ukuran","Warna","Stok","Tampil"]];
S.products.forEach(function(p){sortSizes(p.sizes).forEach(function(s){p.colors.forEach(function(c){rows.push([p.name,p.cat,p.price,s,c,stockOf(p,s,c),p.active?"Ya":"Tidak"])})})});
download("stok-nola-"+todayStr()+".csv",rows)}
function setErr(form,errs){
$$("[data-e]",form).forEach(function(e){e.textContent=errs[e.dataset.e]||""});
$$("[aria-invalid]",form).forEach(function(i){i.setAttribute("aria-invalid",String(!!errs[i.name]))});
var first=Object.keys(errs)[0];if(first){var f=form.elements[first]||$("[data-e="+first+"]",form);if(f&&f.focus)f.focus()}}
function onClick(e){
var el=e.target.closest("[data-act]");if(!el)return;var a=el.dataset.act,v=el.dataset.v,id=+el.dataset.id,no=el.dataset.no,p,o;
switch(a){
case"skip":e.preventDefault();$("#app").focus();return;
case"reset":if(twice("reset",el))doReset();return;
case"toshop":e.preventDefault();closeMenu();secGo(v||"shop");return;
case"menu":toggleMenu();return;
case"stoggle":var sb=$("#sbar");sb.hidden=!sb.hidden;el.setAttribute("aria-expanded",String(!sb.hidden));if(!sb.hidden)$("#hq").focus();return;
case"rail":var rl=$("#rail");if(rl)rl.scrollBy({left:(+v)*rl.clientWidth*.8,behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});return;
case"wish":e.preventDefault();var k=S.wish.indexOf(id);if(k>-1){S.wish.splice(k,1);toast("Dihapus dari wishlist.")}else{S.wish.push(id);toast("Disimpan ke wishlist.",0,["#/wishlist","Lihat"])}save();badges();render(true);return;
case"fcat":F.cat=v;drawFilters();drawGrid();return;
case"fsize":case"fcol":var arr=a==="fsize"?F.sizes:F.cols,ix=arr.indexOf(v);if(ix>-1)arr.splice(ix,1);else arr.push(v);drawFilters();drawGrid();return;
case"freset":F.cat="";F.sizes=[];F.cols=[];F.min="";F.max="";F.q="";$("#hq").value="";drawFilters();drawGrid();return;
case"ftoggle":F.open=!F.open;$("#fil").classList.toggle("open",F.open);el.setAttribute("aria-expanded",String(F.open));return;
case"gocat":e.preventDefault();F.cat=v;F.sizes=[];F.cols=[];F.q="";$("#hq").value="";PEND="shop";if(routeName()==="home")render(true);else location.hash="#/";return;
case"selcol":D.color=v;render(true);return;
case"selsize":D.size=v;render(true);return;
case"gtoggle":D.guide=!D.guide;render(true);return;
case"dq":D.qty=Math.max(1,D.qty+(+v));render(true);return;
case"addcart":p=prod(D.id);if(!p)return;
if(!D.size){toast("Pilih ukuran dulu.",1);return}
var st=stockOf(p,D.size,D.color),have=inCart(p.id,D.size,D.color);
if(st<=0){toast("Varian ini habis.",1);return}
if(have+D.qty>st){toast("Stok tidak cukup. Tersisa "+st+", di keranjang "+have+".",1);return}
var ex=S.cart.items.filter(function(i){return i.pid===p.id&&i.size===D.size&&i.color===D.color})[0];
if(ex)ex.qty+=D.qty;else S.cart.items.push({pid:p.id,size:D.size,color:D.color,qty:D.qty});
D.qty=1;save();badges();toast(p.name+" masuk keranjang.",0,["#/cart","Lihat keranjang"]);render(true);return;
case"cq":var it=S.cart.items[+el.dataset.i];if(!it)return;var pp=prod(it.pid),mx=stockOf(pp,it.size,it.color);it.qty=Math.max(1,Math.min(mx||1,it.qty+(+v)));save();badges();render(true);return;
case"cdel":S.cart.items.splice(+el.dataset.i,1);save();badges();render(true);return;
case"promoOff":S.cart.promo="";save();render(true);return;
case"blocked":e.preventDefault();toast("Perbaiki stok barang di keranjang dulu.",1);return;
case"trackgo":return;
case"simpay":o=getOrder(no);if(o&&o.status==="pending"){setStatus(o,"paid","Pembayaran diterima (simulasi)");save();toast("Pembayaran tercatat. Pesanan diproses.");render(true)}return;
case"custcancel":o=getOrder(no);if(!o||o.status!=="pending")return;if(!twice("cx"+no,el))return;cancelOrder(o,"Dibatalkan pembeli");save();toast("Pesanan dibatalkan.");render(true);return;
case"received":o=getOrder(no);if(o&&o.status==="shipped"){setStatus(o,"done","Diterima pembeli");save();toast("Terima kasih. Pesanan selesai.");render(true)}return;
case"retform":RET={no:no};render(true);var rf=$("form[data-form=retur]");if(rf)rf.scrollIntoView();return;
case"retcancel":RET=null;render(true);return;
/* admin */
case"logout":try{sessionStorage.removeItem(ADM)}catch(x){}go("#/admin");render();return;
case"range":ADMTAB.range=+v;render(true);return;
case"segto":ADMTAB.seg=v;return;
case"seg":ADMTAB.seg=v;render(true);return;
case"advance":o=getOrder(no);if(!o)return;var nxt={pending:"paid",paid:"packed",packed:"shipped",shipped:"done"}[o.status];if(!nxt)return;
if(nxt==="shipped"){var rs=($("#resi").value||"").trim().toUpperCase();if(!/^[A-Z0-9-]{6,30}$/.test(rs)){$("[data-e=resi]").textContent="Resi 6-30 karakter huruf, angka, atau tanda hubung.";$("#resi").focus();return}o.resi=rs}
setStatus(o,nxt,nxt==="paid"?"Pembayaran dikonfirmasi penjual":nxt==="shipped"?"Resi "+o.resi:"");save();toast("Status: "+ST[nxt]+".");render(true);return;
case"admcancel":o=getOrder(no);if(!o||["pending","paid","packed"].indexOf(o.status)<0)return;if(!twice("ac"+no,el))return;cancelOrder(o,"Dibatalkan penjual, stok dikembalikan");save();toast("Pesanan dibatalkan, stok dikembalikan.");render(true);return;
case"retok":case"retno":case"retfin":o=getOrder(no);var r=o&&o.returns.filter(function(x){return x.id===el.dataset.id})[0];if(!r)return;
if(a==="retok"){r.status="disetujui";toast("Retur disetujui.")}
else if(a==="retno"){r.status="ditolak";r.note=(r.note?r.note+" ":"")+"[Ditolak: tidak sesuai syarat retur]";toast("Retur ditolak.")}
else{r.status="selesai";r.items.forEach(function(i){var it2=o.items[i.idx],pr2=prod(it2.pid);if(pr2&&pr2.stock[vk(it2.size,it2.color)]!=null)pr2.stock[vk(it2.size,it2.color)]=stockOf(pr2,it2.size,it2.color)+i.qty});toast("Retur selesai, stok dikembalikan.")}
save();render(true);return;
case"print":window.print();return;
case"csvo":csvOrders();return;
case"csvp":csvProducts();return;
case"ptoggle":p=prod(id);if(p){p.active=!p.active;save();render(true);toast(p.active?"Produk ditampilkan.":"Produk disembunyikan.")}return;
case"fillstock":var n=parseInt($("#fillall").value,10);if(!(n>=0)){toast("Isi angka 0 atau lebih.",1);return}syncE();E.sizes.forEach(function(s){E.colors.forEach(function(c){E.stock[vk(s,c)]=n})});$("#stockgrid").innerHTML=stockGrid();return;
case"pdel":p=prod(+id);if(!p)return;if(!twice("dp"+id,el))return;S.products=S.products.filter(function(x){return x.id!==p.id});S.wish=S.wish.filter(function(x){return x!==p.id});cleanCart();E=null;save();badges();toast("Produk dihapus.");go("#/admin/products");return;
case"pactive":var pm=S.promos.filter(function(x){return x.id===id})[0];if(pm){pm.active=!pm.active;save();render(true)}return;
case"mdel":if(!twice("dm"+id,el))return;S.promos=S.promos.filter(function(x){return x.id!==id});save();toast("Kode dihapus.");go("#/admin/promos");return}}
function syncE(){
var f=$("form[data-form=product]");if(!f||!E)return;
["name","cat","type","price","was","desc","mat","pat"].forEach(function(k){E[k]=f.elements[k].value});E.active=f.elements.active.checked;
E.sizes=$$("input[data-ch=esz]:checked",f).map(function(x){return x.value});E.colors=$$("input[data-ch=eco]:checked",f).map(function(x){return x.value});
$$("input[data-ch=stk]",f).forEach(function(x){E.stock[x.dataset.k]=x.value})}
function posInt(v){v=String(v).trim();return /^\d+$/.test(v)?parseInt(v,10):NaN}
function onSubmit(e){
var f=e.target.closest("form[data-form]");if(!f)return;e.preventDefault();var k=f.dataset.form,x=f.elements,er={};
if(k==="search"){F.q=$("#hq").value;PEND="shop";if(routeName()!=="home")go("#/");else{drawGrid();secGo("shop")}return}
if(k==="review"){var p=prod(D.id);if(!p)return;var nm=x.name.value.trim(),tx=x.text.value.trim();
if(nm.length<2)er.name="Isi nama minimal 2 huruf.";if(tx.length<5)er.text="Tulis ulasan minimal 5 huruf.";
if(Object.keys(er).length){setErr(f,er);return}
p.reviews.push({id:++S.seq.rv,name:nm,rating:+x.rating.value,text:tx,at:nowIso()});save();toast("Ulasan terkirim.");render(true);return}
if(k==="promo"){var code=x.code.value.trim().toUpperCase();if(!code){S.cart.promo="";save();render(true);return}
var ls=lines(),sub=0;ls.forEach(function(l){sub+=l.price*l.qty});var pr=promoCheck(code,ls,sub);S.cart.promo=code;save();render(true);if(pr&&pr.ok)toast("Kode "+code+" dipakai.");return}
if(k==="checkout"){doCheckout(f);return}
if(k==="track"){T.no=x.no.value.trim().toUpperCase();T.hp=x.hp.value.trim();RET=null;
if(!T.no||!T.hp)T.msg="Isi nomor pesanan dan nomor HP.";else T.msg=findOrder(T.no,T.hp)?"":"Pesanan tidak ditemukan. Periksa nomor pesanan dan nomor HP.";render(true);return}
if(k==="retur"){var o=getOrder(T.no.toUpperCase());if(!o||!canReturn(o))return;var its=[];
o.items.forEach(function(i,ix){var q=x["q"+ix];if(q&&+q.value>0)its.push({idx:ix,qty:Math.min(+q.value,i.qty-retQty(o,ix))})});
if(!its.length){$("[data-e=ret]",f).textContent="Pilih minimal satu barang untuk diretur.";return}
var rid="R"+(o.returns.length+1);o.returns.push({id:rid,at:nowIso(),items:its,reason:x.reason.value,note:x.note.value.trim(),status:"diajukan",refund:its.reduce(function(s,i){return s+o.items[i.idx].price*i.qty},0)});
RET=null;save();toast("Pengajuan retur terkirim.");render(true);return}
if(k==="login"){if(x.pin.value.trim()===PIN){try{sessionStorage.setItem(ADM,"1")}catch(z){}go("#/admin/summary");render()}else{setErr(f,{pin:"PIN salah. Coba "+PIN+"."});x.pin.value=""}return}
if(k==="product"){saveProduct(f);return}
if(k==="promo-edit"){savePromo(f);return}}
function doCheckout(f){
var x=f.elements,er={},v={};
["nama","hp","email","alamat","kota","pos","catatan"].forEach(function(n){v[n]=x[n].value.trim()});
v.prov=x.prov.value;v.courier=x.courier.value;v.pay=x.pay.value;v.via=x.via.value;
var hp=digits(v.hp);
if(v.nama.length<3)er.nama="Isi nama penerima minimal 3 huruf.";
if(!/^(08\d{8,11}|628\d{8,11})$/.test(hp))er.hp="Nomor HP tidak valid. Contoh: 0812-0000-0000.";
if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))er.email="Format email belum benar.";
if(v.alamat.length<8)er.alamat="Isi alamat lengkap (jalan, nomor, RT/RW).";
if(v.kota.length<3)er.kota="Isi kota atau kabupaten.";
if(!v.prov)er.prov="Pilih provinsi.";
if(!/^\d{5}$/.test(v.pos))er.pos="Kode pos harus 5 angka.";
C=Object.assign(C||{},v);C.err=er;
cleanCart();var ls=lines(),short=ls.filter(function(l){return l.stock<l.qty});
var box=$("#ckerr");
if(!ls.length){go("#/cart");return}
if(short.length){render(true);var b2=$("#ckerr");b2.hidden=false;b2.textContent="Stok berubah: "+short.map(function(l){return l.p.name+" "+l.size+"/"+l.color+" (sisa "+l.stock+")"}).join(", ")+". Ubah keranjang dulu.";return}
if(Object.keys(er).length){render(true);var inv=$("[aria-invalid=true]");if(inv)inv.focus();return}
var t=calc(v.courier,v.pay);
S.seq.order++;var no="NL-"+(260000+S.seq.order);
ls.forEach(function(l){l.p.stock[vk(l.size,l.color)]=l.stock-l.qty});
var pr=t.pr&&t.pr.ok?t.pr:null;if(pr)pr.p.used++;
var o={no:no,at:nowIso(),cust:{nama:v.nama,hp:fmtHp(v.hp),email:v.email,alamat:v.alamat,kota:v.kota,prov:v.prov,pos:v.pos,catatan:v.catatan},items:ls.map(function(l){return {pid:l.p.id,name:l.p.name,size:l.size,color:l.color,qty:l.qty,price:l.price,type:l.p.type,pat:l.p.pat,bg:l.p.bg}}),sub:t.sub,promo:pr?{code:pr.p.code,disc:t.disc}:null,courier:{id:t.courier.id,n:t.courier.n,cost:t.ship},shipDisc:t.sd,cod:t.cod,uniq:t.uniq,total:t.total,pay:{method:v.pay,via:v.pay==="ewallet"?v.via:""},status:"pending",hist:[],resi:"",returns:[]};
if(v.pay==="cod"){setStatus(o,"paid","Pesanan COD, bayar saat diterima")}else setStatus(o,"pending","Menunggu pembayaran");
S.orders.unshift(o);S.profile={nama:v.nama,hp:v.hp,email:v.email,alamat:v.alamat,kota:v.kota,prov:v.prov,pos:v.pos};
S.cart={items:[],promo:""};C=null;T={no:no,hp:o.cust.hp};save();badges();go("#/done/"+no)}
function saveProduct(f){
syncE();var er={},nm=E.name.trim(),pr=posInt(E.price),wa=String(E.was).trim()===""?0:posInt(E.was);
if(nm.length<3)er.name="Nama minimal 3 huruf.";
if(!(pr>=1000))er.price="Harga harus angka, minimal Rp1.000.";
if(isNaN(wa)||(wa&&wa<=pr))er.was="Harga coret harus lebih tinggi dari harga jual, atau kosongkan.";
if(!E.sizes.length)er.sizes="Pilih minimal satu ukuran.";
if(!E.colors.length)er.colors="Pilih minimal satu warna.";
var st={},bad=false;E.sizes.forEach(function(s){E.colors.forEach(function(c){var n=posInt(E.stock[vk(s,c)]==null?0:E.stock[vk(s,c)]);if(isNaN(n)){bad=true}else st[vk(s,c)]=n})});
if(bad)er.stock="Stok harus angka 0 atau lebih di semua varian.";
if(Object.keys(er).length){E.err=er;render(true);var inv=$("[aria-invalid=true]")||$(".err:not(:empty)");if(inv&&inv.focus)inv.focus();return}
var p=E.id==="new"?null:prod(E.id),isNew=!p;
if(isNew){var nid=++S.seq.pid;p={id:nid,n:nid,reviews:[],bg:BGS[nid%BGS.length]};S.products.push(p)}
p.name=nm;p.cat=E.cat;p.type=E.type;p.price=pr;p.was=wa;p.desc=E.desc.trim();p.mat=E.mat.trim();p.pat=E.pat;p.sizes=sortSizes(E.sizes);p.colors=Object.keys(COL).filter(function(c){return E.colors.indexOf(c)>-1});p.stock=st;p.active=!!E.active;
E=null;save();cleanCart();badges();toast(isNew?"Produk ditambahkan.":"Produk disimpan.");go("#/admin/products")}
function savePromo(f){
var x=f.elements,id=f.dataset.id,er={},code=x.code.value.trim().toUpperCase(),val=posInt(x.value.value),mn=posInt(x.min.value||"0"),mx=posInt(x.max.value||"0"),qt=posInt(x.quota.value||"0"),type=x.type.value;
if(!/^[A-Z0-9]{3,20}$/.test(code))er.code="Kode 3-20 karakter huruf besar atau angka.";
else if(S.promos.some(function(p){return p.code===code&&String(p.id)!==id}))er.code="Kode sudah dipakai.";
if(isNaN(val)||(type==="pct"&&(val<1||val>100))||(type==="nom"&&val<1))er.value=type==="pct"?"Persen 1 sampai 100.":"Isi angka rupiah yang benar.";
if(isNaN(mn)||isNaN(mx)||isNaN(qt))er.value=er.value||"Minimal, maksimal, dan kuota harus angka.";
if(x.expires.value&&!/^\d{4}-\d{2}-\d{2}$/.test(x.expires.value))er.expires="Tanggal tidak valid.";
PE=er;if(Object.keys(er).length){render(true);var inv=$("[aria-invalid=true]");if(inv)inv.focus();return}
var p=id==="new"?null:S.promos.filter(function(q){return String(q.id)===id})[0],isNew=!p;
if(isNew){p={id:++S.seq.promo,used:0,active:true};S.promos.push(p)}
p.code=code;p.type=type;p.value=val;p.min=mn;p.max=mx;p.cat=x.cat.value;p.expires=x.expires.value;p.quota=qt;
PE={};save();toast("Kode promo disimpan.");go("#/admin/promos")}
function onInput(e){
var t=e.target,ch=t.dataset&&t.dataset.ch,f=t.closest&&t.closest("form[data-form]");
if(ch==="q"){F.q=t.value;if(routeName()!=="home")go("#/");else drawGrid();return}
if(ch==="pmin"){F.min=t.value.replace(/\D/g,"");drawGrid();return}
if(ch==="pmax"){F.max=t.value.replace(/\D/g,"");drawGrid();return}
if(ch==="sort"){F.sort=t.value;drawGrid();return}
if(ch==="oq"){ADMTAB.q=t.value;$("#olist").innerHTML=ordersList();return}
if(ch==="stk"){E.stock[t.dataset.k]=t.value;return}
if(ch==="esz"||ch==="eco"){if(e.type!=="change")return;syncE();$("#stockgrid").innerHTML=stockGrid();drawPrev();return}
if(ch==="prev"){if(e.type!=="change")return;syncE();drawPrev();return}
if(f&&f.dataset.form==="checkout"){
if(t.name==="courier"||t.name==="pay"){if(e.type!=="change")return;C=C||{};C.courier=f.elements.courier.value;C.pay=f.elements.pay.value;var tt=calc(C.courier,C.pay);$("#sumx").innerHTML=promoBoxCk(tt)+sumRows(tt,true);$("#via").hidden=C.pay!=="ewallet";return}
if(t.name&&C)C[t.name]=t.value}
if(f&&f.dataset.form==="product"&&E&&t.name&&!ch){E[t.name]=t.type==="checkbox"?t.checked:t.value}}
/* ---------- router ---------- */
function parts(){return location.hash.replace(/^#\/?/,"").split("/").filter(Boolean).map(decodeURIComponent)}
function routeName(){var p=parts();return p[0]==="p"?"product":p[0]||"home"}
function render(keep){
var y=window.scrollY,ae=document.activeElement,fk=ae&&ae.dataset?ae.dataset.fk:null,pt=parts(),r=routeName(),h="",adm=r==="admin";
cleanCart();
document.body.classList.toggle("adm",adm);
if(adm){
if(!isAdm())h=viewLogin();
else{var tab=pt[1]||"summary",sub=pt[2];
if(tab==="summary")h=aShell(tab,viewSummary());
else if(tab==="orders")h=aShell(tab,sub?viewOrder(sub):viewOrders());
else if(tab==="products")h=aShell(tab,sub?viewProductForm(sub):(E=null,viewProducts()));
else if(tab==="promos")h=aShell(tab,sub?viewPromoForm(sub):(PE={},viewPromos()));
else h=aShell("summary",viewSummary())}
document.title="Panel penjual | NOLA Studio"}
else{
if(r==="home")h=viewHome();else if(r==="product")h=viewProduct(parseInt(pt[1],10));else if(r==="cart")h=viewCart();else if(r==="wishlist")h=viewWish();else if(r==="checkout")h=viewCheckout();else if(r==="done")h=viewDone(pt[1]);else if(r==="track")h=viewTrack();else h=viewHome();
document.title="NOLA Studio | Contoh toko online pakaian"}
$("#app").innerHTML=h;topbarSet();
$$("[data-nav]").forEach(function(a){a.classList.toggle("on",a.dataset.nav===r||(a.dataset.nav==="home"&&r==="product"));if(a.dataset.nav===r)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
if(!adm){if(r==="home"){drawFilters();drawGrid()}}
else if(isAdm()&&pt[1]==="products"&&pt[2])drawPrev();
badges();
if(keep)window.scrollTo(0,y);else window.scrollTo(0,0);
if(PEND){var tg=$("#"+PEND);PEND="";if(tg)tg.scrollIntoView({block:"start"})}
closeMenuQuiet();
if(fk){var n=$('[data-fk="'+fk+'"]');if(n&&!n.disabled)n.focus({preventScroll:true})}}
document.addEventListener("click",onClick);
document.addEventListener("submit",onSubmit);
document.addEventListener("input",onInput);
document.addEventListener("change",onInput);
window.addEventListener("hashchange",function(){render(false)});
window.NOLA={state:function(){return S},render:render};
$("#hq").value=F.q;
render(false);
})();
