function showToast(msg){
  let t=document.getElementById("toast");
  t.innerText=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),3000);
}

// --- AUTH LOGIC FOR index.html ---
const loginBtn = document.getElementById("loginBtn");
if(loginBtn){
  if(localStorage.getItem("sessionUser")) location.href="dashboard.html";
  
  loginBtn.onclick = () => {
    let e = document.getElementById("email").value.trim();
    let p = document.getElementById("password").value.trim();
    // Edge Case: Empty form
    if(!e || !p){ showToast("❌ Email and Password required"); return; }
    if(p.length < 4){ showToast("❌ Password must be 4+ characters"); return; }
    
    let users = JSON.parse(localStorage.getItem("users") || "{}");
    if(users[e] && users[e]===p){
      localStorage.setItem("sessionUser", e);
      showToast("✅ Login Successful");
      setTimeout(()=>location.href="dashboard.html",800);
    } else {
      showToast("❌ Wrong email or password");
    }
  };
  
  document.getElementById("signupBtn").onclick = () => {
    let e = document.getElementById("email").value.trim();
    let p = document.getElementById("password").value.trim();
    if(!e || !p){ showToast("❌ Fill all fields"); return; }
    let users = JSON.parse(localStorage.getItem("users") || "{}");
    if(users[e]){ showToast("⚠️ Account already exists"); return; }
    users[e]=p; localStorage.setItem("users", JSON.stringify(users));
    showToast("✅ Account created! Now Login");
  };
}

// --- DASHBOARD LOGIC ---
function getKey(){ return "data_" + localStorage.getItem("sessionUser"); }

function logout(){
  localStorage.removeItem("sessionUser");
  location.href="index.html";
}

async function fetchAPI(){
  let loader = document.getElementById("apiLoader");
  let box = document.getElementById("apiData");
  if(!loader) return;
  loader.style.display="block"; box.innerHTML="";
  try{
    // Public API - CoinGecko (No key needed)
    let res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1");
    let data = await res.json();
    loader.style.display="none";
    box.innerHTML = data.map(c=>`<div class="item"><b>${c.name} (${c.symbol.toUpperCase()})</b><span>$${c.current_price}</span></div>`).join("");
  }catch(err){
    loader.style.display="none";
    box.innerHTML="<p>Failed to load API. Check internet.</p>";
  }
}

function saveData(){
  let input = document.getElementById("metric");
  if(!input.value.trim()){ showToast("❌ Cannot save empty value"); return; }
  let all = JSON.parse(localStorage.getItem(getKey()) || "[]");
  all.push({id:Date.now(), text:input.value.trim()});
  localStorage.setItem(getKey(), JSON.stringify(all));
  input.value=""; loadData(); showToast("✅ Saved to your profile");
}

function loadData(){
  let list = document.getElementById("list");
  if(!list) return;
  let all = JSON.parse(localStorage.getItem(getKey()) || "[]");
  list.innerHTML = all.length===0 ? "<p style='color:#999'>No saved data yet</p>" : "";
  all.forEach(item=>{
    let div=document.createElement("div"); div.className="item";
    div.innerHTML=`<span>${item.text}</span><span><button onclick="editData(${item.id})">Edit</button> <button onclick="deleteData(${item.id})" style="background:#fee">Delete</button></span>`;
    list.appendChild(div);
  });
}

function deleteData(id){
  let all = JSON.parse(localStorage.getItem(getKey()) || "[]");
  all = all.filter(x=>x.id!==id);
  localStorage.setItem(getKey(), JSON.stringify(all));
  loadData(); showToast("🗑️ Deleted successfully");
}
function editData(id){
  let all = JSON.parse(localStorage.getItem(getKey()) || "[]");
  let item = all.find(x=>x.id===id);
  let newText = prompt("Edit your data:", item.text);
  if(newText && newText.trim()){
    item.text=newText.trim();
    localStorage.setItem(getKey(), JSON.stringify(all));
    loadData(); showToast("✏️ Updated successfully");
  }
}