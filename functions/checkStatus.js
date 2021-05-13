const users = require("../schema/userschema");
const mailjet = require("node-mailjet").connect(
  "edc852b62ff2ebdd68a947dc860ec79b",
  "ca80aad819108c7f26ff4f4bb9b16ee8"
);
const fetch = require("node-fetch");
exports.checkStatus = async () => {
  const us = await users.find({ message_sent: false });
  us.map(async u => {
    const diff = new Date() - u.message_time;
    if (u.message_sent === false) {
      const x = await getStatus(u.pinCode, u.age);
      if (x !== false) {
        await sendMail(u, x);
      }
    } else if (diff > 86400000) {
      const x = await getStatus(u.pinCode);
      if (x !== false) {
        await sendMail(u, x);
      }
    }
  });
};

const sendMail = async (u, x) => {
  const htmlpart = `<h3>Hello ${u.name} <br/> A new vaccination slot is available in your area.<br/><br/>${x}<br/> Visit <a href="https://www.cowin.gov.in/home" >Cowin</a></h3>`;
  const request = await mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: "pmarsingh@gmail.com",
            Name: "PAWAN SINGH",
          },
          To: [
            {
              Email: u.email,
              Name: u.name,
            },
          ],
          Subject: "Greetings from Pawan Singh.",
          TextPart: "Vaccination slot available",
          HTMLPart: htmlpart,
          CustomID: "AppGettingStartedTest",
        },
      ],
    })
    .then(async result => {
      u.message_sent = true;
      u.message_time = new Date();
      await u.save();
    })
    .catch(err => {
      console.log(err.statusCode);
    });
};
function pad(s) {
  return s < 10 ? "0" + s : s;
}
const getStatus = async (pinCode, age) => {
  var res = "";
  const d = new Date();
  const m = await [
    pad(d.getDate()),
    pad(d.getMonth() + 1),
    d.getFullYear(),
  ].join("-");
  console.log(m, pinCode);
  await fetch(
    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pinCode}&date=${m}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
        "User-Agent": "Other",
      },
      body: null,
    }
  )
    .then(res => {
      return res.text();
    })
    .then(data => {
      console.log(data);
      if (data.sessions.length > 0) {
        const a = data.sessions.filter(c => {
          if (c.available_capacity > 0) {
            if (age === true && c.min_age_limit === 45) {
              return true;
            }
            return true;
          } else return false;
        });
        for (var i = 0; i < a.length; i++) {
          res = res + `${a[i].name} - ${a[i].available_capacity}\n`;
        }
      } else {
        res = false;
      }
    })
    .catch(err => {
      console.log(err);
      res = false;
    });
  return res;
};
