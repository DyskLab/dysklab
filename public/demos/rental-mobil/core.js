/* Laju Rental: data, harga, ketersediaan. Contoh fiktif, data di localStorage. */
"use strict";
const KEY = "rental-mobil.v1", SKEY = "rental-mobil.s";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rp = n => (n < 0 ? "-Rp " : "Rp ") + Math.abs(Math.round(n)).toLocaleString("id-ID");
const H = 36e5, DAY = 864e5;
const DN = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"], MN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const p2 = n => String(n).padStart(2, "0");
const ymd = ms => { const d = new Date(ms); return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); };
const hm = ms => { const d = new Date(ms); return p2(d.getHours()) + ":" + p2(d.getMinutes()); };
const fD = ms => { const d = new Date(ms); return DN[d.getDay()] + ", " + d.getDate() + " " + MN[d.getMonth()] + " " + d.getFullYear(); };
const fS = ms => { const d = new Date(ms); return DN[d.getDay()] + ", " + d.getDate() + " " + MN[d.getMonth()]; };
const fDT = ms => fD(ms) + " " + hm(ms);
const fST = ms => fS(ms) + " " + hm(ms);
const toMs = (d, t) => { const a = d.split("-").map(Number), b = (t || "00:00").split(":").map(Number); return new Date(a[0], a[1] - 1, a[2], b[0], b[1]).getTime(); };
const sod = ms => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
const addDays = (ms, n) => { const d = new Date(ms); d.setDate(d.getDate() + n); return d.getTime(); };
const durTxt = h => { const d = Math.floor(h / 24), r = h - d * 24; return (d ? d + " hari" : "") + (d && r ? " " : "") + (r || !d ? r + " jam" : ""); };
const roundUp30 = ms => Math.ceil(ms / 18e5) * 18e5;
const FUEL = ["Kosong", "1/8", "2/8", "3/8", "4/8", "5/8", "6/8", "7/8", "Penuh"];
const TYPES = { city: "City car", mpv: "MPV", suv: "SUV", premium: "Premium" };
const STATUS = { dipesan: "Dipesan", diambil: "Diambil", berjalan: "Berjalan", dikembalikan: "Dikembalikan", selesai: "Selesai", batal: "Batal" };
const ACTIVE = ["dipesan", "diambil", "berjalan"];

const DEF = {
  open: 6, close: 22, lead: 2, minHours: 4, maxDays: 30, overPct: 10, graceOut: 2, graceIn: 1, buffer: 2,
  driverDay: 250000, driver12: 150000, depositDriverPct: 50, child: 30000, deliver: 50000, fuel8: 20000,
  disc3: 5, disc7: 10, disc14: 15, cancelFree: 48, cancelPart: 24, cancelPct: 25, changeMin: 24
};

