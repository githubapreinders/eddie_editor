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
});


}());