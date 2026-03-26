import { serviceList } from "../../data/service-list.js";

export function getServiceList() {
  return serviceList;
}

//API
//input validations
export function checkInputs(title, price) {
  if (title == "") {
    showNoticeAlert(`Title required. Please provide a service title`, "failed");
    return false;
  } else if (price == "") {
    showNoticeAlert(
      `Price required. Please set a price for this service to continue`,
      "failed",
    );
    return false;
  }
  return true;
}

//add/edit a branch (API connection)
export function addEditService(service) {
  if (checkInputs(service)) {
    showNoticeAlert(
      `The service named <b>${service.title}</b> has been added/edited`,
      "successful",
    );
    console.log(service);
  }
}
