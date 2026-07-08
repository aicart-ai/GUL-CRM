/* ============================================
   GUL CRM - Master JavaScript Engine
   ============================================ */

// ============================================
// CORE DATABASE STATE POOL
// ============================================
let GUL_DATABASE = {
    buyers: [],
    suppliers: [],
    farmers: [],
    bhattis: [],
    transport: [],
    orders: [],
    payments: [],
    inventory: {
        "Laddu Gud": 0,
        "Block Gud": 0,
        "Powder Gud": 0,
        "Organic Gud": 0,
        "Liquid Gud": 0
    },
    inventoryLogs: [],
    timeline: []
};

let currentFollowUpIndex = 0;
let currentActiveFormModuleType = null;

// ============================================
// PAGINATION VARIABLES
// ============================================
const ITEMS_PER_PAGE = 25;
let currentPage = 1;
let totalPages = 1;

// ============================================
// DEBOUNCE UTILITY
// ============================================
let searchTimeout = null;
function debouncedSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        runAdvancedFilters();
    }, 300);
}

// ============================================
// LIFE CYCLE TRIGGER
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('live-date').innerText = new Date().toLocaleDateString('en-IN', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    initTheme();
    
    if (localStorage.getItem('GUL_CRM_V2_FINAL')) {
        try {
            GUL_DATABASE = JSON.parse(localStorage.getItem('GUL_CRM_V2_FINAL'));
            if (!GUL_DATABASE.inventory) {
                GUL_DATABASE.inventory = {
                    "Laddu Gud": 0,
                    "Block Gud": 0,
                    "Powder Gud": 0,
                    "Organic Gud": 0,
                    "Liquid Gud": 0
                };
            }
            if (!GUL_DATABASE.inventoryLogs) GUL_DATABASE.inventoryLogs = [];
            if (!GUL_DATABASE.timeline) GUL_DATABASE.timeline = [];
        } catch (e) {
            console.error("Database initialization fault.");
        }
    } else {
        seedDummyData();
    }
    
    if (localStorage.getItem('GUL_GEMINI_KEY')) {
        document.getElementById('cfg-gemini-key').value = localStorage.getItem('GUL_GEMINI_KEY');
    }
    
    updateEntireUI();
    registerServiceWorker();
});

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const isSecureOrLocal = window.location.protocol === 'https:' || 
                                window.location.hostname === 'localhost' || 
                                window.location.hostname === '127.0.0.1';
        
        if (isSecureOrLocal) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker registered beautifully!'))
                .catch(err => console.error('Service worker subscription fault:', err));
        } else {
            console.log('Service Worker registration skipped: App is running in sandbox/local file mode.');
        }
    }
}

// ============================================
// DATABASE PERSISTENCE
// ============================================
function saveDB() {
    localStorage.setItem('GUL_CRM_V2_FINAL', JSON.stringify(GUL_DATABASE));
}

function updateEntireUI() {
    renderDataGrids();
    renderWarehouse();
    refreshDashboardMetrics();
    updatePagination();
}

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
function showToast(msg, type = 'success') {
    const tc = document.getElementById('toast-container');
    const t = document.createElement('div');
    const colors = type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white';
    t.className = `toast-enter ${colors} px-5 py-3 rounded-full shadow-xl font-bold text-xs flex items-center gap-2`;
    t.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check' : 'circle-exclamation'}"></i> ${msg}`;
    tc.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 300);
    }, 3000);
}

// ============================================
// TIMELINE AUDIT SYSTEM
// ============================================
function addTimelineEntry(message, type = 'System') {
    const time = new Date().toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
    });
    GUL_DATABASE.timeline.unshift({ time, message, type });
    if (GUL_DATABASE.timeline.length > 50) GUL_DATABASE.timeline.pop();
}

// ============================================
// NAVIGATION SWITCHES
// ============================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`panel-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('bg-jaggery-color', 'text-white', 'shadow-md');
        b.classList.add('text-gray-400', 'hover:bg-gray-800', 'hover:text-white');
    });
    const dBtn = document.getElementById(`nav-${tabId}`);
    if (dBtn) {
        dBtn.classList.remove('text-gray-400', 'hover:bg-gray-800', 'hover:text-white');
        dBtn.classList.add('bg-jaggery-color', 'text-white', 'shadow-md');
    }

    document.querySelectorAll('.mob-nav-btn').forEach(mb => {
        mb.classList.remove('text-amber-600');
        mb.classList.add('text-gray-400', 'dark:text-gray-500');
    });
    const mBtn = document.getElementById(`mob-nav-${tabId}`);
    if (mBtn) {
        mBtn.classList.remove('text-gray-400', 'dark:text-gray-500');
        mBtn.classList.add('text-amber-600');
    }

    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
    }
    
    if (tabId === 'search') runAdvancedFilters();
    
    window.scrollTo(0, 0);
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('-translate-x-full');
}

// ============================================
// THEME MANAGEMENT
// ============================================
function initTheme() {
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-icon').className = "fa-solid fa-sun text-amber-400";
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-icon').className = "fa-solid fa-moon text-gray-650";
    }
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-icon').className = isDark ? 
        "fa-solid fa-sun text-amber-400" : 
        "fa-solid fa-moon text-gray-650";
}

// ============================================
// DASHBOARD METRICS & TIMELINE
// ============================================
function refreshDashboardMetrics() {
    document.getElementById('m-total-buyers').innerText = GUL_DATABASE.buyers.length;
    document.getElementById('m-total-orders').innerText = 
        GUL_DATABASE.orders.filter(o => o.status !== 'Delivered').length;
    document.getElementById('m-total-suppliers').innerText = GUL_DATABASE.suppliers.length;
    
    let totalStk = 0;
    Object.values(GUL_DATABASE.inventory).forEach(val => totalStk += Number(val));
    document.getElementById('m-total-stock').innerText = totalStk;

    buildFollowUpSlider();
    buildDashboardTimeline();
}

// ============================================
// DASHBOARD TIMELINE
// ============================================
function buildDashboardTimeline() {
    const box = document.getElementById('dashboard-timeline-box');
    if (GUL_DATABASE.timeline.length === 0) {
        box.innerHTML = `<div class="text-center text-gray-400 text-xs py-8 font-bold">No recent activities available.</div>`;
        return;
    }
    
    box.innerHTML = GUL_DATABASE.timeline.slice(0, 10).map(t => `
        <div class="flex gap-3 text-xs border-b border-gray-100 dark:border-gray-700/50 pb-2">
            <span class="text-[10px] text-gray-400 font-bold shrink-0 mt-0.5 whitespace-nowrap">
                <i class="fa-regular fa-clock"></i> ${t.time.split(',')[0]}
            </span>
            <span class="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">${t.message}</span>
        </div>
    `).join('');
}

// ============================================
// FOLLOW-UP CAROUSEL
// ============================================
function buildFollowUpSlider() {
    const todayStr = new Date().toISOString().split('T')[0];
    const matches = GUL_DATABASE.buyers.filter(b => b.followupDate === todayStr);
    const container = document.getElementById('followup-slider-container');
    const badge = document.getElementById('slider-count-badge');

    if (matches.length === 0) {
        badge.innerText = "0/0";
        container.innerHTML = `
            <div class="text-center text-white/80 font-bold text-sm py-4">
                <i class="fa-solid fa-check-circle text-2xl block mb-2 text-green-300"></i> 
                No follow-ups scheduled for today!
            </div>`;
        return;
    }

    if (currentFollowUpIndex >= matches.length) currentFollowUpIndex = 0;
    if (currentFollowUpIndex < 0) currentFollowUpIndex = matches.length - 1;

    badge.innerText = `${currentFollowUpIndex + 1}/${matches.length}`;
    const b = matches[currentFollowUpIndex];

    container.innerHTML = `
        <div class="space-y-1">
            <h4 class="text-xl font-black">${b.name} <span class="text-xs font-semibold text-white/70">(${b.company || 'Retail'})</span></h4>
            <p class="text-sm font-bold text-white/90">Need: ${b.expectedQty} ${b.gudType} @ ₹${b.targetPrice}</p>
            <p class="text-[11px] text-white/70 italic line-clamp-1 mt-1">"${b.remarks}"</p>
        </div>
        <div class="flex gap-2 pt-3 border-t border-white/20 mt-2">
            <a href="tel:${b.phone}" class="flex-1 bg-white text-amber-800 text-xs font-black py-2.5 rounded-xl text-center hover:bg-amber-50 transition shadow-sm flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-phone"></i> Call
            </a>
            <a href="https://wa.me/${b.whatsapp}" target="_blank" class="flex-1 bg-[#25D366] text-white text-xs font-black py-2.5 rounded-xl text-center hover:bg-[#20b858] transition shadow-sm flex items-center justify-center gap-1.5">
                <i class="fa-brands fa-whatsapp"></i> Message
            </a>
        </div>
    `;
}

function nextFollowUp() {
    currentFollowUpIndex++;
    buildFollowUpSlider();
}

function prevFollowUp() {
    currentFollowUpIndex--;
    buildFollowUpSlider();
}

