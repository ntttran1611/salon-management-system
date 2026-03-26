import { serviceList } from "../../data/service-list.js";
import { showNoticeAlert } from "../components/dialog.js";
import { parsePriceCents } from "../utils/currency.js";
import { checkIsNullorEmptyString } from "../utils/data-validation.js";

export function getServiceList() {
  return serviceList;
}

//API
//input validations
export function checkInputs(service) {
  if (checkIsNullorEmptyString(service.title)) {
    showNoticeAlert(`Title required. Please provide a service title`, "failed");
    return false;
  } else if (checkIsNullorEmptyString(service.priceCents)) {
    showNoticeAlert(
      `Price required. Please set a price for this service to continue`,
      "failed",
    );
    return false;
  } else if (checkIsNullorEmptyString(service.type)) {
    showNoticeAlert(
      `Type required. Please set a type for this service to continue`,
      "failed",
    );
    return false;
  }
  return true;
}

//add/edit a branch (API connection)
export function addEditService(service) {
  if (checkInputs(service)) {
    service.priceCents = parsePriceCents(service.priceCents);
    showNoticeAlert(
      `The service named <b>${service.title}</b> has been added/edited`,
      "successful",
    );
    console.log(service);
  }
}
