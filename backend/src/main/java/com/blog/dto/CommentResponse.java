package com.blog.dto;

import com.blog.entity.Comment;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CommentResponse(
    UUID id,
    String content,
    String authorName,
    String authorAvatar,
    UUID authorId,
    Instant createdAt,
    boolean deleted,
    List<CommentResponse> replies
) {
    public static CommentResponse from(Comment comment, List<CommentResponse> replies) {
        boolean deleted = comment.isDeleted();
        return new CommentResponse(
            comment.getId(),
            deleted ? "삭제된 댓글입니다." : comment.getContent(),
            deleted ? "익명" : comment.getAuthor().getName(),
            deleted ? null : comment.getAuthor().getAvatarUrl(),
            deleted ? null : comment.getAuthor().getId(),
            comment.getCreatedAt(),
            deleted,
            replies
        );
    }
}
