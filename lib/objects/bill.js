export class Bill{
    #id; 
    #cusName;
    #services;
    #mobile;
    #entranceDate;
    #entranceTime;
    #branchId;
    #voucherCode;
    #payment;
    #paid;

    constructor(billObject)
    {
        this.#id = billObject != undefined ? billObject.id : '';
        this.#cusName = billObject != undefined ? billObject.cusName : '';
        this.#services = billObject != undefined ? [...billObject.services] : '';
        this.#mobile = billObject != undefined ? billObject.mobile : '';
        this.#entranceDate = billObject != undefined ? billObject.entranceDate : '';
        this.#entranceTime = billObject != undefined ? billObject.entranceTime : '';
        this.#branchId = billObject != undefined ? billObject.branchId : '';
        this.#voucherCode = billObject != undefined ? billObject.voucherCode : '';
        this.#payment = billObject != undefined ? {...billObject.payment} : ''; 
        this.#paid = billObject != undefined ? billObject.paid : '';
    }

    static getBillArray(billListJs){
        const billArr = [];
        for(let billJs of billListJs){
            const bill = new Bill(billJs);
            billArr.push(bill);
        }
        return billArr;
    }

    display(){
        console.log(this);
    }

    setServiceId(serviceIndex, serviceId){
        const modifiedService = this.#services[serviceIndex];
        modifiedService != undefined ? modifiedService.serviceId = serviceId : "";
    }

    setServiceStaff(serviceIndex, staffId){
        const modifiedService = this.#services[serviceIndex];
        modifiedService != undefined ? modifiedService.staffId = staffId : "";
    }

    setServiceDiscount(serviceIndex, discount){
        const modifiedService = this.#services[serviceIndex];
        modifiedService != undefined ? modifiedService.discount = discount : "";
    }

    setServiceNote(serviceIndex, note){
        const modifiedService = this.#services[serviceIndex];
        modifiedService != undefined ? modifiedService.note = note : "";
    }

    setVoucherCode(voucherCode){
        this.#voucherCode = voucherCode;
    }

    setPaymentType(paymentType){
        this.#payment.type = paymentType;
    }

    setPaymentAmount(finalTotal, splitCardAmount){
        switch (this.#payment.type){
            case 'card': this.#payment.cardAmount = parseFloat(finalTotal);
                         this.#payment.cashAmount = 0;
            break;
            case 'cash': this.#payment.cashAmount = parseFloat(finalTotal);
                         this.#payment.cardAmount = 0;
            break;
            case 'split': this.#payment.cardAmount = parseFloat(splitCardAmount);
                          this.#payment.cashAmount = parseFloat((finalTotal - splitCardAmount).toFixed(2));
            break;
            default: "";
        }
    }

    checkOut(){
        this.#paid = true;
    }

    uncheck(){
        this.#paid = false;
    }

    getServicesCount(){
        return this.#services.length;
    }

    getTotal(serviceList){
        let total = 0;
        this.#services.forEach((service)=> {
            const result = serviceList.find((item)=>item.id == service.serviceId);
            let finalPrice = result.price - service.discount;
            total += finalPrice;
        });
        return total;
    }

    getAllDiscount(){
        let totalDiscount = 0;
        this.#services.forEach((service)=>{
            totalDiscount += service.discount;
        });
        return totalDiscount;
    }

    getBillServices(){
        return this.#services;
    }

    getId(){
        return this.#id;
    }

    getCusName(){
        return this.#cusName;
    }

    getMobile(){
        return this.#mobile;
    }

    getStatus(){
        return this.#paid;
    }

    getEntranceDate(){
        return this.#entranceDate;
    }

    getEntranceTime(){
        return this.#entranceTime;
    }

    getVoucherCode(){
        return this.#voucherCode;
    }

    getPayment(){
        return this.#payment;
    }

    deleteService(index){
        this.#services.splice(index, 1);
    }

    addService(serviceId, staffId, discount, note){
        const newService = {
            id: 99,
            discount: discount,
            serviceId: serviceId,
            staffId: staffId,
            note: note
        };

        this.#services.push(newService);
    }
}