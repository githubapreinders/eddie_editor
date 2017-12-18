(function()
{
	'use strict'

	var app = angular.module('confab');

	app.factory('ModeratorFactory', function($http, StorageFactory, API_URL, IAF_URL)
	{
		return {
			postIaftag : postIaftag,
			postJsonBulk : postJsonBulk,
			postTag : postTag,
			postSchema : postSchema,
			deleteItem : deleteItem
		}

		function postIaftag()
		{

		}

		function postJsonBulk()
		{
			
		}



		function postTag(theobject)
        {
          console.log("posting tag", theobject);
          if(theobject.type === 'snippets')
          {
          	return convertXml(theobject.xml).then(function (res)
	          {
	          		var parking = angular.copy(theobject);//to prevent the original model from corrupting
	           		parking.xml = res.data;	
	             $http.post(API_URL+'/postIaftag', parking).then(function success(resp)
	              {
	                return console.log("saving result", resp.status);
	              },
	              function failure(err)
	              {
	                return console.log("failed result posting snippet", err.status);
	              });
	          });	
          }
          else
          {
          	  theobject.xml = "";
          	  return  $http.post(API_URL+'/postIaftag', theobject).then(function success(resp)
	          {
	            console.log("saving result", resp.status);
	          },
	          function failure(err)
	          {
	            console.log("failed result posting tag", err.status);
	          });
          }
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
			return $http({method:"GET", url: API_URL + '/deleteItem?resource=' + classname  })
		}

	});
}())