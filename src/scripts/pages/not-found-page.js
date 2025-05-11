export default class NotFoundPage {
  async render() {
    return `
        <section class = "container">
        <h1 id="content" tabindex="0">404 - page Not Found</h1>
        <p>Oops! Halaman yang kamu cari tidak ditemukan.</p>
        <a href="#/" class="back-button">Kembali ke Beranda</a>
      </section>
        `;
  }

  async afterRender() {
    const contentEl = document.getElementById("content");
    if (contentEl) {
      contentEl.setAttribute("tabindex", "-1");
      contentEl.focus;
    }
  }
}
