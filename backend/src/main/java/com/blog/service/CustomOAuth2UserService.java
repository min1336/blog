package com.blog.service;

import com.blog.entity.User;
import com.blog.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User oAuth2User = super.loadUser(request);
        String provider = request.getClientRegistration().getRegistrationId();
        String oauthId = oAuth2User.getName();
        String name = oAuth2User.getAttribute("name");
        String avatar = oAuth2User.getAttribute("avatar_url");

        // Google uses "picture" instead of "avatar_url"
        if (avatar == null) {
            avatar = oAuth2User.getAttribute("picture");
        }

        String finalName = name != null ? name : "User";
        String finalAvatar = avatar;

        userRepository.findByOauthIdAndProvider(oauthId, provider)
            .ifPresentOrElse(
                existingUser -> {
                    // Update name and avatar on each login
                    existingUser.setName(finalName);
                    existingUser.setAvatarUrl(finalAvatar);
                    userRepository.save(existingUser);
                },
                () -> userRepository.save(new User(oauthId, provider, finalName, finalAvatar))
            );

        return oAuth2User;
    }
}
