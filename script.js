const MAP_RESOLVER_URL =
    "https://pinkplanner-map-resolver.hanouo-607.workers.dev/";

// ===== ♡ 全站共用編輯模式 =====
let globalEditMode = false;

// 每日行程與打卡清單共用同一個編輯狀態
let scheduleEditMode = false;
let checklistEditMode = false;

// ===== 取得網頁元素 =====


const addButton = document.querySelector(".schedule-section .add-button");
// ===== ♡ 預設隱藏新增行程按鈕 =====
addButton.style.display = "none";
const modal = document.getElementById("addModal");
const closeButton = document.getElementById("closeModal");
const saveButton = document.getElementById("saveEvent");
const scheduleList = document.getElementById("scheduleList");

// ===== 讀取已儲存的行程 =====

let events = JSON.parse(localStorage.getItem("pinkPlannerEvents")) || [];
 
// ===== 編輯行程模式 =====

// null 代表新增行程
// 有行程 ID 代表正在編輯行程

let editingEventId = null;


// ===== 開啟新增視窗 =====

addButton.addEventListener("click", function () {

    // 重設為新增模式
    editingEventId = null;

    // 恢復新增行程標題
    document.getElementById("modalTitle").textContent =
        "♡ 新增我的行程";

    // 清空上次輸入的資料
    
document.getElementById("eventDate").value = selectedDate || "";
    document.getElementById("eventTime").value = "";
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventPlace").value = "";
    document.getElementById("eventNote").value = "";
    // ===== ♡ 清空 Google Maps 網址 =====
document.getElementById("eventMapUrl").value = "";

// ===== ♡ 新增行程時清空社群網址 =====
document.getElementById("eventShopInfo").value = "";

// ===== ♡ 新增行程時預設 Instagram =====
document.getElementById("eventShopPlatform").value = "instagram";
    
 
// 清空交通資訊
document.getElementById("eventTransport").value = "";
document.getElementById("transportFrom").value = "";
document.getElementById("transportTo").value = "";
document.getElementById("transportRoute").value = "";


    // 開啟視窗
    modal.style.display = "flex";
});



closeButton.addEventListener("click", function () {

    // 取消編輯模式
    editingEventId = null;

    // 關閉視窗
    modal.style.display = "none";
});


// ===== 儲存行程資料 =====

saveButton.addEventListener("click", function () {

    const date = document.getElementById("eventDate").value;
    const time = document.getElementById("eventTime").value;
    const title = document.getElementById("eventTitle").value.trim();
    const place = document.getElementById("eventPlace").value.trim();
    const note = document.getElementById("eventNote").value.trim();
    // ===== ♡ 取得 Google Maps 網址 =====
const mapUrl = document.getElementById("eventMapUrl").value.trim();
// ===== ♡ 取得店家資訊 =====
const shopInfo = document.getElementById("eventShopInfo").value.trim();

// ===== ♡ 取得店家／社群平台 =====
const shopPlatform = document.getElementById("eventShopPlatform").value;
    
// ===== 取得交通資訊 =====

const transport = document.getElementById("eventTransport").value;
const transportFrom = document.getElementById("transportFrom").value.trim();
const transportTo = document.getElementById("transportTo").value.trim();
const transportRoute = document.getElementById("transportRoute").value.trim();


    // 檢查必填資料

    if (!date || !time || !title) {
        alert("請填寫日期、時間及行程名稱喔！♡");
        return;
    }

    
// ===== 判斷新增或編輯行程 =====

if (editingEventId !== null) {

    // 編輯模式：更新原本的行程
    const existingEvent = events.find(function (event) {
        return event.id === editingEventId;
    });

    if (existingEvent) {
        existingEvent.date = date;
        existingEvent.time = time;
        existingEvent.title = title;
        existingEvent.place = place;
        existingEvent.note = note;
        existingEvent.mapUrl = mapUrl;
        existingEvent.shopInfo = shopInfo;
        existingEvent.shopPlatform = shopPlatform;
existingEvent.transport = transport;
existingEvent.transportFrom = transportFrom;
existingEvent.transportTo = transportTo;
existingEvent.transportRoute = transportRoute;

    }

    // 切換到修改後的日期分頁
    selectedDate = date;

} else {

    // 新增模式：建立新行程
const newEvent = {
    id: Date.now(),
    date: date,
    time: time,
    title: title,
    place: place,
    note: note,
    mapUrl: mapUrl,
    shopInfo: shopInfo,
    shopPlatform: shopPlatform,
    transport: transport,
    transportFrom: transportFrom,
    transportTo: transportTo,
    transportRoute: transportRoute
};

    events.push(newEvent);

    // 切換到新增行程的日期
    selectedDate = date;
    }

    // 重設編輯模式
    editingEventId = null;


    // 依照日期及時間排序

    events.sort(function (a, b) {
        return (a.date + a.time).localeCompare(b.date + b.time);
    });

    // 儲存到瀏覽器

    localStorage.setItem("pinkPlannerEvents", JSON.stringify(events));

    // 更新畫面

    renderEvents();

    // 清空輸入欄位

    document.getElementById("eventDate").value = "";
    document.getElementById("eventTime").value = "";
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventPlace").value = "";
    document.getElementById("eventNote").value = "";

    // 關閉視窗

    modal.style.display = "none";

    alert("行程已成功儲存！♡");
});

// ===== 顯示行程 =====



// ===== 目前選擇的日期 =====
let selectedDate = localStorage.getItem("pinkPlannerSelectedDate") || null;

// ===== 顯示行程：日期分頁 =====

