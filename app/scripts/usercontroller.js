(function(){

	'use strict';
	var applic = angular.module('confab');
	applic.controller('MyUserController',function(UserFactory)
	{
		console.log("my usercontroller...");
		var vm6 = this;
		vm6.setRole = setRole;
		vm6.saveItem = saveItem;
		vm6.logitem = logitem;
		getAllUsers();

		function getAllUsers()
		{
			UserFactory.getAllUsers().then(
			function success(response)
			{
				vm6.theusers = response;
				vm6.theusers.unshift({email:"",role:"user",name:"",lastname:"",instance:""});
				console.log("returned users:", vm6.theusers);
			},
			function failure(response)
			{
				console.log("no users returned " ,response);
			});
		}
		

		

		function setRole(index, role)
		{
			vm6.theusers[index].role = role;
		}

		function logitem()
		{
			console.log("item: ",vm6.theusers);
		}



        function saveItem(index)
        {
        	UserFactory.saveUser(vm6.theusers[index]).then(
        	function success(response)
        	{
        		console.log("saved successfully ", response.status);
        		getAllUsers();
        	},function failure(response)
        	{
        		console.log("no success saving ", response.status);
        	});
        }




	});

}());