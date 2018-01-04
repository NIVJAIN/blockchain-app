var cors = require('cors');
var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var watermark = require('image-watermark');
var PythonShell = require('python-shell');
var notifier = require("mail-notifier");
var nodemailer = require('nodemailer');
var sinchAuth = require('sinch-auth');
//var sinchSms = require('sinch-messaging');
//var auth = sinchAuth("e6aee45b-cafe-4145-b478-df1922dadfe2", "L3y33oytvkuQR+yzVApkVg==");
var mongoose = require('mongoose');
var blockchainInfo = require('./bcSchema');
var port = process.env.PORT || 8081;




var app = express();
app.use(bodyParser.json());
app.use(cors());

// app.post('/login', function(req, res) {
//   if(req.body.username === 'sripaljain' && req.body.password ==='sripaljain') {
//     console.log("User name = " + username + ", password is " + password);
//     res.end("yes");
//   }
//   else {
//     res.end("no");
//   }
// })
app.post('/login', function (req, res) {
  if (req.body.username === 'sripaljain' && req.body.password === 'sripaljain') {
    res.status(200).send({
      user: 'sripaljain'
    })
  }
  else {
    res.status(403).send({
      error: 'Login In Failed'
    })
  }
})

var azure = require('azure-storage');
var blobSvc = azure.createBlobService('ngpblockchain', process.env.CUSTOMCONNSTR_AzureBlobStorage);
var Web3 = require('web3'),
    contract = require("truffle-contract"),
    path = require('path')
//EmailNotificationSetup
    var imap = {
        username: "ngpblockchain@gmail.com",
        password: process.env.CUSTOMCONNSTR_Password,
        tls: true,
        host: "imap.gmail.com",
        port: 993, // imap portn
        secure: true // use secure connection
    };

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ngpblockchain@gmail.com',
        pass: '$iloveblockchain'
      }
    });
//Start-SendDataToMongoDB
function SendDataIntoMongoDBLocal(comNam, comAdd, comPrj, txHas, blocknumbe, blockhas, comRegDate, gasUsed) {
        mongoose.connect(process.env.CUSTOMCONNSTR_MongoDbConnString, function (err) {
            if (err) throw err;
            console.log('Successfully connected');
            var addBlkInfo = new blockchainInfo({
                _id: new mongoose.Types.ObjectId(),
                name: {
                    companyName: comNam,
                    companyAddress: comAdd,
                    companyProject: comPrj
                },
                blockchain: {
                    txhash: txHas,
                    blocknumber: blocknumbe,
                    blockhash: blockhas,
                    registrationDate: comRegDate,
                    gasused: gasUsed
                }
            });
            addBlkInfo.save(function (err) {
                if (err) throw err;
                console.log('Author successfully saved.');
            });
        });
    }
//End-SendDataToMongoDB



//Start-AzureSendGridEmailService
function SendGridEmail(stringfilename, finalValue, companynameemail) {
    var helper = require('sendgrid').mail;
  var sg = require('sendgrid')(process.env.CUSTOMCONNSTR_SendGridApiKey);

    var mail = new helper.Mail();
    var email = new helper.Email('noreply@ngpblockchain.com', 'NGP-BLOCKCHAIN');
    mail.setFrom(email);

    mail.setSubject('Hello World from the SendGrid Node.js Library');
  mail.setSubject('BlockchainRegistration is DONE for: ' + companynameemail);

    var personalization = new helper.Personalization();
    email = new helper.Email('sripal.jain@gmail.com', 'GutenMorgen');
    personalization.addTo(email);
    email = new helper.Email('sripal_jain@imda.gov.sg', 'GutenMorgen');
    personalization.addTo(email);
    mail.addPersonalization(personalization);

    //var content = new helper.Content('text/html', '<html><body>some text here</body></html>')
    var content = new helper.Content('text/html', finalValue)
    mail.addContent(content);

    var attachment = new helper.Attachment();
    //var file = fs.readFileSync(__dirname + '/piajain.pdf');
    var file = fs.readFileSync(__dirname + '/' + stringfilename);
    var base64File = new Buffer(file).toString('base64');
    attachment.setContent(base64File);
    attachment.setType('piajain.pdf');
    attachment.setFilename(stringfilename);
    attachment.setDisposition('attachment');
    mail.addAttachment(attachment);

    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sg.API(request, function (err, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    });

}
//End-AzureSendGridEmailService