function renderEvents() {

    const dateTabs = document.getElementById("dateTabs");

    dateTabs.innerHTML = "";
    scheduleList.innerHTML = "";

    // 取得所有日期並排序

    // 依照旅遊開始與結束日期產生日期分頁
    const savedTrip = JSON.parse(
        localStorage.getItem("pinkPlannerTrip") || "null"
    );

    let dates = [];

    if (savedTrip && savedTrip.startDate && savedTrip.endDate) {

        let current = new Date(savedTrip.startDate + "T12:00:00");
        const end = new Date(savedTrip.endDate + "T12:00:00");

        while (current <= end) {
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, "0");
            const day = String(current.getDate()).padStart(2, "0");

            dates.push(`${year}-${month}-${day}`);
            current.setDate(current.getDate() + 1);
        }

    } else {
        dates = [...new Set(events.map(function (event) {
            return event.date;
        }))].sort();
    }


    // 如果目前選擇的日期不存在，就選擇第一天
    if (!dates.includes(selectedDate)) {
        selectedDate = dates[0];
    }

    // 建立日期分頁
    dates.forEach(function (date, index) {

        const tab = document.createElement("button");
        tab.className = "date-tab";

        if (date === selectedDate) {
            tab.classList.add("active");
        }

        tab.innerHTML =
            "DAY " + String(index + 1).padStart(2, "0") +
            "<br>" + date.substring(5).replace("-", "/");

        tab.addEventListener("click", function () {
            selectedDate = date;
            renderEvents();
        });

        dateTabs.appendChild(tab);
    });

    // 只顯示目前選擇日期的行程
    const todayEvents = events
        .filter(function (event) {
            return event.date === selectedDate;
        })
        .sort(function (a, b) {
            return a.time.localeCompare(b.time);
        });

    // 建立每日標題
    const dayHeader = document.createElement("div");
    dayHeader.className = "day-group-header";

    const dayIndex = dates.indexOf(selectedDate) + 1;

    dayHeader.textContent =
        "DAY " + String(dayIndex).padStart(2, "0") +
        " ♡ " + selectedDate;

    scheduleList.appendChild(dayHeader);

    
    // ===== 當天沒有行程時顯示提示 =====

    if (todayEvents.length === 0) {

        const empty = document.createElement("p");
        empty.className = "empty-message";

        empty.textContent =
            "♡ 今天還沒有安排活動，新增一個美好的小行程吧！";

        scheduleList.appendChild(empty);
    }


    // 顯示當天行程
    todayEvents.forEach(function (event) {

        const item = document.createElement("div");
        
        // ===== 行程完成狀態 =====

        if (event.completed === true) {
        item.classList.add("completed");
        }

        item.className = "schedule-item";


        // ===== 完成行程勾選框 =====

        const completeCheckbox = document.createElement("input");
        completeCheckbox.type = "checkbox";
        completeCheckbox.className = "complete-checkbox";

        // 顯示目前完成狀態
        completeCheckbox.checked = event.completed === true;

        // 點擊勾選框時更新完成狀態
        completeCheckbox.addEventListener("change", function () {

        event.completed = completeCheckbox.checked;

        // 儲存完成狀態
        localStorage.setItem(
        "pinkPlannerEvents",
        JSON.stringify(events)
        );

    // 更新畫面
    renderEvents();
});


        const time = document.createElement("span");
        time.className = "time";
        time.textContent = event.time;

        const content = document.createElement("div");
        content.className = "event";

        const title = document.createElement("h3");
        title.textContent = event.title;

        const place = document.createElement("p");
        place.textContent = event.place ? "📍 " + event.place : "";

        const note = document.createElement("p");
        note.textContent = event.note ? "♡ " + event.note : "";
        
        // ===== 編輯行程按鈕 =====

        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "♡ 編輯";
        
        editButton.addEventListener("click", function () {

        // 記住目前編輯的行程 ID
        editingEventId = event.id;

        // 將原本的行程資料填入視窗
        document.getElementById("eventDate").value = event.date;
        document.getElementById("eventTime").value = event.time;
        document.getElementById("eventTitle").value = event.title;
        document.getElementById("eventPlace").value = event.place || "";
        document.getElementById("eventNote").value = event.note || "";
        // ===== ♡ 帶入原本的 Google Maps 網址 =====
document.getElementById("eventMapUrl").value = event.mapUrl || "";
// ===== ♡ 編輯時帶入社群平台與網址 =====
document.getElementById("eventShopInfo").value = event.shopInfo || "";
document.getElementById("eventShopPlatform").value = event.shopPlatform || "instagram";
        
// ===== 帶入原本的交通資訊 =====

document.getElementById("eventTransport").value =
    event.transport || "";

document.getElementById("transportFrom").value =
    event.transportFrom || "";

document.getElementById("transportTo").value =
    event.transportTo || "";

document.getElementById("transportRoute").value =
    event.transportRoute || "";


        // 修改視窗標題
        document.getElementById("modalTitle").textContent = "♡ 編輯我的行程";

        // 開啟視窗
        modal.style.display = "flex";

        });


        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "刪除";

        deleteButton.addEventListener("click", function () {

            if (confirm("確定要刪除這筆行程嗎？")) {

                events = events.filter(function (e) {
                    return e.id !== event.id;
                });

                localStorage.setItem(
                    "pinkPlannerEvents",
                    JSON.stringify(events)
                );

                renderEvents();
            }
        });

        content.appendChild(title);
        content.appendChild(place);
        
// ===== 顯示交通資訊 =====

if (event.transport) {

    const transportBox = document.createElement("div");
    transportBox.className = "transport-box";

    const transportTitle = document.createElement("div");
    transportTitle.className = "transport-title";

    const transportIcons = {
        "步行": "🚶",
        "捷運": "🚇",
        "輕軌": "🚈",
        "火車": "🚆",
        "高鐵": "🚄",
        "公車": "🚌",
        "飛機": "✈️",
        "計程車": "🚕",
        "其他": "🚗"
    };

    transportTitle.textContent =
        (transportIcons[event.transport] || "🚗") +
        " " + event.transport +
        (event.transportRoute ? "｜" + event.transportRoute : "");

    transportBox.appendChild(transportTitle);

    // 顯示出發站與抵達站
    if (event.transportFrom || event.transportTo) {

        const transportStations = document.createElement("div");
        transportStations.className = "transport-stations";

        transportStations.textContent =
            (event.transportFrom || "未填出發地") +
            " → " +
            (event.transportTo || "未填抵達地");

        transportBox.appendChild(transportStations);
    }

    content.appendChild(transportBox);
}


// ===== ♡ 店家／社群平台超連結 =====
if (event.shopInfo) {

    const platformNames = {
        instagram: "Instagram",
        facebook: "Facebook",
        threads: "Threads",
        website: "店家官網",
        other: "其他連結"
    };

    try {
        const shopUrl = new URL(event.shopInfo);

        if (["https:", "http:"].includes(shopUrl.protocol)) {

            const shopLink = document.createElement("a");

            shopLink.href = shopUrl.href;
            shopLink.target = "_blank";
            shopLink.rel = "noopener noreferrer";
            shopLink.className = "schedule-shop-link";

            shopLink.textContent =
                platformNames[event.shopPlatform] || "🔗 其他連結";

            content.appendChild(shopLink);
        }

    } catch (error) {
        console.warn("店家／社群網址格式不正確：", event.shopInfo);
    }
}

// ===== ♡ Google Maps 地圖超連結 =====
if (event.mapUrl) {
    try {
        const mapAddress = new URL(event.mapUrl);

        if (["https:", "http:"].includes(mapAddress.protocol)) {
            const mapLink = document.createElement("a");

            mapLink.href = mapAddress.href;
            mapLink.target = "_blank";
            mapLink.rel = "noopener noreferrer";
            mapLink.className = "schedule-map-link";
            mapLink.textContent = "🗺️ Google Maps";

            content.appendChild(mapLink);
        }
    } catch (error) {
        console.warn("Google Maps 網址格式不正確：", event.mapUrl);
    }
}

// ===== ♡ 備註顯示在交通卡片下方 =====
if (event.note) {
    note.classList.add("schedule-note");
    content.appendChild(note);
}

// ===== ♡ 只有編輯模式才顯示編輯、刪除 =====
if (scheduleEditMode) {
    content.appendChild(editButton);
    content.appendChild(deleteButton);
}

        item.appendChild(completeCheckbox);
        item.appendChild(time);
        item.appendChild(content);

        scheduleList.appendChild(item);
    });
}

// ===== 網頁開啟時自動載入 =====

renderEvents();


/* ===== 編輯旅遊資料視窗 ===== */

