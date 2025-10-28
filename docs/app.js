const isHost = currentSession.host === currentUser.username;

// Display table info
tableCode.textContent = `${currentSession.tableLabel} (${currentSession.tableCode})`;

// Display participants
function renderParticipants() {
  participantsList.innerHTML = currentSession.participants
    .map(
      (p) => `
      <li>
        ${p.displayName} 
        ${
          p.username === currentSession.host
            ? '<span class="host-badge">HOST</span>'
            : ""
        }
      </li>
    `
    )
    .join("");
}

// Host controls
if (isHost) {
  hostControls.innerHTML = `
      <button id="btn-end-session" style="width:100%;background:#ef4444;margin-top:12px">Encerrar Mesa</button>
      <button id="btn-change-host" style="width:100%;background:rgba(255,255,255,0.1);margin-top:8px">Transferir Anfitrião</button>
    `;

  $("btn-end-session").addEventListener("click", () => {
    if (confirm("Encerrar a mesa para todos?")) {
      const sessions = loadSessions();
      delete sessions[currentSession.tableCode];
      saveSessions(sessions);
      localStorage.removeItem("mesalink_current_user");
      alert("Mesa encerrada!");
      window.location.href = "./index.html";
    }
  });

  $("btn-change-host").addEventListener("click", () => {
    const others = currentSession.participants.filter(
      (p) => p.username !== currentUser.username
    );
    if (others.length === 0) {
      alert("Não há outros participantes na mesa");
      return;
    }

    const options = others
      .map((p, i) => `${i + 1}. ${p.displayName}`)
      .join("\n");
    const choice = prompt(
      `Transferir anfitrião para:\n\n${options}\n\nDigite o número:`
    );

    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < others.length) {
      currentSession.host = others[idx].username;
      saveSessions(sessions);
      alert(`${others[idx].displayName} agora é o anfitrião!`);
      window.location.reload();
    }
  });
} // MesaLink — front-end JS (login, mesa, restaurante)
(function () {
  // util
  const $ = (id) => document.getElementById(id);

  // load DBs - Promise-based loading with better error handling
  let USERS = [];
  let REST = null;
  let dataLoaded = false;

  // Cardápio mockado (sem necessidade de restaurant.json para simulação)
  REST = {
    id: "rest1",
    name: "Restaurante Demo",
    tables: [
      { code: "TABLE1", label: "Mesa 1" },
      { code: "TABLE2", label: "Mesa 2" },
      { code: "TABLE5", label: "Mesa 5" },
      { code: "MESA10", label: "Mesa 10" },
    ],
    menu: [
      {
        id: "m1",
        name: "Pizza Grande",
        price: 100.0,
        splitable: true,
        category: "Pratos",
      },
      {
        id: "m2",
        name: "Refil Refrigerante",
        price: 15.0,
        splitable: false,
        category: "Bebidas",
      },
      {
        id: "m3",
        name: "Batata Frita",
        price: 23.0,
        splitable: true,
        category: "Petiscos",
      },
      {
        id: "m4",
        name: "Salgado",
        price: 8.0,
        splitable: false,
        category: "Petiscos",
      },
      {
        id: "m5",
        name: "Hambúrguer Artesanal",
        price: 35.0,
        splitable: false,
        category: "Pratos",
      },
      {
        id: "m6",
        name: "Cerveja Long Neck",
        price: 12.0,
        splitable: false,
        category: "Bebidas",
      },
      {
        id: "m7",
        name: "Porção de Frango",
        price: 45.0,
        splitable: true,
        category: "Petiscos",
      },
      {
        id: "m8",
        name: "Suco Natural",
        price: 10.0,
        splitable: false,
        category: "Bebidas",
      },
      {
        id: "m9",
        name: "Sobremesa",
        price: 18.0,
        splitable: true,
        category: "Sobremesas",
      },
    ],
    settings: {
      default_tip_percent: 10,
    },
  };

  const loadData = Promise.all([
    fetch("users.json")
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar users.json");
        return r.json();
      })
      .then((j) => {
        USERS = j.users;
        console.log("✓ users.json carregado:", USERS.length, "usuários");
      })
      .catch((err) => {
        console.warn("⚠ users.json não encontrado, usando dados mockados", err);
        USERS = [
          { username: "Hugo", password: "1123581321", displayName: "Hugo" },
          {
            username: "Chrysthian",
            password: "1123581321",
            displayName: "Chrysthian",
          },
          { username: "Rafael", password: "1123581321", displayName: "Rafael" },
          {
            username: "Admin",
            password: "1123581321",
            displayName: "Admin",
            role: "restaurant",
          },
        ];
      }),
  ])
    .then(() => {
      dataLoaded = true;
      console.log("✓ Todos os dados carregados com sucesso");
    })
    .catch((err) => {
      console.error("✗ Erro ao carregar dados:", err);
    });

  // small helpers
  function findUser(u, p) {
    return USERS.find((x) => x.username === u && x.password === p);
  }
  function saveSessions(sessions) {
    localStorage.setItem("mesalink_sessions", JSON.stringify(sessions));
  }
  function loadSessions() {
    return JSON.parse(localStorage.getItem("mesalink_sessions") || "{}");
  }

  // ============================================
  // LOGIN (index.html)
  // ============================================
  const btnLogin = $("btn-login");
  if (btnLogin) {
    btnLogin.disabled = true;
    btnLogin.textContent = "Carregando...";
    setTimeout(() => {
      btnLogin.disabled = false;
      btnLogin.textContent = "Entrar";
    }, 800);

    btnLogin.addEventListener("click", () => {
      if (!dataLoaded && USERS.length === 0) {
        alert("Erro ao carregar dados. Recarregue a página.");
        return;
      }
      const u = $("username").value.trim();
      const p = $("password").value.trim();
      if (!u || !p) {
        alert("Preencha usuário e senha");
        return;
      }
      const user = findUser(u, p);
      if (!user) {
        alert("Usuário ou senha inválidos");
        return;
      }
      localStorage.setItem("mesalink_current_user", JSON.stringify(user));
      if (user.role === "restaurant")
        window.location.href = "./restaurant.html";
      else window.location.href = "./mesa.html";
    });
  }

  // ============================================
  // MESA (mesa.html)
  // ============================================
  const userInfo = $("user-info");
  if (userInfo) {
    loadData
      .then(() => {
        const currentUser = JSON.parse(
          localStorage.getItem("mesalink_current_user") || "null"
        );
        if (!currentUser) {
          alert("Faça login primeiro");
          window.location.href = "./index.html";
          return;
        }

        userInfo.textContent = currentUser.displayName;

        // Initialize mesa functionality
        initMesa(currentUser);
      })
      .catch((err) => {
        alert("Erro ao carregar dados. Voltando para login...");
        window.location.href = "./index.html";
      });
  }

  function initMesa(currentUser) {
    const tableCode = $("table-code");
    const participantsList = $("participants-list");
    const hostControls = $("host-controls");
    const menuList = $("menu-list");
    const cartList = $("cart-list");
    const tipInput = $("tip-input");
    const btnCalc = $("btn-calc");
    const totals = $("totals");

    // Get or create session
    const sessions = loadSessions();
    let currentSession = null;

    // Check if user is already in a session
    for (let code in sessions) {
      if (
        sessions[code].participants.some(
          (p) => p.username === currentUser.username
        )
      ) {
        currentSession = sessions[code];
        break;
      }
    }

    // If no session, prompt for table code
    if (!currentSession) {
      showTableSelector();
      return;
    }

    continueInitMesa(currentSession, currentUser);
  }

  function showTableSelector() {
    const mainLayout = document.querySelector(".layout");
    if (!mainLayout) return;

    mainLayout.innerHTML = `
    <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center">
      <div class="card" style="max-width:500px;width:100%;text-align:center">
        <h2 style="margin:0 0 20px 0">Conectar à Mesa</h2>
        
        <button onclick="scanQRCode()" style="width:100%;padding:20px;font-size:18px;margin-bottom:16px;background:var(--accent)">
          📷 Escanear QR Code da Mesa
        </button>
        
        <div style="margin:20px 0;color:var(--muted)">ou</div>
        
        <label style="display:block;text-align:left;margin-bottom:8px">Digite o Código da Mesa:</label>
        <input id="manual-code" placeholder="Ex: TABLE5" style="width:100%;text-transform:uppercase" />
        <button onclick="joinTableManual()" style="width:100%;margin-top:12px">
          Conectar
        </button>
        
        <div class="muted small" style="margin-top:20px;text-align:left">
          <strong>Mesas disponíveis (DEMO):</strong><br>
          TABLE1, TABLE2, TABLE5, MESA10
        </div>
      </div>
    </div>
  `;
  }

  window.scanQRCode = () => {
    // Simulate QR Code scan
    const modal = document.createElement("div");
    modal.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.95);
    display:flex;align-items:center;justify-content:center;
    z-index:9999;padding:20px;
  `;

    modal.innerHTML = `
    <div style="max-width:400px;width:100%;text-align:center">
      <div style="background:var(--bg);padding:32px;border-radius:16px;border:2px solid var(--accent)">
        <h2 style="margin:0 0 20px 0">Escaneando QR Code</h2>
        
        <div style="width:250px;height:250px;margin:0 auto 20px;background:rgba(255,255,255,0.05);border-radius:12px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
          <div id="scan-line" style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent);box-shadow:0 0 20px var(--accent)"></div>
          <div style="font-size:100px">📱</div>
        </div>
        
        <p class="muted">Posicione o QR Code da mesa na câmera</p>
        
        <button onclick="simulateQRScan()" style="width:100%;margin-top:16px;background:#10b981">
          ✓ Simular Leitura (DEMO)
        </button>
        
        <button onclick="closeScanModal()" style="width:100%;margin-top:12px;background:#ef4444">
          Cancelar
        </button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    window.scanModal = modal;

    // Animate scan line
    const scanLine = modal.querySelector("#scan-line");
    let pos = 0;
    const scanInterval = setInterval(() => {
      pos += 2;
      if (pos > 250) pos = 0;
      if (scanLine) scanLine.style.top = pos + "px";
    }, 20);

    window.scanInterval = scanInterval;
  };

  window.simulateQRScan = () => {
    if (window.scanInterval) clearInterval(window.scanInterval);

    // Simulate reading TABLE5
    const tables = ["TABLE1", "TABLE2", "TABLE5", "MESA10"];
    const randomTable = tables[Math.floor(Math.random() * tables.length)];

    if (window.scanModal) {
      window.scanModal.querySelector("div > div").innerHTML = `
      <div style="font-size:64px;margin-bottom:16px">✅</div>
      <h2 style="margin:0 0 12px 0;color:#10b981">QR Code Lido!</h2>
      <p style="font-size:20px;margin:16px 0"><strong>${randomTable}</strong></p>
      <p class="muted">Conectando à mesa...</p>
    `;

      setTimeout(() => {
        closeScanModal();
        joinTableByCode(randomTable);
      }, 1500);
    }
  };

  window.closeScanModal = () => {
    if (window.scanInterval) clearInterval(window.scanInterval);
    if (window.scanModal) {
      document.body.removeChild(window.scanModal);
      window.scanModal = null;
    }
  };

  window.joinTableManual = () => {
    const code = document
      .getElementById("manual-code")
      ?.value.trim()
      .toUpperCase();
    if (!code) {
      alert("Digite o código da mesa");
      return;
    }
    joinTableByCode(code);
  };

  function joinTableByCode(code) {
    const currentUser = JSON.parse(
      localStorage.getItem("mesalink_current_user") || "null"
    );
    if (!currentUser) {
      window.location.href = "./index.html";
      return;
    }

    const table = REST.tables.find((t) => t.code === code);
    if (!table) {
      alert("Mesa não encontrada! Use: TABLE1, TABLE2, TABLE5 ou MESA10");
      return;
    }

    const sessions = loadSessions();

    // Create or join session
    if (!sessions[code]) {
      sessions[code] = {
        tableCode: code,
        tableLabel: table.label,
        host: currentUser.username,
        participants: [],
        orders: {},
      };
    }

    // Check if user already in session
    if (
      !sessions[code].participants.some(
        (p) => p.username === currentUser.username
      )
    ) {
      sessions[code].participants.push({
        username: currentUser.username,
        displayName: currentUser.displayName,
      });
    }

    saveSessions(sessions);

    // Reload page to show mesa interface
    window.location.reload();
  }

  function continueInitMesa(currentSession, currentUser) {
    const tableCode = $("table-code");
    const participantsList = $("participants-list");
    const hostControls = $("host-controls");
    const menuList = $("menu-list");
    const cartList = $("cart-list");
    const tipInput = $("tip-input");
    const btnCalc = $("btn-calc");
    const totals = $("totals");

    const sessions = loadSessions();

    // Display menu with categories
    const categories = [...new Set(REST.menu.map((item) => item.category))];

    menuList.innerHTML = categories
      .map((category) => {
        const items = REST.menu.filter((item) => item.category === category);
        return `
      <div style="margin-bottom:16px">
        <h3 style="margin:0 0 8px 0;color:var(--accent);font-size:14px">${category}</h3>
        ${items
          .map(
            (item) => `
          <div class="menu-item" style="margin-bottom:8px">
            <div>
              <strong>${item.name}</strong><br>
              <span class="muted">R$ ${item.price.toFixed(2)}</span>
              ${
                item.splitable
                  ? '<br><span style="color:var(--accent);font-size:11px">✓ Divisível</span>'
                  : ""
              }
            </div>
            <button onclick="addToCart('${item.id}')">+</button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
      })
      .join("");

    // Cart management with split option
    if (!currentSession.orders[currentUser.username]) {
      currentSession.orders[currentUser.username] = [];
    }

    window.addToCart = (itemId) => {
      const item = REST.menu.find((m) => m.id === itemId);
      const orderItem = {
        ...item,
        orderId: Date.now() + Math.random(), // Unique ID for each order
        splitWith: [], // Users to split with
      };
      currentSession.orders[currentUser.username].push(orderItem);
      saveSessions(sessions);
      renderCart();
    };

    window.removeFromCart = (orderId) => {
      const idx = currentSession.orders[currentUser.username].findIndex(
        (item) => item.orderId === orderId
      );
      if (idx !== -1) {
        currentSession.orders[currentUser.username].splice(idx, 1);
        saveSessions(sessions);
        renderCart();
      }
    };

    window.toggleSplit = (orderId) => {
      const item = currentSession.orders[currentUser.username].find(
        (i) => i.orderId === orderId
      );
      if (!item || !item.splitable) return;

      // Get all participants except current user
      const others = currentSession.participants.filter(
        (p) => p.username !== currentUser.username
      );

      if (item.splitWith.length === 0) {
        // Split with everyone
        item.splitWith = others.map((p) => p.username);
      } else {
        // Remove split
        item.splitWith = [];
      }

      saveSessions(sessions);
      renderCart();
    };

    function renderCart() {
      const myOrders = currentSession.orders[currentUser.username] || [];
      if (myOrders.length === 0) {
        cartList.innerHTML = '<div class="muted">Nenhum pedido ainda</div>';
        return;
      }

      cartList.innerHTML = myOrders
        .map((item) => {
          const splitCount = item.splitWith.length + 1; // +1 for current user
          const splitPrice =
            item.splitable && item.splitWith.length > 0
              ? item.price / splitCount
              : item.price;

          return `
        <div class="cart-item" style="flex-direction:column;align-items:flex-start">
          <div style="display:flex;justify-content:space-between;width:100%;margin-bottom:4px">
            <div>
              <strong>${item.name}</strong><br>
              <span class="muted">R$ ${item.price.toFixed(2)}</span>
              ${
                item.splitWith.length > 0
                  ? `<br><span style="color:var(--accent);font-size:11px">Dividido por ${splitCount} = R$ ${splitPrice.toFixed(
                      2
                    )}</span>`
                  : ""
              }
            </div>
            <button onclick="removeFromCart(${
              item.orderId
            })" style="padding:4px 8px">✕</button>
          </div>
          ${
            item.splitable
              ? `
            <button onclick="toggleSplit(${
              item.orderId
            })" style="width:100%;padding:6px;font-size:12px;background:${
                  item.splitWith.length > 0
                    ? "#10b981"
                    : "rgba(255,255,255,0.1)"
                };margin-top:4px">
              ${item.splitWith.length > 0 ? "✓ Dividindo" : "Dividir item"}
            </button>
          `
              : ""
          }
        </div>
      `;
        })
        .join("");
    }

    // Calculate split with detailed breakdown
    btnCalc.addEventListener("click", () => {
      const tip = parseFloat(tipInput.value) || 0;

      let totalTable = 0;
      let mySubtotal = 0;
      let breakdown = {};

      // Initialize breakdown for all participants
      currentSession.participants.forEach((p) => {
        breakdown[p.username] = {
          displayName: p.displayName,
          items: [],
          subtotal: 0,
        };
      });

      // Calculate totals and splits
      for (let username in currentSession.orders) {
        const userOrders = currentSession.orders[username];
        userOrders.forEach((item) => {
          const fullPrice = item.price;
          totalTable += fullPrice;

          if (item.splitable && item.splitWith && item.splitWith.length > 0) {
            // Item is split
            const splitCount = item.splitWith.length + 1;
            const splitPrice = fullPrice / splitCount;

            // Add to orderer
            breakdown[username].items.push(
              `${item.name} (${splitCount}x) - R$ ${splitPrice.toFixed(2)}`
            );
            breakdown[username].subtotal += splitPrice;

            // Add to split participants
            item.splitWith.forEach((splitUser) => {
              if (breakdown[splitUser]) {
                breakdown[splitUser].items.push(
                  `${item.name} (${splitCount}x) - R$ ${splitPrice.toFixed(2)}`
                );
                breakdown[splitUser].subtotal += splitPrice;
              }
            });
          } else {
            // Item not split
            breakdown[username].items.push(
              `${item.name} - R$ ${fullPrice.toFixed(2)}`
            );
            breakdown[username].subtotal += fullPrice;
          }

          if (username === currentUser.username) {
            if (item.splitable && item.splitWith && item.splitWith.length > 0) {
              mySubtotal += fullPrice / (item.splitWith.length + 1);
            } else {
              mySubtotal += fullPrice;
            }
          }
        });
      }

      const tipAmount = (totalTable * tip) / 100;
      const tipPerPerson = tipAmount / currentSession.participants.length;
      const myTotalWithTip = mySubtotal + tipPerPerson;

      // Generate detailed breakdown
      let detailedBreakdown =
        '<div style="max-height:200px;overflow-y:auto;margin-bottom:12px;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px">';

      for (let username in breakdown) {
        const user = breakdown[username];
        if (user.items.length === 0) continue;

        detailedBreakdown += `
        <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1)">
          <strong style="color:${
            username === currentUser.username ? "var(--accent)" : "inherit"
          }">${user.displayName}:</strong><br>
          ${user.items
            .map((item) => `<span class="muted small">• ${item}</span><br>`)
            .join("")}
          <strong>Subtotal: R$ ${user.subtotal.toFixed(2)}</strong>
        </div>
      `;
      }
      detailedBreakdown += "</div>";

      totals.innerHTML =
        detailedBreakdown +
        `
      <div style="margin-bottom:8px">
        <strong>Total da mesa:</strong> R$ ${totalTable.toFixed(2)}
      </div>
      <div style="margin-bottom:8px">
        <strong>Gorjeta total (${tip}%):</strong> R$ ${tipAmount.toFixed(2)}
      </div>
      <div style="margin-bottom:8px">
        <strong>Seu consumo:</strong> R$ ${mySubtotal.toFixed(2)}
      </div>
      <div style="margin-bottom:8px">
        <strong>Sua parte da gorjeta:</strong> R$ ${tipPerPerson.toFixed(2)}
      </div>
      <div style="margin-top:12px;padding-top:12px;border-top:2px solid var(--accent)">
        <strong style="font-size:20px;color:var(--accent)">Você paga: R$ ${myTotalWithTip.toFixed(
          2
        )}</strong>
      </div>
      <button id="btn-payment" style="width:100%;margin-top:12px;background:#10b981">Ir para Pagamento</button>
    `;

      // Payment button
      const btnPayment = $("btn-payment");
      if (btnPayment) {
        btnPayment.addEventListener("click", () => {
          showPaymentModal(myTotalWithTip);
        });
      }
    });

    renderParticipants();
    renderCart();

    // Auto-refresh participants (simulate real-time)
    setInterval(() => {
      const updatedSessions = loadSessions();
      if (updatedSessions[currentSession.tableCode]) {
        currentSession = updatedSessions[currentSession.tableCode];
        renderParticipants();
        renderCart();
      } else {
        alert("A mesa foi encerrada pelo host");
        localStorage.removeItem("mesalink_current_user");
        window.location.href = "./index.html";
      }
    }, 3000);
  }

  // Payment Modal (Demo)
  function showPaymentModal(amount) {
    const modal = document.createElement("div");
    modal.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.9);
    display:flex;align-items:center;justify-content:center;
    z-index:9999;padding:20px;
  `;

    modal.innerHTML = `
    <div style="background:var(--bg);padding:24px;border-radius:16px;max-width:400px;width:100%;border:2px solid var(--accent)">
      <h2 style="margin:0 0 16px 0;color:var(--accent)">Selecione o Pagamento</h2>
      <div style="font-size:24px;margin-bottom:20px">
        <strong>Total: R$ ${amount.toFixed(2)}</strong>
      </div>
      
      <div style="display:grid;gap:12px">
        <button onclick="processPayment('pix', ${amount})" style="width:100%;padding:16px;font-size:16px;background:#32BCAD">
          💚 PIX
        </button>
        <button onclick="processPayment('credito', ${amount})" style="width:100%;padding:16px;font-size:16px;background:#0066CC">
          💳 Cartão de Crédito
        </button>
        <button onclick="processPayment('debito', ${amount})" style="width:100%;padding:16px;font-size:16px;background:#FF6B00">
          💳 Cartão de Débito
        </button>
        <button onclick="processPayment('nubank', ${amount})" style="width:100%;padding:16px;font-size:16px;background:#8A05BE">
          🟣 Nubank
        </button>
        <button onclick="processPayment('picpay', ${amount})" style="width:100%;padding:16px;font-size:16px;background:#11C76F">
          🎯 PicPay
        </button>
      </div>
      
      <button onclick="closePaymentModal()" style="width:100%;margin-top:16px;background:#ef4444">
        Cancelar
      </button>
    </div>
  `;

    document.body.appendChild(modal);
    window.paymentModal = modal;
  }

  window.processPayment = (method, amount) => {
    const methodNames = {
      pix: "PIX",
      credito: "Cartão de Crédito",
      debito: "Cartão de Débito",
      nubank: "Nubank",
      picpay: "PicPay",
    };

    // Simulate payment processing
    if (window.paymentModal) {
      window.paymentModal.innerHTML = `
      <div style="background:var(--bg);padding:32px;border-radius:16px;max-width:400px;width:100%;border:2px solid var(--accent);text-align:center">
        <div style="font-size:64px;margin-bottom:16px">⏳</div>
        <h2 style="margin:0 0 12px 0">Processando...</h2>
        <p class="muted">Aguarde enquanto processamos seu pagamento via ${methodNames[method]}</p>
      </div>
    `;

      setTimeout(() => {
        if (window.paymentModal) {
          window.paymentModal.innerHTML = `
          <div style="background:var(--bg);padding:32px;border-radius:16px;max-width:400px;width:100%;border:2px solid #10b981;text-align:center">
            <div style="font-size:64px;margin-bottom:16px">✅</div>
            <h2 style="margin:0 0 12px 0;color:#10b981">Pagamento Aprovado!</h2>
            <p class="muted">Pagamento de <strong>R$ ${amount.toFixed(
              2
            )}</strong> via ${methodNames[method]}</p>
            <p class="muted" style="margin-top:16px">Comprovante: #${Math.random()
              .toString(36)
              .substr(2, 9)
              .toUpperCase()}</p>
            <button onclick="closePaymentModal()" style="width:100%;margin-top:20px;background:#10b981;font-size:16px;padding:14px">
              Fechar
            </button>
          </div>
        `;
        }
      }, 2500);
    }
  };

  window.closePaymentModal = () => {
    if (window.paymentModal) {
      document.body.removeChild(window.paymentModal);
      window.paymentModal = null;
    }
  };

  // ============================================
  // RESTAURANT (restaurant.html)
  // ============================================
  const restLoginBtn = $("rest-login-btn");
  if (restLoginBtn) {
    restLoginBtn.disabled = true;
    restLoginBtn.textContent = "Carregando...";

    loadData
      .then(() => {
        restLoginBtn.disabled = false;
        restLoginBtn.textContent = "Entrar";
      })
      .catch((err) => {
        restLoginBtn.disabled = false;
        restLoginBtn.textContent = "Erro - Tentar Novamente";
        alert("Erro ao carregar dados. Verifique os arquivos JSON.");
      });

    restLoginBtn.addEventListener("click", () => {
      if (!dataLoaded) {
        alert("Aguarde o carregamento dos dados ou recarregue a página...");
        return;
      }

      const u = $("rest-username").value.trim();
      const p = $("rest-password").value.trim();

      if (!u || !p) {
        alert("Preencha usuário e senha");
        return;
      }

      const user = findUser(u, p);

      if (!user || user.role !== "restaurant") {
        alert("Acesso negado. Use: Admin / 1123581321");
        return;
      }

      // Show dashboard
      $("rest-dashboard").classList.remove("hidden");
      renderActiveSessions();
    });
  }

  function renderActiveSessions() {
    const sessions = loadSessions();
    const activeSessionsList = $("active-sessions");

    if (!activeSessionsList) return;

    const sessionKeys = Object.keys(sessions);

    if (sessionKeys.length === 0) {
      activeSessionsList.innerHTML =
        '<li class="muted">Nenhuma mesa ativa no momento</li>';
      setTimeout(renderActiveSessions, 5000);
      return;
    }

    const html = sessionKeys
      .map((code) => {
        const s = sessions[code];
        let totalTable = 0;
        for (let username in s.orders) {
          s.orders[username].forEach((item) => (totalTable += item.price));
        }

        return `
      <li style="margin-bottom:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px">
        <strong>${s.tableLabel} (${s.tableCode})</strong><br>
        <span class="muted">Host: ${s.host}</span><br>
        <span class="muted">Participantes: ${s.participants
          .map((p) => p.displayName)
          .join(", ")}</span><br>
        <strong style="color:var(--accent)">Total: R$ ${totalTable.toFixed(
          2
        )}</strong>
      </li>
    `;
      })
      .join("");

    activeSessionsList.innerHTML = html;

    // Auto-refresh every 5 seconds
    setTimeout(renderActiveSessions, 5000);
  }
})();
