/**
 * Smart Absentee Leave Monitoring and Reporting System - Data Layer
 * Handles mock databases, state management, and localStorage synchronization.
 */

const DEFAULT_USERS = [
    {
        email: "student@university.edu",
        password: "password123",
        name: "Aravind Sharma",
        role: "student",
        id: "CS2023045",
        department: "Computer Science & Engineering",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        phone: "+91 98765 43210",
        attendance: 84.5,
        leaveBalance: 12,
        gender: "Male",
        dob: "2003-08-15"
    },
    {
        email: "coordinator@university.edu",
        password: "password123",
        name: "Dr. Sarah Jenkins",
        role: "coordinator",
        id: "COORD001",
        department: "Computer Science & Engineering",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        phone: "+91 98123 45678",
        gender: "Female",
        dob: "1982-04-20"
    },
    {
        email: "hod@university.edu",
        password: "password123",
        name: "Dr. Rajesh Kumar",
        role: "hod",
        id: "HOD-CSE",
        department: "Computer Science & Engineering",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        phone: "+91 94440 12345",
        gender: "Male",
        dob: "1975-11-03"
    },
    {
        email: "dean@university.edu",
        password: "password123",
        name: "Dr. Elizabeth Vance",
        role: "dean",
        id: "DEAN-ACAD",
        department: "Academic Affairs",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        phone: "+91 90001 90002",
        gender: "Female",
        dob: "1968-07-29"
    },
    {
        email: "admin@university.edu",
        password: "password123",
        name: "Admin Portal Operator",
        role: "admin",
        id: "ADMIN-01",
        department: "Information Technology",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        phone: "+91 99999 88888",
        gender: "Male",
        dob: "1990-01-01"
    }
];

const DEFAULT_LEAVES = [
    {
        id: "LV-2026-001",
        studentName: "Aravind Sharma",
        studentId: "CS2023045",
        department: "Computer Science & Engineering",
        type: "Medical Leave",
        startDate: "2026-06-10",
        endDate: "2026-06-12",
        duration: 3,
        reason: "Severe viral fever, doctor advised absolute bed rest for three days.",
        attachment: "medical_cert_aravind.pdf",
        status: "Approved",
        appliedDate: "2026-06-09",
        remarks: "Approved as doctor certificate is verified.",
        handler: "Dr. Sarah Jenkins"
    },
    {
        id: "LV-2026-002",
        studentName: "Priya Patel",
        studentId: "CS2023078",
        department: "Computer Science & Engineering",
        type: "Casual Leave",
        startDate: "2026-06-18",
        endDate: "2026-06-18",
        duration: 1,
        reason: "Attending sister's wedding engagement ceremony in hometown.",
        attachment: "wedding_card.png",
        status: "Approved",
        appliedDate: "2026-06-15",
        remarks: "Granted for family function.",
        handler: "Dr. Sarah Jenkins"
    },
    {
        id: "LV-2026-003",
        studentName: "Aravind Sharma",
        studentId: "CS2023045",
        department: "Computer Science & Engineering",
        type: "Academic Leave",
        startDate: "2026-06-25",
        endDate: "2026-06-26",
        duration: 2,
        reason: "Representing the university in Inter-College Smart India Hackathon.",
        attachment: "sih_invitation_letter.pdf",
        status: "Approved",
        appliedDate: "2026-06-22",
        remarks: "Academic permission approved. Forwarded to HOD for record.",
        handler: "Dr. Sarah Jenkins"
    },
    {
        id: "LV-2026-004",
        studentName: "Rohan Das",
        studentId: "CS2023112",
        department: "Computer Science & Engineering",
        type: "Casual Leave",
        startDate: "2026-07-02",
        endDate: "2026-07-04",
        duration: 3,
        reason: "Going out of station for personal passport renewal appointment.",
        attachment: "",
        status: "Pending",
        appliedDate: "2026-06-29",
        remarks: "",
        handler: ""
    },
    {
        id: "LV-2026-005",
        studentName: "Ananya Roy",
        studentId: "EC2023012",
        department: "Electronics & Communication",
        type: "Medical Leave",
        startDate: "2026-07-01",
        endDate: "2026-07-05",
        duration: 5,
        reason: "Sprained ankle during sports practice, undergoing physiotherapy.",
        attachment: "physio_letter.jpg",
        status: "Pending",
        appliedDate: "2026-06-30",
        remarks: "",
        handler: ""
    },
    {
        id: "LV-2026-006",
        studentName: "Aditya Verma",
        studentId: "ME2023009",
        department: "Mechanical Engineering",
        type: "Casual Leave",
        startDate: "2026-06-05",
        endDate: "2026-06-06",
        duration: 2,
        reason: "Travel conflict, flight delayed back from hometown.",
        attachment: "ticket_cancel.pdf",
        status: "Rejected",
        appliedDate: "2026-06-04",
        remarks: "Unsanctioned trip dates. Rejected.",
        handler: "Dr. Sarah Jenkins"
    }
];

