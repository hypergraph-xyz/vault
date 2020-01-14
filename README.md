# Hypergraph Vault

We are building the Hypergraph Vault as a service to persistently host content. For a small fee, users can publish their modules to the Vault. Given that [~85% of researchers use Google Scholar to discover relevant work](https://doi.org/10.1108/JD-03-2018-0047), we are aiming to get all Vault content [indexed to Google Scholar](https://scholar.google.com/intl/en/scholar/inclusion.html#overview).

For more documentation and requirements, check out the Wiki.

## Migrations

Whenever you start the server, it will check for and apply any migrations not
yet run on the connected database. How to change the schema:

1. Create a migration

   ```bash
   $ npm run create-migration name of migration
   Edit migrations/1578995416266_name_of_migration.js
   ```

1. Open the file and fill the variables `up` and `down` with the SQL to run
   (`up`) and roll back (`down`) the migration

1. Start the server to verify the migration runs successfully
1. Commit the migration file

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
# Request a certificate
fargate certificate request vault.hypergraph.xyz --region eu-west-1

# Create the DNS records as requested
# Wait for it's verification
open https://eu-west-1.console.aws.amazon.com/acm/home?region=eu-west-1#/

# Create a load balancer
fargate lb create vault --port 443 --certificate vault.hypergraph.xyz --region eu-west-1

# Using the AWS UI, add another listener on port 80, which redirects to HTTPS
# See https://github.com/awslabs/fargatecli/issues/104
open https://eu-west-1.console.aws.amazon.com/ec2/v2/home?region=eu-west-1#LoadBalancers:

# Create and deploy the service
fargate service create vault --lb vault --port 80 --rule PATH=* --region eu-west-1

# Wait for the service to be up by checking
fargate service info vault --region eu-west-1

# Set credentials
fargate service env set vault \
  --env PGHOST=... \
  --env PGUSER=... \
  --env PGPASSWORD=... \
  --env PGDATABASE=vault \
  --region eu-west-1

# Get the load balancer domain from
fargate lb info vault --region eu-west-1

open http://...amazonaws.com/health
```
