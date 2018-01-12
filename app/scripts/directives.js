(function()
{
	'use strict';

angular.module('confab')

.directive('nameGiver', function(StorageFactory)
        {
            return{
                restrict:"A",
                link : function(scope, el , attrs)
                {
                    el.bind('blur' , function(event)
                    {
                        var digit = event.target.id.match(/\d+/g)[0];
                        console.log("digit", digit, event.target.id);
                        var element = document.getElementById('treeitem' + digit);
                        var text = element.innerHTML;
                        var thelist = scope.vm2.list;
                        console.log("text",text, thelist, digit);
                        traverseArray(thelist);

                        function traverseArray(sublist)
                        {
                            for(var i = 0 ; i<sublist.length; i++)
                            {
                                console.log(sublist[i].title,sublist[i].id);
                                //compares int with a string, so NOT === in the comparator
                                if(sublist[i].id == digit) 
                                {
                                    sublist[i].title = text;
                                    console.log("match", sublist[i], text, scope.vm2.mySlots);
                                    if(!(sublist[i].isDirectory))
                                    {
                                        //changing a filename changes the alias of a storageslot;
                                        //"oldname:slot1" has to become "newname:slot1"
                                        var theslot = StorageFactory.getGetter(scope.vm2.mySlots[digit].title)();
                                        StorageFactory.getSetter(scope.vm2.mySlots[digit].title)();
                                        StorageFactory.getSetter(text)(theslot);
                                        scope.vm2.mySlots[digit].title = text;
                                    }
                                    element.setAttribute('contentEditable', false);
                                    scope.$apply();
                                    StorageFactory.getSetter("thejson")(scope.vm2.list);//saving changed json
                                    break;
                                }
                                if(sublist[i].nodes.length > 0)
                                {
                                    traverseArray(sublist[i].nodes);
                                }
                            }
                        }

                    });
                    el.bind(['keydown'],function(event)
                    {
                        var code = event.which || event.keyCode || eventt.charCode ;
                        console.log("code", code);
                        if (code === 13)// enter key
                        {
                            event.preventDefault();
                            var element = document.getElementById('treeitem'+event.target.id.match(/\d+/g));
                            element.blur();
                        } 
                    });
                }
            };
        })

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
				
				if(typeof (elemt) === 'object')
					switch (elemt.checked)
					{
						case true :
						{
							console.log("adding ...");
							scope.vm.selectedProperties[data[0]] = new attributeObject(data[0], new Array(input.value));
							break;
						}

						case false : 
						{
							console.log("deleting ...");
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
        console.log("changing......");
        var el = event.target.id;
        if(el !== 'newproperty' && el !== 'newclassname' && el !== 'newdescription')
        {
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