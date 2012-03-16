<?php
class ValidationChacheFolderException extends CakeException {
    
    public function __construct($folderPath) {
        $message = __d('cake_backbone_validation', 'Failed to create folder %s', array($folderPath));
        parent::__construct($message);
    }

}

