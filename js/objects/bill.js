export class Bill{
    #id; 
    #cusName;
    #services;
    #mobile;
    #entranceDate;
    #entranceTime;
    #branchId;
    #voucherId;
    #payment;
    #paid;

    constructor(billObject)
    {
        this.#id = billObject.id;
        this.#cusName = billObject.cusName;
        this.#services = billObject.services;
        this.#mobile = billObject.mobile;
        this.#entranceDate = billObject.entranceDate;
        this.#entranceTime = billObject.entranceTime;
        this.#branchId = billObject.branchId;
        this.#voucherId = billObject.voucherId;
        this.#payment = billObject.payment; 
        this.#paid = billObject.paid;
    }

    display(){
        console.log(this.#id);
    }

    //generate bill info to html
    generateBillContent(serviceList, staffList){
        //get current total of the bill
        let total = this.#getTotal(serviceList);
        return `
            <h2><b style="color: black">Bill ID:</b> ${this.#id} | <b style="color: black">Client's name:</b> ${this.#cusName} | <b style="color: black">Contact:</b> ${this.#mobile} | <b style="color: black">Come at:</b> ${this.#entranceDate}, ${this.#entranceTime}</h2>
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
                    ${this.getRows(serviceList, staffList)}
                </tbody>
            </table>
            <div class="bill-footer">
                <span style="margin-left: 20px">Total: <b style="color: #BBA366">$AU ${total}</b> | Status: <b style="color: ${this.#paid ? "#4C7A6F" : "#C97C82"}">${this.#paid ? 'Paid' : 'Unpaid'}</b></span>
                <div style="display: flex; margin-right: 20px; margin-bottom: 13px">
                    <button id="check-out-btn" class="square-btn confirm-btn">${this.#paid ? "Uncheck this bill" : "Check out"}</button>
                    <button id="delete-btn" class="square-btn cancel-btn">Delete</button>
                </div>
            </div>
        `;
    }

    //get row content for the service table
    getRows(serviceList, staffList){
        const serviceOptions = serviceList.map((service)=>{
            return `<option value=${service.id}>${service.title}</option>`
        }).join('');
        const staffOptions = staffList.map((staff)=>{
            return `<option value=${staff.id}>${staff.firstName} ${staff.lastName}</option>`
        }).join('');
        let rowContent = this.#services.map((item) => {
            const service = serviceList.find((service)=>service.id == item.serviceId);
            return `<tr>
                <td><select id=${item.id} class="table-select service" ${this.#paid ? "disabled" : ''}>${serviceOptions}</select></td>
                <td>${service.price}</td>
                <td><select id=${item.id} class="table-select staff" ${this.#paid ? "disabled" : ''}>${staffOptions}</select></td>
                <td><input class="table-input" type="text" name="bill-discount" id="${item.id}" value='${item.discount == 0 ? "0" : item.discount}' placeholder="0" ${this.#paid ? "disabled" : ''}></td>
                <td>${service.price - item.discount}</td>
                <td><input class="table-input" type="text" name="bill-note" id="${item.id}" value='${item.note == "" ? "" : item.note}' placeholder="Enter something to describe this bill" ${this.#paid ? "disabled" : ''}></td>
                <td>
                    <button id="${item.id}" class="round-btn delete-table-btn">
                        <i class="fa-solid fa-trash fa-xs"></i> 
                        <span class="tooltiptext">Delete</span>
                    </button> 
                </td>
            </tr>`
        }).join('');
        if(!this.#paid)
        {
            rowContent += `<tr>
                <td><select class="table-select service inactive">${serviceOptions}</select></td>
                <td class="inactive">0</td>
                <td><select class="table-select staff inactive">${staffOptions}</select></td>
                <td><input class="table-input inactive" type="text" name="bill-discount" value="" placeholder="0"></td>
                <td class="inactive">0</td>
                <td><input class="table-input inactive" type="text" name="bill-note" id="bill-note" value="" placeholder="Enter something to describe this bill"></td>
                <td>
                    <button class="round-btn sm add-table-btn">
                        <i class="fa-solid fa-plus fa-xs"></i>
                        <span class="tooltiptext">Add new</span> 
                    </button> 
                </td>
            </tr>`;
        }
        return rowContent;
    }

    #getTotal(serviceList){
        let total = 0;
        this.#services.forEach((service)=> {
            const result = serviceList.find((item)=>item.id == service.serviceId);
            total += result.price;
        });
        return total;
    }

    getBillServices(){
        return this.#services;
    }

    setSingleService(serviceId, changedService){
        const setService = this.#services.find((item) => item == serviceId);
        setService = changedService;
    }
}