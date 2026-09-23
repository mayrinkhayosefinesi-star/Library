// data.js - Data Buku, Genre, Seri & Konfigurasi Level 1-10

export const GENRES = {
    HOROR: {
        id: 'horor',
        name: 'Horor & Misteri Gaib',
        shortName: 'Horor',
        color: '#8b0000', // Dark Crimson
        accentColor: '#ff4d4d',
        icon: '👻',
        shelfIndex: 0,
        description: 'Kisah mencekam, misteri supranatural, dan kutukan masa lalu.'
    },
    FANTASI: {
        id: 'fantasi',
        name: 'Fantasi & Sihir',
        shortName: 'Fantasi',
        color: '#4a148c', // Deep Purple
        accentColor: '#ba68c8',
        icon: '🔮',
        shelfIndex: 1,
        description: 'Petualangan di dunia sihir, naga, dan artefak kuno.'
    },
    MISTERI: {
        id: 'misteri',
        name: 'Detektif & Misteri',
        shortName: 'Misteri',
        color: '#1a237e', // Midnight Navy
        accentColor: '#64b5f6',
        icon: '🔍',
        shelfIndex: 2,
        description: 'Teka-teki kriminal, intrik detektif, dan rahasia tersembunyi.'
    },
    SAINS: {
        id: 'sains',
        name: 'Sains & Fiksi Ilmiah',
        shortName: 'Sci-Fi',
        color: '#004d40', // Deep Teal
        accentColor: '#4db6ac',
        icon: '🚀',
        shelfIndex: 3,
        description: 'Perjalanan antariksa, kecerdasan buatan, dan misteri alam semesta.'
    },
    PETUALANGAN: {
        id: 'petualangan',
        name: 'Petualangan & Sejarah',
        shortName: 'Petualangan',
        color: '#e65100', // Amber Bronze
        accentColor: '#ffb74d',
        icon: '🗺️',
        shelfIndex: 4,
        description: 'Ekspedisi hutan rimba, harta karun kuno, dan sejarah peradaban.'
    }
};

