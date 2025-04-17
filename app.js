let csvData = [];

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
      codice: cols[0],
      descrizione: cols[1],
      prezzoLordo: parseFloat(cols[2].replace(',', '.')) || 0,
      installazione: parseFloat(cols[3]) || 0,
      trasporto: parseFloat(cols[4]) || 0
    };
  });
}
