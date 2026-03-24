import {
  getVoucherList,
  getStatus,
  checkInputs,
  addEditVoucher,
} from "../lib/api/voucher-api.js";
import {
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
  buildTwoColLayout,
} from "../lib/utils/layout-handler.js";
import { formatMoney } from "../lib/utils/currency.js";
import { checkIsPriceNumber } from "../lib/utils/data-validation.js";

document.querySelector("#vouchers").addEventListener("click", loadPage);

async function loadPage() {
  if (document.querySelector("#vouchers").className.includes("active")) {
    const tempVouchersList = getVoucherList();
    await buildTwoColLayout(tempVouchersList, openForm);
    buildVoucherTable(tempVouchersList);
    animateTwoColLayout();
  }
}

function buildVoucherTable(tempVouchersList) {
  const voucherTableHeaders = [
    "Status",
    "Code",
    "Buyer Name",
    "Original value",
    "Remaining value",
    "Expiry Date",
    "View",
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
        { data: "originalValue" },
        { data: "remainingValue" },
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
      originalValue: formatMoney(voucher.originalValueCents),
      remainingValue: formatMoney(voucher.remainingValueCents),
      expiry: voucher.expiryDate,
      function: voucher.id,
    };

    data.push(rowData);
  }

  return data;
}

async function openForm(id, tempVouchersList) {
  const today = new Date();
  const nextThreeYearsFromToday = new Date(
    today.setFullYear(today.getFullYear() + 3),
  );
  const chosenVoucher = tempVouchersList.find((voucher) => voucher.id == id);
  let isEditing = chosenVoucher != undefined;
  let voucher = isEditing
    ? { ...chosenVoucher }
    : {
        id: crypto.randomUUID(),
        buyer: "",
        issueDate: formatDate(today),
        expiryDate: formatDate(nextThreeYearsFromToday),
        mobile: "",
        note: "",
        originalValueCents: 0,
        remainingValueCents: 0,
      };

  await getInputTemplate(voucher, tempVouchersList);

  isEditing ? modifyFormIfEditing(voucher) : modifyFormIfAdding();
}

async function getInputTemplate(voucher, tempVouchersList) {
  const col2 = document.querySelector(".col-2");
  const inputTemplate = await getTemplate(
    "vouchers-templates",
    "#voucher-input-template",
  );
  const templateClone = document.importNode(inputTemplate.content, true);
  templateClone.querySelector("h2").textContent = `Voucher #${voucher.code}`;
  templateClone.querySelector("input#buyer").value = voucher.buyer;
  templateClone.querySelector("input#originalValueCents").value = formatMoney(
    voucher.originalValueCents,
  );
  templateClone.querySelector("p#remainingValueCents").textContent =
    formatMoney(voucher.remainingValueCents);
  templateClone.querySelector("p#issueDate").textContent = voucher.issueDate;
  templateClone.querySelector("p#expiryDate").textContent = voucher.expiryDate;
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
  const remainingValueInput = document.querySelector("#remainingValueCents");
  remainingValueInput.disabled = true;
  const originalValueInput = document.querySelector("#originalValueCents");
  originalValueInput.addEventListener("change", (e) =>
    handleWhenOriginalValueChanged(e),
  );
}

function modifyFormIfEditing(voucher) {
  const editBtn = document.querySelector("#edit-btn");
  editBtn.addEventListener("click", () => {
    enableForm();
    const originalValueInput = document.querySelector("#originalValueCents");
    originalValueInput.disabled = true;
  });
  editBtn.style.display = "inline";

  const deleteBtn = document.querySelector("#delete-btn");
  deleteBtn.style.display = "inline";
  deleteBtn.addEventListener("click", () =>
    showDeleteAlert(voucher.id, voucher.code),
  );
}

function handleWhenOriginalValueChanged(e) {
  const remainingValueInput = document.querySelector("#remainingValueCents");
  const input = e.target.value;
  if (checkIsPriceNumber(input)) {
    remainingValueInput.textContent = formatMoney(parseFloat(input) * 100);
    e.target.value = formatMoney(parseFloat(input) * 100);
  } else {
    remainingValueInput.textContent = "0.00";
    e.target.value = "0.00";
  }
}

function submitForm(voucher) {
  const inputElems = document.querySelectorAll("input.form-input");
  const textValue = document.querySelector("p#remainingValueCents");
  const voucherClone = { ...voucher };

  for (let inputElem of inputElems) {
    voucherClone[inputElem.name] = inputElem.value;
  }
  voucherClone[textValue.id] = textValue.textContent;
  if (checkInputs(voucherClone)) addEditVoucher(voucherClone);
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
