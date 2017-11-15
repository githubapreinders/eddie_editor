(function(){

'use strict';

angular.module('confab')

    .service('staticDataFactory', function(xmlTag, $http, attributeObject) 
    {

        var datasource = 'pipes';

        var formattingSettings = {
                "indent_size": 4,
                "xml": {
                    "end_with_newline": true,
                    "js": {
                        "indent_size": 2
                    },
                    "css": {
                        "indent_size": 2
                    }
                },
                "css": {
                    "indent_size": 1
                },
                "js": {
                 "preserve-newlines": true
                }
                }

        

        return{
            getData : getData,
            setData : setData,
            getJson : getJson,
            setDataSource: setDataSource,
            getDataSource: getDataSource,
            makeSnippet: makeSnippet,
            getFormattingSettings: getFormattingSettings
        };


        function getFormattingSettings()
        {
          return formattingSettings;
        }

        function setData(anobject)
        {
          thedata = anobject;
        }

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
          return $http.get('./media/javadoc_data1.json').then(function(data)
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

        function makeSnippet()
        {
          var header = "<?xml version='1.0' encoding='UTF-8'?>\n";
          var tag1 = new xmlTag("tag1", new Array(new attributeObject("prop1",['val1']))).toCompleteTag();
          var tag2 = new xmlTag("tag2", new Array(new attributeObject("prop2",['val2']))).toCompleteTag();
          var tag3 = new xmlTag("tag3", new Array(new attributeObject("prop3",['val3']))).toCompleteTag();
          return tag1 + tag2 + tag3; 
        }
    });

})();   