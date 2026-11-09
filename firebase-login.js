
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB55Wyc7yQN4egHj18qmLHfi7C3f6b6yc4",
    authDomain: "bts-x-army-96686.firebaseapp.com",
    projectId: "bts-x-army-96686",
    storageBucket: "bts-x-army-96686.firebasestorage.app",
    messagingSenderId: "453151911193",
    appId: "1:453151911193:web:b3e6cfe89200b7fe2d2988",
    measurementId: "G-JXL5XDZS6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginButton = document.createElement("button");
loginButton.id = "firebaseLoginButton";
loginButton.textContent = "♡ 管理員登入";
loginButton.type = "button";

document.querySelector(".header").appendChild(loginButton);

loginButton.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error(error);
        alert("登入失敗：" + error.message);
    }
});


onAuthStateChanged(auth, (user) => {
    if (user) {
        loginButton.textContent = "♡ 已登入：" + user.displayName;
        logoutButton.style.display = "inline-flex";
    } else {
        loginButton.textContent = "♡ 管理員登入";
        logoutButton.style.display = "none";
    }
});

// ===== 管理員登出按鈕 =====

const logoutButton = document.createElement("button");
logoutButton.id = "firebaseLogoutButton";
logoutButton.type = "button";
logoutButton.textContent = "♡ 登出";
logoutButton.style.display = "none";

document.querySelector(".header").appendChild(logoutButton);

logoutButton.addEventListener("click", async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("登出失敗：", error);
    }
});


