(function(){

'use strict';

angular.module('confab')

    .service('staticDataFactory', function(xmlTag, $http) 
    {

        var datasource = 'pipes';
        var dummy = {
        attrs: {
          color: ["red", "green", "blue", "purple", "white", "black", "yellow"],
          size: ["large", "medium", "small"],
          description: null
        },
        children: []
      };

        var thedata = {
        "!top": ["module"],
        "!attrs": {
          id: [""],
          class: ["A", "B", "C"]
          
        },
        adapter: {
          attrs: {
            name: ["name" + randomDigit()],
            active: [""]
          },
          children: ["receiver", "pipeline"],
          description : "Top level element for an adapter.",
          category : "General"
        },
        receiver: {
          attrs: {
            name: [""],
            className: [""]
          },
          children: ["listener"],
          description : "Top level element for an adapter.",
          category : "General"
        },
        pipeline: {
          attrs: {name: [""]},
          children: ["exits", "pipe"],
          description : "Top level element for an adapter.",
          category : "General"
        },
        pipe: {
          attrs: {name: [""], blockSize:null, blockPrefix: null, blockSuffix:null, elementXPathExpression:null, returnString:[""]},
          children: ["sender", "forward", "param"],
          description : "Top level element for an adapter.",
          category : "General"
        },
        CleanupOldFilesPipe: {
          attrs: {
            name: ["CleanupOldFilesPipe"],
            className: ["nl.nn.adapterframework.batch.CleanupOldFilesPipe"]
          },
          children: [],
          description : "Pipe for deleting files.",
          category : "Pipes"
        },
        CounterSwitchPipe: {
          attrs: {
            name: ["CounterSwitchPipe"],
            className: [" nl.nn.adapterframework.pipes.XmlIf"],
            divisor : []
          },
          children: [],
          description : "Selects an exitState, based on the number of received messages by this pipe. The exitState is the difference (subtraction) between the divisor and the remainder of [number of received messages] modulus divisor. This will always be an integer between 1 and divisor, inclusive.",
          category : "Pipes"
        },
        DomainTransformerPipe: {
          attrs: {
            name: ["DomainTransformerPipe"],
            className: ["nl.nn.adapterframework.pipes.DomainTransformerPipe"],
            jmsRealm : [],
            tableName : ["mapping"],
            label : ["label"],
            valueInfield : ["valueIn"],
            valueOutField : ["valueOut"]
          },
          children: [],
          description : "Pipe that performs domain transforming on the basis of a database table. Every string which equals \"%![DT{label,valueIn,type}]\" will be replaced by valueOut. The field type, which is optional, indicates the format of valueIn. Currently the following types are supported: string (default): the methode setString() is used number: the method setDouble() is used",
          category : "Pipes"
        },
        EtagHandlerPipe: {
          attrs: {
            name: ["EtagHandlerPipe"],
            className: ["nl.nn.adapterframework.pipes.EtagHandlerPipe"]
          },
          children: [],
          description : "Pipe to manage RESTFUL etag caching",
          category : "Pipes"
        },
        IncreaseIntegerPipe: {
          attrs: {
            name: ["IncreaseIntegerPipe"],
            className: ["nl.nn.adapterframework.pipes.IncreaseIntegerPipe"],
            maxThreads : [],
            durationThreshold : [],
            getInputFromSessionKey : [],
            storeResultInSessionKey : [],
            preserveInput : [],
            transactionAttribute : ["Requires", "RequiresNew", "Mandatory", "NotSupported", "Supports", "Never"],
            forwardName : ["success"],
            increment : ["1"]
          },
          children: [],
          description : "Pipe that increases the integer values of a session variable. Used to in combination with CompareIntegerPipe to contstruct loops.",
          category : "Pipes"
        },
        DirectoryListener: {
          attrs: {
            name: ["DirectoryListener"],
            className: ["nl.nn.adapterframework.batch.DirectoryListener"],
            inputDirectory : [],
            wildcard : [],
            excludeWildcard : [],
            fileTimeSensitive : ["false"]
          },
          children: [],
          description : "File listener that looks in a directory for files according to a wildcard and a excludeWildcard. When a file is found, it is moved to an outputdirectory, so that it isn't found more then once. The name of the moved file is passed to the pipeline.",
          category : "Receivers"
        },
        ExchangeMailListener: {
          attrs: {
            name: ["ExchangeMailListener"],
            className: [" nl.nn.adapterframework.receivers.ExchangeMailListener"],
            inputFolder : [],
            filter : [],
            outputFolder : [],
            authAlias : [],
            username : [],
            password : [],
            mailadress : [],
            url : []
          },
          children: [],
          description : "Implementation of a IPullingListener that enables a GenericReceiver to look in a folder for received mails. When a mail is found, it is moved to an output folder (or it's deleted), so that it isn't found more then once. A xml string with information about the mail is passed to the pipeline.",
          category : "Receivers"
        },
        PullingListenerContainer: {
          attrs: {
            name: ["PullingListenerContainer"],
            className: ["nl.nn.adapterframework.receivers.PullingListenerContainer"],
            divisor : []
          },
          children: [],
          description : "Container that provides threads to exectue pulling listeners.",
          category : "Receivers"
        },
        FileRecordListener: {
          attrs: {
            name: ["FileRecordListener"],
            className: [" nl.nn.adapterframework.receivers.FileRecordListener"],
            inputDirectory : [],
            wildcard : [],
            responseTime : [],
            directoryProcessedFiles : [],
            storeFilenameInSessionKey : []
          },
          children: [],
          description : "File listener that looks in a directory for files according to a wildcard. When a file is found, it is read in a String object and parsed to records. After reading the file, the file is renamed and moved to a directory.",
          category : "Receivers"
        },
        JavaListener: {
          attrs: {
            name: ["JavaListener"],
            className: [" nl.nn.adapterframework.receivers.JavaListener"],
            serviceName : [],
            isolated : ["false"],
            synchronous : ["true"],
            throwException : ["true"],
            setHttpsWsdl : ["false"]
          },
          children: [],
          description : "The JavaListener listens to java requests.",
          category : "Receivers"
        },
        CounterSwitchPipe: {
          attrs: {
            name: ["CounterSwitchPipe"],
            className: [" nl.nn.adapterframework.pipes.XmlIf"],
            divisor : []
          },
          children: [],
          description : "",
          category : "Receivers"
        },


      };

        return{
            getData : getData,
            setData : setData,
            getJson : getJson,
            setDataSource: setDataSource,
            getDataSource: getDataSource
        };

        function setData(anobject)
        {
          thedata = anobject;
        }

        function setDataSource(string)
        {
          datasource = string;
        }

        function getDataSource()
        {
          return datasource;
        }


        function getJson()
        {
          return $http.get('./media/javadoc_data.json').then(function(data)
            {
              return data;
            });
          
        }  
        
        function getData()
        {
            return thedata;
        }

        function randomDigit()
        {
            return Math.ceil(Math.random()*100);
        }


    });

})();   