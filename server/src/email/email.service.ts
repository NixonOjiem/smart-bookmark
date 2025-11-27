import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false, // true for 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendResetCode(to: string, code: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Reset your SmartMarks Password',
      html: `
        <h3>Password Reset Request</h3>
        <p>Your verification code is:</p>
        <h1 style="color: blue; letter-spacing: 5px;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
      `,
    });
  }
}
