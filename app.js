const STORE_KEY = "cahaya-idola-pwa-v1";
const $ = (id) => document.getElementById(id);
const rupiah = (n) => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
const today = () => new Date().toISOString().slice(0,10);
let data = loadData();
let toastTimer;

function loadData(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||{products:[],transactions:[]}}catch{return {products:[],transactions:[]}}}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(data));renderAll()}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function sum(type){return data.transactions.filter(t=>t.type===type).reduce((a,t)=>a+Number(t.amount),0)}
function notify(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
function navigate(page){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("page-title").textContent={dashboard:"Dashboard",products:"Data Produk",transactions:"Transaksi",reports:"Laporan"}[page];$("sidebar").classList.remove("open");renderAll()}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.goto)));
$("menu-toggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("year").textContent=new Date().getFullYear();
$("today-label").textContent=new Intl.DateTimeFormat("id-ID",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(new Date());
window.addEventListener("online",updateConnection);window.addEventListener("offline",updateConnection);
function updateConnection(){$("connection-label").textContent=navigator.onLine?"Mode online":"Mode offline";}

function renderAll(){renderDashboard();renderProducts();renderTransactions();renderReports();populateProductSelect()}
function renderDashboard(){
 const income=sum("income"),expense=sum("expense"),balance=income-expense;
 $("stat-products").textContent=data.products.length;$("stat-stock").textContent=data.products.reduce((a,p)=>a+Number(p.stock),0).toLocaleString("id-ID");
 $("stat-income").textContent=rupiah(income);$("stat-expense").textContent=rupiah(expense);$("stat-balance").textContent=rupiah(balance);
 $("balance-bar").style.width=(income+expense?Math.max(0,Math.min(100,income/(income+expense)*100)):0)+"%";
 const low=data.products.filter(p=>Number(p.stock)<=Number(p.minStock));
 $("low-stock-count").textContent=low.length+" item";
 $("low-stock-list").innerHTML=low.length?low.slice(0,5).map(p=>`<div class="compact-item"><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.sku||"Tanpa SKU")}</small></div><strong>${p.stock} tersisa</strong></div>`).join(""):'<div class="empty-state">Belum ada produk dengan stok menipis.</div>';
 const recent=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 $("recent-transactions").innerHTML=recent.length?recent.map(transactionRow).join(""):'<tr><td colspan="5"><div class="empty-state">Belum ada transaksi.</div></td></tr>';
}
function transactionRow(t){return `<tr><td>${formatDate(t.date)}</td><td><b>${escapeHtml(t.description)}</b></td><td>${escapeHtml(t.category)}</td><td><span class="status ${t.type==="income"?"ok":"low"}">${t.type==="income"?"Pemasukan":"Pengeluaran"}</span></td><td class="align-right ${t.type==="income"?"amount-in":"amount-out"}">${t.type==="income"?"+":"−"} ${rupiah(t.amount)}</td></tr>`}
function formatDate(d){if(!d)return "-";return new Date(d+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}
function renderProducts(){
 const q=$("product-search").value.toLowerCase(),filter=$("stock-filter").value;
 const list=data.products.filter(p=>(p.name+" "+p.sku+" "+p.category).toLowerCase().includes(q)).filter(p=>filter==="all"||(filter==="low"&&p.stock<=p.minStock&&p.stock>0)||(filter==="out"&&p.stock===0));
 $("products-table").innerHTML=list.map(p=>{const status=p.stock===0?'<span class="status out">Habis</span>':p.stock<=p.minStock?'<span class="status low">Menipis</span>':'<span class="status ok">Aman</span>';return `<tr><td><b>${escapeHtml(p.name)}</b><br><small class="muted">${escapeHtml(p.category||"Umum")}</small></td><td>${escapeHtml(p.sku||"-")}</td><td>${rupiah(p.cost)}</td><td>${rupiah(p.price)}</td><td><b>${p.stock}</b></td><td>${status}</td><td><div class="row-actions"><button class="mini-btn" data-edit-product="${p.id}">Edit</button><button class="mini-btn delete" data-delete-product="${p.id}">Hapus</button></div></td></tr>`}).join("");
 $("products-empty").classList.toggle("hidden",list.length>0);
 document.querySelectorAll("[data-edit-product]").forEach(b=>b.onclick=()=>editProduct(b.dataset.editProduct));
 document.querySelectorAll("[data-delete-product]").forEach(b=>b.onclick=()=>deleteProduct(b.dataset.deleteProduct));
}
$("product-search").addEventListener("input",renderProducts);$("stock-filter").addEventListener("change",renderProducts);
function openModal(which){$("modal-backdrop").classList.remove("hidden");$("product-form").classList.toggle("hidden",which!=="product");$("transaction-form").classList.toggle("hidden",which!=="transaction");$("modal-title").textContent=which==="product"?"Data produk":"Tambah transaksi";if(which==="transaction")populateProductSelect()}
function closeModal(){$("modal-backdrop").classList.add("hidden")}
$("modal-close").onclick=closeModal;$("modal-backdrop").addEventListener("click",e=>{if(e.target===$("modal-backdrop"))closeModal()});document.querySelectorAll("[data-cancel]").forEach(b=>b.onclick=closeModal);
$("add-product").onclick=()=>{ $("product-form").reset();$("product-id").value="";$("product-min").value=5;openModal("product")};
function editProduct(id){const p=data.products.find(x=>x.id===id);if(!p)return;$("product-form").reset();$("product-id").value=p.id;$("product-name").value=p.name;$("product-sku").value=p.sku;$("product-category").value=p.category;$("product-cost").value=p.cost;$("product-price").value=p.price;$("product-stock").value=p.stock;$("product-min").value=p.minStock;openModal("product")}
function deleteProduct(id){const p=data.products.find(x=>x.id===id);if(!p)return;if(!confirm(`Hapus produk "${p.name}"? Riwayat transaksi tidak ikut dihapus.`))return;data.products=data.products.filter(x=>x.id!==id);save();notify("Produk berhasil dihapus.")}
$("product-form").addEventListener("submit",e=>{e.preventDefault();const id=$("product-id").value;const p={id:id||uid(),name:$("product-name").value.trim(),sku:$("product-sku").value.trim(),category:$("product-category").value.trim(),cost:Number($("product-cost").value),price:Number($("product-price").value),stock:Number($("product-stock").value),minStock:Number($("product-min").value)};if(!p.name||[p.cost,p.price,p.stock,p.minStock].some(n=>!Number.isFinite(n)||n<0))return notify("Periksa kembali data produk.");if(id)data.products=data.products.map(x=>x.id===id?p:x);else data.products.push(p);save();closeModal();notify(id?"Produk diperbarui.":"Produk ditambahkan.")});

function populateProductSelect(){const select=$("transaction-product"),current=select.value;select.innerHTML='<option value="">Tidak terkait produk</option>'+data.products.map(p=>`<option value="${p.id}">${escapeHtml(p.name)} (stok: ${p.stock})</option>`).join("");if(data.products.some(p=>p.id===current))select.value=current}
$("transaction-type").addEventListener("change",()=>{const p=$("transaction-product").value;$("quantity-field").classList.toggle("hidden",!p)});
$("transaction-product").addEventListener("change",()=>{$("quantity-field").classList.toggle("hidden",!$("transaction-product").value)});
$("add-transaction").onclick=()=>{ $("transaction-form").reset();$("transaction-id").value="";$("transaction-date").value=today();$("quantity-field").classList.add("hidden");openModal("transaction")};
$("quick-add").onclick=$("add-transaction").onclick;
$("transaction-form").addEventListener("submit",e=>{
 e.preventDefault();const id=$("transaction-id").value,type=$("transaction-type").value,productId=$("transaction-product").value,qty=Number($("transaction-quantity").value||1),amount=Number($("transaction-amount").value);
 if(!Number.isFinite(amount)||amount<=0)return notify("Jumlah transaksi harus lebih dari nol.");
 const old=id?data.transactions.find(t=>t.id===id):null;
 if(old?.productId){const oldP=data.products.find(p=>p.id===old.productId);if(oldP)oldP.stock+=old.type==="income"?-Number(old.quantity||0):Number(old.quantity||0)}
 const product=productId?data.products.find(p=>p.id===productId):null;
 if(productId&&(!product||!Number.isInteger(qty)||qty<1)){if(old?.productId){const oldP=data.products.find(p=>p.id===old.productId);if(oldP)oldP.stock+=old.type==="income"?Number(old.quantity||0):-Number(old.quantity||0)}return notify("Produk atau jumlah unit tidak valid.")}
 if(product){const next=product.stock+(type==="income"?qty:-qty);if(next<0){if(old?.productId){const oldP=data.products.find(p=>p.id===old.productId);if(oldP)oldP.stock+=old.type==="income"?Number(old.quantity||0):-Number(old.quantity||0)}return notify("Stok tidak cukup untuk transaksi pengeluaran ini.")}product.stock=next}
 const t={id:id||uid(),type,date:$("transaction-date").value,description:$("transaction-description").value.trim(),category:$("transaction-category").value,amount,productId,quantity:productId?qty:0};
 if(old)data.transactions=data.transactions.map(x=>x.id===id?t:x);else data.transactions.push(t);
 save();closeModal();notify(id?"Transaksi diperbarui.":"Transaksi berhasil dicatat.");
});
function renderTransactions(){
 const income=sum("income"),expense=sum("expense");$("tx-income").textContent=rupiah(income);$("tx-expense").textContent=rupiah(expense);$("tx-net").textContent=rupiah(income-expense);
 const q=$("transaction-search").value.toLowerCase(),type=$("transaction-filter").value,month=$("month-filter").value;
 const list=[...data.transactions].filter(t=>(t.description+" "+t.category).toLowerCase().includes(q)).filter(t=>type==="all"||t.type===type).filter(t=>!month||t.date.startsWith(month)).sort((a,b)=>b.date.localeCompare(a.date));
 $("transactions-table").innerHTML=list.map(t=>`<tr><td>${formatDate(t.date)}</td><td><b>${escapeHtml(t.description)}</b>${t.productId?'<br><small class="muted">Produk terkait · '+(data.products.find(p=>p.id===t.productId)?.name||"produk terhapus")+'</small>':""}</td><td>${escapeHtml(t.category)}</td><td><span class="status ${t.type==="income"?"ok":"low"}">${t.type==="income"?"Pemasukan":"Pengeluaran"}</span></td><td class="align-right ${t.type==="income"?"amount-in":"amount-out"}">${rupiah(t.amount)}</td><td><div class="row-actions"><button class="mini-btn" data-edit-tx="${t.id}">Edit</button><button class="mini-btn delete" data-delete-tx="${t.id}">Hapus</button></div></td></tr>`).join("");
 $("transactions-empty").classList.toggle("hidden",list.length>0);
 document.querySelectorAll("[data-edit-tx]").forEach(b=>b.onclick=()=>editTransaction(b.dataset.editTx));document.querySelectorAll("[data-delete-tx]").forEach(b=>b.onclick=()=>deleteTransaction(b.dataset.deleteTx));
}
["transaction-search","transaction-filter","month-filter"].forEach(id=>$(id).addEventListener("input",renderTransactions));
function editTransaction(id){const t=data.transactions.find(x=>x.id===id);if(!t)return;$("transaction-form").reset();$("transaction-id").value=t.id;$("transaction-type").value=t.type;$("transaction-date").value=t.date;$("transaction-description").value=t.description;$("transaction-category").value=t.category;$("transaction-amount").value=t.amount;populateProductSelect();$("transaction-product").value=t.productId||"";$("transaction-quantity").value=t.quantity||1;$("quantity-field").classList.toggle("hidden",!t.productId);openModal("transaction")}
function deleteTransaction(id){const t=data.transactions.find(x=>x.id===id);if(!t||!confirm("Hapus transaksi ini? Perubahan stok terkait akan dibatalkan."))return;if(t.productId){const p=data.products.find(x=>x.id===t.productId);if(p)p.stock+=t.type==="income"?-Number(t.quantity||0):Number(t.quantity||0)}data.transactions=data.transactions.filter(x=>x.id!==id);save();notify("Transaksi dihapus.")}
function renderReports(){const income=sum("income"),expense=sum("expense"),net=income-expense,inventory=data.products.reduce((a,p)=>a+p.stock*p.cost,0);$("report-income").textContent=rupiah(income);$("report-expense").textContent=rupiah(expense);$("report-net").textContent=rupiah(net);$("report-inventory").textContent=rupiah(inventory);$("report-product-count").textContent=data.products.length+" produk";
 const total=income+expense;$("report-breakdown").innerHTML=[["Pemasukan",income],["Pengeluaran",expense]].map(([name,val])=>`<div class="break-row"><span>${name}</span><div class="break-track"><span style="width:${total?val/total*100:0}%"></span></div><b>${rupiah(val)}</b></div>`).join("");
 $("inventory-report").innerHTML=data.products.length?data.products.map(p=>`<tr><td><b>${escapeHtml(p.name)}</b></td><td>${p.stock}</td><td>${rupiah(p.cost)}</td><td>${rupiah(p.stock*p.cost)}</td></tr>`).join(""):'<tr><td colspan="4" class="empty-state">Belum ada produk.</td></tr>'}
$("export-csv").onclick=()=>{const rows=[["Tanggal","Deskripsi","Kategori","Tipe","Jumlah (Rp)","Produk","Jumlah Unit"],...data.transactions.map(t=>[t.date,t.description,t.category,t.type,t.amount,data.products.find(p=>p.id===t.productId)?.name||"",t.quantity||""])];downloadFile("laporan-transaksi-cahaya-idola.csv","\ufeff"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n"),"text/csv;charset=utf-8");notify("Laporan CSV berhasil diunduh.")};
$("export-backup").onclick=()=>{downloadFile("backup-cahaya-idola-"+today()+".json",JSON.stringify({app:"Cahaya Idola",version:1,exportedAt:new Date().toISOString(),...data},null,2),"application/json");notify("Backup data berhasil diunduh.")};
$("import-backup").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.products)||!Array.isArray(parsed.transactions))throw Error("Format backup tidak sesuai.");if(!confirm("Pulihkan backup? Data saat ini akan diganti."))return;data={products:parsed.products,transactions:parsed.transactions};save();notify("Data berhasil dipulihkan.")}catch(err){notify("File backup tidak valid.")}finally{e.target.value=""}});
function downloadFile(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/service-worker.js").catch(err=>console.warn("PWA worker:",err)))}
updateConnection();renderAll();
