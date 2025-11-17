;(() => {
  // aff_base chuẩn của mxd210 (Mai cung cấp)
  const AFF_BASE = {
    shopee: "https://go.isclix.com/deep_link/6803097511817356947/4751584435713464237?url=",
    lazada: "https://go.isclix.com/deep_link/6803097511817356947/5127144557053758578?url=",
    tiktok: "https://go.isclix.com/deep_link/6803097511817356947/6648523843406889655?url=",
    tiki:   "https://go.isclix.com/deep_link/6803097511817356947/4348614231480407268?url="
  };

  const SITE_CODE = "mxd210";

  const UTM_BASE =
    "utm_source=" + encodeURIComponent(location.hostname) +
    "&utm_medium=affiliate";

  function makeIsclixUrl(merchant, originUrl, sku) {
    if (!originUrl) return "";
    // Nếu đã là link isclix thì thôi, tránh bọc 2 lần
    if (/go\.isclix\.com/.test(originUrl)) return originUrl;

    merchant = (merchant || "").toLowerCase();
    const base = AFF_BASE[merchant];
    if (!base) return originUrl;

    // base đã kết thúc bằng ?url= -> nối link gốc trước
    const head = base + encodeURIComponent(originUrl);
    const sep = head.includes("?") ? "&" : "?";

    const params = [
      UTM_BASE,
      "utm_campaign=" + encodeURIComponent(merchant || ""),
      "sub1=" + encodeURIComponent(sku || ""),
      "sub2=" + encodeURIComponent(merchant || ""),
      "sub4=" + encodeURIComponent(SITE_CODE)
    ];

    return head + sep + params.join("&");
  }

  window.MXD_AFF = {
    AFF_BASE,
    makeIsclixUrl
  };
})();
