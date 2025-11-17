// REPLACE WHOLE FILE: /assets/js/mxd-affiliates.js
// MXD210-CANONICAL-REBUILD
// Vai trò: đọc affiliates.json và cung cấp các hàm tiện ích cho store.html, g.html, category.html.

;(() => {
  'use strict';

  const DATA_URL = '/assets/data/affiliates.json';

  // Thứ tự ưu tiên sàn khi chọn offer "tốt nhất"
  const PREFERRED_MERCHANTS = ['shopee', 'lazada', 'tiktok', 'tiki'];

  let _data = null;
  let _loading = null;

  /**
   * Fetch affiliates.json 1 lần, các lần sau dùng cache.
   * @returns {Promise<Array>} danh sách sản phẩm
   */
  async function loadAffiliates() {
    if (_data) return _data;
    if (_loading) return _loading;

    _loading = fetch(DATA_URL, { cache: 'no-cache' })
      .then(res => {
        if (!res.ok) throw new Error('Không tải được affiliates.json: ' + res.status);
        return res.json();
      })
      .then(json => {
        if (!Array.isArray(json)) {
          console.warn('[MXD_AFF] affiliates.json không phải mảng, tự bọc lại.');
          json = json ? [json] : [];
        }
        _data = json.map(normalizeProduct).filter(Boolean);
        return _data;
      })
      .catch(err => {
        console.error('[MXD_AFF] Lỗi loadAffiliates:', err);
        _data = [];
        return _data;
      })
      .finally(() => {
        _loading = null;
      });

    return _loading;
  }

  /**
   * Chuẩn hóa product: đảm bảo có những field cơ bản & type hợp lý.
   */
  function normalizeProduct(raw) {
    if (!raw || !raw.sku) return null;

    const p = Object.assign({}, raw);

    // Fallback slug = sku
    if (!p.slug) p.slug = p.sku;

    // Fallback category_label nếu thiếu
    if (!p.category_label) {
      p.category_label = guessCategoryLabel(p.category);
    }

    // Đảm bảo offers là mảng
    if (!Array.isArray(p.offers)) {
      p.offers = [];
    } else {
      p.offers = p.offers
        .filter(o => o && o.merchant && o.origin_url)
        .map(o => normalizeOffer(o, p));
    }

    return p;
  }

  /**
   * Chuẩn hóa offer: ép kiểu giá, gắn fallback badge, updated_at.
   */
  function normalizeOffer(o, product) {
    const offer = Object.assign({}, o);
    offer.merchant = String(offer.merchant || '').toLowerCase().trim();
    offer.origin_url = String(offer.origin_url || '').trim();

    if (offer.price != null) {
      const num = Number(offer.price);
      offer.price = Number.isFinite(num) && num >= 0 ? num : 0;
    } else {
      offer.price = 0;
    }

    if (offer.price_old != null) {
      const oldNum = Number(offer.price_old);
      offer.price_old = Number.isFinite(oldNum) && oldNum >= 0 ? oldNum : null;
    } else {
      offer.price_old = null;
    }

    if (offer.discount_percent != null) {
      const d = Number(offer.discount_percent);
      offer.discount_percent = Number.isFinite(d) ? d : null;
    } else if (offer.price_old && offer.price_old > offer.price && offer.price > 0) {
      const d = Math.round((1 - offer.price / offer.price_old) * 100);
      offer.discount_percent = d > 0 ? d : null;
    } else {
      offer.discount_percent = null;
    }

    if (!offer.currency) offer.currency = 'VND';
    if (typeof offer.in_stock !== 'boolean') offer.in_stock = true;

    if (!offer.badge) {
      if (offer.discount_percent && offer.discount_percent >= 15) {
        offer.badge = 'Giảm ~' + offer.discount_percent + '%';
      } else if (offer.price > 0) {
        offer.badge = 'Giá tham khảo';
      } else {
        offer.badge = 'Giá sẽ cập nhật';
      }
    }

    if (!offer.updated_at) {
      offer.updated_at = product && product.updated_at ? product.updated_at : null;
    }

    return offer;
  }

  /**
   * Đoán label danh mục nếu không được set sẵn.
   */
  function guessCategoryLabel(cat) {
    switch (cat) {
      case 'thoi-trang':
        return 'Thời trang';
      case 'thoi-trang-nu':
        return 'Thời trang nữ';
      case 'thoi-trang-nam':
        return 'Thời trang nam';
      case 'my-pham':
        return 'Mỹ phẩm & chăm sóc da';
      case 'do-gia-dung':
        return 'Đồ gia dụng';
      case 'dung-cu-op-lat':
        return 'Dụng cụ ốp lát & khoan vít';
      default:
        return 'Sản phẩm khác';
    }
  }

  /**
   * Lấy toàn bộ sản phẩm (đã được load & normalize).
   */
  async function getAll() {
    const list = await loadAffiliates();
    return list.slice();
  }

  /**
   * Tìm sản phẩm theo SKU (không phân biệt hoa/thường).
   */
  async function findBySku(sku) {
    if (!sku) return null;
    const key = String(sku).trim().toLowerCase();
    const list = await loadAffiliates();
    return list.find(p => String(p.sku).toLowerCase() === key) || null;
  }

  /**
   * Lọc theo category.
   */
  async function getByCategory(category) {
    if (!category) return [];
    const key = String(category).trim().toLowerCase();
    const list = await loadAffiliates();
    return list.filter(p => String(p.category || '').toLowerCase() === key);
  }

  /**
   * Lấy danh sách sản phẩm featured.
   */
  async function getFeatured() {
    const list = await loadAffiliates();
    return list.filter(p => p.flags && p.flags.featured);
  }

  /**
   * Lấy danh sách sản phẩm deal (theo flag hoặc % giảm).
   */
  async function getDeals(minDiscountPercent = 15) {
    const list = await loadAffiliates();
    return list.filter(p => {
      if (p.flags && p.flags.deal_hot) return true;
      if (!Array.isArray(p.offers) || !p.offers.length) return false;
      return p.offers.some(o => o.discount_percent && o.discount_percent >= minDiscountPercent);
    });
  }

  /**
   * Lấy sản phẩm có trên >= 2 sàn (multi-platform).
   */
  async function getMultiPlatform() {
    const list = await loadAffiliates();
    return list.filter(p => {
      if (p.flags && p.flags.multi_platform) return true;
      if (!Array.isArray(p.offers) || !p.offers.length) return false;
      const merchants = new Set(p.offers.map(o => o.merchant));
      return merchants.size >= 2;
    });
  }

  /**
   * Chọn offer “tốt nhất” cho 1 sản phẩm theo thứ tự ưu tiên merchant.
   */
  function pickBestOffer(product, preferredMerchants) {
    if (!product || !Array.isArray(product.offers) || !product.offers.length) return null;
    const prefs = Array.isArray(preferredMerchants) && preferredMerchants.length
      ? preferredMerchants.map(m => String(m).toLowerCase())
      : PREFERRED_MERCHANTS;

    // Thử theo thứ tự ưu tiên trước
    for (const m of prefs) {
      const found = product.offers.find(o => o.merchant === m && o.in_stock);
      if (found) return found;
    }

    // Fallback: lấy offer đầu tiên còn hàng
    return product.offers.find(o => o.in_stock) || product.offers[0];
  }

  /**
   * Lọc nhanh theo 1 flag bất kỳ, ví dụ: getByFlag('recommended').
   */
  async function getByFlag(flagName) {
    const list = await loadAffiliates();
    return list.filter(p => p.flags && p.flags[flagName]);
  }

  // Expose ra global để các trang khác dùng.
  window.MXD_AFF = {
    loadAffiliates,
    getAll,
    findBySku,
    getByCategory,
    getFeatured,
    getDeals,
    getMultiPlatform,
    getByFlag,
    pickBestOffer,
    // Cho phép truy cập lại một số config nếu cần:
    PREFERRED_MERCHANTS
  };
})();
