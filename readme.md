# JavaScript validation for CakePHP (2.x) using Backbone.js

This plugin aims to implement client-side validation of the default validators shipped with CakePHP 2.x

## Usage

To use this plugin add a code block at the end of your layout file called **scripts_for_bottom**, like so:

    
        <?php echo $this->fetch('scripts_for_bottom'); ?>
    </body>
    

This plugin will detect when data is set for your models and will generate the Backbone Model, View and wire them
all up to execute validations on the clien side on each field's blur event.

## What's missing?

A lot.

But to start with, all the validation methods haven't been migrated to Javascript yet. Check webroot/js/validation.js 
for a list of methods already implemented.

*Some other things:*

- Testing
- Figure out a way to reuse the generated Backbone Models in the rest of the application.

