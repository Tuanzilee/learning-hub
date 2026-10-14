(() => {
  const $ = id => document.getElementById(id);
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year:'numeric', month:'2-digit', day:'2-digit' });
  function taipeiDate() {
    const parts = Object.fromEntries(day.formatToParts(new Date()).map(p => [p.type,p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  const dateLabel = d => `${Number(d.slice(5,7))}/${Number(d.slice(8,10))}`;
  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function eventRow(event, today) {
    const li = document.createElement('li');
    const top = element('div','', 'row-top');
    top.append(element('strong',event.course));
    const days = Math.round((Date.parse(event.date+'T00:00:00+08:00') - Date.parse(today+'T00:00:00+08:00')) / 86400000);
    top.append(element('span', days === 0 ? '今天' : days === 1 ? '明天' : `還有 ${days} 天`, days < 8 ? 'countdown' : ''));
    li.append(top, element('p', `${dateLabel(event.date)}${event.time ? ' '+event.time : ''} · ${event.title}`));
    if (event.detail) li.append(element('small',event.detail));
    return li;
  }
  async function refresh() {
    try {
      const response = await fetch('progress.json', {cache:'no-store'});
      if (!response.ok) throw new Error('資料載入失敗');
      const data = await response.json();
      const today = taipeiDate();
      const generated = new Intl.DateTimeFormat('zh-TW', {timeZone:'Asia/Taipei', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).format(new Date(data.generatedAt));
      $('update-time').textContent = `更新：${generated}`;
      $('week-label').textContent = data.week >= 1 && data.week <= data.totalWeeks ? `本週課程 · 第 ${data.week} 週` : '課程進度 · 學期外';
      $('course-progress').replaceChildren(...data.courses.map(course => {
        const li = document.createElement('li');
        const top = element('div','','row-top');
        top.append(element('strong',course.name),element('span',course.date ? dateLabel(course.date) : ''));
        li.append(top,element('p',course.topic));
        if (course.detail) li.append(element('small',course.detail));
        return li;
      }));
      const upcoming = data.events.filter(event => event.date >= today);
      $('upcoming-events').replaceChildren(...upcoming.slice(0,5).map(event=>eventRow(event,today)));
      if (!upcoming.length) $('upcoming-events').append(element('li','目前沒有已知的後續評量日期。'));
      $('later-events').replaceChildren(...upcoming.slice(5).map(event=>eventRow(event,today)));
      $('more-events').hidden = upcoming.length <= 5;
      $('progress-note').textContent = `依課綱與已核對公告整理，評量資料核對至 ${dateLabel(data.verifiedOn)}。${data.asOf < today ? '資料尚未更新至今天。' : ''}`;
    } catch (error) {
      $('update-time').textContent = '進度暫時無法載入';
      $('progress-note').textContent = '請重新整理頁面；已知課程連結仍可使用。';
    }
  }
  refresh();
  // 開著的頁面也會取得凌晨更新後的新資料；日期計算固定採台灣時間。
  setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
