package com.whitequantex.company.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class InvalidLifecycleException extends RuntimeException {
    public InvalidLifecycleException(String message) {
        super(message);
    }
}
