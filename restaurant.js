/* ========================= */
/* CONFIG */
/* ========================= */

const WHATSAPP_NUMBER = "2250700000000";

/* ========================= */
/* ELEMENTS */
/* ========================= */

const loader = document.getElementById("loader");

const categoryButtons = document.querySelectorAll(".category-btn");
const menuCategories = document.querySelectorAll(".menu-category");

const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const modalTotal = document.getElementById("modalTotal");

const openCartBtn = document.getElementById("openCart");
const closeModalBtn = document.getElementById("closeModal");
const closeCartBtn = document.getElementById("closeCartBtn");

const cartModal = document.getElementById("cartModal");
const orderList = document.getElementById("orderList");

const clearCartBtn = document.getElementById("clearCart");
const sendOrderBtn = document.getElementById("sendOrder");

const toast = document.getElementById("toast");

const tableNumberInput = document.getElementById("tableNumber");

/* ========================= */
/* STORAGE */
/* ========================= */

let cart = JSON.parse(localStorage.getItem("savaneCart")) || [];

/* ========================= */
/* LOADER */
/* ========================= */

window.addEventListener("load", () => {

    setTimeout(() => {
        loader.classList.add("hide");
    }, 1200);

});

/* ========================= */
/* CATEGORY NAVIGATION */
/* ========================= */

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        const category = button.dataset.category;

        categoryButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        menuCategories.forEach(section => {
            section.classList.remove("active-category");
        });

        const activeSection = document.getElementById(category);

        if(activeSection){
            activeSection.classList.add("active-category");

            window.scrollTo({
                top: activeSection.offsetTop - 120,
                behavior: "smooth"
            });
        }

    });

});

/* ========================= */
/* TOAST */
/* ========================= */

function showToast(message){

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

}

/* ========================= */
/* FORMAT PRICE */
/* ========================= */

function formatPrice(price){

    return price.toLocaleString("fr-FR") + " F";

}

/* ========================= */
/* SAVE STORAGE */
/* ========================= */

function saveCart(){

    localStorage.setItem(
        "savaneCart",
        JSON.stringify(cart)
    );

}

/* ========================= */
/* UPDATE TOTALS */
/* ========================= */

function updateTotals(){

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {

        totalItems += item.quantity;

        totalPrice += item.subtotal;

    });

    cartCount.textContent = totalItems;

    cartTotal.textContent = `Total : ${formatPrice(totalPrice)}`;

    modalTotal.textContent = formatPrice(totalPrice);

}

/* ========================= */
/* GENERATE UNIQUE KEY */
/* ========================= */

function generateKey(item){

    let key = item.id;

    if(item.portion){
        key += "-" + item.portion;
    }

    return key;

}

/* ========================= */
/* FIND ITEM */
/* ========================= */

function findCartItem(key){

    return cart.find(item => item.key === key);

}

/* ========================= */
/* UPDATE ORDER MODAL */
/* ========================= */

function updateOrderModal(){

    if(cart.length === 0){

        orderList.innerHTML = `
            <div class="empty-cart">

                <div class="empty-icon">
                    🍽️
                </div>

                <h3>Aucune commande</h3>

                <p>
                    Ajoutez des plats pour commencer votre commande.
                </p>

            </div>
        `;

        updateTotals();

        return;
    }

    orderList.innerHTML = "";

    cart.forEach(item => {

        const orderItem = document.createElement("div");

        orderItem.classList.add("order-item");

        let includedHTML = "";
        let extrasHTML = "";

        if(item.included && item.included.length > 0){

            includedHTML = `
                <div class="order-detail-box">

                    <strong>
                        Accompagnements :
                    </strong>

                    <ul>
                        ${item.included.map(side => `
                            <li>${side}</li>
                        `).join("")}
                    </ul>

                </div>
            `;

        }

        if(item.extras && item.extras.length > 0){

            extrasHTML = `
                <div class="order-detail-box">

                    <strong>
                        Suppléments :
                    </strong>

                    <ul>
                        ${item.extras.map(extra => `
                            <li>
                                ${extra.name} x${extra.quantity}
                            </li>
                        `).join("")}
                    </ul>

                </div>
            `;

        }

        orderItem.innerHTML = `
            <div class="order-item-top">

                <div>

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        Quantité : ${item.quantity}
                    </p>

                    ${
                        item.portion
                        ?
                        `<p>Portion : ${item.portion}</p>`
                        :
                        ""
                    }

                </div>

                <div class="order-price">
                    ${formatPrice(item.subtotal)}
                </div>

            </div>

            <div class="order-details">

                ${includedHTML}

                ${extrasHTML}

            </div>

            <div class="order-footer">

                <button
                    class="delete-item-btn"
                    data-key="${item.key}"
                >
                    Supprimer
                </button>

                <div class="subtotal">
                    Sous-total : ${formatPrice(item.subtotal)}
                </div>

            </div>
        `;

        orderList.appendChild(orderItem);

    });

    updateTotals();

    attachDeleteButtons();

}