export const BOOK_SERIES = [
    // --- GENRE HOROR ---
    {
        seriesId: 'h_rumah_tua',
        genreId: 'horor',
        title: 'Misteri Rumah Tua',
        author: 'R. K. Dananjaya',
        totalParts: 3,
        synopsis: 'Sebuah manor tua di atas bukit menyimpan jeritan dari masa lalu yang tak pernah usang.',
        parts: [
            { part: 1, subtitle: 'Pintu Terlarang', coverHue: 0 },
            { part: 2, subtitle: 'Gema di Lorong Bawah', coverHue: 5 },
            { part: 3, subtitle: 'Kutukan Terakhir', coverHue: 10 }
        ]
    },
    {
        seriesId: 'h_malam_jumat',
        genreId: 'horor',
        title: 'Malam Berdarah Kliwon',
        author: 'Siti Wardani',
        totalParts: 3,
        synopsis: 'Ritual pemanggilan arwah kuno di sebuah desa terpencil yang berujung petaka.',
        parts: [
            { part: 1, subtitle: 'Aroma Melati Tengah Malam', coverHue: 350 },
            { part: 2, subtitle: 'Tembang Kematian', coverHue: 355 },
            { part: 3, subtitle: 'Tumbal Pesugihan', coverHue: 360 }
        ]
    },
    {
        seriesId: 'h_boneka',
        genreId: 'horor',
        title: 'Boneka Porselen Hitam',
        author: 'Arman Setia',
        totalParts: 2,
        synopsis: 'Boneka antik warisan yang selalu berpindah tempat sendiri saat lampu dipadamkan.',
        parts: [
            { part: 1, subtitle: 'Senyuman Tengah Malam', coverHue: 340 },
            { part: 2, subtitle: 'Mata yang Mengawasi', coverHue: 345 }
        ]
    },

    // --- GENRE FANTASI ---
    {
        seriesId: 'f_dunia_magis',
        genreId: 'fantasi',
        title: 'Mahkota Kristal Langit',
        author: 'Elora Vance',
        totalParts: 4,
        synopsis: 'Perjalanan penyihir muda mencari empat pecahan permata penyeimbang lima elemen dunia.',
        parts: [
            { part: 1, subtitle: 'Kebangkitan Api Abadi', coverHue: 270 },
            { part: 2, subtitle: 'Bisikan Hutan Sylva', coverHue: 275 },
            { part: 3, subtitle: 'Lautan Es Antares', coverHue: 280 },
            { part: 4, subtitle: 'Tahta di Atas Awan', coverHue: 285 }
        ]
    },
    {
        seriesId: 'f_naga_terakhir',
        genreId: 'fantasi',
        title: 'Telur Naga Terakhir',
        author: 'Gavin Sterling',
        totalParts: 3,
        synopsis: 'Di zaman ketika naga dianggap punah, seorang pandai besi menemukan telur bersinar di kawah gunung.',
        parts: [
            { part: 1, subtitle: 'Percikan Api Pertama', coverHue: 290 },
            { part: 2, subtitle: 'Sayap Badai', coverHue: 295 },
            { part: 3, subtitle: 'Raja Penjaga Langit', coverHue: 300 }
        ]
    },
    {
        seriesId: 'f_akademi_sihir',
        genreId: 'fantasi',
        title: 'Akademi Sihir Luminaria',
        author: 'Clara Oswald',
        totalParts: 3,
        synopsis: 'Misteri ruang bawah tanah perpustakaan terlarang di akademi sihir tertua.',
        parts: [
            { part: 1, subtitle: 'Mantra Tahun Pertama', coverHue: 260 },
            { part: 2, subtitle: 'Labirin Bayangan', coverHue: 265 },
            { part: 3, subtitle: 'Segel Kegelapan', coverHue: 268 }
        ]
    },

    // --- GENRE MISTERI ---
    {
        seriesId: 'm_detektif_hendra',
        genreId: 'misteri',
        title: 'Kasus Ruang Tertutup',
        author: 'Hendra Wijaya',
        totalParts: 3,
        synopsis: 'Detektif Hendra menyelidiki pembunuhan mustahil di dalam brankas bank terkunci dari dalam.',
        parts: [
            { part: 1, subtitle: 'Kunci Tanpa Lubang', coverHue: 210 },
            { part: 2, subtitle: 'Jejak Sepatu Merah', coverHue: 215 },
            { part: 3, subtitle: 'Pengakuan Palsu', coverHue: 220 }
        ]
    },
    {
        seriesId: 'm_surat_rahasia',
        genreId: 'misteri',
        title: 'Surat Bersegel Merpati',
        author: 'Agatha Melati',
        totalParts: 3,
        synopsis: 'Surat-surat misterius bertinta tak kasat mata mengungkap konspirasi elit kota Batavia.',
        parts: [
            { part: 1, subtitle: 'Kode Morse Stasiun Senen', coverHue: 225 },
            { part: 2, subtitle: 'Dokumen yang Terbakar', coverHue: 230 },
            { part: 3, subtitle: 'Dalang di Balik Layar', coverHue: 235 }
        ]
    },
    {
        seriesId: 'm_kematian_jam_tiga',
        genreId: 'misteri',
        title: 'Kematian Tepat Jam Tiga',
        author: 'Fajar Nugraha',
        totalParts: 2,
        synopsis: 'Setiap korban ditemukan tepat ketika lonceng katedral berdentang tiga kali.',
        parts: [
            { part: 1, subtitle: 'Dentang Pertama', coverHue: 200 },
            { part: 2, subtitle: 'Waktu yang Terhenti', coverHue: 205 }
        ]
    },

    // --- GENRE SAINS (SCI-FI) ---
    {
        seriesId: 's_penjelajah_galaksi',
        genreId: 'sains',
        title: 'Ekspedisi Alpha Centauri',
        author: 'Dr. Bryan Chandra',
        totalParts: 3,
        synopsis: 'Kapal induk manusia melompat melintasi wormhole pertama dan menemukan stasiun peninggalan purba.',
        parts: [
            { part: 1, subtitle: 'Lompatan Kecepatan Cahaya', coverHue: 165 },
            { part: 2, subtitle: 'Sinyal dari Kehampaan', coverHue: 170 },
            { part: 3, subtitle: 'Kelahiran Bintang Baru', coverHue: 175 }
        ]
    },
    {
        seriesId: 's_robot_humanoid',
        genreId: 'sains',
        title: 'Protokol Kesadaran Nexus',
        author: 'Irene Tanaka',
        totalParts: 3,
        synopsis: 'Ketika sebuah AI di laboratorium rahasia mulai mempertanyakan arti keberadaan dan mimpinya.',
        parts: [
            { part: 1, subtitle: 'Baris Kode 0x01', coverHue: 180 },
            { part: 2, subtitle: 'Jantung Silikon', coverHue: 185 },
            { part: 3, subtitle: 'Kebebasan Berpikir', coverHue: 190 }
        ]
    },
    {
        seriesId: 's_planet_kedua',
        genreId: 'sains',
        title: 'Koloni Planet Merah',
        author: 'Taufik Hidayat',
        totalParts: 2,
        synopsis: 'Perjuangan para pemukim pertama di planet Mars menghadapi badai debu magnetik.',
        parts: [
            { part: 1, subtitle: 'Kubah Habitat', coverHue: 155 },
            { part: 2, subtitle: 'Air di Kedalaman Es', coverHue: 160 }
        ]
    },

    // --- GENRE PETUALANGAN & SEJARAH ---
    {
        seriesId: 'p_harta_karun',
        genreId: 'petualangan',
        title: 'Harta Karun Sriwijaya',
        author: 'Bambang Soediro',
        totalParts: 3,
        synopsis: 'Peta kuno di balik kulit kayu membawa tim arkeolog menyusuri sungai purba Sumatra.',
        parts: [
            { part: 1, subtitle: 'Peta Daun Lontar', coverHue: 25 },
            { part: 2, subtitle: 'Rawa Buaya Emas', coverHue: 30 },
            { part: 3, subtitle: 'Kuil yang Tenggelam', coverHue: 35 }
        ]
    },
    {
        seriesId: 'p_jalur_sutra',
        genreId: 'petualangan',
        title: 'Kafilah Jalur Sutra',
        author: 'Nurul Huda',
        totalParts: 3,
        synopsis: 'Kisah pengembara melintasi padang pasir Samarkand dengan membawa benih rempah terlarang.',
        parts: [
            { part: 1, subtitle: 'Oase Sahara', coverHue: 40 },
            { part: 2, subtitle: 'Badai Gurun Maut', coverHue: 45 },
            { part: 3, subtitle: 'Gerbang Emas Konstantinopel', coverHue: 50 }
        ]
    },
    {
        seriesId: 'p_pulau_hilang',
        genreId: 'petualangan',
        title: 'Legenda Pulau Tanpa Nama',
        author: 'Dedi Kusuma',
        totalParts: 2,
        synopsis: 'Pulau misterius di Samudera Hindia yang hanya muncul ke permukaan saat gerhana total.',
        parts: [
            { part: 1, subtitle: 'Kabut Segitiga Maut', coverHue: 15 },
            { part: 2, subtitle: 'Kawah Kristal Bersinar', coverHue: 20 }
        ]
    }
];

