package com.inkwell.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthLoginRequest {
    @NotBlank
    private String email;
    
    @NotBlank
    private String fullName;
    
    @NotBlank
    private String provider; // GOOGLE or GITHUB
    
    private String avatarUrl;
}