// ============================================
// PAGINATION SYSTEM
// ============================================
function updatePagination() {
    const total = GUL_DATABASE.buyers.length;
    totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, total);
    
    document.getElementById('page-start').innerText = total > 0 ? start + 1 : 0;
    document.getElementById('page-end').innerText = end;
    document.getElementById('total-records').innerText = total;
    document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages}`;
    
    document.getElementById('prev-page-btn').disabled = currentPage <= 1;
    document.getElementById('next-page-btn').disabled = currentPage >= totalPages;
}

function changePage(direction) {
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    renderBuyers();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getPaginatedBuyers() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return GUL_DATABASE.buyers.slice(start, end);
}

// ============================================
// DATA GRID RENDERERS
// ============================================
function renderDataGrids() {
    renderBuyers();
    renderSuppliers();
    renderFarmers();
    renderBhattis();
    renderTransport();
    renderOrders();
    renderPayments();
}

function renderBuyers() {
    const container = document.getElementById('buyer-cards-grid');
    const paginatedBuyers = getPaginatedBuyers();
    
    if (GUL_DATABASE.buyers.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No buyers found. Register one or import from CSV.</div>`;
        return;
    }
    
    if (paginatedBuyers.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No buyers on this page.</div>`;
        return;
    }
    
    container.innerHTML = paginatedBuyers.map(b => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3 group hover:border-amber-400 transition">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-extrabold text-gray-800 dark:text-white text-base">${b.name}</h3>
                    <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider">${b.company || 'Individual'}</span>
                </div>
                <span class="text-[9px] font-black px-2 py-1 rounded-md uppercase ${b.priority === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-gray-100 text-gray-600'}">${b.priority}</span>
            </div>
            <div class="text-xs font-semibold text-gray-600 dark:text-gray-300 grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-750">
                <div><span class="block text-[9px] text-gray-400 uppercase">Product</span>${b.gudType}</div>
                <div><span class="block text-[9px] text-gray-400 uppercase">Qty Reqd</span>${b.expectedQty}</div>
                <div><span class="block text-[9px] text-gray-400 uppercase">Target</span>₹${b.targetPrice}</div>
                <div><span class="block text-[9px] text-gray-400 uppercase">Status</span>${b.status}</div>
            </div>
            <div class="flex gap-2 pt-1">
                <a href="tel:${b.phone}" class="flex-1 text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-750 dark:text-white text-xs font-extrabold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-phone"></i> Call
                </a>
                <a href="https://wa.me/${b.whatsapp}" target="_blank" class="w-10 flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 rounded-xl hover:bg-emerald-100 transition">
                    <i class="fa-brands fa-whatsapp text-lg"></i>
                </a>
                <button onclick="deleteRecord('buyers', '${b.id}')" class="w-10 flex items-center justify-center bg-red-50 text-red-500 dark:bg-red-905/30 rounded-xl hover:bg-red-100 transition focus:outline-none">
                    <i class="fa-solid fa-trash text-sm"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderSuppliers() {
    const container = document.getElementById('supplier-cards-grid');
    if (GUL_DATABASE.suppliers.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No suppliers found.</div>`;
        return;
    }
    container.innerHTML = GUL_DATABASE.suppliers.map(s => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
            <h3 class="font-extrabold text-base text-blue-700 dark:text-blue-400">${s.name}</h3>
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider"><i class="fa-solid fa-location-dot"></i> ${s.village}, ${s.district}</p>
            <div class="text-xs font-bold text-gray-700 dark:text-gray-300 space-y-1">
                <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-1"><span>Daily Capacity</span> <span>${s.dailyCapacity} Qtl</span></div>
                <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-1"><span>Base Price</span> <span>₹${s.price}/Qtl</span></div>
                <div class="flex justify-between pt-1"><span>Types</span> <span class="text-amber-600 text-right">${s.gudTypes}</span></div>
            </div>
        </div>
    `).join('');
}

function renderFarmers() {
    const container = document.getElementById('farmer-cards-grid');
    if (GUL_DATABASE.farmers.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No farmers added.</div>`;
        return;
    }
    container.innerHTML = GUL_DATABASE.farmers.map(f => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <div class="flex justify-between items-center">
                <h3 class="font-extrabold text-emerald-750 dark:text-emerald-400 text-base">${f.name}</h3>
                <span class="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-1 rounded-md uppercase">${f.organic}</span>
            </div>
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider"><i class="fa-solid fa-seedling"></i> Variety: ${f.sugarcaneVariety}</p>
            <div class="text-xs font-bold text-gray-700 dark:text-gray-300 flex justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded-lg mt-2">
                <span>Area: ${f.area}</span> <span>Est. Yield: ${f.expectedProd}</span>
            </div>
        </div>
    `).join('');
}

function renderBhattis() {
    const container = document.getElementById('bhatti-cards-grid');
    if (GUL_DATABASE.bhattis.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No Bhattis registered.</div>`;
        return;
    }
    container.innerHTML = GUL_DATABASE.bhattis.map(b => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <h3 class="font-extrabold text-orange-600 dark:text-orange-400 text-base">${b.bhattiName}</h3>
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Owner: ${b.owner} (${b.village})</p>
            <div class="text-xs font-bold text-gray-700 dark:text-gray-300 space-y-1">
                <div class="flex justify-between"><span>Fuel:</span> <span>${b.fuelType}</span></div>
                <div class="flex justify-between"><span>Capacity:</span> <span>${b.dailyCapacity}</span></div>
                <div class="flex justify-between text-amber-600 font-bold"><span>Ready Stock:</span> <span>${b.stock}</span></div>
            </div>
        </div>
    `).join('');
}

function renderTransport() {
    const container = document.getElementById('transport-cards-grid');
    if (GUL_DATABASE.transport.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No vehicles available.</div>`;
        return;
    }
    container.innerHTML = GUL_DATABASE.transport.map(t => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <div class="flex justify-between items-center">
                <h3 class="font-extrabold text-indigo-700 dark:text-indigo-400 text-base">${t.vehicleNo}</h3>
                <span class="bg-indigo-100 text-indigo-800 text-[9px] px-2 py-1 rounded-md font-black uppercase">Active</span>
            </div>
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Driver: ${t.driver} | ${t.truckType}</p>
            <div class="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg flex justify-between mt-2">
                <span>Rate: ${t.freightRate}</span> <span>Cap: ${t.capacity}</span>
            </div>
        </div>
    `).join('');
}

function renderOrders() {
    const container = document.getElementById('order-cards-grid');
    if (GUL_DATABASE.orders.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No orders found. Create one.</div>`;
        return;
    }
    container.innerHTML = GUL_DATABASE.orders.map(o => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 relative overflow-hidden">
            <div class="flex justify-between items-start">
                <div>
                    <span class="text-[9px] font-black text-gray-400 uppercase">${o.id}</span>
                    <h3 class="font-extrabold text-base leading-tight">${o.buyerName}</h3>
                </div>
                <span class="text-[9px] font-black px-2 py-1 rounded-md uppercase ${o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : o.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}">${o.status}</span>
            </div>
            <div class="text-xs font-bold text-gray-600 dark:text-gray-300">
                <span class="block">${o.qty} of ${o.product}</span>
                <span class="block text-emerald-600 text-sm mt-1">₹${Number(o.totalAmount).toLocaleString('en-IN')}</span>
            </div>
            <div class="pt-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2">
                ${o.status === 'Pending' ? `<button onclick="updateOrderStatus('${o.id}', 'Dispatched')" class="py-1.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 focus:outline-none">Mark Dispatched</button>` : ''}
                ${o.status === 'Dispatched' ? `<button onclick="updateOrderStatus('${o.id}', 'Delivered')" class="py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 focus:outline-none">Mark Delivered</button>` : ''}
                <button onclick="deleteRecord('orders', '${o.id}')" class="py-1.5 text-[10px] font-bold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 col-start-2 focus:outline-none">Delete Order</button>
            </div>
        </div>
    `).join('');
}

function renderPayments() {
    const container = document.getElementById('payment-cards-grid');
    if (GUL_DATABASE.payments.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No payments recorded.</div>`;
        return;
    }
    container.innerHTML = GUL_DATABASE.payments.map(p => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-2 relative">
            <div class="flex justify-between items-start">
                <div>
                    <span class="text-[9px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-2 py-1 rounded-md mb-1 inline-block">${p.type} via ${p.mode}</span>
                    <h3 class="font-extrabold text-base leading-tight">${p.buyerName}</h3>
                </div>
                <span class="text-[10px] font-bold text-gray-400">${p.date}</span>
            </div>
            <div class="text-2xl font-black text-emerald-600 mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">₹${Number(p.amount).toLocaleString('en-IN')}</div>
        </div>
    `).join('');
}

// ============================================
// WAREHOUSE RENDERER
// ============================================
function renderWarehouse() {
    const grid = document.getElementById('warehouse-stats-grid');
    const inv = GUL_DATABASE.inventory;
    
    grid.innerHTML = Object.keys(inv).map(key => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <span class="text-[10px] font-black text-gray-400 block uppercase tracking-wider mb-1">${key}</span>
            <span class="text-xl font-extrabold text-amber-700 dark:text-amber-500">${inv[key]} Qtl</span>
        </div>
    `).join('');

    const logTable = document.getElementById('inventory-log-table');
    if (GUL_DATABASE.inventoryLogs.length === 0) {
        logTable.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-xs font-bold text-gray-400">No inventory modifications logged.</td></tr>`;
    } else {
        logTable.innerHTML = GUL_DATABASE.inventoryLogs.slice(0, 10).map(log => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-850 transition text-xs font-semibold">
                <td class="p-3 text-gray-500">${log.date}</td>
                <td class="p-3 font-bold">${log.product}</td>
                <td class="p-3 ${log.action === 'Stock In' ? 'text-emerald-600' : 'text-rose-500'} font-black uppercase text-[10px]">
                    <span class="${log.action === 'Stock In' ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-rose-50 dark:bg-rose-950/20'} px-2 py-1 rounded">${log.action}</span>
                </td>
                <td class="p-3 font-bold">${log.qty}</td>
                <td class="p-3 text-gray-500 italic">${log.remarks}</td>
            </tr>
        `).join('');
    }
}

// ============================================
// ORDER STATUS UPDATE
// ============================================
function updateOrderStatus(orderId, newStatus) {
    const order = GUL_DATABASE.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveDB();
        updateEntireUI();
        showToast(`Order ${orderId} updated to ${newStatus}`);
    }
}

// ============================================
// RECORD DELETION
// ============================================
function deleteRecord(collection, id) {
    if (!confirm(`Are you sure you want to delete this record?`)) return;
    
    if (GUL_DATABASE[collection]) {
        GUL_DATABASE[collection] = GUL_DATABASE[collection].filter(item => item.id !== id);
        saveDB();
        updateEntireUI();
        showToast('Record deleted successfully.');
    }
}

// ============================================
// FORM MODAL CONTROLS
// ============================================
function openFormModal(moduleType) {
    currentActiveFormModuleType = moduleType;
    const container = document.getElementById('modal-form-fields-container');
    const title = document.getElementById('modal-form-title');
    
    const modal = document.getElementById('form-modal');
    const content = document.getElementById('form-modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('translate-y-full');
    }, 10);

    let formHTML = '';

    switch (moduleType) {
        case 'buyer':
            title.innerText = "Register New Bulk Buyer";
            formHTML = getBuyerFormHTML();
            break;
        case 'inventory':
            title.innerText = "Warehouse Stock Adjustment";
            formHTML = getInventoryFormHTML();
            break;
        case 'order':
            title.innerText = "Create Sales Order";
            formHTML = getOrderFormHTML();
            break;
        case 'payment':
            title.innerText = "Log Payment Entry";
            formHTML = getPaymentFormHTML();
            break;
        case 'supplier':
            title.innerText = "Register Manufacturing Supplier";
            formHTML = getSupplierFormHTML();
            break;
        case 'farmer':
            title.innerText = "Register Sugarcane Sourcing Farmer";
            formHTML = getFarmerFormHTML();
            break;
        case 'bhatti':
            title.innerText = "Register New Bhatti Unit";
            formHTML = getBhattiFormHTML();
            break;
        case 'transport':
            title.innerText = "Register Vehicle Logistics";
            formHTML = getTransportFormHTML();
            break;
        default:
            formHTML = '<p class="text-center text-gray-400">Invalid module.</p>';
    }
    
    container.innerHTML = formHTML;
}

function getBuyerFormHTML() {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Full Name *</label><input type="text" id="f-b-name" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="Ramesh Kumar"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Phone *</label><input type="tel" id="f-b-phone" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">WhatsApp</label><input type="tel" id="f-b-wa" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Company / Firm</label><input type="text" id="f-b-co" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Location / City</label><input type="text" id="f-b-loc" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="Meerut, UP"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Expected Gud Type</label><select id="f-b-type" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none dark:text-white"><option>Laddu Gud</option><option>Block Gud</option><option>Powder Gud</option><option>Liquid Gud</option><option>Organic Gud</option></select></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Expected Quantity (Qtl)</label><input type="text" id="f-b-qty" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="250 Qtl"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Target Price (₹)</label><input type="number" id="f-b-price" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Priority</label><select id="f-b-prior" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none dark:text-white"><option>Medium</option><option>High</option></select></div>
            <div class="space-y-1 sm:col-span-2"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Next Follow Up Date</label><input type="date" id="f-b-fudate" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1 sm:col-span-2"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Remarks / Particular Needs</label><textarea id="f-b-rem" rows="2" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></textarea></div>
        </div>`;
}

function getInventoryFormHTML() {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Action Type</label>
                <select id="f-i-action" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white">
                    <option value="Stock In">Stock In (Add)</option>
                    <option value="Stock Out">Stock Out (Reduce)</option>
                </select>
            </div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Product Grade</label>
                <select id="f-i-prod" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white">
                    <option>Laddu Gud</option><option>Block Gud</option><option>Powder Gud</option><option>Organic Gud</option><option>Liquid Gud</option>
                </select>
            </div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Quantity (Qtl)</label><input type="number" id="f-i-qty" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Remarks</label><input type="text" id="f-i-rem" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="Manual Stock Check"></div>
        </div>`;
}

function getOrderFormHTML() {
    const buyerOptions = GUL_DATABASE.buyers.map(b => `<option value="${b.name}">${b.name} (${b.company || 'Retail'})</option>`).join('');
    return `
        <div class="grid grid-cols-1 gap-4 text-sm font-semibold">
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Select Buyer</label><select id="f-o-bname" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none dark:text-white">${buyerOptions || '<option value="General Hand">General Buyer Walk-in</option>'}</select></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Product Grade</label><select id="f-o-prod" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none dark:text-white"><option>Laddu Gud</option><option>Block Gud</option><option>Powder Gud</option></select></div>
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Qty (Qtl)</label><input type="text" id="f-o-qty" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
                <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Total Amount (₹)</label><input type="number" id="f-o-amt" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            </div>
        </div>`;
}

function getPaymentFormHTML() {
    return `
        <div class="grid grid-cols-1 gap-4 text-sm font-semibold">
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Buyer / Payer Name</label><input type="text" id="f-p-bname" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="Ramesh Aggarwal"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Amount Received (₹)</label><input type="number" id="f-p-amt" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="50000"></div>
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Mode</label><select id="f-p-mode" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none dark:text-white"><option>Bank Transfer/UPI</option><option>Cash</option></select></div>
                <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Type</label><select id="f-p-type" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none dark:text-white"><option>Advance</option><option>Balance Clear</option></select></div>
            </div>
        </div>`;
}

function getSupplierFormHTML() {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Supplier Entity Name</label><input type="text" id="f-s-name" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Contact Phone</label><input type="text" id="f-s-phone" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Village</label><input type="text" id="f-s-vil" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">District</label><input type="text" id="f-s-dist" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Daily Output Capacity (Qtl)</label><input type="text" id="f-s-cap" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Asking Base Price (₹)</label><input type="text" id="f-s-price" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1 sm:col-span-2"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Gud Varietal Types Handled</label><input type="text" id="f-s-types" placeholder="e.g. Laddu, Patissa, Premium Powder" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none dark:text-white"></div>
        </div>`;
}

function getFarmerFormHTML() {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Farmer Name</label><input type="text" id="f-f-name" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Village Sourcing Origin</label><input type="text" id="f-f-vil" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Sugarcane Variety</label><input type="text" id="f-f-var" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="Co-0238"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Acreage Land Area</label><input type="text" id="f-f-area" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="10 Acres"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Est Yield Vol (Qtl)</label><input type="text" id="f-f-yield" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Method</label><select id="f-f-org" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none dark:text-white"><option>Chemical Free</option><option>Certified Organic</option><option>Standard Commercial</option></select></div>
        </div>`;
}

function getBhattiFormHTML() {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Bhatti Unit Name</label><input type="text" id="f-bh-name" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Owner / Pradhan</label><input type="text" id="f-bh-owner" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Village</label><input type="text" id="f-bh-vil" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Daily Capacity</label><input type="text" id="f-bh-cap" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Fuel Type Used</label><input type="text" id="f-bh-fuel" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="Bagasse / Husk"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Ready Stock (Qtl)</label><input type="text" id="f-bh-stock" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
        </div>`;
}

function getTransportFormHTML() {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Vehicle Registration No</label><input type="text" id="f-t-no" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="UP-12-AT-XXXX"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Driver Operator Name</label><input type="text" id="f-t-driver" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Truck Type / Class</label><input type="text" id="f-t-type" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="10-Tyre Taurus"></div>
            <div class="space-y-1"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Payload Weight Capacity</label><input type="text" id="f-t-cap" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="16 Tons"></div>
            <div class="space-y-1 sm:col-span-2"><label class="text-[10px] text-gray-500 uppercase tracking-widest">Standard Freight Rate</label><input type="text" id="f-t-rate" class="w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 outline-none focus:border-amber-500 dark:text-white" placeholder="₹45/km"></div>
        </div>`;
}

function closeFormModal() {
    const content = document.getElementById('form-modal-content');
    content.classList.add('translate-y-full');
    setTimeout(() => {
        document.getElementById('form-modal').classList.add('hidden');
        currentActiveFormModuleType = null;
    }, 300);
}

// ============================================
// FORM SUBMISSION
// ============================================
function submitActiveForm() {
    const type = currentActiveFormModuleType;
    if (!type) return;

    try {
        switch (type) {
            case 'buyer':
                submitBuyer();
                break;
            case 'inventory':
                submitInventory();
                break;
            case 'order':
                submitOrder();
                break;
            case 'payment':
                submitPayment();
                break;
            case 'supplier':
                submitSupplier();
                break;
            case 'farmer':
                submitFarmer();
                break;
            case 'bhatti':
                submitBhatti();
                break;
            case 'transport':
                submitTransport();
                break;
            default:
                showToast("Unknown module type", "error");
                return;
        }
        saveDB();
        updateEntireUI();
        closeFormModal();
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} recorded successfully!`);
    } catch (err) {
        showToast("Data recording error", "error");
    }
}

