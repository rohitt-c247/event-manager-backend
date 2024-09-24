import nodemailer from 'nodemailer';
console.log('process.env.SENDER_EMAIL--', process.env.SENDER_EMAIL);

// Create a transporter object using your SMTP provider details
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
});

export const emailService = (recipientEmail) => {
    // Email options
    const mailOptions = {
        from: process.env.SENDER_EMAIL, // Sender's email address
        to: recipientEmail, // ["shantitest3@gmail.com"] Recipient's email address
        subject: 'Test Email',
        text: 'This is a test email sent using Node.js and Nodemailer.',
        // You can also include HTML content using the `html` property
        html: '<h1>This is a test email</h1><p>This email is sent using Node.js and Nodemailer.</p>'
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('email service error:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}