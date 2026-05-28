/* ============================================================
   ЭкоПотолкиСПБ — premier.js
   Логика закрытого раздела «Премьер»
   ============================================================ */

'use strict';

/* ===== GUARD: проверяем сессию при входе ===== */
(function () {
  if (sessionStorage.getItem('premier_access') !== '1') {
    // Нет авторизации — возвращаем на главную
    window.location.replace('index.html');
  }
})();


/* ===== ДОКУМЕНТЫ (можно добавлять вручную) ===== */
/*
  Чтобы добавить документ — добавьте объект в нужный массив:
  {
    name: 'Название файла',
    ext:  'pdf',          // pdf | xlsx | docx | img | zip | txt
    date: '28.05.2025',
    size: '1.2 МБ',
    url:  'files/document.pdf'   // путь к файлу
  }
*/

const DOCUMENTS = {
  price: [
    // { name: 'Прайс-лист 2025', ext: 'xlsx', date: '01.05.2025', size: '48 КБ', url: 'files/price-2025.xlsx' },
  ],
  tech: [
    // { name: 'Инструкция по монтажу', ext: 'pdf', date: '15.03.2025', size: '2.4 МБ', url: 'files/install-guide.pdf' },
  ],
  contracts: [
    // { name: 'Договор подряда (шаблон)', ext: 'docx', date: '10.01.2025', size: '86 КБ', url: 'files/contract-template.docx' },
  ],
  suppliers: [
    // { name: 'Каталог PolyGreen 2025', ext: 'pdf', date: '20.04.2025', size: '8.1 МБ', url: 'files/polygreen-catalog.pdf' },
  ],
  reports: [
    // { name: 'Отчёт апрель 2025', ext: 'xlsx', date: '02.05.2025', size: '120 КБ', url: 'files/report-apr-2025.xlsx' },
  ],
  other: [
    // { name: 'Фото объектов', ext: 'zip', date: '25.05.2025', size: '45 МБ', url: 'files/photos.zip' },
  ],
};

const EXT_LABELS = {
  pdf:  'PDF',
  xlsx: 'XLS',
  docx: 'DOC',
  img:  'IMG',
  zip:  'ZIP',
  txt:  'TXT',
};


/* ===== РЕНДЕР ДОКУМЕНТОВ ===== */
function renderDocs() {
  const mapping = {
    price:     'list-price',
    tech:      'list-tech',
    contracts: 'list-contracts',
    suppliers: 'list-suppliers',
    reports:   'list-reports',
    other:     'list-other',
  };

  let totalDocs = 0;

  Object.entries(mapping).forEach(([key, elId]) => {
    const list = document.getElementById(elId);
    if (!list) return;
    const docs = DOCUMENTS[key] || [];
    totalDocs += docs.length;

    if (!docs.length) return; // оставляем пустой state

    list.innerHTML = docs.map(doc => `
      <a href="${doc.url || '#'}" class="premier-doc-item" ${doc.url ? 'download' : 'onclick="return false"'} title="${doc.name}">
        <div class="premier-doc-item__ext ext--${doc.ext || 'txt'}">
          ${EXT_LABELS[doc.ext] || doc.ext?.toUpperCase() || 'FILE'}
        </div>
        <div class="premier-doc-item__info">
          <span class="premier-doc-item__name">${doc.name}</span>
          <span class="premier-doc-item__meta">${doc.date || ''}${doc.size ? ' · ' + doc.size : ''}</span>
        </div>
        <svg class="premier-doc-item__dl" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </a>
    `).join('');
  });

  const countEl = document.getElementById('docCount');
  if (countEl) countEl.textContent = totalDocs;
}


/* ===== ЗАМЕТКИ (сохраняются в localStorage) ===== */
const NOTES_KEY = 'premier_notes';

function loadPremierNotes() {
  const ta = document.getElementById('premierNotes');
  if (ta) ta.value = localStorage.getItem(NOTES_KEY) || '';
}

let notesSaveTimer = null;

window.savePremierNotes = function () {
  const ta = document.getElementById('premierNotes');
  const saved = document.getElementById('notesSaved');
  if (!ta) return;
  clearTimeout(notesSaveTimer);
  notesSaveTimer = setTimeout(() => {
    localStorage.setItem(NOTES_KEY, ta.value);
    if (saved) {
      saved.classList.add('visible');
      setTimeout(() => saved.classList.remove('visible'), 2000);
    }
  }, 600);
};

window.clearPremierNotes = function () {
  if (!confirm('Очистить все заметки?')) return;
  const ta = document.getElementById('premierNotes');
  if (ta) ta.value = '';
  localStorage.removeItem(NOTES_KEY);
};


/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  renderDocs();
  loadPremierNotes();
});
