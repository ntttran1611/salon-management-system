import { Bills } from "../data/bill-list.js";
import { serviceList } from "../data/service-list.js";
import { StaffList } from "../data/staff-list.js";
import { Bill, getBillList } from "../lib/api/bill-api.js";
import { checkDollarStringFormat, formatMoney } from "../lib/utils/currency.js";
import {
  showDeleteAlert,
  showNoticeAlert,
  showCheckOutDialog,
} from "../lib/components/dialog.js";
import {
  animateTwoColLayout,
  getTemplate,
  tableHeaderGenerator,
} from "../lib/utils/layout-handler.js";
import { getServiceList } from "../lib/api/service-api.js";
import { getStaffList } from "../lib/api/staff-api.js";

document.querySelector("#bills").addEventListener("click", loadPage);
window.onload = loadPage;

const tempBillsList = Bills; //must be filtered by branches
const tempServiceList = serviceList;
const tempStaffList = StaffList;

//display all bills and the first bill when the page is load
async function loadPage() {
  if (document.querySelector("#bills").className.includes("active")) {
    const tempBillList = getBillList(1);
    await buildTwoColLayoutForBillTab(tempBillList);
    animateTwoColLayout();
  }
}

async function buildTwoColLayoutForBillTab(tempBillList) {
  const getTwoColTemplate = await getTemplate(
    "two-col-template",
    "#bill-two-col-template",
  );
  const templateClone = document.importNode(getTwoColTemplate.content, true);
  /**FIX THIS: use textCOntent instead */
  templateClone.querySelector("#bill-list-title").innerHTML =
    `<i class="fa-solid fa-code-branch"></i> <span>Kingston</span>`;
  await getBillListContent(
    tempBillList,
    templateClone.querySelector("#bill-list"),
  );
  document.querySelector("main").innerHTML = "";
  document.querySelector("main").appendChild(templateClone);
}

async function getBillListContent(tempBillList, listNode) {
  if (tempBillList.length == 0) {
    const noteElem = document.createElement("p");
    noteElem.className = "note-lg";
    noteElem.textContent = "No bill recoreded";
    listNode.appendChild(noteElem);
  } else {
    listNode.innerHTML = "";
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
      listNode.appendChild(listItemClone);
    }
  }
}

async function loadBill(bill) {
  await buildBillInfoLayout(bill);
  buildBillTable(bill);
}

async function buildBillInfoLayout(bill) {
  const billInfoTemplate = await getTemplate(
    "bill-template",
    "#bill-info-template",
  );

  const templateClone = document.importNode(billInfoTemplate.content, true);
  templateClone.querySelector("span#bill-cusName").textContent =
    ` \u00A0${bill.cusName} | \u00A0`;
  templateClone.querySelector("span#bill-mobile").textContent =
    ` \u00A0${bill.mobile} | \u00A0`;
  templateClone.querySelector("span#bill-time").textContent =
    ` \u00A0${bill.entranceDate}, ${bill.entranceTime}`;

  document.querySelector(".col-2").innerHTML = "";
  document.querySelector(".col-2").appendChild(templateClone);
}

function buildBillTable(bill) {
  const tableHeaderNames = [
    "Service",
    "Price",
    "Done By",
    "Discount",
    "Final price",
    "Note",
    "Funcs",
  ];
  const tableHeaders = tableHeaderGenerator(tableHeaderNames);
  document.querySelector("thead").appendChild(tableHeaders);

  const data = getBillTableData(bill);
  console.log(data);
  //build the table
  new DataTable("#myTable", {
    paging: false,
    searching: false,
    info: false,
    data: data,
    columns: [
      {
        data: "serviceTitle",
        render: function (data) {
          return getServiceOptionsForBillTable(data);
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
          return getStaffOptionsForBillTable(data);
        },
      },
      {
        data: "serviceDiscount",
        render: function (data) {
          return `<input class="table-input discount" type="text" name="bill-discount" id="discount-${data.id}" value='${data.value}' placeholder="0.00">`;
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
          return `<input class="table-input note" type="text" name="bill-note" id="note-${data.id}" value='${data.value}' placeholder="Note"></input>`;
        },
      },
      {
        data: "serviceFunc",
        render: function (data) {
          return `<button id="${data}" class="round-btn delete-table-btn ">
                    <i class="fa-solid fa-trash fa-xs"></i> 
                    <span class="tooltiptext">Delete</span>
                </button> `;
        },
      },
    ],
  });
}

function getServiceOptionsForBillTable(data) {
  const select = document.createElement("select");
  select.id = `service-${data.id}`;
  select.className = "table-select service";
  select.innerHTML = "";
  const tempServiceList = getServiceList();
  for (let service of tempServiceList) {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = service.title;
    select.appendChild(option);
  }
  select.value = data.value;
  return select;
}

