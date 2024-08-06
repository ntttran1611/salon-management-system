import { Vouchers } from "../data/voucher-list.js";
import { closeManagingTab, formatDate,
    disableToggle, enableToggle, 
    disableFormEditing, enableFormEditing,
    disableInputs, enableInputs,
    disableLabels, enableLabels
} from "../lib/functions/shared.js";
import { showDeleteAlert, showNoticeAlert} from "../lib/components/dialog.js";
//get vouchers list from db
const tempVouchersList = Vouchers;

document.querySelector('#vouchers').addEventListener('click', loadPage);
//display voucher list when the corresponding tab link is being chosen
function loadPage(){
    if (document.querySelector('#vouchers').className.includes('active')){
        //get rows with data
        const rows = getTableRows();
        //declare table and add rows
        document.querySelector("main").innerHTML = `
            <div class='col-1'>
                <table id="myTable" class="hover" style="width:100%">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>ID</th>
                            <th>Code</th>
                            <th>Buyer name</th>
                            <th>Price</th>
                            <th>Expiry</th>
                            <th>Function</th>                        
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
                <button id='add-btn' class="round-btn add-btn" >
                    <i class="fa-solid fa-plus fa-lg"></i>
                    <span class="tooltiptext">Add new</span> 
                </button>
            </div>
            <div class='col-2'>
                <h2>No item selected</h2>
                <p class="note-lg">No item selected</>
            </div>
        `;

        //Add interactions to functional buttons
        //VIEW BUTTON - view a voucher
        const viewButtons = document.querySelectorAll('.view-btn');
        for (let i = 0; i < tempVouchersList.length; i++){
            viewButtons[i].onclick = () => handleViewAddButtonsClicked(i + 1);
        }

        //ADD BUTTON - add a new voucher
        document.querySelector('#add-btn').onclick = () => handleViewAddButtonsClicked(null);

        //build the table
        $(document).ready(function () {
            $('#myTable').DataTable();
        });
            
        //add onShow id to trigger animations
        setTimeout(()=>{
            document.querySelector('.col-1').id = "onShow";
            document.querySelector('.col-2').id = "onShow";
        }, 1);
    }
}

//add data to table rows
function getTableRows(){
    let tableRowData = tempVouchersList.map((voucher) => {
        return `<tr>
            <td>
                ${addStatusIcon(getVoucherStatus(voucher))}
            </td>
            <td>${voucher.id}</td>
            <td>${voucher.code}</td>
            <td>${voucher.buyerName}</td>
            <td>${voucher.price}</td>
            <td>${voucher.expiry}</td>
            <td>
                <button id="${voucher.id}" class="round-btn view-btn">
                    <i class="fa-regular fa-eye fa-sm"></i> 
                    <span class="tooltiptext">View/Edit</span>
                </button> 
            </td>
        </tr>`
    }).join('');

    return tableRowData;
}
//generate icons indicating the vouchers' status
function addStatusIcon(status){
    switch (status){
        case 'active': return `<i class="fa-solid fa-circle status active"></i>`;
        case 'inactive': return `<i class="fa-solid fa-circle status inactive"></i>`;
        case 'warning': return `<i class="fa-solid fa-circle status warning"></i>`;
        default: return null;
    }
}

//update header background based on the status of the voucher
function getVoucherStatus(voucher){
    if(voucher.used){ //voucher is used
        return 'inactive';
    }
    else{
        if(new Date() > new Date(voucher.expiry)){ //voucher is expired
            return 'warning'; 
        }
        else {
            return 'active'; //voucher is unused
        }
    }
}

