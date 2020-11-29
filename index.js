class Validator {
    /**
     * 
     * @param { Object || Array } src HTML form || array or HTML input 
     */
    constructor(src) {
        this.user_defined_rules = {};
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

    validate(rule) {
        let rules = this._getArrayOfObject(rule);
        for(let i = 0; i < rules.length; i++) {
            let is_valid = this._isValid(rules[i])
            if(!is_valid.valid) {
                this._objPush(this.errors, is_valid.error);
            }
        }
        if(!Object.keys(this.errors).length) {
            return true;
        }
        return false;
    }

    customRules(rules) {
        this.user_defined_rules = rules;
    }

    _isAllInputElement(inputs) {
        inputs = Array.isArray(inputs) ? inputs : [inputs];
        for(let i = 0; i < inputs.length; i++) {
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
        if(indx > -1) {
            matched = matched[0].slice(1, matched[0].length - 1)
            matched = matched.split(',');
        }
        return {
            method: str,
            parameter: matched
        }
    }

    _call(rules, value) {
        let obj = {};
        for(let i = 0; i < rules.length; i++) {
            let prop = rules[i].match(/\w+/)[0];
            let getFO = this._getParameters(this._camelCase(rules[i])), method = getFO.method, param = getFO.parameter;
            let rules_methods = this.defaultRules();
            let bool = param ? rules_methods[method](value, ...param) : rules_methods[method](value);
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
                let find = rules.find(el => el.match(/\w+/)[0] === prop)
                let err_obj = this.defaultErrors(key, find, prop, user_defined_err, form_value);
                errors[key] =  err_obj;
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

    

    defaultRules() {
        return {
            required(value) {
                return value?.trim().length > 0;
            },
        
            minLength(value, length) {
                return value.length >= length;
            },

            maxLength(value, length) {
                return value.length <= length;
            },

            numeric(value) {
                return (/^(\+|-)?(\d)+$/ig).test(value);
            },
            wholeNumber(value) {
                return (/^\d+$/ig).test(value);
            },
            wholeNumberNoPreZero(value) {
                return (/^([1-9]\d*)$/ig).test(value);
            },
            alpha(value) {
                return (/^([a-z])+$/ig).test(value);
            },
            alphaSpace(value) {
                return (/^([a-z\s\r\t])+$/ig).test(value);
            },
            alphaDash(value) {
                return (/^([a-z-_])+$/ig).test(value);
            },
            alphaNumeric(value) {
                return (/^([a-z\d])+$/ig).test(value);
            },
            alphaNumericSpace(value) {
                return (/^([a-z\d\s\r\t])+$/ig).test(value);
            },
            alphaNumericDash(value) {
                return (/^([a-z\d_-])+$/ig).test(value);
            },
            alphaNumSym(value) {
                return (/^([a-z\d\_\-\!\$\#\@\.\|\*\%\\])+$/ig).test(value);
            },
            lessThan(value, length) {
                return value.length < length;
            },
            lessThanEqualsTo(value, length) {
                return value.length <= length;
            },
            greaterThan(value, length) {
                return value.length > length;
            },
            greaterThanEqualsTo() {
                return value.length >= length;
            },
            exactLength(value, length) {
                return value.length === length;
            },
            matches: (value, to_match) => {
                let obj = this._dataObj;

                if(!obj.hasOwnProperty(to_match)) {
                    return !!!!false;
                }
                
                return value === obj[to_match];
            },
            noMatch: (value, to_match) => {
                let obj = this._dataObj;

                if(!obj.hasOwnProperty(to_match)) {
                    return !!!false;
                }
                
                return value !== obj[to_match];
            },
            validEmail(value) {
                return (/^[a-z0-9\_\-.]+@[a-z0-9\_\-]+\.[a-z]{2,}$/ig).test(value);
            },
            inList(value, ...list) {
                list = list.split(',').map(el => el);
                return list.includes(value);
            }
            // ...this.user_defined_rules
        }
    }
    defaultErrors(f, v, key, user_defined_err, form_value) {
        console.log(form_value)
        let param  = this._getParameters(v).parameter;
        if(Array.isArray(param)) param = param[0]
        let obj =  {
            required: `${f} field is required`,
            min_length: `${f} field is too short`,
            max_length: `${f} field is too long`,
            numeric: `${f} field must be a numeric value`,
            whole_number: `${f} field must be a whole number`,
            whole_number_no_pre_zero: `${f} field can only contain counting digits`,
            alpha: `${f} field must contain only alphabets`,
            alpha_space: `${f} field can contain only alphabets and spaces`,
            alpha_dash: `${f} field can only contain alphabets and dashes`,
            alpha_numeric: `${f} field can only contain alphabets and number`,
            alpha_numeric_space: `${f} field can only contain alphabets, numbers, and spaces`,
            alpha_numeric_dash: `${f} field can only contain alphabets, numbers, and dashes`,
            alpha_num_sym: `${f} field can only contain alphabets, numbers and one of the following symbol: '!$#@.|*%\'`,
            less_than: `${f} value must be less than ${param} chars`,
            less_than_equals_to: `${f} value must be less than or equals to ${param} chars`,
            greater_than: `${f} value must be greater than ${param} chars`,
            greater_than_equals_to: `${f} value must be greater than or equals to ${param} chars`,
            exact_length: `${f} value must be ${param} chars long`,
            matches: `${f} field value does not match ${param} field value`,
            no_match: `${f} must not be the same value with ${param} field`,
            valid_email: `${f} field must contain a valid email address`,
            in_list: `${form_value} is not a valid value`,
            ...user_defined_err

        }

        return obj[key];
    }
} 