const editTripButton = document.getElementById("editTripButton");
// ===== ♡ 預設隱藏編輯旅遊資料按鈕 =====
editTripButton.style.display = "none";
const tripModal = document.getElementById("tripModal");
const closeTripButton = document.getElementById("closeTripButton");

// 點擊編輯按鈕，開啟視窗
editTripButton.addEventListener("click", function () {
    tripModal.style.display = "flex";
});

// 點擊取消，關閉視窗
closeTripButton.addEventListener("click", function () {
    tripModal.style.display = "none";
});


/* ===== 儲存旅遊基本資料 ===== */

const saveTripButton = document.getElementById("saveTripButton");

saveTripButton.addEventListener("click", function () {

    const name = document.getElementById("tripName").value.trim();
    const destination = document.getElementById("tripDestination").value.trim();
    const startDate = document.getElementById("tripStartDate").value;
    const endDate = document.getElementById("tripEndDate").value;

    if (!name || !destination || !startDate || !endDate) {
        alert("請填寫完整的旅遊資料 ♡");
        return;
    }

    if (endDate < startDate) {
        alert("結束日期不能早於開始日期喔 ♡");
        return;
    }

    const tripData = {
        name: name,
        destination: destination,
        startDate: startDate,
        endDate: endDate
    };

    // 儲存到瀏覽器
    localStorage.setItem("pinkPlannerTrip", JSON.stringify(tripData));
    // ♡ 通知 Firebase：旅遊標題與日期已修改
window.dispatchEvent(new CustomEvent("pinkPlannerTripChanged", {
    detail: tripData
}));

    // 更新首頁旅遊名稱
    document.querySelector(".trip-card h1").textContent = name;

    // 更新目的地
    document.getElementById("tripDestinationDisplay").textContent =
        "📍 " + destination;

    // 更新旅遊日期
    document.getElementById("tripDateDisplay").textContent =
        "📅 " + startDate.replaceAll("-", ".") +
        " - " + endDate.slice(5).replace("-", ".");



    // 關閉編輯視窗
    tripModal.style.display = "none";

    // 切換到新旅遊日期的第一天
    selectedDate = startDate;

    // 立即更新 DAY 日期分頁與行程
    renderEvents();

    alert("旅遊資料儲存成功 ♡");

});


/* ===== 網頁開啟時，自動載入旅遊資料 ===== */

    
/* ===== 網頁開啟時，自動載入旅遊資料 ===== */

function loadTripData() {

    const savedTrip = localStorage.getItem("pinkPlannerTrip");

    if (!savedTrip) {
        return;
    }

    const tripData = JSON.parse(savedTrip);

    // 顯示旅遊名稱
    document.querySelector(".trip-card h1").textContent =
        tripData.name;

    // 顯示目的地
    document.getElementById("tripDestinationDisplay").textContent =
        "📍 " + tripData.destination;

    // 顯示旅遊日期
    document.getElementById("tripDateDisplay").textContent =
        "📅 " + tripData.startDate.replaceAll("-", ".") +
        " - " + tripData.endDate.slice(5).replace("-", ".");

    // 將資料填入編輯視窗
    document.getElementById("tripName").value = tripData.name;
    document.getElementById("tripDestination").value = tripData.destination;
    document.getElementById("tripStartDate").value = tripData.startDate;
    document.getElementById("tripEndDate").value = tripData.endDate;
}


/* ===== ♡ PinkPlanner 地圖初始化 ===== */

let checklistMap = null;

function initChecklistMap() {

    // 確認 Leaflet 已載入
    if (typeof L === "undefined") {
        console.error("Leaflet 尚未載入");
        return;
    }

    // 第一次開啟時建立地圖
    if (!checklistMap) {

        checklistMap = L.map("checklistMap").setView(
            [22.645, 120.29],
            12
        );

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(checklistMap);
    }

    // 更新地圖大小
    checklistMap.invalidateSize();

    // 移除舊的打卡標記，保留地圖底圖
    checklistMap.eachLayer(function (layer) {
        if (layer instanceof L.CircleMarker) {
            checklistMap.removeLayer(layer);
        }
    });

    // ===== ♡ 目前兩筆測試地點的座標 =====
    const testLocations = {
        "414": [22.665173, 120.302745],
        "22245": [22.6208818, 120.2806123]
    };

    // 讀取打卡清單
    const mapItems = getChecklistMapItems();

    const markerPositions = [];

    mapItems.forEach(function (item) {

        const position = testLocations[item.name];

        // 暫時跳過還沒有座標的地點
        if (!position) return;

        const markerColor = item.completed
            ? "#9864C8"   // 已完成：紫色
            : "#EAA1C5";  // 未完成：粉紅色

        const marker = L.circleMarker(position, {
            radius: 11,
            color: markerColor,
            fillColor: markerColor,
            fillOpacity: 0.9,
            weight: 2
        });

        marker.addTo(checklistMap);

        // 點擊標記顯示打卡點名稱與狀態
        const popup = document.createElement("div");

        const nameText = document.createElement("strong");
        nameText.textContent = item.name;

        const statusText = document.createElement("div");
        statusText.textContent = item.completed
            ? "💜 已完成"
            : "💗 未完成";

        popup.appendChild(nameText);
        popup.appendChild(statusText);

        marker.bindPopup(popup);

        markerPositions.push(position);

    });

    // 自動調整範圍，讓所有標記都看得到
    if (markerPositions.length > 1) {

        checklistMap.fitBounds(markerPositions, {
            padding: [30, 30],
            maxZoom: 15
        });

    } else if (markerPositions.length === 1) {

        checklistMap.setView(markerPositions[0], 15);

    }
}

/* ===== PinkPlanner 主分頁切換與記憶 ===== */

const scheduleTab = document.getElementById("scheduleTab");
const checklistTab = document.getElementById("checklistTab");
const mapTab = document.getElementById("mapTab");

const scheduleSection = document.querySelector(".schedule-section");
const checklistSection = document.getElementById("checklistSection");
const mapSection = document.getElementById("mapSection");

// 切換分頁並儲存位置
function switchMainTab(tabName) {

    // 先隱藏三個分頁
    scheduleSection.style.display = "none";
    checklistSection.style.display = "none";
    mapSection.style.display = "none";

    // 移除三個分頁的選取狀態
    scheduleTab.classList.remove("active");
    checklistTab.classList.remove("active");
    mapTab.classList.remove("active");

    // 顯示指定分頁
    if (tabName === "checklist") {

        checklistSection.style.display = "block";
        checklistTab.classList.add("active");

    } else if (tabName === "map") {

        mapSection.style.display = "block";
        mapTab.classList.add("active");

    } else {

        tabName = "schedule";
        scheduleSection.style.display = "block";
        scheduleTab.classList.add("active");

    }

    // 記住目前分頁
    localStorage.setItem("pinkPlannerActiveTab", tabName);
}

// 點擊每日行程
scheduleTab.addEventListener("click", function () {
    switchMainTab("schedule");
});

// 點擊打卡清單
checklistTab.addEventListener("click", function () {
    switchMainTab("checklist");
});

