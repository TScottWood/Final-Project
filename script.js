// Mobile menu
document.querySelector('.mobile-toggle').addEventListener('click', () => {
  document.querySelector('.nav__links').classList.toggle('active');
});

let from = 'USD', to = 'EUR';
const result = document.getElementById('exchange-result');

function updateRate() {
  result.textContent = 'Loading...';
  fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    .then(r => r.json())
    .then(data => {
      const rate = data.rates[to];
      result.innerHTML = `1 ${from} = <span style="font-size:3.8rem">${rate.toFixed(4)}</span> ${to}`;
    })
    .catch(() => result.textContent = 'No internet connection');
}

function initSelect(id) {
  const container = document.querySelector(id);
  const display = container.querySelector('.select-display');
  const dropdown = container.querySelector('.select-dropdown');
  const input = dropdown.querySelector('.select-search');
  const list = dropdown.querySelector('.select-options');

  function render(filter = '') {
    list.innerHTML = '';
    currencies
      .filter(c => c.code.toLowerCase().includes(filter) || c.name.toLowerCase().includes(filter) || c.country.toLowerCase().includes(filter))
      .forEach(c => {
        const item = document.createElement('div');
        item.className = 'select-option';
        item.innerHTML = `<strong>${c.code}</strong> - ${c.name} <span>(${c.country})</span>`;
        item.onclick = () => {
          display.textContent = `${c.code} - ${c.name} (${c.country})`;
          container.classList.remove('active');
          if (id === '#from-select') from = c.code;
          if (id === '#to-select') to = c.code;
          updateRate();
        };
        list.appendChild(item);
      });
  }

  display.onclick = () => {
    document.querySelectorAll('.searchable-select').forEach(el => el.classList.remove('active'));
    container.classList.toggle('active');
    if (container.classList.contains('active')) {
      input.focus();
      render();
    }
  };

  input.oninput = e => render(e.target.value.toLowerCase());
  document.addEventListener('click', e => {
    if (!container.contains(e.target)) container.classList.remove('active');
  });
}

initSelect('#from-select');
initSelect('#to-select');

document.querySelector('.swap-btn').onclick = () => {
  [from, to] = [to, from];
  const temp = document.querySelector('#from-select .select-display').textContent;
  document.querySelector('#from-select .select-display').textContent = document.querySelector('#to-select .select-display').textContent;
  document.querySelector('#to-select .select-display').textContent = temp;
  updateRate();
};

updateRate();