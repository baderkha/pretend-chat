const io = require('socket.io')(3000)
const User = require('./src/model/user');
const { uuid } = require('uuidv4');
const users = [];
const searches = [];
const WAIT_INTERVAL = 5000;
setInterval(() => {
    console.log(users);
}, 5000);

io.on('connection', socket => {
  socket.on('new-user', (userDetails) => {
    if (userDetails && userDetails.name){
        users[socket.id] = new User(socket.id,userDetails);
        console.log(users);
        socket.emit('user-connected', {message:"welcome"});
        return;
    } 
    socket.emit('error-client', {message:"user must connect with name atleast"});
    socket.disconnect();
    delete socket;
  })
  socket.on('search-for-room',()=>{
    console.log('searching');
    const currentUser = users[socket.id];
    currentUser.isSearching = true;
    searches[currentUser.id] = setInterval( onSearch.bind(this,socket,io,users,currentUser), WAIT_INTERVAL);
  })
  socket.on('send-chat-message', message => {
    const currentUser = users[socket.id];
    const toUser = findUserByRoomId(users,currentUser.roomId,currentUser.id);
    console.log('sending to=>',toUser);
    if (toUser){
        io.to(toUser.id).emit('chat-message', { message: message, name: users[socket.id] })
        socket.emit('status',{message : "meesage sent => to user"});
        return;
    }
    socket.emit('error-client',{message:"user is not associated with a room"});
    socket.disconnect();
    delete socket; 
})
  socket.on('disconnect', () => {
    socket.emit('user-disconnected', users[socket.id])
    clearInterval(searches[socket.id]);
    delete users[socket.id]
    delete searches[socket.id]; 
  })
})

const onSearch = (socket,io,users,currentUser) => {
    console.log('searching user=>',currentUser.id)
    for (userkey in users){
        let user = users[userkey];
        if (user.isSearching && user.id != currentUser.id ){
            console.log('FOUND !');
            const roomId = uuid();
            currentUser.roomId = roomId;
            user.roomId = roomId;
            user.isSearching = false;
            currentUser.isSearching = false;
            // send to the current client
            socket.emit('connected-to-user',user.getProfile())
            // send to the other client waiting
            io.to(user.id).emit('connected-to-user',currentUser.getProfile())
            clearInterval(searches[currentUser.id]);
            clearInterval(searches[user.id]);
            return;
        }
    }
    socket.emit('status',{message:"searching please wait"});
}

const findUserByRoomId = (users,roomId,notInId)=>{
    for (userkey in users){
        const user = users[userkey];
        console.log(user);
        if (user.roomId == roomId && user.id != notInId){
            return user;
        }
    }
    return false;
}


