const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/siswa', (req, res) => {
  const query = 'SELECT * FROM siswa';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

app.get('/api/siswa/:id', (req, res) => {
  const query = 'SELECT * FROM siswa WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    res.json(results[0]);
  });
});

app.post('/api/siswa', (req, res) => {
  const { nama, nis, kelas, jurusan, alamat } = req.body;
  if (!nama || !nis || !kelas || !jurusan || !alamat) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  const query = 'INSERT INTO siswa (nama, nis, kelas, jurusan, alamat) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [nama, nis, kelas, jurusan, alamat], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({
      message: 'Siswa berhasil ditambahkan',
      data: { id: result.insertId, nama, nis, kelas, jurusan, alamat }
    });
  });
});

app.put('/api/siswa/:id', (req, res) => {
  const { nama, nis, kelas, jurusan, alamat } = req.body;
  const query = 'UPDATE siswa SET nama = ?, nis = ?, kelas = ?, jurusan = ?, alamat = ? WHERE id = ?';

  db.query(query, [nama, nis, kelas, jurusan, alamat, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    res.json({ message: 'Data siswa berhasil diperbarui' });
  });
});

app.delete('/api/siswa/:id', (req, res) => {
  const query = 'DELETE FROM siswa WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    res.json({ message: 'Siswa berhasil dihapus' });
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});