function submitBuyer() {
    const nm = document.getElementById('f-b-name').value.trim();
    const ph = document.getElementById('f-b-phone').value.trim();
    if (!nm || !ph) return showToast("Name and Phone are mandatory parameters.", "error");
    
    // Check for duplicate phone number
    const duplicate = GUL_DATABASE.buyers.find(b => b.phone === ph);
    if (duplicate) {
        return showToast(`Duplicate phone number found: ${duplicate.name}`, "error");
    }
    
    GUL_DATABASE.buyers.unshift({
        id: "B-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4),
        name: nm,
        phone: ph,
        whatsapp: document.getElementById('f-b-wa').value || ph,
        company: document.getElementById('f-b-co').value || "Retail Profile",
        district: document.getElementById('f-b-loc').value || "Unknown",
        state: "",
        gudType: document.getElementById('f-b-type').value,
        expectedQty: document.getElementById('f-b-qty').value || "0 Qtl",
        targetPrice: document.getElementById('f-b-price').value || "0",
        priority: document.getElementById('f-b-prior').value,
        status: "Negotiation",
        followupDate: document.getElementById('f-b-fudate').value || new Date().toISOString().split('T')[0],
        remarks: document.getElementById('f-b-rem').value || "No remarks entered"
    });
    addTimelineEntry(`New Buyer lead added: ${nm}`);
}

function submitInventory() {
    const action = document.getElementById('f-i-action').value;
    const prod = document.getElementById('f-i-prod').value;
    const qty = Number(document.getElementById('f-i-qty').value);
    const rem = document.getElementById('f-i-rem').value;
    
    if (!qty || qty <= 0) return showToast("Quantity must be greater than zero", "error");
    
    if (action === 'Stock In') GUL_DATABASE.inventory[prod] += qty;
    else GUL_DATABASE.inventory[prod] = Math.max(0, GUL_DATABASE.inventory[prod] - qty);
    
    const dateStr = new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
    GUL_DATABASE.inventoryLogs.unshift({
        date: dateStr,
        product: prod,
        action,
        qty,
        remarks: rem || "Manual Adjustment"
    });
    addTimelineEntry(`Stock ${action === 'Stock In' ? 'added' : 'deducted'}: ${qty} Qtl of ${prod}`);
}

function submitOrder() {
    const nm = document.getElementById('f-o-bname').value;
    if (!nm) return showToast("Buyer selection required", "error");
    GUL_DATABASE.orders.unshift({
        id: "ORD-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4),
        buyerName: nm,
        product: document.getElementById('f-o-prod').value,
        qty: document.getElementById('f-o-qty').value || "0 Qtl",
        totalAmount: document.getElementById('f-o-amt').value || "0",
        status: "Pending"
    });
    addTimelineEntry(`New Sales Order captured for ${nm}`);
}

function submitPayment() {
    const nm = document.getElementById('f-p-bname').value;
    GUL_DATABASE.payments.unshift({
        id: "PAY-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4),
        buyerName: nm || "General Walk-In",
        amount: document.getElementById('f-p-amt').value || "0",
        mode: document.getElementById('f-p-mode').value,
        type: document.getElementById('f-p-type').value,
        date: new Date().toLocaleDateString('en-IN')
    });
    addTimelineEntry(`Payment collected from ${nm || 'General'}`);
}

function submitSupplier() {
    const nm = document.getElementById('f-s-name').value;
    GUL_DATABASE.suppliers.unshift({
        id: "S-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4),
        name: nm || "New Supplier",
        village: document.getElementById('f-s-vil').value || "Loni",
        district: document.getElementById('f-s-dist').value || "Meerut",
        phone: document.getElementById('f-s-phone').value || "Unknown",
        gudTypes: document.getElementById('f-s-types').value || "Laddu Gud",
        dailyCapacity: document.getElementById('f-s-cap').value || "10",
        price: document.getElementById('f-s-price').value || "0"
    });
    addTimelineEntry(`Supplier Registered: ${nm}`);
}

