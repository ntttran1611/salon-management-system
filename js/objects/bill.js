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
        console.log(this.#services);
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