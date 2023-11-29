
# Boost up Token per minute for your AOAI Resources

- Please take reference to this API management approach for well-architecture principle
[Azure OpenAI Service Load Balancing with Azure API Management](https://learn.microsoft.com/en-us/samples/azure-samples/azure-openai-apim-load-balancing/azure-openai-service-load-balancing-with-azure-api-management/)
![flow](https://learn.microsoft.com/en-us/samples/azure-samples/azure-openai-apim-load-balancing/azure-openai-service-load-balancing-with-azure-api-management/media/flow.png)

- This sample policy source code demonstrate how to load balancing your backend with round robin manners
[APIM policy for load balancing](https://github.com/azure-samples/azure-openai-apim-load-balancing/blob/main/infra/policies/round-robin-policy.xml)

You can take reference of this obsoleted Function App approach for learning how AppGW rewrite rule works. 
[Obsoleted Function App approach](https://github.com/denlai-mshk/aoai-fwdproxy-funcapp/blob/main/README2023June.md)

*Function App doesn't support data streaming as limitied by its serverless nature.*