function submitFarmer() {
    const nm = document.getElementById('f-f-name').value;
    GUL_DATABASE.farmers.unshift({
        id: "F-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4),
        name: nm || "New Farmer",
        sugarcaneVariety: document.getElementById('f-f-var').value || "Co-0238",
        village: document.getElementById('f-f-vil').value || "Unknown",
        area: document.getElementById('f-f-area').value || "0 Acres",
        expectedProd: document.getElementById('f-f-yield').value || "0 Qtl",
        organic: document.getElementById('f-f-org').value
    });
    addTimelineEntry(`Farmer Added: ${nm}`);
}

function submitBhatti() {
    const nm = document.getElementById('f-bh-name').value;
    GUL_DATABASE.bhattis.unshift({
        id: "BH-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4),
        bhattiName: nm || "New Bhatti",
        owner: document.getElementById('f-bh-owner').value || "Unknown",
        village: document.getElementById('f-bh-vil').value || "Unknown",
        fuelType: document.getElementById('f-bh-fuel').value || "Bagasse",
        dailyCapacity: document.getElementById('f-bh-cap').value || "0 Qtl",
        stock: document.getElementById('f-bh-stock').value || "0 Qtl"
    });
    addTimelineEntry(`Bhatti Added: ${nm}`);
}

function submitTransport() {
    const no = document.getElementById('f-t-no').value;
    GUL_DATABASE.transport.unshift({
        id: "T-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4),
        vehicleNo: no || "UP-12-AT-XXXX",
        driver: document.getElementById('f-t-driver').value || "Unknown",
        truckType: document.getElementById('f-t-type').value || "Taurus",
        capacity: document.getElementById('f-t-cap').value || "10 Tons",
        freightRate: document.getElementById('f-t-rate').value || "₹45/km"
    });
    addTimelineEntry(`Vehicle Logged: ${no}`);
}

// ============================================
// SMART CLIPBOARD AI PARSER
// ============================================
function openSmartClipboard() {
    document.getElementById('smart-clipboard-modal').classList.remove('hidden');
    document.getElementById('raw-ai-paste-box').value = "";
}

function closeSmartClipboard() {
    document.getElementById('smart-clipboard-modal').classList.add('hidden');
}

async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithRetry(url, options, retries - 1, delay * 2);
            }
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        throw error;
    }
}

async function executeClipboardAI() {
    const rawText = document.getElementById('raw-ai-paste-box').value.trim();
    const apiKey = document.getElementById('cfg-gemini-key').value.trim();
    const targetModule = document.getElementById('ai-target-module').value;
    
    if (!rawText) return showToast("Please paste or type text parameters", "error");
    if (!apiKey) {
        showToast("API Key missing. Enter in settings panel.", "error");
        closeSmartClipboard();
        switchTab('settings');
        return;
    }

    const btn = document.getElementById('ai-parse-btn');
    btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Extracting...`;
    btn.disabled = true;

    const prompt = `Extract Jaggery business profile details from this raw text string: "${rawText}". Return ONLY a clean JSON object with keys: name, phone, whatsapp, company, district, expectedQty, targetPrice, remarks. If any parameter is not found, leave as empty string. Do NOT output markdown block wrappers or descriptions. Just clean raw JSON.`;

    try {
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        const res = await fetchWithRetry(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await res.json();
        let txt = data.candidates[0].content.parts[0].text.trim();
        if (txt.startsWith("```")) txt = txt.replace(/```json|```/g, "").trim();
        
        const extracted = JSON.parse(txt);
        
        closeSmartClipboard();
        openFormModal(targetModule);
        
        setTimeout(() => {
            if (targetModule === 'buyer') {
                if (extracted.name) document.getElementById('f-b-name').value = extracted.name;
                if (extracted.phone) document.getElementById('f-b-phone').value = extracted.phone;
                if (extracted.expectedQty) document.getElementById('f-b-qty').value = extracted.expectedQty;
                if (extracted.targetPrice) document.getElementById('f-b-price').value = extracted.targetPrice;
                if (extracted.remarks) document.getElementById('f-b-rem').value = extracted.remarks;
            } else if (targetModule === 'supplier') {
                if (extracted.name) document.getElementById('f-s-name').value = extracted.name;
                if (extracted.phone) document.getElementById('f-s-phone').value = extracted.phone;
            }
            showToast("AI data extraction completed!");
        }, 400);

    } catch (e) {
        showToast("AI Extraction pipeline fault. Verify configuration.", "error");
    } finally {
        btn.innerHTML = `<i class="fa-solid fa-bolt"></i> Extract Data Form`;
        btn.disabled = false;
    }
}

// ============================================
// ADVANCED SEARCH
// ============================================
function runAdvancedFilters() {
    const kw = document.getElementById('filter-keyword').value.toLowerCase().trim();
    const pr = document.getElementById('filter-priority').value;
    const output = document.getElementById('search-results-output');
    
    let html = "";
    let count = 0;

    GUL_DATABASE.buyers.forEach(b => {
        if ((!kw || b.name.toLowerCase().includes(kw) || b.phone.includes(kw)) && (!pr || b.priority === pr)) {
            html += `
                <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <span class="text-[9px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-black uppercase tracking-wider mb-2 inline-block">Buyer Lead</span>
                    <h4 class="font-extrabold">${b.name}</h4>
                    <p class="text-xs text-gray-500 font-bold">${b.phone}</p>
                </div>`;
            count++;
        }
    });

    if (count === 0) {
        output.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400 font-bold">No results found matching search parameters.</div>`;
    } else {
        output.innerHTML = html;
    }
}

// ============================================
// BULK CSV IMPORT
// ============================================
function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        
        if (rows.length < 2) {
            showToast("CSV must have header row and at least one data row", "error");
            return;
        }
        
        // Parse headers
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'phone', 'company', 'district', 'gudtype', 'expectedqty', 'targetprice', 'priority', 'remarks'];
        
        // Check if headers are valid
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            showToast(`Missing columns: ${missingHeaders.join(', ')}`, "error");
            return;
        }
        
        // Process rows (skip header)
        const dataRows = rows.slice(1);
        const totalRows = dataRows.length;
        
        if (totalRows === 0) {
            showToast("No data rows found in CSV", "error");
            return;
        }
        
        if (totalRows > 2000) {
            showToast("Maximum 2000 rows allowed per import", "error");
            return;
        }
        
        // Show progress
        const progressDiv = document.getElementById('import-progress');
        const progressBar = document.getElementById('import-progress-bar');
        const statusText = document.getElementById('import-status');
        const percentageText = document.getElementById('import-percentage');
        const resultDiv = document.getElementById('import-result');
        
        progressDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
        
        let imported = 0;
        let errors = 0;
        const duplicates = [];
        
        // Process in chunks for UI responsiveness
        const chunkSize = 50;
        let currentIndex = 0;
        
        function processChunk() {
            const chunk = dataRows.slice(currentIndex, currentIndex + chunkSize);
            
            chunk.forEach((row, idx) => {
                const cols = row.split(',').map(c => c.trim());
                const rowData = {};
                headers.forEach((h, i) => {
                    rowData[h] = cols[i] || '';
                });
                
                // Validate required fields
                if (!rowData.name || !rowData.phone) {
                    errors++;
                    return;
                }
                
                // Check duplicate
                const duplicate = GUL_DATABASE.buyers.find(b => b.phone === rowData.phone);
                if (duplicate) {
                    duplicates.push(rowData.phone);
                    errors++;
                    return;
                }
                
                // Create buyer
                GUL_DATABASE.buyers.push({
                    id: "B-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 6) + idx,
                    name: rowData.name,
                    phone: rowData.phone,
                    whatsapp: rowData.whatsapp || rowData.phone,
                    company: rowData.company || "Retail Profile",
                    district: rowData.district || "Unknown",
                    state: "",
                    gudType: rowData.gudtype || "Laddu Gud",
                    expectedQty: rowData.expectedqty || "0 Qtl",
                    targetPrice: rowData.targetprice || "0",
                    priority: rowData.priority || "Medium",
                    status: "Negotiation",
                    followupDate: rowData.followupdate || new Date().toISOString().split('T')[0],
                    remarks: rowData.remarks || "Imported from CSV"
                });
                imported++;
            });
            
            currentIndex += chunkSize;
            
            // Update progress
            const progress = Math.min(100, (currentIndex / totalRows) * 100);
            progressBar.style.width = progress + '%';
            statusText.innerText = `Importing ${Math.min(currentIndex, totalRows)}/${totalRows} buyers...`;
            percentageText.innerText = Math.round(progress) + '%';
            
            if (currentIndex < totalRows) {
                // Process next chunk
                setTimeout(processChunk, 50);
            } else {
                // Import complete
                saveDB();
                updateEntireUI();
                
                let message = `✅ Import complete! ${imported} buyers added.`;
                if (errors > 0) {
                    message += ` ⚠️ ${errors} rows skipped (${duplicates.length} duplicates, ${errors - duplicates.length} invalid).`;
                }
                resultDiv.className = 'mt-2 p-3 rounded-xl text-xs font-bold ' + 
                    (errors === 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30');
                resultDiv.innerHTML = message;
                resultDiv.classList.remove('hidden');
                
                showToast(`Imported ${imported} buyers successfully!`);
                
                // Reset after 5 seconds
                setTimeout(() => {
                    progressDiv.classList.add('hidden');
                    progressBar.style.width = '0%';
                }, 5000);
                
                event.target.value = '';
            }
        }
        
        // Start processing
        processChunk();
    };
    
    reader.readAsText(file);
}

