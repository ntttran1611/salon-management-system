import { Bills } from "../../data/bill-list.js";
import { getServiceList } from "./service-api.js";
import { formatMoney, parsePriceCents } from "../utils/currency.js";
import { showDeleteAlert } from "../components/dialog.js";

//this must be filter by branch
export function getBillList(branchId) {
  return Bills.filter((bill) => bill.branchId === branchId);
}

export function cloneBill(originalBill) {
  const bill = structuredClone(originalBill);
  return bill;
}

export function getBillTableData(bill) {
  const data = [];
  const tempServiceList = getServiceList();
  for (let billService of bill.services) {
    const serviceData = tempServiceList.find(
      (service) => service.id == billService.serviceId,
    );
    const rowData = {
      serviceTitle: { id: billService.id, value: billService.serviceId },
      servicePrice: {
        id: billService.id,
        value: formatMoney(serviceData.priceCents),
      },
      serviceStaff: { id: billService.id, value: billService.staffId },
      serviceDiscount: {
        id: billService.id,
        value: formatMoney(billService.discountCents),
      },
      serviceTotal: {
        id: billService.id,
        value: formatMoney(serviceData.priceCents - billService.discountCents),
      },
      serviceNote: { id: billService.id, value: billService.note },
      serviceFunc: billService.id,
    };

    data.push(rowData);
  }

  return data;
}

export function getBillTotalCents(bill) {
  const tempServiceList = getServiceList();
  let totalCents = 0;

  for (let billService of bill.services) {
    const service = tempServiceList.find(
      (service) => service.id === billService.serviceId,
    );

    const finalServicePriceCents =
      service.priceCents - billService.discountCents;
    totalCents += finalServicePriceCents;
  }

  return totalCents;
}

export function updateService(serviceId, billServiceId, bill) {
  bill.services[billServiceId].serviceId = serviceId;
}

export function updateStaff(staffId, billServiceId, bill) {
  bill.services[billServiceId].staffId = staffId;
}

export function updateDiscount(discountInput, billServiceId, bill) {
  bill.services[billServiceId].discountCents = parsePriceCents(discountInput);
}

export function updateNote(noteInput, billServiceId, bill) {
  bill.services[billServiceId].note = noteInput;
}

export function deleteBillServiceTemp(billServiceId, bill) {
  bill.services.splice(billServiceId, 1);
}

export function deleteBill(bill) {
  showDeleteAlert(bill.id, `${bill.cusName} - ${bill.mobile}`);
}

export class Bill {
  #id;
  #cusName;
  #services;
  #mobile;
  #entranceDate;
  #entranceTime;
  #branchId;
  #voucherCode;
  #payment;
  #paid;

  constructor(billObject) {
    this.#id = billObject != undefined ? billObject.id : "";
    this.#cusName = billObject != undefined ? billObject.cusName : "";
    this.#services = billObject != undefined ? [...billObject.services] : "";
    this.#mobile = billObject != undefined ? billObject.mobile : "";
    this.#entranceDate = billObject != undefined ? billObject.entranceDate : "";
    this.#entranceTime = billObject != undefined ? billObject.entranceTime : "";
    this.#branchId = billObject != undefined ? billObject.branchId : "";
    this.#voucherCode = billObject != undefined ? billObject.voucherCode : "";
    this.#payment = billObject != undefined ? { ...billObject.payment } : "";
    this.#paid = billObject != undefined ? billObject.paid : "";
  }

  static getBillArray(billListJs) {
    const billArr = [];
    for (let billJs of billListJs) {
      const bill = new Bill(billJs);
      billArr.push(bill);
    }
    return billArr;
  }

  display() {
    console.log(this);
  }

  setServiceId(serviceIndex, serviceId) {
    const modifiedService = this.#services[serviceIndex];
    modifiedService != undefined ? (modifiedService.serviceId = serviceId) : "";
  }

  setServiceStaff(serviceIndex, staffId) {
    const modifiedService = this.#services[serviceIndex];
    modifiedService != undefined ? (modifiedService.staffId = staffId) : "";
  }

  setServiceDiscount(serviceIndex, discount) {
    const modifiedService = this.#services[serviceIndex];
    modifiedService != undefined ? (modifiedService.discount = discount) : "";
  }

  setServiceNote(serviceIndex, note) {
    const modifiedService = this.#services[serviceIndex];
    modifiedService != undefined ? (modifiedService.note = note) : "";
  }

  setVoucherCode(voucherCode) {
    this.#voucherCode = voucherCode;
  }

  setPaymentType(paymentType) {
    this.#payment.type = paymentType;
  }

  setPaymentAmount(finalTotal, splitCardAmount) {
    switch (this.#payment.type) {
      case "card":
        this.#payment.cardAmount = parseFloat(finalTotal);
        this.#payment.cashAmount = 0;
        break;
      case "cash":
        this.#payment.cashAmount = parseFloat(finalTotal);
        this.#payment.cardAmount = 0;
        break;
      case "split":
        this.#payment.cardAmount = parseFloat(splitCardAmount);
        this.#payment.cashAmount = parseFloat(
          (finalTotal - splitCardAmount).toFixed(2),
        );
        break;
      default:
        "";
    }
  }

  checkOut() {
    this.#paid = true;
  }

  uncheck() {
    this.#paid = false;
  }

  getServicesCount() {
    return this.#services.length;
  }

  getTotal(serviceList) {
    let total = 0;
    this.#services.forEach((service) => {
      const result = serviceList.find((item) => item.id == service.serviceId);
      let finalPrice = result.price - service.discount;
      total += finalPrice;
    });
    return total;
  }

  getAllDiscount() {
    let totalDiscount = 0;
    this.#services.forEach((service) => {
      totalDiscount += service.discount;
    });
    return totalDiscount;
  }

  getBillServices() {
    return this.#services;
  }

  getId() {
    return this.#id;
  }

  getCusName() {
    return this.#cusName;
  }

  getMobile() {
    return this.#mobile;
  }

  getStatus() {
    return this.#paid;
  }

  getEntranceDate() {
    return this.#entranceDate;
  }

  getEntranceTime() {
    return this.#entranceTime;
  }

  getVoucherCode() {
    return this.#voucherCode;
  }

  getPayment() {
    return this.#payment;
  }

  deleteService(index) {
    this.#services.splice(index, 1);
  }

  addService(serviceId, staffId, discount, note) {
    const newService = {
      id: 99,
      discount: discount,
      serviceId: serviceId,
      staffId: staffId,
      note: note,
    };

    this.#services.push(newService);
  }
}
