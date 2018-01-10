(function (){
    'use strict';

    angular.module('confab')
        .controller('IndexController', function ($scope,$interval,$timeout, xmlTag, attributeObject, StaticDataFactory, StorageFactory, EditorFactory, ValidationFactory, IafFactory, ModeratorFactory)
        {

            console.log('IndexController...');
            var vm = this;
        
            //Functions
            vm.submitForm = submitForm;
            vm.codemirrorLoaded = getEditor;
            vm.setSelectedClass = setSelectedClass;
            vm.toggle_datasource = toggle_datasource;
            vm.styleEditorContent = styleEditorContent;
            vm.clearEditor = clearEditor;
            vm.showNav = showNav;
            vm.showConf = showConf;
            vm.storeData = storeData;
            vm.retrieveData = retrieveData;
            vm.toggleSlot = toggleSlot;
            vm.modifyAlias = modifyAlias;
            vm.checkDefaults = checkDefaults;
            vm.changeTheme = changeTheme;
            vm.changeFontSize = changeFontSize;
            vm.validateXml = validateXml;
            vm.sendToIaf = sendToIaf;
            vm.toggleSpinner = toggleSpinner;
            vm.setCredentials = setCredentials;
            vm.setAvailableLesson = setAvailableLesson;
            vm.toggleReadonly = toggleReadonly;
            vm.unlock = unlock;

            //Static values
            vm.message = "Angular Controller is working allright...";
            vm.userInput = "";
            vm.datasource = StaticDataFactory.getDataSource();
            vm.navigatorModel = null;
            vm.selectedItem = null;
            vm.showPropertyDescription = false;
            vm.selectedProperties = {};
            vm.showConfig = false;
            vm.showNavigator = true;
            vm.showFullEditor = false;
            var editor = null;
            var thedocument = null;    
            vm.timerId = null;
            vm.showValidationMessage = false;
            vm.validationMessage = null;

            //Editor Styling
            vm.themes = StaticDataFactory.getThemes();
            vm.selectedTheme = "twilight";
            vm.selectedFontSize = 14;
            vm.fontSizes = StaticDataFactory.getFontSizes();
            
            vm.currentSlotNumber = 0;
            vm.theslots = [];
            vm.availableLessons = [];

            function setAvailableLesson(which)
            {
                ModeratorFactory.setAvailableLesson(which);
            }

            //saves editor content in the localstorage slot that is open every 5 seconds 
            function saveInSlot()
            {
                vm.timerId = $interval(function()
                {
                    console.log("saving ", StorageFactory.getCurrentKey());
                    StorageFactory.getSetter(StorageFactory.getCurrentKey())(thedocument.getValue());
                }, 5000);
                StaticDataFactory.setTimerId(vm.timerId);
            }
            

            function toggleSpinner()
            {
                vm.showSpinner = !vm.showSpinner;
            }

            function sendToIaf()
            {   
                toggleSpinner();
                var message = "dummymessage";
                IafFactory.postConfig(StorageFactory.getGetter(StorageFactory.getCurrentKey())()).then(function succes(response)
                    {
                        toggleSpinner();
                        console.log("getting response", response);
                    },
                    function failure(response)
                    {
                        toggleSpinner();
                        console.log("getting failure...", response);
                    });
            }

            function setCredentials()
            {
                var resp = IafFactory.setCredentials(vm.server, vm.username, vm.password);
                console.log("credentials:", resp);
            }

            function postSnippet()
            {
                StaticDataFactory.postSnippet(vm.currentSlot).then(function (res)
                {
                    console.log("response", res);
                },
                function (err)
                {
                    console.log("response", err);
                });
            }





            function validateXml()
            {
                toggleSpinner();
                ValidationFactory.validateXml(vm.currentSlot).then
                (
                    function success(res)
                    {
                        vm.validationMessage = res;
                        toggleSpinner();
                        console.log("validating....", vm.validationMessage);
                    }, 
                    function failure(err)
                    {
                        toggleSpinner();
                    }
                );
                
            }

            function changeFontSize()
            {   
                var ed = document.getElementsByClassName('CodeMirror')[0];
                ed.style.fontSize = vm.selectedFontSize.toString() + 'px';
            }

            //initialisation of editor(triggered by attribute in home.html), datamodel, and cache
            function getEditor(_editor)
            {
                editor = EditorFactory.editorLoaded(_editor);
                thedocument = editor.getDoc();
                StaticDataFactory.getJson().then(function success(response)
                {
                    console.log("returned datamodel : \n", response.data);
                    vm.navigatorModel = response.data;
                    


                    Object.keys(vm.navigatorModel).forEach(function (item, index)
                    {
                       
                        if(vm.navigatorModel[item].type === 'lesson')
                        {
                            vm.availableLessons.push( vm.navigatorModel[item] );
                        }
                        if (vm.availableLessons.length > 0)
                        {
                            setAvailableLesson(vm.availableLessons[0].url);
                        }
                    });

                    editor.setOption('hintOptions', {schemaInfo: vm.navigatorModel});
                    editor.foldCode(CodeMirror.Pos(0,0));
                    editor.foldCode(CodeMirror.Pos(thedocument.lineCount(),0));
                    toggle_datasource('pipes');
                    showNav(); 
                    showConf();
                    showConf();
                
                    //initialising the cache and loading it in the editor;
                    var avalue = StorageFactory.initialise();
                    retrieveData();
                    saveInSlot();
                    console.log("data:", vm.navigatorModel);
                },function error(response)
                {
                    console.log("error initialising:", response.data);
                });
            }

            function toggleReadonly(slot)
            {
                var id = parseInt(slot.substring(4,5))-1;
                console.log("toggling lock", slot, id);
                vm.theslots[id].locked = !vm.theslots[id].locked;
                setReadonly(vm.theslots[id].locked);
            }

            function setReadonly(val)
            {
                editor.setOption('readOnly', val);
            }

            function unlock()
            {
                vm.theslots[vm.currentSlotNumber-1].locked = false;
                setReadonly(false);
            }
              



            function changeTheme()
            {
                editor.setOption('theme', vm.selectedTheme);
            }



                
            //responds to change of the slotname : internally the slotnames are slot1, slot2...etc,
            //externally a user can choose any alias he wants.
            function modifyAlias(slotn, newname)
            {
                console.log("modify ",slotn, newname);
                StorageFactory.getSetter(slotn)(newname);
            }

            console.log("retrieved keys",StorageFactory.getKeys());

            
            function toggleSlot(slot)
            {
                // console.log("slot: ", typeof (slot) , vm.currentSlotNumber);
                //opening a slot from the key item in the navigator
                console.log("length:",vm.theslots.length);
                if(typeof slot === 'number')
                {
                    var slotnumber = Number(slot) + 1;
                    if (slotnumber === vm.theslots.length + 1)
                    {
                        slotnumber = 1 ;
                    }
                    vm.currentSlot = "slot" + slotnumber.toString();
                    vm.currentSlotNumber = slotnumber;
                    console.log("see:",vm.currentSlot, vm.currentSlotNumber);
                }   

                //a keypress on an open folder icon, in other words, closing a folder, resetting to first slot.
                else if(vm.currentSlot === slot)
                {
                    vm.currentSlot = vm.theslots[0].id;
                    vm.currentSlotNumber = 1;
                }
                //opening a slot,pushing on a closed folder icon.
                else
                {
                    vm.currentSlot = slot;
                    vm.currentSlotNumber = parseInt(slot.substring(4,5));
                }
                StorageFactory.setCurrentKey(vm.currentSlot);
                retrieveData(vm.currentSlot);
                setReadonly(vm.theslots[vm.currentSlotNumber-1].locked);
                // console.log("Current slotprops:",vm.theslots[vm.currentSlotNumber-1]);
            }

            function storeData()
            {
                var mykey = StorageFactory.getCurrentKey();
                var myvalue = thedocument.getValue();
                console.log("storing data", mykey, myvalue);
                StorageFactory.getSetter(mykey)(myvalue);
            }

            function retrieveData(key)
            {
                console.log("retrieving data");
                
                if(key === undefined)
                {
                    var ks = StorageFactory.getCurrentKey();
                    thedocument.setValue(StorageFactory.getGetter(ks)());
                    var slots = StorageFactory.getKeys();
                    var aliases = StorageFactory.getAliases();
                    for (var i =0 ; i < slots.length; i++)
                    {
                        vm.theslots[i] = {id:slots[i], locked:false, alias:aliases[i]};
                    }
                    vm.currentSlot = vm.theslots[0].id;
                    vm.currentSlotNumber = 1;
                    console.log("slots after initialisation:",vm.theslots);
                }
                else
                {
                    // console.log("getting value for slot ", key);
                    thedocument.setValue(StorageFactory.getGetter(key)());
                }
            }

            //toggles the configuration menu in the left area;
            function showConf()
            {
                var navigator = document.getElementById('navigatorcontainer');
                 
                if(vm.showConfig)
                {
                  navigator.style.left = "0%";
                }
                else
                {
                  navigator.style.left = '-25%';
                }
                vm.showConfig = !vm.showConfig;
            }
                

              //toggles the editor area to 75 or 100%
              function showNav()
              {
                var editor = document.getElementById('editorcontainer');
                var navItem = document.getElementById('navItem');
                var picture = document.getElementById('picture');
                var iplogo = document.getElementById('iplogo');
                
                if(!picture || !navItem || !editor){return;}


                if(vm.showNavigator)
                {
                  editor.style.width = '75%';
                  editor.style.left = '25%';
                  iplogo.style.top = '15px';
                  navItem.style.left = '89%';
                  picture.classList.add('fa-toggle-left');
                  picture.classList.remove('fa-toggle-right');
                }
                else
                {
                  editor.style.width = '100%';
                  editor.style.left = '0%';
                  navItem.style.left = '0%';
                  iplogo.style.top = '5px';
                  picture.classList.remove('fa-toggle-left');
                  picture.classList.add('fa-toggle-right');
                }
                vm.showNavigator = !vm.showNavigator;
              }

           


            //responds to the selection of an item in the class Area;
            function setSelectedClass(item)
            {
                vm.selectedItem = item;
                StaticDataFactory.setSelectedItem(item);
                vm.selectedProperties = {};
                
                //checking a default classname property
                for(var i=0 ; i<item.properties.length; i++)
                {
                    if(item.properties[i][0]=='classname' || item.properties[i][0]=='className')
                    {
                        var checkbox = document.getElementById('checkbox' + i);
                        if(checkbox === null)
                        {
                            break;
                        }
                        checkbox.click();
                        break;
                    }
                }

            }



            //responds to the radiobuttons in the dataSource area and switches to pipe, receiver, snippet or general; the first item of 
            //the chosen type is selected.
            function toggle_datasource(thetype)
            {
                StaticDataFactory.setDataSource(thetype);
                vm.datasource = StaticDataFactory.getDataSource();
                vm.showPropertyDescription = false;
                
                var done = false;
                var parking = "zzz"
                Object.keys(vm.navigatorModel).forEach(function(key)
                {
                    if (!done && vm.navigatorModel[key].type === thetype )
                    {
                        if (key < parking)
                        {
                            parking = key;
                        }
                        //vm.selectedItem = vm.navigatorModel[key];
                        //vm.selectedProperties = {};
                    }
                });
                setSelectedClass(vm.navigatorModel[parking]);


                console.log("vm.datasource", vm.datasource);
            }

            //empties the editor
            function clearEditor()
            {
                if(editor.getOption('readOnly') === true)
                {
                    return;
                }
                thedocument.setValue("<?xml version='1.0' encoding='UTF-8'?>\n");
                thedocument.setCursor({line:thedocument.lastLine(),ch:0});
                editor.focus();
            }

            //Responding to the style button in the navbar
            function styleEditorContent()
            {
                //get the currunt cursor position of the editor; check between which values that is and look that up
                // after reformatting the text to replace the cursor.
                var pos = thedocument.getCursor();
                var before = thedocument.getRange({line:pos.line,ch:0},pos);
                //regex to find tag segment left of the cursor : <[\w\/\s=\'\"]+$|<[\w\/\s=\'\"]+>$
                var beforesegment = before.match(/<[\w\/\s=\'\"]+$|<[\w\/\s=\'\"]+>[\w\s]*$/);
                if (beforesegment !== null)
                {
                    before = beforesegment[0];
                }
                var after = thedocument.getRange(pos,{line:pos.line,ch:null});
                //regex to find tag segment to the right of cursor : ^[\w\/\s=\'\"]+>|^<[\w\/\s=\'\"]+> 
                var aftersegment = after.match(/^[\w\/\s=\'\"]+>|^<[\w\/\s=\'\"]+>/);
                if (aftersegment !== null)
                {
                    after = aftersegment[0];
                }

                //search the correct position of the cursor, possibly many similar tags : the index of the search results
                //array is stored
                var cursor = editor.getSearchCursor(before);
                var counter =0 ;
                var original = {line:10000,ch:10000};
                var myindex = -1;
                while (cursor.find() === true)
                {   
                    var newval = cursor.to();
                    if (isTheBetter(pos, newval, original))
                    {
                        original = newval;
                        myindex = counter;
                    }
                    counter++;
                }
                //now that we know we can find the new cursor position we will format the complete text
                var settings = StaticDataFactory.getFormattingSettings();
                thedocument.setValue(html_beautify(thedocument.getValue(),settings));

                //put the cursor back in place
                cursor = editor.getSearchCursor(before);
                for(var i=0 ; i < myindex+1 ;i++)
                {
                    cursor.find();
                }
                if(cursor.to())
                {
                    thedocument.setCursor(cursor.to());
                }
                editor.focus();


                function isTheBetter(newpos, oldpos, standard)
                {
                    var linedifference1 = Math.abs(standard.line - oldpos.line);
                    var linedifference2 = Math.abs(standard.line - newpos.line);
                    if (linedifference1 > linedifference2)
                    {
                        return false;
                    }
                    if(linedifference2 > linedifference1)
                    {
                        return true;
                    }
                    var chardifference1 = Math.abs(standard.ch - oldpos.ch);
                    var chardifference2 = Math.abs(standard.ch - newpos.ch);
                    if (chardifference1 > chardifference2)
                    {
                        return false;
                    }
                    return true;
                }
            }


            //determines to check a value in the property area because they are obligatory;
            function checkDefaults(property)
            {
                if(property[0] === 'classname' || property[0] === 'className')
                {
                    vm.selectedProperties[property[0]] = new attributeObject('className', new Array(property[2]));
                    return true;
                }
                return false;
            }


/*Responds to the arrow button in the navBar. The current selected item and the current selected properties are converted
to a string and inserted in the editor;*/

            function submitForm()

            {

                if (vm.selectedItem === null || editor.getOption('readOnly') === true)
                {
                    return;
                }
                if(vm.selectedItem.type === 'snippets')
                {
                    console.log("selectedItem:",vm.selectedItem);
                    //loadXml(vm.selectedItem.file);
                    thedocument.replaceSelection(vm.selectedItem.xml);
                }
                else
                {
                    var theproperties = [];    
                    console.log("props:", vm.selectedProperties);
                    if (Object.keys(vm.selectedProperties).length > 0 )
                    {
                        Object.keys(vm.selectedProperties).forEach(function(thekey)
                        {
                            
                            theproperties.push(vm.selectedProperties[thekey]);
                        }); 
                    }
                   var newtag = new xmlTag(vm.selectedItem.classname, theproperties);
                    thedocument.replaceSelection(newtag.toCompleteTag());
                    editor.focus();
                }
            }
        })
    /*determines which classes are shown in the navigator, based on the JSON item type (pipes, receivers, general or snippets)*/
.filter('datasourceFilter', function(StaticDataFactory)
    {
        return function(items)
        {
            var filtered = [];
            angular.forEach(items, function(item)
            {
               if (item.type === StaticDataFactory.getDataSource())
                {
                    filtered.push(item);
                }
            });
            //sorting the resulting array of objects on the classname property.
            filtered.sort(function(a,b)
                {
                    var x = a.classname.toLowerCase();
                    var y = b.classname.toLowerCase();
                    if (x < y) {return -1;}
                    if (x > y) {return 1;}
                    return 0;
                });
            return filtered;
        };
    })


    //replaces escaped tag signs with the proper symbols, used in the description area where sometimes strange symbols appear.
    .filter('cleanupFilter', function()
    {
        return function(item)
        {

            if(item !== undefined)
            {
                var newstring = item.replace(/&lt;/g,'<');
                var newerstring = newstring.replace(/&gt;/g,'>');
                return newerstring;
            }
        };
    });
})();