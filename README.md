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

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Admin Interface

This template includes a powerful Django-like admin interface:

- **Access**: Navigate to [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup)
- **Features**: Dynamic model creation, full CRUD operations, multiple field types, validation, search & filtering
- **Documentation**: See [ADMIN_COMPLETE.md](ADMIN_COMPLETE.md) for detailed usage guide

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
