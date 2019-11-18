# Wedding Wall 婚禮祝福牆

為了哥哥 11 及 12 月份的訂婚、結婚，結合 Messenger 聊天機器人，打造一個與現場來賓即時互動的婚禮動態祝福牆。

圖：網頁端上傳檔案 > 前端檢查小於 4MB > 後端檢查小於 4MB > Resize > Compress > 上傳 Cloudinary >
取得存取圖片的 id > 將資料存進 MongoDB > Redirect

目前高階手機拍照檔案大小約 3MB 左右，設定前端及後端檢查照片檔案上傳大小最大限制為 4MB

### Images are resized and compress with sharp

比較 sharp、imagemin 的圖片壓縮處理速度，sharp 速度快了 5-6 倍。

考慮到結婚當天會用投影機大螢幕播放 Slideshow 放映一張一張的圖文祝福，因此在調整圖片大小時是參考最常見的 1280 x 768 投影機解析度，我設定當上傳的照片寬度大於 1280 或高度大於 768 就會進行等比例 resize，最後壓縮成 jpg 上傳到 cloudinary.

### Handle image rotation on mobile

瀏覽器不會偵測照片檔案的方向，因此手機拍完照片上傳後，在前端圖片顯示及後端照片上傳時會發生錯誤的旋轉。
前端：blueimp-load-image
後端：sharp 設定 rotate()

### Cloudinary VS Google Cloud Storage(GCS)

專案一開始是將圖片上傳到 Cloudinary 這個雲端圖像處理平台，透過調整網址參數就可以即時優化圖片，但考量到本專案並不需要大量的即時圖片調整，在和 GCS 比較過後，GCS 在上傳和載入速度上都快了近 3 倍，因此最後將圖片儲存換成 GCS。

在本地端環境，比較上傳一張經過裁切和壓縮後檔案大小約 60 K 的圖片：

- Cloudinary 約 1500 ms
- Google Cloud Storage 約 500 ms

比較加載圖片時間：

- Cloudinary 約 750 ms
- Google Cloud Storage 約 250 ms
