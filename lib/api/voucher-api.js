import { Vouchers } from "../../data/voucher-list.js";
import { showNoticeAlert } from "../components/dialog.js";
import {
  checkDollarStringFormat,
  formatMoney,
  parsePriceCents,
} from "../utils/currency.js";
import {
  checkIsMobileNumber,
  checkIsNullorEmptyString,
  checkIsPriceNumber,
} from "../utils/data-validation.js";

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
  if (voucher.remainingValueCents == 0 && voucher.originalValueCents != 0) {
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
  if (checkIsNullorEmptyString(voucher.buyer)) {
    showNoticeAlert("Name of the buyer required", "failed");
    return false;
  } else if (parseInt(voucher.originalValueCents * 100) == 0) {
    showNoticeAlert("Amount required", "failed");
    return false;
  } else if (
    checkIsNullorEmptyString(voucher.mobile) ||
    !checkIsMobileNumber(voucher.mobile)
  ) {
    showNoticeAlert(
      "Customer mobile number required. Please make sure it is in correct format (e.g. 04xxyyyzzz)",
      "failed",
    );
    return false;
  }
  return true;
}

//add/edit a voucher
export function addEditVoucher(voucher) {
  if (checkInputs(voucher)) {
    voucher.originalValueCents = parsePriceCents(voucher.originalValueCents);
    voucher.remainingValueCents = parsePriceCents(voucher.remainingValueCents);
    /*showNoticeAlert(
    `The item named ${voucher.code} has been added/edited.`,
    "successful",
  );*/

    console.log(voucher);
  }
}

//delete a voucher
export function deleteVoucher(voucher) {}
