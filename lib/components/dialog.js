const dialog = document.querySelector('dialog');
const header = document.querySelector('#modal-header');
const content = document.querySelector('#modal-content');
const footer = document.querySelector('#modal-footer');

import { showCheckOutBoard } from "./check-out-dialog.js";

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
    document.querySelector('#delete-btn').onclick = () => {
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

export function showCheckOutDialog(billObj, services, vouchers){
    showCheckOutBoard(billObj, services, vouchers);
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