const DEFAULT_ABSENTEES = [
    {
        date: "2026-07-01",
        studentName: "Ananya Roy",
        studentId: "EC2023012",
        department: "Electronics & Communication",
        status: "Leave Applied",
        lecturesMissed: ["Digital Electronics", "Network Analysis"],
        markedBy: "Prof. S. K. Bose"
    },
    {
        date: "2026-07-01",
        studentName: "Rohan Das",
        studentId: "CS2023112",
        department: "Computer Science & Engineering",
        status: "Unexcused",
        lecturesMissed: ["Database Systems", "Software Engineering"],
        markedBy: "Dr. Sarah Jenkins"
    },
    {
        date: "2026-07-01",
        studentName: "Vikram Rathore",
        studentId: "CS2023189",
        department: "Computer Science & Engineering",
        status: "Fine Issued",
        lecturesMissed: ["Database Systems", "Compiler Design"],
        markedBy: "Dr. Sarah Jenkins"
    },
    {
        date: "2026-06-30",
        studentName: "Sunita Reddy",
        studentId: "EE2023022",
        department: "Electrical Engineering",
        status: "Excused",
        lecturesMissed: ["Control Systems", "Power Electronics"],
        markedBy: "Prof. M. Verma"
    },
    {
        date: "2026-06-30",
        studentName: "Aravind Sharma",
        studentId: "CS2023045",
        department: "Computer Science & Engineering",
        status: "Present",
        lecturesMissed: [],
        markedBy: "Dr. Sarah Jenkins"
    }
];

const DEFAULT_FINES = [
    {
        id: "FN-883",
        studentId: "CS2023045",
        studentName: "Aravind Sharma",
        department: "Computer Science & Engineering",
        amount: 250,
        date: "2026-06-15",
        reason: "Consecutive 3 days absence without prior leave submission.",
        status: "Pending",
        transactionId: ""
    },
    {
        id: "FN-882",
        studentId: "CS2023189",
        studentName: "Vikram Rathore",
        department: "Computer Science & Engineering",
        amount: 500,
        date: "2026-06-20",
        reason: "Failure to attend mandatory department seminar.",
        status: "Pending",
        transactionId: ""
    },
    {
        id: "FN-881",
        studentId: "CS2023045",
        studentName: "Aravind Sharma",
        department: "Computer Science & Engineering",
        amount: 150,
        date: "2026-05-12",
        reason: "Absent during lab internal evaluation.",
        status: "Paid",
        transactionId: "TXN-902148209"
    },
    {
        id: "FN-880",
        studentId: "ME2023009",
        studentName: "Aditya Verma",
        department: "Mechanical Engineering",
        amount: 300,
        date: "2026-06-08",
        reason: "Absence on the re-opening day after summer vacation.",
        status: "Paid",
        transactionId: "TXN-873024823"
    }
];

const DEFAULT_NOTIFICATIONS = [
    {
        id: "NT-1",
        forUser: "CS2023045", // Student
        title: "Leave Approved",
        message: "Your leave application (LV-2026-003) for Academic Leave from 2026-06-25 to 2026-06-26 has been approved.",
        date: "2026-06-23 10:45 AM",
        isRead: false,
        category: "leave"
    },
    {
        id: "NT-2",
        forUser: "CS2023045", // Student
        title: "Fine Issued",
        message: "A fine of ₹250 has been registered against your ID for unexcused absence on 2026-06-15.",
        date: "2026-06-15 04:30 PM",
        isRead: false,
        category: "fine"
    },
    {
        id: "NT-3",
        forUser: "COORD001", // Coordinator
        title: "New Leave Application",
        message: "Rohan Das (CS2023112) has submitted a new Leave Application for Casual Leave from 2026-07-02.",
        date: "2026-06-29 09:15 AM",
        isRead: false,
        category: "system"
    },
    {
        id: "NT-4",
        forUser: "HOD-CSE", // HOD
        title: "Weekly Absence Report",
        message: "The weekly attendance report for CSE department is ready for review.",
        date: "2026-06-29 08:00 AM",
        isRead: false,
        category: "report"
    },
    {
        id: "NT-5",
        forUser: "DEAN-ACAD", // Dean
        title: "Monthly Fine Dashboard",
        message: "Total university fine collections for June 2026 reached ₹14,500. Click to view details.",
        date: "2026-07-01 00:00 AM",
        isRead: true,
        category: "report"
    }
];