/* ========================= */
/* DELETE ITEM */
/* ========================= */

function attachDeleteButtons(){

    const deleteButtons = document.querySelectorAll(".delete-item-btn");

    deleteButtons.forEach(button => {

        button.addEventListener("click", () => {

            const key = button.dataset.key;

            cart = cart.filter(item => item.key !== key);

            saveCart();

            updateOrderModal();

            syncCards();

            showToast("Produit supprimé");

        });

    });

}

/* ========================= */
/* OPEN MODAL */
/* ========================= */

openCartBtn.addEventListener("click", () => {

    cartModal.classList.add("active");

    document.body.style.overflow = "hidden";

    updateOrderModal();

});

/* ========================= */
/* CLOSE MODAL */
/* ========================= */

function closeModal(){

    cartModal.classList.remove("active");

    document.body.style.overflow = "auto";

}

closeModalBtn.addEventListener("click", closeModal);

closeCartBtn.addEventListener("click", closeModal);

cartModal.addEventListener("click", (e) => {

    if(e.target === cartModal){
        closeModal();
    }

});

/* ========================= */
/* CLEAR CART */
/* ========================= */

clearCartBtn.addEventListener("click", () => {

    cart = [];

    saveCart();

    updateOrderModal();

    syncCards();

    showToast("Commande vidée");

});

/* ========================= */
/* CALCULATE SUBTOTAL */
/* ========================= */

function calculateSubtotal(basePrice, quantity, extras){

    let extrasTotal = 0;

    extras.forEach(extra => {

        extrasTotal += extra.price * extra.quantity;

    });

    return (basePrice + extrasTotal) * quantity;

}

/* ========================= */
/* GET PORTION LABEL */
/* ========================= */

function getPortionLabel(select){

    const option = select.options[select.selectedIndex];

    return option.textContent.split("—")[0].trim();

}

/* ========================= */
/* UPDATE CARD LIVE PRICE */
/* ========================= */

function updateCardLivePrice(card){

    const livePrice = card.querySelector(".live-price");

    if(!livePrice){
        return;
    }

    const select = card.querySelector(".portion-select");

    if(select){

        const value = parseInt(select.value);

        livePrice.textContent = formatPrice(value);

    }

}

/* ========================= */
/* EXTRAS */
/* ========================= */

document.querySelectorAll(".extra-item").forEach(extraItem => {

    const minusBtn = extraItem.querySelector(".extra-minus");
    const plusBtn = extraItem.querySelector(".extra-plus");
    const valueEl = extraItem.querySelector(".extra-value");

    let value = 0;

    plusBtn.addEventListener("click", () => {

        value++;

        valueEl.textContent = value;

    });

    minusBtn.addEventListener("click", () => {

        if(value > 0){

            value--;

            valueEl.textContent = value;

        }

    });

});

/* ========================= */
/* PORTION CHANGE */
/* ========================= */

document.querySelectorAll(".portion-select").forEach(select => {

    select.addEventListener("change", () => {

        const card = select.closest(".menu-card");

        updateCardLivePrice(card);

    });

});

/* ========================= */
/* ADD / REMOVE PRODUCTS */
/* ========================= */

document.querySelectorAll(".menu-card").forEach(card => {

    // On cherche les boutons (soit version simple, soit version produit complexe)
    const minusBtn = card.querySelector(".minus") || card.querySelector(".product-minus");
    const plusBtn = card.querySelector(".plus") || card.querySelector(".product-plus");
    const qtyValue = card.querySelector(".qty-value") || card.querySelector(".product-qty");

    // Si la carte n'a pas de système de quantité, on passe à la suivante
    if (!minusBtn || !plusBtn || !qtyValue) return;

    // ÉVÉNEMENT CLICK : PLUS (+)
    plusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        
        // On lit la quantité réelle écrite sur CETTE carte précise
        let currentQuantity = parseInt(qtyValue.textContent) || 0;
        currentQuantity++;
        
        qtyValue.textContent = currentQuantity;
        updateProduct(card, currentQuantity);
    });

    // ÉVÉNEMENT CLICK : MOINS (-)
    minusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        
        // On lit la quantité réelle écrite sur CETTE carte précise
        let currentQuantity = parseInt(qtyValue.textContent) || 0;
        
        if (currentQuantity > 0) {
            currentQuantity--;
            qtyValue.textContent = currentQuantity;
            updateProduct(card, currentQuantity);
        }
    });

});

