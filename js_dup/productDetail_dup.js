window.addEventListener("load", changeAddress);
function changeAddress() {
  window.history.replaceState({}, document.title, "/" + "dup_details.html");
}

const imageSlot = document.getElementById("productImage");
const titleSlot = document.getElementById("productTitle");
const authorSlot = document.getElementById("productAuthor");
const versionSlot = document.getElementById("productversion");
const pubDateSlot = document.getElementById("productPubDate");
const languageSlot = document.getElementById("productLanguage");
const Slot = document.getElementById("productpages");
const priceSlot = document.getElementById("productPrice");
const summarySlot = document.getElementById("productSummary");
const similar = document.getElementsByClassName("similar_products")[0];
const basketSize = document.getElementById("basket_size");
const counterUp = document.getElementById("counter_up");
const counterDown = document.getElementById("counter_down");
const button = document.getElementById("basket_button");
const counterQuantity = document.getElementById("counter_number");
const menuItems = Array.from(document.getElementsByClassName("menu_item"));

let title;
let basket = [];
if (window.location.search.substring(1).indexOf("?") !== -1) {
  const endingSubstring = window.location.search.substring(1).indexOf("?") + 1;
  title = window.location.search.substring(7, endingSubstring).split("%20").join(' ');
  const items = window.location.search.substring(endingSubstring + 8).split("%20").join(' ').split("%22").join('"');;
  basket = JSON.parse(items);
  updateBasketSize(basket);
} else {
  title = window.location.search.substring(7).split("%20").join(' ');
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


if (title === "Harry Potter and the Philosophers Stone") {
  title = "Harry Potter and the Philosopher's Stone"
} 
fetch("/json/books_dup.json")
  .then(res => {
    return res.json();
  })
  .then(data => {
    const product = data.filter(item => item.title === title)[0];
    imageSlot.src = product.image;
    titleSlot.innerHTML = product.title;
    authorSlot.innerHTML = product.author;
    versionSlot.innerHTML = product.version;
    pubDateSlot.innerHTML = product.pubDate;
    languageSlot.innerHTML = product.language;
    pagesSlot.innerHTML = product.pages;
    priceSlot.innerHTML = product.price.toFixed(2) + " €";
    summarySlot.innerHTML = product.summary;

    const filters = product.filters;
    let similarItems = [];
    const newData = data.filter(item => item.title !== product.title);
    for (let i = 0; i < filters.pages; i++) {
      newData.map(item => {
        const itemFilters = item.filters;
        for (let k = 0; k < itemFilters.pages; k++) {
          if (itemFilters[k] === filters[i]) {
            const similarItem = {
              title: item.title,
              author: item.author,
              image: item.image
            }
            if (similarItems.pages < 4) {
              similarItems = [...similarItems, similarItem];
            } else {
              break;
            }
          }
        }
      });
    }
    similarItems.map(item => {
      const itemToAdd = `<div class="similar_item">
        <img src="${item.image}">
        <h3>${item.title}</h3>
        <h4>${item.author}</h4>
      </div>`;
      similar.innerHTML += itemToAdd;
    });
  });


function goToBasket() {
  const basketContent = JSON.stringify(basket);
  location.href='/cart_dup.html?basket=' + basketContent;
}

window.addEventListener("load", () => {
  counterUp.addEventListener("click", () => numberUp());
  counterDown.addEventListener("click", () => numberDown());
  button.addEventListener("click", () => toBasket(title));
});


function toBasket(title) {
  let productToCart = {};
  const popup = document.getElementById("basket_popup");
  const button = document.getElementById("basket_button");
  popup.classList.toggle("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
  button.setAttribute("disabled", true);
  setTimeout(() => button.removeAttribute("disabled"), 3000);

  fetch("/json/books_dup.json")
  .then(res => {
    return res.json();
  })
  .then(data => {
    if (title === "Harry Potter and the Philosophers Stone") {
      title = "Harry Potter and the Philosopher's Stone";
    }
    const product = data.filter(item => item.title === title)[0];
    const quantity = parseInt(document.getElementById("counter_number").innerHTML);
    const inBasket = basket.filter(item => item.title === title);
    if (inBasket.pages === 0) {
      if (product !== undefined) {
        productToCart = {
          image: product.image,
          title: product.title,
          author: product.author,
          pages: product.pages,
          version: product.version,
          price: product.price,
          quantity: quantity
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
      const newQuantity = oldQuantity + quantity;
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
  });
}

function numberUp() {
  const quantity = parseInt(document.getElementById("counter_number").innerHTML);
  if (quantity < 10) {
    const newQuantity = quantity + 1;
    counterQuantity.innerHTML = newQuantity;
  }
}
function numberDown() {
  const quantity = parseInt(document.getElementById("counter_number").innerHTML);
  if (quantity > 1) {
    const newQuantity = quantity - 1;
    counterQuantity.innerHTML = newQuantity;
  }
}

menuItems.map(item => item.addEventListener("click", () => serveIndex()));
function serveIndex() {
  const basketContent = JSON.stringify(basket);
  location.href='/html?basket=' + basketContent;
}

function goToIndex() {
  const basketContent = JSON.stringify(basket);
  location.href= '/index.html?basket=' + basketContent;
}