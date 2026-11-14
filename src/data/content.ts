/*
  Every piece of content on the DyskLab page lives here: contact, process,
  principles, services, apps, case studies and testimonials.

  - `draft: true` on a case study or testimonial shows it ONLY in `npm run dev`;
    production builds skip it.
  - Testimonials are shown ANONYMOUSLY and are stored already censored
    ("Jane Doe" -> "J*** D**"), since this repository is public. `role` is shown
    as-is, `rating` defaults to 5.
  - Unpublished case studies can live in src/data/drafts.local.json (git-ignored,
    same shape as `cases`); they are merged in and, being drafts, only show in dev.
  - `client_project: true` marks a case study as client work.
  - Case images live in public/images/cases/ (1200x750, cropped from the top);
    app icons in public/images/apps/. `projectUrl` links to the write-up on fanny.dev.
*/
import type { Content } from "./types";

// Optional, git-ignored drafts; the glob is empty when the file is missing.
const local = Object.values(import.meta.glob<{ cases?: Content["cases"] }>("./drafts.local.json", { eager: true, import: "default" }))[0];

const content: Content = 
{
  "description": "DyskLab adalah software house di Gresik, Jawa Timur: pembuatan website, aplikasi web dan mobile, integrasi sistem, setup server, maintenance, dan perbaikan bug untuk perusahaan di Indonesia.",
  "whatsapp": "628511741230",
  "email": "me@fanny.dev",
  "process": [
    {
      "name": "Diskusi kebutuhan",
      "text": "Memahami proses kerja, data yang sudah dipakai, dan target yang ingin dicapai."
    },
    {
      "name": "Rancangan",
      "text": "Alur, struktur data, dan tampilan disepakati sebelum mulai menulis kode."
    },
    {
      "name": "Pengembangan bertahap",
      "text": "Fitur dikerjakan per modul dan ditinjau bersama klien di setiap tahap."
    },
    {
      "name": "Pengujian dan peluncuran",
      "text": "Alur penting diuji, data dipindahkan, lalu sistem dipasang di server."
    },
    {
      "name": "Pendampingan",
      "text": "Panduan pemakaian, perbaikan, dan pembaruan sesuai kebutuhan."
    }
  ],
  "principles": [
    {
      "title": "Berangkat dari cara kerja Anda",
      "text": "File Excel dan catatan yang sudah dipakai tim jadi acuan, supaya sistem baru terasa familiar sejak hari pertama."
    },
    {
      "title": "Tidak ada yang ditebak",
      "text": "Aturan yang belum jelas ditanyakan dulu, dan dibuat mudah diubah kalau kebijakan Anda berganti."
    },
    {
      "title": "Perhitungan uang selalu diuji",
      "text": "Tagihan, pembayaran, dan laporan keuangan dicek otomatis supaya angkanya tidak meleset."
    },
    {
      "title": "Semua tercatat",
      "text": "Struktur data dan cara kerja sistem didokumentasikan, sehingga mudah dirawat dan dikembangkan siapa pun."
    }
  ],
  "service_groups": [
    {
      "title": "Membangun sistem baru",
      "intro": "Dari kebutuhan yang masih berupa obrolan sampai sistem yang dipakai tim Anda setiap hari.",
      "items": [
        {
          "name": "Pembuatan website",
          "text": "Company profile, landing page, katalog produk, dan toko online. Dua bahasa bila perlu, dengan panel admin agar isi bisa diubah sendiri dan SEO per halaman."
        },
        {
          "name": "Aplikasi web dan sistem internal",
          "text": "Dashboard, sistem penjualan, stok, absensi, tagihan, dan laporan. Hak akses per peran, ekspor ke Excel atau PDF, dan riwayat perubahan data."
        },
        {
          "name": "Aplikasi mobile Android",
          "text": "Aplikasi Android dengan Flutter yang terhubung ke backend yang sama dengan dashboard web, misalnya absensi dengan selfie dan lokasi."
        },
        {
          "name": "Integrasi dan otomasi",
          "text": "Menghubungkan sistem dengan WhatsApp, Telegram, payment gateway, WHMCS, atau API pihak ketiga, dan mengotomatiskan pekerjaan yang selama ini diulang manual."
        }
      ]
    },
    {
      "title": "Merawat sistem yang sudah berjalan",
      "intro": "Untuk website dan aplikasi yang sudah dipakai, termasuk yang dibuat developer lain.",
      "items": [
        {
          "name": "Maintenance berkala",
          "text": "Update keamanan dan dependensi, backup terjadwal, pemantauan server agar gangguan diketahui sebelum pengguna melapor, dan perbaikan kecil setiap bulan."
        },
        {
          "name": "Bug fix dan perbaikan sistem lama",
          "text": "Melacak error, memperbaiki fitur yang rusak, dan merapikan kode Laravel atau PHP yang ditinggalkan developer sebelumnya, tanpa harus membangun ulang dari nol."
        },
        {
          "name": "Setup server dan deployment",
          "text": "VPS Linux, Docker, Proxmox, domain, SSL, dan alur deploy, sampai aplikasi bisa diakses dan mudah diperbarui."
        },
        {
          "name": "Migrasi data dan hosting",
          "text": "Memindahkan data dari Excel atau sistem lama ke database baru, dan memindahkan aplikasi antar hosting atau dari shared hosting ke VPS."
        }
      ]
    }
  ],
  "apps": [
    {
      "slug": "dyskfiles",
      "page": "/produk/dyskfiles/",
      "name": "DyskFiles",
      "kind": "Pengelola aset",
      "kind_en": "Asset manager",
      "platform": "macOS, Windows",
      "icon": "/images/apps/dyskfiles.png",
      "text": "Mengelola koleksi gambar, video, audio, dan teks. Semuanya tersimpan di folder biasa yang bisa dibaca dari Finder, tanpa database.",
      "stack": [
        "Electron",
        "Svelte",
        "TypeScript",
        "Vite"
      ],
      "projectUrl": "https://www.fanny.dev/projects/dyskfiles/",
      "repo": "https://github.com/DyskLab/dyskfiles"
    },
    {
      "slug": "dyskfocus",
      "page": "/produk/dyskfocus/",
      "name": "DyskFocus",
      "kind": "Pengelola tugas",
      "kind_en": "Task manager",
      "platform": "Web, PWA, macOS",
      "icon": "/images/apps/dyskfocus.png",
      "text": "Inbox, project, tag, perspektif, review, dan forecast dalam aplikasi yang di-host sendiri, dengan tambah tugas cepat memakai bahasa sehari-hari.",
      "stack": [
        "Laravel",
        "PHP",
        "React",
        "TypeScript"
      ],
      "projectUrl": "https://www.fanny.dev/projects/dyskfocus/",
      "repo": "https://github.com/DyskLab/dyskfocus"
    },
    {
      "slug": "dyskflow",
      "page": "/produk/dyskflow/",
      "name": "DyskFlow",
      "kind": "CMS",
      "kind_en": "CMS",
      "platform": "Web",
      "icon": "/images/apps/dyskflow.svg",
      "text": "CMS Laravel tanpa build step, dengan page builder visual ala Elementor dan 65 widget. Dipasang lewat wizard tanpa terminal, diperbarui satu tombol, dengan SEO bawaan dan dua bahasa.",
      "stack": [
        "Laravel",
        "PHP",
        "JavaScript",
        "CSS"
      ],
      "projectUrl": "https://www.fanny.dev/projects/dyskflow/",
      "repo": "https://github.com/DyskLab/dyskflow"
    },
    {
      "slug": "dysklink",
      "page": "/produk/dysklink/",
      "name": "DyskLink",
      "kind": "Konektivitas",
      "kind_en": "Connectivity",
      "platform": "macOS, Windows, Linux, Android",
      "icon": "/images/apps/dysklink.png",
      "text": "Menghubungkan HP Android dengan Mac, Windows, atau Linux lewat Wi-Fi lokal, tanpa cloud dan tanpa akun: kirim file, clipboard, notifikasi, layar HP, sampai remote control.",
      "stack": [
        "Swift",
        "SwiftUI",
        "Kotlin",
        "Jetpack Compose"
      ],
      "repo": "https://github.com/DyskLab/dysklink-mac"
    }
  ],
  "cases": [
    {
      "slug": "easytradegroup",
      "kind": "Project klien",
      "client_project": true,
      "client": "Easy Trade Group",
      "sector": "Finansial dan Trading",
      "title": "Website multi-halaman dan portal edukasi trading dengan CMS kustom",
      "problem": "Platform copy trading dan edukasi finansial membutuhkan website yang profesional, informatif, patuh regulasi risiko finansial, dan mudah dikelola tanpa ketergantungan pada plugin pihak ketiga.",
      "built": "Website multi-halaman dua bahasa (Indonesia & Inggris) dengan CMS Laravel 13, modul Master Trader terverifikasi dengan riwayat performa, integrasi VPS dan Expert Advisor (EA), autentikasi 2FA Fortify, serta dashboard admin Livewire 3 kustom.",
      "result": "Materi edukasi dan katalog Master Trader dapat diperbarui langsung oleh tim, memberikan transparansi risiko dan alur onboarding yang jelas bagi calon trader.",
      "image": "/images/cases/easytradegroup.jpg",
      "stack": [
        "Laravel",
        "PHP",
        "Livewire",
        "Alpine.js"
      ],
      "projectUrl": "https://www.fanny.dev/projects/easytradegroup/",
      "demo": "https://easytradegroup.id"
    },
    {
      "slug": "umrah-travel-partner-system",
      "kind": "Project klien",
      "client_project": true,
      "client": "Lintas Persada Tour & Travel",
      "sector": "Travel Umrah dan Haji",
      "title": "Pembayaran jamaah dan jaringan agen dalam satu sistem",
      "problem": "Paket, kursi, pembayaran, dan referral agen dicatat manual, dan website lama sulit diperbarui.",
      "built": "Website, CMS, katalog paket dan jadwal, pendaftaran jamaah dengan jadwal cicilan dan kuitansi PDF, serta jaringan mitra dengan pohon referral dan laporan per bulan.",
      "result": "Setelah ditinjau bersama klien, mesin komisi otomatis diganti komisi manual. Sistemnya jadi lebih kecil, lebih aman, dan sesuai cara kerja agen mereka.",
      "image": "/images/cases/umrah-travel-partner-system.jpg",
      "stack": [
        "Laravel",
        "PHP",
        "Blade",
        "Bootstrap"
      ],
      "projectUrl": "https://www.fanny.dev/projects/umrah-travel-partner-system/",
      "demo": "https://www.prayogilintaspersada.com/"
    },
    {
      "slug": "karirku",
      "kind": "Produk sendiri",
      "client": "Karirku",
      "sector": "HR dan absensi",
      "title": "Absensi dengan selfie dan lokasi, sampai slip gaji",
      "problem": "Banyak usaha kecil masih mencatat absensi di kertas atau spreadsheet, lalu menyusun ulang angka yang sama setiap akhir bulan untuk penggajian.",
      "built": "Aplikasi Android (Flutter) untuk absen dengan selfie dan GPS, API NestJS, dan dashboard web untuk shift, cuti, lembur, koreksi absen, penggajian, reimbursement, dan keuangan kantor.",
      "result": "Sudah berjalan di karirku.com dengan paket gratis untuk sampai 20 karyawan. Satu akun bisa dipakai di beberapa usaha sekaligus.",
      "image": "/images/cases/karirku.jpg",
      "stack": [
        "Flutter",
        "NestJS",
        "TypeScript",
        "React"
      ],
      "projectUrl": "https://www.fanny.dev/projects/karirku/",
      "demo": "https://www.karirku.com/"
    },
    {
      "slug": "chat-app-multiapps",
      "kind": "Dibangun di tempat kerja",
      "client": "Chatku",
      "sector": "Layanan pelanggan",
      "title": "Semua chat pelanggan masuk ke satu dashboard",
      "problem": "Tim support menangani pesan dari banyak aplikasi terpisah, sehingga ada balasan yang terlewat dan dua agen bisa membalas pelanggan yang sama.",
      "built": "Inbox terpadu untuk WhatsApp, Telegram, web chat, Instagram, dan kanal lain, dashboard web real-time lewat Socket.IO, serta aplikasi mobile Flutter (Android & iOS) untuk agen di lapangan.",
      "result": "Menangani 1.871 percakapan pelanggan dalam dua bulan. Kunci percakapan di Redis mencegah dua agen membalas pelanggan yang sama.",
      "image": "/images/cases/chat-app-multiapps.jpg",
      "stack": [
        "Node.js",
        "Fastify",
        "Next.js",
        "Flutter"
      ],
      "projectUrl": "https://www.fanny.dev/projects/chat-app-multiapps/",
      "demo": "https://www.chatku.com"
    },
    {
      "slug": "kos-management-app",
      "kind": "Rebuild sistem lama",
      "client": "Kos Management App",
      "sector": "Properti",
      "title": "Mengelola beberapa kos dari satu dashboard",
      "problem": "Aplikasi lama (Laravel 12 dan Inertia) menyatukan backend dan frontend dalam satu monolit, sehingga sulit dikembangkan.",
      "built": "API REST Laravel 13 dan aplikasi React terpisah untuk kamar, penyewa, tagihan dan pembayaran, fasilitas, staf dengan hak akses, 2FA, serta pemesanan kamar dan daftar tunggu publik.",
      "result": "Konsep database lama dipertahankan, sementara arsitektur barunya memisahkan frontend dari backend sehingga keduanya bisa dikembangkan sendiri-sendiri.",
      "image": "/images/cases/kos-management-app.jpg",
      "stack": [
        "Laravel",
        "PHP",
        "React",
        "Bootstrap"
      ],
      "projectUrl": "https://www.fanny.dev/projects/kos-management-app/"
    }
  ],
  "testimonials": [
    {
      "draft": false,
      "quote": "Awalnya kami cuma minta website company profile, tapi setelah diskusi ternyata yang paling kami butuhkan justru sistem untuk rekap penjualan distributor. Sekarang laporan bulanan tidak perlu disusun ulang dari banyak file Excel.",
      "name": "R*** H******",
      "role": "Manajer Pemasaran",
      "company": "D********** b**** b*******",
      "rating": 5
    },
    {
      "draft": false,
      "quote": "Yang saya suka, setiap tahap ditunjukkan dulu sebelum lanjut. Jadi kalau ada yang kurang pas dengan cara kerja kantor, bisa langsung dibenahi waktu itu juga, bukan setelah semuanya jadi.",
      "name": "S*** R********",
      "role": "Pemilik",
      "company": "L****** k***** b*****",
      "rating": 5
    },
    {
      "draft": false,
      "quote": "Website lama kami dibuat developer lain dan sering error setiap kali ada update. Bug-nya dilacak satu per satu sampai stabil, tanpa harus membangun ulang dari nol.",
      "name": "A*** P*******",
      "role": "Kepala IT",
      "company": "P********* l*******",
      "rating": 5
    },
    {
      "draft": false,
      "quote": "Pendaftaran jamaah dan cicilan sekarang tercatat di satu tempat. Staf tidak lagi mencocokkan bukti transfer dari chat satu per satu.",
      "name": "H** N**** A***",
      "role": "Direktur Operasional",
      "company": "B*** p********* u****",
      "rating": 5
    },
    {
      "draft": false,
      "quote": "Penjelasannya mudah dipahami walaupun saya bukan orang IT. Istilah teknis selalu diterjemahkan ke bahasa yang dipakai di kantor kami.",
      "name": "D*** L******",
      "role": "Admin Keuangan",
      "company": "K***** p******",
      "rating": 5
    },
    {
      "draft": false,
      "quote": "Server kami dipindah dari shared hosting ke VPS tanpa downtime yang terasa oleh pelanggan. Setelahnya juga dibuatkan backup otomatis dan pemantauan.",
      "name": "F**** N******",
      "role": "Founder",
      "company": "T*** o***** f******",
      "rating": 5
    },
    {
      "draft": false,
      "quote": "Aplikasi absensinya dipakai karyawan di dua cabang. Waktu ada kendala di HP karyawan tertentu, responnya cepat dan diperbaiki di update berikutnya.",
      "name": "B****** S*******",
      "role": "HRD",
      "company": "U**** k*******",
      "rating": 5
    },
    {
      "draft": false,
      "quote": "Sudah hampir setahun pakai layanan maintenance bulanan. Update keamanan dan perbaikan kecil jalan rutin, jadi kami tidak perlu memikirkan teknisnya lagi.",
      "name": "L*** M******",
      "role": "Manajer Operasional",
      "company": "P********* p*******",
      "rating": 5
    },
    {
      "draft": false,
      "quote": "Integrasi ke WhatsApp membuat notifikasi tagihan terkirim otomatis. Pekerjaan yang dulu makan waktu setengah hari setiap akhir bulan sekarang tinggal dicek saja.",
      "name": "H***** W*****",
      "role": "Pemilik",
      "company": "P******* l****** i******* l****",
      "rating": 5
    }
  ]
}
;

if (local?.cases) content.cases.push(...local.cases.map((c) => ({ ...c, draft: true })));

export default content;
