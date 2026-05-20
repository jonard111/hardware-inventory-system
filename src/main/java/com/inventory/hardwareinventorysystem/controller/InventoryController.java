package com.inventory.hardwareinventorysystem.controller;

import com.inventory.hardwareinventorysystem.model.Hardware;
import com.inventory.hardwareinventorysystem.service.InventoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public Object addHardware(@RequestBody Hardware hardware) {
        try {
            return service.addHardware(hardware);
        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    @GetMapping("/search/{assetId}")
    public Hardware searchHardware(@PathVariable String assetId) {
        return service.searchHardware(assetId);
    }

    @DeleteMapping("/delete/{assetId}")
    public String deleteHardware(@PathVariable String assetId) {
        boolean deleted = service.deleteHardware(assetId);
        return deleted ? "Hardware deleted successfully" : "Hardware not found";
    }

    @GetMapping("/buckets")
    public Object getBuckets() {
        return service.getBuckets();
    }

    @GetMapping("/stats")
    public Object getStats() {
        return new Object() {
            public final int bucketSize = service.getBucketSize();
            public final int itemCount = service.getItemCount();
            public final double loadFactor = service.getLoadFactor();
        };
    }
}