;(() => {
  const DATA_URL = "/data/affiliates.json";

  async function fetchProducts() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("MXD210: lỗi fetch products", err);
      return [];
    }
  }

  // Chỗ này sau sẽ gắn vào DOM thật của store.html
  async function renderProductsInto(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const products = await fetchProducts();
    if (!products.length) {
      container.textContent = "Hiện chưa có sản phẩm để hiển thị.";
      return;
    }

    const frag = document.createDocumentFragment();

    products.forEach(p => {
      const item = document.createElement("div");
      item.className = "product-card";

      const link = document.createElement("a");
      link.href = "#";
      link.textContent = p.name || p.sku || "Sản phẩm";

      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.MXD_AFF && typeof MXD_AFF.makeIsclixUrl === "function") {
          const url = MXD_AFF.makeIsclixUrl(p.merchant, p.origin, p.sku);
          if (url) {
            if (window.MXD_TRACK && typeof MXD_TRACK.clickBuy === "function") {
              MXD_TRACK.clickBuy(p);
            }
            window.open(url, "_blank");
          }
        }
      });

      item.appendChild(link);
      frag.appendChild(item);
    });

    container.innerHTML = "";
    container.appendChild(frag);
  }

  window.MXD_RENDER = {
    fetchProducts,
    renderProductsInto
  };
})();
