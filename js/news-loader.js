document.addEventListener('DOMContentLoaded', function () {
  const newsList = document.getElementById('news-list');
  if (!newsList) return;

  // Use global variable newsData if available
  if (typeof newsData === 'undefined') {
    newsList.innerHTML = '<li class="news__item">お知らせデータの読み込みに失敗しました。</li>';
    return;
  }

  const data = newsData;

  // Filter only published articles
  const publishedData = data.filter(item => !item.status || item.status === 'published');

  // Sort by date descending (newest first)
  publishedData.sort((a, b) => {
    const dateA = new Date(a.date.replace(/\./g, '/'));
    const dateB = new Date(b.date.replace(/\./g, '/'));
    return dateB - dateA;
  });

  newsList.innerHTML = ''; // Clear loading state or existing content

  publishedData.forEach(item => {
    const li = document.createElement('li');
    li.className = 'news__item';

    li.innerHTML = `
                    <span class="news__date">${item.date}</span>
                    <span class="news__cat">${item.category}</span>
                    <a href="${item.url}" class="news__link">${item.title}</a>
                `;

    newsList.appendChild(li);
  });
});
