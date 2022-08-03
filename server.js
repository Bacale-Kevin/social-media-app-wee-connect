const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
require("dotenv").config({ path: "./config.env" });
const connectDb = require("./utilsServer/connectDb");
const PORT = process.env.PORT || 3000;
connectDb();

io.on("connection", (socket) => {
  socket.on("myname", ({ name, age }) => {
    console.log({ name, age });

    socket.emit("serverdata", { name: `data received from ${name} with age ${age}` });
  });
});

nextApp.prepare().then(() => {
  // middleware
  app.use(express.json());

  //handle our custom routes
  app.use("/api/signup", require("./api/signup"));
  app.use("/api/auth", require("./api/auth"));
  app.use("/api/search", require("./api/search"));
  app.use("/api/posts", require("./api/posts"));
  app.use("/api/profile", require("./api/profile"));
  app.use("/api/notifications", require("./api/notifications"));
  app.use("/api/chats", require("./api/chats"));

  app.all("*", (req, res) => handle(req, res)); // This code enable files in the pages folder to work properly

  server.listen(PORT, (err) => {
    if (err) throw err;

    console.log(`Express server running on port ${PORT}`);
  });
});
