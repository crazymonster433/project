/**
 * Smart Absentee Leave Monitoring and Reporting System - Dashboards Logic Controller
 * Populates data, initializes charts, and manages role-specific dashboard views.
 */

document.addEventListener("DOMContentLoaded", () => {
    const user = AuthManager.getCurrentUser();
    if (!user) return;

    // Detect which dashboard is active and run initializers
    const path = window.location.pathname.split("/").pop();
    
    if (path.includes("student-dashboard")) {
        initStudentDashboard(user);
    } else if (path.includes("coordinator-dashboard")) {
        initCoordinatorDashboard(user);
    } else if (path.includes("hod-dashboard")) {
        initHODDashboard(user);
    } else if (path.includes("dean-dashboard")) {
        initDeanDashboard(user);
    } else if (path.includes("admin-dashboard")) {
        initAdminDashboard(user);
    }
});

// --- 1. STUDENT DASHBOARD INITIALIZER ---
function initStudentDashboard(user) {
    // 1. Welcome Card
    const welcomeTitle = document.getElementById("welcome-title");
    if (welcomeTitle) welcomeTitle.innerText = `Welcome back, ${user.name}!`;

    // 2. Attendance Progress Ring
    const attPercentEl = document.getElementById("attendance-percent");
    const attCircleFill = document.querySelector(".attendance-ring-circle-fill");
    if (attPercentEl && attCircleFill) {
        const percentage = user.attendance;
        attPercentEl.innerText = `${percentage}%`;
        
        // Dash array circumference for r=60 is 2 * pi * 60 = 376.8
        const circumference = 377;
        const offset = circumference - (percentage / 100) * circumference;
        attCircleFill.style.strokeDasharray = circumference;
        attCircleFill.style.strokeDashoffset = offset;
        
        // Color based on attendance threshold
        const settings = DataService.getSettings();
        if (percentage < settings.academicThreshold) {
            attCircleFill.style.stroke = "var(--danger)";
        } else if (percentage < 80) {
            attCircleFill.style.stroke = "var(--warning)";
        } else {
            attCircleFill.style.stroke = "var(--secondary)";
        }
    }

    // 3. Leave Balance, Applied count, and Fines
    const leaves = DataService.getLeaves().filter(l => l.studentId === user.id);
    const fines = DataService.getFines().filter(f => f.studentId === user.id);
    const pendingFines = fines.filter(f => f.status === "Pending").reduce((sum, f) => sum + f.amount, 0);

    const balanceEl = document.getElementById("leave-balance");
    if (balanceEl) balanceEl.innerText = user.leaveBalance;

    const appliedEl = document.getElementById("applied-leaves-count");
    if (appliedEl) appliedEl.innerText = leaves.length;

    const fineEl = document.getElementById("fine-balance");
    if (fineEl) fineEl.innerText = `₹${pendingFines}`;

    // 4. Attendance History Line Chart
    ChartHelper.createLineChart(
        "student-attendance-chart",
        ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        [75, 78, 80, 82, 83, user.attendance],
        "Attendance %",
        user.attendance < 75 ? ChartColors.danger : ChartColors.primary
    );

    // 5. Recent Activities
    const activityList = document.getElementById("recent-activities-list");
    if (activityList) {
        activityList.innerHTML = "";
        
        const recentLeaves = leaves.slice(0, 3);
        const recentFines = fines.slice(0, 2);
        
        let activities = [];
        
        recentLeaves.forEach(l => {
            activities.push({
                title: `Applied for ${l.type}`,
                desc: `${l.startDate} to ${l.endDate} (${l.duration} Days) - Status: ${l.status}`,
                icon: "fa-paper-plane",
                color: l.status === "Approved" ? "secondary" : l.status === "Pending" ? "warning" : "danger",
                time: l.appliedDate
            });
        });

        recentFines.forEach(f => {
            activities.push({
                title: `Fine Registered (₹${f.amount})`,
                desc: `Reason: ${f.reason} - Status: ${f.status}`,
                icon: "fa-exclamation-triangle",
                color: f.status === "Paid" ? "secondary" : "danger",
                time: f.date
            });
        });

        // Sort activities by date/time (simple sort)
        activities.sort((a,b) => new Date(b.time) - new Date(a.time));

        if (activities.length === 0) {
            activityList.innerHTML = `<p style="color:var(--text-secondary);font-size:0.875rem;">No recent activities logged.</p>`;
        } else {
            activities.slice(0, 4).forEach(act => {
                const item = document.createElement("div");
                item.className = "d-flex gap-16 align-center p-8 mb-8";
                item.style.borderBottom = "1px solid var(--border)";
                item.innerHTML = `
                    <div class="stat-icon ${act.color}" style="width:36px; height:36px; font-size:1rem; flex-shrink:0;">
                        <i class="fas ${act.icon}"></i>
                    </div>
                    <div style="flex-grow:1;">
                        <span style="font-weight:600; font-size:0.875rem; display:block;">${act.title}</span>
                        <small style="color:var(--text-secondary); font-size:0.75rem;">${act.desc}</small>
                    </div>
                    <small style="color:var(--text-secondary); font-size:0.7rem; white-space:nowrap;">${act.time}</small>
                `;
                activityList.appendChild(item);
            });
        }
    }
}

