const users = require("../schema/userschema");
const mailjet = require("node-mailjet").connect(
  "edc852b62ff2ebdd68a947dc860ec79b",
  "ca80aad819108c7f26ff4f4bb9b16ee8"
);
const fetch = require("node-fetch");
const request = require("request");
const exec = require("child_process").exec;
var z;

exports.checkStatus = async () => {
  const us = await users.find({ message_sent: false });
  for (var i in us) {
    const u = us[i];
    const diff = new Date() - u.message_time;
    if (u.message_sent === false) {
      await getStatus(u);
    } else if (diff > 86400000) {
      await getStatus(u);
    }
  }
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
const getStatus = async u => {
  var responseText = "",
    flag = false;
  const d = new Date();
  const m = [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join(
    "-"
  );
  console.log(m, u.pinCode, u.age);

  /*  request(
    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${u.pinCode}&date=${m}`,
    async function (error, response, body) {
      if (!error) {
        console.log("body:", body);
      } else console.error("error:", error);
    }
  ); */

  await fetch(
    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${u.pinCode}&date=${m}`,
    {
      credentials: "include",
      headers: {
        accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
      },
    }
  )
    .then(res => {
      if (res.ok) return res.json();
      else console.log(res);
    })
    .then(data => {
      console.log(data);
      if (data.sessions.length > 0) {
        const a = data.sessions.filter(c => {
          if (c.available_capacity > 0) {
            if (u.age === true && c.min_age_limit === 45) {
              return true;
            }
            return true;
          } else return false;
        });
        for (var i = 0; i < a.length; i++) {
          responseText =
            responseText + `${a[i].name} - ${a[i].available_capacity}\n`;
        }
      } else {
        responseText = false;
      }
      console.log(responseText);
      if (responseText !== false || responseText !== "") {
        /*         sendMail(u, responseText);
         */
      }
    })
    .catch(err => {
      console.log(err.message);
    });
};
