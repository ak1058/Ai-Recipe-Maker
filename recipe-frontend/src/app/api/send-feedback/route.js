import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { userData, rating, message } = await request.json();

    // Create a transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.NEXT_PUBLIC_MAIL_USER}`,
        pass: `${process.env.NEXT_PUBLIC_MAIL_PASS}`, 
      },
    });

    // Email content
    const mailOptions = {
      from: `"RecipeApp Feedback" <${process.env.NEXT_PUBLIC_MAIL_USER}>`,
      to: process.env.NEXT_PUBLIC_FEEDBACK_RECEIVER,
      subject: `New Feedback from ${userData.name}`,
      text: `
        User ID: ${userData.id}
        Name: ${userData.name}
        Email: ${userData.email}
        Rating: ${rating}/5
        Message: ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Feedback Received</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p><strong>User ID:</strong> ${userData.id}</p>
            <p><strong>Name:</strong> ${userData.name}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Rating:</strong> ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #eee;">
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="margin-top: 15px; color: #666; font-size: 0.9em;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}