const CARS = [
  { id: "c1", name: "Toyota Agya 1.2 G", type: "city", trans: "AT", seats: 5, bags: 1, fuel: "Bensin", year: 2019, plate: "B 1101 RM", p24: 300000, p12: 200000, dep: 500000, drv: "opt", odo: 48210, img: "img/agya.jpg", alt: "Toyota Agya putih tampak depan", about: "Hatchback irit untuk dalam kota. Parkir mudah, cocok untuk 1 sampai 4 orang." , spec: ["Mesin 1.2 L, transmisi otomatis", "Tangki ±33 L, konsumsi ±17 km/L", "AC, audio Bluetooth, kamera mundur", "Bagasi muat 1 koper sedang"] },
  { id: "c2", name: "Honda Brio Satya", type: "city", trans: "MT", seats: 5, bags: 1, fuel: "Bensin", year: 2020, plate: "B 1102 RM", p24: 330000, p12: 220000, dep: 500000, drv: "opt", odo: 39870, img: "img/brio.jpg", alt: "Honda Brio putih tampak depan samping", about: "Hatchback lincah dengan transmisi manual. Pilihan hemat untuk perjalanan singkat.", spec: ["Mesin 1.2 L, transmisi manual 5 percepatan", "Tangki ±35 L, konsumsi ±17 km/L", "AC, audio, power window", "Bagasi muat 1 koper sedang"] },
  { id: "c3", name: "Toyota Avanza 1.5 G", type: "mpv", trans: "AT", seats: 7, bags: 2, fuel: "Bensin", year: 2022, plate: "B 1103 RM", p24: 450000, p12: 300000, dep: 1000000, drv: "opt", odo: 27640, img: "img/avanza.jpg", alt: "Toyota Avanza abu-abu perak tampak depan", about: "MPV keluarga paling sering disewa. Baris ketiga bisa dilipat untuk menambah bagasi.", spec: ["Mesin 1.5 L, transmisi otomatis", "Tangki ±43 L, konsumsi ±13 km/L", "AC double blower, layar audio, kamera mundur", "Bagasi muat 2 koper sedang jika baris ketiga dilipat"] },
  { id: "c4", name: "Honda Mobilio 1.5 E", type: "mpv", trans: "MT", seats: 7, bags: 2, fuel: "Bensin", year: 2018, plate: "B 1104 RM", p24: 430000, p12: 290000, dep: 1000000, drv: "opt", odo: 61350, img: "img/mobilio.jpg", alt: "Honda Mobilio putih tampak depan samping", about: "MPV 7 penumpang transmisi manual, kabin lega dan harga bersahabat.", spec: ["Mesin 1.5 L, transmisi manual", "Tangki ±42 L, konsumsi ±14 km/L", "AC double blower, audio, power window", "Bagasi muat 2 koper sedang jika baris ketiga dilipat"] },
  { id: "c5", name: "Honda HR-V", type: "suv", trans: "AT", seats: 5, bags: 2, fuel: "Bensin", year: 2021, plate: "B 1105 RM", p24: 650000, p12: 430000, dep: 1500000, drv: "opt", odo: 33120, img: "img/hrv.jpg", alt: "Honda HR-V abu-abu tampak depan samping", about: "SUV kompak yang nyaman untuk keluarga kecil, kota maupun luar kota.", spec: ["Mesin 1.5 L, transmisi otomatis", "Tangki ±40 L, konsumsi ±14 km/L", "AC digital, layar sentuh, kamera mundur", "Bagasi muat 2 koper sedang"] },
  { id: "c6", name: "Toyota Kijang Innova Reborn", type: "mpv", trans: "AT", seats: 7, bags: 3, fuel: "Bensin", year: 2021, plate: "B 1106 RM", p24: 750000, p12: 500000, dep: 1500000, drv: "opt", odo: 54980, img: "img/innova.jpg", alt: "Toyota Kijang Innova hitam tampak depan samping", about: "MPV besar yang nyaman untuk perjalanan jauh dengan 6 sampai 7 penumpang.", spec: ["Mesin 2.0 L, transmisi otomatis", "Tangki ±55 L, konsumsi ±11 km/L", "AC double blower, layar audio, kamera mundur", "Bagasi muat 3 koper sedang"] },
  { id: "c7", name: "Toyota Fortuner TRD", type: "suv", trans: "AT", seats: 7, bags: 3, fuel: "Solar", year: 2020, plate: "B 1107 RM", p24: 1300000, p12: 850000, dep: 3000000, drv: "opt", odo: 42760, img: "img/fortuner.jpg", alt: "Toyota Fortuner TRD putih tampak depan", about: "SUV bertenaga untuk jalan berkelok dan tanjakan. Muat 7 orang.", spec: ["Mesin diesel 2.4 L, transmisi otomatis", "Tangki ±80 L, konsumsi ±10 km/L, wajib Solar", "AC double blower, layar audio, kamera mundur", "Bagasi muat 3 koper sedang"] },
  { id: "c8", name: "Toyota Alphard", type: "premium", trans: "AT", seats: 7, bags: 3, fuel: "Bensin", year: 2020, plate: "B 1108 RM", p24: 2400000, p12: 1500000, dep: 5000000, drv: "only", odo: 29400, img: "img/alphard.jpg", alt: "Toyota Alphard putih tampak depan samping", about: "Van premium untuk tamu atau acara penting. Hanya tersedia dengan sopir.", spec: ["Mesin 2.5 L, transmisi otomatis", "Tangki ±75 L, konsumsi ±9 km/L", "Kursi captain, pintu geser elektrik, AC tiga zona", "Bagasi muat 3 koper sedang"] }
];
const CAR_IMGS = [["img/agya.jpg", "Agya"], ["img/brio.jpg", "Brio"], ["img/avanza.jpg", "Avanza"], ["img/mobilio.jpg", "Mobilio"], ["img/hrv.jpg", "HR-V"], ["img/innova.jpg", "Innova"], ["img/fortuner.jpg", "Fortuner"], ["img/alphard.jpg", "Alphard"]];

