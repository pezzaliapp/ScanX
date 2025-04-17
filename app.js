
let products = [], filteredProducts = [], isUpdating = false;

// CSV loading
document.getElementById('csvFile').addEventListener('change', function(e) {
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) { loadCSV(evt.target.result); };
  reader.readAsText(file,'ISO-8859-1');
});

function loadCSV(text) {
  const lines = text.trim().split('\n');
  products = []; filteredProducts = [];
  for(let i=1; i<lines.length; i++) {
    const cols = lines[i].split(';');
    if(cols.length < 5) continue;
    products.push({
      code: cols[0].trim(),
      description: cols[1].trim(),
      price: parseFloat(cols[2].replace(',', '.')) || 0,
      transport: parseFloat(cols[4].replace(',','.')) || 0,
      install: parseFloat(cols[3].replace(',','.')) || 0
    });
  }
  filteredProducts = products.slice();
  updateProductList();
  alert(`CSV caricato con ${products.length} prodotti`);
}

// Search functions unchanged...

// Scanning functions unchanged...

// Table and calculation
function addProductToTable(p) {
  const tbody = document.querySelector('#itemsTable tbody');
  const row = tbody.insertRow();
  // Code
  row.insertCell().textContent = p.code;
  // Description
  row.insertCell().textContent = p.description;
  // Quantity input
  const qtyCell = row.insertCell();
  const qtyInput = document.createElement('input');
  qtyInput.type = 'number'; qtyInput.min = '1'; qtyInput.value = '1';
  qtyInput.oninput = () => calculateRow(row);
  qtyCell.appendChild(qtyInput);
  // Unit price
  row.insertCell().textContent = `€${p.price.toFixed(2)}`;
  // Discount input
  const discCell = row.insertCell();
  const discInput = document.createElement('input');
  discInput.type = 'number'; discInput.min = '0'; discInput.max = '100'; discInput.step = '0.01'; discInput.value = '0';
  discInput.oninput = () => calculateRow(row);
  discCell.appendChild(discInput);
  // Net price
  const netCell = row.insertCell();
  const netInput = document.createElement('input');
  netInput.type = 'text'; netInput.readOnly = true;
  netCell.appendChild(netInput);
  // Transport
  const transCell = row.insertCell();
  const transInput = document.createElement('input');
  transInput.type = 'text'; transInput.readOnly = true;
  transCell.appendChild(transInput);
  // Installation
  const instCell = row.insertCell();
  const instInput = document.createElement('input');
  instInput.type = 'text'; instInput.readOnly = true;
  instCell.appendChild(instInput);
  // Total
  const totCell = row.insertCell();
  const totInput = document.createElement('input');
  totInput.type = 'text'; totInput.readOnly = true;
  totCell.appendChild(totInput);
  // Delivery date
  const dateCell = row.insertCell();
  const dateInput = document.createElement('input');
  dateInput.type = 'date'; dateInput.onchange = () => calculateRow(row);
  dateCell.appendChild(dateInput);
  // Remove button
  const remCell = row.insertCell();
  const remBtn = document.createElement('button');
  remBtn.textContent = 'Rimuovi';
  remBtn.onclick = () => { row.remove(); calculateTotals(); };
  remCell.appendChild(remBtn);
  // Initial calculation
  calculateRow(row);
}

function calculateRow(row) {
  if(isUpdating) return;
  isUpdating = true;
  const code = row.cells[0].textContent;
  const p = products.find(x => x.code === code);
  const qty = parseFloat(row.cells[2].firstChild.value) || 1;
  const price = p.price;
  const disc = parseFloat(row.cells[4].firstChild.value) || 0;
  const net = price * (1 - disc/100);
  row.cells[5].firstChild.value = `€${net.toFixed(2)}`;
  const transportFlag = document.getElementById('portoWithCharge').checked;
  const installFlag = document.getElementById('installazioneSiInterno').checked || document.getElementById('installazioneSiEsterno').checked;
  row.cells[6].firstChild.value = transportFlag ? `€${p.transport.toFixed(2)}` : '';
  row.cells[7].firstChild.value = installFlag ? `€${p.install.toFixed(2)}` : '';
  const total = (net + (transportFlag ? p.transport : 0) + (installFlag ? p.install : 0)) * qty;
  row.cells[8].firstChild.value = `€${total.toFixed(2)}`;
  calculateTotals();
  isUpdating = false;
}

function calculateTotals() {
  let sum = 0;
  document.querySelectorAll('#itemsTable tbody tr').forEach(r => {
    const v = r.cells[8].firstChild.value.replace('€','').replace(',','.');
    sum += parseFloat(v) || 0;
  });
  document.getElementById('totalArticlesValue').textContent = '€' + sum.toLocaleString('it-IT',{minimumFractionDigits:2});
}

// Note: Ensure generatePDF and other functions are loaded as before.