// 點擊地圖
mapTab.addEventListener("click", function () {
    switchMainTab("map");

    setTimeout(function () {
        initChecklistMap();
    }, 100);
});

// 網頁載入時恢復上次的主分頁
const savedMainTab =
    localStorage.getItem("pinkPlannerActiveTab") || "schedule";

switchMainTab(savedMainTab);

if (savedMainTab === "map") {
    initChecklistMap();
}


/* ===== 打卡清單視窗開啟與關閉 ===== */

const addChecklistButton = document.getElementById("addChecklistButton");
// ===== ♡ 預設隱藏新增打卡清單 =====
addChecklistButton.style.display = "none";
const checklistModal = document.getElementById("checklistModal");
const closeChecklistButton = document.getElementById("closeChecklistButton");

addChecklistButton.addEventListener("click", function () {
    document.getElementById("checklistName").value = "";
    checklistModal.style.display = "flex";
});

closeChecklistButton.addEventListener("click", function () {
    checklistModal.style.display = "none";
});


/* ===== 關閉新增打卡點視窗 ===== */

const checklistItemModal = document.getElementById("checklistItemModal");

const closeChecklistItemButton = document.getElementById(
    "closeChecklistItemButton"
);

closeChecklistItemButton.addEventListener("click", function () {
    checklistItemModal.style.display = "none";
});


/* ===== 儲存打卡清單 ===== */

let checklists = JSON.parse(
    localStorage.getItem("pinkPlannerChecklists")
) || [];

document.getElementById("saveChecklistButton")
    .addEventListener("click", function () {

        const name = document.getElementById("checklistName").value.trim();

        if (name === "") {
            alert("請輸入景點或區域名稱 ♡");
            return;
        }

        checklists.push({
            id: Date.now(),
            name: name,
            items: []
        });

        localStorage.setItem(
            "pinkPlannerChecklists",
            JSON.stringify(checklists)
        );

        document.getElementById("checklistModal").style.display = "none";

        renderChecklists();
        alert("打卡清單儲存成功 ♡");
    });

/* ===== 顯示打卡清單 ===== */

