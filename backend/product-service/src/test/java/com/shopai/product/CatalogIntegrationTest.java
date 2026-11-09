package com.shopai.product;

import com.shopai.product.api.CatalogDtos.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.*;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"spring.flyway.locations=classpath:db/migration,classpath:db/dev"})
class CatalogIntegrationTest {
    @Autowired TestRestTemplate http;
    @Autowired StringRedisTemplate redis;
    @Autowired JdbcTemplate jdbc;
    static PostgreSQLContainer<?> postgres;
    static GenericContainer<?> redisContainer;

    @DynamicPropertySource
    static void dependencies(DynamicPropertyRegistry registry) {
        String external = System.getenv("SHOPAI_TEST_DB_URL");
        if (external != null && !external.isBlank()) {
            registry.add("spring.datasource.url", () -> external);
            registry.add("spring.datasource.username", () -> System.getenv("PRODUCT_DB_USER"));
            registry.add("spring.datasource.password", () -> System.getenv("PRODUCT_DB_PASSWORD"));
            registry.add("spring.data.redis.host", () -> "127.0.0.1");
            registry.add("spring.data.redis.port", () -> System.getenv().getOrDefault("REDIS_PORT", "6379"));
            registry.add("spring.data.redis.password", () -> System.getenv("REDIS_PASSWORD"));
            registry.add("spring.data.redis.database", () -> 15);
        } else {
            postgres = new PostgreSQLContainer<>("postgres:17-alpine");
            redisContainer = new GenericContainer<>("redis:7.4-alpine").withExposedPorts(6379);
            postgres.start(); redisContainer.start();
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
            registry.add("spring.data.redis.host", redisContainer::getHost);
            registry.add("spring.data.redis.port", () -> redisContainer.getMappedPort(6379));
            registry.add("spring.data.redis.password", () -> "");
        }
    }

    @Test void paginatesRealPostgresRecords() {
        var result = http.getForObject("/api/v1/products?size=2&sort=name", ProductPage.class);
        assertThat(result.totalElements()).isEqualTo(8);
        assertThat(result.totalPages()).isEqualTo(4);
        assertThat(result.items()).hasSize(2);
        assertThat(result.items().getFirst().name()).isEqualTo("Everyday carry backpack");
    }
    @Test void filtersAndSortsWithoutSqlInterpolation() {
        var result = http.getForObject("/api/v1/products?category=electronics&maxPrice=7000&sort=price-desc", ProductPage.class);
        assertThat(result.items()).extracting(ProductView::name).containsExactly("Instant film camera", "Pocket Bluetooth speaker");
        assertThat(http.getForObject("/api/v1/products?q=headphones", ProductPage.class).items()).hasSize(1);
        assertThat(http.getForObject("/api/v1/products?q=%25", ProductPage.class).items()).isEmpty();
    }
    @Test void returnsDetailsAndCategories() {
        var product = http.getForObject("/api/v1/products/00000000-0000-4000-8000-000000000001", ProductView.class);
        assertThat(product.specifications()).containsEntry("Connectivity", "Bluetooth 5.3");
        assertThat(product.images()).hasSize(1);
        assertThat(http.getForObject("/api/v1/categories", CategoryView[].class)).hasSize(4);
    }
    @Test void invalidQueriesAreBadRequests() {
        for (String query : new String[]{"size=1000", "page=-1", "maxPrice=-1", "minPrice=2000&maxPrice=1", "sort=unsafe", "q=" + "a".repeat(121)})
            assertThat(http.getForEntity("/api/v1/products?" + query, String.class).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
    @Test void missingOrMalformedIdsAreHandled() {
        assertThat(http.getForEntity("/api/v1/products/00000000-0000-4000-8000-000000000099", String.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(http.getForEntity("/api/v1/products/not-a-uuid", String.class).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
    @Test void refusesMutationsAndUnknownEndpoints() {
        assertThat(http.postForEntity("/api/v1/products", "{}", String.class).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(http.getForEntity("/actuator/env", String.class).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
    @Test void cachesWithExpiryAndCanReadCachedRecords() {
        String url = "/api/v1/products/00000000-0000-4000-8000-000000000001";
        var first = http.getForObject(url, ProductView.class);
        var second = http.getForObject(url, ProductView.class);
        assertThat(second).isEqualTo(first);
        var keys = redis.keys("shopai:catalog:v1:product-details::*");
        assertThat(keys).isNotEmpty();
        assertThat(redis.getExpire(keys.iterator().next())).isBetween(1L, 120L);
    }
    @Test void healthAndCorrelationHeaders() {
        var headers = new HttpHeaders(); headers.set("X-Request-ID", "integration-test");
        var response = http.exchange("/actuator/health/readiness", HttpMethod.GET, new HttpEntity<>(headers), String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getFirst("X-Request-ID")).isEqualTo("integration-test");
    }
    @Test void disallowsUntrustedOrigins() {
        var headers = new HttpHeaders(); headers.setOrigin("https://untrusted.example");
        var response = http.exchange("/api/v1/categories", HttpMethod.GET, new HttpEntity<>(headers), String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
    @Test void databaseEnforcesNonNegativePrices() {
        assertThatThrownBy(() -> jdbc.update("UPDATE products SET price = -1 WHERE id = '00000000-0000-4000-8000-000000000001'"))
            .isInstanceOf(DataIntegrityViolationException.class);
    }
}