let DB = null;
const S = () => DB.settings;
const carOf = b => DB.cars.find(c => c.id === (b.carId || b)) || null;
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
function genCode(rnd) {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c;
  do { c = "LR-"; for (let i = 0; i < 6; i++) c += A[Math.floor((rnd || Math.random)() * A.length)]; } while (DB.bookings.some(b => b.id === c));
  return c;
}

/* ---------- harga ---------- */
const overRate = p24 => Math.round(p24 * S().overPct / 100 / 1000) * 1000;
function charge(p24, p12, h) {
  const over = overRate(p24);
  if (h <= 12) return { amt: p12, days: 0, pkg: true, xh: 0, xamt: 0 };
  const days = Math.floor(h / 24), r = h - days * 24;
  if (!days) { const x = Math.min((h - 12) * over, p24 - p12); return { amt: p12 + x, days: 0, pkg: true, xh: h - 12, xamt: x }; }
  if (r <= S().graceOut) return { amt: days * p24, days, xh: 0, xamt: 0, free: r };
  const x = Math.min(r * over, p24);
  return { amt: days * p24 + x, days, xh: r, xamt: x };
}
function quote(car, s, e, o) {
  o = o || {};
  const h = Math.max(1, Math.ceil((e - s) / H)), st = S();
  const drv = car.drv === "only" || !!o.drv;
  const c = charge(car.p24, car.p12, h), lines = [];
  lines.push({ l: c.pkg && h <= 12 ? "Sewa paket 12 jam" : "Sewa " + c.days + " hari" + (c.pkg ? " (paket 12 jam + kelebihan)" : ""), a: c.pkg && h > 12 ? c.amt - c.xamt : c.days * car.p24 });
  if (c.xamt) lines.push({ l: "Kelebihan " + c.xh + " jam" + (c.pkg ? "" : " (maks. 1 hari)"), a: c.xamt });
  else if (c.free) lines.push({ l: "Toleransi " + c.free + " jam", a: 0 });
  const pct = c.days >= 14 ? st.disc14 : c.days >= 7 ? st.disc7 : c.days >= 3 ? st.disc3 : 0;
  const disc = Math.round(c.amt * pct / 100);
  if (disc) lines.push({ l: "Diskon durasi " + pct + "% (sewa " + c.days + " hari)", a: -disc });
  let total = c.amt - disc, driverAmt = 0;
  if (drv) { const d = charge(st.driverDay, st.driver12, h); driverAmt = d.amt; lines.push({ l: "Sopir " + (d.pkg && h <= 12 ? "12 jam" : durTxt(h)), a: d.amt }); total += d.amt; }
  const child = Math.max(0, Math.min(2, o.child | 0));
  if (child) { const a = child * st.child * Math.max(1, Math.ceil(h / 24)); lines.push({ l: "Kursi anak x" + child, a }); total += a; }
  if (o.deliver) { lines.push({ l: "Antar mobil ke alamat", a: st.deliver }); total += st.deliver; }
  if (o.pickup) { lines.push({ l: "Jemput mobil di alamat", a: st.deliver }); total += st.deliver; }
  const dep = drv ? Math.round(car.dep * st.depositDriverPct / 100 / 50000) * 50000 : car.dep;
  return { h, days: c.days, drv, pct, disc, base: c.amt, driverAmt, lines, total, dep };
}
function checkRange(s, e) {
  const st = S(), now = Date.now();
  if (!isFinite(s) || !isFinite(e)) return "Isi tanggal dan jam ambil dan kembali.";
  const hs = new Date(s).getHours() + new Date(s).getMinutes() / 60, he = new Date(e).getHours() + new Date(e).getMinutes() / 60;
  if (e <= s) return "Waktu kembali harus setelah waktu ambil.";
  if (s < now + st.lead * H) return "Waktu ambil minimal " + st.lead + " jam dari sekarang.";
  if (hs < st.open || hs > st.close || he < st.open || he > st.close) return "Jam ambil dan kembali hanya antara " + p2(st.open) + ":00 dan " + p2(st.close) + ":00.";
  if ((e - s) < st.minHours * H) return "Durasi sewa minimal " + st.minHours + " jam.";
  if ((e - s) > st.maxDays * DAY) return "Durasi sewa maksimal " + st.maxDays + " hari. Untuk sewa lebih lama, hubungi kantor.";
  return null;
}