function renderChecklists() {

    const container = document.getElementById("checklistGroups");

    container.innerHTML = "";

    checklists.forEach(function (checklist) {

        // 建立景點清單卡片
        const card = document.createElement("div");
        card.className = "checklist-card";

        // 景點或區域名稱
        const title = document.createElement("h3");
        // ===== ♡ 計算打卡清單完成進度 =====
const totalCount = checklist.items.length;

const completedCount = checklist.items.filter(function (item) {
    return item.completed === true;
}).length;

// 顯示清單名稱與完成數量
title.textContent =
    checklist.name +
    " (" + completedCount + "/" + totalCount + ")";
        
        // 分類標題與操作按鈕
        const groupHeader = document.createElement("div");
        groupHeader.className = "checklist-group-header";

        const groupActions = document.createElement("div");
        groupActions.className = "checklist-group-actions";

        // 編輯分類
        const editGroupButton = document.createElement("button");
        editGroupButton.textContent = "✎ 編輯";
        editGroupButton.className = "edit-checklist-item-button";

        editGroupButton.addEventListener("click", function () {
            const newName = prompt("修改打卡清單名稱 ♡", checklist.name);

            if (newName === null) return;

            if (newName.trim() === "") {
                alert("清單名稱不能空白 ♡");
                return;
            }

            checklist.name = newName.trim();

            localStorage.setItem(
                "pinkPlannerChecklists",
                JSON.stringify(checklists)
            );

            renderChecklists();
        });

        // 刪除分類
        const deleteGroupButton = document.createElement("button");
        deleteGroupButton.textContent = "✕ 刪除";
        deleteGroupButton.className = "delete-checklist-item-button";

        deleteGroupButton.addEventListener("click", function () {
            const confirmed = confirm(
                "確定刪除「" + checklist.name +
                "」以及裡面的所有打卡點嗎？此操作無法復原。"
            );

            if (!confirmed) return;

            checklists = checklists.filter(function (group) {
                return group.id !== checklist.id;
            });

            localStorage.setItem(
                "pinkPlannerChecklists",
                JSON.stringify(checklists)
            );

            renderChecklists();
        });

// ===== ♡ 編輯模式才顯示清單編輯、刪除 =====
if (checklistEditMode) {
    groupActions.appendChild(editGroupButton);
    groupActions.appendChild(deleteGroupButton);
}

        groupHeader.appendChild(title);
        groupHeader.appendChild(groupActions);



card.appendChild(groupHeader);
// ===== ♡ 打卡清單愛心收合功能 =====

// 記住每個清單是否收合
const collapsedKey = "pinkPlannerCollapsed_" + checklist.id;

let isCollapsed =
    localStorage.getItem(collapsedKey) === "true";

    // ===== ♡ 根據收合狀態切換愛心 =====
title.textContent =
    (isCollapsed ? "♥ " : "♡ ") +
    checklist.name +
    " (" + completedCount + "/" + totalCount + ")";

// 點擊標題前面的愛心，切換收合狀態
title.style.cursor = "pointer";

title.addEventListener("click", function (event) {

    // 只有點擊愛心才收合
    const rect = title.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    if (clickX > 24) return;

    isCollapsed = !isCollapsed;

    localStorage.setItem(collapsedKey, String(isCollapsed));

    renderChecklists();
});

// 收合時不顯示打卡點
if (isCollapsed) {
    card.classList.add("checklist-collapsed");
}


        // 顯示這個景點清單裡的打卡點
        if (!isCollapsed) checklist.items.forEach(function (item) {

            const itemDiv = document.createElement("div");
            itemDiv.className = "checklist-item";

            // ===== ♡ 打卡點拖曳排序 =====
if (checklistEditMode) {

    // 允許其他打卡點拖曳到這張卡片
    itemDiv.addEventListener("dragover", function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    });

    // 放開滑鼠後調整順序
    itemDiv.addEventListener("drop", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const draggedId = Number(
            event.dataTransfer.getData("text/plain")
        );

        const fromIndex = checklist.items.findIndex(function (savedItem) {
            return savedItem.id === draggedId;
        });

        const toIndex = checklist.items.findIndex(function (savedItem) {
            return savedItem.id === item.id;
        });

        // 找不到打卡點或拖回原位時，不做任何修改
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
            return;
        }

        // 調整打卡點在陣列中的順序
        const movedItem = checklist.items.splice(fromIndex, 1)[0];
        checklist.items.splice(toIndex, 0, movedItem);

        // 儲存新的排序
        try {
            localStorage.setItem(
                "pinkPlannerChecklists",
                JSON.stringify(checklists)
            );
        } catch (error) {
            // 儲存失敗時恢復原本順序
            checklist.items.splice(toIndex, 1);
            checklist.items.splice(fromIndex, 0, movedItem);

            alert("♡ 排序儲存失敗，原本順序已保留！");
            return;
        }

        // 更新畫面
        renderChecklists();
    });
}

            const itemName = document.createElement("p");
            itemName.textContent = item.name;

// ===== ♡ 打卡點拖曳把手 =====
if (checklistEditMode) {

    const dragHandle = document.createElement("span");

dragHandle.className = "checklist-drag-handle";
dragHandle.textContent = "";
dragHandle.title = "按住拖曳調整順序";

// ===== ♡ 避免手機長按出現文字選取或複製選單 =====
dragHandle.style.webkitUserSelect = "none";
dragHandle.style.webkitTouchCallout = "none";

    // ===== ♡ 只有按住把手才能開始拖曳 =====
// ===== ♡ 拖曳時讓整張打卡點卡片一起移動 =====
itemDiv.draggable = true;

// 只有按住右上角把手才能拖曳
itemDiv.draggable = false;

// ===== ♡ 只有滑鼠操作才啟用電腦原生拖曳 =====
dragHandle.addEventListener("mousedown", function (event) {
    if (event.button !== 0) return;

    // 手機觸控不啟用 HTML 原生拖曳
    if (window.matchMedia("(pointer: coarse)").matches) return;

    itemDiv.draggable = true;
});

itemDiv.addEventListener("dragstart", function (event) {
    event.dataTransfer.setData("text/plain", String(item.id));
    event.dataTransfer.effectAllowed = "move";
});

itemDiv.addEventListener("dragend", function () {
    itemDiv.draggable = false;
});

dragHandle.addEventListener("mouseup", function () {
    itemDiv.draggable = false;
});

// ===== ♡ 手機觸控拖曳排序 =====
let touchStartY = 0;
let touchTargetItem = null;

dragHandle.addEventListener("touchstart", function (event) {
    if (event.touches.length !== 1) return;

    touchStartY = event.touches[0].clientY;
    touchTargetItem = null;

    itemDiv.classList.add("checklist-touch-dragging");
}, { passive: true });

dragHandle.addEventListener("touchmove", function (event) {
    if (event.touches.length !== 1) return;

    event.preventDefault();

    const touch = event.touches[0];
    const moveY = touch.clientY - touchStartY;

    itemDiv.style.transform = `translateY(${moveY}px)`;
    itemDiv.style.zIndex = "100";

    itemDiv.style.pointerEvents = "none";

    const target = document.elementFromPoint(
        touch.clientX,
        touch.clientY
    );

    itemDiv.style.pointerEvents = "";

    touchTargetItem = target?.closest(".checklist-item") || null;
}, { passive: false });

dragHandle.addEventListener("touchend", function () {
    itemDiv.style.transform = "";
    itemDiv.style.zIndex = "";
    itemDiv.classList.remove("checklist-touch-dragging");

    if (!touchTargetItem || touchTargetItem === itemDiv) {
        touchTargetItem = null;
        return;
    }

    const fromIndex = checklist.items.findIndex(function (savedItem) {
        return savedItem.id === item.id;
    });

    const toIndex = Array.from(
        card.querySelectorAll(".checklist-item")
    ).indexOf(touchTargetItem);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        touchTargetItem = null;
        return;
    }

    const movedItem = checklist.items.splice(fromIndex, 1)[0];
    checklist.items.splice(toIndex, 0, movedItem);

    try {
        localStorage.setItem(
            "pinkPlannerChecklists",
            JSON.stringify(checklists)
        );
    } catch (error) {
        checklist.items.splice(toIndex, 1);
        checklist.items.splice(fromIndex, 0, movedItem);

        alert("♡ 排序儲存失敗，原本順序已保留！");
    }

    touchTargetItem = null;
    renderChecklists();
});

dragHandle.addEventListener("touchcancel", function () {
    itemDiv.style.transform = "";
    itemDiv.style.zIndex = "";
    itemDiv.classList.remove("checklist-touch-dragging");
    touchTargetItem = null;
});

itemDiv.appendChild(dragHandle);
}

// 建立打卡勾選框
const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.className = "checklist-checkbox";

// 讀取打卡狀態
checkbox.checked = item.completed === true;

// 點擊後儲存打卡狀態
checkbox.addEventListener("change", function () {

    item.completed = checkbox.checked;

    localStorage.setItem(
        "pinkPlannerChecklists",
        JSON.stringify(checklists)
    );

    // ===== ♡ 即時更新打卡完成數量 =====
    renderChecklists();

});

// ===== ♡ 打卡勾選框與名稱對齊 =====
const checklistTitleRow = document.createElement("div");
checklistTitleRow.className = "checklist-title-row";

checklistTitleRow.appendChild(checkbox);
checklistTitleRow.appendChild(itemName);

itemDiv.appendChild(checklistTitleRow);

// ===== ♡ 打卡點粉嫩交通資訊 =====
if (item.transport || item.transportTo || item.transportRoute) {

    const transportBox = document.createElement("div");
    transportBox.className = "transport-box";

    const transportIcons = {
        "步行": "🚶",
        "捷運": "🚇",
        "輕軌": "🚈",
        "火車": "🚆",
        "高鐵": "🚄",
        "公車": "🚌",
        "計程車": "🚕",
        "其他": "🚗"
    };

    const transportTitle = document.createElement("div");
    transportTitle.className = "transport-title";

    transportTitle.textContent =
        (item.transport
            ? (transportIcons[item.transport] || "🚗") + " " + item.transport
            : "♡ 交通資訊") +
        (item.transportRoute ? "｜" + item.transportRoute : "");

    transportBox.appendChild(transportTitle);

    if (item.transportTo) {
        const transportLocation = document.createElement("div");
        transportLocation.className = "transport-stations";
        transportLocation.textContent = "📍 " + item.transportTo;
        transportBox.appendChild(transportLocation);
    }

    itemDiv.appendChild(transportBox);
}

// ===== ♡ 打卡點店家／社群平台連結 =====
if (item.shopInfo) {

    const platformNames = {
        instagram: "Instagram",
        facebook: "Facebook",
        threads: "Threads",
        website: "店家官網",
        other: "其他連結"
    };

    try {
        const shopUrl = new URL(item.shopInfo);

        if (["https:", "http:"].includes(shopUrl.protocol)) {

            const shopLink = document.createElement("a");

            shopLink.href = shopUrl.href;
            shopLink.target = "_blank";
            shopLink.rel = "noopener noreferrer";

            // 沿用每日行程的粉嫩按鈕樣式
            shopLink.className = "schedule-shop-link";

            shopLink.textContent =
                platformNames[item.shopPlatform] || "其他連結";

            itemDiv.appendChild(shopLink);
        }

    } catch (error) {
        console.warn("打卡點社群網址格式不正確：", item.shopInfo);
    }
}
// ===== ♡ 打卡點 Google Maps 粉嫩連結 =====
if (item.mapUrl) {
    try {
        const mapAddress = new URL(item.mapUrl);

        if (["https:", "http:"].includes(mapAddress.protocol)) {

            const mapLink = document.createElement("a");

            mapLink.href = mapAddress.href;
            mapLink.target = "_blank";
            mapLink.rel = "noopener noreferrer";

            // 沿用每日行程的粉嫩按鈕樣式
            mapLink.className = "schedule-map-link";

            mapLink.textContent = "🗺️ Google Maps";

            itemDiv.appendChild(mapLink);
        }

    } catch (error) {
        console.warn("打卡點 Google Maps 網址格式不正確：", item.mapUrl);
    }
}

// ===== ♡ 打卡點圖片按鈕 =====
if (item.image || item.imageId) {

    const imageButton = document.createElement("button");

    imageButton.type = "button";
    imageButton.className = "checklist-image-button";
    imageButton.textContent = "📷";
    imageButton.title = "查看打卡點圖片";

    imageButton.addEventListener("click", function () {

        const imagePreview = document.getElementById(
            "checklistImagePreview"
        );

        loadChecklistPhoto(item)
    .then(function (photo) {
        if (!photo) {
            alert("♡ 找不到照片，請確認圖片是否已儲存");
            return;
        }

        imagePreview.src = photo;
        document.getElementById(
    "checklistImageModal"
).style.display = "flex";
    })
    .catch(function (error) {
        console.error("照片讀取失敗：", error);
        alert("♡ 照片讀取失敗，請稍後再試");
    });

        document.getElementById(
            "checklistImageModal"
        ).style.display = "flex";

    });

    itemDiv.appendChild(imageButton);
}

// ===== ♡ 打卡備註獨立一行 =====
if (item.note) {
    const noteText = document.createElement("p");
    noteText.className = "checklist-note";
    noteText.textContent = "♡ 備註：" + item.note;
    noteText.style.display = "block";
noteText.style.marginLeft = "0";
noteText.style.paddingLeft = "0";
noteText.style.transform = "none";
noteText.style.clear = "both";
    itemDiv.appendChild(noteText);
}


        // 建立編輯打卡點按鈕
        const editItemButton = document.createElement("button");

        editItemButton.textContent = "✎ 編輯";
        editItemButton.className = "edit-checklist-item-button";

        
editItemButton.addEventListener("click", function () {
    // ===== ♡ 每次編輯時重設照片刪除狀態 =====
checklistImageMarkedForDeletion = false;

    // 記住目前編輯的清單和打卡點
    window.activeChecklistId = checklist.id;
    window.editingChecklistItemId = item.id;

    // 帶入原本儲存的資料
    document.getElementById("checklistItemName").value = item.name;
    // ===== ♡ 相容舊版交通資料 =====
const transportSelect = document.getElementById("checklistItemTransport");

// 移除上次編輯時暫時建立的舊資料選項
transportSelect.querySelectorAll('option[data-legacy="true"]').forEach(function (option) {
    option.remove();
});

const savedTransport = item.transport || "";

// 如果舊交通內容不在下拉選單中，暫時加入選項
if (
    savedTransport &&
    !Array.from(transportSelect.options).some(function (option) {
        return option.value === savedTransport;
    })
) {
    const legacyOption = document.createElement("option");
    legacyOption.value = savedTransport;
    legacyOption.textContent = "♡ 原本交通：" + savedTransport;
    legacyOption.dataset.legacy = "true";

    transportSelect.appendChild(legacyOption);
}

transportSelect.value = savedTransport;
    // ===== ♡ 編輯時帶入交通地點與路線 =====
document.getElementById("checklistTransportTo").value =
    item.transportTo || "";

document.getElementById("checklistTransportRoute").value =
    item.transportRoute || "";
    document.getElementById("checklistItemNote").value = item.note || "";
    // ===== ♡ 編輯時帶入 Google Maps 網址 =====
document.getElementById("checklistItemMapUrl").value =
    item.mapUrl || "";

    // ===== ♡ 編輯時帶入社群平台與網址 =====
document.getElementById("checklistItemShopPlatform").value =
    item.shopPlatform || "instagram";

document.getElementById("checklistItemShopInfo").value =
    item.shopInfo || "";

    // ===== ♡ 編輯打卡點時顯示已上傳圖片 =====
const existingImageBox = document.getElementById(
    "checklistExistingImageBox"
);

const existingImage = document.getElementById(
    "checklistExistingImage"
);

// 清空上次選擇的檔案，避免誤用舊圖片
document.getElementById("checklistItemImage").value = "";

// ===== ♡ 同時預覽舊照片與 IndexedDB 照片 =====
existingImage.removeAttribute("src");
existingImageBox.style.display = "none";

if (item.image || item.imageId) {

    loadChecklistPhoto(item)
        .then(function (photo) {

            // 避免照片讀取期間切換到其他打卡點
            if (
                window.activeChecklistId !== checklist.id ||
                window.editingChecklistItemId !== item.id
            ) {
                return;
            }

            if (photo) {
                existingImage.src = photo;
                existingImageBox.style.display = "block";
            }

        })
        .catch(function (error) {
            console.error("編輯照片預覽失敗：", error);
        });
}

    // 修改視窗標題
    document.querySelector("#checklistItemModal h2").textContent =
        "♡ 編輯打卡點";

    // 開啟視窗
    document.getElementById("checklistItemModal").style.display = "flex";

});

        
/* ===== 編輯與刪除按鈕 ===== */

// 建立刪除按鈕
const deleteItemButton = document.createElement("button");
deleteItemButton.textContent = "✕ 刪除";
deleteItemButton.className = "delete-checklist-item-button";


// 點擊刪除打卡點
deleteItemButton.addEventListener("click", function () {

    const confirmed = confirm(
        "確定要刪除「" + item.name + "」嗎？♡"
    );

    if (!confirmed) {
        return;
    }

    // 從目前清單移除打卡點
    checklist.items = checklist.items.filter(function (savedItem) {
        return savedItem.id !== item.id;
    });

    // 更新瀏覽器儲存資料
    localStorage.setItem(
        "pinkPlannerChecklists",
        JSON.stringify(checklists)
    );

    // 立即更新畫面
    renderChecklists();

});


// 建立按鈕容器
const itemActions = document.createElement("div");
itemActions.className = "checklist-item-actions";

// ===== ♡ 只有編輯模式才顯示打卡點編輯、刪除 =====
if (checklistEditMode) {

    // 將編輯、刪除按鈕放進容器
    itemActions.appendChild(editItemButton);
    itemActions.appendChild(deleteItemButton);

    // 將按鈕容器放進打卡點
    itemDiv.appendChild(itemActions);

}


card.appendChild(itemDiv);


        });


