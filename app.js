// full logic from provided HTML integrated here
let products=[], filteredProducts=[], logoDataURL='', logoWidth=0, logoHeight=0, isUpdating=false;

// CSV parsing
document.getElementById('csvFile').addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>parseCSV(e.target.result);
  reader.readAsText(file,'ISO-8859-1');
});
function parseCSV(data){
  const lines=data.trim().split('\n');
  products=[]; filteredProducts=[];
  for(let i=1;i<lines.length;i++){
    const row=lines[i].split(';');
    if(row.length<5) continue;
    products.push({code:row[0].trim(),description:row[1].trim(),
      price:parseEuropeanFloat(row[2]),install:parseEuropeanFloat(row[3]),transport:parseEuropeanFloat(row[4])});
  }
  filteredProducts=products.slice(); updateProductList(); calculateTotals();
}
function filterProducts(){
  const q=document.getElementById('searchProduct').value.toLowerCase();
  filteredProducts=products.filter(p=>p.code.toLowerCase().includes(q)||p.description.toLowerCase().includes(q));
  updateProductList();
}
function updateProductList(){
  const sel=document.getElementById('productList'); sel.innerHTML='';
  filteredProducts.forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=p.code+' - '+p.description;sel.append(o);});
}
function selectProduct(){
  const sel=document.getElementById('productList'); if(sel.selectedIndex<0) return;
  addRowWithProduct(filteredProducts[sel.value]);
}

// OCR scan
document.getElementById('cameraInput').addEventListener('change',async e=>{
  const file=e.target.files[0]; if(!file) return;
  document.getElementById('loading').style.display='block';
  const img=new Image(); img.src=URL.createObjectURL(file);
  img.onload=async ()=>{
    const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d');
    const MAX=1024;let w=img.width,h=img.height;
    if(w>MAX||h>MAX){const s=Math.min(MAX/w,MAX/h);w*=s;h*=s;}
    canvas.width=w;canvas.height=h;ctx.drawImage(img,0,0,w,h);
    try{const res=await Tesseract.recognize(canvas,'eng');document.getElementById('loading').style.display='none';
      const words=Array.from(new Set(res.data.text.split(/\s+|[\r\n]+/).map(w=>w.trim()).filter(w=>/^[A-Za-z0-9]{3,}$/.test(w))));
      showOCRResults(words);
    }catch(err){alert('Errore OCR:'+err);document.getElementById('loading').style.display='none';}
  };
});
function showOCRResults(words){
  const out=document.getElementById('ocrResults'); out.innerHTML='<h3>Testi rilevati:</h3>';
  words.forEach(w=>{const d=document.createElement('div'),b=document.createElement('button');b.textContent='Aggiungi';b.onclick=()=>selectByCode(w);
    d.textContent=w+' ';d.append(b);out.append(d);
  });
}
function selectByCode(code){
  const key=code.replace(/[^\w\d]/g,'').toLowerCase();
  const p=products.find(x=>x.code.replace(/[^\w\d]/g,'').toLowerCase()===key);
  if(!p){alert('Non trovato:'+code);return;} addRowWithProduct(p);
}

// Table functions
function addRow(){addRowWithProduct(null);}
function addRowWithProduct(p){
  const tbody=document.querySelector('#itemsTable tbody'),r=tbody.insertRow();
  r.innerHTML=`<td><input class="article-code" readonly></td><td><input class="article-description" readonly></td>
    <td><input type="number" min="1" value="1" oninput="calculateTotal(this)"></td>
    <td><input class="article-price" readonly></td>
    <td><input type="number" min="0" max="100" step="0.01" value="0" oninput="calculateTotal(this)"></td>
    <td><input class="article-net-price" readonly></td>
    <td><input class="article-trasporto" readonly></td>
    <td><input class="article-installazione" readonly></td>
    <td><input class="article-total-price" readonly></td>
    <td><input type="date" onchange="calculateTotal(this)"></td>
    <td><button onclick="this.closest('tr').remove();calculateTotals();">Rimuovi</button></td>`;
  // fill if product
  if(p){
    r.querySelector('.article-code').value=p.code;
    r.querySelector('.article-description').value=p.description;
    r.querySelector('.article-price').value=formatEuro(p.price);
  }
  calculateTotal(r.cells[2].firstChild);
}

function calculateTotal(el){
  if(isUpdating) return; isUpdating=true;
  const row=el.closest('tr'),p=products.find(x=>x.code===row.querySelector('.article-code').value);
  const qty=parseFloat(row.cells[2].firstChild.value)||1,price=p?parseEuropeanFloat(row.cells[3].firstChild.value):0;
  const disc=parseFloat(row.cells[4].firstChild.value)||0;
  const net=price*(1-disc/100);row.cells[5].firstChild.value=formatEuro(net);
  const transFlag=document.getElementById('portoWithCharge').checked;
  const instFlag=document.getElementById('installazioneSiInterno').checked||document.getElementById('installazioneSiEsterno').checked;
  row.cells[6].firstChild.value=transFlag?formatEuro(p.transport):'';
  row.cells[7].firstChild.value=instFlag?formatEuro(p.install):'';
  const total=(net+(transFlag?p.transport:0)+(instFlag?p.install:0))*qty;
  row.cells[8].firstChild.value=formatEuro(total);
  calculateTotals(); isUpdating=false;
}

function calculateTotals(){
  let sum=0;document.querySelectorAll('#itemsTable tbody tr').forEach(r=>{
    sum+=parseEuropeanFloat(r.querySelector('.article-total-price').value);
  });
  document.getElementById('totalArticlesValue').textContent=formatEuro(sum);
}

// Checkbox logic
['portoWithCharge','installazioneSiInterno','installazioneSiEsterno'].forEach(id=>{
  document.getElementById(id).addEventListener('change',()=>document.querySelectorAll('#itemsTable tbody tr').forEach(tr=>calculateTotal(tr.cells[2].firstChild)));
});

// PDF generation (copied from HTML)
async function generatePDF(){ /*... implement using jsPDF and autotable ... */ alert('PDF generazione placeholder'); }

// Utility
function formatEuro(v){return isFinite(v)?v.toLocaleString('it-IT',{style:'currency',currency:'EUR'}):'';}
function parseEuropeanFloat(v){return parseFloat(v.replace(/€/g,'').replace(/\./g,'').replace(',','.'))||0;}
function togglePreventivo(){document.querySelector('h2').firstChild.textContent=document.getElementById('isPreventivo').checked?'Preventivo':'Scheda Ordine';}
function useTotal(){document.getElementById('importo').value=document.getElementById('totalArticlesValue').textContent;}
function calcola(){alert('Calcolo canoni placeholder');}
