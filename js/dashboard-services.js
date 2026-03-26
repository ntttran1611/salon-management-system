import { serviceList } from "../data/service-list.js";
import { Branches } from "../data/branch-list.js";
import {
  closeManagingTab,
  enableMultipleSelect,
  disableMultipleSelect,
  enableFormEditing,
  disableFormEditing,
  enableInputs,
  disableInputs,
  enableSelects,
  disableSelects,
  enableLabels,
  disableLabels,
} from "../lib/functions/shared.js";
import { showDeleteAlert, showNoticeAlert } from "../lib/components/dialog.js";
import { addEditService, getServiceList } from "../lib/api/service-api.js";
import { getBranchList } from "../lib/api/branch-api.js";
import {
  animateTwoColLayout,
  buildTwoColLayout,
  getTemplate,
  tableHeaderGenerator,
  viewButtonGenerator,
} from "../lib/utils/layout-handler.js";
import { formatMoney, parsePriceCents } from "../lib/utils/currency.js";
import { checkIsPriceNumber } from "../lib/utils/data-validation.js";

const serviceTypes = ["Nails", "Eyelashes", "Waxing"];
//get service and branch lists from db
const tempServicesList = serviceList;
const tempBranchesList = Branches;

document.querySelector("#services").addEventListener("click", loadPage);

async function loadPage() {
  if (document.querySelector("#services").className.includes("active")) {
    const tempServiceList = getServiceList();
    await buildTwoColLayout(tempServiceList, openForm);
    buildServiceTable(tempServiceList);
    animateTwoColLayout();
  }
}

function buildServiceTable(tempServiceList) {
  const tableHeaders = ["Title", "Price", "Type", "View"];
  const tableHeaderNames = tableHeaderGenerator(tableHeaders);
  const tableHeaderElem = document.querySelector("thead");
  tableHeaderElem.appendChild(tableHeaderNames);

  const data = getRowData(tempServiceList);
  $(document).ready(function () {
    $("#myTable").DataTable({
      data: data,
      columns: [
        {
          data: "title",
        },
        { data: "price" },
        { data: "type" },
        {
          data: "function",
          render: function (data) {
            return viewButtonGenerator(data, tempServiceList, openForm);
          },
        },
      ],
    });
  });
}

function getRowData(tempServiceList) {
  const data = [];
  for (let service of tempServiceList) {
    const rowData = {
      title: service.title,
      price: formatMoney(service.priceCents),
      type: service.type,
      function: service.id,
    };
    data.push(rowData);
  }
  return data;
}

async function openForm(id, tempServiceList) {
  const chosenService = tempServiceList.find((service) => service.id == id);
  const isEditing = chosenService != undefined;
  const service = isEditing
    ? { ...chosenService, availableAt: [...chosenService.availableAt] }
    : {
        id: crypto.randomUUID(),
        title: "",
        priceCents: 0,
        description: "",
        type: "",
        availableAt: [],
        imageURL: "",
      };

  await getInputTemplate(service, tempServiceList);

  isEditing ? modifyFormIfEditing(service) : modifyFormIfAdding();
}

function getBranchOptionList() {
  const tempBranchList = getBranchList();
  const optionList = [];
  for (let branch of tempBranchList) {
    const option = document.createElement("option");
    option.value = branch.id;
    option.textContent = branch.name;
    optionList.push(option);
  }
  return optionList;
}

