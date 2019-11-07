# Wedding Wall 婚禮祝福牆

為了哥哥 11 及 12 月份的訂婚、結婚，結合 Messenger 聊天機器人，打造一個與來賓互動的即時婚禮祝福牆。

圖：網頁端上傳檔案 > 前端檢查小於 4MB > 後端檢查小於 4MB > Resize > Compress > 上傳 Cloudinary >
取得存取圖片的 id > 將資料存進 MongoDB > Redirect

目前高階手機拍照檔案大小約 3MB 左右，設定前端及後端檢查照片檔案上傳大小最大限制為 4MB

### Images are resized and compress with sharp

比較 sharp、imagemin，sharp 處理速度快 5-6 倍。

考慮到 Slideshow 會放映一張一張的圖文祝福，因此在調整圖片大小時是參考投影機解析度，以最常見的 1280 x 768，我設定當上傳的照片寬度大於 1280 或高度大於 768 就會進行 resize，最後壓縮成 jpg 上傳 cloudinary.

### Handle image rotation on mobile

瀏覽器不會偵測照片檔案的方向，因此手機拍完照片上傳後，在前端圖片顯示及後端照片上傳時會發生錯誤的旋轉。
前端：blueimp-load-image
後端：sharp
