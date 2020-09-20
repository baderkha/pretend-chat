/**
 * Class In charge of routing more than one form of connection
 */
class Router {
    constructor(controller,port=3000,logging=false){
        this.controller = controller;
        this.port = port;
        this.logging = logging;
    }
    route(){
        return false;
    }
}

module.exports = Router;