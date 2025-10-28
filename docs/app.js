// MesaLink demo front-end
(async function(){
// util
const $ = id => document.getElementById(id)


// fetch DBs
const usersResp = await fetch('users.json').then(r=>r.json())
const restResp = await fetch('restaurant.json').then(r=>r.json())


const USERS = usersResp.users
const REST = restResp.restaurant


// Simple helpers
function findUser(u,p){ return USERS.find(x=>x.username===u && x.password===p)}


// Login handling (user)
const loginSection = $('login-section')
const joinSection = $('join-section')
const sessionSection = $('session-section')
const btnLogin = $('btn-login')
const btnJoin = $('btn-join')
const btnCalc = $('btn-calc')


let currentUser = null
let currentSession = null // {tableCode, host, participants:[], cart:[]}


function show(el){ el.classList.remove('hidden') }
function hide(el){ el.classList.add('hidden') }


btnLogin.addEventListener('click', ()=>{
const u = $('username').value.trim()
const p = $('password').value.trim()
const user = findUser(u,p)
if(!user){ alert('Usuário ou senha inválidos') ; return }
currentUser = user
hide(loginSection); show(joinSection)