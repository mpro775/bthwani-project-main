import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

export interface SendEmailJobData {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, unknown>;
}

export interface SendBulkEmailsJobData {
  emails: Array<{
    to: string;
    subject: string;
    template: string;
    context?: Record<string, unknown>;
  }>;
}

@Processor('emails')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send-email')
  async sendEmail(job: Job<SendEmailJobData>) {
    this.logger.log(`Sending email to ${job.data.to}`);

    try {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      await this.simulateSendEmail(job.data);

      this.logger.log(`Email sent successfully to ${job.data.to}`);

      return {
        success: true,
        to: job.data.to,
        sentAt: new Date(),
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to send email to ${job.data.to}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  @Process('send-bulk-emails')
  async sendBulkEmails(job: Job<SendBulkEmailsJobData>) {
    this.logger.log(`Processing bulk emails: ${job.data.emails.length} emails`);

    const results = {
      total: job.data.emails.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const emailData of job.data.emails) {
      try {
        await this.simulateSendEmail(emailData);
        results.successful++;
      } catch (error) {
        results.failed++;
        const err = error as Error;
        results.errors.push(`${emailData.to}: ${err.message}`);
      }

      // Rate limiting: 10 emails per second
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.logger.log(
      `Bulk emails completed: ${results.successful}/${results.total} successful`,
    );
    return results;
  }

  @Process('send-order-confirmation')
  async sendOrderConfirmation(
    job: Job<{ email: string; orderDetails: Record<string, unknown> }>,
  ) {
    this.logger.log(`Sending order confirmation to ${job.data.email}`);

    return this.sendEmail({
      ...job,
      data: {
        to: job.data.email,
        subject: 'تأكيد الطلب - Bthwani',
        template: 'order-confirmation',
        context: job.data.orderDetails,
      },
    } as unknown as Job<SendEmailJobData>);
  }

  @Process('send-password-reset')
  async sendPasswordReset(job: Job<{ email: string; resetToken: string }>) {
    this.logger.log(`Sending password reset email to ${job.data.email}`);

    return this.sendEmail({
      ...job,
      data: {
        to: job.data.email,
        subject: 'إعادة تعيين كلمة المرور - Bthwani',
        template: 'password-reset',
        context: {
          resetToken: job.data.resetToken,
          resetLink: `https://app.bthwani.com/reset-password?token=${job.data.resetToken}`,
        },
      },
    } as unknown as Job<SendEmailJobData>);
  }

  @Process('send-welcome-email')
  async sendWelcomeEmail(job: Job<{ email: string; name: string }>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);

    return this.sendEmail({
      ...job,
      data: {
        to: job.data.email,
        subject: 'مرحباً بك في Bthwani',
        template: 'welcome',
        context: {
          name: job.data.name,
        },
      },
    } as unknown as Job<SendEmailJobData>);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing email job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Email job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }

  private async simulateSendEmail(emailData: SendEmailJobData): Promise<void> {
    // Simulate email service delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TODO: Replace with actual email service integration
    // Example with SendGrid:
    // const msg = {
    //   to: emailData.to,
    //   from: 'noreply@bthwani.com',
    //   subject: emailData.subject,
    //   templateId: emailData.template,
    //   dynamicTemplateData: emailData.context,
    // };
    // await sgMail.send(msg);

    this.logger.debug(`[SIMULATED] Email sent to ${emailData.to}`);
  }
}
