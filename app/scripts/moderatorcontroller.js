(function()
{
	'use strict';
	var app = angular.module('confab');

	app.controller('ModeratorController', function($scope, StaticDataFactory, $uibModal, StorageFactory, ModeratorFactory)
	{

		var vm = this;
		vm.showModel = showModel;
		vm.deleteProperty = deleteProperty;
		vm.changeAttr = changeAttr;
		vm.addProperty = addProperty;
		vm.addNewClass = addNewClass;
		vm.otherSlot = otherSlot;
		vm.postTag = postTag;
		vm.checkForXml = checkForXml;
		vm.postJsonBulk = postJsonBulk;
		vm.confirmDelete = confirmDelete;
		
		console.log("moderatorcontroller attached...");
		StaticDataFactory.stopTimer();

		
		$scope.$on('$viewContentLoaded', function()
		{
			
  		});

		vm.dataModel = StaticDataFactory.getStaticJson();
		vm.currentSlotNumber = StorageFactory.getCurrentKey().title;
		console.log(vm.currentSlotNumber);
		vm.showPropertyDescription= false;
		vm.selectedProperty = 0;
		vm.addingProperty = false;
		vm.newProperty = null;
		vm.addingItem = false;

		
		
		if (vm.dataModel === null)
		{
			StaticDataFactory.getJson().then(function success(response)
			{
				vm.dataModel = response.data;
				vm.selectedItem = vm.dataModel[(Object.keys(vm.dataModel)[0])];
			});
		}
		else
		{
			vm.selectedItem = StaticDataFactory.getSelectedItem();
		}


		function postJsonBulk()
		{
			ModeratorFactory.postJsonBulk(vm.selectedItem.description);
		}

		function checkForXml()
		{
			console.log("selected",vm.selectedItem.classname);
			StaticDataFactory.loadXml(vm.selectedItem.classname).then(function success(res)
			{
				vm.selectedItem.xml = res.data;
			});
		}

		function deleteItem()
		{
			ModeratorFactory.deleteItem(vm.selectedItem.classname).then(function succcess(res)
				{
					console.log(res);
					var parking = vm.selectedItem.classname;
					delete vm.dataModel[parking];
					vm.selectedItem = vm.dataModel[Object.keys(vm.dataModel)[0]];
				},
				function fail(err)
				{
					console.log(err);
				});
		}

		function postTag()
		{
			console.log(vm.selectedItem);
			toggleSpinner();
			ModeratorFactory.postTag(vm.selectedItem).then(function success(res)
			{
				toggleSpinner();
				console.log("success",res);
			}, 
			function fail(err)
			{
				toggleSpinner();
				console.log("fail",err);
			});
		}

		function addNewClass()
		{
			vm.newProperty = null;
			vm.addingProperty = false;
			vm.addingItem = true;
			vm.dataModel['NEWITEM'] = {classname:"NEWITEM",description:"enter your description here", type:"general",xml:"", attrs:{},properties:[]};
			vm.selectedItem = vm.dataModel['NEWITEM'];
		}

		function otherSlot()
		{
			vm.currentSlotNumber = StorageFactory.switchKey().title;
			console.log("toggle slot",vm.currentSlotNumber);
			
			var myslot = StorageFactory.getGetter(vm.currentSlotNumber)();

			vm.selectedItem.xml = StorageFactory.getGetter(myslot)();
		}

		function changeAttr(index)
		{
			vm.selectedItem.attrs[vm.selectedItem.properties[index][0]] = new Array(vm.selectedItem.properties[index][2]);
		}

		function addProperty(string)
		{
			switch(string)
			{
				case 'add':
				{
					vm.newProperty = {propname:"new_property",propdes:"replace with your description",propdef:""};
					break;
				}
				case 'cancel':
				{
					vm.newProperty = null;
					break;
				}
				case 'confirm':
				{
					if(vm.newProperty.propname === "" || vm.newProperty.propdes === "")
					{
						return;
					}
					vm.selectedItem.attrs[vm.newProperty.propname] = new Array(vm.newProperty.propdef);
					vm.selectedItem.properties.unshift(new Array(vm.newProperty.propname,vm.newProperty.propdes,vm.newProperty.propdef));
					vm.newProperty = null;
					break;
				}
				default:
				{
					break;
				}
			}
		}

		function toggleSpinner()
		{
			vm.showSpinner = !vm.showSpinner;
		}

		function deleteProperty(index)
		{
			console.log("deleting property", index, vm.selectedItem.properties[index][0]);
			delete vm.selectedItem.attrs[vm.selectedItem.properties[index][0]];
			vm.selectedItem.properties.splice(index,1);
		}

		function showModel()
		{

			vm.displayItem = JSON.stringify(vm.selectedItem,['properties'],4);
			//console.log(vm.displayItem);
			var modalInstance = $uibModal.open(
			{
				templateUrl : "./views/mymodal.html",
				controller : "ModalController as vm",
				windowClass : "mymodal",
				resolve : {items : function ()
					{
						return vm.selectedItem;
					}}
			});
		}

		function confirmDelete()
		{

			var modalInstance = $uibModal.open(
			{
				templateUrl : "./views/modal_delete_item.html",
				animation : true,
				controller : "Modal2Controller as vm",
				size : "sm",
				backdrop : "static",
				resolve : 
				{
					item : function ()
					{
						return vm.selectedItem;
					}
				}
			}).result.then(function(result)
			{
				console.log("result:", result);
				if(result === 'delete')
				{
					toggleSpinner();
					ModeratorFactory.deleteItem(vm.selectedItem.classname).then(function succcess(res)
					{
						toggleSpinner();
						console.log("response from service: ", res);
						var parking = vm.selectedItem.classname;
						delete vm.dataModel[parking];
						vm.selectedItem = vm.dataModel[Object.keys(vm.dataModel)[0]];
					},
					function fail(err)
					{
						toggleSpinner();
						console.log(err);
					});
				}
			});

			


		}

	})
	
	.controller('ModalController', function($uibModalInstance, items)
	{
		var vm = this;
		vm.closeModal = closeModal;
		vm.items = JSON.stringify(items,null, 4);

		function closeModal()
		{
			$uibModalInstance.close();

		}
	})

	.controller('Modal2Controller', function($uibModalInstance, item)
	{
		var vm = this;
		vm.closeModal = closeModal;
		vm.deleteItem = deleteItem;
		vm.item = item;

		function closeModal()
		{
			$uibModalInstance.close("cancel");
		}

		function deleteItem()
		{
			$uibModalInstance.close("delete");
		}
	})
	
	.controller('CourseInfoController', function(StaticDataFactory, ModeratorFactory)
	{
		var vm = this;
		console.log("CourseInfoController loaded");
		StaticDataFactory.stopTimer();
		vm.currentLesson = ModeratorFactory.getAvailableLesson();

		document.getElementById('Example2').src = vm.currentLesson;
		


	});

}());