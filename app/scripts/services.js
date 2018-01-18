(function(){

'use strict';
    var app = angular.module('confab');

    app.constant('API_URL', "http://localhost:3000");
    app.constant('IAF_URL', "http://localhost:8080/Ibis4Education/api/configurations/Ibis4Student/" + Math.round(+new Date()/1000));
    app.factory('StaticDataFactory', function(xmlTag, $http, StorageFactory,API_URL, $interval) 
    {

        var datasource = 'pipes';
        var timerId = 0 ;
        var themes = ["twilight", "monokai", "neat"];
        var fontSizes = [12,13,14,15,16,17,18,19,20];
        var thejson = null;
        var selectedItem = null;

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
            getStaticJson : getStaticJson,
            loadXml : loadXml,
            setDataSource: setDataSource,
            getDataSource: getDataSource,
            getFormattingSettings: getFormattingSettings,
            getThemes: getThemes,
            getFontSizes: getFontSizes,
            setTimerId : setTimerId,
            stopTimer : stopTimer,
            setSelectedItem : setSelectedItem,
            getSelectedItem : getSelectedItem

        };

        function setSelectedItem(item)
        {
          selectedItem = item;
        }

         function getSelectedItem()
        {
          return selectedItem;
        }

        function setTimerId(timerid)
        {
          timerId = timerid;
        }


        function stopTimer()
        {
          $interval.cancel(timerId);
        }

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
                thejson = data.data;
                return data;
                
            },function (error)
            {
              console.log("server error :", error );
            });
        }  

        //returns the datamodel for other controllers
        function getStaticJson()
        {
          return thejson;
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

    });

     app.factory('ZipService', function (StorageFactory, $http, API_URL)
     {
        
        return {
            init : init,
            getSlots : getSlots,
            getZip : getZip
        };

        function init()
        {
            return StorageFactory.getGetter("thejson")();
        }

        function getSlots()
        {
            return StorageFactory.getGetter("myslots")();
        } 

        function getZip()
        {

          return $http({method:"GET", url:API_URL + "/getzip", responseType:'arraybuffer'}).then(function success(resp)
          {
            JSZip.loadAsync(resp.data).then(function(zip)
            {
              var myzipfiles = [];

              zip.forEach(function(relativePath, file)
              {
                if(file.name.substring(0,2) !== '__')
                {
                  myzipfiles.push(file);
                }
              });

              var myjson=[];
              myzipfiles = myzipfiles.slice(1, myzipfiles.length);
              console.log("zipfiles",myzipfiles);
              

              for(var i = 0 ; i < myzipfiles.length; i++)
              {
                myjson.push({title:myzipfiles[i].name, nodes:[], isDirectory:myzipfiles[i].dir})
              }

              for(var i = 0 ; i < myjson.length; i++)
              {
                var container = myjson[i];
                var helper is _.myjson.without(i);
              }
              

              

              //check where to add in json
              function traverseArray(basepath, originobject)
              {
                var path = basepath.split('/');
                cleanArray(path);
                console.log("path:",path);
                if(myjson.length === 0 )
                {
                  myjson.push(addItem(path , { title:path.shift(), nodes:[]}));
                  console.log("myjson", myjson);
                }

                else
                {
                  var pathsegment = path.shift();
                  if(pathsegment.split('.') > -1)
                  {
                    originobject.nodes.push( {title:pathsegment, nodes:[], isDirectory: false} )
                    return;
                  }
                  if(myjson[i].title === pathsegment
                  {
                    //run the function again but the with the smaller path and inserting into the nodes array of 'this'

                  }
                }



              }


              function find(node, value) {
              if (node.title === value) 
              {
                  return node;
              } else 
              {
                  for (var i = 0; i < node.nodes.length; i++) 
                  {
                      var found = find(node.nodes[i], value);
                      if (found !== null) 
                      {
                          return found;
                      }
                  }
                  return null;
              }
            }



              function addItem(array,obj)
              {
                if(array.length > 0 )
                {
                  obj.nodes.push({title:array.shift(),nodes:[]})
                  //console.log(obj);
                  addItem(array, obj);
                }
                  return obj;
              }

              
              function cleanArray(array)
              {
                while(array.indexOf('') > -1)
                {
                  array.splice(array.indexOf(''),1)
                }
                return array;
              }

              // function traverseArray(jsonitem, index)
              // {
              //     if(jsonitem.isDirectory)
              //     {

              //       jsonitem.nodes.push({});
              //       traverseArray(myzipfiles.shift());
              //     }
              //     else
              //     {
              //       myjson.push(jsonitem)
              //       traverseArray(myzipfiles.shift(), index)
              //     }
              //     console.log(myjson);
              // }

              function checkForDirectChildren(sublist)
              {
                var children = [];
                for (var j = 0; j < sublist.length; j++ )
                {
                  if(isSubItem(myzipfiles[i].name, sublist[j].name))
                  {
                    children.push(sublist[j].name);
                  }
                }
                return children;
              }
                


              function isSubItem(containerstring, candidatestring)
              {

                if(candidatestring.indexOf(containerstring) > -1)
                {
                  return true;
                }
                else 
                {
                  return false;
                }

              }




          });//end of jszip async call






        });//end of http

      }//end of method getzip



     });//end of factory




    /*
    facilitates local storage; we can store and retrieve values: storing : StorageFactory.getSetter(key)(value)
    retrieving : StorageFactory.getGetter(key)() ; removing a key : StorageFactory.getSetter(key)()
    */
    app.factory('StorageFactory',['storage', '$log', function(storage, $log)
    {
      var api = {};
      var thekeys;
      var thealiases = ["file1"];
      var currentKey = "slot1";
      var myaliases;
      
      return {
        getSetter : getSetter,
        getGetter : getGetter,
        verifyKey : verifyKey,
        createAPIForKey : createAPIForKey,
        createSetter : createSetter,
        createGetter : createGetter,
        getAliases : getAliases,
        switchKey : switchKey,
        setCurrentKey : setCurrentKey,
        getCurrentKey : getCurrentKey,
        getNewSlotname : getNewSlotname,
        initialise : initialise
      };

      function switchKey()
      {
          var helper = thekeys.shift();
          thekeys.push(helper);
          currentKey = thekeys[0]
          return thekeys[0];
      }

      //remove from keys array
      function removeKey(itsAlias)
      {
        var index;
        for(var i =0 ; i< thekeys.length; i++)
        {
          if(thekeys[i].title === itsAlias)
          {
              index = i;
          }
        }
        thekeys.splice(index, 1);

        if(currentKey.title === itsAlias)//check if the file we're working on is deleted
        {
          currentKey = thekeys[0];
        }
      }

      function getNewSlotname(createdAlias, theid)
      {
        console.log("id ", theid);
        var newslotname = "slot" + Math.ceil(Math.random()*1000);
        var theobject = { "title" : createdAlias, "isLocked" : false };
        thekeys.push(theobject);
        getSetter(newslotname)("enter a value");
        getSetter(createdAlias)(newslotname);
        var helper = getGetter("myslots")();
        helper[theid] = theobject;
        getSetter("myslots")(helper);
        return newslotname;
      }

      function initialise()
      {
        
        if(storage.getKeys().length === 0)
        {
          getSetter("slot1")(" start here...");
          getSetter("file1")("slot1");
          var thejson = [
                          {
                            "id": 1,
                            "title": "dir1",
                            "isDirectory": true,
                            "nodes": [
                              {
                                "id": 2,
                                "title": "file1",
                                "isDirectory": false,
                                "isLocked": false,
                                "nodes": []
                              }
                            ]
                          }
                        ];
          var myslots = { 2 : {"title":"file1",isLocked:false} };              
          getSetter("thejson")(thejson);//setting file structure in localstorage; w
          getSetter("myslots")(myslots);//setting the open files configuration
          thekeys = createKeys(["file1"]);
        }
        else
        {
          var helper = storage.getKeys();
          if(helper.indexOf("thejson") > -1)
          {
              helper.splice(helper.indexOf("thejson"),1);
          }  
          if(helper.indexOf("myslots") > -1)
          {
              helper.splice(helper.indexOf("myslots"),1);
          } 
          thekeys = createKeys(helper); 
        }
        currentKey = thekeys[0];
        // console.log("thekeys: ", thekeys);
        // console.log("currentKey: ", currentKey);
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


      //current key is an object { title:"", isLocked: bool }
      function setCurrentKey(key)
      {
       console.log("set currentkey::", key); 
        currentKey = key;
      }

      function getCurrentKey()
      {
        //console.log("currentkey::", currentKey);
        return currentKey;
      }      


      function createKeys(helper)
      {
        var result = [];
        helper.forEach(function(val)
        {
          if(val.substring(0,4) !== 'slot')
          {
            result.push({"title" : val, "isLocked" : false});
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
    app.factory('IafFactory', function($http, IAF_URL)
    {
    var uname = null;
    var pw = null;
      return{
        postConfig : postConfig,
        setCredentials : setCredentials
      };

      function postConfig(zipfile)
      {
        console.log("posting to iaf");
        return $http({method: 'POST',url:IAF_URL , data:zipfile , headers:{'Content-type':'application/xml'}}
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