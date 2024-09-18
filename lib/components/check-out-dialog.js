const dialog = document.querySelector('dialog');
const header = document.querySelector('#modal-header');
const content = document.querySelector('#modal-content');
const footer = document.querySelector('#modal-footer');

import {Vouchers} from "../../data/voucher-list.js";
import {Voucher} from "../objects/voucher.js";
import { formatDate, getStringFormat } from "../functions/shared.js";
import { closeDialog } from "./dialog.js";

export function showCheckOutBoard(billObj, services){
    let subTotalOfBill = billObj.getTotal(services);
    const vouchers = Vouchers;
    //get the used voucher for this bill and calculate the final total after the voucher is used
    let voucherObj = new Voucher (vouchers.find((voucher) => voucher.code.toLowerCase() == billObj.getVoucherCode().toLowerCase()));
    let voucherPrice = voucherObj.getPrice();
    let finalTotal = voucherObj.getCode() == "" ? subTotalOfBill : voucherPrice <= subTotalOfBill ? subTotalOfBill - voucherPrice : 0;
    let floatFinalTotal = parseFloat(finalTotal.toFixed(2)); //ensure all substractions by this final amount will exactly contain 2 decimals
    //load the check-out board
    header.innerHTML = "Check out information:";
    content.innerHTML = getCheckOutContent(billObj, services, voucherObj, floatFinalTotal);
    footer.innerHTML = `
        <button id="modal-confirm-btn" class="square-btn confirm-btn">Confirm</button>
        <button id="modal-cancel-btn" class="square-btn cancel-btn">Cancel</button>
    `;
    //get all initial inputs, the chosen payment method, and interactable elements ready
    setChosenPayment(billObj);
    setPaymentAmountToObj(billObj, floatFinalTotal);
    setPaymentAmountToInput(billObj, floatFinalTotal);
    document.querySelector('#voucher').onchange = (e) => {handleVoucherInputChanged(e, billObj, vouchers, services)};
    document.querySelector('#voucher-delete').onclick = () => removeVoucher(billObj, subTotalOfBill);
    document.querySelector('.toggle').onclick = (e) => handledToggleValueChanged(e, billObj, floatFinalTotal);
    document.querySelector('#card').onchange = (e) => handleSplitAmountChanged(e, billObj, floatFinalTotal);
    document.querySelector('#cash').onchange = (e) => handleSplitAmountChanged(e, billObj, floatFinalTotal);
    document.querySelector('#modal-cancel-btn').onclick = () => closeDialog();
    document.querySelector('#modal-confirm-btn').onclick = () => {
        closeDialog();
        billObj.checkOut();
        updateUsedVoucher(billObj, voucherObj, vouchers);
    }
    dialog.className = 'modal';
    header.className = 'check-out';
    dialog.showModal();
}

function updateUsedVoucher(billObj, voucherObj, vouchers){
    if(billObj.getVoucherCode() != ''){ //update the used voucher
        const today = formatDate(new Date());
        voucherObj = new Voucher(vouchers.find((voucher) => voucher.code.toLowerCase() == billObj.getVoucherCode().toLowerCase()));
        if(voucherObj.getRemaining(subTotalOfBill) > 0){
            voucherObj.setPrice(voucherObj.getRemaining(subTotalOfBill));
        } else {
            voucherObj.setPrice(0);
            voucherObj.setStatus(true);
        }
        voucherObj.setNote(`Used ${subTotalOfBill} on ${today}`);
    }
}

