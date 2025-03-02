This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## For Reviewer

Welcome to my task manager project. Before starting, I apologize if some things are missing or inconsistent or incomplete according to task.pdf since there were inconsistencies there between frontend and backend feautures.
For example some things on backend like comments are not asked on frontend. Due to that, some things implemented on backend may not be used on frontend but are there according to task.pdf.

Link to [live server](http://64.226.121.96/login/). (Google and Github signin are disabled on live server since I dont have a domain).

Link [pipelines](https://github.com/SagiSan/task-manager-frontend/actions/workflows/ci-cd.yml) to verify that CI-CD exists and works.

For any questions, you can reach me at samir.sagi@gmail.com.

Below are things I would do but ran out of time.

### Automatic email reminder (NodeMailer)

I would use setup scheduler to run a job periodically, checking which tasks are due within next 24h. Retrieve user's email and send email via NodeMailer.
Setting up NodeMailer is straightforward. Creating a simple service with mail host, user and password.

### Graphql alternative

I would configure grapqhl in appModule. Define object types for models. Create Input DTOs for mutations. Update resolvers.

### Websockets for real-time notifications

I implemented this feature but haven't really used it effectively. Currently it just listens for task update and then it logs it. I wanted to implement push notifications.

### Rest

The rest of the missing bonus features like dark/light mode or e2e are nothing special or complicated. I just ran out of time.

Thank you for your time and patience!
