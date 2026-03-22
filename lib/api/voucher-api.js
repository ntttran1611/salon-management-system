import { Vouchers } from "../../data/voucher-list.js";
import { getStringFormat } from "../functions/shared.js";
import { showNoticeAlert } from "../components/dialog.js";

//assume this is a piece to get the voucher list from the db
export function getVoucherList() {
  return Vouchers;
}

export function getCode() {
  let code = "";
  const alphanumericArray = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];

  for (let i = 0; i < 10; i++) {
    let randomInt =
      Math.floor(
        Math.random() * (alphanumericArray.length /*max*/ - 0 /*min*/ + 1),
      ) + 0;
    code += alphanumericArray[randomInt];
  }

  return code;
}

export function getStatus(voucher) {
  if (voucher.used) {
    //voucher is used
    if (new Date() > new Date(voucher.expiryDate)) {
      //voucher is used and expired
      return "permaInactive";
    }
    return "inactive";
  } else {
    if (new Date() > new Date(voucher.expiryDate)) {
      //voucher is not used but expired
      return "warning";
    } else {
      return "active"; //voucher has been unused (valid)
    }
  }
}

export function getVcRemainingAmount(voucher, billTotal) {
  return voucher.price <= billTotal
    ? 0
    : parseFloat((voucher.price - billTotal).toFixed(2));
}

//check validity of inputs
export function checkInputs(voucher) {
  const numberRegex = /^(04)\d{8}$/;
  const dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/; //YYYY-MM-DD or YYYY-M-D
  if (voucher.buyer == "") {
    showNoticeAlert("Name of the buyer required", "failed");
    return false;
  } else if (voucher.price == "" || !getStringFormat(voucher.price)) {
    showNoticeAlert(
      "Amount required. Please ensure it is in correct format (e.g. 16.00, 16.0 or 16)",
      "failed",
    );
    return false;
  } else if (voucher.issueDate == "" || voucher.expiryDate == "") {
    showNoticeAlert("Issue date and expiry date required", "failed");
    return false;
  } else if (new Date(voucher.issueDate) > new Date(voucher.expiryDate)) {
    showNoticeAlert("The expiry date must be after the issue date", "failed");
    return false;
  } else if (voucher.mobile == "" || !numberRegex.test(voucher.mobile)) {
    showNoticeAlert(
      "Customer mobile number required. Please make sure it is in correct format (e.g. 04xxyyyzzz)",
      "failed",
    );
    return false;
  } else if (
    !dateRegex.test(
      voucher.issueDate ||
        !dateRegex.test(voucher.expiryDate) ||
        new Date(voucher.issueDate) == "Invalid Date" ||
        new Date(voucher.expiryDate) == "Invalid Date",
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
export function addEditVoucher(voucher) {
  showNoticeAlert(
    `The item named ${voucher.code} has been added/edited.`,
    "successful",
  );

  console.log(voucher);
}

//delete a voucher
export function deleteVoucher(voucher) {}