function getCheckOutContent(billObj, services, voucher, finalTotal){
    let voucherUsed = voucher.getPrice() != "" ? (voucher.getPrice() <= billObj.getTotal(services) ? voucher.getPrice() : billObj.getTotal(services)) : 0;
    return `
        <span>Bill ${billObj.getId()} | ${billObj.getCusName()} | ${billObj.getMobile()}</span>
        <hr>
        <div class="vertical-list check-out">
            ${billObj.getBillServices().map((item) => {
                const service = services.find((service) => item.serviceId == service.id);
                return `
                    <div class="list-item" style="justify-content: space-between; margin-bottom: 1px">
                        <span style="color: #BBA366">${service.title}</span>
                        <span>${getStringFormat(service.price)}</span>
                    </div>
                `
            }).join('')}
        </div>
        <hr>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Sub total:</b></span>
                <span>${getStringFormat(parseFloat(billObj.getTotal(services)))}</span>
            </div>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Voucher:</b> <i class="fa-solid fa-trash" id="voucher-delete"></i> </span>
                <input style="width: 60%; text-align: end" class="table-input voucher" type="text" name="voucher" id="voucher" value='${voucher.getCode()}' placeholder="Provide a code">
            </div>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Discount:</b></span>
                <span style="color: #C97C82" id="all-discount">-${getStringFormat(parseFloat(billObj.getAllDiscount() + voucherUsed))}</span>
            </div>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Total:</b></span>
                <span id="final-total">${getStringFormat(finalTotal)}</span>
            </div>
        <hr>
        <span>Please choose a payment method:</span>
        <div class="toggle" name="payment-method">
            <div class="toggle-btn" id="toggle-card"><i class="fa-solid fa-credit-card" ></i> Card</div>
            <div class="toggle-btn" id="toggle-cash"><i class="fa-solid fa-money-bill fa-lg"></i> Cash</div>
            <div class="toggle-btn" id="toggle-split"><i class="fa-solid fa-arrows-split-up-and-left"></i> Split</div>
        </div>
        <div class='split-amounts' style="display: flex; justify-content: space-evenly">
            <div style="position: relative; width: 48%;">
                <i class="fa-solid fa-credit-card fa-lg" style="position: absolute; right: 5px; top: 28px"></i>
                <input style="width: 100%; color: black" class="form-input" type="text" name="card" id="card" value='0.00' placeholder="Amount on Card">
            </div>
            <div style="position: relative; width: 48%;">
                <i class="fa-solid fa-money-bill fa-lg" style="position: absolute; right: 5px; top: 28px"></i>
                <input style="width: 100%; color: black" class="form-input" type="text" name="cash" id="cash" value='0.00' placeholder="Amount on Cash">
            </div>
        </div>
        <span id="error" style="color: #C97C82; font-size: 14px"></span>
        
    `;
}

function handleVoucherInputChanged(e, billObj, vouchers, services){
    let subTotal = billObj.getTotal(services);
    if(e.target.value != ""){
        const voucherObj = new Voucher(vouchers.find((voucher) => voucher.code.toLowerCase() == e.target.value.toLowerCase()));
        let voucherPrice = voucherObj.getPrice();
        if(voucherObj.getCode() != "" && voucherObj.getStatus() == 'active'){
            let voucherUsed = voucherPrice <= subTotal ? voucherPrice : subTotal;
            let finalTotal = voucherPrice <= subTotal ? subTotal - voucherPrice : 0;
            
            billObj.setVoucherCode(voucherObj.getCode());
            if(billObj.getPayment().type == 'split') billObj.setPaymentType('card');
            setChosenPayment(billObj);
            setPaymentAmountToObj(billObj, parseFloat(finalTotal.toFixed(2)));
            setPaymentAmountToInput(billObj);

            document.querySelector('#all-discount').textContent = `-${getStringFormat((billObj.getAllDiscount() + voucherUsed).toFixed(2))}`;
            document.querySelector('#final-total').textContent = getStringFormat(finalTotal.toFixed(2));
            document.querySelector('.toggle').onclick = (e) => handledToggleValueChanged(e, billObj, parseFloat(finalTotal.toFixed(2)));
            document.querySelector('#error').innerHTML = '';
        } else {
            removeVoucher(billObj, subTotal);
            document.querySelector('#error').innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Unavailable voucher code';
        }
    } else {
        removeVoucher(billObj, subTotal);
    }
}

