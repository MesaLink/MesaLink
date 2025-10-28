// =============================================
// MesaLink — app.js (versão corrigida 28/10/2025)
// =============================================

(function(){
  const $ = id => document.getElementById(id);
  let USERS = [];
  let REST = null;
  let dataLoaded = false;

  // =============================================
  // 1. CARREGAR DADOS
  // =============================================
  function loadData(){
    Promise.all([
      fetch('users.json').then(r=>r.json()).then(j=>{USERS=j.users;}),
      fetch('restaurant.json').then(r=>r.json()).then(j=>{REST=j.restaurant;})
    ]).catch(err=>{
      console.warn('⚠ Dados locais não encontrados, usando mock',err);
      USERS=[
        {username:"Hugo",password:"1123581321",displayName:"Hugo"},
        {username:"Chrysthian",password:"1123581321",displayName:"Chrysthian"},
        {username:"Rafael",password:"1123581321",displayName:"Rafael"},
        {username:"Admin",password:"1123581321",displayName:"Admin",role:"restaurant"}
      ];
      REST={id:"rest1",name:"Restaurante Demo",tables:[{code:"TABLE5",label:"Mesa 5"}],menu:[{id:"m1",name:"Pizza",price:100,splitable:true},{id:"m2",name:"Refil",price:15,splitable:false},{id:"m3",name:"Batata",price:25,splitable:false},{id:"m4",name:"Salgado",price:10,splitable:false}]};
    }).finally(()=>{dataLoaded=true;});
  }

  // =============================================
  // 2. LOGIN
  // =============================================
  function initLogin(){
    const btn=$('btn-login');
    if(!btn) return;
    btn.addEventListener('click',()=>{
      if(!dataLoaded){alert('Carregando dados, tente novamente.');return;}
      const u=$('username').value.trim();
      const p=$('password').value.trim();
      const user=USERS.find(x=>x.username===u&&x.password===p);
      if(!user){alert('Usuário ou senha inválidos');return;}
      localStorage.setItem('mesalink_current_user',JSON.stringify(user));
      if(user.role==='restaurant') window.location.href='restaurant.html?v='+Date.now();
      else window.location.href='mesa.html?v='+Date.now();
    });
  }

  // =============================================
  // 3. MESA
  // =============================================
  function initMesa(){
    const main=document.querySelector('.menu-list');
    if(!main) return;
    const user=JSON.parse(localStorage.getItem('mesalink_current_user')||'{}');
    if(!user.username){window.location.href='index.html';return;}

    const participants=[user.displayName];
    const list=$('participants-list');
    list.innerHTML='';
    participants.forEach(u=>{const li=document.createElement('li');li.textContent=u;list.appendChild(li);});

    // Mostrar menu
    const menuDiv=$('menu-list');
    REST.menu.forEach(item=>{
      const div=document.createElement('div');
      div.className='menu-item';
      div.innerHTML=`<span>${item.name}</span><span>R$ ${item.price.toFixed(2)}</span>`;
      div.addEventListener('click',()=>addToCart(item));
      menuDiv.appendChild(div);
    });
  }

  // =============================================
  // 4. CARRINHO
  // =============================================
  const CART=[];
  function addToCart(item){
    CART.push(item);
    renderCart();
  }
  function renderCart(){
    const cart=$('cart-list');
    if(!cart) return;
    cart.innerHTML='';
    CART.forEach(i=>{
      const div=document.createElement('div');
      div.className='cart-item';
      div.innerHTML=`<span>${i.name}</span><span>R$ ${i.price.toFixed(2)}</span>`;
      cart.appendChild(div);
    });
    const total=CART.reduce((s,i)=>s+i.price,0);
    const tip=parseFloat($('tip-input')?.value||10)||0;
    const final=total+total*(tip/100);
    $('totals').innerHTML=`<b>Total:</b> R$ ${final.toFixed(2)} (com ${tip}% gorjeta)`;
  }

  // =============================================
  // 5. RESTAURANTE
  // =============================================
  function initRestaurante(){
    const btn=$('rest-login-btn');
    if(!btn) return;
    btn.addEventListener('click',()=>{
      const u=$('rest-username').value.trim();
      const p=$('rest-password').value.trim();
      const user=USERS.find(x=>x.username===u&&x.password===p&&x.role==='restaurant');
      if(!user){alert('Login inválido');return;}
      $('rest-dashboard').classList.remove('hidden');
    });
  }

  // =============================================
  // 6. INICIALIZAÇÃO
  // =============================================
  function init(){
    loadData();
    initLogin();
    setTimeout(()=>{initMesa();initRestaurante();},1500);
  }

  init();
})();