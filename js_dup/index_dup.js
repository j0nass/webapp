window.addEventListener("load", changeAddress);
function changeAddress() {
  window.history.replaceState({}, document.title, "/" + "index.html");
}
const basketSize = document.getElementById("basket_size");
const menuItems = Array.from(document.getElementsByClassName("menu_item"));

let basket = [];

const isBasket= window.location.search.substring(8).split("%20").join(' ').split("%22").join('"');
if (isBasket !== "") {
  basket = JSON.parse(isBasket);
  updateBasketSize(basket);
}

function updateBasketSize(basket) {
  if (basket.length === 1) {
    const size = basket[0].quantity;
    if (size === 1) {
      basketSize.innerHTML = "(1 item)";
    } else {
      basketSize.innerHTML = "(" + size + " items)";
    }
  } else if (basket.length > 1) {
    let size = 0;
    for (let i = 0; i < basket.length; i++) {
      size += basket[i].quantity;
    }
    basketSize.innerHTML = "(" + size + " items)";
  }
}

function goToBasket() {
  const basketContent = JSON.stringify(basket);
  location.href='/cart.html?basket=' + basketContent;
}

menuItems.map(item => item.addEventListener("click", () => serveIndex()));
function serveIndex() {
  const basketContent = JSON.stringify(basket);
  location.href='/productList.html?basket=' + basketContent;
}

function goToIndex() {
  const basketContent = JSON.stringify(basket);
  location.href= '/index.html?basket=' + basketContent;
}