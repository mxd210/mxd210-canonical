;(() => {
  function safeGtag() {
    if (typeof window.gtag === "function") {
      return window.gtag;
    }
    return null;
  }

  function trackEvent(name, params) {
    const g = safeGtag();
    if (!g) return;
    g("event", name, params || {});
  }

  function trackViewProduct(product) {
    trackEvent("view_product_mxd210", {
      sku: product.sku || "",
      name: product.name || "",
      price: product.price || 0,
      merchant: product.merchant || "",
      category: product.category || ""
    });
  }

  function trackClickBuy(product) {
    trackEvent("click_buy_mxd210", {
      sku: product.sku || "",
      name: product.name || "",
      merchant: product.merchant || "",
      category: product.category || "",
      value: product.price || 0
    });
  }

  window.MXD_TRACK = {
    event: trackEvent,
    viewProduct: trackViewProduct,
    clickBuy: trackClickBuy
  };
})();
