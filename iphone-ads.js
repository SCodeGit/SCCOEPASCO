document.addEventListener("DOMContentLoaded", function () {
  const isiPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (!isiPhone) return; // Only run for Apple devices

  const adLink = "https://idealistic-revenue.com/b/3oV.0zPh3NptvfbYm_VOJrZDDv0j2lNgzmEsxkNVjdgt4lLUT/YY3zM/TtEI2/OLDokH";

  function attachToPdfLinks() {
    const links = document.querySelectorAll('#pdf-list a');

    links.forEach(link => {
      if (link.dataset.iphoneAdReady) return;
      link.dataset.iphoneAdReady = "1";

      link.addEventListener("click", function (e) {
        e.preventDefault();

        const pdfUrl = this.href;

        // Open ad first
        const adWin = window.open(adLink, "_blank");

        // Then open PDF
        setTimeout(() => {
          window.location.href = pdfUrl;
        }, 900);
      });
    });
  }

  // Watch for dynamically loaded PDFs
  const observer = new MutationObserver(() => {
    attachToPdfLinks();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  attachToPdfLinks();
});
