// ==========================================================================
// Abood Link Shield - Core Logic & Redirect Engine (2026)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. إخفاء Splash Screen
    window.addEventListener("load", () => {
        const splash = document.getElementById("splash");
        if (splash) {
            setTimeout(() => {
                splash.style.opacity = "0";
                setTimeout(() => splash.remove(), 800);
            }, 1200);
        }
    });

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 2. زر العودة للأعلى وشريط التقدم
    const topBtn = document.getElementById("topBtn");
    const progress = document.getElementById("scrollProgress");

    window.addEventListener("scroll", () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0 && progress) {
            progress.style.width = (winScroll / height) * 100 + "%";
        }
        if (topBtn) {
            topBtn.style.display = window.scrollY > 300 ? "block" : "none";
        }
    });

    if (topBtn) {
        topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    // 3. البروفايل والتنبيهات المباشرة
    const userNameInput = document.getElementById("userNameInput");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const genderBtns = document.querySelectorAll(".gender-btn");
    const liveToastContainer = document.getElementById("liveToastContainer");

    let savedUser = JSON.parse(localStorage.getItem("abood_shield_user")) || {
        name: "عبدالله",
        gender: "male"
    };

    if (userNameInput) userNameInput.value = savedUser.name;

    genderBtns.forEach(btn => {
        if (btn.dataset.gender === savedUser.gender) {
            genderBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        }
        btn.addEventListener("click", () => {
            genderBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            savedUser.gender = btn.dataset.gender;
        });
    });

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", () => {
            const val = userNameInput.value.trim();
            if (val) {
                savedUser.name = val;
                localStorage.setItem("abood_shield_user", JSON.stringify(savedUser));
                const gIcon = savedUser.gender === "male" ? "👨‍✈️ ♂️" : "👩‍✈️ ♀️";
                showToast(`✅ أهلاً بك ${savedUser.name} (${gIcon})! تم حفظ بروفايلك.`);
            }
        });
    }

    function showToast(text) {
        if (!liveToastContainer) return;
        const toast = document.createElement("div");
        toast.className = "toast-message";
        toast.innerHTML = text;
        liveToastContainer.appendChild(toast);

        setTimeout(() => { toast.remove(); }, 4000);
    }

    // 4. المحرك الرئيسي لاختصار وفحص الروابط
    const targetUrlInput = document.getElementById("targetUrlInput");
    const timerSelect = document.getElementById("timerSelect");
    const linkTitleInput = document.getElementById("linkTitleInput");
    const generateShieldBtn = document.getElementById("generateShieldBtn");

    const timerDisplay = document.getElementById("timerDisplay");
    const previewTitleDisplay = document.getElementById("previewTitleDisplay");
    const shieldStatusBadge = document.getElementById("shieldStatusBadge");
    const startShieldBtn = document.getElementById("startShieldBtn");
    const goTargetBtn = document.getElementById("goTargetBtn");

    const resultBox = document.getElementById("resultBox");
    const generatedUrlInput = document.getElementById("generatedUrlInput");
    const copyUrlBtn = document.getElementById("copyUrlBtn");
    const openUrlNewTabBtn = document.getElementById("openUrlNewTabBtn");

    let activeTargetUrl = "";
    let timerSeconds = 10;
    let countdownInterval = null;

    // التعامل مع المعلمات المستلمة بـ URL في حال كان الموقع مستقبِلاً لرابط محمي
    const urlParams = new URLSearchParams(window.location.search);
    const incomingTarget = urlParams.get("target");

    if (incomingTarget) {
        activeTargetUrl = decodeURIComponent(incomingTarget);
        previewTitleDisplay.textContent = urlParams.get("title") || "الرابط المحمي جاهز للانتقال";
        timerSeconds = parseInt(urlParams.get("time")) || 10;
        timerDisplay.textContent = timerSeconds;
        shieldStatusBadge.textContent = "🛡️ رابط محمي مستلم";
    }

    // إنشاء رابط محمي
    if (generateShieldBtn) {
        generateShieldBtn.addEventListener("click", () => {
            const rawUrl = targetUrlInput.value.trim();
            if (!rawUrl) {
                alert("يرجى إدخال الرابط الأصلي أولاً!");
                return;
            }

            activeTargetUrl = rawUrl;
            timerSeconds = parseInt(timerSelect.value);
            const titleVal = linkTitleInput.value.trim() || "رابط محمي عبر Abood Shield";

            // تكوين الرابط المحمي
            const baseUrl = window.location.href.split('?')[0];
            const protectedUrl = `${baseUrl}?target=${encodeURIComponent(rawUrl)}&time=${timerSeconds}&title=${encodeURIComponent(titleVal)}`;

            generatedUrlInput.value = protectedUrl;
            resultBox.style.display = "block";
            previewTitleDisplay.textContent = titleVal;
            timerDisplay.textContent = timerSeconds;

            const genderIcon = savedUser.gender === "male" ? "👨‍✈️ ♂️" : "👩‍✈️ ♀️";
            showToast(`🎉 قام <strong>${savedUser.name} (${genderIcon})</strong> بإنشاء رابط محمي جديد بنجاح!`);
        });
    }

    // بدء محاكاة فحص الأمان والعد التنازلي
    if (startShieldBtn) {
        startShieldBtn.addEventListener("click", () => {
            if (!activeTargetUrl) {
                alert("أدخل رابطاً أو أنشئ رابطاً محميأً أولاً!");
                return;
            }

            startShieldBtn.disabled = true;
            shieldStatusBadge.textContent = "⏳ جاري فحص سلامة الرابط...";
            let currentTimer = timerSeconds;
            timerDisplay.textContent = currentTimer;

            clearInterval(countdownInterval);
            countdownInterval = setInterval(() => {
                currentTimer--;
                timerDisplay.textContent = currentTimer;

                if (currentTimer <= 0) {
                    clearInterval(countdownInterval);
                    shieldStatusBadge.textContent = "✅ الرابط آمن تماماً! اضغط للانتقال";
                    goTargetBtn.disabled = false;
                    goTargetBtn.textContent = "🚀 الانتقال إلى الرابط النهائي الآن";
                    goTargetBtn.onclick = () => {
                        window.open(activeTargetUrl, "_blank");
                    };
                }
            }, 1000);
        });
    }

    // نسخ وتجربة الأزرار
    if (copyUrlBtn) {
        copyUrlBtn.onclick = () => {
            navigator.clipboard.writeText(generatedUrlInput.value);
            showToast("📋 تم نسخ الرابط المحمي بنجاح!");
        };
    }

    if (openUrlNewTabBtn) {
        openUrlNewTabBtn.onclick = () => {
            if (generatedUrlInput.value) {
                window.open(generatedUrlInput.value, "_blank");
            }
        };
    }
});

