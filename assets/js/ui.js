/**
 * Smart Absentee Leave Monitoring and Reporting System - UI & Components Manager
 * Dynamically builds sidebars, headers, toast notifications, modals, and handles responsiveness.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial Authentication Guard (except for login page)
    const isLoginPage = window.location.pathname.endsWith("login.html") || window.location.pathname.endsWith("/") || window.location.pathname === "";
    let currentUser = null;
    
    if (!isLoginPage) {
        currentUser = AuthManager.checkAuth();
        if (!currentUser) return; // Redirecting...
    }

    // Apply Active Settings Theme
    const settings = DataService.getSettings();
    document.documentElement.setAttribute("data-theme", settings.theme || "light");

    // 2. Render Shared Components if placeholders exist
    const sidebarContainer = document.getElementById("sidebar");
    const navbarContainer = document.getElementById("navbar");

    if (sidebarContainer && currentUser) {
        renderSidebar(sidebarContainer, currentUser);
    }
    if (navbarContainer && currentUser) {
        renderNavbar(navbarContainer, currentUser);
    }

    // 3. Setup Layout Event Listeners
    setupLayoutEvents();
});

// --- Sidebar Configuration per Role ---
const ROLE_SIDEBAR_CONFIG = {
    student: [
        { name: "Dashboard", icon: "fa-tachometer-alt", url: "student-dashboard.html" },
        { name: "Leave Application", icon: "fa-paper-plane", url: "leave-application.html" },
        { name: "Leave History", icon: "fa-history", url: "leave-history.html" },
        { name: "Fine Management", icon: "fa-wallet", url: "fine-management.html" },
        { name: "Notifications", icon: "fa-bell", url: "notifications.html" },
        { name: "Profile", icon: "fa-user-circle", url: "profile.html" },
        { name: "Settings", icon: "fa-cog", url: "settings.html" }
    ],
    coordinator: [
        { name: "Dashboard", icon: "fa-tachometer-alt", url: "coordinator-dashboard.html" },
        { name: "Absentee Register", icon: "fa-calendar-check", url: "absentee-register.html" },
        { name: "Leave History", icon: "fa-history", url: "leave-history.html" },
        { name: "Fine Management", icon: "fa-wallet", url: "fine-management.html" },
        { name: "Reports", icon: "fa-chart-bar", url: "reports.html" },
        { name: "Notifications", icon: "fa-bell", url: "notifications.html" },
        { name: "Profile", icon: "fa-user-circle", url: "profile.html" },
        { name: "Settings", icon: "fa-cog", url: "settings.html" }
    ],
    hod: [
        { name: "Dashboard", icon: "fa-tachometer-alt", url: "hod-dashboard.html" },
        { name: "Absentee Register", icon: "fa-calendar-check", url: "absentee-register.html" },
        { name: "Leave History", icon: "fa-history", url: "leave-history.html" },
        { name: "Fine Management", icon: "fa-wallet", url: "fine-management.html" },
        { name: "Reports", icon: "fa-chart-bar", url: "reports.html" },
        { name: "Notifications", icon: "fa-bell", url: "notifications.html" },
        { name: "Profile", icon: "fa-user-circle", url: "profile.html" },
        { name: "Settings", icon: "fa-cog", url: "settings.html" }
    ],
    dean: [
        { name: "Dashboard", icon: "fa-tachometer-alt", url: "dean-dashboard.html" },
        { name: "Absentee Register", icon: "fa-calendar-check", url: "absentee-register.html" },
        { name: "Fine Management", icon: "fa-wallet", url: "fine-management.html" },
        { name: "Reports", icon: "fa-chart-bar", url: "reports.html" },
        { name: "Notifications", icon: "fa-bell", url: "notifications.html" },
        { name: "Profile", icon: "fa-user-circle", url: "profile.html" },
        { name: "Settings", icon: "fa-cog", url: "settings.html" }
    ],
    admin: [
        { name: "Dashboard", icon: "fa-tachometer-alt", url: "admin-dashboard.html" },
        { name: "Absentee Register", icon: "fa-calendar-check", url: "absentee-register.html" },
        { name: "Leave History", icon: "fa-history", url: "leave-history.html" },
        { name: "Fine Management", icon: "fa-wallet", url: "fine-management.html" },
        { name: "Reports", icon: "fa-chart-bar", url: "reports.html" },
        { name: "Notifications", icon: "fa-bell", url: "notifications.html" },
        { name: "Profile", icon: "fa-user-circle", url: "profile.html" },
        { name: "Settings", icon: "fa-cog", url: "settings.html" }
    ]
};

// --- Render Sidebar ---
function renderSidebar(sidebarEl, user) {
    const isCollapsed = localStorage.getItem("sidebar_collapsed") === "true";
    if (isCollapsed) {
        sidebarEl.classList.add("collapsed");
        document.getElementById("main-layout-frame")?.classList.add("sidebar-collapsed");
    }

    const currentUrl = window.location.pathname.split("/").pop() || "index.html";
    const menuItems = ROLE_SIDEBAR_CONFIG[user.role] || [];
    
    let html = `
        <div class="sidebar-header">
            <div class="sidebar-brand">
                <i class="fas fa-university"></i>
                <span class="sidebar-brand-text">Leave ERP</span>
            </div>
            <button class="sidebar-toggle" id="sidebar-collapse-btn">
                <i class="fas ${isCollapsed ? 'fa-angle-right' : 'fa-angle-left'}"></i>
            </button>
        </div>
        <ul class="sidebar-menu">
    `;

    menuItems.forEach(item => {
        // Match active link
        const isActive = currentUrl === item.url || 
            (currentUrl === "index.html" && item.url === `${user.role}-dashboard.html`) ||
            (item.url === "leave-history.html" && currentUrl.includes("leave"));

        html += `
            <li class="sidebar-item">
                <a href="${item.url}" class="sidebar-link ${isActive ? 'active' : ''}">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.name}</span>
                </a>
            </li>
        `;
    });

    html += `
        </ul>
        <div class="sidebar-footer">
            <a href="#" class="sidebar-link" id="logout-link" style="color: var(--danger);">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </div>
    `;

    sidebarEl.innerHTML = html;
}

// --- Render Top Navbar ---
function renderNavbar(navbarEl, user) {
    const notifications = DataService.getNotifications(user.id);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    // Breadcrumb title parsing
    const currentUrl = window.location.pathname.split("/").pop() || "";
    let pageTitle = "Dashboard";
    if (currentUrl) {
        const parts = currentUrl.replace(".html", "").split("-");
        pageTitle = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    }
    
    navbarEl.innerHTML = `
        <div class="nav-left">
            <button class="sidebar-toggle" id="mobile-sidebar-toggle" style="display: none;">
                <i class="fas fa-bars"></i>
            </button>
            <div class="breadcrumb-container" style="margin-bottom: 0;">
                <div class="breadcrumb-item"><a href="${user.role}-dashboard.html">Home</a></div>
                <div class="breadcrumb-item">/</div>
                <div class="breadcrumb-item active">${pageTitle}</div>
            </div>
        </div>
        
        <div class="nav-right">
            <button class="notifications-menu-trigger" onclick="location.href='notifications.html'">
                <i class="fas fa-bell"></i>
                ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
            </button>
            
            <div class="user-profile-menu">
                <button class="profile-trigger" id="profile-menu-trigger">
                    <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${user.name}">
                    <div class="profile-info">
                        <span class="profile-name">${user.name}</span>
                        <span class="profile-role">${user.role}</span>
                    </div>
                    <i class="fas fa-chevron-down" style="font-size: 0.75rem; color: var(--text-secondary);"></i>
                </button>
                
                <div class="dropdown-menu" id="profile-dropdown">
                    <div class="dropdown-header">
                        <strong>${user.name}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${user.email}</div>
                    </div>
                    <a href="profile.html" class="dropdown-item">
                        <i class="fas fa-user"></i> My Profile
                    </a>
                    <a href="settings.html" class="dropdown-item">
                        <i class="fas fa-cog"></i> Settings
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item" id="logout-dropdown-btn" style="color: var(--danger);">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        </div>
    `;

    // Make mobile toggle visible on small screens
    const checkViewport = () => {
        const toggle = document.getElementById("mobile-sidebar-toggle");
        if (toggle) {
            toggle.style.display = window.innerWidth <= 768 ? "block" : "none";
        }
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
}

// --- Setup Layout Event Listeners ---
function setupLayoutEvents() {
    // Sidebar Collapse Toggle
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#sidebar-collapse-btn");
        if (btn) {
            const sidebar = document.getElementById("sidebar");
            const mainContent = document.getElementById("main-layout-frame");
            sidebar.classList.toggle("collapsed");
            mainContent.classList.toggle("sidebar-collapsed");
            
            const isCollapsed = sidebar.classList.contains("collapsed");
            localStorage.setItem("sidebar_collapsed", isCollapsed);
            
            const icon = btn.querySelector("i");
            if (icon) {
                icon.className = isCollapsed ? "fas fa-angle-right" : "fas fa-angle-left";
            }
        }
    });

    // Mobile Sidebar Drawer Toggle
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#mobile-sidebar-toggle");
        if (btn) {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.toggle("mobile-active");
            
            let overlay = document.querySelector(".sidebar-overlay");
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.className = "sidebar-overlay";
                document.body.appendChild(overlay);
            }
            overlay.classList.toggle("active");
        }
    });

    // Close mobile sidebar on backdrop click
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("sidebar-overlay")) {
            document.getElementById("sidebar").classList.remove("mobile-active");
            e.target.classList.remove("active");
        }
    });

    // User Profile Dropdown Toggle
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest("#profile-menu-trigger");
        const dropdown = document.getElementById("profile-dropdown");
        
        if (trigger) {
            dropdown.classList.toggle("active");
        } else if (dropdown && !e.target.closest(".user-profile-menu")) {
            dropdown.classList.remove("active");
        }
    });

    // Logout actions
    document.addEventListener("click", (e) => {
        if (e.target.closest("#logout-link") || e.target.closest("#logout-dropdown-btn")) {
            e.preventDefault();
            AuthManager.logout();
        }
    });
}

// --- Toast System Engine ---
class Toast {
    static initContainer() {
        let container = document.querySelector(".toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            document.body.appendChild(container);
        }
        return container;
    }

    static show(title, message, type = "info") {
        const container = this.initContainer();
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        let iconClass = "fa-info-circle";
        if (type === "success") iconClass = "fa-check-circle";
        if (type === "warning") iconClass = "fa-exclamation-triangle";
        if (type === "error") iconClass = "fa-exclamation-circle";

        toast.innerHTML = `
            <i class="fas ${iconClass} toast-icon"></i>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;

        container.appendChild(toast);

        // Auto dismiss
        const timer = setTimeout(() => {
            this.dismiss(toast);
        }, 4000);

        // Close button click
        toast.querySelector(".toast-close").addEventListener("click", () => {
            clearTimeout(timer);
            this.dismiss(toast);
        });
    }

    static dismiss(toast) {
        toast.style.animation = "fadeIn 0.2s ease reverse";
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }

    static success(title, msg) { this.show(title, msg, "success"); }
    static error(title, msg) { this.show(title, msg, "error"); }
    static warning(title, msg) { this.show(title, msg, "warning"); }
    static info(title, msg) { this.show(title, msg, "info"); }
}

// --- Modal Controller ---
const ModalController = {
    show(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add("active");
        
        // Setup values if optional data provided
        if (options.title && modal.querySelector(".modal-title")) {
            modal.querySelector(".modal-title").innerText = options.title;
        }

        // Close actions
        const closeBtns = modal.querySelectorAll(".modal-close, [data-modal-close]");
        closeBtns.forEach(btn => {
            btn.onclick = () => this.hide(modalId);
        });

        // Close on backdrop click
        const backdrop = modal.querySelector(".modal-backdrop");
        if (backdrop) {
            backdrop.onclick = () => this.hide(modalId);
        }
    },

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove("active");
        }
    }
};

// --- Table Sorting & Pagination Helpers ---
class TableHelper {
    static init(tableId, data, columns, options = {}) {
        this.tables = this.tables || {};
        this.tables[tableId] = {
            data,
            columns,
            filteredData: [...data],
            page: 1,
            limit: options.limit || 5,
            sortBy: options.sortBy || null,
            sortOrder: options.sortOrder || "asc",
            renderRow: options.renderRow,
            searchQuery: ""
        };

        const t = this.tables[tableId];
        const searchInput = document.getElementById(`${tableId}-search`);
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                t.searchQuery = e.target.value;
                t.page = 1;
                this.applyFilters(tableId);
            });
        }

        // Apply filters initial
        this.applyFilters(tableId);
    }

    static applyFilters(tableId) {
        const t = this.tables[tableId];
        if (!t) return;

        let res = [...t.data];

        // Search
        if (t.searchQuery) {
            const query = t.searchQuery.toLowerCase();
            res = res.filter(row => {
                return Object.values(row).some(val => 
                    val && String(val).toLowerCase().includes(query)
                );
            });
        }

        // Sorting
        if (t.sortBy) {
            res.sort((a, b) => {
                let aVal = a[t.sortBy];
                let bVal = b[t.sortBy];
                
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (aVal < bVal) return t.sortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return t.sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        t.filteredData = res;
        this.render(tableId);
    }

    static sort(tableId, colName) {
        const t = this.tables[tableId];
        if (!t) return;

        if (t.sortBy === colName) {
            t.sortOrder = t.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            t.sortBy = colName;
            t.sortOrder = 'asc';
        }

        this.applyFilters(tableId);
    }

    static setPage(tableId, pageNum) {
        const t = this.tables[tableId];
        if (!t) return;

        const maxPage = Math.ceil(t.filteredData.length / t.limit) || 1;
        if (pageNum < 1 || pageNum > maxPage) return;
        t.page = pageNum;
        this.render(tableId);
    }

    static render(tableId) {
        const t = this.tables[tableId];
        const tbody = document.querySelector(`#${tableId} tbody`);
        if (!tbody || !t) return;

        tbody.innerHTML = "";

        // Calculate limits
        const start = (t.page - 1) * t.limit;
        const end = Math.min(start + t.limit, t.filteredData.length);
        const pageData = t.filteredData.slice(start, end);

        if (pageData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${t.columns.length}" class="text-center" style="color: var(--text-secondary); padding: 32px 0;">No matching records found.</td></tr>`;
        } else {
            pageData.forEach(row => {
                tbody.appendChild(t.renderRow(row));
            });
        }

        // Render pagination controls
        const info = document.getElementById(`${tableId}-pagination-info`);
        if (info) {
            info.innerText = `Showing ${t.filteredData.length === 0 ? 0 : start + 1} to ${end} of ${t.filteredData.length} entries`;
        }

        const controls = document.getElementById(`${tableId}-pagination-controls`);
        if (controls) {
            const maxPage = Math.ceil(t.filteredData.length / t.limit) || 1;
            let html = `
                <button class="pagination-btn" ${t.page === 1 ? 'disabled' : ''} onclick="TableHelper.setPage('${tableId}', ${t.page - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;

            for (let i = 1; i <= maxPage; i++) {
                // simple pagination display, show all if pages small
                if (maxPage <= 5 || i === 1 || i === maxPage || Math.abs(i - t.page) <= 1) {
                    html += `
                        <button class="pagination-btn ${t.page === i ? 'active' : ''}" onclick="TableHelper.setPage('${tableId}', ${i})">${i}</button>
                    `;
                } else if (i === 2 || i === maxPage - 1) {
                    html += `<span style="padding: 0 4px; color: var(--text-secondary)">...</span>`;
                }
            }

            html += `
                <button class="pagination-btn" ${t.page === maxPage ? 'disabled' : ''} onclick="TableHelper.setPage('${tableId}', ${t.page + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
            controls.innerHTML = html;
        }

        // Update headers to show sort icons
        const thead = document.querySelector(`#${tableId} thead`);
        if (thead) {
            const headers = thead.querySelectorAll("th.sortable");
            headers.forEach(th => {
                const col = th.getAttribute("data-col");
                const icon = th.querySelector("i");
                if (icon) {
                    if (t.sortBy === col) {
                        icon.className = t.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
                        icon.style.opacity = "1";
                    } else {
                        icon.className = 'fas fa-sort';
                        icon.style.opacity = "0.3";
                    }
                }
            });
        }
    }
}
window.TableHelper = TableHelper;
