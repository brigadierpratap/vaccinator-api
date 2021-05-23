const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./index");
const userdata = require("./schema/userschema");
const { checkStatus } = require("./functions/checkStatus");
const https = require("https");
const http = require("http");

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    setInterval(() => {
      checkStatus();
    }, 301000);
    console.log("DB connection successful!");
  });

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("started");
});

app.post("/unsub", async (req, res) => {
  try {
    const email = req.body.email;
    const re =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    const flag = re.test(String(email).toLowerCase());
    if (flag !== true) {
      res.json({ message: "Invalid Email", status: -1 });
      return;
    }
    const a = await userdata.deleteOne({ email: email });
    res.json({ message: "Unsubscribed", status: 1 });
  } catch (e) {
    res.json({ message: e.message, status: -1 });
  }
});
app.post("/postUser", async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const pinCode = req.body.pinCode;
    const re =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    const flag = re.test(String(email).toLowerCase());
    if (
      String(pinCode).length < 6 ||
      String(pinCode).length > 6 ||
      isNaN(Number(pinCode))
    ) {
      res.json({ message: "Invalid PIN Code", status: -1 });
      return;
    }
    if (flag !== true) {
      res.json({ message: "Invalid Email", status: -1 });
      return;
    }
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
