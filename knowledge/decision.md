# 技術決策紀錄

## 已決定

### 以使用者提供的 repo 作為專案遠端
- **決定：** 使用公開 repo `ccshfaaa/wall`。
- **依據：** 使用者提供了該 repo URL，repo 存在且有管理／推送權限。
- **影響範圍：** 場景程式、說明文件與 Pages workflow 都以此 repo 為發布來源。

### 使用免建置的靜態 Three.js 原型
- **決定：** HTML 以 ES module 從 jsDelivr 載入 Three.js，GitHub Actions 將 repo 根目錄直接部署。
- **依據：** 目前只有少量程式碼，免去 bundler 可簡化 Pages 初版發布。
- **適用範圍：** 目前原型；若未來加入大型資產、離線要求或套件管理，再評估切換 Vite。

## 待完成的外部設定（已有使用者確認）

### GitHub Pages 發布來源
- **推薦：** 在 `ccshfaaa/wall` 的 Settings → Pages → Build and deployment 將 Source 設為 GitHub Actions，接著重新執行 workflow。
- **理由：** 目前 workflow 使用官方 `configure-pages`、`upload-pages-artifact` 和 `deploy-pages` actions；首次啟用 Pages 需要管理權限。GitHub connector 沒有 Pages 設定寫入操作，瀏覽器工作階段也未登入，因此此設定尚未完成。
- **狀態：** 使用者已明確確認要切換；等待可操作的已登入 GitHub 設定工作階段或管理權限 API。

