(function(){

'use strict';

angular.module('confab')

    .service('StaticDataFactory', function(xmlTag, $http, attributeObject,storage) 
    {

        var datasource = 'pipes';

        var themes = ["twilight", "monokai", "neat"];
        var fontSizes = [12,13,14,15,16,17,18,19,20];

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
            getFormattingSettings: getFormattingSettings,
            getThemes: getThemes,
            getFontSizes: getFontSizes
        };

        function getThemes()
        {
          return themes;
        }

        function getFontSizes()
        {
          return fontSizes;
        }

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
          //which = 'configurationHelloWorlds.xml';
          console.log("which:", which);
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
    })
    /*
    facilitates local storage; we can store and retrieve values: storing : StorageFactory.getSetter(key)(value)
    retrieving : StorageFactory.getGetter(key)() ; removing a key : StorageFactory.getSetter(key)()
    */
    .factory('StorageFactory',['storage', '$log', function(storage, $log)
    {
      var api = {};
      var thekeys = ["slot1","slot2","slot3"];
      var thealiases = ["aliasslot1","aliasslot2","aliasslot3"];
      var template = ["slot1","slot2","slot3","slot4","aliasslot1","aliasslot2","aliasslot3"];
      var currentKey;
      var mykeys;
      var myaliases;
      
      return {
        getSetter : getSetter,
        getGetter : getGetter,
        verifyKey : verifyKey,
        createAPIForKey : createAPIForKey,
        createSetter : createSetter,
        createGetter : createGetter,
        getKeys : getKeys,
        getAliases : getAliases,
        setCurrentKey : setCurrentKey,
        getCurrentKey : getCurrentKey,
        initialise : initialise
      };


      function initialise()
      {
        template.forEach(function(templateitem)
        {
          if(!(storage.getKeys().includes(templateitem)))
          {
            if(templateitem.substring(0,5) === 'alias')
            {
              getSetter(templateitem)(templateitem.substring(5,10));
            }
            else
            {
              getSetter(templateitem)(templateitem.substring(0,5)); 
            }
          }
        });
        currentKey = thekeys[0];
      }


      function getAliases()
      {
        var output = [];

        thealiases.forEach(function(value)
        {
          output.push(getGetter(value)());
        });

      return output;  
      }



      function setCurrentKey(key)
      {
        currentKey = key;
      }

      function getCurrentKey(key)
      {
        return currentKey;
      }      


      function getKeys()
      {
        var thekeys = storage.getKeys();
        var result = [];
        thekeys.forEach(function(val)
        {
          if(val.substring(0,4) === 'slot')
          {
            result.push(val);
          }
        });
        return result;
      }

      function getSetter(key)
      {
        verifyKey(key);
        return api[key].setter;
      }
      function getGetter(key)
      {
        verifyKey(key);
        return api[key].getter;
      }

      function verifyKey(key)
      {
        if(!key || angular.isUndefined(key))
        {
          throw new Error("Key[ " + key + " ] is invalid");
        }

        if(!api.hasOwnProperty(key))
        {
          createAPIForKey(key);
        }


      }

      function createAPIForKey(key)
      {
        var setter = createSetter(key);
        var getter = createGetter(key);
        api[key] = 
        {
          setter : setter,
          getter : getter
        };
      }

      function createSetter(key)
      {
        return function(value)
        {
          if(angular.isDefined(value))
          {
            try
            {
              storage.set(key, value);
            }
            catch(error)
            {
              $log.info('[StorageFactory]' + error.message);
            }
          }
          else
          {
            storage.remove(key);
          }
        };
      }

      function createGetter(key)
      {
        return function()
        {
          var value = storage.get(key);
          if(value === null)
          {
            value = undefined;
            var setter = api[key].setter;
            setter(value);
          }
          return value;
        };
      }


    }])
    .factory('EditorFactory', function()
    {
    var editor = null;  
      
      return {
        editorLoaded : editorLoaded
      };

      function editorLoaded(_editor)
      {
                var _doc = _editor.getDoc();
                _editor.focus();
                _editor.setOption('lineNumbers', true);
                _editor.setOption('lineWrapping', true);
                _editor.setOption('mode', 'xml');
                _editor.setOption('beautify', 'true');
                _editor.setOption('theme', 'twilight');
                _editor.setOption('foldGutter', true);
                _editor.setOption('gutters',[ "CodeMirror-linenumbers","CodeMirror-foldgutter"]);
                _editor.setOption('matchTags', {bothTags: true});
                var extraKeys =  {
                          "'<'": completeAfter,
                          "'/'": completeIfAfterLt,
                          "' '": completeIfInTag,
                          "'='": completeIfInTag,
                          "Ctrl-Space": "autocomplete"
                                };
                _editor.setOption('extraKeys', extraKeys);

                console.log("editor loaded;",_editor.options);

                var windowheight = window.innerHeight;
                var navbarheight = document.getElementById('mynavbar').offsetHeight;
                var ed = document.querySelector('.CodeMirror');
                ed.style.height = (windowheight - navbarheight) + 'px'; 
                console.log("window, navbar, editor:", windowheight, navbarheight, ed.style.height);

                function completeAfter(cm, pred) 
                {
                    var cur = cm.getCursor();
                    if (!pred || pred()) setTimeout(function() 
                    {
                        if (!cm.state.completionActive)
                        cm.showHint({completeSingle: false});
                    }, 100);
                    return CodeMirror.Pass;
                }

                function completeIfAfterLt(cm) 
                {
                    return completeAfter(cm, function() 
                    {
                        var cur = cm.getCursor();
                        return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
                    });
                }

                function completeIfInTag(cm) 
                {
                return completeAfter(cm, function() 
                {
                    var tok = cm.getTokenAt(cm.getCursor());
                    if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
                    var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
                    return inner.tagName;
                });

              }
              return _editor;
            }

    })
    .factory('ValidationFactory', function(StorageFactory)
    {
      return {
        validateXml : validateXml
      }

      function validateXml(xmlslot, schemaslot)
      {
        var schema = StorageFactory.getGetter(schemaslot)();
        var thexml = StorageFactory.getGetter(xmlslot)();
        var message = validateXML(thexml, schema);
        console.log("message:", message);
        return message;
      }
    });

})();   