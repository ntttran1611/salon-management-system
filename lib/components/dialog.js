const dialog = document.querySelector('dialog');
const header = document.querySelector('#modal-header');
const content = document.querySelector('#modal-content');
const footer = document.querySelector('#modal-footer');

export function showDeleteAlert(itemId, itemName){
    //set dialog content
    header.innerHTML = `<i class="fa-solid fa-triangle-exclamation fa-lg"></i>  Please notice before action`;
    content.innerHTML = `<span>Are you sure that the item named <b>${itemName}</b> will be <span class="stress-span">delete</span>?</span>`;
    footer.innerHTML = `
        <button id="modal-delete-btn" class="square-btn confirm-btn">Yes, DELETE</button>
        <button id="modal-cancel-btn" class="square-btn cancel-btn">Cancel</button>
    `;
    //set other attributes
    dialog.className = 'modal';
    header.className = 'failed';
    //add function to buttons
    document.querySelector('#modal-cancel-btn').onclick = () => closeDialog();
    document.querySelector('#modal-delete-btn').onclick = () => {
        console.log(`Deleting item ${itemId}!!`);
        closeDialog(true);
    }
    //show
    dialog.showModal();
}

export function showNoticeAlert(message, type){
    footer.innerHTML = `<button id="modal-cancel-btn" class="square-btn cancel-btn">Close</button>`;
    let headerText = "";
    switch (type){
        case 'failed': 
            headerText = `<i class="fa-solid fa-circle-exclamation"></i>  FAILED`;
            //add function to button
            document.querySelector('#modal-cancel-btn').onclick = () => closeDialog(false);
        break;
        case 'successful': 
            headerText = `<i class="fa-solid fa-circle-check"></i>  SUCCESSFUL`;
            //add function to button
            document.querySelector('#modal-cancel-btn').onclick = () => closeDialog(true);
        break;
        default: headerText = "Undefined ERROR";
    }
    //set dialog content
    header.innerHTML = headerText;
    content.innerHTML = `<span>${message}</span>`;
    //set other attributes
    dialog.className = 'modal';
    footer.style.justifyContent = 'end';
    header.className = type;
    
    //show
    dialog.showModal();
}

export function showCheckOutBoard(billObj, services, vouchers){
    let voucher = vouchers.find((voucher) => voucher.code.toLowerCase() == billObj.getVoucherCode().toLowerCase());
    let voucherUsed = voucher != undefined ? (voucher.price <= billObj.getTotal(services) ? voucher.price : billObj.getTotal(services)) : 0;
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
                <span>$${billObj.getTotal(services)}.00</span>
            </div>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Voucher:</b></span>
                <input style="width: 60%; text-align: end" class="table-input voucher" type="text" name="voucher" id="voucher" value='${voucher == undefined ? '' : voucher.code}' placeholder="No code entered">
            </div>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Discount:</b></span>
                <span style="color: #C97C82" id="all-discount">-$${billObj.getAllDiscount() + voucherUsed}.00</span>
            </div>
            <div class="list-item" style="justify-content: space-between">
                <span><b>Total:</b></span>
                <span id="final-total">$${voucher == undefined ? billObj.getTotal(services) : voucher.price <= billObj.getTotal(services) ? billObj.getTotal(services) - voucher.price : 0}.00</span>
            </div>
        <hr>
        <span>Please choose a payment method:</span>
        <div class="toggle" name="payment-method">
            <div class="toggle-btn active" id="toggle-card">Card</div>
            <div class="toggle-btn" id="toggle-cash">Cash</div>
            <div class="toggle-btn" id="toggle-split">Split</div>
        </div>
        <input style="width: 40%; display: none" class="form-input" type="text" name="card" id="card" value='' placeholder="Amount on Card">
        <input style="width: 40%; display: none" class="form-input" type="text" name="cash" id="cash" value='' placeholder="Amount on Cash">
    `;

    footer.innerHTML = `
        <button id="modal-confirm-btn" class="square-btn confirm-btn">Confirm</button>
        <button id="modal-cancel-btn" class="square-btn cancel-btn">Cancel</button>
    `;

    //add function to buttons
    document.querySelector('#modal-cancel-btn').onclick = () => closeDialog();
    document.querySelector('#modal-confirm-btn').onclick = () => {
        
        closeDialog(true);
        console.log(billObj);
        billObj.checkOut();
    }
    document.querySelector('#voucher').onchange = (e) => {handleVoucherInputChanged(e, billObj, vouchers, services)}; 
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
            document.querySelector('#all-discount').textContent = `-$${billObj.getAllDiscount() + voucherUsed}.00`;
            document.querySelector('#final-total').textContent = `$${voucher.price <= billObj.getTotal(services) ? billObj.getTotal(services) - voucher.price : 0}.00`
            billObj.setVoucherCode(voucher.code);
        } else {
            e.target.value = 'Non-existing code';
            document.querySelector('#all-discount').textContent = `-$0.00`;
            document.querySelector('#final-total').textContent = `$${billObj.getTotal(services)}.00`
            billObj.setVoucherCode("");
        }
    } else {
        document.querySelector('#all-discount').textContent = `-$0.00`;
        document.querySelector('#final-total').textContent = `$${billObj.getTotal(services)}.00`
        billObj.setVoucherCode("");
    }
}

export function closeDialog(reload){
    //remove all content and class of the dialog
    dialog.removeAttribute('class');
    header.removeAttribute('class');
    header.innerHTML = "";
    content.innerHTML = "";
    footer.innerHTML = "";
    reload ? window.location.reload() : dialog.close();
}

