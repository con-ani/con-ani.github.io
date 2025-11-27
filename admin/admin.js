document.addEventListener('DOMContentLoaded', function () {
  // State
  let newsList = [];
  let quillEditor;

  // Elements
  const views = {
    dashboard: document.getElementById('view-dashboard'),
    'news-list': document.getElementById('view-news-list'),
    'news-add': document.getElementById('view-news-add'),
    'preview': document.getElementById('view-preview')
  };
  const navLinks = document.querySelectorAll('.nav-link[data-target]');
  const pageTitle = document.getElementById('page-title');

  // Form Elements
  const form = document.getElementById('news-form');
  const formTitle = document.getElementById('form-title');

  // --- Initialize Quill Editor ---
  quillEditor = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'お知らせの本文を入力してください...',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['link'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
      ]
    }
  });

  // --- Initialization ---
  loadData();
  setupNavigation();

  // --- Data Loading ---
  function loadData() {
    // Use global variable newsData from news.js
    if (typeof newsData !== 'undefined') {
      newsList = JSON.parse(JSON.stringify(newsData)); // Deep copy
      // Add status field to existing items if not present
      newsList.forEach(item => {
        if (!item.status) {
          item.status = 'published'; // Default to published for existing data
        }
      });
      // Sort by date desc
      newsList.sort((a, b) => {
        const dateA = new Date(a.date.replace(/\./g, '/'));
        const dateB = new Date(b.date.replace(/\./g, '/'));
        return dateB - dateA;
      });
      renderAll();
    } else {
      console.error('newsData is undefined');
      alert('データの読み込みに失敗しました。news.jsが正しく読み込まれているか確認してください。');
    }
  }

  // --- Navigation ---
  function setupNavigation() {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        navigateTo(target);
      });
    });
  }

  window.navigateTo = function (viewName, resetFormFlag = true) {
    // Update Sidebar Active State
    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === viewName) {
        link.classList.add('active');
        // Update Page Title based on link text
        pageTitle.textContent = link.textContent.trim();
      } else {
        link.classList.remove('active');
      }
    });

    // Show Target View
    Object.keys(views).forEach(key => {
      if (key === viewName) {
        views[key].classList.add('active');
      } else {
        views[key].classList.remove('active');
      }
    });

    // Special handling
    if (viewName === 'news-add' && resetFormFlag) {
      resetForm();
    } else if (viewName === 'preview') {
      pageTitle.textContent = 'プレビュー';
    }
  };

  // --- Rendering ---
  function renderAll() {
    renderDashboard();
    renderNewsList();
  }

  function renderDashboard() {
    const publishedCount = newsList.filter(item => item.status === 'published').length;
    const draftCount = newsList.filter(item => item.status === 'draft').length;

    document.getElementById('dash-total-count').textContent = newsList.length;
    document.getElementById('dash-published-count').textContent = publishedCount;
    document.getElementById('dash-draft-count').textContent = draftCount;
    document.getElementById('dash-last-date').textContent = newsList.length > 0 ? newsList[0].date : '-';

    const recentList = document.getElementById('dash-recent-list');
    recentList.innerHTML = '';
    newsList.slice(0, 5).forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
                <td>${item.date}</td>
                <td><span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:0.8em;">${item.category}</span></td>
                <td>${item.title}</td>
            `;
      recentList.appendChild(tr);
    });
  }

  function renderNewsList() {
    const listBody = document.getElementById('admin-news-list');
    listBody.innerHTML = '';
    newsList.forEach(item => {
      const tr = document.createElement('tr');
      const statusClass = item.status === 'published' ? 'status-published' : 'status-draft';
      const statusLabel = item.status === 'published' ? '公開' : '下書き';

      tr.innerHTML = `
                <td>${item.date}</td>
                <td>${item.category}</td>
                <td>${item.title}</td>
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="editItem(${item.id})"><i class="fas fa-edit"></i> 編集</button>
                    <button class="action-btn btn-delete" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i> 削除</button>
                </td>
            `;
      listBody.appendChild(tr);
    });
  }

  // --- CRUD Operations ---

  // Add/Update
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('news-id').value;
    const dateRaw = document.getElementById('news-date').value;
    const category = document.getElementById('news-category').value;
    const title = document.getElementById('news-title').value;
    const status = document.getElementById('news-status').value;
    const body = quillEditor.root.innerHTML; // Get HTML from Quill

    // Format date to YYYY.MM.DD
    const dateObj = new Date(dateRaw);
    const dateFormatted = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;

    if (id) {
      // Update
      const index = newsList.findIndex(item => item.id == id);
      if (index !== -1) {
        newsList[index] = {
          id: parseInt(id),
          date: dateFormatted,
          category,
          title,
          url: `news_detail.html?id=${id}`,
          status,
          body
        };
      }
      alert('記事を更新しました。');
    } else {
      // Add
      const newId = newsList.length > 0 ? Math.max(...newsList.map(n => n.id)) + 1 : 1;
      const newUrl = `news_detail.html?id=${newId}`;

      newsList.push({
        id: newId,
        date: dateFormatted,
        category,
        title,
        url: newUrl,
        status,
        body
      });
      alert('記事を追加しました。');
    }

    // Re-sort and Render
    newsList.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '/'));
      const dateB = new Date(b.date.replace(/\./g, '/'));
      return dateB - dateA;
    });
    renderAll();

    // Go back to list
    navigateTo('news-list');
  });

  // Edit
  window.editItem = function (id) {
    const item = newsList.find(n => n.id === id);
    if (!item) return;

    document.getElementById('news-id').value = item.id;
    document.getElementById('news-date').value = item.date.replace(/\./g, '-');
    document.getElementById('news-category').value = item.category;
    document.getElementById('news-title').value = item.title;
    document.getElementById('news-url').value = item.url;
    document.getElementById('news-status').value = item.status || 'published';

    // Set Quill content
    quillEditor.root.innerHTML = item.body || '';

    formTitle.textContent = 'お知らせを編集';

    // Switch to Add View
    navigateTo('news-add');
  };

  // Delete
  window.deleteItem = function (id) {
    if (!confirm('本当にこの記事を削除しますか？')) return;
    newsList = newsList.filter(n => n.id !== id);
    renderAll();
  };

  // Reset Form
  function resetForm() {
    form.reset();
    document.getElementById('news-id').value = '';
    formTitle.textContent = '新規投稿を作成';

    // Clear Quill editor
    quillEditor.setContents([]);

    // Calculate next ID for display purposes
    const nextId = newsList.length > 0 ? Math.max(...newsList.map(n => n.id)) + 1 : 1;
    document.getElementById('news-url').value = `news_detail.html?id=${nextId} (自動生成)`;

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('news-date').value = today;

    // Default status to draft
    document.getElementById('news-status').value = 'draft';
  }

  // --- Preview Functionality ---
  window.showPreview = function () {
    const date = document.getElementById('news-date').value;
    const category = document.getElementById('news-category').value;
    const title = document.getElementById('news-title').value;
    const body = quillEditor.root.innerHTML;

    // Format date for preview
    const dateObj = new Date(date);
    const dateFormatted = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;

    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #eee;">
          <span style="background: #d4a373; color: white; padding: 5px 15px; border-radius: 4px; font-size: 0.9rem; font-weight: 600;">${category}</span>
          <span style="color: #666; font-size: 0.95rem;">${dateFormatted}</span>
        </div>
        <h1 style="font-size: 2rem; margin-bottom: 30px; line-height: 1.4; color: #333;">${title || '（タイトル未入力）'}</h1>
        <div style="line-height: 1.8; color: #444; font-size: 1rem;">
          ${body || '<p style="color: #999;">本文が入力されていません。</p>'}
        </div>
      </div>
    `;

    navigateTo('preview');
  };

  // --- Download JSON (as JS) ---
  document.getElementById('btn-download').addEventListener('click', function () {
    const dataStr = "const newsData = " + JSON.stringify(newsList, null, 4) + ";";
    const blob = new Blob([dataStr], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'news.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('news.js がダウンロードされました。\nプロジェクトの data フォルダにある news.js を上書きしてください。');
  });
});
