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

export const emailService = async (recipientEmail) => {
    const emailDetails = await emailContent();
    // Email options
    const mailOptions = {
        from: process.env.SENDER_EMAIL, // Sender's email address
        to: recipientEmail, // ["shantitest3@gmail.com"] Recipient's email address
        subject: 'Test Email',
        text: 'This is a test email sent using Node.js and Nodemailer.',
        // You can also include HTML content using the `html` property
        html: emailDetails
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

const emailContent = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Group Members Table</title>
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
    <h2>Combined Group Members Table</h2>
    <table id="group-members-table">
        <thead>
            <tr>
                <th>Group Name</th>
                <th>Member Name</th>
            </tr>
        </thead>
        <tbody id="table-body"></tbody>
    </table>

    <script>
        const groupData = {
            "Diwali fest group 1": [
                {
                    "_id": "66f2898a1b28c6298b23bcc5",
                    "memberId": "66e147a0faed56a787db2631",
                    "member": {
                        "name": "zarir",
                        "email": "shanti78908@chapter247.com",
                        "position": "Sr. Software Developer",
                        "department": "Mern stack",
                        "experience": 4,
                        "isLoginAccess": false
                    }
                },
                {
                    "_id": "66f2898a1b28c6298b23bcc3",
                    "memberId": "66dad3eb080947cec72ec374",
                    "member": {
                        "name": "456547",
                        "email": "shanti.c@chapter247.com",
                        "position": "Sr. Mern stack",
                        "department": "Mern stack",
                        "experience": 5,
                        "isLoginAccess": true
                    }
                },
                {
                    "_id": "66f2898a1b28c6298b23bcc4",
                    "memberId": "66dadb9b2a32d491df564641",
                    "member": {
                        "name": "Shanti Chouhan",
                        "email": "shanti78@chapter247.com",
                        "position": "Sr. Software Developer",
                        "department": "Mern stack",
                        "experience": "1",
                        "isLoginAccess": true
                    }
                }
            ],
            "Diwali fest group 2": [
                {
                    "_id": "66f2898a1b28c6298b23bccb",
                    "memberId": "66e2c6e3c14b9e061a91a02c",
                    "member": {
                        "name": "ghhgtjty",
                        "email": "shanti.c@chapter247.com",
                        "position": "Sr. Software Developer",
                        "department": "Mern stack",
                        "experience": 5,
                        "isLoginAccess": true
                    }
                },
                {
                    "_id": "66f2898a1b28c6298b23bccd",
                    "memberId": "66e2d9f68246faba90a1c984",
                    "member": {
                        "name": "ghjhgjh",
                        "email": "shanti.c6@chapter247.com",
                        "position": "Sr. Software Developer",
                        "department": "Mern stack",
                        "experience": 5,
                        "isLoginAccess": true
                    }
                },
                {
                    "_id": "66f2898a1b28c6298b23bccc",
                    "memberId": "66e2c6e6c14b9e061a91a02e",
                    "member": {
                        "name": "htytu",
                        "email": "shanti.c@chapter247.com",
                        "position": "Sr. Software Developer",
                        "department": "Mern stack",
                        "experience": 5,
                        "isLoginAccess": true
                    }
                }
            ]
        };

        function generateGroupMembersTable() {
            const tableBody = document.getElementById('table-body');

            // Loop through each group
            for (let groupName in groupData) {
                if (groupData.hasOwnProperty(groupName)) {
                    groupData[groupName].forEach(memberData => {
                        const row = document.createElement('tr');
                        const member = memberData.member;

                        // Insert group name and member name into table row
                        row.innerHTML =
                            <td class="group-name">"${"groupName"}"</td>
                            <td>"${"member.name"}"</td>
                        ;

                        // Append the row to the table body
                        tableBody.appendChild(row);
                    });
                }
            }
        }

        // Generate the table on page load
        window.onload = generateGroupMembersTable;
    </script>
</body>
</html>

 `
}