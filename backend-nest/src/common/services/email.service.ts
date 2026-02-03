import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost =
      this.configService.get<string>('SMTP_HOST') || 'smtp.hostinger.com';
    const smtpPort =
      parseInt(this.configService.get<string>('SMTP_PORT') || '465', 10) || 465;
    const smtpUser =
      this.configService.get<string>('SMTP_USER') || 'ceo@bthwani.com';
    const smtpPassword =
      this.configService.get<string>('SMTP_PASSWORD') || 'Ju[UVV>WCrNY4dJ';
    const connectionTimeout =
      parseInt(
        this.configService.get<string>('SMTP_CONNECTION_TIMEOUT_MS') || '15000',
        10,
      ) || 15000;
    const socketTimeout =
      parseInt(
        this.configService.get<string>('SMTP_SOCKET_TIMEOUT_MS') || '20000',
        10,
      ) || 20000;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      this.logger.warn(
        'SMTP configuration is missing. Email service will not work. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env file',
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        connectionTimeout,
        socketTimeout,
        greetingTimeout: 10000,
      });

      this.logger.log('Email service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email service', error);
    }
  }

  /**
   * إرسال رمز OTP عبر البريد الإلكتروني
   */
  async sendOtpEmail(
    email: string,
    code: string,
    fullName?: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.error(
        'Email transporter is not initialized. Cannot send OTP email.',
      );
      throw new Error('Email service is not configured');
    }

    const emailFrom = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@bthwani.com',
    );
    const name = fullName || 'مستخدم';

    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رمز التحقق</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      color: #D84315;
      margin-bottom: 30px;
    }
    .code {
      background-color: #f8f9fa;
      border: 2px dashed #D84315;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      color: #D84315;
      letter-spacing: 5px;
      margin: 30px 0;
      font-family: 'Courier New', monospace;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .warning {
      background-color: #fff3cd;
      border-right: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>مرحباً ${name}</h1>
    </div>
    
    <p>شكراً لك على التسجيل في بثواني. يرجى استخدام رمز التحقق التالي لإكمال عملية التسجيل:</p>
    
    <div class="code">${code}</div>
    
    <div class="warning">
      <strong>تنبيه:</strong> هذا الرمز صالح لمدة 15 دقيقة فقط. لا تشارك هذا الرمز مع أي شخص.
    </div>
    
    <p>إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} بثواني. جميع الحقوق محفوظة.</p>
      <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
مرحباً ${name}

شكراً لك على التسجيل في بثواني.

رمز التحقق الخاص بك هو: ${code}

هذا الرمز صالح لمدة 15 دقيقة فقط.

إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.

© ${new Date().getFullYear()} بثواني. جميع الحقوق محفوظة.
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"بثواني" <${emailFrom}>`,
        to: email,
        subject: 'رمز التحقق - بثواني',
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(
        `OTP email sent successfully to ${email}. MessageId: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * التحقق من صحة إعدادات البريد الإلكتروني
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email service connection verification failed', error);
      return false;
    }
  }
}
