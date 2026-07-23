// ==========================================================================
// Abood Link Shield Pro - Secure Engine (2026)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);
    const shieldParam = urlParams.get("shield"); // البارامتر المشفر الموحد

    const redirectView = document.getElementById("redirectView");
    const mainDashboardView = document.getElementById("mainDashboardView");

    // ==========================================================================
    // أ) التحقق الفوري: إذا وجدنا بارامتر مشفر، نخفي لوحة التحكم تماماً ونشغل التوجيه الآمن
    // ==========================================================================
    if (shieldParam) {
        if (mainDashboardView) mainDashboardView.style.display = "none";
        if (redirectView) redirectView.style.display = "flex";

        try {
            // فك التشفير (Base64 -> JSON)
            const jsonString = decodeURIComponent(escape(atob(shieldParam)));
            const shieldData = JSON.parse(jsonString);

            if (shieldData.bg) {
                redirectView.style.backgroundImage = `url('${shieldData.bg}')`;
            }

            const redirectTitleDisplay = document.getElementById("redirectTitleDisplay");
            const redirectCreatorDisplay = document.getElementById("redirectCreatorDisplay");
            const redirectTimerDisplay = document.getElementById("redirectTimerDisplay");
            const finalRedirectBtn = document.getElementById("finalRedirectBtn");
            const adBannerText = document.getElementById("adBannerText");

            redirectTitleDisplay.textContent = shieldData.title || "جاري فحص وتأمين الرابط المحمي...";
            redirectCreatorDisplay.textContent = shieldData.creator ? `الرابط مُقدَّم لك بواسطة: ${shieldData.creator} 👑` : "الرابط مُقدَّم بواسطة: عبدالله";

            let totalSeconds = shieldData.time ? parseInt(shieldData.time) : 60;
            let rotateIntervalSeconds = shieldData.rotate ? parseInt(shieldData.rotate) : 10;
            redirectTimerDisplay.textContent = totalSeconds;

            // نظام تدوير الإعلانات حسب الثانية بدقة
            let adCounter = 1;
            function rotateAdMessage() {
                const publisherId = shieldData.adid || "SECURE-PUB-2026";
                adBannerText.textContent = `📢 [إعلان نشط #${adCounter} | مُعرّف الناشر: ${publisherId}]`;
                adCounter++;
            }

            rotateAdMessage();
            let adRotationTimer = setInterval(rotateAdMessage, rotateIntervalSeconds * 1000);

            // عداد الانتظار
            let countdownTimer = setInterval(() => {
                totalSeconds--;
                redirectTimerDisplay.textContent = totalSeconds;

                if (totalSeconds <= 0) {
                    clearInterval(countdownTimer);
                    clearInterval(adRotationTimer);

                    finalRedirectBtn.disabled = false;
                    finalRedirectBtn.textContent = "🚀 الانتقال إلى المحتوى النهائي الآن";
                    finalRedirectBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";

                    finalRedirectBtn.onclick = () => {
                        window.location.href = shieldData.target;
                    };
                }
            }, 1000);

        } catch (err) {
            console.error("Shield decoding error:", err);
            if (redirectView) {
                redirectView.innerHTML = `<div class="redirect-glass-card"><h2>❌ عذراً، الرابط التوجيهي التالف أو غير صالح!</h2></div>`;
            }
        }
        return; // منع تشغيل لوحة التحكم نهائياً
    }

    // ==========================================================================
    // ب) تشغيل لوحة التحكم الطبيعية لصاحب الموقع
    // ==========================================================================
    window.addEventListener("load", () => {
        const splash = document.getElementById("splash");
        if (splash) {
            setTimeout(() => {
                splash.style.opacity = "0";
                setTimeout(() => splash.remove(), 800);
            }, 1000);
        }
    });

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const topBtn = document.getElementById("topBtn");
    const progress = document.getElementById("scrollProgress");

    window.addEventListener("scroll", () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0 && progress) progress.style.width = (winScroll / height) * 100 + "%";
        if (topBtn) topBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });

    if (topBtn) topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

    // إدارة البروفايل
    const userNameInput = document.getElementById("userNameInput");
    const creatorNameInput = document.getElementById("creatorNameInput");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const genderBtns = document.querySelectorAll(".gender-btn");
    const liveToastContainer = document.getElementById("liveToastContainer");

    let savedUser = JSON.parse(localStorage.getItem("abood_shield_user")) || { name: "عبدالله", gender: "male" };

    if (userNameInput) userNameInput.value = savedUser.name;
    if (creatorNameInput) creatorNameInput.value = savedUser.name;

    genderBtns.forEach(btn => {
        if (btn.dataset.gender === savedUser.gender) {
            genderBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        }
        btn.onclick = () => {
            genderBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            savedUser.gender = btn.dataset.gender;
        };
    });

    if (saveProfileBtn) {
        saveProfileBtn.onclick = () => {
            const val = userNameInput.value.trim();
            if (val) {
                savedUser.name = val;
                if (creatorNameInput) creatorNameInput.value = val;
                localStorage.setItem("abood_shield_user", JSON.stringify(savedUser));
                showToast(`✅ تم حفظ هويتك بنجاح يا ${savedUser.name}!`);
            }
        };
    }

    function showToast(text) {
        if (!liveToastContainer) return;
        const toast = document.createElement("div");
        toast.className = "toast-message";
        toast.innerHTML = text;
        liveToastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // تبديل بين وضع رابط أو ملف
    const tabTypeUrl = document.getElementById("tabTypeUrl");
    const tabTypeFile = document.getElementById("tabTypeFile");
    const urlInputContainer = document.getElementById("urlInputContainer");
    const fileInputContainer = document.getElementById("fileInputContainer");
    const fileUploaderInput = document.getElementById("fileUploaderInput");
    const fileStatusText = document.getElementById("fileStatusText");

    let inputMode = "url";
    let uploadedFileBase64 = "";

    if (tabTypeUrl && tabTypeFile) {
        tabTypeUrl.onclick = () => {
            tabTypeUrl.classList.add("active");
            tabTypeFile.classList.remove("active");
            urlInputContainer.style.display = "block";
            fileInputContainer.style.display = "none";
            inputMode = "url";
        };
        tabTypeFile.onclick = () => {
            tabTypeFile.classList.add("active");
            tabTypeUrl.classList.remove("active");
            fileInputContainer.style.display = "block";
            urlInputContainer.style.display = "none";
            inputMode = "file";
        };
    }

    if (fileUploaderInput) {
        fileUploaderInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    uploadedFileBase64 = evt.target.result;
                    fileStatusText.textContent = `✅ تم رفع الملف بنجاح: ${file.name}`;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // إنشاء الرابط المشفر
    const targetUrlInput = document.getElementById("targetUrlInput");
    const timerSelect = document.getElementById("timerSelect");
    const linkTitleInput = document.getElementById("linkTitleInput");
    const adRotateIntervalSelect = document.getElementById("adRotateIntervalSelect");
    const adIdInput = document.getElementById("adIdInput");
    const bgImageUrlInput = document.getElementById("bgImageUrlInput");
    const generateShieldBtn = document.getElementById("generateShieldBtn");

    const resultBox = document.getElementById("resultBox");
    const noResultPlaceholder = document.getElementById("noResultPlaceholder");
    const generatedUrlInput = document.getElementById("generatedUrlInput");
    const copyUrlBtn = document.getElementById("copyUrlBtn");
    const testLiveUrlBtn = document.getElementById("testLiveUrlBtn");

    if (generateShieldBtn) {
        generateShieldBtn.onclick = () => {
            let targetVal = "";
            if (inputMode === "url") {
                targetVal = targetUrlInput.value.trim();
                if (!targetVal) {
                    alert("يرجى إدخال الرابط المطلوب أولاً!");
                    return;
                }
            } else {
                if (!uploadedFileBase64) {
                    alert("يرجى رفع الملف من جهازك أولاً!");
                    return;
                }
                targetVal = uploadedFileBase64;
            }

            const shieldPayload = {
                target: targetVal,
                time: timerSelect.value,
                title: linkTitleInput.value.trim() || "رابط توجيه محمي",
                creator: creatorNameInput.value.trim() || savedUser.name,
                rotate: adRotateIntervalSelect.value,
                adid: adIdInput.value.trim(),
                bg: bgImageUrlInput.value.trim()
            };

            // تشفير الكائن بالكامل إلى Base64 احترافي ونظيف
            const jsonString = JSON.stringify(shieldPayload);
            const encodedPayload = btoa(unescape(encodeURIComponent(jsonString)));

            const baseUrl = window.location.href.split('?')[0];
            const finalProtectedUrl = `${baseUrl}?shield=${encodedPayload}`;

            generatedUrlInput.value = finalProtectedUrl;
            if (noResultPlaceholder) noResultPlaceholder.style.display = "none";
            resultBox.style.display = "block";

            showToast("🔐 تم تشفير الرابط وإنشاؤه بنجاح تام!");
        };
    }

    if (copyUrlBtn) {
        copyUrlBtn.onclick = () => {
            navigator.clipboard.writeText(generatedUrlInput.value);
            showToast("📋 تم نسخ الرابط المشفر!");
        };
    }

    if (testLiveUrlBtn) {
        testLiveUrlBtn.onclick = () => {
            if (generatedUrlInput.value) {
                window.open(generatedUrlInput.value, "_blank");
            }
        };
    }
});
