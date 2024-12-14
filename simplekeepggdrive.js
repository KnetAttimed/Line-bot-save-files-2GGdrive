 /*
  The project : LINE Messaging API Keep file to Google drive
  Describe : Line API Bot: Automatically saves files from chat to individual Google Drive (simple:not related with command text)
  coding by Knet Attimed (Kiattisak Phothawimoncharat)
  used for learning only. please reference me if any.
  https://github.com/KnetAttimed
*/


var channelToken = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Insert Channel Access Token
var gdrivefolderId = "XXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Insert Folder ID Google Drive (NOT urL)

function replyMsg(replyToken, mess, channelToken) {
  var url = 'https://api.line.me/v2/bot/message/reply';
  var opt = {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelToken,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': mess
    })
  };
  UrlFetchApp.fetch(url, opt);
}

function handleFileMessage(messageId, fileName, channelToken) {
  var fileUrl = "https://api-data.line.me/v2/bot/message/" + messageId + "/content";
  var headers = {
    "Authorization": "Bearer " + channelToken
  };
  try {
    var response = UrlFetchApp.fetch(fileUrl, { headers: headers });
    var blob = response.getBlob();
    var fileBlob = Utilities.newBlob(blob.getBytes(), "application/pdf", fileName);
    var gdfileid = DriveApp.getFolderById(gdrivefolderId).createFile(fileBlob).getId();
    return 'https://drive.google.com/file/d/' + gdfileid + '/view';
  } catch (error) {
    Logger.log('Error fetching file: ' + error.message);
    return null;
  }
}

function doPost(e) {
  try {
    var value = JSON.parse(e.postData.contents);
    var events = value.events;
    var event = events[0];
    var type = event.type;
    var replyToken = event.replyToken;
    var message = event.message;

    //pdf type
    if (type === 'message' && message.type === 'file') {
      var fileName = message.fileName;
      var fileType = fileName.split('.').pop().toLowerCase();
      if (fileType === "pdf") {
        var fileUrl = handleFileMessage(message.id, fileName, channelToken);
        if (fileUrl) {
          var mess = [{'type': 'text', 'text': "[" + fileName + "]\n✅ File uploaded successfully.\n" + fileUrl}];
          replyMsg(replyToken, mess, channelToken);
        } else {
          var mess = [{'type': 'text', 'text': "❌ There was a problem saving the PDF file."}];
          replyMsg(replyToken, mess, channelToken);
        }
      } else {
      }
    }
    
    //video/picture/audio media type
    if (type === 'message') {
  var fileName;
  var fileUrl;
  var mess;
  if (message.type === 'video') {
    fileName = "video_" + message.id + ".mp4";
    //return; (return; = Don't keep this type.)
  } else if (message.type === 'image') {
    fileName = "image_" + message.id + ".jpg"; 
    //return; (return; = Don't keep this type.)
  } else if (message.type === 'audio') {
    fileName = "audio_" + message.id + ".m4a"; 
    //return; (return; = Don't keep this type.)
  }
  if (fileName) {
    fileUrl = handleFileMessage(message.id, fileName, channelToken);
    if (fileUrl) {
      mess = [{'type': 'text', 'text': "[" + fileName + "]\n✅ File uploaded successfully.\n" + fileUrl}];
    } else {
      mess = [{'type': 'text', 'text': "❌ There was a problem saving the file."}];
    }
    replyMsg(replyToken, mess, channelToken);
  }
  }

  } //try

  catch (error) {
    Logger.log('Error in doPost: ' + error.message);
  }

} //dopost
