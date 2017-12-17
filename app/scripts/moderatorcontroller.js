(function()
{
	'use strict';
	var app = angular.module('confab');

	app.controller('ModeratorController', function( StaticDataFactory, $uibModal, StorageFactory, ModeratorFactory)
	{

		var vm = this;
		vm.showModel = showModel;
		vm.deleteProperty = deleteProperty;
		vm.deleteItem = deleteItem;
		vm.changeAttr = changeAttr;
		vm.addProperty = addProperty;
		vm.addNewClass = addNewClass;
		vm.otherSlot = otherSlot;
		vm.postTag = postTag;
		
		console.log("moderatorcontroller attached...");
		StaticDataFactory.stopTimer();
		vm.dataModel = StaticDataFactory.getStaticJson();
		vm.currentSlotNumber = parseInt(StorageFactory.getCurrentKey().substring(4,5));
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
			ModeratorFactory.postTag(vm.selectedItem).then(function success(res)
			{
				console.log("success",res);
			}, 
			function fail(err)
			{
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
			console.log("toggle slot");
			vm.currentSlotNumber += 1;
			if (vm.currentSlotNumber === 5)
			{
				vm.currentSlotNumber = 1;
			}
			vm.selectedItem.xml = StorageFactory.getGetter("slot" + vm.currentSlotNumber)();
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

		// console.log(vm.datamModel);
	}).
	controller('ModalController', function($uibModalInstance, items)
	{
		var vm = this;
		vm.closeModal = closeModal;
		vm.items = JSON.stringify(items,null, 4);

		function closeModal()
		{
			$uibModalInstance.close();
		}
	});

	app.controller('CourseInfoController', function(StaticDataFactory)
	{
		var vm = this;
		console.log("CourseInfoController loaded");
		StaticDataFactory.stopTimer();
	});
}());