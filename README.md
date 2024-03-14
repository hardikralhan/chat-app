**Instruction to run**
Server - 1. run "npm i"
          2. run "npm start"

client - 1. run live server from html file which is located in client with name 'index.html'

**Architecture**

Server Side:

  The server is implemented using Node.js with Express framework.
  Socket.io library is used to establish and manage websocket connections between the server and clients.
  When a client connects to the server, a websocket connection is established, allowing bidirectional communication between the server and the client.
  Each connected client is associated with a unique socket instance. A room name is saved with every user that comes in. 
  Only user with specifies room can chat with the members of that room.
  The server listens for incoming messages from clients and broadcasts those messages to all other connected clients, creating a shared chatroom environment.
  used cors for only frontend port which is on 5500
Client Side:

  Clients interact with the server through a web interface (HTML, CSS and JavaScript).
  The client-side code establishes a websocket connection with the server using Socket.io.
  Users can send messages by typing into an input field and submitting the form with room name and his/her own name. Upon submission, the message is sent to the server.
  Room gets updated with name of new user and if user disconnects room gets updated with when user leaves.
  Received messages from other clients are displayed in real-time on the client's interface.

How concurrency is managed -

Concurrency is managed by the event-driven nature of Node.js and the asynchronous model provided by libraries like Socket.io.
When a new client connects, Socket.io creates a new socket instance, allowing multiple clients to connect concurrently.
Incoming messages from clients are handled asynchronously. When a message is received from a client, the server broadcasts the message to all other clients asynchronously, without blocking the main event loop.
Asynchronous I/O operations prevent the server from being blocked while waiting for messages from clients or while broadcasting messages to other clients.
Node.js's event loop ensures that the server can handle multiple concurrent connections efficiently without the need for traditional threading.


Web-Based Interface: The client-side interface is designed as a web application using HTML and JavaScript. 
                    This choice allows for broad accessibility across different devices and platforms without requiring users to install additional software.

WebSocket Communication: Socket.io is chosen as the primary library for handling websocket communication between the server and clients. 
                        This choice offers real-time, bidirectional communication with built-in features like automatic reconnection and multiplexing, simplifying the implementation of the chat application.

Text-Based Interface: The user interface for sending and receiving messages is kept simple and text-based. 
                      While more sophisticated interfaces could be implemented (e.g., graphical or multimedia chat), a text-based interface reduces complexity and allows for quick development and testing.


APPLICATION WILL LOOK LIKE 

![image](https://github.com/hardikralhan/chat-app/assets/77456767/6f75d8bf-91b9-4bd0-8801-3a148c2ddcb0)


Add name and room name and then click join.
Then another person can join the same room with same room name
