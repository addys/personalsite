
var express = require('express');
var azure = require('azure');
 var http = require('http');
 
var storageAccount = 'mvatlv';
var accessKey = 'MJuO2KVefGI118r2iVaP5mcIDAWh5aZbE5gpQdtuc+jP0FNf2UVmxf5tDtZvi1Nrc4CnVFe+GaG3v3oTGyHInw==';
var containerName = 'invites';

var fileUrl = "https://" + storageAccount + ".blob.core.windows.net/" +  containerName + "/";
 
var app = express(); 

app.use('/static', express.static(__dirname));

app.get('/',  function (req, res) {
    res.sendFile(__dirname + "/upload.htm");
});

//upload a file to azure blob storage 
app.post('/upload', function (req, res) { 
    var multiparty = require('multiparty');
     
    var blobService = azure.createBlobService(storageAccount, accessKey); 
    var form = new multiparty.Form(); 
     
    form.on('part', function (part) { 
        if (part.filename) { 
             
            var size = part.byteCount - part.byteOffset; 
            var name = part.filename; 
             
            blobService.createBlockBlobFromStream(containerName, name, part, size, function (error) { 
                if (error) { 
                    res.send(' Blob create: error '); 
                } 
            }); 
        } else { 
            form.handlePart(part); 
        } 
    }); 
    form.parse(req); 
    res.send('OK'); 
}); 
//end of upload a file to azure blob storage 


//upload a file to azure blob storage 
app.get('/list', function (req, res) { 
    
    var blobService = azure.createBlobService(storageAccount, accessKey); 
    blobService.listBlobsSegmented(containerName, null, function(err, result) {
        if (err) {
            console.log("Couldn't list blobs for container %s", containerName);
            console.error(err);
        } else {
            console.log('Successfully listed blobs for container %s', containerName);
            console.log(result.entries);

            var sortedEntries = result.entries.sort(function(a, b) {
                var date1 = new Date(a.properties["last-modified"]);
                var date2 = new Date(b.properties["last-modified"]);
                return date1>date2 ? -1 : date1<date2 ? 1 : 0;
            });    

            var line = '';             
            sortedEntries.forEach(function(entry){
                var keys = Object.keys(entry.properties);
                line += entry.name + " " + new Date(entry.properties["last-modified"]).toLocaleDateString() + "<br>";
                //keys.forEach( function(key){ line += " " + key + "=" + entry.properties[key]; });
            });
            res.send(line);            
        }
    });

});
     
//end of upload a file to azure blob storage 


//create a server 
http.createServer(app).listen(8888); 
