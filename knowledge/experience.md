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

## 互動場景的視角驗收

- **經驗：** 以 16:9 瀏覽器預覽檢查初始鏡頭和左右兩側約 90 度角度，可確認主要遮擋、道士揭露時機和提示文字是否相符；再用滾輪確認鏡頭距離變化。只看程式碼不足以判斷牆、屋頂是否擋住人物。
- **適用範圍：** 固定展示台、環繞相機或有指定揭露角度的 3D 場景。應另外檢查不同畫面尺寸；本次只實際確認 1280×720 預覽。
- **本次發現：** 把道士置於牆後可讓初始畫面聚焦王七；屋頂幾何需封住屋脊面，避免側視角看到開口；提示文字應在兩個環繞方向都能更新。

## 用 GitHub connector 同步受限環境的本機 commit

- **經驗：** 本機 Git commit 建立成功，但 Git push 因沒有可用的 credential 被拒。使用者已授權的 GitHub connector 可按檔案更新 remote，並逐檔 fetch 比對內容確認同步；這會建立 remote commits，但 commit SHA 不會等於本機 commit，也不應稱為 CLI `git push`。
- **適用範圍：** 本機 push credential 無法取得、但已授權 GitHub connector 有 repo 寫入權限時的短期替代方案。後續若需要正常 Git 歷史，應在可用的認證環境中 fetch/pull 這些 remote commits 後再繼續。

## GitHub Pages 發布驗收

- **經驗：** 將靜態場景部署成 Pages 後，除了檢查 Actions job 成功，也要在公開 Pages URL 實際載入頁面，確認 ES module、相對路徑和互動 canvas 都正常。
- **適用範圍：** GitHub Pages 靜態網站；本次 Actions run #10 成功，公開 URL 可載入 3D 場景。

## 窄螢幕 Three.js 構圖與觸控縮放

- **經驗：** `PerspectiveCamera` 的垂直視野在窄螢幕需要隨 aspect ratio 放寬；可由 16:9 基準垂直 FOV 推導，再設上限避免直式手機視角過廣、主體變得太小。窄螢幕字幕允許換行，操作列置中並避開安全區；短高度橫式畫面則讓字幕和控制列分居底部兩側。
- **操作經驗：** 使用 Pointer Events 加 `touch-action: none` 時，能以單指拖曳環繞、雙指距離變化調整相機半徑，且維持桌面拖曳與滾輪縮放。當手指數量改變時，應重設剩餘指標的拖曳起點，避免相機跳動。
- **適用範圍：** 有固定 target 的 Three.js 展示場景、模型檢視器，以及同時支援滑鼠和觸控的單頁作品。若場景需要頁面捲動或瀏覽器原生手勢，應重新考慮 `touch-action` 的範圍。
- **驗收範圍：** 本次在 390×844、844×390 和 1280×720 瀏覽器視窗檢查構圖；拖曳揭露側景及重設視角已互動確認，瀏覽器沒有載入錯誤。未以實體手機驗證觸控硬體手感。

## 用幾何與墨線刻畫低多邊形角色

- **經驗：** 小型 3D 場景可在既有 primitive 角色上疊加少量高辨識度細節，例如眼白與瞳孔、張口表情、腰帶、曲線衣褶和帽冠；用 TorusGeometry 製作腰帶時，先把環旋轉到水平面，再依角色前後厚度縮放。細節放在角色自己的 Group 座標系，跟著角色和環繞視角一起移動。
- **適用範圍：** 低多邊形故事場景、遠景人物和小型互動展示；應先挑選能從主要觀看距離辨識的輪廓與表情，避免只增加近看才看得到的細節。
- **驗收範圍：** 在 1280×720 初始構圖與約 90 度側景檢查王七表情、袍服和道士冠帽；瀏覽器無載入錯誤。人物仍由幾何原型構成，尚未達成完整模型或實體手機細節驗收。

