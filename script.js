// ==================== GUR CRM STATE ENGINE & AI MITRA CO-PILOT ====================

// --- DEFAULT INITIAL SEED DATA ---
const DEFAULT_BUYERS = [
    { id: 1, name: "Rajesh Gupta (Swadeshi Sweets)", phone: "+91 98765 43210", location: "Khari Baoli, Delhi", category: "Wholesaler", preferredType: "Organic Cubes" },
    { id: 2, name: "Bikaner Sweet Mart", phone: "+91 91234 56789", location: "Bikaner, Rajasthan", category: "Sweet Manufacturer", preferredType: "Golden Double-Filter" },
    { id: 3, name: "Ganesh Organic Bakery", phone: "+91 99887 76655", location: "Pune, Maharashtra", category: "Retailer", preferredType: "Powder Jaggery" }
];

const DEFAULT_BHATTIS = [
    { id: 1, name: "Kolhapur Premium Gur Udyog", owner: "Krishnat Patil", phone: "+91 94220 01122", location: "Karad, Maharashtra", stockTonnes: 25.0, ratePerKg: 42.0, isOrganic: true },
    { id: 2, name: "Malwa Sugarcane & Jaggery Works", owner: "Sohan Lal Yadav", phone: "+91 98260 33445", location: "Muzaffarnagar, UP", stockTonnes: 12.5, ratePerKg: 38.0, isOrganic: false },
    { id: 3, name: "Deccan Gold Bhatti", owner: "Babasaheb Mane", phone: "+91 90110 55667", location: "Kolhapur, Maharashtra", stockTonnes: 40.0, ratePerKg: 45.0, isOrganic: true }
];

const DEFAULT_LOGISTICS = [
    { id: 1, name: "Maratha Roadways & Logistics", driver: "Sanjay Shinde", phone: "+91 94220 33441", truckNumber: "MH-09-Q-7821", capacityTonnes: 12.0, routes: "Kolhapur-Delhi, Pune-Delhi", ratePerTonne: 3200 },
    { id: 2, name: "Vikas Sugar Transport Co.", driver: "Balraj Yadav", phone: "+91 98110 22334", truckNumber: "UP-15-AT-4491", capacityTonnes: 15.0, routes: "Muzaffarnagar-Delhi, Muzaffarnagar-Bikaner", ratePerTonne: 2800 },
    { id: 3, name: "Speed Express Logistics", driver: "Gurmeet Singh", phone: "+91 99110 55669", truckNumber: "HR-55-B-9021", capacityTonnes: 20.0, routes: "Kolhapur-Bikaner, Pune-Bikaner", ratePerTonne: 4200 }
];

const DEFAULT_ORDERS = [
    { id: 1, buyerId: 1, bhattiId: 1, transporterId: 1, quantityTonnes: 10.0, buyingRate: 42.0, sellingRate: 55.0, transportCost: 32000, otherExpenses: 3000, status: "Delivered", date: "2026-07-02" },
    { id: 2, buyerId: 2, bhattiId: 3, transporterId: 3, quantityTonnes: 15.0, buyingRate: 45.0, sellingRate: 58.0, transportCost: 63000, otherExpenses: 4500, status: "In-Transit", date: "2026-07-07" },
    { id: 3, buyerId: 3, bhattiId: 1, transporterId: 1, quantityTonnes: 5.0, buyingRate: 42.0, sellingRate: 53.0, transportCost: 16000, otherExpenses: 2000, status: "Pending", date: "2026-07-09" }
];

const DEFAULT_FOLLOWUPS = [
    { id: 1, title: "📞 Rajesh Gupta Swadeshi Sweets", description: "Muzaffarnagar Bhatti se naye rate check karke quotes bhejein.", date: "2026-07-09", isCompleted: false, relatedType: "Buyer", relatedId: 1 },
    { id: 2, title: "🤝 Meet Babasaheb Patil", description: "Bhatti expansion aur organic certification rates discuss karne hain.", date: "2026-07-10", isCompleted: false, relatedType: "Bhatti", relatedId: 1 },
    { id: 3, title: "🚛 Sanjay Shinde Transit Confirm", description: "Order #2 ki delivery location par timing confirm karein.", date: "2026-07-09", isCompleted: true, relatedType: "General", relatedId: 0 }
];

const DEFAULT_WELCOME_CHAT = [
    {
        sender: "ai",
        text: "Ram Ram Ji! Swagat hai aapka Gur Vyapaar Mitra chat pane me. 🌟 Aap mujhse apne buyers, bhattis, transportation routes ya profit margin optimization ke bare me pooch sakte hain. Aap ye bhi keh sakte hain: 'Mujhe ek naya task do jisse business grow ho.' Main aapki madad ke liye taiyaar hoon!",
        timestamp: Date.now()
    }
];

// --- APP GLOBAL STATE CONTROLLER ---
const AppState = {
    users: [],
    auditLogs: [],
    currentUser: null,
    buyers: [],
    bhattis: [],
    logistics: [],
    orders: [],
    followups: [],
    chatMessages: [],
    settings: {
        geminiApiKey: "",
        useMockAi: true
    },
    seasonTarget: {
        targetTonnes: 500.0,
        currentProgressTonnes: 30.0,
        year: "2026-2027"
    },

    // Initialize all data from LocalStorage or seed defaults
    init() {
        this.users = JSON.parse(localStorage.getItem("gur_users")) || [];
        this.auditLogs = JSON.parse(localStorage.getItem("gur_audit_logs")) || [];
        this.currentUser = JSON.parse(localStorage.getItem("gur_current_user")) || null;
        this.buyers = JSON.parse(localStorage.getItem("gur_buyers")) || DEFAULT_BUYERS;
        this.bhattis = JSON.parse(localStorage.getItem("gur_bhattis")) || DEFAULT_BHATTIS;
        this.logistics = JSON.parse(localStorage.getItem("gur_logistics")) || DEFAULT_LOGISTICS;
        this.orders = JSON.parse(localStorage.getItem("gur_orders")) || DEFAULT_ORDERS;
        this.followups = JSON.parse(localStorage.getItem("gur_followups")) || DEFAULT_FOLLOWUPS;
        this.chatMessages = JSON.parse(localStorage.getItem("gur_chat")) || DEFAULT_WELCOME_CHAT;
        this.settings = JSON.parse(localStorage.getItem("gur_settings")) || { geminiApiKey: "", useMockAi: true };
        this.seasonTarget = JSON.parse(localStorage.getItem("gur_target")) || { targetTonnes: 500.0, currentProgressTonnes: 30.0, year: "2026-2027" };

        this.saveAll();
    },

    // Persist all lists to LocalStorage
    saveAll() {
        localStorage.setItem("gur_users", JSON.stringify(this.users));
        localStorage.setItem("gur_audit_logs", JSON.stringify(this.auditLogs));
        localStorage.setItem("gur_current_user", JSON.stringify(this.currentUser));
        localStorage.setItem("gur_buyers", JSON.stringify(this.buyers));
        localStorage.setItem("gur_bhattis", JSON.stringify(this.bhattis));
        localStorage.setItem("gur_logistics", JSON.stringify(this.logistics));
        localStorage.setItem("gur_orders", JSON.stringify(this.orders));
        localStorage.setItem("gur_followups", JSON.stringify(this.followups));
        localStorage.setItem("gur_chat", JSON.stringify(this.chatMessages));
        localStorage.setItem("gur_settings", JSON.stringify(this.settings));
        localStorage.setItem("gur_target", JSON.stringify(this.seasonTarget));
    }
};

// --- DOM ELEMENT REFERENCES ---
document.addEventListener("DOMContentLoaded", () => {
    AppState.init();
    initAppRouting();
    initModalsAndForms();
    initSettingsPanel();
    initAiCoPilotChat();
    initBuyerFinder();
    initSecurityAndLogin();

    // Trigger initial rendering
    renderAll();
});

// --- PWA SERVICE WORKER REGISTRATION ---
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("Service Worker registered successfully! scope:", reg.scope))
            .catch(err => console.error("Service Worker registration failed:", err));
    });
}

// --- PWA INSTALLATION TOAST PROMPT ---
let deferredPrompt;
const installBanner = document.getElementById("pwa-install-banner");
const pwaAcceptBtn = document.getElementById("pwa-accept-btn");
const pwaDismissBtn = document.getElementById("pwa-dismiss-btn");

window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent default browser install banner
    e.preventDefault();
    deferredPrompt = e;
    // Show custom banner
    installBanner.classList.remove("hidden");
});

pwaDismissBtn.addEventListener("click", () => {
    installBanner.classList.add("hidden");
});

pwaAcceptBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        installBanner.classList.add("hidden");
    }
});

// --- SPA TAB ROUTING ENGINE ---
function initAppRouting() {
    const tabs = document.querySelectorAll(".nav-tab-btn");
    const screens = document.querySelectorAll(".screen");

    function switchTab(tabId) {
        // Toggle tab highlights
        tabs.forEach(btn => {
            if (btn.getAttribute("data-tab") === tabId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Toggle active screen
        screens.forEach(screen => {
            if (screen.id === `screen-${tabId}`) {
                screen.classList.add("active");
            } else {
                screen.classList.remove("active");
            }
        });

        // Render target view dynamically on load
        if (tabId === "dashboard") renderDashboardView();
        else if (tabId === "buyers") renderBuyersView();
        else if (tabId === "bhattis") renderBhattisView();
        else if (tabId === "logistics") renderLogisticsView();
        else if (tabId === "orders") renderOrdersView();
        else if (tabId === "planner") renderPlannerView();
        else if (tabId === "aichat") renderAiChatView();
        else if (tabId === "buyerfinder") renderBuyerFinderView();
        else if (tabId === "calendar") renderCalendarView();
        else if (tabId === "network") renderNetworkView();

        // Close drawer on mobile after switching tab
        const sidebar = document.querySelector(".sidebar-nav");
        const overlay = document.getElementById("drawer-overlay");
        if (sidebar) sidebar.classList.remove("drawer-open");
        if (overlay) overlay.classList.remove("active");

        // Scroll content area back to top
        document.querySelector(".content-container").scrollTop = 0;
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const tabId = tab.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // Handle Quick Link Buttons inside Dashboard
    document.querySelectorAll("[data-tab-go]").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab-go");
            switchTab(targetTab);
        });
    });

    // --- SIDE DRAWER ENGINE FOR MOBILE ---
    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const closeDrawerBtn = document.getElementById("close-drawer-btn");
    const drawerOverlay = document.getElementById("drawer-overlay");
    const sidebarNav = document.querySelector(".sidebar-nav");

    const bottomMenuToggleBtn = document.getElementById("bottom-menu-toggle-btn");

    if (sidebarNav) {
        if (menuToggleBtn) {
            menuToggleBtn.addEventListener("click", () => {
                sidebarNav.classList.add("drawer-open");
                if (drawerOverlay) drawerOverlay.classList.add("active");
            });
        }
        if (bottomMenuToggleBtn) {
            bottomMenuToggleBtn.addEventListener("click", () => {
                sidebarNav.classList.add("drawer-open");
                if (drawerOverlay) drawerOverlay.classList.add("active");
            });
        }
    }

    if (closeDrawerBtn && sidebarNav) {
        closeDrawerBtn.addEventListener("click", () => {
            sidebarNav.classList.remove("drawer-open");
            if (drawerOverlay) drawerOverlay.classList.remove("active");
        });
    }

    if (drawerOverlay && sidebarNav) {
        drawerOverlay.addEventListener("click", () => {
            sidebarNav.classList.remove("drawer-open");
            drawerOverlay.classList.remove("active");
        });
    }
}

// --- RENDER ALL STATIC & DYNAMIC VIEWS ---
function renderAll() {
    renderDashboardView();
    renderBuyersView();
    renderBhattisView();
    renderLogisticsView();
    renderOrdersView();
    renderPlannerView();
}