/* ---------- ketersediaan ---------- */
function blocks(carId, ignoreId) {
  const now = Date.now(), st = S(), out = [];
  DB.bookings.forEach(b => {
    if (b.carId !== carId || b.id === ignoreId || !ACTIVE.includes(b.status)) return;
    out.push({ s: b.start, e: (b.status === "dipesan" ? b.end : Math.max(b.end, now)) + st.buffer * H, type: "b", id: b.id });
  });
  DB.maint.forEach(m => { if (m.carId === carId) out.push({ s: m.start, e: m.end, type: "m", id: m.id }); });
  return out.sort((a, b) => a.s - b.s);
}
function conflict(carId, s, e, ignoreId) {
  const buf = S().buffer * H;
  return blocks(carId, ignoreId).find(k => s < k.e && e + (k.type === "b" ? buf : 0) > k.s) || null;
}
function carFree(car, s, e, ignoreId) { return car.active !== false && !conflict(car.id, s, e, ignoreId); }
function nextFree(car, s, e) {
  const dur = e - s; let t = s;
  for (let i = 0; i < 40; i++) { const k = conflict(car.id, t, t + dur); if (!k) return t; t = roundUp30(k.e); }
  return null;
}
function carState(car, now) {
  now = now || Date.now();
  if (car.active === false) return { k: "off", t: "Nonaktif" };
  if (DB.maint.some(m => m.carId === car.id && m.start <= now && now < m.end)) return { k: "maint", t: "Perawatan" };
  if (DB.bookings.some(b => b.carId === car.id && ["diambil", "berjalan"].includes(b.status) && b.start <= now)) return { k: "rent", t: "Disewa" };
  return { k: "free", t: "Siap" };
}

