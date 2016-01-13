var Imap = require('imap'),
    inspect = require('util').inspect;

var imap = new Imap({
  user: 'addysanto@gmail.com',
  password: '!1q2w3e4r5t6y',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

function getMessagePart(structs) {

 if(structs.length == 1)
    return null;    
 
  for(var i=0; i< structs.length; i++)
  {
        var part = structs[i];
        if (part.length > 0 && part[0].type == "message")
        {
            return part[0];
        }
  }
  return null;
}
    

imap.once('ready', function() {
    
    openInbox(function(err, box) {
    if (err) throw err;
    var f = imap.seq.fetch(box.messages.total + ':*', { struct:true, bodies: ['HEADER.FIELDS (FROM)','TEXT'] });
    f.on('message', function(msg, seqno) {
        console.log('Message #%d', seqno);
        var prefix = '(#' + seqno + ') ';
        msg.on('body', function(stream, info) {
        if (info.which === 'TEXT')
            console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
        var buffer = '', count = 0;
        
        stream.on('data', function(chunk) {
            count += chunk.length;
            buffer += chunk.toString('utf8');
            if (info.which === 'TEXT')
            console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
        });
        stream.once('end', function() {
            if (info.which !== 'TEXT')
            console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
            else
            console.log(prefix + 'Body [%s] Finished', inspect(info.which));
        });
        });
        msg.once('attributes', function(attrs) {


            console.log("------------------------------------------------ ");
            
            var part = getMessagePart(attrs.struct);

            //console.log("-- -- " + inspect(part.envelope.from));
            console.log("-- -- " + inspect(part.body[3]));
            
            console.log("INSPECT:\n" + inspect(part));
            
                
            console.log("------------------------------------------------ ");
        

//        attrs.struct.forEach(function(struct){
//            console.log("-- " + inspect(struct));
//            console.log("-- -- " + inspect(struct.length));
//            
//        });

            
        });
        msg.once('end', function() {
        console.log(prefix + 'Finished');
        });
    });
    f.once('error', function(err) {
        console.log('Fetch error: ' + err);
    });
    f.once('end', function() {
        console.log('Done fetching all messages!');
        imap.end();
    });
    });  

});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();

