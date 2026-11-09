
import { initializeApp, getApps, getApp }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import { getAuth, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { getFirestore, doc, getDoc, setDoc }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB55Wyc7yQN4egHj18qmLHfi7C3f6b6yc4",
    authDomain: "bts-x-army-96686.firebaseapp.com",
    projectId: "bts-x-army-96686",
    storageBucket: "bts-x-army-96686.firebasestorage.app",
    messagingSenderId: "453151911193",
    appId: "1:453151911193:web:b3e6cfe89200b7fe2d2988"
};

const ADMIN_UID = "o7pEyFYi34QQ2W1xPNjBoDa60e42";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const privateButton = document.createElement("button");
privateButton.id = "firebasePrivateButton";
privateButton.type = "button";
privateButton.textContent = "🔒 首次備份私人行程";
privateButton.style.display = "none";

document.querySelector(".header").appendChild(privateButton);

onAuthStateChanged(auth, user => {
    console.log("🔐 目前網站登入 UID：", user?.uid);
    console.log("🔐 Firebase 專案：", app.options.projectId);

    privateButton.style.display = "none";
});

privateButton.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user || user.uid !== ADMIN_UID) {
        alert("只有管理員可以備份私人行程。");
        return;
    }

    let events;

    try {
        events = JSON.parse(
            localStorage.getItem("pinkPlannerEvents") || "null"
        );
    } catch (error) {
        alert("本機行程資料格式錯誤，已停止上傳。");
        return;
    }

    if (!Array.isArray(events) || events.length === 0) {
        alert("本機沒有每日行程，已停止上傳。");
        return;
    }

    const confirmed = confirm(
        "♡ 首次備份私人行程 ♡\n\n" +
        "本機共有 " + events.length + " 筆行程。\n\n" +
        "將上傳至管理員專用的 privateTrips/main。\n" +
        "不會刪除本機資料。\n" +
        "如果雲端已有資料，會停止上傳。\n\n" +
        "確定繼續嗎？"
    );

    if (!confirmed) return;

    privateButton.disabled = true;
    privateButton.textContent = "🔒 檢查雲端中...";

    try {
        const privateRef = doc(db, "privateTrips", "main");

        const existing = await getDoc(privateRef);

        if (existing.exists()) {
            alert("雲端已經有私人行程，為避免覆蓋，已停止上傳。");
            return;
        }

        privateButton.textContent = "🔒 備份中...";

        await setDoc(privateRef, {
            events: events,
            updatedAt: new Date().toISOString()
        });

        alert("♡ 私人行程首次備份成功！");

    } catch (error) {
        console.error("私人行程備份失敗：", error);
        alert("備份失敗：" + error.message);
    } finally {
        privateButton.disabled = false;
        privateButton.textContent = "🔒 首次備份私人行程";
    }
});


const downloadButton = document.createElement("button");
downloadButton.id = "firebasePrivateDownloadButton";
downloadButton.type = "button";
downloadButton.textContent = "🔒 讀取雲端私人行程";
downloadButton.style.display = "none";

document.querySelector(".header").appendChild(downloadButton);

onAuthStateChanged(auth, user => {
    downloadButton.style.display =
        user && user.uid === ADMIN_UID ? "inline-flex" : "none";
});

downloadButton.addEventListener("click", async () => {
    if (auth.currentUser?.uid !== ADMIN_UID) {
        alert("只有管理員可以讀取私人行程。");
        return;
    }

    try {
        const privateRef = doc(db, "privateTrips", "main");
        const snapshot = await getDoc(privateRef);

        if (!snapshot.exists()) {
            alert("雲端尚未建立私人行程。");
            return;
        }

        const cloudEvents = snapshot.data().events;

        if (!Array.isArray(cloudEvents) || cloudEvents.length === 0) {
            alert("雲端沒有可讀取的每日行程。");
            return;
        }

        const localEvents = JSON.parse(
            localStorage.getItem("pinkPlannerEvents") || "[]"
        );

        if (Array.isArray(localEvents) && localEvents.length > 0) {
            alert(
                "目前裝置已有 " + localEvents.length +
                " 筆本機行程。\n\n" +
                "為避免覆蓋，已停止匯入雲端資料。"
            );
            return;
        }

        const confirmed = confirm(
            "♡ 讀取雲端私人行程 ♡\n\n" +
            "雲端共有 " + cloudEvents.length + " 筆行程。\n\n" +
            "將匯入目前裝置並重新整理頁面。\n\n" +
            "確定繼續嗎？"
        );

        if (!confirmed) return;

        localStorage.setItem(
            "pinkPlannerEvents",
            JSON.stringify(cloudEvents)
        );

        alert("♡ 私人行程匯入成功！");
        location.reload();

    } catch (error) {
        console.error("讀取私人行程失敗：", error);
        alert("讀取失敗：" + error.message);
    }
});


const checklistImportButton = document.createElement("button");
checklistImportButton.id = "firebaseChecklistImportButton";
checklistImportButton.type = "button";
checklistImportButton.textContent = "💜 匯入雲端打卡清單";
checklistImportButton.style.display = "none";

document.querySelector(".header").appendChild(checklistImportButton);

onAuthStateChanged(auth, user => {
    checklistImportButton.style.display =
        user?.uid === ADMIN_UID ? "inline-flex" : "none";
});

checklistImportButton.addEventListener("click", async () => {
    if (auth.currentUser?.uid !== ADMIN_UID) {
        alert("只有管理員可以匯入打卡清單。");
        return;
    }

    const localValue = localStorage.getItem("pinkPlannerChecklists");

    if (localValue !== null) {
        let localChecklists;

        try {
            localChecklists = JSON.parse(localValue);
        } catch {
            alert("本機打卡資料格式異常，已停止匯入。");
            return;
        }

        if (!Array.isArray(localChecklists) ||
            localChecklists.length > 0) {
            alert("本機已有打卡資料，為避免覆蓋，已停止匯入。");
            return;
        }
    }

    checklistImportButton.disabled = true;

    try {
        const snapshot = await getDoc(
            doc(db, "publicChecklists", "main")
        );

        if (!snapshot.exists()) {
            alert("找不到雲端打卡清單。");
            return;
        }

        const cloudChecklists = snapshot.data().checklists;

        if (!Array.isArray(cloudChecklists) ||
            cloudChecklists.length === 0) {
            alert("雲端打卡清單是空的，已停止匯入。");
            return;
        }

        const confirmed = confirm(
            "♡ 匯入雲端打卡清單 ♡\n\n" +
            "雲端共有 " + cloudChecklists.length + " 組清單。\n\n" +
            "將匯入目前瀏覽器並重新整理頁面。\n" +
            "確定繼續嗎？"
        );

        if (!confirmed) return;

        localStorage.setItem(
            "pinkPlannerChecklists",
            JSON.stringify(cloudChecklists)
        );

        alert("♡ 打卡清單匯入成功！");
        location.reload();

    } catch (error) {
        console.error("打卡清單匯入失敗：", error);
        alert("匯入失敗：" + error.message);
    } finally {
        checklistImportButton.disabled = false;
    }
});

