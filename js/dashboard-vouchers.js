import { Vouchers } from "../data/voucher-list.js";
import { Voucher } from "../lib/objects/voucher.js";
import {
  closeManagingTab,
  formatDate,
  disableToggle,
  enableToggle,
  disableFormEditing,
  enableFormEditing,
  disableInputs,
  enableInputs,
  disableLabels,
  enableLabels,
  getStringFormat,
} from "../lib/functions/shared.js";
import { showDeleteAlert, showNoticeAlert } from "../lib/components/dialog.js";
import {
  getTemplate,
  tableHeaderGenerator,
  twoColLayoutAnimation,
  viewButtonGenerator,
} from "../lib/utils/layoutHandler.js";

document.querySelector("#vouchers").addEventListener("click", loadPage);

async function loadPage() {
  if (document.querySelector("#vouchers").className.includes("active")) {
    const tempVouchersList = Voucher.getVoucherArray(Vouchers);
    await buildTwoColLayout();
    buildVoucherTable(tempVouchersList);
    twoColLayoutAnimation();
  }
}

async function buildTwoColLayout() {
  const main = document.querySelector("main");
  const twoColTemplate = await getTemplate(
    "two-col-template",
    "#two-col-template",
  );
  const templateClone = document.importNode(twoColTemplate.content, true);
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

  //get rows with data
  let data = getRowData(tempVouchersList);
  //build the table
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
            return viewButtonGenerator(
              data,
              tempVouchersList,
              handleViewAddButtonsClicked,
            );
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
      status: voucher.getStatus(),
      code: voucher.getCode(),
      buyer: voucher.getBuyerName(),
      price: voucher.getPrice(),
      expiry: voucher.getExpiryDate(),
      function: voucher.getId(),
    };

    data.push(rowData);
  }

  return data;
}

//show input tab when view/add buttons are hit
function handleViewAddButtonsClicked(id, tempVouchersList) {
  //search for the chosen voucher using its id
  const chosenVoucher = tempVouchersList.find(
    (voucher) => voucher.getId() == id,
  );
  let isEditing = chosenVoucher != undefined;
  let cloneVoucher = isEditing ? chosenVoucher.clone() : new Voucher(undefined);

  //add content to input elements
  const col2 = document.querySelector(".col-2");
  getInputTemplate(cloneVoucher);

  //set height to col-2 for animations
  //col2.style.height = col2.scrollHeight + "px";
  /*
  //Add function to CLOSE TAB BUTTON
  document.querySelector("#close-btn").onclick = () => closeManagingTab();

  //Add function to CANCEL BUTTON
  const cancelBtn = document.querySelector("#cancel-btn");

  //Set voucher status
  setVoucherStatus(cloneVoucherObj);

  if (isEditing) {
    let initialStatus = cloneVoucherObj.getUsedStatus();

    //Add function to EDIT BUTTON
    document.querySelector("#edit-btn").onclick = () => {
      enableForm();
      cloneVoucherObj.getStatus() != "warning" &&
      cloneVoucherObj.getStatus() != "permaInactive"
        ? enableToggle()
        : null;
    };

    //disable editing if editing a branch
    cancelBtn.onclick = () => {
      //set all values back to the initial values
      document.querySelector("#voucher-buyer").value =
        cloneVoucherObj.getBuyerName();
      document.querySelector("#voucher-price").value =
        cloneVoucherObj.getPrice();
      document.querySelector("#voucher-issue-date").value =
        cloneVoucherObj.getIssueDate();
      document.querySelector("#voucher-expiry").value =
        cloneVoucherObj.getExpiryDate();
      document.querySelector("#voucher-mobile").value =
        cloneVoucherObj.getMobile();
      document.querySelector("#voucher-note").value = cloneVoucherObj.getNote();
      cloneVoucherObj.setStatus(initialStatus);
      setVoucherStatus(cloneVoucherObj);
      disableForm(); //disable inputs
      disableToggle(); //disable toggle
    };

    //DELETE BUTTON
    document.querySelector("#delete-btn").onclick = () =>
      showDeleteAlert(cloneVoucherObj.getId(), cloneVoucherObj.getCode());

    //STATUS TOGGLE
    document.querySelector(".toggle").onclick = (evt) =>
      handledToggleValueChanged(evt, cloneVoucherObj);
  } else {
    //get all inputs ready
    enableForm();
    //set default issue date and expiry
    const today = new Date();
    document.querySelector("#voucher-issue-date").value = formatDate(today);
    today.setFullYear(today.getFullYear() + 3); //add three years (standard valid period) to the issue date
    document.querySelector("#voucher-expiry").value = formatDate(today);

    //close tab if adding a branch
    cancelBtn.onclick = () => closeManagingTab();
  }

  //Add function to CONFIRM BUTTON
  document.querySelector("#confirm-btn").onclick = () => {
    //get final objects for submitting to db
    const checkInstance = cloneVoucherObj.clone();
    checkInstance.setBuyerName(document.querySelector("#voucher-buyer").value);
    checkInstance.setPrice(
      parseFloat(document.querySelector("#voucher-price").value),
    );
    checkInstance.setIssueDate(
      document.querySelector("#voucher-issue-date").value,
    );
    checkInstance.setExpiryDate(
      document.querySelector("#voucher-expiry").value,
    );
    checkInstance.setMobile(document.querySelector("#voucher-mobile").value);
    checkInstance.setNote(document.querySelector("#voucher-note").value);
    if (checkInputs(checkInstance)) {
      cloneVoucherObj = checkInstance;
      if (!isEditing) cloneVoucherObj.setCode();
      addEditVoucher(cloneVoucherObj);
    }
  };*/
}

