# Hypergraph Vault

We are building the Hypergraph Vault as a service to persistently host content. For a small fee, users can publish their modules to the Vault. Given that [~85% of researchers use Google Scholar to discover relevant work](https://doi.org/10.1108/JD-03-2018-0047), we are aiming to get all Vault content [indexed to Google Scholar](https://scholar.google.com/intl/en/scholar/inclusion.html#overview).

For more documentation and requirements, check out the Wiki.

## Deployment

These steps are required set up for any deployment work:

1. Ensure AWS is configured locally using `aws configure`
1. Install [`fargate(1)`](https://github.com/awslabs/fargatecli) by downloading its latest release and moving the binary to a directory in your `$PATH`, like `/usr/local/bin`.

Now to deploy a new version of the service, simply run:

```bash
npm run deploy
```

### Bootstrap

These are the steps to bootstrap a new deployment:

```bash
# Create a load balancer
fargate lb create vault --port 80 --region eu-central-1

# Create and deploy the service
fargate service create vault --lb vault --port 80 --rule PATH=* --region eu-central-1

# Wait for the service to be up by checking
fargate service info vault --region eu-central-1

# Get the load balancer domain from
fargate lb info vault --region eu-central-1

open http://...amazonaws.com/health
```
