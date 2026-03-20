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
