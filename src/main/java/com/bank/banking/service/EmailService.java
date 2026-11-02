package com.bank.banking.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Common Email Method
    public void sendEmail(String to, String subject, String body) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    // 1. Password Reset OTP Email
    public void sendOtpEmail(String toEmail, String otp) {

        String body =
                "Dear Customer,\n\n" +
                "Your SecureBank password reset OTP is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "Please do not share this OTP with anyone.\n\n" +
                "Regards,\nSecureBank Team";

        sendEmail(toEmail,
                "SecureBank - Password Reset OTP",
                body);
    }

    // 2. Welcome Email
    public void sendWelcomeEmail(String email, String name) {

        String body =
                "Dear " + name + ",\n\n" +
                "Welcome to SecureBank!\n\n" +
                "Your account has been successfully registered.\n\n" +
                "Thank you for choosing SecureBank.\n\n" +
                "Regards,\nSecureBank Team";

        sendEmail(email,
                "Welcome to SecureBank",
                body);
    }

    // 3. Deposit Confirmation Email
    public void sendDepositEmail(
            String email,
            String name,
            double amount,
            String accountNumber) {

        String body =
                "Dear " + name + ",\n\n" +
                "Your deposit was successful.\n\n" +
                "Account Number: " + accountNumber + "\n" +
                "Deposit Amount: Rs. " + amount + "\n" +
                "Status: SUCCESS\n\n" +
                "Thank you,\nSecureBank Team";

        sendEmail(email,
                "SecureBank - Deposit Confirmation",
                body);
    }

    // 4. Withdrawal Confirmation Email
    public void sendWithdrawalEmail(
            String email,
            String name,
            double amount,
            String accountNumber) {

        String body =
                "Dear " + name + ",\n\n" +
                "Your withdrawal was successful.\n\n" +
                "Account Number: " + accountNumber + "\n" +
                "Withdrawal Amount: Rs. " + amount + "\n" +
                "Status: SUCCESS\n\n" +
                "Thank you,\nSecureBank Team";

        sendEmail(email,
                "SecureBank - Withdrawal Confirmation",
                body);
    }

    // 5. Fund Transfer Confirmation Email
    public void sendTransferEmail(
            String email,
            String name,
            double amount,
            String referenceNumber) {

        String body =
                "Dear " + name + ",\n\n" +
                "Your fund transfer was successful.\n\n" +
                "Transfer Amount: Rs. " + amount + "\n" +
                "Reference Number: " + referenceNumber + "\n" +
                "Status: SUCCESS\n\n" +
                "Thank you,\nSecureBank Team";

        sendEmail(email,
                "SecureBank - Fund Transfer Confirmation",
                body);
    }

    // 6. Account Freeze / Unfreeze Notification
    public void sendAccountStatusEmail(
            String email,
            String name,
            String status) {

        String body =
                "Dear " + name + ",\n\n" +
                "Your SecureBank account status has been updated.\n\n" +
                "Account Status: " + status + "\n\n" +
                "If you have any questions, please contact SecureBank.\n\n" +
                "Regards,\nSecureBank Team";

        sendEmail(email,
                "SecureBank - Account Status Update",
                body);
    }
}