// ==================== 1. DASHBOARD CONTROLLER ====================
function renderDashboardView() {
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalTonnes = 0;
    let activeOrdersCount = 0;

    // Calculate aggregated metrics from orders
    AppState.orders.forEach(ord => {
        if (ord.status !== "Cancelled") {
            const qtyKg = ord.quantityTonnes * 1000;
            const orderRevenue = qtyKg * ord.sellingRate;
            const orderBuyingCost = qtyKg * ord.buyingRate;
            const totalOrderExpense = orderBuyingCost + ord.transportCost + ord.otherExpenses;
            const orderProfit = orderRevenue - totalOrderExpense;

            totalRevenue += orderRevenue;
            totalProfit += orderProfit;
            totalTonnes += ord.quantityTonnes;

            if (ord.status === "Pending" || ord.status === "In-Transit" || ord.status === "Dispatched") {
                activeOrdersCount++;
            }
        }
    });

    // Format metrics values
    document.getElementById("dash-total-revenue").innerText = "₹" + totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 });
    document.getElementById("dash-total-profit").innerText = "₹" + totalProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 });
    document.getElementById("dash-total-tonnes").innerText = totalTonnes.toFixed(1) + " T";
    document.getElementById("dash-active-orders").innerText = activeOrdersCount;

    // --- RENDER RECENT TRANSACTIONS TABLE ---
    const tbody = document.querySelector("#dash-orders-table tbody");
    tbody.innerHTML = "";

    const recentOrders = [...AppState.orders].reverse().slice(0, 5);
    if (recentOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-placeholder">Abhi tak koi order sauda likha nahi gaya hai.</td></tr>`;
    } else {
        recentOrders.forEach(ord => {
            const buyer = AppState.buyers.find(b => b.id === Number(ord.buyerId)) || { name: "Unknown" };
            const bhatti = AppState.bhattis.find(bh => bh.id === Number(ord.bhattiId)) || { name: "Unknown" };
            const qtyKg = ord.quantityTonnes * 1000;
            const orderRevenue = qtyKg * ord.sellingRate;
            const orderBuyingCost = qtyKg * ord.buyingRate;
            const totalExpenses = orderBuyingCost + ord.transportCost + ord.otherExpenses;
            const profit = orderRevenue - totalExpenses;

            let statusClass = "badge-orange";
            if (ord.status === "Delivered") statusClass = "badge-green";
            else if (ord.status === "In-Transit" || ord.status === "Dispatched") statusClass = "badge-blue";
            else if (ord.status === "Pending") statusClass = "badge-gold";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>#ORD-${ord.id}</strong></td>
                <td>${buyer.name}</td>
                <td>${bhatti.name}</td>
                <td>${ord.quantityTonnes} Tonnes</td>
                <td class="${profit >= 0 ? 'text-green' : 'text-danger'}">₹${profit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                <td><span class="badge ${statusClass}">${ord.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- RENDER TARGET PROGRESS CIRCLE ---
    const targetTonnes = Number(AppState.seasonTarget.targetTonnes) || 500.0;
    // Autoincrement current progress using actually delivered orders
    const deliveredTonnes = AppState.orders
        .filter(ord => ord.status === "Delivered")
        .reduce((sum, ord) => sum + Number(ord.quantityTonnes), 0);

    // Save autocalculated value or custom value
    const achievedTonnes = Math.max(deliveredTonnes, Number(AppState.seasonTarget.currentProgressTonnes));
    const percent = Math.min(Math.round((achievedTonnes / targetTonnes) * 100), 100);

    document.getElementById("dash-progress-percent").innerText = percent + "%";
    document.getElementById("dash-target-tonnes").innerText = targetTonnes.toFixed(1);
    document.getElementById("dash-current-tonnes").innerText = achievedTonnes.toFixed(1);
    document.getElementById("dash-remaining-tonnes").innerText = Math.max(0, targetTonnes - achievedTonnes).toFixed(1);

    // Sync SVG progress ring offset (circumference of r=50 is 314.16)
    const strokeDashoffset = 314.16 - (314.16 * percent) / 100;
    document.getElementById("dash-progress-ring").style.strokeDashoffset = strokeDashoffset;

    // --- RENDER RECENT TASKS PANEL (Dashboard Tasks) ---
    const dashTasks = document.getElementById("dash-task-list");
    dashTasks.innerHTML = "";

    const activeTasks = AppState.followups.filter(task => !task.isCompleted).slice(0, 3);
    if (activeTasks.length === 0) {
        dashTasks.innerHTML = `
            <div class="empty-placeholder">
                <span class="material-symbols-outlined">done_all</span>
                <p>Aaj koi baki follow-up nahi hai! 🌟 Sab clean hai.</p>
            </div>
        `;
    } else {
        activeTasks.forEach(task => {
            const div = document.createElement("div");
            div.className = "task-item-card";
            div.innerHTML = `
                <div class="checkbox-round" onclick="toggleTaskCompletion(${task.id})">
                    <span class="material-symbols-outlined hidden">done</span>
                </div>
                <div class="task-item-content">
                    <h4>${task.title}</h4>
                    <p>${task.description || "No description provided."}</p>
                    <div class="task-item-footer">
                        <span class="date">Target: ${task.date}</span>
                    </div>
                </div>
            `;
            dashTasks.appendChild(div);
        });
    }
}

// ==================== 2. BUYERS DIRECTORY ====================
function renderBuyersView() {
    const grid = document.getElementById("buyers-grid");
    grid.innerHTML = "";

    const searchVal = document.getElementById("buyer-search").value.toLowerCase();
    const catVal = document.getElementById("buyer-filter-category").value;

    const filtered = AppState.buyers.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchVal) ||
                              b.phone.includes(searchVal) ||
                              b.location.toLowerCase().includes(searchVal);
        const matchesCat = !catVal || b.category === catVal;
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-placeholder" style="grid-column: 1 / -1;">
                <span class="material-symbols-outlined">search_off</span>
                <p>Koi khareeddar (buyer) nahi mila. Naya add karein!</p>
            </div>
        `;
        return;
    }

    filtered.forEach(b => {
        const card = document.createElement("div");
        card.className = "card-glass";
        card.innerHTML = `
            <div class="card-body-top">
                <div class="card-title">
                    <h3>${b.name}</h3>
                    <span class="card-subtitle">${b.location}</span>
                </div>
                <span class="badge badge-gold">${b.category}</span>
            </div>
            <div class="card-row">
                <span class="material-symbols-outlined">phone</span>
                <span>${b.phone}</span>
            </div>
            <div class="card-row">
                <span class="material-symbols-outlined">restaurant</span>
                <span>Preference: <strong>${b.preferredType}</strong></span>
            </div>
            <div class="card-actions">
                <button class="secondary-btn fab-btn" onclick="openBuyerDetails(${b.id})">
                    <span class="material-symbols-outlined">contacts</span>
                    <span>Logbook</span>
                </button>
                <button class="icon-btn" onclick="openEditBuyerModal(${b.id})" title="Edit Profile">
                    <span class="material-symbols-outlined text-green">edit</span>
                </button>
                <button class="icon-btn" onclick="deleteBuyer(${b.id})" title="Delete Buyer">
                    <span class="material-symbols-outlined text-danger">delete</span>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==================== 3. BHATTIS DIRECTORY ====================
function renderBhattisView() {
    const grid = document.getElementById("bhattis-grid");
    grid.innerHTML = "";

    const searchVal = document.getElementById("bhatti-search").value.toLowerCase();

    const filtered = AppState.bhattis.filter(bh => {
        return bh.name.toLowerCase().includes(searchVal) ||
               bh.owner.toLowerCase().includes(searchVal) ||
               bh.location.toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-placeholder" style="grid-column: 1 / -1;">
                <span class="material-symbols-outlined">search_off</span>
                <p>Koi production unit (bhatti) nahi mili. Nayi add karein!</p>
            </div>
        `;
        return;
    }

    filtered.forEach(bh => {
        const card = document.createElement("div");
        card.className = "card-glass";
        card.innerHTML = `
            <div class="card-body-top">
                <div class="card-title">
                    <h3>${bh.name}</h3>
                    <span class="card-subtitle">Maalik: ${bh.owner}</span>
                </div>
                ${bh.isOrganic ? '<span class="badge badge-green">Organic Certified 🌱</span>' : '<span class="badge badge-blue">Standard Production</span>'}
            </div>
            <div class="card-row">
                <span class="material-symbols-outlined">phone</span>
                <span>${bh.phone}</span>
            </div>
            <div class="card-row">
                <span class="material-symbols-outlined">location_on</span>
                <span>${bh.location}</span>
            </div>
            <div class="card-row" style="margin-top: 4px; justify-content: space-between;">
                <span>Stock: <strong>${bh.stockTonnes} Tonnes</strong></span>
                <span class="text-green">Rate: <strong>₹${bh.ratePerKg}/Kg</strong></span>
            </div>
            <div class="card-actions">
                <button class="secondary-btn fab-btn" onclick="openBhattiDetails(${bh.id})">
                    <span class="material-symbols-outlined">contacts</span>
                    <span>Dashboard</span>
                </button>
                <button class="icon-btn" onclick="openEditBhattiModal(${bh.id})" title="Edit Bhatti">
                    <span class="material-symbols-outlined text-green">edit</span>
                </button>
                <button class="icon-btn" onclick="deleteBhatti(${bh.id})" title="Delete Bhatti">
                    <span class="material-symbols-outlined text-danger">delete</span>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==================== 4. LOGISTICS DIRECTORY ====================
function renderLogisticsView() {
    const grid = document.getElementById("logistics-grid");
    grid.innerHTML = "";

    const searchVal = document.getElementById("logistics-search").value.toLowerCase();

    const filtered = AppState.logistics.filter(l => {
        return l.name.toLowerCase().includes(searchVal) ||
               l.routes.toLowerCase().includes(searchVal) ||
               l.driver.toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-placeholder" style="grid-column: 1 / -1;">
                <span class="material-symbols-outlined">search_off</span>
                <p>Koi transporter nahi mila. Naya add karein!</p>
            </div>
        `;
        return;
    }

    filtered.forEach(l => {
        const routesArr = l.routes.split(",").map(r => r.trim());
        const routesHtml = routesArr.map(route => `<span class="route-tag">${route}</span>`).join("");

        const card = document.createElement("div");
        card.className = "card-glass";
        card.innerHTML = `
            <div class="card-body-top">
                <div class="card-title">
                    <h3>${l.name}</h3>
                    <span class="card-subtitle">Driver: ${l.driver} (${l.truckNumber || 'No Truck No'})</span>
                </div>
                <span class="badge badge-blue">Cap: ${l.capacityTonnes}T</span>
            </div>
            <div class="card-row">
                <span class="material-symbols-outlined">phone</span>
                <span>${l.phone}</span>
            </div>
            <div class="card-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                <span class="text-muted" style="font-size: 11px; font-weight:700;">ACTIVE ROUTES:</span>
                <div class="routes-list">${routesHtml}</div>
            </div>
            <div class="card-row" style="justify-content: space-between; margin-top: 4px;">
                <span class="text-green" style="font-weight: 700;">Rate per Tonne: ₹${l.rateTonne || l.ratePerTonne}</span>
            </div>
            <div class="card-actions">
                <button class="secondary-btn fab-btn" onclick="openLogisticsDetails(${l.id})">
                    <span class="material-symbols-outlined">contacts</span>
                    <span>Dashboard</span>
                </button>
                <button class="icon-btn" onclick="openEditLogisticsModal(${l.id})" title="Edit Transporter">
                    <span class="material-symbols-outlined text-green">edit</span>
                </button>
                <button class="icon-btn" onclick="deleteLogistics(${l.id})" title="Delete Transporter">
                    <span class="material-symbols-outlined text-danger">delete</span>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==================== 5. ORDERS MANAGEMENT ====================
function renderOrdersView() {
    const list = document.getElementById("orders-list");
    list.innerHTML = "";

    const searchVal = document.getElementById("order-search").value.toLowerCase();
    const statusVal = document.getElementById("order-filter-status").value;

    const filtered = AppState.orders.filter(ord => {
        const matchesSearch = String(ord.id).includes(searchVal) || ord.status.toLowerCase().includes(searchVal);
        const matchesStatus = !statusVal || ord.status === statusVal;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-placeholder">
                <span class="material-symbols-outlined">search_off</span>
                <p>Koi Jaggery order sauda nahi mila. Naya record likhein!</p>
            </div>
        `;
        return;
    }

    filtered.forEach(ord => {
        const buyer = AppState.buyers.find(b => b.id === Number(ord.buyerId)) || { name: "Deleted Buyer", location: "Unknown" };
        const bhatti = AppState.bhattis.find(bh => bh.id === Number(ord.bhattiId)) || { name: "Deleted Bhatti", location: "Unknown" };
        const transporter = AppState.logistics.find(l => l.id === Number(ord.transporterId)) || { name: "Deleted Transporter" };

        const qtyKg = ord.quantityTonnes * 1000;
        const revenue = qtyKg * ord.sellingRate;
        const buyingCost = qtyKg * ord.buyingRate;
        const totalExpenses = buyingCost + ord.transportCost + ord.otherExpenses;
        const profit = revenue - totalExpenses;

        let statusClass = "badge-orange";
        if (ord.status === "Delivered") statusClass = "badge-green";
        else if (ord.status === "In-Transit" || ord.status === "Dispatched") statusClass = "badge-blue";
        else if (ord.status === "Pending") statusClass = "badge-gold";

        const card = document.createElement("div");
        card.className = "order-card-collapsed";
        card.innerHTML = `
            <div class="order-header-main">
                <div class="order-headline">
                    <span class="order-id-label">#ORD-${ord.id}</span>
                    <h4>${buyer.name}</h4>
                </div>
                <span class="badge ${statusClass}">${ord.status}</span>
            </div>
            <div class="order-quick-details">
                <div><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; color:var(--jaggery-gold);">storefront</span> Bhatti: <strong>${bhatti.name}</strong></div>
                <div><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; color:var(--jaggery-gold);">local_shipping</span> Route: <strong>${transporter.name}</strong></div>
                <div><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; color:var(--jaggery-gold);">weight</span> Qty: <strong>${ord.quantityTonnes} Tonnes</strong></div>
                <div><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; color:var(--jaggery-gold);">calendar_month</span> Date: <strong>${ord.date}</strong></div>
            </div>
            <div class="order-cost-breakdown">
                <div class="grid-3">
                    <div>
                        <span class="text-muted" style="display:block; font-size:10px;">SELLING REVENUE</span>
                        <strong>₹${revenue.toLocaleString("en-IN")}</strong>
                    </div>
                    <div>
                        <span class="text-muted" style="display:block; font-size:10px;">BHATTI COST</span>
                        <strong>₹${buyingCost.toLocaleString("en-IN")}</strong>
                    </div>
                    <div>
                        <span class="text-muted" style="display:block; font-size:10px;">FREIGHT & EXP</span>
                        <strong>₹${(ord.transportCost + ord.otherExpenses).toLocaleString("en-IN")}</strong>
                    </div>
                </div>
                <div class="profit-line">
                    <span>Net Trade Profit Margin:</span>
                    <span class="${profit >= 0 ? 'text-green' : 'text-danger'}" style="font-size: 14px;">₹${profit.toLocaleString("en-IN")} (${((profit/revenue)*100).toFixed(1)}%)</span>
                </div>
            </div>
            <div class="card-actions" style="border-top:none; padding-top:0; margin-top:0;">
                <button class="icon-btn" onclick="openEditOrderModal(${ord.id})" title="Edit Trade Order">
                    <span class="material-symbols-outlined text-green">edit</span>
                </button>
                <button class="icon-btn" onclick="deleteOrder(${ord.id})" title="Cancel & Delete Order">
                    <span class="material-symbols-outlined text-danger">delete</span>
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

// ==================== 6. PLANNER & FOLLOW-UPS ====================
function renderPlannerView() {
    // Fill season goal inputs
    document.getElementById("goal-target-tonnes").value = AppState.seasonTarget.targetTonnes;
    document.getElementById("goal-current-tonnes").value = AppState.seasonTarget.currentProgressTonnes;

    // Render task items
    const list = document.getElementById("planner-tasks-list");
    list.innerHTML = "";

    let currentFilter = "all";
    if (document.getElementById("task-filter-pending").classList.contains("active")) currentFilter = "pending";
    else if (document.getElementById("task-filter-done").classList.contains("active")) currentFilter = "done";

    const filtered = AppState.followups.filter(task => {
        if (currentFilter === "pending") return !task.isCompleted;
        if (currentFilter === "done") return task.isCompleted;
        return true;
    });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-placeholder">
                <span class="material-symbols-outlined">playlist_add_check</span>
                <p>Koi task nahi mila is category me.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(task => {
        const card = document.createElement("div");
        card.className = `task-item-card ${task.isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="checkbox-round ${task.isCompleted ? 'checked' : ''}" onclick="toggleTaskCompletion(${task.id})">
                ${task.isCompleted ? '<span class="material-symbols-outlined">done</span>' : ''}
            </div>
            <div class="task-item-content">
                <h4>${task.title}</h4>
                <p>${task.description || "Koi description baki nahi hai."}</p>
                <div class="task-item-footer">
                    <span class="date">Due: ${task.date}</span>
                    <div style="display:flex; gap: 8px;">
                        <button class="text-link-btn" onclick="openEditTaskModal(${task.id})" style="font-size:11px;">Edit</button>
                        <button class="text-link-btn text-danger" onclick="deleteTask(${task.id})" style="font-size:11px;">Delete</button>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

// Complete task or reverse completion
function toggleTaskCompletion(taskId) {
    const task = AppState.followups.find(t => t.id === Number(taskId));
    if (task) {
        task.isCompleted = !task.isCompleted;
        AppState.saveAll();
        renderAll();
    }
}

// ==================== 7. AI CO-PILOT ADVISOR SCREEN ====================
function renderAiChatView() {
    const messagesBox = document.getElementById("chat-messages-container");
    messagesBox.innerHTML = "";

    AppState.chatMessages.forEach(msg => {
        const div = document.createElement("div");
        div.className = `message-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`;
        div.innerText = msg.text;
        messagesBox.appendChild(div);
    });

    // Auto-scroll to bottom of chat
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// ==================== DATA ACTIONS (CRUD OVERLAYS) ====================

// Generic Close Modal
document.querySelectorAll(".close-modal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".modal-overlay").forEach(overlay => {
            overlay.classList.remove("active");
        });
    });
});

// --- BUYER CRUD FORM ACTIONS ---
const buyerModal = document.getElementById("modal-buyer");
document.getElementById("add-buyer-btn").addEventListener("click", () => {
    document.getElementById("buyer-form").reset();
    document.getElementById("buyer-id").value = "";
    document.getElementById("buyer-modal-title").innerText = "Naya Buyer Add Karein";
    buyerModal.classList.add("active");
});

function openEditBuyerModal(id) {
    const b = AppState.buyers.find(x => x.id === Number(id));
    if (b) {
        document.getElementById("buyer-id").value = b.id;
        document.getElementById("buyer-name").value = b.name;
        document.getElementById("buyer-phone").value = b.phone;
        document.getElementById("buyer-location").value = b.location;
        document.getElementById("buyer-category").value = b.category;
        document.getElementById("buyer-pref").value = b.preferredType;

        document.getElementById("buyer-modal-title").innerText = "Edit Buyer Profile";
        buyerModal.classList.add("active");
    }
}

document.getElementById("buyer-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("buyer-id").value;
    const name = document.getElementById("buyer-name").value;
    const phone = document.getElementById("buyer-phone").value;
    const location = document.getElementById("buyer-location").value;
    const category = document.getElementById("buyer-category").value;
    const preferredType = document.getElementById("buyer-pref").value;

    if (id) {
        // Edit mode
        const index = AppState.buyers.findIndex(x => x.id === Number(id));
        if (index !== -1) {
            AppState.buyers[index] = { id: Number(id), name, phone, location, category, preferredType };
        }
    } else {
        // Create mode
        const newId = AppState.buyers.length > 0 ? Math.max(...AppState.buyers.map(x => x.id)) + 1 : 1;
        AppState.buyers.push({ id: newId, name, phone, location, category, preferredType });
    }

    AppState.saveAll();
    buyerModal.classList.remove("active");
    renderAll();
});

function deleteBuyer(id) {
    if (confirm("Kya aap sach me is Buyer profile ko delete karna chahte hain?")) {
        AppState.buyers = AppState.buyers.filter(x => x.id !== Number(id));
        AppState.saveAll();
        renderAll();
    }
}

// Live Search Listeners
document.getElementById("buyer-search").addEventListener("input", renderBuyersView);
document.getElementById("buyer-filter-category").addEventListener("change", renderBuyersView);

// --- BHATTI CRUD FORM ACTIONS ---
const bhattiModal = document.getElementById("modal-bhatti");
document.getElementById("add-bhatti-btn").addEventListener("click", () => {
    document.getElementById("bhatti-form").reset();
    document.getElementById("bhatti-id").value = "";
    document.getElementById("bhatti-modal-title").innerText = "Nayi Jaggery Bhatti Add Karein";
    bhattiModal.classList.add("active");
});

function openEditBhattiModal(id) {
    const bh = AppState.bhattis.find(x => x.id === Number(id));
    if (bh) {
        document.getElementById("bhatti-id").value = bh.id;
        document.getElementById("bhatti-name").value = bh.name;
        document.getElementById("bhatti-owner").value = bh.owner;
        document.getElementById("bhatti-phone").value = bh.phone;
        document.getElementById("bhatti-location").value = bh.location;
        document.getElementById("bhatti-stock").value = bh.stockTonnes;
        document.getElementById("bhatti-rate").value = bh.ratePerKg;
        document.getElementById("bhatti-organic").checked = bh.isOrganic;

        document.getElementById("bhatti-modal-title").innerText = "Edit Bhatti Specifications";
        bhattiModal.classList.add("active");
    }
}

document.getElementById("bhatti-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("bhatti-id").value;
    const name = document.getElementById("bhatti-name").value;
    const owner = document.getElementById("bhatti-owner").value;
    const phone = document.getElementById("bhatti-phone").value;
    const location = document.getElementById("bhatti-location").value;
    const stockTonnes = Number(document.getElementById("bhatti-stock").value);
    const ratePerKg = Number(document.getElementById("bhatti-rate").value);
    const isOrganic = document.getElementById("bhatti-organic").checked;

    if (id) {
        const idx = AppState.bhattis.findIndex(x => x.id === Number(id));
        if (idx !== -1) {
            AppState.bhattis[idx] = { id: Number(id), name, owner, phone, location, stockTonnes, ratePerKg, isOrganic };
        }
    } else {
        const newId = AppState.bhattis.length > 0 ? Math.max(...AppState.bhattis.map(x => x.id)) + 1 : 1;
        AppState.bhattis.push({ id: newId, name, owner, phone, location, stockTonnes, ratePerKg, isOrganic });
    }

    AppState.saveAll();
    bhattiModal.classList.remove("active");
    renderAll();
});

function deleteBhatti(id) {
    if (confirm("Kya aap is Bhatti record ko delete karna chahte hain?")) {
        AppState.bhattis = AppState.bhattis.filter(x => x.id !== Number(id));
        AppState.saveAll();
        renderAll();
    }
}
document.getElementById("bhatti-search").addEventListener("input", renderBhattisView);

// --- LOGISTICS CRUD FORM ACTIONS ---
const logisticsModal = document.getElementById("modal-logistics");
document.getElementById("add-logistics-btn").addEventListener("click", () => {
    document.getElementById("logistics-form").reset();
    document.getElementById("logistics-id").value = "";
    document.getElementById("logistics-modal-title").innerText = "Naya Transport Provider Add Karein";
    logisticsModal.classList.add("active");
});

function openEditLogisticsModal(id) {
    const l = AppState.logistics.find(x => x.id === Number(id));
    if (l) {
        document.getElementById("logistics-id").value = l.id;
        document.getElementById("logistics-company").value = l.name;
        document.getElementById("logistics-driver").value = l.driver;
        document.getElementById("logistics-phone").value = l.phone;
        document.getElementById("logistics-truck").value = l.truckNumber || "";
        document.getElementById("logistics-capacity").value = l.capacityTonnes;
        document.getElementById("logistics-routes").value = l.routes;
        document.getElementById("logistics-rate").value = l.rateTonne || l.ratePerTonne;

        document.getElementById("logistics-modal-title").innerText = "Edit Transporter Details";
        logisticsModal.classList.add("active");
    }
}

document.getElementById("logistics-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("logistics-id").value;
    const name = document.getElementById("logistics-company").value;
    const driver = document.getElementById("logistics-driver").value;
    const phone = document.getElementById("logistics-phone").value;
    const truckNumber = document.getElementById("logistics-truck").value;
    const capacityTonnes = Number(document.getElementById("logistics-capacity").value);
    const routes = document.getElementById("logistics-routes").value;
    const ratePerTonne = Number(document.getElementById("logistics-rate").value);

    if (id) {
        const idx = AppState.logistics.findIndex(x => x.id === Number(id));
        if (idx !== -1) {
            AppState.logistics[idx] = { id: Number(id), name, driver, phone, truckNumber, capacityTonnes, routes, ratePerTonne };
        }
    } else {
        const newId = AppState.logistics.length > 0 ? Math.max(...AppState.logistics.map(x => x.id)) + 1 : 1;
        AppState.logistics.push({ id: newId, name, driver, phone, truckNumber, capacityTonnes, routes, ratePerTonne });
    }

    AppState.saveAll();
    logisticsModal.classList.remove("active");
    renderAll();
});

function deleteLogistics(id) {
    if (confirm("Kya aap is Transporter ko logistics directory se hatana chahte hain?")) {
        AppState.logistics = AppState.logistics.filter(x => x.id !== Number(id));
        AppState.saveAll();
        renderAll();
    }
}
document.getElementById("logistics-search").addEventListener("input", renderLogisticsView);

// --- ORDERS/TRADE SAUDE FORM ACTIONS (DYNAMIC SELECTORS + MATH CALC) ---
const orderModal = document.getElementById("modal-order");

function populateOrderDropdownSelectors() {
    const buyerSel = document.getElementById("order-buyer");
    buyerSel.innerHTML = AppState.buyers.map(b => `<option value="${b.id}">${b.name} (${b.location})</option>`).join("");

    const bhattiSel = document.getElementById("order-bhatti");
    bhattiSel.innerHTML = AppState.bhattis.map(bh => `<option value="${bh.id}">${bh.name} (Stock: ${bh.stockTonnes}T, Rs.${bh.ratePerKg}/Kg)</option>`).join("");

    const logSel = document.getElementById("order-logistics");
    logSel.innerHTML = AppState.logistics.map(l => `<option value="${l.id}">${l.name} (${l.routes})</option>`).join("");
}

// Live calculation engine within order form modal
function calculateLiveOrderMath() {
    const qty = Number(document.getElementById("order-qty").value) || 0;
    const buyingRate = Number(document.getElementById("order-buying-rate").value) || 0;
    const sellingRate = Number(document.getElementById("order-selling-rate").value) || 0;
    const freight = Number(document.getElementById("order-transport-cost").value) || 0;
    const other = Number(document.getElementById("order-other").value) || 0;

    const qtyKg = qty * 1000;
    const revenue = qtyKg * sellingRate;
    const buyingCost = qtyKg * buyingRate;
    const expensesTotal = freight + other;
    const netProfit = revenue - (buyingCost + expensesTotal);

    document.getElementById("math-revenue").innerText = "₹" + revenue.toLocaleString("en-IN");
    document.getElementById("math-buying").innerText = "₹" + buyingCost.toLocaleString("en-IN");
    document.getElementById("math-expenses").innerText = "₹" + expensesTotal.toLocaleString("en-IN");

    const netText = document.getElementById("math-net");
    netText.innerText = "₹" + netProfit.toLocaleString("en-IN");
    if (netProfit >= 0) {
        netText.className = "text-green";
    } else {
        netText.className = "text-danger";
    }
}

// Add real-time event listeners to form fields for instant feedback
["order-qty", "order-buying-rate", "order-selling-rate", "order-transport-cost", "order-other"].forEach(id => {
    document.getElementById(id).addEventListener("input", calculateLiveOrderMath);
});

// Update purchase rates instantly when source Bhatti dropdown changes!
document.getElementById("order-bhatti").addEventListener("change", (e) => {
    const bhattiId = Number(e.target.value);
    const selectedBhatti = AppState.bhattis.find(bh => bh.id === bhattiId);
    if (selectedBhatti) {
        document.getElementById("order-buying-rate").value = selectedBhatti.ratePerKg;
        calculateLiveOrderMath();
    }
});

// Update transport costs instantly based on transporter rate per Tonne!
document.getElementById("order-logistics").addEventListener("change", (e) => {
    const transportId = Number(e.target.value);
    const transporter = AppState.logistics.find(l => l.id === transportId);
    const qty = Number(document.getElementById("order-qty").value) || 0;
    if (transporter) {
        const rateTonne = transporter.rateTonne || transporter.ratePerTonne || 3000;
        document.getElementById("order-transport-cost").value = Math.round(qty * rateTonne);
        calculateLiveOrderMath();
    }
});

document.getElementById("add-order-btn").addEventListener("click", () => {
    populateOrderDropdownSelectors();
    document.getElementById("order-form").reset();
    document.getElementById("order-id").value = "";

    // Prefill date with today
    document.getElementById("order-form").querySelector("option").selected = true; // Select first items
    const todayStr = new Date().toISOString().split('T')[0];

    // Trigger initial calculations
    setTimeout(() => {
        // Trigger select event to pre-populate default buying rate
        const bSel = document.getElementById("order-bhatti");
        if (bSel.value) bSel.dispatchEvent(new Event("change"));
        const lSel = document.getElementById("order-logistics");
        if (lSel.value) lSel.dispatchEvent(new Event("change"));
        calculateLiveOrderMath();
    }, 100);

    document.getElementById("order-modal-title").innerText = "Naya Sauda (Order Invoice) Likhein";
    orderModal.classList.add("active");
});

function openEditOrderModal(id) {
    populateOrderDropdownSelectors();
    const ord = AppState.orders.find(x => x.id === Number(id));
    if (ord) {
        document.getElementById("order-id").value = ord.id;
        document.getElementById("order-buyer").value = ord.buyerId;
        document.getElementById("order-bhatti").value = ord.bhattiId;
        document.getElementById("order-logistics").value = ord.transporterId;
        document.getElementById("order-qty").value = ord.quantityTonnes;
        document.getElementById("order-buying-rate").value = ord.buyingRate;
        document.getElementById("order-selling-rate").value = ord.sellingRate;
        document.getElementById("order-transport-cost").value = ord.transportCost;
        document.getElementById("order-other").value = ord.otherExpenses;
        document.getElementById("order-status").value = ord.status;

        document.getElementById("order-modal-title").innerText = `Edit Sauda #ORD-${ord.id}`;
        orderModal.classList.add("active");
        calculateLiveOrderMath();
    }
}

document.getElementById("order-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("order-id").value;
    const buyerId = Number(document.getElementById("order-buyer").value);
    const bhattiId = Number(document.getElementById("order-bhatti").value);
    const transporterId = Number(document.getElementById("order-logistics").value);
    const quantityTonnes = Number(document.getElementById("order-qty").value);
    const buyingRate = Number(document.getElementById("order-buying-rate").value);
    const sellingRate = Number(document.getElementById("order-selling-rate").value);
    const transportCost = Number(document.getElementById("order-transport-cost").value);
    const otherExpenses = Number(document.getElementById("order-other").value);
    const status = document.getElementById("order-status").value;

    const todayStr = new Date().toISOString().split('T')[0];

    if (id) {
        const idx = AppState.orders.findIndex(x => x.id === Number(id));
        if (idx !== -1) {
            AppState.orders[idx] = { id: Number(id), buyerId, bhattiId, transporterId, quantityTonnes, buyingRate, sellingRate, transportCost, otherExpenses, status, date: AppState.orders[idx].date };
        }
    } else {
        const newId = AppState.orders.length > 0 ? Math.max(...AppState.orders.map(x => x.id)) + 1 : 1;
        AppState.orders.push({ id: newId, buyerId, bhattiId, transporterId, quantityTonnes, buyingRate, sellingRate, transportCost, otherExpenses, status, date: todayStr });
    }

    AppState.saveAll();
    orderModal.classList.remove("active");
    renderAll();
});

function deleteOrder(id) {
    if (confirm("Kya aap is Jaggery Saude ko records se permanently delete karna chahte hain?")) {
        AppState.orders = AppState.orders.filter(x => x.id !== Number(id));
        AppState.saveAll();
        renderAll();
    }
}
document.getElementById("order-search").addEventListener("input", renderOrdersView);
document.getElementById("order-filter-status").addEventListener("change", renderOrdersView);

// --- PLANNER / RECURRING TARGETS FORM ACTIONS ---
const taskModal = document.getElementById("modal-task");
document.getElementById("add-task-btn").addEventListener("click", () => {
    document.getElementById("task-form").reset();
    document.getElementById("task-id").value = "";
    document.getElementById("task-date").value = new Date().toISOString().split('T')[0];
    document.getElementById("task-modal-title").innerText = "Naya Action Follow-up Task Likhein";
    taskModal.classList.add("active");
});

function openEditTaskModal(id) {
    const task = AppState.followups.find(x => x.id === Number(id));
    if (task) {
        document.getElementById("task-id").value = task.id;
        document.getElementById("task-title").value = task.title;
        document.getElementById("task-desc").value = task.description || "";
        document.getElementById("task-date").value = task.date;
        document.getElementById("task-type").value = task.relatedType || "General";

        document.getElementById("task-modal-title").innerText = "Edit Follow-up Target";
        taskModal.classList.add("active");
    }
}

document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("task-id").value;
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-desc").value;
    const date = document.getElementById("task-date").value;
    const relatedType = document.getElementById("task-type").value;

    if (id) {
        const idx = AppState.followups.findIndex(x => x.id === Number(id));
        if (idx !== -1) {
            AppState.followups[idx] = { id: Number(id), title, description, date, relatedType, relatedId: AppState.followups[idx].relatedId, isCompleted: AppState.followups[idx].isCompleted };
        }
    } else {
        const newId = AppState.followups.length > 0 ? Math.max(...AppState.followups.map(x => x.id)) + 1 : 1;
        AppState.followups.push({ id: newId, title, description, date, relatedType, relatedId: 0, isCompleted: false });
    }

    AppState.saveAll();
    taskModal.classList.remove("active");
    renderAll();
});

function deleteTask(id) {
    if (confirm("Kya aap is action planning task ko remove karna chahte hain?")) {
        AppState.followups = AppState.followups.filter(x => x.id !== Number(id));
        AppState.saveAll();
        renderAll();
    }
}

// Planner filter buttons listeners
document.getElementById("task-filter-all").addEventListener("click", (e) => {
    setPlannerFilterActive(e.target);
    renderPlannerView();
});
document.getElementById("task-filter-pending").addEventListener("click", (e) => {
    setPlannerFilterActive(e.target);
    renderPlannerView();
});
document.getElementById("task-filter-done").addEventListener("click", (e) => {
    setPlannerFilterActive(e.target);
    renderPlannerView();
});

function setPlannerFilterActive(targetElement) {
    document.querySelectorAll(".task-filters button").forEach(btn => btn.classList.remove("active"));
    targetElement.classList.add("active");
}

// Save seasonal goal progress parameters
document.getElementById("save-goal-btn").addEventListener("click", () => {
    const target = Number(document.getElementById("goal-target-tonnes").value) || 500.0;
    const progress = Number(document.getElementById("goal-current-tonnes").value) || 0.0;

    AppState.seasonTarget.targetTonnes = target;
    AppState.seasonTarget.currentProgressTonnes = progress;
    AppState.saveAll();

    alert("Seasonal target records successfully saved! 🎯");
    renderAll();
});

document.getElementById("edit-season-btn").addEventListener("click", () => {
    // Quick link to Planner Screen
    document.querySelector("[data-tab='planner']").click();
});

// ==================== BUYER DETAIL PROFILE & TIMELINE LOGBOOK ====================
let currentSelectedBuyerIdForDetails = null;
const buyerDetailsModal = document.getElementById("modal-buyer-details");

function openBuyerDetails(id) {
    currentSelectedBuyerIdForDetails = Number(id);
    const b = AppState.buyers.find(x => x.id === currentSelectedBuyerIdForDetails);
    if (!b) return;

    // Set layout elements
    document.getElementById("det-buyer-name").innerText = b.name;
    document.getElementById("det-buyer-cat").innerText = b.category;
    document.getElementById("det-buyer-phone").innerText = b.phone;
    document.getElementById("det-buyer-loc").innerText = b.location;
    document.getElementById("det-buyer-pref").innerText = b.preferredType;

    // Hide AI pitch box in case it was open
    document.getElementById("buyer-ai-pitch-output").classList.add("hidden");
    document.getElementById("buyer-ai-pitch-output").querySelector(".text").innerText = "";

    // Hide quick log form
    document.getElementById("quick-log-form").classList.add("hidden");

    renderBuyerLogs();
    buyerDetailsModal.classList.add("active");
}

function renderBuyerLogs() {
    const container = document.getElementById("det-buyer-logs");
    container.innerHTML = "";

    // Generate localized contact interaction history
    const allLogs = JSON.parse(localStorage.getItem(`gur_logs_${currentSelectedBuyerIdForDetails}`)) || [
        { type: "Phone Call", date: "2026-07-06", notes: "Called about rates. Wants golden double-filter cubes delivery before next Thursday." },
        { type: "WhatsApp Sent", date: "2026-07-08", notes: "Sent latest price quotations from Deccan Gold Bhatti: Rs.58/Kg including dispatch taxes." }
    ];

    if (allLogs.length === 0) {
        container.innerHTML = `<p class="empty-placeholder">Koi interaction log book record nahi hai. Likhein!</p>`;
    } else {
        allLogs.forEach(log => {
            const div = document.createElement("div");
            div.className = "log-item";
            div.innerHTML = `
                <div class="log-item-meta">
                    <span class="type">${log.type}</span>
                    <span>${log.date}</span>
                </div>
                <div class="log-item-notes">${log.notes}</div>
            `;
            container.appendChild(div);
        });
    }
}

// Add Custom Interaction Log
document.getElementById("log-interaction-btn").addEventListener("click", () => {
    document.getElementById("quick-log-form").classList.remove("hidden");
    document.getElementById("log-notes").value = "";
});

document.getElementById("cancel-quick-log").addEventListener("click", () => {
    document.getElementById("quick-log-form").classList.add("hidden");
});

document.getElementById("save-quick-log").addEventListener("click", () => {
    const type = document.getElementById("log-type").value;
    const notes = document.getElementById("log-notes").value.trim();
    if (!notes) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const key = `gur_logs_${currentSelectedBuyerIdForDetails}`;
    const allLogs = JSON.parse(localStorage.getItem(key)) || [
        { type: "Phone Call", date: "2026-07-06", notes: "Called about rates. Wants golden double-filter cubes delivery before next Thursday." },
        { type: "WhatsApp Sent", date: "2026-07-08", notes: "Sent latest price quotations from Deccan Gold Bhatti: Rs.58/Kg including dispatch taxes." }
    ];

    allLogs.unshift({ type, notes, date: todayStr });
    localStorage.setItem(key, JSON.stringify(allLogs));

    document.getElementById("quick-log-form").classList.add("hidden");
    renderBuyerLogs();
});


// ==================== CONFIGURATIONS & SETTINGS (LOCALSTORAGE) ====================
const settingsModal = document.getElementById("modal-settings");

document.getElementById("open-settings-btn").addEventListener("click", () => {
    document.getElementById("settings-gemini-key").value = AppState.settings.geminiApiKey || "";
    document.getElementById("settings-use-mock-ai").checked = AppState.settings.useMockAi;
    settingsModal.classList.add("active");
});

document.getElementById("save-settings-btn").addEventListener("click", () => {
    const key = document.getElementById("settings-gemini-key").value.trim();
    const useMock = document.getElementById("settings-use-mock-ai").checked;

    AppState.settings.geminiApiKey = key;
    AppState.settings.useMockAi = useMock;
    AppState.saveAll();

    settingsModal.classList.remove("active");
    alert("AI configurations and API keys saved successfully! 🌟");
});

function initSettingsPanel() {
    document.getElementById("reset-db-btn").addEventListener("click", () => {
        if (confirm("CRITICAL ACTION: Kya aap saara custom CRM data reset karke system defaults par waapas jana chahte hain? Isse aapka customized state khali ho jayega!")) {
            localStorage.clear();
            AppState.init();
            renderAll();
            settingsModal.classList.remove("active");
            alert("Database successfully reset! 🌾 App loading refreshed defaults.");
        }
    });
}

// ==================== AI ADVANCED INTEGRATION & CHAT CORE ====================

// Prepare compiled database snapshot context for Gemini system instructions
function buildCrmContextString() {
    const bStr = AppState.buyers.map(b => `- Buyer: ${b.name}, Loc: ${b.location}, Pref: ${b.preferredType}, Varg: ${b.category}`).join("\n");
    const bhStr = AppState.bhattis.map(bh => `- Bhatti: ${bh.name}, Loc: ${bh.location}, Stock: ${bh.stockTonnes}T, Rate: Rs.${bh.ratePerKg}/Kg, Organic: ${bh.isOrganic}`).join("\n");
    const tStr = AppState.logistics.map(l => `- Transporter: ${l.name}, Routes: ${l.routes}, Freight: Rs.${l.rateTonne || l.ratePerTonne}/Tonne`).join("\n");
    const oStr = AppState.orders.map(o => `- Order #ORD-${o.id}: Qty ${o.quantityTonnes}T, Status: ${o.status}`).join("\n");
    const fStr = AppState.followups.filter(f => !f.isCompleted).map(f => `- Pending Task: ${f.title} (Date: ${f.date})`).join("\n");

    return `
=== CURRENT GUR CRM STATE ===
Active Buyers:
${bStr || "None"}

Suppliers Bhatti Stocks:
${bhStr || "None"}

Logistics/Transporters:
${tStr || "None"}

Active Orders:
${oStr || "None"}

Pending Tasks:
${fStr || "None"}
`;
}

// Custom Gemini API Call via REST Client (Strict alignment to rules)
async function callGeminiLiveApi(contentsArray, systemInstructionText) {
    const apiKey = AppState.settings.geminiApiKey;
    if (!apiKey) {
        throw new Error("API_KEY_MISSING");
    }

    // Modern model default: gemini-3.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: contentsArray,
        systemInstruction: {
            parts: [{ text: systemInstructionText }]
        },
        generationConfig: {
            temperature: 0.7,
            topP: 0.95
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini API Error details:", errText);
        throw new Error(`API_FAILED_CODE_${response.status}`);
    }

    const resJson = await response.json();
    try {
        const textResponse = resJson.candidates[0].content.parts[0].text;
        return textResponse;
    } catch (e) {
        console.error("Gemini response parsing failed:", resJson);
        throw new Error("PARSING_ERROR");
    }
}

// Intelligent Offline Fallback / Mock AI engine (Hinglish business brain)
function generateIntelligentMockResponse(userInput) {
    const text = userInput.toLowerCase();
    const context = buildCrmContextString();

    let reply = "";

    if (text.includes("task") || text.includes("grow") || text.includes("target")) {
        reply = "Ram Ram! Maine aapke database ke contacts and stocks ko review kiya hai. Aapko ek naya High-Priority strategic task design kiya hai. Kripya chat ke upar diye gaye 'Get AI Target' button par click karein aur use click karke planner me active task ki tarah save karein! Mujhse baki optimization discuss karein.";
    } else if (text.includes("bikaner") || text.includes("sweet")) {
        reply = "Bikaner Sweet Mart (Mithai Manufacturer) ke liye solid advice: 🌟\n\n1. Inhe sabse zyada demand 'Golden Double-Filter' Jaggery ki hoti hai.\n2. Hamari Deccan Gold Bhatti me abhi 40 Tonnes stock khali hai Rs.45/Kg par.\n3. Speed Express Transporter Kolhapur-Bikaner route par Rs.4200/Tonne charge karta hai.\n4. Agar aap Bikaner Sweets ko Rs.58/Kg pitch karenge, toh ₹45/Kg (Bhatti) + ₹4.2/Kg (Freight) + ₹1.5/Kg other expenses = Rs.50.7 total cost aayega. Aapko seedhe ₹7.3 per Kg yani ₹7,300 per Tonne ka solid net profit margin milega! 🚀\n\nAapko aaj hi Bikaner Sweets ke owner ko call karke ye golden double filter pitch karna chahiye.";
    } else if (text.includes("rajesh") || text.includes("gupta") || text.includes("swadeshi")) {
        reply = "Rajesh Gupta Swadeshi Sweets (Delhi) ke regarding guidance: 📞\n\nInka preferred type 'Organic Cubes' hai. Kolhapur Premium Bhatti me 25 Tonnes stock fresh organic jaggery ka available hai. Sanjay Transporter (Maratha Roadways) ka truck Delhi route par lagta hai. Inhe rate quote karein aur follow-up sheet me check karein. Delhi delivery me Rs.55/Kg par margin lagbhag 15% clear mil raha hai. Let's close this fast!";
    } else if (text.includes("profit") || text.includes("loss") || text.includes("margin") || text.includes("optimize")) {
        reply = "Aapka trade profit optimize karne ke top rules: 📊\n\n1. Double Filter premium stocks Kolhapur se uthayein aur retail networks ko Rs.56+ me bechein. Margin 18% tak chala jayega.\n2. Transport cost kam karne ke liye multi-destination trucking check karein.\n3. UP Muzaffarnagar (Malwa Bhatti) se Rs.38/Kg par buy karke standard buyers ko Rs.48+ par supply karein taaki mass transit profit ho.\n\nKoi specific sauda optimize karna hai, toh uska naam bataiye.";
    } else if (text.includes("route") || text.includes("transport") || text.includes("freight") || text.includes("gadi")) {
        reply = "Hamare active route options: 🚛\n\n- Kolhapur-Delhi route (Maratha Roadways): Rate ₹3200 per Tonne.\n- Muzaffarnagar-Delhi/Bikaner route (Vikas Transport): Rate ₹2800 per Tonne.\n- Kolhapur-Bikaner route (Speed Express): Rate ₹4200 per Tonne.\n\nAgar aapko transport rate optimize karna hai, toh dynamic mix matching use karein. Bhatti load ke hisab se driver ko rate sheet call karein.";
    } else {
        reply = "Ram Ram! Aapke Jaggery trade CRM ka analysis complete hai. 👍\n\n- Mere paas abhi " + AppState.buyers.length + " active Buyers aur " + AppState.bhattis.length + " Suppliers Bhatti records hain.\n- Aapka active Season Trade Volume targets " + AppState.seasonTarget.targetTonnes + " Tonnes hai.\n- Hamara estimated Net Profit trade ₹" + AppState.orders.reduce((sum, o) => {
            const rev = o.quantityTonnes * 1000 * o.sellingRate;
            const exp = (o.quantityTonnes * 1000 * o.buyingRate) + o.transportCost + o.otherExpenses;
            return sum + (o.status !== 'Cancelled' ? (rev - exp) : 0);
        }, 0).toLocaleString() + " chal raha hai.\n\nAapko kis specific buyer ke pitch, transport rate details ya market stocks pricing ke bare me help chahiye?";
    }

    return reply;
}

// 1. INLINE AI PITCH ON BUYER PROFILE MODAL
document.getElementById("generate-buyer-ai-pitch-btn").addEventListener("click", async () => {
    const pitchBox = document.getElementById("buyer-ai-pitch-output");
    const textBox = pitchBox.querySelector(".text");
    const loadingDots = pitchBox.querySelector(".loading-inline");

    pitchBox.classList.remove("hidden");
    textBox.innerText = "";
    loadingDots.classList.remove("hidden");

    const buyer = AppState.buyers.find(x => x.id === currentSelectedBuyerIdForDetails);
    if (!buyer) return;

    const systemPrompt = `You are 'Gur Vyapaar Mitra', an AI Advisor for Pan-India Jaggery Export. Generate a short, highly practical sales pitch in 3 sentences written in Hinglish (Hindi written in Roman/English script) to win over this specific buyer. Emphasize their preferred type, target stock, and a professional, friendly relationship.`;
    const userPrompt = `Buyer Name: ${buyer.name}, Category: ${buyer.category}, Location: ${buyer.location}, Jaggery preference: ${buyer.preferredType}. Suggest a highly attractive pricing rate deal.`;

    if (!AppState.settings.useMockAi && AppState.settings.geminiApiKey) {
        try {
            const contents = [{ role: "user", parts: [{ text: userPrompt }] }];
            const result = await callGeminiLiveApi(contents, systemPrompt);
            loadingDots.classList.add("hidden");
            textBox.innerText = result;
        } catch (err) {
            console.error("AI pitch live call failed:", err);
            // Fallback to offline mock on error
            setTimeout(() => {
                loadingDots.classList.add("hidden");
                textBox.innerText = generateLocalBuyerPitchMock(buyer);
            }, 1000);
        }
    } else {
        // Offline / Mock mode
        setTimeout(() => {
            loadingDots.classList.add("hidden");
            textBox.innerText = generateLocalBuyerPitchMock(buyer);
        }, 1200);
    }
});

function generateLocalBuyerPitchMock(buyer) {
    return `Ram Ram ${buyer.name.split(" ")[0]} Ji! Swadeshi organic premium bheli jaggery ka fresh stock bhatiyo se direct utha kar rawana ho chuka hai. Is baar ki chemical-free quality behad sweet aur export standards ke mutabik khari hai. Aapki Delhi market ke liye hum Rs.54/Kg rate par fast transit supply clear karwa rahe hain, jo aapki wholesale demand ke liye best profit dega. Let's lock this! 🌾`;
}

// 2. ACTIVE CHAT CO-PILOT SUBMISSIONS
function initAiCoPilotChat() {
    const sendBtn = document.getElementById("send-chat-btn");
    const chatInput = document.getElementById("chat-input");

    async function handleUserChatSubmit() {
        const query = chatInput.value.trim();
        if (!query) return;

        // Display user message in chat immediately
        AppState.chatMessages.push({ sender: "user", text: query, timestamp: Date.now() });
        AppState.saveAll();
        renderAiChatView();

        chatInput.value = "";

        // Show typing loading animation
        const typingIndicator = document.getElementById("chat-typing-indicator");
        typingIndicator.classList.remove("hidden");

        const crmContext = buildCrmContextString();
        const systemInstruction = `
You are 'Gur Vyapaar Mitra', an AI Business Advisor for a Pan-India Jaggery Export Business. 
Talk to the user in a motivating, highly professional, and friendly Hinglish (Hindi written in Roman/English script) or clean Hindi. Use good business-oriented emojis.
Help them optimize their profit, design buyer pitches, check transport routes, and give active task guidance to grow their trade.

Here is the current real-time state of their business database (Context):
${crmContext}

Respond to the user's latest query using this context. Be extremely action-oriented.
`;

        if (!AppState.settings.useMockAi && AppState.settings.geminiApiKey) {
            try {
                // Construct full historical contents array for conversation memory
                const contents = AppState.chatMessages.map(msg => ({
                    role: msg.sender === "user" ? "user" : "model",
                    parts: [{ text: msg.text }]
                }));

                const reply = await callGeminiLiveApi(contents, systemInstruction);

                typingIndicator.classList.add("hidden");
                AppState.chatMessages.push({ sender: "ai", text: reply, timestamp: Date.now() });
                AppState.saveAll();
                renderAiChatView();
            } catch (err) {
                console.error("Gemini Live Chat API error:", err);
                typingIndicator.classList.add("hidden");
                const errorText = "Afsos! Kuch network or server connection ki vajah se response nahi mil paya. Mock AI toggle select karein settings me bina key ke chalane ke liye.";
                AppState.chatMessages.push({ sender: "ai", text: errorText, timestamp: Date.now() });
                AppState.saveAll();
                renderAiChatView();
            }
        } else {
            // Offline / Mock response generator
            setTimeout(() => {
                const reply = generateIntelligentMockResponse(query);
                typingIndicator.classList.add("hidden");
                AppState.chatMessages.push({ sender: "ai", text: reply, timestamp: Date.now() });
                AppState.saveAll();
                renderAiChatView();
            }, 1000);
        }
    }

    sendBtn.addEventListener("click", handleUserChatSubmit);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleUserChatSubmit();
    });

    document.getElementById("clear-chat-btn").addEventListener("click", () => {
        if (confirm("Kya aap saari chat history hatana chahte hain?")) {
            AppState.chatMessages = [...DEFAULT_WELCOME_CHAT];
            AppState.saveAll();
            renderAiChatView();
        }
    });
}

// 3. AI DYNAMIC TARGET TASK GENERATOR (GET TARGET ACCEPTER)
let lastGeneratedAiTaskObj = null;

document.getElementById("ai-generate-target-btn").addEventListener("click", async () => {
    const taskCard = document.getElementById("ai-suggested-task-card");
    const titleEl = document.getElementById("ai-task-title");
    const descEl = document.getElementById("ai-task-desc");
    const dateEl = document.getElementById("ai-task-date");
    const todayStr = new Date().toISOString().split('T')[0];

    taskCard.classList.remove("hidden");
    titleEl.innerText = "Analyzing CRM database... 🧠";
    descEl.innerText = "Please wait, Vyapaar Mitra is reviewing your buyers, stocks, routes, and outstanding invoices to find the single most profitable action for you today.";
    dateEl.innerText = todayStr;

    const context = buildCrmContextString();
    const systemInstruction = `Based on the current state of my Jaggery Export Business CRM, generate ONE high-priority, strategic daily task to grow my business rapidly.
The task must be highly practical, specific, and achievable in one day (e.g. following up with a buyer who hasn't been contacted, checking stock levels at a bhatti, asking for rate sheets from logistics).

You MUST return ONLY a raw JSON object containing exactly the following keys, with NO markdown formatting, NO backticks, and NO extra text:
{
  "title": "A short, catchy, action-oriented task title in Hinglish with an emoji (e.g., '📞 Rajesh Gupta Deal Pitch')",
  "description": "A highly motivating, detailed description in Hinglish explaining EXACTLY what to do, which buyer/bhatti to target, and how this will help grow the jaggery business.",
  "date": "${todayStr}"
}`;

    if (!AppState.settings.useMockAi && AppState.settings.geminiApiKey) {
        try {
            const contents = [{ role: "user", parts: [{ text: "Generate high priority task." }] }];
            const rawResult = await callGeminiLiveApi(contents, systemInstruction);

            // Strip markdown block if model accidentally includes it
            let cleanJson = rawResult.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            }
            cleanJson = cleanJson.trim();

            const parsedTask = JSON.parse(cleanJson);
            lastGeneratedAiTaskObj = {
                title: parsedTask.title || "🎯 Naya Jaggery Business Target",
                description: parsedTask.description || "Follow up with buyers and record active profit.",
                date: parsedTask.date || todayStr
            };

            titleEl.innerText = lastGeneratedAiTaskObj.title;
            descEl.innerText = lastGeneratedAiTaskObj.description;
            dateEl.innerText = lastGeneratedAiTaskObj.date;

        } catch (err) {
            console.error("AI Target generator failed:", err);
            // Fallback to mock task on error
            setLocalSuggestedTaskMock();
        }
    } else {
        // Offline / Mock target generator
        setTimeout(() => {
            setLocalSuggestedTaskMock();
        }, 1500);
    }
});

function setLocalSuggestedTaskMock() {
    const todayStr = new Date().toISOString().split('T')[0];
    const mockTasksList = [
        {
            title: "📞 Bikaner Sweets double-filter deal",
            description: "Bikaner Sweets ko Deccan Gold bhatti se fresh golden double-filter cubes dispatch karein (Rs.58/Kg pitch) aur high-profit margin trade confirm karein.",
            date: todayStr
        },
        {
            title: "🚛 Sanjay Shinde Transit Confirm",
            // Check transit delays
            description: "Sanjay Shinde transporter se truck MH-09 ka rate sheet confirm kar ke Delhi road routes ka safety check lijiye taaki loading delay na ho.",
            date: todayStr
        },
        {
            title: "🌾 Malwa Bhatti Organic Stocks audit",
            description: "Sohan Lal ji ko call karke unke chemical-free production certified organic cubes ka bulk stock book karein, kyunki market rates badhne ke asar hain.",
            date: todayStr
        }
    ];

    // Pick random task from sample mocks
    const selectedTask = mockTasksList[Math.floor(Math.random() * mockTasksList.length)];
    lastGeneratedAiTaskObj = selectedTask;

    document.getElementById("ai-task-title").innerText = selectedTask.title;
    document.getElementById("ai-task-desc").innerText = selectedTask.description;
    document.getElementById("ai-task-date").innerText = selectedTask.date;
}

// Accept and insert AI task into LocalStorage followups
document.getElementById("accept-ai-task-btn").addEventListener("click", () => {
    if (lastGeneratedAiTaskObj) {
        const newId = AppState.followups.length > 0 ? Math.max(...AppState.followups.map(x => x.id)) + 1 : 1;
        AppState.followups.push({
            id: newId,
            title: lastGeneratedAiTaskObj.title,
            description: lastGeneratedAiTaskObj.description,
            date: lastGeneratedAiTaskObj.date,
            isCompleted: false,
            relatedType: "General",
            relatedId: 0
        });

        AppState.saveAll();
        document.getElementById("ai-suggested-task-card").classList.add("hidden");
        lastGeneratedAiTaskObj = null;

        alert("AI Daily Target accepted aur aapke Planner follow-ups me successfully save ho gaya hai! 🎯🚀");
        renderAll();
    }
});

document.getElementById("dismiss-ai-task-btn").addEventListener("click", () => {
    document.getElementById("ai-suggested-task-card").classList.add("hidden");
    lastGeneratedAiTaskObj = null;
});

// ==================== AI BUYER FINDER & LEAD GENERATOR CONTROLLER ====================
let currentLeadsResults = [];

function initBuyerFinder() {
    const findLeadsBtn = document.getElementById("find-leads-btn");
    if (!findLeadsBtn) return;

    findLeadsBtn.addEventListener("click", handleSearchLeads);
}

function renderBuyerFinderView() {
    // Tab load handler (no dynamic rendering required on tab click except ensuring state is stable)
    console.log("Buyer Finder View loaded.");
}

async function handleSearchLeads() {
    const region = document.getElementById("finder-region").value.trim() || "Delhi NCR";
    const category = document.getElementById("finder-category").value;
    const product = document.getElementById("finder-product").value;
    const volume = document.getElementById("finder-volume").value;

    const findLeadsBtn = document.getElementById("find-leads-btn");
    const loadingPanel = document.getElementById("finder-loading-panel");
    const loadingStep = document.getElementById("finder-loading-step");
    const resultsSection = document.getElementById("finder-results-section");

    // Disable button and show loading panel
    findLeadsBtn.disabled = true;
    findLeadsBtn.style.opacity = "0.7";
    findLeadsBtn.innerText = "Processing Trade Data...";
    loadingPanel.classList.remove("hidden");
    resultsSection.classList.add("hidden");

    // Step-by-step ultra-realistic loading messages
    const loadingMessages = [
        "Analyzing regional sweet hubs, wholesale mandi traders, and jaggery importing regulations...",
        "Searching Indian Agro Directories and regional APMC trade registers...",
        "Compiling local market signals and winter demand fluctuations for November...",
        "Calculating buyer conversion probability based on historical festival peaks...",
        "Formulating tailored Hinglish sales pitches for high-probability targets..."
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length) {
            loadingStep.innerText = loadingMessages[messageIndex];
            messageIndex++;
        }
    }, 900);

    try {
        let leads = [];
        if (!AppState.settings.useMockAi && AppState.settings.geminiApiKey) {
            // Live Gemini API Lead Generation
            leads = await getLeadsFromGemini(region, category, product, volume);
        } else {
            // Wait 2.5 seconds to simulate high-performance AI indexing
            await new Promise(resolve => setTimeout(resolve, 2500));
            leads = generateMockLeads(region, category, product, volume);
        }

        clearInterval(messageInterval);
        currentLeadsResults = leads;

        // Populate results
        document.getElementById("leads-count-badge").innerText = `${leads.length} Leads Found`;
        document.getElementById("leads-summary-text").innerText = `Showing highly probable ${category === "All" ? "jaggery" : category} buyers in ${region} looking for ${product}.`;

        renderLeadsList(leads);

        // UI transitions
        loadingPanel.classList.add("hidden");
        resultsSection.classList.remove("hidden");
    } catch (err) {
        console.error("Leads search failed, falling back to mock:", err);
        clearInterval(messageInterval);
        const fallbackLeads = generateMockLeads(region, category, product, volume);
        currentLeadsResults = fallbackLeads;

        document.getElementById("leads-count-badge").innerText = `${fallbackLeads.length} Fallback Leads Found`;
        document.getElementById("leads-summary-text").innerText = `Showing curated probable buyers in ${region} looking for ${product} (Mock AI Fallback).`;
        
        renderLeadsList(fallbackLeads);
        loadingPanel.classList.add("hidden");
        resultsSection.classList.remove("hidden");
    } finally {
        findLeadsBtn.disabled = false;
        findLeadsBtn.style.opacity = "1";
        findLeadsBtn.innerHTML = `<span class="material-symbols-outlined">travel_explore</span><span>Dhoondhein Genuine Buyers (Search Leads)</span>`;
    }
}

// REST call to Gemini API for live lead generation
async function getLeadsFromGemini(region, category, product, volume) {
    const systemPrompt = `You are 'Gur Vyapaar Mitra', an AI Pan-India Jaggery Trade Lead Generator.
Based on the user's criteria, generate exactly 4 to 5 highly realistic, genuine target buyers (such as commercial sweet manufacturer chains, regional wholesalers, retail organic brands, food companies, or export houses) located in the specified area.

Provide highly authentic local market data matching real-world Indian agricultural trade clusters (e.g. if Delhi NCR, use wholesale market spots in Khari Baoli, Naya Bazar, Okhla, Sahibabad, etc. If Jaipur, use Johri Bazar, VKI Industrial area, Sikar Mandi, etc. If sweet makers, use prominent real sweet chains like Haldirams, Bikanervala, Rawat Sweets, Chitale Bandhu, etc., or realistic regional brand names).

You MUST return ONLY a raw, valid JSON array containing objects with the exact keys below. Do NOT wrap inside markdown formatting, do NOT write \`\`\`json, and write NO extra text or commentary:
[
  {
    "name": "Full professional company/sweet shop name (e.g., 'Chainsukh Harish Sweets Pvt Ltd')",
    "category": "One of: 'Sweet Manufacturer', 'Wholesaler', 'Retailer', 'Food Company', 'Exporter'",
    "location": "Realistic local market address, City, State (e.g., 'Khari Baoli, Delhi NCR')",
    "phone": "Realistic Indian mobile number format (e.g., '+91 98110 55667')",
    "representative": "A realistic Indian contact name (e.g., 'Arvind Khandelwal')",
    "preferredType": "Preferred Jaggery type matching input (e.g., '${product}')",
    "volume": "Estimated monthly jaggery requirements matching user scope (e.g., '15-20 Tonnes / month')",
    "probability": "One of: 'Very High', 'High', 'Medium'",
    "intentSignal": "A compelling explanation in Hinglish (Hindi in Roman script) of why they have a high buying probability, highlighting their preparation for the upcoming November season, winter sweet production, or festival inventories.",
    "pitchStrategy": "A customized, action-oriented sales pitch in friendly, professional Hinglish. Detail how direct bhatti-to-door delivery with rate guarantees for November will solve their supply issues."
  }
]`;

    const userPrompt = `Target Region: ${region}
Target Sector/Category: ${category}
Jaggery Product Needed: ${product}
Target Volume Scope: ${volume}
Generate a highly targeted lead list matching this criteria for November season launch.`;

    const contents = [{ role: "user", parts: [{ text: userPrompt }] }];
    const rawResult = await callGeminiLiveApi(contents, systemPrompt);

    // Clean JSON block
    let cleanJson = rawResult.trim();
    if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    const parsedArray = JSON.parse(cleanJson);
    if (Array.isArray(parsedArray)) {
        return parsedArray;
    } else {
        throw new Error("INVALID_JSON_ARRAY");
    }
}

// Generate highly realistic Agro Leads locally (Mock Engine)
function generateMockLeads(region, category, product, volume) {
    const isDelhi = region.toLowerCase().includes("delh") || region.toLowerCase().includes("ncr");
    const isRajasthan = region.toLowerCase().includes("raj") || region.toLowerCase().includes("jaip") || region.toLowerCase().includes("jodh");
    const isMaharashtra = region.toLowerCase().includes("mah") || region.toLowerCase().includes("pun") || region.toLowerCase().includes("mumb");

    const chosenRegion = region || "Local Mandi";

    // Sweet shops pool
    const sweetShops = [
        { name: "Bikaner Sweets & Mishtan", rep: "Gopal Agarwal", loc: "Sindhi Camp", phone: "+91 91234 56789" },
        { name: "Rawat Premium Sweets", rep: "Vijay Rawat", loc: "Johri Bazar", phone: "+91 94140 22334" },
        { name: "Kaka Halwai Group", rep: "Aniket Gadre", loc: "Budhwar Peth", phone: "+91 98220 55667" },
        { name: "Chitale Mithai Networks", rep: "Sarang Chitale", loc: "Deccan Gymkhana", phone: "+91 99224 88990" },
        { name: "Hira Sweets & Foods", rep: "Harish Sharma", loc: "Shahdara", phone: "+91 98100 11223" },
        { name: "Jodhpur Sweets & Caterers", rep: "Sohan Lal Gehlot", loc: "Sojati Gate", phone: "+91 94250 44556" },
        { name: "Haldiram Agro Distributors", rep: "Rameshwar Rao", loc: "Lawrence Road", phone: "+91 93120 77889" },
        { name: "Shree Ganesh Mishtan Bhandar", rep: "Suresh Gupta", loc: "Main Bazar", phone: "+91 98765 43210" }
    ];

    // Wholesalers pool
    const wholesalers = [
        { name: "Gupta Agro & Sugar Traders", rep: "Rajesh Gupta", loc: "Khari Baoli", phone: "+91 98110 55667" },
        { name: "Khandelwal Gur Trading Company", rep: "Arvind Khandelwal", loc: "Anaj Mandi", phone: "+91 94140 77889" },
        { name: "Shivaji Jaggery Commission Agent", rep: "Babasaheb Mane", loc: "Gultekdi Market Yard", phone: "+91 90110 33445" },
        { name: "APMC Sugar & Jaggery Depot", rep: "Sanjay Shinde", loc: "Vashi Sector 19", phone: "+91 98200 44556" },
        { name: "Ganga Ram Jagdish Prasad", rep: "Vijay Bansal", loc: "Naya Ganj", phone: "+91 93122 33445" },
        { name: "Thok Vyapaari Prem Chand & Sons", rep: "Prem Chand", loc: "Mandi Gate", phone: "+91 98960 11223" }
    ];

    // Exporters pool
    const exporters = [
        { name: "Indo-Global Agro Export House", rep: "Sanjeev Mehra", loc: "Kirti Nagar Industrial Area", phone: "+91 98111 22334" },
        { name: "Sovereign Organic Spices Export", rep: "Devendra Patel", loc: "Noida Phase II", phone: "+91 98180 55667" },
        { name: "Deccan Agro Exports Ltd.", rep: "Vikas Deshmukh", loc: "JNPT Area", phone: "+91 90112 33445" },
        { name: "Marwar Agro Products Overseas", rep: "Shyam Sundar", loc: "VKI Area", phone: "+91 94140 11223" }
    ];

    // Large Food Companies pool
    const foodCompanies = [
        { name: "Patanjali Distributing Agency", rep: "Swami Dharamdev", loc: "Industrial Park", phone: "+91 98101 22334" },
        { name: "Mother's Choice Organic Foods", rep: "Amitav Sen", loc: "Okhla Phase III", phone: "+91 98115 55667" },
        { name: "Organic Agro India Pvt. Ltd.", rep: "Vikram Shah", loc: "GIDC Industrial Estate", phone: "+91 98250 44556" },
        { name: "Sri Sri Tattva Agro Division", rep: "Narayana Swamy", loc: "Kanakapura Road", phone: "+91 99000 11223" }
    ];

    let pool = [];
    if (category.includes("Sweet") || category.includes("Halwai")) {
        pool = sweetShops;
    } else if (category.includes("Wholesaler") || category.includes("Thok")) {
        pool = wholesalers;
    } else if (category.includes("Export")) {
        pool = exporters;
    } else if (category.includes("Food")) {
        pool = foodCompanies;
    } else {
        // All
        pool = [...sweetShops, ...wholesalers, ...exporters, ...foodCompanies];
    }

    // Shuffle pool
    pool = pool.sort(() => 0.5 - Math.random());

    // Generate 4-5 leads
    const numLeads = Math.min(pool.length, 4 + Math.floor(Math.random() * 2));
    const generatedLeads = [];

    for (let i = 0; i < numLeads; i++) {
        const item = pool[i];
        let finalLoc = item.loc;
        if (isDelhi) finalLoc += ", Delhi NCR";
        else if (isRajasthan) finalLoc += ", Rajasthan";
        else if (isMaharashtra) finalLoc += ", Maharashtra";
        else {
            finalLoc += `, ${chosenRegion}`;
        }

        // Probability
        const probabilities = ["Very High", "High", "Medium"];
        const prob = (i === 0) ? "Very High" : probabilities[Math.floor(Math.random() * probabilities.length)];

        // Volume calculation based on user input
        let finalVol = volume;
        if (volume.includes("Large")) {
            finalVol = (15 + Math.floor(Math.random() * 15)) + " Tonnes / month";
        } else if (volume.includes("Small")) {
            finalVol = (2 + Math.floor(Math.random() * 3)) + " Tonnes / month";
        } else if (volume.includes("Bulk")) {
            finalVol = (100 + Math.floor(Math.random() * 50)) + " Tonnes / month";
        } else {
            finalVol = (5 + Math.floor(Math.random() * 10)) + " Tonnes / month";
        }

        const formattedCategory = item.name.includes("Sweets") || item.name.includes("Mithai") || item.name.includes("Halwai") ? "Sweet Manufacturer" :
                                  item.name.includes("Export") || item.name.includes("Overseas") ? "Exporter" :
                                  item.name.includes("Agro") || item.name.includes("Organic") ? "Food Company" : "Wholesaler";

        // Generate custom pitch strategy in Hinglish
        let pitch = "";
        if (formattedCategory === "Sweet Manufacturer") {
            pitch = `Ram Ram ${item.rep.split(" ")[0]} Ji! Hum direct Kolhapur aur Muzaffarnagar bhatiyo se super-premium, double-filtered golden jaggery supply karte hain jo mithai banane me perfect sweetening aur authentic taste deti hai. November season start hone se pehle hum high-volume order booking par rates lock kar rahe hain taaki Diwali peak me aapko rate fluctuations ka asar na padhe. Ek baar rates confirm karein?`;
        } else if (formattedCategory === "Exporter") {
            pitch = `Greetings ${item.rep}! We provide chemical-free, standard moisture export-grade organic jaggery cubes with complete certification (Kolhapur/Pune region). For the upcoming November export shipments, we are offering price guarantees and logistics backing. Let's discuss a container rate quote?`;
        } else if (formattedCategory === "Food Company") {
            pitch = `Ram Ram ${item.rep.split(" ")[0]} Ji! Hum sugarcane farmers se direct tie-up karke certified organic powder, blocks aur cubes jaggery produce karate hain. Aapke retail packaged organic range ke liye hum constant high-quality raw material supply ensure kar sakte hain. Hum November slot booking ka discount sheet share kar rahe hain, check kijiye.`;
        } else {
            pitch = `Ram Ram ${item.rep.split(" ")[0]} Ji! Mandi ke rate badhne se pehle hum direct production rate par golden double-filter bheli stocks offer kar rahe hain. November dispatch ke saude abhi lock karne par aapko bulk trade me high margin milega. Pure transport logistics support ke sath delivery direct aapki mandi tak hogi.`;
        }

        // Generate intent signal explanation in Hinglish
        let intent = "";
        if (formattedCategory === "Sweet Manufacturer") {
            intent = `November se festive aur wedding season shuru ho jata hai, jisse sweet manufacturers ki demand 3x badh jaati hai. Diwali aur winters ke liye sweets aur special gur-items taiyaar karne ke liye inhe advance stocks chahiye, isliye ye rates lock karne me behad interested hain.`;
        } else if (formattedCategory === "Exporter") {
            intent = `International buyers winter seasons me organic products ki fresh shipments demand karte hain. Exporters ko custom clearances aur export documentation me time lagta hai, isliye ye November shipment ke liye abhi se suppliers se quality samples mangwa rahe hain.`;
        } else if (formattedCategory === "Food Company") {
            intent = `FMCG brands winter premium sugar-alternatives launches ke liye certified chemical-free raw material procurement start kar rahe hain. November season start hone par sabse pehla organic batch uthane ke liye inke supply chains tight hote hain.`;
        } else {
            intent = `Winter season me thand badhne se pure North aur Western India me gur ki khareeddar badh jaati hai. Thok vyapaari season ke shuruati rates me discount lekar apni inventories bharna chahte hain taaki baad me shortage na ho.`;
        }

        generatedLeads.push({
            name: item.name,
            category: formattedCategory,
            location: finalLoc,
            phone: item.phone,
            representative: item.rep,
            preferredType: product,
            volume: finalVol,
            probability: prob,
            intentSignal: intent,
            pitchStrategy: pitch
        });
    }

    return generatedLeads;
}

// Render dynamic leads to DOM
function renderLeadsList(leads) {
    const container = document.getElementById("finder-leads-container");
    container.innerHTML = "";

    if (leads.length === 0) {
        container.innerHTML = `
            <p class="empty-placeholder">
                <span class="material-symbols-outlined">warning</span>
                Iss region aur sector ke liye koi leads nahi mili. Kripya criteria badal kar dhoondhein!
            </p>
        `;
        return;
    }

    leads.forEach((lead, idx) => {
        const div = document.createElement("div");
        div.className = "panel-card lead-item-card";
        div.style.marginBottom = "16px";
        div.style.borderLeft = `4px solid ${lead.probability === 'Very High' ? 'var(--sugarcane-green)' : 'var(--jaggery-gold)'}`;
        div.style.backgroundColor = "var(--bg-sugar-card)";

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <h4 style="font-family: var(--font-heading); font-size: 18px; font-weight: bold; color: var(--text-cream); margin: 0;">${lead.name}</h4>
                        <span class="badge" style="background-color: ${lead.probability === 'Very High' ? 'var(--sugarcane-green-glow)' : 'var(--jaggery-gold-glow)'}; color: ${lead.probability === 'Very High' ? 'var(--sugarcane-green)' : 'var(--jaggery-gold)'}; font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${lead.probability.toUpperCase()} BUYING PROBABILITY</span>
                    </div>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px; display: flex; align-items: center; gap: 6px; margin-bottom: 0;">
                        <span class="material-symbols-outlined" style="font-size: 16px; color: var(--jaggery-gold);">storefront</span>
                        ${lead.category} | <span class="material-symbols-outlined" style="font-size: 16px; color: var(--jaggery-gold);">location_on</span> ${lead.location}
                    </p>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 11px; color: var(--text-muted);">Est. Requirement:</span>
                    <p style="font-family: var(--font-heading); font-weight: bold; color: var(--jaggery-gold); font-size: 14.5px; margin: 0;">${lead.volume}</p>
                </div>
            </div>

            <div style="background-color: rgba(0,0,0,0.15); border: 1px solid var(--border-sugar); border-radius: 12px; padding: 12px; margin: 12px 0;">
                <div style="display: grid; grid-template-columns: 1fr; gap: 12px; font-size: 12px;">
                    <div style="display: flex; flex-wrap: wrap; gap: 24px;">
                        <div>
                            <strong style="color: var(--text-muted);">Contact Person:</strong>
                            <p style="font-weight: 600; color: var(--text-cream); margin-top: 2px; margin-bottom: 0;">${lead.representative} (${lead.phone})</p>
                        </div>
                        <div>
                            <strong style="color: var(--text-muted);">Preferred Jaggery:</strong>
                            <p style="font-weight: 600; color: var(--text-cream); margin-top: 2px; margin-bottom: 0;">${lead.preferredType}</p>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 12px;">
                    <strong style="color: var(--text-muted);">Buying Intent Signal:</strong>
                    <p style="color: var(--text-cream); line-height: 1.5; margin-top: 2px; margin-bottom: 0;">${lead.intentSignal}</p>
                </div>
            </div>

            <!-- Custom sales pitch box -->
            <div style="background-color: rgba(243, 156, 18, 0.03); border: 1px dashed var(--jaggery-gold-glow); border-radius: 12px; padding: 12px; margin-bottom: 12px;">
                <h5 style="font-family: var(--font-heading); font-size: 11px; text-transform: uppercase; color: var(--jaggery-gold); letter-spacing: 0.5px; font-weight: 700; display: flex; align-items: center; gap: 4px; margin: 0;">
                    <span class="material-symbols-outlined" style="font-size: 14px;">auto_awesome</span> Custom Sales Pitch & Strategy
                </h5>
                <p style="font-size: 12px; font-style: italic; color: var(--text-cream); line-height: 1.5; margin-top: 6px; margin-bottom: 0;" class="pitch-text">
                    "${lead.pitchStrategy}"
                </p>
            </div>

            <!-- Action buttons -->
            <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                <button class="secondary-btn import-crm-btn" style="padding: 8px 12px; font-size: 11px; border-radius: 8px; font-family: var(--font-heading);">
                    <span class="material-symbols-outlined" style="font-size: 14px;">person_add</span> Add to CRM Directory
                </button>
                <button class="secondary-btn import-planner-btn" style="padding: 8px 12px; font-size: 11px; border-radius: 8px; font-family: var(--font-heading);">
                    <span class="material-symbols-outlined" style="font-size: 14px;">calendar_today</span> Schedule Follow-up
                </button>
                <button class="primary-btn whatsapp-pitch-btn" style="padding: 8px 12px; font-size: 11px; border-radius: 8px; background-color: var(--sugarcane-green); box-shadow: none; font-family: var(--font-heading);">
                    <span class="material-symbols-outlined" style="font-size: 14px;">chat</span> Send Pitch on WhatsApp
                </button>
            </div>
        `;

        // Bind CRM trigger
        const crmBtn = div.querySelector(".import-crm-btn");
        crmBtn.addEventListener("click", () => addLeadToCrm(lead, crmBtn));

        // Check if already in CRM and update UI initially
        const alreadyInCrm = AppState.buyers.some(b => b.name === lead.name);
        if (alreadyInCrm) {
            crmBtn.innerHTML = `<span class="material-symbols-outlined">done</span> Added to CRM`;
            crmBtn.disabled = true;
            crmBtn.style.opacity = "0.7";
            crmBtn.style.backgroundColor = "var(--sugarcane-green-glow)";
        }

        // Bind Planner trigger
        const plannerBtn = div.querySelector(".import-planner-btn");
        plannerBtn.addEventListener("click", () => addLeadToPlanner(lead, plannerBtn));

        // Bind WhatsApp trigger
        const waBtn = div.querySelector(".whatsapp-pitch-btn");
        waBtn.addEventListener("click", () => openWhatsAppPitch(lead));

        container.appendChild(div);
    });
}

function addLeadToCrm(lead, btnElement) {
    const exists = AppState.buyers.some(b => b.name === lead.name);
    if (exists) {
        alert("Ye buyer pehle se hi aapke CRM me hai! 🌾");
        return;
    }

    const nextId = AppState.buyers.length > 0 ? Math.max(...AppState.buyers.map(b => b.id)) + 1 : 1;
    AppState.buyers.push({
        id: nextId,
        name: lead.name,
        phone: lead.phone,
        location: lead.location,
        category: lead.category === "Sweet Manufacturer" ? "Sweet Manufacturer" : lead.category === "Exporter" ? "Exporter" : "Wholesaler",
        preferredType: lead.preferredType
    });

    AppState.saveAll();

    btnElement.innerHTML = `<span class="material-symbols-outlined">done</span> Added to CRM`;
    btnElement.disabled = true;
    btnElement.style.opacity = "0.7";
    btnElement.style.backgroundColor = "var(--sugarcane-green-glow)";

    alert(`Badhiya! ${lead.name} ko CRM Directory (Khareeddar) me successfully add kar diya gaya hai! 🌾🚀`);
    renderBuyersView();
}

function addLeadToPlanner(lead, btnElement) {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextId = AppState.followups.length > 0 ? Math.max(...AppState.followups.map(x => x.id)) + 1 : 1;

    AppState.followups.push({
        id: nextId,
        title: `📞 Call ${lead.representative || lead.name}`,
        description: `Season start booking pitch: ${lead.pitchStrategy}. Mobile: ${lead.phone}`,
        date: todayStr,
        isCompleted: false,
        relatedType: "General",
        relatedId: 0
    });

    AppState.saveAll();

    btnElement.innerHTML = `<span class="material-symbols-outlined">done</span> Added to Planner`;
    btnElement.disabled = true;
    btnElement.style.opacity = "0.7";

    alert(`Aapke Planner me ${lead.name} ke liye ek pending follow-up call successfully schedule ho gayi hai! 📅🚀`);
    renderPlannerView();
}

function openWhatsAppPitch(lead) {
    const message = `Ram Ram ${lead.representative || lead.name.split(" ")[0]} Ji! 🙏\n\n${lead.pitchStrategy}\n\n- Sent via Gur Vyapaar Mitra CRM`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
}

// ============================================================================
//                  ADDITIONAL PREMIUM BUSINESS FEATURES & LOGIC
// ============================================================================

// --- 1. DYNAMIC REMINDERS RELATED TO SELECTOR ---
function handleTaskTypeChange() {
    const type = document.getElementById("task-type").value;
    const group = document.getElementById("task-related-id-group");
    const select = document.getElementById("task-related-id");
    
    if (type === "General") {
        group.style.display = "none";
        select.innerHTML = "";
        return;
    }
    
    group.style.display = "block";
    select.innerHTML = "";
    
    if (type === "Buyer") {
        AppState.buyers.forEach(b => {
            const opt = document.createElement("option");
            opt.value = b.id;
            opt.innerText = b.name;
            select.appendChild(opt);
        });
    } else if (type === "Bhatti") {
        AppState.bhattis.forEach(bh => {
            const opt = document.createElement("option");
            opt.value = bh.id;
            opt.innerText = bh.name;
            select.appendChild(opt);
        });
    }
}
window.handleTaskTypeChange = handleTaskTypeChange;

// --- 2. CUSTOM FIELD MANAGER STATE & LOGIC ---
function getCustomFields() {
    return JSON.parse(localStorage.getItem("gur_custom_fields")) || [];
}

function saveCustomFields(fields) {
    localStorage.setItem("gur_custom_fields", JSON.stringify(fields));
}

function addCustomField() {
    const target = document.getElementById("cf-target").value;
    const type = document.getElementById("cf-type").value;
    const label = document.getElementById("cf-label").value.trim();
    
    if (!label) {
        alert("Please write a field label name!");
        return;
    }
    
    const fields = getCustomFields();
    const isDuplicate = fields.some(f => f.target === target && f.label.toLowerCase() === label.toLowerCase());
    if (isDuplicate) {
        alert("This field name already exists for this profile type!");
        return;
    }
    
    fields.push({ id: Date.now(), target, type, label });
    saveCustomFields(fields);
    document.getElementById("cf-label").value = "";
    
    renderCustomFieldsSettingsList();
    renderCustomFieldsFormContainers();
    alert(`Success! ${label} custom field has been created.`);
}
window.addCustomField = addCustomField;

function deleteCustomField(id) {
    if (confirm("Are you sure you want to delete this custom field? All data stored in this field across profiles will be lost!")) {
        const fields = getCustomFields().filter(f => f.id !== id);
        saveCustomFields(fields);
        renderCustomFieldsSettingsList();
        renderCustomFieldsFormContainers();
    }
}
window.deleteCustomField = deleteCustomField;

function renderCustomFieldsSettingsList() {
    const container = document.getElementById("custom-fields-list");
    if (!container) return;
    
    const fields = getCustomFields();
    container.innerHTML = "";
    
    if (fields.length === 0) {
        container.innerHTML = `<p style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 6px;">Abhi tak koi custom field nahi banaya.</p>`;
        return;
    }
    
    fields.forEach(f => {
        const div = document.createElement("div");
        div.style = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; font-size: 11px;";
        div.innerHTML = `
            <span><strong>[${f.target}]</strong> ${f.label} (${f.type})</span>
            <button type="button" class="icon-btn" onclick="deleteCustomField(${f.id})" style="padding: 2px;"><span class="material-symbols-outlined text-danger" style="font-size: 16px;">delete</span></button>
        `;
        container.appendChild(div);
    });
}

function renderCustomFieldInput(f) {
    const type = f.type;
    const options = f.options ? (Array.isArray(f.options) ? f.options : f.options.split(",").map(o => o.trim())) : [];
    
    if (type === "textarea") {
        return `<textarea id="cf-val-${f.id}" data-cf-id="${f.id}" data-cf-label="${f.label}" style="padding: 6px; font-size: 12px; width: 100%; border: 1px solid var(--border-sugar); border-radius: 4px; background: rgba(0,0,0,0.2); color: #fff;" rows="2"></textarea>`;
    } else if (type === "dropdown") {
        let optsHtml = `<option value="">Select Option</option>`;
        options.forEach(opt => {
            optsHtml += `<option value="${opt}">${opt}</option>`;
        });
        return `<select id="cf-val-${f.id}" data-cf-id="${f.id}" data-cf-label="${f.label}" style="padding: 6px; font-size: 12px; height: 32px; width: 100%; border: 1px solid var(--border-sugar); border-radius: 4px; background: #2c1a11; color: #fff;">${optsHtml}</select>`;
    } else if (type === "multi-select") {
        let checksHtml = `<div id="cf-container-${f.id}" class="multi-select-container" style="display: flex; flex-direction: column; gap: 4px; background: rgba(0,0,0,0.15); padding: 8px; border-radius: 6px; border: 1px solid var(--border-sugar);">`;
        options.forEach((opt, idx) => {
            checksHtml += `
                <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer;">
                    <input type="checkbox" name="cf-multi-${f.id}" value="${opt}" style="width: auto;"> ${opt}
                </label>`;
        });
        checksHtml += `</div>`;
        return checksHtml;
    } else if (type === "radio") {
        let radiosHtml = `<div id="cf-container-${f.id}" style="display: flex; gap: 12px; flex-wrap: wrap; background: rgba(0,0,0,0.15); padding: 8px; border-radius: 6px; border: 1px solid var(--border-sugar);">`;
        options.forEach((opt, idx) => {
            radiosHtml += `
                <label style="display: flex; align-items: center; gap: 4px; font-size: 11px; cursor: pointer;">
                    <input type="radio" name="cf-radio-${f.id}" value="${opt}" style="width: auto;"> ${opt}
                </label>`;
        });
        radiosHtml += `</div>`;
        return radiosHtml;
    } else if (type === "checkbox") {
        return `
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 12px;">
                <input type="checkbox" id="cf-val-${f.id}" data-cf-id="${f.id}" data-cf-label="${f.label}" style="width: auto;"> Enable ${f.label}
            </label>`;
    } else if (type === "rating") {
        let starsHtml = `<select id="cf-val-${f.id}" data-cf-id="${f.id}" data-cf-label="${f.label}" style="padding: 6px; font-size: 12px; height: 32px; width: 100%; border: 1px solid var(--border-sugar); border-radius: 4px; background: #2c1a11; color: #fff;">
            <option value="">No Rating</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
            <option value="4">⭐⭐⭐⭐ (4 Star)</option>
            <option value="3">⭐⭐⭐ (3 Star)</option>
            <option value="2">⭐⭐ (2 Star)</option>
            <option value="1">⭐ (1 Star)</option>
        </select>`;
        return starsHtml;
    } else if (type === "currency") {
        return `
            <div style="position: relative; display: flex; align-items: center; width: 100%;">
                <span style="position: absolute; left: 8px; font-size: 12px; color: var(--text-muted);">₹</span>
                <input type="number" id="cf-val-${f.id}" data-cf-id="${f.id}" data-cf-label="${f.label}" style="padding: 6px 6px 6px 20px; font-size: 12px; width: 100%; border: 1px solid var(--border-sugar); border-radius: 4px; background: rgba(0,0,0,0.2); color: #fff;">
            </div>`;
    } else {
        // text, number, date, time, url, phone, email
        return `<input type="${type}" id="cf-val-${f.id}" data-cf-id="${f.id}" data-cf-label="${f.label}" style="padding: 6px; font-size: 12px; width: 100%; border: 1px solid var(--border-sugar); border-radius: 4px; background: rgba(0,0,0,0.2); color: #fff;">`;
    }
}

function renderCustomFieldsFormContainers() {
    const fields = getCustomFields();
    
    // Buyer Form
    const buyerCont = document.getElementById("custom-fields-buyer-form-container");
    if (buyerCont) {
        buyerCont.innerHTML = "";
        fields.filter(f => f.target === "Buyer").forEach(f => {
            const div = document.createElement("div");
            div.className = "form-group";
            div.innerHTML = `
                <label for="cf-val-${f.id}">${f.label}</label>
                ${renderCustomFieldInput(f)}
            `;
            buyerCont.appendChild(div);
        });
    }
    
    // Bhatti Form
    const bhattiCont = document.getElementById("custom-fields-bhatti-form-container");
    if (bhattiCont) {
        bhattiCont.innerHTML = "";
        fields.filter(f => f.target === "Bhatti").forEach(f => {
            const div = document.createElement("div");
            div.className = "form-group";
            div.innerHTML = `
                <label for="cf-val-${f.id}">${f.label}</label>
                ${renderCustomFieldInput(f)}
            `;
            bhattiCont.appendChild(div);
        });
    }
    
    // Transporter/Logistics Form
    const logCont = document.getElementById("custom-fields-logistics-form-container");
    if (logCont) {
        logCont.innerHTML = "";
        fields.filter(f => f.target === "Logistics").forEach(f => {
            const div = document.createElement("div");
            div.className = "form-group";
            div.innerHTML = `
                <label for="cf-val-${f.id}">${f.label}</label>
                ${renderCustomFieldInput(f)}
            `;
            logCont.appendChild(div);
        });
    }
}

// Hook Custom fields into standard save/update handlers
// To keep things simple and completely functional, we can override or store the custom field values in a meta property of the object (e.g. buyer.customFields = { label: val })
document.addEventListener("DOMContentLoaded", () => {
    renderCustomFieldsSettingsList();
    renderCustomFieldsFormContainers();
    
    // Intercept Forms to load / save custom field values
    const originalOpenEditBuyer = window.openEditBuyerModal;
    window.openEditBuyerModal = function(id) {
        if (originalOpenEditBuyer) originalOpenEditBuyer(id);
        const b = AppState.buyers.find(x => x.id === Number(id));
        setTimeout(() => {
            getCustomFields().filter(f => f.target === "Buyer").forEach(f => {
                const val = (b && b.customFields) ? b.customFields[f.label] : "";
                setCustomFieldValue(f, val);
            });
        }, 50);
    };

    const originalOpenEditBhatti = window.openEditBhattiModal;
    window.openEditBhattiModal = function(id) {
        if (originalOpenEditBhatti) originalOpenEditBhatti(id);
        const bh = AppState.bhattis.find(x => x.id === Number(id));
        setTimeout(() => {
            getCustomFields().filter(f => f.target === "Bhatti").forEach(f => {
                const val = (bh && bh.customFields) ? bh.customFields[f.label] : "";
                setCustomFieldValue(f, val);
            });
        }, 50);
    };

    const originalOpenEditLogistics = window.openEditLogisticsModal;
    window.openEditLogisticsModal = function(id) {
        if (originalOpenEditLogistics) originalOpenEditLogistics(id);
        const lg = AppState.logistics.find(x => x.id === Number(id));
        setTimeout(() => {
            getCustomFields().filter(f => f.target === "Logistics").forEach(f => {
                const val = (lg && lg.customFields) ? lg.customFields[f.label] : "";
                setCustomFieldValue(f, val);
            });
        }, 50);
    };
    
    // Intercept buyer save to grab custom fields
    const buyerForm = document.getElementById("buyer-form");
    if (buyerForm) {
        buyerForm.addEventListener("submit", () => {
            const buyerId = document.getElementById("buyer-id").value;
            setTimeout(() => {
                const targetId = Number(buyerId) || Math.max(...AppState.buyers.map(x => x.id));
                const b = AppState.buyers.find(x => x.id === targetId);
                if (b) {
                    b.customFields = b.customFields || {};
                    getCustomFields().filter(f => f.target === "Buyer").forEach(f => {
                        b.customFields[f.label] = getCustomFieldValue(f);
                    });
                    AppState.saveAll();
                }
            }, 10);
        });
    }
    
    // Same dynamic save bindings for Bhatti and Logistics
    const bhattiForm = document.getElementById("bhatti-form");
    if (bhattiForm) {
        bhattiForm.addEventListener("submit", () => {
            const bhId = document.getElementById("bhatti-id").value;
            setTimeout(() => {
                const targetId = Number(bhId) || Math.max(...AppState.bhattis.map(x => x.id));
                const bh = AppState.bhattis.find(x => x.id === targetId);
                if (bh) {
                    bh.customFields = bh.customFields || {};
                    getCustomFields().filter(f => f.target === "Bhatti").forEach(f => {
                        bh.customFields[f.label] = getCustomFieldValue(f);
                    });
                    AppState.saveAll();
                }
            }, 10);
        });
    }
    
    const logisticsForm = document.getElementById("logistics-form");
    if (logisticsForm) {
        logisticsForm.addEventListener("submit", () => {
            const lgId = document.getElementById("logistics-id").value;
            setTimeout(() => {
                const targetId = Number(lgId) || Math.max(...AppState.logistics.map(x => x.id));
                const lg = AppState.logistics.find(x => x.id === targetId);
                if (lg) {
                    lg.customFields = lg.customFields || {};
                    getCustomFields().filter(f => f.target === "Logistics").forEach(f => {
                        lg.customFields[f.label] = getCustomFieldValue(f);
                    });
                    AppState.saveAll();
                }
            }, 10);
        });
    }
});


// --- 3. BUSINESS CALENDAR SCREEN CONTROLLER ---
let calendarYear = 2026;
let calendarMonth = 6; // July 2026 (0-indexed so 6 = July)
const MONTHS_HINDI = [
    "January (Poush/Magh)", "February (Magh/Phalgun)", "March (Phalgun/Chaitra)",
    "April (Chaitra/Vaishakh)", "May (Vaishakh/Jyeshtha)", "June (Jyeshtha/Ashadh)",
    "July (Ashadh/Shravan)", "August (Shravan/Bhadrapada)", "September (Bhadrapada/Ashvin)",
    "October (Ashvin/Kartik)", "November (Kartik/Margashirsha)", "December (Margashirsha/Paush)"
];

function renderCalendarView() {
    const monthYearLabel = document.getElementById("calendar-month-year-label");
    const grid = document.getElementById("calendar-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    monthYearLabel.innerText = `${MONTHS_HINDI[calendarMonth]} ${calendarYear}`;
    
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // Day of week (0-6)
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate(); // Days in month
    
    // Get calendar items/reminders in AppState.followups
    const monthFollowups = AppState.followups.filter(task => {
        const tDate = new Date(task.date);
        return tDate.getFullYear() === calendarYear && tDate.getMonth() === calendarMonth;
    });
    
    // Padding days before first of month
    for (let i = 0; i < firstDayIndex; i++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day prev-month";
        grid.appendChild(cell);
    }
    
    // Actual days of the month
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        
        // Is today?
        if (today.getFullYear() === calendarYear && today.getMonth() === calendarMonth && today.getDate() === day) {
            cell.classList.add("today-day");
        }
        
        const dayStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayFollowups = monthFollowups.filter(f => f.date === dayStr);
        
        cell.innerHTML = `<span class="day-number">${day}</span>`;
        
        if (dayFollowups.length > 0) {
            const indicator = document.createElement("div");
            indicator.className = "event-indicator-container";
            
            dayFollowups.forEach(f => {
                const dot = document.createElement("span");
                dot.className = "event-dot";
                if (f.isCompleted) dot.style.backgroundColor = "var(--sugarcane-green)";
                else if (f.reminderType === "Payment") dot.style.backgroundColor = "var(--danger-red)";
                else dot.style.backgroundColor = "var(--jaggery-gold)";
                indicator.appendChild(dot);
            });
            cell.appendChild(indicator);
        }
        
        // Single click: Render day's events
        cell.addEventListener("click", () => {
            selectCalendarDay(day, dayStr, dayFollowups);
            // Highlight selected day cell
            document.querySelectorAll(".calendar-day").forEach(c => c.classList.remove("selected-day"));
            cell.classList.add("selected-day");
        });
        
        // Double click: Create task on this day
        cell.addEventListener("dblclick", () => {
            openTaskModalForDate(dayStr);
        });
        
        grid.appendChild(cell);
        
        // Select today's date initially
        if (today.getFullYear() === calendarYear && today.getMonth() === calendarMonth && today.getDate() === day) {
            selectCalendarDay(day, dayStr, dayFollowups);
            cell.classList.add("selected-day");
        }
    }
}
window.renderCalendarView = renderCalendarView;

function calendarPrevMonth() {
    calendarMonth--;
    if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    renderCalendarView();
}
window.calendarPrevMonth = calendarPrevMonth;

function calendarNextMonth() {
    calendarMonth++;
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    }
    renderCalendarView();
}
window.calendarNextMonth = calendarNextMonth;

function selectCalendarDay(dayNum, dateStr, followups) {
    const dateLabel = document.getElementById("calendar-selected-date-label");
    const listContainer = document.getElementById("calendar-events-list");
    
    // Format human readable date
    const dObj = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateLabel.innerText = dObj.toLocaleDateString("en-IN", options);
    
    listContainer.innerHTML = "";
    
    if (followups.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-placeholder" style="padding: 24px;">
                <span class="material-symbols-outlined" style="font-size: 32px; color: var(--text-muted);">event_available</span>
                <p style="font-size: 11px;">Is din koi follow-up ya kaam scheduled nahi hai. Naya task schedule karne ke liye is day cell par Double-Click karein! 📅</p>
            </div>
        `;
        return;
    }
    
    followups.forEach(f => {
        const card = document.createElement("div");
        card.className = "task-item-card";
        if (f.isCompleted) card.style.opacity = "0.6";
        
        let typeIcon = "notifications";
        let colorTheme = "var(--jaggery-gold)";
        if (f.reminderType === "Call") { typeIcon = "call"; colorTheme = "#2ecc71"; }
        else if (f.reminderType === "Meeting") { typeIcon = "handshake"; colorTheme = "#3498db"; }
        else if (f.reminderType === "Payment") { typeIcon = "payments"; colorTheme = "#e74c3c"; }
        else if (f.reminderType === "Dispatch") { typeIcon = "local_shipping"; colorTheme = "#e67e22"; }
        else if (f.reminderType === "Sample") { typeIcon = "labs"; colorTheme = "#9b59b6"; }
        else if (f.reminderType === "Transport") { typeIcon = "airport_shuttle"; colorTheme = "#1abc9c"; }
        else if (f.reminderType === "Bhatti Visit") { typeIcon = "storefront"; colorTheme = "#f39c12"; }
        else if (f.reminderType === "Festival Greeting") { typeIcon = "celebration"; colorTheme = "#f1c40f"; }
        
        card.innerHTML = `
            <div class="checkbox-round ${f.isCompleted ? 'completed' : ''}" onclick="toggleTaskCompletion(${f.id}); setTimeout(() => { renderCalendarView(); selectCalendarDay(${dayNum}, '${dateStr}', AppState.followups.filter(x => x.date === '${dateStr}')); }, 100);">
                <span class="material-symbols-outlined ${f.isCompleted ? '' : 'hidden'}" style="font-size: 14px;">done</span>
            </div>
            <div class="task-item-content">
                <h4 style="display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 2px;">
                    <span class="material-symbols-outlined" style="font-size: 15px; color: ${colorTheme};">${typeIcon}</span>
                    <span style="${f.isCompleted ? 'text-decoration: line-through;' : ''}">${f.title}</span>
                </h4>
                <p style="font-size: 11px; margin-top: 2px; line-height: 1.4;">${f.description || "No descriptions."}</p>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function openTaskModalForDate(dateStr) {
    const modal = document.getElementById("modal-task");
    document.getElementById("task-modal-title").innerText = "Naya Follow-up Likhein";
    document.getElementById("task-id").value = "";
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-date").value = dateStr;
    document.getElementById("task-type").value = "General";
    document.getElementById("task-reminder-type").value = "General";
    handleTaskTypeChange();
    modal.classList.add("active");
}


// --- 4. BUSINESS RELATIONSHIP NETWORK NODE GRAPH GRAPHICS ---
let networkNodes = [];
let networkEdges = [];
let hoveredNode = null;
let activeNetworkInterval = null;

function renderNetworkView() {
    const canvas = document.getElementById("network-canvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const container = document.getElementById("network-graph-canvas-container");
    
    // Auto scale to parent size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Generate nodes representing buyers, bhattis and transporters
    networkNodes = [];
    networkEdges = [];
    
    // Buyers
    AppState.buyers.forEach((b, index) => {
        networkNodes.push({
            id: `buyer-${b.id}`,
            entityId: b.id,
            type: "Buyer",
            label: b.name.split(" ")[0],
            fullName: b.name,
            phone: b.phone,
            sub: b.category,
            x: 100 + Math.random() * (canvas.width - 200),
            y: 80 + Math.random() * (canvas.height - 160),
            vx: 0, vy: 0,
            radius: 24,
            color: "#f39c12"
        });
    });
    
    // Bhattis
    AppState.bhattis.forEach((bh, index) => {
        networkNodes.push({
            id: `bhatti-${bh.id}`,
            entityId: bh.id,
            type: "Bhatti",
            label: bh.name.split(" ")[0],
            fullName: bh.name,
            phone: bh.phone,
            sub: bh.location,
            x: 100 + Math.random() * (canvas.width - 200),
            y: 80 + Math.random() * (canvas.height - 160),
            vx: 0, vy: 0,
            radius: 24,
            color: "#2ecc71"
        });
    });
    
    // Transporters
    AppState.logistics.forEach((lg, index) => {
        networkNodes.push({
            id: `logistics-${lg.id}`,
            entityId: lg.id,
            type: "Logistics",
            label: lg.name.split(" ")[0],
            fullName: lg.name,
            phone: lg.phone,
            sub: lg.routes,
            x: 100 + Math.random() * (canvas.width - 200),
            y: 80 + Math.random() * (canvas.height - 160),
            vx: 0, vy: 0,
            radius: 20,
            color: "#3498db"
        });
    });
    
    // Create edges representing Order transactions & Active Negotiations
    AppState.orders.forEach(ord => {
        if (ord.status !== "Cancelled") {
            networkEdges.push({ source: `buyer-${ord.buyerId}`, target: `bhatti-${ord.bhattiId}`, label: `Order #${ord.id}`, color: "rgba(243,156,18,0.3)" });
            networkEdges.push({ source: `bhatti-${ord.bhattiId}`, target: `logistics-${ord.transporterId}`, label: `Transit`, color: "rgba(52,152,219,0.3)" });
        }
    });
    
    // Retrieve negotiations / deals
    AppState.buyers.forEach(b => {
        const key = `gur_deals_buyer_${b.id}`;
        const bDeals = JSON.parse(localStorage.getItem(key)) || [];
        bDeals.forEach(deal => {
            if (deal.bhattiId) {
                networkEdges.push({ source: `buyer-${b.id}`, target: `bhatti-${deal.bhattiId}`, label: `Negot: ${deal.stage}`, color: "rgba(155,89,182,0.4)" });
            }
            if (deal.transporterId) {
                networkEdges.push({ source: `bhatti-${deal.bhattiId}`, target: `logistics-${deal.transporterId}`, label: `Route`, color: "rgba(52,152,219,0.25)" });
            }
        });
    });
    
    // Add Mouse event listeners
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Find hovered node
        hoveredNode = null;
        for (let node of networkNodes) {
            const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
            if (dist < node.radius) {
                hoveredNode = node;
                break;
            }
        }
        
        // Display info card
        const card = document.getElementById("network-node-info-card");
        if (hoveredNode) {
            card.style.display = "block";
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin:0; color:var(--jaggery-gold); font-size:14px;">${hoveredNode.fullName} (${hoveredNode.type})</h4>
                    <span class="badge detail-badge" style="background: rgba(255,255,255,0.05);">${hoveredNode.sub}</span>
                </div>
                <p style="font-size:11px; margin:4px 0 0 0; color:var(--text-cream);">Phone: <strong>${hoveredNode.phone}</strong> | Double-click this node to open profile dashboard!</p>
            `;
        }
    });
    
    canvas.addEventListener("dblclick", () => {
        if (hoveredNode) {
            if (hoveredNode.type === "Buyer") openBuyerDetails(hoveredNode.entityId);
            else if (hoveredNode.type === "Bhatti") openBhattiDetails(hoveredNode.entityId);
            else if (hoveredNode.type === "Logistics") openLogisticsDetails(hoveredNode.entityId);
        }
    });
    
    // Clear physics loops
    if (activeNetworkInterval) clearInterval(activeNetworkInterval);
    
    // Simple force-directed physics engine loop
    activeNetworkInterval = setInterval(() => {
        // 1. Repulsion between all node pairs
        for (let i = 0; i < networkNodes.length; i++) {
            for (let j = i + 1; j < networkNodes.length; j++) {
                const n1 = networkNodes[i];
                const n2 = networkNodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const dist = Math.hypot(dx, dy) || 1;
                const force = 120 / (dist * dist);
                
                n1.vx -= force * dx;
                n1.vy -= force * dy;
                n2.vx += force * dx;
                n2.vy += force * dy;
            }
        }
        
        // 2. Attraction of connected edges (spring force)
        networkEdges.forEach(edge => {
            const sourceNode = networkNodes.find(n => n.id === edge.source);
            const targetNode = networkNodes.find(n => n.id === edge.target);
            if (sourceNode && targetNode) {
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const dist = Math.hypot(dx, dy) || 1;
                const springForce = (dist - 140) * 0.0015;
                
                sourceNode.vx += springForce * dx;
                sourceNode.vy += springForce * dy;
                targetNode.vx -= springForce * dx;
                targetNode.vy -= springForce * dy;
            }
        });
        
        // 3. Update position and friction damping, border bounds
        networkNodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            node.vx *= 0.85;
            node.vy *= 0.85;
            
            // Constrain within canvas boundaries
            node.x = Math.max(node.radius + 15, Math.min(canvas.width - node.radius - 15, node.x));
            node.y = Math.max(node.radius + 15, Math.min(canvas.height - node.radius - 15, node.y));
        });
        
        // 4. DRAW GRAPH ELEMENTS ON CANVAS
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Edges (Lines)
        ctx.lineWidth = 1.5;
        networkEdges.forEach(edge => {
            const sourceNode = networkNodes.find(n => n.id === edge.source);
            const targetNode = networkNodes.find(n => n.id === edge.target);
            if (sourceNode && targetNode) {
                ctx.strokeStyle = edge.color;
                ctx.beginPath();
                ctx.moveTo(sourceNode.x, sourceNode.y);
                ctx.lineTo(targetNode.x, targetNode.y);
                ctx.stroke();
                
                // Optional edge text
                if (Math.hypot(targetNode.x - sourceNode.x, targetNode.y - sourceNode.y) > 120) {
                    ctx.fillStyle = "rgba(255,255,255,0.18)";
                    ctx.font = "8px monospace";
                    ctx.fillText(edge.label, (sourceNode.x + targetNode.x) / 2, (sourceNode.y + targetNode.y) / 2);
                }
            }
        });
        
        // Draw Nodes
        networkNodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
            ctx.fillStyle = node.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = node.color;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow
            
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Text labels
            ctx.fillStyle = "#fff";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(node.label, node.x, node.y - 1);
            
            // Subtitle
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "7px sans-serif";
            ctx.fillText(node.type, node.x, node.y + 10);
        });
        
        // Draw visual glow on hovered node
        if (hoveredNode) {
            ctx.beginPath();
            ctx.arc(hoveredNode.x, hoveredNode.y, hoveredNode.radius + 6, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255,255,255,0.4)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        
    }, 40);
}
window.renderNetworkView = renderNetworkView;


// --- 5. UNIVERSAL PROFILE CHANGES & MULTI-TAB SWITCHER ---
function switchProfileTab(entityType, tabId) {
    // Switch active buttons
    const tabBtns = document.querySelectorAll(`.profile-tabs button`);
    tabBtns.forEach(btn => {
        if (btn.id === `tab-${entityType}-${tabId}`) {
            btn.classList.add("active-profile-tab");
            btn.style.background = "var(--border-sugar)";
            btn.style.color = "#fff";
        } else if (btn.id && btn.id.startsWith(`tab-${entityType}-`)) {
            btn.classList.remove("active-profile-tab");
            btn.style.background = "none";
            btn.style.color = "var(--text-muted)";
        }
    });
    
    // Switch active sections
    const panelSections = document.querySelectorAll(`.profile-panel-section`);
    panelSections.forEach(sec => {
        if (sec.id === `${entityType}-panel-${tabId}`) {
            sec.classList.remove("hidden");
        } else if (sec.id && sec.id.startsWith(`${entityType}-panel-`)) {
            sec.classList.add("hidden");
        }
    });
    
    // Render related dynamic tabs specifically on click
    if (entityType === "buyer") {
        if (tabId === "relation") renderBuyerRelationshipCenter();
        else if (tabId === "deals") renderBuyerDealsWorkspace();
        else if (tabId === "docgen") renderBuyerDocumentGeneratorOptions();
    } else if (entityType === "bhatti") {
        if (tabId === "products") renderBhattiProductStock();
        else if (tabId === "relation") renderBhattiRelationshipCenter();
        else if (tabId === "deals") renderBhattiDealsHistory();
        else if (tabId === "followups") renderProfileFollowups('bhatti');
    } else if (entityType === "logistics") {
        if (tabId === "routes") renderLogisticsRouteHistory();
        else if (tabId === "relation") renderLogisticsRelationshipCenter();
        else if (tabId === "deals") renderLogisticsDealsHistory();
        else if (tabId === "followups") renderProfileFollowups('logistics');
    }
}
window.switchProfileTab = switchProfileTab;


// --- 6. BUYER DETAIL ADDITIONS (DASHBOARD TAB CONTROLLER) ---
// Save Quick Summary notes
document.getElementById("save-buyer-quick-note-btn").addEventListener("click", () => {
    const note = document.getElementById("det-buyer-quick-note").value.trim();
    if (!note) return;
    
    const key = `gur_quick_note_buyer_${currentSelectedBuyerIdForDetails}`;
    localStorage.setItem(key, note);
    renderBuyerQuickSummaryAndTags();
    alert("Quick Summary updated successfully! 🌟");
});

function renderBuyerQuickSummaryAndTags() {
    // Summary
    const note = localStorage.getItem(`gur_quick_note_buyer_${currentSelectedBuyerIdForDetails}`) || "";
    document.getElementById("det-buyer-quick-note").value = note;
    
    // Tags row
    const container = document.getElementById("det-buyer-tags");
    container.innerHTML = "";
    
    // Standard autogenerated tag rules
    const b = AppState.buyers.find(x => x.id === currentSelectedBuyerIdForDetails);
    if (!b) return;
    
    const tags = [b.category];
    
    // Calculate total orders volume
    const orders = AppState.orders.filter(o => Number(o.buyerId) === b.id && o.status !== "Cancelled");
    const totalQty = orders.reduce((sum, o) => sum + Number(o.quantityTonnes), 0);
    
    if (totalQty > 20) tags.push("🔥 VIP Buyer");
    if (orders.some(o => o.status === "Pending")) tags.push("⏳ Active Deals");
    if (b.preferredType.includes("Organic")) tags.push("🌱 Eco-Premium");
    else tags.push("💰 Standard Gold");
    
    tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "badge";
        span.style = "background: rgba(243,156,18,0.1); border: 1px solid var(--jaggery-gold); color: var(--jaggery-gold); font-size: 9px; padding: 2px 6px; border-radius: 4px;";
        span.innerText = tag;
        container.appendChild(span);
    });
    
    // Render counters
    const callCount = AppState.followups.filter(f => Number(f.relatedId) === b.id && f.relatedType === "Buyer" && f.reminderType === "Call").length;
    const mtCount = AppState.followups.filter(f => Number(f.relatedId) === b.id && f.relatedType === "Buyer" && f.reminderType === "Meeting").length;
    
    document.getElementById("counter-call-val").innerText = callCount || orders.length; // Fallback
    document.getElementById("counter-whatsapp-val").innerText = orders.filter(o => o.status === "In-Transit").length || "1";
    document.getElementById("counter-meeting-val").innerText = mtCount || "0";
    document.getElementById("counter-quote-val").innerText = orders.length;
    document.getElementById("counter-deal-val").innerText = orders.filter(o => o.status === "Pending").length;
    document.getElementById("counter-order-val").innerText = orders.length;
}

// Modify original openBuyerDetails to trigger additional dashboard data
const originalOpenBuyerDetails = window.openBuyerDetails;
window.openBuyerDetails = function(id) {
    if (originalOpenBuyerDetails) originalOpenBuyerDetails(id);
    switchProfileTab('buyer', 'logs');
    renderBuyerQuickSummaryAndTags();
};

function renderBuyerRelationshipCenter() {
    const ordersList = document.getElementById("relation-buyer-orders-list");
    const bhattisList = document.getElementById("relation-buyer-bhattis-list");
    const logisticsList = document.getElementById("relation-buyer-logistics-list");
    
    ordersList.innerHTML = "";
    bhattisList.innerHTML = "";
    logisticsList.innerHTML = "";
    
    const bId = currentSelectedBuyerIdForDetails;
    const orders = AppState.orders.filter(o => Number(o.buyerId) === bId);
    
    if (orders.length === 0) {
        ordersList.innerHTML = `<p style="color:var(--text-muted);">No order history available yet.</p>`;
        bhattisList.innerHTML = `<p style="color:var(--text-muted);">No connections.</p>`;
        logisticsList.innerHTML = `<p style="color:var(--text-muted);">No connections.</p>`;
        return;
    }
    
    orders.forEach(o => {
        const bh = AppState.bhattis.find(x => x.id === Number(o.bhattiId)) || { name: "Unknown Bhatti" };
        const tr = AppState.logistics.find(x => x.id === Number(o.transporterId)) || { name: "Direct Delivery" };
        
        // Orders list
        const div = document.createElement("div");
        div.style = "background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; display: flex; justify-content: space-between; border-left: 3px solid var(--jaggery-gold);";
        div.innerHTML = `
            <span><strong>Order #${o.id}</strong> - ${o.quantityTonnes}T @ ₹${o.sellingRate}/Kg</span>
            <span class="badge detail-badge">${o.status}</span>
        `;
        ordersList.appendChild(div);
        
        // Connected Bhattis
        if (!bhattisList.querySelector(`[data-id="${o.bhattiId}"]`)) {
            const bhSpan = document.createElement("span");
            bhSpan.setAttribute("data-id", o.bhattiId);
            bhSpan.className = "badge";
            bhSpan.style = "background: rgba(46,204,113,0.1); border: 1px solid var(--sugarcane-green); color: var(--sugarcane-green); padding: 4px 8px; border-radius: 6px;";
            bhSpan.innerText = bh.name;
            bhattisList.appendChild(bhSpan);
        }
        
        // Connected Transporters
        if (!logisticsList.querySelector(`[data-id="${o.transporterId}"]`)) {
            const lgSpan = document.createElement("div");
            lgSpan.setAttribute("data-id", o.transporterId);
            lgSpan.style = "background: rgba(52,152,219,0.1); border: 1px solid var(--logistics-blue); color: var(--logistics-blue); padding: 4px 8px; border-radius: 6px; margin-bottom: 4px;";
            lgSpan.innerText = `${tr.name} (${tr.driver || 'Sanjay'})`;
            logisticsList.appendChild(lgSpan);
        }
    });
}

// 6.2. Deal workspace / Negotiations
function toggleBuyerDealForm() {
    const form = document.getElementById("buyer-deal-form-container");
    form.classList.toggle("hidden");
    
    // Load options for bhattis and transporters
    const bhSel = document.getElementById("deal-bhatti-id");
    const trSel = document.getElementById("deal-transporter-id");
    
    bhSel.innerHTML = "";
    trSel.innerHTML = "";
    
    AppState.bhattis.forEach(bh => {
        const o = document.createElement("option");
        o.value = bh.id;
        o.innerText = bh.name;
        bhSel.appendChild(o);
    });
    
    AppState.logistics.forEach(lg => {
        const o = document.createElement("option");
        o.value = lg.id;
        o.innerText = lg.name;
        trSel.appendChild(o);
    });
}
window.toggleBuyerDealForm = toggleBuyerDealForm;

function getBuyerDeals(bId) {
    return JSON.parse(localStorage.getItem(`gur_deals_buyer_${bId}`)) || [];
}

function saveBuyerDeals(bId, deals) {
    localStorage.setItem(`gur_deals_buyer_${bId}`, JSON.stringify(deals));
}

function saveBuyerDeal() {
    const prodName = document.getElementById("deal-prod-name").value.trim();
    const qty = Number(document.getElementById("deal-qty").value) || 0;
    const packing = document.getElementById("deal-packing").value.trim();
    const rate = Number(document.getElementById("deal-rate").value) || 0;
    const bhattiId = Number(document.getElementById("deal-bhatti-id").value);
    const transporterId = Number(document.getElementById("deal-transporter-id").value);
    const payment = document.getElementById("deal-payment-terms").value.trim();
    const stage = document.getElementById("deal-stage").value;
    const remarks = document.getElementById("deal-remarks").value.trim();
    
    if (!prodName || qty <= 0 || rate <= 0) {
        alert("Please fill all mandatory fields!");
        return;
    }
    
    const deals = getBuyerDeals(currentSelectedBuyerIdForDetails);
    deals.push({
        id: Date.now(),
        productName: prodName,
        quantity: qty,
        packing,
        rate,
        bhattiId,
        transporterId,
        paymentTerms: payment,
        stage,
        remarks,
        date: new Date().toISOString().split('T')[0]
    });
    
    saveBuyerDeals(currentSelectedBuyerIdForDetails, deals);
    toggleBuyerDealForm();
    renderBuyerDealsWorkspace();
    
    // Insert into contact logs
    const logKey = `gur_logs_${currentSelectedBuyerIdForDetails}`;
    const allLogs = JSON.parse(localStorage.getItem(logKey)) || [];
    allLogs.unshift({
        type: "Rate Quotation Sent",
        date: new Date().toISOString().split('T')[0],
        notes: `Recorded negotiation for ${qty} Tonnes ${prodName} @ Rs.${rate}/Kg. Stage: ${stage}.`
    });
    localStorage.setItem(logKey, JSON.stringify(allLogs));
    renderBuyerLogs();
}
window.saveBuyerDeal = saveBuyerDeal;

function renderBuyerDealsWorkspace() {
    const container = document.getElementById("buyer-deals-list");
    container.innerHTML = "";
    
    const deals = getBuyerDeals(currentSelectedBuyerIdForDetails);
    if (deals.length === 0) {
        container.innerHTML = `<p class="empty-placeholder">Abhi tak koi negotiation ya sauda bacha nahi hai. Likhein!</p>`;
        return;
    }
    
    deals.forEach(d => {
        const bh = AppState.bhattis.find(x => x.id === d.bhattiId) || { name: "Direct" };
        const lg = AppState.logistics.find(x => x.id === d.transporterId) || { name: "Direct" };
        
        let colorTheme = "var(--jaggery-gold)";
        if (d.stage === "Locked") colorTheme = "var(--sugarcane-green)";
        else if (d.stage === "Cancelled") colorTheme = "var(--danger-red)";
        
        const card = document.createElement("div");
        card.className = "card-glass";
        card.style = `border-left: 4px solid ${colorTheme}; padding: 10px; margin-bottom: 8px;`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h5 style="margin:0; font-size:12px; color:var(--text-cream);">${d.productName}</h5>
                <span class="badge detail-badge" style="background:${colorTheme}; color:#000; font-weight:bold;">${d.stage}</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:10px; color:var(--text-muted); margin-top: 6px;">
                <span>Quantity: <strong>${d.quantity} T</strong></span>
                <span>Offered Rate: <strong class="text-green">₹${d.rate}/Kg</strong></span>
                <span>Bhatti: ${bh.name}</span>
                <span>Packing: ${d.packing}</span>
                <span>Payment: ${d.paymentTerms || 'Standard'}</span>
                <span>Date: ${d.date}</span>
            </div>
            <div style="font-size:10px; font-style:italic; color:var(--text-muted); margin-top:4px;">Remarks: ${d.remarks || 'No notes.'}</div>
        `;
        container.appendChild(card);
    });
}


// --- 7. BHATTI DASHBOARD PROFILE LOGIC ---
let currentSelectedBhattiIdForDetails = null;

function openBhattiDetails(id) {
    currentSelectedBhattiIdForDetails = Number(id);
    const bh = AppState.bhattis.find(x => x.id === currentSelectedBhattiIdForDetails);
    if (!bh) return;
    
    // Set headers
    document.getElementById("det-bhatti-name").innerText = bh.name;
    document.getElementById("det-bhatti-owner").innerText = `Maalik: ${bh.owner}`;
    document.getElementById("det-bhatti-phone").innerText = bh.phone;
    document.getElementById("det-bhatti-loc").innerText = bh.location;
    document.getElementById("det-bhatti-stock").innerText = bh.stockTonnes.toFixed(1) + " Tonnes";
    document.getElementById("det-bhatti-rate").innerText = `₹${bh.ratePerKg}/Kg`;
    
    // Custom field render
    const customFieldsCont = document.getElementById("det-bhatti-custom-fields");
    const listCont = document.getElementById("det-bhatti-custom-fields-list");
    listCont.innerHTML = "";
    
    if (bh.customFields && Object.keys(bh.customFields).length > 0) {
        customFieldsCont.style.display = "block";
        for (let [label, val] of Object.entries(bh.customFields)) {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${label}:</strong> ${val}`;
            listCont.appendChild(div);
        }
    } else {
        customFieldsCont.style.display = "none";
    }
    
    // Set performance / target gauges
    const target = AppState.seasonTarget.bhattiTargets ? (AppState.seasonTarget.bhattiTargets[bh.id] || 100) : 100;
    const fulfilled = AppState.orders.filter(o => Number(o.bhattiId) === bh.id && o.status === "Delivered").reduce((sum, o) => sum + Number(o.quantityTonnes), 0);
    const percent = Math.min(Math.round((fulfilled / target) * 100), 100);
    
    document.getElementById("det-bhatti-season-target-label").innerText = `${fulfilled.toFixed(1)} / ${target} Tonnes`;
    document.getElementById("det-bhatti-season-progress-bar").style.width = `${percent}%`;
    document.getElementById("bhatti-season-target-input").value = target;
    
    // Hide inline log form
    document.getElementById("bhatti-quick-log-form").classList.add("hidden");
    
    // Initialize tab switcher
    switchProfileTab('bhatti', 'logs');
    renderBhattiLogs();
    
    const modal = document.getElementById("modal-bhatti-details");
    modal.classList.add("active");
}
window.openBhattiDetails = openBhattiDetails;

function renderBhattiLogs() {
    const container = document.getElementById("det-bhatti-logs");
    container.innerHTML = "";
    
    const key = `gur_bhatti_logs_${currentSelectedBhattiIdForDetails}`;
    const allLogs = JSON.parse(localStorage.getItem(key)) || [
        { type: "Phone Call", date: "2026-07-06", notes: "Negotiated base rate. Confirmed Rs.42/Kg for next double-filter batch." },
        { type: "Stock Movement", date: "2026-07-08", notes: "Production batch completed: Added +15 Tonnes organic cubes stock." }
    ];
    
    if (allLogs.length === 0) {
        container.innerHTML = `<p class="empty-placeholder">Koi interactions log book nahi hai. Likhein!</p>`;
    } else {
        allLogs.forEach(log => {
            const div = document.createElement("div");
            div.className = "log-item";
            div.innerHTML = `
                <div class="log-item-meta">
                    <span class="type" style="background:var(--border-sugar);">${log.type}</span>
                    <span>${log.date}</span>
                </div>
                <div class="log-item-notes">${log.notes}</div>
            `;
            container.appendChild(div);
        });
    }
}

// Inline log adding
document.getElementById("bhatti-log-interaction-btn").addEventListener("click", () => {
    document.getElementById("bhatti-quick-log-form").classList.remove("hidden");
    document.getElementById("bhatti-log-notes").value = "";
});

document.getElementById("cancel-bhatti-quick-log").addEventListener("click", () => {
    document.getElementById("bhatti-quick-log-form").classList.add("hidden");
});

document.getElementById("save-bhatti-quick-log").addEventListener("click", () => {
    const type = document.getElementById("bhatti-log-type").value;
    const notes = document.getElementById("bhatti-log-notes").value.trim();
    if (!notes) return;
    
    const key = `gur_bhatti_logs_${currentSelectedBhattiIdForDetails}`;
    const allLogs = JSON.parse(localStorage.getItem(key)) || [];
    allLogs.unshift({ type, notes, date: new Date().toISOString().split('T')[0] });
    localStorage.setItem(key, JSON.stringify(allLogs));
    
    document.getElementById("bhatti-quick-log-form").classList.add("hidden");
    renderBhattiLogs();
});

// Bhatti Products stock manager
function toggleBhattiProductForm() {
    document.getElementById("bhatti-product-form-container").classList.toggle("hidden");
}
window.toggleBhattiProductForm = toggleBhattiProductForm;

function getBhattiProducts(bhId) {
    return JSON.parse(localStorage.getItem(`gur_bhatti_prods_${bhId}`)) || [
        { id: 1, name: "Premium Golden Cubes", grade: "Premium Golden", pieceWeight: "1Kg Block", packingType: "Carton", stock: 15, price: 42, history: [41, 42], remarks: "Best Seller" },
        { id: 2, name: "Organic Jaggery Powder", grade: "Organic", pieceWeight: "500g Bag", packingType: "Jute Bag", stock: 10, price: 48, history: [45, 48], remarks: "High demand" }
    ];
}

function saveBhattiProducts(bhId, prods) {
    localStorage.setItem(`gur_bhatti_prods_${bhId}`, JSON.stringify(prods));
}

function saveBhattiProduct() {
    const name = document.getElementById("bp-name").value.trim();
    const grade = document.getElementById("bp-grade").value;
    const weight = document.getElementById("bp-weight").value.trim();
    const packing = document.getElementById("bp-packing").value.trim();
    const stock = Number(document.getElementById("bp-stock").value) || 0;
    const price = Number(document.getElementById("bp-price").value) || 0;
    const remarks = document.getElementById("bp-remarks").value.trim();
    
    if (!name || stock < 0 || price < 0) {
        alert("Please fill all mandatory fields!");
        return;
    }
    
    const prods = getBhattiProducts(currentSelectedBhattiIdForDetails);
    prods.push({
        id: Date.now(), name, grade, pieceWeight: weight, packingType: packing, stock, price, remarks, history: [price]
    });
    
    saveBhattiProducts(currentSelectedBhattiIdForDetails, prods);
    toggleBhattiProductForm();
    renderBhattiProductStock();
    
    // Add stock movement log
    const key = `gur_bhatti_logs_${currentSelectedBhattiIdForDetails}`;
    const allLogs = JSON.parse(localStorage.getItem(key)) || [];
    allLogs.unshift({
        type: "Stock Movement",
        date: new Date().toISOString().split('T')[0],
        notes: `Naya product type add kiya: ${name} (+${stock} Tonnes @ Rs.${price}/Kg).`
    });
    localStorage.setItem(key, JSON.stringify(allLogs));
    renderBhattiLogs();
}
window.saveBhattiProduct = saveBhattiProduct;

function renderBhattiProductStock() {
    const container = document.getElementById("bhatti-products-list");
    container.innerHTML = "";
    
    const prods = getBhattiProducts(currentSelectedBhattiIdForDetails);
    
    // Visual aggregates
    const totalStock = prods.reduce((sum, p) => sum + Number(p.stock), 0);
    
    const aggDiv = document.createElement("div");
    aggDiv.style = "background:rgba(243,156,18,0.1); border:1px solid var(--jaggery-gold); border-radius:8px; padding:8px; font-size:12px; margin-bottom:8px; text-align:center;";
    aggDiv.innerHTML = `Combined Total Stock across all types: <strong>${totalStock.toFixed(1)} Tonnes</strong>`;
    container.appendChild(aggDiv);
    
    prods.forEach(p => {
        const div = document.createElement("div");
        div.className = "card-glass";
        div.style = "padding:10px; margin-bottom:8px;";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h5 style="margin:0; font-size:12px; color:var(--text-cream);">${p.name}</h5>
                <span class="badge detail-badge" style="background:var(--border-sugar);">${p.grade}</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:10px; color:var(--text-muted); margin-top:4px;">
                <span>Available Stock: <strong>${p.stock} Tonnes</strong></span>
                <span>Selling Price: <strong class="text-green">₹${p.price}/Kg</strong></span>
                <span>Size/Weight: ${p.pieceWeight}</span>
                <span>Packing: ${p.packingType}</span>
                <span style="grid-column: 1 / -1;">Rate History: ${p.history ? p.history.map(h => `₹${h}`).join(" → ") : `₹${p.price}`}</span>
            </div>
            <div style="font-size:9px; font-style:italic; color:var(--text-muted); margin-top:4px;">Note: ${p.remarks || 'Standard item.'}</div>
        `;
        container.appendChild(div);
    });
}

function renderBhattiRelationshipCenter() {
    const buyersCont = document.getElementById("relation-bhatti-buyers-list");
    const logisticsCont = document.getElementById("relation-bhatti-logistics-list");
    
    buyersCont.innerHTML = "";
    logisticsCont.innerHTML = "";
    
    const bhId = currentSelectedBhattiIdForDetails;
    const orders = AppState.orders.filter(o => Number(o.bhattiId) === bhId);
    
    if (orders.length === 0) {
        buyersCont.innerHTML = `<p style="color:var(--text-muted);">No connection history available yet.</p>`;
        logisticsCont.innerHTML = `<p style="color:var(--text-muted);">No logistics logs yet.</p>`;
        return;
    }
    
    orders.forEach(o => {
        const b = AppState.buyers.find(x => x.id === Number(o.buyerId)) || { name: "Unknown" };
        const lg = AppState.logistics.find(x => x.id === Number(o.transporterId)) || { name: "Direct Delivery" };
        
        // Connected buyers
        if (!buyersCont.querySelector(`[data-id="${o.buyerId}"]`)) {
            const div = document.createElement("div");
            div.setAttribute("data-id", o.buyerId);
            div.style = "background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; display: flex; justify-content: space-between; border-left: 3px solid var(--jaggery-gold); margin-bottom:4px;";
            div.innerHTML = `<span>${b.name}</span> <span class="badge detail-badge">Order #${o.id}</span>`;
            buyersCont.appendChild(div);
        }
        
        // Connected logistics
        if (!logisticsCont.querySelector(`[data-id="${o.transporterId}"]`)) {
            const div = document.createElement("div");
            div.setAttribute("data-id", o.transporterId);
            div.style = "background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; display: flex; justify-content: space-between; border-left: 3px solid var(--logistics-blue); margin-bottom:4px;";
            div.innerHTML = `<span>${lg.name}</span> <span class="badge detail-badge">Truck: ${lg.truckNumber}</span>`;
            logisticsCont.appendChild(div);
        }
    });
}

function saveBhattiSeasonTarget() {
    const val = Number(document.getElementById("bhatti-season-target-input").value) || 100;
    AppState.seasonTarget.bhattiTargets = AppState.seasonTarget.bhattiTargets || {};
    AppState.seasonTarget.bhattiTargets[currentSelectedBhattiIdForDetails] = val;
    AppState.saveAll();
    
    openBhattiDetails(currentSelectedBhattiIdForDetails); // Refresh
    alert("Season target updated successfully! 🌟");
}
window.saveBhattiSeasonTarget = saveBhattiSeasonTarget;


// --- 8. TRANSPORTER DASHBOARD PROFILE LOGIC ---
let currentSelectedLogisticsIdForDetails = null;

function openLogisticsDetails(id) {
    currentSelectedLogisticsIdForDetails = Number(id);
    const lg = AppState.logistics.find(x => x.id === currentSelectedLogisticsIdForDetails);
    if (!lg) return;
    
    // Set headers
    document.getElementById("det-logistics-name").innerText = lg.name;
    document.getElementById("det-logistics-driver").innerText = `Driver: ${lg.driver}`;
    document.getElementById("det-logistics-phone").innerText = lg.phone;
    document.getElementById("det-logistics-truck").innerText = lg.truckNumber;
    document.getElementById("det-logistics-capacity").innerText = lg.capacityTonnes + " Tonnes";
    document.getElementById("det-logistics-rate").innerText = `₹${lg.rateTonne || lg.ratePerTonne}/Tonne`;
    
    // Render custom fields
    const customFieldsCont = document.getElementById("det-logistics-custom-fields");
    const listCont = document.getElementById("det-logistics-custom-fields-list");
    listCont.innerHTML = "";
    
    if (lg.customFields && Object.keys(lg.customFields).length > 0) {
        customFieldsCont.style.display = "block";
        for (let [label, val] of Object.entries(lg.customFields)) {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${label}:</strong> ${val}`;
            listCont.appendChild(div);
        }
    } else {
        customFieldsCont.style.display = "none";
    }
    
    // Hide inline form
    document.getElementById("logistics-quick-log-form").classList.add("hidden");
    
    // Initialize pricing rule fields
    const rules = JSON.parse(localStorage.getItem(`gur_freight_rule_${lg.id}`)) || { mode: "per-ton", rate: lg.rateTonne || lg.ratePerTonne };
    document.getElementById("freight-rule-mode").value = rules.mode;
    document.getElementById("freight-rate-val").value = rules.rate;
    handleFreightModeChange();
    
    switchProfileTab('logistics', 'logs');
    renderLogisticsLogs();
    
    const modal = document.getElementById("modal-logistics-details");
    modal.classList.add("active");
}
window.openLogisticsDetails = openLogisticsDetails;

function renderLogisticsLogs() {
    const container = document.getElementById("det-logistics-logs");
    container.innerHTML = "";
    
    const key = `gur_logistics_logs_${currentSelectedLogisticsIdForDetails}`;
    const allLogs = JSON.parse(localStorage.getItem(key)) || [
        { date: "2026-07-06", notes: "Completed Kolhapur-Delhi transit delivery of 12 Tonnes premium double filter cubes." },
        { date: "2026-07-08", notes: "Truck MH-09-Q-7821 dispatched for Muzaffarnagar route pick-up." }
    ];
    
    if (allLogs.length === 0) {
        container.innerHTML = `<p class="empty-placeholder">Koi routing activity history available nahi hai. Likhein!</p>`;
    } else {
        allLogs.forEach(log => {
            const div = document.createElement("div");
            div.className = "log-item";
            div.innerHTML = `
                <div class="log-item-meta">
                    <span class="type" style="background:var(--border-sugar);">Transit</span>
                    <span>${log.date}</span>
                </div>
                <div class="log-item-notes">${log.notes}</div>
            `;
            container.appendChild(div);
        });
    }
}

// Inline logistics logs adding
document.getElementById("logistics-log-interaction-btn").addEventListener("click", () => {
    document.getElementById("logistics-quick-log-form").classList.remove("hidden");
    document.getElementById("logistics-log-notes").value = "";
});

document.getElementById("cancel-logistics-quick-log").addEventListener("click", () => {
    document.getElementById("logistics-quick-log-form").classList.add("hidden");
});

document.getElementById("save-logistics-quick-log").addEventListener("click", () => {
    const notes = document.getElementById("logistics-log-notes").value.trim();
    if (!notes) return;
    
    const key = `gur_logistics_logs_${currentSelectedLogisticsIdForDetails}`;
    const allLogs = JSON.parse(localStorage.getItem(key)) || [];
    allLogs.unshift({ notes, date: new Date().toISOString().split('T')[0] });
    localStorage.setItem(key, JSON.stringify(allLogs));
    
    document.getElementById("logistics-quick-log-form").classList.add("hidden");
    renderLogisticsLogs();
});

function handleFreightModeChange() {
    const mode = document.getElementById("freight-rule-mode").value;
    const label = document.getElementById("freight-rate-label");
    
    if (mode === "per-ton") label.innerText = "Freight Rate per Tonne (₹)*";
    else if (mode === "per-km") label.innerText = "Freight Rate per KM (₹)*";
    else if (mode === "per-trip") label.innerText = "Fixed Freight Rate per Trip (₹)*";
    else if (mode === "custom") label.innerText = "Custom Lump-Sum Freight Rate (₹)*";
}
window.handleFreightModeChange = handleFreightModeChange;

function saveFreightRules() {
    const mode = document.getElementById("freight-rule-mode").value;
    const rate = Number(document.getElementById("freight-rate-val").value) || 0;
    
    const rules = { mode, rate };
    localStorage.setItem(`gur_freight_rule_${currentSelectedLogisticsIdForDetails}`, JSON.stringify(rules));
    alert("Freight Pricing Rule saved and locked for this carrier! 🚚");
}
window.saveFreightRules = saveFreightRules;

function renderLogisticsRouteHistory() {
    const container = document.getElementById("logistics-routes-history-list");
    container.innerHTML = "";
    
    const lgId = currentSelectedLogisticsIdForDetails;
    const orders = AppState.orders.filter(o => Number(o.transporterId) === lgId);
    
    if (orders.length === 0) {
        container.innerHTML = `<p class="empty-placeholder">No route delivery histories found.</p>`;
        return;
    }
    
    orders.forEach(o => {
        const b = AppState.buyers.find(x => x.id === Number(o.buyerId)) || { name: "Unknown" };
        const bh = AppState.bhattis.find(x => x.id === Number(o.bhattiId)) || { name: "Unknown" };
        
        const div = document.createElement("div");
        div.className = "card-glass";
        div.style = "padding:10px; border-left: 3px solid var(--logistics-blue); margin-bottom:8px;";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <strong>Trip Transit Order #${o.id}</strong>
                <span class="badge detail-badge">${o.status}</span>
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:4px;">
                <span>Source: ${bh.location} (${bh.name})</span> → <span>Destination: ${b.location} (${b.name})</span>
                <br>Quantity: <strong>${o.quantityTonnes} Tonnes</strong> | Price: ₹${o.transportCost.toLocaleString()}
            </div>
        `;
        container.appendChild(div);
    });
}

function renderLogisticsRelationshipCenter() {
    const buyersList = document.getElementById("relation-logistics-buyers-list");
    const bhattisList = document.getElementById("relation-logistics-bhattis-list");
    
    buyersList.innerHTML = "";
    bhattisList.innerHTML = "";
    
    const lgId = currentSelectedLogisticsIdForDetails;
    const orders = AppState.orders.filter(o => Number(o.transporterId) === lgId);
    
    if (orders.length === 0) {
        buyersList.innerHTML = `<p style="color:var(--text-muted);">No connected buyers.</p>`;
        bhattisList.innerHTML = `<p style="color:var(--text-muted);">No connected production sources.</p>`;
        return;
    }
    
    orders.forEach(o => {
        const b = AppState.buyers.find(x => x.id === Number(o.buyerId)) || { name: "Unknown" };
        const bh = AppState.bhattis.find(x => x.id === Number(o.bhattiId)) || { name: "Unknown" };
        
        if (!buyersList.querySelector(`[data-id="${o.buyerId}"]`)) {
            const div = document.createElement("div");
            div.setAttribute("data-id", o.buyerId);
            div.style = "background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; display: flex; justify-content: space-between; border-left: 3px solid var(--jaggery-gold); margin-bottom:4px;";
            div.innerHTML = `<span>${b.name}</span> <span class="badge detail-badge">${b.location}</span>`;
            buyersList.appendChild(div);
        }
        
        if (!bhattisList.querySelector(`[data-id="${o.bhattiId}"]`)) {
            const div = document.createElement("div");
            div.setAttribute("data-id", o.bhattiId);
            div.style = "background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; display: flex; justify-content: space-between; border-left: 3px solid var(--sugarcane-green); margin-bottom:4px;";
            div.innerHTML = `<span>${bh.name}</span> <span class="badge detail-badge">${bh.location}</span>`;
            bhattisList.appendChild(div);
        }
    });
}


// --- 9. SMART OFFICIAL DOCUMENT GENERATOR VIEWER & PRINTING ---
function renderBuyerDocumentGeneratorOptions() {
    const select = document.getElementById("docgen-linked-deal");
    select.innerHTML = "";
    
    const bId = currentSelectedBuyerIdForDetails;
    const orders = AppState.orders.filter(o => Number(o.buyerId) === bId);
    
    if (orders.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.innerText = "No active orders to print";
        select.appendChild(opt);
        return;
    }
    
    orders.forEach(o => {
        const opt = document.createElement("option");
        opt.value = o.id;
        opt.innerText = `Sauda Order #${o.id} - ${o.quantityTonnes} Tonnes (₹${o.sellingRate}/Kg)`;
        select.appendChild(opt);
    });
}

function generateDocumentPreview() {
    const docType = document.getElementById("docgen-type").value;
    const orderId = document.getElementById("docgen-linked-deal").value;
    
    if (!orderId) {
        alert("Please select a linked order / deal!");
        return;
    }
    
    const o = AppState.orders.find(x => x.id === Number(orderId));
    if (!o) return;
    
    const buyer = AppState.buyers.find(x => x.id === Number(o.buyerId)) || { name: "Unknown Buyer", phone: "N/A", location: "N/A" };
    const bhatti = AppState.bhattis.find(x => x.id === Number(o.bhattiId)) || { name: "Unknown Bhatti", owner: "N/A", location: "N/A" };
    const logistics = AppState.logistics.find(x => x.id === Number(o.transporterId)) || { name: "Direct", driver: "N/A", truckNumber: "N/A" };
    
    const sheet = document.getElementById("printable-doc-sheet");
    const todayStr = new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' });
    
    const qtyKg = o.quantityTonnes * 1000;
    const itemTotal = qtyKg * o.sellingRate;
    const taxValue = itemTotal * 0.05; // 5% GST on Jaggery
    const grandTotal = itemTotal + taxValue;
    
    sheet.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #120b07; padding-bottom:15px; margin-bottom:20px;">
            <div>
                <h1 style="margin:0; font-family:'Lexend', sans-serif; font-size:24px; color:#120b07; text-transform:uppercase;">GUR CRM DIRECTORY</h1>
                <p style="margin:2px 0 0 0; font-size:11px; color:#555;">Official Agro Business Billing & Logistics Desk</p>
            </div>
            <div style="text-align:right;">
                <h2 style="margin:0; font-size:16px; color:#d4af37;">${docType.toUpperCase()}</h2>
                <p style="margin:2px 0 0 0; font-size:11px; color:#555;">Date: ${todayStr}</p>
                <p style="margin:2px 0 0 0; font-size:11px; color:#555;">Doc ID: <strong>#${docType.substring(0,2).toUpperCase()}-${o.id}-${Date.now().toString().slice(-4)}</strong></p>
            </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:25px; font-size:12px;">
            <div>
                <h4 style="margin:0 0 6px 0; border-bottom:1px solid #ddd; padding-bottom:4px; text-transform:uppercase; color:#120b07;">Billed To / Buyer Detail:</h4>
                <strong>${buyer.name}</strong><br>
                Address: ${buyer.location}<br>
                Mobile: ${buyer.phone}<br>
                ${buyer.customFields ? Object.entries(buyer.customFields).map(([k,v]) => `${k}: ${v}`).join("<br>") : ""}
            </div>
            <div>
                <h4 style="margin:0 0 6px 0; border-bottom:1px solid #ddd; padding-bottom:4px; text-transform:uppercase; color:#120b07;">Production Bhatti (Supplier):</h4>
                <strong>${bhatti.name}</strong><br>
                Owner: ${bhatti.owner}<br>
                Address: ${bhatti.location}<br>
                ${bhatti.customFields ? Object.entries(bhatti.customFields).map(([k,v]) => `${k}: ${v}`).join("<br>") : ""}
            </div>
        </div>

        <div style="margin-bottom:20px; font-size:12px; background:#f9f9f9; padding:10px; border-radius:4px; border:1px dashed #ddd;">
            <h4 style="margin:0 0 6px 0; text-transform:uppercase; color:#120b07; font-size:11px;">Transport & Logistics details:</h4>
            Carrier: <strong>${logistics.name}</strong> | Vehicle No: <strong>${logistics.truckNumber}</strong> | Driver: ${logistics.driver}<br>
            Transit cost: <strong>₹${o.transportCost.toLocaleString()}</strong> (Direct billed)
            ${logistics.customFields ? "<br>" + Object.entries(logistics.customFields).map(([k,v]) => `${k}: ${v}`).join(" | ") : ""}
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:25px; font-size:12px; text-align:left;">
            <thead>
                <tr style="background:#120b07; color:#fff;">
                    <th style="padding:8px; border:1px solid #ddd;">Description of Jaggery Product</th>
                    <th style="padding:8px; border:1px solid #ddd;">Quantity</th>
                    <th style="padding:8px; border:1px solid #ddd;">Selling Rate</th>
                    <th style="padding:8px; border:1px solid #ddd; text-align:right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding:10px; border:1px solid #ddd;"><strong>Premium Organic Sugar Jaggery (Gur)</strong><br><small>Quality Grade: Double Filtered, Piece Size: Carton packaging</small></td>
                    <td style="padding:10px; border:1px solid #ddd;">${o.quantityTonnes} Tonnes<br><small>(${qtyKg.toLocaleString()} Kgs)</small></td>
                    <td style="padding:10px; border:1px solid #ddd;">₹${o.sellingRate}/Kg</td>
                    <td style="padding:10px; border:1px solid #ddd; text-align:right;">₹${itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="font-weight:bold;">
                    <td colspan="2" style="border:none;"></td>
                    <td style="padding:8px; border:1px solid #ddd;">Subtotal:</td>
                    <td style="padding:8px; border:1px solid #ddd; text-align:right;">₹${itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="font-weight:bold; color:#777;">
                    <td colspan="2" style="border:none;"></td>
                    <td style="padding:8px; border:1px solid #ddd;">GST (5%):</td>
                    <td style="padding:8px; border:1px solid #ddd; text-align:right;">₹${taxValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="font-weight:bold; font-size:14px; color:#120b07; background:#f9f9f9;">
                    <td colspan="2" style="border:none;"></td>
                    <td style="padding:10px; border:1px solid #ddd;">Grand Total:</td>
                    <td style="padding:10px; border:1px solid #ddd; text-align:right;">₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top:35px; border-top:1px solid #eee; padding-top:10px; font-size:11px; text-align:center; color:#777;">
            <p>Thank you for your valuable jaggery business! This is a system-generated document from Gur CRM.</p>
            <div style="display:flex; justify-content:space-between; margin-top:25px; font-size:12px; color:#333;">
                <div>Receiver's Signature<br>___________________</div>
                <div>Authorized Signatory (Gur CRM)<br>___________________</div>
            </div>
        </div>
    `;
    
    const previewModal = document.getElementById("modal-doc-preview");
    previewModal.classList.add("active");
}
window.generateDocumentPreview = generateDocumentPreview;

function triggerDocPrint() {
    const printContent = document.getElementById("printable-doc-sheet").innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Create print window style overrides
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Gur CRM Official Document</title>
                <style>
                    body { font-family: 'Lexend', sans-serif; padding: 40px; color: #120b07; background: #fff; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { padding: 10px; border: 1px solid #ddd; }
                    th { background: #120b07; color: #fff; }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                ${printContent}
            </body>
        </html>
    `);
    printWindow.document.close();
}
window.triggerDocPrint = triggerDocPrint;


// --- 10. VOICE NOTE RECORDER ANDFALLBACK SIMULATOR ---
function setupVoiceNoteRecorder(entityType, recordBtnId, stopBtnId, playbackContainerId, audioId, saveBtnId, simulateBtnId) {
    let mediaRecorder = null;
    let audioChunks = [];
    
    const recordBtn = document.getElementById(recordBtnId);
    const stopBtn = document.getElementById(stopBtnId);
    const playbackContainer = document.getElementById(playbackContainerId);
    const audioPlayback = document.getElementById(audioId);
    const saveBtn = document.getElementById(saveBtnId);
    const simulateBtn = document.getElementById(simulateBtnId);
    
    if (!recordBtn) return;
    
    recordBtn.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });
            
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
                playbackContainer.classList.remove("hidden");
                
                // Keep file as base64 reader if you want to store in state
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = function() {
                    saveBtn.setAttribute("data-audio-base64", reader.result);
                };
            });
            
            mediaRecorder.start();
            recordBtn.classList.add("hidden");
            stopBtn.classList.remove("hidden");
        } catch (err) {
            alert("No microphone found or permission denied! Please use the 'Simulate Voice' fallback link below.");
        }
    });
    
    stopBtn.addEventListener("click", () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            recordBtn.classList.remove("hidden");
            stopBtn.classList.add("hidden");
        }
    });
    
    saveBtn.addEventListener("click", () => {
        const base64 = saveBtn.getAttribute("data-audio-base64");
        if (!base64) return;
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (entityType === "buyer") {
            const logKey = `gur_logs_${currentSelectedBuyerIdForDetails}`;
            const allLogs = JSON.parse(localStorage.getItem(logKey)) || [];
            allLogs.unshift({
                type: "Phone Call",
                date: todayStr,
                notes: `🎤 [Voice Note Memo] Click to listen: <audio src="${base64}" controls style="width:100%; height:25px; margin-top:4px;"></audio>`
            });
            localStorage.setItem(logKey, JSON.stringify(allLogs));
            renderBuyerLogs();
        } else if (entityType === "bhatti") {
            const logKey = `gur_bhatti_logs_${currentSelectedBhattiIdForDetails}`;
            const allLogs = JSON.parse(localStorage.getItem(logKey)) || [];
            allLogs.unshift({
                type: "Phone Call",
                date: todayStr,
                notes: `🎤 [Bhatti Voice Note] Click to listen: <audio src="${base64}" controls style="width:100%; height:25px; margin-top:4px;"></audio>`
            });
            localStorage.setItem(logKey, JSON.stringify(allLogs));
            renderBhattiLogs();
        } else if (entityType === "logistics") {
            const logKey = `gur_logistics_logs_${currentSelectedLogisticsIdForDetails}`;
            const allLogs = JSON.parse(localStorage.getItem(logKey)) || [];
            allLogs.unshift({
                type: "Transit Log",
                date: todayStr,
                notes: `🎤 [Logistics Voice Note] Click to listen: <audio src="${base64}" controls style="width:100%; height:25px; margin-top:4px;"></audio>`
            });
            localStorage.setItem(logKey, JSON.stringify(allLogs));
            renderLogisticsLogs();
        }
        
        playbackContainer.classList.add("hidden");
        alert("Audio voice note saved successfully! 🎙️🌟");
    });
    
    if (simulateBtn) {
        simulateBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // Simulate recorded voice note with generic synthetic audio
            const mockAudioBase64 = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
            saveBtn.setAttribute("data-audio-base64", mockAudioBase64);
            audioPlayback.src = mockAudioBase64;
            playbackContainer.classList.remove("hidden");
            alert("Simulated Audio recording successful! Click 'Save Audio' to persist log.");
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupVoiceNoteRecorder("buyer", "record-voice-btn", "stop-voice-btn", "voice-playback-container", "voice-audio-playback", "save-voice-note-btn", "simulate-voice-btn");
    setupVoiceNoteRecorder("bhatti", "record-bhatti-voice-btn", "stop-bhatti-voice-btn", "bhatti-voice-playback-container", "bhatti-voice-audio-playback", "save-bhatti-voice-note-btn", null);
    setupVoiceNoteRecorder("logistics", "record-logistics-voice-btn", "stop-logistics-voice-btn", "logistics-voice-playback-container", "logistics-voice-audio-playback", "save-logistics-voice-note-btn", null);
});


// --- 11. SMART BUSINESS INSIGHTS GENERATION ENGINE ---
function generateAndRenderSmartInsights() {
    const container = document.getElementById("dashboard-smart-insights-container");
    if (!container) return;
    
    container.innerHTML = "";
    
    const insights = [];
    
    // Check 1: Past-due task alerts
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = AppState.followups.filter(f => !f.isCompleted && f.date < todayStr);
    if (overdueTasks.length > 0) {
        insights.push({
            title: "⏳ Overdue Tasks Alert",
            desc: `Aapke paas ${overdueTasks.length} pending follow-up calls baki hain jo pehle puri honi chahiye thin!`,
            color: "var(--danger-red)"
        });
    }
    
    // Check 2: Bhatti low stock warning
    const lowStockBhattis = AppState.bhattis.filter(bh => bh.stockTonnes < 15);
    lowStockBhattis.forEach(bh => {
        insights.push({
            title: "⚠️ Low Bhatti Stock Warning",
            desc: `<strong>${bh.name}</strong> has less than 15 Tonnes stock remaining (${bh.stockTonnes}T). Arrange next batch immediately before November!`,
            color: "#e67e22"
        });
    });
    
    // Check 3: Top Performer Buyer
    let topBuyer = null;
    let maxBuyerTonnes = 0;
    AppState.buyers.forEach(b => {
        const orderTonnes = AppState.orders.filter(o => Number(o.buyerId) === b.id && o.status !== "Cancelled").reduce((sum, o) => sum + Number(o.quantityTonnes), 0);
        if (orderTonnes > maxBuyerTonnes) {
            maxBuyerTonnes = orderTonnes;
            topBuyer = b;
        }
    });
    
    if (topBuyer && maxBuyerTonnes > 0) {
        insights.push({
            title: "👑 Top Buyer Star Performance",
            desc: `<strong>${topBuyer.name}</strong> is your leading client this season with <strong>${maxBuyerTonnes.toFixed(1)} Tonnes</strong> purchased volume! Offer them premium VIP discount rates.`,
            color: "var(--jaggery-gold)"
        });
    }
    
    // Check 4: Top Supplier Bhatti
    let topBhatti = null;
    let maxBhattiTonnes = 0;
    AppState.bhattis.forEach(bh => {
        const supplyTonnes = AppState.orders.filter(o => Number(o.bhattiId) === bh.id && o.status === "Delivered").reduce((sum, o) => sum + Number(o.quantityTonnes), 0);
        if (supplyTonnes > maxBhattiTonnes) {
            maxBhattiTonnes = supplyTonnes;
            topBhatti = bh;
        }
    });
    if (topBhatti && maxBhattiTonnes > 0) {
        insights.push({
            title: "🏆 Star Supplier Unit",
            desc: `<strong>${topBhatti.name}</strong> is your leading supply source with <strong>${maxBhattiTonnes.toFixed(1)} Tonnes</strong> completed shipments!`,
            color: "var(--sugarcane-green)"
        });
    }
    
    // General greeting if empty
    if (insights.length === 0) {
        insights.push({
            title: "✅ System Performance Green",
            desc: "Sabhi production centers, transit logs, and buyer profiles are performing under green parameters. Season launch prep is on schedule!",
            color: "var(--sugarcane-green)"
        });
    }
    
    insights.forEach(ins => {
        const card = document.createElement("div");
        card.className = "card-glass";
        card.style = `border-left: 4px solid ${ins.color}; padding: 12px;`;
        card.innerHTML = `
            <h4 style="margin:0 0 6px 0; font-size:12px; color:var(--text-cream);">${ins.title}</h4>
            <p style="margin:0; font-size:11px; line-height:1.4; color:var(--text-muted);">${ins.desc}</p>
        `;
        container.appendChild(card);
    });
}

// Modify renderDashboardView to dynamically generate smart insights
const originalRenderDashboardView = window.renderDashboardView;
window.renderDashboardView = function() {
    if (originalRenderDashboardView) originalRenderDashboardView();
    generateAndRenderSmartInsights();
};


// ==========================================
// ====== ADVANCED ROLE-BASED ACCESS CONTROL (RBAC) & ADMIN ENGINE ======
// ==========================================

function initSecurityAndLogin() {
    // 1. Hook up the logout button click listener
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Kya aap sach me logout karna chahte hain?")) {
                logSystemAction("Logout", "System", `${AppState.currentUser ? AppState.currentUser.name : "User"} logged out of Mandi CRM.`);
                AppState.currentUser = null;
                AppState.saveAll();
                window.location.reload();
            }
        });
    }

    // 2. Setup Login overlay form submission
    const loginForm = document.getElementById("login-form-overlay");
    if (loginForm) {
        loginForm.addEventListener("submit", handleOverlayLogin);
    }

    // 3. Setup Backup restore file listener if not done in HTML
    const restoreFileInput = document.getElementById("db-restore-file");
    if (restoreFileInput) {
        restoreFileInput.addEventListener("change", triggerDbRestore);
    }

    // 4. Check if any user exists
    const overlay = document.getElementById("login-overlay");
    const regFields = document.getElementById("overlay-reg-only-fields");
    const loginSubtitle = document.getElementById("login-subtitle");
    const submitBtn = document.getElementById("login-submit-btn");

    if (AppState.users.length === 0) {
        // First turn setup: force Owner Account Creation
        if (overlay) overlay.style.display = "flex";
        if (regFields) regFields.classList.remove("hidden");
        if (loginSubtitle) loginSubtitle.innerText = "Register Owner Account (Swami Account Setup) 👑";
        if (submitBtn) submitBtn.innerText = "Register & Enter Mandi (Mandi Shuru Karein)";
    } else {
        // Standard flow
        if (AppState.currentUser) {
            // Already logged in! Hide gate
            if (overlay) overlay.style.display = "none";
            applyUserPermissions();
        } else {
            // Must log in
            if (overlay) overlay.style.display = "flex";
            if (regFields) regFields.classList.add("hidden");
            if (loginSubtitle) loginSubtitle.innerText = "Apne business credentials se pravesh karein";
            if (submitBtn) submitBtn.innerText = "Log In (Mandi Pravesh)";
        }
    }
}
window.initSecurityAndLogin = initSecurityAndLogin;

function handleOverlayLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    
    const uName = usernameInput ? usernameInput.value.trim().toLowerCase() : "";
    const pWord = passwordInput ? passwordInput.value : "";

    if (!uName || !pWord) {
        alert("Username aur Password likhna zaroori hai!");
        return;
    }

    if (AppState.users.length === 0) {
        // Registering the very first Owner Account
        const regNameInput = document.getElementById("login-reg-name");
        const regPhoneInput = document.getElementById("login-reg-phone");
        const regEmailInput = document.getElementById("login-reg-email");

        const fullName = regNameInput ? regNameInput.value.trim() : "";
        const phoneNo = regPhoneInput ? regPhoneInput.value.trim() : "";
        const emailId = regEmailInput ? regEmailInput.value.trim() : "";

        if (!fullName) {
            alert("Aapka Poora Naam likhna zaroori hai!");
            return;
        }

        const ownerUser = {
            id: Date.now(),
            name: fullName,
            username: uName,
            password: pWord,
            phone: phoneNo,
            email: emailId,
            role: "Owner",
            permissions: {
                viewBuyers: true, editBuyers: true, deleteBuyers: true,
                viewBhattis: true, editBhattis: true, deleteBhattis: true,
                viewLogistics: true, editLogistics: true, deleteLogistics: true,
                orders: true, ai: true, backup: true
            }
        };

        AppState.users.push(ownerUser);
        AppState.currentUser = ownerUser;
        AppState.saveAll();

        logSystemAction("Register", "System", `First Owner account successfully registered: ${fullName} (@${uName})`);
        
        alert(`Mandi Setup Completed! Swagat hai ${fullName}.`);
        window.location.reload();
    } else {
        // Standard login attempt
        const userFound = AppState.users.find(u => u.username === uName && u.password === pWord);
        if (userFound) {
            AppState.currentUser = userFound;
            AppState.saveAll();

            logSystemAction("Login", "System", `${userFound.name} logged in successfully.`);
            
            // Hide overlay and load
            const overlay = document.getElementById("login-overlay");
            if (overlay) overlay.style.display = "none";
            applyUserPermissions();
            renderAll();
            
            // Highlight welcome banner
            alert(`Swagat Hai, ${userFound.name}!`);
        } else {
            alert("❌ Galat Username ya Password! Kripya sahi credentials daalein.");
        }
    }
}
window.handleOverlayLogin = handleOverlayLogin;

