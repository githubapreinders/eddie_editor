(function(){

'use strict';
    var app = angular.module('confab');
    
    app.constant('UPLOAD_URL',"/iaf/api/configurations");
    
    //Setting the IAF_URL constant depending on the stage we're in.
    getIAFConstant();
    function getIAFConstant()
    {
      var theurl = window.location.hostname;
      //console.log("making constants....", theurl);
      switch(theurl)
      {
        case "localhost" :
        {
          // app.constant('IAF_URL', "http://localhost:8080/Ibis4Education");
          app.constant('IAF_URL', "http://localhost:8080/Ibis4Education");
          // var completeurl = window.location.href;
          // app.constant('IAF_URL', completeurl.split('/iaf/')[0]);

          break;
        }
        case "ibis4education-env.bz46fawhzf.eu-central-1.elasticbeanstalk.com":
        {
          app.constant('IAF_URL', "http://ibis4education-env.bz46fawhzf.eu-central-1.elasticbeanstalk.com"); 
          break;
        }
        case "ibis4edproduction-env.c4weisckkn.eu-central-1.elasticbeanstalk.com":
        {
          app.constant('IAF_URL', "http://ibis4edproduction-env.c4weisckkn.eu-central-1.elasticbeanstalk.com"); 
          break;
        }
        default :
        {
          app.constant('IAF_URL', "http://localhost:8080/Ibis4Education");
          break;
        }
      }
    }


    app.factory('StaticDataFactory', function(xmlTag, $http, StorageFactory, $interval, IAF_URL) 
    {
      console.log("StaticDatafactory...");

        var datasource = 'pipes';
        var themes = ["twilight", "monokai", "neat"];
        var fontSizes = [12,13,14,15,16,17,18,19,20];
        var thejson = null;
        var selectedItem = null;
        var projectname = null;
        var reqparams = null;
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
            setDataSource: setDataSource,
            getDataSource: getDataSource,
            getFormattingSettings: getFormattingSettings,
            getThemes: getThemes,
            getFontSizes: getFontSizes,
            setSelectedItem : setSelectedItem,
            getSelectedItem : getSelectedItem,
            getProjectName :getProjectName,
            setProjectName : setProjectName,
            setReqParams : setReqParams ,
            getReqParams : getReqParams

        };
        
        function setReqParams(instance, vers)
        {
        	reqparams = {"instancename":instance,"version":vers}
        	console.log("iaf url: ", IAF_URL, this.reqparams);
        }
        
        function getReqParams()
        {
        	//console.log("returning params: ");
        	return(reqparams);
        }
        
        
        function getProjectName()
        {
          //console.log("returning projectname: ", projectname);
          return projectname;
        }

        function setProjectName(name)
        {
          //console.log("setting projectname: ", projectname);
          projectname = name;
        }

        function setSelectedItem(item)
        {
          selectedItem = item;
        }

         function getSelectedItem()
        {
          return selectedItem;
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

          // return $http.get(IAF_URL + '/api/getjson').then(
          

          return $http.get('https://ibissource.org/eddie/jsonmonster.json').then(
          // return $http({method:'GET',url:'https://ibissource.org/eddie/jsonmonster.json',
          //   headers:{'content-type':"application/json", 'Authorization':''}}).then(
          function success(data)
          {
              //console.info("returning json from server with status ",data.status);

              // thejson = data.data.JSONMONSTER.MYMONSTER;
              thejson = data.data;
              return data;
          },
          function fail(err)
          {
            //console.log("server error :", err );
          });

        }  

        //returns the datamodel for the moderatorController
        function getStaticJson()
        {
          return thejson;
        }
    });

    /*
    facilitates local storage; we can store and retrieve values: storing : StorageFactory.getSetter(key)(value)
    retrieving : StorageFactory.getGetter(key)() ; removing a key : StorageFactory.getSetter(key)()
    */
    //TODO make exceptions for 'auth-token' key
    app.factory('StorageFactory',['storage', '$log', function(storage, $log)
    {
      console.log("StorageFactory...");
      var api = {};
      var thekeys;
      var thealiases;
      var currentKey;
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
        changeKeys : changeKeys,
        getListOfDirectories : getListOfDirectories,
        getListOfFiles : getListOfFiles,
        checkIfEmptyKey : checkIfEmptyKey
      };

      function initialise()
      {

        if(storage.getKeys().indexOf("ngIdle.expiry") > -1)
        {
            getSetter("ngIdle.expiry")();
        }  


        if(storage.getKeys().length === 0 || storage.getKeys().length === 1 && getGetter('auth-token')() !== null)
        {
          //console.log("adding files...");
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
          thealiases = ["file1"];
          currentKey= "slot1";
          var myslots = { 2 : {"title":"file1",isLocked:false} };              
          getSetter("thejson")(thejson);//setting file structure in localstorage; w
          getSetter("myslots")(myslots);//setting the open files configuration
          thekeys = createKeys(["file1"]);
        }
        else
        {
          var helper = storage.getKeys();
          //console.log("adding from local storage contents.", helper);

          if(helper.indexOf("thejson") > -1)
          {
              helper.splice(helper.indexOf("thejson"),1);
          }  
          if(helper.indexOf("myslots") > -1)
          {
              helper.splice(helper.indexOf("myslots"),1);
          } 
          if(helper.indexOf("auth-token") > -1)
          {
              helper.splice(helper.indexOf("auth-token"),1);
          }

          thekeys = createKeys(helper); 
          //console.log("created keys:", thekeys);
        }
        currentKey = thekeys[0];

      }

      function checkIfEmptyKey()
      {
        var keys = storage.getKeys();
        for(var i=0 ;i<keys.length; i++)
        {
          ////console.log("values ",keys[i], localStorage.getItem(keys[i]));
          if (localStorage.getItem(keys[i]).length === 2)
          {
            //console.log("emtpy value! ");
            return true;
          }
        }
        return false;
      }



      /*
        We scan the json from the localstorage for directories, using a regular expression to extract them.      
      */
      function getListOfDirectories()
      {
          var thejson = getGetter('thejson')();
          var regex = new RegExp('(?<="isDirectory":true,"title":").*?"','g'); 
          var dirs = JSON.stringify(thejson).match(regex);
          // var dirs = JSON.stringify(thejson).match(/(?<="isDirectory":true,"title":").*?"/g);
          for(var i=0 ; i< dirs.length; i++)
          {
            dirs[i] = dirs[i].replace('\"','/'); //replacing the last quote with a slash
          }
          //console.log("directories: ", dirs);
          return dirs;
      }


      function getListOfFiles()
      {
        var files = [];
        if(thekeys === undefined)
        {
          return files;
        }
        thekeys.forEach(function(key)
        {
          files.push(key.title);
        });
        return files;
      }

      function changeKeys(oldname, newname)
      {
        //console.log(oldname , newname,"\n", thekeys, currentKey, "\n");
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
        //console.log("after change: ", thekeys,"\n", currentKey, "\n");
      }

      function deleteAll()
      {
        var keys = storage.getKeys();
        keys.forEach(function(key)
        {
          if(key !== 'auth-token')
          {
            getSetter(key)();
          }
        });
      }

      function switchKey()
      {
          var helper = thekeys.shift();
          thekeys.push(helper);
          currentKey = thekeys[0];
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

      //responding to the add new file button in the file browser;we just add the xml-declaration as its contents
      function getNewSlotname(createdAlias, theid)
      {
        //console.log("id ", theid);
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
       //console.log("set currentkey::", key); 
        currentKey = key;
      }

      function getCurrentKey()
      {
        ////console.log("currentkey::", currentKey);
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
        };
      }
    }]);
    app.factory('EditorFactory', function()
    {
    console.log("Editorfactory...");
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

                //console.log("editor loaded;",_editor.options);

                var windowheight = window.innerHeight;
                var navbarheight = document.getElementById('mynavbar').offsetHeight;
                var ed = document.querySelector('.CodeMirror');
                ed.style.height = (windowheight - navbarheight) + 'px'; 
                //console.log("window, navbar, editor:", windowheight, navbarheight, ed.style.height);

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
    app.factory('ValidationFactory', function(StorageFactory, $http, IAF_URL )
    {
      

      return {
        validateXml : validateXml
      };

      function validateXml()
      {

      }
    })

     /*
     The Map function registers the keys pushed at the moment and stores them into a map; from the
     directive this map is consulted to see which navigational action has to be taken. The amount of
     words in a text and the total length are being kept track of.
     */
    app.factory("KeystrokeService", function ()
    {
        var map = {};
        var thewords = 0;
        var currentword = "";
        var amountOfWords = 0;
        var closed = true;
        var selectionCoords = {};

        return {
            currentword: currentword,
            getMap: getMap,//helpers to register current key combinations (arrows, alt keys etc)
            setMap: setMap,
            clearMap: clearMap,
            setWords: setWords,
            changeLength: changeLength,
            setCurrentWord: setCurrentWord,
            getTextLength: getTextLength,
            getCurrentWord: getCurrentWord,
            getWords: getWords,
            setAmountOfWords: setAmountOfWords,
            getAmountOfWords: getAmountOfWords,
            getClosed: getClosed,//helpers to fixate the cursor at the end or beginning of a word to prevent 'cursor jumping'
            setClosed: setClosed,
            getSelectionCoords: getSelectionCoords, //helper to keep track of drag start
            setSelectionX: setSelectionX,
            setSelectionY: setSelectionY,
            clearSelectionCoords:clearSelectionCoords
        };

        function getSelectionCoords()
        {
            return selectionCoords;
        }

        function setSelectionY(yCoord)
        {
            selectionCoords = { y:yCoord};
        }

        function setSelectionX(xCoord)
        {
            selectionCoords = { x:xCoord};
        }

        function clearSelectionCoords()
        {
            selectionCoords = {};
        }


        function getClosed()
        {
            return closed;
        }

        function setClosed(status)
        {
            closed = status;
        }


        function setAmountOfWords(digit)
        {
            amountOfWords = digit;
        }

        function getAmountOfWords()
        {
            return amountOfWords;
        }


        function changeLength(word)
        {
            //if we see a split in the current word or a split word being restored we adapt the amount of words. The
            // 'lengthChange' listener in the controller will update the view.
            amountOfWords += (word.split(/\s+/).length - currentword.split(/\s+/).length);

            //amount of characters is measured here.
            var difference = (word.length - currentword.length);
            thewords += difference;
            // console.log("change length, total words length " + thewords);
            currentword = word;
        }

        function setCurrentWord(word)
        {
            currentword = word;
        }

        function getCurrentWord()
        {
            return currentword;
        }

        function getTextLength()
        {
            return thewords;
        }


        function setWords(textlength)
        {
            // console.log("updating model...");
            thewords = textlength;
        }


        function getWords()
        {
            return thewords;
        }

        function clearMap()
        {
            map = {};
        }

        function setMap(key, value)
        {
            map[key] = value;
        }

        function getMap()
        {
            return map;
        }
    });


    

})();   