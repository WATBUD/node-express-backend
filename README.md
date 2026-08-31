### Getting Started with Node Server

### Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:(.env.PORT)] to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### List of authors
- 水靈 Louis ([@WATBUD](https://github.com/WATBUD))

### Dating App authentication API

Base URL: `http://localhost:3000`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/verification/request` | Request a 6-digit phone or Email verification code |
| POST | `/api/auth/register` | Verify the code, create the user and return a JWT |
| POST | `/api/auth/login` | Sign in with phone/Email and password |
| GET | `/api/auth/me` | Return the current user (`Authorization: Bearer <token>`) |

Development verification codes are returned as `data.developmentCode` and logged by the server. Production never returns the code; connect an SMS/Email provider in `src/services/verification-service.js` before deployment.

After pulling schema changes, run:

```bash
npm install
npm run prisma:push
npm test
npm start
```
