package com.workflow.backend.shared.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String to, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Password Reset Request For FlowSync");

            String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <meta charset="UTF-8">
                    </head>
                    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

                    <table align="center" width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr>
                    <td align="center">

                    <table width="500" cellpadding="0" cellspacing="0"
                           style="background:#ffffff; border-radius:10px; padding:40px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                    <tr>
                    <td align="center">
                        <h2 style="margin:0; color:#2c3e50;">Reset Your Password</h2>
                    </td>
                    </tr>

                    <tr>
                    <td style="padding:20px 0; color:#555; font-size:15px; line-height:1.6;">
                        Hello,<br><br>
                        We received a request to reset your password for your <strong>FlowSync</strong> account.
                        Click the button below to choose a new password.
                    </td>
                    </tr>

                    <tr>
                    <td align="center" style="padding:20px 0;">
                        <a href="%s"
                           style="background-color:#4CAF50;
                                  color:#ffffff;
                                  padding:14px 28px;
                                  text-decoration:none;
                                  border-radius:6px;
                                  font-weight:bold;
                                  font-size:14px;
                                  display:inline-block;">
                           Reset Password
                        </a>
                    </td>
                    </tr>

                    <tr>
                    <td style="color:#777; font-size:13px; line-height:1.6;">
                        This link will expire in <strong>15 minutes</strong> for security reasons.<br><br>
                        If you didn’t request this password reset, you can safely ignore this email.
                    </td>
                    </tr>

                    <tr>
                    <td style="padding-top:30px; border-top:1px solid #eee; font-size:12px; color:#aaa; text-align:center;">
                        © 2026 FlowSync. All rights reserved.
                    </td>
                    </tr>

                    </table>

                    </td>
                    </tr>
                    </table>

                    </body>
                    </html>
                    """
                    .formatted(resetLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendInviteEmail(String to, String orgName, String inviterName, String inviteLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("You've been invited to join " + orgName + " on FlowSync");

            String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
                    <table align="center" width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr><td align="center">
                    <table width="500" cellpadding="0" cellspacing="0"
                           style="background:#ffffff; border-radius:10px; padding:40px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                    <td align="center">
                        <h2 style="margin:0; color:#2c3e50;">You're Invited! 🎉</h2>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding:20px 0; color:#555; font-size:15px; line-height:1.6;">
                        Hello,<br><br>
                        <strong>%s</strong> has invited to join <strong>%s</strong> on <strong>FlowSync</strong>.<br><br>
                        Click the button below to accept your invitation. If you don't have an account yet,
                        you'll be able to create one first.
                    </td>
                    </tr>
                    <tr>
                    <td align="center" style="padding:20px 0;">
                        <a href="%s"
                           style="background-color:#6366f1; color:#ffffff; padding:14px 28px;
                                  text-decoration:none; border-radius:6px; font-weight:bold;
                                  font-size:14px; display:inline-block;">
                           Accept Invitation
                        </a>
                    </td>
                    </tr>
                    <tr>
                    <td style="color:#777; font-size:13px; line-height:1.6;">
                        This invitation will expire in <strong>48 hours</strong>.<br><br>
                        If you weren't expecting this invitation, you can safely ignore this email.
                    </td>
                    </tr>
                    <tr>
                    <td style="padding-top:30px; border-top:1px solid #eee; font-size:12px; color:#aaa; text-align:center;">
                        © 2026 FlowSync. All rights reserved.
                    </td>
                    </tr>
                    </table>
                    </td></tr>
                    </table>
                    </body>
                    </html>
                    """
                    .formatted(inviterName, orgName, inviteLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send invite email", e);
        }
    }

    public void sendInviteResponseEmail(String to, String inviterName,
            String inviteeName, String orgName, boolean accepted) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);

            String status = accepted ? "accepted" : "declined";
            String emoji = accepted ? "🎉" : "😔";
            String color = accepted ? "#10b981" : "#ef4444";
            String bodyText = accepted
                    ? inviteeName + " has joined <strong>" + orgName + "</strong> on FlowSync."
                    : inviteeName + " has declined the invitation to join <strong>" + orgName + "</strong>.";

            helper.setSubject(inviteeName + " has " + status + " your invitation " + emoji);

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
                    <table align="center" width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr><td align="center">
                    <table width="500" cellpadding="0" cellspacing="0"
                           style="background:#fff;border-radius:10px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                    <td align="center">
                        <h2 style="margin:0;color:#2c3e50;">Invitation %s %s</h2>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding:20px 0;color:#555;font-size:15px;line-height:1.6;">
                        Hi %s,<br><br>%s
                    </td>
                    </tr>
                    <tr>
                    <td align="center" style="padding:10px 0;">
                        <span style="display:inline-block;padding:10px 24px;border-radius:6px;
                                     background:%s;color:white;font-weight:bold;font-size:14px;">
                            %s
                        </span>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding-top:30px;border-top:1px solid #eee;font-size:12px;color:#aaa;text-align:center;">
                        © 2026 FlowSync. All rights reserved.
                    </td>
                    </tr>
                    </table>
                    </td></tr>
                    </table>
                    </body>
                    </html>
                    """
                    .formatted(status, emoji, inviterName, bodyText, color,
                            accepted ? "Welcome to the team!" : "Invitation Declined");

            helper.setText(html, true);
            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send response email", e);
        }
    }
}
