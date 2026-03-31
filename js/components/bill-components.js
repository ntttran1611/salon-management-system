import { getServiceList } from "../../lib/api/service-api.js";
import { getStaffList } from "../../lib/api/staff-api.js";

export function generateServiceDeleteButton(data, isBillPaid, eventHandler) {
  const button = document.createElement("button");
  button.className = `round-btn delete-table-btn ${isBillPaid ? "bill-paid" : ""}`;
  button.innerHTML = ` <i class="fa-solid fa-trash fa-xs"></i> 
                    <span class="tooltiptext">Delete</span>`;

  button.disabled = isBillPaid;
  button.id = `table-delete-btn-${data}`;

  button.addEventListener("click", (e) => eventHandler(e));
  return button;
}

export function generateServiceOptionsForBillTable(
  data,
  isBillPaid,
  eventHandler,
) {
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
  select.dataset.billServiceId = data.id;
  select.disabled = isBillPaid;
  select.value = data.value;
  select.addEventListener("change", (e) => eventHandler(e));
  return select;
}

export function generateStaffOptionsForBillTable(
  data,
  isBillPaid,
  eventHandler,
) {
  const select = document.createElement("select");
  select.id = `staff-${data.id}`;
  select.className = "table-select staff";

  const tempStaffList = getStaffList();
  for (let staff of tempStaffList) {
    const option = document.createElement("option");
    option.value = staff.id;
    option.textContent = `${staff.firstName} ${staff.lastName}`;
    select.appendChild(option);
  }
  select.dataset.billServiceId = data.id;
  select.disabled = isBillPaid;
  select.value = data.value;
  select.addEventListener("change", (e) => eventHandler(e));
  return select;
}

export function generateTableInput(data, isBillPaid, inputCate, eventHandler) {
  const input = document.createElement("input");
  input.disabled = isBillPaid;
  input.className = `table-input ${inputCate}`;
  input.type = "text";
  input.name = `bill-${inputCate}`;
  input.id = `${inputCate}-${data.id}`;
  input.value = data.value;
  input.dataset.billServiceId = data.id;
  input.addEventListener("change", (e) => eventHandler(e));

  return input;
}
