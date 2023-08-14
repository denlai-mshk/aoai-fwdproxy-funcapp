require('dotenv').config();  
  
const handlePostMessage = require('./handlePostMessage');
const handleFuncAppHealthCheck = require('./handleFuncAppHealthCheck');
const handleAOAIHealthCheck = require('./handleAOAIHealthCheck');


module.exports = async function (context, req) {
  const modelname = context.bindingData.modelname;
  const apiname = context.bindingData.apiname;
  
  if (req.method === 'POST') {
    context.log('post message');  
    await handlePostMessage(context, req); 
  }else if (req.method === 'GET' && modelname === 'health' && apiname === 'check'){
    context.log('funcapp healthcheck');  
    await handleFuncAppHealthCheck(context, req); 
  }else if (req.method === 'GET' && apiname === 'aoaihealthcheck'){        
    context.log('aoai healthcheck');  
    await handleAOAIHealthCheck(context, req); 

  } else {
    context.log('else....');  
    context.res = { status: 404 ,body: 'Resource Not Found'  }; 
  }
};