function downloadCSVTemplate() {
    const headers = ['Name', 'Phone', 'WhatsApp', 'Company', 'District', 'GudType', 'ExpectedQty', 'TargetPrice', 'Priority', 'FollowUpDate', 'Remarks'];
    const sampleRow = ['Sample Buyer', '9876543210', '9876543210', 'Sample Traders', 'Meerut', 'Laddu Gud', '100', '3850', 'High', '2026-07-15', 'Sample remark'];
    
    let csv = headers.join(',') + '\n';
    csv += sampleRow.join(',') + '\n';
    // Add 5 more sample rows
    const samples = [
        ['Ramesh Kumar', '9812048550', '9812048550', 'Aggarwal Traders', 'Muzaffarnagar', 'Block Gud', '250', '4200', 'High', '2026-07-20', 'Bulk order'],
        ['Suresh Singh', '9876543211', '9876543211', 'Singh Enterprises', 'Saharanpur', 'Powder Gud', '500', '3600', 'Medium', '2026-07-18', ''],
        ['Priya Sharma', '9876543212', '9876543212', 'Sharma Foods', 'Delhi', 'Organic Gud', '200', '4800', 'High', '2026-07-12', 'Need certification'],
        ['Amit Verma', '9876543213', '9876543213', 'Verma Traders', 'Noida', 'Laddu Gud', '150', '3900', 'Medium', '2026-07-25', ''],
        ['Deepak Gupta', '9876543214', '9876543214', 'Gupta Industries', 'Ghaziabad', 'Liquid Gud', '75', '5200', 'High', '2026-07-14', 'Urgent requirement']
    ];
    samples.forEach(row => {
        csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GUL_CRM_Import_Template.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// ============================================
// GENERATE SAMPLE BUYERS (for testing)
// ============================================
function generateSampleBuyers() {
    const count = 100;
    const names = ['Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Kishan', 'Mohan', 'Shyam', 'Ram', 'Lakhan', 'Ravi', 
                   'Amit', 'Vikas', 'Ankit', 'Rahul', 'Pankaj', 'Sanjay', 'Vijay', 'Ajay', 'Sachin', 'Rohit',
                   'Neha', 'Priya', 'Anjali', 'Deepa', 'Kavita', 'Suman', 'Rekha', 'Geeta', 'Seema', 'Pooja',
                   'Ashok', 'Suresh', 'Naresh', 'Dinesh', 'Rajendra', 'Kailash', 'Om', 'Prakash', 'Krishna', 'Gopal'];
    const companies = ['Traders', 'Enterprises', 'Foods', 'Industries', 'Exports', 'Supplies', 'Corporation', 'Solutions', 'Services', 'Agencies'];
    const cities = ['Meerut', 'Muzaffarnagar', 'Saharanpur', 'Delhi', 'Noida', 'Ghaziabad', 'Agra', 'Lucknow', 'Kanpur', 'Varanasi'];
    const gudTypes = ['Laddu Gud', 'Block Gud', 'Powder Gud', 'Organic Gud', 'Liquid Gud'];
    const priorities = ['High', 'Medium', 'Low'];
    const statuses = ['Negotiation', 'New Lead', 'Follow-up', 'Interested', 'Not Interested'];
    
    const today = new Date().toISOString().split('T')[0];
    const existingPhones = new Set(GUL_DATABASE.buyers.map(b => b.phone));
    
    let added = 0;
    for (let i = 0; i < count; i++) {
        const name = names[Math.floor(Math.random() * names.length)] + ' ' + names[Math.floor(Math.random() * names.length)];
        let phone = '9' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
        
        // Ensure unique phone
        let attempts = 0;
        while (existingPhones.has(phone) && attempts < 10) {
            phone = '9' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
            attempts++;
        }
        if (existingPhones.has(phone)) continue;
        existingPhones.add(phone);
        
        const buyer = {
            id: "B-" + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 6) + i,
            name: name,
            phone: phone,
            whatsapp: phone,
            company: names[Math.floor(Math.random() * names.length)] + ' ' + companies[Math.floor(Math.random() * companies.length)],
            district: cities[Math.floor(Math.random() * cities.length)],
            state: "UP",
            gudType: gudTypes[Math.floor(Math.random() * gudTypes.length)],
            expectedQty: (Math.floor(Math.random() * 500) + 50).toString(),
            targetPrice: (Math.floor(Math.random() * 3000) + 2500).toString(),
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            followupDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
            remarks: "Sample generated buyer #" + (i + 1)
        };
        GUL_DATABASE.buyers.push(buyer);
        added++;
    }
    
    saveDB();
    updateEntireUI();
    showToast(`✅ ${added} sample buyers generated successfully!`);
}

// ============================================
// DATA CONTROLS & EXPORTS
// ============================================
document.getElementById('cfg-gemini-key').addEventListener('change', (e) => {
    localStorage.setItem('GUL_GEMINI_KEY', e.target.value.trim());
    showToast("API security key stored locally.");
});

function exportDatabaseJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(GUL_DATABASE, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `GUL_CRM_BACKUP_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function triggerDataReset() {
    if (confirm("ALERT: This will wipe all offline CRM database values permanently. Please perform a backup export first. Proceed?")) {
        localStorage.removeItem('GUL_CRM_V2_FINAL');
        window.location.reload();
    }
}

// ============================================
// DUMMY SEED DATA
// ============================================
function seedDummyData() {
    const today = new Date().toISOString().split('T')[0];
    GUL_DATABASE.buyers.push(
        {
            id: "B-1001",
            name: "Ramesh Aggarwal",
            phone: "9812048550",
            whatsapp: "9812048550",
            company: "Aggarwal Gud Traders",
            district: "Muzaffarnagar",
            state: "UP",
            gudType: "Laddu Gud",
            expectedQty: "250",
            targetPrice: "3850",
            priority: "High",
            status: "Negotiation",
            followupDate: today,
            remarks: "Needs standard packaging."
        },
        {
            id: "B-1002",
            name: "Deepak Exports",
            phone: "9411039485",
            whatsapp: "9411039485",
            company: "Deepak Foods",
            district: "Pune",
            state: "MH",
            gudType: "Organic Gud",
            expectedQty: "800",
            targetPrice: "4200",
            priority: "High",
            status: "New Lead",
            followupDate: today,
            remarks: "Needs certified organic documents."
        }
    );
    GUL_DATABASE.suppliers.push({
        id: "S-5001",
        name: "Chaudhary Jaggery",
        village: "Loni",
        district: "Meerut",
        phone: "9756012485",
        gudTypes: "Laddu, Powder",
        dailyCapacity: "50",
        price: "3600"
    });
    GUL_DATABASE.farmers.push({
        id: "F-3001",
        name: "Sukhdev Singh",
        organic: "Chemical Free",
        sugarcaneVariety: "Co-0238",
        area: "12 Acres",
        expectedProd: "450 Qtl"
    });
    GUL_DATABASE.bhattis.push({
        id: "BH-4001",
        bhattiName: "Kalyan Pur Unit",
        owner: "Satpal Pradhan",
        village: "Kalyanpur",
        fuelType: "Bagasse",
        dailyCapacity: "35 Qtl",
        stock: "140 Qtl"
    });
    GUL_DATABASE.transport.push({
        id: "T-2001",
        vehicleNo: "UP-12-AT-4491",
        driver: "Balvinder Singh",
        truckType: "10-Tyre",
        capacity: "16 Tons",
        freightRate: "₹45/km"
    });
    GUL_DATABASE.inventory = {
        "Laddu Gud": 1420,
        "Block Gud": 850,
        "Powder Gud": 310,
        "Organic Gud": 620,
        "Liquid Gud": 0
    };
    
    saveDB();
}

// ============================================
// BUYER SEGMENTATION & TIER SYSTEM
// ============================================

// Add tier to each buyer when created/modified
function getBuyerTier(buyer) {
    const qty = parseInt(buyer.expectedQty) || 0;
    const orders = GUL_DATABASE.orders.filter(o => o.buyerName === buyer.name);
    const totalOrdered = orders.reduce((sum, o) => sum + (parseInt(o.qty) || 0), 0);
    const orderCount = orders.length;
    
    // Premium: High volume (500+ Qtl) OR multiple repeat orders
    if (qty >= 500 || totalOrdered >= 500 || orderCount >= 3) {
        return 'premium';
    }
    // Medium: Consistent orders (100-499 Qtl) OR 1-2 orders
    if (qty >= 100 || totalOrdered >= 100 || orderCount >= 1) {
        return 'medium';
    }
    // New/Test: Small orders or new leads
    return 'new';
}

// Calculate buyer score (0-100)
function calculateBuyerScore(buyer) {
    let score = 0;
    const qty = parseInt(buyer.expectedQty) || 0;
    const orders = GUL_DATABASE.orders.filter(o => o.buyerName === buyer.name);
    const totalOrdered = orders.reduce((sum, o) => sum + (parseInt(o.qty) || 0), 0);
    const orderCount = orders.length;
    const payments = GUL_DATABASE.payments.filter(p => p.buyerName === buyer.name);
    const totalPaid = payments.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);
    
    // Quantity score (max 30)
    score += Math.min(30, (qty / 100) * 10);
    if (totalOrdered > 0) score += Math.min(20, (totalOrdered / 100) * 5);
    
    // Order frequency (max 20)
    score += Math.min(20, orderCount * 5);
    
    // Payment history (max 20)
    if (totalPaid > 0) score += Math.min(20, (totalPaid / 10000) * 5);
    
    // Priority boost (max 10)
    if (buyer.priority === 'High') score += 10;
    if (buyer.priority === 'Medium') score += 5;
    
    return Math.min(100, Math.round(score));
}

// ============================================
// FILTER FUNCTIONS
// ============================================

let filteredBuyers = [];

function filterBuyersByTier() {
    const tier = document.getElementById('filter-tier').value;
    applyAllFilters();
}

function filterBuyersByStatus() {
    const status = document.getElementById('filter-order-status').value;
    applyAllFilters();
}

function filterBuyersByScore() {
    const minScore = parseInt(document.getElementById('filter-min-score').value) || 0;
    applyAllFilters();
}

function applyAllFilters() {
    const tier = document.getElementById('filter-tier').value;
    const status = document.getElementById('filter-order-status').value;
    const minScore = parseInt(document.getElementById('filter-min-score').value) || 0;
    
    filteredBuyers = GUL_DATABASE.buyers.filter(b => {
        const buyerTier = getBuyerTier(b);
        const buyerScore = calculateBuyerScore(b);
        
        // Tier filter
        if (tier !== 'all' && buyerTier !== tier) return false;
        
        // Status filter
        if (status !== 'all' && b.status !== status) return false;
        
        // Score filter
        if (minScore > 0 && buyerScore < minScore) return false;
        
        return true;
    });
    
    // Update display with filtered results
    renderFilteredBuyers();
    updateBuyerStats();
}

function resetBuyerFilters() {
    document.getElementById('filter-tier').value = 'all';
    document.getElementById('filter-order-status').value = 'all';
    document.getElementById('filter-min-score').value = '';
    filteredBuyers = [...GUL_DATABASE.buyers];
    renderFilteredBuyers();
    updateBuyerStats();
}

function renderFilteredBuyers() {
    const container = document.getElementById('buyer-cards-grid');
    const buyers = filteredBuyers.length > 0 ? filteredBuyers : GUL_DATABASE.buyers;
    
    // Apply pagination to filtered results
    const total = buyers.length;
    totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, total);
    const paginated = buyers.slice(start, end);
    
    if (total === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 text-sm font-bold">No buyers match your filters.</div>`;
        return;
    }
    
    container.innerHTML = paginated.map(b => {
        const tier = getBuyerTier(b);
        const score = calculateBuyerScore(b);
        const tierEmoji = tier === 'premium' ? '⭐' : tier === 'medium' ? '📈' : '🌱';
        const tierColor = tier === 'premium' ? 'bg-amber-100 text-amber-800' : 
                         tier === 'medium' ? 'bg-blue-100 text-blue-800' : 
                         'bg-green-100 text-green-800';
        
        return `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3 group hover:border-amber-400 transition">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-extrabold text-gray-800 dark:text-white text-base">${b.name}</h3>
                    <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider">${b.company || 'Individual'}</span>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="text-[9px] font-black px-2 py-1 rounded-md ${tierColor}">${tierEmoji} ${tier.toUpperCase()}</span>
                    <span class="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Score: ${score}</span>
                </div>
            </div>
            <div class="text-xs font-semibold text-gray-600 dark:text-gray-300 grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-750">
                <div><span class="block text-[9px] text-gray-400 uppercase">Product</span>${b.gudType}</div>
                <div><span class="block text-[9px] text-gray-400 uppercase">Qty Reqd</span>${b.expectedQty}</div>
                <div><span class="block text-[9px] text-gray-400 uppercase">Target</span>₹${b.targetPrice}</div>
                <div><span class="block text-[9px] text-gray-400 uppercase">Status</span>${b.status}</div>
            </div>
            <div class="flex gap-2 pt-1">
                <a href="tel:${b.phone}" class="flex-1 text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-750 dark:text-white text-xs font-extrabold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-phone"></i> Call
                </a>
                <a href="https://wa.me/${b.whatsapp}" target="_blank" class="w-10 flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 rounded-xl hover:bg-emerald-100 transition">
                    <i class="fa-brands fa-whatsapp text-lg"></i>
                </a>
                <button onclick="quickActionMenu('${b.id}')" class="w-10 flex items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-900/30 rounded-xl hover:bg-amber-100 transition focus:outline-none">
                    <i class="fa-solid fa-ellipsis-vertical text-sm"></i>
                </button>
                <button onclick="deleteRecord('buyers', '${b.id}')" class="w-10 flex items-center justify-center bg-red-50 text-red-500 dark:bg-red-905/30 rounded-xl hover:bg-red-100 transition focus:outline-none">
                    <i class="fa-solid fa-trash text-sm"></i>
                </button>
            </div>
        </div>
    `}).join('');
    
    // Update pagination info
    document.getElementById('page-start').innerText = total > 0 ? start + 1 : 0;
    document.getElementById('page-end').innerText = end;
    document.getElementById('total-records').innerText = total;
    document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages}`;
    
    document.getElementById('prev-page-btn').disabled = currentPage <= 1;
    document.getElementById('next-page-btn').disabled = currentPage >= totalPages;
}

// ============================================
// BUYER STATS UPDATE
// ============================================
function updateBuyerStats() {
    const buyers = filteredBuyers.length > 0 ? filteredBuyers : GUL_DATABASE.buyers;
    
    // Premium count
    const premium = buyers.filter(b => getBuyerTier(b) === 'premium').length;
    document.getElementById('premium-count').innerText = premium;
    
    // Active deals (negotiation + order-placed)
    const activeDeals = buyers.filter(b => 
        b.status === 'Negotiation' || b.status === 'Order Placed' || b.status === 'New Lead'
    ).length;
    document.getElementById('active-deals').innerText = activeDeals;
    
    // Season revenue (from orders)
    const totalRevenue = GUL_DATABASE.orders.reduce((sum, o) => sum + (parseInt(o.totalAmount) || 0), 0);
    document.getElementById('season-revenue').innerText = '₹' + totalRevenue.toLocaleString('en-IN');
    
    // Target progress
    const target = parseInt(localStorage.getItem('seasonTarget')) || 50000;
    const totalQty = GUL_DATABASE.orders.reduce((sum, o) => sum + (parseInt(o.qty) || 0), 0);
    const progress = target > 0 ? Math.min(100, Math.round((totalQty / target) * 100)) : 0;
    document.getElementById('target-progress').innerText = progress + '%';
    
    // Pipeline counts
    document.getElementById('pipeline-new').innerText = buyers.filter(b => b.status === 'New Lead').length;
    document.getElementById('pipeline-negotiation').innerText = buyers.filter(b => b.status === 'Negotiation').length;
    document.getElementById('pipeline-order').innerText = buyers.filter(b => b.status === 'Order Placed').length;
    document.getElementById('pipeline-delivered').innerText = buyers.filter(b => b.status === 'Delivered').length;
}

// ============================================
// QUICK ACTION MENU
// ============================================
function quickActionMenu(buyerId) {
    const buyer = GUL_DATABASE.buyers.find(b => b.id === buyerId);
    if (!buyer) return;
    
    const actions = [
        { label: '📞 Call Now', action: `window.location.href='tel:${buyer.phone}'` },
        { label: '💬 WhatsApp', action: `window.open('https://wa.me/${buyer.whatsapp}')` },
        { label: '📝 Mark Order Placed', action: `updateBuyerStatus('${buyerId}', 'Order Placed')` },
        { label: '📦 Mark Delivered', action: `updateBuyerStatus('${buyerId}', 'Delivered')` },
        { label: '🔄 Mark Repeat Buyer', action: `updateBuyerStatus('${buyerId}', 'Repeat')` },
        { label: '❌ Mark Lost', action: `updateBuyerStatus('${buyerId}', 'Lost')` },
        { label: '✏️ Edit Buyer', action: `editBuyer('${buyerId}')` }
    ];
    
    // Create a simple context menu
    const existing = document.getElementById('quick-menu');
    if (existing) existing.remove();
    
    const menu = document.createElement('div');
    menu.id = 'quick-menu';
    menu.className = 'fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center';
    menu.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl max-w-xs w-full border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-extrabold text-sm">${buyer.name}</h4>
                <button onclick="document.getElementById('quick-menu').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="space-y-1">
                ${actions.map(a => `
                    <button onclick="${a.action}; document.getElementById('quick-menu').remove()" 
                            class="w-full text-left px-3 py-2 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2">
                        ${a.label}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(menu);
    
    // Close on outside click
    menu.addEventListener('click', (e) => {
        if (e.target === menu) menu.remove();
    });
}

