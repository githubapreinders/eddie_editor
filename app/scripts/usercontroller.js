(function(){

	'use strict';
	var applic = angular.module('confab');
	applic.controller('MyUserController',function(UserFactory)
	{
		console.log("my usercontroller...");
		var vm6 = this;
		vm6.setRole = setRole;
		vm6.saveItem = saveItem;
		vm6.deleteUser = deleteUser;
		vm6.sendMail = sendMail;
		vm6.logitem = logitem;
		vm6.user = UserFactory.getCurrentUser();
		getAllUsers();



		function sendMail(index)
		{
			UserFactory.sendMail(vm6.theusers[index].email).then(
				function success(resp)
				{
					console.log("success giving new credentials, email is sent. ", resp.status);
					getAllUsers();
				},
				function failure(resp)
				{
					console.log("failure giving new credentials.", resp.status);
				});
		}

		function deleteUser(index)
		{
			UserFactory.deleteUser(vm6.theusers[index].email).then(
				function success(resp)
				{
					console.log("success deleting user ", resp.status);
					getAllUsers();
				},
				function failure(resp)
				{
					console.log("fai  lure deleting user ", resp.status);
				});
		}

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