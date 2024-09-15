import { Bills } from "../data/bill-list.js";
import { Branches } from "../data/branch-list.js";
import { serviceList } from "../data/service-list.js";
import { Staff } from "../data/staff-list.js";
import { Bill } from "../lib/objects/bill.js";
import { Vouchers } from "../data/voucher-list.js";
import { showDeleteAlert, showNoticeAlert, showCheckOutDialog } from "../lib/components/dialog.js";

document.querySelector("#bills").addEventListener('click', loadPage);
window.onload = loadPage;

const tempBillsList = Bills; //must be filtered by branches
const tempBrancheslist = Branches;
const tempServiceList = serviceList;
const tempStaffList = Staff;
const tempVouchersList = Vouchers;

//display all bills and the first bill when the page is load
function loadPage(){
    //get branch list
    let branches = tempBrancheslist.map((branch)=>{return `<option id=${branch.id} value=${branch.id}>${branch.name}</option>`})
    //get all bills
    const billList = getBillList();
    if(document.querySelector("#bills").className.includes("active")){
        document.querySelector("main").innerHTML = `
            <div class="col-1 sm">
                <h2><i class="fa-solid fa-code-branch"></i> Kingston</h2>
                ${billList}
            </div>
            <div class="col-2 lg">
                <h2>No bill selected</h2>
                <p class="note-lg">No bill selected</>
            </div>
        `
    }

    const billItems = document.querySelectorAll(".list-item");
    for(let i=0; i<billItems.length; i++){
        billItems[i].onclick = () => handleListItemClicked(billItems[i].id);
    }

    //add onShow id to trigger animations
    setTimeout(()=>{
        document.querySelector('.col-1').id = "onShow";
        document.querySelector('.col-2').id = "onShow";
    }, 1);
}

//turn all bills to html list
function getBillList(){
    if(tempBillsList.length == 0){
       return `<p class="note-lg">No bill recorded</>`;
    } else {
        return `<div class="vertical-list" style="justify-content: space-evenly;">${tempBillsList.map((bill) => {
            return `<div id=${bill.id} class="list-item ${bill.paid ? `checked` : ''}">
                        <div class="choose-indicator"></div>
                        <div class="list-item-content" id=${bill.id}>${bill.id} - ${bill.cusName}</div>
                    </div>`
            }).join('')}
        </div>`; 
    }
}

//display a bill's info when a list item is clicked
function handleListItemClicked(id){
    const currentBill = new Bill(tempBillsList.find((bill) => bill.id == id));
    
    //switch the indicator from white to pink
    activateIndicator(id);
    
    loadBill(currentBill);
}

function loadBill(billObj){
    //display bill details
    document.querySelector('.col-2').innerHTML = generateBillContent(billObj);
    setStaffAndServices(billObj.getBillServices());

    //handle values changed
    handleServiceOptionChanged(billObj);
    handleDiscountChanged(billObj);
    handleNoteChaged(billObj);
    handleStaffChanged(billObj);

    //handle buttons clicked
    handleDeleteSingleService(billObj);
    handleAddSingleService(billObj);
    document.querySelector('#check-out-btn').onclick = () => {
        console.log(billObj);
        showCheckOutDialog(billObj, tempServiceList, tempVouchersList);
    };

    //build the table
    new DataTable('#myTable', {
        paging: false,
        searching: false,
        "info": false
    });
}

