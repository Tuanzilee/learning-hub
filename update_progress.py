"""從既有課綱與已核對的評量清單產生入口頁資料，不讀取或發布個人學習紀錄。"""
import argparse
import json
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
SYLLABUS = ROOT / 'syllabus.json'
SELECTED = {
    '外國語文（基礎德文）': '德文複習',
    '心理學實驗法': '心理學實驗法',
    '心理測驗': '心理測驗',
    '認知神經科學導論': '認知神經科學',
    '社會學': '社會學報告',
}


def build(today, now, syllabus_path=SYLLABUS):
    syllabus = json.loads(syllabus_path.read_text())
    assessments = json.loads((ROOT / 'assessments.json').read_text())
    start = date.fromisoformat(syllabus['meta']['week1Monday'])
    week = (today - start).days // 7 + 1
    total = syllabus['meta']['weeks']
    courses = []
    rows = syllabus['courses']
    if isinstance(rows, dict):
        rows = rows.values()
    for original, label in SELECTED.items():
        course = next(c for c in rows if c['name'] == original)
        item = next((w for w in course['weeks'] if w['n'] == week), None)
        lesson_date = start + timedelta(weeks=week - 1, days=course['weekday'] - 1)
        courses.append({
            'name': label, 'date': lesson_date.isoformat() if 1 <= week <= total else None,
            'topic': item['topic'] if item else '本週沒有已知課綱進度',
            'detail': item.get('detail', '') if item else '',
            'source': '課堂更新' if course.get('source') == '交接檔' else '課綱進度',
            'sourceUpdated': course.get('updated', ''),
        })
    events = sorted(assessments['events'], key=lambda e: (e['date'], e.get('time', '')))
    for event in events:
        assert event['course'] in SELECTED.values()
        date.fromisoformat(event['date'])
    return {
        'generatedAt': now.isoformat(timespec='minutes'), 'asOf': today.isoformat(),
        'timezone': 'Asia/Taipei', 'week': week, 'totalWeeks': total,
        'verifiedOn': assessments['verifiedOn'], 'courses': courses,
        'events': events,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', help='指定日期供核對，格式 YYYY-MM-DD')
    parser.add_argument('--check', action='store_true', help='僅檢查，不寫入檔案')
    parser.add_argument('--syllabus', type=Path, default=SYLLABUS, help='課綱來源，預設為專案內的公開課綱摘要')
    args = parser.parse_args()
    now = datetime.now(ZoneInfo('Asia/Taipei'))
    today = date.fromisoformat(args.date) if args.date else now.date()
    result = build(today, now, args.syllabus)
    if not args.check:
        target = ROOT / 'dist/progress.json'
        temp = target.with_suffix('.tmp')
        temp.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        temp.replace(target)
    print(f"{today}：第 {result['week']} 週，{len(result['courses'])} 門課，{len(result['events'])} 筆評量。")
