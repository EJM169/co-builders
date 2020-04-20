const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector("chat-messages");
var username = document.getElementById("username").innerText;

// const {username}=Qs.parse(location.search);

console.log(username)

const socket = io();

socket.emit("username",username);
socket.on('message', message =>{
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener('submit', (e) =>{
    e.preventDefault();

    const msg = e.target.elements.message.value;

    socket.emit('chatMessage', msg);
    e.target.elements.message.value="";
    e.target.elements.message.focus();
});

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('messages');
    div.innerHTML = `  <p class="lead">${message.username} <span>${message.time}</span>:${message.text} </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}