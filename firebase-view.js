
import { initializeApp, getApps, getApp }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import { getAuth, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { getFirestore, doc, onSnapshot }
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

// ===== 建立朋友版畫面 =====

const viewer = document.createElement("div");
viewer.id = "firebaseViewer";
viewer.style.display = "none";
viewer.style.padding = "0";

document.querySelector(".main-tabs").after(viewer);

const tripCard = document.createElement("section");
tripCard.className = "trip-card";

const tripLabel = document.createElement("div");
tripLabel.className = "trip-label";
tripLabel.textContent = "MY TRAVEL DIARY";

const tripTitle = document.createElement("h1");
const tripDescription = document.createElement("p");
tripDescription.textContent = "記錄與防彈美好的旅程 ♡";

const tripInfo = document.createElement("div");
tripInfo.className = "trip-info";

tripCard.append(tripLabel, tripTitle, tripDescription, tripInfo);
viewer.appendChild(tripCard);

// ===== 每日行程 / 打卡清單分頁 =====

const tabs = document.createElement("div");
tabs.className = "main-tabs";

const scheduleTab = document.createElement("button");
scheduleTab.className = "main-tab active";
scheduleTab.textContent = "♡ 每日行程";

const checklistTab = document.createElement("button");
checklistTab.className = "main-tab";
checklistTab.textContent = "♡ 打卡清單";

tabs.append(scheduleTab, checklistTab);
viewer.appendChild(tabs);

const scheduleSection = document.createElement("section");
const dateTabs = document.createElement("div");
dateTabs.id = "sharedDateTabs";

const scheduleList = document.createElement("div");
scheduleSection.append(dateTabs, scheduleList);

const checklistSection = document.createElement("section");
checklistSection.style.display = "none";

viewer.append(scheduleSection, checklistSection);

// ===== 畫面狀態 =====

let sharedData = null;
let selectedDate = null;
let activeTab = "schedule";

function textElement(tag, value, className = "") {
    const el = document.createElement(tag);
    el.textContent = value == null ? "" : String(value);
    if (className) el.className = className;
    return el;
}


/* ===== 朋友版只顯示打卡清單 ===== */

scheduleTab.style.display = "none";
scheduleSection.style.display = "none";

checklistTab.classList.add("active");
scheduleTab.classList.remove("active");

activeTab = "checklist";


function switchTab(tab) {
    activeTab = tab;

    scheduleSection.style.display =
        tab === "schedule" ? "block" : "none";

    checklistSection.style.display =
        tab === "checklist" ? "block" : "none";

    scheduleTab.classList.toggle("active", tab === "schedule");
    checklistTab.classList.toggle("active", tab === "checklist");
}

scheduleTab.addEventListener("click", () => switchTab("schedule"));
checklistTab.addEventListener("click", () => switchTab("checklist"));

// ===== 日期處理 =====

function getDates(trip, events) {
    const eventDates = events.map(e => e.date).filter(Boolean);

    if (trip.startDate && trip.endDate) {
        const start = new Date(trip.startDate + "T12:00:00");
        const end = new Date(trip.endDate + "T12:00:00");

        if (
            !Number.isNaN(start.getTime()) &&
            !Number.isNaN(end.getTime()) &&
            end >= start &&
            (end - start) / 86400000 <= 366
        ) {
            const dates = [];

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                dates.push(`${year}-${month}-${day}`);
            }

            return dates;
        }
    }

    return [...new Set(eventDates)].sort();
}

// ===== 顯示每日行程 =====

