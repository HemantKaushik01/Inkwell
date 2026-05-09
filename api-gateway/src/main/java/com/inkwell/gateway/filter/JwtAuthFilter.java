package com.inkwell.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;

@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/logout",
            "/api/auth/oauth",       // Google / social OAuth — no JWT needed yet
            "/api/newsletter/subscribe",
            "/api/newsletter/confirm",
            "/api/media/view",
            "/api/media/download"
    );

    private static final List<String> PUBLIC_GET_PREFIXES = List.of(
            "/api/posts",
            "/api/categories",
            "/api/tags",
            "/api/users/authors",
            "/api/comments",
            "/api/analytics"
    );

    // These endpoints accept requests without auth (no X-User-Id required downstream)
    private static final List<String> PUBLIC_WRITE_SUFFIXES = List.of(
            "/views"
    );

    public JwtAuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            String method = exchange.getRequest().getMethod().name();

            // Always allow WebSocket
            if (path.startsWith("/ws/")) {
                return chain.filter(exchange);
            }

            // Determine whether this route requires mandatory authentication
            boolean isOpenEndpoint = OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
            boolean isPublicGet = "GET".equals(method) && PUBLIC_GET_PREFIXES.stream().anyMatch(path::startsWith);
            boolean isPublicWrite = PUBLIC_WRITE_SUFFIXES.stream().anyMatch(path::endsWith);
            boolean requiresAuth = !isOpenEndpoint && !isPublicGet && !isPublicWrite;

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            // Always try to parse the token if present — so X-User-Id is forwarded even on public routes
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                    Claims claims = Jwts.parserBuilder()
                            .setSigningKey(key)
                            .build()
                            .parseClaimsJws(token)
                            .getBody();

                    // Forward user identity headers to downstream services
                    exchange = exchange.mutate()
                            .request(r -> r
                                    .header("X-User-Id", claims.getSubject())
                                    .header("X-User-Email", claims.get("email", String.class) != null ? claims.get("email", String.class) : "")
                                    .header("X-User-Name", claims.get("name", String.class) != null ? claims.get("name", String.class) : "")
                                    .header("X-User-Role", claims.get("role", String.class) != null ? claims.get("role", String.class) : "READER")
                            )
                            .build();
                } catch (Exception e) {
                    // Invalid token on a protected route → reject
                    if (requiresAuth) {
                        return onError(exchange, HttpStatus.UNAUTHORIZED);
                    }
                    // Invalid token on a public route → pass through without user headers
                }
            } else if (requiresAuth) {
                // No token and route requires auth → reject
                return onError(exchange, HttpStatus.UNAUTHORIZED);
            }

            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    public static class Config {}
}
