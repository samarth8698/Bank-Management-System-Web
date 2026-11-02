package com.bank.banking.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bank.banking.service.EmailService;

@RestController
@RequestMapping("/api/email")
public class EmailTestController {

    private static final Logger logger =
            LoggerFactory.getLogger(EmailTestController.class);

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTestEmail(
            @RequestParam String to) {

        try {

            emailService.sendEmail(
                    to,
                    "SecureBank - Email Test",
                    "Congratulations!\n\n" +
                    "Your SecureBank email notification system " +
                    "is working successfully.\n\n" +
                    "Regards,\nSecureBank Team"
            );

            return ResponseEntity.ok(
                    Map.of(
                            "status", "SUCCESS",
                            "message", "Test email sent successfully!"
                    )
            );

        } catch (Exception e) {

            logger.error("EMAIL SENDING FAILED:", e);

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "status", "FAILED",
                            "message", "Unable to send test email."
                    )
            );
        }
    }
}