export function formatMoney(moneyStringCents) {
  return (moneyStringCents / 100).toFixed(2);
}

export function formatAUCurrency(moneyString) {
  return `$${moneyString}`;
}

export function checkDollarStringFormat(number) {
  const numberRegex = /^-?\d+$/;
  const floatWith1DecimalsRegex = /^-?\d+\.\d{1}$/;
  const floatWith2DecimalsRegex = /^-?\d+\.\d{2}$/;
  if (numberRegex.test(number)) {
    return `${number}.00`;
  } else if (floatWith1DecimalsRegex.test(number)) {
    return `${number}0`;
  } else if (floatWith2DecimalsRegex.test(number)) {
    return `${number}`;
  } else {
    return false;
  }
}

export function parsePriceCents(textMoneyFloat) {
  return parseFloat(textMoneyFloat * 100);
}