/* ========================= */
/* UPDATE PRODUCT */
/* ========================= */

function updateProduct(card, quantity){

    const id = card.dataset.id;
    const name = card.dataset.name;

    let basePrice = parseInt(card.dataset.price || 0);

    let portion = "";

    const select = card.querySelector(".portion-select");

    if(select){

        basePrice = parseInt(select.value);

        portion = getPortionLabel(select);

    }

    const included = [];

    const checkboxes = card.querySelectorAll(".check-item input");

    checkboxes.forEach(check => {

        if(check.checked){
            included.push(check.value);
        }

    });

    const extras = [];

    const extraItems = card.querySelectorAll(".extra-item");

    extraItems.forEach(extraItem => {

        const extraQty = parseInt(
            extraItem.querySelector(".extra-value").textContent
        );

        if(extraQty > 0){

            extras.push({
                name: extraItem.dataset.extraName,
                price: parseInt(extraItem.dataset.extraPrice),
                quantity: extraQty
            });

        }

    });

    const subtotal = calculateSubtotal(
        basePrice,
        quantity,
        extras
    );

    const item = {
        id,
        key: generateKey({
            id,
            portion
        }),
        name,
        portion,
        quantity,
        price: basePrice,
        included,
        extras,
        subtotal
    };

    const existingIndex = cart.findIndex(
        product => product.key === item.key
    );

    if(quantity <= 0){

        if(existingIndex !== -1){

            cart.splice(existingIndex, 1);

        }

    }else{

        if(existingIndex !== -1){

            cart[existingIndex] = item;

        }else{

            cart.push(item);

        }

    }

    saveCart();

    updateTotals();

    updateOrderModal();

}

/* ========================= */
/* SEND WHATSAPP */
/* ========================= */

sendOrderBtn.addEventListener("click", () => {

    if(cart.length === 0){
        showToast("Votre commande est vide");
        return;
    }

    const tableNumber = tableNumberInput.value.trim();

    if(tableNumber === ""){
        showToast("Veuillez entrer votre numéro de table !");
        cartModal.classList.add("active");
        return;
    }

    let message = `🍽️ *NOUVELLE COMMANDE*%0A%0A`;
    message += `🪑 *Table :* ${tableNumber}%0A%0A`;
    message += `━━━━━━━━━━%0A%0A`;

    let grandTotal = 0;
    let listePlatsPourSheets = ""; // Stockage propre pour ton tableau Google Sheets

    cart.forEach(item => {
        grandTotal += item.subtotal;

        // 1. On prépare le texte brut lisible pour Google Sheets
        let itemText = `• ${item.name} (x${item.quantity})`;
        if(item.portion) itemText += ` [Portion : ${item.portion}]`;
        if(item.included.length > 0){
            itemText += `\n  Accompagnements : ${item.included.join(", ")}`;
        }
        if(item.extras.length > 0){
            let extText = item.extras.map(e => `${e.name} x${e.quantity}`).join(", ");
            itemText += `\n  Suppléments : ${extText}`;
        }
        itemText += `\n  Sous-total : ${formatPrice(item.subtotal)}\n\n`;
        listePlatsPourSheets += itemText;

        // 2. On prépare le texte encodé pour l'URL WhatsApp (Ton code d'origine)
        message += `🍴 *${item.name}*%0A`;
        if(item.portion){
            message += `• Portion : ${item.portion}%0A`;
        }
        message += `• Quantité : ${item.quantity}%0A%0A`;

        if(item.included.length > 0){
            message += `Accompagnements :%0A`;
            item.included.forEach(side => {
                message += `- ${side}%0A`;
            });
            message += `%0A`;
        }

        if(item.extras.length > 0){
            message += `Suppléments :%0A`;
            item.extras.forEach(extra => {
                message += `- ${extra.name} x${extra.quantity}%0A`;
            });
            message += `%0A`;
        }

        message += `💰 Sous-total : ${formatPrice(item.subtotal)}%0A%0A`;
        message += `━━━━━━━━━━%0A%0A`;
    });

    message += `💵 *TOTAL : ${formatPrice(grandTotal)} CFA*`;

    // ==========================================
    // MODIFICATION ICI : Uniquement le nombre brut pour Google Sheets
    // ==========================================
    const totalFormate = grandTotal; 
    saveOrderToGoogleSheets(tableNumber, listePlatsPourSheets, totalFormate);

    // OUVERTURE DE WHATSAPP (Le message garde ses textes et formats)
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, "_blank");

});

