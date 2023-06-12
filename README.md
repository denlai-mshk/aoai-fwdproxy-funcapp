
# Boost up 4x Request per minute for your AOAI Resources
![concept1](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/concept1.png)

## Fully utilize AOAI quotas and limits
As at 12 June 2023, **one subscription** can provision **30 AOAI resources per region**, sharing the same TPM and RPM limits. For example, you can allocate 3 deployment instances of GPT-35-Turbo with 80K TPM/480 RPM each to utilize the whole TPM/RPM limits for one region.

![limit](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/limit.png)
![limit](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/newlimit.png)

Currently, there are four regional Cognitive services that support Azure OpenAI -*EastUS, South Cental US, West Europe and France Central* which allows for a **maximium 120 instances** of the same AOAI model can be provisoned across these four regions. This means you can achieve up to *(1440x4/60)* = **maximium 96 request per second** for your ChatGPT model. If this is still not enough to meet your production workload requirements, you can consider getting additional subscriptions to create an AOAI resources RAID.

## Why not just raise your quotas and limits?
You can apply for quota increase requests by filling out forms, but this may not be the most practical solution as it won't give you access to the additional resources right away. What if your AOAI service demand continues to grow? Utilizing your existing quotas is the more practical solution. Remember, you have a maximum of 120 model instances across 4 regions with 4 times quotas and limits for 1 subscription. If you don't have concerns about cross-region networking cost, spanning across regions is the fastest way to get your production rollout up and running.

## Load balancing multiple AOAI Resources 
![concept3](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/concept3.png)

The common practice is to use Azure Application Gateway (AppGW) to perform a round-robin traffic distribution, alongside Azure DDoS service to protect your cloud telemetry. However, the rewrite rule capability of AppGW cannot rewrite the API key immediately after an AOAI resource is designated as a backend target. Therefore, a forward proxy server for each particular AOAI endpoint needs to be added to change the corresponding API key. As a result, you will need to provision three Function Apps per region to serve as the forward proxy servers. Don’t worry, these Function Apps can share the same App Service Plan. 



## Transforming your API with actual AOAI endpoints
![concept2](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/concept2.png)

From this diagram, it is clear that all Apps will direct their API calls to a single AppGW endpoint (either via public IP or domain name). This endpoint will have a shorter URI path and an internal API key, granted by your AOAI admin, for user authentication. Access control of which authenticated parties can access the Function Apps can be dynamically controlled by this internal API key. Once AppGW has distributed the incoming API requests to the different Function Apps, it will convert the API requests to the actual AOAI API requests, with the actual AOAI domain name, longer URI path, and actual API key in the AUTH header section. 
- **shorter URI path** API caller only need to provides model-name,model-api, apiversion.
- **Internal apiKey** which is granted by AOAI admin, this apiKey is used for authentication within the AOAI service provided by you. You can dynamic control which authenticated parties can access the Function Apps by this internal apiKey.

## Functional Roles of Azure Components
- **Application Gateway**
  - Public CA certificate hosting
  - TLS termination
  - Load balancing
  - WAF and public IP restriction

- **Function App**
  - Forwarding proxy
  - Change Hostname
  - Rewrite URI path
  - Authenticate internal apiKey
  - Rewrite actual AOAI apiKey
  - User Access Control
  - Responsible AI Orchestration
  - Health Check endpoint for AppGW

- **App Service Plan**
  - only need one per region to support multiple Function Apps

## Responsible AI (RAI) Orchestration in your tenant
![rai](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/rai.png)

