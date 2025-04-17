let csvData = [];

// Load CSV
document.getElementById('csvFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result;
    csvData = parseCSV(text);
    alert('CSV caricato con successo!');
  };
  reader.readAsText(file, 'ISO-8859-1');
});

function parseCSV(text) {
  const rows = text.split('\n').slice(1);
  return rows.map(row => {
    const cols = row.split(';');
    return {
      codice: cols[0]?.trim(),
      descrizione: cols[1]?.trim(),
      prezzoLordo: parseFloat(cols[2]?.replace(',', '.') || 0),
      installazione: parseFloat(cols[3]?.replace(',', '.') || 0),
      trasporto: parseFloat(cols[4]?.replace(',', '.') || 0)
    };
  });
}

// OCR from photo
document.getElementById('cameraInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = 'block';
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    // Downscale for performance
    const MAX_DIM = 1024;
    let w = img.width, h = img.height;
    if (w > MAX_DIM || h > MAX_DIM) {
      const scale = Math.min(MAX_DIM/w, MAX_DIM/h);
      w = Math.round(w*scale);
      h = Math.round(h*scale);
    }
    const canvas = document.getElementById('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    try {
      const result = await Tesseract.recognize(canvas, 'eng');
      loadingDiv.style.display = 'none';
      const rawText = result.data.text;
      let words = Array.from(new Set(rawText.split(/\s+|[\r\n]+/).map(w => w.trim()).filter(w => w.length >= 4)));
      words = words.filter(w => /^[A-Za-z0-9]+$/.test(w));
      if (words.length === 0) {
        words = ['Nessun codice rilevato'];
      }
      showOCRResults(words);
    } catch (err) {
      loadingDiv.style.display = 'none';
      alert('Errore OCR: ' + err.message);
    }
  };
});

function showOCRResults(words) {
  const output = document.getElementById('ocrResults');
  output.innerHTML = '<h3>Testi rilevati:</h3>';
  words.forEach(word => {
    const div = document.createElement('div');
    div.style.marginBottom = '0.5rem';
    const span = document.createElement('span');
    span.textContent = word + ' ';
    const btn = document.createElement('button');
    btn.textContent = 'Aggiungi';
    btn.onclick = () => handleCode(word);
    div.appendChild(span);
    div.appendChild(btn);
    output.appendChild(div);
  });
}

function handleCode(code) {
  const codicePulito = code.trim().replace(/[^\w\d]/g, '').toLowerCase();
  const prodotto = csvData.find(p => p.codice.replace(/[^\w\d]/g, '').toLowerCase() === codicePulito);
  if (!prodotto) {
    alert('Codice non trovato: ' + code);
    return;
  }
  const tbody = document.querySelector('#itemsTable tbody');
  const qty = 1;
  const sconto = 0;
  const netPrice = prodotto.prezzoLordo;
  const total = (netPrice + prodotto.trasporto + prodotto.installazione) * qty;
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${prodotto.codice}</td>
    <td>${prodotto.descrizione}</td>
    <td>${qty}</td>
    <td>€${prodotto.prezzoLordo.toFixed(2)}</td>
    <td>${sconto}%</td>
    <td>€${netPrice.toFixed(2)}</td>
    <td>€${prodotto.trasporto.toFixed(2)}</td>
    <td>€${prodotto.installazione.toFixed(2)}</td>
    <td>€${total.toFixed(2)}</td>
  `;
}
