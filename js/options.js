window.onload = function() {
  initOptions();
}
// Show/hide suboptions at startup)

function initOptions() {
  var a=1;
  $("input[type='checkbox'], input[type='radio']").each(function(index) {
    var $fieldset = $(this).parent("legend").parent("fieldset");
    var $options = $fieldset.children(".subOptions").first();
    
    $fieldset.toggleClass("selected", this.checked);        
    $options.toggle(this.checked);

    // Bind function to show/hide options
    if ($(this).attr("type") == "checkbox") {
      $(this).change(function() {
        $fieldset.toggleClass("selected", this.checked);
        if (this.checked) {
          $options.slideDown();
        } else {
          $options.slideUp();                   
        }
      });
    } else if ($(this).attr("type") == "radio") {
      // because the .change AND .blur does not work when "removing" a selected radio - we must instad detect the change in one of the radio in the group and then go through the list to slide/unslide the suboptions
      $(this).change(function() {
        var inputName = $(this).attr("name");
        $("input[name='" + inputName + "']").each(function(index, input) {
          $fieldset = $(this).parent("legend").parent("fieldset");
          $fieldset.toggleClass("selected", this.checked);
          var $subOptions = $fieldset.children(".subOptions").first();
          if (this.checked) {
            $subOptions.slideDown();
          } else {
            $subOptions.slideUp();  
          }
        });
      });
    }
  });
}
