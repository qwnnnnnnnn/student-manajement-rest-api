const API_URL = 'http://localhost:3000/api/siswa';

const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const namaInput = document.getElementById('nama');
const nisInput = document.getElementById('nis');
const kelasInput = document.getElementById('kelas');
const jurusanInput = document.getElementById('jurusan');
const alamatInput = document.getElementById('alamat');
const cardsContainer = document.getElementById('student-cards-container');
const totalStudentsEl = document.getElementById('total-students');

const alertBox = document.getElementById('alert');
const formTitle = document.getElementById('form-title');
const modal = document.getElementById('student-modal');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

const iconReload = document.getElementById('icon-reload');

let allStudentsData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
});

function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
}

async function fetchStudents() {
    cardsContainer.innerHTML = `
        <div class="state-card">
            <i class="fa-solid fa-spinner fa-spin state-icon"></i>
            <p class="state-text">Memuat data siswa...</p>
        </div>
    `;
    if (iconReload) iconReload.classList.add('fa-spin');

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Antisipasi jika API mengembalikan format array langsung atau objek { data: [...] }
        const studentsList = Array.isArray(data) ? data : (data.data || []);
        
        allStudentsData = studentsList;
        renderCards(allStudentsData);
        if (totalStudentsEl) totalStudentsEl.textContent = allStudentsData.length;
    } catch (err) {
        renderErrorState('Gagal mengambil data siswa dari server');
    } finally {
        if (iconReload) iconReload.classList.remove('fa-spin');
    }
}

function renderCards(students) {
    cardsContainer.innerHTML = '';

    if (!students || students.length === 0) {
        cardsContainer.innerHTML = `
            <div class="state-card">
                <i class="fa-regular fa-folder-open state-icon"></i>
                <p class="state-text">Belum ada data siswa yang tersimpan.</p>
            </div>
        `;
        return;
    }

    students.forEach((student) => {
        const initial = student.nama ? student.nama.charAt(0).toUpperCase() : 'S';
        const card = document.createElement('article');
        card.className = 'user-card';
        card.innerHTML = `
            <div>
                <div class="card-top">
                    <div class="avatar">${initial}</div>
                    <div class="card-actions">
                        <button class="btn-icon-sm edit" onclick="editStudent(${student.id})" title="Edit">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-sm delete" onclick="deleteStudent(${student.id})" title="Hapus">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h2>${escapeHTML(student.nama)}</h2>
                    <div class="student-info">
                        <p><strong>NIS:</strong> ${escapeHTML(student.nis)}</p>
                        <p><strong>Kelas:</strong> ${escapeHTML(student.kelas)}</p>
                        <p><strong>Jurusan:</strong> ${escapeHTML(student.jurusan)}</p>
                        <p><strong>Alamat:</strong> ${escapeHTML(student.alamat)}</p>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <span>ID Siswa: #${student.id}</span>
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}

studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = studentIdInput.value;
    const payload = {
        nama: namaInput.value.trim(),
        nis: nisInput.value.trim(),
        kelas: kelasInput.value.trim(),
        jurusan: jurusanInput.value.trim(),
        alamat: alamatInput.value.trim()
    };

    try {
        if (id) {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showAlert('Data siswa berhasil diperbarui!', 'success');
            } else {
                showAlert('Gagal memperbarui data siswa', 'error');
            }
        } else {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showAlert('Siswa baru berhasil ditambahkan!', 'success');
            } else {
                showAlert('Gagal menambahkan siswa', 'error');
            }
        }
        closeModal();
        fetchStudents();
    } catch (err) {
        showAlert('Terjadi kesalahan koneksi', 'error');
    }
});

async function editStudent(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const student = await res.json();

        // Mendukung objek tunggal langsung atau didalam wrapper { data: {...} }
        const data = student.data || student;

        studentIdInput.value = data.id;
        namaInput.value = data.nama;
        nisInput.value = data.nis;
        kelasInput.value = data.kelas;
        jurusanInput.value = data.jurusan;
        alamatInput.value = data.alamat;

        openModal('edit');
    } catch (err) {
        showAlert('Gagal mengambil detail siswa', 'error');
    }
}

async function deleteStudent(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showAlert('Data siswa berhasil dihapus!', 'error');
                fetchStudents();
            } else {
                showAlert('Gagal menghapus data', 'error');
            }
        } catch (err) {
            showAlert('Terjadi kesalahan koneksi', 'error');
        }
    }
}

function openModal(mode) {
    if (mode === 'add') {
        resetForm();
        formTitle.innerText = 'Tambah Siswa Baru';
    } else {
        formTitle.innerText = 'Edit Data Siswa';
    }
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    resetForm();
}

function resetForm() {
    studentForm.reset();
    studentIdInput.value = '';
}

function filterStudents() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = allStudentsData.filter(student =>
        student.nama.toLowerCase().includes(query) ||
        student.nis.toLowerCase().includes(query) ||
        student.kelas.toLowerCase().includes(query) ||
        student.jurusan.toLowerCase().includes(query)
    );
    renderCards(filtered);
}

function renderErrorState(message) {
    cardsContainer.innerHTML = `
        <div class="state-card">
            <i class="fa-solid fa-circle-exclamation state-icon" style="color: #e11d48;"></i>
            <p class="state-text">${message}</p>
        </div>
    `;
}

function showAlert(message, type) {
    alertBox.innerText = message;
    alertBox.className = `alert alert-${type}`;

    setTimeout(() => {
        alertBox.className = 'alert hidden';
    }, 3500);
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}