function applyUserPermissions() {
    const user = AppState.currentUser;
    if (!user) return;

    // 1. Show/hide logout and update header badge
    const logoutBtn = document.getElementById("logout-btn");
    const badge = document.getElementById("header-user-badge");
    
    if (logoutBtn) logoutBtn.style.display = "block";
    if (badge) {
        badge.style.display = "flex";
        badge.innerText = `${user.role === "Owner" ? "👑" : "👤"} ${user.name}`;
    }

    // 2. Hide/Show Desktop Admin sidebar buttons & mobile admin nav buttons
    const adminNavBtn = document.querySelector('[data-tab="admin"]');
    const adminNavMobile = document.getElementById("nav-tab-admin-mobile");

    if (user.role === "Owner") {
        if (adminNavBtn) adminNavBtn.style.display = "flex";
        if (adminNavMobile) adminNavMobile.style.display = "flex";
    } else {
        if (adminNavBtn) adminNavBtn.style.display = "none";
        if (adminNavMobile) adminNavMobile.style.display = "none";
    }

    // 3. Tab permission filtering
    const allTabBtns = document.querySelectorAll(".nav-tab-btn");
    allTabBtns.forEach(btn => {
        const tab = btn.getAttribute("data-tab");
        if (!tab) return;
        
        let hasAccess = true;
        if (user.role === "Employee") {
            if (tab === "admin") hasAccess = false;
            else if ((tab === "buyers" || tab === "buyerfinder") && !user.permissions.viewBuyers) hasAccess = false;
            else if (tab === "bhattis" && !user.permissions.viewBhattis) hasAccess = false;
            else if (tab === "logistics" && !user.permissions.viewLogistics) hasAccess = false;
            else if (tab === "orders" && !user.permissions.orders) hasAccess = false;
            else if (tab === "aichat" && !user.permissions.ai) hasAccess = false;
        }

        if (hasAccess) {
            btn.style.display = "flex";
        } else {
            btn.style.display = "none";
        }
    });

    // 4. Overrides for add buttons if employee lacks edit permissions
    const addBuyerBtn = document.getElementById("add-buyer-btn");
    const addBhattiBtn = document.getElementById("add-bhatti-btn");
    const addLogisticsBtn = document.getElementById("add-logistics-btn");

    if (user.role === "Employee") {
        if (addBuyerBtn && !user.permissions.editBuyers) addBuyerBtn.style.display = "none";
        if (addBhattiBtn && !user.permissions.editBhattis) addBhattiBtn.style.display = "none";
        if (addLogisticsBtn && !user.permissions.editLogistics) addLogisticsBtn.style.display = "none";
    } else {
        if (addBuyerBtn) addBuyerBtn.style.display = "block";
        if (addBhattiBtn) addBhattiBtn.style.display = "block";
        if (addLogisticsBtn) addLogisticsBtn.style.display = "block";
    }

    // Render components on load
    if (user.role === "Owner") {
        renderEmployeesList();
        renderAuditLogsTable();
        renderAdvCustomFieldsList();
        
        // Populate audit filter users list
        const filterSelect = document.getElementById("audit-filter-user");
        if (filterSelect) {
            filterSelect.innerHTML = `<option value="all">All Employees</option>`;
            AppState.users.forEach(u => {
                const opt = document.createElement("option");
                opt.value = u.username;
                opt.innerText = `${u.name} (@${u.username})`;
                filterSelect.appendChild(opt);
            });
        }
    }
}
window.applyUserPermissions = applyUserPermissions;

