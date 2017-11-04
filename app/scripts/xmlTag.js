(function ()
{
    
/*
    Defines an xmlTag object that will be used as the main data carrier in the editor;
    Its main feature is that it is a tag with a possible string of text after it - the suffix
*/
angular.module('confab')

    .factory('xmlTag', function() 
        {
            /*
            tagTypes are "STARTTAG", "COMBITAG", and "ENDTAG"
            */
    
                function xmlTag(tagtitle, proparray) 
                {
                    this.suffix = "";
                    this.tagType = "STARTTAG";
                    this.tagTitle = tagtitle;
                    tagProperties = {};
                    proparray.forEach(function(prop)
                    {
                        tagProperties[prop] = "";
                    }); 
                    this.tagProperties = tagProperties;                   
                }
                //native functions of the xmlTag that can access the instance properties
                xmlTag.prototype = 
                {
                    getTagType : function()
                    {
                        return this.tagType;
                    },
                    setTagType : function(astring)
                    {
                        switch (astring)
                        {
                            case "STARTTAG":{this.tagType = "STARTTAG"; break;}
                            case "COMBITAG":{this.tagType = "COMBITAG";break;}
                            case "ENDTAG":{this.tagType = "ENDTAG";break;}
                            default :{console.log("tagType is set to default..",astring," is unknown type.");
                                        this.tagType = "STARTTAG";}
                        }

                    },
                    //converts its contents to a readable xml-tag, dependent on its type
                    toString : function()
                    {
                        var returnstring = "";  
                        var itsproperties = ""; 
                        
                        angular.forEach(this.tagProperties, function(value, key)
                        {
                            if (value == "")
                            {
                                itsproperties += " " + key + "=\"\" " + " ";
                            }
                            else
                            {
                                itsproperties += " " + key + "=" + value + " ";   
                            }

                        });


                        switch (this.tagType)
                        {
                            
                            case "STARTTAG":
                            {
                                returnstring =           "< " + 
                                                this.tagTitle + 
                                                itsproperties + 
                                                " >"; 
                                                break;

                            }
                            case "COMBITAG":
                            {
                                returnstring =           "< " + 
                                                this.tagTitle +
                                                itsproperties + 
                                                " />";
                                                break;
                            }
                            case "ENDTAG":{returnstring = "</ " + this.tagTitle + " >";break;}
                        }

                        return returnstring;
                    },
                    setProperty :function (key, value)
                    {
                        this.tagProperties[key] = value;
                    },
                    getPropertyValue :function (key)
                    {
                        return this.tagProperties[key];
                    }




                };
               /*static functions that have no access to this:
                xmlTag.computeTabdistance = function(tag)
                {
                    return tabdistance
                }
               */
            
            return (xmlTag);

            

        })

    .factory('tagContainer', function()
    {
        function tagContainer()
        {
            this.tagContainer = [];

        }


        tagContainer.prototype = function() 
        {

        }

    });

})();