/* ========================= */
/* SYNC CARDS */
/* ========================= */
function syncCards(){

    document.querySelectorAll(".menu-card").forEach(card => {
        const qtyValue = card.querySelector(".qty-value") || card.querySelector(".product-qty");
        if(qtyValue) qtyValue.textContent = 0;
    });

    cart.forEach(item => {
        const card = document.querySelector(`.menu-card[data-id="${item.id}"]`);
        if(card){
            const qtyValue = card.querySelector(".qty-value") || card.querySelector(".product-qty");
            if(qtyValue) qtyValue.textContent = item.quantity;
        }
    });

}

/* ========================= */
/* RESTORE CART */
/* ========================= */

function restoreCart(){

    if(cart.length === 0){

        updateTotals();

        return;

    }

    cart.forEach(item => {

        const card = document.querySelector(
            `.menu-card[data-id="${item.id}"]`
        );

        if(card){
            // À l'intérieur du cart.forEach de restoreCart() :
const qtyValue = card.querySelector(".product-qty") || card.querySelector(".qty-value");

            qtyValue.textContent = item.quantity;

            const select = card.querySelector(".portion-select");

            if(select && item.price){

                select.value = item.price;

                updateCardLivePrice(card);

            }

            const checkboxes = card.querySelectorAll(
                ".check-item input"
            );

            checkboxes.forEach(check => {

                if(item.included.includes(check.value)){
                    check.checked = true;
                }

            });

            const extraItems = card.querySelectorAll(".extra-item");

            extraItems.forEach(extraItem => {

                const extraName = extraItem.dataset.extraName;

                const matchingExtra = item.extras.find(
                    extra => extra.name === extraName
                );

                if(matchingExtra){

                    extraItem.querySelector(".extra-value").textContent =
                    matchingExtra.quantity;

                }

            });

        }

    });

    updateTotals();

    updateOrderModal();

}

/* ========================= */
/* SAVE TABLE */
/* ========================= */

tableNumberInput.value =
localStorage.getItem("savaneTable") || "";

tableNumberInput.addEventListener("input", () => {

    localStorage.setItem(
        "savaneTable",
        tableNumberInput.value
    );

});

/* ========================= */
/* AUTO UPDATE CHECKBOXES */
/* ========================= */

document.querySelectorAll(".check-item input").forEach(check => {

    check.addEventListener("change", () => {

        const card = check.closest(".menu-card");

        const qtyValue = card.querySelector(".qty-value");

        const quantity = parseInt(qtyValue.textContent);

        if(quantity > 0){

            updateProduct(card, quantity);

        }

    });

});

/* ========================= */
/* AUTO UPDATE EXTRAS */
/* ========================= */

document.querySelectorAll(".extra-item").forEach(extraItem => {

    const buttons = extraItem.querySelectorAll(".qty-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const card = extraItem.closest(".menu-card");

            const qtyValue = card.querySelector(".qty-value");

            const quantity = parseInt(qtyValue.textContent);

            if(quantity > 0){

                updateProduct(card, quantity);

            }

        });

    });

});

/* ========================= */
/* AUTO UPDATE PORTIONS */
/* ========================= */

document.querySelectorAll(".portion-select").forEach(select => {

    select.addEventListener("change", () => {

        const card = select.closest(".menu-card");

        const qtyValue = card.querySelector(".qty-value");

        const quantity = parseInt(qtyValue.textContent);

        if(quantity > 0){

            updateProduct(card, quantity);

        }

    });

});

/* ========================= */
/* INIT */
/* ========================= */

restoreCart();

updateTotals();

updateOrderModal();

/* ========================= */
/* MOBILE MENU BUTTON */
/* ========================= */

const mobileMenuBtn = document.getElementById("mobileMenuBtn");