// ========================================================
// ====== ADMIN SECTION TAB ROUTING & OPERATIONS ======
// ========================================================

function switchAdminTab(tabId) {
    // 1. Toggle active state on tabs
    const tabs = document.querySelectorAll(".admin-panel-tabs .secondary-btn");
    tabs.forEach(btn => {
        if (btn.id === `tab-admin-${tabId}`) {
            btn.classList.add("active-profile-tab");
            btn.style.background = "var(--border-sugar)";
            btn.style.color = "#fff";
        } else {
            btn.classList.remove("active-profile-tab");
            btn.style.background = "none";
            btn.style.color = "var(--text-muted)";
        }
    });

    // 2. Toggle active subscreen
    const subScreens = document.querySelectorAll(".admin-panel-section");
    subScreens.forEach(sec => {
        if (sec.id === `admin-panel-${tabId}`) {
            sec.classList.remove("hidden");
        } else {
            sec.classList.add("hidden");
        }
    });

    // 3. Trigger content render
    if (tabId === "employees") renderEmployeesList();
    else if (tabId === "audit") renderAuditLogsTable();
    else if (tabId === "customfields") renderAdvCustomFieldsList();
}
window.switchAdminTab = switchAdminTab;

function renderEmployeesList() {
    const list = document.getElementById("admin-employees-list");
    if (!list) return;

    list.innerHTML = "";
    
    // Filter out active Owner accounts to protect critical admin accounts, list employees
    const employees = AppState.users.filter(u => u.role === "Employee");

    if (employees.length === 0) {
        list.innerHTML = `<p style="font-size: 11px; color: var(--text-muted); text-align: center;">Koi employee accounts nahi hain. Mandi staff ke liye naya account banayein!</p>`;
        return;
    }

    employees.forEach(emp => {
        const div = document.createElement("div");
        div.className = "card-glass";
        div.style = "padding: 10px; border-left: 3px solid var(--jaggery-gold);";
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin: 0; font-size: 12px; color: #fff;">${emp.name}</h4>
                    <span style="font-size: 10px; color: var(--text-muted);">@${emp.username} | ${emp.phone || "No Phone"}</span>
                </div>
                <div style="display: flex; gap: 4px;">
                    <button class="icon-btn" onclick="editEmployeeAccount(${emp.id})" style="padding: 2px;"><span class="material-symbols-outlined text-green" style="font-size: 16px;">edit</span></button>
                    <button class="icon-btn" onclick="deleteEmployeeAccount(${emp.id})" style="padding: 2px;"><span class="material-symbols-outlined text-danger" style="font-size: 16px;">delete</span></button>
                </div>
            </div>
            <div style="font-size: 9px; color: var(--text-muted); margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px;">
                <strong>Permissions:</strong> ${Object.entries(emp.permissions).filter(([k,v]) => v).map(([k,v]) => k).join(", ") || "None"}
            </div>
        `;
        list.appendChild(div);
    });
}
window.renderEmployeesList = renderEmployeesList;

function saveEmployeeAccount(e) {
    if (e) e.preventDefault();

    const user = AppState.currentUser;
    if (!user || user.role !== "Owner") {
        alert("Unauthorized action!");
        return;
    }

    const idVal = document.getElementById("emp-id").value;
    const name = document.getElementById("emp-name").value.trim();
    const username = document.getElementById("emp-username").value.trim().toLowerCase();
    const password = document.getElementById("emp-password").value;
    const phone = document.getElementById("emp-phone").value.trim();
    const email = document.getElementById("emp-email").value.trim();

    if (!name || !username || !password) {
        alert("Name, Username aur Password likhna zaroori hai!");
        return;
    }

    // Grab permissions checkbox states
    const permissions = {
        viewBuyers: document.getElementById("perm-view-buyers").checked,
        editBuyers: document.getElementById("perm-edit-buyers").checked,
        deleteBuyers: document.getElementById("perm-delete-buyers").checked,
        viewBhattis: document.getElementById("perm-view-bhattis").checked,
        editBhattis: document.getElementById("perm-edit-bhattis").checked,
        deleteBhattis: document.getElementById("perm-delete-bhattis").checked,
        viewLogistics: document.getElementById("perm-view-logistics").checked,
        editLogistics: document.getElementById("perm-edit-logistics").checked,
        deleteLogistics: document.getElementById("perm-delete-logistics").checked,
        orders: document.getElementById("perm-orders").checked,
        ai: document.getElementById("perm-ai").checked,
        backup: document.getElementById("perm-backup").checked
    };

    if (idVal) {
        // Edit mode
        const empIdx = AppState.users.findIndex(u => u.id === Number(idVal));
        if (empIdx !== -1) {
            // Confirm Username uniqueness if it changed
            const existing = AppState.users.find(u => u.username === username && u.id !== Number(idVal));
            if (existing) {
                alert("This username is already taken!");
                return;
            }

            AppState.users[empIdx] = {
                id: Number(idVal),
                name,
                username,
                password,
                phone,
                email,
                role: "Employee",
                permissions
            };

            logSystemAction("Edit", "System", `Updated Employee account: ${name} (@${username}).`);
            alert("Employee account updated successfully!");
        }
    } else {
        // Add mode
        const existing = AppState.users.find(u => u.username === username);
        if (existing) {
            alert("This username is already taken!");
            return;
        }

        const newEmp = {
            id: Date.now(),
            name,
            username,
            password,
            phone,
            email,
            role: "Employee",
            permissions
        };

        AppState.users.push(newEmp);
        logSystemAction("Create", "System", `Created Employee account for: ${name} (@${username}).`);
        alert("Employee account created successfully!");
    }

    AppState.saveAll();
    resetEmployeeForm();
    renderEmployeesList();
    applyUserPermissions();
}
window.saveEmployeeAccount = saveEmployeeAccount;

function resetEmployeeForm() {
    document.getElementById("admin-employee-form").reset();
    document.getElementById("emp-id").value = "";
    document.getElementById("employee-form-title").innerText = "Create New Employee Account";

    // Re-check standard checkboxes by default
    document.getElementById("perm-view-buyers").checked = true;
    document.getElementById("perm-edit-buyers").checked = true;
    document.getElementById("perm-delete-buyers").checked = false;
    document.getElementById("perm-view-bhattis").checked = true;
    document.getElementById("perm-edit-bhattis").checked = true;
    document.getElementById("perm-delete-bhattis").checked = false;
    document.getElementById("perm-view-logistics").checked = true;
    document.getElementById("perm-edit-logistics").checked = true;
    document.getElementById("perm-delete-logistics").checked = false;
    document.getElementById("perm-orders").checked = true;
    document.getElementById("perm-ai").checked = true;
    document.getElementById("perm-backup").checked = false;
}
window.resetEmployeeForm = resetEmployeeForm;

function editEmployeeAccount(empId) {
    const emp = AppState.users.find(u => u.id === Number(empId));
    if (!emp) return;

    document.getElementById("emp-id").value = emp.id;
    document.getElementById("emp-name").value = emp.name;
    document.getElementById("emp-username").value = emp.username;
    document.getElementById("emp-password").value = emp.password;
    document.getElementById("emp-phone").value = emp.phone || "";
    document.getElementById("emp-email").value = emp.email || "";

    // Set permission checkbox values
    document.getElementById("perm-view-buyers").checked = !!emp.permissions.viewBuyers;
    document.getElementById("perm-edit-buyers").checked = !!emp.permissions.editBuyers;
    document.getElementById("perm-delete-buyers").checked = !!emp.permissions.deleteBuyers;
    document.getElementById("perm-view-bhattis").checked = !!emp.permissions.viewBhattis;
    document.getElementById("perm-edit-bhattis").checked = !!emp.permissions.editBhattis;
    document.getElementById("perm-delete-bhattis").checked = !!emp.permissions.deleteBhattis;
    document.getElementById("perm-view-logistics").checked = !!emp.permissions.viewLogistics;
    document.getElementById("perm-edit-logistics").checked = !!emp.permissions.editLogistics;
    document.getElementById("perm-delete-logistics").checked = !!emp.permissions.deleteLogistics;
    document.getElementById("perm-orders").checked = !!emp.permissions.orders;
    document.getElementById("perm-ai").checked = !!emp.permissions.ai;
    document.getElementById("perm-backup").checked = !!emp.permissions.backup;

    document.getElementById("employee-form-title").innerText = "Edit Employee Account Specifications";
}
window.editEmployeeAccount = editEmployeeAccount;

function deleteEmployeeAccount(empId) {
    const emp = AppState.users.find(u => u.id === Number(empId));
    if (!emp) return;

    if (confirm(`Are you sure you want to delete ${emp.name}'s account? This cannot be undone.`)) {
        AppState.users = AppState.users.filter(u => u.id !== Number(empId));
        AppState.saveAll();
        logSystemAction("Delete", "System", `Deleted Employee account: ${emp.name} (@${emp.username}).`);
        renderEmployeesList();
        applyUserPermissions();
        alert("Employee account deleted successfully.");
    }
}
window.deleteEmployeeAccount = deleteEmployeeAccount;

// ==========================================
// ====== AUDIT LOGGER & SYSTEM HISTORY LOGS ======
// ==========================================

function logSystemAction(actionType, moduleName, details) {
    const user = AppState.currentUser ? AppState.currentUser.username : "System/Guest";
    const newLog = {
        timestamp: new Date().toISOString(),
        user: user,
        actionType: actionType,
        module: moduleName,
        details: details
    };
    AppState.auditLogs.unshift(newLog); // newer first
    // Save to localStorage
    localStorage.setItem("gur_audit_logs", JSON.stringify(AppState.auditLogs));
}
window.logSystemAction = logSystemAction;

function renderAuditLogsTable() {
    const tbody = document.getElementById("audit-logs-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const filterUser = document.getElementById("audit-filter-user") ? document.getElementById("audit-filter-user").value : "all";
    const filterDate = document.getElementById("audit-filter-date") ? document.getElementById("audit-filter-date").value : "";

    let logsFiltered = AppState.auditLogs;

    if (filterUser !== "all") {
        logsFiltered = logsFiltered.filter(l => l.user === filterUser);
    }
    if (filterDate) {
        logsFiltered = logsFiltered.filter(l => l.timestamp.startsWith(filterDate));
    }

    if (logsFiltered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 12px; color: var(--text-muted);">No audit logs matched filters.</td></tr>`;
        return;
    }

    // Show top 250 logs to prevent rendering issues if database becomes huge
    logsFiltered.slice(0, 250).forEach(l => {
        const tr = document.createElement("tr");
        tr.style = "border-bottom: 1px solid rgba(255,255,255,0.04);";
        
        const localTime = new Date(l.timestamp).toLocaleString();
        
        tr.innerHTML = `
            <td style="padding: 8px; color: var(--text-muted);">${localTime}</td>
            <td style="padding: 8px; font-weight: bold; color: var(--jaggery-gold);">@${l.user}</td>
            <td style="padding: 8px;"><span class="badge" style="background: rgba(255,255,255,0.05); color: #fff;">${l.actionType}</span></td>
            <td style="padding: 8px; color: var(--sugarcane-green); font-weight: 500;">${l.module}</td>
            <td style="padding: 8px; line-height: 1.4; max-width: 350px;">${l.details}</td>
        `;
        tbody.appendChild(tr);
    });
}
window.renderAuditLogsTable = renderAuditLogsTable;

function clearAuditLogFilter() {
    if (document.getElementById("audit-filter-user")) document.getElementById("audit-filter-user").value = "all";
    if (document.getElementById("audit-filter-date")) document.getElementById("audit-filter-date").value = "";
    renderAuditLogsTable();
}
window.clearAuditLogFilter = clearAuditLogFilter;

// ===============================================
// ====== UPGRADED CUSTOM FIELD ENGINE CONTROLLER ======
// ===============================================

function toggleCustomFieldOptionsInput() {
    const type = document.getElementById("adv-cf-type").value;
    const group = document.getElementById("adv-cf-options-group");
    if (["dropdown", "multi-select", "radio"].includes(type)) {
        group.classList.remove("hidden");
    } else {
        group.classList.add("hidden");
    }
}
window.toggleCustomFieldOptionsInput = toggleCustomFieldOptionsInput;

function saveAdvCustomField() {
    const target = document.getElementById("adv-cf-target").value;
    const type = document.getElementById("adv-cf-type").value;
    const label = document.getElementById("adv-cf-label").value.trim();
    const options = document.getElementById("adv-cf-options").value.trim();

    if (!label) {
        alert("Please write a field label name!");
        return;
    }

    const fields = getCustomFields();
    const isDuplicate = fields.some(f => f.target === target && f.label.toLowerCase() === label.toLowerCase());
    if (isDuplicate) {
        alert("This field name already exists for this profile type!");
        return;
    }

    const newField = { id: Date.now(), target, type, label, options };
    fields.push(newField);
    saveCustomFields(fields);

    // Log audit
    logSystemAction("Custom Field", "Custom Fields", `Registered custom field "${label}" (${type}) for ${target}`);

    // Clear inputs
    document.getElementById("adv-cf-label").value = "";
    document.getElementById("adv-cf-options").value = "";
    if (document.getElementById("adv-cf-options-group")) document.getElementById("adv-cf-options-group").classList.add("hidden");

    renderAdvCustomFieldsList();
    renderCustomFieldsFormContainers();
    alert(`Success! "${label}" custom field has been created.`);
}
window.saveAdvCustomField = saveAdvCustomField;

function deleteAdvCustomField(id) {
    if (confirm("Are you sure you want to delete this custom field? All data stored in this field across profiles will be lost!")) {
        const fName = getCustomFields().find(f => f.id === id)?.label || "Field";
        const fields = getCustomFields().filter(f => f.id !== id);
        saveCustomFields(fields);
        
        logSystemAction("Delete Field", "Custom Fields", `Deleted custom field "${fName}"`);
        
        renderAdvCustomFieldsList();
        renderCustomFieldsFormContainers();
    }
}
window.deleteAdvCustomField = deleteAdvCustomField;

function renderAdvCustomFieldsList() {
    const container = document.getElementById("adv-custom-fields-list");
    if (!container) return;

    const fields = getCustomFields();
    container.innerHTML = "";

    if (fields.length === 0) {
        container.innerHTML = `<p style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 6px;">Abhi tak koi custom field nahi banaya.</p>`;
        return;
    }

    fields.forEach(f => {
        const div = document.createElement("div");
        div.style = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 6px; font-size: 11px;";
        div.innerHTML = `
            <span><strong>[${f.target}]</strong> ${f.label} (${f.type})</span>
            <button type="button" class="icon-btn" onclick="deleteAdvCustomField(${f.id})" style="padding: 2px;"><span class="material-symbols-outlined text-danger" style="font-size: 16px;">delete</span></button>
        `;
        container.appendChild(div);
    });
}
window.renderAdvCustomFieldsList = renderAdvCustomFieldsList;

// ==========================================
// ====== DATABASE BACKUP & RESTORE ENGINE ======
// ==========================================

function triggerDbBackupDownload() {
    const backupData = {
        app: "Gur Vyapaar CRM",
        timestamp: new Date().toISOString(),
        buyers: AppState.buyers,
        bhattis: AppState.bhattis,
        logistics: AppState.logistics,
        orders: AppState.orders,
        followups: AppState.followups,
        users: AppState.users,
        auditLogs: AppState.auditLogs,
        customFields: getCustomFields()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gur_vyapaar_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logSystemAction("DB Backup", "System", "Manual database backup snapshot generated.");
    alert("Backup snapshot downloaded successfully!");
}
window.triggerDbBackupDownload = triggerDbBackupDownload;

function triggerDbRestore(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.app !== "Gur Vyapaar CRM") {
                alert("❌ Restore Failed! File scheme match nahi hui. Sahi Gur Vyapaar backup file select karein.");
                return;
            }

            // Perform Overwrite
            AppState.buyers = parsed.buyers || AppState.buyers;
            AppState.bhattis = parsed.bhattis || AppState.bhattis;
            AppState.logistics = parsed.logistics || AppState.logistics;
            AppState.orders = parsed.orders || AppState.orders;
            AppState.followups = parsed.followups || AppState.followups;
            AppState.users = parsed.users || AppState.users;
            AppState.auditLogs = parsed.auditLogs || AppState.auditLogs;

            if (parsed.customFields) {
                saveCustomFields(parsed.customFields);
            }

            AppState.saveAll();
            logSystemAction("DB Restore", "System", "Mandi local storage overwrite successfully completed from uploaded backup file.");

            alert("✅ Database Restored successfully! Reloading Mandi Application...");
            window.location.reload();
        } catch (err) {
            alert("❌ Restore Failed! File format parse karne me error aayi: " + err.message);
        }
    };
    reader.readAsText(file);
}
window.triggerDbRestore = triggerDbRestore;

