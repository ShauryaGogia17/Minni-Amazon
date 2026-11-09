CREATE TABLE categories (
    slug VARCHAR(80) PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE
);
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(120) NOT NULL,
    description VARCHAR(3000) NOT NULL,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
    category_slug VARCHAR(80) NOT NULL REFERENCES categories(slug),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX products_category_price_idx ON products(category_slug, price, id);
CREATE INDEX products_created_idx ON products(created_at DESC, id);
CREATE INDEX products_price_idx ON products(price, id);
CREATE TABLE product_images (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    url VARCHAR(1000) NOT NULL,
    PRIMARY KEY(product_id, position)
);
CREATE TABLE product_specifications (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    PRIMARY KEY(product_id, name)
);
