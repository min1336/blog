package com.blog.controller;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.entity.User;
import com.blog.repository.UserRepository;
import com.blog.service.CommentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@Validated
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    public CommentController(CommentService commentService, UserRepository userRepository) {
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{postSlug}")
    public List<CommentResponse> getComments(
            @PathVariable @Pattern(regexp = "^[a-z0-9][a-z0-9-]*[a-z0-9]$", message = "Invalid post slug") String postSlug) {
        return commentService.getComments(postSlug);
    }

    @PostMapping("/{postSlug}")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable @Pattern(regexp = "^[a-z0-9][a-z0-9-]*[a-z0-9]$") String postSlug,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal OAuth2User principal,
            OAuth2AuthenticationToken authentication) {

        String provider = authentication.getAuthorizedClientRegistrationId();
        User user = userRepository.findByOauthIdAndProvider(principal.getName(), provider)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        CommentResponse response = commentService.createComment(postSlug, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{postSlug}/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String postSlug,
            @PathVariable UUID commentId,
            @AuthenticationPrincipal OAuth2User principal,
            OAuth2AuthenticationToken authentication) {

        String provider = authentication.getAuthorizedClientRegistrationId();
        User user = userRepository.findByOauthIdAndProvider(principal.getName(), provider)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        commentService.deleteComment(commentId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
