(function()
{
	'use strict';

	var app = angular.module('confab');

	app.factory('ModeratorFactory', function($http, StorageFactory, IAF_URL)
	{
	var availableLesson = null;	
		return{
			postJsonBulk : postJsonBulk,
			postDatamonster : postDatamonster,
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


		

        
        function convertXml(thexml)
        {
          	//console.log("slot to convert to json:", StorageFactory.getGetter(slot)());
         	return $http({method:"POST",url: IAF_URL + '/convertToJson',data: thexml ,headers:{"Content-Type":'application/xml'} }).then(function(data)
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

		function postDatamonster(datamonster, thetag)
        {
          console.log("posting a monster with length ", Object.keys(datamonster).length);
          
          	  var helper = JSON.stringify(datamonster);
          	  return  $http.post(IAF_URL +'/storejson',helper).then(function success(resp)
	          {
	            console.log("saving result", resp.status);
	            posttag(tag);
	          },
	          function failure(err)
	          {
	            console.log("failed result posting datamonster", err.status);
	          });
        }

        function postTag(tag)
        {
        	return  $http.post(IAF_URL +'/postiaftag', tag).then(function success(resp)
	          {
	            console.log("saving a tag", resp.status);
	          },
	          function failure(err)
	          {
	            console.log("failed result posting tag", err.status);
	          });
        }

		//TODO delete item directly in mongodb
		function deleteItem(classname)
		{
			return $http({method:"GET", url: IAF_URL + '/deleteiaftag/' + classname }).then(
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