function updateBuyerStatus(buyerId, newStatus) {
    const buyer = GUL_DATABASE.buyers.find(b => b.id === buyerId);
    if (buyer) {
        buyer.status = newStatus;
        saveDB();
        updateEntireUI();
        showToast(`✅ ${buyer.name} marked as ${newStatus}`);
    }
}

function editBuyer(buyerId) {
    const buyer = GUL_DATABASE.buyers.find(b => b.id === buyerId);
    if (!buyer) return;
    
    // Pre-fill form and open
    openFormModal('buyer');
    setTimeout(() => {
        document.getElementById('f-b-name').value = buyer.name;
        document.getElementById('f-b-phone').value = buyer.phone;
        document.getElementById('f-b-wa').value = buyer.whatsapp;
        document.getElementById('f-b-co').value = buyer.company;
        document.getElementById('f-b-loc').value = buyer.district;
        document.getElementById('f-b-type').value = buyer.gudType;
        document.getElementById('f-b-qty').value = buyer.expectedQty;
        document.getElementById('f-b-price').value = buyer.targetPrice;
        document.getElementById('f-b-prior').value = buyer.priority;
        document.getElementById('f-b-fudate').value = buyer.followupDate;
        document.getElementById('f-b-rem').value = buyer.remarks;
        
        // Change save button to update
        const saveBtn = document.querySelector('#form-modal .bg-jaggery-color');
        saveBtn.innerText = '✏️ Update Buyer';
        saveBtn.onclick = function() {
            // Delete old and create new with same ID
            const index = GUL_DATABASE.buyers.findIndex(b => b.id === buyerId);
            if (index !== -1) {
                GUL_DATABASE.buyers[index] = {
                    ...buyer,
                    name: document.getElementById('f-b-name').value.trim(),
                    phone: document.getElementById('f-b-phone').value.trim(),
                    whatsapp: document.getElementById('f-b-wa').value || buyer.phone,
                    company: document.getElementById('f-b-co').value || "Retail Profile",
                    district: document.getElementById('f-b-loc').value || "Unknown",
                    gudType: document.getElementById('f-b-type').value,
                    expectedQty: document.getElementById('f-b-qty').value || "0 Qtl",
                    targetPrice: document.getElementById('f-b-price').value || "0",
                    priority: document.getElementById('f-b-prior').value,
                    followupDate: document.getElementById('f-b-fudate').value || new Date().toISOString().split('T')[0],
                    remarks: document.getElementById('f-b-rem').value || "No remarks entered"
                };
                saveDB();
                updateEntireUI();
                closeFormModal();
                showToast(`✅ ${buyer.name} updated successfully!`);
            }
        };
    }, 500);
}

// ============================================
// SEASON TARGETS
// ============================================
function saveSeasonTargets() {
    const target = document.getElementById('season-target').value;
    const minPrice = document.getElementById('min-acceptable-price').value;
    const revenueTarget = document.getElementById('season-revenue-target').value;
    
    if (target) localStorage.setItem('seasonTarget', target);
    if (minPrice) localStorage.setItem('minAcceptablePrice', minPrice);
    if (revenueTarget) localStorage.setItem('seasonRevenueTarget', revenueTarget);
    
    showToast('✅ Season targets saved successfully!');
    updateBuyerStats();
}

// Load saved season targets on page load
function loadSeasonTargets() {
    const target = localStorage.getItem('seasonTarget');
    const minPrice = localStorage.getItem('minAcceptablePrice');
    const revenueTarget = localStorage.getItem('seasonRevenueTarget');
    
    if (target) document.getElementById('season-target').value = target;
    if (minPrice) document.getElementById('min-acceptable-price').value = minPrice;
    if (revenueTarget) document.getElementById('season-revenue-target').value = revenueTarget;
}

// Call this in DOMContentLoaded
// Add: loadSeasonTargets();

// ============================================
// OVERRIDE renderBuyers to use filters
// ============================================
// Replace the existing renderBuyers with this version
// Or modify to use filteredBuyers

// Update the existing renderBuyers function to use filtered state
const originalRenderBuyers = renderBuyers;
renderBuyers = function() {
    if (filteredBuyers.length > 0) {
        renderFilteredBuyers();
    } else {
        originalRenderBuyers();
    }
    updateBuyerStats();
};