function getStaffOptionsForBillTable(data) {
  const select = document.createElement("select");
  select.id = `staff-${data.id}`;
  select.className = "table-select staff";
  select.innerHTML = "";
  const tempStaffList = getStaffList();
  for (let staff of tempStaffList) {
    const option = document.createElement("option");
    option.value = staff.id;
    option.textContent = `${staff.firstName} ${staff.lastName}`;
    select.appendChild(option);
  }
  select.value = data.value;
  return select;
}

function getBillTableData(bill) {
  const data = [];
  const tempServiceList = getServiceList();
  for (let billService of bill.services) {
    const serviceData = tempServiceList.find(
      (service) => service.id == billService.serviceId,
    );
    const rowData = {
      serviceTitle: { id: billService.id, value: billService.serviceId },
      servicePrice: {
        id: billService.id,
        value: formatMoney(serviceData.priceCents),
      },
      serviceStaff: { id: billService.id, value: billService.staffId },
      serviceDiscount: {
        id: billService.id,
        value: formatMoney(billService.discountCents),
      },
      serviceTotal: {
        id: billService.id,
        value: formatMoney(serviceData.priceCents - billService.discountCents),
      },
      serviceNote: { id: billService.id, value: billService.note },
      serviceFunc: billService.id,
    };

    data.push(rowData);
  }

  return data;
}

//get row content for the service table
function getRows(billObj) {
  let rowContent = "";
  const serviceOptions = tempServiceList
    .map((service) => {
      return `<option value=${service.id}>${service.title}</option>`;
    })
    .join("");
  const staffOptions = tempStaffList
    .map((staff) => {
      if (staff.active) {
        return `<option value=${staff.id}>${staff.firstName} ${staff.lastName}</option>`;
      }
    })
    .join("");

  const billServices = billObj.getBillServices();
  for (let i = 0; i < billServices.length; i++) {
    const service = serviceList.find(
      (service) => service.id == billServices[i].serviceId,
    );
    rowContent += `<tr>
            <td><select id="service-${i}" class="table-select service" ${billObj.getStatus() ? "disabled" : ""}>${serviceOptions}</select></td>
            <td id="price-${i}">${checkDollarStringFormat(service.price)}</td>
            <td><select id="staff-${i}" class="table-select staff" ${billObj.getStatus() ? "disabled" : ""}>${staffOptions}</select></td>
            <td><input class="table-input discount" type="text" name="bill-discount" id="discount-${i}" value='${billServices[i].discount == 0 ? "0.00" : checkDollarStringFormat(billServices[i].discount)}' placeholder="0.00" ${billObj.getStatus() ? "disabled" : ""}></td>
            <td id="total-${i}">${checkDollarStringFormat(parseFloat(service.price).toFixed(2) - parseFloat(billServices[i].discount).toFixed(2))}</td>
            <td><input class="table-input note" type="text" name="bill-note" id="note-${i}" value='${billServices[i].note == "" ? "" : billServices[i].note}' placeholder="Enter something to describe this bill" ${billObj.getStatus() ? "disabled" : ""}></td>
            <td>
                <button id="${i}" class="round-btn delete-table-btn " ${billObj.getStatus() ? "disabled" : ""}>
                    <i class="fa-solid fa-trash fa-xs"></i> 
                    <span class="tooltiptext">Delete</span>
                </button> 
            </td>
        </tr>`;
  }

  if (!billObj.getStatus()) {
    rowContent += `<tr>
            <td><select id="service-${billObj.getServicesCount()}" class="table-select service inactive">${serviceOptions}</select></td>
            <td id="price-${billObj.getServicesCount()}" class="inactive">0.00</td>
            <td><select id="staff-${billObj.getServicesCount()}" class="table-select staff inactive">${staffOptions}</select></td>
            <td><input class="table-input discount inactive" type="text" name="bill-discount" id="discount-${billObj.getServicesCount()}" value="" placeholder="0.00"></td>
            <td id="total-${billObj.getServicesCount()}" class="inactive">0.00</td>
            <td><input class="table-input note inactive" type="text" name="bill-note" id="note-${billObj.getServicesCount()}" value="" placeholder="Enter something to describe this bill"></td>
            <td>
                <button id="add-service" class="round-btn sm add-table-btn">
                    <i class="fa-solid fa-plus fa-xs"></i>
                    <span class="tooltiptext">Add new</span> 
                </button> 
            </td>
        </tr>`;
  }

  return rowContent;
}

function oldLoadBill(billObj) {
  //display bill details
  //document.querySelector(".col-2").innerHTML = generateBillContent(billObj);
  setStaffAndServices(billObj.getBillServices());

  //handle values changed
  handleServiceOptionChanged(billObj);
  handleDiscountChanged(billObj);
  handleNoteChaged(billObj);
  handleStaffChanged(billObj);

  //handle buttons clicked
  handleDeleteSingleService(billObj);
  handleAddSingleService(billObj);
  document.querySelector("#check-out-btn").onclick = () => {
    //console.log(billObj);
    billObj.getStatus()
      ? uncheckBill(billObj)
      : showCheckOutDialog(billObj, tempServiceList);
  };
  document.querySelector("#bill-delete-btn").onclick = () => {
    showDeleteAlert(billObj.getId(), billObj.getCusName());
  };

  //build the table
  new DataTable("#myTable", {
    paging: false,
    searching: false,
    info: false,
  });
}

