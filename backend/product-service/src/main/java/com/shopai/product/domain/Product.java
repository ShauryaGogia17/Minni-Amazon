package com.shopai.product.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "products")
public class Product {
    @Id private UUID id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String brand;
    @Column(nullable = false, length = 3000) private String description;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal price;
    @Column(nullable = false, length = 3) private String currency;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_slug") private Category category;
    @Column(nullable = false) private boolean featured;
    @Column(nullable = false) private Instant createdAt;
    @Column(nullable = false) private Instant updatedAt;
    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "position")
    @Column(name = "url", nullable = false, length = 1000)
    private List<String> images = new ArrayList<>();
    @ElementCollection
    @CollectionTable(name = "product_specifications", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "name")
    @Column(name = "value", nullable = false)
    private Map<String, String> specifications = new TreeMap<>();
    protected Product() {}
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getBrand() { return brand; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getCurrency() { return currency; }
    public Category getCategory() { return category; }
    public boolean isFeatured() { return featured; }
    public List<String> getImages() { return images; }
    public Map<String, String> getSpecifications() { return specifications; }
}
