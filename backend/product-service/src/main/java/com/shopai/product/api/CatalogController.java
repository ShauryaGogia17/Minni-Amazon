package com.shopai.product.api;

import com.shopai.product.api.CatalogDtos.*;
import com.shopai.product.application.CatalogService;
import jakarta.validation.constraints.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@Validated
public class CatalogController {
    private final CatalogService catalog;
    public CatalogController(CatalogService catalog) { this.catalog = catalog; }
    @GetMapping("/products")
    public ProductPage products(
        @RequestParam(defaultValue = "") @Size(max = 120) String q,
        @RequestParam(defaultValue = "") @Size(max = 80) String category,
        @RequestParam(required = false) @DecimalMin("0") @DecimalMax("9999999999.99") BigDecimal minPrice,
        @RequestParam(required = false) @DecimalMin("0") @DecimalMax("9999999999.99") BigDecimal maxPrice,
        @RequestParam(defaultValue = "false") boolean featured,
        @RequestParam(defaultValue = "0") @Min(0) @Max(10000) int page,
        @RequestParam(defaultValue = "12") @Min(1) @Max(48) int size,
        @RequestParam(defaultValue = "newest") @Pattern(regexp = "newest|price-asc|price-desc|name") String sort) {
        return catalog.search(q.strip(), category.strip(), minPrice, maxPrice, featured, page, size, sort);
    }
    @GetMapping("/products/{id}")
    public ProductView product(@PathVariable UUID id) { return catalog.find(id); }
    @GetMapping("/categories")
    public List<CategoryView> categories() { return catalog.categories(); }
}
