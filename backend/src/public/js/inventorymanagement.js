document.addEventListener("DOMContentLoaded", () => {
    let stockId = null;
    const addPhoneProductForm = document.getElementById("addphoneproduct");
    const addAccessoryProductForm = document.getElementById('addaccessoryproduct');
    const loadingSpinner = document.getElementById("loadingSpinner");
    const phoneCategory = document.getElementById('phoneCategory');
    const phoneName = document.getElementById('phonename');
    const phoneBrand = document.getElementById('brand');
    const phoneModel = document.getElementById('itemModel');
    const accessoryCategory = document.getElementById('accessorycategory');
    const accessoryItemName = document.getElementById('accessoryitemName');
    const accessoryBrand = document.getElementById('accessorybrand');
    const accessoryItemModel = document.getElementById('accessoryitemModel');

    const items = {
        smartphone: {
            names: ["Samsung Galaxy", "Nokia", "iPhone"],
            brands: ["Samsung", "Nokia", "Apple"],
            models: {
                "Samsung": ["Galaxy S21", "Galaxy S20"],
                "Nokia": ["Nokia 8.3", "Nokia 7.2"],
                "Apple": ["iPhone 13", "iPhone 12"]
            }
        },
        buttonphone: {
            names: ["Nokia 3310", "Samsung Keystone", "Itel"],
            brands: ["Nokia", "Samsung", "Itel"],
            models: {
                "Nokia": ["3310", "105"],
                "Samsung": ["Keystone 3", "Guru"],
                "Itel": ["Itel 2160", "Itel 5600"]
            }
        },
        charger: {
            names: ["oraimo", "Samsung", "Google", "toshiba"],
            brands: ["oraimo", "Samsung", "Google"],
            models: {
                "oraimo": ["qwe12", "wswe"],
                "Samsung": ["S21", "S20"],
                "Google": ["Pixel 6", "Pixel 5"]
            }
        },
        earphones: {
            names: ["Dr Lee", "Samsung", "Amazon Fire"],
            brands: ["Dr Lee", "Samsung", "Amazon"],
            models: {
                "Dr Lee": ["C13", "C23 Air"],
                "Samsung": ["Tab S7", "Galaxy Tab S6"],
                "Amazon": ["Fire HD 10", "Fire HD 8"]
            }
        },
        laptop: {
            names: ["MacBook", "Dell XPS", "HP Spectre"],
            brands: ["Apple", "Dell", "HP"],
            models: {
                "Apple": ["MacBook Pro", "MacBook Air"],
                "Dell": ["XPS 13", "XPS 15"],
                "HP": ["Spectre x360", "Spectre Folio"]
            }
        }
    };

    function populateOptions(category, itemName, brand, model) {
        itemName.innerHTML = '<option value="" disabled selected>Select item name</option>';
        brand.innerHTML = '<option value="" disabled selected>Select brand</option>';
        model.innerHTML = '<option value="" disabled selected>Select item model</option>';
        if (category && items[category]) {
            items[category].names.forEach(item => {
                const option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                itemName.appendChild(option);
            });
        }
    }

    function populateBrands(itemName, category, brand, model) {
        brand.innerHTML = '<option value="" disabled selected>Select brand</option>';
        model.innerHTML = '<option value="" disabled selected>Select item model</option>';
        if (category && items[category]) {
            items[category].brands.forEach(brandItem => {
                const option = document.createElement("option");
                option.value = brandItem;
                option.textContent = brandItem;
                brand.appendChild(option);
            });
        }
    }

    function populateModels(selectedBrand, category, model) {
        model.innerHTML = '<option value="" disabled selected>Select item model</option>';
        if (category && items[category] && items[category].models[selectedBrand]) {
            items[category].models[selectedBrand].forEach(modelItem => {
                const option = document.createElement("option");
                option.value = modelItem;
                option.textContent = modelItem;
                model.appendChild(option);
            });
        }
    }

    phoneCategory.addEventListener("change", (e) => {
        const selectedCategory = e.target.value;
        populateOptions(selectedCategory, phoneName, phoneBrand, phoneModel);
    });

    phoneName.addEventListener("change", (e) => {
        const selectedItemName = e.target.value;
        const selectedCategory = phoneCategory.value;
        populateBrands(selectedItemName, selectedCategory, phoneBrand, phoneModel);
    });

    phoneBrand.addEventListener("change", (e) => {
        const selectedBrand = e.target.value;
        const selectedCategory = phoneCategory.value;
        populateModels(selectedBrand, selectedCategory, phoneModel);
    });

    accessoryCategory.addEventListener("change", (e) => {
        const selectedCategory = e.target.value;
        populateOptions(selectedCategory, accessoryItemName, accessoryBrand, accessoryItemModel);
    });

    accessoryItemName.addEventListener("change", (e) => {
        const selectedItemName = e.target.value;
        const selectedCategory = accessoryCategory.value;
        populateBrands(selectedItemName, selectedCategory, accessoryBrand, accessoryItemModel);
    });

    accessoryBrand.addEventListener("change", (e) => {
        const selectedBrand = e.target.value;
        const selectedCategory = accessoryCategory.value;
        populateModels(selectedBrand, selectedCategory, accessoryItemModel);
    });

    if (addPhoneProductForm) {
        addPhoneProductForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";

            const category = phoneCategory.value;
            const itemName = phoneName.value;
            const IMEI = document.getElementById("IMEI").value;
            const brand = phoneBrand.value;
            const itemModel = phoneModel.value;
            const availableStock = document.getElementById("quantity").value;

            try {
                const response = await fetch("/api/inventory/create-phone-stock", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ category, itemName, brand, IMEI, itemModel, availableStock }),
                });

                const data = await response.json();

                if (loadingSpinner) loadingSpinner.style.display = "none";

                if (response.ok) {
                    alert("Product added successfully!");
                } else {
                    alert("Failed to add product: " + data.message);
                }
            } catch (error) {
                console.error("Error adding product:", error);
                alert("Error adding product. Please try again later.");
            }
        });
    }

    if (addAccessoryProductForm) {
        addAccessoryProductForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";

            const category = accessoryCategory.value;
            const itemName = accessoryItemName.value;
            const brand = accessoryBrand.value;
            const itemModel = accessoryItemModel.value;
            const availableStock = document.getElementById("accessoryquantity").value;

            try {
                const response = await fetch("/api/inventory/create-stock", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ category, itemName, brand, itemModel, availableStock }),
                });

                const data = await response.json();

                if (loadingSpinner) loadingSpinner.style.display = "none";

                if (response.ok) {
                    alert("Product added successfully!");
                } else {
                    alert("Failed to add product: " + data.message);
                }
            } catch (error) {
                console.error("Error adding product:", error);
                alert("Error adding product. Please try again later.");
            }
        });
    }
});
