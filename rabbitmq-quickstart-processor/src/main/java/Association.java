package main.java;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class Association {
    public int id;
    public String userIds;
    public String name;
    public String password;

    public Association() { }

    public Association(int id, String userIds, String name, String password) {
        this.id = id;
        this.userIds = userIds;
        this.name = name;
        this.password = password;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUserIds() {
        return userIds;
    }

    public void setUserIds(String userIds) {
        this.userIds = userIds;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "Association{" +
                "id=" + id +
                ", userIds='" + userIds + '\'' +
                ", name='" + name + '\'' +
                ", password='" + password + '\'' +
                '}';
    }

}
