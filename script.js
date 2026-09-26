const API_URL = 'http://localhost:3000/api/siswa';

const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const namaInput = document.getElementById('nama');
const nisInput = document.getElementById('nis');
const kelasInput = document.getElementById('kelas');
const jurusanInput = document.getElementById('jurusan');
const alamatInput = document.getElementById('alamat');
const fotoInput = document.getElementById('foto');

const cardsContainer = document.getElementById('student-cards-container');
const totalStudentsEl = document.getElementById('total-students');
const alertBox = document.getElementById('alert');
const formTitle = document.getElementById('form-title');
const modal = document.getElementById('student-modal');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const iconReload = document.getElementById('icon-reload');

let allStudentsData = [];
let filteredStudents = [];
let currentPage = 1;
const studentsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
    loadDarkMode();
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

    if (iconReload) {
        iconReload.classList.add('fa-spin');
    }

    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error('Gagal mengambil data');
        }

        const data = await res.json();

        const studentsList = Array.isArray(data)
            ? data
            : (data.data || []);

        allStudentsData = studentsList;
        filteredStudents = [...allStudentsData];

        totalStudentsEl.textContent = allStudentsData.length;

        generateClassFilter();

        currentPage = 1;

        renderCards();
    } catch (err) {
        renderErrorState('Gagal mengambil data siswa dari server');
    } finally {
        if (iconReload) {
            iconReload.classList.remove('fa-spin');
        }
    }
}

function renderCards() {
    cardsContainer.innerHTML = '';

    if (!filteredStudents || filteredStudents.length === 0) {
        cardsContainer.innerHTML = `
            <div class="state-card">
                <i class="fa-regular fa-folder-open state-icon"></i>
                <p class="state-text">
                    Data siswa tidak ditemukan.
                </p>
            </div>
        `;

        renderPagination();

        return;
    }

    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;

    const studentsToShow = filteredStudents.slice(
        startIndex,
        endIndex
    );

    studentsToShow.forEach((student) => {
        const initial = student.nama
            ? student.nama.charAt(0).toUpperCase()
            : 'S';

        const card = document.createElement('article');

        card.className = 'user-card';

        const avatar = student.foto
            ? `
                <img
                    src="${escapeHTML(student.foto)}"
                    class="avatar-photo"
                    alt="Foto ${escapeHTML(student.nama)}"
                >
            `
            : `
                <div class="avatar">
                    ${initial}
                </div>
            `;

        card.innerHTML = `
            <div>
                <div class="card-top">
                    ${avatar}

                    <div class="card-actions">
                        <button
                            class="btn-icon-sm edit"
                            onclick="editStudent(${student.id})"
                            title="Edit"
                        >
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button
                            class="btn-icon-sm delete"
                            onclick="deleteStudent(${student.id})"
                            title="Hapus"
                        >
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>

                <div class="card-body">
                    <h2>
                        ${escapeHTML(student.nama)}
                    </h2>

                    <div class="student-info">
                        <p>
                            <strong>NIS:</strong>
                            ${escapeHTML(student.nis)}
                        </p>

                        <p>
                            <strong>Kelas:</strong>
                            ${escapeHTML(student.kelas)}
                        </p>

                        <p>
                            <strong>Jurusan:</strong>
                            ${escapeHTML(student.jurusan)}
                        </p>

                        <p>
                            <strong>Alamat:</strong>
                            ${escapeHTML(student.alamat)}
                        </p>
                    </div>
                </div>
            </div>

            <div class="card-footer">
                <span>
                    ID Siswa: #${student.id}
                </span>
            </div>
        `;

        cardsContainer.appendChild(card);
    });

    renderPagination();
}

