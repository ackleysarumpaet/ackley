const KEY="motocareBookingsV2", PARTS="motocarePartsV2";

function getBookings(){return JSON.parse(localStorage.getItem(KEY)||"[]")}
function saveBookings(x){localStorage.setItem(KEY,JSON.stringify(x))}
function getParts(){return JSON.parse(localStorage.getItem(PARTS)||"null")||[
 {name:"Oli Mesin 10W-40",stock:18,min:5,price:55000},
 {name:"Kampas Rem Depan",stock:7,min:3,price:85000},
 {name:"Busi NGK",stock:12,min:5,price:30000},
 {name:"Filter Udara",stock:4,min:5,price:65000}
]}
function saveParts(x){localStorage.setItem(PARTS,JSON.stringify(x))}
function rupiah(n){return "Rp"+Number(n).toLocaleString("id-ID")}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

document.addEventListener("DOMContentLoaded",()=>{
 const bookingForm=document.getElementById("bookingForm");
 if(bookingForm){
  const d=document.getElementById("tanggal"); if(d)d.min=new Date().toISOString().split("T")[0];
  bookingForm.addEventListener("submit",e=>{
   e.preventDefault();
   const b={id:"MC-"+Date.now().toString().slice(-6),nama:nama.value,telepon:telepon.value,merk:merk.value,tipe:tipe.value,tanggal:tanggal.value,jam:jam.value,service:service.value,keluhan:keluhan.value,status:"Menunggu",created:new Date().toISOString()};
   const data=getBookings();data.push(b);saveBookings(data);
   document.getElementById("bookingResult").innerHTML=`<div class="success-box"><strong>✓ Booking berhasil dibuat</strong><p>Kode: <b>${b.id}</b><br>Motor: ${esc(b.merk)} ${esc(b.tipe)}<br>Jadwal: ${b.tanggal} • ${b.jam}<br>Status: <b>${b.status}</b></p></div>`;
   bookingForm.reset();
  });
 }
 const loginForm=document.getElementById("loginForm");
 if(loginForm){
  document.querySelectorAll(".role-tabs button").forEach(btn=>btn.onclick=()=>{
   document.querySelectorAll(".role-tabs button").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
   document.getElementById("role").value=btn.dataset.role;
   if(btn.dataset.role==="boss"){email.value="boss@motocare.com";password.value="boss123"}else{email.value="mekanik@motocare.com";password.value="mekanik123"}
  });
  loginForm.onsubmit=e=>{
   e.preventDefault();const r=role.value, ok=(r==="boss"&&email.value==="boss@motocare.com"&&password.value==="boss123")||(r==="mekanik"&&email.value==="mekanik@motocare.com"&&password.value==="mekanik123");
   if(ok){localStorage.setItem("motocareSession",JSON.stringify({role:r,name:r==="boss"?"Boss":"Mekanik"}));location.href="dashboard.html"}
   else document.getElementById("loginResult").innerHTML='<div class="error-box">Login salah. Gunakan akun demo di bawah.</div>';
  };
 }
 if(document.querySelector(".app-main")) initDashboard();
});

