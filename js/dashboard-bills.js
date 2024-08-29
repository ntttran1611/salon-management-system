import { Bills } from "../data/bill-list.js";
import { Branches } from "../data/branch-list.js";
import { serviceList } from "../data/service-list.js";
import { Staff } from "../data/staff-list.js";
import { Bill } from "./objects/bill.js";

document.querySelector("#bills").addEventListener('click', loadPage);
window.onload = loadPage;

const tempBillsList = Bills; //must be filtered by branches
const tempBrancheslist = Branches;
const tempServiceList = serviceList;
const tempStaffList = Staff;

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
        return `<div class="vertical-list">${tempBillsList.map((bill) => {
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
    
    //display bill details
    document.querySelector('.col-2').innerHTML = currentBill.generateBillContent(tempServiceList, tempStaffList);
    setStaffAndServices(currentBill.getBillServices());

    //build the table
    new DataTable('#myTable', {
        paging: false,
        searching: false,
        "info": false
    });
}

function handleServiceInfoChanged(id){

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
        const billServices = services;
        serviceSelects[i].value = billServices[i].serviceId;
        staffSelects[i].value = billServices[i].staffId == -1 ? 1 : billServices[i].staffId;
    }
}