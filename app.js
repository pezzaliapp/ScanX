let products=[]; let filteredProducts=[]; let logoDataURL='',logoWidth=0,logoHeight=0,isUpdating=false;

// CSV loading
document.getElementById('csvFile').addEventListener('change',function(e){
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=function(evt){
    parseCSV(evt.target.result);
  };
  reader.readAsText(file,'ISO-8859-1');
});

function parseCSV(text){
  const lines=text.trim().split('\n');
  products=[]; filteredProducts=[];
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(';');
    if(cols.length<5) continue;
    products.push({code:cols[0].trim(), description:cols[1].trim(), price:parseFloat(cols[2].replace(',','.'))||0, install:parseFloat(cols[3].replace(',','.'))||0, transport:parseFloat(cols[4].replace(',','.'))||0});
  }
  filteredProducts=products.slice();
  updateProductList();
}

// Product search functions
function filterProducts(){
  const q=document.getElementById('searchProduct').value.toLowerCase();
  filteredProducts=products.filter(p=>p.code.toLowerCase().includes(q)||p.description.toLowerCase().includes(q));
  updateProductList();
}
function updateProductList(){
  const sel=document.getElementById('productList'); sel.innerHTML='';
  filteredProducts.forEach((p,i)=>{ const opt=document.createElement('option'); opt.value=i; opt.textContent=`${p.code} - ${p.description}`; sel.appendChild(opt); });
}
function selectProduct(){
  const idx=document.getElementById('productList').selectedIndex;
  if(idx<0) return;
  const product=filteredProducts[idx];
  addProductToTable(product);
}

// Scanning logic
document.getElementById('cameraInput').addEventListener('change',async(e)=>{
  const file=e.target.files[0]; if(!file) return;
  const img=new Image(); img.src=URL.createObjectURL(file);
  img.onload=async()=>{
    const canvas=document.getElementById('canvas');
    const ctx=canvas.getContext('2d');
    const MAX=1024; let w=img.width,h=img.height;
    if(w>MAX||h>MAX){ const s=Math.min(MAX/w,MAX/h); w=w*s; h=h*s; }
    canvas.width=w; canvas.height=h; ctx.drawImage(img,0,0,w,h);
    const {data:{text}}=await Tesseract.recognize(canvas,'eng');
    const words=Array.from(new Set(text.split(/\s+|[\r\n]+/).map(w=>w.trim()).filter(w=>/^[A-Za-z0-9]{3,}$/.test(w))));
    showOCRResults(words);
  };
});

function showOCRResults(words){
  const out=document.getElementById('ocrResults'); out.innerHTML='<h3>Testi rilevati:</h3>';
  words.forEach(w=>{
    const div=document.createElement('div');
    const btn=document.createElement('button'); btn.textContent='Aggiungi'; btn.onclick=()=>selectByCode(w);
    div.textContent=w+' '; div.appendChild(btn); out.appendChild(div);
  });
}

function selectByCode(code){
  const key=code.trim().replace(/[^\w\d]/g,'').toLowerCase();
  const prod=products.find(p=>p.code.replace(/[^\w\d]/g,'').toLowerCase()===key);
  if(!prod){ alert('Codice non trovato: '+code); return; }
  addProductToTable(prod);
}

function addProductToTable(p){
  const tbody=document.querySelector('#itemsTable tbody');
  const row=tbody.insertRow(); const qty=1, disc=0;
  const net=p.price, total=(net+p.transport+p.install)*qty;
  row.innerHTML=`<td>${p.code}</td><td>${p.description}</td><td>${qty}</td><td>€${p.price.toFixed(2)}</td><td>${disc}%</td><td>€${net.toFixed(2)}</td><td>€${p.transport.toFixed(2)}</td><td>€${p.install.toFixed(2)}</td><td>€${total.toFixed(2)}</td>`;
}

// Add here the rest of functions: addRow, calculateTotals, generatePDF, etc., from provided HTML...
