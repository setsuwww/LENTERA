# 📚 DOCS.md --- Panduan Memasang LENTERA

Hai! Selamat datang di panduan instalasi **LENTERA**.

Dokumen ini dibuat untuk kamu yang mungkin baru pertama kali berkenalan
dengan Node.js, Next.js, terminal, dan database. Tenang, kita jalan
pelan-pelan. Kamu **nggak harus jago coding** untuk mengikuti panduan
ini. Ikuti langkahnya satu per satu, jangan lompat-lompat seperti lagi
mengejar diskon.

------------------------------------------------------------------------

## 0. Kenalan dulu: LENTERA itu apa?

**LENTERA** adalah aplikasi sistem perpustakaan. Aplikasi ini membantu
mengelola buku, anggota perpustakaan, peminjaman, pengembalian, dan
laporan.

Aplikasi ini dibuat menggunakan beberapa alat. Anggap saja seperti ini:

  -----------------------------------------------------------------------
  Nama                    Ibaratnya               Fungsinya
  ----------------------- ----------------------- -----------------------
  Node.js                 Mesin                   Menjalankan aplikasi
                                                  JavaScript di komputer

  npm                     Toko perlengkapan       Mengunduh alat-alat
                                                  yang dibutuhkan
                                                  aplikasi

  Next.js                 Kerangka rumah          Membantu membangun
                                                  aplikasi web

  MySQL                   Lemari arsip            Menyimpan data buku,
                                                  anggota, dan transaksi

  Prisma                  Penerjemah              Membantu aplikasi
                                                  berbicara dengan
                                                  database

  VS Code                 Meja kerja              Tempat membuka dan
                                                  mengedit kode
  -----------------------------------------------------------------------

Kamu tidak perlu menghafal semuanya. Yang penting, ikuti instruksinya.
❤️

------------------------------------------------------------------------

## 1. Siapkan perlengkapan

Sebelum memasang LENTERA, siapkan:

1.  Laptop atau komputer.
2.  Koneksi internet.
3.  **Node.js versi 22 LTS** atau versi LTS yang kompatibel dengan
    Next.js 16.
4.  **MySQL Server**.
5.  **Visual Studio Code (VS Code)**.
6.  Folder project LENTERA.

Unduh aplikasi dari situs resminya:

-   Node.js: <https://nodejs.org/>
-   Visual Studio Code: <https://code.visualstudio.com/>
-   MySQL Community Server: <https://dev.mysql.com/downloads/mysql/>
-   MySQL Workbench (opsional, supaya database lebih mudah dilihat):
    <https://dev.mysql.com/downloads/workbench/>

### 1.1 Pasang Node.js

1.  Buka situs <https://nodejs.org/>.
2.  Pilih versi **LTS**.
3.  Unduh installer sesuai sistem operasi laptop.
4.  Buka file installer yang sudah diunduh.
5.  Klik **Next** sampai proses instalasi selesai. Pengaturan bawaan
    biasanya sudah cukup.
6.  Setelah selesai, tutup dan buka kembali terminal jika sebelumnya
    sudah terbuka.

Sekarang kita cek apakah Node.js berhasil dipasang.

**Cara membuka terminal di VS Code:**

1.  Buka VS Code.
2.  Pilih menu **Terminal**.
3.  Klik **New Terminal**.
4.  Akan muncul area untuk mengetik perintah di bagian bawah.

Ketik satu per satu:

``` bash
node -v
npm -v
```

Kalau muncul nomor versi, misalnya `v22.x.x` dan nomor versi npm,
berarti berhasil! Kalau muncul pesan bahwa perintah tidak dikenal, coba
tutup lalu buka VS Code lagi. Jika masih gagal, Node.js mungkin belum
terpasang dengan benar.

> Catatan kecil: `node` dan `npm` adalah perintah yang diketik di
> terminal, bukan alamat website.

### 1.2 Pasang VS Code

1.  Unduh VS Code dari <https://code.visualstudio.com/>.
2.  Pasang seperti aplikasi biasa.
3.  Buka VS Code setelah selesai.

