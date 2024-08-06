import { Branches } from '../data/branch-list.js';
import { enableFormEditing, disableFormEditing, 
    enableSelects, disableSelects,
    enableInputs, disableInputs,  
    enableLabels, disableLabels,
    closeManagingTab, startTimes, endTimes } from '../lib/functions/shared.js';
import { showDeleteAlert, showNoticeAlert } from '../lib/components/dialog.js';

//get list of branches from db
let tempBranchesList = Branches;
document.querySelector('#branches').addEventListener('click', loadPage);

//display all branches when the corresponding tab link is chosen
//a table + a content-managing board
function loadPage(){
    if (document.querySelector('#branches').className.includes('active')){
        //get rows with data
        const rows = getTableRows();
        //declare table and add rows
        document.querySelector("main").innerHTML = `
            <div class='col-1'>
                <table id="myTable" class="hover" style="width:100%">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Trading hours</th>
                            <th>Address</th>
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
        //VIEW BUTTON - display a branch
        const viewButtons = document.querySelectorAll('.view-btn');
        for (let i = 0; i < tempBranchesList.length; i++){
            viewButtons[i].onclick = () => handleViewAddButtonsClicked(i + 1);
        }

        //ADD BUTTON - add a branch
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
    let tableRowData = tempBranchesList.map((branch) => {
        return `<tr>
            <td>${branch.id}</td>
            <td>${branch.name}</td>
            <td>${branch.openingTime}-${branch.closingTime}</td>
            <td>${branch.address != "" ? branch.address : 'No address provided'}</td>
            <td>
                <button id="${branch.id}" class="round-btn view-btn">
                    <i class="fa-regular fa-eye fa-sm"></i> 
                    <span class="tooltiptext">View/Edit</span>
                </button> 
            </td>
        </tr>`
    }).join('');

    return tableRowData;
}

//set content and input elements to the form
function getInputContent(branch, action){
    //generate start-time and end-time options for the selects
    let optionStartTimes = startTimes.map((value)=>{return `<option id=${value} value=${value}>${value}</option>`;}).join('');
    let optionEndTimes = endTimes.map((value)=>{return `<option id=${value} value=${value}>${value}</option>`;}).join('');
    //add content to the form inputs/selects if editing a branch
    //if adding, leave the inputs blank
    let tabContent = `
            <h2> ${action > 0 ? `Branch #${branch.id} | ${branch.name}` : `Adding a new branch` }</h2>
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
                <div class="text-input-container">
                    <label class="form-label" for='branch-name'>What is this branch's name?</label><br>
                    <input class="form-input" maxlength=30 type="text" id="branch-name" name="branch-name" disabled required value='${branch.name}'>
                </div>
                <div class="double-inputs">
                    <div class="selection-box">
                        <label class="form-label" for="opening-time">Open at:</label><br>
                        <select class="form-select" name="opening-time" id="opening-time" disabled required>
                            ${optionStartTimes}
                        </select>
                    </div>
                    <div class="selection-box">
                        <label class="form-label" for="closing-time">Close at:</label><br>
                        <select class="form-select name="closing-time" id="closing-time" disabled required>
                            ${optionEndTimes}
                        </select>
                    </div>
                </div>
                <div class="text-input-container">
                    <label class="form-label" for='branch-address'>What is its address?</label><br>
                    <input class="form-input" maxlength=50 type="text" id="branch-address" name="branch-address" disabled required value='${branch.address}'>
                </div>
                <div class="confirm-btns">
                    <button id="confirm-btn" class="square-btn confirm-btn">Confirm</button>
                    <button id="cancel-btn" class="square-btn cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        return tabContent;
}

//show input tab when view/add buttons are hit
function handleViewAddButtonsClicked(id){
    //search for the chosen branch using its id
    const chosenBranch = tempBranchesList.filter((branch) => branch.id == id);
    const isEditing = chosenBranch.length > 0; //check if the action is 'adding' or 'editing'
    
    //instance of the branch/new branch to be managed
    const managedBranch = isEditing ? chosenBranch[0] : {
        id: '',
        name: '',
        openingTime: '',
        closingTime: '',
        address: ''
    };

    //display input elements and item content to the board
    const col2 = document.querySelector('.col-2');
    col2.innerHTML = getInputContent(managedBranch, isEditing);

    //set height to col-2 for animations
    col2.style.height = col2.scrollHeight + 'px';

    //Add function to CLOSE TAB BUTTON
    document.querySelector('#close-btn').onclick = () => closeManagingTab();

    //Add function to CANCEL BUTTON
    const cancelBtn = document.querySelector('#cancel-btn');
    
    if(isEditing){
        //Set start-time and end-time values to the selects
        document.querySelector('#opening-time').value = managedBranch.openingTime;
        document.querySelector('#closing-time').value = managedBranch.closingTime;

        //Add function to EDIT BUTTON - enable all input elements
        document.querySelector('#edit-btn').onclick = () => {
            enableForm();
        }

        //disable editing if editing a branch
        cancelBtn.onclick = () => {
            //set all values back to the initials
            document.querySelector('#branch-name').value = managedBranch.name;
            document.querySelector('#opening-time').value = managedBranch.openingTime;
            document.querySelector('#closing-time').value = managedBranch.closingTime;
            document.querySelector('#branch-address').value = managedBranch.address;
            //disable inputs
            disableForm();
        };

        //DELETE BUTTON
        document.querySelector('#delete-btn').onclick = () => showDeleteAlert(chosenBranch[0].id, chosenBranch[0].name);
    } else {
        //enable the form if adding a new branch
        enableForm();

        //close tab if adding a branch
        cancelBtn.onclick = () => closeManagingTab();
    }

    //Add function to CONFIRM BUTTON
    document.querySelector('#confirm-btn').onclick = () => {
        //get final objects for submitting to db
        if(checkInputs(document.querySelector('#branch-name').value)){
            managedBranch.id = '99';
            managedBranch.name = document.querySelector('#branch-name').value;
            managedBranch.openingTime = document.querySelector('#opening-time').value;
            managedBranch.closingTime = document.querySelector('#closing-time').value;
            managedBranch.address = document.querySelector('#branch-address').value;
            addEditBranch(managedBranch);
        }
    };
}

//enable form
function enableForm(){
    enableFormEditing();
    enableSelects();
    enableInputs();
    enableLabels();
}

//disable form
function disableForm(){
    disableFormEditing(); 
    disableSelects();
    disableInputs();
    disableLabels();
}

//input validations
function checkInputs(name){
    if(name == ''){
        showNoticeAlert(`Branch name required`, 'failed');
        return false;
    }
    return true;
}

//add/edit a branch (API connection)
function addEditBranch(branch){
    showNoticeAlert(`The branch named <b>${branch.name}</b> has been added/edited`, 'successful')
    console.log(branch);
}







