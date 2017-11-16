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
            getJson : getJson,
            loadXml : loadXml,
            setDataSource: setDataSource,
            getDataSource: getDataSource,
            makeSnippet: makeSnippet,
            getFormattingSettings: getFormattingSettings
        };


        function getFormattingSettings()
        {
          return formattingSettings;
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

        function loadXml(which)
        {
          which = 'configurationHelloWorlds.xml';
          return $http.get('./media/'+ which ).then(function(data)
            {
              return data;
            });
        }

        function randomDigit()
        {
            return Math.ceil(Math.random()*100);
        }

        function makeSnippet()
        {
          var header = "<?xml version='1.0' encoding='UTF-8'?>\n";
          var tag1 = new xmlTag("tag1", new Array(new attributeObject("prop1",['val1']))).toCompleteTag();
          var tag2 = new xmlTag("tag1", new Array(new attributeObject("prop1",['val1']))).toCompleteTag();
          var tag3 = new xmlTag("tag1", new Array(new attributeObject("prop1",['val1']))).toCompleteTag();
          return "<?xml version='1.0' encoding='UTF-8'?>\n<tag1 prop1=\"val1\"><tag1 prop1=\"val1\"><tag1 prop1=\"val1\"></tag1></tag1></tag1>";
        }
    });

})();   