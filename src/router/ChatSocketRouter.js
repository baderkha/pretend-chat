const Router = require('./Router');
const io = require('socket.io');
const ChatController = require('../controller/ChatController');
class ChatSocketRouter extends Router {
    /**
     * Takes in the controller and the port number
     * @param {ChatController} chatController 
     * @param {number} port 
     */
    constructor(chatController,port,logging=false){
        super(chatController,port,logging);
        this.io = io(this.port);
        if (this.logging){
            this.controller.enableLogging();
        }
    }
    route(){
        this.io.on('connection',socket=>{
            this.controller.setSocketIOConnection(this.io);
            // socket routes go here
            socket.on('new-user',this.controller.onNewUser.bind(this.controller,socket));
            socket.on('search-for-room',this.controller.onSearchForRoom.bind(this.controller,socket));
            socket.on('send-chat-message', this.controller.onSendChatMessage.bind(this.controller,socket));
            socket.on('disconnect',this.controller.onDisconnect.bind(this.controller,socket));
        })

    }
}

module.exports = ChatSocketRouter;