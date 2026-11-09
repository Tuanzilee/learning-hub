(() => {
  const $ = id => document.getElementById(id);
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year:'numeric', month:'2-digit', day:'2-digit' });
  function taipeiDate() {
    const parts = Object.fromEntries(day.formatToParts(new Date()).map(p => [p.type,p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  const dateLabel = d => `${Number(d.slice(5,7))}/${Number(d.slice(8,10))}`;
  const addDays = (date, days) => new Date(Date.parse(date+'T00:00:00Z') + days*86400000).toISOString().slice(0,10);
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
    if (event.date) {
      const days = Math.round((Date.parse(event.date+'T00:00:00+08:00') - Date.parse(today+'T00:00:00+08:00')) / 86400000);
      top.append(element('span', days < 0 ? `已過 ${-days} 天` : days === 0 ? '今天' : days === 1 ? '明天' : `還有 ${days} 天`, days < 8 ? 'countdown' : ''));
      li.append(top, element('p', `${dateLabel(event.date)}${event.time ? ' '+event.time : ''} · ${event.title}`));
    } else {
      top.append(element('span', event.status === 'postponed' ? '已順延' : '日期待確認'));
      li.append(top, element('p',event.title), element('small',event.timingNote));
    }
    if (event.detail) li.append(element('small',event.detail));
    return li;
  }
  async function refresh() {
    try {
      const response = await fetch('progress.json', {cache:'no-store'});
      if (!response.ok) throw new Error('資料載入失敗');
      const data = await response.json();
      const today = taipeiDate();
      const week = Math.floor((Date.parse(today+'T00:00:00Z') - Date.parse(data.week1Monday+'T00:00:00Z')) / 604800000) + 1;
      const monday = addDays(data.week1Monday, (week-1)*7);
      const friday = addDays(monday, 4);
      const generated = new Intl.DateTimeFormat('zh-TW', {timeZone:'Asia/Taipei', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).format(new Date(data.generatedAt));
      $('update-time').textContent = `更新：${generated}`;
      $('week-label').textContent = week >= 1 && week <= data.totalWeeks ? `本週課程 · W${week}（${dateLabel(monday)}–${dateLabel(friday)}）` : '課程進度 · 學期外';
      $('course-progress').replaceChildren(...data.courses.map(course => {
        const item = (course.weeks || []).find(item => item.n === week);
        const lessonDate = course.weekday && week >= 1 && week <= data.totalWeeks ? addDays(monday, course.weekday-1) : null;
        const li = document.createElement('li');
        const top = element('div','','row-top');
        top.append(element('strong',course.name),element('span',lessonDate ? dateLabel(lessonDate) : ''));
        li.append(top,element('p',item ? item.topic : course.defaultTopic));
        if (item && item.detail) li.append(element('small',item.detail));
        if (course.notice) {
          const archive = element('details','');
          archive.append(element('summary','已核對公告'),element('small',course.notice,'course-notice'));
          li.append(archive);
        }
        if (course.noticeUrl) {
          const source = element('a','查看公告','source-link');
          source.href = course.noticeUrl;
          li.append(source);
        }
        return li;
      }));
      const upcoming = data.events.filter(event => event.date && event.date >= monday).sort((a,b)=>a.date.localeCompare(b.date));
      const thisWeek = upcoming.filter(event => event.date <= addDays(monday,6));
      const later = upcoming.filter(event => event.date > addDays(monday,6));
      const pending = data.events.filter(event => !event.date);
      $('events-label').textContent = `本週考試與作業 · W${week}`;
      $('upcoming-events').replaceChildren(...thisWeek.map(event=>eventRow(event,today)));
      if (!thisWeek.length) $('upcoming-events').append(element('li','本週沒有已確認日期的評量。'));
      $('later-events').replaceChildren(...later.map(event=>eventRow(event,today)));
      $('more-events').hidden = !later.length;
      $('pending-events').replaceChildren(...pending.map(event=>eventRow(event,today)));
      $('pending-block').hidden = !pending.length;
      $('pending-label').textContent = `日期待確認（${pending.length}）`;
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