VS Code adalah tempat kita membuka folder project. Jangan takut melihat
banyak file. Kita tidak perlu mengubah semuanya.

### 1.3 Pasang MySQL

MySQL adalah tempat penyimpanan data LENTERA. Data buku, anggota, dan
transaksi akan disimpan di sana.

1.  Unduh **MySQL Community Server** dari situs resmi.
2.  Jalankan installer sesuai sistem operasi.
3.  Ikuti petunjuk instalasi.
4.  Saat diminta membuat password untuk pengguna `root`, buat password
    yang mudah kamu ingat tetapi tetap aman.
5.  **Simpan password tersebut.** Nanti akan dipakai saat menghubungkan
    LENTERA ke database.

Jika installer menawarkan MySQL Workbench, kamu boleh memasangnya juga.
Workbench memudahkan kita melihat database tanpa harus mengetik banyak
perintah.

**Penting:** MySQL Server dan MySQL Workbench berbeda. Server adalah
tempat database berjalan, sedangkan Workbench adalah aplikasi untuk
mengelolanya.

------------------------------------------------------------------------

## 2. Siapkan folder project LENTERA

Kamu harus memiliki folder project LENTERA terlebih dahulu. Jika project
diberikan dalam bentuk ZIP:

1.  Cari file ZIP LENTERA.
2.  Klik kanan file tersebut.
3.  Pilih **Extract** atau **Extract All**.
4.  Pindahkan folder hasil ekstrak ke tempat yang mudah ditemukan,
    misalnya folder `Documents`.

Jika project berasal dari GitHub, kamu bisa mengunduhnya melalui tombol
**Code → Download ZIP**, atau menggunakan Git jika sudah terpasang.

> Alamat repository GitHub tidak dicantumkan di panduan ini. Gunakan
> file ZIP atau alamat repository yang diberikan oleh pembuat aplikasi.

### Buka folder LENTERA di VS Code

1.  Buka VS Code.
2.  Klik **File → Open Folder**.
3.  Pilih folder LENTERA.
4.  Klik **Open**.

Pastikan kamu membuka folder utama project, yaitu folder yang berisi
file seperti `package.json`, `app`, dan `prisma`.

------------------------------------------------------------------------

## 3. Pasang semua perlengkapan aplikasi

Sekarang kita akan meminta npm mengunduh semua paket yang dibutuhkan
LENTERA.

1.  Pastikan folder LENTERA sudah terbuka di VS Code.
2.  Buka **Terminal → New Terminal**.
3.  Pastikan terminal berada di folder utama LENTERA.
4.  Ketik perintah berikut:

``` bash
npm install
```

Tunggu sampai selesai. Proses ini bisa membutuhkan waktu dan koneksi
internet.

Apa yang sedang terjadi? npm sedang membaca daftar kebutuhan aplikasi
dari file `package.json`, lalu mengunduh paket-paket yang diperlukan.
Jadi kamu tidak perlu memasang Next.js dan setiap paket satu per satu
jika file project sudah lengkap.

LENTERA menggunakan beberapa teknologi dan library, antara lain:

-   **Next.js** dan React untuk aplikasi web.
-   **Tailwind CSS** untuk tampilan.
-   **Prisma** dan adapter MariaDB untuk koneksi database MySQL.
-   **jose** untuk pengelolaan token session.
-   **Lucide React** untuk ikon.
-   **Recharts** untuk grafik laporan.
-   **bcryptjs**, jika digunakan oleh versi project untuk mengenkripsi
    password anggota.

Versi paket yang tepat mengikuti `package.json` dan lockfile milik
project. Sebaiknya jangan menghapus atau mengubah file tersebut
sembarangan.

Kalau proses selesai tanpa tulisan `npm ERR!`, biasanya pemasangan
berhasil.

------------------------------------------------------------------------

## 4. Buat database MySQL

Sekarang kita membuat tempat penyimpanan data untuk LENTERA.

### Cara A --- Menggunakan MySQL Workbench

Jika MySQL Workbench sudah terpasang:

1.  Buka MySQL Workbench.
2.  Pilih koneksi lokal MySQL. Biasanya bernama `Local instance`.
3.  Masukkan password `root` yang dibuat saat instalasi.
4.  Setelah berhasil masuk, buka tab SQL.
5.  Salin perintah berikut:

``` sql
CREATE DATABASE lentera_library;
```

6.  Klik ikon petir untuk menjalankan perintah.
7.  Jika tidak ada pesan error, database berhasil dibuat.

### Cara B --- Menggunakan terminal MySQL

Jika kamu tidak memasang Workbench, kamu bisa menggunakan terminal
MySQL:

``` sql
CREATE DATABASE lentera_library;
```

Jalankan perintah tersebut setelah berhasil masuk ke MySQL.

**Nama database harus `lentera_library`**, kecuali konfigurasi project
memang diubah.

------------------------------------------------------------------------

## 5. Hubungkan LENTERA ke database

Di folder utama LENTERA, buat file bernama:

``` text
.env
```

Perhatikan: nama file-nya hanya `.env`, bukan `.env.txt`.

Isi file tersebut dengan konfigurasi berikut:

``` env
DATABASE_URL="mysql://root:PASSWORD_MYSQL_KAMU@localhost:3306/lentera_library"
```

Ganti `PASSWORD_MYSQL_KAMU` dengan password MySQL yang kamu buat tadi.

Contoh: jika password MySQL kamu adalah `rahasia123`, maka:

``` env
DATABASE_URL="mysql://root:rahasia123@localhost:3306/lentera_library"
```

**Jangan gunakan password contoh tersebut sebagai password sungguhan.**

### Kalau password MySQL mengandung simbol khusus

Beberapa simbol, misalnya `@`, `#`, `%`, atau `/`, perlu diubah ke
format URL encoding agar koneksi tidak salah dibaca.

Contoh: - `@` menjadi `%40` - `#` menjadi `%23` - `%` menjadi `%25`

Misalnya password mengandung `@`, tulis `%40` pada bagian password di
`DATABASE_URL`.

Jangan mengirimkan isi file `.env` kepada orang lain karena file ini
berisi informasi rahasia.

------------------------------------------------------------------------

## 6. Siapkan konfigurasi login

LENTERA menggunakan file `.env.local` untuk menyimpan pengaturan login
dan session.

Buat file:

``` text
.env.local
```

Isi dengan contoh berikut:

``` env
SESSION_SECRET=ganti_dengan_kalimat_acak_panjang_minimal_32_karakter

ADMIN_EMAIL=admin@lentera.ac.id
ADMIN_PASSWORD=ganti_password_admin

STAFF_EMAIL=petugas@lentera.ac.id
STAFF_PASSWORD=ganti_password_petugas
```

Ganti password contoh dengan password milikmu sendiri.

`SESSION_SECRET` adalah kunci rahasia untuk menjaga session login. Buat
nilai acak yang panjang, minimal 32 karakter. Jangan membagikannya
kepada siapa pun.

### Bagaimana dengan akun mahasiswa?

Akun mahasiswa pada versi project yang menggunakan login dinamis diambil
dari data anggota di database (`Member`).

Artinya, mahasiswa tidak harus dibuat satu per satu di dalam kode
aplikasi. Data akun mahasiswa dibuat melalui fitur pengelolaan anggota,
dan password harus disimpan dalam bentuk hash oleh aplikasi.

Jika project yang kamu terima belum memiliki fitur pembuatan password
anggota, minta pembuat aplikasi menyiapkan akun mahasiswa terlebih
dahulu. Jangan mengisi password secara asal langsung melalui database.

------------------------------------------------------------------------

## 7. Siapkan tabel database dengan Prisma

Database sudah dibuat, tetapi masih seperti lemari kosong. Kita perlu
membuat tabel-tabel yang dibutuhkan LENTERA.

Di terminal VS Code, jalankan:

``` bash
npx prisma migrate dev
```

Jika project sudah memiliki migration, Prisma akan membaca migration
tersebut dan membuat tabel yang diperlukan.

Jika perintah meminta nama migration karena ada perubahan schema yang
belum dibuat, gunakan nama yang sesuai, misalnya:

``` bash
npx prisma migrate dev --name init
```

