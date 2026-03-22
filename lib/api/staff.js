export class Staff {
    #id;
    #firstName;
    #lastName;
    #note;
    #active;

    constructor(staffJson){
        this.#id = staffJson != undefined ? staffJson.id : '';
        this.#firstName = staffJson != undefined ? staffJson.firstName : '';
        this.#lastName = staffJson != undefined ? staffJson.lastName: '';
        this.#note = staffJson != undefined ? staffJson.note : '';
        this.#active = staffJson != undefined ? staffJson.active : true;
    }

    toJson(){
        return {
            id: this.#id,
            firstName: this.#firstName,
            lastName: this.#lastName,
            note: this.#note,
            active: this.#active
        }
    }

    clone(){
        return new Staff(this.toJson());
    }

    static getStaffObjList(staffJsList){
        const staffObjArr = [];
        for(let staff of staffJsList){
            staffObjArr.push(new Staff(staff));
        }
        return staffObjArr;
    }

    getId(){
        return this.#id;
    }

    getFirstName(){
        return this.#firstName;
    }

    getLastName(){
        return this.#lastName;
    }

    getNote(){
        return this.#note;
    }

    getStatus(){
        return this.#active ? 'active' : 'inactive';
    }

    setFirstName(firstName){
        this.#firstName = firstName;
    }

    setLastName(lastName){
        this.#lastName = lastName;
    }

    setNote(note){
        this.#note = note;
    }

    setStatus(status){
        this.#active = status == 'active' ? true : false;
    }
}