package com.shopai.product.api;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    ProblemDetail status(ResponseStatusException ex) {
        return ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason() == null ? "Request failed" : ex.getReason());
    }
    @ExceptionHandler({ConstraintViolationException.class, MethodArgumentTypeMismatchException.class})
    ProblemDetail validation(Exception ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid catalog query. Check filter values and pagination limits.");
    }
}
