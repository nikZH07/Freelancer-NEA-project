const logoutBtn = document.querySelector(".logOutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        const response = await fetch("/api/logout", { method: "POST" });
        if (response.ok) {
            window.location.href = "/HTML/login.html";
        } else {
            alert("Logout failed");
        }
    });
};