const logoutBtn = document.querySelector(".logOutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        const response = await fetch("http://localhost:3000/api/logout", { method: "POST" });
        if (response.ok) {
            window.location.href = "/login.html";
        } else {
            alert("Logout failed");
        }
    });
};