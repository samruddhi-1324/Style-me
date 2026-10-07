package com.styleme.inventory.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.inventory.dto.*;
import com.styleme.inventory.entity.Inventory;
import com.styleme.inventory.entity.InventoryMovement;
import com.styleme.inventory.entity.MovementType;
import com.styleme.inventory.repository.InventoryMovementRepository;
import com.styleme.inventory.repository.InventoryRepository;
import com.styleme.category.entity.Category;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import com.styleme.product.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InventoryServiceTests {

    private InventoryRepository inventoryRepository;
    private InventoryMovementRepository movementRepository;
    private ProductRepository productRepository;
    private ProductVariantRepository variantRepository;
    private InventoryService inventoryService;

    private Product sampleProduct;
    private Inventory sampleInventory;

    @BeforeEach
    void setUp() {
        inventoryRepository = Mockito.mock(InventoryRepository.class);
        movementRepository = Mockito.mock(InventoryMovementRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        variantRepository = Mockito.mock(ProductVariantRepository.class);
        inventoryService = new InventoryService(inventoryRepository, movementRepository, productRepository, variantRepository);

        Category cat = new Category("Eyeglasses", "eyeglasses", "Optical frames", 1);
        sampleProduct = new Product("frame-001", "SKU-001", "Willow Tortoise", cat, new BigDecimal("3299.00"));

        sampleInventory = new Inventory(sampleProduct, null, "SKU-001", 10);
        sampleInventory.setReserved(2);
    }

    // -------------------------------------------------------------------------
    // Reserve
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("reserve: succeeds when sufficient available stock")
    void testReserveSuccess() {
        when(inventoryRepository.findBySkuForUpdate("SKU-001")).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));
        when(movementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> i.getArgument(0));

        InventoryResponse response = inventoryService.reserve("SKU-001", 3, "order-1", "ORDER");

        assertNotNull(response);
        assertEquals(5, response.getReserved()); // was 2, +3
        assertEquals(5, response.getAvailable()); // 10 - 5
    }

    @Test
    @DisplayName("reserve: throws BadRequestException when insufficient stock (oversell prevention)")
    void testReserveInsufficientStock() {
        // available = 10 - 2 = 8; request 9 → should fail
        when(inventoryRepository.findBySkuForUpdate("SKU-001")).thenReturn(Optional.of(sampleInventory));

        assertThrows(BadRequestException.class, () ->
                inventoryService.reserve("SKU-001", 9, "order-1", "ORDER"));
    }

    @Test
    @DisplayName("reserve: throws ResourceNotFoundException for unknown SKU")
    void testReserveSkuNotFound() {
        when(inventoryRepository.findBySkuForUpdate("UNKNOWN")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                inventoryService.reserve("UNKNOWN", 1, null, null));
    }

    @Test
    @DisplayName("reserve: rejects zero or negative quantity")
    void testReserveZeroQtyRejected() {
        assertThrows(BadRequestException.class, () ->
                inventoryService.reserve("SKU-001", 0, null, null));
    }

    // -------------------------------------------------------------------------
    // Release
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("release: reduces reserved count correctly")
    void testReleaseSuccess() {
        when(inventoryRepository.findBySkuForUpdate("SKU-001")).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));
        when(movementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> i.getArgument(0));

        InventoryResponse response = inventoryService.release("SKU-001", 1, "order-1", "ORDER");

        assertEquals(1, response.getReserved()); // was 2, -1
    }

    @Test
    @DisplayName("release: throws BadRequestException when release > reserved")
    void testReleaseExceedsReserved() {
        when(inventoryRepository.findBySkuForUpdate("SKU-001")).thenReturn(Optional.of(sampleInventory));

        // reserved=2, try to release 5 → fail
        assertThrows(BadRequestException.class, () ->
                inventoryService.release("SKU-001", 5, null, null));
    }

    // -------------------------------------------------------------------------
    // Deduct
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("deduct: reduces both quantity and reserved on confirmed purchase")
    void testDeductSuccess() {
        when(inventoryRepository.findBySkuForUpdate("SKU-001")).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));
        when(movementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> i.getArgument(0));

        InventoryResponse response = inventoryService.deduct("SKU-001", 2, "order-1", "ORDER");

        assertEquals(8, response.getQuantity()); // 10 - 2
        assertEquals(0, response.getReserved()); // 2 - 2
        assertEquals(8, response.getAvailable());
    }

    @Test
    @DisplayName("deduct: throws BadRequestException when deduct > reserved")
    void testDeductMoreThanReserved() {
        when(inventoryRepository.findBySkuForUpdate("SKU-001")).thenReturn(Optional.of(sampleInventory));

        // reserved=2, try to deduct 5
        assertThrows(BadRequestException.class, () ->
                inventoryService.deduct("SKU-001", 5, "order-1", "ORDER"));
    }

    // -------------------------------------------------------------------------
    // Restock
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("restock: adds quantity to existing stock")
    void testRestockSuccess() {
        when(inventoryRepository.findBySkuForUpdate("SKU-001")).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));
        when(movementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> i.getArgument(0));

        InventoryResponse response = inventoryService.restock("SKU-001", 20, "PO-001", "New shipment");

        assertEquals(30, response.getQuantity()); // 10 + 20
    }

    // -------------------------------------------------------------------------
    // Adjust
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("adjust DAMAGED: reduces stock, creates audit movement")
    void testAdjustDamagedReducesStock() {
        when(inventoryRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        ArgumentCaptor<InventoryMovement> movementCaptor = ArgumentCaptor.forClass(InventoryMovement.class);
        when(movementRepository.save(movementCaptor.capture())).thenAnswer(i -> i.getArgument(0));

        StockAdjustmentRequest req = new StockAdjustmentRequest();
        req.setMovementType(MovementType.DAMAGED);
        req.setQuantity(3);
        req.setNote("Broken in transit");

        InventoryResponse response = inventoryService.adjust(1L, req);

        assertEquals(7, response.getQuantity()); // 10 - 3
        assertEquals(MovementType.DAMAGED, movementCaptor.getValue().getMovementType());
        assertEquals(-3, movementCaptor.getValue().getQuantityDelta());
    }

    @Test
    @DisplayName("adjust: throws BadRequestException if adjustment would cause negative stock")
    void testAdjustNegativeStockRejected() {
        when(inventoryRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(sampleInventory));

        StockAdjustmentRequest req = new StockAdjustmentRequest();
        req.setMovementType(MovementType.DAMAGED);
        req.setQuantity(15); // would result in 10-15 = -5

        assertThrows(BadRequestException.class, () -> inventoryService.adjust(1L, req));
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("createInventory: throws ConflictException on duplicate SKU")
    void testCreateDuplicateSku() {
        when(inventoryRepository.findBySku("SKU-001")).thenReturn(Optional.of(sampleInventory));

        CreateInventoryRequest req = new CreateInventoryRequest();
        req.setSku("SKU-001");
        req.setProductId("frame-001");
        req.setQuantity(10);

        assertThrows(ConflictException.class, () -> inventoryService.createInventory(req));
    }

    // -------------------------------------------------------------------------
    // Derived availability
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("available stock = quantity - reserved (never negative)")
    void testAvailableCalculation() {
        assertEquals(8, sampleInventory.getAvailable()); // 10 - 2
        assertTrue(sampleInventory.isInStock());
        assertFalse(sampleInventory.isOutOfStock());
    }

    @Test
    @DisplayName("low stock flag triggers when available <= threshold")
    void testLowStockFlag() {
        sampleInventory.setLowStockThreshold(10);
        sampleInventory.setReserved(5); // available = 5 <= 10 → low stock
        assertTrue(sampleInventory.isLowStock());
    }

    @Test
    @DisplayName("out of stock when available = 0")
    void testOutOfStock() {
        sampleInventory.setQuantity(5);
        sampleInventory.setReserved(5); // available = 0
        assertTrue(sampleInventory.isOutOfStock());
        assertFalse(sampleInventory.isInStock());
    }
}