async function getInputTemplate(voucher) {
  const col2 = document.querySelector(".col-2");
  const inputTemplate = await getTemplate(
    "vouchers-templates",
    "#voucher-input-template",
  );
  const templateClone = document.importNode(inputTemplate.content, true);
  templateClone.querySelector("h2").textContent =
    `Voucher #${voucher.getCode()}`;
  templateClone.querySelector("input#voucher-buyer").value =
    voucher.getBuyerName();
  templateClone.querySelector("input#voucher-price").value = voucher.getPrice();
  templateClone.querySelector("input#voucher-issue-date").value =
    voucher.getIssueDate();
  templateClone.querySelector("input#voucher-expiry-date").value =
    voucher.getExpiryDate();
  templateClone.querySelector("input#voucher-note").value = voucher.getNote();
  templateClone.querySelector("input#voucher-mobile").value =
    voucher.getMobile();
  templateClone.querySelector("#close-btn").onclick = () => closeManagingTab();

  col2.innerHTML = "";
  if (col2) col2.appendChild(templateClone);
  setVoucherStatus(voucher);
}

//handle toggle's value changed
function handledToggleValueChanged(evt, voucher) {
  const toggle = document.querySelector(".toggle");
  if (toggle.className.includes("enabled")) {
    if (evt.target.id == "toggle-active") {
      voucher.setStatus(false);
    } else if (evt.target.id == "toggle-inactive") {
      voucher.setStatus(true);
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
      ? voucher.getStatus() != "permaInactive"
        ? voucher.getStatus()
        : "inactive"
      : "active";
  document.querySelector(`#toggle-${status}`).className += " active";
}

//get input content
function getInputContent(voucherObj, isEditing) {
  //add content to the form inputs/selects if editing a voucher
  //if adding, leave the inputs blank
  let tabContent = `
            <div class="title-container">
                <h2 class="col-title"> ${isEditing ? `Voucher #${voucherObj.getCode()}` : `Adding a new voucher`}</h2>
            </div>
            
            <div class="main-func-btns">
                ${
                  isEditing
                    ? `<button id="edit-btn" class="round-btn edit-btn">
                    <i class="fa-solid fa-pen-to-square fa-lg"></i>
                    <span class="tooltiptext">Edit</span>
                </button> 
                <button id="delete-btn" class="round-btn delete-btn">
                    <i class="fa-solid fa-trash fa-lg"></i>
                    <span class="tooltiptext">Remove</span>
                </button>`
                    : ""
                }
                <button class="round-btn close-btn" id="close-btn">
                    <i class="fa-solid fa-xmark fa-xl"></i>
                    <span class="tooltiptext">Close</span>
                </button>
            </div> 
            <div class="form">
                <div class="double-inputs">
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-buyer'>What is the buyer name?</label><br>
                        <input class="form-input" maxlength=20 type="text" id="voucher-buyer" name="voucher-buyer" disabled required value='${isEditing ? voucherObj.getBuyerName() : ""}'>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-price'>Amount:</label><br>
                        <input class="form-input" type="text" id="voucher-price" name="voucher-price" disabled required value='${isEditing ? voucherObj.getPrice() : ""}'>
                    </div>
                </div>
                <div class="double-inputs">
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-issue-date'>Date of issue:</label><br>
                        <input class="form-input" maxlength=10 type="text" id="voucher-issue-date" name="voucher-issue-date" disabled required value='${isEditing ? voucherObj.getIssueDate() : ""}'>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-expiry'>Expired date:</label><br>
                        <input class="form-input" maxlength=10 type="text" id="voucher-expiry" name="voucher-expiry" disabled required value='${isEditing ? voucherObj.getExpiryDate() : ""}'>
                    </div>
                </div>
                <div class="double-inputs">
                    <div class='toggle-container'>
                        <label class="form-label">Status:</label><br>
                        <div class="toggle">
                            <div class="toggle-btn active" id="toggle-active">Valid</div>
                            <div class="toggle-btn" id="toggle-inactive">Used</div>
                            <div class="toggle-btn" id="toggle-warning">Expired</div>
                        </div>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-mobile'>Buyer's mobile:</label><br>
                        <input class="form-input" maxlength=10 type="text" id="voucher-mobile" name="voucher-mobile" disabled required value='${isEditing ? voucherObj.getMobile() : ""}'>
                    </div>
                </div>
                <div class="text-input-container">
                        <label class="form-label" for='voucher-note'>Notes:</label><br>
                        <input class="form-input" maxlength=50 type="text" id="voucher-note" name="voucher-note" disabled required value='${isEditing ? voucherObj.getNote() : ""}'>
                </div>
                <div class="confirm-btns">
                    <button id="confirm-btn" class="square-btn confirm-btn">Confirm</button>
                    <button id="cancel-btn" class="square-btn cancel-btn">Cancel</button>
                </div>
            </div>
        `;
  return tabContent;
}
//enable form
function enableForm() {
  enableFormEditing();
  enableInputs();
  enableLabels();
}
//disable form
function disableForm() {
  disableFormEditing();
  disableInputs();
  disableLabels();
}

//
//API
//
//check validity of inputs
function checkInputs(voucherObj) {
  const numberRegex = /^(04)\d{8}$/;
  const dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/; //YYYY-MM-DD or YYYY-M-D
  if (voucherObj.getBuyerName() == "") {
    showNoticeAlert("Name of the buyer required", "failed");
    return false;
  } else if (
    voucherObj.getPrice() == "" ||
    !getStringFormat(voucherObj.getPrice())
  ) {
    showNoticeAlert(
      "Amount required. Please ensure it is in correct format (e.g. 16.00, 16.0 or 16)",
      "failed",
    );
    return false;
  } else if (
    voucherObj.getExpiryDate() == "" ||
    voucherObj.getIssueDate() == ""
  ) {
    showNoticeAlert("Issue date and expiry date required", "failed");
    return false;
  } else if (
    new Date(voucherObj.getExpiryDate()) < new Date(voucherObj.getIssueDate())
  ) {
    showNoticeAlert("The expiry date must be after the issue date", "failed");
    return false;
  } else if (
    voucherObj.getMobile() == "" ||
    !numberRegex.test(voucherObj.getMobile())
  ) {
    showNoticeAlert(
      "Customer mobile number required. Please make sure it is in correct format (e.g. 04xxyyyzzz)",
      "failed",
    );
    return false;
  } else if (
    !dateRegex.test(
      voucherObj.getExpiryDate() ||
        !dateRegex.test(voucherObj.getIssueDate) ||
        new Date(voucherObj.getExpiryDate()) == "Invalid Date" ||
        new Date(voucherObj.getIssueDate()) == "Invalid Date",
    )
  ) {
    showNoticeAlert(
      "Invalid date. Please make sure dates are in range and under the correct format (e.g. YYYY-MM-DD or YYYY-M-D)",
      "failed",
    );
    return false;
  }
  return true;
}

//add/edit a voucher
function addEditVoucher(voucher) {
  //showNoticeAlert(`The item named ${voucher.code} has been added/edited.`, 'successful');
  console.log(voucher);
}

//delete a voucher
function deleteVoucher(voucher) {}
