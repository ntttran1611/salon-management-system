export async function getTemplate(fileName, templateName) {
  const response = await fetch(`./../layouts/${fileName}.html`);
  const htmlLayoutText = await response.text();
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(htmlLayoutText, "text/html");
  const template = doc.querySelector(templateName);
  return template;
}

export function tableHeaderGenerator(headerList) {
  const headerRowElem = document.createElement("tr");
  for (let headerName of headerList) {
    const headerNameElem = document.createElement("th");
    headerNameElem.textContent = headerName;
    headerRowElem.appendChild(headerNameElem);
  }
  return headerRowElem;
}

export function viewButtonGenerator(id, dataList, func) {
  const viewBtn = document.createElement("button");
  const viewBtnIcon = document.createElement("i");
  viewBtnIcon.className = "fa-regular fa-eye fa-sm";
  const viewBtnSpan = document.createElement("span");
  viewBtnSpan.className = "tooltiptext";
  viewBtnSpan.textContent = "View/Edit";
  viewBtn.className = "round-btn view-btn";
  viewBtn.appendChild(viewBtnIcon);
  viewBtn.appendChild(viewBtnSpan);
  viewBtn.addEventListener("click", () => func(id, dataList));
  return viewBtn;
}

export function animateTwoColLayout() {
  //add onShow id to trigger animations
  setTimeout(() => {
    document.querySelector(".col-1").id = "onShow";
    document.querySelector(".col-2").id = "onShow";
  }, 1);
}
