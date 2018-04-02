(function(){

	'use strict';
	var applic = angular.module('confab');
	applic.controller('MyUserController',function(UserFactory, $timeout)
	{
		console.log("my usercontroller...");
		var vm6 = this;
		vm6.setRole = setRole;
		vm6.saveItem = saveItem;
		vm6.deleteUser = deleteUser;
		vm6.sendMail = sendMail;
		vm6.toggleInstance = toggleInstance;
		vm6.sortOnHeaderName = sortOnHeaderName;
		vm6.logitem = logitem;
		vm6.user = UserFactory.getCurrentUser();
		vm6.buttonsenabled = true;
		getAllUsers();

		function toggleInstance(index)
		{
			console.log("object: ", vm6.theusers[index].instancename.length);
			if (undefined !== vm6.theusers[index].instancename.length)
			{
				if(vm6.theusers[index].instancename.substring(0,1)==='x')
				{
					var name = vm6.theusers[index].instancename;				
					vm6.theusers[index].instancename = name.substring(1,name.length);
					console.log("name1:", vm6.theusers[index].instancename);
				}
				else
				{
					vm6.theusers[index].instancename = 'x' + vm6.theusers[index].instancename ;
					console.log("name2:", vm6.theusers[index].instancename);
				}	
			}
			else
			{
				console.log("returning");
				return;
			}
			
		}

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
			if(vm6.buttonsenabled)
			{
				vm6.buttonsenabled = false;
				UserFactory.deleteUser(vm6.theusers[index].email).then(
					function success(resp)
					{
						console.log("success deleting user ", resp.status);
						getAllUsers();
					},
					function failure(resp)
					{
						vm6.buttonsenabled = true;
						console.log("fai lure deleting user ", resp.status);
					});
			}
		}

		function getAllUsers()
		{
			UserFactory.getAllUsers().then(
			function success(response)
			{
        vm6.theusers = response;
				vm6.theusers.unshift({email:"",role:"user",name:"",lastname:"",instancename:""});
				vm6.buttonsenabled = true;
				console.log("returned users:", vm6.theusers);
			},
			function failure(response)
			{
				vm6.buttonsenabled = true;
				var el = document.getElementById('sendstatususers');
        el.style.background = 'red';
        $timeout(function()
        {
            el.style.background = 'none';
        }, 5000);
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
        	if(vm6.buttonsenabled)
        	{
	        	vm6.buttonsenabled = false;
	        	UserFactory.saveUser(vm6.theusers[index]).then(
	        	function success(response)
	        	{
              if(response.status === 500)
              {
                var el = document.getElementById('sendstatususers');
                el.style.background = 'red';
                $timeout(function()
                {
                    el.style.background = 'none';
                }, 5000);
              }
              else
              {
                console.log("saved successfully ", response.status);
                var el = document.getElementById('sendstatususers');
                el.style.background = 'green';
                $timeout(function()
                {
                    el.style.background = 'none';
                }, 5000);  
              }
              getAllUsers();
	        	},function failure(response)
	        	{
	        		console.log("no success saving ", response.status);
              var el = document.getElementById('sendstatususers');
              el.style.background = 'red';
              $timeout(function()
              {
                  el.style.background = 'none';
              }, 5000);
	        	});
        	}
        }

        function sortOnHeaderName(comparator)
        {
        	console.log("comparator", typeof(comparator));
        	switch(comparator)
        	{
        		case('instance'):
        		{
        			vm6.theusers.sort(compareInstancename);
        			break;
        		}
        		case('email'):
        		{
        			vm6.theusers.sort(sortByEmail);
        			break;
        		}
        		case('firstname'):
        		{
        			vm6.theusers.sort(sortByFirstname);
        			break;
        		}
        		case('lastname'):
        		{
        			vm6.theusers.sort(sortByLastname);
        			break;
        		}
        	}


        }

        function sortByEmail(a,b)
        {
        	var nameA = a.email.toUpperCase(); 
  			var nameB = b.email.toUpperCase(); 
  			if (nameA < nameB) 
  			{
    			return -1;
  			}
  			if (nameA > nameB) 
  			{
    			return 1;
  			}
  			return 0;
        }


        function sortByFirstname(a,b)
        {
        	var nameA = a.name.toUpperCase(); 
  			var nameB = b.name.toUpperCase(); 
  			if (nameA < nameB) 
  			{
    			return -1;
  			}
  			if (nameA > nameB) 
  			{
    			return 1;
  			}
  			return 0;
        }

        function sortByLastname(a,b)
        {
        	var nameA = a.lastname.toUpperCase(); 
  			var nameB = b.lastname.toUpperCase(); 
  			if (nameA < nameB) 
  			{
    			return -1;
  			}
  			if (nameA > nameB) 
  			{
    			return 1;
  			}
  			return 0;
        }



      	function compareInstancename(a,b)
      	{
      		
      		if(a.instancename === 'Ibis4Teacher')
      		{
      			return 1;
      		}

      		else if(a.instancename > b.instancename)
      		{
      			console.log("returning 1");
      			return 1;
      		}
      		else if (a.instancename < b.instancename)
      		{
      			console.log("returning -1");
      			return -1;
      		}
      		else
      		{
      			return 0;
      		}
      	}  



	})

	 .filter('xFilter', function()
    {
        return function(item)
        {
            if(typeof(item) === 'object')
            {
            	return '-';
            }
            else if(item.charAt(0)==='x')
            {
            	return item.substring(1,item.length);
            }
            else
            {
            	return item;
            }


        };
    });

}());