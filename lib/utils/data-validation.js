const numberRegex = /^-?\d+$/;
const priceNumberRegex = /^[-+]?([0-9]*\.)?[0-9]+([eE][-+]?[0-9]+)?$/;
const mobileNumberRegex = /^(04)\d{8}$/;
const dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/; //YYYY-MM-DD or YYYY-M-D

export function checkIsPriceNumber(input) {
  return priceNumberRegex.test(input) && parseFloat(input) >= 0;
}

export function checkIsMobileNumber(input) {
  return mobileNumberRegex.test(input);
}

export function checkIsDateString(input) {
  return dateRegex.test(input);
}

export function checkIsNullorEmptyString(input) {
  return input === "" || input === " " || input === null || input === undefined;
}
