package com.shopai.product.api;

import com.shopai.product.domain.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.*;

public final class CatalogDtos {
    private CatalogDtos() {}
    public record CategoryView(String slug, String name) implements Serializable {
        public static CategoryView from(Category c) { return new CategoryView(c.getSlug(), c.getName()); }
    }
    public record ProductView(UUID id, String name, String brand, String description, BigDecimal price,
        String currency, CategoryView category, boolean featured, List<String> images,
        Map<String, String> specifications) implements Serializable {
        public static ProductView from(Product p) {
            return new ProductView(p.getId(), p.getName(), p.getBrand(), p.getDescription(), p.getPrice(),
                p.getCurrency(), CategoryView.from(p.getCategory()), p.isFeatured(),
                List.copyOf(p.getImages()), Map.copyOf(p.getSpecifications()));
        }
    }
    public record ProductPage(List<ProductView> items, int page, int size, long totalElements, int totalPages) implements Serializable {}
}
