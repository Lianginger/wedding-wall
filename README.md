# Wedding Wall 婚禮祝福牆

為了讓老哥 11 月的訂婚及 12 月的結婚當天有一個有趣互動活動，我將打造一個婚禮動態祝福牆。  
=> [Website](https://wedding-wall.herokuapp.com/)

### Images are resized and compress with sharp

目前高階手機拍照的檔案大小約 3MB 左右，因此設定前端及後端檢查照片檔案上傳大小最大限制為 4MB，另外，比較 sharp 和 imagemin 這兩個圖片處理套件，在圖片壓縮處理速度上 sharp 速度快了 5-6 倍。

考慮到結婚當天會用投影機大螢幕播放 Slideshow 放映一張一張的圖文祝福，因此在調整圖片大小時是參考最常見的 1280 x 768 投影機解析度，設定當上傳的照片寬度大於 1280 且高度大於 768 就會進行等比例 resize，最後壓縮成 jpg 上傳。

### Handle image rotation on mobile

瀏覽器不會偵測照片檔案的方向，手機拍完照片上傳後，在前端圖片顯示及後端照片上傳時會發生錯誤的旋轉，因此要設定：

- 前端：blueimp-load-image 套件
- 後端：sharp 套件設定 rotate()

### Cloudinary VS Google Cloud Storage(GCS)

專案一開始是將圖片上傳到 Cloudinary 這個雲端圖像處理平台，透過調整網址參數就可以即時優化圖片，但考量到本專案並不需要大量的即時圖片調整，在和 GCS 比較過後，GCS 在上傳和載入速度上都快了近 3 倍，因此最後將圖片儲存換成 GCS。

在本地端環境，比較上傳一張經過裁切和壓縮後檔案大小約 60 K 的圖片：

- Cloudinary 約 1500 ms
- Google Cloud Storage 約 500 ms

比較加載圖片時間：

- Cloudinary 約 750 ms
- Google Cloud Storage 約 250 ms