Setelah proses migration berhasil, jalankan:

``` bash
npx prisma generate
```

Perintah ini membuat Prisma Client agar aplikasi bisa berkomunikasi
dengan database.

**Jika muncul error koneksi database:**

-   Pastikan MySQL Server sedang berjalan.
-   Pastikan nama database adalah `lentera_library`.
-   Periksa username dan password pada `.env`.
-   Pastikan port MySQL sesuai. Umumnya `3306`.
-   Pastikan file `.env` berada di folder utama project, sejajar dengan
    `package.json`.

> Jangan menjalankan migration berulang kali dengan nama `init` jika
> migration awal sebenarnya sudah ada. Ikuti migration yang disertakan
> dalam project.

------------------------------------------------------------------------

## 8. Jalankan aplikasi LENTERA

Akhirnya, bagian yang ditunggu-tunggu!

Di terminal VS Code, jalankan:

``` bash
npm run dev
```

Tunggu sampai terminal menampilkan alamat lokal, biasanya:

``` text
http://localhost:3000
```

Buka browser seperti Chrome, lalu masukkan alamat:

<http://localhost:3000>

Jika halaman login LENTERA muncul, selamat! Aplikasinya sudah berjalan
di laptop kamu. 🎉

**Ingat:** selama aplikasi sedang digunakan, terminal yang menjalankan
`npm run dev` harus tetap terbuka.

Untuk menghentikan aplikasi, kembali ke terminal lalu tekan:

``` text
Ctrl + C
```

------------------------------------------------------------------------

## 9. Cara login ke LENTERA

LENTERA memiliki beberapa jenis pengguna:

  -----------------------------------------------------------------------
  Jenis akun                          Kegunaan
  ----------------------------------- -----------------------------------
  Admin                               Mengelola keseluruhan sistem
                                      perpustakaan

  Staff / Petugas                     Mengelola kegiatan operasional
                                      perpustakaan

  Student / Mahasiswa                 Melihat koleksi buku dan informasi
                                      peminjaman sendiri
  -----------------------------------------------------------------------

Gunakan email dan password yang sudah disiapkan pada konfigurasi atau
data anggota.

### Admin

Gunakan email dan password yang kamu isi pada:

