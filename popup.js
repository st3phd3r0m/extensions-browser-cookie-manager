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

    const tdName = document.createElement("td");
    const arrow = document.createElement("span");
    arrow.className = "arrowSwitch";
    arrow.textContent = "\u25B6";
    tdName.appendChild(arrow);
    tdName.appendChild(document.createTextNode(" " + cookie.name));

    const tdDomain = document.createElement("td");
    tdDomain.textContent = cookie.domain;

    tr.appendChild(tdName);
    tr.appendChild(tdDomain);

    const trEdit = document.createElement("tr");
    trEdit.style.display = "none";
    const tdEdit = document.createElement("td");
    tdEdit.colSpan = 2;

    const form = document.createElement("form");
    form.className = "cookie-form";

    // Path
    const labelPath = document.createElement("label");
    labelPath.textContent = "Path :";
    const inputPath = document.createElement("input");
    inputPath.type = "text";
    inputPath.name = "path";
    inputPath.value = cookie.path;

    // Valeur
    const labelValue = document.createElement("label");
    labelValue.textContent = "Valeur :";
    const textareaValue = document.createElement("textarea");
    textareaValue.name = "value";
    textareaValue.className = "cookie-values";
    textareaValue.value = cookie.value;

    // Boxes
    const boxesDiv = document.createElement("div");
    boxesDiv.className = "boxes";

    // Secure
    const labelSecure = document.createElement("label");
    const inputSecure = document.createElement("input");
    inputSecure.type = "checkbox";
    inputSecure.name = "secure";
    inputSecure.checked = cookie.secure;
    labelSecure.appendChild(inputSecure);
    labelSecure.appendChild(document.createTextNode("Secure"));

    // HttpOnly
    const labelHttpOnly = document.createElement("label");
    const inputHttpOnly = document.createElement("input");
    inputHttpOnly.type = "checkbox";
    inputHttpOnly.name = "httpOnly";
    inputHttpOnly.checked = cookie.httpOnly;
    labelHttpOnly.appendChild(inputHttpOnly);
    labelHttpOnly.appendChild(document.createTextNode("HttpOnly"));

    boxesDiv.appendChild(labelSecure);
    boxesDiv.appendChild(labelHttpOnly);

    // CTA
    const ctaDiv = document.createElement("div");
    ctaDiv.className = "cta";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit";
    editBtn.textContent = "Éditer";
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete";
    deleteBtn.textContent = "Supprimer";
    ctaDiv.appendChild(editBtn);
    ctaDiv.appendChild(deleteBtn);

    // Ajout au formulaire
    form.appendChild(labelPath);
    form.appendChild(inputPath);
    form.appendChild(labelValue);
    form.appendChild(textareaValue);
    form.appendChild(boxesDiv);
    form.appendChild(ctaDiv);

    tdEdit.appendChild(form);
    trEdit.appendChild(tdEdit);

    const cookieValueArea = textareaValue;
    cookieValueArea.style.height = "auto";

    tr.onclick = () => {
      trEdit.style.display =
        trEdit.style.display === "none" ? "table-row" : "none";
      cookieValueArea.style.height =
        trEdit.style.display === "none"
          ? "auto"
          : cookieValueArea.scrollHeight + "px";
      tr.querySelector(".arrowSwitch").textContent =
        trEdit.style.display === "none" ? "\u25B6" : "\u25BC";
    };

    form.querySelector(".delete").onclick = async () => {
      await browser.cookies.remove({ url: tab.url, name: cookie.name });
      loadCookies();
    };

    form.querySelector(".edit").onclick = async () => {
      const newValue = form.value.value;
      const newPath = form.path.value;
      const newSecure = form.secure.checked;
      const newHttpOnly = form.httpOnly.checked;
      await browser.cookies.remove({ url: tab.url, name: cookie.name });
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

// document.getElementById("refreshCta").onclick = () =>{
//   location.reload();
//   window.location.reload
// }

loadCookies();
