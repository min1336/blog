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
        return new CommentResponse(
            comment.getId(),
            comment.isDeleted() ? "삭제된 댓글입니다." : comment.getContent(),
            comment.getAuthor().getName(),
            comment.getAuthor().getAvatarUrl(),
            comment.getAuthor().getId(),
            comment.getCreatedAt(),
            comment.isDeleted(),
            replies
        );
    }
}
