// Google Apps Script Cloud API Endpoint
const CLOUD_API_URL = "https://script.google.com/macros/s/AKfycby-HCCNrYC-ZB0IKRFfZP2w4CXz2SmLz3MNJbGUCRGsywhTNe096MLxLaOU6L4GA3PRuA/exec";

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
        fetchAndRenderReports();
        
        // Auto-refresh every 15 minutes from the cloud
        setInterval(() => {
            fetchAndRenderReports();
            console.log("HQ Cloud reports auto-refreshed.");
        }, 15 * 60 * 1000);

    } else {
        alert("كلمة المرور غير صحيحة!");
    }
}

async function fetchAndRenderReports() {
    const container = document.getElementById('reports-list');
    container.innerHTML = `<p style="text-align: center; color: #64748b;">جاري تحديث التقارير من السحابة...</p>`;

    try {
        const response = await fetch(CLOUD_API_URL);
        const reports = await response.json();
        renderReportsUI(reports);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="text-align: center; color: #ef4444;">فشل الاتصال بالسحابة. تحقق من اتصال الإنترنت.</p>`;
    }
}

function renderReportsUI(reports) {
    const container = document.getElementById('reports-list');

    if (!reports || reports.length === 0) {
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

async function toggleReportCheck(id) {
    try {
        await fetch(CLOUD_API_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "toggle", id: id })
        });
        setTimeout(fetchAndRenderReports, 1000); // Refresh UI after toggling status
    } catch (error) {
        console.error(error);
    }
}

async function clearAllReports() {
    if (confirm("هل أنت متأكد من مسح جميع التقارير من السجل والسحابة؟")) {
        try {
            await fetch(CLOUD_API_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "clear" })
            });
            setTimeout(fetchAndRenderReports, 1000);
        } catch (error) {
            console.error(error);
        }
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
