// converter.js
let rates = {};
const API_KEY = "acfa0ddbd313a485e944690a";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;
const PLACEHOLDER_TEXT = "Choose Your Country";

async function fetchRates(base = "USD") {
  try {
    const res = await fetch(`${API_URL}/${base}`);
    const data = await res.json();
    if (data.result !== "success") throw new Error("API error");

    rates = data.conversion_rates;
    updateTimeStamp();        // ← Show fresh date + time
    updateAllResults();       // ← Update all six cards
  } catch (err) {
    document.querySelectorAll(".result").forEach(r => r.textContent = "Connection error");
    setTimeout(() => fetchRates(base), 5000);
  }
}

// New: Full date + time stamp
function updateTimeStamp() {
  const now = new Date();
  const formatted = now.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '');   // Removes the comma after the day

  document.getElementById("update-time").textContent = `Rates updated: ${formatted}`;
}

function populateSelects() {
  const selects = document.querySelectorAll(".currency-select");
  selects.forEach(sel => {
    if (sel.dataset.done) return;

    if (sel.classList.contains("big-title-select")) {
      const placeholder = new Option(PLACEHOLDER_TEXT, "", true, true);
      placeholder.disabled = true;
      placeholder.style.color = "#999";
      placeholder.style.fontStyle = "italic";
      sel.add(placeholder, 0);
      sel.value = "";
    }

    currencies.forEach(c => {
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

// ==================== EVENTS ====================
document.getElementById("global-amount")?.addEventListener("input", updateAllResults);

document.getElementById("global-from")?.addEventListener("change", () => {
  const base = document.getElementById("global-from").value;
  fetchRates(base);
});

document.addEventListener("change", e => {
  if (e.target.classList.contains("to-currency")) updateAllResults();
});

// ==================== STARTUP ====================
document.addEventListener("DOMContentLoaded", () => {
  populateSelects();
  document.getElementById("global-from").value = "";
  fetchRates("USD");                     // Initial load
});

// ==================== AUTO-REFRESH ====================
// Refreshes rates every 10 minutes using whatever base currency is currently selected
setInterval(() => {
  const base = document.getElementById("global-from").value || "USD";
  console.log("Auto-refreshing rates...");
  fetchRates(base);
}, 10 * 60 * 1000);   // 10 minutes