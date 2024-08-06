import { customerList } from "../data/customer-list.js";
import { serviceList } from "../data/service-list.js";

const tempCustomerList = [...customerList];
let serviceListWithQuantity = [];
serviceListWithQuantity = serviceList.map((service) => {
    return {
        id: service.id,
        title: service.title,
        description: service.description,
        keyword: service.keyword,
        quantity: 0
    };
});

const numberRegex = /^(04)\d{8}$/;
let choosingService = false;

//JSON data
let customer;
let newBill;

//Get Input Elements
const phoneNumberInput = document.querySelector('.phone-number');
const firstNameInput = document.querySelector('.first-name');
const lastNameInput = document.querySelector('.last-name');

//Get Button Elements
const enterBtn = document.getElementById('enter');
const chooseServiceBtn = document.getElementById('choose-service');
const confirmBtn = document.getElementById('confirm');

//Get others
const phoneErrText = document.getElementById('phone-err');
const fnErrText = document.getElementById('fn-err');
const lnErrText = document.getElementById('ln-err');

const row2 = document.getElementById('row-2');
const col2 = document.querySelector('.col-2');
const list = document.getElementById('service-list');

//FUNCTIONS
function handleEnterButtonClicked() {
    if(numberRegex.test(phoneNumberInput.value)){
        //console.log(phoneNumberInput.value);
        phoneErrText.innerHTML = ''

        customer = tempCustomerList.find((cus) => cus.phone == phoneNumberInput.value);
        row2.style.display = 'flex';

        if(customer !== undefined) {
            firstNameInput.value = customer.firstName;
            lastNameInput.value = customer.lastName;

            firstNameInput.setAttribute('disabled', true);
            lastNameInput.setAttribute('disabled', true);
        } else {
            if(!choosingService){
                firstNameInput.value = '';
                lastNameInput.value = '';
                firstNameInput.removeAttribute('disabled');
                lastNameInput.removeAttribute('disabled');
            } else {
                firstNameInput.setAttribute('disabled', true);
                lastNameInput.setAttribute('disabled', true);
            }
        }
    }
    else {
        phoneErrText.innerHTML = 'Invalid phone number';
        //console.log('Invalid phone number');
    }
}

function displayServiceList() {
    list.innerHTML = serviceListWithQuantity.map((service) => {
        return `<li key=${service.id}>
            <div class='service'>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            </div>
            <div class='control-button'>
                <button id=${service.id} class="decrease">-</button>
                <p id=${service.id} class="quantity">${service.quantity}</p>
                <button id=${service.id} class="increase">+</button>
            </div>
        </li>`;
    }).join('');
}

function quantityHandler(serviceID, action) {
    const service = serviceListWithQuantity.find((service) => service.id == serviceID);
    let quantity = service.quantity;
    if(action == 'increase') {
        quantity++;
    } else if (action == 'decrease' && quantity > 0) {
        quantity--;
    }
    serviceListWithQuantity[serviceID].quantity = quantity;
    displayServiceList();
}

function handleChooseSerivceButtonClicked() {
    if(firstNameInput.value != '' && lastNameInput.value != ''){
        choosingService = true;
        col2.style.display = 'flex';
        displayServiceList();
        phoneNumberInput.setAttribute('disabled', true);
        firstNameInput.setAttribute('disabled', true);
        lastNameInput.setAttribute('disabled', true);

        fnErrText.innerHTML = '';
        lnErrText.innerHTML = '';

        if(customer !== undefined){
            customer = {
                id: 99,
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                phone: phoneNumberInput.value
            }
        }

    } else if (firstNameInput.value == '') {
        fnErrText.innerHTML = 'Your first name required';
    } else if (lastNameInput.value == '') {
        lnErrText.innerHTML = 'Your last name required';
    }
}

function handleConfirmButtonClicked(success) {
    let choosenServices = serviceListWithQuantity.filter((service) => service.quantity > 0);

    newBill = {
        billID: '001',
        clientID: customer.id,
        entranceTime: Date.now(),
        services: choosenServices
    };

    if(newBill !== undefined) {
        window.location.replace(`confirmation.html?billID=${newBill.billID}`);
    } else {
        window.location.replace('confirmation.html');
    }
    
    console.log(newBill);
}

//EVENTS
enterBtn.addEventListener('click', handleEnterButtonClicked);
chooseServiceBtn.addEventListener('click', handleChooseSerivceButtonClicked);
confirmBtn.addEventListener('click', handleConfirmButtonClicked);
document.addEventListener('click', function(e) {
    if(e.target.getAttribute('class') == 'increase' || e.target.getAttribute('class') == 'decrease') {
        quantityHandler(e.target.getAttribute('id'), e.target.getAttribute('class'));
    }
})

