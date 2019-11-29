$(function(){

    var socket  = io.connect(),
        // Send    = $("#doctorSend"),
        // Message = $("#doctorMessage"),
        $doctorName    = $("#doctorName").text(),
         $messageForm = $('#messageForm'),
         $message = $('#message'),
         $chat = $('#chat'),
        $users   = $('#users');     
    

        $(document).ready(function() {
        
            socket.emit('new doctorLogged',$doctorName);
           });
        
           socket.on('get users', function(username){
            var html = '';
               
            console.log("username");
            for(i=0; i<username.length; i++){
              html += '<li><a>'+username[i]+'</a></li>' 
              
            }
            $users.html(html);
          });

          $messageForm.submit(function(e){
            e.preventDefault();
            console.log("Submitted.")
            //emit message data
            
            socket.emit('send message', $message.val(),$doctorName);
            //clear message div once emitted
            $message.val('');
          })
          socket.on('Whisper', function(data){
            $chat.append(' <div class="wis"> <strong>'+data.user+": "+'</strong>' + data.msg + ' </div> ')
          });

          socket.on('new message', function(data){
            $chat.append(' <div class="well"> <strong>'+data.user+": "+'</strong>' + data.msg + ' </div> ')
          });
});