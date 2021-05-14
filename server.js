const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./index");
const userdata = require("./schema/userschema");
const { checkStatus } = require("./functions/checkStatus");

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    setTimeout(() => {
      checkStatus();
    }, 1000);
    console.log("DB connection successful!");
  });

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server started successfully on ${PORT}`);
});

app.post("/postUser", async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const pinCode = req.body.pinCode;
    const user = await userdata.create({
      email,
      name,
      pinCode,
      message_time: new Date(),
      age: req.body.age,
    });
    res.json({ message: user, status: 1 });
  } catch (e) {
    res.json({ message: e.message, status: -1 });
  }
});
