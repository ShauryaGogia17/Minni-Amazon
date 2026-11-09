package com.shopai.product.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.UUID;

@Component
public class CorrelationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        String id = req.getHeader("X-Request-ID");
        if (id == null || !id.matches("[A-Za-z0-9_-]{1,64}")) id = UUID.randomUUID().toString();
        res.setHeader("X-Request-ID", id);
        try (var ignored = MDC.putCloseable("requestId", id)) { chain.doFilter(req, res); }
    }
}