function renderSchedule() {
    dateTabs.replaceChildren();
    scheduleList.replaceChildren();

    const trip = sharedData?.trip || {};
    const events = Array.isArray(sharedData?.events)
        ? sharedData.events : [];

    const dates = getDates(trip, events);

    if (!dates.includes(selectedDate)) {
        selectedDate = dates[0] || null;
    }

    if (!selectedDate) {
        scheduleList.appendChild(
            textElement("p", "♡ 目前還沒有行程", "empty-message")
        );
        return;
    }

    dates.forEach((date, index) => {
        const button = document.createElement("button");
        button.className = "date-tab";

        if (date === selectedDate) {
            button.classList.add("active");
        }

        button.textContent =
            `DAY ${String(index + 1).padStart(2, "0")}\n${date.slice(5).replace("-", "/")}`;

        button.addEventListener("click", () => {
            selectedDate = date;
            renderSchedule();
        });

        dateTabs.appendChild(button);
    });

    const dayNumber = dates.indexOf(selectedDate) + 1;

    scheduleList.appendChild(
        textElement(
            "div",
            `DAY ${String(dayNumber).padStart(2, "0")} ♡ ${selectedDate}`,
            "day-group-header"
        )
    );

    const todayEvents = events
        .filter(e => e.date === selectedDate)
        .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

    if (todayEvents.length === 0) {
        scheduleList.appendChild(
            textElement(
                "p",
                "♡ 今天還沒有安排活動",
                "empty-message"
            )
        );
    }

    todayEvents.forEach(event => {
        const row = document.createElement("div");
        row.className = "schedule-item shared-schedule-item";

        if (event.completed === true) {
            row.classList.add("completed");
        }

        // 唯讀完成狀態，不允許朋友修改
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "complete-checkbox";
        checkbox.checked = event.completed === true;
        checkbox.disabled = true;

        const time = textElement(
            "span",
            event.time || "",
            "time"
        );

        const content = document.createElement("div");
        content.className = "event";

        content.appendChild(
            textElement("h3", event.title || "")
        );

        if (event.place) {
            content.appendChild(
                textElement("p", "📍 " + event.place)
            );
        }

        if (event.note) {
            content.appendChild(
                textElement("p", "♡ " + event.note)
            );
        }

        if (event.transport) {
            const transportBox = document.createElement("div");
            transportBox.className = "transport-box";

            const icons = {
                "步行": "🚶",
                "捷運": "🚇",
                "輕軌": "🚈",
                "火車": "🚆",
                "高鐵": "🚄",
                "公車": "🚌",
                "計程車": "🚕",
                "其他": "🚗"
            };

            const title =
                (icons[event.transport] || "🚗") +
                " " + event.transport +
                (event.transportRoute
                    ? "｜" + event.transportRoute : "");

            transportBox.appendChild(
                textElement("div", title, "transport-title")
            );

            if (event.transportFrom || event.transportTo) {
                transportBox.appendChild(
                    textElement(
                        "div",
                        (event.transportFrom || "未填出發地") +
                        " → " +
                        (event.transportTo || "未填抵達地"),
                        "transport-stations"
                    )
                );
            }

            content.appendChild(transportBox);
        }

        row.append(checkbox, time, content);
        scheduleList.appendChild(row);
    });
}

// ===== 顯示打卡清單 =====

function renderChecklists() {
    checklistSection.replaceChildren();

    const groups = Array.isArray(sharedData?.checklists)
        ? sharedData.checklists : [];

    if (groups.length === 0) {
        checklistSection.appendChild(
            textElement("p", "♡ 目前還沒有打卡清單", "empty-message")
        );
        return;
    }

    groups.forEach(group => {
        const card = document.createElement("div");
        card.className = "checklist-card";

        card.appendChild(
            textElement("h3", "♡ " + (group.name || ""))
        );

        (Array.isArray(group.items) ? group.items : []).forEach(item => {
            const box = document.createElement("div");
            box.className = "checklist-item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "checklist-checkbox";
            checkbox.checked = item.completed === true;
            checkbox.disabled = true;

            box.append(
                checkbox,
                textElement("p", item.name || "")
            );

            if (item.location) {
                box.appendChild(
                    textElement("p", "♡ 位置：" + item.location)
                );
            }

            if (item.transport) {
                box.appendChild(
                    textElement("p", "♡ 交通：" + item.transport)
                );
            }

            if (item.note) {
                box.appendChild(
                    textElement("p", "♡ 備註：" + item.note)
                );
            }

            card.appendChild(box);
        });

        checklistSection.appendChild(card);
    });
}

// ===== 更新共享畫面 =====

function renderSharedTrip(data) {
    sharedData = data;

    const trip = data?.trip || {};

    tripTitle.textContent = trip.name || "我的旅遊行程";

    tripInfo.replaceChildren(
        textElement("span", "📍 " + (trip.destination || "")),
        textElement(
            "span",
            "📅 " + (trip.startDate || "") +
            " - " + (trip.endDate || "")
        )
    );

renderChecklists();
}

// ===== 管理員與朋友畫面切換 =====

function setViewerMode(isAdmin) {
    const originalTrip = document.querySelector(".container > .trip-card");
    const originalTabs = document.querySelector(".container > .main-tabs");
    const originalSchedule = document.querySelector(".schedule-section");
    const originalChecklist = document.getElementById("checklistSection");

    if (isAdmin) {
        viewer.style.display = "none";
        originalTrip.style.display = "";
        originalTabs.style.display = "";

        const tab = localStorage.getItem("pinkPlannerActiveTab");

        originalSchedule.style.display =
            tab === "checklist" ? "none" : "block";

        originalChecklist.style.display =
            tab === "checklist" ? "block" : "none";
    } else {
        viewer.style.display = "block";
        switchTab("checklist");
        originalTrip.style.display = "none";
        originalTabs.style.display = "none";
        originalSchedule.style.display = "none";
        originalChecklist.style.display = "none";
    }
}

// ===== 即時讀取 Firebase =====


onSnapshot(
    doc(db, "publicChecklists", "main"),
    snapshot => {
        if (!snapshot.exists()) {
            renderSharedTrip(null);
            return;
        }

        const data = snapshot.data();

        renderSharedTrip({
            trip: data.trip || null,
            events: [],
            checklists: data.checklists || []
        });
    },
    error => {
        console.error("Firebase 讀取失敗：", error);
        checklistSection.textContent = "♡ 打卡清單讀取失敗";
    }
);


// ===== 確認登入身分 =====

onAuthStateChanged(auth, user => {
    const isAdmin = !!user && user.uid === ADMIN_UID;
    setViewerMode(isAdmin);
});