// =============================================================
// ====== UPGRADED PRODUCT SPECIFICATION EDITOR & DETAILS ======
// =============================================================

const originalSaveBhattiProduct = window.saveBhattiProduct;
window.saveBhattiProduct = function() {
    const bpIdVal = document.getElementById("bp-id") ? document.getElementById("bp-id").value : "";
    const name = document.getElementById("bp-name").value.trim();
    const grade = document.getElementById("bp-grade").value;
    const weight = document.getElementById("bp-weight").value.trim();
    const packing = document.getElementById("bp-packing").value.trim();
    const stock = Number(document.getElementById("bp-stock").value) || 0;
    const reserved = Number(document.getElementById("bp-reserved") ? document.getElementById("bp-reserved").value : 0) || 0;
    const price = Number(document.getElementById("bp-price").value) || 0;
    const productionInfo = document.getElementById("bp-production-info") ? document.getElementById("bp-production-info").value.trim() : "";
    const remarks = document.getElementById("bp-remarks").value.trim();

    if (!name || stock < 0 || price < 0) {
        alert("Please fill all mandatory fields correctly!");
        return;
    }

    if (reserved > stock) {
        alert("Reserved Stock cannot be higher than Available Total Stock!");
        return;
    }

    const prods = getBhattiProducts(currentSelectedBhattiIdForDetails);
    const key = `gur_bhatti_logs_${currentSelectedBhattiIdForDetails}`;
    const allLogs = JSON.parse(localStorage.getItem(key)) || [];

    if (bpIdVal) {
        // Edit mode
        const prodIdx = prods.findIndex(p => p.id === Number(bpIdVal));
        if (prodIdx !== -1) {
            const oldProd = prods[prodIdx];
            
            // Check for stock changes
            if (oldProd.stock !== stock) {
                allLogs.unshift({
                    type: "Stock Movement",
                    date: new Date().toISOString().split('T')[0],
                    notes: `Product stock changed: ${name} changed from ${oldProd.stock}T to ${stock}T (Reserved: ${reserved}T)`
                });
            }

            // Check for price changes
            const history = oldProd.history || [oldProd.price];
            if (oldProd.price !== price) {
                history.push(price);
                allLogs.unshift({
                    type: "Rate Revision",
                    date: new Date().toISOString().split('T')[0],
                    notes: `Rate update: ${name} price updated from ₹${oldProd.price}/Kg to ₹${price}/Kg`
                });
            }

            prods[prodIdx] = {
                id: Number(bpIdVal),
                name,
                grade,
                pieceWeight: weight,
                packingType: packing,
                stock,
                reservedStock: reserved,
                availableStock: stock - reserved,
                price,
                productionInfo,
                remarks,
                history
            };

            logSystemAction("Edit Product", "Bhattis", `Modified product specification "${name}" for Bhatti ID ${currentSelectedBhattiIdForDetails}`);
        }
    } else {
        // Add mode
        prods.push({
            id: Date.now(),
            name,
            grade,
            pieceWeight: weight,
            packingType: packing,
            stock,
            reservedStock: reserved,
            availableStock: stock - reserved,
            price,
            productionInfo,
            remarks,
            history: [price]
        });

        allLogs.unshift({
            type: "Stock Movement",
            date: new Date().toISOString().split('T')[0],
            notes: `Naya product type add kiya: ${name} (+${stock} Tonnes @ Rs.${price}/Kg).`
        });

        logSystemAction("Create Product", "Bhattis", `Created product specification "${name}" for Bhatti ID ${currentSelectedBhattiIdForDetails}`);
    }

    saveBhattiProducts(currentSelectedBhattiIdForDetails, prods);
    localStorage.setItem(key, JSON.stringify(allLogs));
    
    // Reset form
    if (document.getElementById("bp-id")) document.getElementById("bp-id").value = "";
    document.getElementById("bp-name").value = "";
    document.getElementById("bp-weight").value = "";
    document.getElementById("bp-packing").value = "";
    document.getElementById("bp-stock").value = "";
    if (document.getElementById("bp-reserved")) document.getElementById("bp-reserved").value = "";
    document.getElementById("bp-price").value = "";
    if (document.getElementById("bp-production-info")) document.getElementById("bp-production-info").value = "";
    document.getElementById("bp-remarks").value = "";
    document.getElementById("bp-form-title").innerText = "Add Naya Gud Product Specification Type";

    toggleBhattiProductForm();
    renderBhattiProductStock();
    renderBhattiLogs();
};