/* ---------- aturan ubah dan batal ---------- */
function cancelInfo(b, at) {
  at = at || Date.now(); const st = S(), hrs = (b.start - at) / H;
  if (b.status !== "dipesan") return { ok: false, why: "Booking dengan status " + STATUS[b.status].toLowerCase() + " tidak bisa dibatalkan." };
  if (hrs >= st.cancelFree) return { ok: true, fee: 0, label: "Gratis, lebih dari " + st.cancelFree + " jam sebelum jam ambil" };
  if (hrs >= st.cancelPart) return { ok: true, fee: Math.round(b.q.total * st.cancelPct / 100), label: "Biaya " + st.cancelPct + "% dari total, antara " + st.cancelPart + " dan " + st.cancelFree + " jam sebelum jam ambil" };
  return { ok: false, why: "Kurang dari " + st.cancelPart + " jam sebelum jam ambil: tidak bisa dibatalkan lewat situs. Hubungi kantor rental." };
}
function changeInfo(b, at) {
  at = at || Date.now();
  if (b.status !== "dipesan") return { ok: false, why: "Hanya booking berstatus dipesan yang bisa diubah." };
  if ((b.start - at) / H < S().changeMin) return { ok: false, why: "Jadwal hanya bisa diubah lebih dari " + S().changeMin + " jam sebelum jam ambil. Hubungi kantor rental." };
  return { ok: true };
}
function latePen(b, at) {
  const car = carOf(b), lh = Math.ceil((at - b.end) / H);
  if (lh <= S().graceIn) return { h: 0, amt: 0 };
  const d = Math.floor(lh / 24), r = lh - d * 24;
  return { h: lh, amt: d * car.p24 + Math.min(r * overRate(car.p24), car.p24) };
}
const extra = b => b.ret ? (b.ret.penalty || 0) + (b.ret.fuelFee || 0) + (b.ret.damageFee || 0) : 0;
const revenue = b => b.status === "batal" ? (b.cancel ? b.cancel.fee : 0) : (["dikembalikan", "selesai"].includes(b.status) ? b.q.total + extra(b) : 0);
const revAt = b => b.status === "batal" ? (b.cancel ? b.cancel.at : b.start) : (b.ret ? b.ret.at : b.end);

/* ---------- simpan, muat, status otomatis ---------- */
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* penyimpanan penuh */ } }
function load() {
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (r && r.v === 1 && Array.isArray(r.cars)) { DB = r; DB.settings = Object.assign({}, DEF, DB.settings); } } catch (e) { DB = null; }
  if (!DB) { seed(); save(); }
  sync();
}
function sync() {
  const now = Date.now(); let ch = false;
  DB.bookings.forEach(b => { if (b.status === "diambil" && b.start <= now) { b.status = "berjalan"; b.hist.push({ t: now, s: "berjalan", n: "Waktu sewa dimulai" }); ch = true; } });
  if (ch) save();
}
function resetDemo() { localStorage.removeItem(KEY); sessionStorage.removeItem(SKEY); DB = null; load(); }

