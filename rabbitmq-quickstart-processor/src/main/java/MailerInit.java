import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import io.quarkus.runtime.StartupEvent;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.event.Observes;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

import main.java.Association;
import main.java.Notification;
import main.java.User;

@ApplicationScoped
public class MailerInit {

    private static final Logger LOGGER = Logger.getLogger(MailerInit.class);

    @Inject
    ObjectMapper objectMapper; // Injecting the Jackson ObjectMapper

    @Inject
    Mailer mailer;

    void onStart(@Observes StartupEvent ev) {
        LOGGER.info("The init application is starting...");
    }

    @PostConstruct
    public void testMailer() {
        try {
            String subject = "Init Email";
            String body = "This is an init email";
            String recipient = "init@example.com";
            
            mailer.send(Mail.withHtml(recipient, subject, body));

        } catch (Exception e) {
            LOGGER.error("Error sending test email", e);
        }
    }

}