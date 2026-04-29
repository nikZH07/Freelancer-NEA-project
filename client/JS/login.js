// This runs as soon as the page is ready
window.onload = () => {
    const form = document.querySelector('form');

    if (!form) {
        console.error("Form not found! Check your HTML structure.");
        return;
    }

    form.onsubmit = function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        const illegalChars = /['";\-\-]/;

        if (!username || !password) {
            alert("Please fill in all fields.");
            return false;
        }

        if (username.length < 3) {
            alert("Username is too short (min 3 characters).");
            return false;
        }

        if (illegalChars.test(username)) {
            alert("Illegal characters detected (no quotes or dashes).");
            return false;
        }

        if (password.length < 6) {
            alert("Password must be at least 7 characters.");
            return false;
        }

        console.log("Success! Sending data to backend...");
        this.submit();
    };
};