var express             = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    flash               = require("connect-flash"),
    mongoose            = require("mongoose"),
    passport            = require("passport"),
    methodOverride      = require("method-override")
    doctorUser          = require("./models/Doctor"),
    doctorRoute         = require("./routes/doctor"),
    indexAuthRoute      = require("./routes/index"),
    userRoute           = require("./routes/user");
    const PORT = process.env.PORT || 5000    
    
   // mongoose.connect("mongodb://beat:beat123@ds211592.mlab.com:11592/instadoc");
    mongoose.connect("mongodb://localhost:27017/InstaDoc");
    
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/routes'));
app.use(methodOverride("_method"));
app.use(require("express-session")({
    secret:"This is a secret so Shush",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(doctorUser.serializeUser());
passport.deserializeUser(doctorUser.deserializeUser());
app.use(flash()); 
app.use(function(req,res,next){
    res.locals.currentUser  = req.user;
    res.locals.error        = req.flash("error");
    res.locals.success      = req.flash("success");
    next();
});
app.use(indexAuthRoute);

app.use(doctorRoute);
app.use(userRoute);

server=app.listen(PORT);

const io = require("socket.io")(server);
var usercount       =[],
    // userDetail      =[{roomname[{
    //                     username,
    //                     mobile    }]}],
    usernames       ={},
    doctorlist      ={},
    usermobile      =[],
    roomname        =[],
    connections     =[],
    doctor          =[];
    // -----------
    // array Structure
    // actiRoom={dRoomname : , status : , userlist: };
    // actiList= array(actiRoom)
    // -----------
var actiList = [];
var actiRoom;
   
    io.sockets.on("connection",function(socket){
        // socket.on("join", function(roomid,username,mobile){
        //     socket.join(roomid);
        //     userName.push(username);
        //     userMobile.push(mobile);
        //     usercount.push(socket);
        //     console.log('User count  %s',usercount.length);
        // socket.on('disconnect',function(data){
        //     usercount.splice(usercount.indexOf(socket),1);
        //     console.log('User count   %s',usercount.length);
    
        // });
    
        // });
        connections.push(socket);
        console.log('connected: %s sockets connected', connections.length);
        socket.on('new userLogged', function(room,user,mobile){
            // console.log(room);
            console.log("user connected");
            // console.log(mobile);
            // console.log("new user");
            socket.username = user;
            socket.usermobile = mobile;
            socket.room = room;

            roomname.push(socket.room);
            usernames[socket.username]=socket;
            usermobile.push(socket.usermobile);
            // updateUsernames()
            updateUsernames();
            updateDoc();
            //--------------------------
            var rIndex = findRoom(room);
            actiRoom = actiList[rIndex];
            actiRoom.userlist.push(user);



          });

          socket.on('new doctorLogged',function(data){   
            console.log("Doctor connected");
              socket.doctorName = data;
              doctorlist[socket.doctorName] = socket;
              doctor.push(socket.doctorName);
            updateUsernames();
            updateDoc();

           
          });

          socket.on('disconnect',function(data){
              console.log(data);
                roomname.splice(roomname.indexOf(socket.roomname), 1);
                delete usernames[socket.username];
              //  usernames.splice(usernames.indexOf(socket.username), 1);
                usermobile.splice(usermobile.indexOf(socket.usermobile), 1);
            
                    doctor.splice(doctor.indexOf(socket.doctorName),1);
                    delete doctorlist[socket.doctorName];
                    updateDoc();
     
                console.log(doctor);
                connections.splice(connections.indexOf(socket), 1);
                console.log("Disconnected: %s sockets Disconnected", connections.length);
                updateUsernames()
                updateDoc();
 
          });
          socket.on('send message', function(message,user){
            console.log(user)
            var msg = message.trim();
            if(msg.substring(0,3) === '/w '){
                console.log("Whisper");
                msg=msg.substring(3);
                var ind = msg.indexOf(' ');
                if(ind!== -1){
                    console.log("Whisper 2");
                    var name = msg.substring(0,ind);
                    console.log(name);
                    msg=msg.substring(ind+1)
                    if(name in usernames){
                        console.log("Whisper in");
                        usernames[name].emit('Whisper', {msg: msg, user:user});
                        socket.emit('Whisper', {msg: msg, user:user});
                        

                    }else if(name in doctorlist){
                        console.log("Whisper to Doc");
                        doctorlist[name].emit('Whisper', {msg: msg, user:user});
                        socket.emit('Whisper', {msg: msg, user:user});
                    }

                }
            }else
            io.sockets.emit('new message', {msg: message, user:user});
          });
        
          function updateUsernames(){
            
            io.sockets.emit('get users',Object.keys(usernames));
            
          }
          function updateDoc(){
            
            io.sockets.emit('DocList',Object.keys(doctorlist));
            console.log(Object.keys(doctorlist));
            
          }
          function findRoom(data){
              var f = 0;
              for(i=0;i<actiList.length;i++)
              {
                  if (actiList[i].dRoomname==data)
                  {f=1;
                  return i;
                  }
              }
              if (f==0)
              var newActiRoom={dRoomname : data , status : 'offline', userlist: [] };
              actiList.push(newActiRoom);
              return 0;



          }
    });
 
