(function ()
{
    'use strict';
    /*TODO's : adding new directory / new file button*/
    angular.module('confab')
        .controller('ApsTreeController', function ($scope,ZipService, StorageFactory, $timeout)
        {

            console.log('TreeController...');
            var vm2 = this;
            vm2.remove = remove;
            vm2.toggle = toggle;
            vm2.setSelectedSlot = setSelectedSlot;
            vm2.changeName = changeName;
            vm2.newSubitem = newSubitem;
            vm2.modifyAlias = modifyAlias;
            vm2.getZip = getZip;
            vm2.packZip = packZip;

            //is called in home.html
            vm2.treeOptions =
            {
                   
            };

            init();

            function init()
            {
                vm2.list = StorageFactory.getGetter("thejson")();
                vm2.mySlots = StorageFactory.getGetter("myslots")();
            }

            


            // function packZip()
            // {
            //     var elements = document.querySelectorAll('[ui-tree-node]');

            //     elements.forEach(function(item)
            //     {
            //         console.log(angular.element(item).scope().$modelValue.id);
            //     });

            //     console.log("json:",JSON.stringify(vm2.list));
            // }

            function getZip()
            {
                ZipService.getZip().then(function success(data)
                {
                    console.log("data back", data);
                    vm2.list = data;
                    vm2.mySlots = ZipService.getMySlots();
                    var keys = Object.keys(vm2.mySlots);
                    setSelectedSlot({id:keys[0]}) ;
                    console.log(vm2.list);
                    //$timeout(changeTheNames, 1000);//waiting for the scope to have settled;otherwise view is ok but scope not parallel


                }, function fail(err)
                {
                    console.log("failure getting zip: ", err);
                });
            }



            //changing the names of the objects
            function packZip()
            {
                    var zip = new JSZip();
                    var elements = document.querySelectorAll('[ui-tree-node]');
                    
                    elements.forEach(function(item)
                    {
                        var object = angular.element(item).scope();
                        var parents = [];

                        while(object.$parentNodeScope !== null)
                        {
                            parents.push(object.$parentNodeScope.$modelValue.title);
                            object = object.$parentNodeScope;
                        }

                        var filename = "";
                        while(parents.length > 0)
                        {   
                            filename += cropFilter(parents.pop()) + '/';
                        }
                        filename += cropFilter(angular.element(item).scope().$modelValue.title) ;
                        if(object.$modelValue.isDirectory)
                        {
                            zip.folder(filename);
                        }
                        else
                        {   var theslot = StorageFactory.getGetter(angular.element(item).scope().$modelValue.title);
                            zip.file(filename, StorageFactory.getGetter(theslot)());
                        }

                        console.log("filename: ", filename,"\n");
                    });


                    console.log("Zipfile ", zip);

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
                    };
                    

          
            };

            //listens to a button press on the key icon in the main controller
            $scope.$on('KeySwitch', function(event, key)
            {
                var thekeys = Object.keys(vm2.mySlots);
                console.log("treecontro", key, thekeys);
                for(var i=0 ;i < thekeys.length; i++)
                {
                    console.log(i , " : ", vm2.mySlots[thekeys[i]]);

                    if(vm2.mySlots[thekeys[i]].title == key.title)
                    {
                        console.log("bingo",thekeys[i]);

                        var helper = 
                        {
                            id:thekeys[i],
                            title:thekeys[i].title,
                            isLocked:thekeys,
                            nodes:[],
                            isDirectory:false
                        };

                        setSelectedSlot(helper);
                    }
                }

            })

            $scope.$watch('vm2.selectedSlot', function()
            {
                console.log("selected slot changed: ", vm2.selectedSlot);
            })

            //Any change in the file tree is saved in localstorage to reload later
            $scope.$watch('vm2.list', function()
            {
                console.log("updating local storage;");
                StorageFactory.getSetter("thejson")(vm2.list);
            }, true);

            //responds to change of the slotname : internally the slotnames are slot1, slot2...etc,
            //externally a user can choose any alias he wants.
            function modifyAlias(slotn, newname)
            {
                console.log("modify ",slotn, newname);
                StorageFactory.getSetter(slotn)(newname);
            }



            function setSelectedSlot(object)
            {
                if(object.hasOwnProperty('id'))
                {
                    console.log("from adding new file...");
                    vm2.selectedSlot = object.id;
                }
                else
                {
                    console.log("from button...");
                    vm2.selectedSlot = object.$modelValue.id;
                }    
                StorageFactory.setCurrentKey(vm2.mySlots[vm2.selectedSlot]);
                console.log("selected slot:  ", vm2.mySlots[vm2.selectedSlot], vm2.mySlots, vm2.selectedSlot);
                $scope.$emit('Keychange');
                console.log("setting slot to ", vm2.selectedSlot);
            }


            /* Sets the name of the tree item contenteditable and places the caret; 
            On enter or on blur the nameGiver directive updates the model with the current viewvalue.
            */
            function changeName(item)
            {
                var element = document.getElementById('treeitem' + item.$modelValue.id);
                element.setAttribute('contentEditable', true);
                var textnode = element.firstChild;
                var caret = textnode.length;
                var range = document.createRange();
                range.setStart(textnode, 0);
                range.setEnd(textnode, caret);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                console.log("element: ",element);
                element.focus();
            }


            /*
                Removes an item from the tree after checking if the user doesn't check the last item.
                Also the corresponding slot must be deleted and the model updated accordingly.
                object one level higher in the hierarchy: object.$parentNodeScope
                siblings of the current object : object.$parentNodesScope.$modelValue   (note the small 's' difference)
            */
            function remove(object)
            {
                var theid = object.$modelValue.id;
                var parking = getRoot(object);
                var nodetype = object.$modelValue.isDirectory;
                var counter = 0;

                if(nodetype)//if it is a directory we want to remove
                {
                    var currentLayer = object;

                    while(currentLayer !== null && counter < 10)
                    {
                          if(lookForDirectory(currentLayer.$parentNodesScope.$modelValue, object.$modelValue.id))
                            {
                                console.log("removable: ", object.$modelValue.title);
                                var results = deleteContainingFiles(object);
                                console.log("results: ",results );
                                
                                //checking for the case that no files are left after this deletion
                                //updating the mySlots object with the current slots.
                                if(results.length < Object.keys(vm2.mySlots).length)
                                {   
                                    results.forEach(function(item)
                                    {
                                        deleteFromLocalStorage(item);
                                        delete vm2.mySlots[item];
                                    });
                                    object.remove();
                                }
                                break;
                            }
                          else
                          {
                            currentLayer = currentLayer.$parentNodeScope;
                            console.log("watching layer above" ,currentLayer );
                          }    
                          counter++;
                    }
                }
                else//if it is a file we want to remove
                {
                    if(traverseArray(parking.$parentNodesScope.$modelValue, false))
                    {
                        console.log("removable: ", object.$modelValue.title);
                        deleteFromLocalStorage(object.$modelValue.id);
                        delete vm2.mySlots[object.$modelValue.id]; //remove from the slots
                        object.remove(); //remove from the filetree
                    }
                }

                function deleteFromLocalStorage(itsid)
                {
                    var thealias = vm2.mySlots[itsid].title;
                    var theslot = StorageFactory.getGetter(thealias)();
                    console.log("removing slots:",theslot, " alias " ,thealias);
                    StorageFactory.getSetter(thealias)();
                    StorageFactory.getSetter(theslot)();
                    var myslots = StorageFactory.getGetter("myslots")();
                    delete myslots[itsid];
                    StorageFactory.getSetter("myslots")(myslots);
                }


                function deleteContainingFiles(object)
                {
                    var results = [];
                    console.log("children:", object.$childNodesScope.$modelValue);
                    var array = object.$childNodesScope.$modelValue;

                    findResults(array);

                    function findResults(sublist)
                    {
                        for(var i=0 ; i< sublist.length; i++)
                        {
                            if(!(sublist[i].isDirectory))
                            {
                                results.push(sublist[i].id);
                            }
                            else
                            {
                                if(sublist[i].nodes.length > 0)
                                {
                                    findResults(sublist[i].nodes);   
                                }
                            }
                        }
                    }
                     return results;  
                }

                function getRoot(obj)
                {
                    var parking = obj;
                    while(parking.$parentNodeScope !== null)
                    {
                        parking = parking.$parentNodeScope ;
                    }
                    console.log("root:", parking.$parentNodesScope.$modelValue);
                    return parking;
                }

                function traverseArray(sublist, ok)
                {
                    
                    if(ok){return ok;}
                    for(var i = 0 ; i<sublist.length; i++)
                    {
                        console.log(sublist[i].title,sublist[i].id);
                        if(!(sublist[i].isDirectory) && sublist[i] !== object.$modelValue) 
                        {
                            console.log("match with", sublist[i].title);
                            ok = true;
                            break;
                        }
                        else
                        {
                            if(sublist[i].nodes.length > 0)
                            {
                                ok = traverseArray(sublist[i].nodes, ok);
                            }
                        }
                    }
                    return ok;
                } 

                function lookForDirectory(sublist, callerid)
                {
                    for (var i = 0 ; i < sublist.length ; i ++)
                    {
                        if(sublist[i].isDirectory && sublist[i].id !== callerid)
                        {
                            console.log("found directory" , sublist[i].title);
                            return true;
                        }
                    }
                }                 

                
            }

            function toggle(item)
            {
               item.toggle();
            }

            function newSubitem(item)
            {
                //console.log("parent:",item.$parent.$parent.$parent.$parent.$modelValue.title);
                var theitem = item.$modelValue;
                console.log(theitem);

                if(theitem.isDirectory)
                {
                    theitem.nodes.push({
                    id: Math.floor(Math.random()*10000) ,
                    title: theitem.title ,
                    isDirectory : true,
                    nodes: []
                    });
                }
                else
                {
                    var theid = Math.floor(Math.random()*10000);
                    var thetitle = theitem.title + '-' + createRandomSuffix();
                    var newobject = {
                            id: theid ,
                            title: thetitle,
                            isDirectory : false,
                            isLocked : false,
                            nodes: []
                            }


                    if(item.$parentNodeScope !== null)
                    {
                        item.$parentNodeScope.$modelValue.nodes.push(newobject);
                    }
                    else
                    {
                        vm2.list.push(newobject);
                    }
                    console.log("item:", item);
                    console.log("theid ", theid);
                    StorageFactory.getNewSlotname(thetitle, theid);
                    vm2.mySlots[theid] = {"title" : thetitle,"isLocked": false};
                    setSelectedSlot(newobject);
                }
            }


            function createRandomSuffix()
            {
                var suffixes = "abcdefghijklmnopqrstuvwxyzABCDEFGHILJKLMNOPRSTUVWXYZ";
                var result = "";
                for(var i=0 ; i<3; i++)
                {
                    var randomdigit = Math.floor(Math.random()*suffixes.length);
                    var letter = suffixes.substring(randomdigit,randomdigit + 1);
                    result += letter;
                }
                return result;
            }


        })
        
        //Returns the part after the last slash of a file.
        .filter('cropFilter', function()
        {
            return function(item)
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
            };
        });

})();
