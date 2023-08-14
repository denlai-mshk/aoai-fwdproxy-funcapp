  
module.exports = async function (context, req) {  
  return new Promise((resolve, reject) => {      
    try{

        context.log('healthcheck');  
        context.res = {  
          status: 200
        };          
        resolve();
        
    }catch(err){
      console.log(err);
      const errormsg = "Handled Exception in FunctionApp Healthcheck|" + err;
      context.res = {  
        status: 407,
        body: errormsg
      };  
      resolve();
    } 
  });
};  
