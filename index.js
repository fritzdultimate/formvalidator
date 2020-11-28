let i, obj;
class Validator {
    /**
     * 
     * @param { Object || Array } src HTML form || array or HTML input 
     */
    constructor(src) {
        this.errors = {};
        this._ISFORM = src instanceof HTMLFormElement;
        this._ISINPUTLIST = !this._ISFORM ? this._isAllInputElement(src) : false;
        this._ISFORMDATA = src instanceof FormData;
        src = this._ISINPUTLIST ? (Array.isArray(src) ? src : [src]) : src;

        if(!this._ISFORM && !this._ISINPUTLIST && !this._ISFORMDATA) {
            throw new Error('Validator expect an html form or formData or an array of html input forms.')
        }
        this._dataObj = this._ISFORM ? this._getFormEntries(src) : this._ISFORMDATA  ? this._getFormDataEntries(src) : this._getInputEntries(src);

        
    }

    _isAllInputElement(inputs) {
        inputs = Array.isArray(inputs) ? inputs : [inputs];
        for(i = 0; i < inputs.length; i++) {
            if(!(inputs[i] instanceof HTMLInputElement)) {
                return false;
            }
        }
        return true;
    }
    _getFormDataEntries(src) {
        let obj = {};
        for(let arr of src.entries()) {
            obj[arr[0]] = arr[1];
        }
        return obj;
    }
    _getFormEntries(src) {
        let obj = {};
        let elems = src.elements;
        for(let i = 0; i < elems.length; i++) {
            console.dir(elems[i])
            obj[elems[i].name] = elems[i].value;
        }
        return obj;
    }
    _getInputEntries(inputs) {
        let obj = {};
        for (let i = 0; i < inputs.length; i++) {
            obj[inputs[i].name] = inputs[i].value;
        }
        return obj;
    }

    _getArrayOfObject(obj) {
        let arr = [];
        for(let prop in obj) {
            arr.push({
                [prop]: obj[prop]
            })
        }

        return arr;
    }

    _objPush(target, obj) {
        for( let prop in obj ) {
            target[prop] = obj[prop];
        }
    }

    _find(target, needle) {
        return target[needle];
    }

    validate(rule) {
        let rules = this._getArrayOfObject(rule);
        for(let i = 0; i < rules.length; i++) {
            let is_valid = this._isValid(rules[i])
            if(!is_valid.valid) {
                this._objPush(this.errors, is_valid.error);
            }
        }
        if(!this.errors) {
            return true;
        }
        return false;
    }

    _camelCase(str) {
        while(str.match(/_/)) {
            let regex = str.match(/_/);
            let new_str = str.slice(0, regex.index) + str.slice(regex.index + 1, regex.index + 2).toUpperCase() + str.slice(regex.index + 2, str.lenght);
            str = new_str;
        }
        return str;
    }

    _getParameters(str) {
        let matched = str.match(/\[.+\]/);
        let indx = matched?.index;
        str = typeof indx === 'number' ? str.slice(0, indx) : str;
        return {
            method: str,
            parameter: JSON.parse(matched)
        }
    }

    _call(rules, value) {
        let obj = {};
        for(let i = 0; i < rules.length; i++) {
            let prop = rules[i].match(/\w+/)[0];
            let getFO = this._getParameters(this._camelCase(rules[i])), method = getFO.method, param = getFO.parameter;

            let bool = param ? this[method](value, ...param) : this[method](value);
            if(!bool) {
                return {
                    [prop] : bool
                }
            }
            obj[prop] = bool;
        }

        return obj;
    }

    _merge(target, obj) {
        for(let prop in obj) {
            if(!target.hasOwnProperty(prop)) {
                target[prop] = obj[prop];
            }
        }

        return target;
    }

    _isValid(rule) {
        let value = Object.values(rule)[0], key = Object.keys(rule)[0], rules = value?.rules?.split('|');
        if( !Object.keys(value).length ) {
            throw new Error('rules expect object with two properties, "rules" and "errors", none given')
        } else if(!rules) {
            throw new Error('rules is missing for form validation');
        }
        let form_value = this._find(this._dataObj, key);
        let caller = this._call(rules, form_value);
        let errors = {};
        for(let prop in caller) { 
            if(!caller[prop]) { 
                let user_defined_err = rule[key].errors ? rule[key].errors : {};
                let merged_err_obj = this._merge(user_defined_err, this.DefaultErrors);
                // let err = rule[key].errors ? rule[key].errors[prop] : this.DefaultErrors[prop]
                errors[key] =  merged_err_obj[prop];
            }
        }
        return {
            valid: Object.keys(errors).length ? false : true,
            error: {
                ...errors
            }
        }
    }

    // Default Validation utility functions

    required(value) {
        return value?.trim().length > 0;
    }

    minLength(value, length) {
        return value.trim().length >= length;
    }

    get DefaultErrors() {
        return {
            required: 'This field is required!',
            min_length: 'Too short'
        }
    }
}