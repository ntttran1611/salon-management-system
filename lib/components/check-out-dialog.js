const dialog = document.querySelector('dialog');
const header = document.querySelector('#modal-header');
const content = document.querySelector('#modal-content');
const footer = document.querySelector('#modal-footer');

import { getNumberFromAmountString, getStringFormat } from "../functions/shared.js";
import { closeDialog } from "./dialog.js";

export function showCheckOutBoard(billObj, services, vouchers){
    let voucher = vouchers.find((voucher) => voucher.code.toLowerCase() == billObj.getVoucherCode().toLowerCase());
    let voucherUsed = voucher != undefined ? (voucher.price <= billObj.getTotal(services) ? voucher.price : billObj.getTotal(services)) : 0;
    let finalTotal = voucher == undefined ? billObj.getTotal(services) : voucher.price <= billObj.getTotal(services) ? billObj.getTotal(services) - voucher.price : 0;
    //set dialog content
    header.innerHTML = "Check out information:";
    content.innerHTML = `
        <span>Bill ${billObj.getId()} | ${billObj.getCusName()} | ${billObj.getMobile()}</span>
        <hr>
        <div class="vertical-list check-out">
            ${billObj.getBillServices().map((item) => {
                const service = services.find((service) => item.serviceId == service.id);
                return `
                    <div class="list-item" style="justify-content: space-between; margin-bottom: 1px">
                        <span style="color: #BBA366">${service.title}</span>
                        <span>$${service.price}.00</span>
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
                <span><b>Voucher:</b></span>
                <input style="width: 60%; text-align: end" class="table-input voucher" type="text" name="voucher" id="voucher" value='${voucher == undefined ? '' : voucher.code}' placeholder="No code entered">
            </div>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Discount:</b></span>
                <span style="color: #C97C82" id="all-discount">-${getStringFormat(parseFloat(billObj.getAllDiscount() + voucherUsed))}</span>
            </div>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Total:</b></span>
                <span id="final-total">${getStringFormat(parseFloat(finalTotal).toFixed(2))}</span>
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
                <input style="width: 100%; color: black" class="form-input" type="text" name="card" id="card" value='$.00' placeholder="Amount on Card">
            </div>
            <div style="position: relative; width: 48%;">
                <i class="fa-solid fa-money-bill fa-lg" style="position: absolute; right: 5px; top: 28px"></i>
                <input style="width: 100%; color: black" class="form-input" type="text" name="cash" id="cash" value='$.00' placeholder="Amount on Cash">
            </div>
        </div>
        <span id="error" style="color: #C97C82; font-size: 14px"></span>
        
    `;

    footer.innerHTML = `
        <button id="modal-confirm-btn" class="square-btn confirm-btn">Confirm</button>
        <button id="modal-cancel-btn" class="square-btn cancel-btn">Cancel</button>
    `;
    let floatFinalTotal = parseFloat(finalTotal).toFixed(2);
    setChosenPayment(billObj);
    setPaymentAmountToInput(billObj, floatFinalTotal);
    setPaymentAmountToObj(billObj, floatFinalTotal);

    //add function to buttons
    document.querySelector('#modal-cancel-btn').onclick = () => closeDialog();
    document.querySelector('#modal-confirm-btn').onclick = () => {
        closeDialog();
        console.log(billObj);   
        billObj.checkOut();
    }
    document.querySelector('#voucher').onchange = (e) => {handleVoucherInputChanged(e, billObj, vouchers, services)}; 
    document.querySelector('.toggle').onclick = (e) => handledToggleValueChanged(e, billObj, floatFinalTotal);
    document.querySelector('#card').onchange = (e) => handleSplitAmountChanged(e, billObj, floatFinalTotal);
    document.querySelector('#cash').onchange = (e) => handleSplitAmountChanged(e, billObj, floatFinalTotal);
    //set other attributes
    dialog.className = 'modal';
    header.className = 'check-out';

    //show
    dialog.showModal();
}

function handleVoucherInputChanged(e, billObj, vouchers, services){
    if(e.target.value != ""){
        const voucher = vouchers.find((voucher) => voucher.code.toLowerCase() == e.target.value.toLowerCase());
        if(voucher != undefined){
            let voucherUsed = voucher.price <= billObj.getTotal(services) ? voucher.price : billObj.getTotal(services);
            let finalTotal = voucher == undefined ? billObj.getTotal(services) : voucher.price <= billObj.getTotal(services) ? billObj.getTotal(services) - voucher.price : 0;
            document.querySelector('#all-discount').textContent = `-${getStringFormat((billObj.getAllDiscount() + voucherUsed).toFixed(2))}`;
            document.querySelector('#final-total').textContent = getStringFormat(finalTotal.toFixed(2));
            billObj.setVoucherCode(voucher.code);
            setPaymentAmountToObj(billObj, finalTotal.toFixed(2));
            setPaymentAmountToInput(billObj, finalTotal.toFixed(2));
        } else {
            e.target.value = 'Non-existing code';
            document.querySelector('#all-discount').textContent = `-$0.00`;
            document.querySelector('#final-total').textContent = getStringFormat(billObj.getTotal(services));
            billObj.setVoucherCode("");
        }
    } else {
        document.querySelector('#all-discount').textContent = `-$0.00`;
        document.querySelector('#final-total').textContent = getStringFormat(billObj.getTotal(services));
        billObj.setVoucherCode("");
    }
}

function handledToggleValueChanged(evt, billObj, finalTotal){
    switch (evt.target.id){
        case 'toggle-card': 
            billObj.setPaymentType('card');
            document.querySelector('#cash').value = "";
            document.querySelector('#card').value = finalTotal;
        break;
        case 'toggle-cash': 
            billObj.setPaymentType('cash');
            document.querySelector('#cash').value = finalTotal;
            document.querySelector('#card').value = "";
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

function handleSplitAmountChanged(e, billObj, finalTotal){
    if(e.target.value != ""){
        let formattedInput = getStringFormat(getNumberFromAmountString(e.target.value));
        let numberInput = parseFloat(getNumberFromAmountString(e.target.value));
        if(formattedInput != false && numberInput >= 0 && numberInput <= finalTotal){
            if(e.target.id == 'card'){
                document.querySelector('#cash').value = getStringFormat((finalTotal - numberInput).toFixed(2));
            } else if (e.target.id == 'cash'){
                document.querySelector('#card').value = getStringFormat((finalTotal - numberInput).toFixed(2));
            }
            e.target.value = getStringFormat(numberInput);
            setPaymentAmountToObj(billObj, finalTotal);
            document.querySelector('#error').innerHTML = '';
        } else {
            e.target.value = getStringFormat(finalTotal);
            if(e.target.id == 'card'){
                document.querySelector('#cash').value = '$.00';
            } else if (e.target.id == 'cash'){
                document.querySelector('#card').value = '$.00';
            }
            document.querySelector('#error').innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Invalid format. Correct format: e.g.: 16, 16.0, 16.50';
            if(!(numberInput >= 0 && numberInput < finalTotal)) {
                document.querySelector('#error').innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Number must be larger than 0 and less than the TOTAL';
            }
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
        billObj.setPaymentAmount(finalTotal, parseFloat(getNumberFromAmountString(document.querySelector('#card').value)));
    } else {
        billObj.setPaymentAmount(finalTotal, 0);
    }
}

function setPaymentAmountToInput(billObj, finalTotal){
    if(billObj.getPayment().type != 'split'){
        document.querySelector('#card').disabled = 'disabled';
        document.querySelector('#cash').disabled = 'disabled';
        if(billObj.getPayment().type == "card"){
            document.querySelector('#card').value = billObj.getPayment().cardAmount == 0 ? getStringFormat(finalTotal) : getStringFormat(billObj.getPayment().cardAmount);
            document.querySelector('#cash').value = billObj.getPayment().cashAmount = "$.00";
        } else {
            document.querySelector('#cash').value = billObj.getPayment().cardAmount == 0 ? getStringFormat(finalTotal) : getStringFormat(billObj.getPayment().cashAmount);
            document.querySelector('#card').value = billObj.getPayment().cardAmount = "$.00";
        }
    } else {
        document.querySelector('#card').removeAttribute('disabled');
        document.querySelector('#cash').removeAttribute('disabled');
        document.querySelector('#card').value = billObj.getPayment().cardAmount == 0 ? "$.00" : getStringFormat(billObj.getPayment().cardAmount);
        document.querySelector('#cash').value = billObj.getPayment().cashAmount == 0 ? "$.00" : getStringFormat(billObj.getPayment().cashAmount);
    }
}