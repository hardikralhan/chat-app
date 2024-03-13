const express = require("express");
const { Server } = require("socket.io")


const PORT = 3501
const ADMIN = "Admin"

const app = express()

const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

// state 
const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', async (socket) => {
    console.log(`User ${socket.id} connected`)

    // Upon connection - only to user 
    socket.emit('message', await buildMsg(ADMIN, "Welcome to Chat App!"))

    socket.on('enterRoom', async({ name, room }) => {

        // leave previous room 
        const prevRoom = await getUser(socket.id)?.room

        if (prevRoom) {
            await socket.leave(prevRoom)
            io.to(prevRoom).emit('message', await buildMsg(ADMIN, `${name} has left the room`))
        }

        const user = await activateUser(socket.id, name, room)

        // Cannot update previous room users list until after the state update in activate user 
        if (prevRoom) {
            io.to(prevRoom).emit('userList', {
                users: await getUsersInRoom(prevRoom)
            })
        }

        // join room 
        socket.join(user.room)

        // To user who joined 
        socket.emit('message', await buildMsg(ADMIN, `You have joined the ${user.room} chat room`))

        // To everyone else 
        socket.broadcast.to(user.room).emit('message', await buildMsg(ADMIN, `${user.name} has joined the room`))

        // Update user list for room 
        io.to(user.room).emit('userList', {
            users: await getUsersInRoom(user.room)
        })

        // Update rooms list for everyone 
        io.emit('roomList', {
            rooms: await getAllActiveRooms()
        })
    })

    // When user disconnects - to all others 
    await socket.on('disconnect', async() => {
        const user = await getUser(socket.id)
        await userLeavesApp(socket.id)

        if (user) {
            io.to(user.room).emit('message', await buildMsg(ADMIN, `${user.name} has left the room`))

            io.to(user.room).emit('userList', {
                users: await getUsersInRoom(user.room)
            })

            io.emit('roomList', {
                rooms: await getAllActiveRooms()
            })
        }

        console.log(`User ${socket.id} disconnected`)
    })

    // Listening for a message event 
    socket.on('message', async ({ name, text }) => {
        let room = await getUser(socket.id)
        room = room?.room
        console.log(room);
        if (room) {
            console.log(await buildMsg(name, text));
            io.to(room).emit('message', await buildMsg(name, text))
        }
    })

    // Listen for activity 
    socket.on('activity', async(name) => {
        const room = await getUser(socket.id)?.room
        if (room) {
            socket.broadcast.to(room).emit('activity', name)
        }
    })
})

// message to store
const buildMsg = async(name, text) => {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date())
    }
}

// User functions for chat app
const activateUser = async(id, name, room) => {
    const user = { id, name, room }
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])
    return user
}

const userLeavesApp = async (id) => {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    )
}

const getUser = async(id) => {
    return UsersState.users.find(user => user.id === id)
}

const getUsersInRoom = async(room) => {
    return UsersState.users.filter(user => user.room === room)
}

// moving it into set to get unique rooms
const getAllActiveRooms = async() => {
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}