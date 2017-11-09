(function(){

'use strict';

angular.module('confab')

    .service('staticDataFactory', function(xmlTag, $http) 
    {

        var datasource = 'pipes';
        var dummy = {
        attrs: {
          color: ["red", "green", "blue", "purple", "white", "black", "yellow"],
          size: ["large", "medium", "small"],
          description: null
        },
        children: []
      };

        var thedata = {
        "!top": ["module"],
        "!attrs": {
          id: [""],
          class: ["A", "B", "C"]
        },
        adapter: {
          attrs: {
            name: ["name"+randomDigit()],
            active: [""]
          },
          children: ["receiver", "pipeline"]
        },
        receiver: {
          attrs: {
            name: [""],
            className: [""]
          },
          children: ["listener"]
        },
        pipeline: {
          attrs: {name: [""]},
          children: ["exits", "pipe"]
        },
        pipe: {
          attrs: {name: [""], blockSize:null, blockPrefix: null, blockSuffix:null, elementXPathExpression:null, returnString:[""]},
          children: ["sender", "forward", "param"]
        },
        wings: dummy, feet: dummy, body: dummy, head: dummy, tail: dummy,
        leaves: dummy, stem: dummy, flowers: dummy
      };

        return{
            getData : getData,
            getJson : getJson,
            setDataSource: setDataSource,
            getDataSource: getDataSource
        };

        function setDataSource(string)
        {
          datasource = string;
        }

        function getDataSource()
        {
          return datasource;
        }


        function getJson()
        {
          return $http.get('./media/javadoc_data.json').then(function(data)
            {
              return data;
            });
          
        }  
        
        function getData()
        {
            return thedata;
        }

        function randomDigit()
        {
            return Math.ceil(Math.random()*100);
        }


    })

})();   