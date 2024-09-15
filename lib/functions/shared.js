//ENABLE/DISABLE INPUT ELEMENTS
//FORM CONTROLLER
export function enableFormEditing(){
    //show functional buttons of the form
    const confirmBtns = document.querySelector('.confirm-btns');
    confirmBtns.style.display = 'flex';
    confirmBtns.style.justifyContent = 'space-between';

    //set height to fit the content
    const col2 = document.querySelector('.col-2');
    col2.style.height = col2.scrollHeight + 'px';
}
export function disableFormEditing(){
    //hide functional buttons of the form
    const confirmBtns = document.querySelector('.confirm-btns');
    confirmBtns.removeAttribute('style');
    
    //set height to fit the content
    const col2 = document.querySelector('.col-2');
    col2.style.height = (col2.scrollHeight - 54) + 'px';
}
//SELECT SWITCHER
export function enableSelects(){
    const formSelects = document.querySelectorAll(".form-select");
    if(formSelects.length > 0){
        for (let i = 0; i < formSelects.length; i++) {;
            formSelects[i].removeAttribute('disabled');
        }
    }
}

export function disableSelects(){
    const formSelects = document.querySelectorAll(".form-select");
    if(formSelects.length > 0){
        for (let i = 0; i < formSelects.length; i++) {
            formSelects[i].setAttribute('disabled', 'disabled');
        }
    }
}
//INPUTS SWITCHER
export function enableInputs(){
    const formInputs = document.querySelectorAll(".form-input");
    if(formInputs.length > 0){
        for (let i = 0; i < formInputs.length; i++) {
            formInputs[i].style.borderColor = "#989898";
            formInputs[i].style.color = "black";
            formInputs[i].removeAttribute('disabled');
        }
    }
}

export function disableInputs(){
    const formInputs = document.querySelectorAll(".form-input");
    if(formInputs.length > 0){
        for (let i = 0; i < formInputs.length; i++) {
            formInputs[i].style.borderColor = "#B7B7B7";
            formInputs[i].style.color = "#B7B7B7";
            formInputs[i].setAttribute('disabled', 'disabled');
        }
    }
}
//LABEL SWITCHER
export function enableLabels(){
    const formLabels = document.querySelectorAll(".form-label");
    if(formLabels.length > 0){
        for (let i = 0; i < formLabels.length; i++) {
            formLabels[i].style.color = "black";
        }
    }
}

export function disableLabels(){
    const formLabels = document.querySelectorAll(".form-label");
    if(formLabels.length > 0){
        for (let i = 0; i < formLabels.length; i++) {
            formLabels[i].style.color = "#B7B7B7";
        }
    }
}
//MULTIPLE-OPTION SELECT SWITCHER
//enable multiple-option select
export function enableMultipleSelect() {
    const options = document.querySelectorAll(".option");
    if(options.length > 0){
        for (let i = 0; i < options.length; i++) {
            options[i].style.backgroundColor = "#BBA366";
            options[i].style.color = "#FFFFFF";
            options[i].className += " enabled";
        }
    }
}
//disable multiple-option select
export function disableMultipleSelect() {
    const options = document.querySelectorAll(".option");
    if(options.length > 0){
        for (let i = 0; i < options.length; i++) {
            options[i].style.backgroundColor = "#B7B7B7";
            options[i].style.color = "#989898";
            options[i].className = "option";
        }
    }
}

//TOGGLE SWITCHER
export function enableToggle(){
    const toggle = document.querySelector(".toggle");
    if(toggle !== null && toggle !== undefined){
        toggle.className += " enabled";
    }
}

//disable toggle
export function disableToggle(){
    const toggle = document.querySelector(".toggle");
    if(toggle !== null && toggle !== undefined){
        toggle.className = "toggle";
    }
}

//close the managing tab(COL-2)
export function closeManagingTab(){
    //set height back to default
    const col2 = document.querySelector('.col-2');
    col2.style.height = '100px';

    //set content back to default
    document.querySelector('.col-2').innerHTML = `
        <h2>No item selected</h2>
        <p class="note-lg">No item selected</>
    `;
}

//LIST/SELECT
export const startTimes = ['9:00', '9:15', '9:30', '9:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00'];
export const endTimes = ['15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30'];
//find corresponding values on select's option list
export function addValueToSelectOption(selectId, value){
    const options = document.querySelector(`#${selectId}`).children;
    for (let i = 0; i < options.length; i++){
        options[i].id == value ? options[i].setAttribute('selected', 'selected') : null;
    }
}

//TIME ADAPTER
export function formatDate(date){
    if(date != null) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    return null;
}

export function getNumberFromAmountString(input){
    return input.replace('$', '');
}

export function getStringFormat(number){
    const numberRegex = /^\d+$/;
    const floatWith1DecimalsRegex = /^\d+\.\d{1}$/;
    const floatWith2DecimalsRegex = /^\d+\.\d{2}$/;
    if(numberRegex.test(number)){
        return `$${number}.00`;
    } else if (floatWith1DecimalsRegex.test(number)){
        return `$${number}0`;
    } else if(floatWith2DecimalsRegex.test(number)){
        return `$${number}`;
    } else {
        return false;
    }
}
