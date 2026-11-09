
// ===== 取得網頁元素 =====


const addButton = document.querySelector(".schedule-section .add-button");
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
        content.appendChild(note);
        
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

        content.appendChild(editButton);
        content.appendChild(deleteButton);

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


/* ===== PinkPlanner 主分頁切換 ===== */


/* ===== PinkPlanner 主分頁切換與記憶 ===== */

const scheduleTab = document.getElementById("scheduleTab");
const checklistTab = document.getElementById("checklistTab");

const scheduleSection = document.querySelector(".schedule-section");
const checklistSection = document.getElementById("checklistSection");

// 切換分頁並儲存位置
function switchMainTab(tabName) {

    if (tabName === "checklist") {

        scheduleSection.style.display = "none";
        checklistSection.style.display = "block";

        scheduleTab.classList.remove("active");
        checklistTab.classList.add("active");

    } else {

        scheduleSection.style.display = "block";
        checklistSection.style.display = "none";

        scheduleTab.classList.add("active");
        checklistTab.classList.remove("active");

    }

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

// 網頁載入時恢復上次的主分頁
const savedMainTab =
    localStorage.getItem("pinkPlannerActiveTab") || "schedule";

switchMainTab(savedMainTab);


/* ===== 打卡清單視窗開啟與關閉 ===== */

const addChecklistButton = document.getElementById("addChecklistButton");
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
        title.textContent = "♡ " + checklist.name;
        
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

        groupActions.appendChild(editGroupButton);
        groupActions.appendChild(deleteGroupButton);

        groupHeader.appendChild(title);
        groupHeader.appendChild(groupActions);



card.appendChild(groupHeader);


        // 顯示這個景點清單裡的打卡點
        checklist.items.forEach(function (item) {

            const itemDiv = document.createElement("div");
            itemDiv.className = "checklist-item";

            const itemName = document.createElement("p");
            itemName.textContent = item.name;


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

});

// 將勾選框加入打卡點
itemDiv.appendChild(checkbox);


itemDiv.appendChild(itemName);

// 顯示位置
if (item.location) {
    const locationText = document.createElement("p");
    locationText.textContent = "♡ 位置：" + item.location;
    itemDiv.appendChild(locationText);
}

// 顯示交通方式
if (item.transport) {
    const transportText = document.createElement("p");
    transportText.textContent = "♡ 交通：" + item.transport;
    itemDiv.appendChild(transportText);
}

// 顯示備註
if (item.note) {
    const noteText = document.createElement("p");
    noteText.textContent = "♡ 備註：" + item.note;
    itemDiv.appendChild(noteText);
}


        // 建立編輯打卡點按鈕
        const editItemButton = document.createElement("button");

        editItemButton.textContent = "✎ 編輯";
        editItemButton.className = "edit-checklist-item-button";

        
editItemButton.addEventListener("click", function () {

    // 記住目前編輯的清單和打卡點
    window.activeChecklistId = checklist.id;
    window.editingChecklistItemId = item.id;

    // 帶入原本儲存的資料
    document.getElementById("checklistItemName").value = item.name;
    document.getElementById("checklistItemLocation").value = item.location || "";
    document.getElementById("checklistItemTransport").value = item.transport || "";
    document.getElementById("checklistItemNote").value = item.note || "";

    // 修改視窗標題
    document.querySelector("#checklistItemModal h2").textContent =
        "♡ 編輯打卡點";

    // 開啟視窗
    document.getElementById("checklistItemModal").style.display = "flex";

});

        
editItemButton.addEventListener("click", function () {

    // 記住目前編輯的清單和打卡點
    window.activeChecklistId = checklist.id;
    window.editingChecklistItemId = item.id;

    // 帶入原本儲存的資料
    document.getElementById("checklistItemName").value = item.name;
    document.getElementById("checklistItemLocation").value = item.location || "";
    document.getElementById("checklistItemTransport").value = item.transport || "";
    document.getElementById("checklistItemNote").value = item.note || "";

    // 修改視窗標題
    document.querySelector("#checklistItemModal h2").textContent =
        "♡ 編輯打卡點";

    // 開啟視窗
    document.getElementById("checklistItemModal").style.display = "flex";

});


        itemDiv.appendChild(editItemButton);

        
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

// 將編輯、刪除按鈕放進容器
itemActions.appendChild(editItemButton);
itemActions.appendChild(deleteItemButton);

// 將按鈕容器放進打卡點
itemDiv.appendChild(itemActions);


card.appendChild(itemDiv);


        });


// 建立新增打卡點按鈕
const addItemButton = document.createElement("button");

addItemButton.textContent = "＋ 新增打卡點";
addItemButton.className = "add-checklist-item-button";


addItemButton.addEventListener("click", function () {
    window.editingChecklistItemId = null;

    // 記住目前選擇的景點清單
    window.activeChecklistId = checklist.id;

    // 清空上一次輸入的內容
    document.getElementById("checklistItemName").value = "";
    document.getElementById("checklistItemLocation").value = "";
    document.getElementById("checklistItemTransport").value = "";
    document.getElementById("checklistItemNote").value = "";

    // 開啟新增打卡點視窗
    document.getElementById("checklistItemModal").style.display = "flex";

});


card.appendChild(addItemButton);

container.appendChild(card);


    });
}


/* ===== 儲存新增的打卡點 ===== */

document.getElementById("saveChecklistItemButton")
    .addEventListener("click", function () {

        // 取得輸入的資料
        const name = document.getElementById("checklistItemName").value.trim();
        const location = document.getElementById("checklistItemLocation").value.trim();
        const transport = document.getElementById("checklistItemTransport").value.trim();
        const note = document.getElementById("checklistItemNote").value.trim();

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
    existingItem.location = location;
    existingItem.transport = transport;
    existingItem.note = note;

} else {

    // 新增打卡點
    checklist.items.push({
        id: Date.now(),
        name: name,
        location: location,
        transport: transport,
        note: note,
        completed: false
    });

}

// 清除編輯狀態
window.editingChecklistItemId = null;


        // 儲存到瀏覽器
        localStorage.setItem(
            "pinkPlannerChecklists",
            JSON.stringify(checklists)
        );

        // 關閉視窗
        document.getElementById("checklistItemModal").style.display = "none";

        renderChecklists();
        alert("打卡點儲存成功 ♡");

    });





// 網頁載入時顯示已儲存的清單
renderChecklists();



// 開啟網頁時執行
loadTripData();