``` env
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

### Petugas

Gunakan email dan password yang kamu isi pada:

``` env
STAFF_EMAIL=
STAFF_PASSWORD=
```

### Mahasiswa

Gunakan email dan password yang terdaftar pada data anggota di database.

Jika tidak bisa login, jangan langsung panik. Periksa kembali email,
password, jenis akun yang dipilih, dan pastikan akun mahasiswa sudah
memiliki password yang valid.

------------------------------------------------------------------------

## 10. Kalau muncul masalah, harus bagaimana?

Tidak semua error berarti aplikasinya rusak. Kadang hanya ada satu
pengaturan kecil yang belum tepat.

### A. `node` atau `npm` tidak dikenali

Artinya komputer belum menemukan instalasi Node.js.

Solusi: 1. Pastikan Node.js sudah terpasang. 2. Tutup VS Code. 3. Buka
kembali VS Code. 4. Jalankan `node -v` dan `npm -v` lagi.

### B. `npm install` gagal

Solusi: 1. Periksa koneksi internet. 2. Pastikan terminal berada di
folder yang memiliki `package.json`. 3. Coba jalankan `npm install`
lagi. 4. Jika masih gagal, simpan pesan error untuk diperiksa.

### C. Database tidak bisa terhubung

Solusi: 1. Pastikan MySQL Server menyala. 2. Periksa password dan
username di `.env`. 3. Pastikan database `lentera_library` sudah dibuat.
4. Periksa apakah password mengandung simbol yang perlu URL encoding.

### D. Tabel database belum ada

Jalankan:

``` bash
npx prisma migrate dev
npx prisma generate
```

Pastikan proses migration tidak menghasilkan error.

### E. Halaman tidak bisa dibuka

Pastikan terminal masih menjalankan:

``` bash
npm run dev
```

Lalu coba buka kembali <http://localhost:3000>.

### F. Login selalu gagal

Periksa: - Apakah jenis akun sudah dipilih? - Apakah email dan password
benar? - Apakah akun mahasiswa sudah terdaftar? - Apakah password
mahasiswa sudah disimpan dengan mekanisme hash yang digunakan
aplikasi? - Apakah variabel login pada `.env.local` sudah benar?

### G. Muncul pesan error panjang berwarna merah

Jangan buru-buru menghapus file atau menekan tombol sembarangan.

1.  Ambil screenshot pesan error.
2.  Salin bagian pesan error yang paling atas dan bagian penyebabnya.
3.  Kirim kepada pembuat aplikasi agar bisa diperiksa.

------------------------------------------------------------------------

## 11. Perintah yang mungkin akan sering dipakai

Tidak perlu menghafalnya. Simpan bagian ini kalau suatu hari dibutuhkan.

  -----------------------------------------------------------------------
  Perintah                            Artinya
  ----------------------------------- -----------------------------------
  `npm install`                       Memasang paket yang dibutuhkan
                                      project

  `npm run dev`                       Menyalakan aplikasi untuk
                                      penggunaan lokal

  `Ctrl + C`                          Menghentikan aplikasi yang sedang
                                      berjalan di terminal

  `npx prisma migrate dev`            Menjalankan perubahan struktur
                                      database

  `npx prisma generate`               Membuat Prisma Client

  `npx prisma studio`                 Membuka tampilan untuk melihat dan
                                      mengelola data database
  -----------------------------------------------------------------------

Untuk menjalankan Prisma Studio:

``` bash
npx prisma studio
```

Gunakan Prisma Studio dengan hati-hati. Mengubah atau menghapus data di
sana dapat memengaruhi isi database.

------------------------------------------------------------------------

## 12. Hal penting yang jangan dilakukan

Demi keamanan dan agar aplikasi tetap berjalan dengan baik:

1.  Jangan membagikan file `.env` atau `.env.local`.
2.  Jangan mengunggah password database ke GitHub.
3.  Jangan menghapus folder `prisma/migrations`.
4.  Jangan menghapus `package-lock.json` tanpa alasan.
5.  Jangan mengubah file konfigurasi jika tidak tahu fungsinya.
6.  Jangan menghapus data database hanya karena aplikasi sedang error.
7.  Jangan menutup terminal jika aplikasi masih ingin digunakan.

Pastikan `.env` dan `.env.local` masuk ke `.gitignore`, sehingga
informasi rahasia tidak ikut terunggah ke repository.

------------------------------------------------------------------------

## 13. Checklist instalasi

Kalau semua langkah sudah dilakukan, coba cek daftar ini:

-   [ ] Node.js berhasil dipasang.
-   [ ] VS Code berhasil dipasang.
-   [ ] MySQL Server berhasil dipasang dan berjalan.
-   [ ] Folder project LENTERA berhasil dibuka.
-   [ ] `npm install` berhasil.
-   [ ] Database `lentera_library` berhasil dibuat.
-   [ ] File `.env` sudah dibuat dan diisi.
-   [ ] File `.env.local` sudah dibuat dan diisi.
-   [ ] Prisma migration berhasil dijalankan.
-   [ ] Prisma Client berhasil dibuat.
-   [ ] `npm run dev` berhasil dijalankan.
-   [ ] Halaman LENTERA berhasil dibuka di browser.

Jika semua sudah tercentang, berarti instalasi LENTERA selesai!

------------------------------------------------------------------------

## Penutup

Terima kasih sudah mencoba memasang LENTERA.

Kalau ada bagian yang terasa membingungkan, tidak apa-apa. Instalasi
aplikasi memang terdiri dari beberapa tahap, dan setiap orang punya
waktu belajar masing-masing.

Ingat tiga hal paling penting:

1.  **Node.js** harus terpasang.
2.  **MySQL** harus berjalan dan database harus tersedia.
3.  **Aplikasi** dijalankan dengan `npm run dev`.

Selamat menggunakan LENTERA. Semoga urusan perpustakaan jadi lebih mudah
dan pengetahuan makin bersinar!

**LENTERA --- Illuminate Knowledge, Connect Generations.**
