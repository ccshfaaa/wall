# 《勞山道士》互動水墨場景計畫

## 願景
製作一個取材自《勞山道士》的互動式 3D 水墨場景，呈現王七在道觀牆前學習穿牆術。作品以自適應網頁呈現，主要畫面比例為 16:9。場景具有前後層次與立體感；觀者可用滑鼠上下、左右環繞並縮放視角，但不可平移鏡頭或移動場景。初始視角朝向王七與牆，旋轉約 90 度後可看到道士。王七和道士後方安排竹子與遠山，另一側呈現道觀；背景需自然銜接，王七撞上的牆需與道觀相連。整體以墨色濃淡、留白營造清幽而略帶幽默的氣氛。

## 路線圖

### 目前狀態
- 已完成初版網頁 3D 場景與滑鼠環繞、縮放操作。
- 已建立 GitHub Actions Pages 部署 workflow。
- GitHub repository `ccshfaaa/wall` 已建立並同步專案檔案。
- 已建立 `knowledge/experience.md` 與 `knowledge/decision.md`，記錄可重用實作經驗和 Pages 設定建議。
- 已在 `work/wall` clone 建立 knowledge 文件的本機 commit；目前 GitHub connector 可讀寫 repo，但本機 Git 缺少 push 憑證，commit 尚未由 `git push` 推上去。
- Pages 的發布來源與首次部署仍待設定和確認。
- 場景角色與環境目前由幾何模型組成，是可互動原型，仍需視覺打磨。

### 已完成
- [x] 選定「王七在道觀牆前學穿牆術」題材與水墨風格。
- [x] 決定自適應網頁，主要畫面比例 16:9。
- [x] 設計場景關係：初始看王七與牆，旋轉約 90 度看見道士；後方有竹子、遠山和道觀，牆連接道觀，背景自然銜接。
- [x] 建立 Three.js 互動場景原型與固定焦點的環繞縮放控制，停用平移。
- [x] 建立 GitHub Actions workflow，自 main 分支部署靜態檔案至 GitHub Pages。
- [x] 撰寫本機預覽與 Pages 設定說明。
- [x] 建立經驗紀錄，註明未來可用的範圍。
- [x] 建立決策紀錄，為 Pages 設定列出推薦方案和目前阻礙。
- [x] 建立 `work/wall` 本機 clone，為 knowledge 文件建立 Git commit。

### 待完成
- [x] 建立 GitHub repository `ccshfaaa/wall` 並同步專案檔案。
- [ ] 將本機 Git commit 推送到 `origin/main`；目前環境缺少可用的 GitHub push 憑證。
- [ ] 在 repository 設定 Pages 使用 GitHub Actions。
- [ ] 確認 Actions 部署成功並取得公開頁面網址。
- [ ] 檢視不同螢幕大小與鏡頭角度，調整場景層次、背景銜接和互動手感。
- [ ] 以更完整的角色造型和水墨材質打磨目前幾何原型。