//show input tab when view/add buttons are hit
function handleViewAddButtonsClicked(id){
    //search for the chosen voucher using its id
    const chosenVoucher = tempVouchersList.filter((voucher) => voucher.id == id);
    const isEditing = chosenVoucher.length > 0; //check if the action is 'adding' or 'editing'
    
    //instance of the branch/new branch to be managed
    let managedVoucher = isEditing ? chosenVoucher[0] : {
        id: '',
        code: '',
        buyerName: '',
        price: '',
        dateOfIssue: '',
        expiry: '',
        note: '',
        mobile: '',
        used: false,
    };
    let initialStatus = managedVoucher.used;

    //add content to input elements
    const col2 = document.querySelector('.col-2');
    col2.innerHTML = getInputContent(managedVoucher, isEditing);

    //set height to col-2 for animations
    col2.style.height = col2.scrollHeight + 'px';

    //Add function to CLOSE TAB BUTTON
    document.querySelector('#close-btn').onclick = () => closeManagingTab();

    //Add function to CANCEL BUTTON
    const cancelBtn = document.querySelector('#cancel-btn');
    
    if(isEditing){
        //Set voucher status
        setVoucherStatus(managedVoucher);

        //Add function to EDIT BUTTON
        document.querySelector('#edit-btn').onclick = () => {
            enableForm(); 
            getVoucherStatus(managedVoucher) != 'warning' ? enableToggle() : null;
        };

        //disable editing if editing a branch
        cancelBtn.onclick = () => {
            //set all values back to the initial values
            document.querySelector('#voucher-buyer').value = managedVoucher.buyerName;
            document.querySelector('#voucher-price').value = managedVoucher.price;
            document.querySelector('#voucher-issue-date').value = managedVoucher.dateOfIssue;
            document.querySelector('#voucher-expiry').value = managedVoucher.expiry;
            document.querySelector('#voucher-mobile').value = managedVoucher.mobile;
            document.querySelector('#voucher-note').value = managedVoucher.note;
            managedVoucher.used = initialStatus;
            setVoucherStatus(managedVoucher);
            disableForm(); //disable inputs
            disableToggle(); //disable toggle
        };

        //DELETE BUTTON
        document.querySelector('#delete-btn').onclick = () => showDeleteAlert(chosenVoucher[0].id, chosenVoucher[0].code);
    
        //STATUS TOGGLE
        document.querySelector('.toggle').onclick = (evt) => handledToggleValueChanged(evt, managedVoucher);
    } else {
        //get all inputs ready
        enableForm();
        enableToggle();
        setVoucherStatus(managedVoucher);
        //set default issue date and expiry
        const today = new Date();
        document.querySelector('#voucher-issue-date').value = formatDate(today);
        today.setFullYear(today.getFullYear() + 3) //add three years (standard valid period) to the issue date
        document.querySelector('#voucher-expiry').value = formatDate(today);

        //close tab if adding a branch
        cancelBtn.onclick = () => closeManagingTab();
    }

    //Add function to CONFIRM BUTTON
    document.querySelector('#confirm-btn').onclick = () => {
        //get final objects for submitting to db
        let checkVoucher = {...managedVoucher};
        checkVoucher.buyerName = document.querySelector('#voucher-buyer').value;
        checkVoucher.price = document.querySelector('#voucher-price').value;
        checkVoucher.dateOfIssue = document.querySelector('#voucher-issue-date').value;
        checkVoucher.expiry = document.querySelector('#voucher-expiry').value;
        checkVoucher.mobile = document.querySelector('#voucher-mobile').value;
        checkVoucher.note = document.querySelector('#voucher-note').value
        if(checkInputs(checkVoucher)){
            managedVoucher = checkVoucher;
            addEditVoucher(managedVoucher);
        }
    };
}

//handle toggle's value changed
function handledToggleValueChanged(evt, voucher){
    const toggle = document.querySelector(".toggle");
    if(toggle.className.includes('enabled')){
        if(evt.target.id == "toggle-active"){
            voucher.used = false;
        } else if (evt.target.id == 'toggle-inactive') {
            voucher.used = true;
        }
        setVoucherStatus(voucher);
    }
}

