# 我的學習入口

線上網址：https://tuanzilee.github.io/learning-hub/

六個網站入口：德文、心理學實驗法、心理測驗、認知神經科學、畢業學分儀表板、社會學報告。手機單欄、寬螢幕雙欄。

## 課程與評量進度

- `syllabus.json`：五門課的課綱摘要，只含課名、授課星期、主題與週次；不包含個人學習紀錄。
- `assessments.json`：已核對的評量日期，公告與使用者確認優先。未確認的範圍／時刻須標明。
- `update_progress.py`：產生 `dist/progress.json`，以台灣日期計算週次。
- `dist/progress.js`：顯示本週課綱進度與評量倒數，每分鐘及返回頁面時讀取新資料。
- `.github/workflows/pages.yml`：push 或手動執行時部署；另在每天台灣時間凌晨 02:00 自動產生進度並部署。GitHub 排程可能排隊延遲，頁面顯示實際更新時間。

課綱第一週起於 2026-09-14。本週主題是預定進度，不代表已實際授課或個人完成狀態。初始評量核對至 2026-10-14，德文考試日期依課綱週次換算；自動更新日期與週次不代表重新查閱老師公告。

## 本機使用

產生進度：`python3 update_progress.py`。

指定另一份課綱：`python3 update_progress.py --syllabus /path/to/syllabus.json`。

預覽：`python3 -m http.server 8770 --bind 127.0.0.1 --directory dist`。

## 維護授權

hai 已確認首次公開發布。日後改動原始碼、同步新公告或資料並 push 前，仍須先取得 hai 的當次確認；GitHub 已設定的每日定期部署只重新產生既有課綱／評量清單的日期進度，不修改遠端原始碼，也不增加公開內容來源。