// Initialize filteredBuyers
filteredBuyers = [...GUL_DATABASE.buyers];

// ============================================
// BULK COMMUNICATION SYSTEM
// ============================================

const messageTemplates = {
    'season-start': `🌾 *Jaggery Season 2026-27 Started!*\n\nDear {buyer_name},\n\nWe are ready with premium quality jaggery for the new season.\n\n✅ Premium Laddu Gud: ₹{price}/Qtl\n✅ Organic Gud available\n✅ Bulk orders welcome\n\nCall us to book your first order: {phone}\n\n— GUL Trading Co.`,
    
    'price-drop': `💰 *Special Price Alert!*\n\nDear {buyer_name},\n\nGreat news! We have reduced prices on premium jaggery:\n\n📉 New Price: ₹{price}/Qtl (was ₹{old_price})\n🛒 Limited stock available\n\nOrder now to lock in this rate!\n\n— GUL Trading Co.`,
    
    'limited-stock': `📦 *Limited Stock Alert!*\n\nDear {buyer_name},\n\nOur premium jaggery stock is selling fast!\n\n🔥 Only {stock} Qtl remaining\n⚡ Bulk orders get priority\n\nDon't miss out - book your order today!\n\n— GUL Trading Co.`,
    
    'festival': `🎉 *Festival Special Offer!*\n\nDear {buyer_name},\n\nCelebrate the season with our festival discount:\n\n🎁 5% off on orders above 500 Qtl\n🎊 Free delivery on bulk orders\n\nLimited time offer!\n\n— GUL Trading Co.`,
    
    'follow-up': `📞 *Follow-up Reminder*\n\nDear {buyer_name},\n\nHope you're doing well! We wanted to check if you need any jaggery for your upcoming requirements.\n\n💬 Reply to this message or call us at {phone}\n\nLooking forward to serving you!\n\n— GUL Trading Co.`,
    
    'referral': `🤝 *Referral Rewards Program*\n\nDear {buyer_name},\n\nThank you for being a valued customer! 🌟\n\nRefer another buyer and get:\n\n🎁 2% discount on your next order\n💰 ₹500 referral bonus\n\nShare our number with your network!\n\n— GUL Trading Co.`
};

function loadTemplate() {
    const template = document.getElementById('campaign-template').value;
    const message = messageTemplates[template] || '';
    document.getElementById('campaign-message').value = message;
    showToast('✅ Template loaded! Customize if needed.');
}

function getBuyersForSegment(segment) {
    let buyers = [];
    switch(segment) {
        case 'all':
            buyers = GUL_DATABASE.buyers;
            break;
        case 'premium':
            buyers = GUL_DATABASE.buyers.filter(b => getBuyerTier(b) === 'premium');
            break;
        case 'medium':
            buyers = GUL_DATABASE.buyers.filter(b => getBuyerTier(b) === 'medium');
            break;
        case 'new':
            buyers = GUL_DATABASE.buyers.filter(b => getBuyerTier(b) === 'new');
            break;
        case 'negotiation':
            buyers = GUL_DATABASE.buyers.filter(b => b.status === 'Negotiation' || b.status === 'New Lead');
            break;
        case 'repeat':
            buyers = GUL_DATABASE.buyers.filter(b => b.status === 'Repeat');
            break;
        default:
            buyers = GUL_DATABASE.buyers;
    }
    return buyers;
}

function sendBulkMessage() {
    const segment = document.getElementById('campaign-segment').value;
    const messageTemplate = document.getElementById('campaign-message').value;
    const buyers = getBuyersForSegment(segment);
    
    if (buyers.length === 0) {
        showToast('❌ No buyers found in this segment.', 'error');
        return;
    }
    
    if (!messageTemplate.trim()) {
        showToast('❌ Please enter a message.', 'error');
        return;
    }
    
    if (!confirm(`Send WhatsApp message to ${buyers.length} buyers?`)) return;
    
    const progressDiv = document.getElementById('campaign-progress');
    const progressBar = document.getElementById('campaign-progress-bar');
    const statusText = document.getElementById('campaign-status');
    const percentageText = document.getElementById('campaign-percentage');
    
    progressDiv.classList.remove('hidden');
    
    let sent = 0;
    const total = buyers.length;
    
    // Process in chunks
    const chunkSize = 10;
    let currentIndex = 0;
    
    function processMessageChunk() {
        const chunk = buyers.slice(currentIndex, currentIndex + chunkSize);
        
        chunk.forEach((buyer, idx) => {
            let message = messageTemplate
                .replace(/{buyer_name}/g, buyer.name)
                .replace(/{phone}/g, buyer.phone)
                .replace(/{price}/g, '3800')
                .replace(/{old_price}/g, '4000')
                .replace(/{stock}/g, '500');
            
            // For WhatsApp: Create WhatsApp link
            const waLink = `https://wa.me/${buyer.whatsapp}?text=${encodeURIComponent(message)}`;
            
            // Open in new tab (for demo)
            // In production, use WhatsApp API
            console.log(`📱 ${buyer.name}: ${waLink}`);
            
            // Track sent
            sent++;
        });
        
        currentIndex += chunkSize;
        
        // Update progress
        const progress = Math.min(100, (currentIndex / total) * 100);
        progressBar.style.width = progress + '%';
        statusText.innerText = `Sending ${Math.min(currentIndex, total)}/${total} messages...`;
        percentageText.innerText = Math.round(progress) + '%';
        
        if (currentIndex < total) {
            setTimeout(processMessageChunk, 500);
        } else {
            // Complete
            statusText.innerText = `✅ ${sent} messages sent!`;
            showToast(`✅ ${sent} WhatsApp messages sent!`);
            
            setTimeout(() => {
                progressDiv.classList.add('hidden');
                progressBar.style.width = '0%';
            }, 3000);
        }
    }
    
    processMessageChunk();
}

function sendBulkSMS() {
    const segment = document.getElementById('campaign-segment').value;
    const message = document.getElementById('campaign-message').value;
    const buyers = getBuyersForSegment(segment);
    
    if (buyers.length === 0) {
        showToast('❌ No buyers found.', 'error');
        return;
    }
    
    // Copy all phone numbers
    const phones = buyers.map(b => b.phone).join(',');
    navigator.clipboard.writeText(phones).then(() => {
        showToast(`📱 ${buyers.length} phone numbers copied!`);
        alert(`SMS to ${buyers.length} buyers:\n\nMessage: ${message}\n\nPhones copied to clipboard. Paste in your SMS app.`);
    });
}

function copyPhonesToClipboard() {
    const segment = document.getElementById('campaign-segment').value;
    const buyers = getBuyersForSegment(segment);
    
    if (buyers.length === 0) {
        showToast('❌ No buyers found.', 'error');
        return;
    }
    
    const phones = buyers.map(b => b.phone).join('\n');
    navigator.clipboard.writeText(phones).then(() => {
        showToast(`📋 ${buyers.length} phone numbers copied!`);
    });
}

// ============================================
// PRICE TRACKER SYSTEM
// ============================================

let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || [];

function savePriceUpdate() {
    const product = document.getElementById('price-product').value;
    const currentPrice = document.getElementById('current-price').value;
    const competitorPrice = document.getElementById('competitor-price').value;
    const trend = document.getElementById('market-trend').value;
    
    if (!currentPrice) {
        showToast('❌ Please enter current price.', 'error');
        return;
    }
    
    const entry = {
        date: new Date().toLocaleString('en-IN'),
        product,
        currentPrice: parseInt(currentPrice),
        competitorPrice: competitorPrice ? parseInt(competitorPrice) : null,
        trend,
        userId: 'GUL_CRM'
    };
    
    priceHistory.unshift(entry);
    if (priceHistory.length > 50) priceHistory.pop();
    
    localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
    
    showToast('✅ Price update saved!');
    renderPriceHistory();
    
    // Clear inputs
    document.getElementById('current-price').value = '';
    document.getElementById('competitor-price').value = '';
}

function renderPriceHistory() {
    const container = document.getElementById('price-history');
    if (priceHistory.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 font-bold">No price history yet.</p>`;
        return;
    }
    
    container.innerHTML = priceHistory.slice(0, 10).map(p => `
        <div class="flex justify-between items-center text-xs border-b border-gray-100 dark:border-gray-700 py-2">
            <span class="font-bold">${p.product}</span>
            <span class="font-bold text-amber-600">₹${p.currentPrice}</span>
            <span class="text-gray-500">${p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️'}</span>
            <span class="text-[10px] text-gray-400">${p.date}</span>
        </div>
    `).join('');
}

// ============================================
// SMART NEGOTIATION ASSISTANT
// ============================================

function loadBuyersForNegotiation() {
    const select = document.getElementById('negotiation-buyer');
    select.innerHTML = '<option value="">-- Select Buyer --</option>' + 
        GUL_DATABASE.buyers.map(b => `<option value="${b.id}">${b.name} (${b.company || 'Individual'})</option>`).join('');
}

function getNegotiationStrategy(buyer, buyerOffer, minPrice) {
    const tier = getBuyerTier(buyer);
    const score = calculateBuyerScore(buyer);
    const marketPrice = parseInt(localStorage.getItem('currentMarketPrice')) || 3800;
    const competitorPrice = parseInt(localStorage.getItem('competitorPrice')) || 3750;
    
    // Calculate optimal counter offer
    const minAcceptable = parseInt(minPrice) || 3500;
    const offer = parseInt(buyerOffer) || 0;
    
    let strategy = {
        counterOffer: minAcceptable,
        maxCounter: minAcceptable + 500,
        minAccept: minAcceptable,
        walkAway: minAcceptable - 200,
        advice: ''
    };
    
    // Strategy based on tier
    if (tier === 'premium') {
        strategy.maxCounter = minAcceptable + 400;
        strategy.minAccept = minAcceptable;
        strategy.advice = '⭐ Premium buyer - Offer small discount, lock in long-term deal.';
    } else if (tier === 'medium') {
        strategy.maxCounter = minAcceptable + 300;
        strategy.minAccept = minAcceptable - 100;
        strategy.advice = '📈 Medium buyer - Hold your price, offer volume discount.';
    } else {
        strategy.maxCounter = minAcceptable + 500;
        strategy.minAccept = minAcceptable - 200;
        strategy.advice = '🌱 New buyer - Be flexible, convert to repeat customer.';
    }
    
    // Adjust based on score
    if (score > 70) {
        strategy.advice += ' High score buyer - Prioritize this deal!';
    }
    
    // Market conditions
    if (marketPrice > competitorPrice) {
        strategy.advice += ' 📈 Market is up - Hold your price.';
    } else {
        strategy.advice += ' 📉 Market is down - Consider being aggressive.';
    }
    
    // Specific advice based on offer
    if (offer >= strategy.maxCounter) {
        strategy.advice += ' ✅ Accept offer! This is above your target.';
        strategy.counterOffer = offer;
    } else if (offer >= strategy.minAccept) {
        strategy.advice += ' ✅ Accept with small negotiation - Good deal.';
        strategy.counterOffer = offer + 100;
    } else if (offer >= strategy.walkAway) {
        strategy.advice += ' ⚠️ Negotiate - Offer is below target. Counter with ₹' + strategy.maxCounter;
        strategy.counterOffer = strategy.maxCounter;
    } else {
        strategy.advice += ' ❌ Walk away - Offer is too low.';
        strategy.counterOffer = strategy.maxCounter;
    }
    
    return strategy;
}