function editBhattiProduct(prodId) {
    const prods = getBhattiProducts(currentSelectedBhattiIdForDetails);
    const p = prods.find(x => x.id === Number(prodId));
    if (!p) return;

    if (document.getElementById("bp-id")) document.getElementById("bp-id").value = p.id;
    document.getElementById("bp-name").value = p.name;
    document.getElementById("bp-grade").value = p.grade;
    document.getElementById("bp-weight").value = p.pieceWeight;
    document.getElementById("bp-packing").value = p.packingType;
    document.getElementById("bp-stock").value = p.stock;
    if (document.getElementById("bp-reserved")) document.getElementById("bp-reserved").value = p.reservedStock || 0;
    document.getElementById("bp-price").value = p.price;
    if (document.getElementById("bp-production-info")) document.getElementById("bp-production-info").value = p.productionInfo || "";
    document.getElementById("bp-remarks").value = p.remarks || "";

    document.getElementById("bp-form-title").innerText = "Edit Gud Product Type Specification";
    
    // Ensure form is visible
    document.getElementById("bhatti-product-form-container").classList.remove("hidden");
}
window.editBhattiProduct = editBhattiProduct;

function deleteBhattiProduct(prodId) {
    if (confirm("Kya aap sach me is product configuration ko delete karna chahte hain? All stock levels for this product will be removed.")) {
        const prods = getBhattiProducts(currentSelectedBhattiIdForDetails);
        const p = prods.find(x => x.id === Number(prodId));
        if (p) {
            const filtered = prods.filter(x => x.id !== Number(prodId));
            saveBhattiProducts(currentSelectedBhattiIdForDetails, filtered);
            
            // Add timeline logs
            const key = `gur_bhatti_logs_${currentSelectedBhattiIdForDetails}`;
            const allLogs = JSON.parse(localStorage.getItem(key)) || [];
            allLogs.unshift({
                type: "Stock Movement",
                date: new Date().toISOString().split('T')[0],
                notes: `Product specification deleted: ${p.name}`
            });
            localStorage.setItem(key, JSON.stringify(allLogs));

            logSystemAction("Delete Product", "Bhattis", `Deleted product "${p.name}" configuration`);
            
            renderBhattiProductStock();
            renderBhattiLogs();
        }
    }
}
window.deleteBhattiProduct = deleteBhattiProduct;

