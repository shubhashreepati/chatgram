const express = require('express')
const http = require('http')
const path =require('path')
const socketio= require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const { SocketAddress } = require('net')

const app =express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))



io.on('connection' ,(socket)=>{
    console.log('New WebSocket connection')

    socket.on('join', ({username,room}, callback)=>{
        
        const msgUserName='Admin'
        

        const {error,user} = addUser({id:socket.id , username, room})

        if(error){
            return callback(error)
        }
       
        socket.join(user.room)

        socket.emit('serverMsg',generateMessage(msgUserName,'Welcome!'))
        socket.broadcast.to(user.room).emit('serverMsg',generateMessage(msgUserName,`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{
            room: user.room, 
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('clientMsg',(msg,callback)=>{

        const user= getUser(socket.id)
        const filter= new Filter()

        const msgUserName=user.username

        // check for profanity in passed message
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('serverMsg',generateMessage(msgUserName,msg))

        callback()
    })

    socket.on('disconnect',() =>{
        const user=removeUser(socket.id)
        const msgUserName='Admin'

        if(user){

            io.to(user.room).emit('serverMsg',generateMessage(msgUserName,`${user.username} has left!`))

            io.to(user.room).emit('roomData',{
                room: user.room, 
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation',(location,callback)=>{
        const user= getUser(socket.id)
        io.to(user.room).emit('locationMessage',  generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

})

server.listen(port,()=>{
    console.log(`Server is up on port ${port}!`)
})