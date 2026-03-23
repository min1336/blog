package com.blog.service;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.entity.Comment;
import com.blog.entity.User;
import com.blog.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public List<CommentResponse> getComments(String postSlug) {
        List<Comment> topLevel = commentRepository
            .findByPostSlugAndParentIsNullAndDeletedAtIsNullOrderByCreatedAtDesc(postSlug);
        return topLevel.stream()
            .map(comment -> {
                List<Comment> replies = commentRepository
                    .findByParentIdOrderByCreatedAtAsc(comment.getId());
                List<CommentResponse> replyDtos = replies.stream()
                    .map(r -> CommentResponse.from(r, List.of()))
                    .toList();
                return CommentResponse.from(comment, replyDtos);
            })
            .toList();
    }

    @Transactional
    public CommentResponse createComment(String postSlug, CommentRequest request, User author) {
        Comment parent = null;
        if (request.parentId() != null) {
            parent = commentRepository.findById(request.parentId())
                .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
            if (parent.getParent() != null) {
                throw new IllegalArgumentException("Reply depth limited to 1 level");
            }
        }
        Comment comment = new Comment(postSlug, author, request.content(), parent);
        commentRepository.save(comment);
        return CommentResponse.from(comment, List.of());
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new SecurityException("Not authorized to delete this comment");
        }
        comment.softDelete();
    }
}
