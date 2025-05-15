import { API_TOKEN } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  // === Mobile Navigation Toggle ===
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // === Link Shortening ===
  const form = document.querySelector("#shorten-form");
  const urlInput = document.querySelector("#shorten-input");
  const errorMsg = document.querySelector(".shorten-error");
  const resultsContainer = document.querySelector(".shorten-results");
  const boostBtn = document.getElementById("#boost-btn");

  if (!form || !urlInput || !resultsContainer) {
    console.error("Required elements not found.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();

    if (!url) {
      showError(true, "Please enter a valid URL");
      return;
    }

    showError(false);
    showLoading(true);

    try {
      const response = await fetch("https://api.tinyurl.com/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          url: url,
          domain: "tinyurl.com",
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        addShortenedLink(url, data.data.tiny_url);
        urlInput.value = "";
      } else {
        const message = data.errors?.[0]?.message || "Something went wrong.";
        showError(true, message);
      }
    } catch (err) {
      showError(true, "Network error. Please try again.");
    }

    showLoading(false);
  });

  // === Boost Button clears input
  if (boostBtn) {
    boostBtn.addEventListener("click", () => {
      urlInput.value = "";
      showError(false);
      urlInput.focus();
    });
  }

  // === Add Shortened Link Box ===
  function addShortenedLink(originalUrl, shortUrl) {
    const resultBox = document.createElement("div");
    resultBox.className = "shorten-result-box";

    resultBox.innerHTML = `
      <p class="original-link">${originalUrl}</p>
      <div class="shorten-right">
        <a href="${shortUrl}" class="short-link" target="_blank">${shortUrl}</a>
        <button class="copy-btn">Copy</button>
      </div>
    `;

    resultsContainer.prepend(resultBox);

    const copyBtn = resultBox.querySelector(".copy-btn");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(shortUrl);
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");

      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("copied");
      }, 2000);
    });
  }

  // === Error Message Handling ===
  function showError(show, message = "") {
    if (errorMsg) {
      errorMsg.textContent = show ? message : "";
      errorMsg.style.display = show ? "block" : "none";
      urlInput.classList.toggle("input-error", show);
    }
  }

  // === Button Loading State ===
  function showLoading(loading) {
    const submitBtn = form.querySelector("button");
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "Shortening..." : "Shorten It!";
    }
  }
});
