package main.java;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import main.java.Notification;
import org.eclipse.microprofile.reactive.messaging.Incoming;

import io.smallrye.reactive.messaging.annotations.Blocking;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.jboss.logging.Logger;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;

import io.smallrye.common.annotation.Blocking;

@ApplicationScoped
public class NotificationProcessor {

    private static final Logger LOGGER = Logger.getLogger(NotificationProcessor.class);

    @Inject
    ObjectMapper objectMapper; // Injecting the Jackson ObjectMapper

    @Inject Mailer mailer;

    @Incoming("notifications")
    @Blocking
    public void process(String notificationRequest) {
        try {
            Notification notification = objectMapper.readValue(notificationRequest, Notification.class);

            LOGGER.info("Processed notification: " + notification);
        } catch (Exception e) {
            LOGGER.error("Error processing notification", e);
        }
    }

    private void sendEmail(Notification notification) {
        String email = notification.getEmail();
    }
    
}
