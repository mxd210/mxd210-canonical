;(() => {
  // Mã chung của MXD210 trên AccessTrade
  const PUB_ID = "6803097511817356947";

  // Mã chiến dịch cho từng sàn
  const CAMPAIGN = {
    shopee: "4751584435713464237",
    lazada: "5127144557053758578",
    tiktok: "6648523843406889655",
    tiki:   "4348614231480407268"
  };

  // Xây AFF_BASE từ PUB_ID + CAMPAIGN
  // (bản gốc Mai hay ghi kèm '?url=', ở đây mình cố tình bỏ '?url='
  // để phía dưới hàm makeIsclixUrl tự thêm cho chắc và dễ nối UTM)
  const AFF_BASE = {
    shopee: `https://go.isclix.com/deep_link/${PUB_ID}/${CAMPAIGN.shopee}`,
    lazada: `https://go.isclix.com/deep_link/${PUB_ID}/${CAMPAIGN.lazada}`,
    tiktok: `https://go.isclix.com/deep_link/${PUB_ID}/${CAMPAIGN.tiktok}`,
    tiki:   `https://go.isclix.com/deep_link/${PUB_ID}/${CAMPAIGN.tiki}`
  };

  // Mã site để gắn vào sub4
  const SITE_CODE = "mxd210";

  // UTM cơ bản: nguồn là domain hiện tại, medium = affiliate
  const UTM_BASE =
    "utm_source=" + encodeURIComponent(location.hostname) +
    "&utm_medium=affiliate";

  /**
   * Sinh link isclix đầy đủ từ:
   * - merchant: "shopee" | "lazada" | "tiktok" | "tiki"
   * - originUrl: link gốc trên sàn
   * - sku: mã sản phẩm (sku trong affiliates.json)
   */
  function makeIsclixUrl(merchant, originUrl, sku) {
    if (!originUrl) return "";
    // Nếu đã là link isclix thì trả nguyên, tránh bọc 2 lần
    if (/go\.isclix\.com/.test(originUrl)) return originUrl;

    merchant = (merchant || "").toLowerCase();
    const base = AFF_BASE[merchant];
    if (!base) return originUrl;

    const sep = base.includes("?") ? "&" : "?";
    const head = base + sep + "url=" + encodeURIComponent(originUrl);

    const params = [
      UTM_BASE,
      "utm_campaign=" + encodeURIComponent(merchant || ""),
      "sub1=" + encodeURIComponent(sku || ""),
      "sub2=" + encodeURIComponent(merchant || ""),
      "sub4=" + encodeURIComponent(SITE_CODE)
    ];

    return head + "&" + params.join("&");
  }

  // Xuất ra global để mxd-buy.js hoặc code khác dùng
  window.MXD_AFF = {
    PUB_ID,
    CAMPAIGN,
    AFF_BASE,
    makeIsclixUrl
  };
})();
