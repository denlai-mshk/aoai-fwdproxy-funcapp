require('dotenv').config();  
const https = require('https');
const newhostname = process.env.AOAI_HOSTNAME;
const apiKey = process.env.AOAI_OUTAPIKEY;

  
module.exports = async function (context, req) {  
  return new Promise((resolve, reject) => {      
    try{
      const modelname = context.bindingData.modelname;
      const openai = context.bindingData.openai;
      const deployments = context.bindingData.deployments;
      const apiversion = (req.query['api-version']);

      context.log('aoai_healthcheck');  
      const newPath =  '/' + openai + '/' + deployments + '/' + modelname + '/chat/completions?api-version=' + apiversion;        
      const healthcheckbody = {
        user: 'healthcheck',
        model: modelname,
        messages: [
          {
            role: 'user',
            content: 'hi, I am healthcheck'
          }
        ],
        temperature: 0.5,
        top_p: 0.5,
        max_tokens: 300,
    
      };
      const postData = JSON.stringify(healthcheckbody);
      context.log('newPath = ' + newPath);
      context.log('postData = ' + postData);
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
              body: error.message  
          };  
          resolve();  
      });  

      req2.write(postData);  
      req2.end();         

        
    }catch(err){
      console.log(err);
      const errormsg = "Handled Exception in AOAI Healthcheck |" + err;
      context.res = {  
        status: 406,
        body: errormsg
      };  
      resolve();
    } 
  });
};  
