package com.blog.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String oauthId;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 512)
    private String avatarUrl;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected User() {}

    public User(String oauthId, String provider, String name, String avatarUrl) {
        this.oauthId = oauthId;
        this.provider = provider;
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getOauthId() { return oauthId; }
    public String getProvider() { return provider; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Instant getCreatedAt() { return createdAt; }
}
