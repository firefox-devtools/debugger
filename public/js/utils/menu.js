const { Menu, MenuItem } = require("devtools-sham-modules");
const { isFirefoxPanel } = require("devtools-config");

function createPopup(doc) {
  let popup = doc.createElement("menupopup");

  if (popup.openPopupAtScreen) {
    return popup;
  }

  function preventDefault(e) {
    e.preventDefault();
    e.returnValue = false;
  }

  let mask = document.querySelector("#contextmenu-mask");
  if (!mask) {
    mask = doc.createElement("div");
    mask.id = "contextmenu-mask";
    document.body.appendChild(mask);
  }

  mask.onclick = () => popup.hidePopup();

  popup.openPopupAtScreen = function(clientX, clientY) {
    this.style.setProperty("left", clientX + "px");
    this.style.setProperty("top", clientY + "px");
    mask = document.querySelector("#contextmenu-mask");
    window.onwheel = preventDefault;
    mask.classList.add("show");
    this.dispatchEvent(new Event("popupshown"));
    this.popupshown;
  };

  popup.hidePopup = function() {
    this.remove();
    mask = document.querySelector("#contextmenu-mask");
    mask.classList.remove("show");
    window.onwheel = null;
  };

  return popup;
}

if (!isFirefoxPanel()) {
  Menu.prototype.createPopup = createPopup;
}

function onShown(menu, popup) {
  popup.childNodes.forEach((menuitem, index) => {
    const item = menu.items[index];
    menuitem.onclick = () => {
      item.click();
      popup.hidePopup();
    };
  });
}

function showMenu(e, items) {
  const menu = new Menu();
  items.forEach(item => menu.append(new MenuItem(item)));

  if (isFirefoxPanel()) {
    return menu.popup(e.screenX, e.screenY, { doc: window.parent.document });
  }

  menu.on("open", (_, popup) => onShown(menu, popup));
  return menu.popup(e.clientX, e.clientY, { doc: document });
}

module.exports = {
  showMenu
};
