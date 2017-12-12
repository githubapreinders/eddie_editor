(function()
{
	'use strict';

angular.module('confab')
.directive('propertyListener', function(attributeObject)
{
	
	return{
		link : function(scope, elem, attrs)
		{
			elem.bind('click', function(event)
			{
				var heading = document.getElementById('propertyheader');
				var text = document.getElementById('propertytext');
				console.log("clicked property", event.target.id, heading.innerHTML);
				var itemnumber = event.target.id.match(/\d+$/)[0];
				var data = scope.vm.selectedItem.properties[itemnumber];
				heading.innerHTML = data[0];
				text.innerHTML = data[1];

				var elemt = document.getElementById('checkbox' + itemnumber);
				var input = document.getElementById('propertyvalue' + itemnumber);
				var item = scope.vm.selectedItem;

				console.log("items:", elemt, input, item);

				/* a checked checkbox will be written onto vm.selectedProperties,
				when it is unchecked we will want to remove it from there. */
				if(elemt === Object)
				switch (elemt.checked)
				{
					case true :
					{
						scope.vm.selectedProperties[data[0]] = new attributeObject(data[0], new Array(input.value));
						break;
					}

					case false : 
					{
						delete scope.vm.selectedProperties[data[0]];
						break;
					}
				}
				console.info("selected properties",scope.vm.selectedProperties);
			});
		}

	};
})
	/* 
	 when the change on the contenteditable happens the model binding has to
     be invoked; also the property is a key in the attrs object ; so the old key name
     is replaced by the new one here since at this place only the old and the new
     value come together.
     */
.directive("contenteditable", function() {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {

      function read() {
        ngModel.$setViewValue(element.html());
      }

      ngModel.$render = function() {
        element.html(ngModel.$viewValue || "");
      };
      
      element.bind("blur keyup change", function(event) 
      {
        var el = event.target.id;
        if(el !== 'newproperty' && el !== 'newclassname')
        {
        	console.log("modifying attribute...");
	        var oldvalue = scope.vm.selectedItem.properties[scope.vm.selectedProperty][0];
	        scope.$apply(read);
	        var newvalue = scope.vm.selectedItem.properties[scope.vm.selectedProperty][0];
	        var theattrs = scope.vm.selectedItem.attrs;
	        if(newvalue !== oldvalue)
	        {
	        	Object.defineProperty(theattrs, newvalue,
	        		Object.getOwnPropertyDescriptor(theattrs, oldvalue));
	        	delete theattrs[oldvalue];
	        }
        }
        else
        {
        	scope.$apply(read);
        }

      });
    }
  };
});


}());