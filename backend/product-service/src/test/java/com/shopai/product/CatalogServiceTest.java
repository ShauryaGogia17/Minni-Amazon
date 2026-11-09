package com.shopai.product;

import com.shopai.product.application.CatalogService;
import com.shopai.product.domain.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class CatalogServiceTest {
    private final ProductRepository products = mock(ProductRepository.class);
    private final CatalogService service = new CatalogService(products, mock(CategoryRepository.class));
    @Test void rejectsReversedPriceRangeBeforeQuerying() {
        assertThatThrownBy(() -> service.search("", "", BigDecimal.TEN, BigDecimal.ONE, false, 0, 12, "newest"))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("minPrice");
        verifyNoInteractions(products);
    }
    @Test void rejectsUnknownSort() {
        assertThatThrownBy(() -> service.search("", "", null, null, false, 0, 12, "sql"))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("Unsupported sort");
        verifyNoInteractions(products);
    }
    @Test void missingProductIsNotFound() {
        UUID id = UUID.randomUUID();
        when(products.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.find(id)).isInstanceOf(ResponseStatusException.class).hasMessageContaining("404");
    }
}
