# Hypergraph Web App

## Secrets

In production secrets are passed in via environment variables, for local development copy `.env.example` to `.env` and fill in all the secrets.

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
fargate certificate request VAULT_DOMAIN --region eu-west-1

# Create the DNS records as requested
# Wait for it's verification
open "https://eu-west-1.console.aws.amazon.com/acm/home?region=eu-west-1#/"

# Create a load balancer
fargate lb create vault --port 443 --certificate VAULT_DOMAIN --region eu-west-1

# Using the AWS UI, add another listener on port 80, which redirects to HTTPS
# See https://github.com/awslabs/fargatecli/issues/104
open "https://eu-west-1.console.aws.amazon.com/ec2/v2/home?region=eu-west-1#LoadBalancers:"

# Using the AWS UI, create a role with name `vault`, based on the template
# Elastic Container Service -> ECSTask
open "https://console.aws.amazon.com/iam/home?region=eu-west-1#/roles"

# Create and deploy the service
fargate service create vault \
  --lb vault \
  --port 80 \
  --rule PATH="*" \
  --task-role vault \
  --region eu-west-1

# Wait for the service to be up by checking
fargate service info vault --region eu-west-1

# Set credentials
fargate service env set vault \
  --env PGHOST=... \
  --env PGPORT=... \
  --env PGUSER=... \
  --env PGPASSWORD=... \
  --env PGDATABASE=... \
  --env MAILGUN_API_KEY=... \
  --env STRIPE_SECRET_KEY=... \
  --env STRIPE_WEBHOOK_SECRET=... \
  --env BRANCA_KEY=... \
  --env VAULT_URL=https://VAULT_DOMAIN \
  --region eu-west-1

# If postgres ssl is required
fargate service env set vault \
  --env PGSSL=true \
  --env PGSSLMODE=require
  --region eu-west-1

# Get the load balancer domain from
fargate lb info vault --region eu-west-1

open http://...amazonaws.com/health
```
