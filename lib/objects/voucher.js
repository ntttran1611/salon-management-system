export class Voucher{
    #id;
    #code;
    #buyerName;
    #price;
    #issueDate;
    #expiryDate;
    #note;
    #mobile;
    #used

    constructor(voucherJson){
        this.#id = voucherJson != undefined ? voucherJson.id : '';
        this.#code = voucherJson != undefined ? voucherJson.code : '';
        this.#buyerName = voucherJson != undefined ? voucherJson.buyerName : '';
        this.#price = voucherJson != undefined ? voucherJson.price : '';
        this.#issueDate = voucherJson != undefined ? voucherJson.dateOfIssue : '';
        this.#expiryDate =voucherJson != undefined ?  voucherJson.expiry : '';
        this.#note = voucherJson != undefined ? voucherJson.note : '';
        this.#mobile = voucherJson != undefined ? voucherJson.mobile : '';
        this.#used = voucherJson != undefined ? voucherJson.used : false;
    }

    toJson(){
        return {
            id: this.#id,
            code: this.#code,
            buyerName: this.#buyerName,
            price: this.#price,
            dateOfIssue: this.#issueDate,
            expiry: this.#expiryDate,
            note: this.#note,
            mobile: this.#mobile,
            used: this.#used,
        };
    }

    clone(){
        return new Voucher(this.toJson());
    }

    setStatus(used){
        this.#used = used;
    }

    setCode(){
        let code = '';
        const alphanumericArray = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
        ];

        for(let i=0; i < 10; i++){
            let randomInt = Math.floor(Math.random() * (alphanumericArray.length /*max*/ - 0 /*min*/ + 1)) + 0;
            code += alphanumericArray[randomInt];
        }
        this.#code = code;
    }

    setBuyerName(name){
        this.#buyerName = name;
    }

    setPrice(price){
        this.#price = price;
    }

    setIssueDate(issueDate){
        this.#issueDate = issueDate;
    }

    setExpiryDate(expiryDate){
        this.#expiryDate = expiryDate;
    }

    setMobile(mobile){
        this.#mobile = mobile;
    } 

    setNote(note){
        this.#note += `${note}<br>`;
    }

    static getVoucherArray(voucherListJs){
        const voucherArr = [];
        for(let voucherJs of voucherListJs){
            const voucher = new Voucher(voucherJs);
            voucherArr.push(voucher);
        }
        return voucherArr;
    }

    getStatus(){
        if(this.#used){ //voucher is used
            if(new Date() > new Date(this.#expiryDate)){ //voucher is used and expired
                return 'permaInactive';   
            }
            return 'inactive';
        } 
        else{
            if(new Date() > new Date(this.#expiryDate)){ //voucher is not used but expired
                return 'warning'; 
            }
            else {
                return 'active'; //voucher has been unused
            }
        }
    }

    getUsedStatus(){
        return this.#used;
    }

    getId(){
        return this.#id;
    }

    getCode(){
        return this.#code;
    }

    getBuyerName(){
        return this.#buyerName;
    }

    getPrice(){
        return this.#price;
    }

    getIssueDate(){
        return this.#issueDate;
    }

    getExpiryDate(){
        return this.#expiryDate;
    }

    getMobile(){
        return this.#mobile;
    }

    getNote(){
        return this.#note;
    }

    getUsedStatus(){
        return this.#used;
    }

    getRemaining(billTotal){
        return this.#price <= billTotal ? 0 : parseFloat((this.#price - billTotal).toFixed(2));
    }
}