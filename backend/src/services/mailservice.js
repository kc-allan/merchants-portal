import config from "../Config/index"
import Mailgun from "mailgun.js"
const { MAILGUN_API_SECRET, MAILGUN_DOMAIN } = config

const mailgun = Mailgun({
    apiKey: MAILGUN_API_SECRET,
    domain: MAILGUN_DOMAIN,
})
const sendEmail = async (to, subject, text) => {
    const data = {
        from: MAILGUN_DOMAIN,
        to,
        subject,
        text,
    };

    try {
        await mailgun.messages().send(data);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


export default sendEmail;