// 建立新增打卡點按鈕
const addItemButton = document.createElement("button");

addItemButton.textContent = "＋ 新增打卡點";
addItemButton.className = "add-checklist-item-button";


addItemButton.addEventListener("click", function () {
    // ===== ♡ 新增打卡點時重設照片刪除狀態 =====
checklistImageMarkedForDeletion = false;
    window.editingChecklistItemId = null;

    // ===== ♡ 新增打卡點時清空圖片 =====

// 清空上次選擇的圖片檔案
document.getElementById("checklistItemImage").value = "";

// 隱藏舊照片預覽區
document.getElementById("checklistExistingImageBox").style.display = "none";

// 清除舊照片預覽
document.getElementById("checklistExistingImage").removeAttribute("src");

    // 記住目前選擇的景點清單
    window.activeChecklistId = checklist.id;

    // 清空上一次輸入的內容
    document.getElementById("checklistItemName").value = "";
    // ===== ♡ 清除舊版交通暫存選項 =====
document.querySelectorAll(
    '#checklistItemTransport option[data-legacy="true"]'
).forEach(function (option) {
    option.remove();
});
    document.getElementById("checklistItemTransport").value = "";
    // ===== ♡ 新增打卡點時清空交通資料 =====
document.getElementById("checklistTransportTo").value = "";
document.getElementById("checklistTransportRoute").value = "";
    document.getElementById("checklistItemNote").value = "";
    // ===== ♡ 新增打卡點時清空 Google Maps =====
document.getElementById("checklistItemMapUrl").value = "";

// ===== ♡ 新增打卡點時重設社群資料 =====
document.getElementById("checklistItemShopPlatform").value = "instagram";
document.getElementById("checklistItemShopInfo").value = "";

    // 開啟新增打卡點視窗
    document.getElementById("checklistItemModal").style.display = "flex";

});


