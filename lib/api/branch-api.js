import { Branches } from "../../data/branch-list.js";
import { checkIsNullorEmptyString } from "../utils/data-validation.js";
import { showNoticeAlert } from "../components/dialog.js";

export function getBranchList() {
  return Branches;
}

//input validations
export function checkInputs(branch) {
  if (checkIsNullorEmptyString(branch.name)) {
    showNoticeAlert(`Branch name required`, "failed");
    return false;
  } else if (checkIsNullorEmptyString(branch.address)) {
    showNoticeAlert(`Branch address required`, "failed");
    return false;
  }
  return true;
}

//add/edit a branch (API connection)
export function addEditBranch(branch) {
  if (checkInputs(branch)) {
    showNoticeAlert(
      `The branch named <b>${branch.name}</b> has been added/edited`,
      "successful",
    );
    console.log(branch);
  }
}
