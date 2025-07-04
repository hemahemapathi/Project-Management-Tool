import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
})

export const sendTaskAcceptedEmail = async (to, taskName, projectName) => {
  if (!to || !Array.isArray(to) || to.length === 0 || !to.every(email => typeof email === 'string' && email.includes('@'))) {
    console.error('Invalid recipient email:', to)
    return
  }

  try {
    await transporter.sendMail({
      from: '"Project Management Tool" <from@example.com>',
      to: to.join(', '),
      subject: 'Task Accepted',
      html: `<p>Your task "${taskName}" in project "${projectName}" has been accepted.</p>`,
    })
    console.log('Task accepted email sent successfully')
  } catch (error) {
    console.error('Error sending task accepted email:', error)
  }
}

export const sendProjectCreatedEmail = async (to, projectName) => {
  if (!to || !Array.isArray(to) || to.length === 0 || !to.every(email => typeof email === 'string' && email.includes('@'))) {
    console.error('Invalid recipient email:', to)
    return
  }

  try {
    await transporter.sendMail({
      from: '"Project Management Tool" <from@example.com>',
      to: to.join(', '),
      subject: 'New Project Created',
      html: `<p>A new project "${projectName}" has been created.</p>`,
    })
    console.log('Project created email sent successfully')
  } catch (error) {
    console.error('Error sending project created email:', error)
  }
}

export const sendTaskCreatedEmail = async (to, taskName, projectName) => {
  if (!to || !Array.isArray(to) || to.length === 0 || !to.every(email => typeof email === 'string' && email.includes('@'))) {
    console.error('Invalid recipient email:', to)
    return
  }

  try {
    await transporter.sendMail({
      from: '"Project Management Tool" <from@example.com>',
      to: to.join(', '),
      subject: 'New Task Created',
      html: `<p>A new task "${taskName}" has been created in project "${projectName}".</p>`,
    })
    console.log('Task created email sent successfully')
  } catch (error) {
    console.error('Error sending task created email:', error)
  }
}