const DEFAULT_SETTINGS = {
    theme: "light",
    emailNotifications: true,
    smsNotifications: false,
    autoFineThreshold: 3, // days
    fineAmountPerDay: 100, // INR
    academicThreshold: 75 // minimum attendance %
};

// --- Storage Synchronization Class ---
class LocalDB {
    static init() {
        if (!localStorage.getItem("absentee_system_users")) {
            localStorage.setItem("absentee_system_users", JSON.stringify(DEFAULT_USERS));
        }
        if (!localStorage.getItem("absentee_system_leaves")) {
            localStorage.setItem("absentee_system_leaves", JSON.stringify(DEFAULT_LEAVES));
        }
        if (!localStorage.getItem("absentee_system_absentees")) {
            localStorage.setItem("absentee_system_absentees", JSON.stringify(DEFAULT_ABSENTEES));
        }
        if (!localStorage.getItem("absentee_system_fines")) {
            localStorage.setItem("absentee_system_fines", JSON.stringify(DEFAULT_FINES));
        }
        if (!localStorage.getItem("absentee_system_notifications")) {
            localStorage.setItem("absentee_system_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
        }
        if (!localStorage.getItem("absentee_system_settings")) {
            localStorage.setItem("absentee_system_settings", JSON.stringify(DEFAULT_SETTINGS));
        }
    }

    static get(key) {
        this.init();
        return JSON.parse(localStorage.getItem(`absentee_system_${key}`));
    }

    static set(key, value) {
        localStorage.setItem(`absentee_system_${key}`, JSON.stringify(value));
    }
}

// Ensure database is initialized
LocalDB.init();

// --- Auth Manager ---
const AuthManager = {
    login(email, password) {
        const users = LocalDB.get("users");
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            localStorage.setItem("absentee_system_current_user", JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: "Invalid email or password." };
    },

    getCurrentUser() {
        const userJSON = localStorage.getItem("absentee_system_current_user");
        return userJSON ? JSON.parse(userJSON) : null;
    },

    logout() {
        localStorage.removeItem("absentee_system_current_user");
        window.location.href = "login.html";
    },

    checkAuth(requiredRoles = []) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = "login.html";
            return null;
        }
        if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
            // Redirect to appropriate dashboard
            window.location.href = `${user.role}-dashboard.html`;
            return null;
        }
        return user;
    }
};

