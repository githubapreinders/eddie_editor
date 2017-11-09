(function ()
{
    'use strict';

    angular.module('confab')
        .controller('IndexController', function (xmlTag, staticDataFactory)
        {

            console.log('IndexController...');
            var vm = this;
            
            vm.submitForm = submitForm;
            vm.codemirrorLoaded = codemirrorLoaded;
            vm.setSelectedClass = setSelectedClass
            vm.toggle_datasource = toggle_datasource;
            vm.message = "Angular Controller is working allright...";
            vm.userInput = "";
            vm.datasource = staticDataFactory.getDataSource();
            vm.navigatorModel = null;
            vm.selectedItem = null;

            staticDataFactory.getJson().then(function success(response)
            {
                vm.navigatorModel = response.data;
                console.log("data:", vm.navigatorModel);
            },function error(response)
            {

            });


            var editor = null;
            var doc = null;    

            var tags =  staticDataFactory.getData();

            function setSelectedClass(item)
            {
                vm.selectedItem = item;
            }


            function toggle_datasource(string)
            {
                
                staticDataFactory.setDataSource(string);
                vm.datasource = staticDataFactory.getDataSource();
                
                for (var i=0 ; i < vm.navigatorModel.length; i++)    
                {
                    if(vm.navigatorModel[i].type === string)
                    {
                        vm.selectedItem = vm.navigatorModel[i];
                        break;
                    }
                }
                console.log("vm.datasource", vm.datasource);
            }

            function codemirrorLoaded(_editor)
            {
                var _doc = _editor.getDoc();
                _editor.focus();
                _editor.setOption('lineNumbers', true);
                _editor.setOption('lineWrapping', true);
                _editor.setOption('mode', 'xml');
                _editor.setOption('theme', 'twilight');
                _editor.setOption('hintOptions', {schemaInfo: tags});
                var extraKeys =  {
                          "'<'": completeAfter,
                          "'/'": completeIfAfterLt,
                          "' '": completeIfInTag,
                          "'='": completeIfInTag,
                          "Ctrl-Space": "autocomplete"
                                };
                _editor.setOption('extraKeys', extraKeys);




                 _doc.setValue("<?xml version='1.0' encoding='UTF-8'?>\n");
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
                doc = _doc;
                console.log("editor loaded;");

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

            


            function submitForm(string)

            {
             var insertion = null;   
            	if (vm.userInput !== "")
            	{
            		var values = vm.userInput.split(/\s+/);
            		console.log("values from splitter:", values);
            		var tagtitle = values.shift();
            		var tagproperties = [];
            		if (values.length > 0)
            		{
            			values.forEach(function(val)
            			{
            				tagproperties.push(val);
            			});
            		}
                var snippet = new xmlTag("module",[]).toString() +"\n"+ new xmlTag("adapter",[]).toString()



                 doc.replaceSelection(snippet);
            	}


            }

        })
    .filter('datasourceFilter', function(staticDataFactory)
    {
        return function(items)
        {
            var filtered = [];
            angular.forEach(items, function(item)
            {
                if (item.type === staticDataFactory.getDataSource())
                {
                    filtered.push(item);
                }
            });
            return filtered;
        };
    });
})();