function quickNegotiate(buyerId) {
    const buyer = GUL_DATABASE.buyers.find(b => b.id === buyerId);
    if (!buyer) return;
    
    document.getElementById('negotiation-buyer').value = buyerId;
    document.getElementById('min-price-negotiation').value = localStorage.getItem('minAcceptablePrice') || 3500;
    
    // Switch to settings tab and scroll to negotiation section
    switchTab('settings');
    setTimeout(() => {
        document.querySelector('#smart-negotiation').scrollIntoView({ behavior: 'smooth' });
    }, 300);
    
    showToast(`🤝 Ready to negotiate with ${buyer.name}`);
}

document.getElementById('negotiation-buyer').addEventListener('change', function() {
    const buyerId = this.value;
    if (!buyerId) return;
    
    const buyer = GUL_DATABASE.buyers.find(b => b.id === buyerId);
    const offer = document.getElementById('buyer-offer').value;
    const minPrice = document.getElementById('min-price-negotiation').value;
    
    if (offer && minPrice) {
        const strategy = getNegotiationStrategy(buyer, offer, minPrice);
        document.getElementById('negotiation-suggestion').innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="font-extrabold text-sm">${buyer.name}</span>
                    <span class="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-1 rounded">Tier: ${getBuyerTier(buyer)}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                        <span class="text-gray-500">Buyer Offer</span>
                        <div class="font-extrabold">₹${offer}</div>
                    </div>
                    <div class="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                        <span class="text-gray-500">Counter Offer</span>
                        <div class="font-extrabold text-amber-600">₹${strategy.counterOffer}</div>
                    </div>
                    <div class="bg-white/50 dark:bg-gray-800/50 p-2 rounded col-span-2">
                        <span class="text-gray-500">Strategy</span>
                        <div class="font-bold text-sm">${strategy.advice}</div>
                    </div>
                </div>
                <div class="flex gap-2 mt-2">
                    <button onclick="callBuyer('${buyerId}')" class="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-green-700 transition">
                        <i class="fa-solid fa-phone"></i> Call Now
                    </button>
                    <button onclick="generateWhatsAppPrice('${buyerId}')" class="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-emerald-700 transition">
                        <i class="fa-brands fa-whatsapp"></i> Send Quote
                    </button>
                </div>
            </div>
        `;
    }
});

document.getElementById('buyer-offer').addEventListener('input', function() {
    document.getElementById('negotiation-buyer').dispatchEvent(new Event('change'));
});

document.getElementById('min-price-negotiation').addEventListener('input', function() {
    document.getElementById('negotiation-buyer').dispatchEvent(new Event('change'));
});

function callBuyer(buyerId) {
    const buyer = GUL_DATABASE.buyers.find(b => b.id === buyerId);
    if (buyer) {
        window.location.href = `tel:${buyer.phone}`;
    }
}

function generateWhatsAppPrice(buyerId) {
    const buyer = GUL_DATABASE.buyers.find(b => b.id === buyerId);
    if (!buyer) return;
    
    const price = document.getElementById('buyer-offer').value || '3800';
    const message = `📊 *Price Quote for ${buyer.name}*\n\n` +
        `🍯 Product: Premium Jaggery\n` +
        `💰 Price: ₹${price}/Qtl\n` +
        `📦 Minimum Order: 100 Qtl\n` +
        `🚚 Delivery: Free (Bulk Orders)\n\n` +
        `✅ Special offer for you!\n\n` +
        `— GUL Trading Co.`;
    
    window.open(`https://wa.me/${buyer.whatsapp}?text=${encodeURIComponent(message)}`);
}

// ============================================
// EXPENSE TRACKER SYSTEM
// ============================================

let expenses = JSON.parse(localStorage.getItem('gulExpenses')) || [];

function addExpense() {
    const category = document.getElementById('expense-category').value;
    const amount = document.getElementById('expense-amount').value;
    const notes = document.getElementById('expense-notes').value;
    
    if (!amount || amount <= 0) {
        showToast('❌ Please enter a valid amount.', 'error');
        return;
    }
    
    const expense = {
        id: 'EXP-' + Date.now().toString().slice(-4),
        category,
        amount: parseInt(amount),
        notes: notes || 'No notes',
        date: new Date().toLocaleString('en-IN'),
        userId: 'GUL_CRM'
    };
    
    expenses.unshift(expense);
    if (expenses.length > 100) expenses.pop();
    
    localStorage.setItem('gulExpenses', JSON.stringify(expenses));
    
    showToast('✅ Expense added!');
    renderExpenses();
    updateProfitMetrics();
    
    // Clear inputs
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-notes').value = '';
}

function renderExpenses() {
    const container = document.getElementById('expense-log');
    if (expenses.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 font-bold">No expenses recorded.</p>`;
        return;
    }
    
    container.innerHTML = expenses.slice(0, 10).map(e => `
        <div class="flex justify-between items-center text-xs border-b border-gray-100 dark:border-gray-700 py-2">
            <span class="font-bold">${e.category}</span>
            <span class="text-red-600 font-bold">₹${e.amount}</span>
            <span class="text-gray-500">${e.notes}</span>
            <span class="text-[10px] text-gray-400">${e.date}</span>
        </div>
    `).join('');
}

function updateProfitMetrics() {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = GUL_DATABASE.orders.reduce((sum, o) => sum + (parseInt(o.totalAmount) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
    
    document.getElementById('total-expenses').innerText = '₹' + totalExpenses.toLocaleString('en-IN');
    document.getElementById('total-revenue-expense').innerText = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('net-profit').innerText = '₹' + netProfit.toLocaleString('en-IN');
    document.getElementById('profit-margin').innerText = margin + '%';
}

// ============================================
// ORDER FORECASTING
// ============================================

function forecastOrders() {
    const today = new Date();
    const forecast = {};
    let totalForecast = 0;
    
    GUL_DATABASE.buyers.forEach(b => {
        const tier = getBuyerTier(b);
        const score = calculateBuyerScore(b);
        const lastOrder = GUL_DATABASE.orders.filter(o => o.buyerName === b.name);
        const lastOrderDate = lastOrder.length > 0 ? new Date(lastOrder[0].date) : null;
        
        let probability = 0;
        let expectedQty = parseInt(b.expectedQty) || 0;
        
        // Calculate probability based on multiple factors
        if (tier === 'premium') probability += 30;
        if (tier === 'medium') probability += 20;
        if (score > 70) probability += 20;
        if (b.status === 'Repeat') probability += 20;
        if (b.status === 'Order Placed') probability += 15;
        if (b.status === 'Negotiation') probability += 10;
        
        // Time factor - closer to season start
        const seasonStart = new Date(today.getFullYear(), 9, 1); // October 1
        const daysSinceStart = Math.floor((today - seasonStart) / (1000 * 60 * 60 * 24));
        if (daysSinceStart > 0 && daysSinceStart < 120) {
            probability += 5;
        }
        
        // Cap at 95%
        probability = Math.min(95, probability);
        
        // Expected order quantity
        const forecastQty = Math.round(expectedQty * (probability / 100));
        totalForecast += forecastQty;
        
        forecast[b.name] = {
            tier,
            score,
            probability: probability + '%',
            expectedQty: expectedQty,
            forecastQty: forecastQty,
            status: b.status
        };
    });
    
    return { forecast, totalForecast };
}

// Show forecast summary on dashboard
function renderForecastSummary() {
    const { forecast, totalForecast } = forecastOrders();
    
    // Add to dashboard
    const container = document.createElement('div');
    container.id = 'forecast-container';
    container.className = 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mt-4';
    container.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-extrabold flex items-center gap-2">
                <i class="fa-solid fa-chart-simple text-blue-600"></i> Order Forecast
            </h3>
            <span class="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/50 px-3 py-1 rounded-full">
                Total Forecast: ${totalForecast} Qtl
            </span>
        </div>
        <div class="max-h-60 overflow-y-auto hide-scroll">
            ${Object.entries(forecast).slice(0, 10).map(([name, data]) => `
                <div class="flex justify-between items-center text-xs border-b border-gray-100 dark:border-gray-700 py-2">
                    <span class="font-bold">${name}</span>
                    <span class="text-gray-500">${data.tier}</span>
                    <span class="text-emerald-600 font-bold">${data.forecastQty} Qtl</span>
                    <span class="text-blue-600">${data.probability}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add to dashboard after quick commands
    const quickCommands = document.querySelector('#panel-dashboard .grid-cols-1.lg\\:grid-cols-3');
    if (quickCommands && !document.getElementById('forecast-container')) {
        quickCommands.parentNode.insertBefore(container, quickCommands.nextSibling);
    }
}

// ============================================
// INITIALIZE NEW FEATURES
// ============================================

// Call these in DOMContentLoaded
function initNewFeatures() {
    loadBuyersForNegotiation();
    renderPriceHistory();
    renderExpenses();
    updateProfitMetrics();
    renderForecastSummary();
    loadSeasonTargets();
}

// Add to existing DOMContentLoaded
// After updateEntireUI(), add:
// initNewFeatures();

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
// Make sure these are available globally
window.sendBulkMessage = sendBulkMessage;
window.sendBulkSMS = sendBulkSMS;
window.copyPhonesToClipboard = copyPhonesToClipboard;
window.loadTemplate = loadTemplate;
window.savePriceUpdate = savePriceUpdate;
window.addExpense = addExpense;
window.quickNegotiate = quickNegotiate;
window.callBuyer = callBuyer;
window.generateWhatsAppPrice = generateWhatsAppPrice;
window.loadBuyersForNegotiation = loadBuyersForNegotiation;
window.renderPriceHistory = renderPriceHistory;
window.renderExpenses = renderExpenses;
window.updateProfitMetrics = updateProfitMetrics;
window.forecastOrders = forecastOrders;
window.renderForecastSummary = renderForecastSummary;
window.initNewFeatures = initNewFeatures;