While most of enterprise customers likely opt-out of the Microsoft RAI mitigation approach ([Content Filtering and Abuse Monitoring](https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy?context=%2Fazure%2Fcognitive-services%2Fopenai%2Fcontext%2Fcontext#how-can-a-customer-verify-if-logging-for-abuse-monitoring-is-off)). 
To comply with the [Azure OpenAI Code of Conduct and Terms of Use](https://learn.microsoft.com/en-us/legal/cognitive-services/openai/code-of-conduct), the customer must build their own RAI infrastructure. Leveraging the above architecture pattern can give you greater control and governance over your Function Apps. For instance, 
1. Incoming API request bodies without a 'User' or unregistered username can be rejected. 

![user](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/user.png)

2. User prompts can be sent to Azure AI Content Safety for offensive content detection and filtering before reaching the AOAI resources. 
3. The username and corresponding content can be logged in CosmosDB if the prompt is non-compliant.


## Function App Configuration
1. [Create your first function in the Azure portal](https://learn.microsoft.com/en-us/azure/azure-functions/functions-create-function-app-portal)

![createfuncapp](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/createfuncapp.png)

2. After Function App is created, Left blade > Configuration > Add Applilcation Settings > **Save**
```javascript    
    AOAI_HOSTNAME = {your AOAI resource domain}.openai.azure.com
    AOAI_INAPIKEY = {your internal apiKey for authenticated user}
    AOAI_OUTAPIKEY = {actual AOAI apikey}
```
![appconfig](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/appconfig.png)

3. Left blade > Health check > add path > **Save**
```javascript  
/api/FwdProxy/openai/deployments/health/check
```
![funchealth](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/funchealth.png)

## Function App Forward Proxy Implementation
1. Please clone this repo into your local folder
```javascript  
git clone https://github.com/denlai-mshk/aoai-fwdproxy-funcapp.git
```
2. Open Visual Studio Code with this local folder
3. Install - extension: Azure Function, Azure Account
4. Left blade , click Azure icon > Workspace > mouse over the deploy icon

![deploy](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/deploy.png)

5. SSO your Microsoft account, select Azure subscription and Function App you just created.

## Application Gateway Configuration
1. [Create AppGW by Portal](https://learn.microsoft.com/en-us/azure/application-gateway/quick-create-portal)
2. [Backend pool and Backend setting](https://learn.microsoft.com/en-us/azure/application-gateway/create-ssl-portal)
3. You have to create 1 Routing rule bind with 1 Listener, 1 Backend pool and 1 Backend setting, the backend setting bind with 1 Health probe
4. Add multiple Function Apps into Backend pool 
5. Add 1 rewrite ruleset (chatcompletion_100/otherapi_101/healthcheck_102) bind with Routing rule
6. AppGW inbound and outbound are 443 port for TLS/SSL

![backendpool](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/backendpool.png)

![backendsetting](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/backendsetting.png)

![rule](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/rule.png)

![healthprobe](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/healthprobe.png)

![Listener](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/listener.png)

![rewrite000](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/rewrite000.png)

![rewrite100](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/rewrite100.png)

![rewrite101](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/rewrite101.png)

![rewrite102](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/rewrite102.png)

- **chatcompletion(100)**
  ```javascript  
  if (server variable = uri_path) 
  equal
  /openai/deployments/(.*)/chat/completions

  and if (server variable = request_query) 
  equal
  api-version=(.*)

  then
  rewrite type = URL
  action type = Set
  Components = Both URL path and URL query string
  URL path value = /api/FwdProxy/openai/deployments/{var_uri_path_1}/chatcompletions
  URL query string value = api-version={var_request_query_1}
  ```
- **otherapi(101)**
  ```javascript  
  if (server variable = uri_path) 
  equal
  /openai/deployments/(.*)

  and if (server variable = request_query) 
  equal
  api-version=(.*)

  then
  rewrite type = URL
  action type = Set
  Components = Both URL path and URL query string
  URL path value = /api/FwdProxy/openai/deployments/{var_uri_path_1}
  URL query string value = api-version={var_request_query_1}
  ```
- **healthcheck(102)**
  ```javascript  
  if (server variable = uri_path) 
  equal
  /openai/deployments/health/check

  and if (server variable = request_query) 
  equal
  api-version=(.*)

  then
  rewrite type = URL
  action type = Set
  Components = URL path
  URL path value = /api/FwdProxy/openai/deployments/health/check
  ```
## How to test with PostMan
Well-known API tester Postman released OpenAI API profile for free. Get that [over here](https://www.postman.com/devrel/workspace/openai/documentation/13183464-90abb798-cb85-43cb-ba3a-ae7941e968da)

![postman](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/postman.png)

In postman, pass your internal apikey in auth header

![postmansend](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/postmansend.png)

## Go for Production To-Do List
![refarch](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/screenshots/refarch.png)

- Consider provisioning the Function App in VNET Injection mode for security. 
- Connect the AppGW and Function App within the same VNET. 
- Add a private endpoint to the AOAI Resources in your VNET.
- Instead of using the AppGW public IP for the endpoint, consider installing a public CA certificate with domain name service.
- Secure the AOAI endpoint and API key in the Azure Key Vault.
- Consider provisioning the CosmosDB for abuse auditing.
- Consider provisioning the [Azure AI Content Safety](https://learn.microsoft.com/en-us/azure/cognitive-services/content-safety/overview) for content filtering and detection.
