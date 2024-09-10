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

    setSingleService(serviceIdOnBill, newService){
        const modifiedService = this.#services.find((item) => item.id == serviceIdOnBill);
        modifiedService = newService;
    }

    setServiceId(serviceIdOnBill, serviceId){
        const modifiedService = this.#services.find((item) => item.id == serviceIdOnBill);
        modifiedService.serviceId = serviceId;
    }

    setServiceStaff(serviceIdOnBill, staffId){
        const modifiedService = this.#services.find((item) => item.id == serviceIdOnBill);
        modifiedService.staffId = staffId;
    }

    setServiceDiscount(serviceIdOnBill, discount){
        const modifiedService = this.#services.find((item) => item.id == serviceIdOnBill);
        modifiedService.discount = discount;
    }

    setServiceNote(serviceIdOnBill, note){
        const modifiedService = this.#services.find((item) => item.id == serviceIdOnBill);
        modifiedService.note = note;
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
}