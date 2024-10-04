import nodemailer from 'nodemailer';

// Create a transporter object using your SMTP provider details
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
});

export const emailService = async (recipientEmail, memberList, eventName) => {
    const emailDetails = await emailContent(memberList, eventName);
    // Email options
    const mailOptions = {
        from: process.env.SENDER_EMAIL, // Sender's email address
        to: recipientEmail, // ["shantitest3@gmail.com"] Recipient's email address
        subject: eventName,
        text: 'This is a test email sent using Node.js and Nodemailer.',
        // You can also include HTML content using the `html` property
        html: emailDetails
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('email service error:', error);
        } else {
            console.info('Email sent: ' + info.response);
        }
    });
}


export const emailContent = (memberList, eventName) => {
    const groupData = memberList;
    // Start building the HTML content
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${eventName}</title>
        <style>
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid black;
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: #f8caca;
            }
            td {
                background-color: #f8e6e6;
            }
            .group-name {
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <h2>${eventName}</h2>
        <table id="group-members-table">
            <thead>
                <tr>
                    <th>Group Name</th>
                    <th>Member Name</th>
                </tr>
            </thead>
            <tbody id="table-body">
            <tr>`;
    // Loop through each group and add table rows
    for (let groupName in groupData) {
        if (groupData.hasOwnProperty(groupName)) {
            // Concatenate member names into a single string
            const memberNames = groupData[groupName].map(memberData => memberData.groupMember?.member?.name).join('<br>'); // Each member on a new line
            html += `
            <tr>
                <td>${groupName}</td>
                <td>${memberNames}</td>
            </tr>`;
        }
    }
    // Close the table and HTML
    html += `
    </tr >
            </tbody >
        </table >
    </body >
    </html > `;
    return html;
};

