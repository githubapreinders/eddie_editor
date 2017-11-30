Folder description

-general : consists all other tags that have to be used in the construction of ibises. Its
			type should be 'general'

-json : consists the main json description file that is used for the navigator in the 
		IbisEditor ; it consists of a collection of small JSON objects that all have the 
		form 
		{
			className :
			{
				type           : String,
				classname  : String,
				description : String, 
				children : [],
				properties  : [ [propertyname, description, default_value ], […] , ………..],
				attrs : 
				{ 
					property1:[default_value1], property2:[default_value2], .........
				}
			}	
		}


-snippets : consist of pairs of files ; for each item there is an xml that servers as the  actual snippet, the other is a json that forms the above shape, except for a property 'filename' that will be the actual classname + the xml suffix.
