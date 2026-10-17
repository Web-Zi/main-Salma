// =========================================================================
// 🔗 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
// =========================================================================
const CLOUD_API_URL = "https://script.google.com/macros/s/AKfycby-HCCNrYC-ZB0IKRFfZP2w4CXz2SmLz3MNJbGUCRGsywhTNe096MLxLaOU6L4GA3PRuA/exec";

// Retrieve HQ Admin Password (Default: "0000")
function getHQPassword() {
    return localStorage.getItem('salma_hq_password') || "0000";
}

// Toggle Dark / Light Theme
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
}

// Login Verification
function unlockHQApp() {
    const entered = document.getElementById('hq-app-password').value;
    if (entered === getHQPassword()) {
        document.getElementById('hq-login-screen').classList.add('hidden');
        document.getElementById('hq-dashboard').classList.remove('hidden');
        
        // Fetch reports immediately upon login
        fetchAndRenderReports();
        
        // Auto-refresh reports every 5 minutes
        setInterval(() => {
            fetchAndRenderReports();
        }, 5 * 60 * 1000);
    } else {
        alert("كلمة المرور غير صحيحة!");
    }
}

// Fetch Reports from Google Apps Script Cloud Endpoint
async function fetchAndRenderReports() {
    const container = document.getElementById('reports-list');
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-weight: bold;">جاري تحديث التقارير من السحابة...</p>`;

    try {
        const response = await fetch(CLOUD_API_URL);
        const reports = await response.json();
        renderReportsUI(reports);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="text-align: center; color: #ef4444; font-weight: bold;">فشل الاتصال بالسحابة. تحقق من اتصال الإنترنت.</p>`;
    }
}

// Render Received Reports in HQ Dashboard
function renderReportsUI(reports) {
    const container = document.getElementById('reports-list');

    if (!reports || reports.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد تقارير جرد مستلمة حتى الآن.</p>`;
        return;
    }

    container.innerHTML = "";
    // Display newest reports first
    reports.slice().reverse().forEach((rep) => {
        const card = document.createElement('div');
        card.className = `report-card ${rep.checked ? 'checked-report' : ''}`;
        
        const dataUriPayload = rep.pdfDataUri || rep.downloadUrl;

        card.innerHTML = `
            <div class="report-details">
                <h4 style="margin: 0 0 5px 0; font-size: 1.1rem; color: var(--accent-blue);">🏢 ${rep.branchName}</h4>
                <p style="margin: 3px 0; font-size: 0.9rem;">📞 <strong>الهاتف:</strong> ${rep.phone}</p>
                <p style="margin: 3px 0; font-size: 0.9rem;">📅 <strong>التاريخ:</strong> ${rep.date}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <button onclick="openReportView('${dataUriPayload}')" class="btn-confirm" style="padding: 8px 16px; font-size: 0.9rem; cursor: pointer;">📄 عرض / طباعة التقرير</button>
                <div style="text-align: center;">
                    <label style="font-size: 0.75rem; display: block; margin-bottom: 2px; color: var(--text-muted);">تمت المراجعة</label>
                    <input type="checkbox" ${rep.checked ? 'checked' : ''} onchange="toggleReportCheck(${rep.id})" style="width: 20px; height: 20px; cursor: pointer;">
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Opens the HTML/PDF report in a formatted popup window ready for printing/saving
function openReportView(dataUri) {
    if (!dataUri) {
        alert("تعذر فتح التقرير. البيانات غير مكتملة.");
        return;
    }

    const win = window.open("", "_blank");
    try {
        const base64Part = dataUri.includes(",") ? dataUri.split(',')[1] : dataUri;
        const htmlContent = decodeURIComponent(escape(atob(base64Part)));
        
        win.document.write(htmlContent);
        win.document.write(`
            <div style="text-align: center; margin: 30px 0; font-family: system-ui, sans-serif;">
                <button onclick="window.print()" style="padding: 12px 24px; font-size: 16px; font-weight: bold; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">🖨️ طباعة / حفظ كـ PDF</button>
            </div>
        `);
        win.document.close();
    } catch (e) {
        console.error("Error opening report window:", e);
        win.location.href = dataUri;
    }
}

// Toggle Report "Checked / Reviewed" Status in Cloud
async function toggleReportCheck(id) {
    try {
        await fetch(CLOUD_API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "toggle", id: id })
        });
        setTimeout(fetchAndRenderReports, 800);
    } catch (error) {
        console.error(error);
    }
}

// Clear All Reports History
async function clearAllReports() {
    if (confirm("هل أنت متأكد من مسح جميع التقارير من السجل والسحابة؟")) {
        try {
            await fetch(CLOUD_API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: "clear" })
            });
            setTimeout(fetchAndRenderReports, 800);
        } catch (error) {
            console.error(error);
        }
    }
}

// Change HQ Admin Password
function changeHQPassword() {
    const currentPass = getHQPassword();
    const enteredCurrent = prompt("أدخل كلمة المرور الحالية للإدارة:");

    if (enteredCurrent === null) return; // User cancelled prompt

    if (enteredCurrent !== currentPass) {
        return alert("كلمة المرور الحالية غير صحيحة!");
    }

    const newPass = prompt("أدخل كلمة المرور الجديدة:");
    if (newPass && newPass.trim() !== "") {
        localStorage.setItem('salma_hq_password', newPass.trim());
        alert("تم تغيير كلمة المرور بنجاح!");
    }
}