// ===== ♡ 展開清單且開啟編輯模式才顯示新增打卡點 =====
if (!isCollapsed && checklistEditMode) {
    card.appendChild(addItemButton);
}

container.appendChild(card);


    });
}


/* ===== 儲存新增的打卡點 ===== */

document.getElementById("saveChecklistItemButton")
    .addEventListener("click", async function () {

        // 取得輸入的資料
        const name = document.getElementById("checklistItemName").value.trim();
const transport = document.getElementById("checklistItemTransport").value;
const transportTo = document.getElementById("checklistTransportTo").value.trim();
const transportRoute = document.getElementById("checklistTransportRoute").value.trim();
const note = document.getElementById("checklistItemNote").value.trim();
// ===== ♡ 取得打卡點 Google Maps 網址 =====
const mapUrl = document.getElementById("checklistItemMapUrl").value.trim();
// ===== ♡ 取得打卡點社群平台與網址 =====
const shopPlatform = document.getElementById("checklistItemShopPlatform").value;
const shopInfo = document.getElementById("checklistItemShopInfo").value.trim();
// ===== ♡ 讀取打卡點上傳圖片 =====
const imageInput = document.getElementById("checklistItemImage");
const imageFile = imageInput.files[0];

let imageData = null;

if (imageFile) {
    try {
        imageData = await resizeChecklistImage(imageFile);
    } catch (error) {
        alert("圖片處理失敗：" + error.message);
        return;
    }
}

        // 打卡點名稱不可空白
        if (name === "") {
            alert("請輸入打卡點名稱 ♡");
            return;
        }

        // 找出目前選擇的景點清單
        const checklist = checklists.find(function (item) {
            return item.id === window.activeChecklistId;
        });

        if (!checklist) {
            alert("找不到對應的打卡清單");
            return;
        }

        // 新增打卡點資料

if (window.editingChecklistItemId != null) {

    // 編輯原本的打卡點
    const existingItem = checklist.items.find(function (item) {
        return item.id === window.editingChecklistItemId;
    });

    if (!existingItem) {
        alert("找不到要編輯的打卡點 ♡");
        return;
    }

    existingItem.name = name;
existingItem.transport = transport;
existingItem.transportTo = transportTo;
existingItem.transportRoute = transportRoute;
existingItem.note = note;
existingItem.mapUrl = mapUrl;
existingItem.shopPlatform = shopPlatform;
existingItem.shopInfo = shopInfo;
// ===== ♡ 編輯打卡點照片：改存 IndexedDB =====
if (imageData !== null) {

    try {
        // 先確認新照片成功存進 IndexedDB
        await savePinkPlannerPhoto(existingItem.id, imageData);

        // 成功後才更新照片參照
        existingItem.imageId = existingItem.id;
        existingItem.image = null;

    } catch (error) {
        console.error("照片儲存失敗：", error);
        alert("♡ 新照片儲存失敗，原本照片已保留！");
        return;
    }

} else if (checklistImageMarkedForDeletion) {

    // 先取消照片顯示，暫時不刪除資料庫中的照片
    existingItem.image = null;
    existingItem.imageId = null;
}

} else {

    // ===== ♡ 新增打卡點：照片存入 IndexedDB =====
    const newItemId = Date.now();

    if (imageData !== null) {
        try {
            await savePinkPlannerPhoto(newItemId, imageData);
        } catch (error) {
            console.error("照片儲存失敗：", error);
            alert("♡ 照片儲存失敗，請重試！");
            return;
        }
    }

    checklist.items.push({
        id: newItemId,
        name: name,
        transport: transport,
        transportTo: transportTo,
        transportRoute: transportRoute,
        note: note,
        mapUrl: mapUrl,
        shopPlatform: shopPlatform,
        shopInfo: shopInfo,
        image: null,
        imageId: imageData !== null ? newItemId : null,
        completed: false
    });

}

// 清除編輯狀態
window.editingChecklistItemId = null;


        // 儲存到瀏覽器
// ===== ♡ 安全儲存打卡點資料 =====
try {
    localStorage.setItem(
        "pinkPlannerChecklists",
        JSON.stringify(checklists)
    );
} catch (error) {
    alert(
        "♡ 圖片或資料太大，儲存失敗！\n" +
        "請先備份資料，並嘗試使用較小的圖片。"
    );

    // 恢復上一次成功儲存的資料
    checklists = JSON.parse(
        localStorage.getItem("pinkPlannerChecklists") || "[]"
    );

    return;
}

        // 關閉視窗
        document.getElementById("checklistItemModal").style.display = "none";

        renderChecklists();
        alert("打卡點儲存成功 ♡");

    });

// ===== ♡ 全站共用編輯模式按鈕 =====
const globalEditModeButton = document.getElementById("globalEditModeButton");

// 預設隱藏所有新增按鈕
addButton.style.display = "none";
addChecklistButton.style.display = "none";

// 切換全站編輯模式
globalEditModeButton.addEventListener("click", function () {

    globalEditMode = !globalEditMode;

    // 同步每日行程與打卡清單的編輯狀態
    scheduleEditMode = globalEditMode;
    checklistEditMode = globalEditMode;

    // 重新顯示或隱藏編輯、刪除按鈕
    renderEvents();
    renderChecklists();

    // 控制新增按鈕
    addButton.style.display = globalEditMode ? "" : "none";
    addChecklistButton.style.display = globalEditMode ? "" : "none";

    // 控制旅遊資料編輯按鈕
    const editTripButton = document.getElementById("editTripButton");

    if (editTripButton) {
        editTripButton.style.display = globalEditMode ? "" : "none";
    }

    // 更新按鈕文字
globalEditModeButton.textContent = globalEditMode
    ? "✓"
    : "✎";

});

// ===== ♡ 關閉打卡點圖片預覽視窗 =====
const checklistImageModal = document.getElementById("checklistImageModal");
const closeChecklistImageButton = document.getElementById("closeChecklistImageButton");

closeChecklistImageButton.addEventListener("click", function () {
    checklistImageModal.style.display = "none";
});

// ===== ♡ PinkPlanner 照片專用 IndexedDB =====
const pinkPlannerImageDB = "PinkPlannerImages";

