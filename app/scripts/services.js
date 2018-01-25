(function(){

'use strict';
    var app = angular.module('confab');

    app.constant('API_URL', "http://localhost:3000");
    app.constant('UPLOAD_URL',"http://localhost:8080/Ibis4Education/iaf/api/configurations");
    app.constant('DOWNLOAD_URL',"http://localhost:3000/getzip");
    //app.constant('DOWNLOAD_URL',"http://localhost:8080/Ibis4Education/api/configurations/download/Ibis4Education/");

    // app.constant('IAF_URL', "dummy value");
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
                };

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

     app.factory('ZipService', function (StorageFactory, $http ,DOWNLOAD_URL, UPLOAD_URL)
     {
        var myslots;
        return {
            init : init,
            getSlots : getSlots,
            getZip : getZip,
            getZipFromFile : getZipFromFile,
            sendZip : sendZip,
            getMySlots : getMySlots
        };


        function init()
        {
            return StorageFactory.getGetter("thejson")();
        }

        function getSlots()
        {
            return StorageFactory.getGetter("myslots")();
        } 

        function getMySlots()
        {
            return myslots;
        } 

        function sendZip(saveas)
        {
                return new Promise(function(resolve, reject)
                {
                var zip = new JSZip();
                var elements = document.querySelectorAll('[ui-tree-node]');
                //each tree element gets a filename and we grab the content from storage


                elements.forEach(function(item)
                {
                    var object = angular.element(item).scope();
                    var parents = [];

                    while(object.$parentNodeScope !== null)
                    {
                        parents.push(object.$parentNodeScope.$modelValue.title);
                        object = object.$parentNodeScope;
                    }
                    //console.log("parents of...", object.$modelValue.title,"\n",parents);       

                    var filename = "";
                    while(parents.length > 0)
                    {   
                        filename += cropFilter(parents.pop()) + '/';
                        // console.log("filename: ", filename, "\n");
                    }
                    

                    // Het framework wil een configuration file perse met rootfolder hebben, zodoende dit onlogische stukje.
                    //"Ibis4Student/" +
                    if(cropFilter(angular.element(item).scope().$modelValue.title) === 'Configuration.xml')
                    {
                      
                      filename = "Ibis4Student/Configuration.xml";
                    }
                    else
                    {
                      
                      filename =  filename + cropFilter(angular.element(item).scope().$modelValue.title) ;
                    }
                    // console.log("filename finally: ", filename, "\n\n");

                    if(angular.element(item).scope().$modelValue.isDirectory)
                    {
                        // console.log("adding directory", angular.element(item).scope().$modelValue);
                        zip.folder(filename);
                    }
                    else
                    {   
                        var theslot = StorageFactory.getGetter(angular.element(item).scope().$modelValue.title)();
                        zip.file(filename,StorageFactory.getGetter(theslot)());
                    }
                });


                console.log("Zipfile ", zip);
                //takes a path pattern and returns the last part: "dir1/subdir2/myfile.txt" => "myfile.txt"
                function cropFilter(item)
                {
                    if(item === undefined) return "";
                    var helper = item.substring(item.lastIndexOf('/') + 1 ,item.length);
                    if(helper.length > 0)
                    {
                        return helper;
                    }
                    else
                    {
                        return item;
                    }
                }

                if(saveas)//responding to the save button in the treeview using file-saver API
                {
                  console.log("saving as a zip file...");
                  zip.generateAsync({type:"blob"}).then(function(myzip)
                  {
                    var blob = new Blob([myzip],{type:"application/zip"});
                    console.log("generated a zip...", blob);
                    saveAs(blob, "configuration.zip");
                    resolve();
                  });
                }
                else //sending zip file to IAF
                {
                  postConfig(zip).then(function success(resp)
                  {
                    console.log("returning from postconfig");
                    resolve(resp);
                  },function failure(err)
                  {
                    console.log("returning error from postconfig");
                    reject(err);
                  });
                }
                });
        }


        function postConfig(zip)
        {
          return new Promise(function(resolve, reject)
          {
            if(UPLOAD_URL === undefined || typeof UPLOAD_URL !== 'string')
            {
              alert("add a correct IAF url");
              return 'error';
            }

            var finalurl = UPLOAD_URL;
            alert(finalurl);
            zip.generateAsync({type:"blob"}).then(function(myzip)
            {
              var fileName = 'configuration.zip';
              var fd = new FormData();
              fd.append("realm", 'jdbc');
              fd.append("name", "Ibis4Student");
              fd.append("version", 1);
              fd.append("encoding", 'utf-8');
              fd.append("multiple_configs", false);
              fd.append("activate_config", true);
              fd.append("automatic_reload", true);
              fd.append("file", myzip, fileName);

              console.log("posting to iaf", myzip);
              $http({method: 'POST',url:finalurl , data: fd , headers:{'Content-type': undefined}})
              .then(function succes(response)
              {
                  console.info("returning from backend",response);
                  resolve (response);
              }, function failure(err)
              {
                  console.info("returning error from backend",err);
                  reject(err);
              });

              });//end of JSZIP promise

            });//end of new promise

        }


        function getZipFromFile(file)
        {
          return JSZip.loadAsync(file).then(function(zip)
            {
              console.log("loadasync from file...", zip);
              StorageFactory.deleteAll();
              var myzipfiles = [];
              
              //removing the mac specific entries...don't know whether this is the proper way...
              zip.forEach(function(relativePath, file)
              {
                if(file.name.substring(0,2) !== '__')
                {
                  myzipfiles.push(file);
                }
              });
    
              /*Write to local storage; to avoid collisions, the calls
              are made synchronously.*/
              storeZip(0);
              
              function storeZip(index)
              {
                if(index > myzipfiles.length-1)
                {
                  return;
                }
                else
                {
                  if(!(myzipfiles[index].dir))
                  {
                    myzipfiles[index].async("string").then(function resolve(data)
                    {
                        var newslotname = "slot" + Math.ceil(Math.random()*1000);
                        StorageFactory.getSetter(myzipfiles[index].name)(newslotname);
                        StorageFactory.getSetter(newslotname)(data);
                        index++;
                        storeZip(index++);
                    });
                  }
                  else
                  {
                    index++;
                    storeZip(index);
                  }
                }
              }                              

              console.log("zipfiles",myzipfiles);
              var myjson=[];
              myslots = {};

              //creation of a flat json structure              
              for(var i =0 ; i< myzipfiles.length ; i++)
              {
                if(myzipfiles[i].dir)
                {
                    myjson.push({
                    id : Math.ceil(Math.random() * 10000),  
                    isDirectory : myzipfiles[i].dir,
                    title : myzipfiles[i].name.substring(0,myzipfiles[i].name.length-1),
                    nodes : []
                    });
                }
                else
                {
                  var myobj = {
                    id : Math.ceil(Math.random() * 10000),
                    isDirectory : myzipfiles[i].dir,
                    title : myzipfiles[i].name,
                    nodes : []
                    };
                  myjson.push(myobj);
                  myslots[myobj.id] = {title:myobj.title, isLocked:false};
                }
              }

              //sorting the array: highest amount of nodes first .
              myjson.sort(function compare(val1, val2)
              {
                if(val1.title.split('/').length > val2.title.split('/').length)
                {
                  return -1;
                }
                if(val1.title.split('/').length < val2.title.split('/').length)
                {
                  return 1;
                }
                return 0;
              });

                var helper = 0;//emergency variable to prevent a possible eternal loop
                var parentsfound = true; //escapes the while loop when we had a run with no results

                
                /*
                adding children to the parents node arrays; when there is a parent found myjson is changed
                and we will start the loop again
                */
                while(parentsfound &&  helper <100)
                {
                  parentsfound = false;
                  var copy = myjson;

                  for(var index = 0 ; index < myjson.length; index ++)
                  {
                    for(var j=0 ; j< copy.length; j++)
                    {
                      if(isParent(myjson[index].title, copy[j].title))
                      {
                        // console.log(myjson[index].title, "direct parent of " ,copy[j].title);
                        // console.log("myjson",myjson);
                        myjson[index].nodes.push(copy[j]);
                        myjson.splice(j,1);
                        parentsfound = true;
                        break;
                      }
                    }
                    if(parentsfound)
                    {
                      break;
                    }
                  }
                  helper ++;
                }
               


                /* Main helper function of the recursive loop; "dir1/dir2/file1.abc" compared with "dir1/dir2" will
                regard this as a direct parent-child relationship. */ 
                function isParent(possibleparent, candidate)
                {
                  if(possibleparent === candidate)
                  {
                    return false;
                  }
                  var index = candidate.lastIndexOf('/');
                  if(candidate.substring(0,index) === possibleparent)
                  {
                    return true;
                  }
                  else
                  {
                    return false;
                  }
                }

                console.log("generated json out of zip:\n",myjson);

                //saving json and working files structure to local storage, and returning to the caller
                StorageFactory.getSetter('thejson')(myjson);
                StorageFactory.getSetter('myslots')(myslots);  
                return(myjson); 

              });//end of jszip async call
        }






        /*
          retrieves IAF configuration zip file via http, and transforms this zipfile  to a json object
          the zipfiles data are stored in LocalStorage;
        */
        function getZip()
        {

          return $http({method:"GET", url:DOWNLOAD_URL, responseType:'arraybuffer'}).then(function success(resp)
          {
            return new Promise(function (resolve, reject)
            {
            JSZip.loadAsync(resp.data).then(function(zip)
            {
              console.log("loadasync...", zip);
              StorageFactory.deleteAll();
              var myzipfiles = [];
              
              //removing the mac specific entries...don't know whether this is the proper way...
              zip.forEach(function(relativePath, file)
              {
                if(file.name.substring(0,2) !== '__')
                {
                  myzipfiles.push(file);
                }
              });
    
              /*Write to local storage; to avoid collisions, the calls
              are made synchronously.*/
              storeZip(0);
              
              function storeZip(index)
              {
                if(index > myzipfiles.length-1)
                {
                  return;
                }
                else
                {
                  if(!(myzipfiles[index].dir))
                  {
                    myzipfiles[index].async("string").then(function resolve(data)
                    {
                        var newslotname = "slot" + Math.ceil(Math.random()*1000);
                        StorageFactory.getSetter(myzipfiles[index].name)(newslotname);
                        StorageFactory.getSetter(newslotname)(data);
                        index++;
                        storeZip(index++);
                    });
                  }
                  else
                  {
                    index++;
                    storeZip(index);
                  }
                }
              }                              

              console.log("zipfiles",myzipfiles);
              var myjson=[];
              myslots = {};

              //creation of a flat json structure              
              for(var i =0 ; i< myzipfiles.length ; i++)
              {
                if(myzipfiles[i].dir)
                {
                    myjson.push({
                    id : Math.ceil(Math.random() * 10000),  
                    isDirectory : myzipfiles[i].dir,
                    title : myzipfiles[i].name.substring(0,myzipfiles[i].name.length-1),
                    nodes : []
                    });
                }
                else
                {
                  var myobj = {
                    id : Math.ceil(Math.random() * 10000),
                    isDirectory : myzipfiles[i].dir,
                    title : myzipfiles[i].name,
                    nodes : []
                    };
                  myjson.push(myobj);
                  myslots[myobj.id] = {title:myobj.title, isLocked:false};
                }
              }

              //sorting the array: highest amount of nodes first .
              myjson.sort(function compare(val1, val2)
              {
                if(val1.title.split('/').length > val2.title.split('/').length)
                {
                  return -1;
                }
                if(val1.title.split('/').length < val2.title.split('/').length)
                {
                  return 1;
                }
                return 0;
              });

                var helper = 0;//emergency variable to prevent a possible eternal loop
                var parentsfound = true; //escapes the while loop when we had a run with no results

                
                /*
                adding children to the parents node arrays; when there is a parent found myjson is changed
                and we will start the loop again
                */
                while(parentsfound &&  helper <100)
                {
                  parentsfound = false;
                  var copy = myjson;

                  for(var index = 0 ; index < myjson.length; index ++)
                  {
                    for(var j=0 ; j< copy.length; j++)
                    {
                      if(isParent(myjson[index].title, copy[j].title))
                      {
                        // console.log(myjson[index].title, "direct parent of " ,copy[j].title);
                        // console.log("myjson",myjson);
                        myjson[index].nodes.push(copy[j]);
                        myjson.splice(j,1);
                        parentsfound = true;
                        break;
                      }
                    }
                    if(parentsfound)
                    {
                      break;
                    }
                  }
                  helper ++;
                }
               


                /* Main helper function of the recursive loop; "dir1/dir2/file1.abc" compared with "dir1/dir2" will
                regard this as a direct parent-child relationship. */ 
                function isParent(possibleparent, candidate)
                {
                  if(possibleparent === candidate)
                  {
                    return false;
                  }
                  var index = candidate.lastIndexOf('/');
                  if(candidate.substring(0,index) === possibleparent)
                  {
                    return true;
                  }
                  else
                  {
                    return false;
                  }
                }

                console.log("generated json out of zip:\n",myjson);

                //saving json and working files structure to local storage, and returning to the caller
                StorageFactory.setCurrentKey(myslots[0]);
                StorageFactory.getSetter('thejson')(myjson);
                StorageFactory.getSetter('myslots')(myslots);  
                resolve(myjson); 

              });//end of jszip async call

            });//end of Promise (necessary because of nested promises...)

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
        initialise : initialise,
        deleteAll : deleteAll,
        changeKeys : changeKeys
      };

      function changeKeys(oldname, newname)
      {
        console.log(oldname , newname,"\n", thekeys, currentKey, "\n");
        var index = -1;
        var islocked = "";
        for(var i= 0 ; i< thekeys.length ; i++)
        {
          if(thekeys[i].title === oldname)
          {
            index = i;
            islocked = thekeys[i].isLocked;
          }
        }
        if(index !== -1)
        {
          if(currentKey.title === oldname)
          {
            currentKey.title = newname;
          }
          thekeys[index].title = newname;
        }
        console.log("after change: ", thekeys,"\n", currentKey, "\n");
      }

      function deleteAll()
      {
        var keys = storage.getKeys();
        keys.forEach(function(key)
        {
          if(key !== 'IAF_URL')
          {
            getSetter(key)();
          }
        });
      }

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




      //responding to the add new button in the file browser
      function getNewSlotname(createdAlias, theid)
      {
        console.log("id ", theid);
        var newslotname = "slot" + Math.ceil(Math.random()*1000);
        var theobject = { "title" : createdAlias, "isLocked" : false };
        thekeys.push(theobject);
        getSetter(newslotname)('<?xml version="1.0" encoding="UTF-8"?>');
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
          if(helper.indexOf("IAF_URL") > -1)
          {
              helper.splice(helper.indexOf("IAF_URL"),1);
          } 

          thekeys = createKeys(helper); 
        }
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
          if(val.substring(0,4) !== 'slot' )
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
    app.factory('IafFactory', function($http, StorageFactory, UPLOAD_URL)
    {
      
    var uname = null;
    var pw = null;
      return{
        postConfig : postConfig,
        setCredentials : setCredentials,
        setIAFURL : setIAFURL
      };

      //restoring value from localstorage during initialisation
      function setIAFURL()
      {
        UPLOAD_URL = StorageFactory.getGetter('UPLOAD_URL')();
      }

      //resonding to the paperplane button upper right
      function postConfig(zip)
      {
        return new Promise(function(resolve, reject)
        {
          var finalurl = UPLOAD_URL;
          alert(finalurl);
        zip.generateAsync({type:"blob"}).then(function(myzip)
        {
          var fileName = 'configuration.zip';
          var fd = new FormData();
          fd.append("realm", 'jdbc');
          fd.append("name", "Ibis4Student");
          fd.append("version", 1);
          fd.append("encoding", 'utf-8');
          fd.append("multiple_configs", false);
          fd.append("activate_config", true);
          fd.append("automatic_reload", true);
          fd.append("file", myzip, fileName);


          return new Promise(function(resolve, reject)
          {
             console.log("posting to iaf", myzip);
              return $http({method: 'POST',url:finalurl , data: fd , headers:{'Content-type': undefined}}
                  ).then(function succes(response)
                  {
                      console.info("returning from backend",response);
                      resolve (response);
                  }, function failure(response)
                  {
                      console.info("returning error from backend",response);
                      reject(response);
                  });
                })            
          });
        resolve();
        })



      }

      //responding to the submit button in the authentication area.
      function setCredentials(server, uname, pw)
      {
        console.log("server",server, uname, pw);
       
        if (server)
        {
          UPLOAD_URL = server;
          console.log("upload url", UPLOAD_URL, typeof(IAF_URL));
          StorageFactory.getSetter('UPLOAD_URL')(server);
        }
        uname = uname;
        pw = pw;

        return{
          apiurl:server,
          uname : uname,
          pw : pw
        };
      }
    });

})();   