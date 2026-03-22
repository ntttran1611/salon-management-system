import {
  getVoucherList,
  getStatus,
  checkInputs,
  addEditVoucher,
} from "../lib/api/voucher-api.js";
import {
  enableToggle,
  enableFormEditing,
  enableInputs,
  enableLabels,
  formatDate,
} from "../lib/functions/shared.js";
import { showDeleteAlert } from "../lib/components/dialog.js";
import {
  getTemplate,
  tableHeaderGenerator,
  animateTwoColLayout,
  viewButtonGenerator,
} from "../lib/utils/layoutHandler.js";

document.querySelector("#vouchers").addEventListener("click", loadPage);

async function loadPage() {
  if (document.querySelector("#vouchers").className.includes("active")) {
    const tempVouchersList = getVoucherList();
    await buildTwoColLayout(tempVouchersList);
    buildVoucherTable(tempVouchersList);
    animateTwoColLayout();
  }
}

async function buildTwoColLayout(tempVouchersList) {
  const main = document.querySelector("main");
  const twoColTemplate = await getTemplate(
    "two-col-template",
    "#two-col-template",
  );
  const templateClone = document.importNode(twoColTemplate.content, true);
  const addBtn = templateClone.querySelector("#add-btn");
  addBtn.addEventListener("click", () => openForm(null, tempVouchersList));
  main.innerHTML = "";
  if (main) main.appendChild(templateClone);
}

function buildVoucherTable(tempVouchersList) {
  const voucherTableHeaders = [
    "Status",
    "Code",
    "Buyer Name",
    "Price",
    "Expiry",
    "Function",
  ];
  const tableHeaderNames = tableHeaderGenerator(voucherTableHeaders);
  const tableHeaderElem = document.querySelector("thead");
  if (tableHeaderElem) tableHeaderElem.appendChild(tableHeaderNames);

  let data = getRowData(tempVouchersList);
  $(document).ready(function () {
    $("#myTable").DataTable({
      data: data,
      columns: [
        {
          data: "status",
          render: function (data) {
            return `<i class="fa-solid fa-circle status ${data}"></i>`;
          },
        },
        { data: "code" },
        { data: "buyer" },
        { data: "price" },
        { data: "expiry" },
        {
          data: "function",
          render: function (data) {
            return viewButtonGenerator(data, tempVouchersList, openForm);
          },
        },
      ],
    });
  });
}

function getRowData(tempVouchersList) {
  let data = [];

  for (let voucher of tempVouchersList) {
    const rowData = {
      status: getStatus(voucher),
      code: voucher.code,
      buyer: voucher.buyer,
      price: voucher.price,
      expiry: voucher.expiryDate,
      function: voucher.id,
    };

    data.push(rowData);
  }

  return data;
}

async function openForm(id, tempVouchersList) {
  const chosenVoucher = tempVouchersList.find((voucher) => voucher.id == id);
  console.log(tempVouchersList.find((voucher) => voucher.id == id));
  let isEditing = chosenVoucher != undefined;
  let voucher = isEditing
    ? { ...chosenVoucher }
    : {
        buyer: "",
        price: "",
        issueDate: "",
        expiryDate: "",
        mobile: "",
        note: "",
        used: false,
      };

  await getInputTemplate(voucher, tempVouchersList).then();

  isEditing ? modifyFormIfEditing(voucher) : modifyFormIfAdding();
}

async function getInputTemplate(voucher, tempVouchersList) {
  const today = new Date();
  const col2 = document.querySelector(".col-2");
  const inputTemplate = await getTemplate(
    "vouchers-templates",
    "#voucher-input-template",
  );
  const templateClone = document.importNode(inputTemplate.content, true);
  templateClone.querySelector("h2").textContent = `Voucher #${voucher.code}`;
  templateClone.querySelector("input#buyer").value = voucher.buyer;
  templateClone.querySelector("input#price").value = voucher.price;
  templateClone.querySelector("input#issueDate").value = voucher.issueDate
    ? voucher.issueDate
    : formatDate(today);

  //get new issue and expiry dates automatically if adding a new voucher
  voucher.expiryDate ? today.setFullYear(today.getFullYear() + 3) : null;

  templateClone.querySelector("input#expiryDate").value = voucher.expiryDate
    ? voucher.expiryDate
    : formatDate(today);
  templateClone.querySelector("input#note").value = voucher.note;
  templateClone.querySelector("input#mobile").value = voucher.mobile;

  //functional buttons on the header
  templateClone.querySelector("#close-btn").addEventListener("click", loadPage);

  templateClone
    .querySelector("#cancel-btn")
    .addEventListener("click", () => openForm(voucher.id, tempVouchersList));

  templateClone
    .querySelector("#confirm-btn")
    .addEventListener("click", () => submitForm(voucher));

  col2.innerHTML = "";
  if (col2) col2.appendChild(templateClone);
  setVoucherStatus(voucher);
}

function modifyFormIfAdding() {
  document.querySelector("h2").textContent = "Adding a new voucher";
  enableForm();
  const cancelBtn = document.querySelector("#cancel-btn");
  cancelBtn.textContent = "Reset";
}

function modifyFormIfEditing(voucher) {
  const editBtn = document.querySelector("#edit-btn");
  editBtn.addEventListener("click", () => {
    enableForm();
    getStatus(voucher) === "active" && enableToggle();
  });
  editBtn.style.display = "inline";

  const deleteBtn = document.querySelector("#delete-btn");
  deleteBtn.style.display = "inline";
  deleteBtn.addEventListener("click", () =>
    showDeleteAlert(voucher.id, voucher.code),
  );

  //this should only work when changing from 'active' to 'used' status
  document.querySelector(".toggle").onclick = (e) =>
    handledToggleValueChanged(e, voucher);
}

function submitForm(voucher) {
  const inputElems = document.querySelectorAll(".form-input");
  const voucherClone = { ...voucher };

  for (let inputElem of inputElems) {
    voucherClone[inputElem.name] = inputElem.value;
  }

  if (checkInputs(voucherClone)) addEditVoucher(voucherClone);
}

//handle toggle's value changed
function handledToggleValueChanged(evt, voucher) {
  const toggle = document.querySelector(".toggle");
  if (toggle.className.includes("enabled")) {
    if (evt.target.id == "toggle-active") {
      voucher.used = false;
    } else if (evt.target.id == "toggle-inactive") {
      voucher.used = true;
    }
    setVoucherStatus(voucher);
  }
}

//add voucher status to the form
function setVoucherStatus(voucher) {
  const toggle = document.querySelector(".toggle");
  for (let i = 0; i < toggle.children.length; i++) {
    toggle.children[i].className = "toggle-btn";
  }
  let status =
    voucher != undefined
      ? getStatus(voucher) != "permaInactive"
        ? getStatus(voucher)
        : "inactive"
      : "active";
  document.querySelector(`#toggle-${status}`).className += " active";
}

function enableForm() {
  enableFormEditing();
  enableInputs();
  enableLabels();
}
