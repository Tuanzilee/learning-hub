# 我的學習入口

六個網站：德文、心理學實驗法、心理測驗、認知神經科學、學分儀表板、社會學報告。無框架、無相依套件，手機單欄、寬螢幕雙欄。

## 進度資料

- `dist/index.html`：入口頁。
- `dist/progress.js`：讀取進度、以台灣日期顯示評量倒數；每分鐘與回到頁面時重新讀取。
- `assessments.json`：已核對的評量清單，最新公告與使用者確認優先。日期或範圍改動需明確來源。
- `update_progress.py`：讀取本機 `/Users/tuanzi/Desktop/course/data/syllabus.json` 與評量清單，產出 `dist/progress.json`。不讀取或發布個人學習紀錄。
- 課程週次採課綱週一 2026-09-14 起算。本週進度是課綱預定進度，不代表實際完成狀態。
- 初始評量來源：`100_Todo/projects/2026-10-14_期中考與作業期程比對.md`；德文考試日期依課綱週次換算。

每天台灣时间凌晨 02:00 的 Codex 排程更新本機版本；不要擅自建立公開 repo 或推送。新入口頁與定期公開部署需另取得 hai 授權。

執行：`python3 update_progress.py`。
預覽：`python3 -m http.server 8770 --bind 127.0.0.1 --directory dist`。

已核對六個連結與日期／週次邊界；尚未公開部署。
