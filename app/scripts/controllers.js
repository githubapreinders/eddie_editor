(function ()
{
    'use strict';

    angular.module('confab')
        .controller('IndexController', function (xmlTag, staticDataFactory)
        {

            console.log('IndexController...');
            var vm = this;
            vm.submitForm = submitForm;

            vm.message = "Angular Controller is working allright...";
            vm.myTags = staticDataFactory.getData();
            console.log("mytags",vm.myTags);

            


            function submitForm(string)

            {
            	if (vm.userInput !== "")
            	{
            		var values = vm.userInput.split(/\s+/);
            		console.log("values from splitter:", values);
            		var tagtitle = values.shift();
            		var tagproperties = [];
            		if (values.length > 0)
            		{
            			values.forEach(function(val)
            			{
            				tagproperties.push(val);
            			});
            		}
            	vm.myTags.push(new xmlTag(tagtitle, tagproperties));

            	}
            	
            }

        });
})();


