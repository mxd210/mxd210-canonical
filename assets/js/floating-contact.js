;(() => {
  function createFloatingContact() {
    if (document.querySelector(".mxd-floating-contact")) return;

    const wrap = document.createElement("div");
    wrap.className = "mxd-floating-contact";
    wrap.innerHTML = `
      <style>
        .mxd-floating-contact{
          position:fixed;
          right:14px;
          bottom:14px;
          z-index:40;
          display:flex;
          flex-direction:column;
          gap:8px;
          font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        }
        .mxd-floating-contact a{
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:8px 12px;
          border-radius:999px;
          background:#2563eb;
          color:#fff;
          font-size:12px;
          text-decoration:none;
          box-shadow:0 8px 24px rgba(37,99,235,.45);
        }
        .mxd-floating-contact a span.icon{
          font-size:14px;
        }
        @media (max-width:480px){
          .mxd-floating-contact a{
            padding:7px 11px;
            font-size:11px;
          }
        }
      </style>
      <a href="https://zalo.me/0338328898" target="_blank" rel="noopener">
        <span class="icon">💬</span>
        <span>Nhắn Zalo MXD210</span>
      </a>
    `;
    document.body.appendChild(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createFloatingContact);
  } else {
    createFloatingContact();
  }
})();
