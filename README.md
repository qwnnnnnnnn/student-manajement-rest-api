# Student Management System

Aplikasi Manajemen Data Siswa berbasis web yang dibuat menggunakan Express.js untuk REST API, database MySQL (HeidiSQL), dan JavaScript (Fetch API) untuk antarmuka pengguna.

## Identitas Pembuat
- **Nama:** Ratu Haerunnisa
- **Kelas:** XII RPL
- **Sekolah:** SMK Bina Putra Mandiri

## Teknologi yang Digunakan
- **Backend:** Node.js, Express.js, `mysql2`, `cors`, `nodemon`
- **Frontend:** HTML, CSS (Pastel Style), JavaScript (Fetch API)
- **Database:** MySQL / MariaDB (HeidiSQL)
- **Tools:** Git, GitHub, Postman / Thunder Client

## Skema Database
- **Database Name:** `db_manajement`
- **Table Name:** `siswa`

## Daftar Endpoint REST API
| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/api/siswa` | Menampilkan seluruh data siswa |
| GET | `/api/siswa/:id` | Menampilkan detail data siswa berdasarkan ID |
| POST | `/api/siswa` | Menambahkan data siswa baru |
| PUT | `/api/siswa/:id` | Mengubah data siswa berdasarkan ID |
| DELETE | `/api/siswa/:id` | Menghapus data siswa berdasarkan ID |

## Cara Menjalankan Aplikasi
1. Import / buat database `db_manajement` dan tabel `siswa` di HeidiSQL.
2. Buka terminal di folder proyek VS Code.
3. Jalankan `npm install`
4. Jalankan `npm run dev`
5. Buka browser dan akses `http://localhost:3000`
