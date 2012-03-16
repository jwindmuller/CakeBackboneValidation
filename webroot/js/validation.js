var CakeBackboneValidation = {};
CakeBackboneValidation.Validators = {
    regex: function(text, regex) {
        return text.match(regex) !== null;
    },
    alphaNumeric: function(value) {
        return CakeBackboneValidation.Validators.regex(value, /^[0-9a-z]+/i);
    },
    between: function(value, params) {
        var length = value.length;
        return length >= params[0] && length <= params[1];
    },
    notempty: function(value) {
        return CakeBackboneValidation.Validators.regex(value, /^.+/);
    },
    blank: function(value) {
        return !CakeBackboneValidation.Validators.regex(value, /[^\s]/);
    },
    cc: function(value, params) {
        value = value.replace(/[\- ]/g, '');
        if (value.length < 13) {
            return false;
        };
        var type = params[0] || 'fast';
        var deep = params[1] || false;
        var regex = params[2];
        if (regex !== undefined) {
            if (CakeBackboneValidation.Validators.regex(value, regex)) {
                return CakeBackboneValidation.Validators.luhn(value, deep);
            }
        }
        var cards = {
            'all': {
                'amex':       /^3[4|7]\d{13}/,
                'bankcard':   /^56(10\d\d|022[1-5])\d{10}/,
                'diners':     /^(?:3(0[0-5]|[68]\d)\d{11})|(?:5[1-5]\d{14})/,
                'disc':       /^(?:6011|650\d)\d{12}/,
                'electron':   /^(?:417500|4917\d{2}|4913\d{2})\d{10}/,
                'enroute':    /^2(?:014|149)\d{11}/,
                'jcb':        /^(3\d{4}|2100|1800)\d{11}/,
                'maestro':    /^(?:5020|6\d{3})\d{12}/,
                'mc':         /^5[1-5]\d{14}/,
                'solo':       /^(6334[5-9][0-9]|6767[0-9]{2})\d{10}(\d{2,3})?/,
                'switch':   /^(?:49(03(0[2-9]|3[5-9])|11(0[1-2]|7[4-9]|8[1-2])|36[0-9]{2})\d{10}(\d{2,3})?)|(?:564182\d{10}(\d{2,3})?)|(6(3(33[0-4][0-9])|759[0-9]{2})\d{10}(\d{2,3})?)/,
                'visa':       /^4\d{12}(\d{3})?/,
                'voyager':    /^8699[0-9]{11}/
            },
            'fast': /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6011[0-9]{12}|3(?:0[0-5]|[68][0-9])[0-9]{11}|3[47][0-9]{13})/
        };
        if (type == 'all' || _.isArray(type)) {
            var returnValue = undefined;
            _.each(cards.all, function(regex, cardType) {
                if (_.isArray(type)) {
                    if (!_.contains(type, cardType)) {
                        return;
                    };
                };
                if (!returnValue && CakeBackboneValidation.Validators.regex(value, regex)) {
                    returnValue = CakeBackboneValidation.Validators.luhn(value, deep);
                };
            });
            return returnValue;
        } else {
            if (CakeBackboneValidation.Validators.regex(value, cards.fast)) {
                return CakeBackboneValidation.Validators.luhn(value, deep); 
            }
        }
        return false;
    },
    comparison: function(value, params) {
        var operator = params[0];
        if (_.isString(operator)) {
            operator = operator.toLowerCase().replace(/ |\t|\n|\r|\0|\x0B/g, '');
        };
        var checkAgainst = params[1];
        var correct = false;
        switch (operator) {
            case 'isgreater':
            case '>':
                correct = value > checkAgainst;
                break;
            case 'isless':
            case '<':
                correct = value < checkAgainst;
                break;
            case 'greaterorequal':
            case '>=':
                correct = value >= checkAgainst;
                break;
            case 'lessorequal':
            case '<=':
                correct = value <= checkAgainst;
                break;
            case 'equalto':
            case '==':
                correct = value == checkAgainst;
                break;
            case 'notequal':
            case '!=':
                correct = value != checkAgainst;
                break;
            default:
                throw {
                    name: 'ComparisonOperatorInvalid',
                    message: 'The operator ' + operator + ' is not supported by CakeBackboneValidation.Validators.comparison'
                };
                break;
        }
        return correct;
    },
    custom: function(value, params) {
        var regex = params[0];
        if (regex == undefined) {
            throw {
                name: 'MissingParameter',
                message: 'No regular expression set for CakeBackboneValidation.Validators.custom'
            };
        };
        regex = regex.replace(/^\//, '').replace(/\/$/, '');
        return CakeBackboneValidation.Validators.regex(value, new RegExp(regex));
    },
    date: function(value, params) {
        
    },
    luhn: function(value, params) {
        deep = params;
        if (_.isArray(params)) {
            deep = params[0];
        }
        if (deep !== true) {
            return true;
        }
        if (value == 0) {
            return false;
        }
        var sum = 0;
        var length = value.length;

        for (position = 1 - (length % 2); position < length; position += 2) {
            sum += parseInt(value[position]);
        }

        for (position = (length % 2); position < length; position += 2) {
            var number = parseInt(value[position]) * 2;
            sum += (number < 10) ? number : number - 9;
        }

        return (sum % 10 == 0);
    }
};