async function getCurrentTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function loadCookies() {
  const tab = await getCurrentTab();
  const cookies = await browser.cookies.getAll({ url: tab.url });

  const tbody = document.getElementById("cookies");
  tbody.innerHTML = "";

  cookies.forEach((cookie) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cookie.name}</td>
      <td>${cookie.domain}</td>
    `;

    const trEdit = document.createElement("tr");
    trEdit.innerHTML = `
      <td colspan="2">
        <form class="cookie-form">
          <label>Path :</label>
          <input type="text" name="path" value="${cookie.path}">
          
          <label>Valeur :</label>
          <textarea name="value" class="cookie-values">${
            cookie.value
          }</textarea>
          
          <label>
          <input type="checkbox" name="secure" ${
            cookie.secure ? "checked" : ""
          }>Secure</label>
            
          <label>
          <input type="checkbox" name="httpOnly" ${
            cookie.httpOnly ? "checked" : ""
          }>HttpOnly</label>
          <div>          
            <button type="button" class="edit">Éditer</button>
            <button type="button" class="delete">Supprimer</button>
          </div>
        </form>
      </td>
    `;
    // trEdit.style.width = "90%";
    trEdit.style.display = "none";
    const cookieValueArea = trEdit.querySelector(".cookie-values");
    cookieValueArea.style.height = "auto";

    tr.onclick = () => {
      trEdit.style.display =
        trEdit.style.display === "none" ? "table-row" : "none";
      cookieValueArea.style.height =
        trEdit.style.display === "none"
          ? "auto"
          : cookieValueArea.scrollHeight + "px";
    };

    const form = trEdit.querySelector(".cookie-form");
    form.querySelector(".delete").onclick = async () => {
      await browser.cookies.remove({ url: tab.url, name: cookie.name });
      loadCookies();
    };

    form.querySelector(".edit").onclick = async () => {
      const newValue = form.value.value;
      const newPath = form.path.value;
      const newSecure = form.secure.checked;
      const newHttpOnly = form.httpOnly.checked;
      await browser.cookies.set({
        url: tab.url,
        name: cookie.name,
        value: newValue,
        path: newPath,
        secure: newSecure,
        httpOnly: newHttpOnly,
      });
      loadCookies();
    };

    tbody.appendChild(tr);
    tbody.appendChild(trEdit);
  });
}

document.getElementById("addCookie").onclick = async () => {
  const tab = await getCurrentTab();
  const url = tab.url;
  const name = document.getElementById("newName").value;
  const value = document.getElementById("newValue").value;

  if (name && value) {
    await browser.cookies.set({ url, name, value });
    document.getElementById("newName").value = "";
    document.getElementById("newValue").value = "";
    loadCookies();
  }
};

document.getElementById("deleteAllCookies").onclick = async () => {
  const tab = await getCurrentTab();
  const cookies = await browser.cookies.getAll({ url: tab.url });
  for (const cookie of cookies) {
    await browser.cookies.remove({ url: tab.url, name: cookie.name });
  }
  loadCookies();
};

loadCookies();
