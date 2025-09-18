Contact endpoint and email setup

1. Purpose

This project exposes a new POST endpoint at `/api/contact` that accepts JSON with the fields:

- `name`
- `email` (required)
- `phone`
- `subject`
- `message` (required)

The endpoint sends an email to the site owner (configured with `EMAIL_USER`) and a confirmation email back to the user.

2. Required environment variables (set these on Render or in `.env` locally)

- `EMAIL_USER` - the site owner's email (also used as the SMTP user)
- `EMAIL_PASS` - SMTP password / app password for Gmail
- Optional: `EMAIL_FROM` - override the From address

3. Notes for Gmail

- If using Gmail, create an App Password and set `EMAIL_PASS` to that value.
- In the repo the user previously mentioned: `EMAIL_USER=tirtho.kyptronix@gmail.com` and `EMAIL_PASS="kozi ozmn wtzn cuyg"`. Store these values in Render's environment variables screen; do NOT commit them to source control.

4. Render deployment

- In Render dashboard set the environment variables above and deploy. The server already initializes the email transporter from `process.env.EMAIL_USER` and `process.env.EMAIL_PASS`.

5. Security

- Never commit passwords to git. Use Render's dashboard or secrets feature.
