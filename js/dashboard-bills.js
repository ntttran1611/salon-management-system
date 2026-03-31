import {
  getBillList,
  getBillTotalCents,
  getBillTableData,
  cloneBill,
  updateStaff,
  updateService,
  updateDiscount,
  updateNote,
  deleteBillServiceTemp,
  deleteBill,
} from "../lib/api/bill-api.js";
import { formatMoney, parsePriceCents } from "../lib/utils/currency.js";
import { showDeleteAlert, showNoticeAlert } from "../lib/components/dialog.js";
import {
  animateTwoColLayout,
  getTemplate,
  tableHeaderGenerator,
} from "../lib/utils/layout-handler.js";
import { checkIsPriceNumber } from "../lib/utils/data-validation.js";
import { checkout } from "../lib/components/check-out-dialog.js";
import {
  generateServiceDeleteButton,
  generateStaffOptionsForBillTable,
  generateTableInput,
  generateServiceOptionsForBillTable,
} from "./components/bill-components.js";

document.querySelector("#bills").addEventListener("click", loadPage);
window.onload = loadPage;

let currentBill = null;
let billTable = null;

//display all bills and the first bill when the page is load
async function loadPage() {
  if (document.querySelector("#bills").className.includes("active")) {
    const tempBillList = getBillList(1);
    await buildTwoColLayoutForBillTab();
    await getBillListContent(tempBillList);
    animateTwoColLayout();
  }
}

async function buildTwoColLayoutForBillTab() {
  const getTwoColTemplate = await getTemplate(
    "two-col-template",
    "#bill-two-col-template",
  );
  const templateClone = document.importNode(getTwoColTemplate.content, true);
  /**FIX THIS: use textCOntent instead */
  templateClone.querySelector("#bill-list-title").innerHTML =
    `<i class="fa-solid fa-code-branch"></i> <span>Kingston</span>`;

  document.querySelector("main").innerHTML = "";
  document.querySelector("main").appendChild(templateClone);
}

async function getBillListContent(tempBillList) {
  if (tempBillList.length == 0) {
    const noteElem = document.createElement("p");
    noteElem.className = "note-lg";
    noteElem.textContent = "No bill recoreded";
    document.querySelector("#bill-list").appendChild(noteElem);
  } else {
    document.querySelector("#bill-list").innerHTML = "";
    let count = 1;
    for (let bill of tempBillList) {
      const listItemTemplate = await getTemplate(
        "bill-template",
        "#bill-list-item-template",
      );
      const listItemClone = document.importNode(listItemTemplate.content, true);
      listItemClone.querySelector(".list-item").id = bill.id;
      listItemClone
        .querySelector(".list-item")
        .addEventListener("click", async () => {
          activateIndicator(bill.id);
          await loadBill(bill);
        });
      listItemClone.querySelector(".list-item").className = bill.paid
        ? "list-item checked"
        : "list-item";
      listItemClone.querySelector(".list-item-content").id = bill.id;
      listItemClone.querySelector(".list-item-content").textContent =
        `${count} - ${bill.cusName}`;
      count++;
      document.querySelector("#bill-list").appendChild(listItemClone);
    }
  }
}

async function loadBill(orgBill) {
  currentBill = cloneBill(orgBill);
  await renderBill();
}

async function renderBill() {
  if (!currentBill) return;
  await buildBillInfoLayout();
  renderBillTableHeaders();
  renderBillTableRows();
}

async function buildBillInfoLayout() {
  if (!currentBill) return;
  const isBillPaid = currentBill.paid;
  const billInfoTemplate = await getTemplate(
    "bill-template",
    "#bill-info-template",
  );
  const templateClone = document.importNode(billInfoTemplate.content, true);
  templateClone.querySelector("span#bill-cusName").textContent =
    ` \u00A0${currentBill.cusName}, \u00A0`;
  templateClone.querySelector("span#bill-mobile").textContent =
    ` \u00A0${currentBill.mobile}, \u00A0`;
  templateClone.querySelector("span#bill-time").textContent =
    ` \u00A0${currentBill.entranceDate}, ${currentBill.entranceTime}`;
  templateClone.querySelector("span#bill-total").textContent =
    `\u00A0${formatMoney(getBillTotalCents(currentBill))}\u00A0`;
  templateClone.querySelector("span#bill-status").textContent = isBillPaid
    ? "\u00A0PAID"
    : "\u00A0UNPAID";
  templateClone.querySelector("span#bill-status").className = isBillPaid
    ? "bill-paid"
    : "bill-unpaid";
  templateClone
    .querySelector("button#bill-delete-btn")
    .addEventListener("click", () => deleteBill(currentBill));
  templateClone
    .querySelector("#check-out-btn")
    .addEventListener("click", () => {
      handleCheckoutButtonClicked(isBillPaid, currentBill);
    });

  templateClone
    .querySelector("#bill-reset-btn")
    .addEventListener("click", () => {
      resetBill(currentBill);
    });

  if (isBillPaid) {
    templateClone.querySelector(".title-container").className += " bill-paid";
    templateClone.querySelector("table").className += " bill-paid";
    templateClone.querySelector("#check-out-btn").textContent = "Uncheck bill";
    templateClone.querySelector("#bill-reset-btn").disabled = true;
  }
  document.querySelector(".col-2").innerHTML = "";
  document.querySelector(".col-2").appendChild(templateClone);
}