// --- Mock API/Data Operations ---
const DataService = {
    // Leaves
    getLeaves() {
        return LocalDB.get("leaves");
    },
    saveLeave(leaveData) {
        const leaves = this.getLeaves();
        const id = `LV-2026-${String(leaves.length + 1).padStart(3, '0')}`;
        const newLeave = {
            id,
            status: "Pending",
            appliedDate: new Date().toISOString().split('T')[0],
            remarks: "",
            handler: "",
            ...leaveData
        };
        leaves.unshift(newLeave);
        LocalDB.set("leaves", leaves);

        // Notify Coordinator / HOD
        this.addNotification({
            forUser: "COORD001",
            title: "New Leave Request",
            message: `${newLeave.studentName} (${newLeave.studentId}) applied for ${newLeave.type} starting ${newLeave.startDate}.`,
            category: "leave"
        });

        return newLeave;
    },
    updateLeaveStatus(leaveId, status, remarks, handlerName) {
        const leaves = this.getLeaves();
        const idx = leaves.findIndex(l => l.id === leaveId);
        if (idx !== -1) {
            leaves[idx].status = status;
            leaves[idx].remarks = remarks;
            leaves[idx].handler = handlerName;
            LocalDB.set("leaves", leaves);

            // Notify Student
            this.addNotification({
                forUser: leaves[idx].studentId,
                title: `Leave ${status}`,
                message: `Your application (${leaveId}) for ${leaves[idx].type} has been ${status.toLowerCase()} by ${handlerName}.`,
                category: "leave"
            });

            // Adjust attendance if approved
            if (status === "Approved" && leaves[idx].studentId === "CS2023045") {
                const user = LocalDB.get("users").find(u => u.id === "CS2023045");
                if (user) {
                    // Update attendance slightly or add positive reflection
                    user.attendance = Math.min(100, user.attendance + 1.2);
                    const users = LocalDB.get("users");
                    const uIdx = users.findIndex(u => u.id === "CS2023045");
                    users[uIdx] = user;
                    LocalDB.set("users", users);
                }
            }
            return true;
        }
        return false;
    },

    // Fines
    getFines() {
        return LocalDB.get("fines");
    },
    payFine(fineId) {
        const fines = this.getFines();
        const idx = fines.findIndex(f => f.id === fineId);
        if (idx !== -1) {
            fines[idx].status = "Paid";
            fines[idx].transactionId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
            LocalDB.set("fines", fines);

            // Notify User
            this.addNotification({
                forUser: fines[idx].studentId,
                title: "Fine Payment Confirmed",
                message: `Payment of ₹${fines[idx].amount} for Fine ID ${fineId} was successful. Transaction ID: ${fines[idx].transactionId}`,
                category: "fine"
            });
            return fines[idx];
        }
        return null;
    },
    addFine(fineData) {
        const fines = this.getFines();
        const id = `FN-${Math.floor(800 + Math.random() * 200)}`;
        const newFine = {
            id,
            status: "Pending",
            date: new Date().toISOString().split('T')[0],
            transactionId: "",
            ...fineData
        };
        fines.unshift(newFine);
        LocalDB.set("fines", fines);

        // Notify User
        this.addNotification({
            forUser: newFine.studentId,
            title: "New Fine Issued",
            message: `A fine of ₹${newFine.amount} has been issued. Reason: ${newFine.reason}`,
            category: "fine"
        });

        return newFine;
    },

    // Absentees
    getAbsentees() {
        return LocalDB.get("absentees");
    },
    addAbsenteeRecord(record) {
        const absentees = this.getAbsentees();
        absentees.unshift(record);
        LocalDB.set("absentees", absentees);
        return record;
    },
    updateAbsenteeStatus(studentId, date, newStatus) {
        const absentees = this.getAbsentees();
        const record = absentees.find(a => a.studentId === studentId && a.date === date);
        if (record) {
            record.status = newStatus;
            LocalDB.set("absentees", absentees);
            return true;
        }
        return false;
    },

    // Notifications
    getNotifications(userId) {
        const all = LocalDB.get("notifications");
        return all.filter(n => n.forUser === userId || n.forUser === "ALL");
    },
    addNotification(notif) {
        const all = LocalDB.get("notifications");
        const newNotif = {
            id: `NT-${all.length + 1}`,
            date: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' }),
            isRead: false,
            ...notif
        };
        all.unshift(newNotif);
        LocalDB.set("notifications", all);
        return newNotif;
    },
    markNotificationAsRead(notifId) {
        const all = LocalDB.get("notifications");
        const idx = all.findIndex(n => n.id === notifId);
        if (idx !== -1) {
            all[idx].isRead = true;
            LocalDB.set("notifications", all);
            return true;
        }
        return false;
    },
    markAllNotificationsAsRead(userId) {
        const all = LocalDB.get("notifications");
        all.forEach(n => {
            if (n.forUser === userId) n.isRead = true;
        });
        LocalDB.set("notifications", all);
    },

    // Settings
    getSettings() {
        return LocalDB.get("settings");
    },
    updateSettings(newSettings) {
        const current = this.getSettings();
        const updated = { ...current, ...newSettings };
        LocalDB.set("settings", updated);
        return updated;
    },

    // User Profile Actions
    updateUserProfile(userId, updatedData) {
        const users = LocalDB.get("users");
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...updatedData };
            LocalDB.set("users", users);
            // If current user is updated, update active session
            const curUser = AuthManager.getCurrentUser();
            if (curUser && curUser.id === userId) {
                localStorage.setItem("absentee_system_current_user", JSON.stringify(users[idx]));
            }
            return true;
        }
        return false;
    },

    // System Dashboard Aggregate Queries
    getStats() {
        const leaves = this.getLeaves();
        const fines = this.getFines();
        const absentees = this.getAbsentees();
        const users = LocalDB.get("users");

        return {
            totalStudents: users.filter(u => u.role === 'student').length + 150, // simulated total
            totalFaculty: users.filter(u => u.role === 'coordinator' || u.role === 'hod').length + 35,
            pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
            approvedLeaves: leaves.filter(l => l.status === 'Approved').length,
            rejectedLeaves: leaves.filter(l => l.status === 'Rejected').length,
            absenteesToday: absentees.filter(a => a.date === "2026-07-01" && a.status !== "Present").length,
            revenueFines: fines.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0),
            pendingFines: fines.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0)
        };
    }
};
