package com.Parkify.Parkify.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ServiceApiResponse<T> success(String message, T data) {
        return new ServiceApiResponse<>(true, message, data);
    }

    public static <T> ServiceApiResponse<T> success(T data) {
        return new ServiceApiResponse<>(true, "Success", data);
    }

    public static <T> ServiceApiResponse<T> error(String message) {
        return new ServiceApiResponse<>(false, message, null);
    }
}
