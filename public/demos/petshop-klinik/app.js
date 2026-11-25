/* Pawku Petshop & Klinik: demo fiktif. Semua data di localStorage, tanpa backend. */
var KEY = "petshop-klinik.v1";
var PHOTO = {
  hero: "img/hero.jpg", cat1: "img/kucing-1.jpg", cat2: "img/kucing-2.jpg", cat3: "img/kucing-3.jpg", dog1: "img/anjing-1.jpg", dog2: "img/anjing-2.jpg", dog3: "img/anjing-3.jpg",
  kibbleC: "img/pakan-kucing.jpg", kibbleD: "img/pakan-anjing.jpg", litter: "img/pasir.jpg", box: "img/tempat-pasir.jpg", collar: "img/kalung.jpg",
  bowl: "img/mangkuk.jpg", brush: "img/sisir.jpg", vit: "img/vitamin.jpg", toy: "img/mainan.jpg", groom: "img/grooming.jpg", vet: "img/hero.jpg", wet: "img/pakan-basah.jpg"
};
var DAY = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"], MON = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function rp(n) { return "Rp" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function today() { return ymd(new Date()); }
function addD(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return ymd(d); }
function diff(a, b) { return Math.round((parse(a) - parse(b)) / 864e5); }
function fd(s) { var d = parse(s); return DAY[d.getDay()] + ", " + d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
function fds(s) { var d = parse(s); return d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
function tmin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
function mt(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
function nowStr() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
function ageOf(born) {
  if (!born) return "-";
  var a = parse(born), b = new Date(), m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() - (b.getDate() < a.getDate() ? 1 : 0);
  if (m < 0) m = 0;
  if (m < 12) return m + " bln";
  return Math.floor(m / 12) + " th" + (m % 12 ? " " + (m % 12) + " bln" : "");
}
function normPhone(s) { var d = String(s).replace(/\D/g, ""); if (d.indexOf("62") === 0) d = "0" + d.slice(2); else if (d.charAt(0) === "8") d = "0" + d; return d; }
function okPhone(d) { return /^08\d{8,11}$/.test(d); }
function fmtPhone(d) { return d.length > 8 ? d.slice(0, 4) + "-" + d.slice(4, 8) + "-" + d.slice(8) : d; }
function waLink(d, msg) { return "https://wa.me/62" + d.slice(1) + "?text=" + encodeURIComponent(msg); }
function initials(n) { return String(n).replace(/\(.*?\)/g, "").replace(/^drh?\.\s*/i, "").trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join(""); }

/* ---------- data ---------- */
var db, ui = { sq: "", ssp: "", scat: "", sbr: "", spr: "", sort: "nama", auth: "masuk", atab: "hewan", apet: "", ordf: "", remDays: 30, remF: "", aTab: "antrian", qDate: today(), stk: "produk", bk: null, route: "", rep: 7 };
var armed = {};

function nid(d, k) { d.seq[k] = (d.seq[k] || 0) + 1; return k + d.seq[k]; }
function works(st, date) { return st.days.indexOf(parse(date).getDay()) >= 0 && st.off.indexOf(date) < 0; }
function dayStaff(d, date, role) { return d.staff.filter(function (s) { return s.role === role && works(s, date); })[0] || d.staff.filter(function (s) { return s.role === role; })[0]; }

function seed() {
  var t = today(), d = { v: 1, seq: {}, shop: { name: "Pawku Petshop & Klinik", pin: "1234" }, session: "", cart: [] };
  d.staff = [
    { id: "d1", name: "drh. Ayu Lestari", role: "dokter", days: [1, 2, 3, 4, 5, 6], start: "09:00", end: "16:00", off: [] },
    { id: "d2", name: "drh. Bima Pratama", role: "dokter", days: [2, 3, 4, 5, 6, 0], start: "10:00", end: "17:00", off: [] },
    { id: "g1", name: "Sari (groomer)", role: "groomer", days: [1, 2, 3, 4, 5, 6], start: "09:00", end: "17:00", off: [] },
    { id: "g2", name: "Dodi (groomer)", role: "groomer", days: [3, 4, 5, 6, 0], start: "09:00", end: "17:00", off: [] }
  ];
  d.services = [
    { id: "s1", name: "Konsultasi dokter hewan", type: "klinik", dur: 30, price: 75000, sp: ["kucing", "anjing"], img: "hero", desc: "Pemeriksaan umum, keluhan, dan saran perawatan." },
    { id: "s2", name: "Vaksin kucing F3", type: "klinik", dur: 30, price: 185000, sp: ["kucing"], img: "cat3", vacc: 365, med: "m1", desc: "Vaksin tahunan untuk kucing sehat berumur di atas 8 minggu." },
    { id: "s3", name: "Vaksin anjing DHPPi", type: "klinik", dur: 30, price: 210000, sp: ["anjing"], img: "dog1", vacc: 365, med: "m2", desc: "Vaksin tahunan kombinasi untuk anjing." },
    { id: "s4", name: "Vaksin rabies", type: "klinik", dur: 30, price: 120000, sp: ["kucing", "anjing"], img: "dog3", vacc: 365, med: "m3", desc: "Wajib diulang setiap tahun. Bawa buku kesehatan bila ada." },
    { id: "s5", name: "Steril kucing jantan", type: "klinik", dur: 60, price: 350000, sp: ["kucing"], img: "cat2", desc: "Termasuk pemeriksaan sebelum tindakan. Puasa 8 jam sebelumnya." },
    { id: "s6", name: "Steril kucing betina", type: "klinik", dur: 120, price: 650000, sp: ["kucing"], img: "cat2", desc: "Termasuk pemeriksaan sebelum tindakan dan kontrol luka." },
    { id: "s7", name: "Mandi kucing", type: "grooming", dur: 60, price: 85000, sp: ["kucing"], img: "groom", desc: "Mandi, keringkan, sisir, dan bersihkan telinga." },
    { id: "s8", name: "Mandi anjing (kecil sampai sedang)", type: "grooming", dur: 90, price: 120000, sp: ["anjing"], img: "groom", desc: "Mandi, keringkan, sisir, dan bersihkan telinga." },
    { id: "s9", name: "Potong kuku", type: "grooming", dur: 30, price: 35000, sp: ["kucing", "anjing"], img: "groom", desc: "Potong dan rapikan kuku, aman dan cepat." },
    { id: "s10", name: "Paket grooming lengkap", type: "grooming", dur: 120, price: 160000, sp: ["kucing", "anjing"], img: "groom", desc: "Mandi, potong kuku, bersihkan telinga, dan sisir bulu." }
  ];
  d.meds = [
    { id: "m1", name: "Vaksin F3 (dosis)", unit: "dosis", stock: 14, min: 5 },
    { id: "m2", name: "Vaksin DHPPi (dosis)", unit: "dosis", stock: 3, min: 5 },
    { id: "m3", name: "Vaksin rabies (dosis)", unit: "dosis", stock: 12, min: 5 },
    { id: "m4", name: "Obat cacing", unit: "tablet", stock: 40, min: 15 },
    { id: "m5", name: "Antibiotik oral", unit: "tablet", stock: 60, min: 20 },
    { id: "m6", name: "Salep kulit", unit: "tube", stock: 9, min: 4 },
    { id: "m7", name: "Probiotik hewan", unit: "sachet", stock: 25, min: 10 },
    { id: "m8", name: "Suntik antimual", unit: "ampul", stock: 8, min: 4 }
  ];
  var P = function (n, b, sp, cat, pr, st, im, desc) { return { id: "p" + (d.products.length + 1), name: n, brand: b, sp: sp, cat: cat, price: pr, stock: st, img: im, desc: desc, min: 5 }; };
  d.products = [];
  [
    ["Makanan kucing dewasa ikan laut 1,5 kg", "Meowvita", "kucing", "makanan", 78000, 24, "kibbleC", "Pakan kering untuk kucing dewasa dengan rasa ikan laut."],
    ["Makanan kitten ayam 1 kg", "Meowvita", "kucing", "makanan", 69000, 18, "kibbleC", "Pakan kering berukuran kecil untuk anak kucing."],
    ["Makanan anjing dewasa daging sapi 3 kg", "Gukku", "anjing", "makanan", 132000, 12, "kibbleD", "Pakan kering untuk anjing dewasa ukuran kecil sampai sedang."],
    ["Makanan anjing anak ayam 1,5 kg", "Gukku", "anjing", "makanan", 89000, 9, "kibbleD", "Pakan kering berbutir kecil untuk anak anjing."],
    ["Makanan basah kucing tuna kaleng 85 g", "Pawsome", "kucing", "makanan", 9500, 0, "wet", "Pakan basah sachet, cocok sebagai tambahan pakan kering."],
    ["Pasir kucing gumpal lavender 5 L", "Pawsome", "kucing", "pasir", 48000, 30, "litter", "Mudah menggumpal, aroma lavender ringan."],
    ["Pasir kucing tahu alami 6 L", "Meowvita", "kucing", "pasir", 62000, 14, "litter", "Berbahan tahu, mudah dibuang, rendah debu."],
    ["Kalung anjing kulit ukuran M", "Gukku", "anjing", "aksesori", 85000, 20, "collar", "Kulit empuk dengan gesper kuningan, ukuran leher 30 sampai 42 cm."],
    ["Kalung anjing kulit ukuran L", "Gukku", "anjing", "aksesori", 95000, 16, "collar", "Kulit empuk dengan gesper kuningan, ukuran leher 40 sampai 52 cm."],
    ["Mangkuk makan keramik", "Pawsome", "semua", "aksesori", 39000, 25, "bowl", "Mangkuk keramik berat, tidak mudah terguling."],
    ["Sikat slicker untuk bulu", "Bulubaik", "semua", "aksesori", 57000, 22, "brush", "Sikat berkawat halus untuk merapikan bulu panjang dan sedang."],
    ["Mainan bola berlubang", "Gukku", "semua", "aksesori", 22000, 28, "toy", "Bola plastik ringan berlubang untuk bermain."],
    ["Tempat pasir kucing tertutup", "Pawsome", "kucing", "aksesori", 189000, 2, "box", "Bak pasir bertutup dengan pintu masuk dan saringan karbon."],
    ["Vitamin bulu kucing 60 tablet", "Bulubaik", "kucing", "vitamin", 85000, 15, "vit", "Suplemen omega untuk bulu mengilap. Ikuti dosis pada kemasan."],
    ["Vitamin sendi anjing 60 tablet", "Bulubaik", "anjing", "vitamin", 98000, 8, "vit", "Suplemen untuk anjing aktif atau berumur. Ikuti dosis pada kemasan."],
    ["Vitamin multi hewan 100 tablet", "Meowvita", "semua", "vitamin", 72000, 4, "vit", "Multivitamin harian untuk kucing dan anjing."]
  ].forEach(function (a) { d.products.push(P.apply(null, a)); });
  d.owners = [
    { id: "o1", name: "Rina Wulandari", phone: "081200001001", pin: "1234", addr: "Jl. Contoh No. 12, Kota Contoh" },
    { id: "o2", name: "Budi Santoso", phone: "081200001002", pin: "2222", addr: "Jl. Mawar 5, Kota Contoh" },
    { id: "o3", name: "Dewi Anggraini", phone: "081200001003", pin: "3333", addr: "Perum Contoh Blok C3, Kota Contoh" },
    { id: "o4", name: "Agus Hartono", phone: "081200001004", pin: "4444", addr: "Jl. Melati 21, Kota Contoh" }
  ];
  d.seq = { o: 4, pt: 0, a: 0, r: 0, v: 0, ord: 1006 };
  var pets = [
    ["o1", "Mochi", "kucing", "Domestik", 830, 4.2, "betina", "Alergi ikan mentah", "cat1"],
    ["o1", "Bruno", "anjing", "Golden Retriever", 1500, 28, "jantan", "", "dog1"],
    ["o2", "Simba", "kucing", "Persia", 600, 4.8, "jantan", "", "cat3"],
    ["o3", "Luna", "kucing", "Anggora", 365, 3.1, "betina", "", "cat2"],
    ["o3", "Cooper", "anjing", "Beagle", 900, 11.5, "jantan", "Alergi ayam", "dog2"],
    ["o4", "Rocky", "anjing", "Pomeranian", 1100, 3.4, "jantan", "", "dog3"]
  ];
  d.pets = pets.map(function (a) { return { id: nid(d, "pt"), owner: a[0], name: a[1], sp: a[2], breed: a[3], born: addD(t, -a[4]), weight: a[5], sex: a[6], allergy: a[7], img: a[8], note: "" }; });
  var byName = function (n) { return d.pets.filter(function (p) { return p.name === n; })[0]; };
  var svc = function (id) { return d.services.filter(function (s) { return s.id === id; })[0]; };
  d.appts = []; d.records = []; d.vaccines = [];
  function appt(pet, sid, date, time, staffId, status, rec) {
    var p = byName(pet), s = svc(sid);
    var a = { id: nid(d, "a"), owner: p.owner, pet: p.id, svc: sid, sn: s.name, type: s.type, staff: staffId, date: date, time: time, dur: s.dur, price: s.price, status: status, note: "" };
    d.appts.push(a);
    if (rec) {
      var r = { id: nid(d, "r"), appt: a.id, pet: p.id, date: date, staff: staffId, svc: sid, sn: s.name, weight: rec[0], dx: rec[1], act: rec[2], rx: rec[3], meds: [] };
      d.records.push(r); a.rec = r.id;
    }
    return a;
  }
  function vacc(pet, name, date, due) { d.vaccines.push({ id: nid(d, "v"), pet: byName(pet).id, name: name, date: date, due: due, contacted: false }); }
  appt("Mochi", "s2", addD(t, -340), "10:00", "d1", "selesai", [4.0, "Sehat, berat stabil", "Vaksin F3 disuntik", "-"]);
  vacc("Mochi", "Vaksin F3", addD(t, -340), addD(t, 25));
  appt("Mochi", "s7", addD(t, -45), "13:00", "g1", "selesai", [4.1, "Bulu kusut ringan", "Mandi, sisir, bersihkan telinga", "-"]);
  appt("Bruno", "s4", addD(t, -400), "11:00", "d1", "selesai", [27.5, "Sehat", "Vaksin rabies disuntik", "-"]);
  vacc("Bruno", "Vaksin rabies", addD(t, -400), addD(t, -35));
  appt("Bruno", "s3", addD(t, -352), "10:00", "d1", "selesai", [27.8, "Sehat", "Vaksin DHPPi disuntik", "-"]);
  vacc("Bruno", "Vaksin DHPPi", addD(t, -352), addD(t, 13));
  appt("Simba", "s1", addD(t, -12), "14:00", "d1", "selesai", [4.7, "Diare ringan", "Pemeriksaan umum, suntik antimual", "Probiotik 1 sachet sehari selama 5 hari"]);
  vacc("Simba", "Vaksin F3", addD(t, -361), addD(t, 4));
  appt("Luna", "s2", addD(t, -200), "11:00", "d1", "selesai", [3.0, "Sehat", "Vaksin F3 disuntik", "-"]);
  vacc("Luna", "Vaksin F3", addD(t, -200), addD(t, 165));
  appt("Cooper", "s4", addD(t, -300), "15:00", "d1", "selesai", [11.2, "Sehat", "Vaksin rabies disuntik", "-"]);
  vacc("Cooper", "Vaksin rabies", addD(t, -300), addD(t, 65));
  appt("Rocky", "s8", addD(t, -8), "13:30", "g1", "selesai", [3.4, "Kulit baik, bulu padat", "Mandi dan sisir", "-"]);
  appt("Luna", "s9", addD(t, -3), "10:00", "g1", "batal");
  var dr = dayStaff(d, t, "dokter").id, gr = dayStaff(d, t, "groomer").id;
  appt("Luna", "s7", t, "09:00", gr, "selesai", [3.1, "Bulu bersih dan sehat", "Mandi, sisir, bersihkan telinga", "-"]);
  appt("Simba", "s1", t, "10:00", dr, "diperiksa");
  appt("Cooper", "s3", t, "10:30", dr, "hadir");
  appt("Mochi", "s1", t, "11:00", dr, "dijadwalkan").note = "Sering bersin sejak kemarin";
  appt("Rocky", "s8", t, "13:00", gr, "dijadwalkan");
  appt("Simba", "s2", t, "14:00", dr, "dijadwalkan");
  var t2 = addD(t, 2);
  appt("Bruno", "s4", t2, "11:00", dayStaff(d, t2, "dokter").id, "dijadwalkan");
  d.appts.forEach(function (a) { if (a.date === t && a.status === "dijadwalkan" && a.time < "10:00") a.status = "dijadwalkan"; });
  var ORD = [
    ["ord1001", "o1", "Rina Wulandari", "081200001001", "antar", "transfer", [["p1", 2], ["p14", 1]], -9, "selesai"],
    ["ord1002", "o2", "Budi Santoso", "081200001002", "ambil", "toko", [["p6", 1], ["p10", 1]], -5, "selesai"],
    ["ord1003", "o3", "Dewi Anggraini", "081200001003", "antar", "cod", [["p3", 1], ["p8", 1], ["p9", 1]], -2, "dikirim"],
    ["ord1004", "", "Hendra (contoh)", "081200002001", "antar", "transfer", [["p2", 2]], -1, "diproses"],
    ["ord1005", "o1", "Rina Wulandari", "081200001001", "antar", "transfer", [["p15", 1], ["p12", 2]], 0, "baru"],
    ["ord1006", "", "Maya (contoh)", "081200002002", "ambil", "toko", [["p13", 1]], -4, "batal"]
  ];
  d.orders = ORD.map(function (o, i) {
    var items = o[6].map(function (x) { var p = d.products.filter(function (q) { return q.id === x[0]; })[0]; return { id: p.id, n: p.name, p: p.price, q: x[1] }; });
    var sub = items.reduce(function (s, x) { return s + x.p * x.q; }, 0), ship = o[4] === "antar" && sub < 200000 ? 12000 : 0;
    var flow = ["baru", "diproses", "dikirim", "selesai"], log = [];
    if (o[8] === "batal") log = [{ s: "baru", d: addD(t, o[7]), t: "09:10" }, { s: "batal", d: addD(t, o[7]), t: "15:40" }];
    else for (var k = 0; k <= flow.indexOf(o[8]); k++) log.push({ s: flow[k], d: addD(t, o[7] + Math.min(k, -o[7])), t: pad(9 + k) + ":" + pad(10 + i * 7) });
    return { id: o[0], code: "PS-" + (1001 + i), owner: o[1], name: o[2], phone: o[3], addr: o[4] === "antar" ? "Alamat contoh " + (i + 3) + ", Kota Contoh" : "", method: o[4], pay: o[5], items: items, sub: sub, ship: ship, total: sub + ship, status: o[8], date: addD(t, o[7]), log: log, note: "" };
  });
  d.seq.ord = 1006;
  return d;
}
function load() { try { var x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v === 1 && x.products && x.appts) return x; } catch (e) { } return seed(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { } }
var tt;
function toast(m, bad) { var t = $("toast"); t.textContent = m; t.className = "toast on" + (bad ? " bad" : ""); clearTimeout(tt); tt = setTimeout(function () { t.className = "toast"; }, 2400); }
function twice(el) {
  if (el.dataset.arm === "1") return true;
  el.dataset.arm = "1"; el.dataset.o = el.textContent; el.textContent = "Tekan lagi"; el.classList.add("arm");
  setTimeout(function () { if (el.dataset.arm === "1") { el.dataset.arm = ""; el.textContent = el.dataset.o; el.classList.remove("arm"); } }, 4000);
  return false;
}
function by(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
function owner() { return by(db.owners, db.session); }
function staffName(id) { var s = by(db.staff, id); return s ? s.name : "-"; }
function petName(id) { var p = by(db.pets, id); return p ? p.name : "(dihapus)"; }
function oneImg(k, alt, w, h) { return '<img src="' + esc(PHOTO[k] || PHOTO.cat1) + '" alt="' + esc(alt) + '" loading="lazy" width="' + (w || 400) + '" height="' + (h || 400) + '">'; }
function petImg(p) { return oneImg(p.img || (p.sp === "kucing" ? "cat1" : "dog1"), "Foto contoh " + p.sp, 72, 72); }
function stockTag(n, min) { return n <= 0 ? '<span class="tag b">Habis</span>' : n <= (min || 5) ? '<span class="tag w">Sisa ' + n + "</span>" : '<span class="tag g">Stok ' + n + "</span>"; }

/* ---------- availability ---------- */
function staffFree(st, date, time, dur, ign) {
  if (!works(st, date)) return false;
  var s = tmin(time), e = s + dur;
  if (s < tmin(st.start) || e > tmin(st.end)) return false;
  if (s < 780 && e > 720) return false;
  return !db.appts.some(function (a) { if (a.status === "batal" || a.staff !== st.id || a.date !== date || a.id === ign) return false; var as = tmin(a.time); return s < as + a.dur && as < e; });
}
function slotsFor(svc, date, staffId) {
  var role = svc.type === "klinik" ? "dokter" : "groomer";
  var c = db.staff.filter(function (s) { return s.role === role && (!staffId || s.id === staffId); }), out = [];
  var past = date === today() ? tmin(nowStr()) : -1;
  for (var m = 540; m < 1020; m += 30) {
    var t = mt(m), fr = c.filter(function (s) { return staffFree(s, date, t, svc.dur); });
    out.push({ t: t, free: fr.map(function (s) { return s.id; }), ok: fr.length > 0 && m > past });
  }
  return out;
}

/* ---------- vaccines / reminders ---------- */
function currentVaccines() {
  var best = {};
  db.vaccines.forEach(function (v) { var k = v.pet + "|" + v.name; if (!best[k] || v.date > best[k].date) best[k] = v; });
  return Object.keys(best).map(function (k) { return best[k]; }).filter(function (v) { return by(db.pets, v.pet); });
}
function vaccTag(v) {
  var n = diff(v.due, today());
  if (n < 0) return '<span class="tag b">Terlambat ' + -n + " hari</span>";
  if (n === 0) return '<span class="tag w">Jatuh tempo hari ini</span>';
  if (n <= 30) return '<span class="tag w">' + n + " hari lagi</span>";
  return '<span class="tag g">Aman, ' + n + " hari lagi</span>";
}

/* ---------- csv / print ---------- */
function csvCell(v) { v = String(v == null ? "" : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }
function csv(name, rows) {
  var txt = "﻿" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
  var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" })); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast("File " + name + " diunduh");
}
function printHTML(h) {
  var el = $("printarea"); if (el) el.remove();
  el = document.createElement("div"); el.id = "printarea"; el.innerHTML = h; document.body.appendChild(el);
  document.body.classList.add("printing");
  var done = function () { document.body.classList.remove("printing"); var e = $("printarea"); if (e) e.remove(); window.removeEventListener("afterprint", done); };
  window.addEventListener("afterprint", done);
  try { window.print(); } catch (e) { done(); }
}

/* ---------- sheet ---------- */
var lastFocus = null;
function openSheet(h) { lastFocus = document.activeElement; $("shc").innerHTML = h; $("ov").classList.add("on"); var f = $("shc").querySelector("h3"); if (f) { f.setAttribute("tabindex", "-1"); f.focus(); } }
function closeSheet() { $("ov").classList.remove("on"); $("shc").innerHTML = ""; if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { } }
function sheetHead(t) { return '<h3>' + esc(t) + '<button class="x" data-a="close" aria-label="Tutup">&times;</button></h3>'; }
function cartCount() { return db.cart.reduce(function (s, x) { return s + x.q; }, 0); }

/* ---------- views ---------- */
var ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5zM9 7a3 3 0 0 1 6 0"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  pkg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  paw: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6" r="2.2"/><circle cx="14" cy="6" r="2.2"/><circle cx="18" cy="10" r="2.2"/><path d="M12 11c-3 0-6 3-6 6 0 2 2 3 4 2.4 1.3-.4 2.7-.4 4 0 2 .6 4-.4 4-2.4 0-3-3-6-6-6z"/></svg>'
};
var NAV = [["", "Beranda", "home"], ["toko", "Toko", "bag"], ["layanan", "Layanan", "heart"], ["booking", "Booking", "cal"], ["akun", "Akun", "user"]];
function chrome() {
  $("brand").innerHTML = '<i>' + ICON.paw + '</i><span>' + esc(db.shop.name.split(" ")[0]) + '</span>';
  $("nav").innerHTML = NAV.map(function (n) { return '<a href="#/' + n[0] + '" data-r="' + n[0] + '">' + ICON[n[2]] + "<span>" + n[1] + "</span></a>"; }).join("") + '<a href="#/lacak" data-r="lacak">' + ICON.pkg + "<span>Lacak pesanan</span></a>";
  $("tabs").innerHTML = NAV.map(function (n) { return '<a href="#/' + n[0] + '" data-r="' + n[0] + '">' + ICON[n[2]] + "<span>" + n[1] + "</span></a>"; }).join("");
  var o = owner();
  $("who").innerHTML = o ? esc(o.name.split(" ")[0]) : "Masuk";
  $("who").setAttribute("href", "#/akun");
  cartBadge();
}
function cartBadge() { var n = cartCount(); $("cartn").textContent = n; $("cartn").style.display = n ? "grid" : "none"; $("cartb").setAttribute("aria-label", "Keranjang, " + n + " barang"); }
function markNav(r) { document.querySelectorAll("[data-r]").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-r") === r); if (a.getAttribute("data-r") === r) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); }

function prodCard(p) {
  var out = p.stock <= 0;
  return '<div class="card pc' + (out ? " out" : "") + '"><button class="im" style="border:0;padding:0;cursor:pointer" data-a="pdet" data-id="' + p.id + '" aria-label="Lihat ' + esc(p.name) + '">' + oneImg(p.img, p.name) + '<span class="bdg pr">' + rp(p.price) + '</span></button><div class="tx"><small>' + esc(p.brand) + " &middot; " + esc(p.sp === "semua" ? "Semua hewan" : p.sp) + "</small><b>" + esc(p.name) + '</b>' + stockTag(p.stock, p.min) + '<button class="btn s" data-a="padd" data-id="' + p.id + '"' + (out ? " disabled" : "") + ">" + (out ? "Habis" : "Tambah") + "</button></div></div>";
}
function svcCard(s) {
  return '<div class="card sv"><div class="im">' + oneImg(s.img, s.name, 96, 96) + '</div><div><h3>' + esc(s.name) + "</h3><p>" + esc(s.desc) + '</p><div class="meta"><span class="tag n">' + s.dur + ' menit</span><b>' + rp(s.price) + '</b><span class="sp"></span><a class="btn s" href="#/booking?svc=' + s.id + '">Booking</a></div></div></div>';
}

function vHome() {
  var o = owner(), t = today(), onDuty = db.staff.filter(function (s) { return works(s, t); });
  var rem = "";
  if (o) {
    var mine = currentVaccines().filter(function (v) { var p = by(db.pets, v.pet); return p && p.owner === o.id && diff(v.due, t) <= 30; }).sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    rem = mine.length ? '<div class="card pad" style="margin-top:12px;border-color:#f0c78a;background:#fff8ec"><h3>Pengingat vaksin untuk ' + esc(o.name.split(" ")[0]) + "</h3>" + mine.map(function (v) { return '<div class="li"><div class="g"><b>' + esc(petName(v.pet)) + " &middot; " + esc(v.name) + "</b><small>Jatuh tempo " + fds(v.due) + "</small></div>" + vaccTag(v) + '</div>'; }).join("") + '<a class="btn s" style="margin-top:8px" href="#/booking">Booking vaksin</a></div>' : "";
  }
  var np = function (sp) { return db.products.filter(function (p) { return p.sp === sp || p.sp === "semua"; }).length; };
  var tiles = [["kucing", "Kucing", "nt1", "cat3", np("kucing") + " produk"], ["anjing", "Anjing", "nt2", "dog2", np("anjing") + " produk"], ["kelinci", "Kelinci", "nt3", "", "Serba guna"], ["burung", "Burung", "nt4", "", "Serba guna"]];
  var cats = ["Klinik hewan", "Grooming", "Vaksin", "Kucing", "Anjing", "Kelinci", "Burung", "Makanan", "Pasir", "Vitamin", "Aksesori"];
  var mq = cats.map(function (c) { return "<span>" + c + "</span>"; }).join("");
  var pops = ["s2", "s4", "s7", "s8"].map(function (id, k) { var s = by(db.services, id); return '<div class="sp2 sc' + (k + 1) + '"><div class="im">' + oneImg(s.img, s.name, 92, 92) + '</div><div><h3>' + esc(s.name) + "</h3><p>" + esc(s.desc) + '</p></div><div class="meta"><span class="tag n">' + s.dur + ' menit</span><b>' + rp(s.price) + '</b><a class="btn s" href="#/booking?svc=' + s.id + '">Booking</a></div></div>'; }).join("");
  var duty = onDuty.length ? onDuty.map(function (s) { return '<div class="dc"><span class="ava ' + (s.role === "dokter" ? "" : "c2") + '">' + esc(initials(s.name)) + '</span><div><b>' + esc(s.name) + "</b><small>" + (s.role === "dokter" ? "Dokter hewan" : "Grooming") + " &middot; " + s.start + " sampai " + s.end + "</small></div></div>"; }).join("") : '<div class="dc">Tidak ada petugas hari ini.</div>';
  return '<section class="hx"><div class="in"><span class="tag">Klinik hewan, grooming, dan toko</span><h1>Hewan <mark>sehat</mark>, kamu <em>tenang</em></h1><p class="sub">Booking dokter hewan atau grooming, simpan buku kesehatan digital, dan belanja kebutuhan kucing dan anjing di satu tempat.</p>' +
    '<div class="cg"><div class="ph p-big">' + oneImg("hero", "Kucing dan anjing berbaring bersama", 900, 600) + '</div><div class="ph p-dog">' + oneImg("dog1", "Anjing golden retriever berbaring di rumput", 400, 300) + '</div><div class="ph p-cat">' + oneImg("cat1", "Kucing dengan mata biru", 400, 480) + '</div>' +
    '<a class="stk s1" href="#/booking">' + ICON.cal + 'Booking dokter hewan</a><a class="stk s2" href="#/toko">' + ICON.bag + 'Belanja</a><span class="stk s3" style="padding:0 8px"><b>' + onDuty.length + '</b><span>petugas jaga hari ini</span></span></div>' + (rem ? '<div class="rem">' + rem + "</div>" : "") + '</div></section>' +
    '<div class="mqw" aria-hidden="true"><div class="mq">' + mq + mq + "</div></div>" +
    '<section class="band b-but"><div class="in"><h2 class="hd">Mulai dari kebutuhan <mark>hewanmu</mark></h2><p class="lead">Pilih hewan, toko langsung menampilkan barang yang cocok.</p><div class="need">' + tiles.map(function (t) { return '<a class="nt ' + t[2] + '" href="#/toko" data-a="shopsp" data-v="' + t[0] + '"><span class="pic' + (t[3] ? "" : " pat") + '">' + (t[3] ? oneImg(t[3], "Foto " + t[1].toLowerCase(), 400, 300) : "") + '</span><span class="txt"><b>' + t[1] + "</b><small>" + t[4] + '</small></span><span class="go" aria-hidden="true">' + ICON.arrow.replace("<svg", '<svg width="20" height="20"') + "</span></a>"; }).join("") + '</div></div></section>' +
    '<section class="band b-sky"><div class="in"><div class="sec" style="margin-top:0"><h2>Layanan populer</h2><a href="#/layanan">Lihat semua</a></div><div class="pop">' + pops + '</div></div></section>' +
    '<section class="band b-cream"><div class="in"><div class="sec" style="margin-top:0"><h2>Produk unggulan</h2><a href="#/toko">Ke toko</a></div><div class="pgrid">' + ["p1", "p3", "p6", "p14"].map(function (i) { return prodCard(by(db.products, i)); }).join("") + '</div></div></section>' +
    '<section class="band b-teal"><div class="in"><h2 class="hd">Praktik <mark>hari ini</mark></h2><div class="duty2">' + duty + '</div><p class="note" style="color:#fff8e8;margin:14px 0 0">Istirahat 12:00 sampai 13:00. Nama dan data di demo ini fiktif.</p>' +
    '<div class="lk"><div><h3>Punya pesanan?</h3><div>Masukkan kode pesanan dan nomor telepon untuk melacak.</div></div><a class="btn big" href="#/lacak">Lacak pesanan</a></div></div></section>';
}

function filteredProducts() {
  var q = ui.sq.trim().toLowerCase(), pr = ui.spr;
  var l = db.products.filter(function (p) {
    if (q && (p.name + " " + p.brand).toLowerCase().indexOf(q) < 0) return false;
    if (ui.ssp && p.sp !== ui.ssp && p.sp !== "semua") return false;
    if (ui.scat && p.cat !== ui.scat) return false;
    if (ui.sbr && p.brand !== ui.sbr) return false;
    if (pr === "a" && p.price >= 50000) return false;
    if (pr === "b" && (p.price < 50000 || p.price > 100000)) return false;
    if (pr === "c" && p.price <= 100000) return false;
    return true;
  });
  l.sort(function (a, b) { return ui.sort === "murah" ? a.price - b.price : ui.sort === "mahal" ? b.price - a.price : a.name.localeCompare(b.name); });
  return l;
}
function shopGrid() {
  var l = filteredProducts();
  var gn = ui.ssp === "kelinci" || ui.ssp === "burung" ? '<p class="shopnote">Untuk ' + ui.ssp + ", toko ini baru punya perlengkapan umum. Cek kebutuhan lain lewat konsultasi dokter hewan.</p>" : "";
  return gn + '<p class="note" role="status">' + l.length + " produk</p>" + (l.length ? '<div class="grid">' + l.map(prodCard).join("") + "</div>" : '<div class="empty"><b>Produk tidak ditemukan</b>Ubah kata kunci atau filter.</div>');
}
function chipRow(name, opts, cur) { return '<div class="chips" role="group" aria-label="' + esc(name) + '">' + opts.map(function (o) { return '<button class="chip' + (cur === o[0] ? " on" : "") + '" aria-pressed="' + (cur === o[0]) + '" data-a="f-' + name + '" data-v="' + o[0] + '">' + o[1] + "</button>"; }).join("") + "</div>"; }
function vShop() {
  var brands = db.products.map(function (p) { return p.brand; }).filter(function (b, i, a) { return a.indexOf(b) === i; }).sort();
  return '<div class="sec"><h2>Toko</h2></div>' + chipRow("ssp", [["", "Semua hewan"], ["kucing", "Kucing"], ["anjing", "Anjing"], ["kelinci", "Kelinci"], ["burung", "Burung"]], ui.ssp) + chipRow("scat", [["", "Semua"], ["makanan", "Makanan"], ["pasir", "Pasir"], ["aksesori", "Aksesori"], ["vitamin", "Vitamin"]], ui.scat) +
    '<div class="filters"><label class="f full">Cari produk<input class="inp" id="sq" type="search" value="' + esc(ui.sq) + '" placeholder="Nama atau merek"></label><label class="f">Merek<select class="inp" id="sbr"><option value="">Semua merek</option>' + brands.map(function (b) { return '<option' + (ui.sbr === b ? " selected" : "") + ">" + esc(b) + "</option>"; }).join("") + '</select></label><label class="f">Harga<select class="inp" id="spr">' + [["", "Semua harga"], ["a", "Di bawah 50 rb"], ["b", "50 rb sampai 100 rb"], ["c", "Di atas 100 rb"]].map(function (o) { return '<option value="' + o[0] + '"' + (ui.spr === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></label><label class="f">Urutkan<select class="inp" id="sort">' + [["nama", "Nama A-Z"], ["murah", "Termurah"], ["mahal", "Termahal"]].map(function (o) { return '<option value="' + o[0] + '"' + (ui.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></label><div class="f" style="align-content:end"><button class="btn o" data-a="fclear">Atur ulang filter</button></div></div><div id="shopgrid">' + shopGrid() + "</div>";
}
function vLayanan() {
  var k = db.services.filter(function (s) { return s.type === "klinik"; }), g = db.services.filter(function (s) { return s.type === "grooming"; });
  return '<div class="sec"><h2>Layanan klinik</h2></div><div class="svg">' + k.map(svcCard).join("") + '</div><div class="sec"><h2>Grooming</h2></div><div class="svg">' + g.map(svcCard).join("") + '</div><p class="note">Harga contoh. Tindakan lain dihitung setelah pemeriksaan.</p>';
}

/* ----- auth ----- */
function authBox(next) {
  var m = ui.auth;
  return '<div class="pin card pad"><h3>' + (m === "masuk" ? "Masuk" : "Daftar akun pemilik") + '</h3><div class="seg" role="tablist"><button class="' + (m === "masuk" ? "on" : "") + '" data-a="authm" data-v="masuk">Masuk</button><button class="' + (m === "daftar" ? "on" : "") + '" data-a="authm" data-v="daftar">Daftar</button></div>' +
    (m === "daftar" ? '<label class="f">Nama<input class="inp" id="au-n" maxlength="40" autocomplete="off"></label>' : "") +
    '<label class="f">Nomor telepon<input class="inp" id="au-p" inputmode="tel" placeholder="0812-0000-1001" maxlength="16" autocomplete="off"></label><label class="f">PIN (4 angka)<input class="inp" id="au-pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></label><p class="err" id="au-e" role="alert"></p><button class="btn w" data-a="auth">' + (m === "masuk" ? "Masuk" : "Buat akun") + "</button>" +
    (m === "masuk" ? '<p class="note">Demo: 0812-0000-1001 dengan PIN 1234. <button class="btn s o" data-a="fill">Isi otomatis</button></p>' : '<p class="note">PIN hanya disimpan di peramban ini. Jangan pakai PIN asli.</p>') + "</div>";
}
function doAuth() {
  var p = normPhone($("au-p").value), pin = $("au-pin").value.trim(), e = $("au-e");
  if (!okPhone(p)) { e.textContent = "Nomor telepon tidak valid. Contoh 0812-0000-1001."; return; }
  if (!/^\d{4}$/.test(pin)) { e.textContent = "PIN harus 4 angka."; return; }
  if (ui.auth === "masuk") {
    var o = db.owners.filter(function (x) { return x.phone === p; })[0];
    if (!o || o.pin !== pin) { e.textContent = "Nomor atau PIN salah."; return; }
    db.session = o.id; save(); chrome(); route(); toast("Selamat datang, " + o.name.split(" ")[0]);
  } else {
    var n = $("au-n").value.trim();
    if (n.length < 3) { e.textContent = "Isi nama minimal 3 huruf."; return; }
    if (db.owners.some(function (x) { return x.phone === p; })) { e.textContent = "Nomor ini sudah terdaftar. Silakan masuk."; return; }
    var no = { id: nid(db, "o"), name: n, phone: p, pin: pin, addr: "" };
    db.owners.push(no); db.session = no.id; save(); chrome(); route(); toast("Akun dibuat. Tambahkan hewan peliharaan Anda.");
  }
}

/* ----- booking ----- */
function bkInit(q) { var sv = by(db.services, q.svc || ""); ui.bk = { pet: "", svc: sv ? sv.id : "", staff: "", date: "", time: "", note: "", done: null }; var o = owner(); if (o) { var mine = db.pets.filter(function (p) { return p.owner === o.id; }); if (mine.length === 1) ui.bk.pet = mine[0].id; } }
function vBooking() {
  var o = owner();
  if (!o) return '<div class="sec"><h2>Booking</h2></div><p class="note">Masuk dulu agar hewan peliharaan Anda bisa dipilih.</p>' + authBox();
  var b = ui.bk, t = today();
  if (b.done) { var a = by(db.appts, b.done); return '<div class="card pad" style="max-width:520px;margin:18px auto"><span class="tag g">Booking berhasil</span><h2 style="margin:8px 0">' + esc(a.sn) + " untuk " + esc(petName(a.pet)) + '</h2><dl class="kv"><dt>Tanggal</dt><dd>' + fd(a.date) + "</dd><dt>Jam</dt><dd>" + a.time + " sampai " + mt(tmin(a.time) + a.dur) + "</dd><dt>Petugas</dt><dd>" + esc(staffName(a.staff)) + "</dd><dt>Biaya</dt><dd>" + rp(a.price) + '</dd></dl><p class="note">Datang 10 menit lebih awal. Pembayaran di klinik.</p><div class="row"><a class="btn" href="#/akun" data-a="gojanji">Lihat janji saya</a><button class="btn o" data-a="bknew">Booking lagi</button></div></div>'; }
  var pets = db.pets.filter(function (p) { return p.owner === o.id; }), pet = by(db.pets, b.pet);
  var svcs = db.services.filter(function (s) { return !pet || s.sp.indexOf(pet.sp) >= 0; });
  var sv = by(db.services, b.svc);
  if (sv && pet && sv.sp.indexOf(pet.sp) < 0) { b.svc = ""; sv = null; }
  var h = '<div class="sec"><h2>Booking janji</h2></div><div class="two-col"><div class="stack">';
  h += '<div class="card pad"><h3>1. Pilih hewan</h3>' + (pets.length ? '<div class="opt">' + pets.map(function (p) { return '<button class="op' + (b.pet === p.id ? " on" : "") + '" data-a="bkpet" data-id="' + p.id + '"><span class="ava c3" style="overflow:hidden">' + petImg(p) + '</span><span class="g"><b>' + esc(p.name) + "</b><small>" + esc(p.sp) + ", " + esc(p.breed) + ", " + ageOf(p.born) + (p.allergy ? " &middot; " + esc(p.allergy) : "") + "</small></span></button>"; }).join("") + "</div>" : '<div class="empty"><b>Belum ada hewan</b>Tambahkan profil hewan dulu.</div>') + '<a class="btn s o" style="margin-top:10px" href="#/akun" data-a="gopets">Kelola hewan</a></div>';
  h += '<div class="card pad"><h3>2. Pilih layanan</h3>' + (pet ? '<div class="opt">' + svcs.map(function (s) { return '<button class="op' + (b.svc === s.id ? " on" : "") + '" data-a="bksvc" data-id="' + s.id + '"><span class="g"><b>' + esc(s.name) + "</b><small>" + (s.type === "klinik" ? "Klinik" : "Grooming") + " &middot; " + s.dur + " menit</small></span><b>" + rp(s.price) + "</b></button>"; }).join("") + "</div>" : '<p class="note">Pilih hewan dulu.</p>') + "</div>";
  if (sv) {
    var role = sv.type === "klinik" ? "dokter" : "groomer", st = db.staff.filter(function (s) { return s.role === role; });
    h += '<div class="card pad"><h3>3. Petugas</h3><label class="f">' + (role === "dokter" ? "Dokter hewan" : "Groomer") + '<select class="inp" id="bk-st"><option value="">Siapa saja yang kosong</option>' + st.map(function (s) { return '<option value="' + s.id + '"' + (b.staff === s.id ? " selected" : "") + ">" + esc(s.name) + "</option>"; }).join("") + "</select></label></div>";
    var days = []; for (var i = 0; i < 14; i++) days.push(addD(t, i));
    h += '<div class="card pad"><h3>4. Tanggal</h3><div class="days" role="group" aria-label="Tanggal">' + days.map(function (dt) { var has = slotsFor(sv, dt, b.staff).some(function (x) { return x.ok; }); var d = parse(dt); return '<button class="dy' + (b.date === dt ? " on" : "") + '" data-a="bkdate" data-v="' + dt + '"' + (has ? "" : " disabled") + ' aria-label="' + esc(fd(dt)) + (has ? "" : ", penuh atau tutup") + '"><small>' + DAY[d.getDay()] + "</small>" + d.getDate() + "<small>" + MON[d.getMonth()] + "</small></button>"; }).join("") + "</div></div>";
    if (b.date) {
      var sl = slotsFor(sv, b.date, b.staff);
      h += '<div class="card pad"><h3>5. Jam</h3><div class="slots">' + sl.map(function (x) { return '<button class="sl' + (b.time === x.t ? " on" : "") + '" data-a="bktime" data-v="' + x.t + '"' + (x.ok ? "" : " disabled") + ">" + x.t + "</button>"; }).join("") + '</div><p class="note">Jam yang dicoret sudah terisi, di luar jam praktik, atau istirahat 12:00 sampai 13:00.</p></div>';
    }
  }
  h += '</div><div><div class="card pad" style="position:sticky;top:76px"><h3>Ringkasan</h3>' + (pet ? "<p><b>" + esc(pet.name) + "</b> (" + esc(pet.sp) + ")" + (pet.allergy ? '<br><span class="tag w">' + esc(pet.allergy) + "</span>" : "") + "</p>" : '<p class="note">Belum memilih hewan.</p>') +
    (sv ? '<div class="sum"><span>' + esc(sv.name) + "</span><span>" + rp(sv.price) + "</span></div><div class=\"sum\"><span>Durasi</span><span>" + sv.dur + " menit</span></div>" : "") + (b.date ? '<div class="sum"><span>Tanggal</span><span>' + fds(b.date) + "</span></div>" : "") + (b.time ? '<div class="sum"><span>Jam</span><span>' + b.time + " sampai " + mt(tmin(b.time) + sv.dur) + "</span></div>" : "") +
    '<label class="f" style="margin-top:10px">Catatan untuk petugas (opsional)<textarea class="inp" id="bk-note" maxlength="200">' + esc(b.note) + '</textarea></label><p class="err" id="bk-e" role="alert"></p><button class="btn w" data-a="bkgo">Konfirmasi booking</button></div></div></div>';
  return h;
}
function bookAppt() {
  var b = ui.bk, e = $("bk-e"), o = owner(), pet = by(db.pets, b.pet), sv = by(db.services, b.svc);
  if (!pet) { e.textContent = "Pilih hewan dulu."; return; }
  if (!sv) { e.textContent = "Pilih layanan."; return; }
  if (!b.date) { e.textContent = "Pilih tanggal."; return; }
  if (!b.time) { e.textContent = "Pilih jam."; return; }
  var sl = slotsFor(sv, b.date, b.staff).filter(function (x) { return x.t === b.time && x.ok; })[0];
  if (!sl) { e.textContent = "Jam ini baru saja terisi. Pilih jam lain."; b.time = ""; route(); return; }
  var a = { id: nid(db, "a"), owner: o.id, pet: pet.id, svc: sv.id, sn: sv.name, type: sv.type, staff: sl.free[0], date: b.date, time: b.time, dur: sv.dur, price: sv.price, status: "dijadwalkan", note: b.note.trim() };
  db.appts.push(a); save(); b.done = a.id; route(); toast("Booking tersimpan");
}

/* ----- account ----- */
function petForm(p) {
  p = p || { name: "", sp: "kucing", breed: "", born: "", weight: "", sex: "betina", allergy: "", note: "" };
  return sheetHead(p.id ? "Ubah profil hewan" : "Tambah hewan") + '<div class="stack"><label class="f">Nama<input class="inp" id="pf-n" maxlength="24" value="' + esc(p.name) + '"></label><div class="two"><label class="f">Jenis<select class="inp" id="pf-s"><option value="kucing"' + (p.sp === "kucing" ? " selected" : "") + '>Kucing</option><option value="anjing"' + (p.sp === "anjing" ? " selected" : "") + '>Anjing</option></select></label><label class="f">Kelamin<select class="inp" id="pf-x"><option value="betina"' + (p.sex === "betina" ? " selected" : "") + '>Betina</option><option value="jantan"' + (p.sex === "jantan" ? " selected" : "") + '>Jantan</option></select></label></div><label class="f">Ras<input class="inp" id="pf-b" maxlength="30" value="' + esc(p.breed) + '" placeholder="Contoh: Domestik"></label><div class="two"><label class="f">Tanggal lahir (perkiraan)<input class="inp" id="pf-d" type="date" max="' + today() + '" value="' + esc(p.born) + '"></label><label class="f">Berat (kg)<input class="inp" id="pf-w" inputmode="decimal" value="' + esc(p.weight) + '"></label></div><label class="f">Alergi (opsional)<input class="inp" id="pf-a" maxlength="60" value="' + esc(p.allergy) + '" placeholder="Contoh: alergi ayam"></label><p class="err" id="pf-e" role="alert"></p><button class="btn w" data-a="petsave" data-id="' + (p.id || "") + '">Simpan</button></div>';
}
function savePet(id) {
  var n = $("pf-n").value.trim(), b = $("pf-b").value.trim(), d = $("pf-d").value, w = parseFloat($("pf-w").value.replace(",", ".")), e = $("pf-e");
  if (n.length < 2) { e.textContent = "Isi nama hewan."; return; }
  if (!b) { e.textContent = "Isi ras (boleh 'Campuran')."; return; }
  if (!d || d > today()) { e.textContent = "Tanggal lahir tidak valid."; return; }
  if (!(w > 0 && w <= 90)) { e.textContent = "Berat harus antara 0,1 dan 90 kg."; return; }
  var o = owner(), sp = $("pf-s").value, p = id ? by(db.pets, id) : { id: nid(db, "pt"), owner: o.id, img: "", note: "" };
  p.name = n; p.sp = sp; p.sex = $("pf-x").value; p.breed = b; p.born = d; p.weight = Math.round(w * 10) / 10; p.allergy = $("pf-a").value.trim();
  if (!p.img) p.img = sp === "kucing" ? (p.id.length % 2 ? "cat1" : "cat2") : (p.id.length % 2 ? "dog1" : "dog2");
  if (!id) db.pets.push(p);
  save(); closeSheet(); route(); toast(id ? "Profil diperbarui" : "Hewan ditambahkan");
}
function petCard(p) {
  return '<div class="card pad pet"><div class="im">' + petImg(p) + '</div><div><h3 style="margin:0">' + esc(p.name) + '</h3><div class="note">' + esc(p.sp) + ", " + esc(p.breed) + ", " + esc(p.sex) + "</div><div class=\"meta\" style=\"margin-top:4px\"><span class=\"tag n\">" + ageOf(p.born) + '</span><span class="tag n">' + p.weight + ' kg</span>' + (p.allergy ? '<span class="tag w">' + esc(p.allergy) + "</span>" : "") + '</div></div><div class="row" style="grid-column:1/-1"><button class="btn s o" data-a="petedit" data-id="' + p.id + '">Ubah</button><button class="btn s o" data-a="petbook" data-id="' + p.id + '">Booking</button><button class="btn s o" data-a="petbuku" data-id="' + p.id + '">Buku kesehatan</button><button class="btn s d" data-a="petdel" data-id="' + p.id + '">Hapus</button></div></div>';
}
function healthBook(p, forPrint) {
  var vs = db.vaccines.filter(function (v) { return v.pet === p.id; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var recs = db.records.filter(function (r) { return r.pet === p.id; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var cur = currentVaccines().filter(function (v) { return v.pet === p.id; });
  return '<div class="card pad"><h3>Buku kesehatan ' + esc(p.name) + '</h3><div class="note">' + esc(p.sp) + ", " + esc(p.breed) + ", " + esc(p.sex) + ", " + ageOf(p.born) + ", " + p.weight + " kg" + (p.allergy ? ". Alergi: " + esc(p.allergy) : "") + '</div></div>' +
    '<div class="sec"><h2>Vaksinasi</h2></div><div class="card pad">' + (vs.length ? vs.map(function (v) { var isCur = cur.indexOf(v) >= 0; return '<div class="li"><div class="g"><b>' + esc(v.name) + "</b><small>Diberikan " + fds(v.date) + (isCur ? " &middot; ulang sebelum " + fds(v.due) : "") + "</small></div>" + (isCur ? vaccTag(v) : '<span class="tag n">Sudah diulang</span>') + "</div>"; }).join("") : '<div class="note">Belum ada catatan vaksin.</div>') + "</div>" +
    '<div class="sec"><h2>Riwayat kunjungan</h2></div><div class="card pad">' + (recs.length ? recs.map(function (r) { return '<div class="li" style="align-items:flex-start"><div class="g"><b>' + esc(r.sn) + " &middot; " + fds(r.date) + "</b><small>" + esc(staffName(r.staff)) + (r.weight ? " &middot; " + r.weight + " kg" : "") + "</small><dl class=\"kv\" style=\"margin-top:6px\"><dt>Diagnosa</dt><dd>" + esc(r.dx || "-") + "</dd><dt>Tindakan</dt><dd>" + esc(r.act || "-") + "</dd><dt>Resep</dt><dd>" + esc(r.rx || "-") + "</dd></dl></div></div>"; }).join("") : '<div class="note">Belum ada kunjungan tercatat.</div>') + "</div>" + (forPrint ? "" : '<div class="row noprint" style="margin-top:10px"><button class="btn o" data-a="bukuprint" data-id="' + p.id + '">Cetak buku kesehatan</button></div>');
}
function vAkun() {
  var o = owner(); if (!o) return '<div class="sec"><h2>Akun</h2></div>' + authBox();
  var tabs = [["hewan", "Hewan saya"], ["buku", "Buku kesehatan"], ["janji", "Janji"], ["pesanan", "Pesanan"]];
  var pets = db.pets.filter(function (p) { return p.owner === o.id; }), h = '<div class="sec"><h2>Halo, ' + esc(o.name.split(" ")[0]) + '</h2><button class="btn s o" style="margin-left:auto" data-a="logout">Keluar</button></div><div class="seg" role="tablist">' + tabs.map(function (t) { return '<button role="tab" class="' + (ui.atab === t[0] ? "on" : "") + '" data-a="atab" data-v="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>";
  if (ui.atab === "hewan") {
    h += '<div class="row" style="margin-bottom:10px"><button class="btn" data-a="petnew">Tambah hewan</button></div>' + (pets.length ? '<div class="svg">' + pets.map(petCard).join("") + "</div>" : '<div class="empty"><b>Belum ada hewan</b>Tambahkan profil hewan untuk booking dan buku kesehatan.</div>');
  } else if (ui.atab === "buku") {
    if (!pets.length) h += '<div class="empty"><b>Belum ada hewan</b>Tambahkan hewan dulu.</div>';
    else {
      var p = by(pets, ui.apet) || pets[0]; ui.apet = p.id;
      h += '<div class="chips">' + pets.map(function (x) { return '<button class="chip' + (x.id === p.id ? " on" : "") + '" data-a="apet" data-id="' + x.id + '">' + esc(x.name) + "</button>"; }).join("") + "</div>" + healthBook(p);
    }
  } else if (ui.atab === "janji") {
    var l = db.appts.filter(function (a) { return a.owner === o.id; }).sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? 1 : -1; });
    h += '<div class="row" style="margin-bottom:10px"><a class="btn" href="#/booking">Booking baru</a></div>' + (l.length ? '<div class="card pad">' + l.map(function (a) { return '<div class="li"><div class="g"><b>' + esc(a.sn) + " &middot; " + esc(petName(a.pet)) + "</b><small>" + fd(a.date) + ", " + a.time + " &middot; " + esc(staffName(a.staff)) + '</small></div>' + stTag(a.status) + (a.status === "dijadwalkan" ? '<button class="btn s d" data-a="acancel" data-id="' + a.id + '">Batalkan</button>' : "") + "</div>"; }).join("") + "</div>" : '<div class="empty"><b>Belum ada janji</b>Booking dokter hewan atau grooming.</div>');
  } else {
    var ol = db.orders.filter(function (x) { return x.owner === o.id || x.phone === o.phone; }).sort(function (a, b) { return a.code < b.code ? 1 : -1; });
    h += ol.length ? '<div class="card pad">' + ol.map(function (x) { return '<div class="li"><div class="g"><b>' + x.code + " &middot; " + rp(x.total) + "</b><small>" + fds(x.date) + " &middot; " + x.items.length + ' jenis barang</small></div><span class="tag ' + ordCls(x.status) + '">' + ordLabel(x) + '</span><a class="btn s o" href="#/lacak?kode=' + x.code + '">Lacak</a></div>'; }).join("") + "</div>" : '<div class="empty"><b>Belum ada pesanan</b>Belanja di toko.</div>';
  }
  return h;
}
function stTag(s) { var c = { dijadwalkan: "i", hadir: "w", diperiksa: "w", selesai: "g", batal: "n" }[s] || "n"; return '<span class="tag ' + c + '">' + ({ dijadwalkan: "Dijadwalkan", hadir: "Hadir", diperiksa: "Diperiksa", selesai: "Selesai", batal: "Batal" }[s] || s) + "</span>"; }
function ordLabel(o) { return { baru: "Baru", diproses: "Diproses", dikirim: o.method === "ambil" ? "Siap diambil" : "Dikirim", selesai: "Selesai", batal: "Dibatalkan" }[o.status]; }
function ordCls(s) { return { baru: "i", diproses: "w", dikirim: "w", selesai: "g", batal: "n" }[s]; }

/* ----- cart / orders ----- */
function addCart(id, q) {
  var p = by(db.products, id); if (!p) return;
  var ln = by(db.cart, id), have = ln ? ln.q : 0;
  if (have + q > p.stock) { toast("Stok " + p.name + " tersisa " + p.stock, true); return false; }
  if (ln) ln.q += q; else db.cart.push({ id: id, q: q });
  db.cart = db.cart.filter(function (x) { return x.q > 0; });
  save(); cartBadge(); return true;
}
function cartTotals() { var sub = db.cart.reduce(function (s, x) { var p = by(db.products, x.id); return s + (p ? p.price * x.q : 0); }, 0); return sub; }
function shipFor(method, sub) { return method === "antar" && sub > 0 && sub < 200000 ? 12000 : 0; }
function cartSheet() {
  var h = sheetHead("Keranjang");
  if (!db.cart.length) { openSheet(h + '<div class="empty"><b>Keranjang kosong</b>Pilih produk di toko.</div><a class="btn w" style="margin-top:12px" href="#/toko" data-a="close">Ke toko</a>'); return; }
  var sub = cartTotals();
  h += db.cart.map(function (x) { var p = by(db.products, x.id); return '<div class="li"><div class="g"><b>' + esc(p.name) + "</b><small>" + rp(p.price) + ' &middot; stok ' + p.stock + '</small></div><div class="qty"><button data-a="cminus" data-id="' + p.id + '" aria-label="Kurangi">-</button><span>' + x.q + '</span><button data-a="cplus" data-id="' + p.id + '" aria-label="Tambah">+</button></div></div>'; }).join("");
  h += '<div class="sum t"><span>Subtotal</span><span>' + rp(sub) + '</span></div><p class="note">Ongkir dihitung saat checkout. Gratis ongkir di atas Rp200.000.</p><button class="btn w" data-a="checkout">Checkout</button><button class="btn d w" style="margin-top:8px" data-a="cclear">Kosongkan keranjang</button>';
  openSheet(h);
}
var co = { method: "antar", pay: "transfer" };
function checkoutSheet() {
  var o = owner(), sub = cartTotals(), ship = shipFor(co.method, sub);
  var h = sheetHead("Checkout") + '<div class="stack"><label class="f">Nama penerima<input class="inp" id="co-n" maxlength="40" value="' + esc(o ? o.name : "") + '"></label><label class="f">Nomor telepon<input class="inp" id="co-p" inputmode="tel" maxlength="16" value="' + esc(o ? fmtPhone(o.phone) : "") + '"></label><div class="two"><label class="f">Pengambilan<select class="inp" id="co-m"><option value="antar"' + (co.method === "antar" ? " selected" : "") + '>Diantar</option><option value="ambil"' + (co.method === "ambil" ? " selected" : "") + '>Ambil di toko</option></select></label><label class="f">Pembayaran<select class="inp" id="co-y"><option value="transfer"' + (co.pay === "transfer" ? " selected" : "") + '>Transfer bank</option><option value="cod"' + (co.pay === "cod" ? " selected" : "") + (co.method === "ambil" ? " disabled" : "") + '>Bayar di tempat (COD)</option><option value="toko"' + (co.pay === "toko" ? " selected" : "") + (co.method === "antar" ? " disabled" : "") + '>Bayar di toko</option></select></label></div>' +
    (co.method === "antar" ? '<label class="f">Alamat lengkap<textarea class="inp" id="co-a" maxlength="160">' + esc(o ? o.addr : "") + "</textarea></label>" : "") + '<label class="f">Catatan (opsional)<input class="inp" id="co-c" maxlength="100"></label></div><div class="sum"><span>Subtotal</span><span>' + rp(sub) + '</span></div><div class="sum"><span>Ongkir</span><span>' + (ship ? rp(ship) : "Gratis") + '</span></div><div class="sum t"><span>Total</span><span>' + rp(sub + ship) + '</span></div><p class="err" id="co-e" role="alert"></p><button class="btn w" data-a="placeorder">Pesan sekarang</button><p class="note">Demo: tidak ada pembayaran sungguhan.</p>';
  openSheet(h);
}
function placeOrder() {
  var e = $("co-e"), n = $("co-n").value.trim(), p = normPhone($("co-p").value), a = $("co-a") ? $("co-a").value.trim() : "";
  if (!db.cart.length) { e.textContent = "Keranjang kosong."; return; }
  if (n.length < 3) { e.textContent = "Isi nama penerima."; return; }
  if (!okPhone(p)) { e.textContent = "Nomor telepon tidak valid."; return; }
  if (co.method === "antar" && a.length < 10) { e.textContent = "Alamat minimal 10 karakter."; return; }
  for (var i = 0; i < db.cart.length; i++) { var x = db.cart[i], pr = by(db.products, x.id); if (!pr || pr.stock < x.q) { e.textContent = "Stok " + (pr ? pr.name : "produk") + " tidak cukup. Ubah keranjang."; return; } }
  var items = db.cart.map(function (x) { var pr = by(db.products, x.id); pr.stock -= x.q; return { id: pr.id, n: pr.name, p: pr.price, q: x.q }; });
  var sub = items.reduce(function (s, x) { return s + x.p * x.q; }, 0), ship = shipFor(co.method, sub), o = owner();
  var ord = { id: "ord" + (++db.seq.ord), code: "PS-" + db.seq.ord, owner: o ? o.id : "", name: n, phone: p, addr: co.method === "antar" ? a : "", method: co.method, pay: co.pay, items: items, sub: sub, ship: ship, total: sub + ship, status: "baru", date: today(), log: [{ s: "baru", d: today(), t: nowStr() }], note: $("co-c").value.trim() };
  db.orders.push(ord); db.cart = []; save(); cartBadge();
  openSheet(sheetHead("Pesanan diterima") + '<span class="tag g">' + ord.code + '</span><p>Terima kasih, ' + esc(n) + '. Total ' + rp(ord.total) + '.</p><p class="note">Simpan kode dan nomor telepon untuk melacak pesanan.</p><a class="btn w" href="#/lacak?kode=' + ord.code + '" data-a="close">Lacak pesanan</a>');
}
function vLacak(q) {
  var code = (q.kode || "").toUpperCase();
  return '<div class="sec"><h2>Lacak pesanan</h2></div><div class="card pad" style="max-width:520px"><div class="stack"><label class="f">Kode pesanan<input class="inp" id="lk-c" value="' + esc(code) + '" placeholder="PS-1001" maxlength="12"></label><label class="f">Nomor telepon<input class="inp" id="lk-p" inputmode="tel" maxlength="16" placeholder="0812-0000-1001"></label><p class="err" id="lk-e" role="alert"></p><button class="btn" data-a="lacak">Cari pesanan</button></div></div><div id="lk-r" style="margin-top:14px;max-width:520px"></div>';
}
function lacak() {
  var c = $("lk-c").value.trim().toUpperCase(), p = normPhone($("lk-p").value), e = $("lk-e"), r = $("lk-r");
  e.textContent = ""; r.innerHTML = "";
  if (!c || !p) { e.textContent = "Isi kode dan nomor telepon."; return; }
  var o = db.orders.filter(function (x) { return x.code === c && x.phone === p; })[0];
  if (!o) { e.textContent = "Pesanan tidak ditemukan. Cek kode dan nomor telepon."; return; }
  r.innerHTML = orderDetail(o, true);
}
function orderDetail(o, tl) {
  var flow = ["baru", "diproses", "dikirim", "selesai"], idx = flow.indexOf(o.status);
  var labels = { baru: "Pesanan diterima", diproses: "Sedang disiapkan", dikirim: o.method === "ambil" ? "Siap diambil di toko" : "Dalam pengiriman", selesai: "Selesai" };
  var h = '<div class="card pad"><div class="row"><h3 style="margin:0">' + o.code + '</h3><span class="sp"></span><span class="tag ' + ordCls(o.status) + '">' + ordLabel(o) + '</span></div><p class="note">' + fds(o.date) + " &middot; " + esc(o.name) + " &middot; " + (o.method === "antar" ? "Diantar ke " + esc(o.addr) : "Ambil di toko") + "</p>";
  h += o.items.map(function (x) { return '<div class="sum"><span>' + x.q + " x " + esc(x.n) + "</span><span>" + rp(x.p * x.q) + "</span></div>"; }).join("") + '<div class="sum"><span>Ongkir</span><span>' + (o.ship ? rp(o.ship) : "Gratis") + '</span></div><div class="sum t"><span>Total</span><span>' + rp(o.total) + "</span></div></div>";
  if (tl) {
    h += '<div class="card pad" style="margin-top:12px"><h3>Status</h3>' + (o.status === "batal" ? '<div class="tl">' + o.log.map(function (l) { return '<div class="on"><b>' + (l.s === "batal" ? "Dibatalkan" : "Pesanan diterima") + "</b><div class=\"note\">" + fds(l.d) + ", " + l.t + "</div></div>"; }).join("") + "</div>" : '<div class="tl">' + flow.map(function (s, i) { var lg = o.log.filter(function (l) { return l.s === s; })[0]; return '<div class="' + (i <= idx ? "on" : "off") + '"><b>' + labels[s] + '</b><div class="note">' + (lg ? fds(lg.d) + ", " + lg.t : "Belum") + "</div></div>"; }).join("") + "</div>") + "</div>";
  }
  return h;
}

/* ---------- admin ---------- */
function isAdmin() { try { return sessionStorage.getItem("ps.admin") === "1"; } catch (e) { return false; } }
function vAdmin() {
  if (!isAdmin()) return '<div class="sec"><h2>Panel klinik</h2></div><div class="pin card pad"><h3>Masuk pengelola</h3><label class="f">PIN (4 angka)<input class="inp" id="ad-pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></label><p class="err" id="ad-e" role="alert"></p><button class="btn w" data-a="adlogin">Masuk</button><p class="note">PIN demo: ' + esc(db.shop.pin) + ' <button class="btn s o" data-a="adfill">Isi otomatis</button></p></div>';
  var tabs = [["antrian", "Antrian"], ["jadwal", "Jadwal"], ["stok", "Stok"], ["pesanan", "Pesanan"], ["pengingat", "Pengingat"], ["laporan", "Laporan"], ["atur", "Pengaturan"]];
  var h = '<div class="sec"><h2>Panel klinik</h2><button class="btn s o" style="margin-left:auto" data-a="adlogout">Keluar</button></div><div class="seg" role="tablist">' + tabs.map(function (t) { return '<button role="tab" class="' + (ui.aTab === t[0] ? "on" : "") + '" data-a="adtab" data-v="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>";
  return h + ({ antrian: aQueue, jadwal: aSched, stok: aStock, pesanan: aOrders, pengingat: aRem, laporan: aReport, atur: aSet }[ui.aTab] || aQueue)();
}
function aQueue() {
  var d = ui.qDate, l = db.appts.filter(function (a) { return a.date === d; }).sort(function (a, b) { return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });
  var act = l.filter(function (a) { return a.status !== "batal"; }), n = 0;
  var cnt = function (s) { return act.filter(function (a) { return a.status === s; }).length; };
  var h = '<div class="stat"><div class="card"><small>Janji</small><b>' + act.length + '</b></div><div class="card"><small>Menunggu</small><b>' + (cnt("dijadwalkan") + cnt("hadir")) + '</b></div><div class="card"><small>Diperiksa</small><b>' + cnt("diperiksa") + '</b></div><div class="card"><small>Selesai</small><b>' + cnt("selesai") + '</b></div></div>';
  h += '<div class="row" style="margin-bottom:10px"><button class="btn s o" data-a="qday" data-v="-1" aria-label="Hari sebelumnya">&lt;</button><b>' + fd(d) + (d === today() ? " (hari ini)" : "") + '</b><button class="btn s o" data-a="qday" data-v="1" aria-label="Hari berikutnya">&gt;</button><button class="btn s o" data-a="qday" data-v="0">Hari ini</button></div>';
  if (!l.length) return h + '<div class="empty"><b>Tidak ada janji</b>Belum ada booking untuk tanggal ini.</div>';
  return h + '<div class="qg">' + l.map(function (a) {
    var p = by(db.pets, a.pet), o = by(db.owners, a.owner), num = a.status === "batal" ? "-" : ++n;
    var btns = "";
    if (a.status === "dijadwalkan") btns = '<button class="btn s" data-a="qst" data-v="hadir" data-id="' + a.id + '">Check-in</button>';
    if (a.status === "hadir") btns = '<button class="btn s" data-a="qst" data-v="diperiksa" data-id="' + a.id + '">Mulai periksa</button>';
    if (a.status === "diperiksa" || a.status === "hadir") btns += '<button class="btn s a" data-a="recform" data-id="' + a.id + '">Rekam medis</button>';
    if (a.status === "selesai") btns = '<button class="btn s o" data-a="recview" data-id="' + a.id + '">Lihat rekam</button>';
    if (a.status !== "selesai" && a.status !== "batal") btns += '<button class="btn s d" data-a="qcancel" data-id="' + a.id + '">Batalkan</button>';
    return '<div class="card pad"><div class="row"><b style="font-size:1.1rem">' + a.time + '</b><span class="note">sampai ' + mt(tmin(a.time) + a.dur) + '</span><span class="sp"></span><span class="tag n">No. ' + num + "</span>" + stTag(a.status) + '</div><div style="margin:6px 0"><b>' + esc(p ? p.name : "(dihapus)") + "</b> &middot; " + esc(p ? p.sp + ", " + p.breed : "") + (p && p.allergy ? ' <span class="tag w">' + esc(p.allergy) + "</span>" : "") + "<br><span class=\"note\">" + esc(a.sn) + " &middot; " + esc(staffName(a.staff)) + " &middot; pemilik " + esc(o ? o.name : "-") + (a.note ? " &middot; Catatan: " + esc(a.note) : "") + '</span></div><div class="row">' + btns + "</div></div>";
  }).join("") + "</div>";
}
function recForm(a) {
  var p = by(db.pets, a.pet), s = by(db.services, a.svc), medSel = s && s.med;
  var h = sheetHead("Rekam medis") + '<p><b>' + esc(p ? p.name : "") + "</b> &middot; " + esc(a.sn) + "<br>" + (p && p.allergy ? '<span class="tag w">' + esc(p.allergy) + "</span>" : "") + '</p><div class="stack"><label class="f">Berat (kg)<input class="inp" id="rc-w" inputmode="decimal" value="' + esc(p ? p.weight : "") + '"></label><label class="f">Diagnosa atau kondisi<textarea class="inp" id="rc-d" maxlength="200"></textarea></label><label class="f">Tindakan<textarea class="inp" id="rc-t" maxlength="200">' + esc(a.sn) + '</textarea></label><label class="f">Resep untuk pemilik<textarea class="inp" id="rc-r" maxlength="200"></textarea></label><div class="f"><span>Obat dan bahan yang dipakai</span><div class="card pad" style="max-height:220px;overflow:auto">' + db.meds.map(function (m) { return '<div class="li"><div class="g"><b>' + esc(m.name) + "</b><small>Stok " + m.stock + " " + esc(m.unit) + '</small></div><input class="inp rc-m" style="width:78px" type="number" min="0" max="' + m.stock + '" data-id="' + m.id + '" value="' + (medSel === m.id && m.stock > 0 ? 1 : 0) + '" aria-label="Jumlah ' + esc(m.name) + '"></div>'; }).join("") + "</div></div>";
  if (s && s.vacc) h += '<div class="card pad" style="background:var(--soft)"><label style="display:flex;gap:8px;align-items:center;font-weight:700;min-height:40px"><input type="checkbox" id="rc-v" checked style="width:20px;height:20px"> Catat vaksinasi di buku kesehatan</label><label class="f">Nama vaksin<input class="inp" id="rc-vn" maxlength="40" value="' + esc(s.name.replace(/^Vaksin (kucing |anjing )?/i, "Vaksin ").replace("Vaksin F3", "Vaksin F3")) + '"></label><label class="f">Jatuh tempo ulang<input class="inp" id="rc-vd" type="date" value="' + addD(a.date, s.vacc) + '"></label></div>';
  return h + '<p class="err" id="rc-e" role="alert"></p><button class="btn w" data-a="recsave" data-id="' + a.id + '">Simpan dan selesaikan</button></div>';
}
function saveRec(id) {
  var a = by(db.appts, id), e = $("rc-e"), p = by(db.pets, a.pet), w = parseFloat($("rc-w").value.replace(",", ".")), dx = $("rc-d").value.trim(), act = $("rc-t").value.trim(), rx = $("rc-r").value.trim();
  if (!(w > 0 && w <= 90)) { e.textContent = "Berat harus antara 0,1 dan 90 kg."; return; }
  if (dx.length < 3) { e.textContent = "Isi diagnosa atau kondisi."; return; }
  if (act.length < 3) { e.textContent = "Isi tindakan."; return; }
  var meds = []; var bad = "";
  document.querySelectorAll(".rc-m").forEach(function (i) { var q = parseInt(i.value, 10) || 0, m = by(db.meds, i.dataset.id); if (q < 0) bad = "Jumlah obat tidak boleh negatif."; if (q > m.stock) bad = "Stok " + m.name + " hanya " + m.stock + "."; if (q > 0) meds.push({ id: m.id, q: q }); });
  if (bad) { e.textContent = bad; return; }
  var vOn = $("rc-v") && $("rc-v").checked, vn = $("rc-vn") ? $("rc-vn").value.trim() : "", vd = $("rc-vd") ? $("rc-vd").value : "";
  if (vOn && (!vn || !vd || vd <= a.date)) { e.textContent = "Isi nama vaksin dan jatuh tempo setelah tanggal kunjungan."; return; }
  meds.forEach(function (m) { by(db.meds, m.id).stock -= m.q; });
  var r = { id: nid(db, "r"), appt: a.id, pet: a.pet, date: a.date, staff: a.staff, svc: a.svc, sn: a.sn, weight: Math.round(w * 10) / 10, dx: dx, act: act, rx: rx || "-", meds: meds };
  db.records.push(r); a.rec = r.id; a.status = "selesai"; if (p) p.weight = r.weight;
  if (vOn) db.vaccines.push({ id: nid(db, "v"), pet: a.pet, name: vn, date: a.date, due: vd, contacted: false });
  save(); closeSheet(); route(); toast("Rekam medis tersimpan, tampil di buku kesehatan pemilik");
}
function recView(a) {
  var r = by(db.records, a.rec), p = by(db.pets, a.pet);
  if (!r) return sheetHead("Rekam medis") + '<p class="note">Tidak ada rekam.</p>';
  return sheetHead("Rekam medis") + "<p><b>" + esc(p ? p.name : "") + "</b> &middot; " + esc(r.sn) + "<br><span class=\"note\">" + fd(r.date) + " &middot; " + esc(staffName(r.staff)) + '</span></p><dl class="kv"><dt>Berat</dt><dd>' + r.weight + " kg</dd><dt>Diagnosa</dt><dd>" + esc(r.dx) + "</dd><dt>Tindakan</dt><dd>" + esc(r.act) + "</dd><dt>Resep</dt><dd>" + esc(r.rx) + "</dd><dt>Obat dipakai</dt><dd>" + (r.meds && r.meds.length ? r.meds.map(function (m) { var x = by(db.meds, m.id); return esc(x ? x.name : m.id) + " x" + m.q; }).join(", ") : "-") + "</dd></dl>";
}
function aSched() {
  return '<p class="note">Atur hari dan jam praktik. Janji yang sudah ada tidak berubah. Booking baru mengikuti jadwal ini.</p><div class="svg">' + db.staff.map(function (s) {
    return '<div class="card pad"><div class="li" style="border:0"><span class="ava ' + (s.role === "dokter" ? "" : "c2") + '">' + esc(initials(s.name)) + '</span><div class="g"><b>' + esc(s.name) + "</b><small>" + (s.role === "dokter" ? "Dokter hewan" : "Groomer") + '</small></div></div><div class="f" style="margin-top:6px"><span>Hari praktik</span></div><div class="chips" style="flex-wrap:wrap;overflow:visible">' + [1, 2, 3, 4, 5, 6, 0].map(function (d) { var on = s.days.indexOf(d) >= 0; return '<button class="chip' + (on ? " on" : "") + '" aria-pressed="' + on + '" data-a="sday" data-id="' + s.id + '" data-v="' + d + '">' + DAY[d] + "</button>"; }).join("") + '</div><div class="two"><label class="f">Mulai<input class="inp" type="time" step="1800" data-in="sstart" data-id="' + s.id + '" value="' + s.start + '"></label><label class="f">Selesai<input class="inp" type="time" step="1800" data-in="send" data-id="' + s.id + '" value="' + s.end + '"></label></div><div class="f" style="margin-top:8px"><span>Libur khusus</span></div>' + (s.off.length ? '<div class="meta">' + s.off.map(function (o) { return '<span class="tag n">' + fds(o) + ' <button data-a="offdel" data-id="' + s.id + '" data-v="' + o + '" aria-label="Hapus libur ' + o + '" style="border:0;background:none;font-weight:800;min-width:28px;min-height:28px">&times;</button></span>'; }).join("") + "</div>" : '<div class="note">Tidak ada.</div>') + '<div class="row" style="margin-top:8px"><input class="inp" style="flex:1;min-width:150px" type="date" id="off-' + s.id + '" min="' + today() + '" aria-label="Tanggal libur ' + esc(s.name) + '"><button class="btn s o" data-a="offadd" data-id="' + s.id + '">Tambah libur</button></div></div>';
  }).join("") + "</div>";
}
function aStock() {
  var h = '<div class="seg"><button class="' + (ui.stk === "produk" ? "on" : "") + '" data-a="stk" data-v="produk">Produk toko</button><button class="' + (ui.stk === "obat" ? "on" : "") + '" data-a="stk" data-v="obat">Obat klinik</button></div>';
  if (ui.stk === "produk") {
    return h + '<div class="row" style="margin-bottom:10px"><button class="btn" data-a="pnew">Tambah produk</button><button class="btn o" data-a="csvstok">Unduh CSV stok</button></div><div class="card pad">' + db.products.map(function (p) { return '<div class="li"><div class="g"><b>' + esc(p.name) + "</b><small>" + esc(p.brand) + " &middot; " + esc(p.cat) + " &middot; " + rp(p.price) + "</small>" + stockTag(p.stock, p.min) + '</div><div class="qty"><button data-a="pstk" data-id="' + p.id + '" data-v="-1" aria-label="Kurangi stok ' + esc(p.name) + '">-</button><span>' + p.stock + '</span><button data-a="pstk" data-id="' + p.id + '" data-v="1" aria-label="Tambah stok ' + esc(p.name) + '">+</button></div><button class="btn s o" data-a="pedit" data-id="' + p.id + '">Ubah</button></div>'; }).join("") + "</div>";
  }
  return h + '<div class="card pad">' + db.meds.map(function (m) { return '<div class="li"><div class="g"><b>' + esc(m.name) + "</b><small>Minimum " + m.min + " " + esc(m.unit) + "</small>" + stockTag(m.stock, m.min) + '</div><div class="qty"><button data-a="mstk" data-id="' + m.id + '" data-v="-1" aria-label="Kurangi ' + esc(m.name) + '">-</button><span>' + m.stock + '</span><button data-a="mstk" data-id="' + m.id + '" data-v="5" aria-label="Tambah 5 ' + esc(m.name) + '">+5</button></div></div>'; }).join("") + "</div>";
}
function prodForm(p) {
  p = p || { name: "", brand: "", sp: "kucing", cat: "makanan", price: "", stock: "", min: 5 };
  var sel = function (id, cur, opts) { return '<select class="inp" id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (cur === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>"; };
  return sheetHead(p.id ? "Ubah produk" : "Tambah produk") + '<div class="stack"><label class="f">Nama produk<input class="inp" id="pr-n" maxlength="60" value="' + esc(p.name) + '"></label><label class="f">Merek<input class="inp" id="pr-b" maxlength="24" value="' + esc(p.brand) + '"></label><div class="two"><label class="f">Untuk<br>' + sel("pr-s", p.sp, [["kucing", "Kucing"], ["anjing", "Anjing"], ["semua", "Semua"]]) + '</label><label class="f">Kategori<br>' + sel("pr-c", p.cat, [["makanan", "Makanan"], ["pasir", "Pasir"], ["aksesori", "Aksesori"], ["vitamin", "Vitamin"]]) + '</label></div><div class="two"><label class="f">Harga (Rp)<input class="inp" id="pr-p" inputmode="numeric" value="' + esc(p.price) + '"></label><label class="f">Stok<input class="inp" id="pr-t" inputmode="numeric" value="' + esc(p.stock) + '"></label></div><p class="err" id="pr-e" role="alert"></p><button class="btn w" data-a="psave" data-id="' + (p.id || "") + '">Simpan</button>' + (p.id ? '<button class="btn d w" data-a="pdel" data-id="' + p.id + '">Hapus produk</button>' : "") + "</div>";
}
function saveProd(id) {
  var n = $("pr-n").value.trim(), b = $("pr-b").value.trim(), pr = parseInt($("pr-p").value.replace(/\D/g, ""), 10), st = parseInt($("pr-t").value, 10), e = $("pr-e");
  if (n.length < 3) { e.textContent = "Isi nama produk."; return; }
  if (!b) { e.textContent = "Isi merek."; return; }
  if (!(pr >= 1000)) { e.textContent = "Harga minimal Rp1.000."; return; }
  if (!(st >= 0)) { e.textContent = "Stok tidak valid."; return; }
  if (!db.seq.pn) db.seq.pn = 100;
  var p = id ? by(db.products, id) : { min: 5 };
  p.name = n; p.brand = b; p.sp = $("pr-s").value; p.cat = $("pr-c").value; p.price = pr; p.stock = st;
  if (!id) { p.id = "p" + (++db.seq.pn); p.img = { makanan: p.sp === "anjing" ? "kibbleD" : "kibbleC", pasir: "litter", aksesori: "bowl", vitamin: "vit" }[p.cat]; p.desc = "Produk baru."; db.products.push(p); }
  save(); closeSheet(); route(); toast("Produk disimpan");
}
function filteredOrders() { return db.orders.filter(function (o) { return !ui.ordf || o.status === ui.ordf; }).sort(function (a, b) { return a.code < b.code ? 1 : -1; }); }
function aOrders() {
  var l = filteredOrders();
  var h = '<div class="chips">' + [["", "Semua"], ["baru", "Baru"], ["diproses", "Diproses"], ["dikirim", "Dikirim"], ["selesai", "Selesai"], ["batal", "Batal"]].map(function (o) { return '<button class="chip' + (ui.ordf === o[0] ? " on" : "") + '" data-a="ordf" data-v="' + o[0] + '">' + o[1] + " (" + db.orders.filter(function (x) { return !o[0] || x.status === o[0]; }).length + ")</button>"; }).join("") + '</div><div class="row" style="margin-bottom:10px"><button class="btn o" data-a="csvord">Unduh CSV pesanan</button></div>';
  if (!l.length) return h + '<div class="empty"><b>Tidak ada pesanan</b>Belum ada pesanan dengan status ini.</div>';
  return h + '<div class="card pad">' + l.map(function (o) {
    var nx = { baru: "Proses", diproses: o.method === "ambil" ? "Siap diambil" : "Kirim", dikirim: "Selesai" }[o.status];
    return '<div class="li" style="flex-wrap:wrap"><div class="g"><b>' + o.code + " &middot; " + rp(o.total) + "</b><small>" + esc(o.name) + " &middot; " + fds(o.date) + " &middot; " + (o.method === "antar" ? "diantar" : "ambil") + '</small></div><span class="tag ' + ordCls(o.status) + '">' + ordLabel(o) + '</span><button class="btn s o" data-a="ordview" data-id="' + o.id + '">Detail</button>' + (nx ? '<button class="btn s" data-a="ordnext" data-id="' + o.id + '">' + nx + "</button>" : "") + (nx ? '<button class="btn s d" data-a="ordcancel" data-id="' + o.id + '">Batal</button>' : "") + "</div>";
  }).join("") + "</div>";
}
function remList() {
  var t = today(), l = currentVaccines().filter(function (v) { return diff(v.due, t) <= ui.remDays && (!ui.remF || !v.contacted); });
  return l.sort(function (a, b) { return a.due < b.due ? -1 : 1; });
}
function remMsg(v) { var p = by(db.pets, v.pet); return "Halo, ini " + db.shop.name + ". Vaksin " + v.name + " untuk " + p.name + " jatuh tempo " + fds(v.due) + ". Mau kami buatkan jadwal booking?"; }
function aRem() {
  var l = remList();
  var h = '<div class="row" style="margin-bottom:10px"><label class="f" style="min-width:150px">Jatuh tempo dalam<select class="inp" id="rem-d">' + [14, 30, 60].map(function (n) { return '<option value="' + n + '"' + (ui.remDays === n ? " selected" : "") + ">" + n + " hari</option>"; }).join("") + '</select></label><button class="chip' + (ui.remF ? " on" : "") + '" data-a="remf" aria-pressed="' + (!!ui.remF) + '">Belum dihubungi saja</button><button class="btn o" data-a="csvrem">Unduh CSV</button></div>';
  if (!l.length) return h + '<div class="empty"><b>Tidak ada vaksin yang perlu ditindaklanjuti</b>Semua aman untuk rentang ini.</div>';
  return h + '<div class="card pad">' + l.map(function (v) {
    var p = by(db.pets, v.pet), o = by(db.owners, p.owner);
    return '<div class="li" style="flex-wrap:wrap"><div class="g"><b>' + esc(p.name) + " &middot; " + esc(v.name) + "</b><small>Pemilik " + esc(o ? o.name : "-") + " &middot; " + esc(o ? fmtPhone(o.phone) : "") + " &middot; tempo " + fds(v.due) + "</small>" + vaccTag(v) + (v.contacted ? ' <span class="tag g">Sudah dihubungi</span>' : "") + '</div>' + (o ? '<a class="btn s" href="' + waLink(o.phone, remMsg(v)) + '" target="_blank" rel="noopener" data-a="remwa" data-id="' + v.id + '">WhatsApp</a>' : "") + '<button class="btn s o" data-a="remmark" data-id="' + v.id + '">' + (v.contacted ? "Batal tandai" : "Tandai dihubungi") + "</button></div>";
  }).join("") + "</div>";
}
function repData(n) {
  var t = today(), days = [], i;
  for (i = n - 1; i >= 0; i--) days.push(addD(t, -i));
  var s = days.map(function (d) { return { d: d, svc: 0, shop: 0 }; });
  db.appts.forEach(function (a) { if (a.status === "selesai") { var x = s.filter(function (y) { return y.d === a.date; })[0]; if (x) x.svc += a.price; } });
  db.orders.forEach(function (o) { if (o.status !== "batal") { var x = s.filter(function (y) { return y.d === o.date; })[0]; if (x) x.shop += o.total; } });
  return s;
}
function short(n) { return n >= 1e6 ? (n / 1e6).toFixed(1).replace(".", ",") + "jt" : n >= 1000 ? Math.round(n / 1000) + "rb" : String(n); }
function aReport() {
  var s = repData(ui.rep), from = s[0].d, svc = s.reduce(function (a, x) { return a + x.svc; }, 0), shop = s.reduce(function (a, x) { return a + x.shop; }, 0), max = Math.max.apply(null, s.map(function (x) { return x.svc + x.shop; }).concat([1]));
  var visits = db.appts.filter(function (a) { return a.status === "selesai" && a.date >= from; }), ords = db.orders.filter(function (o) { return o.status !== "batal" && o.date >= from; });
  var top = {}; ords.forEach(function (o) { o.items.forEach(function (x) { top[x.n] = (top[x.n] || 0) + x.q; }); });
  var tl = Object.keys(top).sort(function (a, b) { return top[b] - top[a]; }).slice(0, 5);
  var sv = {}; visits.forEach(function (a) { sv[a.sn] = (sv[a.sn] || 0) + 1; });
  var sl = Object.keys(sv).sort(function (a, b) { return sv[b] - sv[a]; }).slice(0, 5);
  return '<div class="row" style="margin-bottom:10px"><label class="f" style="min-width:150px">Rentang<select class="inp" id="rep-n">' + [7, 14, 30].map(function (n) { return '<option value="' + n + '"' + (ui.rep === n ? " selected" : "") + ">" + n + " hari terakhir</option>"; }).join("") + '</select></label><button class="btn o" data-a="csvvisit">CSV kunjungan</button><button class="btn o" data-a="repprint">Cetak</button></div>' +
    '<div class="stat"><div class="card"><small>Pendapatan layanan</small><b>' + rp(svc) + '</b></div><div class="card"><small>Penjualan toko</small><b>' + rp(shop) + '</b></div><div class="card"><small>Kunjungan selesai</small><b>' + visits.length + '</b></div><div class="card"><small>Pesanan (tidak batal)</small><b>' + ords.length + '</b></div></div>' +
    '<div class="card pad"><h3>Pendapatan per hari</h3><div class="bars" role="img" aria-label="Grafik pendapatan harian">' + s.map(function (x) { var tot = x.svc + x.shop; return '<div><span>' + (tot ? short(tot) : "") + '</span><i style="height:' + Math.max(2, Math.round(tot / max * 100)) + '%"></i><span>' + (ui.rep > 14 ? "" : parse(x.d).getDate()) + "</span></div>"; }).join("") + '</div></div><div class="svg" style="margin-top:12px"><div class="card pad"><h3>Produk terlaris</h3>' + (tl.length ? tl.map(function (n) { return '<div class="sum"><span>' + esc(n) + "</span><span>" + top[n] + "</span></div>"; }).join("") : '<div class="note">Belum ada.</div>') + '</div><div class="card pad"><h3>Layanan terbanyak</h3>' + (sl.length ? sl.map(function (n) { return '<div class="sum"><span>' + esc(n) + "</span><span>" + sv[n] + "</span></div>"; }).join("") : '<div class="note">Belum ada.</div>') + "</div></div>";
}
function aSet() {
  return '<div class="card pad" style="max-width:520px"><h3>Pengaturan klinik</h3><div class="stack"><label class="f">Nama klinik<input class="inp" id="st-n" maxlength="40" value="' + esc(db.shop.name) + '"></label><label class="f">PIN panel (4 angka)<input class="inp" id="st-p" inputmode="numeric" maxlength="4" value="' + esc(db.shop.pin) + '"></label><p class="err" id="st-e" role="alert"></p><button class="btn" data-a="stsave">Simpan</button></div></div><div class="card pad" style="max-width:520px;margin-top:12px"><h3>Data demo</h3><p class="note">Mengembalikan semua data (hewan, janji, pesanan, stok) ke contoh awal.</p><button class="btn d" data-a="reset">Reset data demo</button></div>';
}

/* ---------- router ---------- */
function parseHash() { var h = location.hash.replace(/^#\/?/, ""), q = {}, i = h.indexOf("?"); if (i >= 0) { h.slice(i + 1).split("&").forEach(function (kv) { var p = kv.split("="); q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); }); h = h.slice(0, i); } return { r: h, q: q }; }
var lastR = null;
function route(fresh) {
  var x = parseHash(), r = x.r || "";
  if (["", "toko", "layanan", "booking", "akun", "lacak", "admin"].indexOf(r) < 0) r = "";
  if (r === "booking" && (!ui.bk || fresh || (lastR !== "booking" && ui.bk.done))) bkInit(x.q);
  var v = { "": vHome, toko: vShop, layanan: vLayanan, booking: vBooking, akun: vAkun, lacak: function () { return vLacak(x.q); }, admin: vAdmin }[r]();
  $("app").innerHTML = r === "" ? v : '<div class="wrap">' + v + "</div>"; chrome(); markNav(r === "admin" ? "-" : r);
  document.title = ({ "": "Beranda", toko: "Toko", layanan: "Layanan", booking: "Booking", akun: "Akun", lacak: "Lacak pesanan", admin: "Panel klinik" }[r]) + " | " + db.shop.name;
  if (lastR !== r || fresh) window.scrollTo(0, 0);
  lastR = r;
}

/* ---------- events ---------- */
function setStatus(o, s) { o.status = s; o.log.push({ s: s, d: today(), t: nowStr() }); }
document.addEventListener("click", function (ev) {
  var el = ev.target.closest("[data-a]"); if (!el) return;
  var a = el.dataset.a, id = el.dataset.id, v = el.dataset.v, x;
  if (a === "close") { closeSheet(); return; }
  if (a.indexOf("f-") === 0) { ui[a.slice(2)] = v; route(); return; }
  switch (a) {
    case "shopsp": ui.sq = ""; ui.scat = ""; ui.sbr = ""; ui.spr = ""; ui.ssp = v; if (location.hash === "#/toko") route(); break;
    case "fclear": ui.sq = ""; ui.ssp = ""; ui.scat = ""; ui.sbr = ""; ui.spr = ""; ui.sort = "nama"; route(); break;
    case "pdet": x = by(db.products, id); openSheet(sheetHead(x.name) + '<div class="pc card" style="margin-bottom:12px"><div class="im" style="aspect-ratio:4/3">' + oneImg(x.img, x.name, 600, 450) + '</div></div><p>' + esc(x.desc) + '</p><div class="meta"><span class="tag n">' + esc(x.brand) + '</span><span class="tag n">' + esc(x.sp === "semua" ? "Semua hewan" : x.sp) + "</span>" + stockTag(x.stock, x.min) + '</div><div class="sum t"><span>Harga</span><span>' + rp(x.price) + '</span></div><button class="btn w" data-a="padd" data-id="' + x.id + '"' + (x.stock <= 0 ? " disabled" : "") + ">" + (x.stock <= 0 ? "Stok habis" : "Tambah ke keranjang") + "</button>"); break;
    case "padd": if (addCart(id, 1)) { toast("Masuk keranjang"); if ($("ov").classList.contains("on") && $("shc").querySelector("h3")) { } } break;
    case "cart": cartSheet(); break;
    case "cplus": if (addCart(id, 1)) cartSheet(); break;
    case "cminus": addCart(id, -1); cartSheet(); break;
    case "cclear": db.cart = []; save(); cartBadge(); cartSheet(); break;
    case "checkout": co = { method: "antar", pay: "transfer" }; checkoutSheet(); break;
    case "placeorder": placeOrder(); break;
    case "lacak": lacak(); break;
    case "authm": ui.auth = v; route(); break;
    case "auth": doAuth(); break;
    case "fill": $("au-p").value = "0812-0000-1001"; $("au-pin").value = "1234"; break;
    case "logout": db.session = ""; ui.bk = null; save(); chrome(); route(); toast("Anda sudah keluar"); break;
    case "atab": ui.atab = v; route(); break;
    case "apet": ui.apet = id; route(); break;
    case "petnew": openSheet(petForm()); break;
    case "petedit": openSheet(petForm(by(db.pets, id))); break;
    case "petsave": savePet(id); break;
    case "petbook": ui.bk = null; location.hash = "#/booking"; ui.bk = { pet: id, svc: "", staff: "", date: "", time: "", note: "", done: null }; route(); break;
    case "petbuku": ui.atab = "buku"; ui.apet = id; route(); break;
    case "petdel":
      if (db.appts.some(function (q) { return q.pet === id && (q.status === "dijadwalkan" || q.status === "hadir" || q.status === "diperiksa"); })) { toast("Batalkan janji yang aktif dulu", true); break; }
      if (twice(el)) { db.pets = db.pets.filter(function (q) { return q.id !== id; }); db.vaccines = db.vaccines.filter(function (q) { return q.pet !== id; }); db.records = db.records.filter(function (q) { return q.pet !== id; }); save(); route(); toast("Hewan dihapus"); }
      break;
    case "bukuprint": x = by(db.pets, id); printHTML("<h2>" + esc(db.shop.name) + "</h2>" + healthBook(x, true)); break;
    case "gojanji": ui.atab = "janji"; break;
    case "gopets": ui.atab = "hewan"; break;
    case "bknew": ui.bk = null; bkInit({}); route(); break;
    case "bkpet": ui.bk.pet = id; route(); break;
    case "bksvc": ui.bk.svc = id; ui.bk.time = ""; route(); break;
    case "bkdate": ui.bk.date = v; ui.bk.time = ""; route(); break;
    case "bktime": ui.bk.time = v; route(); break;
    case "bkgo": bookAppt(); break;
    case "acancel": if (twice(el)) { x = by(db.appts, id); x.status = "batal"; save(); route(); toast("Janji dibatalkan"); } break;
    case "adlogin": if ($("ad-pin").value === db.shop.pin) { try { sessionStorage.setItem("ps.admin", "1"); } catch (e) { } route(); } else $("ad-e").textContent = "PIN salah."; break;
    case "adfill": $("ad-pin").value = db.shop.pin; break;
    case "adlogout": try { sessionStorage.removeItem("ps.admin"); } catch (e) { } route(); break;
    case "adtab": ui.aTab = v; route(); break;
    case "qday": ui.qDate = v === "0" ? today() : addD(ui.qDate, +v); route(); break;
    case "qst": x = by(db.appts, id); x.status = v; save(); route(); toast("Status diperbarui"); break;
    case "qcancel": if (twice(el)) { by(db.appts, id).status = "batal"; save(); route(); toast("Janji dibatalkan"); } break;
    case "recform": openSheet(recForm(by(db.appts, id))); break;
    case "recsave": saveRec(id); break;
    case "recview": openSheet(recView(by(db.appts, id))); break;
    case "sday": x = by(db.staff, id); v = +v; if (x.days.indexOf(v) >= 0) { if (x.days.length === 1) { toast("Minimal satu hari praktik", true); break; } x.days = x.days.filter(function (d) { return d !== v; }); } else x.days.push(v); save(); route(); break;
    case "offadd": x = by(db.staff, id); var od = $("off-" + id).value; if (!od || od < today()) { toast("Pilih tanggal libur mulai hari ini", true); break; } if (x.off.indexOf(od) >= 0) { toast("Tanggal itu sudah libur", true); break; } x.off.push(od); x.off.sort(); save(); route(); toast("Libur ditambahkan"); break;
    case "offdel": x = by(db.staff, id); x.off = x.off.filter(function (d) { return d !== v; }); save(); route(); break;
    case "stk": ui.stk = v; route(); break;
    case "pnew": openSheet(prodForm()); break;
    case "pedit": openSheet(prodForm(by(db.products, id))); break;
    case "psave": saveProd(id); break;
    case "pdel": if (twice(el)) { db.products = db.products.filter(function (q) { return q.id !== id; }); db.cart = db.cart.filter(function (q) { return q.id !== id; }); save(); closeSheet(); route(); cartBadge(); toast("Produk dihapus"); } break;
    case "pstk": x = by(db.products, id); if (x.stock + +v < 0) break; x.stock += +v; save(); route(); break;
    case "mstk": x = by(db.meds, id); if (x.stock + +v < 0) break; x.stock += +v; save(); route(); break;
    case "ordf": ui.ordf = v; route(); break;
    case "ordview": x = by(db.orders, id); openSheet(sheetHead("Pesanan " + x.code) + orderDetail(x, true) + '<p class="note">Telepon ' + esc(fmtPhone(x.phone)) + (x.note ? ". Catatan: " + esc(x.note) : "") + '</p><div class="row"><a class="btn s" target="_blank" rel="noopener" href="' + waLink(x.phone, "Halo " + x.name + ", pesanan " + x.code + " dari " + db.shop.name + " berstatus " + ordLabel(x) + ".") + '">WhatsApp</a><button class="btn s o" data-a="ordprint" data-id="' + x.id + '">Cetak</button></div>'); break;
    case "ordprint": x = by(db.orders, id); printHTML("<h2>" + esc(db.shop.name) + "</h2>" + orderDetail(x, false)); break;
    case "ordnext": x = by(db.orders, id); setStatus(x, { baru: "diproses", diproses: "dikirim", dikirim: "selesai" }[x.status]); save(); route(); toast("Pesanan " + x.code + ": " + ordLabel(x)); break;
    case "ordcancel": if (twice(el)) { x = by(db.orders, id); x.items.forEach(function (it) { var p = by(db.products, it.id); if (p) p.stock += it.q; }); setStatus(x, "batal"); save(); route(); toast("Pesanan dibatalkan, stok dikembalikan"); } break;
    case "remf": ui.remF = ui.remF ? "" : "1"; route(); break;
    case "remmark": x = by(db.vaccines, id); x.contacted = !x.contacted; save(); route(); break;
    case "remwa": x = by(db.vaccines, id); x.contacted = true; save(); setTimeout(route, 50); break;
    case "csvrem": csv("pengingat-vaksin.csv", [["Hewan", "Pemilik", "Telepon", "Vaksin", "Jatuh tempo", "Selisih hari", "Sudah dihubungi"]].concat(remList().map(function (q) { var p = by(db.pets, q.pet), o = by(db.owners, p.owner); return [p.name, o ? o.name : "", o ? o.phone : "", q.name, q.due, diff(q.due, today()), q.contacted ? "ya" : "tidak"]; }))); break;
    case "csvord": csv("pesanan.csv", [["Kode", "Tanggal", "Nama", "Telepon", "Metode", "Barang", "Total", "Status"]].concat(filteredOrders().map(function (o) { return [o.code, o.date, o.name, o.phone, o.method, o.items.map(function (i) { return i.q + "x " + i.n; }).join("; "), o.total, o.status]; }))); break;
    case "csvstok": csv("stok.csv", [["Produk", "Merek", "Kategori", "Harga", "Stok"]].concat(db.products.map(function (p) { return [p.name, p.brand, p.cat, p.price, p.stock]; }))); break;
    case "csvvisit": csv("kunjungan.csv", [["Tanggal", "Jam", "Hewan", "Pemilik", "Layanan", "Petugas", "Status", "Biaya"]].concat(db.appts.slice().sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; }).map(function (q) { var p = by(db.pets, q.pet), o = by(db.owners, q.owner); return [q.date, q.time, p ? p.name : "", o ? o.name : "", q.sn, staffName(q.staff), q.status, q.price]; }))); break;
    case "repprint": printHTML("<h2>" + esc(db.shop.name) + ": laporan " + ui.rep + " hari</h2>" + aReport()); break;
    case "stsave":
      x = $("st-n").value.trim(); var pn = $("st-p").value.trim();
      if (x.length < 3) { $("st-e").textContent = "Isi nama klinik."; break; }
      if (!/^\d{4}$/.test(pn)) { $("st-e").textContent = "PIN harus 4 angka."; break; }
      db.shop.name = x; db.shop.pin = pn; save(); chrome(); route(); toast("Pengaturan disimpan"); break;
    case "reset": if (twice(el)) { localStorage.removeItem(KEY); db = seed(); save(); ui.bk = null; chrome(); location.hash = "#/admin"; route(true); toast("Data demo dikembalikan"); } break;
  }
});
document.addEventListener("input", function (ev) {
  var t = ev.target;
  if (t.id === "sq") { ui.sq = t.value; $("shopgrid").innerHTML = shopGrid(); }
  if (t.id === "bk-note") ui.bk.note = t.value;
});
document.addEventListener("change", function (ev) {
  var t = ev.target, x;
  if (t.id === "sbr") { ui.sbr = t.value; $("shopgrid").innerHTML = shopGrid(); }
  if (t.id === "spr") { ui.spr = t.value; $("shopgrid").innerHTML = shopGrid(); }
  if (t.id === "sort") { ui.sort = t.value; $("shopgrid").innerHTML = shopGrid(); }
  if (t.id === "bk-st") { ui.bk.staff = t.value; ui.bk.time = ""; route(); }
  if (t.id === "rem-d") { ui.remDays = +t.value; route(); }
  if (t.id === "rep-n") { ui.rep = +t.value; route(); }
  if (t.id === "co-m") { co.method = t.value; co.pay = t.value === "ambil" ? "toko" : "transfer"; checkoutKeep(); }
  if (t.id === "co-y") co.pay = t.value;
  if (t.dataset.in === "sstart" || t.dataset.in === "send") {
    x = by(db.staff, t.dataset.id);
    var s = t.dataset.in === "sstart" ? t.value : x.start, e = t.dataset.in === "send" ? t.value : x.end;
    if (!t.value || tmin(e) - tmin(s) < 60) { toast("Jam selesai harus minimal 1 jam setelah mulai", true); route(); return; }
    x.start = s; x.end = e; save(); toast("Jam praktik diperbarui");
  }
});
function checkoutKeep() { var n = $("co-n").value, p = $("co-p").value; checkoutSheet(); $("co-n").value = n; $("co-p").value = p; }
document.addEventListener("keydown", function (ev) {
  if (ev.key === "Escape" && $("ov").classList.contains("on")) closeSheet();
  if (ev.key === "Enter" && ev.target.tagName === "INPUT" && !ev.isComposing) {
    var id = ev.target.id;
    if (id === "au-p" || id === "au-pin" || id === "au-n") doAuth();
    if (id === "ad-pin") $("ad-pin").closest(".pin").querySelector("[data-a=adlogin]").click();
    if (id === "lk-c" || id === "lk-p") lacak();
  }
});
$("ov").addEventListener("click", function (ev) { if (ev.target === $("ov")) closeSheet(); });
window.addEventListener("hashchange", function () { var x = parseHash(); if (x.r === "booking") { if (x.q.svc) bkInit(x.q); } route(); });
window.addEventListener("error", function (e) { try { console.log("JSERR " + e.message); } catch (x) { } });
db = load(); save(); chrome();
(function () { var x = parseHash(); if (x.r === "booking") bkInit(x.q); route(true); })();