mobileMenuBtn.addEventListener("click", () => {

    const nav = document.getElementById("categoryScroll");

    nav.scrollIntoView({
        behavior:"smooth"
    });

});

/* ========================= */
/* ANIMATION ON SCROLL */
/* ========================= */

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

},{
    threshold:0.1
});

document.querySelectorAll(".menu-card").forEach(card => {

    card.style.opacity = "0";
    card.style.transform = "translateY(40px)";
    card.style.transition = "0.6s ease";

    observer.observe(card);

});

/* ========================= */
/* PREVENT DOUBLE TAP ZOOM */
/* ========================= */

document.addEventListener("touchend", function(event){

    const now = (new Date()).getTime();

    if(
        now - lastTouch <= 300
    ){
        event.preventDefault();
    }

    lastTouch = now;

}, false);

let lastTouch = 0;

/* ========================= */
/* DYNAMIC ACTIVE CATEGORY */
/* ========================= */

window.addEventListener("scroll", () => {

    const sections = document.querySelectorAll(".menu-category");

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 180;

        if(scrollY >= sectionTop){

            current = section.getAttribute("id");

        }

    });

    categoryButtons.forEach(btn => {

        btn.classList.remove("active");

        if(btn.dataset.category === current){

            btn.classList.add("active");

        }

    });

});

/* ========================= */
/* EXTRA UX */
/* ========================= */

document.querySelectorAll(".menu-card").forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.boxShadow =
        "0 20px 40px rgba(0,0,0,0.12)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.boxShadow =
        "";

    });

});

/* ========================= */
/* SMART SCROLL MODAL */
/* ========================= */

function openCartAutomatically(){

    cartModal.classList.add("active");

    document.body.style.overflow = "hidden";

    updateOrderModal();

}

/* ========================= */
/* CLICK SEND IF TABLE EMPTY */
/* ========================= */

document.addEventListener("keydown", (e) => {

    if(e.key === "Escape"){

        closeModal();

    }

});

/* ========================= */
/* AUTO OPEN MODAL FIRST ITEM */
/* ========================= */

let firstItemAdded = false;

document.querySelectorAll(".menu-card .plus").forEach(btn => {

    btn.addEventListener("click", () => {

        const totalItems = parseInt(cartCount.textContent);

        if(totalItems === 1 && !firstItemAdded){

            firstItemAdded = true;

            setTimeout(() => {

                showToast("Produit ajouté au panier");

            }, 200);

        }

    });

});

/* ========================= */
/* KEEP SCROLL POSITION */
/* ========================= */

let scrollPosition = 0;

openCartBtn.addEventListener("click", () => {

    scrollPosition = window.scrollY;

});

function restoreScroll(){

    window.scrollTo({
        top: scrollPosition
    });

}

closeModalBtn.addEventListener("click", restoreScroll);

closeCartBtn.addEventListener("click", restoreScroll);

/* ========================= */
/* LONG PRESS EFFECT */
/* ========================= */

document.querySelectorAll(".qty-btn").forEach(button => {

    button.addEventListener("mousedown", () => {

        button.style.transform = "scale(0.92)";

    });

    button.addEventListener("mouseup", () => {

        button.style.transform = "";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "";

    });

});

/* ========================= */
/* SAFETY CHECK */
/* ========================= */

window.addEventListener("beforeunload", () => {

    saveCart();

});

/* ========================= */
/* FINAL INIT */
/* ========================= */

console.log(
    "LA SAVANE GOURMANDE - MENU QR CODE READY 🇨🇮"
);
/* ========================= */
/* GOOGLE SHEETS INTEGRATION */
/* ========================= */

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzkz8HpftABMCkdmRSj5ynCVFr62ud2gZH5Rs_Y5ahMnP0eCOOxVUXfAQmfQi8WcRU2GQ/exec";

function saveOrderToGoogleSheets(tableNumber, textCommande, totalCommande) {
    
    // On crée un ID unique basé sur le timestamp
    const orderId = "CMD-" + Date.now().toString().slice(-6);

    // Structure de données avec le statut mis à jour
    const payload = {
        id: orderId,
        table: tableNumber || "À emporter",
        commande: textCommande, 
        total: totalCommande, 
        statut: "Envoyer" // <-- Modifié ici !
    };

    // Envoi direct et sécurisé à Google
    fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    })
    .then(() => console.log("Données envoyées à Google Sheets avec succès !"))
    .catch(error => console.error("Erreur d'envoi Sheets :", error));
}