function removeVoucher(billObj, subTotal){
    setPaymentAmountToObj(billObj, subTotal);
    setPaymentAmountToInput(billObj, subTotal);
    billObj.setVoucherCode("");
    document.querySelector('#all-discount').textContent = `-${getStringFormat(billObj.getAllDiscount())}`;
    document.querySelector('#final-total').textContent = getStringFormat(subTotal);
    document.querySelector('.toggle').onclick = (e) => handledToggleValueChanged(e, billObj, subTotal);
    document.querySelector('#voucher').value = '';
    document.querySelector('#error').innerHTML = '';
}

function handledToggleValueChanged(e, billObj, finalTotal){
    switch (e.target.id){
        case 'toggle-card': 
            billObj.setPaymentType('card');
        break;
        case 'toggle-cash': 
            billObj.setPaymentType('cash');
        break;
        case 'toggle-split': 
            billObj.setPaymentType('split'); 
        break;
        default: "";                    
    }
    setChosenPayment(billObj);
    setPaymentAmountToObj(billObj, finalTotal);
    setPaymentAmountToInput(billObj, finalTotal);
}

function handleSplitAmountChanged(e, billObj){
    let finalTotal = parseFloat(document.querySelector('#final-total').textContent);
    if(e.target.value != ""){
        if(getStringFormat(e.target.value) != false && parseFloat(e.target.value) >= 0 && parseFloat(e.target.value) <= finalTotal){
            if(e.target.id == 'card'){
                document.querySelector('#cash').value = getStringFormat((finalTotal - parseFloat(e.target.value)).toFixed(2));
            } else if (e.target.id == 'cash'){
                document.querySelector('#card').value = getStringFormat((finalTotal - parseFloat(e.target.value)).toFixed(2));
            }
            setPaymentAmountToObj(billObj, finalTotal);
            e.target.value = getStringFormat(e.target.value);
            document.querySelector('#error').innerHTML = '';
        } else {
            e.target.value = getStringFormat(finalTotal);
            if(e.target.id == 'card'){
                document.querySelector('#cash').value = '0.00';
            } else if (e.target.id == 'cash'){
                document.querySelector('#card').value = '0.00';
            }
            document.querySelector('#error').innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Invalid input. Please make sure it is in the correct format, larger than 0 and less than the total';
        }
    } else {
        document.querySelector('#error').innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please make sure both amounts provided';
    }
}

function setChosenPayment(billObj){
    const toggle = document.querySelector('.toggle');
    for(let children of toggle.children){
        children.className = "toggle-btn";
    }
    document.querySelector(`#toggle-${billObj.getPayment().type}`).className += ' payment-chosen';
}

function setPaymentAmountToObj(billObj, finalTotal){
    if(billObj.getPayment().type == 'split'){
        if(document.querySelector('#card').value == "0.00") billObj.setPaymentAmount(finalTotal, billObj.getPayment().cardAmount);
        else billObj.setPaymentAmount(finalTotal, document.querySelector('#card').value);
    } else {
        billObj.setPaymentAmount(finalTotal, 0);
    }
}

function setPaymentAmountToInput(billObj){
    if(billObj.getPayment().type != 'split'){
        if(billObj.getPayment().type == "card"){
            document.querySelector('#card').value = getStringFormat(billObj.getPayment().cardAmount);
            document.querySelector('#cash').value = "0.00";
        } else {
            document.querySelector('#cash').value = getStringFormat(billObj.getPayment().cashAmount);
            document.querySelector('#card').value = "0.00";
        }
        document.querySelector('#card').disabled = 'disabled';
        document.querySelector('#cash').disabled = 'disabled';
    } else {
        document.querySelector('#card').value = getStringFormat(billObj.getPayment().cardAmount);
        document.querySelector('#cash').value = getStringFormat(billObj.getPayment().cashAmount);
        document.querySelector('#card').removeAttribute('disabled');
        document.querySelector('#cash').removeAttribute('disabled');
    }
}