//modify relevant info when a service on the bill is changed
function handleServiceOptionChanged(billObj){
    const serviceSelects = document.querySelectorAll('.table-select.service');
    for(let select of serviceSelects){
        select.onchange = (e) => {
            //get the id of the bill service
            const serviceIndex = e.target.id.slice(-1);
            //get the service from the service list 
            const service = serviceList.find((service)=>service.id == e.target.value);

            const priceRow = document.querySelector(`#price-${serviceIndex}`);
            const totalBillText = document.querySelector('#total');
            const totalRow = document.querySelector(`#total-${serviceIndex}`);
            const discountRow = document.querySelector(`#discount-${serviceIndex}`);
            
            priceRow.textContent = service.price;
            totalRow.textContent = service.price - discountRow.value; 
            billObj.setServiceId(serviceIndex, parseInt(e.target.value));
            totalBillText.textContent = `$AU ${billObj.getTotal(tempServiceList)}`;

        }
    }
}
//modify relevant info when discount is changed
function handleDiscountChanged(billObj){
    const discountInputs = document.querySelectorAll('.table-input.discount');
    let numberRegex = /^\d+$/;
    for(let discountInput of discountInputs){
        discountInput.onchange = (e) => {
            if(e.target.value != ""){
                //get the id of the bill service
                const serviceIndex = e.target.id.slice(-1);
                const priceRow = document.querySelector(`#price-${serviceIndex}`);
                const totalRow = document.querySelector(`#total-${serviceIndex}`);
                const totalBillText = document.querySelector('#total');
                if(numberRegex.test(e.target.value)){
                    totalRow.textContent = parseInt(priceRow.textContent) - parseInt(e.target.value);
                    billObj.setServiceDiscount(serviceIndex, parseInt(e.target.value));
                    totalBillText.textContent = `$AU ${billObj.getTotal(tempServiceList)}`;
                } else {
                    showNoticeAlert("Discount value must be a number", 'failed');
                    e.target.value = "0";
                    totalRow.textContent = parseInt(priceRow.textContent) - parseInt(e.target.value);
                }
            } else {
                e.target.value = "0";
            }
        }
    }
}

function handleStaffChanged(billObj){
    const staffSelects = document.querySelectorAll('.table-select.staff');
    for(let staffSelect of staffSelects){
        staffSelect.onchange = (e) => {
            const serviceIndex = e.target.id.slice(-1);
            billObj.setServiceStaff(serviceIndex, parseInt(e.target.value));
        }
    }
}

function handleNoteChaged(billObj){
    const noteInputs = document.querySelectorAll('.table-input.note');
    for(let noteInput of noteInputs){
        noteInput.onchange = (e) => {
            const serviceIndex = e.target.id.slice(-1);
            billObj.setServiceNote(serviceIndex, parseInt(e.target.value));
        }
    }
}
//Deleting a service on the bill
function handleDeleteSingleService(billObj){
    const deleteSingleServiceBtns = document.querySelectorAll('.delete-table-btn');
    for(let btn of deleteSingleServiceBtns){
        btn.onclick = () => {
            billObj.deleteService(btn.id);
            loadBill(billObj);
        }
    }
}

//Adding a service to the bill
function handleAddSingleService(billObj){
    const addingBtn = document.querySelector('.add-table-btn');
    addingBtn.onclick = () => {
        let addingIndex = billObj.getServicesCount();
        let serviceId = parseInt(document.querySelector(`#service-${addingIndex}`).value);
        let staffId = parseInt(document.querySelector(`#staff-${addingIndex}`).value);
        let discount = document.querySelector(`#discount-${addingIndex}`).value == '' ? 0 : parseInt(document.querySelector(`#discount-${addingIndex}`).value);
        let note = document.querySelector(`#note-${addingIndex}`).value;

        billObj.addService(serviceId, staffId, discount, note);
        loadBill(billObj);
    }
}

//generate bill info to html
function generateBillContent(billObj){
    return `
        <h2><b style="color: black">Bill ID:</b> ${billObj.getId()} | <b style="color: black">Client's name:</b> ${billObj.getCusName()} | <b style="color: black">Contact:</b> ${billObj.getMobile()} | <b style="color: black">Come at:</b> ${billObj.getEntranceDate()}, ${billObj.getEntranceTime()}</h2>
        <table id="myTable" class="hover" style="width: 100%">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Done by</th>
                    <th>Discount</th>
                    <th>Final price</th>
                    <th>Note</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${getRows(billObj)}
            </tbody>
        </table>
        <div class="bill-footer">
            <span style="margin-left: 20px">Sub total: <b id="total" style="color: #BBA366">$AU ${billObj.getTotal(tempServiceList)}</b> | Status: <b style="color: ${billObj.getStatus() ? "#4C7A6F" : "#C97C82"}">${billObj.getStatus() ? 'Paid' : 'Unpaid'}</b></span>
            <div style="display: flex; margin-right: 20px; margin-bottom: 13px">
                <button id="check-out-btn" class="square-btn confirm-btn">${billObj.getStatus() ? "Uncheck this bill" : "Check out"}</button>
                <button id="delete-btn" class="square-btn cancel-btn">Delete</button>
            </div>
        </div>
    `;
}

