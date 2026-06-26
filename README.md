## AWS Amplify Next.js (App Router) Starter Template

This repository provides a starter template for creating applications using Next.js (App Router) and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with enhanced features
- **Tailwind CSS 4** - Utility-first CSS framework with modern configuration
- **TypeScript** - Type-safe development
- **AWS Amplify Gen 2** - Backend infrastructure and services

## Overview

This template equips you with a foundational Next.js application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.
- **Styling**: Tailwind CSS 4 with simplified configuration using `@import "tailwindcss"`.
- **Admin Interface**: Django-like admin panel with full CRUD operations and dynamic model creation.

## Getting Started

Hendrix follows a Django-like workflow: **iterate on your data model in a
personal dev backend, then deploy to production**. The dev backend is a real
(per-developer, isolated) cloud sandbox, so it has full parity with prod — same
schema, same data client, same auth rules. No "works locally, breaks in prod."

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Deploy a cloud sandbox** (required before `dev`/`build`):

   ```bash
   npx ampx sandbox
   ```

   This provisions your personal Cognito + AppSync + DynamoDB backend and writes
   `amplify_outputs.json` to the project root. The app imports this file to
   configure Amplify, so `npm run dev` and `npm run build` will fail until it
   exists. (`amplify_outputs.json` is git-ignored — it's per-environment.)
   Leave this running in its own terminal to watch for backend changes.

3. **Run the development server** (in a second terminal):

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Local → AWS

- **Develop:** edit models in `amplify/data/resource.ts` (or via the admin's
  Schema Builder for dynamic models). Your sandbox applies changes in seconds.
- **Deploy:** push to `main`. Amplify ships the *same* schema to the production
  backend via CI/CD. Sandbox and prod are separate environments (separate data,
  separate Cognito pools) — by design.

## Admin Interface

This template includes a powerful Django-like admin interface, **gated behind
Cognito authentication**.

- **Access**: Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
- **Auth**: `/admin` requires sign-in **and** membership of the `admins` Cognito
  group (defined in `amplify/auth/resource.ts`). A signed-in user who is not in
  the group gets an "Access denied" screen. Add yourself after signing up once:

  ```bash
  aws cognito-idp admin-add-user-to-group \
    --user-pool-id <userPoolId> \
    --username <your-email> \
    --group-name admins
  ```

  (Find `<userPoolId>` in `amplify_outputs.json` under `auth.user_pool_id`.)
- **Persistence**: models and records are stored in **DynamoDB** (the
  `AdminModel` / `AdminRecord` models in `amplify/data/resource.ts`), scoped per
  signed-in user via owner auth — not in the browser. Visit `/admin/setup` to
  seed example data.
- **AI schema-from-prompt**: in the Schema Builder, describe an app in plain
  English ("a blog with posts and comments") and Claude (via Amazon Bedrock)
  proposes models you review before creating. See [AI setup](#ai-schema-from-prompt-setup).
- **Features**: Dynamic model creation, full CRUD operations, multiple field types, validation, search & filtering
- **Documentation**: See [ADMIN_COMPLETE.md](ADMIN_COMPLETE.md) for detailed usage guide

### AI schema-from-prompt setup

The `generateSchema` mutation (Lambda in `amplify/functions/generate-schema`)
calls Claude via Amazon Bedrock, using the **EU inference profile**
(`eu.anthropic.claude-sonnet-4-5`) for in-region data residency.

**Prerequisite — one-time per AWS account:** enable Anthropic model access in
Bedrock, or the feature returns *"Model use case details have not been
submitted for this account."* In the AWS console → **Bedrock → Model access**
(in your deploy region) request the Claude model and submit the Anthropic
use-case form. Access is usually granted within minutes.

- Change the model via `BEDROCK_MODEL_ID` in
  `amplify/functions/generate-schema/resource.ts` (e.g. Haiku for lower cost).
- Each generation is a paid Bedrock call — see Anthropic-on-Bedrock pricing.

Quick start:

- Visit `/admin/setup` to seed example data
- Or go directly to `/admin` to start fresh
- Create models, add fields, manage records - all through the UI!

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/#deploy-a-fullstack-app-to-aws) of our documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
