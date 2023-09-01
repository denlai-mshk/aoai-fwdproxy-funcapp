require('dotenv').config();  
const https = require('https');
const newhostname = process.env.AOAI_HOSTNAME;
const apiKey = process.env.AOAI_OUTAPIKEY;
const inapiKey = process.env.AOAI_INAPIKEY;

  
module.exports = async function (context, req) {  
  return new Promise((resolve, reject) => {      
    try{
      const modelname = context.bindingData.modelname;
      const openai = context.bindingData.openai;
      const deployments = context.bindingData.deployments;
      const apiversion = (req.query['api-version']);
      var apiname = context.bindingData.apiname;
      
    context.log('post message');  
    if (req.headers['api-key'] != inapiKey){
        throw new Error('Invalid apikey');
    }
    //this URI path is rewrite by AppGW
    if (apiname === 'extensionschatcompletions'){//https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#completions-extensions
        apiname = 'extensions/chat/completions';
    }else if (apiname === 'chatcompletions'){ //GPT3.5_4 URI has one additional /chat/ for dialog bases
        apiname = 'chat/completions';
    }
    const newPath =  '/' + openai + '/' + deployments + '/' + modelname + '/' + apiname + '?' + 'api-version=' + apiversion;
    const postData = JSON.stringify(req.body);
    const options = {  
        hostname: newhostname,  
        port: 443,  
        path: newPath,  
        method: 'POST',  
    
        headers: {  
            'Content-Type': 'application/json',  
            'Content-Length': Buffer.byteLength(postData),          
            'api-key': apiKey
        },  

        rejectUnauthorized: false // to allow self-signed certificate  
    };  
        
    const req2 = https.request(options, (res2) => {  
        let data = '';  
        res2.on('data', (chunk) => {  
            data += chunk;  
        });  
        res2.on('end', () => {  
            const response = {  
                body: data,  
                headers: res2.headers,
                status: res2.statusCode 
            };  
            context.res = response;  
            resolve();  
        });  
    }); 
    req2.on('error', (error) => {  
        context.log(error);  
        let errorCode = 500;
        let errorMsg = "exception";
        if (error.statusCode)
            errorCode = parseInt(error.statusCode);
        
            if (error.message)
            errorMsg = error.message;
            else if (error.errorMsg)
            errorMsg = error.errorMsg;
            else if (error.errormsg)
            errorMsg = error.errorMerrormsgsg

        context.res = {  
            headers: error.headers,
            status: errorCode,
            body: errorMsg  
        };  
        resolve();  
    });  

    req2.write(postData);
    req2.end(); 

        
    }catch(err){
      console.log(err);
      const errormsg = "Handled Exception in FunctionApp |" + err;
      context.res = {  
        status: 409,
        body: errormsg
      };  
      resolve();
    } 
  });
};  
