package main.java;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import io.smallrye.reactive.messaging.annotations.Blocking;

@ApplicationScoped
public class NotificationProcessor {

    @Incoming("notifications")
    @Blocking
    public void process(String notification) throws InterruptedException {
        
    }
    
}
