
let csvData = [];

// Caricamento CSV
document.getElementById('csvFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
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
      descrizione: cols[1],
      prezzoLordo: parseFloat(cols[2]?.replace(',', '.') || 0),
      installazione: parseFloat(cols[3]) || 0,
      trasporto: parseFloat(cols[4]) || 0
    };
  });
}

// Scansione da immagine
document.getElementById('cameraInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const canvas = document.getElementById('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

    if (qrCode) {
      handleCode(qrCode.data.trim());
    } else {
      const result = await Tesseract.recognize(canvas, 'eng');
      const text = result.data.text.trim().split(/\s|\n/)[0]; // prende solo la prima parola/codice
      handleCode(text);
    }
  };
});

// Ricerca prodotto
function handleCode(code) {
  const prodotto = csvData.find(p => p.codice === code);
  const output = document.getElementById('output');

  if (prodotto) {
    output.innerHTML = `
      <h3>Prodotto trovato:</h3>
      <p><strong>Codice:</strong> ${prodotto.codice}</p>
      <p><strong>Descrizione:</strong> ${prodotto.descrizione}</p>
      <p><strong>Prezzo Lordo:</strong> €${prodotto.prezzoLordo.toFixed(2)}</p>
    `;
  } else {
    output.innerHTML = `<p><strong>Codice non trovato:</strong> ${code}</p>`;
  }
}
