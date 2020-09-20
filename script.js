const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const searchButton = document.getElementById('search');
const name = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', {name})

socket.on('chat-message', data => {
  appendMessage(`${data.profile.name}: ${data.message}`)
})

socket.on('connected-to-user',data=>{
  appendMessage(`${data.name} Has connected ....`);
})

socket.on('user-connected', response => {
  appendMessage(response.message)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

searchButton.addEventListener('click',(e)=>{
    e.preventDefault();
    socket.emit('search-for-room');
})

socket.on('chat-disconnected',data=>{
  appendMessage(`User Has Disconnected !!...`);
});

socket.on('disconnect',()=>{
  clearMessages();
  appendMessage('You have Been Disconnected ...');
})



function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}

function clearMessages() {
  const parent = messageContainer;
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}