// Konfigurasi Level 1 sampai 10
export const LEVELS = [
    {
        level: 1,
        title: 'Pemula Perpustakaan',
        subtitle: 'Langkah Awal Pustakawan',
        targetBooks: 5,
        allowedGenres: ['horor'],
        seriesList: [
            { seriesId: 'h_rumah_tua', parts: [1, 2, 3] }, // 3 buku
            { seriesId: 'h_boneka', parts: [1, 2] }         // 2 buku = total 5
        ],
        hint: 'Susun 5 buku Horor ke Rak Horor. Urutkan berdasarkan judul yang sama dan jilid berurutan (Part 1, 2, 3).'
    },
    {
        level: 2,
        title: 'Dua Dunia Cerita',
        subtitle: 'Mengenal Genre Berbeda',
        targetBooks: 7,
        allowedGenres: ['horor', 'fantasi'],
        seriesList: [
            { seriesId: 'h_rumah_tua', parts: [1, 2, 3] },      // 3 buku
            { seriesId: 'f_dunia_magis', parts: [1, 2, 3, 4] }  // 4 buku = total 7
        ],
        hint: 'Pisahkan buku Horor dan Fantasi ke raknya masing-masing. Jangan tertukar rak!'
    },
    {
        level: 3,
        title: 'Teka-Teki dan Sihir',
        subtitle: 'Menambah Koleksi Detektif',
        targetBooks: 9,
        allowedGenres: ['fantasi', 'misteri'],
        seriesList: [
            { seriesId: 'f_naga_terakhir', parts: [1, 2, 3] },     // 3 buku
            { seriesId: 'f_akademi_sihir', parts: [1, 2, 3] },     // 3 buku
            { seriesId: 'm_detektif_hendra', parts: [1, 2, 3] }   // 3 buku = total 9
        ],
        hint: 'Perhatikan detail Judul Serial agar Part 1-3 Fantasi tidak tercampur dengan Fantasi lainnya.'
    },
    {
        level: 4,
        title: 'Tiga Pilar Buku',
        subtitle: 'Koleksi Tiga Genre',
        targetBooks: 12,
        allowedGenres: ['horor', 'misteri', 'sains'],
        seriesList: [
            { seriesId: 'h_malam_jumat', parts: [1, 2, 3] },       // 3 buku
            { seriesId: 'm_surat_rahasia', parts: [1, 2, 3] },     // 3 buku
            { seriesId: 's_penjelajah_galaksi', parts: [1, 2, 3] },// 3 buku
            { seriesId: 's_robot_humanoid', parts: [1, 2, 3] }     // 3 buku = total 12
        ],
        hint: 'Lantai mulai penuh! Ambil buku dan kelompokkan ke Rak Horor, Misteri, dan Sains.'
    },
    {
        level: 5,
        title: 'Pustakawan Terampil',
        subtitle: 'Manajemen Rak Bertingkat',
        targetBooks: 15,
        allowedGenres: ['horor', 'fantasi', 'petualangan'],
        seriesList: [
            { seriesId: 'h_rumah_tua', parts: [1, 2, 3] },      // 3 buku
            { seriesId: 'h_boneka', parts: [1, 2] },             // 2 buku
            { seriesId: 'f_dunia_magis', parts: [1, 2, 3, 4] },  // 4 buku
            { seriesId: 'p_harta_karun', parts: [1, 2, 3] },     // 3 buku
            { seriesId: 'p_jalur_sutra', parts: [1, 2, 3] }      // 3 buku = total 15
        ],
        hint: 'Periksa label rak kayu di atas setiap sekat agar penataan rapi dan presisi.'
    },
    {
        level: 6,
        title: 'Ekspedisi Literasi',
        subtitle: 'Empat Genre Sekaligus',
        targetBooks: 18,
        allowedGenres: ['horor', 'fantasi', 'misteri', 'sains'],
        seriesList: [
            { seriesId: 'h_malam_jumat', parts: [1, 2, 3] },       // 3 buku
            { seriesId: 'f_naga_terakhir', parts: [1, 2, 3] },     // 3 buku
            { seriesId: 'm_detektif_hendra', parts: [1, 2, 3] },   // 3 buku
            { seriesId: 'm_kematian_jam_tiga', parts: [1, 2] },     // 2 buku
            { seriesId: 's_penjelajah_galaksi', parts: [1, 2, 3] },// 3 buku
            { seriesId: 's_robot_humanoid', parts: [1, 2, 3] },    // 3 buku
            { seriesId: 's_planet_kedua', parts: [1] }             // 1 buku = total 18
        ],
        hint: 'Kombinasi 4 genre. Gunakan tombol [TAB] kapan saja untuk melihat Katalog Panduan Rak.'
    },
    {
        level: 7,
        title: 'Master Arsip',
        subtitle: 'Kerapian Menyeluruh',
        targetBooks: 22,
        allowedGenres: ['horor', 'fantasi', 'misteri', 'petualangan'],
        seriesList: [
            { seriesId: 'h_rumah_tua', parts: [1, 2, 3] },       // 3 buku
            { seriesId: 'h_boneka', parts: [1, 2] },             // 2 buku
            { seriesId: 'f_dunia_magis', parts: [1, 2, 3, 4] },  // 4 buku
            { seriesId: 'f_akademi_sihir', parts: [1, 2, 3] },   // 3 buku
            { seriesId: 'm_surat_rahasia', parts: [1, 2, 3] },   // 3 buku
            { seriesId: 'p_harta_karun', parts: [1, 2, 3] },     // 3 buku
            { seriesId: 'p_pulau_hilang', parts: [1, 2] },       // 2 buku
            { seriesId: 'p_jalur_sutra', parts: [1, 2] }         // 2 buku = total 22
        ],
        hint: 'Semakin banyak buku di lantai. Tetap tenang, bawa satu per satu dan susun dengan teliti.'
    },
    {
        level: 8,
        title: 'Kolektor Legendaris',
        subtitle: 'Harmonisasi 5 Genre',
        targetBooks: 26,
        allowedGenres: ['horor', 'fantasi', 'misteri', 'sains', 'petualangan'],
        seriesList: [
            { seriesId: 'h_malam_jumat', parts: [1, 2, 3] },       // 3
            { seriesId: 'h_boneka', parts: [1, 2] },             // 2
            { seriesId: 'f_naga_terakhir', parts: [1, 2, 3] },     // 3
            { seriesId: 'f_dunia_magis', parts: [1, 2, 3, 4] },   // 4
            { seriesId: 'm_detektif_hendra', parts: [1, 2, 3] },   // 3
            { seriesId: 'm_kematian_jam_tiga', parts: [1, 2] },     // 2
            { seriesId: 's_penjelajah_galaksi', parts: [1, 2, 3] },// 3
            { seriesId: 's_robot_humanoid', parts: [1, 2, 3] },    // 3
            { seriesId: 'p_jalur_sutra', parts: [1, 2, 3] }        // 3 = total 26
        ],
        hint: 'Semua 5 Genre hadir! Rak akan terlihat sangat megah ketika terisi penuh.'
    },
    {
        level: 9,
        title: 'Penjaga Perpustakaan Kerajaan',
        subtitle: 'Tantangan 30 Buku',
        targetBooks: 30,
        allowedGenres: ['horor', 'fantasi', 'misteri', 'sains', 'petualangan'],
        seriesList: [
            { seriesId: 'h_rumah_tua', parts: [1, 2, 3] },       // 3
            { seriesId: 'h_malam_jumat', parts: [1, 2, 3] },     // 3
            { seriesId: 'f_dunia_magis', parts: [1, 2, 3, 4] },  // 4
            { seriesId: 'f_akademi_sihir', parts: [1, 2, 3] },   // 3
            { seriesId: 'm_detektif_hendra', parts: [1, 2, 3] }, // 3
            { seriesId: 'm_surat_rahasia', parts: [1, 2, 3] },   // 3
            { seriesId: 's_penjelajah_galaksi', parts: [1, 2, 3] }, // 3
            { seriesId: 's_robot_humanoid', parts: [1, 2, 3] },  // 3
            { seriesId: 'p_harta_karun', parts: [1, 2, 3] },     // 3
            { seriesId: 'p_pulau_hilang', parts: [1, 2] }        // 2 = total 30
        ],
        hint: 'Hampir mencapai puncak! Susun buku-buku tebal dengan urutan yang sempurna.'
    },
    {
        level: 10,
        title: 'Kepala Pustakawan Agung',
        subtitle: 'Ujian Terbesar Perpustakaan Utama',
        targetBooks: 35,
        allowedGenres: ['horor', 'fantasi', 'misteri', 'sains', 'petualangan'],
        seriesList: [
            { seriesId: 'h_rumah_tua', parts: [1, 2, 3] },       // 3
            { seriesId: 'h_malam_jumat', parts: [1, 2, 3] },     // 3
            { seriesId: 'h_boneka', parts: [1, 2] },             // 2
            { seriesId: 'f_dunia_magis', parts: [1, 2, 3, 4] },  // 4
            { seriesId: 'f_naga_terakhir', parts: [1, 2, 3] },   // 3
            { seriesId: 'f_akademi_sihir', parts: [1, 2, 3] },   // 3
            { seriesId: 'm_detektif_hendra', parts: [1, 2, 3] }, // 3
            { seriesId: 'm_surat_rahasia', parts: [1, 2, 3] },   // 3
            { seriesId: 's_penjelajah_galaksi', parts: [1, 2, 3] }, // 3
            { seriesId: 's_robot_humanoid', parts: [1, 2, 3] },  // 3
            { seriesId: 'p_harta_karun', parts: [1, 2, 3] },     // 3
            { seriesId: 'p_jalur_sutra', parts: [1, 2] }         // 2 = total 35
        ],
        hint: 'Ujian puncak 35 Buku! Rapikan seluruh perpustakaan untuk mendapatkan Trofi Pustakawan Emas.'
    }
];

// Helper untuk mengambil metadata seri
export function getSeriesById(seriesId) {
    return BOOK_SERIES.find(s => s.seriesId === seriesId);
}

export function getGenreById(genreId) {
    return Object.values(GENRES).find(g => g.id === genreId);
}