function openPinkPlannerImageDB() {
    return new Promise(function (resolve, reject) {

        const request = indexedDB.open(pinkPlannerImageDB, 1);

        request.onupgradeneeded = function () {
            const db = request.result;

            if (!db.objectStoreNames.contains("photos")) {
                db.createObjectStore("photos");
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

// ===== ♡ 將照片儲存到 IndexedDB =====
async function savePinkPlannerPhoto(photoId, imageData) {

    const db = await openPinkPlannerImageDB();

    return new Promise(function (resolve, reject) {

        const transaction = db.transaction("photos", "readwrite");
        const store = transaction.objectStore("photos");

        store.put(imageData, String(photoId));

        transaction.oncomplete = function () {
            db.close();
            resolve();
        };

        transaction.onerror = function () {
            db.close();
            reject(transaction.error || new Error("照片儲存失敗"));
        };

        transaction.onabort = function () {
            db.close();
            reject(transaction.error || new Error("照片儲存中止"));
        };
    });
}

// ===== ♡ 從 IndexedDB 讀取照片 =====
async function getPinkPlannerPhoto(photoId) {

    const db = await openPinkPlannerImageDB();

    return new Promise(function (resolve, reject) {

        const transaction = db.transaction("photos", "readonly");
        const store = transaction.objectStore("photos");

        const request = store.get(String(photoId));

        request.onsuccess = function () {
            resolve(request.result || null);
        };

        request.onerror = function () {
            reject(request.error);
        };

        transaction.oncomplete = function () {
            db.close();
        };

        transaction.onerror = function () {
            db.close();
        };
    });
}

// ===== ♡ 同時支援舊照片與 IndexedDB 新照片 =====
async function loadChecklistPhoto(item) {

    // 舊照片：直接使用原本儲存的圖片
    if (item.image) {
        return item.image;
    }

    // 新照片：從 IndexedDB 讀取
    if (item.imageId) {
        return await getPinkPlannerPhoto(item.imageId);
    }

    // 沒有照片
    return null;
}

// ===== ♡ 打卡點照片強力壓縮：目標每張 15 KB 以下 =====
function resizeChecklistImage(file) {
    return new Promise(function (resolve, reject) {

        if (!file || !file.type.startsWith("image/")) {
            reject(new Error("請選擇圖片檔案"));
            return;
        }

        const reader = new FileReader();

        reader.onload = function () {
            const image = new Image();

            image.onload = function () {
                try {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) {
                        reject(new Error("無法建立圖片壓縮工具"));
                        return;
                    }

                    // 強力壓縮：最多 400 px
                    let maxSize = 400;

                    // JPEG 畫質從 35% 開始
                    let quality = 0.35;

                    // 每張照片的 Base64 資料目標不超過 15 KB
                    const targetBytes = 15 * 1024;

                    let result = "";

                    // 逐步降低尺寸及畫質
                    for (let attempt = 0; attempt < 12; attempt++) {

                        const scale = Math.min(
                            1,
                            maxSize / Math.max(image.width, image.height)
                        );

                        canvas.width = Math.max(
                            1,
                            Math.round(image.width * scale)
                        );

                        canvas.height = Math.max(
                            1,
                            Math.round(image.height * scale)
                        );

                        // 白色背景，避免透明圖片變黑
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(
                            0, 0,
                            canvas.width,
                            canvas.height
                        );

                        ctx.drawImage(
                            image,
                            0, 0,
                            canvas.width,
                            canvas.height
                        );

                        result = canvas.toDataURL(
                            "image/jpeg",
                            quality
                        );

                        // 計算實際 Base64 文字大小
                        const dataSize = new Blob([result]).size;

                        if (dataSize <= targetBytes) {
                            break;
                        }

                        // 如果仍然太大，繼續縮小
                        maxSize = Math.max(80, Math.round(maxSize * 0.8));
                        quality = Math.max(0.15, quality - 0.03);
                    }

                    if (new Blob([result]).size > targetBytes) {
                        reject(new Error("圖片無法壓縮到 15 KB 以下"));
                        return;
                    }

                    resolve(result);

                } catch (error) {
                    reject(error);
                }
            };

            image.onerror = function () {
                reject(new Error("無法讀取圖片"));
            };

            image.src = reader.result;
        };

        reader.onerror = function () {
            reject(new Error("圖片讀取失敗"));
        };

        reader.readAsDataURL(file);
    });
}

// ===== ♡ 選擇打卡點圖片時立即預覽 =====
document.getElementById("checklistItemImage")
    .addEventListener("change", function () {

        const file = this.files[0];
        const previewBox = document.getElementById("checklistExistingImageBox");
        const previewImage = document.getElementById("checklistExistingImage");

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("請選擇圖片檔案 ♡");
            this.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        previewImage.onload = function () {
            URL.revokeObjectURL(previewUrl);
            previewImage.onload = null;
        };

        previewImage.src = previewUrl;
        previewBox.style.display = "block";
    });

    // ===== ♡ 打卡點照片刪除狀態 =====
let checklistImageMarkedForDeletion = false;

// ===== ♡ 點擊 × 移除照片預覽 =====
document.getElementById("deleteChecklistImageButton")
    .addEventListener("click", function () {

        checklistImageMarkedForDeletion = true;

        // 清除尚未儲存的新選圖片
        document.getElementById("checklistItemImage").value = "";

        // 隱藏照片預覽
        document.getElementById("checklistExistingImageBox").style.display = "none";

        // 清空預覽圖片
        document.getElementById("checklistExistingImage").removeAttribute("src");
    });

    /* ===== ♡ 地圖讀取打卡清單資料 ===== */

function getChecklistMapItems() {

    const mapItems = [];

    checklists.forEach(function (checklist) {

        checklist.items.forEach(function (item) {

            // 只讀取有 Google Maps 網址的打卡點
            if (!item.mapUrl) return;

            mapItems.push({
                id: item.id,
                name: item.name,
                mapUrl: item.mapUrl,
                completed: item.completed === true
            });

        });

    });

    return mapItems;
}

// ===== ♡ Google Maps 短網址自動解析 =====


async function resolveChecklistMapUrl(mapUrl) {

    if (!mapUrl) return null;

    // 先檢查是否已經解析過，避免重複請求
    const cacheKey = "pinkPlannerMapCoords:" + mapUrl;

    try {
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const requestUrl =
            MAP_RESOLVER_URL +
            "?url=" +
            encodeURIComponent(mapUrl);

        const response = await fetch(requestUrl);

        if (!response.ok) {
            console.warn("地圖網址解析失敗：", response.status);
            return null;
        }

        const result = await response.json();

        if (
            result.success !== true ||
            !Number.isFinite(result.latitude) ||
            !Number.isFinite(result.longitude)
        ) {
            return null;
        }

        const coords = [
            result.latitude,
            result.longitude
        ];

        // 只儲存成功解析的座標
        localStorage.setItem(
            cacheKey,
            JSON.stringify(coords)
        );

        return coords;

    } catch (error) {
        console.warn("無法取得地圖座標：", error);
        return null;
    }
}

console.table(getChecklistMapItems());

// 網頁載入時顯示已儲存的清單
renderChecklists();

// 開啟網頁時執行
loadTripData();
