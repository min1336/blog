package com.blog.controller;

import com.blog.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal OAuth2User principal,
                                 OAuth2AuthenticationToken authentication) {
        if (principal == null || authentication == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        String provider = authentication.getAuthorizedClientRegistrationId();
        String oauthId = principal.getName();

        return userRepository.findByOauthIdAndProvider(oauthId, provider)
            .map(user -> ResponseEntity.ok(Map.of(
                "authenticated", true,
                "id", user.getId().toString(),
                "name", user.getName(),
                "avatar", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
            )))
            .orElse(ResponseEntity.ok(Map.of("authenticated", false)));
    }
}
