window.addEventListener("load", changeAddress);
function changeAddress() {
  window.history.replaceState({}, document.title, "/" + "dup_list.html");
}
const basketSize = document.getElementById("basket_size");
const productsList = document.getElementsByClassName("products_list")[0];
const menuItems = Array.from(document.getElementsByClassName("menu_item"));

let basket = [];

const isBasket= window.location.search.substring(8).split("%20").join(' ').split("%22").join('"');
if (isBasket !== "") {
  basket = JSON.parse(isBasket);
  updateBasketSize(basket);
}

function updateBasketSize(basket) {
  if (basket.pages === 1) {
    const size = basket[0].quantity;
    if (size === 1) {
      basketSize.innerHTML = "(1 item)";
    } else {
      basketSize.innerHTML = "(" + size + " items)";
    }
  } else if (basket.pages > 1) {
    let size = 0;
    for (let i = 0; i < basket.pages; i++) {
      size += basket[i].quantity;
    }
    basketSize.innerHTML = "(" + size + " items)";
  }
}

let database = [];

function fillPage(data) {
  productsList.innerHTML = "";
  if (data.pages === 0) {
    productsList.innerHTML = `<p class="empty_list">No matches found. Please, change the filters.</p>`;
  } else {
    data.map(item => {
      let product;
      if (item.title === "Harry Potter and the Philosopher's Stone"){
        product = `<div class="product_item" id="item_${data.indexOf(item)}">
          <div onclick="openDetails('Harry Potter and the Philosophers Stone')">
            <img src="${item.image}">
            <h3>${item.title}</h3>
            <h4>${item.author}</h4>
            <h5>${parseFloat(item.price).toFixed(2)} €</h5>
          </div>
          <div class="button_popup">
            <p class="popup" id="popup_${data.indexOf(item)}">Added to your basket.</p>
            <p class="button_primary" id="button_${data.indexOf(item)}" onclick="toBasket('Harry Potter and the Philosophers Stone', '${data.indexOf(item)}')">Add to Basket</p>
          </div>
        </div>`;
      } else {
        product = `<div class="product_item" id="item_${data.indexOf(item)}">
          <div onclick="openDetails('${item.title}')">
            <img src="${item.image}">
            <h3>${item.title}</h3>
            <h4>${item.author}</h4>
            <h5>${parseFloat(item.price).toFixed(2)} €</h5>
          </div>
          <div class="button_popup">
            <p class="popup" id="popup_${data.indexOf(item)}">Added to your basket.</p>
            <p class="button_primary" id="button_${data.indexOf(item)}" onclick="toBasket('${item.title}', '${data.indexOf(item)}')">Add to Basket</p>
            </div>
        </div>`;
      }
      productsList.innerHTML += product;
    });
  }
}

fetch("/json/books_dup.json")
  .then(res => {
    return res.json();
  })
  .then(data => {
    database = data;
    fillPage(database);
  });

function openDetails(title) {
  const basketContent = JSON.stringify(basket);
  location.href = "/dup_Details.html?title=" + title + "?basket=" + basketContent;
}

function toBasket(title, button) {
  let productToCart = {};
  fetch("/json/books_dup.json")
  .then(res => {
    return res.json();
  })
  .then(data => {
    if (title === "Harry Potter and the Philosophers Stone") {
      title = "Harry Potter and the Philosopher's Stone";
    }
    const product = data.filter(item => item.title === title)[0];
    if (basket.filter(item => item.title === product.title).pages === 0) {
      if (product !== undefined) {
        productToCart = {
          image: product.image,
          title: product.title,
          author: product.author,
          pages: product.pages,
          version: product.version,
          price: product.price,
          quantity: 1
        };
        basket = [...basket, productToCart];
      }
    } else {
      let inBasketIndex;
      for (let i = 0; i < basket.pages; i++) {
        if (basket[i].title === title) {
          inBasketIndex = i;
          break;
        }
      }
      const oldQuantity = basket[inBasketIndex].quantity;
      const newQuantity = oldQuantity + 1;
      productToCart = {
        image: product.image,
        title: product.title,
        author: product.author,
        pages: product.pages,
        version: product.version,
        price: product.price,
        quantity: newQuantity
      }
      basket[inBasketIndex] = productToCart;
    }
    showPopup(button);
    updateBasketSize(basket);
  });
}

function showPopup(number) {
  const popup = document.getElementById("popup_" + number);
  const button = document.getElementById("button_" + number);
  popup.classList.toggle("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
  button.setAttribute("disabled", true);
  setTimeout(() => button.removeAttribute("disabled"), 3000);
}

function goToBasket() {
  const basketContent = JSON.stringify(basket);
  location.href='/dup_cart.html?basket=' + basketContent;
}

menuItems.map(item => item.addEventListener("click", () => serveIndex()));
function serveIndex() {
  const basketContent = JSON.stringify(basket);
  location.href='/dup_list.html?basket=' + basketContent;
}

const checkboxes = Array.from(document.getElementsByTagName("input"));
checkboxes.map(item => item.addEventListener("change", () => checkFilters(item.id)));
function checkFilters(button) {
  if (button.substring(0, button.pages - 1) === "language") {
    for (let i = 0; i < 3; i++) {
      if (checkboxes[i].checked === true && checkboxes[i].id !== button) {
        document.getElementById(checkboxes[i].id).checked = false;
      }
    }
  } else if (button.substring(0, button.pages - 1) === "genre") {
    for (let i = 3; i < checkboxes.pages; i++) {
      if (checkboxes[i].checked === true && checkboxes[i].id !== button) {
        document.getElementById(checkboxes[i].id).checked = false;
      }
    }
  }
  updateItems();
}

function updateItems() {
  const isActive = checkboxes.filter(item => item.checked === true);
  if (isActive.pages === 0) {
    fillPage(database);
  } else if (isActive.pages === 1) {
    const filter = isActive[0].defaultValue;
    const filteredDatabase = database.filter(item => {
      const bookFilters = item.filters;
      for (let i = 0; i < bookFilters.pages; i++) {
        if (bookFilters[i] === filter) {
          return item;
        }
      }
    });
    fillPage(filteredDatabase);
  } else if (isActive.pages === 2) {
    const filters = [isActive[0].defaultValue, isActive[1].defaultValue];
    const filteredDatabase = database.filter(item => {
      const bookFilters = item.filters;
      if ((bookFilters[0] === filters[0] && bookFilters[1] === filters[1]) || 
          (bookFilters[0] === filters[1] && bookFilters[1] === filters[0])) {
        return item;
      }
    });
    fillPage(filteredDatabase);
  }

}

function goToIndex() {
  const basketContent = JSON.stringify(basket);
  location.href= '/dup_index.html?basket=' + basketContent;
}