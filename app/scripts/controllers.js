(function ()
{
    'use strict';

    angular.module('confab')
        .controller('IndexController', function (xmlTag, attributeObject, staticDataFactory)
        {

            console.log('IndexController...');
            var vm = this;
        
            vm.submitForm = submitForm;
            vm.codemirrorLoaded = codemirrorLoaded;
            vm.setSelectedClass = setSelectedClass;
            vm.toggle_datasource = toggle_datasource;
            vm.styleEditorContent = styleEditorContent;
            vm.clearEditor = clearEditor;
            vm.loadXml = loadXml;
            vm.message = "Angular Controller is working allright...";
            vm.userInput = "";
            vm.datasource = staticDataFactory.getDataSource();
            vm.navigatorModel = null;
            vm.selectedItem = null;
            vm.showPropertyDescription = false;
            vm.selectedProperties = {};

            vm.showFullEditor = false;
            var editor = null;
            var thedocument = null;    
            // var tags =  staticDataFactory.getData();


            staticDataFactory.getJson().then(function success(response)
            {
                vm.navigatorModel = response.data;
                editor.setOption('hintOptions', {schemaInfo: vm.navigatorModel});
                toggle_datasource('pipes');
                console.log("data:", vm.navigatorModel);
            },function error(response)
            {

            });


            

            function loadXml()
            {
                staticDataFactory.loadXml('').then(function succes(response)
                {
                    thedocument.setValue(response.data);
                });
            }


            


            function setSelectedClass(item)
            {
                vm.selectedItem = item;
                vm.selectedProperties = {};
            }


            function toggle_datasource(string)
            {
                
                staticDataFactory.setDataSource(string);
                vm.datasource = staticDataFactory.getDataSource();
                vm.showPropertyDescription = false;
                
                // for (var i=0 ; i < vm.navigatorModel.length; i++)    
                // {
                //     if(vm.navigatorModel[i].type === string)
                //     {
                //         vm.selectedItem = vm.navigatorModel[i];
                //         break;
                //     }
                // }
                var done = false;
                Object.keys(vm.navigatorModel).forEach(function(key)
                {
                    if (!done && vm.navigatorModel[key].type === string )
                    {
                        vm.selectedItem = vm.navigatorModel[key];
                        vm.selectedProperties = {}
                        done = true;
                    }
                });


                console.log("vm.datasource", vm.datasource);
            }

            function codemirrorLoaded(_editor)
            {
                var _doc = _editor.getDoc();
                _editor.focus();
                _editor.setOption('lineNumbers', true);
                _editor.setOption('lineWrapping', true);
                _editor.setOption('mode', 'xml');
                _editor.setOption('beautify', 'true');
                _editor.setOption('theme', 'twilight');
                _editor.setOption('hintOptions', {schemaInfo: vm.navigatorModel});
                _editor.setOption('matchTags', {bothTags: true});

                // _editor.setOption('hintOptions', {schemaInfo: vm.navigatorModel});

                var extraKeys =  {
                          "'<'": completeAfter,
                          "'/'": completeIfAfterLt,
                          "' '": completeIfInTag,
                          "'='": completeIfInTag,
                          "Ctrl-Space": "autocomplete"
                                };
                _editor.setOption('extraKeys', extraKeys);
                 _doc.setValue(staticDataFactory.makeSnippet());
                 _doc.setCursor(_doc.lastLine());

                
                var map = {"Ctrl-A" : function(cm)
                    {
                        console.log("pushing ctrl-A");
                        var position = _doc.getCursor();
                        //var range = doc.getRange({'from' : position, 'to':{position.line, positon.ch+10}
                        //console.log("range:", range);
                    }};
                _editor.addKeyMap(map);    
                editor = _editor;
                thedocument = _doc;
                console.log("editor loaded;");



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
            }

            function clearEditor()
            {
                thedocument.setValue("<?xml version='1.0' encoding='UTF-8'?>\n");
                thedocument.setCursor({line:thedocument.lastLine(),ch:0});
                editor.focus();
            }

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
                var settings = staticDataFactory.getFormattingSettings();
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


            function submitForm()

            {

                if (vm.selectedItem === null)
                {
                    return;
                }
                var theproperties = [];    
                console.log("props:", vm.selectedProperties);
                if (Object.keys(vm.selectedProperties).length > 0 )
                {
                    Object.keys(vm.selectedProperties).forEach(function(thekey)
                    {
                        
                        theproperties.push(vm.selectedProperties[thekey]);
                    }); 
                }
                console.log("here", theproperties);
               var newtag = new xmlTag(vm.selectedItem.classname, theproperties);
               console.log("taga:", newtag.toString());
                thedocument.replaceSelection(newtag.toCompleteTag());

                

               //  if (vm.selectedItem === null)
               //  {
               //      return;
               //  }
               //  var theproperties = [];    
               //  console.log("props:", vm.selectedProperties);
               //  if (Object.keys(vm.selectedProperties).length > 0 )
               //  {
               //      Object.keys(vm.selectedProperties).forEach(function(thekey)
               //      {
               //          theproperties.push(vm.selectedProperties[thekey]);
               //      }); 
               //  }
               //  console.log("here", theproperties);
               // var newtag = new xmlTag(vm.selectedItem.classname, theproperties);
               // console.log("taga:", newtag.toString());
               //  doc.replaceSelection(newtag.toCompleteTag());


                // var values = vm.userInput.split(/\s+/);
                // console.log("values from splitter:", values);
                // var myattrs = new attributeObject('color', ['red','green','blue']);
                // console.log("attributeObject:",myattrs);
                // var newtag = new xmlTag("appel", [new attributeObject("color",["green", "red", "pink"])]);
                // console.log("tag:", JSON.stringify(newtag.toObject()));
                //tags = staticDataFactory.setData()


             // var insertion = null;   
            	// if (vm.userInput !== "")
            	// {
            	// 	var values = vm.userInput.split(/\s+/);
            	// 	console.log("values from splitter:", values);
            	// 	var tagtitle = values.shift();
            	// 	var tagproperties = [];
            	// 	if (values.length > 0)
            	// 	{
            	// 		values.forEach(function(val)
            	// 		{
            	// 			tagproperties.push(val);
            	// 		});
            	// 	}
             //        insertion =  new xmlTag(tagtitle, tagproperties).toCompleteTag();
             //    }
             //    else
             //    {
             //        insertion = new xmlTag("module",[]).toString() +"\n"+ new xmlTag("adapter",[]).toString()
             //    }
             //     doc.replaceSelection(insertion);
            }


        })
    .filter('datasourceFilter', function(staticDataFactory)
    {
        return function(items)
        {
            var filtered = [];
            angular.forEach(items, function(item)
            {
               // console.log("item:", item);
               if (item.type === staticDataFactory.getDataSource())
                {
                    filtered.push(item);
                }
            });
            return filtered;
        };
    });

})();


