import { Bills } from "../data/bill-list.js";
import { Branches } from "../data/branch-list.js";
import { serviceList } from "../data/service-list.js";
import { Staff } from "../data/staff-list.js";
import { enableSelects } from "../lib/functions/shared.js";

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
                        <div id=indicator-${bill.id} class="choose-indicator"></div>
                        <div class="list-item-content" id=${bill.id}>${bill.id} - ${bill.cusName}</div>
                    </div>`
            }).join('')}
        </div>`; 
    }
}

//activate choose indicator
function activateIndicator(id){
    const chooseIndicators = document.querySelectorAll('.choose-indicator');
    for(let i=0; i<chooseIndicators.length; i++){
        chooseIndicators[i].className = "choose-indicator";
    }
    document.querySelector(`#indicator-${id}`).className += ' active';
}

//display a bill's info when a list item is clicked
function handleListItemClicked(id){
    //switch the indicator from white to pink
    activateIndicator(id);

    const bill = tempBillsList.find((bill) => bill.id == id);
    //display bill details
    document.querySelector('.col-2').innerHTML = generateBillContent(bill);

    //build the table
    new DataTable('#myTable', {
        paging: false,
        searching: false,
        "info": false
    });
}

//generate bill info to html
function generateBillContent(item){
    const rows = getRows(item);
    //console.log(item);
    return `
        <h2>Bill ID: ${item.id} | Client's name: ${item.cusName} | Contact: ${item.mobile} | Come at: ${item.entranceDate}, ${item.entranceTime}</h2>
        <table id="myTable" class="hover" style="width: 100%">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Done by</th>
                    <th>Discount</th>
                    <th>Total</th>
                    <th>Note</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

//get row content for the service table
function getRows(item){
    const services = item.services;
    const serviceOptions = tempServiceList.map((service)=>{
        return `<option value=${service.id}>${service.title}</option>`
    }).join('');
    const staffOptions = tempStaffList.map((staff)=>{
        return `<option value=${staff.id}>${staff.firstName} ${staff.lastName}</option>`
    })
    let rowContent = services.map((item) => {
        const service = tempServiceList.find((service)=>service.id == item.id);
        const staff = tempStaffList.find((staff)=>staff.id == item.staffId);
        return `<tr>
            <td><select class="table-select">${serviceOptions}</select></td>
            <td>${service.price}</td>
            <td><select class="table-select">${staffOptions}</select></td>
            <td><input class="table-input" type="text" name="bill-discount" id="bill-discount" value=${item.discount} placeholder="0"></td>
            <td>${service.price - item.discount}</td>
            <td><input class="table-input" type="text" name="bill-note" id="bill-note" value="${item.note}" placeholder="Enter something to describe this bill"></td>
        </tr>`
    }).join('');
    return rowContent;
}