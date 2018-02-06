(function()
{
	'use strict';

	var app = angular.module('confab');

	app.factory('ModeratorFactory', function($http, StorageFactory, API_URL)
	{
	var availableLesson = null;	
		return{
			postJsonBulk : postJsonBulk,
			postTag : postTag,
			postSchema : postSchema,
			deleteItem : deleteItem,
			setAvailableLesson : setAvailableLesson,
			getAvailableLessons : getAvailableLessons
		};

		function setAvailableLesson(which)
		{
			availableLesson = which;
			console.log("availableLesson", availableLesson);
		}

		function getAvailableLessons()
		{
			return availableLesson;
		}

		function postJsonBulk(json)
		{
			try
			{
				$http.post(API_URL + '/postJsonBulk', json).then(function success(resp)
					{
						console.log("success",resp);
					},
					function failure(err)
					{
						console.log("failure",err);
					});
			}
			catch(err)
			{
				alert ("improper json\n",err);
			}
		}


		function postTag(datamonster)
        {
          console.log("posting a monster with length ", Object.keys(datamonster).length);
          
          	  return  $http.post(API_URL+'/postIaftag', datamonster).then(function success(resp)
	          {
	            console.log("saving result", resp.status);
	          },
	          function failure(err)
	          {
	            console.log("failed result posting tag", err.status);
	          });
        }

        
        function convertXml(thexml)
        {
          	//console.log("slot to convert to json:", StorageFactory.getGetter(slot)());
         	return $http({method:"POST",url: API_URL + '/convertToJson',data: thexml ,headers:{"Content-Type":'application/xml'} }).then(function(data)
	        {
	          return data;
	        },function(error)
	        {
	          console.log("error loading xml", error);
	        });
        }


		function postSchema()
		{
			
		}

		//TODO delete item directly in mongodb
		function deleteItem(classname)
		{
			return $http({method:"GET", url: API_URL + '/deleteItem?resource=' + classname  }).then(
				function success(res)
				{
					return res;
				}, 
				function failure(err)
				{
					return err;
				});
		}

	});
}());