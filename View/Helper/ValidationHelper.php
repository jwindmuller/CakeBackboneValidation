<?php
App::uses('AppHelper', 'View/Helper');
App::uses('Folder', 'Utility');
App::uses('File', 'Utility');
App::uses('ValidationChacheFolderException', 'Validation.Lib');

class ValidationHelper extends AppHelper {

    public $helpers = array('Html', 'Js');
    private $output;
    private $modelTemplate;

    public function __construct(View $View, $settings = array()) {
        parent::__construct($View, $settings);
        $data = $this->_View->Form->data;
        $pluginPath = App::pluginPath('CakeBackboneValidation');
        $this->output = $pluginPath  . 'webroot' . DS . 'js' . DS . 'cjs' . DS;
        $dir = new Folder($this->output, true, 0644);
        $errors = $dir->errors();
        if (!empty($errors)) {
            throw new ValidationChacheFolderException($this->output);
        }
        $this->modelTemplate = file_get_contents( $pluginPath . 'Lib' . DS . 'tjs' . DS . 'modelTemplate.js' );
    }

    public function beforeLayout($layoutFile) {
        if (!isset($this->request->params['models'])) {
            return;
        }
        $loadedModels = $this->request->params['models'];
        $this->Html->script('https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js', array('block' => 'scripts_for_bottom'));
        $this->Html->script('/CakeBackboneValidation/js/underscore.js', array('block' => 'scripts_for_bottom'));
        $this->Html->script('/CakeBackboneValidation/js/backbone.js', array('block' => 'scripts_for_bottom'));
        $this->Html->script('/CakeBackboneValidation/js/Validation.js', array('block' => 'scripts_for_bottom'));
        foreach ($loadedModels as $modelName => $model) {
            $this->__generateScriptFor($modelName);
            $this->Html->script('/CakeBackboneValidation/js/cjs/' . Inflector::underscore( $modelName ) . '.js', array('block' => 'scripts_for_bottom'));
        }
    }

    private function __generateScriptFor($modelName) {
        $model = classRegistry::init($modelName);
        $validation = $model->validate;
        $jsFields = $jsValidations = array();

        foreach ($validation as $field => $validationDefs) {
            $jsFields[] = $modelName . Inflector::camelize($field);
            foreach ($validationDefs as $i => $validationDef) {
                if (!is_array($validationDef)) {
                    $validationDef = array('rule' => $validationDef);
                }
                $jsValidations[$modelName . Inflector::camelize($field)][] = $validationDef;
            }

        }
        $this->__generateScriptFile($modelName, $jsValidations, $jsFields);
    }

    private function __generateScriptFile($modelName, $jsValidations, $jsFields) {
        $validation = $this->Js->object($jsValidations);
        $fields = $this->Js->object($jsFields);
        $formElements = array();
        foreach ($jsFields as $field) {
            $formElements[] = '#' . $field;
        }
        $formElements = $this->Js->object($formElements);
        $viewInitialize = $this->__generateViewInitializeCode($modelName, $jsFields);
        $viewEvents = $this->__generateViewEventsCode($modelName, $jsFields);
        $viewActions = $this->__generateViewActionsCode($modelName, $jsFields);
        $modelFieldInit = $this->__generateModelFieldInitCode($jsFields);
        $modelContent = String::insert(
            $this->modelTemplate,
            compact('modelName', 'fields', 'validation', 'viewInitialize', 'viewEvents', 'viewActions', 'modelFieldInit', 'formElements')
        );
        $this->__writeScriptFile($modelName, $modelContent);
    }

    private function __writeScriptFile($modelName, $content) {
        $outputFile = $this->output . Inflector::underscore($modelName) . '.js';
        $out = new File($outputFile, true, 0644);
        $out->write($content);
        $out->close();
    }

    private function __generateViewInitializeCode($modelName, $fields) {
        $out = '';
        foreach ($fields as $field) {
            $out .= "\n        ";
            $out .= sprintf('this.%s = $("#%s");', $field, Inflector::camelize($field));
        }
        return $out . "\n    ";
    }

    private function __generateViewEventsCode($modelName, $fields) {
        $out = '';
        foreach ($fields as $field) {
            $out .= "\n        ";
            $out .= sprintf('"blur #%s": "set%s",', Inflector::camelize($field), Inflector::camelize($field));
        }
        $out .= "\n        ";
        $out .= '"submit": "submitForm"';
        return $out . "\n    ";
    }

    private function __generateViewActionsCode($modelName, $fields) {
        $functionCode = <<<eof
    set:fieldName: function(e){
        var _self = this;
        this.hideError(':field');
        this.model.set(
            {':field': this.:field.val()}, 
            {
                error: function(model, error){ _self.validationErrorFound(model, error);},
                fieldName: ':field'
            }
        );
    },
eof;
        $out = '';
        foreach ($fields as $field) {
            $fieldName = Inflector::camelize($field);
            $out .= trim(String::insert($functionCode, compact('field', 'fieldName')));
            $out .= "\n    ";
        }
        return trim($out);
    }

    private function __generateModelFieldInitCode($fields) {
        $init = '';
        foreach ($fields as $field) {
            $init .= sprintf('%s: $("#%s").val(),%s', $field, $field, "\n            ");
        }
        return trim($init);
    }
}