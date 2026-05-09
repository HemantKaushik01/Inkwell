package com.inkwell.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthLoginRequest {
    @NotBlank
    private String idToken; // Google ID Token sent by the frontend after popup
}