function sendEmail(stringfilename, finalValue, companynameemail) {
  //var finalValue = "<table style=\"border:1px solid black; text-align:left\"> <thead> <tr><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Company</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black;color:WHITE;\">Address</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Project</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">RegDate</th></tr></thead>" +
  //        "<tbody>" + " " + final + " " +  "</tbody> </table>";
console.log(__dirname + '/' + stringfilename );
  var mailOptions = {
    from: 'ngpblockchain@gmail.com',
    to: 'sripal.jain@gmail.com',
      subject: 'Email from EthereumBlockchain, Registration done for: ' + companynameemail,
    html: finalValue,
    attachments: [
      {
        filename: stringfilename,
        //filePath: '/Users/sripaljain/Desktop/New Folder With Items/AzureDeployment/'.concat(stringfilename)
        //path: '/Users/sripaljain/Desktop/New Folder With Items/AzureDeployment/' + stringfilename
         path: __dirname + '/' + stringfilename //it works via registerCompany function but fails standlone call function
        //path: '/Users/sripaljain/Desktop/BlockchainTruffle/AzureDeployment/' + stringfilename
         //path: stringfilename
      }
    ]
    // html: '<p>Dear User, </p><p> The following company has registered their interest: </p><p><strong>    Name:</strong> '+ comName+' </p> <p><strong>    Address:</strong> '+comAddress+'</p> <p><strong>    Project: </strong>'+ comProject
    // + '<p><strong>    Date Of Registration:</strong> ' + comRegDate +' </p></p><br><p>Regards,</p><p>Auto Mailer</p>'
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    transporter.close();
  });
}

RegisterJSON = require(path.join(__dirname, 'build/contracts/AzureRegister.json'));
// Setup RPC connection
// var provider = new Web3.providers.HttpProvider("http://localhost:8545");
var provider = new Web3.providers.HttpProvider('http://imdabc2ra4ou.southeastasia.cloudapp.azure.com:8545/')
// Read JSON and attach RPC connection (Provider)
var Register = contract(RegisterJSON);
Register.setProvider(provider);

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function registerCompany (information) {
  var meta;
  var rightNow = new Date();
  var comRegDate = rightNow.toLocaleDateString("en-au", { year: "numeric", month: "long", day: "numeric" }).replace(/\s/g, '-');
  var watermarkOptions = {
    args: [information[0], information[1], information[2], comRegDate]
  };

  Register.deployed().then(function(instance) {
    meta = instance;
    console.log("Pending......")
    return meta.register(information[0], information[1], information[2], comRegDate,
         { gas: 4700000, from: '0x7e10d72c7cb1b1e4c42565e8495b2f31a6dd2a68' })
  }).then(function(result) {
    //console.log("ResultsOfTheSetNameTransaction", result.receipt);
    console.log("BlockNumber#:", result.receipt.blockNumber);
    //console.log("BlockHash#: ", result.receipt.blockHash);
    //console.log("TransactionHash#:", result.tx);
    console.log("TransactedSuccesfully");
    var watermarkOptions = {
      args: ["BlockNumber: " + result.receipt.blockNumber, "TransactionHash#: " + result.tx, "BlockHash#: " + result.receipt.blockHash, comRegDate ,information[0]]
    };
    //sinchSms.sendMessage("+6581397860", "NGPEthereumBlockChainRegApp:: " + " AccFrom:: " + result.receipt.from  + " BlockNumber: " + result.receipt.blockNumber + " TransactionHash#: " + result.tx + " " + "BlockHash#: " + result.receipt.blockHash + " RegstrDate::" + comRegDate + " CompanyName:: "+ information[0] + " GasUsed:: " + result.receipt.gasUsed);
    PythonShell.run('wm.py', watermarkOptions, function (err) {
      if (err) throw err;
      console.log('finished');
      var lowerCaseCompanyName = information[0].toLowerCase();
      //sendEmail(lowerCaseCompanyName+ ".pdf", "helloworld")
      //getCompanies(information[0]+".pdf")
      getCompanies(lowerCaseCompanyName + ".pdf", information[0])

    });
    // blobSvc.getBlobToStream('outbound', 'bitcoin.pdf', fs.createWriteStream('output.pdf'), function(error, result, response){
    //   if(!error){
    //     PythonShell.run('wm.py', watermarkOptions , function (err) {
    //         if (err) throw err;
    //         console.log('finished');
    //         var lowerCaseCompanyName = information[0].toLowerCase();
    //         //sendEmail(lowerCaseCompanyName+ ".pdf", "helloworld")
    //         //getCompanies(information[0]+".pdf")
    //         getCompanies(lowerCaseCompanyName+".pdf")

    //     });
    //   }
    //   else {
    //       console.log('error: ', error)
    //   }
    // });
      SendDataIntoMongoDBLocal(information[0], information[1], information[2], result.tx, result.receipt.blockNumber, result.receipt.blockHash, comRegDate ,result.receipt.gasUsed )
  }).catch(function(err) {
    // There was an error! Handle it.
  });
  }
//Use Truffle as usual
Register.at('0xb38fbc5abe8f43a476dde1d54f0d17866a742ede').then(function (instance) {
    return instance.getName.call()

}).then(function (result) {
    console.log("GetNameCalled",result);

}, function (error) {
    console.log(error);
});


