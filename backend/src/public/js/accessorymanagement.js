document.addEventListener("DOMContentLoaded", () => {
    let stockId = null;
    let distributedStockId = null;
    let productType = null;
    const transferformmodal = document.getElementById("transferformmodal");
    const tranferbutton = document.querySelectorAll(".transferbutton");
    const distributebutton = document.querySelectorAll(".distributeButton");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const distributeProductForm = document.getElementById("distributionmodal");

    distributebutton.forEach((button) => {
        button.addEventListener("click", () => {
            distributedStockId = button.getAttribute("data-product-id");
            productType = button.getAttribute("data-product-type");
            console.log(distributedStockId, productType);

            const hiddenInput = document.getElementById('stockId');
            if (hiddenInput) {
                hiddenInput.value = distributedStockId;
            }

            // Add product type to a hidden input if necessary
            // const hiddenTypeInput = document.getElementById('productType');
            // if (hiddenTypeInput) {
            //     hiddenTypeInput.value = productType;
            // }
        });
    });

    tranferbutton.forEach((button) => {
        button.addEventListener("click", () => {
            stockId = button.getAttribute("data-product-id");
            productType = button.getAttribute("data-product-type");
            console.log(stockId, productType);

            const hiddenInput = document.getElementById('tranferedstockId');
            if (hiddenInput) {
                hiddenInput.value = stockId;
            }

            // Add product type to a hidden input if necessary
            // const hiddenTypeInput = document.getElementById('productType');
            // if (hiddenTypeInput) {
            //     hiddenTypeInput.value = productType;
            // }
        });
    });

    if (distributeProductForm) {
        distributeProductForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("clicked");
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";

            const mainShop = document.getElementById('mainshop')?.value;
            const distributedShop = document.getElementById('shop')?.value;
            const quantity = document.getElementById('quantity')?.value;
            //const productTypeValue = document.getElementById('productType')?.value;
            const requestBody = {
                mainShop,
                distributedShop,
                stockId: distributedStockId,
                quantity
            };

            if (!distributedStockId) {
                alert('Stock ID is not set. Please select a product to distribute.');
                if (loadingSpinner) loadingSpinner.style.display = "none";
                return;
            }
            console.log("producttype", productType)
            let url;
            if (productType === "mobile") {
                url = '/api/inventory/create-phone-distribution';
            } else {
                url = '/api/inventory/create-distribution';
            }
            console.log("url used", url)
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (loadingSpinner) loadingSpinner.style.display = "none";

                if (response.ok) {
                    alert("Successfully distributed");
                } else {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    alert('Error: ' + errorData.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while processing your request.');
            }
        });
    }

    if (transferformmodal) {
        transferformmodal.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("clicked");

            const mainShop = document.getElementById('shopowning')?.value;
            const distributedShop = document.getElementById('shoptoown')?.value;
            const quantity = document.getElementById('transferedquantity')?.value;
            const requestBody = {
                mainShop,
                distributedShop,
                stockId,
                quantity
            };

            console.log("mainshop", mainShop);
            if (!stockId) {
                alert('Stock ID is not set. Please select a product to transfer.');
                if (loadingSpinner) loadingSpinner.style.display = "none";
                return;
            }

            console.log("producttype", productType)
            let url;
            if (productType === "mobile") {
                url = '/api/inventory/create-phone-transfer';
            } else {
                url = '/api/inventory/create-transfer';
            }
            console.log("url used", url)

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (response.ok) {
                    alert("Successfully transferred");
                } else {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    alert('Error: ' + errorData.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while processing your request.');
            }
        });
    }
});
