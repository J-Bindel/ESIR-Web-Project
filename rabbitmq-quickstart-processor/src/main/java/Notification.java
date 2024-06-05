package main.java;

import io.quarkus.runtime.annotations.RegisterForReflection;

import main.java.User;
import main.java.Association;

import java.util.Map;

@RegisterForReflection
public class Notification {

    private String email;
    private User user;
    private Association association;
    private Map<String, Object> modifiedFields;
    private String notificationType;

    public Notification() { }

    public Notification(String email, User user, Association association, Map<String, Object> modifiedFields, String notificationType) {
        this.email = email;
        this.user = user;
        this.association = association;
        this.modifiedFields = modifiedFields;
        this.notificationType = notificationType;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Association getAssociation() {
        return association;
    }

    public void setAssociation(Association association) {
        this.association = association;
    }

    public Map<String, Object> getModifiedFields() {
        return modifiedFields;
    }

    public void setModifiedFields(Map<String, Object> modifiedFields) {
        this.modifiedFields = modifiedFields;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    @Override
    public String toString() {
        return "Notification{" +
                "email='" + email + '\'' +
                ", user=" + user +
                ", association=" + association +
                ", modifiedFields=" + modifiedFields +
                ", notificationType='" + notificationType + '\'' +
                '}';
    }

}