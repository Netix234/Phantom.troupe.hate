const KEY="pth_v2_products", CART="pth_v2_cart";
const seed=[
{id:"1",name:"PHANTOM HOODIE",price:120,category:"HOODIE",description:"Heavyweight oversized hoodie with Phantom graphic.",sizes:["S","M","L","XL"],image:""},
{id:"2",name:"TROUPE ZIP HOODIE",price:135,category:"HOODIE",description:"Dark burgundy zip hoodie with oversized silhouette.",sizes:["S","M","L","XL"],image:""},
{id:"3",name:"HATE TEE",price:55,category:"TEE",description:"Boxy washed tee with minimal front branding.",sizes:["S","M","L","XL"],image:""},
{id:"4",name:"NO SAINTS TEE",price:55,category:"TEE",description:"Oversized tee with cracked red back print.",sizes:["S","M","L","XL"],image:""},
{id:"5",name:"PHANTOM CAP",price:42,category:"ACCESSORY",description:"Low profile cap with embroidered PTH mark.",sizes:["ONE SIZE"],image:""},
{id:"6",name:"TROUPE BAG",price:70,category:"ACCESSORY",description:"Compact utility bag with metal hardware.",sizes:["ONE SIZE"],image:""}
];
let products=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
products=products.map(p=>({...p,images:Array.isArray(p.images)&&p.images.length?p.images:(p.image?[p.image]:[])}));
let cart=JSON.parse(localStorage.getItem(CART)||"[]");
let selected=null,size=null,preview="";
let adminPhotos=[];
let selectedPhotos=[];
let galleryIndex=0;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem(KEY,JSON.stringify(products))}
function saveCart(){localStorage.setItem(CART,JSON.stringify(cart))}
function placeholder(n){
return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 940"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1e8e9"/><stop offset=".58" stop-color="#dac9cc"/><stop offset="1" stop-color="#711324"/></linearGradient></defs><rect width="800" height="940" fill="url(#g)"/><text x="50%" y="47%" text-anchor="middle" font-family="Arial" font-size="55" font-weight="900" fill="#25070d">${n}</text><text x="50%" y="53%" text-anchor="middle" font-family="Arial" font-size="15" letter-spacing="7" fill="#4b2027">PHANTOM.TROUPE.HATE</text></svg>`);
}
function photos(p){
  if(Array.isArray(p.images) && p.images.length) return p.images;
  if(p.image) return [p.image];
  return [placeholder(p.name)];
}
function img(p){return photos(p)[0]}
function render(filter="ALL"){
let list=filter==="ALL"?products:products.filter(p=>p.category===filter);
$("#products").innerHTML=list.map(p=>`<article class="card" data-id="${p.id}"><div class="card-img"><img src="${img(p)}" alt=""></div><div class="card-info"><div><div class="card-name">${p.name}</div><div class="card-category">${p.category}</div></div><div class="card-price">₴${Number(p.price).toFixed(0)}</div></div></article>`).join("");
$$(".card").forEach(c=>c.onclick=()=>openProduct(c.dataset.id));
}
function modal(id,on=true){$("#"+id).classList.toggle("open",on)}
function renderGallery(){
  if(!selected)return;
  const list=selectedPhotos.length?selectedPhotos:[placeholder(selected.name)];
  $("#bigImage").style.backgroundImage=`url("${list[galleryIndex]||list[0]}")`;
  $("#galleryDots").innerHTML=list.length>1
    ? list.map((_,i)=>`<button class="gallery-dot ${i===galleryIndex?"active":""}" data-gallery="${i}"></button>`).join("")
    : "";
  $("#galleryPrev").style.display=list.length>1?"grid":"none";
  $("#galleryNext").style.display=list.length>1?"grid":"none";
  $$(".gallery-dot").forEach(b=>b.onclick=()=>{galleryIndex=+b.dataset.gallery;renderGallery()});
}
function openProduct(id){
  selected=products.find(p=>p.id===id); if(!selected)return;
  selectedPhotos=photos(selected); galleryIndex=0; renderGallery();
  $("#bigCategory").textContent=selected.category;
  $("#bigName").textContent=selected.name;
  $("#bigPrice").textContent=`₴${Number(selected.price).toFixed(0)}`;
  $("#bigDescription").textContent=selected.description;
  size=selected.sizes[0]||"ONE SIZE";
  $("#sizes").innerHTML=selected.sizes.map(s=>`<button class="size ${s===size?"active":""}" data-size="${s}">${s}</button>`).join("");
  $$(".size").forEach(b=>b.onclick=()=>{size=b.dataset.size;$$(".size").forEach(x=>x.classList.toggle("active",x===b))});
  modal("productModal");
}
$("#galleryPrev").onclick=()=>{galleryIndex=(galleryIndex-1+selectedPhotos.length)%selectedPhotos.length;renderGallery()};
$("#galleryNext").onclick=()=>{galleryIndex=(galleryIndex+1)%selectedPhotos.length;renderGallery()};
$$("[data-close]").forEach(b=>b.onclick=()=>modal(b.dataset.close,false));
$("#addBtn").onclick=()=>{
let x=cart.find(i=>i.id===selected.id&&i.size===size);
x?x.qty++:cart.push({id:selected.id,size,qty:1});
saveCart();updateCart();modal("productModal",false);openCart();
};
function updateCart(){
let data=cart.map(x=>({...x,p:products.find(p=>p.id===x.id)})).filter(x=>x.p);
let count=data.reduce((a,x)=>a+x.qty,0), total=data.reduce((a,x)=>a+x.qty*x.p.price,0);
$("#cartCount").textContent=count;$("#cartItemsCount").textContent=`${count} ITEMS`;$(`#cartTotal`).textContent=`₴${total.toFixed(0)}`;
$("#cartList").innerHTML=data.length?data.map((x,i)=>`<div class="cart-row"><img src="${img(x.p)}"><div><b>${x.p.name}</b><small>${x.size} · QTY ${x.qty}</small><small>₴${(x.p.price*x.qty).toFixed(0)}</small></div><button data-remove="${i}">×</button></div>`).join(""):`<div style="padding:45px 0;color:#907d82;font-size:9px;letter-spacing:.15em">YOUR CART IS EMPTY.</div>`;
$$("[data-remove]").forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.remove,1);saveCart();updateCart()});
}
function openCart(){$("#cart").classList.add("open");$("#cartOverlay").classList.add("open")}
function closeCart(){$("#cart").classList.remove("open");$("#cartOverlay").classList.remove("open")}
$("#cartBtn").onclick=openCart;$("#closeCart").onclick=closeCart;$("#cartOverlay").onclick=closeCart;
$("#accountBtn").onclick=()=>modal("accountModal");
$("#loginBtn").onclick=()=>{if(!$("#email").value.trim())return alert("Enter email");alert("Demo account.");modal("accountModal",false)};
$("#adminBtn").onclick=()=>modal("adminModal");
$("#unlock").onclick=()=>{
if($("#adminLogin").value==="admin"&&$("#adminPassword").value==="phantom"){modal("adminModal",false);$("#admin").classList.add("open");renderAdmin();resetForm()}else alert("Wrong login or password")
};
$("#closeAdmin").onclick=()=>$("#admin").classList.remove("open");
function renderAdmin(){
$("#adminList").innerHTML=products.map(p=>`<div class="admin-row"><img src="${img(p)}"><div><strong>${p.name}</strong><small>${p.category} · ₴${p.price}</small></div><div><button data-edit="${p.id}">EDIT</button> <button data-del="${p.id}">DEL</button></div></div>`).join("");
$$("[data-edit]").forEach(b=>b.onclick=()=>edit(b.dataset.edit));
$$("[data-del]").forEach(b=>b.onclick=()=>{products=products.filter(p=>p.id!==b.dataset.del);save();render();renderAdmin()});
}
function resetForm(){
$("#editorTitle").textContent="NEW PRODUCT";
$("#editId").value="";
$("#name").value="";
$("#price").value="";
$("#category").value="HOODIE";
$("#description").value="";
$("#productSizes").value="S, M, L, XL";
$("#photo").value="";
adminPhotos=[];
preview="";
renderPhotoPreview();
}
function edit(id){
let p=products.find(x=>x.id===id);if(!p)return;
$("#editorTitle").textContent="EDIT PRODUCT";
$("#editId").value=p.id;
$("#name").value=p.name;
$("#price").value=p.price;
$("#category").value=p.category;
$("#description").value=p.description;
$("#productSizes").value=p.sizes.join(", ");
adminPhotos=[...photos(p)];
preview=adminPhotos;
$("#photo").value="";
renderPhotoPreview();
}
$("#newProduct").onclick=resetForm;
function renderPhotoPreview(){
  const box=$("#preview");
  if(!adminPhotos.length){
    box.innerHTML='<span class="photo-empty">PHOTO PREVIEW — добавь одно или несколько фото</span>';
    return;
  }
  box.innerHTML=adminPhotos.map((src,i)=>`
    <div class="photo-item">
      <img class="preview-thumb" src="${src}" alt="Photo ${i+1}">
      <button type="button" class="photo-remove" data-photo-remove="${i}" aria-label="Remove photo">×</button>
      <span>${i+1}</span>
    </div>
  `).join("");
  $$("[data-photo-remove]").forEach(b=>b.onclick=()=>{
    adminPhotos.splice(Number(b.dataset.photoRemove),1);
    preview=adminPhotos;
    renderPhotoPreview();
  });
}
$("#photo").onchange=e=>{
  const files=[...e.target.files];
  if(!files.length)return;
  let done=0;
  files.forEach(file=>{
    const r=new FileReader();
    r.onload=()=>{
      adminPhotos.push(r.result);
      done++;
      if(done===files.length){
        preview=adminPhotos;
        renderPhotoPreview();
        $("#photo").value="";
      }
    };
    r.readAsDataURL(file);
  });
};
$("#form").onsubmit=e=>{
e.preventDefault();let id=$("#editId").value;
const photoList=[...adminPhotos];
let p={id:id||Date.now().toString(),name:$("#name").value.trim(),price:+$("#price").value,category:$("#category").value,description:$("#description").value.trim(),sizes:$("#productSizes").value.split(",").map(x=>x.trim()).filter(Boolean),images:photoList,image:photoList[0]||""};
if(id)products=products.map(x=>x.id===id?p:x);else products.unshift(p);
save();render();renderAdmin();resetForm();alert("Product saved");
};
$$(".filter").forEach(b=>b.onclick=()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.filter)});
$("#themeBtn").onclick=()=>{
  const black=!document.body.classList.contains("theme-black");
  document.body.classList.toggle("theme-black",black);
  document.body.classList.toggle("theme-light",!black);
  localStorage.setItem("pth_theme",black?"black":"light");
};
$("#checkout").onclick=()=>{
  if(!cart.length){alert("Корзина пуста.");return;}
  const total=cart.reduce((sum,x)=>{
    const p=products.find(p=>p.id===x.id);
    return sum+(p?p.price*x.qty:0);
  },0);
  $("#checkoutTotal").textContent=`₴${total.toFixed(0)}`;
  modal("checkoutModal",true);
};

