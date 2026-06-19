const http = require('http');
const connectDB = require("./config/mongo.config");



const httpServer = http.createServer((req, res) => {

    res.end('Hello World!');
})

const PORT = 9006
const HOST = 'localhost'    

httpServer.listen(PORT, HOST, (err) => {
    if(!err) {
        console.log(`Server is running on http://${HOST}:${PORT}`)
        console.log('Press Ctrl+C to stop the server........')
    }
})