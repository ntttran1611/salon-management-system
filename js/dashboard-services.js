import { serviceList } from "../data/service-list.js";
import { Branches } from "../data/branch-list.js";
import { closeManagingTab, 
        enableMultipleSelect, disableMultipleSelect,
        enableFormEditing, disableFormEditing,
        enableInputs, disableInputs, 
        enableSelects, disableSelects,
        enableLabels, disableLabels 
} from '../lib/functions/shared.js';
import { showDeleteAlert, showNoticeAlert } from '../lib/components/dialog.js';

const serviceTypes = ['Nails', 'Eyelashes', 'Waxing'];
//get service and branch lists from db
const tempServicesList = serviceList;
const tempBranchesList = Branches;

document.querySelector('#services').addEventListener('click', loadPage);
//load the page when the corresponding tab link is clicked
function loadPage(){
    if (document.querySelector('#services').className.includes('active')){
        //get rows with data
        const rows = getTableRows();
        //declare table and add rows
        document.querySelector("main").innerHTML = `
            <div class='col-1'>
                <table id="myTable" class="hover" style="width:100%">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Type</th>
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
        //VIEW BUTTON - view a service
        const viewButtons = document.querySelectorAll('.view-btn');
        for (let i = 0; i < tempServicesList.length; i++){
            viewButtons[i].onclick = () => handleViewAddButtonsClicked(i + 1);
        }

        //ADD BUTTON - add a service
        document.querySelector('#add-btn').onclick = () => handleViewAddButtonsClicked(null);

        //build the table
        $(document).ready(function () {
            $('#myTable').DataTable();
        });
            
        //Add onShow to className to trigger animations
        setTimeout(()=>{
            document.querySelector('.col-1').id = "onShow";
            document.querySelector('.col-2').id = "onShow";
        }, 1);
    }
}
//add data to table rows
function getTableRows(){
    let tableRowData = tempServicesList.map((service) => {
        return `<tr>
            <td>${service.id}</td>
            <td>${service.title}</td>
            <td>${service.price}</td>
            <td>${service.type}</td>
            <td>
                <button id="${service.id}" class="round-btn view-btn">
                    <i class="fa-regular fa-eye fa-sm"></i> 
                    <span class="tooltiptext">View/Edit</span>
                </button> 
            </td>
        </tr>`
    }).join('');

    return tableRowData;
}
//
//FORM MANAGEMENT (COL-2)
//
//show input tab when view/add buttons are hit
function handleViewAddButtonsClicked(id){
    //search for the chosen branch using its id
    const chosenService = tempServicesList.filter((service) => service.id == id);
    const isEditing = chosenService.length > 0; //check if the action is 'adding' or 'editing'
    
    //instance of the branch/new branch to be managed
    const managedService = isEditing ? chosenService[0] : {
        id: '',
        title: '',
        price: 0,
        description: '',
        type: '',
        availableAt: '',
        imageURL: ''
    };
    let chosenBrances = [...managedService.availableAt];

    //add content to input elements
    const col2 = document.querySelector('.col-2');
    col2.innerHTML = getInputs(managedService, isEditing);
    //show chosen branches for the current services (based on its availableAt)
    addBranchesToOptionContaier(chosenBrances);

    //set height to col-2 to trigger animations
    col2.style.height = col2.scrollHeight + 'px';

    //Add function to CLOSE TAB BUTTON
    document.querySelector('#close-btn').onclick = () => closeManagingTab();

    //Add function to CANCEL BUTTON
    const cancelBtn = document.querySelector('#cancel-btn');

    //Add function to BRANCH SELECT when value changed
    const selectAvailability = document.querySelector('#service-availability');
    selectAvailability.onchange = () => {handleBranchSelectChanged(chosenBrances, selectAvailability.value)}

    if(isEditing){
        //Set type select values
        document.querySelector('#service-type').value = managedService.type;

        //Add function to EDIT BUTTON
        document.querySelector('#edit-btn').onclick = () => enableForm();

        //disable editing (set all values to the initial ones)
        cancelBtn.onclick = () => {
            document.querySelector('#service-name').value = managedService.title;
            document.querySelector('#service-type').value = managedService.type;
            document.querySelector('#service-price').value = managedService.price;
            document.querySelector('#service-desc').value = managedService.description;
            document.querySelector('#service-availability').value = '';
            chosenBrances = [...managedService.availableAt];
            addBranchesToOptionContaier(chosenBrances);
            disableForm(); //disable inputs
        };

        //DELETE BUTTON
        document.querySelector('#delete-btn').onclick = () => showDeleteAlert(chosenService[0].id, chosenService[0].title);
    } else {
        enableForm();

        //close tab if adding a branch
        cancelBtn.onclick = () => closeManagingTab();
    }

    //Add function to CONFIRM BUTTON
    document.querySelector('#confirm-btn').onclick = () => {
        //get the final object for submitting to the db
        let title = document.querySelector('#service-name').value;
        let price = document.querySelector('#service-price').value;
        if(checkInputs(title, price)){
            managedService.id = '99';
            managedService.title = document.querySelector('#service-name').value;
            managedService.type = document.querySelector('#service-type').value;
            managedService.price = document.querySelector('#service-price').value;
            managedService.desc = document.querySelector('#service-desc').value;
            managedService.availableAt = [...chosenBrances];
            addEditService(managedService);
        }
    };
}
//get input content
function getInputs(service, action){
    //generate options for service types and branches
    let typeOptions = serviceTypes.map((type)=>{return `<option id='${type}' value='${type}'>${type}</option>`}).join('');
    let branchOptions = tempBranchesList.map((branch)=>{return `<option id='${branch.id}' value='${branch.id}'>${branch.name}</option>`}).join('');
    //add content to the form inputs/selects if editing a branch
    //if adding, leave the inputs blank
    let tabContent = `
            <h2> ${action > 0 ? `Service #${service.id} | ${service.title}` : `Adding a new service` }</h2>
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
                    <label class="form-label" for='service-name'>What is this service's name?</label><br>
                    <input class="form-input" maxlength=30 type="text" id="service-name" name="service-name" disabled required value='${service.title}'>
                </div>
                <div class="double-inputs">
                    <div class="selection-box">
                        <label class="form-label" for="service-type">Service type:</label><br>
                        <select class="form-select" name="service-type" id="service-type" disabled required>
                            ${typeOptions}
                        </select>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='service-price'>How much it is?</label><br>
                        <input class="form-input short" maxlength=10 type="text" id="service-price" name="service-price" disabled required value='${service.title}'>
                    </div>
                </div>
                <div class="double-inputs">
                    <div class="selection-box">
                        <label class="form-label" for="service-availability">Available at:</label><br>
                        <select class="form-select" name="service-availability" id="service-availability" disabled required>
                            <option value=''>Select a branch to add</option>
                            ${branchOptions}
                        </select>
                        <div id='selected-branches' class='option-container' name='service-availability'>
                            
                        </div>
                    </div>
                    <div class="text-input-container half">
                        <label class="form-label" for='service-desc'>Description:</label><br>
                        <input class="form-input short" maxlength=50 type="text" id="service-desc" name="service-desc" disabled required value='${service.description}'>
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
//add branch options to the option container
function addBranchesToOptionContaier(chosenBranches){
    const optionContainer = document.querySelector('#selected-branches');
    let chosenOptionContent = '';
    for(let i=0; i<chosenBranches.length; i++){
        const branch = tempBranchesList.find((branch) => branch.id == chosenBranches[i]);
        let branchName = branch.name.slice(0,7) + '...';
        chosenOptionContent += ` <div class="option" id=${branch.id}>
                            <span class="option-title">${branchName}</span>
                        </div> `;
    }
    optionContainer.innerHTML = chosenOptionContent;  
    addFunctionToOption(chosenBranches);
}
//add functions to option (allow the option to be removed when being enabled and clicked)
function addFunctionToOption(chosenBrances){
    const options = document.querySelectorAll('.option');
    for(let i=0; i<options.length; i++){
        options[i].onclick = () => handleOptionClicked(options[i].className.includes('enabled'), options[i].id, chosenBrances);
    }
}
//add chosen branches to option container/to chosen branch list when the branch select value is changed
function handleBranchSelectChanged(chosenBranches, branchId){
    if(chosenBranches.find((id) => id == branchId) === undefined && branchId != ''){
        //add the chosen branch to the chosen branch list
        chosenBranches.push(branchId);
        //update the chosen options
        addBranchesToOptionContaier(chosenBranches);
        enableMultipleSelect(); 
    }
}
//remove an option out of the chosen branches when it is clicked
function handleOptionClicked(enabled, branchId, chosenBrances){
    if(enabled){
        let index = chosenBrances.indexOf(branchId);
        chosenBrances.splice(index, 1);
        addBranchesToOptionContaier(chosenBrances);
        enableMultipleSelect();
    }
}

//enable form
function enableForm(){
    enableFormEditing();
    enableInputs();
    enableLabels();
    enableSelects();
    enableMultipleSelect();
}
//disable form
function disableForm(){
    disableFormEditing();
    disableInputs();
    disableLabels();
    disableMultipleSelect();
    disableSelects();
}

//API
//input validations
function checkInputs(title, price){
    if(title == ''){
        showNoticeAlert(`Title required. Please provide a service title`, 'failed');
        return false;
    } else if (price == ''){
        showNoticeAlert(`Price required. Please set a price for this service to continue`, 'failed');
        return false;
    }
    return true;
}

//add/edit a branch (API connection)
function addEditService(service){
    if(checkInputs(service)){
        showNoticeAlert(`The service named <b>${service.title}</b> has been added/edited`, 'successful')
        console.log(service);
    }
}






