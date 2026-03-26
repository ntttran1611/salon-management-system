import { StaffList } from "../../data/staff-list.js";
import { showNoticeAlert } from "../components/dialog.js";
import { checkIsNullorEmptyString } from "../utils/data-validation.js";

export function getStaffList() {
  return StaffList;
}

export function getStaffStatus(status) {
  return status ? "active" : "inactive";
}

export function checkInputs(staff) {
  if (checkIsNullorEmptyString(staff.firstName)) {
    showNoticeAlert("Staff first name required.", "failed");
    return false;
  } else if (checkIsNullorEmptyString(staff.lastName)) {
    showNoticeAlert("Staff last name required.", "failed");
    return false;
  }
  return true;
}

export function addEditStaff(staff) {
  if (checkInputs(staff)) {
    /*showNoticeAlert(
    `The item named ${staff.getFirstName()} ${staff.getLastName()} has been added/edited.`,
    "successful",
  );*/
    console.log(staff);
  }
}
