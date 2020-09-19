const { useDebugValue } = require("react");

class User {
    constructor(socketId,userDetails){
        this.id = socketId;
        this.isSearching = false;
        this.userDetails = {
            name : userDetails.name,
            intoList: userDetails.intoList,
        };
        this.roomId = null;
    }
    getProfile(){
        return this.userDetails;
    }
}

module.exports = User;