function uncheckBill(billObj) {
  billObj.uncheck();
  loadBill(billObj);
}

function handleServiceOptionChanged(billObj) {
  const serviceSelects = document.querySelectorAll(".table-select.service");
  for (let select of serviceSelects) {
    select.onchange = (e) => {
      const serviceIndex = e.target.id.slice(-1);
      const service = serviceList.find(
        (service) => service.id == e.target.value,
      );

      const priceRow = document.querySelector(`#price-${serviceIndex}`);
      const totalBillText = document.querySelector("#total");
      const totalRow = document.querySelector(`#total-${serviceIndex}`);
      const discountRow = document.querySelector(`#discount-${serviceIndex}`);
      //set relevant text outputs
      priceRow.textContent = checkDollarStringFormat(service.price);
      totalRow.textContent = checkDollarStringFormat(
        (parseFloat(service.price) - parseFloat(discountRow.value)).toFixed(2),
      );
      //set the chosen service to the bill object
      billObj.setServiceId(serviceIndex, parseInt(e.target.value));
      totalBillText.textContent = `${checkDollarStringFormat(billObj.getTotal(tempServiceList))}`;
    };
  }
}

function handleDiscountChanged(billObj) {
  const discountInputs = document.querySelectorAll(".table-input.discount");
  for (let discountInput of discountInputs) {
    discountInput.onchange = (e) => {
      if (e.target.value != "") {
        //get the id of the bill service
        const serviceIndex = e.target.id.slice(-1);
        const priceRow = document.querySelector(`#price-${serviceIndex}`);
        const totalRow = document.querySelector(`#total-${serviceIndex}`);
        const totalBillText = document.querySelector("#total");
        if (checkDollarStringFormat(e.target.value)) {
          totalRow.textContent = checkDollarStringFormat(
            (
              parseFloat(priceRow.textContent) - parseFloat(e.target.value)
            ).toFixed(2),
          );
          e.target.value = checkDollarStringFormat(e.target.value);
        } else {
          showNoticeAlert(
            "Invalid input. Correct format: (e.g.) 16, 16.00 or 16.0",
            "failed",
          );
          totalRow.textContent = priceRow.textContent;
          e.target.value = "0.00";
        }
        billObj.setServiceDiscount(serviceIndex, parseFloat(e.target.value));
        totalBillText.textContent = `${checkDollarStringFormat(billObj.getTotal(tempServiceList))}`;
      } else {
        e.target.value = "0.00";
      }
    };
  }
}

function handleStaffChanged(billObj) {
  const staffSelects = document.querySelectorAll(".table-select.staff");
  for (let staffSelect of staffSelects) {
    staffSelect.onchange = (e) => {
      const serviceIndex = e.target.id.slice(-1);
      billObj.setServiceStaff(serviceIndex, parseInt(e.target.value));
    };
  }
}

function handleNoteChaged(billObj) {
  const noteInputs = document.querySelectorAll(".table-input.note");
  for (let noteInput of noteInputs) {
    noteInput.onchange = (e) => {
      const serviceIndex = e.target.id.slice(-1);
      billObj.setServiceNote(serviceIndex, parseInt(e.target.value));
    };
  }
}

//Deleting a service on the bill
function handleDeleteSingleService(billObj) {
  const deleteSingleServiceBtns =
    document.querySelectorAll(".delete-table-btn");
  for (let btn of deleteSingleServiceBtns) {
    btn.onclick = () => {
      billObj.deleteService(btn.id);
      loadBill(billObj);
    };
  }
}

//Adding a service to the bill
function handleAddSingleService(billObj) {
  const addingBtn = document.querySelector(".add-table-btn");
  addingBtn != null
    ? (addingBtn.onclick = () => {
        let addingIndex = billObj.getServicesCount(); //the next service index (of the service array) will be the length of the current service array
        let serviceId = parseInt(
          document.querySelector(`#service-${addingIndex}`).value,
        );
        let staffId = parseInt(
          document.querySelector(`#staff-${addingIndex}`).value,
        );
        let discount =
          document.querySelector(`#discount-${addingIndex}`).value == ""
            ? 0
            : parseFloat(
                document.querySelector(`#discount-${addingIndex}`).value,
              );
        let note = document.querySelector(`#note-${addingIndex}`).value;

        billObj.addService(serviceId, staffId, discount, note);
        loadBill(billObj); //reload the bill interface
      })
    : null;
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

//display services and corresponding staff listed on the bill
function setStaffAndServices(services) {
  const serviceSelects = document.querySelectorAll(".table-select.service");
  const staffSelects = document.querySelectorAll(".table-select.staff");
  for (let i = 0; i < services.length; i++) {
    serviceSelects[i].value = services[i].serviceId;
    staffSelects[i].value = services[i].staffId == -1 ? 1 : services[i].staffId;
  }
}
