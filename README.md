# 勞山道士・穿牆

以 Three.js 製作的互動式水墨場景原型。拖曳可上下左右環繞，滾輪可縮放；鏡頭固定在場景焦點周圍，不能平移。初始鏡頭面向王七與牆，旋轉約 90 度可看到道士。

## 本機預覽

可用任何靜態 HTTP server 提供此資料夾，例如：

```sh
python -m http.server 8000
```

再開啟 http://localhost:8000 。需要網路連線載入 Three.js ES module。

## GitHub Pages

此 repo 使用 GitHub Actions 發布靜態網站。推送到 `main` 後，workflow 會部署到 GitHub Pages。建立 repo 後請在 **Settings → Pages → Build and deployment** 選擇 **GitHub Actions**。

