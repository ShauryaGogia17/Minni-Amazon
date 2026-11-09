package com.shopai.product.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id private String slug;
    @Column(nullable = false) private String name;
    protected Category() {}
    public String getSlug() { return slug; }
    public String getName() { return name; }
}
