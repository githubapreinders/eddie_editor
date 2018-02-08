(function()
{
    var app = angular.module('confab',['ngAnimate','ui.bootstrap','ui.tree', 'ui.router', 'ui.codemirror','ngCookies','angularLocalStorage']);


app.config(function ($stateProvider, $urlRouterProvider)
{
    console.log('Application config...');
    $stateProvider

        // route for the home p age
        .state('app', {
            url: '/',
            views: {
                'content': {
                    templateUrl: 'views/home.html',
                    controller: 'IndexController as vm'
                }
            }
        })
        .state('app.moderator', {
            url:'moderator',
            views: {
                'content@': {
                    templateUrl : 'views/moderator.html',
                    controller  : 'ModeratorController as vm3'
                }
            }
        });
    $urlRouterProvider.otherwise('/');

    
});

})();