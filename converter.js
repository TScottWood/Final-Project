// converter.js
let rates = {};

const API_KEY = "acfa0ddbd313a485e944690a"; // Your key
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

const PLACEHOLDER_TEXT = "Choose Your Country";

async function fetchRates(base = "USD") {
  try {
    const res = await fetch(`${API_URL}/${base}`);
    const data = await res.json();
    if (data.result !== "success") throw new Error("API error");
    rates = data.conversion_rates;
    document.getElementById("update-time").textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    updateAllResults();
  } catch (err) {
    document.querySelectorAll(".result").forEach(r => r.textContent = "Connection error");
    setTimeout(() => fetchRates(base), 5000);
  }
}

function populateSelects() {
  const selects = document.querySelectorAll(".currency-select");
  selects.forEach(sel => {
    if (sel.dataset.done) return;

    // Placeholder for the six big title dropdowns
    if (sel.classList.contains("big-title-select")) {
      const placeholder = new Option(PLACEHOLDER_TEXT, "", true, true);
      placeholder.disabled = true;
      placeholder.style.color = "#999";
      placeholder.style.fontStyle = "italic";
      sel.add(placeholder, 0);
      sel.value = "";
    }

    currencies.forEach(c => {
      // COUNTRY FIRST → typing now jumps to the country name!
      const opt = new Option(`${c.country} — ${c.code} (${c.name}) ${c.flag}`, c.code);
      sel.add(opt);
    });

    sel.dataset.done = "true";
  });
}

function updateAllResults() {
  const amount = parseFloat(document.getElementById("global-amount").value) || 0;
  const fromCode = document.getElementById("global-from").value || "USD";
  const fromRate = rates[fromCode] || 1;

  document.querySelectorAll(".converter-card").forEach(card => {
    const toSel = card.querySelector(".to-currency");
    const result = card.querySelector(".result");
    if (!toSel.value || toSel.value === "") {
      result.textContent = "—";
    } else {
      const toRate = rates[toSel.value] || 1;
      const converted = amount * (toRate / fromRate);
      result.textContent = converted.toFixed(4) + " " + toSel.value;
    }
  });
}

// Events
document.getElementById("global-amount")?.addEventListener("input", updateAllResults);
document.getElementById("global-from")?.addEventListener("change", () => {
  fetchRates(document.getElementById("global-from").value);
});
document.addEventListener("change", e => {
  if (e.target.classList.contains("to-currency")) updateAllResults();
});

// Start everything
document.addEventListener("DOMContentLoaded", () => {
  populateSelects();
  document.getElementById("global-from").value = "USD";
  fetchRates("USD");
});

// Auto-refresh every 10 minutes
setInterval(() => {
  const base = document.getElementById("global-from").value || "USD";
  fetchRates(base);
}, 10 * 60 * 1000);