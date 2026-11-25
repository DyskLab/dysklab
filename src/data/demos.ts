/*
  Clickable website demos shown on /demo/. Each demo is a self-contained static site in
  public/demos/<slug>/ (plain HTML, CSS and JS; data lives in the visitor's localStorage),
  with its card image in public/images/demos/<slug>.jpg. Copied from the JasaWeb demos.

  - `kind`: website (public site with an admin panel), system (back office), mobile or
    landing (a one-page landing site; these come from the one-day-one-code repo).
  - `admin`: where the owner panel lives, relative to the demo ("admin.html" or "#/admin").
  - `logins`: credentials shown in the viewer with a copy button.
*/
export type Demo = {
  slug: string;
  kind: "website" | "system" | "mobile" | "landing";
  title: { id: string; en: string };
  text: { id: string; en: string };
  admin?: string;
  logins: { label: { id: string; en: string }; value: string }[];
};

const pin = (value: string, id = "PIN admin", en = "Admin PIN") => ({ label: { id, en }, value });

export const demos: Demo[] = [
  {
    slug: "desa-wanasari", kind: "website", admin: "admin.html",
    title: { id: "Portal Layanan Desa Wanasari", en: "Wanasari Village Service Portal" },
    text: {
      id: "Situs desa dengan pengajuan surat online, cek status tiket, pengaduan, pengumuman, kabar, produk UMKM, dan grafik anggaran. Admin mengelola semuanya.",
      en: "A village site with online letter requests, ticket status, complaints, announcements, news, local products and budget charts. An admin manages it all.",
    },
    logins: [pin("246810")],
  },
  {
    slug: "desa-wisata-tirta-asri", kind: "website", admin: "admin.html",
    title: { id: "Desa Wisata Tirta Asri", en: "Tirta Asri Tourist Village" },
    text: {
      id: "Situs desa wisata dengan kalender kuota, pemesanan paket dan homestay, kode booking, cek dan batal booking, plus admin pengelola.",
      en: "A tourist village site with a quota calendar, package and homestay booking, booking codes, check and cancel, plus a managers' admin.",
    },
    logins: [pin("2468")],
  },
  {
    slug: "kopi-senja", kind: "website", admin: "#/admin",
    title: { id: "Toko Kopi Senja: pesan, promo, lacak", en: "Kopi Senja: order, promos, tracking" },
    text: {
      id: "Toko online kopi yang berfungsi: katalog, keranjang, kode promo, checkout antar atau ambil, dan lacak pesanan. Pemilik mengelola pesanan, produk, dan promo.",
      en: "A working coffee shop: catalogue, cart, promo codes, delivery or pickup checkout and order tracking. The owner manages orders, products and promos.",
    },
    logins: [pin("1234")],
  },
  {
    slug: "klinik-sehat", kind: "system", admin: "#/staf",
    title: { id: "Klinik Sehat Prima: janji temu dan antrian", en: "Sehat Prima Clinic: appointments and queue" },
    text: {
      id: "Pasien memilih layanan, dokter, tanggal, dan jam kosong lalu mendapat kode booking yang bisa dicek, diubah, atau dibatalkan. Staf mengelola antrian, jadwal dokter, libur, pasien, dan ekspor CSV.",
      en: "Patients pick a service, doctor, date and free slot and get a booking code to check, change or cancel. Staff run the queue, doctor schedules, days off, patients and CSV export.",
    },
    logins: [pin("1234", "PIN staf", "Staff PIN")],
  },
  {
    slug: "dashboard-penjualan", kind: "system",
    title: { id: "OmniStat: dashboard penjualan", en: "OmniStat: sales dashboard" },
    text: {
      id: "Dashboard penjualan dengan grafik, pesanan, stok, pelanggan, dan laporan yang berfungsi. Ubah status pesanan dan lihat angka ringkasan ikut berubah.",
      en: "A sales dashboard with working charts, orders, stock, customers and reports. Change an order's status and watch the totals follow.",
    },
    logins: [],
  },
  {
    slug: "kasir-pos", kind: "mobile",
    title: { id: "Kasir Warung: aplikasi kasir di HP", en: "Kasir Warung: a point of sale on the phone" },
    text: {
      id: "Jual dengan diskon dan PPN, stok berkurang otomatis, struk cetak dan WhatsApp, riwayat, laporan, dan kelola menu.",
      en: "Sell with discounts and VAT, stock goes down by itself, printed and WhatsApp receipts, history, reports and menu management.",
    },
    logins: [pin("1234", "PIN masuk", "Sign-in PIN")],
  },
  {
    slug: "ppdb-sekolah", kind: "system", admin: "#/panitia",
    title: { id: "PPDB Online Sekolah", en: "School admissions online" },
    text: {
      id: "Pendaftaran siswa baru dengan formulir bertahap, empat jalur, cek status, dan pengumuman peringkat. Panitia memverifikasi berkas, menghitung skor otomatis, dan menetapkan kelulusan sesuai kuota.",
      en: "New student registration with a step-by-step form, four tracks, status checks and ranked results. The committee verifies documents, scores automatically and admits by quota.",
    },
    logins: [pin("2468", "PIN panitia", "Committee PIN")],
  },
  {
    slug: "invoice-stok", kind: "system",
    title: { id: "Invoice dan stok untuk UMKM", en: "Invoices and stock for small businesses" },
    text: {
      id: "Back office untuk membuat invoice, mencatat pembayaran sebagian, dan memantau stok, dengan dashboard piutang, pembelian ke pemasok, dan laporan CSV.",
      en: "A back office to issue invoices, record partial payments and watch stock, with a receivables dashboard, supplier purchases and CSV reports.",
    },
    logins: [pin("1234", "PIN masuk", "Sign-in PIN")],
  },
  {
    slug: "salon-booking", kind: "website", admin: "#/admin",
    title: { id: "Kala Salon dan Barber", en: "Kala Salon and Barber" },
    text: {
      id: "Website salon dengan booking online 4 langkah. Jam kosong dihitung dari jadwal stylist dan booking yang ada, dengan poin loyalitas dan voucher. Panel pemilik punya kalender per stylist dan laporan.",
      en: "A salon site with 4-step online booking. Free slots come from stylist schedules and existing bookings, with loyalty points and vouchers. The owner panel has a calendar per stylist and reports.",
    },
    logins: [pin("2468")],
  },
  {
    slug: "laundry-kiloan", kind: "mobile",
    title: { id: "Laundry Kiloan: order, nota, lacak", en: "Laundry: orders, receipts, tracking" },
    text: {
      id: "Aplikasi laundry di HP untuk order kiloan dan satuan, nota berkode batang, papan status cucian, kabar lewat WhatsApp, pelunasan, laporan kas, dan halaman lacak untuk pelanggan.",
      en: "A phone app for laundry by weight or by item, barcoded receipts, a status board, WhatsApp updates, payments, cash reports and a tracking page for customers.",
    },
    logins: [pin("1234", "PIN masuk", "Sign-in PIN")],
  },
  {
    slug: "toko-fashion", kind: "website", admin: "#/admin",
    title: { id: "NOLA Studio: toko online pakaian", en: "NOLA Studio: a clothing shop" },
    text: {
      id: "Toko online pakaian dengan filter ukuran, warna, dan harga, varian dengan stok, kode promo, checkout, lacak pesanan, retur, dan panel penjual.",
      en: "A clothing shop with size, colour and price filters, variants with stock, promo codes, checkout, order tracking, returns and a seller panel.",
    },
    logins: [pin("1234")],
  },
  {
    slug: "restoran-reservasi", kind: "website", admin: "#/admin",
    title: { id: "Restoran Sekar Jati: menu, antar, reservasi", en: "Sekar Jati: menu, delivery, reservations" },
    text: {
      id: "Website restoran dengan menu, pesan antar dan ambil, serta reservasi meja berkode. Panel restoran punya papan dapur, denah meja, dan laporan penjualan.",
      en: "A restaurant site with the menu, delivery and pickup orders, and coded table reservations. The panel has a kitchen board, a floor plan and sales reports.",
    },
    logins: [pin("1234")],
  },
  {
    slug: "bengkel-servis", kind: "system", admin: "#/admin",
    title: { id: "Bengkel Roda Sigap: booking dan work order", en: "Roda Sigap Garage: bookings and work orders" },
    text: {
      id: "Booking servis tanpa bentrok jadwal, kode booking, riwayat servis, dan pengingat. Panel bengkel punya papan kerja, work order dengan estimasi dan nota, stok suku cadang, dan laporan.",
      en: "Service bookings with no clashes, booking codes, service history and reminders. The garage panel has a job board, work orders with estimates and invoices, parts stock and reports.",
    },
    logins: [pin("1234")],
  },
  {
    slug: "properti-listing", kind: "website", admin: "#/admin",
    title: { id: "Naungan Properti: listing, KPR, survei", en: "Naungan Properti: listings, mortgages, viewings" },
    text: {
      id: "Cari dan bandingkan rumah, apartemen, ruko, dan tanah, hitung cicilan KPR, lalu jadwalkan survei. Panel agen mengelola listing, lead kanban, dan jadwal survei.",
      en: "Search and compare houses, flats, shophouses and land, work out a mortgage, then book a viewing. The agent panel manages listings, a lead board and viewings.",
    },
    logins: [pin("2468")],
  },
  {
    slug: "kursus-online", kind: "website", admin: "#/admin",
    title: { id: "Kelas Nusa: kursus online", en: "Kelas Nusa: online courses" },
    text: {
      id: "Katalog kursus dengan filter, checkout berkupon, belajar per pelajaran, kuis, dan sertifikat cetak. Panel pengajar untuk kursus, peserta, pesanan, dan kupon.",
      en: "A course catalogue with filters, coupon checkout, lesson-by-lesson learning, quizzes and printable certificates. A teacher panel for courses, students, orders and coupons.",
    },
    logins: [pin("2024"), { label: { id: "Email peserta", en: "Student email" }, value: "demo@contoh.id" }, { label: { id: "Sandi peserta", en: "Student password" }, value: "demo123" }],
  },
  {
    slug: "rental-mobil", kind: "website", admin: "#/admin",
    title: { id: "Laju Rental: sewa mobil", en: "Laju Rental: car hire" },
    text: {
      id: "Cari mobil berdasarkan tanggal dan jam, harga dihitung otomatis, lalu booking, ubah, batal, dan cetak kontrak. Panel rental berisi kalender armada, serah terima, denda, perawatan, dan laporan.",
      en: "Find a car by date and time with the price worked out, then book, change, cancel and print the contract. The panel has a fleet calendar, handovers, fines, maintenance and reports.",
    },
    logins: [pin("2468")],
  },
  {
    slug: "gym-membership", kind: "system", admin: "#/admin",
    title: { id: "Kinetik Fit Center: keanggotaan gym", en: "Kinetik Fit Center: gym membership" },
    text: {
      id: "Paket keanggotaan, jadwal kelas dan daftar tunggu, kartu anggota berkode batang, portal anggota, dan panel gym untuk check-in, kasir, dan pendapatan.",
      en: "Membership plans, a class timetable with waiting lists, barcoded member cards, a member portal, and a gym panel for check-in, the till and revenue.",
    },
    logins: [pin("2468"), { label: { id: "ID anggota", en: "Member ID" }, value: "GYM-0001" }, { label: { id: "HP anggota", en: "Member phone" }, value: "0812-0000-0001" }],
  },
  {
    slug: "event-tiket", kind: "website", admin: "#/admin",
    title: { id: "Panggung Kita: tiket event", en: "Panggung Kita: event tickets" },
    text: {
      id: "Beli tiket konser, seminar, workshop, dan festival dengan pilihan kursi, promo, dan e-tiket QR. Panel penyelenggara mengelola event, penjualan, refund, dan check-in.",
      en: "Buy tickets for concerts, seminars, workshops and festivals with seat picking, promos and QR e-tickets. The organiser panel handles events, sales, refunds and check-in.",
    },
    logins: [pin("2468")],
  },
  {
    slug: "petshop-klinik", kind: "website", admin: "#/admin",
    title: { id: "Pawku: petshop dan klinik hewan", en: "Pawku: pet shop and vet clinic" },
    text: {
      id: "Toko perlengkapan hewan dengan booking dokter hewan dan grooming, profil hewan, dan buku kesehatan digital. Panel klinik untuk antrian, rekam medis, stok, pesanan, dan pengingat vaksin.",
      en: "A pet shop with vet and grooming bookings, pet profiles and a digital health book. A clinic panel for the queue, medical records, stock, orders and vaccine reminders.",
    },
    logins: [pin("1234"), { label: { id: "HP pelanggan", en: "Customer phone" }, value: "0812-0000-1001" }, { label: { id: "PIN pelanggan", en: "Customer PIN" }, value: "1234" }],
  },
  {
    slug: "travel-tour", kind: "website", admin: "#/admin",
    title: { id: "Nusa Jelajah: paket wisata dan open trip", en: "Nusa Jelajah: tours and open trips" },
    text: {
      id: "Katalog paket, pilih jadwal dan peserta, DP atau lunas, cek booking, voucher cetak, dan panel pengelola dengan manifest.",
      en: "A tour catalogue: pick a date and travellers, pay a deposit or in full, check bookings, print vouchers, and a managers' panel with manifests.",
    },
    logins: [pin("2468")],
  },
  {
    slug: "coffee-shop", kind: "landing",
    title: { id: "Foliage Coffee: kedai kopi", en: "Foliage Coffee: a slow coffee bar" },
    text: {
      id: "Landing page hangat untuk kedai kopi: hero cangkir melayang dengan kartu biji kopi pilihan, cerita, menu, perjalanan biji, dan info kunjungan.",
      en: "A warm landing page for a slow coffee bar: a floating cup hero with a featured bean card, story, menu, bean journey and visit info.",
    },
    logins: [],
  },
  {
    slug: "digital-agency", kind: "landing",
    title: { id: "Luminary Studio: agensi digital", en: "Luminary Studio: a digital agency" },
    text: {
      id: "Landing page gelap dan tegas untuk agensi kreatif: hero gradien dengan statistik beranimasi, layanan, portofolio, proses, dan kontak.",
      en: "A bold dark landing page for a creative agency: a gradient hero with animated stats, services, work, process and contact.",
    },
    logins: [],
  },
  {
    slug: "fashion-brand", kind: "landing",
    title: { id: "VELOURA: brand fashion", en: "VELOURA: a fashion brand" },
    text: {
      id: "Landing page fashion bergaya editorial: hero terbelah, bar pengumuman, keranjang, grid produk baru, dan manifesto.",
      en: "An editorial fashion landing page: split hero, announcement bar, cart badge, a new-arrivals grid and a manifesto.",
    },
    logins: [],
  },
  {
    slug: "fine-dining", kind: "landing",
    title: { id: "Aurum: restoran fine dining", en: "Aurum: fine dining" },
    text: {
      id: "Landing page restoran mewah hitam-emas: hidangan andalan, menu 7 hidangan, cerita chef, private dining, dan reservasi.",
      en: "A dark-and-gold fine dining landing page: signature dishes, a 7-course tasting menu, the chef's story, private dining and reservations.",
    },
    logins: [],
  },
  {
    slug: "fitness-gym", kind: "landing",
    title: { id: "IRONFORGE: pusat kebugaran", en: "IRONFORGE: a gym" },
    text: {
      id: "Landing page gym yang energik: tipografi besar, program, pelatih, tiga paket harga, jadwal kelas mingguan, dan testimoni.",
      en: "A high-energy gym landing page: oversized type, programmes, trainers, three price tiers, a weekly class schedule and testimonials.",
    },
    logins: [],
  },
  {
    slug: "saas-ai-assistant", kind: "landing",
    title: { id: "Axion AI: produk SaaS", en: "Axion AI: a SaaS product" },
    text: {
      id: "Landing page SaaS yang bersih untuk asisten AI: hero mockup dashboard, fitur, cara kerja, testimoni, harga, dan FAQ.",
      en: "A clean SaaS landing page for an AI assistant: a dashboard mockup hero, features, how it works, testimonials, pricing and FAQ.",
    },
    logins: [],
  },
  {
    slug: "dairy-co", kind: "landing",
    title: { id: "Dairy.co: salad buah dan es teler", en: "Dairy.co: fruit salad and es teler" },
    text: {
      id: "Landing page satu file untuk brand salad buah dan es teler.",
      en: "A single-file landing page for a fruit salad and es teler brand.",
    },
    logins: [],
  },
  {
    slug: "travel-adventure", kind: "landing",
    title: { id: "NusaTrip: agen travel dan umroh", en: "NusaTrip: travel and umrah agency" },
    text: {
      id: "Landing page agen perjalanan dengan paket liburan, itinerary custom, tur umroh dan halal, serta formulir pemesanan.",
      en: "A travel agency landing page with holiday packages, custom itineraries, umrah and halal tours, and booking forms.",
    },
    logins: [],
  },
  {
    slug: "travel-modern", kind: "landing",
    title: { id: "Wanderlust Indonesia: travel modern", en: "Wanderlust Indonesia: modern travel" },
    text: {
      id: "Landing page travel modern dengan destinasi populer, filter pencarian, testimoni, dan alur pemesanan.",
      en: "A modern travel landing page with trending destinations, search filters, testimonials and a booking flow.",
    },
    logins: [],
  },
  {
    slug: "umroh-premium", kind: "landing",
    title: { id: "Al-Safwa: umroh dan haji premium", en: "Al-Safwa: premium umrah and hajj" },
    text: {
      id: "Landing page hijau-emas untuk paket umroh dan haji mewah: hotel bintang lima, jadwal keberangkatan, dan konsultasi VIP.",
      en: "An emerald-and-gold landing page for luxury umrah and hajj packages: five-star hotels, departure dates and VIP consultations.",
    },
    logins: [],
  },
  {
    slug: "wedding-elegant", kind: "landing",
    title: { id: "Eternal Vows: wedding organizer", en: "Eternal Vows: a wedding organiser" },
    text: {
      id: "Landing page wedding organizer bernuansa pastel: galeri portofolio dengan filter, paket layanan, dan testimoni.",
      en: "A soft pastel wedding organiser landing page: a filterable portfolio, service packages and testimonials.",
    },
    logins: [],
  },
  {
    slug: "wedding-luxury", kind: "landing",
    title: { id: "Lumière: wedding planner mewah", en: "Lumière: a luxury wedding planner" },
    text: {
      id: "Landing page wedding planner hitam-emas: perencanaan upacara, venue pilihan, koordinasi busana, dan booking konsultasi.",
      en: "A dark-and-gold wedding planner landing page: ceremony planning, curated venues, bridal coordination and consultation booking.",
    },
    logins: [],
  },
  {
    slug: "wedding-rustic", kind: "landing",
    title: { id: "Sakura Wedding: pernikahan rustic", en: "Sakura Wedding: a rustic wedding" },
    text: {
      id: "Landing page pernikahan rustic bernuansa sage dan blush: ide pernikahan outdoor, kalkulator budget, vendor, dan formulir konsultasi.",
      en: "A sage-and-blush rustic wedding landing page: outdoor wedding ideas, a budget calculator, vendors and a consultation form.",
    },
    logins: [],
  },
  {
    slug: "itachi-landing-page", kind: "landing",
    title: { id: "Uchiha Itachi: landing page sinematik", en: "Uchiha Itachi: a cinematic landing page" },
    text: {
      id: "Fan page sinematik: scroll menggerakkan rangkaian frame (mata terbuka sampai Sharingan) dengan efek petir dan audio.",
      en: "A cinematic fan page: scrolling drives a frame sequence (eyes opening to the Sharingan) with lightning effects and audio.",
    },
    logins: [],
  },
];
