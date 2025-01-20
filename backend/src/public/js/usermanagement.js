document.addEventListener("DOMContentLoaded", () => {
    const managersignUpForm = document.getElementById("managersignUpform");
    const minimanagersignUpform = document.getElementById("minimanagersignUpform");
    const sellersignUpform = document.getElementById("sellersignUpform")
    const superusersigninform = document.getElementById("superusersigninform");
    const managersigninform = document.getElementById("managersigninform");
    const sellersigninform = document.getElementById("sellersigninform");
    const updateRoleButton = document.querySelector(".updateRoleButton")
    const loadingSpinner = document.getElementById("loadingSpinner");
    const updateRoleForm = document.getElementById("updateRoleForm");
    const updateProfileButton = document.querySelector(".updateProfileButton")
    const updateProfileForm = document.getElementById("updateProfileForm")
    let userId = null;
    let userEmail = null
    const updateStatusForm = document.getElementById("updateStatusForm")
    const updateStatusButton = document.querySelector(".updateStatusButton")

    if (updateProfileButton) {
        updateProfileButton.addEventListener("click", (e) => {
            userId = updateStatusButton.getAttribute("data-user-id")
            userEmail = updateStatusButton.getAttribute("data-user-email")
            console.log("clicked")
        })
    }

    if (updateStatusButton) {
        updateStatusButton.addEventListener("click", (e) => {
            userId = updateStatusButton.getAttribute("data-user-id")
            userEmail = updateStatusButton.getAttribute("data-user-email")
            console.log("clicked")
        })
    }

    if (updateRoleButton) {
        updateRoleButton.addEventListener("click", () => {
            userId = updateStatusButton.getAttribute("data-user-id")
            userEmail = updateStatusButton.getAttribute("data-user-email")
            console.log("clicked")
        })
    }

    if (updateRoleForm) {
        updateRoleForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const role = document.getElementById("updateRole").value;

            if (!userId || !userEmail) {
                alert("User ID or Email is not set");
                return;
            }

            const requestData = {
                id: userId,
                email: userEmail,
                role: role
            };
            console.log(requestData)

            try {
                loadingSpinner.style.display = "block";

                const response = await fetch("/api/user/update/role", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                });

                loadingSpinner.style.display = "none";

                if (response.ok) {
                    const result = await response.json();
                    alert(result.message);
                    window.location.reload();
                } else {
                    const error = await response.json();
                    alert("Error: " + error.message);
                }
            } catch (error) {
                loadingSpinner.style.display = "none";
                console.error("Error:", error);
                alert("An error occurred while updating status");
            }



        })
    }

    if (updateProfileForm) {
        updateProfileForm.addEventListener("submit", async (e) => {
            e.preventDefault()

            const name = document.getElementById("updateName")?.value;
            const password = document.getElementById("updatePassword")?.value;
            const phone = document.getElementById("updatePhone")?.value;

            if (!userId || !userEmail) {
                alert("User ID or Email is not set");
                return;
            }

            const requestData = {
                id: userId,
                email: userEmail,
                name: name,
                password: password,
                phone: phone,
            }


            console.log("request", requestData)

            try {
                loadingSpinner.style.display = "block";

                const response = await fetch("/api/user/update/profile", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                });

                loadingSpinner.style.display = "none";

                if (response.ok) {
                    const result = await response.json();
                    alert(result.message);
                    window.location.reload();
                } else {
                    const error = await response.json();
                    alert("Error: " + error.message);
                }
            } catch (error) {
                loadingSpinner.style.display = "none";
                console.error("Error:", error);
                alert("An error occurred while updating status");
            }

        })
    }
    if (updateStatusForm) {
        updateStatusForm.addEventListener("submit", async (e) => {
            e.preventDefault()
            const status = document.getElementById("updateStatus").value;

            if (!userId || !userEmail) {
                alert("User ID or Email is not set");
                return;
            }

            const requestData = {
                id: userId,
                email: userEmail,
                status: status
            };
            console.log(requestData)

            try {
                loadingSpinner.style.display = "block";

                const response = await fetch("/api/user/update/status", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                });

                loadingSpinner.style.display = "none";

                if (response.ok) {
                    const result = await response.json();
                    alert(result.message);
                    window.location.reload();
                } else {
                    const error = await response.json();
                    alert("Error: " + error.message);
                }
            } catch (error) {
                loadingSpinner.style.display = "none";
                console.error("Error:", error);
                alert("An error occurred while updating status");
            }


        })
    }
    if (managersignUpForm) {
        managersignUpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";

            // Fetch the user data
            const email = document.getElementById("email")?.value;
            const name = document.getElementById("username")?.value;
            const password = document.getElementById("password")?.value;
            const phonenumber = document.getElementById("phonenumber")?.value;

            try {
                const response = await fetch("/api/user/superuser/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, email, password, phonenumber }),
                });

                const data = await response.json(); // Parse the JSON response once

                if (loadingSpinner) loadingSpinner.style.display = "none";

                if (response.ok) {
                    window.location.href = "/api/superuser/signin"
                } else {
                    alert("Sign up failed: " + data.message); // Display the error message
                }
            } catch (error) {
                return error
            }
        });
    }

    if (minimanagersignUpform) {
        minimanagersignUpform.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";

            // Fetch the user data
            const email = document.getElementById("email")?.value;
            const name = document.getElementById("username")?.value;
            const password = document.getElementById("password")?.value;
            const phonenumber = document.getElementById("phonenumber")?.value;

            try {
                const response = await fetch("/api/user/manager/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, email, password, phonenumber }),
                });

                const data = await response.json(); // Parse the JSON response once

                if (loadingSpinner) loadingSpinner.style.display = "none";

                if (response.ok) {
                    alert("successfully registered minimanager")
                } else {
                    alert("Sign up failed: " + data.message); // Display the error message
                }
            } catch (error) {
                return error
            }
        });
    }
    if (sellersignUpform) {
        sellersignUpform.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";

            // Fetch the user data
            const email = document.getElementById("email")?.value;
            const name = document.getElementById("username")?.value;
            const password = document.getElementById("password")?.value;
            const phonenumber = document.getElementById("phonenumber")?.value;

            try {
                const response = await fetch("/api/user/seller/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, email, password, phonenumber }),
                });

                const data = await response.json(); // Parse the JSON response once

                if (loadingSpinner) loadingSpinner.style.display = "none";

                if (response.ok) {
                    alert("successfully registerd the seller")
                } else {
                    alert("Sign up failed: " + data.message); // Display the error message
                }
            } catch (error) {
                return error
            }
        });
    }
    if (superusersigninform) {
        superusersigninform.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";
            const email = document.getElementById("superuseremail")?.value;
            const password = document.getElementById("superuserpassword")?.value;
            console.log("superuser", email)
            try {
                const response = await fetch("/api/user/superuser/signin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (loadingSpinner) loadingSpinner.style.display = "none";
                if (response.ok) {
                    alert("successfully logged in")
                    window.location.href = "/api/inventory/adminpage";
                } else {
                    alert("Sign in error: " + data.message);
                }
            } catch (error) {
                return error
            }
        });
    }

    if (managersigninform) {
        managersigninform.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";
            const email = document.getElementById("manageremail")?.value;
            const password = document.getElementById("managerpassword")?.value;
            console.log("manager", email)
            try {
                const response = await fetch("/api/user/manager/signin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (loadingSpinner) loadingSpinner.style.display = "none";
                if (response.ok) {
                    alert("successfully logged in")
                    window.location.href = "/api/inventory/adminpage";
                } else {
                    alert("Sign in error: " + data.message);
                }
            } catch (error) {
                return error
            }
        });
    }

    if (sellersigninform) {
        sellersigninform.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";
            const email = document.getElementById("selleremail")?.value;
            const password = document.getElementById("sellerpassword")?.value;
            console.log("seller email", email)

            try {
                const response = await fetch("/api/user/seller/signin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (loadingSpinner) loadingSpinner.style.display = "none";
                if (response.ok) {
                    alert("successfully logged in")
                    window.location.href = "/api/inventory/adminpage";
                } else {
                    alert("Sign in error: " + data.message);
                }
            } catch (error) {
                return error
            }
        });
    }

});