$("#checkoutForm").onsubmit=(e)=>{
  e.preventDefault();
  const order={
    name:$("#orderName").value.trim(),
    phone:$("#orderPhone").value.trim(),
    city:$("#orderCity").value.trim(),
    branch:$("#orderBranch").value.trim(),
    comment:$("#orderComment").value.trim(),
    items:cart.map(x=>({id:x.id,size:x.size,qty:x.qty})),
    createdAt:new Date().toISOString()
  };
  localStorage.setItem("pth_last_order",JSON.stringify(order));
  alert("Заказ принят. Данные сохранены в браузере.");
  cart=[];
  saveCart();
  updateCart();
  e.target.reset();
  modal("checkoutModal",false);
  closeCart();
};

const savedTheme=localStorage.getItem("pth_theme");
if(savedTheme==="light") document.body.classList.add("theme-light");
else document.body.classList.add("theme-black");

window.onload=()=>{render();updateCart();setTimeout(()=>$("#loader").classList.add("hide"),1800)};

// Asset paths expected by this version:
// images/logo.png
// images/hero-banner.gif
document.querySelectorAll('img').forEach(img=>{
  img.addEventListener('error',()=>{
    if(img.closest('.hero-bg')){
      img.style.display='none';
      const f=document.createElement('div');
      f.className='asset-fallback';
      f.textContent='ADD images/hero-banner.gif';
      img.closest('.hero-bg').appendChild(f);
    }
  });
});
