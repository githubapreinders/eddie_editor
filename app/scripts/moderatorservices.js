(function()
{
	'use strict'

	var app = angular.module('confab');

	app.factory('ModeratorFactory', function($http, StorageFactory, API_URL)
	{
	var availableLesson = null;	
		return {
			postJsonBulk : postJsonBulk,
			postTag : postTag,
			postSchema : postSchema,
			deleteItem : deleteItem,
			setAvailableLesson : setAvailableLesson,
			getAvailableLesson : getAvailableLesson
		}

		function setAvailableLesson(which)
		{
			availableLesson = which;
			console.log("availableLesson", availableLesson);
		}


		function getAvailableLesson()
		{
			return availableLesson;
		}



		function postJsonBulk(json)
		{

			try
			{
				//JSON.parse(json);
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


		function postTag(theobject)
        {
          console.log("posting tag", theobject);
          // if(theobject.type === 'snippets')
          // {
          // 	return convertXml(theobject.xml).then(function (res)
	         //  {
	         //  		var parking = angular.copy(theobject);//to prevent the original model from corrupting
	         //   		parking.xml = res.data;	
	         //     $http.post(API_URL+'/postIaftag', parking).then(function success(resp)
	         //      {
	         //        return console.log("saving result", resp.status);
	         //      },
	         //      function failure(err)
	         //      {
	         //        return console.log("failed result posting snippet", err.status);
	         //      });
	         //  });	
          // }
          // else
          // {
          	  //theobject.xml = "";
          	  return  $http.post(API_URL+'/postIaftag', theobject).then(function success(resp)
	          {
	            console.log("saving result", resp.status);
	          },
	          function failure(err)
	          {
	            console.log("failed result posting tag", err.status);
	          });
          // }
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
}())