import {
  enableFormEditing,
  enableSelects,
  enableInputs,
  enableLabels,
} from "../lib/functions/shared.js";
import { showDeleteAlert } from "../lib/components/dialog.js";
import {
  addEditBranch,
  checkInputs,
  getBranchList,
} from "../lib/api/branch-api.js";
import {
  animateTwoColLayout,
  buildTwoColLayout,
  getTemplate,
  tableHeaderGenerator,
  viewButtonGenerator,
} from "../lib/utils/layout-handler.js";

document.querySelector("#branches").addEventListener("click", loadPage);

async function loadPage() {
  if (document.querySelector("#branches").className.includes("active")) {
    let tempBranchList = getBranchList();
    await buildTwoColLayout(tempBranchList, openForm);
    buildBranchTable(tempBranchList);
    animateTwoColLayout();
  }
}

function buildBranchTable(tempBranchList) {
  let branchTableHeaders = [
    "Name",
    "Opening time",
    "Closing time",
    "Address",
    "View",
  ];
  const tableHeaderNames = tableHeaderGenerator(branchTableHeaders);
  const tableHeaderElem = document.querySelector("thead");
  tableHeaderElem.appendChild(tableHeaderNames);

  let data = getRowData(tempBranchList);
  $(document).ready(function () {
    $("#myTable").DataTable({
      data: data,
      columns: [
        { data: "name" },
        { data: "openingTime" },
        { data: "closingTime" },
        { data: "address" },
        {
          data: "function",
          render: function (data) {
            return viewButtonGenerator(data, tempBranchList, openForm);
          },
        },
      ],
    });
  });
}

function getRowData(tempBranchList) {
  let data = [];

  for (let branch of tempBranchList) {
    const rowData = {
      name: branch.name,
      openingTime: branch.openingTime,
      closingTime: branch.closingTime,
      address: branch.address,
      function: branch.id,
    };

    data.push(rowData);
  }

  return data;
}

//startTime, endTime indicates the first time and last time of the list
//it can be openingTime or closingTime of the branch. e.g 9:00 or 13:00
//startTime and endTime must be int
//blockOfTime can be 60, 30, 15 (indicating that the time can be displayed in 00 / 00 and 30 / 00 and 30 and 15) respectively
function tradingHourOptionsGenerator(startTime, endTime, blockOfTime) {
  const optionListLength = (endTime - startTime) * (60 / blockOfTime);
  let tempStartTime = startTime;
  let optionsHTML = "";
  for (let i = 0; i <= optionListLength; i++) {
    const timeString = `${parseInt(tempStartTime)}:${String((tempStartTime - parseInt(tempStartTime)) * 60).padStart(2, "0")}`;
    optionsHTML += `<option id=${timeString} value=${timeString}>${timeString}</option>`;
    tempStartTime += blockOfTime / 60;
  }

  return optionsHTML;
}

async function getInputTemplate(branch, tempBranchList) {
  const openingTimeOptionList = tradingHourOptionsGenerator(9, 12, 15);
  const closingTimeOptionList = tradingHourOptionsGenerator(15, 17, 15);
  const inputTemplate = await getTemplate(
    "branch-template",
    "#branch-input-template",
  );

  const templateClone = document.importNode(inputTemplate.content, true);
  templateClone.querySelector("h2").textContent = branch.name;
  templateClone.querySelector("input#name").value = branch.name;
  templateClone.querySelector("select#openingTime").innerHTML =
    openingTimeOptionList;
  templateClone.querySelector("select#openingTime").value = branch.openingTime;
  templateClone.querySelector("select#closingTime").innerHTML =
    closingTimeOptionList;
  templateClone.querySelector("select#closingTime").value = branch.closingTime;
  templateClone.querySelector("input#address").value = branch.address;

  //functional buttons on the header
  templateClone.querySelector("#close-btn").addEventListener("click", loadPage);

  templateClone.querySelector("#cancel-btn").addEventListener("click", (e) => {
    e.preventDefault();
    openForm(branch.id, tempBranchList);
  });

  templateClone.querySelector("#confirm-btn").addEventListener("click", (e) => {
    e.preventDefault();
    submitForm(branch);
  });

  const col2 = document.querySelector(".col-2");
  col2.innerHTML = "";
  if (col2) col2.appendChild(templateClone);
}

function submitForm(branch) {
  const inputElems = document.querySelectorAll("input.form-input");
  const branchClone = { ...branch };

  for (let inputElem of inputElems) {
    branchClone[inputElem.name] = inputElem.value;
  }
  addEditBranch(branchClone);
}

async function openForm(id, tempBranchList) {
  const chosenBranch = tempBranchList.find((branch) => branch.id == id);
  const isEditing = chosenBranch != undefined;

  //instance of the branch/new branch to be managed
  const branch = isEditing
    ? { ...chosenBranch }
    : {
        id: crypto.randomUUID(),
        name: "",
        openingTime: "9:00",
        closingTime: "17:00",
        address: "",
      };

  await getInputTemplate(branch, tempBranchList);

  isEditing ? modifyFormIfEditing(branch) : modifyFormIfAdding();
}

function modifyFormIfEditing(branch) {
  const editBtn = document.querySelector("#edit-btn");
  editBtn.addEventListener("click", () => {
    enableForm();
  });
  editBtn.style.display = "inline";

  const deleteBtn = document.querySelector("#delete-btn");
  deleteBtn.style.display = "inline";
  deleteBtn.addEventListener("click", () =>
    showDeleteAlert(branch.id, branch.name),
  );
}

function modifyFormIfAdding() {
  document.querySelector("h2").textContent = "Adding a new branch";
  enableForm();
  const cancelBtn = document.querySelector("#cancel-btn");
  cancelBtn.textContent = "Reset";
}

//enable form
function enableForm() {
  enableFormEditing();
  enableSelects();
  enableInputs();
  enableLabels();
}
