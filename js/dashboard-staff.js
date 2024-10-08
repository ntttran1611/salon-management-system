import { StaffList } from "../data/staff-list.js";
import { Staff } from "../lib/objects/staff.js";
import { closeManagingTab, 
        enableFormEditing, disableFormEditing,
        enableInputs, disableInputs,
        enableLabels, disableLabels,
        enableToggle, disableToggle
 } from "../lib/functions/shared.js";
import { showDeleteAlert, showNoticeAlert } from "../lib/components/dialog.js";

//get all staff from DB **SHOULE BE PER PAGE**
const tempStaffList = Staff.getStaffObjList(StaffList);

document.querySelector('#staff').addEventListener('click', loadPage);
//display staff list when the corresponding tab link is being chosen
function loadPage(){
    if (document.querySelector('#staff').className.includes('active')){
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
                            <th>Full name</th>
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
        for (let viewBtn of viewButtons){
            viewBtn.onclick = () => handleViewAddButtonsClicked(viewBtn.id);
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
    let tableRowData = tempStaffList.map((staffObj) => {
        return `<tr>
            <td>
                <i class="fa-solid fa-circle status ${staffObj.getStatus()}"></i>
            </td>
            <td>${staffObj.getId()}</td>
            <td>${staffObj.getFirstName()} ${staffObj.getLastName()}</td>
            <td>
                <button id="${staffObj.getId()}" class="round-btn view-btn">
                    <i class="fa-regular fa-eye fa-sm"></i> 
                    <span class="tooltiptext">View/Edit</span>
                </button> 
            </td>
        </tr>`
    }).join('');

    return tableRowData;
}

//show input tab when view/add buttons are hit
function handleViewAddButtonsClicked(id){
    //search for the chosen staff using its id
    const chosenStaff = tempStaffList.find((staff) => staff.getId() == id);
    const isEditing = chosenStaff != undefined; //check if the action is 'adding' or 'editing'
    let cloneStaffObj = isEditing ? chosenStaff : new Staff(undefined);

    //add content to input elements
    const col2 = document.querySelector('.col-2');
    col2.innerHTML = getInputContent(cloneStaffObj, isEditing);

    //set height to col-2 for animations
    col2.style.height = col2.scrollHeight + 'px';

    //Add function to CLOSE TAB BUTTON
    document.querySelector('#close-btn').onclick = () => closeManagingTab();

    //Add function to CANCEL BUTTON
    const cancelBtn = document.querySelector('#cancel-btn');

    //Set voucher status
    setStaffStatus(cloneStaffObj);
    
    if(isEditing){
        let initialStatus = cloneStaffObj.getStatus();
        //Add function to EDIT BUTTON
        document.querySelector('#edit-btn').onclick = () => enableForm();

        //disable editing if editing a staff member
        cancelBtn.onclick = () => {
            //set all values back to the initial values
            document.querySelector('#staff-firstName').value = cloneStaffObj.getFirstName();
            document.querySelector('#staff-lastName').value = cloneStaffObj.getLastName();
            document.querySelector('#staff-note').value = cloneStaffObj.getNote();
            cloneStaffObj.used = initialStatus;
            setStaffStatus(cloneStaffObj);
            disableForm(); //disable inputs
        };

        //DELETE BUTTON
        document.querySelector('#delete-btn').onclick = () => showDeleteAlert(cloneStaffObj.getId(), `${cloneStaffObj.getFirstName()} ${cloneStaffObj.getLastName()}`);
    
        //STATUS TOGGLE
        document.querySelector('.toggle').onclick = (evt) => handledToggleValueChanged(evt, cloneStaffObj);
    } else {
        //get all inputs ready
        enableForm();

        //close tab if adding a branch
        cancelBtn.onclick = () => closeManagingTab();
    }

    //Add function to CONFIRM BUTTON
    document.querySelector('#confirm-btn').onclick = () => {
        //get final objects for submitting to db
        let checkStaff = cloneStaffObj.clone();
        checkStaff.setFirstName(document.querySelector('#staff-firstName').value)
        checkStaff.setLastName(document.querySelector('#staff-lastName').value);
        checkStaff.setNote(document.querySelector('#staff-note').value)
        if(checkInputs(checkStaff)){
            cloneStaffObj = checkStaff;
            addEditItem(cloneStaffObj);
        }
    };
}

//get input content
function getInputContent(staffObj, action){
    //add content to the form inputs/selects if editing a staff
    //if adding, leave the inputs blank
    let tabContent = `
            <h2> ${action ? `Staff #${staffObj.getId()} - ${staffObj.getFirstName()} ${staffObj.getLastName()}` : `Adding a new staff` }</h2>
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
                        <label class="form-label" for='staff-firstName'>First name:</label><br>
                        <input class="form-input" maxlength=20 type="text" id="staff-firstName" name="staff-firstName" disabled required value='${staffObj.getFirstName()}'>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='staff-lastName'>Last name:</label><br>
                        <input class="form-input" maxlength=20 type="text" id="staff-lastName" name="staff-lastName" disabled required value='${staffObj.getLastName()}'>
                    </div>
                </div>
                <div class="double-inputs">
                    <div class='toggle-container'>
                        <label class="form-label" for="staff-status">Status:</label><br>
                        <div class="toggle" name="staff-status">
                            <div class="toggle-btn active" id="toggle-active">Active</div>
                            <div class="toggle-btn" id="toggle-inactive">Inactive</div>
                        </div>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='staff-note'>Note:</label><br>
                        <input class="form-input" maxlength=10 type="text" id="staff-note" name="staff-note" disabled required value='${staffObj.getNote()}'>
                    </div>
                </div>
                <div class="confirm-btns">
                    <button id="confirm-btn" class="square-btn confirm-btn">Confirm</button>
                    <button id="cancel-btn" class="square-btn cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        return tabContent;
}

//add staff status to the form
function setStaffStatus(staffObj){
    const toggle = document.querySelector('.toggle');
    for(let i=0; i<toggle.children.length; i++){
        toggle.children[i].className = "toggle-btn";
    }
    document.querySelector(`#toggle-${staffObj.getStatus()}`).className += ' active';
}

//handle toggle's value changed
function handledToggleValueChanged(evt, staffObj){
    const toggle = document.querySelector(".toggle");
    if(toggle.className.includes('enabled')){
        if(evt.target.id == "toggle-active"){
            staffObj.setStatus('active');
        } else if (evt.target.id == 'toggle-inactive') {
            staffObj.setStatus('inactive');
        }
        setStaffStatus(staffObj);
    }
}

//enable form
function enableForm(){
    enableFormEditing();
    enableInputs();
    enableLabels();
    enableToggle();
}
//disable form 
function disableForm(){
    disableFormEditing();
    disableInputs();
    disableLabels();
    disableToggle();
}

//
//API
//
//check validity of inputs
function checkInputs(staffObj){
    if(staffObj.getFirstName() == ''){
        showNoticeAlert('Staff first name required.', 'failed');
        return false;
    }
    return true;
}

//add/edit a voucher
function addEditItem(staffObj){
    showNoticeAlert(`The item named ${staffObj.getFirstName()} ${staffObj.getLastName()} has been added/edited.`, 'successful');
    console.log(staffObj);
}


