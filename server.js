const app = require('express')
const server = require('http').Server(app)
const next = require('next')
const dev = process.env.NODE_ENV !== "production"; 
const nextApp = next({dev})
const handle = nextApp.getRequestHandler();
require('dotenv').config({path: "./config.env"})
const connectDb = require('./utilsServer/connectDb')
const PORT = process.env.PORT || 3000
connectDb()

nextApp.prepare().then(() => {
    app.call('*', (req, res) => handle(req, res)) // This code enable files in the pages folder to work properly

    server.listen(PORT, err => {
        if(err) throw err

        console.log(`Express server running on port ${PORT}`)
    })
})