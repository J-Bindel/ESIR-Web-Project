package main.java;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import main.java.Association;
import main.java.Notification;
import main.java.User;

import java.util.Map;

import org.eclipse.microprofile.reactive.messaging.Incoming;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.jboss.logging.Logger;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;

import io.smallrye.common.annotation.Blocking;

@ApplicationScoped
public class NotificationProcessor {

    private static final Logger LOGGER = Logger.getLogger(NotificationProcessor.class);

    @Inject
    ObjectMapper objectMapper; // Injecting the Jackson ObjectMapper

    @Inject Mailer mailer;

    @ConfigProperty(name = "quarkus.mailer.from")
    String fromEmail;

    @Incoming("notifications")
    @io.smallrye.reactive.messaging.annotations.Blocking
    public void process(String notificationRequest) {
        try {
            Notification notification = objectMapper.readValue(notificationRequest, Notification.class);

            sendEmail(notification);

            LOGGER.info("Processed notification: " + notification);
        } catch (Exception e) {
            LOGGER.error("Error processing notification", e);
        }
    }

    private void sendEmail(Notification notification) {
        String emailType = notification.getNotificationType();
        User user = notification.getUser();
        Association association = notification.getAssociation();
        Map<String, Object> modifiedFields = notification.getModifiedFields();

        String subject = "";
        StringBuilder html = new StringBuilder();

        switch (emailType) {
            case "user create":
                subject = "Welcome to French association administration service!";
                html.append("<h1>Welcome ")
                    .append(user.getFirstname()).append(" ").append(user.getLastname())
                    .append("!</h1><p>You have successfully created an account on our service.</p>")
                    .append("<p>We wish you a nice experience with our service.</p>");
                break;
            case "user update":
                subject = "[French association administration service] Your account has been updated";
                html.append("<h1>Hello ")
                    .append(user.getFirstname()).append(" ").append(user.getLastname())
                    .append("!</h1><p>Your account has been updated.</p>");
                if (modifiedFields != null && !modifiedFields.isEmpty()) {
                    html.append("<p>The following fields were modified:</p><ul>");
                    for (Map.Entry<String, Object> entry : modifiedFields.entrySet()) {
                        html.append("<li>")
                            .append(capitalizeFirstLetter(entry.getKey())).append(": ")
                            .append(entry.getValue()).append("</li>");
                    }
                    html.append("</ul>");
                }
                html.append("<p>If you did not perform this operation, please contact us.</p>");
                break;
            case "user delete":
                subject = "[French association administration service] Your account has been deleted";
                html.append("<h1>Goodbye ")
                    .append(user.getFirstname()).append(" ").append(user.getLastname())
                    .append("!</h1><p>Your account has been deleted.</p>")
                    .append("<p>If you did not perform this operation, please contact us.</p>");
                break;
            case "association create":
                subject = "[French association administration service] Welcome to " + association.getName() + "!";
                html.append("<p>Welcome to ").append(association.getName())
                    .append("!</p><p>You have successfully been added to ").append(association.getName())
                    .append(" association.</p>")
                    .append("<p>You will now be able to receive emails each time the association will be updated or when a new event will be created.</p>");
                break;
            case "association update":
                subject = "[French association administration service] " + association.getName() + " has been updated!";
                html.append("<p>").append(association.getName())
                    .append(" has been updated!</p>");
                if (modifiedFields != null && !modifiedFields.isEmpty()) {
                    html.append("<p>The following fields were modified:</p><ul>");
                    for (Map.Entry<String, Object> entry : modifiedFields.entrySet()) {
                        html.append("<li>")
                            .append(capitalizeFirstLetter(entry.getKey())).append(": ")
                            .append(entry.getValue()).append("</li>");
                    }
                    html.append("</ul>");
                }
                html.append("<p>If the update was not emitted by one of the association members, please contact us.</p>");
                break;
            case "association delete":
                subject = "[French association administration service] " + association.getName() + " has been deleted!";
                html.append("<p>").append(association.getName())
                    .append(" has been deleted!</p>")
                    .append("<p>If you or any member of the association did not perform this operation, please contact us.</p>");
                break;
            default:
                throw new IllegalArgumentException("Unsupported email type: " + emailType);
        }

        mailer.send(Mail.withHtml(notification.getEmail(), subject, html.toString()).setFrom(fromEmail));
    }

    private String capitalizeFirstLetter(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
    
}
