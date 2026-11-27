# 勞山道士・穿牆

以 Three.js 製作的互動式水墨場景原型。滑鼠拖曳或單指拖曳可上下左右環繞，滾輪或雙指捏合可縮放；鏡頭固定在場景焦點周圍，不能平移。初始鏡頭面向王七與牆，旋轉約 90 度可看到道士。

## 本機預覽

可用任何靜態 HTTP server 提供此資料夾，例如：

```sh
python -m http.server 8000
```

再開啟 http://localhost:8000 。需要網路連線載入 Three.js ES module。

## GitHub Pages

互動場景已發布：[開啟 GitHub Pages](https://ccshfaaa.github.io/wall/)。GitHub Actions 會在 `main` 更新時重新部署。