//add voucher status to the form
function setVoucherStatus(voucher){
    const toggle = document.querySelector('.toggle');
    let voucherStatus = getVoucherStatus(voucher);
    for(let i=0; i<toggle.children.length; i++){
        toggle.children[i].className = "toggle-btn";
    }
    document.querySelector(`#toggle-${voucherStatus}`).className += ' active';
}

//get input content
function getInputContent(voucher, action){
    //add content to the form inputs/selects if editing a voucher
    //if adding, leave the inputs blank
    let tabContent = `
            <h2> ${action > 0 ? `Voucher ${voucher.code}` : `Adding a new voucher` }</h2>
            <div class="main-func-btns">
                ${action ? `<button id="edit-btn" class="round-btn edit-btn">
                    <i class="fa-solid fa-pen-to-square fa-lg"></i>
                    <span class="tooltiptext">Edit</span>
                </button> 
                <button id="delete-btn" class="round-btn delete-btn">
                    <i class="fa-solid fa-trash fa-lg"></i>
                    <span class="tooltiptext">Remove</span>
                </button>` : '' }
                <button class="round-btn close-btn" id="close-btn">
                    <i class="fa-solid fa-xmark fa-xl"></i>
                    <span class="tooltiptext">Close</span>
                </button>
            </div> 
            <div class="form">
                <div class="double-inputs">
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-buyer'>What is the buyer name?</label><br>
                        <input class="form-input" maxlength=20 type="text" id="voucher-buyer" name="voucher-buyer" disabled required value='${voucher.buyerName}'>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-price'>Amount:</label><br>
                        <input class="form-input" maxlength=5 type="text" id="voucher-price" name="voucher-price" disabled required value='${voucher.price}'>
                    </div>
                </div>
                <div class="double-inputs">
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-issue-date'>Date of issue:</label><br>
                        <input class="form-input" maxlength=10 type="text" id="voucher-issue-date" name="voucher-issue-date" disabled required value='${voucher.dateOfIssue}'>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-expiry'>Expired date:</label><br>
                        <input class="form-input" maxlength=10 type="text" id="voucher-expiry" name="voucher-expiry" disabled required value='${voucher.expiry}'>
                    </div>
                </div>
                <div class="double-inputs">
                    <div class='toggle-container'>
                        <label class="form-label" for="voucher-status">Status:</label><br>
                        <div class="toggle" name="voucher-status">
                            <div class="toggle-btn active" id="toggle-active">Valid</div>
                            <div class="toggle-btn" id="toggle-inactive">Used</div>
                            <div class="toggle-btn" id="toggle-warning">Expired</div>
                        </div>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='voucher-mobile'>Buyer's mobile:</label><br>
                        <input class="form-input" maxlength=10 type="text" id="voucher-mobile" name="voucher-mobile" disabled required value='${voucher.mobile}'>
                    </div>
                </div>
                <div class="text-input-container">
                        <label class="form-label" for='voucher-note'>Notes:</label><br>
                        <input class="form-input" maxlength=50 type="text" id="voucher-note" name="voucher-note" disabled required value='${voucher.note}'>
                </div>
                <div class="confirm-btns">
                    <button id="confirm-btn" class="square-btn confirm-btn">Confirm</button>
                    <button id="cancel-btn" class="square-btn cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        return tabContent;
}
//enable form
function enableForm(){
    enableFormEditing();
    enableInputs();
    enableLabels();
}
//disable form 
function disableForm(){
    disableFormEditing();
    disableInputs();
    disableLabels();
}

//
//API
//
//check validity of inputs
//TODO: check
//Price: number format, not null
//Dates: 'YYYY-MM-DD' format, not null, expiry > issue date
//Mobile: not null, format 04---, contain only 10 digits
function checkInputs(voucher){
    if(voucher.buyerName == ''){
        showNoticeAlert('Name of the buyer required', 'failed');
        return false;
    }
    return true;
}

//add/edit a voucher
function addEditVoucher(voucher){
    showNoticeAlert(`The item named ${voucher.code} has been added/edited.`, 'successful');
    console.log(voucher);
}











