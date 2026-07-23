// ==========================================================================
// Abood Link Shield Pro - Core & Fullscreen Redirect Engine (2026)
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

    // 3. البروفايل والتنبيهات
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
                showToast(`✅ أهلاً بك ${savedUser.name} (${gIcon})! تم حفظ البروفايل.`);
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

    // 4. التبديل بين وضع رابط أو رفع ملف
    const tabTypeUrl = document.getElementById("tabTypeUrl");
    const tabTypeFile = document.getElementById("tabTypeFile");
    const urlInputContainer = document.getElementById("urlInputContainer");
    const fileInputContainer = document.getElementById("fileInputContainer");
    const fileUploaderInput = document.getElementById("fileUploaderInput");
    const fileStatusText = document.getElementById("fileStatusText");

    let inputMode = "url"; // url or file
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
        fileUploaderInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedFileBase64 = event.target.result;
                    fileStatusText.textContent = `✅ تم رفع الملف بنجاح: ${file.name} (${Math.round(file.size / 1024)} KB)`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 5. محرك الروابط وإنشاء الحماية والإعلانات
    const targetUrlInput = document.getElementById("targetUrlInput");
    const timerSelect = document.getElementById("timerSelect");
    const linkTitleInput = document.getElementById("linkTitleInput");
    const adIdInput = document.getElementById("adIdInput");
    const generateShieldBtn = document.getElementById("generateShieldBtn");

    const timerDisplay = document.getElementById("timerDisplay");
    const previewTitleDisplay = document.getElementById("previewTitleDisplay");
    const shieldStatusBadge = document.getElementById("shieldStatusBadge");
    const startShieldBtn = document.getElementById("startShieldBtn");

    const resultBox = document.getElementById("resultBox");
    const generatedUrlInput = document.getElementById("generatedUrlInput");
    const copyUrlBtn = document.getElementById("copyUrlBtn");
    const testLiveUrlBtn = document.getElementById("testLiveUrlBtn");

    // عناصر نافذة صفحة الزائر بملء الشاشة (Fullscreen Redirect Overlay)
    const fullscreenRedirectOverlay = document.getElementById("fullscreenRedirectOverlay");
    const redirectTitleText = document.getElementById("redirectTitleText");
    const redirectTimerDisplay = document.getElementById("redirectTimerDisplay");
    const finalRedirectBtn = document.getElementById("finalRedirectBtn");
    const adSlotTop = document.getElementById("adSlotTop");
    const adSlotBottom = document.getElementById("adSlotBottom");

    let liveCountdownInterval = null;

    // فحص إذا كان الرابط يفتح بصفحة الزائر (يحتوي على بارامترات)
    const urlParams = new URLSearchParams(window.location.search);
    const targetParam = urlParams.get("target");
    const fileParam = urlParams.get("file");
    const timeParam = urlParams.get("time");
    const titleParam = urlParams.get("title");
    const adIdParam = urlParams.get("adid");

    if (targetParam || fileParam) {
        // تشغيل صفحة الزائر بملء الشاشة مباشرة
        if (fullscreenRedirectOverlay) {
            fullscreenRedirectOverlay.style.display = "flex";
            redirectTitleText.textContent = titleParam ? decodeURIComponent(titleParam) : "جاري فحص وتأمين الرابط المحمي...";
            
            let remainingTime = timeParam ? parseInt(timeParam) : 15;
            redirectTimerDisplay.textContent = remainingTime;

            // تفعيل مساحات الإعلانات إذا أدخل المستخدم معرف الإعلانات
            if (adIdParam) {
                adSlotTop.style.display = "block";
                adSlotBottom.style.display = "block";
                adSlotTop.innerHTML = `📢 [إعلان ممول نشط - ID: ${decodeURIComponent(adIdParam)}]`;
                adSlotBottom.innerHTML = `📢 [إعلان بنري مدعوم - ID: ${decodeURIComponent(adIdParam)}]`;
            }

            let countdown = setInterval(() => {
                remainingTime--;
                redirectTimerDisplay.textContent = remainingTime;

                if (remainingTime <= 0) {
                    clearInterval(countdown);
                    finalRedirectBtn.disabled = false;
                    finalRedirectBtn.textContent = "🚀 الانتقال الفوري إلى المحتوى النهائي";
                    finalRedirectBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
                    
                    const destinationUrl = targetParam ? decodeURIComponent(targetParam) : decodeURIComponent(fileParam);
                    finalRedirectBtn.onclick = () => {
                        window.location.href = destinationUrl;
                    };
                }
            }, 1000);
        }
    }

    // زر توليد الرابط المحمي
    if (generateShieldBtn) {
        generateShieldBtn.addEventListener("click", () => {
            let finalTarget = "";
            if (inputMode === "url") {
                finalTarget = targetUrlInput.value.trim();
                if (!finalTarget) {
                    alert("يرجى إدخال الرابط الأصلي أولاً!");
                    return;
                }
            } else {
                if (!uploadedFileBase64) {
                    alert("يرجى رفع ملف من جهازك أولاً!");
                    return;
                }
                finalTarget = uploadedFileBase64;
            }

            const selectedSeconds = timerSelect.value;
            const titleVal = linkTitleInput.value.trim() || "رابط محمي عبر Abood Shield Pro";
            const adIdVal = adIdInput.value.trim();

            const baseUrl = window.location.href.split('?')[0];
            let protectedUrl = "";

            if (inputMode === "url") {
                protectedUrl = `${baseUrl}?target=${encodeURIComponent(finalTarget)}&time=${selectedSeconds}&title=${encodeURIComponent(titleVal)}&adid=${encodeURIComponent(adIdVal)}`;
            } else {
                protectedUrl = `${baseUrl}?file=${encodeURIComponent(finalTarget)}&time=${selectedSeconds}&title=${encodeURIComponent(titleVal)}&adid=${encodeURIComponent(adIdVal)}`;
            }

            generatedUrlInput.value = protectedUrl;
            resultBox.style.display = "block";
            previewTitleDisplay.textContent = titleVal;
            timerDisplay.textContent = selectedSeconds;

            const genderIcon = savedUser.gender === "male" ? "👨‍✈️ ♂️" : "👩‍✈️ ♀️";
            showToast(`🎉 قام <strong>${savedUser.name} (${genderIcon})</strong> بإنشاء رابط محمي بمدة ${selectedSeconds} ثانية ومعرف إعلانات بنجاح!`);
        });
    }

    // تجربة محاكاة التوجيه محلياً في لوحة التحكم
    if (startShieldBtn) {
        startShieldBtn.addEventListener("click", () => {
            const sampleTime = timerSelect.value;
            let currentTimer = parseInt(sampleTime);
            timerDisplay.textContent = currentTimer;
            shieldStatusBadge.textContent = "⏳ جاري محاكاة صفحة التوجيه والعد...";

            clearInterval(liveCountdownInterval);
            liveCountdownInterval = setInterval(() => {
                currentTimer--;
                timerDisplay.textContent = currentTimer;

                if (currentTimer <= 0) {
                    clearInterval(liveCountdownInterval);
                    shieldStatusBadge.textContent = "✅ اكتمل العد التجريبي بنجاح!";
                    alert("🎉 التجربة ناجحة تماماً! الرابط جاهز للاستخدام ومشاركة الزوار.");
                }
            }, 1000);
        });
    }

    // أزرار النسخ والاختبار
    if (copyUrlBtn) {
        copyUrlBtn.onclick = () => {
            navigator.clipboard.writeText(generatedUrlInput.value);
            showToast("📋 تم نسخ الرابط المحمي الإعلاني بنجاح!");
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
