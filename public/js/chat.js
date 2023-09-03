
const socket=io()  // io return value stored in socket

// Elements
const $messageForm= document.querySelector('#msgForm')
const $messageFormInput= $messageForm.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate =  document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options
// const {username,room} = Qs.parse(location.search ,{ignoreQueryprefix: true})
const autoscroll = () =>{
    // New message element
    const $newMessage= $messages.lastElementChild

    // Height of new message
    const newMessageStyles= getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=  $newMessage.offsetHeight + newMessageMargin


    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight<= scrollOffset){
        $messages.scrollTop= $messages.scrollHeight
    }

    console.log(newMessageStyles)

}


function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query
    
}

const obj=parseQuery(location.search)
// console.log(obj)

socket.on('serverMsg', (message)=>{
    console.log('Message received is ', message)
    
    const html= Mustache.render(messageTemplate,{
        username: message.msgUserName,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (message)=>{
    console.log(message)

    const html= Mustache.render(locationMessageTemplate,{
        username: message.username,
        location_url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room,users})=>{
     const html =Mustache.render(sidebarTemplate,{
        room, 
        users
     })

     document.querySelector('#sidebar').innerHTML= html
})

document.querySelector('#msgForm').addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const userMsg=e.target.elements.msgInput.value

    socket.emit('clientMsg',userMsg ,(error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
           return  console.log(error)
        }

        console.log('Message Delivered')
    })
})


$sendLocationButton.addEventListener('click',  ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    // Disable
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})


socket.emit('join',obj,(error)=>{

    if(error){
        alert(error)
        location.href='/'
    }

})


