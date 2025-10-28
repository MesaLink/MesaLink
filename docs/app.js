// MesaLink — front-end JS (login, mesa, restaurante)
(function(){
// util
const $ = id => document.getElementById(id)


// load DBs
let USERS = []
let REST = null
fetch('users.json').then(r=>r.json()).then(j=> USERS = j.users)
fetch('restaurant.json').then(r=>r.json()).then(j=> REST = j.restaurant)


// small helpers
function findUser(u,p){ return USERS.find(x=>x.username===u && x.password===p) }
function saveSessions(sessions){ localStorage.setItem('mesalink_sessions', JSON.stringify(sessions)) }
function loadSessions(){ return JSON.parse(localStorage.getItem('mesalink_sessions')||'{}') }


// LOGIN (index.html)
const btnLogin = $('btn-login')
if(btnLogin){
btnLogin.addEventListener('click', ()=>{
const u = $('username').value.trim(); const p = $('password').value.trim();
const user = findUser(u,p)
if(!user){ alert('Usuário ou senha inválidos'); return }
// store current user and redirect to mesa