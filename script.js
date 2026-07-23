// ==========================================================================
// Abood Link Shield Pro - Complete Logic Engine (2026)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. فحص معلمات الـ URL عند فتح الموقع (هل الزائر يفتح رابط محمي؟)
    const urlParams = new URLSearchParams(window.location.search);
    const targetParam = urlParams.get("target");
    const fileParam = urlParams.get("file");
    const timeParam = urlParams.get("time");
    const titleParam = urlParams.get("title");
    const creatorParam = urlParams.get("creator");
    const adIdParam = urlParams.get("adid");
    const rotateParam = urlParams.get("rotate");
    const bgParam = urlParams.get("bg");

    const redirectView = document.getElementById("redirectView");
    const mainDashboardView = document.getElementById("mainDashboardView");

    // ==========================================================================
    // أ) إذا كان هناك رابط محمي: إخفاء الموقع بالكامل وإظهار صفحة التوجيه فقط
    // ==========================================================================
    if (targetParam || fileParam) {
        if (mainDashboardView) mainDashboardView.style.display = "none";
        if (redirectView) {
            redirectView.style.display = "flex";

            // إعداد خلفية الصفحة المخصصة إذا حددها الناشر
            if (bgParam) {
                redirectView.style.backgroundImage = `url('${decodeURIComponent(bgParam)}')`;
            }

            const redirectTitleDisplay = document.getElementById("redirectTitleDisplay");
            const redirectCreatorDisplay = document.getElementById("redirectCreatorDisplay");
            const redirectTimerDisplay = document.getElementById("redirectTimerDisplay");
            const finalRedirectBtn = document.getElementById("finalRedirectBtn");
            const adBannerText = document.getElementById("adBannerText");

            redirectTitleDisplay.textContent = titleParam ? decodeURIComponent(titleParam) : "جاري فحص وتأمين الرابط المحمي...";
            redirectCreatorDisplay.textContent = creatorParam ? `الرابط مُقدَّم لك بواسطة: ${decodeURIComponent(creatorParam)} 👑` : "الرابط مُقدَّم بواسطة: عبدالله";

            let totalSeconds = timeParam ? parseInt(timeParam) : 60;
            let rotateIntervalSeconds = rotateParam ? parseInt(rotateParam) : 10;
            redirectTimerDisplay.textContent = totalSeconds;

            // آلية تدوير وتغيير الإعلانات تلقائياً خلال مدة العداد
            let adCounter = 1;
            function rotateAdMessage() {
                const adPublisher = adIdParam ? decodeURIComponent(adIdParam) : "DEFAULT-PUB-2026";
                adBannerText.textContent = `📢 [إعلان نشط #${adCounter} - المعرف: ${adPublisher}] - اضغط للتفاعل!`;
                adCounter++;
            }

            rotateAdMessage(); // تشغيل الإعلان الأول
            let adRotationTimer = setInterval(rotateAdMessage, rotateIntervalSeconds * 1000);

            // تشغيل العداد التنازلي للتوجيه
            let countdownTimer = setInterval(() => {
                totalSeconds--;
                redirectTimerDisplay.textContent = totalSeconds;

                if (totalSeconds <= 0) {
                    clearInterval(countdownTimer);
                    clearInterval(adRotationTimer);

                    finalRedirectBtn.disabled = false;
                    finalRedirectBtn.textContent = "🚀 الانتقال إلى المحتوى النهائي الآن";
                    finalRedirectBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";

                    const destination = targetParam ? decodeURIComponent(targetParam) : decodeURIComponent(fileParam);
                    finalRedirectBtn.onclick = () => {
                        window.location.href = destination;
                    };
                }
            }, 1000);
        }
        return; // إنهاء التنفيذ لعدم تشغيل أكواد لوحة التحكم للزائر
    }

    // ==========================================================================
    // ب) تشغيل لوحة التحكم العادية للمستخدم في حال عدم وجود معلمات توجيه
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

    // البروفايل والتنبيهات
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
                showToast(`✅ تم حفظ بروفايلك باسم ${savedUser.name}!`);
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

    // التبديل بين وضع رابط أو ملف
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
                    fileStatusText.textContent = `✅ تم تجهيز الملف: ${file.name}`;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // انشاء رابط التوجيه
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
                    alert("يرجى أدخل الرابط المطلوب أولاً!");
                    return;
                }
            } else {
                if (!uploadedFileBase64) {
                    alert("يرجى رفع ملف أولاً!");
                    return;
                }
                targetVal = uploadedFileBase64;
            }

            const timeSeconds = timerSelect.value;
            const titleVal = linkTitleInput.value.trim() || "رابط توجيه محمي";
            const creatorVal = creatorNameInput.value.trim() || savedUser.name;
            const rotateVal = adRotateIntervalSelect.value;
            const adIdVal = adIdInput.value.trim();
            const bgUrlVal = bgImageUrlInput.value.trim();

            const baseUrl = window.location.href.split('?')[0];
            let protectedUrl = "";

            if (inputMode === "url") {
                protectedUrl = `${baseUrl}?target=${encodeURIComponent(targetVal)}&time=${timeSeconds}&title=${encodeURIComponent(titleVal)}&creator=${encodeURIComponent(creatorVal)}&rotate=${rotateVal}&adid=${encodeURIComponent(adIdVal)}&bg=${encodeURIComponent(bgUrlVal)}`;
            } else {
                protectedUrl = `${baseUrl}?file=${encodeURIComponent(targetVal)}&time=${timeSeconds}&title=${encodeURIComponent(titleVal)}&creator=${encodeURIComponent(creatorVal)}&rotate=${rotateVal}&adid=${encodeURIComponent(adIdVal)}&bg=${encodeURIComponent(bgUrlVal)}`;
            }

            generatedUrlInput.value = protectedUrl;
            if (noResultPlaceholder) noResultPlaceholder.style.display = "none";
            resultBox.style.display = "block";

            const gIcon = savedUser.gender === "male" ? "👨‍✈️ ♂️" : "👩‍✈️ ♀️";
            showToast(`🎉 تم إنشاء رابط التوجيه لـ <strong>${creatorVal} (${gIcon})</strong> بنجاح!`);
        };
    }

    if (copyUrlBtn) {
        copyUrlBtn.onclick = () => {
            navigator.clipboard.writeText(generatedUrlInput.value);
            showToast("📋 تم نسخ الرابط المباشر بنجاح!");
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

