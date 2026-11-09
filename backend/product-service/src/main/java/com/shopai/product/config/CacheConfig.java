package com.shopai.product.config;

import org.slf4j.*;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.*;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import java.time.Duration;

@Configuration
public class CacheConfig implements CachingConfigurer {
    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);
    @Bean
    RedisCacheConfiguration redisCacheConfiguration() {
        // Cache contains application-written serializable DTOs only; Redis is private and authenticated.
        return RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(2))
            .prefixCacheNameWith("shopai:catalog:v1:").disableCachingNullValues();
    }
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            private void report(Cache cache) { log.warn("Catalog cache {} unavailable; using PostgreSQL", cache.getName()); }
            public void handleCacheGetError(RuntimeException e, Cache c, Object k) { report(c); }
            public void handleCachePutError(RuntimeException e, Cache c, Object k, Object v) { report(c); }
            public void handleCacheEvictError(RuntimeException e, Cache c, Object k) { report(c); }
            public void handleCacheClearError(RuntimeException e, Cache c) { report(c); }
        };
    }
}
