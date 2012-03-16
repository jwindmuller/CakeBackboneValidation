/**
 * Backbone Model :modelName
 * 
 * This model represents the CakePHP model and it's validation
 **/
var :modelName = Backbone.Model.extend({
    /**
     * [generated code] List of fields in the model.
     * 
     * @see Validation::__generateScriptFile
     **/    
    fields: :fields,
    /**
     * [generated code] Model's Validation rules translated from the CakePHP model.
     * 
     * @see Validation::__generateScriptFile
     **/    
    validation: :validation,
    /**
     * Executes the validation on the fields.
     * 
     * @see Validation::__generateScriptFile
     * 
     * @params model attributes (fields) from the form.
     * @params options for validation, allows the model to tell if it should validate only one field or all.
     * @returns array of erros, true in case of no errors.
     **/   
    validate: function(attrs, options) {
        var validationErrors = [];
        _.each(attrs, function(obj, iterator, context) {
            if (iterator == options.fieldName) {
                var error = this.validateField(iterator, obj);
                if (error) {
                    validationErrors.push(error);
                };
            };
        }, this);
        if (_.isEmpty(validationErrors)) return true;
        return validationErrors;
    },
    /**
     * Runs the validation rules for one field.
     * 
     * @see Validation::__generateScriptFile
     * @see CakeBackboneValidation.Validators (validation.js)
     * 
     * @params field field name to validate
     * @params fieldValue value to be assigned.
     * @returns error object wit keys {field, valid, message} or undefined if no errors.
     **/
    validateField: function(field, fieldValue) {
        var validators = this.validation[field];
        var validationError = undefined;
        for (var i = 0; i < validators.length; i++) {
            var rule = validators[i].rule;
            var params = [];
            if (_.isArray(rule)) {
                var count = rule.length;
                _.each(rule, function(obj, iterator, context) {
                    if (iterator > 0) {
                        params.push(obj);
                    };
                });
                rule = rule[0];
            }
            var validationFunction = CakeBackboneValidation.Validators[rule];
            if (validationFunction) {
                var valid = validationFunction(fieldValue, params);
                if (!valid) {
                    validationError =  {
                        'field': field,
                        'message': validators[i].message
                    };
                    break;
                }
            } else {
                console.debug('skipping ' + rule);
            }
        };
        return validationError;
    }
});

/**
 * Backbone View :modelNameView
 * 
 * This view represents the html form for edit or add actions (works for both).
 **/
var :modelNameView = Backbone.View.extend({
    /**
     * Main element of the view (the html form element).
     * 
     * Because this view is designed to work for add and edit forms
     * the element is calculated by looking at the parent of the fields.
     **/
    el: (function() {
        var formElements = :formElements;
        for (var i = 0; i < formElements.length; i++) {
            var formElem = $(formElements[i]).parentsUntil('form').parent('form');
            if (formElem.length == 1) {
                return '#' + formElem.attr('id');
            };
        };
    })(),
    /**
     * [generated code] Declarative list of events. 
     * 
     * @see: Validation::__generateViewEventsCode
     **/
    events: {:viewEvents},
    /**
     * [generated code] Callback functions used on the list of events. 
     * 
     * @see: Validation::__generateViewActionsCode
     **/
    :viewActions
    /**
     * Special viee action to handle form submit validiation.
     **/
    submitForm : function() {
        console.debug(this.model.attributes);
        console.debug('submit');
        return false;
    },
    /**
     * View initialization
     **/
    initialize: function() {
        this.model = new :modelName({
            // [generated code] @see Validation::__generateModelFieldInitCode
            :modelFieldInit
        });
        // [generated code] @see Validation::__generateViewInitializeCode
        :viewInitialize
        this.model.view = this;
    },
    /**
     * Hide a field's error div and class.
     * 
     * @see Validation::__generateViewActionsCode
     **/
    hideError:function(field) {
        var elements = this.getFieldDivs(field);
        elements.fieldDiv.removeClass('error');
        elements.errorMessageDiv.text('').hide();
    },
    /**
     * Show a field's error div and class.
     *
     **/
    showError: function(field, message) {
        var elements = this.getFieldDivs(field);
        elements.fieldDiv.addClass('error');
        elements.errorMessageDiv.text(message).show();
    },
    /**
     * Returns a field's parent div and corresponding error div (jQuery Objects).
     **/
    getFieldDivs: function(field) {
        var $fieldDiv = $('#' + field).parent();
        var $errorMessageDiv = $fieldDiv.children('.error-message');
        if ($errorMessageDiv.length == 0) {
            $errorMessageDiv = $('<div class="error-message" />');
            $fieldDiv.append($errorMessageDiv);
        }
        return {
            fieldDiv: $fieldDiv,
            errorMessageDiv: $errorMessageDiv
        };
    },
    /**
     * Callback function to let the view know when a validation error was found.
     *
     * @see Validation::__generateViewActionsCode
     **/
    validationErrorFound: function(model, errors) {
        for (var i = errors.length - 1; i >= 0; i--) {
            var error = errors[i];
            if (error != undefined) {
                var field = error.field;
                var message = error.message;
                this.showError(field, message);
            }
        };
    },
});

window.:modelNameView = new :modelNameView();