function getCompanies(stringfilename, companynameemail) {
  // console.log("Ent")
  // console.log(__dirname);
  // var filepath = __dirname + '/' +  "PIAJAIN555.pdf";
  // console.log(filepath);
  // if (fs.existsSync(filepath)) {
  //   console.log("FileExist");
  // }
  // else {
  //   console.log("DonotExist")
  // }
  Register.deployed().then(function(contractInstance) {
    contractInstance.getCompany({gas: 140000, from: '0x7e10d72c7cb1b1e4c42565e8495b2f31a6dd2a68'}).then(function(comArray){
      var cName =  comArray[0];
      var cAddress = comArray[1];
      var cProject = comArray[2];
      var cRegDate = comArray[3]
      //console.log("Query " + hex2a(cRegDate));
      //console.log("Registration Date is added as per requirement during registration");
      var lenthofArray = cName.length;
      var final = '';
		// console.log(cName +"       " +cAddress+"      " + cProject + "        " + hex2a(cRegDate));
      for(var i =0; i < lenthofArray; i++ ) {
        var markup = "<tr><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black; font-size:15px; \">" + hex2a(cName[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cAddress[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cProject[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cRegDate[i]) + "</td></tr>";
        //final = + "\"" + markup + "\"";
        final += markup;
        //console.log(markup);
        //console.log(hex2a(cName[i]), hex2a(cAddress[i]), hex2a(cProject[i]), hex2a(cRegDate[i]));
        //$("table tbody").append(markup);
        //var x = web3.toAscii(cRegDate[i]);
        //var y = hex2a(x);
        //console.log("Hellow" + x);
      }
      var finalValue = "<table style=\"border:1px solid black; text-align:left\"> <thead> <tr><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Company</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black;color:WHITE;\">Address</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Project</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">RegDate</th></tr></thead>" +
        "<tbody>" + " " + final + " " +  "</tbody> </table>";
        sendEmail(stringfilename, finalValue, companynameemail)
        //SendGridEmail(stringfilename, finalValue, companynameemail);
        
           //console.log(final)
    })
  });
}

notifier(imap).on('mail', function (mail) {
  if(mail.from[0].address === "sripal.jain@gmail.com" && mail.subject === "Blockchain") {
    var mainText = mail.text.split('\n').slice(0, 3).map(info => info.substring(info.indexOf(':') + 1))
    registerCompany(mainText);
  }
  console.log('Not blockchain email')
}).start();

function sendEmails(filename) {
  var mailOptions = {
    // from: 'ngpblockchain@gmail.com',
    from: 'noreply@ngpblockchain.com',
    to: 'sripal.jain@gmail.com',
    subject: 'Sending Email',
    attachments: [
      {
        filename: 'piajain.pdf',
        //path: __dirname + '/piajain.pdf' //works
        path: __dirname + '/' + filename //it works
      }
    ]
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    transporter.close();
  });

}
//sendEmails()
//var fullpath = (__dirname, "/PIAJAIN555.pdf")
//getCompanies(fullpath, "HHEHHEHHEHHE");
//sendEmail('NIVUTHYABC.pdf', 'helloworld')
//isFileExists("NIVUTHYABC.pdf")
//sendEmails('piajain.pdf'); //finding-pdfFileNameHasToBeInLowerCase, thenit will work
app.listen(port, function () {
    console.log('Our app is running on: ' ,port);
});



























































//
// function isFileExists(stringfilename){
//   var filepath = (__dirname + '/' + stringfilename ) // this works under SendEmail function
//   var filepath2 = __dirname + "/PIAJAIN555.pdf"; // this works in isFileExists function
//   console.log(__dirname + '/' + stringfilename )
//   //console.log(__dirname, "/PIAJAIN555.pdf")
//   //if(fs.existsSync(__dirname, "/PIAJAIN555.pdf")) {
//   if(fs.existsSync(filepath2)) {
//     // if(fs.existsSync(__dirname, "/PIAJAIN555.pdf")) {
//     console.log("Exists File");
//   }
//   else {
//     console.log("FileDonotExists");
//   }
// }


// function sendEmail(stringfilename, finalValue) {
//   //var finalValue = "<table style=\"border:1px solid black; text-align:left\"> <thead> <tr><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Company</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black;color:WHITE;\">Address</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Project</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">RegDate</th></tr></thead>" +
//   //        "<tbody>" + " " + final + " " +  "</tbody> </table>";
//   var mailOptions = {
//     from: 'ngpblockchain@gmail.com',
//     to: 'sripal.jain@gmail.com',
//     subject: 'Sending Email',
//     html: finalValue,
//     attachments: [
//       {
//         filename: stringfilename,
//         //filePath: '/Users/sripaljain/Desktop/New Folder With Items/AzureDeployment/'.concat(stringfilename)
//         //path: '/Users/sripaljain/Desktop/New Folder With Items/AzureDeployment/' + stringfilename
//          path: __dirname + '/' + "ALIBABA.pdf"
//          //path: __dirname + '/' + stringfilename
//         //path: stringfilename
//       }
//     ]
//     // html: '<p>Dear User, </p><p> The following company has registered their interest: </p><p><strong>    Name:</strong> '+ comName+' </p> <p><strong>    Address:</strong> '+comAddress+'</p> <p><strong>    Project: </strong>'+ comProject
//     // + '<p><strong>    Date Of Registration:</strong> ' + comRegDate +' </p></p><br><p>Regards,</p><p>Auto Mailer</p>'
//   };
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//     transporter.close();
//   });
// }


//
// Register.at('0x8ab770208998118cb49e232401ad31d2b5a582c7').then(function (instance) {
//   console.log(instance);
//     return instance.register('Tomatoes', 'EsculentumLycopersicums', 'TamatarAllesGutes',
//          { gas: 4700000, from: '0x7e10d72c7cb1b1e4c42565e8495b2f31a6dd2a68' })
//
// }).then(function (result) {
//     console.log(result);
//
// }, function (error) {
//     console.log(error);
// });


// function getCompany(stringfilename) {
//   var result = '';
//   try {
//       console.log("Entering");
//       var instance = Register.at('0xb38fbc5abe8f43a476dde1d54f0d17866a742ede');
//       let companies =  instance.getCompany({ gas: 140000, from: '0x7e10d72c7cb1b1e4c42565e8495b2f31a6dd2a68' })
//       var cName = companies[0];
//       var cAddress = companies[1];
//       var cProject = companies[2];
//       var cDate = companies[3];
//       var lenthofArray = cName.length;
//       var final = '';
//       //console.log(lenthofArray);
//       for (var i = 0; i < lenthofArray; i++) {
//         var markup = "<tr><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black; font-size:15px; \">" + hex2a(cName[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cAddress[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cProject[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cDate[i]) + "</td></tr>";
//         final += markup;
//           console.log(hex2a(cName[i]) + ', ' + hex2a(cAddress[i]) + ', ' + hex2a(cProject[i]) + ', ' + hex2a(cDate[i]))
//       }
//       var finalValue = "<table style=\"border:1px solid black; text-align:left\"> <thead> <tr><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Company</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black;color:WHITE;\">Address</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Project</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">RegDate</th></tr></thead>" +
//           "<tbody>" + " " + final + " " +  "</tbody> </table>";
//           sendEmail(stringfilename, finalValue)
//   } catch (err) {
//       console.log('error', err)
//   }
// }

// function getCompanies() {
//   var result = '';
//   try {
//       console.log("Entering");
//       var instance = Register.at('0xb38fbc5abe8f43a476dde1d54f0d17866a742ede');
//       let companies =  instance.getCompany({ gas: 140000, from: '0x7e10d72c7cb1b1e4c42565e8495b2f31a6dd2a68' })
//       var cName = companies[0];
//       var cAddress = companies[1];
//       var cProject = companies[2];
//       var cDate = companies[3];
//       var lenthofArray = cName.length;
//       var final = '';
//       console.log(lenthofArray);
//       for (var i = 0; i < lenthofArray; i++) {
//         var markup = "<tr><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black; font-size:15px; \">" + hex2a(cName[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cAddress[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cProject[i]) + "</td><td bgcolor=\"#F5F5DC\"; style=\"border:0.2px solid black;\">" + hex2a(cDate[i]) + "</td></tr>";
//         final += markup;
//           console.log(hex2a(cName[i]) + ', ' + hex2a(cAddress[i]) + ', ' + hex2a(cProject[i]) + ', ' + hex2a(cDate[i]))
//       }
//       var finalValue = "<table style=\"border:1px solid black; text-align:left\"> <thead> <tr><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Company</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black;color:WHITE;\">Address</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">Project</th><th bgcolor=\"#FF23456\"; style=\"border:1px solid black; color:WHITE;\">RegDate</th></tr></thead>" +
//           "<tbody>" + " " + final + " " +  "</tbody> </table>";
//           //sendEmail(stringfilename, finalValue)
//   } catch (err) {
//       console.log('error', err)
//   }
// }




// Register.at('0xb38fbc5abe8f43a476dde1d54f0d17866a742ede').then(function (instance) {
//   //console.log(instance);
//     return instance.setName('MerryChristmasRobertLixin',
//          { gas: 4700000, from: '0x7e10d72c7cb1b1e4c42565e8495b2f31a6dd2a68' })
//
// }).then(function (result) {
//     console.log("SetNameCalled",result);
//
// }, function (error) {
//     console.log(error);
// });
