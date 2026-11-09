
import { initializeApp, getApps, getApp }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import { getAuth, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { getFirestore, doc, setDoc }
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

const uploadButton = document.createElement("button");
uploadButton.id = "firebaseUploadButton";
uploadButton.type = "button";
uploadButton.textContent = "☁️ 同步打卡清單";
uploadButton.style.display = "none";

document.querySelector(".header").appendChild(uploadButton);

// 只有管理員能同步
let isAdmin = false;
let lastUploaded = null;
let pendingTimer = null;
let syncing = false;

onAuthStateChanged(auth, user => {
    isAdmin = !!user && user.uid === ADMIN_UID;
    uploadButton.style.display = isAdmin ? "inline-flex" : "none";

    // 暫時停止登入後自動同步，避免覆蓋雲端資料
        clearTimeout(pendingTimer);
});

function readChecklists() {
    const raw = localStorage.getItem("pinkPlannerChecklists");

    if (raw === null) return null;

    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
        throw new Error("打卡清單資料格式不正確");
    }

    return data;
}

async function syncChecklists() {
    if (!isAdmin || syncing) return;

    const user = auth.currentUser;
    if (!user || user.uid !== ADMIN_UID) return;

    let checklists;
    let trip;
    
try {
    checklists = readChecklists();

    trip = JSON.parse(
        localStorage.getItem("pinkPlannerTrip") || "null"
    );
} catch (error) {
        console.error("讀取打卡清單失敗：", error);
        uploadButton.textContent = "⚠️ 同步失敗";
        return;
    }

    if (checklists === null) return;

    const serialized = JSON.stringify({ trip, checklists });

    if (serialized === lastUploaded) return;

    syncing = true;
    uploadButton.textContent = "☁️ 同步中...";

    try {
await setDoc(doc(db, "publicChecklists", "main"), {
    trip: trip,
    checklists: checklists,
    updatedAt: new Date().toISOString()
});

        lastUploaded = serialized;
        uploadButton.textContent = "✓ 已同步";
    } catch (error) {
        console.error("Firebase 同步失敗：", error);
        uploadButton.textContent = "⚠️ 同步失敗";
    } finally {
        syncing = false;

        const latest = JSON.stringify({
    trip: JSON.parse(localStorage.getItem("pinkPlannerTrip") || "null"),
    checklists: JSON.parse(localStorage.getItem("pinkPlannerChecklists") || "[]")
});
        if (isAdmin && latest !== serialized) {
            scheduleSync();
        }
    }
}

function scheduleSync() {
    // 暫時停用自動同步與手動同步
    // 等雲端打卡清單安全匯入後再恢復
    return;
}

// 監聽同一個頁面對 localStorage 的修改
const originalSetItem = Storage.prototype.setItem;

Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);

    if (
        this === localStorage &&
        key === "pinkPlannerChecklists"
    ) {
        scheduleSync();
    }
};


/* ===== 旅遊基本資料修改後自動同步 ===== */

document.getElementById("saveTripButton")
    .addEventListener("click", () => {
        // 等待原本的 script.js 儲存完成
        setTimeout(() => {
            if (isAdmin) {
                scheduleSync();
            }
        }, 100);
    });

// 手動重新同步
uploadButton.addEventListener("click", () => {
    lastUploaded = null;
    scheduleSync();
});
