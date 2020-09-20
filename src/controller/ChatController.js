const { uuid } = require('uuidv4');
const User = require('../model/User');
/**
 * Chat controller
 * This handles the chat events
 */
class ChatController {
    constructor(io=null,searchInterval=null){
        this.io = io;
        this.users = [];
        this.searches = [];
        this.searchInterval = searchInterval ? searchInterval : ChatController.SEARCH_INTERVAL()
        this.loggingId = null;
    }
    static SEARCH_INTERVAL(){
        return 1000;
    }
    setSocketIOConnection(io){
        this.io = io;
    }
    enableLogging(){
        if (!this.loggingId){
            this.loggingId = setInterval(()=>{
                console.log(this.users)
            },5000);
            return true;
        }
        return false;
    }
    disableLogging(){
        if (this.loggingId){
            clearInterval(this.loggingId);
            return true;
        }
        return false;
    }
    onNewUser(socket,userDetails){
        if (userDetails && userDetails.name){
            this.users[socket.id] = new User(socket.id,userDetails);
            socket.emit('user-connected', {message:"welcome"});
            return;
        } 
        socket.emit('error-client', {message:"user must connect with name atleast"});
        socket.disconnect();
    }
    onSearchForRoom(socket){
        const currentUser = this.users[socket.id];
        currentUser.isSearching = true;
        this.searches[currentUser.id] = setInterval(this._onSearch.bind(this,socket,currentUser), this.searchInterval);
    }
    onSendChatMessage(socket,message){
        const currentUser = this.users[socket.id];
        const toUser = this._findOtherUserByRoomId(currentUser);
        console.log('sending to=>',toUser);
        if (toUser){
            this.io.to(toUser.id).emit('chat-message', { message: message, profile: currentUser.getProfile()})
            socket.emit('status',{message : "meesage sent => to user"});
            return;
        }
        // just kick them
        socket.emit('error-client',{message:"user is not associated with a room"});
        socket.disconnect();
    }
    onDisconnect(socket){
        const currentUser = this.users[socket.id];
        if (currentUser){
          if (currentUser.isChatting()){
            const toUser = this._findOtherUserByRoomId(currentUser);
            if (toUser){
              toUser.roomId = null;
              this.io.to(toUser.id).emit('chat-disconnected');
            }
          }
        }
        clearInterval(this.searches[socket.id]);
        delete this.users[socket.id]
        delete this.searches[socket.id]; 
    }
    _onSearch(socket,currentUser){
        const {io,users,searches} = this;
        for (let userkey in users){
            let user = users[userkey];
            if (user.isSearching && user.id != currentUser.id ){
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

    _findOtherUserByRoomId(currentUser){
        for (let userkey in this.users){
            const user = this.users[userkey];
            console.log(user);
            if (user.roomId == currentUser.roomId && user.id != currentUser.id){
                return user;
            }
          }
        return false;
    }
}

module.exports = ChatController;