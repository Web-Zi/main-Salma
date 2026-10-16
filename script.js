function getHQPassword() {
    return localStorage.getItem('salma_hq_password') || "0000";
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
}

function unlockHQApp() {
    const entered = document.getElementById('hq-app-password').value;
    if (entered === getHQPassword()) {
        document.getElementById('hq-login-screen').classList.add('hidden');
        document.getElementById('hq-dashboard').classList.remove('hidden');
        renderReports();
        
        // Start auto-refresh timer (Every 15 minutes = 900,000 milliseconds)
        setInterval(() => {
            renderReports();
            console.log("HQ Reports auto-refreshed.");
        }, 3 * 60 * 1000);

    } else {
        alert("كلمة المرور غير صحيحة!");
    }
}

function getStoredReports() {
    const saved = localStorage.getItem('salma_hq_reports_log');
    return saved ? JSON.parse(saved) : [];
}

function renderReports() {
    const container = document.getElementById('reports-list');
    const reports = getStoredReports();

    if (reports.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #64748b;">لا توجد تقارير جرد مستلمة حتى الآن.</p>`;
        return;
    }

    container.innerHTML = "";
    reports.forEach((rep) => {
        const card = document.createElement('div');
        card.className = `report-card ${rep.checked ? 'checked-report' : ''}`;
        card.innerHTML = `
            <div class="report-details">
                <h4>🏢 ${rep.branchName}</h4>
                <p>📞 <strong>الهاتف:</strong> ${rep.phone}</p>
                <p>📅 <strong>تاريخ التقرير:</strong> ${rep.date}</p>
                <p>📁 <strong>اسم الملف:</strong> ${rep.excelFileName}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <a href="${rep.downloadUrl}" download="${rep.excelFileName}" class="btn-confirm" style="text-decoration:none; display:inline-block;">📥 تحميل Excel</a>
                <div style="text-align: center;">
                    <label style="font-size: 0.8rem; display: block; margin-bottom: 3px;">تمت المراجعة</label>
                    <input type="checkbox" ${rep.checked ? 'checked' : ''} onchange="toggleReportCheck(${rep.id})" style="width: 22px; height: 22px; cursor: pointer;">
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleReportCheck(id) {
    let reports = getStoredReports();
    reports = reports.map(rep => {
        if (rep.id === id) {
            rep.checked = !rep.checked;
        }
        return rep;
    });
    localStorage.setItem('salma_hq_reports_log', JSON.stringify(reports));
    renderReports();
}

function clearAllReports() {
    if (confirm("هل أنت متأكد من مسح جميع التقارير المستلمة من السجل؟")) {
        localStorage.removeItem('salma_hq_reports_log');
        renderReports();
    }
}

function openHQAdminModal() {
    document.getElementById('hq-pass-edit').value = getHQPassword();
    document.getElementById('hq-admin-modal').style.display = "flex";
}

function closeHQAdminModal() {
    document.getElementById('hq-admin-modal').style.display = "none";
}

function saveHQAdminSettings() {
    const newPass = document.getElementById('hq-pass-edit').value.trim();
    if (!newPass) return alert("لا يمكن ترك كلمة المرور فارغة!");

    localStorage.setItem('salma_hq_password', newPass);
    alert("تم حفظ كلمة المرور الجديدة بنجاح!");
    closeHQAdminModal();
}