function initDashboard(){
 const session=JSON.parse(localStorage.getItem("motocareSession")||"null");
 if(!session){location.href="login.html";return}
 const boss=session.role==="boss";
 userName.textContent=session.name;userRole.textContent=boss?"OWNER":"MEKANIK";userAvatar.textContent=boss?"B":"M";
 dashName.textContent=session.name;dashEyebrow.textContent=boss?"OWNER DASHBOARD":"MECHANIC DASHBOARD";
 if(!boss){document.querySelectorAll(".boss-view,.boss-only").forEach(x=>x.style.display="none")}
 document.querySelectorAll(".side-link").forEach(btn=>btn.onclick=()=>showView(btn.dataset.view));
 document.querySelectorAll("[data-view-go]").forEach(x=>x.onclick=()=>showView(x.dataset.viewGo));
 logout.onclick=logoutUser;logoutMobile.onclick=logoutUser;
 addPart.onclick=()=>{const n=prompt("Nama sparepart?");if(!n)return;const s=Number(prompt("Jumlah stok?")||0);const p=Number(prompt("Harga?")||0);const arr=getParts();arr.push({name:n,stock:s,min:3,price:p});saveParts(arr);renderInventory()};
 renderAll();
}
function logoutUser(){localStorage.removeItem("motocareSession");location.href="login.html"}
function showView(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.getElementById(id)?.classList.add("active");document.querySelectorAll(".side-link").forEach(b=>b.classList.toggle("active",b.dataset.view===id));renderAll()}
function renderAll(){renderMetrics();renderRecent();renderBookings();renderWork();renderInventory();renderCustomers()}
function renderMetrics(){
 const a=getBookings();mBooking.textContent=a.length;mProcess.textContent=a.filter(x=>["Diproses","Pemeriksaan"].includes(x.status)).length;mDone.textContent=a.filter(x=>x.status==="Selesai").length;
 const rev={ "Ganti Oli":50000,"Service Ringan":75000,"Tune Up":100000,"Ban & Rem":60000,"Cek Mesin":50000};mRevenue.textContent=rupiah(a.filter(x=>x.status==="Selesai").reduce((s,x)=>s+(rev[x.service]||0),0))
}
function row(b,i){
 return `<div class="booking-row"><div class="code">${esc(b.id)}</div><div><b>${esc(b.nama)}</b><small>${esc(b.merk)} ${esc(b.tipe)}</small></div><div><b>${esc(b.service)}</b><small>${b.tanggal} • ${b.jam||"-"}</small></div><div><span class="status ${b.status.toLowerCase()}">${b.status}</span></div><div><select class="status-select" data-i="${i}"><option ${b.status==="Menunggu"?"selected":""}>Menunggu</option><option ${b.status==="Pemeriksaan"?"selected":""}>Pemeriksaan</option><option ${b.status==="Diproses"?"selected":""}>Diproses</option><option ${b.status==="Selesai"?"selected":""}>Selesai</option></select></div></div>`
}
function attachStatus(){document.querySelectorAll(".status-select").forEach(s=>s.onchange=()=>{const a=getBookings();a[Number(s.dataset.i)].status=s.value;saveBookings(a);renderAll()})}
function renderRecent(){const a=getBookings().slice(-5).reverse();recentBookings.innerHTML=a.length?a.map((b)=>row(b,getBookings().indexOf(b))).join(""):'<div class="empty">Belum ada booking.</div>';attachStatus()}
function renderBookings(){const a=getBookings();allBookings.innerHTML=a.length?a.slice().reverse().map(b=>row(b,getBookings().indexOf(b))).join(""):'<div class="empty">Belum ada booking.</div>';attachStatus()}
function renderWork(){const a=getBookings().filter(x=>["Pemeriksaan","Diproses"].includes(x.status));workGrid.innerHTML=a.length?a.map(b=>`<article class="work-card"><span class="status ${b.status.toLowerCase()}">${b.status}</span><h3>${esc(b.merk)} ${esc(b.tipe)}</h3><p>${esc(b.nama)} • ${esc(b.service)}</p><small>${esc(b.keluhan||"Tidak ada catatan keluhan.")}</small><button class="btn primary work-done" data-id="${b.id}">Tandai Selesai</button></article>`).join(""):'<div class="empty">Tidak ada pekerjaan aktif.</div>';document.querySelectorAll(".work-done").forEach(x=>x.onclick=()=>{const a=getBookings(),i=a.findIndex(b=>b.id===x.dataset.id);a[i].status="Selesai";saveBookings(a);renderAll()})}
function renderInventory(){if(!document.getElementById("inventoryGrid"))return;const a=getParts();inventoryGrid.innerHTML=a.map((p,i)=>`<article class="part-card"><div class="part-top"><span>SPAREPART</span><b>${p.stock<=p.min?"LOW STOCK":"AMAN"}</b></div><h3>${esc(p.name)}</h3><strong>${p.stock}</strong><small>unit tersedia</small><p>${rupiah(p.price)}</p><button class="stock-btn" data-i="${i}">+ Tambah Stok</button></article>`).join("");document.querySelectorAll(".stock-btn").forEach(x=>x.onclick=()=>{const a=getParts(),n=Number(prompt("Tambah stok:",5)||0);a[Number(x.dataset.i)].stock+=n;saveParts(a);renderInventory()})}
function renderCustomers(){if(!document.getElementById("customerTable"))return;const a=getBookings(),map={};a.forEach(b=>map[b.telepon]=b);const c=Object.values(map);customerTable.innerHTML=c.length?`<div class="customer-list">${c.map(x=>`<div class="customer-row"><span class="avatar">${esc(x.nama[0])}</span><div><b>${esc(x.nama)}</b><small>${esc(x.telepon)}</small></div><span>${esc(x.merk)} ${esc(x.tipe)}</span></div>`).join("")}</div>`:'<div class="empty">Belum ada data pelanggan.</div>'}
