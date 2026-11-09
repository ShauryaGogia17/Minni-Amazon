package com.shopai.product.application;

import com.shopai.product.api.CatalogDtos.*;
import com.shopai.product.domain.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class CatalogService {
    private final ProductRepository products;
    private final CategoryRepository categories;
    public CatalogService(ProductRepository products, CategoryRepository categories) {
        this.products = products; this.categories = categories;
    }
    @Cacheable("catalog-pages")
    public ProductPage search(String q, String category, BigDecimal minPrice, BigDecimal maxPrice,
                              boolean featured, int page, int size, String sort) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minPrice must not exceed maxPrice");
        Sort ordering = switch (sort) {
            case "price-asc" -> Sort.by("price").ascending();
            case "price-desc" -> Sort.by("price").descending();
            case "name" -> Sort.by("name").ascending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort");
        };
        var result = products.findAll((root, query, cb) -> {
            List<Predicate> clauses = new ArrayList<>();
            if (!q.isBlank()) {
                String escaped = q.toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
                String like = "%" + escaped + "%";
                clauses.add(cb.or(cb.like(cb.lower(root.get("name")), like, '\\'), cb.like(cb.lower(root.get("brand")), like, '\\')));
            }
            if (!category.isBlank()) clauses.add(cb.equal(root.get("category").get("slug"), category));
            if (minPrice != null) clauses.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            if (maxPrice != null) clauses.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            if (featured) clauses.add(cb.isTrue(root.get("featured")));
            return cb.and(clauses.toArray(Predicate[]::new));
        }, PageRequest.of(page, size, ordering.and(Sort.by("id"))));
        return new ProductPage(result.getContent().stream().map(ProductView::from).toList(),
            result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }
    @Cacheable("product-details")
    public ProductView find(UUID id) {
        return products.findById(id).map(ProductView::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }
    @Cacheable("categories")
    public List<CategoryView> categories() {
        return categories.findAll(Sort.by("name")).stream().map(CategoryView::from).toList();
    }
}
