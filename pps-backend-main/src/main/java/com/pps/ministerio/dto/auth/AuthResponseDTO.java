package com.pps.ministerio.dto.auth;

import com.pps.ministerio.dto.UserResponseDTO;

public record AuthResponseDTO(String token,
                              UserResponseDTO user) {
}
