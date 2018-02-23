(function()
{
	'use strict';
	var app = angular.module('confab');
	//TODO add a view and controller functionality to add items to the children array
	app.controller('ModeratorController', function($scope, StaticDataFactory, $uibModal, StorageFactory, ModeratorFactory)
	{
		var vm3 = this;
		vm3.showModel = showModel;
		vm3.deleteProperty = deleteProperty;
		vm3.changeAttr = changeAttr;
		vm3.addProperty = addProperty;
		vm3.addNewClass = addNewClass;
		vm3.otherSlot = otherSlot;
		vm3.postDatamonster = postDatamonster;
		vm3.checkForXml = checkForXml;
		vm3.postJsonBulk = postJsonBulk;
		vm3.confirmDelete = confirmDelete;
		
		console.log("moderatorcontroller attached...");
		StaticDataFactory.stopTimer();
		
		vm3.dataModel = JSON.parse(StaticDataFactory.getStaticJson());
		console.log(vm3.dataModel);
		vm3.currentSlotNumber = StorageFactory.getCurrentKey().title;
		vm3.showPropertyDescription= false;
		vm3.selectedProperty = 0;
		vm3.addingProperty = false;
		vm3.newProperty = null;
		vm3.addingItem = false;
		
		if (vm3.dataModel === null)
		{
				console.log("resolving data from iaf data:" );
				StaticDataFactory.getJson().then(function success(data)
				{
						vm3.dataModel = JSON.parse(data.data.JSONMONSTER.MYMONSTER);
						vm3.selectedItem = vm3.dataModel[(Object.keys(vm3.dataModel)[0])];
						console.log("selected itemm",vm3.selectedItem);
				},
				function error(err)
				{
					console.log("error");
				});
		}
		else
		{
			vm3.selectedItem = StaticDataFactory.getSelectedItem();
			console.log("data2", vm3.selectedItem);
		}


		function postJsonBulk()
		{
			ModeratorFactory.postJsonBulk(vm3.selectedItem.description);
		}

		function checkForXml()
		{
			console.log("selected",vm3.selectedItem.classname);
			StaticDataFactory.loadXml(vm3.selectedItem.classname).then(function success(res)
			{
				vm3.selectedItem.xml = res.data;
			});
		}

		function deleteItem()
		{
			ModeratorFactory.deleteItem(vm3.selectedItem.classname).then(function succcess(res)
				{
					console.log(res);
					var parking = vm3.selectedItem.classname;
					delete vm3.dataModel[parking];
					vm3.selectedItem = vm3.dataModel[Object.keys(vm3.dataModel)[0]];
				},
				function fail(err)
				{
					console.log(err);
				});
		}

		function postJsonMonster()
		{
			console.log("JSONMONSTER\n",JSON.stringify(vm3.dataModel));
		}



		

		function addNewClass()
		{
			vm3.newProperty = null;
			vm3.addingProperty = false;
			vm3.addingItem = true;
			vm3.dataModel['NEWITEM'] = {classname:"NEWITEM",description:"enter your description here", type:"general",xml:"", attrs:{},properties:[]};
			vm3.selectedItem = vm3.dataModel['NEWITEM'];
		}

		function otherSlot()
		{
			vm3.currentSlotNumber = StorageFactory.switchKey().title;
			console.log("toggle slot",vm3.currentSlotNumber);
			
			var myslot = StorageFactory.getGetter(vm3.currentSlotNumber)();

			vm3.selectedItem.xml = StorageFactory.getGetter(myslot)();
		}

		function changeAttr(index)
		{
			vm3.selectedItem.attrs[vm3.selectedItem.properties[index][0]] = new Array(vm3.selectedItem.properties[index][2]);
		}

		function addProperty(string)
		{
			switch(string)
			{
				case 'add':
				{
					vm3.newProperty = {propname:"new_property",propdes:"replace with your description",propdef:""};
					break;
				}
				case 'cancel':
				{
					vm3.newProperty = null;
					break;
				}
				case 'confirm':
				{
					if(vm3.newProperty.propname === "" || vm3.newProperty.propdes === "")
					{
						return;
					}
					vm3.selectedItem.attrs[vm3.newProperty.propname] = new Array(vm3.newProperty.propdef);
					vm3.selectedItem.properties.unshift(new Array(vm3.newProperty.propname,vm3.newProperty.propdes,vm3.newProperty.propdef));
					vm3.newProperty = null;
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
			vm3.showSpinner = !vm3.showSpinner;
		}

		function deleteProperty(index)
		{
			console.log("deleting property", index, vm3.selectedItem.properties[index][0]);
			delete vm3.selectedItem.attrs[vm3.selectedItem.properties[index][0]];
			vm3.selectedItem.properties.splice(index,1);
		}

		function showModel()
		{

			//vm3.displayItem = JSON.stringify(vm3.selectedItem,['properties'],4);
			//console.log(vm.displayItem);
			var modalInstance = $uibModal.open(
			{
				templateUrl : "./views/itemcontents.html",
				controller : "ModalController as vm5",
				windowClass : "mymodal",
				resolve : {items : function ()
					{
						return vm3.selectedItem;
					}}
			});
		}

		function postDatamonster()
		{
			console.log(vm3.selectedItem);
			toggleSpinner();
			ModeratorFactory.postDatamonster(vm3.dataModel).then(function success(res)
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

		function confirmDelete()
		{

			var modalInstance = $uibModal.open(
			{
				templateUrl : "./views/modal_delete_item.html",
				animation : true,
				controller : "Modal2Controller as vm6",
				size : "sm",
				backdrop : "static",
				resolve : 
				{
					item : function ()
					{
						return vm3.selectedItem;
					}
				}
			}).result.then(function(result)
			{
				console.log("result:", result);
				if(result === 'delete')
				{
					toggleSpinner();
					ModeratorFactory.deleteItem(vm3.selectedItem.classname).then(function succcess(res)
					{
						toggleSpinner();
						console.log("response from service: ", res);
						var parking = vm3.selectedItem.classname;
						delete vm3.dataModel[parking];
						vm3.selectedItem = vm3.dataModel[Object.keys(vm3.dataModel)[0]];
						postDatamonster();
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
		var vm5 = this;
		vm5.closeModal = closeModal;
		vm5.items = JSON.stringify(items,null, 4);

		function closeModal()
		{
			$uibModalInstance.close();

		}
	})

	.controller('Modal2Controller', function($uibModalInstance, item)
	{
		var vm6 = this;
		vm6.closeModal = closeModal;
		vm6.deleteItem = deleteItem;
		vm6.item = item;

		function closeModal()
		{
			$uibModalInstance.close("cancel");
		}

		function deleteItem()
		{
			$uibModalInstance.close("delete");
		}
	});
}());