//get row content for the service table
function getRows(billObj){
    let rowContent = "";
    const serviceOptions = tempServiceList.map((service)=>{
        return `<option value=${service.id}>${service.title}</option>`
    }).join('');
    const staffOptions = tempStaffList.map((staff)=>{
        return `<option value=${staff.id}>${staff.firstName} ${staff.lastName}</option>`
    }).join('');
    
    const billServices = billObj.getBillServices();
    for(let i=0; i<billServices.length; i++){
        const service = serviceList.find((service)=>service.id == billServices[i].serviceId);
        rowContent += `<tr>
            <td><select id="service-${i}" class="table-select service" ${billObj.getStatus() ? "disabled" : ''}>${serviceOptions}</select></td>
            <td id="price-${i}">${service.price}</td>
            <td><select id="staff-${i}" class="table-select staff" ${billObj.getStatus() ? "disabled" : ''}>${staffOptions}</select></td>
            <td><input class="table-input discount" type="text" name="bill-discount" id="discount-${i}" value='${billServices[i].discount == 0 ? "0" : billServices[i].discount}' placeholder="0" ${billObj.getStatus() ? "disabled" : ''}></td>
            <td id="total-${i}">${parseInt(service.price) - parseInt(billServices[i].discount)}</td>
            <td><input class="table-input note" type="text" name="bill-note" id="note-${i}" value='${billServices[i].note == "" ? "" : billServices[i].note}' placeholder="Enter something to describe this bill" ${billObj.getStatus() ? "disabled" : ''}></td>
            <td>
                <button id="${i}" class="round-btn delete-table-btn " ${billObj.getStatus() ? "disabled" : ''}>
                    <i class="fa-solid fa-trash fa-xs"></i> 
                    <span class="tooltiptext">Delete</span>
                </button> 
            </td>
        </tr>`;
    }

    if(!billObj.getStatus())
    {
        rowContent += `<tr>
            <td><select id="service-${billObj.getServicesCount()}" class="table-select service inactive">${serviceOptions}</select></td>
            <td id="price-${billObj.getServicesCount()}" class="inactive">0</td>
            <td><select id="staff-${billObj.getServicesCount()}" class="table-select staff inactive">${staffOptions}</select></td>
            <td><input class="table-input discount inactive" type="text" name="bill-discount" id="discount-${billObj.getServicesCount()}" value="" placeholder="0"></td>
            <td id="total-${billObj.getServicesCount()}" class="inactive">0</td>
            <td><input class="table-input note inactive" type="text" name="bill-note" id="note-${billObj.getServicesCount()}" value="" placeholder="Enter something to describe this bill"></td>
            <td>
                <button id="add-service" class="round-btn sm add-table-btn">
                    <i class="fa-solid fa-plus fa-xs"></i>
                    <span class="tooltiptext">Add new</span> 
                </button> 
            </td>
        </tr>`;
    }

    return rowContent;
}

//change choose indicator's color
function activateIndicator(id){
    const listItems = document.querySelectorAll(".list-item");
    for(let i=0; i<listItems.length; i++){
        listItems[i].children[0].className = "choose-indicator";
        listItems[i].children[1].style.fontWeight = "400";
        if(listItems[i].id == id){
            listItems[i].children[0].className += " active";
            listItems[i].children[1].style.fontWeight = "700";
        }
    }
}

//display services listed in the bill and corresponding staff
function setStaffAndServices(services){
    const serviceSelects = document.querySelectorAll('.table-select.service');
    const staffSelects = document.querySelectorAll('.table-select.staff');
    for(let i=0;i<services.length;i++){
        serviceSelects[i].value = services[i].serviceId;
        staffSelects[i].value = services[i].staffId == -1 ? 1 : services[i].staffId;
    }
}