async function getInputTemplate(service, tempServiceList) {
  const inputTemplate = await getTemplate(
    "service-template",
    "#input-service-template",
  );

  const templateClone = document.importNode(inputTemplate.content, true);

  templateClone.querySelector("input#title").value = service.title;
  templateClone.querySelector("select#type").value = service.type;
  templateClone.querySelector("input#priceCents").value = formatMoney(
    service.priceCents,
  );
  templateClone
    .querySelector("input#priceCents")
    .addEventListener("change", (e) => handlePriceChanged(e));
  templateClone.querySelector("input#desc").value = service.description;
  const branchOptionList = getBranchOptionList();
  const branchSelect = templateClone.querySelector("#availableAt");
  for (let option of branchOptionList) {
    branchSelect.appendChild(option);
  }
  branchSelect.addEventListener("change", () => {
    handleSelectedBranchChanged(service.availableAt, branchSelect.value);
  });

  templateClone
    .querySelector("#close-btn")
    .addEventListener("click", () => loadPage());

  templateClone.querySelector("#confirm-btn").addEventListener("click", (e) => {
    e.preventDefault();
    submitForm(service);
  });

  templateClone.querySelector("#cancel-btn").addEventListener("click", (e) => {
    e.preventDefault();
    openForm(service.id, tempServiceList);
  });

  const col2 = document.querySelector(".col-2");
  col2.innerHTML = "";
  if (col2) col2.appendChild(templateClone);
}

function modifyFormIfEditing(service) {
  document.querySelector("h2").textContent = service.title;
  document.querySelector("#edit-btn").style.display = "inline";
  document
    .querySelector("#edit-btn")
    .addEventListener("click", () => enableForm());
  document.querySelector("#delete-btn").style.display = "inlint";
  document.querySelector("#delete-btn").addEventListener("click", () => {
    showDeleteAlert(service.id, service.title);
  });
  displaySelectedBranches(service.availableAt);
}

function modifyFormIfAdding() {
  document.querySelector("h2").textContent = "Adding a new service";
  enableForm();
  const cancelBtn = document.querySelector("#cancel-btn");
  cancelBtn.textContent = "Reset";
}

function displaySelectedBranches(selectedBranchIds) {
  const tempBranchList = getBranchList();
  const optionContainer = document.querySelector("#selected-branches");
  optionContainer.innerHTML = "";
  if (selectedBranchIds.length > 0) {
    for (let branchId of selectedBranchIds) {
      const branch = tempBranchList.find((branch) => branchId == branch.id);
      let branchName = branch.name.slice(0, 7) + "...";
      const optionDiv = document.createElement("div");
      const optionSpan = document.createElement("span");
      optionDiv.id = branchId;
      optionDiv.className = "option";
      optionDiv.addEventListener("click", () => {
        handleSelectedBranchClicked(
          optionDiv.className.includes("enabled"),
          branchId,
          selectedBranchIds,
        );
      });
      optionSpan.className = "option-title";
      optionSpan.textContent = branchName;
      optionDiv.appendChild(optionSpan);
      optionContainer.appendChild(optionDiv);
    }
  }
}

//add chosen branches to option container/to chosen branch list when the branch select value is changed
function handleSelectedBranchChanged(selectedBranchIds, branchId) {
  if (
    selectedBranchIds.find((id) => id == branchId) === undefined &&
    branchId != ""
  ) {
    //add the chosen branch to the chosen branch list
    selectedBranchIds.push(branchId);
    //update the chosen options
    displaySelectedBranches(selectedBranchIds);
    enableMultipleSelect();
  }
}

//remove an option out of the chosen branches when it is clicked
function handleSelectedBranchClicked(enabled, branchId, selectedBranchIds) {
  if (enabled) {
    let index = selectedBranchIds.indexOf(branchId);
    selectedBranchIds.splice(index, 1);
    displaySelectedBranches(selectedBranchIds);
    enableMultipleSelect();
  }
}

function handlePriceChanged(e) {
  const input = e.target.value;
  if (checkIsPriceNumber(input)) {
    e.target.value = formatMoney(parsePriceCents(input));
  } else {
    e.target.value = "0.00";
  }
}

function enableForm() {
  enableFormEditing();
  enableInputs();
  enableLabels();
  enableSelects();
  enableMultipleSelect();
}

function submitForm(service) {
  const inputElems = document.querySelectorAll(".form-input");
  const typeSelectElem = document.querySelector("select#type");
  const serviceClone = { ...service };
  for (let inputElem of inputElems) {
    serviceClone[inputElem.name] = inputElem.value;
  }
  serviceClone.type = typeSelectElem.value;

  addEditService(serviceClone);
}