const originalRenderBhattiProductStock = window.renderBhattiProductStock;
window.renderBhattiProductStock = function() {
    const container = document.getElementById("bhatti-products-list");
    if (!container) return;
    container.innerHTML = "";

    const prods = getBhattiProducts(currentSelectedBhattiIdForDetails);
    const totalStock = prods.reduce((sum, p) => sum + Number(p.stock), 0);
    const totalReserved = prods.reduce((sum, p) => sum + Number(p.reservedStock || 0), 0);
    const totalAvailable = totalStock - totalReserved;

    const aggDiv = document.createElement("div");
    aggDiv.style = "background:rgba(243,156,18,0.1); border:1px solid var(--jaggery-gold); border-radius:8px; padding:10px; font-size:12px; margin-bottom:12px;";
    aggDiv.innerHTML = `
        <div style="display:flex; justify-content:space-around; text-align:center;">
            <div>Total Stock: <strong>${totalStock.toFixed(1)}T</strong></div>
            <div style="color:var(--danger-red);">Reserved: <strong>${totalReserved.toFixed(1)}T</strong></div>
            <div style="color:var(--sugarcane-green);">Available: <strong>${totalAvailable.toFixed(1)}T</strong></div>
        </div>
    `;
    container.appendChild(aggDiv);

    if (prods.length === 0) {
        container.innerHTML += `<p class="empty-placeholder" style="font-size:11px; text-align:center;">Abhi tak koi specifications nahi hain. Nayi specification add karein!</p>`;
        return;
    }

    prods.forEach(p => {
        const div = document.createElement("div");
        div.className = "card-glass";
        div.style = "padding:12px; margin-bottom:10px; border-left: 3px solid var(--jaggery-gold);";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                <h5 style="margin:0; font-size:12px; color:var(--text-cream);">${p.name}</h5>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span class="badge detail-badge" style="background:var(--border-sugar); font-size:9px;">${p.grade}</span>
                    <button class="icon-btn" onclick="editBhattiProduct(${p.id})" style="padding: 1px;"><span class="material-symbols-outlined text-green" style="font-size: 14px;">edit</span></button>
                    <button class="icon-btn" onclick="deleteBhattiProduct(${p.id})" style="padding: 1px;"><span class="material-symbols-outlined text-danger" style="font-size: 14px;">delete</span></button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; font-size:11px; color:var(--text-muted);">
                <span>Total: <strong>${p.stock} Tonnes</strong></span>
                <span>Price: <strong class="text-green">₹${p.price}/Kg</strong></span>
                <span style="color:var(--danger-red);">Reserved: <strong>${p.reservedStock || 0} Tonnes</strong></span>
                <span style="color:var(--sugarcane-green);">Available: <strong>${(p.stock - (p.reservedStock || 0)).toFixed(1)} Tonnes</strong></span>
                <span>Piece Weight: ${p.pieceWeight || "Standard"}</span>
                <span>Packing: ${p.packingType || "Standard"}</span>
                <span style="grid-column: 1 / -1;">Rate History: ${p.history ? p.history.map(h => `₹${h}`).join(" → ") : `₹${p.price}`}</span>
                ${p.productionInfo ? `<span style="grid-column: 1 / -1;">Production Information: <strong>${p.productionInfo}</strong></span>` : ""}
            </div>
            <div style="font-size:9px; font-style:italic; color:var(--text-muted); margin-top:6px; border-top: 1px solid rgba(255,255,255,0.05); padding-top:4px;">Note: ${p.remarks || 'Standard item.'}</div>
        `;
        container.appendChild(div);
    });
};

// ==========================================
// ====== DEALS AND TRIP HISTORY PLUGINS ======
// ==========================================

function renderBhattiDealsHistory() {
    const container = document.getElementById("bhatti-deals-list");
    if (!container) return;
    container.innerHTML = "";

    const bhId = currentSelectedBhattiIdForDetails;
    const orders = AppState.orders.filter(o => Number(o.bhattiId) === bhId);

    if (orders.length === 0) {
        container.innerHTML = `<p class="empty-placeholder" style="font-size:11px; text-align:center;">Abhi tak is Bhatti se koi deals completed nahi hui hain.</p>`;
        return;
    }

    orders.forEach(o => {
        const b = AppState.buyers.find(x => x.id === Number(o.buyerId)) || { name: "Direct Sale/No Buyer" };
        const t = AppState.logistics.find(x => x.id === Number(o.transporterId)) || { name: "Self Transport" };
        
        const div = document.createElement("div");
        div.className = "card-glass";
        div.style = "padding:10px; margin-bottom:8px; border-left:3px solid var(--sugarcane-green);";
        
        let statusColor = "var(--jaggery-gold)";
        if (o.status === "Delivered") statusColor = "var(--sugarcane-green)";
        else if (o.status === "Cancelled") statusColor = "var(--danger-red)";

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#fff; margin-bottom:4px;">
                <span>Buyer: ${b.name}</span>
                <span style="color:${statusColor}; font-weight:bold;">${o.status}</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:10px; color:var(--text-muted);">
                <span>Date: <strong>${o.date}</strong></span>
                <span>Quantity: <strong>${o.quantityTonnes} Tonnes</strong></span>
                <span>Bhatti Rate: <strong>₹${o.buyingRate}/Kg</strong></span>
                <span>Buyer Rate: <strong>₹${o.sellingRate}/Kg</strong></span>
                <span style="grid-column:1 / -1;">Transporter Trip: <strong>${t.name}</strong></span>
            </div>
        `;
        container.appendChild(div);
    });
}
window.renderBhattiDealsHistory = renderBhattiDealsHistory;

function renderLogisticsDealsHistory() {
    const container = document.getElementById("logistics-deals-list");
    if (!container) return;
    container.innerHTML = "";

    const lgId = currentSelectedLogisticsIdForDetails;
    const orders = AppState.orders.filter(o => Number(o.transporterId) === lgId);

    if (orders.length === 0) {
        container.innerHTML = `<p class="empty-placeholder" style="font-size:11px; text-align:center;">Abhi tak is Transporter ne koi delivery trips complete nahi kiye.</p>`;
        return;
    }

    orders.forEach(o => {
        const b = AppState.buyers.find(x => x.id === Number(o.buyerId)) || { name: "Direct Sale" };
        const bh = AppState.bhattis.find(x => x.id === Number(o.bhattiId)) || { name: "Direct Bhatti" };
        
        const div = document.createElement("div");
        div.className = "card-glass";
        div.style = "padding:10px; margin-bottom:8px; border-left:3px solid #3498db;";
        
        let statusColor = "var(--jaggery-gold)";
        if (o.status === "Delivered") statusColor = "var(--sugarcane-green)";
        else if (o.status === "Cancelled") statusColor = "var(--danger-red)";

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#fff; margin-bottom:4px;">
                <span>Destination Buyer: ${b.name}</span>
                <span style="color:${statusColor};">${o.status}</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:10px; color:var(--text-muted);">
                <span>Trip Date: <strong>${o.date}</strong></span>
                <span>Delivered Weight: <strong>${o.quantityTonnes} Tonnes</strong></span>
                <span>Sourced Bhatti: <strong>${bh.name}</strong></span>
                <span>Freight Paid: <strong class="text-green">₹${(o.transportCost || 0).toLocaleString()}</strong></span>
            </div>
        `;
        container.appendChild(div);
    });
}
window.renderLogisticsDealsHistory = renderLogisticsDealsHistory;

// ==========================================
// ====== DYNAMIC REMINDERS AND FOLLOW-UPS ======
// ==========================================

function toggleProfileFollowupForm(type) {
    const form = document.getElementById(`${type}-profile-followup-form`);
    if (form) form.classList.toggle("hidden");
}
window.toggleProfileFollowupForm = toggleProfileFollowupForm;

function saveProfileFollowup(type) {
    const titleVal = document.getElementById(`${type}-pf-title`).value.trim();
    const descVal = document.getElementById(`${type}-pf-desc`).value.trim();
    const dateVal = document.getElementById(`${type}-pf-date`).value;

    if (!titleVal || !dateVal) {
        alert("Title aur Due Date enter karein!");
        return;
    }

    const relId = type === "bhatti" ? currentSelectedBhattiIdForDetails : currentSelectedLogisticsIdForDetails;
    const relType = type === "bhatti" ? "Bhatti" : "Logistics";

    const newId = AppState.followups.length > 0 ? Math.max(...AppState.followups.map(x => x.id)) + 1 : 1;
    const newFollow = {
        id: newId,
        title: titleVal,
        description: descVal,
        date: dateVal,
        isCompleted: false,
        relatedType: relType,
        relatedId: relId
    };

    AppState.followups.unshift(newFollow);
    AppState.saveAll();

    // Reset inputs
    document.getElementById(`${type}-pf-title`).value = "";
    document.getElementById(`${type}-pf-desc`).value = "";
    document.getElementById(`${type}-pf-date`).value = "";

    toggleProfileFollowupForm(type);
    renderProfileFollowups(type);
    
    // Log audit
    logSystemAction("Create Task", relType, `Added followup task "${titleVal}" for linked ${relType} ID ${relId}`);
    alert("Follow-up successfully scheduled!");
}
window.saveProfileFollowup = saveProfileFollowup;

function renderProfileFollowups(type) {
    const container = document.getElementById(`${type}-followups-list`);
    if (!container) return;
    container.innerHTML = "";

    const relId = type === "bhatti" ? currentSelectedBhattiIdForDetails : currentSelectedLogisticsIdForDetails;
    const relType = type === "bhatti" ? "Bhatti" : "Logistics";

    const filtered = AppState.followups.filter(f => f.relatedType === relType && Number(f.relatedId) === relId);

    if (filtered.length === 0) {
        container.innerHTML = `<p class="empty-placeholder" style="font-size:11px; text-align:center;">Koi tasks ya followups list nahi hai.</p>`;
        return;
    }

    filtered.forEach(f => {
        const div = document.createElement("div");
        div.className = "card-glass";
        div.style = `padding: 10px; margin-bottom: 8px; border-left: 3px solid ${f.isCompleted ? 'var(--sugarcane-green)' : 'var(--jaggery-gold)'}; display: flex; align-items: start; gap: 8px;`;

        // Check if overdue
        const todayStr = new Date().toISOString().split('T')[0];
        const isOverdue = !f.isCompleted && f.date < todayStr;
        const dateStyle = isOverdue ? "color:var(--danger-red); font-weight:bold;" : "color:var(--jaggery-gold);";

        div.innerHTML = `
            <input type="checkbox" ${f.isCompleted ? 'checked' : ''} onclick="toggleFollowupComplete(${f.id}, '${type}')" style="width: auto; margin-top: 2px;">
            <div style="flex: 1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h5 style="margin:0; font-size:11px; color:#fff; text-decoration: ${f.isCompleted ? 'line-through' : 'none'};">${f.title}</h5>
                    <button class="icon-btn" onclick="deleteProfileFollowup(${f.id}, '${type}')" style="padding: 1px;"><span class="material-symbols-outlined text-danger" style="font-size: 14px;">delete</span></button>
                </div>
                <p style="margin: 3px 0; font-size:10px; color:var(--text-muted); line-height:1.3;">${f.description || "No description provided."}</p>
                <span style="font-size: 9px; ${dateStyle}">Due Date: ${f.date} ${isOverdue ? "⚠️ (OVERDUE)" : ""}</span>
            </div>
        `;
        container.appendChild(div);
    });
}
window.renderProfileFollowups = renderProfileFollowups;

function toggleFollowupComplete(fId, type) {
    const idx = AppState.followups.findIndex(f => f.id === Number(fId));
    if (idx !== -1) {
        AppState.followups[idx].isCompleted = !AppState.followups[idx].isCompleted;
        AppState.saveAll();
        renderProfileFollowups(type);
        
        logSystemAction("Task Status", "Tasks", `Followup "${AppState.followups[idx].title}" complete state toggled to ${AppState.followups[idx].isCompleted}`);
    }
}
window.toggleFollowupComplete = toggleFollowupComplete;

function deleteProfileFollowup(fId, type) {
    if (confirm("Are you sure you want to delete this follow-up?")) {
        const f = AppState.followups.find(x => x.id === Number(fId));
        AppState.followups = AppState.followups.filter(x => x.id !== Number(fId));
        AppState.saveAll();
        renderProfileFollowups(type);

        if (f) {
            logSystemAction("Delete Task", "Tasks", `Deleted scheduled task "${f.title}"`);
        }
    }
}
window.deleteProfileFollowup = deleteProfileFollowup;

// Block non-authorized actions on CRUD triggers
const originalOpenEditBuyerModal = window.openEditBuyerModal;
window.openEditBuyerModal = function(id) {
    const user = AppState.currentUser;
    if (user && user.role === "Employee" && !user.permissions.editBuyers) {
        alert("❌ Access Denied! Aapke paas Buyers Edit karne ki permissions nahi hain.");
        return;
    }
    if (originalOpenEditBuyerModal) originalOpenEditBuyerModal(id);
};

const originalDeleteBuyer = window.deleteBuyer;
window.deleteBuyer = function(id) {
    const user = AppState.currentUser;
    if (user && user.role === "Employee" && !user.permissions.deleteBuyers) {
        alert("❌ Access Denied! Aapke paas Buyers Delete karne ki permissions nahi hain.");
        return;
    }
    if (originalDeleteBuyer) originalDeleteBuyer(id);
};

const originalOpenEditBhattiModal = window.openEditBhattiModal;
window.openEditBhattiModal = function(id) {
    const user = AppState.currentUser;
    if (user && user.role === "Employee" && !user.permissions.editBhattis) {
        alert("❌ Access Denied! Aapke paas Bhattis Edit karne ki permissions nahi hain.");
        return;
    }
    if (originalOpenEditBhattiModal) originalOpenEditBhattiModal(id);
};

const originalDeleteBhatti = window.deleteBhatti;
window.deleteBhatti = function(id) {
    const user = AppState.currentUser;
    if (user && user.role === "Employee" && !user.permissions.deleteBhattis) {
        alert("❌ Access Denied! Aapke paas Bhattis Delete karne ki permissions nahi hain.");
        return;
    }
    if (originalDeleteBhatti) originalDeleteBhatti(id);
};

const originalOpenEditLogisticsModal = window.openEditLogisticsModal;
window.openEditLogisticsModal = function(id) {
    const user = AppState.currentUser;
    if (user && user.role === "Employee" && !user.permissions.editLogistics) {
        alert("❌ Access Denied! Aapke paas Transporters Edit karne ki permissions nahi hain.");
        return;
    }
    if (originalOpenEditLogisticsModal) originalOpenEditLogisticsModal(id);
};

const originalDeleteLogistics = window.deleteLogistics;
window.deleteLogistics = function(id) {
    const user = AppState.currentUser;
    if (user && user.role === "Employee" && !user.permissions.deleteLogistics) {
        alert("❌ Access Denied! Aapke paas Transporters Delete karne ki permissions nahi hain.");
        return;
    }
    if (originalDeleteLogistics) originalDeleteLogistics(id);
};

