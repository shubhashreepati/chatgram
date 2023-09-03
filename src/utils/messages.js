const generateMessage = (msgUserName,text) =>{
    return {
        msgUserName,
        text,
        createdAt: new Date().getTime()    // it generates miliseconds spent till present , while calculating form midnight 1 JAN 1970
    }
}

const generateLocationMessage = (username,url) =>{
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports ={
    generateMessage: generateMessage,
    generateLocationMessage: generateLocationMessage
}