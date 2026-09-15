document.addEventListener("DOMContentLoaded", function () {
    // Logout function
    function logoutUser() {
        // Clear only the user's email from localStorage
        localStorage.removeItem("userIC");
        localStorage.removeItem("userEmail");

        // Redirect to the login page
        window.location.href = "index.html";
    }

    // Attach the logout function to the logout button (if it exists)
    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }
});
