(function(){

'use strict';

angular.module('confab')

    .service('staticDataFactory', function(xmlTag) 
    {
        var thedata = [new xmlTag('potato',['prop1', 'prop2','prop3']),
                       new xmlTag('chickpea',['prop1', 'prop2','prop3']),
                       new xmlTag('currypaste',['prop1', 'prop2'])];

        return{
            getData : getData
        }

        
        
        function getData()
        {
            return thedata;
        }


    })

})();   