// --- 2. COORDINATOR DASHBOARD INITIALIZER ---
function initCoordinatorDashboard(user) {
    const stats = DataService.getStats();
    
    // KPI Cards
    const totalStudentsEl = document.getElementById("coord-total-students");
    if (totalStudentsEl) totalStudentsEl.innerText = stats.totalStudents;

    const absenteesEl = document.getElementById("coord-today-absentees");
    if (absenteesEl) absenteesEl.innerText = stats.absenteesToday;

    const pendingEl = document.getElementById("coord-pending-leaves");
    if (pendingEl) pendingEl.innerText = stats.pendingLeaves;

    const approvedEl = document.getElementById("coord-approved-leaves");
    if (approvedEl) approvedEl.innerText = stats.approvedLeaves;

    // Attendance Bar Chart (Absentees weekly trend)
    ChartHelper.createBarChart(
        "coordinator-attendance-chart",
        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        [12, 18, 8, 15, 22, 5],
        "Absentees Count"
    );

    // Leave Approval Dialog/Actions
    initLeaveRequestsTable(user);
    initStudentsMasterTable();
}

function initLeaveRequestsTable(user) {
    const pendingRequests = DataService.getLeaves().filter(l => l.status === "Pending" && l.department === user.department);
    const tbody = document.querySelector("#pending-leaves-table tbody");
    if (!tbody) return;

    const renderTable = () => {
        tbody.innerHTML = "";
        const activeRequests = DataService.getLeaves().filter(l => l.status === "Pending" && l.department === user.department);
        
        if (activeRequests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 24px; color: var(--text-secondary);">No pending leave requests.</td></tr>`;
            return;
        }

        activeRequests.forEach(req => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div style="font-weight:600;">${req.studentName}</div>
                    <small style="color:var(--text-secondary);">${req.studentId}</small>
                </td>
                <td><span class="badge badge-info">${req.type}</span></td>
                <td>${req.startDate} to ${req.endDate}</td>
                <td>${req.duration} Day(s)</td>
                <td>
                    <button class="btn btn-outline p-8" style="padding: 6px 12px; font-size: 0.8rem;" onclick="viewLeaveReason('${req.id}')">
                        <i class="fas fa-eye"></i> View Reason
                    </button>
                </td>
                <td>
                    <div class="d-flex gap-8">
                        <button class="btn btn-secondary p-8" style="padding: 6px 12px; font-size: 0.8rem;" onclick="approveLeave('${req.id}', '${user.name}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-danger p-8" style="padding: 6px 12px; font-size: 0.8rem;" onclick="rejectLeave('${req.id}', '${user.name}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Export helpers to global scope
    window.viewLeaveReason = (leaveId) => {
        const req = DataService.getLeaves().find(l => l.id === leaveId);
        if (req) {
            const detailsDiv = document.getElementById("leave-detail-content");
            if (detailsDiv) {
                detailsDiv.innerHTML = `
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div><strong>Student Name:</strong> <p>${req.studentName}</p></div>
                        <div><strong>Registration No:</strong> <p>${req.studentId}</p></div>
                        <div><strong>Leave Type:</strong> <p>${req.type}</p></div>
                        <div><strong>Duration:</strong> <p>${req.duration} Day(s)</p></div>
                        <div><strong>From Date:</strong> <p>${req.startDate}</p></div>
                        <div><strong>To Date:</strong> <p>${req.endDate}</p></div>
                    </div>
                    <div style="margin-bottom:16px;">
                        <strong>Reason:</strong>
                        <p style="background:var(--background); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border); font-size:0.9rem; margin-top:6px;">${req.reason}</p>
                    </div>
                    ${req.attachment ? `
                        <div>
                            <strong>Attachment:</strong>
                            <p style="margin-top:6px;"><i class="fas fa-file-pdf" style="color:var(--danger); margin-right:8px;"></i> <a href="#" style="color:var(--primary); font-weight:500;">${req.attachment}</a></p>
                        </div>
                    ` : ''}
                `;
            }
            ModalController.show("leave-detail-modal");
        }
    };

    window.approveLeave = (leaveId, handlerName) => {
        const success = DataService.updateLeaveStatus(leaveId, "Approved", "Approved by department coordinator.", handlerName);
        if (success) {
            Toast.success("Leave Approved", `Leave ID ${leaveId} has been successfully approved.`);
            renderTable();
            // Refresh counts
            const stats = DataService.getStats();
            if (document.getElementById("coord-pending-leaves")) {
                document.getElementById("coord-pending-leaves").innerText = stats.pendingLeaves;
                document.getElementById("coord-approved-leaves").innerText = stats.approvedLeaves;
            }
        }
    };

    window.rejectLeave = (leaveId, handlerName) => {
        const remarks = prompt("Please enter the reason for rejection (optional):");
        const success = DataService.updateLeaveStatus(leaveId, "Rejected", remarks || "Rejection by coordinator.", handlerName);
        if (success) {
            Toast.error("Leave Rejected", `Leave ID ${leaveId} has been rejected.`);
            renderTable();
            // Refresh counts
            const stats = DataService.getStats();
            if (document.getElementById("coord-pending-leaves")) {
                document.getElementById("coord-pending-leaves").innerText = stats.pendingLeaves;
            }
        }
    };

    renderTable();
}

function initStudentsMasterTable() {
    const tableId = "students-master-table";
    const userEl = document.getElementById(tableId);
    if (!userEl) return;

    // Seed student list (simulated)
    const mockStudents = [
        { id: "CS2023045", name: "Aravind Sharma", attendance: 84.5, leaveApplied: 3, fines: "₹250", status: "Present" },
        { id: "CS2023078", name: "Priya Patel", attendance: 92.1, leaveApplied: 1, fines: "₹0", status: "Present" },
        { id: "CS2023112", name: "Rohan Das", attendance: 71.3, leaveApplied: 4, fines: "₹0", status: "Absent" },
        { id: "CS2023189", name: "Vikram Rathore", attendance: 68.8, leaveApplied: 0, fines: "₹500", status: "Absent" },
        { id: "CS2023023", name: "Sunita Reddy", attendance: 78.4, leaveApplied: 2, fines: "₹0", status: "Present" },
        { id: "CS2023145", name: "Anil Kapoor", attendance: 89.9, leaveApplied: 1, fines: "₹0", status: "Present" }
    ];

    TableHelper.init(tableId, mockStudents, ["Student Name", "Attendance %", "Leaves Taken", "Pending Fines", "Status", "Actions"], {
        limit: 5,
        sortBy: "attendance",
        sortOrder: "asc",
        renderRow: (row) => {
            const tr = document.createElement("tr");
            const isLowAtt = row.attendance < 75;
            
            tr.innerHTML = `
                <td>
                    <div style="font-weight:600;">${row.name}</div>
                    <small style="color:var(--text-secondary);">${row.id}</small>
                </td>
                <td>
                    <span style="font-weight:600; color: ${isLowAtt ? 'var(--danger)' : 'inherit'};">${row.attendance}%</span>
                    <div class="progress-bar-bg" style="width: 100px; height: 6px; margin-top:4px;">
                        <div class="progress-bar-fill ${isLowAtt ? 'progress-danger' : 'progress-secondary'}" style="width: ${row.attendance}%;"></div>
                    </div>
                </td>
                <td>${row.leaveApplied} Days</td>
                <td style="color: ${row.fines !== '₹0' ? 'var(--danger)' : 'inherit'}; font-weight:600;">${row.fines}</td>
                <td>
                    <span class="badge ${row.status === 'Present' ? 'badge-success' : 'badge-danger'}">${row.status}</span>
                </td>
                <td>
                    <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="triggerWarningSMS('${row.id}')">
                        <i class="fas fa-envelope"></i> Alert
                    </button>
                </td>
            `;
            return tr;
        }
    });

    window.triggerWarningSMS = (studentId) => {
        Toast.warning("Alert Sent", `SMS/Email warning alert dispatched to student ${studentId} and parent regarding low attendance.`);
    };
}

// --- 3. HOD DASHBOARD INITIALIZER ---
function initHODDashboard(user) {
    // Aggregates
    const stats = DataService.getStats();
    
    const countAbs = document.getElementById("hod-absentees-today");
    if (countAbs) countAbs.innerText = stats.absenteesToday;

    const countPending = document.getElementById("hod-pending-leaves");
    if (countPending) countPending.innerText = stats.pendingLeaves;

    // Daily Attendance status chart (Doughnut)
    ChartHelper.createDoughnutChart(
        "hod-attendance-status-chart",
        ["Present", "Approved Leave", "Unexcused Absence", "Excused Absence"],
        [88, stats.approvedLeaves + 2, stats.absenteesToday, 2]
    );

    // Render department leave history summary
    const tbody = document.querySelector("#hod-escalations-table tbody");
    if (tbody) {
        tbody.innerHTML = "";
        const pending = DataService.getLeaves().filter(l => l.status === "Pending").slice(0, 3);
        
        if (pending.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding:16px;">No escalation reviews.</td></tr>`;
        } else {
            pending.forEach(req => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div style="font-weight:600;">${req.studentName}</div>
                        <small>${req.studentId}</small>
                    </td>
                    <td><span class="badge badge-warning">${req.type}</span></td>
                    <td>${req.reason.substring(0, 40)}...</td>
                    <td>
                        <button class="btn btn-primary" style="padding:6px 12px; font-size:0.8rem;" onclick="location.href='leave-history.html'">
                            Manage
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }
}

// --- 4. DEAN DASHBOARD INITIALIZER ---
function initDeanDashboard(user) {
    const stats = DataService.getStats();

    const revenueEl = document.getElementById("dean-revenue-fines");
    if (revenueEl) revenueEl.innerText = `₹${stats.revenueFines}`;

    const activeStudentsEl = document.getElementById("dean-total-students");
    if (activeStudentsEl) activeStudentsEl.innerText = stats.totalStudents;

    // Bar chart: Attendance rate comparison between departments
    ChartHelper.createBarChart(
        "dean-dept-attendance-chart",
        ["CSE", "ECE", "ME", "EE", "CE"],
        [
            { label: "Attendance %", data: [85, 78, 82, 73, 80], backgroundColor: ChartColors.primary },
            { label: "Target Threshold", data: [75, 75, 75, 75, 75], type: 'line', borderColor: ChartColors.danger, borderWidth: 2, fill: false }
        ]
    );

    // Fine collections Line Chart
    ChartHelper.createLineChart(
        "dean-fine-trend-chart",
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        [4500, 7800, 6200, 11500, 9200, stats.revenueFines + 3000],
        "Fine Collected (₹)"
    );
}

// --- 5. ADMIN DASHBOARD INITIALIZER ---
function initAdminDashboard(user) {
    const stats = DataService.getStats();
    
    const fineEl = document.getElementById("admin-total-fines");
    if (fineEl) fineEl.innerText = `₹${stats.revenueFines + stats.pendingFines}`;

    // Admin charts
    ChartHelper.createPieChart(
        "admin-leave-pie-chart",
        ["Medical", "Casual", "Academic", "Rejected"],
        [stats.approvedLeaves + 12, 10, 5, stats.rejectedLeaves]
    );

    ChartHelper.createBarChart(
        "admin-user-activities-chart",
        ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
        [15, 2, 45, 120, 90, 35],
        "User Operations Logged"
    );

    // Admin setting adjustments
    const saveRulesBtn = document.getElementById("admin-save-rules-btn");
    if (saveRulesBtn) {
        const thresholdInput = document.getElementById("admin-threshold-input");
        const rateInput = document.getElementById("admin-rate-input");
        const settings = DataService.getSettings();

        if (thresholdInput) thresholdInput.value = settings.autoFineThreshold;
        if (rateInput) rateInput.value = settings.fineAmountPerDay;

        saveRulesBtn.onclick = (e) => {
            e.preventDefault();
            DataService.updateSettings({
                autoFineThreshold: parseInt(thresholdInput.value),
                fineAmountPerDay: parseInt(rateInput.value)
            });
            Toast.success("System Settings Saved", "Fine rates and thresholds updated successfully.");
        };
    }
}
