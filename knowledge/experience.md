# 實作經驗

## 靜態 Three.js 場景部署到 GitHub Pages

- **經驗：** 對不需要編譯的 Three.js 小型互動場景，可用 `index.html`、ES module 和相對路徑組成靜態網站，GitHub Actions 直接上傳 repo 根目錄作為 Pages artifact。
- **適用範圍：** 不需 bundler、資產量小、可接受載入 CDN 套件的展示原型或作品集。
- **留意事項：** ES module 和 CDN 需要瀏覽器網路連線；若加入大型資產、離線需求或套件管理，再改用 Vite 等建置流程。

## 固定場景的環繞鏡頭

- **經驗：** 以球座標保存相機與固定 target 的距離、水平角、垂直角，再用 `lookAt(target)` 更新相機，可提供環繞與縮放而不提供平移。限制垂直角和距離可避免翻轉或穿越物件。
- **適用範圍：** 小型展示台、模型檢視器、固定場景導覽；若需自由漫遊，才改成可平移或第一人稱控制。
- **操作細節：** 指標拖曳控制方位與仰角，滾輪只改變半徑；觸控支援、鍵盤無障礙操作需另外規劃。

## Three.js 物件建立函式的回傳值

- **經驗：** `Object3D.scale.set()` 回傳的是向量，不是原本的 mesh。若 helper 需要讓呼叫端繼續設定 `rotation`、`position` 等物件屬性，應先建立 mesh、設定 scale，再回傳 mesh。
- **適用範圍：** 把幾何建立與變形包在 helper 的 Three.js 專案；遇到鏈式設定時應確認每個方法實際回傳型別。

## GitHub Contents API 寫檔的核對方式

- **經驗：** GitHub 寫檔工具回報錯誤時，遠端檔案仍可能已經建立。先 fetch 同一路徑確認實際內容和 SHA，再決定要 create 或帶 SHA update，避免重複寫入或誤判失敗。
- **適用範圍：** 使用 GitHub API／connector 編輯檔案，尤其是空 repo 的初始提交。多檔專案後續以本機 Git commit/push 維護較容易追蹤。

## GitHub Pages 的 Actions 發布來源

- **經驗：** 靜態部署 workflow 本身不一定會自動建立 Pages site。`actions/configure-pages` 的 `enablement` 需要一個 `GITHUB_TOKEN` 以外、具備足夠 Pages／管理權限的 token；一般部署 workflow 適用於 Pages 已啟用並選擇 Actions 的 repo。
- **適用範圍：** 新 repo 第一次啟用 Pages。若沒有管理權限或可用的專用 token，須由 repo 管理者在 Settings → Pages 選擇 GitHub Actions，之後再確認 workflow 部署。
- **核對依據：** [configure-pages action](https://github.com/actions/configure-pages) 與 [GitHub Pages REST API 權限說明](https://docs.github.com/en/rest/pages/pages)。

## 在受限工作目錄內使用 Git

- **經驗：** 目前工作目錄根層的 `.git` 寫入受限。把 repo clone 到 `work/` 子目錄可建立正常的本機索引與 commit；這台 Windows 環境用 Git 預設 Schannel 時遇到憑證管理錯誤，匿名讀取公開 repo 可用 `git -c http.sslBackend=openssl clone ...`。
- **適用範圍：** 只適用於相同受限 Codex Windows 環境。這次 push 仍因沒有 GitHub CLI／Git credential 而失敗；不應把 token 寫進 remote URL 或輸出到終端。若 Git 推送憑證不可用，可用已授權 GitHub connector 提交遠端檔案，並核對 fetch 結果和 SHA，但應清楚記錄這不等同於推送本機 commit。

