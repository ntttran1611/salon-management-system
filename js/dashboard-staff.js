import {
  addEditStaff,
  checkInputs,
  getStaffList,
  getStaffStatus,
} from "../lib/api/staff-api.js";
import {
  enableFormEditing,
  enableInputs,
  enableLabels,
  enableToggle,
} from "../lib/functions/shared.js";
import { showDeleteAlert } from "../lib/components/dialog.js";
import {
  animateTwoColLayout,
  buildTwoColLayout,
  getTemplate,
  tableHeaderGenerator,
  viewButtonGenerator,
} from "../lib/utils/layout-handler.js";

document.querySelector("#staff").addEventListener("click", loadPage);
async function loadPage() {
  if (document.querySelector("#staff").className.includes("active")) {
    const tempStaffList = getStaffList();
    await buildTwoColLayout(tempStaffList, openForm);
    buildStaffTable(tempStaffList);
    animateTwoColLayout();
  }
}

function buildStaffTable(tempStaffList) {
  const staffTableHeaders = ["Status", "Full name", "View"];
  const tableHeaderNames = tableHeaderGenerator(staffTableHeaders);

  const tableHeaderElem = document.querySelector("thead");
  tableHeaderElem.appendChild(tableHeaderNames);

  const data = getRowData(tempStaffList);
  $(document).ready(function () {
    $("#myTable").DataTable({
      data: data,
      columns: [
        {
          data: "active",
          render: function (data) {
            return `<i class="fa-solid fa-circle status ${getStaffStatus(data)}"></i>`;
          },
        },
        { data: "fullName" },
        {
          data: "function",
          render: function (data) {
            return viewButtonGenerator(data, tempStaffList, openForm);
          },
        },
      ],
    });
  });
}

function getRowData(tempStaffList) {
  const data = [];

  for (let staffMember of tempStaffList) {
    const rowData = {
      fullName: `${staffMember.firstName} ${staffMember.lastName}`,
      active: staffMember.active,
      function: staffMember.id,
    };

    data.push(rowData);
  }
  return data;
}

async function openForm(id, tempStaffList) {
  const chosenStaff = tempStaffList.find((staff) => staff.id == id);
  const isEditing = chosenStaff != undefined;
  let staff = isEditing
    ? { ...chosenStaff }
    : {
        id: crypto.randomUUID(),
        firstName: "",
        lastName: "",
        note: "",
        active: true,
      };

  await getInputTemplate(staff, tempStaffList);

  isEditing ? modifyFormIfEditing(staff) : modifyFormIfAdding();

  setStaffStatus(staff);
}

async function getInputTemplate(staff, tempStaffList) {
  const inputTemplate = await getTemplate(
    "staff-templates",
    "#staff-input-template",
  );

  const templateClone = document.importNode(inputTemplate.content, true);
  templateClone.querySelector("h2").textContent =
    `${staff.firstName} ${staff.lastName}`;
  templateClone.querySelector("input#firstName").value = staff.firstName;
  templateClone.querySelector("input#lastName").value = staff.lastName;
  templateClone.querySelector("input#note").value = staff.note;
  templateClone.querySelector("#cancel-btn").addEventListener("click", (e) => {
    e.preventDefault();
    openForm(staff.id, tempStaffList);
  });

  templateClone.querySelector("#confirm-btn").addEventListener("click", (e) => {
    e.preventDefault();
    submitForm(staff);
  });

  templateClone
    .querySelector("#close-btn")
    .addEventListener("click", () => loadPage());

  templateClone
    .querySelector("#status")
    .addEventListener("click", (e) => handledToggleValueChanged(e, staff));

  const col2 = document.querySelector(".col-2");
  col2.innerHTML = "";
  if (col2) col2.appendChild(templateClone);
}

function modifyFormIfEditing(staff) {
  document.querySelector("#delete-btn").style.display = "inline";
  document.querySelector("#delete-btn").addEventListener("click", () => {
    showDeleteAlert(staff.id, `${staff.firstName} ${staff.lastName}`);
  });

  document.querySelector("#edit-btn").style.display = "inline";
  document.querySelector("#edit-btn").addEventListener("click", () => {
    enableForm();
  });
}

function modifyFormIfAdding() {
  document.querySelector("h2").textContent = "Adding a new staff member";
  enableForm();
  const cancelBtn = document.querySelector("#cancel-btn");
  cancelBtn.textContent = "Reset";
}

function submitForm(staff) {
  const inputElems = document.querySelectorAll(".form-input");
  const staffClone = { ...staff };
  for (let inputElem of inputElems) {
    staffClone[inputElem.name] = inputElem.value;
  }
  if (checkInputs(staffClone)) addEditStaff(staffClone);
}

//add staff status to the form
function setStaffStatus(staff) {
  const toggle = document.querySelector(".toggle");
  for (let i = 0; i < toggle.children.length; i++) {
    toggle.children[i].className = "toggle-btn";
  }
  document.querySelector(`#toggle-${getStaffStatus(staff.active)}`).className +=
    " active";
}

//handle toggle's value changed
function handledToggleValueChanged(evt, staff) {
  const toggle = document.querySelector(".toggle");
  if (toggle.className.includes("enabled")) {
    if (evt.target.id == "toggle-active") {
      staff.active = true;
    } else if (evt.target.id == "toggle-inactive") {
      staff.active = false;
    }
    setStaffStatus(staff);
  }
}

//enable form
function enableForm() {
  enableFormEditing();
  enableInputs();
  enableLabels();
  enableToggle();
}