function filterStudents() {
    const searchInput = document.getElementById('search-input');
    const classFilter = document.getElementById('class-filter');

    const query = searchInput.value.toLowerCase().trim();
    const selectedClass = classFilter.value;

    filteredStudents = allStudentsData.filter(student => {
        const matchesSearch =
            String(student.nama || '')
                .toLowerCase()
                .includes(query) ||
            String(student.nis || '')
                .toLowerCase()
                .includes(query) ||
            String(student.kelas || '')
                .toLowerCase()
                .includes(query) ||
            String(student.jurusan || '')
                .toLowerCase()
                .includes(query);

        const matchesClass =
            selectedClass === '' ||
            student.kelas === selectedClass;

        return matchesSearch && matchesClass;
    });

    currentPage = 1;

    renderCards();
}

function generateClassFilter() {
    const classFilter =
        document.getElementById('class-filter');

    const classes = [
        ...new Set(
            allStudentsData
                .map(student => student.kelas)
                .filter(Boolean)
        )
    ];

    classFilter.innerHTML =
        '<option value="">Semua Kelas</option>';

    classes.sort().forEach(kelas => {
        const option = document.createElement('option');

        option.value = kelas;
        option.textContent = kelas;

        classFilter.appendChild(option);
    });
}

function renderPagination() {
    const pagination =
        document.getElementById('pagination');

    pagination.innerHTML = '';

    const totalPages = Math.ceil(
        filteredStudents.length / studentsPerPage
    );

    if (totalPages <= 1) {
        return;
    }

    const previousButton =
        document.createElement('button');

    previousButton.innerHTML =
        '<i class="fa-solid fa-chevron-left"></i>';

    previousButton.disabled = currentPage === 1;

    previousButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderCards();
        }
    };

    pagination.appendChild(previousButton);

    for (let page = 1; page <= totalPages; page++) {
        const button =
            document.createElement('button');

        button.textContent = page;

        if (page === currentPage) {
            button.classList.add('active');
        }

        button.onclick = () => {
            currentPage = page;
            renderCards();
        };

        pagination.appendChild(button);
    }

    const nextButton =
        document.createElement('button');

    nextButton.innerHTML =
        '<i class="fa-solid fa-chevron-right"></i>';

    nextButton.disabled =
        currentPage === totalPages;

    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderCards();
        }
    };

    pagination.appendChild(nextButton);
}

function validateForm() {
    const nama = namaInput.value.trim();
    const nis = nisInput.value.trim();
    const kelas = kelasInput.value.trim();
    const jurusan = jurusanInput.value.trim();
    const alamat = alamatInput.value.trim();

    if (!nama) {
        showAlert('Nama siswa wajib diisi!', 'error');
        namaInput.focus();
        return false;
    }

    if (!nis) {
        showAlert('NIS wajib diisi!', 'error');
        nisInput.focus();
        return false;
    }

    if (!kelas) {
        showAlert('Kelas wajib diisi!', 'error');
        kelasInput.focus();
        return false;
    }

    if (!jurusan) {
        showAlert('Jurusan wajib diisi!', 'error');
        jurusanInput.focus();
        return false;
    }

    if (!alamat) {
        showAlert('Alamat wajib diisi!', 'error');
        alamatInput.focus();
        return false;
    }

    if (fotoInput.files.length > 0) {
        const file = fotoInput.files[0];

        if (!file.type.startsWith('image/')) {
            showAlert(
                'File foto harus berupa gambar!',
                'error'
            );

            fotoInput.focus();

            return false;
        }

        if (file.size > 2 * 1024 * 1024) {
            showAlert(
                'Ukuran foto maksimal 2 MB!',
                'error'
            );

            fotoInput.focus();

            return false;
        }
    }

    return true;
}

studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const id = studentIdInput.value;

    const payload = {
        nama: namaInput.value.trim(),
        nis: nisInput.value.trim(),
        kelas: kelasInput.value.trim(),
        jurusan: jurusanInput.value.trim(),
        alamat: alamatInput.value.trim()
    };

    const saveButton =
        document.getElementById('btn-save');

    saveButton.disabled = true;

    saveButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

    try {
        let res;

        if (id) {
            res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        }

        if (!res.ok) {
            throw new Error('Gagal menyimpan data');
        }

        showAlert(
            id
                ? 'Data siswa berhasil diperbarui!'
                : 'Siswa baru berhasil ditambahkan!',
            'success'
        );

        closeModal();

        fetchStudents();
    } catch (err) {
        showAlert(
            'Terjadi kesalahan saat menyimpan data.',
            'error'
        );
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = 'Simpan Data';
    }
});

async function editStudent(id) {
    try {
        const res =
            await fetch(`${API_URL}/${id}`);

        if (!res.ok) {
            throw new Error();
        }

        const student =
            await res.json();

        const data =
            student.data || student;

        studentIdInput.value = data.id;
        namaInput.value = data.nama || '';
        nisInput.value = data.nis || '';
        kelasInput.value = data.kelas || '';
        jurusanInput.value = data.jurusan || '';
        alamatInput.value = data.alamat || '';

        openModal('edit');
    } catch (err) {
        showAlert(
            'Gagal mengambil detail siswa',
            'error'
        );
    }
}

async function deleteStudent(id) {
    if (
        !confirm(
            'Apakah Anda yakin ingin menghapus data siswa ini?'
        )
    ) {
        return;
    }

    try {
        const res =
            await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

        if (!res.ok) {
            throw new Error();
        }

        showAlert(
            'Data siswa berhasil dihapus!',
            'success'
        );

        fetchStudents();
    } catch (err) {
        showAlert(
            'Gagal menghapus data siswa',
            'error'
        );
    }
}

function openModal(mode) {
    if (mode === 'add') {
        resetForm();
        formTitle.innerText =
            'Tambah Siswa Baru';
    } else {
        formTitle.innerText =
            'Edit Data Siswa';
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

    const preview =
        document.getElementById('photo-preview');

    const image =
        document.getElementById('preview-image');

    if (preview) {
        preview.classList.add('hidden');
    }

    if (image) {
        image.src = '';
    }
}g

function previewPhoto(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        showAlert(
            'File harus berupa gambar!',
            'error'
        );

        fotoInput.value = '';

        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showAlert(
            'Ukuran foto maksimal 2 MB!',
            'error'
        );

        fotoInput.value = '';

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function(e) {
        const preview =
            document.getElementById(
                'photo-preview'
            );

        const image =
            document.getElementById(
                'preview-image'
            );

        image.src =
            e.target.result;

        preview.classList.remove(
            'hidden'
        );
    };

    reader.readAsDataURL(file);
}

function toggleDarkMode() {
    document.body.classList.toggle(
        'dark-mode'
    );

    const isDark =
        document.body.classList.contains(
            'dark-mode'
        );

    localStorage.setItem(
        'darkMode',
        isDark
    );

    updateDarkModeIcon();
}

function loadDarkMode() {
    const darkMode =
        localStorage.getItem(
            'darkMode'
        );

    if (darkMode === 'true') {
        document.body.classList.add(
            'dark-mode'
        );
    }

    updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const icon =
        document.getElementById(
            'dark-mode-icon'
        );

    if (!icon) {
        return;
    }

    const isDark =
        document.body.classList.contains(
            'dark-mode'
        );

    icon.className = isDark
        ? 'fa-solid fa-sun'
        : 'fa-solid fa-moon';
}

function showAlert(message, type) {
    alertBox.innerText = message;

    alertBox.className =
        `alert alert-${type}`;

    setTimeout(() => {
        alertBox.className =
            'alert hidden';
    }, 3500);
}

function renderErrorState(message) {
    cardsContainer.innerHTML = `
        <div class="state-card">
            <i class="fa-solid fa-circle-exclamation state-icon"></i>
            <p class="state-text">
                ${escapeHTML(message)}
            </p>
        </div>
    `;
}

function escapeHTML(str) {
    if (!str) {
        return '';
    }

    return String(str).replace(
        /[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}