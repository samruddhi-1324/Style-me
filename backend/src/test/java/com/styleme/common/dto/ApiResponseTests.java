package com.styleme.common.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTests {

    @Test
    @DisplayName("ApiResponse.success(data) creates successful response with data")
    void testSuccessWithData() {
        ApiResponse<String> response = ApiResponse.success("test-payload");

        assertTrue(response.isSuccess());
        assertEquals("test-payload", response.getData());
        assertEquals("Operation successful", response.getMessage());
        assertNotNull(response.getTimestamp());
    }

    @Test
    @DisplayName("ApiResponse.success(message, data) creates response with custom message")
    void testSuccessWithMessageAndData() {
        ApiResponse<Integer> response = ApiResponse.success("Item saved", 42);

        assertTrue(response.isSuccess());
        assertEquals(42, response.getData());
        assertEquals("Item saved", response.getMessage());
    }

    @Test
    @DisplayName("ApiResponse.error(message) creates unsuccessful response")
    void testError() {
        ApiResponse<Void> response = ApiResponse.error("Operation failed");

        assertFalse(response.isSuccess());
        assertNull(response.getData());
        assertEquals("Operation failed", response.getMessage());
    }

    @Test
    @DisplayName("PageResponse calculates totalPages and navigation flags correctly")
    void testPageResponseCalculations() {
        List<String> items = List.of("Item 1", "Item 2", "Item 3");
        PageResponse<String> pageResponse = new PageResponse<>(items, 1, 3, 10);

        assertEquals(items, pageResponse.getItems());
        assertEquals(1, pageResponse.getPage());
        assertEquals(3, pageResponse.getPageSize());
        assertEquals(10, pageResponse.getTotalCount());
        assertEquals(4, pageResponse.getTotalPages());
        assertTrue(pageResponse.isHasNext());
        assertFalse(pageResponse.isHasPrevious());

        // Middle page
        PageResponse<String> page2 = new PageResponse<>(items, 2, 3, 10);
        assertTrue(page2.isHasNext());
        assertTrue(page2.isHasPrevious());

        // Last page
        PageResponse<String> page4 = new PageResponse<>(items, 4, 3, 10);
        assertFalse(page4.isHasNext());
        assertTrue(page4.isHasPrevious());
    }
}
