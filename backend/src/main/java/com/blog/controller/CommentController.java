package com.blog.controller;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/{postSlug}")
    public List<CommentResponse> getComments(@PathVariable String postSlug) {
        return commentService.getComments(postSlug);
    }

    // POST and DELETE endpoints will be completed in Phase 5 after Auth is set up
    // They need the authenticated User object from the security context
}
