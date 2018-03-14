(function()
{
'use strict';

var app = angular.module('confab');

app.factory('UserFactory', function UserFactory($http,  AuthTokenFactory, StorageFactory, $q, $window, IAF_URL)
    {
    	
        return {
            login: login,
            logout: logout,
            getUser: getUser
        };

        function getUser()
        {
            if (AuthTokenFactory.getToken())
            {
                return $http.get(IAF_URL + '/api/me');
            }
            else
            {
                return $q.reject({data: 'client has no auth token'});
            }
        }

        function login(useremail, password)
        {
           var theurl = IAF_URL + '/api/login';
        	console.log("url: ",theurl);
            return $http.post(theurl,
                {"logindetails":{
                    "email": useremail,
                    "password": password}
                }).then(function success(response)
            {
                AuthTokenFactory.setToken(response.data.logindetails.accesstoken);
                return response;
            },function failure(response)
            {
                return response;
            });

               
        }
		/* TODO change method to GET */
        function logout()
        {
            return $http.get(IAF_URL + '/api/logout').then(
        	function succes(response)
            {
                console.info("token removed from backend",response);
                AuthTokenFactory.setToken();
                return response;
            }, function failure(response)
            {
                console.info("returning error from backend",response);
                return response;
            });

        }

    });


    app.factory('AuthTokenFactory', function AuthTokenFactory($window)
    {

        var store = $window.localStorage;
        var key = 'auth-token';

        return {
            getToken: getToken,
            setToken: setToken
        };

        function getToken()
        {
            return store.getItem(key);
        }

        function setToken(token)
        {
            if (token)
            {
                store.setItem(key, token);
            }
            else
            {
                store.removeItem(key);
            }
        }
    });


    app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory)
    {

        return {
            request: addToken
        };

        function addToken(config)
        {
            var token = AuthTokenFactory.getToken();
            if (token)
            {
                config.headers = config.headers || {};
                config.headers.Authorization = token;
            }
            return config;
        }
    });




}());