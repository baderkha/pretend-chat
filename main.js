const ChatSocketRouter = require('./src/router/ChatSocketRouter');
const ChatController = require('./src/controller/ChatController');
const CHAT_SERVER_PORT = 3000;

// chat router config
const chatRouter = new ChatSocketRouter(
    new ChatController(),
    CHAT_SERVER_PORT,
    true
)
chatRouter.route();