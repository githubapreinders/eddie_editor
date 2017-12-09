(function(){

'use strict';
    var app = angular.module('confab');

    app.constant('API_URL', "http://localhost:3000");
    app.constant('API_URL2', "http://localhost:8080/Ibis4Education/api/configurations/Ibis4Student/" + Math.round(+new Date()/1000));
    app.factory('StaticDataFactory', function(xmlTag, $http, StorageFactory,API_URL) 
    {

        var datasource = 'pipes';
        var JSONDATA = "jsondata";
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
            postSnippet: postSnippet,
            setDataSource: setDataSource,
            getDataSource: getDataSource,
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


        /* data is available directly in the response
        */
        function getJson()
        {
          


          return $http.get(API_URL + '/json').then(function(data)
            {
              console.info("returning json from server with status ",data.status);
              
                return data;
                
            },function (error)
            {
              console.log("server error :", error );
            });
        }  

        function loadXml(which)
        {
          console.log("file to catch:", which);
          return $http.get(API_URL + '/snippets?resource=' + which ).then(function(data)
            {
              return data;
            },function(error)
            {
              console.log("error loading xml", error);
            });
        }

        function convertXml(slot)
        {
          // console.log("slot to convert to json:", StorageFactory.getGetter(slot)());
          return $http({method:"POST",url:'http://localhost:3000/convertXml',data:StorageFactory.getGetter(slot)(),headers:{"Content-Type":'application/xml'} }).then(function(data)
            {
              return data;
            },function(error)
            {
              console.log("error loading xml", error);
            });
        }


        function postSnippet(name, description)
        {
          return convertXml(StorageFactory.getCurrentKey()).then(function (res)
          {
            var obj = 
            {
              classname : "a Wonderful World",
              type : "snippet",
              description : "the interesting description of this thing",
              xml : res.data
            };
             $http.post(API_URL+'/savesnippet', obj).then(function success(resp)
              {
                console.log("saving result", resp.status);
              },
              function failure(err)
              {
                console.log("failed result", err.status);
              });

          });
        }


    });
    /*
    facilitates local storage; we can store and retrieve values: storing : StorageFactory.getSetter(key)(value)
    retrieving : StorageFactory.getGetter(key)() ; removing a key : StorageFactory.getSetter(key)()
    */
    app.factory('StorageFactory',['storage', '$log', function(storage, $log)
    {
      var api = {};
      var thekeys = ["slot1","slot2","slot3","slot4"];
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
        }
      }
    }]);
    app.factory('EditorFactory', function()
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

    });
    app.factory('ValidationFactory', function(StorageFactory, $http, API_URL)
    {
      return {
        validateXml : validateXml
      };

      function validateXml()
      {
        // return $http({method:"POST", data:StorageFactory.getGetter(StorageFactory.getCurrentKey())(), url:API_URL + '/validate', headers:{"Content-type":"application/xml"}}).then( function(response)
        // {
        //   console.log("response:", response);
        //   return response.message; 
        // }, function failure(err)
        // {
        //   console.log("error",err);
        //   return err;
        // });

          return $http.get(API_URL + '/validate').then(function succes(res)
          {
            var thexml = StorageFactory.getGetter(StorageFactory.getCurrentKey())();
            console.log("xsd:\n",  res);
            console.log("xml:\n", typeof thexml);
            var message = validateXML(thexml, res.data);
            return message;
          },
          function fail(err)
          {
            console.log("failure....", err);
            return err;
          });  
      }
    });
    app.factory('IafFactory', function($http, API_URL2)
    {
    var uname = null;
    var pw = null;
    // var API_URL = 'http://localhost:3000';  
      return{
        postZip : postZip,
        setCredentials : setCredentials
      };

      function postZip(zipfile)
      {
        return $http({method: 'POST',url:API_URL2 , data:zipfile , headers:{'Content-type':'application/xml'}}
            ).then(function succes(response)
            {
                console.info("returning from backend",response);
                return response;
            }, function failure(response)
            {
                console.info("returning error from backend",response);
                return response;
            });
      }

      function setCredentials(server, uname, pw)
      {
        console.log("server",server, uname, pw);
        if(!pw || !uname)
        {
          return;
        }
        if (server)
        {
          API_URL = server;
        }
        uname = uname;
        pw = pw;

        return{
          apiurl:API_URL,
          uname : uname,
          pw : pw
        };


      }


    });

})();   