async function handleCheckoutButtonClicked(isBillPaid) {
  if (isBillPaid) {
    currentBill.paid = false;
    await renderBill();
  } else {
    checkout(currentBill);
  }
}

function resetBill(bill) {
  const tempBillList = getBillList(1);
  const orgBill = tempBillList.find((orgBill) => bill.id === orgBill.id);
  loadBill(orgBill);
}

function renderBillTableHeaders() {
  const tableHeaderNames = [
    "Service",
    "Price",
    "Done By",
    "Discount",
    "Final price",
    "Note",
    "Delete",
  ];
  const tableHeaders = tableHeaderGenerator(tableHeaderNames);
  document.querySelector("thead").appendChild(tableHeaders);
}

function renderBillTableRows() {
  if (!currentBill) return;
  const isBillPaid = currentBill.paid;
  const data = getBillTableData(currentBill);
  //build the table
  if ($.fn.dataTable.isDataTable("#myTable")) {
    billTable.clear().rows.add(data).draw();
  } else {
    billTable = new DataTable("#myTable", {
      paging: false,
      searching: false,
      info: false,
      data: data,
      columns: [
        {
          data: "serviceTitle",
          render: function (data) {
            return generateServiceOptionsForBillTable(
              data,
              isBillPaid,
              handleServiceSelectValueChanged,
            );
          },
        },
        {
          data: "servicePrice",
          render: function (data) {
            return `<p id="price-${data.id}">${data.value}</p>`;
          },
        },
        {
          data: "serviceStaff",
          render: function (data) {
            return generateStaffOptionsForBillTable(
              data,
              isBillPaid,
              handleStaffSelectValueChanged,
            );
          },
        },
        {
          data: "serviceDiscount",
          render: function (data) {
            return generateTableInput(
              data,
              isBillPaid,
              "discount",
              handleDiscountInputChanged,
            );
          },
        },
        {
          data: "serviceTotal",
          render: function (data) {
            return `<p id="total-${data.id}">${data.value}</p>`;
          },
        },
        {
          data: "serviceNote",
          render: function (data) {
            return generateTableInput(
              data,
              isBillPaid,
              "note",
              handleNoteInputChanged,
            );
          },
        },
        {
          data: "serviceFunc",
          render: function (data) {
            return generateServiceDeleteButton(
              data,
              isBillPaid,
              handleDeleteBillService,
            );
          },
        },
      ],
    });
  }
}

function handleServiceSelectValueChanged(e) {
  if (!currentBill) return;
  const billServiceId = e.target.dataset.billServiceId;
  const serviceId = parseInt(e.target.value);
  updateService(serviceId, billServiceId, currentBill);
  renderBillTableRows();
}

function handleStaffSelectValueChanged(e) {
  if (!currentBill) return;
  const billServiceId = e.target.dataset.billServiceId;
  const staffId = parseInt(e.target.value);
  updateStaff(staffId, billServiceId, currentBill);
}

function handleDiscountInputChanged(e) {
  if (!currentBill) return;
  const billServiceId = e.target.dataset.billServiceId;
  const input = e.target.value;
  if (checkIsPriceNumber(input)) {
    e.target.value = formatMoney(parsePriceCents(input));
    updateDiscount(input, billServiceId, currentBill);
    renderBillTableRows();
  } else {
    e.target.value = "0.00";
  }
}

function handleNoteInputChanged(e) {
  if (!currentBill) return;
  const billServiceId = e.target.dataset.billServiceId;
  const input = e.target.value;
  updateNote(input, billServiceId, currentBill);
}

function handleDeleteBillService(e) {
  if (!currentBill) return;
  const billServiceId = e.target.dataset.billServiceId;
  deleteBillServiceTemp(billServiceId, currentBill);
  renderBillTableRows();
}

//change choose indicator's color
function activateIndicator(id) {
  const listItems = document.querySelectorAll(".list-item");
  for (let listItem of listItems) {
    listItem.children[0].className = "choose-indicator";
    listItem.children[1].style.fontWeight = "400";
    if (listItem.id == id) {
      listItem.children[0].className += " active";
      listItem.children[1].style.fontWeight = "700";
    }
  }
}