const CUST = [["Rahmat Hidayat", "Bekasi"], ["Sari Wulandari", "Depok"], ["Budi Santoso", "Bogor"], ["Dewi Lestari", "Tangerang"], ["Andi Pratama", "Jakarta Selatan"], ["Maya Kusuma", "Jakarta Timur"], ["Heru Setiawan", "Bandung"], ["Lina Marlina", "Jakarta Barat"], ["Yusuf Maulana", "Cibubur"], ["Rina Anggraini", "Bintaro"], ["Doni Firmansyah", "Cikarang"], ["Putri Ayu Lestari", "Jakarta Utara"], ["Agus Salim", "Sentul"], ["Nurul Hidayah", "Serpong"], ["Fajar Nugroho", "Jakarta Pusat"], ["Tika Permata", "Karawang"]];
function seed() {
  const now = Date.now(), today = sod(now), rnd = mulberry(+ymd(now).replace(/-/g, ""));
  DB = { v: 1, cars: CARS.map(c => Object.assign({ active: true }, c)), bookings: [], maint: [], settings: Object.assign({}, DEF), seq: 1 };
  const odo0 = {}; DB.cars.forEach(c => { odo0[c.id] = c.odo - 4000; });
  let ci = 0;
  function add(carId, s, e, st, o) {
    o = o || {}; const car = DB.cars.find(c => c.id === carId), k = CUST[(ci++ + Math.floor(rnd() * 3)) % CUST.length];
    const idx = CUST.indexOf(k), q = quote(car, s, e, o);
    const created = Math.min(s - 2 * H, s - Math.floor(1 + rnd() * 9) * DAY);
    const b = {
      id: genCode(rnd), carId, name: k[0], phone: "0812-0000-" + p2(10 + idx) + p2(Math.floor(rnd() * 100)), email: "", nik: "32" + String(1000000000000 + idx * 7919).padStart(14, "0"),
      simNo: String(120000000000 + idx * 104729 + Math.floor(rnd() * 999)), simExp: ymd(addDays(today, 400 + Math.floor(rnd() * 900))), addr: "Jl. Contoh No. " + (idx + 3) + ", " + k[1],
      note: "", start: s, end: e, drv: q.drv, child: o.child || 0, deliver: !!o.deliver, pickup: !!o.pickup, addrD: o.deliver ? "Jl. Contoh No. " + (idx + 3) + ", " + k[1] : "", addrP: o.pickup ? "Jl. Contoh No. " + (idx + 3) + ", " + k[1] : "",
      q, status: st, createdAt: created, hist: [{ t: created, s: "dipesan", n: "Booking dibuat" }], out: null, ret: null, cancel: null, settle: null, _o: o
    };
    DB.bookings.push(b); return b;
  }
  const seedClash = (cid, s, e) => {
    const buf = S().buffer * H;
    for (const b of DB.bookings) { if (b.carId !== cid || b.status === "batal") continue; const be = (b.status === "berjalan" || b.status === "diambil" ? Math.max(b.end, now) : b.end) + buf; if (s < be && e + buf > b.start) return be; }
    for (const m of DB.maint) if (m.carId === cid && s < m.end && e + buf > m.start) return m.end;
    return 0;
  };
  // skenario tetap, relatif terhadap waktu sekarang
  const a30 = ms => Math.floor(ms / 18e5) * 18e5;
  DB.maint.push({ id: "m1", carId: "c2", start: toMs(ymd(addDays(today, 2)), "08:00"), end: toMs(ymd(addDays(today, 3)), "17:00"), kind: "Servis berkala", note: "Servis 40.000 km, ganti oli dan filter", cost: 1250000 });
  DB.maint.push({ id: "m2", carId: "c8", start: toMs(ymd(addDays(today, 7)), "09:00"), end: toMs(ymd(addDays(today, 7)), "16:00"), kind: "Ganti ban", note: "Ganti empat ban", cost: 0 });
  DB.maint.push({ id: "m3", carId: "c4", start: toMs(ymd(addDays(today, -12)), "08:00"), end: toMs(ymd(addDays(today, -11)), "15:00"), kind: "Servis berkala", note: "Servis 60.000 km", cost: 1850000 });
  const sp = [];
  sp.push(add("c3", a30(now - 51 * H), a30(now - 3 * H), "berjalan", { child: 1 }));              // terlambat
  sp.push(add("c4", a30(now - 29 * H), a30(now - 5 * H), "dikembalikan"));                         // menunggu diselesaikan
  sp.push(add("c6", a30(now - 30 * H), a30(now + 42 * H), "berjalan", { deliver: true, drv: true }));
  sp.push(add("c5", a30(now - 8 * H), a30(now + 16 * H), "berjalan"));
  sp.push(add("c7", a30(now + 14 * H), a30(now + 86 * H), "diambil", { drv: true }));
  sp.push(add("c1", a30(now + 3 * H), a30(now + 51 * H), "dipesan", { child: 1 }));
  sp[0]._late = 3; sp[1]._late = 0; sp[1]._damage = [350000, "Baret halus di bumper belakang"];
  // isi sisanya
  DB.cars.forEach((car, i) => {
    let cur = today - (26 - i) * DAY;
    for (let n = 0; n < 40 && cur < today + 13 * DAY; n++) {
      const day = sod(cur + Math.floor(rnd() * 6) * H + 6 * H + (cur > now ? Math.floor(rnd() * 90) * H : 0));
      const short = rnd() < 0.28, sh = (short ? 7 : 7 + Math.floor(rnd() * 8)) + (rnd() < .5 ? 0 : .5);
      const s = day + sh * H, days = short ? 0 : 1 + Math.floor(rnd() * rnd() * 6), e = short ? s + 12 * H : s + days * DAY;
      cur = Math.max(cur + 5 * H, s - 12 * H);
      if (s < now - 25 * DAY) continue;
      const k = seedClash(car.id, s, e);
      if (k) { cur = Math.max(cur, k); continue; }
      const past = e < now - 6 * H, st = past ? (rnd() < 0.07 ? "batal" : "selesai") : (s <= now ? "berjalan" : "dipesan");
      if (!past && s <= now) { cur = e; continue; }
      if (past && st === "batal") { const b = add(car.id, s, e, "batal", {}); b.cancel = { at: s - 3 * DAY, fee: 0, why: "Rencana berubah" }; b.hist.push({ t: s - 3 * DAY, s: "batal", n: "Dibatalkan pelanggan, tanpa biaya" }); cur = e; continue; }
      add(car.id, s, e, st, { child: rnd() < 0.15 ? 1 : 0, deliver: rnd() < 0.12, pickup: rnd() < 0.08, drv: rnd() < 0.25 });
      cur = e + (s > now ? 30 + Math.floor(rnd() * 70) : 4 + Math.floor(rnd() * 30)) * H;
    }
  });
  // serah terima: isi data odometer dan pengembalian
  const cur = {}; DB.cars.forEach(c => { cur[c.id] = odo0[c.id]; });
  DB.bookings.slice().sort((a, b) => a.start - b.start).forEach(b => {
    delete b._o;
    if (!["diambil", "berjalan", "dikembalikan", "selesai"].includes(b.status)) return;
    const car = carOf(b), days = Math.max(1, Math.ceil((b.end - b.start) / DAY)), km = days * (70 + Math.floor(rnd() * 130));
    const outAt = b.status === "diambil" ? b.start - 9 * H : b.start + Math.floor(rnd() * 3) * 600000;
    b.out = { at: outAt, odo: cur[car.id], fuel: 8, note: "Kondisi baik. Baret lama di pintu kanan sudah tercatat." , by: "Admin" };
    b.paid = b.q.total; b.depPaid = true;
    b.hist.push({ t: outAt, s: b.status === "diambil" ? "diambil" : "berjalan", n: "Unit diserahkan, deposit " + rp(b.q.dep) + " diterima" });
    if (b.status === "diambil" || b.status === "berjalan") return;
    const late = b._late != null ? b._late : (rnd() < 0.1 ? 2 + Math.floor(rnd() * 3) : 0), at = b.end + late * H - Math.floor(rnd() * 20) * 60000 * (late ? 0 : 1);
    const fin = 8 - (rnd() < 0.3 ? 1 + Math.floor(rnd() * 2) : 0), dm = b._damage || null;
    cur[car.id] += km;
    b.ret = { at, odo: cur[car.id], fuel: fin, note: dm ? dm[1] : "Kondisi baik, tidak ada kerusakan baru.", penalty: late > S().graceIn ? latePen(b, at).amt : 0, fuelFee: (8 - fin) * S().fuel8, damageFee: dm ? dm[0] : 0, by: "Admin" };
    b.hist.push({ t: at, s: "dikembalikan", n: "Unit dikembalikan" + (b.ret.penalty ? ", terlambat " + late + " jam" : "") });
    if (b.status === "selesai") { const ch = extra(b); b.settle = { at: at + 20 * 60000, refund: Math.max(0, b.q.dep - ch), due: Math.max(0, ch - b.q.dep), method: rnd() < .5 ? "Tunai" : "Transfer" }; b.hist.push({ t: at + 20 * 60000, s: "selesai", n: "Pembayaran selesai, deposit diproses" }); }
  });
  // odometer terkini; unit berjalan memakai odometer keluar
  DB.cars.forEach(c => { c.odo = cur[c.id]; });
  DB.bookings.forEach(b => { delete b._late; delete b._damage; });
  DB.bookings.sort((a, b) => b.start - a.start);
}
